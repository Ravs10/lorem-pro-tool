'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function Header() {
  const [open, setOpen] = useState(false);
  const [tools, setTools] = useState([]);

  useEffect(() => {
    supabase.from('tools').select('*').eq('is_active', true).then(({data})=>{ if(data) setTools(data) });
  }, [open]);

  return (
    <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-xl border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-white font-bold text-[22px]"><span className="animate-pulse">⚡</span> Lorem Pro Tool</Link>
        <button onClick={() => setOpen(!open)} className="text-white text-3xl">{open?'✕':'☰'}</button>
      </div>
      {open && (
        <nav className="bg-[#111] border-t border-zinc-800 px-4 py-4 space-y-3 max-h-[80vh] overflow-y-auto">
          <div className="px-4 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white font-bold flex justify-between">
            <span>🔥 All Tools ({tools.length})</span>
            <span className="text-[10px] bg-white text-orange-600 px-2.5 py-1 rounded-full font-extrabold animate-bounce">HOT</span>
          </div>
          <div className="grid gap-2">
            {tools.map(t=>(
              <Link key={t.id} href={t.href} onClick={()=>setOpen(false)} className="px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 hover:bg-white hover:text-black text-sm font-semibold flex justify-between">
                {t.name} <span>→</span>
              </Link>
            ))}
          </div>
          <div className="h-[1px] bg-zinc-800"></div>
          <Link href="/about" onClick={()=>setOpen(false)} className="block px-4 py-3 text-zinc-400">About</Link>
          <Link href="/contact" onClick={()=>setOpen(false)} className="block px-4 py-3 text-zinc-400">Contact</Link>
        </nav>
      )}
    </header>
  )
}
