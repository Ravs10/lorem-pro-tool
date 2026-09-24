'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase.js'

export default function PostsControl(){
 const [posts, setPosts] = useState<any[]>([])
 useEffect(()=>{ load() },[])
 async function load(){
  const {data} = await supabase.from('blog_posts').select('*').order('created_at', {ascending:false})
  if(data) setPosts(data)
 }
 async function approve(id:any){ await supabase.from('blog_posts').update({status:'published'}).eq('id',id); load() }
 async function del(id:any){ if(confirm('Delete?')){ await supabase.from('blog_posts').delete().eq('id',id); load() } }
 
 return(
  <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] p-4 text-white">
   <h1 className="text-2xl font-bold mb-4">📝 Posts Approve / Delete</h1>
   <div className="space-y-3">
    {posts.map(p=>(
     <div key={p.id} className="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-4">
      <p className="font-bold">{p.title} - <span className="text-xs text-yellow-300">{p.status}</span></p>
      <p className="text-xs opacity-50">{p.slug}</p>
      <div className="flex gap-2 mt-2">
       <button onClick={()=>approve(p.id)} className="bg-green-500 px-3 py-1 rounded-full text-xs">Approve</button>
       <button onClick={()=>del(p.id)} className="bg-red-500 px-3 py-1 rounded-full text-xs">Delete</button>
      </div>
     </div>
    ))}
   </div>
  </div>
 )
}
