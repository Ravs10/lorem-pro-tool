"use client";
import { useState, useMemo, useRef, useEffect, useCallback } from "react";

type ErrorItem = { message: string; offset: number; length: number; replacement: string; category?: string; };
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

const TEXT_COLORS = ["#111827","#7c3aed","#ec4899","#ef4444","#f59e0b","#10b981","#06b6d4","#3b82f6","#8b5cf6","#64748b"];
const HIGHLIGHT_COLORS = ["#fef08a","#bbf7d0","#bfdbfe","#fecaca","#e9d5ff","#fed7aa","#fbcfe8","#a5f3fc"];
const EMOJIS = ["😀","😂","🥰","😎","🤔","👍","🙏","🎉","🔥","💯","✨","⭐","❤️","💜","🚀","💡","📝","📚","⚡","🌟"];

const AUTO_CORRECT: Record<string, string> = {
  teh: "the", adn: "and", recieve: "receive", seperate: "separate",
  occured: "occurred", definately: "definitely", wierd: "weird",
  freind: "friend", beleive: "believe", calender: "calendar",
  tommorow: "tomorrow", untill: "until", wich: "which", thier: "their",
};

const DICTIONARY = ["about","above","across","action","actually","added","after","again","against","almost","along","already","although","always","among","amount","another","answer","anyone","anything","appear","around","available","back","became","because","become","before","begin","behind","believe","below","better","between","beyond","bring","business","called","cannot","carry","center","certain","change","children","choose","class","clear","close","color","coming","common","company","complete","consider","continue","could","country","course","create","current","decide","describe","develop","different","difficult","direct","during","early","education","effect","either","enough","every","example","experience","family","father","feeling","figure","follow","friend","future","general","given","government","great","ground","group","growth","happen","having","heard","heavy","history","however","hundred","important","include","inside","issue","itself","knowledge","language","large","later","learn","leave","letter","level","light","little","local","machine","major","material","matter","maybe","mean","measure","medical","member","memory","message","method","middle","might","minute","modern","moment","money","month","morning","mother","mountain","music","nation","natural","nature","nearly","necessary","need","never","night","nothing","notice","number","object","occur","offer","often","order","other","paper","particular","people","perhaps","person","picture","place","plan","point","police","policy","possible","power","practice","prepare","present","president","press","pretty","prevent","private","probably","problem","process","produce","product","program","project","property","provide","public","purpose","question","quickly","quiet","rather","reach","ready","really","reason","receive","recent","recognize","record","reduce","reflect","region","relate","remain","remember","remove","report","require","research","resource","respond","result","return","right","roughly","school","science","season","second","section","seem","sense","series","serious","serve","service","several","shall","share","short","should","similar","simple","simply","since","single","situation","small","social","society","some","someone","something","sometimes","space","speak","special","spend","stand","start","state","statement","station","stay","still","story","street","strong","structure","student","study","subject","success","suddenly","suggest","summer","support","system","table","taken","teach","thing","though","thought","thousand","through","throughout","together","tomorrow","tonight","total","toward","town","trade","training","travel","treatment","trouble","truth","understand","until","usually","value","various","victim","video","village","visit","voice","watch","water","weapon","weather","week","weight","welcome","western","whatever","whenever","wherever","whether","which","while","white","whole","whose","window","within","without","woman","wonder","world","worry","would","write","writer","wrong","year","young","yourself"];

const SAMPLE = `Word Counter Pro is a powerful tool. Select some text and click 🎨 to color it — only the selection will change!`;

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

