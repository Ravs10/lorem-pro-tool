"use client";
import { useState, useRef, useEffect } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

const FONTS = [
  { name: "Caveat", label: "Caveat ✍️", css: "'Caveat', cursive" },
  { name: "Kalam", label: "Kalam", css: "'Kalam', cursive" },
  { name: "Patrick Hand", label: "Patrick Hand", css: "'Patrick Hand', cursive" },
  { name: "Shadows Into Light", label: "Shadows Into Light", css: "'Shadows Into Light', cursive" },
  { name: "Indie Flower", label: "Indie Flower", css: "'Indie Flower', cursive" },
  { name: "Homemade Apple", label: "Homemade Apple", css: "'Homemade Apple', cursive" },
  { name: "Reenie Beanie", label: "Reenie Beanie", css: "'Reenie Beanie', cursive" },
  { name: "Gochi Hand", label: "Gochi Hand", css: "'Gochi Hand', cursive" },
];

const PENS = [
  { name: "Blue Pen", color: "#1e40af" },
  { name: "Black Pen", color: "#111827" },
  { name: "Red Pen", color: "#dc2626" },
  { name: "Green Pen", color: "#047857" },
  { name: "Purple Pen", color: "#7c3aed" },
];

const PAPERS = [
  { id: "ruled", name: "Ruled 📓" },
  { id: "plain", name: "Plain White" },
  { id: "grid", name: "Grid" },
  { id: "aged", name: "Aged / Old" },
];

