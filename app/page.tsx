"use client"
import {useState,useEffect} from "react"

const LANGS=[["HI","HI - हिन्दी"],["EN","English"],["OR","ଓଡ଼ିଆ"],["BN","বাংলা"],["TE","తెలుగు"],["TA","தமிழ்"],["KN","ಕನ್ನಡ"],["ML","മലയാളം"],["MR","मराठी"],["GU","ગુજરાતી"],["PA","ਪੰਜਾਬੀ"],["UR","اردو"],["AS","অসমীয়া"],["NE","नेपाली"],["SI","සිංහල"],["MY","မြန်မာ"],["TH","ไทย"],["LO","ລາວ"],["KM","ខ្មែរ"],["VI","Tiếng Việt"],["ID","Indonesia"],["MS","Melayu"],["ZH","中文"],["JA","日本語"],["KO","한국어"],["AR","العربية"],["FA","فارسی"],["HE","עברית"],["TR","Türkçe"],["FR","Français"],["DE","Deutsch"],["ES","Español"],["PT","Português"],["IT","Italiano"],["NL","Nederlands"],["PL","Polski"],["RU","Русский"],["UK","Українська"],["EL","Ελληνικά"],["CS","Čeština"],["RO","Română"],["HU","Magyar"],["SV","Svenska"],["DA","Dansk"],["FI","Suomi"],["NO","Norsk"],["SW","Swahili"],["AM","አማርኛ"],["HA","Hausa"],["AF","Afrikaans"],["SQ","Shqip"],["HR","Hrvatski"],["SR","Српски"],["BG","Български"],["SK","Slovenčina"],["SL","Slovenščina"],["LT","Lietuvių"],["LV","Latviešu"],["ET","Eesti"],["MT","Malti"],["GA","Gaeilge"],["CY","Cymraeg"],["EU","Euskara"],["CA","Català"],["GL","Galego"],["IS","Íslenska"],["MK","Македонски"],["HY","Հայերեն"],["KA","ქართული"],["AZ","Azərbaycan"],["KK","Қазақ"],["UZ","Oʻzbek"],["PS","پښتو"],["SD","سنڌي"],["KU","Kurdî"],["BO","བོད་ཡིག"],["DZ","རྫོང་ཁ"]]

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
"PA":["ਸਿਹਤ ਲਈ ਯੋਗਾ ਜ਼ਰੂਰੀ ਹੈ","ਸਵੇਰ ਦੀ ਸੈਰ ਚੰਗੀ ਹੈ","ਫਲ ਚੰਗੇ ਹਨ","ਪਾਣੀ ਪੀਓ","ਹਰੀਆਂ ਸਬਜ਼ੀਆਂ ਚੰਗੀਆਂ"],
"UR":["صحت کے لیے یوگا ضروری ہے","صبح کی سیر اچھی ہے","پھل اچھے ہیں","پانی پیو","سبز سبزیاں اچھی ہیں"],
"AS":["স্বাস্থ্যৰ বাবে যোগ জৰুৰী","পুৱা খোজ ভাল","ফল ভাল","পানী খোৱা","সেউজীয়া শাক ভাল"],
"NE":["स्वास्थ्यको लागि योग चाहिन्छ","बिहान हिँड्नु राम्रो","फलफूल राम्रो","पानी पिउनु","हरियो तरकारी राम्रो"],
"SI":["සෞඛ්‍යයට යෝග අවශ්‍යයි","උදේ ඇවිදීම හොඳයි","පලතුරු හොඳයි","වතුර බොන්න","කොළ එළවළු හොඳයි"],
"MY":["ကျန်းမာရေးအတွက် ယောဂ လိုသည်","မနက်လမ်းလျှောက် ကောင်းသည်","သစ်သီး ကောင်းသည်","ရေ သောက်ပါ","အစိမ်းရွက် ကောင်းသည်"],
"TH":["สุขภาพต้องโยคะ","เดินตอนเช้าดี","ผลไม้ดี","ดื่มน้ำเยอะ","ผักเขียวดี"],
"LO":["ສຸຂະພາບຕ້ອງການໂຍຄະ","ຍ່າງເຊົ້າດີ","ໝາກໄມ້ດີ","ດື່ມນ້ຳຫຼາຍ","ຜັກຂຽວດີ"],
"KM":["សុខភាពត្រូវការយូហ្គា","ដើរព្រឹកល្អ","ផ្លែឈើល្អ","ផឹកទឹកច្រើន","បន្លែបៃតងល្អ"],
"VI":["Suc khoe can yoga","Di bo sang tot","Trai cay tot","Uong nhieu nuoc","Rau xanh tot"],
"ID":["Sehat butuh yoga","Jalan pagi baik","Buah baik","Minum banyak air","Sayur hijau baik"],
"MS":["Sihat perlu yoga","Jalan pagi baik","Buah baik","Minum banyak air","Sayur hijau baik"],
"ZH":["健康需要瑜伽","晨走很好","水果很好","多喝水","绿色蔬菜很好"],
"JA":["健康にはヨガが必要","朝の散歩は良い","果物は良い","水を飲んで","緑の野菜は良い"],
"KO":["건강에는 요가가 필요","아침 산책은 좋다","과일은 좋다","물을 마셔라","녹색 채소는 좋다"],
"AR":["الصحة تحتاج يوجا","المشي صباحا جيد","الفاكهة جيدة","اشرب ماء","الخضار جيدة"],
"FA":["سلامتی به یوگا نیاز دارد","پیاده روی صبح خوب است","میوه خوب است","آب بنوش","سبزی سبز خوب است"],
"HE":["בריאות צריכה יוגה","הליכת בוקר טובה","פירות טובים","שתה מים","ירקות ירוקים טובים"],
"TR":["Saglik icin yoga gerek","Sabah yuruyusu iyi","Meyve iyi","Su ic","Yesil sebze iyi"],
"FR":["Sante a besoin de yoga","Marche matinale bonne","Fruits bons","Bois de leau","Legumes verts bons"],
"DE":["Gesundheit braucht Yoga","Morgenspaziergang gut","Obst gut","Trink Wasser","Gruenes Gemuese gut"],
"ES":["Salud necesita yoga","Caminata manana buena","Fruta buena","Bebe agua","Verdura verde buena"],
"PT":["Saude precisa yoga","Caminhada manha boa","Fruta boa","Beba agua","Verdura verde boa"],
"IT":["Salute ha bisogno di yoga","Passeggiata mattina buona","Frutta buona","Bevi acqua","Verdura verde buona"],
"NL":["Gezondheid heeft yoga nodig","Ochtendwandeling goed","Fruit goed","Drink water","Groene groente goed"],
"PL":["Zdrowie potrzebuje jogi","Poranny spacer dobry","Owoce dobre","Pij wode","Zielone warzywa dobre"],
"RU":["Zdorove nuzhdaetsya v yoge","Utrennyaya progulka khorosha","Frukty khoroshi","Pey vodu","Zelenye ovoshchi khoroshi"],
"UK":["Zdorovya potrebuye yohy","Rankova prohulka dobra","Frukty dobri","Py vody","Zeleni ovochi dobri"],
"EL":["Ygeia xreiazetai gioga","Proinos peripatos kalos","Frouta kala","Pie nero","Prasina laxanika kala"],
"CS":["Zdravi potrebuje jogu","Ranni prochazka dobra","Ovoce dobre","Pij vodu","Zelena zelenina dobra"],
"RO":["Sanatate are nevoie de yoga","Plimbarea dimineata buna","Fructe bune","Bea apa","Legume verzi bune"],
"HU":["Egeszsegnek joga kell","Reggeli seta jo","Gyumolcs jo","Igyal vizet","Zold zoldseg jo"],
"SV":["Halsa behover yoga","Morgonpromenad bra","Frukt bra","Drick vatten","Grona gronsaker bra"],
"DA":["Sundhed har brug for yoga","Morgentur god","Frugt god","Drik vand","Gronne grontsager gode"],
"FI":["Terveys tarvitsee joogaa","Aamukavely hyva","Hedelmat hyvia","Juo vetta","Vihreat vihannekset hyvia"],
"NO":["Helse trenger yoga","Morgentur god","Frukt god","Drikk vann","Gronne gronnsaker gode"],
"SW":["Afya inahitaji yoga","Kutembea asubuhi nzuri","Matunda mazuri","Kunywa maji","Mboga kijani nzuri"],
"AM":["Tena yoga yisfeligal","Tewat yegir guzo tiru","Frafre tiru","Bizu wuha teta","Arenguaye atikilt tiru"],
"HA":["Lafiya na bukatar yoga","Tafiya da safe mai kyau","Ya'yan itace mai kyau","Sha ruwa","Koren kayan lambu mai kyau"],
"AF":["Gesondheid het joga nodig","Oggendstaptog goed","Vrugte goed","Drink water","Groen groente goed"],
"SQ":["Shendeti ka nevoje per joga","Shetitja mengjesit mire","Fruta mira","Pi uje","Perime jeshile mira"],
"HR":["Zdravlje treba jogu","Jutarnja setnja dobra","Voce dobro","Pij vodu","Zeleno povrce dobro"],
"SR":["Zdravlje treba jogu","Jutarnja setnja dobra","Voce dobro","Pij vodu","Zeleno povrce dobro"],
"BG":["Zdraveto se nuzhdae ot joga","Sutreshnata razhodka dobra","Plodove dobri","Piy voda","Zeleni zelenchutsi dobri"],
"SK":["Zdravie potrebuje jogu","Ranna prechadzka dobra","Ovocie dobre","Pi vodu","Zelena zelenina dobra"],
"SL":["Zdravje potrebuje jogo","Jutranji sprehod dober","Sadje dobro","Pij vodo","Zelena zelenjava dobra"],
"LT":["Sveikatai reikia jogos","Rytinis pasivaisciojimas geras","Vaisiai geri","Gerk vandens","Zalios darzoves geros"],
"LV":["Veselibai vajag jogu","Rita pastaiga laba","Augli labi","Dzer udens","Zali darzeni labi"],
"ET":["Tervis vajab joogat","Hommikune jalutus hea","Puuviljad head","Joo vett","Rohelised koogiviljad head"],
"MT":["Sahha tehtieg yoga","Mixja filghodu tajba","Frott tajjeb","Ixrob ilma","Haxix ahdar tajjeb"],
"GA":["Slainte ag teastail yoga","Siuloid maidin maith","Torthai maith","Ol uisce","Glasrai glasa maith"],
"CY":["Iechyd angen yoga","Taith bore da","Ffrwythau da","Yfwch dwr","Llysiau gwyrdd da"],
"EU":["Osasunak yoga behar du","Goizeko ibilaldia ona","Fruta ona","Edan ura","Barazki berdeak onak"],
"CA":["Salut necessita ioga","Passeig mati bo","Fruita bona","Beu aigua","Verdura verda bona"],
"GL":["Saude precisa ioga","Paseo manan bo","Froita boa","Bebe auga","Verdura verde boa"],
"IS":["Heilsa tharf joga","Morgunganga god","Avextir godir","Drekktu vatn","Graent graenmeti gott"],
"MK":["Zdravjeto ima potreba od joga","Utrinska prosetka dobra","Ovosje dobro","Pij voda","Zelen zelencuk dobar"],
"HY":["Aroghchutyan hamar yoga e petk","Aravotyan zbosank lave","Mrger laven","Shat jur khmir","Kanach banjaregh lav e"],
"KA":["Janmrtelobas ioga schirdeba","Dilis gaseirneba kargia","Khili kargia","Bevri tskali dalie","Mtsvane bostneuli kargia"],
"AZ":["Saglamliq yoga ehtiyac duyur","Seher gezintisi yaxsidir","Meyve yaxsidir","Su ic","Yasil terevez yaxsidir"],
"KK":["Densaulyqqa yoga qazhet","Tanerten seruen zhaksy","Zhemister zhaksy","Su ish","Zhasyl kokonister zhaksy"],
"UZ":["Salomatlik yoga kerak","Ertalab yurish yaxshi","Mevalar yaxshi","Suv ich","Yashil sabzavot yaxshi"],
"PS":["Roghtia yoga ta arhtia lari","Sahar garzedal khe di","Mewa khe da","Obe wtska","Shne sabe khe da"],
"SD":["Sehat khe yoga ghurje","Subuh ghamna sutho","Mewwo sutho","Pani piyo","Sao bhajiyon sutho"],
"KU":["Tenduristi pêdivî bi yoga heye","Mesa sibehe bas e","Feki bas e","Av vexwe","Sebzeyen kesk bas in"],
"BO":["Bde thang la yo ga dgos","Sngadro chamdro yagpo","Shing tog yagpo","Chu thung","Tsotshal yagpo"],
"DZ":["Gzugs gzhi lu yoga dgo","Dro pa chamdro leg","Shing tog leg","Chu thung","Tshol leg"]
}

