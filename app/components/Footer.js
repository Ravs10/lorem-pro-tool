"use client"
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Footer() {
  const [showAll, setShowAll] = useState(false)
  const [latestBlogs, setLatestBlogs] = useState([])
  const [allTools, setAllTools] = useState([])

  useEffect(()=>{
    async function fetchBlogs(){
      const { data } = await supabase
      .from('blogs')
      .select('title, slug')
      .order('created_at', { ascending: false })
      .limit(4)
      if (data) setLatestBlogs(data)
    }
    fetchBlogs()

    async function fetchTools(){
      const { data } = await supabase.from('tools').select('*').eq('is_active', true).order('name')
      if (data) setAllTools(data)
    }
    fetchTools()
  }, [])

  const INITIAL_COUNT = 3
const visibleTools = showAll ? allTools : allTools.slice(0, INITIAL_COUNT)
const remainingCount = allTools.length - INITIAL_COUNT
const showToggle = allTools.length > INITIAL_COUNT

  return (
    <footer className="mt-16">

      {/* ===== 1. HIRE ME SECTION ===== */}
      <div className="bg-gradient-to-br from-orange-500 via-[#ff6b00] to-[#ff3c00] relative overflow-hidden">
        <div className="relative max-w-6xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-black text-white px-4 py-1.5 rounded-full text-xs font-black tracking-widest mb-4">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                AVAILABLE FOR NEW PROJECTS
              </div>
              <h2 className="text-4xl md:text-5xl font-black leading-[0.9] text-black">
                Got an Idea? <br /><span className="text-white">Let's Build It.</span>
              </h2>
              <p className="text-black/80 font-medium mt-4 text-[15px] leading-relaxed">
                I don't just build apps. I build <b>money-making tools, high-converting websites, SaaS & automation systems</b> that save time & make you money.
              </p>
              <div className="flex flex-wrap gap-2 mt-5">
                {['Custom Tools', 'Websites', 'Web Apps', 'Mobile Apps', 'SaaS', 'AI Tools'].map((t) => (
                  <span key={t} className="bg-black text-white px-3 py-1 rounded-full text-xs font-bold border border-white/10">{t}</span>
                ))}
              </div>
            </div>

            <div className="bg-black rounded-[24px] p-7 border border-white/10 shadow-2xl">
              <h3 className="text-xl font-black text-white">What I Can Do For You 👇</h3>
              <ul className="mt-4 space-y-3 text-sm text-zinc-300">
                <li className="flex gap-3"><span className="text-orange-500">✓</span><span><b className="text-white">Custom Business Tools</b> — Like Lorem Pro</span></li>
                <li className="flex gap-3"><span className="text-orange-500">✓</span><span><b className="text-white">Lightning Fast Websites</b> — Next.js, SEO Ready</span></li>
                <li className="flex gap-3"><span className="text-orange-500">✓</span><span><b className="text-white">Web & Mobile Apps</b> — Idea to Play Store</span></li>
              </ul>
              <div className="grid grid-cols-2 gap-3 mt-6">
                <a href="https://wa.me/919999999999" target="_blank" className="bg-[#25D366] text-black text-center py-3 rounded-full font-black text-sm hover:scale-105 transition">WhatsApp Me</a>
                <a href="mailto:ravish@example.com" className="bg-white text-black text-center py-3 rounded-full font-black text-sm hover:bg-zinc-200 transition">Email Me</a>
              </div>
              <p className="text-center text-[11px] text-zinc-500 mt-3">⚡ REPLY IN 2 HOURS • 100% CONFIDENTIAL</p>
            </div>
          </div>
        </div>
      </div>

      {/* ===== 2. ORANGE ALL TOOLS - CLICK TO OPEN ===== */}
      <div className="bg-[#fffaf0] border-t">
        <div className="max-w-6xl mx-auto px-6 py-10">

          <div className="bg-[#fff7e6] border-2 border-orange-100 rounded-[28px] p-6 md:p-8">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
              <div className="flex items-center gap-3">
                <h4 className="text-xl font-black tracking-widest">ALL TOOLS</h4>
                <span className="bg-orange-500 text-black text-[11px] font-black px-3 py-1 rounded-full animate-pulse">OPEN • LIVE</span>
              </div>
              {/*{showToggle && (
              <button
                onClick={() => setShowAll(!showAll)}
                className="bg-black text-white px-5 py-2 rounded-full text-xs font-black hover:bg-orange-500 hover:text-black transition-all"
              >
                {showAll? 'Show Less ▲' : `More (${remainingCount}) ▼`}
              </button>
) } */} 
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {visibleTools.map((tool) => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="group relative bg-white border border-orange-200 px-6 py-3 rounded-full text-[15px] font-bold hover:bg-black hover:text-white hover:border-black hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
                >
                  {tool.name}
                  {tool.hot && <span className="absolute -top-2.5 -right-2 bg-orange-500 text-black text-[10px] font-black px-2 py-0.5 rounded-full">HOT</span>}
                </Link>
              ))}
            </div>

            {showToggle && (
  <button onClick={() => setShowAll(!showAll)} className="mt-6 w-full bg-white border-2 border-dashed border-orange-300 py-3 rounded-full font-black text-sm hover:bg-orange-500 hover:text-black transition-all">
    {showAll? '- Show Less' : `+ View All ${allTools.length} Tools`}
  </button>
)}
          </div>

          {/* Latest Blogs Auto + Brand */}
          <div className="grid md:grid-cols-2 gap-8 mt-10">
            <div>
              <h4 className="text-lg font-black tracking-widest mb-4">LATEST BLOGS 🔥</h4>
              <div className="space-y-3">
                {latestBlogs.length > 0? latestBlogs.map((b) => (
                  <Link key={b.slug} href={`/blog/${b.slug}`} className="block bg-white border p-4 rounded-2xl hover:border-orange-500 hover:shadow-md transition group">
                    <p className="text-sm font-bold group-hover:text-orange-500 transition line-clamp-1">→ {b.title}</p>
                  </Link>
                )) : <p className="text-sm text-zinc-500">Loading blogs...</p>}
                <Link href="/blog" className="inline-block mt-2 text-orange-500 font-black text-sm hover:underline">View All Blogs →</Link>
              </div>
            </div>

            <div className="bg-zinc-900 text-zinc-400 rounded-[24px] p-7">
              <p className="text-white font-black text-lg">Lorem Pro Tool</p>
              <p className="text-sm mt-3 leading-relaxed">Free, fast & private tools for writers, developers & creators. No login, no tracking. Built with ❤️ by Ravish.</p>
                                                         {/* <div className="flex gap-4 mt-6 text-xs font-bold">
                <Link href="/" className="hover:text-orange-500">Home</Link>
                <Link href="/blog" className="hover:text-orange-500">Blog</Link>
                <Link href="/privacy" className="hover:text-orange-500">Privacy</Link>
                <Link href="/contact" className="hover:text-orange-500">Contact</Link>
              </div>*/} 
<div className="flex gap-4 mt-6 text-xs font-bold items-center flex-wrap">
  <Link href="/" className="bg-orange-500 text-black px-5 py-2 rounded-full text-sm font-black animate-pulse hover:bg-white hover:scale-105 transition-all shadow-[0_0_15px_rgba(255,165,0,0.5)]">
    ⚡ Home
  </Link>
  <Link href="/blog" className="hover:text-orange-500">Blog</Link>
  <Link href="/privacy" className="hover:text-orange-500">Privacy Policy</Link>
  <Link href="/disclaimer" className="hover:text-orange-500">Disclaimer</Link>
  <Link href="/contact" className="hover:text-orange-500">Contact</Link>
</div>
            </div>
          </div>

        </div>
        <div className="text-center text-[11px] text-zinc-500 py-6 border-t border-orange-100">
          © {new Date().getFullYear()} Lorem Pro Tool • Built by Ravish
        </div>
      </div>
    </footer>
  )
}
