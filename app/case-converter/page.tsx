"use client"
import { useState, useMemo, useRef, useEffect } from "react"

type CaseType = "upper" | "lower" | "title" | "sentence" | "camel" | "pascal" | "snake" | "kebab" | "constant" | "dot" | "path" | "alternating" | "inverse" | "capitalize"

const CASES: { id: CaseType; label: string; desc: string }[] = [
  { id: "upper", label: "UPPERCASE", desc: "ALL CAPS" },
  { id: "lower", label: "lowercase", desc: "all small" },
  { id: "title", label: "Title Case", desc: "Each Word Capital" },
  { id: "sentence", label: "Sentence case", desc: "First letter capital" },
  { id: "capitalize", label: "Capitalize", desc: "Each Word Capital" },
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

// FIXED CONVERSION LOGIC
function getWords(text: string): string[] {
  return text.match(/[A-Za-z0-9]+/g) || []
}

function convert(text: string, type: CaseType): string {
  if (!text) return ""
  const words = getWords(text)
  if (words.length === 0) return text

  switch (type) {
    case "upper": return text.toUpperCase()
    case "lower": return text.toLowerCase()
    case "title":
      return text.toLowerCase().replace(/\b[a-z]/g, c => c.toUpperCase())
    case "sentence":
      return text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase())
    case "capitalize":
      return text.replace(/\b\w/g, c => c.toUpperCase())
    case "camel":
      return words.map((w,i) => i===0? w.toLowerCase() : w.charAt(0).toUpperCase()+w.slice(1).toLowerCase()).join("")
    case "pascal":
      return words.map(w => w.charAt(0).toUpperCase()+w.slice(1).toLowerCase()).join("")
    case "snake":
      return words.join("_").toLowerCase()
    case "kebab":
      return words.join("-").toLowerCase()
    case "constant":
      return words.join("_").toUpperCase()
    case "dot":
      return words.join(".").toLowerCase()
    case "path":
      return words.join("/").toLowerCase()
    case "alternating": {
      let idx = 0
      return text.split("").map(c => {
        if (/[a-zA-Z]/.test(c)) {
          const res = idx % 2 === 0? c.toLowerCase() : c.toUpperCase()
          idx++
          return res
        }
        return c
      }).join("")
    }
    case "inverse":
      return text.split("").map(c => c === c.toUpperCase()? c.toLowerCase() : c.toUpperCase()).join("")
    default: return text
  }
}

export default function CaseConverterPage() {
  const [text, setText] = useState("Welcome to Advanced Case Converter Tool!")
  const [showMore, setShowMore] = useState(false)
  const [copied, setCopied] = useState(false)
  const [active, setActive] = useState<CaseType | null>(null)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [history, setHistory] = useState<string[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const stats = useMemo(() => ({
    chars: text.length,
    words: text.trim()? text.trim().split(/\s+/).length : 0,
    lines: text? text.split("\n").length : 0,
  }), [text])

  const pushHistory = (old: string) => {
    setHistory(h => [old,...h].slice(0, 20))
  }

  const doConvert = (type: CaseType) => {
    pushHistory(text)
    setText(convert(text, type))
    setActive(type)
  }

  const handleUndo = () => {
    if (history.length === 0) return
    const [prev,...rest] = history
    setText(prev)
    setHistory(rest)
  }

  const handleSpeak = () => {
    if (!text) return
    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      return
    }
    const utter = new SpeechSynthesisUtterance(text)
    utter.onend = () => setIsSpeaking(false)
    utter.onerror = () => setIsSpeaking(false)
    setIsSpeaking(true)
    window.speechSynthesis.speak(utter)
  }

  const handleDownload = () => {
    const blob = new Blob([text], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "converted-text.txt"
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleShare = async () => {
    const shareData = { title: "Converted Text", text: text }
    if (navigator.share && navigator.canShare(shareData)) {
      try { await navigator.share(shareData) } catch {}
    } else {
      await navigator.clipboard.writeText(text)
      alert("Copied to clipboard! You can share now on WhatsApp/Telegram")
    }
  }

  const handleWhatsAppShare = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(url, "_blank")
  }

  const faqs = [
    { q: "What is an advanced case converter?", a: "Transforms text into 14+ formats like UPPERCASE, camelCase, snake_case etc." },
    { q: "Is this tool free and private?", a: "Yes 100% free, all conversion happens in browser." },
    { q: "Why were cases not working before?", a: "Old regex removed symbols incorrectly and skipped letters. Now fixed with getWords() and proper logic." },
  ]

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-white via-red-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-4xl font-black text-center">Advanced <span className="text-red-600">Case Converter</span></h1>
        <p className="text-center text-slate-600 mt-2">Fixed bugs + Voice + Share + Download + Toolbar</p>

        {/* ADVANCED TOOLBAR */}
        <div className="mt-6 flex flex-wrap gap-2 justify-center">
          <button onClick={() => textareaRef.current?.select()} className="border bg-white px-3 py-1.5 rounded-full text-sm">Select All</button>
          <button onClick={handleUndo} className="border bg-white px-3 py-1.5 rounded-full text-sm">Undo ↩️</button>
          <button onClick={handleSpeak} className={`px-3 py-1.5 rounded-full text-sm ${isSpeaking? "bg-red-600 text-white" : "bg-white border"}`}>{isSpeaking? "Stop Voice" : "Speak 🔊"}</button>
          <button onClick={handleDownload} className="bg-slate-900 text-white px-3 py-1.5 rounded-full text-sm">Download TXT</button>
          <button onClick={handleShare} className="bg-red-600 text-white px-3 py-1.5 rounded-full text-sm">Share</button>
          <button onClick={handleWhatsAppShare} className="bg-green-600 text-white px-3 py-1.5 rounded-full text-sm">WhatsApp</button>
        </div>

        {/* TOOL */}
        <div className="mt-6 rounded-[24px] border border-red-100 bg-white/70 p-5 backdrop-blur-xl shadow-xl">
          <div className="flex gap-2 text-xs text-slate-500">
            <span>{stats.chars} chars</span><span>{stats.words} words</span><span>{stats.lines} lines</span>
          </div>
          <textarea ref={textareaRef} value={text} onChange={e=>setText(e.target.value)} className="mt-3 h-48 w-full rounded-2xl border p-4 outline-none" placeholder="Type here..." />

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {CASES.map(c => (
              <button key={c.id} onClick={()=>doConvert(c.id)} className={`rounded-xl border p-3 text-left text-sm ${active===c.id? "bg-red-600 text-white" : "bg-white hover:border-red-300"}`}>
                <div className="text-[10px] opacity-70">{c.desc}</div>
                <div className="font-bold">{c.label}</div>
              </button>
            ))}
          </div>

          <div className="mt-4 flex gap-2">
            <button onClick={async()=>{await navigator.clipboard.writeText(text); setCopied(true); setTimeout(()=>setCopied(false),1000)}} className="bg-black text-white px-5 py-2 rounded-full text-sm">{copied?"Copied!":"Copy"}</button>
            <button onClick={()=>setText("")} className="border bg-white px-5 py-2 rounded-full text-sm">Clear</button>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-10">
          <h2 className="font-bold text-xl">FAQ</h2>
          {faqs.map((f,i)=>(<div key={i} className="border bg-white mt-2 p-3 rounded-xl"><b>{f.q}</b><p className="text-sm text-slate-600">{f.a}</p></div>))}
        </div>
      </div>
    </div>
  )
}
