"use client";
import { useState, useEffect } from "react";

const FLAGS:any={EN:"🇺🇸",HI:"🇮🇳",ES:"🇪🇸",FR:"🇫🇷",DE:"🇩🇪",AR:"🇸🇦",PT:"🇵🇹",RU:"🇷🇺",JA:"🇯🇵",IT:"🇮🇹",BN:"🇧🇩",UR:"🇵🇰"}
const COLORS:any={EN:["#3b82f6","#60a5fa"],HI:["#f97316","#fb923c"],ES:["#ef4444","#f87171"],FR:["#8b5cf6","#a78bfa"],DE:["#1f2937","#6b7280"],AR:["#059669","#10b981"],PT:["#0891b2","#22d3ee"],RU:["#2563eb","#60a5fa"],JA:["#db2777","#f472b6"],IT:["#16a34a","#4ade80"],BN:["#dc2626","#fb7185"],UR:["#15803d","#22c55e"]}

const DB:any={
  EN:{words:["lorem","ipsum","health","business","yoga","food","tech","design","startup"], health:["Healthy life needs daily exercise","Yoga improves mental health and focus","Eat fruits and vegetables daily","Drink water and sleep 8 hours","Meditation keeps mind calm"], business:["Business growth needs smart planning","Marketing is key to success","Customer satisfaction is priority","Startup needs funding and team","Innovation drives market"], default:["Lorem ipsum dolor sit amet","This is dummy text for design","Use for mockups and wireframes","Designers love this placeholder"]},
  HI:{words:["स्वास्थ्य","व्यापार","योग","भोजन","तकनीक","डिज़ाइन"], health:["स्वस्थ जीवन के लिए रोज व्यायाम जरूरी है","योग से मानसिक स्वास्थ्य बेहतर होता है","रोज फल और हरी सब्जियां खाएं","रोज 8 गिलास पानी पिएं","ध्यान से मन शांत रहता है"], business:["व्यापार बढ़ाने के लिए अच्छी योजना चाहिए","मार्केटिंग सफलता की कुंजी है","ग्राहक की संतुष्टि सबसे जरूरी है","स्टार्टअप को टीम और फंडिंग चाहिए"], default:["यह डिज़ाइन के लिए नमूना पाठ है","इसका उपयोग लेआउट चेक करने में होता है","यह मुफ्त उपकरण है"]},
  IT:{words:["salute","affari","yoga","cibo","tecnologia","design"], health:["La vita sana ha bisogno di esercizio","Lo yoga migliora la salute mentale","Mangia frutta e verdura ogni giorno"], business:["La crescita aziendale ha bisogno di strategia","Il marketing e la chiave del successo"], default:["Questo e un testo di esempio per il design","Usalo per mockup e layout"]},
  BN:{words:["স্বাস্থ্য","ব্যবসা","যোগা","খাদ্য"], health:["সুস্থ জীবনের জন্য ব্যায়াম দরকার","যোগব্যায়াম স্বাস্থ্য ভালো করে"], business:["ব্যবসার জন্য কৌশল দরকার"], default:["ডিজাইনের জন্য নমুনা পাঠ্য"]},
  UR:{words:["صحت","کاروبار","یوگا","کھانا"], health:["صحت مند زندگی کے لیے ورزش ضروری ہے","یوگا صحت بہتر بناتا ہے"], business:["کاروبار کے لیے حکمت عملی چاہیے"], default:["ڈیزائن کے لیے نمونہ متن"]},
  ES:{words:["salud","negocio","yoga"], health:["La vida saludable necesita ejercicio","El yoga mejora la salud"], business:["El negocio necesita estrategia"], default:["Texto de ejemplo para diseño"]},
  FR:{words:["sante","entreprise","yoga"], health:["La vie saine necessite exercice","Le yoga ameliore la sante"], business:["L'entreprise a besoin de strategie"], default:["Exemple de texte pour design"]},
  DE:{words:["gesundheit","geschaft","yoga"], health:["Gesundes Leben braucht Bewegung","Yoga verbessert Gesundheit"], business:["Geschaft braucht Strategie"], default:["Beispieltext fur Design"]},
  AR:{words:["الصحة","الأعمال","اليوغا"], health:["الحياة الصحية تحتاج رياضة","اليوغا تحسن الصحة"], business:["الأعمال تحتاج استراتيجية"], default:["نص تجريبي للتصميم"]},
  PT:{words:["saude","negocio","yoga"], health:["Vida saudavel precisa exercicio","Yoga melhora saude"], business:["Negocio precisa estrategia"], default:["Texto exemplo"]},
  RU:{words:["здоровье","бизнес","йога"], health:["Здоровый образ жизни важен","Йога улучшает здоровье"], business:["Бизнес требует стратегии"], default:["Пример текста"]},
  JA:{words:["健康","ビジネス","ヨガ"], health:["健康的な生活には運動が必要","ヨガは健康を改善します"], business:["ビジネスには戦略が必要"], default:["デザイン用サンプルテキスト"]},
}

