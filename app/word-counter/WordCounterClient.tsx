'use client';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

/* ==================================================================
   ADVANCED WORD COUNTER & WRITING ASSISTANT
   Next.js client component — runs fully in the browser.
   ================================================================== */

const BRAND = 'WordCraft';

/* ------------------------------------------------------------------
   GLOBAL STYLES
   ------------------------------------------------------------------ */

const GLOBAL_CSS = `
*,*::before,*::after{box-sizing:border-box}
html{scroll-behavior:smooth;-webkit-text-size-adjust:100%}
body{margin:0;font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif}

html[data-theme="dark"]{
  color-scheme:dark;
  --bg-image:
    radial-gradient(1200px 820px at 8% -12%, rgba(88,60,220,.55) 0%, transparent 62%),
    radial-gradient(1000px 720px at 96% -6%, rgba(14,110,150,.48) 0%, transparent 58%),
    radial-gradient(900px 700px at 50% 110%, rgba(190,60,140,.28) 0%, transparent 60%),
    linear-gradient(180deg,#050816 0%,#0a0f26 55%,#05070f 100%);
  --surface:rgba(255,255,255,.055);
  --surface-2:rgba(255,255,255,.035);
  --surface-strong:rgba(255,255,255,.10);
  --border:rgba(255,255,255,.115);
  --border-strong:rgba(255,255,255,.22);
  --text:#eef1ff;
  --text-soft:#cdd4ef;
  --muted:#98a3c9;
  --accent:#8b7bff;
  --accent-2:#22d3ee;
  --accent-3:#f472b6;
  --good:#34d399;
  --warn:#fbbf24;
  --bad:#fb7185;
  --shadow:0 18px 50px rgba(0,0,0,.45);
  --shadow-sm:0 8px 24px rgba(0,0,0,.32);
}
html[data-theme="light"]{
  color-scheme:light;
  --bg-image:
    radial-gradient(1200px 820px at 8% -12%, rgba(167,150,255,.60) 0%, transparent 62%),
    radial-gradient(1000px 720px at 96% -6%, rgba(125,232,255,.62) 0%, transparent 58%),
    radial-gradient(900px 700px at 50% 110%, rgba(255,175,220,.42) 0%, transparent 60%),
    linear-gradient(180deg,#f9fbff 0%,#eef2ff 55%,#f7f8ff 100%);
  --surface:rgba(255,255,255,.72);
  --surface-2:rgba(255,255,255,.55);
  --surface-strong:rgba(255,255,255,.92);
  --border:rgba(15,23,42,.10);
  --border-strong:rgba(15,23,42,.20);
  --text:#0e142b;
  --text-soft:#26304d;
  --muted:#5b678a;
  --accent:#5b4bdb;
  --accent-2:#0891b2;
  --accent-3:#db2777;
  --good:#059669;
  --warn:#b45309;
  --bad:#dc2626;
  --shadow:0 18px 44px rgba(30,41,90,.14);
  --shadow-sm:0 8px 22px rgba(30,41,90,.10);
}

.app-bg{background:var(--bg-image);background-attachment:fixed}

::selection{background:rgba(139,123,255,.35)}

.scroll-thin::-webkit-scrollbar,
textarea::-webkit-scrollbar{width:10px;height:10px}
.scroll-thin::-webkit-scrollbar-track,
textarea::-webkit-scrollbar-track{background:transparent}
.scroll-thin::-webkit-scrollbar-thumb,
textarea::-webkit-scrollbar-thumb{background:rgba(140,150,190,.35);border-radius:999px;border:2px solid transparent;background-clip:content-box}
.scroll-thin::-webkit-scrollbar-thumb:hover,
textarea::-webkit-scrollbar-thumb:hover{background:rgba(140,150,190,.6);background-clip:content-box}

:focus-visible{outline:2px solid var(--accent);outline-offset:2px;border-radius:6px}

@keyframes awc-fade-up{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
.anim-fade-up{animation:awc-fade-up .55s cubic-bezier(.22,1,.36,1) both}

@keyframes awc-pop{0%{transform:scale(.86);opacity:0}60%{transform:scale(1.04)}100%{transform:scale(1);opacity:1}}
.anim-pop{animation:awc-pop .42s cubic-bezier(.22,1,.36,1) both}

@keyframes awc-shine{0%{background-position:0% 50%}100%{background-position:200% 50%}}
.gradient-text{
  background:linear-gradient(90deg,var(--accent),var(--accent-2),var(--accent-3),var(--accent));
  background-size:200% auto;-webkit-background-clip:text;background-clip:text;color:transparent;
  animation:awc-shine 9s linear infinite;
}

@keyframes awc-glow{0%,100%{opacity:.45}50%{opacity:.85}}
.glow{animation:awc-glow 5s ease-in-out infinite}

@keyframes awc-slide-down{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:none}}
.anim-slide-down{animation:awc-slide-down .28s ease both}

@keyframes awc-toast-in{from{opacity:0;transform:translateY(14px) scale(.97)}to{opacity:1;transform:none}}
.anim-toast{animation:awc-toast-in .3s cubic-bezier(.22,1,.36,1) both}

@keyframes awc-celebrate{0%{transform:scale(.7) rotate(-8deg);opacity:0}50%{transform:scale(1.15) rotate(4deg);opacity:1}100%{transform:scale(1) rotate(0);opacity:1}}
.anim-celebrate{animation:awc-celebrate .6s cubic-bezier(.22,1,.36,1) both}

.awc-progress-fill{transition:width .7s cubic-bezier(.22,1,.36,1) both}

@media (prefers-reduced-motion: reduce){
  *,*::before,*::after{
    animation-duration:.001ms!important;
    animation-iteration-count:1!important;
    transition-duration:.001ms!important;
    scroll-behavior:auto!important;
  }
}
`;

/* ------------------------------------------------------------------
   TYPES
   ------------------------------------------------------------------ */

type ThemeMode = 'light' | 'dark' | 'system';
type ToastKind = 'success' | 'error' | 'info';
interface ToastItem { id: number; message: string; kind: ToastKind }
interface WordFreq { word: string; count: number; pct: number }

interface BasicStats {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  sentences: number;
  paragraphs: number;
  lines: number;
  headings: number;
  uniqueWords: number;
  avgWordLength: number;
  avgSentenceLength: number;
  avgParagraphLength: number;
  longestWord: string;
  shortestWord: string;
  wordList: string[];
  sentenceList: string[];
  paragraphList: string[];
}

interface DeepStats {
  syllables: number;
  syllablesPerWord: number;
  fleschReadingEase: number;
  fleschKincaid: number;
  complexWordPct: number;
  wordCounts: Map<string, number>;
  duplicateSentences: string[];
  longSentences: string[];
  longParagraphs: number;
  doubleSpaces: number;
  fillerHits: { word: string; count: number }[];
  passiveHits: number;
  capitalizationIssues: number;
  punctuationRuns: number;
  repeatedSentencesCount: number;
}

/* ------------------------------------------------------------------
   TEXT ANALYSIS ENGINE
   ------------------------------------------------------------------ */

const WORD_RE = /[\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*/gu;
const HAS_WORD_RE = /[\p{L}\p{N}]/u;

const STOPWORDS = new Set<string>([
  'a','about','above','after','again','against','all','am','an','and','any','are','as','at',
  'be','because','been','before','being','below','between','both','but','by',
  'can','cannot','could','did','do','does','doing','down','during',
  'each','few','for','from','further','had','has','have','having','he','her','here','hers',
  'him','his','how','i','if','in','into','is','it','its','itself',
  'just','me','more','most','my','no','nor','not','now','of','off','on','once','only','or',
  'other','our','out','over','own','same','she','should','so','some','such',
  'than','that','the','their','theirs','them','then','there','these','they','this','those',
  'through','to','too','under','until','up','very','was','we','were','what','when','where',
  'which','while','who','whom','why','will','with','would','you','your','yours','yourself',
  'also','been','get','got','much','many','may','might','must','shall','us','let','make','made',
]);

const FILLER_WORDS = [
  'really','very','actually','basically','literally','quite','rather','somewhat','just',
  'simply','totally','definitely','certainly','clearly','obviously','honestly','essentially',
  'practically','virtually','kind','sort','like','anyway','however','therefore','moreover',
  'furthermore','nevertheless','arguably',
];

function extractWords(text: string): string[] {
  if (!text) return [];
  const m = text.match(WORD_RE);
  return m ?? [];
}

function extractSentences(text: string): string[] {
  if (!text || !text.trim()) return [];
  const flat = text.replace(/\s+/g, ' ').trim();
  const parts = flat.match(/[^.!?…]+[.!?…]*/g) ?? [];
  return parts.map((s) => s.trim()).filter((s) => s.length > 0 && HAS_WORD_RE.test(s));
}

function extractParagraphs(text: string): string[] {
  if (!text || !text.trim()) return [];
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0 && HAS_WORD_RE.test(p));
}

function extractLines(text: string): string[] {
  if (!text) return [];
  return text.split(/\r\n|\r|\n/);
}

function countHeadings(text: string): number {
  if (!text) return 0;
  const matches = text.match(/^\s{0,3}#{1,6}\s+\S.*$/gm);
  return matches ? matches.length : 0;
}

function countSyllables(word: string): number {
  let w = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!w) return 0;
  if (w.length <= 3) return 1;
  w = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  w = w.replace(/^y/, '');
  const groups = w.match(/[aeiouy]{1,2}/g);
  return groups ? groups.length : 1;
}

function computeBasic(text: string): BasicStats {
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, '').length;
  const lines = text.length === 0 ? 0 : extractLines(text).length;

  const wordList = extractWords(text);
  const words = wordList.length;
  const sentenceList = extractSentences(text);
  const sentences = sentenceList.length;
  const paragraphList = extractParagraphs(text);
  const paragraphs = paragraphList.length;
  const headings = countHeadings(text);

  const lower = wordList.map((w) => w.toLowerCase());
  const uniqueSet = new Set(lower);
  const uniqueWords = uniqueSet.size;

  let letterTotal = 0;
  let longestWord = '';
  let shortestWord = '';
  for (const w of uniqueSet) {
    if (w.length > longestWord.length) longestWord = w;
    if (shortestWord === '' || w.length < shortestWord.length) shortestWord = w;
  }
  for (const w of lower) letterTotal += w.length;

  const avgWordLength = words ? letterTotal / words : 0;
  const avgSentenceLength = sentences ? words / sentences : 0;
  const avgParagraphLength = paragraphs ? words / paragraphs : 0;

  return {
    characters, charactersNoSpaces, words, sentences, paragraphs, lines,
    headings, uniqueWords, avgWordLength, avgSentenceLength, avgParagraphLength,
    longestWord, shortestWord, wordList, sentenceList, paragraphList,
  };
}

function normalizeSentence(s: string): string {
  return s.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, '').replace(/\s+/g, ' ').trim();
}

function computeDeep(text: string, basic: BasicStats): DeepStats {
  const { wordList, sentenceList, paragraphList, words, sentences } = basic;

  let syllables = 0;
  let complexWords = 0;
  const wordCounts = new Map<string, number>();

  for (const raw of wordList) {
    const w = raw.toLowerCase();
    const syl = countSyllables(w);
    syllables += syl;
    if (syl >= 3) complexWords += 1;
    wordCounts.set(w, (wordCounts.get(w) ?? 0) + 1);
  }

  const syllablesPerWord = words ? syllables / words : 0;
  const wordsPerSentence = sentences ? words / sentences : 0;

  let fleschReadingEase = 0;
  let fleschKincaid = 0;
  if (words > 0 && sentences > 0) {
    fleschReadingEase = 206.835 - 1.015 * wordsPerSentence - 84.6 * syllablesPerWord;
    fleschKincaid = 0.39 * wordsPerSentence + 11.8 * syllablesPerWord - 15.59;
    fleschReadingEase = Math.max(0, Math.min(100, fleschReadingEase));
    fleschKincaid = Math.max(0, Math.min(20, fleschKincaid));
  }

  const complexWordPct = words ? (complexWords / words) * 100 : 0;

  const seen = new Map<string, number>();
  for (const s of sentenceList) {
    const key = normalizeSentence(s);
    if (key.split(' ').length < 4) continue;
    seen.set(key, (seen.get(key) ?? 0) + 1);
  }
  const duplicateSentences: string[] = [];
  seen.forEach((count, key) => { if (count > 1) duplicateSentences.push(key); });

  const longSentences = sentenceList.filter((s) => extractWords(s).length > 25);
  const longParagraphs = paragraphList.filter((p) => extractWords(p).length > 150).length;
  const doubleSpaces = (text.match(/ {2,}/g) ?? []).length;
  const punctuationRuns = (text.match(/[!?.,;:]{2,}/g) ?? []).length;

  const fillerHits: { word: string; count: number }[] = [];
  for (const f of FILLER_WORDS) {
    const c = wordCounts.get(f) ?? 0;
    if (c > 0) fillerHits.push({ word: f, count: c });
  }
  fillerHits.sort((a, b) => b.count - a.count);

  const passiveMatches =
    text.match(/\b(?:is|are|was|were|be|been|being)\s+(?:\w+ly\s+)?\w+(?:ed|en)\b/gi) ?? [];
  const passiveHits = passiveMatches.length;

  let capitalizationIssues = 0;
  for (const s of sentenceList) {
    const first = s.match(/[\p{L}]/u);
    if (!first) continue;
    const idx = s.indexOf(first[0]);
    const ch = s[idx];
    if (ch && ch === ch.toLowerCase() && ch !== ch.toUpperCase()) {
      capitalizationIssues += 1;
    }
  }

  return {
    syllables, syllablesPerWord, fleschReadingEase, fleschKincaid,
    complexWordPct, wordCounts, duplicateSentences, longSentences,
    longParagraphs, doubleSpaces, fillerHits, passiveHits,
    capitalizationIssues, punctuationRuns,
    repeatedSentencesCount: duplicateSentences.length,
  };
}

interface FreqOptions {
  ignoreCommon: boolean;
  minLength: number;
  includeNumbers: boolean;
}

function buildFrequency(
  wordCounts: Map<string, number>,
  totalWords: number,
  opts: FreqOptions,
): WordFreq[] {
  const out: WordFreq[] = [];
  wordCounts.forEach((count, word) => {
    if (!opts.includeNumbers && /^\d+$/.test(word)) return;
    if (word.length < opts.minLength) return;
    if (opts.ignoreCommon && STOPWORDS.has(word)) return;
    out.push({ word, count, pct: totalWords ? (count / totalWords) * 100 : 0 });
  });
  out.sort((a, b) => b.count - a.count || a.word.localeCompare(b.word));
  return out;
}

function findRepeatedWords(
  wordCounts: Map<string, number>,
  minCount = 3,
): { word: string; count: number }[] {
  const out: { word: string; count: number }[] = [];
  wordCounts.forEach((count, word) => {
    if (count >= minCount && word.length >= 4 && !STOPWORDS.has(word)) {
      out.push({ word, count });
    }
  });
  out.sort((a, b) => b.count - a.count);
  return out;
}

function readabilityBand(score: number): {
  label: string;
  tone: 'good' | 'warn' | 'bad';
  description: string;
} {
  if (score >= 90) return { label: 'Very Easy', tone: 'good', description: 'Very easy to read — roughly the level of a 5th-grade text. Ideal for broad, general audiences.' };
  if (score >= 80) return { label: 'Easy', tone: 'good', description: 'Easy to read — conversational English. Works well for blogs, newsletters and web copy.' };
  if (score >= 70) return { label: 'Fairly Easy', tone: 'good', description: 'Fairly easy to read. A comfortable level for most online readers.' };
  if (score >= 60) return { label: 'Standard', tone: 'warn', description: 'Standard plain-English level. Suitable for most articles and business writing.' };
  if (score >= 50) return { label: 'Fairly Difficult', tone: 'warn', description: 'Fairly difficult. Readers may need to slow down — consider shorter sentences.' };
  if (score >= 30) return { label: 'Difficult', tone: 'bad', description: 'Difficult to read. Best suited to academic or highly technical audiences.' };
  return { label: 'Very Difficult', tone: 'bad', description: 'Very difficult to read. Consider simplifying vocabulary and sentence structure.' };
}

/* ------------------------------------------------------------------
   UTILITIES
   ------------------------------------------------------------------ */

let _notify: ((message: string, kind?: ToastKind) => void) | null = null;
function notify(message: string, kind: ToastKind = 'success') {
  if (_notify) _notify(message, kind);
}

function safeGet(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try { return window.localStorage.getItem(key); } catch { return null; }
}

function safeSet(key: string, value: string): boolean {
  if (typeof window === 'undefined') return false;
  try { window.localStorage.setItem(key, value); return true; } catch { return false; }
}

function safeRemove(key: string): void {
  if (typeof window === 'undefined') return;
  try { window.localStorage.removeItem(key); } catch { /* ignore */ }
}

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.top = '-1000px';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch { return false; }
}

function downloadFile(filename: string, content: string, mime: string): boolean {
  try {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.setTimeout(() => URL.revokeObjectURL(url), 1500);
    return true;
  } catch { return false; }
}

