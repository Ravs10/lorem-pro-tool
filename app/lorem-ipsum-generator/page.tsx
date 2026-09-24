"use client";
import { useState } from "react";
export default function Page(){
  const [c,setC]=useState(3); const [t,setT]=useState("");
  const gen=()=>{ const l="Lorem ipsum dolor sit amet, consectetur adipiscing elit. "; setT(Array(c).fill(l).join("\n\n")); }
  return (
    <div className="min-h-screen p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Lorem Ipsum Generator</h1>
      <div className="flex gap-2 mb-4"><input type="number" value={c} onChange={e=>setC(+e.target.value)} className="border p-2 rounded w-20"/><button onClick={gen} className="bg-black text-white px-6 py-2 rounded">Generate</button></div>
      <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded border">{t}</pre>
    </div>
  )
}
