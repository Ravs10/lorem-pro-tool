"use client"
import {useState,useEffect} from "react"

const LANGS=[
["HI","HI - हिन्दी (India)"],["EN","English (USA/UK)"],["OR","ଓଡ଼ିଆ (India)"],
["BN","বাংলা (India/Bangladesh)"],["TE","తెలుగు (India)"],["TA","தமிழ் (India/Sri Lanka)"],
["KN","ಕನ್ನಡ (India)"],["ML","മലയാളം (India)"],["MR","मराठी (India)"],["GU","ગુજરાતી (India)"],
["PA","ਪੰਜਾਬੀ (India/Pak)"],["UR","اردو (Pakistan)"],["AS","অসমীয়া (India)"],
["NE","नेपाली (Nepal)"],["SI","සිංහල (Sri Lanka)"],["MY","မြန်မာ (Myanmar)"],
["TH","ไทย (Thailand)"],["LO","ລາວ (Laos)"],["KM","ខ្មែរ (Cambodia)"],
["VI","Tiếng Việt (Vietnam)"],["ID","Indonesia"],["MS","Melayu (Malaysia)"],
["TL","Filipino (Philippines)"],["ZH","中文 (China)"],["JA","日本語 (Japan)"],
["KO","한국어 (Korea)"],["AR","العربية (Saudi/UAE)"],["FA","فارسی (Iran)"],
["HE","עברית (Israel)"],["TR","Türkçe (Turkey)"],["FR","Français (France)"],
["DE","Deutsch (Germany)"],["ES","Español (Spain/Mexico)"],["PT","Português (Brazil/Portugal)"],
["IT","Italiano (Italy)"],["NL","Nederlands (Netherlands)"],["PL","Polski (Poland)"],
["RU","Русский (Russia)"],["UK","Українська (Ukraine)"],["EL","Ελληνικά (Greece)"],
["CS","Čeština (Czech)"],["RO","Română (Romania)"],["HU","Magyar (Hungary)"],
["SV","Svenska (Sweden)"],["DA","Dansk (Denmark)"],["FI","Suomi (Finland)"],
["NO","Norsk (Norway)"],["SW","Swahili (Kenya/Tanzania)"],["AM","አማርኛ (Ethiopia)"],
["HA","Hausa (Nigeria)"],["AF","Afrikaans (South Africa)"],["SQ","Shqip (Albania)"],
["HR","Hrvatski (Croatia)"],["SR","Српски (Serbia)"],["BG","Български (Bulgaria)"],
["SK","Slovenčina (Slovakia)"],["SL","Slovenščina (Slovenia)"],["LT","Lietuvių (Lithuania)"],
["LV","Latviešu (Latvia)"],["ET","Eesti (Estonia)"],["MT","Malti (Malta)"],
["GA","Gaeilge (Ireland)"],["CY","Cymraeg (Wales)"],["EU","Euskara (Basque)"],
["CA","Català (Spain)"],["GL","Galego (Spain)"],["IS","Íslenska (Iceland)"],
["MK","Македонски (Macedonia)"],["HY","Հայերեն (Armenia)"],["KA","ქართული (Georgia)"],
["AZ","Azərbaycan (Azerbaijan)"],["KK","Қазақ (Kazakhstan)"],["UZ","Oʻzbek (Uzbekistan)"],
["PS","پښتو (Afghanistan)"],["SD","سنڌي (Pakistan)"],["KU","Kurdî (Kurdistan)"],
["BO","བོད་ཡིག (Tibet)"],["DZ","རྫོང་ཁ (Bhutan)"]
]

