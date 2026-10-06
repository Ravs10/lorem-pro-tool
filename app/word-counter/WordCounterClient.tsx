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

const FILLER_WORDS = ["very","really","actually","basically","literally","just","quite","simply","totally","definitely","obviously","clearly","totally","kind of","sort of","a lot","in order to","due to the fact","at this point in time"];

const WEAK_PHRASES = ["is being","was being","has been","have been","had been","would have","could have","should have","might have","may have"];

const DICTIONARY = ["about","above","across","action","actually","added","after","again","against","almost","along","already","although","always","among","amount","another","answer","anyone","anything","appear","around","available","back","became","because","become","before","begin","behind","believe","below","better","between","beyond","bring","business","called","cannot","carry","center","certain","change","children","choose","class","clear","close","color","coming","common","company","complete","consider","continue","could","country","course","create","current","decide","describe","develop","different","difficult","direct","during","early","education","effect","either","enough","every","example","experience","family","father","feeling","figure","follow","friend","future","general","given","government","great","ground","group","growth","happen","having","heard","heavy","history","however","hundred","important","include","inside","issue","itself","knowledge","language","large","later","learn","leave","letter","level","light","little","local","machine","major","material","matter","maybe","mean","measure","medical","member","memory","message","method","middle","might","minute","modern","moment","money","month","morning","mother","mountain","music","nation","natural","nature","nearly","necessary","need","never","night","nothing","notice","number","object","occur","offer","often","order","other","paper","particular","people","perhaps","person","picture","place","plan","point","police","policy","possible","power","practice","prepare","present","president","press","pretty","prevent","private","probably","problem","process","produce","product","program","project","property","provide","public","purpose","question","quickly","quiet","rather","reach","ready","really","reason","receive","recent","recognize","record","reduce","reflect","region","relate","remain","remember","remove","report","require","research","resource","respond","result","return","right","roughly","school","science","season","second","section","seem","sense","series","serious","serve","service","several","shall","share","short","should","similar","simple","simply","since","single","situation","small","social","society","some","someone","something","sometimes","space","speak","special","spend","stand","start","state","statement","station","stay","still","story","street","strong","structure","student","study","subject","success","suddenly","suggest","summer","support","system","table","taken","teach","thing","though","thought","thousand","through","throughout","together","tomorrow","tonight","total","toward","town","trade","training","travel","treatment","trouble","truth","understand","until","usually","value","various","victim","video","village","visit","voice","watch","water","weapon","weather","week","weight","welcome","western","whatever","whenever","wherever","whether","which","while","white","whole","whose","window","within","without","woman","wonder","world","worry","would","write","writer","wrong","year","young","yourself"];

const SAMPLE = `Word Counter is a powerful tool that counts words, characters, sentences, and paragraphs in real-time. It helps writers, students, and SEO professionals track their content length and readability.`;

const CONTENT_TYPES = [
  { name: "Blog Post", icon: "📝", recommended: "1,500 - 2,500 words", ideal: 2000, purpose: "SEO ranking & reader engagement" },
  { name: "Essay", icon: "📚", recommended: "500 - 1,500 words", ideal: 1000, purpose: "Academic assignments & school work" },
  { name: "Assignment", icon: "📄", recommended: "250 - 1,000 words", ideal: 500, purpose: "Homework & coursework" },
  { name: "YouTube Description", icon: "▶️", recommended: "150 - 300 words", ideal: 200, purpose: "SEO & viewer info (5000 char max)" },
  { name: "Social Media Post", icon: "📱", recommended: "10 - 100 words", ideal: 50, purpose: "Engagement on Twitter/Instagram/LinkedIn" },
  { name: "Product Description", icon: "🛍️", recommended: "100 - 300 words", ideal: 150, purpose: "E-commerce conversion" },
  { name: "News Article", icon: "📰", recommended: "400 - 800 words", ideal: 600, purpose: "Journalism & reporting" },
  { name: "Email", icon: "✉️", recommended: "50 - 200 words", ideal: 100, purpose: "Business or personal communication" },
  { name: "Academic Paper", icon: "🎓", recommended: "3,000 - 8,000 words", ideal: 5000, purpose: "Research & journals" },
];

const SOCIAL_PLATFORMS = [
  { name: "Instagram Caption", icon: "📷", limit: 2200, recommended: 125, hint: "First 125 chars visible before 'more'" },
  { name: "Facebook Post", icon: "👥", limit: 63206, recommended: 80, hint: "Short posts get 66% more engagement" },
  { name: "X / Twitter Post", icon: "🐦", limit: 280, recommended: 240, hint: "Leave room for hashtags & links" },
  { name: "LinkedIn Post", icon: "💼", limit: 3000, recommended: 1300, hint: "First 1300 chars visible before 'see more'" },
  { name: "YouTube Title", icon: "▶️", limit: 100, recommended: 60, hint: "Mobile shows only ~60 chars" },
  { name: "YouTube Description", icon: "📹", limit: 5000, recommended: 300, hint: "First 200 words most important for SEO" },
];

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
const formatMinSec = (totalSeconds: number) => {
  if (totalSeconds < 60) return `${totalSeconds} sec`;
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return s > 0 ? `${m} min ${s} sec` : `${m} min`;
};

// Animated counter hook
const useAnimatedNumber = (target: number, duration = 500) => {
  const [value, setValue] = useState(target);
  const startRef = useRef(target);
  const rafRef = useRef<number | null>(null);
  useEffect(() => {
    const start = startRef.current;
    const end = target;
    if (start === end) return;
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const cur = Math.round(start + (end - start) * eased);
      setValue(cur);
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
      else { setValue(end); startRef.current = end; }
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration]);
  return value;
};

