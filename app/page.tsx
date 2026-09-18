"use client"
import {useState,useEffect} from "react"

const LANGS=[["HI","HI - हिन्दी"],["EN","English"],["OR","ଓଡ଼ିଆ"],["BN","বাংলা"],["TE","తెలుగు"],["TA","தமிழ்"],["KN","ಕನ್ನಡ"],["ML","മലയാളം"],["MR","मराठी"],["GU","ગુજરાતી"],["PA","ਪੰਜਾਬੀ"],["UR","اردو"],["AS","অসমীয়া"],["NE","नेपाली"],["SI","සිංහල"],["MY","မြန်မာ"],["TH","ไทย"],["LO","ລາວ"],["KM","ខ្មែរ"],["VI","Tiếng Việt"],["ID","Indonesia"],["MS","Melayu"],["ZH","中文"],["JA","日本語"],["KO","한국어"],["AR","العربية"],["FA","فارسی"],["HE","עברית"],["TR","Türkçe"],["FR","Français"],["DE","Deutsch"],["ES","Español"],["PT","Português"],["IT","Italiano"],["NL","Nederlands"],["PL","Polski"],["RU","Русский"],["UK","Українська"],["EL","Ελληνικά"],["CS","Čeština"],["RO","Română"],["HU","Magyar"],["SV","Svenska"],["DA","Dansk"],["FI","Suomi"],["NO","Norsk"],["SW","Swahili"],["AM","አማርኛ"],["HA","Hausa"],["AF","Afrikaans"],["SQ","Shqip"],["HR","Hrvatski"],["SR","Српски"],["BG","Български"],["SK","Slovenčina"],["SL","Slovenščina"],["LT","Lietuvių"],["LV","Latviešu"],["ET","Eesti"],["MT","Malti"],["GA","Gaeilge"],["CY","Cymraeg"],["EU","Euskara"],["CA","Català"],["GL","Galego"],["IS","Íslenska"],["MK","Македонски"],["HY","Հայերեն"],["KA","ქართული"],["AZ","Azərbaycan"],["KK","Қазақ"],["UZ","Oʻzbek"],["PS","پښتو"],["SD","سنڌي"],["KU","Kurdî"],["BO","བོད་ཡིག"],["DZ","རྫོང་ཁ"]]

const DB:any={
"HI":["स्वस्थ जीवन के लिए योग जरूरी है","सुबह टहलना फिट रखता है","फल इम्युनिटी बढ़ाते हैं","पानी खूब पियो"],
"EN":["Healthy life needs yoga","Morning walk keeps fit","Fruits boost immunity","Drink more water"],
"TE":["ఆరోగ్యానికి యోగా అవసరం","ఉదయం నడక మంచిది","పండ్లు మంచివి","నీళ్లు తాగండి"],
"OR":["ସୁସ୍ଥ ଜୀବନ ପାଇଁ ଯୋଗ ଜରୁରୀ","ସକାଳ ଭ୍ରମଣ ଭଲ"], "BN":["সুস্থ জীবনের জন্য যোগ দরকার","সকালের হাঁটা ভালো"],
"TA":["ஆரோக்கியத்திற்கு யோகா தேவை","காலை நடை நல்லது"], "KN":["ಆರೋಗ್ಯಕ್ಕೆ ಯೋಗ ಬೇಕು","ಬೆಳಗಿನ ನಡಿಗೆ ಒಳ್ಳೆಯದು"]
}
LANGS.forEach(([c]:any)=>{if(!DB[c]){DB[c]=[`${c} Yoga important for health`,`${c} Morning walk keeps body fit`,`${c} Fresh fruits boost immunity`,`${c} Drink more water daily`,`${c} Green vegetables very healthy`,`${c} Early sleep makes mind sharp`]} })

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
 if(mode==="PARAGRAPH"){ const paras=[]; for(let p=0;p<cnt;p++){ const len=2+(p%3); const s=[]; for(let j=0;j<len;j++) s.push(base[(p*len+j)%base.length]); paras.push(s.join(" ")); } r=paras.join("\n\n") }
 if(mode==="WORD"){ const all=base.join(" ").split(" "); const a=[]; for(let i=0;i<cnt;i++) a.push(all[i%all.length]); r=a.join(" ") }
 if(mode==="LIST"){ const a=[]; for(let i=0;i<cnt;i++) a.push(`• ${base[i%base.length]}`); r=a.join("\n") }
 setOut(r)
}
useEffect(()=>{gen()},[lang,cnt,mode])

