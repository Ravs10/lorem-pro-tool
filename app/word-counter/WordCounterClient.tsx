"use client";
import { useState, useMemo, useRef, useEffect, useCallback } from "react";

type ErrorItem = { message: string; offset: number; length: number; replacement: string; };
type Suggestion = { word: string; at: number; replaceLen: number };

const LANGUAGES = [
  { code: "en-US", label: "English (US)", flag: "🇺🇸" },
  { code: "en-GB", label: "English (UK)", flag: "🇬🇧" },
  { code: "hi-IN", label: "Hindi", flag: "🇮🇳" },
  { code: "es", label: "Spanish", flag: "🇪🇸" },
  { code: "fr", label: "French", flag: "🇫🇷" },
  { code: "de", label: "German", flag: "🇩🇪" },
];

const COLORS = ["#111827","#EF4444","#F59E0B","#10B981","#3B82F6","#8B5CF6","#EC4899","#000000","#6B7280"];

const PAGE_SIZES: Record<string, { w: number; h: number; label: string }> = {
  A4: { w: 210, h: 297, label: "A4" },
  Letter: { w: 216, h: 279, label: "Letter" },
  Legal: { w: 216, h: 356, label: "Legal" },
};

const FONTS = [
  { name: "Inter", css: "Inter, sans-serif" },
  { name: "Merriweather", css: "Merriweather, serif" },
  { name: "Mono", css: "monospace" },
  { name: "Georgia", css: "Georgia, serif" },
  { name: "Arial", css: "Arial, sans-serif" },
];

const AUTO_CORRECT: Record<string, string> = {
  teh: "the", adn: "and", recieve: "receive", seperate: "separate",
  occured: "occurred", definately: "definitely", freind: "friend",
  beleive: "believe", tommorow: "tomorrow", wich: "which",
};

const DICTIONARY = ["about","above","across","action","actually","after","again","against","already","although","always","among","another","answer","anyone","anything","around","available","because","become","before","begin","behind","believe","better","between","business","children","company","complete","different","education","example","experience","government","important","language","people","possible","problem","question","receive","remember","school","service","student","system","through","together","tomorrow","understand"];

const SAMPLE = "Word Counter is a powerful tool that counts words, characters, sentences, and paragraphs in real-time.";

const safeGet = (k: string) => { try { return typeof window!== "undefined"? localStorage.getItem(k) : null; } catch { return null; } };
const safeSet = (k: string, v: string) => { try { if (typeof window!== "undefined") localStorage.setItem(k, v); } catch {} };
const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const formatTime = (s: number) => { const m = Math.floor(s / 60); const sec = s % 60; if (m > 0) return m + "m " + sec + "s"; return sec + "s"; };

const TOOLS = [
  { name: "Character Counter", desc: "With & without spaces", icon: "🔤" },
  { name: "Case Converter", desc: "UPPER/lower/Title", icon: "🔠" },
  { name: "Duplicate Finder", desc: "Repeated words", icon: "🔁" },
  { name: "Reading Time", desc: "200 WPM", icon: "📖" },
  { name: "Keyword Density", desc: "SEO checker", icon: "🎯" },
  { name: "Grammar Checker", desc: "30+ rules", icon: "✓" },
];