export default function TextToHandwriting() {
  const [text, setText] = useState("Hello Dosto! Ye mera handwritten assignment hai.\nText to Handwriting tool se maine isko 1 second me banaya.");
  const [font, setFont] = useState(FONTS[0]);
  const [pen, setPen] = useState(PENS[0]);
  const [paper, setPaper] = useState(PAPERS[0]);
  const [fontSize, setFontSize] = useState(28);
  const [lineHeight, setLineHeight] = useState(1.8);
  const [letterSpacing, setLetterSpacing] = useState(0.5);
  const [dark, setDark] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const paperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setWordCount(text.trim()? text.trim().split(/\s+/).length : 0);
  }, [text]);

  const getPaperStyle = () => {
    if (paper.id === "ruled") return { background: `repeating-linear-gradient(transparent, transparent 43px, #93c5fd 44px), #fff` };
    if (paper.id === "grid") return { backgroundImage: `linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)`, backgroundSize: "24px 24px", backgroundColor: "#fff" };
    if (paper.id === "aged") return { background: "#fdf6e3" };
    return { background: "#fff" };
  };

  const downloadPNG = async () => {
    if (!paperRef.current) return;
    setIsDownloading(true);
    const canvas = await html2canvas(paperRef.current, { scale: 2, backgroundColor: null });
    const link = document.createElement("a");
    link.download = "handwriting.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
    setIsDownloading(false);
  };

  const downloadPDF = async () => {
    if (!paperRef.current) return;
    setIsDownloading(true);
    const canvas = await html2canvas(paperRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("handwriting.pdf");
    setIsDownloading(false);
  };

  const sampleTexts = [
    "My name is Ravi and I love to learn new things every day.",
    "Dear Diary, Today was a wonderful day at school.",
    "Success is not final, failure is not fatal.",
  ];

  return (
    <div className={`min-h-screen transition-colors duration-500 ${dark? "bg-[#0f0f1a] text-white" : "bg-[#f8f7ff] text-gray-900"}`}>
      {/* HEADER */}
      <header className={`sticky top-0 z-50 backdrop-blur-xl border-b ${dark? "bg-black/60 border-white/10" : "bg-white/80 border-gray-200"}`}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl md:text-2xl font-black tracking-tight">✍️ <span className="bg-gradient-to-r from-violet-600 to-pink-500 bg-clip-text text-transparent">Handwriting</span> Generator</h1>
          <div className="flex gap-2 items-center">
            <span className="hidden md:block text-xs px-3 py-1 rounded-full bg-green-100 text-green-700 font-semibold">● {wordCount} Words</span>
            <button onClick={() => setDark(!dark)} className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-xl hover:scale-110 hover:rotate-12 transition-all duration-300">
              {dark? "☀️" : "🌙"}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 grid lg:grid-cols-[380px_1fr] gap-6">
        {/* CONTROLS */}
        <div className={`rounded-[24px] p-5 space-y-6 h-fit lg:sticky lg:top-20 shadow-xl ${dark? "bg-white/[0.06] border border-white/10" : "bg-white border border-gray-100"}`}>
          <div>
            <label className="text-sm font-bold mb-2 flex justify-between">✏️ Your Text <button onClick={() => setText("")} className="text-red-500 text-xs hover:underline">Clear</button></label>
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={6} placeholder="Yahan apna text likho..." className={`w-full rounded-2xl p-4 text-[15px] outline-none resize-none focus:ring-2 focus:ring-violet-500 transition-all ${dark? "bg-black/40 border-white/10" : "bg-gray-50 border-gray-200"}`} />
            <div className="flex gap-2 mt-2 flex-wrap">
              {sampleTexts.map((s, i) => (
                <button key={i} onClick={() => setText(s)} className="text-[11px] px-2.5 py-1 rounded-full bg-violet-50 text-violet-600 font-medium hover:bg-violet-600 hover:text-white transition-all">Sample {i + 1}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-bold">🖋️ Handwriting Style</label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {FONTS.map((f) => (
                <button key={f.name} onClick={() => setFont(f)} style={{ fontFamily: f.css }} className={`py-2.5 px-3 rounded-xl text-[17px] border-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${font.name === f.name? "border-violet-600 bg-violet-50 text-violet-700 scale-[1.02]" : dark? "border-white/10 bg-white/5" : "border-gray-100 bg-gray-50"}`}>{f.label}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-bold">🎨 Pen Color</label>
            <div className="flex gap-2.5 mt-2">
              {PENS.map((p) => (
                <button key={p.name} title={p.name} onClick={() => setPen(p)} style={{ background: p.color }} className={`w-9 h-9 rounded-full transition-all hover:scale-125 ${pen.color === p.color? "ring-[3px] ring-offset-2 ring-violet-500 scale-110" : ""}`} />
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-bold">📄 Paper Type</label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {PAPERS.map((p) => (
                <button key={p.id} onClick={() => setPaper(p)} className={`py-2 rounded-xl text-sm font-semibold border-2 transition-all hover:scale-[1.03] ${paper.id === p.id? "border-violet-600 bg-violet-600 text-white" : dark? "border-white/10" : "border-gray-200"}`}>{p.name}</button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm font-bold"><span>Font Size</span><span className="text-violet-600">{fontSize}px</span></div>
              <input type="range" min={16} max={48} value={fontSize} onChange={(e) => setFontSize(+e.target.value)} className="w-full accent-violet-600 cursor-pointer" />
            </div>
            <div>
              <div className="flex justify-between text-sm font-bold"><span>Line Spacing</span><span className="text-violet-600">{lineHeight}</span></div>
              <input type="range" min={1.2} max={2.5} step={0.1} value={lineHeight} onChange={(e) => setLineHeight(+e.target.value)} className="w-full accent-pink-500 cursor-pointer" />
            </div>
            <div>
              <div className="flex justify-between text-sm font-bold"><span>Letter Spacing</span><span className="text-violet-600">{letterSpacing}px</span></div>
              <input type="range" min={0} max={3} step={0.1} value={letterSpacing} onChange={(e) => setLetterSpacing(+e.target.value)} className="w-full accent-violet-600 cursor-pointer" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button onClick={downloadPNG} disabled={isDownloading} className="py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold shadow-lg shadow-violet-500/30 hover:scale-[1.02] hover:shadow-xl active:scale-95 transition-all">📷 PNG Download</button>
            <button onClick={downloadPDF} disabled={isDownloading} className="py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold shadow-lg shadow-pink-500/30 hover:scale-[1.02] hover:shadow-xl active:scale-95 transition-all">📄 PDF Download</button>
          </div>
          <button onClick={() => navigator.clipboard.writeText(text)} className={`w-full py-3 rounded-2xl font-bold border-2 border-dashed transition-all hover:bg-violet-50 ${dark? "border-white/20" : "border-gray-300"}`}>📋 Copy Text</button>
        </div>

        {/* PREVIEW */}
        <div>
          <div className="flex justify-between items-center mb-3 px-1">
            <h2 className="font-bold text-lg">👀 Live Preview</h2>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white shadow border">A4 Page • {paper.name}</span>
          </div>
          <div ref={paperRef} style={getPaperStyle()} className="relative w-full min-h-[700px] rounded-[4px] shadow-[0_20px_60px_rgba(0,0,0,0.2)] p-8 md:p-12 overflow-hidden animate-[fadeIn_0.5s_ease]">
            {/* Red Margin Line for Ruled */}
            {paper.id === "ruled" && <div className="absolute left-[60px] top-0 bottom-0 w-[2px] bg-red-300/70" />}
            <div style={{ fontFamily: font.css, color: pen.color, fontSize: `${fontSize}px`, lineHeight: lineHeight, letterSpacing: `${letterSpacing}px` }} className="whitespace-pre-wrap break-words transition-all duration-300 pl-0 md:pl-8">
              {text || "Yahan tumhara handwritten text dikhega..."}
            </div>
            <div className="absolute bottom-4 right-6 text-[11px] text-gray-400">Made with Handwriting Generator</div>
          </div>

          {/* FEATURES */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            {[
              ["⚡", "Instant", "No Signup"],
              ["📱", "100% Responsive", "Mobile + PC"],
              ["🎨", "8 Fonts", "5 Pen Colors"],
              ["🔒", "Private", "No Data Saved"],
            ].map(([icon, t, s]) => (
              <div key={t} className={`p-4 rounded-2xl text-center hover:-translate-y-1 hover:shadow-lg transition-all duration-300 ${dark? "bg-white/5 border border-white/10" : "bg-white border"}`}>
                <div className="text-2xl">{icon}</div>
                <div className="font-bold text-sm mt-1">{t}</div>
                <div className="text-xs opacity-60">{s}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&family=Kalam&family=Patrick+Hand&family=Shadows+Into+Light&family=Indie+Flower&family=Homemade+Apple&family=Reenie+Beanie&family=Gochi+Hand&display=swap');
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
