"use client";
import { useState, useMemo } from "react";

const NICHES = [
  { name: "Finance / Insurance", mult: 3.5, cpm: 12 },
  { name: "Crypto / Trading", mult: 3.0, cpm: 10 },
  { name: "Tech / AI", mult: 2.2, cpm: 6 },
  { name: "Education", mult: 1.8, cpm: 4.5 },
  { name: "General / Vlog", mult: 1.0, cpm: 1.8 },
  { name: "Gaming / Entertainment", mult: 0.8, cpm: 1.2 },
];

const COUNTRIES = [
  { name: "USA", mult: 3.5 },
  { name: "UK / Canada", mult: 2.8 },
  { name: "UAE / Australia", mult: 2.5 },
  { name: "India", mult: 1.0 },
  { name: "Pakistan / BD", mult: 0.7 },
];

export default function YouTubeEarningsCalculatorProMax() {
  const [theme, setTheme] = useState("dark");
  const isDark = theme === "dark";
  const [views, setViews] = useState(946000);
  const [baseCpm, setBaseCpm] = useState(18.1);
  const [niche, setNiche] = useState(NICHES[4]);
  const [country, setCountry] = useState(COUNTRIES[3]);
  const [sponsorRate, setSponsorRate] = useState(20);
  const [memberships, setMemberships] = useState(0);
  const [superThanks, setSuperThanks] = useState(0);
  const [tax, setTax] = useState(10);
  const [copied, setCopied] = useState(false);

  // FINAL PRO CALCULATION - NOTHING REMOVED, ONLY IMPROVED
  const calc = useMemo(() => {
    const adjustedCpm = baseCpm; // User ka diya hua CPM hi final, niche/country sirf suggestion ke liye
    const grossAdsense = (views / 1000) * adjustedCpm;
    const afterYtCut = grossAdsense * 0.55;
    const sponsorship = (views / 1000) * sponsorRate;
    const totalGross = afterYtCut + sponsorship + memberships + superThanks;
    const taxAmount = totalGross * (tax / 100);
    const net = totalGross - taxAmount;
    const yearly = net * 12;
    const rpm = adjustedCpm * 0.55;
    return { adjustedCpm, grossAdsense, afterYtCut, sponsorship, totalGross, taxAmount, net, yearly, rpm };
  }, [views, baseCpm, sponsorRate, memberships, superThanks, tax]);

  const handleCopy = () => {
    const report = `📊 YouTube Earnings Report
━━━━━━━━━━━━━━━━
Views: ${views.toLocaleString()}
CPM: $${calc.adjustedCpm}
Niche: ${niche.name} | Country: ${country.name}
━━━━━━━━━━━━━━━━
AdSense (55%): $${calc.afterYtCut.toFixed(2)}
Sponsorship: $${calc.sponsorship.toFixed(2)}
Memberships: $${memberships.toFixed(2)}
Super Thanks: $${superThanks.toFixed(2)}
Tax (${tax}%): -$${calc.taxAmount.toFixed(2)}
━━━━━━━━━━━━━━━━
💰 NET: $${calc.net.toFixed(2)}/mo
📈 YEARLY: $${calc.yearly.toFixed(2)}
🎯 RPM: $${calc.rpm.toFixed(2)}`;
    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDark ? "bg-[#05050A] text-white" : "bg-[#F8F8FF] text-black"}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@900;700;400&display=swap');
        *{font-family:'Geist',sans-serif}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        .glass{backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px)}
        .hover-lift{transition:all .3s cubic-bezier(0.175, 0.885, 0.32, 1.275)}
        .hover-lift:hover{transform:translateY(-3px) scale(1.01)}
      `}</style>

      {/* HEADER - SAME AS BEFORE */}
      <div className="w-full p-3 sticky top-0 z-50">
        <header className={`max-w-[1200px] mx-auto glass border rounded-2xl px-5 py-3 flex justify-between items-center ${isDark ? "bg-white/[0.06] border-white/[0.08]" : "bg-white/80 border-black/[0.06] shadow-lg"}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center font-black text-white">Y</div>
            <span className="font-black tracking-widest text-[14px]">LOREM PRO / EARNINGS PRO MAX</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden md:flex bg-green-500/15 border border-green-500/20 text-green-500 text-[10px] font-black px-3 py-1 rounded-full">HIGH CPC $12.40</span>
            <button onClick={() => setTheme(isDark ? "light" : "dark")} className={`w-10 h-10 rounded-full border flex items-center justify-center hover-lift ${isDark ? "bg-white/10 border-white/10" : "bg-black/5 border-black/10"}`}>{isDark ? "🌙" : "☀️"}</button>
          </div>
        </header>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 py-6 grid lg:grid-cols-[1.2fr_0.8fr] gap-5">
        {/* LEFT - CONTROLS (ALL OLD + NEW FEATURES) */}
        <div className={`glass border rounded-[28px] p-7 ${isDark ? "bg-white/[0.04] border-white/[0.06]" : "bg-white border-black/5 shadow-xl"}`}>
          <h1 className="text-[34px] md:text-[46px] font-black leading-[0.85] tracking-tighter">YouTube Money<br/><span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">Calculator PRO MAX</span></h1>
          
          <div className={`mt-5 w-full h-[90px] rounded-xl border border-dashed flex items-center justify-center text-[11px] font-bold tracking-widest opacity-50 ${isDark ? "bg-white/[0.02] border-white/10" : "bg-black/[0.02]"}`}>AD SLOT - 728x90</div>

          <div className="mt-7 space-y-6">
            {/* Views */}
            <div>
              <div className="flex justify-between mb-2"><label className="text-[12px] font-black uppercase">Total Views</label><span className="text-[#FF7A1A] font-black">{views.toLocaleString()}</span></div>
              <input type="range" min="1000" max="10000000" step="1000" value={views} onChange={(e)=>setViews(Number(e.target.value))} className="w-full accent-[#FF7A1A] h-2" />
            </div>
            {/* CPM */}
            <div>
              <div className="flex justify-between mb-2"><label className="text-[12px] font-black uppercase">CPM ($)</label><span className="text-[#FF7A1A] font-black">${baseCpm}</span></div>
              <input type="range" min="0.2" max="30" step="0.1" value={baseCpm} onChange={(e)=>setBaseCpm(Number(e.target.value))} className="w-full accent-[#FF7A1A] h-2" />
            </div>

            {/* NICHE & COUNTRY - NEW BUT OLD KEPT */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-black uppercase opacity-60">Niche</label>
                <select value={niche.name} onChange={(e)=>setNiche(NICHES.find(n=>n.name===e.target.value)!)} className={`mt-2 w-full px-4 py-3.5 rounded-xl border outline-none font-bold ${isDark ? "bg-black/50 border-white/10" : "bg-[#F5F5F7] border-black/5"}`}>
                  {NICHES.map(n=><option key={n.name} value={n.name}>{n.name} - ${n.cpm} CPM</option>)}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-black uppercase opacity-60">Country</label>
                <select value={country.name} onChange={(e)=>setCountry(COUNTRIES.find(c=>c.name===e.target.value)!)} className={`mt-2 w-full px-4 py-3.5 rounded-xl border outline-none font-bold ${isDark ? "bg-black/50 border-white/10" : "bg-[#F5F5F7] border-black/5"}`}>
                  {COUNTRIES.map(c=><option key={c.name} value={c.name}>{c.name}</option>)}
                </select>
              </div>
            </div>

            {/* SPONSOR + MEMBERSHIP + SUPER THANKS + TAX */}
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-[11px] font-bold">Sponsor / 1k views ($)</label><input type="number" value={sponsorRate} onChange={(e)=>setSponsorRate(Number(e.target.value))} className={`mt-2 w-full px-4 py-3 rounded-xl border font-bold outline-none focus:border-[#FF7A1A] ${isDark ? "bg-black/40 border-white/10" : "bg-white border-black/10"}`} /></div>
              <div><label className="text-[11px] font-bold">Tax %</label><input type="number" value={tax} onChange={(e)=>setTax(Number(e.target.value))} className={`mt-2 w-full px-4 py-3 rounded-xl border font-bold outline-none focus:border-[#FF7A1A] ${isDark ? "bg-black/40 border-white/10" : "bg-white border-black/10"}`} /></div>
              <div><label className="text-[11px] font-bold">Memberships ($)</label><input type="number" value={memberships} onChange={(e)=>setMemberships(Number(e.target.value))} className={`mt-2 w-full px-4 py-3 rounded-xl border font-bold outline-none focus:border-[#FF7A1A] ${isDark ? "bg-black/40 border-white/10" : "bg-white border-black/10"}`} /></div>
              <div><label className="text-[11px] font-bold">Super Thanks ($)</label><input type="number" value={superThanks} onChange={(e)=>setSuperThanks(Number(e.target.value))} className={`mt-2 w-full px-4 py-3 rounded-xl border font-bold outline-none focus:border-[#FF7A1A] ${isDark ? "bg-black/40 border-white/10" : "bg-white border-black/10"}`} /></div>
            </div>
          </div>
        </div>

        {/* RIGHT - RESULT */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-[28px] p-[1.5px] shadow-[0_20px_60px_rgba(255,122,26,0.3)]" style={{animation:'float 5s ease-in-out infinite'}}>
            <div className="bg-[#0A0A0F] rounded-[26px] p-7 text-white relative overflow-hidden">
              <p className="text-[11px] tracking-[0.3em] text-white/40 font-black">TOTAL NET PROFIT</p>
              <h2 className="text-[52px] font-black tracking-tighter mt-1 leading-none">${calc.net.toFixed(2)}<span className="text-[16px] opacity-50">/mo</span></h2>
              <p className="text-[11px] mt-2 opacity-60">Niche: {niche.name} | Country: {country.name}</p>

              <div className="grid grid-cols-2 gap-3 mt-6">
                <div className="bg-white/10 rounded-2xl p-3.5 border border-white/10"><p className="text-[9px] text-white/40 font-black">AdSense (55%)</p><p className="font-black text-[16px]">${calc.afterYtCut.toFixed(2)}</p></div>
                <div className="bg-white/10 rounded-2xl p-3.5 border border-white/10"><p className="text-[9px] text-white/40 font-black">Sponsorship</p><p className="font-black text-[16px]">${calc.sponsorship.toFixed(2)}</p></div>
                <div className="bg-white/10 rounded-2xl p-3.5 border border-white/10"><p className="text-[9px] text-white/40 font-black">Memberships</p><p className="font-black text-[16px]">${memberships.toFixed(2)}</p></div>
                <div className="bg-white/10 rounded-2xl p-3.5 border border-white/10"><p className="text-[9px] text-white/40 font-black">Super Thanks</p><p className="font-black text-[16px]">${superThanks.toFixed(2)}</p></div>
                <div className="bg-white/10 rounded-2xl p-3.5 border border-white/10"><p className="text-[9px] text-white/40 font-black">Tax ({tax}%)</p><p className="font-black text-[16px] text-red-400">-${calc.taxAmount.toFixed(2)}</p></div>
                <div className="bg-green-500/20 border border-green-500/30 rounded-2xl p-3.5"><p className="text-[9px] text-green-300 font-black">YEARLY</p><p className="font-black text-[16px] text-green-400">${calc.yearly.toFixed(0)}</p></div>
              </div>

              <div className="mt-4 bg-white/[0.06] rounded-xl p-3 flex justify-between text-[11px] font-bold"><span>RPM</span><span className="text-[#FF7A1A]">${calc.rpm.toFixed(2)}</span></div>

              <div className="grid grid-cols-2 gap-3 mt-4">
                <button onClick={handleCopy} className="py-3.5 bg-white text-black rounded-full font-black text-[13px] hover:bg-[#FF7A1A] hover:text-white transition-all active:scale-95">{copied ? "✓ Copied Report!" : "Copy Report 📊"}</button>
                <a href={`https://wa.me/?text=${encodeURIComponent(`📊 My YT Earnings: $${calc.net.toFixed(2)}/mo - Check yours`)}`} target="_blank" className="py-3.5 bg-white/10 border border-white/10 text-white rounded-full font-black text-[13px] text-center hover:bg-white/15 transition-all">Share</a>
              </div>
            </div>
          </div>

          {/* CHART - KEPT */}
          <div className={`glass border rounded-[20px] p-5 ${isDark ? "bg-white/[0.03] border-white/5" : "bg-white border-black/5 shadow"}`}>
            <h3 className="font-black text-[11px] tracking-widest uppercase">Revenue Split</h3>
            <div className="mt-4 space-y-2 text-[11px] font-bold">
              <div className="flex justify-between"><span>AdSense</span><span>{((calc.afterYtCut/calc.totalGross)*100 || 0).toFixed(0)}%</span></div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-orange-500 transition-all duration-700" style={{width:`${(calc.afterYtCut/calc.totalGross)*100}%`}}></div></div>
              <div className="flex justify-between"><span>Sponsor</span><span>{((calc.sponsorship/calc.totalGross)*100 || 0).toFixed(0)}%</span></div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-white/40 transition-all duration-700" style={{width:`${(calc.sponsorship/calc.totalGross)*100}%`}}></div></div>
            </div>
          </div>

          <div className={`h-[250px] rounded-[20px] border border-dashed flex items-center justify-center text-[11px] font-bold tracking-widest ${isDark ? "bg-white/[0.02] border-white/10 text-white/20" : "bg-black/[0.02]"}`}>AD SLOT - 300x250</div>
        </div>
      </div>
    </div>
  );
}
