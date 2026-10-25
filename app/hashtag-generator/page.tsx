"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Platform = "instagram" | "tiktok" | "youtube" | "linkedin" | "twitter" | "facebook";
type Theme = "light" | "dark";

const HASHTAG_DB: Record<string, string[]> = {
  travel: ["#travel", "#wanderlust", "#travelgram", "#instatravel", "#travelphotography", "#travelblogger", "#traveling", "#travellife", "#traveltheworld", "#traveladdict", "#travelawesome", "#travelholic", "#travelbug", "#travelmore", "#travelstoke"],
  food: ["#food", "#foodie", "#foodporn", "#instafood", "#foodphotography", "#foodstagram", "#foodblogger", "#foodlover", "#foodgasm", "#foodpics", "#foodies", "#foodpic", "#foodheaven", "#foodlove", "#yummy"],
  fitness: ["#fitness", "#gym", "#workout", "#fit", "#fitnessmotivation", "#fitfam", "#gymlife", "#fitnessmodel", "#bodybuilding", "#training", "#health", "#fitspo", "#lifestyle", "#exercise", "#muscle"],
  fashion: ["#fashion", "#style", "#ootd", "#fashionista", "#fashionblogger", "#instafashion", "#fashionstyle", "#fashionable", "#fashiongram", "#fashioninspo", "#fashionlover", "#look", "#outfit", "#fashionweek", "#stylish"],
  business: ["#business", "#entrepreneur", "#success", "#motivation", "#entrepreneurship", "#marketing", "#businessowner", "#startup", "#smallbusiness", "#money", "#businesslife", "#businessman", "#leadership", "#branding", "#hustle"],
  nature: ["#nature", "#photography", "#naturephotography", "#love", "#photooftheday", "#travel", "#naturelovers", "#beautiful", "#landscape", "#picoftheday", "#naturelover", "#wildlife", "#sunset", "#forest", "#mountains"],
  tech: ["#technology", "#tech", "#innovation", "#technews", "#gadgets", "#programming", "#coding", "#ai", "#techie", "#software", "#computer", "#startup", "#engineering", "#science", "#future"],
  music: ["#music", "#musician", "#song", "#singer", "#instamusic", "#musicians", "#musicvideo", "#musicislife", "#musiclover", "#songs", "#musical", "#musiclife", "#musicproducer", "#rapper", "#newmusic"],
};

