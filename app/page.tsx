"use client";
import { useState, useEffect } from "react";

const FLAGS:any={EN:"🇺🇸",HI:"🇮🇳",ES:"🇪🇸",FR:"🇫🇷",DE:"🇩🇪",AR:"🇸🇦",PT:"🇵🇹",RU:"🇷🇺",JA:"🇯🇵",IT:"🇮🇹",BN:"🇧🇩",UR:"🇵🇰"}
const COLORS:any={EN:["#3b82f6","#60a5fa"],HI:["#f97316","#fb923c"],ES:["#ef4444","#f87171"],FR:["#8b5cf6","#a78bfa"],DE:["#1f2937","#6b7280"],AR:["#059669","#10b981"],PT:["#0891b2","#22d3ee"],RU:["#2563eb","#60a5fa"],JA:["#db2777","#f472b6"],IT:["#16a34a","#4ade80"],BN:["#dc2626","#fb7185"],UR:["#15803d","#22c55e"]}

const DB:any={
  EN:{words:["lorem","ipsum","health","business","yoga","design","startup"], health:["Healthy life needs daily exercise and morning walk","Yoga improves mental health and focus","Eat fruits and vegetables daily for energy","Drink 8 glasses of water and sleep 8 hours","Meditation keeps mind calm and stress free"], business:["Business growth needs smart planning and execution","Marketing is key to success in digital era","Customer satisfaction is top priority","Startup needs strong team and funding"], default:["Lorem ipsum dolor sit amet consectetur adipiscing elit","This is dummy text used for design mockups and wireframes","Use this placeholder for your next web project"]},
  HI:{words:["स्वास्थ्य","व्यापार","योग","भोजन","तकनीक"], health:["स्वस्थ जीवन के लिए रोज सुबह व्यायाम जरूरी है","योग से मानसिक स्वास्थ्य और एकाग्रता बेहतर होती है","रोज फल और हरी सब्जियां खाएं","रोज 8 गिलास पानी पिएं और 8 घंटे सोएं","ध्यान से मन शांत और तनाव मुक्त रहता है"], business:["व्यापार बढ़ाने के लिए अच्छी योजना और मेहनत चाहिए","डिजिटल जमाने में मार्केटिंग सफलता की कुंजी है"], default:["यह डिज़ाइन और लेआउट के लिए नमूना पाठ है","इसका उपयोग वेबसाइट और ऐप के डिज़ाइन में होता है"]},
  IT:{words:["salute","affari","yoga"], health:["La vita sana ha bisogno di esercizio quotidiano"], business:["La crescita aziendale ha bisogno di strategia"], default:["Testo di esempio per design e layout"]},
  BN:{words:["স্বাস্থ্য","ব্যবসা","যোগা"], health:["সুস্থ জীবনের জন্য প্রতিদিন ব্যায়াম দরকার"], business:["ব্যবসার জন্য ভালো কৌশল দরকার"], default:["ডিজাইনের জন্য নমুনা পাঠ্য"]},
  UR:{words:["صحت","کاروبار","یوگا"], health:["صحت مند زندگی کے لیے روزانہ ورزش ضروری ہے"], business:["کاروبار کے لیے اچھی حکمت عملی چاہیے"], default:["ڈیزائن کے لیے نمونہ متن"]},
  ES:{words:["salud","negocio"], health:["La vida saludable necesita ejercicio diario"], business:["El negocio necesita buena estrategia"], default:["Texto de ejemplo para diseño"]},
  FR:{words:["sante","entreprise"], health:["La vie saine necessite exercice quotidien"], business:["L'entreprise a besoin de strategie"], default:["Exemple de texte pour design"]},
  DE:{words:["gesundheit","geschaft"], health:["Gesundes Leben braucht tägliche Bewegung"], business:["Geschaft braucht gute Strategie"], default:["Beispieltext fur Design und Layout"]},
  AR:{words:["الصحة","الأعمال"], health:["الحياة الصحية تحتاج رياضة يومية"], business:["الأعمال تحتاج استراتيجية جيدة"], default:["نص تجريبي للتصميم"]},
  PT:{words:["saude","negocio"], health:["Vida saudavel precisa de exercicio diario"], business:["Negocio precisa de boa estrategia"], default:["Texto exemplo para design"]},
  RU:{words:["здоровье","бизнес"], health:["Здоровый образ жизни требует упражнений"], business:["Бизнес требует хорошей стратегии"], default:["Пример текста для дизайна"]},
  JA:{words:["健康","ビジネス"], health:["健康的な生活には毎日の運動が必要"], business:["ビジネスには良い戦略が必要"], default:["デザイン用のサンプルテキスト"]},
}

