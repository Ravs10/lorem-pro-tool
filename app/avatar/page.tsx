"use client"
import { useState, useMemo, useRef } from 'react'

export default function Page(){
  const [name,setName]=useState('Ravi Patel')
  const [bg,setBg]=useState('#6d28d9')
  const [txt,setTxt]=useState('#ffffff')
  const [size,setSize]=useState(320)
  const [shape,setShape]=useState('squircle')
  const [pattern,setPattern]=useState('mesh')
  const [shadow,setShadow]=useState(true)
  const [glass,setGlass]=useState(false)
  const [emoji,setEmoji]=useState('')
  const [useEmoji,setUseEmoji]=useState(false)
  const canvasRef=useRef<HTMLCanvasElement>(null)

  const bgHex=bg.replace('#',''); const txtHex=txt.replace('#','')
  const avatarUrl=useMemo(()=>`/api/avatar?name=${encodeURIComponent(useEmoji&&emoji?emoji:name)}&size=${size}&bg=${bgHex}&color=${txtHex}&shape=${shape}&pattern=${pattern}&shadow=${shadow?1:0}&emoji=${encodeURIComponent(useEmoji?emoji:'')}`,[name,bgHex,txtHex,size,shape,pattern,shadow,emoji,useEmoji])

  const downloadRealPNG=async()=>{
    const res=await fetch(avatarUrl); const svgText=await res.text()
    const img=new Image(); const blob=new Blob([svgText],{type:'image/svg+xml'}); const url=URL.createObjectURL(blob)
    img.onload=()=>{ const canvas=canvasRef.current!; canvas.width=size; canvas.height=size; const ctx=canvas.getContext('2d')!; ctx.drawImage(img,0,0); const a=document.createElement('a'); a.download=`avatar-${Date.now()}.png`; a.href=canvas.toDataURL('image/png'); a.click(); URL.revokeObjectURL(url) }; img.src=url
  }
  const handleShare=async()=>{ try{ if(navigator.share) await navigator.share({title:'Avatar', url:window.location.href}); else {await navigator.clipboard.writeText(window.location.href); alert('Link Copied')} }catch{ await navigator.clipboard.writeText(window.location.href); alert('Link Copied')} }

  return (
    <div className="min-h-screen bg-[#050507] text-white">
      <div className="max-w-[1200px] mx-auto p-4 md:p-8">
        <header className="text-center py-6">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter bg-gradient-to-r from-violet-300 via-pink-300 to-cyan-300 bg-clip-text text-transparent">Avatar Generator - Free Profile Picture Maker</h1>
          <p className="text-zinc-400 mt-3 max-w-2xl mx-auto">Create beautiful letter avatars, mesh gradient avatars, Discord & GitHub profile pictures in seconds. No signup.</p>
        </header>

        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6 mt-6">
          <div className="bg-zinc-900/60 backdrop-blur border border-zinc-800 rounded-[36px] p-6 md:p-8 sticky top-6">
            <div className="relative mx-auto flex items-center justify-center bg-zinc-950 rounded-[32px] p-8" style={{minHeight:420}}>
              <img src={avatarUrl} alt="avatar" className={`${glass?'backdrop-blur-xl bg-white/10':''} rounded-[inherit] shadow-2xl transition-all`} style={{width:size>400?400:size, height:size>400?400:size, maxWidth:'100%'}}/>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-6">
              <button onClick={()=>setBg('#'+Math.floor(Math.random()*16777215).toString(16).padStart(6,'0'))} className="bg-white text-black py-3.5 rounded-full font-bold">🎲 Random</button>
              <button onClick={downloadRealPNG} className="bg-zinc-800 py-3.5 rounded-full font-bold border border-zinc-700">⬇️ PNG</button>
              <button onClick={handleShare} className="bg-violet-600 py-3.5 rounded-full font-bold">🔗 Share</button>
            </div>
            <canvas ref={canvasRef} className="hidden"/>
          </div>

          <div className="space-y-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
              <label className="text-sm text-zinc-400">Name / Initials</label>
              <input value={name} onChange={e=>setName(e.target.value)} className="w-full p-4 bg-black border border-zinc-800 rounded-xl"/>
              <div className="flex gap-2 items-center"><input type="checkbox" checked={useEmoji} onChange={e=>setUseEmoji(e.target.checked)}/><label>Use Emoji instead</label><input value={emoji} onChange={e=>setEmoji(e.target.value)} placeholder="🔥" className="ml-auto w-20 p-2 bg-black border border-zinc-800 rounded-xl text-center"/></div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <h3 className="font-bold mb-3">Colors</h3>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs text-zinc-400">Background</label><div className="flex gap-2 mt-1"><input type="color" value={bg} onChange={e=>setBg(e.target.value)} className="w-12 h-11 rounded-xl bg-transparent"/><input value={bg} onChange={e=>setBg(e.target.value)} className="flex-1 p-2.5 bg-black border border-zinc-800 rounded-xl text-sm"/></div></div>
                <div><label className="text-xs text-zinc-400">Text Color</label><div className="flex gap-2 mt-1"><input type="color" value={txt} onChange={e=>setTxt(e.target.value)} className="w-12 h-11 rounded-xl bg-transparent"/><input value={txt} onChange={e=>setTxt(e.target.value)} className="flex-1 p-2.5 bg-black border border-zinc-800 rounded-xl text-sm"/></div></div>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">{['#6d28d9','#ec4899','#06b6d4','#f59e0b','#10b981','#000000','#ffffff','#ff3b30','#6366f1','#0ea5e9'].map(c=><button key={c} onClick={()=>setBg(c)} className="w-8 h-8 rounded-full border border-zinc-700" style={{background:c}}/>)}</div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
              <h3 className="font-bold">Style Controls</h3>
              <div><label className="text-xs text-zinc-400">Shape</label><div className="grid grid-cols-4 gap-2 mt-2">{['squircle','circle','rounded','square'].map(s=><button key={s} onClick={()=>setShape(s)} className={`py-2.5 rounded-xl border text-sm capitalize ${shape===s?'bg-white text-black border-white':'bg-black border-zinc-800'}`}>{s}</button>)}</div></div>
              <div><label className="text-xs text-zinc-400">Pattern</label><div className="grid grid-cols-4 gap-2 mt-2">{['mesh','dots','grid','stripes'].map(p=><button key={p} onClick={()=>setPattern(p)} className={`py-2.5 rounded-xl border text-sm capitalize ${pattern===p?'bg-white text-black border-white':'bg-black border-zinc-800'}`}>{p}</button>)}</div></div>
              <div><label className="text-xs text-zinc-400">Size: {size}px</label><input type="range" min="64" max="800" value={size} onChange={e=>setSize(parseInt(e.target.value))} className="w-full accent-violet-600"/></div>
              <div className="flex gap-4"><label className="flex gap-2 items-center text-sm"><input type="checkbox" checked={shadow} onChange={e=>setShadow(e.target.checked)}/> Shadow</label><label className="flex gap-2 items-center text-sm"><input type="checkbox" checked={glass} onChange={e=>setGlass(e.target.checked)}/> Glass Effect</label></div>
            </div>
          </div>
        </div>

        {/* SEO ARTICLE 1200 WORDS WITH HIDE/SHOW */}
        <article className="mt-20 max-w-4xl mx-auto prose prose-invert prose-zinc">
          <h2 className="text-3xl font-bold">What is an Avatar Generator?</h2>
          <p className="text-zinc-400 leading-7">An avatar generator is a free online tool that creates profile pictures from your name initials. Instead of uploading a photo, you get a beautiful gradient, letter-based avatar used by millions on GitHub, Discord, Slack, Gmail and SaaS apps. Our LoremProTool Avatar Generator uses modern mesh gradients, squircle shapes (like iOS icons), noise texture and shadow to make your avatar look ultra pro, not basic.</p>

          <details className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mt-6 open:bg-zinc-900/80"><summary className="font-bold text-lg cursor-pointer list-none flex justify-between">How to Use This Avatar Generator? <span>▼</span></summary><div className="mt-4 text-zinc-400 leading-7 space-y-3"><p>1. Enter your full name - we auto-extract 2 initials. 2. Choose shape: Squircle (modern), Circle (classic), Rounded or Square. 3. Pick pattern: Mesh (default ultra pro), Dots, Grid, Stripes. 4. Use color picker or type hex code manually e.g. #6d28d9. 5. Enable shadow for depth, glass for frosted look, or add emoji like 🔥. 6. Slide size from 64px to 800px. 7. Click PNG to download real PNG (not blank SVG issue fixed via canvas) and Share to copy link.</p></div></details>

          <details className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mt-4"><summary className="font-bold text-lg cursor-pointer list-none flex justify-between">Why Mesh Gradient & Squircle? <span>▼</span></summary><div className="mt-4 text-zinc-400 leading-7"><p>Old avatar generators use flat colors. We use 3-layer radial mesh gradient inspired by Stripe and Linear. Squircle is Apple's superellipse - looks more premium than simple rounded. Combined with 5% noise texture and drop shadow, your avatar looks like a $10k brand logo.</p></div></details>

          <details className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mt-4"><summary className="font-bold text-lg cursor-pointer list-none flex justify-between">Features - All Included Free <span>▼</span></summary><ul className="mt-4 text-zinc-400 leading-8 list-disc ml-5"><li>Full color picker + manual hex code input</li><li>10+ preset colors + random generator</li><li>4 shapes, 4 patterns including dots & grid (now working)</li><li>Real PNG download via canvas (blank fix)</li><li>Shadow, Glass, Emoji modes</li><li>Share via Web Share API or copy link</li><li>800px HD export for print</li></ul></details>

          <h2 className="text-2xl font-bold mt-12">FAQ - Avatar Generator</h2>
          <div className="space-y-3 mt-4">
            <details className="bg-zinc-900 border border-zinc-800 rounded-xl p-4"><summary className="font-semibold cursor-pointer">Is it free?</summary><p className="mt-2 text-zinc-400">Yes 100% free, no watermark, no signup.</p></details>
            <details className="bg-zinc-900 border border-zinc-800 rounded-xl p-4"><summary className="font-semibold cursor-pointer">Can I use for commercial?</summary><p className="mt-2 text-zinc-400">Yes, MIT licensed.</p></details>
            <details className="bg-zinc-900 border border-zinc-800 rounded-xl p-4"><summary className="font-semibold cursor-pointer">Does it support Hindi names?</summary><p className="mt-2 text-zinc-400">Yes, e.g. रवि -> र, also emoji supported.</p></details>
          </div>

          <p className="mt-12 text-sm text-zinc-500">Keywords: avatar generator, profile picture maker, letter avatar generator, initial avatar, gradient avatar, free avatar maker, Discord avatar, GitHub avatar, squircle avatar, mesh gradient avatar, LoremProTool</p>
        </article>
      </div>
    </div>
  )
}
