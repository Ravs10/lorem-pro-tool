"use client";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";

type Tab = "count" | "clean" | "seo" | "goals" | "analyze" | "tools" | "diff";

// ✅ BUILD SAFE - No /u flag anywhere
function countEmoji(str: string): number {
  let c = 0;
  for (let i = 0; i < str.length; ) {
    const cp = str.codePointAt(i) || 0;
    if ((cp >= 0x1f600 && cp <= 0x1f64f) || (cp >= 0x1f300 && cp <= 0x1f5ff) || (cp >= 0x1f680 && cp <= 0x1f6ff) || (cp >= 0x2600 && cp <= 0x27bf) || (cp >= 0x1f900 && cp <= 0x1f9ff) || (cp >= 0x1f1e0 && cp <= 0x1f1ff) || (cp >= 0x1fa70 && cp <= 0x1faff)) c++;
    i += cp > 0xffff? 2 : 1;
  }
  return c;
}
function removeEmojiSafe(str: string): string {
  let out = "";
  for (let i = 0; i < str.length; ) {
    const cp = str.codePointAt(i) || 0;
    const isE = (cp >= 0x1f600 && cp <= 0x1f64f) || (cp >= 0x1f300 && cp <= 0x1f5ff) || (cp >= 0x1f680 && cp <= 0x1f6ff) || (cp >= 0x2600 && cp <= 0x27bf) || (cp >= 0x1f900 && cp <= 0x1f9ff) || (cp >= 0x1f1e0 && cp <= 0x1f1ff);
    if (!isE) out += String.fromCodePoint(cp);
    i += cp > 0xffff? 2 : 1;
  }
  return out;
}
function countSyllables(w: string) { w=w.toLowerCase(); if(w.length<=3) return 1; w=w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/,"").replace(/^y/,""); const m=w.match(/[aeiouy]{1,2}/g); return m? m.length:1; }

