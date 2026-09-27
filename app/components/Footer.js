'use client';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="relative mt-16 bg-[#0a0a0a] border-t border-zinc-900 overflow-hidden">
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-orange-600/15 rounded-full blur-[90px] animate-pulse pointer-events-none"></div>
      <div className="relative max-w-7xl mx-auto px-6 py-10 grid gap-6">
        <div className="rounded-[20px] p-[1.5px] bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600 shadow-[0_0_30px_rgba(249,115,22,0.25)]">
          <div className="rounded-[18px] bg-zinc-950 p-5">
            <h4 className="text-white font-bold mb-3 flex items-center gap-2">🔥 All Tools <span className="w-2 h-2 bg-orange-400 rounded-full animate-ping"></span></h4>
            <div className="flex flex-wrap gap-2.5">
              <Link href="/fake-data-generator" className="px-4 py-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold text-sm">Fake Data Generator</Link>
              <Link href="/password-generator" className="px-4 py-2 rounded-full bg-zinc-900 border border-zinc-700 text-white text-sm">Password Generator</Link>
              <Link href="/" className="px-4 py-2 rounded-full bg-white text-black font-bold text-sm">View All →</Link>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800 p-4">
            <h4 className="text-white font-bold mb-3">📝 Blog</h4>
            <div className="space-y-2 text-sm text-zinc-400">
              <Link href="/#blog" className="block hover:text-orange-400">→ Password Tips</Link>
              <Link href="/#blog" className="block hover:text-orange-400">→ Fake Data Uses</Link>
            </div>
          </div>
          <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800 p-4">
            <h4 className="text-white font-bold mb-3">⚖️ Legal</h4>
            <div className="space-y-2 text-sm text-zinc-400">
              <Link href="/privacy" className="block hover:text-white">Privacy Policy</Link>
              <Link href="/disclaimer" className="block hover:text-orange-400 font-medium">Disclaimer</Link>
              <Link href="/contact" className="block hover:text-white">Contact</Link>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-zinc-900/30 border border-zinc-800/50 p-3">
          <p className="text-[11px] text-zinc-500 leading-relaxed text-center"><span className="text-zinc-300 font-semibold">Disclaimer:</span> All tools are for educational & testing purposes only. We do not store any generated data. Use responsibly.</p>
        </div>
        <p className="text-center text-zinc-600 text-[11px]">© {new Date().getFullYear()} Lorem Pro Tool</p>
      </div>
    </footer>
  )
}
