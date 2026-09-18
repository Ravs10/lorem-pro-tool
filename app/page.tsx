// @ts-nocheck
"use client"
import { useState, useEffect } from "react"
const LANGS = [
  ["HI","Hindi"],
  ["EN","English"],
  ["ES","Spanish"],
  ["FR","French"],
  ["DE","German"],
  ["RU","Russian"],
  ["JA","Japanese"],
  ["IT","Italian"],
  ["AR","Arabic"],
  ["PT","Portuguese"],
  ["BN","Bengali"],
  ["UR","Urdu"],
  ["ZH","Chinese"],
  ["KO","Korean"],
  ["TR","Turkish"],
  ["NL","Dutch"],
  ["PL","Polish"],
  ["TH","Thai"],
  ["VI","Vietnamese"],
  ["ID","Indonesian"],
  ["TA","Tamil"],
  ["TE","Telugu"],
  ["MR","Marathi"],
  ["GU","Gujarati"],
  ["PA","Punjabi"],
  ["ML","Malayalam"],
  ["KN","Kannada"],
  ["OR","Odia"],
  ["AS","Assamese"],
  ["NE","Nepali"],
  ["SI","Sinhala"],
  ["MY","Burmese"],
  ["KM","Khmer"],
  ["LO","Lao"],
  ["MS","Malay"],
  ["FIL","Filipino"],
  ["TL","Tagalog"],
  ["SW","Swahili"],
  ["AM","Amharic"],
  ["HA","Hausa"],
  ["YO","Yoruba"],
  ["IG","Igbo"],
  ["ZU","Zulu"],
  ["AF","Afrikaans"],
  ["SO","Somali"],
  ["EL","Greek"],
  ["HE","Hebrew"],
  ["FA","Persian"],
  ["PS","Pashto"],
  ["KU","Kurdish"],
  ["HY","Armenian"],
  ["KA","Georgian"],
  ["AZ","Azerbaijani"],
  ["KK","Kazakh"],
  ["UZ","Uzbek"],
  ["TJ","Tajik"],
  ["MN","Mongolian"],
  ["BO","Tibetan"],
  ["UK","Ukrainian"],
  ["BE","Belarusian"],
  ["CS","Czech"],
  ["SK","Slovak"],
  ["HU","Hungarian"],
  ["RO","Romanian"],
  ["BG","Bulgarian"],
  ["SR","Serbian"],
  ["HR","Croatian"],
  ["BS","Bosnian"],
  ["SL","Slovenian"],
  ["LT","Lithuanian"],
  ["LV","Latvian"],
  ["ET","Estonian"],
  ["FI","Finnish"],
  ["SV","Swedish"],
  ["NO","Norwegian"]
]
const DB = {
  HI: ["स्वस्थ जीवन के लिए रोज योग जरूरी है।","सुबह टहलने से शरीर स्वस्थ रहता है।","संतुलित भोजन जरूरी है।"],
  EN: ["Healthy life needs daily yoga.","Morning walk keeps body fit.","Balanced diet is essential."],
  ES: ["La vida saludable necesita yoga diario.","Caminar por la mañana mantiene el cuerpo en forma.","La dieta equilibrada es esencial."],
  FR: ["La vie saine nécessite du yoga quotidien.","La marche matinale garde le corps en forme.","Une alimentation équilibrée est essentielle."],
  DE: ["Gesundes Leben braucht tägliches Yoga.","Morgenspaziergang hält den Körper fit.","Ausgewogene Ernährung ist wichtig."],
  RU: ["Здоровая жизнь требует ежедневной йоги.","Утренняя прогулка поддерживает форму.","Сбалансированная диета важна."],
  JA: ["健康的な生活には毎日のヨガが必要です。","朝の散歩は体を健康に保ちます。","バランスの取れた食事が不可欠です。"],
  IT: ["La vita sana ha bisogno di yoga quotidiano.","La passeggiata mattutina mantiene il corpo in forma.","Una dieta equilibrata è essenziale."],
  AR: ["الحياة الصحية تحتاج اليوغا اليومية.","المشي الصباحي يحافظ على اللياقة.","النظام الغذائي المتوازن ضروري."],
  PT: ["Vida saudável precisa de ioga diária.","Caminhada matinal mantém o corpo em forma.","Dieta equilibrada é essencial."],
  BN: ["সুস্থ জীবনের জন্য প্রতিদিন যোগব্যায়াম প্রয়োজন।","সকালে হাঁটা শরীরকে সুস্থ রাখে।","সুষম খাদ্য অপরিহার্য।"],
  UR: ["صحت مند زندگی کے لیے روزانہ یوگا ضروری ہے۔","صبح کی سیر جسم کو تندرست رکھتی ہے۔","متوازن غذا ضروری ہے۔"],
  ZH: ["健康生活需要每天瑜伽。","晨步保持身体健康。","均衡饮食至关重要。"],
  KO: ["건강한 삶을 위해서는 매일 요가가 필요합니다.","아침 산책은 몸을 건강하게 유지합니다.","균형 잡힌 식단이 필수적입니다."],
  TR: ["Sağlıklı yaşam için günlük yoga gereklidir.","Sabah yürüyüşü vücudu zinde tutar.","Dengeli beslenme şarttır."],
  NL: ["Gezond leven vereist dagelijkse yoga.","Ochtendwandeling houdt het lichaam fit.","Evenwichtige voeding is essentieel."],
  PL: ["Zdrowe życie wymaga codziennej jogi.","Poranny spacer utrzymuje ciało w formie.","Zrównoważona dieta jest niezbędna."],
  TH: ["ชีวิตที่มีสุขภาพดีต้องโยคะทุกวัน","การเดินตอนเช้าทำให้ร่างกายแข็งแรง","อาหารที่สมดุลเป็นสิ่งจำเป็น"],
  VI: ["Cuộc sống khỏe mạnh cần yoga hàng ngày.","Đi bộ buổi sáng giữ cơ thể khỏe mạnh.","Chế độ ăn cân bằng là điều cần thiết."],
  ID: ["Hidup sehat membutuhkan yoga harian.","Jalan pagi menjaga tubuh tetap bugar.","Diet seimbang sangat penting."],
  TA: ["ஆரோக்கியமான வாழ்வுக்கு தினமும் யோகா தேவை.","காலை நடை உடலை ஆரோக்கியமாக வைக்கிறது.","சமச்சீர் உணவு அவசியம்."],
  TE: ["ఆరోగ్యకరమైన జీవితానికి రోజూ యోగా అవసరం.","ఉదయం నడక శరీరాన్ని ఫిట్‌గా ఉంచుతుంది.","సమతుల్య ఆహారం అవసరం."],
  MR: ["निरोगी जीवनासाठी रोज योग आवश्यक आहे.","सकाळी चालणे शरीर तंदुरुस्त ठेवते.","संतुलित आहार आवश्यक आहे."],
  GU: ["સ્વસ્થ જીવન માટે રોજ યોગ જરૂરી છે.","સવારે ચાલવાથી શરીર સ્વસ્થ રહે છે.","સંતુલિત આહાર જરૂરી છે."],
  PA: ["ਸਿਹਤਮੰਦ ਜੀਵਨ ਲਈ ਰੋਜ਼ਾਨਾ ਯੋਗਾ ਜ਼ਰੂਰੀ ਹੈ।","ਸਵੇਰ ਦੀ ਸੈਰ ਸਰੀਰ ਨੂੰ ਤੰਦਰੁਸਤ ਰੱਖਦੀ ਹੈ।","ਸੰਤੁਲਿਤ ਖੁਰਾਕ ਜ਼ਰੂਰੀ ਹੈ।"],
  ML: ["ആരോഗ്യകരമായ ജീവിതത്തിന് ദിവസവും യോഗ ആവശ്യമാണ്.","രാവിലെ നടത്തം ശരീരത്തെ ആരോഗ്യത്തോടെ നിലനിർത്തുന്നു.","സമീകൃതാഹാരം അത്യാവശ്യമാണ്."],
  KN: ["ಆರೋಗ್ಯಕರ ಜೀವನಕ್ಕೆ ಪ್ರತಿದಿನ ಯೋಗ ಅಗತ್ಯ.","ಬೆಳಿಗ್ಗೆ ನಡಿಗೆ ದೇಹವನ್ನು ಫಿಟ್ ಆಗಿಡುತ್ತದೆ.","ಸಮತೋಲಿತ ಆಹಾರ ಅತ್ಯಗತ್ಯ."],
  OR: ["ସୁସ୍ଥ ଜୀବନ ପାଇଁ ପ୍ରତିଦିନ ଯୋଗ ଆବଶ୍ୟକ।","ସକାଳ ଚାଲିବା ଶରୀରକୁ ସୁସ୍ଥ ରଖେ।","ସନ୍ତୁଳିତ ଖାଦ୍ୟ ଜରୁରୀ।"],
    AS: ["সুস্থ জীৱনৰ বাবে দৈনিক যোগ প্ৰয়োজন।","পুৱাৰ খোজে শৰীৰক সুস্থ ৰাখে।","সুষম খাদ্য অপৰিহাৰ্য।"],
  NE: ["स्वस्थ जीवनका लागि दैनिक योग आवश्यक छ।","बिहानको हिँडाइले शरीरलाई स्वस्थ राख्छ।","सन्तुलित भोजन आवश्यक छ।"],
  SI: ["නිරෝගී ජීවිතයට දිනපතා යෝග අවශ්‍යයි.","උදෑසන ඇවිදීම ශරීරය නිරෝගීව තබයි.","සමබර ආහාර අත්‍යවශ්‍යයි."],
  MY: ["ကျန်းမာသောဘဝအတွက် နေ့စဉ်ယောဂ လိုအပ်သည်။","မနက်ခင်းလမ်းလျှောက်ခြင်းက ခန္ဓာကိုယ်ကို ကျန်းမာစေသည်။","မျှတသောအစားအစာ မရှိမဖြစ်လိုအပ်သည်။"],
  KM: ["ជីវិតដែលមានសុខភាពល្អត្រូវការយូហ្គាប្រចាំថ្ងៃ។","ការដើរពេលព្រឹកធ្វើឱ្យរាងកាយមានសុខភាពល្អ។","របបអាហារមានតុល្យភាពគឺចាំបាច់។"],
  LO: ["ຊີວິດທີ່ມີສຸຂະພາບດີຕ້ອງການໂຍຄະທຸກມື້.","ການຍ່າງຕອນເຊົ້າຮັກສາຮ່າງກາຍໃຫ້ແຂງແຮງ.","ອາຫານທີ່ສົມດູນແມ່ນຈໍາເປັນ."],
  MS: ["Kehidupan sihat memerlukan yoga harian.","Berjalan pagi mengekalkan kecergasan badan.","Diet seimbang adalah penting."],
  FIL: ["Ang malusog na buhay ay nangangailangan ng pang-araw-araw na yoga.","Ang paglalakad sa umaga ay nagpapanatili sa katawan na malusog.","Mahalaga ang balanseng diyeta."],
  TL: ["Ang malusog na buhay ay nangangailangan ng pang-araw-araw na yoga.","Ang paglalakad sa umaga ay nagpapanatili sa katawan na malusog.","Mahalaga ang balanseng diyeta."],
  SW: ["Maisha yenye afya yanahitaji yoga ya kila siku.","Kutembea asubuhi huweka mwili sawa.","Lishe bora ni muhimu."],
  AM: ["ጤናማ ሕይወት ዕለታዊ ዮጋ ያስፈልገዋል።","ጠዋት የእግር ጉዞ አካልን ጤናማ ያደርገዋል።","ሚዛናዊ አመጋገብ አስፈላጊ ነው።"],
  HA: ["Rayuwa mai lafiya tana bukatar yoga na yau da kullun.","Tafiya da safe yana kiyaye jiki lafiya.","Daidaitaccen abinci yana da mahimmanci."],
  YO: ["Igbesi aye ilera nilo yoga ojoojumo.","Rin ni owuro n je ki ara wa ni ilera.","Ounje iwontunwonsi se pataki."],
  IG: ["Ndu ahuike choro yoga kwa ubochi.","Ije ututu na-eme ka ahu di nma.","Nri kwesiri ekwesi di mkpa."],
  ZU: ["Impilo enempilo idinga i-yoga yansuku zonke.","Ukuhamba ekuseni kugcina umzimba uqinile.","Ukudla okunokulinganisela kubalulekile."],
  AF: ["Gesonde lewe benodig daaglikse joga.","Oggendstap hou die liggaam fiks.","Gebalanseerde dieet is noodsaaklik."],
  SO: ["Nolosha caafimaadka qabta waxay u baahan tahay yoga maalinle ah.","Socodka subaxnimo wuxuu jirka dhigayaa mid taam ah.","Cunto dheellitiran waa muhiim."],
  EL: ["Η υγιής ζωή χρειάζεται καθημερινή γιόγκα.","Το πρωινό περπάτημα κρατά το σώμα σε φόρμα.","Η ισορροπημένη διατροφή είναι απαραίτητη."],
  HE: ["חיים בריאים דורשים יוגה יומית.","הליכת בוקר שומרת על הגוף בכושר.","תזונה מאוזנת חיונית."],
  FA: ["زندگی سالم نیاز به یوگای روزانه دارد.","پیاده‌روی صبحگاهی بدن را سالم نگه می‌دارد.","رژیم متعادل ضروری است."],
  PS: ["روغ ژوند ورځني یوګا ته اړتیا لري.","سهار ګرځېدل بدن روغ ساتي.","متوازن خواړه اړین دي."],
  KU: ["Jiyana saxlem rojane yoga hewce dike.","Meşa sibehê laş saxlem dihêle.","Xwarina hevseng pewîst e."],
  HY: ["Առողջ կյանքը պահանջում է ամենօրյա յոգա։","Առավոտյան զբոսանքը մարմինը առողջ է պահում։","Հավասարակշռված սննդակարգը կարևոր է։"],
  KA: ["ჯანსაღი ცხოვრება ყოველდღიურ იოგას საჭიროებს.","დილის სეირნობა სხეულს ჯანმრთელს უნარჩუნებს.","დაბალანსებული დიეტა აუცილებელია."],
  AZ: ["Sağlam həyat gündəlik yoqa tələb edir.","Səhər gəzintisi bədəni sağlam saxlayır.","Balanslı pəhriz vacibdir."],
  KK: ["Салауатты өмір күнделікті йоганы қажет етеді.","Таңертеңгі серуен денені сау ұстайды.","Теңгерімді диета маңызды."],
  UZ: ["Sog'lom hayot kundalik yoga talab qiladi.","Ertalab yurish tanani sog'lom saqlaydi.","Balansli ovqatlanish muhim."],
  TJ: ["Ҳаёти солим йогаи ҳаррӯзаро талаб мекунад.","Пиёдагардии субҳ баданро солим нигоҳ медорад.","Парҳези мутавозин муҳим аст."],
  MN: ["Эрүүл амьдралд өдөр тутмын йог хэрэгтэй.","Өглөөний алхалт биеийг эрүүл байлгадаг.","Тэнцвэртэй хооллолт чухал."],
  BO: ["བདེ་ཐང་གི་འཚོ་བ་ལ་ཉིན་རེའི་ཡོ་ག་དགོས།","སྔ་དྲོའི་འཆམ་འཆམ་གྱིས་ལུས་པོ་བདེ་ཐང་བཞག་།","ཆ་སྙོམས་ཟས་རིགས་གལ་ཆེ།"],
  UK: ["Здорове життя потребує щоденної йоги.","Ранкова прогулянка тримає тіло у формі.","Збалансоване харчування є важливим."],
  BE: ["Здаровае жыццё патрабуе штодзённай ёгі.","Ранішняя прагулка трымае цела ў форме.","Збалансаванае харчаванне важна."],
  CS: ["Zdravý život vyžaduje každodenní jógu.","Ranní procházka udržuje tělo v kondici.","Vyvážená strava je nezbytná."],
  SK: ["Zdravý život si vyžaduje každodennú jogu.","Ranná prechádzka udržuje telo v kondícii.","Vyvážená strava je nevyhnutná."],
  HU: ["Az egészséges élethez napi jóga szükséges.","A reggeli séta fitten tartja a testet.","A kiegyensúlyozott étrend elengedhetetlen."],
  RO: ["Viața sănătoasă are nevoie de yoga zilnic.","Plimbarea de dimineață menține corpul în formă.","Dieta echilibrată este esențială."],
  BG: ["Здравословният живот изисква ежедневно йога.","Сутрешната разходка поддържа тялото във форма.","Балансираната диета е от съществено значение."],
  SR: ["Zdrav život zahteva svakodnevnu jogu.","Jutarnja šetnja održava telo u formi.","Uravnotežena ishrana je neophodna."],
  HR: ["Zdrav život zahtijeva svakodnevnu jogu.","Jutarnja šetnja održava tijelo u formi.","Uravnotežena prehrana je bitna."],
  BS: ["Zdrav život zahtijeva svakodnevnu jogu.","Jutarnja šetnja održava tijelo u formi.","Uravnotežena ishrana je bitna."],
  SL: ["Zdravo življenje zahteva vsakodnevno jogo.","Jutranji sprehod ohranja telo v formi.","Uravnotežena prehrana je bistvena."],
  LT: ["Sveikam gyvenimui reikia kasdienės jogos.","Ryto pasivaikščiojimas palaiko kūno formą.","Subalansuota mityba yra būtina."],
  LV: ["Veselīgai dzīvei nepieciešama ikdienas joga.","Rīta pastaiga uztur ķermeni formā.","Sabalansēts uzturs ir būtisks."],
  ET: ["Tervislik elu vajab igapäevast joogat.","Hommikune jalutuskäik hoiab keha vormis.","Tasakaalustatud toitumine on hädavajalik."],
  FI: ["Terveellinen elämä vaatii päivittäistä joogaa.","Aamukävely pitää kehon kunnossa.","Tasapainoinen ruokavalio on välttämätön."],
  SV: ["Hälsosamt liv kräver daglig yoga.","Morgonpromenad håller kroppen i form.","Balanserad kost är viktigt."],
  NO: ["Sunt liv krever daglig yoga.","Morgentur holder kroppen i form.","Balansert kosthold er viktig."]
}
export default function Page(){
const [lang,setLang]=useState("HI")
const [mode,setMode]=useState("paragraph")
const [cnt,setCnt]=useState(3)
const [out,setOut]=useState("")
const [cp,setCp]=useState(false)
const [menu,setMenu]=useState(false)
const gen=()=>{
let base=DB[lang]||DB.EN
let words=base.join(" ").split(/\s+/).filter(Boolean)
let r=""
if(mode==="word"){r=words.slice(0,cnt).join(" ")}
else if(mode==="sentence"){let arr=[];while(arr.length<cnt){arr=arr.concat(base)};r=arr.slice(0,cnt).join(" ")}
else if(mode==="list"){let arr=[];while(arr.length<cnt){arr=arr.concat(base)};r=arr.slice(0,cnt).map(v=>`• ${v}`).join("\n")}
else{let a=[];for(let i=0;i<cnt;i++){a.push(base[i%base.length])};r=a.join("\n\n")}
setOut(r)
}
useEffect(()=>{gen()},[lang,mode,cnt])
return(
<div style={{background:"#f8fafc",minHeight:"100vh",color:"#111",fontFamily:"system-ui"}}>
<header style={{background:"#fff",padding:"12px 14px",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,borderBottom:"1px solid #e5e7eb",zIndex:20}}>
<b style={{fontSize:14}}>LoremPro V25 - 75 Native ✓</b>
<button onClick={()=>setMenu(!menu)} style={{background:"#111",color:"#fff",borderRadius:999,padding:"8px 16px",border:"none",fontWeight:800}}>☰ Menu</button>
</header>
{menu && <div style={{background:"#fff",padding:12,display:"flex",gap:8,flexWrap:"wrap",borderBottom:"1px solid #e5e7eb",position:"sticky",top:48,zIndex:10}}>
{[["gen","Generator"],["art","Articles"],["use","How to Use"],["tools","Other Tools"],["hire","Hire Me"]].map(([id,lbl])=><button key={id} onClick={()=>{setMenu(false);document.getElementById(id)?.scrollIntoView({behavior:"smooth"})}} style={{border:"1px solid #111",padding:"8px 12px",borderRadius:999,fontSize:11,fontWeight:800,background:"#fff"}}>{lbl}</button>)}</div>}
<div style={{maxWidth:640,margin:"auto",padding:12}}>
<div id="gen" style={{background:"#fff",borderRadius:16,padding:14,border:"1px solid #e5e7eb"}}>
<label style={{fontSize:12,fontWeight:900}}>SELECT LANGUAGE - 75 NATIVE</label>
<select value={lang} onChange={e=>setLang(e.target.value)} style={{width:"100%",padding:14,borderRadius:12,border:"2px solid #6366f1",fontWeight:800,marginTop:8,background:"#fff"}}>
{LANGS.map(([c,n])=><option key={c} value={c}>{c} - {n}</option>)}
</select>
<div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,marginTop:12}}>
{["paragraph","sentence","word","list"].map(m=><button key={m} onClick={()=>setMode(m)} style={{padding:10,borderRadius:10,background:mode===m?"#6366f1":"#f3f4f6",color:mode===m?"#fff":"#111",border:"none",fontSize:10,fontWeight:800}}>{m.toUpperCase()}</button>)}</div>
<div style={{display:"flex",gap:10,alignItems:"center",marginTop:12}}><span style={{fontSize:11,fontWeight:800}}>COUNT:</span><input type="range" min={1} max={50} value={cnt} onChange={e=>setCnt(Number(e.target.value))} style={{flex:1}}/><b style={{border:"2px solid #111",padding:"6px 12px",borderRadius:8}}>{cnt}</b></div>
<button onClick={gen} style={{width:"100%",background:"#111",color:"#fff",padding:14,borderRadius:12,fontWeight:900,marginTop:12,border:"none"}}>GENERATE {mode.toUpperCase()} - {lang}</button>
<div style={{background:"#fff",color:"#000",border:"2px solid #111",borderRadius:12,padding:14,marginTop:14,whiteSpace:"pre-wrap",fontSize:15,lineHeight:"24px",minHeight:90}}>{out}</div>
<div style={{display:"flex",gap:6,marginTop:10}}><button onClick={()=>{navigator.clipboard.writeText(out);setCp(true);setTimeout(()=>setCp(false),1500)}} style={{background:cp?"#16a34a":"#111",color:"#fff",padding:"10px 16px",borderRadius:999,border:"none",fontWeight:800}}>{cp?"Copied ✓":"Copy"}</button></div>
</div>

