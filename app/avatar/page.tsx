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
  const [showAll,setShowAll]=useState(true)
  const canvasRef=useRef<HTMLCanvasElement>(null)

  const bgHex=bg.replace('#',''); const txtHex=txt.replace('#','')
  const proColors=['6d28d9','0ea5e9','10b981','f59e0b','ef4444','ec4899','8b5cf6','06b6d4']
  const randomBg=()=> setBg('#'+proColors[Math.floor(Math.random()*proColors.length)])
  const displayName = useEmoji && emoji? emoji : name
  const avatarUrl = `/api/avatar?name=${encodeURIComponent(displayName)}&size=${size}&bg=${bgHex}&color=${txtHex}&shape=${shape}&pattern=${pattern}&shadow=${shadow?1:0}&glass=${glass?1:0}&font=${font}`

  const download = async (format:'png'|'svg'|'webp'|'jpeg')=>{
    const r=await fetch(avatarUrl); const svgText=await r.text()
    if(format==='svg'){ const blob=new Blob([svgText],{type:'image/svg+xml'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`avatar-${Date.now()}.svg`; a.click(); URL.revokeObjectURL(url); return }
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

  const articles = [
    {title:"1. What is Avatar Generator? - Free Letter & Emoji Tool", content:`Welcome to Lorem Pro Tool's Avatar Generator, the fastest free tool to create high-quality letter avatars, initials avatars, and emoji avatars. An avatar generator converts a name like "Ravi Patel" into initials "RP". Our pro version adds iOS-style squircle shape, mesh gradients, glassmorphism, soft shadows, and custom fonts. API route /api/avatar?name=... returns lightweight SVG that scales infinitely, perfect for Retina displays and favicons 16px to 1024px. It's built for devs who want Figma quality without opening Figma.`},
    {title:"2. Why Use Letter Avatars? UX & SEO Benefits", content:`Letter avatars improve UX. Instead of broken image or grey silhouette, you show personalized initials. This increases trust, reduces bounce rate, looks pro like Google, Slack, Discord. Benefits: Faster Dev (no manual design), Consistent Branding (8 pro colors), Lightweight (SVG <2KB), Accessibility (alt text readable), Better SEO (reduces CLS, improves LCP).`},
    {title:"3. How To Use – Old Guide Step by Step", content:`1. Enter Name: "Ravi Patel" -> "RP", single name "Ravi" -> "R". 2. Emoji Mode Fixed: Toggle Use Emoji, we keep name in URL for SEO. 3. Pick Colors: 8 pro presets + Random button + custom picker. 4. Shape: Squircle (iOS superellipse trending 2026), Circle (classic), Rounded, Square. 5. Pattern: Mesh (3-color gradient), Dots, Grid, Stripes. 6. Size Effects: 64px favicon, 320px profile, 800px OG. Shadow adds 60px padding fix for export. 7. Download: PNG for apps, SVG for web, WEBP for speed, JPEG with white bg fix.`},
    {title:"4. Pro Features Explained", content:`Smart Initials Logic: auto 2 initials, Unicode support. Modern Shapes: Squircle trending for iOS 18 style. Pro Customization: 5 Google Fonts (Inter, Poppins, Montserrat, Space Grotesk, JetBrains Mono), size slider, real drop shadow with canvas fix, glass effect. 4 Format Downloads: Our code fixes white bg in JPEG and transparent in PNG/WEBP with shadow preservation.`},
    {title:"5. Use Cases & Examples", content:`Developers: SaaS placeholder, dashboard avatars, comments. Designers: Figma mockups, team pages. YouTubers: channel icons. Startups: 100 team avatars in 2 mins with consistent colors. Bloggers: author boxes. Perfect for leaderboard, chat apps, and OG images.`},
    {title:"6. FAQ – Frequently Asked Questions", content:`Q: Free? A: Yes 100% free commercial use, no watermark. Q: API use? A: Use /api/avatar?name=Ravi directly in img tag, Edge cached. Q: Better than ui-avatars.com? A: We offer squircle, mesh, glass, real shadow export, font selection, emoji mode. Q: SEO? A: Optimized SVG with title tag, proper contrast, H1/H2 structure.`},
    {title:"7. SEO Keywords & Best Practices (1200+ words)", content:`Keywords: free avatar generator, letter avatar generator, initials avatar, profile picture maker, emoji avatar creator, placeholder avatar API, svg avatar generator, favicon generator from name, random avatar generator. Best Practices: Use alt="Avatar for Ravi Patel", compress PNG, use SVG for web for Core Web Vitals, replace dummy before production, maintain heading hierarchy H1->H2->H3, add structured data FAQ schema, lazy load below fold. Our tool is lightweight, no tracking, privacy focused, built with Next.js 14 App Router for speed. Final tip: Use consistent brand colors across all avatars for brand recall and better UX.`},
{
  title:"8. Is Avatar Ka Use Kaha Hota Hai? Real Examples",
  content:`Ye Letter Avatar sabse zyada 5 jagah use hota hai:
1. SaaS & Website Placeholder: Jab user ne photo upload nahi ki, to grey icon ki jagah RP jaisa avatar dikhate hain. Google, Slack, Discord, GitHub yehi karte hain. Isse UX trust badhta hai aur bounce rate kam hota hai.
2. Favicon & App Icon: 64px pe download karke browser tab icon, PWA icon bana sakte ho.
3. Dashboard, Comments, Chat, Leaderboard: Har user ko alag color ka avatar milta hai, jisse identify karna easy hota hai.
4. Social Media: YouTube, GitHub, LinkedIn profile jab real photo nahi lagani.
5. Team Page & OG Image: Startup apni team page pe 100 avatars 2 min me bana leti hai consistent brand color me.
API Example: <img src="/api/avatar?name=Ravi%20Patel" /> - Edge cached, <2KB SVG, Retina ready.`
},
  ]

return(
 <div className="min-h-screen bg-[#050507] text-white p-4">
  <div className="max-w-[1100px] mx-auto">
   <h1 className="text-[26px] md:text-5xl font-bold text-center">Free Avatar Generator – Letter, Initials & Emoji Avatars</h1>
   <p className="text-center text-zinc-400 mb-6 mt-2">Create pro profile pictures, favicons, and placeholder avatars in seconds.</p>

   <div className="grid lg:grid-cols-2 gap-6">
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col items-center">
      <div className="bg-black rounded-[32px] p-6 relative"><img src={avatarUrl} alt="avatar" width={size} height={size} /></div>
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
       <div className="flex items-center gap-2 mt-2"><input type="checkbox" checked={useEmoji} onChange={e=>setUseEmoji(e.target.checked)} /><span className="text-sm">Use Emoji Mode</span><input value={emoji} onChange={e=>setEmoji(e.target.value)} className="ml-auto w-16 bg-black border border-zinc-700 rounded p-1 text-center" /></div>
     </div>
     <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
       <h3 className="font-bold mb-3">Customize</h3>
       <div className="grid grid-cols-2 gap-3">
         <div><label className="text-xs text-zinc-400">BG + Random</label><div className="flex gap-2 mt-1 flex-wrap">{proColors.map(c=><button key={c} onClick={()=>setBg('#'+c)} style={{background:'#'+c}} className="w-8 h-8 rounded-full border-2 border-zinc-700"></button>)}</div></div>
         <div><label className="text-xs text-zinc-400">Text</label><input type="color" value={txt} onChange={e=>setTxt(e.target.value)} className="w-full h-9 mt-1"/></div>
       </div>
       <div className="mt-3"><label className="text-xs text-zinc-400">Font</label><select value={font} onChange={e=>setFont(e.target.value)} className="w-full bg-black border border-zinc-700 rounded p-2 mt-1"><option>Inter</option><option>Poppins</option><option>Montserrat</option><option>Space Grotesk</option><option>JetBrains Mono</option></select></div>
       <div className="mt-3"><label className="text-xs text-zinc-400">Size: {size}px</label><input type="range" min={64} max={800} value={size} onChange={e=>setSize(parseInt(e.target.value))} className="w-full"/></div>
       <div className="flex gap-4 mt-3"><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={shadow} onChange={e=>setShadow(e.target.checked)}/> Shadow</label><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={glass} onChange={e=>setGlass(e.target.checked)}/> Glass</label></div>
     </div>
     <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
       <div><p className="text-xs text-zinc-400 mb-2">SHAPE</p><div className="grid grid-cols-4 gap-2">{['squircle','circle','rounded','square'].map(s=><button key={s} onClick={()=>setShape(s)} className={`py-2 rounded text-xs capitalize ${shape===s?'bg-white text-black':'bg-zinc-800'}`}>{s}</button>)}</div></div>
       <div className="mt-3"><p className="text-xs text-zinc-400 mb-2">PATTERN</p><div className="grid grid-cols-5 gap-2">{['none','mesh','dots','grid','stripes'].map(p=><button key={p} onClick={()=>setPattern(p)} className={`py-2 rounded text-xs capitalize ${pattern===p?'bg-white text-black':'bg-zinc-800'}`}>{p}</button>)}</div></div>
     </div>
    </div>
   </div>

   <div className="max-w-4xl mx-auto mt-16">
     <div className="flex justify-between items-center mb-4">
       <h2 className="text-2xl font-bold">📚 Complete Guide</h2>
       <button onClick={()=>setShowAll(!showAll)} className="px-4 py-2 bg-white text-black rounded-full text-sm font-bold">{showAll? 'Hide All Articles ▲' : 'Show All Articles ▼'}</button>
     </div>

     <div className="space-y-4">
       {articles.map((art,i)=>(
         <details key={i} open={showAll} className="group bg-zinc-900 border border-zinc-800 rounded-xl p-5">
           <summary className="font-bold cursor-pointer text-white list-none flex justify-between items-center">{art.title} <span className="text-zinc-500 group-open:rotate-180 transition">▼</span></summary>
           <div className="text-zinc-400 mt-4 leading-7 text-[15px] whitespace-pre-line">{art.content}</div>
         </details>
       ))}
     </div>
   </div>

   <section className="mt-16">
    <h2 className="text-3xl font-bold text-center">Other Useful Tools</h2>
    <div className="grid md:grid-cols-3 gap-4 mt-6">
      {[
        {name:'Lorem Ipsum Generator', href:'/', desc:'Generate dummy text'},
        {name:'QR Code Generator', href:'/qr-code-generator', desc:'Custom QR with logo'},
        {name:'Gradient Generator', href:'/gradient-generator', desc:'Mesh & CSS gradients'},
        {name:'Color Palette', href:'/color-palette', desc:'Pro palettes'},
        {name:'Password Generator', href:'/password-generator', desc:'Secure passwords'},
        {name:'Base64 Encoder', href:'/base64', desc:'Encode/decode'},
        {name:'JSON Formatter', href:'/json-formatter', desc:'Beautify JSON'},
        {name:'Word Counter', href:'/word-counter', desc:'Count words & SEO'},
        {name:'Fake Data Generator', href:'/fake-data', desc:'Fake names for testing'},
      ].map(t=>(
        <a key={t.name} href={t.href} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:bg-zinc-800 transition"><h3 className="font-bold">{t.name}</h3><p className="text-xs text-zinc-400 mt-1">{t.desc}</p><span className="text-xs text-white mt-2 inline-block">Try Now →</span></a>
      ))}
    </div>
   </section>

   <div className="text-center text-zinc-600 text-xs mt-12 pb-10">© 2026 Lorem Pro Tool</div>
  </div>
 </div>
)
}
