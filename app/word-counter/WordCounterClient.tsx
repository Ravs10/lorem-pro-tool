"use client";
import { useState, useMemo, useRef, useEffect, useCallback } from "react";

type ErrorItem = { message: string; offset: number; length: number; replacement: string; category?: string; };
type Suggestion = { word: string; at: number; replaceLen: number; };

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

const SAMPLE = `Word Counter Pro is a powerful tool. Select some text and click the color box to color it — only the selection will change!`;

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

// Character-offset helpers for reliable selection restore
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
  const [showHighlight, setShowHighlight] = useState(true);
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
    if (!trimmed) return { words: [] as [string, number][], sentences: [] as { text: string; count: number }[] };
    const words = trimmed.toLowerCase().split(/\s+/).map(w => w.replace(/[^a-z0-9]/g, "")).filter(w => w.length > 3);
    const wc: Record<string, number> = {};
    words.forEach(w => { wc[w] = (wc[w] || 0) + 1; });
    const dupWords = Object.entries(wc).filter(([, c]) => c > 1).sort((a, b) => b[1] - a[1]).slice(0, 20);
    const rawSentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 20);
    const lowerMap: Record<string, { orig: string; count: number }> = {};
    rawSentences.forEach(s => {
      const lower = s.toLowerCase();
      if (!lowerMap[lower]) lowerMap[lower] = { orig: s, count: 0 };
      lowerMap[lower].count += 1;
    });
    const dupSentences = Object.values(lowerMap).filter(v => v.count > 1).map(v => ({ text: v.orig, count: v.count }));
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

  // Save selection as character offsets
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

  // ✅ Color only to live/restored selection, never whole document
  const applyColorToSelection = useCallback((newColor: string, isHighlight = false) => {
    const editor = editorRef.current;
    if (!editor) return;

    // Prefer LIVE selection (most reliable)
    const liveSel = window.getSelection();
    let hasLive = false;
    if (liveSel && liveSel.rangeCount > 0 && !liveSel.isCollapsed) {
      const r = liveSel.getRangeAt(0);
      if (editor.contains(r.commonAncestorContainer) && r.toString().length > 0) hasLive = true;
    }

    if (!hasLive) {
      // Try restoring from saved offsets
      const saved = savedSelRef.current;
      if (!saved || saved.start === saved.end) {
        setToast("⚠ Pehle text select karo, phir color choose karo");
        setTimeout(() => setToast(null), 2200);
        return;
      }
      const startPos = getNodeAtOffset(saved.start, editor);
      const endPos = getNodeAtOffset(saved.end, editor);
      if (!startPos || !endPos) {
        setToast("⚠ Selection lost — dobara select karo");
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
    } else {
      editor.focus();
    }

    // Final guard
    const verify = window.getSelection();
    if (!verify || verify.isCollapsed || verify.toString().length === 0) {
      setToast("⚠ Pehle text select karo, phir color choose karo");
      setTimeout(() => setToast(null), 2200);
      return;
    }

    try { document.execCommand("styleWithCSS", false, "true"); } catch {}
    document.execCommand(isHighlight ? "hiliteColor" : "foreColor", false, newColor);

    if (isHighlight) setHighlight(newColor); else setColor(newColor);
    syncFromEditor();
    setToast(isHighlight ? "✨ Highlight applied to selection" : "🎨 Color applied to selection");
    setTimeout(() => setToast(null), 1500);
  }, [syncFromEditor]);

  // -------- GRAMMAR --------
  const checkGrammar = useCallback(async () => {
    const txt = (editorRef.current?.innerText || text || "").trim();
    if (!txt || txt.length < 5) {
      setErrors([]);
      return;
    }
    if (grammarAbortRef.current) grammarAbortRef.current.abort();
    const ctrl = new AbortController();
    grammarAbortRef.current = ctrl;
    setChecking(true);
    try {
      const res = await fetch("https://api.languagetool.org/v2/check", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `text=${encodeURIComponent(txt)}&language=${lang}&level=picky`,
        signal: ctrl.signal,
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      const errs: ErrorItem[] = (data.matches || []).slice(0, 30).map((m: any) => ({
        message: m.message || "Issue",
        offset: typeof m.offset === "number" ? m.offset : 0,
        length: typeof m.length === "number" ? m.length : 0,
        replacement: m.replacements?.[0]?.value || "",
        category: m.rule?.category?.name || m.rule?.issueType || "Grammar",
      }));
      setErrors(errs);
    } catch (e: any) {
      if (e?.name !== "AbortError") {
        setErrors([]);
      }
    } finally {
      setChecking(false);
    }
  }, [text, lang]);

  // Auto-check debounced
  useEffect(() => {
    if (text.length < 15) { setErrors([]); return; }
    const t = setTimeout(() => { checkGrammar(); }, 1200);
    return () => clearTimeout(t);
  }, [text, lang, checkGrammar]);

  // ✅ Build HTML that renders red wavy + duplicate highlights INSIDE the editor when toggled on
  const buildHighlightedHtml = useCallback((plain: string) => {
    if (!plain) return "";
    type Seg = { start: number; end: number; priority: number; tag: string };
    const segments: Seg[] = [];

    if (showHighlight && errors.length > 0) {
      errors.forEach(err => {
        if (err.offset < 0 || err.offset + err.length > plain.length) return;
        if (err.length === 0) return;
        const cat = err.category || "";
        const clr = /spell/i.test(cat) ? "red" : /punct/i.test(cat) ? "orange" : /style/i.test(cat) ? "violet" : "red";
        const label = `${escapeHtml(cat)}: ${escapeHtml(err.message)}${err.replacement ? " → " + escapeHtml(err.replacement) : ""}`;
        segments.push({
          start: err.offset,
          end: err.offset + err.length,
          priority: 1,
          tag: `<span data-lt-error="1" style="text-decoration: underline wavy ${clr} 2px; text-underline-offset: 4px; background: rgba(255,0,0,0.08); cursor: pointer;" title="${label}">`,
        });
      });
    }

    if (duplicateHighlight && duplicates.sentences.length > 0) {
      const lowerText = plain.toLowerCase();
      duplicates.sentences.forEach(ds => {
        const needle = ds.text;
        if (needle.length < 10) return;
        const lowerNeedle = needle.toLowerCase();
        let idx = lowerText.indexOf(lowerNeedle);
        while (idx !== -1) {
          segments.push({
            start: idx,
            end: idx + needle.length,
            priority: 2,
            tag: `<span style="background: rgba(168,85,247,0.18); border-bottom: 2px dotted #a855f7;" title="Duplicate sentence (${ds.count}x)">`,
          });
          idx = lowerText.indexOf(lowerNeedle, idx + needle.length);
        }
      });
    }

    if (segments.length === 0) return escapeHtml(plain).replace(/\n/g, "<br>");

    segments.sort((a, b) => a.start - b.start || a.priority - b.priority);
    const filtered: Seg[] = [];
    let lastEnd = 0;
    for (const seg of segments) {
      if (seg.start >= lastEnd) { filtered.push(seg); lastEnd = seg.end; }
    }

    const parts: string[] = [];
    let cursor = 0;
    for (const seg of filtered) {
      parts.push(escapeHtml(plain.substring(cursor, seg.start)));
      parts.push(seg.tag);
      parts.push(escapeHtml(plain.substring(seg.start, seg.end)));
      parts.push("</span>");
      cursor = seg.end;
    }
    parts.push(escapeHtml(plain.substring(cursor)));
    return parts.join("").replace(/\n/g, "<br>");
  }, [showHighlight, errors, duplicateHighlight, duplicates.sentences]);

  // Same HTML for the preview panel below
  const highlightedHtml = useMemo(() => buildHighlightedHtml(text), [text, buildHighlightedHtml]);

  // ✅ Apply or clear inline highlights in the EDITOR itself (preserves caret when user types)
  const applyInlineHighlights = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const plain = editor.innerText || "";
    if (!plain) return;
    // Save caret to restore
    const caret = getCaretOffset();
    const newHtml = buildHighlightedHtml(plain);
    editor.innerHTML = newHtml;
    // Restore caret
    try { setCaretOffset(Math.min(caret, plain.length)); } catch {}
  }, [buildHighlightedHtml]);

  const clearInlineHighlights = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const plain = editor.innerText || "";
    const caret = getCaretOffset();
    editor.innerText = plain;
    try { setCaretOffset(Math.min(caret, plain.length)); } catch {}
  }, []);

  // Re-apply inline highlights when toggles change or errors change, but NOT while user is actively typing
  useEffect(() => {
    if (!editorRef.current) return;
    if (!showHighlight && !duplicateHighlight) {
      clearInlineHighlights();
      return;
    }
    // Debounced apply
    const t = setTimeout(() => { applyInlineHighlights(); }, 200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showHighlight, duplicateHighlight, errors, duplicates.sentences]);

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
    const plain = text;
    const nt = plain.substring(0, err.offset) + err.replacement + plain.substring(err.offset + err.length);
    if (editorRef.current) editorRef.current.innerText = nt;
    setHtml(editorRef.current?.innerHTML || "");
    setText(nt);
    setErrors(p => p.filter(e => e !== err));
    setTimeout(() => { if (showHighlight || duplicateHighlight) applyInlineHighlights(); }, 50);
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
          <div className="inline-flex px-4 py-1.5 rounded-full glass-btn text-[11px] tracking-widest mb-3 font-bold">✨ v7 · INLINE RED LINES · WORKING GRAMMAR · SELECTION-ONLY COLOR</div>
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
              <label className="flex items-center gap-2 text-xs cursor-pointer"><input type="checkbox" checked={showHighlight} onChange={e => setShowHighlight(e.target.checked)} /> Show Red Wavy (inline in editor)</label>
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
            <button onClick={() => { checkGrammar(); }} className="text-xs px-3 py-1.5 rounded-full bg-gradient-to-r from-violet-600 to-pink-600 text-white font-bold">{checking ? "Checking..." : "✓ Grammar Check"}</button>
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

            {errors.length > 0 && (
              <div className="glass rounded-2xl p-4 mt-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-sm">🔴 {errors.length} Grammar Issues</h3>
                  <button onClick={fixAll} className="text-xs px-2 py-1 bg-green-500 text-white rounded font-bold">Fix All</button>
                </div>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {errors.map((err, i) => (
                    <div key={i} className="flex justify-between items-center p-3 glass rounded-xl text-xs gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/20 font-bold">{err.category}</span>
                          <span className="opacity-60 text-[10px]">"{text.substr(err.offset, Math.min(err.length, 30))}{err.length > 30 ? "..." : ""}"</span>
                        </div>
                        <div>{err.message}</div>
                        {err.replacement && <div className="mt-1">Suggest: <b className="text-green-600 dark:text-green-400">{err.replacement}</b></div>}
                      </div>
                      {err.replacement && <button onClick={() => fixError(err)} className="px-3 py-1.5 bg-black text-white rounded-lg whitespace-nowrap font-bold">Fix</button>}
                    </div>
                  ))}
                </div>
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
                <h3 className="font-bold text-sm mb-2">🔁 Duplicate Detection {duplicateHighlight && <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 ml-2">Highlighted in preview</span>}</h3>
                {duplicates.sentences.length > 0 && (
                  <div className="mb-3">
                    <div className="text-[10px] uppercase opacity-60 font-bold mb-1">Repeated Sentences ({duplicates.sentences.length})</div>
                    {duplicates.sentences.map((d, i) => (
                      <div key={i} className="text-xs p-2 bg-purple-500/15 rounded-lg mb-1"><b>{d.count}x</b> — "{d.text.slice(0, 80)}..."</div>
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
          <p>✨ Word Counter Pro v7 — 100% private, browser-only, no data sent to server</p>
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
Click the big editor box. Type freely. Stats update in real-time. Auto-saves every 400ms.

═══════════════════════════════
STEP 2: RICH TEXT FORMATTING TOOLS
═══════════════════════════════
Second toolbar row has ALL formatting. Use "▼ Show Format Bar" toggle.

▸ B (Bold) — Ctrl+B
▸ I (Italic) — Ctrl+I
▸ U (Underline) — Ctrl+U
▸ S (Strikethrough) — Ctrl+Shift+S
▸ X² / X₂ — Superscript / Subscript
▸ H Dropdown — Heading 1/2/3, Paragraph, Quote, Code Block
▸ • / 1. — Bullet / Numbered lists
▸ ⇤ ⇥ — Outdent / Indent
▸ ⬅ ↔ ➡ ≡ — Alignment
▸ Text Color (A) — APPLIES ONLY TO SELECTED TEXT
▸ H Highlight — APPLIES ONLY TO SELECTED TEXT
▸ Tx — Clear formatting
▸ 🔗 Link — Ctrl+K
▸ ― Horizontal Rule
▸ 😊 Emoji Picker
▸ Aa Case — UPPER/lower/Title/Sentence

HOW TO USE COLOR:
1. Select text with mouse
2. Click A color box or a palette swatch
3. ONLY selected text changes color
4. If nothing selected → warning toast

═══════════════════════════════
STEP 3: UNDO / REDO — Ctrl+Z / Ctrl+Y
═══════════════════════════════

═══════════════════════════════
STEP 4: CUT / COPY / PASTE / DELETE
═══════════════════════════════
▸ Cut / Copy / Paste / Backspace / Delete / Clear buttons

═══════════════════════════════
STEP 5: WORD GOAL — Header में number change करो
═══════════════════════════════

═══════════════════════════════
STEP 6: GRAMMAR CHECK (NEW v7)
═══════════════════════════════
1. Click "✓ Grammar Check" OR just type (auto-checks 1.2s after stop)
2. Red wavy lines appear INLINE in the editor
3. Errors list below shows:
   ▸ Category badge (Spelling / Grammar / Punctuation / Style)
   ▸ Original snippet
   ▸ Message describing the issue
   ▸ Suggested replacement
4. Click "Fix" for individual or "Fix All" for batch

Colors used:
▸ Red underline = Spelling / Grammar
▸ Orange underline = Punctuation
▸ Violet underline = Style

Hover over red line in editor to see tooltip.

═══════════════════════════════
STEP 7: DUPLICATE DETECTION — Settings में ON करो
═══════════════════════════════

═══════════════════════════════
STEP 8: VOICE TYPING — Chrome/Edge required
═══════════════════════════════

═══════════════════════════════
STEP 9: TEXT TO SPEECH — Speaker icon
═══════════════════════════════

═══════════════════════════════
STEP 10: FIND & REPLACE — Ctrl+F
═══════════════════════════════

═══════════════════════════════
STEP 11: POMODORO TIMER — Tomato icon
═══════════════════════════════

═══════════════════════════════
STEP 12: FONT & PAGE CUSTOMIZATION
═══════════════════════════════
▸ Page Size — A4 / Letter / Legal
▸ Font Family — 14 options
▸ Font Size — 10-32px
▸ Line Height — 1.0-2.5

═══════════════════════════════
STEP 13: EXPORT — TXT, HTML, MD, DOC, CSV, PDF
═══════════════════════════════

═══════════════════════════════
STEP 14: FOCUS MODE — Fullscreen icon
═══════════════════════════════

═══════════════════════════════
STEP 15: DARK MODE — Moon icon
═══════════════════════════════

═══════════════════════════════
STEP 16: KEYBOARD SHORTCUTS — Ctrl+/
═══════════════════════════════`
  },
  {
    id: "shortcuts",
    title: "⌨️ All Keyboard Shortcuts — Master Guide",
    content: `Press Ctrl+/ to toggle panel.

═══════════════════════════════
FORMATTING
═══════════════════════════════
Ctrl+B / I / U — Bold / Italic / Underline
Ctrl+Shift+S or X — Strikethrough
Ctrl+K — Insert Link
Ctrl+Shift+7 — Numbered List
Ctrl+Shift+8 — Bullet List
Ctrl+Tab — Increase Indent

═══════════════════════════════
ALIGNMENT
═══════════════════════════════
Ctrl+L — Left
Ctrl+E — Center
Ctrl+R — Right
Ctrl+J — Justify

═══════════════════════════════
EDIT
═══════════════════════════════
Ctrl+Z — Undo
Ctrl+Y or Ctrl+Shift+Z — Redo
Ctrl+C / X / V — Copy / Cut / Paste
Ctrl+A — Select all
Ctrl+F — Find & Replace
Ctrl+S — Force Save
Ctrl+/ — Shortcut Panel

═══════════════════════════════
AUTOCOMPLETE
═══════════════════════════════
Tab — Accept suggestion
Esc — Close popups`
  },
  {
    id: "grammarly",
    title: "🔍 Grammar Check — How It Works (NEW v7)",
    content: `Real Grammarly API is Enterprise-only (paid). We use LanguageTool — 100% free, 30+ languages.

═══════════════════════════════
HOW RED LINES WORK NOW
═══════════════════════════════
1. Type text in editor
2. Wait 1.2s → auto-check triggers
3. OR click "✓ Grammar Check" button
4. Errors render as red wavy underline directly in editor
5. Hover to see tooltip with message + suggestion
6. Errors panel below shows detailed list

═══════════════════════════════
UNDERLINE COLORS
═══════════════════════════════
▸ Red wavy = Spelling / Grammar
▸ Orange wavy = Punctuation
▸ Violet wavy = Style issue

═══════════════════════════════
ERRORS PANEL
═══════════════════════════════
Each error card shows:
▸ Category badge
▸ Original snippet in quotes
▸ Issue description
▸ Suggested fix
▸ "Fix" button

Click "Fix All" to correct everything at once.

═══════════════════════════════
TOGGLE ON/OFF
═══════════════════════════════
Settings → "Show Red Wavy (inline in editor)"

When ON: editor shows inline red lines
When OFF: only errors panel shows

═══════════════════════════════
LIMITATIONS
═══════════════════════════════
▸ LanguageTool free: 20 requests/minute
▸ Wait 1-2 sec for results
▸ Preview updates after each edit`
  },
  {
    id: "color-fix",
    title: "🎨 Selection-Only Color — Fixed",
    content: `Previously color applied to entire document. Now it only applies to selected text.

═══════════════════════════════
HOW TO USE
═══════════════════════════════
1. Select text with mouse
2. Click color box (A) or quick swatch
3. ONLY selection changes color
4. Rest of text untouched

═══════════════════════════════
WHAT IF NOTHING SELECTED?
═══════════════════════════════
Warning toast: "⚠ Pehle text select karo"
Nothing changes.

═══════════════════════════════
TECHNICAL
═══════════════════════════════
▸ Checks LIVE selection first
▸ Falls back to saved character offsets
▸ Builds fresh Range → verifies non-collapsed
▸ Only then applies execCommand("foreColor"/"hiliteColor")

═══════════════════════════════
TROUBLESHOOTING
═══════════════════════════════
Q: Color isn't applying?
A: Make sure text is highlighted blue first.

Q: Palette steals selection?
A: Fixed — swatches use preventDefault.

Q: Multi-paragraph?
A: Yes, works across paragraphs.

Q: Remove color?
A: Select colored text → click "Tx" button.`
  },
  {
    id: "faq-article",
    title: "❓ Complete FAQ — 15 Common Questions",
    content: `Q1: Free?
A: Yes, 100% free forever.

Q2: Text saved on servers?
A: No. Browser-only. Only Grammar Check sends to LanguageTool.

Q3: Chars (with) vs (without)?
A: With = includes spaces (Twitter 280). Without = letters/numbers only.

Q4: Undo/Redo?
A: Ctrl+Z / Ctrl+Y.

Q5: Real Grammarly?
A: Enterprise-only (paid). We use LanguageTool.

Q6: Shortcuts?
A: 20+ shortcuts. Ctrl+/ for panel.

Q7: Reading time accuracy?
A: 200 wpm avg. Speaking 130 wpm.

Q8: Good Flesch score?
A: Web 60-70. Social 70-80. Academic 30-50.

Q9: Voice typing not working?
A: Chrome/Edge + HTTPS + mic permission.

Q10: Ideal keyword density?
A: 1-2%. Above 3% = stuffing.

Q11: Duplicate detection?
A: Enable in Settings.

Q12: Pomodoro?
A: Click tomato icon. 25-min countdown.

Q13: Fonts available?
A: 14 fonts (sans-serif, serif, monospace).

Q14: Export formats?
A: TXT, HTML, MD, DOC, CSV, PDF.

Q15: Max text length?
A: Unlimited (tested 100k+ words).`
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
