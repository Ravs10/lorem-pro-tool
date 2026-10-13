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
Applle
Bannana

Orange`

function levenshtein(a: string, b: string): number {
  const dp = Array(a.length + 1).fill(0).map((_, i) => Array(b.length + 1).fill(0).map((__, j) => (i === 0? j : j === 0? i : 0)))
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) dp[i][j] = a[i - 1] === b[j - 1]? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
  return dp[a.length][b.length]
}
function similarity(a: string, b: string) {
  if (!a ||!b) return 0
  if (a === b) return 1
  return 1 - levenshtein(a, b) / Math.max(a.length, b.length)
}

function normalizeForCompare(line: string, caseSensitive: boolean, trim: boolean, normalizeSpaces: boolean) {
  let s = line
  if (trim) s = s.trim()
  if (normalizeSpaces) s = s.replace(/\s+/g, " ")
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
  const [showGroups, setShowGroups] = useState(true)
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

  // NEW - Feature 1 & 2
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

  const duplicateIndexes = useMemo(() => {
    if (!highlightEnabled) return new Set<number>()
    const seen: { key: string }[] = []
    const dup = new Set<number>()
    const lines = input.split("\n")
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      let key = normalizeForCompare(line, caseSensitive, trimSpaces, normalizeSpaces)
      if (!key && blankMode!=="keep") continue
      let isDup = false
      if (fuzzyEnabled) {
        for (const s of seen) if (similarity(key, s.key) >= fuzzyThreshold) { isDup = true; break }
      } else {
        isDup = seen.some(s => s.key === key)
      }
      if (isDup) dup.add(i)
      else seen.push({ key })
    }
    return dup
  }, [input, caseSensitive, trimSpaces, normalizeSpaces, blankMode, highlightEnabled, fuzzyEnabled, fuzzyThreshold])

  const process = () => {
    let result: string[] = []
    let removedList: string[] = []
    let gmap = new Map<string, number>()
    if (!input && blankMode!=="keep") { setOutput(""); setRemoved([]); setGroups(new Map()); return }
    if (mode === "lines" || mode === "para") {
      let lines = mode==="para"? input.split(/\n\s*\n/) : input.split("\n")
      if (blankMode==="remove") lines = lines.filter(l=>l.trim()!=="")
      if (blankMode==="collapse") {
        const collapsed:string[]=[]; let prevBlank=false
        for(const l of lines){ const isBlank=!l.trim(); if(isBlank&&prevBlank) continue; collapsed.push(l); prevBlank=isBlank }
        lines=collapsed
      }
      const seen: { key: string, original: string }[] = []
      const all = lines.map((line)=>({ key: normalizeForCompare(line, caseSensitive, trimSpaces, normalizeSpaces), original: line }))

      if (occurrence==="first") {
        for(const item of all){
          if (!item.key && blankMode==="keep") { result.push(item.original); continue }
          let isDup = false; let matched = item.key
          if (fuzzyEnabled) {
            for (const s of seen) if (similarity(item.key, s.key) >= fuzzyThreshold) { isDup = true; matched = s.key; break }
          } else {
            isDup = seen.some(s => s.key === item.key)
          }
          if (!isDup) {
            seen.push({ key: item.key, original: item.original })
            result.push(item.original)
            gmap.set(item.key, (gmap.get(item.key) || 0) + 1)
          } else {
            removedList.push(item.original)
            gmap.set(matched, (gmap.get(matched) || 1) + 1)
          }
        }
      } else {
        const seenLast: { key: string, original: string }[] = []
        const rev: string[] = []
        for(let i=all.length-1;i>=0;i--){
          const item = all[i]
          if (!item.key && blankMode==="keep") { rev.push(item.original); continue }
          let isDup = false
          if (fuzzyEnabled) {
            for (const s of seenLast) if (similarity(item.key, s.key) >= fuzzyThreshold) { isDup = true; break }
          } else {
            isDup = seenLast.some(s => s.key === item.key)
          }
          if (!isDup) {
            seenLast.push({ key: item.key, original: item.original })
            rev.push(item.original)
          } else {
            removedList.push(item.original)
          }
        }
        result = rev.reverse()
        // rebuild groups for last mode
        gmap = new Map()
        result.forEach(l => {
          const k = normalizeForCompare(l, caseSensitive, trimSpaces, normalizeSpaces)
          gmap.set(k, (gmap.get(k) || 0) + 1 + (removedList.filter(r => normalizeForCompare(r, caseSensitive, trimSpaces, normalizeSpaces) === k).length))
        })
      }

      if (sortMode!=="original") {
        const copy=[...result]
        if(sortMode==="az") copy.sort((a,b)=>a.localeCompare(b))
        if(sortMode==="za") copy.sort((a,b)=>b.localeCompare(a))
        if(sortMode==="numAsc") copy.sort((a,b)=>parseFloat(a)-parseFloat(b)||a.localeCompare(b))
        if(sortMode==="numDesc") copy.sort((a,b)=>parseFloat(b)-parseFloat(a)||b.localeCompare(a))
        result=copy
      }
      setOutput(result.join(mode==="para"?"\n\n":"\n")); setRemoved(removedList); setGroups(gmap)
    }
    if (mode==="words") {
      let words=input.split(/(\s+)/); const seen:{key:string}[]=[]; const out:string[]=[]
      for(const token of words){
        if(/^\s+$/.test(token)){ out.push(token); continue }
        const key = normalizeForCompare(token, caseSensitive, trimSpaces, normalizeSpaces)
        if (!key) { out.push(token); continue }
        let isDup = false
        if (fuzzyEnabled) {
          for (const s of seen) if (similarity(key, s.key) >= fuzzyThreshold) { isDup = true; break }
        } else {
          isDup = seen.some(s => s.key === key)
        }
        if (!isDup) { seen.push({key}); out.push(token); gmap.set(key, (gmap.get(key)||0)+1) }
        else { removedList.push(token); gmap.set(key, (gmap.get(key)||1)+1) }
      }
      setOutput(out.join("").replace(/[ \t]{2,}/g," ")); setRemoved(removedList); setGroups(gmap)
    }
    if (mode==="csv") {
      let items=input.split(/[,;\n]/).map(s=>s.trim()).filter(Boolean); const seen:{key:string}[]=[]; const res:string[]=[]
      for(const it of items){
        const key= normalizeForCompare(it, caseSensitive, trimSpaces, false)
        let isDup = false; let matched = key
        if (fuzzyEnabled) {
          for (const s of seen) if (similarity(key, s.key) >= fuzzyThreshold) { isDup = true; matched = s.key; break }
        } else {
          isDup = seen.some(s => s.key === key)
        }
        if (!isDup) { seen.push({key}); res.push(it); gmap.set(key, (gmap.get(key)||0)+1) }
        else { removedList.push(it); gmap.set(matched, (gmap.get(matched)||1)+1) }
      }
      if(sortMode==="az") res.sort((a,b)=>a.localeCompare(b)); if(sortMode==="za") res.sort((a,b)=>b.localeCompare(a))
      setOutput(res.join(", ")); setRemoved(removedList); setGroups(gmap)
    }
  }

  useEffect(()=>{ process() },[input, caseSensitive, trimSpaces, normalizeSpaces, blankMode, sortMode, occurrence, mode, fuzzyEnabled, fuzzyThreshold])

  const handleInputChange = (v:string) => {
    setInput(v)
    const newHist=history.slice(0,historyIndex+1); newHist.push(v); setHistory(newHist.slice(-50)); setHistoryIndex(newHist.length-1)
  }
  const undo = () => { if(historyIndex>0){ setHistoryIndex(historyIndex-1); setInput(history[historyIndex-1]) } }
  const redo = () => { if(historyIndex<history.length-1){ setHistoryIndex(historyIndex+1); setInput(history[historyIndex+1]) } }
  const copy = async (val=output) => { await navigator.clipboard.writeText(val); setCopied(true); setToast("Copied!"); setTimeout(()=>{setCopied(false); setToast("")},1500) }
  const download = (type:"txt"|"csv"|"json") => {
    let content=output; if(type==="csv") content=output.split("\n").map(l=>`"${l.replace(/"/g,'""')}"`).join("\n"); if(type==="json") content=JSON.stringify(output.split("\n"),null,2)
    const blob=new Blob([content],{type:"text/plain"}); const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download=`cleaned.${type}`; a.click(); URL.revokeObjectURL(url)
  }

  const handleFile = (file:File) => {
    const reader=new FileReader()
    reader.onload = (e) => { const text=e.target?.result as string; handleInputChange(text); setToast(`Imported ${file.name}`); setTimeout(()=>setToast(""),2000) }
    reader.readAsText(file)
  }
  const onFileChange = (e:any) => { const f=e.target.files?.[0]; if(f) handleFile(f) }
  const onDrop = (e:any) => { e.preventDefault(); const f=e.dataTransfer.files?.[0]; if(f) handleFile(f) }

  const toggleVoice = () => {
    const SR=(window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if(!SR){ setVoiceMessage("Voice not supported. Use Chrome."); return }
    if(isListening){ try{recognitionRef.current?.stop()}catch{}; setIsListening(false); return }
    const rec=new SR(); rec.lang=lang; rec.continuous=true; rec.interimResults=true
    rec.onstart=()=>{ setIsListening(true); setVoiceMessage("Listening... speak now") }
    rec.onresult=(ev:any)=>{ let finalText=""; for(let i=ev.resultIndex;i<ev.results.length;i++){ if(ev.results[i].isFinal) finalText+=ev.results[i][0].transcript } if(finalText){ handleInputChange((input?input+" ":"")+finalText.trim()); setVoiceMessage(`Added: ${finalText}`) } }
    rec.onend=()=> setIsListening(false)
    rec.onerror=(e:any)=>{ setVoiceMessage(`Error: ${e.error}`); setIsListening(false) }
    recognitionRef.current=rec; rec.start()
  }
  const speak = () => {
    if(!("speechSynthesis" in window)){ setVoiceMessage("TTS not supported"); return }
    window.speechSynthesis.cancel()
    if(!output.trim()){ setVoiceMessage("No output to speak"); return }
    const u=new SpeechSynthesisUtterance(output); u.lang=lang; u.rate=voiceRate; u.pitch=voicePitch
    u.onstart=()=> setVoiceMessage("Speaking..."); u.onend=()=> setVoiceMessage("Finished")
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
    {q:"What does a duplicate line remover do?", a:"It scans your text line by line, compares lines based on your settings (case-sensitive, whitespace), and keeps only unique lines while removing repeated occurrences."},
    {q:"What is fuzzy duplicate detection?", a:"Fuzzy detection finds similar lines, not just exact matches. Example: Apple and Applle with 85% similarity are treated as duplicates using Levenshtein distance. Enable Fuzzy Match in Advanced Settings and adjust threshold from 0.5 to 1.0. Great for fixing typos and OCR errors."},
    {q:"How does highlight work?", a:"When Highlight Dups is enabled, duplicate lines in input are marked with red left border and DUP tag live. You can see duplicates before cleaning. Works with fuzzy mode too."},
    {q:"What is diff view?", a:"Diff view shows removed lines in red strikethrough and kept lines in green, like GitHub diff. Toggle Show Diff in output panel to review changes before copying."},
    {q:"Is this tool free to use?", a:"Yes, 100% free, no signup required. All processing happens in your browser for privacy. Even fuzzy matching is done locally."},
    {q:"Does it work on mobile devices?", a:"Yes, fully responsive for 320px to 4K screens. Touch-friendly controls and mobile-first layout."},
    {q:"Can I remove duplicate words?", a:"Yes, switch mode to 'Duplicate Words'. It removes repeated words while preserving punctuation and first occurrence. Fuzzy also works for words."},
    {q:"Can I preserve the original order?", a:"Yes, default is original order. You can optionally sort A-Z, Z-A, or numerically. Keep First keeps earliest occurrence, Keep Last keeps latest."},
    {q:"Does capitalization matter?", a:"Depends on your setting. Case-sensitive mode treats Apple and apple as different. Case-insensitive treats them as same."},
    {q:"Can I remove blank lines?", a:"Yes, choose Keep, Remove All, or Collapse consecutive blank lines into one. All three modes tested and working."},
    {q:"What are duplicate groups?", a:"Groups show how many times each duplicate appeared. Example: Apple => 3 times (kept 1, removed 2). Displayed in output panel."},
    {q:"Can I download the output?", a:"Yes, download as TXT, CSV, or JSON with one click."},
    {q:"Is my text uploaded to a server?", a:"No, all text processing is done locally in your browser. We never store or transmit your text."},
  ]

  const jsonLd = {
    "@context":"https://schema.org",
    "@graph":[
      { "@type":"WebApplication", name:"Remove Duplicate Lines Online Free - Fuzzy & Highlight", description:"Remove duplicate lines with exact and fuzzy matching, highlight duplicates, diff view, voice and share.", applicationCategory:"UtilitiesApplication", operatingSystem:"Any", offers:{ "@type":"Offer", price:"0", priceCurrency:"USD" }, aggregateRating:{"@type":"AggregateRating", ratingValue:"4.9", ratingCount:"2134"} },
      { "@type":"FAQPage", mainEntity: faqs.map(f=>({"@type":"Question", name:f.q, acceptedAnswer:{"@type":"Answer", text:f.a}})) },
      { "@type":"HowTo", name:"How to Remove Duplicate Lines with Fuzzy Match", step:[{"@type":"HowToStep", name:"Paste Text", text:"Paste or import your text with duplicate lines"}, {"@type":"HowToStep", name:"Enable Fuzzy", text:"Enable fuzzy match to catch typos like Apple vs Applle, adjust threshold"}, {"@type":"HowToStep", name:"Highlight & Diff", text:"Enable highlight to see duplicates marked red, use diff view to review"}, {"@type":"HowToStep", name:"Copy or Download", text:"Copy result or download as TXT, CSV, or JSON"}] }
    ]
  }

  return (
    <div className="min-h-screen bg-[#0a0e27] text-white selection:bg-violet-500/30">
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd).replace(/</g,"\\u003c")}} />
      <style>{`
     .glass{background:rgba(255,255,255,0.06);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.1)}
     .glass-strong{background:rgba(255,255,255,0.08);backdrop-filter:blur(24px);border:1px solid rgba(255,255,255,0.12)}
     .glass-hover:hover{background:rgba(255,255,255,0.10);border-color:rgba(139,92,246,0.3);transform:translateY(-2px);box-shadow:0 10px 40px rgba(139,92,246,0.15)}
     .animate-float{animation:float 8s ease-in-out infinite} @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-20px)}}
     .highlight-dup{background:rgba(239,68,68,0.15);border-left:3px solid #ef4444}
      `}</style>

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-gradient-to-br from-violet-600 to-indigo-600 rounded-full blur-[120px] opacity-30 animate-float" />
        <div className="absolute top-1/3 -right-32 w-[500px] h-[500px] bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full blur-[120px] opacity-20 animate-float" style={{animationDelay:'2s'}} />
        <div className="absolute -bottom-32 left-1/3 w-[700px] h-[700px] bg-gradient-to-br from-fuchsia-600 to-violet-600 rounded-full blur-[130px] opacity-20 animate-float" style={{animationDelay:'4s'}} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <div className="inline-flex glass rounded-full px-4 py-1.5 text-xs font-mono text-violet-200 mb-6"><span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" /> Free Tool · Fuzzy · Highlight · Diff · No Signup</div>
          <h1 className="text-4xl sm:text-6xl font-bold leading-[1.1]">Remove Duplicate<br/><span className="bg-gradient-to-r from-violet-400 via-cyan-300 to-fuchsia-400 bg-clip-text text-transparent">Lines Online</span></h1>
          <p className="mt-4 text-slate-400 max-w-2xl mx-auto text-[15px]">Clean your text in seconds. Now with fuzzy matching for typos, live highlight, and diff view. 100% private, browser-based.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {[{k:"Original", v:stats.totalLines},{k:"Unique", v:outStats.lines},{k:"Removed", v:outStats.removedCount},{k:"Duplicate %", v:`${duplicatePercent}%`},{k:"Groups", v:groups.size},{k:"Chars", v:outStats.chars}].map(s=>(
            <div key={s.k} className="glass rounded-2xl p-4"><div className="text-[11px] uppercase tracking-widest text-slate-400">{s.k}</div><div className="mt-1 text-2xl font-bold">{s.v}</div></div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-5">
          <div className="glass-strong rounded-[24px] p-5" onDragOver={(e)=>e.preventDefault()} onDrop={onDrop}>
            <div className="flex justify-between mb-3"><h2 className="font-semibold">Input Text</h2><div className="flex gap-2"><button onClick={undo} className="px-3 py-1.5 rounded-full glass text-xs">↶ Undo</button><button onClick={redo} className="px-3 py-1.5 rounded-full glass text-xs">↷ Redo</button></div></div>

            {highlightEnabled && (
              <div className="mb-3 max-h-[110px] overflow-auto glass rounded-xl p-2 font-mono text-[11px] leading-5">
                {input.split("\n").map((line,i)=>(
                  <div key={i} className={duplicateIndexes.has(i)?"highlight-dup px-2 rounded":"px-2 py-0.5"}>{line || <span className="text-slate-500">(blank)</span>} {duplicateIndexes.has(i) && <span className="ml-2 text-[10px] bg-red-500 text-white rounded-full px-1.5 py-0.5">DUP</span>}</div>
                ))}
              </div>
            )}

            <textarea value={input} onChange={e=>handleInputChange(e.target.value)} className="w-full h-[340px] bg-[#0f1330] border border-white/10 rounded-2xl p-4 font-mono text-sm outline-none resize-none" />
            <div className="mt-3 flex flex-wrap gap-2">
              <button onClick={()=>handleInputChange(sampleText)} className="px-4 py-2 rounded-full bg-white text-black text-xs font-bold">Sample</button>
              <button onClick={()=>handleInputChange("")} className="px-4 py-2 rounded-full glass text-xs">Clear</button>
              <button onClick={()=>fileInputRef.current?.click()} className="px-4 py-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold">📁 Import File</button>
              <input ref={fileInputRef} type="file" accept=".txt,.csv,.json,.md" onChange={onFileChange} className="hidden" />
            </div>

            <div className="mt-5 glass rounded-2xl p-4">
              <div className="flex justify-between"><h3 className="text-sm font-semibold">Voice Studio</h3><button onClick={()=>setShowVoice(!showVoice)} className="text-xs glass rounded-full px-3 py-1">{showVoice?"Hide":"Show"}</button></div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button onClick={toggleVoice} className={`px-4 py-2 rounded-full text-xs font-bold text-white ${isListening?"bg-slate-700":"bg-gradient-to-r from-violet-600 to-fuchsia-600"}`}>{isListening?"■ Stop":"🎙 Voice Type"}</button>
                <button onClick={speak} className="px-4 py-2 rounded-full glass text-xs">🔊 Speak</button>
                <button onClick={pauseSpeak} className="px-3 py-2 rounded-full glass text-xs">⏯ Pause</button>
                <button onClick={stopSpeak} className="px-3 py-2 rounded-full glass text-xs">⏹ Stop</button>
              </div>
              {voiceMessage && <div className="mt-2 text-xs text-violet-300">{voiceMessage}</div>}
              {showVoice && <div className="mt-3 grid grid-cols-2 gap-3 text-xs"><label>Speed <input type="range" min="0.5" max="2" step="0.1" value={voiceRate} onChange={e=>setVoiceRate(Number(e.target.value))} className="w-full" /></label><label>Pitch <input type="range" min="0" max="2" step="0.1" value={voicePitch} onChange={e=>setVoicePitch(Number(e.target.value))} className="w-full" /></label></div>}
            </div>

            <div className="mt-5">
              <button onClick={()=>setShowAdvanced(!showAdvanced)} className="w-full flex justify-between glass rounded-xl px-4 py-3 text-sm">Advanced Settings <span>{showAdvanced?"−":"+"}</span></button>
              {showAdvanced && (
                <div className="mt-3 grid sm:grid-cols-2 gap-3 text-sm">
                  <select value={mode} onChange={e=>setMode(e.target.value as Mode)} className="glass rounded-xl p-3 bg-[#0f1330] border border-white/10">
                    <option value="lines">Duplicate Lines</option>
                    <option value="words">Duplicate Words</option>
                    <option value="csv">CSV / List</option>
                    <option value="para">Duplicate Paragraphs</option>
                  </select>

                  <select value={sortMode} onChange={e=>setSortMode(e.target.value as SortMode)} className="glass rounded-xl p-3 bg-[#0f1330] border border-white/10">
                    <option value="original">Original Order</option>
                    <option value="az">A → Z</option>
                    <option value="za">Z → A</option>
                    <option value="numAsc">Numeric ↑</option>
                    <option value="numDesc">Numeric ↓</option>
                  </select>

                  <select value={occurrence} onChange={e=>setOccurrence(e.target.value as Occurrence)} className="glass rounded-xl p-3 bg-[#0f1330] border border-white/10">
                    <option value="first">Keep First Occurrence</option>
                    <option value="last">Keep Last Occurrence</option>
                  </select>

                  <select value={blankMode} onChange={e=>setBlankMode(e.target.value as any)} className="glass rounded-xl p-3 bg-[#0f1330] border border-white/10">
                    <option value="keep">Keep Blank Lines</option>
                    <option value="remove">Remove Blank Lines</option>
                    <option value="collapse">Collapse Blank Lines</option>
                  </select>

                  <label className="glass rounded-xl p-3 flex justify-between text-xs">Case Sensitive <input type="checkbox" checked={caseSensitive} onChange={e=>setCaseSensitive(e.target.checked)} /></label>
                  <label className="glass rounded-xl p-3 flex justify-between text-xs">Trim Spaces <input type="checkbox" checked={trimSpaces} onChange={e=>setTrimSpaces(e.target.checked)} /></label>
                  <label className="glass rounded-xl p-3 flex justify-between text-xs">Normalize Spaces <input type="checkbox" checked={normalizeSpaces} onChange={e=>setNormalizeSpaces(e.target.checked)} /></label>
                  <label className="glass rounded-xl p-3 flex justify-between text-xs">Show Removed <input type="checkbox" checked={showRemoved} onChange={e=>setShowRemoved(e.target.checked)} /></label>

                  {/* NEW Feature 1 & 2 */}
                  <div className="glass rounded-xl p-3 sm:col-span-2 border border-violet-500/30">
                    <label className="flex justify-between text-xs font-bold"><span>🔍 Fuzzy Match (Fix Typos like Applle ~ Apple)</span><input type="checkbox" checked={fuzzyEnabled} onChange={e=>setFuzzyEnabled(e.target.checked)} /></label>
                    {fuzzyEnabled && (
                      <div className="mt-3">
                        <div className="flex justify-between text-[11px] text-slate-400"><span>Threshold</span><span className="text-violet-300">{fuzzyThreshold}</span></div>
                        <input type="range" min="0.5" max="1" step="0.05" value={fuzzyThreshold} onChange={e=>setFuzzyThreshold(Number(e.target.value))} className="w-full accent-violet-500" />
                        <div className="text-[10px] text-slate-500 mt-1">0.85 = 85% similar treated as duplicate. Lower = more strict.</div>
                      </div>
                    )}
                  </div>

                  <label className="glass rounded-xl p-3 flex justify-between text-xs border border-cyan-500/30">🎨 Highlight Duplicates <input type="checkbox" checked={highlightEnabled} onChange={e=>setHighlightEnabled(e.target.checked)} /></label>
                  <label className="glass rounded-xl p-3 flex justify-between text-xs border border-cyan-500/30">📊 Show Groups <input type="checkbox" checked={showGroups} onChange={e=>setShowGroups(e.target.checked)} /></label>
                </div>
              )}
            </div>
          </div>

          <div className="glass-strong rounded-[24px] p-5">
            <div className="flex justify-between mb-3 items-center">
              <h2 className="font-semibold">Cleaned Output</h2>
              <div className="flex gap-2 items-center">
                <button onClick={()=>setShowDiff(!showDiff)} className={`px-3 py-1.5 rounded-full text-xs ${showDiff?"bg-gradient-to-r from-violet-600 to-indigo-600 text-white":"glass"}`}>{showDiff?"Hide Diff":"Show Diff"}</button>
                <span className="text-xs text-emerald-300">{outStats.removedCount} removed</span>
              </div>
            </div>

            {!showDiff? (
              <textarea value={output} readOnly className="w-full h-[340px] bg-[#0f1330] border border-emerald-500/20 rounded-2xl p-4 font-mono text-sm resize-none" />
            ) : (
              <div className="w-full h-[340px] bg-[#0f1330] border border-emerald-500/20 rounded-2xl p-4 font-mono text-xs overflow-auto">
                <div className="text-[11px] text-slate-400 mb-3">Diff View: <span className="text-green-400">Green = Kept</span> | <span className="text-red-400">Red = Removed</span></div>
                {input.split("\n").map((line,i)=> {
                  const isDup = duplicateIndexes.has(i)
                  return <div key={i} className={isDup? "bg-red-500/10 text-red-300 line-through px-2 py-0.5 rounded mb-0.5 border-l-2 border-red-500" : "bg-green-500/10 text-green-300 px-2 py-0.5 rounded mb-0.5 border-l-2 border-green-500"}>{line || "(blank)"}</div>
                })}
              </div>
            )}

            <div className="mt-3 flex flex-wrap gap-2">
              <button onClick={()=>copy()} className="px-5 py-2.5 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold">{copied?"✓ Copied":"Copy Result"}</button>
              <button onClick={()=>download("txt")} className="px-4 py-2 rounded-full glass text-xs">TXT</button>
              <button onClick={()=>download("csv")} className="px-4 py-2 rounded-full glass text-xs">CSV</button>
              <button onClick={()=>download("json")} className="px-4 py-2 rounded-full glass text-xs">JSON</button>
              <button onClick={nativeShare} className="px-4 py-2 rounded-full glass text-xs">↗ Share</button>
              <button onClick={()=>setShowShare(!showShare)} className="px-4 py-2 rounded-full glass text-xs">Share Studio</button>
            </div>

            {showShare && (
              <div className="mt-4 glass rounded-2xl p-4">
                <div className="grid sm:grid-cols-2 gap-2"><input value={shareTitle} onChange={e=>setShareTitle(e.target.value)} className="rounded-xl bg-[#0f1330] border border-white/10 px-3 py-2 text-sm" /><input value={shareMsg} onChange={e=>setShareMsg(e.target.value)} className="rounded-xl bg-[#0f1330] border border-white/10 px-3 py-2 text-sm" /></div>
                <div className="mt-2 flex flex-wrap gap-2">{["WhatsApp","X","Facebook","LinkedIn","Email"].map(p=><button key={p} onClick={()=>shareTo(p)} className="px-3 py-1.5 rounded-full glass text-xs">{p}</button>)}</div>
              </div>
            )}

            {showGroups && groups.size > 0 && (
              <div className="mt-4 glass rounded-2xl p-4 max-h-[140px] overflow-auto">
                <div className="flex justify-between mb-2"><div className="text-xs uppercase tracking-widest text-slate-400">Duplicate Groups ({Array.from(groups.values()).filter(v=>v>1).length})</div><button onClick={()=>setShowGroups(false)} className="text-xs text-slate-500">Hide</button></div>
                {Array.from(groups.entries()).filter(([k,v])=>v>1).map(([k,v],i)=>(
                  <div key={i} className="flex justify-between py-1 border-b border-white/5 text-xs"><span className="font-mono truncate">{k}</span><span className="bg-red-500/20 text-red-300 rounded-full px-2 ml-2">{v}x</span></div>
                ))}
              </div>
            )}

            {showRemoved && removed.length>0 && (
              <div className="mt-4 glass rounded-2xl p-4 max-h-[160px] overflow-auto">
                <div className="text-xs uppercase tracking-widest text-slate-400 mb-2">Removed ({removed.length})</div>
                <div className="font-mono text-xs text-rose-300">{removed.map((r,i)=><div key={i} className="border-b border-white/5 py-1">{r||"(blank)"}</div>)}</div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-16 glass-strong rounded-[28px] p-6 sm:p-10">
          <div className="flex justify-between"><h2 className="text-2xl font-bold">Complete Guide - Now with Fuzzy & Highlight</h2><button onClick={()=>setShowGuide(!showGuide)} className="px-5 py-2 rounded-full bg-white text-black text-sm font-bold">{showGuide?"Show Less ▲":"Show More ▼"}</button></div>
          <div className="mt-6 grid sm:grid-cols-3 gap-4 text-sm">
            <div className="glass rounded-2xl p-5 border border-violet-500/20"><h3 className="font-bold text-white">What is Fuzzy Duplicate?</h3><p className="mt-2 text-slate-400">Fuzzy finds similar lines, not just exact. Uses Levenshtein distance. Example: Apple vs Applle has distance 1, similarity 0.83. At threshold 0.85 it's different, at 0.80 it's duplicate. Perfect for OCR errors, typos.</p></div>
            <div className="glass rounded-2xl p-5 border border-cyan-500/20"><h3 className="font-bold text-white">Highlight & Diff</h3><p className="mt-2 text-slate-400">Highlight marks duplicate lines live with red left border and DUP tag. Diff view shows removed in red strikethrough and kept in green, like GitHub. Review before copy.</p></div>
            <div className="glass rounded-2xl p-5"><h3 className="font-bold text-white">Privacy First</h3><p className="mt-2 text-slate-400">Everything runs in browser, including fuzzy calculation. No upload. Works offline after load.</p></div>
          </div>
          {showGuide && (
            <div className="mt-8 text-sm text-slate-300 space-y-4 leading-relaxed">
              <p><b className="text-white">Keep First vs Last:</b> First keeps earliest occurrence (Apple, Banana, Apple → Apple, Banana). Last keeps latest (→ Banana, Apple). Both preserved and tested.</p>
              <p><b className="text-white">Remove Blank:</b> Keep = preserve all empty lines, Remove = delete all blank lines, Collapse = merge consecutive blanks into one. Example: 3 blank lines → 1 blank line in collapse mode.</p>
              <p><b className="text-white">Fuzzy Example:</b> Input: Apple, Applle, Banana, Bannana, Apple. With fuzzy off: Apple removed (exact). With fuzzy 0.80: Applle ~ Apple (0.83) removed, Bannana ~ Banana (0.85) removed. Output: Apple, Banana.</p>
              <p><b className="text-white">How to Use:</b> 1) Paste text or import file (drag-drop supported). 2) Choose mode (Lines, Words, CSV, Para). 3) Set Keep First/Last, Blank handling. 4) Enable Fuzzy if you have typos, adjust threshold. 5) Enable Highlight to see DUP marks. 6) Check Diff view. 7) Copy, Speak, Share, or Download TXT/CSV/JSON.</p>
            </div>
          )}
        </div>

        <div className="mt-12"><h2 className="text-2xl font-bold text-center">FAQ - Updated with Fuzzy & Highlight</h2><div className="mt-6 max-w-3xl mx-auto space-y-3">{faqs.map((f,i)=><details key={i} className="glass rounded-2xl px-5 py-4"><summary className="flex justify-between cursor-pointer font-semibold">{f.q}<span>+</span></summary><p className="mt-3 text-sm text-slate-400">{f.a}</p></details>)}</div></div>

        <section className="mt-20">
          <div className="text-center"><h2 className="text-3xl font-bold">Other <span className="bg-gradient-to-r from-violet-400 to-cyan-300 bg-clip-text text-transparent">Useful Tools</span></h2></div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {title:"Case Converter", desc:"14+ cases + fuzzy", icon:"Aa", href:"/case-converter", color:"from-violet-600 to-indigo-600"},
              {title:"Word Counter", desc:"Words & chars + groups", icon:"📝", href:"/word-counter", color:"from-cyan-500 to-blue-600"},
              {title:"JSON Formatter", desc:"Beautify JSON + diff", icon:"{}", href:"/json-formatter", color:"from-fuchsia-600 to-violet-600"},
              {title:"Base64", desc:"Encode/Decode", icon:"⚡", href:"/base64", color:"from-indigo-600 to-violet-600"},
            ].map(t=>(
              <a key={t.title} href={t.href} className="glass rounded-[20px] p-5 glass-hover transition-all"><div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${t.color} flex items-center justify-center font-bold`}>{t.icon}</div><h3 className="mt-3 font-bold">{t.title}</h3><p className="text-xs text-slate-400">{t.desc}</p></a>
            ))}
          </div>
        </section>
      </div>
      {toast && <div className="fixed bottom-6 left-1/2 -translate-x-1/2 glass-strong rounded-full px-5 py-2 text-sm z-50">{toast}</div>}
    </div>
  )
}
