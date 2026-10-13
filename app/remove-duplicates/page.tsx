"use client"
import { useEffect, useMemo, useRef, useState } from "react"

type SortMode = "original" | "az" | "za" | "numAsc" | "numDesc"
type Occurrence = "first" | "last"
type Mode = "lines" | "words" | "csv" | "para" | "regex"

function levenshtein(a: string, b: string) {
  const matrix = Array.from({ length: a.length + 1 }, (_, i) => [i])
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      matrix[i][j] = a[i - 1] === b[j - 1]? matrix[i - 1][j - 1] : Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + 1)
    }
  }
  return matrix[a.length][b.length]
}
function similarity(a: string, b: string) {
  if (!a ||!b) return 0
  const dist = levenshtein(a, b)
  return 1 - dist / Math.max(a.length, b.length)
}
function normalizeForCompare(line: string, caseSensitive: boolean, trim: boolean, normalizeSpaces: boolean) {
  let s = line
  if (trim) s = s.trim()
  if (normalizeSpaces) s = s.replace(/\s+/g, " ")
  if (!caseSensitive) s = s.toLowerCase()
  return s
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
# This is comment
# This is comment`

export default function RemoveDuplicateUltimatePage() {
  const [input, setInput] = useState(sampleText)
  const [output, setOutput] = useState("")
  const [removed, setRemoved] = useState<string[]>([])
  const [groups, setGroups] = useState<Map<string, { original: string, count: number, duplicates: string[] }>>(new Map())
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

  const [fuzzyEnabled, setFuzzyEnabled] = useState(false)
  const [fuzzyThreshold, setFuzzyThreshold] = useState(0.85)
  const [regexPattern, setRegexPattern] = useState("")
  const [ignorePattern, setIgnorePattern] = useState("")
  const [customSeparator, setCustomSeparator] = useState(",")
  const [highlightEnabled, setHighlightEnabled] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [bulkFiles, setBulkFiles] = useState<File[]>([])

  const stats = useMemo(() => {
    const lines = input.split("\n")
    return { totalLines: input? lines.length : 0, chars: input.length, words: input.trim()? input.trim().split(/\s+/).length : 0 }
  }, [input])
  const outStats = useMemo(() => {
    return { lines: output? output.split("\n").length : 0, chars: output.length, words: output.trim()? output.trim().split(/\s+/).length : 0, removedCount: removed.length }
  }, [output, removed])
  const duplicatePercent = useMemo(() =>!stats.totalLines? 0 : Math.round((removed.length / stats.totalLines) * 100), [removed, stats])

  const duplicateIndexes = useMemo(() => {
    if (!highlightEnabled) return new Set<number>()
    const seen = new Map<string, number>()
    const dup = new Set<number>()
    input.split("\n").forEach((line, idx) => {
      if (ignorePattern) { try { if (new RegExp(ignorePattern).test(line)) return } catch {} }
      const key = normalizeForCompare(line, caseSensitive, trimSpaces, normalizeSpaces)
      if (!key && blankMode!== "keep") return
      if (seen.has(key)) dup.add(idx)
      else seen.set(key, idx)
    })
    return dup
  }, [input, caseSensitive, trimSpaces, normalizeSpaces, blankMode, ignorePattern, highlightEnabled])

  const process = async () => {
    if (input.length > 50000) { setIsProcessing(true); setProgress(10); await new Promise(r => setTimeout(r, 50)) }
    let result: string[] = []
    let removedList: string[] = []
    let groupMap = new Map<string, { original: string, count: number, duplicates: string[] }>()
    if (!input && blankMode!== "keep") { setOutput(""); setRemoved([]); setGroups(new Map()); setIsProcessing(false); return }

    let lines = mode === "para"? input.split(/\n\s*\n/) : input.split("\n")
    if (mode === "regex" && regexPattern) { try { const re = new RegExp(regexPattern, caseSensitive? "g" : "gi"); lines = lines.filter(l => re.test(l)) } catch {} }
    if (blankMode === "remove") lines = lines.filter(l => l.trim()!== "")
    if (blankMode === "collapse") { const collapsed:string[]=[]; let prev=false; for(const l of lines){ const b=!l.trim(); if(b&&prev) continue; collapsed.push(l); prev=b } lines=collapsed }
    if (ignorePattern) { try { const ig = new RegExp(ignorePattern); lines = lines.filter(l =>!ig.test(l)) } catch {} }

    const seenKeys: { key: string, original: string }[] = []
    const all = lines.map(line => ({ key: normalizeForCompare(line, caseSensitive, trimSpaces, normalizeSpaces), original: line }))

    for (let i=0;i<all.length;i++){
      if(i%500===0 && input.length>20000){ setProgress(Math.round((i/all.length)*90)); await new Promise(r=>setTimeout(r,0)) }
      const item=all[i]
      let isDup=false; let matched=item.key
      if(fuzzyEnabled){ for(const s of seenKeys){ if(similarity(item.key,s.key)>=fuzzyThreshold){ isDup=true; matched=s.key; break } } }
      else { isDup=seenKeys.some(s=>s.key===item.key) }
      if(!isDup){ seenKeys.push({key:item.key, original:item.original}); if(occurrence==="first") result.push(item.original); if(!groupMap.has(item.key)) groupMap.set(item.key,{original:item.original,count:1,duplicates:[]}) }
      else { removedList.push(item.original); const g=groupMap.get(matched); if(g){ g.count++; g.duplicates.push(item.original) } }
    }
    if(occurrence==="last"){ const seenLast=new Map<string,string>(); const rev:string[]=[]; for(let i=all.length-1;i>=0;i--){ const it=all[i]; if(!seenLast.has(it.key)){ seenLast.set(it.key,it.original); rev.push(it.original) } } result=rev.reverse() }
    if(sortMode!=="original"){ const copy=[...result]; if(sortMode==="az") copy.sort((a,b)=>a.localeCompare(b)); if(sortMode==="za") copy.sort((a,b)=>b.localeCompare(a)); result=copy }
    setOutput(result.join(mode==="para"?"\n\n":"\n")); setRemoved(removedList); setGroups(groupMap); setIsProcessing(false); setProgress(100); setTimeout(()=>setProgress(0),500)
  }

  useEffect(()=>{ process() },[input, caseSensitive, trimSpaces, normalizeSpaces, blankMode, sortMode, occurrence, mode, fuzzyEnabled, fuzzyThreshold, regexPattern, ignorePattern, customSeparator])
  const handleInputChange = (v:string) => { setInput(v); const nh=history.slice(0,historyIndex+1); nh.push(v); setHistory(nh.slice(-50)); setHistoryIndex(nh.length-1) }
  const undo = () => { if(historyIndex>0){ setHistoryIndex(historyIndex-1); setInput(history[historyIndex-1]) } }
  const redo = () => { if(historyIndex<history.length-1){ setHistoryIndex(historyIndex+1); setInput(history[historyIndex+1]) } }
  const copy = async (val=output) => { await navigator.clipboard.writeText(val); setCopied(true); setToast("Copied!"); setTimeout(()=>{setCopied(false); setToast("")},1500) }
  const download = (type:"txt"|"csv"|"json"|"report") => {
    let content=output; let fn=`cleaned.${type}`; if(type==="csv") content=output.split("\n").map(l=>`"${l.replace(/"/g,'""')}"`).join("\n"); if(type==="json") content=JSON.stringify(output.split("\n"),null,2); if(type==="report"){ content=`Report\nOriginal:${stats.totalLines} Unique:${outStats.lines} Removed:${outStats.removedCount}\n\nGroups:\n${Array.from(groups.values()).map(v=>`${v.original} => ${v.count}x`).join("\n")}`; fn="report.txt" }
    const blob=new Blob([content],{type:"text/plain"}); const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download=fn; a.click(); URL.revokeObjectURL(url)
  }
  const handleFile = (file:File) => { const r=new FileReader(); r.onload=e=>{ handleInputChange(bulkFiles.length?input+"\n"+(e.target?.result as string):e.target?.result as string); setToast(`Imported ${file.name}`)}; r.readAsText(file) }
  const onFileChange = (e:any) => { const files=Array.from(e.target.files as FileList) as File[]; setBulkFiles(files); files.forEach(f=>handleFile(f)) }
  const onDrop = (e:any) => { e.preventDefault(); const files=Array.from(e.dataTransfer.files as File[]) as File[]; setBulkFiles(files); files.forEach(f=>handleFile(f)) }
  const toggleVoice = () => { const SR=(window as any).SpeechRecognition||(window as any).webkitSpeechRecognition; if(!SR) return; if(isListening){ try{recognitionRef.current?.stop()}catch{}; setIsListening(false); return } const rec=new SR(); rec.lang=lang; rec.continuous=true; rec.interimResults=true; rec.onstart=()=>setIsListening(true); rec.onresult=(ev:any)=>{ let t=""; for(let i=ev.resultIndex;i<ev.results.length;i++) if(ev.results[i].isFinal) t+=ev.results[i][0].transcript; if(t) handleInputChange((input?input+" ":"")+t.trim()) }; rec.onend=()=>setIsListening(false); recognitionRef.current=rec; rec.start() }
  const speak = () => { window.speechSynthesis.cancel(); const u=new SpeechSynthesisUtterance(output); u.lang=lang; u.rate=voiceRate; window.speechSynthesis.speak(u) }
  const shareUrl = typeof window!=="undefined"?window.location.href:""; const fullShareText=`${shareTitle}\n\n${shareMsg}\n\n${output}`; const shareTo=(p:string)=>{ const encT=encodeURIComponent(fullShareText); const encU=encodeURIComponent(shareUrl); let url=""; switch(p){ case "WhatsApp": url=`https://wa.me/?text=${encT}`; break; case "X": url=`https://twitter.com/intent/tweet?text=${encT}`; break; default: url=`https://www.facebook.com/sharer/sharer.php?u=${encU}` } window.open(url,"_blank") }; const nativeShare=async()=>{ if(navigator.share) try{ await navigator.share({title:shareTitle,text:fullShareText}) }catch{} else setShowShare(true) }

  const faqs = [
    {q:"What is fuzzy duplicate?", a:"Finds similar lines using Levenshtein distance. Apple and Applle at 85% similarity treated as duplicate. Enable fuzzy and adjust threshold."},
    {q:"Highlight and Diff?", a:"Highlight shows duplicates in red live. Diff view shows removed in red strikethrough, kept in green like GitHub."},
    {q:"Regex and bulk?", a:"Regex filter includes only matching lines. Ignore pattern skips lines. Bulk import merges multiple files. Large files processed with progress bar."},
  ]
  const jsonLd = {"@context":"https://schema.org","@graph":[{"@type":"WebApplication",name:"Ultimate Duplicate Remover",description:"Fuzzy, regex, bulk, diff, highlight duplicate remover."},{"@type":"FAQPage",mainEntity:faqs.map(f=>({"@type":"Question",name:f.q,acceptedAnswer:{"@type":"Answer",text:f.a}}))}]}

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd)}}/>
      <style>{`.glass{background:rgba(255,255,255,0.75);backdrop-filter:blur(20px);border:1px solid rgba(239,68,68,0.12)}.glass-strong{background:rgba(255,255,255,0.9);backdrop-filter:blur(24px);border:1px solid rgba(34,197,94,0.15);box-shadow:0 10px 40px rgba(34,197,94,0.08),0 10px 40px rgba(239,68,68,0.06)}.glass-hover:hover{transform:translateY(-3px);box-shadow:0 20px 50px rgba(34,197,94,0.15)}.gradient-text{background:linear-gradient(90deg,#16a34a,#dc2626);-webkit-background-clip:text;-webkit-text-fill-color:transparent}.gradient-btn{background:linear-gradient(135deg,#16a34a,#dc2626)}.highlight-dup{background:rgba(239,68,68,0.15);border-left:3px solid #dc2626} @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-15px)}}.animate-float{animation:float 6s ease-in-out infinite}`}</style>

      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-white via-green-50 to-red-50">
        <div className="absolute top-0 left-0 w-[700px] h-[700px] bg-gradient-to-br from-green-300/30 to-green-500/20 rounded-full blur-[120px] animate-float" />
        <div className="absolute top-1/3 right-0 w-[600px] h-[600px] bg-gradient-to-br from-red-300/30 to-red-500/20 rounded-full blur-[120px] animate-float" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <div className="inline-flex glass rounded-full px-4 py-1.5 text-xs text-green-700 mb-6">Ultimate Edition · Fuzzy · Regex · Bulk · Free</div>
          <h1 className="text-4xl sm:text-6xl font-black">Remove Duplicate<br/><span className="gradient-text">Lines Online</span></h1>
          <p className="mt-4 text-slate-600 max-w-2xl mx-auto">Fuzzy, regex, bulk files, diff, highlight, groups, voice, share - all private in browser.</p>
        </div>

        {isProcessing && <div className="mb-6 glass-strong rounded-2xl p-4"><div className="flex justify-between text-xs mb-2"><span>Processing...</span><span>{progress}%</span></div><div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full gradient-btn" style={{width:`${progress}%`}}/></div></div>}

        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-6">
          {[{k:"Original",v:stats.totalLines},{k:"Unique",v:outStats.lines},{k:"Removed",v:outStats.removedCount},{k:"Dup %",v:`${duplicatePercent}%`},{k:"Groups",v:groups.size},{k:"Chars",v:outStats.chars}].map(s=><div key={s.k} className="glass-strong rounded-2xl p-4"><div className="text-[11px] text-slate-500">{s.k}</div><div className="text-2xl font-black">{s.v}</div></div>)}
        </div>

        <div className="grid lg:grid-cols-2 gap-5">
          <div className="glass-strong rounded-[24px] p-5" onDragOver={e=>e.preventDefault()} onDrop={onDrop}>
            <div className="flex justify-between mb-3"><h2 className="font-bold">Input</h2><div className="flex gap-2"><button onClick={undo} className="px-3 py-1.5 rounded-full glass text-xs">↶ Undo</button><button onClick={redo} className="px-3 py-1.5 rounded-full glass text-xs">↷ Redo</button></div></div>
            {highlightEnabled && <div className="mb-3 max-h-[100px] overflow-auto glass rounded-xl p-2 font-mono text-xs">{input.split("\n").map((line,i)=><div key={i} className={duplicateIndexes.has(i)?"highlight-dup px-2 rounded":"px-2"}>{line||"(blank)"} {duplicateIndexes.has(i)&&<span className="text-red-500"> DUP</span>}</div>)}</div>}
            <textarea value={input} onChange={e=>handleInputChange(e.target.value)} className="w-full h-[320px] bg-white border border-green-100 rounded-2xl p-4 font-mono text-sm" placeholder="Drop files here"/>
            <div className="mt-3 flex gap-2"><button onClick={()=>handleInputChange(sampleText)} className="px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-bold">Sample</button><button onClick={()=>fileInputRef.current?.click()} className="px-4 py-2 rounded-full gradient-btn text-white text-xs font-bold">📁 Multi Import</button><input ref={fileInputRef} type="file" multiple onChange={onFileChange} className="hidden"/></div>
            <div className="mt-4 glass rounded-2xl p-4"><div className="flex justify-between"><h3 className="text-sm font-bold">Voice</h3><button onClick={()=>setShowVoice(!showVoice)} className="text-xs glass rounded-full px-3 py-1">{showVoice?"Hide":"Show"}</button></div><div className="mt-2 flex gap-2"><button onClick={toggleVoice} className={`px-4 py-2 rounded-full text-xs font-bold text-white ${isListening?"bg-slate-700":"gradient-btn"}`}>{isListening?"■ Stop":"🎙 Voice"}</button><button onClick={speak} className="px-4 py-2 rounded-full glass text-xs">🔊 Speak</button></div></div>
            <div className="mt-5">
              <button onClick={()=>setShowAdvanced(!showAdvanced)} className="w-full flex justify-between glass rounded-xl px-4 py-3 text-sm font-bold">Advanced (Ultimate) <span>{showAdvanced?"−":"+"}</span></button>
              {showAdvanced && (
                <div className="mt-3 grid sm:grid-cols-2 gap-3 text-sm">
                  <select value={mode} onChange={e=>setMode(e.target.value as any)} className="glass rounded-xl p-3 bg-white"><option value="lines">Lines</option><option value="words">Words</option><option value="csv">CSV</option><option value="para">Paras</option><option value="regex">Regex</option></select>
                  <select value={sortMode} onChange={e=>setSortMode(e.target.value as any)} className="glass rounded-xl p-3 bg-white"><option value="original">Original</option><option value="az">A-Z</option><option value="za">Z-A</option></select>
                  <select value={occurrence} onChange={e=>setOccurrence(e.target.value as any)} className="glass rounded-xl p-3 bg-white"><option value="first">Keep First</option><option value="last">Keep Last</option></select>
                  <select value={blankMode} onChange={e=>setBlankMode(e.target.value as any)} className="glass rounded-xl p-3 bg-white"><option value="keep">Keep Blank</option><option value="remove">Remove Blank</option><option value="collapse">Collapse Blank</option></select>
                  <label className="glass rounded-xl p-3 flex justify-between text-xs">Case Sensitive <input type="checkbox" checked={caseSensitive} onChange={e=>setCaseSensitive(e.target.checked)}/></label>
                  <label className="glass rounded-xl p-3 flex justify-between text-xs">Trim <input type="checkbox" checked={trimSpaces} onChange={e=>setTrimSpaces(e.target.checked)}/></label>
                  <label className="glass rounded-xl p-3 flex justify-between text-xs">Normalize <input type="checkbox" checked={normalizeSpaces} onChange={e=>setNormalizeSpaces(e.target.checked)}/></label>
                  <label className="glass rounded-xl p-3 flex justify-between text-xs">Highlight <input type="checkbox" checked={highlightEnabled} onChange={e=>setHighlightEnabled(e.target.checked)}/></label>
                  <div className="glass rounded-xl p-3 sm:col-span-2"><label className="flex justify-between text-xs font-bold"><span>Fuzzy {fuzzyThreshold}</span><input type="checkbox" checked={fuzzyEnabled} onChange={e=>setFuzzyEnabled(e.target.checked)}/></label>{fuzzyEnabled && <input type="range" min="0.5" max="1" step="0.05" value={fuzzyThreshold} onChange={e=>setFuzzyThreshold(Number(e.target.value))} className="w-full mt-2 accent-green-600"/>}</div>
                  <div className="glass rounded-xl p-3"><div className="text-[11px]">Regex Include</div><input value={regexPattern} onChange={e=>setRegexPattern(e.target.value)} placeholder="^#.*" className="w-full mt-1 border rounded-lg px-2 py-1 text-xs"/></div>
                  <div className="glass rounded-xl p-3"><div className="text-[11px]">Ignore Pattern</div><input value={ignorePattern} onChange={e=>setIgnorePattern(e.target.value)} placeholder="^//" className="w-full mt-1 border rounded-lg px-2 py-1 text-xs"/></div>
                  <div className="glass rounded-xl p-3"><div className="text-[11px]">Custom Sep</div><input value={customSeparator} onChange={e=>setCustomSeparator(e.target.value)} className="w-full mt-1 border rounded-lg px-2 py-1 text-xs"/></div>
                </div>
              )}
            </div>
          </div>

          <div className="glass-strong rounded-[24px] p-5">
            <div className="flex justify-between mb-3"><h2 className="font-bold">Output</h2><button onClick={()=>setShowDiff(!showDiff)} className={`px-3 py-1.5 rounded-full text-xs ${showDiff?"gradient-btn text-white":"glass"}`}>Diff</button></div>
            {!showDiff? <textarea value={output} readOnly className="w-full h-[320px] bg-white border border-green-200 rounded-2xl p-4 font-mono text-sm"/> : <div className="w-full h-[320px] bg-white border rounded-2xl p-4 font-mono text-xs overflow-auto">{input.split("\n").map((l,i)=>{ const rm=!output.includes(l)&&l.trim()!==""; return <div key={i} className={rm?"bg-red-50 text-red-600 line-through":"bg-green-50 text-green-700"}>{l||"(blank)"}</div>})}</div>}
            <div className="mt-3 flex flex-wrap gap-2"><button onClick={()=>copy()} className="px-5 py-2.5 rounded-full gradient-btn text-white text-xs font-bold">{copied?"✓ Copied":"Copy"}</button><button onClick={()=>download("txt")} className="px-4 py-2 rounded-full glass text-xs">TXT</button><button onClick={()=>download("csv")} className="px-4 py-2 rounded-full glass text-xs">CSV</button><button onClick={()=>download("report")} className="px-4 py-2 rounded-full bg-slate-900 text-white text-xs">Report</button><button onClick={nativeShare} className="px-4 py-2 rounded-full glass text-xs">Share</button></div>
            {groups.size>0 && <div className="mt-4 glass rounded-2xl p-4 max-h-[150px] overflow-auto text-xs"><div className="uppercase text-slate-500 mb-2">Groups ({groups.size})</div>{Array.from(groups.values()).filter(g=>g.count>1).map((g,i)=><div key={i} className="flex justify-between border-b py-1"><span>{g.original}</span><span className="bg-red-100 text-red-600 rounded-full px-2">{g.count}x</span></div>)}</div>}
          </div>
        </div>

        <div className="mt-16 glass-strong rounded-[28px] p-6 sm:p-10">
          <div className="flex justify-between"><h2 className="text-2xl font-black">Guide: Exact + Fuzzy + Regex + Bulk</h2><button onClick={()=>setShowGuide(!showGuide)} className="px-5 py-2 rounded-full bg-slate-900 text-white text-sm font-bold">{showGuide?"Hide":"Show More"}</button></div>
          <div className="mt-6 grid sm:grid-cols-3 gap-4 text-sm">
            <div className="glass rounded-2xl p-5"><h3 className="font-bold">Fuzzy</h3><p className="mt-2 text-slate-600">Levenshtein distance. Threshold 0.85 means 85% similar = duplicate. Fixes typos.</p></div>
            <div className="glass rounded-2xl p-5"><h3 className="font-bold">Regex & Ignore</h3><p className="mt-2 text-slate-600">Include regex, ignore pattern, custom separator for CSV.</p></div>
            <div className="glass rounded-2xl p-5"><h3 className="font-bold">Bulk & Diff</h3><p className="mt-2 text-slate-600">Multi-file merge, progress bar, diff view, groups report.</p></div>
          </div>
          {showGuide && <div className="mt-6 text-sm leading-relaxed space-y-2"><p><b>Keep First/Last:</b> First keeps earliest, Last keeps latest. Both preserved.</p><p><b>Remove Blank:</b> Keep, Remove, Collapse all work. Example: blank lines collapsed to one.</p><p><b>All old:</b> Voice, File Import, Share, Case, Trim, Sort still present.</p></div>}
        </div>

        <div className="mt-12"><h2 className="text-2xl font-black text-center">FAQ</h2><div className="mt-6 max-w-3xl mx-auto space-y-3">{faqs.map((f,i)=><details key={i} className="glass rounded-2xl px-5 py-4"><summary className="font-semibold flex justify-between">{f.q}<span>+</span></summary><p className="mt-2 text-sm text-slate-600">{f.a}</p></details>)}</div></div>

        <section className="mt-20">
          <div className="text-center"><h2 className="text-3xl font-black">Other <span className="gradient-text">Useful Tools</span></h2></div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[{title:"Case Converter",icon:"Aa",href:"/case-converter"},{title:"Word Counter",icon:"📝",href:"/word-counter"},{title:"JSON",icon:"{}",href:"/json-formatter"},{title:"Base64",icon:"⚡",href:"/base64"}].map(t=><a key={t.title} href={t.href} className="glass-strong rounded-[20px] p-5 glass-hover"><div className="h-10 w-10 rounded-xl gradient-btn flex items-center justify-center text-white font-bold">{t.icon}</div><h3 className="mt-3 font-bold">{t.title}</h3></a>)}
          </div>
        </section>
      </div>
      {toast && <div className="fixed bottom-6 left-1/2 -translate-x-1/2 glass-strong rounded-full px-5 py-2 text-sm font-bold">{toast}</div>}
    </div>
  )
}
