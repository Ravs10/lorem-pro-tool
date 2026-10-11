
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Mode = { id: string; label: string; group: string };
type HistoryItem = { id: string; mode: string; text: string; time: string };
type VoiceRecognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};
type SpeechWindow = Window & {
  SpeechRecognition?: new () => VoiceRecognition;
  webkitSpeechRecognition?: new () => VoiceRecognition;
};

const MODES: Mode[] = [
  { id: "upper", label: "UPPERCASE", group: "Standard" },
  { id: "lower", label: "lowercase", group: "Standard" },
  { id: "sentence", label: "Sentence case", group: "Standard" },
  { id: "title", label: "Title Case", group: "Standard" },
  { id: "capitalize", label: "Capitalize Every Word", group: "Standard" },
  { id: "first", label: "Capitalize First Letter", group: "Standard" },
  { id: "alternating", label: "aLtErNaTiNg CaSe", group: "Standard" },
  { id: "inverse", label: "Inverse Case", group: "Standard" },
  { id: "random", label: "Random-style Case", group: "Standard" },
  { id: "camel", label: "camelCase", group: "Developer" },
  { id: "pascal", label: "PascalCase", group: "Developer" },
  { id: "snake", label: "snake_case", group: "Developer" },
  { id: "screaming", label: "SCREAMING_SNAKE_CASE", group: "Developer" },
  { id: "kebab", label: "kebab-case", group: "Developer" },
  { id: "train", label: "Train-Case", group: "Developer" },
  { id: "dot", label: "dot.case", group: "Developer" },
  { id: "path", label: "path/case", group: "Developer" },
  { id: "flat", label: "flatcase", group: "Developer" },
  { id: "cobol", label: "COBOL-CASE", group: "Developer" },
  { id: "header", label: "Header-Case", group: "Developer" },
  { id: "param", label: "URL Param Case", group: "Developer" },
  { id: "slug", label: "SEO URL Slug", group: "SEO & Text" },
  { id: "reverseWords", label: "Reverse Word Order", group: "SEO & Text" },
  { id: "reverseChars", label: "Reverse Characters", group: "SEO & Text" },
  { id: "trim", label: "Trim Whitespace", group: "SEO & Text" },
  { id: "normalize", label: "Normalize Whitespace", group: "SEO & Text" },
  { id: "removePunctuation", label: "Remove Punctuation", group: "SEO & Text" },
  { id: "removeDiacritics", label: "Remove Diacritics", group: "SEO & Text" },
  { id: "removeEmoji", label: "Remove Emoji", group: "SEO & Text" },
  { id: "removeBlankLines", label: "Remove Blank Lines", group: "SEO & Text" },
  { id: "trimLines", label: "Trim Every Line", group: "SEO & Text" },
  { id: "uniqueLines", label: "Remove Duplicate Lines", group: "SEO & Text" },
  { id: "sortAZ", label: "Sort Lines A–Z", group: "SEO & Text" },
  { id: "sortZA", label: "Sort Lines Z–A", group: "SEO & Text" },
];

const SMALL_WORDS = new Set([
  "a", "an", "and", "as", "at", "but", "by", "for", "from",
  "if", "in", "into", "nor", "of", "on", "or", "over", "per",
  "the", "to", "up", "via", "with",
]);

const FAQS = [
  {
    q: "What is a case converter?",
    a: "A case converter changes the capitalization or format of text. It can convert sentences to uppercase, lowercase, title case, camelCase, snake_case and other supported formats.",
  },
  {
    q: "How do I convert text to uppercase or lowercase?",
    a: "Enter or paste your text, choose UPPERCASE or lowercase, preview the result, and select Apply or Copy Output.",
  },
  {
    q: "What is the difference between camelCase and PascalCase?",
    a: "camelCase begins with a lowercase word, such as myVariableName. PascalCase capitalizes the first letter of each word, such as MyVariableName.",
  },
  {
    q: "What is snake_case used for?",
    a: "snake_case joins lowercase words with underscores. It is commonly used for identifiers in Python and other programming conventions.",
  },
  {
    q: "What is an SEO slug?",
    a: "An SEO slug is a readable URL segment, usually containing lowercase words separated by hyphens. Short, descriptive slugs can make page URLs easier to understand.",
  },
  {
    q: "Can I use voice typing?",
    a: "If your browser supports speech recognition, you can use the microphone button to dictate text. Browser, language, microphone permission and device support can affect availability.",
  },
  {
    q: "Can the tool read text aloud?",
    a: "Yes. Supported browsers can use their installed speech synthesis voices to read the original text, converted preview or share message aloud.",
  },
  {
    q: "Is my text uploaded to a server?",
    a: "This page performs text transformations in the browser. Browser speech services and external social platforms may have their own processing and privacy practices.",
  },
  {
    q: "Does Instagram support direct text sharing from a website?",
    a: "Instagram does not provide a universal web intent for publishing arbitrary captions. This tool copies your prepared caption and opens Instagram so you can continue manually.",
  },
  {
    q: "Does FAQ schema guarantee a Google rich result?",
    a: "No. Structured data helps search engines understand page content, but Google decides whether a special search appearance is shown.",
  },
];

