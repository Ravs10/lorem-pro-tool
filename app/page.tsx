"use client"
import {useState,useEffect} from "react"
import {DB,LANGS} from "./data"
export default function Page(){
const [lang,setLang]=useState("HI")
const [mode,setMode]=useState("SENTENCE")
const [cnt,setCnt]=useState(3)
const [out,setOut]=useState("")
const [menu,setMenu]=useState(false)
const gen=()=>{
let b=DB[lang]||DB.EN
let r=b.slice(0,cnt).join(" ")
if(mode==="WORD")r=b.join(" ").split(" ").slice(0,cnt).join(" ")
if(mode==="LIST")r=b.slice(0,cnt).map((x:string)=>"• "+x).join("\n")
if(mode==="PARAGRAPH")r=Array(cnt).fill(0).map((_,i)=>b[i%b.length]).join("\n\n")
setOut(r)
}
useEffect(()=>{gen()},[])
useEffect(()=>{gen()},[lang,mode,cnt])
const chars=out.length
const words=out.split(/\s+/).filter(Boolean).length
return(<div style={{background:"linear-gradient(135deg,#667eea,#764ba2)",minHeight:"100vh",fontFamily:"system-ui"}}>
<header style={{background:"#fff",padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,zIndex:20}}><div style={{display:"flex",alignItems:"center",gap:8}}><div style={{background:"#111",color:"#fff",width:36,height:36,borderRadius:10,display:"grid",placeItems:"center",fontWeight:900}}>LP</div><div><b style={{display:"block",lineHeight:1,color:"#111"}}>LoremPro 75</b><small style={{color:"#666",fontSize:10}}>75 Languages • PRO</small></div></div><button onClick={()=>setMenu(!menu)} style={{background:"#111",color:"#fff",borderRadius:999,padding:"8px 18px",border:"none",fontWeight:800}}>{menu?"Close":"Menu"}</button></header>
{menu&&<div style={{background:"#fff",margin:12,borderRadius:16,padding:14,boxShadow:"0 10px 30px rgba(0,0,0,.25)",maxHeight:"75vh",overflowY:"auto"}}>
<div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8}}>
{[["home","🏠 Home"],["about","👤 About"],["how","❓ How to Use"],["tools","🛠️ Tools"],["hire","💼 Hire Me"],["contact","📧 Contact"],["privacy","🔒 Privacy"],["disclaimer","⚠️ Disclaimer"]].map(([k,l])=><button key={k} onClick={()=>{setMenu(false);document.getElementById(k)?.scrollIntoView({behavior:"smooth"})}} style={{padding:10,borderRadius:10,border:"1.5px solid #111",background:"#fff",color:"#111",fontWeight:700,fontSize:13}}>{l}</button>)}
</div>
<div style={{marginTop:12}}><b style={{color:"#111"}}>🌍 All 75 Languages</b><div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6,marginTop:8,maxHeight:160,overflowY:"auto"}}>{LANGS.map(([c]:any)=><div key={c} style={{background:"#f3f4f6",padding:5,borderRadius:6,fontSize:10,fontWeight:700,color:"#111",textAlign:"center"}}>{c}</div>)}</div></div>
</div>}

<div style={{maxWidth:720,margin:"auto",padding:12}}>
<div id="home" style={{background:"#fff",borderRadius:20,padding:16,boxShadow:"0 20px 40px rgba(0,0,0,.15)"}}>
<div style={{display:"flex",justifyContent:"space-between"}}><h2 style={{margin:0,color:"#111",fontSize:18}}>Generate Lorem Text</h2><span style={{background:"#eef2ff",color:"#4f46e5",padding:"4px 10px",borderRadius:999,fontSize:12,fontWeight:800}}>{LANGS.length} LANGS</span></div>
<select value={lang} onChange={e=>setLang(e.target.value)} style={{width:"100%",padding:12,borderRadius:10,border:"2px solid #6366f1",fontWeight:800,marginTop:12}}>{LANGS.map(([c,n]:any)=><option key={c} value={c}>{c} - {n}</option>)}</select>
<div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginTop:12}}>{["PARAGRAPH","SENTENCE","WORD","LIST"].map(m=><button key={m} onClick={()=>setMode(m)} style={{padding:10,borderRadius:10,background:mode===m?"#6366f1":"#f3f4f6",color:mode===m?"#fff":"#111",border:"none",fontSize:11,fontWeight:800}}>{m}</button>)}</div>
<div style={{marginTop:12,display:"flex",gap:10,alignItems:"center"}}><span style={{fontWeight:800,color:"#111"}}>Count: {cnt}</span><input type="range" min={1} max={50} value={cnt} onChange={e=>setCnt(Number(e.target.value))} style={{flex:1}}/></div>
<button onClick={gen} style={{width:"100%",background:"#111",color:"#fff",padding:14,borderRadius:12,marginTop:12,fontWeight:900,border:"none"}}>GENERATE {lang} - {cnt}</button>
<div style={{border:"2px solid #111",borderRadius:12,padding:12,marginTop:12,whiteSpace:"pre-wrap",minHeight:90,background:"#fff",color:"#000",fontWeight:700,fontSize:16,WebkitTextFillColor:"#000"}}>{out}</div>
<div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginTop:10}}><div style={{background:"#f3f4f6",padding:10,borderRadius:10,textAlign:"center"}}><b style={{fontSize:18,color:"#111",display:"block"}}>{chars}</b><small>Characters</small></div><div style={{background:"#f3f4f6",padding:10,borderRadius:10,textAlign:"center"}}><b style={{fontSize:18,color:"#111",display:"block"}}>{words}</b><small>Words</small></div><div style={{background:"#f3f4f6",padding:10,borderRadius:10,textAlign:"center"}}><b style={{fontSize:18,color:"#111",display:"block"}}>{cnt}</b><small>Count</small></div></div>
<div style={{display:"flex",gap:8,marginTop:12}}><button onClick={()=>navigator.clipboard.writeText(out)} style={{flex:1,background:"#111",color:"#fff",padding:12,borderRadius:999,border:"none",fontWeight:800}}>Copy Text</button><button onClick={()=>{let a=document.createElement("a");a.href=URL.createObjectURL(new Blob([out],{type:"text/plain"}));a.download=`lorem-${lang}.txt`;a.click()}} style={{flex:1,background:"#6366f1",color:"#fff",padding:12,borderRadius:999,border:"none",fontWeight:800}}>Download</button></div>
</div>

