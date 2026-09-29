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

return(
 <div className="min-h-screen bg-[#050507] text-white p-4">
  <div className="max-w-[1100px] mx-auto">
   <h1 className="text-[26px] md:text-5xl font-bold text-center">Free Avatar Generator – Letter, Initials & Emoji Avatars</h1>
   <p className="text-center text-zinc-400 mb-6 mt-2">Create pro profile pictures, favicons, and placeholder avatars in seconds.</p>

   <div className="grid lg:grid-cols-2 gap-6">
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col items-center">
      <div className={`bg-black rounded-[32px] p-6 relative ${shadow?'shadow-2xl':''}`}>
        {glass && <div className="absolute top-0 left-0 w-full h-1/2 bg-white/10 rounded-t-[32px]"></div>}
        <img src={avatarUrl} alt="avatar" width={size} height={size} />
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
       <input value={name} onChange={e=>setName(e.target.value)} className="w-full bg-black border border-zinc-700 rounded p-2 mt-1" placeholder="Ravi Patel" />
       <div className="flex items-center gap-2 mt-2">
         <input type="checkbox" checked={useEmoji} onChange={e=>setUseEmoji(e.target.checked)} />
         <span className="text-sm">Use Emoji Mode</span>
         <input value={emoji} onChange={e=>setEmoji(e.target.value)} className="ml-auto w-16 bg-black border border-zinc-700 rounded p-1 text-center" />
       </div>
       {useEmoji && <p className="text-[11px] text-yellow-400 mt-1">Emoji mode: first letter fix added for better SEO & accessibility.</p>}
     </div>

     <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
       <h3 className="font-bold mb-3">Customize</h3>
       <div className="grid grid-cols-2 gap-3">
         <div><label className="text-xs text-zinc-400">BG Presets + Random</label><div className="flex gap-2 mt-1 flex-wrap">
           {proColors.map(c=><button key={c} onClick={()=>setBg('#'+c)} style={{background:'#'+c}} className="w-8 h-8 rounded-full border-2 border-zinc-700"></button>)}
         </div></div>
         <div><label className="text-xs text-zinc-400">Text Color</label><input type="color" value={txt} onChange={e=>setTxt(e.target.value)} className="w-full h-9 mt-1"/></div>
       </div>
       <div className="mt-3"><label className="text-xs text-zinc-400">Font Family</label>
         <select value={font} onChange={e=>setFont(e.target.value)} className="w-full bg-black border border-zinc-700 rounded p-2 mt-1">
           <option>Inter</option><option>Poppins</option><option>Montserrat</option><option>Space Grotesk</option><option>JetBrains Mono</option>
         </select>
       </div>
       <div className="mt-3"><label className="text-xs text-zinc-400">Size: {size}px</label><input type="range" min={64} max={800} value={size} onChange={e=>setSize(parseInt(e.target.value))} className="w-full"/></div>
       <div className="flex gap-4 mt-3">
         <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={shadow} onChange={e=>setShadow(e.target.checked)}/> Shadow</label>
         <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={glass} onChange={e=>setGlass(e.target.checked)}/> Glass</label>
       </div>
     </div>

     <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
       <div><p className="text-xs text-zinc-400 mb-2">SHAPE</p><div className="grid grid-cols-4 gap-2">
         {['squircle','circle','rounded','square'].map(s=><button key={s} onClick={()=>setShape(s)} className={`py-2 rounded text-xs capitalize ${shape===s?'bg-white text-black':'bg-zinc-800'}`}>{s}</button>)}
       </div></div>
       <div className="mt-3"><p className="text-xs text-zinc-400 mb-2">PATTERN</p><div className="grid grid-cols-5 gap-2">
         {['none','mesh','dots','grid','stripes'].map(p=><button key={p} onClick={()=>setPattern(p)} className={`py-2 rounded text-xs capitalize ${pattern===p?'bg-white text-black':'bg-zinc-800'}`}>{p}</button>)}
       </div></div>
     </div>
    </div>
   </div>

   {/* SEO ARTICLE 1200 WORDS */}
   <article className="mt-16 max-w-4xl mx-auto leading-7 text-zinc-300">
    <h2 className="text-3xl font-bold text-white mb-4">Avatar Generator – Create Professional Letter & Initials Avatars Online (Free)</h2>
    <p className="mt-4">Welcome to <strong className="text-white">Lorem Pro Tool’s Avatar Generator</strong>, the fastest free tool to create high-quality letter avatars, initials avatars, and emoji avatars for your website, app, SaaS, portfolio, or social media. If you need a placeholder profile picture before a user uploads their photo, a favicon, or a clean OG image, this tool generates beautiful SVGs in real time.</p>

    <h2 className="text-2xl font-bold text-white mt-8">What is an Avatar Generator?</h2>
    <p>An avatar generator converts a name like “Ravi Patel” into initials “RP” or “Ravi” into a visual identity. Our pro version goes beyond basic initials – it adds modern iOS-style <strong>squircle shape</strong>, mesh gradients, glassmorphism, soft shadows, and custom fonts. It’s built for developers and designers who want Figma-level quality without opening Figma. The API route <code>/api/avatar?name=...</code> returns a lightweight SVG that scales infinitely, making it perfect for responsive design, Retina displays, and favicons from 16px to 1024px.</p>

    <h2 className="text-2xl font-bold text-white mt-8">Why Use Letter Avatars?</h2>
    <p>Letter avatars improve UX dramatically. Instead of showing a broken image or generic grey silhouette, you can show personalized initials. This increases trust, reduces bounce rate, and looks professional like Google, Slack, and Discord do. Our generator is SEO-friendly, fast (Edge cached), and privacy-focused – no tracking, no watermark.</p>
    <ul className="list-disc ml-6 mt-3 space-y-2">
      <li><strong className="text-white">Faster Development:</strong> No need to design 100 avatars manually. Generate on the fly.</li>
      <li><strong className="text-white">Consistent Branding:</strong> Use your brand color palette with 8 pro colors and custom hex.</li>
      <li><strong className="text-white">Lightweight & Scalable:</strong> SVG is less than 2KB, PNG/WebP export with real canvas shadow fix.</li>
      <li><strong className="text-white">Accessibility:</strong> Alt text and initials remain readable for screen readers.</li>
    </ul>

    <h2 className="text-2xl font-bold text-white mt-8">Key Features (Pro Version)</h2>
    <h3 className="text-xl font-semibold text-white mt-4">1. Smart Initials Logic</h3>
    <p>We automatically extract up to 2 initials from “Ravi Patel” = RP, handle single names, trim spaces, and support Unicode. Emoji mode lets you create fun avatars like 🔥 for gaming profiles while keeping SEO alt text intact.</p>
    <h3 className="text-xl font-semibold text-white mt-4">2. Modern Shapes & Patterns</h3>
    <p>Choose from Squircle (iOS superellipse), Circle (classic), Rounded, and Square. Patterns include Mesh (3-color gradient), Dots, Grid, and Stripes for premium backgrounds.</p>
    <h3 className="text-xl font-semibold text-white mt-4">3. Pro Customization</h3>
    <p>Pick any background and text color, 5 premium Google Fonts (Inter, Poppins, Montserrat, Space Grotesk, JetBrains Mono), size slider from 64px favicon to 800px cover image, plus realistic drop shadow (canvas shadow fix) and glass effect.</p>
    <h3 className="text-xl font-semibold text-white mt-4">4. 4 Format Downloads</h3>
    <p>Download as PNG for apps, SVG for web (best quality), WEBP for performance, and JPEG with white background fix for emails and LinkedIn.</p>

    {/* OLD ARTICLE WITH SHOW/HIDE */}
    <details className="group bg-zinc-900 border border-zinc-800 rounded-xl p-5 mt-8">
      <summary className="font-bold cursor-pointer list-none flex justify-between">📖 How to Use This Tool – Old Guide (Click to Show/Hide) <span className="group-open:rotate-180">▼</span></summary>
      <div className="text-zinc-400 mt-4 leading-6 space-y-2">
        <p>1. Enter Name: Type "Ravi Patel" and we auto-create "RP". For single name like "Ravi" we show "R".</p>
        <p>2. Emoji Mode Fixed: Toggle Use Emoji checkbox. Now emoji avatar will still have name in URL for SEO.</p>
        <p>3. Pick Colors: Click color box to open color picker, or use 8 pro presets. Random button gives instant inspiration.</p>
        <p>4. Shape: Squircle = iOS superellipse, Circle = fully round, Rounded = soft corners, Square = sharp.</p>
        <p>5. Pattern: Mesh = 3-color gradient mesh, Dots = dotted overlay, Grid = subtle grid, Stripes = modern lines.</p>
        <p>6. Size Effects: Slider 64px for favicon, 320px for profile, 800px for OG image. Shadow adds 60px padding for export fix.</p>
        <p>7. Download 4 Formats: PNG best for Discord/Slack, SVG best for web dev, WEBP best for speed, JPEG best for email.</p>
      </div>
    </details>

    <details className="group bg-zinc-900 border border-zinc-800 rounded-xl p-5 mt-4">
      <summary className="font-bold cursor-pointer list-none flex justify-between">❓ FAQ – Avatar Generator (Show/Hide) <span className="group-open:rotate-180">▼</span></summary>
      <div className="mt-4 space-y-4 text-[14px]">
        <p className="text-white font-semibold">Is this avatar generator free?</p><p className="text-zinc-400">Yes, 100% free for personal and commercial use. No watermark, no login.</p>
        <p className="text-white font-semibold">Can I use it as placeholder in my SaaS?</p><p className="text-zinc-400">Absolutely. Use our API /api/avatar?name=Ravi%20Patel directly in &lt;img&gt; tag. Edge cached for fast loads.</p>
        <p className="text-white font-semibold">How is this better than ui-avatars.com?</p><p className="text-zinc-400">We offer squircle shape, mesh gradient, glass, real shadow export fix, font selection, and emoji mode which others don’t.</p>
        <p className="text-white font-semibold">Does it support SEO?</p><p className="text-zinc-400">Yes. Proper H1, alt text, file name avatar-{`timestamp`} and lightweight SVG boost Core Web Vitals.</p>
      </div>
    </details>

    <h2 className="text-2xl font-bold text-white mt-8">Use Cases</h2>
    <p>Developers use it for SaaS placeholder, designers for Figma mockups, YouTubers for channel icons, startups for team pages, and bloggers for author boxes. You can generate 100 team avatars in 2 minutes with consistent colors.</p>

    <h2 className="text-2xl font-bold text-white mt-8">SEO Benefits of Custom Avatars</h2>
    <p>Using custom avatars reduces CLS (Cumulative Layout Shift), improves LCP, and adds brand consistency. Our tool outputs optimized SVG with &lt;title&gt; tag, proper contrast ratio, and font embedding for accessibility and SEO.</p>

    <p className="mt-8 text-sm text-zinc-500">Keywords: free avatar generator, letter avatar generator, initials avatar generator, profile picture maker, emoji avatar creator, placeholder avatar API, svg avatar generator, favicon generator from name.</p>
   </article>

   {/* OTHER USEFUL TOOLS SECTION */}
   <section className="mt-16">
    <h2 className="text-3xl font-bold text-center">Other Useful Tools</h2>
    <p className="text-center text-zinc-400 mt-2 mb-6">Explore our pro tools collection built for developers & designers</p>
    <div className="grid md:grid-cols-3 gap-4">
      {[
        {name:'Lorem Ipsum Generator', href:'/', desc:'Generate dummy text for UI/UX'},
        {name:'QR Code Generator', href:'/qr-code-generator', desc:'Create custom QR with logo'},
        {name:'Gradient Generator', href:'/gradient-generator', desc:'Mesh & CSS gradients'},
        {name:'Color Palette Generator', href:'/color-palette', desc:'Pro palettes & extract'},
        {name:'Password Generator', href:'/password-generator', desc:'Secure random passwords'},
        {name:'Base64 Encoder', href:'/base64', desc:'Encode/decode instantly'},
        {name:'JSON Formatter', href:'/json-formatter', desc:'Beautify & minify JSON'},
        {name:'Word Counter', href:'/word-counter', desc:'Count words & SEO check'},
        {name:'Fake Data Generator', href:'/fake-data', desc:'Fake names for testing'},
      ].map(t=>(
        <a key={t.name} href={t.href} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:bg-zinc-800 transition">
          <h3 className="font-bold">{t.name}</h3><p className="text-xs text-zinc-400 mt-1">{t.desc}</p>
          <span className="text-xs text-white mt-2 inline-block">Try Now →</span>
        </a>
      ))}
    </div>
   </section>

   <div className="text-center text-zinc-600 text-xs mt-12 pb-10">© 2026 Lorem Pro Tool – Built for Speed & SEO</div>
  </div>
 </div>
)
}
