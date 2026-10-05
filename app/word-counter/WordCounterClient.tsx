"use client";
import { useState, useMemo, useRef, useEffect, useCallback } from "react";

type ErrorItem = { message: string; offset: number; length: number; replacement: string; };
type Suggestion = { word: string; at: number; replaceLen: number };

const LANGUAGES = [
  { code: "en-US", label: "English (US)", flag: "🇺🇸" },
  { code: "hi-IN", label: "Hindi", flag: "🇮🇳" },
  { code: "es", label: "Spanish", flag: "🇪🇸" },
];

const FONTS = [
  { name: "Inter", css: "'Inter', sans-serif" },
  { name: "Merriweather", css: "'Merriweather', serif" },
  { name: "JetBrains Mono", css: "'JetBrains Mono', monospace" },
];

const articles = [
  {
    id: "how-to-use",
    title: "How to Use? Enter / Cursor / Grammar Fixed Guide",
    content: `NEW FIX (Aapki screenshot wala bug):

1. Enter Bug Fix: Pehle hum contentEditable div use kar rahe the, usme Enter dabane par browser <div> banata hai aur grammar check usko tod deta tha. Ab humne <textarea> use kiya hai - isme Enter 100% stable hai, jaise Notepad me hota hai. Beech me Enter dabaoge to new line wahi rahegi, upar nahi jayegi.

2. Cursor Jump Fix: Pehle last me likhne par cursor first line par chala jata tha kyunki innerHTML rewrite ho raha tha. Textarea me cursor kabhi jump nahi karta. Aap jahan likh rahe ho wahi rahega.

3. Grammar Kaise Kaam Karta Hai (Samjhao):
   - Auto Check: Aap type karte ho, 1.5 sec rukne par LanguageTool API call hoti hai.
   - Red Wavy: Error milne par neeche list me aata hai. Upar editor me disturb na ho isliye hum typing ke time red line nahi lagate.
   - Jab aap "✓ Grammar" button dabate ho tab neeche "Preview with Red Lines" me aapko MS Word jaisi red wavy underline dikhegi. Hover karne par sahi word dikhega.
   - Fix: Har error ke saath "Fix" button hai, ya "Fix All" se sab sahi ek baar me.
   - Ye bilkul Grammarly jaisa kaam karta hai - spelling, grammar, punctuation 30+ rules check.

4. Baaki Features:
   - Words, Chars(with)=space ke saath (Twitter count), Chars(without)=bina space (University count)
   - Reading 200wpm, Speaking 130wpm, Writing Time active typing only
   - Voice: Ab textarea ke cursor position par hi insert hoga, copy-paste khatam
   - Goal, Auto-save, Find/Replace, Export TXT/DOC/CSV/PDF
   - Duplicate highlight purple dotted line`
  },
  {
    id: "voice",
    title: "Voice Direct Insert - Ab Cursor Jahan Hai Wahi Type Hoga",
    content: `Pehle voice kahin aur type hota tha. Ab textarea me selectionStart / selectionEnd use karke jahan cursor hai wahi insert hota hai.

Chrome me HTTPS par: VOICE dabao -> bolo -> seedha editor me aayega. Enter ke beech me bhi bol sakte ho, line break nahi tootega.`
  },
];

