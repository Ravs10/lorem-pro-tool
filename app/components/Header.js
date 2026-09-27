"use client"
import Link from 'next/link'
import { useState } from 'react'
import { allTools } from '../data/tools'

export default function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="bg-[#1a0f0a] text-white sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-2xl font-black">
          <span>⚡</span> Lorem Pro Tool
        </Link>

        <nav className="hidden md:flex gap-6 text-sm font-bold items-center">
          {allTools.slice(0, 3).map(t => (
            <Link key={t.href} href={t.href} className="hover:text-orange-400">{t.name}</Link>
          ))}
          <Link href="/blog" className="hover:text-orange-400">Blog</Link>
          <button onClick={() => setOpen(!open)} className="bg-orange-500 text-black px-4 py-1.5 rounded-full">
            All Tools ▼
          </button>
        </nav>

        <button onClick={() => setOpen(!open)} className="md:hidden text-3xl">☰</button>
      </div>

      {open && (
        <div className="bg-[#fffaf0] text-black border-t max-h-[70vh] overflow-y-auto">
          <div className="max-w-6xl mx-auto px-6 py-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {allTools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                onClick={() => setOpen(false)}
                className="bg-white border border-orange-200 px-5 py-3 rounded-full font-bold hover:bg-black hover:text-white transition flex justify-between items-center"
              >
                {tool.name}
                {tool.hot && <span className="bg-orange-500 text-[10px] px-2 py-0.5 rounded-full text-black font-black">HOT</span>}
              </Link>
            ))}
            <Link href="/blog" onClick={() => setOpen(false)} className="bg-black text-white px-5 py-3 rounded-full font-black text-center sm:col-span-2">
              📝 Go to Blog →
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
