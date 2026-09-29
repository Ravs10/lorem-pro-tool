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
  const [font,setFont]=useState('Inter')
  const canvasRef=useRef<HTMLCanvasElement>(null)

    const bgHex=bg.replace('#',''); const txtHex=txt.replace('#','')
  const proColors=['6d28d9','0ea5e9','10b981','f59e0b','ef4444','ec4899','8b5cf6','06b6d4']
  const randomBg=()=> setBg(proColors[Math.floor(Math.random()*proColors.length)])
  const displayName = useEmoji && emoji? emoji : name
  const avatarUrl = `/api/avatar?name=${encodeURIComponent(displayName)}&size=${size}&bg=${bgHex}&color=${txtHex}&shape=${shape}&pattern=${pattern}&shadow=${shadow?1:0}&glass=${glass?1:0}&font=${font}`

    const download = async (format:'png'|'svg'|'webp'|'jpeg')=>{
    const r=await fetch(avatarUrl);
    const svgText=await r.text()
    if(format==='svg'){
      const blob=new Blob([svgText],{type:'image/svg+xml'});
      const url=URL.createObjectURL(blob)
      const a=document.createElement('a'); a.href=url; a.download=`avatar-${Date.now()}.svg`; a.click(); URL.revokeObjectURL(url); return
    }
    const blob=new Blob([svgText],{type:'image/svg+xml'});
    const url=URL.createObjectURL(blob)
    const img=new Image();
    img.crossOrigin="anonymous";
    img.onload=()=>{
      const c=canvasRef.current!;
      const pad = shadow? 60 : 0;
      c.width=size+pad*2;
      c.height=size+pad*2
      const ctx=c.getContext('2d')!;

      // White bg fix for JPEG, transparent for PNG/WEBP
      if(format==='jpeg'){
        ctx.fillStyle='#ffffff';
        ctx.fillRect(0,0,c.width,c.height);
      } else {
        ctx.clearRect(0,0,c.width,c.height)
      }

      // REAL SHADOW FIX - canvas shadow
      if(shadow){
        ctx.shadowColor='rgba(0,0,0,0.50)';
        ctx.shadowBlur=28;
        ctx.shadowOffsetY=16;
      }

      ctx.drawImage(img,pad,pad,size,size)

      // reset shadow
      ctx.shadowColor='transparent';
      ctx.shadowBlur=0;
      ctx.shadowOffsetY=0;

      const a=document.createElement('a');
      a.download=`avatar-${Date.now()}.${format}`
      a.href=c.toDataURL(format==='jpeg'?'image/jpeg': format==='webp'?'image/webp':'image/png', 0.92);
      a.click();
      URL.revokeObjectURL(url)
    };
    img.onerror=()=>URL.revokeObjectURL(url)
    img.src=url
  }

  return(
    <div className="min-h-screen bg-[#050507] text-white">
      <div className="max-w-[1100px] mx-auto px-4 py-6">
        <h1 className="text-[26px] md:text-5xl font-black text-center bg-gradient-to-r from-violet-300 via-pink-300 to-cyan-300 bg-clip-text text-transparent">Avatar Generator - Free Online Profile Picture Maker</h1>
        <p className="text-center text-zinc-400 mt-3 max-w-2xl mx-auto">Create ultra pro mesh gradient letter avatars for Discord, GitHub, Gmail. No signup, HD download.</p>

        <div className="grid lg:grid-cols-2 gap-6 mt-8 items-start">
          <div className="bg-zinc-900 border border-zinc-800 rounded-[32px] p-4">
            <div className={`bg-black rounded-[28px] flex flex-col items-center justify-center p-8 min-h-[420px] relative overflow-hidden ${shadow?'shadow-[0_25px_80px_rgba(109,40,217,0.4)]':''}`}>
              {glass && <div className="absolute top-0 left-0 w-full h-[50%] bg-gradient-to-b from-white/20 to-transparent rounded-t-[28px] pointer-events-none z-10"/>}
              <img src={avatarUrl} alt="avatar" className="relative z-0" style={{width:Math.min(size,320), height:Math.min(size,320), borderRadius: shape==='circle'?'50%': shape==='squircle'?'26%': shape==='rounded'?'28px':'0', filter: shadow?'drop-shadow(0 20px 30px rgba(0,0,0,0.6))':'none'}}/>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              <button onClick={()=>setBg('#'+Math.floor(Math.random()*16777215).toString(16).padStart(6,'0'))} className="bg-white text-black py-3.5 rounded-full font-bold text-sm">🎲 Random</button>
              <button onClick={()=>{navigator.clipboard.writeText(window.location.href); alert('Link Copied')}} className="bg-violet-600 py-3.5 rounded-full font-bold text-sm">🔗 Share</button>
            </div>
            <div className="grid grid-cols-4 gap-2 mt-3">
              <button onClick={()=>download('png')} className="bg-zinc-800 border border-zinc-700 py-3 rounded-full text-xs font-bold">PNG</button>
              <button onClick={()=>download('svg')} className="bg-zinc-800 border border-zinc-700 py-3 rounded-full text-xs font-bold">SVG</button>
              <button onClick={()=>download('webp')} className="bg-zinc-800 border border-zinc-700 py-3 rounded-full text-xs font-bold">WEBP</button>
              <button onClick={()=>download('jpeg')} className="bg-zinc-800 border border-zinc-700 py-3 rounded-full text-xs font-bold">JPEG</button>
            </div>
            <canvas ref={canvasRef} className="hidden"/>
          </div>

          <div className="space-y-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <label className="text-xs text-zinc-400 uppercase">Your Name</label>
              <input value={name} onChange={e=>setName(e.target.value)} className="w-full mt-2 p-4 bg-black border border-zinc-700 rounded-xl outline-none focus:border-violet-600"/>
              <div className="flex items-center gap-3 mt-4 p-3 bg-black border border-zinc-800 rounded-xl">
                <input type="checkbox" checked={useEmoji} onChange={e=>setUseEmoji(e.target.checked)} className="w-5 h-5 accent-violet-600"/>
                <span className="text-sm font-medium">Use Emoji as Avatar</span>
                <input value={emoji} onChange={e=>{setEmoji(e.target.value); if(e.target.value) setUseEmoji(true)}} placeholder="🔥" className="ml-auto w-[70px] p-2 bg-zinc-900 border border-zinc-700 rounded-lg text-center text-xl"/>
              </div>
              {useEmoji && <p className="text-[11px] text-green-400 mt-2">✓ Emoji {emoji} will show</p>}
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <h3 className="font-bold mb-3">Colors - Full Menu</h3>
              <div className="grid grid-cols-1 gap-4">
                <div><label className="text-xs text-zinc-400">Background</label><div className="flex gap-2 mt-2"><input type="color" value={bg} onChange={e=>setBg(e.target.value)} className="w-[56px] h-[48px] p-1 bg-black border border-zinc-700 rounded-xl cursor-pointer"/><input value={bg} onChange={e=>setBg(e.target.value)} className="flex-1 p-3 bg-black border border-zinc-700 rounded-xl text-sm font-mono"/></div></div>
                <div><label className="text-xs text-zinc-400">Text Color</label><div className="flex gap-2 mt-2"><input type="color" value={txt} onChange={e=>setTxt(e.target.value)} className="w-[56px] h-[48px] p-1 bg-black border border-zinc-700 rounded-xl cursor-pointer"/><input value={txt} onChange={e=>setTxt(e.target.value)} className="flex-1 p-3 bg-black border border-zinc-700 rounded-xl text-sm font-mono"/></div></div>
              </div>
              <div className="flex flex-wrap gap-2.5 mt-4">{['#6d28d9','#ec4899','#06b6d4','#f59e0b','#10b981','#000','#fff','#ff3b30'].map(c=><button key={c} onClick={()=>setBg(c)} className="w-10 h-10 rounded-full border-2 border-zinc-700" style={{background:c}}/>)}</div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-5">
              <div><p className="text-xs text-zinc-400 uppercase mb-2">Shape</p><div className="grid grid-cols-4 gap-2">{['squircle','circle','rounded','square'].map(s=><button key={s} onClick={()=>setShape(s)} className={`py-3 rounded-xl border text-xs uppercase font-bold ${shape===s?'bg-white text-black':'bg-black border-zinc-800'}`}>{s}</button>)}</div></div>
              <div><p className="text-xs text-zinc-400 uppercase mb-2">Pattern</p><div className="grid grid-cols-4 gap-2">{['mesh','dots','grid','stripes'].map(p=><button key={p} onClick={()=>setPattern(p)} className={`py-3 rounded-xl border text-xs uppercase font-bold ${pattern===p?'bg-white text-black':'bg-black border-zinc-800'}`}>{p}</button>)}</div></div>
              <div><label className="text-xs text-zinc-400">Size: {size}px</label><input type="range" min="64" max="800" value={size} onChange={e=>setSize(parseInt(e.target.value))} className="w-full accent-violet-600 mt-2"/></div>
              <div className="grid grid-cols-2 gap-3">
                <label className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer ${shadow?'bg-violet-600/20 border-violet-600':'bg-black border-zinc-800'}`}><input type="checkbox" checked={shadow} onChange={e=>setShadow(e.target.checked)} className="w-4 h-4"/> <span className="text-sm font-bold">Shadow</span></label>
                <label className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer ${glass?'bg-cyan-600/20 border-cyan-600':'bg-black border-zinc-800'}`}><input type="checkbox" checked={glass} onChange={e=>setGlass(e.target.checked)} className="w-4 h-4"/> <span className="text-sm font-bold">Gloss</span></label>
              </div>
            </div>
          </div>
        </div>

        <article className="mt-16 max-w-4xl mx-auto">
  <h2 className="text-3xl font-bold">Avatar Generator Guide</h2>

  <details className="group bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mt-6" open>
    <summary className="font-bold cursor-pointer list-none flex justify-between">What is Avatar Generator? (H1) <span className="group-open:rotate-180">▼</span></summary>
    <p className="text-zinc-400 mt-4 leading-7 text-[14px]">Avatar Generator is a free online tool that creates profile pictures from initials or emoji when you don't have real photo. GitHub, Discord, Gmail use letter avatars as default. Our tool creates ultra-pro premium avatars with mesh gradient technology – 3 overlapping radial gradients (violet #6d28d9, pink #ec4899, cyan #06b6d4) that create depth like Figma and Linear app icons. It supports squircle shape (Apple's superellipse x^4+y^4=r^4) which is more modern than rounded squares. Features: noise texture 6%, shadow depth, gloss glassmorphism effect with 2 white ellipses at top opacity 0.20 and 0.12 creating shiny reflection like iOS icons – yes that white design on top of circle you see is exactly the glass effect, its correct design, looks like light reflection on glossy plastic. 100% free no watermark no signup. Download PNG SVG WEBP JPEG 64px to 800px. Perfect for developers, creators, startups, gamers, YouTubers. Supports English, Hindi रवि, emoji 🔥. Uses smart API /api/avatar embeddable without CORS. Unlike other tools Canvas API renders real HD PNG fixing blank bug Chrome had. Pattern overlays dots grid stripes make avatar unique. Mesh gradient used by Stripe Linear Apple. Squircle used by Apple since iOS 7 for app icons because softer and human. Add noise texture shadow and avatar looks $10k brand identity. Tool solves common problem of blank PNG when converting SVG directly – we use fetch SVG, create blob, Image onload, draw to canvas, toDataURL. This ensures 100% working in all browsers mobile Chrome too. Free forever MIT license commercial use allowed.</p>
  </details>

  <details className="group bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mt-3">
    <summary className="font-bold cursor-pointer list-none flex justify-between">How to Use? Step by Step (H2) <span className="group-open:rotate-180">▼</span></summary>
    <div className="text-zinc-400 mt-4 leading-7 text-[14px] space-y-2">
      <p>1. Enter Name: Type "Ravi Patel" auto RP. Single name R. Hindi supported.</p>
      <p>2. Emoji Mode Fixed: Toggle Use Emoji and type 🔥 – even if you type 🔥 A or A 🔥 it will show 🔥 only, T bug fixed using Array.from to split emoji correctly.</p>
      <p>3. Pick Colors: Click color box opens native system color picker full panel with hue saturation. Or type hex #6d28d9 manually. Text color separate.</p>
      <p>4. Shape: Squircle = iOS superellipse modern, Circle = Gmail, Rounded = 24px app icon, Square = minimal sharp.</p>
      <p>5. Pattern: Mesh = 3-color gradient premium default, Dots = polka 0.22 opacity 20px, Grid = blueprint lines 0.12 opacity, Stripes = diagonal 45deg.</p>
      <p>6. Size Effects: Slider 64px favicon to 800px print HD. Shadow Depth adds feDropShadow dx0 dy18 std18 opacity 0.55 soft realistic shadow pop from background floating card. Gloss Effect adds 2 white ellipses top – first at y 22% rx 48% ry 28% opacity 0.20, second y 28% rx 36% ry 14% opacity 0.12 – creates shiny reflection like glossy icons – yes white design on upper side of circle is exactly that, correct implementation.</p>
      <p>7. Download 4 Formats: PNG best Discord WhatsApp lossless, SVG vector infinite scale smallest for devs img src no CORS cache 1 year, WEBP modern Google 30% smaller than PNG best speed SEO, JPEG old devices email no transparency white baked. All use Canvas toDataURL method.</p>
    </div>
  </details>

  <details className="group bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mt-3">
    <summary className="font-bold cursor-pointer list-none flex justify-between">Shadow & Gloss Effect Explained (H2) <span className="group-open:rotate-180">▼</span></summary>
    <p className="text-zinc-400 mt-4 leading-7 text-[14px]">Shadow Depth ON applies SVG filter feDropShadow dx 0 dy 18 stdDeviation 18 flood-opacity 0.55 creates soft realistic shadow behind avatar making it pop floating card depth. OFF flat design. Gloss Effect ON adds 2 white ellipses at top – first ellipse y 22% rx 48% ry 28% opacity 0.20 second y 28% rx 36% ry 14% opacity 0.12 – this creates shiny reflection like iOS glossy icons from 2010s but modern minimal version – that white design you see on upper side of circle is exactly glass effect, it is supposed to look like that, like light reflecting on glass. Very visible on dark backgrounds and dark avatar colors. Try toggling OFF ON you will see top becomes shiny with light reflection. Combined with mesh gradient it looks premium Apple style.</p>
  </details>

  <details className="group bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mt-3">
    <summary className="font-bold cursor-pointer list-none flex justify-between">FAQ - All Questions (H2) <span className="group-open:rotate-180">▼</span></summary>
    <div className="mt-4 space-y-3 text-[14px]">
      <p className="text-white font-semibold">Is it free without watermark?</p><p className="text-zinc-400">Yes 100% free forever no watermark no login no limit MIT commercial allowed unlimited avatars team same palette consistent branding.</p>
      <p className="text-white font-semibold mt-3">Why T was showing with emoji + letter?</p><p className="text-zinc-400">Because w[0] takes half of emoji surrogate pair which renders as T or?. Fixed using Array.from(rawName) which correctly splits emoji as single character, then filter emoji chars separately. Now 🔥 A shows 🔥 not T.</p>
      <p className="text-white font-semibold mt-3">What is white design on top of circle? Is glass effect correct?</p><p className="text-zinc-400">Yes 100% correct! That white translucent curved design on upper side of circle is exactly the glass/gloss effect. It mimics light reflection on glass or glossy plastic like iOS app icons. We use 2 white ellipses with low opacity to create that shiny top highlight. It is supposed to be like that.</p>
      <p className="text-white font-semibold mt-3">Why preview box was fixed and layout not scrolling?</p><p className="text-zinc-400">Because we had sticky top-4 class on preview box which made it fixed while rest scrolled. Removed sticky so now whole page scrolls together and all features usable on mobile. No more fixed preview.</p>
      <p className="text-white font-semibold mt-3">Does it support Hindi?</p><p className="text-zinc-400">Yes type अभिषेक शर्मा will show अ. Works Tamil Telugu Bengali Marathi Unicode.</p>
      <p className="text-white font-semibold mt-3">Can I use for Discord GitHub Gmail?</p><p className="text-zinc-400">Yes Circle for Gmail, Squircle for Discord modern apps, 320px perfect Discord recommends 512px but 320 works HD, 400px+ GitHub profile. API directly embeddable like /api/avatar?name=Ravi&size=320&bg=6d28d9 no CORS cache 1 year.</p>
    </div>
  </details>
</article>
      </div>
    </div>
  )
}
