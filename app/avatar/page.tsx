"use client"
import { useState, useMemo, useRef } from 'react'

export default function AvatarPage(){
  const [name,setName]=useState('Ravi Patel')
  const [bg,setBg]=useState('#6d28d9')
  const [txt,setTxt]=useState('#ffffff')
  const [size,setSize]=useState(320)
  const [shape,setShape]=useState('squircle')
  const [pattern,setPattern]=useState('mesh')
  const [shadow,setShadow]=useState(true)
  const [glass,setGlass]=useState(false)
  const [emoji,setEmoji]=useState('🔥')
  const [useEmoji,setUseEmoji]=useState(false)
  const canvasRef=useRef<HTMLCanvasElement>(null)

  const bgHex=bg.replace('#',''); const txtHex=txt.replace('#','')
  const displayName = useEmoji && emoji? emoji : name

  const avatarUrl=useMemo(()=>`/api/avatar?name=${encodeURIComponent(displayName)}&size=${size}&bg=${bgHex}&color=${txtHex}&shape=${shape}&pattern=${pattern}&shadow=${shadow?1:0}&glass=${glass?1:0}`,[displayName,bgHex,txtHex,size,shape,pattern,shadow,glass])

  const download = async (format:'png'|'svg'|'webp'|'jpeg')=>{
    const r=await fetch(avatarUrl); const svgText=await r.text()
    if(format==='svg'){
      const blob=new Blob([svgText],{type:'image/svg+xml'}); const url=URL.createObjectURL(blob)
      const a=document.createElement('a'); a.href=url; a.download=`avatar-${Date.now()}.svg`; a.click(); URL.revokeObjectURL(url); return
    }
    const blob=new Blob([svgText],{type:'image/svg+xml'}); const url=URL.createObjectURL(blob)
    const img=new Image(); img.onload=()=>{
      const c=canvasRef.current!; c.width=size; c.height=size
      const ctx=c.getContext('2d')!; ctx.clearRect(0,0,size,size); ctx.drawImage(img,0,0,size,size)
      const a=document.createElement('a'); a.download=`avatar-${Date.now()}.${format}`
      a.href=c.toDataURL(format==='jpeg'?'image/jpeg': format==='webp'?'image/webp':'image/png', 0.92); a.click(); URL.revokeObjectURL(url)
    }; img.src=url
  }

  return(
    <div className="min-h-screen bg-[#050507] text-white overflow-x-hidden">
      <div className="max-w-[1100px] mx-auto px-4 py-6">
        <h1 className="text-[26px] md:text-5xl font-black text-center bg-gradient-to-r from-violet-300 via-pink-300 to-cyan-300 bg-clip-text text-transparent">Avatar Generator - Free Profile Picture Maker</h1>

        <div className="grid lg:grid-cols-2 gap-6 mt-8 items-start">
          {/* PREVIEW */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-[32px] p-4 sticky top-4">
            <div className={`bg-black rounded-[28px] flex flex-col items-center justify-center p-8 min-h-[420px] relative ${shadow?'shadow-[0_25px_80px_rgba(109,40,217,0.4)]':''}`}>
              {/* Gloss effect visible */}
              {glass && <div className="absolute top-0 left-0 w-full h-[50%] bg-gradient-to-b from-white/20 to-transparent rounded-t-[28px] pointer-events-none z-10"/>}
              <img src={avatarUrl} alt="avatar" className="relative z-0 transition-all duration-300" style={{width:Math.min(size,320), height:Math.min(size,320), borderRadius: shape==='circle'?'50%': shape==='squircle'?'26%': shape==='rounded'?'28px':'0', filter: shadow? 'drop-shadow(0 20px 30px rgba(0,0,0,0.6))' : 'none'}}/>
              <div className="mt-6 text-xs text-zinc-500">{pattern} • {shape} • {size}px • {shadow?'Shadow ON':'Shadow OFF'} • {glass?'Glass ON':''}</div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              <button onClick={()=>setBg('#'+Math.floor(Math.random()*16777215).toString(16).padStart(6,'0'))} className="bg-white text-black py-3.5 rounded-full font-bold text-sm">🎲 Random Color</button>
              <button onClick={()=>{navigator.clipboard.writeText(window.location.href); alert('Link copied')}} className="bg-violet-600 py-3.5 rounded-full font-bold text-sm">🔗 Share</button>
            </div>
            <div className="grid grid-cols-4 gap-2 mt-3">
              <button onClick={()=>download('png')} className="bg-zinc-800 border border-zinc-700 py-3 rounded-full text-xs font-bold">PNG</button>
              <button onClick={()=>download('svg')} className="bg-zinc-800 border border-zinc-700 py-3 rounded-full text-xs font-bold">SVG</button>
              <button onClick={()=>download('webp')} className="bg-zinc-800 border border-zinc-700 py-3 rounded-full text-xs font-bold">WEBP</button>
              <button onClick={()=>download('jpeg')} className="bg-zinc-800 border border-zinc-700 py-3 rounded-full text-xs font-bold">JPEG</button>
            </div>
            <canvas ref={canvasRef} className="hidden"/>
          </div>

          {/* CONTROLS */}
          <div className="space-y-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <label className="text-xs text-zinc-400 uppercase">Name / Initials</label>
              <input value={name} onChange={e=>setName(e.target.value)} className="w-full mt-2 p-4 bg-black border border-zinc-700 rounded-xl outline-none focus:border-violet-600"/>
              <div className="flex items-center gap-3 mt-4 p-3 bg-black border border-zinc-800 rounded-xl">
                <input type="checkbox" checked={useEmoji} onChange={e=>setUseEmoji(e.target.checked)} className="w-5 h-5 accent-violet-600"/>
                <span className="text-sm font-medium">Use Emoji as Avatar</span>
                <input value={emoji} onChange={e=>{setEmoji(e.target.value); if(e.target.value) setUseEmoji(true)}} placeholder="🔥" className="ml-auto w-[70px] p-2 bg-zinc-900 border border-zinc-700 rounded-lg text-center text-xl"/>
              </div>
              {useEmoji && <p className="text-[11px] text-green-400 mt-2">✓ Now emoji "{emoji}" will show as avatar</p>}
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <h3 className="font-bold mb-3">Color Menu - Click to Open Picker</h3>
              <div className="grid grid-cols-1 gap-4">
                <div><label className="text-xs text-zinc-400">Background</label><div className="flex gap-2 mt-2"><input type="color" value={bg} onChange={e=>setBg(e.target.value)} className="w-[56px] h-[48px] p-1 bg-black border border-zinc-700 rounded-xl cursor-pointer"/><input value={bg} onChange={e=>setBg(e.target.value)} className="flex-1 p-3 bg-black border border-zinc-700 rounded-xl text-sm font-mono"/><span className="px-3 py-3 bg-black border border-zinc-700 rounded-xl text-xs">{bg}</span></div></div>
                <div><label className="text-xs text-zinc-400">Text Color</label><div className="flex gap-2 mt-2"><input type="color" value={txt} onChange={e=>setTxt(e.target.value)} className="w-[56px] h-[48px] p-1 bg-black border border-zinc-700 rounded-xl cursor-pointer"/><input value={txt} onChange={e=>setTxt(e.target.value)} className="flex-1 p-3 bg-black border border-zinc-700 rounded-xl text-sm font-mono"/></div></div>
              </div>
              <div className="flex flex-wrap gap-2.5 mt-4">{['#6d28d9','#ec4899','#06b6d4','#f59e0b','#10b981','#000','#fff','#ff3b30'].map(c=><button key={c} onClick={()=>setBg(c)} className="w-10 h-10 rounded-full border-2 border-zinc-700" style={{background:c}}/>)}</div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-5">
              <div><p className="text-xs text-zinc-400 uppercase mb-2">Shape</p><div className="grid grid-cols-4 gap-2">{['squircle','circle','rounded','square'].map(s=><button key={s} onClick={()=>setShape(s)} className={`py-3 rounded-xl border text-xs uppercase font-bold ${shape===s?'bg-white text-black':'bg-black border-zinc-800'}`}>{s}</button>)}</div></div>
              <div><p className="text-xs text-zinc-400 uppercase mb-2">Pattern</p><div className="grid grid-cols-4 gap-2">{['mesh','dots','grid','stripes'].map(p=><button key={p} onClick={()=>setPattern(p)} className={`py-3 rounded-xl border text-xs uppercase font-bold ${pattern===p?'bg-white text-black':'bg-black border-zinc-800'}`}>{p}</button>)}</div></div>
              <div><label className="text-xs text-zinc-400">Size: {size}px</label><input type="range" min="64" max="800" value={size} onChange={e=>setSize(parseInt(e.target.value))} className="w-full accent-violet-600 mt-2"/></div>
              <div className="grid grid-cols-2 gap-3">
                <label className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer ${shadow?'bg-violet-600/20 border-violet-600':'bg-black border-zinc-800'}`}><input type="checkbox" checked={shadow} onChange={e=>setShadow(e.target.checked)} className="w-4 h-4"/> <span className="text-sm font-bold">Shadow Depth</span></label>
                <label className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer ${glass?'bg-cyan-600/20 border-cyan-600':'bg-black border-zinc-800'}`}><input type="checkbox" checked={glass} onChange={e=>setGlass(e.target.checked)} className="w-4 h-4"/> <span className="text-sm font-bold">Gloss Effect</span></label>
              </div>
              <p className="text-[11px] text-zinc-500">Shadow = avatar ke piche soft shadow. Gloss = upar se shiny white gradient, jaise iOS icon.</p>
            </div>
          </div>
        </div>

        <article className="mt-14">
          <h2 className="text-2xl md:text-3xl font-bold">Free Avatar Maker for Profile Pictures</h2>
          <p className="text-zinc-400 mt-3 leading-7">LoremProTool Avatar Generator is a free online tool...</p>
          <div className="mt-8 space-y-3">
            <details className="bg-zinc-900 border border-zinc-800 rounded-xl p-4"><summary className="font-bold cursor-pointer">What is Avatar Generator? (H2)</summary><p className="text-zinc-400 mt-2 text-sm leading-6">It creates letter avatars from initials with mesh gradient, squircle shape, patterns...</p></details>
            <details className="bg-zinc-900 border border-zinc-800 rounded-xl p-4"><summary className="font-bold cursor-pointer">How to Use? (H2)</summary><p className="text-zinc-400 mt-2 text-sm leading-6">Enter name, pick colors via color menu, choose shape/pattern, toggle shadow/gloss, enable emoji, download PNG/SVG/WEBP/JPEG...</p></details>
            <details className="bg-zinc-900 border border-zinc-800 rounded-xl p-4"><summary className="font-bold cursor-pointer">FAQ (H2)</summary><p className="text-zinc-400 mt-2 text-sm leading-6">Free? Yes. Supports Hindi? Yes. Download formats? PNG, SVG, WEBP, JPEG all working now.</p></details>
          </div>
        </article>
      </div>
    </div>
  )
}
