'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function Comments({ slug }: { slug: string }) {
  const [comments, setComments] = useState<any[]>([])
  const [name, setName] = useState("")
  const [text, setText] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  useEffect(() => { fetchComments() }, [])

  async function fetchComments() {
    const { data } = await supabase.from('comments').select('*').eq('blog_slug', slug).eq('is_approved', true).order('created_at', { ascending: false })
    if (data) setComments(data)
  }

  async function handleSubmit() {
    if (!name || !text) return alert("Name aur comment likho")
    setLoading(true)
    // ✅ FIX: Ab comment Pending me jayega, Admin Approve karega tabhi dikhega
    const { error } = await supabase.from('comments').insert([{ blog_slug: slug, name, comment: text, is_approved: false }])
    if (error) alert(error.message)
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
