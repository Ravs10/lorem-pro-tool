// @ts-nocheck
'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

export default function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [upper, setUpper] = useState(true);
  const [lower, setLower] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [excludeSimilar, setExcludeSimilar] = useState(false);
  const [passwords, setPasswords] = useState<string[]>([]);
  const [copied, setCopied] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [showMore, setShowMore] = useState(false);

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

  const faqs = [
    { q: "Is this password generator secure?", a: "Yes, this password generator is secure and private. All passwords are generated directly in your browser. We never store, track, or send your passwords to any server. You can safely use it for any account." },
    { q: "What is the best length for a strong password?", a: "Experts recommend at least 16 characters for important accounts like banking and email. For social media, 12-16 characters is good. Our tool lets you create passwords from 6 to 64 characters long." },
    { q: "Can I use these passwords for banking and email?", a: "Yes, you can use these random passwords for banking, email, Instagram, Facebook, and all other accounts. They are random, unique, and very hard to guess." },
    { q: "How long should my password be?", a: "For normal accounts, 12 characters is enough. For banking, crypto, and admin accounts, use 16 to 20+ characters with a mix of uppercase, lowercase, numbers, and symbols." },
    { q: "Should I use the same password for all accounts?", a: "No, never use the same password for all accounts. If one website is hacked, all your accounts can be at risk. Always use a different, unique password for each website." },
    { q: "What is the most secure password?", a: "The most secure password is long, random, and unique. It should have a mix of uppercase letters, lowercase letters, numbers, and symbols, and it should not contain your name, birthday, or common words." },
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(f => ({ "@type": "Question", "name": f.q, "acceptedAnswer": { "@type": "Answer", "text": f.a } }))
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      
      <div className="max-w-3xl mx-auto p-6">
        {/* SEO H1 */}
        <h1 className="text-4xl font-bold text-center mt-4">Strong Password Generator - Create Secure Random Passwords Instantly</h1>
        <p className="text-gray-400 mb-6 text-center mt-3">Use our free password generator to create strong, random and secure passwords online. Customize length, symbols, numbers and uppercase letters. No signup, no tracking, 100% free.</p>

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
          {passwords.map((p,i)=>(<div key={i} className="flex justify-between items-center bg-zinc-900 border border-zinc-800 p-4 rounded-xl"><code className="font-mono text-lg break-all">{p}</code><button onClick={()=>copy(p)} className="px-4 py-1.5 bg-white text-black rounded-full text-xs font-bold ml-3 shrink-0">{copied===p?"Copied!":"Copy"}</button></div>))}
        </div>

        {/* SEO CONTENT */}
        <div className="space-y-10 text-gray-300 border-t border-zinc-800 pt-10">
          <section>
            <h2 className="text-2xl font-bold text-white mb-2">What is a Strong Password Generator?</h2>
            <p className="text-sm leading-relaxed">A strong password generator is a free online tool that creates random, unique and secure passwords that are very hard to guess. Instead of using your name, birthday or simple words like 123456, this tool creates a mix of uppercase letters, lowercase letters, numbers and symbols. Hackers use brute-force attacks to guess weak passwords, but a random password generated by our secure password generator can take years to crack. If you want to protect your Gmail, Instagram, Facebook, banking and other accounts, you should always use a strong random password.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-2">How to Use This Free Password Generator?</h2>
            <ol className="list-decimal ml-5 text-sm space-y-2 leading-relaxed">
              <li><b className="text-white">Choose Password Length:</b> Use the slider to select length from 6 to 64 characters. For banking, use 16 or more.</li>
              <li><b className="text-white">Select Character Types:</b> Tick Uppercase, Lowercase, Numbers and Symbols for maximum security.</li>
              <li><b className="text-white">Click Generate Passwords:</b> You will get 5 new strong passwords instantly.</li>
              <li><b className="text-white">Copy & Use:</b> Click Copy button and paste your new password anywhere.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-2">What Makes a Password Strong and Secure?</h2>
            <p className="text-sm leading-relaxed">A strong password is long, random and unpredictable. It should be at least 12-16 characters long and contain all 4 types of characters - Capital letters (A-Z), Small letters (a-z), Numbers (0-9) and Symbols (!@#$%). Never use common passwords like password123, qwerty, or your personal information. The longer and more random your password is, the harder it is for hackers to break it. Our random password generator follows this formula to create highly secure passwords for you.</p>
            {showMore && (
              <div className="mt-3 space-y-3 text-sm leading-relaxed">
                <p>Many people make the mistake of using the same password for all websites. This is very risky. If one website gets hacked, hackers can try the same password on your email, bank and social media. That is why you should create a different secure password for every account. You can also turn on Two-Factor Authentication (2FA) for extra protection. A password manager can help you save all your different passwords safely.</p>
                <p>Another important tip is to change your important passwords every 3 to 6 months, especially for banking and email. Do not share your password with anyone and do not write it in your phone notes or diary. Always use this free password generator to create a fresh, strong password whenever you create a new account.</p>
              </div>
            )}
            <button onClick={()=>setShowMore(!showMore)} className="mt-3 text-sm font-semibold text-white underline underline-offset-4">{showMore ? "Show Less ↑" : "Read More ↓"}</button>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-2">Password Length Guide: How Long Should Your Password Be?</h2>
            <p className="text-sm leading-relaxed mb-3">Password length directly decides its security. Check this simple guide to choose the right length for your account:</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-zinc-800">
                <thead><tr className="bg-zinc-800 text-white"><th className="p-2 text-left">Length</th><th className="p-2 text-left">Security Level</th><th className="p-2 text-left">Best For</th></tr></thead>
                <tbody>
                  <tr className="border-t border-zinc-800"><td className="p-2">8 Characters</td><td className="p-2">Weak</td><td className="p-2">Temporary accounts</td></tr>
                  <tr className="border-t border-zinc-800"><td className="p-2">12 Characters</td><td className="p-2">Good</td><td className="p-2">Social Media, Email</td></tr>
                  <tr className="border-t border-zinc-800"><td className="p-2">16 Characters</td><td className="p-2">Strong</td><td className="p-2">Banking, Important Accounts</td></tr>
                  <tr className="border-t border-zinc-800"><td className="p-2">20+ Characters</td><td className="p-2">Very Strong</td><td className="p-2">Crypto, Admin Accounts</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-2">Why Use Lorem Pro Password Generator?</h2>
            <ul className="list-disc ml-5 text-sm space-y-1 leading-relaxed">
              <li><b className="text-white">100% Private & Secure:</b> Passwords are generated in your browser. No server logs, no tracking.</li>
              <li><b className="text-white">Custom Length up to 64 Characters:</b> Create short or very long passwords as per your need.</li>
              <li><b className="text-white">Bulk Generation:</b> Get 5 strong passwords at once, pick the best one.</li>
              <li><b className="text-white">Exclude Similar Characters:</b> Avoid confusing characters like i, l, 1, O, 0.</li>
              <li><b className="text-white">One-Click Copy:</b> Instant copy button for fast use.</li>
              <li><b className="text-white">Free Forever, No Signup:</b> No account, no email, no limit. Use unlimited times.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-2">7 Tips To Keep Your Passwords Safe</h2>
            <ul className="list-disc ml-5 text-sm space-y-1 leading-relaxed">
              <li>Use a different password for every website and app.</li>
              <li>Never share your password with anyone, even with friends.</li>
              <li>Always turn on Two-Factor Authentication (2FA) where available.</li>
              <li>Never use your name, birthday, phone number or pet name in password.</li>
              <li>Change your banking and email passwords every 3-6 months.</li>
              <li>Do not save passwords in phone notes, diary or screenshots.</li>
              <li>Avoid logging into banking on public Wi-Fi.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-2">About Lorem Pro Tool - Free Online Tools For Everyone</h2>
            <p className="text-sm leading-relaxed"><Link href="https://lorem-pro-tool.run4ravish.workers.dev" className="text-white font-semibold underline underline-offset-4">Lorem Pro Tool</Link> is a 100% free website that provides simple, fast and secure online tools for students, developers, creators and everyday users. Our mission is to make daily digital tasks easy without signup, without ads overload and without tracking. On Lorem Pro Tool, you will find many useful free tools like Fake Data Generator, Password Generator, Word Counter, Character Counter, Case Converter, Lorem Ipsum Generator and many more. All tools work directly in your browser, so your data stays private and safe. Whether you need a strong password for your account, dummy data for testing your project, or want to count words for your assignment, Lorem Pro Tool has the perfect free tool for you. We are adding new tools regularly to help you work faster and smarter. Bookmark Lorem Pro Tool and explore all our free online tools in one place.</p>
            <p className="text-sm leading-relaxed mt-3">Explore all free tools on <Link href="https://lorem-pro-tool.run4ravish.workers.dev" className="text-white font-semibold underline underline-offset-4">Lorem Pro Tool - Home Page →</Link></p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-2">Frequently Asked Questions (FAQs)</h2>
            <div className="space-y-3">
              {faqs.map((f,i)=>(
                <div key={i} className="border border-zinc-800 rounded-xl overflow-hidden">
                  <button onClick={()=>setOpenFaq(openFaq===i?null:i)} className="w-full flex justify-between items-center text-left p-4 bg-zinc-900 hover:bg-zinc-800">
                    <span className="text-sm font-semibold text-white">{f.q}</span>
                    <span className="text-white text-lg ml-2 shrink-0">{openFaq===i ? "−" : "+"}</span>
                  </button>
                  {openFaq===i && <div className="p-4 text-sm leading-relaxed bg-black">{f.a}</div>}
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
