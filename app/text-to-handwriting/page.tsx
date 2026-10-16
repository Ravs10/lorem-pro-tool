"use client";
import { useState, useRef, useEffect } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

// --- MULTILINGUAL DATA ---
const LANGUAGES: any = {
  english: { label: "English 🇺🇸", fonts: [
    { name: "Caveat", css: "'Caveat', cursive" },
    { name: "Patrick Hand", css: "'Patrick Hand', cursive" },
    { name: "Homemade Apple", css: "'Homemade Apple', cursive" },
    { name: "Shadows Into Light", css: "'Shadows Into Light', cursive" },
  ], sample: "Hello friends! This is my handwritten note.\nI made it in just one second." },
  hindi: { label: "Hindi 🇮🇳 हिन्दी", fonts: [
    { name: "Kalam", css: "'Kalam', cursive" },
    { name: "Tiro Devanagari Hindi", css: "'Tiro Devanagari Hindi', serif" },
    { name: "Baloo 2", css: "'Baloo 2', cursive" },
  ], sample: "नमस्ते दोस्तों! यह मेरी हस्तलिखित नोट है।\nमैंने इसे एक सेकंड में बनाया।" },
  bengali: { label: "Bengali বাংলা", fonts: [{ name: "Hind Siliguri", css: "'Hind Siliguri', sans-serif" }], sample: "হ্যালো বন্ধুরা! এটি আমার হাতে লেখা নোট।" },
  tamil: { label: "Tamil தமிழ்", fonts: [{ name: "Baloo Thambi 2", css: "'Baloo Thambi 2', cursive" }], sample: "வணக்கம் நண்பர்களே! இது என் கையெழுத்து குறிப்பு." },
  telugu: { label: "Telugu తెలుగు", fonts: [{ name: "Baloo Tammudu 2", css: "'Baloo Tammudu 2', cursive" }], sample: "హలో స్నేహితులారా! ఇది నా చేతివ్రాత నోట్." },
  arabic: { label: "Arabic العربية", fonts: [{ name: "Cairo", css: "'Cairo', sans-serif" }, { name: "Amiri", css: "'Amiri', serif" }], sample: "مرحبا أصدقائي! هذه ملاحظتي المكتوبة بخط اليد." },
  urdu: { label: "Urdu اردو", fonts: [{ name: "Gulzar", css: "'Gulzar', serif" }, { name: "Noto Nastaliq Urdu", css: "'Noto Nastaliq Urdu', serif" }], sample: "سلام دوستو! یہ میرا ہاتھ سے لکھا ہوا نوٹ ہے۔" },
  marathi: { label: "Marathi मराठी", fonts: [{ name: "Kalam", css: "'Kalam', cursive" }, { name: "Baloo 2", css: "'Baloo 2', cursive" }], sample: "नमस्कार मित्रांनो! ही माझी हस्तलिखित टीप आहे." },
};

const PENS = [
  { name: "Blue", color: "#1e40af" }, { name: "Black", color: "#111827" },
  { name: "Red", color: "#dc2626" }, { name: "Green", color: "#047857" }, { name: "Purple", color: "#7c3aed" },
];
const PAPERS = [{ id: "ruled", name: "Ruled 📓" }, { id: "plain", name: "Plain" }, { id: "grid", name: "Grid" }, { id: "aged", name: "Aged" }];

const FAQS = [
  { q: "Is this Text to Handwriting Generator free?", a: "Yes, 100% free. No signup, no watermark, unlimited PNG & PDF downloads. Your text never leaves your browser." },
  { q: "Which languages are supported?", a: "English, Hindi, Bengali, Tamil, Telugu, Marathi, Arabic, Urdu and more. Each language uses its own native handwriting font." },
  { q: "How to download as PDF?", a: "Type your text > Select font, pen & paper > Click PDF Download. You will get a high-quality A4 PDF." },
  { q: "Can I use it for assignments?", a: "You can use it for practice, notes, quotes and design. For school work, always check your teacher's rules first." },
  { q: "Is my data safe?", a: "Yes. Conversion happens 100% in your browser. We do not store, track or upload your text." },
];

