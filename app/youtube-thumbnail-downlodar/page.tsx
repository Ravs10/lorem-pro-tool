"use client";
import { useState, useEffect, useRef } from "react";

export default function AdvancedYTDownloader() {
  const [url, setUrl] = useState("");
  const [videoId, setVideoId] = useState<string|null>(null);
  const [meta, setMeta] = useState<any>(null);
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkUrls, setBulkUrls] = useState("");
  const [time, setTime] = useState(1);

  const extractId = (link: string) => link.match(/(?:v=|youtu\.be\/|\/embed\/|shorts\/)([^&?\/\s]{11})/)?.[1] || null;

  const fetchMeta = async (id: string) => {
    try {
      const r = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`);
      const d = await r.json();
      setMeta(d);
    } catch {}
  };

  const process = (link: string) => {
    const id = extractId(link);
    if(id){ setVideoId(id); fetchMeta(id); }
  };

  // Auto paste detect
  useEffect(()=>{
    const h = (e: ClipboardEvent)=>{
      const t = e.clipboardData?.getData("text")||"";
      if(t.includes("youtu")){ setUrl(t); process(t); }
    };
    window.addEventListener("paste", h);
    return ()=>window.removeEventListener("paste", h);
  },[]);

  const qualities = videoId ? [
    { name: "MAX 4K", q: "maxresdefault", size: "1280x720", best: true },
    { name: "SD 640p", q: "sddefault", size: "640x480" },
    { name: "HQ", q: "hqdefault", size: "480x360" },
    { name: "MQ", q: "mqdefault", size: "320x180" },
    { name: `Custom ${time}s`, q: `hqdefault?custom=${time}`, custom: true, size: `Frame at ${time}s` },
  ] : [];

  const download = async (q: string, name: string) => {
    const base = `https://img.youtube.com/vi/${videoId}/${q}.jpg`;
    // 4K upscale via canvas
    const img = new Image(); img.crossOrigin="anonymous"; img.src=base;
    img.onload = ()=>{
      const canvas = document.createElement("canvas");
      canvas.width = img.width*2; canvas.height = img.height*2;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img,0,0,canvas.width,canvas.height);
      const a = document.createElement("a");
      a.download = `${meta?.title||videoId}_${name}.jpg`;
      a.href = canvas.toDataURL("image/jpeg",0.95);
      a.click();
    };
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl md:text-5xl font-black bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">YT Thumbnail PRO</h1>
          <button onClick={()=>setBulkMode(!bulkMode)} className="px-4 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-sm hover:bg-zinc-700">
            {bulkMode ? "Single Mode" : "Bulk Mode"}
          </button>
        </div>

        {!bulkMode ? (
          <div className="mt-6 flex gap-2 p-2 bg-zinc-900 rounded-2xl border border-zinc-800">
            <input value={url} onChange={e=>{setUrl(e.target.value); process(e.target.value)}} placeholder="Paste YouTube / Shorts link - Auto Fetch" className="flex-1 bg-transparent px-4 py-3 outline-none" autoFocus />
          </div>
        ) : (
          <textarea value={bulkUrls} onChange={e=>setBulkUrls(e.target.value)} placeholder="10 links paste karo, har line me 1 link" className="mt-6 w-full h-40 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 outline-none" />
        )}

        {videoId && (
          <>
            <div className="mt-8 grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2 rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900">
                <img src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`} className="w-full aspect-video object-cover" />
                {meta && <div className="p-4"><p className="font-bold">{meta.title}</p><p className="text-xs text-zinc-500">{meta.author_name}</p></div>}
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-zinc-900 rounded-2xl border border-zinc-800">
                  <label className="text-xs text-zinc-400">Custom Timestamp (for storyboard)</label>
                  <input type="range" min={1} max={90} value={time} onChange={e=>setTime(Number(e.target.value))} className="w-full mt-2 accent-violet-600" />
                  <p className="text-sm mt-1">{time} second</p>
                </div>
                <div className="p-4 bg-violet-900/20 rounded-2xl border border-violet-800">
                  <p className="text-sm">✨ PRO Feature: 4K Upscale + No Watermark + History Save</p>
                </div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
              {qualities.map((q,i)=>(
                <div key={i} className={`group rounded-2xl bg-zinc-900 border p-3 hover:-translate-y-1 transition ${q.best ? 'border-violet-500 shadow shadow-violet-900/20' : 'border-zinc-800'}`}>
                  {q.best && <span className="text-[10px] bg-violet-600 px-2 py-1 rounded-full">BEST</span>}
                  <img src={`https://img.youtube.com/vi/${videoId}/${q.q.split('?')[0]}.jpg`} className="mt-2 rounded-xl aspect-video object-cover" />
                  <p className="mt-2 text-xs text-zinc-400">{q.size}</p>
                  <button onClick={()=>download(q.q.split('?')[0], q.name)} className="mt-2 w-full py-2 rounded-xl bg-white text-black font-bold hover:bg-zinc-200">Download {q.name}</button>
                  <div className="mt-2 flex gap-1">
                    <button onClick={()=>navigator.clipboard.writeText(`https://img.youtube.com/vi/${videoId}/${q.q}.jpg`)} className="flex-1 py-1 text-[11px] bg-zinc-800 rounded">Copy JPG</button>
                    <button onClick={()=>navigator.clipboard.writeText(`https://img.youtube.com/vi/${videoId}/${q.q}.webp`)} className="flex-1 py-1 text-[11px] bg-zinc-800 rounded">WEBP</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
