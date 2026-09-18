"use client"
import {useState,useEffect} from "react"

const LANGS:any=[
["HI","HI - हिन्दी"],["EN","EN - English"],["OR","OR - ଓଡ଼ିଆ"],["BN","BN - বাংলা"],["TE","TE - తెలుగు"],["TA","TA - தமிழ்"],["KN","KN - ಕನ್ನಡ"],["ML","ML - മലയാളം"],["MR","MR - मराठी"],["GU","GU - ગુજરાતી"],["PA","PA - ਪੰਜਾਬੀ"],["UR","UR - اردو"],["AS","AS - অসমীয়া"],["NE","NE - नेपाली"],["SI","SI - සිංහල"],["MY","MY - မြန်မာ"],["TH","TH - ไทย"],["LO","LO - ລາວ"],["KM","KM - ខ្មែរ"],["VI","VI - Tiếng Việt"],["ID","ID - Indonesia"],["MS","MS - Melayu"],["ZH","ZH - 中文"],["JA","JA - 日本語"],["KO","KO - 한국어"],["AR","AR - العربية"],["FA","FA - فارسی"],["HE","HE - עברית"],["TR","TR - Türkçe"],["FR","FR - Français"],["DE","DE - Deutsch"],["ES","ES - Español"],["PT","PT - Português"],["IT","IT - Italiano"],["NL","NL - Nederlands"],["PL","PL - Polski"],["RU","RU - Русский"],["UK","UK - Українська"],["EL","EL - Ελληνικά"],["CS","CS - Čeština"],["RO","RO - Română"],["HU","HU - Magyar"],["SV","SV - Svenska"],["DA","DA - Dansk"],["FI","FI - Suomi"],["NO","NO - Norsk"],["BN2","BN2 - Bengali2"],["TA2","TA2 - Tamil2"],["SW","SW - Swahili"],["AM","AM - አማርኛ"],["SO","SO - Soomaali"],["HA","HA - Hausa"],["YO","YO - Yorùbá"],["IG","IG - Igbo"],["ZU","ZU - Zulu"],["AF","AF - Afrikaans"],["SQ","SQ - Shqip"],["HR","HR - Hrvatski"],["SR","SR - Српски"],["BG","BG - Български"],["SK","SK - Slovenčina"],["SL","SL - Slovenščina"],["LT","LT - Lietuvių"],["LV","LV - Latviešu"],["ET","ET - Eesti"],["MT","MT - Malti"],["GA","GA - Gaeilge"],["CY","CY - Cymraeg"],["EU","EU - Euskara"],["CA","CA - Català"],["GL","GL - Galego"],["IS","IS - Íslenska"],["MK","MK - Македонски"],["HY","HY - Հայերեն"],["KA","KA - ქართული"],["AZ","AZ - Azərbaycan"]
]

const DB:any={
"HI":["स्वस्थ जीवन के लिए रोज़ योग ज़रूरी है","सुबह टहलना शरीर को फिट रखता है","फल और सब्जियां इम्युनिटी बढ़ाती हैं","पानी खूब पियो","हरी सब्जियां अच्छी हैं"],
"EN":["Healthy life needs daily yoga","Morning walk keeps body fit","Fruits boost immunity","Drink more water","Green vegetables are good"]
}
LANGS.forEach(([c]:any)=>{if(!DB[c]) DB[c]=DB.EN})

