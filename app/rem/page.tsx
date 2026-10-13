"use client"
import { useEffect, useMemo, useRef, useState } from "react"

type SortMode = "original" | "az" | "za" | "numAsc" | "numDesc"
type Occurrence = "first" | "last"
type Mode = "lines" | "words" | "csv" | "para"

const sampleText = `Apple Banana
Apple Banana
Apple Banana
Orange
  Apple Banana

Orange`

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))
  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) dp[i][j] = a[i-1]===b[j-1]? dp[i-1][j-1] : 1+Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])
  return dp[m][n]
}
function similarity(a: string, b: string) {
  if (!a ||!b) return 0
  if (a === b) return 1
  return 1 - levenshtein(a,b) / Math.max(a.length, b.length)
}
function normalizeForCompare(line: string, caseSensitive: boolean, trim: boolean, normalizeSpaces: boolean) {
  let s = line
  if (trim) s = s.trim()
  if (normalizeSpaces) s = s.replace(/\s+/g, " ") // FIX: multiple spaces/tabs/newlines -> single space
  if (!caseSensitive) s = s.toLowerCase()
  return s
}

export default function RemoveDuplicateProPage() {
  const [input, setInput] = useState(sampleText)
  const [output, setOutput] = useState("")
  const [removed, setRemoved] = useState<string[]>([])
  const [groups, setGroups] = useState<Map<string, number>>(new Map())
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
  const [voiceRate, setVoiceRate] = useState(1)
  const [voicePitch, setVoicePitch] = useState(1)
  const [voiceMessage, setVoiceMessage] = useState("")
  const [lang, setLang] = useState("en-US")
  const recognitionRef = useRef<any>(null)
  const [shareTitle, setShareTitle] = useState("Remove Duplicate Lines Tool")
  const [shareMsg, setShareMsg] = useState("Cleaned text using this free tool:")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [fuzzyEnabled, setFuzzyEnabled] = useState(false)
  const [fuzzyThreshold, setFuzzyThreshold] = useState(0.85)
  const [highlightEnabled, setHighlightEnabled] = useState(true)

  const stats = useMemo(() => {
    const lines = input.split("\n")
    return { totalLines: input?lines.length:0, chars: input.length, words: input.trim()?input.trim().split(/\s+/).length:0 }
  }, [input])
  const outStats = useMemo(() => {
    return { lines: output?output.split("\n").length:0, chars: output.length, words: output.trim()?output.trim().split(/\s+/).length:0, removedCount: removed.length }
  }, [output, removed])
  const duplicatePercent = useMemo(() =>!stats.totalLines?0:Math.round((removed.length/stats.totalLines)*100), [removed, stats])

  const process = () => {
    let result: string[] = []
    let removedList: string[] = []
    let groupMap = new Map<string, number>()
    if (!input && blankMode!=="keep") { setOutput(""); setRemoved([]); setGroups(new Map()); return }

    if (mode === "lines" || mode === "para") {
      let lines = mode==="para"? input.split(/\n\s*\n/) : input.split("\n")
      if (blankMode==="remove") lines = lines.filter(l=>l.trim()!=="")
      if (blankMode==="collapse") {
        const collapsed:string[]=[]; let prevBlank=false
        for(const l of lines){ const isBlank=!l.trim(); if(isBlank&&prevBlank) continue; collapsed.push(l); prevBlank=isBlank }
        lines=collapsed
      }
      const all = lines.map((line, idx) => {
        const isBlank =!line.trim()
        const key = isBlank && blankMode==="keep"? `__blank_${idx}` : normalizeForCompare(line, caseSensitive, trimSpaces, normalizeSpaces)
        return { key, original: line }
      })
      const seen: { key: string }[] = []
      const isDup = (key: string, seenArr: { key: string }[]): {dup:boolean, matchKey:string} => {
        if (key.startsWith("__blank_")) return {dup:false, matchKey:key}
        if (!fuzzyEnabled) {
          const f = seenArr.find(s => s.key === key)
          return {dup:!!f, matchKey: f?.key || key}
        } else {
          for (const s of seenArr) {
            if (s.key.startsWith("__blank_")) continue
            if (similarity(key, s.key) >= fuzzyThreshold) return {dup:true, matchKey:s.key}
          }
          return {dup:false, matchKey:key}
        }
      }
      if (occurrence==="first") {
        for(const item of all){
          if(item.key.startsWith("__blank_")){ result.push(item.original); continue }
          const {dup, matchKey} = isDup(item.key, seen)
          if(!dup){ seen.push({key:item.key}); result.push(item.original); groupMap.set(item.key,1) }
          else { removedList.push(item.original); groupMap.set(matchKey, (groupMap.get(matchKey)||1)+1) }
        }
      } else {
        const seenLast: { key: string }[] = []
        const rev: string[] = []
        for(let i=all.length-1;i>=0;i--){
          const item = all[i]
          if(item.key.startsWith("__blank_")){ rev.push(item.original); continue }
          const {dup} = isDup(item.key, seenLast)
          if(!dup){ seenLast.push({key:item.key}); rev.push(item.original) }
          else removedList.push(item.original)
        }
        result = rev.reverse()
      }
      if (sortMode!=="original") {
        const copy=[...result]
        if(sortMode==="az") copy.sort((a,b)=>a.localeCompare(b))
        if(sortMode==="za") copy.sort((a,b)=>b.localeCompare(a))
        if(sortMode==="numAsc") copy.sort((a,b)=>parseFloat(a)-parseFloat(b)||a.localeCompare(b))
        if(sortMode==="numDesc") copy.sort((a,b)=>parseFloat(b)-parseFloat(a)||b.localeCompare(a))
        result=copy
      }
      setOutput(result.join(mode==="para"?"\n\n":"\n")); setRemoved(removedList); setGroups(groupMap); return
    }

    if (mode==="words") {
      const tokens = input.split(/(\s+)/)
      const seen: { key: string }[] = []
      const out: string[] = []
      for(const token of tokens){
        if(/^\s+$/.test(token)){ out.push(token); continue }
        const key = normalizeForCompare(token, caseSensitive, trimSpaces, normalizeSpaces)
        if (!key) { out.push(token); continue }
        let dup = false; let matchKey = key
        if (fuzzyEnabled) {
          for (const s of seen) if (similarity(key, s.key) >= fuzzyThreshold) { dup=true; matchKey=s.key; break }
        } else dup = seen.some(s=>s.key===key)
        if(!dup){ seen.push({key}); out.push(token); groupMap.set(key,1) }
        else { removedList.push(token); groupMap.set(matchKey, (groupMap.get(matchKey)||1)+1) }
      }
      // FIX: normalizeSpaces now affects output too
      let finalOut = out.join("")
      if (normalizeSpaces) finalOut = finalOut.replace(/[ \t]{2,}/g," ").replace(/\s+\n/g,"\n")
      setOutput(finalOut); setRemoved(removedList); setGroups(groupMap); return
    }

    if (mode==="csv") {
      const items = input.split(/[,;\n]/).map(s=>s.trim()).filter(Boolean)
      const seen: { key: string }[] = []
      const res: string[] = []
      for(const it of items){
        // FIX: use normalizeSpaces param (was hardcoded false before)
        const key = normalizeForCompare(it, caseSensitive, trimSpaces, normalizeSpaces)
        let dup = false; let matchKey = key
        if (fuzzyEnabled) {
          for (const s of seen) if (similarity(key, s.key) >= fuzzyThreshold) { dup=true; matchKey=s.key; break }
        } else dup = seen.some(s=>s.key===key)
        if(!dup){ seen.push({key}); res.push(it); groupMap.set(key,1) }
        else { removedList.push(it); groupMap.set(matchKey, (groupMap.get(matchKey)||1)+1) }
      }
      let finalRes = res
      if(sortMode==="az") finalRes = [...res].sort((a,b)=>a.localeCompare(b))
      if(sortMode==="za") finalRes = [...res].sort((a,b)=>b.localeCompare(a))
      setOutput(finalRes.join(", ")); setRemoved(removedList); setGroups(groupMap); return
    }
  }

  const duplicateIndexes = useMemo(() => {
    if (!highlightEnabled) return new Set<number>()
    const seen: { key: string }[] = []
    const dup = new Set<number>()
    input.split("\n").forEach((line, idx) => {
      if (blankMode==="remove" &&!line.trim()) return
      const key = normalizeForCompare(line, caseSensitive, trimSpaces, normalizeSpaces)
      if (!key && blankMode==="keep") return
      let isDup = false
      if (fuzzyEnabled) {
        for (const s of seen) if (similarity(key, s.key) >= fuzzyThreshold) { isDup=true; break }
      } else isDup = seen.some(s=>s.key===key)
      if (isDup) dup.add(idx)
      else seen.push({key})
    })
    return dup
  }, [input, caseSensitive, trimSpaces, normalizeSpaces, blankMode, highlightEnabled, fuzzyEnabled, fuzzyThreshold])

  useEffect(()=>{ process() },[input, caseSensitive, trimSpaces, normalizeSpaces, blankMode, sortMode, occurrence, mode, fuzzyEnabled, fuzzyThreshold])

  const handleInputChange = (v:string) => { setInput(v); const newHist=history.slice(0,historyIndex+1); newHist.push(v); setHistory(newHist.slice(-50)); setHistoryIndex(newHist.length-1) }
  const undo = () => { if(historyIndex>0){ setHistoryIndex(historyIndex-1); setInput(history[historyIndex-1]) } }
  const redo = () => { if(historyIndex<history.length-1){ setHistoryIndex(historyIndex+1); setInput(history[historyIndex+1]) } }
  const copy = async (val=output) => { await navigator.clipboard.writeText(val); setCopied(true); setToast("Copied!"); setTimeout(()=>{setCopied(false); setToast("")},1500) }
  const download = (type:"txt"|"csv"|"json") => {
    let content=output; if(type==="csv") content=output.split("\n").map(l=>`"${l.replace(/"/g,'""')}"`).join("\n"); if(type==="json") content=JSON.stringify(output.split("\n"),null,2)
    const blob=new Blob([content],{type:"text/plain"}); const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download=`cleaned.${type}`; a.click(); URL.revokeObjectURL(url)
  }
  const handleFile = (file:File) => { const reader=new FileReader(); reader.onload = (e) => { const text=e.target?.result as string; handleInputChange(text); setToast(`Imported ${file.name}`); setTimeout(()=>setToast(""),2000) }; reader.readAsText(file) }
  const onFileChange = (e:any) => { const f=e.target.files?.[0]; if(f) handleFile(f) }
  const onDrop = (e:any) => { e.preventDefault(); const f=e.dataTransfer.files?.[0]; if(f) handleFile(f) }
  const toggleVoice = () => {
    const SR=(window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if(!SR){ setVoiceMessage("Voice not supported. Use Chrome."); return }
    if(isListening){ try{recognitionRef.current?.stop()}catch{}; setIsListening(false); return }
    const rec=new SR(); rec.lang=lang; rec.continuous=true; rec.interimResults=true
    rec.onstart=()=>{ setIsListening(true); setVoiceMessage("Listening... speak now") }
    rec.onresult=(ev:any)=>{ let finalText=""; for(let i=ev.resultIndex;i<ev.results.length;i++){ if(ev.results[i].isFinal) finalText+=ev.results[i][0].transcript } if(finalText){ handleInputChange((input?input+" ":"")+finalText.trim()); setVoiceMessage(`Added: ${finalText}`) } }
    rec.onend=()=> setIsListening(false); recognitionRef.current=rec; rec.start()
  }
  const speak = () => {
    if(!("speechSynthesis" in window)){ setVoiceMessage("TTS not supported"); return }
    window.speechSynthesis.cancel()
    const u=new SpeechSynthesisUtterance(output); u.lang=lang; u.rate=voiceRate; u.pitch=voicePitch
    window.speechSynthesis.speak(u)
  }
  const pauseSpeak = () => { if(window.speechSynthesis.paused){ window.speechSynthesis.resume() } else { window.speechSynthesis.pause() } }
  const stopSpeak = () => { window.speechSynthesis.cancel(); setVoiceMessage("Stopped") }
  const shareUrl = typeof window!=="undefined"? window.location.href : ""
  const fullShareText = `${shareTitle}\n\n${shareMsg}\n\n${output}`
  const shareTo = (platform:string) => {
    const encT=encodeURIComponent(fullShareText); const encU=encodeURIComponent(shareUrl); let url=""
    switch(platform){ case "WhatsApp": url=`https://wa.me/?text=${encT}`; break; case "X": url=`https://twitter.com/intent/tweet?text=${encT}&url=${encU}`; break; case "Facebook": url=`https://www.facebook.com/sharer/sharer.php?u=${encU}`; break; case "LinkedIn": url=`https://www.linkedin.com/sharing/share-offsite/?url=${encU}`; break; case "Email": url=`mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encT}`; break; default: return }
    if(platform==="Email") window.location.href=url; else window.open(url,"_blank")
  }
  const nativeShare = async () => { if(navigator.share){ try{ await navigator.share({title:shareTitle, text:fullShareText, url:shareUrl}) }catch{} } else setShowShare(true) }

  const faqs = [
    {q:"What does normalize spaces do?", a:"Normalize spaces replaces multiple spaces, tabs, and consecutive whitespace inside a line with a single space. Example: 'Apple Banana' and 'Apple Banana' become same and treated as duplicate when enabled. Works with trim: Trim removes start/end spaces, Normalize cleans middle spaces."},
    {q:"What is fuzzy duplicate detection?", a:"Fuzzy finds similar lines using Levenshtein distance. Apple vs Applle 85% similar treated as duplicate."},
    {q:"How does highlight work?", a:"When Highlight enabled, duplicate lines marked with red border and DUP badge live."},
    {q:"Is this tool free?", a:"Yes, 100% free, browser-based, no upload."},
  ]
  const jsonLd = { "@context":"https://schema.org", "@graph":[ { "@type":"WebApplication", name:"Remove Duplicate Lines Online" }, { "@type":"FAQPage", mainEntity: faqs.map(f=>({"@type":"Question", name:f.q, acceptedAnswer:{"@type":"Answer", text:f.a}})) } ] }

  return (
    <div className="min-h-screen bg-[#0a0e27] text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd).replace(/</g,"\\u003c")}} />
      <style>{`.glass{background:rgba(255,255,255,0.06);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.1)}.glass-strong{background:rgba(255,255,255,0.08);backdrop-filter:blur(24px);border:1px solid rgba(255,255,255,0.12)}.highlight-dup{background:rgba(239,68,68,0.18);border-left:3px solid #ef4444}.animate-float{animation:float 8s ease-in-out infinite} @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-20px)}}`}</style>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-gradient-to-br from-violet-600 to-indigo-600 rounded-full blur-[120px] opacity-30 animate-float" />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-6xl font-bold">Remove Duplicate<br/><span className="bg-gradient-to-r from-violet-400 via-cyan-300 to-fuchsia-400 bg-clip-text text-transparent">Lines Online</span></h1>
          <p className="mt-4 text-slate-400 max-w-2xl mx-auto text-[15px]">Normalize spaces now fixed - test with Apple Banana vs Apple Banana</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {[{k:"Original", v:stats.totalLines},{k:"Unique", v:outStats.lines},{k:"Removed", v:outStats.removedCount},{k:"Dup %", v:`${duplicatePercent}%`},{k:"Groups", v:groups.size},{k:"Chars", v:outStats.chars}].map(s=>(
            <div key={s.k} className="glass rounded-2xl p-4"><div className="text-[11px] text-slate-400">{s.k}</div><div className="mt-1 text-2xl font-bold">{s.v}</div></div>
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-5">
          <div className="glass-strong rounded-[24px] p-5" onDragOver={(e)=>e.preventDefault()} onDrop={onDrop}>
            <div className="flex justify-between mb-3"><h2 className="font-semibold">Input</h2><div className="flex gap-2"><button onClick={undo} className="px-3 py-1.5 rounded-full glass text-xs">Undo</button><button onClick={redo} className="px-3 py-1.5 rounded-full glass text-xs">Redo</button></div></div>
            {highlightEnabled && (
              <div className="mb-3 max-h-[110px] overflow-auto glass rounded-xl p-2 font-mono text-[11px]">
                {input.split("\n").map((line,i)=>(
                  <div key={i} className={duplicateIndexes.has(i)?"highlight-dup px-2 rounded":"px-2"}>{line || "(blank)"} {duplicateIndexes.has(i) && <span className="ml-2 text-[9px] bg-red-500 text-white rounded-full px-1.5">DUP</span>}</div>
                ))}
              </div>
            )}
            <textarea value={input} onChange={e=>handleInputChange(e.target.value)} className="w-full h-[340px] bg-[#0f1330] border border-white/10 rounded-2xl p-4 font-mono text-sm" />
            <div className="mt-3 flex flex-wrap gap-2">
              <button onClick={()=>handleInputChange(sampleText)} className="px-4 py-2 rounded-full bg-white text-black text-xs font-bold">Test Normalize</button>
              <button onClick={()=>handleInputChange("")} className="px-4 py-2 rounded-full glass text-xs">Clear</button>
              <button onClick={()=>fileInputRef.current?.click()} className="px-4 py-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold">Import</button>
              <input ref={fileInputRef} type="file" accept=".txt,.csv,.json,.md" onChange={onFileChange} className="hidden" />
            </div>
            <div className="mt-5">
              <button onClick={()=>setShowAdvanced(!showAdvanced)} className="w-full flex justify-between glass rounded-xl px-4 py-3 text-sm">Advanced Settings <span>{showAdvanced?"−":"+"}</span></button>
              {showAdvanced && (
                <div className="mt-3 grid sm:grid-cols-2 gap-3 text-sm">
                  <select value={mode} onChange={e=>setMode(e.target.value as Mode)} className="glass rounded-xl p-3 bg-[#0f1330]"><option value="lines">Lines</option><option value="words">Words</option><option value="csv">CSV</option><option value="para">Para</option></select>
                  <select value={sortMode} onChange={e=>setSortMode(e.target.value as SortMode)} className="glass rounded-xl p-3 bg-[#0f1330]"><option value="original">Original</option><option value="az">A-Z</option><option value="za">Z-A</option></select>
                  <select value={occurrence} onChange={e=>setOccurrence(e.target.value as Occurrence)} className="glass rounded-xl p-3 bg-[#0f1330]"><option value="first">Keep First</option><option value="last">Keep Last</option></select>
                  <select value={blankMode} onChange={e=>setBlankMode(e.target.value as any)} className="glass rounded-xl p-3 bg-[#0f1330]"><option value="keep">Keep Blank</option><option value="remove">Remove Blank</option><option value="collapse">Collapse Blank</option></select>
                  <label className="glass rounded-xl p-3 flex justify-between text-xs">Case Sensitive <input type="checkbox" checked={caseSensitive} onChange={e=>setCaseSensitive(e.target.checked)} /></label>
                  <label className="glass rounded-xl p-3 flex justify-between text-xs">Trim Spaces <input type="checkbox" checked={trimSpaces} onChange={e=>setTrimSpaces(e.target.checked)} /></label>
                  <label className="glass rounded-xl p-3 flex justify-between text-xs border-2 border-green-500/40">Normalize Spaces (FIXED) <input type="checkbox" checked={normalizeSpaces} onChange={e=>setNormalizeSpaces(e.target.checked)} /></label>
                  <label className="glass rounded-xl p-3 flex justify-between text-xs">Highlight <input type="checkbox" checked={highlightEnabled} onChange={e=>setHighlightEnabled(e.target.checked)} /></label>
                  <div className="glass rounded-xl p-3 sm:col-span-2 border border-violet-500/30">
                    <label className="flex justify-between text-xs font-bold"><span>Fuzzy Match</span><input type="checkbox" checked={fuzzyEnabled} onChange={e=>setFuzzyEnabled(e.target.checked)} /></label>
                    {fuzzyEnabled && <input type="range" min="0.5" max="1" step="0.05" value={fuzzyThreshold} onChange={e=>setFuzzyThreshold(Number(e.target.value))} className="w-full accent-violet-500 mt-2" />}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="glass-strong rounded-[24px] p-5">
            <div className="flex justify-between mb-3"><h2 className="font-semibold">Output</h2><button onClick={()=>setShowDiff(!showDiff)} className={`px-3 py-1.5 rounded-full text-xs ${showDiff?"bg-gradient-to-r from-violet-600 to-indigo-600":"glass"}`}>{showDiff?"Hide Diff":"Show Diff"}</button></div>
            {!showDiff? <textarea value={output} readOnly className="w-full h-[340px] bg-[#0f1330] border border-emerald-500/20 rounded-2xl p-4 font-mono text-sm" /> : <div className="w-full h-[340px] bg-[#0f1330] border border-emerald-500/20 rounded-2xl p-4 font-mono text-xs overflow-auto">{input.split("\n").map((line,i)=> <div key={i} className={duplicateIndexes.has(i)?"bg-red-500/10 text-red-300 line-through":"bg-green-500/10 text-green-300"}>{line||"(blank)"}</div>)}</div>}
            <div className="mt-3 flex flex-wrap gap-2"><button onClick={()=>copy()} className="px-5 py-2.5 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold">{copied?"Copied":"Copy"}</button><button onClick={()=>download("txt")} className="px-4 py-2 rounded-full glass text-xs">TXT</button><button onClick={()=>download("json")} className="px-4 py-2 rounded-full glass text-xs">JSON</button></div>
            {showRemoved && removed.length>0 && <div className="mt-4 glass rounded-2xl p-4 max-h-[140px] overflow-auto"><div className="text-xs text-slate-400 mb-2">Removed ({removed.length})</div><div className="font-mono text-xs text-rose-300">{removed.map((r,i)=><div key={i} className="border-b border-white/5 py-1">{r||"(blank)"}</div>)}</div></div>}
          </div>
        </div>
        <div className="mt-12"><h2 className="text-2xl font-bold text-center">FAQ - Normalize Fixed</h2><div className="mt-6 max-w-3xl mx-auto space-y-3">{faqs.map((f,i)=><details key={i} className="glass rounded-2xl px-5 py-4"><summary className="flex justify-between cursor-pointer font-semibold">{f.q}<span>+</span></summary><p className="mt-3 text-sm text-slate-400">{f.a}</p></details>)}</div></div>
      </div>
      {toast && <div className="fixed bottom-6 left-1/2 -translate-x-1/2 glass-strong rounded-full px-5 py-2 text-sm">{toast}</div>}
    </div>
  )
}
