"use client";
import { useState } from "react";

const DB:any = {
  EN: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
  HI: "यह एक नमूना पाठ है जो डिज़ाइन में उपयोग होता है। लोरेम इप्सम डोलर सिट अमेट कंसेक्टेटर।",
  ES: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.",
  FR: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia odio vitae vestibulum.",
  DE: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Er hörte leise Schritte hinter sich.",
  AR: "لوريم إيبسوم هو نص شكلي يستخدم في الطباعة. هذا النص هو مثال لنص يمكن استبداله.",
  PT: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia odio vitae vestibulum.",
  RU: "Лорем ипсум долор сит амет, consectetur adipiscing элит. Сед до эиусмод темпор инцидидунт.",
  JA: "ロレム・イプサムは組版やデザインのサンプルテキストです。印刷業界で使われています。",
  IT: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.",
  BN: "লোরেম ইপসাম ডলর সিট আমেট, কনসেক্টেটর অ্যাডিপিসিং এলিট। এটি একটি নমুনা পাঠ্য।",
  UR: "لوریم اپسم ڈالر سٹ امیٹ، کونسیکٹیٹر ایڈیپیسنگ ایلیٹ۔ یہ ایک نمونہ متن ہے جو ڈیزائن میں استعمال ہوتا ہے۔",
}

const FLAGS:any = {EN:"🇺🇸", HI:"🇮🇳", ES:"🇪🇸", FR:"🇫🇷", DE:"🇩🇪", AR:"🇸🇦", PT:"🇵🇹", RU:"🇷🇺", JA:"🇯🇵", IT:"🇮🇹", BN:"🇧🇩", UR:"🇵🇰"}

export default function Page(){
  const [lang,setLang]=useState("EN");
  const [para,setPara]=useState(3);
  const [words,setWords]=useState(50);
  const [type,setType]=useState("para");
  const [out,setOut]=useState(Array(3).fill(DB.EN).join("\n\n"));
  const [copied,setCopied]=useState(false);

  const generate=()=>{
    const base = DB[lang];
    let txt="";
    if(type==="para") txt = Array(para).fill(base).join("\n\n");
    if(type==="words") txt = base.split(" ").slice(0,words).join(" ")+" "+base.split(" ").slice(0,words).join(" ");
    if(type==="list") txt = Array(para).fill(0).map((_,i)=> `${i+1}. ${base}`).join("\n");
    if(type==="bytes") txt = base.repeat(5).substring(0,words*6);
    setOut(txt);
  }

  const copy=()=>{navigator.clipboard.writeText(out); setCopied(true); setTimeout(()=>setCopied(false),1500)};

  return(
    <div style={{minHeight:"100vh", background:"#08080a", color:"white", fontFamily:"system-ui", padding:"12px"}}>
      <div style={{maxWidth:"1100px", margin:"0 auto"}}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"20px", padding:"0 16px", height:"60px"}}>
          <b>LoremGen <span style={{opacity:0.4}}>PRO</span> <span style={{background:"white", color:"black", fontSize:"9px", padding:"3px 8px", borderRadius:"20px", marginLeft:"6px"}}>12 LANG • ULTRA</span></b>
          <div style={{width:"8px", height:"8px", borderRadius:"50%", background:"#22c55e", boxShadow:"0 0 10px #22c55e"}} />
        </div>

        <div style={{display:"grid", gap:"16px", marginTop:"16px"}} className="grid2">
          <style>{`@media(min-width:850px){.grid2{grid-template-columns:380px 1fr}}.lang-grid{display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px}`}</style>

          <div style={{background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"24px", padding:"18px", height:"fit-content"}}>
            <div style={{fontSize:"10px", letterSpacing:"2px", opacity:0.3, fontWeight:900}}>TYPE</div>
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px", marginTop:"10px"}}>
              {["para","words","list","bytes"].map(t=>(
                <button key={t} onClick={()=>setType(t)} style={{height:"42px", borderRadius:"12px", border:"1px solid rgba(255,255,255,0.1)", background: type===t?"white":"rgba(255,255,255,0.06)", color: type===t?"black":"#aaa", fontWeight:900, cursor:"pointer", fontSize:"12px", textTransform:"uppercase"}}>{t}</button>
              ))}
            </div>

            <div style={{fontSize:"10px", letterSpacing:"2px", opacity:0.3, fontWeight:900, marginTop:"18px"}}>12 LANGUAGES • {lang}</div>
            <div className="lang-grid" style={{marginTop:"10px"}}>
              {Object.keys(DB).map(k=>(
                <button key={k} onClick={()=>{setLang(k); setOut(Array(para).fill(DB[k]).join("\n\n"))}} style={{height:"48px", borderRadius:"12px", border:"1px solid rgba(255,255,255,0.1)", background: lang===k?"white":"rgba(255,255,255,0.06)", color: lang===k?"black":"white", fontWeight:900, cursor:"pointer", fontSize:"12px"}}>{FLAGS[k]} {k}</button>
              ))}
            </div>

            <div style={{fontSize:"10px", letterSpacing:"2px", opacity:0.3, fontWeight:900, marginTop:"18px"}}>{type==="para"||type==="list"? `PARA • ${para}` : `WORDS • ${words}`}</div>
            <input type="range" min={1} max={type==="para"||type==="list"?12:200} value={type==="para"||type==="list"?para:words} onChange={e=> type==="para"||type==="list"?setPara(Number(e.target.value)):setWords(Number(e.target.value))} style={{width:"100%", marginTop:"10px", accentColor:"#7c3aed"}} />

            <button onClick={generate} style={{width:"100%", marginTop:"18px", height:"52px", borderRadius:"16px", border:"none", background:"linear-gradient(90deg,#7c3aed,#ec4899)", color:"white", fontWeight:900, cursor:"pointer"}}>✨ GENERATE</button>
          </div>

          <div style={{background:"#101010", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"24px", overflow:"hidden", display:"flex", flexDirection:"column"}}>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", padding:"0 16px", height:"52px", borderBottom:"1px solid rgba(255,255,255,0.08)"}}>
              <span style={{fontSize:"10px", opacity:0.4}}>{out.split(" ").length} WORDS • {out.length} CHARS</span>
              <button onClick={copy} style={{padding:"6px 14px", borderRadius:"20px", border:"none", background:"white", color:"black", fontWeight:900, fontSize:"11px", cursor:"pointer"}}>{copied?"Copied ✓":"Copy"}</button>
            </div>
            <textarea value={out} onChange={e=>setOut(e.target.value)} style={{flex:1, minHeight:"420px", background:"transparent", border:"none", padding:"16px", color:"rgba(255,255,255,0.7)", fontSize:"14px", lineHeight:"26px", outline:"none", resize:"none"}} />
          </div>
        </div>
      </div>
    </div>
  )
}
