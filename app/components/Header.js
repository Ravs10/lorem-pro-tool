"use client";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  if (pathname === "/") return null;

  return (
    <header className="sticky top-0 z-50 bg-black text-white">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">⚡ Lorem Pro Tools</Link>
        {/* Desktop */}
        <nav className="hidden md:flex gap-5 text-sm">
          <Link href="/all-tools">All Tools</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/disclaimer">Disclaimer</Link>
          <Link href="/privacy-policy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </nav>
        {/* Mobile */}
        <button onClick={() => setOpen(!open)} className="md:hidden text-2xl">☰</button>
      </div>
      {open && (
        <div className="md:hidden bg-zinc-900 px-4 pb-4 flex flex-col gap-3">
          <Link href="/all-tools" onClick={() => setOpen(false)}>All Tools</Link>
          <Link href="/about" onClick={() => setOpen(false)}>About</Link>
          <Link href="/contact" onClick={() => setOpen(false)}>Contact</Link>
          <Link href="/disclaimer" onClick={() => setOpen(false)}>Disclaimer</Link>
          <Link href="/privacy-policy" onClick={() => setOpen(false)}>Privacy Policy</Link>
          <Link href="/terms" onClick={() => setOpen(false)}>Terms</Link>
        </div>
      )}
    </header>
  );
}
