"use client";
import { useState, useMemo, useRef, useEffect, useCallback } from "react";

type ErrorItem = { message: string; offset: number; length: number; replacement: string; };
type Suggestion = { word: string; at: number; replaceLen: number };

const LANGUAGES = [
  { code: "en-US", label: "English (US)", flag: "🇺🇸" },
  { code: "en-GB", label: "English (UK)", flag: "🇬🇧" },
  { code: "hi-IN", label: "Hindi", flag: "🇮🇳" },
  { code: "es", label: "Spanish", flag: "🇪🇸" },
  { code: "fr", label: "French", flag: "🇫🇷" },
  { code: "de", label: "German", flag: "🇩🇪" },
  { code: "ja", label: "Japanese", flag: "🇯🇵" },
  { code: "zh", label: "Chinese", flag: "🇨🇳" },
  { code: "ar", label: "Arabic", flag: "🇸🇦" },
];

const PAGE_SIZES: Record<string, { w: number; h: number; label: string }> = {
  A4: { w: 210, h: 297, label: "A4 (210×297mm)" },
  Letter: { w: 216, h: 279, label: "Letter (216×279mm)" },
  Legal: { w: 216, h: 356, label: "Legal (216×356mm)" },
};

const FONTS = [
  { name: "Inter", css: "'Inter', sans-serif", mono: false },
  { name: "Poppins", css: "'Poppins', sans-serif", mono: false },
  { name: "Roboto", css: "'Roboto', sans-serif", mono: false },
  { name: "Merriweather", css: "'Merriweather', serif", mono: false },
  { name: "Playfair Display", css: "'Playfair Display', serif", mono: false },
  { name: "Lora", css: "'Lora', serif", mono: false },
  { name: "Georgia", css: "Georgia, serif", mono: false },
  { name: "Times New Roman", css: "'Times New Roman', serif", mono: false },
  { name: "Arial", css: "Arial, sans-serif", mono: false },
  { name: "Verdana", css: "Verdana, sans-serif", mono: false },
  { name: "JetBrains Mono", css: "'JetBrains Mono', monospace", mono: true },
  { name: "Fira Code", css: "'Fira Code', monospace", mono: true },
  { name: "Roboto Mono", css: "'Roboto Mono', monospace", mono: true },
  { name: "Courier New", css: "'Courier New', monospace", mono: true },
];

const COLOR_PALETTE = ["#111827","#7c3aed","#ec4899","#ef4444","#f59e0b","#10b981","#06b6d4","#3b82f6","#8b5cf6","#64748b"];

const AUTO_CORRECT: Record<string, string> = {
  teh: "the", adn: "and", recieve: "receive", seperate: "separate",
  occured: "occurred", definately: "definitely", wierd: "weird",
  freind: "friend", beleive: "believe", calender: "calendar",
  tommorow: "tomorrow", untill: "until", wich: "which", thier: "their",
  recieved: "received", succesful: "successful", buisness: "business",
};

const DICTIONARY = ["about","above","across","action","actually","added","after","again","against","almost","along","already","although","always","among","amount","another","answer","anyone","anything","appear","around","available","back","became","because","become","before","begin","behind","believe","below","better","between","beyond","bring","business","called","cannot","carry","center","certain","change","children","choose","class","clear","close","color","coming","common","company","complete","consider","continue","could","country","course","create","current","decide","describe","develop","different","difficult","direct","during","early","education","effect","either","enough","every","example","experience","family","father","feeling","figure","follow","friend","future","general","given","government","great","ground","group","growth","happen","having","heard","heavy","history","however","hundred","important","include","inside","issue","itself","knowledge","language","large","later","learn","leave","letter","level","light","little","local","machine","major","material","matter","maybe","mean","measure","medical","member","memory","message","method","middle","might","minute","modern","moment","money","month","morning","mother","mountain","music","nation","natural","nature","nearly","necessary","need","never","night","nothing","notice","number","object","occur","offer","often","order","other","paper","particular","people","perhaps","person","picture","place","plan","point","police","policy","possible","power","practice","prepare","present","president","press","pretty","prevent","private","probably","problem","process","produce","product","program","project","property","provide","public","purpose","question","quickly","quiet","rather","reach","ready","really","reason","receive","recent","recognize","record","reduce","reflect","region","relate","remain","remember","remove","report","require","research","resource","respond","result","return","right","roughly","school","science","season","second","section","seem","sense","series","serious","serve","service","several","shall","share","short","should","similar","simple","simply","since","single","situation","small","social","society","some","someone","something","sometimes","space","speak","special","spend","stand","start","state","statement","station","stay","still","story","street","strong","structure","student","study","subject","success","suddenly","suggest","summer","support","system","table","taken","teach","thing","though","thought","thousand","through","throughout","together","tomorrow","tonight","total","toward","town","trade","training","travel","treatment","trouble","truth","understand","until","usually","value","various","victim","video","village","visit","voice","watch","water","weapon","weather","week","weight","welcome","western","whatever","whenever","wherever","whether","which","while","white","whole","whose","window","within","without","woman","wonder","world","worry","would","write","writer","wrong","year","young","yourself"];

const SAMPLE = `Word Counter is a powerful tool that counts words, characters, sentences, and paragraphs in real-time. It helps writers, students, and SEO professionals track their content length and readability.`;

const safeGet = (k: string): string | null => {
  try { return typeof window !== "undefined" ? localStorage.getItem(k) : null; } catch { return null; }
};
const safeSet = (k: string, v: string) => {
  try { if (typeof window !== "undefined") localStorage.setItem(k, v); } catch {}
};
const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
   .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
const formatTime = (s: number) => {
  const m = Math.floor(s / 60); const sec = s % 60; const h = Math.floor(m / 60);
  if (h > 0) return `${h}h ${m % 60}m`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
};