const DB:any={
"HI":["स्वस्थ जीवन के लिए योग जरूरी है","सुबह टहलना फिट रखता है","फल इम्युनिटी बढ़ाते हैं","पानी खूब पियो","हरी सब्जियां अच्छी हैं"],
"EN":["Healthy life needs yoga","Morning walk keeps fit","Fruits boost immunity","Drink more water","Green vegetables are good"],
"OR":["ସୁସ୍ଥ ଜୀବନ ପାଇଁ ଯୋଗ ଜରୁରୀ","ସକାଳ ଭ୍ରମଣ ଭଲ","ଫଳ ଭଲ","ପାଣି ପିଅ","ସବୁଜ ପରିବା ଭଲ"],
"BN":["সুস্থ জীবনের জন্য যোগ দরকার","সকালের হাঁটা ভালো","ফল ভালো","জল খাও","সবুজ শাকসবজি ভালো"],
"TE":["ఆరోగ్యానికి యోగా అవసరం","ఉదయం నడక మంచిది","పండ్లు మంచివి","నీళ్లు తాగండి","ఆకుకూరలు మంచిది"],
"TA":["ஆரோக்கியத்திற்கு யோகா தேவை","காலை நடை நல்லது","பழங்கள் நல்லது","தண்ணீர் குடியுங்கள்","கீரைகள் நல்லது"],
"KN":["ಆರೋಗ್ಯಕ್ಕೆ ಯೋಗ ಬೇಕು","ಬೆಳಗಿನ ನಡಿಗೆ ಒಳ್ಳೆಯದು","ಹಣ್ಣುಗಳು ಒಳ್ಳೆಯದು","ನೀರು ಕುಡಿಯಿರಿ","ಸೊಪ್ಪು ಒಳ್ಳೆಯದು"],
"ML":["ആരോഗ്യത്തിന് യോഗ വേണം","രാവിലെ നടത്തം നല്ലതാണ്","പഴങ്ങൾ നല്ലതാണ്","വെള്ളം കുടിക്കുക","പച്ചക്കറികൾ നല്ലതാണ്"],
"MR":["आरोग्यासाठी योग हवा","सकाळी चालणे चांगले","फळे चांगली","पाणी प्या","हिरव्या भाज्या चांगल्या"],
"GU":["સ્વાસ્થ્ય માટે યોગ જરૂરી છે","સવારમાં ચાલવું સારું","ફળો સારા","પાણી પીવો","લીલા શાકભાજી સારા"],
"PA":["ਸਿਹਤ ਲਈ ਯੋਗਾ ਜ਼ਰੂਰੀ ਹੈ","ਸਵੇਰ ਦੀ ਸੈਰ ਚੰਗੀ ਹੈ","ਫਲ ਚੰਗੇ ਹਨ","ਪਾਣੀ ਪੀਓ","ਹਰੀਆਂ ਸਬਜ਼ੀਆਂ ਚੰਗੀਆਂ ਹਨ"],
"UR":["صحت کے لیے یوگا ضروری ہے","صبح کی سیر اچھی ہے","پھل اچھے ہیں","پانی پیو","سبز سبزیاں اچھی ہیں"],
"AS":["স্বাস্থ্যৰ বাবে যোগ জৰুৰী","পুৱা খোজ ভাল","ফল ভাল","পানী খোৱা","সেউজীয়া শাক ভাল"],
"NE":["स्वास्थ्यको लागि योग चाहिन्छ","बिहान हिँड्नु राम्रो","फलफूल राम्रो","पानी पिउनु","हरियो तरकारी राम्रो"],
"SI":["සෞඛ්‍යයට යෝග අවශ්‍යයි","උදේ ඇවිදීම හොඳයි","පලතුරු හොඳයි","වතුර බොන්න","එළවළු හොඳයි"],
"MY":["ကျန်းမာရေးအတွက် ယောဂ လိုသည်","မနက်လမ်းလျှောက် ကောင်းသည်","သစ်သီး ကောင်းသည်","ရေ သောက်ပါ","အသီးအရွက် ကောင်းသည်"],
"TH":["สุขภาพต้องโยคะ","เดินตอนเช้าดี","ผลไม้ดี","ดื่มน้ำเยอะ","ผักใบเขียวดี"],
"LO":["ສຸຂະພາບຕ້ອງການໂຍຄະ","ຍ່າງເຊົ້າດີ","ໝາກໄມ້ດີ","ດື່ມນ້ຳ","ຜັກດີ"],
"KM":["សុខភាពត្រូវការយូហ្គា","ដើរព្រឹកល្អ","ផ្លែឈើល្អ","ផឹកទឹក","បន្លែល្អ"],
"VI":["Suc khoe can yoga","Di bo sang tot","Trai cay tot","Uong nhieu nuoc","Rau xanh tot"],
"ID":["Sehat butuh yoga","Jalan pagi baik","Buah baik","Minum air banyak","Sayuran hijau baik"],
"MS":["Sihat perlu yoga","Jalan pagi baik","Buah baik","Minum banyak air","Sayur hijau baik"],
"TL":["Kalusugan nangangailangan ng yoga","Lakad sa umaga mabuti","Prutas mabuti","Uminom ng maraming tubig","Gulay na berde mabuti"],
"ZH":["健康需要瑜伽","晨走很好","水果很好","多喝水","绿叶蔬菜很好"],
"JA":["健康にはヨガが必要","朝の散歩は良い","果物は良い","水をたくさん飲んで","緑の野菜は良い"],
"KO":["건강에는 요가가 필요","아침 산책은 좋다","과일은 좋다","물을 많이 마셔라","녹색 채소는 좋다"],
"AR":["الصحة تحتاج يوجا","المشي صباحا جيد","الفاكهة جيدة","اشرب الكثير من الماء","الخضار الخضراء جيدة"],
"FA":["سلامتی به یوگا نیاز دارد","پیاده روی صبح خوب است","میوه خوب است","آب زیاد بنوش","سبزیجات سبز خوب است"],
"HE":["בריאות צריכה יוגה","הליכת בוקר טובה","פירות טובים","שתה הרבה מים","ירקות ירוקים טובים"],
"TR":["Saglik icin yoga gerek","Sabah yuruyusu iyi","Meyve iyi","Cok su ic","Yesil sebze iyi"],
"FR":["Sante a besoin de yoga","Marche matinale bonne","Fruits bons","Bois beaucoup deau","Legumes verts bons"],
"DE":["Gesundheit braucht Yoga","Morgenspaziergang gut","Obst gut","Trink viel Wasser","Grunes Gemuse gut"],
"ES":["Salud necesita yoga","Caminata matutina buena","Fruta buena","Bebe mucha agua","Verduras verdes buenas"],
"PT":["Saude precisa yoga","Caminhada manha boa","Fruta boa","Beba muita agua","Vegetais verdes bons"],
"IT":["Salute ha bisogno di yoga","Passeggiata mattutina buona","Frutta buona","Bevi molta acqua","Verdure verdi buone"],
"NL":["Gezondheid heeft yoga nodig","Ochtendwandeling goed","Fruit goed","Drink veel water","Groene groenten goed"],
"PL":["Zdrowie potrzebuje jogi","Poranny spacer dobry","Owoce dobre","Pij duzo wody","Zielone warzywa dobre"],
"RU":["Zdorove nuzhdaetsya v yoge","Utrennyaya progulka khorosha","Frukty khoroshi","Pey mnogo vody","Zelenye ovoshchi khoroshi"],
"UK":["Zdorovya potrebuye yohy","Rankova prohulka dobra","Frukty dobri","Py bahato vody","Zeleni ovochi dobri"],
"EL":["Ygeia xreiazetai gioga","Proinos peripatos kalos","Frouta kala","Pie poly nero","Prasina laxanika kala"],
"CS":["Zdravi potrebuje jogu","Ranni prochazka dobra","Ovoce dobre","Pij hodne vody","Zelena zelenina dobra"],
"RO":["Sanatate are nevoie de yoga","Plimbarea dimineata buna","Fructe bune","Bea multa apa","Legume verzi bune"],
"HU":["Egeszsegnek joga kell","Reggeli seta jo","Gyumolcs jo","Igyal sok vizet","Zold zoldseg jo"],
"SV":["Halsa behover yoga","Morgonpromenad bra","Frukt bra","Drick mycket vatten","Grona gronsaker bra"],
"DA":["Sundhed har brug for yoga","Morgentur god","Frugt god","Drik meget vand","Gronne grontsager gode"],
"FI":["Terveys tarvitsee joogaa","Aamukavely hyva","Hedelmat hyvia","Juo paljon vetta","Vihreät vihannekset hyvia"],
"NO":["Helse trenger yoga","Morgentur god","Frukt god","Drikk mye vann","Gronne gronnsaker gode"],
"SW":["Afya inahitaji yoga","Kutembea asubuhi nzuri","Matunda mazuri","Kunywa maji mengi","Mboga za kijani nzuri"],
"AM":["Tena yoga yisfeligal","Tewat guzo tiru","Frafre tiru","Bizu wuha teta","Arengwade tiru"],
"HA":["Lafiya na bukatar yoga","Tafiya da safe kyau","Ya yan itace kyau","Sha ruwa da yawa","Ganyen kore kyau"],
"AF":["Gesondheid het joga nodig","Oggendstaptog goed","Vrugte goed","Drink baie water","Groen groente goed"],
"SQ":["Shendeti ka nevoje per joga","Shetitja mengjesit mire","Fruta mira","Pi shume uje","Perime jeshile mira"],
"HR":["Zdravlje treba jogu","Jutarnja setnja dobra","Voce dobro","Pij puno vode","Zeleno povrce dobro"],
"SR":["Zdravlje treba jogu","Jutarnja setnja dobra","Voce dobro","Pij puno vode","Zeleno povrce dobro"],
"BG":["Zdraveto se nuzhdae ot joga","Sutreshnata razhodka dobra","Plodove dobri","Piy mnogo voda","Zeleni zelenchutsi dobri"],
"SK":["Zdravie potrebuje jogu","Ranna prechadzka dobra","Ovocie dobre","Pi vela vody","Zelena zelenina dobra"],
"SL":["Zdravje potrebuje jogo","Jutranji sprehod dober","Sadje dobro","Pij veliko vode","Zelena zelenjava dobra"],
"LT":["Sveikatai reikia jogos","Rytinis pasivaisciojimas geras","Vaisiai geri","Gerk daug vandens","Zalios darzoves geros"],
"LV":["Veselibai vajag jogu","Rita pastaiga laba","Augli labi","Dzer daudz udens","Zali darzeni labi"],
"ET":["Tervis vajab joogat","Hommikune jalutus hea","Puuviljad head","Joo palju vett","Rohelised koogiviljad head"],
"MT":["Sahha tehtieg yoga","Mixja filghodu tajba","Frott tajjeb","Ixrob hafna ilma","Haxix ahdar tajjeb"],
"GA":["Slainte ag teastail yoga","Siuloid maidin maith","Torthai maith","Ol go leor uisce","Glasrai maith"],
"CY":["Iechyd angen yoga","Taith bore da","Ffrwythau da","Yfwch ddigon o ddwr","Llysiau gwyrdd da"],
"EU":["Osasunak yoga behar du","Goizeko ibilaldia ona","Fruta ona","Edan ur asko","Barazki berdeak onak"],
"CA":["Salut necessita ioga","Passeig mati bo","Fruita bona","Beu molta aigua","Verdures verdes bones"],
"GL":["Saude precisa ioga","Paseo manan bo","Froita boa","Bebe moita auga","Verduras verdes boas"],
"IS":["Heilsa tharf joga","Morgunganga god","Avextir godir","Drekktu mikinn vatn","Graent graenmeti gott"],
"MK":["Zdravjeto ima potreba od joga","Utrinska prosetka dobra","Ovosje dobro","Pij mnogu voda","Zelen zelenchuk dobar"],
"HY":["Aroghchutyan hamar yoga e petk","Aravotyan zbosank lave","Mrger laven","Shat jur khmir","Kanach banjaregh lave"],
"KA":["Janmrtelobas ioga schirdeba","Dilis gaseirneba kargia","Khili kargia","Bevri tskali dalie","Mtsvane bostneuli kargia"],
"AZ":["Saglamliq yoga ehtiyac duyur","Seher gezintisi yaxsidir","Meyve yaxsidir","Cox su ic","Yasil terevez yaxsidir"],
"KK":["Densaulyqqa yoga qazhet","Tanerten seruen zhaksy","Zhemister zhaksy","Kop su ish","Zhasyl kokonister zhaksy"],
"UZ":["Salomatlik yoga kerak","Ertalab yurish yaxshi","Mevalar yaxshi","Kop suv ich","Yashil sabzavotlar yaxshi"],
"PS":["Roghtia yoga ta arhtia lari","Sahar garzedal khe di","Mewa khe da","Dere obe wtska","Shne sabzi khe da"],
"SD":["Sehat khe yoga ghurje","Subuh ghamna sutho aahe","Mewwo sutha aahin","Ghanu pani piyo","Sabz bhajiyun suthiyun"],
"KU":["Tenduristi bi yoga heye","Mesa sibehe bas e","Feki bas e","Gelek av vexwe","Sebzeyên kesk bas e"],
"BO":["Bde thang la yo ga dgos","Sngadro chamdro yagpo","Shing tog yagpo","Chu mangpo thung","Tshodma yagpo"],
"DZ":["Gzugs gzhi lu yoga dgo","Dro pa chamdro leg","Shing tog leg","Chu mang thung","Tshodma leg"]
}

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

