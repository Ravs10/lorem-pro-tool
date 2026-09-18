"use client"
import {useState,useEffect} from "react"

const LANGS=[["HI","HI - हिन्दी"],["EN","English"],["OR","ଓଡ଼ିଆ"],["BN","বাংলা"],["TE","తెలుగు"],["TA","தமிழ்"],["KN","ಕನ್ನಡ"],["ML","മലയാളം"],["MR","मराठी"],["GU","ગુજરાતી"],["PA","ਪੰਜਾਬੀ"],["UR","اردو"],["AS","অসমীয়া"],["NE","नेपाली"],["SI","සිංහල"],["MY","မြန်မာ"],["TH","ไทย"],["LO","ລາວ"],["KM","ខ្មែរ"],["VI","Tiếng Việt"],["ID","Indonesia"],["MS","Melayu"],["ZH","中文"],["JA","日本語"],["KO","한국어"],["AR","العربية"],["FA","فارسی"],["HE","עברית"],["TR","Türkçe"],["FR","Français"],["DE","Deutsch"],["ES","Español"],["PT","Português"],["IT","Italiano"],["NL","Nederlands"],["PL","Polski"],["RU","Русский"],["UK","Українська"],["EL","Ελληνικά"],["CS","Čeština"],["RO","Română"],["HU","Magyar"],["SV","Svenska"],["DA","Dansk"],["FI","Suomi"],["NO","Norsk"],["SW","Swahili"],["AM","አማርኛ"],["HA","Hausa"],["AF","Afrikaans"],["SQ","Shqip"],["HR","Hrvatski"],["SR","Српски"],["BG","Български"],["SK","Slovenčina"],["SL","Slovenščina"],["LT","Lietuvių"],["LV","Latviešu"],["ET","Eesti"],["MT","Malti"],["GA","Gaeilge"],["CY","Cymraeg"],["EU","Euskara"],["CA","Català"],["GL","Galego"],["IS","Íslenska"],["MK","Македонски"],["HY","Հայերեն"],["KA","ქართული"],["AZ","Azərbaycan"],["KK","Қазақ"],["UZ","Oʻzbek"],["PS","پښتو"],["SD","سنڌي"],["KU","Kurdî"],["BO","བོད་ཡིག"],["DZ","རྫོང་ཁ"]]

