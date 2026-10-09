"use client";
import { useEffect, useMemo, useRef, useState } from "react";

type Tab = "count" | "clean" | "seo" | "goals" | "analyze" | "tools" | "diff";

function countEmoji(str: string): number {
  let c = 0;
  for (let i = 0; i < str.length; ) {
    const cp = str.codePointAt(i) || 0;
    if (
      (cp >= 0x1f300 && cp <= 0x1faff) ||
      (cp >= 0x2600 && cp <= 0x27bf) ||
      (cp >= 0x1f1e0 && cp <= 0x1f1ff)
    ) c++;
    i += cp > 0xffff? 2 : 1;
  }
  return c;
}

function removeEmojiSafe(str: string): string {
  let out = "";
  for (let i = 0; i < str.length; ) {
    const cp = str.codePointAt(i) || 0;
    const emoji =
      (cp >= 0x1f300 && cp <= 0x1faff) ||
      (cp >= 0x2600 && cp <= 0x27bf) ||
      (cp >= 0x1f1e0 && cp <= 0x1f1ff);
    if (!emoji) out += String.fromCodePoint(cp);
    i += cp > 0xffff? 2 : 1;
  }
  return out;
}

function countSyllables(w: string) {
  w = w.toLowerCase().replace(/[^a-z]/g, "");
  if (!w) return 0;
  if (w.length <= 3) return 1;
  w = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "").replace(/^y/, "");
  const m = w.match(/[aeiouy]{1,2}/g);
  return m? m.length : 1;
}

function escapeHtml(s: string) {
  return s
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;");
}

function plainTextToHtml(s: string) {
  return escapeHtml(s).replace(/\n/g, "<br>");
}

function normalizeLine(line: string, caseInsensitive = false) {
  const n = line.replace(/\u00a0/g, " ").trim().replace(/\s+/g, " ");
  return caseInsensitive? n.toLocaleLowerCase() : n;
}

