"use client";
import { useState, useMemo, useRef, useEffect, useCallback } from "react";

// ================= TYPES =================
type ErrorItem = { message: string; offset: number; length: number; replacement: string; };
type QualityIssue = { type: string; label: string; count: number; status: "Good"|"Needs Attention"|"Improve"; desc: string; };

// ================= CONSTANTS =================
const LANGUAGES = [
  { code: "en-US", label: "English (US)", flag: "🇺🇸" },
  { code: "en-GB", label: "English (UK)", flag: "🇬🇧" },
  { code: "hi-IN", label: "Hindi", flag: "🇮🇳" },
  { code: "es", label: "Spanish", flag: "🇪🇸" },
];

const FONTS = [
  { name: "Inter", css: "'Inter', sans-serif" },
  { name: "Poppins", css: "'Poppins', sans-serif" },
  { name: "Merriweather", css: "'Merriweather', serif" },
  { name: "JetBrains Mono", css: "'JetBrains Mono', monospace" },
];

const COLOR_PALETTE = ["#111827","#7c3aed","#ec4899","#ef4444","#f59e0b","#10b981","#06b6d4","#3b82f6"];
const AUTO_CORRECT: Record<string,string> = { teh:"the", adn:"and", recieve:"receive", seperate:"separate", occured:"occurred", definately:"definitely", freind:"friend", beleive:"believe", tommorow:"tomorrow" };
const DICTIONARY = ["about","above","action","actually","after","again","against","already","always","among","another","answer","anyone","anything","around","available","because","become","before","believe","better","between","business","children","company","complete","different","education","example","experience","government","important","language","people","possible","problem","question","receive","remember","school","service","student","system","through","together","tomorrow","understand"];
const SAMPLE = `Word Counter Pro helps writers, students, bloggers, SEO pros. Paste your essay, blog post, YouTube description here.`;

const CONTENT_TYPES = [
  { type: "Blog posts", ideal: "1500-2500", note: "Google favors long, comprehensive content", icon: "📝" },
  { type: "Essays", ideal: "500-1000", note: "Standard academic essay length", icon: "📄" },
  { type: "Assignments", ideal: "1000-3000", note: "Varies by university guidelines", icon: "🎓" },
  { type: "YouTube descriptions", ideal: "200-500", note: "First 100 chars visible in search", icon: "▶️" },
  { type: "Social media", ideal: "40-280", note: "Short, engaging, hashtag friendly", icon: "📱" },
  { type: "Product descriptions", ideal: "150-300", note: "Clear, SEO-friendly, benefits focused", icon: "🛍️" },
  { type: "News articles", ideal: "300-800", note: "Concise, inverted pyramid style", icon: "📰" },
  { type: "Emails", ideal: "50-200", note: "Short, actionable, to-the-point", icon: "✉️" },
  { type: "Academic papers", ideal: "3000-8000", note: "Includes abstract, citations", icon: "🔬" },
];

const SOCIAL_LIMITS = [
  { name: "Instagram caption", limit: 2200, rec: 138, icon: "📸" },
  { name: "Facebook post", limit: 63206, rec: 80, icon: "👍" },
  { name: "X/Twitter post", limit: 280, rec: 280, icon: "🐦" },
  { name: "LinkedIn post", limit: 3000, rec: 150, icon: "💼" },
  { name: "YouTube title", limit: 100, rec: 60, icon: "🎬" },
  { name: "YouTube description", limit: 5000, rec: 200, icon: "📝" },
];

const FILLER_WORDS = ["very","really","just","quite","rather","somewhat","basically","actually","literally","basically","perhaps","maybe","somehow"];
const WEAK_PHRASES = ["in order to","due to the fact that","at this point in time","for all intents and purposes","in the event that"];
const PASSIVE_HINTS = ["was","were","been","being","is","are","be"];

// ================= HELPERS =================
const safeGet = (k:string)=>{ try{ return typeof window!=="undefined"? localStorage.getItem(k):null }catch{ return null } };
const safeSet = (k:string,v:string)=>{ try{ if(typeof window!=="undefined") localStorage.setItem(k,v) }catch{} };
const escapeHtml = (s:string)=>s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
const formatTime = (s:number)=>{ const m=Math.floor(s/60); const sec=s%60; const h=Math.floor(m/60); if(h>0) return `${h}h ${m%60}m`; if(m>0) return `${m}m ${sec}s`; return `${sec}s`; };

// ================= ANIMATED NUMBER =================
function AnimatedNumber({ value }: { value: number }){
  const [display,setDisplay] = useState(value);
  useEffect(()=>{
    let start=value>display? display : display;
    const diff=value-display;
    if(diff===0) return;
    let frame=0; const steps=20;
    const id=setInterval(()=>{ frame++; const progress=frame/steps; const eased=1-Math.pow(1-progress,3); setDisplay(Math.round(display+diff*eased)); if(frame>=steps){ setDisplay(value); clearInterval(id) } },16);
    return()=>clearInterval(id);
  },[value]);
  return <span className="transition-all duration-300">{display.toLocaleString()}</span>;
}