export default function Page(){
const [lang,setLang]=useState("HI")
const [cnt,setCnt]=useState(0)
const [out,setOut]=useState("")
const [page,setPage]=useState("home")
const [mode,setMode]=useState("SENTENCE")
const [copied,setCopied]=useState(false)

const gen=()=>{
 if(cnt===0){setOut("");return}
 let base=DB[lang]||DB.EN
 let big=[]; for(let i=0;i<cnt;i++) big.push(base[i%base.length])
 let r=""
 if(mode==="SENTENCE"){ r=big.join(" ") }
 if(mode==="PARAGRAPH"){
   let paras=[]; for(let i=0;i<big.length;i+=3){ paras.push(big.slice(i,i+3).join(" ")) }
   r=paras.join("\n\n")
 }
 if(mode==="WORD"){ r=big.join(" ").split(" ").slice(0,cnt).join(" ") }
 if(mode==="LIST"){ r=big.map((x:string)=>"• "+x).join("\n") }
 setOut(r)
}
useEffect(()=>{gen()},[lang,cnt,mode])

const words=out?out.split(/\s+/).filter(Boolean).length:0
const chars=out.length

const download=(type:string)=>{
 if(!out) return
 let content=out; let ext="txt"
 if(type==="HTML") content=`<p>${out}</p>`
 if(type==="JSON") content=JSON.stringify({lang,cnt,text:out},null,2)
 if(type==="MD") content=`# ${lang}\n${out}`
 if(type==="CSV") content=out.split(" ").map(s=>`"${s}"`).join(",")
 let a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([content])); a.download=`lorem-${lang}.${ext.toLowerCase()}`; a.click()
}