function removeDuplicateLines(input: string, caseInsensitive = false) {
  const seen = new Set<string>();
  return input
  .split(/\r?\n/)
  .filter((line) => {
      const key = normalizeLine(line, caseInsensitive);
      if (!key) return true;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
  .join("\n")
  .replace(/\n{3,}/g, "\n\n");
}

function downloadFile(name: string, content: string, type = "text/plain") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
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
  const [duplicateCaseInsensitive, setDuplicateCaseInsensitive] = useState(false);
  const [showGuide, setShowGuide] = useState(true);

  const editorRef = useRef<HTMLDivElement>(null);
  const savedSelectionRef = useRef<Range | null>(null);
  const recognitionRef = useRef<any>(null);

  const syncEditor = (nextText: string) => {
    setText(nextText);
    if (editorRef.current) editorRef.current.innerHTML = plainTextToHtml(nextText);
  };

  const readEditor = () => editorRef.current?.innerText.replace(/\u00a0/g, " ")?? "";

  useEffect(() => {
    const saved = localStorage.getItem("adv_text");
    const savedHtml = localStorage.getItem("adv_html");
    const g = localStorage.getItem("adv_goal");
    const th = localStorage.getItem("theme");
    if (saved) setText(saved);
    if (g) setGoal(Number(g) || 1000);
    if (th === "light") setDark(false);
    requestAnimationFrame(() => {
      if (editorRef.current) editorRef.current.innerHTML = savedHtml || plainTextToHtml(saved || "");
    });
  }, []);

  useEffect(() => {
    localStorage.setItem("adv_text", text);
  }, [text]);
  useEffect(() => {
    localStorage.setItem("adv_goal", String(goal));
  }, [goal]);

  const stats = useMemo(() => {
    const chars = text.length;
    const charsNoSpace = text.replace(/\s/g, "").length;
    const words = text.trim()? text.trim().split(/\s+/).filter(Boolean).length : 0;
    const sentences = text.trim()? text.split(/[.!?]+/).filter((s) => s.trim()).length : 0;
    const paras = text.split(/\n+/).filter((s) => s.trim()).length;
    const lines = text? text.split(/\r?\n/).length : 0;
    const letters = Array.from(text).filter((c) => /[\p{L}]/u.test(c)).length;
    const numbers = Array.from(text).filter((c) => /[0-9]/.test(c)).length;
    const spaces = Array.from(text).filter((c) => /\s/.test(c)).length;
    const punctuation = Array.from(text).filter((c) => /[^\p{L}\p{N}\s]/u.test(c) &&!/\p{Extended_Pictographic}/u.test(c)).length;
    const emoji = countEmoji(text);
    let syll = 0;
    text.trim().split(/\s+/).forEach((w) => (syll += countSyllables(w)));
    const flesch = words && sentences? 206.835 - 1.015 * (words / sentences) - 84.6 * (syll / words) : 0;
    const reading = words? Math.max(1, Math.ceil(words / 225)) : 0;
    const speakingM = words? Math.max(1, Math.ceil(words / 150)) : 0;
    const stop = new Set(["the", "and", "is", "in", "to", "a", "of", "for", "on", "with", "this", "that", "are", "be", "it", "as", "at", "by", "from", "hai", "aur", "ke", "ka", "ko", "mein", "hain", "ki", "se"]);
    const freq: Record<string, number> = {};
    text.toLocaleLowerCase().split(/[^\p{L}\p{N}]+/u).filter((w) => w.length > 2 &&!stop.has(w)).forEach((w) => (freq[w] = (freq[w] || 0) + 1));
    const top = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 12);
    const maxFreq = top[0]?.[1] || 1;
    const lang = /[अ-ह]/.test(text)? (/[a-zA-Z]/.test(text)? "Hinglish" : "Hindi") : "English";
    return { chars, charsNoSpace, words, sentences, paras, lines, letters, numbers, spaces, punctuation, emoji, flesch, reading, speakingM, syll, top, maxFreq, lang };
  }, [text]);

  const seoScore = useMemo(() => {
    let s = 0;
    if (title.length >= 50 && title.length <= 60) s += 35;
    else if (title.length) s += 15;
    if (desc.length >= 150 && desc.length <= 160) s += 35;
    else if (desc.length) s += 15;
    if (stats.words > 300) s += 15;
    if (stats.top.length > 5) s += 15;
    return Math.min(100, s);
  }, [title, desc, stats]);

  const focusEditor = () => editorRef.current?.focus();

  const saveEditorSelection = () => {
    const editor = editorRef.current;
    const selection = window.getSelection();
    if (!editor ||!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    if (editor.contains(range.commonAncestorContainer)) {
      savedSelectionRef.current = range.cloneRange();
    }
  };

  const restoreSelection = () => {
    const editor = editorRef.current;
    const selection = window.getSelection();
    const saved = savedSelectionRef.current;
    if (!editor ||!selection ||!saved) return false;
    if (!editor.contains(saved.commonAncestorContainer)) return false;
    editor.focus();
    selection.removeAllRanges();
    selection.addRange(saved.cloneRange());
    return true;
  };

  const format = (command: string, value?: string) => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();
    // FIX: Bold/Italic/Underline ke liye hamesha restore
    if (["bold","italic","underline"].includes(command)) {
      restoreSelection();
    }
    const isListCommand = command === "insertUnorderedList" || command === "insertOrderedList";
    if (isListCommand) {
      restoreSelection();
      try { document.execCommand("defaultParagraphSeparator", false, "p"); } catch {}
      const sel = window.getSelection();
      const rangeBefore = sel?.rangeCount? sel.getRangeAt(0).cloneRange() : null;
      const beforeHtml = editor.innerHTML;
      document.execCommand(command, false);
      if (editor.innerHTML === beforeHtml && rangeBefore) {
        if (!rangeBefore.collapsed) {
          const txt = rangeBefore.toString();
          if (txt) {
            const list = document.createElement(command === "insertUnorderedList"? "ul" : "ol");
            txt.split(/\r?\n/).forEach((line) => {
              const li = document.createElement("li");
              li.textContent = line.trim()? line : "\u00a0";
              list.appendChild(li);
            });
            rangeBefore.deleteContents();
            rangeBefore.insertNode(list);
            const caret = document.createRange();
            caret.selectNodeContents(list.lastElementChild || list);
            caret.collapse(false);
            sel?.removeAllRanges();
            sel?.addRange(caret);
          }
        } else {
          const list = document.createElement(command === "insertUnorderedList"? "ul" : "ol");
          const li = document.createElement("li");
          li.innerHTML = "<br>";
          list.appendChild(li);
          rangeBefore.insertNode(list);
          const caret = document.createRange();
          caret.setStart(li, 0);
          caret.collapse(true);
          sel?.removeAllRanges();
          sel?.addRange(caret);
        }
      }
    } else {
      document.execCommand(command, false, value);
    }
    const html = editor.innerHTML;
    const next = readEditor();
    localStorage.setItem("adv_html", html);
    setText(next);
    setTimeout(saveEditorSelection, 0);
  };

  const formatBlock = (tag: "h1" | "h2" | "p" | "blockquote") => format("formatBlock", `<${tag}>`);
  const insertLink = () => {
    const url = window.prompt("Enter URL");
    if (url) format("createLink", url);
  };
  const onEditorInput = () => {
    const next = readEditor();
    setText(next);
    localStorage.setItem("adv_html", editorRef.current?.innerHTML || "");
  };
  const clearFormatting = () => {
    format("removeFormat");
    format("formatBlock", "<p>");
  };

  // FIX: Preserve H1/H2 while changing case
  const transformCasePreserve = (toUpper: boolean) => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();
    restoreSelection();
    const sel = window.getSelection();
    // If something selected, only transform selected part
    if (sel && sel.rangeCount > 0 &&!sel.isCollapsed && editor.contains(sel.getRangeAt(0).commonAncestorContainer)) {
      const range = sel.getRangeAt(0);
      const walker = document.createTreeWalker(range.commonAncestorContainer, NodeFilter.SHOW_TEXT, {
        acceptNode: (node) => range.intersectsNode(node)? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
      } as any);
      const nodes: Text[] = [];
      let n: any;
      while ((n = walker.nextNode())) nodes.push(n);
      if (nodes.length === 0 && range.commonAncestorContainer.nodeType === 3) nodes.push(range.commonAncestorContainer as Text);
      nodes.forEach(t => { if(t.textContent) t.textContent = toUpper? t.textContent.toUpperCase() : t.textContent.toLowerCase(); });
    } else {
      // No selection - transform all text nodes but keep tags
      const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT);
      const nodes: Text[] = [];
      let n: any;
      while ((n = walker.nextNode())) nodes.push(n);
      nodes.forEach(t => { if(t.textContent) t.textContent = toUpper? t.textContent.toUpperCase() : t.textContent.toLowerCase(); });
    }
    localStorage.setItem("adv_html", editor.innerHTML);
    setText(readEditor());
    setTimeout(saveEditorSelection, 0);
  };

  const copySelectedText = async () => {
    const editor = editorRef.current;
    const selection = window.getSelection();
    let selectedText = "";
    if (editor && selection && selection.rangeCount > 0 &&!selection.isCollapsed && editor.contains(selection.getRangeAt(0).commonAncestorContainer)) {
      selectedText = selection.toString();
    } else {
      const savedRange = savedSelectionRef.current;
      if (editor && savedRange &&!savedRange.collapsed && editor.contains(savedRange.commonAncestorContainer)) {
        selectedText = savedRange.toString();
      }
    }
    if (!selectedText) {
      alert("Please select the text you want to copy.");
      return;
    }
    try {
      await navigator.clipboard.writeText(selectedText);
    } catch {
      const area = document.createElement("textarea");
      area.value = selectedText;
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
    }
  };

  const cutSelectedText = async () => {
    const editor = editorRef.current;
    const selection = window.getSelection();
    let selectedText = "";
    let rangeToDelete: Range | null = null;
    if (editor && selection && selection.rangeCount > 0 &&!selection.isCollapsed && editor.contains(selection.getRangeAt(0).commonAncestorContainer)) {
      selectedText = selection.toString();
      rangeToDelete = selection.getRangeAt(0).cloneRange();
    } else {
      const savedRange = savedSelectionRef.current;
      if (editor && savedRange &&!savedRange.collapsed && editor.contains(savedRange.commonAncestorContainer)) {
        selectedText = savedRange.toString();
        rangeToDelete = savedRange.cloneRange();
      }
    }
    if (!selectedText) {
      alert("Please select the text you want to cut.");
      return;
    }
    try { await navigator.clipboard.writeText(selectedText); } catch {}
    if (rangeToDelete) {
      rangeToDelete.deleteContents();
      editor?.focus();
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(rangeToDelete);
      }
      localStorage.setItem("adv_html", editor!.innerHTML);
      setText(readEditor());
    }
  };

  const pasteFromClipboard = async () => {
    try {
      const clip = await navigator.clipboard.readText();
      if (!clip) { alert("Clipboard empty"); return; }
      focusEditor();
      restoreSelection();
      document.execCommand("insertText", false, clip);
      const editor = editorRef.current;
      if (editor) {
        localStorage.setItem("adv_html", editor.innerHTML);
        setText(readEditor());
      }
    } catch {
      alert("Paste blocked by browser. Use Ctrl+V");
    }
  };

  const toggleVoice = () => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return alert("Voice typing is not supported in this browser. Try Chrome.");
    const rec = new SR();
    rec.lang = "hi-IN";
    rec.interimResults = false;
    rec.continuous = false;
    rec.onstart = () => setListening(true);
    rec.onend = () => setListening(false);
    rec.onresult = (e: any) => {
      const spoken = e.results[0][0].transcript;
      focusEditor();
      format("insertText", (text? " " : "") + spoken);
    };
    recognitionRef.current = rec;
    rec.start();
  };

  const toggleSpeak = () => {
    if (typeof window === "undefined" || typeof window.speechSynthesis === "undefined" || typeof SpeechSynthesisUtterance === "undefined") {
      alert("Text to speech is not supported in this browser.");
      return;
    }
    const synth = window.speechSynthesis;
    if (speaking || synth.speaking) {
      synth.cancel();
      setSpeaking(false);
      return;
    }
    const textToSpeak = text.trim();
    if (!textToSpeak) {
      alert("Please enter some text to read aloud.");
      return;
    }
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = /[अ-ह]/.test(textToSpeak)? "hi-IN" : "en-US";
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    synth.speak(utterance);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!editorRef.current || document.activeElement!== editorRef.current) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") { e.preventDefault(); format("bold"); }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "i") { e.preventDefault(); format("italic"); }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "u") { e.preventDefault(); format("underline"); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  const tabs: { id: Tab; label: string }[] = [
    { id: "count", label: "COUNT" }, { id: "clean", label: "CLEAN" }, { id: "seo", label: "SEO" },
    { id: "goals", label: "GOALS" }, { id: "analyze", label: "ANALYZE" }, { id: "tools", label: "TOOLS" }, { id: "diff", label: "DIFF" },
  ];

  const button = "px-3 py-2 rounded-xl border text-xs font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#6d5dfc]/50";
  const surface = dark? "bg-[#161826]/80 border-white/10" : "bg-white border-black/10";
  const input = dark? "bg-[#1e2138] border-white/10 text-white placeholder:text-white/40" : "bg-white border-black/10";

  return (
    <div className={dark? "dark" : ""}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');*{font-family:'Outfit',sans-serif}.glass{backdrop-filter:blur(16px)}
    .rich-editor h1{font-size:2rem;font-weight:800;line-height:1.2;margin:.7em 0}
    .rich-editor h2{font-size:1.5rem;font-weight:800;line-height:1.25;margin:.65em 0}
    .rich-editor p{margin:.45em 0}
    .rich-editor blockquote{border-left:4px solid #6d5dfc;padding-left:1rem;opacity:.8;font-style:italic}
    .rich-editor ul{list-style-type:disc!important; list-style-position:outside!important; padding-left:1.8rem!important; margin:.6em 0!important}
    .rich-editor ol{list-style-type:decimal!important; list-style-position:outside!important; padding-left:1.8rem!important; margin:.6em 0!important}
    .rich-editor li{display:list-item!important; margin:.25em 0!important}
    .rich-editor{overflow-wrap:anywhere;word-break:break-word;white-space:pre-wrap;min-width:0;max-width:100%; overflow-x:hidden}
    .rich-editor *{overflow-wrap:anywhere;word-break:break-word;max-width:100%}
    .rich-editor a{color:#8b7cff;text-decoration:underline;word-break:break-all}
    .rich-editor b,.rich-editor strong{font-weight:800}
    .rich-editor i,.rich-editor em{font-style:italic}
    .rich-editor u{text-decoration:underline}
    .rich-editor:empty:before{content:attr(data-placeholder);opacity:.4}
    .tip{position:relative}.tip:hover:after{content:attr(data-tip);position:absolute;z-index:100;bottom:calc(100% + 8px);left:50%;transform:translateX(-50%);white-space:nowrap;padding:6px 9px;border-radius:8px;background:#10111b;color:white;font-size:11px;box-shadow:0 8px 25px rgba(0,0,0,.3);pointer-events:none}
    .card-hover{transition:transform.2s ease,box-shadow.2s ease}.card-hover:hover{transform:translateY(-3px);box-shadow:0 12px 35px rgba(0,0,0,.14)}
    .editor-wrap{overflow-x:hidden;max-width:100%}
      `}</style>
      <div className={`min-h-screen ${dark? "bg-[#0e0f1a] text-white" : "bg-[#f7f8ff] text-[#151a2d]"}`}>
        <header className={`sticky top-0 z-50 w-full border-b backdrop-blur-xl ${dark? "bg-[#12131f]/95 border-white/10" : "bg-white/95 border-black/10"}`}>
          <div className="max-w-[1280px] mx-auto flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2"><div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#5b5bff] to-[#9b5cff] flex items-center justify-center font-bold text-white shadow-lg">T</div><span className="font-bold text-[19px]">Text<span className="text-[#7b6cff]">lyzer</span> <span className="opacity-50 text-[12px]">PRO</span></span></div>
            <button className={`${button} w-10 h-10 rounded-full`} title="Toggle theme" onClick={() => { setDark(!dark); localStorage.setItem("theme",!dark? "dark" : "light"); }}>{dark? "☀️" : "🌙"}</button>
          </div>
          <div className="max-w-[1280px] mx-auto px-3 pb-3 flex flex-wrap gap-2">
            {tabs.map((t) => <button key={t.id} onClick={() => setTab(t.id)} className={`${button} px-5 ${tab === t.id? "bg-[#5b5bff] text-white border-[#5b5bff] shadow-[0_5px_20px_rgba(91,91,255,.35)]" : dark? "bg-[#1e2138] border-white/10" : "bg-white border-black/10"}`}>{t.label}</button>)}
          </div>
        </header>

        <main className="max-w-[1280px] mx-auto grid lg:grid-cols-[1.15fr_380px] gap-4 p-4">
          <section className={`rounded-[22px] border p-3 md:p-4 shadow-xl editor-wrap ${surface}`}>
            <div className={`flex flex-wrap items-center gap-1.5 p-2 rounded-[14px] mb-3 border ${dark? "bg-[#0e0f1a] border-white/10" : "bg-[#f7f8ff] border-black/5"}`}>
              <span className="text-[10px] opacity-50 font-bold px-1">FORMAT</span>
              <button data-tip="Bold • Ctrl+B" className={`${button} tip font-bold`} onMouseDown={(e) => e.preventDefault()} onClick={() => format("bold")}>B</button>
              <button data-tip="Italic • Ctrl+I" className={`${button} tip italic`} onMouseDown={(e) => e.preventDefault()} onClick={() => format("italic")}>I</button>
              <button data-tip="Underline • Ctrl+U" className={`${button} tip underline`} onMouseDown={(e) => e.preventDefault()} onClick={() => format("underline")}>U</button>
              <button data-tip="Heading 1" className={`${button} tip font-bold`} onMouseDown={(e) => e.preventDefault()} onClick={() => formatBlock("h1")}>H1</button>
              <button data-tip="Heading 2" className={`${button} tip font-bold`} onMouseDown={(e) => e.preventDefault()} onClick={() => formatBlock("h2")}>H2</button>
              <button data-tip="Bullet list" className={`${button} tip`} onMouseDown={(e) => e.preventDefault()} onClick={() => format("insertUnorderedList")}>• List</button>
              <button data-tip="Numbered list" className={`${button} tip`} onMouseDown={(e) => e.preventDefault()} onClick={() => format("insertOrderedList")}>1. List</button>
              <button data-tip="Quote" className={`${button} tip`} onMouseDown={(e) => e.preventDefault()} onClick={() => formatBlock("blockquote")}>❝</button>
              <button data-tip="Insert link" className={`${button} tip`} onMouseDown={(e) => e.preventDefault()} onClick={insertLink}>🔗</button>
              <button data-tip="Remove formatting" className={`${button} tip`} onMouseDown={(e) => e.preventDefault()} onClick={clearFormatting}>Tx</button>
              <span className="w-px h-6 bg-white/10 mx-1" />
              <button data-tip="Undo • Ctrl+Z" className={`${button} tip`} onMouseDown={(e) => e.preventDefault()} onClick={() => format("undo")}>↶</button>
              <button data-tip="Redo • Ctrl+Y" className={`${button} tip`} onMouseDown={(e) => e.preventDefault()} onClick={() => format("redo")}>↷</button>
              <button data-tip="Voice typing" className={`${button} tip ${listening? "bg-red-500 text-white animate-pulse" : "bg-[#5b5bff] text-white"}`} onClick={toggleVoice}>{listening? "● Listening" : "🎙️"}</button>
              <button data-tip="Read text aloud" className={`${button} tip ${speaking? "bg-red-500 text-white" : "bg-emerald-600 text-white"}`} onClick={toggleSpeak}>{speaking? "■" : "🔊"}</button>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              <button data-tip="Copy selected text" className={`${button} tip`} onMouseDown={(e) => e.preventDefault()} onClick={copySelectedText}>📋 Copy</button>
              <button data-tip="Cut selected text" className={`${button} tip`} onMouseDown={(e) => e.preventDefault()} onClick={cutSelectedText}>✂️ Cut</button>
              <button data-tip="Paste from clipboard" className={`${button} tip`} onMouseDown={(e) => e.preventDefault()} onClick={pasteFromClipboard}>📥 Paste</button>
              <button data-tip="Clear editor" className={`${button} tip`} onClick={() => syncEditor("")}>🗑 Clear</button>
              <button className={button} onClick={() => transformCasePreserve(true)}>UPPER</button>
              <button className={button} onClick={() => transformCasePreserve(false)}>lower</button>
              <button className={button} onClick={() => syncEditor(removeEmojiSafe(text))}>Remove Emoji</button>
              <button className={button} onClick={() => downloadFile("textlyzer.txt", text)}>⬇ TXT</button>
              <button className={button} onClick={() => downloadFile("textlyzer.html", editorRef.current?.innerHTML || "", "text/html")}>⬇ HTML</button>
            </div>

            {tab === "diff"? (
              <div className="grid md:grid-cols-2 gap-3">
                <div><label className="text-xs opacity-60 mb-1 block">Original</label><div ref={editorRef} contentEditable suppressContentEditableWarning onInput={onEditorInput} className={`rich-editor w-full min-w-0 min-h-[380px] p-4 rounded-[16px] border outline-none text-[16px] leading-7 overflow-auto ${input}`} onMouseUp={saveEditorSelection} onKeyUp={saveEditorSelection} data-placeholder="Original text..." /></div>
                <div><label className="text-xs opacity-60 mb-1 block">Modified</label><textarea value={diffB} onChange={(e) => setDiffB(e.target.value)} placeholder="Modified Text" className={`w-full min-h-[380px] p-4 rounded-[16px] border outline-none text-[15px] leading-7 ${input}`} /></div>
              </div>
            ) : (
              <div ref={editorRef} contentEditable suppressContentEditableWarning onInput={onEditorInput} className={`rich-editor w-full min-w-0 min-h-[380px] max-h-[620px] p-4 rounded-[16px] border outline-none text-[16px] leading-7 overflow-auto resize-y ${input}`} onMouseUp={saveEditorSelection} onKeyUp={saveEditorSelection} data-placeholder="Type or paste here... Hindi, English, Hinglish, Emoji — formatting toolbar works like a rich-text editor." />
            )}

            <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-4">
              {[["Chars", stats.chars], ["Words", stats.words], ["No Space", stats.charsNoSpace], ["Sentences", stats.sentences], ["Paras", stats.paras], ["Lines", stats.lines], ["Emoji", stats.emoji], ["Reading", stats.reading + "m"], ["Speaking", stats.speakingM + "m"], ["Flesch", Math.round(stats.flesch)], ["Lang", stats.lang], ["Size", (stats.chars / 1024).toFixed(2) + "KB"]].map(([l, v]) => <div key={String(l)} className={`card-hover rounded-[12px] border p-2.5 text-center ${dark? "bg-[#1e2138] border-white/10" : "bg-[#f7f8ff] border-black/5"}`}><div className="font-bold text-[15px]">{v as any}</div><div className="text-[10px] uppercase tracking-widest opacity-60">{l as string}</div></div>)}
            </div>
          </section>

          <aside className="space-y-4">
            {tab === "count" && <div className={`rounded-[20px] border p-4 ${surface}`}><h4 className="text-xs uppercase tracking-widest opacity-60 mb-2">Social Limits</h4>{[["X / Twitter",280],["Instagram",2200],["LinkedIn",3000],["Facebook",63206],["YouTube Title",100],["Google Title",60]].map(([n,l]) => { const over=stats.chars>(l as number); return <div key={String(n)} className={`flex justify-between text-[13px] py-2 border-b border-dashed ${over?"text-red-400":"text-emerald-400"}`}><span>{n as string}</span><span>{stats.chars}/{l as number}</span></div> })}</div>}

            {tab === "clean" && <div className={`rounded-[20px] border p-4 space-y-3 ${surface}`}>
              <h4 className="font-bold">Clean & Replace</h4>
              <input value={find} onChange={(e) => setFind(e.target.value)} placeholder="Find..." className={`w-full px-3 py-2.5 rounded-[12px] border text-sm ${input}`} />
              <input value={replace} onChange={(e) => setReplace(e.target.value)} placeholder="Replace with..." className={`w-full px-3 py-2.5 rounded-[12px] border text-sm ${input}`} />
              <button className="w-full py-2.5 rounded-full bg-[#5b5bff] hover:bg-[#6d6dff] transition-all text-white font-bold text-sm" onClick={() => find && syncEditor(text.split(find).join(replace))}>Replace All</button>
              <div className="grid grid-cols-2 gap-2">
                <button className={button} onClick={() => syncEditor(text.replace(/[ \t]+/g, " "))}>Extra Spaces</button>
                <button className={button} onClick={() => syncEditor(text.split("\n").filter((l) => l.trim()).join("\n"))}>Empty Lines</button>
                <button data-tip="Remove repeated lines while keeping first occurrence" className={`${button} tip bg-violet-500 text-white`} onClick={() => syncEditor(removeDuplicateLines(text, duplicateCaseInsensitive))}>Duplicates</button>
                <button className={button} onClick={() => syncEditor(text.split("\n").map((l,i) => `${i+1}. ${l}`).join("\n"))}>Add Numbers</button>
              </div>
              <label className="flex items-center gap-2 text-xs opacity-75 cursor-pointer"><input type="checkbox" checked={duplicateCaseInsensitive} onChange={(e) => setDuplicateCaseInsensitive(e.target.checked)} /> Case-insensitive duplicate matching</label>
              <div className={`p-3 rounded-xl text-xs ${dark?"bg-[#1e2138]":"bg-[#f7f8ff]"}`}>Duplicate removal preserves the first occurrence, ignores leading/trailing spaces, normalizes repeated spaces, and keeps non-empty lines in their original order.</div>
            </div>}

            {tab === "seo" && <div className={`rounded-[20px] border p-4 space-y-3 ${surface}`}><h4 className="font-bold">SEO Studio • Score {seoScore}/100</h4><div className="h-2 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-[#5b5bff] to-emerald-400 transition-all duration-700" style={{width:`${seoScore}%`}}/></div><input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="SEO Title (50-60 chars ideal)" className={`w-full px-3 py-2.5 rounded-[12px] border text-sm ${input}`} /><div className="text-xs opacity-60">{title.length}/60 {title.length>=50&&title.length<=60?"✅ Ideal":"⚠️ Check length"}</div><input value={desc} onChange={(e)=>setDesc(e.target.value)} placeholder="Meta Description (150-160)" className={`w-full px-3 py-2.5 rounded-[12px] border text-sm ${input}`} /><div className="text-xs opacity-60">{desc.length}/160 {desc.length>=150&&desc.length<=160?"✅ Ideal":"⚠️ Check length"}</div><input value={slug} onChange={(e)=>setSlug(e.target.value)} placeholder="slug-will-be-here" className={`w-full px-3 py-2.5 rounded-[12px] border text-sm ${input}`} /><button onClick={()=>setSlug(title.toLowerCase().replace(/[^a-z0-9\u0900-\u097F]+/g,"-").replace(/^-|-$/g,""))} className="w-full py-2.5 rounded-full bg-[#5b5bff] hover:bg-[#6d6dff] text-white text-xs font-bold transition-all">Generate Slug from Title</button><div className="rounded-[12px] border p-3 bg-white text-black"><div className="text-[13px] text-[#1a0dab] truncate">{title||"Your Title Preview - Google SERP"}</div><div className="text-[11px] text-[#006621]">https://textlyzer.app/{slug||"character-counter"}</div><div className="text-[12px] text-[#545454] line-clamp-2">{desc||"Your meta description preview will appear here."}</div></div></div>}

            {tab === "goals" && <div className={`rounded-[20px] border p-4 space-y-4 ${surface}`}><h4 className="font-bold">🎯 Writing Goals</h4><div><label className="text-xs opacity-60">Daily Word Goal</label><div className="flex gap-2 mt-1"><input type="number" min="1" value={goal} onChange={(e)=>setGoal(Number(e.target.value)||1)} className={`flex-1 px-3 py-2.5 rounded-[12px] border text-sm ${input}`} /></div></div><div><div className="flex justify-between text-xs mb-1"><span>{stats.words} / {goal} words</span><span>{Math.min(100,Math.round(stats.words/goal*100))}%</span></div><div className="h-3 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-[#5b5bff] to-[#06b6d4] transition-all duration-700" style={{width:`${Math.min(100,Math.round(stats.words/goal*100))}%`}}/></div></div><div className={`p-3 rounded-[12px] ${dark?"bg-[#1e2138]":"bg-[#f7f8ff]"}`}><div className="text-xs">🔥 Current: <b>{stats.words} words</b></div><div className="text-xs mt-1">⏱️ Remaining: <b>{Math.max(0,Math.ceil((goal-stats.words)/200))} mins</b></div><div className="text-xs mt-1">{stats.words>=goal?"🎉 Goal achieved!":"💪 Keep typing..."}</div></div></div>}

            {tab === "analyze" && <div className={`rounded-[20px] border p-4 ${surface}`}><h4 className="font-bold">Keyword Frequency & Readability</h4><div className="mt-3 space-y-1.5">{stats.top.map(([w,c])=><div key={w} className="flex items-center gap-2 text-xs"><span className="w-20 truncate">{w}</span><div className="flex-1 h-2 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-[#5b5bff] transition-all duration-500" style={{width:`${(c/stats.maxFreq)*100}%`}}/></div><span>{c}</span></div>)}</div><div className={`mt-4 p-3 rounded-[12px] text-xs ${dark?"bg-[#1e2138]":"bg-[#f7f8ff]"}`}>Flesch: {Math.round(stats.flesch)} • {stats.flesch>80?"Very Easy":stats.flesch>50?"Easy":"Hard"} • Language: {stats.lang}</div></div>}

            {tab === "tools" && <div className={`rounded-[20px] border p-4 grid grid-cols-2 gap-2 ${surface}`}>
              <button className={button} onClick={()=>syncEditor("Lorem ipsum dolor sit amet, consectetur adipiscing elit. ".repeat(20))}>Lorem 100w</button>
              <button className={button} onClick={()=>syncEditor(btoa(unescape(encodeURIComponent(text))))}>Base64 Encode</button>
              <button className={button} onClick={()=>{try{syncEditor(decodeURIComponent(escape(atob(text))))}catch{alert("Invalid Base64")}}}>Base64 Decode</button>
              <button className={button} onClick={()=>syncEditor(text.toLowerCase().replace(/[^a-z0-9]+/g,"-"))}>Slugify</button>
              <button className={button} onClick={()=>syncEditor(Array.from(text).reverse().join(""))}>Reverse</button>
              <button className={button} onClick={()=>syncEditor(text.trim()?text.trim().split(/\s+/).map(w=>`#${w}`).join(" "):"")}>Hashtags</button>
            </div>}

            {tab === "diff" && <div className={`rounded-[20px] border p-4 ${surface}`}><h4 className="font-bold">Diff Checker</h4><div className="mt-3 space-y-2 text-xs"><div className={`p-3 rounded-[12px] ${dark?"bg-[#1e2138]":"bg-[#f7f8ff]"}`}>Chars A: {text.length} | Chars B: {diffB.length} | Difference: {Math.abs(text.length-diffB.length)}</div><div className={`p-3 rounded-[12px] ${text===diffB?"bg-emerald-500/20 text-emerald-400":"bg-red-500/20 text-red-400"}`}>{text===diffB?"✅ Both texts are identical":"⚠️ Texts are different"}</div><div className="max-h-[200px] overflow-auto p-2 rounded-[10px] bg-black/5 dark:bg-white/5 leading-6 break-all">{text.split(" ").map((w,i)=>{const w2=diffB.split(" ")[i];return w!==w2?<span key={i} className="bg-red-500/30 px-1 rounded mx-0.5">{w} </span>:<span key={i}>{w} </span>})}</div></div></div>}
          </aside>
        </main>

        <section className="max-w-[1280px] mx-auto px-4 pb-8"><h3 className="font-bold text-[20px] mb-3">Other Useful Tools</h3><div className="grid md:grid-cols-3 gap-3">{[["📝","Word Counter","Count words, characters, sentences and paragraphs."],["🔍","SEO Analyzer","Check title and meta description length."],["🔀","Duplicate Cleaner","Remove repeated lines without changing order."],["🎙️","Voice to Text","Speak in Hindi or English and insert text."],["🔊","Text to Speech","Listen to your writing naturally."],["🔗","Slug Generator","Create cleaner SEO-friendly URL slugs."]].map(([i,t,d])=><div key={t} className={`card-hover rounded-[16px] border p-4 flex gap-3 ${surface}`}><div className="text-[24px]">{i}</div><div><div className="font-bold text-sm">{t}</div><div className="text-xs opacity-60 mt-1">{d}</div></div></div>)}</div></section>

        <section className={`max-w-[1000px] mx-auto px-5 py-8 rounded-[24px] border mb-8 ${surface}`}>
          <div className="flex items-center justify-between gap-3"><div><h2 className="text-2xl font-bold">Complete User Guide & FAQ</h2><p className="text-sm opacity-60 mt-1">Learn how Textlyzer works and who can benefit from it.</p></div><button className={button} onClick={()=>setShowGuide(!showGuide)}>{showGuide?"Hide":"Show"}</button></div>
          {showGuide && <div className="mt-7 space-y-8 text-[14px] leading-7 opacity-90">
            <article><h3 className="text-xl font-bold mb-2">What is a Character Counter?</h3><p>A character counter is a writing utility that measures the amount of text you enter. It can count total characters, characters without spaces, words, sentences, paragraphs, lines, letters, numbers, punctuation and emoji. This is useful whenever a website, social platform, form, application or assignment imposes a text limit.</p><p className="mt-2">Textlyzer is designed to make those measurements instant while you type. Counts update locally in the browser, so you can check the length of Hindi, English, Hinglish and mixed text without repeatedly copying the content into another application.</p></article>
            <article><h3 className="text-xl font-bold mb-2">For Whom Is a Character Counter Beneficial?</h3><div className="grid md:grid-cols-2 gap-3">{[["Bloggers & Content Writers","Check article length, paragraph structure, reading time and repeated keywords."],["SEO Professionals","Measure title and meta-description length and prepare cleaner slugs."],["Social Media Creators","Check whether captions, posts and titles fit platform limits before publishing."],["Students & Teachers","Keep assignments, answers and notes within specified word or character limits."],["YouTubers","Prepare concise titles, descriptions and scripts and estimate speaking time."],["Copywriters & Marketers","Write controlled headlines, ad copy and calls to action."],["Journalists","Quickly measure stories, headlines and short-form copy."],["Developers & Freelancers","Test text limits for forms, databases, APIs and UI fields."]].map(([a,b])=><div key={a} className={`card-hover p-4 rounded-xl border ${dark?"bg-[#1e2138] border-white/10":"bg-[#f7f8ff] border-black/5"}`}><b>{a}</b><p className="text-xs opacity-70 mt-1">{b}</p></div>)}</div></article>
            <article><h3 className="text-xl font-bold mb-2">How to Use the Editor</h3><ol className="list-decimal pl-5 space-y-1"><li>Type or paste your content into the editor.</li><li>Watch character, word, sentence and paragraph counts update automatically.</li><li>Select text and use Bold, Italic, Underline, H1, H2, lists, quote or link from the formatting toolbar.</li><li>Use Copy, Clear, case conversion, emoji removal or TXT/HTML export when needed.</li><li>Use Clean to replace text, remove extra spaces, delete empty lines and remove duplicates.</li><li>Use SEO to check title and description length.</li><li>Use Goals to set a daily writing target and monitor progress.</li></ol><p className="mt-2">Formatting is real rich-text formatting inside the editor; the tool does not insert visible Markdown markers such as <code>**</code> or <code>#</code> around formatted text.</p></article>
            <article><h3 className="text-xl font-bold mb-2">How Duplicate Removal Works</h3><p>The Duplicate button processes lines while preserving the first occurrence. It trims leading and trailing whitespace and normalizes repeated spaces before comparison. Empty lines are retained so the tool does not unexpectedly destroy document spacing. Optional case-insensitive matching lets “Hello” and “hello” be treated as duplicates. This is useful for lists, notes, keyword lists and pasted data.</p></article>
            <article><h3 className="text-xl font-bold mb-2">Privacy & Local Processing</h3><p>The counter calculations are performed in the browser. Draft text and preferences can be stored in your browser&apos;s local storage so that a refresh does not immediately erase your work. Do not paste confidential information into any online service unless you are comfortable with its storage and privacy practices.</p></article>
            <article><h3 className="text-xl font-bold mb-3">Frequently Asked Questions</h3><div className="grid gap-2">{[
              ["What is the difference between characters and words?","Characters are individual letters, numbers, spaces, punctuation marks and other symbols. Words are groups of text separated by whitespace."],
              ["Are spaces included in the character count?","Yes. Textlyzer shows both total characters and characters without whitespace so you can use whichever limit a platform specifies."],
              ["Does it support Hindi?","Yes. The editor accepts Hindi, English, Hinglish, mixed scripts and emoji."],
              ["Will bold text show ** characters?","No. Bold, italic, headings and other toolbar actions use rich-text formatting in the editor instead of inserting Markdown markers."],
              ["How do I make an H1 heading?","Select the text and click H1. The editor applies a real heading block rather than adding a visible # character."],
              ["How does the Duplicate tool work?","It removes repeated non-empty lines while keeping the first occurrence and preserving the original order."],
              ["Can duplicate matching ignore capitalization?","Yes. Enable the case-insensitive option in the Clean menu."],
              ["How is reading time calculated?","The current estimate uses approximately 225 words per minute and rounds up to a practical minute value."],
              ["How is speaking time calculated?","The current estimate uses approximately 150 words per minute, suitable as a general speaking estimate."],
              ["Can I check social-media limits?","Yes. The Count panel shows example limits for X, Instagram, LinkedIn, Facebook, YouTube titles and Google titles."],
              ["What is an SEO title counter?","It measures the title length and gives a simple indication when the title falls within the configured 50–60 character range."],
              ["What is a meta description counter?","It measures the description and indicates when the description falls within the configured 150–160 character range."],
              ["Does voice typing work on every browser?","Voice typing depends on browser support for the Web Speech API. Chrome-based browsers generally provide the best support."],
              ["Can the text be read aloud?","Yes. Textlyzer uses the browser's speech-synthesis capability to read the current text."],
              ["Can I export my text?","Yes. The editor provides TXT and HTML export actions."],
              ["Does dark mode affect the counter?","No. Theme changes are visual only; the underlying counts and text remain unchanged."],
              ["Is it useful for students?","Yes. Students can check word and character requirements, organize paragraphs and estimate reading or speaking time."],
              ["Is it useful for SEO writers?","Yes. SEO writers can measure titles and descriptions, generate slugs and inspect basic keyword frequency."],
              ["Can I use it on mobile?","Yes. The layout is responsive and toolbar controls wrap to smaller screens."],
              ["Does the tool replace professional proofreading?","No. Character counting and basic analysis are utilities; they do not replace human proofreading, fact checking or professional editing."],
            ].map(([q,a])=><details key={q} className={`rounded-xl border p-4 ${dark?"bg-[#1e2138] border-white/10":"bg-[#f7f8ff] border-black/5"}`}><summary className="font-semibold cursor-pointer">{q}</summary><p className="mt-2 opacity-70">{a}</p></details>)}</div></article>
          </div>}
          <p className="text-[11px] opacity-40 mt-8 text-center">© 2026 Textlyzer PRO • Rich-text editor • Duplicate cleaner • User guide & FAQ</p>
        </section>
      </div>
    </div>
  );
}
