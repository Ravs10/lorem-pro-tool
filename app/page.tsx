"use client";
import { useState } from "react";

const DB:any = {
  EN: ["Lorem ipsum dolor sit amet, consectetur adipiscing elit.","Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","Ut enim ad minim veniam, quis nostrud exercitation ullamco.","Duis aute irure dolor in reprehenderit in voluptate velit.","Excepteur sint occaecat cupidatat non proident, sunt in culpa."],
  HI: ["यह एक नमूना पाठ है जो डिज़ाइन और टाइपोग्राफी में उपयोग होता है।","लोरेम इप्सम केवल एक डमी टेक्स्ट है जिसे प्रिंटिंग उद्योग में उपयोग किया जाता है।","डिज़ाइनरों के लिए यह सबसे अच्छा उपकरण है जो आपको तुरंत टेक्स्ट प्रदान करता है।"],
  ES: ["Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod.","Vivamus lacinia odio vitae vestibulum vestibulum.","Cras mattis consectetur purus sit amet fermentum."],
  FR: ["Lorem ipsum dolor sit amet, consectetur adipiscing elit.","Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor.","Cras mattis consectetur purus sit amet fermentum."],
  DE: ["Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.","Er hörte leise Schritte hinter sich. Das bedeutete nichts Gutes."],
  AR: ["لوريم إيبسوم هو ببساطة نص شكلي يستخدم في صناعة الطباعة والتنضيد.","هذا النص هو مثال لنص يمكن أن يستبدل في نفس المساحة."]
}

