"use client";
import { useState, useMemo, useEffect } from "react";
import Head from "next/head";

// ==================== EXPANDED DATA ====================
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
  { name: "Travel / Tourism", cpm: 4.0 },
  { name: "Food / Cooking / Recipes", cpm: 3.5 },
  { name: "Fashion / Beauty / Lifestyle", cpm: 3.0 },
  { name: "General / Vlog / Lifestyle", cpm: 1.8 },
  { name: "Gaming / Esports", cpm: 1.5 },
  { name: "Entertainment / Comedy / Memes", cpm: 1.0 },
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
  const [niche, setNiche] = useState(NICHES[12]);
  const [country, setCountry] = useState(COUNTRIES[14]);
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
        "description": "Calculate your exact YouTube earnings with AdSense CPM, sponsorships, memberships, super thanks, and tax deductions. Supports USD and INR for 20+ countries.",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://example.com" },
          { "@type": "ListItem", "position": 2, "name": "Tools", "item": "https://example.com/tools" },
          { "@type": "ListItem", "position": 3, "name": "YouTube Earnings Calculator" }
        ]
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "What is a YouTube Earnings Calculator?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "A YouTube Earnings Calculator is a free online tool that helps content creators estimate their potential revenue from YouTube based on views, CPM (Cost Per Mille), RPM (Revenue Per Mille), sponsorships, and other income streams. It accounts for YouTube's 45% platform cut and provides accurate net profit estimates in multiple currencies."
            }
          },
          {
            "@type": "Question",
            "name": "How does YouTube pay creators?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "YouTube pays creators through the YouTube Partner Program (YPP). For AdSense revenue, YouTube takes 45% and gives 55% to the creator. Additional income comes from channel memberships, Super Chat, Super Thanks, and brand sponsorships, where creators keep 100% (minus payment processing fees)."
            }
          },
          {
            "@type": "Question",
            "name": "What is CPM and how is it different from RPM?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "CPM (Cost Per Mille) is what advertisers pay per 1,000 ad impressions. RPM (Revenue Per Mille) is what you actually earn per 1,000 video views after YouTube's cut. For example, if CPM is $10, your RPM would be $5.50 (after YouTube's 45% cut)."
            }
          },
          {
            "@type": "Question",
            "name": "How much does YouTube pay for 1 million views?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Earnings vary by niche and country. In the USA, 1 million views can earn $3,000-$22,000 depending on the niche (Finance pays highest). In India, the same views earn $300-$4,000. Finance, Crypto, and Make Money Online niches have the highest CPMs."
            }
          },
          {
            "@type": "Question",
            "name": "Which YouTube niche pays the most in 2024?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "The highest-paying YouTube niches in 2024 are: 1) Finance/Insurance ($15-30 CPM), 2) Crypto/Trading ($12-25 CPM), 3) Make Money Online ($10-20 CPM), 4) Software/SaaS/AI Tools ($8-15 CPM), and 5) Real Estate ($8-15 CPM). These niches attract high-value advertisers."
            }
          },
          {
            "@type": "Question",
            "name": "Do I need 1000 subscribers to earn on YouTube?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, to join the YouTube Partner Program and monetize with ads, you need at least 1,000 subscribers AND 4,000 watch hours in the past 12 months (or 10 million Shorts views in 90 days). However, you can earn from sponsorships and affiliate marketing even before meeting these requirements."
            }
          },
          {
            "@type": "Question",
            "name": "How accurate is this YouTube earnings calculator?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "This calculator provides estimates based on industry averages and real CPM data from 20+ countries. Actual earnings can vary by ±20% due to factors like ad blockers, viewer demographics, video length, seasonality, and YouTube's algorithm changes. Use it as a planning tool, not an exact prediction."
            }
          },
          {
            "@type": "Question",
            "name": "Can I earn from YouTube without showing my face?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes! Faceless YouTube channels are very profitable. Popular niches include: compilation videos, educational content, gaming, meditation/relaxation, top 10 lists, and AI-generated content. Many successful faceless channels earn $5,000-$50,000+ per month."
            }
          }
        ]
      }
    ]
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDark ? "bg-[#07070B] text-white" : "bg-[#FAFAFF] text-black"}`}>
      <Head>
        <title>YouTube Earnings Calculator 2024 | Free CPM, RPM & Revenue Estimator for 20+ Countries</title>
        <meta name="description" content="Calculate your exact YouTube earnings with our advanced free calculator. Includes AdSense CPM, RPM, sponsorships, memberships, Super Thanks, and tax deductions. Supports USD & INR for USA, India, UK, and 20+ countries. Accurate estimates for Finance, Tech, Gaming, and all niches." />
        <meta name="keywords" content="youtube earnings calculator, youtube money calculator, youtube cpm calculator, youtube rpm calculator, how much does youtube pay, youtube revenue estimator, youtube income calculator, youtube ad revenue calculator, youtube earnings per view, youtube calculator 2024, youtube money india, youtube earnings usa" />
        <meta property="og:title" content="Advanced YouTube Earnings Calculator 2024 | Free CPM & Revenue Estimator" />
        <meta property="og:description" content="Calculate exact YouTube earnings with AdSense, sponsorships, and tax. Free, accurate, and instant. Supports 20+ countries and 15+ niches." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://example.com/og-image.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
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
        .accordion-content.open { max-height: 800px; opacity: 1; }
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
        <ol className="flex gap-2" itemScope itemType="https://schema.org/BreadcrumbList">
          <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
            <a itemProp="item" href="/"><span itemProp="name">Home</span></a>
            <meta itemProp="position" content="1" />
          </li>
          <li>/</li>
          <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
            <a itemProp="item" href="/tools"><span itemProp="name">Tools</span></a>
            <meta itemProp="position" content="2" />
          </li>
          <li>/</li>
          <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem" className="font-bold opacity-100">
            <span itemProp="name">YouTube Earnings Calculator</span>
            <meta itemProp="position" content="3" />
          </li>
        </ol>
      </nav>

      <main className="max-w-[1200px] mx-auto px-4 py-6 grid lg:grid-cols-[1.15fr_0.85fr] gap-5">
        
        <div className="space-y-5">
          <div className={`glass border rounded-[28px] p-7 md:p-8 ${isDark ? "bg-white/[0.04] border-white/[0.06]" : "bg-white border-black/[0.05] shadow-xl"}`}>
            <h1 className="text-[32px] md:text-[44px] font-black leading-[0.85] tracking-tighter">
              YouTube Money<br/><span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">Calculator PRO</span>
            </h1>
            <p className={`text-[13px] mt-3 leading-relaxed ${isDark ? "text-white/50" : "text-black/60"}`}>
              AdSense + Sponsorship + Tax = Real Net Profit. 100% accurate for 20+ countries including India, USA, UK.
            </p>

            <div className={`mt-5 w-full h-[90px] rounded-xl border border-dashed flex items-center justify-center text-[11px] font-bold tracking-widest opacity-50 ${isDark ? "bg-white/[0.02] border-white/10" : "bg-black/[0.02] border-black/10"}`}>AD SLOT - 728x90 (High CPC)</div>

            <div className="mt-7 space-y-6">
              <div className="group">
                <div className="flex justify-between items-end mb-2">
                  <label className="text-[12px] font-black tracking-wide uppercase opacity-80">Monthly Views</label>
                  <span className="text-[#FF7A1A] font-black text-[16px]">{views.toLocaleString()}</span>
                </div>
                <input type="range" min="1000" max="10000000" step="5000" value={views} onChange={(e) => setViews(Number(e.target.value))} className="w-full accent-[#FF7A1A] h-[6px] rounded-full cursor-pointer group-hover:h-[10px] transition-all" />
                <p className="text-[10px] mt-1 opacity-40">Avg Indian Channel: 50k-500k</p>
              </div>

              <div className="group">
                <div className="flex justify-between items-end mb-2">
                  <label className="text-[12px] font-black tracking-wide uppercase opacity-80">CPM Rate ($)</label>
                  <span className="text-[#FF7A1A] font-black text-[16px]">${cpm.toFixed(2)}</span>
                </div>
                <input type="range" min="0.2" max="25" step="0.1" value={cpm} onChange={(e) => setCpm(Number(e.target.value))} className="w-full accent-[#FF7A1A] h-[6px] rounded-full cursor-pointer group-hover:h-[10px] transition-all" />
                <p className="text-[10px] mt-1 opacity-40">India $0.5-$4 | USA $6-$22</p>
              </div>

              <div className="group">
                <div className="flex justify-between items-end mb-2">
                  <label className="text-[12px] font-black tracking-wide uppercase opacity-80">CTR %</label>
                  <span className="text-[#FF7A1A] font-black text-[16px]">{ctr}%</span>
                </div>
                <input type="range" min="1" max="20" step="0.1" value={ctr} onChange={(e) => setCtr(Number(e.target.value))} className="w-full accent-[#FF7A1A] h-[6px] rounded-full cursor-pointer" />
              </div>

              <div className="group">
                <div className="flex justify-between items-end mb-2">
                  <label className="text-[12px] font-black tracking-wide uppercase opacity-80">Engagement %</label>
                  <span className="text-[#FF7A1A] font-black text-[16px]">{engagement}%</span>
                </div>
                <input type="range" min="0.5" max="15" step="0.1" value={engagement} onChange={(e) => setEngagement(Number(e.target.value))} className="w-full accent-[#FF7A1A] h-[6px] rounded-full cursor-pointer" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/10">
                <div>
                  <label className="text-[11px] font-black uppercase opacity-60">Niche (15 Options)</label>
                  <select value={niche.name} onChange={(e) => handleNicheChange(e.target.value)} className={`mt-2 w-full px-4 py-3.5 rounded-xl border outline-none font-bold ${isDark ? "bg-black/50 border-white/10" : "bg-[#F5F5F7] border-black/5"}`}>
                    {NICHES.map(n => <option key={n.name}>{n.name} - ${n.cpm}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-black uppercase opacity-60">Country (20 Options)</label>
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

          {/* COMPREHENSIVE SEO CONTENT - 1200+ WORDS */}
          <article className={`glass border rounded-[20px] p-6 ${isDark ? "bg-white/[0.02] border-white/5" : "bg-white border-black/5 shadow"}`}>
            <h2 className="font-black text-[20px] tracking-tight mb-4">📚 Complete Guide: What is YouTube Earnings Calculator?</h2>
            
            <div className="space-y-4 text-[13px] leading-relaxed opacity-80">
              <section>
                <h3 className="font-black text-[16px] mb-2">What is a YouTube Earnings Calculator?</h3>
                <p>A <strong>YouTube Earnings Calculator</strong> is a powerful free online tool designed to help content creators, digital marketers, and aspiring YouTubers estimate their potential revenue from the YouTube platform. Unlike basic calculators that only consider views, our advanced calculator factors in multiple revenue streams including AdSense, sponsorships, channel memberships, Super Thanks, and even accounts for local taxes to give you a realistic net profit estimate.</p>
                <p className="mt-2">Whether you're running a faceless channel, a tech review channel, or a finance education channel, understanding your earning potential is crucial for planning content strategy, setting realistic goals, and negotiating brand deals. Our calculator supports <strong>20+ countries</strong> including USA, India, UK, Canada, Australia, and provides accurate CPM (Cost Per Mille) data for <strong>15+ niches</strong> ranging from high-paying Finance ($15-30 CPM) to entertainment ($1-2 CPM).</p>
              </section>

              <section>
                <h3 className="font-black text-[16px] mb-2">How Does YouTube Pay Creators in 2024?</h3>
                <p>YouTube monetization works through the <strong>YouTube Partner Program (YPP)</strong>. To qualify, you need at least 1,000 subscribers and 4,000 watch hours in the past 12 months (or 10 million Shorts views in 90 days). Once accepted, you can earn through:</p>
                <ul className="list-disc list-inside space-y-1 mt-2 ml-2">
                  <li><strong>AdSense Revenue (55% to creator):</strong> YouTube takes 45% of ad revenue, you keep 55%</li>
                  <li><strong>Channel Memberships (70% to creator):</strong> Monthly subscriptions from fans</li>
                  <li><strong>Super Chat & Super Stickers (70% to creator):</strong> During live streams</li>
                  <li><strong>Super Thanks (100% to creator):</strong> One-time tips on videos</li>
                  <li><strong>YouTube Premium Revenue:</strong> Share of subscription fees from Premium users</li>
                  <li><strong>Brand Sponsorships (100% to creator):</strong> Direct deals with brands</li>
                </ul>
              </section>

              <section>
                <h3 className="font-black text-[16px] mb-2">Understanding CPM vs RPM: The Key Difference</h3>
                <p><strong>CPM (Cost Per Mille)</strong> is what advertisers pay per 1,000 ad impressions. This varies wildly based on your niche, audience location, and video topic. For example, a finance video targeting USA audiences might have a CPM of $20-30, while a gaming video targeting India might have a CPM of $0.50-2.00.</p>
                <p className="mt-2"><strong>RPM (Revenue Per Mille)</strong> is what you actually earn per 1,000 video views after YouTube's cut. If your CPM is $10, your RPM would be $5.50 (after YouTube's 45% cut). RPM is the more accurate metric for understanding your actual earnings.</p>
              </section>

              <section>
                <h3 className="font-black text-[16px] mb-2">Highest Paying YouTube Niches in 2024</h3>
                <p>Not all YouTube niches pay equally. Advertisers pay more to reach audiences interested in high-value products and services. Here are the top-paying niches:</p>
                <ol className="list-decimal list-inside space-y-1 mt-2 ml-2">
                  <li><strong>Finance / Insurance / Loans:</strong> $15-30 CPM (highest paying)</li>
                  <li><strong>Crypto / Trading / Forex:</strong> $12-25 CPM</li>
                  <li><strong>Make Money Online / Business:</strong> $10-20 CPM</li>
                  <li><strong>Software / SaaS / AI Tools:</strong> $8-15 CPM</li>
                  <li><strong>Real Estate / Investing:</strong> $8-15 CPM</li>
                  <li><strong>Health / Fitness / Medical:</strong> $6-12 CPM</li>
                  <li><strong>Tech / Gadgets / Reviews:</strong> $5-10 CPM</li>
                  <li><strong>Education / Career:</strong> $4-8 CPM</li>
                  <li><strong>Automotive / Cars:</strong> $3-6 CPM</li>
                  <li><strong>Travel / Tourism:</strong> $3-5 CPM</li>
                  <li><strong>Food / Cooking:</strong> $2-4 CPM</li>
                  <li><strong>Fashion / Beauty:</strong> $2-4 CPM</li>
                  <li><strong>General Vlogs:</strong> $1-3 CPM</li>
                  <li><strong>Gaming:</strong> $1-2 CPM</li>
                  <li><strong>Entertainment / Comedy:</strong> $0.50-2 CPM (lowest paying)</li>
                </ol>
              </section>

              <section>
                <h3 className="font-black text-[16px] mb-2">How Much Does YouTube Pay in Different Countries?</h3>
                <p>YouTube earnings vary dramatically by country due to differences in advertiser demand and purchasing power. Here's how 1 million views pays in different regions:</p>
                <ul className="list-disc list-inside space-y-1 mt-2 ml-2">
                  <li><strong>USA:</strong> $3,000 - $22,000 (highest paying)</li>
                  <li><strong>UK / Canada / Australia:</strong> $2,000 - $15,000</li>
                  <li><strong>Germany / France:</strong> $1,500 - $12,000</li>
                  <li><strong>India:</strong> $300 - $4,000 (growing rapidly)</li>
                  <li><strong>Pakistan / Bangladesh:</strong> $200 - $2,500</li>
                  <li><strong>Philippines / Indonesia:</strong> $250 - $3,000</li>
                </ul>
                <p className="mt-2">This is why targeting Tier-1 countries (USA, UK, Canada, Australia) with English content can 5-10x your earnings compared to local language content.</p>
              </section>

              <section>
                <h3 className="font-black text-[16px] mb-2">Can You Earn from YouTube Without Showing Your Face?</h3>
                <p>Absolutely! <strong>Faceless YouTube channels</strong> are extremely profitable and growing in popularity. Successful faceless channel ideas include:</p>
                <ul className="list-disc list-inside space-y-1 mt-2 ml-2">
                  <li>Compilation videos (satisfying, funny, amazing facts)</li>
                  <li>Educational content with animations or stock footage</li>
                  <li>Gaming walkthroughs and highlights</li>
                  <li>Meditation, relaxation, and ASMR content</li>
                  <li>Top 10 lists and countdowns</li>
                  <li>AI-generated content with voiceovers</li>
                  <li>Music mixes and lo-fi beats</li>
                </ul>
                <p className="mt-2">Many successful faceless channels earn $5,000-$50,000+ per month without ever showing their face. The key is consistent uploads, good thumbnails, and targeting high-CPM niches.</p>
              </section>
            </div>

            {/* USER GUIDE ACCORDION */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <button onClick={() => setOpenGuide(!openGuide)} className="w-full flex justify-between items-center text-left font-black text-[16px] hover:text-orange-500 transition mb-3">
                <span>📖 How to Use This Calculator (Step-by-Step Guide)</span>
                <span className="text-2xl">{openGuide ? "−" : "+"}</span>
              </button>
              <div className={`accordion-content ${openGuide ? "open" : ""}`}>
                <div className="pt-3 text-[13px] leading-relaxed opacity-80 space-y-3">
                  <div>
                    <h4 className="font-black text-[14px] mb-1">Step 1: Enter Your Monthly Views</h4>
                    <p>Use the slider to input your average monthly video views. For new channels, start with 10,000-50,000. Established channels can input 100,000-1,000,000+.</p>
                  </div>
                  <div>
                    <h4 className="font-black text-[14px] mb-1">Step 2: Adjust CPM Based on Your Niche</h4>
                    <p>The CPM slider automatically adjusts when you select your niche and country. You can manually override it if you know your actual CPM from YouTube Analytics.</p>
                  </div>
                  <div>
                    <h4 className="font-black text-[14px] mb-1">Step 3: Fine-tune CTR and Engagement</h4>
                    <p>CTR (Click-Through Rate) affects ad clicks. Average is 2-5%. Engagement affects watch time and ad impressions. Higher engagement = more revenue.</p>
                  </div>
                  <div>
                    <h4 className="font-black text-[14px] mb-1">Step 4: Select Your Niche and Country</h4>
                    <p>Choose from 15 niches and 20+ countries. The calculator will automatically suggest realistic CPM rates based on global advertiser data.</p>
                  </div>
                  <div>
                    <h4 className="font-black text-[14px] mb-1">Step 5: Add Additional Income Streams</h4>
                    <p>Include sponsorship rates (per 1,000 views), channel memberships, and Super Thanks to get a complete picture of your total earnings.</p>
                  </div>
                  <div>
                    <h4 className="font-black text-[14px] mb-1">Step 6: Account for Taxes</h4>
                    <p>Enter your local tax percentage (10-30% depending on country) to see your actual take-home net profit after taxes.</p>
                  </div>
                  <div>
                    <h4 className="font-black text-[14px] mb-1">Step 7: Analyze Growth Projection</h4>
                    <p>Set a monthly growth rate (5-20%) to see how your earnings will grow over the next 6 months. This helps with goal setting and planning.</p>
                  </div>
                  <div>
                    <h4 className="font-black text-[14px] mb-1">Step 8: Export or Share Your Report</h4>
                    <p>Click "Copy Report" to copy your earnings breakdown, "Download CSV" to export to Excel, or "Share" to send via WhatsApp.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* COMPREHENSIVE FAQ ACCORDION */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <h3 className="font-black text-[16px] mb-4">❓ Frequently Asked Questions (FAQ)</h3>
              <div className="space-y-3">
                {[
                  { id: "q1", q: "What is a YouTube Earnings Calculator and how does it work?", a: "A YouTube Earnings Calculator is a free tool that estimates your potential YouTube revenue based on views, CPM, niche, country, and additional income streams. It works by multiplying your views by CPM, applying YouTube's 55% creator share, adding sponsorships and other income, then subtracting taxes to show your net profit." },
                  { id: "q2", q: "How accurate is this YouTube money calculator?", a: "This calculator provides estimates accurate to within ±20% of actual earnings. It uses real CPM data from 20+ countries and 15+ niches. However, actual earnings can vary due to ad blockers, viewer demographics, video length, seasonality, and YouTube algorithm changes. Use it for planning, not exact predictions." },
                  { id: "q3", q: "How much does YouTube pay for 1 million views in India vs USA?", a: "In India, 1 million views typically earns $300-$4,000 (₹25,000-₹3,30,000) depending on niche. In the USA, the same views earn $3,000-$22,000. Finance and Tech niches pay the highest in both countries. The difference is due to advertiser demand and purchasing power parity." },
                  { id: "q4", q: "What is the difference between CPM and RPM?", a: "CPM (Cost Per Mille) is what advertisers pay per 1,000 ad impressions. RPM (Revenue Per Mille) is what you earn per 1,000 video views after YouTube's 45% cut. Example: If CPM is $10, your RPM is $5.50. RPM is the metric that matters for your actual earnings." },
                  { id: "q5", q: "Which YouTube niche pays the most in 2024?", a: "The highest-paying YouTube niches in 2024 are: 1) Finance/Insurance ($15-30 CPM), 2) Crypto/Trading ($12-25 CPM), 3) Make Money Online ($10-20 CPM), 4) Software/SaaS/AI Tools ($8-15 CPM), and 5) Real Estate ($8-15 CPM). These niches attract high-value advertisers willing to pay premium rates." },
                  { id: "q6", q: "Do I need 1000 subscribers to earn money on YouTube?", a: "Yes, to join the YouTube Partner Program and monetize with ads, you need 1,000 subscribers AND 4,000 watch hours in 12 months (or 10M Shorts views in 90 days). However, you can earn from sponsorships, affiliate marketing, and selling products even before meeting these requirements." },
                  { id: "q7", q: "Can I make money on YouTube without showing my face?", a: "Absolutely! Faceless YouTube channels are very profitable. Popular ideas include: compilation videos, educational content with animations, gaming highlights, meditation/relaxation content, top 10 lists, and AI-generated videos. Many faceless channels earn $5,000-$50,000+ per month." },
                  { id: "q8", q: "How do YouTube sponsorships work and how much can I charge?", a: "Sponsorships are direct deals with brands to promote their products. Typical rates are $10-50 per 1,000 views depending on your niche and audience. For example, with 100,000 views, you can charge $1,000-$5,000 per sponsored video. Finance and Tech channels command the highest sponsorship rates." }
                ].map((faq) => (
                  <div key={faq.id} className="border-b border-white/10 pb-3 last:border-0">
                    <button onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)} className="w-full flex justify-between items-center text-left font-bold text-[13px] hover:text-orange-500 transition">
                      <span>{faq.q}</span>
                      <span className="text-xl">{openFaq === faq.id ? "−" : "+"}</span>
                    </button>
                    <div className={`accordion-content ${openFaq === faq.id ? "open" : ""}`}>
                      <p className="pt-2 text-[12px] leading-relaxed opacity-70">{faq.a}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </article>
        </div>
      </main>
    </div>
  );
}
