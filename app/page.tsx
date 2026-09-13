
"use client";
import { useState, useEffect } from "react";

const FLAGS:any={EN:"🇺🇸",HI:"🇮🇳",ES:"🇪🇸",FR:"🇫🇷",DE:"🇩🇪",AR:"🇸🇦",PT:"🇵🇹",RU:"🇷🇺",JA:"🇯🇵",IT:"🇮🇹",BN:"🇧🇩",UR:"🇵🇰"}
const COLORS:any={EN:["#3b82f6","#60a5fa"],HI:["#f97316","#fb923c"],ES:["#ef4444","#f87171"],FR:["#8b5cf6","#a78bfa"],DE:["#1f2937","#6b7280"],AR:["#059669","#10b981"],PT:["#0891b2","#22d3ee"],RU:["#2563eb","#60a5fa"],JA:["#db2777","#f472b6"],IT:["#16a34a","#4ade80"],BN:["#dc2626","#fb7185"],UR:["#15803d","#22c55e"]}

const DB:any={
  EN:{words:["lorem","ipsum","health","business","politics","social","sports","education","tech","food","travel"], health:["Healthy life needs daily exercise and yoga"], business:["Business growth needs smart planning"], political:["Democracy is important for every citizen","Elections decide the future"], social:["Society grows when people help each other"], sports:["Cricket is loved by millions","Sports teaches teamwork"], education:["Education is the key to success"], tech:["AI is changing the world"], food:["Healthy food keeps you active"], travel:["Travel opens mind"], default:["Lorem ipsum dolor sit amet consectetur"]},
  HI:{words:["स्वास्थ्य","व्यापार","राजनीति","समाज","खेल","शिक्षा","तकनीक"], health:["स्वस्थ जीवन के लिए रोज व्यायाम जरूरी है"], business:["व्यापार बढ़ाने के लिए अच्छी योजना चाहिए"], political:["लोकतंत्र में हर नागरिक का वोट महत्वपूर्ण है","चुनाव देश का भविष्य तय करते हैं"], social:["समाज तभी आगे बढ़ता है जब लोग मदद करें"], sports:["क्रिकेट भारत में सबसे लोकप्रिय खेल है","रोज खेलने से शरीर फिट रहता है"], education:["शिक्षा सफलता की कुंजी है"], tech:["AI दुनिया बदल रहा है"], food:["स्वस्थ भोजन से ऊर्जा रहती है"], travel:["यात्रा से अनुभव बढ़ता है"], default:["यह डिज़ाइन के लिए नमूना पाठ है"]},
  ES:{words:["salud","negocio","politica"], health:["La vida saludable necesita ejercicio"], business:["El negocio necesita estrategia"], political:["La democracia es importante"], social:["La sociedad crece junta"], sports:["El futbol une naciones"], education:["La educacion es clave"], tech:["La tecnologia cambia el mundo"], food:["La comida saludable"], travel:["Viajar abre la mente"], default:["Texto de ejemplo"]},
  FR:{words:["sante","entreprise","politique"], health:["La vie saine necessite exercice"], business:["L'entreprise a besoin de strategie"], political:["La democratie est importante"], social:["La societe grandit ensemble"], sports:["Le sport garde en forme"], education:["L'education est la cle"], tech:["La technologie change le monde"], food:["La nourriture saine"], travel:["Voyager ouvre l'esprit"], default:["Exemple de texte"]},
  DE:{words:["gesundheit","geschaft","politik"], health:["Gesundes Leben braucht Bewegung"], business:["Geschaft braucht Strategie"], political:["Demokratie ist wichtig"], social:["Gesellschaft wachst zusammen"], sports:["Sport halt fit"], education:["Bildung ist Schlussel"], tech:["Technologie verandert Welt"], food:["Gesundes Essen"], travel:["Reisen offnet Geist"], default:["Beispieltext"]},
  AR:{words:["الصحة","الأعمال","سياسة"], health:["الحياة الصحية تحتاج رياضة"], business:["الأعمال تحتاج استراتيجية"], political:["الديمقراطية مهمة"], social:["المجتمع ينمو بالتعاون"], sports:["الرياضة تحافظ على اللياقة"], education:["التعليم مفتاح النجاح"], tech:["التكنولوجيا تغير العالم"], food:["الطعام الصحي"], travel:["السفر يفتح العقل"], default:["نص تجريبي"]},
  PT:{words:["saude","negocio","politica"], health:["Vida saudavel precisa exercicio"], business:["Negocio precisa estrategia"], political:["Democracia e importante"], social:["Sociedade cresce junta"], sports:["Esporte mantem forma"], education:["Educacao e chave"], tech:["Tecnologia muda mundo"], food:["Comida saudavel"], travel:["Viajar abre mente"], default:["Texto exemplo"]},
  RU:{words:["здоровье","бизнес","политика"], health:["Здоровый образ жизни важен"], business:["Бизнес требует стратегии"], political:["Демократия важна"], social:["Общество растет вместе"], sports:["Спорт держит в форме"], education:["Образование ключ"], tech:["Технологии меняют мир"], food:["Здоровая еда"], travel:["Путешествия открывают разум"], default:["Пример текста"]},
  JA:{words:["健康","ビジネス","政治"], health:["健康的な生活には運動が必要"], business:["ビジネスには戦略が必要"], political:["民主主義は重要"], social:["社会は協力で成長"], sports:["スポーツは体を健康に保つ"], education:["教育は成功の鍵"], tech:["テクノロジーは世界を変える"], food:["健康的な食べ物"], travel:["旅行は心を開く"], default:["サンプルテキスト"]},
  IT:{words:["salute","affari","politica"], health:["La vita sana ha bisogno di esercizio"], business:["La crescita ha bisogno di strategia"], political:["La democrazia e importante"], social:["La societa cresce insieme"], sports:["Lo sport mantiene in forma"], education:["L'educazione e chiave"], tech:["La tecnologia cambia il mondo"], food:["Il cibo sano"], travel:["Viaggiare apre la mente"], default:["Testo di esempio"]},
  BN:{words:["স্বাস্থ্য","ব্যবসা","রাজনীতি"], health:["সুস্থ জীবনের জন্য ব্যায়াম দরকার"], business:["ব্যবসার জন্য কৌশল দরকার"], political:["গণতন্ত্র গুরুত্বপূর্ণ"], social:["সমাজ একসাথে বাড়ে"], sports:["খেলা শরীর ফিট রাখে"], education:["শিক্ষা সাফল্যের চাবি"], tech:["প্রযুক্তি বিশ্ব বদলাচ্ছে"], food:["স্বাস্থ্যকর খাবার"], travel:["ভ্রমণ মন খোলে"], default:["নমুনা পাঠ্য"]},
  UR:{words:["صحت","کاروبار","سیاست"], health:["صحت مند زندگی کے لیے ورزش ضروری ہے"], business:["کاروبار کے لیے حکمت عملی چاہیے"], political:["جمہوریت اہم ہے"], social:["معاشرہ مل کر بڑھتا ہے"], sports:["کھیل جسم کو فٹ رکھتا ہے"], education:["تعلیم کامیابی کی کنجی ہے"], tech:["ٹیکنالوجی دنیا بدل رہی ہے"], food:["صحت مند کھانا"], travel:["سفر ذہن کھولتا ہے"], default:["ڈیزائن کے لیے نمونہ متن"]},
}