const words = out.trim()?out.trim().split(/\s+/).length:0
const chars = out.length
const charsNoSpace = out.replace(/\s/g,"").length
const sentences = out.trim()?out.split(/[.!?।|。]/).filter(s=>s.trim().length>2).length:0
const paras = out.trim()?out.split("\n\n").filter(b=>b.trim()).length:0
const reading = words>0?Math.max(1,Math.ceil(words/200)):0

const doDownload=(type:string)=>{
 if(!out) return
 let content=out
 if(type==="HTML") content=`<!DOCTYPE html><html><body><p>${out.replace(/\n\n/g,"</p><p>")}</p></body></html>`
 if(type==="JSON") content=JSON.stringify({language:lang,count:cnt,mode,words,chars,text:out},null,2)
 if(type==="CSV") content=`language,count,text\n${lang},${cnt},"${out.replace(/"/g,'""')}"`
 if(type==="MD") content=`# LoremPro ${lang}\n\n${out}`
 if(type==="JS") content=`const text=\`${out}\`;`
 if(type==="RTF") content=`{\\rtf1 ${out}}`
 const blob=new Blob([content],{type:"text/plain"})
 const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=`lorempro-${lang}-${cnt}.${type.toLowerCase()}`; a.click()
 setShowDL(false)
}

