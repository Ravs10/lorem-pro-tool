"use client";
import { useState } from "react";

const LANGS = {
  EN:{f:"🇺🇸",t:"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."},
  ES:{f:"🇪🇸",t:"Vivamus lacinia odio vitae vestibulum. Lorem ipsum dolor sit amet consectetur."},
  FR:{f:"🇫🇷",t:"Cras mattis iudicium purus sit amet fermentum. Lorem ipsum dolor sit amet."},
  DE:{f:"🇩🇪",t:"Donec eget ex magna interdimensional. Lorem ipsum dolor sit amet consectetur."},
  HI:{f:"🇮🇳",t:"यह एक डमी टेक्स्ट है जो डिज़ाइन में उपयोग होता है। Lorem ipsum dolor sit amet."},
  JA:{f:"🇯🇵",t:"デザインで使用されるダミーテキストです。 Lorem ipsum dolor sit amet."},
}

export default function Page(){
  const [lang,setLang]=useState("EN");
  const [len,setLen]=useState(3);
  const [tone,setTone]=useState("Neutral");
  const [fmt,setFmt]=useState("Plain Text");
  const [out,setOut]=useState("Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\n\nUt enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.\n\nDuis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.");
  const [count,setCount]=useState(24);

  const gen=()=>{
    const base=(LANGS as any)[lang].t;
    setOut(Array(len).fill(base).join("\n\n"));
    setCount(c=>c+1);
  }

  return(
  <div className="min-h-screen bg-[#06060A] text-white selection:bg-fuchsia-500/30">
    <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(124,58,237,0.25),transparent_60%),radial-gradient(ellipse_at_bottom_right,_rgba(236,72,153,0.25),transparent_50%),radial-gradient(ellipse_at_bottom_left,_rgba(59,130,246,0.2),transparent_50%)]" />
    <div className="relative max-w-[1280px] mx-auto p-3 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between rounded-[20px] border border-white/[0.08] bg-black/40 backdrop-blur-2xl px-4 md:px-6 h-[64px]">
        <div className="flex items-center gap-3"><div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">✦</div><b className="text-[18px]">LoremGen</b><div className="hidden md:flex ml-6 gap-1 bg-white/[0.06] p-1 rounded-full"><span className="px-3 py-1 text-xs text-white/50">Dashboard</span><span className="px-3 py-1 text-xs bg-white text-black rounded-full font-bold">Generator</span><span className="px-3 py-1 text-xs text-white/50">API</span><span className="px-3 py-1 text-xs text-white/50">History</span></div></div>
        <div className="flex items-center gap-2"><div className="hidden md:flex items-center gap-2 px-3 h-8 rounded-full bg-white/[0.06] border border-white/10 text-xs">{(LANGS as any)[lang].f} {lang}</div><div className="px-3 h-8 rounded-full bg-white/[0.08] border border-white/10 flex items-center gap-1.5 text-xs">⚡ {2400-count*12} credits</div><div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center font-bold text-xs">AK</div></div>
      </div>

      <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-4 mt-4">
        {/* Left */}
        <div className="rounded-[20px] border border-fuchsia-500/20 bg-gradient-to-b from-white/[0.07] to-white/[0.02] backdrop-blur-xl p-6 shadow-[0_0_80px_rgba(168,85,247,0.15)]">
          <div className="flex gap-3"><div className="text-2xl">✨</div><div><h1 className="text-[22px] font-bold leading-none">Lorem Ipsum Generator</h1><p className="text-[13px] text-white/50 mt-2 leading-snug">Generate clean placeholder text on demand. Customize length, tone, and format for prototypes, designs, and testing.</p></div></div>

          <div className="mt-8 space-y-6">
            <div className="flex items-center justify-between"><span className="text-[13px] font-bold text-white/70">Length</span><span className="text-[13px]">{len} Paragraphs</span><span className="text-xs text-violet-400">≈ {len*40}-{len*50} words</span></div>
            <div className="h-1 bg-white/10 rounded-full"><div className="h-1 w-[60%] bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full" /></div>

            <div className="flex gap-3 items-center"><span className="text-[13px] w-[50px] font-bold text-white/70">Tone</span><div className="flex flex-wrap gap-2">{["Neutral","Professional","Casual","Technical"].map(t=><button key={t} onClick={()=>setTone(t)} className={`px-4 h-8 rounded-full text-xs border font-bold transition ${tone===t?'bg-gradient-to-r from-violet-600 to-fuchsia-600 border-transparent shadow-[0_0_20px_rgba(124,58,237,0.5)]':'bg-white/[0.06] border-white/10 text-white/60 hover:bg-white/[0.1]'}`}>{t}</button>)}</div></div>

            <div className="flex gap-3 items-center"><span className="text-[13px] w-[50px] font-bold text-white/70">Format</span><div className="flex gap-2">{["Plain Text","Markdown","HTML"].map(f=><button key={f} onClick={()=>setFmt(f)} className={`px-4 h-8 rounded-full text-xs border font-bold transition ${fmt===f?'bg-gradient-to-r from-violet-600 to-fuchsia-600 border-transparent':'bg-white/[0.06] border-white/10 text-white/60'}`}>{f}</button>)}</div></div>

            <div className="flex gap-2 mt-2">{Object.keys(LANGS).map(k=><button key={k} onClick={()=>setLang(k)} className={`w-9 h-9 rounded-full flex items-center justify-center border transition ${lang===k?'border-fuchsia-500 bg-white text-black scale-110':'border-white/10 bg-white/5'}`}>{(LANGS as any)[k].f}</button>)}</div>

            <button onClick={gen} className="w-full h-[48px] rounded-xl bg-gradient-to-r from-violet-600 to-[#FF2EBE] font-bold text-[15px] shadow-[0_0_30px_rgba(124,58,237,0.6)] hover:scale-[1.01] active:scale-[0.99] transition">✨ Generate Lorem Ipsum</button>
            <div className="text-center text-[11px] text-white/40">Estimated cost: 12 credits • ~0.5s generation</div>
          </div>
        </div>

        {/* Right */}
        <div className="space-y-4">
          <div className="rounded-[20px] border border-white/10 bg-black/40 backdrop-blur-xl p-5">
            <div className="flex items-center gap-2 text-[13px] font-bold text-white/60">📊 Usage Today</div>
            <div className="text-[42px] font-black leading-none mt-2">{count}</div>
            <div className="text-xs text-white/50">generations today</div>
            <div className="mt-4 h-[60px] flex items-end gap-1">{[30,40,35,45,30,50,65,55,70,68,85].map((h,i)=><div key={i} style={{height:h}} className="flex-1 bg-gradient-to-t from-fuchsia-600 to-violet-400 rounded-full" />)}</div>
            <div className="text-[11px] text-emerald-400 mt-2">↑ 18% vs yesterday</div>
          </div>
          <div className="rounded-[20px] border border-white/10 bg-black/40 backdrop-blur-xl p-5">
            <div className="text-[13px] font-bold">Credits Remaining<br/>2,400 / 5,000 credits</div>
            <div className="h-1 bg-white/10 rounded-full mt-3"><div className="h-1 w-[48%] bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full" /></div>
            <div className="text-[11px] text-white/40 mt-2">1,600 credits left</div>
            <div className="mt-5 text-[13px] font-bold">🕒 Recent Generations</div>
            <div className="mt-3 space-y-2 text-[11px] text-white/50"><div>3 paragraphs • Neutral • 2 min ago</div><div>1 paragraph • Technical • 15 min ago</div><div>5 paragraphs • Casual • 1 hour ago</div></div>
          </div>
        </div>
      </div>

      {/* Output */}
      <div className="rounded-[20px] border border-fuchsia-500/20 bg-black/60 backdrop-blur-xl mt-4 overflow-hidden">
        <div className="flex items-center justify-between px-5 h-[56px] border-b border-white/10">
          <div className="flex items-center gap-2 text-[14px] font-bold">📄 Output — Generated Text</div>
          <div className="flex gap-2"><button onClick={()=>navigator.clipboard.writeText(out)} className="px-3 h-7 rounded-full bg-white/10 border border-white/10 text-xs">Copy</button><button className="px-3 h-7 rounded-full bg-white/10 border border-white/10 text-xs">Download.md</button></div>
        </div>
        <div className="p-6 font-mono text-[13px] leading-[1.9] text-white/70 whitespace-pre-wrap">{out}</div>
        <div className="mx-3 mb-3 rounded-xl border border-fuchsia-500/20 bg-white/[0.04] p-3 flex items-center justify-between"><div className="text-xs"><div className="text-white/40">API Endpoint</div><div className="text-fuchsia-400 font-bold">/api/v1/generate</div></div><div className="px-3 py-1 rounded-full bg-white/10 text-[11px]">Response: 200 OK • 0.42s</div></div>
      </div>
    </div>
  </div>
  )
}