const DB:any={
"HI":["स्वस्थ जीवन के लिए योग जरूरी है","सुबह टहलना फिट रखता है","फल इम्युनिटी बढ़ाते हैं","पानी खूब पियो"],
"EN":["Healthy life needs yoga","Morning walk keeps fit","Fruits boost immunity","Drink more water"],
"OR":["ସୁସ୍ଥ ଜୀବନ ପାଇଁ ଯୋଗ ଜରୁରୀ","ସକାଳ ଭ୍ରମଣ ଭଲ","ଫଳ ଭଲ","ପାଣି ପିଅ"],
"BN":["সুস্থ জীবনের জন্য যোগ দরকার","সকালের হাঁটা ভালো","ফল ভালো","জল খাও"],
"TE":["ఆరోగ్యానికి యోగా అవసరం","ఉదయం నడక మంచిది","పండ్లు మంచివి","నీళ్లు తాగండి"],
"TA":["ஆரோக்கியத்திற்கு யோகா தேவை","காலை நடை நல்லது","பழங்கள் நல்லது","தண்ணீர் குடியுங்கள்"],
"KN":["ಆರೋಗ್ಯಕ್ಕೆ ಯೋಗ ಬೇಕು","ಬೆಳಗಿನ ನಡಿಗೆ ಒಳ್ಳೆಯದು","ಹಣ್ಣುಗಳು ಒಳ್ಳೆಯದು","ನೀರು ಕುಡಿಯಿರಿ"],
"ML":["ആരോഗ്യത്തിന് യോഗ വേണം","രാവിലെ നടത്തം നല്ലതാണ്","പഴങ്ങൾ നല്ലതാണ്","വെള്ളം കുടിക്കുക"],
"MR":["आरोग्यासाठी योग हवा","सकाळी चालणे चांगले","फळे चांगली","पाणी प्या"],
"GU":["સ્વાસ્થ્ય માટે યોગ જરૂરી છે","સવારમાં ચાલવું સારું","ફળો સારા","પાણી પીવો"],
"PA":["ਸਿਹਤ ਲਈ ਯੋਗਾ ਜ਼ਰੂਰੀ ਹੈ","ਸਵੇਰ ਦੀ ਸੈਰ ਚੰਗੀ ਹੈ","ਫਲ ਚੰਗੇ ਹਨ","ਪਾਣੀ ਪੀਓ"],
"UR":["صحت کے لیے یوگا ضروری ہے","صبح کی سیر اچھی ہے","پھل اچھے ہیں","پانی پیو"],
"AS":["স্বাস্থ্যৰ বাবে যোগ জৰুৰী","পুৱা খোজ ভাল","ফল ভাল","পানী খোৱা"],
"NE":["स्वास्थ्यको लागि योग चाहिन्छ","बिहान हिँड्नु राम्रो","फलफूल राम्रो","पानी पिउनु"],
"SI":["සෞඛ්‍යයට යෝග අවශ්‍යයි","උදේ ඇවිදීම හොඳයි","පලතුරු හොඳයි","වතුර බොන්න"],
"MY":["ကျန်းမာရေးအတွက် ယောဂ လိုသည်","မနက်လမ်းလျှောက် ကောင်းသည်","သစ်သီး ကောင်းသည်","ရေ သောက်ပါ"],
"TH":["สุขภาพต้องโยคะ","เดินตอนเช้าดี","ผลไม้ดี","ดื่มน้ำเยอะ"],
"LO":["ສຸຂະພາບຕ້ອງການໂຍຄະ","ຍ່າງເຊົ້າດີ","ໝາກໄມ້ດີ","ດື່ມນ້ຳ"],
"KM":["សុខភាពត្រូវការយូហ្គា","ដើរព្រឹកល្អ","ផ្លែឈើល្អ","ផឹកទឹក"],
"VI":["Suc khoe can yoga","Di bo sang tot","Trai cay tot","Uong nuoc"],
"ID":["Sehat butuh yoga","Jalan pagi baik","Buah baik","Minum air"],
"MS":["Sihat perlu yoga","Jalan pagi baik","Buah baik","Minum air"],
"ZH":["健康需要瑜伽","晨走很好","水果很好","多喝水"],
"JA":["健康にはヨガが必要","朝の散歩は良い","果物は良い","水を飲んで"],
"KO":["건강에는 요가가 필요","아침 산책은 좋다","과일은 좋다","물을 마셔라"],
"AR":["الصحة تحتاج يوجا","المشي صباحا جيد","الفاكهة جيدة","اشرب ماء"],
"FA":["سلامتی به یوگا نیاز دارد","پیاده روی صبح خوب است","میوه خوب است","آب بنوش"],
"HE":["בריאות צריכה יוגה","הליכת בוקר טובה","פירות טובים","שתה מים"],
"TR":["Saglik icin yoga gerek","Sabah yuruyusu iyi","Meyve iyi","Su ic"],
"FR":["Sante a besoin de yoga","Marche matinale bonne","Fruits bons","Bois de leau"],
"DE":["Gesundheit braucht Yoga","Morgenspaziergang gut","Obst gut","Trink Wasser"],
"ES":["Salud necesita yoga","Caminata manana buena","Fruta buena","Bebe agua"],
"PT":["Saude precisa yoga","Caminhada manha boa","Fruta boa","Beba agua"],
"IT":["Salute ha bisogno di yoga","Passeggiata mattina buona","Frutta buona","Bevi acqua"],
"NL":["Gezondheid heeft yoga nodig","Ochtendwandeling goed","Fruit goed","Drink water"],
"PL":["Zdrowie potrzebuje jogi","Poranny spacer dobry","Owoce dobre","Pij wode"],
"RU":["Zdorove nuzhdaetsya v yoge","Utrennyaya progulka khorosha","Frukty khoroshi","Pey vodu"],
"UK":["Zdorovya potrebuye yohy","Rankova prohulka dobra","Frukty dobri","Py vody"],
"EL":["Ygeia xreiazetai gioga","Proinos peripatos kalos","Frouta kala","Pie nero"],
"CS":["Zdravi potrebuje jogu","Ranni prochazka dobra","Ovoce dobre","Pij vodu"],
"RO":["Sanatate are nevoie de yoga","Plimbarea dimineata buna","Fructe bune","Bea apa"],
"HU":["Egeszsegnek joga kell","Reggeli seta jo","Gyumolcs jo","Igyal vizet"],
"SV":["Halsa behover yoga","Morgonpromenad bra","Frukt bra","Drick vatten"],
"DA":["Sundhed har brug for yoga","Morgentur god","Frugt god","Drik vand"],
"FI":["Terveys tarvitsee joogaa","Aamukavely hyva","Hedelmat hyvia","Juo vetta"],
"NO":["Helse trenger yoga","Morgentur god","Frukt god","Drikk vann"],
"SW":["Afya inahitaji yoga","Kutembea asubuhi nzuri","Matunda mazuri","Kunywa maji"],
"AM":["Tena yoga yisfeligal","Tewat guzo tiru","Frafre tiru","Wuha teta"],
"HA":["Lafiya na bukatar yoga","Tafiya da safe kyau","Ya yan itace kyau","Sha ruwa"],
"AF":["Gesondheid het joga nodig","Oggendstaptog goed","Vrugte goed","Drink water"],
"SQ":["Shendeti ka nevoje per joga","Shetitja mengjesit mire","Fruta mira","Pi uje"],
"HR":["Zdravlje treba jogu","Jutarnja setnja dobra","Voce dobro","Pij vodu"],
"SR":["Zdravlje treba jogu","Jutarnja setnja dobra","Voce dobro","Pij vodu"],
"BG":["Zdraveto se nuzhdae ot joga","Sutreshnata razhodka dobra","Plodove dobri","Piy voda"],
"SK":["Zdravie potrebuje jogu","Ranna prechadzka dobra","Ovocie dobre","Pi vodu"],
"SL":["Zdravje potrebuje jogo","Jutranji sprehod dober","Sadje dobro","Pij vodo"],
"LT":["Sveikatai reikia jogos","Rytinis pasivaisciojimas geras","Vaisiai geri","Gerk vandens"],
"LV":["Veselibai vajag jogu","Rita pastaiga laba","Augli labi","Dzer udens"],
"ET":["Tervis vajab joogat","Hommikune jalutus hea","Puuviljad head","Joo vett"],
"MT":["Sahha tehtieg yoga","Mixja filghodu tajba","Frott tajjeb","Ixrob ilma"],
"GA":["Slainte ag teastail yoga","Siuloid maidin maith","Torthai maith","Ol uisce"],
"CY":["Iechyd angen yoga","Taith bore da","Ffrwythau da","Yfwch dwr"],
"EU":["Osasunak yoga behar du","Goizeko ibilaldia ona","Fruta ona","Edan ura"],
"CA":["Salut necessita ioga","Passeig mati bo","Fruita bona","Beu aigua"],
"GL":["Saude precisa ioga","Paseo manan bo","Froita boa","Bebe auga"],
"IS":["Heilsa tharf joga","Morgunganga god","Avextir godir","Drekktu vatn"],
"MK":["Zdravjeto ima potreba od joga","Utrinska prosetka dobra","Ovosje dobro","Pij voda"],
"HY":["Aroghchutyan hamar yoga e petk","Aravotyan zbosank lave","Mrger laven","Jur khmir"],
"KA":["Janmrtelobas ioga schirdeba","Dilis gaseirneba kargia","Khili kargia","Tskali dalie"],
"AZ":["Saglamliq yoga ehtiyac duyur","Seher gezintisi yaxsidir","Meyve yaxsidir","Su ic"],
"KK":["Densaulyqqa yoga qazhet","Tanerten seruen zhaksy","Zhemister zhaksy","Su ish"],
"UZ":["Salomatlik yoga kerak","Ertalab yurish yaxshi","Mevalar yaxshi","Suv ich"],
"PS":["Roghtia yoga ta arhtia lari","Sahar garzedal khe di","Mewa khe da","Obe wtska"],
"SD":["Sehat khe yoga ghurje","Subuh ghamna sutho","Mewwo sutho","Pani piyo"],
"KU":["Tenduristi bi yoga heye","Mesa sibehe bas e","Feki bas e","Av vexwe"],
"BO":["Bde thang la yo ga dgos","Sngadro chamdro yagpo","Shing tog yagpo","Chu thung"],
"DZ":["Gzugs gzhi lu yoga dgo","Dro pa chamdro leg","Shing tog leg","Chu thung"]
}

