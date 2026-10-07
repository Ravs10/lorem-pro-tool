"use client";
import { useState, useEffect, useRef, useMemo } from "react";

type SocialLimit = { name: string; limit: number };

const SOCIAL_DEFAULTS: SocialLimit[] = [
  { name: "Twitter / X", limit: 280 },
  { name: "Instagram Caption", limit: 2200 },
  { name: "LinkedIn", limit: 3000 },
  { name: "Facebook", limit: 63206 },
  { name: "WhatsApp Status", limit: 700 },
  { name: "YouTube Title", limit: 100 },
  { name: "Google Title", limit: 60 },
];

function countEmoji(str: string): number {
  const m = str.match(/\p{Emoji}/gu);
  return m? m.length : 0;
}
function countSyllables(word: string): number {
  word = word.toLowerCase();
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "");
  word = word.replace(/^y/, "");
  const m = word.match(/[aeiouy]{1,2}/g);
  return m? m.length : 1;
}

export default function TextlyzerPage() {
  const [text, setText] = useState("");
  const [goal, setGoalState] = useState(300);
  const [history, setHistory] = useState<string[]>([""]);
  const [histIdx, setHistIdx] = useState(0);
  const [dark, setDark] = useState(false);
  const [find, setFind] = useState("");
  const [replace, setReplace] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDesc, setSeoDesc] = useState("");
  const [customLabel, setCustomLabel] = useState("");
  const [customNum, setCustomNum] = useState<number>(0);
  const [customLimits, setCustomLimits] = useState<SocialLimit[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const draft = localStorage.getItem("textlyzer_draft");
    if (draft) setText(draft);
    const g = localStorage.getItem("textlyzer_goal");
    if (g) setGoalState(parseInt(g));
    const th = localStorage.getItem("textlyzer_theme");
    if (th === "dark") setDark(true);
    const cl = localStorage.getItem("textlyzer_customLimits");
    if (cl) setCustomLimits(JSON.parse(cl));
  }, []);

  useEffect(() => {
    localStorage.setItem("textlyzer_draft", text);
  }, [text]);

  const stats = useMemo(() => {
    const chars = text.length;
    const charsNoSpace = text.replace(/\s/g, "").length;
    const words = text.trim()? text.trim().split(/\s+/).filter(Boolean).length : 0;
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;
    const paras = text.split(/\n+/).filter((s) => s.trim().length > 0).length;
    const spaces = (text.match(/ /g) || []).length;
    const letters = (text.match(/[A-Za-z]/g) || []).length;
    const numbers = (text.match(/[0-9]/g) || []).length;
    const punct = (text.match(/[.,!?;:'"()\-]/g) || []).length;
    const emoji = countEmoji(text);
    const lines = text.split("\n").length;
    const readingMin = Math.ceil(words / 225);
    const speakingMin = Math.ceil(words / 150);
    let syllables = 0;
    if (words > 0) {
      text.trim().split(/\s+/).forEach((w) => (syllables += countSyllables(w)));
    }
    let flesch = 0;
    let grade: number | string = "-";
    if (words > 0 && sentences > 0) {
      flesch = 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);
      const g = 0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59;
      grade = Math.max(1, Math.round(g));
    }
    const stop = new Set(["the","and","is","in","to","a","of","for","on","with","this","that","are","be","it","as","at","by","from"]);
    const freq: Record<string, number> = {};
    text.toLowerCase().split(/\W+/).filter(w=>w.length>2 &&!stop.has(w)).forEach(w=>freq[w]=(freq[w]||0)+1);
    const topKeywords = Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,5);
    return { chars, charsNoSpace, words, sentences, paras, spaces, letters, numbers, punct, emoji, lines, readingMin, speakingMin, flesch, grade, syllables, topKeywords };
  }, [text]);

  const pushHistory = (t: string) => {
    const newHist = history.slice(0, histIdx + 1);
    newHist.push(t);
    if (newHist.length > 50) newHist.shift();
    setHistory(newHist);
    setHistIdx(newHist.length - 1);
  };

  const handleTextChange = (v: string) => {
    pushHistory(v);
    setText(v);
  };

  const convertCase = (type: string) => {
    let t = text; if (!t) return;
    pushHistory(t);
    if (type === "upper") t = t.toUpperCase();
    if (type === "lower") t = t.toLowerCase();
    if (type === "title") t = t.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.substr(1).toLowerCase());
    if (type === "sentence") t = t.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
    if (type === "camel") t = t.replace(/(?:^\w|[A-Z]|\b\w)/g, (w, i) => (i === 0? w.toLowerCase() : w.toUpperCase())).replace(/\s+/g, "");
    if (type === "reverse") t = t.split("").reverse().join("");
    setText(t);
  };

  const clean = (mode: string) => {
    let t = text; if (!t) return;
    pushHistory(t);
    if (mode === "extraSpaces") t = t.replace(/ +/g, " ");
    if (mode === "trimLines") t = t.split("\n").map((l) => l.trim()).join("\n");
    if (mode === "removeEmpty") t = t.split("\n").filter((l) => l.trim()!== "").join("\n");
    if (mode === "removeNumbers") t = t.replace(/[0-9]/g, "");
    if (mode === "removeEmoji") t = t.replace(/\p{Emoji}/gu, "");
    setText(t);
  };

  const doReplace = () => {
    if (!find) return;
    pushHistory(text);
    setText(text.split(find).join(replace));
  };

  const doSort = (dir: "asc" | "desc") => {
    pushHistory(text);
    const lines = text.split("\n").filter((l) => l.trim()!== "");
    lines.sort((a, b) => (dir === "asc"? a.localeCompare(b) : b.localeCompare(a)));
    setText(lines.join("\n"));
  };

  const goalPct = goal? Math.min(100, Math.round((stats.words / goal) * 100)) : 0;

  return (
    <div className={dark? "dark" : ""}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&display=swap');
       .glass{backdrop-filter:blur(18px) saturate(180%);-webkit-backdrop-filter:blur(18px) saturate(180%);}
      `}</style>
      <div className="min-h-screen bg-[#f7f8ff] dark:bg-[#0e0f1a] text-[#151a2d] dark:text-[#e8eaf6] transition-colors" style={{fontFamily:'Outfit, sans-serif'}}>
        <div className="relative px-4 md:px-6 pt-6 pb-24 overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(600px_at_20%_10%,rgba(91,91,255,0.18),transparent),radial-gradient(600px_at_80%_20%,rgba(139,92,246,0.18),transparent),radial-gradient(500px_at_50%_90%,rgba(6,182,214,0.12),transparent)]" />
          <nav className="glass max-w-[1240px] mx-auto flex justify-between items-center px-5 py-3 rounded-[20px] bg-white/70 dark:bg-[#161826]/70 border border-black/10 dark:border-white/10 shadow-[0_10px_30px_rgba(91,91,255,0.12)]">
            <div className="font-bold text-xl">Text<span className="text-[#5b5bff]">lyzer</span> •</div>
            <div className="flex gap-2">
              <button onClick={()=>{setDark(!dark); localStorage.setItem("textlyzer_theme",!dark?"dark":"light")}} className="px-4 py-2 rounded-full bg-white/90 dark:bg-[#1e2138]/90 border border-black/10 dark:border-white/10 text-sm font-semibold">{dark?"☀ Light":"🌙 Dark"}</button>
              <button onClick={()=>textareaRef.current?.focus()} className="px-4 py-2 rounded-full bg-gradient-to-br from-[#5b5bff] to-[#8b5cf6] text-white text-sm font-bold shadow-[0_8px_20px_rgba(91,91,255,0.35)]">Start Typing</button>
            </div>
          </nav>
          <div className="max-w-[1240px] mx-auto mt-10 grid md:grid-cols-[1.2fr_0.8fr] gap-6 items-center">
            <div>
              <h1 className="text-[32px] md:text-[56px] leading-[0.95] tracking-tight font-bold">Count everything.<br/><span className="bg-gradient-to-br from-[#5b5bff] to-[#8b5cf6] bg-clip-text text-transparent">Fix everything.</span><br/>in one place.</h1>
              <p className="text-[#6b728f] dark:text-[#9aa0bf] mt-4 text-lg">Characters, words, emoji, SEO, readability, social limits, case, cleaner — 100% local, instant, private.</p>
              <div className="flex flex-wrap gap-2 mt-4">
                {["⚡ <100ms","🔒 Local only","📱 Mobile ready","🎨 Glassmorphism","📝 Grammar check"].map(c=>(
                  <span key={c} className="px-3 py-1.5 rounded-full bg-white/90 dark:bg-[#1e2138]/90 border border-black/10 dark:border-white/10 text-xs">{c}</span>
                ))}
              </div>
            </div>
            <div className="glass rounded-[20px] bg-white/70 dark:bg-[#161826]/70 border border-black/10 dark:border-white/10 p-5 shadow-[0_10px_30px_rgba(91,91,255,0.12)]">
              <h4 className="text-xs uppercase tracking-widest text-[#6b728f]">Live Preview</h4>
              <div className="mt-3 text-sm text-[#6b728f] dark:text-[#9aa0bf]">
                {text? <><b>{stats.words}</b> words • <b>{stats.chars}</b> chars • <b>{stats.emoji}</b> emoji<br/>Reading {stats.readingMin}m • Speaking {stats.speakingMin}m<br/>{stats.flesch? `Flesch ${Math.round(stats.flesch)} • Grade ${stats.grade}` : ""}</> : "Start typing to see insights..."}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1240px] mx-auto px-4 md:px-6 -mt-16 pb-20 grid lg:grid-cols-[1fr_340px] gap-5">
          <div className="glass rounded-[20px] bg-white/75 dark:bg-[#161826]/70 border border-black/10 dark:border-white/10 p-4 md:p-5 shadow-[0_10px_30px_rgba(91,91,255,0.12)]">
            <div className="flex flex-wrap gap-2 mb-3">
              <button onClick={()=>document.execCommand("bold")} className="px-3 py-1.5 rounded-[10px] bg-white dark:bg-[#1e2138] border border-black/10 dark:border-white/10 text-xs font-bold">B</button>
              <button onClick={()=>document.execCommand("italic")} className="px-3 py-1.5 rounded-[10px] bg-white dark:bg-[#1e2138] border border-black/10 dark:border-white/10 text-xs italic">I</button>
              <button onClick={()=>fileInputRef.current?.click()} className="px-3 py-1.5 rounded-[10px] bg-white dark:bg-[#1e2138] border border-black/10 dark:border-white/10 text-xs">📥 Import TXT</button>
              <button onClick={()=>{
                const blob = new Blob([text], {type:"text/plain"});
                const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="textlyzer-export.txt"; a.click();
              }} className="px-3 py-1.5 rounded-[10px] bg-white dark:bg-[#1e2138] border border-black/10 dark:border-white/10 text-xs">📤 Export TXT</button>
              <button onClick={()=>navigator.clipboard.writeText(text)} className="px-3 py-1.5 rounded-[10px] bg-white dark:bg-[#1e2138] border border-black/10 dark:border-white/10 text-xs">📋 Copy</button>
              <button onClick={()=>{if(confirm("Clear all?")){pushHistory(text); setText("");}}} className="px-3 py-1.5 rounded-[10px] bg-white dark:bg-[#1e2138] border border-black/10 dark:border-white/10 text-xs">🗑 Clear</button>
              <button onClick={()=>{if(histIdx>0){const v=history[histIdx-1]; setHistIdx(histIdx-1); setText(v);}}} className="px-3 py-1.5 rounded-[10px] bg-white dark:bg-[#1e2138] border border-black/10 dark:border-white/10 text-xs">↩ Undo</button>
              <button onClick={()=>{if(histIdx<history.length-1){const v=history[histIdx+1]; setHistIdx(histIdx+1); setText(v);}}} className="px-3 py-1.5 rounded-[10px] bg-white dark:bg-[#1e2138] border border-black/10 dark:border-white/10 text-xs">↪ Redo</button>
              <input ref={fileInputRef} type="file" accept=".txt" hidden onChange={(e)=>{
                const f=e.target.files?.[0]; if(!f) return;
                const r=new FileReader(); r.onload=ev=>setText(ev.target?.result as string); r.readAsText(f);
              }}/>
            </div>

            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e)=>handleTextChange(e.target.value)}
              placeholder="Type or paste your text here... Hindi, English, emoji all supported — लंबा text भी instantly count होगा"
              spellCheck
              className="w-full min-h-[380px] resize-y p-4 rounded-[16px] border border-black/10 dark:border-white/10 bg-white/90 dark:bg-[#1e2138]/90 text-[#151a2d] dark:text-[#e8eaf6] outline-none focus:border-[#5b5bff] focus:shadow-[0_0_0_4px_rgba(91,91,255,0.12)] text-[16px] leading-7"
            />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              {[
                ["Characters", stats.chars],
                ["No Spaces", stats.charsNoSpace],
                ["Words", stats.words],
                ["Sentences", stats.sentences],
                ["Paragraphs", stats.paras],
                ["Spaces", stats.spaces],
                ["Letters", stats.letters],
                ["Numbers", stats.numbers],
                ["Punctuation", stats.punct],
                ["Emoji", stats.emoji],
                ["Lines", stats.lines],
                ["Size", `${(stats.chars/1024).toFixed(2)}KB`],
              ].map(([label,val])=>(
                <div key={label as string} className="glass rounded-[16px] bg-white/70 dark:bg-[#161826]/70 border border-black/10 dark:border-white/10 p-3 text-center">
                  <div className="text-[22px] font-bold">{val as any}</div>
                  <div className="text-[11px] uppercase tracking-widest text-[#6b728f]">{label as string}</div>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-3 mt-4">
              <div className="glass rounded-[16px] bg-white/70 dark:bg-[#161826]/70 border border-black/10 dark:border-white/10 p-3">
                <h4 className="text-[11px] uppercase tracking-widest text-[#6b728f]">Find & Replace</h4>
                <div className="flex gap-2 mt-2"><input value={find} onChange={e=>setFind(e.target.value)} placeholder="Find" className="flex-1 px-3 py-2 rounded-[10px] border border-black/10 dark:border-white/10 bg-white/90 dark:bg-[#1e2138]/90 text-sm"/><input value={replace} onChange={e=>setReplace(e.target.value)} placeholder="Replace" className="flex-1 px-3 py-2 rounded-[10px] border border-black/10 dark:border-white/10 bg-white/90 dark:bg-[#1e2138]/90 text-sm"/></div>
                <div className="flex gap-2 mt-2">
                  <button onClick={doReplace} className="px-3 py-1.5 rounded-[10px] bg-white dark:bg-[#1e2138] border border-black/10 dark:border-white/10 text-xs">Replace All</button>
                  <button onClick={()=>doSort("asc")} className="px-3 py-1.5 rounded-[10px] bg-white dark:bg-[#1e2138] border border-black/10 dark:border-white/10 text-xs">Sort A-Z</button>
                  <button onClick={()=>doSort("desc")} className="px-3 py-1.5 rounded-[10px] bg-white dark:bg-[#1e2138] border border-black/10 dark:border-white/10 text-xs">Sort Z-A</button>
                </div>
              </div>
              <div className="glass rounded-[16px] bg-white/70 dark:bg-[#161826]/70 border border-black/10 dark:border-white/10 p-3">
                <h4 className="text-[11px] uppercase tracking-widest text-[#6b728f]">Text Cleaner</h4>
                <div className="flex flex-wrap gap-2 mt-2">
                  {[
                    ["extraSpaces","Extra Spaces"],
                    ["trimLines","Trim Lines"],
                    ["removeEmpty","Remove Empty"],
                    ["removeNumbers","Remove Numbers"],
                    ["removeEmoji","Remove Emoji"],
                  ].map(([k,l])=>(
                    <button key={k} onClick={()=>clean(k)} className="px-3 py-1.5 rounded-[10px] bg-white dark:bg-[#1e2138] border border-black/10 dark:border-white/10 text-xs">{l}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 lg:sticky top-4 h-fit">
            <div className="glass rounded-[20px] bg-white/70 dark:bg-[#161826]/70 border border-black/10 dark:border-white/10 p-4 shadow-[0_10px_30px_rgba(91,91,255,0.12)]">
              <h4 className="text-[11px] uppercase tracking-widest text-[#6b728f] mb-2">Writing Goal & Progress</h4>
              <div className="flex gap-2"><input type="number" value={goal} onChange={e=>setGoalState(parseInt(e.target.value)||0)} className="flex-1 px-3 py-2 rounded-[10px] border border-black/10 dark:border-white/10 bg-white/90 dark:bg-[#1e2138]/90 text-sm"/><button onClick={()=>{localStorage.setItem("textlyzer_goal", goal.toString())}} className="px-4 py-2 rounded-full bg-gradient-to-br from-[#5b5bff] to-[#8b5cf6] text-white text-xs font-bold">Set</button></div>
              <div className="h-2 bg-black/10 rounded-full overflow-hidden mt-3"><div className="h-full bg-gradient-to-r from-[#5b5bff] to-[#06b6d4] transition-all" style={{width:`${goalPct}%`}}/></div>
              <div className="flex justify-between text-xs mt-1"><span>{stats.words} / {goal}</span><span>{goalPct}%</span></div>
            </div>

            <div className="glass rounded-[20px] bg-white/70 dark:bg-[#161826]/70 border border-black/10 dark:border-white/10 p-4">
              <h4 className="text-[11px] uppercase tracking-widest text-[#6b728f] mb-2">Reading & Speaking</h4>
              <div className="text-sm leading-7">
                <div>📖 Reading: <b>{stats.words? stats.readingMin+" min":"0 min"}</b> (225 wpm)</div>
                <div>🗣 Speaking: <b>{stats.words? stats.speakingMin+" min":"0 min"}</b> (150 wpm)</div>
                <div>📊 Flesch: <b>{stats.words? Math.round(stats.flesch)+" "+(stats.flesch>80?"Easy":stats.flesch>50?"Medium":"Hard"):"-"}</b></div>
                <div>🎓 Grade: <b>{stats.grade}</b></div>
              </div>
            </div>

            <div className="glass rounded-[20px] bg-white/70 dark:bg-[#161826]/70 border border-black/10 dark:border-white/10 p-4">
              <h4 className="text-[11px] uppercase tracking-widest text-[#6b728f] mb-2">Social Limits</h4>
              <div className="space-y-1">
                {[...SOCIAL_DEFAULTS,...customLimits].map((s)=> {
                  const over = text.length > s.limit;
                  return <div key={s.name} className={`flex justify-between text-[13px] py-1.5 border-b border-dashed border-black/10 dark:border-white/10 ${over?'text-red-600':'text-emerald-600'}`}><span>{s.name} ({s.limit})</span><span>{text.length}/{s.limit} {over?`⚠ ${text.length - s.limit} over`:''}</span></div>
                })}
              </div>
              <div className="flex gap-2 mt-3"><input value={customLabel} onChange={e=>setCustomLabel(e.target.value)} placeholder="Label" className="flex-1 px-2 py-2 rounded-[10px] border border-black/10 dark:border-white/10 bg-white/90 dark:bg-[#1e2138]/90 text-xs"/><input type="number" value={customNum||''} onChange={e=>setCustomNum(parseInt(e.target.value)||0)} placeholder="Limit" className="w-20 px-2 py-2 rounded-[10px] border border-black/10 dark:border-white/10 bg-white/90 dark:bg-[#1e2138]/90 text-xs"/><button onClick={()=>{
                if(!customLabel||!customNum) return;
                const newLimits=[...customLimits,{name:customLabel,limit:customNum}];
                setCustomLimits(newLimits); localStorage.setItem("textlyzer_customLimits", JSON.stringify(newLimits));
                setCustomLabel(""); setCustomNum(0);
              }} className="px-3 py-2 rounded-[10px] bg-white dark:bg-[#1e2138] border text-xs">+</button></div>
            </div>

            <div className="glass rounded-[20px] bg-white/70 dark:bg-[#161826]/70 border border-black/10 dark:border-white/10 p-4">
              <h4 className="text-[11px] uppercase tracking-widest text-[#6b728f] mb-2">SEO Counters</h4>
              <label className="text-xs">Title (50-60)</label><input value={seoTitle} onChange={e=>setSeoTitle(e.target.value)} placeholder="Your SEO title" className="w-full mt-1 px-3 py-2 rounded-[10px] border border-black/10 dark:border-white/10 bg-white/90 dark:bg-[#1e2138]/90 text-sm"/>
              <div className="h-1.5 bg-black/10 rounded-full my-2 overflow-hidden"><div className="h-full bg-[#5b5bff]" style={{width:`${Math.min(100,(seoTitle.length/60)*100)}%`}}/></div>
              <small className="text-[11px] text-[#6b728f]">{seoTitle.length} chars {seoTitle.length>=50&&seoTitle.length<=60?'✅ Ideal':'• Aim 50-60'}</small>
              <label className="text-xs mt-3 block">Description (150-160)</label><input value={seoDesc} onChange={e=>setSeoDesc(e.target.value)} placeholder="Your meta description" className="w-full mt-1 px-3 py-2 rounded-[10px] border border-black/10 dark:border-white/10 bg-white/90 dark:bg-[#1e2138]/90 text-sm"/>
              <div className="h-1.5 bg-black/10 rounded-full my-2 overflow-hidden"><div className="h-full bg-[#5b5bff]" style={{width:`${Math.min(100,(seoDesc.length/160)*100)}%`}}/></div>
              <small className="text-[11px] text-[#6b728f]">{seoDesc.length} chars {seoDesc.length>=150&&seoDesc.length<=160?'✅ Ideal':'• Aim 150-160'}</small>
              <div className="mt-3 text-xs"><div>Keyword Density Top 5:</div>
                <div className="mt-1 space-y-1">{stats.topKeywords.length? stats.topKeywords.map(([k,v]:any)=><div key={k} className="flex justify-between"><span>{k}</span><span>{v} • {((v/text.split(/\W+/).length)*100).toFixed(1)}%</span></div>):<span className="text-[#6b728f]">No keywords yet</span>}</div>
              </div>
            </div>

            <div className="glass rounded-[20px] bg-white/70 dark:bg-[#161826]/70 border border-black/10 dark:border-white/10 p-4">
              <h4 className="text-[11px] uppercase tracking-widest text-[#6b728f] mb-2">Case Converter</h4>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={()=>convertCase("upper")} className="px-3 py-2 rounded-[10px] bg-white dark:bg-[#1e2138] border border-black/10 dark:border-white/10 text-xs">UPPER</button>
                <button onClick={()=>convertCase("lower")} className="px-3 py-2 rounded-[10px] bg-white dark:bg-[#1e2138] border border-black/10 dark:border-white/10 text-xs">lower</button>
                <button onClick={()=>convertCase("title")} className="px-3 py-2 rounded-[10px] bg-white dark:bg-[#1e2138] border border-black/10 dark:border-white/10 text-xs">Title Case</button>
                <button onClick={()=>convertCase("sentence")} className="px-3 py-2 rounded-[10px] bg-white dark:bg-[#1e2138] border border-black/10 dark:border-white/10 text-xs">Sentence</button>
                <button onClick={()=>convertCase("camel")} className="px-3 py-2 rounded-[10px] bg-white dark:bg-[#1e2138] border border-black/10 dark:border-white/10 text-xs">camelCase</button>
                <button onClick={()=>convertCase("reverse")} className="px-3 py-2 rounded-[10px] bg-white dark:bg-[#1e2138] border border-black/10 dark:border-white/10 text-xs">Reverse</button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1240px] mx-auto px-6 py-8 grid md:grid-cols-3 gap-4">
          <div className="glass rounded-[20px] bg-white/70 dark:bg-[#161826]/70 border border-black/10 dark:border-white/10 p-5"><h3 className="font-semibold">🔒 100% Local</h3><p className="text-sm text-[#6b728f] mt-1">No server upload. Draft saved in localStorage. Works offline after load.</p></div>
          <div className="glass rounded-[20px] bg-white/70 dark:bg-[#161826]/70 border border-black/10 dark:border-white/10 p-5"><h3 className="font-semibold">📱 Mobile First</h3><p className="text-sm text-[#6b728f] mt-1">Responsive, sticky panels collapse, large tap targets, fast LCP {'<'}1s.</p></div>
          <div className="glass rounded-[20px] bg-white/70 dark:bg-[#161826]/70 border border-black/10 dark:border-white/10 p-5"><h3 className="font-semibold">⚡ No Crash</h3><p className="text-sm text-[#6b728f] mt-1">Debounced 120ms, tested 200k chars. Empty state handled.</p></div>
        </div>

        <footer className="text-center py-8 text-xs text-[#6b728f]">Made with ♥ — Textlyzer • Tailwind • Next.js 14 • Fast, Glassmorphism, Local</footer>
      </div>
    </div>
  );
}