export default function Page(){
  const [page,setPage]=useState("home");
  const [lang,setLang]=useState("HI");
  const [type,setType]=useState("para");
  const [count,setCount]=useState(5);
  const [topic,setTopic]=useState("Sport");
  const [aiOn,setAiOn]=useState(true);
  const [out,setOut]=useState("");
  const [copied,setCopied]=useState(false);

  const getBank=()=>{
    const d=DB[lang]; const t=topic.toLowerCase();
    if(t.includes("politic")||t.includes("राजनीति")||t.includes("चुनाव")) return d.political;
    if(t.includes("social")||t.includes("समाज")) return d.social;
    if(t.includes("sport")||t.includes("cricket")||t.includes("खेल")) return d.sports;
    if(t.includes("educat")||t.includes("शिक्षा")) return d.education;
    if(t.includes("tech")||t.includes("तकनीक")) return d.tech;
    if(t.includes("food")||t.includes("भोजन")) return d.food;
    if(t.includes("travel")||t.includes("यात्रा")) return d.travel;
    if(t.includes("health")||t.includes("स्वास्थ्य")) return d.health;
    if(t.includes("business")||t.includes("व्यापार")) return d.business;
    return d.default;
  }

  const generateNow=()=>{
    const bank=getBank(); const words=DB[lang].words;
    let res=""; if(type==="words"){ let a=aiOn?[topic]:[]; for(let i=a.length;i<count;i++) a.push(words[Math.floor(Math.random()*words.length)]); res=a.join(" "); }
    else if(type==="para"){ let ps=[]; for(let i=0;i<count;i++){ let p=""; for(let j=0;j<3;j++) p+=bank[Math.floor(Math.random()*bank.length)]+". "; ps.push(p.trim());} res=ps.join("\n\n"); }
    else if(type==="sent"){ let a=[]; for(let i=0;i<count;i++) a.push(bank[Math.floor(Math.random()*bank.length)]+"."); res=a.join(" "); }
    else { let a=[]; for(let i=0;i<count;i++) a.push(`${i+1}. ${bank[Math.floor(Math.random()*bank.length)]}.`); res=a.join("\n"); }
    setOut(res);
  }
  useEffect(()=>{generateNow()},[]);
  const doCopy=()=>{ navigator.clipboard.writeText(out); setCopied(true); setTimeout(()=>setCopied(false),2000); }

  const downloadFile=()=>{
    const isUnicode = ["HI","BN","UR","AR","RU","JA"].includes(lang);
    if(isUnicode){
      const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Lorem ${lang} ${topic}</title><style>body{font-family:system-ui,-apple-system,Noto Sans Devanagari,Mangal,sans-serif;padding:24px;line-height:1.9;font-size:18px;white-space:pre-wrap;color:#111}h1{font-size:14px;color:#666}</style></head><body><h1>Lorem ${lang} - ${topic} - ${count} ${type}</h1>${out.replace(/</g,"&lt;")}</body></html>`;
      const blob = new Blob([html], {type:"text/html;charset=utf-8"});
      const url = URL.createObjectURL(blob);
      const a=document.createElement("a"); a.href=url; a.download=`lorem-${lang}-${topic}.html`; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    } else {
      const bom = new Uint8Array([0xEF,0xBB,0xBF]);
      const data = new TextEncoder().encode(out);
      const combined = new Uint8Array(bom.length+data.length); combined.set(bom,0); combined.set(data,bom.length);
      const blob = new Blob([combined], {type:"text/plain;charset=utf-8"});
      const url = URL.createObjectURL(blob);
      const a=document.createElement("a"); a.href=url; a.download=`lorem-${lang}-${topic}.txt`; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    }
  }

  return(
    <div style={{minHeight:"100vh", background:"linear-gradient(135deg,#667eea 0%,#764ba2 30%,#f093fb 70%,#f5576c 100%)", backgroundAttachment:"fixed"}}>
      <style>{`* {box-sizing:border-box} @keyframes shine{0%{background-position:-200% 0}100%{background-position:200% 0}}.shine-btn{background:linear-gradient(90deg,#111 0%,#333 20%,#f59e0b 50%,#333 80%,#111 100%); background-size:300% 100%; animation:shine 2.5s linear infinite; border:2px solid #f59e0b;}`}</style>
      <header style={{background:"rgba(255,255,255,0.95)", backdropFilter:"blur(12px)", position:"sticky", top:0, zIndex:50}}>
        <div style={{maxWidth:"1150px", margin:"0 auto", padding:"14px", display:"flex", alignItems:"center", gap:"14px"}}>
          <img src="/icon.png" alt="LoremGen PRO Logo" style={{width:"64px", height:"64px", borderRadius:"14px", objectFit:"cover", boxShadow:"0 2px 8px rgba(0,0,0,0.15)"}} />
          <div><div style={{fontWeight:900, fontSize:"21px", color:"#111"}}>LoremGen PRO</div><div style={{fontSize:"12px", color:"#764ba2", fontWeight:800}}>12 LANGUAGES • AI TOPIC GENERATOR</div></div>
        </div>
        <nav style={{background:"#111"}}><div style={{maxWidth:"1150px", margin:"0 auto", padding:"8px 10px", display:"flex", flexWrap:"wrap", gap:"6px"}}>
          {[{id:"home",label:"HOME"},{id:"about",label:"ABOUT"},{id:"privacy",label:"PRIVACY"},{id:"disclaimer",label:"DISCLAIMER"},{id:"contact",label:"CONTACT"},{id:"hire",label:"HIRE ME"}].map(m=>(
            <button key={m.id} onClick={()=>{setPage(m.id); window.scrollTo(0,0)}} style={{background:page===m.id?"white":"#1e293b", color:page===m.id?"#111":"#e2e8f0", border:"none", padding:"10px 16px", borderRadius:"8px", fontSize:"12px", fontWeight:900}}>{m.label}</button>
          ))}
        </div></nav>
      </header>
      <div style={{maxWidth:"1150px", margin:"0 auto", padding:"14px"}}>
        {page==="home"?(
          <div style={{display:"grid", gap:"14px"}} className="g"><style>{`@media(min-width:900px){.g{grid-template-columns:380px 1fr}}`}</style>
            <div style={{background:"rgba(255,255,255,0.95)", borderRadius:"20px", padding:"14px", boxShadow:"0 8px 32px rgba(0,0,0,0.15)"}}>
              <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px"}}>
                {["para","words","sent","list"].map(k=><button key={k} onClick={()=>setType(k)} style={{height:"54px", borderRadius:"12px", border:type===k?"2px solid #111":"1px solid #e2e8f0", background:type===k?"#111":"white", color:type===k?"white":"#111", fontWeight:900}}>{k.toUpperCase()}</button>)}
              </div>
              <div style={{marginTop:"12px", border:"2px solid #8b5cf6", borderRadius:"14px", padding:"12px", background:"#faf5ff"}}>
                <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}><b style={{fontSize:"12px", color:"#111"}}>🤖 AI TOPIC: {aiOn?"ON":"OFF"}</b><button onClick={()=>setAiOn(!aiOn)} style={{background:aiOn?"#7c3aed":"#94a3b8", color:"white", border:"none", padding:"5px 14px", borderRadius:"20px", fontWeight:900, fontSize:"11px"}}>{aiOn?"ON":"OFF"}</button></div>
                <input value={topic} onChange={e=>setTopic(e.target.value)} style={{width:"100%", height:"46px", marginTop:"8px", borderRadius:"10px", border:"2px solid #111", padding:"0 12px", fontWeight:700, color:"#111"}} placeholder="political, cricket, health..." />
              </div>
              <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"8px", marginTop:"12px"}}>
                {Object.keys(DB).map(k=><button key={k} onClick={()=>setLang(k)} style={{height:"64px", borderRadius:"14px", border:lang===k?"3px solid #111":"1px solid #e2e8f0", background:`linear-gradient(135deg,${COLORS[k][0]},${COLORS[k][1]})`, color:"white", fontWeight:900}}><div style={{fontSize:"18px"}}>{FLAGS[k]}</div><div style={{fontSize:"11px"}}>{k}</div></button>)}
              </div>
              <a href="https://loremipsumpro.blogspot.com" target="_blank" className="shine-btn" style={{display:"block", marginTop:"14px", borderRadius:"12px", padding:"14px", textAlign:"center", textDecoration:"none", color:"white", fontWeight:900, fontSize:"12px"}}>✨ 5 More: Gujarati, Marathi, Tamil, Telugu, Bengali →</a>
              <div style={{marginTop:"12px", background:"#f1f5f9", borderRadius:"12px", padding:"12px"}}><div style={{display:"flex", justifyContent:"space-between"}}><b style={{fontSize:"12px", color:"#111"}}>COUNT: {count}</b><b style={{fontSize:"12px", color:"#111"}}>{type.toUpperCase()}</b></div><input type="range" min={1} max={type==="words"?100:10} value={count} onChange={e=>setCount(Number(e.target.value))} style={{width:"100%"}} /></div>
              <button onClick={generateNow} style={{width:"100%", height:"56px", marginTop:"12px", borderRadius:"12px", border:"none", background:"#111", color:"white", fontWeight:900, fontSize:"15px"}}>⚡ GENERATE ({lang})</button>
            </div>
            <div style={{background:"rgba(255,255,255,0.97)", borderRadius:"20px", display:"flex", flexDirection:"column", minHeight:"500px", boxShadow:"0 8px 32px rgba(0,0,0,0.15)"}}>
              <div style={{height:"58px", padding:"0 14px", background:"rgba(248,250,252,0.9)", borderBottom:"1px solid #e2e8f0", display:"flex", justifyContent:"space-between", alignItems:"center", borderTopLeftRadius:"20px", borderTopRightRadius:"20px"}}>
                <span style={{fontSize:"12px", fontWeight:900, color:"#111"}}>{lang} • {topic.toUpperCase()}</span>
                <div style={{display:"flex", gap:"8px"}}>
                  <button onClick={doCopy} style={{background:copied?"#16a34a":"#111", color:"white", border:"none", padding:"8px 18px", borderRadius:"20px", fontWeight:900, fontSize:"12px", minWidth:"90px", transition:"all 0.3s"}}>{copied?"✓ COPIED":"COPY"}</button>
                  <button onClick={downloadFile} style={{background:"white", color:"#111", border:"2px solid #111", padding:"8px 16px", borderRadius:"20px", fontWeight:900, fontSize:"12px"}}>DOWNLOAD</button>
                </div>
              </div>
              <textarea value={out} onChange={e=>setOut(e.target.value)} style={{flex:1, minHeight:"450px", border:"none", padding:"18px", fontSize:"16px", lineHeight:"28px", outline:"none", color:"#111", background:"transparent"}} />
              <div style={{padding:"12px", display:"flex", gap:"8px"}}>
                <button onClick={doCopy} style={{flex:1, height:"48px", borderRadius:"12px", background:copied?"#16a34a":"#111", color:"white", border:"none", fontWeight:900}}>{copied?"✓ COPIED!":"COPY TEXT"}</button>
                <button onClick={downloadFile} style={{flex:1, height:"48px", borderRadius:"12px", background:"white", border:"2px solid #111", fontWeight:900, color:"#111"}}>DOWNLOAD</button>
              </div>
            </div>
          </div>
        ):(
          <div style={{background:"white", borderRadius:"20px", padding:"24px", color:"#111"}}><h2>{page.toUpperCase()}</h2><p>support@loremgen.pro</p><button onClick={()=>setPage("home")} style={{marginTop:"12px", background:"#111", color:"white", border:"none", padding:"10px 18px", borderRadius:"8px", fontWeight:900}}>← BACK</button></div>
        )}
      </div>
    </div>
  )
}