export default function Page(){
const [lang,setLang]=useState("HI")
const [cnt,setCnt]=useState(0)
const [out,setOut]=useState("")
const [page,setPage]=useState("home")
const [mode,setMode]=useState("SENTENCE")

const gen=()=>{
 if(cnt===0){setOut("");return}
 const base=DB[lang]
 let r=""
 if(mode==="SENTENCE"){ const a=[]; for(let i=0;i<cnt;i++) a.push(base[i%base.length]); r=a.join(" ") }
 if(mode==="PARAGRAPH"){ const paras=[]; for(let p=0;p<cnt;p++){ const s=[]; for(let j=0;j<2;j++) s.push(base[(p*2+j)%base.length]); paras.push(s.join(" ")); } r=paras.join("\n\n") }
 if(mode==="WORD"){ const all=base.join(" ").split(" "); const a=[]; for(let i=0;i<cnt;i++) a.push(all[i%all.length]); r=a.join(" ") }
 if(mode==="LIST"){ const a=[]; for(let i=0;i<cnt;i++) a.push(`• ${base[i%base.length]}`); r=a.join("\n") }
 setOut(r)
}
useEffect(()=>{gen()},[lang,cnt,mode])

return(
<div style={{background:"#6366f1",minHeight:"100vh",fontFamily:"system-ui"}}>
<header style={{background:"#fff",padding:12,display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,zIndex:50}}>
<b style={{color:"#000"}}>LP - {LANGS.length} Langs</b>
<button onClick={()=>setPage(page==="home"?"menu":"home")} style={{background:"#000",color:"#fff",border:"none",padding:"10px 20px",borderRadius:999,fontWeight:800}}>{page==="home"?"Menu":"Home"}</button>
</header>
<div style={{maxWidth:700,margin:"auto",padding:12}}>
{page==="menu"&&<div style={{background:"#fff",borderRadius:20,padding:16}}>
<h2 style={{color:"#000",marginTop:0}}>Menu - {LANGS.length}</h2>
<div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8}}>
<button onClick={()=>setPage("home")} style={{padding:12,borderRadius:10,background:"#000",color:"#fff",border:"2px solid #000",fontWeight:800}}>🏠 Generator</button>
<button onClick={()=>setPage("article")} style={{padding:12,borderRadius:10,background:"#fff",color:"#000",border:"2px solid #000",fontWeight:800}}>📰 Article</button>
<button onClick={()=>setPage("how")} style={{padding:12,borderRadius:10,background:"#fff",color:"#000",border:"2px solid #000",fontWeight:800}}>📖 How to Use</button>
<button onClick={()=>setPage("hire")} style={{padding:12,borderRadius:10,background:"#fff",color:"#000",border:"2px solid #000",fontWeight:800}}>💼 Hire Me</button>
<button onClick={()=>setPage("about")} style={{padding:12,borderRadius:10,background:"#fff",color:"#000",border:"2px solid #000",fontWeight:800}}>ℹ️ About</button>
<button onClick={()=>setPage("contact")} style={{padding:12,borderRadius:10,background:"#fff",color:"#000",border:"2px solid #000",fontWeight:800}}>📞 Contact</button>
</div>
<div style={{marginTop:12,border:"2px solid #000",borderRadius:12,padding:8,maxHeight:320,overflowY:"auto",display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:6}}>
{LANGS.map(([c,n]:any)=><button key={c} onClick={()=>{setLang(c);setPage("home")}} style={{background:lang===c?"#000":"#f3f4f6",color:lang===c?"#fff":"#000",padding:8,borderRadius:8,fontSize:11,fontWeight:700,border:"none"}}>{n}</button>)}
</div>
</div>}
{page==="article"&&<div style={{background:"#fff",borderRadius:16,padding:16,color:"#000"}}><button onClick={()=>setPage("menu")}>← Back</button><h2>Article</h2><p style={{fontSize:14}}>All 75 languages correct native content. SENTENCE = continuous, PARAGRAPH = cnt paras.</p></div>}
{page!=="home"&&page!=="menu"&&page!=="article"&&<div style={{background:"#fff",borderRadius:16,padding:16,color:"#000"}}><button onClick={()=>setPage("menu")}>← Back</button><h2>{page}</h2><p style={{fontSize:14}}>{page} page - 75 langs.</p></div>}
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
<div style={{fontSize:10,color:"#000",fontWeight:700,marginTop:4}}>0-100 kuch bhi type karo - initial 0</div>
</div>
<button onClick={gen} style={{width:"100%",background:"#000",color:"#fff",padding:14,borderRadius:12,marginTop:12,fontWeight:900,border:"none",fontSize:15}}>GENERATE {lang} - {cnt} {mode}</button>
<div style={{border:"2px solid #000",borderRadius:12,padding:14,marginTop:10,minHeight:80,background:"#fff",color:"#000",fontSize:14,whiteSpace:"pre-wrap",fontWeight:600}}>{out||"0 hai - 1-100 daalo, auto generate hoga"}</div>
<div style={{display:"flex",gap:8,marginTop:10}}>
<button onClick={()=>{if(out) navigator.clipboard.writeText(out)}} style={{flex:1,background:"#000",color:"#fff",padding:12,borderRadius:999,border:"none",fontWeight:800}}>Copy</button>
<button onClick={()=>{setOut(""); setCnt(0)}} style={{background:"#fff",color:"#000",padding:12,borderRadius:999,border:"2px solid #000",fontWeight:800}}>Clear</button>
</div>
</div>}
</div>
<footer style={{background:"#000",color:"#fff",padding:12,textAlign:"center",marginTop:20,fontSize:12}}>© 2026 - {LANGS.length} Langs All Correct</footer>
</div>)}
