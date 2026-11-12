import Comments from "./Comments"
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function renderContent(text: string) {
  if (!text) return ""

  // 1. Agar content me pehle se HTML hai - <p>, <h2>, <b> etc - to usko aise hi dikhao, chhedo mat
  const isHtml = /<(p|h1|h2|h3|b|strong|a|ul|li|div)[\s>]/.test(text)
  if (isHtml) {
    return text
  }

  // 2. Warna Markdown hai - usko HTML me badlo
  let html = text
  html = html.replace(/^### (.*)$/gm, '<h3 class="text-xl font-bold mt-6 mb-2">$1</h3>')
  html = html.replace(/^## (.*)$/gm, '<h2 class="text-2xl font-bold mt-6 mb-2">$1</h2>')
  html = html.replace(/^# (.*)$/gm, '<h1 class="text-3xl font-bold mt-6 mb-2">$1</h1>')
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>')
  html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g, '<a href="$2" target="_blank" class="text-orange-600 underline font-bold">$1</a>')
  // Plain link - lekin jo pehle se <a> me hai usko dobara mat chhedo, isliye yaha pehle se link wale ko skip karte hai
  html = html.replace(/(?<!href="|">)(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" class="text-orange-600 underline break-all">$1</a>')
  html = html.replace(/^- (.*)$/gm, '<li class="ml-5 list-disc">$1</li>')

  html = html.split(/\n\s*\n/).map(p => {
    if (p.trim().startsWith('<h') || p.trim().startsWith('<li')) return p
    return `<p class="my-3 leading-relaxed">${p.replace(/\n/g, '<br/>')}</p>`
  }).join('')

  return html
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

  return (
    <div className="max-w-3xl mx-auto p-6 bg-[#fffaf0] min-h-screen">
      <div className="mb-6">
        <Link href="/blog" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black text-white text-sm font-bold hover:bg-orange-500 hover:text-black transition">
          ← Back to Blog
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-4 leading-tight">{blog.title}</h1>
      <p className="text-gray-500 mb-6">{new Date(blog.created_at).toLocaleDateString()} | By Ravish</p>
      
      <div 
        className="prose max-w-none leading-relaxed prose-p:my-3 prose-a:text-orange-600 prose-a:underline prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-6 prose-strong:text-black"
        dangerouslySetInnerHTML={{ __html: renderContent(blog.content) }}
      />

      <Comments slug={slug} />

      <div className="flex flex-wrap gap-3 mt-10 border-t pt-6">
        <Link href="/blog" className="px-6 py-3 rounded-full bg-zinc-900 text-white font-bold">← Go Back</Link>
        <Link href="/" className="px-6 py-3 rounded-full bg-orange-500 text-black font-black">🏠 Home</Link>
        <Link href="/blog" className="px-6 py-3 rounded-full border-2 border-orange-500 text-orange-500 font-bold">📝 All Blogs →</Link>
      </div>
    </div>
  )
}
