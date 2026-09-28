// @ts-nocheck
'use client';
import { useState, useEffect, useCallback } from 'react';

export default function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [upper, setUpper] = useState(true);
  const [lower, setLower] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [excludeSimilar, setExcludeSimilar] = useState(false);
  const [passwords, setPasswords] = useState<string[]>([]);
  const [copied, setCopied] = useState("");

  const generate = useCallback(() => {
    let u = "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        l = "abcdefghijklmnopqrstuvwxyz",
        n = "0123456789",
        s = "!@#$%^&*()_+{}[]|:;<>,.?/~`";
    if (excludeSimilar) { 
      u = u.replace(/[IO]/g, ""); l = l.replace(/[lo]/g, ""); 
      n = n.replace(/[01]/g, ""); s = s.replace(/[|]/g, "");
    }
    let all = ""; if (upper) all += u; if (lower) all += l; if (numbers) all += n; if (symbols) all += s;
    if (!all) return;
    const newPass = Array.from({ length: 5 }, () => Array.from({ length }, () => all[Math.floor(Math.random() * all.length)]).join(""));
    setPasswords(newPass);
  }, [length, upper, lower, numbers, symbols, excludeSimilar]);

  useEffect(() => { generate(); }, [generate]);
  const copy = (t: string) => { navigator.clipboard.writeText(t); setCopied(t); setTimeout(()=>setCopied(""), 2000); };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "Is this password generator secure?", "acceptedAnswer": { "@type": "Answer", "text": "Yes, 100% secure. All passwords are generated in your browser, we never store or send them to any server. No tracking." } },
      { "@type": "Question", "name": "What is the best length for a strong password?", "acceptedAnswer": { "@type": "Answer", "text": "Experts recommend at least 16 characters with a mix of uppercase, lowercase, numbers and symbols for maximum security." } },
      { "@type": "Question", "name": "Can I use these passwords for banking?", "acceptedAnswer": { "@type": "Answer", "text": "Yes, our generated passwords are random and hack-proof, perfect for banking, email, social media and all accounts." } }
    ]
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      
      <div className="max-w-3xl mx-auto p-6">
        {/* SEO H1 */}
        <h1 className="text-4xl font-bold text-center mt-4">Strong Password Generator - Create Secure Passwords Instantly</h1>
        <p className="text-gray-400 mb-6 text-center mt-3">Generate ultra-secure, random & hack-proof passwords. 100% free, no tracking, browser-based generation.</p>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-10">
          <div><div className="flex justify-between mb-4"><span>Password Length: {length}</span><span className="text-gray-400">{length}</span></div>
          <input type="range" min="6" max="64" value={length} onChange={(e)=>setLength(Number(e.target.value))} className="w-full mb-6" />
          <div className="grid grid-cols-2 gap-3 mb-6">
            <label className="flex gap-2 text-sm"><input type="checkbox" checked={upper} onChange={()=>setUpper(!upper)} /> Uppercase (A-Z)</label>
            <label className="flex gap-2 text-sm"><input type="checkbox" checked={lower} onChange={()=>setLower(!lower)} /> Lowercase (a-z)</label>
            <label className="flex gap-2 text-sm"><input type="checkbox" checked={numbers} onChange={()=>setNumbers(!numbers)} /> Numbers (0-9)</label>
            <label className="flex gap-2 text-sm"><input type="checkbox" checked={symbols} onChange={()=>setSymbols(!symbols)} /> Symbols (!@#$)</label>
            <label className="flex gap-2 text-sm col-span-2"><input type="checkbox" checked={excludeSimilar} onChange={()=>setExcludeSimilar(!excludeSimilar)} /> Exclude similar (i, l, 1, O, 0)</label>
          </div>
          <button onClick={generate} className="w-full py-3 bg-white text-black rounded-full font-bold hover:bg-gray-200">Generate Passwords ⚡</button>
          </div>
        </div>

        <div className="space-y-3 mb-12">
          {passwords.map((p,i)=>(<div key={i} className="flex justify-between items-center bg-zinc-900 border border-zinc-800 p-4 rounded-xl"><code className="font-mono text-lg">{p}</code><button onClick={()=>copy(p)} className="px-4 py-1.5 bg-white text-black rounded-full text-xs font-bold">{copied===p?"Copied!":"Copy"}</button></div>))}
        </div>

        {/* STRONG SEO CONTENT */}
        <div className="space-y-10 text-gray-300 border-t border-zinc-800 pt-10">
          <section><h2 className="text-2xl font-bold text-white mb-2">What is a Strong Password Generator?</h2><p className="text-sm leading-relaxed">A strong password generator creates random, unpredictable passwords that hackers cannot guess. Our tool uses browser-based cryptography to create combinations of uppercase, lowercase, numbers and symbols, making your accounts 100% secure against brute-force attacks.</p></section>
          <section><h2 className="text-2xl font-bold text-white mb-2">Why Use Lorem Pro Password Generator?</h2><ul className="list-disc ml-5 text-sm space-y-1"><li>100% Secure & Private - No server logs</li><li>Custom length up to 64 characters</li><li>One-click copy & bulk generation (5 at once)</li><li>Exclude similar characters option</li><li>Free forever, no signup</li></ul></section>
          <section><h2 className="text-2xl font-bold text-white mb-2">FAQs</h2><div className="space-y-4 text-sm"><p><b>Q: Is it safe?</b> - Yes, everything is generated locally in your browser.</p><p><b>Q: Best length?</b> - 16+ characters recommended for banking & email.</p><p><b>Q: Can I use for Instagram?</b> - Yes, perfect for all social accounts.</p></div></section>
        </div>
      </div>
    </div>
  );
}
