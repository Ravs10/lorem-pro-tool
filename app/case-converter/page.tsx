"use client"
import { useState, useMemo } from "react"

type CaseType = "upper" | "lower" | "title" | "sentence" | "camel" | "pascal" | "snake" | "kebab" | "constant" | "dot" | "path" | "alternating" | "inverse" | "capitalize"

const CASES: { id: CaseType; label: string; desc: string }[] = [
  { id: "upper", label: "UPPERCASE", desc: "ALL CAPS" },
  { id: "lower", label: "lowercase", desc: "all small" },
  { id: "title", label: "Title Case", desc: "Each Word Capital" },
  { id: "sentence", label: "Sentence case", desc: "First letter capital" },
  { id: "capitalize", label: "Capitalize", desc: "First Letter Of Each Sentence" },
  { id: "camel", label: "camelCase", desc: "JS variables" },
  { id: "pascal", label: "PascalCase", desc: "Class names" },
  { id: "snake", label: "snake_case", desc: "Python, DB" },
  { id: "kebab", label: "kebab-case", desc: "URLs, CSS" },
  { id: "constant", label: "CONSTANT_CASE", desc: "Env variables" },
  { id: "dot", label: "dot.case", desc: "Package names" },
  { id: "path", label: "path/case", desc: "File paths" },
  { id: "alternating", label: "aLtErNaTiNg", desc: "Fun text" },
  { id: "inverse", label: "InVeRsE", desc: "Reverse case" },
]

function convert(text: string, type: CaseType): string {
  if (!text) return ""
  const words = text.trim().split(/[\s._\-\/]+/).filter(Boolean)
  switch (type) {
    case "upper": return text.toUpperCase()
    case "lower": return text.toLowerCase()
    case "title": return text.toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
    case "sentence": return text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase())
    case "capitalize": return text.toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
    case "camel": return words.map((w,i) => i===0? w.toLowerCase() : w.charAt(0).toUpperCase()+w.slice(1).toLowerCase()).join("")
    case "pascal": return words.map(w => w.charAt(0).toUpperCase()+w.slice(1).toLowerCase()).join("")
    case "snake": return words.join("_").toLowerCase()
    case "kebab": return words.join("-").toLowerCase()
    case "constant": return words.join("_").toUpperCase()
    case "dot": return words.join(".").toLowerCase()
    case "path": return words.join("/").toLowerCase()
    case "alternating": return text.split("").map((c,i) => i%2==0? c.toLowerCase() : c.toUpperCase()).join("")
    case "inverse": return text.split("").map(c => c===c.toUpperCase()? c.toLowerCase() : c.toUpperCase()).join("")
    default: return text
  }
}

