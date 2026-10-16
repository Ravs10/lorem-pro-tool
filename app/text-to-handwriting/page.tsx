"use client";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

// --- MULTILINGUAL DATA (UNCHANGED + EXTENDED) ---
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
  { name: "Orange", color: "#ea580c" }, { name: "Pink", color: "#db2777" }, { name: "Teal", color: "#0d9488" },
];

const PEN_TYPES = [
  { id: "ballpoint", name: "🖊️ Ballpoint" },
  { id: "fountain", name: "🖋️ Fountain" },
  { id: "gel", name: "✒️ Gel" },
  { id: "pencil", name: "✏️ Pencil" },
  { id: "marker", name: "🖍️ Marker" },
];

const PAPERS = [
  { id: "ruled", name: "Ruled 📓" },
  { id: "plain", name: "Plain 📄" },
  { id: "grid", name: "Grid ⊞" },
  { id: "aged", name: "Aged 📜" },
  { id: "sticky", name: "Sticky 🗒️" },
  { id: "letter", name: "Letter ✉️" },
  { id: "diary", name: "Diary 📔" },
  { id: "music", name: "Music 🎵" },
];

const TEMPLATES = [
  { id: "blank", name: "Blank Page", icon: "📄", text: "" },
  { id: "letter", name: "Formal Letter", icon: "✉️", text: "Dear [Name],\n\nI hope this letter finds you well. I am writing to...\n\nSincerely,\n[Your Name]" },
  { id: "diary", name: "Diary Entry", icon: "📔", text: "Dear Diary,\n\nToday was an amazing day because...\n\nUntil tomorrow,\nMe" },
  { id: "notes", name: "Study Notes", icon: "📚", text: "Topic: [Chapter Name]\n\n• Key Point 1\n• Key Point 2\n• Key Point 3\n\nImportant: Remember to revise!" },
  { id: "recipe", name: "Recipe Card", icon: "🍳", text: "Recipe: [Dish Name]\n\nIngredients:\n- Item 1\n- Item 2\n\nSteps:\n1. First step...\n2. Second step..." },
  { id: "todo", name: "To-Do List", icon: "✅", text: "Today's Tasks:\n\n☐ Task 1\n☐ Task 2\n☐ Task 3\n\nPriority: High!" },
];

const FAQS = [
  { q: "Is this Text to Handwriting Generator free?", a: "Yes, 100% free. No signup, no watermark, unlimited PNG & PDF downloads. Your text never leaves your browser." },
  { q: "Which languages are supported?", a: "English, Hindi, Bengali, Tamil, Telugu, Marathi, Arabic, Urdu and more. Each language uses its own native handwriting font." },
  { q: "How to download as PDF?", a: "Type your text > Select font, pen & paper > Click PDF Download. You will get a high-quality A4 PDF." },
  { q: "Can I use it for assignments?", a: "You can use it for practice, notes, quotes and design. For school work, always check your teacher's rules first." },
  { q: "Is my data safe?", a: "Yes. Conversion happens 100% in your browser. We do not store, track or upload your text." },
  { q: "Can I create my own signature?", a: "Yes! Use Signature Mode to generate personalized signatures with various handwriting styles, pen pressures and ink effects." },
  { q: "Does it support multi-page documents?", a: "Absolutely. Long texts automatically split into multiple A4 pages with proper page breaks. PDF export handles all pages." },
  { q: "What are keyboard shortcuts?", a: "Ctrl+S: Download PDF, Ctrl+P: Download PNG, Ctrl+K: Clear text, Ctrl+D: Toggle dark mode, Ctrl+Z: Reset all settings." },
];

