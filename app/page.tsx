"use client"
import {useState,useEffect} from "react"

const LANGS=[
["HI","HI - हिन्दी"],["EN","English"],["OR","ଓଡ଼ିଆ"],["BN","বাংলা"],["TE","తెలుగు"],["TA","தமிழ்"],["KN","ಕನ್ನಡ"],["ML","മലയാളം"],["MR","मराठी"],["GU","ગુજરાતી"],["PA","ਪੰਜਾਬੀ"],["UR","اردو"],["AS","অসমীয়া"],["NE","नेपाली"],["SI","සිංහල"],["MY","မြန်မာ"],["TH","ไทย"],["LO","ລາວ"],["KM","ខ្មែរ"],["VI","Tiếng Việt"],["ID","Indonesia"],["MS","Melayu"],["ZH","中文"],["JA","日本語"],["KO","한국어"],["AR","العربية"],["FA","فارسی"],["HE","עברית"],["TR","Türkçe"],["FR","Français"],["DE","Deutsch"],["ES","Español"],["PT","Português"],["IT","Italiano"],["NL","Nederlands"],["PL","Polski"],["RU","Русский"],["UK","Українська"],["EL","Ελληνικά"],["CS","Čeština"],["RO","Română"],["HU","Magyar"],["SV","Svenska"],["DA","Dansk"],["FI","Suomi"],["NO","Norsk"],["SW","Swahili"],["AM","አማርኛ"],["HA","Hausa"],["AF","Afrikaans"],["SQ","Shqip"],["HR","Hrvatski"],["SR","Српски"],["BG","Български"],["SK","Slovenčina"],["SL","Slovenščina"],["LT","Lietuvių"],["LV","Latviešu"],["ET","Eesti"],["MT","Malti"],["GA","Gaeilge"],["CY","Cymraeg"],["EU","Euskara"],["CA","Català"],["GL","Galego"],["IS","Íslenska"],["MK","Македонски"],["HY","Հայերեն"],["KA","ქართული"],["AZ","Azərbaycan"],["KK","Қазақ"],["UZ","Oʻzbek"],["PS","پښتو"],["SD","سنڌي"],["KU","Kurdî"],["BO","བོད་ཡིག"],["DZ","རྫོང་ཁ"]
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
"PA":["ਸਿਹਤ ਲਈ ਯੋਗਾ ਜ਼ਰੂਰੀ ਹੈ","ਸਵੇਰ ਦੀ ਸੈਰ ਚੰਗੀ ਹੈ","ਫਲ ਚੰਗੇ ਹਨ","ਪਾਣੀ ਪੀਓ","ਹਰੀਆਂ ਸਬਜ਼ੀਆਂ ਚੰਗੀਆਂ"],
"UR":["صحت کے لیے یوگا ضروری ہے","صبح کی سیر اچھی ہے","پھل اچھے ہیں","پانی پیو","سبز سبزیاں اچھی ہیں"],
"AS":["স্বাস্থ্যৰ বাবে যোগ জৰুৰী","পুৱা খোজ কঢ়া ভাল","ফল ভাল","পানী খাওক","সেউজীয়া শাক-পাচলি ভাল"],
"NE":["स्वास्थ्यका लागि योग आवश्यक छ","बिहान हिँड्नु राम्रो छ","फलफूल राम्रो छ","पानी पिउनुहोस्","हरियो तरकारी राम्रो छ"],
"SI":["සෞඛ්‍යයට යෝග අවශ්‍යයි","උදේ ඇවිදීම හොඳයි","පලතුරු හොඳයි","වතුර බොන්න","කොළ එළවළු හොඳයි"],
"MY":["ကျန်းမာရေးအတွက်ယောဂ လိုသည်","မနက်လမ်းလျှောက်ကောင်းသည်","သစ်သီးကောင်းသည်","ရေသောက်ပါ","အစိမ်းရွက်ကောင်းသည်"],
"TH":["สุขภาพต้องโยคะ","เดินเช้าดี","ผลไม้ดี","ดื่มน้ำเยอะ","ผักเขียวดี"],
"LO":["ສຸຂະພາບຕ້ອງການໂຍຄະ","ຍ່າງເຊົ້າດີ","ໝາກໄມ້ດີ","ດື່ມນ້ຳຫຼາຍ","ຜັກຂຽວດີ"],
"KM":["សុខភាពត្រូវការយូហ្គា","ដើរព្រឹកល្អ","ផ្លែឈើល្អ","ផឹកទឹកច្រើន","បន្លែបៃតងល្អ"],
"VI":["Sức khỏe cần yoga","Đi bộ sáng tốt","Trái cây tốt","Uống nhiều nước","Rau xanh tốt"],
"ID":["Sehat butuh yoga","Jalan pagi baik","Buah baik","Minum banyak air","Sayur hijau baik"],
"MS":["Sihat perlu yoga","Jalan pagi baik","Buah baik","Minum banyak air","Sayur hijau baik"],
"ZH":["健康需要瑜伽","晨走很好","水果很好","多喝水","绿蔬菜很好"],
"JA":["健康にはヨガが必要です","朝の散歩は良いです","果物は良いです","水をたくさん飲んでください","緑の野菜は良いです"],
"KO":["건강에는 요가가 필요합니다","아침 산책은 좋습니다","과일은 좋습니다","물을 많이 마시세요","녹색 채소가 좋습니다"],
"AR":["الصحة تحتاج يوجا","المشي الصباحي جيد","الفاكهة جيدة","اشرب ماء كثيرا","الخضار الخضراء جيدة"],
"FA":["سلامتی به یوگا نیاز دارد","پیاده روی صبح خوب است","میوه خوب است","آب زیاد بنوش","سبزیجات سبز خوب است"],
"HE":["בריאות צריכה יוגה","הליכת בוקר טובה","פירות טובים","שתה הרבה מים","ירקות ירוקים טובים"],
"TR":["Sağlık yoga ister","Sabah yürüyüşü iyi","Meyve iyi","Çok su iç","Yeşil sebze iyi"],
"FR":["La santé a besoin de yoga","Marche matinale bonne","Fruits bons","Bois beaucoup d'eau","Légumes verts bons"],
"DE":["Gesundheit braucht Yoga","Morgenspaziergang gut","Obst gut","Trink viel Wasser","Grünes Gemüse gut"],
"ES":["Salud necesita yoga","Caminata matutina buena","Fruta buena","Bebe mucha agua","Verdura verde buena"],
"PT":["Saúde precisa de yoga","Caminhada matinal boa","Fruta boa","Beba muita água","Verdura verde boa"],
"IT":["Salute ha bisogno di yoga","Passeggiata mattutina buona","Frutta buona","Bevi molta acqua","Verdura verde buona"],
"NL":["Gezondheid heeft yoga nodig","Ochtendwandeling goed","Fruit goed","Drink veel water","Groene groente goed"],
"PL":["Zdrowie potrzebuje jogi","Poranny spacer dobry","Owoce dobre","Pij dużo wody","Zielone warzywa dobre"],
"RU":["Здоровье нуждается в йоге","Утренняя прогулка хороша","Фрукты хороши","Пей много воды","Зеленые овощи хороши"],
"UK":["Здоров'я потребує йоги","Ранкова прогулянка добра","Фрукти добрі","Пий багато води","Зелені овочі добрі"],
"EL":["Η υγεία χρειάζεται γιόγκα","Πρωινός περίπατος καλός","Φρούτα καλά","Πιες πολύ νερό","Πράσινα λαχανικά καλά"],
"CS":["Zdraví potřebuje jógu","Ranní procházka dobrá","Ovoce dobré","Pij hodně vody","Zelená zelenina dobrá"],
"RO":["Sănătatea are nevoie de yoga","Plimbarea de dimineață bună","Fructe bune","Bea multă apă","Legume verzi bune"],
"HU":["Az egészségnek jógára van szüksége","Reggeli séta jó","Gyümölcs jó","Igyál sok vizet","Zöld zöldség jó"],
"SV":["Hälsa behöver yoga","Morgonpromenad bra","Frukt bra","Drick mycket vatten","Gröna grönsaker bra"],
"DA":["Sundhed har brug for yoga","Morgentur god","Frugt god","Drik meget vand","Grønne grøntsager gode"],
"FI":["Terveys tarvitsee joogaa","Aamukävely hyvä","Hedelmät hyviä","Juo paljon vettä","Vihreät vihannekset hyviä"],
"NO":["Helse trenger yoga","Morgentur god","Frukt god","Drikk mye vann","Grønne grønnsaker gode"],
"SW":["Afya inahitaji yoga","Kutembea asubuhi nzuri","Matunda mazuri","Kunywa maji mengi","Mboga za kijani nzuri"],
"AM":["ጤና ዮጋ ያስፈልገዋል","ጠዋት የእግር ጉዞ ጥሩ ነው","ፍራፍሬ ጥሩ ነው","ብዙ ውሃ ጠጣ","አረንጓዴ አትክልት ጥሩ ነው"],
"HA":["Lafiya na bukatar yoga","Tafiya da safe mai kyau","'Ya'yan itace mai kyau","Sha ruwa mai yawa","Koren kayan lambu mai kyau"],
"AF":["Gesondheid het joga nodig","Oggendstaptog goed","Vrugte goed","Drink baie water","Groen groente goed"],
"SQ":["Shëndeti ka nevojë për joga","Shëtitja e mëngjesit e mirë","Fruta të mira","Pi shumë ujë","Perime jeshile të mira"],
"HR":["Zdravlje treba jogu","Jutarnja šetnja dobra","Voće dobro","Pij puno vode","Zeleno povrće dobro"],
"SR":["Здравље треба јогу","Јутарња шетња добра","Воће добро","Пиј пуно воде","Зелено поврће добро"],
"BG":["Здравето се нуждае от йога","Сутрешната разходка добра","Плодове добри","Пий много вода","Зелени зеленчуци добри"],
"SK":["Zdravie potrebuje jogu","Ranná prechádzka dobrá","Ovocie dobré","Pi veľa vody","Zelená zelenina dobrá"],
"SL":["Zdravje potrebuje jogo","Jutranji sprehod dober","Sadje dobro","Pij veliko vode","Zelena zelenjava dobra"],
"LT":["Sveikatai reikia jogos","Rytinis pasivaikščiojimas geras","Vaisiai geri","Gerk daug vandens","Žalios daržovės geros"],
"LV":["Veselībai vajag jogu","Rīta pastaiga laba","Augļi labi","Dzer daudz ūdens","Zaļi dārzeņi labi"],
"ET":["Tervis vajab joogat","Hommikune jalutuskäik hea","Puuviljad head","Joo palju vett","Rohelised köögiviljad head"],
"MT":["Saħa teħtieġ yoga","Mixja ta' filgħodu tajba","Frott tajjeb","Ixrob ħafna ilma","Ħaxix aħdar tajjeb"],
"GA":["Sláinte ag teastáil yoga","Siúlóid maidin maith","Torthaí maith","Ól go leor uisce","Glasraí glasa maith"],
"CY":["Iechyd angen yoga","Taith gerdded bore da","Ffrwythau da","Yfwch lawer o ddŵr","Llysiau gwyrdd da"],
"EU":["Osasunak yoga behar du","Goizeko ibilaldia ona","Fruta ona","Edan ur asko","Barazki berdeak onak"],
"CA":["La salut necessita ioga","Passeig matutí bo","Fruita bona","Beu molta aigua","Verdura verda bona"],
"GL":["Saúde precisa ioga","Paseo matinal bo","Froita boa","Bebe moita auga","Verdura verde boa"],
"IS":["Heilsa þarf jóga","Morgunganga góð","Ávextir góðir","Drekktu mikinn vatn","Grænt grænmeti gott"],
"MK":["Здравјето има потреба од јога","Утринска прошетка добра","Овошје добро","Пиј многу вода","Зелен зеленчук добар"],
"HY":["Առողջությանը յոգա է պետք","Առավոտյան զբոսանքը լավ է","Մրգերը լավ են","Շատ ջուր խմիր","Կանաչ բանջարեղենը լավ է"],
"KA":["ჯანმრთელობას იოგა სჭირდება","დილის გასეირნება კარგია","ხილი კარგია","ბევრი წყალი დალიე","მწვანე ბოსტნეული კარგია"],
"AZ":["Sağlamlıq yoqa ehtiyac duyur","Səhər gəzintisi yaxşıdır","Meyvə yaxşıdır","Çox su iç","Yaşıl tərəvəz yaxşıdır"],
"KK":["Денсаулыққа йога қажет","Таңертеңгі серуен жақсы","Жемістер жақсы","Көп су іш","Жасыл көкөністер жақсы"],
"UZ":["Salomatlik yoga kerak","Ertalab yurish yaxshi","Mevalar yaxshi","Ko'p suv ich","Yashil sabzavotlar yaxshi"],
"PS":["روغتیا یوګا ته اړتیا لري","سهار ګرځېدل ښه دی","مېوه ښه ده","ډېرې اوبه وڅښه","شنه سابه ښه ده"],
"SD":["صحت کي يوگا جي ضرورت آهي","صبح جو گهمڻ سٺو","ميوو سٺو","گهڻو پاڻي پي","سائو ڀاڄيون سٺيون"],
"KU":["Tenduristî pêdivî bi yogayê heye","Meşa sibehê baş e","Fêkî baş e","Gelek av vexwe","Sebzeyên kesk baş in"],
"BO":["བདེ་ཐང་ལ་ཡོ་ག་དགོས།","སྔ་དྲོའི་འཆམ་འགྲོ་ཡག་པོ།","ཤིང་ཏོག་ཡག་པོ།","ཆུ་མང་པོ་འཐུང་།","སྔོ་ཚལ་ཡག་པོ།"],
"DZ":["གཟུགས་གཞི་ལུ་ཡོ་ག་དགོ།","དྲོ་པ་གྱི་འཆམ་འགྲོ་ལེགས།","ཤིང་ཏོག་ལེགས།","ཆུ་མངམ་འཐུང་།","སྔོ་ཚལ་ལེགས།"]
}

