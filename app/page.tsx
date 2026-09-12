"use client";
import { useState, useEffect } from "react";

const LANGUAGES: any = {
  EN: { name: "English", flag: "🇺🇸", text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." },
  ES: { name: "Español", flag: "🇪🇸", text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia odio vitae vestibulum vestibulum." },
  FR: { name: "Français", flag: "🇫🇷", text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras mattis iudicium purus sit amet fermentum." },
  DE: { name: "Deutsch", flag: "🇩🇪", text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec eget ex magna interdimensional." },
  IT: { name: "Italiano", flag: "🇮🇹", text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque habitant morbi tristique senectus." },
  PT: { name: "Português", flag: "🇵🇹", text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur arcu erat accumsan id imperdiet." },
  JA: { name: "日本語", flag: "🇯🇵", text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. 仮のテキストはデザインの世界で使用されます。" },
  HI: { name: "हिन्दी", flag: "🇮🇳", text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. यह एक डमी टेक्स्ट है जो डिज़ाइन में उपयोग होता है।" },
  KO: { name: "한국어", flag: "🇰🇷", text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. 더미 텍스트는 디자인에 사용됩니다." },
  AR: { name: "العربية", flag: "🇸🇦", text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. هذا نص وهمي يستخدم في التصميم." },
  RU: { name: "Русский", flag: "🇷🇺", text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Это фиктивный текст используемый в дизайне." },
  TR: { name: "Türkçe", flag: "🇹🇷", text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Bu tasarımda kullanılan sahte bir metindir." },
};

export default function Page() {
  const [lang, setLang] = useState("EN");
  const [count, setCount] = useState(3);
  const [type, setType] = useState("paragraphs");
  const [output, setOutput] = useState("");
  const [topic, setTopic] = useState("");
  const [copied, setCopied] = useState(false);

  const generate = () => {
    let base = LANGUAGES[lang].text;
    if(topic) base = `${topic} - ` + base;
    let result = "";
    if(type==="paragraphs") result = Array(count).fill(base).join("\n\n");
    if(type==="sentences") result = Array(count).fill(base).join(" ");
    if(type==="words") result = base.split(" ").slice(0,count).join(" ") + ".";
    setOutput(result);
  };
  useEffect(()=>{generate()}, [lang]);

  return (
    <div className="min-h-screen bg-[#050507] text-white overflow-hidden relative selection:bg-violet-500/30">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/20 via-transparent to-fuchsia-900/20" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-violet-600/30 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse delay-1000" />
      </div>

      <div className="relative z-10">
        {/* NAV */}
        <nav className="border-b border-white/[0.08] backdrop-blur-xl bg-black/20 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 h-[68px] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center font-black">L</div>
              <span className="font-bold text-[17px] tracking-tight">lorempro<span className="text-white/40">.tool</span></span>
              <span className="ml-3 px-2.5 py-1 rounded-full bg-white/[0.08] border border-white/[0.1] text-[10px] font-bold tracking-widest">PRO</span>
            </div>
            <a href="#" className="px-4 py-2 rounded-full bg-white text-black text-sm font-bold hover:scale-105 transition">Hire Me →</a>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-6 py-10 grid lg:grid-cols-[1.1fr_0.9fr] gap-6">
          {/* LEFT - Controls */}
          <div className="space-y-4">
            <div className="rounded-[24px] border border-white/[0.08] bg-gradient-to-b from-white/[0.08] to-white/[0.02] backdrop-blur-xl p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-[13px] font-bold tracking-[0.2em] text-white/40 uppercase">Languages • 12</h2>
                <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)] animate-pulse" />
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                {Object.keys(LANGUAGES).map((k:any)=>(
                  <button key={k} onClick={()=>{setLang(k);}}
                  className={`group relative rounded-2xl border p-3 text-left transition-all duration-300 ${lang===k? 'bg-white text-black border-white shadow-[0_0_30px_rgba(255,255,255,0.3)] scale-[1.02]' : 'bg-white/[0.04] border-white/[0.06] hover:bg-white/[0.08] hover:border-white/[0.15] hover:-translate-y-0.5'}`}>
                    <div className="text-[18px]">{LANGUAGES[k].flag}</div>
                    <div className={`text-[11px] font-bold mt-1 ${lang===k?'text-black':'text-white/70'}`}>{k}</div>
                    <div className={`text-[9px] truncate ${lang===k?'text-black/60':'text-white/30'}`}>{LANGUAGES[k].name}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[24px] border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-6">
              <h3 className="text-[13px] font-bold tracking-[0.2em] text-white/40 uppercase mb-5">Generator Settings</h3>
              <div className="grid grid-cols-2 gap-4 mb-5">
                <div className="space-y-2">
                  <label className="text-[11px] text-white/50 font-bold uppercase">Type</label>
                  <select value={type} onChange={e=>setType(e.target.value)} className="w-full h-11 rounded-xl bg-black/50 border border-white/10 px-3 text-sm outline-none focus:border-violet-500/50 transition">
                    <option value="paragraphs">Paragraphs</option>
                    <option value="sentences">Sentences</option>
                    <option value="words">Words</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] text-white/50 font-bold uppercase">Count: {count}</label>
                  <input type="range" min="1" max="20" value={count} onChange={e=>setCount(Number(e.target.value))} className="w-full accent-violet-500 h-1" />
                </div>
              </div>
              <input value={topic} onChange={e=>setTopic(e.target.value)} placeholder="⚡ AI Topic (e.g. tech, crypto, yoga...) - optional" className="w-full h-12 rounded-xl bg-black/60 border border-white/[0.08] px-4 text-sm placeholder:text-white/20 outline-none focus:border-violet-500/50 mb-5" />
              <button onClick={generate} className="w-full h-[52px] rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 font-black text-sm tracking-wide shadow-[0_0_30px_rgba(124,58,237,0.5)] hover:shadow-[0_0_50px_rgba(124,58,237,0.7)] hover:scale-[1.01] active:scale-[0.99] transition-all">
                ✨ GENERATE MAGIC
              </button>
            </div>
          </div>

          {/* RIGHT - Output */}
          <div className="rounded-[24px] border border-white/[0.08] bg-gradient-to-b from-white/[0.06] to-transparent backdrop-blur-xl p-2 shadow-2xl flex flex-col min-h-[640px]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500/80"/><div className="w-3 h-3 rounded-full bg-yellow-500/80"/><div className="w-3 h-3 rounded-full bg-green-500/80"/></div>
                <span className="text-[11px] text-white/30 font-mono ml-3">output.lorem • {output.split(' ').length} words</span>
              </div>
              <div className="flex gap-2">
                <button onClick={()=>{navigator.clipboard.writeText(output); setCopied(true); setTimeout(()=>setCopied(false),2000)}} className="px-3 py-1.5 rounded-full bg-white text-black text-xs font-bold hover:scale-105 transition">{copied?'✓ Copied':'Copy'}</button>
                <button onClick={()=>{const blob=new Blob([output],{type:'text/plain'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='lorem.txt'; a.click()}} className="px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-xs font-bold hover:bg-white/15 transition">Export</button>
              </div>
            </div>
            <div className="flex-1 p-6 overflow-auto">
              <pre className="whitespace-pre-wrap font-[450] leading-[1.8] text-[15px] text-white/80">{output || "Click GENERATE MAGIC..."}</pre>
            </div>
            <div className="m-2 rounded-2xl bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 border border-violet-500/20 p-4 flex items-center justify-between">
              <div>
                <div className="text-[12px] font-black tracking-wide">Need Custom SEO Tools?</div>
                <div className="text-[11px] text-white/50 mt-1">I build tools for international clients - $150+</div>
              </div>
              <a href="mailto:yourmail@gmail.com" className="px-4 py-2 rounded-full bg-white text-black text-xs font-black">Hire Me</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
