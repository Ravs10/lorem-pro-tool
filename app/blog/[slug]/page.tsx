import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: blog } = await supabase.from('blogs').select('*').eq('slug', slug).single()

  if (!blog) {
    return (
      <div className="max-w-3xl mx-auto p-10 text-center">
        <h1 className="text-2xl font-bold">Blog not found</h1>
        <p className="mt-2">Slug: {slug}</p>
        <Link href="/blog" className="text-blue-600 mt-4 inline-block">← Back to Blog</Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white min-h-screen">
      <Link href="/blog" className="text-sm text-gray-500 mb-4 block">← Back</Link>
      <h1 className="text-3xl font-bold mb-4">{blog.title}</h1>
      <p className="text-gray-500 mb-6">{new Date(blog.created_at).toLocaleDateString()}</p>
      <div className="prose max-w-none leading-7" dangerouslySetInnerHTML={{ __html: blog.content }} />
    </div>
  )
}
