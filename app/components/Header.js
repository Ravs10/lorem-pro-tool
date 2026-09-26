{/*"use client";
import Link from "next/link";
import { useState } from "react";*/} 
"use client";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

export default function Header() {
  const [open, setOpen] = useState(false);
    const pathname = usePathname();
  if (pathname === "/") return null;
  return (
    <header className="sticky top-0 z-50 bg-black/80 backdrop-blur border-b border-zinc-800">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-white">⚡ Lorem Pro Tools</Link>
        
        {/* Desktop */}
        <nav className="hidden md:flex items-center gap-6 text-sm text-gray-300">
          <Link href="/all-tools" className="hover:text-white">All Tools</Link>
          <Link href="/about" className="hover:text-white">About</Link>
          <Link href="/contact" className="hover:text-white">Contact</Link>
          <Link href="/disclaimer" className="hover:text-white">Disclaimer</Link>
          <Link href="/privacy-policy" className="hover:text-white">Privacy Policy</Link>
        </nav>

        {/* Mobile */}
        <button onClick={()=>setOpen(!open)} className="md:hidden text-white text-2xl">☰</button>
      </div>
      {open && (
        <div className="md:hidden bg-zinc-900 border-t border-zinc-800 px-4 py-3 flex flex-col gap-3 text-sm text-gray-300">
          <Link href="/all-tools" onClick={()=>setOpen(false)}>✨ All Tools</Link>
          <Link href="/about" onClick={()=>setOpen(false)}>About</Link>
          <Link href="/contact" onClick={()=>setOpen(false)}>Contact</Link>
          <Link href="/disclaimer" onClick={()=>setOpen(false)}>Disclaimer</Link>
          <Link href="/privacy-policy" onClick={()=>setOpen(false)}>Privacy Policy</Link>
          <Link href="/terms" onClick={()=>setOpen(false)}>Terms</Link>
        </div>
      )}
    </header>
  );
}
