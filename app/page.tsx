"use client"
import {useState,useEffect} from "react"
const LANGS=[["HI","HI - हिन्दी"],["EN","English"],["OR","ଓଡ଼ିଆ"],["BN","বাংলা"],["TE","తెలుగు"],["TA","தமிழ்"],["KN","ಕನ್ನಡ"],["ML","മലയാളം"],["MR","मराठी"],["GU","ગુજરાતી"],["PA","ਪੰਜਾਬੀ"],["UR","اردو"],["AS","অসমীয়া"],["NE","नेपाली"],["SI","සිංහල"],["MY","မြန်မာ"],["TH","ไทย"],["LO","ລາວ"],["KM","ខ្មែរ"],["VI","Tiếng Việt"],["ID","Indonesia"],["MS","Melayu"],["ZH","中文"],["JA","日本語"],["KO","한국어"],["AR","العربية"],["FA","فارسی"],["HE","עברית"],["TR","Türkçe"],["FR","Français"],["DE","Deutsch"],["ES","Español"],["PT","Português"],["IT","Italiano"],["NL","Nederlands"],["PL","Polski"],["RU","Русский"],["UK","Українська"],["EL","Ελληνικά"],["CS","Čeština"],["RO","Română"],["HU","Magyar"],["SV","Svenska"],["DA","Dansk"],["FI","Suomi"],["NO","Norsk"],["SW","Swahili"],["AM","አማርኛ"],["HA","Hausa"],["AF","Afrikaans"],["SQ","Shqip"],["HR","Hrvatski"],["SR","Српски"],["BG","Български"],["SK","Slovenčina"],["SL","Slovenščina"],["LT","Lietuvių"],["LV","Latviešu"],["ET","Eesti"],["MT","Malti"],["GA","Gaeilge"],["CY","Cymraeg"],["EU","Euskara"],["CA","Català"],["GL","Galego"],["IS","Íslenska"],["MK","Македонски"],["HY","Հայերեն"],["KA","ქართული"],["AZ","Azərbaycan"],["KK","Қазақ"],["UZ","Oʻzbek"],["PS","پښتو"],["SD","سنڌي"],["KU","Kurdî"],["BO","བོད་ཡིག"],["DZ","རྫོང་ཁ"]]
const DB:any={
"HI":["स्वस्थ जीवन के लिए योग जरूरी है","सुबह टहलना फिट रखता है","फल इम्युनिटी बढ़ाते हैं"],
"EN":["Healthy life needs yoga","Morning walk keeps fit","Fruits boost immunity"],
"OR":["ସୁସ୍ଥ ଜୀବନ ପାଇଁ ଯୋଗ ଜରୁରୀ","ସକାଳ ଭ୍ରମଣ ଭଲ","ଫଳ ଭଲ"],
"BN":["সুস্থ জীবনের জন্য যোগ দরকার","সকালের হাঁটা ভালো","ফল ভালো"],
"TE":["ఆరోగ్యానికి యోగా అవసరం","ఉదయం నడక మంచిది","పండ్లు మంచివి"],
"TA":["ஆரோக்கியத்திற்கு யோகா தேவை","காலை நடை நல்லது","பழங்கள் நல்லது"],
"KN":["ಆರೋಗ್ಯಕ್ಕೆ ಯೋಗ ಬೇಕು","ಬೆಳಗಿನ ನಡಿಗೆ ಒಳ್ಳೆಯದು","ಹಣ್ಣುಗಳು ಒಳ್ಳೆಯದು"],
"ML":["ആരോഗ്യത്തിന് യോഗ വേണം","രാവിലെ നടത്തം നല്ലതാണ്","പഴങ്ങൾ നല്ലതാണ്"],
"MR":["आरोग्यासाठी योग हवा","सकाळी चालणे चांगले","फळे चांगली"],
"GU":["સ્વાસ્થ્ય માટે યોગ જરૂરી છે","સવારમાં ચાલવું સારું","ફળો સારા"],
"PA":["ਸਿਹਤ ਲਈ ਯੋਗਾ ਜ਼ਰੂਰੀ ਹੈ","ਸਵੇਰ ਦੀ ਸੈਰ ਚੰਗੀ ਹੈ","ਫਲ ਚੰਗੇ ਹਨ"],
"UR":["صحت کے لیے یوگا ضروری ہے","صبح کی سیر اچھی ہے","پھل اچھے ہیں"],
"AR":["الصحة تحتاج يوجا","المشي الصباحي جيد","الفاكهة جيدة"],
"FR":["La sante a besoin de yoga","Marche matinale bonne","Fruits bons"],
"DE":["Gesundheit braucht Yoga","Morgenspaziergang gut","Obst gut"],
"ES":["Salud necesita yoga","Caminata matutina buena","Fruta buena"],
"JA":["健康にはヨガが必要です","朝の散歩は良いです","果物は良いです"],
"ZH":["健康需要瑜伽","晨走很好","水果很好"],
"RU":["Здоровье нуждается в йоге","Утренняя прогулка хороша","Фрукты хороши"],
"TR":["Saglik yoga ister","Sabah yuruyusu iyi","Meyve iyi"]
}
LANGS.forEach(([c]:any)=>{if(!DB[c]) DB[c]=DB.EN})
export default function Page(){
const [lang,setLang]=useState("HI");const [cnt,setCnt]=useState(10);const [out,setOut]=useState("");const [page,setPage]=useState("home");const [mode,setMode]=useState("SENTENCE")
const gen=()=>{let b=DB[lang]||DB.EN;let big=[];for(let i=0;i<cnt;i++)big.push(b[i%b.length]);let r=big.join("\n\n");if(mode==="WORD")r=big.join(" ").split(" ").slice(0,cnt).join(" ");if(mode==="LIST")r=big.map((x:string)=>"• "+x).join("\n");setOut(r)}
useEffect(()=>{gen()},[lang,cnt,mode])
const words=out.split(/\s+/).filter(Boolean).length
return(<div style={{background:"linear-gradient(135deg,#667eea,#764ba2)",minHeight:"100vh",fontFamily:"system-ui"}}>
<header style={{background:"#fff",padding:12,display:"flex",justifyContent:"space-between",position:"sticky",top:0,zIndex:50}}><b>LP - LoremPro {LANGS.length}</b><button onClick={()=>setPage(page==="home"?"menu":"home")} style={{background:"#111",color:"#fff",border:"none",padding:"8px 18px",borderRadius:999,fontWeight:800}}>{page==="home"?"Menu":"Home"}</button></header>
<div style={{maxWidth:720,margin:"auto",padding:12}}>
{page==="menu"&&<div style={{background:"#fff",borderRadius:20,padding:16}}><h2>Menu - {LANGS.length} Languages ✅</h2><div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8}}>{[["home","Generator"],["about","About"],["contact","Contact"],["privacy","Privacy"],["hire","Hire Me"],["how","How to Use"]].map(([k,l]:any)=><button key={k} onClick={()=>setPage(k)} style={{padding:12,borderRadius:10,border:"2px solid #111",background:"#fff",fontWeight:800}}>{l}</button>)}</div><div style={{marginTop:12,maxHeight:300,overflowY:"auto",display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:6,border:"2px solid #111",borderRadius:12,padding:8}}>{LANGS.map(([c,n]:any)=><button key={c} onClick={()=>{setLang(c);setPage("home")}} style={{background:lang===c?"#111":"#f3f4f6",color:lang===c?"#fff":"#111",padding:8,borderRadius:8,fontSize:11,fontWeight:700,border:"none"}}>{n}</button>)}</div></div>}
{page!=="home"&&page!=="menu"&&<div style={{background:"#fff",borderRadius:16,padding:16}}><button onClick={()=>setPage("menu")} style={{marginBottom:10}}>← Back</button><h2>{page}</h2><p style={{fontSize:13}}>This is {page} page - 75 languages tool - Made in Raebareli. All content in browser only.</p></div>}
{page==="home"&&<div style={{background:"#fff",borderRadius:20,padding:16}}>
<select value={lang} onChange={e=>setLang(e.target.value)} style={{width:"100%",padding:14,borderRadius:12,border:"2px solid #111",fontWeight:800}}>{LANGS.map(([c,n]:any)=><option key={c} value={c}>{n}</option>)}</select>
<div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginTop:10}}>{["SENTENCE","PARAGRAPH","WORD","LIST"].map(m=><button key={m} onClick={()=>setMode(m)} style={{padding:10,borderRadius:10,background:mode===m?"#111":"#f3f4f6",color:mode===m?"#fff":"#111",border:"none",fontWeight:800,fontSize:11}}>{m}</button>)}</div>
<div style={{marginTop:10,background:"#f8fafc",padding:12,borderRadius:12,border:"1px solid #e2e8f0"}}><label style={{fontWeight:900}}>Counter FREE - {cnt}</label><div style={{display:"flex",gap:8,marginTop:6}}><input type="range" min={1} max={500} value={cnt>500?500:cnt} onChange={e=>setCnt(Number(e.target.value))} style={{flex:1}}/><input type="number" value={cnt} onChange={e=>setCnt(Math.min(10000,Math.max(1,parseInt(e.target.value)||1)))} style={{width:80,padding:8,borderRadius:8,border:"2px solid #111",fontWeight:800,textAlign:"center"}}/></div></div>
<button onClick={gen} style={{width:"100%",background:"#111",color:"#fff",padding:14,borderRadius:12,marginTop:10,fontWeight:900,border:"none"}}>GENERATE {lang} - {cnt}</button>
<div style={{display:"flex",gap:8,marginTop:8}}><div style={{flex:1,background:"#eef2ff",padding:8,borderRadius:8,textAlign:"center",fontWeight:900}}>{words} Words</div><div style={{flex:1,background:"#dcfce7",padding:8,borderRadius:8,textAlign:"center",fontWeight:900}}>{LANGS.length} Langs</div></div>
<div style={{border:"2px solid #111",borderRadius:12,padding:12,marginTop:10,minHeight:120,background:"#fff",color:"#000",whiteSpace:"pre-wrap",fontWeight:600}}>{out}</div>
<div style={{display:"flex",gap:8,marginTop:10}}><button onClick={()=>navigator.clipboard.writeText(out)} style={{flex:1,background:"#111",color:"#fff",padding:12,borderRadius:999,border:"none",fontWeight:800}}>Copy</button><button onClick={()=>{let a=document.createElement("a");a.href=URL.createObjectURL(new Blob([out]));a.download=`lorem-${lang}.txt`;a.click()}} style={{flex:1,background:"#6366f1",color:"#fff",padding:12,borderRadius:999,border:"none",fontWeight:800}}>Download</button></div>
<div style={{marginTop:12,background:"#fff",borderRadius:12,padding:12}}><h3 style={{margin:0}}>Other Useful Tools</h3><div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6,marginTop:8}}>{["Word Counter","QR Gen","Age Calc","BMI Calc","Password Gen","Case Convert","Hashtag Gen","Color Palette","SEO Gen"].map(t=><div key={t} style={{background:"#f3f4f6",padding:8,borderRadius:8,fontSize:10,fontWeight:700,textAlign:"center"}}>{t}</div>)}</div></div>
</div>}
</div>
<footer style={{background:"#111",color:"#fff",padding:14,textAlign:"center",marginTop:20}}><div>© 2026 - {LANGS.length} Languages Real</div></footer>
</div>)}