return(
<div style={{background:"#6366f1",minHeight:"100vh",fontFamily:"system-ui"}}>
<header style={{background:"#fff",padding:12,display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,zIndex:50}}>
<b style={{color:"#000"}}>LP - {LANGS.length} Langs</b>
<button onClick={()=>setPage(page==="home"?"menu":"home")} style={{background:"#000",color:"#fff",border:"none",padding:"10px 20px",borderRadius:999,fontWeight:800}}>{page==="home"?"Menu":"Home"}</button>
</header>

<div style={{maxWidth:700,margin:"auto",padding:12}}>

{page==="menu"&&<div style={{background:"#fff",borderRadius:20,padding:16}}>
<h2 style={{color:"#000",marginTop:0}}>Menu - {LANGS.length} Languages</h2>
<div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8}}>
{[
["home","🏠 Generator"],["how","📖 How to Use"],["article","📰 Article"],["hire","💼 Hire Me"],["about","ℹ️ About"],["contact","📞 Contact"],["privacy","🔒 Privacy"]
].map(([k,l]:any)=><button key={k} onClick={()=>setPage(k)} style={{padding:12,borderRadius:10,background:k==="home"?"#000":"#fff",color:k==="home"?"#fff":"#000",border:"2px solid #000",fontWeight:800}}>{l}</button>)}
</div>
<div style={{marginTop:12,border:"2px solid #000",borderRadius:12,padding:8,maxHeight:320,overflowY:"auto",display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:6}}>
{LANGS.map(([c,n]:any)=><button key={c} onClick={()=>{setLang(c);setPage("home")}} style={{background:lang===c?"#000":"#f3f4f6",color:lang===c?"#fff":"#000",padding:8,borderRadius:8,fontSize:11,fontWeight:700,border:"none"}}>{n}</button>)}
</div>
</div>}

