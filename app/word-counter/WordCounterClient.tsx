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
];

const PAGE_SIZES: Record<string, { w: number; h: number; label: string }> = {
  A4:     { w: 210, h: 297, label: "A4 (210×297mm)" },
  Letter: { w: 216, h: 279, label: "Letter (216×279mm)" },
  Legal:  { w: 216, h: 356, label: "Legal (216×356mm)" },
};

const FONTS = [
  { name: "Inter", css: "'Inter', sans-serif", mono: false },
  { name: "Merriweather", css: "'Merriweather', serif", mono: false },
  { name: "JetBrains Mono", css: "'JetBrains Mono', monospace", mono: true },
  { name: "Georgia", css: "Georgia, serif", mono: false },
  { name: "Arial", css: "Arial, sans-serif", mono: false },
  { name: "Courier New", css: "'Courier New', monospace", mono: true },
];

const AUTO_CORRECT: Record<string, string> = {
  teh: "the", adn: "and", recieve: "receive", seperate: "separate",
  occured: "occurred", definately: "definitely", wierd: "weird",
  freind: "friend", beleive: "believe", calender: "calendar",
  tommorow: "tomorrow", untill: "until", wich: "which", thier: "their",
  recieved: "received", succesful: "successful", buisness: "business",
  goverment: "government", enviroment: "environment", acheive: "achieve",
  accomodate: "accommodate", arguement: "argument", basicly: "basically",
  becuase: "because", begining: "beginning", comming: "coming",
};

const DICTIONARY = ["about","above","across","action","actually","added","after","again","against","almost","along","already","although","always","among","amount","another","answer","anyone","anything","appear","around","available","back","became","because","become","before","begin","behind","believe","below","better","between","beyond","bring","business","called","cannot","carry","center","certain","change","children","choose","class","clear","close","color","coming","common","company","complete","consider","continue","could","country","course","create","current","decide","describe","develop","different","difficult","direct","during","early","education","effect","either","enough","every","example","experience","family","father","feeling","figure","follow","friend","future","general","given","government","great","ground","group","growth","happen","having","heard","heavy","history","however","hundred","important","include","inside","issue","itself","knowledge","language","large","later","learn","leave","letter","level","light","little","local","machine","major","material","matter","maybe","mean","measure","medical","member","memory","message","method","middle","might","minute","modern","moment","money","month","morning","mother","mountain","music","nation","natural","nature","nearly","necessary","need","never","night","nothing","notice","number","object","occur","offer","often","order","other","paper","particular","people","perhaps","person","picture","place","plan","point","police","policy","possible","power","practice","prepare","present","president","press","pretty","prevent","private","probably","problem","process","produce","product","program","project","property","provide","public","purpose","question","quickly","quiet","rather","reach","ready","really","reason","receive","recent","recognize","record","reduce","reflect","region","relate","remain","remember","remove","report","require","research","resource","respond","result","return","right","roughly","school","science","season","second","section","seem","sense","series","serious","serve","service","several","shall","share","short","should","similar","simple","simply","since","single","situation","small","social","society","some","someone","something","sometimes","space","speak","special","spend","stand","start","state","statement","station","stay","still","story","street","strong","structure","student","study","subject","success","suddenly","suggest","summer","support","system","table","taken","teach","thing","though","thought","thousand","through","throughout","together","tomorrow","tonight","total","toward","town","trade","training","travel","treatment","trouble","truth","understand","until","usually","value","various","victim","video","village","visit","voice","watch","water","weapon","weather","week","weight","welcome","western","whatever","whenever","wherever","whether","which","while","white","whole","whose","window","within","without","woman","wonder","world","worry","would","write","writer","wrong","year","young","yourself"];

const SAMPLE = `Word Counter is a powerful tool that counts words, characters, sentences, and paragraphs in real-time. It helps writers, students, and SEO professionals track their content length and readability.`;