function formatSeconds(totalSeconds: number): string {
  if (!isFinite(totalSeconds) || totalSeconds <= 0) return '0 sec';
  const total = Math.round(totalSeconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h} hr ${m} min`;
  if (m > 0) return `${m} min ${s} sec`;
  return `${s} sec`;
}

function formatNumber(n: number, decimals = 0): string {
  if (!isFinite(n)) return '0';
  return n.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function useDebounced<T>(value: T, delay = 220): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/* ------------------------------------------------------------------
   ICONS
   ------------------------------------------------------------------ */

interface IconProps { className?: string }

const IconBase: React.FC<IconProps & { children: React.ReactNode }> = ({
  children,
  className = 'w-5 h-5',
}) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}
    strokeLinecap="round" strokeLinejoin="round" className={className}
    aria-hidden="true" focusable="false">
    {children}
  </svg>
);

const IconText = (p: IconProps) => (<IconBase {...p}><path d="M4 6h16M4 12h16M4 18h10" /></IconBase>);
const IconType = (p: IconProps) => (<IconBase {...p}><path d="M4 7V4h16v3" /><path d="M9 20h6" /><path d="M12 4v16" /></IconBase>);
const IconHash = (p: IconProps) => (<IconBase {...p}><path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18" /></IconBase>);
const IconLayers = (p: IconProps) => (<IconBase {...p}><path d="m12 2 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5" /><path d="m3 17 9 5 9-5" /></IconBase>);
const IconHeading = (p: IconProps) => (<IconBase {...p}><path d="M6 4v16M18 4v16M6 12h12" /></IconBase>);
const IconStar = (p: IconProps) => (<IconBase {...p}><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3Z" /></IconBase>);
const IconClock = (p: IconProps) => (<IconBase {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></IconBase>);
const IconMic = (p: IconProps) => (<IconBase {...p}><rect x="9" y="2" width="6" height="12" rx="3" /><path d="M5 10a7 7 0 0 0 14 0" /><path d="M12 19v3" /></IconBase>);
const IconTarget = (p: IconProps) => (<IconBase {...p}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.4" /></IconBase>);
const IconKey = (p: IconProps) => (<IconBase {...p}><circle cx="7.5" cy="15.5" r="5.5" /><path d="m21 2-9.6 9.6" /><path d="m15.5 7.5 3 3L22 7l-3-3" /></IconBase>);
const IconBook = (p: IconProps) => (<IconBase {...p}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" /></IconBase>);
const IconCheck = (p: IconProps) => (<IconBase {...p}><path d="M20 6 9 17l-5-5" /></IconBase>);
const IconAlert = (p: IconProps) => (<IconBase {...p}><path d="M12 9v4M12 17h.01" /><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" /></IconBase>);
const IconChart = (p: IconProps) => (<IconBase {...p}><path d="M3 3v18h18" /><path d="M7 16v-5M12 16V8M17 16v-3" /></IconBase>);
const IconShield = (p: IconProps) => (<IconBase {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /></IconBase>);
const IconLock = (p: IconProps) => (<IconBase {...p}><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></IconBase>);
const IconZap = (p: IconProps) => (<IconBase {...p}><path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z" /></IconBase>);
const IconSun = (p: IconProps) => (<IconBase {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></IconBase>);
const IconMoon = (p: IconProps) => (<IconBase {...p}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" /></IconBase>);
const IconMonitor = (p: IconProps) => (<IconBase {...p}><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></IconBase>);
const IconMenu = (p: IconProps) => (<IconBase {...p}><path d="M4 6h16M4 12h16M4 18h16" /></IconBase>);
const IconX = (p: IconProps) => (<IconBase {...p}><path d="M18 6 6 18M6 6l12 12" /></IconBase>);
const IconCopy = (p: IconProps) => (<IconBase {...p}><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></IconBase>);
const IconDownload = (p: IconProps) => (<IconBase {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m7 10 5 5 5-5" /><path d="M12 15V3" /></IconBase>);
const IconTrash = (p: IconProps) => (<IconBase {...p}><path d="M3 6h18" /><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /></IconBase>);
const IconUndo = (p: IconProps) => (<IconBase {...p}><path d="M3 7v6h6" /><path d="M21 17a9 9 0 0 0-15-6.7L3 13" /></IconBase>);
const IconRedo = (p: IconProps) => (<IconBase {...p}><path d="M21 7v6h-6" /><path d="M3 17a9 9 0 0 1 15-6.7L21 13" /></IconBase>);
const IconPrinter = (p: IconProps) => (<IconBase {...p}><path d="M6 9V2h12v7" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" rx="1" /></IconBase>);
const IconMaximize = (p: IconProps) => (<IconBase {...p}><path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M16 21h3a2 2 0 0 0 2-2v-3M8 21H5a2 2 0 0 1-2-2v-3" /></IconBase>);
const IconMinimize = (p: IconProps) => (<IconBase {...p}><path d="M8 3v3a2 2 0 0 1-2 2H3M16 3v3a2 2 0 0 0 2 2h3M16 21v-3a2 2 0 0 1 2-2h3M8 21v-3a2 2 0 0 0-2-2H3" /></IconBase>);
const IconSearch = (p: IconProps) => (<IconBase {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></IconBase>);
const IconWand = (p: IconProps) => (<IconBase {...p}><path d="m3 21 12-12" /><path d="m14 5 5 5" /><path d="M19 2v3M21.5 3.5h-3M18 8v2M20 9h-2" /></IconBase>);
const IconAlignLeft = (p: IconProps) => (<IconBase {...p}><path d="M17 10H3M21 6H3M21 14H3M17 18H3" /></IconBase>);
const IconList = (p: IconProps) => (<IconBase {...p}><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></IconBase>);
const IconCode = (p: IconProps) => (<IconBase {...p}><path d="m16 18 6-6-6-6M8 6l-6 6 6 6" /></IconBase>);
const IconTag = (p: IconProps) => (<IconBase {...p}><path d="M20.6 13.4 12 22l-9-9V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z" /><circle cx="7" cy="7" r="1" /></IconBase>);
const IconLink = (p: IconProps) => (<IconBase {...p}><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" /><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" /></IconBase>);
const IconBraces = (p: IconProps) => (<IconBase {...p}><path d="M8 3H7a2 2 0 0 0-2 2v4a2 2 0 0 1-2 2 2 2 0 0 1 2 2v4a2 2 0 0 0 2 2h1" /><path d="M16 3h1a2 2 0 0 1 2 2v4a2 2 0 0 0 2 2 2 2 0 0 0-2 2v4a2 2 0 0 1-2 2h-1" /></IconBase>);
const IconImage = (p: IconProps) => (<IconBase {...p}><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></IconBase>);
const IconQr = (p: IconProps) => (<IconBase {...p}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><path d="M14 14h3v3h-3zM18 18h3v3h-3z" /></IconBase>);
const IconPercent = (p: IconProps) => (<IconBase {...p}><path d="m19 5-14 14" /><circle cx="6.5" cy="6.5" r="2.5" /><circle cx="17.5" cy="17.5" r="2.5" /></IconBase>);
const IconFileText = (p: IconProps) => (<IconBase {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6" /><path d="M8 13h8M8 17h5" /></IconBase>);
const IconArrowRight = (p: IconProps) => (<IconBase {...p}><path d="M5 12h14M13 6l6 6-6 6" /></IconBase>);
const IconChevronDown = (p: IconProps) => (<IconBase {...p}><path d="m6 9 6 6 6-6" /></IconBase>);
const IconSparkle = (p: IconProps) => (<IconBase {...p}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6.3 6.3l2.8 2.8M14.9 14.9l2.8 2.8M17.7 6.3l-2.8 2.8M9.1 14.9l-2.8 2.8" /></IconBase>);
const IconEye = (p: IconProps) => (<IconBase {...p}><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></IconBase>);
const IconQuote = (p: IconProps) => (<IconBase {...p}><path d="M7 15h3l2-4V7H6v6h3" /><path d="M15 15h3l2-4V7h-6v6h3" /></IconBase>);

/* ------------------------------------------------------------------
   UI PRIMITIVES
   ------------------------------------------------------------------ */

const GLASS = 'border border-[color:var(--border)] bg-[color:var(--surface)] backdrop-blur-xl rounded-2xl';

const Card: React.FC<{ className?: string; children: React.ReactNode; as?: 'div' | 'section' | 'article' }> = ({ className = '', children, as = 'div' }) => {
  const Tag = as as any;
  return <Tag className={`${GLASS} shadow-[var(--shadow-sm)] ${className}`} style={{ boxShadow: 'var(--shadow-sm)' }}>{children}</Tag>;
};

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ variant = 'secondary', size = 'md', icon, children, className = '', ...rest }) => {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 select-none whitespace-nowrap disabled:opacity-45 disabled:cursor-not-allowed active:scale-[.97]';
  const sizes: Record<string, string> = { sm: 'text-xs px-3 py-1.5', md: 'text-sm px-4 py-2.5', lg: 'text-base px-6 py-3.5' };
  const variants: Record<ButtonVariant, string> = {
    primary: 'text-white shadow-lg shadow-[rgba(120,90,255,.35)] bg-[linear-gradient(120deg,var(--accent),var(--accent-2))] hover:brightness-110',
    secondary: 'border border-[color:var(--border)] bg-[color:var(--surface-strong)] text-[color:var(--text)] hover:border-[color:var(--border-strong)] hover:bg-[color:var(--surface)]',
    ghost: 'text-[color:var(--text-soft)] hover:bg-[color:var(--surface)] hover:text-[color:var(--text)]',
    danger: 'text-white bg-[linear-gradient(120deg,#f43f5e,#fb7185)] hover:brightness-110',
    success: 'text-white bg-[linear-gradient(120deg,#10b981,#34d399)] hover:brightness-110',
  };
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...rest}>
      {icon ? <span className="shrink-0">{icon}</span> : null}
      {children}
    </button>
  );
};

const SectionHeading: React.FC<{ eyebrow?: string; title: string; description?: string; id?: string; center?: boolean }> = ({ eyebrow, title, description, id, center }) => (
  <header className={center ? 'text-center max-w-3xl mx-auto' : ''}>
    {eyebrow ? <p className="text-xs font-bold tracking-[0.18em] uppercase mb-3" style={{ color: 'var(--accent-2)' }}>{eyebrow}</p> : null}
    <h2 id={id} className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight" style={{ color: 'var(--text)' }}>{title}</h2>
    {description ? <p className="mt-3 text-sm sm:text-base leading-relaxed" style={{ color: 'var(--muted)' }}>{description}</p> : null}
  </header>
);

const AnimatedNumber: React.FC<{ value: number; decimals?: number; className?: string; duration?: number }> = ({ value, decimals = 0, className = '', duration = 550 }) => {
  const [display, setDisplay] = useState(value);
  const displayRef = useRef(value);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const from = displayRef.current;
    const to = value;
    if (from === to) return;
    const reduce = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { displayRef.current = to; setDisplay(to); return; }
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = from + (to - from) * eased;
      displayRef.current = current;
      setDisplay(current);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
      else { displayRef.current = to; setDisplay(to); }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current !== null) cancelAnimationFrame(rafRef.current); };
  }, [value, duration]);

  return <span className={className}>{formatNumber(display, decimals)}</span>;
};

const ProgressBar: React.FC<{ value: number; max?: number; tone?: 'accent' | 'good' | 'warn' | 'bad'; height?: string; label?: string }> = ({ value, max = 100, tone = 'accent', height = 'h-2.5', label }) => {
  const pct = Math.max(0, Math.min(100, max > 0 ? (value / max) * 100 : 0));
  const colors: Record<string, string> = {
    accent: 'linear-gradient(90deg, var(--accent), var(--accent-2))',
    good: 'linear-gradient(90deg, #10b981, #34d399)',
    warn: 'linear-gradient(90deg, #f59e0b, #fbbf24)',
    bad: 'linear-gradient(90deg, #e11d48, #fb7185)',
  };
  return (
    <div className={`w-full ${height} rounded-full overflow-hidden`} style={{ background: 'var(--surface-strong)' }}
      role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label={label ?? 'Progress'}>
      <div className="h-full rounded-full awc-progress-fill" style={{ width: `${pct}%`, background: colors[tone] }} />
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: number; decimals?: number; suffix?: string; hint?: string; tone?: 'default' | 'accent' | 'good' | 'warn' }> = ({ icon, label, value, decimals = 0, suffix, hint, tone = 'default' }) => {
  const toneColors: Record<string, string> = { default: 'var(--text)', accent: 'var(--accent-2)', good: 'var(--good)', warn: 'var(--warn)' };
  return (
    <Card className="p-4 sm:p-5 transition-transform duration-300 hover:-translate-y-1">
      <div className="flex items-start justify-between gap-3">
        <span className="shrink-0 grid place-items-center w-9 h-9 rounded-xl" style={{ background: 'var(--surface-strong)', color: 'var(--accent)' }}>{icon}</span>
      </div>
      <p className="mt-3 text-2xl sm:text-[1.7rem] font-extrabold tabular-nums leading-none" style={{ color: toneColors[tone] }}>
        <AnimatedNumber value={value} decimals={decimals} />
        {suffix ? <span className="text-base font-bold ml-1 opacity-80">{suffix}</span> : null}
      </p>
      <p className="mt-1.5 text-xs sm:text-[0.8rem] font-medium" style={{ color: 'var(--muted)' }}>{label}</p>
      {hint ? <p className="mt-1 text-[0.7rem]" style={{ color: 'var(--muted)' }}>{hint}</p> : null}
    </Card>
  );
};

const Accordion: React.FC<{ items: { q: string; a: React.ReactNode }[] }> = ({ items }) => {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="space-y-3">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <Card key={item.q} className="overflow-hidden">
            <h3>
              <button type="button" onClick={() => setOpen(isOpen ? null : i)} aria-expanded={isOpen}
                className="w-full flex items-center justify-between gap-4 text-left px-5 py-4">
                <span className="font-semibold text-sm sm:text-base" style={{ color: 'var(--text)' }}>{item.q}</span>
                <span className="shrink-0 transition-transform duration-300" style={{ color: 'var(--accent)', transform: isOpen ? 'rotate(180deg)' : 'none' }}>
                  <IconChevronDown />
                </span>
              </button>
            </h3>
            <div className="grid transition-all duration-300 ease-out" style={{ gridTemplateRows: isOpen ? '1fr' : '0fr', opacity: isOpen ? 1 : 0 }}>
              <div className="overflow-hidden">
                <div className="px-5 pb-5 text-sm leading-relaxed space-y-3" style={{ color: 'var(--muted)' }}>{item.a}</div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

const Tabs: React.FC<{ tabs: { id: string; label: string; icon?: React.ReactNode }[]; active: string; onChange: (id: string) => void; ariaLabel: string }> = ({ tabs, active, onChange, ariaLabel }) => (
  <div role="tablist" aria-label={ariaLabel} className="flex gap-2 overflow-x-auto scroll-thin pb-1">
    {tabs.map((t) => {
      const isActive = t.id === active;
      return (
        <button key={t.id} role="tab" aria-selected={isActive} type="button" onClick={() => onChange(t.id)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 border"
          style={{ color: isActive ? '#fff' : 'var(--text-soft)', background: isActive ? 'linear-gradient(120deg, var(--accent), var(--accent-2))' : 'var(--surface)', borderColor: isActive ? 'transparent' : 'var(--border)' }}>
          {t.icon}{t.label}
        </button>
      );
    })}
  </div>
);

const ToastHost: React.FC<{ toasts: ToastItem[] }> = ({ toasts }) => (
  <div className="fixed z-[100] bottom-4 right-4 left-4 sm:left-auto sm:w-[360px] flex flex-col gap-2 pointer-events-none" role="status" aria-live="polite">
    {toasts.map((t) => {
      const tone = t.kind === 'error' ? 'var(--bad)' : t.kind === 'info' ? 'var(--accent-2)' : 'var(--good)';
      return (
        <div key={t.id} className="anim-toast pointer-events-auto flex items-start gap-3 rounded-xl px-4 py-3 border text-sm font-medium"
          style={{ background: 'var(--surface-strong)', borderColor: 'var(--border)', color: 'var(--text)', boxShadow: 'var(--shadow-sm)', backdropFilter: 'blur(14px)' }}>
          <span style={{ color: tone }} className="mt-0.5 shrink-0">
            {t.kind === 'error' ? <IconAlert className="w-4 h-4" /> : <IconCheck className="w-4 h-4" />}
          </span>
          <span className="leading-snug">{t.message}</span>
        </div>
      );
    })}
  </div>
);

/* ------------------------------------------------------------------
   NAVIGATION
   ------------------------------------------------------------------ */

const NAV_LINKS = [
  { label: 'Home', href: '#top' },
  { label: 'Word Counter', href: '#counter' },
  { label: 'Writing Tools', href: '#tools' },
  { label: 'Features', href: '#features' },
  { label: 'Guide', href: '#guide' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Contact', href: '#contact' },
];

/* ------------------------------------------------------------------
   HEADER
   ------------------------------------------------------------------ */

const Header: React.FC<{ theme: ThemeMode; onThemeChange: (t: ThemeMode) => void }> = ({ theme, onThemeChange }) => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const cycleTheme = () => {
    const order: ThemeMode[] = ['light', 'dark', 'system'];
    onThemeChange(order[(order.indexOf(theme) + 1) % order.length]);
  };

  const themeLabel = theme === 'light' ? 'Light mode' : theme === 'dark' ? 'Dark mode' : 'System';

  return (
    <header className="sticky top-0 z-50 transition-all duration-300"
      style={{ background: scrolled ? 'var(--surface-strong)' : 'transparent', backdropFilter: scrolled ? 'blur(18px)' : 'none', borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <a href="#top" className="flex items-center gap-2.5 shrink-0" aria-label={`${BRAND} home`}>
            <span className="grid place-items-center w-9 h-9 rounded-xl text-white shadow-lg" style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))' }}>
              <IconType className="w-5 h-5" />
            </span>
            <span className="leading-tight">
              <span className="block font-extrabold text-[0.95rem] tracking-tight" style={{ color: 'var(--text)' }}>{BRAND}</span>
              <span className="block text-[0.62rem] font-semibold tracking-[0.14em] uppercase" style={{ color: 'var(--muted)' }}>Writing Assistant</span>
            </span>
          </a>

          <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
            {NAV_LINKS.map((l) => (
              <a key={l.label} href={l.href} className="px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 hover:bg-[color:var(--surface)]" style={{ color: 'var(--text-soft)' }}>{l.label}</a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button type="button" onClick={cycleTheme}
              className="grid place-items-center w-10 h-10 rounded-xl border transition-colors duration-200"
              style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--text-soft)' }}
              aria-label={`Theme: ${themeLabel}. Click to change.`} title={`Theme: ${themeLabel}`}>
              {theme === 'light' ? <IconSun /> : theme === 'dark' ? <IconMoon /> : <IconMonitor />}
            </button>

            <a href="#counter" className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg transition-transform duration-200 hover:scale-[1.03]"
              style={{ background: 'linear-gradient(120deg, var(--accent), var(--accent-2))', boxShadow: '0 10px 26px rgba(120,90,255,.32)' }}>
              Start Writing Free
              <IconArrowRight className="w-4 h-4" />
            </a>

            <button type="button" onClick={() => setOpen((v) => !v)}
              className="lg:hidden grid place-items-center w-10 h-10 rounded-xl border"
              style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--text)' }}
              aria-expanded={open} aria-controls="mobile-nav" aria-label="Toggle navigation menu">
              {open ? <IconX /> : <IconMenu />}
            </button>
          </div>
        </div>

        {open ? (
          <nav id="mobile-nav" aria-label="Mobile navigation" className="lg:hidden anim-slide-down pb-4">
            <div className="rounded-2xl border p-2" style={{ borderColor: 'var(--border)', background: 'var(--surface-strong)', backdropFilter: 'blur(18px)' }}>
              {NAV_LINKS.map((l) => (
                <a key={l.label} href={l.href} onClick={() => setOpen(false)} className="block px-4 py-3 rounded-xl text-sm font-semibold transition-colors" style={{ color: 'var(--text-soft)' }}>{l.label}</a>
              ))}
              <a href="#counter" onClick={() => setOpen(false)}
                className="mt-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-white"
                style={{ background: 'linear-gradient(120deg, var(--accent), var(--accent-2))' }}>
                Start Writing Free
              </a>
            </div>
          </nav>
        ) : null}
      </div>
    </header>
  );
};

/* ------------------------------------------------------------------
   HERO
   ------------------------------------------------------------------ */

const Hero: React.FC = () => {
  const badges = [
    { icon: <IconShield className="w-4 h-4" />, text: '100% Browser Based' },
    { icon: <IconCheck className="w-4 h-4" />, text: 'No Sign Up Required' },
    { icon: <IconZap className="w-4 h-4" />, text: 'Fast & Private' },
    { icon: <IconStar className="w-4 h-4" />, text: 'Free to Use' },
  ];
  return (
    <section id="top" className="relative pt-10 sm:pt-16 pb-10 sm:pb-14">
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-72 -z-10 glow"
        style={{ background: 'radial-gradient(600px 240px at 50% 0%, rgba(139,123,255,.35), transparent 70%)' }} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-4xl mx-auto anim-fade-up">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[0.72rem] font-bold tracking-wide border"
            style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--text-soft)' }}>
            <IconSparkle className="w-3.5 h-3.5" />
            Advanced Writing Analytics · Runs entirely in your browser
          </span>

          <h1 className="mt-6 text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08]" style={{ color: 'var(--text)' }}>
            Advanced Word Counter &{' '}<span className="gradient-text">Writing Tool</span>
          </h1>

          <p className="mt-5 text-sm sm:text-lg leading-relaxed max-w-3xl mx-auto" style={{ color: 'var(--muted)' }}>
            Count words, characters, sentences, paragraphs, reading time and more — while analyzing and improving your writing with powerful professional writing tools.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href="#counter" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-base font-bold text-white transition-transform duration-200 hover:scale-[1.03]"
              style={{ background: 'linear-gradient(120deg, var(--accent), var(--accent-2))', boxShadow: '0 14px 34px rgba(120,90,255,.35)' }}>
              Start Writing
              <IconArrowRight className="w-4 h-4" />
            </a>
            <a href="#features" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-base font-bold border transition-colors duration-200"
              style={{ borderColor: 'var(--border-strong)', background: 'var(--surface)', color: 'var(--text)' }}>
              Explore Features
            </a>
          </div>

          <ul className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
            {badges.map((b) => (
              <li key={b.text} className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-[0.72rem] sm:text-xs font-semibold border"
                style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--text-soft)' }}>
                <span style={{ color: 'var(--accent-2)' }}>{b.icon}</span>
                {b.text}
              </li>
            ))}
          </ul>

          <p className="mt-6 text-xs sm:text-sm font-medium inline-flex items-center gap-2" style={{ color: 'var(--muted)' }}>
            <IconLock className="w-4 h-4" />
            Your text stays in your browser. Nothing is uploaded.
          </p>
        </div>
      </div>
    </section>
  );
};

/* ------------------------------------------------------------------
   MAIN COMPONENT
   ------------------------------------------------------------------ */

export default function AdvancedWordCounter() {
  /* theme */
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = safeGet('awc.theme') as ThemeMode | null;
    if (stored === 'light' || stored === 'dark' || stored === 'system') setTheme(stored);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const root = document.documentElement;
    const apply = () => {
      const resolved = theme === 'system'
        ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : theme;
      root.setAttribute('data-theme', resolved);
    };
    apply();
    safeSet('awc.theme', theme);

    if (theme === 'system' && typeof window !== 'undefined' && window.matchMedia) {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => apply();
      mq.addEventListener?.('change', handler);
      return () => mq.removeEventListener?.('change', handler);
    }
    return undefined;
  }, [theme, hydrated]);

  /* toasts */
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const pushToast = useCallback((message: string, kind: ToastKind = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev.slice(-3), { id, message, kind }]);
    window.setTimeout(() => { setToasts((prev) => prev.filter((t) => t.id !== id)); }, 3400);
  }, []);

  useEffect(() => {
    _notify = pushToast;
    return () => { _notify = null; };
  }, [pushToast]);

  /* editor */
  const [text, setText] = useState<string>('');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const saved = safeGet('awc.text');
    if (saved) setText(saved);
  }, []);

  const historyRef = useRef<{ stack: string[]; index: number }>({ stack: [''], index: 0 });
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const commitHistory = useCallback((value: string) => {
    const h = historyRef.current;
    if (h.stack[h.index] === value) return;
    h.stack = h.stack.slice(0, h.index + 1);
    h.stack.push(value);
    if (h.stack.length > 120) h.stack.shift();
    h.index = h.stack.length - 1;
    setCanUndo(h.index > 0);
    setCanRedo(false);
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => commitHistory(text), 650);
    return () => window.clearTimeout(id);
  }, [text, commitHistory]);

  const handleUndo = () => {
    const h = historyRef.current;
    if (h.index <= 0) return;
    h.index -= 1;
    setText(h.stack[h.index]);
    setCanUndo(h.index > 0);
    setCanRedo(true);
  };

  const handleRedo = () => {
    const h = historyRef.current;
    if (h.index >= h.stack.length - 1) return;
    h.index += 1;
    setText(h.stack[h.index]);
    setCanUndo(true);
    setCanRedo(h.index < h.stack.length - 1);
  };

  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [autoSave, setAutoSave] = useState(true);
  useEffect(() => {
    if (!autoSave) return;
    const id = window.setTimeout(() => {
      const ok = safeSet('awc.text', text);
      if (ok) setSavedAt(Date.now());
    }, 700);
    return () => window.clearTimeout(id);
  }, [text, autoSave]);

  const [fullscreen, setFullscreen] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [charLimit, setCharLimit] = useState<number>(0);
  const [wordGoal, setWordGoal] = useState<number>(1000);
  const [charGoal, setCharGoal] = useState<number>(0);
  const [goalReached, setGoalReached] = useState(false);

  useEffect(() => {
    const v = Number(safeGet('awc.wordGoal'));
    if (Number.isFinite(v) && v > 0) setWordGoal(v);
  }, []);

  useEffect(() => { safeSet('awc.wordGoal', String(wordGoal)); }, [wordGoal]);

  const [readingWpm, setReadingWpm] = useState(200);
  const [speakingWpm, setSpeakingWpm] = useState(130);

  const basic = useMemo(() => computeBasic(text), [text]);
  const debouncedText = useDebounced(text, 240);
  const debouncedBasic = useMemo(
    () => (debouncedText === text ? basic : computeBasic(debouncedText)),
    [debouncedText, text, basic],
  );
  const deep = useMemo(() => computeDeep(debouncedText, debouncedBasic), [debouncedText, debouncedBasic]);

  const readingSeconds = basic.words > 0 ? (basic.words / readingWpm) * 60 : 0;
  const speakingSeconds = basic.words > 0 ? (basic.words / speakingWpm) * 60 : 0;

  useEffect(() => {
    if (wordGoal > 0 && basic.words >= wordGoal) {
      if (!goalReached) { setGoalReached(true); notify('🎉 Goal reached! Excellent work.', 'success'); }
    } else if (goalReached) setGoalReached(false);
  }, [basic.words, wordGoal, goalReached]);

  const setTextAndCommit = useCallback((value: string) => {
    setText(value);
    commitHistory(value);
  }, [commitHistory]);

  const wrapSelection = useCallback((before: string, after: string) => {
    const ta = textareaRef.current;
    if (!ta) { setTextAndCommit(text + before + after); return; }
    const start = ta.selectionStart ?? text.length;
    const end = ta.selectionEnd ?? text.length;
    const selected = text.slice(start, end) || 'text';
    const next = text.slice(0, start) + before + selected + after + text.slice(end);
    setTextAndCommit(next);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(start + before.length, start + before.length + selected.length);
    });
  }, [text, setTextAndCommit]);

  const prefixLines = useCallback((prefix: string | ((i: number) => string)) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart ?? 0;
    const end = ta.selectionEnd ?? text.length;
    const lineStart = text.lastIndexOf('\n', start - 1) + 1;
    let lineEnd = text.indexOf('\n', end);
    if (lineEnd === -1) lineEnd = text.length;
    const block = text.slice(lineStart, lineEnd);
    const lines = block.split('\n');
    const newBlock = lines.map((line, i) => `${typeof prefix === 'function' ? prefix(i) : prefix}${line}`).join('\n');
    const next = text.slice(0, lineStart) + newBlock + text.slice(lineEnd);
    setTextAndCommit(next);
    requestAnimationFrame(() => { ta.focus(); ta.setSelectionRange(lineStart, lineStart + newBlock.length); });
  }, [text, setTextAndCommit]);

  const clearFormatting = useCallback(() => {
    const cleaned = text
      .replace(/^\s{0,3}#{1,6}\s+/gm, '')
      .replace(/^\s*[-*+]\s+/gm, '')
      .replace(/^\s*\d+\.\s+/gm, '')
      .replace(/^\s*>\s?/gm, '')
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/__(.+?)__/g, '$1')
      .replace(/_(.+?)_/g, '$1')
      .replace(/`(.+?)`/g, '$1');
    setTextAndCommit(cleaned);
    notify('Formatting cleared', 'success');
  }, [text, setTextAndCommit]);

  const handleCopy = async () => {
    if (!text) return notify('There is nothing to copy yet.', 'info');
    const ok = await copyToClipboard(text);
    notify(ok ? 'Text copied to clipboard' : 'Clipboard access was blocked', ok ? 'success' : 'error');
  };

  const handleClear = () => {
    if (!text) return notify('The editor is already empty.', 'info');
    if (typeof window !== 'undefined' && !window.confirm('Clear all text from the editor? This cannot be undone.')) return;
    setTextAndCommit('');
    notify('Editor cleared', 'success');
  };

  const handleDownloadTxt = () => {
    if (!text) return notify('Add some text before downloading.', 'info');
    const ok = downloadFile('wordcraft-text.txt', text, 'text/plain;charset=utf-8');
    notify(ok ? 'TXT file downloaded' : 'Download failed in this browser', ok ? 'success' : 'error');
  };

  const handlePrint = () => {
    if (!text) return notify('Add some text before printing.', 'info');
    try {
      const w = window.open('', '_blank', 'noopener,noreferrer');
      if (!w) return notify('Pop-up blocked — please allow pop-ups to print.', 'error');
      w.document.write(`<!doctype html><html><head><title>${BRAND} – Text</title><meta charset="utf-8" /></head><body style="font-family:system-ui,sans-serif;line-height:1.7;padding:32px;white-space:pre-wrap">${text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</body></html>`);
      w.document.close();
      w.focus();
      w.print();
    } catch { notify('Printing is not available in this browser.', 'error'); }
  };

  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setFullscreen(false); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [fullscreen]);

  const overCharLimit = charLimit > 0 && basic.characters > charLimit;

  /* ------------------------------------------------------------------
     RENDER
     ------------------------------------------------------------------ */

  return (
    <div className="app-bg min-h-screen w-full overflow-x-hidden" style={{ color: 'var(--text)' }}>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />

      <a href="#counter" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[200] focus:px-4 focus:py-2 focus:rounded-lg"
        style={{ background: 'var(--accent)', color: '#fff' }}>
        Skip to the word counter
      </a>

      <Header theme={theme} onThemeChange={setTheme} />
      <Hero />

      {/* EDITOR */}
      <section id="counter" className="max-w-7xl mx-auto px-4 sm:px-6 py-8 scroll-mt-20" aria-labelledby="counter-heading">
        <SectionHeading id="counter-heading" eyebrow="Live Word Counter"
          title="Write, count and analyse in real time"
          description="Everything updates instantly as you type. Your text never leaves this browser tab." />

        <div className="mt-8">
          <Card className={fullscreen ? 'fixed inset-0 z-[90] rounded-none flex flex-col p-3 sm:p-5 overflow-auto scroll-thin' : 'p-3 sm:p-5'}>
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-1.5 pb-3 mb-3 border-b" style={{ borderColor: 'var(--border)' }}>
              <ToolbarBtn label="Bold" onClick={() => wrapSelection('**', '**')}><span className="font-black text-sm">B</span></ToolbarBtn>
              <ToolbarBtn label="Italic" onClick={() => wrapSelection('*', '*')}><span className="italic font-serif text-sm">I</span></ToolbarBtn>
              <ToolbarBtn label="Underline" onClick={() => wrapSelection('__', '__')}><span className="underline text-sm">U</span></ToolbarBtn>
              <Divider />
              <ToolbarBtn label="Heading" onClick={() => prefixLines('## ')}><IconHeading className="w-4 h-4" /></ToolbarBtn>
              <ToolbarBtn label="Bullet list" onClick={() => prefixLines('- ')}><IconList className="w-4 h-4" /></ToolbarBtn>
              <ToolbarBtn label="Numbered list" onClick={() => prefixLines((i) => `${i + 1}. `)}><span className="text-xs font-bold">1.</span></ToolbarBtn>
              <ToolbarBtn label="Quote" onClick={() => prefixLines('> ')}><IconQuote className="w-4 h-4" /></ToolbarBtn>
              <Divider />
              <ToolbarBtn label="Clear formatting" onClick={clearFormatting}><IconWand className="w-4 h-4" /></ToolbarBtn>
              <div className="flex-1" />
              <ToolbarBtn label="Undo" onClick={handleUndo} disabled={!canUndo}><IconUndo className="w-4 h-4" /></ToolbarBtn>
              <ToolbarBtn label="Redo" onClick={handleRedo} disabled={!canRedo}><IconRedo className="w-4 h-4" /></ToolbarBtn>
              <ToolbarBtn label={fullscreen ? 'Exit fullscreen' : 'Fullscreen editor'} onClick={() => setFullscreen((v) => !v)}>
                {fullscreen ? <IconMinimize className="w-4 h-4" /> : <IconMaximize className="w-4 h-4" />}
              </ToolbarBtn>
              <ToolbarBtn label="Copy text" onClick={handleCopy} disabled={!text}><IconCopy className="w-4 h-4" /></ToolbarBtn>
              <ToolbarBtn label="Download text" onClick={handleDownloadTxt} disabled={!text}><IconDownload className="w-4 h-4" /></ToolbarBtn>
              <ToolbarBtn label="Print text" onClick={handlePrint} disabled={!text}><IconPrinter className="w-4 h-4" /></ToolbarBtn>
              <ToolbarBtn label="Clear text" onClick={handleClear} disabled={!text}><IconTrash className="w-4 h-4" /></ToolbarBtn>
            </div>

            <label htmlFor="awc-editor" className="sr-only">Writing editor — type or paste your text here</label>
            <textarea id="awc-editor" ref={textareaRef} value={text} onChange={(e) => setText(e.target.value)} spellCheck
              placeholder="Start typing or paste your text here… Your word count, reading time, readability and keyword analysis will update instantly."
              className={`w-full resize-y rounded-xl p-4 sm:p-5 text-[0.95rem] sm:text-base leading-relaxed outline-none scroll-thin transition-colors ${fullscreen ? 'flex-1 min-h-[50vh]' : 'min-h-[280px] sm:min-h-[380px]'}`}
              style={{ background: 'var(--surface-2)', border: `1px solid ${overCharLimit ? 'var(--bad)' : 'var(--border)'}`, color: 'var(--text)', fontFamily: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif' }}
              aria-describedby="editor-help" />

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm">
              <span className="font-bold tabular-nums" style={{ color: 'var(--text)' }}><AnimatedNumber value={basic.words} /> words</span>
              <span style={{ color: 'var(--muted)' }} className="tabular-nums">{formatNumber(basic.characters)} characters</span>
              <span style={{ color: 'var(--muted)' }} className="tabular-nums">{formatNumber(basic.sentences)} sentences</span>
              <span style={{ color: 'var(--muted)' }} className="tabular-nums">{formatSeconds(readingSeconds)} read</span>
              {charLimit > 0 ? (
                <span className="tabular-nums font-semibold" style={{ color: overCharLimit ? 'var(--bad)' : 'var(--good)' }}>
                  {formatNumber(basic.characters)} / {formatNumber(charLimit)} characters
                </span>
              ) : null}
              <span className="flex-1" />
              <span style={{ color: 'var(--muted)' }} id="editor-help">
                {autoSave && savedAt ? 'Saved locally' : autoSave ? 'Auto-save on' : 'Auto-save off'}
              </span>
            </div>

            <div className="mt-4 pt-4 border-t grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3" style={{ borderColor: 'var(--border)' }}>
              <Field label="Character limit (0 = off)">
                <input type="number" min={0} value={charLimit || ''} onChange={(e) => setCharLimit(Math.max(0, Number(e.target.value) || 0))} placeholder="0" />
              </Field>
              <Field label="Word goal">
                <input type="number" min={0} value={wordGoal || ''} onChange={(e) => setWordGoal(Math.max(0, Number(e.target.value) || 0))} placeholder="1000" />
              </Field>
              <Field label="Reading speed (WPM)">
                <input type="number" min={50} max={1000} value={readingWpm} onChange={(e) => setReadingWpm(Math.min(1000, Math.max(50, Number(e.target.value) || 200)))} />
              </Field>
              <Field label="Speaking speed (WPM)">
                <input type="number" min={50} max={500} value={speakingWpm} onChange={(e) => setSpeakingWpm(Math.min(500, Math.max(50, Number(e.target.value) || 130)))} />
              </Field>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Button size="sm" variant={autoSave ? 'success' : 'secondary'}
                onClick={() => { setAutoSave((v) => !v); notify(autoSave ? 'Auto-save turned off' : 'Auto-save turned on — text stored locally', 'info'); }}>
                {autoSave ? 'Auto-save: On' : 'Auto-save: Off'}
              </Button>
              <Button size="sm" variant={focusMode ? 'primary' : 'secondary'} onClick={() => setFocusMode((v) => !v)} icon={<IconEye className="w-4 h-4" />}>
                {focusMode ? 'Exit focus mode' : 'Focus mode'}
              </Button>
              <Button size="sm" variant="ghost" icon={<IconTrash className="w-4 h-4" />}
                onClick={() => {
                  safeRemove('awc.text');
                  setText('');
                  historyRef.current = { stack: [''], index: 0 };
                  setCanUndo(false); setCanRedo(false); setSavedAt(null);
                  notify('Saved local data cleared', 'success');
                }}>
                Clear saved data
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {!focusMode ? (
        <>
          {/* STATS */}
          <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 py-10 scroll-mt-20" aria-labelledby="stats-heading">
            <SectionHeading id="stats-heading" eyebrow="Real-Time Statistics" title="Your writing, measured precisely"
              description="Every metric below recalculates the moment your text changes." />

            <h3 className="mt-9 mb-4 text-sm font-bold tracking-[0.14em] uppercase" style={{ color: 'var(--muted)' }}>Basic statistics</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              <StatCard icon={<IconText className="w-4 h-4" />} label="Words" value={basic.words} tone="accent" />
              <StatCard icon={<IconType className="w-4 h-4" />} label="Characters" value={basic.characters} />
              <StatCard icon={<IconHash className="w-4 h-4" />} label="Characters (no spaces)" value={basic.charactersNoSpaces} />
              <StatCard icon={<IconAlignLeft className="w-4 h-4" />} label="Sentences" value={basic.sentences} />
              <StatCard icon={<IconLayers className="w-4 h-4" />} label="Paragraphs" value={basic.paragraphs} />
              <StatCard icon={<IconList className="w-4 h-4" />} label="Lines" value={basic.lines} />
              <StatCard icon={<IconStar className="w-4 h-4" />} label="Unique words" value={basic.uniqueWords} />
              <StatCard icon={<IconHeading className="w-4 h-4" />} label="Headings" value={basic.headings} hint="Markdown-style # headings" />
            </div>

            <h3 className="mt-10 mb-4 text-sm font-bold tracking-[0.14em] uppercase" style={{ color: 'var(--muted)' }}>Advanced statistics</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              <StatCard icon={<IconType className="w-4 h-4" />} label="Avg. word length" value={basic.avgWordLength} decimals={2} suffix="ch" />
              <StatCard icon={<IconAlignLeft className="w-4 h-4" />} label="Avg. sentence length" value={basic.avgSentenceLength} decimals={1} suffix="w" />
              <StatCard icon={<IconLayers className="w-4 h-4" />} label="Avg. paragraph length" value={basic.avgParagraphLength} decimals={1} suffix="w" />
              <StatCard icon={<IconSparkle className="w-4 h-4" />} label="Syllables" value={deep.syllables} />
              <StatCard icon={<IconBook className="w-4 h-4" />} label="Complex word %" value={deep.complexWordPct} decimals={1} suffix="%" hint="Words with 3+ syllables" />
              <StatCard icon={<IconClock className="w-4 h-4" />} label="Reading time" value={Math.round(readingSeconds)} suffix="sec" />
              <StatCard icon={<IconMic className="w-4 h-4" />} label="Speaking time" value={Math.round(speakingSeconds)} suffix="sec" />
              <StatCard icon={<IconChart className="w-4 h-4" />} label="Flesch Reading Ease" value={deep.fleschReadingEase} decimals={1}
                tone={deep.fleschReadingEase >= 60 ? 'good' : deep.fleschReadingEase >= 45 ? 'warn' : 'default'} />
            </div>

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="p-5">
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Longest word</p>
                <p className="mt-2 text-lg font-bold break-all" style={{ color: 'var(--text)' }}>{basic.longestWord || '—'}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                  {basic.longestWord ? `${basic.longestWord.length} characters` : 'No text yet'}
                </p>
              </Card>
              <Card className="p-5">
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Shortest word</p>
                <p className="mt-2 text-lg font-bold break-all" style={{ color: 'var(--text)' }}>{basic.shortestWord || '—'}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                  {basic.shortestWord ? `${basic.shortestWord.length} characters` : 'No text yet'}
                </p>
              </Card>
              <Card className="p-5">
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Reading & speaking</p>
                <p className="mt-2 text-sm" style={{ color: 'var(--text)' }}><strong>Reading:</strong> {formatSeconds(readingSeconds)} at {readingWpm} WPM</p>
                <p className="mt-1 text-sm" style={{ color: 'var(--text)' }}><strong>Speaking:</strong> {formatSeconds(speakingSeconds)} at {speakingWpm} WPM</p>
              </Card>
            </div>
          </section>

          {/* READING/SPEAKING + GOALS */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <Card className="p-5 sm:p-6">
                <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--text)' }}>
                  <IconClock className="w-5 h-5" /> Reading &amp; Speaking Analysis
                </h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
                  Reading and speaking speeds vary from person to person. Pick a preset or enter your own words-per-minute value.
                </p>

                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--muted)' }}>Reading speed</p>
                    <div className="flex flex-wrap gap-2">
                      {[{ label: 'Slow', wpm: 120 }, { label: 'Average', wpm: 200 }, { label: 'Fast', wpm: 300 }].map((p) => (
                        <Button key={p.label} size="sm" variant={readingWpm === p.wpm ? 'primary' : 'secondary'} onClick={() => setReadingWpm(p.wpm)}>{p.label}</Button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--muted)' }}>Speaking speed</p>
                    <div className="flex flex-wrap gap-2">
                      {[{ label: 'Slow', wpm: 100 }, { label: 'Average', wpm: 130 }, { label: 'Fast', wpm: 180 }].map((p) => (
                        <Button key={p.label} size="sm" variant={speakingWpm === p.wpm ? 'primary' : 'secondary'} onClick={() => setSpeakingWpm(p.wpm)}>{p.label}</Button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ResultTile icon={<IconClock className="w-5 h-5" />} label="Estimated Reading Time" value={formatSeconds(readingSeconds)} accent />
                  <ResultTile icon={<IconMic className="w-5 h-5" />} label="Estimated Speaking Time" value={formatSeconds(speakingSeconds)} />
                </div>
              </Card>

              <Card className="p-5 sm:p-6">
                <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--text)' }}>
                  <IconTarget className="w-5 h-5" /> Writing Goal Tracker
                </h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
                  Set a target and watch your progress fill up as you write.
                </p>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <Field label="Word goal">
                    <input type="number" min={0} value={wordGoal || ''} onChange={(e) => setWordGoal(Math.max(0, Number(e.target.value) || 0))} />
                  </Field>
                  <Field label="Character goal">
                    <input type="number" min={0} value={charGoal || ''} onChange={(e) => setCharGoal(Math.max(0, Number(e.target.value) || 0))} placeholder="0" />
                  </Field>
                </div>

                {wordGoal > 0 ? <GoalRow label="Words" current={basic.words} goal={wordGoal} done={basic.words >= wordGoal} /> : null}
                {charGoal > 0 ? <GoalRow label="Characters" current={basic.characters} goal={charGoal} done={basic.characters >= charGoal} /> : null}

                {wordGoal === 0 && charGoal === 0 ? (
                  <p className="mt-5 text-sm rounded-xl px-4 py-3 border" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)', color: 'var(--muted)' }}>
                    Enter a word or character goal above to start tracking your progress.
                  </p>
                ) : null}

                {goalReached ? (
                  <p className="anim-celebrate mt-4 text-sm font-bold rounded-xl px-4 py-3" style={{ background: 'rgba(52,211,153,.14)', color: 'var(--good)' }}>
                    🎉 Goal complete — {formatNumber(basic.words)} words written!
                  </p>
                ) : null}
              </Card>
            </div>
          </section>

          <KeywordAnalyzer basic={basic} deep={deep} />
          <ReadabilityPanel basic={basic} deep={deep} />
          <QualityPanel basic={basic} deep={deep} />
          <WritingTools text={text} onApply={(fn, label) => {
            if (!text.trim()) return notify('Add some text first.', 'info');
            setTextAndCommit(fn(text));
            notify(`${label} applied`, 'success');
          }} />
          <SeoTools basic={basic} deep={deep} text={text} />
          <SocialCounters text={text} />
          <AcademicTools basic={basic} />
        </>
      ) : (
        <section className="max-w-3xl mx-auto px-4 sm:px-6 py-6 text-center">
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            Focus mode is on — only the editor is visible.{' '}
            <button type="button" className="underline font-semibold" style={{ color: 'var(--accent-2)' }} onClick={() => setFocusMode(false)}>
              Exit focus mode
            </button>
          </p>
        </section>
      )}

      {/* EXPORT + PRIVACY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <Card className="p-5 sm:p-6 lg:col-span-2">
            <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--text)' }}>
              <IconDownload className="w-5 h-5" /> Export &amp; Share
            </h3>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
              Generate a file directly in your browser. Nothing is uploaded to a server.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button variant="secondary" icon={<IconCopy className="w-4 h-4" />}
                onClick={async () => {
                  if (!text) return notify('Add some text first.', 'info');
                  const ok = await copyToClipboard(text);
                  notify(ok ? 'Copied to clipboard' : 'Clipboard blocked', ok ? 'success' : 'error');
                }}>
                Copy to Clipboard
              </Button>
              <Button variant="secondary" icon={<IconFileText className="w-4 h-4" />}
                onClick={() => {
                  if (!text) return notify('Add some text first.', 'info');
                  const ok = downloadFile('wordcraft.txt', text, 'text/plain;charset=utf-8');
                  notify(ok ? 'TXT downloaded' : 'Download failed', ok ? 'success' : 'error');
                }}>TXT</Button>
              <Button variant="secondary" icon={<IconBraces className="w-4 h-4" />}
                onClick={() => {
                  if (!text) return notify('Add some text first.', 'info');
                  const payload = {
                    text,
                    stats: {
                      words: basic.words, characters: basic.characters,
                      charactersNoSpaces: basic.charactersNoSpaces,
                      sentences: basic.sentences, paragraphs: basic.paragraphs,
                      lines: basic.lines, uniqueWords: basic.uniqueWords,
                      headings: basic.headings,
                      avgWordLength: Number(basic.avgWordLength.toFixed(2)),
                      avgSentenceLength: Number(basic.avgSentenceLength.toFixed(2)),
                      readingTimeSeconds: Math.round(readingSeconds),
                      speakingTimeSeconds: Math.round(speakingSeconds),
                      fleschReadingEase: Number(deep.fleschReadingEase.toFixed(1)),
                      fleschKincaidGrade: Number(deep.fleschKincaid.toFixed(1)),
                    },
                    generatedAt: new Date().toISOString(),
                  };
                  const ok = downloadFile('wordcraft.json', JSON.stringify(payload, null, 2), 'application/json;charset=utf-8');
                  notify(ok ? 'JSON downloaded' : 'Download failed', ok ? 'success' : 'error');
                }}>JSON</Button>
              <Button variant="secondary" icon={<IconCode className="w-4 h-4" />}
                onClick={() => {
                  if (!text) return notify('Add some text first.', 'info');
                  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${BRAND} Export</title></head><body>${text.split(/\n\s*\n/).map((p) => `<p>${p.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>')}</p>`).join('\n')}</body></html>`;
                  const ok = downloadFile('wordcraft.html', html, 'text/html;charset=utf-8');
                  notify(ok ? 'HTML downloaded' : 'Download failed', ok ? 'success' : 'error');
                }}>HTML</Button>
              <Button variant="secondary" icon={<IconHash className="w-4 h-4" />}
                onClick={() => {
                  if (!text) return notify('Add some text first.', 'info');
                  const ok = downloadFile('wordcraft.md', text, 'text/markdown;charset=utf-8');
                  notify(ok ? 'Markdown downloaded' : 'Download failed', ok ? 'success' : 'error');
                }}>Markdown</Button>
              <Button variant="secondary" icon={<IconChart className="w-4 h-4" />}
                onClick={() => {
                  if (!text.trim()) return notify('Add some text first.', 'info');
                  const words = buildFrequency(deep.wordCounts, basic.words, { ignoreCommon: false, minLength: 1, includeNumbers: true });
                  const header = 'word,count,density_percent\n';
                  const rows = words.map((w) => `"${w.word.replace(/"/g, '""')}",${w.count},${w.pct.toFixed(4)}`).join('\n');
                  const ok = downloadFile('wordcraft-keywords.csv', header + rows, 'text/csv;charset=utf-8');
                  notify(ok ? 'CSV downloaded' : 'Download failed', ok ? 'success' : 'error');
                }}>CSV (keywords)</Button>
              <Button variant="secondary" onClick={handlePrint} icon={<IconPrinter className="w-4 h-4" />}>Print</Button>
            </div>
          </Card>

          <Card className="p-5 sm:p-6">
            <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--text)' }}>
              <IconShield className="w-5 h-5" /> Privacy First
            </h3>
            <p className="mt-3 text-sm leading-relaxed font-semibold" style={{ color: 'var(--accent-2)' }}>
              Your text stays in your browser.
            </p>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
              Every calculation on this page runs locally in JavaScript. Your writing is never sent to a server, never stored in an account and never shared. Auto-save writes to your own device&apos;s local storage, and you can erase it at any time.
            </p>
            <Button className="mt-4" variant="danger" size="sm" icon={<IconTrash className="w-4 h-4" />}
              onClick={() => {
                safeRemove('awc.text');
                safeRemove('awc.wordGoal');
                setText('');
                historyRef.current = { stack: [''], index: 0 };
                setCanUndo(false); setCanRedo(false); setSavedAt(null);
                notify('All locally saved data was removed.', 'success');
              }}>
              Clear local data
            </Button>
          </Card>
        </div>
      </section>

      <InfoContent />
      <UserGuide />
      <FaqSection />
      <OtherTools />
      <Footer />
      <ToastHost toasts={toasts} />
    </div>
  );
}

