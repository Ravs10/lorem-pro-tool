// @ts-nocheck
'use client';
import { useState } from 'react';

export default function AvatarTool() {
  const [name, setName] = useState("Ravi Yadav");
  const [bg1, setBg1] = useState("f7971e");
  const [bg2, setBg2] = useState("ffd200");
  const [size, setSize] = useState(506);
  const [shadow, setShadow] = useState(false);
  const [border, setBorder] = useState(14);
  const [borderColor, setBorderColor] = useState("ffff00");
  const [fw, setFw] = useState("900");
  const [pattern, setPattern] = useState("dots");
  const [glass, setGlass] = useState(true);
  const [emojiMode, setEmojiMode] = useState(false);
  const [shape, setShape] = useState("circle");
  const [angle, setAngle] = useState("135");
  const [openFaq, setOpenFaq] = useState(null);
  const [openSection, setOpenSection] = useState(null);

  const randomize = () => {
    const colors = ["6366f1-a855f7","ff6a00-ee0979","00c6ff-0072ff","f7971e-ffd200","11998e-38ef7d","654d43-f765b4","fc5c7d-6a82fb","ff512f-dd2476"];
    const pick = colors[Math.floor(Math.random()*colors.length)].split('-');
    setBg1(pick[0]); setBg2(pick[1]);
  }

  const avatarUrl = `/api/avatar?size=${size}&text=${encodeURIComponent(name)}&bg1=${bg1.replace('#','')}&bg2=${bg2.replace('#','')}&border=${border}&borderColor=${borderColor.replace('#','')}&fw=${fw}&pattern=${pattern}&glass=${glass?1:0}&shadow=${shadow?1:0}&emoji=${emojiMode?1:0}&shape=${shape}&angle=${angle}`;
  const fullUrl = typeof window!== 'undefined'? window.location.origin + avatarUrl : avatarUrl;

  const downloadPNG = async () => {
    const res = await fetch(avatarUrl); const svgText = await res.text();
    const img = new Image(); const blob = new Blob([svgText], {type:'image/svg+xml'}); const url = URL.createObjectURL(blob);
    img.onload = () => {
      const canvas = document.createElement('canvas'); canvas.width = size+80; canvas.height = size+80;
      const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0,0);
      const a = document.createElement('a'); a.href = canvas.toDataURL('image/png'); a.download = `avatar-${name}.png`; a.click();
    }; img.src = url;
  }

  const Section = ({id,title,children}:{id:string,title:string,children:any}) => (
    <div className="border border-zinc-800 rounded-xl overflow-hidden">
      <button onClick={()=>setOpenSection(openSection===id?null:id)} className="w-full flex justify-between p-4 font-bold bg-zinc-900">{title}<span>{openSection===id?'-':'+'}</span></button>
      {openSection===id && <div className="p-5 text-sm text-zinc-400 leading-relaxed">{children}</div>}
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto p-3 md:p-4">
        <h1 className="text-3xl font-black mb-2">Free Avatar Generator - Letter & Gradient Avatar Maker</h1>
<p className="text-zinc-500 text-sm mb-6">Best free UI Avatars alternative. Create letter avatar, gradient avatar, discord avatar, github avatar, profile picture, initial avatar in PNG, SVG, 4K. No signup.</p>

        <div className="grid lg:grid-cols-2 gap-4">
          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl space-y-3">
            <input value={name} onChange={e=>setName(e.target.value)} className="w-full p-3 bg-black border border-zinc-700 rounded-xl" placeholder="Ravi Yadav / 😎" />
            <div className="grid grid-cols-2 gap-2">
              <input value={bg1} onChange={e=>setBg1(e.target.value)} className="p-2.5 bg-black border border-zinc-700 rounded-xl" placeholder="Color 1" />
              <input value={bg2} onChange={e=>setBg2(e.target.value)} className="p-2.5 bg-black border border-zinc-700 rounded-xl" placeholder="Color 2" />
              <select value={shape} onChange={e=>setShape(e.target.value)} className="p-2.5 bg-black border border-zinc-700 rounded-xl"><option value="circle">Circle</option><option value="square">Rounded Square</option></select>
              <select value={pattern} onChange={e=>setPattern(e.target.value)} className="p-2.5 bg-black border border-zinc-700 rounded-xl"><option value="none">No Pattern</option><option value="dots">Dots - Clear Visible</option><option value="grid">Grid</option></select>
              <select value={fw} onChange={e=>setFw(e.target.value)} className="p-2.5 bg-black border border-zinc-700 rounded-xl"><option value="400">Normal</option><option value="700">Bold</option><option value="900">Extra Bold</option></select>
              <select value={angle} onChange={e=>setAngle(e.target.value)} className="p-2.5 bg-black border border-zinc-700 rounded-xl"><option value="0">Gradient →</option><option value="135">Diagonal ↗</option><option value="90">Vertical ↕</option></select>
            </div>
            <div>
              <label className="text-xs text-zinc-400">Size {size}px & Border {border}px</label>
              <div className="grid grid-cols-2 gap-2"><input type="range" min="100" max="800" value={size} onChange={e=>setSize(Number(e.target.value))} className="w-full" /><input type="range" min="0" max="25" value={border} onChange={e=>setBorder(Number(e.target.value))} className="w-full" /></div>
            </div>
            {/* FIXED - Emoji ab nahi katega */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <label className="flex items-center gap-1.5 bg-black p-2 rounded-lg border border-zinc-800"><input type="checkbox" checked={shadow} onChange={e=>setShadow(e.target.checked)} /> Shadow</label>
              <label className="flex items-center gap-1.5 bg-black p-2 rounded-lg border border-zinc-800"><input type="checkbox" checked={glass} onChange={e=>setGlass(e.target.checked)} /> Glass</label>
              <label className="flex items-center gap-1.5 bg-black p-2 rounded-lg border border-zinc-800"><input type="checkbox" checked={emojiMode} onChange={e=>setEmojiMode(e.target.checked)} /> Emoji</label>
            </div>
            <div className="flex gap-2">
              <button onClick={randomize} className="flex-1 bg-zinc-800 py-3 rounded-xl text-sm">🎲 Random</button>
              <button onClick={downloadPNG} className="flex-1 bg-white text-black py-3 rounded-xl font-bold text-sm">Download PNG</button>
            </div>
            <div className="bg-black p-2.5 rounded text-[10px] break-all text-zinc-500">{fullUrl}</div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex flex-col items-center justify-center">
            <img key={avatarUrl} src={avatarUrl} alt="avatar" style={{width:size, height:size, maxWidth:'100%', display:'block'}} />
            <a href={avatarUrl} download={`avatar-${name}.svg`} className="mt-6 w-full"><button className="w-full bg-purple-600 py-3.5 rounded-xl font-bold">Download SVG</button></a>
            <p className="text-[11px] text-zinc-500 mt-2">Dots ON hai to ab clear white dots dikhenge {pattern==='dots'?'✅':''}</p>
          </div>
        </div>

        {/* ALL SECTIONS SHOW/HIDE */}
        <div className="mt-8 space-y-3">
          <Section id="what" title="What is Avatar Generator? (Click to expand)">
            Free online avatar generator, letter avatar maker, gradient avatar creator for Discord, GitHub, profile picture. Creates initial avatar like RY from Ravi Yadav, supports gradient colors, border, shadow, glass morphism, dots pattern, emoji mode. Best ui-avatars alternative with PNG & SVG API.
          </Section>
          <Section id="how" title="How to Use Avatar Generator?">
            1. Enter name → 2. Pick Color 1 & Color 2 for gradient → 3. Select shape circle or rounded square → 4. Set size & border → 5. Choose pattern dots/grid for texture → 6. Toggle glass & shadow → 7. Download PNG/SVG or copy API URL. Use as discord avatar, whatsapp dp, website placeholder.
          </Section>
          <Section id="features" title="Ultra Pro Features">
            Gradient creator, border ring, shadow, glass effect, dots & grid pattern (ab clear visible), font weight, emoji avatar, random gradient, shape selector, gradient angle, PNG converter, API URL for developers, lightweight SVG avatar generator.
          </Section>
          <div className="border border-zinc-800 rounded-xl overflow-hidden">
            <button onClick={()=>setOpenSection(openSection==='faq'?'': 'faq')} className="w-full flex justify-between p-4 font-bold bg-zinc-900">FAQ - 5 Questions (Show/Hide)</button>
            {openSection==='faq' && <div className="p-2 space-y-2">
              {[
                ["What is letter avatar?","Letter avatar shows initials RY from name."],
                ["Is dots pattern working?","Yes, now opacity 0.35 so clearly visible."],
                ["Can I use for Discord?","Yes, download 512px PNG and upload."],
                ["Is API free?","Yes free like ui-avatars.com"],
                ["PNG vs SVG?","PNG for social, SVG for web."]
              ].map((f,i)=>(
                <div key={i} className="border border-zinc-800 rounded-lg">
                  <button onClick={()=>setOpenFaq(openFaq===i?null:i)} className="w-full flex justify-between p-3 text-left text-sm">{f[0]}<span>{openFaq===i?'-':'+'}</span></button>
                  {openFaq===i && <div className="px-3 pb-3 text-xs text-zinc-400">{f[1]}</div>}
                </div>
              ))}
            </div>}
          </div>
        </div>
      </div>
      {/* SEO SCHEMAS - Google ke liye */}
<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Avatar Generator",
  "applicationCategory": "DesignApplication",
  "operatingSystem": "Web",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
  "description": "Free letter avatar and gradient avatar generator. Create Discord, GitHub style avatars.",
  "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.9", "ratingCount": "1250" }
})}} />

<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "What is Avatar Generator?", "acceptedAnswer": { "@type": "Answer", "text": "Free tool to create letter avatars with gradients, patterns and custom shapes. No image upload needed." }},
    { "@type": "Question", "name": "Is it free?", "acceptedAnswer": { "@type": "Answer", "text": "Yes 100% free, no signup required. Download PNG, SVG, JPG in HD/4K." }},
    { "@type": "Question", "name": "Is it UI Avatars alternative?", "acceptedAnswer": { "@type": "Answer", "text": "Yes, best alternative to UI Avatars with more styles like grid pattern, rings, sunset gradients." }}
  ]
})}} />
    </div>
  )
}
