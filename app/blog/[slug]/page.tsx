import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

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
      
      {/* TOP BUTTON */}
      <div className="mb-6">
        <Link href="/blog" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black text-white text-sm font-bold hover:bg-orange-500 hover:text-black transition">
          ← Back to Blog
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-4 leading-tight">{blog.title}</h1>
      <p className="text-gray-500 mb-6">{new Date(blog.created_at).toLocaleDateString()} | By Ravish</p>
      
      {/* YAHI FIX HAI - HTML sahi dikhega */}
      <div 
        className="prose max-w-none leading-relaxed prose-p:my-3 prose-b:text-black prose-strong:text-black"
        dangerouslySetInnerHTML={{ __html: blog.content }}
      />

      {/* BOTTOM BUTTONS */}
      <div className="flex flex-wrap gap-3 mt-10 border-t pt-6">
        <Link href="/blog" className="px-6 py-3 rounded-full bg-zinc-900 text-white font-bold">← Go Back</Link>
        <Link href="/" className="px-6 py-3 rounded-full bg-orange-500 text-black font-black">🏠 Home</Link>
        <Link href="/blog" className="px-6 py-3 rounded-full border-2 border-orange-500 text-orange-500 font-bold">📝 All Blogs →</Link>
      </div>

    </div>
  )
}