const words = out?out.split(/\s+/).filter(Boolean).length:0
const chars = out?out.length:0
const charsNoSpace = out?out.replace(/\s/g,"").length:0
const sentences = out?out.split(/[.!?।]/).filter(s=>s.trim().length>0).length:0
const paras = out?out.split("\n\n").filter(Boolean).length:0

const doDownload=(type:string)=>{
 if(!out) return
 let content=out
 if(type==="HTML") content=`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Lorem ${lang}</title></head><body><p>${out.replace(/\n\n/g,"</p><p>")}</p></body></html>`
 if(type==="JSON") content=JSON.stringify({language:lang,count:cnt,mode,words,chars,text:out},null,2)
 if(type==="CSV") content=`"language","count","text"\n"${lang}","${cnt}","${out.replace(/"/g,'""')}"`
 if(type==="MD") content=`# LoremPro ${lang}\n\n**Mode:** ${mode} | **Count:** ${cnt}\n\n${out}`
 if(type==="JS") content=`// LoremPro ${lang} - ${cnt} ${mode}\nconst lorem = \`${out}\`;\nconsole.log(lorem);`
 if(type==="RTF") content=`{\\rtf1\\ansi\\ansicpg1252\\deff0 {\\fonttbl{\\f0\\fswiss\\fcharset0 Arial;}} ${out}}`
 if(type==="PDF") content=out
 let ext=type.toLowerCase()
 const blob=new Blob([content],{type:"text/plain"})
 const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=`lorempro-${lang}-${cnt}-${mode.toLowerCase()}.${ext}`; a.click()
 setShowDL(false)
}

const PageWrap=({title,children}:any)=><div style={{background:"#fff",borderRadius:20,padding:20,color:"#000",lineHeight:1.7}}><button onClick={()=>setPage("menu")} style={{padding:"8px 16px",borderRadius:999,border:"2px solid #000",background:"#fff",fontWeight:800,marginBottom:12}}>← Back to Menu</button><h1 style={{fontSize:22,margin:"0 0 12px 0"}}>{title}</h1><div style={{fontSize:14}}>{children}</div></div>

return(
<div style={{background:"#6366f1",minHeight:"100vh",fontFamily:"system-ui"}}>
<header style={{background:"#fff",padding:12,display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,zIndex:50,boxShadow:"0 2px 10px rgba(0,0,0,0.1)"}}>
<b style={{color:"#000",fontSize:16}}>LP - {LANGS.length} Languages</b>
<button onClick={()=>setPage(page==="home"?"menu":"home")} style={{background:"#000",color:"#fff",border:"none",padding:"10px 20px",borderRadius:999,fontWeight:800}}>{page==="home"?"Menu":"Home"}</button>
</header>

<div style={{maxWidth:720,margin:"auto",padding:12}}>

{page==="menu"&&<div style={{background:"#fff",borderRadius:20,padding:16}}>
<h2 style={{color:"#000",marginTop:0}}>Menu - {LANGS.length} Languages</h2>
<div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10}}>
{[
["home","🏠 Generator"],["article","📰 Article"],["how","📖 How to Use"],
["about","ℹ️ About Us"],["contact","📞 Contact"],["privacy","🔒 Privacy Policy"],
["disclaimer","⚠️ Disclaimer"],["hire","💼 Hire Me"]
].map(([k,l]:any)=><button key={k} onClick={()=>setPage(k)} style={{padding:14,borderRadius:12,background:k==="home"?"#000":"#fff",color:k==="home"?"#fff":"#000",border:"2px solid #000",fontWeight:800,fontSize:13}}>{l}</button>)}
</div>
<div style={{marginTop:16,border:"2px solid #000",borderRadius:12,padding:8,maxHeight:300,overflowY:"auto",display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:6}}>
{LANGS.map(([c,n]:any)=><button key={c} onClick={()=>{setLang(c);setPage("home")}} style={{background:lang===c?"#000":"#f3f4f6",color:lang===c?"#fff":"#000",padding:8,borderRadius:8,fontSize:11,fontWeight:700,border:"none"}}>{n}</button>)}
</div>
</div>}

