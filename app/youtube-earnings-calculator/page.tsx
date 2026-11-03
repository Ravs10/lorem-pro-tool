"use client";
import { useState, useMemo, useEffect } from "react";
import Head from "next/head";

// ==================== DATA ====================
const NICHES = [
  { name: "Finance / Insurance / Loan", cpm: 22.0 },
  { name: "Crypto / Trading / Forex", cpm: 18.0 },
  { name: "Make Money Online / Business", cpm: 15.0 },
  { name: "Software / SaaS / AI Tools", cpm: 12.0 },
  { name: "Real Estate / Investing", cpm: 11.0 },
  { name: "Health / Fitness / Medical", cpm: 9.0 },
  { name: "Tech / Gadgets / Review", cpm: 7.0 },
  { name: "Education / Career / Study", cpm: 5.0 },
  { name: "Automotive / Cars", cpm: 4.5 },
  { name: "General / Vlog / Lifestyle", cpm: 1.8 },
  { name: "Gaming / Esports", cpm: 1.5 },
  { name: "Entertainment / Comedy / Memes", cpm: 1.0 },
];

const COUNTRIES = [
  { name: "USA", mult: 4.0, flag: "🇺🇸" },
  { name: "UK", mult: 3.2, flag: "🇬🇧" },
  { name: "Canada", mult: 3.0, flag: "🇨🇦" },
  { name: "Australia", mult: 3.5, flag: "🇦🇺" },
  { name: "Germany", mult: 2.8, flag: "🇩🇪" },
  { name: "UAE / Dubai", mult: 2.7, flag: "🇦🇪" },
  { name: "India", mult: 1.0, flag: "🇮🇳" },
  { name: "Pakistan", mult: 0.7, flag: "🇵🇰" },
  { name: "Bangladesh", mult: 0.6, flag: "🇧🇩" },
];

const EXCHANGE_RATE = 83;