const Wrap=({t,children}:any)=><div style={{background:"#fff",borderRadius:20,padding:20,color:"#000",lineHeight:1.7}}><button onClick={()=>setPage("menu")} style={{padding:"8px 16px",borderRadius:999,border:"2px solid #000",background:"#fff",fontWeight:800}}>← Back</button><h1 style={{fontSize:20,marginTop:10}}>{t}</h1><div style={{fontSize:14}}>{children}</div></div>

return(
<div style={{background:"#6366f1",minHeight:"100vh",fontFamily:"system-ui"}}>
<header style={{background:"#fff",padding:12,display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,zIndex:50}}>
<b style={{color:"#000"}}>LP - {LANGS.length} Langs ✅</b>
<button onClick={()=>setPage(page==="home"?"menu":"home")} style={{background:"#000",color:"#fff",border:"none",padding:"10px 20px",borderRadius:999,fontWeight:800}}>{page==="home"?"Menu":"Home"}</button>
</header>
<div style={{maxWidth:720,margin:"auto",padding:12}}>
{page==="menu"&&<div style={{background:"#fff",borderRadius:20,padding:16}}>
<h2 style={{color:"#000",marginTop:0}}>Menu - {LANGS.length} Popular Countries</h2>
<div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8}}>
{[
["home","🏠 Generator"],["how","📖 How to Use"],["about","ℹ️ About"],
["contact","📞 Contact"],["privacy","🔒 Privacy"],["disclaimer","⚠️ Disclaimer"],
].map(([k,l]:any)=><button key={k} onClick={()=>setPage(k)} style={{padding:12,borderRadius:10,background:k==="home"?"#000":"#fff",color:k==="home"?"#fff":"#000",border:"2px solid #000",fontWeight:800,fontSize:13}}>{l}</button>)}
</div>
<div style={{marginTop:12,border:"2px solid #000",borderRadius:12,padding:8,maxHeight:350,overflowY:"auto",display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:6}}>
{LANGS.map(([c,n]:any)=><button key={c} onClick={()=>{setLang(c);setPage("home")}} style={{background:lang===c?"#000":"#f3f4f6",color:lang===c?"#fff":"#000",padding:8,borderRadius:8,fontSize:11,fontWeight:700,border:"none"}}>{n}</button>)}
</div>
</div>}