{page==="article"&&<div style={{background:"#fff",borderRadius:16,padding:16,color:"#000"}}><button onClick={()=>setPage("menu")} style={{background:"#eee",border:"1px solid #000",padding:"6px 12px",borderRadius:8,fontWeight:700}}>← Back</button><h2>Article - What is LoremPro?</h2><p style={{fontSize:14,lineHeight:1.7}}>LoremPro {LANGS.length} languages tool helps designers generate dummy text in 77 real languages. Unlike normal lorem ipsum which is only Latin, this tool gives real native script. You can generate 0-100 sentences, paragraphs, words, list. Useful for website testing, app mockup, SEO.</p><h3>Benefits</h3><ul style={{fontSize:14}}><li>77 Real Languages</li><li>0-100 Counter Free</li><li>Sentence = continuous (no gap)</li><li>Paragraph = 3 sentences together</li><li>8 Download Options</li></ul></div>}
{page==="about"&&<div style={{background:"#fff",borderRadius:16,padding:16,color:"#000"}}><button onClick={()=>setPage("menu")} style={{background:"#eee",border:"1px solid #000",padding:"6px 12px",borderRadius:8,fontWeight:700}}>← Back</button><h2>About</h2><p style={{fontSize:14}}>Made in Raebareli, India. 77 languages.</p></div>}
{page==="contact"&&<div style={{background:"#fff",borderRadius:16,padding:16,color:"#000"}}><button onClick={()=>setPage("menu")} style={{background:"#eee",border:"1px solid #000",padding:"6px 12px",borderRadius:8,fontWeight:700}}>← Back</button><h2>Contact</h2><p style={{fontSize:14}}>lorempro75@gmail.com</p></div>}
{page==="privacy"&&<div style={{background:"#fff",borderRadius:16,padding:16,color:"#000"}}><button onClick={()=>setPage("menu")} style={{background:"#eee",border:"1px solid #000",padding:"6px 12px",borderRadius:8,fontWeight:700}}>← Back</button><h2>Privacy</h2><p style={{fontSize:14}}>No data collection.</p></div>}
{page==="hire"&&<div style={{background:"#111",borderRadius:16,padding:16,color:"#fff"}}><button onClick={()=>setPage("menu")} style={{background:"#fff",color:"#000",border:"none",padding:"6px 12px",borderRadius:8,fontWeight:700}}>← Back</button><h2>Hire Me</h2><p style={{fontSize:14}}>Tools starting ₹1999</p></div>}
{page==="how"&&<div style={{background:"#fff",borderRadius:16,padding:16,color:"#000"}}><button onClick={()=>setPage("menu")} style={{background:"#eee",border:"1px solid #000",padding:"6px 12px",borderRadius:8,fontWeight:700}}>← Back</button><h2>How to Use</h2><p style={{fontSize:14,lineHeight:1.7}}>1. Language chuno (77 me se, sabka alag content)<br/>2. SENTENCE = ek ke baad dusra bina gap<br/>3. PARAGRAPH = 3 sentence = 1 para<br/>4. Counter 0-100<br/>5. Generate dabao - ab button working hai!</p></div>}

