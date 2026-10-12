"use client"
import { useEffect, useMemo, useRef, useState } from "react"

export default function WordCounterPage() {
  const [text, setText] = useState("Welcome to Advanced Word Counter Tool! Type or speak something...")
  const [lang, setLang] = useState("en-US")
  const [isListening, setIsListening] = useState(false)
  const [copied, setCopied] = useState(false)
  const editorRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)

  const stats = useMemo(() => {
    const chars = text.length
    const charsNoSpace = text.replace(/\s/g, "").length
    const words = text.trim()? text.trim().split(/\s+/).length : 0
    const lines = text? text.split(/\n/).length : 0
    const sentences = text.trim()? (text.match(/[^.!?]+[.!?]+/g) || []).length : 0
    const paragraphs = text.trim()? text.trim().split(/\n\s*\n/).length : 0
    const reading = Math.ceil(words / 200)
    const speaking = Math.ceil(words / 130)
    return { chars, charsNoSpace, words, lines, sentences, paragraphs, reading, speaking }
  }, [text])

  const handleInput = () => {
    if (editorRef.current) {
      const currentText = editorRef.current.innerText || ""
      if (currentText!== text) setText(currentText)
    }
  }

  const clearAll = () => {
    setText("")
    if (editorRef.current) editorRef.current.innerText = ""
  }

  const toggleVoice = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) { alert("Chrome me kholo"); return }
    if (isListening) {
      try { recognitionRef.current?.stop() } catch {}
      setIsListening(false)
      return
    }
    const rec = new SpeechRecognition()
    recognitionRef.current = rec
    rec.lang = lang
    rec.continuous = false
    rec.interimResults = false
    rec.onstart = () => setIsListening(true)
    rec.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      if (editorRef.current) {
        editorRef.current.focus()
        const newText = text + (text? " " : "") + transcript
        setText(newText)
        editorRef.current.innerText = newText
        const range = document.createRange()
        const sel = window.getSelection()
        range.selectNodeContents(editorRef.current)
        range.collapse(false)
        sel?.removeAllRanges()
        sel?.addRange(range)
      }
    }
    rec.onend = () => setIsListening(false)
    rec.onerror = (e: any) => {
      setIsListening(false)
      if (e.error === 'not-allowed') alert("Mic Allow karo - Lock icon par click karo")
    }
    rec.start()
  }

  const copyText = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerText!== text) {
      editorRef.current.innerText = text
    }
  }, [])

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-white via-red-50 to-white">
        <div className="absolute -top-40 -left-40 h-[32rem] w-[32rem] rounded-full bg-red-500/20 blur-[100px]" />
      </div>
      <div className="max-w-6xl mx-auto px-4 py-10">
        <header className="text-center">
          <span className="inline-flex rounded-full border border-red-200 bg-white/70 px-4 py-1.5 text-xs font-semibold text-red-600">100% Free • No Signup • Private</span>
          <h1 className="mt-6 text-4xl sm:text-6xl font-black">Advanced <span className="text-red-600">Word Counter</span></h1>
          <p className="mx-auto mt-4 max-w-2xl text-slate-600">Count words, characters, sentences, paragraphs with voice typing & reading time.</p>
        </header>

        <div className="mt-8 rounded-[28px] border border-red-100 bg-white/60 p-5 sm:p-7 backdrop-blur-2xl shadow-[0_20px_80px_-20px_rgba(220,38,38,0.25)]">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 text-xs">
            <div className="rounded-xl bg-white border px-3 py-2 text-center"><b>{stats.words}</b><br/>Words</div>
            <div className="rounded-xl bg-white border px-3 py-2 text-center"><b>{stats.chars}</b><br/>Chars</div>
            <div className="rounded-xl bg-white border px-3 py-2 text-center"><b>{stats.charsNoSpace}</b><br/>No Space</div>
            <div className="rounded-xl bg-white border px-3 py-2 text-center"><b>{stats.sentences}</b><br/>Sentences</div>
            <div className="rounded-xl bg-white border px-3 py-2 text-center"><b>{stats.paragraphs}</b><br/>Paras</div>
            <div className="rounded-xl bg-white border px-3 py-2 text-center"><b>{stats.lines}</b><br/>Lines</div>
            <div className="rounded-xl bg-red-50 border border-red-100 text-red-600 px-3 py-2 text-center"><b>{stats.reading}m</b><br/>Read</div>
            <div className="rounded-xl bg-red-50 border border-red-100 text-red-600 px-3 py-2 text-center"><b>{stats.speaking}m</b><br/>Speak</div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={toggleVoice} className={`rounded-full px-5 py-2 text-sm font-bold text-white ${isListening? "bg-slate-800 animate-pulse" : "bg-red-600"}`}>{isListening? "■ Stop" : "🎤 Voice"}</button>
            <button onClick={copyText} className="rounded-full bg-slate-900 text-white px-5 py-2 text-sm">{copied? "Copied!" : "Copy"}</button>
            <button onClick={clearAll} className="rounded-full bg-white border px-5 py-2 text-sm">Clear</button>
            <select value={lang} onChange={(e) => setLang(e.target.value)} className="rounded-full border bg-white px-4 py-2 text-sm"><option value="en-US">English</option><option value="hi-IN">Hindi</option></select>
          </div>

          <div ref={editorRef} contentEditable suppressContentEditableWarning onInput={handleInput} className="mt-5 min-h-[18rem] w-full rounded-2xl border border-red-100 bg-white/80 p-4 text-[15px] leading-7 outline-none focus:ring-4 focus:ring-red-100 overflow-auto" style={{ whiteSpace: "pre-wrap" }} />
        </div>

        <footer className="mt-16 text-center text-sm text-slate-400">© {new Date().getFullYear()} Word Counter Tool</footer>
      </div>
    </div>
  )
}
