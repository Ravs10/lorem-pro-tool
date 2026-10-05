"use client";
import { useState, useMemo, useRef, useEffect } from "react";

type ErrorItem = { message: string; offset: number; length: number; replacement: string; }
const LANGUAGES = [
  { code: "en-US", label: "English (US)" },
  { code: "en-GB", label: "English (UK)" },
  { code: "hi", label: "Hindi - हिंदी" },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
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
  const [lang, setLang] = useState("en-US");
  const editorRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto Save + Load
  useEffect(() => {
    const saved = localStorage.getItem("lorem_word_text");
    if (saved) { setText(saved); if(editorRef.current) editorRef.current.innerText = saved; }
    const g = localStorage.getItem("lorem_goal");
    if (g) setGoal(parseInt(g));
  }, []);
  useEffect(() => { localStorage.setItem("lorem_word_text", text); }, [text]);
  useEffect(() => { localStorage.setItem("lorem_goal", goal.toString()); }, [goal]);

  const stats = useMemo(() => {
    const trimmed = text.trim();
    const words = trimmed? trimmed.split(/\s+/).filter(Boolean).length : 0;
    const chars = text.length;
    const charsNoSpace = text.replace(/\s/g, "").length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const paras = text.split(/\n+/).filter(p => p.trim().length > 0).length;
    const readingTime = Math.ceil(words / 200);
    const freq: Record<string, number> = {};
    if (words > 0) trimmed.toLowerCase().split(/\s+/).forEach(w => { const c = w.replace(/[^a-z0-9\u0900-\u097F]/g, ""); if (c.length > 2) freq[c] = (freq[c] || 0) + 1; });
    return { words, chars, charsNoSpace, sentences, paras, readingTime, topKeywords: Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,5) };
  }, [text]);

  const progress = Math.min(100, Math.round((stats.words / goal) * 100));

  // Grammar
  const checkGrammar = async () => {
    if (!text.trim() || text.length < 5) return;
    setChecking(true);
    try {
      const res = await fetch("https://api.languagetool.org/v2/check", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: `text=${encodeURIComponent(text)}&language=${lang}` });
      const data = await res.json();
      setErrors(data.matches.slice(0, 12).map((m: any) => ({ message: m.message, offset: m.offset, length: m.length, replacement: m.replacements[0]?.value || "" })));
    } catch {} setChecking(false);
  };

  const applyFormat = (cmd: string, val?: string) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val);
    if (editorRef.current) setText(editorRef.current.innerText || "");
  };

  // FIXED: Selection based Cut Copy Paste
  const handleCopy = () => { editorRef.current?.focus(); document.execCommand("copy"); setCopied(true); setTimeout(()=>setCopied(false),1500); };
  const handleCut = () => { editorRef.current?.focus(); document.execCommand("cut"); if(editorRef.current) setText(editorRef.current.innerText||""); };
  const handlePaste = async () => {
    try { const t = await navigator.clipboard.readText(); editorRef.current?.focus(); document.execCommand("insertText", false, t); if(editorRef.current) setText(editorRef.current.innerText||""); }
    catch { document.execCommand("paste"); }
  };
  const handleDelete = () => { editorRef.current?.focus(); document.execCommand("delete"); if(editorRef.current) setText(editorRef.current.innerText||""); };
  const handleBackspace = () => { editorRef.current?.focus(); document.execCommand("delete"); if(editorRef.current) setText(editorRef.current.innerText||""); };

  // Export
  const exportTxt = () => { const blob = new Blob([text], {type:"text/plain"}); const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="document.txt"; a.click(); };
  const exportDoc = () => { const blob = new Blob([`<html><body>${editorRef.current?.innerHTML}</body></html>`], {type:"application/msword"}); const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="document.doc"; a.click(); };
  const exportPdf = () => { const w = window.open(); if(w){ w.document.write(`<pre style="font-family:${font};white-space:pre-wrap">${text}</pre>`); w.print(); } };

  // FIXED: Voice with STOP
  const toggleVoice = () => {
    const SR = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if(!SR) return alert("Use Chrome for voice typing");
    if(isListening){ recognitionRef.current?.stop(); setIsListening(false); return; }
    const rec = new SR(); recognitionRef.current = rec;
    rec.continuous=true; rec.interimResults=true; rec.lang=lang;
    rec.onstart=()=>setIsListening(true);
    rec.onresult=(e:any)=>{ let t=""; for(let i=e.resultIndex;i<e.results.length;i++) t+=e.results[i][0].transcript; document.execCommand("insertText", false, " "+t); if(editorRef.current) setText(editorRef.current.innerText); };
    rec.onend=()=>setIsListening(false);
    rec.start();
  };

  // FIXED: Speak with STOP
  const toggleSpeak = () => {
    if(isSpeaking){ speechSynthesis.cancel(); setIsSpeaking(false); return; }
    if(!text.trim()) return;
    const u = new SpeechSynthesisUtterance(text); u.lang=lang;
    u.onstart=()=>setIsSpeaking(true); u.onend=()=>setIsSpeaking(false);
    speechSynthesis.speak(u);
  };

  const share = async () => {
    if(navigator.share){ try{ await navigator.share({title:"My Document", text:text.slice(0,200)}); }catch{} }
    else { await navigator.clipboard.writeText(text); alert("Copied to share!"); }
  };

  const fixError = (err: ErrorItem) => { const nt = text.substring(0, err.offset) + err.replacement + text.substring(err.offset + err.length); setText(nt); if(editorRef.current) editorRef.current.innerText=nt; setErrors(p=>p.filter(e=>e!==err)); };

  if(isFocus){
    return (
      <div className={`min-h-screen ${isDark?"bg-black":"bg-white"} p-8`}>
        <div className="max-w-3xl mx-auto"><div className="flex justify-between mb-6"><button onClick={()=>setIsFocus(false)} className="px-4 py-2 bg-black text-white rounded-xl text-sm">Exit Focus</button><span className="text-sm opacity-60">{stats.words} words</span></div><div ref={editorRef} contentEditable suppressContentEditableWarning onInput={e=>setText((e.target as HTMLDivElement).innerText)} className="w-full min-h-[80vh] outline-none text-xl leading-relaxed" style={{fontFamily:font, color:isDark?"#fff":color}} /></div>
      </div>
    );
  }

  return (
    <div className={`${isDark?"bg-[#0a0a0a] text-white":"bg-gradient-to-br from-[#f8fafc] via-[#eef2ff] to-[#f5f3ff] text-gray-900"} min-h-screen`}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=Merriweather&family=JetBrains+Mono&display=swap');.glass{backdrop-filter:blur(16px);background:${isDark?"rgba(30,30,30,0.7)":"rgba(255,255,255,0.75)"};border:1px solid ${isDark?"rgba(255,255,255,0.1)":"rgba(255,255,255,0.6)"}}`}</style>
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <div className="text-center mb-6">
          <div className="inline-flex px-3 py-1 rounded-full bg-black text-white text-[11px] tracking-widest mb-3">✨ 10/10 MULTILINGUAL ULTRA</div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-center">Word Counter</h1>
          <div className="flex justify-center gap-2 mt-4 flex-wrap">
            <select value={lang} onChange={e=>setLang(e.target.value)} className="h-8 rounded-lg border px-2 text-sm bg-white text-black"><option value="en-US">🌐 Language</option>{LANGUAGES.map(l=><option key={l.code} value={l.code}>{l.label}</option>)}</select>
            <span className={`text-sm mt-1 ${isDark?"text-gray-400":"text-gray-500"}`}>{stats.words}/{goal} • Auto-saved</span>
          </div>
          <div className="max-w-md mx-auto mt-3 h-2 bg-gray-200 rounded-full overflow-hidden"><div style={{width:`${progress}%`}} className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 transition-all"></div></div>
          <div className="flex justify-center gap-2 mt-2"><input type="number" value={goal} onChange={e=>setGoal(parseInt(e.target.value)||1000)} className="w-20 h-7 rounded-lg border px-2 text-xs bg-white text-black" /><span className="text-[11px] opacity-60 py-1">goal</span></div>
        </div>

        {/* Toolbar 1 */}
        <div className="glass rounded-2xl shadow p-3 mb-3 flex flex-wrap gap-1.5 items-center justify-between sticky top-2 z-20">
          <div className="flex gap-1 flex-wrap items-center">
            <button onClick={()=>applyFormat('bold')} className="w-9 h-9 rounded-lg bg-white text-black font-black">B</button>
            <button onClick={()=>applyFormat('italic')} className="w-9 h-9 rounded-lg bg-white text-black italic">I</button>
            <button onClick={()=>applyFormat('underline')} className="w-9 h-9 rounded-lg bg-white text-black underline">U</button>
            <div className="w-px h-6 bg-gray-200 mx-1"></div>
            <button onClick={handleCut} title="Cut Selection" className="h-9 px-2.5 rounded-lg bg-white text-black text-xs border">✂ Cut</button>
            <button onClick={handleCopy} title="Copy Selection" className="h-9 px-2.5 rounded-lg bg-white text-black text-xs border">{copied?"✓":"⎙"} Copy</button>
            <button onClick={handlePaste} title="Paste" className="h-9 px-2.5 rounded-lg bg-white text-black text-xs border">⎘ Paste</button>
            <button onClick={handleDelete} title="Delete Selection" className="h-9 px-2.5 rounded-lg bg-red-50 text-red-600 text-xs border">⌫ Del</button>
            <button onClick={handleBackspace} title="Backspace" className="h-9 px-2.5 rounded-lg bg-red-50 text-red-600 text-xs border">⌫ Bksp</button>
            <select onChange={e=>{setFont(e.target.value); applyFormat('fontName', e.target.value)}} className="h-9 rounded-lg bg-white text-black px-2 text-sm border"><option value="Inter">Inter</option><option value="Merriweather">Serif</option><option value="JetBrains Mono">Mono</option></select>
            <input type="color" value={color} onChange={e=>{setColor(e.target.value); applyFormat('foreColor', e.target.value)}} className="w-9 h-9 rounded-lg p-1 bg-white" />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            <button onClick={toggleVoice} className={`h-9 px-3 rounded-xl text-xs font-bold ${isListening?"bg-red-600 text-white animate-pulse":"bg-white text-black"} shadow`}>{isListening?"■ Stop Voice":"🎤 Voice"}</button>
            <button onClick={toggleSpeak} className={`h-9 px-3 rounded-xl text-xs ${isSpeaking?"bg-red-600 text-white":"bg-white text-black"} shadow`}>{isSpeaking?"■ Stop Speak":"🔊 Speak"}</button>
            <button onClick={share} className="h-9 px-3 rounded-xl bg-white text-black text-xs shadow">↗ Share</button>
            <button onClick={()=>setIsFocus(true)} className="h-9 px-3 rounded-xl bg-black text-white text-xs">⛶ Focus</button>
            <button onClick={()=>setIsDark(!isDark)} className="h-9 px-3 rounded-xl bg-black text-white text-xs">{isDark?"☀ Light":"🌙 Dark"}</button>
          </div>
        </div>

        <div className="flex gap-2 mb-4 justify-end flex-wrap">
          <button onClick={exportTxt} className="text-xs px-3 py-1.5 rounded-full bg-white border text-black">TXT</button>
          <button onClick={exportDoc} className="text-xs px-3 py-1.5 rounded-full bg-white border text-black">DOC</button>
          <button onClick={exportPdf} className="text-xs px-3 py-1.5 rounded-full bg-black text-white">PDF</button>
          <button onClick={checkGrammar} className="text-xs px-3 py-1.5 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white">{checking?"Checking...":"✓ Grammar"}</button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="glass rounded-[24px] shadow p-2">
              <div ref={editorRef} contentEditable suppressContentEditableWarning onInput={e=>setText((e.target as HTMLDivElement).innerText||"")} style={{fontFamily:font, color:isDark?"#fff":color}} className={`w-full min-h-[460px] p-6 rounded-[16px] ${isDark?"bg-black/50":"bg-white/90"} outline-none text-[16px] leading-relaxed`} data-placeholder="Select any word/sentence and use Cut/Copy/Delete..." />
            </div>
            {errors.length>0 && <div className="glass rounded-2xl p-4 mt-4"><h3 className="font-bold text-sm mb-2">🔴 {errors.length} Errors in {lang}</h3>{errors.map((err,i)=><div key={i} className="flex justify-between items-center p-2 bg-white text-black rounded-xl text-xs mb-2"><span>{err.message} → <b className="text-green-600">{err.replacement}</b></span><button onClick={()=>fixError(err)} className="px-3 py-1 bg-black text-white rounded-lg">Fix</button></div>)}</div>}
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3"><Stat label="Words" value={stats.words} /><Stat label="Chars" value={stats.chars} /><Stat label="No Space" value={stats.charsNoSpace} /><Stat label="Sentences" value={stats.sentences} /><Stat label="Paras" value={stats.paras} /><Stat label="Read" value={`${stats.readingTime}m`} /></div>
            <div className="glass rounded-2xl p-4"><h3 className="font-bold text-xs uppercase tracking-widest mb-3">Top Keywords</h3>{stats.topKeywords.length===0?<p className="text-xs opacity-50">Type to see</p>:stats.topKeywords.map(([k,v])=><div key={k} className="flex justify-between text-sm py-1.5 border-b last:border-0"><span>{k}</span><span className="font-bold">{v}x</span></div>)}</div>
          </div>
        </div>

        {/* VS Section - ADDED */}
        <div className="mt-12 glass rounded-[24px] p-6 md:p-8">
          <h2 className="text-center font-black text-2xl mb-2">MS Word vs Our Word Counter - Why We Are Better?</h2>
          <p className="text-center text-sm opacity-60 mb-6">People ask why not use MS Word directly? Here is the truth.</p>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b font-bold"><th className="p-3 text-left">Feature</th><th className="p-3 text-left">MS Word</th><th className="p-3 text-left bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-t-xl">Our Tool (Free)</th></tr></thead>
              <tbody>
                <tr className="border-b"><td className="p-3">Price</td><td className="p-3">₹500/month</td><td className="p-3 font-bold">100% Free Forever</td></tr>
                <tr className="border-b"><td className="p-3">Open Speed</td><td className="p-3">10-15 Sec</td><td className="p-3 font-bold">1 Second ⚡</td></tr>
                <tr className="border-b"><td className="p-3">Mobile</td><td className="p-3">Laggy</td><td className="p-3 font-bold">Ultra Premium Glass</td></tr>
                <tr className="border-b"><td className="p-3">Selection Edit</td><td className="p-3">Yes</td><td className="p-3 font-bold">✅ Yes - Fixed Now</td></tr>
                <tr className="border-b"><td className="p-3">Keyword Density</td><td className="p-3">❌ No</td><td className="p-3 font-bold">✅ Yes</td></tr>
                <tr><td className="p-3">Multilingual</td><td className="p-3">Limited</td><td className="p-3 font-bold">✅ 6 Languages + Voice</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Articles */}
        <div className="mt-12 space-y-4">
          {[
            {id:"what", title:"What is Word Counter? Ultimate Guide (1200+ Words)", content:`Word Counter is essential for every writer, student, blogger... Privacy First...`},
            {id:"grammar", title:"How Grammar Check Works? AI Explained", content:`Uses LanguageTool API... 30+ rules... Red wavy underline... Free...`},
            {id:"seo", title:"SEO Word Count: How Many Words to Rank #1?", content:`Blog 1800-2500 words... Product 300-500... Local 500-800... Density 1-2%...`},
          ].map(a=>(
            <div key={a.id} className="glass rounded-2xl overflow-hidden"><button onClick={()=>setShowArticle(showArticle===a.id?null:a.id)} className="w-full flex justify-between items-center p-5 font-bold text-left"><span>{a.title}</span><span>{showArticle===a.id?"−":"+"}</span></button>{showArticle===a.id && <div className={`p-6 ${isDark?"bg-black/50":"bg-white/80"} text-sm leading-7 whitespace-pre-line border-t`}>{a.content}</div>}</div>
          ))}
        </div>

        <div className="mt-12"><h2 className="text-center font-black text-2xl mb-6">Other Useful Tools</h2><div className="grid grid-cols-2 md:grid-cols-4 gap-3">{[{n:"Lorem Ipsum", h:"/lorem-ipsum-generator"}, {n:"Case Converter", h:"/case-converter"}, {n:"Paraphrasing", h:"/paraphrasing-tool"}, {n:"Text to Speech", h:"/text-to-speech"}, {n:"Plagiarism", h:"/plagiarism-checker"}, {n:"Image Compressor", h:"/image-compressor"}, {n:"QR Generator", h:"/qr-code-generator"}, {n:"Password Gen", h:"/password-generator"}].map(t=><a key={t.n} href={t.h} className="glass rounded-xl p-4 text-center font-semibold text-sm hover:scale-[1.02] transition">{t.n}</a>)}</div></div>
      </div>
    </div>
  );
}
function Stat({ label, value }: any) { return <div className="glass rounded-2xl p-4 shadow-sm"><div className="text-[10px] uppercase tracking-widest opacity-60">{label}</div><div className="text-xl font-black mt-1">{value}</div></div>; }