/* ------------------------------------------------------------------
   SHARED UI BITS
   ------------------------------------------------------------------ */

const inputClass = 'w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-colors border';

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <label className="block">
    <span className="block text-[0.7rem] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--muted)' }}>{label}</span>
    {React.isValidElement(children)
      ? React.cloneElement(children as React.ReactElement<any>, {
          className: `${inputClass} ${(children.props as any).className ?? ''}`,
          style: {
            background: 'var(--surface-2)',
            borderColor: 'var(--border)',
            color: 'var(--text)',
            ...((children.props as any).style ?? {}),
          },
        })
      : children}
  </label>
);

const ToolbarBtn: React.FC<{ label: string; onClick: () => void; disabled?: boolean; children: React.ReactNode }> = ({ label, onClick, disabled, children }) => (
  <button type="button" onClick={onClick} disabled={disabled} title={label} aria-label={label}
    className="grid place-items-center min-w-[34px] h-[34px] px-2 rounded-lg border transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
    style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--text-soft)' }}>
    {children}
  </button>
);

const Divider: React.FC = () => <span aria-hidden="true" className="w-px h-6 mx-1" style={{ background: 'var(--border)' }} />;

const ResultTile: React.FC<{ icon: React.ReactNode; label: string; value: string; accent?: boolean }> = ({ icon, label, value, accent }) => (
  <div className="rounded-xl p-4 border"
    style={{
      borderColor: accent ? 'transparent' : 'var(--border)',
      background: accent ? 'linear-gradient(135deg, rgba(139,123,255,.18), rgba(34,211,238,.14))' : 'var(--surface-2)',
    }}>
    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
      <span style={{ color: 'var(--accent-2)' }}>{icon}</span>
      {label}
    </div>
    <p className="mt-2 text-xl font-extrabold" style={{ color: 'var(--text)' }}>{value}</p>
  </div>
);