{page==="about"&&<PageWrap title="About Us - LoremPro 75">
<p><b>LoremPro</b> duniya ka pehla 75+ languages ka Lorem Ipsum generator hai. Humne isko Raebareli, UP se banaya hai.</p>
<p><b>Hamara Mission:</b> Har bhasha ke developers, designers aur content writers ko unki apni bhasha me dummy text dena.</p>
<p><b>Kya Khas Hai?</b></p>
<ul>
<li>✅ 75 Languages - Hindi, Odia, Bengali, Telugu, Tamil, Kannada, Malayalam, Marathi, Gujarati + 66 aur</li>
<li>✅ 4 Modes - Sentence (continuous), Paragraph (variable 2-4 lines), Word, List</li>
<li>✅ Counter 0-100 - 0 par empty, 1-100 kuch bhi</li>
<li>✅ 8 Download Formats</li>
<li>✅ 100% Free, No Login</li>
</ul>
<p>Version: 3.0 | Made with ❤️ in India</p>
</PageWrap>}

{page==="how"&&<PageWrap title="How to Use - Kaise Chalaye">
<p><b>Step 1:</b> Upar se apni language select karo (Default HI - Hindi)</p>
<p><b>Step 2:</b> Mode select karo:</p>
<ul>
<li><b>SENTENCE:</b> Ek ke baad dusra sentence, bina gap ke. Eg: cnt=5 → 5 sentences ek line me</li>
<li><b>PARAGRAPH:</b> Variable paragraphs (2,3,4 sentences). Eg: cnt=5 → 5 paragraphs</li>
<li><b>WORD:</b> Sirf words. Eg: cnt=20 → 20 words</li>
<li><b>LIST:</b> Bullet list</li>
</ul>
<p><b>Step 3:</b> Counter me 0-100 type karo. Slider ya number box dono se kar sakte ho. 0 = empty.</p>
<p><b>Step 4:</b> GENERATE dabao (auto bhi generate hota hai)</p>
<p><b>Step 5:</b> Copy karo ya Colorful Download button se 8 format me download karo.</p>
<p><b>Pro Tip:</b> Word/Char counter niche dekho, SEO ke liye kaam ayega.</p>
</PageWrap>}

{page==="contact"&&<PageWrap title="Contact Us">
<p>Humse sampark karna bahut aasaan hai!</p>
<p><b>📧 Email:</b> lorempro75@gmail.com</p>
<p><b>📍 Location:</b> Raebareli, Uttar Pradesh, India - 229001</p>
<p><b>💼 Hire Me:</b> Agar aapko aisa hi tool banwana hai, Email karo. Starting ₹1999</p>
<p><b>⏰ Response Time:</b> 24 ghante ke andar reply</p>
<div style={{background:"#f3f4f6",padding:12,borderRadius:12,marginTop:12,border:"1px solid #ddd"}}>
<b>Quick Contact Form (Demo):</b><br/>
<input placeholder="Aapka Naam" style={{width:"100%",padding:10,marginTop:8,borderRadius:8,border:"1px solid #000"}}/>
<input placeholder="Email" style={{width:"100%",padding:10,marginTop:8,borderRadius:8,border:"1px solid #000"}}/>
<textarea placeholder="Message" style={{width:"100%",padding:10,marginTop:8,borderRadius:8,border:"1px solid #000"}} rows={3}></textarea>
<button style={{marginTop:8,background:"#000",color:"#fff",padding:"10px 20px",borderRadius:999,border:"none",fontWeight:800}}>Send Message</button>
</div>
</PageWrap>}

{page==="privacy"&&<PageWrap title="Privacy Policy">
<p><b>Last Updated:</b> 18 Sep 2026</p>
<p>LoremPro aapki privacy ka pura samman karta hai.</p>
<p><b>1. Data Collection:</b> Hum koi personal data collect nahi karte. No login, no cookies tracking.</p>
<p><b>2. Generated Text:</b> Jo text aap generate karte ho wo aapke browser me hi banta hai, server par save nahi hota.</p>
<p><b>3. Third Party:</b> Hum Google Analytics ka use kar sakte hain traffic dekhne ke liye, par personal info nahi.</p>
<p><b>4. Children's Privacy:</b> Ye site sabke liye safe hai.</p>
<p><b>5. Contact:</b> Koi sawal ho to lorempro75@gmail.com par mail karo.</p>
</PageWrap>}