<div id="how" style={{background:"#fff",borderRadius:16,padding:16,marginTop:16}}><h3 style={{margin:0,color:"#111"}}>❓ How to Use</h3><ol style={{color:"#444",fontSize:14,lineHeight:1.8}}><li>Language select karo</li><li>Mode: Paragraph / Sentence / Word / List</li><li>Count slider 1-50</li><li>Generate > Copy / Download</li></ol></div>

<div id="tools" style={{background:"#fff",borderRadius:16,padding:16,marginTop:16}}><h3 style={{margin:"0 0 10px 0",color:"#111"}}>🛠️ Other Useful Tools</h3><div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8}}>{["Word Counter","Char Counter","Case Converter","Lorem Hindi","Lorem Odia","Hashtag Gen","QR Generator","Password Gen","Age Calculator","YouTube Title","Insta Bio","AI Humanizer"].map(t=><div key={t} style={{border:"1.5px solid #eee",padding:10,borderRadius:10,fontSize:13,fontWeight:600,color:"#111"}}>🔧 {t}</div>)}</div></div>

<div id="hire" style={{background:"#111",borderRadius:16,padding:16,marginTop:16,color:"#fff"}}><h3 style={{margin:0}}>💼 Hire Me</h3><p style={{fontSize:14,opacity:.9}}>I build SEO tools & SaaS websites. Need similar tool? Contact for custom project.</p><a href="mailto:contact@lorempro.tool" style={{background:"#6366f1",color:"#fff",padding:"10px 18px",borderRadius:999,textDecoration:"none",fontWeight:800,display:"inline-block",marginTop:8}}>📧 Contact</a></div>

<div id="about" style={{background:"#fff",borderRadius:16,padding:16,marginTop:16}}><h3 style={{margin:0,color:"#111"}}>👤 About Us</h3><p style={{color:"#444",fontSize:14,lineHeight:1.6}}>LoremPro 75 is built in Raebareli, UP. We support 75 languages including Hindi, Odia, Bengali etc. Mission: Replace boring Lorem Ipsum with real language dummy text. Free forever.</p></div>

<div id="contact" style={{background:"#fff",borderRadius:16,padding:16,marginTop:16}}><h3 style={{margin:0,color:"#111"}}>📧 Contact</h3><p style={{color:"#444",fontSize:14}}>Email: contact@lorempro.tool<br/>Location: Raebareli, UP, India</p></div>

<div id="privacy" style={{background:"#fff",borderRadius:16,padding:16,marginTop:16}}><h3 style={{margin:0,color:"#111"}}>🔒 Privacy Policy</h3><p style={{color:"#444",fontSize:13,lineHeight:1.6}}>We don't collect personal data. All generation client-side in browser. No tracking, no cookies. Files generated locally.</p></div>

<div id="disclaimer" style={{background:"#fff",borderRadius:16,padding:16,marginTop:16}}><h3 style={{margin:0,color:"#111"}}>⚠️ Disclaimer</h3><p style={{color:"#444",fontSize:13,lineHeight:1.6}}>Dummy texts are for design purposes only. Translations are approximate AI generated. Verify before commercial use.</p></div>

</div>
<footer style={{textAlign:"center",padding:20,color:"#fff",fontSize:12}}>© 2026 LoremPro 75 • 75 Languages • Made with ❤️ in Raebareli<br/>About • Contact • Privacy • Disclaimer • Hire Me</footer>
</div>)
}
