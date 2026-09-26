"use client";
import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 bg-black text-white">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="font-bold text-lg">⚡ Lorem Pro Tool</Link>
        <nav className="hidden md:flex gap-5 text-sm">
          <Link href="/all-tools">All Tools</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/privacy-policy">Privacy</Link>
        </nav>
        <button onClick={() => setOpen(!open)} className="md:hidden text-xl">☰</button>
      </div>
      {open && (
        <div className="md:hidden bg-zinc-900 px-4 pb-3 flex flex-col gap-2">
          <Link href="/all-tools" onClick={()=>setOpen(false)}>All Tools</Link>
          <Link href="/about" onClick={()=>setOpen(false)}>About</Link>
          <Link href="/contact" onClick={()=>setOpen(false)}>Contact</Link>
          <Link href="/privacy-policy" onClick={()=>setOpen(false)}>Privacy</Link>
        </div>
      )}
    </header>
  );
}
