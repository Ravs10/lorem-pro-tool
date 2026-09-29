// @ts-nocheck
'use client';
import { useState } from 'react';

export default function AvatarTool() {
  const [name, setName] = useState("Ravi Yadav");
  const [bg1, setBg1] = useState("6366f1");
  const [bg2, setBg2] = useState("f765b4");
  const [size, setSize] = useState(400);
  const [shadow, setShadow] = useState(true);
  const [border, setBorder] = useState(8);
  const [borderColor, setBorderColor] = useState("ffffff");
  const [fw, setFw] = useState("900");
  const [pattern, setPattern] = useState("none");
  const [glass, setGlass] = useState(true);
  const [emojiMode, setEmojiMode] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const randomize = () => {
    const colors = ["6366f1-a855f7","ff6a00-ee0979","00c6ff-0072ff","f7971e-ffd200","11998e-38ef7d","654d43-f765b4","fc5c7d-6a82fb"];
    const pick = colors[Math.floor(Math.random()*colors.length)].split('-');
    setBg1(pick[0]); setBg2(pick[1]);
  }

  const avatarUrl = `/api/avatar?size=${size}&text=${encodeURIComponent(name)}&bg1=${bg1.replace('#','')}&bg2=${bg2.replace('#','')}&border=${border}&borderColor=${borderColor.replace('#','')}&fw=${fw}&pattern=${pattern}&glass=${glass?1:0}&shadow=${shadow?1:0}&emoji=${emojiMode?1:0}`;
  const fullUrl = typeof window!== 'undefined'? window.location.origin + avatarUrl : avatarUrl;

  const downloadPNG = async () => {
    const res = await fetch(avatarUrl);
    const svgText = await res.text();
    const img = new Image();
    const blob = new Blob([svgText], {type:'image/svg+xml'});
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = size+80; canvas.height = size+80;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0,0);
      const pngUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a'); a.href = pngUrl; a.download = `avatar-${name}.png`; a.click();
    };
    img.src = url;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto p-4">
        <h1 className="text-4xl font-black mt-6">Avatar Generator - Ultra Pro</h1>
        <p className="text-zinc-400 mb-6">Create professional letter avatar, gradient avatar, discord avatar, profile picture maker</p>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Controls */}
          <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-xs text-zinc-400">Name / Emoji</label>
                <input value={name} onChange={e=>setName(e.target.value)} className="w-full mt-1 p-3 bg-black border border-zinc-700 rounded-xl" placeholder="Ravi Yadav or 😎" />
              </div>
              <div><label className="text-xs">Color 1</label><input value={bg1} onChange={e=>setBg1(e.target.value)} className="w-full mt-1 p-2 bg-black border border-zinc-700 rounded" /></div>
              <div><label className="text-xs">Color 2</label><input value={bg2} onChange={e=>setBg2(e.target.value)} className="w-full mt-1 p-2 bg-black border border-zinc-700 rounded" /></div>
              <div><label className="text-xs">Border ({border}px)</label><input type="range" min="0" max="30" value={border} onChange={e=>setBorder(Number(e.target.value))} className="w-full" /></div>
              <div><label className="text-xs">Border Color</label><input value={borderColor} onChange={e=>setBorderColor(e.target.value)} className="w-full mt-1 p-2 bg-black border border-zinc-700 rounded" /></div>
              <div><label className="text-xs">Font Weight</label><select value={fw} onChange={e=>setFw(e.target.value)} className="w-full mt-1 p-2 bg-black border border-zinc-700 rounded"><option value="400">Normal</option><option value="700">Bold</option><option value="900">Extra Bold</option></select></div>
              <div><label className="text-xs">Pattern</label><select value={pattern} onChange={e=>setPattern(e.target.value)} className="w-full mt-1 p-2 bg-black border border-zinc-700 rounded"><option value="none">None</option><option value="dots">Dots Pattern</option></select></div>
              <div><label className="text-xs">Size {size}px</label><input type="range" min="100" max="800" value={size} onChange={e=>setSize(Number(e.target.value))} className="w-full" /></div>
              <div className="flex gap-2 items-center mt-6">
                <label className="flex gap-2 text-xs"><input type="checkbox" checked={shadow} onChange={e=>setShadow(e.target.checked)} /> Shadow</label>
                <label className="flex gap-2 text-xs"><input type="checkbox" checked={glass} onChange={e=>setGlass(e.target.checked)} /> Glass</label>
                <label className="flex gap-2 text-xs"><input type="checkbox" checked={emojiMode} onChange={e=>setEmojiMode(e.target.checked)} /> Emoji</label>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={randomize} className="flex-1 bg-zinc-800 py-3 rounded-xl">🎲 Random Gradient</button>
              <button onClick={downloadPNG} className="flex-1 bg-white text-black py-3 rounded-xl font-bold">Download PNG</button>
            </div>
            <div className="bg-black p-3 rounded text-[10px] break-all text-zinc-500">{fullUrl}</div>
          </div>

          {/* Preview */}
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl flex flex-col items-center justify-center min-h-[500px]">
            <div style={{boxShadow: shadow? '0 30px 60px rgba(0,0,0,0.8)' : 'none', borderRadius:'50%', padding: border}}>
              <img key={avatarUrl} src={avatarUrl} alt="avatar generator" style={{width:size, height:size, maxWidth:'100%', borderRadius:'50%', display:'block'}} />
            </div>
            <a href={avatarUrl} download={`avatar-${name}.svg`} className="mt-8 w-full"><button className="w-full bg-purple-600 py-4 rounded-xl font-bold">Download SVG</button></a>
          </div>
        </div>

        {/* SEO CONTENT 1200 WORDS */}
        <div className="mt-16 bg-zinc-900 border border-zinc-800 p-6 md:p-10 rounded-2xl space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-3">What is Avatar Generator?</h2>
            <p className="text-zinc-400 leading-relaxed">Avatar Generator is a free online profile picture maker tool that helps you create beautiful letter avatar, gradient avatar, and initial avatar in seconds. Our avatar generator tool is perfect for developers, designers, and users who need a quick placeholder avatar, discord avatar, github avatar, or social media profile picture without uploading any photo. With our ultra pro avatar maker, you can generate customizable avatars with gradient colors, border, shadow, glass effect, pattern and font weight. This online avatar generator creates SVG and PNG format that is lightweight, scalable and ready to use for website, app, Discord, Gmail, and any platform. Unlike other avatar creator tools, our avatar generator does not require login and works instantly with direct image URL API for developers.</p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-3">How to Use Avatar Generator? Step by Step Guide</h2>
            <ol className="list-decimal pl-5 text-zinc-400 space-y-2">
              <li><b className="text-white">Enter Name:</b> Type your name like Ravi Yadav, the tool will auto create initials RY as letter avatar.</li>
              <li><b className="text-white">Choose Gradient Colors:</b> Color 1 and Color 2 define the gradient background. You can pick any hex color for beautiful gradient avatar.</li>
              <li><b className="text-white">Adjust Size:</b> Select avatar size from 100px to 800px for discord avatar, profile picture maker requirements.</li>
              <li><b className="text-white">Add Border & Shadow:</b> Enable border, border color, shadow effect and glass effect to make avatar more professional.</li>
              <li><b className="text-white">Pattern & Font:</b> Choose dots pattern and font weight to customize letter avatar style.</li>
              <li><b className="text-white">Download:</b> Click Download SVG for vector or Download PNG for profile picture. You can also copy the avatar API URL for direct use in your website or app as avatar generator API.</li>
            </ol>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-3">Features of Our Ultra Pro Avatar Generator</h2>
            <p className="text-zinc-400 leading-relaxed">Our avatar generator is not just a simple initial avatar maker, it is a complete profile picture maker and letter avatar generator with advanced features. You get gradient avatar creator with unlimited color combinations, border and ring customization for aesthetic avatar, shadow and glass morphism effect for modern UI, pattern overlay like dots for creative avatar, font weight control for bold letter avatar, emoji avatar mode for fun profile, random gradient generator for inspiration, direct API URL for developers who need avatar generator API, instant PNG and SVG download for discord avatar, whatsapp dp, github avatar, and responsive preview. This tool is best for developers looking for placeholder avatar service like ui-avatars alternative, but with more pro features and better design. Keywords: avatar generator, letter avatar, gradient avatar, profile picture maker, discord avatar maker, initial avatar generator, free avatar creator.</p>
          </div>

          {/* FAQ */}
          <div>
            <h2 className="text-2xl font-bold mb-4">FAQ - Avatar Generator</h2>
            <div className="space-y-3">
              {[
                {q:"What is letter avatar generator?", a:"Letter avatar generator creates avatar from initials of your name. For example Ravi Yadav becomes RY. Our avatar generator uses first letters to make profile picture when user has no photo."},
                {q:"Can I use this avatar generator for Discord?", a:"Yes, our discord avatar maker is perfect for Discord. Generate 128px, 256px or 512px size, download PNG and upload to Discord profile. The gradient avatar looks premium on Discord."},
                {q:"Is this avatar generator API free?", a:"Yes, our avatar generator API is 100% free. Use /api/avatar?text=RY&bg1=... format like ui-avatars.com alternative. You can use direct URL in img tag."},
                {q:"How to create gradient avatar?", a:"Just choose Color 1 and Color 2. Our profile picture maker will auto blend them into gradient avatar. Use random button to explore best gradient combinations."},
                {q:"Does it support PNG download?", a:"Yes, we support both SVG and PNG download. SVG is best for website scalability, PNG is best for discord avatar and social media profile picture."}
              ].map((f,i)=>(
                <div key={i} className="border border-zinc-800 rounded-xl">
                  <button onClick={()=>setOpenFaq(openFaq===i?null:i)} className="w-full flex justify-between p-4 text-left"><span className="font-medium">{f.q}</span><span>{openFaq===i?'-':'+'}</span></button>
                  {openFaq===i && <div className="p-4 pt-0 text-zinc-400 text-sm">{f.a}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
