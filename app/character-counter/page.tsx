"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

/* ════════════════════════════════════════════════════════════════════════
   TYPES
   ════════════════════════════════════════════════════════════════════════ */
interface TextStats {
  characters: number; charsNoSpace: number; utf8: number; utf16: number;
  letters: number; upper: number; lower: number; digits: number;
  spaces: number; tabs: number; newlines: number; punct: number;
  symbols: number; emojis: number; uniqueChars: number;
  words: number; uniqueWords: number; sentences: number;
  paragraphs: number; lines: number; avgWordLen: number;
  longestWord: string; shortestWord: string; avgSentenceLen: number;
}
interface KeywordRow { keyword: string; count: number; density: number; n: number; }
interface ReadResult {
  flesch: number; fk: number; fog: number; asl: number; asw: number;
  complex: number; label: string;
}
interface QualityIssue { sev: "info" | "warn" | "err"; title: string; detail: string; }
interface PlatformLimit { id: string; name: string; limit: number; custom?: boolean; }

/* ════════════════════════════════════════════════════════════════════════
   UNICODE HELPERS (Intl.Segmenter with safe fallback)
   ════════════════════════════════════════════════════════════════════════ */
type SegLike = { segment(s: string): Iterable<{ segment: string }> };
const SegCtor = (Intl as unknown as {
  Segmenter?: new (loc: string, o: { granularity: "grapheme" }) => SegLike;
}).Segmenter;
const graphemeSeg: SegLike | null = SegCtor
  ? new SegCtor("en", { granularity: "grapheme" })
  : null;

function toGraphemes(s: string): string[] {
  if (!s) return [];
  if (graphemeSeg) {
    const out: string[] = [];
    for (const g of graphemeSeg.segment(s)) out.push(g.segment);
    return out;
  }
  return Array.from(s);
}

/** Emoji codepoint ranges — covers emoticons, symbols, flags, pictographs. */
function isEmojiCp(cp: number): boolean {
  return (
    (cp >= 0x1f000 && cp <= 0x1f02f) ||
    (cp >= 0x1f0a0 && cp <= 0x1f0ff) ||
    (cp >= 0x1f1e6 && cp <= 0x1f1ff) ||
    (cp >= 0x1f300 && cp <= 0x1f5ff) ||
    (cp >= 0x1f600 && cp <= 0x1f64f) ||
    (cp >= 0x1f680 && cp <= 0x1f6ff) ||
    (cp >= 0x1f700 && cp <= 0x1f77f) ||
    (cp >= 0x1f780 && cp <= 0x1f7ff) ||
    (cp >= 0x1f800 && cp <= 0x1f8ff) ||
    (cp >= 0x1f900 && cp <= 0x1f9ff) ||
    (cp >= 0x1fa00 && cp <= 0x1fa6f) ||
    (cp >= 0x1fa70 && cp <= 0x1faff) ||
    (cp >= 0x2600 && cp <= 0x26ff) ||
    (cp >= 0x2700 && cp <= 0x27bf) ||
    (cp >= 0x2b00 && cp <= 0x2bff)
  );
}

/** Count emojis. A flag pair (2 regional indicators) counts as 1. */
function countEmoji(text: string): number {
  if (!text) return 0;
  let count = 0;
  for (const g of toGraphemes(text)) {
    const cps = Array.from(g, (c) => c.codePointAt(0) ?? 0);
    if (cps.some(isEmojiCp)) count++;
  }
  return count;
}
function stripEmoji(text: string): string {
  return toGraphemes(text)
    .filter((g) => {
      const cps = Array.from(g, (c) => c.codePointAt(0) ?? 0);
      return !cps.some(isEmojiCp);
    })
    .join("");
}

const RE_LETTER = /\p{L}/u, RE_UPPER = /\p{Lu}/u, RE_LOWER = /\p{Ll}/u;
const RE_DIGIT = /\p{N}/u, RE_PUNCT = /\p{P}/u, RE_SYMBOL = /\p{S}/u;
const RE_WS = /\s/u;
const WORD_RE = /[\p{L}\p{N}\p{M}]+(?:['’-][\p{L}\p{N}\p{M}]+)*/gu;

function extractWords(t: string): string[] {
  return t ? t.match(WORD_RE) ?? [] : [];
}
function countSentences(t: string): number {
  const s = t.trim();
  if (!s) return 0;
  return Math.max(1, s.split(/[.!?…।]+/).filter((p) => p.trim()).length);
}
function countParas(t: string): number {
  if (!t.trim()) return 0;
  return t.split(/\n\s*\n/).filter((p) => p.trim()).length;
}
function countLines(t: string): number {
  return t ? t.split(/\r\n|\r|\n/).length : 0;
}

/* ════════════════════════════════════════════════════════════════════════
   ANALYSIS
   ════════════════════════════════════════════════════════════════════════ */
function analyzeText(text: string): TextStats {
  const gs = toGraphemes(text);
  let letters = 0, upper = 0, lower = 0, digits = 0;
  let spaces = 0, tabs = 0, newlines = 0, otherWs = 0;
  let punct = 0, symbols = 0;
  const uniq = new Set<string>();
  for (const g of gs) {
    uniq.add(g);
    if (g === " ") spaces++;
    else if (g === "\t") tabs++;
    else if (g === "\n" || g === "\r") newlines++;
    else if (RE_WS.test(g)) otherWs++;
    else if (RE_LETTER.test(g)) {
      letters++;
      if (RE_UPPER.test(g)) upper++;
      else if (RE_LOWER.test(g)) lower++;
    } else if (RE_DIGIT.test(g)) digits++;
    else if (RE_PUNCT.test(g)) punct++;
    else if (RE_SYMBOL.test(g)) symbols++;
  }
  const whitespace = spaces + tabs + newlines + otherWs;
  const words = extractWords(text);
  const lowerWords = words.map((w) => w.toLowerCase());
  const lens = words.map((w) => toGraphemes(w).length);
  const totalLen = lens.reduce((a, b) => a + b, 0);

  let longestWord = "", shortestWord = "";
  if (words.length) {
    let max = -1, min = Infinity;
    words.forEach((w, i) => {
      if (lens[i] > max) { max = lens[i]; longestWord = w; }
      if (lens[i] < min) { min = lens[i]; shortestWord = w; }
    });
  }
  const sentences = countSentences(text);
  const utf8 = typeof TextEncoder !== "undefined"
    ? new TextEncoder().encode(text).length
    : text.length;

  return {
    characters: gs.length,
    charsNoSpace: gs.length - whitespace,
    utf8, utf16: text.length,
    letters, upper, lower, digits,
    spaces, tabs, newlines, punct,
    symbols, emojis: countEmoji(text),
    uniqueChars: uniq.size,
    words: words.length,
    uniqueWords: new Set(lowerWords).size,
    sentences,
    paragraphs: countParas(text),
    lines: countLines(text),
    avgWordLen: words.length ? +(totalLen / words.length).toFixed(2) : 0,
    longestWord, shortestWord,
    avgSentenceLen: sentences ? +(words.length / sentences).toFixed(2) : 0,
  };
}

function countSyllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!w) return 1;
  if (w.length <= 3) return 1;
  const stripped = w
    .replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "")
    .replace(/^y/, "");
  const m = stripped.match(/[aeiouy]{1,2}/g);
  return m ? m.length : 1;
}

function analyzeReadability(text: string): ReadResult | null {
  const words = extractWords(text);
  const wc = words.length;
  const sc = countSentences(text);
  if (wc < 20) return null;
  let syl = 0, complex = 0, letters = 0;
  for (const w of words) {
    const s = countSyllables(w);
    syl += s;
    if (s >= 3) complex++;
    letters += toGraphemes(w).length;
  }
  const asl = wc / sc;
  const asw = syl / wc;
  const flesch = 206.835 - 1.015 * asl - 84.6 * asw;
  const fk = 0.39 * asl + 11.8 * asw - 15.59;
  const fog = 0.4 * (asl + 100 * (complex / wc));
  const label =
    flesch >= 90 ? "Very Easy" :
    flesch >= 80 ? "Easy" :
    flesch >= 70 ? "Fairly Easy" :
    flesch >= 60 ? "Standard" :
    flesch >= 50 ? "Fairly Difficult" :
    flesch >= 30 ? "Difficult" : "Very Difficult";
  return {
    flesch: +flesch.toFixed(1), fk: +fk.toFixed(1), fog: +fog.toFixed(1),
    asl: +asl.toFixed(2), asw: +(letters / wc).toFixed(2),
    complex, label,
  };
}

const STOP_WORDS = new Set([
  "a","about","above","after","again","against","all","am","an","and","any","are","as","at",
  "be","because","been","before","being","below","between","both","but","by","can","cannot",
  "could","did","do","does","doing","down","during","each","few","for","from","further","had",
  "has","have","having","he","her","here","hers","herself","him","himself","his","how","i",
  "if","in","into","is","it","its","itself","just","me","more","most","my","myself","no",
  "nor","not","now","of","off","on","once","only","or","other","our","ours","ourselves","out",
  "over","own","same","she","should","so","some","such","than","that","the","their","theirs",
  "them","themselves","then","there","these","they","this","those","through","to","too","under",
  "until","up","very","was","we","were","what","when","where","which","while","who","whom","why",
  "will","with","you","your","yours","yourself","yourselves",
  "है","का","के","की","और","में","से","को","पर","यह","वह","एक","था","थी","थे",
]);

function analyzeKeywords(
  text: string,
  opts: { ignoreStop: boolean; caseSensitive: boolean; customStop: string; }
): KeywordRow[] {
  const raw = extractWords(text);
  if (!raw.length) return [];
  const norm = (w: string) => (opts.caseSensitive ? w : w.toLowerCase());
  const stop = new Set<string>();
  if (opts.ignoreStop) {
    STOP_WORDS.forEach((w) => stop.add(norm(w)));
    opts.customStop.split(/[,\n]/).forEach((w) => {
      const t = w.trim();
      if (t) stop.add(norm(t));
    });
  }
  const tokens = raw.map(norm).filter((w) => !stop.has(w));
  if (!tokens.length) return [];
  const counts = new Map<string, number>();
  const add = (k: string) => counts.set(k, (counts.get(k) ?? 0) + 1);
  tokens.forEach(add);
  for (let i = 0; i < tokens.length - 1; i++) add(`${tokens[i]} ${tokens[i + 1]}`);
  for (let i = 0; i < tokens.length - 2; i++)
    add(`${tokens[i]} ${tokens[i + 1]} ${tokens[i + 2]}`);
  const total = tokens.length;
  const rows: KeywordRow[] = [];
  counts.forEach((count, keyword) =>
    rows.push({
      keyword, count,
      density: +((count / total) * 100).toFixed(2),
      n: keyword.split(" ").length,
    })
  );
  rows.sort((a, b) => b.count - a.count || a.keyword.localeCompare(b.keyword));
  return rows;
}

