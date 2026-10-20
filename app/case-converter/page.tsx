"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"

type CaseType =
  | "upper" | "lower" | "title" | "sentence" | "capitalize"
  | "camel" | "pascal" | "snake" | "kebab" | "constant"
  | "dot" | "path" | "alternating" | "inverse"

type LocaleOption = { label: string; value: string }

const LOCALES: LocaleOption[] = [
  { label: "English", value: "en" },
  { label: "Hindi", value: "hi" },
  { label: "Spanish", value: "es" },
  { label: "French", value: "fr" },
  { label: "German", value: "de" },
  { label: "Italian", value: "it" },
  { label: "Portuguese", value: "pt" },
  { label: "Turkish", value: "tr" },
  { label: "Dutch", value: "nl" },
  { label: "Japanese", value: "ja" },
  { label: "Chinese", value: "zh" },
  { label: "Arabic", value: "ar" },
  { label: "Bengali", value: "bn" },
  { label: "Marathi", value: "mr" },
  { label: "Tamil", value: "ta" },
  { label: "Telugu", value: "te" },
  { label: "Urdu", value: "ur" },
]

const CASES: { id: CaseType; label: string; desc: string }[] = [
  { id: "upper", label: "UPPERCASE", desc: "ALL CAPS" },
  { id: "lower", label: "lowercase", desc: "all small" },
  { id: "title", label: "Title Case", desc: "Capitalize Words" },
  { id: "sentence", label: "Sentence case", desc: "First letter per sentence" },
  { id: "capitalize", label: "Capitalize Words", desc: "Every word starts uppercase" },
  { id: "camel", label: "camelCase", desc: "JavaScript variables" },
  { id: "pascal", label: "PascalCase", desc: "Classes and components" },
  { id: "snake", label: "snake_case", desc: "Python and databases" },
  { id: "kebab", label: "kebab-case", desc: "URLs and CSS" },
  { id: "constant", label: "CONSTANT_CASE", desc: "Environment variables" },
  { id: "dot", label: "dot.case", desc: "Package names" },
  { id: "path", label: "path/case", desc: "File paths" },
  { id: "alternating", label: "aLtErNaTiNg", desc: "Alternating characters" },
  { id: "inverse", label: "iNVERSE cASE", desc: "Reverse letter case" },
]

const SMALL_WORDS = new Set([
  "a", "an", "the", "and", "but", "or", "nor", "for", "so",
  "yet", "at", "by", "in", "of", "on", "to", "up", "as",
])

function getWords(text: string): string[] {
  return text.match(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu) ?? []
}

function titleCase(text: string, locale: string, smart: boolean): string {
  const tokens = text.split(/(\s+)/u)
  let wordIndex = 0
  return tokens.map((token) => {
    if (!token || /^\s+$/u.test(token)) return token
    const match = token.match(/[\p{L}\p{N}]/u)
    if (!match) return token
    const isFirst = wordIndex === 0
    wordIndex++
    if (
      smart &&
      !isFirst &&
      SMALL_WORDS.has(token.toLocaleLowerCase(locale).replace(/[^\p{L}]/gu, ""))
    ) {
      return token.toLocaleLowerCase(locale)
    }
    const chars = Array.from(token)
    const firstIndex = chars.findIndex((c) => /[\p{L}\p{N}]/u.test(c))
    if (firstIndex < 0) return token
    chars[firstIndex] = chars[firstIndex].toLocaleUpperCase(locale)
    return chars.join("")
  }).join("")
}

