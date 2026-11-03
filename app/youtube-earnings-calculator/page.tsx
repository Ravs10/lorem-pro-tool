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

const EXCHANGE_RATE = 83; // 1 USD = 83 INR

// ==================== COMPONENT ====================
export default function YouTubeEarningsCalculator() {
  const [theme, setTheme] = useState("dark");
  const isDark = theme === "dark";
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // States
  const [currency, setCurrency] = useState<"USD" | "INR">("USD");
  const [views, setViews] = useState(100000);
  const [cpm, setCpm] = useState(1.8);
  const [ctr, setCtr] = useState(5.0);
  const [niche, setNiche] = useState(NICHES[9]);
  const [country, setCountry] = useState(COUNTRIES[6]);
  const [sponsorRate, setSponsorRate] = useState(5);
  const [memberships, setMemberships] = useState(0);
  const [superThanks, setSuperThanks] = useState(0);
  const [tax, setTax] = useState(10);
  const [growthRate, setGrowthRate] = useState(5); // Monthly growth %
  const [copied, setCopied] = useState(false);
  
  // Accordion States
  const [openGuide, setOpenGuide] = useState(false);
  const [openFaq, setOpenFaq] = useState<string | null>("q1");

  // Smart Auto-CPM Update
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

  // Advanced Calculation Engine
  const calc = useMemo(() => {
    const gross = (views / 1000) * cpm;
    const afterYt = gross * 0.55; // YouTube takes 45%
    const sponsor = (views / 1000) * sponsorRate;
    const totalGross = afterYt + sponsor + memberships + superThanks;
    const taxAmt = totalGross * (tax / 100);
    const net = totalGross - taxAmt;
    const rpm = cpm * 0.55;
    const clicks = views * (ctr / 100);

    // 6-Month Projection
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
    const text = `📊 YouTube Earnings Report (${currency})\n━━━━━━━━━━━━━━━━\nViews: ${views.toLocaleString()}\nNiche: ${niche.name}\nCountry: ${country.flag} ${country.name}\n━━━━━━━━━━━━━━━━\nAdSense (55%): ${calc.fmt(calc.afterYt)}\nSponsorship: ${calc.fmt(calc.sponsor)}\nTax (${tax}%): -${calc.fmt(calc.taxAmt)}\n━━━━━━━━━━━━━━━━\n💰 NET MONTHLY: ${calc.fmt(calc.net)}\n🎯 RPM: ${calc.fmt(calc.rpm)}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportCSV = () => {
    const rows = [
      ["Metric", "Value"],
      ["Monthly Views", views],
      ["CPM", cpm],
      ["Niche", niche.name],
      ["Country", country.name],
      ["Net Monthly Earnings", calc.net.toFixed(2)],
      ["AdSense (55%)", calc.afterYt.toFixed(2)],
      ["Sponsorship", calc.sponsor.toFixed(2)],
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

  // JSON-LD Schema for SEO
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

      {/* HEADER */}
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
            <button onClick={() => setCurrency(currency === "USD" ? "INR" : "USD")} className={`px-3 py-1.5 rounded-full text-[11px] font-black border hover-lift ${isDark ? "bg-white/10 border-white/10" : "bg-black/5 border-black/10"}`}>
              {currency === "USD" ? "🇺🇸 USD ($)" : "🇮🇳 INR (₹)"}
            </button>
            <button onClick={() => setTheme(isDark ? "light" : "dark")} className={`w-10 h-10 rounded-full border flex items-center justify-center hover-lift ${isDark ? "bg-white/10 border-white/10" : "bg-black/5 border-black/10"}`}>
              {isDark ? "🌙" : "☀️"}
            </button>
          </div>
        </header>
      </div>

      {/* BREADCRUMBS (SEO) */}
      <nav className="max-w-[1200px] mx-auto px-4 py-2 text-[11px] opacity-50" aria-label="Breadcrumb">
        <ol className="flex gap-2">
          <li>Home</li><li>/</li><li>Tools</li><li>/</li><li className="font-bold opacity-100">YouTube Earnings Calculator</li>
        </ol>
      </nav>

      <main className="max-w-[1200px] mx-auto px-4 py-6 grid lg:grid-cols-[1.2fr_0.8fr] gap-6">
        
        {/* LEFT: CONTROLS */}
        <div className="space-y-5">
          <div className={`glass border rounded-[28px] p-6 md:p-8 ${isDark ? "bg-white/[0.04] border-white/[0.06]" : "bg-white border-black/[0.05] shadow-xl"}`}>
            <h1 className="text-[28px] md:text-[36px] font-black leading-[1] tracking-tighter">
              YouTube Money <br/><span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">Calculator PRO</span>
            </h1>
            <p className={`text-[13px] mt-3 leading-relaxed ${isDark ? "text-white/50" : "text-black/60"}`}>
              Calculate exact net profit including AdSense (55% cut), Sponsorships, Memberships, Super Thanks, and Taxes.
            </p>

            <div className="mt-6 space-y-5">
              {/* Views */}
              <div className="group">
                <div className="flex justify-between items-end mb-2">
                  <label className="text-[11px] font-black tracking-wide uppercase opacity-70">Monthly Views</label>
                  <span className="text-orange-500 font-black text-[18px]">{views.toLocaleString()}</span>
                </div>
                <input type="range" min="1000" max="10000000" step="10000" value={views} onChange={(e) => setViews(Number(e.target.value))} className="w-full accent-orange-500 h-[6px] rounded-full cursor-pointer group-hover:h-[10px] transition-all" />
              </div>

              {/* CPM */}
              <div className="group">
                <div className="flex justify-between items-end mb-2">
                  <label className="text-[11px] font-black tracking-wide uppercase opacity-70">Estimated CPM ($)</label>
                  <span className="text-orange-500 font-black text-[18px]">${cpm.toFixed(2)}</span>
                </div>
                <input type="range" min="0.1" max="50" step="0.1" value={cpm} onChange={(e) => setCpm(Number(e.target.value))} className="w-full accent-orange-500 h-[6px] rounded-full cursor-pointer group-hover:h-[10px] transition-all" />
                <p className="text-[10px] mt-1 opacity-40">Auto-adjusted based on Niche & Country</p>
              </div>

              {/* Niche & Country (Smart Update) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/10">
                <div>
                  <label className="text-[11px] font-black uppercase opacity-60">Content Niche</label>
                  <select value={niche.name} onChange={(e) => handleNicheChange(e.target.value)} className={`mt-2 w-full px-4 py-3 rounded-xl border outline-none font-bold text-[13px] ${isDark ? "bg-black/50 border-white/10" : "bg-[#F5F5F7] border-black/5"}`}>
                    {NICHES.map(n => <option key={n.name} value={n.name}>{n.name} (Base: ${n.cpm})</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-black uppercase opacity-60">Target Country</label>
                  <select value={country.name} onChange={(e) => handleCountryChange(e.target.value)} className={`mt-2 w-full px-4 py-3 rounded-xl border outline-none font-bold text-[13px] ${isDark ? "bg-black/50 border-white/10" : "bg-[#F5F5F7] border-black/5"}`}>
                    {COUNTRIES.map(c => <option key={c.name} value={c.name}>{c.flag} {c.name} (x{c.mult})</option>)}
                  </select>
                </div>
              </div>

              {/* Advanced Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-[10px] font-black uppercase opacity-60">CTR (%)</label>
                  <input type="number" value={ctr} onChange={(e) => setCtr(Number(e.target.value))} className={`mt-1 w-full px-3 py-2.5 rounded-lg border outline-none font-bold text-sm ${isDark ? "bg-black/50 border-white/10" : "bg-[#F5F5F7] border-black/5"}`} />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase opacity-60">Tax (%)</label>
                  <input type="number" value={tax} onChange={(e) => setTax(Number(e.target.value))} className={`mt-1 w-full px-3 py-2.5 rounded-lg border outline-none font-bold text-sm ${isDark ? "bg-black/50 border-white/10" : "bg-[#F5F5F7] border-black/5"}`} />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase opacity-60">Sponsor / 1k views ($)</label>
                  <input type="number" value={sponsorRate} onChange={(e) => setSponsorRate(Number(e.target.value))} className={`mt-1 w-full px-3 py-2.5 rounded-lg border outline-none font-bold text-sm ${isDark ? "bg-black/50 border-white/10" : "bg-[#F5F5F7] border-black/5"}`} />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase opacity-60">Memberships ($)</label>
                  <input type="number" value={memberships} onChange={(e) => setMemberships(Number(e.target.value))} className={`mt-1 w-full px-3 py-2.5 rounded-lg border outline-none font-bold text-sm ${isDark ? "bg-black/50 border-white/10" : "bg-[#F5F5F7] border-black/5"}`} />
                </div>
              </div>
            </div>
          </div>

          {/* Growth Projection (NEW) */}
          <div className={`glass border rounded-[24px] p-6 ${isDark ? "bg-white/[0.03] border-white/5" : "bg-white border-black/5 shadow-lg"}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-black text-[13px] tracking-widest uppercase">📈 6-Month Growth Projection</h3>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold opacity-60">Monthly Growth:</span>
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

        {/* RIGHT: RESULTS & SEO CONTENT */}
        <div className="space-y-5">
          {/* Main Result Card */}
          <div className="bg-gradient-to-br from-[#FF7A1A] via-orange-600 to-red-600 rounded-[28px] p-[1.5px] shadow-[0_20px_60px_rgba(255,122,26,0.3)]" style={{ animation: 'float 5s ease-in-out infinite' }}>
            <div className="bg-[#0A0A0F] rounded-[26px] p-6 relative overflow-hidden text-white">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-orange-500/30 blur-[80px] rounded-full pointer-events-none" />
              <p className="text-[10px] tracking-[0.3em] text-white/40 font-black">ESTIMATED NET PROFIT</p>
              <h2 className="text-[48px] font-black tracking-tighter mt-1 leading-none">{calc.fmt(calc.net)}<span className="text-[16px] opacity-50">/mo</span></h2>
              <p className="text-[11px] mt-2 opacity-50">{niche.name} • {country.flag} {country.name}</p>
              
              <div className="grid grid-cols-2 gap-3 mt-6">
                <div className="bg-white/[0.06] border border-white/[0.08] rounded-2xl p-3.5">
                  <p className="text-[9px] tracking-widest text-white/40 font-black">AdSense (55%)</p>
                  <p className="font-black text-[18px] mt-1">{calc.fmt(calc.afterYt)}</p>
                </div>
                <div className="bg-white/[0.06] border border-white/[0.08] rounded-2xl p-3.5">
                  <p className="text-[9px] tracking-widest text-white/40 font-black">Effective RPM</p>
                  <p className="font-black text-[18px] mt-1">{calc.fmt(calc.rpm)}</p>
                </div>
                <div className="bg-white/[0.06] border border-white/[0.08] rounded-2xl p-3.5">
                  <p className="text-[9px] tracking-widest text-white/40 font-black">Sponsorships</p>
                  <p className="font-black text-[18px] mt-1">{calc.fmt(calc.sponsor)}</p>
                </div>
                <div className="bg-white/[0.06] border border-white/[0.08] rounded-2xl p-3.5">
                  <p className="text-[9px] tracking-widest text-white/40 font-black">Est. Clicks (CTR)</p>
                  <p className="font-black text-[18px] mt-1">{calc.clicks.toLocaleString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4">
                <button onClick={handleCopy} className="py-3 bg-white text-black rounded-full font-black text-[12px] hover:bg-orange-500 hover:text-white transition-all active:scale-95 hover-lift">
                  {copied ? "✓ Copied!" : "Copy Report 📊"}
                </button>
                <button onClick={handleExportCSV} className="py-3 bg-white/10 border border-white/10 text-white rounded-full font-black text-[12px] hover:bg-white/15 transition-all hover-lift">
                  Download CSV 📥
                </button>
              </div>
            </div>
          </div>

          {/* SEO CONTENT: USER GUIDE & FAQ (Accordion) */}
          <article className={`glass border rounded-[24px] p-6 ${isDark ? "bg-white/[0.02] border-white/5" : "bg-white border-black/5 shadow"}`}>
            <h2 className="font-black text-[18px] tracking-tight mb-4">📚 Complete User Guide & FAQ</h2>
            
            {/* Guide Accordion */}
            <div className="mb-4 border-b border-white/10 pb-4">
              <button onClick={() => setOpenGuide(!openGuide)} className="w-full flex justify-between items-center text-left font-bold text-[14px] hover:text-orange-500 transition">
                <span>How to use this YouTube Calculator?</span>
                <span className="text-xl">{openGuide ? "−" : "+"}</span>
              </button>
              <div className={`accordion-content ${openGuide ? "open" : ""}`}>
                <div className="pt-3 text-[13px] leading-relaxed opacity-70 space-y-2">
                  <p><strong>Step 1:</strong> Enter your average monthly views.</p>
                  <p><strong>Step 2:</strong> Select your Content Niche and Target Country. The tool will <em>automatically</em> suggest a realistic CPM based on global advertiser demand.</p>
                  <p><strong>Step 3:</strong> Add extra income like Sponsorships (per 1k views), Channel Memberships, and Super Thanks.</p>
                  <p><strong>Step 4:</strong> Enter your local Tax percentage to see your <strong>real take-home net profit</strong>.</p>
                </div>
              </div>
            </div>

            {/* FAQ Accordion */}
            <div className="space-y-3">
              {[
                { id: "q1", q: "What is the difference between CPM and RPM?", a: "CPM (Cost Per Mille) is what advertisers pay per 1,000 views. RPM (Revenue Per Mille) is what you actually earn per 1,000 views after YouTube takes its 45% platform cut." },
                { id: "q2", q: "How much does YouTube pay for 1 Million views in India?", a: "In India, average CPM ranges from $0.50 to $4.00. For 1M views, AdSense pays roughly $300 to $2,200 (₹25,000 to ₹1,80,000). Finance and Tech niches pay the highest." },
                { id: "q3", q: "Does YouTube take a cut of Sponsorships or Super Thanks?", a: "No. YouTube only takes 45% of AdSense revenue. Sponsorships, Memberships, and Super Thanks go directly to you (minus standard payment gateway or local taxes)." },
                { id: "q4", q: "Which niche has the highest YouTube CPM in 2024?", a: "Finance, Insurance, Make Money Online, Crypto, and Software/SaaS consistently have the highest CPMs, often ranging from $10 to $30+ in Tier-1 countries like the USA and UK." }
              ].map((faq) => (
                <div key={faq.id} className="border-b border-white/10 pb-3 last:border-0">
                  <button onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)} className="w-full flex justify-between items-center text-left font-bold text-[13px] hover:text-orange-500 transition">
                    <span>{faq.q}</span>
                    <span className="text-lg">{openFaq === faq.id ? "−" : "+"}</span>
                  </button>
                  <div className={`accordion-content ${openFaq === faq.id ? "open" : ""}`}>
                    <p className="pt-2 text-[12px] leading-relaxed opacity-70">{faq.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>

          {/* SEO Text Block */}
          <section className="text-[11px] opacity-50 leading-relaxed space-y-2 px-2">
            <h3 className="font-black text-[13px] opacity-80">About YouTube Revenue Estimator</h3>
            <p>This advanced YouTube earnings calculator helps creators, marketers, and agencies estimate potential revenue accurately. Unlike basic calculators, this tool factors in the 45% YouTube AdSense cut, variable CPM rates by country (USA, India, UK, etc.), niche multipliers, and additional revenue streams like brand sponsorships and channel memberships.</p>
          </section>
        </div>
      </main>
    </div>
  );
}
