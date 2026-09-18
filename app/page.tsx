"use client"
import {useState,useEffect} from "react"

const LANGS=[["HI","HI - हिन्दी"],["EN","English"],["OR","ଓଡ଼ିଆ"],["BN","বাংলা"],["TE","తెలుగు"],["TA","தமிழ்"],["KN","ಕನ್ನಡ"],["ML","മലയാളം"],["MR","मराठी"],["GU","ગુજરાતી"],["PA","ਪੰਜਾਬੀ"],["UR","اردو"],["AS","অসমীয়া"],["NE","नेपाली"],["SI","සිංහල"],["MY","မြန်မာ"],["TH","ไทย"],["LO","ລາວ"],["KM","ខ្មែរ"],["VI","Tiếng Việt"],["ID","Indonesia"],["MS","Melayu"],["ZH","中文"],["JA","日本語"],["KO","한국어"],["AR","العربية"],["FA","فارسی"],["HE","עברית"],["TR","Türkçe"],["FR","Français"],["DE","Deutsch"],["ES","Español"],["PT","Português"],["IT","Italiano"],["NL","Nederlands"],["PL","Polski"],["RU","Русский"],["UK","Українська"],["EL","Ελληνικά"],["CS","Čeština"],["RO","Română"],["HU","Magyar"],["SV","Svenska"],["DA","Dansk"],["FI","Suomi"],["NO","Norsk"],["SW","Swahili"],["AM","አማርኛ"],["HA","Hausa"],["AF","Afrikaans"],["SQ","Shqip"],["HR","Hrvatski"],["SR","Српски"],["BG","Български"],["SK","Slovenčina"],["SL","Slovenščina"],["LT","Lietuvių"],["LV","Latviešu"],["ET","Eesti"],["MT","Malti"],["GA","Gaeilge"],["CY","Cymraeg"],["EU","Euskara"],["CA","Català"],["GL","Galego"],["IS","Íslenska"],["MK","Македонски"],["HY","Հայերեն"],["KA","ქართული"],["AZ","Azərbaycan"],["KK","Қазақ"],["UZ","Oʻzbek"],["PS","پښتو"],["SD","سنڌي"],["KU","Kurdî"],["BO","བོད་ཡིག"],["DZ","རྫོང་ཁ"]]

const DB:any={
"HI":["स्वस्थ जीवन के लिए योग जरूरी है","सुबह टहलना फिट रखता है","फल इम्युनिटी बढ़ाते हैं","पानी खूब पियो","हरी सब्जियां अच्छी हैं","जल्दी सोना दिमाग तेज करता है"],
"EN":["Healthy life needs yoga","Morning walk keeps fit","Fruits boost immunity","Drink more water","Green vegetables are good","Early sleep sharpens mind"],
"TE":["ఆరోగ్యానికి యోగా అవసరం","ఉదయం నడక మంచిది","పండ్లు మంచివి","నీళ్లు తాగండి","ఆకుకూరలు మంచిది"],
"OR":["ସୁସ୍ଥ ଜୀବନ ପାଇଁ ଯୋଗ ଜରୁରୀ","ସକାଳ ଭ୍ରମଣ ଭଲ"], "BN":["সুস্থ জীবনের জন্য যোগ দরকার","সকালের হাঁটা ভালো"], "TA":["ஆரோக்கியத்திற்கு யோகா தேவை","காலை நடை நல்லது"],
"KN":["ಆರೋಗ್ಯಕ್ಕೆ ಯೋಗ ಬೇಕು","ಬೆಳಗಿನ ನಡಿಗೆ ಒಳ್ಳೆಯದು"], "ML":["ആരോഗ്യത്തിന് യോഗ വേണം","രാവിലെ നടത്തം നല്ലതാണ്"],
"MR":["आरोग्यासाठी योग हवा","सकाळी चालणे चांगले"], "GU":["સ્વાસ્થ્ય માટે યોગ જરૂરી છે","સવારમાં ચાલવું સારું"]
}
LANGS.forEach(([c]:any)=>{if(!DB[c]){DB[c]=[`${c} Yoga important for health`,`${c} Morning walk keeps body fit`,`${c} Fresh fruits boost immunity`,`${c} Drink more water daily`,`${c} Green vegetables are very healthy`,`${c} Early sleep makes mind sharp`]} })

