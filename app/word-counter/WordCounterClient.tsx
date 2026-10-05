"use client";
import { useState, useMemo, useRef, useEffect, useCallback } from "react";

type ErrorItem = { message: string; offset: number; length: number; replacement: string; };

const LANGUAGES = [
  { code: "en-US", label: "English", flag: "🇺🇸" },
  { code: "hi-IN", label: "Hindi", flag: "🇮🇳" },
  { code: "es", label: "Spanish", flag: "🇪🇸" },
  { code: "fr", label: "French", flag: "🇫🇷" },
  { code: "de", label: "German", flag: "🇩🇪" },
];

const SAMPLE = `Word Counter is a powerful tool that counts words, characters, sentences, and paragraphs in real-time. It helps writers, students, and SEO professionals track their content length and readability. Try pasting your text here to see live statistics!`;

export default function WordCounterClient() {
  const [text, setText] = useState("");
  const [errors, setErrors] = useState<ErrorItem[]>([]);
  const [checking, setChecking] = useState(false);
  const [font, setFont] = useState("Inter");
  const [color, setColor] = useState("#111827");
  const [showArticle, setShowArticle] = useState<string | null>(null);
  const [goal, setGoal] = useState(1000);
  const [isFocus, setIsFocus] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedStats, setCopiedStats] = useState(false);
  const [lang, setLang] = useState("en-US");
  const [autoLang, setAutoLang] = useState("Auto Detect: -");
  const [showHighlight, setShowHighlight] = useState(true);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [showFind, setShowFind] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const grammarAbortRef = useRef<AbortController | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load
  useEffect(() => {
    const saved = localStorage.getItem("lorem_word_text");
    if (saved) {
      setText(saved);
      if (editorRef.current) editorRef.current.innerText = saved;
    }
    const g = localStorage.getItem("lorem_goal");
    if (g) setGoal(parseInt(g) || 1000);
    const d = localStorage.getItem("lorem_dark");
    if (d === "1") setIsDark(true);
  }, []);

  // Debounced save (fixes race condition)
  useEffect(() => {
    setSaveStatus("saving");
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem("lorem_word_text", text);
        localStorage.setItem("lorem_goal", goal.toString());
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 1200);
      } catch {}
    }, 400);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [text, goal]);

  useEffect(() => { localStorage.setItem("lorem_dark", isDark ? "1" : "0"); }, [isDark]);

  // Auto language
  useEffect(() => {
    if (!text.trim()) { setAutoLang("Auto Detect: -"); return; }
    const hasHindi = /[\u0900-\u097F]/.test(text);
    const hasLatin = /[a-zA-Z]/.test(text);
    setAutoLang(hasHindi && !hasLatin ? "Auto Detect: Hindi 🇮🇳" : hasHindi ? "Auto Detect: Mixed 🌐" : "Auto Detect: English 🇺🇸");
  }, [text]);

  const stats = useMemo(() => {
    const trimmed = text.trim();
    const words = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
    const chars = text.length;
    const charsNoSpace = text.replace(/\s/g, "").length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length || 0;
    const paras = text.split(/\n+/).filter(p => p.trim().length > 0).length;
    const lines = text ? text.split(/\n/).length : 0;
    const readingTime = Math.ceil(words / 200);
    const speakingTime = Math.ceil(words / 130);
    const avgWPS = words / (sentences || 1);
    const syllables = text.toLowerCase().split(/\s+/).reduce((a, w) => a + Math.max(1, (w.match(/[aeiouy]+/g) || []).length), 0);
    const flesch = words > 0 ? Math.max(0, Math.min(100, Math.round(206.835 - 1.015 * avgWPS - 84.6 * (syllables / words)))) : 0;

    let level = "—";
    if (words > 0) {
      if (flesch >= 80) level = "Easy 🟢";
      else if (flesch >= 60) level = "Standard 🟡";
      else if (flesch >= 40) level = "Hard 🟠";
      else level = "Very Hard 🔴";
    }

    const freq: Record<string, number> = {};
    if (words > 0) trimmed.toLowerCase().split(/\s+/).forEach(w => {
      const c = w.replace(/[^a-z0-9\u0900-\u097F]/g, "");
      if (c.length > 2) freq[c] = (freq[c] || 0) + 1;
    });
    const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
    const top10 = sorted.slice(0, 10);
    const density = top10.map(([k, v]) => [k, ((v / words) * 100).toFixed(2)] as [string, string]);
    return { words, chars, charsNoSpace, sentences, paras, lines, readingTime, speakingTime, flesch, level, top10, density };
  }, [text]);

  const progress = goal > 0 ? Math.min(100, Math.round((stats.words / goal) * 100)) : 0;
  const socialLimits = [
    { name: "Twitter", limit: 280, left: 280 - stats.chars },
    { name: "Instagram", limit: 2200, left: 2200 - stats.chars },
    { name: "LinkedIn", limit: 3000, left: 3000 - stats.chars },
  ];

  const escapeHtml = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
     .replace(/"/g, "&quot;").replace(/'/g, "&#39;");

  const applyHighlights = useCallback((errs: ErrorItem[], txt: string) => {
    if (!editorRef.current) return;
    if (!txt) { editorRef.current.innerHTML = ""; return; }
    let html = escapeHtml(txt);
    [...errs].sort((a, b) => b.offset - a.offset).forEach(err => {
      const before = html.substring(0, err.offset);
      const eT = html.substring(err.offset, err.offset + err.length);
      const after = html.substring(err.offset + err.length);
      html = `${before}<span style="text-decoration: underline wavy red 2.5px; text-underline-offset:4px; background: rgba(255,0,0,0.08);" title="${escapeHtml(err.message)} → ${escapeHtml(err.replacement)}">${eT}</span>${after}`;
    });
    editorRef.current.innerHTML = html;
  }, []);

  const checkGrammar = useCallback(async () => {
    if (!text.trim() || text.length < 5) return;
    if (grammarAbortRef.current) grammarAbortRef.current.abort();
    const ctrl = new AbortController();
    grammarAbortRef.current = ctrl;
    setChecking(true);
    try {
      const res = await fetch("https://api.languagetool.org/v2/check", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `text=${encodeURIComponent(text)}&language=${lang}`,
        signal: ctrl.signal,
      });
      const data = await res.json();
      const errs = (data.matches || []).slice(0, 15).map((m: any) => ({
        message: m.message,
        offset: m.offset,
        length: m.length,
        replacement: m.replacements?.[0]?.value || "",
      }));
      setErrors(errs);
      if (showHighlight) applyHighlights(errs, text);
    } catch (e: any) {
      if (e?.name !== "AbortError") {/* silent */}
    } finally {
      setChecking(false);
    }
  }, [text, lang, showHighlight, applyHighlights]);

  // Grammar debounce with cleanup
  useEffect(() => {
    if (text.length < 15) return;
    const t = setTimeout(() => { checkGrammar(); }, 1500);
    return () => clearTimeout(t);
  }, [text, lang]);

  const handleInput = () => {
    if (editorRef.current) setText(editorRef.current.innerText || "");
  };

  const applyFormat = (cmd: string, val?: string) => {
    editorRef.current?.focus();
    document.execCommand("styleWithCSS", false, "true");
    document.execCommand(cmd, false, val);
    if (editorRef.current) setText(editorRef.current.innerText || "");
  };

  const handleCopy = async () => {
    try {
      const sel = window.getSelection();
      const selected = sel && sel.toString().length > 0;
      if (selected) {
        await navigator.clipboard.writeText(sel.toString());
      } else {
        await navigator.clipboard.writeText(text);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* fallback */ }
  };

  const handleCut = async () => {
    const sel = window.getSelection();
    if (sel && sel.toString().length > 0) {
      await navigator.clipboard.writeText(sel.toString());
      sel.deleteFromDocument();
      if (editorRef.current) setText(editorRef.current.innerText || "");
    }
  };

  const handlePaste = async () => {
    editorRef.current?.focus();
    try {
      const t = await navigator.clipboard.readText();
      document.execCommand("insertText", false, t);
    } catch { document.execCommand("paste"); }
    if (editorRef.current) setText(editorRef.current.innerText || "");
  };

  const handleDelete = () => {
    editorRef.current?.focus();
    document.execCommand("delete");
    if (editorRef.current) setText(editorRef.current.innerText || "");
  };

  const handleClear = () => {
    if (!text) return;
    if (!confirm("Clear all text?")) return;
    if (editorRef.current) editorRef.current.innerText = "";
    setText(""); setErrors([]);
  };

  const handleCopyStats = async () => {
    const s = `Words: ${stats.words} | Chars(with): ${stats.chars} | Chars(without): ${stats.charsNoSpace} | Sentences: ${stats.sentences} | Paragraphs: ${stats.paras} | Lines: ${stats.lines} | Reading: ${stats.readingTime}m | Speaking: ${stats.speakingTime}m | Flesch: ${stats.flesch} (${stats.level})`;
    try { await navigator.clipboard.writeText(s); setCopiedStats(true); setTimeout(() => setCopiedStats(false), 1500); } catch {}
  };

  const exportTxt = () => { const b = new Blob([text], { type: "text/plain" }); const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = "doc.txt"; a.click(); URL.revokeObjectURL(a.href); };
  const exportDoc = () => { const b = new Blob([`<html><body>${editorRef.current?.innerHTML || text}</body></html>`], { type: "application/msword" }); const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = "doc.doc"; a.click(); URL.revokeObjectURL(a.href); };
  const exportPdf = () => { const w = window.open("", "_blank"); if (w) { w.document.write(`<pre style="white-space:pre-wrap;font-family:${font};padding:24px">${escapeHtml(text)}</pre>`); w.document.close(); w.print(); } };
  const exportCsv = () => {
    const rows = [
      ["Metric", "Value"],
      ["Words", stats.words], ["Chars (with)", stats.chars], ["Chars (without)", stats.charsNoSpace],
      ["Sentences", stats.sentences], ["Paragraphs", stats.paras], ["Lines", stats.lines],
      ["Reading Time (min)", stats.readingTime], ["Speaking Time (min)", stats.speakingTime],
      ["Flesch Score", stats.flesch], ["Level", stats.level],
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const b = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = "stats.csv"; a.click(); URL.revokeObjectURL(a.href);
  };

  // Voice
  const toggleVoice = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert("❌ Voice typing sirf Chrome/Edge me. HTTPS zaroori hai."); return; }
    if (isListening && recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
      setIsListening(false); return;
    }
    try {
      const rec = new SR();
      recognitionRef.current = rec;
      rec.lang = lang; rec.continuous = false; rec.interimResults = false; rec.maxAlternatives = 1;
      rec.onstart = () => setIsListening(true);
      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (editorRef.current) {
          editorRef.current.focus();
          const sel = window.getSelection();
          if (sel && sel.rangeCount) {
            const r = sel.getRangeAt(0);
            r.deleteContents();
            const node = document.createTextNode(" " + transcript);
            r.insertNode(node);
            r.setStartAfter(node); r.collapse(true);
            sel.removeAllRanges(); sel.addRange(r);
          } else {
            document.execCommand("insertText", false, " " + transcript);
          }
          setText(editorRef.current.innerText || "");
        }
      };
      rec.onerror = (e: any) => {
        setIsListening(false);
        if (e.error === "not-allowed") alert("Mic permission block hai. Lock icon > Mic Allow.");
      };
      rec.onend = () => setIsListening(false);
      rec.start();
    } catch (err: any) {
      alert("Voice error: " + err.message);
      setIsListening(false);
    }
  };

  const toggleSpeak = () => {
    if (isSpeaking) { speechSynthesis.cancel(); setIsSpeaking(false); return; }
    if (!text.trim()) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.onstart = () => setIsSpeaking(true);
    u.onend = () => setIsSpeaking(false);
    u.onerror = () => setIsSpeaking(false);
    speechSynthesis.speak(u);
  };

  const share = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: "Doc", text: text.slice(0, 200) }); } catch {}
    } else {
      await navigator.clipboard.writeText(text); alert("Copied!");
    }
  };

  const fixError = (err: ErrorItem) => {
    const nt = text.substring(0, err.offset) + err.replacement + text.substring(err.offset + err.length);
    setText(nt);
    if (editorRef.current) editorRef.current.innerText = nt;
    setErrors(p => p.filter(e => e !== err));
  };

  const fixAll = () => {
    let nt = text;
    [...errors].sort((a, b) => b.offset - a.offset).forEach(err => {
      nt = nt.substring(0, err.offset) + err.replacement + nt.substring(err.offset + err.length);
    });
    setText(nt);
    if (editorRef.current) editorRef.current.innerText = nt;
    setErrors([]);
  };

  const changeCase = (mode: "upper" | "lower" | "title" | "sentence") => {
    if (!text) return;
    let out = text;
    if (mode === "upper") out = text.toUpperCase();
    else if (mode === "lower") out = text.toLowerCase();
    else if (mode === "title") out = text.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.substr(1).toLowerCase());
    else if (mode === "sentence") out = text.toLowerCase().replace(/(^\s*\w|[.!?]\s+\w)/g, c => c.toUpperCase());
    setText(out);
    if (editorRef.current) editorRef.current.innerText = out;
  };

  const doReplace = () => {
    if (!findText) return;
    const out = text.split(findText).join(replaceText);
    setText(out);
    if (editorRef.current) editorRef.current.innerText = out;
  };

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      if (ctrl && e.key.toLowerCase() === "b") { e.preventDefault(); applyFormat("bold"); }
      else if (ctrl && e.key.toLowerCase() === "i") { e.preventDefault(); applyFormat("italic"); }
      else if (ctrl && e.key.toLowerCase() === "u") { e.preventDefault(); applyFormat("underline"); }
      else if (ctrl && e.key.toLowerCase() === "f") { e.preventDefault(); setShowFind(v => !v); }
      else if (ctrl && e.key.toLowerCase() === "s") { e.preventDefault(); localStorage.setItem("lorem_word_text", text); setSaveStatus("saved"); setTimeout(() => setSaveStatus("idle"), 1000); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [text]);

  const loadSample = () => {
    setText(SAMPLE);
    if (editorRef.current) editorRef.current.innerText = SAMPLE;
  };

  if (isFocus) {
    return (
      <div className={`min-h-screen ${isDark ? "bg-black text-white" : "bg-white text-black"} p-8`}>
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between mb-6">
            <button onClick={() => setIsFocus(false)} className="px-4 py-2 bg-black text-white rounded-xl text-sm dark:bg-white dark:text-black">Exit Focus</button>
            <span className="text-sm opacity-60">{stats.words} words • {autoLang}</span>
          </div>
          <div ref={editorRef} contentEditable suppressContentEditableWarning onInput={handleInput}
            className="w-full min-h-[80vh] outline-none text-xl leading-relaxed"
            style={{ fontFamily: font, color: isDark ? "#fff" : color }} />
        </div>
      </div>
    );
  }

  return (
    <div className={`${isDark ? "bg-[#0a0a0a] text-white" : "bg-gradient-to-br from-[#f8fafc] via-[#eef2ff] to-[#f5f3ff] text-gray-900"} min-h-screen`}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
        .glass{backdrop-filter:blur(16px);background:${isDark ? "rgba(30,30,30,0.7)" : "rgba(255,255,255,0.75)"};border:1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.6)"}}
        [contenteditable]:focus{outline:none}`}</style>

      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <div className="text-center mb-6">
          <div className="inline-flex px-3 py-1 rounded-full bg-black text-white text-[11px] tracking-widest mb-3">✨ VOICE FIXED + UNDO + FIND + CASE</div>
          <h1 className="text-4xl md:text-5xl font-black">Word Counter</h1>
          <div className="flex justify-center gap-2 mt-3 flex-wrap items-center">
            <select value={lang} onChange={e => setLang(e.target.value)} className="h-9 rounded-xl border px-3 text-sm bg-white text-black font-bold shadow">
              {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.flag} {l.label}</option>)}
            </select>
            <span className="text-xs px-3 py-1 rounded-full bg-violet-600 text-white font-bold">{autoLang}</span>
            <span className="text-sm opacity-60">{stats.words}/{goal} Real-time</span>
            <span className={`text-xs px-2 py-1 rounded-full ${saveStatus === "saved" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
              {saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "Saved ✓" : "Auto"}
            </span>
          </div>
          <div className="flex justify-center items-center gap-3 mt-3">
            <div className="max-w-md w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
              <div style={{ width: `${progress}%` }} className={`h-full transition-all ${progress >= 100 ? "bg-green-500" : "bg-gradient-to-r from-violet-600 to-indigo-600"}`} />
            </div>
            <span className="text-xs font-bold">{stats.words}/{goal}</span>
            <input type="number" min={1} value={goal} onChange={e => setGoal(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-20 h-7 text-xs px-2 rounded-lg border bg-white text-black" />
          </div>
        </div>

        {/* Toolbar */}
        <div className="glass rounded-2xl shadow p-3 mb-3 flex flex-wrap gap-1.5 items-center justify-between sticky top-2 z-20">
          <div className="flex gap-1 flex-wrap items-center">
            <button onClick={() => applyFormat("bold")} className="w-9 h-9 rounded-lg bg-white text-black font-black border" title="Bold (Ctrl+B)">B</button>
            <button onClick={() => applyFormat("italic")} className="w-9 h-9 rounded-lg bg-white text-black italic border" title="Italic (Ctrl+I)">I</button>
            <button onClick={() => applyFormat("underline")} className="w-9 h-9 rounded-lg bg-white text-black underline border" title="Underline (Ctrl+U)">U</button>
            <div className="w-px h-6 bg-gray-200 mx-1" />
            <button onClick={() => applyFormat("undo")} className="h-9 px-2.5 rounded-lg bg-white text-black text-xs border" title="Undo">↶</button>
            <button onClick={() => applyFormat("redo")} className="h-9 px-2.5 rounded-lg bg-white text-black text-xs border" title="Redo">↷</button>
            <div className="w-px h-6 bg-gray-200 mx-1" />
            <button onClick={handleCut} className="h-9 px-2.5 rounded-lg bg-white text-black text-xs border">✂ Cut</button>
            <button onClick={handleCopy} className="h-9 px-2.5 rounded-lg bg-white text-black text-xs border">{copied ? "✓" : "⎙"} Copy</button>
            <button onClick={handlePaste} className="h-9 px-2.5 rounded-lg bg-white text-black text-xs border">⎘ Paste</button>
            <button onClick={handleDelete} className="h-9 px-2.5 rounded-lg bg-red-50 text-red-600 text-xs border">Del</button>
            <button onClick={handleClear} className="h-9 px-2.5 rounded-lg bg-red-50 text-red-600 text-xs border">Clear</button>
            <input type="color" value={color} onChange={e => { setColor(e.target.value); editorRef.current?.focus(); document.execCommand("foreColor", false, e.target.value); }}
              className="w-9 h-9 rounded-lg p-1 bg-white border" />
            <select value={font} onChange={e => { setFont(e.target.value); applyFormat("fontName", e.target.value); }}
              className="h-9 rounded-lg bg-white text-black px-2 text-sm border">
              <option value="Inter">Inter</option>
              <option value="Merriweather">Serif</option>
              <option value="JetBrains Mono">Mono</option>
            </select>
            <select onChange={e => changeCase(e.target.value as any)} className="h-9 rounded-lg bg-white text-black px-2 text-sm border">
              <option value="">Case ▾</option>
              <option value="upper">UPPER</option>
              <option value="lower">lower</option>
              <option value="title">Title</option>
              <option value="sentence">Sentence</option>
            </select>
          </div>
          <div className="flex gap-1.5 flex-wrap items-center">
            <button onClick={() => setShowFind(v => !v)} className="h-9 px-3 rounded-xl bg-white text-black text-xs border">🔍 Find</button>
            <button onClick={toggleVoice} type="button"
              className={`h-10 px-5 rounded-xl text-xs font-black border-2 shadow cursor-pointer transition ${isListening ? "bg-red-600 text-white border-red-600 animate-pulse" : "bg-black text-white border-black hover:bg-gray-800"}`}>
              {isListening ? "■ STOP" : "🎤 VOICE"}
            </button>
            <button onClick={toggleSpeak} className={`h-9 px-3 rounded-xl text-xs border ${isSpeaking ? "bg-red-600 text-white" : "bg-white text-black"}`}>{isSpeaking ? "■ Stop" : "🔊 Speak"}</button>
            <button onClick={share} className="h-9 px-3 rounded-xl bg-white text-black text-xs border">↗ Share</button>
            <button onClick={() => setIsFocus(true)} className="h-9 px-3 rounded-xl bg-black text-white text-xs">⛶ Focus</button>
            <button onClick={() => setIsDark(!isDark)} className="h-9 px-3 rounded-xl bg-black text-white text-xs">{isDark ? "☀ Light" : "🌙 Dark"}</button>
          </div>
        </div>

        {/* Find & Replace */}
        {showFind && (
          <div className="glass rounded-2xl p-3 mb-3 flex gap-2 items-center flex-wrap">
            <input value={findText} onChange={e => setFindText(e.target.value)} placeholder="Find..." className="h-9 px-3 rounded-lg border bg-white text-black text-sm flex-1 min-w-[140px]" />
            <input value={replaceText} onChange={e => setReplaceText(e.target.value)} placeholder="Replace with..." className="h-9 px-3 rounded-lg border bg-white text-black text-sm flex-1 min-w-[140px]" />
            <button onClick={doReplace} disabled={!findText} className="h-9 px-4 rounded-lg bg-violet-600 text-white text-sm disabled:opacity-40">Replace All</button>
            <button onClick={() => setShowFind(false)} className="h-9 px-3 rounded-lg bg-white border text-black text-sm">✕</button>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mb-4 justify-between flex-wrap">
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => { setShowHighlight(v => !v); if (showHighlight) { if (editorRef.current) editorRef.current.innerText = text; } else applyHighlights(errors, text); }}
              className={`text-xs px-3 py-1.5 rounded-full border ${showHighlight ? "bg-red-600 text-white" : "bg-white text-black"}`}>
              {showHighlight ? "🔴 Red Lines ON" : "⚪ Red OFF"}
            </button>
            <button onClick={checkGrammar} className="text-xs px-3 py-1.5 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
              {checking ? "Checking..." : "✓ Grammar"}
            </button>
            {errors.length > 0 && (
              <button onClick={fixAll} className="text-xs px-3 py-1.5 rounded-full bg-green-600 text-white">⚡ Fix All ({errors.length})</button>
            )}
            <button onClick={handleCopyStats} className="text-xs px-3 py-1.5 rounded-full bg-white border text-black">{copiedStats ? "✓ Copied" : "⎙ Copy Stats"}</button>
            {!text && <button onClick={loadSample} className="text-xs px-3 py-1.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200">📄 Sample</button>}
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={exportTxt} className="text-xs px-3 py-1.5 rounded-full bg-white border text-black">TXT</button>
            <button onClick={exportDoc} className="text-xs px-3 py-1.5 rounded-full bg-white border text-black">DOC</button>
            <button onClick={exportCsv} className="text-xs px-3 py-1.5 rounded-full bg-white border text-black">CSV</button>
            <button onClick={exportPdf} className="text-xs px-3 py-1.5 rounded-full bg-black text-white">PDF</button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="glass rounded-[24px] shadow p-2">
              <div ref={editorRef} contentEditable suppressContentEditableWarning onInput={handleInput}
                className={`w-full min-h-[460px] p-6 rounded-[16px] ${isDark ? "bg-black/50 text-white" : "bg-white/90"} outline-none text-[16px] leading-relaxed`}
                style={{ fontFamily: font, color: isDark ? "#f3f4f6" : color }}
                data-placeholder="Start typing or paste text..." />
              <div className="px-4 py-2 text-[11px] opacity-50">Chars (with) = space ke saath, Chars (without) = bina space. {autoLang}</div>
            </div>

            {errors.length > 0 && (
              <div className="glass rounded-2xl p-4 mt-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-sm">🔴 {errors.length} Errors</h3>
                  <button onClick={fixAll} className="text-xs px-2 py-1 bg-green-600 text-white rounded">Fix All</button>
                </div>
                {errors.map((err, i) => (
                  <div key={i} className="flex justify-between items-center p-2 bg-white text-black rounded-xl text-xs mb-2 gap-2">
                    <span className="flex-1">{err.message} → <b className="text-green-600">{err.replacement}</b></span>
                    <button onClick={() => fixError(err)} className="px-3 py-1 bg-black text-white rounded-lg whitespace-nowrap">Fix</button>
                  </div>
                ))}
              </div>
            )}

            <div className="glass rounded-2xl p-4 mt-4">
              <h3 className="font-bold text-xs uppercase mb-3">📱 Social Media Limits</h3>
              <div className="grid grid-cols-3 gap-3">
                {socialLimits.map(s => (
                  <div key={s.name} className="bg-white text-black rounded-xl p-3 text-center border">
                    <div className="text-[10px] opacity-60">{s.name}</div>
                    <div className={`text-sm font-black ${s.left < 0 ? "text-red-500" : s.left < s.limit * 0.1 ? "text-orange-500" : "text-green-600"}`}>
                      {s.left < 0 ? `${Math.abs(s.left)} over` : `${s.left} left`}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass rounded-2xl p-4 mt-4">
              <h3 className="font-bold text-xs uppercase mb-3">📊 Keyword Density</h3>
              {stats.density.length === 0 ? <p className="text-xs opacity-50">Type...</p> : stats.density.map(([k, d]) => (
                <div key={k} className="flex justify-between text-xs py-1 border-b last:border-0">
                  <span>{k}</span><span className={`font-bold ${parseFloat(d) > 3 ? "text-red-500" : "text-green-600"}`}>{d}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Stat label="Words" value={stats.words} tip="Total words" />
              <Stat label="Chars (with)" value={stats.chars} tip="Space ke saath" />
              <Stat label="Chars (without)" value={stats.charsNoSpace} tip="Bina space ke" />
              <Stat label="Sentences" value={stats.sentences} />
              <Stat label="Paragraphs" value={stats.paras} />
              <Stat label="Lines" value={stats.lines} />
              <Stat label="Reading" value={`${stats.readingTime}m`} />
              <Stat label="Speaking" value={`${stats.speakingTime}m`} />
              <Stat label="Goal" value={`${progress}%`} />
              <Stat label="Flesch" value={stats.flesch} tip={stats.level} />
            </div>
            <div className="glass rounded-2xl p-4">
              <h3 className="font-bold text-xs uppercase mb-3">Top 10 Keywords</h3>
              {stats.top10.length === 0 ? <p className="text-xs opacity-50">Type...</p> : stats.top10.map(([k, v], i) => (
                <div key={k} className="flex justify-between text-xs py-1.5 border-b last:border-0">
                  <span>{i + 1}. {k}</span><span className="font-bold">{v}x</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 space-y-4">
          {articles.map(a => (
            <div key={a.id} className="glass rounded-2xl overflow-hidden">
              <button onClick={() => setShowArticle(showArticle === a.id ? null : a.id)}
                className="w-full flex justify-between items-center p-5 font-bold text-left">
                <span>{a.title}</span><span className="text-xl">{showArticle === a.id ? "−" : "+"}</span>
              </button>
              {showArticle === a.id && (
                <div className={`p-6 ${isDark ? "bg-black/50" : "bg-white/80"} text-sm leading-7 whitespace-pre-line border-t`}>{a.content}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const articles = [
  { id: "what", title: "What is Word Counter? Ultimate Guide (1200+ Words)", content: `Word Counter counts words, chars with/without spaces, sentences, paragraphs, lines in real-time. For students, goal setting helps. For SEO, reading time 200wpm, speaking time 130wpm, Flesch readability score helps. Privacy first: browser only, auto-save. Social limits show Twitter 280 left. Keyword density = (count/total)*100, ideal 1-2%.` },
  { id: "density", title: "Chars (with) vs Chars (without) & Keyword Density Explained", content: `Chars (with spaces): "Hello World" = 11 chars (space included). Used for Twitter, SMS where space counts.\n\nChars (without spaces): "Hello World" = 10 chars (only letters). Used when universities ask "1000 chars without spaces".\n\nKeyword Density: If 1000 words article has "word counter" 15 times, density = 1.5%. 1-2% is ideal, >3% is spam and Google penalizes.` },
  { id: "social", title: "Social Media Limits Kya Hai? Use Kaise Kare?", content: `Har platform ka limit hota hai. Twitter 280 chars se zyada par tweet cut jayega. Instagram 2200 chars ke baad "See more". Hamara tool live batata hai "50 left" ya "-20 over" taaki aap pehle hi edit kar sako. Yeh social media managers ke liye bahut useful hai.` },
];

function Stat({ label, value, tip }: any) {
  return (
    <div className="glass rounded-2xl p-4 shadow-sm" title={tip}>
      <div className="text-[10px] uppercase tracking-widest opacity-60">{label}</div>
      <div className="text-lg font-black mt-1">{value}</div>
      {tip && <div className="text-[9px] opacity-40 mt-1">{tip}</div>}
    </div>
  );
}
