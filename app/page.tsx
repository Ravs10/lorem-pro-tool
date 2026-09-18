"use client"
import {useState} from "react"
const DB:any={
"HI":["स्वस्थ जीवन के लिए रोज़ योग ज़रूरी है","सुबह टहलना शरीर को फिट रखता है","पानी खूब पीना चाहिए","जल्दी सोने से दिमाग तेज़ होता है","हरी सब्जियां खाना सेहत के लिए अच्छा है"],
"EN":["Healthy life needs daily yoga","Morning walk keeps body fit","Drink more water daily","Early to bed makes brain sharp","Green vegetables are good for health"],
"OR":["ସୁସ୍ଥ ଜୀବନ ପାଇଁ ରୋଜ ଯୋଗ ଜରୁରୀ","ସକାଳ ଭ୍ରମଣ ଶରୀରକୁ ଫିଟ ରଖେ","ପାଣି ଅଧିକ ପିଅନ୍ତୁ","ଶୀଘ୍ର ଶୋଇବା ବୁଦ୍ଧି ତୀକ୍ଷ୍ଣ କରେ","ସବୁଜ ପନିପରିବା ସ୍ୱାସ୍ଥ୍ୟ ପାଇଁ ଭଲ"],
"BN":["সুস্থ জীবনের জন্য রোজ যোগ জরুরি","সকালে হাঁটা শরীরকে ফিট রাখে","বেশি জল পান করুন","তাড়াতাড়ি ঘুমালে বুদ্ধি বাড়ে","সবুজ শাকসবজি স্বাস্থ্যের জন্য ভালো"],
"TE":["ఆరోగ్యకర జీవనానికి రోజూ యోగా అవసరం","ఉదయం నడక ఆరోగ్యానికి మంచిది","నీళ్లు ఎక్కువ తాగండి","త్వరగా నిద్రపోవడం మేధస్సును పెంచుతుంది","ఆకుకూరలు ఆరోగ్యానికి మంచిది"],
"TA":["ஆரோக்கியமான வாழ்க்கைக்கு தினமும் யோகா அவசியம்","காலை நடை உடலுக்கு நல்லது","தண்ணீர் அதிகம் குடியுங்கள்","சீக்கிரம் தூங்குவது மூளையை கூர்மையாக்கும்","கீரைகள் உடலுக்கு நல்லது"],
"KN":["ಆರೋಗ್ಯಕರ ಜೀವನಕ್ಕೆ ಪ್ರತಿದಿನ ಯೋಗ ಬೇಕು","ಬೆಳಗಿನ ನಡಿಗೆ ಆರೋಗ್ಯಕ್ಕೆ ಒಳ್ಳೆಯದು","ಹೆಚ್ಚು ನೀರು ಕುಡಿಯಿರಿ","ಬೇಗ ಮಲಗುವುದು ಬುದ್ಧಿವಂತಿಕೆ ಹೆಚ್ಚಿಸುತ್ತದೆ","ಸೊಪ್ಪು ತರಕಾರಿ ಆರೋಗ್ಯಕ್ಕೆ ಒಳ್ಳೆಯದು"],
"ML":["ആരോഗ്യകരമായ ജീവിതത്തിന് ദിവസവും യോഗ വേണം","രാവിലെ നടക്കുന്നത് ആരോഗ്യത്തിന് നല്ലതാണ്","വെള്ളം കൂടുതൽ കുടിക്കുക","പെട്ടെന്ന് ഉറങ്ങുന്നത് ബുദ്ധി കൂട്ടും","പച്ചക്കറികൾ ആരോഗ്യത്തിന് നല്ലതാണ്"],
"MR":["निरोगी जीवनासाठी दररोज योग हवा","सकाळी फिरणे शरीराला फिट ठेवते","पाणी जास्त प्या","लवकर झोपल्याने बुद्धी कुशाग्र होते","हिरव्या भाज्या आरोग्यासाठी चांगल्या"],
"GU":["સ્વસ્થ જીવન માટે રોજ યોગ જરૂરી છે","સવારમાં ચાલવું શરીરને ફિટ રાખે છે","પાણી વધુ પીવો","વહેલા સૂવાથી બુદ્ધિ તેજ થાય છે","લીલા શાકભાજી સ્વાસ્થ્ય માટે સારા છે"],
"PA":["ਸਿਹਤਮੰਦ ਜੀਵਨ ਲਈ ਰੋਜ਼ ਯੋਗਾ ਜ਼ਰੂਰੀ ਹੈ","ਸਵੇਰ ਦੀ ਸੈਰ ਸਿਹਤ ਲਈ ਚੰਗੀ ਹੈ","ਪਾਣੀ ਵੱਧ ਪੀਓ","ਜਲਦੀ ਸੌਣ ਨਾਲ ਦਿਮਾਗ ਤੇਜ਼ ਹੁੰਦਾ ਹੈ","ਹਰੀਆਂ ਸਬਜ਼ੀਆਂ ਸਿਹਤ ਲਈ ਚੰਗੀਆਂ ਹਨ"]
}

