// @ts-nocheck
'use client';
import { useState } from 'react';

export default function AvatarTool() {
  const [name, setName] = useState("Ravi Sharma");
  const [bg1, setBg1] = useState("6366f1");
  const [bg2, setBg2] = useState("a855f7");
  const [size, setSize] = useState(200);
  const [shadow, setShadow] = useState(true);

  const avatarUrl = `/api/avatar?size=${size}&text=${encodeURIComponent(name)}&bg1=${bg1.replace('#','')}&bg2=${bg2.replace('#','')}`;

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">👤 Avatar Generator Pro</h1>
        <p className="text-gray-400 mb-6">Name se stylish avatar banao - API Ready</p>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Controls */}
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-4">
            <div>
              <label className="text-sm text-gray-400">Name</label>
              <input value={name} onChange={e=>setName(e.target.value)} className="w-full p-3 mt-1 bg-black rounded-lg border border-zinc-800" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-gray-400">Color 1</label>
                <input value={bg1} onChange={e=>setBg1(e.target.value.replace('#',''))} className="w-full p-2 mt-1 bg-black rounded-lg border border-zinc-800" />
              </div>
              <div>
                <label className="text-sm text-gray-400">Color 2</label>
                <input value={bg2} onChange={e=>setBg2(e.target.value.replace('#',''))} className="w-full p-2 mt-1 bg-black rounded-lg border border-zinc-800" />
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-400">Size: {size}px</label>
              <input type="range" min="50" max="500" value={size} onChange={e=>setSize(e.target.value)} className="w-full" />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={shadow} onChange={e=>setShadow(e.target.checked)} /> Shadow ON
            </label>
            <div className="bg-black p-3 rounded-lg text-xs break-all text-gray-400">
              {typeof window!== 'undefined'? window.location.origin : ''}{avatarUrl}
            </div>
          </div>

          {/* Preview */}
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl text-center">
            <img src={avatarUrl} alt="avatar" className="w-full max-w-[300px] aspect-square rounded-full mx-auto shadow-2xl" />
            <a href={avatarUrl} download={`avatar-${name}.png`}>
              <button className="mt-6 w-full bg-purple-600 py-3 rounded-lg font-bold">Download PNG</button>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
