"use client";
import { useState, useMemo } from "react";

const CURRENCIES = {
  USD: { symbol: "$", rate: 1 }, INR: { symbol: "₹", rate: 83.5 },
  EUR: { symbol: "€", rate: 0.92 }, GBP: { symbol: "£", rate: 0.79 },
  AED: { symbol: "AED ", rate: 3.67 }, CAD: { symbol: "C$", rate: 1.36 },
  AUD: { symbol: "A$", rate: 1.52 },
};
const NICHES = {
  "General / Vlog": 3.5, "Finance & Investing": 12, "Insurance": 15,
  "Tech & Gadgets": 6, "Education": 5, "Gaming": 2.5, "Cooking & Food": 3,
  "Beauty & Fashion": 4, "Fitness & Health": 5.5, "Crypto & Web3": 14,
  "Make Money Online": 13, "Real Estate": 10,
};
const COUNTRIES = {
  "India": 1.5, "USA": 12, "UK": 9, "Canada": 8.5,
  "Australia": 9.5, "Germany": 7.5, "UAE": 6.5, "Global Mix": 4,
};

export default function YouTubeEarningsCalculatorPro() {
  const [theme, setTheme] = useState("dark");
  const [currency, setCurrency] = useState("USD");
  const [views, setViews] = useState(250000);
  const [cpm, setCpm] = useState(3.8);
  const [sponsorRate, setSponsorRate] = useState(20);
  const [tax, setTax] = useState(10);
  const [copied, setCopied] = useState(false);
  const [subscribers, setSubscribers] = useState(50000);
  const [watchHours, setWatchHours] = useState(8000);
  const [isShorts, setIsShorts] = useState(false);
  const [memberships, setMemberships] = useState(0);
  const [superThanks, setSuperThanks] = useState(0);
  const [growthRate, setGrowthRate] = useState(5);
  const [niche, setNiche] = useState("General / Vlog");
  const [country, setCountry] = useState("India");
  const [saveMsg, setSaveMsg] = useState("");

  const isDark = theme === "dark";
  const curr = CURRENCIES[currency];

  const fmt = (usd) => {
    const val = usd * curr.rate;
    const sign = val < 0 ? "-" : "";
    const abs = Math.abs(val);
    if (abs >= 1000000) return sign + curr.symbol + (abs / 1000000).toFixed(2) + "M";
    if (abs >= 10000) return sign + curr.symbol + (abs / 1000).toFixed(1) + "K";
    return sign + curr.symbol + abs.toFixed(2);
  };
  const fmtFull = (usd) => (usd < 0 ? "-" : "") + curr.symbol + Math.abs(usd * curr.rate).toFixed(2);

  const calc = useMemo(() => {
    const shortsMult = isShorts ? 0.15 : 1;
    const effectiveCpm = cpm * shortsMult;
    const grossAdsense = (views / 1000) * effectiveCpm;
    const afterYtCut = grossAdsense * 0.55;
    const sponsorship = (views / 1000) * sponsorRate;
    const totalGross = afterYtCut + sponsorship + memberships + superThanks;
    const taxAmount = totalGross * (tax / 100);
    const net = totalGross - taxAmount;
    const yearly = net * 12;
    const rpm = effectiveCpm * 0.55;
    return { grossAdsense, afterYtCut, sponsorship, totalGross, taxAmount, net, yearly, rpm, effectiveCpm };
  }, [views, cpm, sponsorRate, tax, isShorts, memberships, superThanks]);

  const eligible = subscribers >= 1000 && watchHours >= 4000;

  const projections = useMemo(() => {
    const arr = []; let v = views;
    const shortsMult = isShorts ? 0.15 : 1;
    for (let i = 0; i < 12; i++) {
      const ad = (v / 1000) * cpm * shortsMult * 0.55;
      const sp = (v / 1000) * sponsorRate;
      const total = ad + sp + memberships + superThanks;
      arr.push({ month: i + 1, net: total * (1 - tax / 100), views: v });
      v = v * (1 + growthRate / 100);
    }
    return arr;
  }, [views, cpm, sponsorRate, tax, growthRate, isShorts, memberships, superThanks]);

  const maxProjection = Math.max(...projections.map((p) => p.net), 1);
  const totalYearly = projections.reduce((s, p) => s + p.net, 0);

  const scenariosData = useMemo(() => {
    const configs = [
      { name: "Pessimistic", gradient: "from-rose-500 to-orange-500", cpmMult: 0.5, spMult: 0.4 },
      { name: "Realistic", gradient: "from-blue-500 to-indigo-500", cpmMult: 1, spMult: 1 },
      { name: "Optimistic", gradient: "from-green-500 to-emerald-500", cpmMult: 1.8, spMult: 2 },
    ];
    return configs.map((c) => {
      const ad = (views / 1000) * calc.effectiveCpm * c.cpmMult * 0.55;
      const sp = (views / 1000) * sponsorRate * c.spMult;
      const total = ad + sp + memberships + superThanks;
      return { ...c, net: total * (1 - tax / 100) };
    });
  }, [views, calc.effectiveCpm, sponsorRate, tax, memberships, superThanks]);

  const handleNiche = (n) => { setNiche(n); setCpm(NICHES[n]); };
  const handleCountry = (c) => { setCountry(c); setCpm(COUNTRIES[c]); };

  const handleCopy = () => {
    const text = `📊 YouTube Earnings Report
━━━━━━━━━━━━━━━━
Views: ${views.toLocaleString()}
CPM: $${cpm}${isShorts ? " (Shorts)" : ""}
Niche: ${niche} | Country: ${country}
━━━━━━━━━━━━━━━━
AdSense (55%): ${fmtFull(calc.afterYtCut)}
Sponsorship: ${fmtFull(calc.sponsorship)}
Memberships: ${fmtFull(memberships)}
Super Thanks: ${fmtFull(superThanks)}
Tax (${tax}%): -${fmtFull(calc.taxAmount)}
━━━━━━━━━━━━━━━━
💰 NET: ${fmtFull(calc.net)}/mo
📈 YEARLY: ${fmtFull(calc.yearly)}
🎯 RPM: ${fmtFull(calc.rpm)}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportCSV = () => {
    const rows = [
      ["Metric", "USD", currency],
      ["Views", views, views],
      ["CPM", cpm, (cpm * curr.rate).toFixed(2)],
      ["AdSense (55%)", calc.afterYtCut.toFixed(2), (calc.afterYtCut * curr.rate).toFixed(2)],
      ["Sponsorship", calc.sponsorship.toFixed(2), (calc.sponsorship * curr.rate).toFixed(2)],
      ["Memberships", memberships.toFixed(2), (memberships * curr.rate).toFixed(2)],
      ["Super Thanks", superThanks.toFixed(2), (superThanks * curr.rate).toFixed(2)],
      ["Gross Total", calc.totalGross.toFixed(2), (calc.totalGross * curr.rate).toFixed(2)],
      ["Tax", calc.taxAmount.toFixed(2), (calc.taxAmount * curr.rate).toFixed(2)],
      ["Net Profit", calc.net.toFixed(2), (calc.net * curr.rate).toFixed(2)],
      ["Yearly Net", calc.yearly.toFixed(2), (calc.yearly * curr.rate).toFixed(2)],
      ["RPM", calc.rpm.toFixed(2), (calc.rpm * curr.rate).toFixed(2)],
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `youtube-earnings-${currency}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const handleSave = () => {
    try {
      localStorage.setItem("yt-calc-pro-v2", JSON.stringify({
        views, cpm, sponsorRate, tax, currency, subscribers, watchHours,
        isShorts, memberships, superThanks, growthRate, niche, country,
      }));
      setSaveMsg("✓ Saved!");
    } catch (e) { setSaveMsg("✗ Failed"); }
    setTimeout(() => setSaveMsg(""), 2000);
  };

  const handleLoad = () => {
    try {
      const d = JSON.parse(localStorage.getItem("yt-calc-pro-v2") || "null");
      if (!d) { setSaveMsg("Nothing saved"); setTimeout(() => setSaveMsg(""), 2000); return; }
      setViews(d.views); setCpm(d.cpm); setSponsorRate(d.sponsorRate); setTax(d.tax);
      setCurrency(d.currency || "USD"); setSubscribers(d.subscribers); setWatchHours(d.watchHours);
      setIsShorts(d.isShorts); setMemberships(d.memberships); setSuperThanks(d.superThanks);
      setGrowthRate(d.growthRate); setNiche(d.niche); setCountry(d.country);
      setSaveMsg("✓ Loaded!");
    } catch (e) { setSaveMsg("✗ Failed"); }
    setTimeout(() => setSaveMsg(""), 2000);
  };

  const handleReset = () => {
    setViews(250000); setCpm(3.8); setSponsorRate(20); setTax(10);
    setSubscribers(50000); setWatchHours(8000); setIsShorts(false);
    setMemberships(0); setSuperThanks(0); setGrowthRate(5);
    setNiche("General / Vlog"); setCountry("India");
    setSaveMsg("✓ Reset!"); setTimeout(() => setSaveMsg(""), 2000);
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 font-sans ${isDark ? "bg-[#05050A] text-white" : "bg-[#F8F8FF] text-black"}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;700;900&display=swap');
        *{font-family:'Geist',sans-serif}
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        .glass{backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);}
        .hover-lift{transition:all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)}
        .hover-lift:hover{transform:translateY(-4px) scale(1.02)}
      `}</style>

      {/* HEADER */}
      <div className="w-full p-3 sticky top-0 z-50">
        <header className={`max-w-[1250px] mx-auto glass border rounded-2xl px-4 py-3 flex justify-between items-center gap-2 ${isDark ? "bg-white/[0.06] border-white/[0.08]" : "bg-white/80 border-black/[0.06] shadow-[0_8px_32px_rgba(0,0,0,0.08)]"}`}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center font-black text-white shadow-lg flex-shrink-0">Y</div>
            <div className="hidden sm:block">
              <div className="font-black tracking-widest text-[13px]">YOUTUBE CALC PRO</div>
              <div className={`text-[10px] ${isDark ? "text-white/40" : "text-black/40"}`}>v2.0 · Advanced</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select value={currency} onChange={(e) => setCurrency(e.target.value)} className={`px-3 py-2 rounded-xl border text-[12px] font-black outline-none cursor-pointer ${isDark ? "bg-white/10 border-white/10 text-white" : "bg-black/5 border-black/10 text-black"}`}>
              {Object.keys(CURRENCIES).map((c) => (<option key={c} value={c}>{c}</option>))}
            </select>
            <button onClick={() => setTheme(isDark ? "light" : "dark")} className={`w-10 h-10 rounded-full border flex items-center justify-center hover-lift ${isDark ? "bg-white/10 border-white/10" : "bg-black/5 border-black/10"}`}>
              {isDark ? "🌙" : "☀️"}
            </button>
          </div>
        </header>
      </div>

      <div className="max-w-[1250px] mx-auto px-4 py-6 grid lg:grid-cols-[1.15fr_0.85fr] gap-5">
        {/* LEFT PANEL */}
        <div className="space-y-5">
          <div className={`glass border rounded-[28px] p-7 md:p-8 ${isDark ? "bg-white/[0.04] border-white/[0.06]" : "bg-white border-black/[0.05] shadow-xl"}`}>
            <div className="flex items-start justify-between flex-wrap gap-2">
              <h1 className="text-[30px] md:text-[40px] font-black leading-[0.9] tracking-tighter">YouTube Money<br /><span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">Calculator PRO v2</span></h1>
              {eligible ? (
                <div className="flex items-center gap-2 bg-green-500/15 border border-green-500/30 text-green-500 text-[10px] font-black px-3 py-1.5 rounded-full whitespace-nowrap"><span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> MONETIZED</div>
              ) : (
                <div className="flex items-center gap-2 bg-yellow-500/15 border border-yellow-500/30 text-yellow-500 text-[10px] font-black px-3 py-1.5 rounded-full whitespace-nowrap">⚠ NOT ELIGIBLE</div>
              )}
            </div>
            <p className={`text-[13px] mt-3 leading-relaxed ${isDark ? "text-white/50" : "text-black/60"}`}>AdSense + Sponsorship + Memberships + Tax = Real Net Profit. Multi-currency, niche-aware, growth-projected.</p>

            <div className="grid grid-cols-2 gap-3 mt-5">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest opacity-60">Niche Preset</label>
                <select value={niche} onChange={(e) => handleNiche(e.target.value)} className={`mt-2 w-full px-3 py-2.5 rounded-xl border text-[12px] font-bold outline-none cursor-pointer ${isDark ? "bg-black/40 border-white/10 text-white" : "bg-[#F5F5F7] border-black/5 text-black"}`}>
                  {Object.keys(NICHES).map((n) => <option key={n} value={n}>{n} (~${NICHES[n]})</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest opacity-60">Audience Country</label>
                <select value={country} onChange={(e) => handleCountry(e.target.value)} className={`mt-2 w-full px-3 py-2.5 rounded-xl border text-[12px] font-bold outline-none cursor-pointer ${isDark ? "bg-black/40 border-white/10 text-white" : "bg-[#F5F5F7] border-black/5 text-black"}`}>
                  {Object.keys(COUNTRIES).map((c) => <option key={c} value={c}>{c} (~${COUNTRIES[c]})</option>)}
                </select>
              </div>
            </div>

            <div className={`mt-4 flex items-center justify-between p-3 rounded-xl border ${isDark ? "border-white/10 bg-white/[0.02]" : "border-black/5 bg-black/[0.02]"}`}>
              <div>
                <div className="text-[12px] font-black">Content Type</div>
                <div className={`text-[10px] ${isDark ? "text-white/40" : "text-black/40"}`}>{isShorts ? "Shorts (0.15x CPM)" : "Long-form videos"}</div>
              </div>
              <div className="flex gap-1 bg-black/20 p-1 rounded-lg">
                <button onClick={() => setIsShorts(false)} className={`px-3 py-1.5 rounded-md text-[11px] font-black transition ${!isShorts ? "bg-orange-500 text-white" : isDark ? "text-white/60" : "text-black/60"}`}>Long</button>
                <button onClick={() => setIsShorts(true)} className={`px-3 py-1.5 rounded-md text-[11px] font-black transition ${isShorts ? "bg-orange-500 text-white" : isDark ? "text-white/60" : "text-black/60"}`}>Shorts</button>
              </div>
            </div>

            <div className={`mt-5 w-full h-[90px] rounded-xl border border-dashed flex items-center justify-center text-[11px] font-bold tracking-widest opacity-50 ${isDark ? "bg-white/[0.02] border-white/10" : "bg-black/[0.02] border-black/10"}`}>AD SLOT · 728×90 (High CPC)</div>

            <div className="mt-7 space-y-6">
              {[
                { label: "Monthly Views", value: views, min: 1000, max: 10000000, step: 5000, set: setViews, display: views.toLocaleString(), hint: "Avg Indian Channel: 50k–500k" },
                { label: "CPM Rate ($)", value: cpm, min: 0.2, max: 25, step: 0.1, set: setCpm, display: `$${cpm}`, hint: "India $0.5–$4 | USA $6–$22" },
                { label: "Sponsorship per 1000 views ($)", value: sponsorRate, min: 0, max: 100, step: 1, set: setSponsorRate, display: `$${sponsorRate}`, hint: "Avg $10–$30" },
              ].map((item, i) => (
                <div key={i} className="group">
                  <div className="flex justify-between items-end mb-2">
                    <label className="text-[12px] font-black tracking-wide uppercase opacity-80">{item.label}</label>
                    <span className="text-[#FF7A1A] font-black text-[16px]">{item.display}</span>
                  </div>
                  <input type="range" min={item.min} max={item.max} step={item.step} value={item.value} onChange={(e) => item.set(Number(e.target.value))} className="w-full accent-[#FF7A1A] h-[6px] rounded-full cursor-pointer group-hover:h-[10px] transition-all" />
                  <p className="text-[10px] mt-1 opacity-40">{item.hint}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div>
                <label className="text-[11px] font-black uppercase">Tax %</label>
                <input type="number" value={tax} onChange={(e) => setTax(Number(e.target.value) || 0)} className={`mt-2 w-full px-4 py-3.5 rounded-xl border outline-none font-bold transition-all focus:border-[#FF7A1A] focus:ring-4 focus:ring-orange-500/10 ${isDark ? "bg-black/50 border-white/10" : "bg-[#F5F5F7] border-black/5"}`} />
              </div>
              <div className={`rounded-xl p-3 border ${isDark ? "bg-orange-500/10 border-orange-500/20" : "bg-orange-50 border-orange-100"}`}>
                <p className="text-[10px] font-bold opacity-60">TAX AMOUNT</p>
                <p className="font-black text-[16px] text-[#FF7A1A]">-{fmt(calc.taxAmount)}</p>
              </div>
            </div>
          </div>

          {/* ADVANCED */}
          <div className={`glass border rounded-[24px] p-6 ${isDark ? "bg-white/[0.03] border-white/5" : "bg-white border-black/5 shadow-lg"}`}>
            <h3 className="font-black text-[13px] tracking-widest uppercase mb-4">⚡ Advanced Revenue & Analytics</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Memberships ($/mo)", v: memberships, s: setMemberships },
                { label: "Super Thanks ($/mo)", v: superThanks, s: setSuperThanks },
                { label: "Subscribers", v: subscribers, s: setSubscribers },
                { label: "Watch Hours (12mo)", v: watchHours, s: setWatchHours },
                { label: "Monthly Growth %", v: growthRate, s: setGrowthRate },
              ].map((f, i) => (
                <div key={i}>
                  <label className="text-[10px] font-black uppercase opacity-70">{f.label}</label>
                  <input type="number" value={f.v} onChange={(e) => f.s(Number(e.target.value) || 0)} className={`mt-2 w-full px-3 py-2.5 rounded-xl border outline-none font-bold text-[13px] ${isDark ? "bg-black/50 border-white/10" : "bg-[#F5F5F7] border-black/5"}`} />
                </div>
              ))}
              <div className={`rounded-xl p-3 border ${eligible ? "bg-green-500/10 border-green-500/30" : "bg-yellow-500/10 border-yellow-500/30"}`}>
                <p className="text-[9px] font-black opacity-60 uppercase">Monetization</p>
                <p className={`font-black text-[13px] ${eligible ? "text-green-500" : "text-yellow-500"}`}>{eligible ? "✓ Eligible" : "✗ Not yet"}</p>
              </div>
            </div>
            <p className={`text-[10px] mt-3 ${isDark ? "text-white/40" : "text-black/40"}`}>YouTube Partner Program needs 1,000 subs + 4,000 watch hours (12mo).</p>
          </div>

          {/* REVENUE CHART */}
          <div className={`glass border rounded-[24px] p-6 ${isDark ? "bg-white/[0.03] border-white/5" : "bg-white border-black/5 shadow-lg"}`}>
            <h3 className="font-black text-[13px] tracking-widest uppercase">Revenue Breakdown</h3>
            <div className="mt-5 flex items-end gap-2 h-[140px]">
              {[
                { label: "AdSense", val: calc.afterYtCut, cls: "bg-gradient-to-t from-orange-500 to-red-400" },
                { label: "Sponsor", val: calc.sponsorship, cls: isDark ? "bg-white/20" : "bg-black/20" },
                { label: "Member", val: memberships, cls: "bg-gradient-to-t from-purple-500 to-pink-400" },
                { label: "Thanks", val: superThanks, cls: "bg-gradient-to-t from-yellow-500 to-amber-400" },
                { label: "Net", val: calc.net, cls: "bg-gradient-to-t from-green-500 to-emerald-400" },
              ].map((b, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className={`w-full ${b.cls} rounded-t-lg transition-all duration-700 hover-lift`} style={{ height: `${Math.max(15, (b.val / Math.max(1, calc.totalGross)) * 100)}%` }}></div>
                  <span className="text-[9px] font-bold opacity-60 text-center">{b.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-[#FF7A1A] via-orange-600 to-red-600 rounded-[28px] p-[1.5px] shadow-[0_20px_60px_rgba(255,122,26,0.3)]" style={{ animation: "float 5s ease-in-out infinite" }}>
            <div className="bg-[#0A0A0F] rounded-[26px] p-7 relative overflow-hidden text-white">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-orange-500/30 blur-[80px] rounded-full pointer-events-none" />
              <p className="text-[11px] tracking-[0.3em] text-white/40 font-black">TOTAL NET PROFIT</p>
              <h2 className="text-[44px] font-black tracking-tighter mt-1 leading-none">{fmt(calc.net)}<span className="text-[16px] opacity-50">/mo</span></h2>
              <p className="text-[11px] mt-1 text-white/50">≈ {fmt(calc.yearly)}/year · {curr.symbol}{(calc.net * curr.rate).toLocaleString(undefined, { maximumFractionDigits: 0 })} exact</p>

              <div className="grid grid-cols-2 gap-3 mt-5">
                {[
                  { k: "AdSense (55%)", v: fmt(calc.afterYtCut) },
                  { k: "Sponsorship", v: fmt(calc.sponsorship) },
                  { k: "Memberships", v: fmt(memberships) },
                  { k: "Super Thanks", v: fmt(superThanks) },
                  { k: "Gross Total", v: fmt(calc.totalGross) },
                  { k: "Tax Cut", v: "-" + fmt(calc.taxAmount) },
                ].map((b, i) => (
                  <div key={i} className="bg-white/[0.06] border border-white/[0.08] rounded-2xl p-3 hover:bg-white/[0.1] transition hover-lift">
                    <p className="text-[9px] tracking-widest text-white/40 font-black">{b.k}</p>
                    <p className="font-black text-[16px] mt-1">{b.v}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 bg-white/[0.06] border border-white/[0.08] rounded-2xl p-3 flex justify-between items-center">
                <p className="text-[10px] tracking-widest text-white/50 font-black">RPM / 1000 views</p>
                <p className="font-black text-[16px] text-[#FF7A1A]">{fmt(calc.rpm)}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4">
                <button onClick={handleCopy} className="py-3 bg-white text-black rounded-full font-black text-[12px] hover:bg-[#FF7A1A] hover:text-white transition-all active:scale-95 hover-lift">{copied ? "✓ Copied!" : "📋 Copy Report"}</button>
                <a href={`https://wa.me/?text=My YouTube Earnings is ${fmt(calc.net)}/mo - Check yours!`} target="_blank" rel="noreferrer" className="py-3 bg-white/10 border border-white/10 text-white rounded-full font-black text-[12px] text-center hover:bg-white/15 transition-all active:scale-95 hover-lift">📤 Share</a>
              </div>
            </div>
          </div>

          {/* ACTIONS */}
          <div className={`glass border rounded-[20px] p-4 ${isDark ? "bg-white/[0.03] border-white/5" : "bg-white border-black/5 shadow"}`}>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={handleSave} className={`py-2.5 rounded-xl font-black text-[11px] transition hover-lift ${isDark ? "bg-white/10 hover:bg-white/15" : "bg-black/5 hover:bg-black/10"}`}>💾 Save</button>
              <button onClick={handleLoad} className={`py-2.5 rounded-xl font-black text-[11px] transition hover-lift ${isDark ? "bg-white/10 hover:bg-white/15" : "bg-black/5 hover:bg-black/10"}`}>📂 Load</button>
              <button onClick={handleExportCSV} className={`py-2.5 rounded-xl font-black text-[11px] transition hover-lift ${isDark ? "bg-green-500/20 text-green-400 hover:bg-green-500/30" : "bg-green-100 text-green-700 hover:bg-green-200"}`}>📊 CSV</button>
            </div>
            <button onClick={handleReset} className={`w-full mt-2 py-2 rounded-xl font-black text-[11px] transition ${isDark ? "bg-red-500/10 text-red-400 hover:bg-red-500/20" : "bg-red-50 text-red-600 hover:bg-red-100"}`}>↻ Reset All</button>
            {saveMsg && <p className="text-center text-[11px] mt-2 font-black text-green-500">{saveMsg}</p>}
          </div>

          <div className={`h-[250px] rounded-[20px] border border-dashed flex items-center justify-center text-[11px] font-bold tracking-widest ${isDark ? "bg-white/[0.02] border-white/10 text-white/30" : "bg-black/[0.02] border-black/10 text-black/30"}`}>AD SLOT · 300×250 (High CPC)</div>

          <div className={`glass border rounded-[20px] p-5 ${isDark ? "bg-white/[0.02] border-white/5" : "bg-white border-black/5 shadow"}`}>
            <h3 className="font-black text-[12px] tracking-widest">FAQ · SEO BOOST</h3>
            <div className={`mt-3 space-y-3 text-[11px] leading-relaxed ${isDark ? "opacity-70" : "opacity-80"}`}>
              <p><b>What is YouTube CPM?</b> Cost per 1000 impressions. Higher in Finance/Insurance niches.</p>
              <p><b>How much does YouTube pay?</b> Creators get 55% of AdSense revenue, YouTube keeps 45%.</p>
              <p><b>What are high CPC niches?</b> Insurance, Crypto, Finance, Make Money Online ($10–15+ CPM).</p>
              <p><b>Shorts vs Long-form?</b> Shorts pay 0.1x–0.2x less but can drive massive views.</p>
              <p><b>What is RPM?</b> Revenue per 1000 views = CPM × 0.55 (after YouTube&apos;s cut).</p>
              <p><b>India vs USA CPM?</b> India $0.5–$4, USA $6–$22 depending on niche & season.</p>
            </div>
          </div>
        </div>
      </div>

      {/* PROJECTIONS */}
      <div className="max-w-[1250px] mx-auto px-4 pb-6 space-y-5">
        <div className={`glass border rounded-[24px] p-6 ${isDark ? "bg-white/[0.03] border-white/5" : "bg-white border-black/5 shadow-lg"}`}>
          <div className="flex justify-between items-center flex-wrap gap-2">
            <h3 className="font-black text-[14px] tracking-widest uppercase">📈 12-Month Projection</h3>
            <div className="flex gap-2 flex-wrap">
              <div className="px-3 py-1 rounded-full bg-orange-500/15 border border-orange-500/20 text-orange-500 text-[11px] font-black">Growth: {growthRate}%/mo</div>
              <div className="px-3 py-1 rounded-full bg-green-500/15 border border-green-500/20 text-green-500 text-[11px] font-black">Year: {fmt(totalYearly)}</div>
            </div>
          </div>
          <div className="mt-5 flex items-end gap-1 h-[160px]">
            {projections.map((p, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                <div className="text-[9px] font-black opacity-0 group-hover:opacity-100 transition-opacity text-[#FF7A1A] whitespace-nowrap">{fmt(p.net)}</div>
                <div className="w-full bg-gradient-to-t from-orange-500 to-red-400 rounded-t transition-all duration-700 hover-lift" style={{ height: `${Math.max(8, (p.net / maxProjection) * 100)}%` }}></div>
                <span className="text-[8px] font-bold opacity-50">M{p.month}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {scenariosData.map((s, i) => (
            <div key={i} className={`glass border rounded-[20px] p-5 ${isDark ? "bg-white/[0.03] border-white/5" : "bg-white border-black/5 shadow"}`}>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center text-white font-black text-[14px] mb-3`}>{s.name[0]}</div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-50">{s.name} Case</p>
              <p className="text-[24px] font-black mt-1">{fmt(s.net)}<span className="text-[12px] opacity-40">/mo</span></p>
              <p className="text-[10px] mt-1 opacity-50">{fmt(s.net * 12)}/year</p>
            </div>
          ))}
        </div>

        <div className={`text-center text-[10px] py-4 ${isDark ? "text-white/30" : "text-black/30"}`}>💡 Estimates only. Actual earnings vary by watch time, engagement, geography, ad season, and YouTube policy changes.</div>
      </div>
    </div>
  );
}
