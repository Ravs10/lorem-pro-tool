'use client';
import { useState } from 'react';
import Link from 'next/link';
import { allTools } from '../data/tools'; // auto list

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-xl border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-white font-bold text-[22px]">
          <span className="animate-pulse">⚡</span> Lorem Pro Tool
        </Link>
        <button onClick={() => setOpen(!open)} className="text-white text-3xl">{open? '✕' : '☰'}</button>
      </div>

      {open && (
        <nav className="bg-[#111] border-t border-zinc-800 px-4 py-4 space-y-3 max-h-[80vh] overflow-y-auto">

          {/* ALL TOOLS HEADER - Same your gradient design */}
          <div className="px-4 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white font-bold shadow-[0_0_25px_rgba(249,115,22,0.6)] flex justify-between items-center">
            <span>🔥 All Tools ({allTools.length})</span>
            <span className="text-[10px] bg-white text-orange-600 px-2.5 py-1 rounded-full font-extrabold animate-bounce">HOT</span>
          </div>

          {/* AUTO TOOLS LIST - Same design family */}
          <div className="grid gap-2">
            {allTools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                onClick={()=>setOpen(false)}
                className="flex items-center justify-between px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 hover:bg-white hover:text-black hover:border-white transition-all duration-300 group"
              >
                <span className="text-sm font-semibold">{tool.name}</span>
                <span className="flex items-center gap-2">
                  {tool.hot && <span className="text-[9px] bg-orange-500 text-black px-2 py-0.5 rounded-full font-black">HOT</span>}
                  <span className="text-zinc-500 group-hover:text-black group-hover:translate-x-1 transition">→</span>
                </span>
              </Link>
            ))}
          </div>

          <div className="h-[1px] bg-zinc-800 my-3"></div>

          {/* Rest same as your design */}
          <Link href="/#blog" onClick={()=>setOpen(false)} className="block px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300">📝 Blog</Link>
          <Link href="/about" onClick={()=>setOpen(false)} className="block px-4 py-3 text-zinc-400 hover:text-white">About</Link>
          <Link href="/contact" onClick={()=>setOpen(false)} className="block px-4 py-3 text-zinc-400 hover:text-white">Contact</Link>
          <Link href="/privacy" onClick={()=>setOpen(false)} className="block px-4 py-3 text-zinc-400 hover:text-white">Privacy Policy</Link>
          <Link href="/disclaimer" onClick={()=>setOpen(false)} className="block px-4 py-3 text-zinc-400 hover:text-white">Disclaimer</Link>
        </nav>
      )}
    </header>
  )
}