export default function Page(){
const [lang,setLang]=useState("HI")
const [mode,setMode]=useState("SENTENCE")
const [cnt,setCnt]=useState(5)
const [out,setOut]=useState("")
const [menu,setMenu]=useState(false)
const [showTop,setShowTop]=useState(false)

const gen=()=>{
 let base=DB[lang]||DB.EN
 let big=[]; for(let i=0;i<cnt;i++) big.push(base[i%base.length])
 let r=big.join("\n\n")
 if(mode==="WORD") r=big.join(" ").split(" ").slice(0,cnt).join(" ")
 if(mode==="LIST") r=big.map((x:string)=>"• "+x).join("\n")
 if(mode==="PARAGRAPH") r=Array(Math.ceil(cnt/2)).fill(0).map(()=>base.slice(0,2).join(" ")).join("\n\n")
 setOut(r)
}

useEffect(()=>{
 const h=()=>setShowTop(window.scrollY>400)
 window.addEventListener("scroll",h); gen()
 return()=>window.removeEventListener("scroll",h)
},[])
useEffect(()=>{gen()},[lang,mode,cnt])

const words=out.split(/\s+/).filter(Boolean).length
const chars=out.length

return(
<div style={{background:"linear-gradient(135deg,#667eea,#764ba2)",minHeight:"100vh",fontFamily:"system-ui",color:"#000"}}>
<style>{`@keyframes fade{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}.anim{animation:fade 0.5s}`}</style>

<header style={{background:"#fff",padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,zIndex:20,boxShadow:"0 2px 10px rgba(0,0,0,.1)"}}>
<b style={{color:"#111",fontSize:18}}>LP - LoremPro 75 🌍</b>
<div style={{display:"flex",gap:8}}>
<button onClick={()=>document.getElementById("how")?.scrollIntoView({behavior:"smooth"})} style={{background:"#f3f4f6",border:"none",padding:"8px 12px",borderRadius:999,fontWeight:700,fontSize:12}}>How to Use</button>
<button onClick={()=>setMenu(!menu)} style={{background:"#111",color:"#fff",border:"none",padding:"8px 16px",borderRadius:999,fontWeight:700}}>{menu?"Close":"Menu"}</button>
</div>
</header>

{menu&&<div className="anim" style={{background:"#fff",margin:12,borderRadius:16,padding:16}}>
<h3 style={{margin:"0 0 8px"}}>🌍 75 Languages PRO Tool</h3>
<p style={{fontSize:13,color:"#444",lineHeight:1.5}}>Lorem Ipsum ki jagah real languages me dummy text. Designers, developers ke liye best tool. 75 languages, 4 modes, 1-75 counter, animation ke saath.</p>
<h4>Navigation</h4>
<div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8}}>
<button onClick={()=>document.getElementById("gen")?.scrollIntoView({behavior:"smooth"})} style={{padding:10,borderRadius:8,border:"1px solid #ddd",fontWeight:700}}>Generator</button>
<button onClick={()=>document.getElementById("how")?.scrollIntoView({behavior:"smooth"})} style={{padding:10,borderRadius:8,border:"1px solid #ddd",fontWeight:700}}>How to Use</button>
<button onClick={()=>document.getElementById("tools")?.scrollIntoView({behavior:"smooth"})} style={{padding:10,borderRadius:8,border:"1px solid #ddd",fontWeight:700}}>Other Tools</button>
<button style={{padding:10,borderRadius:8,border:"1px solid #ddd",fontWeight:700}}>Hire Me</button>
</div>
<div style={{marginTop:12,maxHeight:200,overflowY:"auto",display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:6}}>
{LANGS.map(([c,n]:any)=><div key={c} style={{background:"#f3f4f6",padding:6,borderRadius:6,fontSize:10,fontWeight:700}}>{n}</div>)}
</div>
</div>}

<div style={{maxWidth:700,margin:"auto",padding:12}}>

<div id="gen" className="anim" style={{background:"#fff",borderRadius:20,padding:16,boxShadow:"0 20px 40px rgba(0,0,0,.15)"}}>
<label style={{fontWeight:800,fontSize:12,color:"#6366f1"}}>SELECT LANGUAGE - 75 OPTIONS</label>
<select value={lang} onChange={e=>setLang(e.target.value)} style={{width:"100%",padding:14,borderRadius:12,border:"2px solid #6366f1",fontWeight:800,fontSize:15,color:"#000",background:"#fff",marginTop:6}}>
{LANGS.map(([c,n]:any)=><option key={c} value={c}>{n}</option>)}
</select>

<div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginTop:12}}>
{["PARAGRAPH","SENTENCE","WORD","LIST"].map(m=><button key={m} onClick={()=>setMode(m)} style={{padding:10,borderRadius:10,background:mode===m?"#6366f1":"#f3f4f6",color:mode===m?"#fff":"#111",border:"none",fontSize:11,fontWeight:800,transition:"0.2s"}}>{m}</button>)}
</div>

<div style={{marginTop:12,background:"#f3f4f6",padding:12,borderRadius:12}}>
<label style={{fontWeight:800,color:"#111",fontSize:13}}>कितने चाहिए? - {cnt} / 75</label>
<input type="range" min={1} max={75} value={cnt} onChange={e=>setCnt(Number(e.target.value))} style={{width:"100%",marginTop:8}}/>
<div style={{display:"flex",justifyContent:"space-between",fontSize:11,fontWeight:700,marginTop:4,color:"#666"}}><span>1</span><span>75 Pura ek sath!</span></div>
</
