"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

/* ══════════════════════════════════════════════════════════════════════════
   1. TYPES
   ══════════════════════════════════════════════════════════════════════════ */

interface TextStats {
  characters: number;
  charactersWithSpaces: number;
  charactersWithoutSpaces: number;
  utf16: number;
  utf8: number;
  letters: number;
  uppercase: number;
  lowercase: number;
  digits: number;
  spaces: number;
  tabs: number;
  newlines: number;
  whitespace: number;
  punctuation: number;
  symbols: number;
  emojis: number;
  uniqueCharacters: number;
  words: number;
  uniqueWords: number;
  sentences: number;
  paragraphs: number;
  lines: number;
  avgWordLength: number;
  longestWord: string;
  shortestWord: string;
  avgSentenceLength: number;
}

interface PlatformLimit {
  id: string;
  name: string;
  limit: number;
  custom?: boolean;
}

interface KeywordRow {
  keyword: string;
  count: number;
  density: number;
  n: number;
}

interface ReadabilityResult {
  fleschReadingEase: number;
  fleschKincaidGrade: number;
  gunningFog: number;
  avgSentenceLength: number;
  avgWordLength: number;
  complexWords: number;
  label: string;
}

interface QualityIssue {
  severity: "info" | "warn" | "error";
  title: string;
  detail: string;
}

/* ══════════════════════════════════════════════════════════════════════════
   2. UNICODE HELPERS
   ══════════════════════════════════════════════════════════════════════════ */

type SegmenterLike = {
  segment(input: string): Iterable<{ segment: string }>;
};

const SegmenterCtor = (
  Intl as unknown as {
    Segmenter?: new (
      locales?: string | string[],
      options?: { granularity: "grapheme" | "word" | "sentence" }
    ) => SegmenterLike;
  }
).Segmenter;

const graphemeSegmenter: SegmenterLike | null = SegmenterCtor
  ? new SegmenterCtor("en", { granularity: "grapheme" })
  : null;

/** Split text into user-perceived characters (grapheme clusters). */
export function toGraphemes(input: string): string[] {
  if (!input) return [];
  if (graphemeSegmenter) {
    const out: string[] = [];
    for (const part of graphemeSegmenter.segment(input)) out.push(part.segment);
    return out;
  }
  return Array.from(input); // code-point fallback
}

const RE_EMOJI = /\p{Extended_Pictographic}/u;
const RE_REGIONAL = /[\u{1F1E6}-\u{1F1FF}]/u;
const RE_LETTER = /\p{L}/u;
const RE_UPPER = /\p{Lu}/u;
const RE_LOWER = /\p{Ll}/u;
const RE_DIGIT = /\p{N}/u;
const RE_PUNCT = /\p{P}/u;
const RE_SYMBOL = /\p{S}/u;
const RE_WS = /\s/u;

function isEmojiGrapheme(g: string): boolean {
  return RE_EMOJI.test(g) || RE_REGIONAL.test(g);
}

const WORD_RE = /[\p{L}\p{N}\p{M}]+(?:['’-][\p{L}\p{N}\p{M}]+)*/gu;

function extractWords(text: string): string[] {
  if (!text) return [];
  return text.match(WORD_RE) ?? [];
}

function countSentences(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  const parts = trimmed.split(/[.!?…।]+/).filter((p) => p.trim().length > 0);
  return Math.max(1, parts.length);
}

function countParagraphs(text: string): number {
  if (!text.trim()) return 0;
  return text.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length;
}

function countLines(text: string): number {
  if (!text) return 0;
  return text.split(/\r\n|\r|\n/).length;
}

/* ══════════════════════════════════════════════════════════════════════════
   3. CORE ANALYSIS
   ══════════════════════════════════════════════════════════════════════════ */

function analyzeText(text: string): TextStats {
  const graphemes = toGraphemes(text);
  const characters = graphemes.length;

  let letters = 0;
  let uppercase = 0;
  let lowercase = 0;
  let digits = 0;
  let spaces = 0;
  let tabs = 0;
  let newlines = 0;
  let otherWs = 0;
  let punctuation = 0;
  let symbols = 0;
  let emojis = 0;

  const uniqueSet = new Set<string>();

  for (const g of graphemes) {
    uniqueSet.add(g);
    const emoji = isEmojiGrapheme(g);
    if (emoji) emojis++;

    if (g === " ") spaces++;
    else if (g === "\t") tabs++;
    else if (g === "\n" || g === "\r") newlines++;
    else if (RE_WS.test(g)) otherWs++;
    else if (RE_LETTER.test(g)) {
      letters++;
      if (RE_UPPER.test(g)) uppercase++;
      else if (RE_LOWER.test(g)) lowercase++;
    } else if (RE_DIGIT.test(g)) digits++;
    else if (RE_PUNCT.test(g)) punctuation++;
    else if (RE_SYMBOL.test(g) && !emoji) symbols++;
  }

  const whitespace = spaces + tabs + newlines + otherWs;

  const wordList = extractWords(text);
  const words = wordList.length;
  const lowerWords = wordList.map((w) => w.toLowerCase());
  const uniqueWords = new Set(lowerWords).size;

  const wordLengths = wordList.map((w) => toGraphemes(w).length);
  const totalWordLength = wordLengths.reduce((a, b) => a + b, 0);

  let longestWord = "";
  let shortestWord = "";
  if (wordList.length > 0) {
    let maxLen = -1;
    let minLen = Infinity;
    wordList.forEach((w, i) => {
      if (wordLengths[i] > maxLen) {
        maxLen = wordLengths[i];
        longestWord = w;
      }
      if (wordLengths[i] < minLen) {
        minLen = wordLengths[i];
        shortestWord = w;
      }
    });
  }

  const sentences = countSentences(text);

  const utf8 =
    typeof TextEncoder !== "undefined"
      ? new TextEncoder().encode(text).length
      : text.length;

  return {
    characters,
    charactersWithSpaces: characters,
    charactersWithoutSpaces: characters - whitespace,
    utf16: text.length,
    utf8,
    letters,
    uppercase,
    lowercase,
    digits,
    spaces,
    tabs,
    newlines,
    whitespace,
    punctuation,
    symbols,
    emojis,
    uniqueCharacters: uniqueSet.size,
    words,
    uniqueWords,
    sentences,
    paragraphs: countParagraphs(text),
    lines: countLines(text),
    avgWordLength: words ? +(totalWordLength / words).toFixed(2) : 0,
    longestWord,
    shortestWord,
    avgSentenceLength: sentences ? +(words / sentences).toFixed(2) : 0,
  };
}

/* ══════════════════════════════════════════════════════════════════════════
   4. READABILITY
   ══════════════════════════════════════════════════════════════════════════ */

/** Approximate English syllable count. Non-Latin scripts fall back to 1. */
function countSyllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!w) return 1;
  if (w.length <= 3) return 1;
  const stripped = w
    .replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "")
    .replace(/^y/, "");
  const groups = stripped.match(/[aeiouy]{1,2}/g);
  return groups ? groups.length : 1;
}

function analyzeReadability(text: string): ReadabilityResult | null {
  const words = extractWords(text);
  const wordCount = words.length;
  const sentenceCount = countSentences(text);
  if (wordCount < 20) return null;

  let totalSyllables = 0;
  let complexWords = 0;
  let totalLetters = 0;

  for (const w of words) {
    const s = countSyllables(w);
    totalSyllables += s;
    if (s >= 3) complexWords++;
    totalLetters += toGraphemes(w).length;
  }

  const asl = wordCount / sentenceCount;
  const asw = totalSyllables / wordCount;

  const fre = 206.835 - 1.015 * asl - 84.6 * asw;
  const fkgl = 0.39 * asl + 11.8 * asw - 15.59;
  const fog = 0.4 * (asl + 100 * (complexWords / wordCount));

  let label = "Moderate";
  if (fre >= 90) label = "Very Easy";
  else if (fre >= 80) label = "Easy";
  else if (fre >= 70) label = "Fairly Easy";
  else if (fre >= 60) label = "Standard";
  else if (fre >= 50) label = "Fairly Difficult";
  else if (fre >= 30) label = "Difficult";
  else label = "Very Difficult";

  return {
    fleschReadingEase: +fre.toFixed(1),
    fleschKincaidGrade: +fkgl.toFixed(1),
    gunningFog: +fog.toFixed(1),
    avgSentenceLength: +asl.toFixed(2),
    avgWordLength: +(totalLetters / wordCount).toFixed(2),
    complexWords,
    label,
  };
}

/* ══════════════════════════════════════════════════════════════════════════
   5. KEYWORD DENSITY
   ══════════════════════════════════════════════════════════════════════════ */

const DEFAULT_STOP_WORDS = new Set([
  "a","about","above","after","again","against","all","am","an","and","any","are","as","at",
  "be","because","been","before","being","below","between","both","but","by",
  "can","cannot","could","did","do","does","doing","down","during",
  "each","few","for","from","further","had","has","have","having","he","her","here","hers",
  "herself","him","himself","his","how","i","if","in","into","is","it","its","itself",
  "just","me","more","most","my","myself","no","nor","not","now","of","off","on","once",
  "only","or","other","our","ours","ourselves","out","over","own","same","she","should",
  "so","some","such","than","that","the","their","theirs","them","themselves","then","there",
  "these","they","this","those","through","to","too","under","until","up","very",
  "was","we","were","what","when","where","which","while","who","whom","why","will","with",
  "you","your","yours","yourself","yourselves","है","का","के","की","और","में","से","को","पर","यह","वह","एक","था","थी","थे",
]);

function analyzeKeywords(
  text: string,
  options: {
    topN: number;
    ignoreStopWords: boolean;
    caseSensitive: boolean;
    customStopWords: string[];
    filter: string;
  }
): KeywordRow[] {
  const raw = extractWords(text);
  if (raw.length === 0) return [];

  const normalise = (w: string) => (options.caseSensitive ? w : w.toLowerCase());
  const stop = new Set<string>();
  if (options.ignoreStopWords) {
    DEFAULT_STOP_WORDS.forEach((w) => stop.add(normalise(w)));
    options.customStopWords.forEach((w) => {
      const t = w.trim();
      if (t) stop.add(normalise(t));
    });
  }

  const tokens = raw.map(normalise).filter((w) => !stop.has(w));
  if (tokens.length === 0) return [];

  const counts = new Map<string, number>();
  const add = (k: string) => counts.set(k, (counts.get(k) ?? 0) + 1);

  for (const t of tokens) add(t);
  for (let i = 0; i < tokens.length - 1; i++) add(`${tokens[i]} ${tokens[i + 1]}`);
  for (let i = 0; i < tokens.length - 2; i++)
    add(`${tokens[i]} ${tokens[i + 1]} ${tokens[i + 2]}`);

  const total = tokens.length;
  const filter = options.filter.trim().toLowerCase();

  const rows: KeywordRow[] = [];
  counts.forEach((count, keyword) => {
    if (filter && !keyword.toLowerCase().includes(filter)) return;
    const n = keyword.split(" ").length;
    rows.push({
      keyword,
      count,
      density: +((count / total) * 100).toFixed(2),
      n,
    });
  });

  rows.sort((a, b) => b.count - a.count || a.keyword.localeCompare(b.keyword));
  return rows.slice(0, options.topN);
}

