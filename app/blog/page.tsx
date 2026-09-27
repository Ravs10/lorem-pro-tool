import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default async function BlogPage() {
  const { data: blogs } = await supabase.from('blogs').select('*').order('created_at', { ascending: false })

  return (
    <div className="max-w-3xl mx-auto p-6 bg-[#fffaf0] min-h-screen">

      {/* TOP BUTTON - Blog Heading ke upar */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-black">Blog</h1>
        <Link href="/" className="px-5 py-2.5 rounded-full bg-orange-500 text-black font-black text-sm hover:bg-black hover:text-white transition-all shadow">
          🏠 Home
        </Link>
      </div>

      <div className="grid gap-6">
        {blogs?.map((blog) => (
          <Link key={blog.slug} href={`/blog/${blog.slug}`} className="block bg-[#fff7e6] p-6 rounded-[24px] border hover:shadow-lg transition">
            <h2 className="text-2xl font-bold">{blog.title}</h2>
            <p className="text-orange-500 text-sm mt-2 font-bold">
              {new Date(blog.created_at).toLocaleDateString()} | By Ravish
            </p>
            <p className="text-gray-600 mt-3 line-clamp-3">{blog.content?.slice(0, 150)}...</p>
          </Link>
        ))}
      </div>

      {/* BOTTOM BUTTONS */}
      <div className="flex flex-wrap gap-3 mt-10 border-t pt-8 justify-center">
        <Link href="/" className="px-8 py-3 rounded-full bg-zinc-900 text-white font-bold hover:bg-black transition">
          ← Go to Home
        </Link>
        <Link href="/" className="px-8 py-3 rounded-full bg-orange-500 text-black font-black hover:scale-105 transition shadow-[0_0_20px_rgba(249,115,22,0.4)]">
          🏠 Home Page
        </Link>
      </div>

    </div>
  )
}
