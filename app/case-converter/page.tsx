"use client"
import { useState, useMemo } from "react"

type CaseType = "upper" | "lower" | "title" | "sentence" | "camel" | "pascal" | "snake" | "kebab" | "alternating" | "inverse"

export default function CaseConverterPage() {
  const [text, setText] = useState("")
  const [showMore, setShowMore] = useState(false)

  const stats = useMemo(() => {
    return {
      chars: text.length,
      words: text.trim()? text.trim().split(/\s+/).length : 0,
      lines: text? text.split("\n").length : 0
    }
  }, [text])

  function convert(type: CaseType) {
    if (!text) return
    let result = text
    switch(type) {
      case "upper": result = text.toUpperCase(); break
      case "lower": result = text.toLowerCase(); break
      case "title": result = text.toLowerCase().replace(/\b\w/g, c => c.toUpperCase()); break
      case "sentence": result = text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase()); break
      case "camel": result = text.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase()); break
      case "pascal": {
        const camel = text.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase())
        result = camel.charAt(0).toUpperCase() + camel.slice(1)
        break
      }
      case "snake": result = text.trim().toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, ""); break
      case "kebab": result = text.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""); break
      case "alternating": result = text.split("").map((c,i) => i%2==0? c.toLowerCase() : c.toUpperCase()).join(""); break
      case "inverse": result = text.split("").map(c => c===c.toUpperCase()? c.toLowerCase() : c.toUpperCase()).join(""); break
    }
    setText(result)
  }

  const faqs = [
    { q: "What is a Case Converter?", a: "Case converter is a free online tool that converts text between different letter cases like UPPERCASE, lowercase, Title Case, camelCase etc." },
    { q: "Is this tool free?", a: "Yes, 100% free and works offline in your browser. No data is sent to server." },
    { q: "What cases are supported?", a: "UPPERCASE, lowercase, Title Case, Sentence case, camelCase, PascalCase, snake_case, kebab-case, aLtErNaTiNg and InVeRsE case." }
  ]

  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Case Converter - Free Online Text Case Converter",
    "applicationCategory": "UtilitiesApplication",
    "offers": { "@type": "Offer", "price": "0" },
    "description": "Free online case converter to convert text to uppercase, lowercase, title case, camelCase and more."
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(f => ({ "@type": "Question", "name": f.q, "acceptedAnswer": { "@type": "Answer", "text": f.a } }))
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <h1 className="text-3xl font-bold">Case Converter - Free Online Tool</h1>
      <p className="text-gray-600 mt-2">Convert text to UPPER CASE, lower case, Title Case, camelCase instantly.</p>

      {/* TOOL */}
      <div className="mt-6 border rounded-xl p-4 shadow-sm">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Type or paste your text here..."
          className="w-full h-48 p-3 border rounded-lg focus:outline-none"
        />
        <div className="flex gap-2 mt-2 text-sm">
          <span>{stats.chars} chars</span><span>{stats.words} words</span><span>{stats.lines} lines</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-4">
          <button onClick={() => convert("upper")} className="border p-2 rounded hover:bg-black hover:text-white">UPPER</button>
          <button onClick={() => convert("lower")} className="border p-2 rounded hover:bg-black hover:text-white">lower</button>
          <button onClick={() => convert("title")} className="border p-2 rounded hover:bg-black hover:text-white">Title Case</button>
          <button onClick={() => convert("sentence")} className="border p-2 rounded hover:bg-black hover:text-white">Sentence case</button>
          <button onClick={() => convert("camel")} className="border p-2 rounded hover:bg-black hover:text-white">camelCase</button>
          <button onClick={() => convert("pascal")} className="border p-2 rounded hover:bg-black hover:text-white">PascalCase</button>
          <button onClick={() => convert("snake")} className="border p-2 rounded hover:bg-black hover:text-white">snake_case</button>
          <button onClick={() => convert("kebab")} className="border p-2 rounded hover:bg-black hover:text-white">kebab-case</button>
          <button onClick={() => { navigator.clipboard.writeText(text) }} className="bg-black text-white p-2 rounded">Copy</button>
          <button onClick={() => setText("")} className="border p-2 rounded">Clear</button>
        </div>
      </div>

      {/* SEO CONTENT */}
      <article className="prose max-w-none mt-10">
        <h2>What is Case Converter Tool?</h2>
        <p>A case converter tool helps you quickly transform text case without retyping. Useful for developers, students, content writers.</p>

        <h2>How to Use?</h2>
        <ol>
          <li>Paste your text in box</li>
          <li>Click any case button</li>
          <li>Copy converted text</li>
        </ol>

        {showMore && (
          <div>
            <h2>All Case Types Explained</h2>
            <ul>
              <li><b>UPPERCASE:</b> ALL LETTERS CAPITAL</li>
              <li><b>lowercase:</b> all small</li>
              <li><b>Title Case:</b> Each Word Capital</li>
              <li><b>camelCase:</b> used in JavaScript</li>
              <li><b>PascalCase:</b> used for Class names</li>
              <li><b>snake_case:</b> used in Python</li>
            </ul>
            <h2>Why Use Our Tool?</h2>
            <p>Fast, free, no ads, privacy focused - your text never leaves browser, SEO friendly and mobile responsive.</p>
          </div>
        )}
        <button onClick={() => setShowMore(!showMore)} className="mt-4 text-blue-600 underline">
          {showMore? "Show Less" : "Show More - Detailed Guide"}
        </button>
      </article>

      {/* FAQ */}
      <section className="mt-10">
        <h2 className="text-xl font-bold">FAQ</h2>
        <div className="mt-4 space-y-3">
          {faqs.map((f,i) => (
            <div key={i} className="border p-3 rounded-lg">
              <b>{f.q}</b><p className="text-sm text-gray-600 mt-1">{f.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