// ✅ SAFE localStorage helpers
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
  const m = Math.floor(s / 60);
  const sec = s % 60;
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h ${m % 60}m`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
};

// ✅ FIX #1: safe offset mapping — escape text but track original → escaped positions
const buildEscapedWithMap = (txt: string) => {
  let html = "";
  const map: number[] = new Array(txt.length);
  for (let i = 0; i < txt.length; i++) {
    map[i] = html.length;
    const ch = txt[i];
    if (ch === "&") html += "&amp;";
    else if (ch === "<") html += "&lt;";
    else if (ch === ">") html += "&gt;";
    else if (ch === '"') html += "&quot;";
    else if (ch === "'") html += "&#39;";
    else html += ch;
  }
  map[txt.length] = html.length;
  return { html, map };
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
  const [autoCorrect, setAutoCorrect] = useState(true);
  const [autoComplete, setAutoComplete] = useState(true);
  const [duplicateHighlight, setDuplicateHighlight] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [goalReached, setGoalReached] = useState(false);
  const [writingTime, setWritingTime] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const editorRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const grammarAbortRef = useRef<AbortController | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTextRef = useRef("");

  // ---------------- LOAD (with safe storage) ----------------
  useEffect(() => {
    const saved = safeGet("lorem_word_text");
    if (saved) {
      setText(saved);
      if (editorRef.current) editorRef.current.innerText = saved;
      lastTextRef.current = saved;
    }
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

  // ---------------- AUTO SAVE ----------------
  useEffect(() => {
    setSaveStatus("saving");
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      safeSet("lorem_word_text", text);
      safeSet("lorem_cfg", JSON.stringify({
        font, fontSize, lineHeight, color, pageSize, goal, dark: isDark, lang,
        autoCorrect, autoComplete,
      }));
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 1200);
    }, 400);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [text, font, fontSize, lineHeight, color, pageSize, goal, isDark, lang, autoCorrect, autoComplete]);

  // ---------------- AUTO LANGUAGE ----------------
  useEffect(() => {
    if (!text.trim()) { setAutoLang("Auto Detect: -"); return; }
    const hasHindi = /[\u0900-\u097F]/.test(text);
    const hasLatin = /[a-zA-Z]/.test(text);
    setAutoLang(hasHindi && !hasLatin ? "Auto Detect: Hindi 🇮🇳"
      : hasHindi ? "Auto Detect: Mixed 🌐" : "Auto Detect: English 🇺🇸");
  }, [text]);

  // ---------------- WRITING TIME ----------------
  useEffect(() => {
    const tick = setInterval(() => {
      if (isActive) setWritingTime(t => t + 1);
    }, 1000);
    return () => clearInterval(tick);
  }, [isActive]);

  // ✅ FIX #10: stable markActive using ref, no re-render spam
  const markActive = useCallback(() => {
    setIsActive(prev => (prev ? prev : true));
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => setIsActive(false), 5000);
  }, []);

  // ---------------- STATS ----------------
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

  // ---------------- DUPLICATES ----------------
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

  // ---------------- GOAL CELEBRATION ----------------
  useEffect(() => {
    if (stats.words >= goal && goal > 0 && !goalReached) {
      setGoalReached(true);
      setToast(`🎉 Goal Reached! ${stats.words}/${goal} words`);
      try {
        const Ctx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new Ctx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.value = 880; gain.gain.value = 0.1;
        osc.start(); osc.stop(ctx.currentTime + 0.15);
        setTimeout(() => {
          const o2 = ctx.createOscillator(); const g2 = ctx.createGain();
          o2.connect(g2); g2.connect(ctx.destination);
          o2.frequency.value = 1320; g2.gain.value = 0.1;
          o2.start(); o2.stop(ctx.currentTime + 0.2);
        }, 150);
      } catch {}
      setTimeout(() => setToast(null), 4000);
    } else if (stats.words < goal * 0.95) {
      setGoalReached(false);
    }
  }, [stats.words, goal, goalReached]);

  // ✅ FIX #1: offsets mapped correctly through escaping
  const applyHighlights = useCallback((errs: ErrorItem[], txt: string) => {
    if (!editorRef.current) return;
    if (!txt) { editorRef.current.innerHTML = ""; return; }
    const { html: baseHtml, map } = buildEscapedWithMap(txt);
    const insertions: { start: number; end: number; tag: string }[] = [];

    [...errs].forEach(err => {
      const start = map[err.offset] ?? 0;
      const end = map[Math.min(err.offset + err.length, txt.length)] ?? baseHtml.length;
      insertions.push({
        start, end,
        tag: `<span style="text-decoration:underline wavy red 2.5px;text-underline-offset:4px;background:rgba(255,0,0,0.08)" title="${escapeHtml(err.message)} → ${escapeHtml(err.replacement)}">`,
      });
    });

    if (duplicateHighlight) {
      duplicates.sentences.forEach(ds => {
        const needle = ds.text.slice(0, 40);
        if (needle.length < 10) return;
        let idx = txt.toLowerCase().indexOf(needle.toLowerCase());
        while (idx !== -1) {
          const s = map[idx];
          const e = map[Math.min(idx + needle.length, txt.length)];
          insertions.push({ start: s, end: e, tag: `<span style="background:rgba(168,85,247,0.15);border-bottom:2px dotted #a855f7" title="Duplicate (${ds.count}x)">` });
          idx = txt.toLowerCase().indexOf(needle.toLowerCase(), idx + needle.length);
        }
      });
    }

    // Apply from end to start to keep offsets valid
    insertions.sort((a, b) => b.start - a.start);
    let result = baseHtml;
    insertions.forEach(({ start, end, tag }) => {
      if (end <= start) return;
      result = result.substring(0, start) + tag + result.substring(start, end) + "</span>" + result.substring(end);
    });
    editorRef.current.innerHTML = result;
  }, [duplicateHighlight, duplicates.sentences]);

  // ---------------- GRAMMAR CHECK ----------------
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
        message: m.message,
        offset: m.offset,
        length: m.length,
        replacement: m.replacements?.[0]?.value || "",
      }));
      setErrors(errs);
      if (showHighlight) applyHighlights(errs, text);
    } catch (e: any) {
      if (e?.name !== "AbortError") { /* silent */ }
    } finally {
      setChecking(false);
    }
  }, [text, lang, showHighlight, applyHighlights]);

  useEffect(() => {
    if (text.length < 15) return;
    const t = setTimeout(() => { checkGrammar(); }, 1500);
    return () => clearTimeout(t);
  }, [text, lang, checkGrammar]);

  // ✅ FIX #8: re-apply highlights when toggles change
  useEffect(() => {
    if (!editorRef.current) return;
    if (showHighlight || duplicateHighlight) {
      applyHighlights(errors, text);
    } else {
      editorRef.current.innerText = text;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showHighlight, duplicateHighlight]);

  // ---------------- CARET HELPERS ----------------
  const getCaretOffset = (): number => {
    if (!editorRef.current) return 0;
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

  // ✅ FIX #6: robust caret restore without TS narrowing issues
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
        if (remaining <= len) {
          range.setStart(n, remaining);
          range.collapse(true);
          found = true;
          return true;
        }
        remaining -= len;
      } else {
        for (let i = 0; i < n.childNodes.length; i++) {
          if (visit(n.childNodes[i])) return true;
        }
      }
      return false;
    };

    visit(root);
    if (!found) {
      range.selectNodeContents(root);
      range.collapse(false);
    }
    const sel = window.getSelection();
    if (sel) { sel.removeAllRanges(); sel.addRange(range); }
  };

  // ✅ FIX #2 & #3: better handleInput
  const handleInput = () => {
    if (!editorRef.current) return;
    markActive();
    let current = editorRef.current.innerText || "";

    // Auto-correct only the word just typed (before caret), no DOM nuke
    if (autoCorrect) {
      const caret = getCaretOffset();
      const beforeCaret = current.slice(0, caret);
      const m = beforeCaret.match(/(\b[a-zA-Z]{2,})\s$/);
      if (m) {
        const word = m[1];
        const lower = word.toLowerCase();
        if (AUTO_CORRECT[lower]) {
          const fixed = word[0] === word[0].toUpperCase()
            ? AUTO_CORRECT[lower][0].toUpperCase() + AUTO_CORRECT[lower].slice(1)
            : AUTO_CORRECT[lower];
          const wordStart = caret - m[0].length;
          const next = current.slice(0, wordStart) + fixed + current.slice(wordStart + word.length);
          const delta = fixed.length - word.length;
          // Update text state only; write to DOM via innerText preserving format via Range API
          const sel = window.getSelection();
          if (sel && sel.rangeCount > 0) {
            const r = sel.getRangeAt(0);
            try {
              // Attempt a targeted delete+insert at word start
              const walker = document.createTreeWalker(editorRef.current, NodeFilter.SHOW_TEXT);
              let offset = 0, startNode: Node | null = null, startOff = 0, endNode: Node | null = null, endOff = 0;
              let n: Node | null;
              while ((n = walker.nextNode())) {
                const len = n.textContent?.length || 0;
                if (startNode === null && offset + len >= wordStart) { startNode = n; startOff = wordStart - offset; }
                if (endNode === null && offset + len >= wordStart + word.length) { endNode = n; endOff = wordStart + word.length - offset; break; }
                offset += len;
              }
              if (startNode && endNode) {
                const del = document.createRange();
                del.setStart(startNode, startOff);
                del.setEnd(endNode, endOff);
                del.deleteContents();
                del.insertNode(document.createTextNode(fixed));
                current = editorRef.current.innerText || "";
                void r; // keep sel
              }
            } catch { /* fallback */ }
          }
          void next; void delta;
        }
      }
    }

    setText(current);
    lastTextRef.current = current;

    // ✅ FIX #3: autocomplete stores replaceLen
    if (autoComplete) {
      const m = current.match(/([a-zA-Z]{2,})$/);
      if (m) {
        const prefix = m[1].toLowerCase();
        const sugg = DICTIONARY.filter(w => w.startsWith(prefix) && w !== prefix).slice(0, 5);
        setSuggestions(sugg.map(w => ({ word: w, at: current.length - m[1].length, replaceLen: m[1].length })));
      } else setSuggestions([]);
    } else setSuggestions([]);
  };

  // ✅ FIX #3: safe insert
  const insertSuggestion = (s: Suggestion) => {
    if (!editorRef.current) return;
    const next = text.slice(0, s.at) + s.word + text.slice(s.at + s.replaceLen);
    editorRef.current.innerText = next;
    setText(next);
    setSuggestions([]);
    setCaretOffset(s.at + s.word.length);
  };

  // ---------------- FORMAT ----------------
  const applyFormat = (cmd: string, val?: string) => {
    editorRef.current?.focus();
    try { document.execCommand("styleWithCSS", false, "true"); } catch {}
    document.execCommand(cmd, false, val);
    if (editorRef.current) setText(editorRef.current.innerText || "");
  };

  const handleCopy = async () => {
    try {
      const sel = window.getSelection();
      const selected = sel && sel.toString().length > 0;
      await navigator.clipboard.writeText(selected ? sel!.toString() : text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const handleCut = async () => {
    const sel = window.getSelection();
    if (sel && sel.toString().length > 0) {
      try { await navigator.clipboard.writeText(sel.toString()); } catch {}
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
    setText(""); setErrors([]); setWritingTime(0);
  };

  const handleCopyStats = async () => {
    const s = `Words: ${stats.words} | Chars(with): ${stats.chars} | Chars(without): ${stats.charsNoSpace} | Sentences: ${stats.sentences} | Paragraphs: ${stats.paras} | Lines: ${stats.lines} | Reading: ${stats.readingTime}m | Speaking: ${stats.speakingTime}m | Writing: ${formatTime(writingTime)} | Flesch: ${stats.flesch} (${stats.level})`;
    try { await navigator.clipboard.writeText(s); setCopiedStats(true); setTimeout(() => setCopiedStats(false), 1500); } catch {}
  };

  const exportTxt = () => { const b = new Blob([text], { type: "text/plain" }); const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = "doc.txt"; a.click(); URL.revokeObjectURL(a.href); };
  const exportDoc = () => { const b = new Blob([`<html><body>${editorRef.current?.innerHTML || text}</body></html>`], { type: "application/msword" }); const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = "doc.doc"; a.click(); URL.revokeObjectURL(a.href); };
  const exportPdf = () => { const w = window.open("", "_blank"); if (w) { w.document.write(`<pre style="white-space:pre-wrap;font-family:${FONTS.find(f => f.name === font)?.css};font-size:${fontSize}px;line-height:${lineHeight};padding:24px">${escapeHtml(text)}</pre>`); w.document.close(); w.print(); } };
  const exportCsv = () => {
    const rows = [["Metric", "Value"],["Words", stats.words],["Chars (with)", stats.chars],["Chars (without)", stats.charsNoSpace],["Sentences", stats.sentences],["Paragraphs", stats.paras],["Lines", stats.lines],["Reading Time (min)", stats.readingTime],["Speaking Time (min)", stats.speakingTime],["Writing Time", formatTime(writingTime)],["Flesch Score", stats.flesch],["Level", stats.level]];
    const csv = rows.map(r => r.join(",")).join("\n");
    const b = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = "stats.csv"; a.click(); URL.revokeObjectURL(a.href);
  };

  // ---------------- VOICE ----------------
  const toggleVoice = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert("❌ Voice typing only in Chrome/Edge over HTTPS."); return; }
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
        if (e.error === "not-allowed") alert("Mic permission blocked.");
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
    if (navigator.share) { try { await navigator.share({ title: "Doc", text: text.slice(0, 200) }); } catch {} }
    else { try { await navigator.clipboard.writeText(text); alert("Copied!"); } catch {} }
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

  const changeCase = (mode: string) => {
    if (!text || !mode) return;
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

  // ✅ FIX #4: Tab key only inside editor
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      const inEditor = editorRef.current && document.activeElement === editorRef.current;

      if (ctrl && e.key.toLowerCase() === "b" && inEditor) { e.preventDefault(); applyFormat("bold"); }
      else if (ctrl && e.key.toLowerCase() === "i" && inEditor) { e.preventDefault(); applyFormat("italic"); }
      else if (ctrl && e.key.toLowerCase() === "u" && inEditor) { e.preventDefault(); applyFormat("underline"); }
      else if (ctrl && e.key.toLowerCase() === "f") { e.preventDefault(); setShowFind(v => !v); }
      else if (ctrl && e.shiftKey && e.key === "7") { e.preventDefault(); applyFormat("insertOrderedList"); }
      else if (ctrl && e.shiftKey && e.key === "8") { e.preventDefault(); applyFormat("insertUnorderedList"); }
      else if (ctrl && e.key.toLowerCase() === "s") {
        e.preventDefault();
        safeSet("lorem_word_text", text);
        setSaveStatus("saved"); setTimeout(() => setSaveStatus("idle"), 1000);
      } else if (e.key === "Tab" && inEditor && suggestions.length > 0) {
        e.preventDefault(); insertSuggestion(suggestions[0]);
      } else if (e.key === "Escape") {
        setSuggestions([]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [text, suggestions]);

  const loadSample = () => {
    setText(SAMPLE);
    if (editorRef.current) editorRef.current.innerText = SAMPLE;
  };

  const currentFont = FONTS.find(f => f.name === font) || FONTS[0];
  const page = PAGE_SIZES[pageSize] || PAGE_SIZES.A4;

  if (isFocus) {
    return (
      <div className={`min-h-screen ${isDark ? "bg-black text-white" : "bg-white text-black"} p-8`}>
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between mb-6">
            <button onClick={() => setIsFocus(false)} className="px-4 py-2 bg-black text-white rounded-xl text-sm dark:bg-white dark:text-black">Exit Focus</button>
            <span className="text-sm opacity-60">{stats.words} words • {formatTime(writingTime)} • {autoLang}</span>
          </div>
          <div ref={editorRef} contentEditable suppressContentEditableWarning onInput={handleInput}
            className="w-full min-h-[80vh] outline-none"
            style={{ fontFamily: currentFont.css, fontSize: `${fontSize}px`, lineHeight, color: isDark ? "#fff" : color }} />
        </div>
      </div>
    );
  }

  return (
    <div className={`${isDark ? "bg-[#0a0a0a] text-white" : "bg-gradient-to-br from-[#f8fafc] via-[#eef2ff] to-[#f5f3ff] text-gray-900"} min-h-screen`}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=Merriweather:wght@400;700&family=JetBrains+Mono:wght@400;700&display=swap');
        .glass{backdrop-filter:blur(16px);background:${isDark ? "rgba(30,30,30,0.7)" : "rgba(255,255,255,0.75)"};border:1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.6)"}}
        [contenteditable]:focus{outline:none}`}</style>

      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-6 py-3 rounded-2xl shadow-2xl font-bold animate-pulse">
          {toast}
        </div>
      )}

      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <div className="text-center mb-6">
          <div className="inline-flex px-3 py-1 rounded-full bg-black text-white text-[11px] tracking-widest mb-3">
            ✨ AUTO-SAVE · AUTO-CORRECT · AUTOCOMPLETE · DUPLICATES
          </div>
          <h1 className="text-4xl md:text-5xl font-black">Word Counter Pro</h1>
          <div className="flex justify-center gap-2 mt-3 flex-wrap items-center">
            <select value={lang} onChange={e => setLang(e.target.value)} className="h-9 rounded-xl border px-3 text-sm bg-white text-black font-bold shadow">
              {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.flag} {l.label}</option>)}
            </select>
            <span className="text-xs px-3 py-1 rounded-full bg-violet-600 text-white font-bold">{autoLang}</span>
            <span className="text-sm opacity-60">{stats.words}/{goal} • {progress}%</span>
            <span className={`text-xs px-2 py-1 rounded-full ${saveStatus === "saved" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
              {saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "Saved ✓" : "Auto"}
            </span>
            <span className={`text-xs px-2 py-1 rounded-full ${isActive ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"}`}>
              ⏱ {formatTime(writingTime)}
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
            <button onClick={() => applyFormat("bold")} className="w-9 h-9 rounded-lg bg-white text-black font-black border">B</button>
            <button onClick={() => applyFormat("italic")} className="w-9 h-9 rounded-lg bg-white text-black italic border">I</button>
            <button onClick={() => applyFormat("underline")} className="w-9 h-9 rounded-lg bg-white text-black underline border">U</button>
            <button onClick={() => applyFormat("strikeThrough")} className="w-9 h-9 rounded-lg bg-white text-black border line-through">S</button>
            <div className="w-px h-6 bg-gray-200 mx-1" />
            <button onClick={() => applyFormat("insertUnorderedList")} className="h-9 px-2.5 rounded-lg bg-white text-black text-xs border">• List</button>
            <button onClick={() => applyFormat("insertOrderedList")} className="h-9 px-2.5 rounded-lg bg-white text-black text-xs border">1. List</button>
            <div className="w-px h-6 bg-gray-200 mx-1" />
            <button onClick={() => applyFormat("undo")} className="h-9 px-2.5 rounded-lg bg-white text-black text-xs border">↶</button>
            <button onClick={() => applyFormat("redo")} className="h-9 px-2.5 rounded-lg bg-white text-black text-xs border">↷</button>
            <div className="w-px h-6 bg-gray-200 mx-1" />
            <button onClick={handleCut} className="h-9 px-2.5 rounded-lg bg-white text-black text-xs border">✂</button>
            <button onClick={handleCopy} className="h-9 px-2.5 rounded-lg bg-white text-black text-xs border">{copied ? "✓" : "⎙"}</button>
            <button onClick={handlePaste} className="h-9 px-2.5 rounded-lg bg-white text-black text-xs border">⎘</button>
            <button onClick={handleDelete} className="h-9 px-2.5 rounded-lg bg-red-50 text-red-600 text-xs border">Del</button>
            <button onClick={handleClear} className="h-9 px-2.5 rounded-lg bg-red-50 text-red-600 text-xs border">Clear</button>
            <select onChange={e => changeCase(e.target.value)} className="h-9 rounded-lg bg-white text-black px-2 text-sm border">
              <option value="">Case ▾</option>
              <option value="upper">UPPER</option>
              <option value="lower">lower</option>
              <option value="title">Title</option>
              <option value="sentence">Sentence</option>
            </select>
          </div>
          <div className="flex gap-1.5 flex-wrap items-center">
            <button onClick={() => setShowFind(v => !v)} className="h-9 px-3 rounded-xl bg-white text-black text-xs border">🔍 Find</button>
            <button onClick={() => setShowSettings(v => !v)} className="h-9 px-3 rounded-xl bg-white text-black text-xs border">⚙ Settings</button>
            <button onClick={toggleVoice} type="button"
              className={`h-10 px-5 rounded-xl text-xs font-black border-2 shadow cursor-pointer ${isListening ? "bg-red-600 text-white border-red-600 animate-pulse" : "bg-black text-white border-black hover:bg-gray-800"}`}>
              {isListening ? "■ STOP" : "🎤 VOICE"}
            </button>
            <button onClick={toggleSpeak} className={`h-9 px-3 rounded-xl text-xs border ${isSpeaking ? "bg-red-600 text-white" : "bg-white text-black"}`}>{isSpeaking ? "■" : "🔊"}</button>
            <button onClick={share} className="h-9 px-3 rounded-xl bg-white text-black text-xs border">↗</button>
            <button onClick={() => setIsFocus(true)} className="h-9 px-3 rounded-xl bg-black text-white text-xs">⛶ Focus</button>
            <button onClick={() => setIsDark(!isDark)} className="h-9 px-3 rounded-xl bg-black text-white text-xs">{isDark ? "☀" : "🌙"}</button>
          </div>
        </div>

        {/* Settings */}
        {showSettings && (
          <div className="glass rounded-2xl p-4 mb-3 grid md:grid-cols-4 gap-3">
            <div>
              <label className="text-[10px] uppercase tracking-wider opacity-60 font-bold">Page Size</label>
              <select value={pageSize} onChange={e => setPageSize(e.target.value)} className="w-full h-9 rounded-lg bg-white text-black px-2 text-sm border mt-1">
                {Object.entries(PAGE_SIZES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider opacity-60 font-bold">Font</label>
              <select value={font} onChange={e => setFont(e.target.value)} className="w-full h-9 rounded-lg bg-white text-black px-2 text-sm border mt-1">
                {FONTS.map(f => <option key={f.name} value={f.name}>{f.name}{f.mono ? " (mono)" : ""}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider opacity-60 font-bold">Size: {fontSize}px</label>
              <input type="range" min={10} max={32} value={fontSize} onChange={e => setFontSize(parseInt(e.target.value))} className="w-full mt-2" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider opacity-60 font-bold">Line Height: {lineHeight}</label>
              <input type="range" min={1} max={2.5} step={0.1} value={lineHeight} onChange={e => setLineHeight(parseFloat(e.target.value))} className="w-full mt-2" />
            </div>
            <div className="md:col-span-4 flex flex-wrap gap-4 pt-2 border-t border-gray-300/50">
              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <input type="checkbox" checked={autoCorrect} onChange={e => setAutoCorrect(e.target.checked)} /> Auto Correct
              </label>
              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <input type="checkbox" checked={autoComplete} onChange={e => setAutoComplete(e.target.checked)} /> Auto Complete
              </label>
              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <input type="checkbox" checked={showHighlight} onChange={e => setShowHighlight(e.target.checked)} /> Grammar Highlight
              </label>
              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <input type="checkbox" checked={duplicateHighlight} onChange={e => setDuplicateHighlight(e.target.checked)} /> Duplicate Highlight
              </label>
              <span className="text-xs opacity-60 ml-auto">Page: {page.w}×{page.h}mm • {currentFont.mono ? "Monospace" : "Proportional"}</span>
            </div>
          </div>
        )}

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
            <div className="glass rounded-[24px] shadow p-2 relative">
              <div className="px-4 py-1.5 text-[10px] opacity-60 flex justify-between">
                <span>📄 {page.label} • {fontSize}px • LH {lineHeight} • {currentFont.name}</span>
                <span>{currentFont.mono ? "🔤 Monospace" : "🔡 Proportional"}</span>
              </div>
              <div ref={editorRef} contentEditable suppressContentEditableWarning onInput={handleInput}
                spellCheck={true}
                className={`w-full min-h-[460px] p-6 rounded-[16px] ${isDark ? "bg-black/50 text-white" : "bg-white/90"} outline-none`}
                style={{ fontFamily: currentFont.css, fontSize: `${fontSize}px`, lineHeight, color: isDark ? "#f3f4f6" : color }} />

              {suggestions.length > 0 && (
                <div className="absolute bottom-16 left-8 bg-white border rounded-xl shadow-2xl text-black text-sm overflow-hidden z-30">
                  {suggestions.map((s, i) => (
                    <button key={s.word} onClick={() => insertSuggestion(s)}
                      className={`block w-full text-left px-4 py-1.5 hover:bg-violet-100 ${i === 0 ? "bg-violet-50 font-bold" : ""}`}>
                      {s.word} {i === 0 && <span className="text-[10px] opacity-50 ml-2">Tab</span>}
                    </button>
                  ))}
                </div>
              )}

              <div className="px-4 py-2 text-[11px] opacity-50 flex justify-between">
                <span>{autoLang}</span>
                <span>{isActive ? "🟢 Active" : "⚪ Idle"} • ⏱ {formatTime(writingTime)}</span>
              </div>
            </div>

            {errors.length > 0 && (
              <div className="glass rounded-2xl p-4 mt-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-sm">🔴 {errors.length} Grammar Errors</h3>
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

            {(duplicates.words.length > 0 || duplicates.sentences.length > 0) && (
              <div className="glass rounded-2xl p-4 mt-4">
                <h3 className="font-bold text-sm mb-2">🔁 Duplicate Detection</h3>
                {duplicates.sentences.length > 0 && (
                  <div className="mb-3">
                    <div className="text-[10px] uppercase opacity-60 font-bold mb-1">Repeated Sentences ({duplicates.sentences.length})</div>
                    {duplicates.sentences.map((d, i) => (
                      <div key={i} className="text-xs p-2 bg-purple-50 text-purple-900 rounded-lg mb-1">
                        <b>{d.count}x</b> — "{d.text}..."
                      </div>
                    ))}
                  </div>
                )}
                {duplicates.words.length > 0 && (
                  <div>
                    <div className="text-[10px] uppercase opacity-60 font-bold mb-1">Repeated Words</div>
                    <div className="flex flex-wrap gap-1">
                      {duplicates.words.slice(0, 12).map(([w, c]) => (
                        <span key={w} className="text-[11px] px-2 py-1 bg-orange-100 text-orange-800 rounded-full font-bold">
                          {w} × {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

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
              <div className="text-3xl font-black text-center">{progress}%</div>
              <div className="text-xs text-center opacity-60 mt-1">{stats.words} / {goal} words</div>
              {goalReached && <div className="text-center text-green-600 text-xs font-bold mt-2">🎉 Goal Achieved!</div>}
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

        <div className="glass rounded-2xl p-4 mt-6">
          <h3 className="font-bold text-xs uppercase mb-3">📱 Social Media Limits</h3>
          <div className="grid grid-cols-3 gap-3">
            {[{ name: "Twitter", limit: 280 }, { name: "Instagram", limit: 2200 }, { name: "LinkedIn", limit: 3000 }].map(s => {
              const left = s.limit - stats.chars;
              return (
                <div key={s.name} className="bg-white text-black rounded-xl p-3 text-center border">
                  <div className="text-[10px] opacity-60">{s.name}</div>
                  <div className={`text-sm font-black ${left < 0 ? "text-red-500" : left < s.limit * 0.1 ? "text-orange-500" : "text-green-600"}`}>
                    {left < 0 ? `${Math.abs(left)} over` : `${left} left`}
                  </div>
                </div>
              );
            })}
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
  { id: "what", title: "What is Word Counter? Ultimate Guide", content: `Word Counter counts words, chars with/without spaces, sentences, paragraphs, lines in real-time.` },
  { id: "density", title: "Chars (with) vs Chars (without) & Keyword Density", content: `Chars (with spaces): "Hello World" = 11 chars.\n\nChars (without spaces): "Hello World" = 10 chars.\n\nDensity: 1000 words with keyword 15 times = 1.5%.` },
  { id: "new", title: "New Features: Auto-Correct, Page Size, Writing Time", content: `Auto-Correct: Common typos fixed as you type.\n\nAuto-Complete: Press Tab to accept.\n\nPage Size: A4 / Letter / Legal.\n\nWriting Time: Tracks active typing time.` },
];

function Stat({ label, value, tip }: { label: string; value: any; tip?: string }) {
  return (
    <div className="glass rounded-2xl p-4 shadow-sm" title={tip}>
      <div className="text-[10px] uppercase tracking-widest opacity-60">{label}</div>
      <div className="text-lg font-black mt-1">{value}</div>
      {tip && <div className="text-[9px] opacity-40 mt-1">{tip}</div>}
    </div>
  );
}
