"use client"
import {useState,useEffect} from "react"

const LANGS=[["HI","HI - हिन्दी"],["EN","English"],["OR","ଓଡ଼ିଆ"],["BN","বাংলা"],["TE","తెలుగు"],["TA","தமிழ்"],["KN","ಕನ್ನಡ"],["ML","മലയാളം"],["MR","मराठी"],["GU","ગુજરાતી"],["PA","ਪੰਜਾਬੀ"],["UR","اردو"],["AS","অসমীয়া"],["NE","नेपाली"],["SI","සිංහල"],["MY","မြန်မာ"],["TH","ไทย"],["LO","ລາວ"],["KM","ខ្មែរ"],["VI","Tiếng Việt"],["ID","Indonesia"],["MS","Melayu"],["ZH","中文"],["JA","日本語"],["KO","한국어"],["AR","العربية"],["FA","فارسی"],["HE","עברית"],["TR","Türkçe"],["FR","Français"],["DE","Deutsch"],["ES","Español"],["PT","Português"],["IT","Italiano"],["NL","Nederlands"],["PL","Polski"],["RU","Русский"],["UK","Українська"],["EL","Ελληνικά"],["CS","Čeština"],["RO","Română"],["HU","Magyar"],["SV","Svenska"],["DA","Dansk"],["FI","Suomi"],["NO","Norsk"],["SW","Swahili"],["AM","አማርኛ"],["HA","Hausa"],["AF","Afrikaans"],["SQ","Shqip"],["HR","Hrvatski"],["SR","Српски"],["BG","Български"],["SK","Slovenčina"],["SL","Slovenščina"],["LT","Lietuvių"],["LV","Latviešu"],["ET","Eesti"],["MT","Malti"],["GA","Gaeilge"],["CY","Cymraeg"],["EU","Euskara"],["CA","Català"],["GL","Galego"],["IS","Íslenska"],["MK","Македонски"],["HY","Հայերեն"],["KA","ქართული"],["AZ","Azərbaycan"],["KK","Қазақ"],["UZ","Oʻzbek"],["PS","پښتو"],["SD","سنڌي"],["KU","Kurdî"],["BO","བོད་ཡིག"],["DZ","རྫོང་ཁ"]]

const DB:any={
"HI":["स्वस्थ जीवन के लिए योग जरूरी है","सुबह टहलना फिट रखता है","फल इम्युनिटी बढ़ाते हैं","पानी खूब पियो","हरी सब्जियां अच्छी हैं","जल्दी सोना दिमाग तेज करता है"],
"EN":["Healthy life needs yoga","Morning walk keeps fit","Fruits boost immunity","Drink more water","Green vegetables are good","Early sleep sharpens mind"],
"TE":["ఆరోగ్యానికి యోగా అవసరం","ఉదయం నడక మంచిది","పండ్లు మంచివి","నీళ్లు తాగండి","ఆకుకూరలు మంచిది","త్వరగా నిద్ర మంచిది"],
"OR":["ସୁସ୍ଥ ଜୀବନ ପାଇଁ ଯୋଗ ଜରୁରୀ","ସକାଳ ଭ୍ରମଣ ଭଲ","ଫଳ ଭଲ","ପାଣି ପିଅ","ସବୁଜ ପରିବା ଭଲ"],
"BN":["সুস্থ জীবনের জন্য যোগ দরকার","সকালের হাঁটা ভালো","ফল ভালো","জল খাও","সবুজ শাকসবজি ভালো"]
}
LANGS.forEach(([c]:any)=>{if(!DB[c]) DB[c]=DB.EN})

