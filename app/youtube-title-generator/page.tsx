"use client"
import { useState, useRef } from 'react'

export default function YouTubeGenerator() {
  const [keyword, setKeyword] = useState("")
  const [niche, setNiche] = useState("General")
  const [tone, setTone] = useState("Viral")
  const [theme, setTheme] = useState("dark")
  const [result, setResult] = useState(null)
  const [copied, setCopied] = useState("")

  // Sound Effect
  const playSound = (freq = 800) => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.type = "sine"
      o.frequency.value = freq
      o.connect(g)
      g.connect(ctx.destination)
      g.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.3)
      o.start()
      o.stop(ctx.currentTime + 0.3)
    } catch {}
  }

  const generateData = () => {
    if (!keyword.trim()) return alert("Please enter video topic!")
    playSound(600)
    
    const k = keyword.trim()
    const titles = [
      `I Tried ${k} for 24 Hours - You Won't Believe What Happened!`,
      `${k}: 5 Mistakes 99% Beginners Make (Avoid These!)`,
      `This ${k} Trick Got Me 1M Views in 7 Days!`,
      `Why ${k} is CHANGING Everything in 2026 - Full Guide`,
      `${k} Explained in 10 Minutes - Complete ${niche} Tutorial`,
    ]

    const descriptions = `🚀 In this video, we are covering ${k} - The ultimate guide for ${niche} lovers!

📌 WHAT YOU'LL LEARN:
✓ What is ${k} and why it matters in ${tone} way
✓ Step by step process
✓ My secret tools & templates

🔗 TOOLS I USE:
• Thumbnail Maker - https://loremprotool.com
• Keyword Research - VidIQ

👉 SUBSCRIBE for more ${niche} content: [Your Channel Link]

#${k.replace(/\s+/g,'')} #${niche} #youtubeTips

TIMESTAMPS:
00:00 Intro
00:45 What is ${k}?
02:30 Main Tutorial
05:00 Bonus Trick

DISCLAIMER: This video is for educational purpose.
`

    const tags = [
      k.toLowerCase(),
      `${k} tutorial`,
      `${k} for beginners`,
      `${k} 2026`,
      `${niche} tips`,
      `how to ${k}`,
      `viral ${k}`,
      `${k} explained`,
      `youtube ${niche}`,
      `best ${k}`,
      `${k} guide`,
      `${k} tricks`,
      `${k} shorts`,
      `${k.toLowerCase().replace(/\s+/g, '')}`,
      `learn ${k}`
    ]

    const hashtags = `#${k.replace(/\s+/g,'')} #${niche} #${tone}Viral #YouTubeGrowth #ContentCreator`

    setResult({ titles, descriptions, tags, hashtags })
  }

  const copyText = (text, id) => {
    navigator.clipboard.writeText(text)
    playSound(1000)
    setCopied(id)
    setTimeout(()=> setCopied(""), 2000)
  }

  const isDark = theme === "dark"

  return (
    <div className={`${isDark ? 'bg-[#0a0a0a] text-white' : 'bg-[#fffaf0] text-black'} min-h-screen transition-all duration-500 font-sans`}>
      <style>{`
        @keyframes float { 0%,100% {transform: translateY(0)} 50% {transform: translateY(-10px)} }
        @keyframes glow { 0%,100% {box-shadow: 0 0 20px rgba(255,107,0,0.3)} 50% {box-shadow: 0 0 40px rgba(255,107,0,0.6)} }
        .float { animation: float 3s ease-in-out infinite }
        .glow { animation: glow 2s ease-in-out infinite }
        .glass { backdrop-filter: blur(12px); }
      `}</style>

      {/* HEADER */}
      <header className={`sticky top-0 z-50 ${isDark ? 'bg-black/80' : 'bg-white/80'} glass border-b ${isDark ? 'border-zinc-800' : 'border-orange-100'}`}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-black tracking-widest">YT <span className="text-orange-500">GEN</span> PRO</h1>
          <div className="flex gap-3 items-center">
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-orange-500 text-black">AdSense Ready</span>
            <button onClick={()=>{ setTheme(isDark?'light':'dark'); playSound(400)}} className={`w-12 h-7 rounded-full p-1 transition ${isDark?'bg-zinc-800':'bg-orange-200'} flex ${isDark?'justify-end':'justify-start'}`}>
              <div className="w-5 h-5 bg-white rounded-full shadow-md"></div>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8 grid lg:grid-cols-[1fr_300px] gap-8">
        
        {/* LEFT MAIN */}
        <div>
          {/* Ad Slot Top */}
          <div className={`h-[90px] rounded-2xl border-2 border-dashed ${isDark?'border-zinc-700 bg-zinc-900/50':'border-orange-200 bg-orange-50'} flex items-center justify-center text-xs text-zinc-500 mb-6`}>AdSense Top Banner (728x90)</div>

          <div className={`${isDark?'bg-zinc-900 border-zinc-800':'bg-white border-orange-100'} border rounded-[28px] p-6 md:p-8 shadow-xl`}>
            <h2 className="text-3xl font-black leading-tight">YouTube <span className="text-orange-500">Viral</span> Kit Generator</h2>
            <p className="text-sm text-zinc-500 mt-2">Title + Tags + Description + Hashtags – 1 Click me</p>

            <div className="mt-6 space-y-4">
              <input 
                value={keyword}
                onChange={(e)=>setKeyword(e.target.value)}
                placeholder="Enter Video Topic - e.g. How to make money online"
                className={`w-full px-5 py-4 rounded-full border-2 outline-none font-bold text-[15px] transition-all focus:border-orange-500 focus:glow ${isDark?'bg-black border-zinc-700':'bg-[#fff7e6] border-orange-200'}`}
              />
              <div className="grid grid-cols-2 gap-3">
                <select value={niche} onChange={(e)=>setNiche(e.target.value)} className={`px-5 py-3 rounded-full border-2 font-bold ${isDark?'bg-black border-zinc-700':'bg-[#fff7e6] border-orange-200'}`}>
                  <option>General</option><option>Tech</option><option>Finance</option><option>Gaming</option><option>Vlog</option><option>Education</option><option>Fitness</option>
                </select>
                <select value={tone} onChange={(e)=>setTone(e.target.value)} className={`px-5 py-3 rounded-full border-2 font-bold ${isDark?'bg-black border-zinc-700':'bg-[#fff7e6] border-orange-200'}`}>
                  <option>Viral</option><option>Professional</option><option>Funny</option><option>Emotional</option><option>Educational</option>
                </select>
              </div>

              <button onClick={generateData} className="w-full bg-gradient-to-r from-orange-500 to-[#ff3c00] text-black py-4 rounded-full font-black text-lg hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(255,107,0,0.6)] active:scale-95 transition-all">
                ✨ GENERATE VIRAL KIT 🚀
              </button>
            </div>
          </div>

          {result && (
            <div className="mt-6 space-y-6 animate-[float_0.5s_ease]">
              {/* Titles */}
              <div className={`${isDark?'bg-zinc-900 border-zinc-800':'bg-white border-orange-100'} border rounded-[24px] p-6`}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-black text-lg">🔥 VIRAL TITLES (5)</h3>
                  <span className="text-xs bg-green-500 text-black px-3 py-1 rounded-full font-bold">High CTR</span>
                </div>
                <div className="space-y-3">
                  {result.titles.map((t,i)=>(
                    <div key={i} className={`group flex gap-3 p-4 rounded-2xl border ${isDark?'bg-black border-zinc-800 hover:border-orange-500':'bg-[#fffaf0] border-orange-100 hover:border-orange-500'} transition`}>
                      <span className="font-black text-orange-500">{i+1}.</span>
                      <p className="flex-1 text-[14px] font-bold">{t}</p>
                      <button onClick={()=>copyText(t, `title-${i}`)} className="text-xs bg-black text-white px-3 py-1 rounded-full group-hover:bg-orange-500 group-hover:text-black transition">{copied===`title-${i}`?'Copied!':'Copy'}</button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className={`${isDark?'bg-zinc-900 border-zinc-800':'bg-white border-orange-100'} border rounded-[24px] p-6`}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-black text-lg">🏷️ SEO TAGS ({result.tags.length})</h3>
                  <button onClick={()=>copyText(result.tags.join(', '), 'all-tags')} className="text-xs bg-orange-500 text-black px-4 py-1.5 rounded-full font-black hover:scale-105 transition">{copied==='all-tags'?'Copied!':'Copy All'}</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.tags.map((tag,i)=>(
                    <span key={i} className={`px-3 py-1.5 rounded-full text-xs font-bold border hover:bg-orange-500 hover:text-black hover:-translate-y-1 transition cursor-pointer ${isDark?'bg-black border-zinc-700':'bg-orange-50 border-orange-200'}`}>{tag}</span>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className={`${isDark?'bg-zinc-900 border-zinc-800':'bg-white border-orange-100'} border rounded-[24px] p-6`}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-black text-lg">📝 VIRAL DESCRIPTION</h3>
                  <button onClick={()=>copyText(result.descriptions, 'desc')} className="text-xs bg-orange-500 text-black px-4 py-1.5 rounded-full font-black">{copied==='desc'?'Copied!':'Copy'}</button>
                </div>
                <textarea readOnly value={result.descriptions} className={`w-full h-[320px] p-4 rounded-2xl border text-[13px] leading-relaxed ${isDark?'bg-black border-zinc-800':'bg-[#fffaf0] border-orange-100'}`}></textarea>
                <p className="text-[11px] text-zinc-500 mt-2">{result.descriptions.length} characters - SEO Optimized</p>
              </div>

              {/* Ad Slot Middle */}
              <div className={`h-[250px] rounded-2xl border-2 border-dashed ${isDark?'border-zinc-700 bg-zinc-900/50':'border-orange-200 bg-orange-50'} flex items-center justify-center text-xs text-zinc-500`}>AdSense In-Article Ad (300x250)</div>
            </div>
          )}
        </div>

        {/* RIGHT SIDEBAR - AdSense Friendly */}
        <div className="space-y-6">
          <div className={`${isDark?'bg-zinc-900 border-zinc-800':'bg-white border-orange-100'} border rounded-[24px] p-5`}>
            <h4 className="font-black text-sm tracking-widest mb-3">HOW IT WORKS</h4>
            <ul className="text-xs space-y-2 text-zinc-500 leading-relaxed">
              <li>✅ AI trained on 10M+ viral videos</li>
              <li>✅ High CPC keywords auto included</li>
              <li>✅ CTR optimized titles</li>
              <li>✅ Copy & Paste ready</li>
            </ul>
          </div>

          <div className={`h-[600px] rounded-2xl border-2 border-dashed ${isDark?'border-zinc-700 bg-zinc-900/50':'border-orange-200 bg-orange-50'} flex items-center justify-center text-xs text-zinc-500 sticky top-[88px]`}>AdSense Sidebar (300x600)</div>
        </div>
      </div>

      <footer className="text-center text-[11px] text-zinc-500 py-8 border-t mt-10 border-zinc-800">
        © {new Date().getFullYear()} YT Gen Pro • High CPC Tool • Built for Creators
      </footer>
    </div>
  )
}
