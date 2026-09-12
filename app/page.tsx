"use client";
import { useState } from "react";

const DB:any = {
  EN: ["Lorem ipsum dolor sit amet, consectetur adipiscing elit.","Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","Ut enim ad minim veniam, quis nostrud exercitation.","Duis aute irure dolor in reprehenderit in voluptate velit esse.","Excepteur sint occaecat cupidatat non proident."],
  HI: ["यह एक नमूना पाठ है जो डिज़ाइन में उपयोग होता है।","लोरेम इप्सम डोलर सिट अमेट कंसेक्टेटर एडिपिसिंग एलीट।","डिज़ाइनरों के लिए यह सबसे तेज़ और आसान उपकरण है।"],
  ES: ["Lorem ipsum dolor sit amet, consectetur adipiscing elit.","Vivamus lacinia odio vitae vestibulum vestibulum."],
  FR: ["Lorem ipsum dolor sit amet, consectetur adipiscing elit.","Cras mattis consectetur purus sit amet fermentum."],
  DE: ["Lorem ipsum dolor sit amet, consectetur adipiscing elit.","Er hörte leise Schritte hinter sich."],
  AR: ["لوريم إيبسوم هو نص شكلي يستخدم في الطباعة."],
  PT: ["Lorem ipsum dolor sit amet, consectetur adipiscing elit."],
  RU: ["Лорем ипсум долор сит амет, consectetur adipiscing элит."],
  JA: ["ロレム・イプサムはデザインのサンプルテキストです。"],
  IT: ["Lorem ipsum dolor sit amet, consectetur adipiscing elit."],
  BN: ["লোরেম ইপসাম ডলর সিট আমেট, কনসেক্টেটর।"],
  UR: ["لوریم اپسم ڈالر سٹ امیٹ، کونسیکٹیٹر ایڈیپیسنگ۔"],
}
const FLAGS:any = {EN:"🇺🇸", HI:"🇮🇳", ES:"🇪🇸", FR:"🇫🇷", DE:"🇩🇪", AR:"🇸🇦", PT:"🇵🇹", RU:"🇷🇺", JA:"🇯🇵", IT:"🇮🇹", BN:"🇧🇩", UR:"🇵🇰"}