const FILLERS = ["very","really","just","actually","basically","literally","quite","simply","totally","definitely","absolutely","certainly","clearly","obviously"];
const WEAK = ["in order to","due to the fact that","at this point in time","in the event that","for the purpose of","with regard to","in spite of the fact that","a lot of","kind of","sort of"];

function analyzeQuality(text: string): QualityIssue[] {
  const issues: QualityIssue[] = [];
  const trimmed = text.trim();
  if (!trimmed) return issues;

  const sentences = trimmed.split(/(?<=[.!?…।])\s+/).map((s) => s.trim()).filter(Boolean);
  sentences.forEach((s, i) => {
    const wc = extractWords(s).length;
    if (wc > 35)
      issues.push({ sev: "warn", title: `Sentence ${i + 1} is ${wc} words long`, detail: `"${s.slice(0, 80)}${s.length > 80 ? "…" : ""}" — consider splitting.` });
    else if (wc > 0 && wc < 4 && sentences.length > 3)
      issues.push({ sev: "info", title: `Sentence ${i + 1} is very short`, detail: `"${s}" — many short sentences can feel choppy.` });
  });

  const paras = trimmed.split(/\n\s*\n/).filter((p) => p.trim());
  paras.forEach((p, i) => {
    if (extractWords(p).length > 200)
      issues.push({ sev: "warn", title: `Paragraph ${i + 1} is long`, detail: "Aim for 60–120 words per paragraph." });
  });

  const dup = trimmed.match(/\b([\p{L}]+)\s+\1\b/giu);
  if (dup?.length)
    issues.push({ sev: "err", title: `${dup.length} duplicated word${dup.length > 1 ? "s" : ""}`, detail: dup.slice(0, 4).join(", ") });

  const shouty = trimmed.match(/\b[A-Z]{4,}\b/g) ?? [];
  if (shouty.length > 2)
    issues.push({ sev: "info", title: `${shouty.length} ALL-CAPS words`, detail: shouty.slice(0, 5).join(", ") });

  const ex = (trimmed.match(/!/g) ?? []).length;
  if (ex > 5)
    issues.push({ sev: "info", title: `${ex} exclamation marks`, detail: "Frequent exclamations weaken professional tone." });

  const lower = trimmed.toLowerCase();
  const fillers = FILLERS.filter((f) => new RegExp(`\\b${f}\\b`, "i").test(lower));
  if (fillers.length)
    issues.push({ sev: "info", title: `${fillers.length} filler word${fillers.length > 1 ? "s" : ""}`, detail: fillers.join(", ") });

  const weak = WEAK.filter((p) => lower.includes(p));
  if (weak.length)
    issues.push({ sev: "info", title: `${weak.length} wordy phrase${weak.length > 1 ? "s" : ""}`, detail: weak.join(" · ") });

  return issues;
}

/* ════════════════════════════════════════════════════════════════════════
   TRANSFORMS
   ════════════════════════════════════════════════════════════════════════ */
const capitalize = (w: string) =>
  w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : w;

