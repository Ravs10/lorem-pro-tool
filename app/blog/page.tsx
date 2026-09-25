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
  <a key={b.id} href={`/blog/${b.slug}`} className="block bg-[#FFF8EB] rounded-[28px] p-7 border border-orange-100 shadow-sm hover:shadow-md transition">
    <div className="flex items-center gap-3 mb-3">
      <span className="text-[38px]">{b.icon || "📝"}</span>
      <span className="bg-black text-white px-4 py-2 rounded-full text-[12px] font-bold tracking-wide">
        {b.category || b.cat || "BLOG"} • {b.read_time || b.read || "3 Min Read"}
      </span>
    </div>
    <h2 className="text-[26px] font-extrabold leading-[1.2] text-black">
      {b.title}
    </h2>
    <p className="text-orange-500 font-bold mt-3 text-[14px]">
      {b.created_at? new Date(b.created_at).toLocaleDateString('en-GB', {day:'2-digit', month:'short', year:'numeric'}) : b.date} | By Ravish from India 🇮🇳
    </p>
    <p className="text-gray-600 mt-3 text-[15px] leading-relaxed">
      {b.excerpt || stripHtml(b.content).substring(0, 150)}...
    </p>
  </a>
))}
      </div>
    </div>
  )
}
