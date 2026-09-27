"use client"
import Link from 'next/link'
import { useState } from 'react'
import { allTools } from '../data/tools'

export default function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-[#0f0f0f] border-b border-white/5">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-black text-white text-lg">
          Lorem Pro Tool
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm">
          {allTools.slice(0, 4).map(t => (
            <Link key={t.href} href={t.href} className="text-zinc-400 hover:text-white font-medium transition">
              {t.name}
            </Link>
          ))}
          <Link href="/blog" className="text-zinc-400 hover:text-white font-medium transition">Blog</Link>
          <Link href="/contact" className="bg-white text-black px-5 py-2 rounded-full font-bold">Contact</Link>
        </div>

        <button onClick={() => setOpen(!open)} className="md:hidden text-white text-2xl">
          {open ? '✕' : '☰'}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-[#0f0f0f] border-t border-white/10 px-6 py-6 space-y-1">
          {allTools.map(t => (
            <Link key={t.href} href={t.href} onClick={()=>setOpen(false)} className="block py-3 text-zinc-300 hover:text-white border-b border-white/5 text-sm">
              {t.name}
            </Link>
          ))}
          <Link href="/blog" onClick={()=>setOpen(false)} className="block py-3 text-white font-bold">Blog →</Link>
        </div>
      )}
    </header>
  )
}
