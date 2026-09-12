"use client";
import { useState, useEffect } from "react";

const FLAGS:any = {EN:"🇺🇸", HI:"🇮🇳", ES:"🇪🇸", FR:"🇫🇷", DE:"🇩🇪", AR:"🇸🇦", PT:"🇵🇹", RU:"🇷🇺", JA:"🇯🇵", IT:"🇮🇹", BN:"🇧🇩", UR:"🇵🇰"}
const COLORS:any = {EN:["#3b82f6","#60a5fa"], HI:["#f97316","#fb923c"], ES:["#ef4444","#f87171"], FR:["#8b5cf6","#a78bfa"], DE:["#1f2937","#6b7280"], AR:["#059669","#10b981"], PT:["#0891b2","#22d3ee"], RU:["#2563eb","#60a5fa"], JA:["#db2777","#f472b6"], IT:["#16a34a","#4ade80"], BN:["#dc2626","#fb7185"], UR:["#15803d","#22c55e"]}

const TOPIC_BANK:any = {
  health: ["Healthy lifestyle is important for long life", "Yoga and exercise keep body fit", "Eat green vegetables and fruits daily", "Meditation improves mental health", "Drink 8 glasses of water every day"],
  business: ["Business growth needs smart strategy", "Marketing is key to success", "Startup funding is important for scaling", "Customer satisfaction is our priority", "Innovation drives business forward"],
  tech: ["Technology is changing the world fast", "AI and machine learning are future", "Coding is the new literacy", "Cloud computing makes work easy", "Data is the new oil"],
  food: ["Delicious food brings happiness", "Indian spices are famous worldwide", "Healthy food keeps you active", "Cooking is an art of love", "Street food has its own taste"],
  default: ["This is a sample text for design purpose", "It helps designers to check layout", "Use it anywhere you need dummy text", "It looks like real readable English", "Perfect for mockups and wireframes"]
}

