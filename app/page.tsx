"use client"
import { useState, useEffect } from 'react';

const languages: any = {
  en: { name: "English", flag: "🇺🇸", text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." },
  es: { name: "Español", flag: "🇪🇸", text: "El cliente es muy importante, el cliente será seguido por el cliente. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." },
  fr: { name: "Français", flag: "🇫🇷", text: "Le client est très important, le client sera suivi par le client. Lorem ipsum dolor sit amet consectetur adipiscing elit." },
  de: { name: "Deutsch", flag: "🇩🇪", text: "Der Kunde ist sehr wichtig, der Kunde wird vom Kunden verfolgt. Lorem ipsum dolor sit amet consectetur." },
  pt: { name: "Português", flag: "🇵🇹", text: "O cliente é muito importante, o cliente será seguido pelo cliente. Lorem ipsum dolor sit amet consectetur." },
  it: { name: "Italiano", flag: "🇮🇹", text: "Il cliente è molto importante, il cliente sarà seguito dal cliente. Lorem ipsum dolor sit amet." },
  hi: { name: "Hindi", flag: "🇮🇳", text: "ग्राहक बहुत महत्वपूर्ण है, ग्राहक का अनुसरण ग्राहक द्वारा किया जाएगा। लोरेम इप्सम डोलर सिट अमेट।" },
  ja: { name: "Japanese", flag: "🇯🇵", text: "顧客は非常に重要であり、顧客は顧客によってフォローされます。Lorem ipsum dolor sit amet consectetur." },
  ko: { name: "Korean", flag: "🇰🇷", text: "고객은 매우 중요하며 고객은 고객이 뒤따를 것입니다. Lorem ipsum dolor sit amet consectetur." },
  ar: { name: "Arabic", flag: "🇸🇦", text: "العميل مهم جدا، العميل سيتبعه العميل. لوريم إيبسوم دولور سيت أميت كونسيكتيتور." },
  ru: { name: "Russian", flag: "🇷🇺", text: "Клиент очень важен, за клиентом будет следить клиент. Lorem ipsum dolor sit amet consectetur." },
  tr: { name: "Turkish", flag: "🇹🇷", text: "Müşteri çok önemlidir, müşteri müşteri tarafından takip edilecektir. Lorem ipsum dolor sit amet." },
}

export default function Home() {
  const [lang, setLang] = useState('en');
  const [count, setCount] = useState(3);
  const [type, setType] = useState('paragraph');
  const [topic, setTopic] = useState('');
  const [output, setOutput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const generate = () => {
    let base = languages[lang].text;
    if(topic) base = `About ${topic}: ` + base;
    let result = '';
    if(type === 'paragraph') result = Array(count).fill(base).join('\n\n');
    else if(type === 'words') result = base.split(' ').slice(0, count*10).join(' ');
    else if(type === 'seo') result = `SEO Optimized Content for ${topic || 'website'}: \n\n` + Array(count).fill(base + ' This content is SEO friendly and keyword rich.').join('\n\n');
    else if(type === 'product') result = `Product: ${topic || 'Amazing Product'}\nDescription: ` + base + ' Best quality, fast delivery.';
    else result = base;

    setOutput(result);
    const newHist = [result.slice(0,60)+'...',...history].slice(0,5);
    setHistory(newHist);
    localStorage.setItem('lorem_hist', JSON.stringify(newHist));
  }

  useEffect(()=>{ generate(); const h = localStorage.getItem('lorem_hist'); if(h) setHistory(JSON.parse(h)); },[lang])

  const copy = () => { navigator.clipboard.writeText(output); setCopied(true); setTimeout(()=>setCopied(false),2000); }
  const downloadTxt = () => { const blob = new Blob([output], {type:'text/plain'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=`lorem-${lang}.txt`; a.click(); }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-hidden relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-purple-600/30 rounded-full blur-[120px] -z-10 animate-pulse"></div>

      <header className="flex justify-between items-center p-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 font-bold text-xl"><div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-lg"></div> LoremPro</div>
        <a href="mailto:contact.loremipsumpro@gmail.com" className="bg-white text-black px-5 py-2 rounded-full font-semibold hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)]">Hire Me ✨</a>
      </header>

      <main className="max-w-7xl mx-auto p-5 grid lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-1 space-y-5">
          <div className="bg-white/[0.06] backdrop-blur-xl border border-white/10 rounded-[24px] p-6 hover:border-violet-500/30 transition-all duration-500">
            <h3 className="font-semibold mb-4">🌍 Language (12)</h3>
            <div className="grid grid-cols-3 gap-2">
              {Object.keys(languages).map((k:any)=>(
                <button key={k} onClick={()=>setLang(k)} className={`p-2.5 rounded-xl text-sm border transition-all hover:scale-105 ${lang===k? 'bg-violet-600 border-violet-500 shadow-lg shadow-violet-600/20 scale-105' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>{languages[k].flag} {k.toUpperCase()}</button>
              ))}
            </div>
          </div>

          <div className="bg-white/[0.06] backdrop-blur-xl border border-white/10 rounded-[24px] p-6 hover:border-violet-500/30 transition-all">
            <h3 className="font-semibold mb-4">⚙️ Settings</h3>
            <label className="text-sm opacity-70">Type</label>
            <select value={type} onChange={e=>setType(e.target.value)} className="w-full mt-1 bg-black/50 border border-white/10 rounded-xl p-3 outline-none focus:border-violet-500 transition">
              <option value="paragraph">Paragraph</option>
              <option value="words">Words</option>
              <option value="seo">SEO Paragraph</option>
              <option value="product">Product Description</option>
            </select>
            <div className="mt-4">
              <label className="text-sm opacity-70">Count: {count}</label>
              <input type="range" min={1} max={10} value={count} onChange={e=>setCount(Number(e.target.value))} className="w-full mt-2 accent-violet-600" />
            </div>
            <div className="mt-4">
              <label className="text-sm opacity-70">AI Topic (Optional)</label>
              <input value={topic} onChange={e=>setTopic(e.target.value)} placeholder="e.g. tech blog, shoes..." className="w-full mt-1 bg-black/50 border border-white/10 rounded-xl p-3 outline-none focus:border-violet-500" />
            </div>
            <button onClick={generate} className="w-full mt-5 bg-gradient-to-r from-violet-600 to-fuchsia-600 p-3 rounded-xl font-bold hover:shadow-[0_0_30px_rgba(124,58,237,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all">Generate ✨</button>
          </div>

          <div className="bg-white/[0.06] backdrop-blur-xl border border-white/10 rounded-[24px] p-6">
            <h3 className="font-semibold mb-3">🕒 History</h3>
            {history.map((h,i)=><div key={i} className="text-xs p-2 bg-white/5 rounded-lg mb-2 truncate opacity-70">{h}</div>)}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white/[0.06] backdrop-blur-xl border border-white/10 rounded-[32px] p-7 min-h-[600px] flex flex-col hover:border-violet-500/20 transition-all duration-700 group">
            <div className="flex justify-between items-center mb-6">
              <div className="flex gap-3 text-xs opacity-60"><span>{output.split(' ').length} Words</span><span>{output.length} Chars</span></div>
              <div className="flex gap-2">
                <button onClick={downloadTxt} className="px-4 py-2 bg-white/10 rounded-full text-sm hover:bg-white/20 transition">Export.TXT</button>
                <button onClick={copy} className={`px-5 py-2 rounded-full text-sm font-bold transition-all hover:scale-105 ${copied? 'bg-green-500' : 'bg-white text-black shadow-lg'}`}>{copied? 'Copied! ✓' : 'Copy'}</button>
              </div>
            </div>
            <textarea value={output} onChange={e=>setOutput(e.target.value)} className="flex-1 w-full bg-transparent outline-none resize-none leading-7 text-[15px] opacity-90" />
            <div className="mt-6 p-4 bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 border border-violet-500/20 rounded-2xl flex justify-between items-center">
              <div><p className="font-bold">Need Custom Tool?</p><p className="text-xs opacity-60">I build SEO tools for international clients</p></div>
              <a href="mailto:contact.loremipsumpro@gmail.com" className="bg-white text-black px-4 py-2 rounded-full text-sm font-bold hover:scale-105 transition">Hire Me →</a>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