{page==="home"&&<div style={{background:"#fff",borderRadius:20,padding:14}}>
<label style={{fontWeight:900,fontSize:11,color:"#000"}}>SELECT - {LANGS.length} LANGUAGES - ALL DIFFERENT CONTENT</label>
<select value={lang} onChange={e=>setLang(e.target.value)} style={{width:"100%",padding:14,borderRadius:12,border:"2px solid #000",fontWeight:800,color:"#000",background:"#fff",marginTop:6}}>
{LANGS.map(([c,n]:any)=><option key={c} value={c}>{n}</option>)}
</select>

<div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginTop:12}}>
{["SENTENCE","PARAGRAPH","WORD","LIST"].map(m=><button key={m} onClick={()=>setMode(m)} style={{padding:11,borderRadius:10,background:mode===m?"#000":"#f3f4f6",color:mode===m?"#fff":"#000",border:"none",fontSize:11,fontWeight:900}}>{m}</button>)}
</div>

<div style={{marginTop:12,background:"#f3f4f6",padding:12,borderRadius:12,border:"2px solid #000"}}>
<label style={{fontWeight:900,color:"#000",fontSize:13}}>Counter - {cnt} / 100 (0-100 Allowed)</label>
<div style={{display:"flex",gap:8,marginTop:8,alignItems:"center"}}>
<input type="range" min={0} max={100} value={cnt} onChange={e=>setCnt(Number(e.target.value))} style={{flex:1}}/>
<input type="number" min={0} max={100} value={cnt} onChange={e=>{let v=parseInt(e.target.value); if(isNaN(v)) v=0; setCnt(Math.min(100,Math.max(0,v)))}} style={{width:70,padding:10,borderRadius:10,border:"2px solid #000",fontWeight:800,color:"#000",background:"#fff",textAlign:"center"}}/>
</div>
<div
