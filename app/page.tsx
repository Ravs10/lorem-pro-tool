"use client";
import { useState } from "react";

const TEXTS: any = {
  EN: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.",
  HI: "यह एक नमूना पाठ है जो डिज़ाइन में उपयोग होता है। लोरेम इप्सम डोलर सिट अमेट कंसेक्टेटर एडिपिसिंग एलीट।",
  ES: "Vivamus lacinia odio vitae vestibulum. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  FR: "Cras mattis purus sit amet fermentum. Lorem ipsum dolor sit amet, consectetur."
};

export default function Page(){
  const [lang,setLang]=useState("EN");
  const [para,setPara]=useState(3);
  const [out,setOut]=useState(Array(3).fill(TEXTS.EN).join("\n\n"));
  const [copied,setCopied]=useState(false);

  const gen=()=> setOut(Array(para).fill(TEXTS[lang]).join("\n\n"));
  const copy=()=>{navigator.clipboard.writeText(out); setCopied(true); setTimeout(()=>setCopied(false),1500)};

  return(
    <div style={{minHeight:"100vh", background:"#08080a", color:"white", fontFamily:"system-ui", padding:"20px"}}>
      <div style={{maxWidth:"1000px", margin:"0 auto"}}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"20px", padding:"0 20px", height:"64px"}}>
          <b style={{fontSize:"18px"}}>LoremGen <span style={{opacity:0.4}}>PRO</span> <span style={{background:"white", color:"black", fontSize:"10px", padding:"4px 8px", borderRadius:"20px", marginLeft:"8px"}}>ULTRA v2</span></b>
          <div style={{width:"10px", height:"10px", borderRadius:"50%", background:"#22c55e", boxShadow:"0 0 10px #22c55e"}} />
        </div>

        <div style={{display:"grid", gridTemplateColumns:"1fr", gap:"20px", marginTop:"20px"}}>
          <div style={{background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"28px", padding:"24px"}}>
            <div style={{fontSize:"11px", letterSpacing:"2px", opacity:0.3, fontWeight:900}}>LANGUAGE</div>
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:"10px", marginTop:"14px"}}>
              {Object.keys(TEXTS).map(k=>(
                <button key={k} onClick={()=>{setLang(k); setOut(Array(para).fill(TEXTS[k]).join("\n\n"))}} style={{height:"50px", borderRadius:"14px", border:"1px solid rgba(255,255,255,0.1)", background: lang===k? "white" : "rgba(255,255,255,0.06)", color: lang===k? "black" : "white", fontWeight:900, cursor:"pointer"}}>{k}</button>
              ))}
            </div>

            <div style={{fontSize:"11px", letterSpacing:"2px", opacity:0.3, fontWeight:900, marginTop:"24px"}}>PARAGRAPHS • {para}</div>
            <input type="range" min={1} max={10} value={para} onChange={e=>setPara(Number(e.target.value))} style={{width:"100%", marginTop:"12px"}} />

            <button onClick={gen} style={{width:"100%", marginTop:"24px", height:"54px", borderRadius:"16px", border:"none", background:"linear-gradient(90deg,#7c3aed,#d946ef)", color:"white", fontWeight:900, fontSize:"16px", cursor:"pointer", boxShadow:"0 10px 30px rgba(124,58,237,0.5)"}}>✨ GENERATE</button>
            <div style={{textAlign:"center", fontSize:"11px", opacity:0.3, marginTop:"12px"}}>Fast • Offline • No Ads</div>
          </div>

          <div style={{background:"#101010", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"28px", overflow:"hidden"}}>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", padding:"0 20px", height:"56px", borderBottom:"1px solid rgba(255,255,255,0.08)", background:"rgba(255,255,255,0.02)"}}>
              <span style={{fontSize:"11px", opacity:0.4}}>OUTPUT • {out.split(" ").length} WORDS</span>
              <button onClick={copy} style={{padding:"6px 14px", borderRadius:"20px", border:"none", background:"white", color:"black", fontWeight:900, fontSize:"12px", cursor:"pointer"}}>{copied?"Copied ✓":"Copy"}</button>
            </div>
            <div style={{padding:"20px", fontSize:"15px", lineHeight:"28px", opacity:0.7, whiteSpace:"pre-wrap"}}>{out}</div>
          </div>
        </div>

        <div style={{textAlign:"center", fontSize:"11px", opacity:0.2, marginTop:"40px", letterSpacing:"2px"}}>BUILT FOR DESIGNERS • 2026</div>
      </div>
    </div>
  )
}
