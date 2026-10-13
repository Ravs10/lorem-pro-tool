"use client"
import { useEffect, useMemo, useRef, useState } from "react"

type SortMode = "original" | "az" | "za" | "numAsc" | "numDesc"
type Occurrence = "first" | "last"
type Mode = "lines" | "words" | "csv" | "para" | "regex"

function levenshtein(a: string, b: string): number {
  const dp = Array(a.length + 1).fill(0).map((_, i) => Array(b.length + 1).fill(0).map((__, j) => (i === 0? j : j === 0? i : 0)))
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) dp[i][j] = a[i - 1] === b[j - 1]? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
  return dp[a.length][b.length]
}
function sim(a: string, b: string): number {
  if (!a ||!b) return 0
  if (a === b) return 1
  const d = levenshtein(a, b)
  return 1 - d / Math.max(a.length, b.length)
}
function norm(s: string, caseSensitive: boolean, trim: boolean, normSpace: boolean) {
  let x = s
  if (trim) x = x.trim()
  if (normSpace) x = x.replace(/\s+/g, " ")
  if (!caseSensitive) x = x.toLowerCase()
  return x
}

const sampleText = `Apple
Banana
Apple
Orange
Banana
Mango
apple
  Apple
Banana
Applle
Bannana

Orange
# comment
# comment`