const GoalRow: React.FC<{ label: string; current: number; goal: number; done: boolean }> = ({ label, current, goal, done }) => {
  const pct = goal > 0 ? Math.min(100, (current / goal) * 100) : 0;
  const remaining = Math.max(0, goal - current);
  return (
    <div className="mt-5">
      <div className="flex items-baseline justify-between gap-3 mb-2">
        <span className="text-sm font-bold tabular-nums" style={{ color: 'var(--text)' }}>{label}: {formatNumber(current)} / {formatNumber(goal)}</span>
        <span className="text-sm font-bold tabular-nums" style={{ color: done ? 'var(--good)' : 'var(--accent-2)' }}>{pct.toFixed(0)}%</span>
      </div>
      <ProgressBar value={current} max={goal} tone={done ? 'good' : 'accent'} label={`${label} goal progress`} />
      <p className="mt-2 text-xs" style={{ color: 'var(--muted)' }}>
        {done ? 'Goal reached — congratulations!' : `${formatNumber(remaining)} ${label.toLowerCase()} remaining`}
      </p>
    </div>
  );
};

/* ------------------------------------------------------------------
   KEYWORD ANALYZER
   ------------------------------------------------------------------ */

const KeywordAnalyzer: React.FC<{ basic: BasicStats; deep: DeepStats }> = ({ basic, deep }) => {
  const [ignoreCommon, setIgnoreCommon] = useState(false);
  const [minLength, setMinLength] = useState(3);
  const [includeNumbers, setIncludeNumbers] = useState(false);
  const [topN, setTopN] = useState(10);

  const freq = useMemo(
    () => buildFrequency(deep.wordCounts, basic.words, { ignoreCommon, minLength, includeNumbers }),
    [deep.wordCounts, basic.words, ignoreCommon, minLength, includeNumbers],
  );
  const repeated = useMemo(() => findRepeatedWords(deep.wordCounts, 3).slice(0, 12), [deep.wordCounts]);
  const top = freq.slice(0, topN);
  const maxCount = top.length ? top[0].count : 1;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <Card className="p-5 sm:p-7">
        <SectionHeading eyebrow="Keyword Analysis" title="Word frequency & keyword density"
          description="See which words you lean on most. High density on a single word can make writing feel repetitive — use it as a signal, not a rule." />

        <div className="mt-7 flex flex-wrap items-center gap-4">
          <label className="inline-flex items-center gap-2 text-sm font-medium cursor-pointer" style={{ color: 'var(--text-soft)' }}>
            <input type="checkbox" checked={ignoreCommon} onChange={(e) => setIgnoreCommon(e.target.checked)} className="w-4 h-4 rounded" />
            Ignore common words
          </label>
          <label className="inline-flex items-center gap-2 text-sm font-medium cursor-pointer" style={{ color: 'var(--text-soft)' }}>
            <input type="checkbox" checked={includeNumbers} onChange={(e) => setIncludeNumbers(e.target.checked)} className="w-4 h-4 rounded" />
            Include numbers
          </label>
          <label className="inline-flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--text-soft)' }}>
            Min length
            <input type="number" min={1} max={20} value={minLength}
              onChange={(e) => setMinLength(Math.max(1, Math.min(20, Number(e.target.value) || 1)))}
              className={`${inputClass} w-20`}
              style={{ background: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text)' }} />
          </label>
          <div className="flex items-center gap-2">
            {[10, 20].map((n) => (
              <Button key={n} size="sm" variant={topN === n ? 'primary' : 'secondary'} onClick={() => setTopN(n)}>Top {n}</Button>
            ))}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
            <div className="px-4 py-3 text-xs font-bold uppercase tracking-wider border-b"
              style={{ background: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--muted)' }}>
              Top {topN} keywords
            </div>
            {top.length === 0 ? (
              <EmptyState title="No keywords yet" body="Start typing to see which words appear most often in your text." />
            ) : (
              <div className="max-h-[420px] overflow-y-auto scroll-thin">
                <table className="w-full text-sm">
                  <thead className="sr-only"><tr><th>Word</th><th>Count</th><th>Density</th></tr></thead>
                  <tbody>
                    {top.map((w) => (
                      <tr key={w.word} className="border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
                        <td className="px-4 py-2.5 font-semibold truncate max-w-[140px]" style={{ color: 'var(--text)' }} title={w.word}>{w.word}</td>
                        <td className="px-2 py-2.5 text-right tabular-nums" style={{ color: 'var(--muted)' }}>{w.count}</td>
                        <td className="px-4 py-2.5 w-1/2">
                          <div className="flex items-center gap-2">
                            <div className="flex-1"><ProgressBar value={w.count} max={maxCount} height="h-1.5" label={`Density for ${w.word}`} /></div>
                            <span className="text-xs tabular-nums w-14 text-right" style={{ color: 'var(--muted)' }}>{w.pct.toFixed(2)}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
            <div className="px-4 py-3 text-xs font-bold uppercase tracking-wider border-b"
              style={{ background: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--muted)' }}>
              Repeated &amp; potentially overused words
            </div>
            {repeated.length === 0 ? (
              <EmptyState title="No heavy repetition detected" body="Words that appear three or more times will show up here so you can vary your vocabulary." />
            ) : (
              <ul className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {repeated.map((r) => (
                  <li key={r.word} className="px-4 py-3 flex items-center justify-between gap-3" style={{ borderColor: 'var(--border)' }}>
                    <span className="font-semibold text-sm truncate" style={{ color: 'var(--text)' }}>{r.word}</span>
                    <span className="shrink-0 text-xs font-bold px-2.5 py-1 rounded-full"
                      style={{
                        background: r.count > 8 ? 'rgba(251,113,133,.16)' : r.count > 5 ? 'rgba(251,191,36,.16)' : 'var(--surface-strong)',
                        color: r.count > 8 ? 'var(--bad)' : r.count > 5 ? 'var(--warn)' : 'var(--muted)',
                      }}>
                      {r.count}× used
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </Card>
    </section>
  );
};

/* ------------------------------------------------------------------
   READABILITY
   ------------------------------------------------------------------ */

const ReadabilityPanel: React.FC<{ basic: BasicStats; deep: DeepStats }> = ({ basic, deep }) => {
  const band = readabilityBand(deep.fleschReadingEase);
  const toneColor = band.tone === 'good' ? 'var(--good)' : band.tone === 'warn' ? 'var(--warn)' : 'var(--bad)';
  const hasText = basic.words > 0;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <Card className="p-5 sm:p-7">
        <SectionHeading eyebrow="Readability" title="Readability analysis"
          description="Readability formulas estimate how difficult a passage is to read. They are useful guides, but they are approximations — especially for languages other than English." />

        {!hasText ? (
          <EmptyState title="Nothing to analyse yet" body="Write or paste at least a few sentences and your readability scores will appear here." />
        ) : (
          <>
            <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <ReadabilityTile label="Flesch Reading Ease" value={deep.fleschReadingEase.toFixed(1)} hint="Higher is easier (0–100)" />
              <ReadabilityTile label="Flesch–Kincaid Grade" value={deep.fleschKincaid.toFixed(1)} hint="Approx. US school grade" />
              <ReadabilityTile label="Avg. syllables / word" value={deep.syllablesPerWord.toFixed(2)} hint="Lower is simpler" />
              <ReadabilityTile label="Complex words" value={`${deep.complexWordPct.toFixed(1)}%`} hint="Words with 3+ syllables" />
            </div>

            <div className="mt-6 rounded-2xl p-5 border" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}>
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-3.5 py-1.5 rounded-full text-sm font-extrabold" style={{ background: `${toneColor}22`, color: toneColor }}>{band.label}</span>
                <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Flesch Reading Ease score: {deep.fleschReadingEase.toFixed(1)}</span>
              </div>
              <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{band.description}</p>
              <div className="mt-4">
                <ProgressBar value={deep.fleschReadingEase} max={100}
                  tone={band.tone === 'good' ? 'good' : band.tone === 'warn' ? 'warn' : 'bad'}
                  label="Flesch Reading Ease" />
                <div className="mt-2 flex justify-between text-[0.68rem] font-semibold" style={{ color: 'var(--muted)' }}>
                  <span>Very difficult</span><span>Standard</span><span>Very easy</span>
                </div>
              </div>
            </div>

            <p className="mt-4 text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>
              Note: readability scores are calculated from sentence length and syllable patterns. They cannot judge meaning, tone, jargon or cultural context, and they are not a substitute for an editorial review.
            </p>
          </>
        )}
      </Card>
    </section>
  );
};

const ReadabilityTile: React.FC<{ label: string; value: string; hint: string }> = ({ label, value, hint }) => (
  <div className="rounded-xl p-4 border" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}>
    <p className="text-[0.68rem] font-bold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>{label}</p>
    <p className="mt-2 text-2xl font-extrabold tabular-nums" style={{ color: 'var(--text)' }}>{value}</p>
    <p className="mt-1 text-[0.7rem]" style={{ color: 'var(--muted)' }}>{hint}</p>
  </div>
);

/* ------------------------------------------------------------------
   QUALITY PANEL
   ------------------------------------------------------------------ */

type QualityStatus = 'good' | 'warn' | 'bad';
interface QualityItem { label: string; status: QualityStatus; detail: string }

const QualityPanel: React.FC<{ basic: BasicStats; deep: DeepStats }> = ({ basic, deep }) => {
  const items: QualityItem[] = useMemo(() => {
    const list: QualityItem[] = [];
    if (basic.words === 0) return list;

    list.push({
      label: 'Sentence length',
      status: deep.longSentences.length === 0 ? 'good' : deep.longSentences.length <= 2 ? 'warn' : 'bad',
      detail: deep.longSentences.length === 0 ? 'No sentences longer than 25 words.' : `${deep.longSentences.length} sentence(s) longer than 25 words.`,
    });
    list.push({
      label: 'Paragraph length',
      status: deep.longParagraphs === 0 ? 'good' : deep.longParagraphs <= 1 ? 'warn' : 'bad',
      detail: deep.longParagraphs === 0 ? 'Paragraph sizes look reasonable.' : `${deep.longParagraphs} paragraph(s) exceed 150 words.`,
    });
    list.push({
      label: 'Duplicate sentences',
      status: deep.duplicateSentences.length === 0 ? 'good' : deep.duplicateSentences.length <= 1 ? 'warn' : 'bad',
      detail: deep.duplicateSentences.length === 0 ? 'No repeated sentences detected.' : `${deep.duplicateSentences.length} sentence(s) appear more than once.`,
    });

    const fillerTotal = deep.fillerHits.reduce((a, b) => a + b.count, 0);
    list.push({
      label: 'Filler words',
      status: fillerTotal === 0 ? 'good' : fillerTotal <= Math.max(3, basic.words * 0.01) ? 'warn' : 'bad',
      detail: fillerTotal === 0 ? 'No common filler words detected.' : `${fillerTotal} filler word(s) such as "really" or "basically".`,
    });

    const passiveRatio = basic.sentences ? deep.passiveHits / basic.sentences : 0;
    list.push({
      label: 'Passive constructions',
      status: deep.passiveHits === 0 ? 'good' : passiveRatio < 0.15 ? 'warn' : 'bad',
      detail: deep.passiveHits === 0 ? 'No obvious passive constructions found.' : `About ${deep.passiveHits} possible passive phrase(s) detected.`,
    });
    list.push({
      label: 'Extra spaces',
      status: deep.doubleSpaces === 0 ? 'good' : deep.doubleSpaces <= 3 ? 'warn' : 'bad',
      detail: deep.doubleSpaces === 0 ? 'Spacing looks clean.' : `${deep.doubleSpaces} place(s) with multiple consecutive spaces.`,
    });
    list.push({
      label: 'Punctuation',
      status: deep.punctuationRuns === 0 ? 'good' : deep.punctuationRuns <= 3 ? 'warn' : 'bad',
      detail: deep.punctuationRuns === 0 ? 'No excessive punctuation runs found.' : `${deep.punctuationRuns} repeated punctuation mark(s) like "!!" or "..".`,
    });
    list.push({
      label: 'Capitalization',
      status: deep.capitalizationIssues === 0 ? 'good' : deep.capitalizationIssues <= 2 ? 'warn' : 'bad',
      detail: deep.capitalizationIssues === 0 ? 'Sentences appear to start with capitals.' : `${deep.capitalizationIssues} sentence(s) may start with a lowercase letter.`,
    });

    return list;
  }, [basic, deep]);

  const statusStyle: Record<QualityStatus, { label: string; color: string; bg: string }> = {
    good: { label: 'Good', color: 'var(--good)', bg: 'rgba(52,211,153,.14)' },
    warn: { label: 'Needs Attention', color: 'var(--warn)', bg: 'rgba(251,191,36,.14)' },
    bad: { label: 'Improve', color: 'var(--bad)', bg: 'rgba(251,113,133,.14)' },
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <Card className="p-5 sm:p-7">
        <SectionHeading eyebrow="Text Quality" title="Writing quality checks"
          description="These are rule-based checks that run entirely in your browser. They highlight patterns worth reviewing — they are not a replacement for a professional grammar or style checker." />

        {items.length === 0 ? (
          <EmptyState title="Waiting for text" body="Add a few paragraphs and a quality report will be generated automatically." />
        ) : (
          <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {items.map((it) => {
              const s = statusStyle[it.status];
              return (
                <div key={it.label} className="rounded-xl p-4 border transition-transform duration-200 hover:-translate-y-1"
                  style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}>
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>{it.label}</p>
                    <span className="shrink-0 text-[0.62rem] font-extrabold uppercase tracking-wide px-2 py-1 rounded-full" style={{ background: s.bg, color: s.color }}>{s.label}</span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>{it.detail}</p>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </section>
  );
};

const EmptyState: React.FC<{ title: string; body: string }> = ({ title, body }) => (
  <div className="text-center py-12 px-4">
    <div className="mx-auto grid place-items-center w-14 h-14 rounded-2xl mb-4" style={{ background: 'var(--surface-strong)', color: 'var(--accent)' }} aria-hidden="true">
      <IconText className="w-6 h-6" />
    </div>
    <p className="font-bold text-sm" style={{ color: 'var(--text)' }}>{title}</p>
    <p className="mt-1.5 text-xs max-w-sm mx-auto leading-relaxed" style={{ color: 'var(--muted)' }}>{body}</p>
  </div>
);

/* ------------------------------------------------------------------
   WRITING TOOLS
   ------------------------------------------------------------------ */

const WritingTools: React.FC<{ text: string; onApply: (fn: (t: string) => string, label: string) => void }> = ({ text, onApply }) => {
  const [tab, setTab] = useState('format');
  const [find, setFind] = useState('');
  const [replace, setReplace] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);

  const tabs = [
    { id: 'format', label: 'Formatter', icon: <IconType className="w-4 h-4" /> },
    { id: 'clean', label: 'Cleaner', icon: <IconWand className="w-4 h-4" /> },
    { id: 'convert', label: 'Converter', icon: <IconCode className="w-4 h-4" /> },
    { id: 'find', label: 'Find & Replace', icon: <IconSearch className="w-4 h-4" /> },
    { id: 'sort', label: 'Sorting', icon: <IconList className="w-4 h-4" /> },
    { id: 'reverse', label: 'Reverse', icon: <IconUndo className="w-4 h-4" /> },
    { id: 'space', label: 'Spaces', icon: <IconAlignLeft className="w-4 h-4" /> },
  ];

  const toTitleCase = (s: string) => s.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
  const toSentenceCase = (s: string) => s.toLowerCase().replace(/(^\s*\w|[.!?…]\s+\w)/g, (m) => m.toUpperCase());
  const toToggleCase = (s: string) => s.split('').map((c) => (c === c.toLowerCase() ? c.toUpperCase() : c.toLowerCase())).join('');
  const toSlug = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-');

  const replaceAllInText = (opts?: { countOnly?: boolean }) => {
    if (!find) return notify('Enter something to find first.', 'info');
    try {
      const flags = caseSensitive ? 'g' : 'gi';
      const escaped = escapeRegExp(find);
      const pattern = wholeWord ? `\\b${escaped}\\b` : escaped;
      const re = new RegExp(pattern, flags);
      const matches = text.match(re);
      const count = matches ? matches.length : 0;
      if (opts?.countOnly) {
        notify(count > 0 ? `${count} match${count === 1 ? '' : 'es'} found` : 'No matches found', count > 0 ? 'success' : 'info');
        return;
      }
      if (count === 0) return notify('No matches found', 'info');
      onApply((t) => t.replace(re, replace), 'Replace all');
      notify(`${count} replacement${count === 1 ? '' : 's'} made`, 'success');
    } catch { notify('That search pattern is not valid.', 'error'); }
  };

  const cleanActions = [
    { label: 'Remove extra spaces', fn: (t: string) => t.replace(/[ \t]{2,}/g, ' ') },
    { label: 'Remove blank lines', fn: (t: string) => t.replace(/\n{3,}/g, '\n\n').replace(/^\s*\n/gm, '\n') },
    { label: 'Remove duplicate lines', fn: (t: string) => {
      const seen = new Set<string>();
      return t.split('\n').filter((line) => {
        const key = line.trim();
        if (!key) return true;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      }).join('\n');
    } },
    { label: 'Remove duplicate sentences', fn: (t: string) => {
      const seen = new Set<string>();
      return t.split(/(?<=[.!?…])\s+/).filter((s) => {
        const key = normalizeSentence(s);
        if (!key) return true;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      }).join(' ');
    } },
    { label: 'Normalize punctuation', fn: (t: string) => t.replace(/\s+([,.!?;:])/g, '$1').replace(/([,.!?;:])(?=[^\s,.!?;:])/g, '$1 ').replace(/[ \t]{2,}/g, ' ') },
    { label: 'Remove special characters', fn: (t: string) => t.replace(/[^\p{L}\p{N}\s.,!?;:'"()\-–—%$/&@#+=*]/gu, '') },
    { label: 'Remove numbers', fn: (t: string) => t.replace(/\d+/g, '') },
    { label: 'Remove HTML tags', fn: (t: string) => t.replace(/<[^>]*>/g, '') },
    { label: 'Remove all whitespace', fn: (t: string) => t.replace(/\s+/g, '') },
    { label: 'Trim lines', fn: (t: string) => t.split('\n').map((l) => l.trim()).join('\n') },
  ];

  const sortActions = [
    { label: 'Sort A–Z', fn: (t: string) => t.split('\n').sort((a, b) => a.localeCompare(b)).join('\n') },
    { label: 'Sort Z–A', fn: (t: string) => t.split('\n').sort((a, b) => b.localeCompare(a)).join('\n') },
    { label: 'Sort by length', fn: (t: string) => t.split('\n').sort((a, b) => a.length - b.length).join('\n') },
    { label: 'Sort by word count', fn: (t: string) => t.split('\n').sort((a, b) => extractWords(a).length - extractWords(b).length).join('\n') },
    { label: 'Remove duplicate lines', fn: (t: string) => Array.from(new Set(t.split('\n').map((l) => l.trim()).filter(Boolean))).join('\n') },
  ];

  const reverseActions = [
    { label: 'Reverse characters', fn: (t: string) => t.split('').reverse().join('') },
    { label: 'Reverse words', fn: (t: string) => t.split(/\s+/).reverse().join(' ') },
    { label: 'Reverse lines', fn: (t: string) => t.split('\n').reverse().join('\n') },
  ];

  const spaceActions = [
    { label: 'Remove leading spaces', fn: (t: string) => t.split('\n').map((l) => l.replace(/^[ \t]+/, '')).join('\n') },
    { label: 'Remove trailing spaces', fn: (t: string) => t.split('\n').map((l) => l.replace(/[ \t]+$/, '')).join('\n') },
    { label: 'Collapse multiple spaces', fn: (t: string) => t.replace(/[ \t]{2,}/g, ' ') },
    { label: 'Convert tabs to spaces', fn: (t: string) => t.replace(/\t/g, '    ') },
  ];

  const convertActions = [
    { label: 'To slug', fn: toSlug },
    { label: 'To URL-friendly', fn: (t: string) => encodeURIComponent(toSlug(t)) },
    { label: 'To comma-separated list', fn: (t: string) => t.split(/\n+/).map((l) => l.trim()).filter(Boolean).join(', ') },
    { label: 'To line-separated list', fn: (t: string) => t.split(/(?:,|;|\n)+/).map((l) => l.trim()).filter(Boolean).join('\n') },
    { label: 'To JSON-safe text', fn: (t: string) => JSON.stringify(t) },
    { label: 'To plain text', fn: (t: string) => t.replace(/<[^>]*>/g, '').replace(/[*_`#>]/g, '').replace(/[ \t]{2,}/g, ' ') },
  ];

  const renderActionGrid = (actions: { label: string; fn: (t: string) => string }[]) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
      {actions.map((a) => (
        <Button key={a.label} variant="secondary" className="justify-start text-left" onClick={() => onApply(a.fn, a.label)}>{a.label}</Button>
      ))}
    </div>
  );

  return (
    <section id="tools" className="max-w-7xl mx-auto px-4 sm:px-6 py-10 scroll-mt-20">
      <Card className="p-5 sm:p-7">
        <SectionHeading eyebrow="Writing Tools" title="Format, clean, convert and transform your text"
          description="Every tool works on the text in the editor above. Use undo if you change your mind." />
        <div className="mt-6">
          <Tabs tabs={tabs} active={tab} onChange={setTab} ariaLabel="Writing tools" />
        </div>
        <div className="mt-6">
          {tab === 'format' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {[
                { label: 'UPPERCASE', fn: (t: string) => t.toUpperCase() },
                { label: 'lowercase', fn: (t: string) => t.toLowerCase() },
                { label: 'Title Case', fn: toTitleCase },
                { label: 'Sentence case', fn: toSentenceCase },
                { label: 'Capitalize Each Word', fn: (t: string) => t.replace(/\b\p{L}/gu, (c) => c.toUpperCase()) },
                { label: 'Toggle Case', fn: toToggleCase },
              ].map((a) => (
                <Button key={a.label} variant="secondary" className="justify-start" onClick={() => onApply(a.fn, a.label)}>{a.label}</Button>
              ))}
            </div>
          ) : null}
          {tab === 'clean' ? renderActionGrid(cleanActions) : null}
          {tab === 'convert' ? renderActionGrid(convertActions) : null}
          {tab === 'find' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Field label="Find"><input type="text" value={find} onChange={(e) => setFind(e.target.value)} placeholder="Text to find" /></Field>
              <Field label="Replace with"><input type="text" value={replace} onChange={(e) => setReplace(e.target.value)} placeholder="Replacement text" /></Field>
              <div className="lg:col-span-2 flex flex-wrap items-center gap-4">
                <label className="inline-flex items-center gap-2 text-sm font-medium cursor-pointer" style={{ color: 'var(--text-soft)' }}>
                  <input type="checkbox" checked={caseSensitive} onChange={(e) => setCaseSensitive(e.target.checked)} className="w-4 h-4 rounded" />Case sensitive
                </label>
                <label className="inline-flex items-center gap-2 text-sm font-medium cursor-pointer" style={{ color: 'var(--text-soft)' }}>
                  <input type="checkbox" checked={wholeWord} onChange={(e) => setWholeWord(e.target.checked)} className="w-4 h-4 rounded" />Whole word
                </label>
              </div>
              <div className="lg:col-span-2 flex flex-wrap gap-2">
                <Button variant="secondary" onClick={() => replaceAllInText({ countOnly: true })} icon={<IconSearch className="w-4 h-4" />}>Count matches</Button>
                <Button variant="primary" onClick={() => replaceAllInText()} icon={<IconWand className="w-4 h-4" />}>Replace All</Button>
              </div>
            </div>
          ) : null}
          {tab === 'sort' ? (
            <div className="flex flex-wrap gap-2">
              {sortActions.map((a) => (
                <Button key={a.label} variant="secondary" onClick={() => onApply(a.fn, a.label)}>{a.label}</Button>
              ))}
            </div>
          ) : null}
          {tab === 'reverse' ? renderActionGrid(reverseActions) : null}
          {tab === 'space' ? renderActionGrid(spaceActions) : null}
        </div>
      </Card>
    </section>
  );
};

/* ------------------------------------------------------------------
   SEO TOOLS
   ------------------------------------------------------------------ */

const SeoTools: React.FC<{ basic: BasicStats; deep: DeepStats; text: string }> = ({ basic, text }) => {
  const [primary, setPrimary] = useState('');
  const [secondary, setSecondary] = useState('');
  const [target, setTarget] = useState(1500);
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDesc, setMetaDesc] = useState('');
  const [caption, setCaption] = useState('');

  const primaryCount = useMemo(() => {
    if (!primary.trim()) return 0;
    const p = primary.trim().toLowerCase();
    return basic.wordList.filter((w) => w.toLowerCase() === p).length;
  }, [primary, basic.wordList]);

  const primaryDensity = basic.words ? (primaryCount / basic.words) * 100 : 0;

  const secondaryList = useMemo(() => secondary.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean), [secondary]);
  const secondaryCounts = useMemo(
    () => secondaryList.map((s) => ({ term: s, count: basic.wordList.filter((w) => w.toLowerCase() === s).length })),
    [secondaryList, basic.wordList],
  );

  const inTitle = useMemo(() => {
    if (!primary.trim()) return false;
    const firstHeading = text.match(/^\s{0,3}#{1,6}\s+(.*)$/m);
    return firstHeading ? firstHeading[1].toLowerCase().includes(primary.trim().toLowerCase()) : false;
  }, [primary, text]);

  const recommendations: { status: QualityStatus; text: string }[] = [];
  if (basic.words === 0) {
    recommendations.push({ status: 'warn', text: 'Add content to the editor to receive content recommendations.' });
  } else {
    if (target > 0) {
      if (basic.words >= target) recommendations.push({ status: 'good', text: `Content length meets your target of ${formatNumber(target)} words.` });
      else recommendations.push({ status: 'warn', text: `${formatNumber(target - basic.words)} words remaining to reach your target length.` });
    }
    if (primary.trim()) {
      if (primaryCount === 0) recommendations.push({ status: 'bad', text: `Your primary keyword "${primary}" does not appear in the text yet.` });
      else if (primaryDensity > 3.5) recommendations.push({ status: 'bad', text: `"${primary}" appears at a density of ${primaryDensity.toFixed(2)}%. That may read as keyword stuffing — consider using synonyms.` });
      else recommendations.push({ status: 'good', text: `"${primary}" appears ${primaryCount}× (${primaryDensity.toFixed(2)}% density).` });
      recommendations.push({
        status: inTitle ? 'good' : 'warn',
        text: inTitle ? 'Your primary keyword appears in a heading.' : 'Consider adding your primary keyword to at least one heading.',
      });
    }
    if (basic.avgSentenceLength > 25) recommendations.push({ status: 'warn', text: 'Average sentence length is above 25 words. Shorter sentences are usually easier to scan.' });
    else recommendations.push({ status: 'good', text: 'Average sentence length is within a comfortable range.' });
    if (basic.avgParagraphLength > 150) recommendations.push({ status: 'warn', text: 'Some paragraphs are long. Breaking them up improves readability on mobile.' });
  }

  const statusColor: Record<QualityStatus, string> = { good: 'var(--good)', warn: 'var(--warn)', bad: 'var(--bad)' };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <Card className="p-5 sm:p-7">
        <SectionHeading eyebrow="SEO Writing" title="Content &amp; meta analysis for creators"
          description="Use these checks as guidance while drafting. Search results depend on many factors beyond word count or keyword density, so treat every score as directional rather than a guarantee." />

        <div className="mt-7 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-base font-bold mb-4" style={{ color: 'var(--text)' }}>SEO content analyzer</h3>
            <div className="space-y-4">
              <Field label="Primary keyword"><input type="text" value={primary} onChange={(e) => setPrimary(e.target.value)} placeholder="e.g. word counter" /></Field>
              <Field label="Secondary keywords (comma separated)"><input type="text" value={secondary} onChange={(e) => setSecondary(e.target.value)} placeholder="e.g. character counter, reading time" /></Field>
              <Field label="Target word count"><input type="number" min={0} value={target || ''} onChange={(e) => setTarget(Math.max(0, Number(e.target.value) || 0))} /></Field>
            </div>

            {secondaryCounts.length > 0 ? (
              <ul className="mt-5 space-y-2">
                {secondaryCounts.map((s) => (
                  <li key={s.term} className="flex items-center justify-between text-sm rounded-lg px-3 py-2 border"
                    style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}>
                    <span style={{ color: 'var(--text)' }}>{s.term}</span>
                    <span className="text-xs font-bold" style={{ color: s.count > 0 ? 'var(--good)' : 'var(--muted)' }}>{s.count}×</span>
                  </li>
                ))}
              </ul>
            ) : null}

            <div className="mt-5 space-y-2">
              {recommendations.map((r, i) => (
                <p key={i} className="text-xs leading-relaxed rounded-lg px-3 py-2.5 border-l-2"
                  style={{ color: 'var(--text-soft)', borderColor: statusColor[r.status], background: 'var(--surface-2)' }}>
                  {r.text}
                </p>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-base font-bold mb-4" style={{ color: 'var(--text)' }}>Meta content counter</h3>
            <div className="space-y-4">
              <MetaField label="Meta title" value={metaTitle} onChange={setMetaTitle} min={30} max={60} placeholder="Your page title" />
              <MetaField label="Meta description" value={metaDesc} onChange={setMetaDesc} min={70} max={160} placeholder="Your meta description" />
              <MetaField label="Social caption" value={caption} onChange={setCaption} min={40} max={220} placeholder="Caption for social media" />
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
};

const MetaField: React.FC<{ label: string; value: string; onChange: (v: string) => void; min: number; max: number; placeholder: string }> = ({ label, value, onChange, min, max, placeholder }) => {
  const len = value.length;
  const status: QualityStatus = len === 0 ? 'warn' : len < min ? 'warn' : len <= max ? 'good' : 'bad';
  const colors: Record<QualityStatus, string> = { good: 'var(--good)', warn: 'var(--warn)', bad: 'var(--bad)' };
  return (
    <div>
      <Field label={label}><input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} /></Field>
      <div className="mt-2 flex items-center justify-between gap-3">
        <ProgressBar value={Math.min(len, max)} max={max}
          tone={status === 'good' ? 'good' : status === 'warn' ? 'warn' : 'bad'}
          height="h-1.5" label={`${label} length`} />
        <span className="text-xs font-bold tabular-nums whitespace-nowrap" style={{ color: colors[status] }}>{len}/{max}</span>
      </div>
      <p className="mt-1 text-[0.68rem]" style={{ color: 'var(--muted)' }}>Recommended: {min}–{max} characters</p>
    </div>
  );
};

/* ------------------------------------------------------------------
   SOCIAL COUNTERS
   ------------------------------------------------------------------ */

const SOCIAL_PLATFORMS = [
  { id: 'instagram', name: 'Instagram caption', limit: 2200 },
  { id: 'facebook', name: 'Facebook post', limit: 63206 },
  { id: 'x', name: 'X / Twitter post', limit: 280 },
  { id: 'linkedin', name: 'LinkedIn post', limit: 3000 },
  { id: 'yt-title', name: 'YouTube title', limit: 100 },
  { id: 'yt-desc', name: 'YouTube description', limit: 5000 },
];

const SocialCounters: React.FC<{ text: string }> = ({ text }) => {
  const words = useMemo(() => extractWords(text).length, [text]);
  const chars = text.length;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <Card className="p-5 sm:p-7">
        <SectionHeading eyebrow="Social Media" title="Platform character counters"
          description="Check how your current text fits each platform's limits. Values are based on commonly cited maximum lengths and may change over time." />
        <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SOCIAL_PLATFORMS.map((p) => {
            const remaining = p.limit - chars;
            const over = remaining < 0;
            const pct = Math.min(100, (chars / p.limit) * 100);
            return (
              <div key={p.id} className="rounded-xl p-4 border transition-transform duration-200 hover:-translate-y-1"
                style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}>
                <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>{p.name}</p>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-xl font-extrabold tabular-nums" style={{ color: 'var(--text)' }}>{formatNumber(chars)}</span>
                  <span className="text-xs" style={{ color: 'var(--muted)' }}>/ {formatNumber(p.limit)} characters</span>
                </div>
                <p className="mt-1 text-xs font-semibold tabular-nums" style={{ color: over ? 'var(--bad)' : 'var(--good)' }}>
                  {over ? `${formatNumber(Math.abs(remaining))} over the limit` : `${formatNumber(remaining)} remaining`}
                </p>
                <div className="mt-3">
                  <ProgressBar value={pct} max={100} tone={over ? 'bad' : pct > 85 ? 'warn' : 'accent'} height="h-1.5" label={`${p.name} usage`} />
                </div>
                <p className="mt-2 text-[0.68rem]" style={{ color: 'var(--muted)' }}>{formatNumber(words)} words in the editor</p>
              </div>
            );
          })}
        </div>
      </Card>
    </section>
  );
};

/* ------------------------------------------------------------------
   ACADEMIC TOOLS
   ------------------------------------------------------------------ */

const AcademicTools: React.FC<{ basic: BasicStats }> = ({ basic }) => {
  const [essayLimit, setEssayLimit] = useState(1500);
  const [abstractLimit, setAbstractLimit] = useState(250);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <Card className="p-5 sm:p-7">
        <SectionHeading eyebrow="Academic Writing" title="Essay, thesis and assignment counters"
          description="Set your required limits and see instantly how much you have left to write. All calculations use the text in the editor above." />

        <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="rounded-xl p-5 border" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}>
            <h3 className="text-base font-bold mb-4" style={{ color: 'var(--text)' }}>Essay / assignment / thesis</h3>
            <Field label="Required word count">
              <input type="number" min={0} value={essayLimit || ''} onChange={(e) => setEssayLimit(Math.max(0, Number(e.target.value) || 0))} />
            </Field>
            <dl className="mt-5 space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt style={{ color: 'var(--muted)' }}>Required</dt>
                <dd className="font-bold tabular-nums" style={{ color: 'var(--text)' }}>{formatNumber(essayLimit)} words</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt style={{ color: 'var(--muted)' }}>Current</dt>
                <dd className="font-bold tabular-nums" style={{ color: 'var(--text)' }}>{formatNumber(basic.words)} words</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt style={{ color: 'var(--muted)' }}>{basic.words > essayLimit ? 'Over by' : 'Remaining'}</dt>
                <dd className="font-bold tabular-nums" style={{ color: basic.words > essayLimit ? 'var(--bad)' : 'var(--good)' }}>
                  {formatNumber(Math.abs(essayLimit - basic.words))} words
                </dd>
              </div>
            </dl>
            {essayLimit > 0 ? (
              <div className="mt-4">
                <ProgressBar value={basic.words} max={essayLimit} tone={basic.words > essayLimit ? 'bad' : 'accent'} label="Essay progress" />
              </div>
            ) : null}
          </div>

          <div className="rounded-xl p-5 border" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}>
            <h3 className="text-base font-bold mb-4" style={{ color: 'var(--text)' }}>Abstract / summary counter</h3>
            <Field label="Abstract word limit">
              <input type="number" min={0} value={abstractLimit || ''} onChange={(e) => setAbstractLimit(Math.max(0, Number(e.target.value) || 0))} />
            </Field>
            <dl className="mt-5 space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt style={{ color: 'var(--muted)' }}>Limit</dt>
                <dd className="font-bold tabular-nums" style={{ color: 'var(--text)' }}>{formatNumber(abstractLimit)} words</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt style={{ color: 'var(--muted)' }}>Current text</dt>
                <dd className="font-bold tabular-nums" style={{ color: 'var(--text)' }}>{formatNumber(basic.words)} words</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt style={{ color: 'var(--muted)' }}>Paragraphs</dt>
                <dd className="font-bold tabular-nums" style={{ color: 'var(--text)' }}>{formatNumber(basic.paragraphs)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt style={{ color: 'var(--muted)' }}>Avg. sentence length</dt>
                <dd className="font-bold tabular-nums" style={{ color: 'var(--text)' }}>{basic.avgSentenceLength.toFixed(1)} words</dd>
              </div>
            </dl>
            {abstractLimit > 0 ? (
              <div className="mt-4">
                <ProgressBar value={basic.words} max={abstractLimit} tone={basic.words > abstractLimit ? 'bad' : 'accent'} label="Abstract progress" />
              </div>
            ) : null}
          </div>
        </div>

        <p className="mt-5 text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>
          Citation-friendly statistics: word count {formatNumber(basic.words)}, character count {formatNumber(basic.characters)}, sentence count {formatNumber(basic.sentences)}, paragraph count {formatNumber(basic.paragraphs)}. Always confirm formatting requirements with your institution, as citation styles and limits differ.
        </p>
      </Card>
    </section>
  );
};

/* ------------------------------------------------------------------
   INFORMATIONAL CONTENT
   ------------------------------------------------------------------ */

const CONTENT_H2: React.FC<{ id: string; children: React.ReactNode }> = ({ id, children }) => (
  <h2 id={id} className="text-xl sm:text-2xl font-extrabold mt-10 mb-4 tracking-tight scroll-mt-24" style={{ color: 'var(--text)' }}>{children}</h2>
);
const CONTENT_H3: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 className="text-base sm:text-lg font-bold mt-6 mb-2" style={{ color: 'var(--text)' }}>{children}</h3>
);
const P: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-sm sm:text-[0.95rem] leading-relaxed mb-3" style={{ color: 'var(--muted)' }}>{children}</p>
);

const InfoContent: React.FC = () => (
  <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
    <Card className="p-5 sm:p-9">
      <SectionHeading eyebrow="Learn" title="Understanding word counting and writing analysis"
        description="A practical guide to what these metrics mean, how they are calculated, and how to use them to write better." />

      <AdSlot label="Advertisement" />

      <CONTENT_H2 id="what-is">What is a word counter?</CONTENT_H2>
      <P>
        A word counter is a tool that analyses a piece of text and reports how many words it contains. Modern counters do far more than that: they also measure characters, sentences, paragraphs, reading time, vocabulary variety and readability. The purpose is simple — to give writers an objective view of the shape and size of their text.
      </P>
      <P>
        Word counting matters because almost every form of writing has an expected length. An admissions essay may be capped at 650 words. A university assignment may require 2,000 words. A blog post that performs well might sit somewhere between 1,200 and 2,000 words. A meta description needs to fit inside roughly 160 characters. Knowing your count while you write removes guesswork and lets you focus on the content.
      </P>
      <CONTENT_H3>Who uses a word counter?</CONTENT_H3>
      <ul className="list-disc pl-5 space-y-2 text-sm leading-relaxed mb-3" style={{ color: 'var(--muted)' }}>
        <li><strong style={{ color: 'var(--text)' }}>Students</strong> — to meet strict assignment, dissertation and application limits.</li>
        <li><strong style={{ color: 'var(--text)' }}>Writers and authors</strong> — to track daily output and keep chapters consistent in length.</li>
        <li><strong style={{ color: 'var(--text)' }}>Bloggers</strong> — to plan articles and keep posts within a comfortable reading length.</li>
        <li><strong style={{ color: 'var(--text)' }}>SEO professionals</strong> — to review content depth and keep an eye on keyword density without over-optimising.</li>
        <li><strong style={{ color: 'var(--text)' }}>Journalists</strong> — to hit exact column inches and word budgets under deadline.</li>
        <li><strong style={{ color: 'var(--text)' }}>Social media creators</strong> — to stay within caption and post limits.</li>
        <li><strong style={{ color: 'var(--text)' }}>Business professionals</strong> — to keep reports, proposals and emails concise.</li>
      </ul>

      <CONTENT_H2 id="why">Why use an advanced word counter?</CONTENT_H2>
      <P>
        A basic count tells you how long your text is. An advanced counter tells you how it reads. That difference matters, because a piece can hit its target word count and still be difficult, repetitive or poorly paced.
      </P>
      <ul className="list-disc pl-5 space-y-2 text-sm leading-relaxed mb-3" style={{ color: 'var(--muted)' }}>
        <li><strong style={{ color: 'var(--text)' }}>Length control</strong> — hit minimum and maximum requirements without manual counting.</li>
        <li><strong style={{ color: 'var(--text)' }}>Time awareness</strong> — reading and speaking estimates help you judge how long your content takes to consume or deliver.</li>
        <li><strong style={{ color: 'var(--text)' }}>Vocabulary insight</strong> — unique word counts and frequency tables reveal repetition you may not notice while drafting.</li>
        <li><strong style={{ color: 'var(--text)' }}>Readability feedback</strong> — sentence length and syllable data highlight passages that may be harder to follow than intended.</li>
        <li><strong style={{ color: 'var(--text)' }}>Goal tracking</strong> — progress bars make large writing tasks feel manageable.</li>
        <li><strong style={{ color: 'var(--text)' }}>Privacy</strong> — a browser-based tool keeps unpublished work on your own device.</li>
      </ul>

      <CONTENT_H2 id="how-to-use">How to use this word counter</CONTENT_H2>
      <P>
        Everything on this page runs in real time. Type or paste text into the editor and every panel updates automatically — there is no button to press and no page to reload.
      </P>
      <CONTENT_H3>1. Add your text</CONTENT_H3>
      <P>Click into the editor and start typing, or paste text you have already written. Your work is auto-saved to your browser&apos;s local storage, so it will still be here if you refresh the page.</P>
      <CONTENT_H3>2. Read the statistics dashboard</CONTENT_H3>
      <P>The cards below the editor show words, characters, characters without spaces, sentences, paragraphs, lines, unique words and headings. Scroll further for averages, syllable data and readability scores.</P>
      <CONTENT_H3>3. Set a goal</CONTENT_H3>
      <P>Use the goal tracker to enter a target word or character count. A progress bar shows how far you have come and how much remains.</P>
      <CONTENT_H3>4. Review keywords and readability</CONTENT_H3>
      <P>The keyword panel lists your most-used words with density percentages. The readability panel converts sentence length and syllable data into familiar scores such as Flesch Reading Ease.</P>
      <CONTENT_H3>5. Use the writing tools</CONTENT_H3>
      <P>The writing tools section can change case, clean spacing, remove duplicates, find and replace, sort lines and convert your text into formats such as slugs or comma-separated lists.</P>
      <CONTENT_H3>6. Export your work</CONTENT_H3>
      <P>Copy the text to your clipboard or download it as TXT, JSON, HTML, Markdown or CSV. All exports are generated locally.</P>

      <CONTENT_H2 id="how-counted">How word count is calculated</CONTENT_H2>
      <P>Different tools define &quot;word&quot; slightly differently, so it helps to know what is being measured here.</P>
      <ul className="list-disc pl-5 space-y-2 text-sm leading-relaxed mb-3" style={{ color: 'var(--muted)' }}>
        <li><strong style={{ color: 'var(--text)' }}>Words</strong> — sequences of letters or numbers, optionally joined by an apostrophe or hyphen. Numbers count as words.</li>
        <li><strong style={{ color: 'var(--text)' }}>Characters</strong> — every character in the text, including spaces, punctuation and line breaks.</li>
        <li><strong style={{ color: 'var(--text)' }}>Characters without spaces</strong> — the same total with all whitespace removed.</li>
        <li><strong style={{ color: 'var(--text)' }}>Sentences</strong> — runs of text ending in a full stop, question mark, exclamation mark or ellipsis.</li>
        <li><strong style={{ color: 'var(--text)' }}>Paragraphs</strong> — blocks of text separated by a blank line.</li>
        <li><strong style={{ color: 'var(--text)' }}>Lines</strong> — the number of line breaks plus one, matching how an editor displays the text.</li>
        <li><strong style={{ color: 'var(--text)' }}>Unique words</strong> — the number of distinct words after converting everything to lowercase, so &quot;The&quot; and &quot;the&quot; count once.</li>
        <li><strong style={{ color: 'var(--text)' }}>Headings</strong> — lines written in Markdown heading style, such as &quot;## Section title&quot;.</li>
      </ul>

      <CONTENT_H2 id="reading-time">How reading time is calculated</CONTENT_H2>
      <P>Reading time is estimated by dividing the word count by a words-per-minute (WPM) figure. Most adults read general web content at roughly 200 to 250 WPM, so 200 WPM is used as the default here. You can switch to a slow, average or fast preset, or enter your own value in the reading speed field.</P>
      <P>Keep in mind that reading speed varies enormously with subject matter. Technical documentation, legal text and academic papers are read far more slowly than casual blog posts, so treat the estimate as a rough guide.</P>

      <CONTENT_H2 id="speaking-time">How speaking time is calculated</CONTENT_H2>
      <P>Speaking time uses the same formula with a lower default speed of 130 WPM, which reflects a comfortable presentation pace. News anchors often speak faster, around 150 to 180 WPM, while a careful public speaker may slow to 100 WPM for emphasis. Adjust the speaking speed field to match your own delivery style.</P>

      <CONTENT_H2 id="keyword-density">What is keyword density?</CONTENT_H2>
      <P>Keyword density is the percentage of your total words made up by a particular word or phrase. If a 500-word article contains the phrase &quot;word counter&quot; five times, that phrase accounts for roughly one percent of the text.</P>
      <P>Density is a descriptive metric, not a target. There is no magic percentage that guarantees better visibility in search engines, and writing to a density number usually produces awkward, repetitive prose. Search engines have long since moved beyond simple keyword frequency. The useful application of density analysis is the reverse: if a word shows up far more often than you expected, that is a signal to reach for a synonym or restructure a sentence.</P>

      <CONTENT_H2 id="readability">What is readability?</CONTENT_H2>
      <P>Readability formulas estimate how easy a passage is to read. The most widely used is Flesch Reading Ease, which combines average sentence length with average syllables per word to produce a score between 0 and 100. Higher scores mean easier text. The Flesch–Kincaid Grade Level uses the same inputs to estimate the US school grade at which the text could be understood.</P>
      <P>These formulas are useful because they are quick, transparent and consistent. They are also limited: they measure surface features, not meaning. A short sentence full of unfamiliar jargon can score as &quot;easy&quot; even though readers struggle with it. Use the scores to spot patterns — long sentences, dense vocabulary — rather than as a verdict on your writing.</P>

      <CONTENT_H2 id="content-lengths">Word count for different content types</CONTENT_H2>
      <P>The ranges below are common conventions rather than rules. Always follow the requirements of your assignment, editor or platform first.</P>
      <div className="overflow-x-auto scroll-thin rounded-xl border" style={{ borderColor: 'var(--border)' }}>
        <table className="w-full text-sm min-w-[560px]">
          <caption className="sr-only">Typical word count ranges for different content types</caption>
          <thead>
            <tr style={{ background: 'var(--surface-2)' }}>
              {['Content type', 'Typical length', 'Notes'].map((h) => (
                <th key={h} scope="col" className="text-left px-4 py-3 font-bold text-xs uppercase tracking-wider" style={{ color: 'var(--muted)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ['Blog post', '1,200 – 2,000 words', 'Longer posts can cover a topic in depth, but quality matters more than length.'],
              ['Essay', '500 – 3,000 words', 'Usually defined by the assignment brief.'],
              ['Assignment', '1,000 – 5,000 words', 'Check your rubric for exact limits and tolerances.'],
              ['YouTube description', '150 – 400 words', 'Only the first few lines appear above the fold.'],
              ['Social media post', '10 – 100 words', 'Platform limits are usually expressed in characters.'],
              ['Product description', '50 – 300 words', 'Focus on benefits and specifics rather than padding.'],
              ['News article', '300 – 800 words', 'Inverted pyramid structure favours concise reporting.'],
              ['Email', '50 – 200 words', 'Shorter emails generally get faster replies.'],
              ['Academic paper', '3,000 – 10,000 words', 'Structure and citation requirements matter most.'],
            ].map(([type, range, note]) => (
              <tr key={type} className="border-t" style={{ borderColor: 'var(--border)' }}>
                <td className="px-4 py-3 font-semibold" style={{ color: 'var(--text)' }}>{type}</td>
                <td className="px-4 py-3 tabular-nums" style={{ color: 'var(--muted)' }}>{range}</td>
                <td className="px-4 py-3" style={{ color: 'var(--muted)' }}>{note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AdSlot label="Advertisement" />
    </Card>
  </section>
);

const AdSlot: React.FC<{ label: string }> = ({ label }) => (
  <div className="my-8 rounded-xl border border-dashed grid place-items-center text-xs font-semibold uppercase tracking-widest"
    style={{ borderColor: 'var(--border-strong)', color: 'var(--muted)', minHeight: '90px', background: 'var(--surface-2)' }} aria-hidden="true">
    {label}
  </div>
);

/* ------------------------------------------------------------------
   USER GUIDE
   ------------------------------------------------------------------ */

const GUIDE_STEPS: { title: string; body: string }[] = [
  { title: 'Enter your text', body: 'Click into the large editor and start typing, or paste existing text with Ctrl+V (Cmd+V on Mac). The editor accepts documents of any practical length.' },
  { title: 'Read your word count', body: 'The word total appears in the statistics dashboard and in the bar directly beneath the editor. It recalculates on every keystroke.' },
  { title: 'Check characters', body: 'Two character figures are shown: the total including spaces, and the total excluding spaces. The second is useful for fields with strict character limits.' },
  { title: 'Count sentences', body: 'Sentences are detected by terminal punctuation. The average sentence length card shows how your sentences compare to the 15–25 word range most readers find comfortable.' },
  { title: 'Count paragraphs', body: 'Paragraphs are blocks separated by a blank line. The average paragraph length card helps you spot walls of text that could be broken up.' },
  { title: 'Estimate reading time', body: 'Reading time divides your word count by the reading speed field, which defaults to 200 words per minute. Choose a preset or enter your own.' },
  { title: 'Estimate speaking time', body: 'Speaking time uses the same formula with a lower default speed of 130 words per minute, matching a comfortable presentation pace.' },
  { title: 'Set writing goals', body: 'Enter a word or character goal in the goal tracker. A progress bar shows your percentage complete and the number of words remaining.' },
  { title: 'Analyse keywords', body: 'The keyword panel lists your most frequent words with counts and density percentages. Filter out common words, set a minimum length, and switch between top 10 and top 20 views.' },
  { title: 'Check readability', body: 'Flesch Reading Ease and Flesch–Kincaid Grade scores appear in the readability panel, along with average syllables per word and the percentage of complex words.' },
  { title: 'Find repeated words', body: 'The repeated words list highlights terms used three or more times. Use it to vary your vocabulary where repetition is not intentional.' },
  { title: 'Clean your text', body: 'The Cleaner tab removes extra spaces, blank lines, duplicate lines, duplicate sentences, HTML tags and more.' },
  { title: 'Format your text', body: 'The Formatter tab converts text to uppercase, lowercase, title case, sentence case, capitalised words or toggled case.' },
  { title: 'Find and replace', body: 'Enter a search term and a replacement, then choose Replace All. Enable case sensitivity or whole-word matching for precise control.' },
  { title: 'Sort text', body: 'The Sorting tab arranges lines alphabetically, by length or by word count, and can remove duplicate lines entirely.' },
  { title: 'Convert text', body: 'The Converter tab turns text into a URL slug, a URL-encoded string, a comma-separated list, a line-separated list, JSON-safe text or plain text.' },
  { title: 'Export your text', body: 'Use the export panel to copy to your clipboard or download your content as TXT, JSON, HTML, Markdown or CSV. All files are generated in your browser.' },
  { title: 'Use fullscreen mode', body: 'Click the expand icon in the editor toolbar to enter fullscreen. Press Escape to leave it.' },
  { title: 'Switch theme', body: 'Use the theme button in the header to cycle between light, dark and system modes. Your choice is remembered on this device.' },
  { title: 'Clear saved data', body: 'The privacy panel and the editor settings both include a button that removes everything this tool has stored in your browser.' },
];

const UserGuide: React.FC = () => (
  <section id="guide" className="max-w-5xl mx-auto px-4 sm:px-6 py-12 scroll-mt-20">
    <Card className="p-5 sm:p-9">
      <SectionHeading eyebrow="User Guide" title="How to use our advanced word counter" description="Twenty short steps covering every feature on this page." />
      <ol className="mt-8 space-y-4 list-none p-0">
        {GUIDE_STEPS.map((s, i) => (
          <li key={s.title} className="flex gap-4">
            <span className="shrink-0 grid place-items-center w-8 h-8 rounded-full text-xs font-extrabold text-white"
              style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))' }} aria-hidden="true">{i + 1}</span>
            <div>
              <h3 className="font-bold text-sm sm:text-base" style={{ color: 'var(--text)' }}>{s.title}</h3>
              <p className="mt-1 text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{s.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </Card>
  </section>
);

/* ------------------------------------------------------------------
   FAQ
   ------------------------------------------------------------------ */

const FAQ_ITEMS: { q: string; a: string }[] = [
  { q: 'What is a word counter?', a: 'A word counter is a tool that analyses text and reports how many words it contains. Advanced counters also measure characters, sentences, paragraphs, reading time, vocabulary variety and readability so you can judge both the length and the quality of a piece of writing.' },
  { q: 'Is this word counter free to use?', a: 'Yes. The entire tool is free, requires no account and has no usage limits. All processing happens in your browser, so there is no server cost to pass on to you.' },
  { q: 'Does it count characters as well as words?', a: 'It does. You will see the total character count including spaces, and a second figure that excludes spaces. The second number is especially useful for meta descriptions, social captions and form fields with strict limits.' },
  { q: 'Does it count spaces?', a: 'The main character count includes spaces, tabs and line breaks. A separate "characters without spaces" figure is provided so you can see both numbers at once.' },
  { q: 'Is my text stored anywhere?', a: 'Your text never leaves your browser. It is not uploaded, transmitted or stored on any server. If you leave auto-save enabled, the text is written to your own device\u2019s local storage so it survives a refresh. You can erase it at any time with the clear-data buttons.' },
  { q: 'Does the tool work offline?', a: 'Once the page has loaded, all counting and analysis run in JavaScript on your device, so the core features continue to work without an internet connection. Only the initial page load requires a network connection.' },
  { q: 'How is reading time calculated?', a: 'Reading time divides your word count by a words-per-minute value. The default is 200 WPM, which matches typical adult reading speed for general web content. You can switch to slow, average or fast presets, or type your own WPM value.' },
  { q: 'How is speaking time calculated?', a: 'Speaking time uses the same formula with a lower default speed of 130 WPM, which reflects a comfortable presentation pace. Broadcasters often speak faster and careful public speakers slower, so the speed field is adjustable.' },
  { q: 'What is keyword density?', a: 'Keyword density is the share of your total words taken up by a particular word or phrase, expressed as a percentage. It is a descriptive measure rather than a target — unusually high density usually signals repetition that could be varied with synonyms.' },
  { q: 'Can I check readability?', a: 'Yes. The readability panel calculates Flesch Reading Ease, the Flesch\u2013Kincaid Grade Level, average syllables per word and the percentage of complex words. Each score comes with a plain-language interpretation.' },
  { q: 'Can I set a word limit or goal?', a: 'You can set both a word goal and a character goal in the goal tracker. A progress bar shows the percentage complete and the number remaining. You can also set a character limit in the editor settings, which highlights the editor border when you exceed it.' },
  { q: 'Can I download my text?', a: 'Yes. The export panel lets you download your content as TXT, JSON, HTML, Markdown or CSV (for keyword data). You can also copy everything to your clipboard or send it to your printer. All files are generated locally in your browser.' },
  { q: 'Can I use this tool for essays and assignments?', a: 'Absolutely. The academic section lets you enter a required word count and see how many words you have written, how many remain, and whether you have gone over. Students commonly use it for essays, theses, abstracts and applications.' },
  { q: 'Can I use it for SEO content?', a: 'Yes. The SEO content analyzer checks keyword usage, density and heading placement, and compares your draft against a target word count. Treat the results as guidance: search performance depends on usefulness, accuracy, links and many other factors, not on word count alone.' },
  { q: 'Does it work on mobile devices?', a: 'The layout is designed mobile-first and works on screens as narrow as 320 pixels. The editor, statistics cards, tables and navigation all adapt, and touch targets are sized for comfortable tapping.' },
  { q: 'Does it support very long documents?', a: 'The editor handles long documents, but extremely large files (tens of thousands of words) may slow down the more detailed analyses. Expensive calculations are debounced so typing stays responsive even as the deeper analysis catches up.' },
  { q: 'Does punctuation count as words?', a: 'No. Punctuation is not counted as a word, but it is counted as a character. Numbers are treated as words, since they are meaningful units in most writing contexts.' },
  { q: 'What is the difference between words and unique words?', a: 'Total words counts every occurrence. Unique words counts each distinct word once, ignoring case. A 500-word article might contain 300 unique words, which tells you something useful about vocabulary variety.' },
  { q: 'Can I remove duplicate words, lines or sentences?', a: 'Yes. The writing tools section includes options to remove duplicate lines and duplicate sentences, and the keyword panel highlights words you have used repeatedly. Always review the result — repetition is sometimes deliberate.' },
  { q: 'Is this tool suitable for professional writers?', a: 'It is built for anyone who writes regularly, including professional writers, editors, journalists, marketers and academics. It provides objective data about length, pacing, vocabulary and readability, which complements — but never replaces — editorial judgement.' },
];

const FaqSection: React.FC = () => (
  <section id="faq" className="max-w-5xl mx-auto px-4 sm:px-6 py-12 scroll-mt-20">
    <SectionHeading eyebrow="FAQ" title="Frequently asked questions"
      description="Everything you might want to know about the word counter, the writing tools and how your data is handled." center />
    <div className="mt-8">
      <Accordion items={FAQ_ITEMS.map((f) => ({ q: f.q, a: <p>{f.a}</p> }))} />
    </div>
  </section>
);

/* ------------------------------------------------------------------
   OTHER TOOLS
   ------------------------------------------------------------------ */

interface ToolCard { name: string; description: string; href: string; icon: React.ReactNode }

const TOOL_CARDS: ToolCard[] = [
  { name: 'Character Counter', description: 'Count characters with and without spaces.', href: '#/tools/character-counter', icon: <IconType className="w-5 h-5" /> },
  { name: 'Sentence Counter', description: 'Measure sentence count and average length.', href: '#/tools/sentence-counter', icon: <IconAlignLeft className="w-5 h-5" /> },
  { name: 'Paragraph Counter', description: 'Count paragraphs and average paragraph size.', href: '#/tools/paragraph-counter', icon: <IconLayers className="w-5 h-5" /> },
  { name: 'Readability Checker', description: 'Flesch and grade-level readability scores.', href: '#/tools/readability-checker', icon: <IconBook className="w-5 h-5" /> },
  { name: 'Keyword Density Checker', description: 'Top keywords with frequency and density.', href: '#/tools/keyword-density', icon: <IconKey className="w-5 h-5" /> },
  { name: 'Text Case Converter', description: 'Uppercase, lowercase, title and sentence case.', href: '#/tools/case-converter', icon: <IconType className="w-5 h-5" /> },
  { name: 'Text Cleaner', description: 'Remove extra spaces, tags and duplicates.', href: '#/tools/text-cleaner', icon: <IconWand className="w-5 h-5" /> },
  { name: 'Find & Replace', description: 'Search and replace with case options.', href: '#/tools/find-replace', icon: <IconSearch className="w-5 h-5" /> },
  { name: 'Duplicate Line Remover', description: 'Strip repeated lines from any list.', href: '#/tools/duplicate-line-remover', icon: <IconList className="w-5 h-5" /> },
  { name: 'Lorem Ipsum Generator', description: 'Generate placeholder text for layouts.', href: '#/tools/lorem-ipsum', icon: <IconText className="w-5 h-5" /> },
  { name: 'Meta Tag Generator', description: 'Build title and description meta tags.', href: '#/tools/meta-tag-generator', icon: <IconTag className="w-5 h-5" /> },
  { name: 'Title Generator', description: 'Draft headline ideas for your content.', href: '#/tools/title-generator', icon: <IconHeading className="w-5 h-5" /> },
  { name: 'Description Generator', description: 'Create meta description drafts.', href: '#/tools/description-generator', icon: <IconFileText className="w-5 h-5" /> },
  { name: 'Slug Generator', description: 'Turn titles into clean URL slugs.', href: '#/tools/slug-generator', icon: <IconLink className="w-5 h-5" /> },
  { name: 'JSON Formatter', description: 'Format and validate JSON data.', href: '#/tools/json-formatter', icon: <IconBraces className="w-5 h-5" /> },
  { name: 'Image Compressor', description: 'Reduce image file size in the browser.', href: '#/tools/image-compressor', icon: <IconImage className="w-5 h-5" /> },
  { name: 'QR Code Generator', description: 'Create QR codes for links and text.', href: '#/tools/qr-code-generator', icon: <IconQr className="w-5 h-5" /> },
  { name: 'Percentage Calculator', description: 'Work out percentages and differences.', href: '#/tools/percentage-calculator', icon: <IconPercent className="w-5 h-5" /> },
];

const OtherTools: React.FC = () => (
  <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
    <SectionHeading eyebrow="More Tools" title="Other useful tools"
      description="Related utilities for writers, students and content creators." center />
    <div className="mt-9 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {TOOL_CARDS.map((t) => (
        <Card key={t.name} className="p-5 flex flex-col transition-transform duration-300 hover:-translate-y-1.5">
          <span className="grid place-items-center w-10 h-10 rounded-xl mb-3" style={{ background: 'var(--surface-strong)', color: 'var(--accent)' }} aria-hidden="true">
            {t.icon}
          </span>
          <h3 className="font-bold text-sm" style={{ color: 'var(--text)' }}>{t.name}</h3>
          <p className="mt-1.5 text-xs leading-relaxed flex-1" style={{ color: 'var(--muted)' }}>{t.description}</p>
          <a href={t.href} className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold transition-transform duration-200 hover:translate-x-0.5" style={{ color: 'var(--accent-2)' }}>
            Use Tool
            <IconArrowRight className="w-3.5 h-3.5" />
          </a>
        </Card>
      ))}
    </div>
  </section>
);

/* ------------------------------------------------------------------
   FOOTER
   ------------------------------------------------------------------ */

const FOOTER_COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  { title: 'Product', links: [
    { label: 'Word Counter', href: '#counter' },
    { label: 'Writing Tools', href: '#tools' },
    { label: 'Readability', href: '#features' },
    { label: 'Keyword Analyzer', href: '#features' },
  ]},
  { title: 'Resources', links: [
    { label: 'User Guide', href: '#guide' },
    { label: 'Blog', href: '#/blog' },
    { label: 'FAQ', href: '#faq' },
    { label: 'Writing Tips', href: '#/writing-tips' },
  ]},
  { title: 'Legal', links: [
    { label: 'Privacy Policy', href: '#/privacy-policy' },
    { label: 'Terms & Conditions', href: '#/terms' },
    { label: 'Disclaimer', href: '#/disclaimer' },
    { label: 'Cookie Policy', href: '#/cookies' },
  ]},
  { title: 'Company', links: [
    { label: 'About', href: '#/about' },
    { label: 'Contact', href: '#contact' },
  ]},
];

const Footer: React.FC = () => (
  <footer id="contact" className="mt-10 border-t scroll-mt-20"
    style={{ borderColor: 'var(--border)', background: 'var(--surface-2)', backdropFilter: 'blur(16px)' }}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8">
        <div className="col-span-2">
          <div className="flex items-center gap-2.5">
            <span className="grid place-items-center w-9 h-9 rounded-xl text-white" style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))' }}>
              <IconType className="w-5 h-5" />
            </span>
            <span className="font-extrabold text-base" style={{ color: 'var(--text)' }}>{BRAND}</span>
          </div>
          <p className="mt-4 text-sm leading-relaxed max-w-xs" style={{ color: 'var(--muted)' }}>
            A free, private, browser-based word counter and writing assistant for students, writers, bloggers and content professionals.
          </p>
          <p className="mt-4 inline-flex items-center gap-2 text-xs font-semibold" style={{ color: 'var(--accent-2)' }}>
            <IconShield className="w-4 h-4" />
            Your text stays in your browser.
          </p>
        </div>
        {FOOTER_COLUMNS.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h3 className="text-xs font-extrabold uppercase tracking-widest mb-4" style={{ color: 'var(--text)' }}>{col.title}</h3>
            <ul className="space-y-2.5 list-none p-0 m-0">
              {col.links.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="text-sm transition-colors duration-200" style={{ color: 'var(--muted)' }}>{l.label}</a>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="mt-10 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderColor: 'var(--border)' }}>
        <p className="text-xs" style={{ color: 'var(--muted)' }}>© 2026 {BRAND}. All rights reserved.</p>
        <p className="text-xs" style={{ color: 'var(--muted)' }}>Built with Next.js and TypeScript · No account required</p>
      </div>
    </div>
  </footer>
);