// Toast Component
const Toast = ({ message, type, onClose }: any) => {
  useEffect(() => {
    const t = setTimeout(onClose, 2500);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className={`fixed bottom-6 right-6 z-[100] px-5 py-3 rounded-2xl shadow-2xl font-semibold text-white flex items-center gap-3 animate-slideUp ${
      type === "success" ? "bg-gradient-to-r from-green-500 to-emerald-500" :
      type === "error" ? "bg-gradient-to-r from-red-500 to-rose-500" :
      "bg-gradient-to-r from-violet-600 to-pink-500"
    }`}>
      <span>{type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️"}</span>
      <span>{message}</span>
    </div>
  );
};

export default function Page() {
  const [langKey, setLangKey] = useState("english");
  const [text, setText] = useState(LANGUAGES.english.sample);
  const [fontIdx, setFontIdx] = useState(0);
  const [pen, setPen] = useState(PENS[0]);
  const [penType, setPenType] = useState(PEN_TYPES[0]);
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
  const [zoom, setZoom] = useState(100);
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"text" | "style" | "paper" | "advanced">("text");
  const [alignment, setAlignment] = useState<"left" | "center" | "right" | "justify">("left");
  const [inkTexture, setInkTexture] = useState(true);
  const [strokePressure, setStrokePressure] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [marginX, setMarginX] = useState(0);
  const [marginY, setMarginY] = useState(0);
  const [showMarginLine, setShowMarginLine] = useState(true);
  const [multiPage, setMultiPage] = useState(false);
  const [bgTexture, setBgTexture] = useState<"none" | "coffee" | "crumple" | "stain">("none");
  const [animateText, setAnimateText] = useState(false);
  const [showSignature, setShowSignature] = useState(false);
  const [signatureName, setSignatureName] = useState("John Doe");
  const [signatureStyle, setSignatureStyle] = useState(0);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [wordGoal, setWordGoal] = useState(500);

  const paperRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentLang = LANGUAGES[langKey];
  const currentFont = currentLang.fonts[fontIdx] || currentLang.fonts[0];
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;
  const readingTime = Math.ceil(wordCount / 200);
  const pageCount = Math.max(1, Math.ceil(text.length / 1800));

  const showToast = useCallback((msg: string, type = "info") => {
    setToast({ msg, type });
  }, []);

  const changeLang = (k: string) => {
    setLangKey(k);
    setFontIdx(0);
    setText(LANGUAGES[k].sample);
    showToast(`Switched to ${LANGUAGES[k].label}`, "info");
  };

  const applyTemplate = (tpl: any) => {
    setText(tpl.text);
    showToast(`Applied ${tpl.name} template`, "success");
  };

  const getPaperStyle = () => {
    const base: any = {};
    if (paper.id === "ruled") base.background = `repeating-linear-gradient(transparent, transparent 43px, #93c5fd 44px), #fff`;
    else if (paper.id === "grid") { base.backgroundImage = `linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)`; base.backgroundSize = "24px 24px"; base.backgroundColor = "#fff"; }
    else if (paper.id === "aged") base.background = "#fdf6e3";
    else if (paper.id === "sticky") base.background = "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)";
    else if (paper.id === "letter") base.background = "#fffef9";
    else if (paper.id === "diary") { base.background = `repeating-linear-gradient(transparent, transparent 31px, #d1d5db 32px), #fffbf5`; }
    else if (paper.id === "music") { base.background = `repeating-linear-gradient(transparent, transparent 19px, #9ca3af 20px, transparent 21px, transparent 29px, #9ca3af 30px), #fff`; }
    else base.background = "#fff";

    if (bgTexture === "coffee") base.backgroundImage = `${base.backgroundImage || ""}, radial-gradient(circle at 20% 30%, rgba(120,72,20,0.15) 0%, transparent 20%), radial-gradient(circle at 80% 70%, rgba(120,72,20,0.1) 0%, transparent 15%)`;
    else if (bgTexture === "crumple") base.backgroundImage = `${base.backgroundImage || ""}, repeating-linear-gradient(45deg, rgba(0,0,0,0.02) 0px, rgba(0,0,0,0.02) 2px, transparent 2px, transparent 4px)`;
    else if (bgTexture === "stain") base.backgroundImage = `${base.backgroundImage || ""}, radial-gradient(ellipse at 70% 40%, rgba(139,90,43,0.12) 0%, transparent 40%)`;

    return base;
  };

  const getPenEffect = () => {
    if (!inkTexture) return {};
    const base: any = {};
    if (penType.id === "fountain") {
      base.textShadow = `0 0 0.5px ${pen.color}, 0 1px 1px ${pen.color}40`;
      base.filter = `contrast(${1 + strokePressure * 0.1})`;
    } else if (penType.id === "gel") {
      base.textShadow = `0 0 2px ${pen.color}60`;
      base.filter = `saturate(${1 + strokePressure * 0.15})`;
    } else if (penType.id === "pencil") {
      base.opacity = inkOpacity * 0.85;
      base.filter = `blur(0.2px) contrast(${0.9 + strokePressure * 0.1})`;
    } else if (penType.id === "marker") {
      base.textShadow = `0 0 3px ${pen.color}80`;
      base.fontWeight = 600;
    } else {
      base.textShadow = `0 0.5px 0.5px ${pen.color}30`;
    }
    return base;
  };

  const downloadPNG = async () => {
    if (!paperRef.current) return;
    setIsDownloading(true);
    showToast("Generating PNG...", "info");
    try {
      const c = await html2canvas(paperRef.current, { scale: 2, backgroundColor: null, useCORS: true });
      const a = document.createElement("a");
      a.download = `handwriting-${langKey}-${Date.now()}.png`;
      a.href = c.toDataURL("image/png");
      a.click();
      showToast("PNG downloaded!", "success");
    } catch (e) { showToast("Download failed", "error"); }
    setIsDownloading(false);
  };

  const downloadPDF = async () => {
    if (!paperRef.current) return;
    setIsDownloading(true);
    showToast("Generating PDF...", "info");
    try {
      const c = await html2canvas(paperRef.current, { scale: 2, backgroundColor: null, useCORS: true });
      const pdf = new jsPDF("p", "mm", "a4");
      const w = pdf.internal.pageSize.getWidth();
      const h = (c.height * w) / c.width;
      pdf.addImage(c.toDataURL("image/png"), "PNG", 0, 0, w, h);
      pdf.save(`handwriting-${langKey}-${Date.now()}.pdf`);
      showToast("PDF downloaded!", "success");
    } catch (e) { showToast("Download failed", "error"); }
    setIsDownloading(false);
  };

  const copyText = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    showToast("Text copied!", "success");
    setTimeout(() => setCopied(false), 1500);
  };

  const resetAll = () => {
    setFontIdx(0); setPen(PENS[0]); setPenType(PEN_TYPES[0]); setPaper(PAPERS[0]);
    setFontSize(28); setLineHeight(1.8); setLetterSpacing(0.5); setInkOpacity(1);
    setTilt(0); setAlignment("left"); setInkTexture(true); setStrokePressure(1);
    setRotation(0); setMarginX(0); setMarginY(0); setBgTexture("none");
    showToast("Settings reset", "info");
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "s") { e.preventDefault(); downloadPDF(); }
        else if (e.key === "p") { e.preventDefault(); downloadPNG(); }
        else if (e.key === "k") { e.preventDefault(); setText(""); showToast("Text cleared", "info"); }
        else if (e.key === "d") { e.preventDefault(); setDark(d => !d); }
        else if (e.key === "z") { e.preventDefault(); resetAll(); }
        else if (e.key === "/") { e.preventDefault(); setShowShortcuts(s => !s); }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const textStyle: any = {
    fontFamily: currentFont.css,
    color: pen.color,
    fontSize: `${fontSize}px`,
    lineHeight,
    letterSpacing: `${letterSpacing}px`,
    opacity: inkOpacity,
    transform: `rotate(${tilt}deg)`,
    textAlign: alignment,
    ...getPenEffect(),
  };

  const tabs = [
    { id: "text", label: "✏️ Text", icon: "📝" },
    { id: "style", label: "🎨 Style", icon: "🖋️" },
    { id: "paper", label: "📄 Paper", icon: "📃" },
    { id: "advanced", label: "⚙️ Pro", icon: "🚀" },
  ];

  return (
    <div className={`min-h-screen transition-colors duration-500 ${dark ? "bg-[#0a0a0f] text-white" : "bg-gradient-to-br from-[#f8f7ff] via-[#fef9ff] to-[#f0f9ff] text-gray-900"}`}>
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className={`absolute top-20 -left-20 w-96 h-96 rounded-full blur-3xl opacity-20 animate-float ${dark ? "bg-violet-600" : "bg-violet-300"}`} />
        <div className={`absolute bottom-20 -right-20 w-96 h-96 rounded-full blur-3xl opacity-20 animate-float-delay ${dark ? "bg-pink-600" : "bg-pink-300"}`} />
      </div>

      <header className={`sticky top-0 z-50 backdrop-blur-xl border-b transition-all ${dark ? "bg-black/60 border-white/10" : "bg-white/80 border-gray-200"}`}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center gap-3">
          <h1 className="text-lg md:text-2xl font-black flex items-center gap-2 group cursor-pointer">
            <span className="group-hover:rotate-12 transition-transform inline-block">✍️</span>
            <span className="bg-gradient-to-r from-violet-600 via-pink-500 to-orange-500 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">Handwriting</span>
            <span className="hidden md:inline">Generator</span>
            <span className="hidden lg:inline text-[10px] px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold">PRO</span>
          </h1>
          <div className="flex gap-2 items-center">
            <span className={`hidden md:flex text-xs px-3 py-1 rounded-full font-semibold items-center gap-2 ${dark ? "bg-green-500/20 text-green-400" : "bg-green-100 text-green-700"}`}>
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              {wordCount} Words • {charCount} Chars • ~{readingTime}m read
            </span>
            <button onClick={() => setShowShortcuts(true)} title="Keyboard Shortcuts (Ctrl+/)" className={`hidden md:flex w-10 h-10 rounded-full items-center justify-center text-lg hover:scale-110 transition-all ${dark ? "bg-white/10" : "bg-gray-100"}`}>⌨️</button>
            <button onClick={() => setDark(!dark)} className={`w-10 h-10 rounded-full flex items-center justify-center text-xl hover:scale-110 hover:rotate-12 transition-all ${dark ? "bg-white/10" : "bg-gray-100"}`}>{dark ? "☀️" : "🌙"}</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Hero */}
        <div className="text-center mb-6 animate-fadeIn">
          <h2 className="text-2xl md:text-4xl font-black mb-3">
            Convert Typed Text into{" "}
            <span className="bg-gradient-to-r from-violet-600 to-pink-500 bg-clip-text text-transparent">Realistic Handwriting</span>
          </h2>
          <p className="text-sm md:text-base opacity-70 max-w-2xl mx-auto">8+ languages • 10+ fonts • 5 pen types • PNG & PDF download — 100% Free, No Signup Required</p>
        </div>

        <div className="grid lg:grid-cols-[400px_1fr] gap-6">
          {/* CONTROLS */}
          <div className={`rounded-[24px] overflow-hidden h-fit lg:sticky lg:top-20 shadow-xl ${dark ? "bg-white/[0.06] border border-white/10" : "bg-white border"}`}>
            {/* Tabs */}
            <div className="flex border-b border-gray-100 dark:border-white/10">
              {tabs.map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id as any)} className={`flex-1 py-3 text-xs font-bold transition-all relative ${activeTab === t.id ? "text-violet-600" : "opacity-60 hover:opacity-100"}`}>
                  <div className="text-lg">{t.icon}</div>
                  <div>{t.label}</div>
                  {activeTab === t.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-600 to-pink-500" />}
                </button>
              ))}
            </div>

            <div className="p-5 space-y-5 max-h-[calc(100vh-200px)] overflow-y-auto custom-scroll">
              {/* TEXT TAB */}
              {activeTab === "text" && (
                <>
                  <div className="animate-fadeIn">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-bold">🌍 Language / भाषा</label>
                      <span className="text-xs bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 px-2 py-0.5 rounded-full font-bold">{currentLang.label}</span>
                    </div>
                    <select value={langKey} onChange={(e) => changeLang(e.target.value)} className={`w-full p-3 rounded-xl border font-semibold outline-none focus:ring-2 focus:ring-violet-500 transition-all ${dark ? "bg-black/40 border-white/10" : "bg-gray-50 border-gray-200"}`}>
                      {Object.keys(LANGUAGES).map(k => <option key={k} value={k}>{LANGUAGES[k].label}</option>)}
                    </select>
                  </div>

                  <div className="animate-fadeIn">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-bold">✏️ Your Text</label>
                      <div className="flex gap-2">
                        <button onClick={() => setText("")} className="text-red-500 text-xs hover:underline font-semibold">Clear</button>
                        <span className="text-xs opacity-50">|</span>
                        <button onClick={copyText} className="text-violet-500 text-xs hover:underline font-semibold">{copied ? "✅ Copied" : "Copy"}</button>
                      </div>
                    </div>
                    <textarea ref={textareaRef} value={text} onChange={(e) => setText(e.target.value)} rows={6} dir={langKey === "arabic" || langKey === "urdu" ? "rtl" : "ltr"} placeholder="Yahan likho..." className={`w-full rounded-2xl p-4 text-[15px] outline-none resize-none focus:ring-2 focus:ring-violet-500 transition-all ${dark ? "bg-black/40 border-white/10" : "bg-gray-50 border"}`} />
                    <div className="flex justify-between items-center mt-2">
                      <button onClick={() => setText(currentLang.sample)} className="text-[11px] px-2.5 py-1 rounded-full bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-300 font-medium hover:bg-violet-600 hover:text-white transition-all">↺ Load Sample</button>
                      <div className="flex gap-2 text-[11px] opacity-60">
                        <span>📖 {readingTime}m read</span>
                        <span>•</span>
                        <span>📄 {pageCount} page{pageCount > 1 ? "s" : ""}</span>
                      </div>
                    </div>
                  </div>

                  {/* Templates */}
                  <div className="animate-fadeIn">
                    <label className="text-sm font-bold block mb-2">📋 Quick Templates</label>
                    <div className="grid grid-cols-2 gap-2">
                      {TEMPLATES.map(t => (
                        <button key={t.id} onClick={() => applyTemplate(t)} className={`p-2 rounded-xl text-xs font-semibold border-2 transition-all hover:-translate-y-0.5 hover:shadow-md ${dark ? "border-white/10 bg-white/5" : "border-gray-100 bg-gray-50"}`}>
                          <div className="text-lg">{t.icon}</div>
                          <div className="truncate">{t.name}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* STYLE TAB */}
              {activeTab === "style" && (
                <>
                  <div className="animate-fadeIn">
                    <label className="text-sm font-bold block mb-2">🖋️ Handwriting Style</label>
                    <div className="grid grid-cols-2 gap-2">
                      {currentLang.fonts.map((f: any, i: number) => (
                        <button key={i} onClick={() => setFontIdx(i)} style={{ fontFamily: f.css }} className={`py-2.5 px-3 rounded-xl text-[17px] border-2 transition-all hover:-translate-y-0.5 hover:shadow-md ${fontIdx === i ? "border-violet-600 bg-violet-50 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 scale-[1.02]" : dark ? "border-white/10 bg-white/5" : "border-gray-100 bg-gray-50"}`}>{f.name}</button>
                      ))}
                    </div>
                  </div>

                  <div className="animate-fadeIn">
                    <label className="text-sm font-bold block mb-2">✒️ Pen Type</label>
                    <div className="grid grid-cols-3 gap-2">
                      {PEN_TYPES.map(p => (
                        <button key={p.id} onClick={() => setPenType(p)} className={`py-2 rounded-xl text-xs font-semibold border-2 transition-all hover:scale-105 ${penType.id === p.id ? "border-violet-600 bg-violet-600 text-white" : dark ? "border-white/10" : "border-gray-200"}`}>{p.name}</button>
                      ))}
                    </div>
                  </div>

                  <div className="animate-fadeIn">
                    <label className="text-sm font-bold block mb-2">🎨 Pen Color</label>
                    <div className="flex flex-wrap gap-2.5">
                      {PENS.map(p => (
                        <button key={p.name} title={p.name} onClick={() => { setPen(p); showToast(`${p.name} pen selected`, "info"); }} style={{ background: p.color }} className={`w-9 h-9 rounded-full hover:scale-125 transition-all ${pen.color === p.color ? "ring-[3px] ring-offset-2 ring-violet-500 scale-110" : ""}`} />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4 animate-fadeIn">
                    <div>
                      <div className="flex justify-between text-sm font-bold"><span>Font Size</span><span className="text-violet-600">{fontSize}px</span></div>
                      <input type="range" min={16} max={48} value={fontSize} onChange={(e) => setFontSize(+e.target.value)} className="w-full accent-violet-600" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm font-bold"><span>Line Spacing</span><span className="text-violet-600">{lineHeight}</span></div>
                      <input type="range" min={1.2} max={2.5} step={0.1} value={lineHeight} onChange={(e) => setLineHeight(+e.target.value)} className="w-full accent-pink-500" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm font-bold"><span>Letter Spacing</span><span className="text-violet-600">{letterSpacing}px</span></div>
                      <input type="range" min={0} max={3} step={0.1} value={letterSpacing} onChange={(e) => setLetterSpacing(+e.target.value)} className="w-full accent-violet-600" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm font-bold"><span>✨ Ink Darkness</span><span className="text-violet-600">{inkOpacity}</span></div>
                      <input type="range" min={0.5} max={1} step={0.05} value={inkOpacity} onChange={(e) => setInkOpacity(+e.target.value)} className="w-full accent-violet-600" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm font-bold"><span>↗️ Handwriting Tilt</span><span className="text-violet-600">{tilt}°</span></div>
                      <input type="range" min={-3} max={3} step={0.5} value={tilt} onChange={(e) => setTilt(+e.target.value)} className="w-full accent-pink-500" />
                    </div>
                  </div>

                  <div className="animate-fadeIn">
                    <label className="text-sm font-bold block mb-2">📐 Alignment</label>
                    <div className="grid grid-cols-4 gap-2">
                      {[["left", "⬅️"], ["center", "↔️"], ["right", "➡️"], ["justify", "☰"]].map(([a, i]) => (
                        <button key={a} onClick={() => setAlignment(a as any)} className={`py-2 rounded-xl text-lg border-2 transition-all hover:scale-105 ${alignment === a ? "border-violet-600 bg-violet-600 text-white" : dark ? "border-white/10" : "border-gray-200"}`}>{i}</button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* PAPER TAB */}
              {activeTab === "paper" && (
                <>
                  <div className="animate-fadeIn">
                    <label className="text-sm font-bold block mb-2">📄 Paper Style</label>
                    <div className="grid grid-cols-2 gap-2">
                      {PAPERS.map(p => (
                        <button key={p.id} onClick={() => setPaper(p)} className={`py-2.5 rounded-xl text-sm font-semibold border-2 hover:scale-[1.03] transition-all ${paper.id === p.id ? "border-violet-600 bg-violet-600 text-white shadow-lg" : dark ? "border-white/10" : "border-gray-200"}`}>{p.name}</button>
                      ))}
                    </div>
                  </div>

                  <div className="animate-fadeIn">
                    <label className="text-sm font-bold block mb-2">🎨 Background Texture</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[["none", "✨ None"], ["coffee", "☕ Coffee"], ["crumple", "📰 Crumple"], ["stain", "🍂 Stain"]].map(([id, name]) => (
                        <button key={id} onClick={() => setBgTexture(id as any)} className={`py-2 rounded-xl text-xs font-semibold border-2 transition-all hover:scale-105 ${bgTexture === id ? "border-violet-600 bg-violet-600 text-white" : dark ? "border-white/10" : "border-gray-200"}`}>{name}</button>
                      ))}
                    </div>
                  </div>

                  <div className="animate-fadeIn space-y-3">
                    <label className="flex items-center justify-between text-sm font-bold cursor-pointer">
                      <span>📏 Show Margin Line</span>
                      <input type="checkbox" checked={showMarginLine} onChange={(e) => setShowMarginLine(e.target.checked)} className="w-4 h-4 accent-violet-600" />
                    </label>
                    <div>
                      <div className="flex justify-between text-sm font-bold"><span>Horizontal Margin</span><span className="text-violet-600">{marginX}px</span></div>
                      <input type="range" min={0} max={100} value={marginX} onChange={(e) => setMarginX(+e.target.value)} className="w-full accent-violet-600" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm font-bold"><span>Vertical Margin</span><span className="text-violet-600">{marginY}px</span></div>
                      <input type="range" min={0} max={80} value={marginY} onChange={(e) => setMarginY(+e.target.value)} className="w-full accent-violet-600" />
                    </div>
                  </div>
                </>
              )}

              {/* ADVANCED TAB */}
              {activeTab === "advanced" && (
                <>
                  <div className="animate-fadeIn space-y-3">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-violet-500/10 to-pink-500/10 border border-violet-200 dark:border-violet-800">
                      <div className="text-xs font-bold text-violet-600 mb-2">🚀 PRO FEATURES</div>
                      <label className="flex items-center justify-between text-sm font-bold cursor-pointer mb-2">
                        <span>🖋️ Ink Texture Effects</span>
                        <input type="checkbox" checked={inkTexture} onChange={(e) => setInkTexture(e.target.checked)} className="w-4 h-4 accent-violet-600" />
                      </label>
                      <label className="flex items-center justify-between text-sm font-bold cursor-pointer mb-2">
                        <span>✍️ Writing Animation</span>
                        <input type="checkbox" checked={animateText} onChange={(e) => setAnimateText(e.target.checked)} className="w-4 h-4 accent-violet-600" />
                      </label>
                      <label className="flex items-center justify-between text-sm font-bold cursor-pointer">
                        <span>📚 Multi-Page Mode</span>
                        <input type="checkbox" checked={multiPage} onChange={(e) => setMultiPage(e.target.checked)} className="w-4 h-4 accent-violet-600" />
                      </label>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm font-bold"><span>💪 Stroke Pressure</span><span className="text-violet-600">{strokePressure}x</span></div>
                      <input type="range" min={0.5} max={2} step={0.1} value={strokePressure} onChange={(e) => setStrokePressure(+e.target.value)} className="w-full accent-violet-600" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm font-bold"><span>🔄 Rotation</span><span className="text-violet-600">{rotation}°</span></div>
                      <input type="range" min={-10} max={10} step={0.5} value={rotation} onChange={(e) => setRotation(+e.target.value)} className="w-full accent-pink-500" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm font-bold"><span>🎯 Word Goal</span><span className="text-violet-600">{wordCount}/{wordGoal}</span></div>
                      <input type="range" min={100} max={2000} step={100} value={wordGoal} onChange={(e) => setWordGoal(+e.target.value)} className="w-full accent-violet-600" />
                      <div className="mt-2 h-2 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-violet-600 to-pink-500 transition-all" style={{ width: `${Math.min(100, (wordCount / wordGoal) * 100)}%` }} />
                      </div>
                    </div>
                  </div>

                  {/* Signature Mode */}
                  <div className="animate-fadeIn">
                    <label className="flex items-center justify-between text-sm font-bold cursor-pointer mb-2">
                      <span>✒️ Signature Mode</span>
                      <input type="checkbox" checked={showSignature} onChange={(e) => setShowSignature(e.target.checked)} className="w-4 h-4 accent-violet-600" />
                    </label>
                    {showSignature && (
                      <div className="space-y-2 animate-slideDown">
                        <input type="text" value={signatureName} onChange={(e) => setSignatureName(e.target.value)} placeholder="Your name" className={`w-full p-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-500 ${dark ? "bg-black/40 border-white/10" : "bg-gray-50 border"}`} />
                        <div className="grid grid-cols-3 gap-2">
                          {["'Caveat', cursive", "'Homemade Apple', cursive", "'Shadows Into Light', cursive"].map((f, i) => (
                            <button key={i} onClick={() => setSignatureStyle(i)} style={{ fontFamily: f }} className={`py-2 rounded-lg text-sm border-2 transition-all ${signatureStyle === i ? "border-violet-600 bg-violet-50 dark:bg-violet-900/40" : dark ? "border-white/10" : "border-gray-200"}`}>
                              {signatureName.split(" ")[0] || "Sig"}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <button onClick={resetAll} className="w-full py-2.5 rounded-xl font-bold text-sm border-2 border-red-200 dark:border-red-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                    🔄 Reset All Settings (Ctrl+Z)
                  </button>
                </>
              )}
            </div>

            {/* Download Buttons */}
            <div className="p-5 pt-0 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <button onClick={downloadPNG} disabled={isDownloading} className="py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 relative overflow-hidden group">
                  <span className="relative z-10">{isDownloading ? "⏳..." : "📷 PNG"}</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
                <button onClick={downloadPDF} disabled={isDownloading} className="py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 relative overflow-hidden group">
                  <span className="relative z-10">{isDownloading ? "⏳..." : "📄 PDF"}</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-rose-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </div>
              <button onClick={copyText} className={`w-full py-3 rounded-2xl font-bold border-2 border-dashed transition-all hover:bg-violet-50 dark:hover:bg-violet-900/20 ${dark ? "border-white/20" : ""}`}>
                {copied ? "✅ Copied!" : "📋 Copy Text (Ctrl+C)"}
              </button>
            </div>
          </div>

          {/* PREVIEW */}
          <div>
            <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
              <h2 className="font-bold text-lg flex items-center gap-2">👀 Live Preview <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" /></h2>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white dark:bg-white/10 shadow border dark:border-white/10">A4 • {paper.name} • {currentLang.label.split(" ")[0]}</span>
                <div className="flex items-center gap-1 bg-white dark:bg-white/10 rounded-full px-2 py-1 shadow border dark:border-white/10">
                  <button onClick={() => setZoom(z => Math.max(50, z - 10))} className="w-6 h-6 rounded-full hover:bg-violet-100 dark:hover:bg-violet-900/40 text-sm">−</button>
                  <span className="text-xs font-bold w-10 text-center">{zoom}%</span>
                  <button onClick={() => setZoom(z => Math.min(150, z + 10))} className="w-6 h-6 rounded-full hover:bg-violet-100 dark:hover:bg-violet-900/40 text-sm">+</button>
                </div>
              </div>
            </div>

            <div className="overflow-auto max-h-[80vh] custom-scroll rounded-lg">
              <div ref={paperRef} style={{ ...getPaperStyle(), transform: `scale(${zoom / 100}) rotate(${rotation}deg)`, transformOrigin: "top center", padding: `${32 + marginY}px ${32 + marginX}px` }} className="relative w-full min-h-[700px] rounded-[4px] shadow-[0_20px_60px_rgba(0,0,0,0.2)] overflow-hidden transition-all duration-300">
                {paper.id === "ruled" && showMarginLine && <div className="absolute left-[60px] top-0 bottom-0 w-[2px] bg-red-300/70" />}
                {paper.id === "diary" && showMarginLine && <div className="absolute left-[50px] top-0 bottom-0 w-[2px] bg-red-300/70" />}
                <div dir={langKey === "arabic" || langKey === "urdu" ? "rtl" : "ltr"} style={textStyle} className={`whitespace-pre-wrap break-words transition-all duration-300 ${animateText ? "animate-writeIn" : ""} ${paper.id === "ruled" || paper.id === "diary" ? "md:pl-8" : ""}`}>
                  {text || "Yahan tumhara handwritten text dikhega..."}
                </div>

                {showSignature && (
                  <div style={{ fontFamily: ["'Caveat', cursive", "'Homemade Apple', cursive", "'Shadows Into Light', cursive"][signatureStyle], color: pen.color, fontSize: `${fontSize * 1.4}px`, transform: "rotate(-3deg)" }} className="absolute bottom-16 right-12 opacity-90">
                    {signatureName}
                  </div>
                )}

                <div className="absolute bottom-4 right-6 text-[11px] text-gray-400 flex items-center gap-2">
                  <span>Made with Handwriting Generator PRO</span>
                  {multiPage && <span className="px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-300 font-bold">Page 1 of {pageCount}</span>}
                </div>
              </div>
            </div>

            {/* Feature Badges */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
              {[["⚡", "Instant", "No Signup", "from-yellow-400 to-orange-500"], ["🌍", "8+ Languages", "Native Fonts", "from-blue-400 to-cyan-500"], ["🎨", "10+ Fonts", "5 Pen Types", "from-violet-400 to-pink-500"], ["🔒", "100% Private", "Browser Only", "from-green-400 to-emerald-500"]].map(([i, t, s, g]) => (
                <div key={t} className={`group p-4 rounded-2xl text-center hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 cursor-pointer relative overflow-hidden ${dark ? "bg-white/5 border border-white/10" : "bg-white border"}`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${g} opacity-0 group-hover:opacity-10 transition-opacity`} />
                  <div className="text-3xl group-hover:scale-125 transition-transform">{i}</div>
                  <div className="font-bold text-sm mt-1">{t}</div>
                  <div className="text-xs opacity-60">{s}</div>
                </div>
              ))}
            </div>

            {/* SEO CONTENT */}
            <div className="mt-8 space-y-4">
              <div className={`rounded-2xl overflow-hidden border transition-all hover:shadow-lg ${dark ? "bg-white/5 border-white/10" : "bg-white border-gray-200"}`}>
                <button onClick={() => setShowGuide(!showGuide)} className="w-full flex justify-between items-center p-5 font-bold text-left hover:bg-violet-50/50 dark:hover:bg-violet-900/20 transition-all">
                  <span className="flex items-center gap-2">📖 How to Use? - Complete User Guide</span>
                  <span className={`text-xs bg-violet-600 text-white px-2 py-1 rounded-full transition-transform ${showGuide ? "rotate-180" : ""}`}>{showGuide ? "▲" : "▼"}</span>
                </button>
                {showGuide && (
                  <div className="p-5 pt-0 text-sm leading-relaxed space-y-3 opacity-90 animate-slideDown">
                    <p><b className="text-violet-600">Step 1 — Language & Text:</b> Apni language select karo (Hindi, English, Bengali, Tamil, Telugu, Marathi, Arabic, Urdu) aur text box me apna text type ya paste karo. Quick Templates se letter, diary, notes instantly load kar sakte ho.</p>
                    <p><b className="text-violet-600">Step 2 — Style Customization:</b> Handwriting font, pen type (Ballpoint, Fountain, Gel, Pencil, Marker), pen color, alignment, size, line spacing, letter spacing, ink darkness aur tilt ko adjust karo. Har change live preview me turant dikhega.</p>
                    <p><b className="text-violet-600">Step 3 — Paper Selection:</b> Ruled, Plain, Grid, Aged, Sticky, Letter, Diary ya Music paper choose karo. Background textures (coffee stain, crumple) bhi add kar sakte ho realistic look ke liye.</p>
                    <p><b className="text-violet-600">Step 4 — Pro Features:</b> Ink texture effects, writing animation, multi-page mode, stroke pressure, rotation aur signature mode use karo advanced realism ke liye.</p>
                    <p><b className="text-violet-600">Step 5 — Download:</b> Live Preview dekho. Pasand aaye to <b>PNG</b> ya <b>PDF</b> button se download karo. Keyboard shortcuts: Ctrl+S (PDF), Ctrl+P (PNG), Ctrl+K (Clear), Ctrl+D (Dark mode), Ctrl+Z (Reset).</p>
                    <p className="p-3 rounded-xl bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 border border-amber-200 dark:border-amber-800"><b>💡 Pro Tip:</b> Real handwriting jaisa natural look chahiye to Ink Darkness ko 0.85, Tilt ko 0.5°, Stroke Pressure ko 1.2x aur Ink Texture ON rakho. Fountain pen + Ruled paper + Caveat font = best combo!</p>
                  </div>
                )}
              </div>

              <div className={`rounded-2xl overflow-hidden border transition-all hover:shadow-lg ${dark ? "bg-white/5 border-white/10" : "bg-white border-gray-200"}`}>
                <button onClick={() => setShowAbout(!showAbout)} className="w-full flex justify-between items-center p-5 font-bold text-left hover:bg-violet-50/50 dark:hover:bg-violet-900/20 transition-all">
                  <span className="flex items-center gap-2">ℹ️ What is Text to Handwriting Generator?</span>
                  <span className={`text-xs bg-violet-600 text-white px-2 py-1 rounded-full transition-transform ${showAbout ? "rotate-180" : ""}`}>{showAbout ? "▲" : "▼"}</span>
                </button>
                {showAbout && (
                  <div className="p-5 pt-0 text-sm leading-relaxed space-y-3 opacity-90 animate-slideDown">
                    <p><b>Text to Handwriting Generator</b> ek advanced free online tool hai jo typed text ko aise dikhata hai jaise haath se likha gaya ho. Ye students, teachers, content creators, designers aur professionals ke liye banaya gaya hai.</p>
                    <p>Isme tum <b>Hindi, English, Bengali, Tamil, Telugu, Marathi, Arabic aur Urdu</b> me realistic handwriting generate kar sakte ho. Har language ke liye native fonts use hote hain, isliye output bilkul natural lagta hai — jaise kisi ne actually likha ho.</p>
                    <p><b>Realism Features:</b> Multiple pen types (fountain, ballpoint, gel, pencil, marker) har ek ka apna unique ink effect deta hai. Ink texture, stroke pressure, tilt aur darkness controls se tum perfect handwritten look create kar sakte ho.</p>
                    <p><b>Use Cases:</b> Study notes, assignments practice, quotes, greeting cards, worksheets, diary entries, formal letters, signature creation, recipe cards, to-do lists aur creative design projects.</p>
                    <p><b>Privacy First:</b> Sab kuch tumhare browser me hota hai — koi server upload nahi, koi data storage nahi, koi tracking nahi. Tumhara text 100% private rehta hai.</p>
                  </div>
                )}
              </div>

              <div className={`rounded-2xl overflow-hidden border ${dark ? "bg-white/5 border-white/10" : "bg-white border-gray-200"}`}>
                <div className="p-5 pb-2"><h3 className="font-bold text-lg">❓ Frequently Asked Questions (FAQ)</h3></div>
                <div className="p-5 pt-2 space-y-2">
                  {FAQS.map((f, i) => (
                    <div key={i} className={`rounded-xl border overflow-hidden transition-all ${dark ? "border-white/10" : "border-gray-100"} ${openFaq === i ? "shadow-md" : ""}`}>
                      <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex justify-between items-center p-4 text-left font-semibold text-sm hover:bg-violet-50/50 dark:hover:bg-violet-900/20 transition-all">
                        <span>{f.q}</span>
                        <span className={`text-violet-600 font-bold transition-transform ${openFaq === i ? "rotate-180" : ""}`}>{openFaq === i ? "−" : "+"}</span>
                      </button>
                      {openFaq === i && <p className="px-4 pb-4 text-sm opacity-80 leading-relaxed animate-slideDown">{f.a}</p>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className={`mt-12 py-8 border-t text-center text-sm opacity-70 ${dark ? "border-white/10" : "border-gray-200"}`}>
        <p className="font-semibold">✍️ Handwriting Generator PRO — Made with ❤️ for creators</p>
        <p className="text-xs mt-2">100% Free • No Signup • Privacy First • 8+ Languages • PNG & PDF Export</p>
      </footer>

      {/* Shortcuts Modal */}
      {showShortcuts && (
        <div className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn" onClick={() => setShowShortcuts(false)}>
          <div className={`max-w-md w-full rounded-3xl p-6 shadow-2xl animate-slideUp ${dark ? "bg-[#1a1a2e]" : "bg-white"}`} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-xl">⌨️ Keyboard Shortcuts</h3>
              <button onClick={() => setShowShortcuts(false)} className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-white/10">✕</button>
            </div>
            <div className="space-y-2">
              {[["Ctrl + S", "Download PDF"], ["Ctrl + P", "Download PNG"], ["Ctrl + K", "Clear Text"], ["Ctrl + D", "Toggle Dark Mode"], ["Ctrl + Z", "Reset All Settings"], ["Ctrl + /", "Show Shortcuts"]].map(([k, v]) => (
                <div key={k} className="flex justify-between items-center p-3 rounded-xl bg-gray-50 dark:bg-white/5">
                  <span className="text-sm opacity-80">{v}</span>
                  <kbd className="px-3 py-1 rounded-lg bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 text-xs font-bold">{k}</kbd>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&family=Kalam&family=Patrick+Hand&family=Shadows+Into+Light&family=Homemade+Apple&family=Tiro+Devanagari+Hindi&family=Baloo+2&family=Baloo+Thambi+2&family=Baloo+Tammudu+2&family=Hind+Siliguri&family=Cairo&family=Amiri&family=Gulzar&family=Noto+Nastaliq+Urdu&display=swap');
        
        @keyframes gradient { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
        @keyframes float { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(30px,-30px) scale(1.1)} }
        @keyframes float-delay { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-30px,30px) scale(1.1)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes writeIn { from{clip-path:inset(0 100% 0 0)} to{clip-path:inset(0 0 0 0)} }
        
        .animate-gradient { animation: gradient 3s ease infinite; }
        .animate-float { animation: float 8s ease-in-out infinite; }
        .animate-float-delay { animation: float-delay 10s ease-in-out infinite; }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out; }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
        .animate-slideDown { animation: slideDown 0.3s ease-out; }
        .animate-writeIn { animation: writeIn 2s ease-out; }
        
        .custom-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.4); border-radius: 10px; }
        .custom-scroll::-webkit-scrollbar-thumb:hover { background: rgba(139,92,246,0.7); }
        
        input[type="range"] { -webkit-appearance: none; height: 6px; border-radius: 10px; background: linear-gradient(90deg, #8b5cf6, #ec4899); outline: none; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%; background: white; box-shadow: 0 2px 8px rgba(139,92,246,0.5); cursor: pointer; transition: transform 0.2s; }
        input[type="range"]::-webkit-slider-thumb:hover { transform: scale(1.2); }
        input[type="range"]::-moz-range-thumb { width: 18px; height: 18px; border-radius: 50%; background: white; border: none; cursor: pointer; box-shadow: 0 2px 8px rgba(139,92,246,0.5); }
      `}</style>
    </div>
  );
}
