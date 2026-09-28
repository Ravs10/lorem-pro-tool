'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<any[]>([])
  const [comments, setComments] = useState<any[]>([])
  const [tab, setTab] = useState<'posts'|'comments'>('posts')
  const router = useRouter()

  useEffect(() => {
    const admin = localStorage.getItem("lorem_admin")
    if (admin!== "true") { router.push('/admin'); return }
    fetchAll()
  }, [])

  async function fetchAll() {
    const { data: p } = await supabase.from('blogs').select('*').order('created_at', { ascending: false })
    const { data: c } = await supabase.from('comments').select('*').order('created_at', { ascending: false })
    if (p) setPosts(p); if (c) setComments(c)
  }
  async function deletePost(id: string) {
    if (!confirm("Post delete?")) return
    await supabase.from('blogs').delete().eq('id', id)
    setPosts(posts.filter(x=>x.id!==id))
  }
  async function deleteComment(id: string) {
    if (!confirm("Comment delete?")) return
    await supabase.from('comments').delete().eq('id', id)
    setComments(comments.filter(x=>x.id!==id))
  }
  async function toggleApprove(c: any) {
    await supabase.from('comments').update({ is_approved:!c.is_approved }).eq('id', c.id)
    fetchAll()
  }

  return (
    <div className="min-h-screen p-4" style={{background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"}}>
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">⚡ Lorem Pro Tool</h1>
          <div className="flex gap-2">
            <Link href="/admin" className="px-4 py-2 bg-white/90 rounded-full text-sm font-bold shadow">← Back</Link>
            <button onClick={()=>{localStorage.removeItem("lorem_admin"); router.push('/admin')}} className="px-4 py-2 bg-white/90 rounded-full text-sm">Logout</button>
          </div>
        </div>

        <div className="flex gap-2 mb-6 p-1.5 bg-white/20 backdrop-blur-xl rounded-full border border-white/30 w-fit">
          <button onClick={()=>setTab('posts')} className={`px-6 py-2.5 rounded-full font-medium transition-all ${tab==='posts'?'bg-white text-black shadow':'text-white/80'}`}>Posts ({posts.length})</button>
          <button onClick={()=>setTab('comments')} className={`px-6 py-2.5 rounded-full font-medium transition-all ${tab==='comments'?'bg-white text-black shadow':'text-white/80'}`}>Comments ({comments.length})</button>
        </div>

        <div className="backdrop-blur-xl bg-white/20 border border-white/30 rounded-[24px] p-6 shadow-xl">
          {tab==='posts'? (
            <div className="grid gap-3">
              {posts.map(p=>(
                <div key={p.id} className="p-4 rounded-2xl backdrop-blur border bg-white/90 border-white/50 shadow-sm flex justify-between items-center gap-3">
                  <div className="flex-1"><p className="font-semibold">{p.title}</p><p className="text-xs text-gray-500">{p.slug}</p></div>
                  <div className="flex gap-2">
                    <Link href={`/blog/${p.slug}`} className="px-3 py-1.5 bg-black text-white rounded-full text-xs">View</Link>
                    <button onClick={()=>deletePost(p.id)} className="px-3 py-1.5 bg-red-500 text-white rounded-full text-xs">Delete</button>
                  </div>
                </div>
              ))}
              {posts.length===0 && <p className="text-white/80 text-center py-10">No posts</p>}
            </div>
          ) : (
            <div className="grid gap-3">
              {comments.map(c=>(
                <div key={c.id} className="p-4 rounded-2xl bg-white/90 border border-white/50 shadow-sm">
                  <div className="flex justify-between"><p className="font-bold text-sm">{c.name} <span className="font-normal text-xs text-gray-500">on {c.blog_slug}</span></p><p className="text-[10px] text-gray-400">{new Date(c.created_at).toLocaleDateString()}</p></div>
                  <p className="text-sm mt-1 text-gray-800">{c.comment}</p>
                  <div className="flex gap-2 mt-3">
                    <button onClick={()=>toggleApprove(c)} className={`px-3 py-1 rounded-full text-xs font-bold ${c.is_approved?'bg-green-500 text-white':'bg-yellow-400 text-black'}`}>{c.is_approved?'✓ Approved':'Approve'}</button>
                    <button onClick={()=>deleteComment(c.id)} className="px-3 py-1 rounded-full text-xs bg-red-500 text-white">Delete</button>
                    <Link href={`/blog/${c.blog_slug}`} className="px-3 py-1 rounded-full text-xs bg-black text-white">Open Post</Link>
                  </div>
                </div>
              ))}
              {comments.length===0 && <p className="text-white/80 text-center py-10">No comments</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
