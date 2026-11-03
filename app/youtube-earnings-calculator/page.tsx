"use client";
import { useState, useEffect } from "react";

export default function YouTubeEarningsCalculator() {
  const [theme, setTheme] = useState("dark");
  const isDark = theme === "dark";
  
  const [views, setViews] = useState(100000);
  const [cpm, setCpm] = useState(2.5);
  const [ctr, setCtr] = useState(8);
  const [engagement, setEngagement] = useState(5);

  const earnings = (views / 1000) * cpm;
  const estimatedClicks = views * (ctr / 100);
  const rpm = cpm * 0.55; // Approx YouTube cut

  return (
    <div className={`min-h-screen transition-all duration-500 ${isDark ? "bg-[#08080f] text-white" : "bg-[#f5f5ff] text-black"}`}>
      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        .glass { backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); }
        .animate-float { animation: float 4s ease-in-out infinite; }
      `}</style>

      {/* HEADER */}
      <div className="w-full pt-4 px-3">
        <header className={`max-w-[1000px] mx-auto glass border rounded-2xl px-5 py-3 flex justify-between items-center ${isDark ? "bg-white/[0.05] border-white/[0.08]" : "bg-white/70 border-black/[0.06] shadow-lg"}`}>
          <a href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center font-black">₹</div>
            <span className="font-black tracking-widest">EARNINGS CALC</span>
          </a>
          <div className="flex items-center gap-3">
            <button onClick={() => setTheme(isDark ? "light" : "dark")} className={`w-10 h-10 rounded-full border transition-all hover:scale-110 active:scale-95 ${isDark ? "bg-white/10 border-white/10" : "bg-black/5 border-black/10"}`}>
              {isDark ? "🌙" : "☀️"}
            </button>
            <span className="hidden md:block bg-green-500 text-black text-[10px] font-black px-3 py-1 rounded-full animate-pulse">HIGH CPC TOOL</span>
          </div>
        </header>
      </div>

      <div className="max-w-[1000px] mx-auto px-4 py-10 grid md:grid-cols-[1.1fr_0.9fr] gap-6">
        
        {/* LEFT - CONTROLS */}
        <div className={`glass border rounded-[24px] p-6 md:p-8 ${isDark ? "bg-white/[0.04] border-white/[0.07]" : "bg-white/80 border-black/[0.05] shadow-xl"}`}>
          <h1 className="text-[28px] md:text-[36px] font-black leading-[0.9]">YouTube Money<br/><span className="text-[#FF7A1A]">Calculator</span></h1>
          <p className={`text-[13px] mt-3 ${isDark ? "text-white/50" : "text-black/50"}`}>Views, CPM & CTR daalo, asli earning dekho. AdSense + Sponsorship estimate.</p>

          <div className="mt-8 space-y-6">
            {/* Views Slider */}
            <div className="group">
              <div className="flex justify-between mb-2">
                <label className="text-[13px] font-bold">Total Views</label>
                <span className="text-[#FF7A1A] font-black">{views.toLocaleString()}</span>
              </div>
              <input type="range" min="1000" max="10000000" step="1000" value={views} onChange={(e)=>setViews(Number(e.target.value))} className="w-full accent-[#FF7A1A] h-2 cursor-pointer transition-all group-hover:h-3" />
            </div>

            {/* CPM Slider */}
            <div className="group">
              <div className="flex justify-between mb-2">
                <label className="text-[13px] font-bold">CPM ($)</label>
                <span className="text-[#FF7A1A] font-black">${cpm}</span>
              </div>
              <input type="range" min="0.5" max="20" step="0.1" value={cpm} onChange={(e)=>setCpm(Number(e.target.value))} className="w-full accent-[#FF7A1A] h-2 cursor-pointer transition-all group-hover:h-3" />
              <p className="text-[10px] mt-1 opacity-50">India: $0.5-$3, USA: $4-$15</p>
            </div>

            {/* CTR */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[12px] font-bold">CTR %</label>
                <input type="number" value={ctr} onChange={(e)=>setCtr(Number(e.target.value))} className={`mt-2 w-full px-4 py-3 rounded-xl border outline-none transition-all focus:border-[#FF7A1A] focus:scale-[1.02] ${isDark ? "bg-black/40 border-white/10" : "bg-white border-black/10"}`} />
              </div>
              <div>
                <label className="text-[12px] font-bold">Engagement %</label>
                <input type="number" value={engagement} onChange={(e)=>setEngagement(Number(e.target.value))} className={`mt-2 w-full px-4 py-3 rounded-xl border outline-none transition-all focus:border-[#FF7A1A] focus:scale-[1.02] ${isDark ? "bg-black/40 border-white/10" : "bg-white border-black/10"}`} />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT - RESULT */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-[24px] p-[1px] animate-float">
            <div className="bg-black rounded-[23px] p-7 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500/20 blur-[50px] rounded-full" />
              <p className="text-[11px] tracking-[0.2em] text-white/50 font-bold">ESTIMATED EARNINGS</p>
              <h2 className="text-[48px] font-black mt-2">${earnings.toFixed(2)}</h2>
              <p className="text-[12px] text-white/60">AdSense Revenue (Before YouTube 45% cut)</p>
              
              <div className="grid grid-cols-2 gap-3 mt-6">
                <div className="bg-white/10 rounded-xl p-3 border border-white/10 hover:bg-white/15 transition">
                  <p className="text-[10px] text-white/50">AFTER YT CUT (55%)</p>
                  <p className="font-black text-[18px]">${(earnings*0.55).toFixed(2)}</p>
                </div>
                <div className="bg-white/10 rounded-xl p-3 border border-white/10 hover:bg-white/15 transition">
                  <p className="text-[10px] text-white/50">EST. RPM</p>
                  <p className="font-black text-[18px]">${rpm.toFixed(2)}</p>
                </div>
                <div className="bg-white/10 rounded-xl p-3 border border-white/10 hover:bg-white/15 transition">
                  <p className="text-[10px] text-white/50">EST. CLICKS</p>
                  <p className="font-black text-[18px]">{estimatedClicks.toLocaleString()}</p>
                </div>
                <div className="bg-white/10 rounded-xl p-3 border border-white/10 hover:bg-white/15 transition">
                  <p className="text-[10px] text-white/50">YEARLY (x12)</p>
                  <p className="font-black text-[18px]">${(earnings*0.55*12).toFixed(0)}</p>
                </div>
              </div>

              <button className="w-full mt-6 py-3.5 bg-white text-black rounded-full font-black hover:bg-[#FF7A1A] hover:text-white hover:scale-105 transition-all active:scale-95">
                Copy Report →
              </button>
              <p className="text-center text-[10px] mt-3 text-white/30">High CPC Keyword: YouTube Earnings Calculator</p>
            </div>
          </div>

          <div className={`glass border rounded-2xl p-5 ${isDark ? "bg-white/[0.03] border-white/10" : "bg-white border-black/5"}`}>
            <h3 className="font-bold text-[13px]">💡 How to Increase CPM?</h3>
            <ul className="text-[11px] mt-2 space-y-1 opacity-70">
              <li>• Finance / Insurance niche me video banao - CPM $10+</li>
              <li>• USA / UK audience target karo</li>
              <li>• 8+ min video = More mid-roll ads</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