const LANG_WORDS:any = {
  EN: "lorem ipsum dolor sit amet consectetur adipiscing elit ".split(" "),
  HI: "यह एक नमूना पाठ है जो डिज़ाइन में उपयोग होता है ".split(" "),
  ES: "lorem ipsum dolor sit amet ".split(" "),
  FR: "lorem ipsum dolor sit amet ".split(" "),
  DE: "lorem ipsum dolor sit amet ".split(" "),
  AR: "لوريم إيبسوم نص شكلي ".split(" "),
  PT: "lorem ipsum dolor sit amet ".split(" "),
  RU: "лорем ипсум долор сит амет ".split(" "),
  JA: "ロレム イプサム サンプル ".split(" "),
  IT: "lorem ipsum dolor sit amet ".split(" "),
  BN: "লোরেম ইপসাম ডলর সিট ".split(" "),
  UR: "لوریم اپسم ڈالر سٹ ".split(" "),
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
    const topicKey = topic.toLowerCase();
    let bank = TOPIC_BANK.default;
    if(topicKey.includes("health") || topicKey.includes("yoga")) bank = TOPIC_BANK.health;
    else if(topicKey.includes("business") || topicKey.includes("startup")) bank = TOPIC_BANK.business;
    else if(topicKey.includes("tech") || topicKey.includes("ai") || topicKey.includes("code")) bank = TOPIC_BANK.tech;
    else if(topicKey.includes("food") || topicKey.includes("cook")) bank = TOPIC_BANK.food;

    let result="";
    const baseWords = LANG_WORDS[lang];

    if(type==="words"){
      let arr=[];
      if(aiOn && topic) arr.push(topic);
      for(let i=arr.length;i<count;i++) arr.push(baseWords[Math.floor(Math.random()*baseWords.length)]);
      result = arr.join(" ");
    } else if(type==="para"){
      let paras=[];
      for(let p=0;p<count;p++){
        let para = aiOn? bank[Math.floor(Math.random()*bank.length)] + ". " : "";
        para += Array(2).fill(0).map(()=> baseWords.slice(0,8).join(" ")+".").join(" ");
        paras.push(para);
      }
      result = paras.join("\n\n");
    } else if(type==="sent"){
      let sents=[];
      for(let i=0;i<count;i++){
        if(aiOn) sents.push(bank[Math.floor(Math.random()*bank.length)]+".");
        else sents.push(baseWords.slice(0,10).join(" ")+".");
      }
      result = sents.join(" ");
    } else {
      let list=[];
      for(let i=0;i<count;i++){
        const txt = aiOn? bank[Math.floor(Math.random()*bank.length)] : baseWords.slice(0,8).join(" ");
        list.push(`${i+1}. ${txt}.`);
      }
      result = list.join("\n");
    }
    setOut(result);
  }

  useEffect(()=>{ generate(); },[]);

  return(
    <div style={{minHeight:"100vh", background:"linear-gradient(135deg,#667eea 0%,#764ba2 25%,#f093fb 50%,#f5576c 75%,#4facfe 100%)", padding:"10px"}}>
      <div style={{maxWidth:"1150px", margin:"0 auto"}}>
        {/* HEADER */}
        <div style={{background:"white", borderRadius:"22px", padding:"0 14px", height:"68px", display:"flex", justifyContent:"space-between", alignItems:"center", boxShadow:"0 10px 30px rgba(0,0,0,0.15)"}}>
          <b style={{fontSize:"22px"}}>LoremGen<span style={{color:"#7c3aed"}}> PRO</span></b>
          <div style={{display:"flex", gap:"6px", overflowX:"auto"}}>
            {["home","about","privacy","disclaimer","contact"].map(p=>(
              <button key={p} onClick={()=>setPage(p)} style={{border:"none", background: page===p?"#111":"#f3f4f6", color: page===p?"white":"#555", padding:"7px 12px", borderRadius:"20px", fontWeight:800, fontSize:"12px", cursor:"pointer", textTransform:"capitalize"}}>{p}</button>
            ))}
          </div>
        </div>

        {page==="home"? (
        <div style={{display:"grid", gap:"14px", marginTop:"14px"}} className="grid"><style>{`@media(min-width:900px){.grid{grid-template-columns:420px 1fr}}`}</style>
          <div style={{background:"white", borderRadius:"28px", padding:"18px", boxShadow:"0 20px 40px rgba(0,0,0,0.15)"}}>
            <div style={{fontSize:"11px", fontWeight:900, opacity:0.4, letterSpacing:"2px"}}>TYPE • BADA BOLD BUTTON</div>
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", marginTop:"12px"}}>
              {[{k:"para",l:"PARAGRAPH"},{k:"words",l:"WORDS"},{k:"sent",l:"SENTENCES"},{k:"list",l:"LIST"}].map(b=>(
                <button key={b.k} onClick={()=>setType(b.k)} style={{height:"66px", borderRadius:"18px", border: type===b.k?"3px solid #111":"2px solid #eee", background: type===b.k?"#111":"white", color: type===b.k?"white":"#111", fontWeight:900, fontSize:"15px", cursor:"pointer"}}>{b.l}</button>
              ))}
            </div>

            {/* AI EXPLAINED */}
            <div style={{marginTop:"18px", background:"linear-gradient(135deg,#ede9fe,#fce7f3)", border:"2px solid #c4b5fd", borderRadius:"20px", padding:"14px"}}>
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}><span style={{fontWeight:900, fontSize:"13px"}}>🤖 AI TOPIC MODE</span><button onClick={()=>setAiOn(!aiOn)} style={{background: aiOn?"#7c3aed":"#9ca3af", color:"white", border:"none", padding:"6px 14px", borderRadius:"20px", fontWeight:900, fontSize:"12px", cursor:"pointer"}}>{aiOn?"ON":"OFF"}</button></div>
              <input value={topic} onChange={e=>setTopic(e.target.value)} placeholder="Ex: Health, Business, Tech, Food" style={{width:"100%", marginTop:"10px", height:"50px", borderRadius:"14px", border:"2px solid #a78bfa", padding:"0 14px", fontSize:"16px", fontWeight:700}} />
              <div style={{background:"white", borderRadius:"10px", padding:"8px", marginTop:"8px", fontSize:"11px", lineHeight:"15px"}}><b>Kaise kaam karta hai?</b><br/>👉 ON + "Health" likho = Health wale sentences ayenge<br/>👉 "Business" likho = Business wale<br/>👉 OFF karo = Normal lorem ayega</div>
            </div>

            <div style={{fontSize:"11px", fontWeight:900, opacity:0.4, letterSpacing:"2px", marginTop:"20px"}}>12 COUNTRY • COLORFUL</div>
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"10px", marginTop:"10px"}}>
              {Object.keys(LANG_WORDS).map(k=>(
                <button key={k} onClick={()=>setLang(k)} style={{height:"72px", borderRadius:"20px", border: lang===k?"3px solid #111":"none", background:`linear-gradient(135deg,${COLORS[k][0]},${COLORS[k][1]})`, color:"white", fontWeight:900, boxShadow: lang===k?"0 0 0 3px #fff, 0 0 0 6px #111":"0 6px 16px rgba(0,0,0,0.15)", cursor:"pointer"}}><div style={{fontSize:"22px"}}>{FLAGS[k]}</div><div style={{fontSize:"14px"}}>{k}</div></button>
              ))}
            </div>

            <div style={{background:"#f9fafb", borderRadius:"16px", padding:"14px", marginTop:"18px", border:"1px solid #eee"}}>
              <div style={{display:"flex", justifyContent:"space-between", fontWeight:900, fontSize:"12px"}}><span style={{opacity:0.5}}>{type.toUpperCase()} COUNT</span><span style={{background:"#111", color:"white", padding:"4px 12px", borderRadius:"20px"}}>{count}</span></div>
              <input type="range" min={1} max={type==="words"?200:12} value={count} onChange={e=>setCount(Number(e.target.value))} style={{width:"100%", marginTop:"12px"}} />
            </div>
            <button onClick={generate} style={{width:"100%", marginTop:"14px", height:"66px", borderRadius:"18px", border:"none", background:"linear-gradient(90deg,#7c3aed,#ec4899)", color:"white", fontWeight:900, fontSize:"18px", cursor:"pointer", boxShadow:"0 10px 20px rgba(124,58,237,0.3)"}}>✨ GENERATE {topic.toUpperCase()}</button>
          </div>

          <div style={{background:"white", borderRadius:"28px", overflow:"hidden", boxShadow:"0 20px 40px rgba(0,0,0,0.15)", display:"flex", flexDirection:"column"}}>
            <div style={{height:"58px", padding:"0 16px", display:"flex", justifyContent:"space-between", alignItems:"center", borderBottom:"1px solid #eee", background:"#f9fafb"}}><span style={{fontSize:"11px", fontWeight:800, opacity:0.5}}>{out.split(/\s+/).filter(Boolean).length} WORDS • {lang}</span><button onClick={()=>navigator.clipboard.writeText(out)} style={{background:"#111", color:"white", border:"none", padding:"8px 16px", borderRadius:"20px", fontWeight:900, cursor:"pointer"}}>COPY</button></div>
            <textarea value={out} onChange={e=>setOut(e.target.value)} style={{flex:1, minHeight:"560px", border:"none", padding:"18px", fontSize:"16px", lineHeight:"30px", outline:"none"}} />
            <div style={{padding:"12px", display:"flex", gap:"10px", borderTop:"1px solid #eee", background:"#f9fafb"}}><button onClick={()=>navigator.clipboard.writeText(out)} style={{flex:1, height:"50px", borderRadius:"14px", background:"#111", color:"white", fontWeight:900, border:"none", cursor:"pointer"}}>Copy Text</button><button onClick={()=>{const b=new Blob(["\uFEFF"+out],{type:"text/plain;charset=utf-8"}); const u=URL.createObjectURL(b); const a=document.createElement("a"); a.href=u; a.download=`lorem-${lang}.txt`; a.click();}} style={{flex:1, height:"50px", borderRadius:"14px", background:"white", border:"2px solid #111", fontWeight:900, cursor:"pointer"}}>Download</button></div>
          </div>
        </div>
        ) : (
          <div style={{background:"white", borderRadius:"28px", padding:"28px", marginTop:"16px", boxShadow:"0 20px 40px rgba(0,0,0,0.15)", lineHeight:"28px"}}>
            {page==="about" && <><h1>About LoremGen PRO</h1><p>We are from Misrikh, UP, India. Built for designers, bloggers, developers. 12 languages, AI topic mode, free forever. This tool is AdSense friendly and 100% browser based - no data collection.</p></>}
            {page==="privacy" && <><h1>Privacy Policy</h1><p><b>Effective Date: 2026</b><br/>We don't collect personal info. All generation happens in your browser. Google AdSense may use cookies to show ads. You can disable cookies in browser settings. No tracking, no login required.</p></>}
            {page==="disclaimer" && <><h1>Disclaimer</h1><p>All texts are dummy placeholder only. AI topic mode generates sample sentences around your keyword, not factual info. Don't use for medical/legal advice. Use at your own risk.</p></>}
            {page==="contact" && <><h1>Contact Us</h1><p>Email: support@loremgen.pro<br/>Location: Misrikh, Sitapur, UP - 261001, India<br/>We reply in 24 hours. For AdSense or business query, mail us.</p></>}
            <button onClick={()=>setPage("home")} style={{marginTop:"20px", background:"#111", color:"white", border:"none", padding:"12px 20px", borderRadius:"12px", fontWeight:900, cursor:"pointer"}}>← Back to Tool</button>
          </div>
        )}

        <div style={{textAlign:"center", color:"white", fontSize:"12px", padding:"18px", fontWeight:700, textShadow:"0 1px 3px rgba(0,0,0,0.3)"}}>© 2026 LoremGen PRO • AdSense Ready • 12 Languages • AI Powered • Made in India 🇮🇳</div>
      </div>
    </div>
  )
}
