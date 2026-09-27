'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-xl border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-white font-bold text-[22px]">
          <span className="animate-pulse">⚡</span> Lorem Pro Tool
        </Link>
        <button onClick={() => setOpen(!open)} className="text-white text-3xl">☰</button>
      </div>
      {open && (
        <nav className="bg-[#111] border-t border-zinc-800 px-4 py-4 space-y-2">
          <Link href="/tools" onClick={()=>setOpen(false)} className="flex items-center justify-between px-4 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white font-bold shadow-[0_0_25px_rgba(249,115,22,0.6)] animate-pulse">
            <span>🔥 All Tools</span>
            <span className="text-[10px] bg-white text-orange-600 px-2.5 py-1 rounded-full font-extrabold animate-bounce">HOT</span>
          </Link>
          <Link href="/blog" onClick={()=>setOpen(false)} className="block px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300">📝 Blog</Link>
          <Link href="/about" onClick={()=>setOpen(false)} className="block px-4 py-3 text-zinc-400">About</Link>
          <Link href="/contact" onClick={()=>setOpen(false)} className="block px-4 py-3 text-zinc-400">Contact</Link>
          <Link href="/privacy" onClick={()=>setOpen(false)} className="block px-4 py-3 text-zinc-400">Privacy Policy</Link>
          <Link href="/disclaimer" onClick={()=>setOpen(false)} className="block px-4 py-3 text-zinc-400">Disclaimer</Link>
        </nav>
      )}
    </header>
  )
}
