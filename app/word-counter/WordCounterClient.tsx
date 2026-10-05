"use client";
import { useState, useMemo, useRef, useEffect, useCallback } from "react";

type ErrorItem = { message: string; offset: number; length: number; replacement: string; };
type Suggestion = { word: string; at: number; replaceLen: number };

const LANGUAGES = [
  { code: "en-US", label: "English (US)", flag: "🇺🇸" },
  { code: "hi-IN", label: "Hindi", flag: "🇮🇳" },
  { code: "es", label: "Spanish", flag: "🇪🇸" },
  { code: "fr", label: "French", flag: "🇫🇷" },
];

const PAGE_SIZES = {
  A4: { w: 210, h: 297, label: "A4" },
  Letter: { w: 216, h: 279, label: "Letter" },
  Legal: { w: 216, h: 356, label: "Legal" },
};

const FONTS = [
  { name: "Inter", css: "'Inter', sans-serif" },
  { name: "Merriweather", css: "'Merriweather', serif" },
  { name: "JetBrains Mono", css: "'JetBrains Mono', monospace" },
  { name: "Arial", css: "Arial, sans-serif" },
];

const AUTO_CORRECT: Record<string, string> = {
  teh: "the", adn: "and", recieve: "receive", seperate: "separate",
  occured: "occurred", definately: "definitely", freind: "friend",
  beleive: "believe", tommorow: "tomorrow", wich: "which",
};

const DICTIONARY = ["about","above","across","action","actually","after","again","against","already","although","always","among","another","answer","anyone","anything","around","available","because","become","before","begin","behind","believe","better","between","business","children","company","complete","different","education","example","experience","government","important","language","people","possible","problem","question","receive","remember","school","service","student","system","through","together","tomorrow","understand"];

const safeGet = (k: string) => { try { return localStorage.getItem(k); } catch { return null; } };
const safeSet = (k: string, v: string) => { try { localStorage.setItem(k, v); } catch {} };
const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const formatTime = (s: number) => { const m = Math.floor(s / 60); const sec = s % 60; return m>0? `${m}m ${sec}s` : `${sec}s`; };