export default function Page(){
const [lang,setLang]=useState("HI")
const [mode,setMode]=useState("SENTENCE")
const [cnt,setCnt]=useState(5)
const [out,setOut]=useState("")
const [page,setPage]=useState("home")
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
useEffect(()=>{const h=()=>setShowTop(window.scrollY>400); window.addEventListener("scroll",h); gen(); return()=>window.removeEventListener("scroll",h)},[])
useEffect(()=>{gen()},[lang,mode,cnt])

const words=out.split(/\s+/).filter(Boolean).length
const chars=out.length

return(
<div style={{background:"linear-gradient(135deg,#667eea,#764ba2)",minHeight:"100vh",fontFamily:"system-ui"}}>
<style>{`@keyframes fade{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}.anim{animation:fade.4s} button:active{transform:scale(.97)}`}</style>

<header style={{background:"#fff",padding:12,display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,zIndex:50}}>
<b>LP - LoremPro {LANGS.length}</b>
<button onClick={()=>setPage(page==="home"?"menu":"home")} style={{background:"#111",color:"#fff",border:"none",padding:"8px 18px",borderRadius:999,fontWeight:800}}>{page==="home"?"Menu":"Home"}</button>
</header>

<div style={{maxWidth:720,margin:"auto",padding:12}}>

{page==="menu" && <div className="anim" style={{background:"#fff",borderRadius:20,padding:16}}>
<h2 style={{marginTop:0}}>☰ Menu - {LANGS.length} Languages ✅</h2>
<div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10}}>
{[
["home","🏠 Generator"],["how","📖 How to Use"],["hire","💼 Hire Me"],
["about","ℹ️ About"],["contact","📞 Contact"],["disclaimer","⚠️ Disclaimer"],["privacy","🔒 Privacy"]
].map(([k,l]:any)=><button key={k} onClick={()=>setPage(k)} style={{padding:14,borderRadius:12,border:"2px solid #111",background:"#fff",fontWeight:800}}>{l}</button>)}
</div>
<div style={{marginTop:14,maxHeight:350,overflowY:"auto",border:"2px solid #111",borderRadius:12,padding:8,display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:6}}>
{LANGS.map(([c,n]:any)=><button key={c} onClick={()=>{setLang(c); setPage("home")}} style={{background:lang===c?"#111":"#f3f4f6",color:lang===c?"#fff":"#111",padding:8,borderRadius:8,fontSize:11,fontWeight:700,border:"none",textAlign:"left"}}>{n}</button>)}
</div>
<div style={{textAlign:"center",marginTop:8,fontWeight:900}}>Total: {LANGS.length} Languages - All Real ✅</div>
</div>}

