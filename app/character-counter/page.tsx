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
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
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
  return input.split(/\r?\n/).filter((line) => {
      const key = normalizeLine(line, caseInsensitive);
      if (!key) return true;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).join("\n").replace(/\n{3,}/g, "\n\n");
}
function downloadFile(name: string, content: string, type = "text/plain") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name; a.click();
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
  const [voiceLang, setVoiceLang] = useState("en-IN");

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
    const vLang = localStorage.getItem("adv_voice_lang");
    if (saved) setText(saved);
    if (g) setGoal(Number(g) || 1000);
    if (th === "light") setDark(false);
    if (vLang) setVoiceLang(vLang);
    requestAnimationFrame(() => {
      if (editorRef.current) editorRef.current.innerHTML = savedHtml || plainTextToHtml(saved || "");
    });
  }, []);
  useEffect(() => { localStorage.setItem("adv_text", text); }, [text]);
  useEffect(() => { localStorage.setItem("adv_goal", String(goal)); }, [goal]);
  useEffect(() => { localStorage.setItem("adv_voice_lang", voiceLang); }, [voiceLang]);

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
    if (title.length >= 50 && title.length <= 60) s += 35; else if (title.length) s += 15;
    if (desc.length >= 150 && desc.length <= 160) s += 35; else if (desc.length) s += 15;
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

  const wrapSelectionModern = (tagName: string) => {
    const editor = editorRef.current;
    const sel = window.getSelection();
    if (!editor ||!sel || sel.rangeCount === 0) return false;
    const range = sel.getRangeAt(0);
    if (range.collapsed ||!editor.contains(range.commonAncestorContainer)) return false;
    const wrapper = document.createElement(tagName);
    try { range.surroundContents(wrapper); } catch {
      const content = range.extractContents();
      wrapper.appendChild(content);
      range.insertNode(wrapper);
    }
    const newRange = document.createRange();
    newRange.selectNodeContents(wrapper);
    sel.removeAllRanges();
    sel.addRange(newRange);
    savedSelectionRef.current = newRange.cloneRange();
    localStorage.setItem("adv_html", editor.innerHTML);
    setText(readEditor());
    return true;
  };

  const format = (command: string, value?: string) => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();
    if (["bold","italic","underline"].includes(command)) {
      const tagMap: any = { bold: "b", italic: "i", underline: "u" };
      const done = wrapSelectionModern(tagMap[command]);
      if (done) return;
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
            sel?.removeAllRanges(); sel?.addRange(caret);
          }
        } else {
          const list = document.createElement(command === "insertUnorderedList"? "ul" : "ol");
          const li = document.createElement("li");
          li.innerHTML = "<br>"; list.appendChild(li);
          rangeBefore.insertNode(list);
          const caret = document.createRange();
          caret.setStart(li, 0); caret.collapse(true);
          sel?.removeAllRanges(); sel?.addRange(caret);
        }
      }
    } else { document.execCommand(command, false, value); }
    const html = editor.innerHTML;
    localStorage.setItem("adv_html", html);
    setText(readEditor());
    setTimeout(saveEditorSelection, 0);
  };

  const formatBlock = (tag: "h1" | "h2" | "p" | "blockquote") => format("formatBlock", `<${tag}>`);
  const insertLink = () => { const url = window.prompt("Enter URL"); if (url) format("createLink", url); };
  const onEditorInput = () => {
    const next = readEditor();
    setText(next);
    localStorage.setItem("adv_html", editorRef.current?.innerHTML || "");
  };
  const clearFormatting = () => { format("removeFormat"); format("formatBlock", "<p>"); };

  const transformCasePreserve = (toUpper: boolean) => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 &&!sel.isCollapsed && editor.contains(sel.getRangeAt(0).commonAncestorContainer)) {
      const range = sel.getRangeAt(0);
      const fragment = range.extractContents();
      const walker = document.createTreeWalker(fragment, NodeFilter.SHOW_TEXT);
      let node: Text | null;
      const nodes: Text[] = [];
      while ((node = walker.nextNode() as Text)) nodes.push(node);
      nodes.forEach(n => { if(n.textContent) n.textContent = toUpper? n.textContent.toUpperCase() : n.textContent.toLowerCase(); });
      range.insertNode(fragment);
    } else {
      const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT);
      const nodes: Text[] = [];
      let n: any; while ((n = walker.nextNode())) nodes.push(n);
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
    if (editor && selection && selection.rangeCount > 0 &&!selection.isCollapsed && editor.contains(selection.getRangeAt(0).commonAncestorContainer)) selectedText = selection.toString();
    else { const savedRange = savedSelectionRef.current; if (editor && savedRange &&!savedRange.collapsed && editor.contains(savedRange.commonAncestorContainer)) selectedText = savedRange.toString(); }
    if (!selectedText) { alert("Please select the text you want to copy."); return; }
    try { await navigator.clipboard.writeText(selectedText); } catch {
      const area = document.createElement("textarea"); area.value = selectedText; area.style.position = "fixed"; area.style.opacity = "0"; document.body.appendChild(area); area.select(); document.execCommand("copy"); area.remove();
    }
  };
  const cutSelectedText = async () => {
    const editor = editorRef.current; const selection = window.getSelection(); let selectedText = ""; let rangeToDelete: Range | null = null;
    if (editor && selection && selection.rangeCount > 0 &&!selection.isCollapsed && editor.contains(selection.getRangeAt(0).commonAncestorContainer)) { selectedText = selection.toString(); rangeToDelete = selection.getRangeAt(0).cloneRange(); }
    else { const savedRange = savedSelectionRef.current; if (editor && savedRange &&!savedRange.collapsed && editor.contains(savedRange.commonAncestorContainer)) { selectedText = savedRange.toString(); rangeToDelete = savedRange.cloneRange(); } }
    if (!selectedText) { alert("Please select the text you want to cut."); return; }
    try { await navigator.clipboard.writeText(selectedText); } catch {}
    if (rangeToDelete) { rangeToDelete.deleteContents(); editor?.focus(); const sel = window.getSelection(); if (sel) { sel.removeAllRanges(); sel.addRange(rangeToDelete); } localStorage.setItem("adv_html", editor!.innerHTML); setText(readEditor()); }
  };
  const pasteFromClipboard = async () => {
    try {
      const clip = await navigator.clipboard.readText();
      if (!clip) { alert("Clipboard empty"); return; }
      focusEditor(); restoreSelection();
      document.execCommand("insertText", false, clip);
      const editor = editorRef.current; if (editor) { localStorage.setItem("adv_html", editor.innerHTML); setText(readEditor()); }
    } catch { alert("Paste blocked by browser. Use Ctrl+V"); }
  };

  const safeBase64Encode = () => {
    try {
      const raw = btoa(unescape(encodeURIComponent(text)));
      const chunked = raw.match(/.{1,64}/g)?.join("\n") || raw;
      syncEditor(chunked);
    } catch { alert("Encode failed"); }
  };
  const safeBase64Decode = () => {
    try {
      const cleaned = text.replace(/\s+/g, "");
      if (!cleaned) { alert("Nothing to decode"); return; }
      const decoded = decodeURIComponent(escape(atob(cleaned)));
      syncEditor(decoded);
    } catch { alert("Invalid Base64 - check input"); }
  };

  const toggleVoice = () => {
    if (listening) { recognitionRef.current?.stop(); setListening(false); return; }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return alert("Voice typing is not supported in this browser. Try Chrome.");
    const rec = new SR(); rec.lang = voiceLang; rec.interimResults = false; rec.continuous = false;
    rec.onstart = () => setListening(true); rec.onend = () => setListening(false);
    rec.onresult = (e: any) => {
      const spoken = e.results[0][0].transcript;
      focusEditor(); restoreSelection();
      document.execCommand("insertText", false, (text? " " : "") + spoken);
      const editor = editorRef.current; if (editor) { localStorage.setItem("adv_html", editor.innerHTML); setText(readEditor()); }
    };
    rec.onerror = () => setListening(false);
    recognitionRef.current = rec; rec.start();
  };
  const toggleSpeak = () => {
    if (typeof window === "undefined" || typeof window.speechSynthesis === "undefined" || typeof SpeechSynthesisUtterance === "undefined") { alert("Text to speech is not supported in this browser."); return; }
    const synth = window.speechSynthesis;
    if (speaking || synth.speaking) { synth.cancel(); setSpeaking(false); return; }
    const textToSpeak = text.trim(); if (!textToSpeak) { alert("Please enter some text to read aloud."); return; }
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = /[अ-ह]/.test(textToSpeak)? "hi-IN" : "en-US";
    utterance.onstart = () => setSpeaking(true); utterance.onend = () => setSpeaking(false); utterance.onerror = () => setSpeaking(false);
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

  const css = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');
  *{font-family:'Outfit',sans-serif}.glass{backdrop-filter:blur(16px)}
 .rich-editor h1{font-size:2rem;font-weight:800;line-height:1.2;margin:.7em 0}
 .rich-editor h2{font-size:1.5rem;font-weight:800;line-height:1.25;margin:.65em 0}
 .rich-editor p{margin:.45em 0}
 .rich-editor blockquote{border-left:4px solid #6d5dfc;padding-left:1rem;opacity:.8;font-style:italic}
 .rich-editor ul{list-style-type:disc!important; list-style-position:outside!important; padding-left:1.8rem!important; margin:.6em 0!important}
 .rich-editor ol{list-style-type:decimal!important; list-style-position:outside!important; padding-left:1.8rem!important; margin:.6em 0!important}
 .rich-editor li{display:list-item!important; margin:.25em 0!important}
 .rich-editor{overflow-wrap:anywhere!important; word-break:break-word!important; white-space:pre-wrap!important; overflow-x:hidden!important; max-width:100%!important; min-width:0}
 .rich-editor *{overflow-wrap:anywhere!important; word-break:break-word!important; max-width:100%!important}
 .rich-editor a{color:#8b7cff;text-decoration:underline;word-break:break-all!important}
 .rich-editor b,.rich-editor strong{font-weight:800}
 .rich-editor i,.rich-editor em{font-style:italic!important}
 .rich-editor u{text-decoration:underline}
 .rich-editor:empty:before{content:attr(data-placeholder);opacity:.4}
 .tip{position:relative}.tip:hover:after{content:attr(data-tip);position:absolute;z-index:100;bottom:calc(100% + 8px);left:50%;transform:translateX(-50%);white-space:nowrap;padding:6px 9px;border-radius:8px;background:#10111b;color:white;font-size:11px;box-shadow:0 8px 25px rgba(0,0,0,.3);pointer-events:none}
 .card-hover{transition:transform.2s ease,box-shadow.2s ease}.card-hover:hover{transform:translateY(-3px);box-shadow:0 12px 35px rgba(0,0,0,.14)}
 .editor-wrap{overflow-x:hidden;max-width:100%}
  `;

  return (
    <div className={dark? "dark" : ""}>
      <style dangerouslySetInnerHTML={{ __html: css }} />
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
              <div className="flex items-center gap-1 ml-1">
                <select value={voiceLang} onChange={(e)=>setVoiceLang(e.target.value)} className={`px-2 py-1.5 rounded-lg border text-[11px] font-bold ${input}`} title="Voice language">
                  <option value="en-IN">EN-IN Hinglish</option>
                  <option value="hi-IN">हिंदी</option>
                  <option value="en-US">English US</option>
                  <option value="en-GB">English UK</option>
                </select>
                <button data-tip="Voice typing - multilingual" className={`${button} tip ${listening? "bg-red-500 text-white animate-pulse" : "bg-[#5b5bff] text-white"}`} onClick={toggleVoice}>{listening? "● "+voiceLang+" Listening" : "🎙️ Voice"}</button>
              </div>
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
                <div><label className="text-xs opacity-60 mb-1 block">Original (Main Editor)</label><div ref={editorRef} contentEditable suppressContentEditableWarning onInput={onEditorInput} className={`rich-editor w-full min-w-0 min-h-[380px] p-4 rounded-[16px] border outline-none text-[16px] leading-7 overflow-auto ${input}`} onMouseUp={saveEditorSelection} onKeyUp={saveEditorSelection} data-placeholder="Original text..." /></div>
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
              <div className={`p-3 rounded-xl text-xs ${dark?"bg-[#1e2138]":"bg-[#f7f8ff]"}`}>Duplicate removal preserves the first occurrence and keeps original order.</div>
            </div>}

            {tab === "seo" && <div className={`rounded-[20px] border p-4 space-y-3 ${surface}`}>
              <h4 className="font-bold">SEO Studio • Score {seoScore}/100</h4>
              <div className="h-2 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-[#5b5bff] to-emerald-400 transition-all duration-700" style={{width:`${seoScore}%`}}/></div>
              <input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="SEO Title (50-60 chars ideal)" className={`w-full px-3 py-2.5 rounded-[12px] border text-sm ${input}`} />
              <div className="text-xs opacity-60">{title.length}/60 {title.length>=50&&title.length<=60?"✅ Ideal":"⚠️ Check length"}</div>
              <input value={desc} onChange={(e)=>setDesc(e.target.value)} placeholder="Meta Description (150-160)" className={`w-full px-3 py-2.5 rounded-[12px] border text-sm ${input}`} />
              <div className="text-xs opacity-60">{desc.length}/160 {desc.length>=150&&desc.length<=160?"✅ Ideal":"⚠️ Check length"}</div>
              <input value={slug} onChange={(e)=>setSlug(e.target.value)} placeholder="slug-will-be-here" className={`w-full px-3 py-2.5 rounded-[12px] border text-sm ${input}`} />
              <button onClick={()=>setSlug(title.toLowerCase().replace(/[^a-z0-9\u0900-\u097F]+/g,"-").replace(/^-|-$/g,""))} className="w-full py-2.5 rounded-full bg-[#5b5bff] hover:bg-[#6d6dff] text-white text-xs font-bold transition-all">Generate Slug from Title</button>
              <div className="rounded-[12px] border p-3 bg-white text-black shadow-inner">
                <div className="text-[13px] text-[#1a0dab] truncate">{title||"Your Title Preview - Google SERP"}</div>
                <div className="text-[11px] text-[#006621]">https://textlyzer.app/{slug||"character-counter"}</div>
                <div className="text-[12px] text-[#545454] line-clamp-2">{desc||"Your meta description preview will appear here."}</div>
              </div>
            </div>}

            {tab === "goals" && <div className={`rounded-[20px] border p-4 space-y-4 ${surface}`}><h4 className="font-bold">🎯 Writing Goals</h4><div><label className="text-xs opacity-60">Daily Word Goal</label><div className="flex gap-2 mt-1"><input type="number" min="1" value={goal} onChange={(e)=>setGoal(Number(e.target.value)||1)} className={`flex-1 px-3 py-2.5 rounded-[12px] border text-sm ${input}`} /></div></div><div><div className="flex justify-between text-xs mb-1"><span>{stats.words} / {goal} words</span><span>{Math.min(100,Math.round(stats.words/goal*100))}%</span></div><div className="h-3 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-[#5b5bff] to-[#06b6d4] transition-all duration-700" style={{width:`${Math.min(100,Math.round(stats.words/goal*100))}%`}}/></div></div></div>}

            {tab === "analyze" && <div className={`rounded-[20px] border p-4 ${surface}`}><h4 className="font-bold">Keyword Frequency & Readability</h4><div className="mt-3 space-y-1.5">{stats.top.map(([w,c])=><div key={w} className="flex items-center gap-2 text-xs"><span className="w-20 truncate">{w}</span><div className="flex-1 h-2 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-[#5b5bff] transition-all duration-500" style={{width:`${(c/stats.maxFreq)*100}%`}}/></div><span>{c}</span></div>)}</div><div className={`mt-4 p-3 rounded-[12px] text-xs ${dark?"bg-[#1e2138]":"bg-[#f7f8ff]"}`}>Flesch: {Math.round(stats.flesch)} • {stats.flesch>80?"Very Easy":stats.flesch>50?"Easy":"Hard"} • Language: {stats.lang}</div></div>}

            {tab === "tools" && <div className={`rounded-[20px] border p-4 grid grid-cols-2 gap-2 ${surface}`}>
              <button className={button} onClick={()=>syncEditor("Lorem ipsum dolor sit amet, consectetur adipiscing elit. ".repeat(20))}>Lorem 100w</button>
              <button className={button} onClick={safeBase64Encode}>Base64 Encode</button>
              <button className={button} onClick={safeBase64Decode}>Base64 Decode</button>
              <button className={button} onClick={()=>syncEditor(text.toLowerCase().replace(/[^a-z0-9]+/g,"-"))}>Slugify</button>
              <button className={button} onClick={()=>syncEditor(Array.from(text).reverse().join(""))}>Reverse</button>
              <button className={button} onClick={()=>syncEditor(text.trim()?text.trim().split(/\s+/).map(w=>`#${w}`).join(" "):"")}>Hashtags</button>
            </div>}

            {tab === "diff" && <div className={`rounded-[20px] border p-4 ${surface}`}>
              <h4 className="font-bold">Diff Checker</h4>
              <div className="mt-3 space-y-2 text-xs">
                <div className={`p-3 rounded-[12px] ${dark?"bg-[#1e2138]":"bg-[#f7f8ff]"}`}>Chars A: {text.length} | Chars B: {diffB.length} | Difference: {Math.abs(text.length-diffB.length)}</div>
                <div className={`p-3 rounded-[12px] ${text===diffB?"bg-emerald-500/20 text-emerald-400":"bg-red-500/20 text-red-400"}`}>{text===diffB?"✅ Both texts are identical":"⚠️ Texts are different"}</div>
                <div className={`max-h-[240px] overflow-auto p-2 rounded-[10px] ${dark?"bg-black/20":"bg-black/5"} leading-6 break-all`}>
                  {text.split(" ").map((w,i)=>{
                    const w2=diffB.split(" ")[i];
                    return w!==w2?<span key={i} className="bg-red-500/30 px-1 rounded mx-0.5">{w} </span>:<span key={i}>{w} </span>
                  })}
                </div>
              </div>
            </div>}
          </aside>
        </main>

        <section className="max-w-[1280px] mx-auto px-4 pb-8">
          <h3 className="font-bold text-[20px] mb-3">Other Useful Tools</h3>
          <div className="grid md:grid-cols-3 gap-3">
            {[
              ["📝","Word Counter","Count words, characters, sentences and paragraphs."],
              ["🔍","SEO Analyzer","Check title and meta description length."],
              ["🔀","Duplicate Cleaner","Remove repeated lines without changing order."],
              ["🎙️","Voice to Text","Speak in Hindi or English and insert text."],
              ["🔊","Text to Speech","Listen to your writing naturally."],
              ["🔗","Slug Generator","Create cleaner SEO-friendly URL slugs."]
            ].map(([i,t,d])=><div key={t as string} className={`card-hover rounded-[16px] border p-4 flex gap-3 ${surface}`}><div className="text-[24px]">{i as string}</div><div><div className="font-bold text-sm">{t as string}</div><div className="text-xs opacity-60 mt-1">{d as string}</div></div></div>)}
          </div>
        </section>

                        <section id="user-guide" className={`max-w-[1000px] mx-auto px-5 py-8 rounded-[24px] border mb-8 ${surface}`}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold">Complete User Guide & FAQ - Best Online Character Counter & Word Counter</h2>
              <p className="text-sm opacity-60 mt-1">Learn how Textlyzer's free character counter, word counter, SEO title checker, duplicate remover, and text tools work for Hindi, English & Hinglish.</p>
            </div>
            <button className={button} onClick={()=>setShowGuide(!showGuide)}>{showGuide?"Hide Guide":"Show Guide"}</button>
          </div>

          {/* FAQ Schema for Google Rich Results */}
          <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
            "@context":"https://schema.org",
            "@type":"FAQPage",
            "mainEntity":[
              {"@type":"Question","name":"What is a character counter?","acceptedAnswer":{"@type":"Answer","text":"A character counter counts total characters, characters without spaces, words, sentences, paragraphs, lines and emoji. Textlyzer does it instantly."}},
              {"@type":"Question","name":"Does it support Hindi and Hinglish?","acceptedAnswer":{"@type":"Answer","text":"Yes, Textlyzer supports Hindi, English, Hinglish, mixed scripts and emoji with accurate Unicode counting."}},
              {"@type":"Question","name":"How to count words and characters?","acceptedAnswer":{"@type":"Answer","text":"Just type or paste in the editor. Counts update live for chars, words, sentences, reading time and speaking time."}},
              {"@type":"Question","name":"How does duplicate line remover work?","acceptedAnswer":{"@type":"Answer","text":"It removes repeated lines, keeps first occurrence, normalizes spaces and preserves order. Optional case-insensitive mode."}},
              {"@type":"Question","name":"Is it free?","acceptedAnswer":{"@type":"Answer","text":"Yes, Textlyzer PRO character counter is 100% free, no login, works in browser with local storage."}}
            ]
          })}} />

          {showGuide && <div className="mt-7 space-y-10 text-[14px] leading-7 opacity-90">
            <article id="what-is-character-counter">
              <h3 className="text-xl font-bold mb-2">What is a Character Counter & Word Counter?</h3>
              <p>A <strong>character counter</strong> is a free online writing tool that measures text length instantly. Textlyzer counts <strong>total characters, characters without spaces, words, sentences, paragraphs, lines, letters, numbers, punctuation and emoji</strong>. If you search for <em>character counter online, word counter, letter counter, or text length checker</em>, this tool gives all counts in one place.</p>
              <p className="mt-2">Unlike basic counters, Textlyzer is a <strong>rich-text character counter</strong> — Bold, Italic, H1/H2, lists work without showing ** or # symbols. It also works as a <strong>Hindi character counter and Hinglish word counter</strong> with correct Unicode counting.</p>
              <div className="mt-3 flex flex-wrap gap-2 text-[11px]"><span className="px-2 py-1 rounded-full border">character counter</span><span className="px-2 py-1 rounded-full border">word counter</span><span className="px-2 py-1 rounded-full border">Hindi character count</span><span className="px-2 py-1 rounded-full border">text analyzer</span></div>
            </article>

            <article id="who-can-use">
              <h3 className="text-xl font-bold mb-2">Who Should Use This Text Counter Tool?</h3>
              <div className="grid md:grid-cols-2 gap-3">{[["Bloggers & Content Writers","Check article length, paragraph count, reading time 225 WPM, keyword density for SEO content."],["SEO Professionals & Digital Marketers","Validate SEO title 50-60 chars, meta description 150-160 chars, generate URL slugs and check top keywords."],["Social Media & YouTube Creators","Check X/Twitter 280, Instagram 2200, LinkedIn 3000, Facebook 63206, YouTube title 100 limits before posting."],["Students & Teachers","Stay within assignment word limits, count words for essays, estimate speaking time 150 WPM for presentations."],["Copywriters & Journalists","Write ad copy, headlines, press releases with precise character limits."],["Developers & Freelancers","Test form limits, database varchar limits, API payload size with exact char count."]].map(([a,b])=><div key={a} className={`card-hover p-4 rounded-xl border ${dark?"bg-[#1e2138] border-white/10":"bg-[#f7f8ff] border-black/5"}`}><b>{a}</b><p className="text-xs opacity-70 mt-1">{b}</p></div>)}</div>
            </article>

            <article id="how-to-use">
              <h3 className="text-xl font-bold mb-2">How to Use Textlyzer - Step by Step Guide</h3>
              <ol className="list-decimal pl-5 space-y-1">
                <li><b>Paste or type:</b> Drop any Hindi, English, Hinglish text into the editor.</li>
                <li><b>Live count:</b> Instant character, word, sentence, paragraph, reading & speaking time.</li>
                <li><b>Format:</b> Select text → Bold (Ctrl+B), Italic, Underline, H1/H2, bullet list, quote, link — real formatting, not markdown.</li>
                <li><b>Clean:</b> Clean tab → Find & Replace, remove extra spaces, empty lines, <strong>remove duplicate lines</strong> with case-insensitive option.</li>
                <li><b>SEO check:</b> SEO tab → Enter title/description → Get SEO score /100 + Google SERP preview + slug generator.</li>
                <li><b>Compare:</b> DIFF tab → Compare original vs modified text with word-level red highlight.</li>
                <li><b>Export:</b> Download as TXT or HTML, copy/cut selected text only.</li>
              </ol>
            </article>

            <article id="duplicate-remover-seo">
              <h3 className="text-xl font-bold mb-2">Advanced Duplicate Line Remover - Keep First Occurrence</h3>
              <p>Our <strong>duplicate line remover</strong> removes repeated lines while preserving first occurrence and original order. It trims leading/trailing spaces, normalizes multiple spaces to single space (e.g. `&nbsp;` handling), and keeps empty lines. Enable <strong>case-insensitive duplicate matching</strong> to treat <code>Hello</code> and <code>hello</code> as duplicate — perfect for keyword lists, email lists, and data cleaning.</p>
            </article>

            <article id="seo-features">
              <h3 className="text-xl font-bold mb-2">Free SEO Tools Included: Title Counter, Meta Description Checker & Slug Generator</h3>
              <p>Textlyzer includes: <strong>SEO title length checker (ideal 50-60 chars), meta description checker (ideal 150-160 chars), SEO score calculator, Google preview, keyword frequency analyzer, Flesch reading ease score, and URL slug generator</strong> supporting Hindi Unicode. Ideal for bloggers targeting <em>character counter SEO, word count for blog, title length checker</em> queries.</p>
            </article>

            <article id="faq">
              <h3 className="text-xl font-bold mb-3">FAQs - Character Counter Online</h3>
              <div className="grid gap-2">{[
                ["What is the difference between characters and words?","Characters are individual letters, numbers, spaces, punctuation. Words are separated by whitespace. Textlyzer shows both counts: chars, chars without spaces, and words."],
                ["Are spaces included in character count?","Yes. We show total characters WITH spaces and WITHOUT spaces, so you can match any platform limit like Twitter 280 or Instagram 2200."],
                ["Does your character counter support Hindi and Hinglish?","Yes. Full Hindi Unicode support. It correctly counts हिंदी अक्षर, English letters, Hinglish mix, and emoji like 😊 without breaking."],
                ["Will bold show ** stars?","No. Unlike markdown tools, Textlyzer uses real rich-text editor. Bold, italic, H1 are WYSIWYG — no ** or # visible."],
                ["How does duplicate remover work for SEO?","It removes repeated lines, keeps first occurrence, preserves order, normalizes spaces. Great for cleaning keyword lists, backlink lists, email lists for SEO."],
                ["How is reading and speaking time calculated?","Reading time = words / 225 WPM, Speaking time = words / 150 WPM. Rounded up. Useful for blog posts and YouTube scripts."],
                ["Is Textlyzer free and private?","100% free, no login. All counting happens in browser. Text saved in localStorage only, not sent to server."],
                ["Can I check social media character limits?","Yes. Count panel shows live check against X/Twitter 280, Instagram 2200, LinkedIn 3000, Facebook 63206, YouTube title 100, Google title 60."],
              ].map(([q,a])=><details key={q} className={`rounded-xl border p-4 open:bg-white/5 ${dark?"bg-[#1e2138] border-white/10":"bg-[#f7f8ff] border-black/5"}`}><summary className="font-semibold cursor-pointer list-none flex justify-between"><span>{q}</span><span>＋</span></summary><p className="mt-2 opacity-70">{a}</p></details>)}</div>
            </article>

            <article className="text-[12px] opacity-60 border-t pt-4">
              <p><strong>Related searches:</strong> character counter, word counter, letter counter, character count online, word count tool, Hindi word counter, duplicate line remover, SEO title checker, meta description length checker, text analyzer, reading time calculator, speaking time calculator, slug generator, free online text tools.</p>
            </article>
          </div>}
          <p className="text-[11px] opacity-40 mt-8 text-center">© 2026 Textlyzer PRO • Free Character Counter • Word Counter • SEO Analyzer • Duplicate Remover • Textlyzer.app</p>
        </section>
      </div>
    </div>
  );
}