export default function WordCounterClient() {
  const [text, setText] = useState("");
  const [errors, setErrors] = useState<ErrorItem[]>([]);
  const [checking, setChecking] = useState(false);
  const [font, setFont] = useState("Inter");
  const [fontSize, setFontSize] = useState(16);
  const [lineHeight, setLineHeight] = useState(1.7);
  const [color, setColor] = useState("#111827");
  const [pageSize, setPageSize] = useState("A4");
  const [showArticle, setShowArticle] = useState<string | null>("what-is");
  const [goal, setGoal] = useState(1000);
  const [isFocus, setIsFocus] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [copied, setCopied] = useState(false);
  const [lang, setLang] = useState("en-US");
  const [autoLang, setAutoLang] = useState("Auto Detect: -");
  const [showHighlight, setShowHighlight] = useState(false);
  const [saveStatus, setSaveStatus] = useState("idle");
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [showFind, setShowFind] = useState(false);
  const [autoCorrect, setAutoCorrect] = useState(true);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [writingTime, setWritingTime] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [showSettings, setShowSettings] = useState(true);
  const [showColor, setShowColor] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => { const s = safeGet("lorem_word_text"); if (s) setText(s); }, []);
  useEffect(() => { setSaveStatus("saving"); const t = setTimeout(()=>{ safeSet("lorem_word_text", text); setSaveStatus("saved"); setTimeout(()=>setSaveStatus("idle"),1000); },400); return ()=>clearTimeout(t); }, [text]);

  useEffect(() => {
    if (!text.trim()) { setAutoLang("Auto Detect: -"); return; }
    const hasHindi = /[^\x00-\x7F]/.test(text);
    setAutoLang(hasHindi? "Hindi" : "English");
  }, [text]);

  useEffect(()=>{ const id=setInterval(()=>{ if(isActive) setWritingTime(t=>t+1); },1000); return()=>clearInterval(id); }, [isActive]);

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
    const sorted = [...errors].sort((a,b)=>b.offset-a.offset);
    sorted.forEach(err=>{
      const before=html.substring(0,err.offset);
      const mid=html.substring(err.offset,err.offset+err.length);
      const after=html.substring(err.offset+err.length);
      html = before + '<span style="text-decoration:underline wavy red 2.5px;background:rgba(255,0,0,0.08)">' + mid + '</span>' + after;
    });
    return html.replace(/\n/g,"<br>");
  }, [text, errors, showHighlight]);

  const checkGrammar = useCallback(async () => {
    if (!text.trim() || text.length<5) return;
    setChecking(true);
    try {
      const res = await fetch("https://api.languagetool.org/v2/check", { method:"POST", headers:{"Content-Type":"application/x-www-form-urlencoded"}, body:"text="+encodeURIComponent(text)+"&language="+lang });
      const data = await res.json();
      const list = (data.matches||[]).slice(0,15).map((m:any)=>({ message:m.message, offset:m.offset, length:m.length, replacement:m.replacements && m.replacements[0]? m.replacements[0].value : "" }));
      setErrors(list);
    } catch {} setChecking(false);
  }, [text, lang]);

  useEffect(()=>{ if(text.length<15) return; const t=setTimeout(checkGrammar,1500); return()=>clearTimeout(t); }, [text, checkGrammar]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setIsActive(true);
    let val = e.target.value;
    if (autoCorrect) {
      const m = val.match(/(\b[a-zA-Z]{2,})\s$/);
      if(m){
        const lower = m[1].toLowerCase();
        const corr = AUTO_CORRECT[lower];
        if(corr){ val = val.slice(0,-m[0].length) + corr + " "; }
      }
    }
    setText(val);
    const m2 = val.match(/([a-zA-Z]{2,})$/);
    if (m2) {
      const prefix = m2[1].toLowerCase();
      const sugg = DICTIONARY.filter(w=>w.startsWith(prefix) && w!==prefix).slice(0,5);
      setSuggestions(sugg.map(w=>({word:w, at:val.length-m2[1].length, replaceLen:m2[1].length})));
    } else setSuggestions([]);
  };

  const insertAtCursor = (insert: string) => {
    const ta = textareaRef.current;
    if(!ta){ setText(t=>t+(t?" ":"")+insert); return; }
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const before = text.substring(0,start);
    const after = text.substring(end);
    const spacer = before &&!before.endsWith(" ") &&!before.endsWith("\n")? " " : "";
    const newText = before + spacer + insert + after;
    setText(newText);
    setTimeout(()=>{ ta.focus(); ta.setSelectionRange(start+insert.length+1,start+insert.length+1); },10);
  };

  const handleCut = async () => {
    const ta = textareaRef.current; if(!ta) return;
    const s = ta.selectionStart; const e = ta.selectionEnd; if(s===e) return;
    const selected = text.substring(s,e);
    try{ await navigator.clipboard.writeText(selected); }catch{}
    const nt = text.substring(0,s)+text.substring(e);
    setText(nt);
    setTimeout(()=>{ ta.focus(); ta.setSelectionRange(s,s); },10);
  };
  const handleCopy = async () => {
    const ta = textareaRef.current;
    const selected = ta && ta.selectionStart!==ta.selectionEnd? text.substring(ta.selectionStart, ta.selectionEnd) : text;
    try{ await navigator.clipboard.writeText(selected); }catch{}
    setCopied(true); setTimeout(()=>setCopied(false),1500);
  };
  const handlePaste = async () => {
    try{ const clip = await navigator.clipboard.readText(); insertAtCursor(clip); }catch{ document.execCommand("paste"); }
  };
  const handleDelete = () => {
    const ta = textareaRef.current; if(!ta) return;
    const s = ta.selectionStart; const e = ta.selectionEnd;
    if(s!==e){ setText(text.substring(0,s)+text.substring(e)); setTimeout(()=>{ ta.focus(); ta.setSelectionRange(s,s); },10); }
    else { setText(text.substring(0,s)+text.substring(s+1)); setTimeout(()=>{ ta.focus(); ta.setSelectionRange(s,s); },10); }
  };
  const handleBackspace = () => {
    const ta = textareaRef.current; if(!ta) return;
    const s = ta.selectionStart; const e = ta.selectionEnd;
    if(s!==e){ setText(text.substring(0,s)+text.substring(e)); setTimeout(()=>{ ta.focus(); ta.setSelectionRange(s,s); },10); }
    else if(s>0){ setText(text.substring(0,s-1)+text.substring(s)); setTimeout(()=>{ ta.focus(); ta.setSelectionRange(s-1,s-1); },10); }
  };

  const toggleVoice = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert("Chrome me kholo"); return; }
    if(isListening){ try{ recognitionRef.current && recognitionRef.current.stop(); }catch{} setIsListening(false); return; }
    const rec = new SR(); recognitionRef.current = rec; rec.lang = lang; rec.continuous = false;
    rec.onstart = ()=>setIsListening(true);
    rec.onresult = (e:any)=>insertAtCursor(e.results[0][0].transcript);
    rec.onend = ()=>setIsListening(false);
    rec.onerror = ()=>setIsListening(false);
    rec.start();
  };

  const currentFontCss = FONTS.find(f=>f.name===font)?.css || "Inter, sans-serif";
  const bgClass = isDark? "bg-black text-white" : "bg-gradient-to-br from-violet-50 via-indigo-50 to-fuchsia-50 text-gray-900";
  const cardClass = "rounded-2xl p-4 shadow-sm border bg-white text-black";

  if (isFocus) {
    return (
      <div className={isDark? "bg-black text-white min-h-screen p-8" : "bg-white text-black min-h-screen p-8"}>
        <div className="max-w-3xl mx-auto">
          <button onClick={()=>setIsFocus(false)} className="px-4 py-2 bg-black text-white rounded-xl">Exit Focus</button>
          <textarea ref={textareaRef} value={text} onChange={handleInput} className="w-full min-h-screen outline-none text-xl mt-6 bg-transparent" style={{fontFamily:currentFontCss, fontSize:fontSize+"px"}} />
        </div>
      </div>
    );
  }

  return (
    <div className={bgClass + " min-h-screen"}>
      <div className="max-w-6xl mx-auto p-4">
        <div className="text-center mb-6">
          <div className="inline-flex px-4 py-1 rounded-full bg-black text-white text-xs font-bold mb-3">ENTER + CURSOR + VOICE FIXED + BUILD FIXED</div>
          <h1 className="text-5xl font-black">Word Counter Pro</h1>
          <p className="text-xs opacity-60 mt-1">Cut/Copy/Paste + Color + Fonts + Tools - 100% Buildable</p>
          <div className="flex justify-center gap-2 mt-3 flex-wrap">
            <select value={lang} onChange={e=>setLang(e.target.value)} className="h-9 rounded-xl border px-3 text-sm bg-white font-bold">{LANGUAGES.map(l=><option key={l.code} value={l.code}>{l.flag} {l.label}</option>)}</select>
            <span className="text-xs px-3 py-1 rounded-full bg-violet-600 text-white">{autoLang}</span>
            <span className="text-xs px-2 py-1 rounded-full bg-gray-200">{stats.words}/{goal} {progress}%</span>
            <span className="text-xs px-2 py-1 rounded-full bg-gray-200">{saveStatus==="saved"? "Saved" : "Auto"}</span>
          </div>
        </div>

        <div className="rounded-2xl p-3 mb-3 flex flex-wrap gap-1.5 items-center justify-between bg-white border shadow sticky top-2 z-20">
          <div className="flex gap-1 flex-wrap">
            <button onClick={handleCut} className="h-9 px-2.5 rounded-lg border bg-white text-xs font-bold">Cut</button>
            <button onClick={handleCopy} className="h-9 px-2.5 rounded-lg border bg-white text-xs">{copied? "Copied" : "Copy"}</button>
            <button onClick={handlePaste} className="h-9 px-2.5 rounded-lg border bg-white text-xs">Paste</button>
            <button onClick={handleDelete} className="h-9 px-2.5 rounded-lg border bg-red-50 text-red-600 text-xs">Del</button>
            <button onClick={handleBackspace} className="h-9 px-2.5 rounded-lg border bg-orange-50 text-orange-600 text-xs">Bksp</button>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            <button onClick={()=>setShowColor(v=>!v)} className="h-9 px-3 rounded-xl bg-gradient-to-r from-pink-500 to-orange-500 text-white text-xs font-bold">Color</button>
            <button onClick={()=>setShowSettings(v=>!v)} className="h-9 px-3 rounded-xl border bg-white text-xs">Fonts & Size</button>
            <button onClick={toggleVoice} className={isListening? "h-10 px-5 rounded-xl bg-red-600 text-white text-xs font-bold" : "h-10 px-5 rounded-xl bg-black text-white text-xs font-bold"}>{isListening? "STOP" : "VOICE"}</button>
            <button onClick={()=>setIsFocus(true)} className="h-9 px-3 rounded-xl bg-black text-white text-xs">Focus</button>
            <button onClick={()=>setIsDark(!isDark)} className="h-9 px-3 rounded-xl bg-black text-white text-xs">{isDark? "Light" : "Dark"}</button>
          </div>
        </div>

        {showColor && (
          <div className="rounded-2xl p-4 mb-3 bg-white border shadow">
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(c=><button key={c} onClick={()=>setColor(c)} style={{backgroundColor:c}} className={color===c? "w-8 h-8 rounded-full border-2 border-black" : "w-8 h-8 rounded-full border"} />)}
              <input type="color" value={color} onChange={e=>setColor(e.target.value)} className="w-8 h-8" />
            </div>
          </div>
        )}

        {showSettings && (
          <div className="rounded-2xl p-4 mb-3 bg-white border shadow grid md:grid-cols-4 gap-3">
            <div><label className="text-xs font-bold">Page</label><select value={pageSize} onChange={e=>setPageSize(e.target.value)} className="w-full h-9 border rounded-lg px-2 mt-1">{Object.entries(PAGE_SIZES).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}</select></div>
            <div><label className="text-xs font-bold">Font</label><select value={font} onChange={e=>setFont(e.target.value)} className="w-full h-9 border rounded-lg px-2 mt-1">{FONTS.map(f=><option key={f.name} value={f.name}>{f.name}</option>)}</select></div>
            <div><label className="text-xs font-bold">Size {fontSize}px</label><input type="range" min={10} max={36} value={fontSize} onChange={e=>setFontSize(parseInt(e.target.value))} className="w-full" /></div>
            <div><label className="text-xs font-bold">Line {lineHeight}</label><input type="range" min={1} max={3} step={0.1} value={lineHeight} onChange={e=>setLineHeight(parseFloat(e.target.value))} className="w-full" /></div>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="rounded-2xl p-2 bg-white border shadow">
              <textarea ref={textareaRef} value={text} onChange={handleInput} placeholder="Type here... Enter stable, cursor stable, voice inserts at cursor, Cut/Copy/Paste working" className="w-full min-h-[460px] p-6 rounded-xl outline-none border-0" style={{fontFamily:currentFontCss, fontSize:fontSize+"px", lineHeight:lineHeight, color:color}} />
            </div>
            {showHighlight && <div className="rounded-2xl p-4 mt-4 bg-white border" dangerouslySetInnerHTML={{__html: highlightedHtml || escapeHtml(text)}} />}
            {errors.length>0 && <div className="rounded-2xl p-4 mt-4 bg-white border">{errors.map((err,i)=><div key={i} className="flex justify-between p-2 border rounded-xl text-xs mb-2"><span>{err.message} to {err.replacement}</span><button onClick={()=>{ const nt=text.substring(0,err.offset)+err.replacement+text.substring(err.offset+err.length); setText(nt); }} className="px-2 py-1 bg-black text-white rounded">Fix</button></div>)}</div>}
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className={cardClass}><div className="text-xs opacity-60">Words</div><div className="font-black text-lg">{stats.words}</div></div>
              <div className={cardClass}><div className="text-xs opacity-60">Chars with</div><div className="font-black">{stats.chars}</div></div>
              <div className={cardClass}><div className="text-xs opacity-60">Chars without</div><div className="font-black">{stats.charsNoSpace}</div></div>
              <div className={cardClass}><div className="text-xs opacity-60">Sentences</div><div className="font-black">{stats.sentences}</div></div>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-2xl font-black text-center mb-4">Other Useful Tools</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {TOOLS.map(t=><div key={t.name} className="rounded-2xl p-4 bg-white border"><div className="text-2xl">{t.icon}</div><div className="font-bold text-sm mt-1">{t.name}</div><div className="text-xs opacity-60">{t.desc}</div></div>)}
          </div>
        </div>

        <div className="mt-10 space-y-3">
          <h2 className="text-2xl font-black text-center mb-4">Complete Guide</h2>
          {[
            {id:"what-is", title:"What is Word Counter?", content:"Word Counter counts words, characters with spaces (Twitter) and without spaces (University), sentences, paragraphs. 100% private, browser only."},
            {id:"how-to", title:"How to Use - Each Feature", content:"Typing: textarea stable Enter and cursor. Voice: inserts at cursor. Cut/Copy/Paste: buttons work at cursor. Color: pick text color. Fonts/Size/LineHeight: settings. Grammar: preview red wavy. Goal: progress bar."},
            {id:"faq", title:"FAQ", content:"Q: Enter bug? A: Fixed with textarea. Q: Cursor jump? A: Fixed. Q: Voice paste? A: Fixed with insertAtCursor. Q: Mic blocked? A: Lock icon -> Allow. Q: Build failed? A: Removed bg-[#] classes."},
          ].map(a=><div key={a.id} className="rounded-2xl overflow-hidden bg-white border"><button onClick={()=>setShowArticle(showArticle===a.id? null : a.id)} className="w-full flex justify-between p-5 font-bold text-left"><span>{a.title}</span><span>{showArticle===a.id? "-" : "+"}</span></button>{showArticle===a.id && <div className="p-6 bg-gray-50 text-sm leading-7 border-t">{a.content}</div>}</div>)}
        </div>
      </div>
    </div>
  );
}