export default function Page(){
  const [lang,setLang]=useState("EN");
  const [para,setPara]=useState(3);
  const [words,setWords]=useState(50);
  const [type,setType]=useState("para");
  const [out,setOut]=useState(DB.EN.slice(0,3).join("\n\n"));
  const [copied,setCopied]=useState(false);
  const [anim,setAnim]=useState(false);

  const generate=()=>{
    setAnim(true); setTimeout(()=>setAnim(false),400);
    const baseArr = DB[lang];
    const fullText = baseArr.join(" ");
    let txt="";
    if(type==="para") txt = Array(para).fill(0).map(()=> baseArr[Math.floor(Math.random()*baseArr.length)]).join("\n\n");
    if(type==="words") txt = fullText.split(" ").slice(0,words).join(" ") + ".";
    if(type==="list") txt = Array(para).fill(0).map((_,i)=> `${i+1}. ${baseArr[Math.floor(Math.random()*baseArr.length)]}`).join("\n");
    if(type==="sent") txt = Array(para).fill(0).map(()=> baseArr[Math.floor(Math.random()*baseArr.length)]).join(" ");
    setOut(txt);
  }

  const copy=()=>{navigator.clipboard.writeText(out); setCopied(true); setTimeout(()=>setCopied(false),1500)};

  return(
    <div style={{minHeight:"100vh", background:"#f6f5f2", color:"#111", fontFamily:"system-ui", padding:"12px"}}>
      <style>{`
        @keyframes pop {0%{transform:scale(0.95)} 50%{transform:scale(1.02)} 100%{transform:scale(1)}}
        @keyframes fadeUp {from{opacity:0; transform:translateY(10px)} to{opacity:1; transform:translateY(0)}}
       .btn-active{transform:scale(1.03); box-shadow:0 8px 20px rgba(0,0,0,0.12)!important}
        input[type=range]{height:8px; border-radius:10px}
      `}</style>
      <div style={{maxWidth:"1100px", margin:"0 auto"}}>
        {/* Header */}
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", background:"white", border:"1px solid #e9e6e0", borderRadius:"20px", padding:"0 18px", height:"66px", boxShadow:"0 4px 20px rgba(0,0,0,0.04)"}}>
          <div style={{display:"flex", alignItems:"center", gap:"12px"}}><div style={{width:"40px", height:"40px", borderRadius:"12px", background:"linear-gradient(135deg,#6d28d9,#ec4899)", display:"grid", placeItems:"center", color:"white", fontWeight:900, fontSize:"18px"}}>L</div><b style={{fontSize:"18px"}}>LoremGen <span style={{opacity:0.4}}>PRO</span></b><span style={{background:"#111", color:"white", fontSize:"10px", padding:"5px 12px", borderRadius:"20px"}}>12 LANG • ULTRA</span></div>
          <div style={{width:"10px", height:"10px", borderRadius:"50%", background:"#22c55e"}} />
        </div>

        <div style={{display:"grid", gap:"16px", marginTop:"16px"}}>
          <div style={{display:"grid", gap:"16px"}} className="main-grid">
            <style>{`@media(min-width:900px){.main-grid{grid-template-columns:400px 1fr}}`}</style>

            <div style={{background:"white", border:"1px solid #e9e6e0", borderRadius:"28px", padding:"20px", boxShadow:"0 10px 30px rgba(0,0,0,0.04)", animation:"fadeUp 0.5s ease"}}>
              <div style={{fontSize:"11px", letterSpacing:"2px", opacity:0.4, fontWeight:900}}>TYPE</div>
              <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", marginTop:"12px"}}>
                {[
                  {k:"para", l:"📄 PARA"},
                  {k:"words", l:"🔤 WORDS"},
                  {k:"list", l:"📋 LIST"},
                  {k:"sent", l:"💬 SENTENCE"},
                ].map(t=>(
                  <button key={t.k} onClick={()=>setType(t.k)} style={{height:"58px", borderRadius:"16px", border: type===t.k?"2px solid #111":"1.5px solid #e9e6e0", background: type===t.k?"#111":"white", color: type===t.k?"white":"#333", fontWeight:900, cursor:"pointer", fontSize:"14px", transition:"all 0.2s"}} className={type===t.k?"btn-active":""}>{t.l}</button>
                ))}
              </div>

              <div style={{fontSize:"11px", letterSpacing:"2px", opacity:0.4, fontWeight:900, marginTop:"22px"}}>12 LANGUAGES • {FLAGS[lang]} {lang}</div>
              <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"10px", marginTop:"12px"}}>
                {Object.keys(DB).map(k=>(
                  <button key={k} onClick={()=>setLang(k)} style={{height:"56px", borderRadius:"16px", border: lang===k?"2px solid #6d28d9":"1.5px solid #e9e6e0", background: lang===k?"#f5f0ff":"white", color: lang===k?"#6d28d9":"#111", fontWeight:900, cursor:"pointer", fontSize:"13px", transition:"all 0.2s"}}>{FLAGS[k]} {k}</button>
                ))}
              </div>

              <div style={{background:"#f6f5f2", borderRadius:"16px", padding:"14px", marginTop:"20px"}}>
                <div style={{display:"flex", justifyContent:"space-between", fontSize:"12px", fontWeight:900}}><span style={{opacity:0.5}}>{type==="words"?"WORDS":"PARAGRAPHS"}</span><span style={{background:"#111", color:"white", padding:"2px 10px", borderRadius:"20px"}}>{type==="words"?words:para}</span></div>
                <input type="range" min={1} max={type==="words"?200:12} value={type==="words"?words:para} onChange={e=> type==="words"?setWords(Number(e.target.value)):setPara(Number(e.target.value))} style={{width:"100%", marginTop:"12px"}} />
              </div>

              <button onClick={generate} style={{width:"100%", marginTop:"18px", height:"60px", borderRadius:"18px", border:"none", background:"linear-gradient(90deg,#6d28d9,#ec4899)", color:"white", fontWeight:900, fontSize:"16px", cursor:"pointer", boxShadow:"0 12px 24px rgba(109,40,217,0.3)", letterSpacing:"1px", animation: anim?"pop 0.4s ease":"none"}}>✨ GENERATE MAGIC</button>
            </div>

            <div style={{background:"white", border:"1px solid #e9e6e0", borderRadius:"28px", overflow:"hidden", display:"flex", flexDirection:"column", boxShadow:"0 10px 30px rgba(0,0,0,0.04)", animation: anim?"pop 0.4s ease":"fadeUp 0.6s ease"}}>
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", padding:"0 18px", height:"60px", borderBottom:"1px solid #f0ece6", background:"#fcfbf9"}}>
                <span style={{fontSize:"12px", fontWeight:900, opacity:0.5}}>{out.split(" ").length} WORDS • {out.length} CHARS</span>
                <div style={{display:"flex", gap:"8px"}}>
                  <button onClick={()=>setOut("")} style={{padding:"8px 16px", borderRadius:"20px", border:"1.5px solid #e9e6e0", background:"white", fontWeight:800, fontSize:"12px", cursor:"pointer"}}>Clear</button>
                  <button onClick={copy} style={{padding:"8px 18px", borderRadius:"20px", border:"none", background:"#111", color:"white", fontWeight:900, fontSize:"12px", cursor:"pointer"}}>{copied?"✓ Copied":"Copy"}</button>
                </div>
              </div>
              <textarea value={out} onChange={e=>setOut(e.target.value)} style={{flex:1, minHeight:"460px", background:"white", border:"none", padding:"20px", color:"#333", fontSize:"16px", lineHeight:"30px", outline:"none", resize:"none"}} />
              <div style={{padding:"14px", background:"#fcfbf9", borderTop:"1px solid #f0ece6", display:"flex", gap:"10px"}}>
                <button onClick={copy} style={{flex:1, height:"48px", borderRadius:"14px", border:"none", background:"#111", color:"white", fontWeight:900, cursor:"pointer"}}>Copy Text</button>
                <button onClick={()=>{const blob=new Blob([out],{type:"text/plain"}); const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download=`lorem-${lang}.txt`; a.click();}} style={{flex:1, height:"48px", borderRadius:"14px", border:"1.5px solid #e9e6e0", background:"white", fontWeight:800, cursor:"pointer"}}>Download</button>
              </div>
            </div>
          </div>
        </div>
        <div style={{textAlign:"center", fontSize:"11px", opacity:0.4, marginTop:"24px"}}>White Theme • Bigger Buttons • Fixed WORDS • BYTES Removed → Now SENTENCE</div>
      </div>
    </div>
  )
}
