'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function AdminComments(){
  const [comments,setComments]=useState<any[]>([])
  const [filter,setFilter]=useState<'all'|'pending'|'approved'|'rejected'>('all')
  const [editingId,setEditingId]=useState<string|null>(null)
  const [editText,setEditText]=useState("")
  // Reject wale id yaha rakhte hai - taaki Reject aur Pending alag dikhe
  const [rejectedIds,setRejectedIds]=useState<string[]>([])

  useEffect(()=>{ fetchData() },[])

  async function fetchData(){
    const {data}=await supabase.from('comments').select('*').order('created_at',{ascending:false})
    if(data) setComments(data)
  }

  async function approve(id:string){
    const {error}=await supabase.from('comments').update({is_approved: true}).eq('id',id)
    if(error) return alert(error.message)
    setComments(comments.map(c=> c.id===id ? {...c, is_approved: true} : c))
    setRejectedIds(rejectedIds.filter(r=>r!==id))
  }

  // ✅ REJECT - Site pe nahi dikhega, Admin me rahega
  async function reject(id:string){
    const {error}=await supabase.from('comments').update({is_approved: false}).eq('id',id)
    if(error) return alert(error.message)
    setComments(comments.map(c=> c.id===id ? {...c, is_approved: false} : c))
    if(!rejectedIds.includes(id)) setRejectedIds([...rejectedIds, id])
  }

  // ✅ REMOVE - Hamesha ke liye Delete
  async function remove(id:string){
    if(!confirm("Pakka Remove karna hai? Ye wapas nahi aayega.")) return
    const {error}=await supabase.from('comments').delete().eq('id',id)
    if(error) return alert(error.message)
    setComments(comments.filter(c=>c.id!==id))
    setRejectedIds(rejectedIds.filter(r=>r!==id))
  }

  async function saveEdit(id:string){
    if(!editText.trim()) return
    const {error}=await supabase.from('comments').update({comment: editText}).eq('id',id)
    if(error) return alert(error.message)
    setComments(comments.map(c=> c.id===id ? {...c, comment: editText} : c))
    setEditingId(null); setEditText("")
  }

  const filtered = comments.filter(c => {
    if(filter==='pending') return !c.is_approved && !rejectedIds.includes(c.id)
    if(filter==='approved') return c.is_approved
    if(filter==='rejected') return rejectedIds.includes(c.id)
    return true
  })

  const pendingCount = comments.filter(c=>!c.is_approved && !rejectedIds.includes(c.id)).length

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-black mb-2">All Comments - Admin</h1>
      <p className="text-sm text-gray-500 mb-4">Pending: <b className="text-orange-600">{pendingCount}</b> • Rejected: <b className="text-red-600">{rejectedIds.length}</b></p>
      <Link href="/admin/posts" className="bg-black text-white px-4 py-2 rounded-full mb-6 inline-block">← Back to Posts</Link>

      <div className="flex gap-2 mb-4 flex-wrap">
        <button onClick={()=>setFilter('all')} className={`px-4 py-2 rounded-full font-bold text-sm ${filter==='all'?'bg-black text-white':'bg-gray-200'}`}>All ({comments.length})</button>
        <button onClick={()=>setFilter('pending')} className={`px-4 py-2 rounded-full font-bold text-sm ${filter==='pending'?'bg-orange-500 text-white':'bg-gray-200'}`}>Pending ({pendingCount})</button>
        <button onClick={()=>setFilter('approved')} className={`px-4 py-2 rounded-full font-bold text-sm ${filter==='approved'?'bg-green-600 text-white':'bg-gray-200'}`}>Approved</button>
        <button onClick={()=>setFilter('rejected')} className={`px-4 py-2 rounded-full font-bold text-sm ${filter==='rejected'?'bg-red-600 text-white':'bg-gray-200'}`}>Rejected ({rejectedIds.length})</button>
      </div>

      <div className="space-y-3 mt-4">
        {filtered.length===0 && <p className="text-gray-400 text-center py-6">Koi comment nahi hai is filter me.</p>}
        {filtered.map(c=>{
          const isRejected = rejectedIds.includes(c.id)
          return (
          <div key={c.id} className="bg-white p-4 rounded-xl border">
            <div>
              <p className="font-bold">{c.name} <span className="text-xs text-gray-400">on {c.blog_slug}</span></p>
              {editingId===c.id ? (
                <div className="mt-2">
                  <textarea value={editText} onChange={e=>setEditText(e.target.value)} className="w-full p-2 border rounded-lg" />
                  <div className="flex gap-2 mt-2">
                    <button onClick={()=>saveEdit(c.id)} className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-bold">Save</button>
                    <button onClick={()=>setEditingId(null)} className="bg-gray-300 px-3 py-1 rounded-full text-sm">Cancel</button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600">{c.comment}</p>
              )}
              <p className="text-xs text-gray-400 mt-1">{new Date(c.created_at).toLocaleString()} • {c.is_approved ? '✅ Approved' : isRejected ? '❌ Rejected' : '⏳ Pending'}</p>
            </div>
            <div className="flex gap-2 mt-3 flex-wrap">
              <button onClick={()=>approve(c.id)} className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-bold">✅ Approve</button>
              <button onClick={()=>reject(c.id)} className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold">🚫 Reject</button>
              <button onClick={()=>{setEditingId(c.id); setEditText(c.comment)}} className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">✏️ Edit</button>
              <button onClick={()=>remove(c.id)} className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">🗑️ Remove</button>
            </div>
          </div>
          )
        })}
      </div>
    </div>
  )
}