{page==="about" && <div className="anim" style={{background:"#fff",borderRadius:16,padding:16}}><button onClick={()=>setPage("menu")}>← Back</button><h2>About</h2><p style={{fontSize:13}}>75 Languages Lorem Tool - Made in India</p></div>}
{page==="contact" && <div className="anim" style={{background:"#fff",borderRadius:16,padding:16}}><button onClick={()=>setPage("menu")}>← Back</button><h2>Contact</h2><p style={{fontSize:13}}>lorempro75@gmail.com - Raebareli</p></div>}
{page==="disclaimer" && <div className="anim" style={{background:"#fff",borderRadius:16,padding:16}}><button onClick={()=>setPage("menu")}>← Back</button><h2>Disclaimer</h2><p style={{fontSize:13}}>Dummy text only</p></div>}
{page==="privacy" && <div className="anim" style={{background:"#fff",borderRadius:16,padding:16}}><button onClick={()=>setPage("menu")}>← Back</button><h2>Privacy</h2><p style={{fontSize:13}}>No tracking, browser only</p></div>}
{page==="hire" && <div className="anim" style={{background:"#111",color:"#fff",borderRadius:16,padding:16}}><button onClick={()=>setPage("menu")} style={{background:"#fff",color:"#111",border:"none",padding:"6px 12px",borderRadius:999}}>← Back</button><h2>Hire Me</h2><p style={{fontSize:13}}>I build tools like this - ₹1999 start</p></div>}
{page==="how" && <div className="anim" style={{background:"#fff",borderRadius:16,padding:16}}><button onClick={()=>setPage("menu")}>← Back</button><h2>How to Use</h2><ol style={{fontSize:13,lineHeight:1.8}}><li>Menu > 75 me se language chuno - sab me real result</li><li>Mode chuno</li><li>Counter FREE - 1 se 10000 tak likho</li><li>Generate</li></ol></div>}

