'use client';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="relative mt-16 bg-[#0a0a0a] border-t border-zinc-900 overflow-hidden">
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-violet-600/15 rounded-full blur-[80px] animate-pulse pointer-events-none"></div>

      <div className="relative max-w-7xl mx-auto px-6 py-10 grid gap-8">

        {/* All Tools - Highlight */}
        <div className="rounded-2xl p-[1px] bg-gradient-to-r from-violet-600 to-fuchsia-600">
          <div className="rounded-2xl bg-zinc-950 p-4">
            <h4 className="text-white font-bold mb-3 flex items-center gap-2">🚀 All Tools <span className="w-2 h-2 bg-green-400 rounded-full animate-ping"></span></h4>
            <div className="flex flex-wrap gap-2">
              <Link href="/fake-data-generator" className="px-4 py-2 rounded-full bg-white text-black font-semibold text-sm hover:scale-105 transition-transform">Fake Data</Link>
              <Link href="/password-generator" className="px-4 py-2 rounded-full bg-zinc-900 border border-zinc-700 text-white text-sm hover:bg-violet-600 transition-colors">Password Generator</Link>
            </div>
          </div>
        </div>

        {/* Blog - Different Animation */}
        <div className="rounded-2xl bg-zinc-900/50 border border-zinc-800 p-4 hover:border-white/20 transition-all group">
          <h4 className="text-white font-bold mb-3 group-hover:translate-x-1 transition-transform">📝 Blog</h4>
          <div className="space-y-2 text-sm text-zinc-400">
            <Link href="/#blog" className="block hover:text-white hover:translate-x-1 transition-all">→ How to generate secure passwords?</Link>
            <Link href="/#blog" className="block hover:text-white hover:translate-x-1 transition-all">→ What is fake data used for?</Link>
          </div>
        </div>

        <p className="text-center text-zinc-600 text-xs pt-6 border-t border-zinc-900">© {new Date().getFullYear()} Lorem Pro Tool • Beautiful • Fast • Free</p>
      </div>
    </footer>
  )
}
