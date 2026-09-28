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
    const admin = localStorage.getItem("lorem_admin") || localStorage.getItem("admin") || localStorage.getItem("isAdmin")
    if (admin!== "true" && admin!== "1") {
      router.push('/admin')
      return
    }
    fetchPosts()
    fetchComments()
  }, [])

  async function fetchPosts() {
    const { data } = await supabase.from('blogs').select('*').order('created_at', { ascending: false })
    if (data) setPosts(data)
  }
  async function fetchComments() {
    const { data } = await supabase.from('comments').select('*').order('created_at', { ascending: false })
    if (data) setComments(data)
  }
  async function deletePost(id: string) {
    if (!confirm("Post delete karna hai?")) return
    await supabase.from('blogs').delete().eq('id', id)
    setPosts(posts.filter(p => p.id!== id))
  }
  async function deleteComment(id: string) {
    if (!confirm("Comment delete karna hai?")) return
    await supabase.from('comments').delete().eq('id', id)
    setComments(comments.filter(c => c.id!== id))
  }
  async function toggleApprove(c: any) {
    await supabase.from('comments').update({ is_approved:!c.is_approved }).eq('id', c.id)
    fetchComments()
  }

  return (
    <div className="max-w-4xl mx-auto p-6 min-h-screen bg-[#fffaf0]">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-black">Admin Panel</h1>
        <Link href="/" className="bg-black text-white px-4 py-2 rounded-full">Home</Link>
      </div>

      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab('posts')} className={`px-6 py-2 rounded-full font-bold ${tab === 'posts'? 'bg-black text-white' : 'bg-white border'}`}>Posts ({posts.length})</button>
        <button onClick={() => setTab('comments')} className={`px-6 py-2 rounded-full font-bold ${tab === 'comments'? 'bg-black text-white' : 'bg-white border'}`}>Comments ({comments.length})</button>
      </div>

      {tab === 'posts'? (
        <div className="space-y-3">
          {posts.map(p => (
            <div key={p.id} className="bg-white p-4 rounded-xl border flex justify-between items-center">
              <div><p className="font-bold">{p.title}</p><p className="text-xs text-gray-400">{p.slug}</p></div>
              <button onClick={() => deletePost(p.id)} className="bg-red-600 text-white px-4 py-1 rounded-full text-sm">Delete</button>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map(c => (
            <div key={c.id} className="bg-white p-4 rounded-xl border">
              <p className="font-bold text-sm">{c.name} <span className="text-xs text-gray-400">on {c.blog_slug} - {new Date(c.created_at).toLocaleString()}</span></p>
              <p className="mt-1">{c.comment}</p>
              <div className="flex gap-2 mt-3">
                <button onClick={() => toggleApprove(c)} className={`px-3 py-1 rounded-full text-xs font-bold ${c.is_approved? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{c.is_approved? 'Approved ✓' : 'Approve karo'}</button>
                <button onClick={() => deleteComment(c.id)} className="bg-red-600 text-white px-3 py-1 rounded-full text-xs">Delete</button>
                <Link href={`/blog/${c.blog_slug}`} className="bg-gray-100 px-3 py-1 rounded-full text-xs">View Post</Link>
              </div>
            </div>
          ))}
          {comments.length === 0 && <p className="text-center text-gray-500 mt-10">Koi comment nahi hai</p>}
        </div>
      )}
    </div>
  )
}