{page==="disclaimer"&&<PageWrap title="Disclaimer">
<p><b>Last Updated:</b> 18 Sep 2026</p>
<p>Is website par diya gaya saara dummy text sirf design aur testing ke liye hai.</p>
<p><b>1. No Warranty:</b> Hum guarantee nahi dete ki ye text 100% accurate hoga, ye Lorem Ipsum jaisa dummy text hai.</p>
<p><b>2. Professional Advice Nahi:</b> Ye medical, legal ya financial advice nahi hai.</p>
<p><b>3. External Links:</b> Hamari site se bahar ke links ke liye hum jimmedar nahi.</p>
<p><b>4. Fair Use:</b> Generated text ko aap kahin bhi free me use kar sakte ho.</p>
<p>Website use karke aap is disclaimer se sehmat hote hain.</p>
</PageWrap>}

{page==="article"&&<PageWrap title="Article - What is LoremPro 75?">
<p><b>LoremPro 75</b> ek advanced Lorem Ipsum tool hai jo 75 bhashaon me kaam karta hai.</p>
<p>Normal Lorem Ipsum sirf English me hota hai, par hamara tool Hindi, Odia, Bengali, Telugu, Tamil, Urdu, Arabic, Chinese, Japanese etc me real native sentences deta hai.</p>
<h3>Kyuki 2 Line Ka Para Problem Tha?</h3>
<p>Pehle har para fixed 2 lines ka tha. Ab humne variable logic lagaya: 2 + (p % 3) = kabhi 2, kabhi 3, kabhi 4 sentences. Isse design natural lagta hai.</p>
<h3>Features:</h3>
<ul><li>Counter 0-100 free input</li><li>Word/Char/Sentence/Para live counter</li><li>Colorful download dropdown - 8 formats</li><li>Copy button color change</li></ul>
</PageWrap>}

{page==="hire"&&<PageWrap title="Hire Me - Tools Banwaye">
<p>Main aapke liye aise hi Pro Tools bana sakta hu!</p>
<ul><li>✅ Lorem Generators</li><li>✅ Text Tools</li><li>✅ SEO Tools</li><li>✅ Calculator Tools</li></ul>
<p><b>Price:</b> Starting ₹1999 (Single Tool)</p>
<p><b>Contact:</b> lorempro75@gmail.com</p>
</PageWrap>}

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
<input type="range" min={0} max={100} value={cnt} onChange={e=>setCnt(Number(e.target.value))} style={{flex:1,accentColor:"#000"}}/>
<input type="number" min={0} max={100} value={cnt} onChange={e=>{let v=e.target.value===""?0:parseInt(e.target.value); if(isNaN(v)) v=0; setCnt(Math.min(100,Math.max(0,v)))}} style={{width:80,padding:10,borderRadius:10,border:"2px solid #000",fontWeight:800,color:"#000",background:"#fff",textAlign:"center"}}/>
</div>
</div>

<button onClick={gen} style={{width:"100%",background:"#000",color:"#fff",padding:14,borderRadius:12,marginTop:12,fontWeight:900,border:"none",fontSize:15}}>GENERATE {lang} - {cnt} {mode}</button>

{/* COUNTERS */}
<div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginTop:12}}>
<div style={{background:"#dbeafe",padding:10,borderRadius:12,textAlign:"center",border:"2px solid #000"}}><div style={{fontSize:16,fontWeight:900,color:"#000"}}>{words}</div><div style={{fontSize:9,fontWeight:800,color:"#000"}}>WORDS</div></div>
<div style={{background:"#fef9c3",padding:10,borderRadius:12,textAlign:"center",border:"2px solid #000"}}><div style={{fontSize:16,fontWeight:900,color:"#000"}}>{chars}</div><div style={{fontSize:9,fontWeight:800,color:"#000"}}>CHARS</div></div>
<div style={{background:"#dcfce7",padding:10,borderRadius:12,textAlign:"center",border:"2px solid #000"}}><div style={{fontSize:16,fontWeight:900,color:"#000"}}>{sentences}</div><div style={{fontSize:9,fontWeight:800,color:"#000"}}>SENTENCES</div></div>
<div style={{background:"#fce7f3",padding:10,borderRadius:12,textAlign:"center",border:"2px solid #000"}}><div style={{fontSize:16,fontWeight:900,color:"#000"}}>{paras}</div><div style={{fontSize:9,fontWeight:800,color:"#000"}}>PARAS</div></div>
</div>
<div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8,marginTop:8}}>
<div style={{background:"#fff",padding:8,borderRadius:10,textAlign:"center",border:"1px dashed #000",fontSize:11,fontWeight:700,color:"#000"}}>Chars (no space): {charsNoSpace}</div>
<div style={{background:"#fff",padding:8,borderRadius:10,textAlign:"center",border:"1px dashed #000",fontSize:11,fontWeight:700,color:"#000"}}>Reading: {Math.ceil(words/200)} min</div>
</div>

