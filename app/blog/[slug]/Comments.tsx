'use client'
import { useEffect, useState } from 'react'

export default function Comments({ slug }: { slug: string }) {
  const [comments, setComments] = useState<any[]>([])
  const [name, setName] = useState("")
  const [text, setText] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  useEffect(() => { fetchComments() }, [])

  async function fetchComments() {
    const res = await fetch(`/api/comments?slug=${slug}`, { cache: "no-store" })
    const d = await res.json()
    if (d.comments) setComments(d.comments)
  }

  async function handleSubmit() {
    if (!name || !text) return alert("Name aur comment likho")
    setLoading(true)
    const res = await fetch("/api/comments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ blog_slug: slug, name, comment: text }) })
    const d = await res.json()
    if (!res.ok) alert(d.error)
    else setSent(true)
    setLoading(false); setText(""); fetchComments()
  }

  return (
    <div className="mt-10 bg-white rounded-[24px] p-6 border">
      <h3 className="text-xl font-black mb-4">💬 Comments ({comments.length})</h3>
      <div className="bg-[#fff7e6] p-4 rounded-xl mb-6">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Your Name" className="w-full p-3 rounded-lg border mb-2" />
        <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Comment likho..." className="w-full p-3 rounded-lg border h-20" />
        <button onClick={handleSubmit} className="w-full bg-black text-white p-3 rounded-full font-bold mt-2">{loading? "Posting..." : "Post Comment"}</button>
        {sent && <p className="text-green-600 text-sm font-bold mt-2 text-center">✅ Comment bhej diya! Admin Approve ke baad dikhega.</p>}
      </div>
      <div className="space-y-3">
        {comments.map(c => (
          <div key={c.id} className="bg-gray-50 p-4 rounded-xl">
            <p className="font-bold text-sm">{c.name}</p>
            <p className="text-gray-700 mt-1">{c.comment}</p>
          </div>
        ))}
        {comments.length === 0 && <p className="text-gray-400 text-sm text-center">Abhi koi comment nahi hai.</p>}
      </div>
    </div>
  )
}
