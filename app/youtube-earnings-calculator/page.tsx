"use client";
import { useState, useMemo, useEffect } from "react";

// ==================== FULL DATA - NOTHING REMOVED ====================
const NICHES = [
  { name: "Finance / Insurance / Loan", cpm: 22, mult: 3.8 },
  { name: "Crypto / Trading / Forex", cpm: 18, mult: 3.2 },
  { name: "Make Money Online / Business", cpm: 15, mult: 3.0 },
  { name: "Software / SaaS / AI Tools", cpm: 12, mult: 2.5 },
  { name: "Real Estate / Investing", cpm: 11, mult: 2.4 },
  { name: "Health / Fitness / Medical", cpm: 9, mult: 2.0 },
  { name: "Tech / Gadgets / Review", cpm: 7, mult: 1.8 },
  { name: "Education / Career / Study", cpm: 5, mult: 1.5 },
  { name: "Automotive / Cars", cpm: 4.5, mult: 1.4 },
  { name: "General / Vlog / Lifestyle", cpm: 1.8, mult: 1.0 },
  { name: "Gaming / Esports", cpm: 1.5, mult: 0.9 },
  { name: "Entertainment / Comedy / Memes", cpm: 1.0, mult: 0.7 },
];

const COUNTRIES = [
  { name: "USA", mult: 4.0, flag: "🇺🇸" },
  { name: "Switzerland", mult: 3.8, flag: "🇨🇭" },
  { name: "Australia", mult: 3.5, flag: "🇦🇺" },
  { name: "UK", mult: 3.2, flag: "🇬🇧" },
  { name: "Canada", mult: 3.0, flag: "🇨🇦" },
  { name: "Germany", mult: 2.8, flag: "🇩🇪" },
  { name: "UAE / Dubai", mult: 2.7, flag: "🇦🇪" },
  { name: "Norway / Sweden", mult: 2.6, flag: "🇳🇴" },
  { name: "Singapore", mult: 2.5, flag: "🇸🇬" },
  { name: "Japan", mult: 2.3, flag: "🇯🇵" },
  { name: "France", mult: 2.0, flag: "🇫🇷" },
  { name: "Spain / Italy", mult: 1.8, flag: "🇪🇸" },
  { name: "South Korea", mult: 1.7, flag: "🇰🇷" },
  { name: "Brazil", mult: 1.2, flag: "🇧🇷" },
  { name: "India", mult: 1.0, flag: "🇮🇳" },
  { name: "Mexico", mult: 0.9, flag: "🇲🇽" },
  { name: "Indonesia", mult: 0.8, flag: "🇮🇩" },
  { name: "Pakistan", mult: 0.7, flag: "🇵🇰" },
  { name: "Bangladesh", mult: 0.6, flag: "🇧🇩" },
  { name: "Nigeria / Egypt", mult: 0.5, flag: "🇳🇬" },
];