export default function WordCounterClient() {
  const [text, setText] = useState("");
  const [errors, setErrors] = useState<ErrorItem[]>([]);
  const [checking, setChecking] = useState(false);
  const [font, setFont] = useState("Inter");
  const [fontSize, setFontSize] = useState(16);
  const [lineHeight, setLineHeight] = useState(1.7);
  const [goal, setGoal] = useState(1000);
  const [isDark, setIsDark] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lang, setLang] = useState("en-US");
  const [showHighlight, setShowHighlight] = useState(false);
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [showFind, setShowFind] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [writingTime, setWritingTime] = useState(0);
  const [isActive, setIsActive] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => { const s = safeGet("lorem_word_text"); if (s) setText(s); }, []);
  useEffect(() => { safeSet("lorem_word_text", text); }, [text]);
  useEffect(() => { const id = setInterval(() => { if (isActive) setWritingTime(t=>t+1); }, 1000); return ()=>clearInterval(id); }, [isActive]);

  const stats = useMemo(() => {
    const trimmed = text.trim();
    const words = trimmed? trimmed.split(/\s+/).filter(Boolean).length : 0;
    const chars = text.length;
    const charsNoSpace = text.replace(/\s/g, "").length;
    const sentences = text.split(/[.!?]+/).filter(s=>s.trim().length>0).length || 0;
    const paras = text.split(/\n+/).filter(p=>p.trim().length>0).length;
    const lines = text? text.split("\n").length : 0;
    return { words, chars, charsNoSpace, sentences, paras, lines, readingTime: Math.ceil(words/200), speakingTime: Math.ceil(words/130) };
  }, [text]);

  const progress = Math.min(100, Math.round((stats.words/goal)*100));
  const highlightedHtml = useMemo(() => {
    if (!showHighlight || errors.length===0) return "";
    let html = escapeHtml(text);
    [...errors].sort((a,b)=>b.offset-a.offset).forEach(err=>{
      const before=html.substring(0,err.offset); const mid=html.substring(err.offset,err.offset+err.length); const after=html.substring(err.offset+err.length);
      html=`${before}<span style="text-decoration:underline wavy red 2.5px;background:rgba(255,0,0,0.08)">${mid}</span>${after}`;
    });
    return html.replace(/\n/g,"<br>");
  }, [text, errors, showHighlight]);

  const checkGrammar = useCallback(async () => {
    if (!text.trim() || text.length<5) return; setChecking(true);
    try {
      const res = await fetch("https://api.languagetool.org/v2/check", { method:"POST", headers:{"Content-Type":"application/x-www-form-urlencoded"}, body:`text=${encodeURIComponent(text)}&language=${lang}` });
      const data = await res.json();
      setErrors((data.matches||[]).slice(0,15).map((m:any)=>({ message:m.message, offset:m.offset, length:m.length, replacement:m.replacements?.[0]?.value||"" })));
    } catch {} setChecking(false);
  }, [text, lang]);

  useEffect(()=>{ if(text.length<15) return; const t=setTimeout(checkGrammar,1500); return()=>clearTimeout(t); }, [text, checkGrammar]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setIsActive(true); let val = e.target.value;
    if (val.match(/(\b[a-zA-Z]{2,})\s$/)) { const m=val.match(/(\b[a-zA-Z]{2,})\s$/); if(m){ const lower=m[1].toLowerCase(); if(AUTO_CORRECT[lower]) val=val.slice(0,-m[0].length)+AUTO_CORRECT[lower]+" "; } }
    setText(val);
    const m2 = val.match(/([a-zA-Z]{2,})$/);
    if (m2) { const prefix=m2[1].toLowerCase(); const sugg=DICTIONARY.filter(w=>w.startsWith(prefix)&&w!==prefix).slice(0,5); setSuggestions(sugg.map(w=>({word:w, at:val.length-m2[1].length, replaceLen:m2[1].length}))); }
    else setSuggestions([]);
  };

  const insertAtCursor = (insert: string) => {
    const ta = textareaRef.current; if(!ta){ setText(t=>t+(t?" ":"")+insert); return; }
    const start=ta.selectionStart; const end=ta.selectionEnd;
    const before=text.substring(0,start); const after=text.substring(end);
    const newText=before+(before&&!before.endsWith(" ")&&!before.endsWith("\n")?" ":"")+insert+after;
    setText(newText);
    setTimeout(()=>{ ta.focus(); ta.setSelectionRange(start+insert.length+1,start+insert.length+1); },10);
  };

  const toggleVoice = () => {
    const SR = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if(!SR){ alert("Chrome me kholo"); return; }
    if(isListening){ try{ recognitionRef.current?.stop(); }catch{} setIsListening(false); return; }
    const rec=new SR(); recognitionRef.current=rec; rec.lang=lang; rec.continuous=false;
    rec.onstart=()=>setIsListening(true);
    rec.onresult=(e:any)=>insertAtCursor(e.results[0][0].transcript);
    rec.onend=()=>setIsListening(false); rec.onerror=()=>setIsListening(false); rec.start();
  };

  const fixError = (err: ErrorItem) => { const nt=text.substring(0,err.offset)+err.replacement+text.substring(err.offset+err.length); setText(nt); setErrors(p=>p.filter(e=>e!==err)); };
  const fixAll = () => { let nt=text; [...errors].sort((a,b)=>b.offset-a.offset).forEach(err=>{ nt=nt.substring(0,err.offset)+err.replacement+nt.substring(err.offset+err.length); }); setText(nt); setErrors([]); };

  const currentFont = FONTS.find(f=>f.name===font)?.css || "'Inter', sans-serif";

  return (
    <div className={`${isDark?"bg-black text-white":"bg-[#f8fafc] text-black"} min-h-screen`}>
      <div className="max-w-6xl mx-auto p-4">
        <div className="text-center mb-4">
          <h1 className="text-4xl font-black">Word Counter Pro</h1>
          <p className="text-xs opacity-60 mt-1">Enter & Cursor Bug Fixed | Voice Direct Insert | No Padding</p>
          <div className="flex justify-center gap-2 mt-2">
            <span className="text-xs px-2 py-1 bg-violet-600 text-white rounded-full">{stats.words}/{goal} • {progress}%</span>
            <span className="text-xs px-2 py-1 bg-gray-200 text-black rounded-full">⏱ {formatTime(writingTime)}</span>
          </div>
        </div>

        <div className="flex gap-2 mb-3 flex-wrap">
          <button onClick={toggleVoice} className={`h-10 px-5 rounded-xl font-black ${isListening?"bg-red-600 text-white animate-pulse":"bg-black text-white"}`}>{isListening?"■ STOP":"🎤 VOICE"}</button>
          <button onClick={()=>{ checkGrammar(); setShowHighlight(true); }} className="h-10 px-4 rounded-xl bg-violet-600 text-white">{checking?"Checking...":"✓ Grammar"}</button>
          {errors.length>0 && <button onClick={fixAll} className="h-10 px-4 rounded-xl bg-green-600 text-white">Fix All ({errors.length})</button>}
          <button onClick={()=>setShowFind(v=>!v)} className="h-10 px-3 rounded-xl bg-white border text-black">🔍 Find</button>
          <button onClick={()=>setShowSettings(v=>!v)} className="h-10 px-3 rounded-xl bg-white border text-black">⚙ Settings</button>
          <button onClick={()=>setIsDark(!isDark)} className="h-10 px-3 rounded-xl bg-black text-white">{isDark?"☀":"🌙"}</button>
        </div>

        {showSettings && (
          <div className="border rounded-xl p-3 mb-3 grid grid-cols-2 md:grid-cols-4 gap-2 bg-white text-black">
            <select value={font} onChange={e=>setFont(e.target.value)} className="h-9 border rounded-lg px-2">{FONTS.map(f=><option key={f.name} value={f.name}>{f.name}</option>)}</select>
            <input type="range" min={10} max={28} value={fontSize} onChange={e=>setFontSize(parseInt(e.target.value))} />
            <input type="number" value={goal} onChange={e=>setGoal(parseInt(e.target.value)||1000)} className="h-9 border rounded-lg px-2" placeholder="Goal" />
            <select value={lang} onChange={e=>setLang(e.target.value)} className="h-9 border rounded-lg px-2">{LANGUAGES.map(l=><option key={l.code} value={l.code}>{l.flag} {l.label}</option>)}</select>
          </div>
        )}

        {showFind && (
          <div className="border rounded-xl p-2 mb-3 flex gap-2 bg-white">
            <input value={findText} onChange={e=>setFindText(e.target.value)} placeholder="Find" className="flex-1 h-8 border rounded-lg px-2 text-black" />
            <input value={replaceText} onChange={e=>setReplaceText(e.target.value)} placeholder="Replace" className="flex-1 h-8 border rounded-lg px-2 text-black" />
            <button onClick={()=>{ if(findText) setText(text.split(findText).join(replaceText)); }} className="h-8 px-3 bg-violet-600 text-white rounded-lg">Replace</button>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <textarea
              ref={textareaRef}
              value={text}
              onChange={handleInput}
              placeholder="Yahan type karo... Beech me Enter dabao, line wahi rahegi. Cursor jump nahi hoga. Voice bhi direct yahi ayega."
              className={`w-full min-h-[450px] p-5 rounded-2xl border outline-none ${isDark?"bg-zinc-900 text-white":"bg-white text-black"}`}
              style={{ fontFamily: currentFont, fontSize:`${fontSize}px`, lineHeight }}
            />
            {suggestions.length>0 && (
              <div className="mt-2 bg-white border rounded-xl shadow p-1 flex gap-1 flex-wrap">
                {suggestions.map(s=><button key={s.word} onClick={()=>{ const next=text.slice(0,s.at)+s.word+text.slice(s.at+s.replaceLen); setText(next); setSuggestions([]); }} className="px-3 py-1 bg-violet-50 rounded-lg text-xs">{s.word} <span className="opacity-40">Tab</span></button>)}
              </div>
            )}
            {showHighlight && <div className="mt-4 p-4 border rounded-xl bg-yellow-50 text-black" dangerouslySetInnerHTML={{__html: highlightedHtml || "No errors"}} />}
            {errors.length>0 && <div className="mt-3 space-y-2">{errors.map((err,i)=><div key={i} className="flex justify-between items-center p-2 bg-white border rounded-lg text-xs text-black"><span>{err.message} → <b className="text-green-600">{err.replacement}</b></span><button onClick={()=>fixError(err)} className="px-2 py-1 bg-black text-white rounded">Fix</button></div>)}</div>}
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 border rounded-xl bg-white text-black"><div className="text-[10px] opacity-60">Words</div><div className="font-black text-lg">{stats.words}</div></div>
              <div className="p-3 border rounded-xl bg-white text-black"><div className="text-[10px] opacity-60">Chars (with)</div><div className="font-black">{stats.chars}</div><div className="text-[8px] opacity-50">Space included - Twitter</div></div>
              <div className="p-3 border rounded-xl bg-white text-black"><div className="text-[10px] opacity-60">Chars (without)</div><div className="font-black">{stats.charsNoSpace}</div><div className="text-[8px] opacity-50">Bina space - University</div></div>
              <div className="p-3 border rounded-xl bg-white text-black"><div className="text-[10px] opacity-60">Sentences</div><div className="font-black">{stats.sentences}</div></div>
              <div className="p-3 border rounded-xl bg-white text-black"><div className="text-[10px] opacity-60">Paragraphs</div><div className="font-black">{stats.paras}</div></div>
              <div className="p-3 border rounded-xl bg-white text-black"><div className="text-[10px] opacity-60">Lines</div><div className="font-black">{stats.lines}</div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
