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
const HIGHLIGHT_PALETTE = ["#fef08a","#bbf7d0","#bfdbfe","#fecaca","#e9d5ff","#fed7aa","#fbcfe8","#a5f3fc"];
const HEADING_LEVELS = [
  { tag: "h1", label: "H1", size: "2em" },
  { tag: "h2", label: "H2", size: "1.6em" },
  { tag: "h3", label: "H3", size: "1.35em" },
  { tag: "h4", label: "H4", size: "1.15em" },
  { tag: "h5", label: "H5", size: "1em" },
  { tag: "h6", label: "H6", size: "0.9em" },
];

const AUTO_CORRECT: Record<string, string> = {
  teh: "the", adn: "and", recieve: "receive", seperate: "separate",
  occured: "occurred", definately: "definitely", wierd: "weird",
  freind: "friend", beleive: "believe", calender: "calendar",
  tommorow: "tomorrow", untill: "until", wich: "which", thier: "their",
};

const FILLER_WORDS = ["very","really","actually","basically","literally","just","quite","simply","totally","definitely","obviously","clearly","kind of","sort of","a lot","in order to","due to the fact","at this point in time"];
const WEAK_PHRASES = ["is being","was being","has been","have been","had been","would have","could have","should have","might have","may have"];

const DICTIONARY = ["about","above","across","action","actually","added","after","again","against","almost","along","already","although","always","among","amount","another","answer","anyone","anything","appear","around","available","back","became","because","become","before","begin","behind","believe","below","better","between","beyond","bring","business","called","cannot","carry","center","certain","change","children","choose","class","clear","close","color","coming","common","company","complete","consider","continue","could","country","course","create","current","decide","describe","develop","different","difficult","direct","during","early","education","effect","either","enough","every","example","experience","family","father","feeling","figure","follow","friend","future","general","given","government","great","ground","group","growth","happen","having","heard","heavy","history","however","hundred","important","include","inside","issue","itself","knowledge","language","large","later","learn","leave","letter","level","light","little","local","machine","major","material","matter","maybe","mean","measure","medical","member","memory","message","method","middle","might","minute","modern","moment","money","month","morning","mother","mountain","music","nation","natural","nature","nearly","necessary","need","never","night","nothing","notice","number","object","occur","offer","often","order","other","paper","particular","people","perhaps","person","picture","place","plan","point","police","policy","possible","power","practice","prepare","present","president","press","pretty","prevent","private","probably","problem","process","produce","product","program","project","property","provide","public","purpose","question","quickly","quiet","rather","reach","ready","really","reason","receive","recent","recognize","record","reduce","reflect","region","relate","remain","remember","remove","report","require","research","resource","respond","result","return","right","roughly","school","science","season","second","section","seem","sense","series","serious","serve","service","several","shall","share","short","should","similar","simple","simply","since","single","situation","small","social","society","some","someone","something","sometimes","space","speak","special","spend","stand","start","state","statement","station","stay","still","story","street","strong","structure","student","study","subject","success","suddenly","suggest","summer","support","system","table","taken","teach","thing","though","thought","thousand","through","throughout","together","tomorrow","tonight","total","toward","town","trade","training","travel","treatment","trouble","truth","understand","until","usually","value","various","victim","video","village","visit","voice","watch","water","weapon","weather","week","weight","welcome","western","whatever","whenever","wherever","whether","which","while","white","whole","whose","window","within","without","woman","wonder","world","worry","would","write","writer","wrong","year","young","yourself"];

const SAMPLE = `Word Counter Pro is a powerful tool. Select some text, then use the toolbar to format it — Bold, Italic, colors, headings, and more. Only your selection will change!`;

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
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return "0 sec";
  if (totalSeconds < 60) return `${totalSeconds} sec`;
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return s > 0 ? `${m} min ${s} sec` : `${m} min`;
};

const getTextOffset = (node: Node, offset: number, root: Node): number => {
  let count = 0;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let n: Node | null;
  while ((n = walker.nextNode())) {
    if (n === node) return count + offset;
    count += (n.textContent?.length || 0);
  }
  return count;
};
const getNodeAtOffset = (offset: number, root: Node): { node: Text; offset: number } | null => {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let count = 0;
  let n: Node | null;
  while ((n = walker.nextNode())) {
    const len = n.textContent?.length || 0;
    if (count + len >= offset) return { node: n as Text, offset: offset - count };
    count += len;
  }
  return null;
};

