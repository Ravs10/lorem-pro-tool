"use client";
import { useState, useMemo } from "react";
import Link from "next/link";

export default function WordCounterPage() {
  const [text, setText] = useState("");

  const stats = useMemo(() => {
    const words = text.trim()? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    const charsNoSpace = text.replace(/\s/g, "").length;
    const sentences = text? text.split(/[.!?]+/).filter(s => s.trim().length > 0).length : 0;
    const paras = text? text.split(/\n+/).filter(p => p.trim().length > 0).length : 0;
    const readingTime = Math.ceil(words / 200);
    const speakingTime = Math.ceil(words / 130);

    // FIXED: TypeScript error fix here
    const wordArr: string[] = text.toLowerCase().match(/\b\w+\b/g) || [];
    const freq: Record<string, number> = {};
    wordArr.forEach((w: string) => {
      if (w.length > 2) {
        freq[w] = (freq[w] || 0) + 1;
      }
    });
    const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 5);

    return { words, chars, charsNoSpace, sentences, paras, readingTime, speakingTime, density: sorted };
  }, [text]);

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl md:text-4xl font-bold text-center">Free Word Counter & Character Counter Online</h1>
      <p className="text-center text-gray-600 mt-3">The most advanced word counter for bloggers, students & SEO experts.</p>
      <div className="mt-8 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Type or paste your text here..." className="w-full h-[420px] p-4 border-2 rounded-xl shadow-sm focus:border-black focus:outline-none text-base"></textarea>
          <div className="flex flex-wrap gap-2 mt-3">
            <button onClick={() => navigator.clipboard.writeText(text)} className="px-4 py-2 bg-black text-white rounded-lg">Copy Text</button>
            <button onClick={() => setText("")} className="px-4 py-2 border rounded-lg bg-white">Clear All</button>
            <button onClick={() => setText(text.toUpperCase())} className="px-4 py-2 border rounded-lg bg-white">UPPER</button>
            <button onClick={() => setText(text.toLowerCase())} className="px-4 py-2 border rounded-lg bg-white">lower</button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 h-fit">
          <div className="p-4 bg-gray-900 text-white rounded-xl"><p className="text-xs opacity-70">WORDS</p><p className="text-3xl font-bold">{stats.words}</p></div>
          <div className="p-4 bg-gray-50 rounded-xl border"><p className="text-xs text-gray-500">CHARACTERS</p><p className="text-3xl font-bold">{stats.chars}</p></div>
          <div className="p-4 bg-gray-50 rounded-xl border"><p className="text-xs text-gray-500">WITHOUT SPACES</p><p className="text-2xl font-bold">{stats.charsNoSpace}</p></div>
          <div className="p-4 bg-gray-50 rounded-xl border"><p className="text-xs text-gray-500">SENTENCES</p><p className="text-2xl font-bold">{stats.sentences}</p></div>
          <div className="p-4 bg-gray-50 rounded-xl border"><p className="text-xs text-gray-500">PARAGRAPHS</p><p className="text-2xl font-bold">{stats.paras}</p></div>
          <div className="p-4 bg-gray-50 rounded-xl border"><p className="text-xs text-gray-500">READING TIME</p><p className="text-lg font-bold">{stats.readingTime} min</p></div>
          <div className="col-span-2 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
            <p className="text-sm font-bold">Keyword Density (Top 5)</p>
            <div className="mt-2 space-y-1">
              {stats.density.length === 0? <p className="text-xs text-gray-500">Type 10+ words to see density</p> : stats.density.map((d) => (<div key={d[0]} className="flex justify-between text-xs"><span>{d[0]}</span><span className="font-bold">{d[1]}x ({((d[1]/stats.words)*100).toFixed(1)}%)</span></div>))}
            </div>
          </div>
        </div>
      </div>
      <section className="mt-16 p-6 bg-gray-50 rounded-2xl border">
        <h2 className="text-2xl font-bold">Try Our Other Free Pro Tools</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <Link href="/case-converter" className="p-4 bg-white rounded-xl border hover:bg-black hover:text-white transition">Case Converter</Link>
          <Link href="/placeholder-generator" className="p-4 bg-white rounded-xl border hover:bg-black hover:text-white transition">Placeholder Generator</Link>
        </div>
      </section>
    </main>
  )
}
