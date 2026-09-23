import { createClient } from '@supabase/supabase-js'
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
export default async function BlogDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { data: blog } = await supabase.from('blogs').select('*').eq('slug', slug).single()
  if (!blog) return <div className="p-10 text-center"><h1>Blog not found: {slug}</h1><a href="/blog" className="text-blue-600">Back</a></div>
  return (
    <div className="max-w-3xl mx-auto p-6">
      <a href="/blog" className="text-sm text-gray-500 mb-4 block">← Back</a>
      <h1 className="text-3xl font-bold mb-4">{blog.title}</h1>
      <p className="text-gray-500 mb-6">{new Date(blog.created_at).toLocaleDateString()}</p>
      <div className="prose max-w-none leading-7" dangerouslySetInnerHTML={{ __html: blog.content }} />
    </div>
  )
}