// ✅ NEW: character-offset helpers for reliable selection restore
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
  const [autoCorrect, setAutoCorrect] = useState(true);
  const [autoComplete, setAutoComplete] = useState(true);
  const [duplicateHighlight, setDuplicateHighlight] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [goalReached, setGoalReached] = useState(false);
  const [writingTime, setWritingTime] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showFormatBar, setShowFormatBar] = useState(true);
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60);
  const [pomodoroRunning, setPomodoroRunning] = useState(false);
  const [activeFormats, setActiveFormats] = useState<Record<string, boolean>>({});

  const editorRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const grammarAbortRef = useRef<AbortController | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pomodoroRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const savedSelRef = useRef<{ start: number; end: number } | null>(null);
  const hasSelectionRef = useRef<boolean>(false);

  // -------- LOAD --------
  useEffect(() => {
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
      safeSet("lorem_word_html", html);
      safeSet("lorem_word_text", text);
      safeSet("lorem_cfg", JSON.stringify({ font, fontSize, lineHeight, color, pageSize, goal, dark: isDark, lang, autoCorrect, autoComplete }));
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 1200);
    }, 400);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [html, text, font, fontSize, lineHeight, color, pageSize, goal, isDark, lang, autoCorrect, autoComplete]);

  // -------- AUTO LANGUAGE --------
  useEffect(() => {
    if (!text.trim()) { setAutoLang("Auto Detect: -"); return; }
    const hasHindi = /[\u0900-\u097F]/.test(text);
    const hasLatin = /[a-zA-Z]/.test(text);
    setAutoLang(hasHindi && !hasLatin ? "Auto Detect: Hindi 🇮🇳" : hasHindi ? "Auto Detect: Mixed 🌐" : "Auto Detect: English 🇺🇸");
  }, [text]);

  // -------- WRITING TIMER --------
  useEffect(() => {
    const tick = setInterval(() => { if (isActive) setWritingTime(t => t + 1); }, 1000);
    return () => clearInterval(tick);
  }, [isActive]);

  // -------- POMODORO --------
  useEffect(() => {
    if (pomodoroRunning) {
      pomodoroRef.current = setInterval(() => {
        setPomodoroTime(t => {
          if (t <= 1) {
            setPomodoroRunning(false);
            setToast("🍅 Pomodoro complete! Take a 5-min break.");
            setTimeout(() => setToast(null), 5000);
            return 25 * 60;
          }
          return t - 1;
        });
      }, 1000);
    } else if (pomodoroRef.current) {
      clearInterval(pomodoroRef.current);
    }
    return () => { if (pomodoroRef.current) clearInterval(pomodoroRef.current); };
  }, [pomodoroRunning]);

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
    const sentArr = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
    const sentLens = sentArr.map(s => s.split(/\s+/).length);
    const short = sentLens.filter(l => l <= 10).length;
    const medium = sentLens.filter(l => l > 10 && l <= 20).length;
    const long = sentLens.filter(l => l > 20).length;
    return { words, chars, charsNoSpace, sentences, paras, lines, readingTime, speakingTime, flesch, level, top10, density, short, medium, long, totalSent: sentArr.length };
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

  // -------- EDITOR SYNC --------
  const syncFromEditor = useCallback(() => {
    if (!editorRef.current) return;
    const newHtml = editorRef.current.innerHTML;
    const newText = editorRef.current.innerText || "";
    setHtml(newHtml);
    setText(newText);
  }, []);

  // ✅ FIXED: save selection as character offsets (survives DOM changes)
  const saveSelection = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || !editorRef.current) return;
    const range = sel.getRangeAt(0);
    if (!editorRef.current.contains(range.commonAncestorContainer)) return;
    const selText = range.toString();
    if (selText.length === 0) return;
    const start = getTextOffset(range.startContainer, range.startOffset, editorRef.current);
    const end = getTextOffset(range.endContainer, range.endOffset, editorRef.current);
    if (start !== end) {
      savedSelRef.current = { start, end };
      hasSelectionRef.current = true;
    }
  }, []);

  // ✅ FIXED: global listener saves offsets on every selection
  useEffect(() => {
    const handleSelChange = () => {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0 || !editorRef.current) return;
      const range = sel.getRangeAt(0);
      if (!editorRef.current.contains(range.commonAncestorContainer)) return;
      const selText = range.toString();
      if (selText.length === 0) return;
      const start = getTextOffset(range.startContainer, range.startOffset, editorRef.current);
      const end = getTextOffset(range.endContainer, range.endOffset, editorRef.current);
      if (start !== end) {
        savedSelRef.current = { start, end };
        hasSelectionRef.current = true;
      }
    };
    document.addEventListener("selectionchange", handleSelChange);
    return () => document.removeEventListener("selectionchange", handleSelChange);
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
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand("insertText", false, insert);
    syncFromEditor();
  };

  // -------- FORMATTING --------
  const updateActiveFormats = useCallback(() => {
    try {
      setActiveFormats({
        bold: document.queryCommandState("bold"),
        italic: document.queryCommandState("italic"),
        underline: document.queryCommandState("underline"),
        strikeThrough: document.queryCommandState("strikeThrough"),
        insertUnorderedList: document.queryCommandState("insertUnorderedList"),
        insertOrderedList: document.queryCommandState("insertOrderedList"),
        justifyLeft: document.queryCommandState("justifyLeft"),
        justifyCenter: document.queryCommandState("justifyCenter"),
        justifyRight: document.queryCommandState("justifyRight"),
        justifyFull: document.queryCommandState("justifyFull"),
      });
    } catch {}
  }, []);

  const exec = useCallback((cmd: string, val?: string) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    try { document.execCommand("styleWithCSS", false, "true"); } catch {}
    document.execCommand(cmd, false, val);
    syncFromEditor();
    updateActiveFormats();
  }, [syncFromEditor, updateActiveFormats]);

  useEffect(() => {
    document.addEventListener("selectionchange", updateActiveFormats);
    return () => document.removeEventListener("selectionchange", updateActiveFormats);
  }, [updateActiveFormats]);

  // ✅ FIXED v2: build FRESH range from offsets — bulletproof
  const applyColorToSelection = useCallback((newColor: string, isHighlight = false) => {
    const editor = editorRef.current;
    if (!editor) return;

    // Guard 1: no saved selection
    if (!savedSelRef.current || !hasSelectionRef.current) {
      setToast("⚠ Pehle text select karo, phir color choose karo");
      setTimeout(() => setToast(null), 2200);
      return;
    }

    const { start, end } = savedSelRef.current;
    if (start === end) {
      setToast("⚠ Pehle text select karo, phir color choose karo");
      setTimeout(() => setToast(null), 2200);
      return;
    }

    // Build brand-new range from offsets
    const startPos = getNodeAtOffset(start, editor);
    const endPos = getNodeAtOffset(end, editor);
    if (!startPos || !endPos) {
      setToast("⚠ Selection restore fail — dobara select karo");
      setTimeout(() => setToast(null), 2200);
      return;
    }

    editor.focus();

    try {
      const range = document.createRange();
      range.setStart(startPos.node, startPos.offset);
      range.setEnd(endPos.node, endPos.offset);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    } catch {
      setToast("⚠ Selection restore fail — dobara select karo");
      setTimeout(() => setToast(null), 2200);
      return;
    }

    // Guard 2: verify selection is REAL and NON-COLLAPSED
    const verify = window.getSelection();
    if (!verify || verify.toString().length === 0) {
      setToast("⚠ Pehle text select karo, phir color choose karo");
      setTimeout(() => setToast(null), 2200);
      return;
    }

    // Apply color to the verified live selection
    try { document.execCommand("styleWithCSS", false, "true"); } catch {}
    document.execCommand(isHighlight ? "hiliteColor" : "foreColor", false, newColor);

    if (isHighlight) setHighlight(newColor); else setColor(newColor);
    syncFromEditor();
    setToast(isHighlight ? "✨ Highlight applied to selection" : "🎨 Color applied to selection");
    setTimeout(() => setToast(null), 1500);
  }, [syncFromEditor]);

  // -------- GRAMMAR --------
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
      const errs: ErrorItem[] = (data.matches || []).slice(0, 20).map((m: any) => ({
        message: m.message, offset: m.offset, length: m.length,
        replacement: m.replacements?.[0]?.value || "",
        category: m.rule?.category?.name || m.rule?.issueType || "Grammar",
      }));
      setErrors(errs);
    } catch {} finally { setChecking(false); }
  }, [text, lang]);

  useEffect(() => {
    if (text.length < 15) return;
    const t = setTimeout(() => { checkGrammar(); }, 1500);
    return () => clearTimeout(t);
  }, [text, lang, checkGrammar]);

  const highlightedHtml = useMemo(() => {
    if (!showHighlight || errors.length === 0) return "";
    let out = escapeHtml(text);
    [...errors].sort((a, b) => b.offset - a.offset).forEach(err => {
      const before = out.substring(0, err.offset);
      const mid = out.substring(err.offset, err.offset + err.length);
      const after = out.substring(err.offset + err.length);
      const cat = err.category || "";
      const clr = /spell/i.test(cat) ? "red" : /punct/i.test(cat) ? "orange" : /style/i.test(cat) ? "violet" : "red";
      out = `${before}<span style="text-decoration:underline wavy ${clr} 2.5px;text-underline-offset:4px;background:rgba(255,0,0,0.08)" title="${escapeHtml(cat)}: ${escapeHtml(err.message)} → ${escapeHtml(err.replacement)}">${mid}</span>${after}`;
    });
    return out.replace(/\n/g, "<br>");
  }, [text, errors, showHighlight]);

  // -------- EDIT OPS --------
  const handleCut = () => {
    const sel = window.getSelection();
    if (sel && sel.toString().length > 0) {
      try { navigator.clipboard.writeText(sel.toString()); } catch {}
      sel.deleteFromDocument();
      syncFromEditor();
    } else setToast("⚠ Select text first");
    setTimeout(() => setToast(null), 1800);
  };

  const handleCopy = async () => {
    const sel = window.getSelection();
    try {
      const toCopy = sel && sel.toString().length > 0 ? sel.toString() : text;
      await navigator.clipboard.writeText(toCopy);
      setCopied(true); setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const handlePaste = async () => {
    editorRef.current?.focus();
    try {
      const t = await navigator.clipboard.readText();
      if (t) document.execCommand("insertText", false, t);
    } catch { document.execCommand("paste"); }
    syncFromEditor();
  };

  const handleDeleteKey = () => { editorRef.current?.focus(); document.execCommand("forwardDelete"); syncFromEditor(); };
  const handleBackspace = () => { editorRef.current?.focus(); document.execCommand("delete"); syncFromEditor(); };
  const handleClear = () => {
    if (!text) return;
    if (!confirm("Clear all text?")) return;
    if (editorRef.current) editorRef.current.innerHTML = "";
    setHtml(""); setText(""); setErrors([]); setWritingTime(0);
  };

  const handleCopyStats = async () => {
    const s = `Words: ${stats.words} | Chars(with): ${stats.chars} | Chars(without): ${stats.charsNoSpace} | Sentences: ${stats.sentences} | Paragraphs: ${stats.paras} | Lines: ${stats.lines} | Reading: ${stats.readingTime}m | Speaking: ${stats.speakingTime}m | Writing: ${formatTime(writingTime)} | Flesch: ${stats.flesch} (${stats.level})`;
    try { await navigator.clipboard.writeText(s); setCopiedStats(true); setTimeout(() => setCopiedStats(false), 1500); } catch {}
  };

  const exportTxt = () => { const b = new Blob([text], { type: "text/plain" }); const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = "doc.txt"; a.click(); URL.revokeObjectURL(a.href); };
  const exportHtml = () => { const b = new Blob([`<!doctype html><html><head><meta charset="utf-8"><style>body{font-family:${FONTS.find(f => f.name === font)?.css};font-size:${fontSize}px;line-height:${lineHeight};padding:40px;max-width:800px;margin:auto;color:${color}}</style></head><body>${html || escapeHtml(text)}</body></html>`], { type: "text/html" }); const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = "doc.html"; a.click(); URL.revokeObjectURL(a.href); };
  const exportDoc = () => { const b = new Blob([`<html><body>${html || escapeHtml(text)}</body></html>`], { type: "application/msword" }); const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = "doc.doc"; a.click(); URL.revokeObjectURL(a.href); };
  const exportPdf = () => { const w = window.open("", "_blank"); if (w) { w.document.write(`<div style="font-family:${FONTS.find(f => f.name === font)?.css};font-size:${fontSize}px;line-height:${lineHeight};padding:24px;color:${color}">${html || escapeHtml(text)}</div>`); w.document.close(); setTimeout(() => w.print(), 300); } };
  const htmlToMarkdown = (h: string) => h.replace(/<strong>|<b>/gi, "**").replace(/<\/strong>|<\/b>/gi, "**").replace(/<em>|<i>/gi, "*").replace(/<\/em>|<\/i>/gi, "*").replace(/<u>/gi, "__").replace(/<\/u>/gi, "__").replace(/<h1[^>]*>/gi, "\n# ").replace(/<\/h1>/gi, "\n").replace(/<h2[^>]*>/gi, "\n## ").replace(/<\/h2>/gi, "\n").replace(/<h3[^>]*>/gi, "\n### ").replace(/<\/h3>/gi, "\n").replace(/<li[^>]*>/gi, "\n- ").replace(/<\/li>/gi, "").replace(/<br\s*\/?>/gi, "\n").replace(/<\/p>/gi, "\n\n").replace(/<[^>]+>/g, "").replace(/\n{3,}/g, "\n\n");
  const exportMarkdown = () => { const md = htmlToMarkdown(html || escapeHtml(text)); const b = new Blob([md], { type: "text/markdown" }); const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = "doc.md"; a.click(); URL.revokeObjectURL(a.href); };
  const exportCsv = () => {
    const rows = [["Metric", "Value"], ["Words", stats.words], ["Chars (with)", stats.chars], ["Chars (without)", stats.charsNoSpace], ["Sentences", stats.sentences], ["Paragraphs", stats.paras], ["Lines", stats.lines], ["Reading Time (min)", stats.readingTime], ["Speaking Time (min)", stats.speakingTime], ["Writing Time", formatTime(writingTime)], ["Flesch Score", stats.flesch], ["Level", stats.level]];
    const csv = rows.map(r => r.join(",")).join("\n");
    const b = new Blob([csv], { type: "text/csv" }); const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = "stats.csv"; a.click(); URL.revokeObjectURL(a.href);
  };

  const toggleVoice = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert("❌ Voice typing sirf Chrome/Edge me."); return; }
    if (isListening && recognitionRef.current) { try { recognitionRef.current.stop(); } catch {} setIsListening(false); return; }
    try {
      const rec = new SR();
      recognitionRef.current = rec;
      rec.lang = lang; rec.continuous = false; rec.interimResults = false; rec.maxAlternatives = 1;
      rec.onstart = () => setIsListening(true);
      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        editorRef.current?.focus();
        document.execCommand("insertText", false, " " + transcript);
        syncFromEditor();
      };
      rec.onerror = (e: any) => { setIsListening(false); if (e.error === "not-allowed") alert("Mic blocked."); };
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

  const fixError = (err: ErrorItem) => {
    const nt = text.substring(0, err.offset) + err.replacement + text.substring(err.offset + err.length);
    if (editorRef.current) editorRef.current.innerText = nt;
    setHtml(editorRef.current?.innerHTML || "");
    setText(nt);
    setErrors(p => p.filter(e => e !== err));
  };
  const fixAll = () => {
    let nt = text;
    [...errors].sort((a, b) => b.offset - a.offset).forEach(err => {
      nt = nt.substring(0, err.offset) + err.replacement + nt.substring(err.offset + err.length);
    });
    if (editorRef.current) editorRef.current.innerText = nt;
    setHtml(editorRef.current?.innerHTML || "");
    setText(nt);
    setErrors([]);
  };
  const changeCase = (mode: string) => {
    if (!text || !mode) return;
    let out = text;
    if (mode === "upper") out = text.toUpperCase();
    else if (mode === "lower") out = text.toLowerCase();
    else if (mode === "title") out = text.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.substr(1).toLowerCase());
    else if (mode === "sentence") out = text.toLowerCase().replace(/(^\s*\w|[.!?]\s+\w)/g, c => c.toUpperCase());
    if (editorRef.current) editorRef.current.innerText = out;
    setHtml(editorRef.current?.innerHTML || "");
    setText(out);
  };
  const doReplace = () => {
    if (!findText) return;
    const out = text.split(findText).join(replaceText);
    if (editorRef.current) editorRef.current.innerText = out;
    setHtml(editorRef.current?.innerHTML || "");
    setText(out);
  };

  const insertLink = () => {
    const url = prompt("Enter URL:", "https://");
    if (url && url !== "https://") {
      exec("createLink", url);
      setToast("🔗 Link inserted in selection");
      setTimeout(() => setToast(null), 1500);
    }
  };
  const insertHR = () => exec("insertHorizontalRule");
  const insertEmoji = (emoji: string) => { insertAtCursor(emoji); setShowEmojiPicker(false); };

  // -------- SHORTCUTS --------
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;
      const inEditor = editorRef.current && document.activeElement === editorRef.current;

      if (ctrl && e.key.toLowerCase() === "s") { e.preventDefault(); safeSet("lorem_word_html", html); safeSet("lorem_word_text", text); setSaveStatus("saved"); setTimeout(() => setSaveStatus("idle"), 1000); return; }
      if (ctrl && e.key.toLowerCase() === "f") { e.preventDefault(); setShowFind(v => !v); return; }
      if (ctrl && e.key === "/") { e.preventDefault(); setShowShortcuts(v => !v); return; }

      if (!inEditor) return;

      if (ctrl && !shift && e.key.toLowerCase() === "b") { e.preventDefault(); exec("bold"); return; }
      if (ctrl && !shift && e.key.toLowerCase() === "i") { e.preventDefault(); exec("italic"); return; }
      if (ctrl && !shift && e.key.toLowerCase() === "u") { e.preventDefault(); exec("underline"); return; }
      if (ctrl && shift && (e.key.toLowerCase() === "s" || e.key.toLowerCase() === "x")) { e.preventDefault(); exec("strikeThrough"); return; }
      if (ctrl && e.key.toLowerCase() === "k") { e.preventDefault(); insertLink(); return; }
      if (ctrl && !shift && e.key.toLowerCase() === "z") { e.preventDefault(); exec("undo"); return; }
      if (ctrl && shift && e.key.toLowerCase() === "z") { e.preventDefault(); exec("redo"); return; }
      if (ctrl && e.key.toLowerCase() === "y") { e.preventDefault(); exec("redo"); return; }
      if (ctrl && shift && e.key === "7") { e.preventDefault(); exec("insertOrderedList"); return; }
      if (ctrl && shift && e.key === "8") { e.preventDefault(); exec("insertUnorderedList"); return; }
      if (ctrl && !shift && e.key.toLowerCase() === "l") { e.preventDefault(); exec("justifyLeft"); return; }
      if (ctrl && !shift && e.key.toLowerCase() === "e") { e.preventDefault(); exec("justifyCenter"); return; }
      if (ctrl && !shift && e.key.toLowerCase() === "r") { e.preventDefault(); exec("justifyRight"); return; }
      if (ctrl && !shift && e.key.toLowerCase() === "j") { e.preventDefault(); exec("justifyFull"); return; }
      if (e.key === "Tab" && suggestions.length > 0) { e.preventDefault(); insertSuggestion(suggestions[0]); return; }
      if (e.key === "Tab" && ctrl) { e.preventDefault(); exec("indent"); return; }
      if (e.key === "Escape") { setSuggestions([]); setShowEmojiPicker(false); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [html, text, suggestions, exec]);

  const loadSample = () => {
    const sampleHtml = `<p>${SAMPLE}</p>`;
    if (editorRef.current) editorRef.current.innerHTML = sampleHtml;
    setHtml(sampleHtml);
    setText(SAMPLE);
  };

  const currentFont = FONTS.find(f => f.name === font) || FONTS[0];
  const page = PAGE_SIZES[pageSize] || PAGE_SIZES.A4;

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
          <div className="flex justify-between mb-6 items-center flex-wrap gap-2">
            <button onClick={() => setIsFocus(false)} className="px-4 py-2 glass-btn rounded-xl text-sm font-bold">← Exit Focus</button>
            <div className="flex gap-2 items-center text-sm opacity-70 flex-wrap">
              <span>{stats.words} words</span><span>•</span><span>{formatTime(writingTime)}</span><span>•</span><span>{autoLang}</span>
              <button onClick={() => setPomodoroRunning(!pomodoroRunning)} className="glass-btn px-3 py-1 rounded-lg text-xs font-bold">🍅 {Math.floor(pomodoroTime / 60)}:{String(pomodoroTime % 60).padStart(2, "0")}</button>
            </div>
          </div>
          <div className="glass rounded-3xl p-6">
            <div ref={editorRef} contentEditable suppressContentEditableWarning
              onInput={handleInput} onMouseDown={saveSelection} onMouseUp={saveSelection} onKeyUp={saveSelection} onBlur={saveSelection}
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
        .glass-btn{backdrop-filter:blur(12px);background:${isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.65)"};border:1px solid ${isDark ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.9)"};transition:all 0.2s}
        .glass-btn:hover{transform:translateY(-1px);box-shadow:0 8px 20px rgba(139,92,246,0.2)}
        .fmt-btn{padding:0;width:36px;height:36px;display:inline-flex;align-items:center;justify-content:center;font-weight:700;border-radius:10px;transition:all 0.15s;font-size:14px}
        .fmt-btn.active{background:linear-gradient(135deg,#a855f7,#ec4899);color:#fff;border-color:transparent}
        [contenteditable]:focus{outline:none}
        [contenteditable] a{color:#7c3aed;text-decoration:underline}
        [contenteditable] blockquote{border-left:4px solid #a855f7;padding-left:12px;margin:8px 0;opacity:0.85}
        [contenteditable] pre{background:rgba(124,58,237,0.08);padding:10px;border-radius:8px;font-family:'JetBrains Mono',monospace;font-size:0.9em}
        [contenteditable] code{background:rgba(124,58,237,0.1);padding:1px 5px;border-radius:4px;font-family:'JetBrains Mono',monospace;font-size:0.9em}
        [contenteditable] hr{border:none;border-top:2px solid rgba(168,85,247,0.3);margin:12px 0}
        [contenteditable] ul,[contenteditable] ol{padding-left:22px;margin:4px 0}
        [contenteditable] h1{font-size:1.8em;font-weight:900;margin:12px 0 8px}
        [contenteditable] h2{font-size:1.5em;font-weight:800;margin:10px 0 6px}
        [contenteditable] h3{font-size:1.25em;font-weight:700;margin:8px 0 4px}
        @keyframes shimmer{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
        .gradient-text{background:linear-gradient(90deg,#a855f7,#ec4899,#06b6d4);background-size:200% auto;animation:shimmer 4s linear infinite;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
      `}</style>

      {toast && (<div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-2xl shadow-2xl font-bold animate-pulse max-w-[90vw] text-center">{toast}</div>)}

      <div className="max-w-6xl mx-auto p-4 md:p-8 relative">
        <div className="text-center mb-6">
          <div className="inline-flex px-4 py-1.5 rounded-full glass-btn text-[11px] tracking-widest mb-3 font-bold">✨ v5 · SELECTION-ONLY COLOR · FORMAT BAR TOGGLE</div>
          <h1 className="text-5xl md:text-6xl font-black gradient-text">Word Counter Pro</h1>
          <p className="mt-2 opacity-70 text-sm">Full writing studio with rich text editor, grammar check, and 30+ tools</p>
          <div className="flex justify-center gap-2 mt-4 flex-wrap items-center">
            <select value={lang} onChange={e => setLang(e.target.value)} className="h-9 rounded-xl glass-btn px-3 text-sm font-bold">{LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.flag} {l.label}</option>)}</select>
            <span className="text-xs px-3 py-1.5 rounded-full bg-gradient-to-r from-violet-600 to-pink-600 text-white font-bold">{autoLang}</span>
            <span className="text-sm opacity-70">{stats.words}/{goal} • {progress}%</span>
            <span className={`text-xs px-2 py-1.5 rounded-full ${saveStatus === "saved" ? "bg-green-500/20 text-green-700 dark:text-green-300" : "glass-btn"}`}>{saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "Saved ✓" : "Auto-save"}</span>
            <span className={`text-xs px-2 py-1.5 rounded-full ${isActive ? "bg-blue-500/20 text-blue-700 dark:text-blue-300" : "glass-btn"}`}>⏱ {formatTime(writingTime)}</span>
            <button onClick={() => setPomodoroRunning(!pomodoroRunning)} className={`text-xs px-3 py-1.5 rounded-full font-bold ${pomodoroRunning ? "bg-red-500 text-white" : "glass-btn"}`}>🍅 {Math.floor(pomodoroTime / 60)}:{String(pomodoroTime % 60).padStart(2, "0")}</button>
            <button onClick={() => setShowShortcuts(v => !v)} className="text-xs px-3 py-1.5 rounded-full glass-btn font-bold">⌨ Shortcuts</button>
          </div>
          <div className="flex justify-center items-center gap-3 mt-3">
            <div className="max-w-md w-full h-2.5 bg-white/40 dark:bg-white/10 rounded-full overflow-hidden">
              <div style={{ width: `${progress}%` }} className={`h-full transition-all ${progress >= 100 ? "bg-green-500" : "bg-gradient-to-r from-violet-500 via-pink-500 to-cyan-500"}`} />
            </div>
            <span className="text-xs font-bold">{stats.words}/{goal}</span>
            <input type="number" min={1} value={goal} onChange={e => setGoal(Math.max(1, parseInt(e.target.value) || 1))} className="w-20 h-7 text-xs px-2 rounded-lg glass-btn" />
          </div>
        </div>

        {showShortcuts && (
          <div className="glass rounded-2xl p-4 mb-3 grid md:grid-cols-3 gap-3 text-xs">
            <div><b className="block mb-1 text-violet-600">Formatting</b>Ctrl+B Bold<br />Ctrl+I Italic<br />Ctrl+U Underline<br />Ctrl+Shift+S Strikethrough<br />Ctrl+K Insert Link</div>
            <div><b className="block mb-1 text-violet-600">Edit</b>Ctrl+Z Undo<br />Ctrl+Y / Ctrl+Shift+Z Redo<br />Ctrl+F Find & Replace<br />Ctrl+S Force Save<br />Ctrl+/ Toggle this panel</div>
            <div><b className="block mb-1 text-violet-600">Alignment & Lists</b>Ctrl+L Left • Ctrl+E Center<br />Ctrl+R Right • Ctrl+J Justify<br />Ctrl+Shift+7 Numbered List<br />Ctrl+Shift+8 Bullet List<br />Tab Accept suggestion</div>
          </div>
        )}

        {/* TOOLBAR ROW 1 */}
        <div className="glass rounded-2xl p-3 mb-2 flex flex-wrap gap-1.5 items-center justify-between sticky top-2 z-20">
          <div className="flex gap-1 flex-wrap items-center">
            <button onClick={() => exec("undo")} className="h-9 px-3 rounded-lg glass-btn text-xs font-bold" title="Undo (Ctrl+Z)">↶ Undo</button>
            <button onClick={() => exec("redo")} className="h-9 px-3 rounded-lg glass-btn text-xs font-bold" title="Redo (Ctrl+Y)">↷ Redo</button>
            <div className="w-px h-6 bg-white/30 mx-1" />
            <button onClick={handleCut} className="h-9 px-3 rounded-lg glass-btn text-xs font-bold">✂ Cut</button>
            <button onClick={handleCopy} className="h-9 px-3 rounded-lg glass-btn text-xs font-bold">{copied ? "✓ Copied" : "📋 Copy"}</button>
            <button onClick={handlePaste} className="h-9 px-3 rounded-lg glass-btn text-xs font-bold">📥 Paste</button>
            <button onClick={handleBackspace} className="h-9 px-3 rounded-lg glass-btn text-xs font-bold">⌫</button>
            <button onClick={handleDeleteKey} className="h-9 px-3 rounded-lg bg-red-500/20 text-red-700 dark:text-red-300 text-xs font-bold border border-red-300/40">⌦</button>
            <button onClick={handleClear} className="h-9 px-3 rounded-lg bg-red-500/20 text-red-700 dark:text-red-300 text-xs font-bold border border-red-300/40">🗑 Clear</button>
            <div className="w-px h-6 bg-white/30 mx-1" />
            <button
              onClick={() => setShowFormatBar(v => !v)}
              className={`h-9 px-3 rounded-lg text-xs font-bold transition-all ${showFormatBar ? "glass-btn" : "bg-gradient-to-r from-violet-600 to-pink-600 text-white"}`}
              title="Toggle formatting toolbar (show/hide)"
            >
              {showFormatBar ? "▲ Hide Format Bar" : "▼ Show Format Bar"}
            </button>
          </div>
          <div className="flex gap-1.5 flex-wrap items-center">
            <button onClick={() => setShowFind(v => !v)} className="h-9 px-3 rounded-xl glass-btn text-xs font-bold">🔍 Find</button>
            <button onClick={() => setShowSettings(v => !v)} className="h-9 px-3 rounded-xl glass-btn text-xs font-bold">⚙ Settings</button>
            <button onClick={toggleVoice} className={`h-10 px-5 rounded-xl text-xs font-black border-2 shadow transition ${isListening ? "bg-red-500 text-white border-red-500 animate-pulse" : "bg-gradient-to-r from-violet-600 to-pink-600 text-white border-transparent hover:shadow-lg"}`}>{isListening ? "■ STOP" : "🎤 VOICE"}</button>
            <button onClick={toggleSpeak} className={`h-9 px-3 rounded-xl text-xs font-bold border ${isSpeaking ? "bg-red-500 text-white border-red-500" : "glass-btn"}`}>{isSpeaking ? "■" : "🔊"}</button>
            <button onClick={share} className="h-9 px-3 rounded-xl glass-btn text-xs font-bold">↗</button>
            <button onClick={() => setIsFocus(true)} className="h-9 px-3 rounded-xl bg-black/80 text-white text-xs font-bold">⛶</button>
            <button onClick={() => setIsDark(!isDark)} className="h-9 px-3 rounded-xl glass-btn text-xs font-bold">{isDark ? "☀" : "🌙"}</button>
          </div>
        </div>

        {/* TOOLBAR ROW 2 - FORMATTING */}
        {showFormatBar && (
          <div className="glass rounded-2xl p-2 mb-3 flex flex-wrap gap-1 items-center sticky top-16 z-20 transition-all duration-300">
            <button onClick={() => exec("bold")} className={`fmt-btn glass-btn ${activeFormats.bold ? "active" : ""}`} title="Bold (Ctrl+B)"><b>B</b></button>
            <button onClick={() => exec("italic")} className={`fmt-btn glass-btn ${activeFormats.italic ? "active" : ""}`} title="Italic (Ctrl+I)"><i>I</i></button>
            <button onClick={() => exec("underline")} className={`fmt-btn glass-btn ${activeFormats.underline ? "active" : ""}`} title="Underline (Ctrl+U)"><u>U</u></button>
            <button onClick={() => exec("strikeThrough")} className={`fmt-btn glass-btn ${activeFormats.strikeThrough ? "active" : ""}`} title="Strike"><s>S</s></button>
            <button onClick={() => exec("superscript")} className="fmt-btn glass-btn" title="Superscript">X²</button>
            <button onClick={() => exec("subscript")} className="fmt-btn glass-btn" title="Subscript">X₂</button>
            <div className="w-px h-6 bg-white/30 mx-1" />
            <select onChange={e => { if (e.target.value) exec("formatBlock", e.target.value); e.target.value = ""; }} className="h-9 rounded-lg glass-btn px-2 text-xs font-bold">
              <option value="">H ▾</option>
              <option value="h1">Heading 1</option>
              <option value="h2">Heading 2</option>
              <option value="h3">Heading 3</option>
              <option value="p">Paragraph</option>
              <option value="blockquote">Quote</option>
              <option value="pre">Code Block</option>
            </select>
            <button onClick={() => exec("formatBlock", "blockquote")} className="h-9 px-2.5 rounded-lg glass-btn text-xs font-bold">❝</button>
            <button onClick={() => exec("formatBlock", "pre")} className="h-9 px-2.5 rounded-lg glass-btn text-xs font-bold">{"</>"}</button>
            <div className="w-px h-6 bg-white/30 mx-1" />
            <button onClick={() => exec("insertUnorderedList")} className={`fmt-btn glass-btn ${activeFormats.insertUnorderedList ? "active" : ""}`}>•</button>
            <button onClick={() => exec("insertOrderedList")} className={`fmt-btn glass-btn ${activeFormats.insertOrderedList ? "active" : ""}`}>1.</button>
            <button onClick={() => exec("outdent")} className="fmt-btn glass-btn">⇤</button>
            <button onClick={() => exec("indent")} className="fmt-btn glass-btn">⇥</button>
            <div className="w-px h-6 bg-white/30 mx-1" />
            <button onClick={() => exec("justifyLeft")} className={`fmt-btn glass-btn ${activeFormats.justifyLeft ? "active" : ""}`}>⬅</button>
            <button onClick={() => exec("justifyCenter")} className={`fmt-btn glass-btn ${activeFormats.justifyCenter ? "active" : ""}`}>↔</button>
            <button onClick={() => exec("justifyRight")} className={`fmt-btn glass-btn ${activeFormats.justifyRight ? "active" : ""}`}>➡</button>
            <button onClick={() => exec("justifyFull")} className={`fmt-btn glass-btn ${activeFormats.justifyFull ? "active" : ""}`}>≡</button>
            <div className="w-px h-6 bg-white/30 mx-1" />

            {/* FIXED TEXT COLOR — Only applies to selection */}
            <div className="flex items-center gap-1" title="Text color (applies to selected text only)">
              <span className="text-[10px] font-bold opacity-60">A</span>
              <input type="color" value={color}
                onMouseDown={saveSelection}
                onChange={e => applyColorToSelection(e.target.value, false)}
                className="w-8 h-8 rounded-lg glass-btn p-1 cursor-pointer" />
            </div>
            <div className="flex gap-0.5">
              {TEXT_COLORS.slice(1, 6).map(c => (
                <button key={c}
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => applyColorToSelection(c, false)}
                  className="w-5 h-5 rounded-full border border-white/60 hover:scale-125 transition"
                  style={{ background: c }}
                  title={`Color: ${c}`} />
              ))}
            </div>

            {/* Highlight color */}
            <div className="flex items-center gap-1 ml-1" title="Highlight color (applies to selected text only)">
              <span className="text-[10px] font-bold opacity-60">H</span>
              <input type="color" value={highlight}
                onMouseDown={saveSelection}
                onChange={e => applyColorToSelection(e.target.value, true)}
                className="w-8 h-8 rounded-lg glass-btn p-1 cursor-pointer" />
            </div>
            <div className="flex gap-0.5">
              {HIGHLIGHT_COLORS.slice(0, 4).map(c => (
                <button key={c}
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => applyColorToSelection(c, true)}
                  className="w-5 h-5 rounded-full border border-white/60 hover:scale-125 transition"
                  style={{ background: c }}
                  title={`Highlight: ${c}`} />
              ))}
            </div>
            <button onClick={() => exec("removeFormat")} className="h-9 px-2.5 rounded-lg glass-btn text-xs font-bold ml-1" title="Clear formatting">Tx</button>
            <div className="w-px h-6 bg-white/30 mx-1" />
            <button onClick={insertLink} className="h-9 px-2.5 rounded-lg glass-btn text-xs font-bold" title="Insert Link">🔗</button>
            <button onClick={insertHR} className="h-9 px-2.5 rounded-lg glass-btn text-xs font-bold" title="Horizontal Rule">―</button>
            <div className="relative">
              <button onClick={() => setShowEmojiPicker(v => !v)} className="h-9 px-2.5 rounded-lg glass-btn text-xs font-bold">😊</button>
              {showEmojiPicker && (
                <div className="absolute top-full mt-1 right-0 glass rounded-xl p-2 grid grid-cols-5 gap-1 z-40 w-56">
                  {EMOJIS.map(e => (<button key={e} onClick={() => insertEmoji(e)} className="text-xl hover:scale-125 transition p-1 rounded">{e}</button>))}
                </div>
              )}
            </div>
            <div className="w-px h-6 bg-white/30 mx-1" />
            <select onChange={e => { changeCase(e.target.value); e.target.value = ""; }} className="h-9 rounded-lg glass-btn px-2 text-xs font-bold">
              <option value="">Aa ▾</option>
              <option value="upper">UPPER</option>
              <option value="lower">lower</option>
              <option value="title">Title</option>
              <option value="sentence">Sentence</option>
            </select>
          </div>
        )}

        {showSettings && (
          <div className="glass rounded-2xl p-4 mb-3 grid md:grid-cols-4 gap-3">
            <div><label className="text-[10px] uppercase opacity-60 font-bold">Page Size</label>
              <select value={pageSize} onChange={e => setPageSize(e.target.value)} className="w-full h-9 rounded-lg glass-btn px-2 text-sm border mt-1">{Object.entries(PAGE_SIZES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select>
            </div>
            <div><label className="text-[10px] uppercase opacity-60 font-bold">Font Family</label>
              <select value={font} onChange={e => setFont(e.target.value)} className="w-full h-9 rounded-lg glass-btn px-2 text-sm border mt-1">{FONTS.map(f => <option key={f.name} value={f.name}>{f.name}{f.mono ? " (mono)" : ""}</option>)}</select>
            </div>
            <div><label className="text-[10px] uppercase opacity-60 font-bold">Font Size: {fontSize}px</label>
              <input type="range" min={10} max={32} value={fontSize} onChange={e => setFontSize(parseInt(e.target.value))} className="w-full mt-2" />
            </div>
            <div><label className="text-[10px] uppercase opacity-60 font-bold">Line Height: {lineHeight}</label>
              <input type="range" min={1} max={2.5} step={0.1} value={lineHeight} onChange={e => setLineHeight(parseFloat(e.target.value))} className="w-full mt-2" />
            </div>
            <div className="md:col-span-4 flex flex-wrap gap-4 pt-2 border-t border-white/30">
              <label className="flex items-center gap-2 text-xs cursor-pointer"><input type="checkbox" checked={autoCorrect} onChange={e => setAutoCorrect(e.target.checked)} /> Auto Correct</label>
              <label className="flex items-center gap-2 text-xs cursor-pointer"><input type="checkbox" checked={autoComplete} onChange={e => setAutoComplete(e.target.checked)} /> Auto Complete (Tab)</label>
              <label className="flex items-center gap-2 text-xs cursor-pointer"><input type="checkbox" checked={showHighlight} onChange={e => setShowHighlight(e.target.checked)} /> Show Red Wavy</label>
              <label className="flex items-center gap-2 text-xs cursor-pointer"><input type="checkbox" checked={duplicateHighlight} onChange={e => setDuplicateHighlight(e.target.checked)} /> Duplicate Highlight</label>
              <span className="text-xs opacity-60 ml-auto">📄 {page.w}×{page.h}mm • {currentFont.mono ? "Mono" : "Prop"}</span>
            </div>
          </div>
        )}

        {showFind && (
          <div className="glass rounded-2xl p-3 mb-3 flex gap-2 items-center flex-wrap">
            <input value={findText} onChange={e => setFindText(e.target.value)} placeholder="Find..." className="h-9 px-3 rounded-lg glass-btn text-sm flex-1 min-w-[140px]" />
            <input value={replaceText} onChange={e => setReplaceText(e.target.value)} placeholder="Replace with..." className="h-9 px-3 rounded-lg glass-btn text-sm flex-1 min-w-[140px]" />
            <button onClick={doReplace} disabled={!findText} className="h-9 px-4 rounded-lg bg-gradient-to-r from-violet-600 to-pink-600 text-white text-sm font-bold disabled:opacity-40">Replace All</button>
            <button onClick={() => setShowFind(false)} className="h-9 px-3 rounded-lg glass-btn text-sm">✕</button>
          </div>
        )}

        <div className="flex gap-2 mb-4 justify-between flex-wrap">
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => { checkGrammar(); setShowHighlight(true); }} className="text-xs px-3 py-1.5 rounded-full bg-gradient-to-r from-violet-600 to-pink-600 text-white font-bold">{checking ? "Checking..." : "✓ Grammar Check"}</button>
            {errors.length > 0 && (<button onClick={fixAll} className="text-xs px-3 py-1.5 rounded-full bg-green-500 text-white font-bold">⚡ Fix All ({errors.length})</button>)}
            <button onClick={handleCopyStats} className="text-xs px-3 py-1.5 rounded-full glass-btn font-bold">{copiedStats ? "✓ Copied" : "⎙ Copy Stats"}</button>
            <button onClick={loadSample} className="text-xs px-3 py-1.5 rounded-full glass-btn font-bold">📄 Sample</button>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={exportTxt} className="text-xs px-3 py-1.5 rounded-full glass-btn font-bold">TXT</button>
            <button onClick={exportHtml} className="text-xs px-3 py-1.5 rounded-full glass-btn font-bold">HTML</button>
            <button onClick={exportMarkdown} className="text-xs px-3 py-1.5 rounded-full glass-btn font-bold">MD</button>
            <button onClick={exportDoc} className="text-xs px-3 py-1.5 rounded-full glass-btn font-bold">DOC</button>
            <button onClick={exportCsv} className="text-xs px-3 py-1.5 rounded-full glass-btn font-bold">CSV</button>
            <button onClick={exportPdf} className="text-xs px-3 py-1.5 rounded-full bg-black text-white font-bold">PDF</button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="glass rounded-3xl p-3 relative">
              <div className="px-3 py-1.5 text-[10px] opacity-60 flex justify-between">
                <span>📄 {page.label} • {fontSize}px • LH {lineHeight} • {currentFont.name}</span>
                <span>{currentFont.mono ? "🔤 Mono" : "🔡 Prop"}</span>
              </div>
              <div ref={editorRef} contentEditable suppressContentEditableWarning
                onInput={handleInput}
                onMouseDown={saveSelection}
                onMouseUp={saveSelection}
                onKeyUp={saveSelection}
                onBlur={saveSelection}
                onKeyDown={updateActiveFormats}
                spellCheck={true}
                className={`w-full min-h-[500px] p-6 rounded-2xl ${isDark ? "bg-black/30" : "bg-white/60"} outline-none`}
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
              <div className="px-3 py-2 text-[11px] opacity-60 flex justify-between flex-wrap gap-1">
                <span>💡 Select text → click A or H → color applies only to selection • Ctrl+/ for shortcuts</span>
                <span>{isActive ? "🟢 Active" : "⚪ Idle"} • ⏱ {formatTime(writingTime)}</span>
              </div>
            </div>

            {showHighlight && (
              <div className="glass rounded-3xl p-4 mt-4">
                <h3 className="font-bold text-xs mb-2">🔍 Grammar Preview (LanguageTool — free Grammarly alternative)</h3>
                <div className={`min-h-[80px] p-4 rounded-2xl ${isDark ? "bg-black/30" : "bg-white/60"} text-[15px] leading-7`} style={{ fontFamily: currentFont.css }} dangerouslySetInnerHTML={{ __html: highlightedHtml || escapeHtml(text).replace(/\n/g, "<br>") || "<span class='opacity-40'>No errors</span>" }} />
                <div className="mt-2 text-[10px] opacity-50 flex gap-3 flex-wrap">
                  <span><span className="inline-block w-3 h-0.5 bg-red-500 align-middle" /> Grammar/Spelling</span>
                  <span><span className="inline-block w-3 h-0.5 bg-orange-500 align-middle" /> Punctuation</span>
                  <span><span className="inline-block w-3 h-0.5 bg-violet-500 align-middle" /> Style</span>
                </div>
              </div>
            )}

            {errors.length > 0 && (
              <div className="glass rounded-2xl p-4 mt-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-sm">🔴 {errors.length} Issues Found</h3>
                  <button onClick={fixAll} className="text-xs px-2 py-1 bg-green-500 text-white rounded font-bold">Fix All</button>
                </div>
                {errors.map((err, i) => (
                  <div key={i} className="flex justify-between items-center p-2 glass rounded-xl text-xs mb-2 gap-2">
                    <span className="flex-1">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/20 font-bold mr-2">{err.category}</span>
                      {err.message} → <b className="text-green-600 dark:text-green-400">{err.replacement || "—"}</b>
                    </span>
                    {err.replacement && <button onClick={() => fixError(err)} className="px-3 py-1 bg-black text-white rounded-lg whitespace-nowrap font-bold">Fix</button>}
                  </div>
                ))}
              </div>
            )}

            {stats.totalSent > 0 && (
              <div className="glass rounded-2xl p-4 mt-4">
                <h3 className="font-bold text-xs uppercase mb-3">📈 Sentence Length Distribution</h3>
                <div className="space-y-2">
                  {[
                    { label: "Short (1-10 words)", value: stats.short, color: "#10b981" },
                    { label: "Medium (11-20)", value: stats.medium, color: "#f59e0b" },
                    { label: "Long (21+)", value: stats.long, color: "#ec4899" },
                  ].map(s => {
                    const pct = stats.totalSent > 0 ? (s.value / stats.totalSent) * 100 : 0;
                    return (
                      <div key={s.label}>
                        <div className="flex justify-between text-xs mb-1"><span>{s.label}</span><span className="font-bold">{s.value} ({pct.toFixed(0)}%)</span></div>
                        <div className="h-1.5 rounded-full bg-white/40 dark:bg-white/10 overflow-hidden">
                          <div className="h-full transition-all" style={{ width: `${pct}%`, background: s.color }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
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

        {/* ARTICLES */}
        <section className="mt-16 space-y-4">
          <h2 className="text-3xl font-black text-center gradient-text mb-6">📚 Guides, Documentation & FAQ</h2>
          {articlesData.map(a => (
            <div key={a.id} className="glass rounded-2xl overflow-hidden">
              <button onClick={() => setShowArticle(showArticle === a.id ? null : a.id)} className="w-full flex justify-between items-center p-5 font-bold text-left hover:bg-white/10 transition">
                <span className="text-base pr-2">{a.title}</span>
                <span className="text-2xl flex-shrink-0">{showArticle === a.id ? "−" : "+"}</span>
              </button>
              {showArticle === a.id && (
                <div className={`p-6 ${isDark ? "bg-black/20" : "bg-white/40"} text-sm leading-7 whitespace-pre-line border-t border-white/20`}>{a.content}</div>
              )}
            </div>
          ))}
        </section>

        <footer className="mt-16 text-center text-xs opacity-60 pb-8">
          <p>✨ Word Counter Pro v5 — 100% private, browser-only, no data sent to server</p>
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
    title: "📖 What is Word Counter? Complete Guide",
    content: `A Word Counter is a digital tool that analyzes written text and provides instant statistics — word count, character count, sentence count, paragraph count, reading time, and more.

━━━━━━━━━━━━━━━━━━━━━━━━━━━

WHY YOU NEED IT

• Students — Meet strict essay word limits (500/1000/2000)
• Bloggers — SEO-friendly content length 1500-2500 words
• Social Media — Twitter 280, Instagram 2200, LinkedIn 3000 chars
• Authors — Track daily word goals (2000/day)
• Translators — Bill accurately by word count
• SEO Pros — Keyword density 1-2% ideal

━━━━━━━━━━━━━━━━━━━━━━━━━━━

WHAT IT MEASURES

• Words — Total word count
• Chars (with) — Every character including spaces (Twitter 280)
• Chars (without) — Letters and numbers only (university limits)
• Sentences — Splits on . ! ?
• Paragraphs — Splits on blank lines
• Lines — Total line breaks
• Reading Time — 200 wpm (average adult)
• Speaking Time — 130 wpm (presentation speed)
• Writing Time — Active typing only (pauses after 5s idle)
• Flesch Score — 0-100 readability
• Keyword Density — Top 10 most-used words

━━━━━━━━━━━━━━━━━━━━━━━━━━━

FLESCH READING EASE SCALE

90-100 Very Easy (5th grade)
80-90 Easy (6th grade)
70-80 Fairly Easy (7th grade)
60-70 Standard (8th-9th grade)
50-60 Fairly Difficult (10-12th)
30-50 Difficult (college)
0-30 Very Difficult (graduate)

Aim for 60-70 for general web content.

━━━━━━━━━━━━━━━━━━━━━━━━━━━

PRIVACY

Everything runs in-browser. Auto-save uses localStorage. Only "Grammar Check" sends to LanguageTool API.`
  },
  {
    id: "user-guide",
    title: "📘 Complete User Guide — Every Feature Step-by-Step",
    content: `═══════════════════════════════
STEP 1: START WRITING
═══════════════════════════════
Click the big editor box. Type freely. Stats update in real-time. Auto-saves every 400ms ("Saved ✓" in header).

═══════════════════════════════
STEP 2: RICH TEXT FORMATTING TOOLS
═══════════════════════════════
The second toolbar row has ALL formatting. Use "▼ Show Format Bar" toggle to hide/show it.

▸ B (Bold) — Ctrl+B, makes text thick
▸ I (Italic) — Ctrl+I, slanted text
▸ U (Underline) — Ctrl+U, line under text
▸ S (Strikethrough) — Ctrl+Shift+S, crossed out
▸ X² (Superscript) — small raised text
▸ X₂ (Subscript) — small lowered text
▸ H Dropdown — Heading 1/2/3, Paragraph, Quote, Code Block
▸ ❝ (Quote) — indented blockquote style
▸ </> (Code Block) — monospace pre-formatted
▸ • (Bullet List) — Ctrl+Shift+8
▸ 1. (Numbered List) — Ctrl+Shift+7
▸ ⇤ Outdent / ⇥ Indent — Move lines left/right
▸ ⬅ Center ↔ Right ➡ Justify ≡ (Alignment) — Ctrl+L/E/R/J
▸ Text Color (A) — APPLIES ONLY TO SELECTED TEXT
▸ H Highlight Color — APPLIES ONLY TO SELECTED TEXT
▸ Tx (Clear Formatting) — Remove all formatting
▸ Link (🔗) — Ctrl+K, wraps selection in link
▸ Horizontal Rule (―) — Visual separator line
▸ Emoji Picker (😊) — 20 common emojis
▸ Aa Case — UPPER / lower / Title / Sentence

HOW TO USE COLOR (FIXED):
1. Select text with mouse (or Ctrl+A for all)
2. Click color box (A) or a palette swatch
3. ONLY the selected text changes color
4. If nothing is selected → warning toast appears

═══════════════════════════════
STEP 3: UNDO / REDO
═══════════════════════════════
Top toolbar: Undo (Ctrl+Z) and Redo (Ctrl+Y or Ctrl+Shift+Z). Works for every change: typing, formatting, deletion, color, alignment.

═══════════════════════════════
STEP 4: CUT / COPY / PASTE / DELETE
═══════════════════════════════
▸ Cut — Select text, click to remove to clipboard
▸ Copy — Copies selection, or all text if nothing selected
▸ Paste — Inserts clipboard at cursor position
▸ Backspace — Delete character before cursor
▸ Delete — Delete character after cursor
▸ Clear — Wipe everything (asks confirmation)

═══════════════════════════════
STEP 5: SET WORD GOAL
═══════════════════════════════
Change the "1000" to any target (100, 500, 2000, 50000). Progress bar fills visually. When reached: green toast + celebration sound.

═══════════════════════════════
STEP 6: GRAMMAR CHECK (Grammarly alternative)
═══════════════════════════════
Click "✓ Grammar Check". Errors appear with category badges:
▸ Spelling (red underline)
▸ Grammar (red underline)
▸ Punctuation (orange underline)
▸ Style (violet underline)

Options:
▸ Click "Fix" for individual error
▸ Click "Fix All" for batch
▸ Enable "Show Red Wavy" (Settings) for inline preview

═══════════════════════════════
STEP 7: VOICE TYPING
═══════════════════════════════
Click "VOICE". Speak naturally. Text inserts at your cursor. Chrome/Edge over HTTPS required. Supports 9 languages from dropdown.

═══════════════════════════════
STEP 8: TEXT TO SPEECH
═══════════════════════════════
Click speaker icon to hear your text read aloud. Great for proofreading.

═══════════════════════════════
STEP 9: FIND & REPLACE
═══════════════════════════════
Ctrl+F or click "Find". Type search text, replace text, click Replace All.

═══════════════════════════════
STEP 10: POMODORO TIMER
═══════════════════════════════
Click "25:00" in header. Timer counts down 25 minutes. On completion: toast notification and auto-reset.

═══════════════════════════════
STEP 11: FONT & PAGE CUSTOMIZATION
═══════════════════════════════
Click "Settings" to open:
▸ Page Size — A4 (210×297mm), Letter, Legal
▸ Font Family — 14 options (Poppins, Merriweather, JetBrains Mono, etc.)
▸ Font Size — 10-32px slider
▸ Line Height — 1.0-2.5 slider
▸ Text Color — Default color for new typing

═══════════════════════════════
STEP 12: TOGGLE SMART FEATURES
═══════════════════════════════
☑ Auto Correct — Fixes teh→the, adn→and (20+ typos)
☑ Auto Complete — Word suggestions; press Tab to accept
☑ Show Red Wavy — Inline grammar preview
☑ Duplicate Highlight — Flag repeated words/sentences

═══════════════════════════════
STEP 13: EXPORT YOUR WORK
═══════════════════════════════
▸ TXT — Plain text
▸ HTML — Styled web page
▸ MD — Markdown (formatting preserved)
▸ DOC — Word-compatible
▸ CSV — Stats spreadsheet
▸ PDF — Print dialog → Save as PDF

═══════════════════════════════
STEP 14: FOCUS MODE
═══════════════════════════════
Click fullscreen icon for distraction-free writing. Pomodoro timer available in focus mode too.

═══════════════════════════════
STEP 15: DARK MODE
═══════════════════════════════
Click moon icon to switch to dark theme. All glass cards adapt.

═══════════════════════════════
STEP 16: KEYBOARD SHORTCUTS
═══════════════════════════════
Press Ctrl+/ anytime to see the panel. Full list in "Keyboard Shortcuts" article.`
  },
  {
    id: "shortcuts",
    title: "⌨️ All Keyboard Shortcuts — Master Guide",
    content: `Complete list of 20+ keyboard shortcuts. Press Ctrl+/ to toggle the shortcut panel anytime.

═══════════════════════════════
FORMATTING
═══════════════════════════════
Ctrl + B — Bold
Ctrl + I — Italic
Ctrl + U — Underline
Ctrl + Shift + S — Strikethrough
Ctrl + Shift + X — Strikethrough (alternate)
Ctrl + K — Insert Link
Ctrl + Shift + 7 — Numbered List
Ctrl + Shift + 8 — Bullet List
Ctrl + Tab — Increase Indent

═══════════════════════════════
ALIGNMENT
═══════════════════════════════
Ctrl + L — Align Left
Ctrl + E — Align Center
Ctrl + R — Align Right
Ctrl + J — Justify

═══════════════════════════════
EDIT
═══════════════════════════════
Ctrl + Z — Undo
Ctrl + Y — Redo
Ctrl + Shift + Z — Redo (alternate)
Ctrl + C — Copy selection
Ctrl + X — Cut selection
Ctrl + V — Paste
Ctrl + A — Select all
Ctrl + F — Find & Replace
Ctrl + S — Force Save
Ctrl + / — Toggle Shortcut Panel

═══════════════════════════════
AUTOCOMPLETE
═══════════════════════════════
Tab — Accept first suggestion (when popup visible)
Esc — Close suggestions / emoji picker

═══════════════════════════════
PRO TIPS
═══════════════════════════════
1. Ctrl+A then Ctrl+B = Bold entire document
2. Select word → Ctrl+K → paste URL = instant link
3. Ctrl+/ anytime = quick reference
4. Works across all input fields too (Find, Replace, Goal)`
  },
  {
    id: "grammarly",
    title: "🔍 Grammarly vs LanguageTool — Honest Comparison",
    content: `Real Grammarly API is only available for Enterprise/Business accounts (paid). It is NOT free for public use.

We use LanguageTool — the best free alternative.

═══════════════════════════════
LANGUAGETOOL FEATURES
═══════════════════════════════
• 30+ languages (English, Hindi, Spanish, French, German, Japanese, Arabic, Chinese + more)
• 5000+ grammar rules
• Categories: Spelling, Grammar, Style, Punctuation
• Free forever (public API, no key required)
• Privacy: requests only go when YOU click "Check"
• No tracking

═══════════════════════════════
CATEGORIES EXPLAINED
═══════════════════════════════
▸ Spelling (red) — Misspelled words, typos
▸ Grammar (red) — Wrong tense, agreement, articles
▸ Punctuation (orange) — Comma, period, quote errors
▸ Style (violet) — Wordiness, passive voice, redundancy

═══════════════════════════════
TIPS FOR BETTER RESULTS
═══════════════════════════════
1. Select correct language variant (English US vs UK)
2. "picky" level enabled by default for more rules
3. Click "Fix All" for batch correction
4. Enable "Show Red Wavy" for inline preview
5. Hover on red wavy = see message + correct word

═══════════════════════════════
LIMITATIONS
═══════════════════════════════
• LanguageTool free tier: 20 requests/minute
• For heavy use, self-host or premium
• Real Grammarly has deeper AI (paid)
• NOT a replacement for human proofreading

═══════════════════════════════
BOTTOM LINE
═══════════════════════════════
LanguageTool covers 95% of common errors for free. Perfect for students, writers, bloggers, and professionals. No credit card, no sign-up.`
  },
  {
    id: "color-fix",
    title: "🎨 How Selection-Only Color Works (New Fix)",
    content: `The old version applied color to the ENTIRE document even when you wanted only some text colored. This is now FIXED.

═══════════════════════════════
HOW TO USE (CORRECT WAY)
═══════════════════════════════
1. Select some text with mouse (drag to highlight)
2. Click the color box (opens picker) OR click a quick swatch
3. ONLY the selected text changes color
4. Rest of text stays unchanged

═══════════════════════════════
WHAT IF NOTHING IS SELECTED?
═══════════════════════════════
You will see a warning toast: "Pehle text select karo, phir color choose karo"
Color will NOT be applied. This prevents accidental full-document changes.

═══════════════════════════════
HIGHLIGHT COLOR (same behavior)
═══════════════════════════════
The H (highlight) color picker works the same way:
1. Select text
2. Click H color or quick highlight swatch
3. Only selection gets highlighted background

═══════════════════════════════
PALETTE SWATCHES
═══════════════════════════════
5 quick color swatches next to the A color box:
▸ Click swatch → applies to current selection
▸ Faster than opening picker
▸ Swatches don't steal focus (selection preserved)

═══════════════════════════════
TECHNICAL EXPLANATION
═══════════════════════════════
▸ Selection saved as character offsets (start, end)
▸ Offsets survive DOM changes (unlike Range objects)
▸ On color click, a fresh Range is built from offsets
▸ document.execCommand("foreColor", color) applied to range
▸ Same for highlight via "hiliteColor"

═══════════════════════════════
TROUBLESHOOTING
═══════════════════════════════
Q: My color isn't changing anything
A: Nothing selected? Select text first.

Q: The palette steals my selection
A: Fixed — palettes use preventDefault so focus stays in editor.

Q: Can I color multi-paragraph selection?
A: Yes! Select across paragraphs — entire selection colors.

Q: How to remove color?
A: Select colored text → click "Tx" (Clear Formatting) button.`
  },
  {
    id: "faq-article",
    title: "❓ Complete FAQ — 15 Common Questions",
    content: `Q1: Is this Word Counter free?
A: Yes, 100% free forever. No sign-up, no ads, no limits.

Q2: Is my text saved on your servers?
A: No. Everything runs in your browser. Auto-save uses localStorage. Only "Grammar Check" sends to LanguageTool API.

Q3: Difference between "Chars (with)" and "Chars (without)"?
A: Chars (with) = every character including spaces (Twitter 280). Chars (without) = letters/numbers only (university limits).

Q4: How does Undo/Redo work?
A: Browser's native document.execCommand('undo') / ('redo'). Handles all changes: typing, formatting, deletion, color. Shortcuts: Ctrl+Z undo, Ctrl+Y or Ctrl+Shift+Z redo.

Q5: Does real Grammarly work here?
A: Real Grammarly API is enterprise-only (paid). We use LanguageTool — free, 30+ languages, 5000+ rules.

Q6: Which keyboard shortcuts are supported?
A: 20+ shortcuts. Ctrl+B/I/U for bold/italic/underline, Ctrl+Z/Y undo/redo, Ctrl+K link, Ctrl+F find, Ctrl+S save, Ctrl+L/E/R/J alignment, Ctrl+Shift+7/8 lists, Ctrl+/ panel, Tab autocomplete.

Q7: How accurate is reading time?
A: Based on 200 words per minute (average adult). Speaking time uses 130 wpm.

Q8: What's a good Flesch Score?
A: Web content: 60-70. Social media: 70-80. Academic: 30-50. Higher = easier.

Q9: Why doesn't voice typing work?
A: Needs Chrome/Edge over HTTPS. Check mic permission. Firefox/Safari don't support Web Speech API.

Q10: What is ideal keyword density?
A: 1-2% ideal for SEO. Above 3% looks like keyword stuffing.

Q11: What is duplicate detection?
A: Finds words/sentences repeating 2+ times. Enable in Settings.

Q12: How does the Pomodoro timer work?
A: Click tomato icon to start 25-minute focus session. Toast when complete. Auto-resets.

Q13: What fonts are available?
A: 14 fonts: Sans-serif (Inter, Poppins, Roboto, Arial, Verdana), Serif (Merriweather, Playfair Display, Lora, Georgia, Times New Roman), Monospace (JetBrains Mono, Fira Code, Roboto Mono, Courier New).

Q14: Can I export my work?
A: Yes — TXT, HTML (styled), MD (markdown), DOC (Word), CSV (stats), PDF.

Q15: What's the maximum text length?
A: Practically unlimited. Tested with 100,000+ words without performance issues.`
  },
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
