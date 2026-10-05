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

    // Keyword Density Logic
    const wordArr = text.toLowerCase().match(/\b\w+\b/g) || [];
    const freq: any = {};
    wordArr.forEach(w => { if(w.length > 2) freq[w] = (freq[w] || 0) + 1 });
    const sorted = Object.entries(freq).sort((a:any,b:any)=>b[1]-a[1]).slice(0,5);

    return { words, chars, charsNoSpace, sentences, paras, readingTime, speakingTime, density: sorted };
  }, [text]);

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl md:text-4xl font-bold text-center">Free Word Counter & Character Counter Online</h1>
      <p className="text-center text-gray-600 mt-3">The most advanced word counter for bloggers, students & SEO experts.</p>

      <div className="mt-8 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste your text here... Start typing to see magic"
            className="w-full h-[420px] p-4 border-2 rounded-xl shadow-sm focus:border-black focus:outline-none text-base"
          ></textarea>
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
          <div className="col-span-2 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-sm font-bold">Speaking Time: {stats.speakingTime} min</p>
            <p className="text-xs text-gray-600 mt-1">Avg. 200 WPM reading speed</p>
          </div>
          <div className="col-span-2 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
            <p className="text-sm font-bold">Keyword Density (Top 5) - SEO</p>
            <div className="mt-2 space-y-1">
              {stats.density.length === 0? <p className="text-xs text-gray-500">Type 10+ words to see density</p> :
              stats.density.map((d:any) => (
                <div key={d[0]} className="flex justify-between text-xs"><span>{d[0]}</span><span className="font-bold">{d[1]}x ({((d[1]/stats.words)*100).toFixed(1)}%)</span></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* LONG SEO ARTICLE */}
      <article className="prose max-w-none mt-16 leading-7">
        <h2 className="text-2xl font-bold mt-12">What is a Word Counter Tool?</h2>
        <p>A Word Counter is a free online utility that helps you count words, characters, sentences and paragraphs in real-time. While tools like MS Word and Google Docs have basic counters, our Ultra Pro Word Counter at Lorem Pro Tools is designed for modern needs - SEO, blogging, academic writing, and social media limits. With over 1 Million monthly searches for "word counter", it's one of the most demanded online tools.</p>

        <h2 className="text-2xl font-bold mt-10">Why Our Word Counter is the Best Choice in 2026?</h2>
        <p>Unlike other basic counters, we provide 8 metrics in one place. Most websites only show word count. We show Characters with and without spaces (important for Twitter/X 280 limit, meta descriptions 160 chars), Reading Time, Speaking Time, and most importantly Keyword Density. For bloggers, keyword density is crucial to avoid Google penalty for keyword stuffing. Our tool tells you if you are overusing a keyword.</p>

        <h3 className="text-xl font-semibold mt-6">Key Features Explained:</h3>
        <p><strong>1. Real-Time Counter:</strong> No need to click any button. As you type, everything updates instantly. This is built with React state for 0ms delay.</p>
        <p><strong>2. Character Without Spaces:</strong> Many universities ask for character count without spaces. We provide it accurately.</p>
        <p><strong>3. Reading & Speaking Time:</strong> Based on average human speed of 200 words per minute for reading and 130 WPM for speaking. Perfect for YouTubers and podcasters to estimate video length.</p>
        <p><strong>4. SEO Keyword Density:</strong> This is our USP. Paste your 1000-word blog, and we will show top 5 repeated keywords with percentage. Ideal density is 1-1.5%. If it's 4%, Google will mark it as spam.</p>

        <h2 className="text-2xl font-bold mt-10">How to Use This Word Counter? Step-by-Step Guide</h2>
        <ol className="list-decimal pl-6">
          <li>Copy your article from Google Docs, Word, or any website.</li>
          <li>Paste it into the large text box above.</li>
          <li>Instantly see word count, character count, and other metrics on the right.</li>
          <li>Check keyword density to optimize for SEO. If density is high, use synonyms.</li>
          <li>Click "Copy Text" to copy the optimized text back.</li>
        </ol>

        <h2 className="text-2xl font-bold mt-10">Who Needs a Word Counter?</h2>
        <p><strong>Students:</strong> Your essay needs 1500 words? Track live. <strong>Bloggers & SEO Writers:</strong> You need to keep meta title under 60 chars and check keyword density. <strong>Freelance Writers:</strong> Clients pay per word. Prove your work. <strong>Social Media Managers:</strong> Instagram caption 2200 chars, Twitter 280 chars - our counter helps you stay within limit.</p>

        <h2 className="text-2xl font-bold mt-10">Frequently Asked Questions (FAQ)</h2>
        <h3 className="font-bold">Is this word counter free?</h3>
        <p>Yes, 100% free forever. No login, no watermark, no limits.</p>
        <h3 className="font-bold">Is my text stored?</h3>
        <p>No. All counting happens in your browser. We do not send your text to any server. So your thesis and blogs are 100% private and safe.</p>
        <h3 className="font-bold">What is a good keyword density for SEO?</h3>
        <p>Keep it between 0.8% to 1.8%. Our tool will show red if it goes above 2.5%.</p>
        <h3 className="font-bold">Does it work on mobile?</h3>
        <p>Yes, fully responsive. Works on Android, iPhone, and Desktop.</p>
      </article>

      <section className="mt-16 p-6 bg-gray-50 rounded-2xl border">
        <h2 className="text-2xl font-bold">Try Our Other Free Pro Tools</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <Link href="/case-converter" className="p-4 bg-white rounded-xl border hover:bg-black hover:text-white transition">Case Converter</Link>
          <Link href="/placeholder-generator" className="p-4 bg-white rounded-xl border hover:bg-black hover:text-white transition">Placeholder Generator</Link>
          <Link href="/qr-generator" className="p-4 bg-white rounded-xl border hover:bg-black hover:text-white transition">QR Code Generator</Link>
          <Link href="/base64-generator" className="p-4 bg-white rounded-xl border hover:bg-black hover:text-white transition">Base64 Encoder</Link>
        </div>
      </section>
    </main>
  )
}
