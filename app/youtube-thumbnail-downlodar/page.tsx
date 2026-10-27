"use client";
import { useState, useEffect } from "react";
import JSZip from "jszip";

export default function YTProEnterprise() {
  const [url, setUrl] = useState("");
  const [ids, setIds] = useState<string[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [bulkText, setBulkText] = useState("");
  const [bulkMode, setBulkMode] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [aiEnhance, setAiEnhance] = useState(true);

  const extract = (t: string) => t.match(/(?:v=|be\/|shorts\/|embed\/)([^&?\/\s]{11})/)?.[1] || null;
  const extractAll = (text: string) => {
    const re = /(?:v=|be\/|shorts\/|embed\/)([^&?\/\s]{11})/g;
    return [...text.matchAll(re)].map(m=>m[1]).slice(0,20);
  };

  useEffect(()=>{
    const h = JSON.parse(localStorage.getItem("yt_hist")||"[]");
    setHistory(h);
  },[]);

  const saveHist = (id: string)=>{
    const n = [id, ...history.filter(x=>x!==id)].slice(0,20);
    setHistory(n); localStorage.setItem("yt_hist", JSON.stringify(n));
  };

  const processOne = async (id: string)=>{
    setIds([id]); saveHist(id);
    try{ const r=await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`); setMeta(await r.json()); }catch{}
  };

  // Auto paste
  useEffect(()=>{
    const fn=(e:ClipboardEvent)=>{
      const t=e.clipboardData?.getData("text")||"";
      if(t.includes("youtu")){ 
        if(bulkMode){ setBulkText(t); setIds(extractAll(t)); }
        else { setUrl(t); const id=extract(t); if(id) processOne(id); }
      }
    };
    window.addEventListener("paste", fn);
    return ()=>window.removeEventListener("paste", fn);
  },[bulkMode]);

  // AI Upscale + Download
  const downloadHD = async (imgUrl: string, name: string)=>{
    const img = new Image(); img.crossOrigin="anonymous"; img.src=imgUrl;
    await new Promise(r=>img.onload=r);
    const canvas=document.createElement("canvas");
    const scale = aiEnhance ? 4 : 2;
    canvas.width=img.width*scale; canvas.height=img.height*scale;
    const ctx=canvas.getContext("2d")!;
    ctx.imageSmoothingQuality="high";
    ctx.drawImage(img,0,0,canvas.width,canvas.height);
    if(aiEnhance){
      ctx.filter="contrast(1.1) saturate(1.2) brightness(1.05)";
      ctx.drawImage(canvas,0,0);
    }
    const a=document.createElement("a");
    a.download=`${name}_4K_AI.jpg`;
    a.href=canvas.toDataURL("image/jpeg",0.95);
    a.click();
  };

  const downloadZip = async()=>{
    const zip=new JSZip();
    for(const id of ids.length?ids:[extract(url)||""]){
      if(!id) continue;
      const qualities=["maxresdefault","sddefault","hqdefault"];
      for(const q of qualities){
        try{
          const res=await fetch(`https://img.youtube.com/vi/${id}/${q}.jpg`);
          const blob=await res.blob();
          zip.file(`${id}_${q}.jpg`, blob);
        }catch{}
      }
    }
    const content=await zip.generateAsync({type:"blob"});
    const a=document.createElement("a");
    a.href=URL.createObjectURL(content);
    a.download=`YT_Thumbnails_${Date.now()}.zip`;
    a.click();
  };

  const currentId = ids[0] || extract(url);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-4 md:p-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap justify-between gap-3">
          <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-violet-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">YT PRO MAX - LEVEL 5</h1>
          <div className="flex gap-2">
            <button onClick={()=>setAiEnhance(!aiEnhance)} className={`px-4 py-2 rounded-xl text-sm border ${aiEnhance?'bg-violet-600 border-violet-500':'bg-zinc-800 border-zinc-700'}`}>AI 4K: {aiEnhance?"ON":"OFF"}</button>
            <button onClick={()=>setBulkMode(!bulkMode)} className="px-4 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-sm">{bulkMode?"Single":"Bulk ZIP"}</button>
          </div>
        </div>

        <p className="mt-2 text-zinc-400">World's First - Bulk ZIP + AI 4K Upscale + History - Enterprise Tool</p>

        {!bulkMode ? (
          <div className="mt-6 p-2 bg-zinc-900 rounded-2xl border border-zinc-800 flex gap-2">
            <input value={url} onChange={e=>{setUrl(e.target.value); const id=extract(e.target.value); if(id) processOne(id)}} placeholder="YouTube / Shorts link paste karo - Auto AI Enhance" className="flex-1 bg-transparent px-4 py-3 outline-none" autoFocus/>
            <button onClick={downloadZip} className="px-6 py-3 rounded-xl bg-white text-black font-bold">ZIP All</button>
          </div>
        ) : (
          <div className="mt-6">
            <textarea value={bulkText} onChange={e=>{setBulkText(e.target.value); setIds(extractAll(e.target.value))}} placeholder="20 links tak paste karo - har line me 1 link - auto ZIP banega" className="w-full h-40 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 outline-none"/>
            <button onClick={downloadZip} className="mt-3 w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-blue-600 font-black text-lg">Download {ids.length} Videos as ZIP ({ids.length*3} images)</button>
          </div>
        )}

        {currentId && (
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900">
              <img src={`https://img.youtube.com/vi/${currentId}/maxresdefault.jpg`} className="w-full aspect-video object-cover" alt="thumb"/>
              {meta && <div className="p-4"><p className="font-bold line-clamp-1">{meta.title}</p><p className="text-xs text-zinc-500">{meta.author_name} • AI Enhanced 4K Ready</p></div>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {["maxresdefault","sddefault","hqdefault","mqdefault"].map(q=>(
                <div key={q} className="bg-zinc-900 border border-zinc-800 rounded-xl p-2 hover:border-violet-500 transition hover:-translate-y-1">
                  <img src={`https://img.youtube.com/vi/${currentId}/${q}.jpg`} className="rounded-lg aspect-video object-cover" alt={q}/>
                  <button onClick={()=>downloadHD(`https://img.youtube.com/vi/${currentId}/${q}.jpg`, `${currentId}_${q}`)} className="mt-2 w-full py-2 rounded-lg bg-white text-black text-xs font-bold">AI 4K Download</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {history.length>0 && (
          <div className="mt-12">
            <h3 className="font-bold text-zinc-300">Recent History</h3>
            <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
              {history.map(id=>(
                <img key={id} src={`https://img.youtube.com/vi/${id}/mqdefault.jpg`} onClick={()=>processOne(id)} className="w-32 aspect-video rounded-xl border border-zinc-800 hover:border-violet-500 cursor-pointer hover:scale-105 transition" alt="hist"/>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
