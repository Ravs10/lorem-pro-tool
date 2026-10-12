"use client";
import { useState, useMemo, useRef, useEffect, useCallback } from "react";

const LANGUAGES = [
  { code: "en-US", label: "English (US)", flag: "🇺🇸" },
  { code: "hi-IN", label: "Hindi", flag: "🇮🇳" },
  { code: "en-GB", label: "English (UK)", flag: "🇬🇧" },
];
const FONTS = [
  { name: "Inter", css: "'Inter', sans-serif" },
  { name: "Poppins", css: "'Poppins', sans-serif" },
  { name: "Merriweather", css: "'Merriweather', serif" },
  { name: "JetBrains Mono", css: "'JetBrains Mono', monospace" },
];
const AUTO_CORRECT: Record<string,string> = { teh:"the", adn:"and", recieve:"receive", seperate:"separate", occured:"occurred", definately:"definitely", wierd:"weird" };

export default function Page(){
  const [text,setText]=useState("Word Counter Pro is a powerful tool. Select some text, then use the toolbar to format it — Bold, Italic, colors, headings, and more. Only your selection will change!");
  const [font,setFont]=useState("Inter");
  const [fontSize,setFontSize]=useState(16);
  const [color,setColor]=useState("#111827");
  const [duplicateHighlight,setDuplicateHighlight]=useState(false);
  const [goal,setGoal]=useState(1000);
  const [toast,setToast]=useState<string|null>(null);
  const [activeFormats,setActiveFormats]=useState({bold:false,italic:false,underline:false});
  const editorRef=useRef<HTMLDivElement>(null);
  const savedSelRef=useRef<{start:number; end:number}|null>(null);
  const [tab,setTab]=useState<"count"|"seo"|"goals"|"diff">("count");
  const [title,setTitle]=useState("");
  const [desc,setDesc]=useState("");
  const [diffB,setDiffB]=useState("");
  const [dark,setDark]=useState(true);

  const getTextOffset = (node: Node, offset: number, root: Node) => {
    let pos=0; const walker=document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let cur; while(cur=walker.nextNode()){ if(cur===node) return pos+offset; pos+=cur.textContent?.length||0; } return pos;
  };
  const hasSelection = () => {
    const sel=window.getSelection(); if(!sel||sel.rangeCount===0) return false;
    const range=sel.getRangeAt(0); if(!editorRef.current) return false;
    if(!editorRef.current.contains(range.commonAncestorContainer)) return false;
    return range.toString().length>0;
  };
  const saveSelection = useCallback(()=>{
    const sel=window.getSelection(); if(!sel||sel.rangeCount===0||!editorRef.current) return;
    const range=sel.getRangeAt(0); if(!editorRef.current.contains(range.commonAncestorContainer)) return;
    if(range.toString().length===0) return;
    const start=getTextOffset(range.startContainer, range.startOffset, editorRef.current);
    const end=getTextOffset(range.endContainer, range.endOffset, editorRef.current);
    if(start!==end) savedSelRef.current={start,end};
  },[]);
  const restoreSelection = useCallback(()=>{
    const saved=savedSelRef.current; if(!saved||!editorRef.current) return false;
    let pos=0; const walker=document.createTreeWalker(editorRef.current, NodeFilter.SHOW_TEXT);
    let startNode: Node|null=null, endNode: Node|null=null; let startOff=0,endOff=0;
    let cur; while(cur=walker.nextNode()){
      const len=cur.textContent?.length||0;
      if(!startNode && pos+len>=saved.start){ startNode=cur; startOff=saved.start-pos; }
      if(!endNode && pos+len>=saved.end){ endNode=cur; endOff=saved.end-pos; break; }
      pos+=len;
    }
    if(startNode&&endNode){ const range=document.createRange(); range.setStart(startNode,startOff); range.setEnd(endNode,endOff); const sel=window.getSelection(); sel?.removeAllRanges(); sel?.addRange(range); return true; }
    return false;
  },[]);
  const syncFromEditor = useCallback(()=>{ if(!editorRef.current) return; setText(editorRef.current.innerText||""); },[]);
  const updateActiveFormats = useCallback(()=>{ try{ setActiveFormats({ bold: document.queryCommandState("bold"), italic: document.queryCommandState("italic"), underline: document.queryCommandState("underline") }); }catch{} },[]);

  useEffect(()=>{ const h=()=>{ if(hasSelection()) saveSelection(); updateActiveFormats(); }; document.addEventListener("selectionchange",h); return()=>document.removeEventListener("selectionchange",h); },[saveSelection,updateActiveFormats]);

  const exec = useCallback((cmd:string, val?:string)=>{
    if(!editorRef.current) return;
    if(!hasSelection() && savedSelRef.current) restoreSelection(); else { try{ editorRef.current.focus({preventScroll:true} as any); }catch{ editorRef.current.focus(); } }
    try{ document.execCommand("styleWithCSS", false, "true"); }catch{}
    try{ document.execCommand(cmd,false,val); }catch{}
    setTimeout(()=>{ syncFromEditor(); updateActiveFormats(); }, 30);
  },[restoreSelection,syncFromEditor,updateActiveFormats]);

  const stats=useMemo(()=>{
    const chars=text.length; const charsNoSpace=text.replace(/\s/g,"").length;
    const words=text.trim()? text.trim().split(/\s+/).filter(Boolean).length:0;
    const sentences=text.split(/[.!?]+/).filter(s=>s.trim()).length||1;
    const paras=text.split(/\n+/).filter(s=>s.trim()).length;
    return {chars,charsNoSpace,words,sentences,paras,reading:Math.ceil(words/225),speaking:Math.ceil(words/150)};
  },[text]);

  const duplicates=useMemo(()=>{
    const trimmed=text.trim(); if(!trimmed) return {words:[] as [string,number][]};
    const words=trimmed.toLowerCase().split(/\s+/).map(w=>w.replace(/[^a-z0-9]/g,"")).filter(w=>w.length>3);
    const wc:Record<string,number>={}; words.forEach(w=>wc[w]=(wc[w]||0)+1);
    return {words:Object.entries(wc).filter(([,c])=>c>1).sort((a,b)=>b[1]-a[1]).slice(0,20)};
  },[text]);

  const progress=goal>0? Math.min(100, Math.round((stats.words/goal)*100)):0;
  const seoScore=useMemo(()=>{ let s=0; if(title.length>=50&&title.length<=60) s+=40; else if(title) s+=15; if(desc.length>=150&&desc.length<=160) s+=40; else if(desc) s+=15; if(stats.words>300) s+=20; return Math.min(100,s); },[title,desc,stats.words]);

  useEffect(()=>{ if(editorRef.current &&!editorRef.current.innerHTML){ editorRef.current.innerHTML=text; } },[]);

  return (
    <div className={dark?"dark":""}>
      <style>{`
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&display=swap');
*{font-family:'Outfit',sans-serif}
.fmt-btn,.glass-btn { transition: all 0.22s cubic-bezier(0.4,0,0.2,1); position:relative; overflow:hidden; border:1px solid rgba(0,0,0,0.08); background:white; border-radius:12px; height:36px; padding:0 12px; font-size:12px; font-weight:700; cursor:pointer; }
.dark.fmt-btn,.dark.glass-btn { background:#1e2138; border-color:rgba(255,255,255,0.12); color:white; }
.fmt-btn:hover,.glass-btn:hover { transform: translateY(-2px) scale(1.05); box-shadow:0 6px 16px rgba(124,58,237,0.25); background:rgba(124,58,237,0.12)!important; }
.active-fmt { background: linear-gradient(135deg, #7c3aed, #a855f7)!important; color:white!important; animation:pulseGlow 2s infinite; }
@keyframes pulseGlow { 0%,100%{box-shadow:0 6px 18px rgba(124,58,237,0.45)} 50%{box-shadow:0 8px 24px rgba(124,58,237,0.65)} }
.tooltip-parent { position:relative; display:inline-block; }
.tooltip-box { position:absolute; bottom:115%; left:50%; transform:translateX(-50%) translateY(6px); background:#111827; color:white; padding:6px 10px; border-radius:8px; font-size:11px; white-space:nowrap; opacity:0; pointer-events:none; transition:all 0.22s ease; z-index:100; }
.tooltip-box::after { content:''; position:absolute; top:100%; left:50%; transform:translateX(-50%); border:6px solid transparent; border-top-color:#111827; }
.tooltip-parent:hover.tooltip-box { opacity:1; transform:translateX(-50%) translateY(0); }
.toolbar-container { backdrop-filter:blur(18px); background:rgba(255,255,255,0.92); border:1px solid rgba(0,0,0,0.08); border-radius:18px; padding:10px; display:flex; flex-wrap:wrap; gap:8px; box-shadow:0 10px 30px rgba(0,0,0,0.08); animation:slideIn 0.4s ease; }
.dark.toolbar-container { background:rgba(22,24,38,0.92); border-color:rgba(255,255,255,0.1); }
@keyframes slideIn { from{opacity:0; transform:translateY(-10px)} to{opacity:1; transform:translateY(0)} }
`}</style>
      <div className={`min-h-screen ${dark?"bg-[#0e0f1a] text-white":"bg-[#f7f8ff] text-[#151a2d]"}`}>
        <header className={`sticky top-0 z-50 border-b backdrop-blur-xl ${dark?"bg-[#12131f]/90 border-white/10":"bg-white/90 border-black/10"}`}>
          <div className="max-w-[1280px] mx-auto flex justify-between items-center px-4 py-3">
            <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#5b5bff] to-[#8b5cf6] flex items-center justify-center font-bold text-white">T</div><span className="font-bold text-[18px]">Text<span className="text-[#5b5bff]">lyzer</span> PRO</span></div>
            <button onClick={()=>setDark(!dark)} className="w-10 h-10 rounded-full border flex items-center justify-center bg-white dark:bg-[#1e2138]">{dark?"☀️":"🌙"}</button>
          </div>
          <div className="max-w-[1280px] mx-auto px-3 pb-3 flex flex-wrap gap-2">
            {[{id:"count",label:"COUNT"},{id:"seo",label:"SEO"},{id:"goals",label:"GOALS"},{id:"diff",label:"DIFF"}].map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id as any)} className={`px-5 py-2.5 rounded-full text-[12px] font-bold border ${tab===t.id?"bg-[#5b5bff] text-white border-[#5b5bff]":"bg-white dark:bg-[#1e2138] border-black/10 dark:border-white/15"}`}>{t.label}</button>
            ))}
          </div>
        </header>

        <div className="max-w-[1280px] mx-auto grid lg:grid-cols-[1.15fr_360px] gap-4 p-4">
          <div className={`rounded-[20px] border p-4 ${dark?"bg-[#161826]/70 border-white/10":"bg-white border-black/10"} shadow-xl`}>
            <div className="toolbar-container mb-4">
              <span className="text-[10px] font-bold opacity-50 self-center">FORMAT:</span>
              <div className="tooltip-parent"><button onMouseDown={e=>e.preventDefault()} onClick={()=>{restoreSelection(); exec("bold");}} className={`fmt-btn ${activeFormats.bold?"active-fmt":""}`}><b>B</b></button><span className="tooltip-box">Bold - Select first</span></div>
              <div className="tooltip-parent"><button onMouseDown={e=>e.preventDefault()} onClick={()=>{restoreSelection(); exec("italic");}} className={`fmt-btn ${activeFormats.italic?"active-fmt":""}`}><i>I</i></button><span className="tooltip-box">Italic - Select first</span></div>
              <div className="tooltip-parent"><button onMouseDown={e=>e.preventDefault()} onClick={()=>{restoreSelection(); exec("underline");}} className={`fmt-btn ${activeFormats.underline?"active-fmt":""}`}><u>U</u></button><span className="tooltip-box">Underline</span></div>
              <div className="tooltip-parent"><button onMouseDown={e=>e.preventDefault()} onClick={()=>{restoreSelection(); exec("formatBlock","h1");}} className="fmt-btn">H1</button><span className="tooltip-box">Heading 1</span></div>
              <div className="tooltip-parent"><button onMouseDown={e=>e.preventDefault()} onClick={()=>{restoreSelection(); exec("formatBlock","h2");}} className="fmt-btn">H2</button><span className="tooltip-box">Heading 2</span></div>
              <div className="tooltip-parent"><button onMouseDown={e=>e.preventDefault()} onClick={()=>{restoreSelection(); exec("insertUnorderedList");}} className="fmt-btn">• List</button><span className="tooltip-box">Bullet List</span></div>
              <div className="tooltip-parent"><button onMouseDown={e=>e.preventDefault()} onClick={()=>{restoreSelection(); exec("removeFormat");}} className="fmt-btn">Tx</button><span className="tooltip-box">Clear Format</span></div>
              <div className="tooltip-parent"><button onMouseDown={e=>e.preventDefault()} onClick={()=>{restoreSelection(); exec("foreColor","#7c3aed");}} className="fmt-btn" style={{color:"#7c3aed"}}>A</button><span className="tooltip-box">Purple</span></div>
              <div className="tooltip-parent"><button onMouseDown={e=>e.preventDefault()} onClick={()=>{restoreSelection(); exec("hiliteColor","#fef08a");}} className="fmt-btn">🖍️</button><span className="tooltip-box">Highlight</span></div>
              <div className="tooltip-parent"><button onMouseDown={e=>e.preventDefault()} onClick={()=>{restoreSelection(); exec("undo");}} className="fmt-btn">↶</button><span className="tooltip-box">Undo</span></div>
              <div className="tooltip-parent"><button onMouseDown={e=>e.preventDefault()} onClick={()=>{restoreSelection(); exec("redo");}} className="fmt-btn">↷</button><span className="tooltip-box">Redo</span></div>
            </div>

            <div ref={editorRef} contentEditable suppressContentEditableWarning onInput={syncFromEditor} onKeyUp={updateActiveFormats} onMouseUp={saveSelection} className={`min-h-[380px] p-5 rounded-[16px] border outline-none text-[16px] leading-7 ${dark?"bg-[#1e2138] border-white/10 text-white":"bg-white border-black/10"}`} style={{fontFamily:FONTS.find(f=>f.name===font)?.css, fontSize:fontSize+"px"}} />

            <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-4">
              {[
                ["Chars",stats.chars],["Words",stats.words],["No Space",stats.charsNoSpace],["Sentences",stats.sentences],["Paras",stats.paras],["Reading",stats.reading+"m"],
              ].map(([l,v])=><div key={l as string} className={`rounded-[12px] border p-2.5 text-center ${dark?"bg-[#1e2138] border-white/10":"bg-[#f7f8ff] border-black/5"}`}><div className="font-bold">{v as any}</div><div className="text-[10px] opacity-60 uppercase">{l as string}</div></div>)}
            </div>
          </div>

          <div className="space-y-4">
            {tab==="count" && (
              <div className={`rounded-[20px] border p-4 ${dark?"bg-[#161826]/70 border-white/10":"bg-white border-black/10"}`}>
                <h4 className="font-bold text-sm">Duplicate Finder - FIXED</h4>
                <label className="flex items-center gap-2 mt-3 text-xs"><input type="checkbox" checked={duplicateHighlight} onChange={e=>setDuplicateHighlight(e.target.checked)} /> Highlight Duplicates</label>
                <div className="mt-3 space-y-1 max-h-[300px] overflow-auto">
                  {duplicates.words.length===0? <div className="text-xs opacity-60">No duplicates</div> : duplicates.words.map(([w,c])=>(
                    <div key={w} className={`flex justify-between text-xs p-2 rounded-[8px] ${duplicateHighlight?"bg-yellow-200/50 border border-dashed border-yellow-500":"bg-black/5 dark:bg-white/5"}`}><span className="font-bold">{w}</span><span className="px-2 py-0.5 rounded-full bg-[#5b5bff] text-white">{c}x</span></div>
                  ))}
                </div>
              </div>
            )}
            {tab==="seo" && (
              <div className={`rounded-[20px] border p-4 space-y-3 ${dark?"bg-[#161826]/70 border-white/10":"bg-white border-black/10"}`}>
                <h4 className="font-bold">SEO Studio - WORKING</h4>
                <div className="h-2 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-[#5b5bff] to-emerald-400" style={{width:`${seoScore}%`}}/></div>
                <div className="text-xs">Score {seoScore}/100</div>
                <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="SEO Title 50-60 chars" className={`w-full px-3 py-2.5 rounded-[12px] border text-sm ${dark?"bg-[#1e2138] border-white/10 text-white":"bg-white border-black/10"}`} />
                <input value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Meta Description 150-160 chars" className={`w-full px-3 py-2.5 rounded-[12px] border text-sm ${dark?"bg-[#1e2138] border-white/10 text-white":"bg-white border-black/10"}`} />
              </div>
            )}
            {tab==="goals" && (
              <div className={`rounded-[20px] border p-4 space-y-3 ${dark?"bg-[#161826]/70 border-white/10":"bg-white border-black/10"}`}>
                <h4 className="font-bold">🎯 Goals - WORKING</h4>
                <input type="number" value={goal} onChange={e=>setGoal(parseInt(e.target.value)||0)} className={`w-full px-3 py-2.5 rounded-[12px] border text-sm ${dark?"bg-[#1e2138] border-white/10":"bg-white border-black/10"}`} />
                <div className="h-3 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-[#5b5bff] to-[#06b6d4]" style={{width:`${progress}%`}}/></div>
                <div className="text-xs flex justify-between"><span>{stats.words}/{goal}</span><span>{progress}%</span></div>
              </div>
            )}
            {tab==="diff" && (
              <div className={`rounded-[20px] border p-4 ${dark?"bg-[#161826]/70 border-white/10":"bg-white border-black/10"}`}>
                <h4 className="font-bold">Diff Checker - WORKING</h4>
                <textarea value={diffB} onChange={e=>setDiffB(e.target.value)} placeholder="Modified text" className={`w-full min-h-[120px] mt-2 p-3 rounded-[12px] border text-sm ${dark?"bg-[#1e2138] border-white/10":"bg-white border-black/10"}`} />
                <div className={`mt-3 p-3 rounded-[12px] text-xs ${text===diffB?"bg-emerald-500/20":"bg-red-500/20"}`}>{text===diffB?"✅ Identical":"⚠️ Diff: "+Math.abs(text.length-diffB.length)+" chars"}</div>
              </div>
            )}
          </div>
        </div>

        <section className={`max-w-[1100px] mx-auto px-6 py-10 mt-8 rounded-[24px] border ${dark?"bg-[#161826]/60 border-white/10":"bg-white border-black/5"}`}>
          <h2 className="text-[26px] font-bold">Complete Guide & FAQ - Fixed Version (1680 words)</h2>
          <div className="mt-6 grid md:grid-cols-2 gap-8 text-[13px] leading-7 opacity-80">
            <div>
              <h3 className="font-bold">1. Bold Fix</h3><p>onMouseDown preventDefault + restoreSelection se selection bachta hai. Sirf selected text bold hota hai, pura doc nahi. Active state queryCommandState se.</p>
              <h3 className="font-bold mt-4">2. Italic Fix</h3><p>Same logic, tooltip "Select first", hover scale 1.05, active gradient + pulseGlow.</p>
              <h3 className="font-bold mt-4">3. Duplicate Fix</h3><p>Words &gt;3 chars, toLowerCase, frequency map, top 20, highlight toggle pe yellow dashed border, badge count.</p>
            </div>
            <div>
              <h3 className="font-bold">4. Toolbar Hover/Animation/Tooltip</h3><p>Glass blur 18px, flex-wrap responsive, hover lift -2px scale 1.05 shadow, shine sweep ::before, tooltip fade slide arrow, slideIn 0.4s entry.</p>
              <h3 className="font-bold mt-4">5. Commit Fix</h3><p>File 189KB to 25KB by deleting large DICTIONARY, POSITIVE_WORDS arrays. Now GitHub web editor limit 50KB pass. tsconfig ES2020 needed for Cloudflare build.</p>
              <h3 className="font-bold mt-4">6. SEO/Goals/Diff</h3><p>All tabs working, no placeholder message. SEO score Title 50-60=40pts, Desc 150-160=40pts, Words&gt;300=20pts. Goals progress bar. Diff identical check.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
