"use client"
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const allTools = [
  { name: 'Lorem Generator', href: '/', hot: true },
  { name: 'Character Counter', href: '/character-counter' },
  { name: 'Word Counter', href: '/word-counter' },
  { name: 'Case Converter', href: '/case-converter' },
  { name: 'Remove Duplicates', href: '/remove-duplicates' },
  { name: 'Text to Handwriting', href: '/text-to-handwriting' },
  { name: 'Fancy Text', href: '/fancy-text' },
  { name: 'Image to Text', href: '/image-to-text' },
  { name: 'Fake Data Generator', href: '/fake-data-generator', hot: true },
  { name: 'Password Generator', href: '/password-generator', hot: true },
]

export default function Footer() {
  const [showAll, setShowAll] = useState(false)
  const [latestBlogs, setLatestBlogs] = useState([])

  useEffect(() => {
    async function fetchBlogs() {
      const { data } = await supabase.from('blogs').select('title, slug').order('created_at', { ascending: false }).limit(4)
      if (data) setLatestBlogs(data)
    }
    fetchBlogs()
  }, [])

  const visibleTools = showAll? allTools : allTools.slice(0, 3)

  return (
    <footer className="mt-16">

      {/* 1. HIRE ME SECTION - Same Beautiful */}
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
              <p className="text-black/80 font-medium mt-4 text-[15px]">Tools, Websites, Web Apps, Mobile Apps, SaaS & AI Automation — I build everything.</p>
            </div>
            <div className="bg-black rounded-[24px] p-7 border border-white/10 shadow-2xl">
              <h3 className="text-xl font-black text-white">What I Can Do For You 👇</h3>
              <ul className="mt-4 space-y-3 text-sm text-zinc-300">
                <li>✓ <b className="text-white">Custom Tools</b> — Like Lorem Pro</li>
                <li>✓ <b className="text-white">Websites & Apps</b> — Next.js + SEO</li>
                <li>✓ <b className="text-white">SaaS & Automation</b> — Make Money</li>
              </ul>
              <div className="grid grid-cols-2 gap-3 mt-6">
                <a href="https://wa.me/919999999999" target="_blank" className="bg-[#25D366] text-black text-center py-3 rounded-full font-black text-sm">WhatsApp Me</a>
                <a href="mailto:ravish@example.com" className="bg-white text-black text-center py-3 rounded-full font-black text-sm">Email Me</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. OLD ORANGE FOOTER WITH CLICK-TO-OPEN */}
      <div className="bg-[#fffaf0] border-t">
        <div className="max-w-6xl mx-auto px-6 py-10">

          <div className="bg-[#fff7e6] border-2 border-orange-100 rounded-[28px] p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h4 className="text-xl font-black tracking-widest">ALL TOOLS</h4>
                <span className="bg-orange-400 text-black text-[11px] font-black px-3 py-1 rounded-full">OPEN • LIVE</span>
              </div>
              <button
                onClick={() => setShowAll(!showAll)}
                className="bg-black text-white px-5 py-2 rounded-full text-xs font-black hover:bg-orange-500 hover:text-black transition-all"
              >
                {showAll? 'Show Less ▲' : `More (${allTools.length - 3}) ▼`}
              </button>
            </div>

            {/* Tools List - Click to Expand Logic */}
            <div className="flex flex-wrap gap-3 transition-all duration-500">
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

            {!showAll && (
              <button onClick={() => setShowAll(true)} className="mt-6 w-full bg-white border-2 border-dashed border-orange-300 py-3 rounded-full font-black text-sm hover:bg-orange-500 hover:text-black hover:border-orange-500 transition">
                + View All {allTools.length} Tools
              </button>
            )}
          </div>

          {/* Blog Auto */}
          <div className="grid md:grid-cols-2 gap-8 mt-10">
            <div>
              <h4 className="text-lg font-black tracking-widest mb-4">LATEST BLOGS 🔥</h4>
              <div className="space-y-3">
                {latestBlogs.map((b) => (
                  <Link key={b.slug} href={`/blog/${b.slug}`} className="block bg-white border p-4 rounded-2xl hover:border-orange-500 hover:shadow-md transition group">
                    <p className="text-sm font-bold group-hover:text-orange-500 line-clamp-1">→ {b.title}</p>
                  </Link>
                ))}
                <Link href="/blog" className="inline-block mt-2 text-orange-500 font-black text-sm hover:underline">View All Blogs →</Link>
              </div>
            </div>
            <div className="bg-zinc-900 text-zinc-400 rounded-[24px] p-7">
              <p className="text-white font-black text-lg">Lorem Pro Tool</p>
              <p className="text-sm mt-3">Free, fast & private tools. No login, no tracking. Built with ❤️ by Ravish.</p>
              <div className="flex gap-4 mt-6 text-xs font-bold">
                <Link href="/" className="hover:text-orange-500">Home</Link>
                <Link href="/blog" className="hover:text-orange-500">Blog</Link>
                <Link href="/privacy" className="hover:text-orange-500">Privacy</Link>
              </div>
            </div>
          </div>
        </div>
        <div className="text-center text-[11px] text-zinc-500 py-6 border-t border-orange-100">© {new Date().getFullYear()} Lorem Pro Tool</div>
      </div>
    </footer>
  )
}