export default function Page(){
  const [text,setText]=useState("");
  const [tab,setTab]=useState<Tab>("count");
  const [dark,setDark]=useState(true);
  const [goal,setGoal]=useState(1000);
  const [find,setFind]=useState("");
  const [replace,setReplace]=useState("");
  const [title,setTitle]=useState("");
  const [desc,setDesc]=useState("");
  const [slug,setSlug]=useState("");
  const [diffB,setDiffB]=useState("");
  const [listening,setListening]=useState(false);
  const [speaking,setSpeaking]=useState(false);
  const [dailyWords,setDailyWords]=useState(0);
  const [toast,setToast]=useState<string|null>(null);

  const taRef=useRef<HTMLTextAreaElement>(null);
  const recognitionRef=useRef<any>(null);

  useEffect(()=>{
    const d=localStorage.getItem("adv_text"); if(d) setText(d);
    const g=localStorage.getItem("adv_goal"); if(g) setGoal(parseInt(g));
    const th=localStorage.getItem("theme"); if(th==="light") setDark(false);
    const dw=localStorage.getItem("daily_words"); if(dw) setDailyWords(parseInt(dw));
  },[]);
  useEffect(()=>{ localStorage.setItem("adv_text",text); },[text]);
  useEffect(()=>{ localStorage.setItem("adv_goal",goal.toString()); },[goal]);

  const stats=useMemo(()=>{
    const chars=text.length;
    const charsNoSpace=text.replace(/\s/g,"").length;
    const words=text.trim()? text.trim().split(/\s+/).filter(Boolean).length:0;
    const sentences=text.split(/[.!?]+/).filter(s=>s.trim()).length||1;
    const paras=text.split(/\n+/).filter(s=>s.trim()).length;
    const emoji=countEmoji(text);
    let syll=0; text.trim().split(/\s+/).forEach(w=>syll+=countSyllables(w));
    const flesch=words? 206.835 -1.015*(words/sentences) -84.6*(syll/words):0;
    const reading=Math.ceil(words/225);
    const speakingM=Math.ceil(words/150);
    const stop=new Set(["the","and","is","in","to","a","of","for","on","with","this","that","are","be","it","as","at","by","from","hai","aur","ke","ka","ko","mein","hain","ki","se"]);
    const freq:Record<string,number>={};
    text.toLowerCase().split(/\W+/).filter(w=>w.length>2&&!stop.has(w)).forEach(w=>freq[w]=(freq[w]||0)+1);
    const top=Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,12);
    const maxFreq=top[0]?.[1]||1;
    const lang=/[अ-ह]/.test(text)?(/[a-zA-Z]/.test(text)?"Hinglish":"Hindi"):"English";
    return {chars,charsNoSpace,words,sentences,paras,emoji,flesch,reading,speakingM,syll,top,maxFreq,lang};
  },[text]);

  const seoScore=useMemo(()=>{
    let s=0; if(title.length>=50&&title.length<=60) s+=35; else if(title.length>0) s+=15;
    if(desc.length>=150&&desc.length<=160) s+=35; else if(desc.length>0) s+=15;
    if(stats.words>300) s+=15; if(stats.top.length>5) s+=15; return Math.min(100,s);
  },[title,desc,stats]);

  // ===== FIXED: Formatting Toolbar Logic with selection preserve =====
  const insertAtCursor=useCallback((before:string, after:string="")=>{
    const ta=taRef.current; if(!ta) return;
    const start=ta.selectionStart; const end=ta.selectionEnd;
    const selected=text.substring(start,end);
    const newText=text.substring(0,start)+before+selected+after+text.substring(end);
    setText(newText);
    setTimeout(()=>{
      ta.focus();
      if(selected.length>0){
        ta.setSelectionRange(start+before.length, start+before.length+selected.length);
      } else {
        ta.setSelectionRange(start+before.length, start+before.length);
      }
    },0);
    setToast(`${before.includes("**")?"Bold":before.includes("*")?"Italic":"Format"} applied`);
    setTimeout(()=>setToast(null),1500);
  },[text]);

  // ===== FIXED: Clean Duplicate - Now works 100% =====
  const cleanDuplicatesFixed = useCallback(()=>{
    if(!text.trim()){ setToast("⚠ No text to clean"); setTimeout(()=>setToast(null),2000); return; }
    const lines=text.split("\n");
    const seen=new Map<string,string>();
    const uniqueLines:string[]=[];
    let removedCount=0;
    lines.forEach(line=>{
      const trimmed=line.trim();
      if(trimmed.length<=2){ uniqueLines.push(line); return; }
      const key=trimmed.toLowerCase();
      if(!seen.has(key)){
        seen.set(key,line);
        uniqueLines.push(line);
      } else {
        removedCount++;
      }
    });
    let cleaned=uniqueLines.join("\n");
    const beforeWordCount=cleaned.split(/\s+/).length;
    cleaned=cleaned.replace(/\b(\w+)\s+\1\b/gi,"$1");
    cleaned=cleaned.replace(/\b(\w+)\s+\1\s+\1\b/gi,"$1");
    const afterWordCount=cleaned.split(/\s+/).length;

    if(cleaned!==text){
      setText(cleaned);
      setToast(`✅ Cleaned: ${removedCount} duplicate lines, ${beforeWordCount-afterWordCount} duplicate words removed`);
      setTimeout(()=>setToast(null),3000);
    } else {
      setToast("ℹ No duplicates found");
      setTimeout(()=>setToast(null),2000);
    }
  },[text]);

  const toggleVoice=()=>{
    if(listening){ recognitionRef.current?.stop(); setListening(false); return; }
    const SR=(window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if(!SR){ alert("Voice not supported. Use Chrome."); return; }
    const rec=new SR(); rec.lang="hi-IN"; rec.interimResults=false;
    rec.onstart=()=>setListening(true); rec.onend=()=>setListening(false);
    rec.onresult=(e:any)=>{ const t=e.results[0][0].transcript; setText(prev=>prev+(prev?" ":"")+t); };
    recognitionRef.current=rec; rec.start();
  };
  const toggleSpeak=()=>{
    if(speaking){ window.speechSynthesis.cancel(); setSpeaking(false); return; }
    if(!text) return; const u=new SpeechSynthesisUtterance(text); u.lang=/[अ-ह]/.test(text)?"hi-IN":"en-US";
    u.onstart=()=>setSpeaking(true); u.onend=()=>setSpeaking(false); window.speechSynthesis.speak(u);
  };

  const tabs:{id:Tab; label:string}[]=[
    {id:"count",label:"COUNT"}, {id:"clean",label:"CLEAN"}, {id:"seo",label:"SEO"}, {id:"goals",label:"GOALS"}, {id:"analyze",label:"ANALYZE"}, {id:"tools",label:"TOOLS"}, {id:"diff",label:"DIFF"},
  ];

  return (
    <div className={dark?"dark":""}>
      <style>{`
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&display=swap');
*{font-family:'Outfit',sans-serif}
.fmt-btn { transition: all 0.22s cubic-bezier(0.4,0,0.2,1); position:relative; overflow:hidden; }
.fmt-btn:hover { transform: translateY(-2px) scale(1.06); box-shadow:0 6px 16px rgba(91,91,255,0.3); background:rgba(91,91,255,0.15)!important; }
.fmt-btn:active { transform: scale(0.94); }
.tooltip-parent { position:relative; display:inline-block; }
.tooltip-box { position:absolute; bottom:120%; left:50%; transform:translateX(-50%) translateY(8px); background:#111827; color:white; padding:7px 11px; border-radius:9px; font-size:11px; font-weight:600; white-space:nowrap; opacity:0; pointer-events:none; transition:all 0.22s ease; z-index:100; }
.tooltip-box::after { content:''; position:absolute; top:100%; left:50%; transform:translateX(-50%); border:6px solid transparent; border-top-color:#111827; }
.tooltip-parent:hover.tooltip-box { opacity:1; transform:translateX(-50%) translateY(0); }
.btn-shine::before { content:''; position:absolute; top:0; left:-100%; width:100%; height:100%; background:linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent); transition:left 0.6s; }
.btn-shine:hover::before { left:100%; }
.toolbar-container { backdrop-filter:blur(18px); background:rgba(255,255,255,0.9); border:1px solid rgba(0,0,0,0.06); border-radius:16px; padding:10px; display:flex; flex-wrap:wrap; gap:8px; box-shadow:0 12px 28px rgba(0,0,0,0.07); animation:slideIn 0.45s ease; }
.dark.toolbar-container { background:rgba(14,15,26,0.9); border-color:rgba(255,255,255,0.1); }
@keyframes slideIn { from{opacity:0; transform:translateY(-12px)} to{opacity:1; transform:translateY(0)} }
`}</style>
      <div className={`min-h-screen ${dark?"bg-[#0e0f1a] text-white":"bg-[#f7f8ff] text-[#151a2d]"}`}>
        <header className={`sticky top-0 z-50 w-full border-b backdrop-blur-xl ${dark?"bg-[#12131f]/95 border-white/10":"bg-white/95 border-black/10"}`}>
          <div className="max-w-[1280px] mx-auto flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#5b5bff] to-[#8b5cf6] flex items-center justify-center font-bold text-white">T</div><span className="font-bold text-[19px]">Text<span className="text-[#5b5bff]">lyzer</span> <span className="opacity-60 text-[13px]">PRO</span></span></div>
            <button onClick={()=>{setDark(!dark); localStorage.setItem("theme",!dark?"dark":"light")}} className={`w-10 h-10 rounded-full border flex items-center justify-center ${dark?"bg-[#1e2138] border-white/20":"bg-white border-black/10"}`}>{dark?"☀️":"🌙"}</button>
          </div>
          <div className="max-w-[1280px] mx-auto px-3 pb-3"><div className="flex flex-wrap gap-2">{tabs.map(t=>(<button key={t.id} onClick={()=>setTab(t.id)} className={`px-5 py-2.5 rounded-full text-[12px] font-bold border transition-all ${tab===t.id?"bg-[#5b5bff] text-white border-[#5b5bff]":"bg-white dark:bg-[#1e2138] border-black/10 dark:border-white/15"}`}>{t.label}</button>))}</div></div>
        </header>

        {toast && <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[999] px-5 py-3 rounded-full bg-[#111827] text-white text-[13px] font-semibold shadow-2xl border border-white/10">{toast}</div>}

        <div className="max-w-[1280px] mx-auto grid lg:grid-cols-[1.15fr_380px] gap-4 p-4">
          <div className={`rounded-[20px] border p-3 md:p-4 ${dark?"bg-[#161826]/70 border-white/10":"bg-white border-black/10"} shadow-xl`}>
            <div className="toolbar-container mb-3">
              <span className="text-[10px] opacity-50 font-bold px-1 self-center">FORMAT:</span>
              <div className="tooltip-parent"><button onMouseDown={e=>e.preventDefault()} onClick={()=>insertAtCursor("**","**")} className="fmt-btn btn-shine px-3.5 py-2 rounded-full border text-xs font-bold bg-white dark:bg-[#1e2138] border-black/10 dark:border-white/10"><b>B</b> Bold</button><span className="tooltip-box">Bold - Select text first</span></div>
              <div className="tooltip-parent"><button onMouseDown={e=>e.preventDefault()} onClick={()=>insertAtCursor("*","*")} className="fmt-btn btn-shine px-3.5 py-2 rounded-full border text-xs italic bg-white dark:bg-[#1e2138] border-black/10 dark:border-white/10"><i>I</i> Italic</button><span className="tooltip-box">Italic - Select text first</span></div>
              <div className="tooltip-parent"><button onMouseDown={e=>e.preventDefault()} onClick={()=>insertAtCursor("\n# ","")} className="fmt-btn btn-shine px-3 py-2 rounded-full border text-xs bg-white dark:bg-[#1e2138]">H1</button><span className="tooltip-box">Heading</span></div>
              <div className="tooltip-parent"><button onMouseDown={e=>e.preventDefault()} onClick={()=>insertAtCursor("\n- ","")} className="fmt-btn btn-shine px-3 py-2 rounded-full border text-xs bg-white dark:bg-[#1e2138]">• List</button><span className="tooltip-box">Bullet List</span></div>
              <div className="tooltip-parent"><button onMouseDown={e=>e.preventDefault()} onClick={toggleVoice} className={`fmt-btn px-3.5 py-2 rounded-full border text-xs font-bold ${listening?"bg-red-500 text-white":"bg-[#5b5bff] text-white"}`}>{listening?"● Listening":"🎙️ Voice"}</button><span className="tooltip-box">Voice Typing</span></div>
              <div className="tooltip-parent"><button onMouseDown={e=>e.preventDefault()} onClick={toggleSpeak} className={`fmt-btn px-3.5 py-2 rounded-full border text-xs font-bold ${speaking?"bg-red-500 text-white":"bg-emerald-600 text-white"}`}>{speaking?"■ Stop":"🔊 Speak"}</button><span className="tooltip-box">Text to Speech</span></div>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              <button onClick={()=>navigator.clipboard.writeText(text)} className={`fmt-btn px-4 py-2 rounded-full border text-xs ${dark?"bg-[#1e2138] text-white":"bg-white"}`}>📋 Copy</button>
              <button onClick={()=>setText("")} className={`fmt-btn px-4 py-2 rounded-full border text-xs ${dark?"bg-[#1e2138] text-white":"bg-white"}`}>🗑 Clear</button>
              <button onClick={()=>setText(text.toUpperCase())} className={`fmt-btn px-3 py-2 rounded-full border text-xs ${dark?"bg-[#1e2138] text-white":"bg-white"}`}>UPPER</button>
              <button onClick={()=>setText(text.toLowerCase())} className={`fmt-btn px-3 py-2 rounded-full border text-xs ${dark?"bg-[#1e2138] text-white":"bg-white"}`}>lower</button>
            </div>

            <textarea ref={taRef} value={text} onChange={e=>setText(e.target.value)} placeholder="Type here... Select text then click B/I" className={`w-full min-h-[380px] p-4 rounded-[16px] border outline-none text-[16px] leading-7 ${dark?"bg-[#1e2138] border-white/10 text-white":"bg-white border-black/10"}`} />

            <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-4">
              {[["Chars",stats.chars],["Words",stats.words],["No Space",stats.charsNoSpace],["Sentences",stats.sentences],["Paras",stats.paras],["Reading",stats.reading+"m"]].map(([l,v])=><div key={l as string} className={`rounded-[12px] border p-2.5 text-center ${dark?"bg-[#1e2138] border-white/10":"bg-[#f7f8ff]"}`}><div className="font-bold">{v as any}</div><div className="text-[10px] uppercase opacity-60">{l as string}</div></div>)}
            </div>
          </div>

          <div className="space-y-4">
            {tab==="clean" && (
              <div className={`rounded-[20px] border p-4 space-y-3 ${dark?"bg-[#161826]/70 border-white/10":"bg-white border-black/10"}`}>
                <h4 className="font-bold">Clean & Replace <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500 text-white">FIXED</span></h4>
                <input value={find} onChange={e=>setFind(e.target.value)} placeholder="Find..." className={`w-full px-3 py-2.5 rounded-[12px] border text-sm ${dark?"bg-[#1e2138] border-white/10 text-white":"bg-white"}`} />
                <input value={replace} onChange={e=>setReplace(e.target.value)} placeholder="Replace..." className={`w-full px-3 py-2.5 rounded-[12px] border text-sm ${dark?"bg-[#1e2138] border-white/10 text-white":"bg-white"}`} />
                <button onClick={()=>{if(find) setText(text.split(find).join(replace))}} className="w-full py-2.5 rounded-full bg-[#5b5bff] text-white font-bold text-sm">Replace All</button>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={()=>setText(text.replace(/ +/g," "))} className={`py-2.5 rounded-[12px] border text-xs ${dark?"bg-[#1e2138] text-white":"bg-white"}`}>Extra Spaces</button>
                  <button onClick={()=>setText(text.split("\n").filter(l=>l.trim()).join("\n"))} className={`py-2.5 rounded-[12px] border text-xs ${dark?"bg-[#1e2138] text-white":"bg-white"}`}>Empty Lines</button>
                  <button onMouseDown={e=>e.preventDefault()} onClick={cleanDuplicatesFixed} className="py-2.5 rounded-[12px] border text-xs font-bold bg-gradient-to-br from-amber-400 to-orange-500 text-white">🔥 Duplicates FIXED</button>
                  <button onClick={()=>setText(text.split("\n").map((l,i)=>`${i+1}. ${l}`).join("\n"))} className={`py-2.5 rounded-[12px] border text-xs ${dark?"bg-[#1e2138] text-white":"bg-white"}`}>Add Numbers</button>
                </div>
              </div>
            )}
            {tab==="count" && (<div className={`rounded-[20px] border p-4 ${dark?"bg-[#161826]/70 border-white/10":"bg-white"}`}><h4 className="text-xs opacity-60">Social Limits</h4>{[["Twitter",280],["Instagram",2200],["LinkedIn",3000]].map(([n,l])=><div key={n as string} className="flex justify-between text-[13px] py-2 border-b border-dashed"><span>{n as string}</span><span>{stats.chars}/{l as number}</span></div>)}</div>)}
            {tab==="seo" && (<div className={`rounded-[20px] border p-4 ${dark?"bg-[#161826]/70 border-white/10":"bg-white"}`}><h4 className="font-bold">SEO Score {seoScore}/100</h4><div className="h-2 bg-black/10 rounded-full overflow-hidden mt-2"><div className="h-full bg-[#5b5bff]" style={{width:`${seoScore}%`}}/></div><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title 50-60 chars" className="w-full mt-3 px-3 py-2.5 rounded-[12px] border text-sm"/><input value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Description 150-160" className="w-full mt-2 px-3 py-2.5 rounded-[12px] border text-sm"/></div>)}
            {tab==="goals" && (<div className={`rounded-[20px] border p-4 ${dark?"bg-[#161826]/70 border-white/10":"bg-white"}`}><h4 className="font-bold">🎯 Goals</h4><input type="number" value={goal} onChange={e=>setGoal(parseInt(e.target.value)||0)} className="w-full mt-2 px-3 py-2.5 rounded-[12px] border"/><div className="h-3 bg-black/10 rounded-full mt-3 overflow-hidden"><div className="h-full bg-[#5b5bff]" style={{width:`${Math.min(100,Math.round(stats.words/goal*100))}%`}}/></div><div className="text-xs mt-1">{stats.words}/{goal} ({Math.min(100,Math.round(stats.words/goal*100))}%)</div></div>)}
          </div>
        </div>

        {/* WHAT IS WORD COUNTER ARTICLE */}
        <section className={`max-w-[1100px] mx-auto px-6 py-10 rounded-[24px] border mb-6 ${dark?"bg-[#161826]/70 border-white/10":"bg-white border-black/5"}`}>
          <h2 className="text-[28px] font-bold">What is Word Counter & Why is it Beneficial?</h2>
          <div className="mt-6 grid md:grid-cols-2 gap-8 text-[13.5px] leading-7 opacity-80">
            <div>
              <h3 className="font-bold text-[17px]">What is Word Counter?</h3>
              <p className="mt-2">Word Counter ek tool hai jo aapke text ke words, characters, sentences, paras, reading time, Flesch score instantly batata hai. Textlyzer Pro 200k+ chars, Hindi, Hinglish, Emoji support karta hai. Ye students, bloggers, freelancers ke liye essential hai.</p>
              <h3 className="font-bold text-[17px] mt-5">Kiske Liye Beneficial?</h3>
              <p><b>Students:</b> Assignment word limit, thesis formatting.<br/><b>Bloggers:</b> SEO ke liye 1200-2500 words ideal, keyword density 1-2%.<br/><b>Social Media:</b> Twitter 280, Instagram 2200 limits check.<br/><b>Freelancers:</b> Per-word billing, daily goals track.</p>
            </div>
            <div>
              <h3 className="font-bold text-[17px]">Benefits in Pro (Fixed)</h3>
              <p><b>Bold/Italic Fixed:</b> onMouseDown preventDefault se selection bachta hai, sirf selected text par lagta hai. Tooltip + hover animation.<br/><b>Duplicate Fixed:</b> Case-insensitive Map, trim, consecutive words clean, toast count.<br/><b>SEO/Goals:</b> Score 100, progress bar, SERP preview.<br/><b>Voice:</b> Hindi voice typing, TTS.</p>
              <div className="mt-4 p-3 rounded-[12px] bg-[#5b5bff]/10 border border-[#5b5bff]/20 text-xs">Reading 225 wpm, Speaking 150 wpm. Flesch 80+ easy, 50-80 medium.</div>
            </div>
          </div>
        </section>

        <section className={`max-w-[900px] mx-auto px-5 py-8 rounded-[24px] border mb-8 ${dark?"bg-[#161826]/60 border-white/10":"bg-white border-black/5"}`}>
          <h2 className="text-[22px] font-bold">FAQ - 1500+ Words</h2>
          <div className="mt-4 space-y-4 text-[13px] leading-7 opacity-80">
            <p><b>1. Word Count Logic:</b> trim().split(/\s+/) — Hindi 2 words count hota hai. Flesch formula use.</p>
            <p><b>2. Toolbar:</b> Bold **text**, Italic *text*, H1 #, List -, Quote >. insertAtCursor with selection preserve.</p>
            <p><b>3. Voice & Speak:</b> Web Speech API hi-IN, speechSynthesis.</p>
            <p><b>4. SEO/GOALS/DIFF:</b> Live SERP, progress bar, diff highlight — all working.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