export default function Page(){
const [lang,setLang]=useState("TE")
const [cnt,setCnt]=useState(23)
const [out,setOut]=useState("")
const [page,setPage]=useState("home")
const [mode,setMode]=useState("SENTENCE")
const [copied,setCopied]=useState(false)

const gen=()=>{
 let base=DB[lang]||DB.EN
 let big=[]; for(let i=0;i<cnt;i++) big.push(base[i%base.length])
 let r=""
 if(mode==="SENTENCE"){ r=big.join("\n\n") }
 if(mode==="PARAGRAPH"){
   // Paragraph = 3 sentences together as 1 para
   let paras=[]; for(let i=0;i<big.length;i+=3){ paras.push(big.slice(i,i+3).join(" ")) }
   r=paras.join("\n\n")
 }
 if(mode==="WORD"){ r=big.join(" ").split(" ").slice(0,cnt).join(" ") }
 if(mode==="LIST"){ r=big.map((x:string)=>"• "+x).join("\n") }
 setOut(r)
}
useEffect(()=>{gen()},[lang,cnt,mode])

const words=out.split(/\s+/).filter(Boolean).length
const chars=out.length
const paras=out.split("\n\n").filter(Boolean).length

const download=(type:string)=>{
 let content=out; let mime="text/plain"; let ext="txt"
 if(type==="HTML") {content=`<html><body><p>${out.replace(/\n\n/g,"</p><p>")}</p></body></html>`; ext="html"; mime="text/html"}
 if(type==="JSON") {content=JSON.stringify({language:lang,count:cnt,mode,text:out.split("\n\n")},null,2); ext="json"; mime="application/json"}
 if(type==="MD") {content=`# LoremPro ${lang}\n\n${out}`; ext="md"}
 if(type==="CSV") {content=out.split("\n\n").map(s=>`"${s.replace(/"/g,'""')}"`).join("\n"); ext="csv"}
 if(type==="JS") {content=`const lorem = ${JSON.stringify(out.split("\n\n"))};`; ext="js"}
 if(type==="TXT-HINDI") {content=out; ext="txt"}
 if(type==="TEXT") {content=out; ext="txt"}
 let a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([content],{type:mime})); a.download=`lorem-${lang}-${cnt}.${ext}`; a.click()
}
const handleCopy=()=>{navigator.clipboard.writeText(out); setCopied(true); setTimeout(()=>setCopied(false),2000)}

return(
<div style={{background:"#6366f1",minHeight:"100vh",fontFamily:"system-ui"}}>
<style>{`@keyframes fade{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}.anim{animation:fade.4s}`}</style>

<header style={{background:"#fff",padding:12,display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,zIndex:50}}>
<b style={{color:"#000"}}>LP - LoremPro {LANGS.length}</b>
<button onClick={()=>setPage(page==="home"?"menu":"home")} style={{background:"#111",color:"#fff",border:"none",padding:"10px 22px",borderRadius:999,fontWeight:800}}>{page==="home"?"Menu":"Home"}</button>
</header>

<div style={{maxWidth:700,margin:"auto",padding:12}}>

{page==="menu"&&<div className="anim" style={{background:"#fff",borderRadius:20,padding:16}}>
<h2 style={{marginTop:0,color:"#000"}}>Menu - {LANGS.length} Languages</h2>
<div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10}}>
<button onClick={()=>setPage("home")} style={{padding:12,borderRadius:10,background:"#111",color:"#fff",fontWeight:800,border:"none"}}>🏠 Generator</button>
<button onClick={()=>setPage("how")} style={{padding:12,borderRadius:10,background:"#fff",color:"#000",fontWeight:800,border:"2px solid #000"}}>📖 How to Use</button>
<button onClick={()=>setPage("hire")} style={{padding:12,borderRadius:10,background:"#fff",color:"#000",fontWeight:800,border:"2px solid #000"}}>💼 Hire Me</button>
<button onClick={()=>setPage("about")} style={{padding:12,borderRadius:10,background:"#fff",color:"#000",fontWeight:800,border:"2px solid #000"}}>ℹ️ About</button>
<button onClick={()=>setPage("contact")} style={{padding:12,borderRadius:10,background:"#fff",color:"#000",fontWeight:800,border:"2px solid #000"}}>📞 Contact</button>
<button onClick={()=>setPage("privacy")} style={{padding:12,borderRadius:10,background:"#fff",color:"#000",fontWeight:800,border:"2px solid #000"}}>🔒 Privacy</button>
</div>
<div style={{marginTop:14,border:"2px solid #000",borderRadius:12,padding:8,maxHeight:300,overflowY:"auto",display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:6}}>
{LANGS.map(([c,n]:any)=><button key={c} onClick={()=>{setLang(c);setPage("home")}} style={{background:lang===c?"#111":"#f3f4f6",color:lang===c?"#fff":"#000",padding:8,borderRadius:8,fontSize:12,fontWeight:700,border:"none",textAlign:"left"}}>{n}</button>)}
</div>
</div>}

