'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function EditBlogSEO() {
  const { id } = useParams()
  const router = useRouter()
  const [f, setF] = useState<any>({ title:'', category:'General', excerpt:'', content:'', cover_image:'', seo_title:'', seo_description:'', tags:'', slug:'', status:'approved' })

  useEffect(() => {
    const admin = localStorage.getItem("lorem_admin")
    if (admin !== "true") { router.push('/admin'); return }
    ;(async () => {
      const { data } = await supabase.from('blogs').select('*').eq('id', id).single()
      if (data) setF(data)
    })()
  }, [id])

  // SEO Score - 100 me se kitna hai?
  const score = (() => {
    let s = 0
    if ((f.seo_title || f.title)?.length >= 30) s += 25
    if ((f.seo_description || f.excerpt)?.length >= 100) s += 25
    if (f.tags) s += 15
    if (f.cover_image) s += 15
    if ((f.content || '').length > 500) s += 20
    return s
  })()

  async function save() {
    const { error } = await supabase.from('blogs').update({
      title: f.title, category: f.category, excerpt: f.excerpt, content: f.content, cover_image: f.cover_image,
      seo_title: f.seo_title || f.title,
      seo_description: f.seo_description || f.excerpt,
      tags: f.tags,
    }).eq('id', id)
    if (!error) { alert('✅ SEO Save Ho Gaya!'); router.push('/admin/posts') }
    else alert(error.message)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link href="/admin/posts" className="text-sm bg-gray-100 px-4 py-2 rounded-full">← Back to Admin</Link>
      <h1 className="text-2xl font-bold mt-4">✏️ Edit Blog + SEO</h1>
      <p className="text-sm text-gray-500">Status: <b>{f.status}</b> • Slug: {f.slug}</p>

      {/* SEO Score */}
      <div className="bg-black text-white rounded-2xl p-4 mt-4 flex justify-between items-center">
        <div><p className="font-bold">🔍 SEO Score</p><p className="text-xs text-white/70">Title + Description + Tags + Image + Content</p></div>
        <div className="text-3xl font-black">{score}<span className="text-sm">/100</span></div>
      </div>
      <div className="h-2 bg-gray-200 rounded-full mt-2 overflow-hidden"><div className={`h-full ${score >= 80 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${score}%` }} /></div>

      <input value={f.title} onChange={e=>setF({...f,title:e.target.value})} placeholder="Blog Title" className="w-full border p-3 rounded-xl mt-4" />
      <input value={f.cover_image||''} onChange={e=>setF({...f,cover_image:e.target.value})} placeholder="Cover Image Link" className="w-full border p-3 rounded-xl mt-3" />
      <select value={f.category} onChange={e=>setF({...f,category:e.target.value})} className="w-full border p-3 rounded-xl mt-3"><option>General</option><option>Finance</option><option>YouTube</option><option>AI Tools</option><option>Career</option><option>Study</option></select>
      <textarea value={f.excerpt||''} onChange={e=>setF({...f,excerpt:e.target.value})} placeholder="Excerpt" className="w-full border p-3 rounded-xl mt-3 h-[70px]" />

      <div className="bg-yellow-50 border rounded-2xl p-4 mt-4">
        <p className="font-bold">🔍 SEO - Blogger Jaisa</p>
        <input value={f.seo_title||''} onChange={e=>setF({...f,seo_title:e.target.value})} placeholder="SEO Title (60 chars)" maxLength={60} className="w-full border p-3 rounded-xl mt-3 bg-white" />
        <p className="text-xs text-gray-500">{(f.seo_title||'').length}/60 - {(f.seo_title||'').length >= 30 ? '✅ Good' : '⚠️ Thoda chhota hai'}</p>
        <textarea value={f.seo_description||''} onChange={e=>setF({...f,seo_description:e.target.value})} placeholder="SEO Description (155 chars)" maxLength={160} className="w-full border p-3 rounded-xl mt-3 h-[70px] bg-white" />
        <p className="text-xs text-gray-500">{(f.seo_description||'').length}/160 - {(f.seo_description||'').length >= 100 ? '✅ Good' : '⚠️ Thoda chhota hai'}</p>
        <input value={f.tags||''} onChange={e=>setF({...f,tags:e.target.value})} placeholder="Tags - sip, finance, paisa" className="w-full border p-3 rounded-xl mt-3 bg-white" />
        <div className="bg-white border rounded-xl p-3 mt-4">
          <p className="text-[11px] text-gray-500">GOOGLE PREVIEW 👇</p>
          <p className="text-blue-700 text-lg leading-tight mt-1">{f.seo_title || f.title}</p>
          <p className="text-green-700 text-xs">lorem-pro-tool.run4ravish.workers.dev › blog › {f.slug}</p>
          <p className="text-sm text-gray-600 line-clamp-2">{f.seo_description || f.excerpt}</p>
        </div>
      </div>

      <textarea value={f.content||''} onChange={e=>setF({...f,content:e.target.value})} placeholder="Content" className="w-full border p-3 rounded-xl mt-4 h-[300px]" />
      <button onClick={save} className="w-full bg-black text-white py-3.5 rounded-xl font-bold mt-4">Save + Update SEO →</button>
    </div>
  )
}