/* ══════════════════════════════════════════════════════════════════════════
   6. TEXT QUALITY
   ══════════════════════════════════════════════════════════════════════════ */

const FILLER_WORDS = [
  "very","really","just","actually","basically","literally","quite","simply",
  "totally","definitely","absolutely","certainly","clearly","obviously",
];

const WEAK_PHRASES = [
  "in order to","due to the fact that","at this point in time","in the event that",
  "for the purpose of","with regard to","in spite of the fact that","a lot of",
  "kind of","sort of","as a matter of fact",
];

function analyzeQuality(text: string): QualityIssue[] {
  const issues: QualityIssue[] = [];
  const trimmed = text.trim();
  if (!trimmed) return issues;

  // ── Sentence length
  const rawSentences = trimmed
    .split(/(?<=[.!?…।])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  rawSentences.forEach((sentence, idx) => {
    const wc = extractWords(sentence).length;
    if (wc > 35) {
      issues.push({
        severity: "warn",
        title: `Sentence ${idx + 1} is ${wc} words long`,
        detail: `"${sentence.slice(0, 90)}${sentence.length > 90 ? "…" : ""}" — consider splitting it into two or three shorter sentences.`,
      });
    } else if (wc > 0 && wc < 4 && rawSentences.length > 3) {
      issues.push({
        severity: "info",
        title: `Sentence ${idx + 1} is very short (${wc} word${wc > 1 ? "s" : ""})`,
        detail: `"${sentence}" — short sentences can be punchy, but too many in a row feel choppy.`,
      });
    }
  });

  // ── Paragraph length
  const paragraphs = trimmed.split(/\n\s*\n/).filter((p) => p.trim());
  paragraphs.forEach((p, idx) => {
    const wc = extractWords(p).length;
    if (wc > 200) {
      issues.push({
        severity: "warn",
        title: `Paragraph ${idx + 1} is ${wc} words long`,
        detail: "Long paragraphs are hard to scan. Aim for 60–120 words per paragraph.",
      });
    }
  });

  // ── Repeated words in a row ("the the")
  const repeatMatches = trimmed.match(/\b([\p{L}]+)\s+\1\b/giu);
  if (repeatMatches && repeatMatches.length) {
    issues.push({
      severity: "error",
      title: `${repeatMatches.length} duplicated word${repeatMatches.length > 1 ? "s" : ""} found`,
      detail: `Examples: ${repeatMatches.slice(0, 5).join(", ")}`,
    });
  }

  // ── Excessive punctuation
  const exclamations = (trimmed.match(/!/g) ?? []).length;
  const questions = (trimmed.match(/\?/g) ?? []).length;
  const multiPunct = trimmed.match(/[!?.,]{3,}/g) ?? [];

  if (multiPunct.length) {
    issues.push({
      severity: "warn",
      title: `${multiPunct.length} run${multiPunct.length > 1 ? "s" : ""} of repeated punctuation`,
      detail: `Examples: ${multiPunct.slice(0, 5).join("  ")}`,
    });
  }
  if (exclamations > 5) {
    issues.push({
      severity: "info",
      title: `${exclamations} exclamation marks`,
      detail: "Frequent exclamation marks weaken professional writing.",
    });
  }
  if (questions > 8) {
    issues.push({
      severity: "info",
      title: `${questions} question marks`,
      detail: "Consider converting some rhetorical questions into statements.",
    });
  }

  // ── Excessive capitalisation
  const shouty = trimmed.match(/\b[A-Z]{4,}\b/g) ?? [];
  if (shouty.length > 2) {
    issues.push({
      severity: "info",
      title: `${shouty.length} ALL-CAPS words`,
      detail: `Examples: ${shouty.slice(0, 6).join(", ")} — all-caps text reads as shouting.`,
    });
  }

  // ── Filler words
  const lower = trimmed.toLowerCase();
  const foundFillers = FILLER_WORDS.filter((f) =>
    new RegExp(`\\b${f}\\b`, "i").test(lower)
  );
  if (foundFillers.length) {
    issues.push({
      severity: "info",
      title: `${foundFillers.length} filler word${foundFillers.length > 1 ? "s" : ""} detected`,
      detail: `Found: ${foundFillers.join(", ")}. Removing them usually makes writing tighter.`,
    });
  }

  // ── Weak phrases
  const foundWeak = WEAK_PHRASES.filter((p) => lower.includes(p));
  if (foundWeak.length) {
    issues.push({
      severity: "info",
      title: `${foundWeak.length} wordy phrase${foundWeak.length > 1 ? "s" : ""}`,
      detail: `Found: ${foundWeak.join(" · ")}. Try shorter alternatives.`,
    });
  }

  return issues;
}

/* ══════════════════════════════════════════════════════════════════════════
   7. CASE CONVERTERS
   ══════════════════════════════════════════════════════════════════════════ */

const capitalize = (w: string) =>
  w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : w;

const caseOps = {
  uppercase: (t: string) => t.toUpperCase(),
  lowercase: (t: string) => t.toLowerCase(),
  titleCase: (t: string) =>
    t.replace(/[\p{L}\p{N}'’-]+/gu, (w) => capitalize(w)),
  sentenceCase: (t: string) =>
    t
      .toLowerCase()
      .replace(/(^\s*[\p{L}\p{N}]|[.!?…।]\s+[\p{L}\p{N}])/gu, (m) =>
        m.toUpperCase()
      ),
  capitalizeEachWord: (t: string) =>
    t.replace(/[\p{L}\p{N}'’-]+/gu, (w) => capitalize(w)),
  camelCase: (t: string) => {
    const w = extractWords(t);
    return w
      .map((x, i) => (i === 0 ? x.toLowerCase() : capitalize(x)))
      .join("");
  },
  pascalCase: (t: string) =>
    extractWords(t)
      .map((x) => capitalize(x))
      .join(""),
  snakeCase: (t: string) =>
    extractWords(t)
      .map((x) => x.toLowerCase())
      .join("_"),
  kebabCase: (t: string) =>
    extractWords(t)
      .map((x) => x.toLowerCase())
      .join("-"),
  constantCase: (t: string) =>
    extractWords(t)
      .map((x) => x.toUpperCase())
      .join("_"),
  dotCase: (t: string) =>
    extractWords(t)
      .map((x) => x.toLowerCase())
      .join("."),
};

/* ══════════════════════════════════════════════════════════════════════════
   8. CLEANERS / TRANSFORMS
   ══════════════════════════════════════════════════════════════════════════ */

const cleanerOps = {
  removeExtraSpaces: (t: string) => t.replace(/[ \t]{2,}/g, " "),
  trimSpaces: (t: string) => t.split("\n").map((l) => l.trim()).join("\n"),
  removeBlankLines: (t: string) =>
    t.split("\n").filter((l) => l.trim().length > 0).join("\n"),
  removeExtraLineBreaks: (t: string) => t.replace(/\n{3,}/g, "\n\n"),
  removeDuplicateLines: (t: string) => {
    const seen = new Set<string>();
    return t
      .split("\n")
      .filter((l) => {
        const key = l.trim();
        if (!key) return true;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .join("\n");
  },
  removeDuplicateWords: (t: string) => t.replace(/\b([\p{L}]+)(\s+\1\b)+/giu, "$1"),
  normalizeWhitespace: (t: string) => t.replace(/\s+/g, " ").trim(),
  removeLeadingSpaces: (t: string) => t.replace(/^[ \t]+/gm, ""),
  removeTrailingSpaces: (t: string) => t.replace(/[ \t]+$/gm, ""),
};

const sortOps = {
  sortAZ: (t: string) =>
    t.split("\n").sort((a, b) => a.localeCompare(b)).join("\n"),
  sortZA: (t: string) =>
    t.split("\n").sort((a, b) => b.localeCompare(a)).join("\n"),
  sortNumeric: (t: string) =>
    t
      .split("\n")
      .sort((a, b) => {
        const na = parseFloat(a.replace(/[^\d.-]/g, ""));
        const nb = parseFloat(b.replace(/[^\d.-]/g, ""));
        const va = Number.isFinite(na) ? na : Number.POSITIVE_INFINITY;
        const vb = Number.isFinite(nb) ? nb : Number.POSITIVE_INFINITY;
        return va - vb;
      })
      .join("\n"),
  sortByLength: (t: string) =>
    t.split("\n").sort((a, b) => a.length - b.length).join("\n"),
  reverseLines: (t: string) => t.split("\n").reverse().join("\n"),
  removeDuplicateLines: cleanerOps.removeDuplicateLines,
};

const reverseOps = {
  reverseText: (t: string) => toGraphemes(t).reverse().join(""),
  reverseWords: (t: string) =>
    t
      .split("\n")
      .map((line) =>
        line.split(/\s+/).filter(Boolean).reverse().join(" ")
      )
      .join("\n"),
  reverseEachLine: (t: string) =>
    t
      .split("\n")
      .map((l) => toGraphemes(l).reverse().join(""))
      .join("\n"),
};

/* ══════════════════════════════════════════════════════════════════════════
   9. CONFIG
   ══════════════════════════════════════════════════════════════════════════ */

const DEFAULT_PLATFORMS: PlatformLimit[] = [
  { id: "x", name: "X / Twitter Post", limit: 280 },
  { id: "ig_caption", name: "Instagram Caption", limit: 2200 },
  { id: "ig_bio", name: "Instagram Bio", limit: 150 },
  { id: "fb_post", name: "Facebook Post", limit: 63206 },
  { id: "li_post", name: "LinkedIn Post", limit: 3000 },
  { id: "li_headline", name: "LinkedIn Headline", limit: 220 },
  { id: "yt_title", name: "YouTube Title", limit: 100 },
  { id: "yt_desc", name: "YouTube Description", limit: 5000 },
  { id: "tiktok", name: "TikTok Caption", limit: 2200 },
  { id: "pinterest", name: "Pinterest Description", limit: 500 },
  { id: "sms", name: "SMS Message", limit: 160 },
];

const FAQS: { q: string; a: string }[] = [
  {
    q: "What is a character counter?",
    a: "A character counter is a tool that instantly counts every character in your text and breaks the total down into useful categories such as letters, digits, spaces, punctuation, emojis and more. It is widely used for social media posts, SEO titles, meta descriptions and academic writing where strict limits apply.",
  },
  {
    q: "Are spaces counted as characters?",
    a: "It depends on the counter. This tool shows both totals: characters with spaces and characters without spaces. Most platforms — including X (Twitter), Instagram and Google Ads — count spaces as characters, so always check the platform rule before you publish.",
  },
  {
    q: "What is the difference between characters and words?",
    a: "Characters are individual units of text (letters, digits, punctuation, spaces, emojis). Words are groups of characters separated by whitespace. A 500-character paragraph usually contains roughly 80–90 words in English, but this varies by language and word length.",
  },
  {
    q: "How is reading time calculated?",
    a: "Reading time is estimated by dividing the word count by a reading speed in words per minute (WPM). The default is 200 WPM, which is the average silent reading speed for adults. You can change the WPM value to match your own audience.",
  },
  {
    q: "Can I count Hindi characters correctly?",
    a: "Yes. This tool uses Unicode-aware grapheme segmentation, so Devanagari letters and combining matras are counted as single user-perceived characters rather than being split incorrectly. Mixed Hindi–English text is also handled correctly.",
  },
  {
    q: "Can I count emojis?",
    a: "Yes. Emojis are detected using Unicode property escapes and counted separately. Emoji sequences such as family emojis joined with zero-width joiners are counted as one grapheme, which matches how most platforms treat them.",
  },
  {
    q: "Is my text stored on a server?",
    a: "No. All text analysis happens locally in your browser. Your text is never uploaded to any server. If you enable the autosave option, the draft is stored in your browser's localStorage and you can clear it at any time.",
  },
  {
    q: "Does the tool work offline?",
    a: "Yes, after the page has loaded once. Because all counting, keyword analysis, readability scoring and conversion happen client-side with JavaScript, you can continue using the tool without an internet connection.",
  },
  {
    q: "What is an SEO title?",
    a: "An SEO title (also called a meta title or title tag) is the clickable headline shown in search results. Google typically displays around 50–60 characters, or roughly 600 pixels, before truncating it. Keeping your title within that range helps avoid ellipses.",
  },
  {
    q: "What is a meta description?",
    a: "A meta description is the short summary shown under the title in search results. Google usually displays about 150–160 characters. It does not directly affect rankings, but a well-written description can improve click-through rate.",
  },
  {
    q: "How accurate is the page calculator?",
    a: "The page calculator provides an estimate based on paper size, font, font size and line spacing. Real page counts also depend on margins, headers, footers, images, tables and the word processor you use, so treat the result as a guideline rather than an exact number.",
  },
  {
    q: "Why can two word counters show different results?",
    a: "Different tools define a word differently. Some split only on spaces, others strip punctuation first, and some treat hyphenated words, numbers or CJK characters differently. This tool extracts words using a Unicode-aware pattern that includes letters, numbers and combining marks.",
  },
  {
    q: "Can I set my own character limit?",
    a: "Yes. The Custom Limit Checker lets you define a limit for characters, words, sentences or lines, and you can set a warning threshold at 80%, 90% or 95% so you know when you are approaching the limit.",
  },
  {
    q: "Is the readability score reliable for non-English text?",
    a: "The Flesch Reading Ease, Flesch–Kincaid and Gunning Fog formulas were designed for English. Syllable estimation only works for Latin-script words, so treat readability scores for Hindi or other scripts as indicative only.",
  },
];

/* ══════════════════════════════════════════════════════════════════════════
   10. SMALL UTILITIES
   ══════════════════════════════════════════════════════════════════════════ */

function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0 sec";
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  if (m === 0) return `${s} sec`;
  if (s === 0) return `${m} min`;
  return `${m} min ${s} sec`;
}

function useDebouncedValue<T>(value: T, delay = 150): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function downloadFile(filename: string, content: string, mime: string) {
  try {
    const blob = new Blob([content], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return true;
  } catch {
    return false;
  }
}

function limitStatus(current: number, limit: number) {
  if (limit <= 0) return { label: "No limit", tone: "safe" as const };
  const ratio = current / limit;
  if (ratio > 1) return { label: "Over limit", tone: "over" as const };
  if (ratio >= 0.9) return { label: "Near limit", tone: "near" as const };
  return { label: "Safe", tone: "safe" as const };
}

/* ══════════════════════════════════════════════════════════════════════════
   11. PRESENTATIONAL COMPONENTS
   ══════════════════════════════════════════════════════════════════════════ */

function Section({
  id,
  title,
  subtitle,
  defaultOpen = false,
  children,
}: {
  id?: string;
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = `${id ?? title.replace(/\s+/g, "-").toLowerCase()}-panel`;

  return (
    <section
      id={id}
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-center justify-between gap-4 p-4 text-left transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 sm:p-5 dark:hover:bg-slate-800/60"
      >
        <span className="min-w-0">
          <span className="block text-base font-semibold text-slate-900 sm:text-lg dark:text-slate-100">
            {title}
          </span>
          {subtitle && (
            <span className="mt-0.5 block text-sm text-slate-500 dark:text-slate-400">
              {subtitle}
            </span>
          )}
        </span>
        <span
          aria-hidden="true"
          className={`shrink-0 text-slate-400 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        >
          ▾
        </span>
      </button>

      {open && (
        <div
          id={panelId}
          className="border-t border-slate-200 p-4 sm:p-5 dark:border-slate-800"
        >
          {children}
        </div>
      )}
    </section>
  );
}

function Stat({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-3 sm:p-4 ${
        accent
          ? "border-indigo-200 bg-indigo-50 dark:border-indigo-900 dark:bg-indigo-950/40"
          : "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40"
      }`}
    >
      <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500 sm:text-xs dark:text-slate-400">
        {label}
      </div>
      <div
        className={`mt-1 truncate text-lg font-bold sm:text-xl ${
          accent
            ? "text-indigo-700 dark:text-indigo-300"
            : "text-slate-900 dark:text-slate-100"
        }`}
        title={typeof value === "string" ? value : undefined}
      >
        {value}
      </div>
      {hint && (
        <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          {hint}
        </div>
      )}
    </div>
  );
}

function Progress({
  value,
  max,
  tone = "indigo",
}: {
  value: number;
  max: number;
  tone?: "indigo" | "green" | "amber" | "red";
}) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  const colours: Record<string, string> = {
    indigo: "bg-indigo-500",
    green: "bg-emerald-500",
    amber: "bg-amber-500",
    red: "bg-rose-500",
  };
  return (
    <div
      className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700"
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={`h-full rounded-full transition-all duration-300 ${colours[tone]}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  min,
  max,
  step,
  placeholder,
  suffix,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  suffix?: string;
}) {
  const id = `field-${label.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <label htmlFor={id} className="block">
      <span className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
        {label}
        {suffix ? ` (${suffix})` : ""}
      </span>
      <input
        id={id}
        type={type}
        value={value}
        min={min}
        max={max}
        step={step}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
      />
    </label>
  );
}

function ActionButton({
  children,
  onClick,
  variant = "default",
  disabled,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant?: "default" | "primary" | "danger";
  disabled?: boolean;
  title?: string;
}) {
  const base =
    "inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-40";
  const styles: Record<string, string> = {
    default:
      "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700",
    primary:
      "bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600",
    danger:
      "border border-rose-300 bg-white text-rose-600 hover:bg-rose-50 dark:border-rose-800 dark:bg-slate-800 dark:text-rose-400 dark:hover:bg-rose-950/40",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`${base} ${styles[variant]}`}
    >
      {children}
    </button>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   12. MAIN PAGE
   ══════════════════════════════════════════════════════════════════════════ */

export default function Page() {
  /* ── Core state ─────────────────────────────────────────────────────── */
  const [text, setText] = useState("");
  const debouncedText = useDebouncedValue(text, 120);
  const textRef = useRef(text);
  textRef.current = text;

  const [toast, setToast] = useState<{ key: string; msg: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const flash = useCallback((key: string, msg: string) => {
    setToast({ key, msg });
    window.setTimeout(
      () => setToast((t) => (t && t.key === key ? null : t)),
      1800
    );
  }, []);

  /* ── Undo / redo ────────────────────────────────────────────────────── */
  const historyRef = useRef<string[]>([""]);
  const historyIdxRef = useRef(0);
  const skipHistoryRef = useRef(false);
  const [, bumpHistory] = useState(0);

  useEffect(() => {
    if (skipHistoryRef.current) {
      skipHistoryRef.current = false;
      return;
    }
    const t = window.setTimeout(() => {
      const h = historyRef.current;
      if (h[historyIdxRef.current] === text) return;
      const next = h.slice(0, historyIdxRef.current + 1);
      next.push(text);
      const capped = next.slice(-120);
      historyRef.current = capped;
      historyIdxRef.current = capped.length - 1;
      bumpHistory((n) => n + 1);
    }, 600);
    return () => window.clearTimeout(t);
  }, [text]);

  const undo = useCallback(() => {
    if (historyIdxRef.current <= 0) return;
    historyIdxRef.current -= 1;
    const target = historyRef.current[historyIdxRef.current];
    if (target === textRef.current) return;
    skipHistoryRef.current = true;
    setText(target);
    bumpHistory((n) => n + 1);
  }, []);

  const redo = useCallback(() => {
    if (historyIdxRef.current >= historyRef.current.length - 1) return;
    historyIdxRef.current += 1;
    const target = historyRef.current[historyIdxRef.current];
    if (target === textRef.current) return;
    skipHistoryRef.current = true;
    setText(target);
    bumpHistory((n) => n + 1);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (!mod) return;
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      // Let the browser handle native undo inside text fields.
      if (tag === "input" || tag === "textarea" || target?.isContentEditable) return;

      const k = e.key.toLowerCase();
      if (k === "z" && e.shiftKey) {
        e.preventDefault();
        redo();
      } else if (k === "z") {
        e.preventDefault();
        undo();
      } else if (k === "y") {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo]);

  /* ── Local draft ────────────────────────────────────────────────────── */
  const [autoSave, setAutoSave] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem("cc_draft")) setHasDraft(true);
    } catch {
      /* localStorage unavailable */
    }
  }, []);

  useEffect(() => {
    if (!autoSave) return;
    const t = window.setTimeout(() => {
      try {
        localStorage.setItem("cc_draft", text);
        setHasDraft(text.length > 0);
      } catch {
        /* quota / disabled */
      }
    }, 900);
    return () => window.clearTimeout(t);
  }, [text, autoSave]);

  const restoreDraft = () => {
    try {
      const saved = localStorage.getItem("cc_draft");
      if (saved) {
        setText(saved);
        flash("draft", "Draft restored");
      }
    } catch {
      setError("Could not read the saved draft.");
    }
  };

  const clearDraft = () => {
    try {
      localStorage.removeItem("cc_draft");
      setHasDraft(false);
      flash("draft", "Saved draft cleared");
    } catch {
      setError("Could not clear the saved draft.");
    }
  };

  /* ── Analysis ───────────────────────────────────────────────────────── */
  const stats = useMemo(() => analyzeText(debouncedText), [debouncedText]);
  const readability = useMemo(
    () => analyzeReadability(debouncedText),
    [debouncedText]
  );
  const quality = useMemo(() => analyzeQuality(debouncedText), [debouncedText]);

  /* ── Reading / speaking time ────────────────────────────────────────── */
  const [readingWpm, setReadingWpm] = useState(200);
  const [speakingWpm, setSpeakingWpm] = useState(130);
  const [slowWpm, setSlowWpm] = useState(120);

  const readSeconds = readingWpm > 0 ? (stats.words / readingWpm) * 60 : 0;
  const speakSeconds = speakingWpm > 0 ? (stats.words / speakingWpm) * 60 : 0;
  const slowSeconds = slowWpm > 0 ? (stats.words / slowWpm) * 60 : 0;

  /* ── Goals ──────────────────────────────────────────────────────────── */
  const [goalChars, setGoalChars] = useState(0);
  const [goalWords, setGoalWords] = useState(0);
  const [goalSentences, setGoalSentences] = useState(0);

  /* ── Custom limit ───────────────────────────────────────────────────── */
  const [limitType, setLimitType] = useState<
    "characters" | "words" | "sentences" | "lines"
  >("characters");
  const [customLimit, setCustomLimit] = useState(500);
  const [threshold, setThreshold] = useState(90);

  const limitCurrent =
    limitType === "characters"
      ? stats.characters
      : limitType === "words"
      ? stats.words
      : limitType === "sentences"
      ? stats.sentences
      : stats.lines;

  /* ── Social platforms ───────────────────────────────────────────────── */
  const [platforms, setPlatforms] = useState<PlatformLimit[]>(DEFAULT_PLATFORMS);
  const [newPlatformName, setNewPlatformName] = useState("");
  const [newPlatformLimit, setNewPlatformLimit] = useState("");

  const addPlatform = () => {
    const limit = parseInt(newPlatformLimit, 10);
    const name = newPlatformName.trim();
    if (!name || !Number.isFinite(limit) || limit <= 0) {
      setError("Enter a platform name and a positive character limit.");
      return;
    }
    setPlatforms((p) => [
      ...p,
      { id: `custom_${Date.now()}`, name, limit, custom: true },
    ]);
    setNewPlatformName("");
    setNewPlatformLimit("");
    setError(null);
  };

  const removePlatform = (id: string) =>
    setPlatforms((p) => p.filter((x) => x.id !== id));

  const updatePlatformLimit = (id: string, value: string) => {
    const n = parseInt(value, 10);
    setPlatforms((p) =>
      p.map((x) => (x.id === id ? { ...x, limit: Number.isFinite(n) ? n : 0 } : x))
    );
  };

  /* ── SEO analyzer ───────────────────────────────────────────────────── */
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [slug, setSlug] = useState("");
  const [adHeadlines, setAdHeadlines] = useState(["", "", ""]);
  const [adDescription, setAdDescription] = useState("");

  const slugSuggestion = useMemo(() => {
    return extractWords(slug)
      .map((w) => w.toLowerCase())
      .join("-");
  }, [slug]);

  const estimatePixels = (s: string, perChar = 8.5) =>
    Math.round(toGraphemes(s).length * perChar);

  /* ── Keywords ───────────────────────────────────────────────────────── */
  const [topN, setTopN] = useState(20);
  const [ignoreStopWords, setIgnoreStopWords] = useState(true);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [keywordFilter, setKeywordFilter] = useState("");
  const [customStopWords, setCustomStopWords] = useState("");
  const [keywordSort, setKeywordSort] = useState<"freq" | "alpha">("freq");
  const [ngramFilter, setNgramFilter] = useState<0 | 1 | 2 | 3>(0);

  const keywords = useMemo(
    () =>
      analyzeKeywords(debouncedText, {
        topN: 200,
        ignoreStopWords,
        caseSensitive,
        customStopWords: customStopWords.split(/[,\n]/).map((s) => s.trim()),
        filter: keywordFilter,
      }),
    [debouncedText, ignoreStopWords, caseSensitive, customStopWords, keywordFilter]
  );

  const visibleKeywords = useMemo(() => {
    const rows = ngramFilter === 0 ? keywords : keywords.filter((k) => k.n === ngramFilter);
    const sorted = [...rows].sort((a, b) =>
      keywordSort === "freq"
        ? b.count - a.count || a.keyword.localeCompare(b.keyword)
        : a.keyword.localeCompare(b.keyword)
    );
    return sorted.slice(0, topN);
  }, [keywords, ngramFilter, keywordSort, topN]);

  /* ── Find & replace ─────────────────────────────────────────────────── */
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [findCaseSensitive, setFindCaseSensitive] = useState(false);
  const [findWholeWord, setFindWholeWord] = useState(false);

  const matchCount = useMemo(() => {
    if (!findText) return 0;
    try {
      const escaped = findText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const pattern = findWholeWord ? `\\b${escaped}\\b` : escaped;
      const re = new RegExp(pattern, findCaseSensitive ? "g" : "gi");
      return (debouncedText.match(re) ?? []).length;
    } catch {
      return 0;
    }
  }, [debouncedText, findText, findCaseSensitive, findWholeWord]);

  const doReplace = (all: boolean) => {
    if (!findText) return;
    try {
      const escaped = findText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const pattern = findWholeWord ? `\\b${escaped}\\b` : escaped;
      const re = new RegExp(pattern, findCaseSensitive ? (all ? "g" : "") : all ? "gi" : "i");
      setText(text.replace(re, replaceText));
      flash("replace", all ? "All replaced" : "Replaced");
    } catch {
      setError("Invalid search pattern.");
    }
  };

  /* ── Case converter ─────────────────────────────────────────────────── */
  const [caseResult, setCaseResult] = useState("");

  /* ── Page calculator ────────────────────────────────────────────────── */
  const [paper, setPaper] = useState<"A4" | "Letter">("A4");
  const [fontFamily, setFontFamily] = useState("Times New Roman");
  const [fontSize, setFontSize] = useState(12);
  const [lineSpacing, setLineSpacing] = useState(1.5);

  const estimatedPages = useMemo(() => {
    const paperFactor = paper === "A4" ? 1 : 1.03;
    const fontFactor =
      fontFamily === "Arial" ? 1.05 : fontFamily === "Calibri" ? 0.95 : 1;
    const sizeFactor = 12 / fontSize;
    const spacingFactor = 1 / lineSpacing;
    const wordsPerPage = 500 * paperFactor * fontFactor * sizeFactor * spacingFactor;
    if (stats.words === 0) return 0;
    return Math.max(1, Math.ceil(stats.words / wordsPerPage));
  }, [stats.words, paper, fontFamily, fontSize, lineSpacing]);

  /* ── Clipboard ──────────────────────────────────────────────────────── */
  const copyToClipboard = useCallback(
    async (value: string, key: string) => {
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(value);
        } else {
          const ta = document.createElement("textarea");
          ta.value = value;
          ta.style.position = "fixed";
          ta.style.opacity = "0";
          document.body.appendChild(ta);
          ta.select();
          document.execCommand("copy");
          document.body.removeChild(ta);
        }
        flash(key, "Copied!");
      } catch {
        flash(key, "Clipboard blocked");
      }
    },
    [flash]
  );

  /* ── Import / export ────────────────────────────────────────────────── */
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    const name = file.name.toLowerCase();
    const allowed = [".txt", ".csv", ".json", ".md", ".markdown", ".log", ".html", ".htm"];
    if (!allowed.some((ext) => name.endsWith(ext))) {
      setError("Unsupported file type. Please use TXT, CSV, JSON, Markdown or HTML.");
      return;
    }
    try {
      const content = await file.text();
      setText(content);
      setError(null);
      flash("import", "File imported");
    } catch {
      setError("Could not read the selected file.");
    }
  };

  const exportAs = (format: "txt" | "csv" | "json" | "md" | "html") => {
    const base = "character-counter-text";
    if (format === "txt") {
      downloadFile(`${base}.txt`, text, "text/plain");
    } else if (format === "md") {
      downloadFile(`${base}.md`, text, "text/markdown");
    } else if (format === "html") {
      const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Character Counter Export</title></head>
<body><pre style="white-space:pre-wrap;font-family:system-ui,sans-serif">${text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")}</pre></body></html>`;
      downloadFile(`${base}.html`, html, "text/html");
    } else if (format === "json") {
      downloadFile(
        `${base}.json`,
        JSON.stringify({ text, stats, exportedAt: new Date().toISOString() }, null, 2),
        "application/json"
      );
    } else {
      const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
      const rows = [
        ["Metric", "Value"],
        ["Characters", String(stats.characters)],
        ["Characters (no spaces)", String(stats.charactersWithoutSpaces)],
        ["Words", String(stats.words)],
        ["Unique words", String(stats.uniqueWords)],
        ["Sentences", String(stats.sentences)],
        ["Paragraphs", String(stats.paragraphs)],
        ["Lines", String(stats.lines)],
        ["Reading time", formatDuration(readSeconds)],
      ];
      downloadFile(
        `${base}-stats.csv`,
        rows.map((r) => r.map(escape).join(",")).join("\n"),
        "text/csv"
      );
    }
  };

  /* ── Derived display values ─────────────────────────────────────────── */
  const status = limitStatus(limitCurrent, customLimit);
  const thresholdReached =
    customLimit > 0 && limitCurrent >= (customLimit * threshold) / 100;

  const goalCharPct = goalChars > 0 ? (stats.characters / goalChars) * 100 : 0;
  const goalWordPct = goalWords > 0 ? (stats.words / goalWords) * 100 : 0;
  const goalSentencePct =
    goalSentences > 0 ? (stats.sentences / goalSentences) * 100 : 0;

  /* ══════════════════════════════════════════════════════════════════════
     RENDER
     ══════════════════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Skip link for accessibility */}
      <a
        href="#editor"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-indigo-600 focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to editor
      </a>

      {/* ── Header ───────────────────────────────────────────────────── */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-600 text-lg font-bold text-white"
            >
              #
            </span>
            <div>
              <p className="text-sm font-bold leading-tight sm:text-base">
                Character Counter
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Writing Assistant
              </p>
            </div>
          </div>

          <nav aria-label="Primary" className="flex flex-wrap items-center gap-1 text-sm">
            {[
              ["#editor", "Editor"],
              ["#seo", "SEO"],
              ["#keywords", "Keywords"],
              ["#faq", "FAQ"],
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="rounded-lg px-3 py-1.5 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                {label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        {/* ── Hero ───────────────────────────────────────────────────── */}
        <section className="mb-6">
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl">
            Advanced Character Counter &amp; Writing Assistant
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600 sm:text-base dark:text-slate-400">
            Count characters, words, sentences and emojis in real time. Analyse
            readability, keyword density, SEO metadata and social media limits —
            all processed locally in your browser.
          </p>
          <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
            <span aria-hidden="true">🔒</span> Your text is processed locally in your browser.
          </p>
        </section>

        {/* ── Error banner ───────────────────────────────────────────── */}
        {error && (
          <div
            role="alert"
            className="mb-4 flex items-start justify-between gap-3 rounded-xl border border-rose-300 bg-rose-50 p-3 text-sm text-rose-800 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200"
          >
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setError(null)}
              className="shrink-0 rounded px-2 py-0.5 font-medium hover:bg-rose-100 dark:hover:bg-rose-900/50"
              aria-label="Dismiss error"
            >
              ✕
            </button>
          </div>
        )}

        {/* ── Editor ─────────────────────────────────────────────────── */}
        <section
          id="editor"
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-slate-800 dark:bg-slate-900"
          aria-labelledby="editor-heading"
        >
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 id="editor-heading" className="text-base font-semibold sm:text-lg">
              Your text
            </h2>
            <div className="flex flex-wrap items-center gap-1.5">
              <ActionButton onClick={undo} title="Undo (Ctrl/Cmd + Z)">
                ↶ Undo
              </ActionButton>
              <ActionButton onClick={redo} title="Redo (Ctrl/Cmd + Shift + Z)">
                ↷ Redo
              </ActionButton>
              <ActionButton
                onClick={() => copyToClipboard(text, "text")}
                title="Copy all text"
              >
                {toast?.key === "text" ? "✓ Copied" : "⧉ Copy"}
              </ActionButton>
              <ActionButton
                onClick={() => {
                  setText("");
                  flash("clear", "Cleared");
                }}
                variant="danger"
              >
                Clear
              </ActionButton>
            </div>
          </div>

          <label htmlFor="main-editor" className="sr-only">
            Text editor
          </label>
          <textarea
            id="main-editor"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Start typing or paste your text here…"
            spellCheck
            rows={12}
            aria-describedby="editor-hint"
            className="w-full resize-y rounded-xl border border-slate-300 bg-slate-50 p-3 font-mono text-sm leading-relaxed text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/30 sm:p-4 sm:text-base dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:bg-slate-800"
          />
          <p id="editor-hint" className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Nothing is uploaded. Analysis runs entirely on your device.
          </p>

          {/* Core statistics */}
          <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
            <Stat label="Characters" value={stats.characters.toLocaleString()} accent />
            <Stat label="Words" value={stats.words.toLocaleString()} accent />
            <Stat label="Sentences" value={stats.sentences.toLocaleString()} />
            <Stat label="Paragraphs" value={stats.paragraphs.toLocaleString()} />
            <Stat label="Lines" value={stats.lines.toLocaleString()} />
            <Stat label="Emojis" value={stats.emojis.toLocaleString()} />
            <Stat
              label="No spaces"
              value={stats.charactersWithoutSpaces.toLocaleString()}
            />
            <Stat label="Unique words" value={stats.uniqueWords.toLocaleString()} />
            <Stat label="Letters" value={stats.letters.toLocaleString()} />
            <Stat label="Digits" value={stats.digits.toLocaleString()} />
            <Stat label="Punctuation" value={stats.punctuation.toLocaleString()} />
            <Stat
              label="Avg word length"
              value={stats.avgWordLength.toFixed(2)}
            />
          </div>
        </section>

        {/* ── Reading / speaking time ─────────────────────────────────── */}
        <div className="mt-4">
          <Section
            title="Reading & Speaking Time"
            subtitle="Estimated from word count and adjustable words-per-minute"
            defaultOpen
          >
            <div className="grid gap-3 sm:grid-cols-3">
              <Stat label="Reading time" value={formatDuration(readSeconds)} hint={`${readingWpm} WPM`} accent />
              <Stat label="Speaking time" value={formatDuration(speakSeconds)} hint={`${speakingWpm} WPM`} accent />
              <Stat label="Slow reading" value={formatDuration(slowSeconds)} hint={`${slowWpm} WPM`} />
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <Field
                label="Reading speed"
                type="number"
                min={50}
                max={1000}
                value={readingWpm}
                onChange={(v) => setReadingWpm(Math.max(1, parseInt(v, 10) || 0))}
                suffix="WPM"
              />
              <Field
                label="Speaking speed"
                type="number"
                min={50}
                max={1000}
                value={speakingWpm}
                onChange={(v) => setSpeakingWpm(Math.max(1, parseInt(v, 10) || 0))}
                suffix="WPM"
              />
              <Field
                label="Slow reading speed"
                type="number"
                min={50}
                max={1000}
                value={slowWpm}
                onChange={(v) => setSlowWpm(Math.max(1, parseInt(v, 10) || 0))}
                suffix="WPM"
              />
            </div>
          </Section>
        </div>

        {/* ── Goal tracker ────────────────────────────────────────────── */}
        <div className="mt-4">
          <Section
            title="Writing Goal Tracker"
            subtitle="Set targets and watch your progress"
          >
            <div className="grid gap-3 sm:grid-cols-3">
              <Field
                label="Character goal"
                type="number"
                min={0}
                value={goalChars}
                onChange={(v) => setGoalChars(Math.max(0, parseInt(v, 10) || 0))}
              />
              <Field
                label="Word goal"
                type="number"
                min={0}
                value={goalWords}
                onChange={(v) => setGoalWords(Math.max(0, parseInt(v, 10) || 0))}
              />
              <Field
                label="Sentence goal"
                type="number"
                min={0}
                value={goalSentences}
                onChange={(v) => setGoalSentences(Math.max(0, parseInt(v, 10) || 0))}
              />
            </div>

            <div className="mt-4 space-y-4">
              {[
                { label: "Characters", cur: stats.characters, goal: goalChars, pct: goalCharPct },
                { label: "Words", cur: stats.words, goal: goalWords, pct: goalWordPct },
                { label: "Sentences", cur: stats.sentences, goal: goalSentences, pct: goalSentencePct },
              ].map((g) => (
                <div key={g.label}>
                  <div className="mb-1 flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span className="font-medium">{g.label}</span>
                    {g.goal > 0 ? (
                      <span className="text-slate-600 dark:text-slate-400">
                        {g.cur.toLocaleString()} / {g.goal.toLocaleString()} ·{" "}
                        {g.cur >= g.goal ? (
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            Goal completed 🎉
                          </span>
                        ) : (
                          <>
                            {(g.goal - g.cur).toLocaleString()} remaining (
                            {Math.min(100, g.pct).toFixed(1)}%)
                          </>
                        )}
                      </span>
                    ) : (
                      <span className="text-slate-400">No goal set</span>
                    )}
                  </div>
                  <Progress
                    value={g.cur}
                    max={g.goal || 1}
                    tone={g.pct >= 100 ? "green" : g.pct >= 75 ? "indigo" : "amber"}
                  />
                </div>
              ))}
            </div>
          </Section>
        </div>

        {/* ── Advanced statistics ─────────────────────────────────────── */}
        <div className="mt-4">
          <Section
            title="Advanced Text Statistics"
            subtitle="Unicode-aware breakdown, byte counts and averages"
          >
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
              <Stat label="Characters (with spaces)" value={stats.charactersWithSpaces.toLocaleString()} />
              <Stat label="Characters (without spaces)" value={stats.charactersWithoutSpaces.toLocaleString()} />
              <Stat label="Letters" value={stats.letters.toLocaleString()} />
              <Stat label="Uppercase letters" value={stats.uppercase.toLocaleString()} />
              <Stat label="Lowercase letters" value={stats.lowercase.toLocaleString()} />
              <Stat label="Numbers" value={stats.digits.toLocaleString()} />
              <Stat label="Spaces" value={stats.spaces.toLocaleString()} />
              <Stat label="Tabs" value={stats.tabs.toLocaleString()} />
              <Stat label="New lines" value={stats.newlines.toLocaleString()} />
              <Stat label="Punctuation" value={stats.punctuation.toLocaleString()} />
              <Stat label="Symbols" value={stats.symbols.toLocaleString()} />
              <Stat label="Emojis" value={stats.emojis.toLocaleString()} />
              <Stat label="Unique characters" value={stats.uniqueCharacters.toLocaleString()} />
              <Stat label="Unique words" value={stats.uniqueWords.toLocaleString()} />
              <Stat label="Average word length" value={stats.avgWordLength.toFixed(2)} />
              <Stat label="Average sentence length" value={stats.avgSentenceLength.toFixed(2)} />
              <Stat label="Longest word" value={stats.longestWord || "—"} />
              <Stat label="Shortest word" value={stats.shortestWord || "—"} />
              <Stat label="UTF-8 bytes" value={stats.utf8.toLocaleString()} />
              <Stat label="UTF-16 code units" value={stats.utf16.toLocaleString()} />
            </div>
          </Section>
        </div>

        {/* ── Custom limit ────────────────────────────────────────────── */}
        <div className="mt-4">
          <Section
            title="Custom Limit Checker"
            subtitle="Set your own limit and warning threshold"
          >
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
                  Limit type
                </span>
                <select
                  value={limitType}
                  onChange={(e) =>
                    setLimitType(e.target.value as typeof limitType)
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                >
                  <option value="characters">Characters</option>
                  <option value="words">Words</option>
                  <option value="sentences">Sentences</option>
                  <option value="lines">Lines</option>
                </select>
              </label>
              <Field
                label="Maximum"
                type="number"
                min={1}
                value={customLimit}
                onChange={(v) => setCustomLimit(Math.max(1, parseInt(v, 10) || 1))}
              />
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
                  Warning threshold
                </span>
                <select
                  value={threshold}
                  onChange={(e) => setThreshold(parseInt(e.target.value, 10))}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                >
                  <option value={80}>80%</option>
                  <option value={90}>90%</option>
                  <option value={95}>95%</option>
                </select>
              </label>
            </div>

            <div className="mt-4">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="font-medium">
                  {limitCurrent.toLocaleString()} / {customLimit.toLocaleString()}
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    status.tone === "over"
                      ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                      : status.tone === "near"
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                      : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                  }`}
                >
                  {status.label}
                </span>
              </div>
              <Progress
                value={limitCurrent}
                max={customLimit}
                tone={
                  status.tone === "over" ? "red" : status.tone === "near" ? "amber" : "green"
                }
              />
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                {limitCurrent > customLimit
                  ? `${(limitCurrent - customLimit).toLocaleString()} over the limit`
                  : `${(customLimit - limitCurrent).toLocaleString()} remaining`}
                {thresholdReached && limitCurrent <= customLimit
                  ? ` · You have passed the ${threshold}% warning threshold`
                  : ""}
              </p>
            </div>
          </Section>
        </div>

        {/* ── Social media limits ─────────────────────────────────────── */}
        <div className="mt-4">
          <Section
            title="Social Media Character Limits"
            subtitle="Live counts against each platform's maximum"
          >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {platforms.map((p) => {
                const s = limitStatus(stats.characters, p.limit);
                return (
                  <div
                    key={p.id}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/40"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-semibold">{p.name}</span>
                      {p.custom && (
                        <button
                          type="button"
                          onClick={() => removePlatform(p.id)}
                          className="rounded px-1.5 text-xs text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950/50"
                          aria-label={`Remove ${p.name}`}
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-xl font-bold">
                        {stats.characters.toLocaleString()}
                      </span>
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        / {p.limit.toLocaleString()}
                      </span>
                    </div>

                    <div className="mt-2">
                      <Progress
                        value={stats.characters}
                        max={p.limit}
                        tone={s.tone === "over" ? "red" : s.tone === "near" ? "amber" : "green"}
                      />
                    </div>

                    <div className="mt-2 flex items-center justify-between gap-2 text-xs">
                      <span
                        className={`font-semibold ${
                          s.tone === "over"
                            ? "text-rose-600 dark:text-rose-400"
                            : s.tone === "near"
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-emerald-600 dark:text-emerald-400"
                        }`}
                      >
                        {s.label}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400">
                        {stats.characters > p.limit
                          ? `${(stats.characters - p.limit).toLocaleString()} over`
                          : `${(p.limit - stats.characters).toLocaleString()} remaining`}
                      </span>
                    </div>

                    {p.custom && (
                      <div className="mt-2">
                        <label className="sr-only" htmlFor={`limit-${p.id}`}>
                          Limit for {p.name}
                        </label>
                        <input
                          id={`limit-${p.id}`}
                          type="number"
                          min={1}
                          value={p.limit}
                          onChange={(e) => updatePlatformLimit(p.id, e.target.value)}
                          className="w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-800"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
              <Field
                label="New platform name"
                value={newPlatformName}
                onChange={setNewPlatformName}
                placeholder="e.g. Threads"
              />
              <Field
                label="Character limit"
                type="number"
                min={1}
                value={newPlatformLimit}
                onChange={setNewPlatformLimit}
                placeholder="500"
              />
              <ActionButton onClick={addPlatform} variant="primary">
                + Add platform
              </ActionButton>
            </div>
          </Section>
        </div>

        {/* ── SEO analyzer ────────────────────────────────────────────── */}
        <div className="mt-4" id="seo">
          <Section
            title="SEO Character Counter"
            subtitle="Meta title, meta description, URL slug and Google Ads limits"
          >
            {/* Meta title */}
            <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-semibold">Meta Title</h3>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    metaTitle.length === 0
                      ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                      : metaTitle.length > 60
                      ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                      : metaTitle.length < 30
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                      : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                  }`}
                >
                  {metaTitle.length === 0
                    ? "Empty"
                    : metaTitle.length > 60
                    ? "Too long"
                    : metaTitle.length < 30
                    ? "A bit short"
                    : "Good length"}
                </span>
              </div>
              <Field
                label="Title tag"
                value={metaTitle}
                onChange={setMetaTitle}
                placeholder="Best Character Counter Tool — Free Online"
              />
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-400">
                <span>
                  <strong>{metaTitle.length}</strong> characters
                </span>
                <span>
                  {metaTitle.length > 60
                    ? `${metaTitle.length - 60} over the recommended 60`
                    : `${60 - metaTitle.length} remaining (recommended 50–60)`}
                </span>
                <span>≈ {estimatePixels(metaTitle)} px</span>
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
                Google usually truncates titles beyond roughly 600 pixels.
              </p>
            </div>

            {/* Meta description */}
            <div className="mt-3 rounded-xl border border-slate-200 p-3 dark:border-slate-800">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-semibold">Meta Description</h3>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    metaDescription.length === 0
                      ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                      : metaDescription.length > 160
                      ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                      : metaDescription.length < 70
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                      : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                  }`}
                >
                  {metaDescription.length === 0
                    ? "Empty"
                    : metaDescription.length > 160
                    ? "Too long"
                    : metaDescription.length < 70
                    ? "A bit short"
                    : "Good length"}
                </span>
              </div>
              <label htmlFor="meta-desc" className="sr-only">
                Meta description
              </label>
              <textarea
                id="meta-desc"
                rows={3}
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="Write a compelling summary of the page in about 150–160 characters."
                className="w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
              />
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-400">
                <span>
                  <strong>{metaDescription.length}</strong> characters
                </span>
                <span>
                  {metaDescription.length > 160
                    ? `${metaDescription.length - 160} over the recommended 160`
                    : `${160 - metaDescription.length} remaining (recommended 150–160)`}
                </span>
                <span>≈ {estimatePixels(metaDescription, 7.5)} px</span>
              </div>
            </div>

            {/* Slug */}
            <div className="mt-3 rounded-xl border border-slate-200 p-3 dark:border-slate-800">
              <h3 className="mb-2 text-sm font-semibold">URL Slug Analyzer</h3>
              <Field
                label="URL slug"
                value={slug}
                onChange={setSlug}
                placeholder="best-character-counter-tool"
              />
              <ul className="mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-400">
                <li>
                  Characters: <strong>{slug.length}</strong> · Words:{" "}
                  <strong>{extractWords(slug).length}</strong>
                </li>
                <li>
                  Contains spaces:{" "}
                  <strong className={/\s/.test(slug) ? "text-rose-600" : "text-emerald-600"}>
                    {/\s/.test(slug) ? "Yes — replace with hyphens" : "No"}
                  </strong>
                </li>
                <li>
                  Contains uppercase:{" "}
                  <strong className={/[A-Z]/.test(slug) ? "text-amber-600" : "text-emerald-600"}>
                    {/[A-Z]/.test(slug) ? "Yes — lowercase is preferred" : "No"}
                  </strong>
                </li>
                <li>
                  Contains special characters:{" "}
                  <strong className={/[^a-z0-9-]/i.test(slug) ? "text-amber-600" : "text-emerald-600"}>
                    {/[^a-z0-9-]/i.test(slug) ? "Yes" : "No"}
                  </strong>
                </li>
              </ul>
              {slugSuggestion && slugSuggestion !== slug && (
                <div className="mt-2 flex flex-wrap items-center gap-2 rounded-lg bg-indigo-50 p-2 text-xs dark:bg-indigo-950/40">
                  <span className="text-slate-600 dark:text-slate-300">
                    Suggested slug:
                  </span>
                  <code className="font-mono font-semibold text-indigo-700 dark:text-indigo-300">
                    {slugSuggestion}
                  </code>
                  <button
                    type="button"
                    onClick={() => setSlug(slugSuggestion)}
                    className="rounded bg-indigo-600 px-2 py-0.5 text-white hover:bg-indigo-700"
                  >
                    Use
                  </button>
                </div>
              )}
            </div>

            {/* Google Ads */}
            <div className="mt-3 rounded-xl border border-slate-200 p-3 dark:border-slate-800">
              <h3 className="mb-2 text-sm font-semibold">Google Ads Style Analyzer</h3>
              <div className="grid gap-3 sm:grid-cols-3">
                {adHeadlines.map((h, i) => (
                  <div key={i}>
                    <Field
                      label={`Headline ${i + 1}`}
                      value={h}
                      onChange={(v) =>
                        setAdHeadlines((prev) =>
                          prev.map((x, idx) => (idx === i ? v : x))
                        )
                      }
                      placeholder="Up to 30 characters"
                    />
                    <p
                      className={`mt-1 text-xs ${
                        h.length > 30 ? "text-rose-600" : "text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      {h.length} / 30
                      {h.length > 30 ? ` · ${h.length - 30} over` : ""}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-3">
                <label htmlFor="ad-desc" className="sr-only">
                  Ad description
                </label>
                <textarea
                  id="ad-desc"
                  rows={2}
                  value={adDescription}
                  onChange={(e) => setAdDescription(e.target.value)}
                  placeholder="Description — up to 90 characters"
                  className="w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                />
                <p
                  className={`mt-1 text-xs ${
                    adDescription.length > 90
                      ? "text-rose-600"
                      : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {adDescription.length} / 90
                  {adDescription.length > 90
                    ? ` · ${adDescription.length - 90} over`
                    : ""}
                </p>
              </div>
            </div>

            <div className="mt-3">
              <ActionButton
                onClick={() =>
                  copyToClipboard(
                    `Meta Title (${metaTitle.length}): ${metaTitle}\nMeta Description (${metaDescription.length}): ${metaDescription}\nSlug: ${slug}`,
                    "seo"
                  )
                }
              >
                {toast?.key === "seo" ? "✓ Copied" : "⧉ Copy SEO analysis"}
              </ActionButton>
            </div>
          </Section>
        </div>

        {/* ── Keyword density ─────────────────────────────────────────── */}
        <div className="mt-4" id="keywords">
          <Section
            title="Keyword Density Analyzer"
            subtitle="Unigrams, bigrams and trigrams with stop-word filtering"
          >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
                  Show top
                </span>
                <select
                  value={topN}
                  onChange={(e) => setTopN(parseInt(e.target.value, 10))}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                >
                  <option value={10}>Top 10</option>
                  <option value={20}>Top 20</option>
                  <option value={50}>Top 50</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
                  Phrase length
                </span>
                <select
                  value={ngramFilter}
                  onChange={(e) =>
                    setNgramFilter(parseInt(e.target.value, 10) as 0 | 1 | 2 | 3)
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                >
                  <option value={0}>All</option>
                  <option value={1}>Single words</option>
                  <option value={2}>Two-word phrases</option>
                  <option value={3}>Three-word phrases</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
                  Sort by
                </span>
                <select
                  value={keywordSort}
                  onChange={(e) =>
                    setKeywordSort(e.target.value as "freq" | "alpha")
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                >
                  <option value="freq">Frequency</option>
                  <option value="alpha">Alphabetical</option>
                </select>
              </label>

              <Field
                label="Filter keywords"
                value={keywordFilter}
                onChange={setKeywordFilter}
                placeholder="Search…"
              />
            </div>

            <div className="mt-3 flex flex-wrap gap-4 text-sm">
              <label className="inline-flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={ignoreStopWords}
                  onChange={(e) => setIgnoreStopWords(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                />
                Ignore stop words
              </label>
              <label className="inline-flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={caseSensitive}
                  onChange={(e) => setCaseSensitive(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                />
                Case sensitive
              </label>
            </div>

            <div className="mt-3">
              <Field
                label="Custom stop words"
                value={customStopWords}
                onChange={setCustomStopWords}
                placeholder="Comma separated, e.g. ipsum, dolor"
              />
            </div>

            <div className="mt-4 overflow-x-auto">
              {visibleKeywords.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">
                  {stats.words === 0
                    ? "Enter some text to see keyword analysis."
                    : "No keywords match the current filters."}
                </p>
              ) : (
                <table className="w-full min-w-[420px] border-collapse text-sm">
                  <caption className="sr-only">
                    Keyword frequency and density
                  </caption>
                  <thead>
                    <tr className="border-b border-slate-200 text-left dark:border-slate-700">
                      <th scope="col" className="py-2 pr-3 font-semibold">
                        Keyword
                      </th>
                      <th scope="col" className="py-2 pr-3 font-semibold">
                        Length
                      </th>
                      <th scope="col" className="py-2 pr-3 text-right font-semibold">
                        Count
                      </th>
                      <th scope="col" className="py-2 text-right font-semibold">
                        Density
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleKeywords.map((k) => (
                      <tr
                        key={`${k.n}-${k.keyword}`}
                        className="border-b border-slate-100 dark:border-slate-800"
                      >
                        <td className="py-2 pr-3 break-words">{k.keyword}</td>
                        <td className="py-2 pr-3 text-slate-500 dark:text-slate-400">
                          {k.n} word{k.n > 1 ? "s" : ""}
                        </td>
                        <td className="py-2 pr-3 text-right tabular-nums">
                          {k.count}
                        </td>
                        <td className="py-2 text-right tabular-nums">
                          {k.density.toFixed(2)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="mt-3">
              <ActionButton
                onClick={() =>
                  copyToClipboard(
                    visibleKeywords
                      .map((k) => `${k.keyword}\t${k.count}\t${k.density}%`)
                      .join("\n"),
                    "keywords"
                  )
                }
                disabled={visibleKeywords.length === 0}
              >
                {toast?.key === "keywords" ? "✓ Copied" : "⧉ Copy keyword table"}
              </ActionButton>
            </div>
          </Section>
        </div>

        {/* ── Readability ─────────────────────────────────────────────── */}
        <div className="mt-4">
          <Section
            title="Readability Analyzer"
            subtitle="Flesch Reading Ease, Flesch–Kincaid and Gunning Fog"
          >
            {!readability ? (
              <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-800/50 dark:text-slate-400">
                Not enough text for reliable readability analysis. Write at least
                20 words to see scores.
              </p>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
                  <Stat
                    label="Flesch Reading Ease"
                    value={readability.fleschReadingEase}
                    accent
                  />
                  <Stat
                    label="Flesch–Kincaid Grade"
                    value={readability.fleschKincaidGrade}
                  />
                  <Stat label="Gunning Fog" value={readability.gunningFog} />
                  <Stat
                    label="Avg sentence length"
                    value={readability.avgSentenceLength}
                  />
                  <Stat
                    label="Avg word length"
                    value={readability.avgWordLength}
                  />
                  <Stat label="Complex words" value={readability.complexWords} />
                </div>

                <div className="mt-4 rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                  <p className="text-sm">
                    Overall readability:{" "}
                    <strong className="text-indigo-600 dark:text-indigo-400">
                      {readability.label}
                    </strong>
                  </p>
                  <dl className="mt-3 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                    <div>
                      <dt className="font-semibold">Flesch Reading Ease</dt>
                      <dd>
                        0–30 very difficult, 30–50 difficult, 50–60 fairly
                        difficult, 60–70 standard, 70–80 fairly easy, 80–90 easy,
                        90–100 very easy.
                      </dd>
                    </div>
                    <div>
                      <dt className="font-semibold">Flesch–Kincaid Grade Level</dt>
                      <dd>
                        Approximates the US school grade needed to understand the
                        text. A score of 8 means roughly eighth-grade level.
                      </dd>
                    </div>
                    <div>
                      <dt className="font-semibold">Gunning Fog Index</dt>
                      <dd>
                        Estimates years of formal education required. Lower is
                        easier. Scores above 17 are considered very difficult.
                      </dd>
                    </div>
                  </dl>
                  <p className="mt-3 text-xs text-amber-700 dark:text-amber-400">
                    Note: syllable estimation is designed for English. Scores for
                    other scripts are indicative only.
                  </p>
                </div>
              </>
            )}
          </Section>
        </div>

        {/* ── Text quality ────────────────────────────────────────────── */}
        <div className="mt-4">
          <Section
            title="Text Quality Analyzer"
            subtitle="Long sentences, repetition, filler words and more"
          >
            {quality.length === 0 ? (
              <p className="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                {text.trim()
                  ? "No obvious issues detected. Your text looks clean."
                  : "Enter some text to run the quality analysis."}
              </p>
            ) : (
              <ul className="space-y-2">
                {quality.map((issue, i) => (
                  <li
                    key={i}
                    className={`rounded-xl border p-3 text-sm ${
                      issue.severity === "error"
                        ? "border-rose-200 bg-rose-50 dark:border-rose-900 dark:bg-rose-950/30"
                        : issue.severity === "warn"
                        ? "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30"
                        : "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40"
                    }`}
                  >
                    <p className="font-semibold">{issue.title}</p>
                    <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
                      {issue.detail}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </div>

        {/* ── Case converter ──────────────────────────────────────────── */}
        <div className="mt-4">
          <Section
            title="Text Case Converter"
            subtitle="UPPERCASE, Title Case, camelCase, snake_case and more"
          >
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["UPPERCASE", "uppercase"],
                  ["lowercase", "lowercase"],
                  ["Title Case", "titleCase"],
                  ["Sentence case", "sentenceCase"],
                  ["Capitalize Each Word", "capitalizeEachWord"],
                  ["camelCase", "camelCase"],
                  ["PascalCase", "pascalCase"],
                  ["snake_case", "snakeCase"],
                  ["kebab-case", "kebabCase"],
                  ["CONSTANT_CASE", "constantCase"],
                  ["dot.case", "dotCase"],
                ] as const
              ).map(([label, key]) => (
                <ActionButton
                  key={key}
                  onClick={() => setCaseResult(caseOps[key](text))}
                >
                  {label}
                </ActionButton>
              ))}
            </div>

            {caseResult && (
              <div className="mt-3">
                <label htmlFor="case-output" className="sr-only">
                  Converted text
                </label>
                <textarea
                  id="case-output"
                  readOnly
                  rows={4}
                  value={caseResult}
                  className="w-full resize-y rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 font-mono text-sm dark:border-slate-700 dark:bg-slate-800"
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  <ActionButton
                    onClick={() => copyToClipboard(caseResult, "case")}
                  >
                    {toast?.key === "case" ? "✓ Copied" : "⧉ Copy result"}
                  </ActionButton>
                  <ActionButton onClick={() => setText(caseResult)} variant="primary">
                    Replace editor text
                  </ActionButton>
                  <ActionButton
                    onClick={() => downloadFile("converted-text.txt", caseResult, "text/plain")}
                  >
                    ⭳ Download
                  </ActionButton>
                </div>
              </div>
            )}
          </Section>
        </div>

        {/* ── Text cleaner ────────────────────────────────────────────── */}
        <div className="mt-4">
          <Section
            title="Text Cleaner"
            subtitle="Tidy spacing, blank lines, duplicates and whitespace"
          >
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["Remove extra spaces", "removeExtraSpaces"],
                  ["Trim lines", "trimSpaces"],
                  ["Remove blank lines", "removeBlankLines"],
                  ["Remove extra line breaks", "removeExtraLineBreaks"],
                  ["Remove duplicate lines", "removeDuplicateLines"],
                  ["Remove duplicate words", "removeDuplicateWords"],
                  ["Normalize whitespace", "normalizeWhitespace"],
                  ["Remove leading spaces", "removeLeadingSpaces"],
                  ["Remove trailing spaces", "removeTrailingSpaces"],
                ] as const
              ).map(([label, key]) => (
                <ActionButton
                  key={key}
                  onClick={() => {
                    setText(cleanerOps[key](text));
                    flash("clean", "Applied");
                  }}
                >
                  {label}
                </ActionButton>
              ))}
            </div>
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
              Every action modifies the editor text directly. Use Undo
              (Ctrl/Cmd&nbsp;+&nbsp;Z outside the editor) to revert.
            </p>
          </Section>
        </div>

        {/* ── Find & replace ──────────────────────────────────────────── */}
        <div className="mt-4">
          <Section title="Find & Replace" subtitle="Search, count matches and replace">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Find" value={findText} onChange={setFindText} placeholder="Search text…" />
              <Field
                label="Replace with"
                value={replaceText}
                onChange={setReplaceText}
                placeholder="Replacement text…"
              />
            </div>

            <div className="mt-3 flex flex-wrap gap-4 text-sm">
              <label className="inline-flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={findCaseSensitive}
                  onChange={(e) => setFindCaseSensitive(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                />
                Case sensitive
              </label>
              <label className="inline-flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={findWholeWord}
                  onChange={(e) => setFindWholeWord(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                />
                Whole word
              </label>
            </div>

            <p
              aria-live="polite"
              className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              {findText
                ? `${matchCount} match${matchCount === 1 ? "" : "es"} found`
                : "Enter text to search"}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <ActionButton
                onClick={() => doReplace(false)}
                disabled={matchCount === 0}
              >
                Replace
              </ActionButton>
              <ActionButton
                onClick={() => doReplace(true)}
                variant="primary"
                disabled={matchCount === 0}
              >
                Replace All
              </ActionButton>
            </div>
          </Section>
        </div>

        {/* ── Sorting & reversal ──────────────────────────────────────── */}
        <div className="mt-4">
          <Section
            title="Sorting & Text Reversal"
            subtitle="Organise lines or reverse text, words and characters"
          >
            <h3 className="mb-2 text-sm font-semibold">Sorting</h3>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["Sort A–Z", "sortAZ"],
                  ["Sort Z–A", "sortZA"],
                  ["Sort numerically", "sortNumeric"],
                  ["Sort by length", "sortByLength"],
                  ["Reverse line order", "reverseLines"],
                  ["Remove duplicate lines", "removeDuplicateLines"],
                ] as const
              ).map(([label, key]) => (
                <ActionButton key={key} onClick={() => setText(sortOps[key](text))}>
                  {label}
                </ActionButton>
              ))}
            </div>

            <h3 className="mb-2 mt-5 text-sm font-semibold">Reversal</h3>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["Reverse entire text", "reverseText"],
                  ["Reverse words", "reverseWords"],
                  ["Reverse each line", "reverseEachLine"],
                ] as const
              ).map(([label, key]) => (
                <ActionButton key={key} onClick={() => setText(reverseOps[key](text))}>
                  {label}
                </ActionButton>
              ))}
            </div>

            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
              Example: “Hello World” → reverse words → “World Hello”. Reversal is
              grapheme-aware, so emojis and Devanagari clusters are not broken.
            </p>
          </Section>
        </div>

        {/* ── Academic tools ──────────────────────────────────────────── */}
        <div className="mt-4">
          <Section
            title="Academic Writing Tools"
            subtitle="Essay, abstract, thesis and page estimation helpers"
          >
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
              <Stat label="Essay word count" value={stats.words.toLocaleString()} />
              <Stat label="Assignment word count" value={stats.words.toLocaleString()} />
              <Stat label="Abstract word count" value={stats.words.toLocaleString()} />
              <Stat label="Thesis word count" value={stats.words.toLocaleString()} />
              <Stat label="Paragraph count" value={stats.paragraphs.toLocaleString()} />
              <Stat
                label="Citation count"
                value={(() => {
                  const matches =
                    debouncedText.match(/\([^)]*\d{4}[^)]*\)|\[\d+\]/g) ?? [];
                  return matches.length.toLocaleString();
                })()}
              />
              <Stat label="Estimated pages" value={estimatedPages} />
              <Stat
                label="Characters (no spaces)"
                value={stats.charactersWithoutSpaces.toLocaleString()}
              />
            </div>

            <div className="mt-4">
              <Field
                label="Assignment target (words)"
                type="number"
                min={0}
                value={goalWords}
                onChange={(v) => setGoalWords(Math.max(0, parseInt(v, 10) || 0))}
              />
              {goalWords > 0 && (
                <div className="mt-3">
                  <div className="mb-1 flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span className="font-medium">
                      {stats.words.toLocaleString()} / {goalWords.toLocaleString()} words
                    </span>
                    <span className="text-slate-600 dark:text-slate-400">
                      {stats.words >= goalWords
                        ? "Target reached 🎉"
                        : `${(goalWords - stats.words).toLocaleString()} words remaining`}
                    </span>
                  </div>
                  <Progress
                    value={stats.words}
                    max={goalWords}
                    tone={stats.words >= goalWords ? "green" : "indigo"}
                  />
                </div>
              )}
            </div>

            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
              Citation counting detects common patterns such as{" "}
              <code>(Smith, 2020)</code> and <code>[1]</code>. It is a rough
              estimate, not a reference manager.
            </p>
          </Section>
        </div>

        {/* ── Page calculator ─────────────────────────────────────────── */}
        <div className="mt-4">
          <Section
            title="Page Calculator"
            subtitle="Estimate how many pages your text will occupy"
          >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
                  Paper size
                </span>
                <select
                  value={paper}
                  onChange={(e) => setPaper(e.target.value as "A4" | "Letter")}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                >
                  <option value="A4">A4</option>
                  <option value="Letter">Letter</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
                  Font
                </span>
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                >
                  <option>Times New Roman</option>
                  <option>Arial</option>
                  <option>Calibri</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
                  Font size
                </span>
                <select
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                >
                  <option value={10}>10 pt</option>
                  <option value={11}>11 pt</option>
                  <option value={12}>12 pt</option>
                  <option value={14}>14 pt</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
                  Line spacing
                </span>
                <select
                  value={lineSpacing}
                  onChange={(e) => setLineSpacing(parseFloat(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                >
                  <option value={1}>Single</option>
                  <option value={1.15}>1.15</option>
                  <option value={1.5}>1.5</option>
                  <option value={2}>Double</option>
                </select>
              </label>
            </div>

            <div className="mt-4 rounded-xl border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-900 dark:bg-indigo-950/40">
              <p className="text-sm text-slate-700 dark:text-slate-300">
                Estimated pages
              </p>
              <p className="text-3xl font-extrabold text-indigo-700 dark:text-indigo-300">
                {estimatedPages}
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                This is an estimate only. Actual page count depends on margins,
                headers, footers, images and tables.
              </p>
            </div>
          </Section>
        </div>

        {/* ── Import / export ─────────────────────────────────────────── */}
        <div className="mt-4">
          <Section
            title="Import & Export"
            subtitle="Load a file or download your text and statistics"
          >
            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.csv,.json,.md,.markdown,.log,.html,.htm"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void handleFile(f);
                  e.target.value = "";
                }}
              />
              <ActionButton
                onClick={() => fileInputRef.current?.click()}
                variant="primary"
              >
                ⭱ Import file
              </ActionButton>
              <ActionButton onClick={() => exportAs("txt")}>⭳ TXT</ActionButton>
              <ActionButton onClick={() => exportAs("md")}>⭳ Markdown</ActionButton>
              <ActionButton onClick={() => exportAs("html")}>⭳ HTML</ActionButton>
              <ActionButton onClick={() => exportAs("json")}>⭳ JSON</ActionButton>
              <ActionButton onClick={() => exportAs("csv")}>⭳ CSV (stats)</ActionButton>
            </div>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Supported import formats: TXT, CSV, JSON, Markdown, HTML, LOG. All
              reading happens locally in your browser.
            </p>
          </Section>
        </div>

        {/* ── Local draft ─────────────────────────────────────────────── */}
        <div className="mt-4">
          <Section
            title="Local Draft & Privacy"
            subtitle="Auto-save your text in this browser only"
          >
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <label className="inline-flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={autoSave}
                  onChange={(e) => setAutoSave(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                />
                Auto-save draft in this browser
              </label>

              <ActionButton onClick={restoreDraft} disabled={!hasDraft}>
                Restore previous draft
              </ActionButton>
              <ActionButton onClick={clearDraft} variant="danger" disabled={!hasDraft}>
                Clear saved draft
              </ActionButton>
            </div>

            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
              Your text is processed locally in your browser and is never uploaded
              to a server. If auto-save is enabled, the draft is stored in your
              browser&apos;s localStorage and remains on this device until you clear
              it.
            </p>
          </Section>
        </div>

        {/* ── Informational content ───────────────────────────────────── */}
        <section className="mt-8 space-y-4">
          <h2 className="text-xl font-bold sm:text-2xl">
            About the Character Counter
          </h2>

          {[
            {
              h: "What Is a Character Counter?",
              p: "A character counter is a text tool that counts every character in a piece of writing. It is used constantly by social media managers, SEO specialists, students and writers, because most publishing platforms enforce strict character limits on titles, captions, bios and descriptions. A good counter doesn't just give one number — it separates letters, digits, spaces, punctuation and emojis so you can see exactly how your text is composed.",
            },
            {
              h: "Characters With Spaces vs Without Spaces",
              p: "Every space, tab and line break occupies a character position. So the phrase “Hello World” is 11 characters with spaces and 10 characters without spaces. Because X (Twitter), Instagram, Google Ads and most other platforms count spaces towards the limit, the “with spaces” figure is usually the one that matters for compliance. The “without spaces” figure is more useful for academic word and character requirements, or when a publishing system strips whitespace.",
            },
            {
              h: "Character Count vs Word Count",
              p: "Character count measures individual units of text; word count measures groups of characters separated by whitespace. In English, an average word is about five characters plus one space, so roughly 1,000 characters equals 160–180 words. That ratio breaks down for long technical terms, CJK text or Devanagari, which is why this tool reports both figures separately.",
            },
            {
              h: "How Reading Time Is Calculated",
              p: "Reading time is estimated as word count divided by reading speed in words per minute. The default here is 200 WPM, the average silent reading rate for adult native English speakers. Speaking is slower — around 130 WPM — so presentations and voiceovers are usually given a separate, longer estimate. Both values can be adjusted to match a specific audience or narrator.",
            },
            {
              h: "Character Counter for Students",
              p: "University assignments often specify limits in words, but applications, personal statements and scholarship essays frequently use character limits instead. For example, UCAS personal statements are capped at 4,000 characters including spaces. Using a counter that distinguishes characters-with-spaces from words helps students meet both kinds of requirement without last-minute panic.",
            },
            {
              h: "Character Counter for Writers",
              p: "Novelists and journalists work to word counts, but copywriters and content marketers often work to character counts. A headline of 60 characters, a meta description of 155 characters and a tweet of 280 characters all demand precise measurement. Live counting while writing avoids the tedious cycle of drafting long and trimming down afterwards.",
            },
            {
              h: "Social Media Character Limits",
              p: "Each platform sets its own limits. X posts allow 280 characters, Instagram captions 2,200 and Instagram bios 150. LinkedIn headlines allow 220 characters and YouTube titles 100. Going over a limit usually results in truncated text or a rejected post, which is why a per-platform checker is more useful than a single global count.",
            },
            {
              h: "SEO Character Counting",
              p: "Search engines display meta titles and descriptions at fixed pixel widths rather than fixed character counts, but character counts are a reliable proxy. Aim for 50–60 characters in a title and 150–160 in a description. Titles that run long are truncated with an ellipsis, which can hide your key phrase, so keeping within the recommended range improves click-through rates.",
            },
          ].map((item) => (
            <article
              key={item.h}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-slate-800 dark:bg-slate-900"
            >
              <h3 className="text-base font-semibold sm:text-lg">{item.h}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {item.p}
              </p>
            </article>
          ))}
        </section>

        {/* ── FAQ ─────────────────────────────────────────────────────── */}
        <section id="faq" className="mt-8">
          <h2 className="text-xl font-bold sm:text-2xl">Frequently Asked Questions</h2>
          <div className="mt-4 space-y-2">
            {FAQS.map((item, i) => (
              <details
                key={i}
                className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <summary className="cursor-pointer list-none text-sm font-semibold marker:hidden sm:text-base">
                  <span className="flex items-center justify-between gap-3">
                    {item.q}
                    <span
                      aria-hidden="true"
                      className="shrink-0 text-slate-400 transition-transform group-open:rotate-45"
                    >
                      +
                    </span>
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* ── Other useful tools ──────────────────────────────────────── */}
        <section className="mt-8">
          <h2 className="text-xl font-bold sm:text-2xl">Other Useful Tools</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Related text utilities planned for this site.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {[
              "Word Counter",
              "Text Case Converter",
              "Keyword Density Checker",
              "Lorem Ipsum Generator",
              "Meta Tag Generator",
              "Slug Generator",
              "Reading Time Calculator",
              "Text Cleaner",
              "Random Word Generator",
            ].map((name) => (
              <div
                key={name}
                aria-disabled="true"
                className="cursor-not-allowed rounded-xl border border-slate-200 bg-white p-4 text-sm font-medium text-slate-400 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                title="Coming soon"
              >
                {name}
                <span className="mt-1 block text-xs font-normal">Coming soon</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Footer ──────────────────────────────────────────────────── */}
        <footer className="mt-10 border-t border-slate-200 pt-6 pb-10 text-sm dark:border-slate-800">
          <nav
            aria-label="Footer"
            className="flex flex-wrap gap-x-5 gap-y-2 text-slate-600 dark:text-slate-400"
          >
            {[
              ["About", "/about"],
              ["Contact", "/contact"],
              ["Privacy Policy", "/privacy"],
              ["Terms & Conditions", "/terms"],
              ["Disclaimer", "/disclaimer"],
            ].map(([label, href]) => (
              <a
                key={href}
                href={href}
                className="transition hover:text-slate-900 dark:hover:text-white"
              >
                {label}
              </a>
            ))}
          </nav>
          <p className="mt-4 text-xs text-slate-500 dark:text-slate-500">
            Character Counter &amp; Writing Assistant. All text processing happens
            locally in your browser.
          </p>
        </footer>
      </main>

      {/* ── Toast ─────────────────────────────────────────────────────── */}
      <div
        aria-live="polite"
        role="status"
        className="pointer-events-none fixed bottom-5 left-1/2 z-50 -translate-x-1/2"
      >
        {toast && (
          <span className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-lg dark:bg-slate-100 dark:text-slate-900">
            {toast.msg}
          </span>
        )}
      </div>
    </div>
  );
}
