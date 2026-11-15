import Comments from "./Comments"
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import ShareButtons from "./ShareButtons"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { data: blog } = await supabase.from('blogs').select('*').eq('slug', params.slug).single()
  if (!blog) return { title: 'Blog Not Found | Lorem Pro Tool' }
  const title = blog.seo_title || blog.title
  const desc = blog.seo_description || blog.excerpt || blog.content?.replace(/<[^>]*>/g, '').slice(0, 155)
  const tags = (blog.tags || '').split(',').map((t: string) => t.trim()).filter(Boolean)
  return {
    title: title + ' | Lorem Pro Tool',
    description: desc,
    keywords: tags,
    openGraph: { title, description: desc, images: blog.cover_image ? [blog.cover_image] : [], type: 'article' },
    twitter: { card: 'summary_large_image', title, description: desc, images: blog.cover_image ? [blog.cover_image] : [] },
  }
}

function renderContent(text: string) {
  if (!text) return ""
  const isHtml = /<(p|h1|h2|h3|b|strong|a|ul|li|div)[\s>]/.test(text)
  if (isHtml) return text
  let html = text
  html = html.replace(/^### (.*)$/gm, '<h3 class="text-xl font-bold mt-6 mb-2">$1</h3>')
  html = html.replace(/^## (.*)$/gm, '<h2 class="text-2xl font-bold mt-6 mb-2">$1</h2>')
  html = html.replace(/^# (.*)$/gm, '<h1 class="text-3xl font-bold mt-6 mb-2">$1</h1>')
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>')
  html = html.replace(/\[(https?:\/\/[^\]]+)\]\(https?:\/?\/?\)/g, '<a href="$1" target="_blank" class="text-orange-600 underline font-bold break-all">$1</a>')
  html = html.replace(/\[([^\]]+)\]\(https?:\/?\/?\)/g, '$1')
  html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g, '<a href="$2" target="_blank" class="text-orange-600 underline font-bold">$1</a>')
  html = html.replace(/(?<!href="|">)(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" class="text-orange-600 underline break-all">$1</a>')
  html = html.replace(/^- (.*)$/gm, '<li class="ml-5 list-disc">$1</li>')
  html = html.split(/\n\s*\n/).map(p => {
    if (p.trim().startsWith('<h') || p.trim().startsWith('<li')) return p
    return `<p class="my-3 leading-relaxed">${p.replace(/\n/g, '<br/>')}</p>`
  }).join('')
  return html
}

function getTOC(text: string) {
  if (!text) return []
  const lines = text.split('\n')
  const items: any[] = []
  lines.forEach((line) => {
    const t = line.trim()
    if (t.startsWith('## ')) items.push(t.replace('## ', ''))
    else if (t.startsWith('# ')) items.push(t.replace('# ', ''))
    else if (t.startsWith('**') && t.endsWith('**') && t.length < 80) items.push(t.replaceAll('**', ''))
  })
  return items.slice(0, 8)
}

export default async function Page({ params }: { params: { slug: string } }) {
  const slug = params.slug
  const { data: blog } = await supabase.from('blogs').select('*').eq('slug', slug).single()
  if (!blog) {
    return (
      <div className="max-w-3xl mx-auto p-10 text-center">
        <h1 className="text-2xl font-bold">Blog Not Found</h1>
        <Link href="/blog" className="text-orange-500 mt-4 inline-block">← Back to Blog</Link>
      </div>
    )
  }
  const { data: related } = await supabase.from('blogs').select('*').eq('is_deleted', false).in('status', ['published', 'approved']).neq('slug', slug).eq('category', blog.category || 'General').order('created_at', { ascending: false }).limit(3)
  let relatedFinal = related || []
  if (relatedFinal.length === 0) {
    const { data: rel2 } = await supabase.from('blogs').select('*').eq('is_deleted', false).in('status', ['published', 'approved']).neq('slug', slug).order('created_at', { ascending: false }).limit(3)
    relatedFinal = rel2 || []
  }
  const toc = getTOC(blog.content || '')
  const readTime = Math.max(1, Math.ceil((blog.content?.length || 500) / 1000))
  const isGuest = blog.author_name && blog.author_name !== 'Admin'
  const tags = (blog.tags || '').split(',').map((t: string) => t.trim()).filter(Boolean)
  const authorWebsite = blog.author_website || blog.website || ""

  return (
    <div className="min-h-screen bg-[#fffaf0]">
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <div className="mb-6">
          <Link href="/blog" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black text-white text-sm font-bold hover:bg-orange-500 hover:text-black transition">← Back to Blog</Link>
        </div>
        <div className="grid lg:grid-cols-[1fr_300px] gap-8 items-start">
          <div>
            <span className="text-xs bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-bold">{blog.category || 'General'}</span>
            <h1 className="text-3xl md:text-[40px] leading-[1.2] font-extrabold mt-3">{blog.title}</h1>
            {blog.excerpt && <p className="text-lg text-gray-600 mt-2">{blog.excerpt}</p>}
            <div className="flex flex-wrap items-center justify-between gap-3 border-y py-4 mt-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-black text-white flex items-center justify-center font-bold text-lg">{(blog.author_name || 'A')[0].toUpperCase()}</div>
                <div>
                  <p className="font-bold text-sm">By {blog.author_name || 'Admin'} {isGuest && <span className="text-[11px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full ml-1">Guest Author</span>}</p>
                  <p className="text-xs text-gray-500">{new Date(blog.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} • {readTime} min read</p>
                </div>
              </div>
              <ShareButtons title={blog.title} />
            </div>
            {blog.cover_image && <img src={blog.cover_image} className="w-full rounded-2xl mt-6 max-h-[420px] object-cover" />}
            {toc.length > 0 && (
              <details className="lg:hidden bg-white border rounded-2xl p-4 mt-6">
                <summary className="font-bold cursor-pointer">📑 What Is In This Blog?</summary>
                <ul className="mt-3 space-y-2">{toc.map((t, i) => <li key={i}><span className="text-sm text-orange-700">• {t}</span></li>)}</ul>
              </details>
            )}
            <div className="prose max-w-none leading-relaxed prose-p:my-3 prose-a:text-orange-600 prose-a:underline prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-6 prose-strong:text-black mt-4" dangerouslySetInnerHTML={{ __html: renderContent(blog.content) }} />

            {tags.length > 0 && (
              <div className="flex gap-2 flex-wrap mt-8">
                <span className="text-sm font-bold">🏷️ Tags:</span>
                {tags.map((t: string) => (
                  <Link key={t} href={`/blog?tag=${encodeURIComponent(t)}`} className="text-xs bg-white border px-3 py-1.5 rounded-full hover:bg-orange-100 hover:border-orange-300">#{t}</Link>
                ))}
              </div>
            )}

            {blog.author_name && (
              <div className="bg-white border rounded-2xl p-5 mt-8 flex gap-4 items-start">
                <div className="w-16 h-16 bg-orange-500 text-white rounded-full flex items-center justify-center text-2xl font-bold shrink-0">
                  {(blog.author_name || 'A').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400 tracking-wide">WRITTEN BY</p>
                  <p className="font-bold text-lg">{blog.author_name} {isGuest ? '(Community Writer)' : '(Founder)'}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {blog.author_bio || (isGuest ? 'This blog was written by our community writer. You can also write!' : 'Created 26+ Free Tools on Lorem Pro Tool.')}
                  </p>
                  {authorWebsite ? (
                    <>
                      <a href={authorWebsite} target="_blank" rel={blog.is_dofollow ? "" : "ugc nofollow"} className="inline-block mt-3 bg-black text-white text-sm px-4 py-2 rounded-full font-bold">🌐 Visit My Website →</a>
                      <p className="text-[11px] font-bold mt-2">
                        {blog.is_dofollow ? "✅ Link Status: DoFollow - Vote Given by Lorem Pro Tool" : "🔒 Link Status: UGC - Admin Review ke baad DoFollow milega"}
                      </p>
                    </>
                  ) : (
                    <Link href="/write-blog" className="inline-block mt-3 bg-black text-white text-sm px-4 py-2 rounded-full">✍️ Write Yours Too</Link>
                  )}
                </div>
              </div>
            )}

            <Comments slug={slug} />
            <div className="flex flex-wrap gap-3 mt-10 border-t pt-6">
              <Link href="/blog" className="px-6 py-3 rounded-full bg-zinc-900 text-white font-bold">← Go Back</Link>
              <Link href="/" className="px-6 py-3 rounded-full bg-orange-500 text-black font-black">🏠 Home</Link>
              <Link href="/blog" className="px-6 py-3 rounded-full border-2 border-orange-500 text-orange-500 font-bold">📝 All Blogs →</Link>
            </div>
          </div>
          <aside className="space-y-6">
            {toc.length > 0 && (
              <div className="hidden lg:block sticky top-6 bg-white border rounded-2xl p-5">
                <p className="font-bold">📑 Table of Contents</p>
                <ul className="mt-3 space-y-2.5">{toc.map((t, i) => <li key={i} className="text-sm text-gray-700">• {t}</li>)}</ul>
                <p className="text-xs text-gray-500 mt-4 pt-4 border-t">{readTime} min read</p>
              </div>
            )}
            <div className="bg-white border rounded-2xl p-5">
              <p className="font-bold text-lg">📚 Also Read</p>
              <div className="grid gap-4 mt-4">
                {relatedFinal.map((r: any) => (
                  <Link key={r.id} href={`/blog/${r.slug}`} className="flex gap-3 group">
                    {r.cover_image ? <img src={r.cover_image} className="w-[70px] h-[55px] object-cover rounded-lg shrink-0" /> : <div className="w-[70px] h-[55px] bg-orange-50 rounded-lg flex items-center justify-center text-2xl shrink-0">📝</div>}
                    <div>
                      <p className="text-sm font-bold leading-snug group-hover:text-orange-600 line-clamp-2">{r.title}</p>
                      <p className="text-[11px] text-gray-500 mt-1">By {r.author_name || 'Admin'} • {r.category || 'General'}</p>
                    </div>
                  </Link>
                ))}
                {relatedFinal.length === 0 && <p className="text-sm text-gray-500">No related blogs yet.</p>}
              </div>
              <Link href="/blog" className="block text-center text-sm font-bold text-orange-600 mt-5">View All Blogs →</Link>
            </div>
            <div className="bg-black text-white rounded-2xl p-5 text-center">
              <p className="text-2xl">🛠️</p><p className="font-bold mt-1">Try 26+ Free Tools!</p>
              <Link href="/" className="inline-block bg-orange-500 text-white px-5 py-2.5 rounded-full text-sm font-bold mt-3">Explore Tools →</Link>
            </div>
            <Link href="/write-for-us" className="block bg-orange-500 text-white rounded-2xl p-5 text-center">
              <p className="font-bold">✍️ Write For Us</p>
              <p className="text-xs mt-1">Get 1 FREE DoFollow Backlink + Author Bio</p>
              <p className="inline-block bg-black text-white px-5 py-2.5 rounded-full text-sm font-bold mt-3">Submit Blog →</p>
            </Link>
          </aside>
        </div>
      </div>
    </div>
  )
}
