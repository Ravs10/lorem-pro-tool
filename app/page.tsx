"use client";
import { useState, useEffect } from "react";

const FLAGS:any={EN:"🇺🇸",HI:"🇮🇳",ES:"🇪🇸",FR:"🇫🇷",DE:"🇩🇪",AR:"🇸🇦",PT:"🇵🇹",RU:"🇷🇺",JA:"🇯🇵",IT:"🇮🇹",BN:"🇧🇩",UR:"🇵🇰"}
const COLORS:any={EN:["#3b82f6","#60a5fa"],HI:["#f97316","#fb923c"],ES:["#ef4444","#f87171"],FR:["#8b5cf6","#a78bfa"],DE:["#1f2937","#6b7280"],AR:["#059669","#10b981"],PT:["#0891b2","#22d3ee"],RU:["#2563eb","#60a5fa"],JA:["#db2777","#f472b6"],IT:["#16a34a","#4ade80"],BN:["#dc2626","#fb7185"],UR:["#15803d","#22c55e"]}

const DB:any={
  EN:{words:["lorem","ipsum","health","business","yoga","design"], health:["Healthy life needs daily exercise","Yoga improves mental health","Eat fruits and vegetables daily","Drink water and sleep 8 hours"], business:["Business growth needs smart planning","Marketing is key to success","Customer satisfaction is priority"], default:["Lorem ipsum dolor sit amet consectetur","This is dummy text for design mockups"]},
  HI:{words:["स्वास्थ्य","व्यापार","योग","भोजन"], health:["स्वस्थ जीवन के लिए रोज व्यायाम जरूरी है","योग से मानसिक स्वास्थ्य बेहतर होता है","रोज फल और हरी सब्जियां खाएं"], business:["व्यापार बढ़ाने के लिए अच्छी योजना चाहिए","मार्केटिंग सफलता की कुंजी है"], default:["यह डिज़ाइन के लिए नमूना पाठ है","इसका उपयोग लेआउट देखने के लिए होता है"]},
  IT:{words:["salute","affari","yoga"], health:["La vita sana ha bisogno di esercizio"], business:["La crescita aziendale ha bisogno di strategia"], default:["Testo di esempio per design"]},
  BN:{words:["স্বাস্থ্য","ব্যবসা","যোগা"], health:["সুস্থ জীবনের জন্য ব্যায়াম দরকার"], business:["ব্যবসার জন্য কৌশল দরকার"], default:["ডিজাইনের জন্য নমুনা পাঠ্য"]},
  UR:{words:["صحت","کاروبار","یوگا"], health:["صحت مند زندگی کے لیے ورزش ضروری ہے"], business:["کاروبار کے لیے حکمت عملی چاہیے"], default:["ڈیزائن کے لیے نمونہ متن"]},
  ES:{words:["salud","negocio"], health:["La vida saludable necesita ejercicio"], business:["El negocio necesita estrategia"], default:["Texto de ejemplo"]},
  FR:{words:["sante","entreprise"], health:["La vie saine necessite exercice"], business:["L'entreprise a besoin de strategie"], default:["Exemple de texte"]},
  DE:{words:["gesundheit","geschaft"], health:["Gesundes Leben braucht Bewegung"], business:["Geschaft braucht Strategie"], default:["Beispieltext"]},
  AR:{words:["الصحة","الأعمال"], health:["الحياة الصحية تحتاج رياضة"], business:["الأعمال تحتاج استراتيجية"], default:["نص تجريبي"]},
  PT:{words:["saude","negocio"], health:["Vida saudavel precisa exercicio"], business:["Negocio precisa estrategia"], default:["Texto exemplo"]},
  RU:{words:["здоровье","бизнес"], health:["Здоровый образ жизни важен"], business:["Бизнес требует стратегии"], default:["Пример текста"]},
  JA:{words:["健康","ビジネス"], health:["健康的な生活には運動が必要"], business:["ビジネスには戦略が必要"], default:["サンプルテキスト"]},
}

