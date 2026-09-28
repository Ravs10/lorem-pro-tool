'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'

export default function PostsControl(){
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(()=>{ load() },[])
  
  async function load(){
    setLoading(true)
    const { data } = await supabase.from('blogs').select('*').order('created_at', {ascending: false})
    // agar 'blogs' se data nahi aaye to 'blog_posts' try karo
    if(data && data.length > 0) setPosts(data)
    else {
      const { data: data2 } = await supabase.from('blog_posts').select('*').order('created_at', {ascending: false})
      if(data2) setPosts(data2)
    }
    setLoading(false)
  }

  async function approve(id:any){
    await supabase.from('blogs').update({ status: 'approved' }).eq('id', id)
    await supabase.from('blog_posts').update({ status: 'approved' }).eq('id', id)
    alert('Approved!');
    load()
  }

  async function del(id:any){
    if(!confirm('Pakka delete karna hai?')) return;
    let { error } = await supabase.from('blogs').delete().eq('id', id)
    if(error){
      await supabase.from('blog_posts').delete().eq('id', id)
    }
    setPosts(posts.filter(p => p.id !== id))
  }

  if(loading) return <div className="p-10 text-white bg-black min-h-screen">Loading...</div>

  return(
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-4">
      <h1 className="text-2xl font-bold mb-4">📝 Posts Control - {posts.length} Posts</h1>
      <div className="space-y-3">
        {posts.map(p=>(
          <div key={p.id} className="bg-white/10 backdrop-blur p-3 rounded-lg border border-white/20">
            <p className="font-bold">{p.title} - <span className={p.status==='approved'?'text-green-400':'text-yellow-400'}>{p.status}</span></p>
            <p className="text-xs opacity-50">{p.slug}</p>
            <div className="flex gap-2 mt-2">
              <button onClick={()=>approve(p.id)} className="bg-green-600 px-4 py-2 rounded text-sm">Approve</button>
              <button onClick={()=>del(p.id)} className="bg-red-600 px-4 py-2 rounded text-sm">Delete</button>
            </div>
          </div>
        ))}
        {posts.length===0 && <p>No posts found. Check table name blogs / blog_posts</p>}
      </div>
    </div>
  )
}