export default function Page(){
  const [lang,setLang]=useState("EN");
  const [para,setPara]=useState(3);
  const [words,setWords]=useState(50);
  const [type,setType]=useState("para");
  const [out,setOut]=useState(DB.EN.slice(0,3).join("\n\n"));
  const [copied,setCopied]=useState(false);

  const generate=()=>{
    let txt="";
    if(type==="para") txt = Array(para).fill(0).map(()=> DB[lang][Math.floor(Math.random()*DB[lang].length)]).join("\n\n");
    if(type==="words") txt = DB[lang].join(" ").split(" ").slice(0,words).join(" ")+".";
    if(type==="list") txt = Array(para).fill(0).map((_,i)=> `${i+1}. ${DB[lang][Math.floor(Math.random()*DB[lang].length)]}`).join("\n");
    if(type==="bytes") txt = DB[lang].join(" ").substring(0,words*5);
    setOut(txt);
  }

  const copy=()=>{navigator.clipboard.writeText(out); setCopied(true); setTimeout(()=>setCopied(false),1500)};

  const sBtn = (active:boolean)=>({height:"46px", borderRadius:"14px", border:"1px solid rgba(255,255,255,0.1)", background: active?"white":"rgba(255,255,255,0.06)", color: active?"black":"#aaa", fontWeight:900, cursor:"pointer", fontSize:"13px"});

  return(
    <div style={{minHeight:"100vh", background:"#08080a", color:"white", fontFamily:"system-ui", padding:"16px"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&display=swap'); *{font-family:'Space Grotesk',system-ui}`}</style>
      <div style={{maxWidth:"1100px", margin:"0 auto"}}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"20px", padding:"0 20px", height:"64px", backdropFilter:"blur(20px)"}}>
          <div style={{display:"flex", alignItems:"center", gap:"12px"}}><div style={{width:"36px", height:"36px", borderRadius:"10px", background:"linear-gradient(135deg,#7c3aed,#ec4899)", display:"grid", placeItems:"center", fontWeight:900}}>L</div><b>LoremGen <span style={{opacity:0.4}}>PRO</span></b><span style={{background:"white", color:"black", fontSize:"9px", padding:"4px 10px", borderRadius:"20px", letterSpacing:"1px"}}>ULTRA v2.5 • PRO MAX</span></div>
          <div style={{width:"10px", height:"10px", borderRadius:"50%", background:"#22c55e", boxShadow:"0 0 12px #22c55e"}} />
        </div>

        <div style={{display:"grid", gridTemplateColumns:"1fr", gap:"20px", marginTop:"20px"}}>
          {typeof window!=="undefined" && window.innerWidth>800 && <style>{`@media(min-width:800px){.grid2{grid-template-columns:380px 1fr!important}}`}</style>}
          <div className="grid2" style={{display:"grid", gridTemplateColumns:"1fr", gap:"20px"}}>
            <div style={{background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"28px", padding:"22px", height:"fit-content"}}>
              <div style={{fontSize:"10px", letterSpacing:"2.5px", opacity:0.3, fontWeight:900}}>GENERATION TYPE</div>
              <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px", marginTop:"12px"}}>
                <button onClick={()=>setType("para")} style={sBtn(type==="para")}>📄 Paragraphs</button>
                <button onClick={()=>setType("words")} style={sBtn(type==="words")}>🔤 Words</button>
                <button onClick={()=>setType("list")} style={sBtn(type==="list")}>📋 List</button>
                <button onClick={()=>setType("bytes")} style={sBtn(type==="bytes")}>💾 Bytes</button>
              </div>

              <div style={{fontSize:"10px", letterSpacing:"2.5px", opacity:0.3, fontWeight:900, marginTop:"22px"}}>LANGUAGE • {lang}</div>
              <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"8px", marginTop:"12px"}}>
                {Object.keys(DB).map(k=>(
                  <button key={k} onClick={()=>{setLang(k);}} style={sBtn(lang===k)}>{k}</button>
                ))}
              </div>

              <div style={{fontSize:"10px", letterSpacing:"2.5px", opacity:0.3, fontWeight:900, marginTop:"22px"}}>{type==="para"||type==="list"? `COUNT • ${para}` : `WORDS • ${words}`}</div>
              <input type="range" min={1} max={type==="para"?12:200} value={type==="para"||type==="list"?para:words} onChange={e=> type==="para"||type==="list"?setPara(Number(e.target.value)):setWords(Number(e.target.value))} style={{width:"100%", marginTop:"12px", accentColor:"#7c3aed"}} />

              <button onClick={generate} style={{width:"100%", marginTop:"22px", height:"56px", borderRadius:"18px", border:"none", background:"linear-gradient(90deg,#7c3aed,#d946ef)", color:"white", fontWeight:900, fontSize:"15px", cursor:"pointer", boxShadow:"0 12px 30px rgba(124,58,237,0.5)"}}>✨ GENERATE NOW</button>
              <div style={{display:"flex", gap:"8px", marginTop:"12px"}}>
                <div style={{flex:1, background:"rgba(255,255,255,0.06)", borderRadius:"12px", padding:"10px", textAlign:"center", fontSize:"11px"}}>⚡ Fast</div>
                <div style={{flex:1, background:"rgba(255,255,255,0.06)", borderRadius:"12px", padding:"10px", textAlign:"center", fontSize:"11px"}}>🔒 Offline</div>
                <div style={{flex:1, background:"rgba(255,255,255,0.06)", borderRadius:"12px", padding:"10px", textAlign:"center", fontSize:"11px"}}>🚫 No Ads</div>
              </div>
            </div>

            <div style={{background:"#0f0f10", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"28px", overflow:"hidden", display:"flex", flexDirection:"column"}}>
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", padding:"0 18px", height:"56px", borderBottom:"1px solid rgba(255,255,255,0.08)"}}>
                <span style={{fontSize:"11px", opacity:0.4, letterSpacing:"1px"}}>OUTPUT • {out.split(" ").length} WORDS • {out.length} CHARS</span>
                <div style={{display:"flex", gap:"8px"}}>
                  <button onClick={()=>setOut("")} style={{padding:"7px 14px", borderRadius:"20px", border:"1px solid rgba(255,255,255,0.1)", background:"transparent", color:"white", fontSize:"11px", cursor:"pointer"}}>Clear</button>
                  <button onClick={copy} style={{padding:"7px 16px", borderRadius:"20px", border:"none", background:"white", color:"black", fontWeight:900, fontSize:"12px", cursor:"pointer"}}>{copied?"Copied ✓":"Copy"}</button>
                </div>
              </div>
              <textarea value={out} onChange={e=>setOut(e.target.value)} style={{flex:1, minHeight:"400px", background:"transparent", border:"none", padding:"20px", color:"rgba(255,255,255,0.75)", fontSize:"15px", lineHeight:"28px", outline:"none", resize:"none"}} />
              <div style={{padding:"12px 18px", background:"rgba(255,255,255,0.03)", display:"flex", gap:"8px"}}>
                <button onClick={copy} style={{flex:1, height:"40px", borderRadius:"12px", border:"none", background:"white", color:"black", fontWeight:900, cursor:"pointer"}}>Copy Text</button>
                <button onClick={()=>{const blob=new Blob([out],{type:"text/plain"}); const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download=`lorem-${lang.toLowerCase()}.txt`; a.click();}} style={{flex:1, height:"40px", borderRadius:"12px", border:"1px solid rgba(255,255,255,0.1)", background:"transparent", color:"white", fontWeight:700, cursor:"pointer"}}>Download.txt</button>
              </div>
            </div>
          </div>
        </div>

        <div style={{textAlign:"center", fontSize:"10px", opacity:0.25, marginTop:"30px", letterSpacing:"3px"}}>BUILT FOR DESIGNERS • MADE IN INDIA • 2026</div>
      </div>
    </div>
  )
}