{page==="home" && <>
<div className="anim" style={{background:"#fff",borderRadius:20,padding:16,boxShadow:"0 20px 40px rgba(0,0,0,.15)"}}>
<label style={{fontWeight:900,fontSize:11,color:"#6366f1"}}>75 LANGUAGES - ALL REAL - NO ENGLISH</label>
<select value={lang} onChange={e=>setLang(e.target.value)} style={{width:"100%",padding:14,borderRadius:12,border:"2px solid #111",fontWeight:800,fontSize:15,color:"#000",background:"#fff",marginTop:6}}>
{LANGS.map(([c,n]:any)=><option key={c} value={c}>{n}</option>)}
</select>

<div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginTop:12}}>
{["PARAGRAPH","SENTENCE","WORD","LIST"].map(m=><button key={m} onClick={()=>setMode(m)} style={{padding:11,borderRadius:10,background:mode===m?"#111":"#f3f4f6",color:mode===m?"#fff":"#111",border:"none",fontSize:11,fontWeight:900}}>{m}</button>)}
</div>

<div style={{marginTop:12,background:"#f8fafc",padding:12,borderRadius:12,border:"1px solid #e2e8f0"}}>
<label style={{fontWeight:900,fontSize:13}}>Counter FREE - {cnt} (1-10000)</label>
<div style={{display:"flex",gap:8,marginTop:8}}>
<input type="range" min={1} max={500} value={cnt>500?500:cnt} onChange={e=>setCnt(Number(e.target.value))} style={{flex:1}}/>
<input type="number" min={1} max={10000} value={cnt} onChange={e=>{let v=parseInt(e.target.value)||1; setCnt(Math.min(10000,Math.max(1,v)))}} style={{width:90,padding:8,borderRadius:8,border:"2px solid #111",fontWeight:800,textAlign:"center"}}/>
</div>
</div>

