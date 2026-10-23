"use client";
import { useState, useMemo } from "react";
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

// Helper for new features (purana logic same rahega)
const makeSlugHelper = (input: string, separator: string, lowercase: boolean, removeStop: boolean, maxLen: number, transliterate: boolean, prefix: string) => {
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
  // NEW FEATURES STATE - ADDED
  const [tab, setTab] = useState<"single"|"bulk">("single");
  const [bulkInput, setBulkInput] = useState("Best Laptops for Students\nTop 10 Gaming Monitors 2026\nHow to Start a Blog - Beginner Guide");

  // PURANA SLUG LOGIC - SAME AS BEFORE
  const slug = useMemo(() => {
    let s = input;
    if (transliterate) s = s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (lowercase) s = s.toLowerCase();
    s = s.replace(/[^a-zA-Z0-9\s-]/g, " ");
    if (removeStop) {
      s = s.split(/\s+/).filter(w => !stopWords.includes(w.toLowerCase())).join(" ");
    }
    s = s.trim().replace(/\s+/g, separator).replace(new RegExp(`${separator}+`, "g"), separator);
    s = s.replace(new RegExp(`^${separator}|${separator}$`, "g"), "");
    if (maxLen && s.length > maxLen) s = s.slice(0, maxLen).replace(new RegExp(`${separator}[^${separator}]*$`), "");
    if (prefix) s = `${prefix}${separator}${s}`;
    return s;
  }, [input, separator, lowercase, removeStop, maxLen, transliterate, prefix]);

  // NEW - BULK LOGIC
  const bulkSlugs = useMemo(() => {
    return bulkInput.split("\n").filter(Boolean).map(line => ({
      original: line,
      slug: makeSlugHelper(line, separator, lowercase, removeStop, maxLen, transliterate, prefix)
    }));
  }, [bulkInput, separator, lowercase, removeStop, maxLen, transliterate, prefix]);

  const copy = (t: string) => {
    navigator.clipboard.writeText(t);
    setToast("Copied!"); setTimeout(()=>setToast(null),1500);
    if (t && !history.includes(t)) setHistory([t, ...history].slice(0,10));
  };

  // NEW FEATURES FUNCTIONS
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
    navigator.clipboard.writeText(js);
    setToast("JS Array Copied!");
  };

  const isDark = theme === "dark";

  return (
    <div className={`${isDark ? "bg-neutral-950 text-white" : "bg-zinc-50 text-zinc-900"} w-full overflow-x-hidden transition-colors`}>
      <div className="mx-auto max-w-6xl w-full px-4 py-6">
        
        <div className={`flex justify-between items-center rounded-2xl border ${isDark ? "border-white/10 bg-zinc-900" : "border-zinc-200 bg-white"} px-5 py-4`}>
          <h1 className="text-sm font-black tracking-widest">SLUG STUDIO</h1>
          <button onClick={()=>setTheme(isDark ? "light" : "dark")} className={`rounded-full px-4 py-1.5 text-xs font-bold ${isDark ? "bg-white text-black" : "bg-black text-white"}`}>
            {isDark ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>

        {/* NEW - TABS */}
        <div className="mt-6 flex justify-center">
          <div className={`inline-flex rounded-full p-1 border ${isDark ? "border-white/10 bg-zinc-900" : "border-zinc-200 bg-white"}`}>
            <button onClick={()=>setTab("single")} className={`rounded-full px-6 py-2 text-xs font-bold transition ${tab==="single" ? "bg-orange-500 text-white" : "opacity-60"}`}>Single Mode</button>
            <button onClick={()=>setTab("bulk")} className={`rounded-full px-6 py-2 text-xs font-bold transition ${tab==="bulk" ? "bg-orange-500 text-white" : "opacity-60"}`}>Bulk Mode</button>
          </div>
        </div>

        <div className="mt-8 grid md:grid-cols-2 gap-6 w-full">
          <div className={`rounded-[2rem] border ${isDark ? "border-white/10 bg-zinc-900" : "border-zinc-200 bg-white"} p-6 w-full min-w-0`}>
            {tab==="single" ? (
              <>
                <label className="text-xs tracking-widest opacity-50">YOUR TITLE / TEXT</label>
                <textarea value={input} onChange={e=>setInput(e.target.value)} rows={5} className={`mt-3 w-full rounded-xl border ${isDark ? "border-white/10 bg-black" : "border-zinc-200 bg-zinc-50"} p-4 text-sm outline-none focus:border-orange-500/50 min-w-0`} placeholder="Enter blog title, product name..." />
              </>
            ) : (
              <>
                <label className="text-xs tracking-widest opacity-50">BULK TITLES (one per line)</label>
                <textarea value={bulkInput} onChange={e=>setBulkInput(e.target.value)} rows={8} className={`mt-3 w-full rounded-xl border ${isDark ? "border-white/10 bg-black" : "border-zinc-200 bg-zinc-50"} p-4 text-sm outline-none focus:border-orange-500/50 min-w-0`} placeholder="One title per line..." />
                <div className="mt-3 flex gap-2 flex-wrap">
                  <button onClick={exportCSV} className="rounded-full bg-white text-black px-4 py-2 text-xs font-bold">Export CSV</button>
                  <button onClick={exportJS} className={`rounded-full border ${isDark ? "border-white/10 bg-zinc-800" : "border-zinc-200 bg-white"} px-4 py-2 text-xs font-bold`}>Copy as JS Array</button>
                </div>
              </>
            )}
            
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className={`rounded-xl border ${isDark ? "border-white/10 bg-black/50" : "bg-zinc-50 border-zinc-200"} p-3 min-w-0`}>
                <p className="text-[11px] opacity-50">Separator</p>
                <select value={separator} onChange={e=>setSeparator(e.target.value)} className="bg-transparent text-sm font-bold outline-none w-full mt-1">
                  <option value="-">Hyphen (-)</option>
                  <option value="_">Underscore (_)</option>
                </select>
              </div>
              <div className={`rounded-xl border ${isDark ? "border-white/10 bg-black/50" : "bg-zinc-50 border-zinc-200"} p-3 min-w-0`}>
                <p className="text-[11px] opacity-50">Max Length</p>
                <input type="number" value={maxLen} onChange={e=>setMaxLen(Number(e.target.value))} className="bg-transparent text-sm font-bold outline-none w-full mt-1" />
              </div>
              <input value={prefix} onChange={e=>setPrefix(e.target.value)} placeholder="Prefix (e.g. blog)" className={`col-span-2 rounded-xl border ${isDark ? "border-white/10 bg-black/50" : "bg-zinc-50 border-zinc-200"} p-3 text-sm outline-none min-w-0`} />
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

          <div className="space-y-4 w-full min-w-0">
            {tab==="single" ? (
              <div className={`rounded-[2rem] border ${isDark ? "border-orange-500/20 bg-gradient-to-br from-zinc-900 to-zinc-900/50" : "border-orange-200 bg-white"} p-6 w-full min-w-0 overflow-hidden`}>
                <p className="text-xs tracking-widest opacity-50">GENERATED SLUG</p>
                <div className={`mt-4 rounded-xl ${isDark ? "bg-black" : "bg-zinc-100"} p-4 font-mono text-sm break-all border ${isDark ? "border-white/10" : "border-zinc-200"}`}>
                  {slug || <span className="opacity-30">your-slug-will-appear-here</span>}
                </div>
                <div className="mt-4 flex gap-2">
                  <button onClick={()=>copy(slug)} className="flex-1 rounded-full bg-orange-500 py-3 text-sm font-bold text-white hover:bg-orange-400 transition">Copy Slug</button>
                  <button onClick={()=>copy(`${typeof window !== "undefined" ? window.location.origin : ""}/${slug}`)} className={`rounded-full px-6 py-3 text-sm font-bold border ${isDark ? "border-white/10 bg-zinc-800" : "border-zinc-200 bg-zinc-50"}`}>Copy Full URL</button>
                </div>
                {/* NEW - SERP PREVIEW */}
                <div className={`mt-5 rounded-xl border ${isDark ? "border-white/10 bg-black/50" : "border-zinc-200 bg-zinc-50"} p-4`}>
                  <p className="text-[10px] tracking-widest opacity-40 mb-2">LIVE SERP PREVIEW</p>
                  <p className="text-xs text-[#1a0dab] dark:text-[#8ab4f8] break-all">https://loremprotool.com/{slug}</p>
                  <p className="text-sm font-medium mt-1 break-words">{input.slice(0,60) || "Your Page Title"}</p>
                  <p className="text-xs opacity-60 mt-1">This is how your slug will look in Google. Short slugs = higher CTR.</p>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className={`rounded-xl ${isDark ? "bg-black/50" : "bg-zinc-50"} p-3`}><p className="text-[10px] opacity-50">CHARS</p><p className="font-bold">{slug.length}</p></div>
                  <div className={`rounded-xl ${isDark ? "bg-black/50" : "bg-zinc-50"} p-3`}><p className="text-[10px] opacity-50">WORDS</p><p className="font-bold">{slug.split(separator).filter(Boolean).length}</p></div>
                  <div className={`rounded-xl ${isDark ? "bg-black/50" : "bg-zinc-50"} p-3`}><p className="text-[10px] opacity-50">SEO</p><p className="font-bold text-green-500">{slug.length <= 60 ? "Good" : "Long"}</p></div>
                </div>
              </div>
            ) : (
              <div className={`rounded-[2rem] border ${isDark ? "border-white/10 bg-zinc-900" : "border-zinc-200 bg-white"} p-6 w-full`}>
                <p className="text-xs tracking-widest opacity-50">BULK OUTPUT ({bulkSlugs.length})</p>
                <div className="mt-4 space-y-2 max-h-[420px] overflow-auto">
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
            Welcome to <b>Slug Studio - Best Free Slug Generator Online</b>, the ultimate tool to convert any title, heading, or sentence into a clean, SEO-friendly URL slug. Whether you are a blogger, YouTuber, developer, or e-commerce owner, a perfect slug is critical for SEO rankings and CTR. Our advanced slug generator handles transliteration, stop-word removal, length control, prefix, and hyphens vs underscores automatically. 100% free, offline, no signup.
          </p>
          {!showSeo && <button onClick={()=>setShowSeo(true)} className="mt-4 text-sm font-bold text-violet-500">Read Full Guide 1000+ Words ↓</button>}
          {showSeo && (
            <div className="mt-8 space-y-8">
              <section>
                <h2 className="text-xl font-bold">What is a URL Slug and Why is it Important for SEO?</h2>
                <p className="mt-2 opacity-80 leading-relaxed">A URL slug is the last part of a URL that identifies a specific page in human-readable form. For example, in https://example.com/best-gaming-laptops, best-gaming-laptops is the slug. Google uses slugs to understand page content. A good slug improves SEO, click-through rate, and shareability. Bad slugs like /p?id=12345 look spammy and get fewer clicks. Our slug generator tool ensures your slugs are short, keyword-rich, hyphen-separated, and lowercase as per Google's 2026 guidelines.</p>
              </section>
              <section>
                <h2 className="text-xl font-bold">How to Generate Perfect SEO Slugs? Step-by-Step</h2>
                <p className="mt-2 opacity-80 leading-relaxed"><b>Step 1:</b> Paste your blog title like "10 Best Laptops for Gaming in 2026". <b>Step 2:</b> Choose hyphen separator (Google recommends hyphen, not underscore). <b>Step 3:</b> Enable "Remove Stop Words" to remove "for, in, the" and make slug shorter. <b>Step 4:</b> Set max length to 60 chars for best SERP display. <b>Step 5:</b> Click Copy. That's it! Our tool also supports prefix like "blog/best-laptops". This workflow is used by top SEO experts at Yoast and RankMath.</p>
              </section>
              <section>
                <h2 className="text-xl font-bold">Slug Generator vs Manual Slug Creation</h2>
                <p className="mt-2 opacity-80 leading-relaxed">Manually creating slugs takes time and often leaves special characters like café, &, %, ?. Our tool auto-transliterates café → cafe, removes symbols, converts to lowercase, and collapses double hyphens. It also checks SEO length. Manual slugs often exceed 80 chars, ours keeps under 60. Plus history feature lets you reuse old slugs.</p>
              </section>
              <section>
                <h2 className="text-xl font-bold">Best Practices for URL Slugs in 2026</h2>
                <ul className="mt-2 list-disc pl-5 opacity-80 space-y-1">
                  <li>Use hyphens (-) not underscores (_), Google treats hyphen as space</li>
                  <li>Keep 3-5 words, under 60 characters for higher CTR</li>
                  <li>Front-load primary keyword: best-laptops not my-top-10-best-laptops</li>
                  <li>Always lowercase, avoid uppercase for canonical issues</li>
                  <li>Remove stop words: the, and, or, in, for</li>
                  <li>Never repeat keyword: avoid laptop-laptop-deals</li>
                </ul>
              </section>
              <section>
                <h2 className="text-xl font-bold mb-4">Frequently Asked Questions</h2>
                <div className="space-y-3">
                  {[
                    {q:"What is slug generator used for?", a:"It converts titles to SEO-friendly URL slugs for blogs, products, videos, and pages. Essential for WordPress, Shopify, Next.js developers."},
                    {q:"Hyphen vs underscore which is better?", a:"Always hyphen. Google's John Mueller confirmed hyphen is word separator, underscore is joiner. my_page = mypage, my-page = my page."},
                    {q:"Should I keep year in slug?", a:"Only for yearly roundups like best-laptops-2026. For evergreen content, avoid year to prevent aging."},
                    {q:"Is this slug generator free for commercial use?", a:"Yes, 100% free, no watermark, unlimited use, offline processing, privacy friendly."},
                    {q:"Can it handle Hindi or special characters?", a:"Yes, transliteration converts café to cafe, and removes Hindi diacritics via NFD normalization. For full Hindi, use English transliteration."},
                  ].map((f,i)=>(
                    <div key={i} className={`rounded-xl border ${isDark ? "border-white/10 bg-black/30" : "border-zinc-200 bg-zinc-50"} overflow-hidden`}>
                      <button onClick={()=>setOpenFaq(openFaq===i ? null : i)} className="w-full flex justify-between items-center p-4 text-left font-bold text-sm">
                        {f.q}<span>{openFaq===i ? "−" : "+"}</span>
                      </button>
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
