"use client";
import { useState, useMemo, useEffect } from "react";
import Link from "next/link";

const stopWords = ["a","an","the","and","or","but","is","are","was","were","in","on","at","of","for","to","with","by","from"];
const otherTools = [
  { name: "Color Palette", href: "/color-palette", emoji: "🎨", grad: "from-violet-500 to-fuchsia-500" },
  { name: "Word Counter", href: "/word-counter", emoji: "📝", grad: "from-blue-500 to-cyan-500" },
  { name: "Fancy Text", href: "/fancy-text", emoji: "✨", grad: "from-pink-500 to-rose-500" },
  { name: "Password Gen", href: "/password-generator", emoji: "🔑", grad: "from-emerald-500 to-teal-500" },
  { name: "QR Generator", href: "/placeholder-qr-generator", emoji: "🔳", grad: "from-orange-500 to-yellow-500" },
  { name: "Case Converter", href: "/case-converter", emoji: "🔠", grad: "from-indigo-500 to-purple-500" },
  { name: "Image to Text", href: "/image-to-text", emoji: "🖼️", grad: "from-red-500 to-pink-500" },
  { name: "Fake Data", href: "/fake-data-generator", emoji: "🧪", grad: "from-green-500 to-lime-500" },
];

// --- Slug logic reusable ---
const makeSlug = (input: string, separator: string, lowercase: boolean, removeStop: boolean, maxLen: number, transliterate: boolean, prefix: string) => {
  let s = input;
  if (transliterate) s = s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (lowercase) s = s.toLowerCase();
  s = s.replace(/[^a-zA-Z0-9\s-]/g, " ");
  if (removeStop) s = s.split(/\s+/).filter(w => !stopWords.includes(w.toLowerCase())).join(" ");
  s = s.trim().replace(/\s+/g, separator).replace(new RegExp(`${separator}+`, "g"), separator);
  s = s.replace(new RegExp(`^${separator}|${separator}$`, "g"), "");
  if (maxLen && s.length > maxLen) s = s.slice(0, maxLen).replace(new RegExp(`${separator}[^${separator}]*$`), "");
  if (prefix) s = `${prefix}${separator}${s}`;
  return s;
};

