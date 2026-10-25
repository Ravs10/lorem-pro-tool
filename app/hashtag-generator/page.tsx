"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Platform = "instagram" | "tiktok" | "youtube" | "linkedin" | "twitter" | "facebook";
type Theme = "light" | "dark";

const HASHTAG_DB: Record<string, string[]> = {
  travel: ["#travel","#wanderlust","#travelgram","#instatravel","#travelphotography","#travelblogger","#traveling","#travellife"],
  food: ["#food","#foodie","#foodporn","#instafood","#foodphotography","#foodstagram","#yummy","#foodlover"],
  fitness: ["#fitness","#gym","#workout","#fit","#fitnessmotivation","#fitfam","#gymlife","#health"],
  fashion: ["#fashion","#style","#ootd","#fashionista","#fashionblogger","#instafashion","#outfit"],
  business: ["#business","#entrepreneur","#success","#motivation","#marketing","#startup","#money"],
  tech: ["#technology","#tech","#innovation","#gadgets","#coding","#ai","#programming"],
};

const PLATFORMS = [
  { id: "instagram" as Platform, name: "Instagram", icon: "📸", limit: 30 },
  { id: "tiktok" as Platform, name: "TikTok", icon: "🎵", limit: 10 },
  { id: "youtube" as Platform, name: "YouTube", icon: "▶️", limit: 15 },
  { id: "linkedin" as Platform, name: "LinkedIn", icon: "💼", limit: 8 },
  { id: "twitter" as Platform, name: "Twitter", icon: "🐦", limit: 5 },
  { id: "facebook" as Platform, name: "Facebook", icon: "👍", limit: 10 },
];