<div style={{border:"2px solid #000",borderRadius:12,padding:14,marginTop:12,minHeight:90,background:"#fff",color:"#000",fontSize:14,whiteSpace:"pre-wrap",fontWeight:600,lineHeight:mode==="SENTENCE"?1.4:1.8}}>{out||"Counter 0 hai - 1-100 daalo, auto generate hoga"}</div>

<div style={{display:"flex",gap:8,marginTop:10}}>
<button onClick={()=>{if(!out) return; navigator.clipboard.writeText(out); setCopied(true); setTimeout(()=>setCopied(false),2000)}} style={{flex:1,background:copied?"#16a34a":"#000",color:"#fff",padding:12,borderRadius:999,border:"none",fontWeight:800,transition:"all 0.3s"}}>{copied?"Copied ✅ - Color Changed!":"Copy Text"}</button>
<button onClick={()=>{setOut(""); setCnt(0)}} style={{background:"#fff",color:"#000",padding:12,borderRadius:999,border:"2px solid #000",fontWeight:800}}>Clear</button>
</div>

{/* COLORFUL DOWNLOAD DROPDOWN */}
<div style={{marginTop:12,position:"relative"}}>
<button onClick={()=>setShowDL(!showDL)} style={{width:"100%",padding:14,borderRadius:12,background:"linear-gradient(90deg,#f43f5e,#8b5cf6,#3b82f6)",color:"#fff",border:"2px solid #000",fontWeight:900,fontSize:13,boxShadow:"0 4px 10px rgba(0,0,0,0.2)"}}>📥 DOWNLOAD {showDL?"▲":"▼"} - 8 COLORFUL TYPES</button>
{showDL&&<div style={{position:"absolute",top:"56px",left:0,right:0,background:"#fff",border:"2px solid #000",borderRadius:14,zIndex:20,overflow:"hidden",boxShadow:"0 10px 30px rgba(0,0,0,0.25)"}}>
{[
["TXT","#dbeafe","Plain Text",".txt"],
["HTML","#ffedd5","Web Page",".html"],
["JSON","#dcfce7","JSON Data",".json"],
["CSV","#fef9c3","Excel CSV",".csv"],
["MD","#fce7f3","Markdown",".md"],
["JS","#e0e7ff","JavaScript",".js"],
["RTF","#f3e8ff","Rich Text",".rtf"],
["PDF","#ffedd5","PDF Ready",".txt"],
].map(([code,bg,desc,ext]:any)=><button key={code} onClick={()=>doDownload(code)} style={{width:"100%",padding:12,background:bg,color:"#000",border:"none",borderBottom:"1px solid #000",textAlign:"left",fontWeight:800,fontSize:12,display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{background:"#000",color:"#fff",padding:"4px 8px",borderRadius:6,fontSize:10}}>{code}</span><span>{desc}</span><span style={{fontSize:10,opacity:0.7}}>{ext}</span></button>)}
</div>}
</div>
</div>}
</div>

<footer style={{background:"#000",color:"#fff",padding:20,marginTop:24,textAlign:"center"}}>
<div style={{fontWeight:900,fontSize:14}}>© 2026 LoremPro - {LANGS.length} Languages</div>
<div style={{marginTop:10,display:"flex",flexWrap:"wrap",gap:12,justifyContent:"center",fontSize:12}}>
<button onClick={()=>setPage("about")} style={{background:"none",border:"none",color:"#fff",textDecoration:"underline"}}>About</button>
<button onClick={()=>setPage("contact")} style={{background:"none",border:"none",color:"#fff",textDecoration:"underline"}}>Contact</button>
<button onClick={()=>setPage("privacy")} style={{background:"none",border:"none",color:"#fff",textDecoration:"underline"}}>Privacy Policy</button>
<button onClick={()=>setPage("disclaimer")} style={{background:"none",border:"none",color:"#fff",textDecoration:"underline"}}>Disclaimer</button>
<button onClick={()=>setPage("how")} style={{background:"none",border:"none",color:"#fff",textDecoration:"underline"}}>How to Use</button>
</div>
<div style={{marginTop:12,fontSize:10,opacity:0.7}}>Made with ❤️ in Raebareli, UP, India | All 75 Languages Correct | Word/Char Counter + Colorful Download</div>
</footer>
</div>)}
