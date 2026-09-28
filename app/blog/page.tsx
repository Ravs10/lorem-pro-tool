import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

export const revalidate = 0
export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Ye function ##, **, <p> sab hata dega
function cleanExcerpt(text: string) {
  if (!text) return ""
  return text
   .replace(/<[^>]*>?/gm, "") // <p> tags
   .replace(/#{1,3}\s/g, "") // ## ###
   .replace(/\*\*/g, "") // ** bold
   .replace(/-\s/g, "") // - list
   .trim()
   .slice(0, 150) + "..."
}

export default async function BlogPage() {
  const { data: blogs } = await supabase
   .from('blogs')
   .select('*')
   .order('created_at', { ascending: false })

  return (
    <div className="max-w-3xl mx-auto p-6 bg-[#fffaf0] min-h-screen">
      {/* TOP BUTTON */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-black">Blog</h1>
        <Link
          href="/"
          className="px-5 py-2.5 rounded-full bg-orange-500 text-white font-bold"
        >
          🏠 Home
        </Link>
      </div>

      <div className="grid gap-6">
        {blogs?.map((blog: any) => (
          <Link
            key={blog.slug}
            href={`/blog/${blog.slug}`}
            className="block bg-[#fff7e6] p-6 rounded-[24px] border border-orange-100 shadow-sm hover:shadow-md transition"
          >
            <h2 className="text-2xl font-bold text-gray-900 leading-tight">
              {blog.title}
            </h2>
            <p className="text-orange-500 text-sm font-bold mt-2">
              {new Date(blog.created_at).toLocaleDateString()} | By Ravish
            </p>
            <p className="text-gray-600 mt-3 leading-relaxed">
              {cleanExcerpt(blog.content)}
            </p>
          </Link>
        ))}
      </div>

      {/* BOTTOM BUTTONS */}
      <div className="flex flex-wrap gap-3 mt-8">
        <Link href="/" className="px-8 py-3 rounded-full bg-black text-white font-bold">
          ← Go to Home
        </Link>
        <Link href="/" className="px-8 py-3 rounded-full bg-orange-500 text-white font-bold">
          🏠 Home Page
        </Link>
      </div>
    </div>
  )
}
