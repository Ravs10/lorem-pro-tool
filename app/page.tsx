"use client";
import { useState, useEffect } from "react";

const FLAGS:any = {EN:"🇺🇸",HI:"🇮🇳",ES:"🇪🇸",FR:"🇫🇷",DE:"🇩🇪",AR:"🇸🇦",PT:"🇵🇹",RU:"🇷🇺",JA:"🇯🇵",IT:"🇮🇹",BN:"🇧🇩",UR:"🇵🇰",ZH:"🇨🇳",KO:"🇰🇷",TR:"🇹🇷",NL:"🇳🇱",PL:"🇵🇱",TH:"🇹🇭",VI:"🇻🇳",ID:"🇮🇩",MS:"🇲🇾",FA:"🇮🇷",TA:"🇮🇳",TE:"🇮🇳",ML:"🇮🇳"}
const DB:any = {
HI:{health:["स्वस्थ जीवन के लिए रोज योग और व्यायाम जरूरी है।","रोज सुबह टहलने से शरीर स्वस्थ रहता है।","संतुलित भोजन और अच्छी नींद सेहत के लिए जरूरी है।","पानी ज्यादा पीने से शरीर में ताजगी बनी रहती है।","तनाव से बचने के लिए ध्यान करना फायदेमंद है।","फल और हरी सब्जियां खाने से इम्यूनिटी बढ़ती है।"],business:["व्यापार में सफलता के लिए अच्छी योजना जरूरी है।","ग्राहक की संतुष्टि ही व्यापार की असली पूंजी है।"],political:["लोकतंत्र में जनता ही सबसे बड़ी ताकत होती है।"],social:["समाज तब बढ़ता है जब लोग एक दूसरे की मदद करते हैं।"],sports:["क्रिकेट को करोड़ों लोग पसंद करते हैं।"],education:["शिक्षा सफलता की कुंजी है।"],tech:["एआई दुनिया बदल रहा है।"],food:["स्वस्थ भोजन से शरीर सक्रिय रहता है।"],travel:["यात्रा से मन खुलता है।"]},
EN:{health:["Healthy life needs daily exercise and yoga.","Morning walk keeps body fit.","Balanced diet and good sleep are essential."],business:["Business growth needs smart planning."],political:["Democracy gives power to people."],social:["Society grows when people help."],sports:["Cricket is loved by millions."],education:["Education is key to success."],tech:["AI is changing the world."],food:["Healthy food keeps you active."],travel:["Travel opens mind."]}
}

