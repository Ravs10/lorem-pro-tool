"use client";
import { useState, useEffect } from "react";

const FLAGS:any={EN:"🇺🇸",HI:"🇮🇳",ES:"🇪🇸",FR:"🇫🇷",DE:"🇩🇪",AR:"🇸🇦",PT:"🇵🇹",RU:"🇷🇺",JA:"🇯🇵",IT:"🇮🇹",BN:"🇧🇩",UR:"🇵🇰"}
const COLORS:any={EN:["#3b82f6","#60a5fa"],HI:["#f97316","#fb923c"],ES:["#ef4444","#f87171"],FR:["#8b5cf6","#a78bfa"],DE:["#1f2937","#6b7280"],AR:["#059669","#10b981"],PT:["#0891b2","#22d3ee"],RU:["#2563eb","#60a5fa"],JA:["#db2777","#f472b6"],IT:["#16a34a","#4ade80"],BN:["#dc2626","#fb7185"],UR:["#15803d","#22c55e"]}

const DB:any={
  EN:{words:["lorem","ipsum","health","business","yoga","design"], health:["Healthy life needs daily exercise","Yoga improves mental health","Eat fruits and vegetables daily","Drink water and sleep 8 hours","Meditation keeps mind calm"], business:["Business growth needs smart planning","Marketing is key to success","Customer satisfaction is priority","Startup needs funding"], default:["Lorem ipsum dolor sit amet consectetur","This is dummy text for design and mockups","Use it for layouts and wireframes"]},
  HI:{words:["स्वास्थ्य","व्यापार","योग","भोजन"], health:["स्वस्थ जीवन के लिए रोज व्यायाम जरूरी है","योग से मानसिक स्वास्थ्य बेहतर होता है","रोज फल और हरी सब्जियां खाएं","रोज 8 गिलास पानी पिएं","ध्यान से मन शांत रहता है"], business:["व्यापार बढ़ाने के लिए अच्छी योजना चाहिए","मार्केटिंग सफलता की कुंजी है","ग्राहक की संतुष्टि सबसे जरूरी है"], default:["यह डिज़ाइन के लिए नमूना पाठ है","इसका उपयोग लेआउट देखने के लिए होता है"]},
  IT:{words:["salute","affari","yoga"], health:["La vita sana ha bisogno di esercizio","Lo yoga migliora la salute"], business:["La crescita aziendale ha bisogno di strategia"], default:["Testo di esempio per design"]},
  BN:{words:["স্বাস্থ্য","ব্যবসা","যোগা"], health:["সুস্থ জীবনের জন্য ব্যায়াম দরকার","যোগব্যায়াম স্বাস্থ্য ভালো করে"], business:["ব্যবসার জন্য কৌশল দরকার"], default:["ডিজাইনের জন্য নমুনা পাঠ্য"]},
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
  useEffect(()=>{generateNow()},[lang,type,count,topic,aiOn]);

  return(
    <div style={{minHeight:"100vh", background:"linear-gradient(135deg,#667eea,#764ba2)", padding:"10px"}}>
      <div style={{maxWidth:"1100px", margin:"0 auto"}}>
        {/* MENU - SCROLLABLE FIX */}
        <div style={{background:"white", borderRadius:"20px", padding:"10px", display:"flex", alignItems:"center", justifyContent:"space-between", overflowX:"auto", whiteSpace:"nowrap"}}>
          <b style={{color:"#111", marginRight:"10px"}}>LoremGen PRO</b>
          <div style={{display:"flex", gap:"6px"}}>
            {["home","about","privacy","disclaimer","contact"].map(p=>(
              <button key={p} onClick={()=>{setPage(p); window.scrollTo(0,0)}} style={{background:page===p?"#111":"#f1f5f9", color:page===p?"white":"#111", border:"none", padding:"8px 14px", borderRadius:"20px", fontSize:"12px", fontWeight:900, cursor:"pointer", flexShrink:0}}>{p.toUpperCase()}</button>
            ))}
          </div>
        </div>

        {page==="home"?(
          <div style={{display:"grid", gap:"12px", marginTop:"12px"}} className="g"><style>{`@media(min-width:900px){.g{grid-template-columns:400px 1fr}}`}</style>
            <div style={{background:"white", borderRadius:"24px", padding:"14px"}}>
              <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px"}}>
                {["para","words","sent","list"].map(k=>(
                  <button key={k} onClick={()=>setType(k)} style={{height:"56px", borderRadius:"14px", border:type===k?"3px solid #111":"2px solid #e5e7eb", background:type===k?"#111":"white", color:type===k?"white":"#111", fontWeight:900, cursor:"pointer"}}>{k.toUpperCase()}</button>
                ))}
              </div>
              <div style={{marginTop:"12px", background:"#ffffff", border:"2px solid #8b5cf6", borderRadius:"16px", padding:"12px"}}>
                <div style={{display:"flex", justifyContent:"space-between"}}><b style={{fontSize:"13px", color:"#111"}}>🤖 AI TOPIC = {aiOn?"ON":"OFF"}</b><button onClick={()=>setAiOn(!aiOn)} style={{background:aiOn?"#7c3aed":"#aaa", color:"white", border:"none", padding:"6px 12px", borderRadius:"20px", fontWeight:900}}>{aiOn?"ON":"OFF"}</button></div>
                <input value={topic} onChange={e=>setTopic(e.target.value)} style={{width:"100%", height:"44px", marginTop:"8px", borderRadius:"10px", border:"2px solid #111", padding:"0 10px", fontWeight:700, color:"#111"}} />
                <div style={{fontSize:"11px", marginTop:"6px", color:"#111", fontWeight:700}}>Hindi ke liye HI select karo</div>
              </div>
              <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"8px", marginTop:"12px"}}>
                {Object.keys(DB).map(k=>(
                  <button key={k} onClick={()=>setLang(k)} style={{height:"68px", borderRadius:"16px", border:lang===k?"4px solid #111":"2px solid #eee", background:`linear-gradient(135deg,${COLORS[k][0]},${COLORS[k][1]})`, color:"white", fontWeight:900, cursor:"pointer"}}><div style={{fontSize:"20px"}}>{FLAGS[k]}</div>{k}</button>
                ))}
              </div>
              <div style={{marginTop:"14px", background:"#f1f5f9", padding:"12px", borderRadius:"12px"}}>
                <div style={{display:"flex", justifyContent:"space-between"}}><b style={{color:"#111", fontSize:"12px"}}>COUNT: {count}</b><b style={{color:"#111"}}>{type}</b></div>
                <input type="range" min={1} max={type==="words"?50:10} value={count} onChange={e=>setCount(Number(e.target.value))} style={{width:"100%"}} />
              </div>
              <button onClick={generateNow} style={{width:"100%", height:"56px", marginTop:"12px", borderRadius:"14px", border:"none", background:"#111", color:"white", fontWeight:900, fontSize:"16px", cursor:"pointer"}}>GENERATE ({lang} - {count})</button>
            </div>
            <div style={{background:"white", borderRadius:"24px", overflow:"hidden", display:"flex", flexDirection:"column"}}>
              <div style={{height:"52px", padding:"0 12px", background:"#f8fafc", borderBottom:"1px solid #e2e8f0", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                <span style={{fontSize:"12px", fontWeight:900, color:"#111"}}>{lang} • {out.split(" ").length} WORDS • {count} {type.toUpperCase()}</span>
                <button onClick={()=>navigator.clipboard.writeText(out)} style={{background:"#111", color:"white", border:"none", padding:"7px 14px", borderRadius:"20px", fontWeight:900, cursor:"pointer"}}>COPY</button>
              </div>
              <textarea value={out} onChange={e=>setOut(e.target.value)} style={{flex:1, minHeight:"500px", border:"none", padding:"14px", fontSize:"16px", lineHeight:"28px", outline:"none", color:"#111"}} />
            </div>
          </div>
        ):(
          <div style={{background:"white", borderRadius:"24px", padding:"24px", marginTop:"12px", color:"#111", lineHeight:"1.8"}}>
            {page==="about" && <><h1>About LoremGen PRO</h1><p>Welcome to LoremGen PRO - India's most advanced Lorem Ipsum Generator. We started in Misrikh, Sitapur, Uttar Pradesh with a mission to help designers, developers, bloggers and students.</p><p><b>What we offer:</b> 12 Languages (English, Hindi, Spanish, French, German, Arabic, Portuguese, Russian, Japanese, Italian, Bengali, Urdu), AI Topic Mode (Health, Business, Tech, Food, Yoga), 4 Formats (Paragraph, Words, Sentences, List).</p><p>Unlike other tools that only provide English Lorem Ipsum, we provide real meaningful placeholder text in your own language. For example, if you select Hindi and type Health, you will get real Hindi health related sentences like "स्वस्थ जीवन के लिए रोज व्यायाम जरूरी है" - not English.</p><p>This tool is 100% free, no login required, works offline, AdSense friendly, and made for Indian users.</p></>}
            {page==="privacy" && <><h1>Privacy Policy</h1><p>Effective Date: 13 Sep 2026. At LoremGen PRO, privacy is important. We do not collect personal information.</p><p><b>1. No Data Collection:</b> All text generation happens in your browser. We don't store what you generate.</p><p><b>2. Cookies:</b> We use Google AdSense which may use cookies to show relevant ads. You can disable cookies in browser settings.</p><p><b>3. Third Party:</b> Vercel hosting may collect anonymous analytics.</p><p><b>4. Children's Privacy:</b> Our site is safe for all ages.</p><p>Contact us for any privacy questions at support@loremgen.pro</p></>}
            {page==="disclaimer" && <><h1>Disclaimer</h1><p>The content generated by LoremGen PRO is dummy placeholder text only.</p><p><b>1. Not Professional Advice:</b> Even in AI Topic mode (Health, Business), generated text is for design mockup only, not real medical or business advice.</p><p><b>2. No Warranty:</b> Tool is provided as-is without warranty.</p><p><b>3. External Links:</b> We are not responsible for external sites.</p><p>Use this tool for design, development, and educational purposes only.</p></>}
            {page==="contact" && <><h1>Contact Us</h1><p>We love to hear from you! Made with ❤️ in Misrikh, UP, India.</p><p><b>Email:</b> support@loremgen.pro<br/><b>Location:</b> Misrikh, Sitapur, Uttar Pradesh 261001, India<br/><b>Response Time:</b> Within 24 hours</p><p><b>For Business Queries:</b> If you want to add more languages or need custom lorem generator for your company, email us.</p><p><b>Report Bug:</b> If any language button not working, just email with screenshot.</p><div style={{marginTop:"16px", background:"#f1f5f9", padding:"16px", borderRadius:"12px"}}><p>Form: Name, Email, Message - (backend not needed for AdSense)</p><input placeholder="Your Name" style={{width:"100%", height:"40px", marginTop:"8px", padding:"0 10px", border:"1px solid #ccc", borderRadius:"8px"}} /><input placeholder="Your Email" style={{width:"100%", height:"40px", marginTop:"8px", padding:"0 10px", border:"1px solid #ccc", borderRadius:"8px"}} /><textarea placeholder="Your Message" style={{width:"100%", height:"80px", marginTop:"8px", padding:"10px", border:"1px solid #ccc", borderRadius:"8px"}}></textarea><button style={{marginTop:"10px", background:"#111", color:"white", padding:"10px 20px", borderRadius:"8px", border:"none", fontWeight:900}}>SEND</button></div></>}
            <button onClick={()=>setPage("home")} style={{marginTop:"20px", background:"#111", color:"white", border:"none", padding:"12px 20px", borderRadius:"12px", fontWeight:900, cursor:"pointer"}}>← BACK TO TOOL</button>
          </div>
        )}
      </div>
    </div>
  )
}