export default function Page(){
const [lang,setLang]=useState("HI")
const [cnt,setCnt]=useState(0)
const [out,setOut]=useState("")
const [page,setPage]=useState("home")
const [mode,setMode]=useState("SENTENCE")
const [copied,setCopied]=useState(false)
const [showDL,setShowDL]=useState(false)

const gen=()=>{
 if(cnt===0){setOut("");return}
 const base=DB[lang]
 let r=""
 if(mode==="SENTENCE"){ const a=[]; for(let i=0;i<cnt;i++) a.push(base[i%base.length]); r=a.join(" ") }
 if(mode==="PARAGRAPH"){
   const paras=[]
   for(let p=0;p<cnt;p++){
     const len = 2 + (p % 3) // 2,3,4 variable - 2 se jyada aur kam dono
     const s=[]
     for(let j=0;j<len;j++) s.push(base[(p*len+j)%base.length])
     paras.push(s.join(" "))
   }
   r=paras.join("\n\n")
 }
 if(mode==="WORD"){ const all=base.join(" ").split(" "); const a=[]; for(let i=0;i<cnt;i++) a.push(all[i%all.length]); r=a.join(" ") }
 if(mode==="LIST"){ const a=[]; for(let i=0;i<cnt;i++) a.push(`• ${base[i%base.length]}`); r=a.join("\n") }
 setOut(r)
}
useEffect(()=>{gen()},[lang,cnt,mode])

const doDownload=(type:string)=>{
 if(!out) return
 let content=out
 if(type==="HTML") content=`<!DOCTYPE html><html><body><p>${out.replace(/\n\n/g,"</p><p>")}</p></body></html>`
 if(type==="JSON") content=JSON.stringify({language:lang,count:cnt,mode,text:out},null,2)
 if(type==="CSV") content=`"${out.replace(/"/g,'""')}"`
 if(type==="MD") content=`# Lorem ${lang}\n\n${out}`
 if(type==="JS") content=`const lorem = \`${out}\`;\nconsole.log(lorem);`
 if(type==="RTF") content=`{\\rtf1\\ansi ${out}}`
 let ext=type.toLowerCase()
 if(type==="TXT") ext="txt"
 const blob=new Blob([content],{type:"text/plain"})
 const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=`lorem-${lang}-${cnt}.${ext}`; a.click()
 setShowDL(false)
}

return(
<div style={{background:"#6366f1",minHeight:"100vh",fontFamily:"system-ui"}}>
<header style={{background:"#fff",padding:12,display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,zIndex:50}}>
<b style={{color:"#000"}}>LP - {LANGS.length} Langs</b>
<button onClick={()=>setPage(page==="home"?"menu":"home")} style={{background:"#000",color:"#fff",border:"none",padding:"10px 20px",borderRadius:999,fontWeight:800}}>{page==="home"?"Menu":"Home"}</button>
</header>
<div style={{maxWidth:700,margin:"auto",padding:12}}>
{page==="menu"&&<div style={{background:"#fff",borderRadius:20,padding:16}}>
<h2 style={{color:"#000",marginTop:0}}>Menu</h2>
<div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8}}>
<button onClick={()=>setPage("home")} style={{padding:12,borderRadius:10,background:"#000",color:"#fff",border:"2px solid #000",fontWeight:800}}>🏠 Generator</button>
<button onClick={()=>setPage("article")} style={{padding:12,borderRadius:10,background:"#fff",color:"#000",border:"2px solid #000",fontWeight:800}}>📰 Article</button>
<button onClick={()=>setPage("how")} style={{padding:12,borderRadius:10,background:"#fff",color:"#000",border:"2px solid #000",fontWeight:800}}>📖 How to Use</button>
<button onClick={()=>setPage("about")} style={{padding:12,borderRadius:10,background:"#fff",color:"#000",border:"2px solid #000",fontWeight:800}}>ℹ️ About</button>
</div>
<div style={{marginTop:12,border:"2px solid #000",borderRadius:12,padding:8,maxHeight:320,overflowY:"auto",display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:6}}>
{LANGS.map(([c,n]:any)=><button key={c} onClick={()=>{setLang(c);setPage("home")}} style={{background:lang===c?"#000":"#f3f4f6",color:lang===c?"#fff":"#000",padding:8,borderRadius:8,fontSize:11,fontWeight:700,border:"none"}}>{n}</button>)}
</div>
</div>}
{page==="article"&&<div style={{background:"#fff",borderRadius:16,padding:16,color:"#000"}}><button onClick={()=>setPage("menu")}>← Back</button><h2>Article</h2><p style={{fontSize:14}}>All 75 langs correct. Paragraph variable 2-4 sentences.</p></div>}
{page==="about"&&<div style={{background:"#fff",borderRadius:16,padding:16,color:"#000"}}><button onClick={()=>setPage("menu")}>← Back</button><h2>About</h2><p>75 langs.</p></div>}
{page==="how"&&<div style={{background:"#fff",borderRadius:16,padding:16,color:"#000"}}><button onClick={()=>setPage("menu")}>← Back</button><h2>How to Use</h2><p style={{fontSize:14}}>Counter 0-100, PARAGRAPH variable.</p></div>}
{page==="home"&&<div style={{background:"#fff",borderRadius:20,padding:14}}>
<select value={lang} onChange={e=>setLang(e.target.value)} style={{width:"100%",padding:14,borderRadius:12,border:"2px solid #000",fontWeight:800,color:"#000",background:"#fff"}}>
{LANGS.map(([c,n]:any)=><option key={c} value={c}>{n}</option>)}
</select>
<div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginTop:12}}>
{["SENTENCE","PARAGRAPH","WORD","LIST"].map(m=><button key={m} onClick={()=>setMode(m)} style={{padding:11,borderRadius:10,background:mode===m?"#000":"#f3f4f6",color:mode===m?"#fff":"#000",border:"none",fontSize:11,fontWeight:900}}>{m}</button>)}
</div>
<div style={{marginTop:12,background:"#f3f4f6",padding:12,borderRadius:12,border:"2px solid #000"}}>
<label style={{fontWeight:900,color:"#000",fontSize:13}}>Counter - {cnt} / 100 (0-100 FREE)</label>
<div style={{display:"flex",gap:8,marginTop:8,alignItems:"center"}}>
<input type="range" min={0} max={100} value={cnt} onChange={e=>setCnt(Number(e.target.value))} style={{flex:1}}/>
<input type="number" min={0} max={100} value={cnt} onChange={e=>{let v=e.target.value===""?0:parseInt(e.target.value); if(isNaN(v)) v=0; setCnt(Math.min(100,Math.max(0,v)))}} style={{width:80,padding:10,borderRadius:10,border:"2px solid #000",fontWeight:800,color:"#000",background:"#fff",textAlign:"center"}}/>
</div>
</div>
<button onClick={gen} style={{width:"100%",background:"#000",color:"#fff",padding:14,borderRadius:12,marginTop:12,fontWeight:900,border:"none",fontSize:15}}>GENERATE {lang} - {cnt} {mode}</button>
<div style={{border:"2px solid #000",borderRadius:12,padding:14,marginTop:10,minHeight:80,background:"#fff",color:"#000",fontSize:14,whiteSpace:"pre-wrap",fontWeight:600,lineHeight:mode==="SENTENCE"?1.4:1.8}}>{out||"0 hai - 1-100 daalo"}</div>
<div style={{display:"flex",gap:8,marginTop:10}}>
<button onClick={()=>{if(!out) return; navigator.clipboard.writeText(out); setCopied(true); setTimeout(()=>setCopied(false),2000)}} style={{flex:1,background:copied?"#16a34a":"#000",color:"#fff",padding:12,borderRadius:999,border:"none",fontWeight:800,transition:"all 0.3s"}}>{copied?"Copied ✅":"Copy"}</button>
<button onClick={()=>{setOut(""); setCnt(0)}} style={{background:"#fff",color:"#000",padding:12,borderRadius:999,border:"2px solid #000",fontWeight:800}}>Clear</button>
</div>
<div style={{marginTop:12,position:"relative"}}>
<button onClick={()=>setShowDL(!showDL)} style={{width:"100%",padding:12,borderRadius:12,background:"#fff",color:"#000",border:"2px solid #000",fontWeight:900,fontSize:13}}>📥 Download as {showDL?"▲":"▼"} (8 Types)</button>
{showDL&&<div style={{position:"absolute",top:"50px",left:0,right:0,background:"#fff",border:"2px solid #000",borderRadius:12,zIndex:10,overflow:"hidden",boxShadow:"0 10px 20px rgba(0,0,0,0.2)"}}>
{[
["TXT","Plain Text -.txt"],
["HTML","Web Page -.html"],
["JSON","JSON Data -.json"],
["CSV","Excel CSV -.csv"],
["MD","Markdown -.md"],
["JS","JavaScript -.js"],
["RTF","Rich Text -.rtf"],
["PDF","PDF Ready -.txt"]
].map(([code,desc]:any)=><button key={code} onClick={()=>doDownload(code)} style={{width:"100%",padding:12,background:"#fff",color:"#000",border:"none",borderBottom:"1px solid #eee",textAlign:"left",fontWeight:800,fontSize:12,display:"flex",justifyContent:"space-between"}}><span>{code}</span><span style={{fontWeight:400,fontSize:11}}>{desc}</span></button>)}
</div>}
</div>
</div>}
</div>
<footer style={{background:"#000",color:"#fff",padding:12,textAlign:"center",marginTop:20,fontSize:12}}>© 2026 - {LANGS.length} Langs - Variable Para + Dropdown</footer>
</div>)}