const caseOps: Record<string, (t: string) => string> = {
  UPPER: (t) => t.toUpperCase(),
  lower: (t) => t.toLowerCase(),
  Title: (t) => t.replace(/[\p{L}\p{N}'’-]+/gu, capitalize),
  Sentence: (t) =>
    t.toLowerCase().replace(/(^\s*[\p{L}\p{N}]|[.!?…।]\s+[\p{L}\p{N}])/gu, (m) => m.toUpperCase()),
  camel: (t) => {
    const w = extractWords(t);
    return w.map((x, i) => (i === 0 ? x.toLowerCase() : capitalize(x))).join("");
  },
  Pascal: (t) => extractWords(t).map(capitalize).join(""),
  snake: (t) => extractWords(t).map((x) => x.toLowerCase()).join("_"),
  kebab: (t) => extractWords(t).map((x) => x.toLowerCase()).join("-"),
  CONSTANT: (t) => extractWords(t).map((x) => x.toUpperCase()).join("_"),
  dot: (t) => extractWords(t).map((x) => x.toLowerCase()).join("."),
};

const cleanOps: Record<string, (t: string) => string> = {
  extraSpaces: (t) => t.replace(/[ \t]{2,}/g, " "),
  trimLines: (t) => t.split("\n").map((l) => l.trim()).join("\n"),
  noBlankLines: (t) => t.split("\n").filter((l) => l.trim()).join("\n"),
  noExtraBreaks: (t) => t.replace(/\n{3,}/g, "\n\n"),
  dedupLines: (t) => {
    const s = new Set<string>();
    return t.split("\n").filter((l) => {
      const k = l.trim(); if (!k) return true;
      if (s.has(k)) return false; s.add(k); return true;
    }).join("\n");
  },
  dedupWords: (t) => t.replace(/\b([\p{L}]+)(\s+\1\b)+/giu, "$1"),
  normalize: (t) => t.replace(/\s+/g, " ").trim(),
  noNumbers: (t) => t.replace(/\p{N}/gu, ""),
  noEmoji: stripEmoji,
};

const sortOps: Record<string, (t: string) => string> = {
  az: (t) => t.split("\n").sort((a, b) => a.localeCompare(b)).join("\n"),
  za: (t) => t.split("\n").sort((a, b) => b.localeCompare(a)).join("\n"),
  num: (t) => t.split("\n").sort((a, b) => {
    const na = parseFloat(a.replace(/[^\d.-]/g, ""));
    const nb = parseFloat(b.replace(/[^\d.-]/g, ""));
    return (Number.isFinite(na) ? na : Infinity) - (Number.isFinite(nb) ? nb : Infinity);
  }).join("\n"),
  len: (t) => t.split("\n").sort((a, b) => a.length - b.length).join("\n"),
  revLines: (t) => t.split("\n").reverse().join("\n"),
};
const revOps: Record<string, (t: string) => string> = {
  reverseText: (t) => toGraphemes(t).reverse().join(""),
  reverseWords: (t) => t.split("\n").map((l) => l.split(/\s+/).filter(Boolean).reverse().join(" ")).join("\n"),
  reverseEachLine: (t) => t.split("\n").map((l) => toGraphemes(l).reverse().join("")).join("\n"),
};

/* ════════════════════════════════════════════════════════════════════════
   CONFIG
   ════════════════════════════════════════════════════════════════════════ */
const DEFAULT_PLATFORMS: PlatformLimit[] = [
  { id: "x", name: "X / Twitter Post", limit: 280 },
  { id: "ig_cap", name: "Instagram Caption", limit: 2200 },
  { id: "ig_bio", name: "Instagram Bio", limit: 150 },
  { id: "fb", name: "Facebook Post", limit: 63206 },
  { id: "li", name: "LinkedIn Post", limit: 3000 },
  { id: "li_h", name: "LinkedIn Headline", limit: 220 },
  { id: "yt_t", name: "YouTube Title", limit: 100 },
  { id: "yt_d", name: "YouTube Description", limit: 5000 },
  { id: "tt", name: "TikTok Caption", limit: 2200 },
  { id: "pin", name: "Pinterest Description", limit: 500 },
  { id: "sms", name: "SMS Message", limit: 160 },
  { id: "wa", name: "WhatsApp Status", limit: 700 },
];

const FAQS = [
  { q: "What is a character counter?", a: "A character counter is a tool that instantly counts every character in your text — letters, digits, spaces, punctuation and emojis — and often breaks the total down into useful categories. It is essential for social media posts, SEO titles, meta descriptions and any writing with a strict character limit." },
  { q: "Are spaces counted as characters?", a: "Yes, by default. Most platforms (X, Instagram, Google Ads) count spaces toward the limit. This tool shows both characters-with-spaces and characters-without-spaces so you can use whichever number your situation requires." },
  { q: "What is the difference between characters and words?", a: "Characters are individual units of text; words are groups of characters separated by whitespace. In English, 1,000 characters is roughly 160–180 words, but this ratio changes for other languages and scripts." },
  { q: "How is reading time calculated?", a: "Reading time = word count ÷ words-per-minute. This tool defaults to 200 WPM (average adult silent reading speed) and 130 WPM for speaking. You can adjust both in the Reading Time section." },
  { q: "Can I count Hindi characters correctly?", a: "Yes. This tool uses Intl.Segmenter for grapheme-cluster segmentation, so Devanagari matras and conjuncts are counted as single user-perceived characters instead of being split incorrectly." },
  { q: "Can I count emojis?", a: "Yes. Emojis are detected via Unicode codepoint ranges and counted as grapheme clusters. A flag (two regional indicators) counts as 1 emoji, and ZWJ sequences (family emojis) count as 1." },
  { q: "Is my text stored on a server?", a: "No. Every calculation runs locally in your browser. Your text never leaves your device. If you enable auto-save, the draft is stored in your browser's localStorage only." },
  { q: "Does the tool work offline?", a: "Yes. After the page loads once, all counting, keyword analysis, readability scoring and text conversion continue working without an internet connection." },
  { q: "What is an SEO title?", a: "The SEO title (or meta title) is the headline shown in Google search results. It should be 50–60 characters or roughly 600 pixels wide. Longer titles are truncated with an ellipsis." },
  { q: "What is a meta description?", a: "The meta description is the summary under the title in search results. Google typically shows about 150–160 characters. It does not directly affect ranking but influences click-through rate." },
  { q: "How accurate is the page calculator?", a: "It is an estimate based on paper size, font, font size and line spacing. Real page counts also depend on margins, headers, footers, images and tables. Use it as a planning guide." },
  { q: "Why do two word counters show different results?", a: "Different tools define 'a word' differently — some split only on spaces, others strip punctuation first. This tool uses a Unicode-aware regex that includes letters, numbers and combining marks, so hyphenated and accented words count correctly." },
  { q: "Can I add my own character limits?", a: "Yes. The Social Media Limits section lets you add a custom platform with any character limit, and the Custom Limit Checker lets you set a limit for characters, words, sentences or lines." },
  { q: "Is the readability score reliable for non-English text?", a: "Flesch Reading Ease, Flesch-Kincaid and Gunning Fog were designed for English. Syllable estimation only works for Latin-script words, so scores for Hindi or other scripts are indicative, not definitive." },
  { q: "Is there a word or character limit for input?", a: "No hard limit. The tool handles very large texts efficiently because counting is linear and inexpensive. For extremely large texts (millions of characters), the browser may take a moment to analyse." },
  { q: "Can I export my statistics?", a: "Yes. Statistics can be exported as CSV, JSON, TXT, Markdown or HTML, and the keyword table can be copied to your clipboard with a single click." },
];

const FEATURE_GUIDES = [
  { title: "Live Character & Word Counter", body: "The main editor updates every statistic in real time as you type or paste. This includes characters (with and without spaces), words, unique words, sentences, paragraphs, lines, letters, digits, punctuation, symbols and emojis. Because it uses grapheme-cluster segmentation, Hindi, Arabic, emoji and mixed-script text all count correctly." },
  { title: "Advanced Text Statistics", body: "The Advanced Statistics panel exposes every measurement the analyser produces: uppercase and lowercase letter counts, tabs, newlines, unique characters, longest and shortest words, average word and sentence length, UTF-8 byte count and UTF-16 code-unit count. UTF-8 bytes matter for storage and API limits; UTF-16 code units matter for JavaScript string length." },
  { title: "Reading & Speaking Time", body: "Reading time estimates how long the average person would take to read your text silently at 200 WPM. Speaking time uses 130 WPM — typical for presentations and voiceovers. Both values can be adjusted if you know your audience reads or speaks at a different speed." },
  { title: "Writing Goal Tracker", body: "Set a target for characters, words or sentences. The tool shows current / goal, remaining amount and a visual progress bar that turns green when you reach the goal. Goals are validated so negative values are impossible." },
  { title: "Custom Limit Checker", body: "Choose a unit (characters, words, sentences or lines) and a maximum. The checker shows Safe / Near Limit / Over Limit and warns when you pass your chosen threshold (80%, 90% or 95%). Ideal for university assignments and application essays." },
  { title: "Social Media Limits", body: "Each platform (X, Instagram, LinkedIn, YouTube, TikTok, Facebook, Pinterest, WhatsApp, SMS) has its own character limit and its own counting rules. This tool tracks your text against each limit live, shows remaining characters and colours the result green, amber or red. You can add your own custom platforms and remove any you don't need." },
  { title: "SEO Analyzer", body: "Meta titles should be 50–60 characters, meta descriptions 150–160, Google Ads headlines 30 each and descriptions 90. This analyser shows character count, remaining characters, pixel-width estimate and length-quality label (Too Short / Good / Too Long) for each element." },
  { title: "URL Slug Analyzer", body: "A slug is the last part of a URL — for example /best-character-counter. Good slugs are short, lowercase, hyphen-separated and free of spaces and special characters. This analyser flags issues and suggests a cleaner slug automatically." },
  { title: "Keyword Density Analyzer", body: "Keyword density is the percentage of a word or phrase compared to total words. The analyser extracts single words, two-word and three-word phrases, ranks them by frequency, and lets you filter by stop words, case sensitivity and custom stop-word lists. Use it to avoid over-optimising — 1–2% density per keyword is healthy." },
  { title: "Readability Analyzer", body: "Three formulas run simultaneously: Flesch Reading Ease (higher is easier), Flesch-Kincaid Grade Level (US grade level) and Gunning Fog Index (years of education required). Average sentence and word length are also shown. A text needs at least 20 words to be scored reliably." },
  { title: "Text Quality Analyzer", body: "Detects long sentences (over 35 words), very short choppy sentences, duplicated words, ALL-CAPS shouting, excessive exclamation marks, filler words like 'very' and 'really', and wordy phrases like 'in order to'. Each issue is reported with severity and a specific example." },
  { title: "Text Case Converter", body: "Eleven case styles are supported: UPPERCASE, lowercase, Title Case, Sentence case, Capitalize Each Word, camelCase, PascalCase, snake_case, kebab-case, CONSTANT_CASE and dot.case. Results can be copied, downloaded or pushed straight back into the editor." },
  { title: "Text Cleaner", body: "Nine one-click cleaning actions: remove extra spaces, trim lines, remove blank lines, remove extra line breaks, remove duplicate lines, remove duplicate words, normalise whitespace, remove leading spaces and remove trailing spaces. Every action modifies the editor text directly and can be undone with Ctrl/Cmd + Z." },
  { title: "Find & Replace", body: "Search for any text, count matches, and replace either one occurrence at a time or all at once. Case-sensitive and whole-word matching options are available. The match count updates as you type." },
  { title: "Sorting & Reversal", body: "Sort lines A–Z, Z–A, numerically or by length. Reverse the entire line order. Reverse the whole text, just the words, or each line character-by-character. Reversal is grapheme-aware so emojis and Devanagari clusters stay intact." },
  { title: "Academic Writing Tools", body: "A dedicated dashboard for students: essay word count, abstract count, paragraph count, citation count (detects patterns like (Smith, 2020) or [1]) and estimated page count. An assignment target field tracks progress toward a word limit." },
  { title: "Page Calculator", body: "Estimates how many pages your text will occupy given paper size (A4 or Letter), font family (Times New Roman, Arial, Calibri), font size (10–14 pt) and line spacing (single, 1.15, 1.5, double). The result is clearly labelled as an estimate because real page counts depend on margins, headers and images." },
  { title: "Import & Export", body: "Import plain text from TXT, CSV, JSON, Markdown, LOG and HTML files. Export your text as TXT, Markdown or HTML, your statistics as CSV, and the whole document (text + stats) as JSON. All reading and writing happens locally." },
  { title: "Local Draft & Privacy", body: "Everything runs in your browser — no server, no login, no tracking. If you enable auto-save, the draft is stored in localStorage on this device only. You can restore or clear the saved draft at any time." },
];

/* ════════════════════════════════════════════════════════════════════════
   SMALL UI COMPONENTS
   ════════════════════════════════════════════════════════════════════════ */
function Section({
  id, title, subtitle, defaultOpen = false, children,
}: {
  id?: string; title: string; subtitle?: string;
  defaultOpen?: boolean; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = `${id ?? title.replace(/\W+/g, "-").toLowerCase()}-panel`;
  return (
    <section id={id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <button
        type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls={panelId}
        className="flex w-full items-center justify-between gap-4 p-4 text-left transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 sm:p-5 dark:hover:bg-slate-800/60"
      >
        <span className="min-w-0">
          <span className="block text-base font-semibold text-slate-900 sm:text-lg dark:text-slate-100">{title}</span>
          {subtitle && <span className="mt-0.5 block text-sm text-slate-500 dark:text-slate-400">{subtitle}</span>}
        </span>
        <span aria-hidden="true" className={`shrink-0 text-slate-400 transition-transform duration-300 ${open ? "rotate-180" : ""}`}>▾</span>
      </button>
      <div className={`grid transition-all duration-300 ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
        <div className="overflow-hidden">
          <div id={panelId} className="border-t border-slate-200 p-4 sm:p-5 dark:border-slate-800">{children}</div>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value, hint, accent }: { label: string; value: React.ReactNode; hint?: string; accent?: boolean }) {
  return (
    <div className={`rounded-xl border p-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-4 ${accent ? "border-indigo-200 bg-indigo-50 dark:border-indigo-900 dark:bg-indigo-950/40" : "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40"}`}>
      <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500 sm:text-xs dark:text-slate-400">{label}</div>
      <div className={`mt-1 truncate text-lg font-bold sm:text-xl ${accent ? "text-indigo-700 dark:text-indigo-300" : "text-slate-900 dark:text-slate-100"}`} title={typeof value === "string" ? value : undefined}>{value}</div>
      {hint && <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{hint}</div>}
    </div>
  );
}

function Progress({ value, max, tone = "indigo" }: { value: number; max: number; tone?: "indigo" | "green" | "amber" | "red" }) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  const colours: Record<string, string> = {
    indigo: "bg-indigo-500", green: "bg-emerald-500", amber: "bg-amber-500", red: "bg-rose-500",
  };
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
      <div className={`h-full rounded-full transition-all duration-500 ${colours[tone]}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function Btn({
  children, onClick, variant = "default", disabled, title,
}: {
  children: React.ReactNode; onClick: () => void;
  variant?: "default" | "primary" | "danger"; disabled?: boolean; title?: string;
}) {
  const base = "inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-40 active:scale-95";
  const styles: Record<string, string> = {
    default: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700",
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 hover:-translate-y-0.5 hover:shadow-lg dark:bg-indigo-500 dark:hover:bg-indigo-600",
    danger: "border border-rose-300 bg-white text-rose-600 hover:bg-rose-50 hover:-translate-y-0.5 hover:shadow-md dark:border-rose-800 dark:bg-slate-800 dark:text-rose-400 dark:hover:bg-rose-950/40",
  };
  return <button type="button" onClick={onClick} disabled={disabled} title={title} className={`${base} ${styles[variant]}`}>{children}</button>;
}

function Field({
  label, value, onChange, type = "text", min, max, step, placeholder, suffix,
}: {
  label: string; value: string | number; onChange: (v: string) => void;
  type?: string; min?: number; max?: number; step?: number;
  placeholder?: string; suffix?: string;
}) {
  const id = `f-${label.replace(/\W+/g, "-").toLowerCase()}`;
  return (
    <label htmlFor={id} className="block">
      <span className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">{label}{suffix ? ` (${suffix})` : ""}</span>
      <input id={id} type={type} value={value} min={min} max={max} step={step} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
    </label>
  );
}

function AdSlot({ label = "Advertisement", height = 90 }: { label?: string; height?: number }) {
  return (
    <div className="my-6" aria-label={label}>
      <p className="mb-1 text-center text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500">{label}</p>
      <div
        data-ad-slot="auto"
        style={{ minHeight: height }}
        className="mx-auto flex max-w-3xl items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-100/50 p-4 text-xs text-slate-400 dark:border-slate-700 dark:bg-slate-800/30 dark:text-slate-500"
      >
        {/* Replace with your <ins class="adsbygoogle" ... /> snippet */}
        AdSense slot — replace with your ad unit code
      </div>
    </div>
  );
}

function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0 sec";
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  if (m === 0) return `${s} sec`;
  if (s === 0) return `${m} min`;
  return `${m} min ${s} sec`;
}

function downloadFile(name: string, content: string, mime: string) {
  try {
    const blob = new Blob([content], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch { /* ignore */ }
}

function useDebounced<T>(value: T, delay = 150): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = window.setTimeout(() => setV(value), delay);
    return () => window.clearTimeout(t);
  }, [value, delay]);
  return v;
}

/* ════════════════════════════════════════════════════════════════════════
   MAIN PAGE
   ════════════════════════════════════════════════════════════════════════ */
export default function Page() {
  const [text, setText] = useState("");
  const debounced = useDebounced(text, 120);
  const textRef = useRef(text);
  textRef.current = text;

  const [toast, setToast] = useState<{ k: string; m: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const flash = useCallback((k: string, m: string) => {
    setToast({ k, m });
    window.setTimeout(() => setToast((t) => (t?.k === k ? null : t)), 1800);
  }, []);

  /* Undo / redo (debounced history) */
  const histRef = useRef<string[]>([""]);
  const idxRef = useRef(0);
  const skipRef = useRef(false);
  useEffect(() => {
    if (skipRef.current) { skipRef.current = false; return; }
    const t = window.setTimeout(() => {
      const h = histRef.current;
      if (h[idxRef.current] === text) return;
      const next = h.slice(0, idxRef.current + 1);
      next.push(text);
      const capped = next.slice(-120);
      histRef.current = capped;
      idxRef.current = capped.length - 1;
    }, 700);
    return () => window.clearTimeout(t);
  }, [text]);

  const undo = useCallback(() => {
    if (idxRef.current <= 0) return;
    idxRef.current -= 1;
    skipRef.current = true;
    setText(histRef.current[idxRef.current]);
  }, []);
  const redo = useCallback(() => {
    if (idxRef.current >= histRef.current.length - 1) return;
    idxRef.current += 1;
    skipRef.current = true;
    setText(histRef.current[idxRef.current]);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (!mod) return;
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || (e.target as HTMLElement)?.isContentEditable) return;
      const k = e.key.toLowerCase();
      if (k === "z" && e.shiftKey) { e.preventDefault(); redo(); }
      else if (k === "z") { e.preventDefault(); undo(); }
      else if (k === "y") { e.preventDefault(); redo(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo]);

  /* Local draft */
  const [autoSave, setAutoSave] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  useEffect(() => {
    try { if (localStorage.getItem("tx_draft")) setHasDraft(true); } catch { /* */ }
  }, []);
  useEffect(() => {
    if (!autoSave) return;
    const t = window.setTimeout(() => {
      try { localStorage.setItem("tx_draft", text); setHasDraft(text.length > 0); } catch { /* */ }
    }, 900);
    return () => window.clearTimeout(t);
  }, [text, autoSave]);
  const restoreDraft = () => {
    try {
      const d = localStorage.getItem("tx_draft");
      if (d) { setText(d); flash("draft", "Draft restored"); }
    } catch { setError("Could not read saved draft."); }
  };
  const clearDraft = () => {
    try { localStorage.removeItem("tx_draft"); setHasDraft(false); flash("draft", "Draft cleared"); }
    catch { setError("Could not clear draft."); }
  };

  /* Analysis */
  const stats = useMemo(() => analyzeText(debounced), [debounced]);
  const readability = useMemo(() => analyzeReadability(debounced), [debounced]);
  const quality = useMemo(() => analyzeQuality(debounced), [debounced]);

  /* Reading time */
  const [readingWpm, setReadingWpm] = useState(200);
  const [speakingWpm, setSpeakingWpm] = useState(130);
  const [slowWpm, setSlowWpm] = useState(120);
  const readSec = readingWpm > 0 ? (stats.words / readingWpm) * 60 : 0;
  const speakSec = speakingWpm > 0 ? (stats.words / speakingWpm) * 60 : 0;
  const slowSec = slowWpm > 0 ? (stats.words / slowWpm) * 60 : 0;

  /* Goals */
  const [goalC, setGoalC] = useState(0);
  const [goalW, setGoalW] = useState(0);
  const [goalS, setGoalS] = useState(0);

  /* Custom limit */
  const [limType, setLimType] = useState<"characters" | "words" | "sentences" | "lines">("characters");
  const [limMax, setLimMax] = useState(500);
  const [limThreshold, setLimThreshold] = useState(90);
  const limCur =
    limType === "characters" ? stats.characters :
    limType === "words" ? stats.words :
    limType === "sentences" ? stats.sentences : stats.lines;

  /* Platforms */
  const [platforms, setPlatforms] = useState<PlatformLimit[]>(DEFAULT_PLATFORMS);
  const [newName, setNewName] = useState("");
  const [newLimit, setNewLimit] = useState("");

  /* SEO */
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDesc, setSeoDesc] = useState("");
  const [slug, setSlug] = useState("");
  const [adHeads, setAdHeads] = useState(["", "", ""]);
  const [adDesc, setAdDesc] = useState("");
  const slugSuggestion = useMemo(() => extractWords(slug).map((w) => w.toLowerCase()).join("-"), [slug]);
  const estimatePixels = (s: string, per = 8.5) => Math.round(toGraphemes(s).length * per);

  /* Keywords */
  const [topN, setTopN] = useState(20);
  const [ignoreStop, setIgnoreStop] = useState(true);
  const [caseSens, setCaseSens] = useState(false);
  const [kwFilter, setKwFilter] = useState("");
  const [customStop, setCustomStop] = useState("");
  const [ngram, setNgram] = useState<0 | 1 | 2 | 3>(0);
  const keywords = useMemo(
    () => analyzeKeywords(debounced, { ignoreStop, caseSensitive: caseSens, customStop }),
    [debounced, ignoreStop, caseSens, customStop]
  );
  const visibleKeywords = useMemo(() => {
    const rows = ngram === 0 ? keywords : keywords.filter((k) => k.n === ngram);
    const filtered = kwFilter ? rows.filter((k) => k.keyword.toLowerCase().includes(kwFilter.toLowerCase())) : rows;
    return filtered.slice(0, topN);
  }, [keywords, ngram, kwFilter, topN]);

  /* Find / replace */
  const [findT, setFindT] = useState("");
  const [replT, setReplT] = useState("");
  const [findCase, setFindCase] = useState(false);
  const [findWord, setFindWord] = useState(false);
  const matchCount = useMemo(() => {
    if (!findT) return 0;
    try {
      const esc = findT.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const pat = findWord ? `\\b${esc}\\b` : esc;
      const re = new RegExp(pat, findCase ? "g" : "gi");
      return (debounced.match(re) ?? []).length;
    } catch { return 0; }
  }, [debounced, findT, findCase, findWord]);
  const doReplace = (all: boolean) => {
    if (!findT) return;
    try {
      const esc = findT.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const pat = findWord ? `\\b${esc}\\b` : esc;
      const flags = findCase ? (all ? "g" : "") : all ? "gi" : "i";
      const re = new RegExp(pat, flags);
      setText(text.replace(re, replT));
      flash("repl", all ? "All replaced" : "Replaced");
    } catch { setError("Invalid search pattern."); }
  };

  /* Case result */
  const [caseResult, setCaseResult] = useState("");

  /* Page calc */
  const [paper, setPaper] = useState<"A4" | "Letter">("A4");
  const [font, setFont] = useState("Times New Roman");
  const [fontSize, setFontSize] = useState(12);
  const [lineSpacing, setLineSpacing] = useState(1.5);
  const estPages = useMemo(() => {
    if (!stats.words) return 0;
    const p = paper === "A4" ? 1 : 1.03;
    const f = font === "Arial" ? 1.05 : font === "Calibri" ? 0.95 : 1;
    const s = 12 / fontSize;
    const l = 1 / lineSpacing;
    const wpp = 500 * p * f * s * l;
    return Math.max(1, Math.ceil(stats.words / wpp));
  }, [stats.words, paper, font, fontSize, lineSpacing]);

  /* Clipboard */
  const copy = useCallback(async (v: string, k: string) => {
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(v);
      else {
        const ta = document.createElement("textarea");
        ta.value = v; ta.style.position = "fixed"; ta.style.opacity = "0";
        document.body.appendChild(ta); ta.select();
        document.execCommand("copy"); document.body.removeChild(ta);
      }
      flash(k, "Copied!");
    } catch { flash(k, "Clipboard blocked"); }
  }, [flash]);

  /* File IO */
  const fileRef = useRef<HTMLInputElement>(null);
  const handleFile = async (file: File) => {
    const ok = [".txt", ".csv", ".json", ".md", ".markdown", ".log", ".html", ".htm"];
    if (!ok.some((e) => file.name.toLowerCase().endsWith(e))) {
      setError("Unsupported file type."); return;
    }
    try { setText(await file.text()); flash("io", "Imported"); setError(null); }
    catch { setError("Could not read file."); }
  };
  const exportAs = (fmt: "txt" | "md" | "html" | "json" | "csv") => {
    const base = "character-counter";
    if (fmt === "txt") downloadFile(`${base}.txt`, text, "text/plain");
    else if (fmt === "md") downloadFile(`${base}.md`, text, "text/markdown");
    else if (fmt === "html") {
      const esc = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      downloadFile(`${base}.html`, `<!doctype html><meta charset="utf-8"><title>Export</title><pre style="white-space:pre-wrap;font-family:system-ui">${esc}</pre>`, "text/html");
    } else if (fmt === "json") {
      downloadFile(`${base}.json`, JSON.stringify({ text, stats, exportedAt: new Date().toISOString() }, null, 2), "application/json");
    } else {
      const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
      const rows = [["Metric", "Value"],
        ["Characters", String(stats.characters)], ["Characters (no spaces)", String(stats.charsNoSpace)],
        ["Words", String(stats.words)], ["Unique words", String(stats.uniqueWords)],
        ["Sentences", String(stats.sentences)], ["Paragraphs", String(stats.paragraphs)],
        ["Lines", String(stats.lines)], ["Emojis", String(stats.emojis)],
        ["Reading time", formatDuration(readSec)],
      ];
      downloadFile(`${base}-stats.csv`, rows.map((r) => r.map(esc).join(",")).join("\n"), "text/csv");
    }
  };

  /* Derived */
  const limRatio = limMax > 0 ? limCur / limMax : 0;
  const limTone = limRatio > 1 ? "red" : limRatio >= 0.9 ? "amber" : "green";
  const limLabel = limRatio > 1 ? "Over limit" : limRatio >= 0.9 ? "Near limit" : "Safe";

  /* ═════════════════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <a href="#editor" className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-indigo-600 focus:px-4 focus:py-2 focus:text-white">Skip to editor</a>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <a href="#" className="flex items-center gap-2">
            <span aria-hidden="true" className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-lg font-bold text-white shadow-md transition-transform hover:scale-105">#</span>
            <span>
              <span className="block text-sm font-bold leading-tight sm:text-base">Textlyzer</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Writing Assistant</span>
            </span>
          </a>
          <nav aria-label="Primary" className="flex flex-wrap items-center gap-1 text-sm">
            {[["#editor", "Editor"], ["#seo", "SEO"], ["#keywords", "Keywords"], ["#guide", "Guide"], ["#faq", "FAQ"]].map(([h, l]) => (
              <a key={h} href={h} className="rounded-lg px-3 py-1.5 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white">{l}</a>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        {/* Hero */}
        <section className="mb-6">
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl">
            Advanced Character Counter &amp; Writing Assistant
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600 sm:text-base dark:text-slate-400">
            Count characters, words, sentences and emojis in real time. Analyse readability,
            keyword density, SEO metadata and social-media limits — all processed locally in your browser.
          </p>
          <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
            <span aria-hidden="true">🔒</span> Your text is processed locally in your browser.
          </p>
        </section>

        {error && (
          <div role="alert" className="mb-4 flex items-start justify-between gap-3 rounded-xl border border-rose-300 bg-rose-50 p-3 text-sm text-rose-800 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200">
            <span>{error}</span>
            <button type="button" onClick={() => setError(null)} className="shrink-0 rounded px-2 py-0.5 font-medium hover:bg-rose-100 dark:hover:bg-rose-900/50" aria-label="Dismiss">✕</button>
          </div>
        )}

        <AdSlot label="Advertisement" />

        {/* Editor */}
        <section id="editor" aria-labelledby="editor-heading" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 id="editor-heading" className="text-base font-semibold sm:text-lg">Your text</h2>
            <div className="flex flex-wrap items-center gap-1.5">
              <Btn onClick={undo} title="Undo (Ctrl/Cmd + Z)">↶ Undo</Btn>
              <Btn onClick={redo} title="Redo (Ctrl/Cmd + Shift + Z)">↷ Redo</Btn>
              <Btn onClick={() => copy(text, "text")}>{toast?.k === "text" ? "✓ Copied" : "⧉ Copy"}</Btn>
              <Btn onClick={() => { setText(""); flash("clear", "Cleared"); }} variant="danger">Clear</Btn>
            </div>
          </div>
          <label htmlFor="main-editor" className="sr-only">Text editor</label>
          <textarea id="main-editor" value={text} onChange={(e) => setText(e.target.value)}
            placeholder="Start typing or paste your text here… Hindi, English, emoji all supported"
            spellCheck rows={12}
            className="w-full resize-y rounded-xl border border-slate-300 bg-slate-50 p-3 font-mono text-sm leading-relaxed outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/30 sm:p-4 sm:text-base dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Nothing is uploaded. Analysis runs entirely on your device.</p>

          <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
            <Stat label="Characters" value={stats.characters.toLocaleString()} accent />
            <Stat label="Words" value={stats.words.toLocaleString()} accent />
            <Stat label="Sentences" value={stats.sentences.toLocaleString()} />
            <Stat label="Paragraphs" value={stats.paragraphs.toLocaleString()} />
            <Stat label="Lines" value={stats.lines.toLocaleString()} />
            <Stat label="Emojis" value={stats.emojis.toLocaleString()} />
            <Stat label="No spaces" value={stats.charsNoSpace.toLocaleString()} />
            <Stat label="Unique words" value={stats.uniqueWords.toLocaleString()} />
            <Stat label="Letters" value={stats.letters.toLocaleString()} />
            <Stat label="Digits" value={stats.digits.toLocaleString()} />
            <Stat label="Punctuation" value={stats.punct.toLocaleString()} />
            <Stat label="Avg word length" value={stats.avgWordLen.toFixed(2)} />
          </div>
        </section>

        {/* Reading time */}
        <div className="mt-4">
          <Section title="Reading & Speaking Time" subtitle="Estimated from word count and adjustable words-per-minute" defaultOpen>
            <div className="grid gap-3 sm:grid-cols-3">
              <Stat label="Reading time" value={formatDuration(readSec)} hint={`${readingWpm} WPM`} accent />
              <Stat label="Speaking time" value={formatDuration(speakSec)} hint={`${speakingWpm} WPM`} accent />
              <Stat label="Slow reading" value={formatDuration(slowSec)} hint={`${slowWpm} WPM`} />
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <Field label="Reading speed" type="number" min={50} max={1000} value={readingWpm} onChange={(v) => setReadingWpm(Math.max(1, parseInt(v, 10) || 0))} suffix="WPM" />
              <Field label="Speaking speed" type="number" min={50} max={1000} value={speakingWpm} onChange={(v) => setSpeakingWpm(Math.max(1, parseInt(v, 10) || 0))} suffix="WPM" />
              <Field label="Slow reading speed" type="number" min={50} max={1000} value={slowWpm} onChange={(v) => setSlowWpm(Math.max(1, parseInt(v, 10) || 0))} suffix="WPM" />
            </div>
          </Section>
        </div>

        {/* Goals */}
        <div className="mt-4">
          <Section title="Writing Goal Tracker" subtitle="Set targets and watch your progress">
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Character goal" type="number" min={0} value={goalC} onChange={(v) => setGoalC(Math.max(0, parseInt(v, 10) || 0))} />
              <Field label="Word goal" type="number" min={0} value={goalW} onChange={(v) => setGoalW(Math.max(0, parseInt(v, 10) || 0))} />
              <Field label="Sentence goal" type="number" min={0} value={goalS} onChange={(v) => setGoalS(Math.max(0, parseInt(v, 10) || 0))} />
            </div>
            <div className="mt-4 space-y-4">
              {[
                { label: "Characters", cur: stats.characters, goal: goalC },
                { label: "Words", cur: stats.words, goal: goalW },
                { label: "Sentences", cur: stats.sentences, goal: goalS },
              ].map((g) => {
                const pct = g.goal > 0 ? (g.cur / g.goal) * 100 : 0;
                return (
                  <div key={g.label}>
                    <div className="mb-1 flex flex-wrap items-center justify-between gap-2 text-sm">
                      <span className="font-medium">{g.label}</span>
                      {g.goal > 0 ? (
                        <span className="text-slate-600 dark:text-slate-400">
                          {g.cur.toLocaleString()} / {g.goal.toLocaleString()} · {g.cur >= g.goal ? <span className="font-semibold text-emerald-600 dark:text-emerald-400">Goal completed 🎉</span> : <>{(g.goal - g.cur).toLocaleString()} remaining ({Math.min(100, pct).toFixed(1)}%)</>}
                        </span>
                      ) : <span className="text-slate-400">No goal set</span>}
                    </div>
                    <Progress value={g.cur} max={g.goal || 1} tone={pct >= 100 ? "green" : pct >= 75 ? "indigo" : "amber"} />
                  </div>
                );
              })}
            </div>
          </Section>
        </div>

        {/* Advanced stats */}
        <div className="mt-4">
          <Section title="Advanced Text Statistics" subtitle="Unicode-aware breakdown, byte counts and averages">
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
              <Stat label="Characters (with spaces)" value={stats.characters.toLocaleString()} />
              <Stat label="Characters (without spaces)" value={stats.charsNoSpace.toLocaleString()} />
              <Stat label="Letters" value={stats.letters.toLocaleString()} />
              <Stat label="Uppercase letters" value={stats.upper.toLocaleString()} />
              <Stat label="Lowercase letters" value={stats.lower.toLocaleString()} />
              <Stat label="Numbers" value={stats.digits.toLocaleString()} />
              <Stat label="Spaces" value={stats.spaces.toLocaleString()} />
              <Stat label="Tabs" value={stats.tabs.toLocaleString()} />
              <Stat label="New lines" value={stats.newlines.toLocaleString()} />
              <Stat label="Punctuation" value={stats.punct.toLocaleString()} />
              <Stat label="Symbols" value={stats.symbols.toLocaleString()} />
              <Stat label="Emojis" value={stats.emojis.toLocaleString()} />
              <Stat label="Unique characters" value={stats.uniqueChars.toLocaleString()} />
              <Stat label="Unique words" value={stats.uniqueWords.toLocaleString()} />
              <Stat label="Average word length" value={stats.avgWordLen.toFixed(2)} />
              <Stat label="Average sentence length" value={stats.avgSentenceLen.toFixed(2)} />
              <Stat label="Longest word" value={stats.longestWord || "—"} />
              <Stat label="Shortest word" value={stats.shortestWord || "—"} />
              <Stat label="UTF-8 bytes" value={stats.utf8.toLocaleString()} />
              <Stat label="UTF-16 code units" value={stats.utf16.toLocaleString()} />
            </div>
          </Section>
        </div>

        {/* Custom limit */}
        <div className="mt-4">
          <Section title="Custom Limit Checker" subtitle="Set your own limit and warning threshold">
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">Limit type</span>
                <select value={limType} onChange={(e) => setLimType(e.target.value as typeof limType)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800">
                  <option value="characters">Characters</option>
                  <option value="words">Words</option>
                  <option value="sentences">Sentences</option>
                  <option value="lines">Lines</option>
                </select>
              </label>
              <Field label="Maximum" type="number" min={1} value={limMax} onChange={(v) => setLimMax(Math.max(1, parseInt(v, 10) || 1))} />
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">Warning threshold</span>
                <select value={limThreshold} onChange={(e) => setLimThreshold(parseInt(e.target.value, 10))}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800">
                  <option value={80}>80%</option><option value={90}>90%</option><option value={95}>95%</option>
                </select>
              </label>
            </div>
            <div className="mt-4">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="font-medium">{limCur.toLocaleString()} / {limMax.toLocaleString()}</span>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${limTone === "red" ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300" : limTone === "amber" ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"}`}>{limLabel}</span>
              </div>
              <Progress value={limCur} max={limMax} tone={limTone as "red" | "amber" | "green"} />
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                {limCur > limMax ? `${(limCur - limMax).toLocaleString()} over the limit` : `${(limMax - limCur).toLocaleString()} remaining`}
                {limMax > 0 && limCur <= limMax && limCur >= (limMax * limThreshold) / 100 ? ` · Passed ${limThreshold}% warning threshold` : ""}
              </p>
            </div>
          </Section>
        </div>

        {/* Social */}
        <div className="mt-4">
          <Section title="Social Media Character Limits" subtitle="Live counts against each platform's maximum">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {platforms.map((p) => {
                const ratio = p.limit > 0 ? stats.characters / p.limit : 0;
                const tone = ratio > 1 ? "red" : ratio >= 0.9 ? "amber" : "green";
                const label = ratio > 1 ? "Over limit" : ratio >= 0.9 ? "Near limit" : "Safe";
                return (
                  <div key={p.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-800/40">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-semibold">{p.name}</span>
                      {p.custom && (
                        <button type="button" onClick={() => setPlatforms((prev) => prev.filter((x) => x.id !== p.id))}
                          className="rounded px-1.5 text-xs text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950/50" aria-label={`Remove ${p.name}`}>✕</button>
                      )}
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-xl font-bold">{stats.characters.toLocaleString()}</span>
                      <span className="text-sm text-slate-500 dark:text-slate-400">/ {p.limit.toLocaleString()}</span>
                    </div>
                    <div className="mt-2"><Progress value={stats.characters} max={p.limit} tone={tone as "red" | "amber" | "green"} /></div>
                    <div className="mt-2 flex items-center justify-between gap-2 text-xs">
                      <span className={`font-semibold ${tone === "red" ? "text-rose-600 dark:text-rose-400" : tone === "amber" ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}`}>{label}</span>
                      <span className="text-slate-500 dark:text-slate-400">{stats.characters > p.limit ? `${(stats.characters - p.limit).toLocaleString()} over` : `${(p.limit - stats.characters).toLocaleString()} remaining`}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
              <Field label="New platform name" value={newName} onChange={setNewName} placeholder="e.g. Threads" />
              <Field label="Character limit" type="number" min={1} value={newLimit} onChange={setNewLimit} placeholder="500" />
              <Btn variant="primary" onClick={() => {
                const lim = parseInt(newLimit, 10);
                const nm = newName.trim();
                if (!nm || !Number.isFinite(lim) || lim <= 0) { setError("Enter a platform name and a positive limit."); return; }
                setPlatforms((prev) => [...prev, { id: `c_${Date.now()}`, name: nm, limit: lim, custom: true }]);
                setNewName(""); setNewLimit(""); setError(null);
              }}>+ Add platform</Btn>
            </div>
          </Section>
        </div>

        <AdSlot label="Advertisement" />

        {/* SEO */}
        <div className="mt-4" id="seo">
          <Section title="SEO Character Counter" subtitle="Meta title, meta description, URL slug and Google Ads limits">
            {/* Meta title */}
            <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-semibold">Meta Title</h3>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${seoTitle.length === 0 ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300" : seoTitle.length > 60 ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300" : seoTitle.length < 30 ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"}`}>
                  {seoTitle.length === 0 ? "Empty" : seoTitle.length > 60 ? "Too long" : seoTitle.length < 30 ? "A bit short" : "Good length"}
                </span>
              </div>
              <Field label="Title tag" value={seoTitle} onChange={setSeoTitle} placeholder="Best Character Counter Tool — Free Online" />
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-400">
                <span><strong>{seoTitle.length}</strong> characters</span>
                <span>{seoTitle.length > 60 ? `${seoTitle.length - 60} over the recommended 60` : `${60 - seoTitle.length} remaining (recommended 50–60)`}</span>
                <span>≈ {estimatePixels(seoTitle)} px</span>
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">Google usually truncates titles beyond roughly 600 pixels.</p>
            </div>

            {/* Meta description */}
            <div className="mt-3 rounded-xl border border-slate-200 p-3 dark:border-slate-800">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-semibold">Meta Description</h3>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${seoDesc.length === 0 ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300" : seoDesc.length > 160 ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300" : seoDesc.length < 70 ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"}`}>
                  {seoDesc.length === 0 ? "Empty" : seoDesc.length > 160 ? "Too long" : seoDesc.length < 70 ? "A bit short" : "Good length"}
                </span>
              </div>
              <label htmlFor="meta-desc" className="sr-only">Meta description</label>
              <textarea id="meta-desc" rows={3} value={seoDesc} onChange={(e) => setSeoDesc(e.target.value)}
                placeholder="Write a compelling summary of the page in about 150–160 characters."
                className="w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-400">
                <span><strong>{seoDesc.length}</strong> characters</span>
                <span>{seoDesc.length > 160 ? `${seoDesc.length - 160} over the recommended 160` : `${160 - seoDesc.length} remaining (recommended 150–160)`}</span>
                <span>≈ {estimatePixels(seoDesc, 7.5)} px</span>
              </div>
            </div>

            {/* Slug */}
            <div className="mt-3 rounded-xl border border-slate-200 p-3 dark:border-slate-800">
              <h3 className="mb-2 text-sm font-semibold">URL Slug Analyzer</h3>
              <Field label="URL slug" value={slug} onChange={setSlug} placeholder="best-character-counter-tool" />
              <ul className="mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-400">
                <li>Characters: <strong>{slug.length}</strong> · Words: <strong>{extractWords(slug).length}</strong></li>
                <li>Contains spaces: <strong className={/\s/.test(slug) ? "text-rose-600" : "text-emerald-600"}>{/\s/.test(slug) ? "Yes — replace with hyphens" : "No"}</strong></li>
                <li>Contains uppercase: <strong className={/[A-Z]/.test(slug) ? "text-amber-600" : "text-emerald-600"}>{/[A-Z]/.test(slug) ? "Yes — lowercase preferred" : "No"}</strong></li>
                <li>Special characters: <strong className={/[^a-z0-9-]/i.test(slug) ? "text-amber-600" : "text-emerald-600"}>{/[^a-z0-9-]/i.test(slug) ? "Yes" : "No"}</strong></li>
              </ul>
              {slugSuggestion && slugSuggestion !== slug && (
                <div className="mt-2 flex flex-wrap items-center gap-2 rounded-lg bg-indigo-50 p-2 text-xs dark:bg-indigo-950/40">
                  <span className="text-slate-600 dark:text-slate-300">Suggested slug:</span>
                  <code className="font-mono font-semibold text-indigo-700 dark:text-indigo-300">{slugSuggestion}</code>
                  <button type="button" onClick={() => setSlug(slugSuggestion)} className="rounded bg-indigo-600 px-2 py-0.5 text-white hover:bg-indigo-700">Use</button>
                </div>
              )}
            </div>

            {/* Google Ads */}
            <div className="mt-3 rounded-xl border border-slate-200 p-3 dark:border-slate-800">
              <h3 className="mb-2 text-sm font-semibold">Google Ads Style Analyzer</h3>
              <div className="grid gap-3 sm:grid-cols-3">
                {adHeads.map((h, i) => (
                  <div key={i}>
                    <Field label={`Headline ${i + 1}`} value={h} onChange={(v) => setAdHeads((prev) => prev.map((x, idx) => (idx === i ? v : x)))} placeholder="Up to 30 characters" />
                    <p className={`mt-1 text-xs ${h.length > 30 ? "text-rose-600" : "text-slate-500 dark:text-slate-400"}`}>{h.length} / 30{h.length > 30 ? ` · ${h.length - 30} over` : ""}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3">
                <label htmlFor="ad-desc" className="sr-only">Ad description</label>
                <textarea id="ad-desc" rows={2} value={adDesc} onChange={(e) => setAdDesc(e.target.value)}
                  placeholder="Description — up to 90 characters"
                  className="w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
                <p className={`mt-1 text-xs ${adDesc.length > 90 ? "text-rose-600" : "text-slate-500 dark:text-slate-400"}`}>{adDesc.length} / 90{adDesc.length > 90 ? ` · ${adDesc.length - 90} over` : ""}</p>
              </div>
            </div>

            <div className="mt-3">
              <Btn onClick={() => copy(`Meta Title (${seoTitle.length}): ${seoTitle}\nMeta Description (${seoDesc.length}): ${seoDesc}\nSlug: ${slug}`, "seo")}>{toast?.k === "seo" ? "✓ Copied" : "⧉ Copy SEO analysis"}</Btn>
            </div>
          </Section>
        </div>

        {/* Keywords */}
        <div className="mt-4" id="keywords">
          <Section title="Keyword Density Analyzer" subtitle="Unigrams, bigrams and trigrams with stop-word filtering">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">Show top</span>
                <select value={topN} onChange={(e) => setTopN(parseInt(e.target.value, 10))}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800">
                  <option value={10}>Top 10</option><option value={20}>Top 20</option><option value={50}>Top 50</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">Phrase length</span>
                <select value={ngram} onChange={(e) => setNgram(parseInt(e.target.value, 10) as 0 | 1 | 2 | 3)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800">
                  <option value={0}>All</option><option value={1}>Single words</option><option value={2}>Two-word</option><option value={3}>Three-word</option>
                </select>
              </label>
              <Field label="Filter keywords" value={kwFilter} onChange={setKwFilter} placeholder="Search…" />
              <label className="mt-5 inline-flex cursor-pointer items-center gap-2 text-sm">
                <input type="checkbox" checked={ignoreStop} onChange={(e) => setIgnoreStop(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-indigo-600" />
                Ignore stop words
              </label>
            </div>
            <div className="mt-3 flex flex-wrap gap-4 text-sm">
              <label className="inline-flex cursor-pointer items-center gap-2">
                <input type="checkbox" checked={caseSens} onChange={(e) => setCaseSens(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-indigo-600" />
                Case sensitive
              </label>
            </div>
            <div className="mt-3"><Field label="Custom stop words" value={customStop} onChange={setCustomStop} placeholder="Comma separated, e.g. ipsum, dolor" /></div>
            <div className="mt-4 overflow-x-auto">
              {visibleKeywords.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">{stats.words === 0 ? "Enter some text to see keyword analysis." : "No keywords match the current filters."}</p>
              ) : (
                <table className="w-full min-w-[420px] border-collapse text-sm">
                  <caption className="sr-only">Keyword frequency and density</caption>
                  <thead>
                    <tr className="border-b border-slate-200 text-left dark:border-slate-700">
                      <th scope="col" className="py-2 pr-3 font-semibold">Keyword</th>
                      <th scope="col" className="py-2 pr-3 font-semibold">Length</th>
                      <th scope="col" className="py-2 pr-3 text-right font-semibold">Count</th>
                      <th scope="col" className="py-2 text-right font-semibold">Density</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleKeywords.map((k) => (
                      <tr key={`${k.n}-${k.keyword}`} className="border-b border-slate-100 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40">
                        <td className="py-2 pr-3 break-words">{k.keyword}</td>
                        <td className="py-2 pr-3 text-slate-500 dark:text-slate-400">{k.n} word{k.n > 1 ? "s" : ""}</td>
                        <td className="py-2 pr-3 text-right tabular-nums">{k.count}</td>
                        <td className="py-2 text-right tabular-nums">{k.density.toFixed(2)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div className="mt-3">
              <Btn onClick={() => copy(visibleKeywords.map((k) => `${k.keyword}\t${k.count}\t${k.density}%`).join("\n"), "kw")} disabled={visibleKeywords.length === 0}>
                {toast?.k === "kw" ? "✓ Copied" : "⧉ Copy keyword table"}
              </Btn>
            </div>
          </Section>
        </div>

        {/* Readability */}
        <div className="mt-4">
          <Section title="Readability Analyzer" subtitle="Flesch Reading Ease, Flesch–Kincaid and Gunning Fog">
            {!readability ? (
              <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-800/50 dark:text-slate-400">Not enough text for reliable readability analysis. Write at least 20 words to see scores.</p>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
                  <Stat label="Flesch Reading Ease" value={readability.flesch} accent />
                  <Stat label="Flesch–Kincaid Grade" value={readability.fk} />
                  <Stat label="Gunning Fog" value={readability.fog} />
                  <Stat label="Avg sentence length" value={readability.asl} />
                  <Stat label="Avg word length" value={readability.asw} />
                  <Stat label="Complex words" value={readability.complex} />
                </div>
                <div className="mt-4 rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                  <p className="text-sm">Overall readability: <strong className="text-indigo-600 dark:text-indigo-400">{readability.label}</strong></p>
                  <dl className="mt-3 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                    <div><dt className="font-semibold">Flesch Reading Ease</dt><dd>0–30 very difficult, 30–50 difficult, 50–60 fairly difficult, 60–70 standard, 70–80 fairly easy, 80–90 easy, 90–100 very easy.</dd></div>
                    <div><dt className="font-semibold">Flesch–Kincaid Grade Level</dt><dd>Approximates the US school grade needed to understand the text. A score of 8 ≈ eighth grade.</dd></div>
                    <div><dt className="font-semibold">Gunning Fog Index</dt><dd>Estimates years of formal education required. Lower is easier. Above 17 = very difficult.</dd></div>
                  </dl>
                  <p className="mt-3 text-xs text-amber-700 dark:text-amber-400">Syllable estimation is designed for English. Scores for other scripts are indicative only.</p>
                </div>
              </>
            )}
          </Section>
        </div>

        {/* Quality */}
        <div className="mt-4">
          <Section title="Text Quality Analyzer" subtitle="Long sentences, repetition, filler words and more">
            {quality.length === 0 ? (
              <p className="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                {text.trim() ? "No obvious issues detected. Your text looks clean." : "Enter some text to run the quality analysis."}
              </p>
            ) : (
              <ul className="space-y-2">
                {quality.map((issue, i) => (
                  <li key={i} className={`rounded-xl border p-3 text-sm ${issue.sev === "err" ? "border-rose-200 bg-rose-50 dark:border-rose-900 dark:bg-rose-950/30" : issue.sev === "warn" ? "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30" : "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40"}`}>
                    <p className="font-semibold">{issue.title}</p>
                    <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">{issue.detail}</p>
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </div>

        {/* Case converter */}
        <div className="mt-4">
          <Section title="Text Case Converter" subtitle="UPPERCASE, Title Case, camelCase, snake_case and more">
            <div className="flex flex-wrap gap-2">
              {(["UPPER", "lower", "Title", "Sentence", "camel", "Pascal", "snake", "kebab", "CONSTANT", "dot"] as const).map((key) => (
                <Btn key={key} onClick={() => setCaseResult(caseOps[key](text))}>{key}</Btn>
              ))}
            </div>
            {caseResult && (
              <div className="mt-3">
                <label htmlFor="case-out" className="sr-only">Converted text</label>
                <textarea id="case-out" readOnly rows={4} value={caseResult}
                  className="w-full resize-y rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 font-mono text-sm dark:border-slate-700 dark:bg-slate-800" />
                <div className="mt-2 flex flex-wrap gap-2">
                  <Btn onClick={() => copy(caseResult, "case")}>{toast?.k === "case" ? "✓ Copied" : "⧉ Copy"}</Btn>
                  <Btn variant="primary" onClick={() => setText(caseResult)}>Replace editor text</Btn>
                  <Btn onClick={() => downloadFile("converted.txt", caseResult, "text/plain")}>⭳ Download</Btn>
                </div>
              </div>
            )}
          </Section>
        </div>

        {/* Cleaner */}
        <div className="mt-4">
          <Section title="Text Cleaner" subtitle="Tidy spacing, blank lines, duplicates and whitespace">
            <div className="flex flex-wrap gap-2">
              {([["Extra spaces", "extraSpaces"], ["Trim lines", "trimLines"], ["No blank lines", "noBlankLines"], ["No extra breaks", "noExtraBreaks"], ["De-dup lines", "dedupLines"], ["De-dup words", "dedupWords"], ["Normalize", "normalize"], ["Remove numbers", "noNumbers"], ["Remove emojis", "noEmoji"]] as const).map(([l, k]) => (
                <Btn key={k} onClick={() => { setText(cleanOps[k](text)); flash("clean", "Applied"); }}>{l}</Btn>
              ))}
            </div>
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Every action modifies the editor text directly. Use Undo (Ctrl/Cmd + Z outside the editor) to revert.</p>
          </Section>
        </div>

        {/* Find replace */}
        <div className="mt-4">
          <Section title="Find & Replace" subtitle="Search, count matches and replace">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Find" value={findT} onChange={setFindT} placeholder="Search text…" />
              <Field label="Replace with" value={replT} onChange={setReplT} placeholder="Replacement text…" />
            </div>
            <div className="mt-3 flex flex-wrap gap-4 text-sm">
              <label className="inline-flex cursor-pointer items-center gap-2">
                <input type="checkbox" checked={findCase} onChange={(e) => setFindCase(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-indigo-600" />
                Case sensitive
              </label>
              <label className="inline-flex cursor-pointer items-center gap-2">
                <input type="checkbox" checked={findWord} onChange={(e) => setFindWord(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-indigo-600" />
                Whole word
              </label>
            </div>
            <p aria-live="polite" className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-300">{findT ? `${matchCount} match${matchCount === 1 ? "" : "es"} found` : "Enter text to search"}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Btn onClick={() => doReplace(false)} disabled={matchCount === 0}>Replace</Btn>
              <Btn variant="primary" onClick={() => doReplace(true)} disabled={matchCount === 0}>Replace All</Btn>
            </div>
          </Section>
        </div>

        {/* Sort / reverse */}
        <div className="mt-4">
          <Section title="Sorting & Text Reversal" subtitle="Organise lines or reverse text, words and characters">
            <h3 className="mb-2 text-sm font-semibold">Sorting</h3>
            <div className="flex flex-wrap gap-2">
              {([["A–Z", "az"], ["Z–A", "za"], ["Numeric", "num"], ["By length", "len"], ["Reverse lines", "revLines"]] as const).map(([l, k]) => (
                <Btn key={k} onClick={() => setText(sortOps[k](text))}>{l}</Btn>
              ))}
            </div>
            <h3 className="mb-2 mt-5 text-sm font-semibold">Reversal</h3>
            <div className="flex flex-wrap gap-2">
              {([["Reverse entire text", "reverseText"], ["Reverse words", "reverseWords"], ["Reverse each line", "reverseEachLine"]] as const).map(([l, k]) => (
                <Btn key={k} onClick={() => setText(revOps[k](text))}>{l}</Btn>
              ))}
            </div>
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Example: “Hello World” → reverse words → “World Hello”. Reversal is grapheme-aware, so emojis and Devanagari clusters are not broken.</p>
          </Section>
        </div>

        {/* Academic */}
        <div className="mt-4">
          <Section title="Academic Writing Tools" subtitle="Essay, abstract, thesis and page estimation helpers">
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
              <Stat label="Essay word count" value={stats.words.toLocaleString()} />
              <Stat label="Abstract word count" value={stats.words.toLocaleString()} />
              <Stat label="Thesis word count" value={stats.words.toLocaleString()} />
              <Stat label="Paragraph count" value={stats.paragraphs.toLocaleString()} />
              <Stat label="Citation count" value={(debounced.match(/\([^)]*\d{4}[^)]*\)|\[\d+\]/g) ?? []).length.toLocaleString()} />
              <Stat label="Estimated pages" value={estPages} />
              <Stat label="Characters (no spaces)" value={stats.charsNoSpace.toLocaleString()} />
              <Stat label="Avg sentence length" value={stats.avgSentenceLen.toFixed(2)} />
            </div>
            <div className="mt-4">
              <Field label="Assignment target (words)" type="number" min={0} value={goalW} onChange={(v) => setGoalW(Math.max(0, parseInt(v, 10) || 0))} />
              {goalW > 0 && (
                <div className="mt-3">
                  <div className="mb-1 flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span className="font-medium">{stats.words.toLocaleString()} / {goalW.toLocaleString()} words</span>
                    <span className="text-slate-600 dark:text-slate-400">{stats.words >= goalW ? "Target reached 🎉" : `${(goalW - stats.words).toLocaleString()} words remaining`}</span>
                  </div>
                  <Progress value={stats.words} max={goalW} tone={stats.words >= goalW ? "green" : "indigo"} />
                </div>
              )}
            </div>
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Citation counting detects patterns such as <code>(Smith, 2020)</code> and <code>[1]</code>. It is a rough estimate.</p>
          </Section>
        </div>

        {/* Page calc */}
        <div className="mt-4">
          <Section title="Page Calculator" subtitle="Estimate how many pages your text will occupy">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">Paper size</span>
                <select value={paper} onChange={(e) => setPaper(e.target.value as "A4" | "Letter")}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800">
                  <option value="A4">A4</option><option value="Letter">Letter</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">Font</span>
                <select value={font} onChange={(e) => setFont(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800">
                  <option>Times New Roman</option><option>Arial</option><option>Calibri</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">Font size</span>
                <select value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800">
                  <option value={10}>10 pt</option><option value={11}>11 pt</option><option value={12}>12 pt</option><option value={14}>14 pt</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">Line spacing</span>
                <select value={lineSpacing} onChange={(e) => setLineSpacing(parseFloat(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800">
                  <option value={1}>Single</option><option value={1.15}>1.15</option><option value={1.5}>1.5</option><option value={2}>Double</option>
                </select>
              </label>
            </div>
            <div className="mt-4 rounded-xl border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-900 dark:bg-indigo-950/40">
              <p className="text-sm text-slate-700 dark:text-slate-300">Estimated pages</p>
              <p className="text-3xl font-extrabold text-indigo-700 dark:text-indigo-300">{estPages}</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Estimate only. Actual page count depends on margins, headers, footers, images and tables.</p>
            </div>
          </Section>
        </div>

        {/* Import/Export */}
        <div className="mt-4">
          <Section title="Import & Export" subtitle="Load a file or download your text and statistics">
            <div className="flex flex-wrap items-center gap-2">
              <input ref={fileRef} type="file" accept=".txt,.csv,.json,.md,.markdown,.log,.html,.htm" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleFile(f); e.target.value = ""; }} />
              <Btn variant="primary" onClick={() => fileRef.current?.click()}>⭱ Import file</Btn>
              <Btn onClick={() => exportAs("txt")}>⭳ TXT</Btn>
              <Btn onClick={() => exportAs("md")}>⭳ Markdown</Btn>
              <Btn onClick={() => exportAs("html")}>⭳ HTML</Btn>
              <Btn onClick={() => exportAs("json")}>⭳ JSON</Btn>
              <Btn onClick={() => exportAs("csv")}>⭳ CSV (stats)</Btn>
            </div>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Supported import: TXT, CSV, JSON, Markdown, HTML, LOG. All reading happens locally.</p>
          </Section>
        </div>

        {/* Local draft */}
        <div className="mt-4">
          <Section title="Local Draft & Privacy" subtitle="Auto-save your text in this browser only">
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <label className="inline-flex cursor-pointer items-center gap-2">
                <input type="checkbox" checked={autoSave} onChange={(e) => setAutoSave(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-indigo-600" />
                Auto-save draft in this browser
              </label>
              <Btn onClick={restoreDraft} disabled={!hasDraft}>Restore previous draft</Btn>
              <Btn onClick={clearDraft} variant="danger" disabled={!hasDraft}>Clear saved draft</Btn>
            </div>
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Your text is processed locally in your browser and never uploaded to a server. If auto-save is enabled, the draft is stored in your browser&apos;s localStorage and remains on this device until you clear it.</p>
          </Section>
        </div>

        <AdSlot label="Advertisement" />

        {/* Feature guide */}
        <section id="guide" className="mt-8">
          <h2 className="text-xl font-bold sm:text-2xl">Feature Guide</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Detailed instructions for every tool on this page.</p>
          <div className="mt-4 space-y-2">
            {FEATURE_GUIDES.map((g) => (
              <details key={g.title} className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
                <summary className="cursor-pointer list-none text-sm font-semibold marker:hidden sm:text-base">
                  <span className="flex items-center justify-between gap-3">
                    {g.title}
                    <span aria-hidden="true" className="shrink-0 text-slate-400 transition-transform group-open:rotate-45">+</span>
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{g.body}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Informational content */}
        <section className="mt-8 space-y-4">
          <h2 className="text-xl font-bold sm:text-2xl">About the Character Counter</h2>
          {[
            { h: "What Is a Character Counter?", p: "A character counter is a text tool that counts every character in a piece of writing. It is used constantly by social media managers, SEO specialists, students and writers because most publishing platforms enforce strict character limits on titles, captions, bios and descriptions. A good counter doesn't just give one number — it separates letters, digits, spaces, punctuation and emojis so you can see exactly how your text is composed." },
            { h: "Characters With Spaces vs Without Spaces", p: "Every space, tab and line break occupies a character position. So the phrase 'Hello World' is 11 characters with spaces and 10 without. Because X, Instagram, Google Ads and most other platforms count spaces towards the limit, the 'with spaces' figure is usually the one that matters for compliance. The 'without spaces' figure is more useful for academic requirements or systems that strip whitespace." },
            { h: "Character Count vs Word Count", p: "Character count measures individual units of text; word count measures groups of characters separated by whitespace. In English, an average word is about five characters plus one space, so roughly 1,000 characters equals 160–180 words. That ratio breaks down for long technical terms, CJK text or Devanagari, which is why this tool reports both separately." },
            { h: "How Reading Time Is Calculated", p: "Reading time is estimated as word count divided by reading speed in words per minute. The default here is 200 WPM, the average silent reading rate for adult native English speakers. Speaking is slower — around 130 WPM — so presentations and voiceovers are usually given a separate, longer estimate. Both values can be adjusted to match a specific audience or narrator." },
            { h: "Character Counter for Students", p: "University assignments often specify limits in words, but applications, personal statements and scholarship essays frequently use character limits. Using a counter that distinguishes characters-with-spaces from words helps students meet both kinds of requirement without last-minute panic." },
            { h: "Character Counter for Writers", p: "Novelists and journalists work to word counts, but copywriters and content marketers often work to character counts. A headline of 60 characters, a meta description of 155 and a tweet of 280 all demand precise measurement. Live counting while writing avoids drafting long and trimming down afterwards." },
            { h: "Social Media Character Limits", p: "Each platform sets its own limits. X posts allow 280 characters, Instagram captions 2,200 and Instagram bios 150. LinkedIn headlines allow 220 and YouTube titles 100. Going over a limit usually results in truncated text or a rejected post, which is why a per-platform checker is more useful than a single global count." },
            { h: "SEO Character Counting", p: "Search engines display meta titles and descriptions at fixed pixel widths rather than fixed character counts, but character counts are a reliable proxy. Aim for 50–60 characters in a title and 150–160 in a description. Titles that run long are truncated with an ellipsis, which can hide your key phrase, so keeping within the recommended range improves click-through rates." },
          ].map((x) => (
            <article key={x.h} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md sm:p-5 dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-base font-semibold sm:text-lg">{x.h}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{x.p}</p>
            </article>
          ))}
        </section>

        {/* FAQ */}
        <section id="faq" className="mt-8">
          <h2 className="text-xl font-bold sm:text-2xl">Frequently Asked Questions</h2>
          <div className="mt-4 space-y-2">
            {FAQS.map((f, i) => (
              <details key={i} className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
                <summary className="cursor-pointer list-none text-sm font-semibold marker:hidden sm:text-base">
                  <span className="flex items-center justify-between gap-3">
                    {f.q}
                    <span aria-hidden="true" className="shrink-0 text-slate-400 transition-transform group-open:rotate-45">+</span>
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Other tools */}
        <section className="mt-8">
          <h2 className="text-xl font-bold sm:text-2xl">Other Useful Tools</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Related text utilities planned for this site.</p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {["Word Counter","Text Case Converter","Keyword Density Checker","Lorem Ipsum Generator","Meta Tag Generator","Slug Generator","Reading Time Calculator","Text Cleaner","Random Word Generator"].map((n) => (
              <div key={n} aria-disabled="true" className="cursor-not-allowed rounded-xl border border-slate-200 bg-white p-4 text-sm font-medium text-slate-400 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900" title="Coming soon">
                {n}
                <span className="mt-1 block text-xs font-normal">Coming soon</span>
              </div>
            ))}
          </div>
        </section>

        <AdSlot label="Advertisement" />

        {/* Footer */}
        <footer className="mt-10 border-t border-slate-200 pt-6 pb-10 text-sm dark:border-slate-800">
          <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-2 text-slate-600 dark:text-slate-400">
            {[["About","/about"],["Contact","/contact"],["Privacy Policy","/privacy"],["Terms & Conditions","/terms"],["Disclaimer","/disclaimer"]].map(([l, h]) => (
              <a key={h} href={h} className="transition hover:text-slate-900 dark:hover:text-white">{l}</a>
            ))}
          </nav>
          <p className="mt-4 text-xs text-slate-500 dark:text-slate-500">Textlyzer — Character Counter &amp; Writing Assistant. All text processing happens locally in your browser.</p>
        </footer>
      </main>

      {/* Toast */}
      <div aria-live="polite" role="status" className="pointer-events-none fixed bottom-5 left-1/2 z-50 -translate-x-1/2">
        {toast && <span className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-lg dark:bg-slate-100 dark:text-slate-900">{toast.m}</span>}
      </div>
    </div>
  );
}