const useAnimatedNumber = (target: number, duration = 500) => {
  const safeTarget = Number.isFinite(target) ? target : 0;
  const [value, setValue] = useState(safeTarget);
  const startRef = useRef(safeTarget);
  const rafRef = useRef<number | null>(null);
  useEffect(() => {
    const start = Number.isFinite(startRef.current) ? startRef.current : 0;
    const end = safeTarget;
    if (start === end) return;
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const cur = Math.round(start + (end - start) * eased);
      setValue(Number.isFinite(cur) ? cur : end);
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
      else { setValue(end); startRef.current = end; }
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [safeTarget, duration]);
  return value;
};

const AnimatedCounter = ({ value }: { value: number }) => {
  const animated = useAnimatedNumber(value);
  return <span>{Number.isFinite(animated) ? animated.toLocaleString() : "0"}</span>;
};

export default function WordCounterClient() {
  const [html, setHtml] = useState("");
  const [text, setText] = useState("");
  const [errors, setErrors] = useState<ErrorItem[]>([]);
  const [checking, setChecking] = useState(false);
  const [font, setFont] = useState("Inter");
  const [fontSize, setFontSize] = useState(16);
  const [lineHeight, setLineHeight] = useState(1.7);
  const [color, setColor] = useState("#111827");
  const [highlight, setHighlight] = useState("#fef08a");
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
  const [showFormatBar, setShowFormatBar] = useState(true);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBgPicker, setShowBgPicker] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [activeFormats, setActiveFormats] = useState<Record<string, boolean>>({});

  const editorRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const grammarAbortRef = useRef<AbortController | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedSelRef = useRef<{ start: number; end: number } | null>(null);
  const shareMenuRef = useRef<HTMLDivElement>(null);
  const colorMenuRef = useRef<HTMLDivElement>(null);
  const bgMenuRef = useRef<HTMLDivElement>(null);

  // -------- LOAD --------
  useEffect(() => {
    try {
      const savedHtml = safeGet("lorem_word_html");
      const savedText = safeGet("lorem_word_text");
      if (savedHtml) {
        setHtml(savedHtml);
        if (editorRef.current) editorRef.current.innerHTML = savedHtml;
      } else if (savedText) {
        const escaped = escapeHtml(savedText).replace(/\n/g, "<br>");
        setHtml(escaped);
        if (editorRef.current) editorRef.current.innerHTML = escaped;
      }
      if (savedText) setText(savedText);
      const cfg = safeGet("lorem_cfg");
      if (cfg) {
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
      }
    } catch {}
  }, []);

  // -------- AUTO SAVE --------
  useEffect(() => {
    setSaveStatus("saving");
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      safeSet("lorem_word_html", html);
      safeSet("lorem_word_text", text);
      safeSet("lorem_cfg", JSON.stringify({ font, fontSize, lineHeight, color, pageSize, goal, dark: isDark, lang, autoCorrect, autoComplete, readingSpeed, customReadingWPM, speakingWPM }));
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 1200);
    }, 400);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [html, text, font, fontSize, lineHeight, color, pageSize, goal, isDark, lang, autoCorrect, autoComplete, readingSpeed, customReadingWPM, speakingWPM]);

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

  // -------- OUTSIDE CLICK --------
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(e.target as Node)) setShowShareMenu(false);
      if (colorMenuRef.current && !colorMenuRef.current.contains(e.target as Node)) setShowColorPicker(false);
      if (bgMenuRef.current && !bgMenuRef.current.contains(e.target as Node)) setShowBgPicker(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
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
    const density = top10.map(([k, v]) => [k, ((v / Math.max(1, words)) * 100).toFixed(2)] as [string, string]);
    const sentArr = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
    const sentLens = sentArr.map(s => s.split(/\s+/).length);
    const short = sentLens.filter(l => l <= 10).length;
    const medium = sentLens.filter(l => l > 10 && l <= 20).length;
    const long = sentLens.filter(l => l > 20).length;
    return { words, chars, charsNoSpace, sentences, paras, lines, readingSeconds, speakingSeconds, flesch, level, top10, density, short, medium, long, totalSent: sentArr.length };
  }, [text, effectiveReadingWPM, speakingWPM]);

  const duplicates = useMemo(() => {
    const trimmed = text.trim();
    if (!trimmed) return { words: [] as [string, number][], sentences: [] as { text: string; count: number }[], lines: [] as { text: string; count: number }[] };
    const words = trimmed.toLowerCase().split(/\s+/).map(w => w.replace(/[^a-z0-9]/g, "")).filter(w => w.length > 3);
    const wc: Record<string, number> = {};
    words.forEach(w => { wc[w] = (wc[w] || 0) + 1; });
    const dupWords = Object.entries(wc).filter(([, c]) => c > 1).sort((a, b) => b[1] - a[1]).slice(0, 20);
    const sentences = text.split(/[.!?]+/).map(s => s.trim().toLowerCase()).filter(s => s.length > 20);
    const sc: Record<string, number> = {};
    sentences.forEach(s => { sc[s] = (sc[s] || 0) + 1; });
    const dupSentences = Object.entries(sc).filter(([, c]) => c > 1).map(([s, c]) => ({ text: s.slice(0, 80), count: c }));
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
        const Ctx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new Ctx();
        const osc = ctx.createOscillator(); const g = ctx.createGain();
        osc.connect(g); g.connect(ctx.destination);
        osc.frequency.value = 880; g.gain.value = 0.08;
        osc.start(); osc.stop(ctx.currentTime + 0.15);
      } catch {}
      setTimeout(() => setToast(null), 4000);
      setTimeout(() => setShowConfetti(false), 3500);
    } else if (stats.words < goal * 0.95) {
      setGoalReached(false);
    }
  }, [stats.words, goal, goalReached]);

  // -------- SYNC --------
  const syncFromEditor = useCallback(() => {
    if (!editorRef.current) return;
    const newHtml = editorRef.current.innerHTML;
    const newText = editorRef.current.innerText || "";
    setHtml(newHtml);
    setText(newText);
  }, []);

  // -------- SAVE SELECTION --------
  const saveSelection = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || !editorRef.current) return;
    const range = sel.getRangeAt(0);
    if (!editorRef.current.contains(range.commonAncestorContainer)) return;
    if (range.toString().length === 0) return;
    const start = getTextOffset(range.startContainer, range.startOffset, editorRef.current);
    const end = getTextOffset(range.endContainer, range.endOffset, editorRef.current);
    if (start !== end) savedSelRef.current = { start, end };
  }, []);

  useEffect(() => {
    const handler = () => {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0 || !editorRef.current) return;
      const range = sel.getRangeAt(0);
      if (!editorRef.current.contains(range.commonAncestorContainer)) return;
      if (range.toString().length === 0) return;
      const start = getTextOffset(range.startContainer, range.startOffset, editorRef.current);
      const end = getTextOffset(range.endContainer, range.endOffset, editorRef.current);
      if (start !== end) savedSelRef.current = { start, end };
    };
    document.addEventListener("selectionchange", handler);
    return () => document.removeEventListener("selectionchange", handler);
  }, []);

  const getCaretOffset = (): number => {
    if (!editorRef.current) return text.length;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return text.length;
    try {
      const range = sel.getRangeAt(0);
      const pre = range.cloneRange();
      pre.selectNodeContents(editorRef.current);
      pre.setEnd(range.endContainer, range.endOffset);
      return pre.toString().length;
    } catch { return text.length; }
  };

  const setCaretOffset = (offset: number) => {
    if (!editorRef.current) return;
    const root = editorRef.current;
    let remaining = offset;
    const range = document.createRange();
    let found = false;
    const visit = (n: Node): boolean => {
      if (found) return true;
      if (n.nodeType === Node.TEXT_NODE) {
        const len = n.textContent?.length || 0;
        if (remaining <= len) { range.setStart(n, remaining); range.collapse(true); found = true; return true; }
        remaining -= len;
      } else {
        for (let i = 0; i < n.childNodes.length; i++) if (visit(n.childNodes[i])) return true;
      }
      return false;
    };
    visit(root);
    if (!found) { range.selectNodeContents(root); range.collapse(false); }
    const sel = window.getSelection();
    if (sel) { sel.removeAllRanges(); sel.addRange(range); }
  };

  const restoreSelection = (): boolean => {
    if (!editorRef.current) return false;
    const saved = savedSelRef.current;
    if (!saved || saved.start === saved.end) return false;
    const startPos = getNodeAtOffset(saved.start, editorRef.current);
    const endPos = getNodeAtOffset(saved.end, editorRef.current);
    if (!startPos || !endPos) return false;
    editorRef.current.focus();
    try {
      const range = document.createRange();
      range.setStart(startPos.node, startPos.offset);
      range.setEnd(endPos.node, endPos.offset);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
      return true;
    } catch { return false; }
  };

  // ✅ FIXED: 'Range.isCollapsed' → 'Range.collapsed'
  const hasLiveSelection = (): boolean => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || !editorRef.current) return false;
    const r = sel.getRangeAt(0);
    return editorRef.current.contains(r.commonAncestorContainer) && !r.collapsed && r.toString().length > 0;
  };

  // -------- FORMATTING --------
  const updateActiveFormats = useCallback(() => {
    try {
      setActiveFormats({
        bold: document.queryCommandState("bold"),
        italic: document.queryCommandState("italic"),
        underline: document.queryCommandState("underline"),
        strikeThrough: document.queryCommandState("strikeThrough"),
        superscript: document.queryCommandState("superscript"),
        subscript: document.queryCommandState("subscript"),
        insertUnorderedList: document.queryCommandState("insertUnorderedList"),
        insertOrderedList: document.queryCommandState("insertOrderedList"),
        justifyLeft: document.queryCommandState("justifyLeft"),
        justifyCenter: document.queryCommandState("justifyCenter"),
        justifyRight: document.queryCommandState("justifyRight"),
        justifyFull: document.queryCommandState("justifyFull"),
      });
    } catch {}
  }, []);

  useEffect(() => {
    document.addEventListener("selectionchange", updateActiveFormats);
    return () => document.removeEventListener("selectionchange", updateActiveFormats);
  }, [updateActiveFormats]);

  const exec = useCallback((cmd: string, val?: string) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    if (savedSelRef.current) restoreSelection();
    try { document.execCommand("styleWithCSS", false, "true"); } catch {}
    document.execCommand(cmd, false, val);
    syncFromEditor();
    updateActiveFormats();
  }, [syncFromEditor, updateActiveFormats]);

  const applyColorToSelection = useCallback((newColor: string, isHighlight = false) => {
    const editor = editorRef.current;
    if (!editor) return;

    if (hasLiveSelection()) {
      editor.focus();
      try { document.execCommand("styleWithCSS", false, "true"); } catch {}
      document.execCommand(isHighlight ? "hiliteColor" : "foreColor", false, newColor);
      if (isHighlight) setHighlight(newColor); else setColor(newColor);
      syncFromEditor();
      setToast(isHighlight ? "✨ Highlight applied" : "🎨 Color applied");
      setTimeout(() => setToast(null), 1500);
      return;
    }

    if (restoreSelection() && hasLiveSelection()) {
      try { document.execCommand("styleWithCSS", false, "true"); } catch {}
      document.execCommand(isHighlight ? "hiliteColor" : "foreColor", false, newColor);
      if (isHighlight) setHighlight(newColor); else setColor(newColor);
      syncFromEditor();
      setToast(isHighlight ? "✨ Highlight applied" : "🎨 Color applied");
      setTimeout(() => setToast(null), 1500);
      return;
    }

    setToast("⚠ Select text first, then pick a color");
    setTimeout(() => setToast(null), 2200);
  }, [syncFromEditor]);

  const applyFontToSelection = useCallback((fontName: string) => {
    const editor = editorRef.current;
    if (!editor) return;
    setFont(fontName);
    if (hasLiveSelection()) {
      try { document.execCommand("styleWithCSS", false, "true"); } catch {}
      document.execCommand("fontName", false, fontName);
      syncFromEditor();
      setToast(`🔤 ${fontName} applied to selection`);
      setTimeout(() => setToast(null), 1500);
    } else if (restoreSelection() && hasLiveSelection()) {
      try { document.execCommand("styleWithCSS", false, "true"); } catch {}
      document.execCommand("fontName", false, fontName);
      syncFromEditor();
      setToast(`🔤 ${fontName} applied to selection`);
      setTimeout(() => setToast(null), 1500);
    } else {
      setToast(`Font set to ${fontName} (whole editor)`);
      setTimeout(() => setToast(null), 1800);
    }
  }, [syncFromEditor]);

  const formatHeading = (tag: string) => { exec("formatBlock", tag); setToast(`📌 ${tag.toUpperCase()} applied`); setTimeout(() => setToast(null), 1200); };
  const insertLink = () => {
    const url = prompt("Enter URL:", "https://");
    if (!url || url === "https://") return;
    if (!hasLiveSelection()) { if (!restoreSelection()) { setToast("⚠ Select text first"); setTimeout(() => setToast(null), 2200); return; } }
    exec("createLink", url);
    setToast("🔗 Link added");
    setTimeout(() => setToast(null), 1500);
  };
  const insertHR = () => { exec("insertHorizontalRule"); setToast("➖ HR inserted"); setTimeout(() => setToast(null), 1200); };
  const insertVR = () => {
    editorRef.current?.focus();
    const htmlVr = `<span contenteditable="false" style="display:inline-block;border-left:2px solid #a855f7;height:1.2em;margin:0 8px;vertical-align:middle"></span>`;
    document.execCommand("insertHTML", false, htmlVr);
    syncFromEditor();
    setToast("│ VR inserted");
    setTimeout(() => setToast(null), 1200);
  };
  const insertCode = () => exec("formatBlock", "pre");
  const insertQuote = () => exec("formatBlock", "blockquote");

  // -------- SHARE --------
  const openShare = (u: string) => { window.open(u, "_blank", "noopener,noreferrer"); setShowShareMenu(false); };
  const shareViaTwitter = () => openShare(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text.slice(0, 250))}`);
  const shareViaFacebook = () => openShare(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`);
  const shareViaWhatsApp = () => openShare(`https://wa.me/?text=${encodeURIComponent(text.slice(0, 500))}`);
  const shareViaLinkedIn = () => openShare(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`);
  const shareViaTelegram = () => openShare(`https://t.me/share/url?url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}&text=${encodeURIComponent(text.slice(0, 250))}`);
  const shareViaEmail = () => { if (typeof window !== "undefined") window.location.href = `mailto:?subject=${encodeURIComponent("Shared")}&body=${encodeURIComponent(text.slice(0, 1500))}`; setShowShareMenu(false); };
  const copyForShare = async () => { try { await navigator.clipboard.writeText(text); setToast("✓ Copied"); setTimeout(() => setToast(null), 1500); } catch {} setShowShareMenu(false); };
  const nativeShare = async () => { if (typeof navigator !== "undefined" && navigator.share) { try { await navigator.share({ title: "Word Counter Pro", text: text.slice(0, 200) }); } catch {} } else copyForShare(); setShowShareMenu(false); };

  // -------- INPUT --------
  const handleInput = () => {
    markActive();
    if (!editorRef.current) return;
    let current = editorRef.current.innerText || "";
    if (autoCorrect) {
      const caret = getCaretOffset();
      const beforeCaret = current.slice(0, caret);
      const m = beforeCaret.match(/(\b[a-zA-Z]{2,})\s$/);
      if (m) {
        const word = m[1];
        const lower = word.toLowerCase();
        if (AUTO_CORRECT[lower]) {
          const fixed = word[0] === word[0].toUpperCase() ? AUTO_CORRECT[lower][0].toUpperCase() + AUTO_CORRECT[lower].slice(1) : AUTO_CORRECT[lower];
          const wordStart = caret - m[0].length;
          const next = current.slice(0, wordStart) + fixed + current.slice(wordStart + word.length);
          editorRef.current.innerText = next;
          current = next;
          setCaretOffset(wordStart + fixed.length);
        }
      }
    }
    setHtml(editorRef.current.innerHTML);
    setText(current);
    if (autoComplete) {
      const m = current.match(/([a-zA-Z]{2,})$/);
      if (m) {
        const prefix = m[1].toLowerCase();
        const sugg = DICTIONARY.filter(w => w.startsWith(prefix) && w !== prefix).slice(0, 5);
        setSuggestions(sugg.map(w => ({ word: w, at: current.length - m[1].length, replaceLen: m[1].length })));
      } else setSuggestions([]);
    } else setSuggestions([]);
  };

  const insertSuggestion = (s: Suggestion) => {
    if (!editorRef.current) return;
    const next = text.slice(0, s.at) + s.word + text.slice(s.at + s.replaceLen);
    editorRef.current.innerText = next;
    setHtml(editorRef.current.innerHTML);
    setText(next);
    setSuggestions([]);
    setCaretOffset(s.at + s.word.length);
    editorRef.current.focus();
  };

  const insertAtCursor = (insert: string) => {
    const editor = editorRef.current;
    if (!editor) { setText(t => t + (t ? " " : "") + insert); return; }
    editor.focus();
    document.execCommand("insertText", false, insert);
    syncFromEditor();
  };

  // -------- EDIT OPS --------
  const handleCopy = async () => {
    try {
      const sel = window.getSelection();
      const selected = sel && sel.toString().length > 0 ? sel.toString() : text;
      await navigator.clipboard.writeText(selected);
      setCopied(true); setTimeout(() => setCopied(false), 1500);
    } catch {}
  };
  const handleCut = async () => {
    if (!hasLiveSelection()) { setToast("⚠ Select text first"); setTimeout(() => setToast(null), 1800); return; }
    const sel = window.getSelection();
    if (!sel) return;
    try { await navigator.clipboard.writeText(sel.toString()); } catch {}
    sel.deleteFromDocument();
    syncFromEditor();
  };
  const handlePaste = async () => {
    editorRef.current?.focus();
    try { const clip = await navigator.clipboard.readText(); if (clip) document.execCommand("insertText", false, clip); }
    catch { document.execCommand("paste"); }
    syncFromEditor();
  };
  const handleDeleteKey = () => { editorRef.current?.focus(); document.execCommand("forwardDelete"); syncFromEditor(); };
  const handleBackspace = () => { editorRef.current?.focus(); document.execCommand("delete"); syncFromEditor(); };
  const handleClear = () => { if (!text) return; if (!confirm("Clear all text? Cannot be undone.")) return; if (editorRef.current) editorRef.current.innerHTML = ""; setHtml(""); setText(""); setErrors([]); setWritingTime(0); };

  const handleCopyStats = async () => {
    const s = `Words: ${stats.words} | Chars(with): ${stats.chars} | Chars(without): ${stats.charsNoSpace} | Sentences: ${stats.sentences} | Paragraphs: ${stats.paras} | Lines: ${stats.lines} | Reading: ${formatMinSec(stats.readingSeconds)} | Speaking: ${formatMinSec(stats.speakingSeconds)} | Writing: ${formatTime(writingTime)} | Flesch: ${stats.flesch} (${stats.level})`;
    try { await navigator.clipboard.writeText(s); setCopiedStats(true); setTimeout(() => setCopiedStats(false), 1500); } catch {}
  };

  const downloadBlob = (blob: Blob, name: string) => { const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; a.click(); URL.revokeObjectURL(a.href); };
  const exportTxt = () => downloadBlob(new Blob([text], { type: "text/plain" }), "doc.txt");
  const exportHtmlFile = () => downloadBlob(new Blob([`<!doctype html><html><head><meta charset="utf-8"><title>Document</title></head><body style="font-family:${FONTS.find(f => f.name === font)?.css};font-size:${fontSize}px;line-height:${lineHeight};padding:40px;max-width:800px;margin:auto;color:${color}">${html || escapeHtml(text)}</body></html>`], { type: "text/html" }), "doc.html");
  const exportDoc = () => downloadBlob(new Blob([`<html><body>${html || escapeHtml(text)}</body></html>`], { type: "application/msword" }), "doc.doc");
  const exportPdf = () => { const w = window.open("", "_blank"); if (w) { w.document.write(`<div style="font-family:${FONTS.find(f => f.name === font)?.css};font-size:${fontSize}px;line-height:${lineHeight};padding:24px;color:${color}">${html || escapeHtml(text)}</div>`); w.document.close(); setTimeout(() => w.print(), 300); } };
  const exportCsv = () => {
    const rows = [["Metric","Value"],["Words",stats.words],["Chars (with)",stats.chars],["Chars (without)",stats.charsNoSpace],["Sentences",stats.sentences],["Paragraphs",stats.paras],["Lines",stats.lines],["Reading Time",formatMinSec(stats.readingSeconds)],["Speaking Time",formatMinSec(stats.speakingSeconds)],["Writing Time",formatTime(writingTime)],["Flesch Score",stats.flesch],["Level",stats.level]];
    downloadBlob(new Blob([rows.map(r => r.join(",")).join("\n")], { type: "text/csv" }), "stats.csv");
  };

  const toggleVoice = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert("❌ Voice typing only in Chrome/Edge over HTTPS."); return; }
    if (isListening && recognitionRef.current) { try { recognitionRef.current.stop(); } catch {} setIsListening(false); return; }
    try {
      const rec = new SR(); recognitionRef.current = rec;
      rec.lang = lang; rec.continuous = false; rec.interimResults = false; rec.maxAlternatives = 1;
      rec.onstart = () => setIsListening(true);
      rec.onresult = (event: any) => { const transcript = event.results[0][0].transcript; insertAtCursor(" " + transcript); };
      rec.onerror = () => setIsListening(false);
      rec.onend = () => setIsListening(false);
      rec.start();
    } catch { setIsListening(false); }
  };
  const toggleSpeak = () => {
    if (isSpeaking) { speechSynthesis.cancel(); setIsSpeaking(false); return; }
    if (!text.trim()) return;
    const u = new SpeechSynthesisUtterance(text); u.lang = lang;
    u.onstart = () => setIsSpeaking(true); u.onend = () => setIsSpeaking(false); u.onerror = () => setIsSpeaking(false);
    speechSynthesis.speak(u);
  };

  const fixError = (err: ErrorItem) => { const nt = text.substring(0, err.offset) + err.replacement + text.substring(err.offset + err.length); if (editorRef.current) editorRef.current.innerText = nt; setHtml(editorRef.current?.innerHTML || ""); setText(nt); setErrors(p => p.filter(e => e !== err)); };
  const fixAll = () => { let nt = text; [...errors].sort((a, b) => b.offset - a.offset).forEach(err => { nt = nt.substring(0, err.offset) + err.replacement + nt.substring(err.offset + err.length); }); if (editorRef.current) editorRef.current.innerText = nt; setHtml(editorRef.current?.innerHTML || ""); setText(nt); setErrors([]); };

  const changeCase = (mode: string) => {
    if (!text || !mode) return;
    let out = text;
    if (mode === "upper") out = text.toUpperCase();
    else if (mode === "lower") out = text.toLowerCase();
    else if (mode === "title") out = text.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.substr(1).toLowerCase());
    else if (mode === "sentence") out = text.toLowerCase().replace(/(^\s*\w|[.!?]\s+\w)/g, c => c.toUpperCase());
    else if (mode === "capitalize") out = text.replace(/\b\w/g, c => c.toUpperCase());
    else if (mode === "toggle") out = text.split("").map(c => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()).join("");
    if (editorRef.current) editorRef.current.innerText = out;
    setHtml(editorRef.current?.innerHTML || "");
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
      if (editorRef.current) editorRef.current.innerText = out;
      setHtml(editorRef.current?.innerHTML || "");
      setText(out);
      setToast("✓ Replaced");
      setTimeout(() => setToast(null), 1500);
    } catch {}
  };

  // -------- TOOLS --------
  const setBoth = (fn: (t: string) => string) => { const t = fn(text); if (editorRef.current) editorRef.current.innerText = t; setText(t); setHtml(editorRef.current?.innerHTML || ""); };
  const cleanExtraSpaces = () => setBoth(t => t.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim());
  const removeBlankLines = () => setBoth(t => t.split(/\n/).filter(l => l.trim().length > 0).join("\n"));
  const removeDupLines = () => { const seen = new Set<string>(); setBoth(t => t.split(/\n/).filter(l => { const k = l.trim().toLowerCase(); if (!k || seen.has(k)) return false; seen.add(k); return true; }).join("\n")); };
  const removeDupSentences = () => { const seen = new Set<string>(); setBoth(t => t.split(/(?<=[.!?])\s+/).filter(s => { const k = s.trim().toLowerCase(); if (!k || seen.has(k)) return false; seen.add(k); return true; }).join(" ")); };
  const normalizePunctuation = () => setBoth(t => t.replace(/\s+([,.!?;:])/g, "$1").replace(/([,.!?;:])(?=\S)/g, "$1 ").replace(/\s+/g, " ").trim());
  const removeSpecialChars = () => setBoth(t => t.replace(/[^\w\s.,!?'"\-()]/g, ""));
  const removeNumbers = () => setBoth(t => t.replace(/\d+/g, ""));
  const removeHtmlTags = () => setBoth(t => t.replace(/<[^>]*>/g, ""));
  const toSlug = () => setBoth(t => t.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-"));
  const toCommaSeparated = () => setBoth(t => t.split(/[\n,]+/).map(x => x.trim()).filter(Boolean).join(", "));
  const toLineSeparated = () => setBoth(t => t.split(/[,\n]+/).map(x => x.trim()).filter(Boolean).join("\n"));
  const toPlainText = () => setBoth(t => t.replace(/\s+/g, " ").trim());
  const toJsonSafe = () => setBoth(t => JSON.stringify(t).slice(1, -1));
  const sortAZ = () => setBoth(t => t.split(/\n/).sort((a, b) => a.localeCompare(b)).join("\n"));
  const sortZA = () => setBoth(t => t.split(/\n/).sort((a, b) => b.localeCompare(a)).join("\n"));
  const sortByLength = () => setBoth(t => t.split(/\n/).sort((a, b) => a.length - b.length).join("\n"));
  const sortByWordCount = () => setBoth(t => t.split(/\n/).sort((a, b) => a.split(/\s+/).length - b.split(/\s+/).length).join("\n"));
  const reverseChars = () => setBoth(t => t.split("").reverse().join(""));
  const reverseWords = () => setBoth(t => t.split(/\s+/).reverse().join(" "));
  const reverseLines = () => setBoth(t => t.split(/\n/).reverse().join("\n"));
  const trimLeading = () => setBoth(t => t.split(/\n/).map(l => l.replace(/^\s+/, "")).join("\n"));
  const trimTrailing = () => setBoth(t => t.split(/\n/).map(l => l.replace(/\s+$/, "")).join("\n"));
  const collapseSpaces = () => setBoth(t => t.replace(/[ \t]+/g, " "));
  const tabsToSpaces = () => setBoth(t => t.replace(/\t/g, "    "));

  // -------- QUALITY --------
  const quality = useMemo(() => {
    const trimmed = text.trim();
    const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
    const longSentences = sentences.filter(s => s.split(/\s+/).length > 25).length;
    const paragraphs = text.split(/\n+/).map(p => p.trim()).filter(p => p.length > 0);
    const veryLongParas = paragraphs.filter(p => p.split(/\s+/).length > 150).length;
    const fillerCount = FILLER_WORDS.reduce((acc, fw) => acc + ((text.match(new RegExp(`\\b${fw}\\b`, "gi")) || []).length), 0);
    const weakCount = WEAK_PHRASES.reduce((acc, wp) => acc + ((text.match(new RegExp(wp.replace(/\s+/g, "\\s+"), "gi")) || []).length), 0);
    const excessivePunct = (text.match(/[!?]{2,}/g) || []).length + (text.match(/\.{4,}/g) || []).length;
    const multipleSpaces = (text.match(/ {2,}/g) || []).length;
    const allCapsWords = (trimmed.match(/\b[A-Z]{3,}\b/g) || []).length;
    return { longSentences, veryLongParas, fillerCount, weakCount, excessivePunct, multipleSpaces, allCapsWords, dupWordCount: duplicates.words.length, dupSentenceCount: duplicates.sentences.length };
  }, [text, duplicates]);

  const getGrammar = useCallback(async () => {
    if (!text.trim() || text.length < 5) return;
    if (grammarAbortRef.current) grammarAbortRef.current.abort();
    const ctrl = new AbortController(); grammarAbortRef.current = ctrl;
    setChecking(true);
    try {
      const res = await fetch("https://api.languagetool.org/v2/check", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `text=${encodeURIComponent(text)}&language=${lang}&level=picky`,
        signal: ctrl.signal,
      });
      const data = await res.json();
      const errs: ErrorItem[] = (data.matches || []).slice(0, 15).map((m: any) => ({ message: m.message, offset: m.offset, length: m.length, replacement: m.replacements?.[0]?.value || "" }));
      setErrors(errs);
    } catch {} finally { setChecking(false); }
  }, [text, lang]);

  useEffect(() => {
    if (text.length < 15) return;
    const t = setTimeout(() => { getGrammar(); }, 1500);
    return () => clearTimeout(t);
  }, [text, lang, getGrammar]);

  const highlightedHtml = useMemo(() => {
    if (!showHighlight || errors.length === 0) return "";
    let out = escapeHtml(text);
    [...errors].sort((a, b) => b.offset - a.offset).forEach(err => {
      if (err.offset < 0 || err.offset + err.length > text.length) return;
      const before = out.substring(0, err.offset);
      const mid = out.substring(err.offset, err.offset + err.length);
      const after = out.substring(err.offset + err.length);
      out = `${before}<span style="text-decoration:underline wavy red 2.5px;text-underline-offset:4px;background:rgba(255,0,0,0.08)">${mid}</span>${after}`;
    });
    return out.replace(/\n/g, "<br>");
  }, [text, errors, showHighlight]);

  // -------- KEYBOARD --------
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;
      const inEditor = editorRef.current && document.activeElement === editorRef.current;
      if (ctrl && e.key.toLowerCase() === "s") { e.preventDefault(); safeSet("lorem_word_html", html); safeSet("lorem_word_text", text); setSaveStatus("saved"); setTimeout(() => setSaveStatus("idle"), 1000); return; }
      if (ctrl && e.key.toLowerCase() === "f") { e.preventDefault(); setShowFind(v => !v); return; }
      if (!inEditor) return;
      if (ctrl && !shift && e.key.toLowerCase() === "b") { e.preventDefault(); exec("bold"); return; }
      if (ctrl && !shift && e.key.toLowerCase() === "i") { e.preventDefault(); exec("italic"); return; }
      if (ctrl && !shift && e.key.toLowerCase() === "u") { e.preventDefault(); exec("underline"); return; }
      if (ctrl && shift && e.key.toLowerCase() === "s") { e.preventDefault(); exec("strikeThrough"); return; }
      if (ctrl && e.key.toLowerCase() === "k") { e.preventDefault(); insertLink(); return; }
      if (ctrl && !shift && e.key.toLowerCase() === "z") { e.preventDefault(); exec("undo"); return; }
      if (ctrl && shift && e.key.toLowerCase() === "z") { e.preventDefault(); exec("redo"); return; }
      if (ctrl && e.key.toLowerCase() === "y") { e.preventDefault(); exec("redo"); return; }
      if (ctrl && shift && e.key === "7") { e.preventDefault(); exec("insertOrderedList"); return; }
      if (ctrl && shift && e.key === "8") { e.preventDefault(); exec("insertUnorderedList"); return; }
      if (e.key === "Tab" && suggestions.length > 0) { e.preventDefault(); insertSuggestion(suggestions[0]); return; }
      if (e.key === "Escape") { setSuggestions([]); setShowShareMenu(false); setShowColorPicker(false); setShowBgPicker(false); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [html, text, suggestions, exec]);

  const loadSample = () => { const s = `<p>${SAMPLE}</p>`; if (editorRef.current) editorRef.current.innerHTML = s; setHtml(s); setText(SAMPLE); };
  const currentFont = FONTS.find(f => f.name === font) || FONTS[0];
  const page = PAGE_SIZES[pageSize] || PAGE_SIZES.A4;
  const activeSocialData = SOCIAL_PLATFORMS.find(s => s.name === activeSocial) || SOCIAL_PLATFORMS[0];
  const socialStats = useMemo(() => {
    const chars = socialText.length;
    const words = socialText.trim() ? socialText.trim().split(/\s+/).filter(Boolean).length : 0;
    const remaining = activeSocialData.limit - chars;
    return {
      chars, words, remaining,
      progressPct: Math.min(100, Math.round((chars / activeSocialData.limit) * 100)),
      recommendedPct: Math.min(100, Math.round((chars / activeSocialData.recommended) * 100)),
    };
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
            <button onClick={() => setIsFocus(false)} className="px-4 py-2 glass-btn rounded-xl text-sm font-bold btn-shine">← Exit Focus</button>
            <span className="text-sm opacity-60">{stats.words} words • {formatTime(writingTime)} • {autoLang}</span>
          </div>
          <div className="glass rounded-3xl p-6">
            <div ref={editorRef} contentEditable suppressContentEditableWarning
              onInput={handleInput}
              onMouseUp={saveSelection}
              onKeyUp={saveSelection}
              onBlur={saveSelection}
              className="w-full min-h-[75vh] outline-none"
              style={{ fontFamily: currentFont.css, fontSize: `${fontSize}px`, lineHeight, color: isDark ? "#fff" : color }} />
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
        .glass-btn:hover{transform:translateY(-2px) scale(1.02);box-shadow:0 12px 24px rgba(139,92,246,0.25)}
        .glass-btn.active-fmt{background:linear-gradient(135deg,#a855f7,#ec4899) !important;color:#fff !important;border-color:transparent !important}
        .fmt-btn{padding:0;min-width:34px;height:34px;display:inline-flex;align-items:center;justify-content:center;font-weight:700;border-radius:10px;font-size:13px}
        [contenteditable]:focus{outline:none}
        [contenteditable] a{color:#7c3aed;text-decoration:underline}
        [contenteditable] blockquote{border-left:4px solid #a855f7;padding-left:12px;margin:8px 0;opacity:0.9}
        [contenteditable] pre{background:rgba(124,58,237,0.08);padding:10px;border-radius:8px;font-family:'JetBrains Mono',monospace;white-space:pre-wrap}
        [contenteditable] hr{border:none;border-top:2px solid rgba(168,85,247,0.3);margin:12px 0}
        [contenteditable] ul,[contenteditable] ol{padding-left:22px;margin:4px 0}
        [contenteditable] h1{font-size:2em;font-weight:900;margin:12px 0 8px}
        [contenteditable] h2{font-size:1.6em;font-weight:800;margin:10px 0 6px}
        [contenteditable] h3{font-size:1.35em;font-weight:700;margin:8px 0 5px}
        [contenteditable] h4{font-size:1.15em;font-weight:700;margin:6px 0 4px}
        [contenteditable] h5{font-size:1em;font-weight:700;margin:4px 0 3px}
        [contenteditable] h6{font-size:0.9em;font-weight:700;margin:4px 0 3px;opacity:0.85}
        @keyframes popIn{0%{transform:scale(0.4);opacity:0}60%{transform:scale(1.15)}100%{transform:scale(1);opacity:1}}
        @keyframes confettiFall{0%{transform:translateY(-20px) rotate(0deg);opacity:1}100%{transform:translateY(100vh) rotate(720deg);opacity:0}}
        @keyframes glowPulse{0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,0.4)}50%{box-shadow:0 0 0 12px rgba(34,197,94,0)}}
        @keyframes dropIn{0%{transform:translateY(-10px);opacity:0}100%{transform:translateY(0);opacity:1}}
        @keyframes barShine{0%{background-position:-200% 0}100%{background-position:200% 0}}
        @keyframes shimmer{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
        .gradient-text{background:linear-gradient(90deg,#a855f7,#ec4899,#06b6d4);background-size:200% auto;animation:shimmer 4s linear infinite;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
        .anim-pop{animation:popIn 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards}
        .anim-drop{animation:dropIn 0.2s ease-out forwards}
        .progress-bar{background-size:200% 100%;animation:barShine 2s linear infinite}
        .celebrate{animation:glowPulse 1.5s ease-in-out infinite}
        .confetti-piece{position:fixed;width:10px;height:10px;top:-20px;animation:confettiFall 3s linear forwards;z-index:100;pointer-events:none}
        .accordion-content{overflow:hidden;transition:max-height 0.4s ease-out;max-height:0}
        .accordion-content.open{max-height:8000px}
        .tab-btn{transition:all 0.25s}
        .tab-btn.active{background:linear-gradient(135deg,#a855f7,#ec4899) !important;color:#fff !important;border-color:transparent !important}
      `}</style>

      {toast && (<div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-2xl shadow-2xl font-bold anim-pop max-w-[90vw] text-center">{toast}</div>)}

      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-40">
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={i} className="confetti-piece" style={{ left: `${(i * 2.5) % 100}%`, background: ["#a855f7","#ec4899","#06b6d4","#f59e0b","#10b981","#ef4444"][i % 6], animationDelay: `${(i % 8) * 0.1}s`, animationDuration: `${2 + (i % 5) * 0.3}s`, borderRadius: i % 2 ? "50%" : "2px" }} />
          ))}
        </div>
      )}

      <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-8 relative">
        <div className="text-center mb-6">
          <div className="inline-flex px-4 py-1.5 rounded-full glass-btn text-[11px] tracking-widest mb-3 font-bold">✨ RICH TEXT · 40+ TOOLS · SOCIAL SHARE</div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black gradient-text">Word Counter Pro</h1>
          <p className="mt-2 opacity-70 text-xs sm:text-sm">Rich text editor, 40+ tools, grammar check, social share</p>
          <div className="flex justify-center gap-2 mt-4 flex-wrap items-center">
            <select value={lang} onChange={e => setLang(e.target.value)} className="h-9 rounded-xl glass-btn px-3 text-xs sm:text-sm font-bold">{LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.flag} {l.label}</option>)}</select>
            <span className="text-[10px] sm:text-xs px-3 py-1.5 rounded-full bg-gradient-to-r from-violet-600 to-pink-600 text-white font-bold">{autoLang}</span>
            <span className="text-xs sm:text-sm opacity-70">{stats.words}/{goal} • {progress}%</span>
            <span className={`text-[10px] sm:text-xs px-2 py-1.5 rounded-full ${saveStatus === "saved" ? "bg-green-500/20 text-green-700 dark:text-green-300" : "glass-btn"}`}>{saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "Saved ✓" : "Auto-save"}</span>
            <span className={`text-[10px] sm:text-xs px-2 py-1.5 rounded-full ${isActive ? "bg-blue-500/20 text-blue-700 dark:text-blue-300" : "glass-btn"}`}>⏱ {formatTime(writingTime)}</span>
          </div>
          <div className="flex justify-center items-center gap-3 mt-3">
            <div className={`max-w-md w-full h-2.5 bg-white/40 dark:bg-white/10 rounded-full overflow-hidden ${goalReached ? "celebrate" : ""}`}>
              <div style={{ width: `${progress}%` }} className={`h-full transition-all duration-700 progress-bar ${progress >= 100 ? "bg-gradient-to-r from-green-400 to-emerald-500" : "bg-gradient-to-r from-violet-500 via-pink-500 to-cyan-500"}`} />
            </div>
            <span className="text-xs font-bold">{stats.words}/{goal}</span>
            <input type="number" min={1} value={goal} onChange={e => setGoal(Math.max(1, parseInt(e.target.value) || 1))} className="w-20 h-7 text-xs px-2 rounded-lg glass-btn" />
          </div>
        </div>

        {/* TOOLBAR ROW 1 */}
        <div className="glass rounded-2xl p-2 sm:p-3 mb-2 flex flex-wrap gap-1.5 items-center justify-between sticky top-2 z-30">
          <div className="flex gap-1 flex-wrap items-center">
            <button onClick={handleCut} className="h-9 px-3 rounded-lg glass-btn text-xs font-bold">✂ Cut</button>
            <button onClick={handleCopy} className={`h-9 px-3 rounded-lg glass-btn text-xs font-bold ${copied ? "bg-green-500 text-white" : ""}`}>{copied ? "✓ Copied!" : "📋 Copy"}</button>
            <button onClick={handlePaste} className="h-9 px-3 rounded-lg glass-btn text-xs font-bold">📥 Paste</button>
            <button onClick={handleBackspace} className="h-9 px-3 rounded-lg glass-btn text-xs font-bold">⌫</button>
            <button onClick={handleDeleteKey} className="h-9 px-3 rounded-lg bg-red-500/20 text-red-700 dark:text-red-300 text-xs font-bold border border-red-300/40">⌦</button>
            <button onClick={() => setShowFormatBar(v => !v)} className={`h-9 px-3 rounded-lg text-xs font-bold transition-all ${showFormatBar ? "glass-btn" : "bg-gradient-to-r from-violet-600 to-pink-600 text-white"}`}>{showFormatBar ? "▲ Hide Format" : "▼ Show Format"}</button>
            <button onClick={handleClear} className="h-9 px-3 rounded-lg bg-red-500/20 text-red-700 dark:text-red-300 text-xs font-bold border border-red-300/40">🗑 Clear</button>
          </div>
          <div className="flex gap-1.5 flex-wrap items-center">
            <div className="relative" ref={shareMenuRef}>
              <button onClick={() => setShowShareMenu(v => !v)} className={`h-9 px-3 rounded-xl text-xs font-bold transition-all ${showShareMenu ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white" : "glass-btn"}`}>🔗 Share ▾</button>
              {showShareMenu && (
                <div className="absolute top-full mt-1 right-0 glass rounded-xl shadow-2xl overflow-hidden z-50 min-w-[200px] anim-drop">
                  <button onClick={shareViaTwitter} className="w-full text-left px-4 py-2 text-xs hover:bg-violet-500/20 flex items-center gap-2">🐦 <span>Twitter / X</span></button>
                  <button onClick={shareViaFacebook} className="w-full text-left px-4 py-2 text-xs hover:bg-violet-500/20 flex items-center gap-2">👥 <span>Facebook</span></button>
                  <button onClick={shareViaWhatsApp} className="w-full text-left px-4 py-2 text-xs hover:bg-violet-500/20 flex items-center gap-2">💬 <span>WhatsApp</span></button>
                  <button onClick={shareViaLinkedIn} className="w-full text-left px-4 py-2 text-xs hover:bg-violet-500/20 flex items-center gap-2">💼 <span>LinkedIn</span></button>
                  <button onClick={shareViaTelegram} className="w-full text-left px-4 py-2 text-xs hover:bg-violet-500/20 flex items-center gap-2">✈️ <span>Telegram</span></button>
                  <button onClick={shareViaEmail} className="w-full text-left px-4 py-2 text-xs hover:bg-violet-500/20 flex items-center gap-2">✉️ <span>Email</span></button>
                  <button onClick={copyForShare} className="w-full text-left px-4 py-2 text-xs hover:bg-violet-500/20 flex items-center gap-2">📋 <span>Copy Text</span></button>
                  <button onClick={nativeShare} className="w-full text-left px-4 py-2 text-xs hover:bg-violet-500/20 flex items-center gap-2 border-t border-white/20">📱 <span>Native Share...</span></button>
                </div>
              )}
            </div>
            <button onClick={() => setShowFind(v => !v)} className="h-9 px-3 rounded-xl glass-btn text-xs font-bold">🔍 Find</button>
            <button onClick={() => setShowSettings(v => !v)} className="h-9 px-3 rounded-xl glass-btn text-xs font-bold">⚙ Settings</button>
            <button onClick={toggleVoice} className={`h-10 px-4 sm:px-5 rounded-xl text-xs font-black border-2 transition ${isListening ? "bg-red-500 text-white border-red-500 animate-pulse" : "bg-gradient-to-r from-violet-600 to-pink-600 text-white border-transparent"}`}>{isListening ? "■ STOP" : "🎤 VOICE"}</button>
            <button onClick={toggleSpeak} className={`h-9 px-3 rounded-xl text-xs font-bold border ${isSpeaking ? "bg-red-500 text-white border-red-500" : "glass-btn"}`}>{isSpeaking ? "■" : "🔊"}</button>
            <button onClick={() => setIsFocus(true)} className="h-9 px-3 rounded-xl bg-black/80 text-white text-xs font-bold">⛶</button>
            <button onClick={() => setIsDark(!isDark)} className="h-9 px-3 rounded-xl glass-btn text-xs font-bold">{isDark ? "☀" : "🌙"}</button>
          </div>
        </div>

        {/* TOOLBAR ROW 2 — FORMATTING */}
        {showFormatBar && (
          <div className="glass rounded-2xl p-2 mb-3 flex flex-wrap gap-1 items-center sticky top-16 z-20">
            <button onClick={() => exec("bold")} className={`fmt-btn glass-btn ${activeFormats.bold ? "active-fmt" : ""}`}><b>B</b></button>
            <button onClick={() => exec("italic")} className={`fmt-btn glass-btn ${activeFormats.italic ? "active-fmt" : ""}`}><i>I</i></button>
            <button onClick={() => exec("underline")} className={`fmt-btn glass-btn ${activeFormats.underline ? "active-fmt" : ""}`}><u>U</u></button>
            <button onClick={() => exec("strikeThrough")} className={`fmt-btn glass-btn ${activeFormats.strikeThrough ? "active-fmt" : ""}`}><s>S</s></button>
            <button onClick={() => exec("superscript")} className={`fmt-btn glass-btn ${activeFormats.superscript ? "active-fmt" : ""}`}>X²</button>
            <button onClick={() => exec("subscript")} className={`fmt-btn glass-btn ${activeFormats.subscript ? "active-fmt" : ""}`}>X₂</button>
            <div className="w-px h-6 bg-white/30 mx-1" />
            <select onChange={e => { if (e.target.value) formatHeading(e.target.value); e.target.value = ""; }} className="h-9 rounded-lg glass-btn px-2 text-xs font-bold">
              <option value="">Heading ▾</option>
              {HEADING_LEVELS.map(h => <option key={h.tag} value={h.tag}>{h.label} — {h.size}</option>)}
              <option value="p">Paragraph</option>
            </select>

            <div className="relative" ref={colorMenuRef}>
              <button
                onMouseDown={e => e.preventDefault()}
                onClick={() => { setShowColorPicker(v => !v); setShowBgPicker(false); }}
                className={`h-9 px-2.5 rounded-lg text-xs font-bold glass-btn transition-all ${showColorPicker ? "active-fmt" : ""}`}
              >
                <span className="flex items-center gap-1"><span className="font-black" style={{ color }}>A</span><span className="inline-block w-3 h-3 rounded border" style={{ background: color }} />▾</span>
              </button>
              {showColorPicker && (
                <div className="absolute top-full mt-1 left-0 glass rounded-xl shadow-2xl p-3 z-50 anim-drop min-w-[220px]">
                  <div className="text-[10px] uppercase opacity-60 font-bold mb-2">Text Color</div>
                  <input type="color" value={color} onMouseDown={e => e.preventDefault()} onChange={e => applyColorToSelection(e.target.value, false)} className="w-full h-8 rounded-lg cursor-pointer mb-2" />
                  <div className="grid grid-cols-5 gap-1.5">
                    {COLOR_PALETTE.map(c => (
                      <button key={c} onMouseDown={e => e.preventDefault()} onClick={() => applyColorToSelection(c, false)} className="w-7 h-7 rounded-lg border border-white/60 hover:scale-110" style={{ background: c }} />
                    ))}
                  </div>
                  <div className="text-[9px] opacity-50 mt-2">Select text first, then pick color</div>
                </div>
              )}
            </div>

            <div className="relative" ref={bgMenuRef}>
              <button
                onMouseDown={e => e.preventDefault()}
                onClick={() => { setShowBgPicker(v => !v); setShowColorPicker(false); }}
                className={`h-9 px-2.5 rounded-lg text-xs font-bold glass-btn transition-all ${showBgPicker ? "active-fmt" : ""}`}
              >
                <span className="flex items-center gap-1"><span className="px-1 rounded" style={{ background: highlight }}>H</span><span className="inline-block w-3 h-3 rounded border" style={{ background: highlight }} />▾</span>
              </button>
              {showBgPicker && (
                <div className="absolute top-full mt-1 left-0 glass rounded-xl shadow-2xl p-3 z-50 anim-drop min-w-[220px]">
                  <div className="text-[10px] uppercase opacity-60 font-bold mb-2">Background</div>
                  <input type="color" value={highlight} onMouseDown={e => e.preventDefault()} onChange={e => applyColorToSelection(e.target.value, true)} className="w-full h-8 rounded-lg cursor-pointer mb-2" />
                  <div className="grid grid-cols-4 gap-1.5">
                    {HIGHLIGHT_PALETTE.map(c => (
                      <button key={c} onMouseDown={e => e.preventDefault()} onClick={() => applyColorToSelection(c, true)} className="w-7 h-7 rounded-lg border border-white/60 hover:scale-110" style={{ background: c }} />
                    ))}
                  </div>
                  <button onMouseDown={e => e.preventDefault()} onClick={() => applyColorToSelection("transparent", true)} className="w-full mt-2 text-[10px] py-1 rounded-lg glass-btn font-bold">Remove Highlight</button>
                  <div className="text-[9px] opacity-50 mt-2">Select text first, then pick background</div>
                </div>
              )}
            </div>

            <select onChange={e => { applyFontToSelection(e.target.value); e.target.value = ""; }} className="h-9 rounded-lg glass-btn px-2 text-xs font-bold">
              <option value="">Font ▾</option>
              {FONTS.map(f => <option key={f.name} value={f.name}>{f.name}</option>)}
            </select>

            <div className="w-px h-6 bg-white/30 mx-1" />
            <button onClick={() => exec("insertUnorderedList")} className={`fmt-btn glass-btn ${activeFormats.insertUnorderedList ? "active-fmt" : ""}`}>•</button>
            <button onClick={() => exec("insertOrderedList")} className={`fmt-btn glass-btn ${activeFormats.insertOrderedList ? "active-fmt" : ""}`}>1.</button>
            <button onClick={() => exec("outdent")} className="fmt-btn glass-btn">⇤</button>
            <button onClick={() => exec("indent")} className="fmt-btn glass-btn">⇥</button>

            <div className="w-px h-6 bg-white/30 mx-1" />
            <button onClick={() => exec("justifyLeft")} className={`fmt-btn glass-btn ${activeFormats.justifyLeft ? "active-fmt" : ""}`}>⬅</button>
            <button onClick={() => exec("justifyCenter")} className={`fmt-btn glass-btn ${activeFormats.justifyCenter ? "active-fmt" : ""}`}>↔</button>
            <button onClick={() => exec("justifyRight")} className={`fmt-btn glass-btn ${activeFormats.justifyRight ? "active-fmt" : ""}`}>➡</button>
            <button onClick={() => exec("justifyFull")} className={`fmt-btn glass-btn ${activeFormats.justifyFull ? "active-fmt" : ""}`}>≡</button>

            <div className="w-px h-6 bg-white/30 mx-1" />
            <button onClick={insertLink} className="h-9 px-2.5 rounded-lg glass-btn text-xs font-bold">🔗</button>
            <button onClick={insertHR} className="h-9 px-2.5 rounded-lg glass-btn text-xs font-bold">―</button>
            <button onClick={insertVR} className="h-9 px-2.5 rounded-lg glass-btn text-xs font-bold">│</button>
            <button onClick={insertCode} className="h-9 px-2.5 rounded-lg glass-btn text-xs font-bold">{"</>"}</button>
            <button onClick={insertQuote} className="h-9 px-2.5 rounded-lg glass-btn text-xs font-bold">❝</button>

            <div className="w-px h-6 bg-white/30 mx-1" />
            <button onClick={() => exec("removeFormat")} className="h-9 px-2.5 rounded-lg glass-btn text-xs font-bold">Tx</button>
            <button onClick={() => exec("undo")} className="h-9 px-2.5 rounded-lg glass-btn text-xs font-bold">↶</button>
            <button onClick={() => exec("redo")} className="h-9 px-2.5 rounded-lg glass-btn text-xs font-bold">↷</button>

            <div className="w-px h-6 bg-white/30 mx-1" />
            <select onChange={e => { changeCase(e.target.value); e.target.value = ""; }} className="h-9 rounded-lg glass-btn px-2 text-xs font-bold">
              <option value="">Aa Case ▾</option>
              <option value="upper">UPPER</option>
              <option value="lower">lower</option>
              <option value="title">Title Case</option>
              <option value="sentence">Sentence case</option>
              <option value="capitalize">Capitalize Each Word</option>
              <option value="toggle">Toggle Case</option>
            </select>
          </div>
        )}

        {showSettings && (
          <div className="glass rounded-2xl p-4 mb-3 grid md:grid-cols-4 gap-3">
            <div><label className="text-[10px] uppercase opacity-60 font-bold">Page Size</label><select value={pageSize} onChange={e => setPageSize(e.target.value)} className="w-full h-9 rounded-lg glass-btn px-2 text-sm mt-1">{Object.entries(PAGE_SIZES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select></div>
            <div><label className="text-[10px] uppercase opacity-60 font-bold">Editor Font</label><select value={font} onChange={e => setFont(e.target.value)} className="w-full h-9 rounded-lg glass-btn px-2 text-sm mt-1">{FONTS.map(f => <option key={f.name} value={f.name}>{f.name}</option>)}</select></div>
            <div><label className="text-[10px] uppercase opacity-60 font-bold">Font Size: {fontSize}px</label><input type="range" min={10} max={32} value={fontSize} onChange={e => setFontSize(parseInt(e.target.value))} className="w-full mt-2" /></div>
            <div><label className="text-[10px] uppercase opacity-60 font-bold">Line Height: {lineHeight}</label><input type="range" min={1} max={2.5} step={0.1} value={lineHeight} onChange={e => setLineHeight(parseFloat(e.target.value))} className="w-full mt-2" /></div>
            <div className="md:col-span-4 flex flex-wrap gap-4 pt-2 border-t border-white/30">
              <label className="flex items-center gap-2 text-xs cursor-pointer"><input type="checkbox" checked={autoCorrect} onChange={e => setAutoCorrect(e.target.checked)} /> Auto Correct</label>
              <label className="flex items-center gap-2 text-xs cursor-pointer"><input type="checkbox" checked={autoComplete} onChange={e => setAutoComplete(e.target.checked)} /> Auto Complete</label>
              <label className="flex items-center gap-2 text-xs cursor-pointer"><input type="checkbox" checked={showHighlight} onChange={e => setShowHighlight(e.target.checked)} /> Show Red Wavy</label>
              <label className="flex items-center gap-2 text-xs cursor-pointer"><input type="checkbox" checked={duplicateHighlight} onChange={e => setDuplicateHighlight(e.target.checked)} /> Duplicate Highlight</label>
            </div>
            <div className="md:col-span-4 flex flex-wrap gap-4 pt-2 border-t border-white/30">
              <div><label className="text-[10px] uppercase opacity-60 font-bold block mb-1">Reading Speed</label><div className="flex gap-1">{["slow","average","fast","custom"].map(s => (<button key={s} onClick={() => setReadingSpeed(s as any)} className={`text-xs px-3 py-1.5 rounded-lg ${readingSpeed === s ? "bg-gradient-to-r from-violet-600 to-pink-600 text-white" : "glass-btn"} font-bold capitalize`}>{s}</button>))}</div></div>
              {readingSpeed === "custom" && (<div><label className="text-[10px] uppercase opacity-60 font-bold block mb-1">Custom WPM</label><input type="number" min={50} max={1000} value={customReadingWPM} onChange={e => setCustomReadingWPM(Math.max(50, parseInt(e.target.value) || 200))} className="w-24 h-8 text-xs px-2 rounded-lg glass-btn" /></div>)}
              <div><label className="text-[10px] uppercase opacity-60 font-bold block mb-1">Speaking WPM</label><input type="number" min={50} max={300} value={speakingWPM} onChange={e => setSpeakingWPM(Math.max(50, parseInt(e.target.value) || 130))} className="w-24 h-8 text-xs px-2 rounded-lg glass-btn" /></div>
              <span className="text-xs opacity-60 ml-auto">Reading: {effectiveReadingWPM} wpm • Speaking: {speakingWPM} wpm</span>
            </div>
          </div>
        )}

        {showFind && (
          <div className="glass rounded-2xl p-3 mb-3 flex gap-2 items-center flex-wrap">
            <input value={findText} onChange={e => setFindText(e.target.value)} placeholder="Find..." className="h-9 px-3 rounded-lg glass-btn text-sm flex-1 min-w-[140px]" />
            <input value={replaceText} onChange={e => setReplaceText(e.target.value)} placeholder="Replace..." className="h-9 px-3 rounded-lg glass-btn text-sm flex-1 min-w-[140px]" />
            <label className="flex items-center gap-1 text-xs cursor-pointer"><input type="checkbox" checked={caseSensitive} onChange={e => setCaseSensitive(e.target.checked)} /> Aa</label>
            <label className="flex items-center gap-1 text-xs cursor-pointer"><input type="checkbox" checked={wholeWord} onChange={e => setWholeWord(e.target.checked)} /> Whole</label>
            <button onClick={doReplace} disabled={!findText} className="h-9 px-4 rounded-lg bg-gradient-to-r from-violet-600 to-pink-600 text-white text-sm font-bold disabled:opacity-40">Replace All</button>
            <button onClick={() => setShowFind(false)} className="h-9 px-3 rounded-lg glass-btn text-sm">✕</button>
          </div>
        )}

        <div className="flex gap-2 mb-4 justify-between flex-wrap">
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => { getGrammar(); setShowHighlight(true); }} className="text-xs px-3 py-1.5 rounded-full bg-gradient-to-r from-violet-600 to-pink-600 text-white font-bold">{checking ? "Checking..." : "✓ Grammar"}</button>
            {errors.length > 0 && (<button onClick={fixAll} className="text-xs px-3 py-1.5 rounded-full bg-green-500 text-white font-bold">⚡ Fix All ({errors.length})</button>)}
            <button onClick={handleCopyStats} className="text-xs px-3 py-1.5 rounded-full glass-btn font-bold">{copiedStats ? "✓ Copied!" : "⎙ Stats"}</button>
            <button onClick={loadSample} className="text-xs px-3 py-1.5 rounded-full glass-btn font-bold">📄 Sample</button>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={exportTxt} className="text-xs px-3 py-1.5 rounded-full glass-btn font-bold">TXT</button>
            <button onClick={exportHtmlFile} className="text-xs px-3 py-1.5 rounded-full glass-btn font-bold">HTML</button>
            <button onClick={exportDoc} className="text-xs px-3 py-1.5 rounded-full glass-btn font-bold">DOC</button>
            <button onClick={exportCsv} className="text-xs px-3 py-1.5 rounded-full glass-btn font-bold">CSV</button>
            <button onClick={exportPdf} className="text-xs px-3 py-1.5 rounded-full bg-black text-white font-bold">PDF</button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="glass rounded-3xl p-3">
              <div className="px-3 py-1.5 text-[10px] opacity-60 flex justify-between flex-wrap gap-1">
                <span>📄 {page.label} • {fontSize}px • LH {lineHeight} • {currentFont.name}</span>
                <span>{currentFont.mono ? "🔤 Mono" : "🔡 Prop"}</span>
              </div>
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={handleInput}
                onMouseUp={saveSelection}
                onKeyUp={saveSelection}
                onBlur={saveSelection}
                spellCheck={true}
                className={`w-full min-h-[400px] sm:min-h-[480px] p-4 sm:p-6 rounded-2xl ${isDark ? "bg-black/30 text-gray-100" : "bg-white/60"} outline-none`}
                style={{ fontFamily: currentFont.css, fontSize: `${fontSize}px`, lineHeight, color: isDark ? "#f3f4f6" : color }}
              />
              {suggestions.length > 0 && (
                <div className="relative glass rounded-xl shadow-2xl text-sm overflow-hidden z-30 mt-2">
                  {suggestions.map((s, i) => (
                    <button key={s.word} onClick={() => insertSuggestion(s)} className={`block w-full text-left px-4 py-1.5 hover:bg-violet-500/20 ${i === 0 ? "bg-violet-500/10 font-bold" : ""}`}>
                      {s.word} {i === 0 && <span className="text-[10px] opacity-50 ml-2">Tab</span>}
                    </button>
                  ))}
                </div>
              )}
              <div className="px-3 py-2 text-[11px] opacity-60 flex justify-between flex-wrap gap-1">
                <span>💡 Select text → click A / H → color applies only to selection</span>
                <span>{isActive ? "🟢 Active" : "⚪ Idle"} • ⏱ {formatTime(writingTime)}</span>
              </div>
            </div>

            <div className="glass rounded-3xl p-4 mt-4">
              <h3 className="font-bold text-xs uppercase mb-3">⏱ Reading & Speaking</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="glass-btn rounded-xl p-3 text-center"><div className="text-[10px] uppercase opacity-60 font-bold">Reading</div><div className="text-lg font-black mt-1 gradient-text">{formatMinSec(stats.readingSeconds)}</div><div className="text-[10px] opacity-50 mt-1">{effectiveReadingWPM} wpm</div></div>
                <div className="glass-btn rounded-xl p-3 text-center"><div className="text-[10px] uppercase opacity-60 font-bold">Speaking</div><div className="text-lg font-black mt-1 gradient-text">{formatMinSec(stats.speakingSeconds)}</div><div className="text-[10px] opacity-50 mt-1">{speakingWPM} wpm</div></div>
              </div>
            </div>

            {showHighlight && (
              <div className="glass rounded-3xl p-4 mt-4">
                <h3 className="font-bold text-xs mb-2">🔍 Grammar Preview</h3>
                <div className={`min-h-[80px] p-4 rounded-2xl ${isDark ? "bg-black/30" : "bg-white/60"} text-[15px] leading-7`} style={{ fontFamily: currentFont.css }} dangerouslySetInnerHTML={{ __html: highlightedHtml || escapeHtml(text).replace(/\n/g, "<br>") || "<span class='opacity-40'>No errors</span>" }} />
              </div>
            )}

            {errors.length > 0 && (
              <div className="glass rounded-2xl p-4 mt-4">
                <div className="flex justify-between items-center mb-2"><h3 className="font-bold text-sm">🔴 {errors.length} Issues</h3><button onClick={fixAll} className="text-xs px-2 py-1 bg-green-500 text-white rounded font-bold">Fix All</button></div>
                {errors.map((err, i) => (
                  <div key={i} className="flex justify-between items-center p-2 glass rounded-xl text-xs mb-2 gap-2">
                    <span className="flex-1">{err.message} → <b className="text-green-600 dark:text-green-400">{err.replacement}</b></span>
                    <button onClick={() => fixError(err)} className="px-3 py-1 bg-black text-white rounded-lg font-bold">Fix</button>
                  </div>
                ))}
              </div>
            )}

            {(duplicates.words.length > 0 || duplicates.sentences.length > 0 || duplicates.lines.length > 0) && (
              <div className="glass rounded-2xl p-4 mt-4">
                <h3 className="font-bold text-sm mb-2">🔁 Duplicates</h3>
                {duplicates.sentences.length > 0 && (<div className="mb-2"><div className="text-[10px] uppercase opacity-60 font-bold mb-1">Sentences</div>{duplicates.sentences.map((d, i) => (<div key={i} className="text-xs p-2 bg-purple-500/15 rounded-lg mb-1"><b>{d.count}x</b> — "{d.text}..."</div>))}</div>)}
                {duplicates.lines.length > 0 && (<div className="mb-2"><div className="text-[10px] uppercase opacity-60 font-bold mb-1">Lines</div>{duplicates.lines.slice(0, 5).map((d, i) => (<div key={i} className="text-xs p-2 bg-blue-500/15 rounded-lg mb-1"><b>{d.count}x</b> — "{d.text}..."</div>))}</div>)}
                {duplicates.words.length > 0 && (<div><div className="text-[10px] uppercase opacity-60 font-bold mb-1">Words</div><div className="flex flex-wrap gap-1">{duplicates.words.slice(0, 12).map(([w, c]) => (<span key={w} className="text-[11px] px-2 py-1 bg-orange-500/20 rounded-full font-bold">{w} × {c}</span>))}</div></div>)}
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

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Stat label="Words" value={<AnimatedCounter value={stats.words} />} />
              <Stat label="Chars (with)" value={<AnimatedCounter value={stats.chars} />} />
              <Stat label="Chars (without)" value={<AnimatedCounter value={stats.charsNoSpace} />} />
              <Stat label="Sentences" value={<AnimatedCounter value={stats.sentences} />} />
              <Stat label="Paragraphs" value={<AnimatedCounter value={stats.paras} />} />
              <Stat label="Lines" value={<AnimatedCounter value={stats.lines} />} />
              <Stat label="Reading" value={formatMinSec(stats.readingSeconds)} />
              <Stat label="Speaking" value={formatMinSec(stats.speakingSeconds)} />
              <Stat label="Writing" value={formatTime(writingTime)} />
              <Stat label="Flesch" value={<AnimatedCounter value={stats.flesch} />} />
            </div>
            <div className={`glass rounded-2xl p-4 ${goalReached ? "celebrate" : ""}`}>
              <h3 className="font-bold text-xs uppercase mb-3">🎯 Goal</h3>
              <div className="text-3xl font-black text-center gradient-text"><AnimatedCounter value={progress} />%</div>
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
                  const pct = Math.min(100, Math.round((stats.chars / s.limit) * 100));
                  return (
                    <div key={s.name} className="glass-btn rounded-xl p-2">
                      <div className="flex justify-between px-1"><div className="text-[10px] opacity-70 font-bold">{s.name}</div><div className={`text-xs font-black ${left < 0 ? "text-red-500" : "text-green-600 dark:text-green-400"}`}>{left < 0 ? `${Math.abs(left)} over` : `${left} left`}</div></div>
                      <div className="mt-1.5 h-1 bg-white/40 dark:bg-white/10 rounded-full overflow-hidden"><div className="h-full" style={{ width: `${pct}%`, background: left < 0 ? "#ef4444" : "linear-gradient(90deg,#a855f7,#ec4899)" }} /></div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <section className="mt-12">
          <h2 className="text-2xl sm:text-3xl font-black text-center gradient-text mb-2">🧰 Writing Tools Hub</h2>
          <p className="text-center opacity-70 text-sm mb-6">40+ tools for writers, students, and SEO professionals</p>
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {[{ id: "suggested", label: "📌 Suggested" }, { id: "writing", label: "✍️ Writing" }, { id: "academic", label: "🎓 Academic" }, { id: "analyzer", label: "📊 Quality" }].map(t => (
              <button key={t.id} onClick={() => setActiveToolTab(t.id)} className={`tab-btn px-4 py-2 rounded-xl text-xs font-bold glass-btn ${activeToolTab === t.id ? "active" : ""}`}>{t.label}</button>
            ))}
          </div>

          {activeToolTab === "suggested" && (
            <div className="anim-pop">
              <div className="grid grid-cols-3 md:grid-cols-9 gap-2 mb-4">
                {[{ id: "char", label: "Char", icon: "🔡" },{ id: "sentence", label: "Sentence", icon: "📝" },{ id: "paragraph", label: "Paragraph", icon: "📄" },{ id: "readability", label: "Readability", icon: "📊" },{ id: "density", label: "Density", icon: "🔍" },{ id: "case", label: "Case", icon: "Aa" },{ id: "cleaner", label: "Cleaner", icon: "🧹" },{ id: "find", label: "Find", icon: "🔎" },{ id: "dup", label: "Dup Lines", icon: "🔁" }].map(tool => (
                  <button key={tool.id} onClick={() => setActiveSuggestedTool(tool.id)} className={`tab-btn p-2 rounded-xl text-xs font-bold glass-btn ${activeSuggestedTool === tool.id ? "active" : ""}`}><div className="text-lg">{tool.icon}</div><div className="text-[10px] mt-0.5">{tool.label}</div></button>
                ))}
              </div>
              <div className="glass rounded-2xl p-4" key={activeSuggestedTool}>
                {activeSuggestedTool === "char" && (<div><h3 className="font-bold text-sm mb-3">🔡 Character Counter</h3><div className="grid grid-cols-2 md:grid-cols-4 gap-3"><MiniStat label="Total Chars" value={stats.chars} /><MiniStat label="Without Spaces" value={stats.charsNoSpace} /><MiniStat label="With Spaces" value={stats.chars} /><MiniStat label="Spaces Only" value={stats.chars - stats.charsNoSpace} /></div></div>)}
                {activeSuggestedTool === "sentence" && (<div><h3 className="font-bold text-sm mb-3">📝 Sentence Counter</h3><div className="grid grid-cols-2 md:grid-cols-4 gap-3"><MiniStat label="Total" value={stats.sentences} /><MiniStat label="Short" value={stats.short} /><MiniStat label="Medium" value={stats.medium} /><MiniStat label="Long" value={stats.long} /></div></div>)}
                {activeSuggestedTool === "paragraph" && (<div><h3 className="font-bold text-sm mb-3">📄 Paragraph Counter</h3><div className="grid grid-cols-3 gap-3"><MiniStat label="Paragraphs" value={stats.paras} /><MiniStat label="Lines" value={stats.lines} /><MiniStat label="Avg Words" value={stats.paras > 0 ? Math.round(stats.words / stats.paras) : 0} /></div></div>)}
                {activeSuggestedTool === "readability" && (<div><h3 className="font-bold text-sm mb-3">📊 Readability</h3><div className="grid grid-cols-2 gap-3"><MiniStat label="Flesch" value={stats.flesch} extra={stats.level} /><MiniStat label="Avg Words/Sent" value={(stats.words / Math.max(1, stats.sentences)).toFixed(1)} /></div></div>)}
                {activeSuggestedTool === "density" && (<div><h3 className="font-bold text-sm mb-3">🔍 Density</h3>{stats.density.length === 0 ? <p className="text-xs opacity-50">Type text</p> : (<div className="space-y-1">{stats.density.map(([k, d]) => (<div key={k} className="flex justify-between text-xs py-1 border-b border-white/10"><span className="font-mono">{k}</span><span className={`font-bold ${parseFloat(d) > 3 ? "text-red-500" : "text-green-600"}`}>{d}%</span></div>))}</div>)}</div>)}
                {activeSuggestedTool === "case" && (<div><h3 className="font-bold text-sm mb-3">Aa Case</h3><div className="grid grid-cols-2 md:grid-cols-3 gap-2"><button onClick={() => changeCase("upper")} className="glass-btn p-2 rounded-lg text-xs font-bold">UPPERCASE</button><button onClick={() => changeCase("lower")} className="glass-btn p-2 rounded-lg text-xs font-bold">lowercase</button><button onClick={() => changeCase("title")} className="glass-btn p-2 rounded-lg text-xs font-bold">Title Case</button><button onClick={() => changeCase("sentence")} className="glass-btn p-2 rounded-lg text-xs font-bold">Sentence</button><button onClick={() => changeCase("capitalize")} className="glass-btn p-2 rounded-lg text-xs font-bold">Capitalize</button><button onClick={() => changeCase("toggle")} className="glass-btn p-2 rounded-lg text-xs font-bold">Toggle</button></div></div>)}
                {activeSuggestedTool === "cleaner" && (<div><h3 className="font-bold text-sm mb-3">🧹 Cleaner</h3><div className="grid grid-cols-2 md:grid-cols-4 gap-2"><button onClick={cleanExtraSpaces} className="glass-btn p-2 rounded-lg text-xs font-bold">Extra Spaces</button><button onClick={removeBlankLines} className="glass-btn p-2 rounded-lg text-xs font-bold">Blank Lines</button><button onClick={removeDupLines} className="glass-btn p-2 rounded-lg text-xs font-bold">Dup Lines</button><button onClick={removeDupSentences} className="glass-btn p-2 rounded-lg text-xs font-bold">Dup Sent</button><button onClick={normalizePunctuation} className="glass-btn p-2 rounded-lg text-xs font-bold">Punctuation</button><button onClick={removeSpecialChars} className="glass-btn p-2 rounded-lg text-xs font-bold">Special</button><button onClick={removeNumbers} className="glass-btn p-2 rounded-lg text-xs font-bold">Numbers</button><button onClick={removeHtmlTags} className="glass-btn p-2 rounded-lg text-xs font-bold">HTML</button></div></div>)}
                {activeSuggestedTool === "find" && (<div><h3 className="font-bold text-sm mb-3">🔎 Find</h3><button onClick={() => setShowFind(true)} className="glass-btn p-3 rounded-xl text-xs font-bold">Open Find & Replace</button></div>)}
                {activeSuggestedTool === "dup" && (<div><h3 className="font-bold text-sm mb-3">🔁 Dup Lines</h3>{duplicates.lines.length === 0 ? <p className="text-xs opacity-50">No duplicates ✓</p> : (<><p className="text-xs opacity-70 mb-3">{duplicates.lines.length} groups</p><button onClick={removeDupLines} className="glass-btn p-2 px-4 rounded-lg text-xs font-bold">Remove All</button></>)}</div>)}
              </div>
            </div>
          )}

          {activeToolTab === "writing" && (
            <div className="anim-pop grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="glass rounded-2xl p-4"><h3 className="font-bold text-sm mb-3">🔤 Formatter</h3><div className="grid grid-cols-2 gap-2"><button onClick={() => changeCase("upper")} className="glass-btn p-2 rounded-lg text-xs font-bold">Upper</button><button onClick={() => changeCase("lower")} className="glass-btn p-2 rounded-lg text-xs font-bold">Lower</button><button onClick={() => changeCase("title")} className="glass-btn p-2 rounded-lg text-xs font-bold">Title</button><button onClick={() => changeCase("sentence")} className="glass-btn p-2 rounded-lg text-xs font-bold">Sentence</button><button onClick={() => changeCase("capitalize")} className="glass-btn p-2 rounded-lg text-xs font-bold">Cap Each</button><button onClick={() => changeCase("toggle")} className="glass-btn p-2 rounded-lg text-xs font-bold">Toggle</button></div></div>
              <div className="glass rounded-2xl p-4"><h3 className="font-bold text-sm mb-3">🧹 Cleaner</h3><div className="grid grid-cols-2 gap-2"><button onClick={cleanExtraSpaces} className="glass-btn p-2 rounded-lg text-xs font-bold">Extra Spaces</button><button onClick={removeBlankLines} className="glass-btn p-2 rounded-lg text-xs font-bold">Blank Lines</button><button onClick={removeDupLines} className="glass-btn p-2 rounded-lg text-xs font-bold">Dup Lines</button><button onClick={removeDupSentences} className="glass-btn p-2 rounded-lg text-xs font-bold">Dup Sent</button><button onClick={normalizePunctuation} className="glass-btn p-2 rounded-lg text-xs font-bold">Punct</button><button onClick={removeSpecialChars} className="glass-btn p-2 rounded-lg text-xs font-bold">Special</button></div></div>
              <div className="glass rounded-2xl p-4"><h3 className="font-bold text-sm mb-3">🔁 Converter</h3><div className="grid grid-cols-2 gap-2"><button onClick={toSlug} className="glass-btn p-2 rounded-lg text-xs font-bold">Slug</button><button onClick={toCommaSeparated} className="glass-btn p-2 rounded-lg text-xs font-bold">Comma</button><button onClick={toLineSeparated} className="glass-btn p-2 rounded-lg text-xs font-bold">Line</button><button onClick={toJsonSafe} className="glass-btn p-2 rounded-lg text-xs font-bold">JSON</button><button onClick={toPlainText} className="glass-btn p-2 rounded-lg text-xs font-bold">Plain</button></div></div>
              <div className="glass rounded-2xl p-4"><h3 className="font-bold text-sm mb-3">📊 Sorting</h3><div className="grid grid-cols-2 gap-2"><button onClick={sortAZ} className="glass-btn p-2 rounded-lg text-xs font-bold">A-Z</button><button onClick={sortZA} className="glass-btn p-2 rounded-lg text-xs font-bold">Z-A</button><button onClick={sortByLength} className="glass-btn p-2 rounded-lg text-xs font-bold">By Length</button><button onClick={sortByWordCount} className="glass-btn p-2 rounded-lg text-xs font-bold">By Count</button></div></div>
              <div className="glass rounded-2xl p-4"><h3 className="font-bold text-sm mb-3">🔄 Reversal</h3><div className="grid grid-cols-1 gap-2"><button onClick={reverseChars} className="glass-btn p-2 rounded-lg text-xs font-bold">Reverse Characters</button><button onClick={reverseWords} className="glass-btn p-2 rounded-lg text-xs font-bold">Reverse Words</button><button onClick={reverseLines} className="glass-btn p-2 rounded-lg text-xs font-bold">Reverse Lines</button></div></div>
              <div className="glass rounded-2xl p-4"><h3 className="font-bold text-sm mb-3">⎵ Space</h3><div className="grid grid-cols-2 gap-2"><button onClick={trimLeading} className="glass-btn p-2 rounded-lg text-xs font-bold">Trim Left</button><button onClick={trimTrailing} className="glass-btn p-2 rounded-lg text-xs font-bold">Trim Right</button><button onClick={collapseSpaces} className="glass-btn p-2 rounded-lg text-xs font-bold">Collapse</button><button onClick={tabsToSpaces} className="glass-btn p-2 rounded-lg text-xs font-bold">Tabs</button></div></div>
            </div>
          )}

          {activeToolTab === "academic" && (
            <div className="anim-pop">
              <div className="glass rounded-2xl p-4 mb-4">
                <h3 className="font-bold text-sm mb-3">🎓 Word Limit Tracker</h3>
                <div className="flex flex-wrap gap-3 items-end">
                  <div><label className="text-[10px] uppercase opacity-60 font-bold block mb-1">Type</label><select value={academicType} onChange={e => setAcademicType(e.target.value)} className="h-9 rounded-lg glass-btn px-2 text-sm">{["Essay","Assignment","Thesis","Abstract","Research Paper","Dissertation","Lab Report"].map(t => <option key={t}>{t}</option>)}</select></div>
                  <div><label className="text-[10px] uppercase opacity-60 font-bold block mb-1">Required Words</label><input type="number" min={1} value={academicLimit} onChange={e => setAcademicLimit(Math.max(1, parseInt(e.target.value) || 1))} className="w-32 h-9 rounded-lg glass-btn px-2 text-sm" /></div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3"><MiniStat label="Required" value={academicLimit} /><MiniStat label="Current" value={stats.words} /><MiniStat label="Remaining" value={Math.max(0, academicLimit - stats.words)} /></div>
                <div className="mt-3 h-2.5 bg-white/40 dark:bg-white/10 rounded-full overflow-hidden"><div className="h-full transition-all progress-bar" style={{ width: `${Math.min(100, (stats.words / academicLimit) * 100)}%`, background: stats.words > academicLimit ? "linear-gradient(90deg,#ef4444,#dc2626)" : "linear-gradient(90deg,#a855f7,#ec4899)" }} /></div>
              </div>
            </div>
          )}

          {activeToolTab === "analyzer" && (
            <div className="anim-pop glass rounded-2xl p-4">
              <h3 className="font-bold text-sm mb-1">📊 Quality Analyzer</h3>
              <p className="text-[10px] opacity-60 mb-4">Basic rule-based analysis (not AI)</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { label: "Repeated Words", value: quality.dupWordCount, warn: quality.dupWordCount > 10, danger: quality.dupWordCount > 25 },
                  { label: "Repeated Sentences", value: quality.dupSentenceCount, warn: quality.dupSentenceCount > 0, danger: quality.dupSentenceCount > 3 },
                  { label: "Long Sentences (25+)", value: quality.longSentences, warn: quality.longSentences > 3, danger: quality.longSentences > 10 },
                  { label: "Long Paragraphs (150+)", value: quality.veryLongParas, warn: quality.veryLongParas > 1, danger: quality.veryLongParas > 3 },
                  { label: "Filler Words", value: quality.fillerCount, warn: quality.fillerCount > 5, danger: quality.fillerCount > 15 },
                  { label: "Weak Phrases", value: quality.weakCount, warn: quality.weakCount > 3, danger: quality.weakCount > 10 },
                  { label: "Excessive Punct", value: quality.excessivePunct, warn: quality.excessivePunct > 0, danger: quality.excessivePunct > 3 },
                  { label: "Multiple Spaces", value: quality.multipleSpaces, warn: quality.multipleSpaces > 5, danger: quality.multipleSpaces > 15 },
                  { label: "ALL CAPS Words", value: quality.allCapsWords, warn: quality.allCapsWords > 3, danger: quality.allCapsWords > 10 },
                ].map(item => {
                  const hasIssue = item.value > 0;
                  const lbl = !hasIssue ? { text: "Good", color: "bg-green-500/20 text-green-700 dark:text-green-300" }
                    : item.danger ? { text: "Improve", color: "bg-red-500/20 text-red-700 dark:text-red-300" }
                    : { text: "Attention", color: "bg-orange-500/20 text-orange-700 dark:text-orange-300" };
                  return (
                    <div key={item.label} className="glass-btn rounded-xl p-3 flex justify-between items-center">
                      <div><div className="text-xs font-bold">{item.label}</div><div className="text-[10px] opacity-60">Found: {item.value}</div></div>
                      <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${lbl.color}`}>{lbl.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        <section className="mt-12">
          <h2 className="text-2xl sm:text-3xl font-black text-center gradient-text mb-2">📊 Word Count by Content Type</h2>
          <p className="text-center opacity-70 text-sm mb-6">Recommended word ranges</p>
          <div className="glass rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm">
                <thead><tr className="bg-gradient-to-r from-violet-600/20 to-pink-600/20"><th className="text-left p-3 font-bold">Type</th><th className="text-left p-3 font-bold">Recommended</th><th className="text-left p-3 font-bold hidden sm:table-cell">Ideal</th><th className="text-left p-3 font-bold hidden md:table-cell">Purpose</th></tr></thead>
                <tbody>{CONTENT_TYPES.map(c => (<tr key={c.name} className="border-t border-white/20 hover:bg-white/10"><td className="p-3 font-bold">{c.icon} {c.name}</td><td className="p-3 opacity-80">{c.recommended}</td><td className="p-3 opacity-80 hidden sm:table-cell">{c.ideal.toLocaleString()}</td><td className="p-3 opacity-60 hidden md:table-cell">{c.purpose}</td></tr>))}</tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl sm:text-3xl font-black text-center gradient-text mb-2">📱 Social Media Counters</h2>
          <p className="text-center opacity-70 text-sm mb-6">Dedicated counters for each platform</p>
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {SOCIAL_PLATFORMS.map(s => (<button key={s.name} onClick={() => setActiveSocial(s.name)} className={`tab-btn px-3 py-2 rounded-xl text-xs font-bold glass-btn ${activeSocial === s.name ? "active" : ""}`}>{s.icon} <span className="hidden sm:inline">{s.name}</span></button>))}
          </div>
          <div className="glass rounded-2xl p-4">
            <div className="flex justify-between items-center mb-3"><h3 className="font-bold text-sm">{activeSocialData.icon} {activeSocialData.name}</h3><span className="text-[10px] opacity-60">{activeSocialData.hint}</span></div>
            <textarea value={socialText} onChange={e => setSocialText(e.target.value)} placeholder={`Type your ${activeSocialData.name.toLowerCase()}...`} className={`w-full min-h-[120px] p-3 rounded-xl ${isDark ? "bg-black/30" : "bg-white/60"} outline-none text-sm`} />
            <div className="mt-3 grid grid-cols-3 gap-3"><MiniStat label="Chars" value={socialStats.chars} /><MiniStat label="Words" value={socialStats.words} /><MiniStat label="Remaining" value={socialStats.remaining < 0 ? `Over ${Math.abs(socialStats.remaining)}` : socialStats.remaining} /></div>
            <div className="mt-3"><div className="flex justify-between text-[10px] opacity-60 mb-1"><span>Limit ({activeSocialData.limit.toLocaleString()})</span><span>{socialStats.progressPct}%</span></div><div className="h-2 bg-white/40 dark:bg-white/10 rounded-full overflow-hidden"><div className="h-full progress-bar" style={{ width: `${socialStats.progressPct}%`, background: socialStats.remaining < 0 ? "linear-gradient(90deg,#ef4444,#dc2626)" : "linear-gradient(90deg,#a855f7,#ec4899)" }} /></div></div>
            <div className="mt-2"><div className="flex justify-between text-[10px] opacity-60 mb-1"><span>Recommended ({activeSocialData.recommended.toLocaleString()})</span><span>{socialStats.recommendedPct}%</span></div><div className="h-1.5 bg-white/40 dark:bg-white/10 rounded-full overflow-hidden"><div className="h-full" style={{ width: `${Math.min(100, socialStats.recommendedPct)}%`, background: "linear-gradient(90deg,#06b6d4,#3b82f6)" }} /></div></div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(socialText.slice(0, 280))}`, "_blank")} className="text-xs px-3 py-1.5 rounded-full glass-btn font-bold">🐦 Share</button>
              <button onClick={() => { navigator.clipboard.writeText(socialText); setToast("✓ Copied"); setTimeout(() => setToast(null), 1500); }} className="text-xs px-3 py-1.5 rounded-full glass-btn font-bold">📋 Copy</button>
            </div>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl sm:text-3xl font-black text-center gradient-text mb-2">📖 What Is a Word Counter?</h2>
          <p className="text-center opacity-70 text-sm mb-6">Complete explanation</p>
          <div className="glass rounded-2xl p-6">
            <div className="space-y-4 text-sm leading-relaxed">
              <div><h3 className="font-bold text-base mb-2">Definition</h3><p className="opacity-80">A <b>word counter</b> is a software tool that analyzes written text and reports quantitative statistics — word count, character count, sentence count, paragraph count, reading time, and readability metrics. It processes text in real-time as you type or paste.</p></div>
              <div><h3 className="font-bold text-base mb-2">Why Word Counting Matters</h3><p className="opacity-80">Word counts are foundational to almost every professional writing context. Academic institutions enforce strict word limits. Content marketers must hit target lengths for SEO ranking. Social media platforms cap characters.</p></div>
              <div className="grid md:grid-cols-2 gap-4 pt-2">
                {[{ title: "🎓 Students", desc: "Meet exact word limits on essays, assignments, and dissertations." },{ title: "✍️ Writers", desc: "Track daily word goals (1,000-2,000/day). Monitor writing time." },{ title: "📝 Bloggers", desc: "Hit 1,500-2,500 word ranges for SEO. Check density (1-2% ideal)." },{ title: "🔍 SEO Pros", desc: "Analyze keyword density. Verify content vs competitors." },{ title: "📰 Journalists", desc: "Respect editorial word limits. Ensure leads fit character budgets." },{ title: "📱 Social Creators", desc: "Stay within platform limits. Optimize hooks to visible char counts." },{ title: "💼 Business Pros", desc: "Keep emails concise. Structure product descriptions for conversion." }].map((item, i) => (
                  <div key={i} className="glass-btn rounded-xl p-3"><h4 className="font-bold text-sm mb-1">{item.title}</h4><p className="text-xs opacity-70 leading-relaxed">{item.desc}</p></div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl sm:text-3xl font-black text-center gradient-text mb-2">🧰 Other Useful Tools</h2>
          <p className="text-center opacity-70 text-sm mb-6">Complete toolkit</p>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {otherTools.map(t => (
              <a key={t.name} href={t.link} className="glass rounded-2xl p-5 hover:shadow-2xl hover:-translate-y-1 transition-all group">
                <div className="text-4xl mb-2">{t.icon}</div>
                <h3 className="font-bold text-sm mb-1 group-hover:text-violet-600 transition">{t.name}</h3>
                <p className="text-xs opacity-60 leading-relaxed">{t.desc}</p>
              </a>
            ))}
          </div>
        </section>

        <section className="mt-12 space-y-4">
          <h2 className="text-2xl sm:text-3xl font-black text-center gradient-text mb-6">📚 Guides & Documentation</h2>
          {articlesData.map(a => (
            <div key={a.id} className="glass rounded-2xl overflow-hidden">
              <button onClick={() => setShowArticle(showArticle === a.id ? null : a.id)} className="w-full flex justify-between items-center p-4 sm:p-5 font-bold text-left hover:bg-white/10 transition-all">
                <span className="text-sm sm:text-base pr-2">{a.title}</span>
                <span className="text-2xl transition-transform" style={{ transform: showArticle === a.id ? "rotate(180deg)" : "rotate(0)" }}>{showArticle === a.id ? "−" : "+"}</span>
              </button>
              <div className={`accordion-content ${showArticle === a.id ? "open" : ""}`}>
                <div className={`p-4 sm:p-6 ${isDark ? "bg-black/20" : "bg-white/40"} text-xs sm:text-sm leading-7 whitespace-pre-line border-t border-white/20`}>{a.content}</div>
              </div>
            </div>
          ))}
        </section>

        <section className="mt-12">
          <h2 className="text-2xl sm:text-3xl font-black text-center gradient-text mb-2">❓ FAQ</h2>
          <p className="text-center opacity-70 text-sm mb-6">Common questions</p>
          <div className="grid md:grid-cols-2 gap-3">
            {faqData.map((f, i) => (
              <div key={i} className="glass rounded-2xl overflow-hidden">
                <button onClick={() => setShowArticle(showArticle === `faq-${i}` ? null : `faq-${i}`)} className="w-full flex justify-between items-center p-4 font-bold text-left text-sm hover:bg-white/10">
                  <span>{f.q}</span>
                  <span className="text-lg ml-2 transition-transform" style={{ transform: showArticle === `faq-${i}` ? "rotate(45deg)" : "rotate(0)" }}>+</span>
                </button>
                <div className={`accordion-content ${showArticle === `faq-${i}` ? "open" : ""}`}>
                  <div className="px-4 pb-4 text-xs leading-6 opacity-80">{f.a}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <footer className="mt-16 text-center text-xs opacity-60 pb-8">
          <p>✨ Word Counter Pro — 100% private, browser-only</p>
          <p className="mt-1">Made with 💜 for writers, students, and SEO professionals</p>
        </footer>
      </div>
    </div>
  );
}

function Stat({ label, value, tip }: { label: string; value: any; tip?: string }) {
  return (
    <div className="glass rounded-2xl p-3 sm:p-4 shadow-sm hover:shadow-lg transition-all hover:-translate-y-0.5" title={tip}>
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

const otherTools = [
  { icon: "🔤", name: "Case Converter", desc: "Convert text to UPPER, lower, Title, or Sentence case", link: "#" },
  { icon: "📄", name: "Lorem Ipsum Generator", desc: "Generate dummy placeholder text", link: "#" },
  { icon: "✅", name: "Grammar Checker", desc: "Fix grammar, spelling, and punctuation errors", link: "#" },
  { icon: "🔄", name: "Paraphrasing Tool", desc: "Rewrite sentences in your own words", link: "#" },
  { icon: "📊", name: "Readability Checker", desc: "Check Flesch score and reading ease", link: "#" },
  { icon: "🔍", name: "Plagiarism Checker", desc: "Scan for copied or duplicate text", link: "#" },
  { icon: "🔡", name: "Character Counter", desc: "Count chars with/without spaces", link: "#" },
  { icon: "🔄", name: "Reverse Text", desc: "Flip text backwards instantly", link: "#" },
  { icon: "🆚", name: "Text Diff", desc: "Compare two texts and highlight differences", link: "#" },
  { icon: "{}", name: "JSON Formatter", desc: "Beautify, minify, validate JSON", link: "#" },
  { icon: "🔐", name: "Base64 Encoder", desc: "Encode and decode Base64 text", link: "#" },
  { icon: "🔗", name: "URL Encoder", desc: "Encode URLs and query strings safely", link: "#" },
];

const articlesData = [
  {
    id: "what-is",
    title: "📖 What is Word Counter? Complete Guide",
    content: `A Word Counter analyzes text and provides instant statistics.

WHY YOU NEED IT:
• Students — Meet essay word limits
• Bloggers — SEO-friendly content length
• Social Media — Platform character limits
• Authors — Track daily word goals
• Translators — Bill accurately
• SEO Pros — Keyword density 1-2%

WHAT IT MEASURES:
• Words, Chars (with/without spaces)
• Sentences, Paragraphs, Lines
• Reading/Speaking Time (configurable)
• Writing Time (active only)
• Flesch Score (0-100)
• Keyword Density

PRIVACY: Everything runs in-browser. Auto-save uses localStorage.`
  },
  {
    id: "user-guide",
    title: "📘 Complete User Guide",
    content: `STEP 1: START WRITING
Click editor. Stats update instantly. Auto-saves every 400ms.

STEP 2: RICH TEXT FORMATTING
Toggle "▲ Hide Format Bar" to hide. Buttons:
B / I / U / S — Bold, Italic, Underline, Strikethrough
X² / X₂ — Superscript / Subscript
Heading — H1 to H6 + Paragraph
A — Text color (selection only)
H — Background highlight (selection only)
Font — 14 fonts
• / 1. — Lists
⇤ ⇥ — Outdent / Indent
⬅ ↔ ➡ ≡ — Alignment
🔗 — Link (Ctrl+K)
― — Horizontal Rule
│ — Vertical Rule
</> — Code Block
❝ — Blockquote
Tx — Clear formatting
↶ ↷ — Undo / Redo
Aa — Case converter

HOW TO USE COLOR:
1. Select text with mouse
2. Click A ▾ button
3. Pick color
ONLY selection changes.

STEP 3: SOCIAL SHARE
Click "🔗 Share ▾" for Twitter, Facebook, WhatsApp, LinkedIn, Telegram, Email, Copy, Native.

STEP 4: SETTINGS
Page size, fonts, size, line height, reading/speaking WPM.

STEP 5: GRAMMAR CHECK
Auto-checks after 1.5s. Red wavy in preview. Fix / Fix All buttons.

STEP 6: VOICE TYPING (Chrome/Edge)
Click 🎤 VOICE. Speak naturally.

STEP 7: FIND & REPLACE (Ctrl+F)

STEP 8: WRITING TOOLS HUB
4 tabs with 40+ tools.

STEP 9: SOCIAL COUNTERS (6 platforms)

STEP 10: ACADEMIC TOOLS
Word limit tracker.

STEP 11: EXPORT
TXT, HTML, DOC, CSV, PDF

STEP 12: FOCUS / DARK MODE

KEYBOARD SHORTCUTS:
Ctrl+B/I/U — Bold/Italic/Underline
Ctrl+Shift+S — Strikethrough
Ctrl+K — Link
Ctrl+Z/Y — Undo/Redo
Ctrl+F — Find
Ctrl+S — Save
Ctrl+Shift+7/8 — Lists`
  },
  {
    id: "color-guide",
    title: "🎨 Text Color — How It Works",
    content: `THE #1 RULE: SELECT TEXT FIRST

CORRECT ORDER:
1. Select text with mouse (drag across it)
2. Selected text turns blue
3. Click A ▾ button
4. Pick color
5. ONLY selection changes ✅

WRONG ORDER:
1. Click A ▾ button first
2. Then try to select text
Result: Warning toast (nothing changes)

WARNING SIGNS:
You'll see "⚠ Select text first" when:
• You clicked A ▾ without selecting
• Previous selection got cleared
• Cursor is inside text but nothing highlighted

WHEN YOU SEE THIS WARNING:
1. Select text again
2. Then click color button

REMOVING COLOR:
Select colored text → click Tx button

TECHNICAL:
Uses document.execCommand("foreColor")
Selection must be non-collapsed (start ≠ end)`
  },
];

const faqData = [
  { q: "Is this free?", a: "Yes! 100% free forever. No sign-up, no ads, no limits." },
  { q: "Is my text saved on servers?", a: "No. Everything runs in your browser. Only Grammar Check sends to LanguageTool API." },
  { q: "⭐ How to apply color to only SOME text?", a: "SELECT the text first with mouse, THEN click A ▾ color button and pick color. Only selection changes." },
  { q: "How to remove color?", a: "Select colored text, click Tx button (clear formatting)." },
  { q: "How to remove only highlight?", a: "Select highlighted text, click H ▾, then 'Remove Highlight'." },
  { q: "Difference between Chars with/without?", a: "With = includes spaces (Twitter 280). Without = letters/numbers only." },
  { q: "How accurate is reading time?", a: "Configurable WPM. Default 200 wpm." },
  { q: "Good Flesch Score?", a: "Web: 60-70. Social: 70-80. Academic: 30-50." },
  { q: "Voice typing not working?", a: "Chrome/Edge + HTTPS + mic permission." },
  { q: "Ideal keyword density?", a: "1-2% for SEO. Above 3% = stuffing." },
  { q: "Works in Hindi?", a: "Yes! Select Hindi from language dropdown." },
  { q: "Offline?", a: "Mostly yes. Word counting, exports work offline. Grammar check needs internet." },
  { q: "Auto-correct?", a: "Fixes 20+ common typos silently. Toggle in Settings." },
  { q: "Academic word limit tracker?", a: "Set required count. Tracker shows remaining + progress bar." },
  { q: "Quality Analyzer?", a: "Rule-based check for repeated words, long sentences, filler words, etc. Not AI." },
  { q: "Insert link on selected text?", a: "Select text, press Ctrl+K, paste URL. Selection becomes a link." },
  { q: "Vertical rule?", a: "Inline separator for dual-column layouts." },
  { q: "Social share?", a: "Click '🔗 Share ▾'. Choose platform from menu." },
  { q: "Custom reading/speaking speed?", a: "Settings → Reading Speed (slow/average/fast/custom)." },
  { q: "Max text length?", a: "Practically unlimited. Tested 100,000+ words." },
];
