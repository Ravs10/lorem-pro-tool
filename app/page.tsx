"use client"
import {useState,useEffect} from "react"
const DB:any={HI:["Swasth jeevan ke liye roz yoga jaruri hai","Subah tahalna fit rakhta hai","Paani khoob pina chahiye","Roz subah jaldi uthna faydemand hai"],EN:["Healthy life needs daily yoga","Morning walk keeps body fit","Drink more water daily","Early to bed early to rise"]}
const LANGS=[["HI","Hindi"],["EN","English"],["OR","Odia"],["BN","Bengali"],["TE","Telugu"],["TA","Tamil"],["KN","Kannada"],["ML","Malayalam"]]
export default function Page(){
const [lang,setLang]=useState("HI");const [mode,setMode]=useState("SENTENCE");const [cnt,setCnt]=useState(2);const [out,setOut]=useState("Swasth jeevan ke liye roz yoga jaruri hai\n\nSubah tahalna fit rakhta hai");const [showTop,setShowTop]=useState(false);const [copied,setCopied]=useState(false);
const gen=()=>{let b=DB[lang]||DB.EN;let r=b.slice(0,cnt).join("\n\n");if(mode==="WORD")r=b.join(" ").split(" ").slice(0,cnt).join(" ");if(mode==="LIST")r=b.slice(0,cnt).map((x:string)=>"• "+x).join("\n");setOut(r)}
useEffect(()=>{const h=()=>setShowTop(window.scrollY>300);window.addEventListener("scroll",h);return()=>window.removeEventListener("scroll",h)},[]);useEffect(()=>{gen()},[lang,mode,cnt]);
return(
<div style={{background:"linear-gradient(135deg,#667eea,#764ba2)",minHeight:"100vh",fontFamily:"system-ui",padding:12}}>
<div style={{maxWidth:600,margin:"auto",background:"#fff",borderRadius:16,padding:14,color:"#000"}}>
<select value={lang} onChange={e=>setLang(e.target.value)} style={{width:"100%",padding:12,borderRadius:8,border:"2px solid #6366f1",fontWeight:800,color:"#000",background:"#fff"}}>{LANGS.map(([c,n]:any)=><option key={c} value={c}>{c}-{n}</option>)}</select>
<div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,marginTop:10}}>{["PARAGRAPH","SENTENCE","WORD","LIST"].map(m=><button key={m} onClick={()=>setMode(m)} style={{padding:8,borderRadius:8,background:mode===m?"#6366f1":"#eee",color:mode===m?"#fff":"#000",border:"none",fontSize:10,fontWeight:800}}>{m}</button>)}</div>
<div style={{marginTop:10}}><input type="range" min={1} max={10} value={cnt} onChange={e=>setCnt(Number(e.target.value))} style={{width:"100%"}}/><b style={{color:"#000"}}>Count: {cnt}</b></div>
<button onClick={gen} style={{width:"100%",background:"#111",color:"#fff",padding:12,borderRadius:10,marginTop:10,fontWeight:900,border:"none"}}>GENERATE {lang}</button>
<div style={{border:"2px solid #111",borderRadius:10,padding:12,marginTop:10,minHeight:100,background:"#ffffff",color:"#000000",fontWeight:600,fontSize:14,whiteSpace:"pre-wrap"}}>{out}</div>
<div style={{display:"flex",gap:8,marginTop:10}}><button onClick={()=>{navigator.clipboard.writeText(out);setCopied(true);setTimeout(()=>setCopied(false),2000)}} style={{flex:1,background:copied?"#16a34a":"#111",color:"#fff",padding:12,borderRadius:999,border:"none",fontWeight:800}}>{copied?"✅ Copied!":"Copy"}</button><button onClick={()=>{let a=document.createElement("a");a.href=URL.createObjectURL(new Blob([out],{type:"text/plain"}));a.download=`lorem.txt`;a.click()}} style={{flex:1,background:"#6366f1",color:"#fff",padding:12,borderRadius:999,border:"none",fontWeight:800}}>Download</button></div>
</div>
{showTop&&<button onClick={()=>window.scrollTo({top:0,behavior:"smooth"})} style={{position:"fixed",bottom:20,right:20,background:"#111",color:"#fff",width:50,height:50,borderRadius:999,border:"none",fontSize:22}}>↑</button>}
</div>)}
