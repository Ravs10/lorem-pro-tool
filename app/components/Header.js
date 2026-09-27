'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-white font-bold text-[22px]">
          <span className="animate-[pulse_1.5s_infinite]">⚡</span> Lorem Pro Tool
        </Link>
        <button onClick={() => setOpen(!open)} className="text-white text-3xl">☰</button>
      </div>

      {open && (
        <nav className="bg-[#121212] border-t border-zinc-800 px-4 py-3 space-y-1 animate-[slideDown_0.3s_ease]">
          <Link href="/" onClick={()=>setOpen(false)} className="flex items-center justify-between px-3 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold shadow-[0_0_20px_rgba(124,58,237,0.6)] animate-pulse">
            <span>✨ All Tools</span> <span className="text-xs bg-white text-violet-600 px-2 py-0.5 rounded-full animate-bounce">NEW</span>
          </Link>
          <Link href="/#blog" onClick={()=>setOpen(false)} className="block px-3 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-violet-500 hover:translate-x-1 transition-all">
            📝 Blog
          </Link>
          <Link href="/about" onClick={()=>setOpen(false)} className="block px-3 py-3 text-zinc-400 hover:text-white">About</Link>
          <Link href="/contact" onClick={()=>setOpen(false)} className="block px-3 py-3 text-zinc-400 hover:text-white">Contact</Link>
          <Link href="/privacy" onClick={()=>setOpen(false)} className="block px-3 py-3 text-zinc-400 hover:text-white">Privacy</Link>
        </nav>
      )}
      <style>{`@keyframes slideDown{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </header>
  )
}
