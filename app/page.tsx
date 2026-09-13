"use client";
import { useState, useEffect } from "react";

const FLAGS:any={EN:"🇺🇸",HI:"🇮🇳",ES:"🇪🇸",FR:"🇫🇷",DE:"🇩🇪",AR:"🇸🇦",PT:"🇵🇹",RU:"🇷🇺",JA:"🇯🇵",IT:"🇮🇹",BN:"🇧🇩",UR:"🇵🇰"}
const COLORS:any={EN:["#3b82f6","#60a5fa"],HI:["#f97316","#fb923c"],ES:["#ef4444","#f87171"],FR:["#8b5cf6","#a78bfa"],DE:["#1f2937","#6b7280"],AR:["#059669","#10b981"],PT:["#0891b2","#22d3ee"],RU:["#2563eb","#60a5fa"],JA:["#db2777","#f472b6"],IT:["#16a34a","#4ade80"],BN:["#dc2626","#fb7185"],UR:["#15803d","#22c55e"]}

const DB:any={
  EN:{words:["lorem","ipsum","health","business","yoga","food","tech","design"], health:["Healthy life needs daily exercise","Yoga improves mental health and focus","Eat fruits and vegetables daily","Drink water and sleep 8 hours","Meditation keeps mind calm"], business:["Business growth needs smart planning","Marketing is key to success","Customer satisfaction is priority","Startup needs funding and team","Innovation drives market"], default:["Lorem ipsum dolor sit amet","This is dummy text for design","Use for mockups and wireframes","Designers love this placeholder"]},
  HI:{words:["स्वास्थ्य","व्यापार","योग","भोजन","तकनीक","डिज़ाइन"], health:["स्वस्थ जीवन के लिए रोज व्यायाम जरूरी है","योग से मानसिक स्वास्थ्य बेहतर होता है","रोज फल और हरी सब्जियां खाएं","रोज 8 गिलास पानी पिएं","ध्यान से मन शांत रहता है"], business:["व्यापार बढ़ाने के लिए अच्छी योजना चाहिए","मार्केटिंग सफलता की कुंजी है","ग्राहक की संतुष्टि सबसे जरूरी है","स्टार्टअप को टीम और फंडिंग चाहिए"], default:["यह डिज़ाइन के लिए नमूना पाठ है","इसका उपयोग लेआउट चेक करने में होता है","यह मुफ्त उपकरण है"]},
  ES:{words:["salud","negocio","yoga","comida"], health:["La vida saludable necesita ejercicio","El yoga mejora la salud mental","Come frutas y verduras"], business:["El negocio necesita buena estrategia","El marketing es clave"], default:["Texto de ejemplo para diseño"]},
  FR:{words:["sante","entreprise","yoga"], health:["La vie saine necessite de l'exercice","Le yoga ameliore la sante"], business:["L'entreprise a besoin de strategie"], default:["Exemple de texte pour design"]},
  DE:{words:["gesundheit","geschaft","yoga"], health:["Gesundes Leben braucht Bewegung","Yoga verbessert Gesundheit"], business:["Geschaft braucht Strategie"], default:["Beispieltext fur Design"]},
  AR:{words:["الصحة","الأعمال","اليوغا"], health:["الحياة الصحية تحتاج رياضة","اليوغا تحسن الصحة"], business:["الأعمال تحتاج استراتيجية"], default:["نص تجريبي للتصميم"]},
  PT:{words:["saude","negocio","yoga"], health:["Vida saudavel precisa exercicio","Yoga melhora saude"], business:["Negocio precisa estrategia"], default:["Texto exemplo para design"]},
  RU:{words:["здоровье","бизнес","йога"], health:["Здоровый образ жизни важен","Йога улучшает здоровье"], business:["Бизнес требует стратегии"], default:["Пример текста для дизайна"]},
  JA:{words:["健康","ビジネス","ヨガ"], health:["健康的な生活には運動が必要","ヨガは健康を改善します"], business:["ビジネスには戦略が必要"], default:["デザイン用サンプルテキスト"]},
  IT:{words:["salute","affari","yoga"], health:["La vita sana ha bisogno di esercizio","Lo yoga migliora la salute"], business:["L'azienda ha bisogno di strategia"], default:["Testo di esempio per design"]},
  BN:{words:["স্বাস্থ্য","ব্যবসা","যোগা"], health:["সুস্থ জীবনের জন্য ব্যায়াম দরকার","যোগব্যায়াম স্বাস্থ্য ভালো করে"], business:["ব্যবসার জন্য কৌশল দরকার"], default:["ডিজাইনের জন্য নমুনা পাঠ্য"]},
  UR:{words:["صحت","کاروبار","یوگا"], health:["صحت مند زندگی کے لیے ورزش ضروری ہے","یوگا صحت بہتر بناتا ہے"], business:["کاروبار کے لیے حکمت عملی چاہیے"], default:["ڈیزائن کے لیے نمونہ متن"]},
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
    if(t.includes("health")||t.includes("स्वास्थ्य")||t.includes("yoga")||t.includes("योग")) return d.health;
    if(t.includes("business")||t.includes("व्यापार")||t.includes("startup")) return d.business;
    return d.default;
  }

  const generateNow=()=>{
    const bank=getBank();
    const words=DB[lang].words;
    let res="";
    if(type==="words"){
      let arr= aiOn? [topic] : [];
      for(let i=arr.length;i<count;i++) arr.push(words[Math.floor(Math.random()*words.length)]);
      res=arr.join(" ");
    } else if(type==="para"){
      let paras=[];
      for(let i=0;i<count;i++){
        let p="";
        for(let j=0;j<3;j++) p+= bank[Math.floor(Math.random()*bank.length)]+". ";
        paras.push(p.trim());
      }
      res=paras.join("\n\n");
    } else if(type==="sent"){
      let arr=[];
      for(let i=0;i<count;i++) arr.push(bank[Math.floor(Math.random()*bank.length)]+".");
      res=arr.join(" ");
    } else {
      let arr=[];
      for(let i=0;i<count;i++) arr.push(`${i+1}. ${bank[Math.floor(Math.random()*bank.length)]}.`);
      res=arr.join("\n");
    }
    setOut(res);
  }

  useEffect(()=>{ generateNow(); },[lang, type, count, topic, aiOn]);

  return(
    <div style={{minHeight:"100vh", background:"linear-gradient(135deg,#667eea 0%,#764ba2 50%,#f093fb 100%)", padding:"10px"}}>
      <div style={{maxWidth:"1100px", margin:"0 auto"}}>
        <div style={{background:"white", borderRadius:"20px", height:"62px", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 12px"}}>
          <b> LoremGen PRO</b>
          <div style={{display:"flex", gap:"4px"}}>
            {["home","about","privacy","disclaimer","contact"].map(p=>(
              <button key={p} onClick={()=>setPage(p)} style={{background:page===p?"#111":"#eee", color:page===p?"white":"#333", border:"none", padding:"6px 10px", borderRadius:"20px", fontSize:"11px", fontWeight:900, cursor:"pointer"}}>{p.toUpperCase()}</button>
            ))}
          </div>
        </div>

        {page==="home"?(
          <div style={{display:"grid", gap:"12px", marginTop:"12px"}} className="g"><style>{`@media(min-width:900px){.g{grid-template-columns:400px 1fr}}`}</style>
            <div style={{background:"white", borderRadius:"24px", padding:"14px"}}>
              <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px"}}>
                {["para","words","sent","list"].map(k=>(
                  <button key={k} onClick={()=>setType(k)} style={{height:"58px", borderRadius:"14px", border:type===k?"3px solid #111":"2px solid #eee", background:type===k?"#111":"white", color:type===k?"white":"#111", fontWeight:900, cursor:"pointer"}}>{k.toUpperCase()}</button>
                ))}
              </div>
              <div style={{marginTop:"12px", background:"#f3f0ff", border:"2px solid #8b5cf6", borderRadius:"14px", padding:"10px"}}>
                <div style={{display:"flex", justifyContent:"space-between"}}><b style={{fontSize:"12px"}}>🤖 AI TOPIC = {aiOn?"ON":"OFF"}</b><button onClick={()=>setAiOn(!aiOn)} style={{background:aiOn?"#7c3aed":"#aaa", color:"white", border:"none", padding:"4px 10px", borderRadius:"20px", fontWeight:900, cursor:"pointer"}}>{aiOn?"ON":"OFF"}</button></div>
                <input value={topic} onChange={e=>setTopic(e.target.value)} style={{width:"100%", height:"44px", marginTop:"8px", borderRadius:"10px", border:"2px solid #7c3aed", padding:"0 10px", fontWeight:700}} placeholder="Health / Business" />
                <div style={{fontSize:"10px", marginTop:"4px"}}>Health likho + HI select = Hindi Health text ayega</div>
              </div>
              <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"8px", marginTop:"12px"}}>
                {Object.keys(DB).map(k=>(
                  <button key={k} onClick={()=>setLang(k)} style={{height:"66px", borderRadius:"16px", border:lang===k?"3px solid #111":"none", background:`linear-gradient(135deg,${COLORS[k][0]},${COLORS[k][1]})`, color:"white", fontWeight:900, cursor:"pointer"}}><div style={{fontSize:"20px"}}>{FLAGS[k]}</div>{k}</button>
                ))}
              </div>
              <div style={{marginTop:"12px"}}><input type="range" min={1} max={type==="words"?50:8} value={count} onChange={e=>setCount(Number(e.target.value))} style={{width:"100%"}} /><div style={{fontSize:"12px", fontWeight:800, textAlign:"center"}}>COUNT: {count}</div></div>
              <button onClick={generateNow} style={{width:"100%", height:"54px", marginTop:"10px", borderRadius:"14px", border:"none", background:"#111", color:"white", fontWeight:900, cursor:"pointer"}}>GENERATE ({lang})</button>
            </div>
            <div style={{background:"white", borderRadius:"24px", display:"flex", flexDirection:"column", overflow:"hidden"}}>
              <div style={{padding:"10px 14px", background:"#f9fafb", borderBottom:"1px solid #eee", display:"flex", justifyContent:"space-between"}}><span style={{fontSize:"11px", fontWeight:700}}>{lang} • {out.split(" ").length} WORDS</span><button onClick={()=>navigator.clipboard.writeText(out)} style={{background:"#111", color:"white", border:"none", padding:"6px 12px", borderRadius:"20px", fontWeight:800, cursor:"pointer"}}>COPY</button></div>
              <textarea value={out} onChange={e=>setOut(e.target.value)} style={{flex:1, minHeight:"480px", border:"none", padding:"14px", fontSize:"16px", lineHeight:"28px", outline:"none"}} />
            </div>
          </div>
        ):(
          <div style={{background:"white", borderRadius:"24px", padding:"20px", marginTop:"12px"}}>
            {page==="about"&&<><h2>About</h2><p>Made in Misrikh, UP. 12 languages, AI topic mode, AdSense ready.</p></>}
            {page==="privacy"&&<><h2>Privacy Policy</h2><p>No data collection. All in browser. AdSense may use cookies.</p></>}
            {page==="disclaimer"&&<><h2>Disclaimer</h2><p>Dummy text only, not real advice.</p></>}
            {page==="contact"&&<><h2>Contact</h2><p>support@loremgen.pro, Misrikh UP</p></>}
            <button onClick={()=>setPage("home")} style={{marginTop:"12px", background:"#111", color:"white", border:"none", padding:"10px 16px", borderRadius:"10px", fontWeight:900, cursor:"pointer"}}>← Back</button>
          </div>
        )}
      </div>
    </div>
  )
}
