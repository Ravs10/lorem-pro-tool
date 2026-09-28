'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function AdminComments(){
  const [comments,setComments]=useState<any[]>([])
  useEffect(()=>{ fetchData() },[])
  async function fetchData(){
    const {data}=await supabase.from('comments').select('*').order('created_at',{ascending:false})
    if(data) setComments(data)
  }
  async function del(id:string){
    if(!confirm("Delete?")) return
    await supabase.from('comments').delete().eq('id',id)
    setComments(comments.filter(c=>c.id!==id))
  }
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-black mb-6">All Comments - Admin</h1>
      <Link href="/admin/posts" className="bg-black text-white px-4 py-2 rounded-full mb-6 inline-block">← Back to Posts</Link>
      <div className="space-y-3 mt-4">
        {comments.map(c=>(
          <div key={c.id} className="bg-white p-4 rounded-xl border flex justify-between">
            <div>
              <p className="font-bold">{c.name} <span className="text-xs text-gray-400">on {c.blog_slug}</span></p>
              <p className="text-gray-600">{c.comment}</p>
              <p className="text-xs text-gray-400">{new Date(c.created_at).toLocaleString()}</p>
            </div>
            <button onClick={()=>del(c.id)} className="bg-red-600 text-white px-3 py-1 rounded-full h-fit text-sm">Delete</button>
          </div>
        ))}
      </div>
    </div>
  )
}
