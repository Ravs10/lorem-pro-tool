"use client";
import { useState } from "react";

export default function Page() {
  const [out, setOut] = useState("Lorem ipsum dolor sit amet...");
  const [len, setLen] = useState(3);
  const gen = () => {
    setOut(Array(len).fill("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.").join("\n\n"));
  };
  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-3xl rounded-[32px] bg-white/[0.04] border border-white/[0.08] p-8 backdrop-blur-xl">
        <h1 className="text-3xl font-black">LoremGen <span className="text-violet-400">PRO</span></h1>
        <p className="text-white/50 mt-2">Simple, fast, beautiful</p>
        <div className="mt-6 flex gap-3">
          <input type="range" min={1} max={10} value={len} onChange={e=>setLen(Number(e.target.value))} className="flex-1" />
          <span className="bg-white text-black px-4 py-2 rounded-full font-bold text-sm">{len} Para</span>
        </div>
        <button onClick={gen} className="w-full mt-6 h-12 rounded-full bg-white text-black font-black hover:scale-[1.02] transition">Generate</button>
        <div className="mt-6 p-5 rounded-2xl bg-black/50 border border-white/10 text-white/70 leading-7 whitespace-pre-wrap">{out}</div>
      </div>
    </div>
  )
}
