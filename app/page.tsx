"use client"
import {useState,useEffect} from "react"
const DB:any={
HI:["Swasth jeevan ke liye roz yoga jaruri hai","Subah tahalna fit rakhta hai","Paani khoob pina chahiye"],
EN:["Healthy life needs daily yoga","Morning walk keeps body fit","Drink more water daily"],
OR:["Sustha jeevan pain yoga darkar"],BN:["Sasthokar jiboner jonno yoga proyojon"],TE:["Arogyakara jeevitaniki yoga avasaram"],TA:["Arokiyamana vaazhkkaiku yoga tevai"],KN:["Arogyakara jeevanake yoga beku"],ML:["Arogyakaramaaya jeevitattinu yoga venam"],MR:["Nirogi jivanasathi yog hava"],GU:["Swasth jivan mate yog jaruri"],PA:["Sehatmand jeevan layi yoga zaruri"]
}
const LANGS=[["HI","Hindi"],["EN","English"],["OR","Odia"],["BN","Bengali"],["TE","Telugu"],["TA","Tamil"],["KN","Kannada"],["ML","Malayalam"],["MR","Marathi"],["GU","Gujarati"],["PA","Punjabi"]]
export default function Page(){
const [lang,setLang]=useState("HI");const [mode,setMode]=useState("SENTENCE");const [cnt,setCnt]=useState(3);const [out,setOut]=useState("");const [showTop,setShowTop]=useState(false);const [copied,setCopied]=useState(false);const [open,setOpen]=useState<any>({});const [art,setArt]=useState("");
const gen=()=>{let b=DB[lang]||DB.EN;let r=b.slice(0,cnt).join(" ");if(mode==="WORD")r=b.join(" ").split(" ").slice(0,cnt).join(" ");if(mode==="LIST")r=b.slice(0,cnt).map((x:string)=>"• "+x).join("\n");if(mode==="PARAGRAPH")r=Array(cnt).fill(0).map((_,i)=>b[i%b.length]).join("\n\n");setOut(r)}
useEffect(()=>{gen();const h=()=>setShowTop(window.scrollY>400);window.addEventListener("scroll",h);return()=>window.removeEventListener("scroll",h)},[]);useEffect(()=>{gen()},[lang,mode,cnt]);
const doCopy=()=>{navigator.clipboard.writeText(out);setCopied(true);setTimeout(()=>setCopied(false),2000)}
const toggle=(k:string)=>setOpen((p:any)=>({...p,[k]:!p[k]}))
return(<div style={{background:"linear-gradient(135deg,#667eea,#764ba2)",minHeight:"100vh",fontFamily:"system-ui"}}>
<style>{`@keyframes f{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}.a{animation:f.4s ease}`}</style>
<header style={{background:"#fff",padding:12,display:"flex",justifyContent:"space-between",position:"sticky",top:0}}><b>✨ LoremPro - NEW FINAL</b><button onClick={()=>toggle("menu")} style={{background:"#111",color:"#fff",borderRadius:999,padding:"8px 16px",border:"none"}}>{open.menu?"Close":"Menu"}</button></header>
{open.menu&&<div className="a" style={{background:"#fff",margin:12,borderRadius:12,padding:12,display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>{["how","article","about","contact"].map(k=><button key={k} onClick={()=>{toggle("menu");toggle(k);document.getElementById(k)?.scrollIntoView({behavior:"smooth"})}} style={{padding:10,borderRadius:8,border:"1px solid #111",fontWeight:700}}>{k}</button>)}</div>}
<div style={{maxWidth:700,margin:"auto",padding:12}}>
<div style={{background:"#fff",borderRadius:16,padding:14}}><select value={lang} onChange={e=>setLang(e.target.value)} style={{width:"100%",padding:12,borderRadius:8,border:"2px solid #6366f1",fontWeight:800}}>{LANGS.map(([c,n]:any)=><option key={c} value={c}>{c}-{n}</option>)}</select>
<div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,marginTop:10}}>{["PARAGRAPH","SENTENCE","WORD","LIST"].map(m=><button key={m} onClick={()=>setMode(m)} style={{padding:8,borderRadius:8,background:mode===m?"#6366f1":"#eee",color:mode===m?"#fff":"#000",border:"none",fontSize:10,fontWeight:800}}>{m}</button>)}</div>
<div style={{marginTop:10}}><input type="range" min={1} max={20} value={cnt} onChange={e=>setCnt(Number(e.target.value))} style={{width:"100%"}}/><b>Count: {cnt}</b></div>
<button onClick={gen} style={{width:"100%",background:"#111",color:"#fff",padding:12,borderRadius:10,marginTop:10,fontWeight:900,border:"none"}}>GENERATE {lang}</button>
<div style={{border:"2px solid #111",borderRadius:10,padding:10,marginTop:10,minHeight:80,whiteSpace:"pre-wrap"}}>{out}</div>
<div style={{display:"flex",gap:8,marginTop:10}}><button onClick={doCopy} style={{flex:1,background:copied?"#16a34a":"#111",color:"#fff",padding:12,borderRadius:999,border:"none",fontWeight:800}}>{copied?"✅ Copied!":"Copy"}</button><button onClick={()=>toggle("dl")} style={{flex:1,background:"#6366f1",color:"#fff",padding:12,borderRadius:999,border:"none",fontWeight:800}}>Download</button></div>
{open.dl&&<div className="a" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,marginTop:8}}>{["txt","json","csv","html","md","js","xml","doc"].map(t=><button key={t} onClick={()=>{let a=document.createElement("a");a.href=URL.createObjectURL(new Blob([out],{type:"text/plain"}));a.download=`lorem.${t}`;a.click()}} style={{padding:8,borderRadius:6,border:"1px solid #ddd",fontSize:10,fontWeight:800}}>{t}</button>)}</div>}
</div>
<div id="how" style={{background:"#fff",borderRadius:12,marginTop:14,overflow:"hidden"}}><div onClick={()=>toggle("how")} style={{padding:14,display:"flex",justifyContent:"space-between",cursor:"pointer",fontWeight:800}}><span>❓ How to Use (Click to Open)</span><span>{open.how?"-":"+"}</span></div>{open.how&&<div className="a" style={{padding:"0 14px 14px",fontSize:13}}>1.Language chuno 2.Mode chuno 3.Count 4.Generate 5.Copy Green hoga + 8 Download</div>}</div>
<div id="article" style={{background:"#fff",borderRadius:12,marginTop:14,overflow:"hidden"}}><div onClick={()=>toggle("article")} style={{padding:14,display:"flex",justifyContent:"space-between",cursor:"pointer",background:"#fef3c7",fontWeight:800}}><span>📝 Article Writer NEW</span><span>{open.article?"-":"+"}</span></div>{open.article&&<div className="a" style={{padding:"0 14px 14px"}}><textarea value={art} onChange={e=>setArt(e.target.value)} placeholder="Topic likho" style={{width:"100%",padding:8,borderRadius:8}}/><button onClick={()=>{setOut(`Article on ${art}: ${DB[lang].join(" ")}`);window.scrollTo({top:0,behavior:"smooth"})}} style={{width:"100%",background:"#111",color:"#fff",padding:10,borderRadius:8,marginTop:6}}>Generate Article</button></div>}</div>
</div>
{showTop&&<button onClick={()=>window.scrollTo({top:0,behavior:"smooth"})} style={{position:"fixed",bottom:20,right:20,background:"#111",color:"#fff",width:48,height:48,borderRadius:999,border:"none",fontSize:20}}>↑</button>}
</div>)}
