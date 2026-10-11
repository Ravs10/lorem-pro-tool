"use client"
import { useState, useMemo } from "react"

type CaseType = "upper" | "lower" | "title" | "sentence" | "camel" | "pascal" | "snake" | "kebab" | "constant" | "dot" | "path" | "alternating" | "inverse" | "lowerTitle"

const CASES: { id: CaseType; label: string; example: string }[] = [
  { id: "upper", label: "UPPERCASE", example: "HELLO WORLD" },
  { id: "lower", label: "lowercase", example: "hello world" },
  { id: "title", label: "Title Case", example: "Hello World" },
  { id: "sentence", label: "Sentence case", example: "Hello world" },
  { id: "camel", label: "camelCase", example: "helloWorld" },
  { id: "pascal", label: "PascalCase", example: "HelloWorld" },
  { id: "snake", label: "snake_case", example: "hello_world" },
  { id: "kebab", label: "kebab-case", example: "hello-world" },
  { id: "constant", label: "CONSTANT_CASE", example: "HELLO_WORLD" },
  { id: "dot", label: "dot.case", example: "hello.world" },
  { id: "path", label: "path/case", example: "hello/world" },
  { id: "alternating", label: "aLtErNaTiNg", example: "hElLo WoRlD" },
  { id: "inverse", label: "InVeRsE", example: "hELLO wORLD" },
]

function convertText(text: string, type: CaseType): string {
  if (!text) return ""
  const words = text.trim().split(/[\s._\-\/]+/).filter(Boolean)
  switch (type) {
    case "upper": return text.toUpperCase()
    case "lower": return text.toLowerCase()
    case "title": return text.toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
    case "sentence": return text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase())
    case "camel": return words.map((w,i) => i===0? w.toLowerCase() : w.charAt(0).toUpperCase()+w.slice(1).toLowerCase()).join("")
    case "pascal": return words.map(w => w.charAt(0).toUpperCase()+w.slice(1).toLowerCase()).join("")
    case "snake": return words.join("_").toLowerCase()
    case "kebab": return words.join("-").toLowerCase()
    case "constant": return words.join("_").toUpperCase()
    case "dot": return words.join(".").toLowerCase()
    case "path": return words.join("/").toLowerCase()
    case "alternating": return text.split("").map((c,i) => i%2===0? c.toLowerCase() : c.toUpperCase()).join("")
    case "inverse": return text.split("").map(c => c===c.toUpperCase()? c.toLowerCase() : c.toUpperCase()).join("")
    default: return text
  }
}

export default function CaseConverter() {
  const [input, setInput] = useState("Hello! Try advanced case converter with CaseCraft")
  const [copied, setCopied] = useState<string | null>(null)

  const stats = useMemo(() => ({
    chars: input.length,
    words: input.trim()? input.trim().split(/\s+/).length : 0,
    lines: input? input.split("\n").length : 0
  }), [input])

  const handleCopy = async (txt: string, id: string) => {
    await navigator.clipboard.writeText(txt)
    setCopied(id)
    setTimeout(() => setCopied(null), 1500)
  }

  return (
    <div className="mt-8 rounded-[24px] border border-white/10 bg-white/[0.07] p-4 sm:p-6 backdrop-blur-xl shadow-2xl">
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <label className="text-sm font-semibold text-white">Input Text</label>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type or paste your text here..."
            className="mt-2 h-[200px] w-full resize-none rounded-xl border border-white/10 bg-slate-900/60 p-4 text-sm text-white outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20"
          />
          <div className="mt-2 flex gap-3 text-xs text-slate-400">
            <span>{stats.chars} chars</span>
            <span>{stats.words} words</span>
            <span>{stats.lines} lines</span>
            <button onClick={() => setInput("")} className="ml-auto text-cyan-300 hover:underline">Clear</button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 max-h-[300px] overflow-y-auto pr-1">
          {CASES.map(c => {
            const out = convertText(input, c.id)
            return (
              <div key={c.id} className="group rounded-xl border border-white/10 bg-white/[0.04] p-3 hover:bg-white/[0.08]">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold tracking-wider text-cyan-200">{c.label}</span>
                  <button onClick={() => handleCopy(out, c.id)} className="rounded-md bg-white/10 px-2 py-1 text-[11px] text-white hover:bg-cyan-400 hover:text-black transition">
                    {copied === c.id? "Copied!" : "Copy"}
                  </button>
                </div>
                <div className="mt-2 truncate text-sm text-slate-200">{out || <span className="text-slate-500">{c.example}</span>}</div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button onClick={() => { const t = input; setInput(""); setTimeout(()=>setInput(t.toUpperCase()), 0) }} className="rounded-full bg-white text-black px-4 py-2 text-sm font-semibold">UPPER</button>
        <button onClick={() => setInput(input.toLowerCase())} className="rounded-full border border-white/20 text-white px-4 py-2 text-sm">lower</button>
        <button onClick={() => handleCopy(input, "main")} className="rounded-full bg-cyan-400 text-black px-4 py-2 text-sm font-semibold">{copied==="main"?"Copied!":"Copy Input"}</button>
        <a href={`data:text/plain;charset=utf-8,${encodeURIComponent(input)}`} download="converted.txt" className="rounded-full border border-white/20 text-white px-4 py-2 text-sm">Download.txt</a>
      </div>
    </div>
  )
}
