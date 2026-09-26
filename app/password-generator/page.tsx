"use client";
import { useState, useEffect, useCallback } from "react";

export default function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [upper, setUpper] = useState(true);
  const [lower, setLower] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [excludeSimilar, setExcludeSimilar] = useState(false);
  const [passwords, setPasswords] = useState<string[]>([]);
  const [copied, setCopied] = useState<string>("");

  const generate = useCallback(() => {
    let upperChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let lowerChars = "abcdefghijklmnopqrstuvwxyz";
    let numberChars = "0123456789";
    let symbolChars = "!@#$%^&*()_+-=[]{}|;:,.<>?";
    if (excludeSimilar) {
      upperChars = upperChars.replace(/[IO]/g, "");
      lowerChars = lowerChars.replace(/[lo]/g, "");
      numberChars = numberChars.replace(/[01]/g, "");
    }
    let all = "";
    if (upper) all += upperChars;
    if (lower) all += lowerChars;
    if (numbers) all += numberChars;
    if (symbols) all += symbolChars;
    if (!all) return;

    const newPass = Array.from({ length: 5 }, () => {
      let p = "";
      for (let i = 0; i < length; i++) {
        p += all[Math.floor(Math.random() * all.length)];
      }
      return p;
    });
    setPasswords(newPass);
  }, [length, upper, lower, numbers, symbols, excludeSimilar]);

  useEffect(() => { generate(); }, [generate]);

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(""), 1500);
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">🔐 Advanced Password Generator</h1>
      <p className="text-gray-400 mb-6">Ultra-secure, random passwords with strength analysis</p>

      <div className="bg-zinc-900 p-5 rounded-xl mb-6 space-y-4">
        <div>
          <label className="flex justify-between mb-2">Length: {length} <span className="text-sm text-gray-400">4-64</span></label>
          <input type="range" min="4" max="64" value={length} onChange={e=>setLength(Number(e.target.value))} className="w-full" />
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <label className="flex gap-2"><input type="checkbox" checked={upper} onChange={e=>setUpper(e.target.checked)}/> Uppercase (A-Z)</label>
          <label className="flex gap-2"><input type="checkbox" checked={lower} onChange={e=>setLower(e.target.checked)}/> Lowercase (a-z)</label>
          <label className="flex gap-2"><input type="checkbox" checked={numbers} onChange={e=>setNumbers(e.target.checked)}/> Numbers (0-9)</label>
          <label className="flex gap-2"><input type="checkbox" checked={symbols} onChange={e=>setSymbols(e.target.checked)}/> Symbols (!@#$)</label>
        </div>
        <label className="flex gap-2 text-sm"><input type="checkbox" checked={excludeSimilar} onChange={e=>setExcludeSimilar(e.target.checked)}/> Exclude similar (I, O, 0, 1, l)</label>
        <button onClick={generate} className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-gray-200">Generate New Passwords</button>
      </div>

      <div className="space-y-3">
        {passwords.map((p,i)=>(
          <div key={i} className="flex justify-between items-center bg-zinc-900 p-4 rounded-lg font-mono">
            <span className="break-all pr-2">{p}</span>
            <button onClick={()=>copy(p)} className="bg-zinc-800 px-3 py-1 rounded text-sm shrink-0">{copied===p ? "Copied!" : "Copy"}</button>
          </div>
        ))}
      </div>
    </div>
  );
}