<div id="art" style={{background:"#fff",borderRadius:16,padding:14,marginTop:14,border:"1px solid #e5e7eb"}}><h3 style={{fontSize:14,fontWeight:900,margin:0}}>📚 Latest Articles</h3>
<div style={{marginTop:10,display:"grid",gap:8}}>
<div style={{border:"1px solid #f1f5f9",padding:10,borderRadius:12,background:"#f8fafc"}}><b style={{fontSize:12}}>What is Lorem Ipsum in 75 Languages?</b><p style={{fontSize:11,color:"#555",margin:"4px 0 0"}}>Native dummy text boosts SEO by 40%.</p></div>
<div style={{border:"1px solid #f1f5f9",padding:10,borderRadius:12,background:"#f8fafc"}}><b style={{fontSize:12}}>Why Native Lorem Matters</b><p style={{fontSize:11,color:"#555",margin:"4px 0 0"}}>Users stay longer in own script.</p></div>
</div></div>

<div id="use" style={{background:"#fff",borderRadius:16,padding:14,marginTop:14,border:"1px solid #e5e7eb"}}><h3 style={{fontSize:14,fontWeight:900,margin:0}}>❓ How to Use</h3>
<ol style={{fontSize:12,lineHeight:"20px",paddingLeft:18,marginTop:8}}>
<li><b>Language chuno</b> - 75 me se real native.</li>
<li><b>Mode chuno</b> - Paragraph / Sentence / WORD exact / List.</li>
<li><b>Count 1-50</b> - Slider.</li>
<li><b>Generate + Copy</b></li>
</ol></div>