export default function CaseConverterPage() {
  const [text, setText] = useState("Welcome to Advanced Case Converter Tool!")
  const [showMore, setShowMore] = useState(false)
  const [copied, setCopied] = useState(false)
  const [active, setActive] = useState<CaseType | null>(null)

  const stats = useMemo(() => ({
    chars: text.length,
    words: text.trim()? text.trim().split(/\s+/).length : 0,
    lines: text? text.split("\n").length : 0,
    reading: Math.ceil((text.trim().split(/\s+/).length || 0) / 200)
  }), [text])

  const doConvert = (type: CaseType) => {
    setText(convert(text, type))
    setActive(type)
  }

  const faqs = [
    { q: "What is an advanced case converter?", a: "Advanced case converter instantly transforms text into 14+ formats like UPPERCASE, lowercase, Title Case, camelCase, PascalCase, snake_case, kebab-case, CONSTANT_CASE, dot.case, path/case etc. It saves hours of manual retyping for developers and writers." },
    { q: "Is this tool free and private?", a: "Yes, 100% free, no signup. All conversion happens in your browser with JavaScript. Your text never goes to any server, so it's fully private and secure." },
    { q: "Which case should I use for coding?", a: "Use camelCase for JavaScript variables, PascalCase for React Components & Classes, snake_case for Python & databases, kebab-case for URLs & CSS, CONSTANT_CASE for environment variables." },
    { q: "Does it work on mobile?", a: "Yes, fully responsive white-red glassmorphism design works on Android, iPhone, Tablet and Desktop." },
    { q: "Can I download converted text?", a: "Yes, click Download.txt button to save file instantly." },
  ]

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Advanced Case Converter",
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Any",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        featureList: CASES.map(c => c.label)
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } }))
      }
    ]
  }

  return (
    <div className="min-h-screen relative">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes blobFloat { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(40px,-50px) scale(1.1)} 66%{transform:translate(-30px,30px) scale(0.9)} }
        @keyframes fadeUp { from{opacity:0; transform:translateY(20px)} to{opacity:1; transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
       .animate-blob{animation:blobFloat 18s ease-in-out infinite}
       .animate-fade{animation:fadeUp.6s ease both}
       .shimmer{background:linear-gradient(90deg,#dc2626,#ef4444,#f87171,#dc2626); background-size:200% auto; -webkit-background-clip:text; background-clip:text; color:transparent; animation:shimmer 4s linear infinite}
      `}} />

      {/* Background */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-white via-red-50 to-white">
        <div className="absolute -top-40 -left-40 h-[32rem] w-[32rem] rounded-full bg-red-500/20 blur-[100px] animate-blob" />
        <div className="absolute top-1/2 -right-40 h-[28rem] w-[28rem] rounded-full bg-rose-400/20 blur-[100px] animate-blob" style={{ animationDelay: "3s" } as any} />
        <div className="absolute -bottom-40 left-1/3 h-[30rem] w-[30rem] rounded-full bg-red-300/20 blur-[100px] animate-blob" style={{ animationDelay: "6s" } as any} />
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* HERO */}
        <header className="text-center animate-fade">
          <span className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-white/70 px-4 py-1.5 text-xs font-semibold text-red-600 backdrop-blur-xl shadow-sm">
            <span className="h-2 w-2 animate-ping rounded-full bg-red-500"></span> 100% Free • No Signup • Private
          </span>
          <h1 className="mt-6 text-4xl sm:text-6xl font-black tracking-tight text-slate-900">Advanced <span className="shimmer">Case Converter</span></h1>
          <p className="mx-auto mt-4 max-w-2xl text-slate-600">Convert text to <b>UPPERCASE, lowercase, Title Case, camelCase, snake_case</b> and 9+ more formats instantly. Fast, private, white-red glassmorphism UI.</p>
        </header>

        {/* TOOL */}
        <div className="mt-8 rounded-[28px] border border-red-100 bg-white/60 p-5 sm:p-7 backdrop-blur-2xl shadow-[0_20px_80px_-20px_rgba(220,38,38,0.25)] animate-fade">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex gap-3 text-xs text-slate-500">
              <span className="rounded-full bg-white border px-3 py-1">{stats.chars} chars</span>
              <span className="rounded-full bg-white border px-3 py-1">{stats.words} words</span>
              <span className="rounded-full bg-white border px-3 py-1">{stats.lines} lines</span>
              <span className="rounded-full bg-red-50 border border-red-100 text-red-600 px-3 py-1">{stats.reading} min read</span>
            </div>
            <div className="flex gap-2">
              <button onClick={async()=>{ await navigator.clipboard.writeText(text); setCopied(true); setTimeout(()=>setCopied(false),1500)}} className="rounded-full bg-slate-900 text-white px-5 py-2 text-sm font-semibold hover:bg-black">{copied? "Copied!":"Copy"}</button>
              <button onClick={()=>setText("")} className="rounded-full bg-white border px-5 py-2 text-sm">Clear</button>
              <a href={`data:text/plain;charset=utf-8,${encodeURIComponent(text)}`} download="converted.txt" className="rounded-full bg-red-600 text-white px-5 py-2 text-sm font-semibold hover:bg-red-700">Download</a>
            </div>
          </div>

          <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Type or paste your text here..." className="mt-5 h-48 w-full resize-none rounded-2xl border border-red-100 bg-white/80 p-4 text-[15px] outline-none focus:ring-4 focus:ring-red-100" />

          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {CASES.map(c => (
              <button key={c.id} onClick={()=>doConvert(c.id)} className={`group rounded-2xl border p-3 text-left backdrop-blur transition-all hover:-translate-y-1 ${active===c.id? "bg-red-600 text-white border-red-600 shadow-lg shadow-red-200" : "bg-white/80 border-red-100 hover:border-red-300 hover:bg-white"}`}>
                <div className="text-[11px] font-bold tracking-wide opacity-70">{c.desc}</div>
                <div className="text-sm font-bold mt-1">{c.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* FEATURES */}
        <section className="mt-16 grid gap-4 sm:grid-cols-3 animate-fade">
          {[
            { t: "14+ Formats", d: "Every case you need for coding & writing in one click." },
            { t: "100% Private", d: "Runs locally in browser. No server, no tracking." },
            { t: "Lightning Fast", d: "Zero API calls, instant conversion as you type." },
          ].map(f => (
            <div key={f.t} className="rounded-2xl border border-red-100 bg-white/70 p-5 backdrop-blur-xl">
              <h3 className="font-bold text-slate-900">{f.t}</h3>
              <p className="text-sm text-slate-600 mt-1">{f.d}</p>
            </div>
          ))}
        </section>

        {/* SEO CONTENT */}
        <article className="prose prose-slate max-w-none mt-16 rounded-3xl border border-red-100 bg-white/70 p-6 sm:p-10 backdrop-blur-xl">
          <h2 className="text-2xl font-bold text-slate-900">What is Case Converter?</h2>
          <p>Case converter is a free online utility that changes the capitalization of your text. Whether you need UPPERCASE for headings, camelCase for JavaScript, or snake_case for Python, this tool does it instantly.</p>

          <h2>How to Use This Tool? (Step by Step Guide)</h2>
          <ol>
            <li><b>Paste Text:</b> Copy your paragraph, code variable, or title and paste into input box.</li>
            <li><b>Choose Case:</b> Click any button like Title Case, camelCase, CONSTANT_CASE.</li>
            <li><b>Copy Result:</b> Text auto-converts, click Copy or Download.</li>
          </ol>

          <button onClick={()=>setShowMore(!showMore)} className="rounded-full bg-red-600 text-white px-6 py-2.5 text-sm font-semibold mt-4 hover:bg-red-700">{showMore? "Show Less ▲" : "Show More - Detailed Guide ▼"}</button>

          {showMore && (
            <div className="mt-8 animate-fade">
              <h2>All 14 Case Types Explained for Developers</h2>
              <div className="not-prose grid gap-3 mt-4">
                {[
                  ["UPPERCASE","Use for headings, warnings, constants in documentation.","HELLO WORLD"],
                  ["lowercase","For normalizing text, URLs, emails.","hello world"],
                  ["Title Case","For blog titles, book titles, headlines.","Hello World Is Beautiful"],
                  ["camelCase","JavaScript variables: myVariableName, React state."],
                  ["PascalCase","React Components, Classes: MyComponent"],
                  ["snake_case","Python, SQL, file_names: my_variable_name"],
                  ["kebab-case","URLs, CSS classes: my-variable-name"],
                  ["CONSTANT_CASE","Environment variables: API_KEY, MAX_VALUE"],
                  ["dot.case & path/case","For packages and file paths: com.example or src/components"],
                ].map(([k,d,e])=>(
                  <div key={k} className="flex gap-3 rounded-xl bg-red-50/70 border border-red-100 p-3">
                    <b className="min-w-[130px] text-red-700">{k}</b><span className="text-sm">{d} {e && <code className="bg-white px-2 py-0.5 rounded border text-xs">{e}</code>}</span>
                  </div>
                ))}
              </div>
              <h2 className="mt-8">Why Choose Our Tool?</h2>
              <p>Unlike other converters with ads and popups, CaseCraft offers clean white-red glassmorphism design, animations, instant preview, download option and works offline. Perfect for developers, content writers, students and SEO experts.</p>
            </div>
          )}
        </article>

        {/* FAQ */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-center text-slate-900">Frequently Asked Questions</h2>
          <div className="mx-auto mt-6 max-w-3xl space-y-3">
            {faqs.map((f,i)=>(
              <details key={i} className="group rounded-2xl border border-red-100 bg-white/70 px-5 py-4 backdrop-blur-xl open:bg-white">
                <summary className="flex cursor-pointer list-none justify-between font-semibold text-slate-900">{f.q}<span className="text-red-500 group-open:rotate-45 transition">+</span></summary>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <footer className="mt-16 text-center text-sm text-slate-400 border-t border-red-100 pt-6">
          © {new Date().getFullYear()} Advanced Case Converter — Built with Next.js • White Red Glassmorphism • Free Forever
        </footer>
      </div>
    </div>
  )
}