{page==="about"&&<Wrap t="About Us"><p>LoremPro 75+ languages - India se bana hua duniya ka sabse bada Lorem tool.</p><p>Popular countries: India, USA, UK, Japan, China, Russia, France, Germany, Brazil, Saudi, Philippines, Nepal etc sab cover.</p></Wrap>}
{page==="how"&&<Wrap t="How to Use"><p>1. Language select karo (popular desho ke naam ke saath)<br/>2. Mode: SENTENCE continuous, PARAGRAPH variable 2-4 lines<br/>3. Counter 0-100 free<br/>4. Generate - auto bhi hota hai</p></Wrap>}
{page==="contact"&&<Wrap t="Contact"><p>Email: lorempro75@gmail.com<br/>Raebareli, UP, India</p></Wrap>}
{page==="privacy"&&<Wrap t="Privacy Policy"><p>Hum koi data collect nahi karte. Saara text browser me banta hai.</p></Wrap>}
{page==="disclaimer"&&<Wrap t="Disclaimer"><p>Ye dummy text hai, testing ke liye. Koi warranty nahi.</p></Wrap>}

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
<button onClick={gen} style={{width:"100%",background:"#000",color:"#fff",padding:14,borderRadius:12,marginTop:12,fontWeight:900,border:"none"}}>GENERATE {lang} - {cnt} {mode}</button>

