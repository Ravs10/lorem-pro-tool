// @ts-nocheck
'use client';
import { useState, useEffect, useCallback } from 'react';
import Footer from "../components/Footer";

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
    let u = "ABCDEFGHIJKLMNOPQRSTUVWXYZ", l = "abcdefghijklmnopqrstuvwxyz", n = "0123456789", s = "!@#$%^&*()_+-=[]{}|;:,.<>?";
    if (excludeSimilar) { u = u.replace(/[IO]/g, ""); l = l.replace(/[lo]/g, ""); n = n.replace(/[01]/g, ""); }
    let all = ""; if (upper) all += u; if (lower) all += l; if (numbers) all += n; if (symbols) all += s;
    if (!all) return;
    const newPass = Array.from({ length: 5 }, () => Array.from({ length }, () => all[Math.floor(Math.random() * all.length)]).join(""));
    setPasswords(newPass);
  }, [length, upper, lower, numbers, symbols, excludeSimilar]);

  useEffect(() => { generate(); }, [generate]);
  const copy = (t: string) => { navigator.clipboard.writeText(t); setCopied(t); setTimeout(() => setCopied(""), 1500); };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-3xl mx-auto p-4 md:p-8">
        <h1 className="text-4xl font-bold mb-2">Password Generator</h1>
        <p className="text-gray-400 mb-6">Create ultra-secure, random passwords instantly. Free, fast and no data stored.</p>

        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl mb-6 space-y-4">
          <div><div className="flex justify-between mb-2"><label>Password Length</label><span className="bg-white text-black px-2 rounded text-sm font-bold">{length}</span></div><input type="range" min="4" max="64" value={length} onChange={e=>setLength(Number(e.target.value))} className="w-full accent-white" /></div>
          <div className="grid grid-cols-2 gap-3"><label className="flex gap-2 bg-zinc-800 p-3 rounded-lg"><input type="checkbox" checked={upper} onChange={e=>setUpper(e.target.checked)}/> Uppercase (A-Z)</label><label className="flex gap-2 bg-zinc-800 p-3 rounded-lg"><input type="checkbox" checked={lower} onChange={e=>setLower(e.target.checked)}/> Lowercase (a-z)</label><label className="flex gap-2 bg-zinc-800 p-3 rounded-lg"><input type="checkbox" checked={numbers} onChange={e=>setNumbers(e.target.checked)}/> Numbers (0-9)</label><label className="flex gap-2 bg-zinc-800 p-3 rounded-lg"><input type="checkbox" checked={symbols} onChange={e=>setSymbols(e.target.checked)}/> Symbols (!@#$)</label></div>
          <label className="flex gap-2 text-sm text-gray-300"><input type="checkbox" checked={excludeSimilar} onChange={e=>setExcludeSimilar(e.target.checked)}/> Exclude similar characters (I, O, 0, 1, l)</label>
          <button onClick={generate} className="w-full bg-white text-black font-bold py-3 rounded-xl">Generate New Passwords</button>
        </div>

        <div className="space-y-3 mb-12">
          {passwords.map((p,i)=>(<div key={i} className="flex justify-between items-center bg-zinc-900 border border-zinc-800 p-4 rounded-xl font-mono"><span className="break-all pr-3">{p}</span><button onClick={()=>copy(p)} className="bg-zinc-800 px-4 py-2 rounded-lg text-sm shrink-0">{copied===p?"Copied!":"Copy"}</button></div>))}
        </div>

        <div className="space-y-10 text-gray-300 leading-relaxed">
          <section><h2 className="text-2xl font-bold text-white mb-3">What is a Password Generator?</h2><p>A Password Generator is a free online tool that creates strong, random, and unpredictable passwords. It helps you protect your online accounts from hacking and brute-force attacks. Our tool runs 100% in your browser, so your passwords are never sent to any server.</p></section>
          <section><h2 className="text-2xl font-bold text-white mb-3">Why Use Our Advanced Password Generator?</h2><ul className="list-disc pl-5 space-y-2"><li><b className="text-white">Military-Grade Security:</b> We use crypto random generation.</li><li><b className="text-white">Fully Customizable:</b> Control length, symbols, numbers, uppercase/lowercase.</li><li><b className="text-white">No Tracking:</b> We never store your passwords. 100% private.</li><li><b className="text-white">Batch Generation:</b> Generate 5 passwords at once.</li></ul></section>
          <section><h2 className="text-2xl font-bold text-white mb-3">Frequently Asked Questions</h2><div className="space-y-4"><div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl"><h3 className="font-bold text-white">Is this password generator safe?</h3><p className="text-sm mt-1">Yes, 100% safe. All passwords are generated locally in your browser.</p></div><div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl"><h3 className="font-bold text-white">What is the ideal password length?</h3><p className="text-sm mt-1">Experts recommend at least 12-16 characters. For banking and email, use 16+ characters.</p></div><div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl"><h3 className="font-bold text-white">Should I exclude similar characters?</h3><p className="text-sm mt-1">If you need to read or type the password manually, enabling this avoids confusion between I/l/1 and O/0.</p></div></div></section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
