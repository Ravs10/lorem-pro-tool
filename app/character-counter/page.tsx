"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Tab =
  | "count"
  | "clean"
  | "seo"
  | "goals"
  | "analyze"
  | "tools"
  | "diff";

type FormatTag = "strong" | "em" | "h1" | "h2" | "ul" | "ol" | "blockquote";

function countEmoji(str: string): number {
  let c = 0;

  for (let i = 0; i < str.length; ) {
    const cp = str.codePointAt(i) || 0;

    if (
      (cp >= 0x1f300 && cp <= 0x1faff) ||
      (cp >= 0x2600 && cp <= 0x27bf) ||
      (cp >= 0x1f1e0 && cp <= 0x1f1ff)
    ) {
      c++;
    }

    i += cp > 0xffff ? 2 : 1;
  }

  return c;
}

function removeEmojiSafe(str: string): string {
  let out = "";

  for (let i = 0; i < str.length; ) {
    const cp = str.codePointAt(i) || 0;

    const isEmoji =
      (cp >= 0x1f300 && cp <= 0x1faff) ||
      (cp >= 0x2600 && cp <= 0x27bf) ||
      (cp >= 0x1f1e0 && cp <= 0x1f1ff);

    if (!isEmoji) {
      out += String.fromCodePoint(cp);
    }

    i += cp > 0xffff ? 2 : 1;
  }

  return out;
}

function countSyllables(word: string) {
  let w = word.toLowerCase();

  if (w.length <= 3) return 1;

  w = w
    .replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "")
    .replace(/^y/, "");

  const matches = w.match(/[aeiouy]{1,2}/g);

  return matches ? matches.length : 1;
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function plainTextFromHtml(html: string) {
  if (typeof window === "undefined") {
    return html.replace(/<[^>]*>/g, "");
  }

  const div = document.createElement("div");
  div.innerHTML = html;
  return div.innerText || div.textContent || "";
}

function htmlToMarkdown(html: string) {
  let value = html;

  value = value.replace(/<br\s*\/?>/gi, "\n");
  value = value.replace(
    /<h1[^>]*>(.*?)<\/h1>/gis,
    "# $1\n"
  );
  value = value.replace(
    /<h2[^>]*>(.*?)<\/h2>/gis,
    "## $1\n"
  );
  value = value.replace(
    /<(strong|b)[^>]*>(.*?)<\/\1>/gis,
    "**$2**"
  );
  value = value.replace(
    /<(em|i)[^>]*>(.*?)<\/\1>/gis,
    "*$2*"
  );
  value = value.replace(
    /<blockquote[^>]*>(.*?)<\/blockquote>/gis,
    "> $1\n"
  );
  value = value.replace(
    /<li[^>]*>(.*?)<\/li>/gis,
    "- $1\n"
  );

  value = value.replace(/<\/p>/gi, "\n");
  value = value.replace(/<[^>]+>/g, "");

  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .trim();
}

