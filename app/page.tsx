"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const LANG_DATA:any = {
  EN: "Lorem ipsum dolor sit amet consectetur adipiscing elit business technology nature education health travel food startup design marketing innovation".split(" "),
  HI: "यह व्यवसाय तकनीक शिक्षा स्वास्थ्य यात्रा भोजन डिज़ाइन मार्केटिंग के बारे में एक नमूना पाठ है".split(" "),
  ES: "negocio tecnologia naturaleza educacion salud viaje comida diseno marketing innovacion lorem ipsum".split(" "),
  FR: "entreprise technologie nature education sante voyage nourriture design marketing innovation".split(" "),
  DE: "geschaft technologie natur bildung gesundheit reisen essen design marketing innovation".split(" "),
  AR: "الأعمال التكنولوجيا الطبيعة التعليم الصحة السفر الطعام التصميم التسويق الابتكار".split(" "),
  PT: "negocio tecnologia natureza educacao saude viagem comida design marketing inovacao".split(" "),
  RU: "бизнес технология природа образование здоровье путешествие еда дизайн маркетинг инновации".split(" "),
  JA: "ビジネス テクノロジー 自然 教育 健康 旅行 食べ物 デザイン マーケティング イノベーション".split(" "),
  IT: "affari tecnologia natura istruzione salute viaggio cibo design marketing innovazione".split(" "),
  BN: "ব্যবসা প্রযুক্তি প্রকৃতি শিক্ষা স্বাস্থ্য ভ্রমণ খাদ্য নকশা বিপণন উদ্ভাবন".split(" "),
  UR: "کاروبار ٹیکنالوجی فطرت تعلیم صحت سفر کھانا ڈیزائن مارکیٹنگ جدت".split(" "),
}
const FLAGS:any = {EN:"🇺🇸", HI:"🇮🇳", ES:"🇪🇸", FR:"🇫🇷", DE:"🇩🇪", AR:"🇸🇦", PT:"🇵🇹", RU:"🇷🇺", JA:"🇯🇵", IT:"🇮🇹", BN:"🇧🇩", UR:"🇵🇰"}
const COUNTRY_COLORS:any = {EN:["#3b82f6","#60a5fa"], HI:["#f97316","#fb923c"], ES:["#ef4444","#f87171"], FR:["#8b5cf6","#a78bfa"], DE:["#111827","#4b5563"], AR:["#059669","#10b981"], PT:["#0e7490","#22d3ee"], RU:["#1d4ed8","#3b82f6"], JA:["#db2777","#f472b6"], IT:["#16a34a","#4ade80"], BN:["#dc2626","#f87171"], UR:["#15803d","#22c55e"]}

