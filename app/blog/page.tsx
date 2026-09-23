import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function BlogPage() {
  const { data: blogs } = await supabase
    .from('blogs')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Blog</h1>
      <div className="grid gap-6">
        {blogs?.map((blog: any) => (
          <a key={blog.id} href={`/blog/${blog.slug}`} className="border p-4 rounded-lg hover:shadow-lg">
            <h2 className="text-xl font-semibold">{blog.title}</h2>
            <p className="text-gray-600 mt-2 line-clamp-2">{blog.excerpt || blog.content?.replace(/<[^>]*>/g, '').slice(0,150)}</p>
          </a>
        ))}
      </div>
      {(!blogs || blogs.length===0) && <p>No blogs found. Admin se add karo!</p>}
    </div>
  )
}