function wordsOf(input: string): string[] {
  return input
    .replace(/([a-z\d])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .match(/[\p{L}\p{N}]+/gu) ?? [];
}

function cap(word: string, locale: string) {
  if (!word) return word;
  const lower = word.toLocaleLowerCase(locale);
  return lower.charAt(0).toLocaleUpperCase(locale) + lower.slice(1);
}

function toTitle(
  text: string,
  locale: string,
  smart: boolean,
  preserveAcronyms: boolean,
  extraSmall: string
) {
  const small = new Set([
    ...SMALL_WORDS,
    ...extraSmall.split(",").map((s) => s.trim().toLocaleLowerCase(locale)).filter(Boolean),
  ]);

  const tokens = text.split(/(\s+)/);
  let index = 0;
  const count = tokens.filter((t) => /[\p{L}\p{N}]/u.test(t)).length;

  return tokens.map((token) => {
    if (!/[\p{L}\p{N}]/u.test(token)) return token;
    const current = index++;
    if (preserveAcronyms && /^[A-Z\d]{2,}$/.test(token)) return token;
    const lower = token.toLocaleLowerCase(locale);
    if (smart && current > 0 && current < count - 1 && small.has(lower)) return lower;
    return cap(token, locale);
  }).join("");
}

function convert(
  text: string,
  mode: string,
  settings: {
    locale: string;
    smartTitle: boolean;
    preserveAcronyms: boolean;
    smallWords: string;
    separator: string;
  }
): string {
  const { locale, smartTitle, preserveAcronyms, smallWords, separator } = settings;
  const tokens = wordsOf(text);
  const normalized = tokens.map((word) =>
    preserveAcronyms && /^[A-Z\d]{2,}$/.test(word)
      ? word
      : word.toLocaleLowerCase(locale)
  );

  switch (mode) {
    case "upper": return text.toLocaleUpperCase(locale);
    case "lower": return text.toLocaleLowerCase(locale);
    case "title": return toTitle(text, locale, smartTitle, preserveAcronyms, smallWords);
    case "capitalize":
      return text.replace(/[\p{L}\p{N}]+/gu, (word) =>
        preserveAcronyms && /^[A-Z\d]{2,}$/.test(word) ? word : cap(word, locale)
      );
    case "first":
      return text.replace(/[\p{L}\p{N}]/u, (letter) => letter.toLocaleUpperCase(locale));
    case "sentence": {
      let start = true;
      return text.replace(/[\p{L}\p{N}]+/gu, (word) => {
        const acronym = preserveAcronyms && /^[A-Z\d]{2,}$/.test(word);
        const result = start
          ? acronym ? word : cap(word, locale)
          : acronym ? word : word.toLocaleLowerCase(locale);
        start = false;
        return result;
      }).replace(/([.!?]+[\s"'”’)\]}]*)/g, (match) => {
        start = true;
        return match;
      });
    }
    case "alternating": {
      let index = 0;
      return text.replace(/\p{L}/gu, (letter) =>
        index++ % 2 === 0
          ? letter.toLocaleLowerCase(locale)
          : letter.toLocaleUpperCase(locale)
      );
    }
    case "inverse":
      return [...text].map((letter) => {
        const upper = letter.toLocaleUpperCase(locale);
        const lower = letter.toLocaleLowerCase(locale);
        if (upper === lower) return letter;
        return letter === upper ? lower : upper;
      }).join("");
    case "random": {
      let seed = 17;
      return [...text].map((letter) => {
        seed = (seed * 31 + letter.codePointAt(0)!) % 9973;
        if (!/\p{L}/u.test(letter)) return letter;
        return seed % 2
          ? letter.toLocaleUpperCase(locale)
          : letter.toLocaleLowerCase(locale);
      }).join("");
    }
    case "camel":
      return normalized[0] + normalized.slice(1).map((w) => cap(w, locale)).join("");
    case "pascal":
      return normalized.map((w) => cap(w, locale)).join("");
    case "snake": return normalized.join(separator === "default" ? "_" : separator);
    case "screaming":
      return normalized.join(separator === "default" ? "_" : separator).toLocaleUpperCase(locale);
    case "kebab": return normalized.join(separator === "default" ? "-" : separator);
    case "train":
    case "header":
      return normalized.map((w) => cap(w, locale)).join(separator === "default" ? "-" : separator);
    case "dot": return normalized.join(separator === "default" ? "." : separator);
    case "path": return normalized.join(separator === "default" ? "/" : separator);
    case "flat": return normalized.join("");
    case "cobol": return normalized.join(separator === "default" ? "-" : separator).toLocaleUpperCase(locale);
    case "param": return normalized.map(encodeURIComponent).join("&");
    case "slug":
      return text
        .normalize("NFKD")
        .replace(/\p{M}/gu, "")
        .toLocaleLowerCase(locale)
        .replace(/['’]/g, "")
        .replace(/[^\p{L}\p{N}]+/gu, "-")
        .replace(/^-+|-+$/g, "");
    case "reverseWords":
      return text.trim().split(/\s+/u).filter(Boolean).reverse().join(" ");
    case "reverseChars": return [...text].reverse().join("");
    case "trim": return text.trim();
    case "normalize": return text.replace(/\s+/gu, " ").trim();
    case "removePunctuation": return text.replace(/[^\p{L}\p{N}\s]/gu, "");
    case "removeDiacritics": return text.normalize("NFD").replace(/\p{M}/gu, "");
    case "removeEmoji":
      return text.replace(/\p{Extended_Pictographic}(?:\uFE0F|\uFE0E)?/gu, "");
    case "removeBlankLines":
      return text.split(/\r?\n/).filter((line) => line.trim()).join("\n");
    case "trimLines":
      return text.split(/\r?\n/).map((line) => line.trim()).join("\n");
    case "uniqueLines":
      return [...new Set(text.split(/\r?\n/))].join("\n");
    case "sortAZ":
      return text.split(/\r?\n/).sort((a, b) => a.localeCompare(b, locale)).join("\n");
    case "sortZA":
      return text.split(/\r?\n/).sort((a, b) => b.localeCompare(a, locale)).join("\n");
    default: return text;
  }
}

function getCounts(text: string) {
  return {
    characters: text.length,
    noSpaces: text.replace(/\s/g, "").length,
    words: text.trim() ? text.trim().split(/\s+/u).length : 0,
    lines: text ? text.split(/\r\n|\r|\n/).length : 0,
    sentences: text.trim() ? (text.match(/[^.!?]+[.!?]*/g) ?? []).filter((s) => s.trim()).length : 0,
  };
}

function escapeHtml(text: string) {
  return text.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[char]!);
}

const PLATFORM_LIST = ["WhatsApp", "X", "Instagram", "Facebook", "LinkedIn", "Email"] as const;
type Platform = (typeof PLATFORM_LIST)[number];

export default function CaseConverterPage() {
  const [text, setText] = useState("");
  const [mode, setMode] = useState("title");
  const [locale, setLocale] = useState("en-US");
  const [smartTitle, setSmartTitle] = useState(true);
  const [preserveAcronyms, setPreserveAcronyms] = useState(true);
  const [smallWords, setSmallWords] = useState("");
  const [separator, setSeparator] = useState("default");
  const [selectedOnly, setSelectedOnly] = useState(false);
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showGuide, setShowGuide] = useState(true);
  const [showFaq, setShowFaq] = useState(false);
  const [showSeo, setShowSeo] = useState(false);
  const [showSchema, setShowSchema] = useState(false);
  const [showShare, setShowShare] = useState(true);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const [notice, setNotice] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceName, setVoiceName] = useState("");
  const [speechLang, setSpeechLang] = useState("en-US");
  const [speechRate, setSpeechRate] = useState(1);
  const [speechPitch, setSpeechPitch] = useState(1);
  const [shareTitle, setShareTitle] = useState("Textlyzer PRO Case Converter");
  const [shareMessage, setShareMessage] = useState("Convert your text with this advanced online case converter.");
  const [shareUrl, setShareUrl] = useState("");
  const [shareHashtags, setShareHashtags] = useState("#Textlyzer #CaseConverter");
  const [shareCta, setShareCta] = useState("Try it today!");
  const [shareSource, setShareSource] = useState<"preview" | "original" | "custom">("preview");
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<VoiceRecognition | null>(null);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const settings = useMemo(() => ({
    locale, smartTitle, preserveAcronyms, smallWords, separator,
  }), [locale, smartTitle, preserveAcronyms, smallWords, separator]);

  const selectedText = selectedOnly && selection.end > selection.start
    ? text.slice(selection.start, selection.end)
    : "";

  const preview = useMemo(() => {
    if (selectedOnly && selection.end > selection.start) {
      return text.slice(0, selection.start) +
        convert(selectedText, mode, settings) +
        text.slice(selection.end);
    }
    return convert(text, mode, settings);
  }, [text, mode, settings, selectedOnly, selection, selectedText]);

  const counts = useMemo(() => getCounts(text), [text]);
  const previewCounts = useMemo(() => getCounts(preview), [preview]);

  const keywordFrequency = useMemo(() => {
    const map = new Map<string, number>();
    for (const word of wordsOf(text.toLocaleLowerCase(locale))) {
      if (word.length < 2) continue;
      map.set(word, (map.get(word) ?? 0) + 1);
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12);
  }, [text, locale]);

  const pageTitle = "Free Online Case Converter - Textlyzer PRO";
  const metaDescription =
    "Convert text to uppercase, lowercase, Title Case, camelCase, snake_case and SEO-friendly slugs. Use voice typing, text-to-speech and social sharing.";

  const schema = useMemo(() => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    return {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebApplication",
          name: "Textlyzer PRO Case Converter",
          applicationCategory: "UtilitiesApplication",
          operatingSystem: "Any",
          description: metaDescription,
          url,
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        },
        {
          "@type": "WebPage",
          name: pageTitle,
          description: metaDescription,
          url,
          inLanguage: "en",
          mainEntity: { "@id": `${url}#case-converter` },
        },
        {
          "@type": "SoftwareApplication",
          "@id": `${url}#case-converter`,
          name: "Textlyzer PRO Case Converter",
          applicationCategory: "UtilitiesApplication",
          operatingSystem: "Web",
          description: metaDescription,
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        },
        {
          "@type": "FAQPage",
          mainEntity: FAQS.map((faq) => ({
            "@type": "Question",
            name: faq.q,
            acceptedAnswer: { "@type": "Answer", text: faq.a },
          })),
        },
      ],
    };
  }, [metaDescription, pageTitle]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("textlyzer_ultra_case_history");
      if (raw) setHistory(JSON.parse(raw) as HistoryItem[]);
    } catch {
      // Storage can be unavailable.
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("textlyzer_ultra_case_history", JSON.stringify(history.slice(0, 30)));
    } catch {
      // Continue without persistent history.
    }
  }, [history]);

  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    const refreshVoices = () => {
      const available = window.speechSynthesis.getVoices();
      setVoices(available);
      if (!voiceName && available.length) {
        const preferred = available.find((v) => v.lang === speechLang) ??
          available.find((v) => v.lang.startsWith(speechLang.split("-")[0])) ??
          available[0];
        setVoiceName(preferred.name);
      }
    };
    refreshVoices();
    window.speechSynthesis.addEventListener?.("voiceschanged", refreshVoices);
    window.speechSynthesis.onvoiceschanged = refreshVoices;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
      window.speechSynthesis.removeEventListener?.("voiceschanged", refreshVoices);
    };
  }, [speechLang, voiceName]);

  useEffect(() => {
    document.title = pageTitle;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", metaDescription);

    const canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical && typeof window !== "undefined") {
      const link = document.createElement("link");
      link.rel = "canonical";
      link.href = window.location.href.split("#")[0];
      document.head.appendChild(link);
    }

    const schemaId = "textlyzer-case-schema";
    let script = document.getElementById(schemaId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = schemaId;
      script.type = "application/ld+json";
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(schema);

    return () => {
      document.getElementById(schemaId)?.remove();
    };
  }, [pageTitle, metaDescription, schema]);

  useEffect(() => () => {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    recognitionRef.current?.stop();
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
  }, []);

  const notify = useCallback((message: string) => {
    setNotice(message);
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(""), 3000);
  }, []);

  const copyText = useCallback(async (value: string, label = "Text") => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(value);
      } else {
        const element = document.createElement("textarea");
        element.value = value;
        element.style.position = "fixed";
        element.style.opacity = "0";
        document.body.appendChild(element);
        element.select();
        const ok = document.execCommand("copy");
        element.remove();
        if (!ok) throw new Error("Copy unavailable");
      }
      notify(`${label} copied.`);
    } catch {
      notify("Copy failed. Please select and copy manually.");
    }
  }, [notify]);

  function rememberCurrent() {
    setUndoStack((stack) => [...stack.slice(-49), text]);
    setRedoStack([]);
  }

  function applyConversion() {
    if (!text) return notify("Enter some text first.");
    rememberCurrent();
    setText(preview);
    setHistory((items) => [{
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      mode,
      text: preview,
      time: new Date().toLocaleString(),
    }, ...items].slice(0, 30));
    setSelection({ start: 0, end: 0 });
    setSelectedOnly(false);
    notify("Conversion applied.");
  }

  function undo() {
    if (!undoStack.length) return notify("Nothing to undo.");
    setRedoStack((stack) => [...stack, text]);
    setText(undoStack[undoStack.length - 1]);
    setUndoStack((stack) => stack.slice(0, -1));
  }

  function redo() {
    if (!redoStack.length) return notify("Nothing to redo.");
    setUndoStack((stack) => [...stack, text]);
    setText(redoStack[redoStack.length - 1]);
    setRedoStack((stack) => stack.slice(0, -1));
  }

  function transformWith(fn: (input: string) => string, label: string) {
    rememberCurrent();
    setText(fn(text));
    notify(label);
  }

  function download(value: string, filename: string, mime = "text/plain;charset=utf-8") {
    const blob = new Blob([value], { type: mime });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
    notify("Download started.");
  }

  function startSpeechRecognition() {
    const speechWindow = window as SpeechWindow;
    const Recognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;

    if (!Recognition) {
      notify("Voice typing is not supported in this browser. Try a supported browser.");
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
      setIsListening(false);
      return;
    }

    const recognition = new Recognition();
    recognition.lang = speechLang;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (event) => {
      let finalText = "";
      let interimText = "";
      for (let i = event.resultIndex ?? 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) finalText += result[0].transcript;
        else interimText += result[0].transcript;
      }
      if (finalText) {
        setText((current) => current + (current && !/\s$/.test(current) ? " " : "") + finalText);
      }
      if (interimText) setNotice(`Listening: ${interimText}`);
    };
    recognition.onerror = (event) => {
      setIsListening(false);
      recognitionRef.current = null;
      notify(`Voice input error: ${event.error ?? "unknown error"}`);
    };
    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    try {
      recognitionRef.current = recognition;
      recognition.start();
      setIsListening(true);
      notify("Voice typing started.");
    } catch {
      recognitionRef.current = null;
      setIsListening(false);
      notify("Could not start voice typing. Check microphone permissions.");
    }
  }

  function speak(value: string) {
    if (!value.trim()) return notify("There is no text to read.");
    if (!("speechSynthesis" in window)) {
      return notify("Text-to-speech is not supported in this browser.");
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(value);
    const voice = voices.find((item) => item.name === voiceName);
    if (voice) utterance.voice = voice;
    utterance.lang = voice?.lang ?? speechLang;
    utterance.rate = speechRate;
    utterance.pitch = speechPitch;
    utterance.onstart = () => setNotice("Reading text aloud…");
    utterance.onerror = () => notify("Speech playback failed.");
    utterance.onend = () => setNotice("");
    window.speechSynthesis.speak(utterance);
  }

  function stopSpeaking() {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    notify("Speech stopped.");
  }

  function selectedShareText() {
    if (shareSource === "original") return text;
    if (shareSource === "custom") return shareMessage;
    return preview;
  }

  function getShareCaption() {
    return [
      shareTitle.trim(),
      shareMessage.trim(),
      selectedShareText().trim(),
      shareHashtags.trim(),
      shareCta.trim(),
    ].filter(Boolean).join("\n\n");
  }

  function validShareUrl() {
    const candidate = shareUrl.trim() || window.location.href;
    const url = new URL(candidate);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error("Only HTTP and HTTPS URLs are supported.");
    }
    return url.toString();
  }

  async function share(platform: Platform) {
    let url: string;
    try {
      url = validShareUrl();
    } catch {
      notify("Enter a valid website URL, or leave it empty to use this page.");
      return;
    }

    const caption = getShareCaption();
    const encodedCaption = encodeURIComponent(caption);
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(shareTitle);

    if (platform === "Instagram") {
      await copyText(caption, "Instagram caption");
      window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
      notify("Caption copied. Paste it into Instagram manually.");
      return;
    }

    if (platform === "Email") {
      const subject = encodeURIComponent(shareTitle);
      const body = encodeURIComponent(`${caption}\n\n${url}`);
      window.location.href = `mailto:?subject=${subject}&body=${body}`;
      return;
    }

    const destinations: Record<Exclude<Platform, "Instagram" | "Email">, string> = {
      WhatsApp: `https://wa.me/?text=${encodeURIComponent(`${caption}\n\n${url}`)}`,
      X: `https://twitter.com/intent/tweet?text=${encodedCaption}&url=${encodedUrl}`,
      Facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      LinkedIn: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    };

    const popup = window.open(
      destinations[platform],
      "_blank",
      "noopener,noreferrer"
    );
    if (!popup) {
      await copyText(`${caption}\n\n${url}`, "Share text");
      notify("Popup blocked. Share text copied instead.");
    }
  }

  function exportHistory() {
    const rows = [
      ["Date", "Mode", "Text"],
      ...history.map((item) => [item.time, item.mode, item.text]),
    ];
    const csv = rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    ).join("\r\n");
    download("\uFEFF" + csv, "textlyzer-history.csv", "text/csv;charset=utf-8");
  }

  const groupedModes = useMemo(() => {
    const groups: Record<string, Mode[]> = {};
    for (const item of MODES) (groups[item.group] ??= []).push(item);
    return groups;
  }, []);

  const guide = [
    ["1. Enter text", "Paste or type text in the editor. You can also use voice typing if your browser supports it."],
    ["2. Select a mode", "Choose a standard, developer, or text-cleanup operation. The preview updates automatically."],
    ["3. Adjust settings", "Choose a language locale, preserve acronyms, configure title-case rules, or set a custom separator."],
    ["4. Preview and apply", "Review the output. Use Apply to update your text, or Copy Output to copy the preview without changing the editor."],
    ["5. Speak or share", "Use text-to-speech to listen, or prepare a separate share message for WhatsApp, X, Instagram, Facebook, LinkedIn or Email."],
  ];

  return (
    <main className="min-h-screen bg-slate-50 px-3 py-6 text-slate-900 dark:bg-slate-950 dark:text-slate-100 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      {notice && (
        <div
          role="status"
          aria-live="polite"
          className="fixed right-4 top-4 z-50 max-w-[90vw] rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-xl"
        >
          {notice}
        </div>
      )}

      <div className="mx-auto max-w-7xl">
        <header className="mb-7 rounded-3xl bg-gradient-to-br from-indigo-700 via-violet-700 to-blue-800 p-6 text-white shadow-xl sm:p-9">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em]">
              Textlyzer PRO
            </span>
            <span className="rounded-full bg-emerald-300/20 px-3 py-1 text-xs font-bold text-emerald-100">
              Free Text Utility
            </span>
          </div>
          <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-5xl">
            Ultra Advanced Case Converter
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-indigo-100 sm:text-base">
            Convert capitalization, generate developer naming conventions,
            create SEO slugs, clean text, use voice typing, listen to text,
            and prepare social media captions in one browser-based workspace.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <button onClick={() => editorRef.current?.focus()} className="rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-indigo-800 hover:bg-indigo-50">
              Start converting
            </button>
            <button onClick={() => setShowShare((v) => !v)} className="rounded-xl border border-white/40 px-4 py-2.5 text-sm font-bold hover:bg-white/10">
              {showShare ? "Hide Social Share" : "Open Social Share"}
            </button>
          </div>
        </header>

        <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-black">Choose your text operation</h2>
            <button onClick={() => setShowAdvanced((v) => !v)} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold dark:border-slate-700">
              {showAdvanced ? "Hide advanced settings" : "⚙ Advanced settings"}
            </button>
          </div>

          {Object.entries(groupedModes).map(([group, modes]) => (
            <div key={group} className="mb-5 last:mb-0">
              <h3 className="mb-2 text-xs font-black uppercase tracking-[0.15em] text-indigo-600 dark:text-indigo-400">
                {group}
              </h3>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                {modes.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setMode(item.id)}
                    aria-pressed={mode === item.id}
                    className={`rounded-xl border px-3 py-3 text-left text-sm font-bold transition ${
                      mode === item.id
                        ? "border-indigo-600 bg-indigo-50 text-indigo-800 ring-2 ring-indigo-500/20 dark:bg-indigo-950 dark:text-indigo-200"
                        : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {showAdvanced && (
            <div className="mt-5 grid gap-4 border-t border-slate-200 pt-5 dark:border-slate-800 sm:grid-cols-2">
              <label className="text-sm font-bold">
                Casing locale
                <select value={locale} onChange={(e) => setLocale(e.target.value)} className="mt-2 block w-full rounded-xl border border-slate-300 bg-white p-3 font-normal dark:border-slate-700 dark:bg-slate-950">
                  <option value="en-US">English (United States)</option>
                  <option value="en-GB">English (United Kingdom)</option>
                  <option value="hi-IN">Hindi (India)</option>
                  <option value="tr-TR">Turkish</option>
                  <option value="de-DE">German</option>
                  <option value="fr-FR">French</option>
                </select>
              </label>
              <label className="text-sm font-bold">
                Developer case separator
                <select value={separator} onChange={(e) => setSeparator(e.target.value)} className="mt-2 block w-full rounded-xl border border-slate-300 bg-white p-3 font-normal dark:border-slate-700 dark:bg-slate-950">
                  <option value="default">Standard separator</option>
                  <option value="_">Underscore _</option>
                  <option value="-">Hyphen -</option>
                  <option value=".">Dot .</option>
                  <option value="/">Slash /</option>
                  <option value=" ">Space</option>
                </select>
              </label>
              <label className="flex items-center gap-3 text-sm">
                <input type="checkbox" checked={smartTitle} onChange={(e) => setSmartTitle(e.target.checked)} className="h-4 w-4 accent-indigo-600" />
                Smart Title Case small-word rules
              </label>
              <label className="flex items-center gap-3 text-sm">
                <input type="checkbox" checked={preserveAcronyms} onChange={(e) => setPreserveAcronyms(e.target.checked)} className="h-4 w-4 accent-indigo-600" />
                Preserve existing uppercase acronyms
              </label>
              <label className="text-sm font-bold sm:col-span-2">
                Custom small words (comma-separated)
                <input value={smallWords} onChange={(e) => setSmallWords(e.target.value)} placeholder="about, after, before" className="mt-2 block w-full rounded-xl border border-slate-300 bg-white p-3 font-normal dark:border-slate-700 dark:bg-slate-950" />
              </label>
            </div>
          )}
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-black">Original text</h2>
              <button onClick={() => { rememberCurrent(); setText(""); setSelection({ start: 0, end: 0 }); }} className="rounded-lg px-3 py-2 text-sm font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950">
                Clear
              </button>
            </div>

            <textarea
              ref={editorRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onSelect={(e) => setSelection({ start: e.currentTarget.selectionStart, end: e.currentTarget.selectionEnd })}
              placeholder="Type, paste, or dictate your text here..."
              spellCheck
              className="min-h-72 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-7 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-950"
            />

            <label className="mt-3 flex items-center gap-2 text-sm">
              <input type="checkbox" checked={selectedOnly} onChange={(e) => setSelectedOnly(e.target.checked)} className="h-4 w-4 accent-indigo-600" />
              Convert selected text only
            </label>
            {selectedOnly && (
              <p className="mt-2 text-xs text-slate-500">
                Highlight a range inside the editor. If no range is selected, the full text is converted.
              </p>
            )}

            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
              {[
                ["Characters", counts.characters],
                ["No spaces", counts.noSpaces],
                ["Words", counts.words],
                ["Lines", counts.lines],
                ["Sentences", counts.sentences],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl bg-slate-100 p-3 dark:bg-slate-800">
                  <p className="text-xs text-slate-500">{label}</p>
                  <p className="mt-1 text-lg font-black">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button onClick={startSpeechRecognition} className={`rounded-xl px-4 py-3 text-sm font-bold text-white ${isListening ? "bg-rose-600" : "bg-violet-600 hover:bg-violet-700"}`}>
                {isListening ? "■ Stop voice typing" : "🎙 Voice typing"}
              </button>
              <button onClick={() => void copyText(text, "Original text")} className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-bold dark:border-slate-700">
                Copy original
              </button>
              <button onClick={() => download(text, "original-text.txt")} className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-bold dark:border-slate-700">
                Download TXT
              </button>
            </div>
          </div>

          <div className="min-w-0 rounded-2xl border border-indigo-200 bg-white p-4 dark:border-indigo-900 dark:bg-slate-900 sm:p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-black">Live converted preview</h2>
              <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200">
                {MODES.find((item) => item.id === mode)?.label}
              </span>
            </div>

            <textarea
              readOnly
              value={preview}
              aria-label="Converted text preview"
              className="min-h-72 w-full resize-y rounded-xl border border-indigo-200 bg-indigo-50/50 p-4 text-sm leading-7 outline-none dark:border-indigo-900 dark:bg-slate-950"
            />

            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                ["Characters", previewCounts.characters],
                ["No spaces", previewCounts.noSpaces],
                ["Words", previewCounts.words],
                ["Lines", previewCounts.lines],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl bg-slate-100 p-3 dark:bg-slate-800">
                  <p className="text-xs text-slate-500">{label}</p>
                  <p className="mt-1 text-lg font-black">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button onClick={() => void copyText(preview, "Converted text")} className="rounded-xl bg-indigo-600 px-3 py-3 text-sm font-bold text-white hover:bg-indigo-700">
                Copy output
              </button>
              <button onClick={applyConversion} className="rounded-xl bg-emerald-600 px-3 py-3 text-sm font-bold text-white hover:bg-emerald-700">
                Apply conversion
              </button>
              <button onClick={undo} className="rounded-xl border border-slate-300 px-3 py-3 text-sm font-bold dark:border-slate-700">
                ↶ Undo
              </button>
              <button onClick={redo} className="rounded-xl border border-slate-300 px-3 py-3 text-sm font-bold dark:border-slate-700">
                ↷ Redo
              </button>
            </div>

            <div className="mt-2 grid grid-cols-2 gap-2">
              <button onClick={() => download(preview, `textlyzer-${mode}.txt`)} className="rounded-xl border border-slate-300 px-3 py-3 text-sm font-bold dark:border-slate-700">
                Download result
              </button>
              <button onClick={() => void copyText(preview, "Result")} className="rounded-xl border border-slate-300 px-3 py-3 text-sm font-bold dark:border-slate-700">
                Copy again
              </button>
            </div>
          </div>
        </section>

        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:p-5">
          <h2 className="text-xl font-black">🔊 Voice & speech studio</h2>
          <p className="mt-2 text-sm text-slate-500">
            Read the original text, converted preview or share caption aloud. Voice options depend on your browser and device.
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-bold">
              Text to read
              <select id="speech-source" className="mt-2 block w-full rounded-xl border border-slate-300 bg-white p-3 font-normal dark:border-slate-700 dark:bg-slate-950">
                <option value="preview">Converted preview</option>
                <option value="original">Original text</option>
                <option value="share">Social share caption</option>
              </select>
            </label>
            <label className="text-sm font-bold">
              Speech language
              <select value={speechLang} onChange={(e) => setSpeechLang(e.target.value)} className="mt-2 block w-full rounded-xl border border-slate-300 bg-white p-3 font-normal dark:border-slate-700 dark:bg-slate-950">
                <option value="en-US">English (US)</option>
                <option value="en-GB">English (UK)</option>
                <option value="hi-IN">Hindi (India)</option>
                <option value="en-IN">English (India)</option>
                <option value="fr-FR">French</option>
                <option value="de-DE">German</option>
                <option value="es-ES">Spanish</option>
              </select>
            </label>
            <label className="text-sm font-bold sm:col-span-2">
              Installed voice
              <select value={voiceName} onChange={(e) => setVoiceName(e.target.value)} className="mt-2 block w-full rounded-xl border border-slate-300 bg-white p-3 font-normal dark:border-slate-700 dark:bg-slate-950">
                <option value="">Default device voice</option>
                {voices.map((voice) => (
                  <option key={`${voice.name}-${voice.lang}`} value={voice.name}>
                    {voice.name} ({voice.lang}){voice.default ? " — Default" : ""}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-bold">
              Speaking rate: {speechRate.toFixed(1)}×
              <input type="range" min="0.5" max="2" step="0.1" value={speechRate} onChange={(e) => setSpeechRate(Number(e.target.value))} className="mt-3 block w-full accent-indigo-600" />
            </label>
            <label className="text-sm font-bold">
              Voice pitch: {speechPitch.toFixed(1)}
              <input type="range" min="0" max="2" step="0.1" value={speechPitch} onChange={(e) => setSpeechPitch(Number(e.target.value))} className="mt-3 block w-full accent-indigo-600" />
            </label>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => {
                const select = document.getElementById("speech-source") as HTMLSelectElement | null;
                const source = select?.value ?? "preview";
                speak(source === "original" ? text : source === "share" ? getShareCaption() : preview);
              }}
              className="rounded-xl bg-violet-600 px-4 py-3 text-sm font-bold text-white hover:bg-violet-700"
            >
              ▶ Speak
            </button>
            <button onClick={() => { if ("speechSynthesis" in window) window.speechSynthesis.pause(); }} className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-bold dark:border-slate-700">
              Pause
            </button>
            <button onClick={() => { if ("speechSynthesis" in window) window.speechSynthesis.resume(); }} className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-bold dark:border-slate-700">
              Resume
            </button>
            <button onClick={stopSpeaking} className="rounded-xl border border-rose-200 px-4 py-3 text-sm font-bold text-rose-600 dark:border-rose-900">
              Stop speech
            </button>
          </div>
        </section>

        {showShare && (
          <section className="mt-5 rounded-2xl border border-indigo-200 bg-white p-4 dark:border-indigo-900 dark:bg-slate-900 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
                  Independent social tools
                </p>
                <h2 className="mt-2 text-2xl font-black">Social Share Studio</h2>
              </div>
              <button onClick={() => setShowShare(false)} className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-bold dark:border-slate-700">
                Hide
              </button>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-bold">
                Share title
                <input value={shareTitle} onChange={(e) => setShareTitle(e.target.value)} className="mt-2 block w-full rounded-xl border border-slate-300 bg-white p-3 font-normal dark:border-slate-700 dark:bg-slate-950" />
              </label>
              <label className="text-sm font-bold">
                Website URL (optional)
                <input value={shareUrl} onChange={(e) => setShareUrl(e.target.value)} placeholder="https://example.com" inputMode="url" className="mt-2 block w-full rounded-xl border border-slate-300 bg-white p-3 font-normal dark:border-slate-700 dark:bg-slate-950" />
              </label>
              <label className="text-sm font-bold sm:col-span-2">
                Share message
                <textarea rows={3} value={shareMessage} onChange={(e) => setShareMessage(e.target.value)} className="mt-2 block w-full rounded-xl border border-slate-300 bg-white p-3 font-normal dark:border-slate-700 dark:bg-slate-950" />
              </label>
              <label className="text-sm font-bold">
                Hashtags
                <input value={shareHashtags} onChange={(e) => setShareHashtags(e.target.value)} className="mt-2 block w-full rounded-xl border border-slate-300 bg-white p-3 font-normal dark:border-slate-700 dark:bg-slate-950" />
              </label>
              <label className="text-sm font-bold">
                Call to action
                <input value={shareCta} onChange={(e) => setShareCta(e.target.value)} placeholder="Try it today!" className="mt-2 block w-full rounded-xl border border-slate-300 bg-white p-3 font-normal dark:border-slate-700 dark:bg-slate-950" />
              </label>
              <label className="text-sm font-bold sm:col-span-2">
                Content source
                <select value={shareSource} onChange={(e) => setShareSource(e.target.value as typeof shareSource)} className="mt-2 block w-full rounded-xl border border-slate-300 bg-white p-3 font-normal dark:border-slate-700 dark:bg-slate-950">
                  <option value="preview">Converted preview</option>
                  <option value="original">Original text</option>
                  <option value="custom">Custom message only</option>
                </select>
              </label>
            </div>

            <div className="mt-5 rounded-xl bg-slate-100 p-4 dark:bg-slate-800">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-black">Live caption preview</h3>
                <span className="text-xs text-slate-500">{getCounts(getShareCaption()).characters} characters</span>
              </div>
              <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap break-words font-sans text-sm leading-6">
                {getShareCaption()}
              </pre>
              <div className="mt-3 flex flex-wrap gap-2">
                <button onClick={() => void copyText(getShareCaption(), "Caption")} className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white">
                  Copy caption
                </button>
                <button onClick={() => speak(getShareCaption())} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold dark:border-slate-700">
                  🔊 Speak caption
                </button>
              </div>
            </div>

            <h3 className="mb-3 mt-5 font-black">Choose a sharing platform</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {PLATFORM_LIST.map((platform) => (
                <button key={platform} onClick={() => void share(platform)} className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm font-bold hover:border-indigo-400 hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-indigo-950">
                  {platform === "WhatsApp" ? "🟢 " : platform === "X" ? "𝕏 " : platform === "Instagram" ? "📸 " : platform === "Facebook" ? "🔵 " : platform === "LinkedIn" ? "💼 " : "✉️ "}
                  {platform} ↗
                </button>
              ))}
            </div>
            <p className="mt-4 text-xs leading-5 text-slate-500">
              Instagram sharing is assisted by copying the caption and opening Instagram. Other platforms may share only a URL or title. Final publishing always requires your own action.
            </p>
          </section>
        )}

        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black">Text analytics & keyword frequency</h2>
              <p className="mt-1 text-sm text-slate-500">A quick overview of repeated words in your original text.</p>
            </div>
            <button onClick={() => download(JSON.stringify({ counts, keywordFrequency }, null, 2), "text-analytics.json", "application/json")} className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-bold dark:border-slate-700">
              Export analytics JSON
            </button>
          </div>
          {keywordFrequency.length ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {keywordFrequency.map(([word, frequency]) => (
                <span key={word} className="rounded-full bg-indigo-50 px-3 py-2 text-sm dark:bg-indigo-950">
                  {word} <strong className="ml-1">{frequency}</strong>
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">Enter text to view keyword frequency.</p>
          )}
        </section>

        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black">Conversion history</h2>
              <p className="mt-1 text-sm text-slate-500">Up to 30 applied conversions stored in this browser.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={exportHistory} disabled={!history.length} className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-bold disabled:opacity-40 dark:border-slate-700">Export CSV</button>
              <button onClick={() => { setHistory([]); notify("History cleared."); }} disabled={!history.length} className="rounded-xl border border-rose-200 px-3 py-2 text-sm font-bold text-rose-600 disabled:opacity-40 dark:border-rose-900">Clear history</button>
            </div>
          </div>
          {!history.length ? (
            <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-500 dark:bg-slate-800">Your applied conversions will appear here.</p>
          ) : (
            <div className="mt-4 space-y-2">
              {history.map((item) => (
                <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold">{MODES.find((m) => m.id === item.mode)?.label ?? item.mode}</p>
                    <p className="mt-1 break-words text-sm text-slate-600 dark:text-slate-400">{item.text.slice(0, 160)}{item.text.length > 160 ? "…" : ""}</p>
                    <p className="mt-1 text-xs text-slate-500">{item.time}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { rememberCurrent(); setText(item.text); setMode(item.mode); notify("History restored."); }} className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-bold text-white">Restore</button>
                    <button onClick={() => void copyText(item.text, "History text")} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold dark:border-slate-700">Copy</button>
                    <button onClick={() => setHistory((items) => items.filter((entry) => entry.id !== item.id))} className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-bold text-rose-600 dark:border-rose-900">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-black">SEO informational content & user guide</h2>
            <button onClick={() => setShowGuide((v) => !v)} className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-bold dark:border-slate-700">
              {showGuide ? "Hide guide" : "Show guide"}
            </button>
          </div>
          {showGuide && (
            <div className="mt-4 space-y-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">What is an online case converter?</h3>
              <p>
                An online case converter helps you change how letters are capitalized without manually rewriting your text. Standard formats include uppercase, lowercase, sentence case, and title case. Developer formats include camelCase, PascalCase, snake_case, kebab-case and dot.case.
              </p>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Why use a case converter?</h3>
              <p>
                Writers can format headings, bloggers can create readable URL slugs, students can tidy notes, and developers can prepare identifier names. Text cleanup tools can also trim whitespace, sort lines, remove duplicate lines, and normalize spacing.
              </p>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">How to use Textlyzer PRO</h3>
              <ol className="list-decimal space-y-2 pl-5">
                {guide.map(([title, description]) => (
                  <li key={title}><strong>{title}:</strong> {description}</li>
                ))}
              </ol>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Text privacy and browser compatibility</h3>
              <p>
                Text transformations run in the browser in this implementation. Voice recognition and speech playback depend on browser support, installed voices, language settings and microphone permission. Sharing opens the relevant platform and does not automatically publish content.
              </p>
            </div>
          )}
        </section>

        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-black">Frequently asked questions</h2>
            <button onClick={() => setShowFaq((v) => !v)} className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-bold dark:border-slate-700">
              {showFaq ? "Hide FAQs" : "Show FAQs"}
            </button>
          </div>
          {showFaq && (
            <div className="mt-4 space-y-3">
              {FAQS.map((faq) => (
                <details key={faq.q} className="group rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                  <summary className="cursor-pointer list-none pr-6 font-bold">
                    <span className="flex items-center justify-between gap-3">
                      {faq.q}
                      <span className="text-indigo-600 group-open:rotate-45">＋</span>
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{faq.a}</p>
                </details>
              ))}
            </div>
          )}
        </section>

        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black">Structured data / Schema details</h2>
              <p className="mt-1 text-sm text-slate-500">Inspect the JSON-LD generated for this page.</p>
            </div>
            <button onClick={() => setShowSchema((v) => !v)} className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-bold dark:border-slate-700">
              {showSchema ? "Hide schema" : "Show schema"}
            </button>
          </div>
          {showSchema && (
            <div className="mt-4">
              <div className="mb-3 flex flex-wrap gap-2">
                {["WebApplication", "WebPage", "SoftwareApplication", "FAQPage"].map((type) => (
                  <span key={type} className="rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200">{type}</span>
                ))}
              </div>
              <pre className="max-h-96 overflow-auto whitespace-pre-wrap break-words rounded-xl bg-slate-950 p-4 text-xs leading-6 text-emerald-200">
                {JSON.stringify(schema, null, 2)}
              </pre>
              <div className="mt-3 flex flex-wrap gap-2">
                <button onClick={() => void copyText(JSON.stringify(schema, null, 2), "JSON-LD schema")} className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white">Copy JSON-LD</button>
                <button onClick={() => download(JSON.stringify(schema, null, 2), "textlyzer-schema.json", "application/ld+json")} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold dark:border-slate-700">Download schema</button>
              </div>
              <p className="mt-3 text-xs leading-5 text-slate-500">
                Schema markup must accurately represent visible page content. Correct JSON-LD does not guarantee a Google rich result. Set final title, canonical URL and description in the server-side metadata for your deployed route.
              </p>
            </div>
          )}
        </section>

        <footer className="mt-8 border-t border-slate-200 py-6 text-center text-xs leading-6 text-slate-500 dark:border-slate-800">
          <p className="font-bold">Textlyzer PRO — Case Converter, Voice Tools & Social Share Studio</p>
          <p>Free browser-based text formatting utilities.</p>
        </footer>
      </div>
    </main>
  );
}
