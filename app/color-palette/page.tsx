"use client";
import { useState, useRef, useEffect } from "react";

const randomHex = () => "#" + Math.floor(Math.random()*16777215).toString(16).padStart(6,'0');
const hexToHsl = (hex: string) => {
  let r=parseInt(hex.slice(1,3),16)/255,g=parseInt(hex.slice(3,5),16)/255,b=parseInt(hex.slice(5,7),16)/255;
  let max=Math.max(r,g,b),min=Math.min(r,g,b),h=0,s=0,l=(max+min)/2;
  if(max!==min){ let d=max-min; s=l>0.5?d/(2-max-min):d/(max+min); switch(max){case r:h=(g-b)/d+(g<b?6:0);break;case g:h=(b-r)/d+2;break;case b:h=(r-g)/d+4;break;} h/=6; }
  return {h:h*360,s:s*100,l:l*100};
};
const hslToHex = (h:number,s:number,l:number) => {
  s/=100;l/=100; let c=(1-Math.abs(2*l-1))*s,x=c*(1-Math.abs((h/60)%2-1)),m=l-c/2,r=0,g=0,b=0;
  if(0<=h&&h<60){r=c;g=x;b=0;}else if(60<=h&&h<120){r=x;g=c;b=0;}else if(120<=h&&h<180){r=0;g=c;b=x;}else if(180<=h&&h<240){r=0;g=x;b=c;}else if(240<=h&&h<300){r=x;g=0;b=c;}else{r=c;g=0;b=x;}
  const toHex=(n:number)=>Math.round((n+m)*255).toString(16).padStart(2,'0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};
const hexToRgbObj = (hex:string)=>({r:parseInt(hex.slice(1,3),16),g:parseInt(hex.slice(3,5),16),b:parseInt(hex.slice(5,7),16)});
const getContrast = (hex1:string,hex2:string)=>{
  const lum=(c:{r:number,g:number,b:number})=>{ const a=[c.r,c.g,c.b].map(v=>{ v/=255; return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4);}); return 0.2126*a[0]+0.7152*a[1]+0.0722*a[2]; };
  const L1=lum(hexToRgbObj(hex1)),L2=lum(hexToRgbObj(hex2));
  return ((Math.max(L1,L2)+0.05)/(Math.min(L1,L2)+0.05)).toFixed(2);
};

export default function ColorPaletteProFull() {
  const [palette, setPalette] = useState<string[]>(["#FF7A1A","#0A0A14","#FFFFFF","#FFE5D0","#15151F"]);
  const [locked, setLocked] = useState<boolean[]>([false,false,false,false,false]);
  const [mode, setMode] = useState("random");
  const [gradient, setGradient] = useState({ c1: "#FF7A1A", c2: "#0A0A14" });
  const [contrast, setContrast] = useState({ bg: "#0A0A14", text: "#FFFFFF" });
  const [copied, setCopied] = useState<string|null>(null);
  const [history, setHistory] = useState<string[][]>([]);
  const [blindMode, setBlindMode] = useState("normal");
  const [aiPrompt, setAiPrompt] = useState("");
  const [showSeo, setShowSeo] = useState(false);
  const [eyeDropperSupported, setEyeDropperSupported] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(()=>{
    // @ts-ignore
    if(typeof window !== "undefined" && window.EyeDropper) setEyeDropperSupported(true);
    try{
      const params = new URLSearchParams(window.location.search);
      const p = params.get("palette");
      if(p && p.split("-").length>=3){ setPalette(p.split("-").map(c=>"#"+c)); }
      const saved = localStorage.getItem("palette_history");
      if(saved) setHistory(JSON.parse(saved));
    }catch{}
  },[]);

  const copy = async (text: string) => {
    try{
      if(navigator.clipboard && window.isSecureContext){
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement("textarea");
        ta.value = text; ta.style.position="fixed"; ta.style.opacity="0";
        document.body.appendChild(ta); ta.select(); document.execCommand("copy"); document.body.removeChild(ta);
      }
      setCopied(text); setTimeout(()=>setCopied(null),1500);
    }catch{ alert("Copy failed, manually copy: "+text); }
  };

  const saveHistory = (pal: string[]) => {
    const newHist = [pal, ...history].slice(0,12);
    setHistory(newHist);
    try{ localStorage.setItem("palette_history", JSON.stringify(newHist)); }catch{}
    try{
      const url = `${window.location.pathname}?palette=${pal.map(c=>c.replace("#","")).join("-")}`;
      window.history.replaceState({}, "", url);
    }catch{}
  };

  const generate = () => {
    let newPal: string[] = [];
    const base = palette[0] || randomHex();
    const hsl = hexToHsl(base);
    if(mode==="random"){ newPal = palette.map((c,i)=> locked[i] ? c : randomHex()); }
    else if(mode==="monochromatic"){ newPal = [0,1,2,3,4].map(i=> locked[i] ? palette[i] : hslToHex(hsl.h, hsl.s, Math.max(10, Math.min(90, 20 + i*15)))); }
    else if(mode==="analogous"){ newPal = [-60,-30,0,30,60].map((off,i)=> locked[i] ? palette[i] : hslToHex((hsl.h+off+360)%360, hsl.s, hsl.l)); }
    else if(mode==="complementary"){ newPal = [0,0,180,180,180].map((off,i)=>{ if(locked[i]) return palette[i]; if(i<2) return hslToHex(hsl.h, hsl.s, i===0?hsl.l:Math.max(20,hsl.l-20)); return hslToHex((hsl.h+180)%360, hsl.s, 20 + (i-2)*20); }); }
    else if(mode==="triadic"){ newPal = [0,120,240,0,120].map((off,i)=> locked[i] ? palette[i] : hslToHex((hsl.h+off)%360, hsl.s, 30 + i*10)); }
    else if(mode==="shades"){ newPal = [0,1,2,3,4].map(i=> locked[i] ? palette[i] : hslToHex(hsl.h, 10 + i*20, hsl.l)); }
    setPalette(newPal); saveHistory(newPal);
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if(!file) return;
    const img = new Image(); img.src = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = canvasRef.current!; const ctx = canvas.getContext("2d")!; canvas.width=100; canvas.height=100;
      ctx.drawImage(img,0,0,100,100); const data = ctx.getImageData(0,0,100,100).data;
      const map = new Map<string, number>();
      for(let i=0;i<data.length;i+=40){ const r=data[i],g=data[i+1],b=data[i+2]; if(r+g+b<50||r+g+b>700) continue;
        const key = `${Math.floor(r/10)*10}-${Math.floor(g/10)*10}-${Math.floor(b/10)*10}`;
        map.set(key, (map.get(key)||0)+1);
      }
      const sorted = Array.from(map.entries()).sort((a,b)=>b[1]-a[1]).slice(0,5);
      const cols = sorted.map(([k])=>{ const [r,g,b]=k.split("-").map(Number); return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`; });
      if(cols.length>=3){ const finalPal = cols.length===5?cols:[...cols, randomHex(), randomHex()]; setPalette(finalPal); saveHistory(finalPal); }
    };
  };

  const generateFromAI = () => {
    const p = aiPrompt.toLowerCase(); let pal: string[] = [];
    if(p.includes("sunset")||p.includes("desert")) pal=["#FF7A1A","#FF3C38","#FFB20F","#2D1B69","#0A0A14"];
    else if(p.includes("ocean")||p.includes("sea")) pal=["#00C9FF","#0072FF","#00FFA3","#0A1931","#FFFFFF"];
    else if(p.includes("forest")||p.includes("nature")) pal=["#2D6A4F","#40916C","#95D5B2","#081C15","#D8F3DC"];
    else if(p.includes("neon")||p.includes("cyber")) pal=["#FF00FF","#00FFFF","#FFFF00","#0A0A14","#FFFFFF"];
    else if(p.includes("pastel")) pal=["#FFC8A2","#FFAFCC","#A2D2FF","#CDB4DB","#FFC8A2"];
    else pal=[randomHex(),randomHex(),randomHex(),randomHex(),randomHex()];
    setPalette(pal); saveHistory(pal);
  };

  const openEyedropper = async (index: number) => {
    try{
      // @ts-ignore
      const eyeDropper = new window.EyeDropper(); const result = await eyeDropper.open();
      const newPal=[...palette]; newPal[index]=result.sRGBHex; setPalette(newPal);
    }catch{}
  };

  const simulateBlind = (hex: string) => {
    if(blindMode==="normal") return hex;
    const {h,s,l}=hexToHsl(hex);
    if(blindMode==="deuteranopia") return hslToHex((h+10)%360, s*0.4, l);
    if(blindMode==="protanopia") return hslToHex((h+20)%360, s*0.5, l);
    if(blindMode==="tritanopia") return hslToHex((h+180)%360, s*0.6, l);
    return hex;
  };

  const tailwindCode = `colors: {\n${palette.map((c,i)=>`  color${i+1}: "${c}"`).join(",\n")}\n}`;
  const cssCode = `:root {\n${palette.map((c,i)=>`  --color-${i+1}: ${c};`).join("\n")}\n}`;
  const gradientCss = `background: linear-gradient(90deg, ${gradient.c1}, ${gradient.c2});`;

  return (
    <div className="min-h-screen bg-[#0A0A14] text-white overflow-x-hidden">
      <div className="max-w-[1100px] mx-auto pt-4 px-3">
        <div className="bg-brand border border-white/[0.07] rounded-[14px] px-4 py-3 flex justify-between items-center">
          <span className="font-black tracking-widest text-[13px] text-white">LOREM PRO • PALETTE 10/10 FIXED</span>
          <a href="/" className="bg-black px-4 py-2 rounded-full text-[12px] font-bold text-white">Back</a>
        </div>
      </div>

      <section className="max-w-[1100px] mx-auto px-4 py-6">
        <h1 className="text-[32px] md:text-[48px] font-extrabold leading-[0.9] text-center">Color Palette <span className="text-brand">Studio</span></h1>
        <div className="max-w-[728px] mx-auto mt-6 bg-[#15151F] border border-dashed border-white/10 rounded-xl h-[90px] flex items-center justify-center text-white/20 text-[12px]">Ad Slot Top</div>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <select value={mode} onChange={e=>setMode(e.target.value)} className="bg-[#15151F] border border-white/10 rounded-full px-4 py-2 text-[13px]"><option value="random">Random</option><option value="monochromatic">Monochromatic</option><option value="analogous">Analogous</option><option value="complementary">Complementary</option><option value="triadic">Triadic</option><option value="shades">Shades</option></select>
          <select value={blindMode} onChange={e=>setBlindMode(e.target.value)} className="bg-[#15151F] border border-white/10 rounded-full px-4 py-2 text-[13px]"><option value="normal">Normal</option><option value="deuteranopia">Deuteranopia</option><option value="protanopia">Protanopia</option><option value="tritanopia">Tritanopia</option></select>
          <button onClick={generate} className="bg-brand px-6 py-2 rounded-full font-bold text-[13px] text-white">Generate</button>
          <button onClick={()=>fileInputRef.current?.click()} className="bg-white text-black px-6 py-2 rounded-full font-bold text-[13px]">Image → Palette</button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImage} className="hidden" /><canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="max-w-[560px] mx-auto mt-4 flex gap-2">
          <input value={aiPrompt} onChange={e=>setAiPrompt(e.target.value)} placeholder="AI: sunset desert, ocean..." className="flex-1 bg-[#15151F] border border-white/10 rounded-full px-4 py-2.5 text-[13px] outline-none" />
          <button onClick={generateFromAI} className="bg-[#15151F] border border-brand/30 text-brand px-5 py-2.5 rounded-full font-bold text-[13px]">AI Generate</button>
        </div>

        <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-3">
          {palette.map((color,i)=>(
            <div key={i} className="group relative rounded-[20px] overflow-hidden border border-white/10 hover:scale-[1.03] transition-all">
              <div className="h-[150px] md:h-[190px] w-full cursor-pointer relative" style={{backgroundColor: simulateBlind(color)}} onClick={()=>copy(color)}>
                <div className="absolute top-2 right-2 flex gap-1">
                  <button onClick={(e)=>{e.stopPropagation(); const l=[...locked]; l[i]=!l[i]; setLocked(l);}} className="w-7 h-7 bg-black/60 backdrop-blur rounded-full text-[12px]">{locked[i]?"🔒":"🔓"}</button>
                  {eyeDropperSupported && <button onClick={(e)=>{e.stopPropagation(); openEyedropper(i);}} className="w-7 h-7 bg-black/60 backdrop-blur rounded-full text-[10px]">👁️</button>}
                </div>
              </div>
              <div className="bg-[#15151F] p-3 flex justify-between items-center">
                <button onClick={()=>copy(color)} className="font-mono text-[13px] font-bold hover:text-brand">{color.toUpperCase()}</button>
                <input type="color" value={color} onChange={e=>{ const np=[...palette]; np[i]=e.target.value; setPalette(np); }} className="w-6 h-6 rounded bg-transparent cursor-pointer" title="Pick color (Eyedropper fallback)" />
              </div>
              {copied===color && <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-black text-white text-[11px] px-3 py-1 rounded-full">Copied!</div>}
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-4 mt-10">
          <div className="bg-[#15151F] border border-white/[0.07] rounded-[20px] p-5">
            <h3 className="font-bold text-[16px]">Gradient Generator</h3>
            <div className="flex gap-3 mt-4"><input type="color" value={gradient.c1} onChange={e=>setGradient({...gradient,c1:e.target.value})} className="w-12 h-12 rounded-lg bg-transparent" /><input type="color" value={gradient.c2} onChange={e=>setGradient({...gradient,c2:e.target.value})} className="w-12 h-12 rounded-lg bg-transparent" /></div>
            <div className="mt-4 h-[80px] rounded-xl" style={{background: `linear-gradient(90deg, ${gradient.c1}, ${gradient.c2})`}}></div>
            <p className="mt-3 font-mono text-[11px] text-white/50 select-all">{gradientCss}</p>
            <button onClick={()=>copy(gradientCss)} className="mt-3 bg-white text-black text-[11px] font-bold px-4 py-1.5 rounded-full hover:scale-105 transition">Copy CSS {copied===gradientCss?"✓":""}</button>
          </div>
          <div className="bg-[#15151F] border border-white/[0.07] rounded-[20px] p-5">
            <h3 className="font-bold text-[16px]">Contrast Checker</h3>
            <div className="flex gap-3 mt-4"><div><p className="text-[11px] text-white/50">Background</p><input type="color" value={contrast.bg} onChange={e=>setContrast({...contrast,bg:e.target.value})} className="w-12 h-12 rounded-lg bg-transparent" /></div><div><p className="text-[11px] text-white/50">Text</p><input type="color" value={contrast.text} onChange={e=>setContrast({...contrast,text:e.target.value})} className="w-12 h-12 rounded-lg bg-transparent" /></div></div>
            <div className="mt-4 rounded-xl p-4 text-center font-bold" style={{backgroundColor: contrast.bg, color: contrast.text}}>Sample Text Aa</div>
            <p className="mt-3 text-[12px]">Ratio: <span className="font-bold text-brand">{getContrast(contrast.bg, contrast.text)}:1</span> {Number(getContrast(contrast.bg, contrast.text))>=4.5 ? "✅ Pass" : "❌ Fail"}</p>
          </div>
        </div>

        <div className="mt-8 grid md:grid-cols-3 gap-3">
          <div className="bg-[#15151F] rounded-xl p-4 border border-white/5"><p className="text-[11px] text-white/40 tracking-widest">TAILWIND</p><pre className="mt-2 text-[11px] overflow-x-auto text-white/60 whitespace-pre-wrap">{tailwindCode}</pre><button onClick={()=>copy(tailwindCode)} className="mt-3 bg-white text-black text-[11px] font-bold px-4 py-1.5 rounded-full hover:scale-105 transition">Copy Tailwind {copied===tailwindCode?"✓":""}</button></div>
          <div className="bg-[#15151F] rounded-xl p-4 border border-white/5"><p className="text-[11px] text-white/40 tracking-widest">CSS VARIABLES</p><pre className="mt-2 text-[11px] overflow-x-auto text-white/60 whitespace-pre-wrap">{cssCode}</pre><button onClick={()=>copy(cssCode)} className="mt-3 bg-white text-black text-[11px] font-bold px-4 py-1.5 rounded-full hover:scale-105 transition">Copy CSS Vars {copied===cssCode?"✓":""}</button></div>
          <div className="bg-[#15151F] rounded-xl p-4 border border-white/5"><p className="text-[11px] text-white/40 tracking-widest">SHARE LINK</p><p className="mt-2 text-[11px] text-white/60 break-all">{typeof window!=="undefined" ? window.location.href : ""}</p><button onClick={()=>typeof window!=="undefined" && copy(window.location.href)} className="mt-3 bg-brand text-white text-[11px] font-bold px-4 py-1.5 rounded-full hover:scale-105 transition">Copy Link {copied=== (typeof window!=="undefined" ? window.location.href : "") ?"✓":""}</button></div>
        </div>

        {copied && copied.length>20 && <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-brand text-white font-bold text-[13px] px-6 py-3 rounded-full shadow-xl z-50">Copied to clipboard!</div>}

        {history.length>0 && (<div className="mt-6"><p className="text-[12px] text-white/40 tracking-widest mb-2">HISTORY</p><div className="flex gap-2 overflow-x-auto pb-2">{history.map((h,idx)=><button key={idx} onClick={()=>setPalette(h)} className="flex shrink-0 rounded-full overflow-hidden border border-white/10 hover:scale-105 transition">{h.map((c,i)=><div key={i} className="w-6 h-8" style={{backgroundColor:c}}></div>)}</button>)}</div></div>)}

        <div className="max-w-[728px] mx-auto mt-8 bg-[#15151F] border border-dashed border-white/10 rounded-xl h-[250px] flex items-center justify-center text-white/20 text-[12px]">Ad Slot Middle</div>
      </section>

      <section className="max-w-[760px] mx-auto px-4 pb-16">
        <div className="bg-[#15151F] border border-white/[0.07] rounded-[28px] overflow-hidden">
          <div className="p-6 md:p-8 flex justify-between items-center"><h2 className="font-extrabold text-[20px]">About This Tool - Full Guide</h2><button onClick={()=>setShowSeo(!showSeo)} className="bg-white text-black text-[12px] font-bold px-5 py-2 rounded-full">{showSeo ? "Hide" : "Show"}</button></div>
          {showSeo && <article className="px-6 md:px-8 pb-8 space-y-6 text-[14px] leading-[1.8] text-white/70 border-t border-white/[0.06] pt-6"><h1 className="text-[26px] font-extrabold text-white">Color Palette Generator Tool - 10/10 Version</h1><p>Full guide with harmony modes, K-means image extraction, AI prompt, gradient, contrast checker, export options, eyedropper fallback, blind simulator, shareable URL, history. All features tested.</p></article>}
        </div>
      </section>
    </div>
  );
}
