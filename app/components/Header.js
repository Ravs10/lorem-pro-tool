"use client"
import Link from 'next/link'
import { useState } from 'react'
import { allTools } from '../data/tools'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="bg-[#0e0e0e]/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-[68px] flex justify-between items-center">
        <Link href="/" className="text-[22px] font-black tracking-tighter flex items-center gap-2 group">
          <span className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-black group-hover:rotate-12 transition-transform duration-300">⚡</span>
          Lorem Pro Tool
        </Link>

        {/* Desktop - Card Pills with Animation */}
        <nav className="hidden md:flex items-center gap-2">
          {allTools.slice(0, 3).map(t => (
            <Link key={t.href} href={t.href} className="px-4 py-2 rounded-full text-[13px] font-bold text-zinc-400 hover:text-white hover:bg-white/10 transition-all duration-300 hover:-translate-y-0.5">
              {t.name}
            </Link>
          ))}
          <div className="w-[1px] h-6 bg-white/10 mx-2"></div>
          <Link href="/blog" className="px-4 py-2 rounded-full text-[13px] font-bold text-zinc-400 hover:text-white hover:bg-white/10 transition">Blog</Link>
          <Link href="/contact" className="ml-2 bg-white text-black px-6 py-2.5 rounded-full font-black text-[13px] hover:bg-orange-500 hover:scale-105 transition-all duration-300 shadow-lg">
            Hire Me →
          </Link>
        </nav>

        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-lg hover:bg-white hover:text-black transition-all duration-300">
          <span className={`transition-transform duration-300 ${menuOpen? 'rotate-90' : ''}`}>{menuOpen? '✕' : '☰'}</span>
        </button>
      </div>

      {/* Mobile - Smooth Card Animation */}
      <div className={`md:hidden overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${menuOpen? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="bg-[#fffaf0] m-3 rounded-[24px] p-4 border-2 border-orange-100 shadow-2xl">
          <p className="text-[11px] font-black tracking-widest text-zinc-500 mb-3 px-2">ALL TOOLS • {allTools.length}</p>
          <div className="grid grid-cols-1 gap-2.5">
            {allTools.map((tool, i) => (
              <Link
                key={tool.href}
                href={tool.href}
                onClick={() => setMenuOpen(false)}
                style={{ transitionDelay: `${i * 30}ms` }}
                className={`group bg-white border border-orange-100 px-5 py-3.5 rounded-2xl font-bold text-[14px] flex justify-between items-center hover:bg-black hover:text-white hover:border-black hover:-translate-y-1 hover:shadow-xl transition-all duration-300 ${menuOpen? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
              >
                <span>{tool.name}</span>
                <span className="flex items-center gap-2">
                  {tool.hot && <span className="bg-orange-500 text-black text-[9px] font-black px-2 py-1 rounded-full">HOT</span>}
                  <span className="group-hover:translate-x-1 transition">→</span>
                </span>
              </Link>
            ))}
          </div>
          <Link href="/blog" onClick={() => setMenuOpen(false)} className="mt-4 bg-black text-white py-4 rounded-2xl font-black text-center block hover:bg-orange-500 hover:text-black transition-all duration-300">
            📝 View All Blogs →
          </Link>
        </div>
      </div>
    </header>
  )
}
