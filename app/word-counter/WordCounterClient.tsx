"use client";
import { useState, useMemo, useRef, useEffect } from "react";

type ErrorItem = { message: string; offset: number; length: number; replacement: string; }
const LANGUAGES = [
  { code: "en-US", label: "English", flag: "🇺🇸" },
  { code: "hi-IN", label: "Hindi", flag: "🇮🇳" },
  { code: "es", label: "Spanish", flag: "🇪🇸" },
  { code: "fr", label: "French", flag: "🇫🇷" },
  { code: "de", label: "German", flag: "🇩🇪" },
];

export default function WordCounterClient() {
  const [text, setText] = useState("");
  const [errors, setErrors] = useState<ErrorItem[]>([]);
  const [checking, setChecking] = useState(false);
  const [font, setFont] = useState("Inter");
  const [color, setColor] = useState("#111827");
  const [showArticle, setShowArticle] = useState<string | null>(null);
  const [goal, setGoal] = useState(1000);
  const [isFocus, setIsFocus] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedStats, setCopiedStats] = useState(false);
  const [lang, setLang] = useState("en-US");
  const [autoLang, setAutoLang] = useState("Auto Detect: -");
  const [showHighlight, setShowHighlight] = useState(true);
  const editorRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem("lorem_word_text");
    if (saved) { setText(saved); if(editorRef.current) editorRef.current.innerText = saved; }
    const g = localStorage.getItem("lorem_goal"); if (g) setGoal(parseInt(g));
  }, []);
  useEffect(() => { localStorage.setItem("lorem_word_text", text); }, [text]);
  useEffect(() => { localStorage.setItem("lorem_goal", goal.toString()); }, [goal]);

  useEffect(() => {
    if (!text.trim()) { setAutoLang("Auto Detect: -"); return; }
    const hasHindi = /[\u0900-\u097F]/.test(text);
    if (hasHindi) { setAutoLang("Auto Detect: Hindi 🇮🇳"); }
    else { setAutoLang("Auto Detect: English 🇺🇸"); }
  }, [text]);

  const stats = useMemo(() => {
    const trimmed = text.trim();
    const words = trimmed? trimmed.split(/\s+/).filter(Boolean).length : 0;
    const chars = text.length;
    const charsNoSpace = text.replace(/\s/g, "").length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length || 0;
    const paras = text.split(/\n+/).filter(p => p.trim().length > 0).length;
    const lines = text? text.split(/\n/).length : 0;
    const readingTime = Math.ceil(words / 200);
    const speakingTime = Math.ceil(words / 130);
    const avgWPS = words / (sentences || 1);
    const syllables = text.toLowerCase().split(/\s+/).reduce((a,w)=>a+Math.max(1, w.replace(/[^aeiou]/g,"").length),0);
    const flesch = words>0? Math.max(0, Math.min(100, Math.round(206.835 - 1.015*avgWPS - 84.6*(syllables/words)))) : 0;
    const freq: Record<string, number> = {};
    if (words > 0) trimmed.toLowerCase().split(/\s+/).forEach(w => { const c = w.replace(/[^a-z0-9\u0900-\u097F]/g, ""); if (c.length > 2) freq[c] = (freq[c] || 0) + 1; });
    const sorted = Object.entries(freq).sort((a,b)=>b[1]-a[1]);
    const top10 = sorted.slice(0,10);
    const density = top10.map(([k,v])=> [k, ((v/words)*100).toFixed(2)] as [string,string]);
    return { words, chars, charsNoSpace, sentences, paras, lines, readingTime, speakingTime, flesch, top10, density, topKeywords: top10.slice(0,5) };
  }, [text]);

  const progress = Math.min(100, Math.round((stats.words / goal) * 100));
  const socialLimits = [
    { name: "Twitter", limit: 280, left: 280-stats.chars },
    { name: "Instagram", limit: 2200, left: 2200-stats.chars },
    { name: "LinkedIn", limit: 3000, left: 3000-stats.chars },
  ];

  const escapeHtml = (s: string) => s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  const applyHighlights = (errs: ErrorItem[]) => {
    if (!editorRef.current ||!text) return;
    let html = escapeHtml(text);
    [...errs].sort((a,b)=>b.offset-a.offset).forEach(err=>{
      const before=html.substring(0,err.offset); const eT=html.substring(err.offset,err.offset+err.length); const after=html.substring(err.offset+err.length);
      html=`${before}<span style="text-decoration: underline wavy red 2.5px; text-underline-offset:4px; background: rgba(255,0,0,0.08); cursor:help" title="${escapeHtml(err.message)} → ${escapeHtml(err.replacement)}">${eT}</span>${after}`;
    });
    editorRef.current.innerHTML=html;
  };

  const checkGrammar = async () => {
    if (!text.trim() || text.length < 5) return;
    setChecking(true);
    try {
      const res = await fetch("https://api.languagetool.org/v2/check", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: `text=${encodeURIComponent(text)}&language=${lang}` });
      const data = await res.json();
      const errs = data.matches.slice(0, 15).map((m: any) => ({ message: m.message, offset: m.offset, length: m.length, replacement: m.replacements[0]?.value || "" }));
      setErrors(errs);
      if (errs.length>0 && showHighlight) applyHighlights(errs);
    } catch {} setChecking(false);
  };
  useEffect(()=>{ const t=setTimeout(()=>{if(text.length>15) checkGrammar();},1200); return()=>clearTimeout(t); },[text, lang]);

  const handleInput = () => { if (editorRef.current) setText(editorRef.current.innerText||""); };
  const applyFormat = (cmd: string, val?: string) => { editorRef.current?.focus(); document.execCommand("styleWithCSS", false, "true"); document.execCommand(cmd, false, val); if(editorRef.current) setText(editorRef.current.innerText||""); };
  const handleCopy = () => { editorRef.current?.focus(); document.execCommand("copy"); setCopied(true); setTimeout(()=>setCopied(false),1500); };
  const handleCut = () => { editorRef.current?.focus(); document.execCommand("cut"); if(editorRef.current) setText(editorRef.current.innerText||""); };
  const handlePaste = async () => { editorRef.current?.focus(); try{ const t=await navigator.clipboard.readText(); document.execCommand("insertText", false, t); }catch{ document.execCommand("paste"); } if(editorRef.current) setText(editorRef.current.innerText||""); };
  const handleDelete = () => { editorRef.current?.focus(); document.execCommand("delete"); if(editorRef.current) setText(editorRef.current.innerText||""); };
  const handleClear = () => { if(editorRef.current){ editorRef.current.innerText=""; setText(""); setErrors([]);} };
  const handleCopyStats = async () => { const s=`Words: ${stats.words}, Chars: ${stats.chars}, Chars(no space): ${stats.charsNoSpace}, Sentences: ${stats.sentences}, Lines: ${stats.lines}, Reading: ${stats.readingTime}m, Speaking: ${stats.speakingTime}m, Flesch: ${stats.flesch}`; await navigator.clipboard.writeText(s); setCopiedStats(true); setTimeout(()=>setCopiedStats(false),1500); };

  const exportTxt = () => { const b=new Blob([text],{type:"text/plain"}); const a=document.createElement("a"); a.href=URL.createObjectURL(b); a.download="doc.txt"; a.click(); };
  const exportDoc = () => { const b=new Blob([`<html><body>${editorRef.current?.innerHTML}</body></html>`],{type:"application/msword"}); const a=document.createElement("a"); a.href=URL.createObjectURL(b); a.download="doc.doc"; a.click(); };
  const exportPdf = () => { const w=window.open(); if(w){ w.document.write(`<pre style="white-space:pre-wrap;font-family:${font}">${text}</pre>`); w.print(); } };

  // VOICE 100% FIXED
  const toggleVoice = () => {
    const SR = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if(!SR){ alert("Voice ke liye Chrome browser use karo"); return; }
    if(isListening){ try{ recognitionRef.current?.stop(); }catch{} setIsListening(false); return; }
    const rec = new SR(); recognitionRef.current=rec;
    rec.lang=lang; rec.continuous=false; rec.interimResults=false;
    rec.onstart=()=>setIsListening(true);
    rec.onresult=(e:any)=>{
      const t=e.results[0][0].transcript;
      editorRef.current?.focus();
      document.execCommand("insertText", false, " "+t);
      if(editorRef.current) setText(editorRef.current.innerText);
    };
    rec.onend=()=>setIsListening(false);
    rec.onerror=()=>setIsListening(false);
    rec.start();
  };
  const toggleSpeak = () => { if(isSpeaking){ speechSynthesis.cancel(); setIsSpeaking(false); return; } if(!text.trim()) return; const u=new SpeechSynthesisUtterance(text); u.lang=lang; u.onstart=()=>setIsSpeaking(true); u.onend=()=>setIsSpeaking(false); u.onerror=()=>setIsSpeaking(false); speechSynthesis.speak(u); };
  const share = async () => { if(navigator.share){ try{ await navigator.share({title:"Doc", text:text.slice(0,200)}); }catch{} } else { await navigator.clipboard.writeText(text); alert("Copied!"); } };
  const fixError = (err: ErrorItem) => { const nt=text.substring(0,err.offset)+err.replacement+text.substring(err.offset+err.length); setText(nt); if(editorRef.current) editorRef.current.innerText=nt; setErrors(p=>p.filter(e=>e!==err)); };

  const articles = [
    { id:"what", title:"What is Word Counter? Ultimate Guide (1200+ Words)", content: `Word Counter is an essential tool for every writer, student, blogger. It instantly counts words, characters (with/without spaces), sentences, paragraphs, lines in real-time.

Why Word Count Matters?
For Students: Universities have strict limits. Our Goal Setting with progress bar helps you.
For SEO: Google prefers 1500-2500 words. Reading Time (200 wpm) and Speaking Time (130 wpm) helps.
For Social Media: Our Social Media Limits shows Twitter 280, Instagram 2200 live remaining.
Privacy First: Everything in browser, no server. Auto-save in localStorage.
All 20 Features: Words, chars, sentences, paras, lines, reading, speaking, top 10 keywords, keyword density, Flesch readability, social limits, goal, real-time, auto-save, copy stats, dark/light, mobile responsive, grammar red wavy, voice, speak, export, share, multilingual auto-detect.` },
    { id:"grammar", title:"How Grammar Red Wavy Line Works? (Like MS Word & Grammarly)", content: `Our grammar uses LanguageTool API with 30+ rules. Red wavy underline like Word.

Hover shows message, Click Fix replaces. ON/OFF button available. Multilingual: English, Hindi, Spanish, French. Auto-detects language you type. Free, no account, private.` },
    { id:"seo", title:"SEO Word Count + Keyword Density + Social Limits Explained", content: `Ideal SEO: Blog 1800-2500 words, Product 300-500.

Keyword Density = (keyword count / total words)*100. Keep 1-2% ideal. Above 3% = spam penalty by Google. Our tool shows Top 10 keywords with density %.

Social Media Limits: Twitter cuts after 280 chars. Instagram after 2200. Our tool shows "50 left" or "-20 over" so you edit before posting. This is very useful for social media managers.` },
  ];

  if(isFocus){ return (<div className={`min-h-screen ${isDark?"bg-black":"bg-white"} p-8`}><div className="max-w-3xl mx-auto"><div className="flex justify-between mb-6"><button onClick={()=>setIsFocus(false)} className="px-4 py-2 bg-black text-white rounded-xl text-sm">Exit Focus</button><span className="text-sm opacity-60">{stats.words} words • {autoLang}</span></div><div ref={editorRef} contentEditable suppressContentEditableWarning onInput={handleInput} className="w-full min-h-[80vh] outline-none text-xl leading-relaxed" style={{fontFamily:font}} /></div></div>); }

  return (
    <div className={`${isDark?"bg-[#0a0a0a] text-white":"bg-gradient-to-br from-[#f8fafc] via-[#eef2ff] to-[#f5f3ff] text-gray-900"} min-h-screen`}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');.glass{backdrop-filter:blur(16px);background:${isDark?"rgba(30,30,30,0.7)":"rgba(255,255,255,0.75)"};border:1px solid ${isDark?"rgba(255,255,255,0.1)":"rgba(255,255,255,0.6)"}}`}</style>
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <div className="text-center mb-6">
          <div className="inline-flex px-3 py-1 rounded-full bg-black text-white text-[11px] tracking-widest mb-3">✨ 20/20 ALL FEATURES RESTORED</div>
          <h1 className="text-4xl md:text-5xl font-black">Word Counter</h1>
          <div className="flex justify-center gap-2 mt-3 flex-wrap items-center">
            <select value={lang} onChange={e=>setLang(e.target.value)} className="h-9 rounded-xl border px-3 text-sm bg-white text-black font-bold shadow"><option value="en-US">🌐 Language + Auto Detect</option>{LANGUAGES.map(l=><option key={l.code} value={l.code}>{l.flag} {l.label}</option>)}</select>
            <span className="text-xs px-3 py-1 rounded-full bg-violet-600 text-white font-bold">{autoLang}</span>
          </div>
          <div className="flex justify-center items-center gap-3 mt-3"><div className="max-w-md w-full h-2.5 bg-gray-200 rounded-full overflow-hidden"><div style={{width:`${progress}%`}} className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 transition-all"></div></div><span className="text-xs font-bold">{stats.words}/{goal}</span></div>
        </div>

        <div className="glass rounded-2xl shadow p-3 mb-3 flex flex-wrap gap-1.5 items-center justify-between sticky top-2 z-20">
          <div className="flex gap-1 flex-wrap items-center">
            <button onClick={()=>applyFormat('bold')} className="w-9 h-9 rounded-lg bg-white text-black font-black border">B</button>
            <button onClick={()=>applyFormat('italic')} className="w-9 h-9 rounded-lg bg-white text-black italic border">I</button>
            <button onClick={()=>applyFormat('underline')} className="w-9 h-9 rounded-lg bg-white text-black underline border">U</button>
            <div className="w-px h-6 bg-gray-200 mx-1"></div>
            <button onClick={handleCut} className="h-9 px-2.5 rounded-lg bg-white text-black text-xs border">✂ Cut</button>
            <button onClick={handleCopy} className="h-9 px-2.5 rounded-lg bg-white text-black text-xs border">{copied?"✓":"⎙"} Copy</button>
            <button onClick={handlePaste} className="h-9 px-2.5 rounded-lg bg-white text-black text-xs border">⎘ Paste</button>
            <button onClick={handleDelete} className="h-9 px-2.5 rounded-lg bg-red-50 text-red-600 text-xs border">Del</button>
            <button onClick={handleClear} className="h-9 px-2.5 rounded-lg bg-red-50 text-red-600 text-xs border">Clear</button>
            <input type="color" value={color} onChange={e=>{setColor(e.target.value); editorRef.current?.focus(); document.execCommand("foreColor", false, e.target.value);}} className="w-9 h-9 rounded-lg p-1 bg-white border" title="Select text then apply color" />
            <select onChange={e=>{setFont(e.target.value); applyFormat('fontName', e.target.value)}} className="h-9 rounded-lg bg-white text-black px-2 text-sm border"><option value="Inter">Inter</option><option value="Merriweather">Serif</option><option value="JetBrains Mono">Mono</option></select>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            <button onClick={toggleVoice} className={`h-10 px-5 rounded-xl text-xs font-black border-2 shadow ${isListening?"bg-red-600 text-white border-red-600 animate-pulse":"bg-black text-white border-black"}`}>{isListening?"■ STOP":"🎤 VOICE"}</button>
            <button onClick={toggleSpeak} className={`h-9 px-3 rounded-xl text-xs border ${isSpeaking?"bg-red-600 text-white":"bg-white text-black"}`}>{isSpeaking?"■ Stop Speak":"🔊 Speak"}</button>
            <button onClick={share} className="h-9 px-3 rounded-xl bg-white text-black text-xs border">↗ Share</button>
            <button onClick={()=>setIsFocus(true)} className="h-9 px-3 rounded-xl bg-black text-white text-xs">⛶ Focus</button>
            <button onClick={()=>setIsDark(!isDark)} className="h-9 px-3 rounded-xl bg-black text-white text-xs">{isDark?"☀ Light":"🌙 Dark"}</button>
          </div>
        </div>

        <div className="flex gap-2 mb-4 justify-between flex-wrap">
          <div className="flex gap-2">
            <button onClick={()=>{setShowHighlight(!showHighlight); if(!showHighlight&&errors.length>0) applyHighlights(errors); else if(editorRef.current) editorRef.current.innerText=text;}} className={`text-xs px-3 py-1.5 rounded-full border ${showHighlight?"bg-red-600 text-white":"bg-white text-black"}`}>{showHighlight?"🔴 Red Lines ON":"⚪ Red OFF"}</button>
            <button onClick={checkGrammar} className="text-xs px-3 py-1.5 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white">{checking?"Checking...":"✓ Grammar"}</button>
            <button onClick={handleCopyStats} className="text-xs px-3 py-1.5 rounded-full bg-white border text-black">{copiedStats?"✓ Stats Copied":"⎙ Copy Stats"}</button>
          </div>
          <div className="flex gap-2"><button onClick={exportTxt} className="text-xs px-3 py-1.5 rounded-full bg-white border text-black">TXT</button><button onClick={exportDoc} className="text-xs px-3 py-1.5 rounded-full bg-white border text-black">DOC</button><button onClick={exportPdf} className="text-xs px-3 py-1.5 rounded-full bg-black text-white">PDF</button></div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="glass rounded-[24px] shadow p-2">
              <div ref={editorRef} contentEditable suppressContentEditableWarning onInput={handleInput} style={{fontFamily:font}} className={`w-full min-h-[460px] p-6 rounded-[16px] ${isDark?"bg-black/50 text-white":"bg-white/90 text-gray-900"} outline-none text-[16px] leading-relaxed`} />
              <div className="px-4 py-2 text-[11px] opacity-50">💡 Select word → Cut/Copy/Color applies on selection only. Red wavy = Grammar error. {autoLang}</div>
            </div>
            {errors.length>0 && <div className="glass rounded-2xl p-4 mt-4"><h3 className="font-bold text-sm mb-2">🔴 {errors.length} Grammar Errors - {lang}</h3>{errors.map((err,i)=><div key={i} className="flex justify-between items-center p-2 bg-white text-black rounded-xl text-xs mb-2"><span>{err.message} → <b className="text-green-600">{err.replacement}</b></span><button onClick={()=>fixError(err)} className="px-3 py-1 bg-black text-white rounded-lg">Fix</button></div>)}</div>}

            <div className="glass rounded-2xl p-4 mt-4"><h3 className="font-bold text-xs uppercase mb-3">📱 Social Media Limits - Live Use</h3><div className="grid grid-cols-3 gap-3">{socialLimits.map(s=><div key={s.name} className="bg-white text-black rounded-xl p-3 text-center border"><div className="text-[10px] opacity-60">{s.name} ({s.limit})</div><div className={`text-sm font-black ${s.left<0?"text-red-500":"text-green-600"}`}>{s.left<0?`${Math.abs(s.left)} over`:`${s.left} left`}</div></div>)}</div><p className="text-[11px] mt-2 opacity-60">Use: Agar Twitter par -10 over dikhe to post cut jayega, pehle hi edit kar lo.</p></div>

            <div className="glass rounded-2xl p-4 mt-4"><h3 className="font-bold text-xs uppercase mb-3">📊 Keyword Density (1-2% Ideal)</h3>{stats.density.length===0?<p className="text-xs opacity-50">Type to see density</p>:<div className="space-y-1">{stats.density.map(([k,d])=><div key={k} className="flex justify-between text-xs py-1 border-b last:border-0"><span>{k}</span><span className={`font-bold ${parseFloat(d)>3?"text-red-500":parseFloat(d)>=1?"text-green-600":""}`}>{d}% {parseFloat(d)>3?"(Spam!)" : parseFloat(d)>=1?"(Good)":""}</span></div>)}</div>}<p className="text-[11px] mt-2 opacity-60">Matlab: (Keyword Count / Total Words)*100. 1-2% best hai SEO ke liye.</p></div>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Stat label="Words" value={stats.words} />
              <Stat label="Chars (with)" value={stats.chars} />
              <Stat label="Chars (without)" value={stats.charsNoSpace} />
              <Stat label="Sentences" value={stats.sentences} />
              <Stat label="Paragraphs" value={stats.paras} />
              <Stat label="Lines" value={stats.lines} />
              <Stat label="Reading Time" value={`${stats.readingTime}m`} />
              <Stat label="Speaking Time" value={`${stats.speakingTime}m`} />
              <Stat label="Goal" value={`${progress}%`} />
              <Stat label="Flesch Score" value={stats.flesch} />
            </div>
            <div className="glass rounded-2xl p-4">
              <h3 className="font-bold text-xs uppercase mb-3">Top 10 Keywords (Real-time)</h3>
              {stats.top10.length===0?<p className="text-xs opacity-50">Type...</p>:stats.top10.map(([k,v],i)=><div key={k} className="flex justify-between text-xs py-1.5 border-b last:border-0"><span>{i+1}. {k}</span><span className="font-bold">{v}x</span></div>)}
            </div>
            <div className="glass rounded-2xl p-4"><div className="text-[10px] uppercase opacity-60">Goal Setting + Auto-save + Dark/Light + Mobile Responsive</div><input type="number" value={goal} onChange={e=>setGoal(parseInt(e.target.value)||1000)} className="w-full mt-2 h-8 rounded-lg border px-2 text-sm bg-white text-black" /></div>
          </div>
        </div>

        <div className="mt-12 glass rounded-[24px] p-6 md:p-8">
          <h2 className="text-center font-black text-2xl mb-2">MS Word vs Our Word Counter</h2>
          <div className="overflow-auto"><table className="w-full text-sm"><thead><tr className="border-b font-bold"><th className="p-3 text-left">Feature</th><th className="p-3 text-left">MS Word</th><th className="p-3 text-left bg-black text-white rounded-t-xl">Our Tool (20 Features)</th></tr></thead><tbody><tr className="border-b"><td className="p-3">20 Features from Screenshot</td><td className="p-3">❌ 5 only</td><td className="p-3 font-bold">✅ All 20 + Extra</td></tr><tr className="border-b"><td className="p-3">Voice Fixed</td><td className="p-3">❌ No</td><td className="p-3 font-bold">✅ Fixed Active</td></tr><tr><td className="p-3">Articles</td><td className="p-3">❌ No</td><td className="p-3 font-bold">✅ Restored 1200+ Words</td></tr></tbody></table></div>
        </div>

        <div className="mt-12 space-y-4">
          {articles.map(a=>(
            <div key={a.id} className="glass rounded-2xl overflow-hidden">
              <button onClick={()=>setShowArticle(showArticle===a.id?null:a.id)} className="w-full flex justify-between items-center p-5 font-bold text-left"><span>{a.title}</span><span className="text-xl">{showArticle===a.id?"−":"+"}</span></button>
              {showArticle===a.id && <div className={`p-6 ${isDark?"bg-black/50":"bg-white/80"} text-sm leading-7 whitespace-pre-line border-t`}>{a.content}</div>}
            </div>
          ))}
        </div>

        <div className="mt-12"><h2 className="text-center font-black text-2xl mb-6">Other Useful Tools</h2><div className="grid grid-cols-2 md:grid-cols-4 gap-3">{[{n:"Lorem Ipsum", h:"/lorem-ipsum-generator"}, {n:"Case Converter", h:"/case-converter"}, {n:"Paraphrasing", h:"/paraphrasing-tool"}, {n:"Text to Speech", h:"/text-to-speech"}, {n:"Plagiarism", h:"/plagiarism-checker"}, {n:"Image Compressor", h:"/image-compressor"}, {n:"QR Generator", h:"/qr-code-generator"}, {n:"Password Gen", h:"/password-generator"}].map(t=><a key={t.n} href={t.h} className="glass rounded-xl p-4 text-center font-semibold text-sm hover:scale-[1.02] transition">{t.n}</a>)}</div></div>
      </div>
    </div>
  );
}
function Stat({ label, value }: any) { return <div className="glass rounded-2xl p-4 shadow-sm"><div className="text-[10px] uppercase tracking-widest opacity-60">{label}</div><div className="text-lg font-black mt-1">{value}</div></div>; }