<button onClick={gen} style={{width:"100%",background:"#111",color:"#fff",padding:15,borderRadius:12,marginTop:12,fontWeight:900,fontSize:16,border:"none"}}>GENERATE {lang} - {cnt}</button>

<div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8,marginTop:10}}>
<div style={{background:"#eef2ff",padding:10,borderRadius:10,textAlign:"center"}}><div style={{fontSize:18,fontWeight:900}}>{words}</div><div style={{fontSize:10,fontWeight:800}}>WORDS</div></div>
<div style={{background:"#dcfce7",padding:10,borderRadius:10,textAlign:"center"}}><div style={{fontSize:18,fontWeight:900}}>{chars}</div><div style={{fontSize:10,fontWeight:800}}>CHARS</div></div>
</div>

<div style={{border:"2px solid #111",borderRadius:12,padding:14,marginTop:12,minHeight:120,background:"#fff",color:"#000",fontSize:15,lineHeight:1.7,whiteSpace:"pre-wrap",fontWeight:600}}>{out}</div>

<div style={{display:"flex",gap:8,marginTop:12}}>
<button onClick={()=>navigator.clipboard.writeText(out)} style={{flex:1,background:"#111",color:"#fff",padding:12,borderRadius:999,border:"none",fontWeight:800}}>Copy</button>
<button onClick={()=>{let a=document.createElement("a");a.href=URL.createObjectURL(new Blob([out],{type:"text/plain"}));a.download=`lorem-${lang}.txt`;a.click()}} style={{flex:1,background:"#6366f1",color:"#fff",padding:12,borderRadius:999,border:"none",fontWeight:800}}>Download</button>
</div>
</div>