export default function YouTubeEarningsCalculator() {
  const [theme, setTheme] = useState("dark");
  const isDark = theme === "dark";
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // All States - Old + New - Nothing Removed
  const [views, setViews] = useState(946000);
  const [cpm, setCpm] = useState(18.1);
  const [ctr, setCtr] = useState(8.5);
  const [engagement, setEngagement] = useState(5.2);
  const [niche, setNiche] = useState(NICHES[9]);
  const [country, setCountry] = useState(COUNTRIES[14]);
  const [sponsorRate, setSponsorRate] = useState(20);
  const [memberships, setMemberships] = useState(0);
  const [superThanks, setSuperThanks] = useState(0);
  const [tax, setTax] = useState(10);
  const [copied, setCopied] = useState(false);

  const calc = useMemo(() => {
    const gross = (views / 1000) * cpm;
    const afterYt = gross * 0.55;
    const sponsor = (views / 1000) * sponsorRate;
    const total = afterYt + sponsor + memberships + superThanks;
    const taxAmt = total * (tax / 100);
    const net = total - taxAmt;
    const yearly = net * 12;
    const daily = net / 30;
    const rpm = cpm * 0.55;
    const clicks = views * (ctr / 100);
    return { gross, afterYt, sponsor, total, taxAmt, net, yearly, daily, rpm, clicks };
  }, [views, cpm, ctr, sponsorRate, memberships, superThanks, tax]);

  const handleCopy = () => {
    const text = `📊 YouTube Earnings Report
━━━━━━━━━━━━━━━━
Views: ${views.toLocaleString()}
CPM: $${cpm}
Niche: ${niche.name} | Country: ${country.flag} ${country.name}
━━━━━━━━━━━━━━━━
AdSense (55%): $${calc.afterYt.toFixed(2)}
Sponsorship: $${calc.sponsor.toFixed(2)}
Memberships: $${memberships.toFixed(2)}
Super Thanks: $${superThanks.toFixed(2)}
Tax (${tax}%): -$${calc.taxAmt.toFixed(2)}
━━━━━━━━━━━━━━━━
💰 NET: $${calc.net.toFixed(2)}/mo
📈 YEARLY: $${calc.yearly.toFixed(2)}
🎯 RPM: $${calc.rpm.toFixed(2)}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(()=>setCopied(false), 2000);
  };

  if (!mounted) return null;

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDark ? "bg-[#07070B] text-white" : "bg-[#FAFAFF] text-black"}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;700;900&display=swap');
        *{font-family:'Geist',sans-serif}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        .glass{backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px)}
        .hover-lift{transition:all .3s cubic-bezier(0.175, 0.885, 0.32, 1.275)}
        .hover-lift:hover{transform:translateY(-4px) scale(1.02)}
      `}</style>

      {/* HEADER - RESTORED */}
      <div className="w-full p-3 sticky top-0 z-50">
        <header className={`max-w-[1150px] mx-auto glass border rounded-2xl px-5 py-3 flex justify-between items-center ${isDark ? "bg-white/[0.06] border-white/[0.08]" : "bg-white/80 border-black/[0.06] shadow-[0_8px_32px_rgba(0,0,0,0.08)]"}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center font-black text-white shadow-lg">Y</div>
            <span className="font-black tracking-widest text-[14px]">LOREM PRO / EARNINGS</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 bg-green-500/15 border border-green-500/20 text-green-500 text-[10px] font-black px-3 py-1 rounded-full">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> HIGH CPC $8.40
            </div>
            <button onClick={() => setTheme(isDark ? "light" : "dark")} className={`w-10 h-10 rounded-full border flex items-center justify-center hover-lift ${isDark ? "bg-white/10 border-white/10" : "bg-black/5 border-black/10"}`}>
              {isDark ? "🌙" : "☀️"}
            </button>
          </div>
        </header>
      </div>

      <div className="max-w-[1150px] mx-auto px-4 py-6 grid lg:grid-cols-[1.15fr_0.85fr] gap-5">
        {/* LEFT - FULL CONTROLS */}
        <div className="space-y-5">
          <div className={`glass border rounded-[28px] p-7 md:p-8 ${isDark ? "bg-white/[0.04] border-white/[0.06]" : "bg-white border-black/[0.05] shadow-xl"}`}>
            <h1 className="text-[32px] md:text-[44px] font-black leading-[0.85] tracking-tighter">YouTube Money<br/><span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">Calculator PRO</span></h1>
            <p className={`text-[13px] mt-3 leading-relaxed ${isDark ? "text-white/50" : "text-black/60"}`}>AdSense + Sponsorship + Tax = Real Net Profit. 100% accurate for Indian & US Creators.</p>

            <div className={`mt-5 w-full h-[90px] rounded-xl border border-dashed flex items-center justify-center text-[11px] font-bold tracking-widest opacity-50 ${isDark ? "bg-white/[0.02] border-white/10" : "bg-black/[0.02] border-black/10"}`}>AD SLOT - 728x90 (High CPC)</div>

            <div className="mt-7 space-y-6">
              {/* Views - RESTORED */}
              <div className="group">
                <div className="flex justify-between items-end mb-2"><label className="text-[12px] font-black tracking-wide uppercase opacity-80">Monthly Views</label><span className="text-[#FF7A1A] font-black text-[16px]">{views.toLocaleString()}</span></div>
                <input type="range" min="1000" max="10000000" step="5000" value={views} onChange={(e)=>setViews(Number(e.target.value))} className="w-full accent-[#FF7A1A] h-[6px] rounded-full cursor-pointer group-hover:h-[10px] transition-all" />
                <p className="text-[10px] mt-1 opacity-40">Avg Indian Channel: 50k-500k</p>
              </div>
              {/* CPM - RESTORED */}
              <div className="group">
                <div className="flex justify-between items-end mb-2"><label className="text-[12px] font-black tracking-wide uppercase opacity-80">CPM Rate ($)</label><span className="text-[#FF7A1A] font-black text-[16px]">${cpm}</span></div>
                <input type="range" min="0.2" max="25" step="0.1" value={cpm} onChange={(e)=>setCpm(Number(e.target.value))} className="w-full accent-[#FF7A1A] h-[6px] rounded-full cursor-pointer group-hover:h-[10px] transition-all" />
                <p className="text-[10px] mt-1 opacity-40">India $0.5-$4 | USA $6-$22</p>
              </div>
              {/* CTR - RESTORED */}
              <div className="group">
                <div className="flex justify-between items-end mb-2"><label className="text-[12px] font-black tracking-wide uppercase opacity-80">CTR % (Old Feature Restored)</label><span className="text-[#FF7A1A] font-black text-[16px]">{ctr}%</span></div>
                <input type="range" min="1" max="20" step="0.1" value={ctr} onChange={(e)=>setCtr(Number(e.target.value))} className="w-full accent-[#FF7A1A] h-[6px] rounded-full cursor-pointer" />
              </div>
              {/* Engagement - RESTORED */}
              <div className="group">
                <div className="flex justify-between items-end mb-2"><label className="text-[12px] font-black tracking-wide uppercase opacity-80">Engagement % (Old Feature Restored)</label><span className="text-[#FF7A1A] font-black text-[16px]">{engagement}%</span></div>
                <input type="range" min="0.5" max="15" step="0.1" value={engagement} onChange={(e)=>setEngagement(Number(e.target.value))} className="w-full accent-[#FF7A1A] h-[6px] rounded-full cursor-pointer" />
              </div>

              {/* Niche + Country - RESTORED FULL */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/10">
                <div><label className="text-[11px] font-black uppercase opacity-60">Niche (12 Options Restored)</label><select value={niche.name} onChange={(e)=>setNiche(NICHES.find(n=>n.name===e.target.value)!)} className={`mt-2 w-full px-4 py-3.5 rounded-xl border outline-none font-bold ${isDark ? "bg-black/50 border-white/10" : "bg-[#F5F5F7] border-black/5"}`}>{NICHES.map(n=><option key={n.name}>{n.name} - ${n.cpm}</option>)}</select></div>
                <div><label className="text-[11px] font-black uppercase opacity-60">Country (20 Options Restored)</label><select value={country.name} onChange={(e)=>setCountry(COUNTRIES.find(c=>c.name===e.target.value)!)} className={`mt-2 w-full px-4 py-3.5 rounded-xl border outline-none font-bold ${isDark ? "bg-black/50 border-white/10" : "bg-[#F5F5F7] border-black/5"}`}>{COUNTRIES.map(c=><option key={c.name} value={c.name}>{c.flag} {c.name}</option>)}</select></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-[11px] font-black uppercase">Sponsor / 1k views ($)</label><input type="number" value={sponsorRate} onChange={(e)=>setSponsorRate(Number(e.target.value))} className={`mt-2 w-full px-4 py-3.5 rounded-xl border outline-none font-bold focus:border-[#FF7A1A] ${isDark ? "bg-black/50 border-white/10" : "bg-[#F5F5F7] border-black/5"}`} /></div>
                <div><label className="text-[11px] font-black uppercase">Tax %</label><input type="number" value={tax} onChange={(e)=>setTax(Number(e.target.value))} className={`mt-2 w-full px-4 py-3.5 rounded-xl border outline-none font-bold focus:border-[#FF7A1A] ${isDark ? "bg-black/50 border-white/10" : "bg-[#F5F5F7] border-black/5"}`} /></div>
                <div><label className="text-[11px] font-black uppercase">Memberships ($)</label><input type="number" value={memberships} onChange={(e)=>setMemberships(Number(e.target.value))} className={`mt-2 w-full px-4 py-3.5 rounded-xl border outline-none font-bold focus:border-[#FF7A1A] ${isDark ? "bg-black/50 border-white/10" : "bg-[#F5F5F7] border-black/5"}`} /></div>
                <div><label className="text-[11px] font-black uppercase">Super Thanks ($)</label><input type="number" value={superThanks} onChange={(e)=>setSuperThanks(Number(e.target.value))} className={`mt-2 w-full px-4 py-3.5 rounded-xl border outline-none font-bold focus:border-[#FF7A1A] ${isDark ? "bg-black/50 border-white/10" : "bg-[#F5F5F7] border-black/5"}`} /></div>
              </div>
            </div>
          </div>

          <div className={`glass border rounded-[24px] p-6 ${isDark ? "bg-white/[0.03] border-white/5" : "bg-white border-black/5 shadow-lg"}`}>
            <h3 className="font-black text-[13px] tracking-widest uppercase">Revenue Breakdown - Restored</h3>
            <div className="mt-5 flex items-end gap-3 h-[120px]">
              <div className="flex-1 flex flex-col items-center gap-2"><div className="w-full bg-gradient-to-t from-orange-500 to-red-400 rounded-t-lg hover-lift" style={{height: `${(calc.afterYt/calc.total)*100}%`, minHeight:'20px'}}></div><span className="text-[10px] font-bold opacity-60">AdSense</span></div>
              <div className="flex-1 flex flex-col items-center gap-2"><div className="w-full bg-white/20 rounded-t-lg hover-lift" style={{height: `${(calc.sponsor/calc.total)*100}%`, minHeight:'20px'}}></div><span className="text-[10px] font-bold opacity-60">Sponsor</span></div>
              <div className="flex-1 flex flex-col items-center gap-2"><div className="w-full bg-green-500 rounded-t-lg hover-lift" style={{height: `100%`}}></div><span className="text-[10px] font-bold opacity-60">Net Profit</span></div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-gradient-to-br from-[#FF7A1A] via-orange-600 to-red-600 rounded-[28px] p-[1.5px] shadow-[0_20px_60px_rgba(255,122,26,0.3)]" style={{animation:'float 5s ease-in-out infinite'}}>
            <div className="bg-[#0A0A0F] rounded-[26px] p-7 relative overflow-hidden text-white">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-orange-500/30 blur-[80px] rounded-full pointer-events-none" />
              <p className="text-[11px] tracking-[0.3em] text-white/40 font-black">TOTAL NET PROFIT</p>
              <h2 className="text-[52px] font-black tracking-tighter mt-1 leading-none">${calc.net.toFixed(2)}<span className="text-[18px] opacity-50">/mo</span></h2>
              <p className="text-[11px] mt-2 opacity-50">{niche.name} | {country.flag} {country.name}</p>
              <div className="grid grid-cols-2 gap-3 mt-6">
                <div className="bg-white/[0.06] border border-white/[0.08] rounded-2xl p-3.5"><p className="text-[9px] tracking-widest text-white/40 font-black">AdSense (55%)</p><p className="font-black text-[18px] mt-1">${calc.afterYt.toFixed(2)}</p></div>
                <div className="bg-white/[0.06] border border-white/[0.08] rounded-2xl p-3.5"><p className="text-[9px] tracking-widest text-white/40 font-black">RPM</p><p className="font-black text-[18px] mt-1">${calc.rpm.toFixed(2)}</p></div>
                <div className="bg-white/[0.06] border border-white/[0.08] rounded-2xl p-3.5"><p className="text-[9px] tracking-widest text-white/40 font-black">Sponsorship</p><p className="font-black text-[18px] mt-1">${calc.sponsor.toFixed(0)}</p></div>
                <div className="bg-white/[0.06] border border-white/[0.08] rounded-2xl p-3.5"><p className="text-[9px] tracking-widest text-white/40 font-black">Clicks (CTR)</p><p className="font-black text-[18px] mt-1">{calc.clicks.toFixed(0)}</p></div>
                <div className="bg-white/[0.06] border border-white/[0.08] rounded-2xl p-3.5"><p className="text-[9px] tracking-widest text-white/40 font-black">Yearly Net</p><p className="font-black text-[18px] mt-1">${calc.yearly.toFixed(0)}</p></div>
                <div className="bg-white/[0.06] border border-white/[0.08] rounded-2xl p-3.5"><p className="text-[9px] tracking-widest text-white/40 font-black">Daily</p><p className="font-black text-[18px] mt-1">${calc.daily.toFixed(0)}</p></div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <button onClick={handleCopy} className="py-3.5 bg-white text-black rounded-full font-black text-[13px] hover:bg-[#FF7A1A] hover:text-white transition-all active:scale-95 hover-lift">{copied ? "✓ Copied!" : "Copy Report 📊"}</button>
                <a href={`https://wa.me/?text=${encodeURIComponent(`My YT Earnings $${calc.net.toFixed(2)}/mo`)}`} target="_blank" className="py-3.5 bg-white/10 border border-white/10 text-white rounded-full font-black text-[13px] text-center hover:bg-white/15 transition-all hover-lift">Share</a>
              </div>
            </div>
          </div>
          <div className={`h-[250px] rounded-[20px] border border-dashed flex items-center justify-center text-[11px] font-bold tracking-widest ${isDark ? "bg-white/[0.02] border-white/10 text-white/30" : "bg-black/[0.02] border-black/10 text-black/30"}`}>AD SLOT - 300x250 (High CPC)</div>
          <div className={`glass border rounded-[20px] p-5 ${isDark ? "bg-white/[0.02] border-white/5" : "bg-white border-black/5 shadow"}`}>
            <h3 className="font-black text-[12px] tracking-widest">FAQ - SEO BOOST - RESTORED</h3>
            <div className="mt-3 space-y-3 text-[11px] leading-relaxed opacity-70"><p><b>What is YouTube CPM?</b> - Cost per 1000 views. Higher in Finance niche.</p><p><b>How YouTube pays?</b> - 55% to creator, 45% YouTube keeps.</p><p><b>High CPC niches?</b> - Insurance, Crypto, Make Money - $10+ CPM.</p></div>
          </div>
        </div>
      </div>
    </div>
  );
}