export default function Page(){
  const [page,setPage]=useState("home");
  const [lang,setLang]=useState("HI");
  const [type,setType]=useState("para");
  const [count,setCount]=useState(3);
  const [topic,setTopic]=useState("Health");
  const [aiOn,setAiOn]=useState(true);
  const [out,setOut]=useState("");
  const getBank=()=>{ const d=DB[lang]; const t=topic.toLowerCase(); if(t.includes("health")||t.includes("स्वास्थ्य")||t.includes("yoga")||t.includes("योग")||t.includes("salute")) return d.health; if(t.includes("business")||t.includes("व्यापार")||t.includes("affari")) return d.business; return d.default; }
  const generateNow=()=>{ const bank=getBank(); const words=DB[lang].words; let res=""; if(type==="words"){ let a=aiOn?[topic]:[]; for(let i=a.length;i<count;i++) a.push(words[Math.floor(Math.random()*words.length)]); res=a.join(" "); } else if(type==="para"){ let ps=[]; for(let i=0;i<count;i++){ let p=""; for(let j=0;j<3;j++) p+=bank[Math.floor(Math.random()*bank.length)]+". "; ps.push(p);} res=ps.join("\n\n"); } else if(type==="sent"){ let a=[]; for(let i=0;i<count;i++) a.push(bank[Math.floor(Math.random()*bank.length)]+"."); res=a.join(" "); } else { let a=[]; for(let i=0;i<count;i++) a.push(`${i+1}. ${bank[Math.floor(Math.random()*bank.length)]}.`); res=a.join("\n"); } setOut(res); }
  useEffect(()=>{generateNow()},[]);
  const downloadTxt=()=>{ const b=new Blob([out],{type:"text/plain"}); const u=URL.createObjectURL(b); const a=document.createElement("a"); a.href=u; a.download=`lorem-${lang}.txt`; a.click(); }

  return(
    <div style={{minHeight:"100vh", background:"#f8fafc"}}>
      {/* HEADER - CLEAN */}
      <header style={{background:"white", borderBottom:"1px solid #e2e8f0", position:"sticky", top:0, zIndex:50}}>
        <div style={{maxWidth:"1150px", margin:"0 auto", padding:"14px", display:"flex", alignItems:"center", gap:"12px"}}>
          <div style={{width:"42px", height:"42px", background:"#111", borderRadius:"10px", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontWeight:900, fontSize:"20px"}}>L</div>
          <div><div style={{fontWeight:900, fontSize:"18px", color:"#111"}}>LoremGen PRO</div><div style={{fontSize:"11px", color:"#64748b", fontWeight:700}}>12 LANGUAGES • AI TOPIC GENERATOR • 100% FREE</div></div>
        </div>
        {/* NAV - PROPER ARRANGED IN 2 ROWS ON MOBILE */}
        <nav style={{background:"#111"}}>
          <div style={{maxWidth:"1150px", margin:"0 auto", padding:"8px 10px", display:"flex", flexWrap:"wrap", gap:"6px"}}>
            {[
              {id:"home", label:"HOME"},
              {id:"about", label:"ABOUT US"},
              {id:"privacy", label:"PRIVACY POLICY"},
              {id:"disclaimer", label:"DISCLAIMER"},
              {id:"contact", label:"CONTACT US"},
              {id:"hire", label:"HIRE ME"},
            ].map(m=>(
              <button key={m.id} onClick={()=>{setPage(m.id); window.scrollTo(0,0)}} style={{background:page===m.id?"white":"#1e293b", color:page===m.id?"#111":"#e2e8f0", border:"none", padding:"10px 16px", borderRadius:"8px", fontSize:"12px", fontWeight:900, cursor:"pointer"}}>{m.label}</button>
            ))}
          </div>
        </nav>
      </header>

      <div style={{maxWidth:"1150px", margin:"0 auto", padding:"14px"}}>
        {page==="home"?(
          <div style={{display:"grid", gap:"14px"}} className="g"><style>{`@media(min-width:900px){.g{grid-template-columns:380px 1fr}}`}</style>
            <div style={{background:"white", borderRadius:"18px", padding:"14px", border:"1px solid #e2e8f0"}}>
              <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px"}}>
                {["para","words","sent","list"].map(k=>(
                  <button key={k} onClick={()=>setType(k)} style={{height:"52px", borderRadius:"10px", border:type===k?"2px solid #111":"1px solid #e2e8f0", background:type===k?"#111":"white", color:type===k?"white":"#111", fontWeight:900, cursor:"pointer"}}>{k.toUpperCase()}</button>
                ))}
              </div>
              <div style={{marginTop:"12px", border:"2px solid #7c3aed", borderRadius:"12px", padding:"12px", background:"#faf5ff"}}>
                <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}><b style={{fontSize:"12px", color:"#111"}}>🤖 AI TOPIC MODE: {aiOn?"ON":"OFF"}</b><button onClick={()=>setAiOn(!aiOn)} style={{background:aiOn?"#7c3aed":"#94a3b8", color:"white", border:"none", padding:"5px 12px", borderRadius:"20px", fontWeight:900, fontSize:"11px"}}>{aiOn?"ON":"OFF"}</button></div>
                <div style={{fontSize:"11px", color:"#475569", marginTop:"6px", fontWeight:600}}>{aiOn?"Topic likho to usi topic ka text ayega. Ex: Health likho + HI select = Hindi Health text":"AI OFF hai to random dummy text ayega"}</div>
                <input value={topic} onChange={e=>setTopic(e.target.value)} style={{width:"100%", height:"42px", marginTop:"8px", borderRadius:"8px", border:"2px solid #111", padding:"0 10px", fontWeight:700, color:"#111"}} placeholder="Ex: Health, Business, Yoga..." />
              </div>
              <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"8px", marginTop:"12px"}}>
                {Object.keys(DB).map(k=>(
                  <button key={k} onClick={()=>setLang(k)} style={{height:"62px", borderRadius:"12px", border:lang===k?"3px solid #111":"1px solid #e2e8f0", background:`linear-gradient(135deg,${COLORS[k][0]},${COLORS[k][1]})`, color:"white", fontWeight:900, cursor:"pointer"}}><div>{FLAGS[k]}</div><div style={{fontSize:"11px"}}>{k}</div></button>
                ))}
              </div>
              <a href="https://loremipsumpro.blogspot.com" target="_blank" style={{display:"block", marginTop:"12px", background:"#111", borderRadius:"10px", padding:"12px", textAlign:"center", textDecoration:"none", color:"white", fontWeight:800, fontSize:"12px"}}>More: Gujarati | Marathi | Tamil | Telugu | Bengali → loremipsumpro.blogspot.com (Total 17 Languages)</a>
              <div style={{marginTop:"12px", background:"#f1f5f9", borderRadius:"10px", padding:"10px"}}>
                <div style={{display:"flex", justifyContent:"space-between"}}><b style={{color:"#111", fontSize:"12px"}}>COUNT: {count}</b><b style={{color:"#111", fontSize:"12px"}}>{type.toUpperCase()}</b></div>
                <input type="range" min={1} max={type==="words"?100:10} value={count} onChange={e=>setCount(Number(e.target.value))} style={{width:"100%"}} />
              </div>
              <button onClick={generateNow} style={{width:"100%", height:"54px", marginTop:"12px", borderRadius:"10px", border:"none", background:"#111", color:"white", fontWeight:900, cursor:"pointer"}}>GENERATE ({lang} - {count})</button>
            </div>
            <div style={{background:"white", borderRadius:"18px", border:"1px solid #e2e8f0", display:"flex", flexDirection:"column", minHeight:"500px"}}>
              <div style={{height:"54px", padding:"0 14px", background:"#f8fafc", borderBottom:"1px solid #e2e8f0", display:"flex", justifyContent:"space-between", alignItems:"center", borderTopLeftRadius:"18px", borderTopRightRadius:"18px"}}>
                <span style={{fontSize:"12px", fontWeight:900, color:"#111"}}>{lang} • {count} {type.toUpperCase()}</span>
                <div style={{display:"flex", gap:"6px"}}><button onClick={()=>{navigator.clipboard.writeText(out); alert("Copied!")}} style={{background:"#111", color:"white", border:"none", padding:"7px 14px", borderRadius:"20px", fontWeight:900, fontSize:"12px", cursor:"pointer"}}>COPY</button><button onClick={downloadTxt} style={{background:"white", color:"#111", border:"2px solid #111", padding:"7px 14px", borderRadius:"20px", fontWeight:900, fontSize:"12px", cursor:"pointer"}}>DOWNLOAD</button></div>
              </div>
              <textarea value={out} onChange={e=>setOut(e.target.value)} style={{flex:1, minHeight:"450px", border:"none", padding:"16px", fontSize:"16px", lineHeight:"28px", outline:"none", color:"#111"}} />
            </div>
          </div>
        ):(
          <div style={{background:"white", borderRadius:"18px", padding:"24px", border:"1px solid #e2e8f0", color:"#111", lineHeight:"1.7"}}>
            {page==="about" && <><h1>About LoremGen PRO</h1><p>LoremGen PRO is a free tool that gives you placeholder text in 12 languages. We also have 5 more languages on our Blogger site - total 17 languages.</p><p><b>AI Topic Feature:</b> Normal tools give only "lorem ipsum". Our AI Topic mode gives you topic-based text. Example: If you type "Health" and select Hindi, you get Hindi health sentences. If you type "Business" and select English, you get business sentences. This helps designers make realistic mockups for real websites.</p><p>12 Languages here: English, Hindi, Spanish, French, German, Arabic, Portuguese, Russian, Japanese, Italian, Bengali, Urdu. + 5 on Blogger: Gujarati, Marathi, Tamil, Telugu, Bengali.</p></>}
            {page==="privacy" && <><h1>Privacy Policy</h1><p>We do not collect your data. Everything happens in your browser. Google AdSense may use cookies for ads.</p></>}
            {page==="disclaimer" && <><h1>Disclaimer</h1><p>Generated text is dummy placeholder only. Not real medical or business advice. Use for design purpose only.</p></>}
            {page==="contact" && <><h1>Contact Us</h1><p>Email: support@loremgen.pro<br/>We reply within 24 hours.</p></>}
            {page==="hire" && <><h1>Hire Me</h1><div style={{background:"#f0f9ff", border:"2px solid #0ea5e9", borderRadius:"14px", padding:"18px"}}><h3 style={{margin:0}}>Need a website like this?</h3><p>I build fast, SEO-ready, AdSense-approved tools. Next.js, React, Blogger migration, multi-language tools.</p><p><b>What I do:</b></p><ul><li>Tool websites (like this lorem generator)</li><li>AdSense approval ready sites</li><li>Fast & mobile friendly</li><li>Low cost, 2-3 days delivery</li></ul><p><b>Email:</b> <a href="mailto:support@loremgen.pro" style={{fontWeight:900}}>support@loremgen.pro</a></p><a href="mailto:support@loremgen.pro?subject=Hire%20Request" style={{display:"inline-block", background:"#111", color:"white", padding:"10px 18px", borderRadius:"8px", textDecoration:"none", fontWeight:900}}>Send Email</a></div></>}
            <button onClick={()=>setPage("home")} style={{marginTop:"18px", background:"#111", color:"white", border:"none", padding:"10px 18px", borderRadius:"8px", fontWeight:900}}>← BACK</button>
          </div>
        )}
      </div>
      <footer style={{background:"#111", color:"#94a3b8", marginTop:"20px", padding:"20px", textAlign:"center", fontSize:"12px"}}>
        <div style={{display:"flex", justifyContent:"center", flexWrap:"wrap", gap:"12px", marginBottom:"10px"}}>
          {["home","about","privacy","disclaimer","contact","hire"].map(p=><button key={p} onClick={()=>{setPage(p); window.scrollTo(0,0)}} style={{background:"none", border:"none", color:"#cbd5e1", cursor:"pointer", fontSize:"12px", fontWeight:700}}>{p.toUpperCase()}</button>)}
        </div>
        <div>© 2026 LoremGen PRO • 17 Languages • <a href="https://loremipsumpro.blogspot.com" target="_blank" style={{color:"#f59e0b"}}>Blogger Version</a> • support@loremgen.pro</div>
      </footer>
    </div>
  )
}
