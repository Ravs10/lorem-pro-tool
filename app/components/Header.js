"use client"
import Link from 'next/link'
import { useState } from 'react'
import { allTools } from '../data/tools' // auto list

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="bg-[#111] text-white border-b border-white/10 sticky top-0 z-50 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-6 h-[64px] flex justify-between items-center">
        <Link href="/" className="text-xl font-black tracking-tight">
          Lorem Pro Tool
        </Link>

        {/* Desktop - Purana Simple Style */}
        <nav className="hidden md:flex items-center gap-7 text-[14px] font-semibold">
          {allTools.slice(0, 4).map(t => (
            <Link key={t.href} href={t.href} className="text-zinc-400 hover:text-white transition">{t.name}</Link>
          ))}
          <Link href="/blog" className="text-zinc-400 hover:text-white transition">Blog</Link>
          <Link href="/contact" className="bg-white text-black px-5 py-2 rounded-full font-black hover:bg-orange-500 transition">Contact</Link>
        </nav>

        {/* Mobile - Hamburger */}
        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-2xl">
          {menuOpen? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Menu - Purana wala slide down */}
      {menuOpen && (
        <div className="md:hidden bg-[#1a1a1a] border-t border-white/10">
          <div className="px-6 py-6 space-y-2 max-h-[80vh] overflow-y-auto">
            {allTools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                onClick={() => setMenuOpen(false)}
                className="block py-3 px-4 rounded-xl hover:bg-white/10 text-sm font-bold"
              >
                {tool.name} {tool.hot && <span className="ml-2 text-[10px] bg-orange-500 text-black px-2 py-0.5 rounded-full">HOT</span>}
              </Link>
            ))}
            <Link href="/blog" onClick={() => setMenuOpen(false)} className="block py-3 px-4 rounded-xl bg-white text-black font-black text-center mt-4">Blog</Link>
          </div>
        </div>
      )}
    </header>
  )
}
