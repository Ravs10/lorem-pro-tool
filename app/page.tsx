"use client";
import { useState, useEffect } from "react";

const FLAGS:any = {EN:"🇺🇸", HI:"🇮🇳", ES:"🇪🇸", FR:"🇫🇷", DE:"🇩🇪", AR:"🇸🇦", PT:"🇵🇹", RU:"🇷🇺", JA:"🇯🇵", IT:"🇮🇹", BN:"🇧🇩", UR:"🇵🇰"}
const COLORS:any = {EN:["#3b82f6","#60a5fa"], HI:["#f97316","#fb923c"], ES:["#ef4444","#f87171"], FR:["#8b5cf6","#a78bfa"], DE:["#1f2937","#6b7280"], AR:["#059669","#10b981"], PT:["#0891b2","#22d3ee"], RU:["#2563eb","#60a5fa"], JA:["#db2777","#f472b6"], IT:["#16a34a","#4ade80"], BN:["#dc2626","#fb7185"], UR:["#15803d","#22c55e"]}

// HAR LANGUAGE KE LIYE SAHI BHASHA ME DATA
const DB:any = {
  EN: {
    words: "lorem ipsum health business technology food yoga startup design marketing life".split(" "),
    health: ["Healthy lifestyle is important for long life", "Yoga and meditation improve mental health", "Eat vegetables and fruits daily", "Drink water and do exercise", "Good sleep is key to health"],
    business: ["Business growth needs smart strategy", "Marketing is key to success", "Startup funding helps scaling", "Customer is always first", "Innovation drives business"],
    default: ["Lorem ipsum dolor sit amet consectetur", "This is dummy text for design", "Use it for mockups and layouts", "Designers love this tool"]
  },
  HI: {
    words: "यह स्वास्थ्य व्यवसाय तकनीक भोजन योग डिज़ाइन जीवन के लिए नमूना पाठ है".split(" "),
    health: ["स्वस्थ जीवनशैली लंबी उम्र के लिए जरूरी है", "योग और ध्यान से मानसिक स्वास्थ्य बेहतर होता है", "रोज हरी सब्जियां और फल खाएं", "रोज 8 गिलास पानी पिएं और व्यायाम करें", "अच्छी नींद स्वास्थ्य की कुंजी है"],
    business: ["व्यापार बढ़ाने के लिए अच्छी रणनीति चाहिए", "मार्केटिंग सफलता की कुंजी है", "ग्राहक संतुष्टि सबसे जरूरी है", "नवाचार से व्यापार आगे बढ़ता है"],
    default: ["यह डिज़ाइन के लिए नमूना पाठ है", "इसका उपयोग लेआउट देखने के लिए होता है", "यह पूरी तरह से मुफ्त उपकरण है", "डिज़ाइनरों के लिए बनाया गया है"]
  },
  ES: { words: "salud negocio tecnologia comida yoga diseno".split(" "), health: ["La vida saludable es importante", "Yoga mejora la salud mental", "Come verduras y frutas"], business: ["El crecimiento empresarial necesita estrategia", "Marketing es clave del exito"], default: ["Este es texto de ejemplo para diseno"] },
  FR: { words: "sante entreprise technologie nourriture yoga design".split(" "), health: ["La vie saine est importante", "Le yoga ameliore la sante"], business: ["La croissance de l'entreprise a besoin de strategie"], default: ["Ceci est un exemple de texte pour la conception"] },
  DE: { words: "gesundheit geschaft technologie essen yoga design".split(" "), health: ["Gesunder Lebensstil ist wichtig", "Yoga verbessert die Gesundheit"], business: ["Unternehmenswachstum braucht Strategie"], default: ["Dies ist ein Beispieltext fur Design"] },
  AR: { words: "الصحة الأعمال التكنولوجيا الطعام اليوغا تصميم".split(" "), health: ["نمط الحياة الصحي مهم", "اليوغا تحسن الصحة"], business: ["نمو الأعمال يحتاج استراتيجية"], default: ["هذا نص تجريبي للتصميم"] },
  PT: { words: "saude negocio tecnologia comida yoga design".split(" "), health: ["Vida saudavel e importante", "Yoga melhora a saude"], business: ["Crescimento empresarial precisa de estrategia"], default: ["Este e um texto de exemplo"] },
  RU: { words: "здоровье бизнес технология еда йога дизайн".split(" "), health: ["Здоровый образ жизни важен", "Йога улучшает здоровье"], business: ["Рост бизнеса требует стратегии"], default: ["Это пример текста для дизайна"] },
  JA: { words: "健康 ビジネス テクノロジー 食べ物 ヨガ デザイン".split(" "), health: ["健康的な生活は重要です", "ヨガは健康を改善します"], business: ["ビジネスの成長には戦略が必要"], default: ["これはデザイン用のサンプルテキストです"] },
  IT: { words: "salute affari tecnologia cibo yoga design".split(" "), health: ["La vita sana e importante", "Lo yoga migliora la salute"], business: ["La crescita aziendale ha bisogno di strategia"], default: ["Questo e un testo di esempio per il design"] },
  BN: { words: "স্বাস্থ্য ব্যবসা প্রযুক্তি খাদ্য যোগা ডিজাইন".split(" "), health: ["স্বাস্থ্যকর জীবনযাপন গুরুত্বপূর্ণ", "যোগব্যায়াম স্বাস্থ্যের উন্নতি করে"], business: ["ব্যবসায়িক বৃদ্ধির জন্য কৌশল প্রয়োজন"], default: ["এটি ডিজাইনের জন্য একটি নমুনা পাঠ্য"] },
  UR: { words: "صحت کاروبار ٹیکنالوجی کھانا یوگا ڈیزائن".split(" "), health: ["صحت مند طرز زندگی اہم ہے", "یوگا صحت کو بہتر بناتا ہے"], business: ["کاروباری ترقی کے لیے حکمت عملی کی ضرورت ہے"], default: ["یہ ڈیزائن کے لیے نمونہ متن ہے"] },
}