<div id="tools" style={{background:"#fff",borderRadius:16,padding:14,marginTop:14,border:"1px solid #e5e7eb"}}><h3 style={{fontSize:14,fontWeight:900,margin:0}}>🛠️ Other Useful Tools</h3>
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:10}}>
{["Word Counter","Char Counter","Hashtag Gen","Meta Tags","YT Title Gen","Slug Gen","Case Converter","Blogger Full Width","SEO Checker","QR Gen","Password Gen","Lorem EN"].map(t=><div key={t} style={{border:"1px solid #e5e7eb",padding:10,borderRadius:10,fontSize:11,fontWeight:700,display:"flex",justifyContent:"space-between"}}><span>{t}</span><span>→</span></div>)}
</div></div>

<div id="hire" style={{background:"#111",color:"#fff",borderRadius:16,padding:16,marginTop:14}}><h3 style={{margin:0,fontSize:14}}>👨‍💻 Hire Me</h3><p style={{fontSize:12,lineHeight:"18px",marginTop:6,color:"#cbd5e1"}}>Custom Blogger/WordPress tools chahiye? Fast SEO tools banata hu. Contact karo.</p><div style={{display:"flex",gap:8,marginTop:10}}><a href="mailto:hire@example.com" style={{background:"#fff",color:"#111",padding:"8px 14px",borderRadius:999,fontSize:12,fontWeight:800,textDecoration:"none"}}>Email Me</a></div></div>

<footer style={{background:"#fff",borderRadius:16,padding:14,marginTop:14,border:"1px solid #e5e7eb",textAlign:"center"}}>
<div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap",fontSize:11,fontWeight:700}}><a href="#gen" style={{color:"#111"}}>Generator</a><a href="#art" style={{color:"#111"}}>Articles</a><a href="#use" style={{color:"#111"}}>How to Use</a><a href="#tools" style={{color:"#111"}}>Tools</a><a href="#hire" style={{color:"#111"}}>Hire Me</a></div>
<p style={{fontSize:11,color:"#666",marginTop:10}}>© 2026 LoremPro V25 - 75 Native - All Rights Reserved</p>
</footer>

</div></div>)
}
