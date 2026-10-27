"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { createClient } from "@supabase/supabase-js"

type Tool = { id: string; name: string; slug: string }

export default function Header() {
  const [tools, setTools] = useState<Tool[]>([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    async function getTools() {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      if (!url || !key) return
      const supabase = createClient(url, key)
      const { data } = await supabase.from('tools').select('id,name,slug').eq('is_active', true).order('name')
      if (data) setTools(data as Tool[])
    }
    getTools()
  }, [])

  return (
    <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <img src="/logo.png" alt="logo" className="w-8 h-8 rounded" />
          Lorem Pro
        </Link>
        <button onClick={()=>setOpen(!open)} className="md:hidden text-2xl">{open ? '✕' : '☰'}</button>
        <nav className={`${open ? 'block' : 'hidden'} md:flex gap-4 absolute md:static top-14 left-0 bg-white w-full md:w-auto p-4 md:p-0 border md:border-0 shadow md:shadow-none`}>
          {tools.map(t => (
            <Link key={t.id} href={`/tools/${t.slug}`} onClick={()=>setOpen(false)} className="block py-2 hover:text-blue-600">{t.name}</Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
