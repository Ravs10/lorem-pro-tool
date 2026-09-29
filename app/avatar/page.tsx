// @ts-nocheck
'use client';
import { useState } from 'react';
export default function AvatarTool() {
  const [name, setName] = useState("Ravi Sharma");
  const [bg1, setBg1] = useState("6366f1");
  const [bg2, setBg2] = useState("a855f7");
  const [size, setSize] = useState(200);
  const [shadow, setShadow] = useState(false);

  const [bg1, setBg1] = useState("6366f1");
const [bg2, setBg2] = useState("a855f7");
  const avatarUrl = `/api/avatar?size=${size}&text=${encodeURIComponent(name)}&bg1=${c1}&bg2=${c2}${shadow? '&shadow=1' : ''}`;
  const fullUrl = typeof window !== 'undefined' ? window.location.origin + avatarUrl : avatarUrl;

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Avatar Generator</h1>
        <p className="text-gray-400 mb-6">Name, color aur size change karo - live update hoga</p>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
            <div className="mb-3">
              <label className="text-sm text-gray-300">Name</label>
              <input value={name} onChange={e=>setName(e.target.value)} className="w-full mt-1 p-2 bg-black border border-zinc-700 rounded" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm text-gray-300">Color 1</label><input value={bg1} onChange={e=>setBg1(e.target.value)} className="w-full mt-1 p-2 bg-black border border-zinc-700 rounded" /></div>
              <div><label className="text-sm text-gray-300">Color 2</label><input value={bg2} onChange={e=>setBg2(e.target.value)} className="w-full mt-1 p-2 bg-black border border-zinc-700 rounded" /></div>
            </div>
            <div className="mt-4">
              <label className="text-sm text-gray-300">Size: {size}px</label>
              <input type="range" min="50" max="500" value={size} onChange={e=>setSize(Number(e.target.value))} className="w-full" />
            </div>
            <label className="flex items-center gap-2 mt-4"><input type="checkbox" checked={shadow} onChange={e=>setShadow(e.target.checked)} /> Shadow ON</label>
            <div className="bg-black p-3 mt-4 rounded text-xs break-all text-gray-400">{fullUrl}</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl flex flex-col items-center justify-center">
            <img key={avatarUrl} src={avatarUrl} alt="avatar" style={{width:size, height:size, maxWidth:'100%', borderRadius:'50%', boxShadow: shadow ? '0 10px 30px rgba(0,0,0,0.5)' : 'none'}} />
            <a href={avatarUrl} download={`avatar-${name}.svg`} className="mt-6 w-full"><button className="w-full bg-purple-600 py-3 rounded-xl font-bold">Download SVG</button></a>
          </div>
        </div>
      </div>
    </div>
  )
}