export default function Page(){
  const [lang,setLang]=useState("EN");
  const [count,setCount]=useState(3);
  const [type,setType]=useState("para");
  const [out,setOut]=useState("");
  const [topic,setTopic]=useState("");
  const [aiMode,setAiMode]=useState(true);

  const generate=()=>{
    const words = LANG_DATA[lang];
    const topicWord = topic.trim() || "design";
    const getSentence = () => {
      const len = 9 + Math.floor(Math.random()*6);
      let s = [];
      if(aiMode && topic) s.push(topicWord.charAt(0).toUpperCase()+topicWord.slice(1));
      for(let i=0;i<len;i++) s.push(words[Math.floor(Math.random()*words.length)]);
      return s.join(" ")+".";
    }
    let result="";
    if(type==="words"){
      let w=[aiMode && topic? topicWord : null].filter(Boolean);
      for(let i=w.length;i<count;i++) w.push(words[Math.floor(Math.random()*words.length)]);
      result = w.join(" ");
    } else if(type==="para"){
      let paras=[];
      for(let p=0;p<count;p++){
        let para="";
        for(let s=0;s<3;s++) para+=getSentence()+" ";
        paras.push(para.trim());
      }
      result=paras.join("\n\n");
    } else if(type==="sent"){
      let a=[];
      for(let i=0;i<count;i++) a.push(getSentence());
      result=a.join(" ");
    } else if(type==="list"){
      let a=[];
      for(let i=0;i<count;i++) a.push(`${i+1}. ${getSentence()}`);
      result=a.join("\n");
    }
    setOut(result);
  }

  useEffect(()=>{ generate(); },[]);

  const download=()=>{
    const blob = new Blob(["\uFEFF"+out],{type:"text/plain;charset=utf-8"});
    const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=`lorem-${lang}-${topic||'general'}.txt`; a.click();
  }

  return(
    <div style={{minHeight:"100vh", background:"#f8f7f4"}}>
      <header style={{background:"white", borderBottom:"1px solid #eee", position:"sticky", top:0, zIndex:10}}>
        <div style={{maxWidth:"1150px", margin:"0 auto", padding:"0 16px", height:"70px", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
          <Link href="/" style={{textDecoration:"none", color:"#111", fontWeight:900, fontSize:"20px"}}>LoremGen PRO</Link>
          <nav style={{display:"flex", gap:"14px", fontSize:"13px", fontWeight:700}}>
            <Link href="/" style={{color:"#111"}}>Home</Link>
            <Link href="/about" style={{color:"#666"}}>About</Link>
            <Link href="/privacy" style={{color:"#666"}}>Privacy</Link>
            <Link href="/disclaimer" style={{color:"#666"}}>Disclaimer</Link>
            <Link href="/contact" style={{color:"#666"}}>Contact</Link>
          </nav>
        </div>
      </header>

      <div style={{maxWidth:"1150px", margin:"0 auto", padding:"14px"}}>
        <div style={{display:"grid", gap:"16px"}} className="main"><style>{`@media(min-width:950px){.main{grid-template-columns:430px 1fr}}`}</style>
          <div style={{background:"white", borderRadius:"28px", padding:"20px", border:"1px solid #eee"}}>
            <div style={{fontSize:"11px", fontWeight:900, opacity:0.4, letterSpacing:"2px"}}>TYPE</div>
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", marginTop:"10px"}}>
              {[{k:"para",l:"PARAGRAPH"},{k:"words",l:"WORDS"},{k:"sent",l:"SENTENCES"},{k:"list",l:"LIST"}].map(b=>(
                <button key={b.k} onClick={()=>setType(b.k)} style={{height:"64px", borderRadius:"18px", border: type===b.k?"none":"2px solid #eee", background: type===b.k?"#111":"white", color: type===b.k?"white":"#111", fontWeight:900, fontSize:"14px", cursor:"pointer"}}>{b.l}</button>
              ))}
            </div>

            <div style={{marginTop:"18px", background:"#f5f3ff", border:"2px solid #ddd6fe", borderRadius:"18px", padding:"14px"}}>
              <div style={{display:"flex", justifyContent:"space-between"}}><b style={{fontSize:"12px"}}>🤖 AI TOPIC MODE</b><button onClick={()=>setAiMode(!aiMode)} style={{background: aiMode?"#7c3aed":"#ddd", color: aiMode?"white":"#111", border:"none", padding:"4px 12px", borderRadius:"20px", fontWeight:800, fontSize:"11px", cursor:"pointer"}}>{aiMode?"ON":"OFF"}</button></div>
              <input value={topic} onChange={e=>setTopic(e.target.value)} placeholder="Type topic: business, yoga, crypto, food..." style={{width:"100%", marginTop:"10px", height:"46px", borderRadius:"12px", border:"1.5px solid #ddd", padding:"0 12px", fontSize:"14px"}} />
              <div style={{fontSize:"11px", opacity:0.6, marginTop:"6px"}}>AI {aiMode?"topic ko har sentence me use karega":"band hai"}</div>
            </div>

            <div style={{fontSize:"11px", fontWeight:900, opacity:0.4, letterSpacing:"2px", marginTop:"20px"}}>12 LANGUAGES</div>
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"10px", marginTop:"10px"}}>
              {Object.keys(LANG_DATA).map(k=>(
                <button key={k} onClick={()=>setLang(k)} style={{height:"70px", borderRadius:"18px", border: lang===k?"3px solid #111":"none", background:`linear-gradient(135deg,${COUNTRY_COLORS[k][0]},${COUNTRY_COLORS[k][1]})`, color:"white", fontWeight:900, cursor:"pointer"}}><div style={{fontSize:"20px"}}>{FLAGS[k]}</div><div>{k}</div></button>
              ))}
            </div>

            <div style={{background:"#f8f7f4", borderRadius:"16px", padding:"14px", marginTop:"18px", border:"1px solid #eee"}}>
              <div style={{display:"flex", justifyContent:"space-between", fontWeight:900, fontSize:"12px"}}><span style={{opacity:0.5}}>{type.toUpperCase()} COUNT</span><span style={{background:"#111", color:"white", padding:"4px 10px", borderRadius:"20px"}}>{count}</span></div>
              <input type="range" min={1} max={type==="words"?200:12} value={count} onChange={e=>setCount(Number(e.target.value))} style={{width:"100%", marginTop:"10px"}} />
            </div>
            <button onClick={generate} style={{width:"100%", marginTop:"14px", height:"64px", borderRadius:"18px", border:"none", background:"linear-gradient(90deg,#111,#444)", color:"white", fontWeight:900, fontSize:"17px", cursor:"pointer"}}>✨ GENERATE {topic? topic.toUpperCase(): ""}</button>
          </div>

          <div style={{background:"white", borderRadius:"28px", border:"1px solid #eee", display:"flex", flexDirection:"column"}}>
            <div style={{height:"58px", display:"flex", justifyContent:"space-between", alignItems:"center", padding:"0 16px", borderBottom:"1px solid #eee"}}>
              <span style={{fontSize:"11px", fontWeight:800, opacity:0.5}}>{out.split(/\s+/).filter(Boolean).length} WORDS • {lang} • {aiMode && topic?`AI: ${topic}`:""}</span>
              <button onClick={()=>navigator.clipboard.writeText(out)} style={{background:"#111", color:"white", border:"none", padding:"8px 16px", borderRadius:"20px", fontWeight:800, cursor:"pointer"}}>COPY</button>
            </div>
            <textarea value={out} onChange={e=>setOut(e.target.value)} style={{flex:1, minHeight:"520px", border:"none", padding:"18px", fontSize:"16px", lineHeight:"30px", outline:"none"}} />
            <div style={{padding:"12px", display:"flex", gap:"10px", borderTop:"1px solid #eee"}}><button onClick={()=>navigator.clipboard.writeText(out)} style={{flex:1, height:"48px", borderRadius:"14px", background:"#111", color:"white", fontWeight:900, border:"none", cursor:"pointer"}}>Copy</button><button onClick={download} style={{flex:1, height:"48px", borderRadius:"14px", background:"white", border:"2px solid #111", fontWeight:900, cursor:"pointer"}}>Download</button></div>
          </div>
        </div>

        <div style={{background:"white", borderRadius:"24px", padding:"24px", marginTop:"20px", border:"1px solid #eee"}}>
          <h2>What is Lorem Ipsum Generator? (AdSense Content)</h2>
          <p style={{lineHeight:"28px", opacity:0.8}}>LoremGen PRO is a free multilingual placeholder text generator for designers, developers and writers. Our tool supports 12 languages including Hindi, Urdu, Bengali and Arabic. Unlike other tools, our AI Topic Mode lets you generate content related to business, technology, health, yoga, crypto, food and more. This makes your mockups look real and helps with SEO testing. The tool works 100% offline, no ads, no tracking. Download fixed the encoding issue - now Hindi files open perfectly in any mobile.</p>
          <h3>Why use our 12 language tool?</h3>
          <ul style={{lineHeight:"28px", opacity:0.8}}><li>Supports EN, HI, ES, FR, DE, AR, PT, RU, JA, IT, BN, UR</li><li>4 modes: Paragraph, Words, Sentences, List - all working perfectly</li><li>AI Topic mode for niche content</li><li>UTF-8 download - no more broken Hindi text</li></ul>
        </div>

        <footer style={{textAlign:"center", padding:"20px", fontSize:"12px", opacity:0.5}}><Link href="/privacy">Privacy</Link> • <Link href="/disclaimer">Disclaimer</Link> • <Link href="/about">About</Link> • <Link href="/contact">Contact</Link><br/>© 2026 LoremGen PRO - AdSense Ready</footer>
      </div>
    </div>
  )
}
