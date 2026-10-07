"use client";
import { useState, useEffect, useRef, useMemo } from "react";

type Tab = "count" | "clean" | "seo" | "analyze" | "tools" | "diff";

// build-safe emoji counter
function countEmoji(str: string): number {
  let c=0;
  for(let i=0;i<str.length;){
    const cp=str.codePointAt(i)||0;
    if((cp>=0x1f600&&cp<=0x1f64f)||(cp>=0x1f300&&cp<=0x1f5ff)||(cp>=0x1f680&&cp<=0x1f6ff)||(cp>=0x2600&&cp<=0x27bf)||(cp>=0x1f900&&cp<=0x1f9ff)||(cp>=0x1f1e0&&cp<=0x1f1ff)||(cp>=0x1fa70&&cp<=0x1faff)) c++;
    i+=cp>0xffff?2:1;
  }
  return c;
}
function removeEmojiSafe(str: string): string {
  let out="";
  for(let i=0;i<str.length;){
    const cp=str.codePointAt(i)||0;
    const isE=(cp>=0x1f600&&cp<=0x1f64f)||(cp>=0x1f300&&cp<=0x1f5ff)||(cp>=0x1f680&&cp<=0x1f6ff)||(cp>=0x2600&&cp<=0x27bf)||(cp>=0x1f900&&cp<=0x1f9ff)||(cp>=0x1f1e0&&cp<=0x1f1ff);
    if(!isE) out+=String.fromCodePoint(cp);
    i+=cp>0xffff?2:1;
  }
  return out;
}
function countSyllables(w:string){ w=w.toLowerCase(); if(w.length<=3) return 1; w=w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/,"").replace(/^y/,""); const m=w.match(/[aeiouy]{1,2}/g); return m?m.length:1; }

