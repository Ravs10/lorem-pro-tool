"use client";
import { useState } from "react";

const LANGS: any = {
  EN: { flag: "🇺🇸", text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris." },
  HI: { flag: "🇮🇳", text: "यह एक नमूना पाठ है जिसका उपयोग डिज़ाइन में किया जाता है। लोरेम इप्सम डोलर सिट अमेट, कंसेक्टेटर एडिपिसिंग एलीट। सेड डू एइयस्मोड टेम्पोर।" },
  ES: { flag: "🇪🇸", text: "Vivamus lacinia odio vitae vestibulum vestibulum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras mattis purus sit amet fermentum." },
  FR: { flag: "🇫🇷", text: "Cras mattis purus sit amet fermentum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt." },
};

export default function Page() {
  const [lang, setLang] = useState("EN");
  const [para, setPara] = useState(3);
  const [out, setOut] = useState(Array(3).fill(LANGS.EN.text).join("\n\n"));
  const [copied, setCopied] = useState(false);

  const generate = () => {
    setOut(Array(para).fill(LANGS[lang].text).join("\n\n"));
  };

  const copy = () => {
    navigator.clipboard.writeText(out);
    setCopied(true);
    setTimeout(()=>setCopied(false),2000);
  };

  return (
    <div className="min-h-screen bg-[#08080a] text-white selection:bg-violet-500/30">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(120,80,255,0.25),transparent_60%),radial-gradient(ellipse_at_bottom_right,_rgba(255,60,172,0.15),transparent_50%)]" />

      <div className="relative max-w-[1100px] mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex justify-between items-center h-[64px] px-6 rounded-[20px] bg-white/[0.06] border border-white/[0.08] backdrop-blur-2xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 grid place-items-center font-black text-white shadow-lg">L</div>
            <span className="font-bold tracking-tight">LoremGen <span className="text-white/40 font-medium">PRO</span></span>
            <span className="hidden md:block ml-3 px-2.5 py-1 rounded-full bg-white text-black text-[10px] font-black tracking-widest">ULTRA • v2</span>
          </div>
          <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399] animate-pulse" />
        </div>

        <div className="grid md:grid-cols-[380px_1fr] gap-6 mt-6">
          {/* Controls */}
          <div className="rounded-[28px] bg-white/[0.05] border border-white/[0.08] p-7 backdrop-blur-2xl h-fit">
            <h3 className="text-[11px] font-black tracking-[0.2em] text-white/30">LANGUAGE</h3>
            <div className="grid grid-cols-2 gap-3 mt-4">
              {Object.keys(LANGS).map(k=>(
                <button key={k} onClick={()=>{setLang(k); setOut(Array(para).fill(LANGS[k].text).join("\n\n"))}} className={`h-[56px] rounded-2xl border text-sm font-bold transition-all ${lang===k?'bg-white text-black border-white shadow-xl scale-[1.02]':'bg-white/[0.04] border-white/[0.06] text-white/60 hover:bg-white/[0.08]'}`}>
                  {LANGS[k].flag} {k}
                </button>
              ))}
            </div>

            <h3 className="text-[11px] font-black tracking-[0.2em] text-white/30 mt-8">PARAGRAPHS • {para}</h3>
            <input type="range" min={1} max={12} value={para} onChange={e=>setPara(Number(e.target.value))} className="w-full mt-4 accent-violet-500" />

            <button onClick={generate} className="w-full mt-8 h-[54px] rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 font-black tracking-wide shadow-[0_10px_30px_rgba(124,58,237,0.5)] hover:shadow-[0_10px_40px_rgba(124,58,237,0.7)] hover:scale-[1.02] active:scale-[0.98] transition-all">
              ✨ GENERATE
            </button>
            <p className="text-[11px] text-white/30 text-center mt-4">Fast • Offline • No Ads</p>
          </div>

          {/* Output */}
          <div className="rounded-[28px] bg-[#0f0f10] border border-white/[0.08] overflow-hidden flex flex-col min-h-[420px]">
            <div className="flex justify-between items-center px-6 h-[56px] border-b border-white/[0.06] bg-white/[0.02]">
              <span className="text-[11px] tracking-widest text-white/30 font-bold">OUTPUT • {out.split(" ").length} WORDS</span>
              <button onClick={copy} className="px-4 h-8 rounded-full bg-white text-black text-xs font-black">{copied?"Copied! ✓":"Copy"}</button>
            </div>
            <div className="p-7 text-[15px] leading-8 text-white/70 whitespace-pre-wrap">{out}</div>
          </div>
        </div>

        <p className="text-center text-[11px] text-white/20 mt-10 tracking-widest">BUILT FOR DESIGNERS • 2026</p>
      </div>
    </div>
  );
}