export default function HashtagGenerator() {
  const [input, setInput] = useState("");
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [count, setCount] = useState(15);
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [theme, setTheme] = useState<Theme>("light");
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const isDark = theme === "dark";

  const playSound = (freq: number) => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.type = "sine"; o.frequency.setValueAtTime(freq, ctx.currentTime);
      g.gain.setValueAtTime(0.06, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime + 0.15);
    } catch {}
  };

  const generate = () => {
    if (!input.trim()) return;
    setLoading(true); playSound(600);
    setTimeout(() => {
      const keys = input.toLowerCase().split(/\s+/);
      let result: string[] = [];
      keys.forEach(k => { if (HASHTAG_DB[k]) result = [...result, ...HASHTAG_DB[k]]; });
      if (result.length === 0) {
        const base = input.toLowerCase().replace(/[^a-z0-9 ]/g, "").split(/\s+/).filter(Boolean);
        base.forEach(w => { result.push(`#${w}`, `#${w}love`, `#${w}life`, `#${w}gram`, `#${w}daily`, `#insta${w}`); });
      }
      result = [...new Set(result)].sort(() => 0.5 - Math.random()).slice(0, count);
      setHashtags(result); setLoading(false);
    }, 500);
  };

  const copyAll = async () => {
    await navigator.clipboard.writeText(hashtags.join(" "));
    setCopied(true); playSound(800); setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`${isDark ? "bg-[#070710] text-white" : "bg-[#f6fff8] text-[#0a2a12]"} min-h-screen w-full overflow-x-hidden transition-all`}>
      {/* HEADER - RESPONSIVE FIX */}
      <header className={`w-full border-b ${isDark ? "border-white/10 bg-black/20" : "border-green-100 bg-white/80"} backdrop-blur sticky top-0 z-50`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="font-black text-lg sm:text-xl truncate">HASHTAG <span className="text-[#00C950]">#GENERATOR</span></h1>
            <p className="text-[10px] opacity-60 hidden sm:block">AI POWERED · TRENDING 2026</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => { setTheme(isDark ? "light" : "dark"); playSound(700); }} className={`w-11 h-7 rounded-full p-1 flex transition ${isDark ? "bg-white/20 justify-end" : "bg-green-900/20 justify-start"}`}>
              <div className="w-5 h-5 rounded-full bg-white shadow text-[10px] flex items-center justify-center">{isDark ? "🌙" : "☀️"}</div>
            </button>
          </div>
        </div>
        {/* Platform Tabs - Scrollable */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-none -mx-1 px-1">
            {PLATFORMS.map(p => (
              <button key={p.id} onClick={() => { setPlatform(p.id); playSound(350); }} className={`whitespace-nowrap shrink-0 px-3.5 py-2 rounded-full text-xs font-bold border transition ${platform === p.id ? "bg-[#00C950] text-white border-[#00C950]" : isDark ? "bg-white/10 border-white/10" : "bg-white border-green-200"}`}>
                {p.icon} {p.name}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ADS TOP - RESPONSIVE */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
        <div className={`w-full h-[70px] sm:h-[90px] rounded-xl sm:rounded-2xl border border-dashed flex items-center justify-center text-[10px] sm:text-xs opacity-30 ${isDark ? "bg-white/5" : "bg-green-50"}`}>Adsense Top Banner - Responsive</div>
      </div>

      {/* MAIN GRID - RESPONSIVE FIX */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 w-full">
        {/* LEFT */}
        <div className={`col-span-1 lg:col-span-7 rounded-2xl sm:rounded-[2rem] border p-4 sm:p-6 w-full min-w-0 ${isDark ? "bg-white/[0.03] border-white/10" : "bg-white border-green-100 shadow-sm"}`}>
          <label className="text-[11px] font-bold opacity-60">YOUR TOPIC / KEYWORD</label>
          <textarea value={input} onChange={e => setInput(e.target.value)} placeholder="e.g. travel food, fitness, tech startup..." className={`w-full h-[120px] sm:h-[140px] mt-2 p-3 sm:p-4 rounded-xl sm:rounded-2xl border outline-none resize-none text-[14px] sm:text-[15px] leading-6 ${isDark ? "bg-black/40 border-white/10 focus:border-[#00C950]" : "bg-[#f6fff8] border-green-200 focus:border-[#00C950]"}`} />

          <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:items-center">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold opacity-60 shrink-0">COUNT:</span>
              <input type="range" min={5} max={30} value={count} onChange={e => { setCount(parseInt(e.target.value)); playSound(300); }} className="accent-[#00C950] w-full sm:w-24" />
              <span className="px-2.5 py-1 rounded-full bg-[#00C950] text-white text-xs font-bold shrink-0">{count}</span>
            </div>
            <span className="text-[10px] opacity-50 sm:ml-auto">{PLATFORMS.find(p => p.id === platform)?.name} limit: {PLATFORMS.find(p => p.id === platform)?.limit}</span>
          </div>

          <motion.button whileTap={{ scale: 0.97 }} onClick={generate} disabled={loading || !input.trim()} className="w-full mt-5 py-3.5 sm:py-4 rounded-full bg-gradient-to-r from-[#00C950] to-[#00A63E] text-white font-black text-sm sm:text-base tracking-wide shadow-[0_0_20px_rgba(0,200,80,0.3)] disabled:opacity-50">
            {loading ? "🔍 Generating..." : `✨ GENERATE FOR ${platform.toUpperCase()}`}
          </motion.button>

          <div className={`w-full h-[100px] mt-6 rounded-xl border border-dashed flex items-center justify-center text-[10px] opacity-30 ${isDark ? "bg-white/5" : "bg-green-50"}`}>Adsense In-Content</div>
        </div>

        {/* RIGHT */}
        <div className={`col-span-1 lg:col-span-5 rounded-2xl sm:rounded-[2rem] border p-4 sm:p-6 flex flex-col w-full min-w-0 ${isDark ? "bg-white/[0.03] border-white/10" : "bg-white border-green-100 shadow-sm"}`}>
          <div className="flex justify-between items-center gap-2 mb-4">
            <h2 className="font-bold text-sm sm:text-base">Generated</h2>
            <div className="flex gap-2 shrink-0">
              <span className="text-[11px] px-2.5 py-1 rounded-full bg-[#00C950]/10 text-[#00C950] font-bold">{hashtags.length}</span>
              {hashtags.length > 0 && <button onClick={copyAll} className="text-[11px] px-3 py-1 rounded-full bg-[#00C950] text-white font-bold">📋 {copied ? "Copied!" : "Copy"}</button>}
            </div>
          </div>

          {!hashtags.length && !loading && (
            <div className="flex-1 flex flex-col items-center justify-center py-12 sm:py-20 opacity-40 text-center px-4">
              <div className="text-4xl mb-3">🔥</div>
              <p className="font-bold text-sm">Ready to go viral?</p>
              <p className="text-[11px] mt-2 max-w-[200px]">Enter topic & generate trending hashtags.</p>
            </div>
          )}

          {loading && <div className="flex-1 flex flex-col items-center justify-center py-12"><div className="w-8 h-8 border-2 border-[#00C950] border-t-transparent rounded-full animate-spin" /></div>}

          <AnimatePresence>
            {hashtags.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 w-full min-w-0">
                <div className="flex flex-wrap gap-2 w-full">
                  {hashtags.map((tag, i) => (
                    <motion.button key={tag+i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i*0.02 }} whileHover={{ scale: 1.05 }} onHoverStart={() => playSound(320+i*2)} onClick={() => setFavorites(f => f.includes(tag) ? f.filter(t=>t!==tag) : [...f, tag])} className={`px-3 py-1.5 rounded-full text-[13px] font-medium border break-all ${favorites.includes(tag) ? "bg-[#00C950] text-white border-[#00C950]" : isDark ? "bg-white/5 border-white/10" : "bg-green-50 border-green-200"}`}>
                      {tag}
                    </motion.button>
                  ))}
                </div>
                <div className={`p-3 rounded-xl text-[13px] break-words ${isDark ? "bg-black/40 border border-white/10" : "bg-[#f6fff8] border border-green-100"}`}>
                  <p className="text-[10px] opacity-50 mb-1">Preview:</p>
                  <p className="break-all leading-6">{hashtags.join(" ")}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className={`mt-6 w-full h-[200px] sm:h-[250px] rounded-xl border border-dashed flex items-center justify-center text-[10px] opacity-30 ${isDark ? "bg-white/5" : "bg-green-50"}`}>Adsense Sidebar 300x250</div>
        </div>
      </main>

      <footer className={`w-full text-center text-[10px] sm:text-xs opacity-40 py-6 border-t px-4 ${isDark ? "border-white/10" : "border-green-100"}`}>© 2026 Hashtag Generator - White & Green - Responsive</footer>
    </div>
  );
}
