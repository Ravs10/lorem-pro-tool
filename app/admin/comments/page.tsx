'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function AdminComments(){
  const [comments,setComments]=useState<any[]>([])
  const [filter,setFilter]=useState<'all'|'pending'|'approved'|'rejected'|'trash'>('all')
  const [editingId,setEditingId]=useState<string|null>(null)
  const [editText,setEditText]=useState("")
  const [isMaster,setIsMaster]=useState(false)
  const [loading,setLoading]=useState(true)

  useEffect(()=>{ fetchData() },[])

  async function fetchData(){
    // Pehle Role pata karo - Master hai ya Admin
    try{
      const me = await fetch("/api/admin/me", { credentials: "include" }).then(r=>r.json())
      if(me.role) setIsMaster(me.role === "master")
    }catch{}
    const res = await fetch("/api/admin/comments", { credentials: "include", cache: "no-store" })
    const d = await res.json()
    if(d.comments) setComments(d.comments)
    setLoading(false)
  }

  async function doAction(id:string, action:string, text?:string){
    const res = await fetch("/api/admin/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ id, action, text })
    })
    const d = await res.json()
    if(!res.ok) return alert("❌ "+(d.error || "Fail ho gaya"))
    fetchData() // List fresh karo
  }

  async function approve(id:string){ await doAction(id, "approve") }
  async function reject(id:string){ await doAction(id, "reject") }
  async function trash(id:string){ if(!confirm("Trash me bheju? Baad me Restore ho jayega.")) return; await doAction(id, "trash") }
  async function restore(id:string){ await doAction(id, "restore") }

  // Permanent Delete - SIRF MASTER
  async function removePermanent(id:string){
    if(!isMaster) return alert("❌ Sirf Master Permanent Delete kar sakta hai")
    if(!confirm("Pakka PERMANENT Delete karna hai? Ye wapas nahi aayega.")) return
    await doAction(id, "delete_permanent")
  }

  async function saveEdit(id:string){
    if(!editText.trim()) return
    await doAction(id, "edit", editText)
    setEditingId(null); setEditText("")
  }

  const filtered = comments.filter(c => {
    if(filter==='pending') return c.status === 'pending'
    if(filter==='approved') return c.status === 'approved'
    if(filter==='rejected') return c.status === 'rejected'
    if(filter==='trash') return c.status === 'trash'
    return true
  })

  const pendingCount = comments.filter(c=>c.status==='pending').length
  const rejectedCount = comments.filter(c=>c.status==='rejected').length
  const trashCount = comments.filter(c=>c.status==='trash').length

  if(loading) return <div className="max-w-3xl mx-auto p-6">Loading...</div>

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-black mb-2">All Comments - {isMaster ? "👑 MASTER" : "🛡️ ADMIN"}</h1>
      <p className="text-sm text-gray-500 mb-4">Pending: <b className="text-orange-600">{pendingCount}</b> • Rejected: <b className="text-red-600">{rejectedCount}</b> • Trash: <b className="text-gray-600">{trashCount}</b></p>
      <Link href="/admin/posts" className="bg-black text-white px-4 py-2 rounded-full mb-6 inline-block">← Back to Posts</Link>

      <div className="flex gap-2 mb-4 flex-wrap">
        <button onClick={()=>setFilter('all')} className={`px-4 py-2 rounded-full font-bold text-sm ${filter==='all'?'bg-black text-white':'bg-gray-200'}`}>All ({comments.length})</button>
        <button onClick={()=>setFilter('pending')} className={`px-4 py-2 rounded-full font-bold text-sm ${filter==='pending'?'bg-orange-500 text-white':'bg-gray-200'}`}>Pending ({pendingCount})</button>
        <button onClick={()=>setFilter('approved')} className={`px-4 py-2 rounded-full font-bold text-sm ${filter==='approved'?'bg-green-600 text-white':'bg-gray-200'}`}>Approved</button>
        <button onClick={()=>setFilter('rejected')} className={`px-4 py-2 rounded-full font-bold text-sm ${filter==='rejected'?'bg-red-600 text-white':'bg-gray-200'}`}>Rejected ({rejectedCount})</button>
        <button onClick={()=>setFilter('trash')} className={`px-4 py-2 rounded-full font-bold text-sm ${filter==='trash'?'bg-gray-800 text-white':'bg-gray-200'}`}>🗑️ Trash ({trashCount})</button>
      </div>

      <div className="space-y-3 mt-4">
        {filtered.length===0 && <p className="text-gray-400 text-center py-6">Koi comment nahi hai is filter me.</p>}
        {filtered.map(c=>{
          const label = c.status === 'approved' ? '✅ Approved' : c.status === 'rejected' ? '❌ Rejected' : c.status === 'trash' ? '🗑️ Trash' : '⏳ Pending'
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
              <p className="text-xs text-gray-400 mt-1">{new Date(c.created_at).toLocaleString()} • {label}</p>
            </div>

            {/* Trash me hai to sirf Restore / Permanent Delete dikhega */}
            {c.status === 'trash' ? (
              <div className="flex gap-2 mt-3 flex-wrap">
                <button onClick={()=>restore(c.id)} className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold">♻️ Restore</button>
                {isMaster && <button onClick={()=>removePermanent(c.id)} className="bg-red-700 text-white px-3 py-1 rounded-full text-sm font-bold">💥 Permanent Delete (Master Only)</button>}
                {!isMaster && <span className="text-xs text-gray-400 mt-1">Permanent Delete sirf Master kar sakta hai</span>}
              </div>
            ) : (
              <div className="flex gap-2 mt-3 flex-wrap">
                <button onClick={()=>approve(c.id)} className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-bold">✅ Approve</button>
                <button onClick={()=>reject(c.id)} className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold">🚫 Reject</button>
                <button onClick={()=>{setEditingId(c.id); setEditText(c.comment)}} className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">✏️ Edit</button>
                <button onClick={()=>trash(c.id)} className="bg-gray-800 text-white px-3 py-1 rounded-full text-sm font-bold">🗑️ Trash</button>
              </div>
            )}
          </div>
          )
        })}
      </div>
    </div>
  )
}
