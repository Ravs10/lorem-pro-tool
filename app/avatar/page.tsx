"use client"
import { useState, useRef } from 'react'

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
  const [font,setFont]=useState('Inter')
  const canvasRef=useRef<HTMLCanvasElement>(null)

  const bgHex=bg.replace('#',''); const txtHex=txt.replace('#','')
  const proColors=['6d28d9','0ea5e9','10b981','f59e0b','ef4444','ec4899','8b5cf6','06b6d4']
  const randomBg=()=> setBg('#'+proColors[Math.floor(Math.random()*proColors.length)])
  const displayName = useEmoji && emoji? emoji : name
  const avatarUrl = `/api/avatar?name=${encodeURIComponent(displayName)}&size=${size}&bg=${bgHex}&color=${txtHex}&shape=${shape}&pattern=${pattern}&shadow=${shadow?1:0}&glass=${glass?1:0}&font=${font}`

  const download = async (format:'png'|'svg'|'webp'|'jpeg')=>{
    const r=await fetch(avatarUrl); const svgText=await r.text()
    if(format==='svg'){
      const blob=new Blob([svgText],{type:'image/svg+xml'}); const url=URL.createObjectURL(blob)
      const a=document.createElement('a'); a.href=url; a.download=`avatar-${Date.now()}.svg`; a.click(); URL.revokeObjectURL(url); return
    }
    const blob=new Blob([svgText],{type:'image/svg+xml'}); const url=URL.createObjectURL(blob)
    const img=new Image(); img.crossOrigin="anonymous";
    img.onload=()=>{
      const c=canvasRef.current!; const pad = shadow? 60 : 0; c.width=size+pad*2; c.height=size+pad*2
      const ctx=c.getContext('2d')!; if(format==='jpeg'){ ctx.fillStyle='#ffffff'; ctx.fillRect(0,0,c.width,c.height)} else ctx.clearRect(0,0,c.width,c.height)
      if(shadow){ ctx.shadowColor='rgba(0,0,0,0.50)'; ctx.shadowBlur=28; ctx.shadowOffsetY=16; }
      ctx.drawImage(img,pad,pad,size,size); ctx.shadowColor='transparent'; ctx.shadowBlur=0; ctx.shadowOffsetY=0;
      const a=document.createElement('a'); a.download=`avatar-${Date.now()}.${format}`; a.href=c.toDataURL(format==='jpeg'?'image/jpeg':'image/png'); a.click(); URL.revokeObjectURL(url)
    }; img.onerror=()=>URL.revokeObjectURL(url); img.src=url
  }

return(
 <div className="min-h-screen bg-[#050507] text-white p-4">
  <div className="max-w-[1100px] mx-auto">
   <h1 className="text-[26px] md:text-5xl font-bold text-center">Avatar Generator</h1>
   <p className="text-center text-zinc-400 mb-6">Pro Letter + Emoji Avatars</p>

   <div className="grid lg:grid-cols-2 gap-6">
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col items-center">
      <div className={`bg-black rounded-[32px] p-6 relative ${shadow?'shadow-2xl':''}`}>
        {glass && <div className="absolute top-0 left-0 w-full h-1/2 bg-white/10 rounded-t-[32px] blur-sm"></div>}
        <img src={avatarUrl} alt="avatar" width={size} height={size} className="rounded-[inherit]" />
      </div>
      <div className="grid grid-cols-2 gap-2 w-full mt-4">
        <button onClick={randomBg} className="bg-white text-black font-bold py-2 rounded-lg">🎲 Random BG</button>
        <button onClick={()=>{navigator.clipboard.writeText(avatarUrl)}} className="bg-zinc-800 py-2 rounded-lg">Copy Link</button>
      </div>
      <div className="grid grid-cols-4 gap-2 w-full mt-3">
        <button onClick={()=>download('png')} className="bg-zinc-800 py-2 rounded">PNG</button>
        <button onClick={()=>download('svg')} className="bg-zinc-800 py-2 rounded">SVG</button>
        <button onClick={()=>download('webp')} className="bg-zinc-800 py-2 rounded">WEBP</button>
        <button onClick={()=>download('jpeg')} className="bg-zinc-800 py-2 rounded">JPEG</button>
      </div>
      <canvas ref={canvasRef} className="hidden"></canvas>
    </div>

    <div className="space-y-4">
     <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
       <label className="text-xs text-zinc-400">NAME / EMOJI</label>
       <input value={name} onChange={e=>setName(e.target.value)} className="w-full bg-black border border-zinc-700 rounded p-2 mt-1" />
       <div className="flex items-center gap-2 mt-2">
         <input type="checkbox" checked={useEmoji} onChange={e=>setUseEmoji(e.target.checked)} />
         <span className="text-sm">Use Emoji Mode</span>
         <input value={emoji} onChange={e=>setEmoji(e.target.value)} className="ml-auto w-16 bg-black border border-zinc-700 rounded p-1 text-center" />
       </div>
     </div>

     <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
       <h3 className="font-bold mb-3">Colors & Size</h3>
       <div className="grid grid-cols-2 gap-3">
         <div><label className="text-xs text-zinc-400">BG Color</label><div className="flex gap-2 mt-1 flex-wrap">
           {proColors.map(c=><button key={c} onClick={()=>setBg('#'+c)} style={{background:'#'+c}} className="w-8 h-8 rounded-full border-2 border-zinc-700"></button>)}
         </div></div>
         <div><label className="text-xs text-zinc-400">Text Color</label><input type="color" value={txt} onChange={e=>setTxt(e.target.value)} className="w-full h-9 mt-1"/></div>
       </div>
       <div className="mt-3"><label className="text-xs text-zinc-400">Font Family (NEW)</label>
         <select value={font} onChange={e=>setFont(e.target.value)} className="w-full bg-black border border-zinc-700 rounded p-2 mt-1">
           <option>Inter</option><option>Poppins</option><option>Montserrat</option><option>Space Grotesk</option><option>JetBrains Mono</option>
         </select>
       </div>
       <div className="mt-3"><label className="text-xs text-zinc-400">Size: {size}px</label><input type="range" min={64} max={800} value={size} onChange={e=>setSize(parseInt(e.target.value))} className="w-full"/></div>
       <div className="flex gap-4 mt-3">
         <label className={`flex items-center gap-2 text-sm`}><input type="checkbox" checked={shadow} onChange={e=>setShadow(e.target.checked)}/> Shadow</label>
         <label className={`flex items-center gap-2 text-sm`}><input type="checkbox" checked={glass} onChange={e=>setGlass(e.target.checked)}/> Glass</label>
       </div>
     </div>

     <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
       <div><p className="text-xs text-zinc-400 mb-2">SHAPE</p><div className="grid grid-cols-3 gap-2">
         {['squircle','circle','rounded','square'].map(s=><button key={s} onClick={()=>setShape(s)} className={`py-2 rounded text-xs capitalize ${shape===s?'bg-white text-black':'bg-zinc-800'}`}>{s}</button>)}
       </div></div>
       <div className="mt-3"><p className="text-xs text-zinc-400 mb-2">PATTERN</p><div className="grid grid-cols-3 gap-2">
         {['none','mesh','dots','grid','stripes'].map(p=><button key={p} onClick={()=>setPattern(p)} className={`py-2 rounded text-xs capitalize ${pattern===p?'bg-white text-black':'bg-zinc-800'}`}>{p}</button>)}
       </div></div>
     </div>
    </div>
   </div>
  </div>
 </div>
)
}