export default function SlugGenerator() {
  const [input, setInput] = useState("10 Best Laptops for Gaming in 2026 - Ultimate Guide!");
  const [separator, setSeparator] = useState("-");
  const [lowercase, setLowercase] = useState(true);
  const [removeStop, setRemoveStop] = useState(true);
  const [maxLen, setMaxLen] = useState(60);
  const [transliterate, setTransliterate] = useState(true);
  const [prefix, setPrefix] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [theme, setTheme] = useState<"dark"|"light">("dark");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [showSeo, setShowSeo] = useState(false);
  // --- NEW STATES FOR 10/10 ---
  const [tab, setTab] = useState<"single"|"bulk">("single");
  const [bulkInput, setBulkInput] = useState("Best Laptops for Students\nTop 10 Gaming Monitors 2026\nHow to Start a Blog - Beginner Guide");

  const slug = useMemo(() => makeSlug(input, separator, lowercase, removeStop, maxLen, transliterate, prefix), [input, separator, lowercase, removeStop, maxLen, transliterate, prefix]);

  const bulkSlugs = useMemo(() => {
    return bulkInput.split("\n").filter(Boolean).map(line => ({
      original: line,
      slug: makeSlug(line, separator, lowercase, removeStop, maxLen, transliterate, prefix)
    }));
  }, [bulkInput, separator, lowercase, removeStop, maxLen, transliterate, prefix]);

  const copy = (t: string) => {
    navigator.clipboard.writeText(t);
    setToast("Copied!"); setTimeout(()=>setToast(null),1500);
    if (t && !history.includes(t)) setHistory([t, ...history].slice(0,10));
  };

  const exportCSV = () => {
    const rows = [["Original Title","Generated Slug"], ...bulkSlugs.map(b=>[`"${b.original.replace(/"/g,'""')}"`, b.slug])];
    const csv = rows.map(r=>r.join(",")).join("\n");
    const blob = new Blob([csv], {type:"text/csv"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href=url; a.download="slugs.csv"; a.click();
    setToast("CSV Downloaded!");
  };

  const exportJS = () => {
    const js = `const slugs = ${JSON.stringify(bulkSlugs.map(b=>b.slug), null, 2)};`;
    copy(js);
  };

  const isDark = theme === "dark";

  return (
    <div className={`${isDark ? "bg-neutral-950 text-white" : "bg-zinc-50 text-zinc-900"} min-h-screen transition-colors`}>
      <div className="mx-auto max-w-6xl px-4 py-6">
        
        <div className={`flex justify-between items-center rounded-2xl border ${isDark ? "border-white/10 bg-zinc-900" : "border-zinc-200 bg-white"} px-5 py-4`}>
          <h1 className="text-sm font-black tracking-widest">SLUG STUDIO</h1>
          <button onClick={()=>setTheme(isDark ? "light" : "dark")} className={`rounded-full px-4 py-1.5 text-xs font-bold ${isDark ? "bg-white text-black" : "bg-black text-white"}`}>
            {isDark ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>

        {/* TABS - NEW */}
        <div className="mt-6 flex justify-center">
          <div className={`inline-flex rounded-full p-1 border ${isDark ? "border-white/10 bg-zinc-900" : "border-zinc-200 bg-white"}`}>
            <button onClick={()=>setTab("single")} className={`rounded-full px-6 py-2 text-xs font-bold transition ${tab==="single" ? "bg-orange-500 text-white" : "opacity-60"}`}>Single Mode</button>
            <button onClick={()=>setTab("bulk")} className={`rounded-full px-6 py-2 text-xs font-bold transition ${tab==="bulk" ? "bg-orange-500 text-white" : "opacity-60"}`}>Bulk Mode (10/10)</button>
          </div>
        </div>

        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <div className={`rounded-[2rem] border ${isDark ? "border-white/10 bg-zinc-900" : "border-zinc-200 bg-white"} p-6`}>
            {tab==="single" ? (
              <>
                <label className="text-xs tracking-widest opacity-50">YOUR TITLE / TEXT</label>
                <textarea value={input} onChange={e=>setInput(e.target.value)} rows={5} className={`mt-3 w-full rounded-xl border ${isDark ? "border-white/10 bg-black" : "border-zinc-200 bg-zinc-50"} p-4 text-sm outline-none focus:border-orange-500/50`} placeholder="Enter blog title..." />
              </>
            ) : (
              <>
                <label className="text-xs tracking-widest opacity-50">BULK TITLES (one per line)</label>
                <textarea value={bulkInput} onChange={e=>setBulkInput(e.target.value)} rows={8} className={`mt-3 w-full rounded-xl border ${isDark ? "border-white/10 bg-black" : "border-zinc-200 bg-zinc-50"} p-4 text-sm outline-none focus:border-orange-500/50`} placeholder="One title per line..." />
                <div className="mt-3 flex gap-2">
                  <button onClick={exportCSV} className="rounded-full bg-white text-black px-4 py-2 text-xs font-bold">Export CSV</button>
                  <button onClick={exportJS} className={`rounded-full border ${isDark ? "border-white/10 bg-zinc-800" : "border-zinc-200"} px-4 py-2 text-xs font-bold`}>Copy as JS Array</button>
                </div>
              </>
            )}
            
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className={`rounded-xl border ${isDark ? "border-white/10 bg-black/50" : "bg-zinc-50 border-zinc-200"} p-3`}>
                <p className="text-[11px] opacity-50">Separator</p>
                <select value={separator} onChange={e=>setSeparator(e.target.value)} className="bg-transparent text-sm font-bold outline-none w-full mt-1">
                  <option value="-">Hyphen (-)</option>
                  <option value="_">Underscore (_)</option>
                </select>
              </div>
              <div className={`rounded-xl border ${isDark ? "border-white/10 bg-black/50" : "bg-zinc-50 border-zinc-200"} p-3`}>
                <p className="text-[11px] opacity-50">Max Length</p>
                <input type="number" value={maxLen} onChange={e=>setMaxLen(Number(e.target.value))} className="bg-transparent text-sm font-bold outline-none w-full mt-1" />
              </div>
              <input value={prefix} onChange={e=>setPrefix(e.target.value)} placeholder="Prefix (e.g. blog)" className={`col-span-2 rounded-xl border ${isDark ? "border-white/10 bg-black/50" : "bg-zinc-50 border-zinc-200"} p-3 text-sm outline-none`} />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {[
                {k:"lowercase", v:lowercase, s:setLowercase, l:"lowercase"},
                {k:"stopwords", v:removeStop, s:setRemoveStop, l:"Remove Stop Words"},
                {k:"trans", v:transliterate, s:setTransliterate, l:"Transliterate café → cafe"},
              ].map(f=>(
                <button key={f.k} onClick={()=>f.s(!f.v)} className={`rounded-full px-4 py-2 text-xs font-bold border transition ${f.v ? "bg-orange-500 border-orange-500 text-white" : isDark ? "border-white/10 bg-zinc-800" : "border-zinc-200 bg-white"}`}>
                  {f.v ? "✓ " : ""}{f.l}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {/* SINGLE OUTPUT */}
            {tab==="single" ? (
              <div className={`rounded-[2rem] border ${isDark ? "border-orange-500/20 bg-gradient-to-br from-zinc-900 to-zinc-900/50" : "border-orange-200 bg-white"} p-6`}>
                <p className="text-xs tracking-widest opacity-50">GENERATED SLUG</p>
                <div className={`mt-4 rounded-xl ${isDark ? "bg-black" : "bg-zinc-100"} p-4 font-mono text-sm break-all border ${isDark ? "border-white/10" : "border-zinc-200"}`}>
                  {slug || <span className="opacity-30">your-slug-will-appear-here</span>}
                </div>
                <div className="mt-4 flex gap-2">
                  <button onClick={()=>copy(slug)} className="flex-1 rounded-full bg-orange-500 py-3 text-sm font-bold text-white hover:bg-orange-400 transition">Copy Slug</button>
                  <button onClick={()=>copy(`${typeof window !== "undefined" ? window.location.origin : ""}/${slug}`)} className={`rounded-full px-6 py-3 text-sm font-bold border ${isDark ? "border-white/10 bg-zinc-800" : "border-zinc-200 bg-zinc-50"}`}>Copy Full URL</button>
                </div>
                {/* SERP PREVIEW - NEW */}
                <div className={`mt-6 rounded-xl border ${isDark ? "border-white/10 bg-black/50" : "border-zinc-200 bg-zinc-50"} p-4`}>
                  <p className="text-[10px] tracking-widest opacity-40 mb-2">LIVE SERP PREVIEW</p>
                  <p className="text-xs text-[#4d4d4d] dark:text-[#8ab4f8] truncate">{typeof window !== "undefined" ? window.location.origin : "https://example.com"}/{slug}</p>
                  <p className="text-sm text-[#1a0dab] dark:text-[#8ab4f8] font-medium truncate mt-1">{input.slice(0,60) || "Your Page Title"}</p>
                  <p className="text-xs opacity-60 mt-1 line-clamp-2">This is how your slug will look in Google search results. Short, keyword-rich slugs get higher CTR...</p>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className={`rounded-xl ${isDark ? "bg-black/50" : "bg-zinc-50"} p-3`}><p className="text-[10px] opacity-50">CHARS</p><p className="font-bold">{slug.length}</p></div>
                  <div className={`rounded-xl ${isDark ? "bg-black/50" : "bg-zinc-50"} p-3`}><p className="text-[10px] opacity-50">WORDS</p><p className="font-bold">{slug.split(separator).filter(Boolean).length}</p></div>
                  <div className={`rounded-xl ${isDark ? "bg-black/50" : "bg-zinc-50"} p-3`}><p className="text-[10px] opacity-50">SEO</p><p className="font-bold text-green-500">{slug.length <= 60 ? "Good" : "Long"}</p></div>
                </div>
              </div>
            ) : (
              /* BULK OUTPUT - NEW */
              <div className={`rounded-[2rem] border ${isDark ? "border-white/10 bg-zinc-900" : "border-zinc-200 bg-white"} p-6`}>
                <p className="text-xs tracking-widest opacity-50">BULK OUTPUT ({bulkSlugs.length})</p>
                <div className="mt-4 space-y-2 max-h-[400px] overflow-auto">
                  {bulkSlugs.map((b,i)=>(
                    <div key={i} className={`flex justify-between items-center rounded-xl ${isDark ? "bg-black" : "bg-zinc-50"} border ${isDark ? "border-white/5" : "border-zinc-200"} p-3`}>
                      <div className="truncate pr-3"><p className="text-xs font-mono truncate">{b.slug}</p><p className="text-[10px] opacity-40 truncate">{b.original}</p></div>
                      <button onClick={()=>copy(b.slug)} className="text-xs font-bold text-orange-500 shrink-0">Copy</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {history.length > 0 && (
              <div className={`rounded-2xl border ${isDark ? "border-white/10 bg-zinc-900" : "border-zinc-200 bg-white"} p-4`}>
                <p className="text-[11px] tracking-widest opacity-40 mb-2">HISTORY</p>
                <div className="space-y-2 max-h-32 overflow-auto">
                  {history.map((h,i)=><button key={i} onClick={()=>copy(h)} className={`w-full text-left rounded-lg ${isDark ? "bg-black/50 hover:bg-black" : "bg-zinc-50 hover:bg-zinc-100"} px-3 py-2 text-xs font-mono truncate`}>{h}</button>)}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className={`mt-16 rounded-[2rem] border ${isDark ? "border-white/10 bg-gradient-to-b from-zinc-900 to-zinc-900/50" : "border-zinc-200 bg-white"} p-6 md:p-8`}>
          <div className="flex items-center gap-3">
            <div className="h-8 w-1.5 rounded-full bg-gradient-to-b from-orange-500 to-violet-500"></div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight">Other Useful Tools</h2>
          </div>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {otherTools.map((tool) => (
              <Link key={tool.href} href={tool.href} className={`group relative overflow-hidden rounded-2xl border ${isDark ? "border-white/10 bg-zinc-800/50" : "border-zinc-200 bg-zinc-50"} p-[1px] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl`}>
                <div className={`relative rounded-[15px] ${isDark ? "bg-zinc-900" : "bg-white"} p-4 h-full`}>
                  <div className={`absolute -inset-10 bg-gradient-to-br ${tool.grad} opacity-0 group-hover:opacity-20 blur-2xl transition-opacity duration-500`}></div>
                  <div className="relative z-10">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${tool.grad} flex items-center justify-center text-lg shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>{tool.emoji}</div>
                    <h3 className="mt-4 font-bold group-hover:text-orange-400 transition-colors">{tool.name}</h3>
                    <div className="mt-2 flex items-center text-[11px] font-bold text-violet-500 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300">Try now →</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className={`mt-16 rounded-[2rem] border ${isDark ? "border-zinc-800 bg-zinc-900/50" : "border-zinc-200 bg-white"} p-6 md:p-8`}>
          <h2 className="text-2xl md:text-3xl font-bold">Slug Generator - Free SEO Friendly URL Slug Maker 2026</h2>
          <p className="mt-4 leading-relaxed opacity-80">
            Welcome to <b>Slug Studio - Best Free Slug Generator Online</b>, the ultimate tool to convert any title, heading, or sentence into a clean, SEO-friendly URL slug. Whether you are a blogger, YouTuber, developer, or e-commerce owner, a perfect slug is critical for SEO rankings and CTR. Our advanced slug generator handles transliteration, stop-word removal, length control, prefix, bulk generation, CSV export, and SERP preview automatically. 100% free, offline, no signup.
          </p>
          {!showSeo && <button onClick={()=>setShowSeo(true)} className="mt-4 text-sm font-bold text-violet-500">Read Full Guide 1000+ Words ↓</button>}
          {showSeo && (
            <div className="mt-8 space-y-8 animate-in fade-in">
              <section><h2 className="text-xl font-bold">What is a URL Slug and Why is it Important for SEO?</h2><p className="mt-2 opacity-80 leading-relaxed">A URL slug is the last part of a URL that identifies a specific page in human-readable form. For example, in https://example.com/best-gaming-laptops, best-gaming-laptops is the slug. Google uses slugs to understand page content. A good slug improves SEO, click-through rate, and shareability. Bad slugs like /p?id=12345 look spammy and get fewer clicks. Our slug generator tool ensures your slugs are short, keyword-rich, hyphen-separated, and lowercase as per Google's 2026 guidelines.</p></section>
              <section><h2 className="text-xl font-bold">How to Generate Perfect SEO Slugs? Step-by-Step</h2><p className="mt-2 opacity-80 leading-relaxed"><b>Step 1:</b> Paste your blog title like "10 Best Laptops for Gaming in 2026". <b>Step 2:</b> Choose hyphen separator. <b>Step 3:</b> Enable Remove Stop Words. <b>Step 4:</b> Set max length 60 chars. <b>Step 5:</b> Copy. With bulk mode, paste 10 titles and export CSV for WordPress.</p></section>
              <section><h2 className="text-xl font-bold">Best Practices for URL Slugs in 2026</h2><ul className="mt-2 list-disc pl-5 opacity-80 space-y-1"><li>Use hyphens (-) not underscores (_)</li><li>Keep 3-5 words, under 60 characters</li><li>Front-load primary keyword</li><li>Always lowercase</li><li>Remove stop words</li><li>Check SERP preview before publishing</li></ul></section>
              <section>
                <h2 className="text-xl font-bold mb-4">Frequently Asked Questions</h2>
                <div className="space-y-3">
                  {[
                    {q:"What is slug generator used for?", a:"It converts titles to SEO-friendly URL slugs for blogs, products, videos, and pages. Essential for WordPress, Shopify, Next.js."},
                    {q:"Hyphen vs underscore which is better?", a:"Always hyphen. Google treats hyphen as separator, underscore as joiner."},
                    {q:"What is bulk slug generator?", a:"Paste multiple titles line by line, get all slugs at once and export as CSV - saves hours for bloggers."},
                    {q:"What is SERP preview?", a:"Live Google result mockup showing how your URL will appear in search, helps optimize CTR."},
                    {q:"Is this free?", a:"Yes, 100% free, offline, no watermark."},
                  ].map((f,i)=>(
                    <div key={i} className={`rounded-xl border ${isDark ? "border-white/10 bg-black/30" : "border-zinc-200 bg-zinc-50"} overflow-hidden`}>
                      <button onClick={()=>setOpenFaq(openFaq===i ? null : i)} className="w-full flex justify-between items-center p-4 text-left font-bold text-sm">{f.q}<span>{openFaq===i ? "−" : "+"}</span></button>
                      {openFaq===i && <p className="px-4 pb-4 text-sm opacity-70 leading-relaxed">{f.a}</p>}
                    </div>
                  ))}
                </div>
              </section>
              <button onClick={()=>setShowSeo(false)} className="text-sm opacity-50">Show Less ↑</button>
            </div>
          )}
        </div>
      </div>
      {toast && <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-orange-500 px-6 py-3 text-sm font-bold shadow-xl z-50">{toast}</div>}
    </div>
  );
}