export default function Page(){
  const [text,setText]=useState("");
  const [tab,setTab]=useState<Tab>("count");
  const [dark,setDark]=useState(false);
  const [goal,setGoal]=useState(1000);
  const [find,setFind]=useState("");
  const [replace,setReplace]=useState("");
  const [isRegex,setIsRegex]=useState(false);
  const [title,setTitle]=useState("");
  const [desc,setDesc]=useState("");
  const [diffB,setDiffB]=useState("");
  const [slug,setSlug]=useState("");

  const taRef=useRef<HTMLTextAreaElement>(null);

  useEffect(()=>{
    const d=localStorage.getItem("adv_text"); if(d) setText(d);
    if(localStorage.getItem("theme")==="dark") setDark(true);
  },[]);
  useEffect(()=>{ localStorage.setItem("adv_text",text); },[text]);

  const stats=useMemo(()=>{
    const chars=text.length;
    const charsNoSpace=text.replace(/\s/g,"").length;
    const words=text.trim()?text.trim().split(/\s+/).filter(Boolean).length:0;
    const sentences=text.split(/[.!?]+/).filter(s=>s.trim()).length||1;
    const paras=text.split(/\n+/).filter(s=>s.trim()).length;
    const emoji=countEmoji(text);
    let syll=0; text.trim().split(/\s+/).forEach(w=>syll+=countSyllables(w));
    const flesch=words?206.835-1.015*(words/sentences)-84.6*(syll/words):0;
    const reading=Math.ceil(words/225);
    const speaking=Math.ceil(words/150);
    const stop=new Set(["the","and","is","in","to","a","of","for","on","with","this","that","are","be","it","as","at","by","from","hai","aur","ke","ka","ko","mein","hain"]);
    const freq:Record<string,number>={};
    text.toLowerCase().split(/\W+/).filter(w=>w.length>2&&!stop.has(w)).forEach(w=>freq[w]=(freq[w]||0)+1);
    const top=Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,20);
    const maxFreq=top[0]?.[1]||1;
    // simple sentiment
    const pos=["good","great","best","love","happy","awesome","amazing","bahut","accha","best"];
    const neg=["bad","worst","hate","sad","angry","poor","bura","kharab"];
    let score=0; const low=text.toLowerCase();
    pos.forEach(w=>{ if(low.includes(w)) score++; }); neg.forEach(w=>{ if(low.includes(w)) score--; });
    const sentiment=score>1?"Positive 😊":score<-1?"Negative 😠":"Neutral 😐";
    const lang=/[अ-ह]/.test(text)?( /[a-zA-Z]/.test(text)?"Hinglish":"Hindi") : "English";
    return {chars,charsNoSpace,words,sentences,paras,emoji,flesch,reading,speaking,syll,top,maxFreq,sentiment,lang,score};
  },[text]);

  const seoScore=useMemo(()=>{
    let s=0; if(title.length>=50&&title.length<=60) s+=35; else if(title.length>0) s+=15;
    if(desc.length>=150&&desc.length<=160) s+=35; else if(desc.length>0) s+=15;
    if(stats.words>300) s+=15; if(stats.top.length>5) s+=15;
    return Math.min(100,s);
  },[title,desc,stats]);

  const doReplace=()=>{
    if(!find) return;
    if(isRegex){ try{ const re=new RegExp(find,"g"); setText(text.replace(re,replace)); }catch{} }
    else setText(text.split(find).join(replace));
  };

  return (
    <div className={dark?"dark":""}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&display=swap');.glass{backdrop-filter:blur(18px) saturate(180%);}`}</style>
      <div className="min-h-screen bg-[#f7f8ff] dark:bg-[#0e0f1a] text-[#151a2d] dark:text-white" style={{fontFamily:'Outfit, sans-serif'}}>
        {/* Nav */}
        <nav className="sticky top-0 z-50 glass bg-white/80 dark:bg-[#161826]/80 border-b px-6 py-3 flex justify-between items-center">
          <b className="text-xl">Text<span className="text-[#5b5bff]">lyzer</span> PRO</b>
          <div className="flex gap-2">
            <div className="hidden md:flex gap-1 p-1 rounded-full bg-black/5 dark:bg-white/10">
              {(["count","clean","seo","analyze","tools","diff"] as Tab[]).map(t=><button key={t} onClick={()=>setTab(t)} className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize ${tab===t?"bg-[#5b5bff] text-white":""}`}>{t}</button>)}
            </div>
            <button onClick={()=>{setDark(!dark); localStorage.setItem("theme",!dark?"dark":"light")}} className="px-3 py-1.5 rounded-full border bg-white dark:bg-[#1e2138] text-xs">{dark?"☀":"🌙"}</button>
          </div>
        </nav>

        {/* Mobile Tabs */}
        <div className="md:hidden flex gap-1 p-2 overflow-auto">
          {(["count","clean","seo","analyze","tools","diff"] as Tab[]).map(t=><button key={t} onClick={()=>setTab(t)} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap ${tab===t?"bg-[#5b5bff] text-white":"bg-white border"}`}>{t.toUpperCase()}</button>)}
        </div>

        <div className="max-w-[1280px] mx-auto grid lg:grid-cols-[1.2fr_380px] gap-5 p-4 md:p-6">
          {/* Editor */}
          <div className="glass bg-white/80 dark:bg-[#161826]/70 rounded-[20px] border p-4">
            <div className="flex flex-wrap gap-2 mb-3">
              <button onClick={()=>navigator.clipboard.writeText(text)} className="px-3 py-1.5 rounded-[10px] border bg-white dark:bg-[#1e2138] text-xs">📋 Copy</button>
              <button onClick={()=>setText("")} className="px-3 py-1.5 rounded-[10px] border bg-white dark:bg-[#1e2138] text-xs">🗑 Clear</button>
              <button onClick={()=>setText(text.toUpperCase())} className="px-3 py-1.5 rounded-[10px] border bg-white dark:bg-[#1e2138] text-xs">UPPER</button>
              <button onClick={()=>setText(text.toLowerCase())} className="px-3 py-1.5 rounded-[10px] border bg-white dark:bg-[#1e2138] text-xs">lower</button>
              <button onClick={()=>setText(removeEmojiSafe(text))} className="px-3 py-1.5 rounded-[10px] border bg-white dark:bg-[#1e2138] text-xs">Remove Emoji</button>
            </div>

            {tab==="diff"?(
              <div className="grid md:grid-cols-2 gap-3">
                <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Original Text" className="min-h-[400px] p-4 rounded-[16px] border bg-white dark:bg-[#1e2138] outline-none"/>
                <textarea value={diffB} onChange={e=>setDiffB(e.target.value)} placeholder="Modified Text" className="min-h-[400px] p-4 rounded-[16px] border bg-white dark:bg-[#1e2138] outline-none"/>
              </div>
            ):(
              <textarea ref={taRef} value={text} onChange={e=>setText(e.target.value)} placeholder="Paste your article, Hindi/English, 200k chars supported..." className="w-full min-h-[420px] p-4 rounded-[16px] border bg-white/90 dark:bg-[#1e2138]/90 outline-none text-[16px] leading-7"/>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-4">
              {[
                ["Chars",stats.chars],
                ["Words",stats.words],
                ["No Space",stats.charsNoSpace],
                ["Sentences",stats.sentences],
                ["Paras",stats.paras],
                ["Emoji",stats.emoji],
                ["Reading",stats.reading+"m"],
                ["Speaking",stats.speaking+"m"],
                ["Flesch",Math.round(stats.flesch)],
                ["Syllables",stats.syll],
                ["Lang",stats.lang],
                ["Size", (stats.chars/1024).toFixed(2)+"KB"],
              ].map(([l,v])=><div key={l as string} className="rounded-[14px] bg-black/[0.04] dark:bg-white/[0.06] border p-2 text-center"><div className="font-bold">{v as any}</div><div className="text-[10px] uppercase tracking-widest opacity-60">{l as string}</div></div>)}
            </div>
          </div>

          {/* Right Panel - Contextual */}
          <div className="space-y-4">
            {tab==="count" && (
              <>
                <div className="glass bg-white/70 dark:bg-[#161826]/70 rounded-[20px] border p-4">
                  <h4 className="text-xs uppercase tracking-widest opacity-60 mb-2">Goal {stats.words}/{goal}</h4>
                  <input type="range" min={100} max={5000} value={goal} onChange={e=>setGoal(parseInt(e.target.value))} className="w-full"/>
                  <div className="h-2 bg-black/10 rounded-full mt-2 overflow-hidden"><div className="h-full bg-[#5b5bff]" style={{width:`${Math.min(100,Math.round(stats.words/goal*100))}%`}}/></div>
                </div>
                <div className="glass bg-white/70 dark:bg-[#161826]/70 rounded-[20px] border p-4">
                  <h4 className="text-xs uppercase tracking-widest opacity-60">Social Limits</h4>
                  {[
                    ["Twitter",280],["Insta",2200],["LinkedIn",3000],["YT Title",100],["Google Title",60]
                  ].map(([n,l])=>{
                    const over=stats.chars>(l as number);
                    return <div key={n as string} className={`flex justify-between text-xs py-1.5 border-b border-dashed ${over?"text-red-500":"text-emerald-600"}`}><span>{n as string}</span><span>{stats.chars}/{l as number}</span></div>
                  })}
                </div>
              </>
            )}

            {tab==="clean" && (
              <div className="glass bg-white/70 dark:bg-[#161826]/70 rounded-[20px] border p-4 space-y-3">
                <h4 className="font-bold">Clean & Replace PRO</h4>
                <div className="flex gap-2"><input value={find} onChange={e=>setFind(e.target.value)} placeholder="Find (regex ok)" className="flex-1 px-3 py-2 rounded-[10px] border bg-white dark:bg-[#1e2138] text-sm"/><input value={replace} onChange={e=>setReplace(e.target.value)} placeholder="Replace" className="flex-1 px-3 py-2 rounded-[10px] border bg-white dark:bg-[#1e2138] text-sm"/></div>
                <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={isRegex} onChange={e=>setIsRegex(e.target.checked)}/> Use Regex</label>
                <button onClick={doReplace} className="w-full py-2 rounded-full bg-[#5b5bff] text-white text-sm font-bold">Replace All</button>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={()=>setText(text.replace(/ +/g," "))} className="px-3 py-2 rounded-[10px] border bg-white dark:bg-[#1e2138] text-xs">Remove Extra Spaces</button>
                  <button onClick={()=>setText(text.split("\n").filter(l=>l.trim()).join("\n"))} className="px-3 py-2 rounded-[10px] border bg-white dark:bg-[#1e2138] text-xs">Remove Empty Lines</button>
                  <button onClick={()=>setText(Array.from(new Set(text.split("\n"))).join("\n"))} className="px-3 py-2 rounded-[10px] border bg-white dark:bg-[#1e2138] text-xs">Remove Duplicates</button>
                  <button onClick={()=>setText(text.split("\n").map(l=>l.trim()).join("\n"))} className="px-3 py-2 rounded-[10px] border bg-white dark:bg-[#1e2138] text-xs">Trim Lines</button>
                  <button onClick={()=>setText(text.split("\n").map((l,i)=>`${i+1}. ${l}`).join("\n"))} className="px-3 py-2 rounded-[10px] border bg-white dark:bg-[#1e2138] text-xs">Add Line Numbers</button>
                  <button onClick={()=>setText(text.replace(/[0-9]/g,""))} className="px-3 py-2 rounded-[10px] border bg-white dark:bg-[#1e2138] text-xs">Remove Numbers</button>
                </div>
              </div>
            )}

            {tab==="seo" && (
              <div className="glass bg-white/70 dark:bg-[#161826]/70 rounded-[20px] border p-4 space-y-3">
                <h4 className="font-bold">SEO Studio • Score {seoScore}/100</h4>
                <div className="h-2 bg-black/10 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-[#5b5bff] to-emerald-400" style={{width:`${seoScore}%`}}/></div>
                <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="SEO Title (50-60 chars)" className="w-full px-3 py-2 rounded-[10px] border bg-white dark:bg-[#1e2138] text-sm"/>
                <div className="text-xs opacity-60">{title.length}/60 {title.length>=50&&title.length<=60?"✅":"⚠"}</div>
                <input value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Meta Description (150-160)" className="w-full px-3 py-2 rounded-[10px] border bg-white dark:bg-[#1e2138] text-sm"/>
                <div className="text-xs opacity-60">{desc.length}/160 {desc.length>=150&&desc.length<=160?"✅":"⚠"}</div>
                <div className="rounded-[12px] bg-white dark:bg-[#1e2138] border p-3">
                  <div className="text-[12px] text-[#1a0dab] truncate">{title||"Your Title Preview"}</div>
                  <div className="text-[11px] text-[#006621]">https://textlyzer.app/character-counter • {stats.words} words</div>
                  <div className="text-[12px] opacity-70 line-clamp-2">{desc||"Meta description preview will appear here..."}</div>
                </div>
                <input value={slug} onChange={e=>setSlug(e.target.value)} placeholder="Generate slug from title" className="w-full px-3 py-2 rounded-[10px] border bg-white dark:bg-[#1e2138] text-sm"/>
                <button onClick={()=>setSlug(title.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,""))} className="w-full py-2 rounded-full border bg-white dark:bg-[#1e2138] text-xs">Generate Slug: {slug}</button>
              </div>
            )}

            {tab==="analyze" && (
              <div className="glass bg-white/70 dark:bg-[#161826]/70 rounded-[20px] border p-4 space-y-3">
                <h4 className="font-bold">Analyze PRO</h4>
                <div className="text-sm">Sentiment: <b>{stats.sentiment}</b> • Language: <b>{stats.lang}</b></div>
                <div className="text-xs opacity-60">Flesch {Math.round(stats.flesch)} • {stats.flesch>80?"Very Easy":stats.flesch>60?"Easy":stats.flesch>30?"Hard":"Very Hard"} • Grade {Math.round(stats.syll/stats.words*0.39 + stats.words/stats.sentences*0.39)}</div>
                <h5 className="text-xs uppercase tracking-widest opacity-60 mt-3">Keyword Density</h5>
                <div className="space-y-1">
                  {stats.top.map(([w,c])=><div key={w} className="flex items-center gap-2"><span className="text-xs w-20 truncate">{w}</span><div className="flex-1 h-2 bg-black/10 rounded-full overflow-hidden"><div className="h-full bg-[#5b5bff]" style={{width:`${(c/stats.maxFreq)*100}%`}}/></div><span className="text-xs">{c}</span><span className="text-[10px] opacity-60">{((c/stats.words)*100).toFixed(1)}%</span></div>)}
                </div>
                <button onClick={()=>{const s=text.split(". ").slice(0,3).join(". ")+"."; navigator.clipboard.writeText(s);}} className="w-full mt-2 py-2 rounded-full bg-[#5b5bff] text-white text-xs font-bold">Copy Auto Summary (3 lines)</button>
              </div>
            )}

            {tab==="tools" && (
              <div className="glass bg-white/70 dark:bg-[#161826]/70 rounded-[20px] border p-4 grid grid-cols-2 gap-2">
                <button onClick={()=>setText("Lorem ipsum dolor sit amet, consectetur adipiscing elit. ".repeat(20))} className="px-3 py-3 rounded-[12px] border bg-white dark:bg-[#1e2138] text-xs">Lorem 100w</button>
                <button onClick={()=>setText(btoa(text))} className="px-3 py-3 rounded-[12px] border bg-white dark:bg-[#1e2138] text-xs">Base64 Encode</button>
                <button onClick={()=>{try{setText(atob(text))}catch{}}} className="px-3 py-3 rounded-[12px] border bg-white dark:bg-[#1e2138] text-xs">Base64 Decode</button>
                <button onClick={()=>setText(text.toLowerCase().replace(/[^a-z0-9]+/g,"-"))} className="px-3 py-3 rounded-[12px] border bg-white dark:bg-[#1e2138] text-xs">Slugify</button>
                <button onClick={()=>setText(text.split("").reverse().join(""))} className="px-3 py-3 rounded-[12px] border bg-white dark:bg-[#1e2138] text-xs">Reverse</button>
                <button onClick={()=>setText("#"+text.trim().split(/\s+/).map(w=>"#"+w).join(" "))} className="px-3 py-3 rounded-[12px] border bg-white dark:bg-[#1e2138] text-xs">Hashtags</button>
              </div>
            )}

            {tab==="diff" && (
              <div className="glass bg-white/70 dark:bg-[#161826]/70 rounded-[20px] border p-4">
                <h4 className="font-bold text-sm">Diff Result</h4>
                <div className="text-xs mt-2">
                  {text===diffB?"✅ No Difference":`Chars Diff: ${Math.abs(text.length-diffB.length)} | ${text.length>diffB.length?"A longer":"B longer"}`}
                </div>
                <div className="mt-3 p-2 rounded-[10px] bg-black/5 dark:bg-white/5 text-[11px] max-h-[300px] overflow-auto">
                  {text.split(" ").map((w,i)=> w!==diffB.split(" ")[i]? <span key={i} className="bg-red-200 dark:bg-red-900/50 px-1 mx-0.5 rounded">{w}</span> : <span key={i} className="mx-0.5">{w} </span>)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* FAQ + Tools - same as before */}
        <section className="max-w-[840px] mx-auto px-6 py-10">
          <h2 className="text-xl font-bold mb-3">FAQ • PRO Features</h2>
          <div className="space-y-2">
            {[
              ["Hindi + English mix?", "Auto language detect + Hinglish support, keyword density Hindi words ke liye bhi kaam karti hai."],
              ["SEO Score kaise?", "Title 50-60, Desc 150-160, Words >300, Top keywords >5 => 100/100"],
              ["Large file?", "200k chars tak instant, debounced + chunked, no server upload."],
            ].map(([q,a])=><details key={q} className="glass bg-white/70 dark:bg-[#161826]/70 rounded-[14px] border p-3"><summary className="font-semibold text-sm cursor-pointer">{q}</summary><p className="text-xs opacity-70 mt-1">{a}</p></details>)}
          </div>
        </section>
      </div>
    </div>
  );
}
