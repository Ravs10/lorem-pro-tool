"use client";
import { useEffect, useMemo, useRef, useState } from "react";
type Tab = "count" | "clean" | "seo" | "goals" | "analyze" | "tools" | "diff";

function countEmoji(str: string): number {
  let c = 0;
  for (let i = 0; i < str.length; ) {
    const cp = str.codePointAt(i) || 0;
    if ((cp >= 0x1f300 && cp <= 0x1faff) || (cp >= 0x2600 && cp <= 0x27bf) || (cp >= 0x1f1e0 && cp <= 0x1f1ff)) c++;
    i += cp > 0xffff? 2 : 1;
  }
  return c;
}
function removeEmojiSafe(str: string): string {
  let out = "";
  for (let i = 0; i < str.length; ) {
    const cp = str.codePointAt(i) || 0;
    const emoji = (cp >= 0x1f300 && cp <= 0x1faff) || (cp >= 0x2600 && cp <= 0x27bf) || (cp >= 0x1f1e0 && cp <= 0x1f1ff);
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
function plainTextToHtml(s: string) { return escapeHtml(s).replace(/\n/g, "<br>"); }
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
  a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url);
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
  useEffect(() => { localStorage.setItem("adv_text", text); }, [text]);
  useEffect(() => { localStorage.setItem("adv_goal", String(goal)); }, [goal]);

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
    let syll = 0; text.trim().split(/\s+/).forEach((w) => (syll += countSyllables(w)));
    const flesch = words && sentences? 206.835 - 1.015 * (words / sentences) - 84.6 * (syll / words) : 0;
    const reading = words? Math.max(1, Math.ceil(words / 225)) : 0;
    const speakingM = words? Math.max(1, Math.ceil(words / 150)) : 0;
    const stop = new Set(["the","and","is","in","to","a","of","for","on","with","this","that","are","be","it","as","at","by","from","hai","aur","ke","ka","ko","mein","hain","ki","se"]);
    const freq: Record<string, number> = {};
    text.toLocaleLowerCase().split(/[^\p{L}\p{N}]+/u).filter((w) => w.length > 2 &&!stop.has(w)).forEach((w) => (freq[w] = (freq[w] || 0) + 1));
    const top = Object.entries(freq).sort((a,b) => b[1]-a[1]).slice(0,12);
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
    return Math.min(100,s);
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

  const restoreSelectionIfNeeded = () => {
    const editor = editorRef.current;
    const selection = window.getSelection();
    const savedRange = savedSelectionRef.current;
    if (!editor ||!selection ||!savedRange) return;
    if (!editor.contains(savedRange.commonAncestorContainer)) return;
    // Only restore if current selection is outside or collapsed
    if (selection.rangeCount === 0 ||!editor.contains(selection.getRangeAt(0).commonAncestorContainer)) {
      editor.focus();
      selection.removeAllRanges();
      selection.addRange(savedRange.cloneRange());
    }
  };

  // FIXED: Bold/Italic/Underline + List
  const format = (command: string, value?: string) => {
    const editor = editorRef.current;
    if (!editor) return;

    // For Bold/Italic/Underline - first restore, then exec
    const isInline = ["bold","italic","underline"].includes(command);
    const isList = command === "insertUnorderedList" || command === "insertOrderedList";

    if (isInline) {
      restoreSelectionIfNeeded();
      editor.focus();
      document.execCommand(command, false, value);
    } else if (isList) {
      editor.focus();
      restoreSelectionIfNeeded();
      try { document.execCommand("defaultParagraphSeparator", false, "p"); } catch {}

      const sel = window.getSelection();
      const rangeBefore = sel?.rangeCount? sel.getRangeAt(0).cloneRange() : null;
      const htmlBefore = editor.innerHTML;

      document.execCommand(command, false);

      // Fallback when browser doesn't create list
      if (editor.innerHTML === htmlBefore && rangeBefore) {
        if (!rangeBefore.collapsed) {
          const selectedText = rangeBefore.toString();
          if (selectedText) {
            const list = document.createElement(command === "insertUnorderedList"? "ul" : "ol");
            selectedText.split(/\r?\n/).forEach((line) => {
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
          // No selection, create new list item at caret
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
      editor.focus();
      restoreSelectionIfNeeded();
      document.execCommand(command, false, value);
    }

    localStorage.setItem("adv_html", editor.innerHTML);
    setText(readEditor());
    // Save new position after command
    setTimeout(saveEditorSelection, 0);
  };

  const formatBlock = (tag: "h1" | "h2" | "p" | "blockquote") => format("formatBlock", `<${tag}>`);
  const insertLink = () => { const url = window.prompt("Enter URL"); if (url) format("createLink", url); };
  const onEditorInput = () => { setText(readEditor()); localStorage.setItem("adv_html", editorRef.current?.innerHTML || ""); };
  const clearFormatting = () => { format("removeFormat"); format("formatBlock", "<p>"); };

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
    if (!selectedText) { alert("Please select the text you want to copy."); return; }
    try { await navigator.clipboard.writeText(selectedText); }
    catch {
      const area = document.createElement("textarea");
      area.value = selectedText; area.style.position = "fixed"; area.style.opacity = "0";
      document.body.appendChild(area); area.select(); document.execCommand("copy"); area.remove();
    }
  };

  const toggleVoice = () => {
    if (listening) { recognitionRef.current?.stop(); setListening(false); return; }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return alert("Voice typing not supported. Try Chrome.");
    const rec = new SR();
    rec.lang = "hi-IN"; rec.interimResults = false; rec.continuous = false;
    rec.onstart = () => setListening(true); rec.onend = () => setListening(false);
    rec.onresult = (e: any) => { const spoken = e.results[0][0].transcript; focusEditor(); format("insertText", (text? " " : "") + spoken); };
    recognitionRef.current = rec; rec.start();
  };
  const toggleSpeak = () => {
    if (typeof window === "undefined" || typeof window.speechSynthesis === "undefined") return alert("TTS not supported");
    const synth = window.speechSynthesis;
    if (speaking || synth.speaking) { synth.cancel(); setSpeaking(false); return; }
    if (!text.trim()) return alert("Enter text to speak");
    const ut = new SpeechSynthesisUtterance(text.trim());
    ut.lang = /[अ-ह]/.test(text)? "hi-IN" : "en-US";
    ut.onstart = () => setSpeaking(true); ut.onend = () => setSpeaking(false); ut.onerror = () => setSpeaking(false);
    synth.speak(ut);
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
  const button = "px-3 py-2 rounded-xl border text-xs font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:scale-95";
  const surface = dark? "bg-[#161826]/80 border-white/10" : "bg-white border-black/10";
  const input = dark? "bg-[#1e2138] border-white/10 text-white" : "bg-white border-black/10";

  return (
    <div className={dark? "dark" : ""}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');
        *{font-family:'Outfit',sans-serif}
       .rich-editor h1{font-size:2rem;font-weight:800;line-height:1.2;margin:.7em 0}
       .rich-editor h2{font-size:1.5rem;font-weight:800;line-height:1.25;margin:.65em 0}
       .rich-editor p{margin:.45em 0}
       .rich-editor blockquote{border-left:4px solid #6d5dfc;padding-left:1rem;opacity:.8;font-style:italic}
        /* FIX: List symbols visible */
       .rich-editor ul{list-style-type: disc!important; padding-left:1.8rem!important; margin:.6em 0}
       .rich-editor ol{list-style-type: decimal!important; padding-left:1.8rem!important; margin:.6em 0}
       .rich-editor li{display:list-item!important; margin:.25em 0}
       .rich-editor{overflow-wrap:anywhere;word-break:break-word;white-space:pre-wrap;min-width:0;max-width:100%}
       .rich-editor *{overflow-wrap:anywhere;word-break:break-word;max-width:100%}
       .rich-editor a{color:#8b7cff;text-decoration:underline;word-break:break-all}
       .rich-editor:empty:before{content:attr(data-placeholder);opacity:.4}
       .tip{position:relative}.tip:hover:after{content:attr(data-tip);position:absolute;z-index:100;bottom:calc(100% + 8px);left:50%;transform:translateX(-50%);white-space:nowrap;padding:6px 9px;border-radius:8px;background:#10111b;color:white;font-size:11px;box-shadow:0 8px 25px rgba(0,0,0,.3);pointer-events:none}
       .card-hover{transition:transform.2s ease,box-shadow.2s ease}.card-hover:hover{transform:translateY(-3px);box-shadow:0 12px 35px rgba(0,0,0,.14)}
       .editor-wrap{overflow-x:hidden;max-width:100%}
       .rich-editor{word-break:break-all!important;overflow-wrap:break-word!important;white-space:pre-wrap!important}
       .rich-editor b,.rich-editor strong{font-weight:800}
       .rich-editor i,.rich-editor em{font-style:italic}
       .rich-editor u{text-decoration:underline}
      `}</style>
      <div className={`min-h-screen ${dark? "bg-[#0e0f1a] text-white" : "bg-[#f7f8ff] text-[#151a2d]"}`}>
        <header className={`sticky top-0 z-50 w-full border-b backdrop-blur-xl ${dark? "bg-[#12131f]/95 border-white/10" : "bg-white/95 border-black/10"}`}>
          <div className="max-w-[1280px] mx-auto flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2"><div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#5b5bff] to-[#9b5cff] flex items-center justify-center font-bold text-white shadow-lg">T</div><span className="font-bold text-[19px]">Text<span className="text-[#7b6cff]">lyzer</span> <span className="opacity-50 text-[12px]">PRO</span></span></div>
            <button className={`${button} w-10 h-10 rounded-full`} onClick={() => { setDark(!dark); localStorage.setItem("theme",!dark? "dark" : "light"); }}>{dark? "☀️" : "🌙"}</button>
          </div>
          <div className="max-w-[1280px] mx-auto px-3 pb-3 flex flex-wrap gap-2">
            {tabs.map((t) => <button key={t.id} onClick={() => setTab(t.id)} className={`${button} px-5 ${tab === t.id? "bg-[#5b5bff] text-white border-[#5b5bff]" : dark? "bg-[#1e2138] border-white/10" : "bg-white border-black/10"}`}>{t.label}</button>)}
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
              <button data-tip="Undo" className={`${button} tip`} onMouseDown={(e) => e.preventDefault()} onClick={() => format("undo")}>↶</button>
              <button data-tip="Redo" className={`${button} tip`} onMouseDown={(e) => e.preventDefault()} onClick={() => format("redo")}>↷</button>
              <button className={`${button} ${listening? "bg-red-500 text-white animate-pulse" : "bg-[#5b5bff] text-white"}`} onClick={toggleVoice}>{listening? "● Listening" : "🎙️"}</button>
              <button className={`${button} ${speaking? "bg-red-500 text-white" : "bg-emerald-600 text-white"}`} onClick={toggleSpeak}>{speaking? "■" : "🔊"}</button>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              <button className={`${button} tip`} data-tip="Copy selected only" onMouseDown={(e) => e.preventDefault()} onClick={copySelectedText}>📋 Copy</button>
              <button className={button} onClick={() => syncEditor("")}>🗑 Clear</button>
              <button className={button} onClick={() => syncEditor(text.toUpperCase())}>UPPER</button>
              <button className={button} onClick={() => syncEditor(text.toLowerCase())}>lower</button>
              <button className={button} onClick={() => syncEditor(removeEmojiSafe(text))}>Remove Emoji</button>
              <button className={button} onClick={() => downloadFile("textlyzer.txt", text)}>⬇ TXT</button>
              <button className={button} onClick={() => downloadFile("textlyzer.html", editorRef.current?.innerHTML || "", "text/html")}>⬇ HTML</button>
            </div>

            {tab === "diff"? (
              <div className="grid md:grid-cols-2 gap-3">
                <div><label className="text-xs opacity-60 mb-1 block">Original</label><div ref={editorRef} contentEditable suppressContentEditableWarning onInput={onEditorInput} className={`rich-editor w-full min-w-0 min-h-[380px] p-4 rounded-[16px] border outline-none text-[16px] leading-7 overflow-auto ${input}`} onMouseUp={saveEditorSelection} onKeyUp={saveEditorSelection} data-placeholder="Original..." /></div>
                <div><label className="text-xs opacity-60 mb-1 block">Modified</label><textarea value={diffB} onChange={(e) => setDiffB(e.target.value)} className={`w-full min-h-[380px] p-4 rounded-[16px] border outline-none text-[15px] ${input}`} /></div>
              </div>
            ) : (
              <div ref={editorRef} contentEditable suppressContentEditableWarning onInput={onEditorInput} className={`rich-editor w-full min-w-0 min-h-[380px] max-h-[620px] p-4 rounded-[16px] border outline-none text-[16px] leading-7 overflow-auto resize-y ${input}`} onMouseUp={saveEditorSelection} onKeyUp={saveEditorSelection} data-placeholder="Type or paste here..." />
            )}

            <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-4">
              {[["Chars", stats.chars],["Words", stats.words],["No Space", stats.charsNoSpace],["Sentences", stats.sentences],["Paras", stats.paras],["Lines", stats.lines],["Emoji", stats.emoji],["Reading", stats.reading+"m"],["Speaking", stats.speakingM+"m"],["Flesch", Math.round(stats.flesch)],["Lang", stats.lang],["Size", (stats.chars/1024).toFixed(2)+"KB"]].map(([l,v]) => <div key={String(l)} className={`rounded-[12px] border p-2.5 text-center ${dark? "bg-[#1e2138] border-white/10" : "bg-[#f7f8ff] border-black/5"}`}><div className="font-bold text-[15px]">{v as any}</div><div className="text-[10px] uppercase opacity-60">{l as string}</div></div>)}
            </div>
          </section>
          <aside className="space-y-4">
            {tab === "clean" && <div className={`rounded-[20px] border p-4 space-y-3 ${surface}`}><h4 className="font-bold">Clean & Replace</h4><input value={find} onChange={(e)=>setFind(e.target.value)} placeholder="Find..." className={`w-full px-3 py-2.5 rounded-[12px] border text-sm ${input}`} /><input value={replace} onChange={(e)=>setReplace(e.target.value)} placeholder="Replace..." className={`w-full px-3 py-2.5 rounded-[12px] border text-sm ${input}`} /><button className="w-full py-2.5 rounded-full bg-[#5b5bff] text-white font-bold" onClick={()=>find && syncEditor(text.split(find).join(replace))}>Replace All</button><div className="grid grid-cols-2 gap-2"><button className={button} onClick={()=>syncEditor(text.replace(/[ \t]+/g," "))}>Extra Spaces</button><button className={button} onClick={()=>syncEditor(text.split("\n").filter((l)=>l.trim()).join("\n"))}>Empty Lines</button><button className={button} onClick={()=>syncEditor(removeDuplicateLines(text, duplicateCaseInsensitive))}>Duplicates</button><button className={button} onClick={()=>syncEditor(text.split("\n").map((l,i)=>`${i+1}. ${l}`).join("\n"))}>Add Numbers</button></div><label className="flex items-center gap-2 text-xs opacity-75"><input type="checkbox" checked={duplicateCaseInsensitive} onChange={(e)=>setDuplicateCaseInsensitive(e.target.checked)} /> Case-insensitive</label></div>}
            {tab === "tools" && <div className={`rounded-[20px] border p-4 grid grid-cols-2 gap-2 ${surface}`}><button className={button} onClick={()=>syncEditor("Lorem ipsum dolor sit amet. ".repeat(20))}>Lorem 100w</button><button className={button} onClick={()=>syncEditor(btoa(unescape(encodeURIComponent(text))))}>Base64 Encode</button><button className={button} onClick={()=>{try{syncEditor(decodeURIComponent(escape(atob(text))))}catch{alert("Invalid Base64")}}}>Base64 Decode</button><button className={button} onClick={()=>syncEditor(text.toLowerCase().replace(/[^a-z0-9]+/g,"-"))}>Slugify</button><button className={button} onClick={()=>syncEditor(Array.from(text).reverse().join(""))}>Reverse</button><button className={button} onClick={()=>syncEditor(text.trim()?text.trim().split(/\s+/).map(w=>`#${w}`).join(" "):"")}>Hashtags</button></div>}
          </aside>
        </main>
      </div>
    </div>
  );
}