const AnimatedCounter = ({ value, className }: { value: number; className?: string }) => {
  const animated = useAnimatedNumber(value);
  return <span className={className}>{animated.toLocaleString()}</span>;
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
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [autoCorrect, setAutoCorrect] = useState(true);
  const [autoComplete, setAutoComplete] = useState(true);
  const [duplicateHighlight, setDuplicateHighlight] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [goalReached, setGoalReached] = useState(false);
  const [writingTime, setWritingTime] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [activeToolTab, setActiveToolTab] = useState<string>("suggested");
  const [activeSuggestedTool, setActiveSuggestedTool] = useState<string>("char");
  const [readingSpeed, setReadingSpeed] = useState<"slow" | "average" | "fast" | "custom">("average");
  const [customReadingWPM, setCustomReadingWPM] = useState(200);
  const [speakingWPM, setSpeakingWPM] = useState(130);
  const [academicLimit, setAcademicLimit] = useState(1500);
  const [academicType, setAcademicType] = useState("Essay");
  const [activeSocial, setActiveSocial] = useState("Instagram Caption");
  const [socialText, setSocialText] = useState("");

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
        if (c.readingSpeed) setReadingSpeed(c.readingSpeed);
        if (c.customReadingWPM) setCustomReadingWPM(c.customReadingWPM);
        if (c.speakingWPM) setSpeakingWPM(c.speakingWPM);
      } catch {}
    }
  }, []);

  // -------- AUTO SAVE --------
  useEffect(() => {
    setSaveStatus("saving");
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      safeSet("lorem_word_text", text);
      safeSet("lorem_cfg", JSON.stringify({ font, fontSize, lineHeight, color, pageSize, goal, dark: isDark, lang, autoCorrect, autoComplete, readingSpeed, customReadingWPM, speakingWPM }));
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 1200);
    }, 400);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [text, font, fontSize, lineHeight, color, pageSize, goal, isDark, lang, autoCorrect, autoComplete, readingSpeed, customReadingWPM, speakingWPM]);

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

  const effectiveReadingWPM = readingSpeed === "slow" ? 100 : readingSpeed === "fast" ? 300 : readingSpeed === "custom" ? customReadingWPM : 200;

  // -------- STATS --------
  const stats = useMemo(() => {
    const trimmed = text.trim();
    const words = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
    const chars = text.length;
    const charsNoSpace = text.replace(/\s/g, "").length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length || 0;
    const paras = text.split(/\n+/).filter(p => p.trim().length > 0).length;
    const lines = text ? text.split(/\n/).length : 0;
    const readingSeconds = Math.round((words / effectiveReadingWPM) * 60);
    const speakingSeconds = Math.round((words / Math.max(1, speakingWPM)) * 60);
    const readingTime = Math.ceil(words / effectiveReadingWPM);
    const speakingTime = Math.ceil(words / Math.max(1, speakingWPM));
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
    // Sentence length distribution
    const sentArr = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
    const sentLens = sentArr.map(s => s.split(/\s+/).length);
    const short = sentLens.filter(l => l <= 10).length;
    const medium = sentLens.filter(l => l > 10 && l <= 20).length;
    const long = sentLens.filter(l => l > 20).length;
    return { words, chars, charsNoSpace, sentences, paras, lines, readingTime, speakingTime, readingSeconds, speakingSeconds, flesch, level, top10, density, short, medium, long, totalSent: sentArr.length };
  }, [text, effectiveReadingWPM, speakingWPM]);

  const duplicates = useMemo(() => {
    const trimmed = text.trim();
    if (!trimmed) return { words: [], sentences: [], lines: [] };
    const words = trimmed.toLowerCase().split(/\s+/).map(w => w.replace(/[^a-z0-9]/g, "")).filter(w => w.length > 3);
    const wc: Record<string, number> = {};
    words.forEach(w => { wc[w] = (wc[w] || 0) + 1; });
    const dupWords = Object.entries(wc).filter(([, c]) => c > 1).sort((a, b) => b[1] - a[1]).slice(0, 20);
    const sentences = text.split(/[.!?]+/).map(s => s.trim().toLowerCase()).filter(s => s.length > 20);
    const sc: Record<string, number> = {};
    sentences.forEach(s => { sc[s] = (sc[s] || 0) + 1; });
    const dupSentences = Object.entries(sc).filter(([, c]) => c > 1).map(([s, c]) => ({ text: s.slice(0, 80), count: c }));
    // Duplicate lines
    const lines = text.split(/\n/).map(l => l.trim()).filter(l => l.length > 5);
    const lc: Record<string, number> = {};
    lines.forEach(l => { lc[l.toLowerCase()] = (lc[l.toLowerCase()] || 0) + 1; });
    const dupLines = Object.entries(lc).filter(([, c]) => c > 1).map(([l, c]) => ({ text: l.slice(0, 80), count: c }));
    return { words: dupWords, sentences: dupSentences, lines: dupLines };
  }, [text]);

  const progress = goal > 0 ? Math.min(100, Math.round((stats.words / goal) * 100)) : 0;

  useEffect(() => {
    if (stats.words >= goal && goal > 0 && !goalReached) {
      setGoalReached(true);
      setShowConfetti(true);
      setToast(`🎉 Goal Reached! ${stats.words}/${goal} words`);
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator(); const g = ctx.createGain();
        osc.connect(g); g.connect(ctx.destination);
        osc.frequency.value = 880; g.gain.value = 0.08;
        osc.start(); osc.stop(ctx.currentTime + 0.15);
        setTimeout(() => {
          const o2 = ctx.createOscillator(); const g2 = ctx.createGain();
          o2.connect(g2); g2.connect(ctx.destination);
          o2.frequency.value = 1320; g2.gain.value = 0.08;
          o2.start(); o2.stop(ctx.currentTime + 0.2);
        }, 150);
      } catch {}
      setTimeout(() => setToast(null), 4000);
      setTimeout(() => setShowConfetti(false), 3500);
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
        body: `text=${encodeURIComponent(text)}&language=${lang}&level=picky`,
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

  // -------- INPUT --------
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

  // -------- EDIT OPS --------
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

  const handleClear = () => { if (!text) return; if (!confirm("Clear all text? This cannot be undone.")) return; setText(""); setErrors([]); setWritingTime(0); };

  const handleCopyStats = async () => {
    const s = `Words: ${stats.words} | Chars(with): ${stats.chars} | Chars(without): ${stats.charsNoSpace} | Sentences: ${stats.sentences} | Paragraphs: ${stats.paras} | Lines: ${stats.lines} | Reading: ${formatMinSec(stats.readingSeconds)} | Speaking: ${formatMinSec(stats.speakingSeconds)} | Writing: ${formatTime(writingTime)} | Flesch: ${stats.flesch} (${stats.level})`;
    try { await navigator.clipboard.writeText(s); setCopiedStats(true); setTimeout(() => setCopiedStats(false), 1500); } catch {}
  };

  const exportTxt = () => { const b = new Blob([text], { type: "text/plain" }); const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = "doc.txt"; a.click(); URL.revokeObjectURL(a.href); };
  const exportDoc = () => { const b = new Blob([`<html><body><pre>${escapeHtml(text)}</pre></body></html>`], { type: "application/msword" }); const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = "doc.doc"; a.click(); URL.revokeObjectURL(a.href); };
  const exportPdf = () => { const w = window.open("", "_blank"); if (w) { w.document.write(`<pre style="white-space:pre-wrap;font-family:${FONTS.find(f => f.name === font)?.css};font-size:${fontSize}px;line-height:${lineHeight};padding:24px">${escapeHtml(text)}</pre>`); w.document.close(); w.print(); } };
  const exportCsv = () => {
    const rows = [["Metric","Value"],["Words",stats.words],["Chars (with)",stats.chars],["Chars (without)",stats.charsNoSpace],["Sentences",stats.sentences],["Paragraphs",stats.paras],["Lines",stats.lines],["Reading Time",formatMinSec(stats.readingSeconds)],["Speaking Time",formatMinSec(stats.speakingSeconds)],["Writing Time",formatTime(writingTime)],["Flesch Score",stats.flesch],["Level",stats.level]];
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
    else if (mode === "capitalize") out = text.replace(/\b\w/g, c => c.toUpperCase());
    else if (mode === "toggle") out = text.split("").map(c => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()).join("");
    setText(out);
  };

  const doReplace = () => {
    if (!findText) return;
    try {
      const flags = caseSensitive ? "g" : "gi";
      let pattern = findText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      if (wholeWord) pattern = `\\b${pattern}\\b`;
      const re = new RegExp(pattern, flags);
      const out = text.replace(re, replaceText);
      setText(out);
      setToast("✓ Replaced all matches");
      setTimeout(() => setToast(null), 1800);
    } catch {
      setText(text.split(findText).join(replaceText));
    }
  };

  // ====== SUGGESTED TOOLS ======
  const cleanExtraSpaces = () => setText(t => t.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim());
  const removeBlankLines = () => setText(t => t.split(/\n/).filter(l => l.trim().length > 0).join("\n"));
  const removeDupLines = () => {
    const seen = new Set<string>();
    setText(t => t.split(/\n/).filter(l => { const k = l.trim().toLowerCase(); if (!k || seen.has(k)) return false; seen.add(k); return true; }).join("\n"));
  };
  const removeDupSentences = () => {
    const seen = new Set<string>();
    setText(t => t.split(/(?<=[.!?])\s+/).filter(s => { const k = s.trim().toLowerCase(); if (!k || seen.has(k)) return false; seen.add(k); return true; }).join(" "));
  };
  const normalizePunctuation = () => setText(t => t.replace(/\s+([,.!?;:])/g, "$1").replace(/([,.!?;:])(?=\S)/g, "$1 ").replace(/\s+/g, " ").trim());
  const removeSpecialChars = () => setText(t => t.replace(/[^\w\s.,!?'"\-()]/g, ""));
  const removeNumbers = () => setText(t => t.replace(/\d+/g, ""));
  const removeHtmlTags = () => setText(t => t.replace(/<[^>]*>/g, ""));

  const toSlug = () => setText(t => t.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-"));
  const toCommaSeparated = () => setText(t => t.split(/[\n,]+/).map(x => x.trim()).filter(Boolean).join(", "));
  const toLineSeparated = () => setText(t => t.split(/[,\n]+/).map(x => x.trim()).filter(Boolean).join("\n"));
  const toPlainText = () => setText(t => t.replace(/\s+/g, " ").trim());
  const toJsonSafe = () => setText(t => JSON.stringify(t).slice(1, -1));

  const sortAZ = () => setText(t => t.split(/\n/).sort((a, b) => a.localeCompare(b)).join("\n"));
  const sortZA = () => setText(t => t.split(/\n/).sort((a, b) => b.localeCompare(a)).join("\n"));
  const sortByLength = () => setText(t => t.split(/\n/).sort((a, b) => a.length - b.length).join("\n"));
  const sortByWordCount = () => setText(t => t.split(/\n/).sort((a, b) => a.split(/\s+/).length - b.split(/\s+/).length).join("\n"));

  const reverseChars = () => setText(t => t.split("").reverse().join(""));
  const reverseWords = () => setText(t => t.split(/\s+/).reverse().join(" "));
  const reverseLines = () => setText(t => t.split(/\n/).reverse().join("\n"));

  const trimLeading = () => setText(t => t.split(/\n/).map(l => l.replace(/^\s+/, "")).join("\n"));
  const trimTrailing = () => setText(t => t.split(/\n/).map(l => l.replace(/\s+$/, "")).join("\n"));
  const collapseSpaces = () => setText(t => t.replace(/[ \t]+/g, " "));
  const tabsToSpaces = () => setText(t => t.replace(/\t/g, "    "));

  // ====== TEXT QUALITY ANALYZER ======
  const quality = useMemo(() => {
    const trimmed = text.trim();
    const words = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
    const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
    const longSentences = sentences.filter(s => s.split(/\s+/).length > 25).length;
    const paragraphs = text.split(/\n+/).map(p => p.trim()).filter(p => p.length > 0);
    const veryLongParas = paragraphs.filter(p => p.split(/\s+/).length > 150).length;
    const fillerCount = FILLER_WORDS.reduce((acc, fw) => {
      const re = new RegExp(`\\b${fw}\\b`, "gi");
      return acc + ((text.match(re) || []).length);
    }, 0);
    const weakCount = WEAK_PHRASES.reduce((acc, wp) => {
      const re = new RegExp(wp.replace(/\s+/g, "\\s+"), "gi");
      return acc + ((text.match(re) || []).length);
    }, 0);
    const excessivePunct = (text.match(/[!?]{2,}/g) || []).length + (text.match(/\.{4,}/g) || []).length;
    const multipleSpaces = (text.match(/ {2,}/g) || []).length;
    const allCapsWords = (trimmed.match(/\b[A-Z]{3,}\b/g) || []).length;
    const dupWordCount = duplicates.words.length;
    const dupSentenceCount = duplicates.sentences.length;
    return { words, longSentences, veryLongParas, fillerCount, weakCount, excessivePunct, multipleSpaces, allCapsWords, dupWordCount, dupSentenceCount };
  }, [text, duplicates]);

  const qualityLabel = (condition: boolean, warnThreshold: boolean = false): { label: string; color: string } => {
    if (!condition) return { label: "Good", color: "text-green-600 dark:text-green-400" };
    if (warnThreshold) return { label: "Improve", color: "text-red-600 dark:text-red-400" };
    return { label: "Needs Attention", color: "text-orange-600 dark:text-orange-400" };
  };

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
  const activeSocialData = SOCIAL_PLATFORMS.find(s => s.name === activeSocial) || SOCIAL_PLATFORMS[0];
  const socialStats = useMemo(() => {
    const t = socialText;
    const chars = t.length;
    const words = t.trim() ? t.trim().split(/\s+/).filter(Boolean).length : 0;
    const remaining = activeSocialData.limit - chars;
    const progressPct = Math.min(100, Math.round((chars / activeSocialData.limit) * 100));
    const recommendedPct = Math.min(100, Math.round((chars / activeSocialData.recommended) * 100));
    return { chars, words, remaining, progressPct, recommendedPct };
  }, [socialText, activeSocialData]);

  const bgDecor = (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full opacity-40 blur-3xl animate-pulse" style={{ background: "radial-gradient(circle, #a855f7, transparent 70%)" }} />
      <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] rounded-full opacity-30 blur-3xl animate-pulse" style={{ background: "radial-gradient(circle, #ec4899, transparent 70%)", animationDelay: "1s" }} />
      <div className="absolute -bottom-40 left-1/3 w-[500px] h-[500px] rounded-full opacity-30 blur-3xl animate-pulse" style={{ background: "radial-gradient(circle, #06b6d4, transparent 70%)", animationDelay: "2s" }} />
    </div>
  );

  if (isFocus) {
    return (
      <div className={`min-h-screen relative ${isDark ? "bg-[#0a0a1a] text-white" : "bg-gradient-to-br from-violet-50 via-pink-50 to-cyan-50 text-black"} p-4 sm:p-8`}>
        {bgDecor}
        <div className="max-w-3xl mx-auto relative">
          <div className="flex justify-between mb-6 flex-wrap gap-2">
            <button onClick={() => setIsFocus(false)} className="px-4 py-2 glass-btn rounded-xl text-sm font-bold">← Exit Focus</button>
            <span className="text-sm opacity-60">{stats.words} words • {formatTime(writingTime)} • {autoLang}</span>
          </div>
          <div className="glass rounded-3xl p-6">
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
        .glass-btn{backdrop-filter:blur(12px);background:${isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.65)"};border:1px solid ${isDark ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.9)"};transition:all 0.25s cubic-bezier(0.4,0,0.2,1);position:relative;overflow:hidden}
        .glass-btn:hover{transform:translateY(-2px) scale(1.02);box-shadow:0 12px 24px rgba(139,92,246,0.25);background:${isDark ? "rgba(168,85,247,0.18)" : "rgba(255,255,255,0.85)"}}
        .glass-btn:active{transform:translateY(0) scale(0.98)}
        textarea{resize:none}
        textarea:focus{outline:none}
        @keyframes shimmer{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
        @keyframes popIn{0%{transform:scale(0.4);opacity:0}60%{transform:scale(1.15)}100%{transform:scale(1);opacity:1}}
        @keyframes slideDown{from{opacity:0;max-height:0;transform:translateY(-8px)}to{opacity:1;max-height:1200px;transform:translateY(0)}}
        @keyframes confettiFall{0%{transform:translateY(-20px) rotate(0deg);opacity:1}100%{transform:translateY(100vh) rotate(720deg);opacity:0}}
        @keyframes checkPop{0%{transform:scale(0)}50%{transform:scale(1.3)}100%{transform:scale(1)}}
        @keyframes barShine{0%{background-position:-200% 0}100%{background-position:200% 0}}
        @keyframes glowPulse{0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,0.4)}50%{box-shadow:0 0 0 12px rgba(34,197,94,0)}}
        .gradient-text{background:linear-gradient(90deg,#a855f7,#ec4899,#06b6d4);background-size:200% auto;animation:shimmer 4s linear infinite;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
        .anim-pop{animation:popIn 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards}
        .anim-slide{animation:slideDown 0.35s ease-out forwards;overflow:hidden}
        .btn-shine::before{content:'';position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent);transition:left 0.5s}
        .btn-shine:hover::before{left:100%}
        .progress-bar{background-size:200% 100%;animation:barShine 2s linear infinite}
        .celebrate{animation:glowPulse 1.5s ease-in-out infinite}
        .tooltip-parent{position:relative}
        .tooltip-parent:hover .tooltip-box{opacity:1;visibility:visible;transform:translateX(-50%) translateY(-6px)}
        .tooltip-box{opacity:0;visibility:hidden;position:absolute;bottom:100%;left:50%;transform:translateX(-50%) translateY(0);background:rgba(17,24,39,0.95);color:#fff;padding:6px 10px;border-radius:8px;font-size:11px;white-space:nowrap;z-index:100;transition:all 0.2s;pointer-events:none}
        .confetti-piece{position:fixed;width:10px;height:10px;top:-20px;animation:confettiFall 3s linear forwards;z-index:100;pointer-events:none}
        .accordion-content{overflow:hidden;transition:max-height 0.4s cubic-bezier(0.4,0,0.2,1),padding 0.3s;max-height:0}
        .accordion-content.open{max-height:6000px}
        .tab-btn{transition:all 0.25s}
        .tab-btn.active{background:linear-gradient(135deg,#a855f7,#ec4899);color:#fff;box-shadow:0 8px 20px rgba(168,85,247,0.35)}
        .tool-row{transition:all 0.2s;cursor:pointer}
        .tool-row:hover{background:rgba(168,85,247,0.08);transform:translateX(4px)}
        @media (max-width:640px){.hide-mobile{display:none}}
      `}</style>

      {toast && (<div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-2xl shadow-2xl font-bold anim-pop max-w-[90vw] text-center">{toast}</div>)}

      {/* CONFETTI */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-40">
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={i} className="confetti-piece" style={{
              left: `${Math.random() * 100}%`,
              background: ["#a855f7","#ec4899","#06b6d4","#f59e0b","#10b981","#ef4444"][i % 6],
              animationDelay: `${Math.random() * 0.6}s`,
              animationDuration: `${2 + Math.random() * 1.5}s`,
              borderRadius: Math.random() > 0.5 ? "50%" : "2px",
            }} />
          ))}
        </div>
      )}

      <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-8 relative">
        {/* HEADER */}
        <div className="text-center mb-6">
          <div className="inline-flex px-4 py-1.5 rounded-full glass-btn text-[11px] tracking-widest mb-3 font-bold">✨ PROFESSIONAL EDITION · 40+ TOOLS · ANIMATED UI</div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black gradient-text">Word Counter Pro</h1>
          <p className="mt-2 opacity-70 text-xs sm:text-sm">Complete writing studio with real-time stats, 40+ tools, and grammar check</p>
          <div className="flex justify-center gap-2 mt-4 flex-wrap items-center">
            <select value={lang} onChange={e => setLang(e.target.value)} className="h-9 rounded-xl glass-btn px-3 text-xs sm:text-sm font-bold">{LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.flag} {l.label}</option>)}</select>
            <span className="text-[10px] sm:text-xs px-3 py-1.5 rounded-full bg-gradient-to-r from-violet-600 to-pink-600 text-white font-bold">{autoLang}</span>
            <span className="text-xs sm:text-sm opacity-70">{stats.words}/{goal} • {progress}%</span>
            <span className={`text-[10px] sm:text-xs px-2 py-1.5 rounded-full ${saveStatus === "saved" ? "bg-green-500/20 text-green-700 dark:text-green-300" : "glass-btn"}`}>{saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "Saved ✓" : "Auto-save"}</span>
            <span className={`text-[10px] sm:text-xs px-2 py-1.5 rounded-full ${isActive ? "bg-blue-500/20 text-blue-700 dark:text-blue-300" : "glass-btn"}`}>⏱ {formatTime(writingTime)}</span>
          </div>
          <div className="flex justify-center items-center gap-3 mt-3">
            <div className={`max-w-md w-full h-2.5 bg-white/40 dark:bg-white/10 rounded-full overflow-hidden ${goalReached ? "celebrate" : ""}`}>
              <div style={{ width: `${progress}%` }} className={`h-full transition-all duration-700 ease-out progress-bar ${progress >= 100 ? "bg-gradient-to-r from-green-400 to-emerald-500" : "bg-gradient-to-r from-violet-500 via-pink-500 to-cyan-500"}`} />
            </div>
            <span className="text-xs font-bold">{stats.words}/{goal}</span>
            <input type="number" min={1} value={goal} onChange={e => setGoal(Math.max(1, parseInt(e.target.value) || 1))} className="w-20 h-7 text-xs px-2 rounded-lg glass-btn" />
          </div>
        </div>

        {/* TOOLBAR ROW 1 - EDIT OPERATIONS (STICKY) */}
        <div className="glass rounded-2xl p-2 sm:p-3 mb-3 flex flex-wrap gap-1.5 items-center justify-between sticky top-2 z-20">
          <div className="flex gap-1 flex-wrap items-center">
            <div className="tooltip-parent"><button onClick={handleCut} className="h-9 px-3 rounded-lg glass-btn text-xs font-bold btn-shine">✂ Cut</button><span className="tooltip-box">Cut selected text</span></div>
            <div className="tooltip-parent"><button onClick={handleCopy} className={`h-9 px-3 rounded-lg glass-btn text-xs font-bold btn-shine ${copied ? "bg-green-500 text-white" : ""}`}>{copied ? "✓ Copied!" : "📋 Copy"}</button><span className="tooltip-box">Copy selection or all</span></div>
            <div className="tooltip-parent"><button onClick={handlePaste} className="h-9 px-3 rounded-lg glass-btn text-xs font-bold btn-shine">📥 Paste</button><span className="tooltip-box">Paste at cursor</span></div>
            <div className="tooltip-parent hidden sm:block"><button onClick={handleBackspace} className="h-9 px-3 rounded-lg glass-btn text-xs font-bold btn-shine">⌫</button><span className="tooltip-box">Backspace</span></div>
            <div className="tooltip-parent hidden sm:block"><button onClick={handleDeleteKey} className="h-9 px-3 rounded-lg bg-red-500/20 text-red-700 dark:text-red-300 text-xs font-bold border border-red-300/40 btn-shine">⌦</button><span className="tooltip-box">Delete forward</span></div>
            <div className="w-px h-6 bg-white/30 mx-1 hidden sm:block" />
            <select onChange={e => { changeCase(e.target.value); e.target.value = ""; }} className="h-9 rounded-lg glass-btn px-2 text-xs font-bold">
              <option value="">Aa Case ▾</option>
              <option value="upper">UPPER</option>
              <option value="lower">lower</option>
              <option value="title">Title Case</option>
              <option value="sentence">Sentence case</option>
              <option value="capitalize">Capitalize Each Word</option>
              <option value="toggle">Toggle Case</option>
            </select>
            <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-9 h-9 rounded-lg glass-btn p-1 cursor-pointer" title="Text Color" />
            <div className="hidden sm:flex gap-1">
              {COLOR_PALETTE.slice(1, 6).map(c => (<button key={c} onClick={() => setColor(c)} className="w-6 h-6 rounded-full border-2 border-white/50 hover:scale-125 transition-transform" style={{ background: c }} title={c} />))}
            </div>
            <button onClick={handleClear} className="h-9 px-3 rounded-lg bg-red-500/20 text-red-700 dark:text-red-300 text-xs font-bold border border-red-300/40 btn-shine">🗑 Clear</button>
          </div>
          <div className="flex gap-1.5 flex-wrap items-center">
            <button onClick={() => setShowFind(v => !v)} className="h-9 px-3 rounded-xl glass-btn text-xs font-bold btn-shine">🔍 Find</button>
            <button onClick={() => setShowSettings(v => !v)} className="h-9 px-3 rounded-xl glass-btn text-xs font-bold btn-shine">⚙ Settings</button>
            <button onClick={toggleVoice} type="button" className={`h-10 px-4 sm:px-5 rounded-xl text-xs font-black border-2 shadow cursor-pointer transition btn-shine ${isListening ? "bg-red-500 text-white border-red-500 animate-pulse" : "bg-gradient-to-r from-violet-600 to-pink-600 text-white border-transparent hover:shadow-lg"}`}>{isListening ? "■ STOP" : "🎤 VOICE"}</button>
            <button onClick={toggleSpeak} className={`h-9 px-3 rounded-xl text-xs font-bold border btn-shine ${isSpeaking ? "bg-red-500 text-white border-red-500" : "glass-btn"}`}>{isSpeaking ? "■" : "🔊"}</button>
            <button onClick={share} className="h-9 px-3 rounded-xl glass-btn text-xs font-bold btn-shine">↗</button>
            <button onClick={() => setIsFocus(true)} className="h-9 px-3 rounded-xl bg-black/80 text-white text-xs font-bold btn-shine">⛶</button>
            <button onClick={() => setIsDark(!isDark)} className="h-9 px-3 rounded-xl glass-btn text-xs font-bold btn-shine">{isDark ? "☀" : "🌙"}</button>
          </div>
        </div>

        {/* SETTINGS PANEL */}
        {showSettings && (
          <div className="glass rounded-2xl p-4 mb-3 grid md:grid-cols-4 gap-3 anim-slide">
            <div>
              <label className="text-[10px] uppercase opacity-60 font-bold">Page Size</label>
              <select value={pageSize} onChange={e => setPageSize(e.target.value)} className="w-full h-9 rounded-lg glass-btn px-2 text-sm border mt-1">{Object.entries(PAGE_SIZES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select>
            </div>
            <div>
              <label className="text-[10px] uppercase opacity-60 font-bold">Font Family</label>
              <select value={font} onChange={e => setFont(e.target.value)} className="w-full h-9 rounded-lg glass-btn px-2 text-sm border mt-1">{FONTS.map(f => <option key={f.name} value={f.name}>{f.name}{f.mono ? " (mono)" : ""}</option>)}</select>
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
            <div className="md:col-span-4 flex flex-wrap gap-4 pt-2 border-t border-white/30">
              <div>
                <label className="text-[10px] uppercase opacity-60 font-bold block mb-1">Reading Speed</label>
                <div className="flex gap-1">
                  {["slow","average","fast","custom"].map(s => (
                    <button key={s} onClick={() => setReadingSpeed(s as any)} className={`text-xs px-3 py-1.5 rounded-lg ${readingSpeed === s ? "bg-gradient-to-r from-violet-600 to-pink-600 text-white" : "glass-btn"} font-bold capitalize`}>{s}</button>
                  ))}
                </div>
              </div>
              {readingSpeed === "custom" && (
                <div>
                  <label className="text-[10px] uppercase opacity-60 font-bold block mb-1">Custom WPM</label>
                  <input type="number" min={50} max={1000} value={customReadingWPM} onChange={e => setCustomReadingWPM(Math.max(50, parseInt(e.target.value) || 200))} className="w-24 h-8 text-xs px-2 rounded-lg glass-btn" />
                </div>
              )}
              <div>
                <label className="text-[10px] uppercase opacity-60 font-bold block mb-1">Speaking WPM</label>
                <input type="number" min={50} max={300} value={speakingWPM} onChange={e => setSpeakingWPM(Math.max(50, parseInt(e.target.value) || 130))} className="w-24 h-8 text-xs px-2 rounded-lg glass-btn" />
              </div>
              <span className="text-xs opacity-60 ml-auto">Reading: {effectiveReadingWPM} wpm • Speaking: {speakingWPM} wpm</span>
            </div>
          </div>
        )}

        {/* FIND & REPLACE */}
        {showFind && (
          <div className="glass rounded-2xl p-3 mb-3 flex gap-2 items-center flex-wrap anim-slide">
            <input value={findText} onChange={e => setFindText(e.target.value)} placeholder="Find..." className="h-9 px-3 rounded-lg glass-btn text-sm flex-1 min-w-[140px]" />
            <input value={replaceText} onChange={e => setReplaceText(e.target.value)} placeholder="Replace with..." className="h-9 px-3 rounded-lg glass-btn text-sm flex-1 min-w-[140px]" />
            <label className="flex items-center gap-1 text-xs cursor-pointer"><input type="checkbox" checked={caseSensitive} onChange={e => setCaseSensitive(e.target.checked)} /> Aa</label>
            <label className="flex items-center gap-1 text-xs cursor-pointer"><input type="checkbox" checked={wholeWord} onChange={e => setWholeWord(e.target.checked)} /> Whole</label>
            <button onClick={doReplace} disabled={!findText} className="h-9 px-4 rounded-lg bg-gradient-to-r from-violet-600 to-pink-600 text-white text-sm font-bold disabled:opacity-40 btn-shine">Replace All</button>
            <button onClick={() => setShowFind(false)} className="h-9 px-3 rounded-lg glass-btn text-sm">✕</button>
          </div>
        )}

        {/* ACTION BAR */}
        <div className="flex gap-2 mb-4 justify-between flex-wrap">
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => { checkGrammar(); setShowHighlight(true); }} className="text-xs px-3 py-1.5 rounded-full bg-gradient-to-r from-violet-600 to-pink-600 text-white font-bold btn-shine">{checking ? "Checking..." : "✓ Grammar Check"}</button>
            {errors.length > 0 && (<button onClick={fixAll} className="text-xs px-3 py-1.5 rounded-full bg-green-500 text-white font-bold btn-shine">⚡ Fix All ({errors.length})</button>)}
            <button onClick={handleCopyStats} className="text-xs px-3 py-1.5 rounded-full glass-btn font-bold btn-shine">{copiedStats ? "✓ Copied!" : "⎙ Copy Stats"}</button>
            <button onClick={loadSample} className="text-xs px-3 py-1.5 rounded-full glass-btn font-bold btn-shine">📄 Sample</button>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={exportTxt} className="text-xs px-3 py-1.5 rounded-full glass-btn font-bold btn-shine">TXT</button>
            <button onClick={exportDoc} className="text-xs px-3 py-1.5 rounded-full glass-btn font-bold btn-shine">DOC</button>
            <button onClick={exportCsv} className="text-xs px-3 py-1.5 rounded-full glass-btn font-bold btn-shine">CSV</button>
            <button onClick={exportPdf} className="text-xs px-3 py-1.5 rounded-full bg-black text-white font-bold btn-shine">PDF</button>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="glass rounded-3xl p-3 relative">
              <div className="px-3 py-1.5 text-[10px] opacity-60 flex justify-between flex-wrap gap-1">
                <span>📄 {page.label} • {fontSize}px • LH {lineHeight} • {currentFont.name}</span>
                <span>{currentFont.mono ? "🔤 Mono" : "🔡 Prop"}</span>
              </div>
              <textarea ref={textareaRef} value={text} onChange={handleInput}
                placeholder="Yahan type karo... Auto-save चालू है। Grammar check automatic होगा।"
                className={`w-full min-h-[400px] sm:min-h-[480px] p-4 sm:p-6 rounded-2xl ${isDark ? "bg-black/30" : "bg-white/60"} outline-none border-0 backdrop-blur-sm`}
                style={{ fontFamily: currentFont.css, fontSize: `${fontSize}px`, lineHeight, color: isDark ? "#f3f4f6" : color }}
              />
              {suggestions.length > 0 && (
                <div className="absolute bottom-20 left-4 sm:left-8 glass rounded-xl shadow-2xl text-sm overflow-hidden z-30 anim-pop">
                  {suggestions.map((s, i) => (
                    <button key={s.word} onClick={() => insertSuggestion(s)} className={`block w-full text-left px-4 py-1.5 hover:bg-violet-500/20 ${i === 0 ? "bg-violet-500/10 font-bold" : ""}`}>
                      {s.word} {i === 0 && <span className="text-[10px] opacity-50 ml-2">Tab</span>}
                    </button>
                  ))}
                </div>
              )}
              <div className="px-3 py-2 text-[11px] opacity-60 flex justify-between flex-wrap gap-1">
                <span>✅ Cursor stable • {autoLang}</span>
                <span>{isActive ? "🟢 Active" : "⚪ Idle"} • ⏱ {formatTime(writingTime)}</span>
              </div>
            </div>

            {/* READING & SPEAKING ANALYSIS */}
            <div className="glass rounded-3xl p-4 mt-4">
              <h3 className="font-bold text-xs uppercase mb-3">⏱ Reading & Speaking Analysis</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="glass-btn rounded-xl p-3 text-center">
                  <div className="text-[10px] uppercase opacity-60 font-bold">Reading Time</div>
                  <div className="text-lg font-black mt-1 gradient-text">{formatMinSec(stats.readingSeconds)}</div>
                  <div className="text-[10px] opacity-50 mt-1">{effectiveReadingWPM} wpm • {readingSpeed}</div>
                </div>
                <div className="glass-btn rounded-xl p-3 text-center">
                  <div className="text-[10px] uppercase opacity-60 font-bold">Speaking Time</div>
                  <div className="text-lg font-black mt-1 gradient-text">{formatMinSec(stats.speakingSeconds)}</div>
                  <div className="text-[10px] opacity-50 mt-1">{speakingWPM} wpm</div>
                </div>
              </div>
            </div>

            {showHighlight && (
              <div className="glass rounded-3xl p-4 mt-4">
                <h3 className="font-bold text-xs mb-2">🔍 Preview with Red Wavy (Grammar errors)</h3>
                <div className={`min-h-[80px] p-4 rounded-2xl ${isDark ? "bg-black/30" : "bg-white/60"} text-[15px] leading-7`} style={{ fontFamily: currentFont.css }} dangerouslySetInnerHTML={{ __html: highlightedHtml || escapeHtml(text).replace(/\n/g, "<br>") || "<span class='opacity-40'>No errors</span>" }} />
              </div>
            )}

            {errors.length > 0 && (
              <div className="glass rounded-2xl p-4 mt-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-sm">🔴 {errors.length} Grammar Issues</h3>
                  <button onClick={fixAll} className="text-xs px-2 py-1 bg-green-500 text-white rounded font-bold btn-shine">Fix All</button>
                </div>
                {errors.map((err, i) => (
                  <div key={i} className="flex justify-between items-center p-2 glass rounded-xl text-xs mb-2 gap-2">
                    <span className="flex-1">{err.message} → <b className="text-green-600 dark:text-green-400">{err.replacement}</b></span>
                    <button onClick={() => fixError(err)} className="px-3 py-1 bg-black text-white rounded-lg whitespace-nowrap font-bold btn-shine">Fix</button>
                  </div>
                ))}
              </div>
            )}

            {(duplicates.words.length > 0 || duplicates.sentences.length > 0 || duplicates.lines.length > 0) && (
              <div className="glass rounded-2xl p-4 mt-4">
                <h3 className="font-bold text-sm mb-2">🔁 Duplicate Detection</h3>
                {duplicates.sentences.length > 0 && (
                  <div className="mb-3">
                    <div className="text-[10px] uppercase opacity-60 font-bold mb-1">Repeated Sentences ({duplicates.sentences.length})</div>
                    {duplicates.sentences.map((d, i) => (<div key={i} className="text-xs p-2 bg-purple-500/15 rounded-lg mb-1"><b>{d.count}x</b> — "{d.text}..."</div>))}
                  </div>
                )}
                {duplicates.lines.length > 0 && (
                  <div className="mb-3">
                    <div className="text-[10px] uppercase opacity-60 font-bold mb-1">Repeated Lines ({duplicates.lines.length})</div>
                    {duplicates.lines.slice(0, 5).map((d, i) => (<div key={i} className="text-xs p-2 bg-blue-500/15 rounded-lg mb-1"><b>{d.count}x</b> — "{d.text}..."</div>))}
                  </div>
                )}
                {duplicates.words.length > 0 && (
                  <div>
                    <div className="text-[10px] uppercase opacity-60 font-bold mb-1">Repeated Words</div>
                    <div className="flex flex-wrap gap-1">
                      {duplicates.words.slice(0, 12).map(([w, c]) => (<span key={w} className="text-[11px] px-2 py-1 bg-orange-500/20 rounded-full font-bold">{w} × {c}</span>))}
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
              <Stat label="Words" value={<AnimatedCounter value={stats.words} />} tip="Total words" />
              <Stat label="Chars (with)" value={<AnimatedCounter value={stats.chars} />} tip="Space included" />
              <Stat label="Chars (without)" value={<AnimatedCounter value={stats.charsNoSpace} />} tip="No spaces" />
              <Stat label="Sentences" value={<AnimatedCounter value={stats.sentences} />} />
              <Stat label="Paragraphs" value={<AnimatedCounter value={stats.paras} />} />
              <Stat label="Lines" value={<AnimatedCounter value={stats.lines} />} />
              <Stat label="Reading" value={formatMinSec(stats.readingSeconds)} tip="Configurable WPM" />
              <Stat label="Speaking" value={formatMinSec(stats.speakingSeconds)} tip="Configurable WPM" />
              <Stat label="Writing" value={formatTime(writingTime)} tip={isActive ? "Active" : "Idle"} />
              <Stat label="Flesch" value={<AnimatedCounter value={stats.flesch} />} tip={stats.level} />
            </div>
            <div className={`glass rounded-2xl p-4 ${goalReached ? "celebrate" : ""}`}>
              <h3 className="font-bold text-xs uppercase mb-3">🎯 Goal</h3>
              <div className="text-3xl font-black text-center gradient-text"><AnimatedCounter value={progress} />%</div>
              <div className="text-xs text-center opacity-60 mt-1">{stats.words} / {goal} words</div>
              {goalReached && <div className="text-center text-green-600 text-xs font-bold mt-2 anim-pop">🎉 Goal Achieved!</div>}
            </div>
            <div className="glass rounded-2xl p-4">
              <h3 className="font-bold text-xs uppercase mb-3">Top 10 Keywords</h3>
              {stats.top10.length === 0 ? <p className="text-xs opacity-50">Type...</p> : stats.top10.map(([k, v], i) => (
                <div key={k} className="flex justify-between text-xs py-1.5 border-b border-white/10 last:border-0"><span>{i + 1}. {k}</span><span className="font-bold">{v}x</span></div>
              ))}
            </div>
            <div className="glass rounded-2xl p-4">
              <h3 className="font-bold text-xs uppercase mb-3">📱 Social Limits (Live)</h3>
              <div className="space-y-2">
                {[{ name: "Twitter", limit: 280 }, { name: "Instagram", limit: 2200 }, { name: "LinkedIn", limit: 3000 }].map(s => {
                  const left = s.limit - stats.chars;
                  const pct = Math.min(100, Math.round((stats.chars / s.limit) * 100));
                  return (
                    <div key={s.name} className="glass-btn rounded-xl p-2">
                      <div className="flex justify-between px-1">
                        <div className="text-[10px] opacity-70 font-bold">{s.name}</div>
                        <div className={`text-xs font-black ${left < 0 ? "text-red-500" : "text-green-600 dark:text-green-400"}`}>{left < 0 ? `${Math.abs(left)} over` : `${left} left`}</div>
                      </div>
                      <div className="mt-1.5 h-1 bg-white/40 dark:bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full transition-all duration-500" style={{ width: `${pct}%`, background: left < 0 ? "#ef4444" : "linear-gradient(90deg,#a855f7,#ec4899)" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ============ ANIMATED TABS - TOOLS HUB ============ */}
        <section className="mt-12">
          <h2 className="text-2xl sm:text-3xl font-black text-center gradient-text mb-2">🧰 Writing Tools Hub</h2>
          <p className="text-center opacity-70 text-sm mb-6">40+ tools for writers, students, and SEO professionals</p>
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {[
              { id: "suggested", label: "📌 Suggested Tools" },
              { id: "writing", label: "✍️ Writing Tools" },
              { id: "academic", label: "🎓 Academic Tools" },
              { id: "analyzer", label: "📊 Quality Analyzer" },
            ].map(t => (
              <button key={t.id} onClick={() => setActiveToolTab(t.id)} className={`tab-btn px-4 py-2 rounded-xl text-xs font-bold glass-btn ${activeToolTab === t.id ? "active" : ""}`}>{t.label}</button>
            ))}
          </div>

          {/* SUGGESTED TOOLS */}
          {activeToolTab === "suggested" && (
            <div className="anim-pop">
              <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-9 gap-2 mb-4">
                {[
                  { id: "char", label: "Char", icon: "🔡" },
                  { id: "sentence", label: "Sentence", icon: "📝" },
                  { id: "paragraph", label: "Paragraph", icon: "📄" },
                  { id: "readability", label: "Readability", icon: "📊" },
                  { id: "density", label: "Density", icon: "🔍" },
                  { id: "case", label: "Case", icon: "Aa" },
                  { id: "cleaner", label: "Cleaner", icon: "🧹" },
                  { id: "find", label: "Find", icon: "🔎" },
                  { id: "dup", label: "Dup Lines", icon: "🔁" },
                ].map(tool => (
                  <button key={tool.id} onClick={() => setActiveSuggestedTool(tool.id)} className={`tab-btn p-2 rounded-xl text-xs font-bold glass-btn ${activeSuggestedTool === tool.id ? "active" : ""}`}>
                    <div className="text-lg">{tool.icon}</div>
                    <div className="text-[10px] mt-0.5">{tool.label}</div>
                  </button>
                ))}
              </div>
              <div className="glass rounded-2xl p-4 anim-slide" key={activeSuggestedTool}>
                {activeSuggestedTool === "char" && (
                  <div>
                    <h3 className="font-bold text-sm mb-3">🔡 Character Counter</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <MiniStat label="Total Chars" value={stats.chars} />
                      <MiniStat label="Without Spaces" value={stats.charsNoSpace} />
                      <MiniStat label="With Spaces" value={stats.chars} />
                      <MiniStat label="Spaces Only" value={stats.chars - stats.charsNoSpace} />
                    </div>
                  </div>
                )}
                {activeSuggestedTool === "sentence" && (
                  <div>
                    <h3 className="font-bold text-sm mb-3">📝 Sentence Counter</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <MiniStat label="Total Sentences" value={stats.sentences} />
                      <MiniStat label="Short (1-10w)" value={stats.short} />
                      <MiniStat label="Medium (11-20w)" value={stats.medium} />
                      <MiniStat label="Long (21+ w)" value={stats.long} />
                    </div>
                    <div className="mt-3 text-xs opacity-60">Avg words per sentence: {(stats.words / Math.max(1, stats.sentences)).toFixed(1)}</div>
                  </div>
                )}
                {activeSuggestedTool === "paragraph" && (
                  <div>
                    <h3 className="font-bold text-sm mb-3">📄 Paragraph Counter</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <MiniStat label="Paragraphs" value={stats.paras} />
                      <MiniStat label="Lines" value={stats.lines} />
                      <MiniStat label="Avg Words/Para" value={stats.paras > 0 ? Math.round(stats.words / stats.paras) : 0} />
                    </div>
                  </div>
                )}
                {activeSuggestedTool === "readability" && (
                  <div>
                    <h3 className="font-bold text-sm mb-3">📊 Readability Checker (Flesch Reading Ease)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <MiniStat label="Flesch Score" value={stats.flesch} extra={stats.level} />
                      <MiniStat label="Avg Words/Sentence" value={(stats.words / Math.max(1, stats.sentences)).toFixed(1)} />
                    </div>
                    <div className="mt-3 text-xs opacity-70">90-100: Very Easy • 80-90: Easy • 70-80: Fairly Easy • 60-70: Standard • 50-60: Fairly Difficult • 30-50: Difficult • 0-30: Very Difficult</div>
                  </div>
                )}
                {activeSuggestedTool === "density" && (
                  <div>
                    <h3 className="font-bold text-sm mb-3">🔍 Keyword Density Checker</h3>
                    {stats.density.length === 0 ? <p className="text-xs opacity-50">Type text to see keywords</p> : (
                      <div className="space-y-1">
                        {stats.density.map(([k, d]) => (
                          <div key={k} className="flex justify-between text-xs py-1 border-b border-white/10 last:border-0">
                            <span className="font-mono">{k}</span>
                            <span className={`font-bold ${parseFloat(d) > 3 ? "text-red-500" : "text-green-600 dark:text-green-400"}`}>{d}%</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {activeSuggestedTool === "case" && (
                  <div>
                    <h3 className="font-bold text-sm mb-3">Aa Text Case Converter</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      <button onClick={() => changeCase("upper")} className="glass-btn p-2 rounded-lg text-xs font-bold btn-shine">UPPERCASE</button>
                      <button onClick={() => changeCase("lower")} className="glass-btn p-2 rounded-lg text-xs font-bold btn-shine">lowercase</button>
                      <button onClick={() => changeCase("title")} className="glass-btn p-2 rounded-lg text-xs font-bold btn-shine">Title Case</button>
                      <button onClick={() => changeCase("sentence")} className="glass-btn p-2 rounded-lg text-xs font-bold btn-shine">Sentence case</button>
                      <button onClick={() => changeCase("capitalize")} className="glass-btn p-2 rounded-lg text-xs font-bold btn-shine">Capitalize Each Word</button>
                      <button onClick={() => changeCase("toggle")} className="glass-btn p-2 rounded-lg text-xs font-bold btn-shine">tOGGLE cASE</button>
                    </div>
                  </div>
                )}
                {activeSuggestedTool === "cleaner" && (
                  <div>
                    <h3 className="font-bold text-sm mb-3">🧹 Text Cleaner</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      <button onClick={cleanExtraSpaces} className="glass-btn p-2 rounded-lg text-xs font-bold btn-shine">Remove Extra Spaces</button>
                      <button onClick={removeBlankLines} className="glass-btn p-2 rounded-lg text-xs font-bold btn-shine">Remove Blank Lines</button>
                      <button onClick={removeDupLines} className="glass-btn p-2 rounded-lg text-xs font-bold btn-shine">Remove Duplicate Lines</button>
                      <button onClick={removeDupSentences} className="glass-btn p-2 rounded-lg text-xs font-bold btn-shine">Remove Duplicate Sentences</button>
                      <button onClick={normalizePunctuation} className="glass-btn p-2 rounded-lg text-xs font-bold btn-shine">Normalize Punctuation</button>
                      <button onClick={removeSpecialChars} className="glass-btn p-2 rounded-lg text-xs font-bold btn-shine">Remove Special Chars</button>
                      <button onClick={removeNumbers} className="glass-btn p-2 rounded-lg text-xs font-bold btn-shine">Remove Numbers</button>
                      <button onClick={removeHtmlTags} className="glass-btn p-2 rounded-lg text-xs font-bold btn-shine">Remove HTML Tags</button>
                    </div>
                  </div>
                )}
                {activeSuggestedTool === "find" && (
                  <div>
                    <h3 className="font-bold text-sm mb-3">🔎 Find & Replace</h3>
                    <button onClick={() => setShowFind(true)} className="glass-btn p-3 rounded-xl text-xs font-bold btn-shine">Open Find & Replace Panel (Ctrl+F)</button>
                  </div>
                )}
                {activeSuggestedTool === "dup" && (
                  <div>
                    <h3 className="font-bold text-sm mb-3">🔁 Duplicate Line Remover</h3>
                    {duplicates.lines.length === 0 ? <p className="text-xs opacity-50">No duplicate lines found ✓</p> : (
                      <>
                        <p className="text-xs opacity-70 mb-3">{duplicates.lines.length} duplicate line groups found</p>
                        <button onClick={removeDupLines} className="glass-btn p-2 px-4 rounded-lg text-xs font-bold btn-shine">Remove All Duplicates</button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* WRITING TOOLS */}
          {activeToolTab === "writing" && (
            <div className="anim-pop grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="glass rounded-2xl p-4">
                <h3 className="font-bold text-sm mb-3">🔤 Text Formatter</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => changeCase("upper")} className="glass-btn p-2 rounded-lg text-xs font-bold btn-shine">Uppercase</button>
                  <button onClick={() => changeCase("lower")} className="glass-btn p-2 rounded-lg text-xs font-bold btn-shine">Lowercase</button>
                  <button onClick={() => changeCase("title")} className="glass-btn p-2 rounded-lg text-xs font-bold btn-shine">Title Case</button>
                  <button onClick={() => changeCase("sentence")} className="glass-btn p-2 rounded-lg text-xs font-bold btn-shine">Sentence case</button>
                  <button onClick={() => changeCase("capitalize")} className="glass-btn p-2 rounded-lg text-xs font-bold btn-shine">Capitalize Each Word</button>
                  <button onClick={() => changeCase("toggle")} className="glass-btn p-2 rounded-lg text-xs font-bold btn-shine">Toggle Case</button>
                </div>
              </div>
              <div className="glass rounded-2xl p-4">
                <h3 className="font-bold text-sm mb-3">🧹 Text Cleaner</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={cleanExtraSpaces} className="glass-btn p-2 rounded-lg text-xs font-bold btn-shine">Extra Spaces</button>
                  <button onClick={removeBlankLines} className="glass-btn p-2 rounded-lg text-xs font-bold btn-shine">Blank Lines</button>
                  <button onClick={removeDupLines} className="glass-btn p-2 rounded-lg text-xs font-bold btn-shine">Dup Lines</button>
                  <button onClick={removeDupSentences} className="glass-btn p-2 rounded-lg text-xs font-bold btn-shine">Dup Sentences</button>
                  <button onClick={normalizePunctuation} className="glass-btn p-2 rounded-lg text-xs font-bold btn-shine">Punctuation</button>
                  <button onClick={removeSpecialChars} className="glass-btn p-2 rounded-lg text-xs font-bold btn-shine">Special Chars</button>
                  <button onClick={removeNumbers} className="glass-btn p-2 rounded-lg text-xs font-bold btn-shine">Numbers</button>
                  <button onClick={removeHtmlTags} className="glass-btn p-2 rounded-lg text-xs font-bold btn-shine">HTML Tags</button>
                </div>
              </div>
              <div className="glass rounded-2xl p-4">
                <h3 className="font-bold text-sm mb-3">🔁 Text Converter</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={toSlug} className="glass-btn p-2 rounded-lg text-xs font-bold btn-shine">Slug</button>
                  <button onClick={toSlug} className="glass-btn p-2 rounded-lg text-xs font-bold btn-shine">URL-friendly</button>
                  <button onClick={toCommaSeparated} className="glass-btn p-2 rounded-lg text-xs font-bold btn-shine">Comma-separated</button>
                  <button onClick={toLineSeparated} className="glass-btn p-2 rounded-lg text-xs font-bold btn-shine">Line-separated</button>
                  <button onClick={toJsonSafe} className="glass-btn p-2 rounded-lg text-xs font-bold btn-shine">JSON-safe</button>
                  <button onClick={toPlainText} className="glass-btn p-2 rounded-lg text-xs font-bold btn-shine">Plain Text</button>
                </div>
              </div>
              <div className="glass rounded-2xl p-4">
                <h3 className="font-bold text-sm mb-3">📊 Sorting Tools</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={sortAZ} className="glass-btn p-2 rounded-lg text-xs font-bold btn-shine">Sort A-Z</button>
                  <button onClick={sortZA} className="glass-btn p-2 rounded-lg text-xs font-bold btn-shine">Sort Z-A</button>
                  <button onClick={sortByLength} className="glass-btn p-2 rounded-lg text-xs font-bold btn-shine">By Length</button>
                  <button onClick={sortByWordCount} className="glass-btn p-2 rounded-lg text-xs font-bold btn-shine">By Word Count</button>
                  <button onClick={removeDupLines} className="glass-btn p-2 rounded-lg text-xs font-bold btn-shine">Remove Dups</button>
                </div>
              </div>
              <div className="glass rounded-2xl p-4">
                <h3 className="font-bold text-sm mb-3">🔄 Text Reversal</h3>
                <div className="grid grid-cols-1 gap-2">
                  <button onClick={reverseChars} className="glass-btn p-2 rounded-lg text-xs font-bold btn-shine">Reverse Characters</button>
                  <button onClick={reverseWords} className="glass-btn p-2 rounded-lg text-xs font-bold btn-shine">Reverse Words</button>
                  <button onClick={reverseLines} className="glass-btn p-2 rounded-lg text-xs font-bold btn-shine">Reverse Lines</button>
                </div>
              </div>
              <div className="glass rounded-2xl p-4">
                <h3 className="font-bold text-sm mb-3">⎵ Space Tools</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={trimLeading} className="glass-btn p-2 rounded-lg text-xs font-bold btn-shine">Trim Leading</button>
                  <button onClick={trimTrailing} className="glass-btn p-2 rounded-lg text-xs font-bold btn-shine">Trim Trailing</button>
                  <button onClick={collapseSpaces} className="glass-btn p-2 rounded-lg text-xs font-bold btn-shine">Collapse Spaces</button>
                  <button onClick={tabsToSpaces} className="glass-btn p-2 rounded-lg text-xs font-bold btn-shine">Tabs→Spaces</button>
                </div>
              </div>
            </div>
          )}

          {/* ACADEMIC TOOLS */}
          {activeToolTab === "academic" && (
            <div className="anim-pop">
              <div className="glass rounded-2xl p-4 mb-4">
                <h3 className="font-bold text-sm mb-3">🎓 Academic Word Limit Tracker</h3>
                <div className="flex flex-wrap gap-3 items-end">
                  <div>
                    <label className="text-[10px] uppercase opacity-60 font-bold block mb-1">Document Type</label>
                    <select value={academicType} onChange={e => setAcademicType(e.target.value)} className="h-9 rounded-lg glass-btn px-2 text-sm">
                      {["Essay","Assignment","Thesis","Abstract","Research Paper","Dissertation","Lab Report"].map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase opacity-60 font-bold block mb-1">Required Words</label>
                    <input type="number" min={1} value={academicLimit} onChange={e => setAcademicLimit(Math.max(1, parseInt(e.target.value) || 1))} className="w-32 h-9 rounded-lg glass-btn px-2 text-sm" />
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  <MiniStat label="Required" value={academicLimit} />
                  <MiniStat label="Current" value={stats.words} />
                  <MiniStat label="Remaining" value={Math.max(0, academicLimit - stats.words)} extra={stats.words > academicLimit ? `Over by ${stats.words - academicLimit}` : ""} />
                </div>
                <div className="mt-3 h-2.5 bg-white/40 dark:bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full transition-all duration-500 progress-bar" style={{ width: `${Math.min(100, (stats.words / academicLimit) * 100)}%`, background: stats.words > academicLimit ? "linear-gradient(90deg,#ef4444,#dc2626)" : "linear-gradient(90deg,#a855f7,#ec4899)" }} />
                </div>
                <div className="mt-2 text-xs opacity-70">
                  {stats.words >= academicLimit ? "✅ Word limit reached!" : `You need ${academicLimit - stats.words} more words`}
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="glass rounded-2xl p-4">
                  <h3 className="font-bold text-sm mb-3">📝 Paragraph Analyzer</h3>
                  {stats.paras === 0 ? <p className="text-xs opacity-50">No paragraphs yet</p> : (
                    <div className="space-y-2">
                      {text.split(/\n+/).filter(p => p.trim().length > 0).slice(0, 5).map((p, i) => (
                        <div key={i} className="text-xs p-2 glass-btn rounded-lg">
                          <div className="font-bold mb-1">Paragraph {i + 1}</div>
                          <div className="opacity-70">{p.split(/\s+/).filter(Boolean).length} words • {p.length} chars • {p.split(/[.!?]+/).filter(s => s.trim()).length} sentences</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="glass rounded-2xl p-4">
                  <h3 className="font-bold text-sm mb-3">📚 Citation-Friendly Stats</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <MiniStat label="Words" value={stats.words} />
                    <MiniStat label="Sentences" value={stats.sentences} />
                    <MiniStat label="Paragraphs" value={stats.paras} />
                    <MiniStat label="Chars (no space)" value={stats.charsNoSpace} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* QUALITY ANALYZER */}
          {activeToolTab === "analyzer" && (
            <div className="anim-pop glass rounded-2xl p-4">
              <h3 className="font-bold text-sm mb-1">📊 Text Quality Analyzer</h3>
              <p className="text-[10px] opacity-60 mb-4">Basic client-side rule-based analysis (not a replacement for professional AI grammar tools)</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { label: "Repeated Words", value: quality.dupWordCount, warn: quality.dupWordCount > 10, danger: quality.dupWordCount > 25 },
                  { label: "Repeated Sentences", value: quality.dupSentenceCount, warn: quality.dupSentenceCount > 0, danger: quality.dupSentenceCount > 3 },
                  { label: "Long Sentences (25+ words)", value: quality.longSentences, warn: quality.longSentences > 3, danger: quality.longSentences > 10 },
                  { label: "Very Long Paragraphs (150+ words)", value: quality.veryLongParas, warn: quality.veryLongParas > 1, danger: quality.veryLongParas > 3 },
                  { label: "Filler Words", value: quality.fillerCount, warn: quality.fillerCount > 5, danger: quality.fillerCount > 15 },
                  { label: "Weak/Passive Phrases", value: quality.weakCount, warn: quality.weakCount > 3, danger: quality.weakCount > 10 },
                  { label: "Excessive Punctuation (!! / ...)", value: quality.excessivePunct, warn: quality.excessivePunct > 0, danger: quality.excessivePunct > 3 },
                  { label: "Multiple Spaces", value: quality.multipleSpaces, warn: quality.multipleSpaces > 5, danger: quality.multipleSpaces > 15 },
                  { label: "ALL CAPS Words", value: quality.allCapsWords, warn: quality.allCapsWords > 3, danger: quality.allCapsWords > 10 },
                ].map(item => {
                  const hasIssue = item.value > 0;
                  const lbl = !hasIssue ? { text: "Good", color: "bg-green-500/20 text-green-700 dark:text-green-300" }
                    : item.danger ? { text: "Improve", color: "bg-red-500/20 text-red-700 dark:text-red-300" }
                    : { text: "Needs Attention", color: "bg-orange-500/20 text-orange-700 dark:text-orange-300" };
                  return (
                    <div key={item.label} className="glass-btn rounded-xl p-3 flex justify-between items-center">
                      <div>
                        <div className="text-xs font-bold">{item.label}</div>
                        <div className="text-[10px] opacity-60 mt-0.5">Found: {item.value}</div>
                      </div>
                      <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${lbl.color}`}>{lbl.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* ============ WORD COUNT FOR DIFFERENT CONTENT TYPES ============ */}
        <section className="mt-12">
          <h2 className="text-2xl sm:text-3xl font-black text-center gradient-text mb-2">📊 Word Count by Content Type</h2>
          <p className="text-center opacity-70 text-sm mb-6">Recommended word ranges for different writing formats</p>
          <div className="glass rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-violet-600/20 to-pink-600/20">
                    <th className="text-left p-3 font-bold">Content Type</th>
                    <th className="text-left p-3 font-bold">Recommended Range</th>
                    <th className="text-left p-3 font-bold hidden sm:table-cell">Ideal Count</th>
                    <th className="text-left p-3 font-bold hidden md:table-cell">Purpose</th>
                  </tr>
                </thead>
                <tbody>
                  {CONTENT_TYPES.map(c => (
                    <tr key={c.name} className="border-t border-white/20 hover:bg-white/10 transition">
                      <td className="p-3 font-bold">{c.icon} {c.name}</td>
                      <td className="p-3 opacity-80">{c.recommended}</td>
                      <td className="p-3 opacity-80 hidden sm:table-cell">{c.ideal.toLocaleString()}</td>
                      <td className="p-3 opacity-60 hidden md:table-cell">{c.purpose}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ============ SOCIAL MEDIA WRITING COUNTERS ============ */}
        <section className="mt-12">
          <h2 className="text-2xl sm:text-3xl font-black text-center gradient-text mb-2">📱 Social Media Writing Counters</h2>
          <p className="text-center opacity-70 text-sm mb-6">Dedicated counters for each platform with recommended limits</p>
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {SOCIAL_PLATFORMS.map(s => (
              <button key={s.name} onClick={() => setActiveSocial(s.name)} className={`tab-btn px-3 py-2 rounded-xl text-xs font-bold glass-btn ${activeSocial === s.name ? "active" : ""}`}>
                {s.icon} <span className="hidden sm:inline">{s.name}</span>
              </button>
            ))}
          </div>
          <div className="glass rounded-2xl p-4 anim-pop" key={activeSocial}>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-sm">{activeSocialData.icon} {activeSocialData.name}</h3>
              <span className="text-[10px] opacity-60">{activeSocialData.hint}</span>
            </div>
            <textarea
              value={socialText}
              onChange={e => setSocialText(e.target.value)}
              placeholder={`Type your ${activeSocialData.name.toLowerCase()}...`}
              className={`w-full min-h-[120px] p-3 rounded-xl ${isDark ? "bg-black/30" : "bg-white/60"} outline-none text-sm`}
            />
            <div className="mt-3 grid grid-cols-3 gap-3">
              <MiniStat label="Characters" value={socialStats.chars} />
              <MiniStat label="Words" value={socialStats.words} />
              <MiniStat label="Remaining" value={socialStats.remaining < 0 ? `Over by ${Math.abs(socialStats.remaining)}` : socialStats.remaining} />
            </div>
            <div className="mt-3">
              <div className="flex justify-between text-[10px] opacity-60 mb-1">
                <span>Platform Limit ({activeSocialData.limit.toLocaleString()})</span>
                <span>{socialStats.progressPct}%</span>
              </div>
              <div className="h-2 bg-white/40 dark:bg-white/10 rounded-full overflow-hidden">
                <div className="h-full transition-all duration-500 progress-bar" style={{ width: `${socialStats.progressPct}%`, background: socialStats.remaining < 0 ? "linear-gradient(90deg,#ef4444,#dc2626)" : socialStats.progressPct > 80 ? "linear-gradient(90deg,#f59e0b,#eab308)" : "linear-gradient(90deg,#a855f7,#ec4899)" }} />
              </div>
            </div>
            <div className="mt-2">
              <div className="flex justify-between text-[10px] opacity-60 mb-1">
                <span>Recommended ({activeSocialData.recommended.toLocaleString()})</span>
                <span>{socialStats.recommendedPct}%</span>
              </div>
              <div className="h-1.5 bg-white/40 dark:bg-white/10 rounded-full overflow-hidden">
                <div className="h-full transition-all duration-500" style={{ width: `${Math.min(100, socialStats.recommendedPct)}%`, background: socialStats.recommendedPct > 100 ? "#10b981" : "linear-gradient(90deg,#06b6d4,#3b82f6)" }} />
              </div>
            </div>
          </div>
        </section>

        {/* ============ WHAT IS WORD COUNTER (DETAILED) ============ */}
        <section className="mt-12">
          <h2 className="text-2xl sm:text-3xl font-black text-center gradient-text mb-2">📖 What Is a Word Counter?</h2>
          <p className="text-center opacity-70 text-sm mb-6">Complete explanation of what word counters are and why they matter</p>
          <div className="glass rounded-2xl p-6">
            <div className="space-y-4 text-sm leading-relaxed">
              <div>
                <h3 className="font-bold text-base mb-2">Definition</h3>
                <p className="opacity-80">A <b>word counter</b> is a software tool that analyzes written text and reports quantitative statistics — word count, character count, sentence count, paragraph count, reading time, and readability metrics. It processes text in real-time as you type or paste, offering immediate feedback without requiring any manual counting. Modern word counters go far beyond simple counting: they analyze keyword density for SEO, estimate reading and speaking times, check grammar, detect duplicate content, and provide readability scores.</p>
              </div>
              <div>
                <h3 className="font-bold text-base mb-2">Why Word Counting Matters</h3>
                <p className="opacity-80">Word counts are foundational to almost every professional writing context. Academic institutions enforce strict word limits on essays and theses. Content marketers must hit target lengths for SEO ranking. Social media platforms cap characters. Journalists work within column inches. Without accurate, real-time counting, writers risk being over or under word limits, which can mean lost marks, rejected submissions, or diminished search visibility.</p>
              </div>
              <div className="grid md:grid-cols-2 gap-4 pt-2">
                {[
                  { title: "🎓 For Students", desc: "Meet exact word limits on essays, assignments, and dissertations. Track progress toward minimum word counts and check readability for better grades." },
                  { title: "✍️ For Writers", desc: "Track daily word goals (like 1,000 or 2,000 words/day). Monitor writing time and productivity. Organize drafts by content type." },
                  { title: "📝 For Bloggers", desc: "Hit recommended 1,500-2,500 word ranges for SEO. Check keyword density (1-2% ideal). Ensure posts are comprehensive enough to rank." },
                  { title: "🔍 For SEO Professionals", desc: "Analyze keyword density without triggering stuffing penalties. Verify content length against competitor benchmarks. Check readability for audience fit." },
                  { title: "📰 For Journalists", desc: "Respect strict editorial word limits. Ensure leads fit character budgets for print. Verify quotes and stats are formatted correctly." },
                  { title: "📱 For Social Media Creators", desc: "Stay within platform character limits. Optimize hooks to visible character counts (Instagram 125, LinkedIn 1300). Craft compelling titles within YouTube's 60-char mobile view." },
                  { title: "💼 For Business Professionals", desc: "Keep emails concise. Structure product descriptions for conversion. Ensure proposals and reports meet corporate standards." },
                ].map((item, i) => (
                  <div key={i} className="glass-btn rounded-xl p-3">
                    <h4 className="font-bold text-sm mb-1">{item.title}</h4>
                    <p className="text-xs opacity-70 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ============ OTHER TOOLS GRID ============ */}
        <section className="mt-12">
          <h2 className="text-2xl sm:text-3xl font-black text-center gradient-text mb-2">🧰 Other Useful Tools</h2>
          <p className="text-center opacity-70 text-sm mb-6">Complete toolkit for writers, students, and SEO professionals</p>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {otherTools.map(t => (
              <a key={t.name} href={t.link} className="glass rounded-2xl p-5 hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer group btn-shine">
                <div className="text-4xl mb-2">{t.icon}</div>
                <h3 className="font-bold text-sm mb-1 group-hover:text-violet-600 transition">{t.name}</h3>
                <p className="text-xs opacity-60 leading-relaxed">{t.desc}</p>
              </a>
            ))}
          </div>
        </section>

        {/* ============ ARTICLES (ACCORDION) ============ */}
        <section className="mt-12 space-y-4">
          <h2 className="text-2xl sm:text-3xl font-black text-center gradient-text mb-6">📚 Guides & Documentation</h2>
          {articlesData.map(a => (
            <div key={a.id} className="glass rounded-2xl overflow-hidden">
              <button onClick={() => setShowArticle(showArticle === a.id ? null : a.id)} className="w-full flex justify-between items-center p-4 sm:p-5 font-bold text-left hover:bg-white/10 transition-all">
                <span className="text-sm sm:text-base pr-2">{a.title}</span>
                <span className="text-2xl transition-transform duration-300" style={{ transform: showArticle === a.id ? "rotate(180deg)" : "rotate(0)" }}>{showArticle === a.id ? "−" : "+"}</span>
              </button>
              <div className={`accordion-content ${showArticle === a.id ? "open" : ""}`}>
                <div className={`p-4 sm:p-6 ${isDark ? "bg-black/20" : "bg-white/40"} text-xs sm:text-sm leading-7 whitespace-pre-line border-t border-white/20`}>{a.content}</div>
              </div>
            </div>
          ))}
        </section>

        {/* ============ FAQ (SMOOTH ACCORDION) ============ */}
        <section className="mt-12">
          <h2 className="text-2xl sm:text-3xl font-black text-center gradient-text mb-2">❓ Frequently Asked Questions</h2>
          <p className="text-center opacity-70 text-sm mb-6">Common questions about our Word Counter tool</p>
          <div className="grid md:grid-cols-2 gap-3">
            {faqData.map((f, i) => (
              <div key={i} className="glass rounded-2xl overflow-hidden">
                <button onClick={() => setShowArticle(showArticle === `faq-${i}` ? null : `faq-${i}`)} className="w-full flex justify-between items-center p-4 font-bold text-left text-sm hover:bg-white/10 transition-all">
                  <span>{f.q}</span>
                  <span className="text-lg ml-2 flex-shrink-0 transition-transform duration-300" style={{ transform: showArticle === `faq-${i}` ? "rotate(45deg)" : "rotate(0)" }}>+</span>
                </button>
                <div className={`accordion-content ${showArticle === `faq-${i}` ? "open" : ""}`}>
                  <div className="px-4 pb-4 text-xs leading-6 opacity-80">{f.a}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <footer className="mt-16 text-center text-xs opacity-60 pb-8">
          <p>✨ Word Counter Pro v8 — 100% private, browser-only, no data sent to server</p>
          <p className="mt-1">Made with 💜 for writers, students, and SEO professionals</p>
        </footer>
      </div>
    </div>
  );
}

// ============ SUB COMPONENTS ============
function Stat({ label, value, tip }: { label: string; value: any; tip?: string }) {
  return (
    <div className="glass rounded-2xl p-3 sm:p-4 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5" title={tip}>
      <div className="text-[10px] uppercase tracking-widest opacity-60 font-bold">{label}</div>
      <div className="text-base sm:text-lg font-black mt-1">{value}</div>
      {tip && <div className="text-[9px] opacity-40 mt-1">{tip}</div>}
    </div>
  );
}

function MiniStat({ label, value, extra }: { label: string; value: any; extra?: string }) {
  return (
    <div className="glass-btn rounded-xl p-3 text-center">
      <div className="text-[10px] uppercase opacity-60 font-bold">{label}</div>
      <div className="text-base font-black mt-1">{typeof value === "number" ? <AnimatedCounter value={value} /> : value}</div>
      {extra && <div className="text-[9px] opacity-50 mt-0.5">{extra}</div>}
    </div>
  );
}

// ============ DATA ============
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
    title: "📖 What is Word Counter? Complete Guide",
    content: `A Word Counter is a digital tool that analyzes written text and provides instant statistics — word count, character count, sentence count, paragraph count, reading time, and more.

━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHY YOU NEED IT
━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Students — Meet strict essay word limits (500/1000/2000)
• Bloggers — SEO-friendly content length 1500-2500 words
• Social Media — Twitter 280, Instagram 2200, LinkedIn 3000 chars
• Authors — Track daily word goals (2000/day)
• Translators — Bill accurately by word count
• SEO Pros — Keyword density 1-2% ideal

━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHAT IT MEASURES
━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Words, Chars (with/without spaces)
• Sentences, Paragraphs, Lines
• Reading Time (configurable WPM)
• Speaking Time (configurable WPM)
• Writing Time (active only)
• Flesch Score (0-100 readability)
• Keyword Density (top 10)

━━━━━━━━━━━━━━━━━━━━━━━━━━━
FLESCH READING EASE SCALE
━━━━━━━━━━━━━━━━━━━━━━━━━━━
90-100: Very Easy (5th grade)
80-90: Easy (6th grade)
70-80: Fairly Easy (7th grade)
60-70: Standard (8th-9th grade) ← aim here for web
50-60: Fairly Difficult (10-12th)
30-50: Difficult (college)
0-30: Very Difficult (graduate)

━━━━━━━━━━━━━━━━━━━━━━━━━━━
PRIVACY
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Everything runs in-browser. Auto-save uses localStorage. Only "Grammar Check" sends to LanguageTool API.`
  },
  {
    id: "user-guide",
    title: "📘 Complete User Guide — Step by Step",
    content: `STEP 1: START WRITING
Click the big text box. Stats update in real-time. Auto-saves every 400ms.

STEP 2: SET WORD GOAL
Change the number in header. Progress bar + celebration on completion.

STEP 3: EDIT LIKE A PRO
Toolbar: Cut, Copy, Paste, Backspace, Delete, Case, Color, Clear

STEP 4: SETTINGS
• Page Size (A4/Letter/Legal)
• 14 Font Families
• Font Size 10-32px
• Line Height 1.0-2.5

STEP 5: READING/SPEAKING SPEED
Choose slow (100 wpm), average (200), fast (300), or custom. Speaking 130 wpm default.

STEP 6: GRAMMAR CHECK
Auto-checks 1.5s after you stop typing. Red wavy lines + errors panel.

STEP 7: VOICE TYPING
Chrome/Edge over HTTPS. Speak naturally.

STEP 8: TEXT TO SPEECH
Click 🔊 to hear text read aloud.

STEP 9: WRITING TOOLS HUB
40+ tools in tabs:
• Suggested: Character, Sentence, Paragraph, Readability, Density, Case, Cleaner, Find, Duplicate
• Writing: Formatter, Cleaner, Converter, Sort, Reverse, Space
• Academic: Word limit tracker, paragraph analyzer
• Quality: Text quality analyzer

STEP 10: SOCIAL COUNTERS
6 platforms with dedicated counters.

STEP 11: EXPORT
TXT, DOC, CSV, PDF

STEP 12: KEYBOARD SHORTCUTS
Ctrl+C/X/V, Ctrl+F, Ctrl+S, Tab, Esc`
  },
  {
    id: "features",
    title: "⚙️ Every Feature Explained",
    content: `📊 REAL-TIME STATISTICS — 10 metrics update every keystroke.

💾 AUTO-SAVE — Every 400ms to localStorage.

✍️ AUTO-CORRECT — 20+ common typos fixed silently.

💡 AUTO-COMPLETE — 300-word dictionary, Tab to accept.

🔴 GRAMMAR CHECK — LanguageTool API, 30+ languages, red wavy lines.

🔁 DUPLICATE DETECTION — Words, sentences, lines.

🎯 WORD TARGET — Progress bar + confetti celebration.

📄 PAGE SIZE — A4/Letter/Legal.

🎨 FONTS — 14 options.

📏 FONT SIZE & LINE HEIGHT — Sliders.

🎨 TEXT COLOR — Picker + palette.

⏱ WRITING TIME — Active only.

📈 READABILITY — Flesch score.

📊 KEYWORD DENSITY — Top 10.

📱 SOCIAL MEDIA LIMITS — Live Twitter/Instagram/LinkedIn.

📱 SOCIAL WRITING COUNTERS — 6 platforms.

🎤 VOICE TYPING — Web Speech API.

🔊 TEXT TO SPEECH — Browser TTS.

🔍 FIND & REPLACE — Case-sensitive, whole-word.

📤 EXPORT — TXT, DOC, CSV, PDF.

🌙 DARK MODE.

⛶ FOCUS MODE.

🎓 ACADEMIC TOOLS — Word limit tracker.

📊 QUALITY ANALYZER — 9 checks.

🧰 40+ WRITING TOOLS — Formatter, Cleaner, Converter, Sort, Reverse, Space.

✨ ANIMATIONS — Hover, counter, progress, copy, celebration, confetti.`
  },
];

const faqData = [
  { q: "Is this Word Counter free to use?", a: "Yes! 100% free forever. No sign-up, no ads, no limits." },
  { q: "Is my text saved on your servers?", a: "No. Everything runs in your browser. Only Grammar Check sends to LanguageTool API. Auto-save uses localStorage." },
  { q: "Difference between Chars (with) and (without)?", a: "Chars (with) includes spaces — used for Twitter (280). Chars (without) is letters only — used for university limits." },
  { q: "How accurate is reading time?", a: "Based on configurable WPM. Default 200 wpm average. You can choose slow (100), fast (300), or custom." },
  { q: "What is a good Flesch Score?", a: "Web content: 60-70. Social media: 70-80. Academic: 30-50. Higher = easier to read." },
  { q: "Why doesn't voice typing work?", a: "Requires Chrome/Edge over HTTPS. Check mic permissions (lock icon in address bar)." },
  { q: "What is ideal keyword density?", a: "1-2% for SEO. Above 3% looks like keyword stuffing and Google may penalize." },
  { q: "Does grammar check work in Hindi?", a: "Yes! Select Hindi from the language dropdown. LanguageTool supports 30+ languages." },
  { q: "Can I use this offline?", a: "Mostly yes. Word counting, stats, exports work offline. Grammar check needs internet." },
  { q: "What is duplicate detection?", a: "Finds words, sentences, and lines that repeat. Useful for editing out redundancy." },
  { q: "How does auto-correct work?", a: "Watches 20+ common typos. Silently fixes teh→the, adn→and, etc. Toggle in Settings." },
  { q: "What's the maximum text length?", a: "Practically unlimited. Tested with 100,000+ words without performance issues." },
  { q: "How does the academic word limit tracker work?", a: "Set required word count. Tracker shows current, remaining, and progress bar. Alerts when limit is reached." },
  { q: "What is the Text Quality Analyzer?", a: "Basic client-side check for repeated words, long sentences, filler words, weak phrases, and more. Uses Good/Needs Attention/Improve labels. Not a replacement for professional AI grammar checking." },
  { q: "Are the animations performance-heavy?", a: "No. Uses CSS transforms and requestAnimationFrame — smooth on all devices including mobile." },
];
