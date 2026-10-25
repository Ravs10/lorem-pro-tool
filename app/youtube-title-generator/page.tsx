"use client"
import { useState } from 'react'

export default function YouTubeGenerator() {
  const [keyword, setKeyword] = useState("")
  const [niche, setNiche] = useState("General")
  const [tone, setTone] = useState("Viral")
  const [theme, setTheme] = useState("dark")
  const [result, setResult] = useState<any>(null)
  const [copied, setCopied] = useState("")

  // FIXED Sound Effect - TypeScript safe
  const playSound = (freq = 800) => {
    try {
      const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()
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
- Thumbnail Maker - https://loremprotool.com

👉 SUBSCRIBE for more ${niche} content

#${k.replace(/\s+/g,'')} #${niche} #youtubeTips

TIMESTAMPS:
00:00 Intro
00:45 What is ${k}?
02:30 Main Tutorial
05:00 Bonus Trick
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
    ]

    const hashtags = `#${k.replace(/\s+/g,'')} #${niche} #${tone}Viral #YouTubeGrowth`

    setResult({ titles, descriptions, tags, hashtags })
  }

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    playSound(1000)
    setCopied(id)
    setTimeout(()=> setCopied(""), 2000)
  }

  const isDark = theme === "dark"

  return (
    <div className={`${isDark ? 'bg-[#0a0a0a] text-white' : 'bg-[#fffaf0] text-black'} min-h-screen transition-all duration-500`}>
      <style>{`
        @keyframes float { 0%,100% {transform: translateY(0)} 50% {transform: translateY(-10px)} }
        @keyframes glow { 0%,100% {box-shadow: 0 0 20px rgba(255,107,0,0.3)} 50% {box-shadow: 0 0 40px rgba(255,107,0,0.6)} }
        .float { animation: float 3s ease-in-out infinite }
        .glow { animation: glow 2s ease-in-out infinite }
      `}</style>

      <header className={`sticky top-0 z-50 ${isDark ? 'bg-black/80' : 'bg-white/80'} backdrop-blur border-b ${isDark ? 'border-zinc-800' : 'border-orange-100'}`}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-black">YT <span className="text-orange-500">GEN</span> PRO</h1>
          <button onClick={()=>{ setTheme(isDark?'light':'dark'); playSound(400)}} className={`w-12 h-7 rounded-full p-1 flex ${isDark?'justify-end bg-zinc-800':'justify-start bg-orange-200'}`}>
            <div className="w-5 h-5 bg-white rounded-full"></div>
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8 grid lg:grid-cols-[1fr_300px] gap-8">
        <div>
          <div className={`h-[90px] rounded-2xl border-2 border-dashed ${isDark?'border-zinc-700 bg-zinc-900/50':'border-orange-200 bg-orange-50'} flex items-center justify-center text-xs text-zinc-500 mb-6`}>AdSense Top Banner</div>

          <div className={`${isDark?'bg-zinc-900 border-zinc-800':'bg-white border-orange-100'} border rounded-[28px] p-6 md:p-8`}>
            <h2 className="text-3xl font-black">YouTube <span className="text-orange-500">Viral</span> Kit Generator</h2>
            <div className="mt-6 space-y-4">
              <input value={keyword} onChange={(e)=>setKeyword(e.target.value)} placeholder="Enter Video Topic" className={`w-full px-5 py-4 rounded-full border-2 outline-none font-bold ${isDark?'bg-black border-zinc-700':'bg-[#fff7e6] border-orange-200'}`} />
              <div className="grid grid-cols-2 gap-3">
                <select value={niche} onChange={(e)=>setNiche(e.target.value)} className={`px-5 py-3 rounded-full border-2 font-bold ${isDark?'bg-black border-zinc-700':'bg-[#fff7e6] border-orange-200'}`}>
                  <option>General</option><option>Tech</option><option>Finance</option><option>Gaming</option><option>Vlog</option>
                </select>
                <select value={tone} onChange={(e)=>setTone(e.target.value)} className={`px-5 py-3 rounded-full border-2 font-bold ${isDark?'bg-black border-zinc-700':'bg-[#fff7e6] border-orange-200'}`}>
                  <option>Viral</option><option>Professional</option><option>Funny</option><option>Educational</option>
                </select>
              </div>
              <button onClick={generateData} className="w-full bg-gradient-to-r from-orange-500 to-[#ff3c00] text-black py-4 rounded-full font-black text-lg hover:scale-[1.02] transition-all">✨ GENERATE VIRAL KIT 🚀</button>
            </div>
          </div>

          {result && (
            <div className="mt-6 space-y-6">
              <div className={`${isDark?'bg-zinc-900 border-zinc-800':'bg-white border-orange-100'} border rounded-[24px] p-6`}>
                <h3 className="font-black text-lg mb-4">🔥 VIRAL TITLES</h3>
                <div className="space-y-3">
                  {result.titles.map((t:string,i:number)=>(
                    <div key={i} className={`flex gap-3 p-4 rounded-2xl border ${isDark?'bg-black border-zinc-800':'bg-[#fffaf0] border-orange-100'}`}>
                      <span className="text-orange-500 font-black">{i+1}.</span>
                      <p className="flex-1 text-[14px] font-bold">{t}</p>
                      <button onClick={()=>copyText(t, `title-${i}`)} className="text-xs bg-black text-white px-3 py-1 rounded-full">{copied===`title-${i}`?'Copied!':'Copy'}</button>
                    </div>
                  ))}
                </div>
              </div>
              <div className={`${isDark?'bg-zinc-900 border-zinc-800':'bg-white border-orange-100'} border rounded-[24px] p-6`}>
                <h3 className="font-black mb-4">🏷️ TAGS</h3>
                <div className="flex flex-wrap gap-2">
                  {result.tags.map((tag:string,i:number)=><span key={i} className={`px-3 py-1.5 rounded-full text-xs font-bold border ${isDark?'bg-black border-zinc-700':'bg-orange-50 border-orange-200'}`}>{tag}</span>)}
                </div>
                <button onClick={()=>copyText(result.tags.join(', '), 'all-tags')} className="mt-4 text-xs bg-orange-500 text-black px-4 py-2 rounded-full font-black">{copied==='all-tags'?'Copied!':'Copy All Tags'}</button>
              </div>
              <div className={`${isDark?'bg-zinc-900 border-zinc-800':'bg-white border-orange-100'} border rounded-[24px] p-6`}>
                <h3 className="font-black mb-4">📝 DESCRIPTION</h3>
                <textarea readOnly value={result.descriptions} className={`w-full h-[300px] p-4 rounded-2xl border text-[13px] ${isDark?'bg-black border-zinc-800':'bg-[#fffaf0] border-orange-100'}`}></textarea>
                <button onClick={()=>copyText(result.descriptions, 'desc')} className="mt-3 text-xs bg-orange-500 text-black px-4 py-2 rounded-full font-black">{copied==='desc'?'Copied!':'Copy Description'}</button>
              </div>
            </div>
          )}
        </div>
        <div className={`h-[600px] rounded-2xl border-2 border-dashed ${isDark?'border-zinc-700 bg-zinc-900/50':'border-orange-200 bg-orange-50'} flex items-center justify-center text-xs text-zinc-500 sticky top-[88px]`}>AdSense Sidebar</div>
      </div>
    </div>
  )
}