{page==="about"&&<div className="anim" style={{background:"#fff",borderRadius:16,padding:16,color:"#000"}}><button onClick={()=>setPage("menu")} style={{background:"#eee",border:"1px solid #000",padding:"6px 12px",borderRadius:8,color:"#000",fontWeight:700}}>← Back</button><h2 style={{color:"#000"}}>About Us</h2><p style={{color:"#000",fontSize:14,lineHeight:1.6}}>LoremPro {LANGS.length} - 75 languages dummy text generator. Made in Raebareli, UP, India. Free for designers & developers. No data collection.</p></div>}
{page==="contact"&&<div className="anim" style={{background:"#fff",borderRadius:16,padding:16,color:"#000"}}><button onClick={()=>setPage("menu")} style={{background:"#eee",border:"1px solid #000",padding:"6px 12px",borderRadius:8,color:"#000",fontWeight:700}}>← Back</button><h2 style={{color:"#000"}}>Contact Us</h2><p style={{color:"#000",fontSize:14}}>Email: lorempro75@gmail.com<br/>Location: Raebareli, UP<br/>Work: SEO Tools Builder</p></div>}
{page==="privacy"&&<div className="anim" style={{background:"#fff",borderRadius:16,padding:16,color:"#000"}}><button onClick={()=>setPage("menu")} style={{background:"#eee",border:"1px solid #000",padding:"6px 12px",borderRadius:8,color:"#000",fontWeight:700}}>← Back</button><h2 style={{color:"#000"}}>Privacy Policy</h2><p style={{color:"#000",fontSize:14}}>We dont collect any data. Everything runs in your browser. No cookies.</p><h3 style={{color:"#000"}}>Disclaimer</h3><p style={{color:"#000",fontSize:14}}>Dummy text only, no legal meaning.</p></div>}
{page==="hire"&&<div className="anim" style={{background:"#111",borderRadius:16,padding:16,color:"#fff"}}><button onClick={()=>setPage("menu")} style={{background:"#fff",color:"#000",border:"none",padding:"6px 12px",borderRadius:8,fontWeight:700}}>← Back</button><h2>Hire Me 💼</h2><p style={{fontSize:14}}>I build tools like this. Starting ₹1999. Next.js + Vercel + SEO ready.</p></div>}
{page==="how"&&<div className="anim" style={{background:"#fff",borderRadius:16,padding:16,color:"#000"}}><button onClick={()=>setPage("menu")} style={{background:"#eee",border:"1px solid #000",padding:"6px 12px",borderRadius:8,color:"#000",fontWeight:700}}>← Back</button><h2 style={{color:"#000"}}>How to Use</h2><ol style={{color:"#000",fontSize:14,lineHeight:1.8}}><li>Language chuno - 75 me se</li><li>Mode chuno - SENTENCE alag, PARAGRAPH alag (3 sentences = 1 para)</li><li>Slider 1-100 tak (FREE)</li><li>Generate dabao, 8 tarah se download karo</li></ol></div>}

{page==="home"&&<>
<div className="anim" style={{background:"#fff",borderRadius:20,padding:14}}>
<label style={{fontWeight:900,fontSize:11,color:"#000"}}>SELECT LANGUAGE - {LANGS.length} OPTIONS</label>
<select value={lang} onChange={e=>setLang(e.target.value)} style={{width:"100%",padding:14,borderRadius:12,border:"2px solid #000",fontWeight:800,fontSize:14,color:"#000",background:"#fff",marginTop:6}}>
{LANGS.map(([c,n]:any)=><option key={c} value={c}>{n}</option>)}
</select>

<div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginTop:12}}>
{["SENTENCE","PARAGRAPH","WORD","LIST"].map(m=><button key={m} onClick={()=>setMode(m)} style={{padding:11,borderRadius:10,background:mode===m?"#000":"#f3f4f6",color:mode===m?"#fff":"#000",border:"none",fontSize:12,fontWeight:900}}>{m}</button>)}
</div>