<div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginTop:12}}>
<div style={{background:"#dbeafe",padding:10,borderRadius:12,textAlign:"center",border:"2px solid #000"}}><div style={{fontSize:18,fontWeight:900,color:"#000"}}>{words}</div><div style={{fontSize:9,fontWeight:800,color:"#000"}}>WORDS ✅</div></div>
<div style={{background:"#fef9c3",padding:10,borderRadius:12,textAlign:"center",border:"2px solid #000"}}><div style={{fontSize:18,fontWeight:900,color:"#000"}}>{chars}</div><div style={{fontSize:9,fontWeight:800,color:"#000"}}>CHARS ✅</div></div>
<div style={{background:"#dcfce7",padding:10,borderRadius:12,textAlign:"center",border:"2px solid #000"}}><div style={{fontSize:18,fontWeight:900,color:"#000"}}>{sentences||paras}</div><div style={{fontSize:9,fontWeight:800,color:"#000"}}>SENT ✅</div></div>
<div style={{background:"#fce7f3",padding:10,borderRadius:12,textAlign:"center",border:"2px solid #000"}}><div style={{fontSize:18,fontWeight:900,color:"#000"}}>{paras||sentences}</div><div style={{fontSize:9,fontWeight:800,color:"#000"}}>PARA ✅</div></div>
</div>
<div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8,marginTop:8}}>
<div style={{background:"#fff",padding:8,borderRadius:10,textAlign:"center",border:"1px dashed #000",fontSize:11,fontWeight:700,color:"#000"}}>No Space: {charsNoSpace}</div>
<div style={{background:"#fff",padding:8,borderRadius:10,textAlign:"center",border:"1px dashed #000",fontSize:11,fontWeight:700,color:"#000"}}>Reading: {reading} min</div>
</div>

<div style={{border:"2px solid #000",borderRadius:12,padding:14,marginTop:12,minHeight:90,background:"#fff",color:"#000",fontSize:14,whiteSpace:"pre-wrap",fontWeight:600,lineHeight:mode==="SENTENCE"?1.4:1.8}}>{out||"0 hai - 1-100 daalo, auto generate"}</div>

<div style={{display:"flex",gap:8,marginTop:10}}>
<button onClick={()=>{if(!out) return; navigator.clipboard.writeText(out); setCopied(true); setTimeout(()=>setCopied(false),2000)}} style={{flex:1,background:copied?"#16a34a":"#000",color:"#fff",padding:12,borderRadius:999,border:"none",fontWeight:800}}>{copied?"Copied ✅":"Copy"}</button>
<button onClick={()=>{setOut(""); setCnt(0)}} style={{background:"#fff",color:"#000",padding:12,borderRadius:999,border:"2px solid #000",fontWeight:800}}>Clear</button>
</div>

<div style={{marginTop:12,position:"relative"}}>
<button onClick={()=>setShowDL(!showDL)} style={{width:"100%",padding:14,borderRadius:12,background:"linear-gradient(90deg,#f43f5e,#8b5cf6,#3b82f6)",color:"#fff",border:"2px solid #000",fontWeight:900}}>📥 DOWNLOAD - 8 Types {showDL?"▲":"▼"}</button>
{showDL&&<div style={{position:"absolute",top:"56px",left:0,right:0,background:"#fff",border:"2px solid #000",borderRadius:14,zIndex:20,overflow:"hidden"}}>
{["TXT","HTML","JSON","CSV","MD","JS","RTF","PDF"].map(code=><button key={code} onClick={()=>doDownload(code)} style={{width:"100%",padding:12,background:"#fff",color:"#000",border:"none",borderBottom:"1px solid #eee",fontWeight:800,textAlign:"left",fontSize:12}}>{code} - Download.{code.toLowerCase()}</button>)}
</div>}
</div>
</div>}
</div>
<footer style={{background:"#000",color:"#fff",padding:16,marginTop:20,textAlign:"center",fontSize:11}}>© 2026 LoremPro {LANGS.length} - All Languages Fixed ✅ | Words:{words} Chars:{chars} Tested</footer>
</div>)}
