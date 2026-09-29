"use client"
import { useState, useMemo, useRef } from 'react'
export default function Page(){
  const [name,setName]=useState('RC')
  const [bg,setBg]=useState('#ec4899')
  const [txt,setTxt]=useState('#ffeb3b')
  const [size,setSize]=useState(320)
  const [shape,setShape]=useState('squircle')
  const [pattern,setPattern]=useState('mesh')
  const [shadow,setShadow]=useState(true)
  const [glass,setGlass]=useState(true)
  const ref=useRef<HTMLCanvasElement>(null)

  const url=useMemo(()=>{
    const b=bg.replace('#',''); const c=txt.replace('#','')
    return `/api/avatar?name=${encodeURIComponent(name||'RC')}&size=${size}&bg=${b}&color=${c}&shape=${shape}&pattern=${pattern}&shadow=${shadow?1:0}&glass=${glass?1:0}&t=${Date.now()}`
  },[name,bg,txt,size,shape,pattern,shadow,glass])

  const dl=async(f:'png'|'svg'|'webp'|'jpeg')=>{
    const r=await fetch(url); const t=await r.text()
    if(f==='svg'){ const bl=new Blob([t],{type:'image/svg+xml'}); const u=URL.createObjectURL(bl); const a=document.createElement('a'); a.href=u; a.download=`avatar-${Date.now()}.svg`; a.click(); URL.revokeObjectURL(u); return }
    const bl=new Blob([t],{type:'image/svg+xml'}); const u=URL.createObjectURL(bl); const img=new Image()
    img.onload=()=>{ const c=ref.current!; c.width=size; c.height=size; const ctx=c.getContext('2d')!; ctx.clearRect(0,0,size,size); ctx.drawImage(img,0,0,size,size); const a=document.createElement('a'); a.download=`avatar-${Date.now()}.${f}`; a.href=c.toDataURL(f==='jpeg'?'image/jpeg':f==='webp'?'image/webp':'image/png',0.95); a.click(); URL.revokeObjectURL(u) }
    img.src=u
  }

  return(
    <div className="min-h-screen bg-[#050507] text-white">
      <div className="max-w-[1100px] mx-auto px-4 py-6">
        <h1 className="text-3xl font-black text-center bg-gradient-to-r from-violet-300 to-cyan-300 bg-clip-text text-transparent">Avatar Generator</h1>
        <div className="grid lg:grid-cols-2 gap-6 mt-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-[28px] p-4">
            <div className="bg-black rounded-[24px] flex items-center justify-center p-6 min-h-[360px]">
              <img key={url} src={url} alt="avatar" style={{width:size>360?360:size, height:size>360?360:size}} className="rounded-[12px]"/>
            </div>
            <div className="grid grid-cols-4 gap-2 mt-3">
              <button onClick={()=>dl('png')} className="bg-white text-black py-3 rounded-full font-bold text-xs">PNG</button>
              <button onClick={()=>dl('svg')} className="bg-zinc-800 border border-zinc-700 py-3 rounded-full font-bold text-xs">SVG</button>
              <button onClick={()=>dl('webp')} className="bg-zinc-800 border border-zinc-700 py-3 rounded-full font-bold text-xs">WEBP</button>
              <button onClick={()=>dl('jpeg')} className="bg-zinc-800 border border-zinc-700 py-3 rounded-full font-bold text-xs">JPEG</button>
            </div>
            <canvas ref={ref} className="hidden"/>
          </div>
          <div className="space-y-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
              <label className="text-xs text-zinc-400">NAME</label>
              <input value={name} onChange={e=>setName(e.target.value)} className="w-full mt-2 p-3 bg-black border border-zinc-700 rounded-xl outline-none"/>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
              <p className="text-xs text-zinc-400 mb-2">SHAPE (Front 4 buttons)</p>
              <div className="grid grid-cols-4 gap-2">{['squircle','circle','rounded','square'].map(s=><button key={s} onClick={()=>setShape(s)} className={`py-3 rounded-xl border text-[11px] font-bold uppercase ${shape===s?'bg-white text-black':'bg-black border-zinc-800'}`}>{s}</button>)}</div>
              <p className="text-xs text-zinc-400 mb-2 mt-4">PATTERN (dots/grid/stripes/mesh)</p>
              <div className="grid grid-cols-4 gap-2">{['mesh','dots','grid','stripes'].map(p=><button key={p} onClick={()=>setPattern(p)} className={`py-3 rounded-xl border text-[11px] font-bold uppercase ${pattern===p?'bg-white text-black':'bg-black border-zinc-800'}`}>{p}</button>)}</div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
              <div className="flex gap-2"><input type="color" value={bg} onChange={e=>setBg(e.target.value)} className="w-14 h-12"/><input value={bg} onChange={e=>setBg(e.target.value)} className="flex-1 p-2 bg-black border border-zinc-700 rounded-xl font-mono text-sm"/></div>
              <div className="flex gap-2 mt-3"><input type="color" value={txt} onChange={e=>setTxt(e.target.value)} className="w-14 h-12"/><input value={txt} onChange={e=>setTxt(e.target.value)} className="flex-1 p-2 bg-black border border-zinc-700 rounded-xl font-mono text-sm"/></div>
              <input type="range" min="100" max="800" value={size} onChange={e=>setSize(parseInt(e.target.value))} className="w-full mt-4 accent-violet-600"/>
              <div className="grid grid-cols-2 gap-2 mt-3">
                <label className={`p-3 rounded-xl border flex gap-2 cursor-pointer ${shadow?'bg-violet-600/20 border-violet-600':'bg-black border-zinc-800'}`}><input type="checkbox" checked={shadow} onChange={e=>setShadow(e.target.checked)}/>Shadow</label>
                <label className={`p-3 rounded-xl border flex gap-2 cursor-pointer ${glass?'bg-cyan-600/20 border-cyan-600':'bg-black border-zinc-800'}`}><input type="checkbox" checked={glass} onChange={e=>setGlass(e.target.checked)}/>Glass</label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
