"use client"
import { useState, useMemo } from 'react'

export default function Page(){
  const [name,setName]=useState('Ravi Patel')
  const [size,setSize]=useState(320)
  const [bg,setBg]=useState('6d28d9')
  const [shape,setShape]=useState('squircle')
  const [pattern,setPattern]=useState('mesh')
  const avatarUrl = useMemo(()=>`/api/avatar?name=${encodeURIComponent(name)}&size=${size}&bg=${bg}&shape=${shape}&pattern=${pattern}`,[name,size,bg,shape,pattern])
  const handleShare = async () => {
    try{ if(navigator.share){ await navigator.share({title:'Avatar Generator - LoremProTool', url:window.location.href}) } else { await navigator.clipboard.writeText(window.location.href); alert('Link Copied! 🔗') } }catch{ await navigator.clipboard.writeText(window.location.href); alert('Link Copied! 🔗') }
  }
  const downloadPNG = () => { const a=document.createElement('a'); a.download=`avatar-${Date.now()}.svg`; a.href=avatarUrl; a.click() }

  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center">
      {/* SEO H1 - YE HATANA MAT */}
      <header className="text-center max-w-3xl">
        <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">Avatar Generator - Free Online Profile Picture Maker | LoremProTool</h1>
        <p className="mt-4 text-zinc-400">Create ultra pro mesh gradient avatars with initials. Free, no signup, squircle, circle, pattern, instant download PNG/SVG.</p>
      </header>

      <div className="mt-8 grid md:grid-cols-2 gap-8 w-full max-w-5xl">
        <div className="bg-zinc-900 p-6 rounded-[32px] border border-zinc-800">
          <img src={avatarUrl} id="avatar-img" className="w-full rounded-[24px]" style={{height:size,maxWidth:'100%'}}/>
          <div className="flex gap-2 mt-4">
            <button onClick={()=>setBg(Math.floor(Math.random()*16777215).toString(16))} className="flex-1 bg-white text-black py-3 rounded-full font-bold">🎲 Random</button>
            <button onClick={downloadPNG} className="flex-1 bg-zinc-800 py-3 rounded-full font-bold">⬇️ Download</button>
            <button onClick={handleShare} className="flex-1 bg-violet-600 py-3 rounded-full font-bold">🔗 Share</button>
          </div>
        </div>
        <div className="space-y-6">
          <input value={name} onChange={e=>setName(e.target.value)} className="w-full p-4 bg-zinc-900 border border-zinc-800 rounded-2xl" placeholder="Your Name"/>
          <div className="grid grid-cols-3 gap-2">
            {['squircle','circle','rounded'].map(s=><button key={s} onClick={()=>setShape(s)} className={`p-3 rounded-xl border ${shape===s?'bg-white text-black':'bg-zinc-900 border-zinc-800'}`}>{s}</button>)}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {['mesh','dots','grid'].map(p=><button key={p} onClick={()=>setPattern(p)} className={`p-3 rounded-xl border ${pattern===p?'bg-white text-black':'bg-zinc-900 border-zinc-800'}`}>{p}</button>)}
          </div>
          <input type="range" min="120" max="800" value={size} onChange={e=>setSize(parseInt(e.target.value))} className="w-full"/>
          <div className="flex gap-2">{['6d28d9','ec4899','06b6d4','f59e0b','10b981','000000'].map(c=><button key={c} onClick={()=>setBg(c)} className="w-10 h-10 rounded-full border-2 border-zinc-700" style={{background:'#'+c}}/>)}</div>
        </div>
      </div>

      {/* SEO Keywords Section - YE BHI SAFE HAI */}
      <section className="mt-16 max-w-5xl w-full text-zinc-500 text-sm">
        <h2 className="text-white font-bold text-xl mb-3">Free Avatar Maker for Profile Pictures</h2>
        <p>Keywords: avatar generator, profile picture maker, letter avatar, initial avatar, gradient avatar generator, free avatar creator, Discord avatar maker, GitHub avatar, LoremProTool avatar</p>
      </section>
    </div>
  )
}