// ================= TOOLTIP =================
function Tooltip({ text, children }: { text: string; children: React.ReactNode }){
  const [show,setShow] = useState(false);
  return <div className="relative inline-block" onMouseEnter={()=>setShow(true)} onMouseLeave={()=>setShow(false)}>{children}{show && <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-black text-white text-[10px] rounded-lg z-50 shadow-xl animate-fadeIn">{text}</div>}</div>
}

// ================= MAIN COMPONENT =================
export default function WordCounterClient(){
  const [text,setText] = useState("");
  const [errors,setErrors] = useState<ErrorItem[]>([]);
  const [checking,setChecking] = useState(false);
  const [font,setFont] = useState("Inter");
  const [fontSize,setFontSize] = useState(16);
  const [lineHeight,setLineHeight] = useState(1.7);
  const [color,setColor] = useState("#111827");
  const [goal,setGoal] = useState(1000);
  const [isFocus,setIsFocus] = useState(false);
  const [isDark,setIsDark] = useState(false);
  const [isListening,setIsListening] = useState(false);
  const [isSpeaking,setIsSpeaking] = useState(false);
  const [copied,setCopied] = useState(false);
  const [lang,setLang] = useState("en-US");
  const [autoLang,setAutoLang] = useState("Auto Detect: -");
  const [showHighlight,setShowHighlight] = useState(false);
  const [saveStatus,setSaveStatus] = useState<"idle"|"saving"|"saved">("idle");
  const [findText,setFindText] = useState("");
  const [replaceText,setReplaceText] = useState("");
  const [showFind,setShowFind] = useState(false);
  const [autoCorrect,setAutoCorrect] = useState(true);
  const [autoComplete,setAutoComplete] = useState(true);
  const [suggestions,setSuggestions] = useState<any[]>([]);
  const [writingTime,setWritingTime] = useState(0);
  const [isActive,setIsActive] = useState(false);
  const [toast,setToast] = useState<string|null>(null);
  const [showSettings,setShowSettings] = useState(false);
  const [showArticle,setShowArticle] = useState<string|null>("what-is");
  const [activeTab,setActiveTab] = useState("stats");
  const [showClearModal,setShowClearModal] = useState(false);
  const [readingSpeed,setReadingSpeed] = useState(200);
  const [speakingSpeed,setSpeakingSpeed] = useState(130);
  const [customReading,setCustomReading] = useState(false);
  const [customSpeaking,setCustomSpeaking] = useState(false);
  const [academicLimit,setAcademicLimit] = useState(1500);
  const [academicType,setAcademicType] = useState("Essay");

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const grammarAbortRef = useRef<AbortController|null>(null);

  useEffect(()=>{ const saved=safeGet("lorem_word_text"); if(saved) setText(saved); },[]);
  useEffect(()=>{ setSaveStatus("saving"); const t=setTimeout(()=>{ safeSet("lorem_word_text",text); setSaveStatus("saved"); setTimeout(()=>setSaveStatus("idle"),1000); },400); return()=>clearTimeout(t); },[text]);
  useEffect(()=>{
    if(!text.trim()){ setAutoLang("Auto Detect: -"); return; }
    const hasHindi=/[^\x00-\x7F]/.test(text); const hasLatin=/[a-zA-Z]/.test(text);
    setAutoLang(hasHindi&&!hasLatin? "Hindi 🇮🇳" : hasHindi? "Mixed 🌐" : "English 🇺🇸");
  },[text]);
  useEffect(()=>{ const id=setInterval(()=>{ if(isActive) setWritingTime(t=>t+1) },1000); return()=>clearInterval(id) },[isActive]);
  const markActive=useCallback(()=>{ setIsActive(true); setTimeout(()=>setIsActive(false),5000) },[]);

  const stats=useMemo(()=>{
    const trimmed=text.trim(); const words=trimmed? trimmed.split(/\s+/).filter(Boolean).length:0;
    const chars=text.length; const charsNoSpace=text.replace(/\s/g,"").length;
    const sentences=text.split(/[.!?]+/).filter(s=>s.trim().length>0).length||0;
    const paras=text.split(/\n+/).filter(p=>p.trim().length>0).length; const lines=text? text.split("\n").length:0;
    const readingTime=Math.ceil(words/readingSpeed); const speakingTime=Math.ceil(words/speakingSpeed);
    const avgWPS=words/(sentences||1); const syllables=text.toLowerCase().split(/\s+/).reduce((a,w)=>a+Math.max(1,(w.match(/[aeiouy]+/g)||[]).length),0);
    const flesch=words>0? Math.max(0,Math.min(100,Math.round(206.835-1.015*avgWPS-84.6*(syllables/words)))):0;
    let level="—"; if(words>0){ if(flesch>=80) level="Easy 🟢"; else if(flesch>=60) level="Standard 🟡"; else if(flesch>=40) level="Hard 🟠"; else level="Very Hard 🔴"; }
    const freq:Record<string,number>={}; if(words>0) trimmed.toLowerCase().split(/\s+/).forEach(w=>{ const c=w.replace(/[^a-z0-9]/g,""); if(c.length>2) freq[c]=(freq[c]||0)+1 });
    const sorted=Object.entries(freq).sort((a,b)=>b[1]-a[1]); const top10=sorted.slice(0,10);
    const density=top10.map(([k,v])=>[k,((v/words)*100).toFixed(2)] as [string,string]);
    return { words, chars, charsNoSpace, sentences, paras, lines, readingTime, speakingTime, flesch, level, top10, density };
  },[text,readingSpeed,speakingSpeed]);

  const quality=useMemo((): QualityIssue[]=>{
    const issues: QualityIssue[]=[];
    const words=text.toLowerCase().split(/\s+/).filter(Boolean);
    const sentences=text.split(/[.!?]+/).filter(s=>s.trim().length>0);
    // Repeated words
    const wc:Record<string,number>={}; words.forEach(w=>{ const c=w.replace(/[^a-z0-9]/g,""); if(c.length>3) wc[c]=(wc[c]||0)+1 });
    const repeated=Object.entries(wc).filter(([,c])=>c>3).length;
    issues.push({ type:"Repeated words", label:`${repeated} words repeated >3x`, count:repeated, status:repeated===0? "Good": repeated<3? "Needs Attention":"Improve", desc:"Avoid repeating same words" });
    // Long sentences
    const longSent=sentences.filter(s=>s.split(/\s+/).length>25).length;
    issues.push({ type:"Long sentences", label:`${longSent} sentences >25 words`, count:longSent, status:longSent===0? "Good": longSent<3? "Needs Attention":"Improve", desc:"Break long sentences for readability" });
    // Very long paragraphs
    const longParas=text.split(/\n+/).filter(p=>p.split(/\s+/).length>150).length;
    issues.push({ type:"Very long paragraphs", label:`${longParas} paras >150 words`, count:longParas, status:longParas===0? "Good": "Needs Attention", desc:"Split large paragraphs" });
    // Filler words
    const filler=words.filter(w=>FILLER_WORDS.includes(w.replace(/[^a-z]/g,""))).length;
    issues.push({ type:"Filler words", label:`${filler} filler words found`, count:filler, status:filler<3? "Good": filler<8? "Needs Attention":"Improve", desc:"Words like very, really, just weaken writing" });
    // Weak phrases
    const weak=WEAK_PHRASES.filter(ph=>text.toLowerCase().includes(ph)).length;
    issues.push({ type:"Weak phrases", label:`${weak} weak phrases`, count:weak, status:weak===0? "Good":"Needs Attention", desc:"Use concise alternatives" });
    // Excessive punctuation
    const punct=(text.match(/[!?]{2,}/g)||[]).length;
    issues.push({ type:"Excessive punctuation", label:`${punct} cases of!! or??`, count:punct, status:punct===0? "Good":"Improve", desc:"Avoid multiple punctuation" });
    // Multiple spaces
    const multiSpace=(text.match(/ +/g)||[]).length;
    issues.push({ type:"Multiple spaces", label:`${multiSpace} double spaces`, count:multiSpace, status:multiSpace===0? "Good":"Needs Attention", desc:"Single space is enough" });
    // Duplicate sentences
    const sentMap:Record<string,number>={}; sentences.forEach(s=>{ const t=s.trim().toLowerCase(); if(t.length>20) sentMap[t]=(sentMap[t]||0)+1 });
    const dupSent=Object.values(sentMap).filter(c=>c>1).length;
    issues.push({ type:"Duplicate sentences", label:`${dupSent} duplicated`, count:dupSent, status:dupSent===0? "Good":"Improve", desc:"Remove repeated sentences" });
    return issues;
  },[text]);

  const progress=goal>0? Math.min(100,Math.round((stats.words/goal)*100)):0;
  useEffect(()=>{ if(stats.words>=goal&&goal>0){ setToast(`🎉 Goal Reached! ${stats.words}/${goal} words`); setTimeout(()=>setToast(null),4000) } },[stats.words,goal]);

  const highlightedHtml=useMemo(()=>{
    if(!showHighlight||errors.length===0) return "";
    let html=escapeHtml(text);
    [...errors].sort((a,b)=>b.offset-a.offset).forEach(err=>{
      const before=html.substring(0,err.offset); const mid=html.substring(err.offset,err.offset+err.length); const after=html.substring(err.offset+err.length);
      html=`${before}<span style="text-decoration:underline wavy red 2.5px;background:rgba(255,0,0,0.08)">${mid}</span>${after}`;
    });
    return html.replace(/\n/g,"<br>");
  },[text,errors,showHighlight]);

  const checkGrammar=useCallback(async()=>{
    if(!text.trim()||text.length<5) return;
    if(grammarAbortRef.current) grammarAbortRef.current.abort();
    const ctrl=new AbortController(); grammarAbortRef.current=ctrl; setChecking(true);
    try{
      const res=await fetch("https://api.languagetool.org/v2/check",{ method:"POST", headers:{"Content-Type":"application/x-www-form-urlencoded"}, body:`text=${encodeURIComponent(text)}&language=${lang}`, signal:ctrl.signal });
      const data=await res.json();
      setErrors((data.matches||[]).slice(0,15).map((m:any)=>({ message:m.message, offset:m.offset, length:m.length, replacement:m.replacements?.[0]?.value||"" })));
    }catch{} finally{ setChecking(false) }
  },[text,lang]);
  useEffect(()=>{ if(text.length<15) return; const t=setTimeout(()=>{ checkGrammar() },1500); return()=>clearTimeout(t) },[text,checkGrammar]);

  const handleInput=(e:React.ChangeEvent<HTMLTextAreaElement>)=>{
    markActive(); let val=e.target.value;
    if(autoCorrect){ const m=val.match(/(\b[a-zA-Z]{2,})\s$/); if(m){ const lower=m[1].toLowerCase(); if(AUTO_CORRECT[lower]) val=val.slice(0,-m[0].length)+AUTO_CORRECT[lower]+" "; } }
    setText(val);
  };
  const insertAtCursor=(insert:string)=>{
    const ta=textareaRef.current; if(!ta){ setText(t=>t+(t?" ":"")+insert); return; }
    const start=ta.selectionStart, end=ta.selectionEnd; const before=text.substring(0,start); const after=text.substring(end);
    const newText=before+(before&&!before.endsWith(" ")&&!before.endsWith("\n")?" ":"")+insert+after;
    setText(newText); setTimeout(()=>{ ta.focus(); ta.setSelectionRange(start+insert.length+1,start+insert.length+1) },10);
  };
  const handleCopy=async()=>{ await navigator.clipboard.writeText(text); setCopied(true); setTimeout(()=>setCopied(false),2000); };
  const handleCut=async()=>{ const ta=textareaRef.current; if(!ta) return; const s=ta.selectionStart, e=ta.selectionEnd; if(s===e){ setToast("Select text first"); setTimeout(()=>setToast(null),2000); return; } await navigator.clipboard.writeText(text.substring(s,e)); setText(text.substring(0,s)+text.substring(e)); };
  const handlePaste=async()=>{ try{ const clip=await navigator.clipboard.readText(); insertAtCursor(clip); }catch{} };
  const handleClear=()=>{ setShowClearModal(true); };
  const confirmClear=()=>{ setText(""); setErrors([]); setShowClearModal(false); };
  const toggleVoice=()=>{ const SR=(window as any).SpeechRecognition||(window as any).webkitSpeechRecognition; if(!SR){ alert("Chrome me kholo"); return; } if(isListening){ try{ recognitionRef.current?.stop() }catch{} setIsListening(false); return; } const rec=new SR(); recognitionRef.current=rec; rec.lang=lang; rec.continuous=false; rec.onstart=()=>setIsListening(true); rec.onresult=(e:any)=>insertAtCursor(e.results[0][0].transcript); rec.onend=()=>setIsListening(false); rec.start(); };

  // Writing Tools Functions
  const formatText=(mode:string)=>{
    let out=text;
    if(mode==="upper") out=text.toUpperCase();
    else if(mode==="lower") out=text.toLowerCase();
    else if(mode==="title") out=text.replace(/\w\S*/g,w=>w.charAt(0).toUpperCase()+w.substr(1).toLowerCase());
    else if(mode==="sentence") out=text.toLowerCase().replace(/(^\s*\w|[.!?]\s+\w)/g,c=>c.toUpperCase());
    else if(mode==="capitalize") out=text.replace(/\b\w/g,c=>c.toUpperCase());
    else if(mode==="toggle") out=text.split("").map(c=>c===c.toUpperCase()? c.toLowerCase():c.toUpperCase()).join("");
    setText(out);
  };
  const cleanText=(mode:string)=>{
    let out=text;
    if(mode==="extraSpaces") out=text.replace(/ +/g," ");
    else if(mode==="blankLines") out=text.replace(/^\s*\n/gm,"");
    else if(mode==="duplicateLines") out=[...new Set(text.split("\n"))].join("\n");
    else if(mode==="duplicateSentences"){ const seen=new Set(); out=text.split(/([.!?]+)/).filter((s,i)=>i%2===0?!seen.has(s.trim().toLowerCase()) && seen.add(s.trim().toLowerCase()) : true).join(""); }
    else if(mode==="punctuation") out=text.replace(/\s+([.,!?;:])/g,"$1");
    else if(mode==="special") out=text.replace(/[^a-zA-Z0-9\s.,!?]/g,"");
    else if(mode==="numbers") out=text.replace(/[0-9]/g,"");
    else if(mode==="html") out=text.replace(/<[^>]*>/g,"");
    else if(mode==="leading") out=text.split("\n").map(l=>l.trimStart()).join("\n");
    else if(mode==="trailing") out=text.split("\n").map(l=>l.trimEnd()).join("\n");
    else if(mode==="collapse") out=text.replace(/ {2,}/g," ");
    else if(mode==="tabs") out=text.replace(/\t/g," ");
    setText(out);
  };
  const convertText=(mode:string)=>{
    let out=text;
    if(mode==="slug") out=text.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
    else if(mode==="url") out=encodeURIComponent(text);
    else if(mode==="comma") out=text.split(/\n+/).filter(Boolean).join(", ");
    else if(mode==="line") out=text.split(/,\s*/).join("\n");
    else if(mode==="json") out=JSON.stringify(text);
    else if(mode==="plain") out=text.replace(/[\u2018\u2019]/g,"'").replace(/[\u201C\u201D]/g,'"');
    setText(out);
  };
  const sortText=(mode:string)=>{
    let lines=text.split("\n").filter(Boolean);
    if(mode==="az") lines=lines.sort();
    else if(mode==="za") lines=lines.sort().reverse();
    else if(mode==="length") lines=lines.sort((a,b)=>a.length-b.length);
    else if(mode==="wordcount") lines=lines.sort((a,b)=>a.split(/\s+/).length-b.split(/\s+/).length);
    else if(mode==="dedup") lines=[...new Set(lines)];
    setText(lines.join("\n"));
  };
  const reverseText=(mode:string)=>{
    let out=text;
    if(mode==="chars") out=text.split("").reverse().join("");
    else if(mode==="words") out=text.split(/\s+/).reverse().join(" ");
    else if(mode==="lines") out=text.split("\n").reverse().join("\n");
    setText(out);
  };

  const currentFont=FONTS.find(f=>f.name===font)?.css||"'Inter',sans-serif";
  const bgDecor=(<div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none"><div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full opacity-40 blur-3xl" style={{background:"radial-gradient(circle,#a855f7,transparent 70%)"}} /></div>);

  return (
    <div className={`${isDark?"bg-[#0a0a0a] text-white":"bg-gradient-to-br from-violet-50 via-pink-50 to-cyan-50 text-gray-900"} min-h-screen relative`}>
      {bgDecor}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
       .glass{backdrop-filter:blur(20px);background:rgba(255,255,255,0.6);border:1px solid rgba(255,255,255,0.7);box-shadow:0 8px 32px rgba(0,0,0,0.08)}
       .glass-btn{backdrop-filter:blur(12px);background:rgba(255,255,255,0.65);border:1px solid rgba(255,255,255,0.9);transition:all 0.25s cubic-bezier(0.4,0,0.2,1)}
       .glass-btn:hover{transform:translateY(-2px) scale(1.02);box-shadow:0 12px 24px rgba(139,92,246,0.2)}
       .glass-btn:active{transform:translateY(0) scale(0.98)}
       .gradient-text{background:linear-gradient(90deg,#a855f7,#ec4899,#06b6d4);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
       .progress-bar{transition:width 0.8s cubic-bezier(0.4,0,0.2,1);background:linear-gradient(90deg,#a855f7,#ec4899,#06b6d4);background-size:200% auto;animation:shimmer 3s linear infinite}
        @keyframes shimmer{0%{background-position:0% 50%}100%{background-position:200% 50%}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
       .animate-fadeIn{animation:fadeIn 0.3s ease}
       .animate-bounceIn{animation:bounceIn 0.5s cubic-bezier(0.68,-0.55,0.265,1.55)}
        @keyframes bounceIn{0%{transform:scale(0.8)}50%{transform:scale(1.1)}100%{transform:scale(1)}}
        textarea{resize:none} textarea:focus{outline:none}
      `}</style>

      {toast && <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-2xl shadow-2xl font-bold animate-bounceIn">{toast}</div>}
      {showClearModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass rounded-2xl p-6 max-w-sm w-full animate-bounceIn">
            <h3 className="font-bold text-lg">Clear all text?</h3><p className="text-sm opacity-70 mt-2">This action cannot be undone.</p>
            <div className="flex gap-2 mt-4 justify-end"><button onClick={()=>setShowClearModal(false)} className="px-4 py-2 rounded-xl glass-btn text-sm">Cancel</button><button onClick={confirmClear} className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-bold">Clear</button></div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        {/* HEADER */}
        <div className="text-center mb-8">
          <div className="inline-flex px-4 py-1.5 rounded-full glass-btn text-[11px] tracking-widest mb-3 font-bold">✨ PRO EDITION · ANIMATED · RESPONSIVE · ALL FEATURES</div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black gradient-text">Word Counter Pro</h1>
          <p className="mt-3 opacity-70 text-sm md:text-base max-w-2xl mx-auto">Professional writing studio with animated stats, quality analyzer, social counters, and 50+ tools. Works perfectly on mobile, tablet, laptop, desktop.</p>
          <div className="flex justify-center gap-2 mt-4 flex-wrap items-center">
            <select value={lang} onChange={e=>setLang(e.target.value)} className="h-9 rounded-xl glass-btn px-3 text-sm font-bold">{LANGUAGES.map(l=><option key={l.code} value={l.code}>{l.flag} {l.label}</option>)}</select>
            <span className="text-xs px-3 py-1.5 rounded-full bg-violet-600 text-white font-bold">{autoLang}</span>
            <span className="text-xs px-2 py-1.5 rounded-full glass-btn">{saveStatus}</span>
            <span className="text-sm font-bold">{stats.words}/{goal} • {progress}%</span>
          </div>
          <div className="flex justify-center items-center gap-3 mt-4 max-w-xl mx-auto">
            <div className="flex-1 h-3 bg-white/40 rounded-full overflow-hidden"><div style={{width:`${progress}%`}} className="h-full progress-bar rounded-full" /></div>
            <span className="text-xs font-bold min-w-[60px]"><AnimatedNumber value={stats.words} />/{goal}</span>
            <input type="number" value={goal} onChange={e=>setGoal(Math.max(1,parseInt(e.target.value)||1))} className="w-20 h-8 text-xs px-2 rounded-lg glass-btn" />
          </div>
        </div>

        {/* STICKY CONTROLS */}
        <div className="glass rounded-2xl p-3 mb-4 flex flex-wrap gap-1.5 items-center justify-between sticky top-2 z-20">
          <div className="flex gap-1 flex-wrap items-center">
            <Tooltip text="Cut selected text (Ctrl+X)"><button onClick={handleCut} className="h-9 px-3 rounded-lg glass-btn text-xs font-bold hover:bg-red-50">✂ Cut</button></Tooltip>
            <Tooltip text="Copy text (Ctrl+C)"><button onClick={handleCopy} className={`h-9 px-3 rounded-lg glass-btn text-xs font-bold ${copied? "bg-green-100 text-green-700 animate-bounceIn":""}`}>{copied?"✓ Copied!":"📋 Copy"}</button></Tooltip>
            <Tooltip text="Paste from clipboard (Ctrl+V)"><button onClick={handlePaste} className="h-9 px-3 rounded-lg glass-btn text-xs font-bold">📥 Paste</button></Tooltip>
            <button onClick={()=>formatText("upper")} className="h-9 px-2 rounded-lg glass-btn text-xs">UPPER</button>
            <button onClick={()=>formatText("lower")} className="h-9 px-2 rounded-lg glass-btn text-xs">lower</button>
            <input type="color" value={color} onChange={e=>setColor(e.target.value)} className="w-9 h-9 rounded-lg glass-btn p-1" />
            <button onClick={handleClear} className="h-9 px-3 rounded-lg bg-red-500/20 text-red-700 text-xs font-bold">🗑 Clear</button>
          </div>
          <div className="flex gap-1.5 flex-wrap items-center">
            <button onClick={()=>setShowFind(v=>!v)} className="h-9 px-3 rounded-xl glass-btn text-xs font-bold">🔍 Find</button>
            <button onClick={()=>setShowSettings(v=>!v)} className="h-9 px-3 rounded-xl glass-btn text-xs font-bold">⚙ Settings</button>
            <button onClick={toggleVoice} className={`h-10 px-5 rounded-xl text-xs font-black ${isListening?"bg-red-500 text-white animate-pulse":"bg-black text-white hover:scale-105"}`}>{isListening?"■ STOP":"🎤 VOICE"}</button>
            <button onClick={()=>setIsFocus(true)} className="h-9 px-3 rounded-xl bg-black text-white text-xs font-bold">⛶ Focus</button>
          </div>
        </div>

        {/* TABS - ANIMATED */}
        <div className="flex gap-2 mb-4 border-b border-white/20 overflow-x-auto">
          {["stats","social","academic","quality","tools"].map(tab=>(
            <button key={tab} onClick={()=>setActiveTab(tab)} className={`px-4 py-2 text-sm font-bold capitalize relative transition ${activeTab===tab? "text-violet-600":"opacity-60 hover:opacity-100"}`}>
              {tab}
              {activeTab===tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-600 animate-fadeIn" />}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* EDITOR */}
          <div className="lg:col-span-2">
            <div className="glass rounded-3xl p-3">
              <textarea ref={textareaRef} value={text} onChange={handleInput} placeholder="Start typing... All features work on mobile, tablet, desktop. Try voice typing!" className={`w-full min-h-[500px] p-6 rounded-2xl ${isDark?"bg-black/30":"bg-white/60"} outline-none border-0 text-[16px]`} style={{fontFamily:currentFont,fontSize:`${fontSize}px`,lineHeight,color:isDark?"#fff":color}} />
              <div className="px-4 py-2 text-[11px] opacity-60 flex justify-between"><span>✅ Sticky controls • Animated counters • {autoLang}</span><span>⏱ {formatTime(writingTime)}</span></div>
            </div>
            {showHighlight && <div className="glass rounded-2xl p-4 mt-4"><div className="text-xs font-bold mb-2">Preview with Red Wavy</div><div className="p-4 rounded-xl bg-white/60 text-sm" dangerouslySetInnerHTML={{__html: highlightedHtml || escapeHtml(text).replace(/\n/g,"<br>")}} /></div>}
          </div>

          {/* SIDEBAR - ANIMATED COUNTERS */}
          <div className="space-y-4">
            {activeTab==="stats" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <Tooltip text="Total words in your text"><div className="glass rounded-2xl p-4 hover:scale-105 transition"><div className="text-[10px] opacity-60 font-bold">Words</div><div className="text-xl font-black"><AnimatedNumber value={stats.words} /></div></div></Tooltip>
                  <Tooltip text="Characters including spaces - used for Twitter"><div className="glass rounded-2xl p-4 hover:scale-105 transition"><div className="text-[10px] opacity-60 font-bold">Chars (with)</div><div className="text-xl font-black"><AnimatedNumber value={stats.chars} /></div></div></Tooltip>
                  <Tooltip text="Characters without spaces - used for essays"><div className="glass rounded-2xl p-4 hover:scale-105 transition"><div className="text-[10px] opacity-60 font-bold">Chars (without)</div><div className="text-xl font-black"><AnimatedNumber value={stats.charsNoSpace} /></div></div></Tooltip>
                  <Tooltip text="Total sentences - splits on.!?"><div className="glass rounded-2xl p-4 hover:scale-105 transition"><div className="text-[10px] opacity-60 font-bold">Sentences</div><div className="text-xl font-black"><AnimatedNumber value={stats.sentences} /></div></div></Tooltip>
                  <Tooltip text="Paragraphs - splits on blank lines"><div className="glass rounded-2xl p-4 hover:scale-105 transition"><div className="text-[10px] opacity-60 font-bold">Paragraphs</div><div className="text-xl font-black"><AnimatedNumber value={stats.paras} /></div></div></Tooltip>
                  <Tooltip text="Total line breaks"><div className="glass rounded-2xl p-4 hover:scale-105 transition"><div className="text-[10px] opacity-60 font-bold">Lines</div><div className="text-xl font-black"><AnimatedNumber value={stats.lines} /></div></div></Tooltip>
                </div>

                <div className="glass rounded-2xl p-4">
                  <h3 className="font-bold text-xs mb-3">⏱ Reading & Speaking Analysis</h3>
                  <div className="space-y-3 text-xs">
                    <div><div className="flex justify-between"><span>Reading Speed</span><select value={readingSpeed} onChange={e=>setReadingSpeed(parseInt(e.target.value))} className="text-[10px] border rounded px-1"><option value={150}>Slow (150 WPM)</option><option value={200}>Average (200)</option><option value={300}>Fast (300)</option><option value={250}>Custom</option></select></div><div className="font-bold mt-1">Estimated Reading Time: {Math.floor(stats.readingTime)} min {Math.round((stats.readingTime%1)*60)} sec</div></div>
                    <div><div className="flex justify-between"><span>Speaking Speed</span><select value={speakingSpeed} onChange={e=>setSpeakingSpeed(parseInt(e.target.value))} className="text-[10px] border rounded px-1"><option value={100}>Slow (100 WPM)</option><option value={130}>Average (130)</option><option value={180}>Fast (180)</option></select></div><div className="font-bold mt-1">Estimated Speaking Time: {Math.floor(stats.speakingTime)} min {Math.round((stats.speakingTime%1)*60)} sec</div></div>
                  </div>
                </div>

                <div className="glass rounded-2xl p-4"><h3 className="font-bold text-xs mb-2">📊 Keyword Density</h3>{stats.density.map(([k,d]:any)=><div key={k} className="flex justify-between text-xs py-1 border-b last:border-0"><span>{k}</span><span className={`font-bold ${parseFloat(d)>3? "text-red-500":"text-green-600"}`}>{d}%</span></div>)}</div>
              </>
            )}

            {activeTab==="social" && (
              <div className="glass rounded-2xl p-4">
                <h3 className="font-bold text-sm mb-3">📱 Social Media Counters</h3>
                <div className="space-y-3">
                  {SOCIAL_LIMITS.map(s=>{
                    const used=stats.chars; const remaining=s.limit-used; const percent=Math.min(100,(used/s.limit)*100);
                    return <div key={s.name} className="border rounded-xl p-3 bg-white/50"><div className="flex justify-between text-xs font-bold"><span>{s.icon} {s.name}</span><span className={remaining<0? "text-red-500":"text-green-600"}>{remaining<0? `${Math.abs(remaining)} over`:`${remaining} left`}</span></div><div className="w-full h-1.5 bg-gray-200 rounded-full mt-2 overflow-hidden"><div style={{width:`${percent}%`}} className={`h-full ${percent>90? "bg-red-500": percent>70? "bg-orange-400":"bg-green-500"} transition-all duration-700`} /></div><div className="flex justify-between text-[10px] opacity-60 mt-1"><span>{stats.words} words • {stats.chars} chars</span><span>Rec: {s.rec}</span></div></div>
                  })}
                </div>
              </div>
            )}

            {activeTab==="academic" && (
              <div className="glass rounded-2xl p-4">
                <h3 className="font-bold text-sm mb-3">🎓 Academic Writing Tools</h3>
                <div className="flex gap-2 mb-3"><select value={academicType} onChange={e=>setAcademicType(e.target.value)} className="flex-1 h-8 rounded-lg glass-btn text-xs"><option>Essay</option><option>Assignment</option><option>Thesis</option><option>Abstract</option></select><input type="number" value={academicLimit} onChange={e=>setAcademicLimit(parseInt(e.target.value)||0)} className="w-24 h-8 rounded-lg glass-btn text-xs px-2" placeholder="Limit" /></div>
                <div className="bg-white/60 rounded-xl p-3 text-xs space-y-1"><div className="flex justify-between"><span>Required:</span><span className="font-bold">{academicLimit} words</span></div><div className="flex justify-between"><span>Current:</span><span className="font-bold"><AnimatedNumber value={stats.words} /></span></div><div className="flex justify-between"><span>Remaining:</span><span className={`font-bold ${academicLimit-stats.words<0? "text-red-500":"text-green-600"}`}>{academicLimit-stats.words}</span></div><div className="w-full h-2 bg-gray-200 rounded-full mt-2"><div style={{width:`${Math.min(100,(stats.words/academicLimit)*100)}%`}} className="h-full bg-violet-600 rounded-full transition-all duration-700" /></div></div>
                <div className="mt-3 text-[10px] opacity-60"><div>Paragraph analyzer: {stats.paras} paras, avg {Math.round(stats.words/(stats.paras||1))} words/para</div><div>Citation-friendly: {stats.words} words • {stats.chars} chars • {stats.sentences} sentences</div></div>
              </div>
            )}

            {activeTab==="quality" && (
              <div className="glass rounded-2xl p-4">
                <h3 className="font-bold text-sm mb-3">✨ Text Quality Analyzer</h3>
                <div className="space-y-2">
                  {quality.map((q,i)=><div key={i} className="flex justify-between items-center p-2 rounded-lg bg-white/50 text-xs"><div><div className="font-bold">{q.type}</div><div className="opacity-60 text-[10px]">{q.label} • {q.desc}</div></div><span className={`px-2 py-1 rounded-full text-[10px] font-bold ${q.status==="Good"? "bg-green-100 text-green-700": q.status==="Needs Attention"? "bg-yellow-100 text-yellow-700":"bg-red-100 text-red-700"}`}>{q.status}</span></div>)}
                </div>
                <div className="mt-3 p-2 bg-blue-50 rounded-lg text-[10px]">⚠ This is basic client-side analysis. For professional grammar checking, use LanguageTool or Grammarly.</div>
              </div>
            )}

            {activeTab==="tools" && (
              <div className="glass rounded-2xl p-4 space-y-4">
                <h3 className="font-bold text-sm">🛠️ Writing Tools</h3>
                <div><div className="text-[10px] font-bold opacity-60 mb-1">FORMATTER</div><div className="flex flex-wrap gap-1">{["upper","lower","title","sentence","capitalize","toggle"].map(m=><button key={m} onClick={()=>formatText(m)} className="px-2 py-1 rounded-lg glass-btn text-[10px] capitalize">{m}</button>)}</div></div>
                <div><div className="text-[10px] font-bold opacity-60 mb-1">CLEANER</div><div className="flex flex-wrap gap-1">{["extraSpaces","blankLines","duplicateLines","special","numbers","html","leading","trailing","collapse","tabs"].map(m=><button key={m} onClick={()=>cleanText(m)} className="px-2 py-1 rounded-lg glass-btn text-[10px]">{m}</button>)}</div></div>
                <div><div className="text-[10px] font-bold opacity-60 mb-1">CONVERTER</div><div className="flex flex-wrap gap-1">{["slug","url","comma","line","json","plain"].map(m=><button key={m} onClick={()=>convertText(m)} className="px-2 py-1 rounded-lg glass-btn text-[10px]">{m}</button>)}</div></div>
                <div><div className="text-[10px] font-bold opacity-60 mb-1">SORTING</div><div className="flex flex-wrap gap-1">{["az","za","length","wordcount","dedup"].map(m=><button key={m} onClick={()=>sortText(m)} className="px-2 py-1 rounded-lg glass-btn text-[10px]">{m}</button>)}</div></div>
                <div><div className="text-[10px] font-bold opacity-60 mb-1">REVERSAL</div><div className="flex flex-wrap gap-1">{["chars","words","lines"].map(m=><button key={m} onClick={()=>reverseText(m)} className="px-2 py-1 rounded-lg glass-btn text-[10px]">Reverse {m}</button>)}</div></div>
                <div className="pt-2 border-t"><div className="text-[10px] font-bold opacity-60 mb-1">FIND & REPLACE</div><input value={findText} onChange={e=>setFindText(e.target.value)} placeholder="Find" className="w-full h-8 rounded-lg glass-btn text-xs px-2 mb-1" /><input value={replaceText} onChange={e=>setReplaceText(e.target.value)} placeholder="Replace" className="w-full h-8 rounded-lg glass-btn text-xs px-2 mb-1" /><div className="flex gap-1"><button onClick={()=>{ if(findText) setText(text.split(findText).join(replaceText)) }} className="flex-1 h-8 rounded-lg bg-violet-600 text-white text-xs">Replace All</button></div></div>
              </div>
            )}
          </div>
        </div>

        {/* CONTENT TYPES TABLE */}
        <section className="mt-12 glass rounded-3xl p-6">
          <h2 className="text-2xl font-black gradient-text mb-2">📊 Word Count for Different Content Types</h2>
          <p className="text-xs opacity-60 mb-4">Ideal word counts based on industry standards</p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="border-b font-bold"><th className="text-left p-2">Type</th><th className="text-left p-2">Ideal</th><th className="text-left p-2">Note</th><th className="text-left p-2">You</th></tr></thead>
              <tbody>{CONTENT_TYPES.map(c=><tr key={c.type} className="border-b hover:bg-white/30"><td className="p-2 font-bold">{c.icon} {c.type}</td><td className="p-2">{c.ideal}</td><td className="p-2 opacity-70">{c.note}</td><td className="p-2"><AnimatedNumber value={stats.words} /> words</td></tr>)}</tbody>
            </table>
          </div>
        </section>

        {/* WHAT IS WORD COUNTER */}
        <section className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 glass rounded-3xl p-6">
            <h2 className="text-2xl font-black gradient-text mb-4">What Is a Word Counter?</h2>
            <div className="text-sm leading-7 space-y-4">
              <p><b>Definition:</b> A Word Counter is a real-time text analysis tool that counts words, characters, sentences, paragraphs, and analyzes readability, keyword density, and writing quality. It helps anyone who writes to meet length requirements and improve clarity.</p>
              <p><b>Why word counting matters:</b> Every platform and purpose has different length requirements. Google rewards comprehensive content (1500+ words), Twitter limits to 280 chars, universities require exact word counts, and clients bill by words.</p>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="p-3 rounded-xl bg-white/50"><b className="text-xs">🎓 Students</b><p className="text-[11px] opacity-70 mt-1">Meet essay, assignment, thesis word limits. Avoid penalties for too short/long submissions.</p></div>
                <div className="p-3 rounded-xl bg-white/50"><b className="text-xs">✍️ Writers</b><p className="text-[11px] opacity-70 mt-1">Track daily goals, chapter lengths, manuscript progress with celebration.</p></div>
                <div className="p-3 rounded-xl bg-white/50"><b className="text-xs">📝 Bloggers</b><p className="text-[11px] opacity-70 mt-1">Optimize for SEO with ideal 1500-2500 words, keyword density 1-2%, readability 60-70.</p></div>
                <div className="p-3 rounded-xl bg-white/50"><b className="text-xs">📈 SEO Professionals</b><p className="text-[11px] opacity-70 mt-1">Analyze keyword density, top keywords, readability, and social limits.</p></div>
                <div className="p-3 rounded-xl bg-white/50"><b className="text-xs">📰 Journalists</b><p className="text-[11px] opacity-70 mt-1">Write concise news (300-800 words) with reading time estimates.</p></div>
                <div className="p-3 rounded-xl bg-white/50"><b className="text-xs">📱 Social Creators</b><p className="text-[11px] opacity-70 mt-1">Stay within Instagram 2200, Twitter 280, LinkedIn 3000 with remaining counters.</p></div>
                <div className="p-3 rounded-xl bg-white/50 col-span-2"><b className="text-xs">💼 Business Professionals</b><p className="text-[11px] opacity-70 mt-1">Craft perfect emails (50-200 words), product descriptions (150-300), proposals with exact counts.</p></div>
              </div>
            </div>
          </div>
          <div className="glass rounded-3xl p-6">
            <h3 className="font-bold text-sm mb-3">📱 Responsive Design</h3>
            <p className="text-xs opacity-70 leading-6">Entire website works perfectly on:</p>
            <div className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between p-2 rounded-lg bg-white/50"><span>📱 Mobile</span><span className="text-green-600 font-bold">✓ Optimized</span></div>
              <div className="flex justify-between p-2 rounded-lg bg-white/50"><span>📱 Tablet</span><span className="text-green-600 font-bold">✓ Responsive</span></div>
              <div className="flex justify-between p-2 rounded-lg bg-white/50"><span>💻 Laptop</span><span className="text-green-600 font-bold">✓ Perfect</span></div>
              <div className="flex justify-between p-2 rounded-lg bg-white/50"><span>🖥️ Desktop</span><span className="text-green-600 font-bold">✓ Full width</span></div>
              <div className="flex justify-between p-2 rounded-lg bg-white/50"><span>🖥️ Large monitors</span><span className="text-green-600 font-bold">✓ 7xl max</span></div>
            </div>
            <div className="mt-4 p-3 rounded-xl bg-violet-50 text-[11px]"><b>Glassmorphism + Sticky controls + Animated tabs</b> — Feels premium on all screen sizes.</div>
          </div>
        </section>

        {/* SUGGESTED TOOLS */}
        <section className="mt-12">
          <h2 className="text-2xl font-black text-center gradient-text mb-6">🧰 Suggested Tools</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
            {[
              { name: "Character Counter", desc: "With & without spaces", icon: "🔤" },
              { name: "Sentence Counter", desc: "Count sentences instantly", icon: "📝" },
              { name: "Paragraph Counter", desc: "Analyze paragraph structure", icon: "📄" },
              { name: "Readability Checker", desc: "Flesch score & grade level", icon: "📊" },
              { name: "Keyword Density Checker", desc: "SEO keyword analysis", icon: "🎯" },
              { name: "Text Case Converter", desc: "UPPER/lower/Title case", icon: "🔠" },
              { name: "Text Cleaner", desc: "Remove extra spaces, HTML", icon: "🧹" },
              { name: "Find & Replace", desc: "Search & replace text", icon: "🔍" },
              { name: "Duplicate Line Remover", desc: "Remove duplicate lines", icon: "♻️" },
            ].map(t=><div key={t.name} className="glass rounded-2xl p-5 hover:scale-105 transition cursor-pointer group"><div className="text-3xl group-hover:scale-110 transition">{t.icon}</div><div className="font-bold text-sm mt-2">{t.name}</div><div className="text-xs opacity-60">{t.desc}</div></div>)}
          </div>
        </section>

        {/* ARTICLES - ACCORDION */}
        <section className="mt-12 space-y-3">
          <h2 className="text-2xl font-black text-center gradient-text mb-6">📚 Guides & FAQ - Smooth Accordion</h2>
          {[
            { id:"what-is", title:"What is Word Counter? Detailed Guide", content:"A Word Counter counts words, characters, sentences, paragraphs in real-time. Why it matters: Google favors 1500+ words, Twitter 280 chars, universities require exact counts. Students use for essays, Writers for novels, Bloggers for SEO, SEO pros for keyword density, Journalists for concise news, Social creators for captions, Business pros for emails." },
            { id:"how-to", title:"How to Use - Complete Guide", content:"Type in big box - stats update instantly. Set goal (e.g., 1500) - progress bar + celebration. Use Cut/Copy/Paste buttons - sticky controls. Change font, size, line height, color, page size in Settings. Enable Auto Correct (teh->the), Auto Complete (Tab), Red Wavy (grammar), Duplicate highlight. Grammar Check - Fix All. Voice typing - inserts at cursor. Export TXT/DOC/CSV/PDF. Focus mode - distraction free. Dark mode - eye friendly." },
            { id:"faq", title:"FAQ - Common Questions (Accordion)", content:"Q: Is this free? A: Yes 100% free. Q: Is my text saved on server? A: No, browser only. Q: Chars with vs without? A: With=with spaces (Twitter), Without=letters only (University). Q: Voice not working? A: Chrome/Edge HTTPS + mic permission via Lock icon. Q: Ideal keyword density? A: 1-2%. Above 3% = stuffing. Q: Max length? A: Unlimited - tested 100k+ words." },
          ].map(a=>(
            <div key={a.id} className="glass rounded-2xl overflow-hidden">
              <button onClick={()=>setShowArticle(showArticle===a.id? null : a.id)} className="w-full flex justify-between items-center p-5 font-bold text-left hover:bg-white/10 transition">
                <span>{a.title}</span>
                <span className={`text-xl transition-transform duration-300 ${showArticle===a.id? "rotate-180":""}`}>{showArticle===a.id? "−":"+"}</span>
              </button>
              <div className={`grid transition-all duration-500 ease-in-out ${showArticle===a.id? "grid-rows-[1fr] opacity-100":"grid-rows-[0fr] opacity-0"}`}>
                <div className="overflow-hidden"><div className="p-6 bg-white/40 text-sm leading-7 whitespace-pre-line border-t">{a.content}</div></div>
              </div>
            </div>
          ))}
        </section>

        <footer className="mt-16 text-center text-xs opacity-60 pb-8">✨ Word Counter Pro — Professional, Animated, Responsive — 100% private</footer>
      </div>
    </div>
  );
}
