"use client";
import { useState, useMemo } from "react";

export default function WordCounter() {
  const [text, setText] = useState("");
  const stats = useMemo(() => {
    const words = text.trim()? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    const charsNoSpace = text.replace(/\s/g, "").length;
    const sentences = text.split(/[.!?]+/).filter(Boolean).length;
    const paras = text.split(/\n+/).filter(Boolean).length;
    return { words, chars, charsNoSpace, sentences, paras };
  }, [text]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Word Counter Tool</h1>
      <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Type here..." className="w-full h-64 p-4 border rounded-xl" />
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
        <div className="p-4 bg-gray-100 rounded">Words: {stats.words}</div>
        <div className="p-4 bg-gray-100 rounded">Chars: {stats.chars}</div>
        <div className="p-4 bg-gray-100 rounded">No Space: {stats.charsNoSpace}</div>
        <div className="p-4 bg-gray-100 rounded">Sentences: {stats.sentences}</div>
        <div className="p-4 bg-gray-100 rounded">Paras: {stats.paras}</div>
      </div>
    </div>
  );
}