export default function Page(){
  const [page,setPage]=useState("home");
  const [lang,setLang]=useState("EN");
  const [type,setType]=useState("words");
  const [count,setCount]=useState(8);
  const [topic,setTopic]=useState("Health");
  const [aiOn,setAiOn]=useState(true);
  const [out,setOut]=useState("");
  const [copied,setCopied]=useState(false);

  const getBank=()=>{
    const d=DB[lang]; const t=topic.toLowerCase();
    if(t.includes("health")||t.includes("स्वास्थ्य")||t.includes("योग")||t.includes("yoga")||t.includes("salute")||t.includes("صحت")) return d.health;
    if(t.includes("business")||t.includes("व्यापार")||t.includes("affari")||t.includes("کاروبار")) return d.business;
    return d.default;
  }

  const generateNow=()=>{
    const bank=getBank(); const words=DB[lang].words;
    let res="";
    if(type==="words"){ let arr= aiOn? [topic] : []; for(let i=arr.length;i<count;i++) arr.push(words[Math.floor(Math.random()*words.length)]); res=arr.join(" "); }
    else if(type==="para"){ let paras=[]; for(let i=0;i<count;i++){ let p=""; for(let j=0;j<3;j++) p+= bank[Math.floor(Math.random()*bank.length)]+". "; paras.push(p.trim()); } res=paras.join("\n\n"); }
    else if(type==="sent"){ let arr=[]; for(let i=0;i<count;i++) arr.push(bank[Math.floor(Math.random()*bank.length)]+"."); res=arr.join(" "); }
    else { let arr=[]; for(let i=0;i<count;i++) arr.push(`${i+1}. ${bank[Math.floor(Math.random()*bank.length)]}.`); res=arr.join("\n"); }
    setOut(res);
  }

  useEffect(()=>{ generateNow(); },[lang,type,count,topic,aiOn]);

  const copyText=()=>{ navigator.clipboard.writeText(out); setCopied(true); setTimeout(()=>setCopied(false),1500); }

  return(
    <div style={{minHeight:"100vh", background:"linear-gradient(135deg,#667eea 0%,#764ba2 50%,#f093fb 100%)", padding:"10px"}}>
      <div style={{maxWidth:"1100px", margin:"0 auto"}}>
        <div style={{background:"white", borderRadius:"20px", height:"64px", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 14px", boxShadow:"0 4px 20px rgba(0,0,0,0.1)"}}>
          <b style={{fontSize:"18px", color:"#111"}}>LoremGen PRO</b>
          <div style={{display:"flex", gap:"4px"}}>
            {["home","about","privacy","disclaimer","contact"].map(p=>(
              <button key={p} onClick={()=>setPage(p)} style={{background:page===p?"#111":"#f3f4f6", color:page===p?"white":"#333", border:"none", padding:"7px 10px", borderRadius:"20px", fontSize:"11px", fontWeight:900, cursor:"pointer"}}>{p.toUpperCase()}</button>
            ))}
          </div>
        </div>

        {page==="home"?(
          <div style={{display:"grid", gap:"12px", marginTop:"12px"}} className="g"><style>{`@media(min-width:900px){.g{grid-template-columns:400px 1fr}}`}</style>
            <div style={{background:"white", borderRadius:"24px", padding:"14px", boxShadow:"0 8px 30px rgba(0,0,0,0.12)"}}>
              <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px"}}>
                {["para","words","sent","list"].map(k=>(
                  <button key={k} onClick={()=>setType(k)} style={{height:"58px", borderRadius:"14px", border:type===k?"3px solid #111":"2px solid #e5e7eb", background:type===k?"#111":"white", color:type===k?"white":"#111", fontWeight:900, cursor:"pointer"}}>{k.toUpperCase()}</button>
                ))}
              </div>

              <div style={{marginTop:"12px", background:"white", border:"2px solid #8b5cf6", borderRadius:"16px", padding:"12px"}}>
                <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}><b style={{fontSize:"13px", color:"#111"}}>🤖 AI TOPIC MODE</b><button onClick={()=>setAiOn(!aiOn)} style={{background:aiOn?"#7c3aed":"#9ca3af", color:"white", border:"none", padding:"6px 14px", borderRadius:"20px", fontWeight:900, cursor:"pointer", fontSize:"12px"}}>{aiOn?"ON":"OFF"}</button></div>
                <input value={topic} onChange={e=>setTopic(e.target.value)} style={{width:"100%", height:"46px", marginTop:"10px", borderRadius:"12px", border:"2px solid #ddd", padding:"0 12px", fontWeight:700, color:"#111", fontSize:"16px"}} placeholder="Ex: Health, Business" />
                <div style={{fontSize:"11px", marginTop:"6px", color:"#333", background:"#f5f3ff", padding:"6px 8px", borderRadius:"8px", fontWeight:600}}>Topic likho + Language select = usi bhasha me ayega</div>
              </div>

              <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"8px", marginTop:"14px"}}>
                {Object.keys(DB).map(k=>(
                  <button key={k} onClick={()=>setLang(k)} style={{height:"70px", borderRadius:"18px", border:lang===k?"4px solid #111":"2px solid transparent", background:`linear-gradient(135deg,${COLORS[k][0]},${COLORS[k][1]})`, color:"white", fontWeight:900, cursor:"pointer", boxShadow: lang===k?"0 4px 12px rgba(0,0,0,0.3)":"none"}}><div style={{fontSize:"22px"}}>{FLAGS[k]}</div><div style={{fontSize:"13px"}}>{k}</div></button>
                ))}
              </div>

              <div style={{marginTop:"16px", background:"#f9fafb", border:"1px solid #e5e7eb", borderRadius:"14px", padding:"12px"}}>
                <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}><span style={{fontSize:"12px", fontWeight:900, color:"#111"}}>COUNT SLIDER</span><span style={{background:"#111", color:"white", padding:"4px 12px", borderRadius:"20px", fontWeight:900, fontSize:"13px"}}>{count} {type.toUpperCase()}</span></div>
                <input type="range" min={1} max={type==="words"?50:10} value={count} onChange={e=>setCount(Number(e.target.value))} style={{width:"100%", marginTop:"12px", height:"8px", accentColor:"#111"}} />
                <div style={{display:"flex", justifyContent:"space-between", fontSize:"11px", fontWeight:700, color:"#666", marginTop:"4px"}}><span>1</span><span>{type==="words"?"50":"10"}</span></div>
              </div>

              <button onClick={generateNow} style={{width:"100%", height:"58px", marginTop:"14px", borderRadius:"16px", border:"none", background:"#111", color:"white", fontWeight:900, fontSize:"16px", cursor:"pointer", letterSpacing:"1px"}}>GENERATE ({lang} - {count})</button>
            </div>

            <div style={{background:"white", borderRadius:"24px", display:"flex", flexDirection:"column", overflow:"
