// app/palette/PaletteStudio.tsx
"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import {
  randomHex, hexToHsl, hslToHex, contrastRatio, wcagLevel, apcaContrast,
  simulateCVD, generateHarmony, type HarmonyMode,
} from "./lib/color";
import { exportPNG, exportSVG, exportJSON, exportASE } from "./lib/export";

/* ---------------- Undo/Redo reducer ---------------- */
type State = { present: string[]; past: string[][]; future: string[][] };
type Action =
  | { type: "set"; colors: string[] }
  | { type: "undo" }
  | { type: "redo" };

const reducer = (s: State, a: Action): State => {
  switch (a.type) {
    case "set":
      return { present: a.colors, past: [...s.past.slice(-49), s.present], future: [] };
    case "undo":
      if (!s.past.length) return s;
      return {
        present: s.past[s.past.length - 1],
        past: s.past.slice(0, -1),
        future: [s.present, ...s.future],
      };
    case "redo":
      if (!s.future.length) return s;
      return {
        present: s.future[0],
        past: [...s.past, s.present],
        future: s.future.slice(1),
      };
  }
};

const SHARE_KEY = "palette_history_v2";
const SIZE = 5;

export default function PaletteStudio() {
  const [{ present: palette, past, future }, dispatch] = useReducer(reducer, {
    present: ["#FF7A1A", "#0A0A14", "#FFFFFF", "#FFE5D0", "#15151F"],
    past: [], future: [],
  });
  const setPalette = useCallback((colors: string[]) => dispatch({ type: "set", colors }), []);

  const [locked, setLocked] = useState<boolean[]>(Array(SIZE).fill(false));
  const [mode, setMode] = useState<HarmonyMode>("random");
  const [blindMode, setBlindMode] = useState("normal");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState("");
  const [history, setHistory] = useState<string[][]>([]);
  const [gradient, setGradient] = useState({ c1: "#FF7A1A", c2: "#0A0A14" });
  const [contrast, setContrast] = useState({ bg: "#0A0A14", text: "#FFFFFF" });
  const [showSeo, setShowSeo] = useState(false);
  const [eyeDropperSupported, setEyeDropperSupported] = useState(false);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setShareUrl(window.location.href);
    setEyeDropperSupported(Boolean((window as any).EyeDropper));
    const p = new URLSearchParams(window.location.search).get("palette");
    if (p) {
      const cols = p.split("-").map((c) => "#" + c).filter((c) => /^#[0-9a-f]{6}$/i.test(c));
      if (cols.length >= 3) setPalette(cols);
    }
    try {
      const saved = localStorage.getItem(SHARE_KEY);
      if (saved) setHistory(JSON.parse(saved));
    } catch {}
    workerRef.current = new Worker(new URL("./kmeans.worker.ts", import.meta.url));
    return () => workerRef.current?.terminate();
  }, [setPalette]);

  const toastMsg = (m: string) => { setToast(m); setTimeout(() => setToast(null), 1600); };

  const copy = useCallback(async (text: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(text);
      else {
        const ta = document.createElement("textarea");
        ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
        document.body.appendChild(ta); ta.select(); document.execCommand("copy");
        document.body.removeChild(ta);
      }
      toastMsg("Copied!");
    } catch { toastMsg("Copy failed"); }
  }, []);

  const saveHistory = useCallback((pal: string[]) => {
    setHistory((prev) => {
      const next = [pal, ...prev.filter((h) => h.join() !== pal.join())].slice(0, 20);
      try { localStorage.setItem(SHARE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
    if (typeof window !== "undefined") {
      const url = `${window.location.pathname}?palette=${pal.map((c) => c.slice(1)).join("-")}`;
      window.history.replaceState({}, "", url);
      setShareUrl(window.location.href);
    }
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "z" && !e.shiftKey) { e.preventDefault(); dispatch({ type: "undo" }); }
      else if (mod && e.key.toLowerCase() === "z" && e.shiftKey) { e.preventDefault(); dispatch({ type: "redo" }); }
      else if (e.code === "Space" && !(e.target instanceof HTMLInputElement)) {
        e.preventDefault(); generate();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, locked]);

  const generate = useCallback(() => {
    const base = palette[0] || randomHex();
    const fresh = generateHarmony(base, mode, SIZE);
    const next = fresh.map((c, i) => (locked[i] ? palette[i] : c));
    setPalette(next);
    saveHistory(next);
  }, [palette, mode, locked, setPalette, saveHistory]);

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const img = new Image();
    img.src = URL.createObjectURL(file);
    await img.decode();
    const canvas = canvasRef.current!;
    canvas.width = 120; canvas.height = 120;
    const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
    ctx.drawImage(img, 0, 0, 120, 120);
    const pixels = ctx.getImageData(0, 0, 120, 120).data;
    if (!workerRef.current) return;
    workerRef.current.onmessage = (ev) => {
      const { colors } = ev.data as { colors: string[] };
      const final = colors.slice(0, SIZE);
      while (final.length < SIZE) final.push(randomHex());
      setPalette(final); saveHistory(final);
    };
    workerRef.current.postMessage({ pixels, k: SIZE });
    toastMsg("Extracting palette...");
  };

  /* ---------- AI - FINAL: Understands Colors, Places, Moods & Unlocks ---------- */
  const generateFromAI = async () => {
    setAiLoading(true);
    await new Promise(r => setTimeout(r, 200));
    const raw = aiPrompt.trim();
    const p = raw.toLowerCase();
    let pal: string[] = [];
    const colorMap: Record<string, number> = {
      red: 5, brown: 25, orange: 30, yellow: 45, 
      green: 130, cyan: 185, blue: 225, purple: 275, 
      pink: 330
    };
    const makeShades = (hue: number) => {
      const toHex = (h:number,s:number,l:number) => {
        s/=100;l/=100; let c=(1-Math.abs(2*l-1))*s,x=c*(1-Math.abs((h/60)%2-1)),m=l-c/2,r=0,g=0,b=0;
        if(h<60){r=c;g=x;}else if(h<120){r=x;g=c;}else if(h<180){g=c;b=x;}else if(h<240){g=x;b=c;}else if(h<300){r=x;b=c;}else{r=c;b=x;}
        const h2=(n:number)=>Math.round((n+m)*255).toString(16).padStart(2,'0');
        return `#${h2(r)}${h2(g)}${h2(b)}`;
      };
      if(hue === 30) return [toHex(25, 85, 45), toHex(30, 95, 55), toHex(35, 100, 60), toHex(38, 90, 70), toHex(40, 80, 80)];
      return [toHex(hue, 75, 40), toHex(hue, 70, 55), toHex(hue, 65, 65), toHex(hue, 50, 78), toHex(hue, 40, 88)];
    };
    const foundColor = Object.keys(colorMap).find(c => p.includes(c));
    if (!raw) {
      pal = Array.from({length: SIZE}, () => randomHex());
    } else if (foundColor) {
      if (foundColor === "black") pal = ["#000000","#1A1A1A","#333333","#666666","#999999"];
      else if (foundColor === "white") pal = ["#FFFFFF","#F5F5F5","#E0E0E0","#BDBDBD","#757575"];
      else pal = makeShades(colorMap[foundColor]);
    } else if(p.includes("sunset")||p.includes("sunrise")||p.includes("desert")) {
      pal=["#FF6A00","#FF3C38","#FFB20F","#2D1B69","#0A0A14"];
    } else if(p.includes("ocean")||p.includes("sea")||p.includes("beach")) {
      pal=["#00C9FF","#0072FF","#00FFA3","#0A1931","#FFFFFF"];
    } else if(p.includes("mountain")||p.includes("forest")||p.includes("nature")) {
      pal=["#2D6A4F","#40916C","#95D5B2","#081C15","#D8F3DC"];
    } else if(p.includes("neon")||p.includes("cyber")) {
      pal=["#FF00FF","#00FFFF","#FFFF00","#0A0A14","#FFFFFF"];
    } else if(p.includes("pastel")) {
      pal=["#FFC8A2","#FFAFCC","#A2D2FF","#CDB4DB","#FFC8A2"];
    } else {
      let h = 0; for(const c of p) h = (h*31 + c.charCodeAt(0)) % 360;
      pal = makeShades(h);
    }
    setLocked(Array(SIZE).fill(false));
    setPalette(pal); 
    saveHistory(pal);
    toastMsg(raw ? `AI: ${raw}` : "Random palette");
    setAiLoading(false);
  };

  const openEyedropper = async (index: number) => {
    try {
      const ed = new (window as any).EyeDropper();
      const r = await ed.open();
      const next = [...palette]; next[index] = r.sRGBHex; setPalette(next);
    } catch {}
  };

  const onDrop = (targetIdx: number) => {
    if (draggedIdx === null || draggedIdx === targetIdx) return;
    const next = [...palette];
    const [moved] = next.splice(draggedIdx, 1);
    next.splice(targetIdx, 0, moved);
    const newLocked = [...locked];
    const [movedLock] = newLocked.splice(draggedIdx, 1);
    newLocked.splice(targetIdx, 0, movedLock);
    setPalette(next); setLocked(newLocked);
    setDraggedIdx(null);
  };

  const tailwind = useMemo(() => `colors: {\n${palette.map((c, i) => `  color${i + 1}: "${c}"`).join(",\n")}\n}`, [palette]);
  const cssVars = useMemo(() => `:root {\n${palette.map((c, i) => `  --color-${i + 1}: ${c};`).join("\n")}\n}`, [palette]);
  const tailwind4 = useMemo(() => `@theme {\n${palette.map((c, i) => `  --color-p${i + 1}: ${c};`).join("\n")}\n}`, [palette]);
  const gradientCssValue = useMemo(() => `linear-gradient(90deg, ${gradient.c1}, ${gradient.c2})`, [gradient]);
  const gradientCss = useMemo(() => `background: ${gradientCssValue};`, [gradientCssValue]);
  const contrastRatioVal = useMemo(() => +contrastRatio(contrast.bg, contrast.text).toFixed(2), [contrast]);
  const apcaVal = useMemo(() => apcaContrast(contrast.bg, contrast.text), [contrast]);

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto max-w-6xl px-3 py-4 sm:px-4 sm:py-6">
        {/* header - responsive */}
        <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 sm:flex-row sm:justify-between sm:items-center">
          <span className="text-sm font-black tracking-widest text-center sm:text-left">PALETTE STUDIO</span>
          <div className="flex items-center justify-center gap-2">
            <button onClick={() => dispatch({ type: "undo" })} disabled={!past.length} className="rounded-full bg-white/10 px-3 py-1.5 text-xs disabled:opacity-30">↶ Undo</button>
            <button onClick={() => dispatch({ type: "redo" })} disabled={!future.length} className="rounded-full bg-white/10 px-3 py-1.5 text-xs disabled:opacity-30">↷ Redo</button>
          </div>
        </div>

        {/* controls - responsive */}
        <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:justify-center">
          <select value={mode} onChange={(e) => setMode(e.target.value as HarmonyMode)} className="col-span-1 rounded-full border border-white/10 bg-neutral-900 px-3 py-2.5 text-xs sm:text-sm sm:px-4">
            {["random","monochromatic","analogous","complementary","triadic","tetradic","split","shades"].map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <select value={blindMode} onChange={(e) => setBlindMode(e.target.value)} className="col-span-1 rounded-full border border-white/10 bg-neutral-900 px-3 py-2.5 text-xs sm:text-sm sm:px-4">
            {["normal","protanopia","deuteranopia","tritanopia","achromatopsia"].map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <button onClick={generate} className="col-span-2 rounded-full bg-orange-500 px-6 py-2.5 text-sm font-bold hover:bg-orange-400 sm:col-span-1">Generate [Space]</button>
          <button onClick={() => fileRef.current?.click()} className="col-span-2 rounded-full bg-white px-6 py-2.5 text-sm font-bold text-black sm:col-span-1">Image → Palette</button>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} className="hidden" />
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* AI bar - responsive */}
        <div className="mx-auto mt-3 flex flex-col gap-2 sm:max-w-xl sm:flex-row">
          <input value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} onKeyDown={(e) => e.key === "Enter" && generateFromAI()} placeholder="AI: sunset, ocean, mountain, brown, neon... (empty = random)" className="flex-1 rounded-full border border-white/10 bg-neutral-900 px-4 py-3 text-sm outline-none focus:border-orange-500/50" />
          <button onClick={generateFromAI} disabled={aiLoading} className="rounded-full border border-orange-500/40 bg-neutral-900 px-6 py-3 text-sm font-bold text-orange-400 disabled:opacity-50 sm:w-auto w-full"> {aiLoading ? "…" : "AI ✨"} </button>
        </div>

        {/* swatches - fully responsive */}
        <div className="mt-6 grid grid-cols-1 gap-3 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
          {palette.map((color, i) => (
            <div key={i} draggable onDragStart={() => setDraggedIdx(i)} onDragOver={(e) => e.preventDefault()} onDrop={() => onDrop(i)} className={`group flex flex-row overflow-hidden rounded-2xl border border-white/10 transition md:flex-col ${draggedIdx === i ? "opacity-40" : "hover:scale-[1.02] active:scale-[0.98]"}`}>
              <div className="relative h-20 w-24 shrink-0 cursor-pointer sm:h-28 md:h-40 md:w-full" style={{ backgroundColor: simulateCVD(color, blindMode) }} onClick={() => copy(color)}>
                <div className="absolute right-1.5 top-1.5 flex gap-1">
                  <button onClick={(e) => { e.stopPropagation(); const n = [...locked]; n[i] = !n[i]; setLocked(n); }} className="flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-xs backdrop-blur" aria-label={locked[i] ? "Unlock" : "Lock"}>{locked[i] ? "🔒" : "🔓"}</button>
                  {eyeDropperSupported && (<button onClick={(e) => { e.stopPropagation(); openEyedropper(i); }} className="flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-xs backdrop-blur" aria-label="Pick from screen">👁️</button>)}
                </div>
              </div>
              <div className="flex flex-1 items-center justify-between bg-neutral-900 p-3 md:flex-row">
                <button onClick={() => copy(color)} className="font-mono text-[13px] font-bold hover:text-orange-400">{color.toUpperCase()}</button>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-white/40">{wcagLevel(contrastRatio("#000", color))}</span>
                  <input type="color" value={color} onChange={(e) => { const n = [...palette]; n[i] = e.target.value; setPalette(n); }} className="h-6 w-6 cursor-pointer rounded bg-transparent" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* gradient + contrast - responsive */}
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-neutral-900 p-4 sm:p-5">
            <h3 className="font-bold">Gradient</h3>
            <div className="mt-3 flex gap-3"><input type="color" value={gradient.c1} onChange={(e) => setGradient({ ...gradient, c1: e.target.value })} className="h-12 w-12 rounded-lg bg-transparent" /><input type="color" value={gradient.c2} onChange={(e) => setGradient({ ...gradient, c2: e.target.value })} className="h-12 w-12 rounded-lg bg-transparent" /></div>
            <div className="mt-3 h-20 rounded-xl" style={{ background: gradientCssValue }} /><pre className="mt-2 select-all text-[11px] text-white/50 break-all">{gradientCss}</pre><button onClick={() => copy(gradientCss)} className="mt-2 rounded-full bg-white px-4 py-1.5 text-[11px] font-bold text-black">Copy CSS</button>
          </div>
          <div className="rounded-2xl border border-white/10 bg-neutral-900 p-4 sm:p-5">
            <h3 className="font-bold">Contrast Checker</h3>
            <div className="mt-3 flex gap-3"><div><p className="text-[11px] text-white/50">Background</p><input type="color" value={contrast.bg} onChange={(e) => setContrast({ ...contrast, bg: e.target.value })} className="h-12 w-12 rounded-lg bg-transparent" /></div><div><p className="text-[11px] text-white/50">Text</p><input type="color" value={contrast.text} onChange={(e) => setContrast({ ...contrast, text: e.target.value })} className="h-12 w-12 rounded-lg bg-transparent" /></div></div>
            <div className="mt-3 rounded-xl p-4 text-center font-bold" style={{ backgroundColor: contrast.bg, color: contrast.text }}>Sample Text Aa</div>
            <div className="mt-2 space-y-1 text-xs"><p>WCAG: <b className="text-orange-400">{contrastRatioVal}:1</b> — {wcagLevel(contrastRatioVal)}</p><p>APCA: <b className="text-orange-400">{apcaVal}</b></p></div>
          </div>
        </div>

        {/* exports */}
        <div className="mt-6 grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {[{ label: "Tailwind", code: tailwind },{ label: "Tailwind v4", code: tailwind4 },{ label: "CSS Vars", code: cssVars },{ label: "Share Link", code: shareUrl, isLink: true },].map(({ label, code, isLink }) => (
            <div key={label} className="rounded-xl border border-white/10 bg-neutral-900 p-4"><p className="text-[11px] tracking-widest text-white/40">{label.toUpperCase()}</p><pre className="mt-2 max-h-24 overflow-auto whitespace-pre-wrap break-all text-[11px] text-white/60">{code}</pre><button onClick={() => copy(code)} className="mt-2 rounded-full bg-white px-4 py-1.5 text-[11px] font-bold text-black">Copy {isLink ? "Link" : ""}</button></div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap justify-center gap-2"><button onClick={() => exportPNG(palette)} className="rounded-full border border-white/10 bg-neutral-900 px-5 py-2 text-xs">Export PNG</button><button onClick={() => exportSVG(palette)} className="rounded-full border border-white/10 bg-neutral-900 px-5 py-2 text-xs">Export SVG</button><button onClick={() => exportJSON(palette)} className="rounded-full border border-white/10 bg-neutral-900 px-5 py-2 text-xs">Export JSON</button><button onClick={() => exportASE(palette)} className="rounded-full border border-white/10 bg-neutral-900 px-5 py-2 text-xs">Export ASE</button></div>

        {history.length > 0 && (<div className="mt-6"><p className="mb-2 text-[11px] tracking-widest text-white/40">HISTORY</p><div className="flex gap-2 overflow-x-auto pb-2">{history.map((h, idx) => (<button key={idx} onClick={() => setPalette(h)} className="flex shrink-0 overflow-hidden rounded-full border border-white/10 hover:scale-105 transition">{h.map((c, i) => (<div key={i} className="h-8 w-6" style={{ backgroundColor: c }} />))}</button>))}</div></div>)}

        {/* SEO article - UPDATED per features */}
          {/*    <div className="mt-8 rounded-3xl border border-white/10 bg-neutral-900">
          <div className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between"><h2 className="text-lg font-extrabold">About This Tool — Complete Guide</h2><button onClick={() => setShowSeo((v) => !v)} className="self-start rounded-full bg-white px-5 py-2 text-xs font-bold text-black sm:self-auto">{showSeo ? "Hide" : "Show"}</button></div>
          {showSeo && (
            <article className="space-y-6 border-t border-white/5 px-6 pb-8 pt-6 text-sm leading-relaxed text-white/70">
              <h1 className="text-2xl font-extrabold text-white">Color Palette Generator — All Features Explained</h1>
              
              <div className="rounded-xl bg-white/5 p-4"><h2 className="text-base font-bold text-white">🤖 AI Prompt (New!)</h2>
              <p className="mt-2">AI box me kuch bhi type karo, usi ke hisab se palette banega. Khali chhod ke AI dabao to random beautiful palette.</p>
              <ul className="mt-2 list-disc pl-5 space-y-1"><li><b>Colors:</b> <code>red, brown, orange, yellow, green, blue, purple, pink, black, white</code> — likhoge to usi color ke 5 shades.</li><li><b>Places / Nature:</b> <code>sunset, sunrise, ocean, sea, beach, mountain, forest, desert</code></li><li><b>Moods / Styles:</b> <code>neon, cyber, pastel, love, romantic</code></li></ul></div>

              <h2 className="text-lg font-bold text-white">🔒 Lock Feature</h2><p>Har color card pe 🔓/🔒 icon hai. Kisi color ko lock kar doge to <code>Space</code> ya <code>Generate</code> dabane pe wo color nahi badlega. Pasandida rang bachane ke liye. AI prompt se generate karne pe saare lock auto open ho jate hain taki naya palette pura dikhe.</p>
              
              <h2 className="text-lg font-bold text-white">👁️ EyeDropper — Screen se Color Pick</h2><p>Har card pe 👁️ icon tab dikhega jab browser support karega (Chrome, Edge). Click karke screen pe kahin se bhi color utha sakte ho. Ye native <code>EyeDropper API</code> use karta hai.</p>

              <h2 className="text-lg font-bold text-white">🖼️ Image → Palette (K-Means)</h2><p>Image upload karne pe web worker me k-means clustering chalta hai (UI freeze nahi hota) aur image ke 5 dominant colors nikalta hai.</p>

              <h2 className="text-lg font-bold text-white">↕️ Drag to Reorder</h2><p>Color cards ko drag-drop karke order badal sakte ho. Mobile pe long-press drag.</p>

              <h2 className="text-lg font-bold text-white">🎨 Harmony Modes</h2><p><code>random, monochromatic, analogous, complementary, triadic, tetradic, split, shades</code> — Classical color-wheel theory pe based hai.</p>

              <h2 className="text-lg font-bold text-white">♿ Vision Simulation</h2><p>Normal, protanopia, deuteranopia, tritanopia, achromatopsia — Machado 2009 matrices se color blindness check.</p>

              <h2 className="text-lg font-bold text-white">⌨️ Keyboard Shortcuts</h2><ul className="list-disc pl-5"><li><code>Space</code> — Generate new palette</li><li><code>⌘Z / Ctrl+Z</code> — Undo</li><li><code>⇧⌘Z / Ctrl+Shift+Z</code> — Redo</li><li><code>Enter</code> in AI box — Generate AI palette</li></ul>

              <h2 className="text-lg font-bold text-white">📦 Exports</h2><p>Tailwind, Tailwind v4, CSS Vars, PNG, SVG, JSON, ASE (Photoshop), Share Link with URL.</p>
            </article>
          )}
        </div> */} 
      </div>
      <section className="max-w-4xl mx-auto mt-16 px-4 pb-20 text-zinc-300">
  <article className="space-y-6">
    <h1 className="text-2xl font-bold text-white">Color Palette Generator - Free Online Tool</h1>
    <p>Palette Studio is a free online color palette generator inspired by Coolors...</p>
    
    <h2 className="text-lg font-bold text-white mt-6">What is Color Palette Generator?</h2>
    <h2 className="text-lg font-bold text-white">How to Generate Palettes with Spacebar?</h2>
    <h2 className="text-lg font-bold text-white">What is EyeDropper Tool?</h2>
    <h2 className="text-lg font-bold text-white">How to Extract Colors from Image?</h2>
    <h2 className="text-lg font-bold text-white">How to Generate Palette with AI Prompt?</h2>
    <h2 className="text-lg font-bold text-white">FAQ - Is it Free?</h2>
  </article>
</section>
      {toast && (<div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-orange-500 px-6 py-3 text-sm font-bold shadow-xl max-w-[90vw] truncate">{toast}</div>)}
    </div>
  )
}
