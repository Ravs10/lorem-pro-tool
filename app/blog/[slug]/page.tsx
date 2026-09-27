import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import BackButton from '@/app/components/BackButton'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default async function Page({ params }) {
  // Next 14 aur 15 dono ke liye safe
  const resolvedParams = params && typeof params.then === 'function' ? await params : params
  const slug = resolvedParams.slug

  const { data: blog } = await supabase.from('blogs').select('*').eq('slug', slug).single()

  if (!blog) {
    return (
      <div className="max-w-3xl mx-auto p-10 text-center">
        <h1 className="text-2xl font-bold">Blog Not Found</h1>
        <p className="mt-2">Slug: {slug}</p>
        <Link href="/blog" className="text-orange-500 mt-4 inline-block">← Back to Blog</Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-[#fffaf0] min-h-screen">
      <div className="mb-6">
        <BackButton variant="top" />
      </div>

      <h1 className="text-3xl font-bold mb-4">{blog.title}</h1>
      <p className="text-gray-500 mb-6">{new Date(blog.created_at).toLocaleDateString()} | By Ravish</p>
      <div className="prose max-w-none leading-relaxed whitespace-pre-wrap">
        {blog.content}
      </div>

      <BackButton variant="bottom" />
    </div>
  )
}