export default function Page(){
const [lang,setLang]=useState("HI")
const [cnt,setCnt]=useState(5)
const [out,setOut]=useState(DB["HI"].join("\n\n"))

const make=(l=lang,c=cnt)=>{
 let t=(DB[l]||DB.EN).slice(0,c).join("\n\n")
 setOut(t)
}

return(
<div style={{background:"#6366f1",minHeight:"100vh",padding:12,fontFamily:"system-ui"}}>
<div style={{maxWidth:600,margin:"auto",background:"#fff",borderRadius:20,padding:16,boxShadow:"0 10px 30px rgba(0,0,0,0.2)"}}>
<h2 style={{textAlign:"center",margin:"0 0 12px",color:"#111"}}>Lorem Pro - {lang}</h2>

<select value={lang} onChange={e=>{setLang(e.target.value); make(e.target.value,cnt)}} style={{width:"100%",padding:14,borderRadius:10,border:"2px solid #6366f1",fontWeight:700,color:"#000",background:"#fff",fontSize:16}}>
<option value="HI">HI - हिन्दी</option><option value="EN">EN - English</option><option value="OR">OR - ଓଡିଆ</option><option value="BN">BN - বাংলা</option><option value="TE">TE - తెలుగు</option><option value="TA">TA - தமிழ்</option><option value="KN">KN - ಕನ್ನಡ</option><option value="ML">ML - മലയാളം</option><option value="MR">MR - मराठी</option><option value="GU">GU - ગુજરાતી</option><option value="PA">PA - ਪੰਜਾਬੀ</option>
</select>

<div style={{marginTop:14,background:"#f3f4f6",padding:10,borderRadius:10}}>
<label style={{fontWeight:700,color:"#111",fontSize:14}}>कितने वाक्य चाहिए? - {cnt}</label>
<input type="range" min={1} max={5} value={cnt} onChange={e=>{let v=Number(e.target.value); setCnt(v); make(lang,v)}} style={{width:"100%",marginTop:6}}/>
</div>

<button onClick={()=>make(lang,cnt)} style={{width:"100%",background:"#111",color:"#fff",padding:14,borderRadius:12,marginTop:12,fontWeight:900,border:"none",fontSize:17}}>GENERATE {lang}</button>

<div style={{border:"2px solid #111",borderRadius:12,padding:14,marginTop:12,minHeight:150,background:"#fff",color:"#000",fontSize:16,lineHeight:"1.7",whiteSpace:"pre-wrap"}}>{out}</div>

<div style={{display:"flex",gap:8,marginTop:12}}>
<button onClick={()=>{navigator.clipboard.writeText(out);alert("Copied!")}} style={{flex:1,background:"#111",color:"#fff",padding:12,borderRadius:999,border:"none",fontWeight:800}}>Copy</button>
<button onClick={()=>{let a=document.createElement("a");a.href=URL.createObjectURL(new Blob([out],{type:"text/plain"}));a.download=`lorem-${lang}.txt`;a.click()}} style={{flex:1,background:"#6366f1",color:"#fff",padding:12,borderRadius:999,border:"none",fontWeight:800}}>Download</button>
</div>
</div>
</div>)}
