'use client';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function Header() {
  const [open, setOpen] = useState(false);
  const [tools, setTools] = useState<any[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    if(open){
      // FIX: Auto update - is_active true wale saare tools, order by name
      supabase.from('tools').select('*').eq('is_active', true).order('name', {ascending: true}).then(({data})=>{
        if(data) setTools(data)
      });
    }
  }, [open]);

  const filtered = useMemo(() => {
    if(!q.trim()) return tools;
    const s = q.toLowerCase();
    return tools.filter(t => t.name.toLowerCase().includes(s) || (t.href||t.slug||"").toLowerCase().includes(s));
  }, [tools, q]);

  return (
    <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-xl border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-white font-bold text-[22px]"><span className="animate-pulse">⚡</span> Lorem Pro Tool</Link>
        <button onClick={() => setOpen(!open)} className="text-white text-3xl">{open?'✕':'☰'}</button>
      </div>
      {open && (
        <nav className="bg-[#111] border-t border-zinc-800 flex flex-col h-[calc(100dvh-60px)]">

          {/* SEARCH BAR - NAYA */}
          <div className="p-4 shrink-0 space-y-3">
            <div className="relative">
              <input
                value={q}
                onChange={(e)=>setQ(e.target.value)}
                placeholder="🔍 Search tools... ex: QR"
                className="w-full h-11 bg-zinc-900 border border-zinc-800 rounded-full pl-5 pr-10 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-orange-500"
              />
              {q && <button onClick={()=>setQ("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500">✕</button>}
            </div>
            <div className="px-4 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white font-bold flex justify-between">
              <span>🔥 All Tools ({filtered.length})</span>
              <span className="text-[10px] bg-white text-orange-600 px-2.5 py-1 rounded-full font-extrabold animate-bounce">HOT</span>
            </div>
          </div>

          {/* TOOLS LIST - SCROLLABLE, KITNI BHI LAMBI HO */}
          <div className="flex-1 overflow-y-auto px-4 space-y-2 pb-4 custom-scrollbar">
            <div className="grid gap-2">
              {filtered.map(t=>(
                <Link key={t.id || t.slug} href={t.href || `/${t.slug}`} onClick={()=>setOpen(false)} className="px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 hover:bg-white hover:text-black text-sm font-semibold flex justify-between">
                  <span className="truncate">{t.name}</span> <span className="ml-2">→</span>
                </Link>
              ))}
            </div>
            {filtered.length === 0 && <p className="text-center text-zinc-500 text-sm py-10">No tool found for "{q}"</p>}
          </div>

          {/* STATIC PAGES - FIXED, GAYAB NAHI HONGE */}
          <div className="shrink-0 border-t border-zinc-800 bg-[#111] px-4 py-3 space-y-1">
            <Link href="/about" onClick={()=>setOpen(false)} className="block px-4 py-3 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-900">About</Link>
            <Link href="/contact" onClick={()=>setOpen(false)} className="block px-4 py-3 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-900">Contact</Link>
            <Link href="/disclaimer" onClick={()=>setOpen(false)} className="block px-4 py-3 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-900">Disclaimer</Link>
            <Link href="/privacy-policy" onClick={()=>setOpen(false)} className="block px-4 py-3 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-900">Privacy Policy</Link>
          </div>
        </nav>
      )}
      <style>{`.custom-scrollbar::-webkit-scrollbar{width:4px}.custom-scrollbar::-webkit-scrollbar-thumb{background:#27272a;border-radius:10px}`}</style>
    </header>
  )
}
