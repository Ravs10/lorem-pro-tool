
"use client";

import { useState, useEffect, useRef, useMemo } from "react";

type Tab =
  | "count"
  | "clean"
  | "seo"
  | "goals"
  | "analyze"
  | "tools"
  | "diff";

function countEmoji(str: string): number {
  let count = 0;

  for (let i = 0; i < str.length; ) {
    const cp = str.codePointAt(i) || 0;

    if (
      (cp >= 0x1f600 && cp <= 0x1f64f) ||
      (cp >= 0x1f300 && cp <= 0x1f5ff) ||
      (cp >= 0x1f680 && cp <= 0x1f6ff) ||
      (cp >= 0x2600 && cp <= 0x27bf) ||
      (cp >= 0x1f900 && cp <= 0x1f9ff) ||
      (cp >= 0x1f1e0 && cp <= 0x1f1ff) ||
      (cp >= 0x1fa70 && cp <= 0x1faff)
    ) {
      count++;
    }

    i += cp > 0xffff ? 2 : 1;
  }

  return count;
}

function removeEmojiSafe(str: string): string {
  let output = "";

  for (let i = 0; i < str.length; ) {
    const cp = str.codePointAt(i) || 0;

    const isEmoji =
      (cp >= 0x1f600 && cp <= 0x1f64f) ||
      (cp >= 0x1f300 && cp <= 0x1f5ff) ||
      (cp >= 0x1f680 && cp <= 0x1f6ff) ||
      (cp >= 0x2600 && cp <= 0x27bf) ||
      (cp >= 0x1f900 && cp <= 0x1f9ff) ||
      (cp >= 0x1f1e0 && cp <= 0x1f1ff) ||
      (cp >= 0x1fa70 && cp <= 0x1faff);

    if (!isEmoji) {
      output += String.fromCodePoint(cp);
    }

    i += cp > 0xffff ? 2 : 1;
  }

  return output;
}

function encodeBase64UTF8(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = "";

  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }

  return btoa(binary);
}

function decodeBase64UTF8(value: string): string {
  const binary = atob(value.trim());
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}

function countSyllables(word: string): number {
  let w = word.toLowerCase();

  if (w.length <= 3) return 1;

  w = w
    .replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "")
    .replace(/^y/, "");

  const matches = w.match(/[aeiouy]{1,2}/g);

  return matches ? matches.length : 1;
}

function createSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\u0900-\u097f]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function Page() {
  const [text, setText] = useState("");
  const [tab, setTab] = useState<Tab>("count");
  const [dark, setDark] = useState(true);
  const [goal, setGoal] = useState(1000);
  const [find, setFind] = useState("");
  const [replace, setReplace] = useState("");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [slug, setSlug] = useState("");
  const [diffB, setDiffB] = useState("");
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [dailyWords, setDailyWords] = useState(0);

  const taRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  // Load saved data and theme.
  useEffect(() => {
    try {
      const savedText = localStorage.getItem("adv_text");
      if (savedText !== null) setText(savedText);

      const savedGoal = localStorage.getItem("adv_goal");
      if (savedGoal !== null) {
        const parsed = Number.parseInt(savedGoal, 10);
        if (Number.isFinite(parsed) && parsed >= 0) {
          setGoal(parsed);
        }
      }

      const savedTheme = localStorage.getItem("theme");
      if (savedTheme === "light") setDark(false);
      if (savedTheme === "dark") setDark(true);

      const savedDailyWords = localStorage.getItem("daily_words");
      if (savedDailyWords !== null) {
        const parsed = Number.parseInt(savedDailyWords, 10);
        if (Number.isFinite(parsed) && parsed >= 0) {
          setDailyWords(parsed);
        }
      }
    } catch {
      // App remains usable when localStorage is unavailable.
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("adv_text", text);
    } catch {
      // Storage may be disabled or full.
    }
  }, [text]);

  useEffect(() => {
    try {
      localStorage.setItem("adv_goal", String(goal));
    } catch {
      // Keep the app usable without persistent storage.
    }
  }, [goal]);

  useEffect(() => {
    return () => {
      try {
        recognitionRef.current?.stop();
        window.speechSynthesis?.cancel();
      } catch {
        // Ignore cleanup errors.
      }
    };
  }, []);

  const stats = useMemo(() => {
    const chars = text.length;
    const charsNoSpace = text.replace(/\s/g, "").length;

    const words = text.trim()
      ? text.trim().split(/\s+/).filter(Boolean).length
      : 0;

    const sentenceCount =
      text.split(/[.!?]+/).filter((sentence) => sentence.trim()).length;

    const sentences = words > 0 ? Math.max(1, sentenceCount) : 0;

    const paras = text.split(/\n+/).filter((line) => line.trim()).length;
    const lines = text.length ? text.split("\n").length : 0;
    const letters = (text.match(/[a-zA-Z\u0900-\u097f]/g) || []).length;
    const numbers = (text.match(/[0-9]/g) || []).length;
    const spaces = (text.match(/ /g) || []).length;
    const emoji = countEmoji(text);

    let syllables = 0;

    text
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .forEach((word) => {
        syllables += countSyllables(word);
      });

    const flesch =
      words > 0
        ? 206.835 -
          1.015 * (words / Math.max(sentences, 1)) -
          84.6 * (syllables / words)
        : 0;

    const reading = words > 0 ? Math.ceil(words / 225) : 0;
    const speakingM = words > 0 ? Math.ceil(words / 150) : 0;

    const stopWords = new Set([
      "the", "and", "is", "in", "to", "a", "of", "for",
      "on", "with", "this", "that", "are", "be", "it",
      "as", "at", "by", "from", "hai", "aur", "ke", "ka",
      "ko", "mein", "hain", "ki", "se",
    ]);

    const freq: Record<string, number> = {};

    // Include Hindi and English letters when calculating keyword frequency.
    text
      .toLowerCase()
      .split(/[^a-z0-9\u0900-\u097f]+/)
      .filter((word) => word.length > 2 && !stopWords.has(word))
      .forEach((word) => {
        freq[word] = (freq[word] || 0) + 1;
      });

    const top = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12);

    const maxFreq = top[0]?.[1] || 1;

    const lang = /[\u0900-\u097f]/.test(text)
      ? /[a-zA-Z]/.test(text)
        ? "Hinglish"
        : "Hindi"
      : "English";

    return {
      chars,
      charsNoSpace,
      words,
      sentences,
      paras,
      lines,
      letters,
      numbers,
      spaces,
      emoji,
      flesch,
      reading,
      speakingM,
      syllables,
      top,
      maxFreq,
      lang,
    };
  }, [text]);

  const seoScore = useMemo(() => {
    let score = 0;

    if (title.length >= 50 && title.length <= 60) score += 35;
    else if (title.length > 0) score += 15;

    if (desc.length >= 150 && desc.length <= 160) score += 35;
    else if (desc.length > 0) score += 15;

    if (stats.words > 300) score += 15;
    if (stats.top.length > 5) score += 15;

    return Math.min(100, score);
  }, [title, desc, stats]);

  // Apply a text transformation without normalizing whitespace.
  const transformText = (transform: (value: string) => string) => {
    setText((current) => transform(current));
  };

  // Insert Markdown formatting at the actual textarea selection.
  const insertAtCursor = (before: string, after = "") => {
    const ta = taRef.current;
    if (!ta) return;

    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = text.substring(start, end);

    const newText =
      text.substring(0, start) +
      before +
      selected +
      after +
      text.substring(end);

    setText(newText);

    requestAnimationFrame(() => {
      ta.focus();
      const selectionStart = start + before.length;
      ta.setSelectionRange(
        selectionStart,
        selectionStart + selected.length
      );
    });
  };

  // Link helper: creates a complete Markdown link.
  const insertLink = () => {
    const ta = taRef.current;
    if (!ta) return;

    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selectedText = text.substring(start, end);

    const enteredUrl = window.prompt(
      "Enter the link URL (https://...)"
    );

    if (enteredUrl === null) return;

    const url = enteredUrl.trim();

    if (!/^https?:\/\/\S+$/i.test(url)) {
      window.alert(
        "Please enter a valid URL starting with https:// or http://"
      );
      ta.focus();
      return;
    }

    let linkText = selectedText;

    if (!linkText) {
      const enteredText = window.prompt("Enter the link text");
      if (enteredText === null) return;

      linkText = enteredText || url;
    }

    const markdownLink = `[${linkText}](${url})`;

    const updatedText =
      text.substring(0, start) +
      markdownLink +
      text.substring(end);

    setText(updatedText);

    requestAnimationFrame(() => {
      ta.focus();

      const cursorPosition = start + markdownLink.length;
      ta.setSelectionRange(cursorPosition, cursorPosition);
    });
  };

  // Voice typing.
  const toggleVoice = () => {
    if (listening) {
      try {
        recognitionRef.current?.stop();
      } catch {
        // Recognition may already have stopped.
      }

      setListening(false);
      return;
    }

    const SpeechRecognitionClass =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      window.alert(
        "Voice typing is not supported in this browser. Try Chrome."
      );
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.lang = "hi-IN";
      recognition.interimResults = false;
      recognition.continuous = false;

      recognition.onstart = () => setListening(true);
      recognition.onend = () => setListening(false);
      recognition.onerror = () => setListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript;

        if (transcript) {
          setText((current) =>
            current + (current && !/\s$/.test(current) ? " " : "") + transcript
          );
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setListening(false);
      window.alert("Unable to start voice typing. Please try again.");
    }
  };

  // Text to speech.
  const toggleSpeak = () => {
    if (!("speechSynthesis" in window)) {
      window.alert("Text to speech is not supported in this browser.");
      return;
    }

    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    if (!text.trim()) {
      window.alert("Please enter some text first.");
      return;
    }

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = /[\u0900-\u097f]/.test(text)
        ? "hi-IN"
        : "en-US";

      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);

      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    } catch {
      setSpeaking(false);
      window.alert("Unable to read this text aloud.");
    }
  };

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(text);
      window.alert("Text copied successfully.");
    } catch {
      const ta = taRef.current;

      if (ta) {
        ta.focus();
        ta.select();

        const copied = document.execCommand("copy");

        if (copied) {
          window.alert("Text copied successfully.");
          return;
        }
      }

      window.alert("Copy failed. Please select and copy the text manually.");
    }
  };

  const importText = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        setText(reader.result);
      }
    };

    reader.onerror = () => {
      window.alert("Unable to read the selected file.");
    };

    reader.readAsText(file);
    event.target.value = "";
  };

  const exportText = (format: "txt" | "json") => {
    const content =
      format === "json"
        ? JSON.stringify(
            {
              text,
              statistics: stats,
              exportedAt: new Date().toISOString(),
            },
            null,
            2
          )
        : text;

    const blob = new Blob([content], {
      type: format === "json" ? "application/json" : "text/plain",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `textlyzer-export.${format}`;
    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "count", label: "COUNT" },
    { id: "clean", label: "CLEAN" },
    { id: "seo", label: "SEO" },
    { id: "goals", label: "GOALS" },
    { id: "analyze", label: "ANALYZE" },
    { id: "tools", label: "TOOLS" },
    { id: "diff", label: "DIFF" },
  ];

  const panelClass = `rounded-[20px] border p-4 ${
    dark
      ? "bg-[#161826]/70 border-white/10"
      : "bg-white border-black/10"
  }`;

  const inputClass = `w-full px-3 py-2.5 rounded-[12px] border text-sm outline-none ${
    dark
      ? "bg-[#1e2138] border-white/10 text-white placeholder:text-white/40"
      : "bg-white border-black/10 text-[#151a2d]"
  }`;

  const buttonClass = `rounded-[12px] border text-xs transition-colors ${
    dark
      ? "bg-[#1e2138] border-white/10 text-white hover:bg-[#2a2d4a]"
      : "bg-white border-black/10 text-black hover:bg-black/5"
  }`;

  const changeTheme = () => {
    setDark((current) => {
      const next = !current;

      try {
        localStorage.setItem("theme", next ? "dark" : "light");
      } catch {
        // Theme still changes for this session.
      }

      return next;
    });
  };

  return (
    <div className={dark ? "dark" : ""}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&display=swap');
        * { font-family: 'Outfit', sans-serif; }
        .glass { backdrop-filter: blur(16px); }
      `}</style>

      <div
        className={`min-h-screen ${
          dark
            ? "bg-[#0e0f1a] text-white"
            : "bg-[#f7f8ff] text-[#151a2d]"
        }`}
      >
        <header
          className={`sticky top-0 z-50 w-full border-b backdrop-blur-xl ${
            dark
              ? "bg-[#12131f]/95 border-white/10"
              : "bg-white/95 border-black/10"
          }`}
        >
          <div className="max-w-[1280px] mx-auto flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#5b5bff] to-[#8b5cf6] flex items-center justify-center font-bold text-white">
                T
              </div>

              <span className="font-bold text-[19px]">
                Text<span className="text-[#5b5bff]">lyzer</span>{" "}
                <span className="opacity-60 text-[13px]">PRO</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={changeTheme}
                aria-label="Toggle light and dark theme"
                title="Toggle theme"
                className={`w-10 h-10 rounded-full border flex items-center justify-center ${
                  dark
                    ? "bg-[#1e2138] border-white/20"
                    : "bg-white border-black/10"
                }`}
              >
                {dark ? "☀️" : "🌙"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setText(
                    "Welcome to Textlyzer PRO!\n\nThis is a sample paragraph for testing your character counter, word count, reading time, SEO analysis, and text tools.\n\nनमस्ते! यह हिंदी टेक्स्ट का एक उदाहरण है। 😊"
                  );
                  setTab("count");
                }}
                className="px-3 py-2 rounded-full bg-[#5b5bff] text-white text-xs font-bold"
              >
                Sample
              </button>
            </div>
          </div>

          <div className="max-w-[1280px] mx-auto px-3 pb-3">
            <div className="flex flex-wrap gap-2">
              {tabs.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  className={`px-5 py-2.5 rounded-full text-[12px] font-bold tracking-wider border transition-all ${
                    tab === item.id
                      ? "bg-[#5b5bff] text-white border-[#5b5bff] shadow-[0_4px_15px_rgba(91,91,255,0.4)]"
                      : dark
                        ? "bg-[#1e2138] text-white/90 border-white/15 hover:bg-[#2a2d4a]"
                        : "bg-white text-black border-black/10 hover:bg-black/5"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </header>

        <main className="max-w-[1280px] mx-auto grid lg:grid-cols-[1.15fr_380px] gap-4 p-4">
          {/* EDITOR AND TOOLBAR */}
          <section
            className={`rounded-[20px] border p-3 md:p-4 ${
              dark
                ? "bg-[#161826]/70 border-white/10"
                : "bg-white border-black/10"
            } shadow-xl`}
          >
            <div
              className={`flex flex-wrap items-center gap-1.5 p-2 rounded-[12px] mb-3 border ${
                dark
                  ? "bg-[#0e0f1a] border-white/10"
                  : "bg-[#f7f8ff] border-black/5"
              }`}
            >
              <span className="text-[10px] opacity-50 font-bold px-1">
                FORMAT:
              </span>

              <button
                type="button"
                onClick={() => insertAtCursor("**", "**")}
                className={`${buttonClass} px-3 py-1.5 font-bold`}
              >
                B Bold
              </button>

              <button
                type="button"
                onClick={() => insertAtCursor("*", "*")}
                className={`${buttonClass} px-3 py-1.5 italic`}
              >
                I Italic
              </button>

              <button
                type="button"
                onClick={() => insertAtCursor("\n# ", "")}
                className={`${buttonClass} px-3 py-1.5`}
              >
                H1
              </button>

              <button
                type="button"
                onClick={() => insertAtCursor("\n- ", "")}
                className={`${buttonClass} px-3 py-1.5`}
              >
                • List
              </button>

              <button
                type="button"
                onClick={() => insertAtCursor("\n> ", "")}
                className={`${buttonClass} px-3 py-1.5`}
              >
                ❝ Quote
              </button>

              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={insertLink}
                className={`${buttonClass} px-3 py-1.5`}
              >
                🔗 Link
              </button>

              <div className="w-px h-5 bg-white/10 mx-1" />

              <button
                type="button"
                onClick={toggleVoice}
                className={`px-3 py-1.5 rounded-full border text-xs font-bold ${
                  listening
                    ? "bg-red-500 text-white animate-pulse"
                    : "bg-[#5b5bff] text-white"
                }`}
              >
                {listening ? "● Listening" : "🎙️ Voice"}
              </button>

              <button
                type="button"
                onClick={toggleSpeak}
                className={`px-3 py-1.5 rounded-full border text-xs font-bold ${
                  speaking
                    ? "bg-red-500 text-white"
                    : "bg-emerald-600 text-white"
                }`}
              >
                {speaking ? "■ Stop" : "🔊 Speak"}
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              <button
                type="button"
                onClick={copyText}
                className={`${buttonClass} px-4 py-2 font-semibold`}
              >
                📋 Copy
              </button>

              <button
                type="button"
                onClick={() => setText("")}
                className={`${buttonClass} px-4 py-2`}
              >
                🗑 Clear
              </button>

              {/* Case conversion changes case only, never whitespace. */}
              <button
                type="button"
                onClick={() =>
                  transformText((current) => current.toUpperCase())
                }
                className={`${buttonClass} px-3 py-2`}
              >
                UPPER
              </button>

              <button
                type="button"
                onClick={() =>
                  transformText((current) => current.toLowerCase())
                }
                className={`${buttonClass} px-3 py-2`}
              >
                lower
              </button>

              <button
                type="button"
                onClick={() =>
                  transformText((current) => removeEmojiSafe(current))
                }
                className={`${buttonClass} px-3 py-2`}
              >
                Remove Emoji
              </button>

              <label
                className={`${buttonClass} px-3 py-2 cursor-pointer`}
              >
                Import TXT
                <input
                  type="file"
                  accept=".txt,text/plain"
                  className="hidden"
                  onChange={importText}
                />
              </label>

              <button
                type="button"
                onClick={() => exportText("txt")}
                className={`${buttonClass} px-3 py-2`}
              >
                Export TXT
              </button>

              <button
                type="button"
                onClick={() => exportText("json")}
                className={`${buttonClass} px-3 py-2`}
              >
                Export JSON
              </button>
            </div>

            {tab === "diff" ? (
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs opacity-60 mb-1 block">
                    Original
                  </label>
                  <textarea
                    ref={taRef}
                    value={text}
                    onChange={(event) => setText(event.target.value)}
                    placeholder="Original Text"
                    className={`w-full min-h-[380px] p-4 rounded-[16px] border outline-none text-[15px] leading-7 ${
                      dark
                        ? "bg-[#1e2138] border-white/10 text-white placeholder:text-white/40"
                        : "bg-white border-black/10"
                    }`}
                  />
                </div>

                <div>
                  <label className="text-xs opacity-60 mb-1 block">
                    Modified
                  </label>
                  <textarea
                    value={diffB}
                    onChange={(event) => setDiffB(event.target.value)}
                    placeholder="Modified Text"
                    className={`w-full min-h-[380px] p-4 rounded-[16px] border outline-none text-[15px] leading-7 ${
                      dark
                        ? "bg-[#1e2138] border-white/10 text-white placeholder:text-white/40"
                        : "bg-white border-black/10"
                    }`}
                  />
                </div>
              </div>
            ) : (
              <textarea
                ref={taRef}
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder="Type or paste here... Hindi, English, Hinglish, Emoji — use the toolbar and text tools."
                className={`w-full min-h-[380px] p-4 rounded-[16px] border outline-none text-[16px] leading-7 resize-y ${
                  dark
                    ? "bg-[#1e2138] border-white/10 text-white placeholder:text-white/40"
                    : "bg-white border-black/10"
                }`}
              />
            )}

            <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-4">
              {[
                ["Chars", stats.chars],
                ["Words", stats.words],
                ["No Space", stats.charsNoSpace],
                ["Sentences", stats.sentences],
                ["Paras", stats.paras],
                ["Lines", stats.lines],
                ["Letters", stats.letters],
                ["Numbers", stats.numbers],
                ["Spaces", stats.spaces],
                ["Emoji", stats.emoji],
                ["Reading", `${stats.reading}m`],
                ["Speaking", `${stats.speakingM}m`],
                ["Flesch", Math.round(stats.flesch)],
                ["Lang", stats.lang],
                ["Syllables", stats.syllables],
                ["Size", `${(stats.chars / 1024).toFixed(2)}KB`],
              ].map(([label, value]) => (
                <div
                  key={String(label)}
                  className={`rounded-[12px] border p-2.5 text-center ${
                    dark
                      ? "bg-[#1e2138] border-white/10"
                      : "bg-[#f7f8ff] border-black/5"
                  }`}
                >
                  <div className="font-bold text-[15px]">
                    {String(value)}
                  </div>
                  <div className="text-[10px] uppercase tracking-widest opacity-60">
                    {String(label)}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* RIGHT PANEL */}
          <aside className="space-y-4">
            {tab === "count" && (
              <section className={panelClass}>
                <h4 className="text-xs uppercase tracking-widest opacity-60 mb-2">
                  Social Limits
                </h4>

                {[
                  ["Twitter / X", 280],
                  ["Instagram", 2200],
                  ["LinkedIn", 3000],
                  ["Facebook", 63206],
                  ["YouTube Title", 100],
                  ["Google Title", 60],
                ].map(([name, limit]) => {
                  const over = stats.chars > Number(limit);

                  return (
                    <div
                      key={String(name)}
                      className={`flex justify-between text-[13px] py-2 border-b border-dashed ${
                        over ? "text-red-400" : "text-emerald-400"
                      }`}
                    >
                      <span>{String(name)}</span>
                      <span>
                        {stats.chars}/{String(limit)}
                      </span>
                    </div>
                  );
                })}
              </section>
            )}

            {tab === "seo" && (
              <section className={`${panelClass} space-y-3`}>
                <h4 className="font-bold">
                  SEO Studio • Score {seoScore}/100
                </h4>

                <div className="h-2 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#5b5bff] to-emerald-400"
                    style={{ width: `${seoScore}%` }}
                  />
                </div>

                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="SEO Title (50–60 chars ideal)"
                  className={inputClass}
                />

                <div className="text-xs opacity-60">
                  {title.length}/60{" "}
                  {title.length >= 50 && title.length <= 60
                    ? "✅ Perfect"
                    : "⚠️"}
                </div>

                <input
                  value={desc}
                  onChange={(event) => setDesc(event.target.value)}
                  placeholder="Meta Description (150–160)"
                  className={inputClass}
                />

                <div className="text-xs opacity-60">
                  {desc.length}/160{" "}
                  {desc.length >= 150 && desc.length <= 160 ? "✅" : "⚠️"}
                </div>

                <input
                  value={slug}
                  onChange={(event) => setSlug(event.target.value)}
                  placeholder="slug-will-be-here"
                  className={inputClass}
                />

                <button
                  type="button"
                  onClick={() => setSlug(createSlug(title))}
                  className="w-full py-2.5 rounded-full bg-[#5b5bff] text-white text-xs font-bold"
                >
                  Generate Slug from Title
                </button>

                <div className="rounded-[12px] border p-3 bg-white text-black">
                  <div className="text-[13px] text-[#1a0dab] truncate">
                    {title || "Your Title Preview - Google SERP"}
                  </div>

                  <div className="text-[11px] text-[#006621]">
                    https://textlyzer.app/{slug || "character-counter"} •{" "}
                    {stats.words} words
                  </div>

                  <div className="text-[12px] text-[#545454]">
                    {desc ||
                      "Your meta description preview will appear here. Keep it 150–160 characters as a general guideline."}
                  </div>
                </div>
              </section>
            )}

            {tab === "goals" && (
              <section className={`${panelClass} space-y-4`}>
                <h4 className="font-bold">🎯 Writing Goals</h4>

                <div>
                  <label className="text-xs opacity-60">
                    Daily Word Goal
                  </label>

                  <div className="flex gap-2 mt-1">
                    <input
                      type="number"
                      min="0"
                      value={goal}
                      onChange={(event) =>
                        setGoal(Math.max(0, Number(event.target.value) || 0))
                      }
                      className={`flex-1 min-w-0 px-3 py-2.5 rounded-[12px] border text-sm ${
                        dark
                          ? "bg-[#1e2138] border-white/10 text-white"
                          : "bg-white border-black/10"
                      }`}
                    />

                    <button
                      type="button"
                      onClick={() => {
                        try {
                          localStorage.setItem("adv_goal", String(goal));
                          setDailyWords(stats.words);
                          localStorage.setItem(
                            "daily_words",
                            String(stats.words)
                          );
                        } catch {
                          // Goal still updates in the current session.
                        }
                      }}
                      className="px-4 py-2 rounded-full bg-[#5b5bff] text-white text-xs font-bold"
                    >
                      Set
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>
                      {stats.words} / {goal} words
                    </span>
                    <span>
                      {goal > 0
                        ? Math.min(
                            100,
                            Math.round((stats.words / goal) * 100)
                          )
                        : 0}
                      %
                    </span>
                  </div>

                  <div className="h-3 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#5b5bff] to-[#06b6d4] transition-all duration-500"
                      style={{
                        width: `${
                          goal > 0
                            ? Math.min(
                                100,
                                Math.round((stats.words / goal) * 100)
                              )
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div
                  className={`p-3 rounded-[12px] ${
                    dark ? "bg-[#1e2138]" : "bg-[#f7f8ff]"
                  }`}
                >
                  <div className="text-xs">
                    🔥 Current text: <b>{stats.words} words</b>
                  </div>

                  <div className="text-xs mt-1">
                    ⏱️ Estimated time to goal:{" "}
                    <b>
                      {Math.max(0, Math.ceil((goal - stats.words) / 200))} mins
                    </b>{" "}
                    at 200 wpm
                  </div>

                  <div className="text-xs mt-1">
                    {goal > 0 && stats.words >= goal
                      ? "🎉 Goal Achieved!"
                      : "💪 Keep typing..."}
                  </div>

                  <div className="text-xs mt-1">
                    Saved goal-session count: {dailyWords} words
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setDailyWords(0);
                    try {
                      localStorage.removeItem("daily_words");
                    } catch {
                      // Ignore storage errors.
                    }
                  }}
                  className={`w-full py-2 rounded-full border text-xs ${
                    dark
                      ? "bg-[#1e2138] border-white/10 text-white"
                      : "bg-white border-black/10"
                  }`}
                >
                  Reset Daily
                </button>
              </section>
            )}

            {tab === "diff" && (
              <section className={panelClass}>
                <h4 className="font-bold">Diff Checker</h4>

                <div className="mt-3 space-y-2 text-xs">
                  <div
                    className={`p-3 rounded-[12px] ${
                      dark ? "bg-[#1e2138]" : "bg-[#f7f8ff]"
                    }`}
                  >
                    Chars A: {text.length} | Chars B: {diffB.length} | Diff:{" "}
                    {Math.abs(text.length - diffB.length)}
                  </div>

                  <div
                    className={`p-3 rounded-[12px] ${
                      text === diffB
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {text === diffB
                      ? "✅ Both texts are identical"
                      : "⚠️ Texts are different"}
                  </div>

                  <div className="max-h-[200px] overflow-auto p-2 rounded-[10px] bg-black/5 dark:bg-white/5 text-[11px] leading-6 whitespace-pre-wrap break-words">
                    {text.split(/(\s+)/).map((word, index) => {
                      const other = diffB.split(/(\s+)/)[index];

                      return word !== other ? (
                        <span
                          key={index}
                          className="bg-red-500/30 px-1 rounded mx-0.5"
                        >
                          {word}
                        </span>
                      ) : (
                        <span key={index} className="mx-0.5">
                          {word}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </section>
            )}

            {tab === "clean" && (
              <section className={`${panelClass} space-y-3`}>
                <h4 className="font-bold">Clean & Replace</h4>

                <input
                  value={find}
                  onChange={(event) => setFind(event.target.value)}
                  placeholder="Find..."
                  className={inputClass}
                />

                <input
                  value={replace}
                  onChange={(event) => setReplace(event.target.value)}
                  placeholder="Replace with..."
                  className={inputClass}
                />

                <button
                  type="button"
                  onClick={() => {
                    if (find) {
                      setText((current) =>
                        current.split(find).join(replace)
                      );
                    }
                  }}
                  className="w-full py-2.5 rounded-full bg-[#5b5bff] text-white font-bold text-sm"
                >
                  Replace All
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      transformText((current) =>
                        current.replace(/[ \t]+/g, " ")
                      )
                    }
                    className={`${buttonClass} py-2.5`}
                  >
                    Extra Spaces
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      transformText((current) =>
                        current
                          .split("\n")
                          .filter((line) => line.trim())
                          .join("\n")
                      )
                    }
                    className={`${buttonClass} py-2.5`}
                  >
                    Empty Lines
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      transformText((current) => {
                        const seen = new Set<string>();

                        return current
                          .split("\n")
                          .filter((line) => {
                            const key = line.trim().toLowerCase();

                            if (!key) return true;
                            if (seen.has(key)) return false;

                            seen.add(key);
                            return true;
                          })
                          .join("\n");
                      })
                    }
                    className={`${buttonClass} py-2.5`}
                  >
                    Duplicates
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      transformText((current) =>
                        current
                          .split("\n")
                          .map((line, index) => `${index + 1}. ${line}`)
                          .join("\n")
                      )
                    }
                    className={`${buttonClass} py-2.5`}
                  >
                    Add Numbers
                  </button>
                </div>
              </section>
            )}

            {tab === "analyze" && (
              <section className={panelClass}>
                <h4 className="font-bold">Keyword Density</h4>

                <div className="mt-3 space-y-1.5">
                  {stats.top.map(([word, count]) => (
                    <div
                      key={word}
                      className="flex items-center gap-2 text-xs"
                    >
                      <span className="w-16 truncate">{word}</span>

                      <div className="flex-1 h-2 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#5b5bff]"
                          style={{
                            width: `${(count / stats.maxFreq) * 100}%`,
                          }}
                        />
                      </div>

                      <span>{count}</span>
                    </div>
                  ))}
                </div>

                <div
                  className={`mt-4 p-3 rounded-[12px] text-xs ${
                    dark ? "bg-[#1e2138]" : "bg-[#f7f8ff]"
                  }`}
                >
                  Flesch: {Math.round(stats.flesch)} •{" "}
                  {stats.flesch > 80
                    ? "Very Easy"
                    : stats.flesch > 50
                      ? "Easy"
                      : "Hard"}{" "}
                  • Lang: {stats.lang}
                </div>
              </section>
            )}

            {tab === "tools" && (
              <section className={`${panelClass} grid grid-cols-2 gap-2`}>
                <button
                  type="button"
                  onClick={() =>
                    setText(
                      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. ".repeat(
                        20
                      )
                    )
                  }
                  className={`${buttonClass} py-3`}
                >
                  Lorem 100w
                </button>

                <button
                  type="button"
                  onClick={() => {
                    try {
                      setText(encodeBase64UTF8(text));
                    } catch {
                      window.alert(
                        "Base64 encoding failed. Please try again."
                      );
                    }
                  }}
                  className={`${buttonClass} py-3`}
                >
                  Base64 Encode
                </button>

                <button
                  type="button"
                  onClick={() => {
                    try {
                      setText(decodeBase64UTF8(text));
                    } catch {
                      window.alert(
                        "Invalid Base64 text or unsupported UTF-8 data."
                      );
                    }
                  }}
                  className={`${buttonClass} py-3`}
                >
                  Base64 Decode
                </button>

                <button
                  type="button"
                  onClick={() =>
                    transformText((current) => createSlug(current))
                  }
                  className={`${buttonClass} py-3`}
                >
                  Slugify
                </button>

                <button
                  type="button"
                  onClick={() =>
                    transformText((current) =>
                      Array.from(current).reverse().join("")
                    )
                  }
                  className={`${buttonClass} py-3`}
                >
                  Reverse
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const tags = text
                      .trim()
                      .split(/\s+/)
                      .filter(Boolean)
                      .map((word) => `#${word.replace(/^#+/, "")}`)
                      .join(" ");

                    setText(tags);
                  }}
                  className={`${buttonClass} py-3`}
                >
                  Hashtags
                </button>

                <button
                  type="button"
                  onClick={() =>
                    transformText((current) => current.toUpperCase())
                  }
                  className={`${buttonClass} py-3`}
                >
                  UPPERCASE
                </button>

                <button
                  type="button"
                  onClick={() =>
                    transformText((current) => current.toLowerCase())
                  }
                  className={`${buttonClass} py-3`}
                >
                  lowercase
                </button>

                <button
                  type="button"
                  onClick={() =>
                    transformText((current) => removeEmojiSafe(current))
                  }
                  className={`${buttonClass} py-3`}
                >
                  Remove Emoji
                </button>

                <button
                  type="button"
                  onClick={() =>
                    transformText((current) =>
                      current.replace(/[ \t]+/g, " ")
                    )
                  }
                  className={`${buttonClass} py-3`}
                >
                  Clean Spaces
                </button>

                <button
                  type="button"
                  onClick={() =>
                    transformText((current) =>
                      current
                        .split("\n")
                        .filter((line) => line.trim())
                        .join("\n")
                    )
                  }
                  className={`${buttonClass} py-3`}
                >
                  Remove Empty Lines
                </button>

                <button
                  type="button"
                  onClick={() =>
                    transformText((current) => {
                      const seen = new Set<string>();

                      return current
                        .split("\n")
                        .filter((line) => {
                          const key = line.trim().toLowerCase();

                          if (!key) return true;
                          if (seen.has(key)) return false;

                          seen.add(key);
                          return true;
                        })
                        .join("\n");
                    })
                  }
                  className={`${buttonClass} py-3`}
                >
                  Remove Duplicates
                </button>
              </section>
            )}
          </aside>
        </main>

        {/* OTHER USEFUL TOOLS */}
        <section className="max-w-[1280px] mx-auto px-4 pb-8">
          <h3 className="font-bold text-[18px] mb-3">
            Other Useful Tools
          </h3>

          <div className="grid md:grid-cols-3 gap-3">
            {[
              {
                title: "Word Counter",
                description:
                  "Count words, characters, and sentences with Hindi support.",
                icon: "📝",
              },
              {
                title: "SEO Analyzer",
                description:
                  "Check title length, description length, and keyword frequency.",
                icon: "🔍",
              },
              {
                title: "Diff Checker",
                description:
                  "Compare two texts and review differences.",
                icon: "🔀",
              },
              {
                title: "Voice to Text",
                description:
                  "Use speech recognition to enter text.",
                icon: "🎙️",
              },
              {
                title: "Text to Speech",
                description:
                  "Listen to your text with one click.",
                icon: "🔊",
              },
              {
                title: "Slug Generator",
                description:
                  "Convert a title into an SEO-friendly URL slug.",
                icon: "🔗",
              },
            ].map((item) => (
              <div
                key={item.title}
                className={`rounded-[16px] border p-4 flex gap-3 ${
                  dark
                    ? "bg-[#161826]/60 border-white/10"
                    : "bg-white border-black/5"
                }`}
              >
                <div className="text-[24px]">{item.icon}</div>

                <div>
                  <div className="font-bold text-sm">{item.title}</div>
                  <div className="text-xs opacity-60 mt-1">
                    {item.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* GUIDE AND FAQ */}
        <section
          className={`max-w-[900px] mx-auto px-5 py-8 rounded-[24px] border mb-8 ${
            dark
              ? "bg-[#161826]/60 border-white/10"
              : "bg-white border-black/5"
          }`}
        >
          <h2 className="text-[22px] font-bold">
            Complete Guide & FAQ
          </h2>

          <div className="mt-4 space-y-6 text-[13px] leading-7 opacity-80">
            <div>
              <b>1. Word Count Logic:</b> Words are counted by separating
              non-empty whitespace-delimited parts. Character counts include
              spaces, while the no-space count excludes whitespace. Sentences
              use common English punctuation as an estimate. Paragraphs are
              counted using non-empty lines.
            </div>

            <div>
              <b>2. Formatting Toolbar:</b> Bold and Italic insert Markdown
              markers. H1 inserts a heading marker, List inserts a list
              marker, Quote inserts a quote marker, and Link creates a
              complete Markdown link using the URL you provide. This is a
              plain-text editor, so Markdown is not automatically rendered
              as rich formatting.
            </div>

            <div>
              <b>3. Voice & Speak:</b> Voice typing uses the browser Speech
              Recognition API with Hindi as the initial language. Text to
              Speech uses the browser Speech Synthesis API. Browser and
              device support may vary.
            </div>

            <div>
              <b>4. SEO:</b> Enter a title, meta description, and slug to
              preview them. The SEO score is a basic indicator, not a
              guarantee of search ranking.
            </div>

            <div>
              <b>5. Goals:</b> Set a word target and monitor progress against
              the current editor text. The displayed remaining time is an
              estimate based on 200 words per minute.
            </div>

            <div>
              <b>6. Base64 Tools:</b> Encode and decode UTF-8 text, including
              Hindi and emoji. Decoding requires valid Base64 data containing
              valid UTF-8 text. Invalid data produces an error message instead
              of removing the Tools panel.
            </div>

            <div>
              <b>7. Privacy:</b> Your draft is stored in this browser's local
              storage for convenience. Avoid using this tool on shared
              devices for confidential text, and clear your draft when needed.
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <details
                className={`rounded-[12px] border p-3 ${
                  dark
                    ? "bg-[#1e2138] border-white/10"
                    : "bg-[#f7f8ff] border-black/5"
                }`}
                open
              >
                <summary className="font-bold cursor-pointer">
                  Why does Hindi text work with Base64?
                </summary>

                <p className="mt-2">
                  Text is first encoded as UTF-8 bytes, then those bytes are
                  converted to Base64. Decoding reverses the process. This
                  avoids the common Latin-1 limitation of directly passing
                  Hindi or emoji to btoa().
                </p>
              </details>

              <details
                className={`rounded-[12px] border p-3 ${
                  dark
                    ? "bg-[#1e2138] border-white/10"
                    : "bg-[#f7f8ff] border-black/5"
                }`}
              >
                <summary className="font-bold cursor-pointer">
                  Why can speech tools vary by browser?
                </summary>

                <p className="mt-2">
                  Speech recognition and speech synthesis depend on the
                  browser, device, available voices, permissions, and
                  language support. If a tool is unavailable, the rest of
                  the text editor remains usable.
                </p>
              </details>
            </div>
          </div>

          <p className="text-[11px] opacity-40 mt-8 text-center">
            © 2026 Textlyzer PRO • Character Counter • SEO • Clean • Tools
          </p>
        </section>
      </div>
    </div>
  );
}