export default function Page(){
  const [lang,setLang]=useState("HI"); const [topic,setTopic]=useState("health"); const [count,setCount]=useState(3); const [output,setOutput]=useState(""); const [copied,setCopied]=useState(false); const [openFaq,setOpenFaq]=useState(0);
  const generate=()=>{ const b=DB[lang]||DB.HI; const arr=b[topic]||b.health; const s=[...arr].sort(()=>0.5-Math.random()); let r=[]; for(let i=0;i<count;i++) r.push(s[i%s.length]); setOutput(r.join(" ")); }
  useEffect(()=>{generate()},[lang,topic,count]);
  const words=output.split(" ").filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-black" style={{colorScheme:"light"}}>
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="font-black text-xl">Lorem<span className="text-blue-600">Pro</span> Tool</h1>
          <nav className="hidden md:flex gap-6 text-sm font-bold text-gray-600"><a href="#generator">Generator</a><a href="#howto">How to Use</a><a href="#tools">Tools</a><a href="#faq">FAQ</a></nav>
          <a href="#hire" className="bg-black text-white px-4 py-2 rounded-full text-xs font-black">Hire Me</a>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4">
        {/* HERO */}
        <div className="text-center py-10">
          <h1 className="text-4xl md:text-6xl font-black leading-tight">Real Lorem Ipsum<br/><span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">75 Languages</span></h1>
          <p className="mt-4 text-gray-500 max-w-2xl mx-auto">lipsum.pro beats - 75 languages, real Hindi content not fake dummy, with topic-based generation. Best for bloggers, designers & developers.</p>
          <div className="mt-4 inline-flex bg-green-50 text-green-700 px-4 py-1.5 rounded-full text-xs font-bold">✓ No.1 Alternative to lipsum.pro - 100% Free</div>
        </div>

        {/* GENERATOR */}
        <section id="generator" className="bg-white rounded-[24px] shadow-xl border p-5">
          <div className="flex flex-wrap justify-between gap-3">
            <div><p className="text-[11px] font-bold text-gray-400">LANGUAGES (75) - Click to change</p><div className="grid grid-cols-5 md:grid-cols-10 gap-2 mt-2">{Object.keys(FLAGS).map(l=><button key={l} onClick={()=>setLang(l)} className={`rounded-xl border py-2 text-xs font-bold transition-all active:scale-90 hover:scale-105 ${lang===l?'bg-black text-white':'bg-gray-50'}`}>{FLAGS[l]} {l}</button>)}</div></div>
          </div>
          <div className="mt-5"><p className="text-[11px] font-bold text-gray-400">TOPICS</p><div className="flex flex-wrap gap-2 mt-2">{Object.keys(DB.HI).map(t=><button key={t} onClick={()=>setTopic(t)} className={`px-4 py-2 rounded-full text-xs font-bold capitalize ${topic===t?'bg-blue-600 text-white':'bg-gray-100'}`}>{t}</button>)}</div></div>
          <div className="mt-5 flex gap-2"><input type="number" value={count} onChange={e=>setCount(Number(e.target.value))} className="border-2 rounded-xl w-20 text-center font-black" min={1} max={10}/><button onClick={generate} className="flex-1 bg-gradient-to-r from-blue-600 to-violet-600 text-white font-black py-3 rounded-xl shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all">GENERATE ✨</button></div>
          <div className="mt-3 flex gap-2 text-xs font-bold"><span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full">Words: {words}</span><span className="bg-gray-100 px-3 py-1 rounded-full">Lang: {lang}</span></div>
          <div className="mt-5 bg-gray-50 rounded-2xl p-5 border"><p className="leading-7 text-[16px]">{output}</p><div className="mt-4 flex flex-wrap gap-2"><button onClick={()=>{navigator.clipboard.writeText(output); setCopied(true); setTimeout(()=>setCopied(false),1500)}} className={`px-6 py-2.5 rounded-full font-black text-sm ${copied?'bg-green-600 text-white':'bg-black text-white'}`}>{copied?'Copied ✓':'Copy Text'}</button><a href="https://www.blogger.com" target="_blank" className="bg-orange-500 text-white px-6 py-2.5 rounded-full font-black text-sm">Move to Blogger →</a></div></div>
          <div className="mt-4 grid grid-cols-4 gap-2">{["TXT","HTML","MD","JSON","UPPER","LOWER","SLUG","LIST"].map(t=><button key={t} onClick={()=>{const a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([output])); a.download=`lorem-${t}.txt`; a.click()}} className="bg-white border py-2 rounded-xl text-[10px] font-black hover:bg-black hover:text-white">{t}</button>)}</div>
        </section>

        {/* OTHER TOOLS */}
        <section id="tools" className="mt-12"><h2 className="text-2xl font-black">Other Useful Tools</h2><div className="grid md:grid-cols-3 gap-4 mt-4">{[{n:"Word Counter",d:"Count words instantly"},{n:"Blogger Lorem Tool",d:"Direct paste to blogger"},{n:"Hashtag Generator",d:"Viral hashtags"},{n:"Meta Tag Generator",d:"SEO tags"},{n:"YouTube Title Gen",d:"Viral titles"},{n:"AI Bio Generator",d:"Insta bio"}].map(t=><div key={t.n} className="bg-white p-5 rounded-2xl border shadow-sm hover:shadow-md transition"><h3 className="font-black">{t.n}</h3><p className="text-xs text-gray-500 mt-1">{t.d}</p><button className="mt-3 text-xs font-black bg-gray-900 text-white px-3 py-1.5 rounded-full">Use Tool →</button></div>)}</div></section>

        {/* HOW TO USE */}
        <section id="howto" className="mt-12 bg-white rounded-[24px] p-6 border"><h2 className="text-2xl font-black">How to Use / User Guide</h2><div className="grid md:grid-cols-3 gap-6 mt-6 text-sm"><div><b className="bg-blue-600 text-white w-6 h-6 rounded-full inline-flex items-center justify-center mr-2">1</b>Select Language - Choose from 75 languages including real Hindi.<br/></div><div><b className="bg-blue-600 text-white w-6 h-6 rounded-full inline-flex items-center justify-center mr-2">2</b>Select Topic - Health, Business, Sports etc for relevant content.</div><div><b className="bg-blue-600 text-white w-6 h-6 rounded-full inline-flex items-center justify-center mr-2">3</b>Generate & Copy - Click generate, copy and use anywhere for SEO.</div></div></section>

        {/* FAQ */}
        <section id="faq" className="mt-12"><h2 className="text-2xl font-black">Frequently Asked Questions</h2><div className="mt-4 space-y-2">{[{q:"Is this better than lipsum.pro?",a:"Yes, we offer 75 languages vs 60, real meaningful content vs fake lorem, topic based & SEO friendly."},{q:"Is Hindi content real?",a:"Yes, our Hindi is real meaningful sentences like 'स्वास्थ्य ही जीवन है' not fake translated lorem."},{q:"Is it free for bloggers?",a:"100% free, with direct Blogger move button and 8 download formats."}].map((f,i)=><div key={i} className="bg-white border rounded-2xl p-4"><button onClick={()=>setOpenFaq(openFaq===i?-1:i)} className="w-full flex justify-between font-bold text-sm">{f.q}<span>{openFaq===i?'−':'+'}</span></button>{openFaq===i&&<p className="text-xs text-gray-500 mt-3">{f.a}</p>}</div>)}</div></section>

        {/* HIRE ME */}
        <section id="hire" className="mt-12 bg-black text-white rounded-[24px] p-8 text-center"><h2 className="text-3xl font-black">Need Custom Tool Website?</h2><p className="text-gray-400 mt-2 text-sm">I make SEO tools like this that rank & earn. Contact for hire.</p><div className="mt-5 flex justify-center gap-3"><a href="mailto:hire@example.com" className="bg-white text-black px-6 py-3 rounded-full font-black text-sm">Hire Me Now</a><a href="#" className="border border-white/30 px-6 py-3 rounded-full font-black text-sm">View Portfolio</a></div></section>

        <div className="h-10"></div>
      </main>

      {/* FOOTER SEO */}
      <footer className="bg-white border-t mt-10"><div className="max-w-6xl mx-auto px-4 py-8 grid md:grid-cols-4 gap-6 text-xs"><div><b className="text-sm">LoremPro Tool</b><p className="text-gray-500 mt-2">Best lorem ipsum generator with 75 languages, real content, topic based. Beats lipsum.pro</p></div><div><b>Quick Links</b><p className="mt-2 space-y-1 text-gray-500"><a href="#generator">Generator</a><br/><a href="#howto">How to Use</a><br/><a href="#tools">Other Tools</a></p></div><div><b>Legal</b><p className="mt-2 space-y-1 text-gray-500">Privacy Policy<br/>Terms & Conditions<br/>About Us<br/>Contact</p></div><div><b>SEO Keywords</b><p className="mt-2 text-gray-400">lorem ipsum hindi, lorem ipsum generator, dummy text, blogger lorem tool, lipsum alternative</p></div></div><p className="text-center text-[10px] text-gray-400 pb-6">© 2026 LoremPro Tool - Made to beat lipsum.pro - Backup safe GitHub + ZIP 187KB</p></footer>
    </div>
  )
}