<div className="anim" style={{background:"#fff",borderRadius:16,padding:16,marginTop:12}}><h3 style={{margin:"0 0 8px"}}>🛠️ Other Useful Tools - Section 1</h3><div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>{["Word Counter","Char Counter","Case Convert","QR Gen","Password Gen","Age Calc","BMI Calc","Hashtag Gen","Lorem 39"].map(t=><div key={t} style={{background:"#f3f4f6",padding:10,borderRadius:8,fontSize:10,fontWeight:700,textAlign:"center"}}>{t}</div>)}</div></div>

<div className="anim" style={{background:"#fff",borderRadius:16,padding:16,marginTop:12}}><h3 style={{margin:"0 0 8px"}}>🧰 Other Useful Tools - Section 2 (NEW)</h3><div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8}}>{["SEO Text Gen","YouTube Title Gen","Insta Bio Gen","Resume Builder","Invoice Maker","Color Palette","Meta Tag Gen","Slogan Maker"].map(t=><div key={t} style={{background:"#eef2ff",padding:10,borderRadius:8,fontSize:11,fontWeight:700,textAlign:"center",color:"#4338ca"}}>{t}</div>)}</div></div>
</>}

</div>

<footer style={{background:"#111",color:"#fff",padding:16,textAlign:"center",marginTop:20}}>
<div style={{fontWeight:800}}>LP - LoremPro {LANGS.length} - All 75 Real</div>
<div style={{fontSize:10,opacity:.5,marginTop:6}}>Counter Fixed • Animation • 75 Real Languages • No English Fallback</div>
</footer>

{showTop&&<button onClick={()=>window.scrollTo({top:0,behavior:"smooth"})} style={{position:"fixed",bottom:20,right:20,background:"#111",color:"#fff",width:48,height:48,borderRadius:999,border:"none",fontSize:20}}>↑</button>}
</div>)}