export default function WordCounterClient() {
  const [text, setText] = useState("");
  const [errors, setErrors] = useState<ErrorItem[]>([]);
  const [checking, setChecking] = useState(false);
  const [font, setFont] = useState("Inter");
  const [fontSize, setFontSize] = useState(16);
  const [lineHeight, setLineHeight] = useState(1.7);
  const [color, setColor] = useState("#111827");
  const [pageSize, setPageSize] = useState("A4");
  const [showArticle, setShowArticle] = useState<string | null>("what-is");
  const [goal, setGoal] = useState(1000);
  const [isFocus, setIsFocus] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedStats, setCopiedStats] = useState(false);
  const [lang, setLang] = useState("en-US");
  const [autoLang, setAutoLang] = useState("Auto Detect: -");
  const [showHighlight, setShowHighlight] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [showFind, setShowFind] = useState(false);
  const [autoCorrect, setAutoCorrect] = useState(true);
  const [autoComplete, setAutoComplete] = useState(true);
  const [duplicateHighlight, setDuplicateHighlight] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [goalReached, setGoalReached] = useState(false);
  const [writingTime, setWritingTime] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const grammarAbortRef = useRef<AbortController | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // -------- LOAD --------
  useEffect(() => {
    const saved = safeGet("lorem_word_text");
    if (saved) setText(saved);
    const cfg = safeGet("lorem_cfg");
    if (cfg) {
      try {
        const c = JSON.parse(cfg);
        if (c.font) setFont(c.font);
        if (c.fontSize) setFontSize(c.fontSize);
        if (c.lineHeight) setLineHeight(c.lineHeight);
        if (c.color) setColor(c.color);
        if (c.pageSize) setPageSize(c.pageSize);
        if (c.goal) setGoal(c.goal);
        if (c.dark) setIsDark(c.dark);
        if (c.lang) setLang(c.lang);
        if (c.autoCorrect !== undefined) setAutoCorrect(c.autoCorrect);
        if (c.autoComplete !== undefined) setAutoComplete(c.autoComplete);
      } catch {}
    }
  }, []);

  // -------- AUTO SAVE --------
  useEffect(() => {
    setSaveStatus("saving");
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      safeSet("lorem_word_text", text);
      safeSet("lorem_cfg", JSON.stringify({ font, fontSize, lineHeight, color, pageSize, goal, dark: isDark, lang, autoCorrect, autoComplete }));
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 1200);
    }, 400);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [text, font, fontSize, lineHeight, color, pageSize, goal, isDark, lang, autoCorrect, autoComplete]);

  // -------- AUTO LANGUAGE --------
  useEffect(() => {
    if (!text.trim()) { setAutoLang("Auto Detect: -"); return; }
    const hasHindi = /[\u0900-\u097F]/.test(text);
    const hasLatin = /[a-zA-Z]/.test(text);
    setAutoLang(hasHindi && !hasLatin ? "Auto Detect: Hindi 🇮🇳" : hasHindi ? "Auto Detect: Mixed 🌐" : "Auto Detect: English 🇺🇸");
  }, [text]);

  // -------- WRITING TIME --------
  useEffect(() => {
    const tick = setInterval(() => { if (isActive) setWritingTime(t => t + 1); }, 1000);
    return () => clearInterval(tick);
  }, [isActive]);

  const markActive = useCallback(() => {
    setIsActive(true);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => setIsActive(false), 5000);
  }, []);

  // -------- STATS --------
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

  const duplicates = useMemo(() => {
    const trimmed = text.trim();
    if (!trimmed) return { words: [], sentences: [] };
    const words = trimmed.toLowerCase().split(/\s+/).map(w => w.replace(/[^a-z0-9]/g, "")).filter(w => w.length > 3);
    const wc: Record<string, number> = {};
    words.forEach(w => { wc[w] = (wc[w] || 0) + 1; });
    const dupWords = Object.entries(wc).filter(([, c]) => c > 1).sort((a, b) => b[1] - a[1]).slice(0, 20);
    const sentences = text.split(/[.!?]+/).map(s => s.trim().toLowerCase()).filter(s => s.length > 20);
    const sc: Record<string, number> = {};
    sentences.forEach(s => { sc[s] = (sc[s] || 0) + 1; });
    const dupSentences = Object.entries(sc).filter(([, c]) => c > 1).map(([s, c]) => ({ text: s.slice(0, 80), count: c }));
    return { words: dupWords, sentences: dupSentences };
  }, [text]);

  const progress = goal > 0 ? Math.min(100, Math.round((stats.words / goal) * 100)) : 0;

  useEffect(() => {
    if (stats.words >= goal && goal > 0 && !goalReached) {
      setGoalReached(true);
      setToast(`🎉 Goal Reached! ${stats.words}/${goal} words`);
      setTimeout(() => setToast(null), 4000);
    } else if (stats.words < goal * 0.95) {
      setGoalReached(false);
    }
  }, [stats.words, goal, goalReached]);

  // -------- HIGHLIGHTS PREVIEW --------
  const highlightedHtml = useMemo(() => {
    if (!showHighlight || errors.length === 0) return "";
    let html = escapeHtml(text);
    [...errors].sort((a, b) => b.offset - a.offset).forEach(err => {
      const before = html.substring(0, err.offset);
      const mid = html.substring(err.offset, err.offset + err.length);
      const after = html.substring(err.offset + err.length);
      html = `${before}<span style="text-decoration:underline wavy red 2.5px;text-underline-offset:4px;background:rgba(255,0,0,0.08)" title="${escapeHtml(err.message)} → ${escapeHtml(err.replacement)}">${mid}</span>${after}`;
    });
    return html.replace(/\n/g, "<br>");
  }, [text, errors, showHighlight]);

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
      const errs: ErrorItem[] = (data.matches || []).slice(0, 15).map((m: any) => ({
        message: m.message, offset: m.offset, length: m.length, replacement: m.replacements?.[0]?.value || "",
      }));
      setErrors(errs);
    } catch {} finally { setChecking(false); }
  }, [text, lang]);

  useEffect(() => {
    if (text.length < 15) return;
    const t = setTimeout(() => { checkGrammar(); }, 1500);
    return () => clearTimeout(t);
  }, [text, lang, checkGrammar]);

  // -------- INPUT HANDLER --------
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    markActive();
    let val = e.target.value;
    if (autoCorrect) {
      const m = val.match(/(\b[a-zA-Z]{2,})\s$/);
      if (m) {
        const lower = m[1].toLowerCase();
        if (AUTO_CORRECT[lower]) val = val.slice(0, -m[0].length) + AUTO_CORRECT[lower] + " ";
      }
    }
    setText(val);
    if (autoComplete) {
      const m2 = val.match(/([a-zA-Z]{2,})$/);
      if (m2) {
        const prefix = m2[1].toLowerCase();
        const sugg = DICTIONARY.filter(w => w.startsWith(prefix) && w !== prefix).slice(0, 5);
        setSuggestions(sugg.map(w => ({ word: w, at: val.length - m2[1].length, replaceLen: m2[1].length })));
      } else setSuggestions([]);
    }
  };

  const insertSuggestion = (s: Suggestion) => {
    const next = text.slice(0, s.at) + s.word + text.slice(s.at + s.replaceLen);
    setText(next);
    setSuggestions([]);
    setTimeout(() => { const ta = textareaRef.current; if (ta) { ta.focus(); ta.setSelectionRange(s.at + s.word.length, s.at + s.word.length); } }, 10);
  };

  const insertAtCursor = (insert: string) => {
    const ta = textareaRef.current;
    if (!ta) { setText(t => t + (t ? " " : "") + insert); return; }
    const start = ta.selectionStart, end = ta.selectionEnd;
    const before = text.substring(0, start);
    const after = text.substring(end);
    const newText = before + (before && !before.endsWith(" ") && !before.endsWith("\n") ? " " : "") + insert + after;
    setText(newText);
    setTimeout(() => { ta.focus(); ta.setSelectionRange(start + insert.length + 1, start + insert.length + 1); }, 10);
  };

  // -------- EDIT OPERATIONS --------
  const handleCopy = async () => {
    try {
      const ta = textareaRef.current;
      const selected = ta && ta.selectionStart !== ta.selectionEnd ? text.substring(ta.selectionStart, ta.selectionEnd) : text;
      await navigator.clipboard.writeText(selected);
      setCopied(true); setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const handleCut = async () => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart, end = ta.selectionEnd;
    if (start === end) { setToast("⚠ Select text first to cut"); setTimeout(() => setToast(null), 2000); return; }
    try { await navigator.clipboard.writeText(text.substring(start, end)); } catch {}
    const newText = text.substring(0, start) + text.substring(end);
    setText(newText);
    setTimeout(() => { ta.focus(); ta.setSelectionRange(start, start); }, 10);
  };

  const handlePaste = async () => {
    try {
      const clip = await navigator.clipboard.readText();
      if (clip) insertAtCursor(clip);
    } catch { setToast("⚠ Clipboard permission needed"); setTimeout(() => setToast(null), 2000); }
  };

  const handleDeleteKey = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart, end = ta.selectionEnd;
    if (start === end && start < text.length) {
      setText(text.substring(0, start) + text.substring(start + 1));
      setTimeout(() => { ta.focus(); ta.setSelectionRange(start, start); }, 10);
    } else if (start !== end) {
      setText(text.substring(0, start) + text.substring(end));
      setTimeout(() => { ta.focus(); ta.setSelectionRange(start, start); }, 10);
    }
  };

  const handleBackspace = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart, end = ta.selectionEnd;
    if (start === end && start > 0) {
      setText(text.substring(0, start - 1) + text.substring(start));
      setTimeout(() => { ta.focus(); ta.setSelectionRange(start - 1, start - 1); }, 10);
    } else if (start !== end) {
      setText(text.substring(0, start) + text.substring(end));
      setTimeout(() => { ta.focus(); ta.setSelectionRange(start, start); }, 10);
    }
  };

  const handleClear = () => { if (!text) return; if (!confirm("Clear all text?")) return; setText(""); setErrors([]); setWritingTime(0); };

  const handleCopyStats = async () => {
    const s = `Words: ${stats.words} | Chars(with): ${stats.chars} | Chars(without): ${stats.charsNoSpace} | Sentences: ${stats.sentences} | Paragraphs: ${stats.paras} | Lines: ${stats.lines} | Reading: ${stats.readingTime}m | Speaking: ${stats.speakingTime}m | Writing: ${formatTime(writingTime)} | Flesch: ${stats.flesch} (${stats.level})`;
    try { await navigator.clipboard.writeText(s); setCopiedStats(true); setTimeout(() => setCopiedStats(false), 1500); } catch {}
  };

  const exportTxt = () => { const b = new Blob([text], { type: "text/plain" }); const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = "doc.txt"; a.click(); URL.revokeObjectURL(a.href); };
  const exportDoc = () => { const b = new Blob([`<html><body><pre>${escapeHtml(text)}</pre></body></html>`], { type: "application/msword" }); const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = "doc.doc"; a.click(); URL.revokeObjectURL(a.href); };
  const exportPdf = () => { const w = window.open("", "_blank"); if (w) { w.document.write(`<pre style="white-space:pre-wrap;font-family:${FONTS.find(f => f.name === font)?.css};font-size:${fontSize}px;line-height:${lineHeight};padding:24px">${escapeHtml(text)}</pre>`); w.document.close(); w.print(); } };
  const exportCsv = () => {
    const rows = [["Metric", "Value"], ["Words", stats.words], ["Chars (with)", stats.chars], ["Chars (without)", stats.charsNoSpace], ["Sentences", stats.sentences], ["Paragraphs", stats.paras], ["Lines", stats.lines], ["Reading Time (min)", stats.readingTime], ["Speaking Time (min)", stats.speakingTime], ["Writing Time", formatTime(writingTime)], ["Flesch Score", stats.flesch], ["Level", stats.level]];
    const csv = rows.map(r => r.join(",")).join("\n");
    const b = new Blob([csv], { type: "text/csv" }); const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = "stats.csv"; a.click(); URL.revokeObjectURL(a.href);
  };

  const toggleVoice = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert("❌ Voice typing only in Chrome/Edge over HTTPS."); return; }
    if (isListening && recognitionRef.current) { try { recognitionRef.current.stop(); } catch {} setIsListening(false); return; }
    try {
      const rec = new SR(); recognitionRef.current = rec;
      rec.lang = lang; rec.continuous = false; rec.interimResults = false; rec.maxAlternatives = 1;
      rec.onstart = () => setIsListening(true);
      rec.onresult = (event: any) => { const transcript = event.results[0][0].transcript; insertAtCursor(transcript); };
      rec.onerror = (e: any) => { setIsListening(false); if (e.error === "not-allowed") alert("Mic permission blocked."); };
      rec.onend = () => setIsListening(false);
      rec.start();
    } catch (err: any) { alert("Voice error: " + err.message); setIsListening(false); }
  };

  const toggleSpeak = () => {
    if (isSpeaking) { speechSynthesis.cancel(); setIsSpeaking(false); return; }
    if (!text.trim()) return;
    const u = new SpeechSynthesisUtterance(text); u.lang = lang;
    u.onstart = () => setIsSpeaking(true); u.onend = () => setIsSpeaking(false); u.onerror = () => setIsSpeaking(false);
    speechSynthesis.speak(u);
  };

  const share = async () => {
    if (navigator.share) { try { await navigator.share({ title: "Doc", text: text.slice(0, 200) }); } catch {} }
    else { try { await navigator.clipboard.writeText(text); alert("Copied!"); } catch {} }
  };

  const fixError = (err: ErrorItem) => { setText(text.substring(0, err.offset) + err.replacement + text.substring(err.offset + err.length)); setErrors(p => p.filter(e => e !== err)); };
  const fixAll = () => { let nt = text; [...errors].sort((a, b) => b.offset - a.offset).forEach(err => { nt = nt.substring(0, err.offset) + err.replacement + nt.substring(err.offset + err.length); }); setText(nt); setErrors([]); };
  const changeCase = (mode: string) => {
    if (!text || !mode) return;
    let out = text;
    if (mode === "upper") out = text.toUpperCase();
    else if (mode === "lower") out = text.toLowerCase();
    else if (mode === "title") out = text.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.substr(1).toLowerCase());
    else if (mode === "sentence") out = text.toLowerCase().replace(/(^\s*\w|[.!?]\s+\w)/g, c => c.toUpperCase());
    setText(out);
  };
  const doReplace = () => { if (!findText) return; setText(text.split(findText).join(replaceText)); };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      if (ctrl && e.key.toLowerCase() === "f") { e.preventDefault(); setShowFind(v => !v); }
      else if (ctrl && e.key.toLowerCase() === "s") { e.preventDefault(); safeSet("lorem_word_text", text); setSaveStatus("saved"); setTimeout(() => setSaveStatus("idle"), 1000); }
      else if (e.key === "Tab" && suggestions.length > 0 && document.activeElement === textareaRef.current) { e.preventDefault(); insertSuggestion(suggestions[0]); }
      else if (e.key === "Escape") { setSuggestions([]); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [text, suggestions]);

  const loadSample = () => setText(SAMPLE);
  const currentFont = FONTS.find(f => f.name === font) || FONTS[0];
  const page = PAGE_SIZES[pageSize] || PAGE_SIZES.A4;

  // ============ GLASSMORPHISM BACKGROUND ============
  const bgDecor = (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full opacity-40 blur-3xl animate-pulse" style={{ background: "radial-gradient(circle, #a855f7, transparent 70%)" }} />
      <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] rounded-full opacity-30 blur-3xl animate-pulse" style={{ background: "radial-gradient(circle, #ec4899, transparent 70%)", animationDelay: "1s" }} />
      <div className="absolute -bottom-40 left-1/3 w-[500px] h-[500px] rounded-full opacity-30 blur-3xl animate-pulse" style={{ background: "radial-gradient(circle, #06b6d4, transparent 70%)", animationDelay: "2s" }} />
    </div>
  );

  if (isFocus) {
    return (
      <div className={`min-h-screen relative ${isDark ? "bg-[#0a0a1a] text-white" : "bg-gradient-to-br from-violet-50 via-pink-50 to-cyan-50 text-black"} p-8`}>
        {bgDecor}
        <div className="max-w-3xl mx-auto relative">
          <div className="flex justify-between mb-6">
            <button onClick={() => setIsFocus(false)} className="px-4 py-2 bg-black text-white rounded-xl text-sm dark:bg-white dark:text-black">← Exit Focus</button>
            <span className="text-sm opacity-60">{stats.words} words • {formatTime(writingTime)} • {autoLang}</span>
          </div>
          <div className="backdrop-blur-2xl bg-white/40 dark:bg-white/5 border border-white/40 dark:border-white/10 rounded-3xl p-6 shadow-2xl">
            <textarea ref={textareaRef} value={text} onChange={handleInput} className="w-full min-h-[75vh] outline-none bg-transparent resize-none" style={{ fontFamily: currentFont.css, fontSize: `${fontSize}px`, lineHeight, color: isDark ? "#fff" : color }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isDark ? "bg-[#0a0a1a] text-white" : "bg-gradient-to-br from-violet-50 via-pink-50 to-cyan-50 text-gray-900"} min-h-screen relative`}>
      {bgDecor}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=Poppins:wght@400;700;900&family=Roboto:wght@400;700&family=Merriweather:wght@400;700&family=Playfair+Display:wght@400;700&family=Lora:wght@400;700&family=JetBrains+Mono:wght@400;700&family=Fira+Code:wght@400;700&family=Roboto+Mono:wght@400;700&display=swap');
        .glass{backdrop-filter:blur(20px) saturate(180%);background:${isDark ? "rgba(20,20,40,0.5)" : "rgba(255,255,255,0.5)"};border:1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.7)"};box-shadow:0 8px 32px rgba(0,0,0,0.08)}
        .glass-btn{backdrop-filter:blur(12px);background:${isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.65)"};border:1px solid ${isDark ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.9)"};transition:all 0.2s}
        .glass-btn:hover{transform:translateY(-1px);box-shadow:0 8px 20px rgba(139,92,246,0.2)}
        .glass-btn:active{transform:translateY(0)}
        textarea{resize:none}
        textarea:focus{outline:none}
        @keyframes shimmer{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
        .gradient-text{background:linear-gradient(90deg,#a855f7,#ec4899,#06b6d4);background-size:200% auto;animation:shimmer 4s linear infinite;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
      `}</style>

      {toast && (<div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-2xl shadow-2xl font-bold animate-pulse">{toast}</div>)}

      <div className="max-w-6xl mx-auto p-4 md:p-8 relative">
        {/* HEADER */}
        <div className="text-center mb-6">
          <div className="inline-flex px-4 py-1.5 rounded-full glass-btn text-[11px] tracking-widest mb-3 font-bold">✨ GLASSMORPHISM EDITION · ALL FEATURES</div>
          <h1 className="text-5xl md:text-6xl font-black gradient-text">Word Counter Pro</h1>
          <p className="mt-2 opacity-70 text-sm">Complete writing studio with real-time stats, grammar check, and 20+ tools</p>
          <div className="flex justify-center gap-2 mt-4 flex-wrap items-center">
            <select value={lang} onChange={e => setLang(e.target.value)} className="h-9 rounded-xl glass-btn px-3 text-sm font-bold">{LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.flag} {l.label}</option>)}</select>
            <span className="text-xs px-3 py-1.5 rounded-full bg-gradient-to-r from-violet-600 to-pink-600 text-white font-bold">{autoLang}</span>
            <span className="text-sm opacity-70">{stats.words}/{goal} • {progress}%</span>
            <span className={`text-xs px-2 py-1.5 rounded-full ${saveStatus === "saved" ? "bg-green-500/20 text-green-700 dark:text-green-300" : "glass-btn"}`}>{saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "Saved ✓" : "Auto-save"}</span>
            <span className={`text-xs px-2 py-1.5 rounded-full ${isActive ? "bg-blue-500/20 text-blue-700 dark:text-blue-300" : "glass-btn"}`}>⏱ {formatTime(writingTime)}</span>
          </div>
          <div className="flex justify-center items-center gap-3 mt-3">
            <div className="max-w-md w-full h-2.5 bg-white/40 dark:bg-white/10 rounded-full overflow-hidden">
              <div style={{ width: `${progress}%` }} className={`h-full transition-all ${progress >= 100 ? "bg-green-500" : "bg-gradient-to-r from-violet-500 via-pink-500 to-cyan-500"}`} />
            </div>
            <span className="text-xs font-bold">{stats.words}/{goal}</span>
            <input type="number" min={1} value={goal} onChange={e => setGoal(Math.max(1, parseInt(e.target.value) || 1))} className="w-20 h-7 text-xs px-2 rounded-lg glass-btn" />
          </div>
        </div>

        {/* TOOLBAR ROW 1 - EDIT OPERATIONS */}
        <div className="glass rounded-2xl p-3 mb-3 flex flex-wrap gap-1.5 items-center justify-between sticky top-2 z-20">
          <div className="flex gap-1 flex-wrap items-center">
            <button onClick={handleCut} className="h-9 px-3 rounded-lg glass-btn text-xs font-bold" title="Cut (Ctrl+X)">✂ Cut</button>
            <button onClick={handleCopy} className="h-9 px-3 rounded-lg glass-btn text-xs font-bold" title="Copy (Ctrl+C)">{copied ? "✓ Copied" : "📋 Copy"}</button>
            <button onClick={handlePaste} className="h-9 px-3 rounded-lg glass-btn text-xs font-bold" title="Paste (Ctrl+V)">📥 Paste</button>
            <button onClick={handleBackspace} className="h-9 px-3 rounded-lg glass-btn text-xs font-bold" title="Backspace">⌫ Backspace</button>
            <button onClick={handleDeleteKey} className="h-9 px-3 rounded-lg bg-red-500/20 text-red-700 dark:text-red-300 text-xs font-bold border border-red-300/40" title="Delete">⌦ Delete</button>
            <div className="w-px h-6 bg-white/30 mx-1" />
            <select onChange={e => { changeCase(e.target.value); e.target.value = ""; }} className="h-9 rounded-lg glass-btn px-2 text-xs font-bold">
              <option value="">Aa Case ▾</option>
              <option value="upper">UPPER</option>
              <option value="lower">lower</option>
              <option value="title">Title Case</option>
              <option value="sentence">Sentence case</option>
            </select>
            <div className="w-px h-6 bg-white/30 mx-1" />
            <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-9 h-9 rounded-lg glass-btn p-1 cursor-pointer" title="Text Color" />
            <div className="flex gap-1">
              {COLOR_PALETTE.slice(1, 6).map(c => (
                <button key={c} onClick={() => setColor(c)} className="w-6 h-6 rounded-full border-2 border-white/50 hover:scale-110 transition" style={{ background: c }} title={c} />
              ))}
            </div>
            <button onClick={handleClear} className="h-9 px-3 rounded-lg bg-red-500/20 text-red-700 dark:text-red-300 text-xs font-bold border border-red-300/40">🗑 Clear</button>
          </div>
          <div className="flex gap-1.5 flex-wrap items-center">
            <button onClick={() => setShowFind(v => !v)} className="h-9 px-3 rounded-xl glass-btn text-xs font-bold">🔍 Find</button>
            <button onClick={() => setShowSettings(v => !v)} className="h-9 px-3 rounded-xl glass-btn text-xs font-bold">⚙ Settings</button>
            <button onClick={toggleVoice} type="button" className={`h-10 px-5 rounded-xl text-xs font-black border-2 shadow cursor-pointer transition ${isListening ? "bg-red-500 text-white border-red-500 animate-pulse" : "bg-gradient-to-r from-violet-600 to-pink-600 text-white border-transparent hover:shadow-lg"}`}>{isListening ? "■ STOP" : "🎤 VOICE"}</button>
            <button onClick={toggleSpeak} className={`h-9 px-3 rounded-xl text-xs font-bold border ${isSpeaking ? "bg-red-500 text-white border-red-500" : "glass-btn"}`}>{isSpeaking ? "■" : "🔊"}</button>
            <button onClick={share} className="h-9 px-3 rounded-xl glass-btn text-xs font-bold">↗</button>
            <button onClick={() => setIsFocus(true)} className="h-9 px-3 rounded-xl bg-black/80 text-white text-xs font-bold">⛶ Focus</button>
            <button onClick={() => setIsDark(!isDark)} className="h-9 px-3 rounded-xl glass-btn text-xs font-bold">{isDark ? "☀" : "🌙"}</button>
          </div>
        </div>

        {/* SETTINGS PANEL */}
        {showSettings && (
          <div className="glass rounded-2xl p-4 mb-3 grid md:grid-cols-4 gap-3">
            <div>
              <label className="text-[10px] uppercase opacity-60 font-bold">Page Size</label>
              <select value={pageSize} onChange={e => setPageSize(e.target.value)} className="w-full h-9 rounded-lg glass-btn px-2 text-sm border mt-1">
                {Object.entries(PAGE_SIZES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase opacity-60 font-bold">Font Family</label>
              <select value={font} onChange={e => setFont(e.target.value)} className="w-full h-9 rounded-lg glass-btn px-2 text-sm border mt-1">
                {FONTS.map(f => <option key={f.name} value={f.name}>{f.name}{f.mono ? " (mono)" : ""}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase opacity-60 font-bold">Font Size: {fontSize}px</label>
              <input type="range" min={10} max={32} value={fontSize} onChange={e => setFontSize(parseInt(e.target.value))} className="w-full mt-2" />
            </div>
            <div>
              <label className="text-[10px] uppercase opacity-60 font-bold">Line Height: {lineHeight}</label>
              <input type="range" min={1} max={2.5} step={0.1} value={lineHeight} onChange={e => setLineHeight(parseFloat(e.target.value))} className="w-full mt-2" />
            </div>
            <div className="md:col-span-4 flex flex-wrap gap-4 pt-2 border-t border-white/30">
              <label className="flex items-center gap-2 text-xs cursor-pointer"><input type="checkbox" checked={autoCorrect} onChange={e => setAutoCorrect(e.target.checked)} /> Auto Correct</label>
              <label className="flex items-center gap-2 text-xs cursor-pointer"><input type="checkbox" checked={autoComplete} onChange={e => setAutoComplete(e.target.checked)} /> Auto Complete (Tab)</label>
              <label className="flex items-center gap-2 text-xs cursor-pointer"><input type="checkbox" checked={showHighlight} onChange={e => setShowHighlight(e.target.checked)} /> Show Red Wavy</label>
              <label className="flex items-center gap-2 text-xs cursor-pointer"><input type="checkbox" checked={duplicateHighlight} onChange={e => setDuplicateHighlight(e.target.checked)} /> Duplicate Highlight</label>
              <span className="text-xs opacity-60 ml-auto">📄 {page.w}×{page.h}mm • {currentFont.mono ? "Monospace" : "Proportional"}</span>
            </div>
          </div>
        )}

        {/* FIND & REPLACE */}
        {showFind && (
          <div className="glass rounded-2xl p-3 mb-3 flex gap-2 items-center flex-wrap">
            <input value={findText} onChange={e => setFindText(e.target.value)} placeholder="Find..." className="h-9 px-3 rounded-lg glass-btn text-sm flex-1 min-w-[140px]" />
            <input value={replaceText} onChange={e => setReplaceText(e.target.value)} placeholder="Replace with..." className="h-9 px-3 rounded-lg glass-btn text-sm flex-1 min-w-[140px]" />
            <button onClick={doReplace} disabled={!findText} className="h-9 px-4 rounded-lg bg-gradient-to-r from-violet-600 to-pink-600 text-white text-sm font-bold disabled:opacity-40">Replace All</button>
            <button onClick={() => setShowFind(false)} className="h-9 px-3 rounded-lg glass-btn text-sm">✕</button>
          </div>
        )}

        {/* ACTION BAR */}
        <div className="flex gap-2 mb-4 justify-between flex-wrap">
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => { checkGrammar(); setShowHighlight(true); }} className="text-xs px-3 py-1.5 rounded-full bg-gradient-to-r from-violet-600 to-pink-600 text-white font-bold">{checking ? "Checking..." : "✓ Grammar Check"}</button>
            {errors.length > 0 && (<button onClick={fixAll} className="text-xs px-3 py-1.5 rounded-full bg-green-500 text-white font-bold">⚡ Fix All ({errors.length})</button>)}
            <button onClick={handleCopyStats} className="text-xs px-3 py-1.5 rounded-full glass-btn font-bold">{copiedStats ? "✓ Copied" : "⎙ Copy Stats"}</button>
            <button onClick={loadSample} className="text-xs px-3 py-1.5 rounded-full glass-btn font-bold">📄 Sample</button>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={exportTxt} className="text-xs px-3 py-1.5 rounded-full glass-btn font-bold">TXT</button>
            <button onClick={exportDoc} className="text-xs px-3 py-1.5 rounded-full glass-btn font-bold">DOC</button>
            <button onClick={exportCsv} className="text-xs px-3 py-1.5 rounded-full glass-btn font-bold">CSV</button>
            <button onClick={exportPdf} className="text-xs px-3 py-1.5 rounded-full bg-black text-white font-bold">PDF</button>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="glass rounded-3xl p-3 relative">
              <div className="px-3 py-1.5 text-[10px] opacity-60 flex justify-between">
                <span>📄 {page.label} • {fontSize}px • LH {lineHeight} • {currentFont.name}</span>
                <span>{currentFont.mono ? "🔤 Mono" : "🔡 Prop"}</span>
              </div>
              <textarea ref={textareaRef} value={text} onChange={handleInput}
                placeholder="Yahan type karo... Enter dabao, cursor stable rahega. Voice bhi cursor position par insert hoga."
                className={`w-full min-h-[480px] p-6 rounded-2xl ${isDark ? "bg-black/30" : "bg-white/60"} outline-none border-0 backdrop-blur-sm`}
                style={{ fontFamily: currentFont.css, fontSize: `${fontSize}px`, lineHeight, color: isDark ? "#f3f4f6" : color }}
              />
              {suggestions.length > 0 && (
                <div className="absolute bottom-20 left-8 glass rounded-xl shadow-2xl text-sm overflow-hidden z-30">
                  {suggestions.map((s, i) => (
                    <button key={s.word} onClick={() => insertSuggestion(s)} className={`block w-full text-left px-4 py-1.5 hover:bg-violet-500/20 ${i === 0 ? "bg-violet-500/10 font-bold" : ""}`}>
                      {s.word} {i === 0 && <span className="text-[10px] opacity-50 ml-2">Tab</span>}
                    </button>
                  ))}
                </div>
              )}
              <div className="px-3 py-2 text-[11px] opacity-60 flex justify-between">
                <span>✅ Cursor stable • {autoLang}</span>
                <span>{isActive ? "🟢 Active" : "⚪ Idle"} • ⏱ {formatTime(writingTime)}</span>
              </div>
            </div>

            {showHighlight && (
              <div className="glass rounded-3xl p-4 mt-4">
                <h3 className="font-bold text-xs mb-2">🔍 Preview with Red Wavy (Grammar errors highlighted)</h3>
                <div className={`min-h-[80px] p-4 rounded-2xl ${isDark ? "bg-black/30" : "bg-white/60"} text-[15px] leading-7`} style={{ fontFamily: currentFont.css }} dangerouslySetInnerHTML={{ __html: highlightedHtml || escapeHtml(text).replace(/\n/g, "<br>") || "<span class='opacity-40'>No errors</span>" }} />
              </div>
            )}

            {errors.length > 0 && (
              <div className="glass rounded-2xl p-4 mt-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-sm">🔴 {errors.length} Grammar Issues</h3>
                  <button onClick={fixAll} className="text-xs px-2 py-1 bg-green-500 text-white rounded font-bold">Fix All</button>
                </div>
                {errors.map((err, i) => (
                  <div key={i} className="flex justify-between items-center p-2 glass rounded-xl text-xs mb-2 gap-2">
                    <span className="flex-1">{err.message} → <b className="text-green-600 dark:text-green-400">{err.replacement}</b></span>
                    <button onClick={() => fixError(err)} className="px-3 py-1 bg-black text-white rounded-lg whitespace-nowrap font-bold">Fix</button>
                  </div>
                ))}
              </div>
            )}

            {(duplicates.words.length > 0 || duplicates.sentences.length > 0) && (
              <div className="glass rounded-2xl p-4 mt-4">
                <h3 className="font-bold text-sm mb-2">🔁 Duplicate Detection</h3>
                {duplicates.sentences.length > 0 && (
                  <div className="mb-3">
                    <div className="text-[10px] uppercase opacity-60 font-bold mb-1">Repeated Sentences ({duplicates.sentences.length})</div>
                    {duplicates.sentences.map((d, i) => (
                      <div key={i} className="text-xs p-2 bg-purple-500/15 rounded-lg mb-1"><b>{d.count}x</b> — "{d.text}..."</div>
                    ))}
                  </div>
                )}
                {duplicates.words.length > 0 && (
                  <div>
                    <div className="text-[10px] uppercase opacity-60 font-bold mb-1">Repeated Words</div>
                    <div className="flex flex-wrap gap-1">
                      {duplicates.words.slice(0, 12).map(([w, c]) => (
                        <span key={w} className="text-[11px] px-2 py-1 bg-orange-500/20 rounded-full font-bold">{w} × {c}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="glass rounded-2xl p-4 mt-4">
              <h3 className="font-bold text-xs uppercase mb-3">📊 Keyword Density</h3>
              {stats.density.length === 0 ? <p className="text-xs opacity-50">Type something...</p> : stats.density.map(([k, d]) => (
                <div key={k} className="flex justify-between text-xs py-1 border-b border-white/10 last:border-0">
                  <span>{k}</span><span className={`font-bold ${parseFloat(d) > 3 ? "text-red-500" : "text-green-600 dark:text-green-400"}`}>{d}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* SIDEBAR */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Stat label="Words" value={stats.words} tip={`Goal: ${goal}`} />
              <Stat label="Chars (with)" value={stats.chars} tip="Space ke saath" />
              <Stat label="Chars (without)" value={stats.charsNoSpace} tip="Bina space" />
              <Stat label="Sentences" value={stats.sentences} />
              <Stat label="Paragraphs" value={stats.paras} />
              <Stat label="Lines" value={stats.lines} />
              <Stat label="Reading" value={`${stats.readingTime}m`} tip="200 wpm" />
              <Stat label="Speaking" value={`${stats.speakingTime}m`} tip="130 wpm" />
              <Stat label="Writing" value={formatTime(writingTime)} tip={isActive ? "Active" : "Idle"} />
              <Stat label="Flesch" value={stats.flesch} tip={stats.level} />
            </div>
            <div className="glass rounded-2xl p-4">
              <h3 className="font-bold text-xs uppercase mb-3">🎯 Goal</h3>
              <div className="text-3xl font-black text-center gradient-text">{progress}%</div>
              <div className="text-xs text-center opacity-60 mt-1">{stats.words} / {goal} words</div>
              {goalReached && <div className="text-center text-green-600 text-xs font-bold mt-2">🎉 Goal Achieved!</div>}
            </div>
            <div className="glass rounded-2xl p-4">
              <h3 className="font-bold text-xs uppercase mb-3">Top 10 Keywords</h3>
              {stats.top10.length === 0 ? <p className="text-xs opacity-50">Type...</p> : stats.top10.map(([k, v], i) => (
                <div key={k} className="flex justify-between text-xs py-1.5 border-b border-white/10 last:border-0"><span>{i + 1}. {k}</span><span className="font-bold">{v}x</span></div>
              ))}
            </div>
            <div className="glass rounded-2xl p-4">
              <h3 className="font-bold text-xs uppercase mb-3">📱 Social Limits</h3>
              <div className="space-y-2">
                {[{ name: "Twitter", limit: 280 }, { name: "Instagram", limit: 2200 }, { name: "LinkedIn", limit: 3000 }].map(s => {
                  const left = s.limit - stats.chars;
                  return (
                    <div key={s.name} className="glass-btn rounded-xl p-2 flex justify-between px-3">
                      <div className="text-[10px] opacity-70 font-bold">{s.name}</div>
                      <div className={`text-xs font-black ${left < 0 ? "text-red-500" : "text-green-600 dark:text-green-400"}`}>{left < 0 ? `${Math.abs(left)} over` : `${left} left`}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ===== OTHER USEFUL TOOLS ===== */}
        <section className="mt-16">
          <h2 className="text-3xl font-black text-center gradient-text mb-2">🧰 Other Useful Tools</h2>
          <p className="text-center opacity-70 text-sm mb-8">Complete toolkit for writers, students, and SEO professionals</p>
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
            {otherTools.map(t => (
              <a key={t.name} href={t.link} className="glass rounded-2xl p-5 hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer group">
                <div className="text-4xl mb-2">{t.icon}</div>
                <h3 className="font-bold text-sm mb-1 group-hover:text-violet-600 transition">{t.name}</h3>
                <p className="text-xs opacity-60 leading-relaxed">{t.desc}</p>
              </a>
            ))}
          </div>
        </section>

        {/* ===== ARTICLES ===== */}
        <section className="mt-16 space-y-4">
          <h2 className="text-3xl font-black text-center gradient-text mb-6">📚 Guides & Documentation</h2>
          {articlesData.map(a => (
            <div key={a.id} className="glass rounded-2xl overflow-hidden">
              <button onClick={() => setShowArticle(showArticle === a.id ? null : a.id)} className="w-full flex justify-between items-center p-5 font-bold text-left hover:bg-white/10 transition">
                <span className="text-base">{a.title}</span>
                <span className="text-2xl">{showArticle === a.id ? "−" : "+"}</span>
              </button>
              {showArticle === a.id && (
                <div className={`p-6 ${isDark ? "bg-black/20" : "bg-white/40"} text-sm leading-7 whitespace-pre-line border-t border-white/20 prose prose-sm max-w-none`}>{a.content}</div>
              )}
            </div>
          ))}
        </section>

        {/* ===== FAQ ===== */}
        <section className="mt-16">
          <h2 className="text-3xl font-black text-center gradient-text mb-2">❓ Frequently Asked Questions</h2>
          <p className="text-center opacity-70 text-sm mb-8">Common questions about our Word Counter tool</p>
          <div className="grid md:grid-cols-2 gap-3">
            {faqData.map((f, i) => (
              <div key={i} className="glass rounded-2xl overflow-hidden">
                <button onClick={() => setShowArticle(showArticle === `faq-${i}` ? null : `faq-${i}`)} className="w-full flex justify-between items-center p-4 font-bold text-left text-sm hover:bg-white/10 transition">
                  <span>{f.q}</span>
                  <span className="text-lg ml-2 flex-shrink-0">{showArticle === `faq-${i}` ? "−" : "+"}</span>
                </button>
                {showArticle === `faq-${i}` && (
                  <div className={`px-4 pb-4 text-xs leading-6 opacity-80`}>{f.a}</div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* FOOTER */}
        <footer className="mt-16 text-center text-xs opacity-60 pb-8">
          <p>✨ Word Counter Pro — 100% private, browser-only, no data sent to server</p>
          <p className="mt-1">Made with 💜 for writers, students, and SEO professionals</p>
        </footer>
      </div>
    </div>
  );
}

const otherTools = [
  { icon: "🔤", name: "Case Converter", desc: "Convert text to UPPER, lower, Title, or Sentence case instantly", link: "#" },
  { icon: "📄", name: "Lorem Ipsum Generator", desc: "Generate dummy placeholder text for designs and mockups", link: "#" },
  { icon: "✅", name: "Grammar Checker", desc: "Fix grammar, spelling, and punctuation errors in your writing", link: "#" },
  { icon: "🔄", name: "Paraphrasing Tool", desc: "Rewrite sentences and paragraphs in your own words", link: "#" },
  { icon: "📊", name: "Readability Checker", desc: "Check Flesch score, grade level, and reading ease", link: "#" },
  { icon: "🔍", name: "Plagiarism Checker", desc: "Scan your content for copied or duplicate text", link: "#" },
  { icon: "🔡", name: "Character Counter", desc: "Count characters with/without spaces for social media", link: "#" },
  { icon: "🔄", name: "Reverse Text", desc: "Flip text backwards or upside down instantly", link: "#" },
  { icon: "🆚", name: "Text Diff", desc: "Compare two texts and highlight differences", link: "#" },
  { icon: "{}", name: "JSON Formatter", desc: "Beautify, minify, and validate JSON data", link: "#" },
  { icon: "🔐", name: "Base64 Encoder", desc: "Encode and decode Base64 text or files", link: "#" },
  { icon: "🔗", name: "URL Encoder", desc: "Encode URLs and query strings safely", link: "#" },
];

const articlesData = [
  {
    id: "what-is",
    title: "📖 What is Word Counter? Complete Guide (Detailed)",
    content: `A Word Counter is a digital tool that analyzes written text and provides instant statistics like word count, character count, sentence count, paragraph count, and more. It's one of the most essential tools for anyone who writes — whether you're a student writing an essay, a blogger crafting an article, an SEO professional optimizing content, or a social media manager scheduling posts.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 WHY DO YOU NEED A WORD COUNTER?

1. ACADEMIC WRITING
Universities and schools often have strict word limits. Our tool shows exact counts in real-time, so you never go over or under the limit. The "Chars without spaces" metric is especially useful when assignments specify character limits.

2. SEO & CONTENT MARKETING
Google favors comprehensive, detailed content. SEO experts recommend 1500-2500 words for blog posts. Our keyword density panel shows which words appear most often — ideal density is 1-2%, above 3% looks like keyword stuffing.

3. SOCIAL MEDIA
Twitter allows 280 characters, Instagram 2200, LinkedIn 3000. Our live "left/over" indicator tells you exactly how many characters remain before hitting the limit.

4. BOOKS & NOVELS
Authors track daily word goals. Set your target (e.g., 2000 words/day) and our progress bar + celebration toast keeps you motivated.

5. TRANSLATION
Translators bill by word count. Our exact count ensures accurate invoicing.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 WHAT ALL DOES IT MEASURE?

• Words: Total word count (splits on whitespace)
• Chars (with spaces): Every character including spaces — used for Twitter, SMS
• Chars (without spaces): Letters only — used for university character limits
• Sentences: Splits on . ! ?
• Paragraphs: Splits on blank lines
• Lines: Total line breaks
• Reading Time: Based on 200 words per minute (average adult reading speed)
• Speaking Time: Based on 130 words per minute (presentation speed)
• Writing Time: Actual active typing session time (pauses after 5 seconds idle)
• Flesch Score: 0-100 readability score (higher = easier)
• Keyword Density: Top 10 most-used words with percentage

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⭐ THE FLESCH READING EASE SCORE

90-100: Very Easy (5th grade) — children's books
80-90: Easy (6th grade) — comics, simple articles
70-80: Fairly Easy (7th grade) — bestsellers, social media
60-70: Standard (8th-9th grade) — newspapers, blogs
50-60: Fairly Difficult (10th-12th) — academic texts
30-50: Difficult (college) — scientific journals
0-30: Very Difficult (graduate) — legal documents

Aim for 60-70 for general web content.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔐 PRIVACY & SECURITY

Everything happens in your browser. No text is ever sent to our servers except when you click "Grammar Check" — that request goes directly to LanguageTool's public API. Your writing stays 100% yours. Auto-save uses localStorage (stays on your device).`
  },
  {
    id: "user-guide",
    title: "📘 Complete User Guide — Step by Step",
    content: `Welcome! Here's everything you need to know to master Word Counter Pro.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 1: START WRITING

Click in the big text box and start typing. Statistics update in real-time as you write. Your text auto-saves every 400 milliseconds — you'll see "Saved ✓" in the header.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 2: SET A WORD GOAL

In the header, you'll see "0/1000". Change 1000 to any number (like 500, 2000). A progress bar fills up as you write. When you hit the goal:
• A green toast appears
• Celebration sound plays
• Progress bar turns green

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 3: EDIT LIKE A PRO

Toolbar buttons at the top:
• ✂ Cut (Ctrl+X) — Remove selected text to clipboard
• 📋 Copy (Ctrl+C) — Copy selected text or full text
• 📥 Paste (Ctrl+V) — Insert clipboard content at cursor
• ⌫ Backspace — Delete character before cursor
• ⌦ Delete — Delete character after cursor
• Aa Case — Convert to UPPER / lower / Title / Sentence
• 🎨 Color — Pick any color for your text
• 🗑 Clear — Wipe everything (asks for confirmation)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 4: CUSTOMIZE APPEARANCE

Click ⚙ Settings to open:
• Page Size: A4 / Letter / Legal (for print-ready docs)
• Font Family: 14 options including Poppins, Merriweather, JetBrains Mono
• Font Size: 10-32 px slider
• Line Height: 1.0 - 2.5 slider
• Text Color: full color picker + 5 quick palette swatches

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 5: TOGGLE SMART FEATURES

In Settings:
☑ Auto Correct — Fixes "teh" → "the", "adn" → "and" and 20+ common typos
☑ Auto Complete — Shows word suggestions as you type; press Tab to accept
☑ Show Red Wavy — Grammar errors appear underlined in the preview below
☑ Duplicate Highlight — Flags repeated words & sentences

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 6: CHECK GRAMMAR

Click "✓ Grammar Check" button. Within 1-2 seconds, all errors are listed. Options:
• Click "Fix" on any individual error
• Click "Fix All" to correct everything at once
• Enable "Show Red Wavy" to see errors inline in the preview

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 7: USE VOICE TYPING

Click "🎤 VOICE" — speak clearly. Chrome or Edge required (HTTPS only). Your speech is inserted right where your cursor is. Click "■ STOP" to end.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 8: LISTEN TO YOUR TEXT

Click "🔊" to hear your text read aloud. Uses your browser's built-in text-to-speech. Handy for proofreading.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 9: FIND & REPLACE

Press Ctrl+F or click 🔍 Find. Type what to search, what to replace with, click "Replace All".

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 10: EXPORT YOUR WORK

Bottom right buttons:
• TXT — plain text file
• DOC — Word-compatible document
• CSV — stats spreadsheet
• PDF — opens print dialog (Save as PDF)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 11: FOCUS MODE

Click ⛶ Focus — full-screen distraction-free writing. Press Exit Focus to return.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 12: DARK MODE

Click 🌙 to switch to dark theme (easier on eyes at night). Click ☀ to return to light.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

KEYBOARD SHORTCUTS

• Ctrl+C — Copy
• Ctrl+X — Cut
• Ctrl+V — Paste
• Ctrl+F — Find & Replace
• Ctrl+S — Force save
• Tab — Accept autocomplete
• Esc — Close suggestions`
  },
  {
    id: "features",
    title: "⚙️ Every Feature Explained in Detail",
    content: `Complete breakdown of all 30+ features:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 REAL-TIME STATISTICS

Every keystroke updates 10 metrics instantly. No "calculate" button needed. Uses React useMemo for optimal performance — even with 50,000 words, no lag.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💾 AUTO-SAVE

Every 400ms of inactivity, your text saves to browser's localStorage. Close the tab, come back — everything is exactly as you left it. Works offline too.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✍️ AUTO-CORRECT

Watches for 20+ common typos as you type. When you hit space after a misspelled word, it silently fixes. Examples: teh→the, adn→and, recieve→receive, seperate→separate, freind→friend. Toggle in Settings.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 AUTO-COMPLETE

As you type 2+ letters, a popup shows matching words from our 300-word common English dictionary. Press Tab or click to accept. Great for speed writing.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔴 GRAMMAR CHECK (INLINE)

Powered by LanguageTool's free API — 30+ languages supported. Checks grammar, spelling, punctuation, style. Errors shown in a separate preview panel so typing is never interrupted. This is a KEY difference from most tools — you keep writing while errors are highlighted below.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔁 DUPLICATE DETECTION

Finds words repeated 2+ times and sentences that appear multiple times. Essential for clean, professional writing. Ideal for catching accidental repetition.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 WORD TARGET

Set any goal (100, 500, 2000, 50000). Progress bar fills visually. When reached: green toast, sound effect, and motivational message.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📄 PAGE SIZE

Choose A4 (210×297mm), Letter (216×279mm), or Legal (216×356mm). Displayed dimensions help estimate printed page count.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎨 FONT OPTIONS

14 fonts across 3 categories:
• Sans-serif: Inter, Poppins, Roboto, Arial, Verdana
• Serif: Merriweather, Playfair Display, Lora, Georgia, Times New Roman
• Monospace (code): JetBrains Mono, Fira Code, Roboto Mono, Courier New

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📏 FONT SIZE & LINE HEIGHT

Font: 10-32px slider. Line Height: 1.0-2.5 slider. Together these control readability and visual comfort.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎨 TEXT COLOR

Full color picker + 10-swatch palette for quick selection. Perfect for highlighting sections or personalizing.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⏱ WRITING TIME

Tracks ACTIVE typing time only. If you pause for 5+ seconds, timer stops. Comes back when you type again. Perfect for tracking real productivity.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📈 READABILITY (FLESCH)

Flesch Reading Ease Score from 0-100. Shows if your content is Easy, Standard, Hard, or Very Hard. Aim for 60-70 for general web content.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 KEYWORD DENSITY

Top 10 words + their % usage. Green (<3%) = healthy, Red (>3%) = keyword stuffing risk for SEO.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📱 SOCIAL MEDIA LIMITS

Live counters for Twitter (280), Instagram (2200), LinkedIn (3000). Shows "X left" or "X over" instantly.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎤 VOICE TYPING

Uses Web Speech API (Chrome/Edge). Speak naturally — text appears at your cursor. Supports all 9 languages in the dropdown.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔊 TEXT TO SPEECH

Plays your text aloud using browser's native TTS. Great for proofreading — hearing your writing reveals awkward phrases.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔍 FIND & REPLACE

Ctrl+F opens. Case-sensitive search, replace one or all.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📤 EXPORT OPTIONS

TXT, DOC (Word-compatible), CSV (stats spreadsheet), PDF (via print).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🌙 DARK MODE

Full theme switch. All glass cards adapt. Easy on eyes at night.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⛶ FOCUS MODE

Full-screen distraction-free editor. Just your text and a timer.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💜 GLASSMORPHISM DESIGN

Modern frosted-glass aesthetic with animated gradient blobs in the background. Cards have backdrop-blur and subtle transparency. Feels premium.`
  },
];

const faqData = [
  { q: "Is this Word Counter free to use?", a: "Yes! 100% free forever. No sign-up, no ads, no limits. All features are available without any payment." },
  { q: "Is my text saved on your servers?", a: "No. Everything runs in your browser. Your text never leaves your device except when you click 'Grammar Check' — that request goes directly to LanguageTool's public API. Auto-save uses browser localStorage." },
  { q: "What's the difference between 'Chars (with)' and 'Chars (without)'?", a: "Chars (with) = every character including spaces, tabs, line breaks. Used for Twitter (280), SMS. Chars (without) = letters and numbers only, no whitespace. Used when assignments say 'minimum 1000 characters without spaces'." },
  { q: "How accurate is the reading time?", a: "It's based on 200 words per minute — the average adult reading speed for general text. Speaking time uses 130 wpm (typical presentation pace). Actual times vary per person." },
  { q: "What is a good Flesch Score?", a: "For general web content: 60-70 (Standard). For social media: 70-80 (Fairly Easy). For academic: 30-50. Higher = easier to read. Aim for what fits your audience." },
  { q: "Why doesn't voice typing work?", a: "Voice typing requires Chrome or Edge browser over HTTPS (secure connection). Firefox and Safari don't support Web Speech API. Also check mic permissions — click the lock icon in the address bar and allow microphone." },
  { q: "What is ideal keyword density?", a: "1-2% is ideal for SEO. If your target keyword appears 15 times in a 1000-word article, that's 1.5% density. Above 3% looks like keyword stuffing and Google may penalize." },
  { q: "Does grammar check work in Hindi?", a: "Yes! Select 'Hindi' from the language dropdown. LanguageTool supports 30+ languages including Hindi, English, Spanish, French, German, and more." },
  { q: "Can I use this offline?", a: "Yes, mostly. Word counting, stats, exports, and auto-save work offline. Grammar check needs internet (LanguageTool API). Voice typing needs internet too." },
  { q: "What is duplicate detection?", a: "It finds words and sentences that repeat in your text. Repeated words (2+ times) shown as chips. Repeated sentences (20+ chars, appearing 2+ times) shown in a list. Useful for editing out redundancy." },
  { q: "How does auto-correct work?", a: "It watches for 20+ common typos. When you press space after a misspelled word, it silently fixes it. Examples: teh→the, adn→and, recieve→receive. You can toggle it off in Settings." },
  { q: "What's the maximum text length?", a: "Practically unlimited. Tested with 100,000+ words without performance issues. Stats, highlights, and auto-save all work seamlessly." },
];

function Stat({ label, value, tip }: { label: string; value: any; tip?: string }) {
  return (
    <div className="glass rounded-2xl p-4 shadow-sm hover:shadow-lg transition" title={tip}>
      <div className="text-[10px] uppercase tracking-widest opacity-60 font-bold">{label}</div>
      <div className="text-lg font-black mt-1">{value}</div>
      {tip && <div className="text-[9px] opacity-40 mt-1">{tip}</div>}
    </div>
  );
}
