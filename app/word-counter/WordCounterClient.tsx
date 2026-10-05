"use client";
import { useState, useMemo } from "react";

export default function WordCounter() {
  const [text, setText] = useState("");

  const stats = useMemo(() => {
    const trimmed = text.trim();
    const words = trimmed? trimmed.split(/\s+/).filter(Boolean).length : 0;
    const chars = text.length;
    const charsNoSpace = text.replace(/\s/g, "").length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const paras = text.split(/\n+/).filter(p => p.trim().length > 0).length;
    const readingTime = Math.ceil(words / 200);

    // keyword density
    const freq: Record<string, number> = {};
    if (words > 0) {
      trimmed.toLowerCase().split(/\s+/).forEach(w => {
        const clean = w.replace(/[^a-z0-9]/g, "");
        if (clean.length > 2) freq[clean] = (freq[clean] || 0) + 1;
      });
    }
    const topKeywords = Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,5);

    return { words, chars, charsNoSpace, sentences, paras, readingTime, topKeywords };
  }, [text]);

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="max-w-5xl mx-auto p-4 md:p-8">
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">Word Counter - Free Online Counter</h1>
          <p className="text-gray-600 mt-2">Count words, characters, sentences, paragraphs & reading time instantly. 100% free & private.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border p-3">
              <textarea
                value={text}
                onChange={e=>setText(e.target.value)}
                placeholder="Type or paste your text here..."
                className="w-full h-[380px] p-4 rounded-xl border-none focus:ring-0 outline-none resize-none text-[16px]"
              />
              <div className="flex gap-2 p-2 border-t mt-2">
                <button onClick={()=>setText("")} className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg">Clear</button>
                <button onClick={()=>navigator.clipboard.writeText(text)} className="px-4 py-2 text-sm bg-gray-100 rounded-lg">Copy</button>
                <button onClick={()=>setText(text.toUpperCase())} className="px-4 py-2 text-sm bg-gray-100 rounded-lg">UPPER</button>
                <button onClick={()=>setText(text.toLowerCase())} className="px-4 py-2 text-sm bg-gray-100 rounded-lg">lower</button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Stat label="Words" value={stats.words} />
              <Stat label="Characters" value={stats.chars} />
              <Stat label="No Spaces" value={stats.charsNoSpace} />
              <Stat label="Sentences" value={stats.sentences} />
              <Stat label="Paragraphs" value={stats.paras} />
              <Stat label="Read Time" value={`${stats.readingTime} min`} />
            </div>

            <div className="bg-white rounded-2xl shadow-sm border p-4">
              <h3 className="font-bold text-sm mb-3">Top Keywords</h3>
              {stats.topKeywords.length === 0? <p className="text-xs text-gray-400">Type 3+ letter words to see density</p> :
                stats.topKeywords.map(([k,v])=>(
                  <div key={k} className="flex justify-between text-sm py-1 border-b last:border-0"><span>{k}</span><span className="font-bold">{v}x</span></div>
                ))
              }
            </div>
          </div>
        </div>

        <div className="mt-12 bg-white rounded-2xl border p-6 prose max-w-none">
  <h2 className="text-xl font-bold">What is Word Counter? (FAQ for Google)</h2>
  <p className="text-sm text-gray-600">Our free word counter helps writers, students and SEO experts count words and characters accurately. Perfect for essays, blogs, and social media captions.</p>
  
  <h3 className="font-bold mt-4">How many words is 500 characters?</h3>
  <p className="text-sm text-gray-600">Approx 70-100 words.</p>

  <h3 className="font-bold mt-3">Is this word counter free?</h3>
  <p className="text-sm text-gray-600">Yes, 100% free, no login, data never leaves your browser — fully private.</p>
  
  <h3 className="font-bold mt-3">Can I count keyword density?</h3>
  <p className="text-sm text-gray-600">Yes, we show top 5 keywords automatically for SEO.</p>
</div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: any }) {
  return (
    <div className="bg-white border shadow-sm rounded-xl p-4">
      <div className="text-[11px] uppercase tracking-wider text-gray-500">{label}</div>
      <div className="text-xl font-extrabold mt-1">{value}</div>
    </div>
  );
}