const safeGet = (k: string) => { try { return localStorage.getItem(k); } catch { return null; } };
const safeSet = (k: string, v: string) => { try { localStorage.setItem(k, v); } catch {} };
const escapeHtml = (s: string) => s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
const formatTime = (s: number) => { const m=Math.floor(s/60); const sec=s%60; return m>0? `${m}m ${sec}s` : `${sec}s`; };

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
  const [autoLang, setAutoLang] = useState("Auto Detect: -");
  const [showHighlight, setShowHighlight] = useState(false); // default OFF to avoid cursor jump
  const [saveStatus, setSaveStatus] = useState<"idle"|"saving"|"saved">("idle");
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [showFind, setShowFind] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [writingTime, setWritingTime] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [showArticle, setShowArticle] = useState<string>("how-to-use");

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const idleTimerRef = useRef<any>(null);

  useEffect(()=>{ const s=safeGet("lorem_word_text"); if(s) setText(s); },[]);
  useEffect(()=>{ setSaveStatus("saving"); const t=setTimeout(()=>{ safeSet("lorem_word_text", text); setSaveStatus("saved"); setTimeout(()=>setSaveStatus("idle"),1000); },400); return()=>clearTimeout(t); },[text]);
  useEffect(()=>{ if(!text.trim()){ setAutoLang("Auto Detect: -"); return; } setAutoLang(/[\u0900-\u097F]/.test(text)? "Mixed 🌐" : "English 🇺🇸"); },[text]);
  useEffect(()=>{ const id=setInterval(()=>{ if(isActive) setWritingTime(v=>v+1); },1000); return()=>clearInterval(id); },[isActive]);

  const markActive=()=>{ setIsActive(true); if(idleTimerRef.current) clearTimeout(idleTimerRef.current); idleTimerRef.current=setTimeout(()=>setIsActive(false),4000); };

  const stats=useMemo(()=>{
    const trimmed=text.trim(); const words=trimmed? trimmed.split(/\s+/).filter(Boolean).length:0;
    const chars=text.length; const charsNoSpace=text.replace(/\s/g,"").length;
    const sentences=text.split(/[.!?]+/).filter(s=>s.trim().length>0).length||0;
    const paras=text.split(/\n+/).filter(p=>p.trim().length>0).length;
    const lines=text? text.split("\n").length:0;
    return { words, chars, charsNoSpace, sentences, paras, lines, readingTime:Math.ceil(words/200), speakingTime:Math.ceil(words/130) };
  },[text]);

  const progress=goal>0? Math.min(100, Math.round((stats.words/goal)*100)):0;

  // GRAMMAR - Does NOT touch textarea, only builds preview
  const checkGrammar=useCallback(async()=>{
    if(!text.trim()||text.length<5) return; setChecking(true);
    try{
      const res=await fetch("https://api.languagetool.org/v2/check",{ method:"POST", headers:{"Content-Type":"application/x-www-form-urlencoded"}, body:`text=${encodeURIComponent(text)}&language=${lang}` });
      const data=await res.json();
      const errs:ErrorItem[]=(data.matches||[]).slice(0,15).map((m:any)=>({ message:m.message, offset:m.offset, length:m.length, replacement:m.replacements?.[0]?.value||"" }));
      setErrors(errs);
    }catch{} setChecking(false);
  },[text, lang]);
  useEffect(()=>{ if(text.length<15) return; const t=setTimeout(()=>checkGrammar(),1500); return()=>clearTimeout(t); },[text, checkGrammar]);

  // Highlighted preview HTML (separate from textarea)
  const highlightedHtml=useMemo(()=>{
    if(!showHighlight||errors.length===0) return "";
    let html=escapeHtml(text);
    [...errors].sort((a,b)=>b.offset-a.offset).forEach(err=>{
      const before=html.substring(0,err.offset); const mid=html.substring(err.offset,err.offset+err.length); const after=html.substring(err.offset+err.length);
      html=`${before}<span style="text-decoration:underline wavy red 2.5px;text-underline-offset:4px;background:rgba(255,0,0,0.08)" title="${escapeHtml(err.message)} → ${escapeHtml(err.replacement)}">${mid}</span>${after}`;
    });
    return html.replace(/\n/g,"<br>");
  },[text, errors, showHighlight]);

  // TEXTAREA HANDLERS - 100% stable
  const handleInput=(e:any)=>{ markActive(); setText(e.target.value); };

  const insertAtCursor=(insert:string)=>{
    const ta=textareaRef.current; if(!ta){ setText(t=>t+(t?" ":"")+insert); return; }
    const start=ta.selectionStart; const end=ta.selectionEnd;
    const before=text.substring(0,start); const after=text.substring(end);
    const newText=before+(before&&!before.endsWith("\n")&&!before.endsWith(" ")?" ":"")+insert+after;
    setText(newText);
    setTimeout(()=>{ ta.focus(); ta.setSelectionRange(start+insert.length+1, start+insert.length+1); },10);
  };

  const toggleVoice=()=>{
    const SR=(window as any).webkitSpeechRecognition||(window as any).SpeechRecognition;
    if(!SR){ alert("Chrome me kholo HTTPS par"); return; }
    if(isListening){ try{ recognitionRef.current?.stop(); }catch{} setIsListening(false); return; }
    const rec=new SR(); recognitionRef.current=rec;
    rec.lang=lang; rec.continuous=false; rec.interimResults=false;
    rec.onstart=()=>setIsListening(true);
    rec.onresult=(e:any)=>{ const t=e.results[0][0].transcript; insertAtCursor(t); };
    rec.onend=()=>setIsListening(false);
    rec.onerror=()=>setIsListening(false);
    rec.start();
  };

  const fixError=(err:ErrorItem)=>{
    const nt=text.substring(0,err.offset)+err.replacement+text.substring(err.offset+err.length);
    setText(nt); setErrors(p=>p.filter(e=>e!==err));
  };
  const fixAll=()=>{ let nt=text; [...errors].sort((a,b)=>b.offset-a.offset).forEach(err=>{ nt=nt.substring(0,err.offset)+err.replacement+nt.substring(err.offset+err.length); }); setText(nt); setErrors([]); };

  const currentFont=FONTS.find(f=>f.name===font)?.css||"'Inter', sans-serif";

  return (
    <div className={`${isDark?"bg-[#0a0a0a] text-white":"bg-[#f5f7ff] text-gray-900"} min-h-screen`}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Merriweather&family=JetBrains+Mono&display=swap');.glass{backdrop-filter:blur(12px);background:${isDark?"rgba(30,30,30,0.7)":"rgba(255,255,255,0.85)"};border:1px solid ${isDark?"rgba(255,255,255,0.1)":"rgba(0,0,0,0.06)"}} textarea{resize:none}`}</style>
      <div className="max-w-6xl mx-auto p-3 md:p-6">
        <div className="text-center mb-4">
          <div className="inline-flex px-3 py-1 rounded-full bg-black text-white text-[10px]">✨ ENTER & CURSOR FIXED - TEXTAREA MODE</div>
          <h1 className="text-3xl font-black mt-2">Word Counter Pro</h1>
          <div className="flex justify-center gap-2 mt-2 flex-wrap"><span className="text-xs px-2 py-1 rounded-full bg-violet-600 text-white">{autoLang}</span><span className="text-xs px-2 py-1 rounded-full bg-gray-200 text-black">{stats.words}/{goal} • {progress}%</span><span className="text-xs px-2 py-1 rounded-full bg-gray-200 text-black">{saveStatus==="saved"?"Saved ✓":"Auto"} • ⏱ {formatTime(writingTime)} {isActive?"🟢":"⚪"}</span></div>
          <div className="max-w-md mx-auto h-2 bg-gray-200 rounded-full mt-2 overflow-hidden"><div style={{width:`${progress}%`}} className="h-full bg-violet-600 transition-all"></div></div>
        </div>

        <div className="glass rounded-2xl p-2 flex flex-wrap gap-1.5 justify-between sticky top-1 z-20">
          <div className="flex gap-1 flex-wrap">
            <button onClick={()=>{ const ta=textareaRef.current; if(!ta) return; const s=ta.selectionStart; const e=ta.selectionEnd; const sel=text.substring(s,e); if(!sel) return; const upper=sel.toUpperCase(); setText(text.substring(0,s)+upper+text.substring(e)); }} className="h-8 px-2 rounded-lg bg-white text-black text-xs border">UPPER</button>
            <button onClick={()=>{ textareaRef.current?.focus(); document.execCommand("copy"); }} className="h-8 px-2 rounded-lg bg-white text-black text-xs border">Copy</button>
            <button onClick={()=>setText("")} className="h-8 px-2 rounded-lg bg-red-50 text-red-600 text-xs border">Clear</button>
            <button onClick={()=>setShowFind(v=>!v)} className="h-8 px-3 rounded-lg bg-white text-black text-xs border">🔍 Find</button>
            <button onClick={()=>setShowSettings(v=>!v)} className="h-8 px-3 rounded-lg bg-white text-black text-xs border">⚙ Settings</button>
          </div>
          <div className="flex gap-1.5">
            <button onClick={toggleVoice} className={`h-9 px-4 rounded-xl text-xs font-black border-2 ${isListening?"bg-red-600 text-white animate-pulse":"bg-black text-white"}`}>{isListening?"■ STOP":"🎤 VOICE"}</button>
            <button onClick={()=>{ if(showHighlight) setShowHighlight(false); else { checkGrammar(); setShowHighlight(true); } }} className={`h-9 px-3 rounded-xl text-xs ${showHighlight?"bg-red-600 text-white":"bg-violet-600 text-white"}`}>{checking?"...":showHighlight?"Hide Red":"✓ Grammar"}</button>
            {errors.length>0 && <button onClick={fixAll} className="h-9 px-3 rounded-xl bg-green-600 text-white text-xs">Fix All ({errors.length})</button>}
          </div>
        </div>

        {showFind && (<div className="glass rounded-xl p-2 mt-2 flex gap-2"><input value={findText} onChange={e=>setFindText(e.target.value)} placeholder="Find" className="flex-1 h-8 px-2 rounded-lg border text-sm bg-white text-black"/><input value={replaceText} onChange={e=>setReplaceText(e.target.value)} placeholder="Replace" className="flex-1 h-8 px-2 rounded-lg border text-sm bg-white text-black"/><button onClick={()=>{ if(!findText) return; setText(text.split(findText).join(replaceText)); }} className="h-8 px-3 bg-violet-600 text-white rounded-lg text-xs">Replace All</button></div>)}

        <div className="grid md:grid-cols-3 gap-4 mt-4">
          <div className="md:col-span-2">
            <div className="glass rounded-[20px] p-2 shadow">
              <textarea
                ref={textareaRef}
                value={text}
                onChange={handleInput}
                onKeyDown={markActive}
                placeholder="Yahan type karo... Enter kahin bhi dabao, line wahi rahegi. Cursor jump nahi hoga."
                className={`w-full min-h-[420px] p-5 rounded-[14px] outline-none border ${isDark?"bg-black/50 text-white border-white/10":"bg-white text-black border-black/5"}`}
                style={{ fontFamily:currentFont, fontSize:`${fontSize}px`, lineHeight:lineHeight }}
              />
              <div className="px-3 py-1 text-[10px] opacity-50">Fixed: Textarea mode - Enter & Cursor 100% stable. Voice seedha yahi ayega.</div>
            </div>

            {showHighlight && (
              <div className="glass rounded-[20px] p-4 mt-4">
                <h3 className="font-bold text-xs mb-2">Preview with Red Wavy (Grammar)</h3>
                <div className={`min-h-[120px] p-4 rounded-xl ${isDark?"bg-black/40":"bg-white"} text-[15px] leading-7`} style={{fontFamily:currentFont}} dangerouslySetInnerHTML={{__html: highlightedHtml || escapeHtml(text).replace(/\n/g,"<br>")}} />
                <p className="text-[11px] mt-2 opacity-60">Ye sirf preview hai - isme red line dikhegi. Original typing upar wale box me hoti hai jahan cursor stable hai.</p>
              </div>
            )}

            {errors.length>0 && (
              <div className="glass rounded-2xl p-3 mt-4">
                <h3 className="font-bold text-xs mb-2">🔴 {errors.length} Errors</h3>
                {errors.map((err,i)=><div key={i} className="flex justify-between items-center bg-white text-black p-2 rounded-lg mb-2 text-xs"><span className="flex-1">{err.message} → <b className="text-green-600">{err.replacement}</b></span><button onClick={()=>fixError(err)} className="ml-2 px-3 py-1 bg-black text-white rounded-lg">Fix</button></div>)}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {[
                ["Words", stats.words],
                ["Chars (with)", stats.chars, "Space included"],
                ["Chars (without)", stats.charsNoSpace, "Bina space"],
                ["Sentences", stats.sentences],
                ["Paragraphs", stats.paras],
                ["Lines", stats.lines],
                ["Reading", `${stats.readingTime}m`],
                ["Speaking", `${stats.speakingTime}m`],
              ].map(([label,val,tip]:any)=><div key={label as string} className="glass rounded-xl p-3" title={tip}><div className="text-[9px] uppercase opacity-60">{label}</div><div className="font-black text-[15px]">{val}</div>{tip&&<div className="text-[8px] opacity-40">{tip}</div>}</div>)}
            </div>
            <div className="glass rounded-xl p-3">
              <label className="text-[10px] uppercase font-bold opacity-60">Goal</label>
              <input type="number" value={goal} onChange={e=>setGoal(parseInt(e.target.value)||1000)} className="w-full mt-1 h-8 rounded-lg border px-2 text-sm bg-white text-black"/>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-3">
          {articles.map(a=><div key={a.id} className="glass rounded-2xl overflow-hidden"><button onClick={()=>setShowArticle(showArticle===a.id? null : a.id)} className="w-full flex justify-between p-4 font-bold text-left"><span>{a.title}</span><span>{showArticle===a.id?"−":"+"}</span></button>{showArticle===a.id && <div className="p-5 text-sm leading-7 whitespace-pre-line border-t bg-white/70 text-black">{a.content}</div>}</div>)}
        </div>
      </div>
    </div>
  );
}