export default function YouTubeEarningsCalculator() {
  const [theme, setTheme] = useState("dark");
  const isDark = theme === "dark";
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // ALL STATES - NOTHING REMOVED
  const [currency, setCurrency] = useState<"USD" | "INR">("USD");
  const [views, setViews] = useState(100000);
  const [cpm, setCpm] = useState(1.8);
  const [ctr, setCtr] = useState(5.0);
  const [engagement, setEngagement] = useState(5.2);
  const [niche, setNiche] = useState(NICHES[9]);
  const [country, setCountry] = useState(COUNTRIES[6]);
  const [sponsorRate, setSponsorRate] = useState(5);
  const [memberships, setMemberships] = useState(0);
  const [superThanks, setSuperThanks] = useState(0);
  const [tax, setTax] = useState(10);
  const [growthRate, setGrowthRate] = useState(5);
  const [copied, setCopied] = useState(false);
  
  const [openGuide, setOpenGuide] = useState(false);
  const [openFaq, setOpenFaq] = useState<string | null>("q1");

  const handleNicheChange = (name: string) => {
    const selected = NICHES.find(n => n.name === name)!;
    setNiche(selected);
    setCpm(selected.cpm * country.mult);
  };
  
  const handleCountryChange = (name: string) => {
    const selected = COUNTRIES.find(c => c.name === name)!;
    setCountry(selected);
    setCpm(niche.cpm * selected.mult);
  };

  const calc = useMemo(() => {
    const gross = (views / 1000) * cpm;
    const afterYt = gross * 0.55;
    const sponsor = (views / 1000) * sponsorRate;
    const totalGross = afterYt + sponsor + memberships + superThanks;
    const taxAmt = totalGross * (tax / 100);
    const net = totalGross - taxAmt;
    const rpm = cpm * 0.55;
    const clicks = views * (ctr / 100);

    const projection = Array.from({ length: 6 }, (_, i) => {
      const futureViews = views * Math.pow(1 + growthRate / 100, i);
      const futureNet = net * Math.pow(1 + growthRate / 100, i);
      return { month: i + 1, views: Math.round(futureViews), net: futureNet };
    });

    const fmt = (val: number) => {
      const finalVal = currency === "INR" ? val * EXCHANGE_RATE : val;
      return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
        style: "currency",
        currency: currency === "INR" ? "INR" : "USD",
        maximumFractionDigits: 0,
      }).format(finalVal);
    };

    return { gross, afterYt, sponsor, totalGross, taxAmt, net, rpm, clicks, projection, fmt };
  }, [views, cpm, ctr, sponsorRate, memberships, superThanks, tax, growthRate, currency, niche, country]);

  const handleCopy = () => {
    const text = `📊 YouTube Earnings Report (${currency})\n━━━━━━━━━━━━━━━━\nViews: ${views.toLocaleString()}\nNiche: ${niche.name}\nCountry: ${country.flag} ${country.name}\n━━━━━━━━━━━━━━━━\nAdSense (55%): ${calc.fmt(calc.afterYt)}\nSponsorship: ${calc.fmt(calc.sponsor)}\nMemberships: ${calc.fmt(memberships)}\nSuper Thanks: ${calc.fmt(superThanks)}\nTax (${tax}%): -${calc.fmt(calc.taxAmt)}\n━━━━━━━━━━━━━━━━\n💰 NET MONTHLY: ${calc.fmt(calc.net)}\n🎯 RPM: ${calc.fmt(calc.rpm)}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportCSV = () => {
    const rows = [
      ["Metric", "Value"],
      ["Monthly Views", views],
      ["CPM", cpm],
      ["CTR %", ctr],
      ["Engagement %", engagement],
      ["Niche", niche.name],
      ["Country", country.name],
      ["Net Monthly Earnings", calc.net.toFixed(2)],
      ["AdSense (55%)", calc.afterYt.toFixed(2)],
      ["Sponsorship", calc.sponsor.toFixed(2)],
      ["Memberships", memberships.toFixed(2)],
      ["Super Thanks", superThanks.toFixed(2)],
      ["Tax Deducted", calc.taxAmt.toFixed(2)],
    ];
    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "youtube_earnings_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!mounted) return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "name": "Advanced YouTube Earnings Calculator 2024",
        "applicationCategory": "FinanceApplication",
        "operatingSystem": "Web",
        "description": "Calculate your exact YouTube earnings with AdSense CPM, sponsorships, memberships, super thanks, and tax deductions. Supports USD and INR.",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "What is YouTube CPM and RPM?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "CPM (Cost Per Mille) is what advertisers pay per 1,000 views. RPM (Revenue Per Mille) is what you actually earn per 1,000 views after YouTube takes its 45% cut."
            }
          },
          {
            "@type": "Question",
            "name": "How much does YouTube pay for 1 million views in India?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "In India, the average CPM ranges from $0.50 to $4.00. For 1 million views, a creator can expect to earn between $300 to $2,200 (₹25,000 to ₹1,80,000) from AdSense alone, excluding sponsorships."
            }
          }
        ]
      }
    ]
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDark ? "bg-[#07070B] text-white" : "bg-[#FAFAFF] text-black"}`}>
      <Head>
        <title>YouTube Earnings Calculator 2024 | Accurate CPM, RPM & Tax Estimator</title>
        <meta name="description" content="Calculate your exact YouTube earnings with our advanced calculator. Includes AdSense CPM, RPM, sponsorships, memberships, Super Thanks, and tax deductions. Supports USD & INR." />
        <meta name="keywords" content="youtube earnings calculator, youtube cpm calculator, youtube rpm calculator, how much does youtube pay, youtube money calculator india, youtube revenue estimator" />
        <meta property="og:title" content="Advanced YouTube Earnings Calculator 2024" />
        <meta property="og:description" content="Calculate exact YouTube earnings with AdSense, sponsorships, and tax. Free, accurate, and instant." />
        <meta property="og:type" content="website" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </Head>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;600;800;900&display=swap');
        * { font-family: 'Geist', sans-serif; }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        .glass { backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); }
        .hover-lift { transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .hover-lift:hover { transform: translateY(-4px) scale(1.02); }
        .accordion-content { transition: max-height 0.3s ease-out, opacity 0.3s ease-out; max-height: 0; opacity: 0; overflow: hidden; }
        .accordion-content.open { max-height: 500px; opacity: 1; }
      `}</style>

      <div className="w-full p-3 sticky top-0 z-50">
        <header className={`max-w-[1200px] mx-auto glass border rounded-2xl px-5 py-3 flex justify-between items-center ${isDark ? "bg-white/[0.06] border-white/[0.08]" : "bg-white/80 border-black/[0.06] shadow-lg"}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-orange-500 flex items-center justify-center font-black text-white shadow-lg">YT</div>
            <div>
              <span className="font-black tracking-tight text-[16px] block leading-none">Earnings Calculator</span>
              <span className="text-[10px] font-bold opacity-60 tracking-widest">PRO v2.0</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 bg-green-500/15 border border-green-500/20 text-green-500 text-[10px] font-black px-3 py-1 rounded-full">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> HIGH CPC $8.40
            </div>
            <button onClick={() => setCurrency(currency === "USD" ? "INR" : "USD")} className={`px-3 py-1.5 rounded-full text-[11px] font-black border hover-lift ${isDark ? "bg-white/10 border-white/10" : "bg-black/5 border-black/10"}`}>
              {currency === "USD" ? "🇺🇸 USD ($)" : "🇮🇳 INR (₹)"}
            </button>
            <button onClick={() => setTheme(isDark ? "light" : "dark")} className={`w-10 h-10 rounded-full border flex items-center justify-center hover-lift ${isDark ? "bg-white/10 border-white/10" : "bg-black/5 border-black/10"}`}>
              {isDark ? "🌙" : "☀️"}
            </button>
          </div>
        </header>
      </div>

      <nav className="max-w-[1200px] mx-auto px-4 py-2 text-[11px] opacity-50" aria-label="Breadcrumb">
        <ol className="flex gap-2">
          <li>Home</li><li>/</li><li>Tools</li><li>/</li><li className="font-bold opacity-100">YouTube Earnings Calculator</li>
        </ol>
      </nav>

      <main className="max-w-[1200px] mx-auto px-4 py-6 grid lg:grid-cols-[1.15fr_0.85fr] gap-5">
        
        <div className="space-y-5">
          <div className={`glass border rounded-[28px] p-7 md:p-8 ${isDark ? "bg-white/[0.04] border-white/[0.06]" : "bg-white border-black/[0.05] shadow-xl"}`}>
            <h1 className="text-[32px] md:text-[44px] font-black leading-[0.85] tracking-tighter">
              YouTube Money<br/><span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">Calculator PRO</span>
            </h1>
            <p className={`text-[13px] mt-3 leading-relaxed ${isDark ? "text-white/50" : "text-black/60"}`}>
              AdSense + Sponsorship + Tax = Real Net Profit. 100% accurate for Indian & US Creators.
            </p>

            <div className={`mt-5 w-full h-[90px] rounded-xl border border-dashed flex items-center justify-center text-[11px] font-bold tracking-widest opacity-50 ${isDark ? "bg-white/[0.02] border-white/10" : "bg-black/[0.02] border-black/10"}`}>AD SLOT - 728x90 (High CPC)</div>

            <div className="mt-7 space-y-6">
              {/* Views Slider */}
              <div className="group">
                <div className="flex justify-between items-end mb-2">
                  <label className="text-[12px] font-black tracking-wide uppercase opacity-80">Monthly Views</label>
                  <span className="text-[#FF7A1A] font-black text-[16px]">{views.toLocaleString()}</span>
                </div>
                <input type="range" min="1000" max="10000000" step="5000" value={views} onChange={(e) => setViews(Number(e.target.value))} className="w-full accent-[#FF7A1A] h-[6px] rounded-full cursor-pointer group-hover:h-[10px] transition-all" />
                <p className="text-[10px] mt-1 opacity-40">Avg Indian Channel: 50k-500k</p>
              </div>

              {/* CPM Slider */}
              <div className="group">
                <div className="flex justify-between items-end mb-2">
                  <label className="text-[12px] font-black tracking-wide uppercase opacity-80">CPM Rate ($)</label>
                  <span className="text-[#FF7A1A] font-black text-[16px]">${cpm.toFixed(2)}</span>
                </div>
                <input type="range" min="0.2" max="25" step="0.1" value={cpm} onChange={(e) => setCpm(Number(e.target.value))} className="w-full accent-[#FF7A1A] h-[6px] rounded-full cursor-pointer group-hover:h-[10px] transition-all" />
                <p className="text-[10px] mt-1 opacity-40">India $0.5-$4 | USA $6-$22</p>
              </div>

              {/* CTR Slider - RESTORED */}
              <div className="group">
                <div className="flex justify-between items-end mb-2">
                  <label className="text-[12px] font-black tracking-wide uppercase opacity-80">CTR %</label>
                  <span className="text-[#FF7A1A] font-black text-[16px]">{ctr}%</span>
                </div>
                <input type="range" min="1" max="20" step="0.1" value={ctr} onChange={(e) => setCtr(Number(e.target.value))} className="w-full accent-[#FF7A1A] h-[6px] rounded-full cursor-pointer" />
              </div>

              {/* Engagement Slider - RESTORED */}
              <div className="group">
                <div className="flex justify-between items-end mb-2">
                  <label className="text-[12px] font-black tracking-wide uppercase opacity-80">Engagement %</label>
                  <span className="text-[#FF7A1A] font-black text-[16px]">{engagement}%</span>
                </div>
                <input type="range" min="0.5" max="15" step="0.1" value={engagement} onChange={(e) => setEngagement(Number(e.target.value))} className="w-full accent-[#FF7A1A] h-[6px] rounded-full cursor-pointer" />
              </div>

              {/* Niche & Country */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/10">
                <div>
                  <label className="text-[11px] font-black uppercase opacity-60">Niche</label>
                  <select value={niche.name} onChange={(e) => handleNicheChange(e.target.value)} className={`mt-2 w-full px-4 py-3.5 rounded-xl border outline-none font-bold ${isDark ? "bg-black/50 border-white/10" : "bg-[#F5F5F7] border-black/5"}`}>
                    {NICHES.map(n => <option key={n.name}>{n.name} - ${n.cpm}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-black uppercase opacity-60">Country</label>
                  <select value={country.name} onChange={(e) => handleCountryChange(e.target.value)} className={`mt-2 w-full px-4 py-3.5 rounded-xl border outline-none font-bold ${isDark ? "bg-black/50 border-white/10" : "bg-[#F5F5F7] border-black/5"}`}>
                    {COUNTRIES.map(c => <option key={c.name} value={c.name}>{c.flag} {c.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-black uppercase">Sponsor / 1k views ($)</label>
                  <input type="number" value={sponsorRate} onChange={(e) => setSponsorRate(Number(e.target.value))} className={`mt-2 w-full px-4 py-3.5 rounded-xl border outline-none font-bold focus:border-[#FF7A1A] ${isDark ? "bg-black/50 border-white/10" : "bg-[#F5F5F7] border-black/5"}`} />
                </div>
                <div>
                  <label className="text-[11px] font-black uppercase">Tax %</label>
                  <input type="number" value={tax} onChange={(e) => setTax(Number(e.target.value))} className={`mt-2 w-full px-4 py-3.5 rounded-xl border outline-none font-bold focus:border-[#FF7A1A] ${isDark ? "bg-black/50 border-white/10" : "bg-[#F5F5F7] border-black/5"}`} />
                </div>
                <div>
                  <label className="text-[11px] font-black uppercase">Memberships ($)</label>
                  <input type="number" value={memberships} onChange={(e) => setMemberships(Number(e.target.value))} className={`mt-2 w-full px-4 py-3.5 rounded-xl border outline-none font-bold focus:border-[#FF7A1A] ${isDark ? "bg-black/50 border-white/10" : "bg-[#F5F5F7] border-black/5"}`} />
                </div>
                <div>
                  <label className="text-[11px] font-black uppercase">Super Thanks ($)</label>
                  <input type="number" value={superThanks} onChange={(e) => setSuperThanks(Number(e.target.value))} className={`mt-2 w-full px-4 py-3.5 rounded-xl border outline-none font-bold focus:border-[#FF7A1A] ${isDark ? "bg-black/50 border-white/10" : "bg-[#F5F5F7] border-black/5"}`} />
                </div>
              </div>
            </div>
          </div>

          {/* Revenue Breakdown Bar Chart - RESTORED */}
          <div className={`glass border rounded-[24px] p-6 ${isDark ? "bg-white/[0.03] border-white/5" : "bg-white border-black/5 shadow-lg"}`}>
            <h3 className="font-black text-[13px] tracking-widest uppercase">Revenue Breakdown</h3>
            <div className="mt-5 flex items-end gap-3 h-[120px]">
              <div className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-gradient-to-t from-orange-500 to-red-400 rounded-t-lg hover-lift" style={{height: `${(calc.afterYt/calc.totalGross)*100}%`, minHeight:'20px'}}></div>
                <span className="text-[10px] font-bold opacity-60">AdSense</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-white/20 rounded-t-lg hover-lift" style={{height: `${(calc.sponsor/calc.totalGross)*100}%`, minHeight:'20px'}}></div>
                <span className="text-[10px] font-bold opacity-60">Sponsor</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-green-500 rounded-t-lg hover-lift" style={{height: `100%`}}></div>
                <span className="text-[10px] font-bold opacity-60">Net Profit</span>
              </div>
            </div>
          </div>

          {/* Growth Projection - NEW */}
          <div className={`glass border rounded-[24px] p-6 ${isDark ? "bg-white/[0.03] border-white/5" : "bg-white border-black/5 shadow-lg"}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-black text-[13px] tracking-widest uppercase">📈 6-Month Growth</h3>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold opacity-60">Growth:</span>
                <input type="number" value={growthRate} onChange={(e) => setGrowthRate(Number(e.target.value))} className="w-16 px-2 py-1 rounded bg-white/10 border border-white/10 text-center text-xs font-bold" />
                <span className="text-xs font-bold">%</span>
              </div>
            </div>
            <div className="space-y-2">
              {calc.projection.map((p) => (
                <div key={p.month} className="flex justify-between items-center text-[12px] p-2 rounded-lg hover:bg-white/5 transition">
                  <span className="opacity-60 font-bold">Month {p.month}</span>
                  <span className="opacity-60">{p.views.toLocaleString()} views</span>
                  <span className="font-black text-green-500">{calc.fmt(p.net)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Main Result Card */}
          <div className="bg-gradient-to-br from-[#FF7A1A] via-orange-600 to-red-600 rounded-[28px] p-[1.5px] shadow-[0_20px_60px_rgba(255,122,26,0.3)]" style={{animation:'float 5s ease-in-out infinite'}}>
            <div className="bg-[#0A0A0F] rounded-[26px] p-7 relative overflow-hidden text-white">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-orange-500/30 blur-[80px] rounded-full pointer-events-none" />
              <p className="text-[11px] tracking-[0.3em] text-white/40 font-black">TOTAL NET PROFIT</p>
              <h2 className="text-[52px] font-black tracking-tighter mt-1 leading-none">{calc.fmt(calc.net)}<span className="text-[18px] opacity-50">/mo</span></h2>
              <p className="text-[11px] mt-2 opacity-50">{niche.name} | {country.flag} {country.name}</p>
              <div className="grid grid-cols-2 gap-3 mt-6">
                <div className="bg-white/[0.06] border border-white/[0.08] rounded-2xl p-3.5">
                  <p className="text-[9px] tracking-widest text-white/40 font-black">AdSense (55%)</p>
                  <p className="font-black text-[18px] mt-1">{calc.fmt(calc.afterYt)}</p>
                </div>
                <div className="bg-white/[0.06] border border-white/[0.08] rounded-2xl p-3.5">
                  <p className="text-[9px] tracking-widest text-white/40 font-black">RPM</p>
                  <p className="font-black text-[18px] mt-1">{calc.fmt(calc.rpm)}</p>
                </div>
                <div className="bg-white/[0.06] border border-white/[0.08] rounded-2xl p-3.5">
                  <p className="text-[9px] tracking-widest text-white/40 font-black">Sponsorship</p>
                  <p className="font-black text-[18px] mt-1">{calc.fmt(calc.sponsor)}</p>
                </div>
                <div className="bg-white/[0.06] border border-white/[0.08] rounded-2xl p-3.5">
                  <p className="text-[9px] tracking-widest text-white/40 font-black">Clicks (CTR)</p>
                  <p className="font-black text-[18px] mt-1">{calc.clicks.toFixed(0)}</p>
                </div>
                <div className="bg-white/[0.06] border border-white/[0.08] rounded-2xl p-3.5">
                  <p className="text-[9px] tracking-widest text-white/40 font-black">Yearly Net</p>
                  <p className="font-black text-[18px] mt-1">{calc.fmt(calc.net * 12)}</p>
                </div>
                <div className="bg-white/[0.06] border border-white/[0.08] rounded-2xl p-3.5">
                  <p className="text-[9px] tracking-widest text-white/40 font-black">Daily</p>
                  <p className="font-black text-[18px] mt-1">{calc.fmt(calc.net / 30)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <button onClick={handleCopy} className="py-3.5 bg-white text-black rounded-full font-black text-[13px] hover:bg-[#FF7A1A] hover:text-white transition-all active:scale-95 hover-lift">
                  {copied ? "✓ Copied!" : "Copy Report 📊"}
                </button>
                <a href={`https://wa.me/?text=${encodeURIComponent(`My YT Earnings ${calc.fmt(calc.net)}/mo`)}`} target="_blank" className="py-3.5 bg-white/10 border border-white/10 text-white rounded-full font-black text-[13px] text-center hover:bg-white/15 transition-all hover-lift">
                  Share
                </a>
              </div>
            </div>
          </div>

          <div className={`h-[250px] rounded-[20px] border border-dashed flex items-center justify-center text-[11px] font-bold tracking-widest ${isDark ? "bg-white/[0.02] border-white/10 text-white/30" : "bg-black/[0.02] border-black/10 text-black/30"}`}>AD SLOT - 300x250 (High CPC)</div>

          {/* FAQ Accordion - RESTORED & ENHANCED */}
          <div className={`glass border rounded-[20px] p-5 ${isDark ? "bg-white/[0.02] border-white/5" : "bg-white border-black/5 shadow"}`}>
            <h3 className="font-black text-[12px] tracking-widest">FAQ - SEO BOOST</h3>
            <div className="mt-3 space-y-3">
              {[
                { id: "q1", q: "What is YouTube CPM?", a: "Cost per 1000 views. Higher in Finance niche." },
                { id: "q2", q: "How YouTube pays?", a: "55% to creator, 45% YouTube keeps." },
                { id: "q3", q: "High CPC niches?", a: "Insurance, Crypto, Make Money - $10+ CPM." }
              ].map((faq) => (
                <div key={faq.id} className="border-b border-white/10 pb-2 last:border-0">
                  <button onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)} className="w-full flex justify-between items-center text-left font-bold text-[11px] hover:text-orange-500 transition">
                    <span>{faq.q}</span>
                    <span className="text-lg">{openFaq === faq.id ? "−" : "+"}</span>
                  </button>
                  <div className={`accordion-content ${openFaq === faq.id ? "open" : ""}`}>
                    <p className="pt-2 text-[11px] leading-relaxed opacity-70">{faq.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