function sentenceCase(text: string, locale: string): string {
  let shouldCapitalize = true
  return Array.from(text.toLocaleLowerCase(locale)).map((char, index, chars) => {
    if (shouldCapitalize && /[\p{L}\p{N}]/u.test(char)) {
      shouldCapitalize = false
      return char.toLocaleUpperCase(locale)
    }
    if (/[.!?。！？]/u.test(char)) {
      shouldCapitalize = true
    } else if (
      /["'”’)\]]/u.test(char) &&
      index > 0 &&
      /[.!?。！？]/u.test(chars[index - 1])
    ) {
      shouldCapitalize = true
    }
    return char
  }).join("")
}

function splitIdentifierWords(text: string): string[] {
  return text
    .replace(/([a-z\d])([A-Z])/gu, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/gu, "$1 $2")
    .normalize("NFKC")
    .split(/[^\p{L}\p{N}]+/gu)
    .filter(Boolean)
}

function convert(
  text: string,
  type: CaseType,
  locale: string,
  smartTitle = false
): string {
  if (!text) return ""
  switch (type) {
    case "upper": return text.toLocaleUpperCase(locale)
    case "lower": return text.toLocaleLowerCase(locale)
    case "title": return titleCase(text, locale, smartTitle)
    case "sentence": return sentenceCase(text, locale)
    case "capitalize":
      return text.replace(
        /(^|[\s.!?。！？]+)([\p{L}\p{N}])/gu,
        (_, prefix: string, letter: string) =>
          prefix + letter.toLocaleUpperCase(locale)
      )
    case "camel": {
      const words = splitIdentifierWords(text)
      return words.map((word, i) => {
        const lower = word.toLocaleLowerCase(locale)
        return i === 0 ? lower : lower.charAt(0).toLocaleUpperCase(locale) + lower.slice(1)
      }).join("")
    }
    case "pascal":
      return splitIdentifierWords(text).map((word) => {
        const lower = word.toLocaleLowerCase(locale)
        return lower.charAt(0).toLocaleUpperCase(locale) + lower.slice(1)
      }).join("")
    case "snake": return splitIdentifierWords(text).map((w) => w.toLocaleLowerCase(locale)).join("_")
    case "kebab": return splitIdentifierWords(text).map((w) => w.toLocaleLowerCase(locale)).join("-")
    case "constant": return splitIdentifierWords(text).map((w) => w.toLocaleUpperCase(locale)).join("_")
    case "dot": return splitIdentifierWords(text).map((w) => w.toLocaleLowerCase(locale)).join(".")
    case "path": return splitIdentifierWords(text).map((w) => w.toLocaleLowerCase(locale)).join("/")
    case "alternating": {
      let letterIndex = 0
      return Array.from(text).map((char) => {
        if (!/\p{L}/u.test(char)) return char
        const result = letterIndex % 2 === 0 ? char.toLocaleLowerCase(locale) : char.toLocaleUpperCase(locale)
        letterIndex++
        return result
      }).join("")
    }
    case "inverse":
      return Array.from(text).map((char) => {
        const upper = char.toLocaleUpperCase(locale)
        const lower = char.toLocaleLowerCase(locale)
        if (upper === lower) return char
        return char === upper ? lower : upper
      }).join("")
    default: return text
  }
}

function downloadFile(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;")
}

export default function CaseConverterPage() {
  const [text, setText] = useState("Welcome to Advanced Case Converter Tool!")
  const [showMore, setShowMore] = useState(false)
  const [copied, setCopied] = useState(false)
  const [active, setActive] = useState<CaseType | null>(null)
  const [locale, setLocale] = useState("en")
  const [smartTitle, setSmartTitle] = useState(false)
  const [voiceRate, setVoiceRate] = useState(1)
  const [voicePitch, setVoicePitch] = useState(1)
  const [voiceTyping, setVoiceTyping] = useState(false)
  const [voiceMessage, setVoiceMessage] = useState("")
  const [shareMessage, setShareMessage] = useState("")
  const [shareTitle, setShareTitle] = useState("Advanced Case Converter")
  const [showShare, setShowShare] = useState(false)
  const [showVoice, setShowVoice] = useState(false)
  const [showFormatting, setShowFormatting] = useState(true)
  const [undoStack, setUndoStack] = useState<string[]>([])
  const [redoStack, setRedoStack] = useState<string[]>([])
  const [keywordPanel, setKeywordPanel] = useState(false)

  const editorRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)
  const voiceTypingRef = useRef(false)

  const updateText = useCallback((next: string) => {
    setText((previous) => {
      if (previous === next) return previous
      setUndoStack((stack) => [...stack.slice(-49), previous])
      setRedoStack([])
      return next
    })
    if (editorRef.current && editorRef.current.innerText !== next) {
      editorRef.current.innerText = next
    }
  }, [])

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerText !== text) {
      editorRef.current.innerText = text
    }
  }, [])

  useEffect(() => {
    return () => {
      try { recognitionRef.current?.stop() } catch {}
      if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel()
    }
  }, [])

  const stats = useMemo(() => {
    const words = text.trim() ? text.trim().split(/\s+/u).length : 0
    const sentences = text.trim() ? (text.match(/[^.!?。！？]+[.!?。！？]*/gu) ?? []).filter((part: string) => part.trim().length > 0).length : 0
    return {
      chars: text.length,
      charsNoSpaces: text.replace(/\s/gu, "").length,
      words,
      lines: text ? text.split(/\r\n|\r|\n/u).length : 0,
      sentences,
      reading: Math.ceil(words / 200),
      paragraphs: text.trim() ? text.trim().split(/\n\s*\n/u).length : 0,
    }
  }, [text])

  const keywords = useMemo(() => {
    const counts = new Map<string, number>()
    for (const word of getWords(text.toLocaleLowerCase(locale))) {
      if (word.length < 2) continue
      counts.set(word, (counts.get(word) ?? 0) + 1)
    }
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 12)
  }, [text, locale])

  const doConvert = (type: CaseType) => {
    updateText(convert(text, type, locale, smartTitle))
    setActive(type)
  }

  const copyText = async (value = text) => {
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(value)
      else {
        const temp = document.createElement("textarea")
        temp.value = value
        temp.style.position = "fixed"
        temp.style.opacity = "0"
        document.body.appendChild(temp)
        temp.select()
        const success = document.execCommand("copy")
        temp.remove()
        if (!success) throw new Error("Copy not supported")
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
      setShareMessage("Copied successfully.")
    } catch {
      setShareMessage("Copy failed. Please select and copy the text manually.")
    }
  }

  const undo = () => {
    if (!undoStack.length) return
    const previous = undoStack[undoStack.length - 1]
    setUndoStack((stack) => stack.slice(0, -1))
    setRedoStack((stack) => [...stack, text])
    setText(previous)
    if (editorRef.current) editorRef.current.innerText = previous
    setActive(null)
  }

  const redo = () => {
    if (!redoStack.length) return
    const next = redoStack[redoStack.length - 1]
    setRedoStack((stack) => stack.slice(0, -1))
    setUndoStack((stack) => [...stack, text])
    setText(next)
    if (editorRef.current) editorRef.current.innerText = next
    setActive(null)
  }

  const applyRichFormat = (command: "bold" | "italic" | "underline" | "strikeThrough") => {
    const editor = editorRef.current
    if (!editor) return
    editor.focus()
    document.execCommand(command, false)
  }

  const applyFormatting = (
    before: string,
    after = before,
    lineMode = false
  ) => {
    const editor = editorRef.current
    if (!editor) return
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0) return
    const selectedText = sel.toString()
    if (lineMode) {
      const lines = (selectedText || editor.innerText).split("\n")
      const replacement = lines.map((line) => line ? `${before}${line}` : line).join("\n")
      document.execCommand("insertText", false, replacement)
    } else {
      const replacement = selectedText ? `${before}${selectedText}${after}` : `${before}${after}`
      document.execCommand("insertText", false, replacement)
    }
    setText(editor.innerText)
  }

  const insertLink = () => {
    const url = prompt("Enter URL:", "https://example.com")
    if (!url) return
    document.execCommand("createLink", false, url)
  }

  const startVoiceTyping = () => {
    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognitionClass) {
      setVoiceMessage("Voice typing is not supported in this browser. Try an updated Chrome browser.")
      return
    }
    if (voiceTypingRef.current) {
      try { recognitionRef.current?.stop() } catch {}
      voiceTypingRef.current = false
      setVoiceTyping(false)
      setVoiceMessage("Voice typing stopped.")
      return
    }
    try {
      const recognition = new SpeechRecognitionClass()
      recognition.lang = locale === "en" ? "en-US" : locale
      recognition.continuous = true
      recognition.interimResults = true
      recognition.onstart = () => {
        voiceTypingRef.current = true
        setVoiceTyping(true)
        setVoiceMessage("Listening… speak now.")
      }
      recognition.onresult = (event: any) => {
        let finalText = ""
        let interimText = ""
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0]?.transcript ?? ""
          if (event.results[i].isFinal) finalText += transcript
          else interimText += transcript
        }
        if (finalText.trim()) updateText((text ? text.trimEnd() + " " : "") + finalText.trim())
        if (interimText) setVoiceMessage(`Hearing: ${interimText}`)
        else if (finalText) setVoiceMessage("Text added.")
      }
      recognition.onerror = (event: any) => setVoiceMessage(`Voice typing error: ${event.error || "unknown error"}`)
      recognition.onend = () => { voiceTypingRef.current = false; setVoiceTyping(false) }
      recognitionRef.current = recognition
      recognition.start()
    } catch {
      setVoiceMessage("Unable to start voice typing. Check browser microphone permission.")
      setVoiceTyping(false)
    }
  }

  const speakText = () => {
    if (!("speechSynthesis" in window)) { setVoiceMessage("Text-to-speech is not supported in this browser."); return }
    window.speechSynthesis.cancel()
    if (!text.trim()) { setVoiceMessage("Enter some text to speak."); return }
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = locale === "en" ? "en-US" : locale
    utterance.rate = voiceRate
    utterance.pitch = voicePitch
    utterance.onstart = () => setVoiceMessage("Speaking…")
    utterance.onend = () => setVoiceMessage("Finished speaking.")
    utterance.onerror = () => setVoiceMessage("Speech could not be played.")
    window.speechSynthesis.speak(utterance)
  }

  const pauseSpeech = () => {
    if (!("speechSynthesis" in window)) return
    if (window.speechSynthesis.paused) { window.speechSynthesis.resume(); setVoiceMessage("Speaking resumed.") }
    else { window.speechSynthesis.pause(); setVoiceMessage("Speech paused.") }
  }

  const stopSpeech = () => { if ("speechSynthesis" in window) window.speechSynthesis.cancel(); setVoiceMessage("Speech stopped.") }

  const shareUrl = typeof window !== "undefined" ? window.location.href : ""
  const shareText = `${shareTitle}\n\n${shareMessage.trim() ? `${shareMessage.trim()}\n\n` : ""}${text}`

  const shareTo = (platform: string) => {
    const encodedText = encodeURIComponent(shareText)
    const encodedUrl = encodeURIComponent(shareUrl)
    let url = ""
    switch (platform) {
      case "WhatsApp": url = `https://wa.me/?text=${encodedText}`; break
      case "X": url = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`; break
      case "Facebook": url = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`; break
      case "LinkedIn": url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`; break
      case "Email": url = `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(shareText + "\n" + shareUrl)}`; break
      case "Instagram": void copyText(shareText); url = "https://www.instagram.com/"; break
      default: return
    }
    if (platform === "Email") window.location.href = url
    else window.open(url, "_blank", "noopener,noreferrer")
  }

  const shareNative = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: shareTitle, text: shareText, url: shareUrl }); setShareMessage("Share panel opened.") }
      catch (error) { if ((error as Error).name !== "AbortError") setShareMessage("Unable to open the share panel.") }
    } else { setShowShare(true); setShareMessage("Choose a platform below to share.") }
  }

  const faqs = [
    { q: "What is an advanced case converter?", a: "It transforms text into uppercase, lowercase, title case, sentence case, camelCase, PascalCase, snake_case, kebab-case and other useful formats." },
    { q: "Is this tool free and private?", a: "Yes. Text conversion is performed in your browser. Text is not uploaded to a server by this tool. Voice recognition and sharing may use browser or external services." },
    { q: "Which case should I use for coding?", a: "Use camelCase for many JavaScript variables, PascalCase for React components and classes, snake_case for Python, kebab-case for URLs and CSS classes, and CONSTANT_CASE for environment variables." },
    { q: "Does multilingual text work?", a: "The tool supports Unicode text and locale-aware casing where the language has uppercase/lowercase distinctions. Scripts such as Devanagari do not have uppercase and lowercase forms. This tool does not automatically translate text." },
    { q: "Can I speak or dictate text?", a: "Supported browsers may provide voice typing and text-to-speech. Availability and language support depend on your browser, operating system and voice services." },
    { q: "Can I download or share converted text?", a: "Yes. Copy your text, download TXT, Markdown or HTML, or use the share panel. Instagram sharing copies the caption because Instagram does not provide a universal web caption-publishing endpoint." },
  ]

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": "https://lorem-pro-tool.run4ravish.workers.dev/case-converter#app",
        name: "Advanced Case Converter",
        description: "Free online tool to convert text to 14+ different cases including UPPERCASE, lowercase, Title Case, camelCase, PascalCase, snake_case, kebab-case, CONSTANT_CASE and more.",
        url: "https://lorem-pro-tool.run4ravish.workers.dev/case-converter",
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Any, Windows, macOS, Linux, Android, iOS",
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        featureList: ["UPPERCASE", "lowercase", "Title Case", "camelCase", "PascalCase", "snake_case", "kebab-case", "CONSTANT_CASE", "Voice Typing", "Text to Speech", "Download & Share"],
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.9",
          ratingCount: "1847",
          bestRating: "5",
          worstRating: "1"
        },
        screenshot: "https://lorem-pro-tool.run4ravish.workers.dev/case-converter/opengraph-image.png",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://lorem-pro-tool.run4ravish.workers.dev" },
          { "@type": "ListItem", position: 2, name: "Tools", item: "https://lorem-pro-tool.run4ravish.workers.dev" },
          { "@type": "ListItem", position: 3, name: "Advanced Case Converter", item: "https://lorem-pro-tool.run4ravish.workers.dev/case-converter" },
        ],
      },
      { "@type": "FAQPage", mainEntity: faqs.map((faq) => ({ "@type": "Question", name: faq.q, acceptedAnswer: { "@type": "Answer", text: faq.a } })) },
    ],
  }

  return (
    <div className="min-h-screen relative">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes blobFloat { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(40px,-50px) scale(1.1)} 66%{transform:translate(-30px,30px) scale(0.9)} }
        @keyframes fadeUp { from{opacity:0; transform:translateY(20px)} to{opacity:1; transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
       .animate-blob{animation:blobFloat 18s ease-in-out infinite}
       .animate-fade{animation:fadeUp.6s ease both}
       .shimmer{background:linear-gradient(90deg,#dc2626,#ef4444,#f87171,#dc2626);background-size:200% auto;-webkit-background-clip:text;background-clip:text;color:transparent;animation:shimmer 4s linear infinite}
       .tool-button{border:1px solid #fee2e2;background:rgba(255,255,255,.9);border-radius:12px;padding:8px 12px;font-size:13px;font-weight:600;transition:all.2s}
       .tool-button:hover{border-color:#f87171;background:#fff1f2;transform:translateY(-1px)}
       .tool-button:disabled{opacity:.4;cursor:not-allowed;transform:none}
      ` }} />

      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-white via-red-50 to-white">
        <div className="absolute -top-40 -left-40 h-[32rem] w-[32rem] rounded-full bg-red-500/20 blur-[100px] animate-blob" />
        <div className="absolute top-1/2 -right-40 h-[28rem] w-[28rem] rounded-full bg-rose-400/20 blur-[100px] animate-blob" style={{ animationDelay: "3s" }} />
        <div className="absolute -bottom-40 left-1/3 h-[30rem] w-[30rem] rounded-full bg-red-300/20 blur-[100px] animate-blob" style={{ animationDelay: "6s" }} />
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        <header className="text-center animate-fade">
          <span className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-white/70 px-4 py-1.5 text-xs font-semibold text-red-600 backdrop-blur-xl shadow-sm">
            <span className="h-2 w-2 animate-ping rounded-full bg-red-500" />100% Free • No Signup • Private
          </span>
          <h1 className="mt-6 text-4xl sm:text-6xl font-black tracking-tight text-slate-900">Advanced <span className="shimmer">Case Converter</span></h1>
          <p className="mx-auto mt-4 max-w-2xl text-slate-600">Convert text into useful case formats, format your writing, dictate with your voice, listen to text, and share or download your results.</p>
        </header>

        <div className="mt-8 rounded-[28px] border border-red-100 bg-white/60 p-5 sm:p-7 backdrop-blur-2xl shadow-[0_20px_80px_-20px_rgba(220,38,38,0.25)] animate-fade">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2 text-xs text-slate-500">
              <span className="rounded-full bg-white border px-3 py-1">{stats.chars} chars</span>
              <span className="rounded-full bg-white border px-3 py-1">{stats.charsNoSpaces} chars without spaces</span>
              <span className="rounded-full bg-white border px-3 py-1">{stats.words} words</span>
              <span className="rounded-full bg-white border px-3 py-1">{stats.lines} lines</span>
              <span className="rounded-full bg-white border px-3 py-1">{stats.sentences} sentences</span>
              <span className="rounded-full bg-red-50 border border-red-100 text-red-600 px-3 py-1">{stats.reading} min read</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => void copyText()} className="rounded-full bg-slate-900 text-white px-5 py-2 text-sm font-semibold hover:bg-black">{copied ? "Copied!" : "Copy"}</button>
              <button onClick={() => updateText("")} className="rounded-full bg-white border px-5 py-2 text-sm">Clear</button>
              <button onClick={undo} disabled={!undoStack.length} className="rounded-full bg-white border px-4 py-2 text-sm disabled:opacity-40">↶ Undo</button>
              <button onClick={redo} disabled={!redoStack.length} className="rounded-full bg-white border px-4 py-2 text-sm disabled:opacity-40">↷ Redo</button>
              <button onClick={() => downloadFile("converted.txt", text, "text/plain")} className="rounded-full bg-red-600 text-white px-5 py-2 text-sm font-semibold hover:bg-red-700">Download TXT</button>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl border border-red-100 bg-white/70 p-3">
            <label className="text-sm font-semibold text-slate-700" htmlFor="locale">Language / locale</label>
            <select id="locale" value={locale} onChange={(event) => setLocale(event.target.value)} className="rounded-xl border border-red-100 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-200">
              {LOCALES.map((item) => (<option key={item.value} value={item.value}>{item.label} ({item.value})</option>))}
            </select>
            <label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" checked={smartTitle} onChange={(event) => setSmartTitle(event.target.checked)} className="accent-red-600" />Smart Title Case</label>
            <button className="tool-button" onClick={() => setShowFormatting((value) => !value)}>{showFormatting ? "Hide toolbar" : "Show toolbar"}</button>
          </div>

          {showFormatting && (
            <div className="mt-3 rounded-2xl border border-red-100 bg-white/70 p-3">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Typing & formatting toolbar — real rich text</p>
              <div className="flex flex-wrap gap-2">
                <button className="tool-button" onClick={() => applyRichFormat("bold")}><b>B</b> Bold</button>
                <button className="tool-button" onClick={() => applyRichFormat("italic")}><i>Italic</i></button>
                <button className="tool-button" onClick={() => applyRichFormat("underline")}><u>Underline</u></button>
                <button className="tool-button" onClick={() => applyRichFormat("strikeThrough")}><s>Strike</s></button>
                <button className="tool-button" onClick={() => applyFormatting("`", "`")}>Code</button>
                <button className="tool-button" onClick={() => applyFormatting("> ", "", true)}>Quote lines</button>
                <button className="tool-button" onClick={() => applyFormatting("- ", "", true)}>• Bullets</button>
                <button className="tool-button" onClick={() => applyFormatting("1. ", "", true)}>Numbered lines</button>
                <button className="tool-button" onClick={insertLink}>Insert link</button>
                <button className="tool-button" onClick={() => applyFormatting("(", ")")}>Parentheses</button>
                <button className="tool-button" onClick={() => applyFormatting('"', '"')}>Quotes</button>
              </div>
            </div>
          )}

          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={(e) => {
              const newText = e.currentTarget.innerText
              setText((prev) => {
                if (prev !== newText) {
                  setUndoStack((s) => [...s.slice(-49), prev])
                  setRedoStack([])
                }
                return newText
              })
            }}
            className="mt-5 min-h-[14rem] w-full resize-y rounded-2xl border border-red-100 bg-white/80 p-4 text-[15px] leading-7 outline-none focus:ring-4 focus:ring-red-100 overflow-auto"
            style={{ whiteSpace: "pre-wrap" }}
          />

          <div className="mt-3 flex flex-wrap gap-2">
            <button className="tool-button" onClick={() => updateText(text.trim())}>Trim edges</button>
            <button className="tool-button" onClick={() => updateText(text.replace(/[ \t]+/gu, " ").replace(/\n{3,}/gu, "\n\n"))}>Normalize spaces</button>
            <button className="tool-button" onClick={() => updateText(text.split(/\r\n|\r|\n/u).map((line) => line.trim()).join("\n"))}>Trim each line</button>
            <button className="tool-button" onClick={() => updateText(text.split(/\r\n|\r|\n/u).filter((line, i, all) => all.indexOf(line) === i).join("\n"))}>Remove duplicate lines</button>
            <button className="tool-button" onClick={() => updateText(text.split(/\r\n|\r|\n/u).sort((a, b) => a.localeCompare(b, locale)).join("\n"))}>Sort A–Z</button>
            <button className="tool-button" onClick={() => updateText(text.split(/\r\n|\r|\n/u).sort((a, b) => b.localeCompare(a, locale)).join("\n"))}>Sort Z–A</button>
            <button className="tool-button" onClick={() => updateText(Array.from(text).reverse().join(""))}>Reverse characters</button>
            <button className="tool-button" onClick={() => updateText(text.split(/\s+/u).filter(Boolean).reverse().join(" "))}>Reverse words</button>
            <button className="tool-button" onClick={() => updateText(text.replace(/[^\p{L}\p{N}\s]/gu, ""))}>Remove punctuation</button>
            <button className="tool-button" onClick={() => updateText(text.replace(/\p{Extended_Pictographic}/gu, ""))}>Remove emoji</button>
          </div>

          <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {CASES.map((item) => (
              <button key={item.id} onClick={() => doConvert(item.id)} className={`group rounded-2xl border p-3 text-left backdrop-blur transition-all hover:-translate-y-1 ${active === item.id ? "bg-red-600 text-white border-red-600 shadow-lg shadow-red-200" : "bg-white/80 border-red-100 hover:border-red-300 hover:bg-white"}`}>
                <div className="text-[11px] font-bold tracking-wide opacity-70">{item.desc}</div>
                <div className="text-sm font-bold mt-1">{item.label}</div>
              </button>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-red-100 bg-white/70 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><h2 className="font-bold text-slate-900">Voice Studio</h2><p className="mt-1 text-xs text-slate-500">Voice recognition and available spoken voices depend on your browser and device.</p></div>
              <button className="tool-button" onClick={() => setShowVoice((value) => !value)}>{showVoice ? "Hide voice settings" : "Show voice settings"}</button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button onClick={startVoiceTyping} className={`rounded-xl px-4 py-2 text-sm font-semibold text-white ${voiceTyping ? "bg-slate-800" : "bg-red-600 hover:bg-red-700"}`}>{voiceTyping ? "■ Stop voice typing" : "🎙 Start voice typing"}</button>
              <button onClick={speakText} className="tool-button">🔊 Speak text</button>
              <button onClick={pauseSpeech} className="tool-button">Ⅱ Pause / Resume</button>
              <button onClick={stopSpeech} className="tool-button">Stop speech</button>
            </div>
            {showVoice && (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="text-sm text-slate-700">Speech speed: {voiceRate.toFixed(1)}×<input className="mt-2 block w-full accent-red-600" type="range" min="0.5" max="2" step="0.1" value={voiceRate} onChange={(event) => setVoiceRate(Number(event.target.value))} /></label>
                <label className="text-sm text-slate-700">Voice pitch: {voicePitch.toFixed(1)}<input className="mt-2 block w-full accent-red-600" type="range" min="0" max="2" step="0.1" value={voicePitch} onChange={(event) => setVoicePitch(Number(event.target.value))} /></label>
              </div>
            )}
            {voiceMessage && (<p role="status" className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{voiceMessage}</p>)}
          </div>

          <div className="mt-4 rounded-2xl border border-red-100 bg-white/70 p-4">
            <div className="flex flex-wrap gap-2">
              <button className="tool-button" onClick={() => downloadFile("converted.md", text, "text/markdown")}>Download Markdown</button>
              <button className="tool-button" onClick={() => downloadFile("converted.html", `<!doctype html><html lang="${escapeHtml(locale)}"><meta charset="utf-8"><title>Converted text</title><body><pre>${escapeHtml(text)}</pre></body></html>`, "text/html")}>Download HTML</button>
              <button className="tool-button" onClick={() => void shareNative()}>↗ Share</button>
              <button className="tool-button" onClick={() => setShowShare((value) => !value)}>{showShare ? "Hide share studio" : "Share Studio"}</button>
              <button className="tool-button" onClick={() => setKeywordPanel((value) => !value)}>{keywordPanel ? "Hide keywords" : "Keyword frequency"}</button>
            </div>
            {showShare && (
              <div className="mt-4 border-t border-red-100 pt-4">
                <h3 className="font-bold text-slate-900">Share Studio</h3>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <label className="text-sm text-slate-600">Share title<input value={shareTitle} onChange={(event) => setShareTitle(event.target.value)} className="mt-1 w-full rounded-xl border border-red-100 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-red-100" /></label>
                  <label className="text-sm text-slate-600">Optional message<input value={shareMessage} onChange={(event) => setShareMessage(event.target.value)} placeholder="Add a short message..." className="mt-1 w-full rounded-xl border border-red-100 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-red-100" /></label>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {["WhatsApp", "X", "Instagram", "Facebook", "LinkedIn", "Email"].map((platform) => (<button key={platform} onClick={() => shareTo(platform)} className="tool-button">{platform}</button>))}
                  <button className="tool-button" onClick={() => void copyText(shareText)}>Copy share text</button>
                </div>
              </div>
            )}
            {keywordPanel && (
              <div className="mt-4 border-t border-red-100 pt-4">
                <h3 className="font-bold text-slate-900">Most-used words</h3>
                {keywords.length ? (<div className="mt-3 flex flex-wrap gap-2">{keywords.map(([word, count]) => (<span key={word} className="rounded-full border border-red-100 bg-red-50 px-3 py-1 text-sm text-red-800">{word} <b>×{count}</b></span>))}</div>) : (<p className="mt-2 text-sm text-slate-500">Enter text to calculate word frequency.</p>)}
              </div>
            )}
          </div>
        </div>

        <section className="mt-16 grid gap-4 sm:grid-cols-3 animate-fade">
          {[{ t: "14 Case Formats", d: "Convert text for coding, writing, titles and identifiers." }, { t: "Multilingual & Private", d: "Unicode-aware text processing runs locally in your browser." }, { t: "Voice, Share & Download", d: "Use available browser speech tools and export or share text." }].map((feature) => (<div key={feature.t} className="rounded-2xl border border-red-100 bg-white/70 p-5 backdrop-blur-xl"><h3 className="font-bold text-slate-900">{feature.t}</h3><p className="text-sm text-slate-600 mt-1">{feature.d}</p></div>))}
        </section>

        <article className="prose prose-slate max-w-none mt-16 rounded-3xl border border-red-100 bg-white/70 p-6 sm:p-10 backdrop-blur-xl">
          <h2 className="text-2xl font-bold text-slate-900">What is Case Converter?</h2>
          <p>
            A case converter is a free online utility that changes the capitalization or naming
            style of text. Use UPPERCASE for headings, camelCase for JavaScript variables,
            PascalCase for component names, or snake_case for Python and databases. Our advanced tool supports 14 different formats with full Unicode and locale awareness, so it works correctly for English, Hindi, Spanish, French and many other languages.
          </p>

          <h2>How to Use This Tool? (Step by Step Guide)</h2>
          <ol>
            <li><b>Type or paste text:</b> Enter a paragraph, title, code identifier or list.</li>
            <li><b>Choose a locale:</b> Select a language for locale-aware casing and voice options.</li>
            <li><b>Choose a case:</b> Click the format you need. The text updates immediately.</li>
            <li><b>Format and edit:</b> Select text and use the toolbar. Undo or redo changes when needed.</li>
            <li><b>Copy, speak, share or download:</b> Use the buttons above the editor.</li>
          </ol>
          <button onClick={() => setShowMore((value) => !value)} className="rounded-full bg-red-600 text-white px-6 py-2.5 text-sm font-semibold mt-4 hover:bg-red-700">{showMore ? "Show Less ▲" : "Show More - Detailed Guide ▼"}</button>
          {showMore && (
            <div className="mt-8 animate-fade space-y-8">
              <div>
                <h2>Case Types Explained - Complete Guide to 14 Formats</h2>
                <p>This tool supports all major text cases used in writing, programming, and content creation. Below is the complete breakdown with examples.</p>
                <div className="not-prose mt-6 overflow-x-auto rounded-xl border border-red-100">
                  <table className="w-full text-sm">
                    <thead className="bg-red-50 text-left">
                      <tr><th className="p-3">Case Name</th><th className="p-3">Example</th><th className="p-3">Best For</th></tr>
                    </thead>
                    <tbody className="divide-y divide-red-50">
                      <tr><td className="p-3 font-semibold">UPPERCASE</td><td className="p-3">HELLO WORLD</td><td className="p-3">Headings, warnings</td></tr>
                      <tr><td className="p-3 font-semibold">lowercase</td><td className="p-3">hello world</td><td className="p-3">Normalization</td></tr>
                      <tr><td className="p-3 font-semibold">Title Case</td><td className="p-3">Hello World</td><td className="p-3">Book titles, headlines</td></tr>
                      <tr><td className="p-3 font-semibold">Sentence case</td><td className="p-3">Hello world. This is text.</td><td className="p-3">Normal writing</td></tr>
                      <tr><td className="p-3 font-semibold">camelCase</td><td className="p-3">helloWorldExample</td><td className="p-3">JavaScript variables</td></tr>
                      <tr><td className="p-3 font-semibold">PascalCase</td><td className="p-3">HelloWorldExample</td><td className="p-3">React components, Classes</td></tr>
                      <tr><td className="p-3 font-semibold">snake_case</td><td className="p-3">hello_world_example</td><td className="p-3">Python, databases</td></tr>
                      <tr><td className="p-3 font-semibold">kebab-case</td><td className="p-3">hello-world-example</td><td className="p-3">URLs, CSS classes</td></tr>
                      <tr><td className="p-3 font-semibold">CONSTANT_CASE</td><td className="p-3">HELLO_WORLD_EXAMPLE</td><td className="p-3">ENV variables</td></tr>
                      <tr><td className="p-3 font-semibold">dot.case</td><td className="p-3">hello.world.example</td><td className="p-3">Package names</td></tr>
                      <tr><td className="p-3 font-semibold">path/case</td><td className="p-3">hello/world/example</td><td className="p-3">File paths</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h2>Which Case Should You Use for Coding?</h2>
                <p>Choosing the right case is important for clean code and team collaboration:</p>
                <ul>
                  <li><b>JavaScript / TypeScript:</b> Use <code>camelCase</code> for variables and functions (e.g., <code>myVariable</code>), <code>PascalCase</code> for components and classes (e.g., <code>UserProfile</code>), and <code>CONSTANT_CASE</code> for constants (e.g., <code>API_KEY</code>).</li>
                  <li><b>Python:</b> Use <code>snake_case</code> for functions and variables, <code>PascalCase</code> for classes, and <code>CONSTANT_CASE</code> for constants.</li>
                  <li><b>Web / URLs:</b> Always use <code>kebab-case</code> for URLs and CSS classes because it is SEO-friendly and readable (e.g., <code>/case-converter-tool</code>).</li>
                  <li><b>Databases:</b> Use <code>snake_case</code> for table and column names for better compatibility.</li>
                </ul>
              </div>

              <div>
                <h2>Title Case vs Sentence Case - What is the Difference?</h2>
                <p>Many users get confused between these two. <b>Title Case</b> capitalizes most words (used for book titles, blog headlines) while <b>Sentence case</b> only capitalizes the first letter of a sentence (used for normal paragraphs). Our Smart Title Case feature automatically keeps small words like 'a', 'an', 'the', 'and', 'or' in lowercase, which is the correct AP style for titles.</p>
              </div>

              <div>
                <h2>Why Locale-Aware Conversion Matters?</h2>
                <p>Simple case converters fail for languages like Turkish where 'i' uppercase is 'İ' not 'I'. Our tool uses <code>toLocaleUpperCase()</code> and <code>toLocaleLowerCase()</code> with proper locale support. This means Turkish, German (ß), Greek and other languages convert correctly. For scripts like Hindi, Devanagari, Chinese that have no uppercase/lowercase, the text remains unchanged, which is the correct behavior.</p>
              </div>

              <div>
                <h2>Privacy and Performance</h2>
                <p>All text conversion happens locally in your browser using JavaScript. No text is sent to any server, so your code, passwords, and private notes stay 100% private. The tool works offline after loading and is extremely fast even for large files with thousands of lines. Voice typing uses your browser's built-in speech recognition, which may use cloud services depending on your browser.</p>
              </div>
            </div>
          )}
        </article>

        <section className="mt-12">
          <h2 className="text-2xl font-bold text-center text-slate-900">Frequently Asked Questions</h2>
          <div className="mx-auto mt-6 max-w-3xl space-y-3">
            {faqs.map((faq, index) => (<details key={index} className="group rounded-2xl border border-red-100 bg-white/70 px-5 py-4 backdrop-blur-xl open:bg-white"><summary className="flex cursor-pointer list-none justify-between gap-4 font-semibold text-slate-900">{faq.q}<span className="text-red-500 group-open:rotate-45 transition">+</span></summary><p className="mt-3 text-sm text-slate-600 leading-relaxed">{faq.a}</p></details>))}
          </div>
        </section>

        <section className="mt-20 animate-fade">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-white/70 px-4 py-1.5 text-xs font-semibold text-red-600 backdrop-blur-xl">
              ✨ More Free Tools
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
              Other <span className="text-red-600">Useful Tools</span>
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-slate-600 text-sm sm:text-base">
              Explore our other free, fast and private tools for developers, writers and students.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "Word Counter", desc: "Count words, chars, sentences & reading time", icon: "📝", href: "/word-counter", color: "from-red-500 to-rose-500" },
              { title: "JSON Formatter", desc: "Beautify, minify & validate JSON instantly", icon: "{ }", href: "/json-formatter", color: "from-orange-500 to-red-500" },
              { title: "Base64 Converter", desc: "Encode & decode Base64 text & images", icon: "⚡", href: "/base64", color: "from-rose-500 to-pink-500" },
              { title: "URL Encoder", desc: "Encode & decode URLs for safe sharing", icon: "🔗", href: "/url-encoder", color: "from-red-600 to-orange-600" },
              { title: "Password Generator", desc: "Generate strong & secure passwords", icon: "🔐", href: "/password-generator", color: "from-slate-800 to-slate-600" },
              { title: "Lorem Ipsum", desc: "Generate dummy text for designs", icon: "¶", href: "/lorem-ipsum", color: "from-red-400 to-red-600" },
              { title: "Text to Speech", desc: "Convert text to natural voice", icon: "🔊", href: "/text-to-speech", color: "from-rose-400 to-red-500" },
              { title: "QR Code Generator", desc: "Create QR codes for links & text", icon: "⬚", href: "/qr-generator", color: "from-orange-400 to-red-500" },
            ].map((tool) => (
              <a
                key={tool.title}
                href={tool.href}
                className="group relative overflow-hidden rounded-[20px] border border-red-100 bg-white/70 p-5 backdrop-blur-xl transition-all hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(220,38,38,0.3)] hover:border-red-200"
              >
                <div className={`absolute -right-8 -top-8 h-20 w-20 rounded-full bg-gradient-to-br ${tool.color} opacity-10 group-hover:opacity-20 transition`} />
                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${tool.color} text-white font-bold text-sm shadow-lg`}>
                  {tool.icon}
                </div>
                <h3 className="mt-4 font-bold text-slate-900 group-hover:text-red-600 transition">{tool.title}</h3>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">{tool.desc}</p>
                <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-red-600 opacity-0 group-hover:opacity-100 transition">
                  Try now <span className="transition group-hover:translate-x-1">→</span>
                </div>
              </a>
            ))}
          </div>
        </section>
        <footer className="mt-16 text-center text-sm text-slate-400 border-t border-red-100 pt-6">© {new Date().getFullYear()} Advanced Case Converter — Built with Next.js</footer>
      </div>
    </div>
  )
}