export default function Page() {
  const [langKey, setLangKey] = useState("english");
  const [text, setText] = useState(LANGUAGES.english.sample);
  const [fontIdx, setFontIdx] = useState(0);
  const [pen, setPen] = useState(PENS[0]);
  const [paper, setPaper] = useState(PAPERS[0]);
  const [fontSize, setFontSize] = useState(28);
  const [lineHeight, setLineHeight] = useState(1.8);
  const [letterSpacing, setLetterSpacing] = useState(0.5);
  const [inkOpacity, setInkOpacity] = useState(1);
  const [tilt, setTilt] = useState(0);
  const [dark, setDark] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [showGuide, setShowGuide] = useState(true);
  const [showAbout, setShowAbout] = useState(false);
  const [copied, setCopied] = useState(false);
  const paperRef = useRef<HTMLDivElement>(null);

  const currentLang = LANGUAGES[langKey];
  const currentFont = currentLang.fonts[fontIdx] || currentLang.fonts[0];
  const wordCount = text.trim()? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;

  const changeLang = (k: string) => { setLangKey(k); setFontIdx(0); setText(LANGUAGES[k].sample); };

  const getPaperStyle = () => {
    if (paper.id === "ruled") return { background: `repeating-linear-gradient(transparent, transparent 43px, #93c5fd 44px), #fff` };
    if (paper.id === "grid") return { backgroundImage: `linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)`, backgroundSize: "24px 24px", backgroundColor: "#fff" };
    if (paper.id === "aged") return { background: "#fdf6e3" };
    return { background: "#fff" };
  };

  const downloadPNG = async () => { if (!paperRef.current) return; setIsDownloading(true); const c = await html2canvas(paperRef.current, { scale: 2 }); const a = document.createElement("a"); a.download = `handwriting-${langKey}.png`; a.href = c.toDataURL("image/png"); a.click(); setIsDownloading(false); };
  const downloadPDF = async () => { if (!paperRef.current) return; setIsDownloading(true); const c = await html2canvas(paperRef.current, { scale: 2 }); const pdf = new jsPDF("p", "mm", "a4"); const w = pdf.internal.pageSize.getWidth(); const h = (c.height * w) / c.width; pdf.addImage(c.toDataURL("image/png"), "PNG", 0, 0, w, h); pdf.save(`handwriting-${langKey}.pdf`); setIsDownloading(false); };
  const copyText = async () => { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${dark? "bg-[#0f0f1a] text-white" : "bg-[#f8f7ff] text-gray-900"}`}>
      <header className={`sticky top-0 z-50 backdrop-blur-xl border-b ${dark? "bg-black/60 border-white/10" : "bg-white/80 border-gray-200"}`}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl md:text-2xl font-black">✍️ <span className="bg-gradient-to-r from-violet-600 to-pink-500 bg-clip-text text-transparent">Handwriting</span> Generator</h1>
          <div className="flex gap-2 items-center">
            <span className="hidden md:block text-xs px-3 py-1 rounded-full bg-green-100 text-green-700 font-semibold">● {wordCount} Words • {charCount} Chars</span>
            <button onClick={() => setDark(!dark)} className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-xl hover:scale-110 hover:rotate-12 transition-all">{dark? "☀️" : "🌙"}</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <p className="text-center text-sm md:text-base opacity-70 max-w-2xl mx-auto mb-6">Convert typed text into realistic handwriting in <b>8+ languages</b>. Choose font, pen, paper & download as PNG or PDF — Free, No Signup.</p>

        <div className="grid lg:grid-cols-[380px_1fr] gap-6">
          {/* CONTROLS - ALL OLD FEATURES + NEW */}
          <div className={`rounded-[24px] p-5 space-y-6 h-fit lg:sticky lg:top-20 shadow-xl ${dark? "bg-white/[0.06] border border-white/10" : "bg-white border"}`}>
            <div>
              <div className="flex justify-between items-center mb-2"><label className="text-sm font-bold">🌍 Language / भाषा</label><span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-bold">{currentLang.label}</span></div>
              <select value={langKey} onChange={(e) => changeLang(e.target.value)} className={`w-full p-3 rounded-xl border font-semibold outline-none focus:ring-2 focus:ring-violet-500 ${dark? "bg-black/40 border-white/10" : "bg-gray-50 border-gray-200"}`}>
                {Object.keys(LANGUAGES).map(k => <option key={k} value={k}>{LANGUAGES[k].label}</option>)}
              </select>
            </div>

            <div>
              <label className="text-sm font-bold flex justify-between">✏️ Your Text <button onClick={() => setText("")} className="text-red-500 text-xs hover:underline">Clear</button></label>
              <textarea value={text} onChange={(e) => setText(e.target.value)} rows={5} dir={langKey === "arabic" || langKey === "urdu"? "rtl" : "ltr"} placeholder="Yahan likho..." className={`w-full rounded-2xl p-4 text-[15px] outline-none resize-none focus:ring-2 focus:ring-violet-500 mt-2 ${dark? "bg-black/40 border-white/10" : "bg-gray-50 border"}`} />
              <button onClick={() => setText(currentLang.sample)} className="text-[11px] mt-2 px-2.5 py-1 rounded-full bg-violet-50 text-violet-600 font-medium hover:bg-violet-600 hover:text-white transition-all">↺ Load Sample in {currentLang.label}</button>
            </div>

            <div><label className="text-sm font-bold">🖋️ Handwriting Style ({currentLang.label})</label>
              <div className="grid grid-cols-2 gap-2 mt-2">{currentLang.fonts.map((f: any, i: number) => (<button key={i} onClick={() => setFontIdx(i)} style={{ fontFamily: f.css }} className={`py-2.5 px-3 rounded-xl text-[17px] border-2 transition-all hover:-translate-y-0.5 hover:shadow-md ${fontIdx === i? "border-violet-600 bg-violet-50 text-violet-700 scale-[1.02]" : dark? "border-white/10 bg-white/5" : "border-gray-100 bg-gray-50"}`}>{f.name}</button>))}</div>
            </div>

            <div><label className="text-sm font-bold">🎨 Pen Color</label><div className="flex gap-2.5 mt-2">{PENS.map(p => <button key={p.name} title={p.name} onClick={() => setPen(p)} style={{ background: p.color }} className={`w-9 h-9 rounded-full hover:scale-125 transition-all ${pen.color === p.color? "ring-[3px] ring-offset-2 ring-violet-500 scale-110" : ""}`} />)}</div></div>

            <div><label className="text-sm font-bold">📄 Paper</label><div className="grid grid-cols-2 gap-2 mt-2">{PAPERS.map(p => <button key={p.id} onClick={() => setPaper(p)} className={`py-2 rounded-xl text-sm font-semibold border-2 hover:scale-[1.03] transition-all ${paper.id === p.id? "border-violet-600 bg-violet-600 text-white" : dark? "border-white/10" : "border-gray-200"}`}>{p.name}</button>)}</div></div>

            <div className="space-y-4">
              <div><div className="flex justify-between text-sm font-bold"><span>Font Size</span><span className="text-violet-600">{fontSize}px</span></div><input type="range" min={16} max={48} value={fontSize} onChange={(e) => setFontSize(+e.target.value)} className="w-full accent-violet-600" /></div>
              <div><div className="flex justify-between text-sm font-bold"><span>Line Spacing</span><span className="text-violet-600">{lineHeight}</span></div><input type="range" min={1.2} max={2.5} step={0.1} value={lineHeight} onChange={(e) => setLineHeight(+e.target.value)} className="w-full accent-pink-500" /></div>
              <div><div className="flex justify-between text-sm font-bold"><span>Letter Spacing</span><span className="text-violet-600">{letterSpacing}px</span></div><input type="range" min={0} max={3} step={0.1} value={letterSpacing} onChange={(e) => setLetterSpacing(+e.target.value)} className="w-full accent-violet-600" /></div>
              {/* NEW ADVANCE */}
              <div><div className="flex justify-between text-sm font-bold"><span>✨ Ink Darkness (Real Pen Effect)</span><span className="text-violet-600">{inkOpacity}</span></div><input type="range" min={0.5} max={1} step={0.05} value={inkOpacity} onChange={(e) => setInkOpacity(+e.target.value)} className="w-full accent-violet-600" /></div>
              <div><div className="flex justify-between text-sm font-bold"><span>↗️ Handwriting Tilt</span><span className="text-violet-600">{tilt}°</span></div><input type="range" min={-3} max={3} step={0.5} value={tilt} onChange={(e) => setTilt(+e.target.value)} className="w-full accent-pink-500" /></div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button onClick={downloadPNG} className="py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold shadow-lg hover:scale-[1.02] active:scale-95 transition-all">📷 PNG</button>
              <button onClick={downloadPDF} className="py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold shadow-lg hover:scale-[1.02] active:scale-95 transition-all">📄 PDF</button>
            </div>
            <button onClick={copyText} className="w-full py-3 rounded-2xl font-bold border-2 border-dashed hover:bg-violet-50 transition-all">{copied? "✅ Copied!" : "📋 Copy Text"}</button>
          </div>

          {/* PREVIEW */}
          <div>
            <div className="flex justify-between items-center mb-3"><h2 className="font-bold text-lg">👀 Live Preview</h2><span className="text-xs font-semibold px-3 py-1 rounded-full bg-white shadow border text-gray-700">A4 • {paper.name} • {currentLang.label}</span></div>
            <div ref={paperRef} style={getPaperStyle()} className="relative w-full min-h-[700px] rounded-[4px] shadow-[0_20px_60px_rgba(0,0,0,0.2)] p-8 md:p-12 overflow-hidden">
              {paper.id === "ruled" && <div className="absolute left-[60px] top-0 bottom-0 w-[2px] bg-red-300/70" />}
              <div dir={langKey === "arabic" || langKey === "urdu"? "rtl" : "ltr"} style={{ fontFamily: currentFont.css, color: pen.color, fontSize: `${fontSize}px`, lineHeight, letterSpacing: `${letterSpacing}px`, opacity: inkOpacity, transform: `rotate(${tilt}deg)` }} className="whitespace-pre-wrap break-words transition-all duration-300 md:pl-8">{text || "Yahan tumhara handwritten text dikhega..."}</div>
              <div className="absolute bottom-4 right-6 text-[11px] text-gray-400">Made with Handwriting Generator</div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
              {[["⚡", "Instant", "No Signup"], ["🌍", "8+ Languages", "Hindi + English + More"], ["🎨", "10+ Fonts", "5 Pen Colors"], ["🔒", "Private", "No Data Saved"]].map(([i, t, s]) => (<div key={t} className={`p-4 rounded-2xl text-center hover:-translate-y-1 hover:shadow-lg transition-all ${dark? "bg-white/5 border border-white/10" : "bg-white border"}`}><div className="text-2xl">{i}</div><div className="font-bold text-sm mt-1">{t}</div><div className="text-xs opacity-60">{s}</div></div>))}
            </div>

            {/* SEO CONTENT - HIDE / SHOW */}
            <div className="mt-8 space-y-4">
              {/* USER GUIDE */}
              <div className={`rounded-2xl overflow-hidden border ${dark? "bg-white/5 border-white/10" : "bg-white border-gray-200"}`}>
                <button onClick={() => setShowGuide(!showGuide)} className="w-full flex justify-between items-center p-5 font-bold text-left hover:bg-violet-50/50 transition-all"><span>📖 How to Use? - User Guide {showGuide? "▲" : "▼"}</span><span className="text-xs bg-violet-600 text-white px-2 py-1 rounded-full">{showGuide? "Hide" : "Show"}</span></button>
                {showGuide && (<div className="p-5 pt-0 text-sm leading-relaxed space-y-3 opacity-90">
                  <p><b>Step 1:</b> Apni language select karo (Hindi, English, Bengali, Tamil, etc.) aur text box me apna text type ya paste karo.</p>
                  <p><b>Step 2:</b> Handwriting font, pen color (Blue/Black/Red), paper (Ruled/Plain/Grid) aur size ko sliders se adjust karo.</p>
                  <p><b>Step 3:</b> Live Preview dekho. Pasand aaye to <b>PNG</b> ya <b>PDF</b> button se download karo. Ye bilkul free hai.</p>
                  <p><b>Pro Tip:</b> Real handwriting jaisa look chahiye to Ink Darkness ko 0.85 aur Tilt ko 0.5° rakho.</p>
                </div>)}
              </div>

              {/* ABOUT */}
              <div className={`rounded-2xl overflow-hidden border ${dark? "bg-white/5 border-white/10" : "bg-white border-gray-200"}`}>
                <button onClick={() => setShowAbout(!showAbout)} className="w-full flex justify-between items-center p-5 font-bold text-left hover:bg-violet-50/50 transition-all"><span>ℹ️ What is Text to Handwriting? {showAbout? "▲" : "▼"}</span><span className="text-xs bg-violet-600 text-white px-2 py-1 rounded-full">{showAbout? "Hide" : "Show"}</span></button>
                {showAbout && (<div className="p-5 pt-0 text-sm leading-relaxed space-y-3 opacity-90">
                  <p>Text to Handwriting ek free online tool hai jo typed text ko aise dikhata hai jaise haath se likha gaya ho. Ye students, teachers aur creators ke liye banaya gaya hai.</p>
                  <p>Isme tum <b>Hindi, English, Bengali, Tamil, Telugu, Marathi, Arabic aur Urdu</b> me handwriting generate kar sakte ho. Har language ke liye alag native font use hota hai, isliye output bilkul natural lagta hai.</p>
                  <p>Iska use notes, quotes, worksheets, greeting cards aur practice sheets banane ke liye hota hai. Sab kuch tumhare browser me hota hai, isliye tumhara data 100% private rehta hai.</p>
                </div>)}
              </div>

              {/* FAQ */}
              <div className={`rounded-2xl overflow-hidden border ${dark? "bg-white/5 border-white/10" : "bg-white border-gray-200"}`}>
                <div className="p-5 pb-2"><h3 className="font-bold text-lg">❓ Frequently Asked Questions (FAQ)</h3></div>
                <div className="p-5 pt-2 space-y-2">
                  {FAQS.map((f, i) => (
                    <div key={i} className={`rounded-xl border overflow-hidden ${dark? "border-white/10" : "border-gray-100"}`}>
                      <button onClick={() => setOpenFaq(openFaq === i? null : i)} className="w-full flex justify-between items-center p-4 text-left font-semibold text-sm hover:bg-violet-50/50 transition-all"><span>{f.q}</span><span>{openFaq === i? "−" : "+"}</span></button>
                      {openFaq === i && <p className="px-4 pb-4 text-sm opacity-80 leading-relaxed">{f.a}</p>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&family=Kalam&family=Patrick+Hand&family=Shadows+Into+Light&family=Homemade+Apple&family=Tiro+Devanagari+Hindi&family=Baloo+2&family=Baloo+Thambi+2&family=Baloo+Tammudu+2&family=Hind+Siliguri&family=Cairo&family=Amiri&family=Gulzar&family=Noto+Nastaliq+Urdu&display=swap');
      `}</style>
    </div>
  );
}
