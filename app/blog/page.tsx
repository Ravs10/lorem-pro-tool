import { createClient } from '@supabase/supabase-js'

function stripHtml(html: string) {
  return html?.replace(/<[^>]*>/g, '').substring(0, 150) + '...'
}

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default async function BlogPage() {
  const { data: blogs } = await supabase.from('blogs').select('*').order('created_at', { ascending: false })
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Blog</h1>
      <div className="grid gap-6">
        {(blogs || []).map((b: any) => (
          <a key={b.id} href={`/blog/${b.slug}`} className="border p-4 rounded-lg hover:shadow block bg-white">
            <h2 className="text-xl font-semibold">{b.title}</h2>
            <p className="text-gray-500 text-sm mt-2">{new Date(b.created_at).toLocaleDateString()}</p>
            <p className="mt-2 text-gray-700">{stripHtml(b.content)}</p>
          </a>
        ))}
      </div>
    </div>
  )
}