export default function Page(){
  const [page,setPage]=useState("home");
  const [lang,setLang]=useState("HI");
  const [type,setType]=useState("para");
  const [count,setCount]=useState(3);
  const [topic,setTopic]=useState("Health");
  const [aiOn,setAiOn]=useState(true);
  const [out,setOut]=useState("");

  const getBank=()=>{
    const d=DB[lang];
    const t=topic.toLowerCase();
    if(t.includes("health")||t.includes("स्वास्थ्य")||t.includes("yoga")||t.includes("योग")||t.includes("salute")||t.includes("صحت")||t.includes("स्वस्थ")) return d.health;
    if(t.includes("business")||t.includes("व्यापार")||t.includes("affari")||t.includes("कारोबार")) return d.business;
    return d.default;
  }

  const generateNow=()=>{
    const bank=getBank();
    const words=DB[lang].words;
    let res="";
    if(type==="words"){ let a=aiOn?[topic]:[]; for(let i=a.length;i<count;i++) a.push(words[Math.floor(Math.random()*words.length)]); res=a.join(" "); }
    else if(type==="para"){ let ps=[]; for(let i=0;i<count;i++){ let p=""; for(let j=0;j<3;j++) p+=bank[Math.floor(Math.random()*bank.length)]+". "; ps.push(p.trim());} res=ps.join("\n\n"); }
    else if(type==="sent"){ let a=[]; for(let i=0;i<count;i++) a.push(bank[Math.floor(Math.random()*bank.length)]+"."); res=a.join(" "); }
    else { let a=[]; for(let i=0;i<count;i++) a.push(`${i+1}. ${bank[Math.floor(Math.random()*bank.length)]}.`); res=a.join("\n"); }
    setOut(res);
  }

  // First time only
  useEffect(()=>{ generateNow(); },[]);

  const downloadTxt=()=>{
    const blob=new Blob([out],{type:"text/plain"}); const url=URL.createObjectURL(blob);
    const a=document.createElement("a"); a.href=url; a.download=`lorem-${lang}-${count}.txt`; a.click();
  }

  return(
    <div style={{minHeight:"100vh", background:"#f8fafc", fontFamily:"system-ui"}}>
      {/* HEADER */}
      <header style={{background:"white", borderBottom:"1px solid #e2e8f0", position:"sticky", top:0, zIndex:50}}>
        <div style={{maxWidth:"1150px", margin:"0 auto", padding:"12px 14px", display:"flex", alignItems:"center", justifyContent:"space-between"}}>
          <div style={{display:"flex", alignItems:"center", gap:"10px"}}>
            <div style={{width:"44px", height:"44px", background:"linear-gradient(135deg,#111,#444)", borderRadius:"12px", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontWeight:900, fontSize:"20px"}}>L</div>
            <div><div style={{fontWeight:900, fontSize:"18px", color:"#111", lineHeight:"18px"}}>LoremGen PRO</div><div style={{fontSize:"11px", color:"#64748b", fontWeight:700}}>17 LANGUAGES • AI POWERED</div></div>
          </div>
          <div style={{background:"#fef3c7", border:"1px solid #f59e0b", padding:"6px 10px", borderRadius:"20px", fontSize:"11px", fontWeight:800, color:"#92400e"}}>🚀 Made in Misrikh, UP</div>
        </div>
        {/* NAVIGATION */}
        <nav style={{background:"#111", overflowX:"auto", whiteSpace:"nowrap"}}>
          <div style={{maxWidth:"1150px", margin:"0 auto", display:"flex", gap:"2px", padding:"8px 10px"}}>
            {[
              {id:"home", label:"HOME"},
              {id:"about", label:"ABOUT US"},
              {id:"privacy", label:"PRIVACY POLICY"},
              {id:"disclaimer", label:"DISCLAIMER"},
              {id:"contact", label:"CONTACT US"},
              {id:"hire", label:"💼 HIRE ME"},
            ].map(m=>(
              <button key={m.id} onClick={()=>{setPage(m.id); window.scrollTo(0,0)}} style={{background:page===m.id?"white":"transparent", color:page===m.id?"#111":"#cbd5e1", border:"none", padding:"10px 16px", borderRadius:"10px", fontSize:"12px", fontWeight:900, cursor:"pointer", letterSpacing:"0.5px"}}>{m.label}</button>
            ))}
          </div>
        </nav>
      </header>

      <div style={{maxWidth:"1150px", margin:"0 auto", padding:"14px"}}>
        {page==="home"?(
          <div style={{display:"grid", gap:"14px"}} className="g"><style>{`@media(min-width:900px){.g{grid-template-columns:380px 1fr}}`}</style>
            {/* LEFT PANEL */}
            <div style={{background:"white", borderRadius:"20px", padding:"14px", border:"1px solid #e2e8f0", height:"fit-content"}}>
              <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px"}}>
                {["para","words","sent","list"].map(k=>(
                  <button key={k} onClick={()=>setType(k)} style={{height:"54px", borderRadius:"12px", border:type===k?"2px solid #111":"1px solid #e2e8f0", background:type===k?"#111":"white", color:type===k?"white":"#111", fontWeight:900, cursor:"pointer", fontSize:"13px"}}>{k.toUpperCase()}</button>
                ))}
              </div>

              <div style={{marginTop:"14px", background:"#f8fafc", border:"2px solid #8b5cf6", borderRadius:"14px", padding:"12px"}}>
                <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}><b style={{fontSize:"12px", color:"#111"}}>🤖 AI TOPIC MODE</b><button onClick={()=>setAiOn(!aiOn)} style={{background:aiOn?"#7c3aed":"#94a3b8", color:"white", border:"none", padding:"5px 12px", borderRadius:"20px", fontWeight:900, fontSize:"11px", cursor:"pointer"}}>{aiOn?"ON":"OFF"}</button></div>
                <input value={topic} onChange={e=>setTopic(e.target.value)} style={{width:"100%", height:"44px", marginTop:"8px", borderRadius:"10px", border:"2px solid #111", padding:"0 12px", fontWeight:700, color:"#111", fontSize:"14px"}} placeholder="Health, Business, Tech..." />
              </div>

              <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"8px", marginTop:"14px"}}>
                {Object.keys(DB).map(k=>(
                  <button key={k} onClick={()=>setLang(k)} style={{height:"64px", borderRadius:"14px", border:lang===k?"3px solid #111":"1px solid #e2e8f0", background:`linear-gradient(135deg,${COLORS[k][0]},${COLORS[k][1]})`, color:"white", fontWeight:900, cursor:"pointer"}}><div style={{fontSize:"18px"}}>{FLAGS[k]}</div><div style={{fontSize:"11px"}}>{k}</div></button>
                ))}
              </div>

              {/* 17 LANGUAGE LINK BUTTON */}
              <a href="https://loremipsumpro.blogspot.com" target="_blank" style={{display:"block", marginTop:"12px", background:"linear-gradient(135deg,#f59e0b,#ef4444)", borderRadius:"12px", padding:"12px", textAlign:"center", textDecoration:"none", color:"white", fontWeight:900, fontSize:"12px", lineHeight:"16px"}}>
                <div style={{fontSize:"10px", opacity:0.9}}>MORE LANGUAGES ON BLOGGER</div>
                <div>Gujarati | Marathi | Tamil | Telugu | Bengali →</div>
                <div style={{fontSize:"9px", marginTop:"2px", opacity:0.9}}>loremipsumpro.blogspot.com (17 Languages)</div>
              </a>

              <div style={{marginTop:"14px", background:"#f1f5f9", border:"1px solid #e2e8f0", borderRadius:"12px", padding:"12px"}}>
                <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                  <b style={{color:"#111", fontSize:"12px"}}>COUNT</b>
                  <span style={{background:"#111", color:"white", padding:"4px 12px", borderRadius:"20px", fontSize:"12px", fontWeight:900}}>{count} {type.toUpperCase()}</span>
                </div>
                <input type="range" min={1} max={type==="words"?100:10} value={count} onChange={e=>setCount(Number(e.target.value))} style={{width:"100%", marginTop:"10px"}} />
                <div style={{display:"flex", justifyContent:"space-between", fontSize:"10px", color:"#64748b", fontWeight:700}}><span>1</span><span>{type==="words"?100:10}</span></div>
                <div style={{fontSize:"10px", color:"#475569", marginTop:"4px", textAlign:"center", fontWeight:600}}>Slider se number set karo, Generate se banao</div>
              </div>

              <button onClick={generateNow} style={{width:"100%", height:"56px", marginTop:"12px", borderRadius:"14px", border:"none", background:"#111", color:"white", fontWeight:900, fontSize:"15px", cursor:"pointer", letterSpacing:"0.5px"}}>⚡ GENERATE ({lang} - {count})</button>
              <div style={{textAlign:"center", fontSize:"10px", color:"#64748b", marginTop:"6px", fontWeight:600}}>Button dabao tabhi naya text banega</div>
            </div>

            {/* RIGHT OUTPUT */}
            <div style={{background:"white", borderRadius:"20px", border:"1px solid #e2e8f0", display:"flex", flexDirection:"column", minHeight:"600px"}}>
              <div style={{height:"56px", padding:"0 14px", background:"#f8fafc", borderBottom:"1px solid #e2e8f0", display:"flex", justifyContent:"space-between", alignItems:"center", borderTopLeftRadius:"20px", borderTopRightRadius:"20px"}}>
                <div><div style={{fontSize:"12px", fontWeight:900, color:"#111"}}>{lang} • {out.split(/\s+/).filter(Boolean).length} WORDS</div><div style={{fontSize:"10px", color:"#64748b", fontWeight:700}}>{count} {type} • AI: {aiOn?topic:"OFF"}</div></div>
                <div style={{display:"flex", gap:"6px"}}>
                  <button onClick={()=>{navigator.clipboard.writeText(out); alert("Copied!");}} style={{background:"#111", color:"white", border:"none", padding:"8px 16px", borderRadius:"20px", fontWeight:900, cursor:"pointer", fontSize:"12px"}}>COPY</button>
                  <button onClick={downloadTxt} style={{background:"white", color:"#111", border:"2px solid #111", padding:"8px 16px", borderRadius:"20px", fontWeight:900, cursor:"pointer", fontSize:"12px"}}>DOWNLOAD</button>
                </div>
              </div>
              <textarea value={out} onChange={e=>setOut(e.target.value)} style={{flex:1, minHeight:"500px", border:"none", padding:"18px", fontSize:"16px", lineHeight:"30px", outline:"none", color:"#111", fontFamily:"inherit", borderRadius:"0 0 20px 20px"}} placeholder="Click GENERATE button..." />
            </div>
          </div>
        ):(
          <div style={{background:"white", borderRadius:"20px", padding:"28px", border:"1px solid #e2e8f0", color:"#111", lineHeight:"1.8"}}>
            {page==="about" && <><h1 style={{fontSize:"28px"}}>About LoremGen PRO</h1><p><b>LoremGen PRO</b> is India's first 17-language Lorem Ipsum Generator built in Misrikh, Sitapur, Uttar Pradesh.</p><p>We provide 12 languages here (EN, HI, ES, FR, DE, AR, PT, RU, JA, IT, BN, UR) + 5 more languages (Gujarati, Marathi, Tamil, Telugu, Bengali) on our Blogger site <a href="https://loremipsumpro.blogspot.com" target="_blank" style={{color:"#7c3aed", fontWeight:800}}>loremipsumpro.blogspot.com</a> - total 17 languages.</p><p><b>Why we are different:</b> Normal lorem ipsum is only English dummy text. Our AI Topic mode gives you real meaningful sentences. Example: Select HI + Health = "स्वस्थ जीवन के लिए रोज व्यायाम जरूरी है" - useful for health blogs, business sites.</p><p>Made for designers, developers, YouTubers, bloggers who need quick placeholder text.</p></>}
            {page==="privacy" && <><h1>Privacy Policy</h1><p><b>Effective:</b> 13 Sep 2026</p><p>We don't collect personal data. All generation is in browser.</p><p><b>Cookies:</b> Google AdSense may use cookies. You can disable in browser.</p><p><b>Data:</b> No login, no tracking. Vercel may have anonymous logs.</p><p>Contact: support@loremgen.pro</p></>}
            {page==="disclaimer" && <><h1>Disclaimer</h1><p>All generated text is dummy placeholder only. Health/Business AI text is for design mockup, not real medical or business advice.</p><p>We provide as-is, no warranty. External link loremipsumpro.blogspot.com is our own property.</p></>}
            {page==="contact" && <><h1>Contact Us</h1><p><b>Email:</b> support@loremgen.pro<br/><b>Alternate:</b> loremgenpro@gmail.com<br/><b>Location:</b> Misrikh, Sitapur, UP 261001, India<br/><b>Website:</b> This Vercel Tool + <a href="https://loremipsumpro.blogspot.com" target="_blank">Blogger (17 Lang)</a></p><p>Reply within 12 hours. For bug report, send screenshot.</p></>}
            {page==="hire" && <><h1 style={{fontSize:"28px"}}>💼 Hire Me - Available for Work!</h1><div style={{background:"linear-gradient(135deg,#f0f9ff,#e0f2fe)", border:"2px solid #0ea5e9", borderRadius:"16px", padding:"20px", marginTop:"12px"}}><h2 style={{margin:"0 0 8px", color:"#0369a1"}}>Need a Website Like This?</h2><p style={{margin:"0"}}>I'm a developer from <b>Misrikh, Sitapur, UP</b>. I build fast, SEO-ready, AdSense-approved tools like this Lorem Generator.</p><ul style={{marginTop:"12px"}}><li>✅ Next.js / React / Blogger to Vercel Migration</li><li>✅ AdSense Ready Website (About, Privacy, Contact included)</li><li>✅ Multi-Language Tools, AI Tools, SEO Tools</li><li>✅ 100% Mobile Responsive + Fast Loading</li><li>✅ Low Cost, Quick Delivery (2-3 Days)</li></ul><div style={{marginTop:"16px", background:"white", padding:"14px", borderRadius:"12px", border:"1px solid #bae6fd"}}><b>📧 Email me directly:</b><br/><a href="mailto:support@loremgen.pro" style={{fontSize:"18px", fontWeight:900, color:"#0284c7"}}>support@loremgen.pro</a><br/><span style={{fontSize:"12px", color:"#475569"}}>Or WhatsApp: Mention in email, I will reply with number</span><br/><br/><a href="mailto:support@loremgen.pro?subject=Hire%20You%20for%20Website%20Project&body=Hi,%20I%20want%20a%20website%20like%20LoremGen%20PRO" style={{display:"inline-block", background:"#111", color:"white", padding:"12px 20px", borderRadius:"10px", textDecoration:"none", fontWeight:900}}>📨 SEND HIRE REQUEST</a></div></div><p style={{marginTop:"16px"}}><b>Portfolio:</b> loremipsumpro.blogspot.com (7 Languages) + This PRO Version (12 Languages) = 17 Languages Total. AdSense friendly, 100% original code.</p><p><b>Let's build your idea!</b></p></>}
            <button onClick={()=>setPage("home")} style={{marginTop:"20px", background:"#111", color:"white", border:"none", padding:"12px 20px", borderRadius:"12px", fontWeight:900, cursor:"pointer"}}>← BACK TO TOOL</button>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <footer style={{background:"#111", color:"#94a3b8", marginTop:"24px", padding:"28px 14px"}}>
        <div style={{maxWidth:"1150px", margin:"0 auto", display:"grid", gap:"20px"}} className="f"><style>{`@media(min-width:700px){.f{grid-template-columns:2fr 1fr 1fr}}`}</style>
          <div><div style={{display:"flex", alignItems:"center", gap:"8px"}}><div style={{width:"36px", height:"36px", background:"white", borderRadius:"10px", display:"flex", alignItems:"center", justifyContent:"center", color:"#111", fontWeight:900}}>L</div><b style={{color:"white"}}>LoremGen PRO</b></div><p style={{fontSize:"12px", marginTop:"10px", lineHeight:"18px"}}>12 Languages here + 5 on Blogger = 17 Languages Total. Free AI-powered lorem ipsum generator made in Misrikh, UP. Fast, free, no login.</p><div style={{marginTop:"12px"}}><a href="https://loremipsumpro.blogspot.com" target="_blank" style={{background:"#f59e0b", color:"#111", padding:"8px 14px", borderRadius:"20px", fontSize:"11px", fontWeight:900, textDecoration:"none"}}>Visit Blogger Version →</a></div></div>
          <div><b style={{color:"white", fontSize:"12px"}}>QUICK LINKS</b><div style={{display:"flex", flexDirection:"column", gap:"8px", marginTop:"10px", fontSize:"12px"}}>{["home","about","privacy","disclaimer","contact","hire"].map(p=><button key={p} onClick={()=>{setPage(p); window.scrollTo(0,0)}} style={{background:"none", border:"none", color:"#94a3b8", textAlign:"left", cursor:"pointer", padding:"0", fontSize:"12px"}}>{p.toUpperCase()}</button>)}</div></div>
          <div><b style={{color:"white", fontSize:"12px"}}>HIRE ME</b><div style={{marginTop:"10px", fontSize:"12px", lineHeight:"18px"}}>Need similar tool?<br/>Email:<br/><a href="mailto:support@loremgen.pro" style={{color:"white", fontWeight:900}}>support@loremgen.pro</a><br/><br/><span style={{fontSize:"11px"}}>📍 Misrikh, Sitapur, UP<br/>India 261001</span></div></div>
        </div>
        <div style={{maxWidth:"1150px", margin:"0 auto", borderTop:"1px solid #1e293b", marginTop:"20px", paddingTop:"14px", fontSize:"11px", textAlign:"center"}}>© 2026 LoremGen PRO • Made with ❤️ in Uttar Pradesh • 17 Languages • <a href="https://loremipsumpro.blogspot.com" target="_blank" style={{color:"#f59e0b"}}>Blogger Version</a></div>
      </footer>
    </div>
  )
}