const PLATFORMS: { id: Platform; name: string; icon: string; limit: number }[] = [
  { id: "instagram", name: "Instagram", icon: "📸", limit: 30 },
  { id: "tiktok", name: "TikTok", icon: "🎵", limit: 10 },
  { id: "youtube", name: "YouTube", icon: "▶️", limit: 15 },
  { id: "linkedin", name: "LinkedIn", icon: "💼", limit: 8 },
  { id: "twitter", name: "Twitter / X", icon: "🐦", limit: 5 },
  { id: "facebook", name: "Facebook", icon: "👍", limit: 10 },
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

  const playSound = (freq: number, type: OscillatorType = "sine") => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.type = type; o.frequency.setValueAtTime(freq, ctx.currentTime);
      g.gain.setValueAtTime(0.08, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime + 0.2);
    } catch {}
  };

  const generate = () => {
    if (!input.trim()) return;
    setLoading(true); playSound(600, "triangle");
    setTimeout(() => {
      const keys = input.toLowerCase().split(/\s+/);
      let result: string[] = [];
      keys.forEach(k => {
        if (HASHTAG_DB[k]) result = [...result, ...HASHTAG_DB[k]];
      });
      // Auto generate from input words if no match
      if (result.length === 0) {
        const base = input.toLowerCase().replace(/[^a-z0-9 ]/g, "").split(/\s+/).filter(Boolean);
        base.forEach(w => {
          result.push(`#${w}`, `#${w}love`, `#${w}life`, `#${w}gram`, `#${w}daily`, `#${w}community`);
          result.push(`#${w}inspiration`, `#${w}style`, `#${w}photography`, `#insta${w}`);
        });
      }
      // Add trending suffix
      const trending = ["viral", "trending", "explore", "fyp", "instagood", "love", "instadaily", "reels", "foryou"];
      trending.forEach(t => result.push(`#${t}`));
      
      // Shuffle + dedup + limit
      result = [...new Set(result)];
      result = result.sort(() => 0.5 - Math.random()).slice(0, count);
      setHashtags(result); setLoading(false); setCopied(false);
    }, 600);
  };

  const copyAll = async () => {
    await navigator.clipboard.writeText(hashtags.join(" "));
    setCopied(true); playSound(800, "sine"); setTimeout(() => setCopied(false), 2000);
  };

  const toggleFav = (tag: string) => {
    playSound(500);
    setFavorites(f => f.includes(tag) ? f.filter(t => t !== tag) : [...f, tag]);
  };

  return (
    <div className={`${isDark ? "bg-[#070710] text-white" : "bg-[#f6fff8] text-[#0a2a12]"} min-h-screen transition-all duration-500`}>
      {/* Header */}
      <header className={`max-w-[1400px] mx-auto p-6 flex justify-between items-center ${isDark ? "border-white/10" : "border-green-900/10"} border-b`}>
        <div>
          <h1 className="font-black text-2xl tracking-widest">HASHTAG <span className="text-[#00C950]">#GENERATOR</span></h1>
          <p className="text-[11px] opacity-60 tracking-wider">AI POWERED · TRENDING 2026 · {platform.toUpperCase()} OPTIMIZED</p>
        </div>
        <div className="flex gap-2 items-center">
          <div className="hidden md:flex gap-1 p-1 rounded-full bg-black/5 border">
            {PLATFORMS.map(p => (
              <button key={p.id} onClick={() => { setPlatform(p.id); playSound(400); setCount(p.limit); }} className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${platform === p.id ? "bg-[#00C950] text-white shadow" : "opacity-60 hover:opacity-100"}`}>{p.icon}</button>
            ))}
          </div>
          <button onClick={() => { setTheme(isDark ? "light" : "dark"); playSound(700); }} className={`w-12 h-7 rounded-full p-1 flex transition ${isDark ? "bg-white/20 justify-end" : "bg-green-900/20 justify-start"}`}>
            <div className="w-5 h-5 rounded-full bg-white shadow flex items-center justify-center text-[12px]">{isDark ? "🌙" : "☀️"}</div>
          </button>
        </div>
      </header>

      {/* AdSense Top - Friendly */}
      <div className="max-w-[1400px] mx-auto p-4">
        <div className={`w-full h-[90px] rounded-2xl border border-dashed flex items-center justify-center text-xs opacity-30 ${isDark ? "bg-white/5 border-white/10" : "bg-green-50 border-green-200"}`}>Adsense - Top Banner (728x90) - Responsive</div>
      </div>

      <main className="max-w-[1400px] mx-auto p-4 grid lg:grid-cols-12 gap-6">
        {/* Left Input */}
        <div className={`lg:col-span-7 rounded-[2rem] border p-6 ${isDark ? "bg-white/[0.03] border-white/10" : "bg-white border-green-100 shadow-[0_10px_40px_-10px_rgba(0,200,80,0.15)]"}`}>
          <div className="flex gap-2 mb-4 overflow-x-auto md:hidden pb-2">
            {PLATFORMS.map(p => (
              <button key={p.id} onClick={() => setPlatform(p.id)} className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold border ${platform === p.id ? "bg-[#00C950] text-white border-[#00C950]" : isDark ? "bg-white/10 border-white/10" : "bg-green-50 border-green-200"}`}>{p.icon} {p.name}</button>
            ))}
          </div>

          <label className="text-xs font-bold opacity-60">YOUR TOPIC / KEYWORD</label>
          <textarea value={input} onChange={e => setInput(e.target.value)} placeholder="e.g. travel food, fitness motivation, tech startup..." className={`w-full h-[140px] mt-2 p-4 rounded-2xl border outline-none resize-none text-[15px] leading-6 transition ${isDark ? "bg-black/40 border-white/10 focus:border-[#00C950]" : "bg-[#f6fff8] border-green-200 focus:border-[#00C950]"}`} />

          <div className="flex gap-4 mt-4 items-center flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold opacity-60">COUNT:</span>
              <input type="range" min={5} max={30} value={count} onChange={e => { setCount(parseInt(e.target.value)); playSound(300); }} className="accent-[#00C950] w-24" />
              <span className="px-3 py-1 rounded-full bg-[#00C950] text-white text-xs font-bold">{count}</span>
            </div>
            <span className="text-[11px] opacity-50 ml-auto">{PLATFORMS.find(p => p.id === platform)?.name} limit: {PLATFORMS.find(p => p.id === platform)?.limit} recommended</span>
          </div>

          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={generate} disabled={loading || !input.trim()} className="w-full mt-5 py-4 rounded-full bg-gradient-to-r from-[#00C950] to-[#00A63E] text-white font-black tracking-wide shadow-[0_0_20px_rgba(0,200,80,0.4)] disabled:opacity-50">
            {loading ? "🔍 Generating Trending..." : `✨ GENERATE FOR ${platform.toUpperCase()}`}
          </motion.button>

          {/* Adsense Middle */}
          <div className={`w-full h-[120px] mt-6 rounded-2xl border border-dashed flex items-center justify-center text-xs opacity-30 ${isDark ? "bg-white/5" : "bg-green-50"}`}>Adsense - In Content (Responsive)</div>

          {/* SEO Content */}
          <div className="mt-8 leading-7 text-sm opacity-80">
            <h2 className="font-black text-lg">What is Hashtag Generator?</h2>
            <p className="mt-2 opacity-70">Free AI-powered hashtag generator for Instagram, TikTok, YouTube, LinkedIn, Twitter, Facebook. Enter any topic, get viral, trending hashtags instantly. No API, 0MB Edge, works offline. White + Green theme, 10/10 rating.</p>
            <h3 className="font-bold mt-4">How to use?</h3>
            <p className="opacity-70">1. Select platform (Instagram 30, TikTok 10) 2. Enter keyword like travel, food 3. Choose count 4. Generate & copy. All hashtags SEO optimized for reach.</p>
          </div>
        </div>

        {/* Right Result */}
        <div className={`lg:col-span-5 rounded-[2rem] border p-6 flex flex-col ${isDark ? "bg-white/[0.03] border-white/10" : "bg-white border-green-100 shadow-[0_10px_40px_-10px_rgba(0,200,80,0.15)]"}`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold">Generated Hashtags</h2>
            <div className="flex gap-2">
              <span className="text-xs px-3 py-1 rounded-full bg-[#00C950]/10 text-[#00C950] font-bold">{hashtags.length} tags</span>
              {hashtags.length > 0 && <button onClick={copyAll} className="text-xs px-3 py-1 rounded-full bg-black text-white md:bg-[#00C950] hover:opacity-80 font-bold">📋 {copied ? "Copied!" : "Copy All"}</button>}
            </div>
          </div>

          {!hashtags.length && !loading && (
            <div className="flex-1 flex flex-col items-center justify-center py-20 opacity-40">
              <div className="text-5xl mb-3">🔥</div>
              <p className="font-bold">Ready to go viral?</p>
              <p className="text-xs mt-2 text-center max-w-[220px]">Enter topic and hit generate. Trending hashtags for all platforms.</p>
            </div>
          )}

          {loading && <div className="flex-1 flex flex-col items-center justify-center py-20"><div className="w-10 h-10 border-3 border-[#00C950] border-t-transparent rounded-full animate-spin" /><p className="mt-3 text-sm opacity-60">Finding viral hashtags...</p></div>}

          <AnimatePresence>
            {hashtags.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {hashtags.map((tag, i) => (
                    <motion.button key={tag + i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.03 }} whileHover={{ scale: 1.08, y: -2 }} onHoverStart={() => playSound(300 + i * 5)} onClick={() => toggleFav(tag)} className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${favorites.includes(tag) ? "bg-[#00C950] text-white border-[#00C950] shadow" : isDark ? "bg-white/5 border-white/10 hover:bg-white/10" : "bg-green-50 border-green-200 hover:bg-green-100"}`}>
                      {tag} {favorites.includes(tag) ? "★" : ""}
                    </motion.button>
                  ))}
                </div>

                <div className={`p-4 rounded-2xl text-sm ${isDark ? "bg-black/40" : "bg-[#f6fff8]"} border ${isDark ? "border-white/10" : "border-green-100"}`}>
                  <p className="text-xs opacity-50 mb-2">Preview for {platform}:</p>
                  {hashtags.join(" ")}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button onClick={copyAll} className="py-3 rounded-full bg-black text-white md:bg-[#0a2a12] font-bold text-xs hover:opacity-80">📋 Copy ({hashtags.length})</button>
                  <button onClick={() => { navigator.clipboard.writeText(favorites.join(" ")); playSound(800); }} className="py-3 rounded-full bg-[#00C950] text-white font-bold text-xs">⭐ Copy Favs ({favorites.length})</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* AdSense Sidebar */}
          <div className={`mt-6 w-full h-[250px] rounded-2xl border border-dashed flex items-center justify-center text-xs opacity-30 ${isDark ? "bg-white/5" : "bg-green-50"}`}>Adsense - Sidebar (300x250)</div>
        </div>
      </main>

      {/* Other Tools with same animation system */}
      <footer className={`max-w-[1400px] mx-auto p-8 mt-10 text-center text-xs opacity-40 border-t ${isDark ? "border-white/10" : "border-green-100"}`}>© 2026 Hashtag Generator - Free, Private, Cloudflare Edge - White & Green Theme - 10/10</footer>
    </div>
  );
}
