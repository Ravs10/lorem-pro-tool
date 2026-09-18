// @ts-nocheck
"use client"
import { useState, useEffect } from "react"
const LANGS=[["HI","Hindi"],["EN","English"],["ES","Spanish"],["FR","French"],["DE","German"],["RU","Russian"],["JA","Japanese"],["IT","Italian"],["AR","Arabic"],["PT","Portuguese"],["BN","Bengali"],["UR","Urdu"],["ZH","Chinese"],["KO","Korean"],["TR","Turkish"],["NL","Dutch"],["PL","Polish"],["TH","Thai"],["VI","Vietnamese"],["ID","Indonesian"],["TA","Tamil"],["TE","Telugu"],["MR","Marathi"],["GU","Gujarati"],["PA","Punjabi"],["ML","Malayalam"],["KN","Kannada"],["OR","Odia"],["AS","Assamese"],["NE","Nepali"],["SI","Sinhala"],["MY","Burmese"],["KM","Khmer"],["LO","Lao"],["MS","Malay"],["FIL","Filipino"],["TL","Tagalog"],["SW","Swahili"],["AM","Amharic"],["HA","Hausa"],["YO","Yoruba"],["IG","Igbo"],["ZU","Zulu"],["AF","Afrikaans"],["SO","Somali"],["EL","Greek"],["HE","Hebrew"],["FA","Persian"],["PS","Pashto"],["KU","Kurdish"],["HY","Armenian"],["KA","Georgian"],["AZ","Azerbaijani"],["KK","Kazakh"],["UZ","Uzbek"],["TJ","Tajik"],["MN","Mongolian"],["BO","Tibetan"],["UK","Ukrainian"],["BE","Belarusian"],["CS","Czech"],["SK","Slovak"],["HU","Hungarian"],["RO","Romanian"],["BG","Bulgarian"],["SR","Serbian"],["HR","Croatian"],["BS","Bosnian"],["SL","Slovenian"],["LT","Lithuanian"],["LV","Latvian"],["ET","Estonian"],["FI","Finnish"],["SV","Swedish"],["NO","Norwegian"]]
const DB={
HI:["स्वस्थ जीवन के लिए रोज योग जरूरी है।","सुबह टहलने से शरीर स्वस्थ रहता है।"],
EN:["Healthy life needs daily yoga.","Morning walk keeps body fit."],
ES:["La vida saludable necesita yoga diario.","Caminar mantiene el cuerpo en forma."],
FR:["La vie saine nécessite du yoga quotidien.","La marche matinale garde le corps en forme."],
DE:["Gesundes Leben braucht tägliches Yoga.","Morgenspaziergang hält den Körper fit."],
RU:["Здоровая жизнь требует ежедневной йоги.","Утренняя прогулка поддерживает форму."],
JA:["健康的な生活には毎日のヨガが必要です。","朝の散歩は体を健康に保ちます。"],
IT:["La vita sana ha bisogno di yoga quotidiano.","La passeggiata mattutina mantiene il corpo in forma."],
AR:["الحياة الصحية تحتاج اليوغا اليومية.","المشي الصباحي يحافظ على اللياقة."],
PT:["Vida saudável precisa de ioga diária.","Caminhada matinal mantém o corpo em forma."],
BN:["সুস্থ জীবনের জন্য প্রতিদিন যোগব্যায়াম প্রয়োজন।","সকালে হাঁটা শরীরকে সুস্থ রাখে।"],
UR:["صحت مند زندگی کے لیے روزانہ یوگا ضروری ہے۔","صبح کی سیر جسم کو تندرست رکھتی ہے۔"],
ZH:["健康生活需要每天瑜伽。","晨步保持身体健康。"],
KO:["건강한 삶을 위해서는 매일 요가가 필요합니다.","아침 산책은 몸을 건강하게 유지합니다."],
TR:["Sağlıklı yaşam için günlük yoga gereklidir.","Sabah yürüyüşü vücudu zinde tutar."],
NL:["Gezond leven vereist dagelijkse yoga.","Ochtendwandeling houdt het lichaam fit."],
PL:["Zdrowe życie wymaga codziennej jogi.","Poranny spacer utrzymuje ciało w formie."],
TH:["ชีวิตที่มีสุขภาพดีต้องโยคะทุกวัน","การเดินตอนเช้าทำให้ร่างกายแข็งแรง"],
VI:["Cuộc sống khỏe mạnh cần yoga hàng ngày.","Đi bộ buổi sáng giữ cơ thể khỏe mạnh."],
ID:["Hidup sehat membutuhkan yoga harian.","Jalan pagi menjaga tubuh tetap bugar."],
TA:["ஆரோக்கியமான வாழ்வுக்கு தினமும் யோகா தேவை.","காலை நடை உடலை ஆரோக்கியமாக வைக்கிறது."],
TE:["ఆరోగ్యకరమైన జీవితానికి రోజూ యోగా అవసరం.","ఉదయం నడక శరీరాన్ని ఫిట్‌గా ఉంచుతుంది."],
MR:["निरोगी जीवनासाठी रोज योग आवश्यक आहे.","सकाळी चालणे शरीर तंदुरुस्त ठेवते."],
GU:["સ્વસ્થ જીવન માટે રોજ યોગ જરૂરી છે.","સવારે ચાલવાથી શરીર સ્વસ્થ રહે છે."],
PA:["ਸਿਹਤਮੰਦ ਜੀਵਨ ਲਈ ਰੋਜ਼ਾਨਾ ਯੋਗਾ ਜ਼ਰੂਰੀ ਹੈ।","ਸਵੇਰ ਦੀ ਸੈਰ ਸਰੀਰ ਨੂੰ ਤੰਦਰੁਸਤ ਰੱਖਦੀ ਹੈ।"],
ML:["ആരോഗ്യകരമായ ജീവിതത്തിന് ദിവസവും യോഗ ആവശ്യമാണ്.","രാവിലെ നടത്തം ശരീരത്തെ ആരോഗ്യത്തോടെ നിലനിർത്തുന്നു."],
KN:["ಆರೋಗ್ಯಕರ ಜೀವನಕ್ಕೆ ಪ್ರತಿದಿನ ಯೋಗ ಅಗತ್ಯ.","ಬೆಳಿಗ್ಗೆ ನಡಿಗೆ ದೇಹವನ್ನು ಫಿಟ್ ಆಗಿಡುತ್ತದೆ."],
OR:["ସୁସ୍ଥ ଜୀବନ ପାଇଁ ପ୍ରତିଦିନ ଯୋଗ ଆବଶ୍ୟକ।","ସକାଳ ଚାଲିବା ଶରୀରକୁ ସୁସ୍ଥ ରଖେ।"],
AS:["সুস্থ জীৱনৰ বাবে দৈনিক যোগ প্ৰয়োজন।","পুৱাৰ খোজে শৰীৰক সুস্থ ৰাখে।"],
NE:["स्वस्थ जीवनका लागि दैनिक योग आवश्यक छ।","बिहानको हिँडाइले शरीरलाई स्वस्थ राख्छ।"],
SI:["නිරෝගී ජීවිතයට දිනපතා යෝග අවශ්‍යයි.","උදෑසන ඇවිදීම ශරීරය නිරෝගීව තබයි."],
MY:["ကျန်းမာသောဘဝအတွက် နေ့စဉ်ယောဂ လိုအပ်သည်။","မနက်ခင်းလမ်းလျှောက်ခြင်းက ခန္ဓာကိုယ်ကို ကျန်းမာစေသည်။"],
KM:["ជីវិតដែលមានសុខភាពល្អត្រូវការយូហ្គាប្រចាំថ្ងៃ។","ការដើរពេលព្រឹកធ្វើឱ្យរាងកាយមានសុខភាពល្អ។"],
LO:["ຊີວິດທີ່ມີສຸຂະພາບດີຕ້ອງການໂຍຄະທຸກມື້.","ການຍ່າງຕອນເຊົ້າຮັກສາຮ່າງກາຍໃຫ້ແຂງແຮງ."],
MS:["Kehidupan sihat memerlukan yoga harian.","Berjalan pagi mengekalkan kecergasan badan."],
FIL:["Ang malusog na buhay ay nangangailangan ng yoga.","Ang paglalakad sa umaga ay malusog."],
TL:["Ang malusog na buhay ay nangangailangan ng yoga.","Ang paglalakad sa umaga ay malusog."],
SW:["Maisha yenye afya yanahitaji yoga ya kila siku.","Kutembea asubuhi huweka mwili sawa."],
  AM:["ጤናማ ሕይወት ዕለታዊ ዮጋ ያስፈልገዋል።","ጠዋት የእግር ጉዞ ጤናማ ያደርገዋል።"],
HA:["Rayuwa mai lafiya tana bukatar yoga.","Tafiya da safe yana kiyaye jiki."],
YO:["Igbesi aye ilera nilo yoga ojoojumo.","Rin ni owuro n je ki ara wa ni ilera."],
IG:["Ndu ahuike choro yoga kwa ubochi.","Ije ututu na-eme ka ahu di nma."],
ZU:["Impilo enempilo idinga i-yoga.","Ukuhamba ekuseni kugcina umzimba uqinile."],
AF:["Gesonde lewe benodig daaglikse joga.","Oggendstap hou die liggaam fiks."],
SO:["Nolosha caafimaadka qabta waxay u baahan tahay yoga.","Socodka subaxnimo wuxuu jirka dhigayaa mid taam ah."],
EL:["Η υγιής ζωή χρειάζεται καθημερινή γιόγκα.","Το πρωινό περπάτημα κρατά το σώμα σε φόρμα."],
HE:["חיים בריאים דורשים יוגה יומית.","הליכת בוקר שומרת על הגוף בכושר."],
FA:["زندگی سالم نیاز به یوگای روزانه دارد.","پیاده‌روی صبحگاهی بدن را سالم نگه می‌دارد."],
PS:["روغ ژوند ورځني یوګا ته اړتیا لري.","سهار ګرځېدل بدن روغ ساتي."],
KU:["Jiyana saxlem rojane yoga hewce dike.","Meşa sibehê laş saxlem dihêle."],
HY:["Առողջ կյանքը պահանջում է ամենօրյա յոգա։","Առավոտյան զբոսանքը մարմինը առողջ է պահում։"],
KA:["ჯანსაღი ცხოვრება ყოველდღიურ იოგას საჭიროებს.","დილის სეირნობა სხეულს ჯანმრთელს უნარჩუნებს."],
AZ:["Sağlam həyat gündəlik yoqa tələb edir.","Səhər gəzintisi bədəni sağlam saxlayır."],
KK:["Салауатты өмір күнделікті йоганы қажет етеді.","Таңертеңгі серуен денені сау ұстайды."],
UZ:["Sog'lom hayot kundalik yoga talab qiladi.","Ertalab yurish tanani sog'lom saqlaydi."],
TJ:["Ҳаёти солим йогаи ҳаррӯзаро талаб мекунад.","Пиёдагардии субҳ баданро солим нигоҳ медорад."],
MN:["Эрүүл амьдралд өдөр тутмын йог хэрэгтэй.","Өглөөний алхалт биеийг эрүүл байлгадаг."],
BO:["བདེ་ཐང་གི་འཚོ་བ་ལ་ཉིན་རེའི་ཡོ་ག་དགོས།","སྔ་དྲོའི་འཆམ་འཆམ་གྱིས་ལུས་པོ་བདེ་ཐང་བཞག་།"],
UK:["Здорове життя потребує щоденної йоги.","Ранкова прогулянка тримає тіло у формі."],
BE:["Здаровае жыццё патрабуе штодзённай ёгі.","Ранішняя прагулка трымае цела ў форме."],
CS:["Zdravý život vyžaduje každodenní jógu.","Ranní procházka udržuje tělo v kondici."],
SK:["Zdravý život si vyžaduje každodennú jogu.","Ranná prechádzka udržuje telo v kondícii."],
HU:["Az egészséges élethez napi jóga szükséges.","A reggeli séta fitten tartja a testet."],
RO:["Viața sănătoasă are nevoie de yoga zilnic.","Plimbarea de dimineață menține corpul în formă."],
BG:["Здравословният живот изисква ежедневно йога.","Сутрешната разходка поддържа тялото във форма."],
SR:["Zdrav život zahteva svakodnevnu jogu.","Jutarnja šetnja održava telo u formi."],
HR:["Zdrav život zahtijeva svakodnevnu jogu.","Jutarnja šetnja održava tijelo u formi."],
BS:["Zdrav život zahtijeva svakodnevnu jogu.","Jutarnja šetnja održava tijelo u formi."],
SL:["Zdravo življenje zahteva vsakodnevno jogo.","Jutranji sprehod ohranja telo v formi."],
LT:["Sveikam gyvenimui reikia kasdienės jogos.","Ryto pasivaikščiojimas palaiko kūno formą."],
LV:["Veselīgai dzīvei nepieciešama ikdienas joga.","Rīta pastaiga uztur ķermeni formā."],
ET:["Tervislik elu vajab igapäevast joogat.","Hommikune jalutuskäik hoiab keha vormis."],
FI:["Terveellinen elämä vaatii päivittäistä joogaa.","Aamukävely pitää kehon kunnossa."],
SV:["Hälsosamt liv kräver daglig yoga.","Morgonpromenad håller kroppen i form."],
NO:["Sunt liv krever daglig yoga.","Morgentur holder kroppen i form."]
}
export default function Page(){
const [lang,setLang]=useState("HI")
const [mode,setMode]=useState("paragraph")
const [cnt,setCnt]=useState(5)
const [out,setOut]=useState("")
const [dtype,setDtype]=useState("txt")
const [showPage,setShowPage]=useState("")
const [menuOpen,setMenuOpen]=useState(false)
const gen=()=>{
let b=DB[lang]||DB.EN
let w=b.join(" ").split(/\s+/).filter(Boolean)
let r=""
if(mode==="word"){r=w.slice(0,cnt).join(" ")}
else if(mode==="sentence"){let a=[];while(a.length<cnt){a=a.concat(b)};r=a.slice(0,cnt).join(" ")}
else if(mode==="list"){let a=[];while(a.length<cnt){a=a.concat(b)};r=a.slice(0,cnt).map(v=>"• "+v).join("\n")}
else{let a=[];for(let i=0;i<cnt;i++){a.push(b[i%b.length])};r=a.join("\n\n")}
setOut(r)
}
useEffect(()=>{gen()},[lang,mode,cnt])
const wc=out?out.split(/\s+/).filter(Boolean).length:0
const cc=out.length
const pc=out?out.split(/\n\n/).filter(Boolean).length:0
const download=()=>{
let c=out
if(dtype==="html"){c="<p>"+out.split("\n\n").join("</p><p>")+"</p>"}
if(dtype==="md"){c="# LoremPro "+lang+"\n\n"+out}
if(dtype==="json"){c=JSON.stringify({lang,count:cnt,text:out},null,2)}
let blob=new Blob([c],{type:"text/plain"})
let a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="lorem-"+lang+"."+dtype;a.click()
}
return(
<div style={{background:"linear-gradient(135deg,#667eea,#764ba2)",minHeight:"100vh",fontFamily:"system-ui"}}>
<header style={{background:"#fff",padding:"12px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
<div style={{display:"flex",gap:8,alignItems:"center"}}><div style={{width:36,height:36,borderRadius:8,background:"#6366f1",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:900}}>LP</div><b>LoremPro 75</b></div><button onClick={()=>setMenuOpen(!menuOpen)} style={{background:"#111",color:"#fff",borderRadius:999,padding:"6px 12px",border:"none"}}>Menu</button>
</header>
<div style={{maxWidth:660,margin:"auto",padding:12}}>
<div style={{background:"#fff",borderRadius:16,padding:12}}>
<select value={lang} onChange={e=>setLang(e.target.value)} style={{width:"100%",padding:10,borderRadius:8,border:"2px solid #6366f1",fontWeight:700}}>{LANGS.map(([c,n])=><option key={c} value={c}>{c} - {n}</option>)}</select>
<div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,marginTop:8}}>{["paragraph","sentence","word","list"].map(m=><button key={m} onClick={()=>setMode(m)} style={{padding:8,borderRadius:8,background:mode===m?"#6366f1":"#eee",color:mode===m?"#fff":"#111",border:"none",fontSize:10,fontWeight:800}}>{m.toUpperCase()}</button>)}</div>
<div style={{display:"flex",gap:8,alignItems:"center",marginTop:8}}><span>COUNT</span><input type="range" min={1} max={50} value={cnt} onChange={e=>setCnt(Number(e.target.value))} style={{flex:1}}/><b>{cnt}</b></div>
<button onClick={gen} style={{width:"100%",background:"#111",color:"#fff",padding:10,borderRadius:8,marginTop:8,fontWeight:800}}>GENERATE {lang}</button>
<div style={{border:"2px solid #111",borderRadius:8,padding:10,marginTop:8,whiteSpace:"pre-wrap",minHeight:80}}>{out}</div>
<div style={{display:"flex",gap:6,marginTop:8}}><button onClick={()=>navigator.clipboard.writeText(out)} style={{flex:1,background:"#111",color:"#fff",padding:8,borderRadius:999,border:"none"}}>Copy</button><select value={dtype} onChange={e=>setDtype(e.target.value)} style={{flex:1,padding:8,borderRadius:999}}><option value="txt">TXT</option><option value="html">HTML</option><option value="md">MD</option><option value="json">JSON</option><option value="csv">CSV</option><option value="pdf">PDF</option><option value="doc">DOC</option><option value="rtf">RTF</option></select><button onClick={download} style={{flex:1,background:"#6366f1",color:"#fff",padding:8,borderRadius:999,border:"none"}}>Download</button></div>
</div>
<footer style={{background:"#fff",borderRadius:12,padding:10,marginTop:10,textAlign:"center",fontSize:10}}>© 2026 LoremPro V26.2 FINAL - 75 Languages</footer>
</div></div>)
}
