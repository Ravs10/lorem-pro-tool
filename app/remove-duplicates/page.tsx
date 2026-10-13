"use client"
import { useEffect, useMemo, useRef, useState } from "react"

type SortMode = "original" | "az" | "za" | "numAsc" | "numDesc"
type Occurrence = "first" | "last"
type Mode = "lines" | "words" | "csv" | "para"

const sampleText = `Apple
Banana
Apple
Orange
Banana
Mango
apple
  Apple
Banana

Orange`

function normalizeForCompare(line: string, caseSensitive: boolean, trim: boolean, normalizeSpaces: boolean) {
  let s = line
  if (trim) s = s.trim()
  if (normalizeSpaces) s = s.replace(/\s+/g, " ")
  if (!caseSensitive) s = s.toLowerCase()
  return s
}

export default function RemoveDuplicatePage() {
  const [input, setInput] = useState(sampleText)
  const [output, setOutput] = useState("")
  const [removed, setRemoved] = useState<string[]>([])
  const [caseSensitive, setCaseSensitive] = useState(false)
  const [trimSpaces, setTrimSpaces] = useState(true)
  const [normalizeSpaces, setNormalizeSpaces] = useState(false)
  const [blankMode, setBlankMode] = useState<"keep" | "remove" | "collapse">("remove")
  const [sortMode, setSortMode] = useState<SortMode>("original")
  const [occurrence, setOccurrence] = useState<Occurrence>("first")
  const [mode, setMode] = useState<Mode>("lines")
  const [showRemoved, setShowRemoved] = useState(true)
  const [showAdvanced, setShowAdvanced] = useState(true)
  const [copied, setCopied] = useState(false)
  const [toast, setToast] = useState("")
  const [history, setHistory] = useState<string[]>([sampleText])
  const [historyIndex, setHistoryIndex] = useState(0)

  const stats = useMemo(() => {
    const lines = input.split("\n")
    return { totalLines: input?lines.length:0, chars: input.length, words: input.trim()?input.trim().split(/\s+/).length:0 }
  }, [input])

  const outStats = useMemo(() => {
    return { lines: output?output.split("\n").length:0, chars: output.length, words: output.trim()?output.trim().split(/\s+/).length:0, removedCount: removed.length }
  }, [output, removed])

  const duplicatePercent = useMemo(() => {
    if (!stats.totalLines) return 0
    return Math.round((removed.length / stats.totalLines) * 100)
  }, [removed, stats])

  const process = () => {
    let result: string[] = []
    let removedList: string[] = []

    if (mode === "lines" || mode === "para") {
      let lines = mode === "para"? input.split(/\n\s*\n/) : input.split("\n")
      if (blankMode === "remove") lines = lines.filter(l => l.trim()!== "")
      if (blankMode === "collapse") {
        const collapsed: string[] = []
        let prevBlank = false
        for (const l of lines) {
          const isBlank =!l.trim()
          if (isBlank && prevBlank) continue
          collapsed.push(l)
          prevBlank = isBlank
        }
        lines = collapsed
      }
      const seen = new Map<string, number>()
      const all: { key: string, original: string }[] = lines.map((line, idx) => {
        const key = line.trim()==="" && blankMode==="keep"? `__blank_${idx}` : normalizeForCompare(line, caseSensitive, trimSpaces, normalizeSpaces)
        return { key, original: line }
      })

      if (occurrence === "first") {
        for (const item of all) {
          if (item.key.startsWith("__blank_")) { result.push(item.original); continue }
          if (!seen.has(item.key)) { seen.set(item.key,1); result.push(item.original) }
          else removedList.push(item.original)
        }
      } else {
        const seenLast = new Set<string>()
        const rev: string[] = []
        for (let i = all.length-1; i>=0; i--) {
          const item = all[i]
          if (item.key.startsWith("__blank_")) { rev.push(item.original); continue }
          if (!seenLast.has(item.key)) { seenLast.add(item.key); rev.push(item.original) }
          else removedList.push(item.original)
        }
        result = rev.reverse()
      }
      if (sortMode!== "original") {
        const copy = [...result]
        if (sortMode === "az") copy.sort((a,b) => a.localeCompare(b))
        if (sortMode === "za") copy.sort((a,b) => b.localeCompare(a))
        if (sortMode === "numAsc") copy.sort((a,b) => parseFloat(a)-parseFloat(b) || a.localeCompare(b))
        if (sortMode === "numDesc") copy.sort((a,b) => parseFloat(b)-parseFloat(a) || b.localeCompare(a))
        result = copy
      }
      setOutput(result.join(mode==="para"?"\n\n":"\n"))
      setRemoved(removedList)
    }

    if (mode === "words") {
      let words = input.split(/(\s+)/)
      const seen = new Set<string>()
      const out: string[] = []
      for (const token of words) {
        if (/^\s+$/.test(token)) { out.push(token); continue }
        const key = caseSensitive? token : token.toLowerCase()
        const cmpKey = trimSpaces? key.trim() : key
        if (!seen.has(cmpKey) && cmpKey) { seen.add(cmpKey); out.push(token) }
        else if (!cmpKey) out.push(token)
        else removedList.push(token)
      }
      setOutput(out.join("").replace(/[ \t]{2,}/g, " "))
      setRemoved(removedList)
    }

    if (mode === "csv") {
      let items = input.split(/[,;\n]/).map(s => s.trim()).filter(Boolean)
      const seen = new Set<string>()
      const res: string[] = []
      for (const it of items) {
        const key = caseSensitive? it : it.toLowerCase()
        if (!seen.has(key)) { seen.add(key); res.push(it) } else removedList.push(it)
      }
      if (sortMode==="az") res.sort((a,b)=>a.localeCompare(b))
      if (sortMode==="za") res.sort((a,b)=>b.localeCompare(a))
      setOutput(res.join(", "))
      setRemoved(removedList)
    }
  }

  useEffect(() => { process() }, [input, caseSensitive, trimSpaces, normalizeSpaces, blankMode, sortMode, occurrence, mode])

  const handleInputChange = (v: string) => {
    setInput(v)
    const newHist = history.slice(0, historyIndex + 1)
    newHist.push(v)
    setHistory(newHist.slice(-50))
    setHistoryIndex(newHist.length-1)
  }
  const undo = () => { if(historyIndex>0){ setHistoryIndex(historyIndex-1); setInput(history[historyIndex-1]) } }
  const redo = () => { if(historyIndex<history.length-1){ setHistoryIndex(historyIndex+1); setInput(history[historyIndex+1]) } }

  const copy = async () => { await navigator.clipboard.writeText(output); setCopied(true); setTimeout(()=>setCopied(false),1500) }
  const download = (type: "txt"|"csv"|"json") => {
    let content = output
    if (type==="csv") content = output.split("\n").map(l => `"${l.replace(/"/g,'""')}"`).join("\n")
    if (type==="json") content = JSON.stringify(output.split("\n"), null, 2)
    const blob = new Blob([content], {type:"text/plain"}); const url = URL.createObjectURL(blob)
    const a = document.createElement("a"); a.href=url; a.download=`cleaned.${type}`; a.click(); URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-[#0a0e27] text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=JetBrains+Mono:wght@400;600&display=swap');
       .font-display{font-family:'Space Grotesk',sans-serif}
       .font-mono{font-family:'JetBrains Mono',monospace}
       .glass{background:rgba(255,255,255,0.06);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.1)}
       .glass-strong{background:rgba(255,255,255,0.08);backdrop-filter:blur(24px);border:1px solid rgba(255,255,255,0.12)}
       .animate-float{animation:float 8s ease-in-out infinite}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-20px)}}
      `}</style>

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-gradient-to-br from-violet-600 to-indigo-600 rounded-full blur-[120px] opacity-30 animate-float" />
        <div className="absolute top-1/3 -right-32 w-[500px] h-[500px] bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full blur-[120px] opacity-20 animate-float" style={{animationDelay:'2s'}} />
        <div className="absolute -bottom-32 left-1/3 w-[700px] h-[700px] bg-gradient-to-br from-fuchsia-600 to-violet-600 rounded-full blur-[130px] opacity-20 animate-float" style={{animationDelay:'4s'}} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs font-mono text-violet-200 mb-6">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" /> Free Tool · No Signup · Browser-Based
          </div>
          <h1 className="font-display text-4xl sm:text-6xl font-bold leading-[1.1]">Remove Duplicate<br/><span className="bg-gradient-to-r from-violet-400 via-cyan-300 to-fuchsia-400 bg-clip-text text-transparent">Lines Online</span></h1>
          <p className="mt-4 text-slate-400 max-w-2xl mx-auto text-[15px]">Clean your text in seconds. Remove repeated lines, duplicate words, and unwanted entries with a fast, free, privacy-friendly tool.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {[
            {k:"Original Lines", v:stats.totalLines},
            {k:"Unique Lines", v:outStats.lines},
            {k:"Removed", v:outStats.removedCount},
            {k:"Duplicate %", v:`${duplicatePercent}%`},
            {k:"Words Saved", v:stats.words - outStats.words},
            {k:"Chars", v:outStats.chars},
          ].map(s => (
            <div key={s.k} className="glass rounded-2xl p-4"><div className="text-[11px] uppercase tracking-widest text-slate-400 font-mono">{s.k}</div><div className="mt-1 font-display text-2xl font-bold">{s.v}</div></div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-5">
          <div className="glass-strong rounded-[24px] p-5">
            <div className="flex items-center justify-between mb-3"><h2 className="font-display font-semibold">Input Text</h2><div className="flex gap-2"><button onClick={undo} className="px-3 py-1.5 rounded-full glass text-xs">↶ Undo</button><button onClick={redo} className="px-3 py-1.5 rounded-full glass text-xs">↷ Redo</button></div></div>
            <textarea value={input} onChange={e=>handleInputChange(e.target.value)} className="w-full h-[340px] bg-[#0f1330] border border-white/10 rounded-2xl p-4 font-mono text-sm outline-none focus:border-violet-500/50 resize-none" />
            <div className="mt-3 flex flex-wrap gap-2"><button onClick={()=>handleInputChange(sampleText)} className="px-4 py-2 rounded-full bg-white text-black text-xs font-semibold">Sample</button><button onClick={()=>handleInputChange("")} className="px-4 py-2 rounded-full glass text-xs">Clear</button><span className="ml-auto text-[11px] font-mono text-slate-400">{stats.chars} chars • {stats.words} words • {stats.totalLines} lines</span></div>

            <div className="mt-5">
              <button onClick={()=>setShowAdvanced(!showAdvanced)} className="w-full flex justify-between glass rounded-xl px-4 py-3 text-sm font-display">Advanced Settings <span>{showAdvanced?"−":"+"}</span></button>
              {showAdvanced && (
                <div className="mt-3 grid sm:grid-cols-2 gap-3 text-sm">
                  <select value={mode} onChange={e=>setMode(e.target.value as Mode)} className="glass rounded-xl p-3 bg-[#0f1330] border border-white/10"><option value="lines">Duplicate Lines</option><option value="words">Duplicate Words</option><option value="csv">CSV / List</option><option value="para">Duplicate Paragraphs</option></select>
                  <select value={sortMode} onChange={e=>setSortMode(e.target.value as SortMode)} className="glass rounded-xl p-3 bg-[#0f1330] border border-white/10"><option value="original">Original Order</option><option value="az">A → Z</option><option value="za">Z → A</option><option value="numAsc">Numeric ↑</option><option value="numDesc">Numeric ↓</option></select>
                  <label className="glass rounded-xl p-3 flex justify-between">Case Sensitive <input type="checkbox" checked={caseSensitive} onChange={e=>setCaseSensitive(e.target.checked)} /></label>
                  <label className="glass rounded-xl p-3 flex justify-between">Trim Spaces <input type="checkbox" checked={trimSpaces} onChange={e=>setTrimSpaces(e.target.checked)} /></label>
                  <select value={blankMode} onChange={e=>setBlankMode(e.target.value as any)} className="glass rounded-xl p-3 bg-[#0f1330]"><option value="keep">Keep Blank</option><option value="remove">Remove Blank</option><option value="collapse">Collapse Blank</option></select>
                  <select value={occurrence} onChange={e=>setOccurrence(e.target.value as Occurrence)} className="glass rounded-xl p-3 bg-[#0f1330]"><option value="first">Keep First</option><option value="last">Keep Last</option></select>
                </div>
              )}
            </div>
          </div>

          <div className="glass-strong rounded-[24px] p-5 border-violet-500/20">
            <div className="flex justify-between mb-3"><h2 className="font-display font-semibold">Cleaned Output</h2><span className="text-xs font-mono text-emerald-300">{outStats.removedCount} removed</span></div>
            <textarea value={output} readOnly className="w-full h-[340px] bg-[#0f1330] border border-emerald-500/20 rounded-2xl p-4 font-mono text-sm resize-none" />
            <div className="mt-3 flex flex-wrap gap-2">
              <button onClick={copy} className="px-5 py-2.5 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold">{copied?"✓ Copied":"Copy Result"}</button>
              <button onClick={()=>download("txt")} className="px-4 py-2 rounded-full glass text-xs">TXT</button>
              <button onClick={()=>download("csv")} className="px-4 py-2 rounded-full glass text-xs">CSV</button>
              <button onClick={()=>download("json")} className="px-4 py-2 rounded-full glass text-xs">JSON</button>
              <button onClick={()=>{setInput(output)}} className="px-4 py-2 rounded-full glass text-xs">↔ Swap</button>
            </div>
            {removed.length>0 && (
              <div className="mt-5 glass rounded-2xl p-4 max-h-[160px] overflow-auto">
                <div className="text-xs font-mono text-slate-400 mb-2">Removed Lines ({removed.length})</div>
                <div className="font-mono text-xs text-rose-300">{removed.map((r,i)=><div key={i} className="border-b border-white/5 py-1">{r||"(blank)"}</div>)}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