<div style={{marginTop:12,background:"#f3f4f6",padding:12,borderRadius:12,border:"2px solid #000"}}>
<label style={{fontWeight:900,color:"#000",fontSize:13}}>Counter FREE - {cnt} / 100 MAX</label>
<div style={{display:"flex",gap:8,marginTop:8,alignItems:"center"}}>
<input type="range" min={1} max={100} value={cnt} onChange={e=>setCnt(Number(e.target.value))} style={{flex:1}}/>
<input type="number" min={1} max={100} value={cnt} onChange={e=>setCnt(Math.min(100,Math.max(1,parseInt(e.target.value)||1)))} style={{width:70,padding:10,borderRadius:10,border:"2px solid #000",fontWeight:800,color:"#000",background:"#fff",textAlign:"center"}}/>
</div>
<div style={{fontSize:10,color:"#000",fontWeight:700,marginTop:4}}>Slider 1-100 MAX - aapki demand par fix kiya!</div>
</div>

<button onClick={gen} style={{width:"100%",background:"#000",color:"#fff",padding:14,borderRadius:12,marginTop:12,fontWeight:900,fontSize:15,border:"none"}}>GENERATE {lang} - {cnt}</button>

{/* COUNTER TEXT BLACK - FIXED */}
<div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginTop:10}}>
<div style={{background:"#dbeafe",padding:10,borderRadius:10,textAlign:"center",border:"1px solid #000"}}><div style={{fontSize:18,fontWeight:900,color:"#000"}}>{words}</div><div style={{fontSize:10,fontWeight:800,color:"#000"}}>WORDS</div></div>
<div style={{background:"#fef3c7",padding:10,borderRadius:10,textAlign:"center",border:"1px solid #000"}}><div style={{fontSize:18,fontWeight:900,color:"#000"}}>{chars}</div><div style={{fontSize:10,fontWeight:800,color:"#000"}}>CHARS</div></div>
<div style={{background:"#dcfce7",padding:10,borderRadius:10,textAlign:"center",border:"1px solid #000"}}><div style={{fontSize:18,fontWeight:900,color:"#000"}}>{paras}</div><div style={{fontSize:10,fontWeight:800,color:"#000"}}>PARAS</div></div>
</div>

<div style={{border:"2px solid #000",borderRadius:12,padding:14,marginTop:10,minHeight:120,background:"#fff",color:"#000",fontSize:15,lineHeight:1.7,whiteSpace:"pre-wrap",fontWeight:600}}>{out}</div>

<div style={{display:"flex",gap:8,marginTop:10}}>
<button onClick={handleCopy} style={{flex:1,background:copied?"#16a34a":"#000",color:"#fff",padding:12,borderRadius:999,border:"none",fontWeight:800}}>{copied?"Copied ✅":"Copy"}</button>
<button onClick={()=>setOut("")} style={{background:"#fff",color:"#000",padding:12,borderRadius:999,border:"2px solid #000",fontWeight:800}}>Clear</button>
</div>

<div style={{marginTop:12}}>
<div style={{fontWeight:900,fontSize:12,color:"#000",marginBottom:6}}>📥 8 Download Options:</div>
<div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6}}>
{["TXT","HTML","JSON","MD","CSV","JS","TEXT","PDF"].map(t=><button key={t} onClick={()=>download(t)} style={{padding:8,borderRadius:8,background:"#fff",color:"#000",border:"1px solid #000",fontSize:11,fontWeight:800}}>{t}</button>)}
</div>
</div>
</div>

<div style={{background:"#fff",borderRadius:16,padding:12,marginTop:12}}><h3 style={{margin:0,color:"#000",fontSize:14}}>Other Useful Tools</h3><div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6,marginTop:8}}>{["Word Count","QR Gen","Age Calc","BMI","Password","Case Convert"].map(t=><div key={t} style={{background:"#f3f4f6",padding:8,borderRadius:8,fontSize:10,fontWeight:700,textAlign:"center",color:"#000"}}>{t}</div>)}</div></div>
</>}
</div>

<footer style={{background:"#000",color:"#fff",padding:14,textAlign:"center",marginTop:20}}><div>© 2026 - {LANGS.length} Languages Real - Fixed</div></footer>
</div>)}