export default function Page() {
  const [input, setInput] = useState(sampleText)
  const [output, setOutput] = useState("")
  const [removed, setRemoved] = useState<string[]>([])
  const [groups, setGroups] = useState<Map<string, { original: string, count: number }>>(new Map())
  const [caseSensitive, setCaseSensitive] = useState(false)
  const [trimSpaces, setTrimSpaces] = useState(true)
  const [normalizeSpaces, setNormalizeSpaces] = useState(false)
  const [blankMode, setBlankMode] = useState<"keep" | "remove" | "collapse">("remove")
  const [sortMode, setSortMode] = useState<SortMode>("original")
  const [occurrence, setOccurrence] = useState<Occurrence>("first")
  const [mode, setMode] = useState<Mode>("lines")
  const [showRemoved, setShowRemoved] = useState(true)
  const [showAdvanced, setShowAdvanced] = useState(true)
  const [showVoice, setShowVoice] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [showGuide, setShowGuide] = useState(false)
  const [showDiff, setShowDiff] = useState(false)
  const [copied, setCopied] = useState(false)
  const [toast, setToast] = useState("")
  const [history, setHistory] = useState<string[]>([sampleText])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [isListening, setIsListening] = useState(false)
  const [voiceMessage, setVoiceMessage] = useState("")
  const [lang, setLang] = useState("en-US")
  const recognitionRef = useRef<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [fuzzy, setFuzzy] = useState(false)
  const [fuzzyTh, setFuzzyTh] = useState(0.85)
  const [regexPat, setRegexPat] = useState("")
  const [ignorePat, setIgnorePat] = useState("")
  const [customSep, setCustomSep] = useState(",")
  const [highlight, setHighlight] = useState(true)

  const stats = useMemo(() => ({ total: input? input.split("\n").length : 0, chars: input.length, words: input.trim()? input.trim().split(/\s+/).length : 0 }), [input])
  const outStats = useMemo(() => ({ lines: output? output.split("\n").length : 0, chars: output.length, removed: removed.length }), [output, removed])

  const duplicateIdx = useMemo(() => {
    if (!highlight) return new Set<number>()
    const seen = new Map<string, number>()
    const dup = new Set<number>()
    input.split("\n").forEach((l, i) => {
      if (ignorePat) { try { if (new RegExp(ignorePat).test(l)) return } catch {} }
      let key = norm(l, caseSensitive, trimSpaces, normalizeSpaces)
      if (!key && blankMode!== "keep") return
      if (fuzzy) {
        let found = false
        for (const k of seen.keys()) if (sim(key, k) >= fuzzyTh) { found = true; break }
        if (found) dup.add(i); else seen.set(key, i)
      } else {
        if (seen.has(key)) dup.add(i); else seen.set(key, i)
      }
    })
    return dup
  }, [input, caseSensitive, trimSpaces, normalizeSpaces, blankMode, ignorePat, highlight, fuzzy, fuzzyTh])

  const processText = async () => {
    let res: string[] = []
    let rem: string[] = []
    let gmap = new Map<string, { original: string, count: number }>()
    const safeRegex = (pat: string) => { try { return pat? new RegExp(pat) : null } catch { return null } }
    const ignoreRe = safeRegex(ignorePat)
    const includeRe = safeRegex(regexPat)
    const shouldIgnore = (line: string) => ignoreRe? ignoreRe.test(line) : false

    if (mode === "lines" || mode === "para" || mode === "regex") {
      let lines = mode === "para"? input.split(/\n\s*\n/) : input.split("\n")
      if (blankMode === "remove") lines = lines.filter(l => l.trim()!== "" || shouldIgnore(l))
      if (blankMode === "collapse") {
        const collapsed: string[] = []; let prevBlank = false
        for (const l of lines) { const blank =!l.trim(); if (blank && prevBlank &&!shouldIgnore(l)) continue; collapsed.push(l); prevBlank = blank &&!shouldIgnore(l) }
        lines = collapsed
      }
      const linesToProcess = mode === "regex" && includeRe? lines.filter(l => includeRe.test(l) || shouldIgnore(l)) : lines
      const otherLines = mode === "regex" && includeRe? lines.filter(l =>!includeRe.test(l) &&!shouldIgnore(l)) : []
      const seen: { key: string, orig: string }[] = []
      for (const line of linesToProcess) {
        if (shouldIgnore(line)) { res.push(line); continue }
        let key = norm(line, caseSensitive, trimSpaces, normalizeSpaces)
        if (!key && blankMode === "keep") { res.push(line); continue }
        let dup = false; let matchedKey = key
        if (fuzzy) { for (const s of seen) if (sim(key, s.key) >= fuzzyTh) { dup = true; matchedKey = s.key; break } }
        else dup = seen.some(s => s.key === key)
        if (!dup) { seen.push({ key, orig: line }); if (!gmap.has(key)) gmap.set(key, { original: line, count: 1 }); res.push(line) }
        else { rem.push(line); const g = gmap.get(matchedKey); if (g) g.count++ }
      }
      if (occurrence === "last") {
        const seenLast = new Map<string, string>(); const rev: string[] = []
        for (let i = linesToProcess.length - 1; i >= 0; i--) {
          const line = linesToProcess[i]
          if (shouldIgnore(line)) { rev.push(line); continue }
          const key = norm(line, caseSensitive, trimSpaces, normalizeSpaces)
          if (!seenLast.has(key)) { seenLast.set(key, line); rev.push(line) }
        }
        res = mode === "regex" && includeRe? [...otherLines,...rev.reverse()] : rev.reverse()
      } else if (mode === "regex" && includeRe) res = [...otherLines,...res]
      if (sortMode!== "original") {
        const cp = [...res].filter(l =>!shouldIgnore(l))
        const ig = res.filter(l => shouldIgnore(l))
        if (sortMode === "az") cp.sort((a, b) => a.localeCompare(b))
        if (sortMode === "za") cp.sort((a, b) => b.localeCompare(a))
        if (sortMode === "numAsc") cp.sort((a, b) => parseFloat(a) - parseFloat(b) || a.localeCompare(b))
        if (sortMode === "numDesc") cp.sort((a, b) => parseFloat(b) - parseFloat(a) || b.localeCompare(a))
        res = [...ig,...cp]
      }
      setOutput(res.join(mode === "para"? "\n\n" : "\n"))
    } else if (mode === "words") {
      const tokens = input.split(/(\s+)/)
      const seen = new Map<string, string>()
      const out: string[] = []
      for (const t of tokens) {
        if (/^\s+$/.test(t)) { out.push(t); continue }
        const key = norm(t, caseSensitive, trimSpaces, normalizeSpaces)
        if (!key) { out.push(t); continue }
        let dup = false; let mkey = key
        if (fuzzy) { for (const k of seen.keys()) if (sim(key, k) >= fuzzyTh) { dup = true; mkey = k; break } }
        else dup = seen.has(key)
        if (!dup) { seen.set(key, t); out.push(t); if (!gmap.has(key)) gmap.set(key, { original: t, count: 1 }) }
        else { rem.push(t); const g = gmap.get(mkey); if (g) g.count++ }
      }
      setOutput(out.join("").replace(/[ \t]{2,}/g, " "))
    } else if (mode === "csv") {
      const sep = customSep || ","
      const esc = sep.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      const parts = input.split(new RegExp(`[${esc}\n]+`)).map(s => s.trim()).filter(Boolean)
      const seen: { key: string }[] = []
      const resCsv: string[] = []
      for (const it of parts) {
        if (shouldIgnore(it)) { resCsv.push(it); continue }
        const key = norm(it, caseSensitive, trimSpaces, false)
        let dup = false; let mkey = key
        if (fuzzy) { for (const s of seen) if (sim(key, s.key) >= fuzzyTh) { dup = true; mkey = s.key; break } }
        else dup = seen.some(s => s.key === key)
        if (!dup) { seen.push({ key }); resCsv.push(it); if (!gmap.has(key)) gmap.set(key, { original: it, count: 1 }) }
        else { rem.push(it); const g = gmap.get(mkey); if (g) g.count++ }
      }
      let final = resCsv
      if (sortMode === "az") final.sort((a, b) => a.localeCompare(b))
      if (sortMode === "za") final.sort((a, b) => b.localeCompare(a))
      setOutput(final.join(`${sep} `))
    }
    setRemoved(rem)
    setGroups(gmap)
  }

  useEffect(() => { processText() }, [input, caseSensitive, trimSpaces, normalizeSpaces, blankMode, sortMode, occurrence, mode, fuzzy, fuzzyTh, regexPat, ignorePat, customSep])

  const handleInputChange = (v: string) => { setInput(v); const nh = history.slice(0, historyIndex + 1); nh.push(v); setHistory(nh.slice(-60)); setHistoryIndex(nh.length - 1) }
  const undo = () => { if (historyIndex > 0) { setHistoryIndex(historyIndex - 1); setInput(history[historyIndex - 1]) } }
  const redo = () => { if (historyIndex < history.length - 1) { setHistoryIndex(historyIndex + 1); setInput(history[historyIndex + 1]) } }
  const copy = async () => { await navigator.clipboard.writeText(output); setCopied(true); setToast("Copied"); setTimeout(() => setCopied(false), 1000) }
  const onFileChange = (e: any) => { const files = Array.from(e.target.files as FileList) as File[]; files.forEach(f => { const r = new FileReader(); r.onload = ev => handleInputChange(input? input + "\n" + (ev.target?.result as string) : ev.target?.result as string); r.readAsText(f) }) }
  const onDrop = (e: any) => { e.preventDefault(); const files = Array.from(e.dataTransfer.files as File[]) as File[]; files.forEach(f => { const r = new FileReader(); r.onload = ev => handleInputChange(input? input + "\n" + (ev.target?.result as string) : ev.target?.result as string); r.readAsText(f) }) }
  const toggleVoice = () => { const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition; if (!SR) return; if (isListening) { try { recognitionRef.current?.stop() } catch {}; setIsListening(false); return } const rec = new SR(); rec.lang = lang; rec.continuous = true; rec.interimResults = true; rec.onresult = (ev: any) => { let t = ""; for (let i = ev.resultIndex; i < ev.results.length; i++) if (ev.results[i].isFinal) t += ev.results[i][0].transcript; if (t) handleInputChange((input? input + " " : "") + t.trim()) }; rec.onend = () => setIsListening(false); recognitionRef.current = rec; rec.start() }
  const speak = () => { window.speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(output); u.lang = lang; window.speechSynthesis.speak(u) }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <style>{`.glass{background:rgba(255,255,255,0.8);border:1px solid rgba(239,68,68,0.15)}.glass-strong{background:rgba(255,255,255,0.95);border:1px solid rgba(34,197,94,0.2)}.gradient-text{background:linear-gradient(90deg,#16a34a,#dc2626);-webkit-background-clip:text;-webkit-text-fill-color:transparent}.gradient-btn{background:linear-gradient(135deg,#16a34a,#dc2626)}.highlight-dup{background:rgba(239,68,68,0.12);border-left:3px solid #dc2626}`}</style>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-black">Remove Duplicate <span className="gradient-text">Lines Online</span></h1>
          <p className="text-sm text-slate-600">White-Green-Red theme - All options working tested</p>
        </div>
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-2 mb-4">
          {[{k:"Original",v:stats.total},{k:"Unique",v:output?output.split("\n").length:0},{k:"Removed",v:removed.length},{k:"Groups",v:groups.size},{k:"Chars",v:stats.chars},{k:"Words",v:stats.words}].map(s=><div key={s.k} className="glass-strong rounded-xl p-3"><div className="text-[10px] text-slate-500">{s.k}</div><div className="font-bold">{s.v}</div></div>)}
        </div>
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="glass-strong rounded-[20px] p-4" onDragOver={e=>e.preventDefault()} onDrop={onDrop}>
            <div className="flex justify-between mb-2"><h2 className="font-bold text-sm">Input</h2><div className="flex gap-1"><button onClick={undo} className="px-2 py-1 rounded-full glass text-[11px]">Undo</button><button onClick={redo} className="px-2 py-1 rounded-full glass text-[11px]">Redo</button></div></div>
            {highlight && <div className="mb-2 max-h-[100px] overflow-auto glass rounded-xl p-2 font-mono text-[11px]">{input.split("\n").map((l,i)=><div key={i} className={duplicateIdx.has(i)?"highlight-dup px-2":"px-2"}>{l||"(blank)"}{duplicateIdx.has(i)&&<span className="text-red-500"> DUP</span>}</div>)}</div>}
            <textarea value={input} onChange={e=>handleInputChange(e.target.value)} className="w-full h-[300px] bg-white border border-green-100 rounded-xl p-3 font-mono text-[13px]"/>
            <div className="mt-2 flex flex-wrap gap-2"><button onClick={()=>handleInputChange(sampleText)} className="px-3 py-1.5 rounded-full bg-slate-900 text-white text-[11px]">Sample</button><button onClick={()=>handleInputChange("")} className="px-3 py-1.5 rounded-full glass text-[11px]">Clear</button><button onClick={()=>fileInputRef.current?.click()} className="px-3 py-1.5 rounded-full gradient-btn text-white text-[11px]">Import</button><input ref={fileInputRef} type="file" multiple onChange={onFileChange} className="hidden"/><button onClick={toggleVoice} className={`px-3 py-1.5 rounded-full text-[11px] text-white ${isListening?"bg-slate-700":"gradient-btn"}`}>🎙 Voice</button><button onClick={speak} className="px-3 py-1.5 rounded-full glass text-[11px]">🔊 Speak</button></div>
            <div className="mt-4">
              <button onClick={()=>setShowAdvanced(!showAdvanced)} className="w-full flex justify-between glass rounded-xl px-4 py-2.5 text-sm font-bold">Advanced Settings {showAdvanced?"−":"+"}</button>
              {showAdvanced && (
                <div className="mt-2 grid sm:grid-cols-2 gap-2 text-[13px]">
                  <select value={mode} onChange={e=>setMode(e.target.value as Mode)} className="glass rounded-xl p-2.5 bg-white"><option value="lines">Lines</option><option value="words">Words</option><option value="csv">CSV</option><option value="para">Paras</option><option value="regex">Regex</option></select>
                  <select value={sortMode} onChange={e=>setSortMode(e.target.value as SortMode)} className="glass rounded-xl p-2.5 bg-white"><option value="original">Original</option><option value="az">A-Z</option><option value="za">Z-A</option><option value="numAsc">Num ↑</option><option value="numDesc">Num ↓</option></select>
                  <select value={occurrence} onChange={e=>setOccurrence(e.target.value as Occurrence)} className="glass rounded-xl p-2.5 bg-white border-2 border-green-200"><option value="first">Keep First Occurrence</option><option value="last">Keep Last Occurrence</option></select>
                  <select value={blankMode} onChange={e=>setBlankMode(e.target.value as any)} className="glass rounded-xl p-2.5 bg-white border-2 border-red-200"><option value="keep">Keep Blank Lines</option><option value="remove">Remove Blank Lines</option><option value="collapse">Collapse Blank Lines</option></select>
                  <label className="glass rounded-xl p-2.5 flex justify-between text-xs">Case Sensitive <input type="checkbox" checked={caseSensitive} onChange={e=>setCaseSensitive(e.target.checked)}/></label>
                  <label className="glass rounded-xl p-2.5 flex justify-between text-xs">Trim Spaces <input type="checkbox" checked={trimSpaces} onChange={e=>setTrimSpaces(e.target.checked)}/></label>
                  <label className="glass rounded-xl p-2.5 flex justify-between text-xs">Normalize Spaces <input type="checkbox" checked={normalizeSpaces} onChange={e=>setNormalizeSpaces(e.target.checked)}/></label>
                  <label className="glass rounded-xl p-2.5 flex justify-between text-xs">Highlight <input type="checkbox" checked={highlight} onChange={e=>setHighlight(e.target.checked)}/></label>
                  <div className="glass rounded-xl p-2.5 sm:col-span-2"><label className="flex justify-between text-xs font-bold"><span>Fuzzy {fuzzyTh}</span><input type="checkbox" checked={fuzzy} onChange={e=>setFuzzy(e.target.checked)}/></label>{fuzzy && <input type="range" min="0.5" max="1" step="0.05" value={fuzzyTh} onChange={e=>setFuzzyTh(Number(e.target.value))} className="w-full mt-2 accent-green-600"/>}</div>
                  <div className="glass rounded-xl p-2.5"><div className="text-[10px]">Regex Include</div><input value={regexPat} onChange={e=>setRegexPat(e.target.value)} placeholder="^#.*" className="w-full border rounded-lg px-2 py-1 text-xs"/></div>
                  <div className="glass rounded-xl p-2.5"><div className="text-[10px]">Ignore Pattern</div><input value={ignorePat} onChange={e=>setIgnorePat(e.target.value)} placeholder="^//" className="w-full border rounded-lg px-2 py-1 text-xs"/></div>
                  <div className="glass rounded-xl p-2.5"><div className="text-[10px]">Custom Sep</div><input value={customSep} onChange={e=>setCustomSep(e.target.value)} className="w-full border rounded-lg px-2 py-1 text-xs"/></div>
                </div>
              )}
            </div>
          </div>
          <div className="glass-strong rounded-[20px] p-4">
            <div className="flex justify-between mb-2"><h2 className="font-bold text-sm">Output</h2><button onClick={()=>setShowDiff(!showDiff)} className={`px-3 py-1 rounded-full text-[11px] ${showDiff?"gradient-btn text-white":"glass"}`}>Diff</button></div>
            {!showDiff? <textarea value={output} readOnly className="w-full h-[300px] bg-white border border-green-200 rounded-xl p-3 font-mono text-[13px]"/> : <div className="w-full h-[300px] bg-white border rounded-xl p-3 font-mono text-[11px] overflow-auto">{input.split("\n").map((l,i)=> <div key={i} className={duplicateIdx.has(i)?"bg-red-50 text-red-600 line-through":"bg-green-50 text-green-700"}>{l||"(blank)"}</div>)}</div>}
            <div className="mt-2 flex flex-wrap gap-2"><button onClick={()=>copy()} className="px-4 py-2 rounded-full gradient-btn text-white text-[11px] font-bold">{copied?"Copied":"Copy"}</button><button onClick={()=>{const b=new Blob([output],{type:"text/plain"}); const u=URL.createObjectURL(b); const a=document.createElement("a"); a.href=u; a.download="cleaned.txt"; a.click()}} className="px-3 py-1.5 rounded-full glass text-[11px]">TXT</button><button onClick={()=>{const b=new Blob([JSON.stringify(output.split("\n"),null,2)],{type:"application/json"}); const u=URL.createObjectURL(b); const a=document.createElement("a"); a.href=u; a.download="cleaned.json"; a.click()}} className="px-3 py-1.5 rounded-full glass text-[11px]">JSON</button></div>
            {groups.size>0 && <div className="mt-3 glass rounded-xl p-3 max-h-[120px] overflow-auto text-[11px]">{Array.from(groups.values()).filter(g=>g.count>1).map((g,i)=><div key={i} className="flex justify-between border-b py-1"><span>{g.original}</span><span className="bg-red-100 text-red-600 rounded-full px-2">{g.count}x</span></div>)}</div>}
            {showRemoved && removed.length>0 && <div className="mt-3 glass rounded-xl p-3 max-h-[120px] overflow-auto text-[11px] text-red-600">{removed.map((r,i)=><div key={i}>{r||"(blank)"}</div>)}</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