export default function Page(){
  const [page,setPage]=useState("home");
  const [lang,setLang]=useState("EN");
  const [count,setCount]=useState(3);
  const [type,setType]=useState("para");
  const [out,setOut]=useState("");
  const [topic,setTopic]=useState("Health");
  const [aiOn,setAiOn]=useState(true);

  const generate=()=>{
    const d = DB[lang];
    const t = topic.toLowerCase();
    let bank = d.default;
    if(t.includes("health") || t.includes("yoga") || t.includes("स्वास्थ्य")) bank = d.health;
    else if(t.includes("business") || t.includes("startup") || t.includes("व्यापार")) bank = d.business;

    let res="";
    if(type==="words"){
      let arr = aiOn && topic? [topic] : [];
      for(let i=arr.length;i<count;i++) arr.push(d.words[Math.floor(Math.random()*d.words.length)]);
      res = arr.join(" ");
    } else if(type==="para"){
      let paras=[];
      for(let p=0;p<count;p++){
        let para="";
        for(let i=0;i<3;i++) para += bank[Math.floor(Math.random()*bank.length)] + ". ";
        paras.push(para);
      }
      res = paras.join("\n\n");
    } else if(type==="sent"){
      let arr=[];
      for(let i=0;i<count;i++) arr.push(bank[Math.floor(Math.random()*bank.length)]+".");
      res = arr.join(" ");
    } else {
      let arr=[];
      for(let i=0;i<count;i++) arr.push(`${i+1}. ${bank[Math.floor(Math.random()*bank.length)]}.`);
      res = arr.join("\n");
    }
    setOut(res);
  }

  useEffect(()=>{ generate(); },[lang, type, count]);

  return(
    <div style={{minHeight:"100vh", background:"linear-gradient(135deg,#667eea,#764ba2,#f093fb)", padding:"10px"}}>
      <div style={{maxWidth:"1150px", margin:"0 auto"}}>
        <div style={{background:"white", borderRadius:"20px", height:"64px", padding:"0 12px", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
          <b style={{fontSize:"20px"}}>LoremGen<span style={{color:"#7c3aed"}}> PRO</span></b>
          <div style={{display:"flex", gap:"5px"}}>
            {["home","about","privacy","disclaimer","contact"].map(p=>(
              <button key={p} onClick={()=>setPage(p)} style={{border:"none", padding:"7px 11px", borderRadius:"20px", fontWeight:900, fontSize:"11px", cursor:"pointer", background: page===p?"#111":"#eee", color: page===p?"white":"#333", textTransform:"uppercase"}}>{p}</button>
            ))}
          </div>
        </div>

        {page==="home"? (
          <div style={{display:"grid", gap:"12px", marginTop:"12px"}} className="g"><style>{`@media(min-width:900px){.g{grid-template-columns:410px 1fr}}`}</style>
            <div style={{background:"white", borderRadius:"26px", padding:"16px"}}>
              <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px"}}>
                {[{k:"para",l:"PARAGRAPH"},{k:"words",l:"WORDS"},{k:"sent",l:"SENTENCES"},{k:"list",l:"LIST"}].map(b=>(
                  <button key={b.k} onClick={()=>{setType(b.k); setTimeout(generate,10)}} style={{height:"62px", borderRadius:"16px", border: type===b.k?"3px solid #111":"2px solid #eee", background: type===b.k?"#111":"white", color: type===b.k?"white":"#111", fontWeight:900, fontSize:"14px", cursor:"pointer"}}>{b.l}</button>
                ))}
              </div>

              <div style={{marginTop:"14px", background:"#f5f3ff", border:"2px solid #a78bfa", borderRadius:"16px", padding:"12px"}}>
                <div style={{display:"flex", justifyContent:"space-between"}}><b style={{fontSize:"12px"}}>🤖 AI TOPIC</b><button onClick={()=>setAiOn(!aiOn)} style={{background: aiOn?"#7c3aed":"#aaa", color:"white", border:"none", padding:"5px 12px", borderRadius:"20px", fontWeight:900, cursor:"pointer", fontSize:"11px"}}>{aiOn?"ON - TOPIC WORKING":"OFF"}</button></div>
                <input value={topic} onChange={e=>setTopic(e.target.value)} placeholder="Health / Business / Tech" style={{width:"100%", marginTop:"8px", height:"46px", borderRadius:"12px", border:"2px solid #7c3aed", padding:"0 12px", fontWeight:700}} />
                <div style={{fontSize:"10px", marginTop:"6px", background:"white", padding:"6px", borderRadius:"8px"}}>✅ Ab Hindi select karke Health likho to Hindi me Health ka text ayega<br/>✅ EN select karke Business likho to English Business ayega</div>
              </div>

              <div style={{marginTop:"14px", display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"8px"}}>
                {Object.keys(DB).map(k=>(
                  <button key={k} onClick={()=>{setLang(k); setTimeout(generate,20)}} style={{height:"68px", borderRadius:"18px", border: lang===k?"3px solid #111":"none", background:`linear-gradient(135deg,${COLORS[k][0]},${COLORS[k][1]})`, color:"white", fontWeight:900, cursor:"pointer", transform: lang===k?"scale(1.05)":"scale(1)"}}><div style={{fontSize:"20px"}}>{FLAGS[k]}</div>{k}</button>
                ))}
              </div>

              <div style={{marginTop:"14px", background:"#f9fafb", padding:"12px", borderRadius:"14px", border:"1px solid #eee"}}>
                <div style={{display:"flex", justifyContent:"space-between", fontSize:"12px", fontWeight:900}}><span>{type.toUpperCase()} COUNT</span><span style={{background:"#111", color:"white", padding:"2px 10px", borderRadius:"20px"}}>{count}</span></div>
                <input type="range" min={1} max={type==="words"?100:10} value={count} onChange={e=>{setCount(Number(e.target.value));}} style={{width:"100%", marginTop:"8px"}} />
              </div>
              <button onClick={generate} style={{width:"100%", marginTop:"12px", height:"60px", borderRadius:"16px", border:"none", background:"#111", color:"white", fontWeight:900, fontSize:"16px", cursor:"pointer"}}>✨ GENERATE ({lang})</button>
            </div>

            <div style={{background:"white", borderRadius:"26px", overflow:"hidden", display:"flex", flexDirection:"column"}}>
              <div style={{padding:"12px 16px", background:"#f9fafb", borderBottom:"1px solid #eee", display:"flex", justifyContent:"space-between", alignItems:"center"}}><span style={{fontSize:"11px", fontWeight:800, opacity:0.6}}>{lang} • {out.split(/\s+/).filter(Boolean).length} WORDS</span><button onClick={()=>navigator.clipboard.writeText(out)} style={{background:"#111", color:"white", border:"none", padding:"7px 14px", borderRadius:"20px", fontWeight:900, cursor:"pointer"}}>COPY</button></div>
              <textarea value={out} onChange={e=>setOut(e.target.value)} style={{flex:1, minHeight:"500px", border:"none", padding:"16px", fontSize:"16px", lineHeight:"30px", outline:"none"}} />
            </div>
          </div>
        ) : (
          <div style={{background:"white", borderRadius:"26px", padding:"24px", marginTop:"14px", lineHeight:"26px"}}>
            {page==="about" && <><h2>About Us</h2><p>We are from Misrikh, UP, India. This tool generates dummy text in 12 languages with AI topic support. 100% free, no data collection, AdSense ready.</p></>}
            {page==="privacy" && <><h