function htmlToPlainText(html: string) {
  return plainTextFromHtml(html)
    .replace(/\u00a0/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export default function Page() {
  const [html, setHtml] = useState("");
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

  const [duplicateCaseSensitive, setDuplicateCaseSensitive] =
    useState(false);

  const [showGuide, setShowGuide] = useState(true);

  const editorRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  /*
   * ---------------------------------------------------------
   * LOAD SAVED DATA
   * ---------------------------------------------------------
   */

  useEffect(() => {
    const savedHtml = localStorage.getItem("textlyzer_html");
    const savedGoal = localStorage.getItem("adv_goal");
    const savedTheme = localStorage.getItem("theme");

    if (savedHtml !== null) {
      setHtml(savedHtml);
    }

    if (savedGoal) {
      const parsed = parseInt(savedGoal);

      if (!Number.isNaN(parsed)) {
        setGoal(parsed);
      }
    }

    if (savedTheme === "light") {
      setDark(false);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("textlyzer_html", html);
  }, [html]);

  useEffect(() => {
    localStorage.setItem("adv_goal", String(goal));
  }, [goal]);

  /*
   * ---------------------------------------------------------
   * EDITOR CONTENT
   * ---------------------------------------------------------
   */

  const editorText = useMemo(() => {
    return htmlToPlainText(html);
  }, [html]);

  const updateEditor = () => {
    if (!editorRef.current) return;

    setHtml(editorRef.current.innerHTML);
  };

  /*
   * ---------------------------------------------------------
   * FORMAT TOOLBAR
   * ---------------------------------------------------------
   */

  const executeCommand = (
    command: string,
    value?: string
  ) => {
    if (!editorRef.current) return;

    editorRef.current.focus();

    try {
      document.execCommand(command, false, value);
    } catch {
      // Ignore unsupported browser commands.
    }

    updateEditor();
  };

  const applyBlock = (tag: "h1" | "h2" | "p" | "blockquote") => {
    if (!editorRef.current) return;

    editorRef.current.focus();

    try {
      document.execCommand(
        "formatBlock",
        false,
        tag
      );
    } catch {
      // Ignore.
    }

    updateEditor();
  };

  const createLink = () => {
    if (!editorRef.current) return;

    const url = window.prompt(
      "Enter URL",
      "https://"
    );

    if (!url) return;

    editorRef.current.focus();

    try {
      document.execCommand(
        "createLink",
        false,
        url
      );
    } catch {
      // Ignore.
    }

    updateEditor();
  };

  const clearFormatting = () => {
    if (!editorRef.current) return;

    editorRef.current.focus();

    try {
      document.execCommand(
        "removeFormat",
        false
      );
    } catch {
      // Ignore.
    }

    updateEditor();
  };

  /*
   * ---------------------------------------------------------
   * KEYBOARD SHORTCUTS
   * ---------------------------------------------------------
   */

  const handleEditorKeyDown = (
    e: React.KeyboardEvent<HTMLDivElement>
  ) => {
    if (
      (e.ctrlKey || e.metaKey) &&
      e.key.toLowerCase() === "b"
    ) {
      e.preventDefault();
      executeCommand("bold");
    }

    if (
      (e.ctrlKey || e.metaKey) &&
      e.key.toLowerCase() === "i"
    ) {
      e.preventDefault();
      executeCommand("italic");
    }

    if (
      (e.ctrlKey || e.metaKey) &&
      e.key.toLowerCase() === "u"
    ) {
      e.preventDefault();
      executeCommand("underline");
    }

    if (
      (e.ctrlKey || e.metaKey) &&
      e.key.toLowerCase() === "k"
    ) {
      e.preventDefault();
      createLink();
    }

    if (
      (e.ctrlKey || e.metaKey) &&
      e.key.toLowerCase() === "z"
    ) {
      e.preventDefault();
      executeCommand("undo");
    }

    if (
      (e.ctrlKey || e.metaKey) &&
      e.key.toLowerCase() === "y"
    ) {
      e.preventDefault();
      executeCommand("redo");
    }
  };

  /*
   * ---------------------------------------------------------
   * VOICE TYPING
   * ---------------------------------------------------------
   */

  const toggleVoice = () => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        "Voice typing is not supported in this browser. Please use Google Chrome."
      );
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "hi-IN";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => {
      setListening(true);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.onerror = () => {
      setListening(false);
    };

    recognition.onresult = (event: any) => {
      const transcript =
        event.results[0][0].transcript;

      if (!editorRef.current) return;

      editorRef.current.focus();

      document.execCommand(
        "insertText",
        false,
        (editorText ? " " : "") + transcript
      );

      updateEditor();
    };

    recognitionRef.current = recognition;

    recognition.start();
  };

  /*
   * ---------------------------------------------------------
   * TEXT TO SPEECH
   * ---------------------------------------------------------
   */

  const toggleSpeak = () => {
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    if (!editorText.trim()) return;

    const utterance =
      new SpeechSynthesisUtterance(
        editorText
      );

    utterance.lang =
      /[अ-ह]/.test(editorText)
        ? "hi-IN"
        : "en-US";

    utterance.rate = 1;

    utterance.onstart = () => {
      setSpeaking(true);
    };

    utterance.onend = () => {
      setSpeaking(false);
    };

    utterance.onerror = () => {
      setSpeaking(false);
    };

    window.speechSynthesis.speak(
      utterance
    );
  };

  /*
   * ---------------------------------------------------------
   * STATS
   * ---------------------------------------------------------
   */

  const stats = useMemo(() => {
    const text = editorText;

    const chars = text.length;

    const charsNoSpace = text
      .replace(/\s/g, "")
      .length;

    const words = text.trim()
      ? text
          .trim()
          .split(/\s+/)
          .filter(Boolean).length
      : 0;

    const sentences =
      text
        .split(/[.!?]+/)
        .filter((s) => s.trim()).length;

    const paragraphs =
      text
        .split(/\n+/)
        .filter((s) => s.trim()).length;

    const lines = text
      ? text.split(/\n/).length
      : 0;

    const letters = (
      text.match(/[A-Za-z\u0900-\u097F]/g) ||
      []
    ).length;

    const numbers = (
      text.match(/[0-9]/g) ||
      []
    ).length;

    const spaces = (
      text.match(/\s/g) ||
      []
    ).length;

    const punctuation = (
      text.match(/[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/g) ||
      []
    ).length;

    const emoji = countEmoji(text);

    let syllables = 0;

    text
      .trim()
      .split(/\s+/)
      .forEach((word) => {
        syllables += countSyllables(word);
      });

    const safeSentences =
      sentences || 1;

    const flesch = words
      ? 206.835 -
        1.015 *
          (words / safeSentences) -
        84.6 *
          (syllables / words)
      : 0;

    const reading = Math.max(
      1,
      Math.ceil(words / 225)
    );

    const speaking = Math.max(
      1,
      Math.ceil(words / 150)
    );

    const stopWords = new Set([
      "the",
      "and",
      "is",
      "in",
      "to",
      "a",
      "of",
      "for",
      "on",
      "with",
      "this",
      "that",
      "are",
      "be",
      "it",
      "as",
      "at",
      "by",
      "from",
      "hai",
      "aur",
      "ke",
      "ka",
      "ko",
      "mein",
      "hain",
      "ki",
      "se",
    ]);

    const freq: Record<
      string,
      number
    > = {};

    text
      .toLowerCase()
      .split(/\W+/)
      .filter(
        (word) =>
          word.length > 2 &&
          !stopWords.has(word)
      )
      .forEach((word) => {
        freq[word] =
          (freq[word] || 0) + 1;
      });

    const top = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12);

    const maxFreq =
      top[0]?.[1] || 1;

    const lang =
      /[अ-ह]/.test(text)
        ? /[a-zA-Z]/.test(text)
          ? "Hinglish"
          : "Hindi"
        : "English";

    return {
      chars,
      charsNoSpace,
      words,
      sentences,
      paragraphs,
      lines,
      letters,
      numbers,
      spaces,
      punctuation,
      emoji,
      syllables,
      flesch,
      reading,
      speaking,
      top,
      maxFreq,
      lang,
    };
  }, [editorText]);

  /*
   * ---------------------------------------------------------
   * SEO SCORE
   * ---------------------------------------------------------
   */

  const seoScore = useMemo(() => {
    let score = 0;

    if (
      title.length >= 50 &&
      title.length <= 60
    ) {
      score += 35;
    } else if (title.length > 0) {
      score += 15;
    }

    if (
      desc.length >= 150 &&
      desc.length <= 160
    ) {
      score += 35;
    } else if (desc.length > 0) {
      score += 15;
    }

    if (stats.words > 300) {
      score += 15;
    }

    if (stats.top.length > 5) {
      score += 15;
    }

    return Math.min(100, score);
  }, [
    title,
    desc,
    stats,
  ]);

  /*
   * ---------------------------------------------------------
   * CLEAN FUNCTIONS
   * ---------------------------------------------------------
   */

  const replaceAllText = () => {
    if (!find) return;

    const source = editorText;

    const result =
      source.split(find).join(replace);

    setHtml(
      `<p>${escapeHtml(result).replace(
        /\n/g,
        "<br>"
      )}</p>`
    );
  };

  const removeExtraSpaces = () => {
    const cleaned = editorText
      .replace(/[ \t]+/g, " ")
      .replace(/\n[ \t]+/g, "\n")
      .trim();

    setHtml(
      `<p>${escapeHtml(cleaned).replace(
        /\n/g,
        "<br>"
      )}</p>`
    );
  };

  const removeEmptyLines = () => {
    const cleaned = editorText
      .split("\n")
      .filter((line) => line.trim())
      .join("\n");

    setHtml(
      `<p>${escapeHtml(cleaned).replace(
        /\n/g,
        "<br>"
      )}</p>`
    );
  };

  /*
   * FIXED DUPLICATE REMOVER
   *
   * Removes duplicate lines/paragraphs while:
   * - preserving original order
   * - ignoring accidental spaces
   * - optionally ignoring case
   */

  const removeDuplicates = () => {
    const lines = editorText.split("\n");

    const seen = new Set<string>();

    const uniqueLines: string[] = [];

    for (const line of lines) {
      const normalized =
        line
          .replace(/\s+/g, " ")
          .trim();

      if (!normalized) {
        continue;
      }

      const key =
        duplicateCaseSensitive
          ? normalized
          : normalized.toLowerCase();

      if (!seen.has(key)) {
        seen.add(key);
        uniqueLines.push(normalized);
      }
    }

    const result =
      uniqueLines.join("\n");

    setHtml(
      `<p>${escapeHtml(result).replace(
        /\n/g,
        "<br>"
      )}</p>`
    );
  };

  const addNumbers = () => {
    const result = editorText
      .split("\n")
      .map((line, index) =>
        line.trim()
          ? `${index + 1}. ${line}`
          : ""
      )
      .join("\n");

    setHtml(
      `<p>${escapeHtml(result).replace(
        /\n/g,
        "<br>"
      )}</p>`
    );
  };

  /*
   * ---------------------------------------------------------
   * EXPORT
   * ---------------------------------------------------------
   */

  const downloadFile = (
    filename: string,
    content: string,
    type: string
  ) => {
    const blob = new Blob(
      [content],
      { type }
    );

    const url =
      URL.createObjectURL(blob);

    const a =
      document.createElement("a");

    a.href = url;
    a.download = filename;

    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);
  };

  const exportTxt = () => {
    downloadFile(
      "textlyzer-document.txt",
      editorText,
      "text/plain;charset=utf-8"
    );
  };

  const exportHtml = () => {
    const completeHtml = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Textlyzer Document</title>
</head>
<body>
${html}
</body>
</html>
`;

    downloadFile(
      "textlyzer-document.html",
      completeHtml,
      "text/html;charset=utf-8"
    );
  };

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(
        editorText
      );
    } catch {
      alert("Copy failed.");
    }
  };

  /*
   * ---------------------------------------------------------
   * TOOL TIPS
   * ---------------------------------------------------------
   */

  const Tooltip = ({
    text,
    children,
  }: {
    text: string;
    children: React.ReactNode;
  }) => (
    <div
      title={text}
      className="inline-flex"
    >
      {children}
    </div>
  );

  /*
   * ---------------------------------------------------------
   * TABS
   * ---------------------------------------------------------
   */

  const tabs: {
    id: Tab;
    label: string;
    icon: string;
  }[] = [
    {
      id: "count",
      label: "COUNT",
      icon: "📊",
    },
    {
      id: "clean",
      label: "CLEAN",
      icon: "🧹",
    },
    {
      id: "seo",
      label: "SEO",
      icon: "🔍",
    },
    {
      id: "goals",
      label: "GOALS",
      icon: "🎯",
    },
    {
      id: "analyze",
      label: "ANALYZE",
      icon: "📈",
    },
    {
      id: "tools",
      label: "TOOLS",
      icon: "🛠️",
    },
    {
      id: "diff",
      label: "DIFF",
      icon: "🔀",
    },
  ];

  /*
   * ---------------------------------------------------------
   * UI CLASSES
   * ---------------------------------------------------------
   */

  const cardClass = `
    rounded-[20px]
    border
    p-4
    shadow-lg
    transition-all
    duration-300
    hover:-translate-y-0.5
    hover:shadow-2xl
    ${
      dark
        ? "bg-[#161826]/80 border-white/10"
        : "bg-white border-black/10"
    }
  `;

  const buttonClass = `
    px-3
    py-2
    rounded-xl
    border
    text-xs
    font-semibold
    transition-all
    duration-200
    hover:-translate-y-0.5
    hover:shadow-lg
    active:scale-95
    ${
      dark
        ? "bg-[#1e2138] border-white/10 hover:bg-[#292d4c] text-white"
        : "bg-white border-black/10 hover:bg-[#f0f1ff] text-[#171a2b]"
    }
  `;

  /*
   * ---------------------------------------------------------
   * RENDER
   * ---------------------------------------------------------
   */

  return (
    <div
      className={
        dark ? "dark" : ""
      }
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');

        * {
          font-family: 'Outfit', sans-serif;
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          margin: 0;
        }

        .editor-content h1 {
          font-size: 2rem;
          line-height: 1.2;
          font-weight: 800;
          margin: 0.8rem 0;
        }

        .editor-content h2 {
          font-size: 1.5rem;
          line-height: 1.3;
          font-weight: 700;
          margin: 0.7rem 0;
        }

        .editor-content p {
          margin: 0.5rem 0;
        }

        .editor-content blockquote {
          border-left: 4px solid #6366f1;
          padding-left: 1rem;
          margin: 0.8rem 0;
          opacity: 0.85;
          font-style: italic;
        }

        .editor-content ul,
        .editor-content ol {
          padding-left: 1.5rem;
          margin: 0.6rem 0;
        }

        .editor-content a {
          color: #818cf8;
          text-decoration: underline;
        }

        .toolbar-scroll::-webkit-scrollbar {
          height: 4px;
        }

        .toolbar-scroll::-webkit-scrollbar-thumb {
          background: #6366f1;
          border-radius: 20px;
        }

        ::selection {
          background: rgba(99, 102, 241, 0.35);
        }
      `}</style>

      <div
        className={`
          min-h-screen
          transition-colors
          duration-500
          ${
            dark
              ? "bg-[#0b0d16] text-white"
              : "bg-[#f6f7fb] text-[#151827]"
          }
        `}
      >
        {/* =====================================================
            HEADER
        ====================================================== */}

        <header
          className={`
            sticky
            top-0
            z-50
            border-b
            backdrop-blur-xl
            ${
              dark
                ? "bg-[#10121d]/95 border-white/10"
                : "bg-white/95 border-black/10"
            }
          `}
        >
          <div className="max-w-[1280px] mx-auto px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className="
                    w-10
                    h-10
                    rounded-2xl
                    bg-gradient-to-br
                    from-indigo-500
                    via-violet-500
                    to-cyan-400
                    flex
                    items-center
                    justify-center
                    font-extrabold
                    text-white
                    shadow-lg
                    shadow-indigo-500/30
                  "
                >
                  T
                </div>

                <div>
                  <div className="font-extrabold text-lg">
                    Text
                    <span className="text-indigo-400">
                      lyzer
                    </span>
                  </div>

                  <div className="text-[10px] opacity-50 tracking-[0.25em]">
                    ADVANCED WRITING TOOL
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Tooltip text="Copy all text">
                  <button
                    onClick={copyText}
                    className={buttonClass}
                  >
                    📋
                  </button>
                </Tooltip>

                <Tooltip text="Dark / Light mode">
                  <button
                    onClick={() => {
                      setDark(!dark);

                      localStorage.setItem(
                        "theme",
                        !dark
                          ? "dark"
                          : "light"
                      );
                    }}
                    className="
                      w-10
                      h-10
                      rounded-xl
                      border
                      flex
                      items-center
                      justify-center
                      transition-all
                      duration-300
                      hover:rotate-12
                      hover:scale-105
                    "
                  >
                    {dark ? "☀️" : "🌙"}
                  </button>
                </Tooltip>
              </div>
            </div>

            {/* TABS */}

            <div className="flex flex-wrap gap-2 mt-4">
              {tabs.map((item) => (
                <button
                  key={item.id}
                  onClick={() =>
                    setTab(item.id)
                  }
                  className={`
                    px-4
                    py-2.5
                    rounded-xl
                    border
                    text-[11px]
                    font-bold
                    tracking-wider
                    transition-all
                    duration-300
                    hover:-translate-y-0.5
                    active:scale-95
                    ${
                      tab === item.id
                        ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white border-indigo-500 shadow-lg shadow-indigo-500/30"
                        : dark
                        ? "bg-[#1a1d2c] border-white/10 text-white/80 hover:bg-[#272b42]"
                        : "bg-white border-black/10 hover:bg-indigo-50"
                    }
                  `}
                >
                  {item.icon}{" "}
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* =====================================================
            MAIN
        ====================================================== */}

        <main className="max-w-[1280px] mx-auto p-4">
          <div className="grid lg:grid-cols-[1.15fr_380px] gap-4">
            {/* =================================================
                EDITOR
            ================================================== */}

            <section className={cardClass}>
              {/* TOOLBAR */}

              <div
                className={`
                  toolbar-scroll
                  flex
                  flex-wrap
                  gap-1.5
                  p-2
                  rounded-2xl
                  border
                  mb-3
                  ${
                    dark
                      ? "bg-[#0d0f18] border-white/10"
                      : "bg-[#f6f7ff] border-black/5"
                  }
                `}
              >
                <span className="text-[10px] font-bold opacity-40 flex items-center px-2">
                  FORMAT
                </span>

                <Tooltip text="Bold (Ctrl+B)">
                  <button
                    onMouseDown={(e) =>
                      e.preventDefault()
                    }
                    onClick={() =>
                      executeCommand(
                        "bold"
                      )
                    }
                    className={`${buttonClass} font-extrabold`}
                  >
                    B
                  </button>
                </Tooltip>

                <Tooltip text="Italic (Ctrl+I)">
                  <button
                    onMouseDown={(e) =>
                      e.preventDefault()
                    }
                    onClick={() =>
                      executeCommand(
                        "italic"
                      )
                    }
                    className={`${buttonClass} italic`}
                  >
                    I
                  </button>
                </Tooltip>

                <Tooltip text="Underline (Ctrl+U)">
                  <button
                    onMouseDown={(e) =>
                      e.preventDefault()
                    }
                    onClick={() =>
                      executeCommand(
                        "underline"
                      )
                    }
                    className={`${buttonClass} underline`}
                  >
                    U
                  </button>
                </Tooltip>

                <Tooltip text="Heading 1">
                  <button
                    onMouseDown={(e) =>
                      e.preventDefault()
                    }
                    onClick={() =>
                      applyBlock("h1")
                    }
                    className={buttonClass}
                  >
                    H1
                  </button>
                </Tooltip>

                <Tooltip text="Heading 2">
                  <button
                    onMouseDown={(e) =>
                      e.preventDefault()
                    }
                    onClick={() =>
                      applyBlock("h2")
                    }
                    className={buttonClass}
                  >
                    H2
                  </button>
                </Tooltip>

                <Tooltip text="Bullet List">
                  <button
                    onMouseDown={(e) =>
                      e.preventDefault()
                    }
                    onClick={() =>
                      executeCommand(
                        "insertUnorderedList"
                      )
                    }
                    className={buttonClass}
                  >
                    • List
                  </button>
                </Tooltip>

                <Tooltip text="Numbered List">
                  <button
                    onMouseDown={(e) =>
                      e.preventDefault()
                    }
                    onClick={() =>
                      executeCommand(
                        "insertOrderedList"
                      )
                    }
                    className={buttonClass}
                  >
                    1. List
                  </button>
                </Tooltip>

                <Tooltip text="Quote">
                  <button
                    onMouseDown={(e) =>
                      e.preventDefault()
                    }
                    onClick={() =>
                      applyBlock(
                        "blockquote"
                      )
                    }
                    className={buttonClass}
                  >
                    ❝
                  </button>
                </Tooltip>

                <Tooltip text="Insert Link (Ctrl+K)">
                  <button
                    onMouseDown={(e) =>
                      e.preventDefault()
                    }
                    onClick={createLink}
                    className={buttonClass}
                  >
                    🔗
                  </button>
                </Tooltip>

                <Tooltip text="Remove formatting">
                  <button
                    onMouseDown={(e) =>
                      e.preventDefault()
                    }
                    onClick={
                      clearFormatting
                    }
                    className={buttonClass}
                  >
                    Tx
                  </button>
                </Tooltip>

                <div className="w-px bg-white/10 mx-1" />

                <Tooltip text="Undo (Ctrl+Z)">
                  <button
                    onMouseDown={(e) =>
                      e.preventDefault()
                    }
                    onClick={() =>
                      executeCommand(
                        "undo"
                      )
                    }
                    className={buttonClass}
                  >
                    ↶
                  </button>
                </Tooltip>

                <Tooltip text="Redo (Ctrl+Y)">
                  <button
                    onMouseDown={(e) =>
                      e.preventDefault()
                    }
                    onClick={() =>
                      executeCommand(
                        "redo"
                      )
                    }
                    className={buttonClass}
                  >
                    ↷
                  </button>
                </Tooltip>

                <Tooltip text="Voice typing">
                  <button
                    onClick={toggleVoice}
                    className={`
                      px-3
                      py-2
                      rounded-xl
                      text-xs
                      font-bold
                      text-white
                      transition-all
                      hover:scale-105
                      active:scale-95
                      ${
                        listening
                          ? "bg-red-500 animate-pulse"
                          : "bg-indigo-500 hover:bg-indigo-400"
                      }
                    `}
                  >
                    {listening
                      ? "● Listening"
                      : "🎙️ Voice"}
                  </button>
                </Tooltip>

                <Tooltip text="Text to speech">
                  <button
                    onClick={toggleSpeak}
                    className={`
                      px-3
                      py-2
                      rounded-xl
                      text-xs
                      font-bold
                      text-white
                      transition-all
                      hover:scale-105
                      active:scale-95
                      ${
                        speaking
                          ? "bg-red-500"
                          : "bg-emerald-600 hover:bg-emerald-500"
                      }
                    `}
                  >
                    {speaking
                      ? "■ Stop"
                      : "🔊 Speak"}
                  </button>
                </Tooltip>
              </div>

              {/* ACTION BAR */}

              <div className="flex flex-wrap gap-2 mb-3">
                <button
                  onClick={copyText}
                  className={buttonClass}
                >
                  📋 Copy
                </button>

                <button
                  onClick={() => {
                    setHtml("");

                    if (
                      editorRef.current
                    ) {
                      editorRef.current.innerHTML =
                        "";
                    }
                  }}
                  className={buttonClass}
                >
                  🗑 Clear
                </button>

                <button
                  onClick={() =>
                    executeCommand(
                      "justifyLeft"
                    )
                  }
                  className={buttonClass}
                >
                  ← Align
                </button>

                <button
                  onClick={() =>
                    executeCommand(
                      "justifyCenter"
                    )
                  }
                  className={buttonClass}
                >
                  Center
                </button>

                <button
                  onClick={() =>
                    executeCommand(
                      "justifyRight"
                    )
                  }
                  className={buttonClass}
                >
                  Align →
                </button>

                <button
                  onClick={() =>
                    setHtml(
                      `<p>${escapeHtml(
                        editorText
                          .toUpperCase()
                      ).replace(
                        /\n/g,
                        "<br>"
                      )}</p>`
                    )
                  }
                  className={buttonClass}
                >
                  UPPER
                </button>

                <button
                  onClick={() =>
                    setHtml(
                      `<p>${escapeHtml(
                        editorText
                          .toLowerCase()
                      ).replace(
                        /\n/g,
                        "<br>"
                      )}</p>`
                    )
                  }
                  className={buttonClass}
                >
                  lower
                </button>

                <button
                  onClick={() =>
                    setHtml(
                      `<p>${escapeHtml(
                        removeEmojiSafe(
                          editorText
                        )
                      ).replace(
                        /\n/g,
                        "<br>"
                      )}</p>`
                    )
                  }
                  className={buttonClass}
                >
                  Remove Emoji
                </button>
              </div>

              {/* EDITOR */}

              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={updateEditor}
                onKeyDown={
                  handleEditorKeyDown
                }
                onBlur={updateEditor}
                className={`
                  editor-content
                  w-full
                  min-h-[420px]
                  max-h-[700px]
                  overflow-y-auto
                  p-5
                  rounded-2xl
                  border
                  outline-none
                  text-[16px]
                  leading-8
                  transition-all
                  duration-300
                  focus:ring-2
                  focus:ring-indigo-500/50
                  ${
                    dark
                      ? "bg-[#1b1e30] border-white/10 text-white"
                      : "bg-white border-black/10"
                  }
                `}
                data-placeholder="Type or paste your text here..."
              />

              <div className="mt-2 text-[10px] opacity-40">
                Rich text editor • Bold,
                Italic, H1, H2, Lists,
                Quote, Links • Ctrl+B /
                Ctrl+I / Ctrl+K
              </div>

              {/* STATS */}

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-2 mt-4">
                {[
                  ["Characters", stats.chars],
                  ["Words", stats.words],
                  [
                    "No Spaces",
                    stats.charsNoSpace,
                  ],
                  [
                    "Sentences",
                    stats.sentences,
                  ],
                  [
                    "Paragraphs",
                    stats.paragraphs,
                  ],
                  ["Lines", stats.lines],
                  ["Letters", stats.letters],
                  ["Numbers", stats.numbers],
                  ["Spaces", stats.spaces],
                  [
                    "Punctuation",
                    stats.punctuation,
                  ],
                  ["Emoji", stats.emoji],
                  [
                    "Reading",
                    `${stats.reading}m`,
                  ],
                  [
                    "Speaking",
                    `${stats.speaking}m`,
                  ],
                  [
                    "Flesch",
                    Math.round(
                      stats.flesch
                    ),
                  ],
                  ["Language", stats.lang],
                  [
                    "Size",
                    `${(
                      stats.chars / 1024
                    ).toFixed(2)}KB`,
                  ],
                ].map(
                  ([label, value]) => (
                    <div
                      key={String(label)}
                      className={`
                        rounded-xl
                        border
                        p-3
                        text-center
                        transition-all
                        duration-300
                        hover:-translate-y-1
                        ${
                          dark
                            ? "bg-[#1e2138] border-white/10 hover:bg-[#252943]"
                            : "bg-[#f8f9ff] border-black/5 hover:bg-indigo-50"
                        }
                      `}
                    >
                      <div className="font-extrabold text-sm">
                        {value}
                      </div>

                      <div className="text-[9px] uppercase tracking-wider opacity-50 mt-1">
                        {label}
                      </div>
                    </div>
                  )
                )}
              </div>

              {/* EXPORT */}

              <div className="flex flex-wrap gap-2 mt-4">
                <button
                  onClick={exportTxt}
                  className="
                    px-4
                    py-2.5
                    rounded-xl
                    bg-indigo-500
                    hover:bg-indigo-400
                    text-white
                    text-xs
                    font-bold
                    transition-all
                    hover:-translate-y-0.5
                    active:scale-95
                  "
                >
                  ↓ Export TXT
                </button>

                <button
                  onClick={exportHtml}
                  className="
                    px-4
                    py-2.5
                    rounded-xl
                    bg-cyan-600
                    hover:bg-cyan-500
                    text-white
                    text-xs
                    font-bold
                    transition-all
                    hover:-translate-y-0.5
                    active:scale-95
                  "
                >
                  ↓ Export HTML
                </button>
              </div>
            </section>

            {/* =================================================
                RIGHT PANEL
            ================================================== */}

            <aside className="space-y-4">
              {/* COUNT */}

              {tab === "count" && (
                <div className={cardClass}>
                  <h3 className="font-bold">
                    📊 Social Media Limits
                  </h3>

                  <p className="text-xs opacity-50 mt-1 mb-4">
                    Quickly check whether
                    your text fits common
                    platform limits.
                  </p>

                  {[
                    ["X / Twitter", 280],
                    ["Instagram", 2200],
                    ["LinkedIn", 3000],
                    ["Facebook", 63206],
                    ["YouTube Title", 100],
                    ["Google Title", 60],
                  ].map(([name, limit]) => {
                    const over =
                      stats.chars >
                      (limit as number);

                    return (
                      <div
                        key={String(name)}
                        className="py-3 border-b border-dashed border-white/10"
                      >
                        <div className="flex justify-between text-xs">
                          <span>
                            {name}
                          </span>

                          <span
                            className={
                              over
                                ? "text-red-400 font-bold"
                                : "text-emerald-400 font-bold"
                            }
                          >
                            {stats.chars}/
                            {limit}
                          </span>
                        </div>

                        <div className="h-1.5 bg-black/10 dark:bg-white/10 rounded-full mt-2 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${
                              over
                                ? "bg-red-500"
                                : "bg-emerald-500"
                            }`}
                            style={{
                              width: `${Math.min(
                                100,
                                (stats.chars /
                                  Number(
                                    limit
                                  )) *
                                  100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* CLEAN */}

              {tab === "clean" && (
                <div className={cardClass}>
                  <h3 className="font-bold">
                    🧹 Clean & Replace
                  </h3>

                  <p className="text-xs opacity-50 mt-1 mb-4">
                    Clean, replace and
                    organize your text.
                  </p>

                  <input
                    value={find}
                    onChange={(e) =>
                      setFind(e.target.value)
                    }
                    placeholder="Find..."
                    className={`
                      w-full
                      px-3
                      py-2.5
                      rounded-xl
                      border
                      text-sm
                      outline-none
                      focus:ring-2
                      focus:ring-indigo-500/40
                      ${
                        dark
                          ? "bg-[#1e2138] border-white/10"
                          : "bg-white border-black/10"
                      }
                    `}
                  />

                  <input
                    value={replace}
                    onChange={(e) =>
                      setReplace(
                        e.target.value
                      )
                    }
                    placeholder="Replace with..."
                    className={`
                      w-full
                      mt-2
                      px-3
                      py-2.5
                      rounded-xl
                      border
                      text-sm
                      outline-none
                      focus:ring-2
                      focus:ring-indigo-500/40
                      ${
                        dark
                          ? "bg-[#1e2138] border-white/10"
                          : "bg-white border-black/10"
                      }
                    `}
                  />

                  <button
                    onClick={replaceAllText}
                    className="
                      w-full
                      mt-2
                      py-2.5
                      rounded-xl
                      bg-indigo-500
                      hover:bg-indigo-400
                      text-white
                      text-xs
                      font-bold
                      transition-all
                      hover:-translate-y-0.5
                      active:scale-95
                    "
                  >
                    Replace All
                  </button>

                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <button
                      onClick={
                        removeExtraSpaces
                      }
                      className={buttonClass}
                    >
                      Extra Spaces
                    </button>

                    <button
                      onClick={
                        removeEmptyLines
                      }
                      className={buttonClass}
                    >
                      Empty Lines
                    </button>

                    <button
                      onClick={
                        removeDuplicates
                      }
                      className="
                        py-2.5
                        rounded-xl
                        bg-violet-500
                        hover:bg-violet-400
                        text-white
                        text-xs
                        font-bold
                        transition-all
                        hover:-translate-y-0.5
                        active:scale-95
                      "
                    >
                      Remove Duplicates
                    </button>

                    <button
                      onClick={addNumbers}
                      className={buttonClass}
                    >
                      Add Numbers
                    </button>
                  </div>

                  <label
                    className={`
                      flex
                      items-center
                      gap-2
                      mt-4
                      text-xs
                      cursor-pointer
                      ${
                        dark
                          ? "text-white/70"
                          : "text-black/70"
                      }
                    `}
                  >
                    <input
                      type="checkbox"
                      checked={
                        duplicateCaseSensitive
                      }
                      onChange={(e) =>
                        setDuplicateCaseSensitive(
                          e.target.checked
                        )
                      }
                    />

                    Case-sensitive duplicate
                    detection
                  </label>

                  <div
                    className={`
                      mt-4
                      p-3
                      rounded-xl
                      text-[11px]
                      ${
                        dark
                          ? "bg-indigo-500/10 text-indigo-200"
                          : "bg-indigo-50 text-indigo-700"
                      }
                    `}
                  >
                    <b>Duplicate remover:</b>{" "}
                    duplicate lines are
                    removed while preserving
                    the first occurrence and
                    original order.
                  </div>
                </div>
              )}

              {/* SEO */}

              {tab === "seo" && (
                <div className={cardClass}>
                  <div className="flex justify-between">
                    <h3 className="font-bold">
                      🔍 SEO Studio
                    </h3>

                    <span className="font-bold text-indigo-400">
                      {seoScore}/100
                    </span>
                  </div>

                  <div className="h-2 bg-black/10 dark:bg-white/10 rounded-full mt-3 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-emerald-400 transition-all duration-700"
                      style={{
                        width: `${seoScore}%`,
                      }}
                    />
                  </div>

                  <input
                    value={title}
                    onChange={(e) =>
                      setTitle(e.target.value)
                    }
                    placeholder="SEO Title (50–60 characters)"
                    className={`
                      w-full
                      mt-4
                      px-3
                      py-2.5
                      rounded-xl
                      border
                      text-sm
                      ${
                        dark
                          ? "bg-[#1e2138] border-white/10"
                          : "bg-white border-black/10"
                      }
                    `}
                  />

                  <div className="text-xs opacity-60 mt-1">
                    {title.length}/60{" "}
                    {title.length >= 50 &&
                    title.length <= 60
                      ? "✅ Ideal"
                      : "⚠️"}
                  </div>

                  <input
                    value={desc}
                    onChange={(e) =>
                      setDesc(e.target.value)
                    }
                    placeholder="Meta Description (150–160)"
                    className={`
                      w-full
                      mt-3
                      px-3
                      py-2.5
                      rounded-xl
                      border
                      text-sm
                      ${
                        dark
                          ? "bg-[#1e2138] border-white/10"
                          : "bg-white border-black/10"
                      }
                    `}
                  />

                  <div className="text-xs opacity-60 mt-1">
                    {desc.length}/160{" "}
                    {desc.length >= 150 &&
                    desc.length <= 160
                      ? "✅ Ideal"
                      : "⚠️"}
                  </div>

                  <input
                    value={slug}
                    onChange={(e) =>
                      setSlug(e.target.value)
                    }
                    placeholder="seo-friendly-slug"
                    className={`
                      w-full
                      mt-3
                      px-3
                      py-2.5
                      rounded-xl
                      border
                      text-sm
                      ${
                        dark
                          ? "bg-[#1e2138] border-white/10"
                          : "bg-white border-black/10"
                      }
                    `}
                  />

                  <button
                    onClick={() =>
                      setSlug(
                        title
                          .toLowerCase()
                          .replace(
                            /[^a-z0-9\u0900-\u097F]+/g,
                            "-"
                          )
                          .replace(
                            /^-|-$/g,
                            ""
                          )
                      )
                    }
                    className="
                      w-full
                      mt-2
                      py-2.5
                      rounded-xl
                      bg-indigo-500
                      hover:bg-indigo-400
                      text-white
                      text-xs
                      font-bold
                      transition-all
                    "
                  >
                    Generate Slug
                  </button>

                  <div className="mt-4 bg-white text-black rounded-xl p-4 shadow-lg">
                    <div className="text-sm text-blue-700 truncate">
                      {title ||
                        "Your SEO Title Preview"}
                    </div>

                    <div className="text-xs text-green-700 mt-1">
                      https://textlyzer.app/
                      {slug ||
                        "character-counter"}
                    </div>

                    <div className="text-xs text-gray-600 mt-1">
                      {desc ||
                        "Your meta description preview will appear here."}
                    </div>
                  </div>
                </div>
              )}

              {/* GOALS */}

              {tab === "goals" && (
                <div className={cardClass}>
                  <h3 className="font-bold">
                    🎯 Writing Goal
                  </h3>

                  <label className="text-xs opacity-60 block mt-4">
                    Daily Word Goal
                  </label>

                  <div className="flex gap-2 mt-1">
                    <input
                      type="number"
                      value={goal}
                      onChange={(e) =>
                        setGoal(
                          Math.max(
                            1,
                            parseInt(
                              e.target.value
                            ) || 1
                          )
                        )
                      }
                      className={`
                        flex-1
                        px-3
                        py-2.5
                        rounded-xl
                        border
                        text-sm
                        ${
                          dark
                            ? "bg-[#1e2138] border-white/10"
                            : "bg-white border-black/10"
                        }
                      `}
                    />

                    <button
                      onClick={() =>
                        localStorage.setItem(
                          "adv_goal",
                          String(goal)
                        )
                      }
                      className="
                        px-4
                        rounded-xl
                        bg-indigo-500
                        text-white
                        text-xs
                        font-bold
                      "
                    >
                      Set
                    </button>
                  </div>

                  <div className="flex justify-between text-xs mt-5">
                    <span>
                      {stats.words} /{" "}
                      {goal}
                    </span>

                    <span>
                      {Math.min(
                        100,
                        Math.round(
                          (stats.words /
                            goal) *
                            100
                        )
                      )}
                      %
                    </span>
                  </div>

                  <div className="h-3 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden mt-2">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-700"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round(
                            (stats.words /
                              goal) *
                              100
                          )
                        )}%`,
                      }}
                    />
                  </div>

                  <div
                    className={`
                      mt-5
                      p-4
                      rounded-xl
                      ${
                        dark
                          ? "bg-[#1e2138]"
                          : "bg-[#f4f5ff]"
                      }
                    `}
                  >
                    <div className="text-xs">
                      🔥 Current words:{" "}
                      <b>
                        {stats.words}
                      </b>
                    </div>

                    <div className="text-xs mt-2">
                      ⏱️ Estimated remaining:{" "}
                      <b>
                        {Math.max(
                          0,
                          Math.ceil(
                            (goal -
                              stats.words) /
                              200
                          )
                        )}{" "}
                        minutes
                      </b>
                    </div>

                    <div className="text-xs mt-2">
                      {stats.words >=
                      goal
                        ? "🎉 Goal achieved!"
                        : "💪 Keep writing!"}
                    </div>
                  </div>
                </div>
              )}

              {/* ANALYZE */}

              {tab === "analyze" && (
                <div className={cardClass}>
                  <h3 className="font-bold">
                    📈 Keyword Analysis
                  </h3>

                  <div className="mt-4 space-y-2">
                    {stats.top.length ===
                    0 ? (
                      <div className="text-xs opacity-50">
                        Start typing to see
                        keyword frequency.
                      </div>
                    ) : (
                      stats.top.map(
                        ([word, count]) => (
                          <div
                            key={word}
                            className="flex items-center gap-2 text-xs"
                          >
                            <span className="w-20 truncate">
                              {word}
                            </span>

                            <div className="flex-1 h-2 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-indigo-500 transition-all duration-500"
                                style={{
                                  width: `${
                                    (count /
                                      stats.maxFreq) *
                                    100
                                  }%`,
                                }}
                              />
                            </div>

                            <span className="w-5 text-right">
                              {count}
                            </span>
                          </div>
                        )
                      )
                    )}
                  </div>

                  <div
                    className={`
                      mt-5
                      p-4
                      rounded-xl
                      text-xs
                      ${
                        dark
                          ? "bg-[#1e2138]"
                          : "bg-[#f5f6ff]"
                      }
                    `}
                  >
                    <b>
                      Readability:
                    </b>{" "}
                    {Math.round(
                      stats.flesch
                    )}{" "}
                    •{" "}
                    {stats.flesch > 80
                      ? "Very Easy"
                      : stats.flesch > 50
                      ? "Easy"
                      : "Difficult"}
                  </div>

                  <div className="text-xs opacity-60 mt-2">
                    Language:{" "}
                    {stats.lang}
                  </div>
                </div>
              )}

              {/* TOOLS */}

              {tab === "tools" && (
                <div className={cardClass}>
                  <h3 className="font-bold mb-3">
                    🛠️ Text Tools
                  </h3>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() =>
                        setHtml(
                          `<p>${escapeHtml(
                            editorText
                          ).replace(
                            /\n/g,
                            "<br>"
                          )}</p>`
                        )
                      }
                      className={buttonClass}
                    >
                      Clean Text
                    </button>

                    <button
                      onClick={() =>
                        setHtml(
                          `<p>${escapeHtml(
                            editorText
                              .split("")
                              .reverse()
                              .join("")
                          )}</p>`
                        )
                      }
                      className={buttonClass}
                    >
                      Reverse
                    </button>

                    <button
                      onClick={() =>
                        setHtml(
                          `<p>${escapeHtml(
                            editorText
                              .toLowerCase()
                              .replace(
                                /[^a-z0-9]+/g,
                                "-"
                              )
                              .replace(
                                /^-|-$/g,
                                ""
                              )
                          )}</p>`
                        )
                      }
                      className={buttonClass}
                    >
                      Slugify
                    </button>

                    <button
                      onClick={() => {
                        const words =
                          editorText
                            .trim()
                            .split(/\s+/)
                            .filter(Boolean);

                        const result =
                          words
                            .map(
                              (word) =>
                                "#" +
                                word.replace(
                                  /[^\w\u0900-\u097F]/g,
                                  ""
                                )
                            )
                            .join(" ");

                        setHtml(
                          `<p>${escapeHtml(
                            result
                          )}</p>`
                        );
                      }}
                      className={buttonClass}
                    >
                      # Hashtags
                    </button>

                    <button
                      onClick={() =>
                        setHtml(
                          `<p>${escapeHtml(
                            editorText
                              .toUpperCase()
                          ).replace(
                            /\n/g,
                            "<br>"
                          )}</p>`
                        )
                      }
                      className={buttonClass}
                    >
                      UPPERCASE
                    </button>

                    <button
                      onClick={() =>
                        setHtml(
                          `<p>${escapeHtml(
                            editorText
                              .toLowerCase()
                          ).replace(
                            /\n/g,
                            "<br>"
                          )}</p>`
                        )
                      }
                      className={buttonClass}
                    >
                      lowercase
                    </button>
                  </div>

                  <div className="mt-4">
                    <button
                      onClick={() =>
                        setHtml(
                          `<p>${escapeHtml(
                            editorText
                              ? editorText
                                  .split(
                                    /\s+/
                                  )
                                  .sort(
                                    (a, b) =>
                                      a.localeCompare(
                                        b
                                      )
                                  )
                                  .join(" ")
                              : ""
                          )}</p>`
                        )
                      }
                      className={buttonClass}
                    >
                      Sort Words A–Z
                    </button>
                  </div>
                </div>
              )}

              {/* DIFF */}

              {tab === "diff" && (
                <div className={cardClass}>
                  <h3 className="font-bold">
                    🔀 Diff Checker
                  </h3>

                  <textarea
                    value={diffB}
                    onChange={(e) =>
                      setDiffB(
                        e.target.value
                      )
                    }
                    placeholder="Paste modified text here..."
                    className={`
                      w-full
                      min-h-[180px]
                      mt-4
                      p-3
                      rounded-xl
                      border
                      outline-none
                      text-sm
                      ${
                        dark
                          ? "bg-[#1e2138] border-white/10"
                          : "bg-white border-black/10"
                      }
                    `}
                  />

                  <div className="grid grid-cols-3 gap-2 mt-3">
                    <div className="p-3 rounded-xl bg-indigo-500/10 text-center">
                      <b>
                        {stats.chars}
                      </b>
                      <div className="text-[9px] opacity-50">
                        ORIGINAL
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-cyan-500/10 text-center">
                      <b>
                        {diffB.length}
                      </b>
                      <div className="text-[9px] opacity-50">
                        MODIFIED
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-violet-500/10 text-center">
                      <b>
                        {Math.abs(
                          stats.chars -
                            diffB.length
                        )}
                      </b>
                      <div className="text-[9px] opacity-50">
                        DIFFERENCE
                      </div>
                    </div>
                  </div>

                  <div
                    className={`
                      mt-3
                      p-3
                      rounded-xl
                      text-xs
                      ${
                        editorText ===
                        diffB
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-red-500/10 text-red-400"
                      }
                    `}
                  >
                    {editorText ===
                    diffB
                      ? "✅ Both texts are identical."
                      : "⚠️ The texts are different."}
                  </div>
                </div>
              )}
            </aside>
          </div>

          {/* =====================================================
              OTHER USEFUL TOOLS
          ====================================================== */}

          <section className="mt-8">
            <h2 className="text-xl font-extrabold mb-4">
              ✨ Other Useful Tools
            </h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  icon: "📝",
                  title: "Word Counter",
                  description:
                    "Count words, characters, sentences, paragraphs and lines.",
                },
                {
                  icon: "🔍",
                  title: "SEO Analyzer",
                  description:
                    "Check title, meta description and basic SEO signals.",
                },
                {
                  icon: "🔀",
                  title: "Diff Checker",
                  description:
                    "Compare original and modified text.",
                },
                {
                  icon: "🎙️",
                  title: "Voice Typing",
                  description:
                    "Convert spoken Hindi or English into text.",
                },
                {
                  icon: "🔊",
                  title: "Text to Speech",
                  description:
                    "Listen to your written content.",
                },
                {
                  icon: "🔗",
                  title: "Slug Generator",
                  description:
                    "Generate SEO-friendly URL slugs.",
                },
              ].map((tool) => (
                <div
                  key={tool.title}
                  className={`
                    rounded-2xl
                    border
                    p-5
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:shadow-xl
                    ${
                      dark
                        ? "bg-[#161826]/70 border-white/10 hover:border-indigo-400/30"
                        : "bg-white border-black/5 hover:border-indigo-300"
                    }
                  `}
                >
                  <div className="text-3xl">
                    {tool.icon}
                  </div>

                  <h3 className="font-bold mt-3">
                    {tool.title}
                  </h3>

                  <p className="text-xs opacity-60 mt-1 leading-5">
                    {tool.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* =====================================================
              WHAT IS CHARACTER COUNTER
          ====================================================== */}

          <section
            className={`${cardClass} mt-8`}
          >
            <h2 className="text-2xl font-extrabold">
              What Is a Character Counter?
            </h2>

            <div className="mt-4 space-y-4 text-sm leading-7 opacity-80">
              <p>
                A character counter is an online
                writing tool that calculates how
                many characters are present in a
                piece of text. Depending on the
                selected calculation, characters
                may include letters, numbers,
                punctuation marks, spaces and
                special Unicode characters.
              </p>

              <p>
                Character counting is especially
                useful when a website, application,
                social-media platform, form or
                search engine places a limit on the
                amount of text that can be entered.
              </p>

              <p>
                Textlyzer provides more than a
                simple character count. It also
                provides word count, sentence count,
                paragraph count, line count, emoji
                count, reading time, speaking time,
                social-media limits and basic SEO
                analysis.
              </p>

              <p>
                The editor supports English, Hindi
                and mixed Hinglish content. This
                makes it useful for bloggers,
                students, creators and anyone who
                regularly writes multilingual text.
              </p>
            </div>
          </section>

          {/* =====================================================
              WHO BENEFITS
          ====================================================== */}

          <section
            className={`${cardClass} mt-5`}
          >
            <h2 className="text-2xl font-extrabold">
              Who Can Benefit From a Character
              Counter?
            </h2>

            <div className="grid md:grid-cols-2 gap-4 mt-5">
              {[
                [
                  "✍️ Content Writers",
                  "Writers can quickly check article length, paragraph structure and overall readability.",
                ],
                [
                  "📱 Social Media Creators",
                  "Creators can check whether captions, posts and descriptions fit platform limits.",
                ],
                [
                  "🔍 SEO Professionals",
                  "SEO users can analyze title and meta-description length and generate slugs.",
                ],
                [
                  "🎓 Students",
                  "Students can monitor assignment length, essays, reports and writing goals.",
                ],
                [
                  "👨‍🏫 Teachers",
                  "Teachers can prepare writing exercises and set word or character targets.",
                ],
                [
                  "▶️ YouTubers",
                  "YouTubers can check video titles, descriptions and promotional text.",
                ],
                [
                  "💼 Freelancers",
                  "Freelancers can quickly prepare client content and stay within specified limits.",
                ],
                [
                  "📰 Bloggers & Journalists",
                  "Useful for headlines, summaries, articles, captions and structured writing.",
                ],
              ].map(
                ([title, description]) => (
                  <div
                    key={title}
                    className={`
                      p-4
                      rounded-xl
                      border
                      transition-all
                      duration-300
                      hover:-translate-y-1
                      ${
                        dark
                          ? "bg-[#1b1e30] border-white/10"
                          : "bg-[#f8f9ff] border-black/5"
                      }
                    `}
                  >
                    <h3 className="font-bold">
                      {title}
                    </h3>

                    <p className="text-xs opacity-60 mt-2 leading-6">
                      {description}
                    </p>
                  </div>
                )
              )}
            </div>
          </section>

          {/* =====================================================
              USER GUIDE
          ====================================================== */}

          <section
            className={`${cardClass} mt-5`}
          >
            <button
              onClick={() =>
                setShowGuide(
                  !showGuide
                )
              }
              className="w-full flex items-center justify-between text-left"
            >
              <div>
                <h2 className="text-2xl font-extrabold">
                  📚 Complete User Guide
                </h2>

                <p className="text-xs opacity-50 mt-1">
                  Learn how to use Textlyzer
                  effectively.
                </p>
              </div>

              <span className="text-2xl">
                {showGuide
                  ? "−"
                  : "+"}
              </span>
            </button>

            {showGuide && (
              <div className="mt-6 space-y-6 text-sm leading-7 opacity-80">
                <div>
                  <h3 className="font-bold text-base">
                    1. Start Writing
                  </h3>

                  <p className="mt-2">
                    Click inside the main editor
                    and start typing, or paste
                    existing content. The statistics
                    update automatically as your
                    content changes.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-base">
                    2. Use Rich Text Formatting
                  </h3>

                  <p className="mt-2">
                    Select text and use Bold,
                    Italic, Underline, H1, H2,
                    lists, quote and link buttons.
                    Unlike Markdown-based editors,
                    the formatting toolbar does not
                    insert visible symbols such as
                    <code className="mx-1">
                      **
                    </code>
                    or
                    <code className="mx-1">
                      #
                    </code>
                    into your final text.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-base">
                    3. Character and Word Count
                  </h3>

                  <p className="mt-2">
                    The statistics cards show
                    characters, characters without
                    spaces, words, sentences,
                    paragraphs, lines, letters,
                    numbers, spaces, punctuation and
                    emojis.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-base">
                    4. Clean Your Text
                  </h3>

                  <p className="mt-2">
                    Open the Clean menu to remove
                    extra spaces, empty lines and
                    duplicate lines. You can also
                    find and replace specific text.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-base">
                    5. Duplicate Removal
                  </h3>

                  <p className="mt-2">
                    The duplicate remover processes
                    each line, normalizes accidental
                    spaces and preserves the first
                    occurrence. You can choose
                    case-sensitive or
                    case-insensitive detection.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-base">
                    6. SEO Analysis
                  </h3>

                  <p className="mt-2">
                    Enter your SEO title and meta
                    description to check their
                    character lengths. You can also
                    generate an SEO-friendly slug and
                    preview how the result may look
                    in a search-result style card.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-base">
                    7. Writing Goals
                  </h3>

                  <p className="mt-2">
                    Set a daily word target and
                    monitor your progress through an
                    animated progress bar. This is
                    useful for articles, assignments,
                    books and daily writing practice.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-base">
                    8. Keyword Analysis
                  </h3>

                  <p className="mt-2">
                    The Analyze section identifies
                    frequently used words and shows
                    their relative frequency. Common
                    stop words are excluded from the
                    basic analysis.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-base">
                    9. Voice Typing
                  </h3>

                  <p className="mt-2">
                    Click Voice and speak into a
                    supported browser. Chrome provides
                    the best compatibility with the
                    Web Speech API. Hindi voice input
                    is configured using hi-IN.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-base">
                    10. Text to Speech
                  </h3>

                  <p className="mt-2">
                    Use Speak to listen to your
                    current document. The application
                    automatically chooses Hindi or
                    English based on the detected text.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-base">
                    11. Export Your Work
                  </h3>

                  <p className="mt-2">
                    Export your content as TXT or
                    HTML. HTML export preserves rich
                    text formatting more effectively
                    than plain text.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-base">
                    12. Dark and Light Mode
                  </h3>

                  <p className="mt-2">
                    Use the theme button in the
                    header to switch between dark and
                    light appearance. The preference
                    is saved locally.
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* =====================================================
              FAQ
          ====================================================== */}

          <section
            className={`${cardClass} mt-5`}
          >
            <h2 className="text-2xl font-extrabold">
              ❓ Frequently Asked Questions
            </h2>

            <div className="mt-5 space-y-3">
              {[
                [
                  "What is a character counter?",
                  "A character counter is a tool that calculates the number of characters in your text. Depending on the statistic, spaces and special characters may also be included.",
                ],
                [
                  "What is the difference between characters and words?",
                  "A character is an individual letter, number, space or symbol, while a word is a group of characters separated by whitespace.",
                ],
                [
                  "Are spaces counted?",
                  "Yes. Textlyzer provides both total characters and characters without spaces, so you can compare both values.",
                ],
                [
                  "Does the tool support Hindi?",
                  "Yes. The editor supports Hindi, English and mixed Hinglish text.",
                ],
                [
                  "Does it count emojis?",
                  "Yes. The application includes a Unicode-aware emoji counter for common emoji ranges.",
                ],
                [
                  "Can I use the tool on mobile?",
                  "Yes. The interface is responsive and designed to work on phones, tablets and desktop screens.",
                ],
                [
                  "How does the duplicate remover work?",
                  "It checks each line, normalizes repeated spaces and removes duplicate lines while keeping the first occurrence.",
                ],
                [
                  "Can duplicate detection be case-sensitive?",
                  "Yes. Enable the case-sensitive option when CLEAN → Remove Duplicates should treat uppercase and lowercase versions as different.",
                ],
                [
                  "Why were ** and # appearing in my text?",
                  "Markdown formatting inserts symbols such as ** and # as plain text when used inside a normal textarea. Textlyzer now uses a rich-text editor so toolbar formatting is applied visually instead.",
                ],
                [
                  "How do I make text bold?",
                  "Select text in the editor and click the B button, or use Ctrl+B on Windows/Linux or Command+B on macOS.",
                ],
                [
                  "How do I create an H1 heading?",
                  "Place your cursor inside a paragraph or select the relevant text and click H1 in the formatting toolbar.",
                ],
                [
                  "Can I add links?",
                  "Yes. Select the text, click the link button and enter the destination URL.",
                ],
                [
                  "How is reading time calculated?",
                  "Reading time is estimated using approximately 225 words per minute.",
                ],
                [
                  "How is speaking time calculated?",
                  "Speaking time is estimated using approximately 150 words per minute.",
                ],
                [
                  "Can I set a writing goal?",
                  "Yes. Open GOALS and enter your desired daily word target. The progress bar updates automatically.",
                ],
                [
                  "Can I check social-media character limits?",
                  "Yes. The COUNT section provides quick comparisons for several common platforms and content types.",
                ],
                [
                  "What is an SEO title?",
                  "An SEO title is the title associated with a webpage and is commonly displayed in search-engine results. Textlyzer provides a length check and preview.",
                ],
                [
                  "What is a meta description?",
                  "A meta description is a short description associated with a webpage. Textlyzer provides a basic 150–160 character length check.",
                ],
                [
                  "Does Textlyzer save my writing?",
                  "The current application stores the editor content locally in the browser using localStorage. It does not require a server database for the editor draft.",
                ],
                [
                  "Does the tool require an account?",
                  "The core editor does not require an account or login.",
                ],
                [
                  "Can I export my writing?",
                  "Yes. You can export the current content as TXT or HTML.",
                ],
                [
                  "Does dark mode save automatically?",
                  "Yes. The selected theme is stored locally in the browser.",
                ],
              ].map(
                ([question, answer]) => (
                  <details
                    key={question}
                    className={`
                      group
                      rounded-xl
                      border
                      p-4
                      transition-all
                      duration-300
                      hover:-translate-y-0.5
                      ${
                        dark
                          ? "bg-[#1a1d2c] border-white/10"
                          : "bg-[#fafaff] border-black/5"
                      }
                    `}
                  >
                    <summary className="cursor-pointer font-bold text-sm list-none flex justify-between gap-4">
                      <span>
                        {question}
                      </span>

                      <span className="text-indigo-400 group-open:rotate-45 transition-transform">
                        +
                      </span>
                    </summary>

                    <p className="text-xs opacity-65 mt-3 leading-6">
                      {answer}
                    </p>
                  </details>
                )
              )}
            </div>
          </section>

          {/* =====================================================
              PRIVACY
          ====================================================== */}

          <section
            className={`${cardClass} mt-5 mb-8`}
          >
            <h2 className="text-xl font-extrabold">
              🔐 Privacy & Local Processing
            </h2>

            <p className="text-sm opacity-70 leading-7 mt-3">
              Textlyzer is designed around a
              privacy-first client-side workflow.
              The editor draft and theme preference
              are stored locally in your browser.
              No server-side database is required
              for the core character-counting
              functionality.
            </p>

            <p className="text-xs opacity-50 mt-3">
              Note: browser speech-recognition
              behavior depends on the browser and
              operating system. Voice features may
              use browser-provided speech services.
            </p>
          </section>
        </main>

        {/* FOOTER */}

        <footer
          className={`
            border-t
            py-8
            text-center
            ${
              dark
                ? "border-white/10"
                : "border-black/10"
            }
          `}
        >
          <div className="font-bold">
            Text
            <span className="text-indigo-400">
              lyzer
            </span>
          </div>

          <p className="text-xs opacity-40 mt-2">
            Advanced Character Counter &
            Writing Assistant
          </p>

          <p className="text-[10px] opacity-30 mt-4">
            © 2026 Textlyzer. All rights
            reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}
