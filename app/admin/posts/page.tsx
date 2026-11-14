'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<any[]>([])
  const [comments, setComments] = useState<any[]>([])
  const [tab, setTab] = useState<'posts'|'pending'|'comments'>('posts')
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

  const approvedPosts = posts.filter(x => x.status !== 'pending' && x.status !== 'rejected')
  const pendingPosts = posts.filter(x => x.status === 'pending')
  const rejectedPosts = posts.filter(x => x.status === 'rejected')

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
  async function approvePost(id: string) {
    if (!confirm("Approve karke live kar du?")) return
    await supabase.from('blogs').update({ status: 'approved' }).eq('id', id)
    fetchAll()
    alert("✅ Approved! Ab blog site pe live hai!")
  }
  async function rejectPost(id: string) {
    if (!confirm("Reject kar du?")) return
    await supabase.from('blogs').update({ status: 'rejected' }).eq('id', id)
    fetchAll()
  }
  async function backToPending(id: string) {
    await supabase.from('blogs').update({ status: 'pending' }).eq('id', id)
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

        <div className="flex gap-2 mb-6 p-1.5 bg-white/20 backdrop-blur-xl rounded-full border border-white/30 w-fit flex-wrap">
          <button onClick={()=>setTab('posts')} className={`px-6 py-2.5 rounded-full font-medium transition-all ${tab==='posts'?'bg-white text-black shadow':'text-white/80'}`}>Posts ({approvedPosts.length})</button>
          <button onClick={()=>setTab('pending')} className={`px-6 py-2.5 rounded-full font-medium transition-all ${tab==='pending'?'bg-yellow-400 text-black shadow':'text-white/80'} relative`}>
            ⏳ Pending ({pendingPosts.length})
            {pendingPosts.length > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>}
          </button>
          <button onClick={()=>setTab('comments')} className={`px-6 py-2.5 rounded-full font-medium transition-all ${tab==='comments'?'bg-white text-black shadow':'text-white/80'}`}>Comments ({comments.length})</button>
        </div>

        <div className="backdrop-blur-xl bg-white/20 border border-white/30 rounded-[24px] p-6 shadow-xl">
          {tab==='posts' && (
            <div className="grid gap-3">
              {approvedPosts.map(p=>(
                <div key={p.id} className="p-4 rounded-2xl backdrop-blur border bg-white/90 border-white/50 shadow-sm flex justify-between items-center gap-3">
                  <div className="flex-1"><p className="font-semibold">{p.title}</p><p className="text-xs text-gray-500">{p.slug} • By {p.author_name || 'Admin'} • {p.category || 'General'} {p.tags ? `• 🏷️ ${p.tags}` : ''}</p></div>
                  <div className="flex gap-2 flex-wrap justify-end">
                    <Link href={`/blog/${p.slug}`} className="px-3 py-1.5 bg-black text-white rounded-full text-xs">View</Link>
                    {/* ✅ YAHAN LAGAYA - SEO Edit Button - Approved me */}
                    <Link href={`/admin/edit-blog/${p.id}`} className="px-3 py-1.5 bg-orange-500 text-white rounded-full text-xs font-bold">🔍 SEO Edit</Link>
                    <button onClick={()=>deletePost(p.id)} className="px-3 py-1.5 bg-red-500 text-white rounded-full text-xs">Delete</button>
                  </div>
                </div>
              ))}
              {approvedPosts.length===0 && <p className="text-white/80 text-center py-10">No posts</p>}
            </div>
          )}

          {tab==='pending' && (
            <div className="grid gap-3">
              {pendingPosts.map(p=>(
                <div key={p.id} className="p-4 rounded-2xl bg-white/90 border border-white/50 shadow-sm">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1">
                      <span className="text-[11px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold">{p.category || 'General'}</span>
                      <p className="font-bold mt-1.5">{p.title}</p>
                      <p className="text-xs text-gray-500">By {p.author_name || 'Unknown'} ({p.author_email || 'no email'}) • {new Date(p.created_at).toLocaleString('en-IN')} • {p.content?.length || 0} chars</p>
                      <p className="text-sm text-gray-700 mt-2 line-clamp-3">{p.excerpt || p.content?.slice(0,150)}</p>
                      {p.tags && <p className="text-xs text-orange-600 mt-1">🏷️ Tags: {p.tags}</p>}
                      <details className="mt-2"><summary className="text-xs text-orange-600 font-bold cursor-pointer">Full Blog Padho ↓</summary><p className="text-sm whitespace-pre-wrap bg-gray-50 p-3 rounded-xl mt-2 max-h-[250px] overflow-auto">{p.content}</p></details>
                    </div>
                    {p.cover_image && <img src={p.cover_image} className="w-[90px] h-[70px] object-cover rounded-xl" />}
                  </div>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    <button onClick={()=>approvePost(p.id)} className="px-4 py-1.5 bg-green-600 text-white rounded-full text-xs font-bold">✅ Approve & Publish</button>
                    <button onClick={()=>rejectPost(p.id)} className="px-4 py-1.5 bg-red-500 text-white rounded-full text-xs font-bold">❌ Reject</button>
                    <Link href={`/blog/${p.slug}`} className="px-3 py-1.5 bg-black text-white rounded-full text-xs">Preview</Link>
                    {/* ✅ YAHAN BHI LAGAYA - Pending me bhi SEO Edit */}
                    <Link href={`/admin/edit-blog/${p.id}`} className="px-3 py-1.5 bg-orange-500 text-white rounded-full text-xs font-bold">🔍 SEO Edit</Link>
                    <button onClick={()=>deletePost(p.id)} className="px-3 py-1.5 bg-gray-200 text-red-600 rounded-full text-xs font-bold">🗑️ Delete</button>
                  </div>
                </div>
              ))}
              {pendingPosts.length===0 && (
                <div className="text-center py-10">
                  <p className="text-4xl">🎉</p>
                  <p className="text-white font-bold mt-2">Koi Pending Blog Nahi Hai!</p>
                  <p className="text-white/70 text-sm">Jab koi user blog likhega to yahan aa jayega.</p>
                </div>
              )}
              {rejectedPosts.length > 0 && <p className="text-white/80 text-sm font-bold mt-2">Rejected ({rejectedPosts.length}) - Wapas laane ke liye:</p>}
              {rejectedPosts.map(p=>(
                <div key={p.id} className="p-3 rounded-2xl bg-black/20 border border-white/20 flex justify-between items-center">
                  <p className="text-white text-sm font-semibold flex-1">{p.title} <span className="text-white/60 text-xs">- By {p.author_name}</span></p>
                  <div className="flex gap-2">
                    <Link href={`/admin/edit-blog/${p.id}`} className="px-3 py-1 bg-orange-500 text-white rounded-full text-xs font-bold">SEO Edit</Link>
                    <button onClick={()=>backToPending(p.id)} className="px-3 py-1 bg-yellow-400 rounded-full text-xs font-bold">Back to Pending</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab==='comments' && (
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
