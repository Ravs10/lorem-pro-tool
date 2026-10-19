"use client"
import SeoContent from "./components/SeoContent";
import {useState,useEffect} from "react"
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://YOUR_PROJECT.supabase.co', 'YOUR_ANON_KEY')
const LANGS=[
["EN","English - USA UK"],["HI","हिन्दी - India"],["ZH","中文 - China"],
["ES","Español - Spain Mexico"],["FR","Français - France"],["DE","Deutsch - Germany"],
["JA","日本語 - Japan"],["KO","한국어 - Korea"],["RU","Русский - Russia"],
["PT","Português - Brazil"],["AR","العربية - Saudi UAE"],["TR","Türkçe - Turkey"],
["IT","Italiano - Italy"],["NL","Nederlands"],["PL","Polski"],["VI","Tiếng Việt"],
["TH","ไทย - Thailand"],["ID","Indonesia"],["TL","Filipino - Philippines"],
["BN","বাংলা - Bangladesh"],["TE","తెలుగు"],["TA","தமிழ்"],["MR","मराठी"],
["GU","ગુજરાતી"],["KN","ಕನ್ನಡ"],["ML","മലയാളം"],["OR","ଓଡ଼ିଆ"],
["PA","ਪੰਜਾਬੀ"],["UR","اردو - Pakistan"],["FA","فارسی - Iran"],
["HE","עברית - Israel"],["EL","Ελληνικά - Greece"],["UK","Українська - Ukraine"],
["CS","Čeština"],["RO","Română"],["HU","Magyar"],["SV","Svenska"],["DA","Dansk"],
["FI","Suomi"],["NO","Norsk"],["SW","Swahili - Kenya"],["AM","አማርኛ - Ethiopia"],
["HA","Hausa - Nigeria"],["AF","Afrikaans - SA"],["NE","नेपाली - Nepal"],
["SI","සිංහල - Sri Lanka"],["MY","မြန်မာ - Myanmar"],["LO","ລາວ - Laos"],
["KM","ខ្មែរ - Cambodia"],["AS","অসমীয়া"],["SD","سنڌي"],["PS","پښتو - Afghan"],
["KU","Kurdî"],["AZ","Azərbaycan"],["KK","Қазақ"],["UZ","Oʻzbek"],
["HY","Հայերեն"],["KA","ქართული"],["MK","Македонски"],["IS","Íslenska"],
["MT","Malti"],["GA","Gaeilge"],["CY","Cymraeg"],["EU","Euskara"],
["CA","Català"],["GL","Galego"],["LT","Lietuvių"],["LV","Latviešu"],
["ET","Eesti"],["HR","Hrvatski"],["SR","Српски"],["BG","Български"],
["SK","Slovenčina"],["SL","Slovenščina"],["SQ","Shqip"],["BO","བོད་ཡིག - Tibet"],
["DZ","རྫོང་ཁ - Bhutan"]
]
const DB:any={
"HI":["स्वस्थ जीवन के लिए योग जरूरी है","कृत्रिम बुद्धिमत्ता दुनिया बदल रही है","शिक्षा ही सफलता की कुंजी है","ईमानदारी व्यापार की सबसे अच्छी नीति है","प्रकृति सुंदर और शांत है","क्रिकेट भारत में सबसे पसंदीदा खेल है","ताजा फल सेहत के लिए अच्छे हैं","सुबह टहलना फिट रखता है","इंटरनेट ने दुनिया को जोड़ दिया है","किताबें हमें ज्ञान देती हैं","ग्राहक की खुशी सबसे जरूरी है","पेड़ हमें ऑक्सीजन देते हैं","फल इम्युनिटी बढ़ाते हैं","स्मार्टफोन ने जीवन आसान कर दिया है","शिक्षक छात्रों को सही रास्ता दिखाते हैं","टीम वर्क से सफलता मिलती है","यात्रा हमें नई संस्कृति सिखाती है","दौड़ना दिल के लिए अच्छा है","घर का खाना सबसे अच्छा होता है","कोडिंग भविष्य की भाषा है","मेहनत हमेशा रंग लाती है","समय का प्रबंधन उत्पादकता बढ़ाता है","पहाड़ शांत और भव्य होते हैं","योग मन और शरीर को स्वस्थ रखता है","तनाव कम करने के लिए ध्यान करें","साइबर सुरक्षा हमारे डेटा की रक्षा करती है","विज्ञान हमें दुनिया के बारे में सिखाता है","गुणवत्ता वाला उत्पाद हमेशा जीतता है","साफ वातावरण हमें स्वस्थ रखता है","मुस्कुराना दिन को सुंदर बनाता है"],
"EN":["Healthy life needs yoga for fitness","Artificial intelligence is changing the world","Education is the key to success","Honesty is best policy in business","Nature is beautiful and peaceful","Cricket is loved in India","Fresh fruits are good for health","Morning walk keeps body active","Internet connects people across the globe","Books give us knowledge and wisdom","Customer satisfaction is most important","Trees give us oxygen and shade","Fresh fruits boost immunity naturally","Smartphones have made life easier","Teachers guide students to right path","Teamwork leads to success","Travel teaches us new cultures","Running is good for heart","Home food is the best food","Coding is the language of future","Hard work always pays off","Time management increases productivity","Mountains are calm and majestic","Yoga keeps mind and body healthy","Meditate to reduce stress","Cybersecurity protects our personal data","Science teaches us about the world","Quality product always wins","Clean environment keeps us healthy","Smiling makes day beautiful"],
"OR":["ସୁସ୍ଥ ଜୀବନ ପାଇଁ ଯୋଗ ଜରୁରୀ","ସକାଳେ ବୁଲିବା ଭଲ","ଫଳ ଭଲ","ପାଣି ପିଅ"], "BN":["সুস্থ জীবনের জন্য যোগ জরুরি","সকালে হাঁটা ভালো","ফল ভালো","জল খাও"],
"TE":["ఆరోగ్యానికి యోగా అవసరం","ఉదయం నడక మంచిది","పండ్లు మంచివి"], "TA":["ஆரோக்கியத்திற்கு யோகா தேவை","காலை நடை நல்லது","பழங்கள் நல்லது"],
"KN":["ಆರೋಗ್ಯಕ್ಕೆ ಯೋಗ ಬೇಕು","ಬೆಳಗಿನ ನಡಿಗೆ ಒಳ್ಳೆಯದು"], "ML":["ആരോഗ്യത്തിന് യോഗ വേണം","രാവിലെ നടത്തം നല്ലതാണ്"],
"MR":["आरोग्यासाठी योग हवा","सकाळी चालणे चांगले"], "GU":["સ્વાસ્થ્ય માટે યોગ જરૂરી છે","સવારમાં ચાલવું સારું"],
"PA":["ਸਿਹਤ ਲਈ ਯੋਗਾ ਜ਼ਰੂਰੀ ਹੈ","ਸਵੇਰ ਦੀ ਸੈਰ ਚੰਗੀ ਹੈ"], "UR":["صحت کے لیے یوگا ضروری ہے","صبح کی سیر اچھی ہے"],
"AS":["স্বাস্থ্যৰ বাবে যোগ জৰুৰী","পুৱা খোজ ভাল"], "NE":["स्वास्थ्यको लागि योग चाहिन्छ","बिहान हिँड्नु राम्रो"],
"SI":["සෞඛ්‍යයට යෝග අවශ්‍යයි","උදේ ඇවිදීම හොඳයි"], "MY":["ကျန်းမာရေးအတွက် ယောဂ လိုသည်","မနက်လမ်းလျှောက် ကောင်းသည်"],
"TH":["สุขภาพต้องโยคะ","เดินตอนเช้าดี"], "LO":["ສຸຂະພາບຕ້ອງການໂຍຄະ","ຍ່າງເຊົ້າດີ"],
"KM":["សុខភាពត្រូវការយូហ្គា","ដើរព្រឹកល្អ"], "VI":["Sức khỏe cần yoga","Đi bộ sáng tốt"],
"ID":["Sehat butuh yoga","Jalan pagi baik"], "TL":["Kalusugan nangangailangan ng yoga","Lakad sa umaga mabuti"],
"ZH":["健康需要瑜伽","晨走很好"], "JA":["健康にはヨガが必要","朝の散歩は良い"],
"KO":["건강에는 요가가 필요","아침 산책은 좋다"], "AR":["الصحة تحتاج يوجا","المشي صباحا جيد"],
"FA":["سلامتی به یوگا نیاز دارد","پیاده روی صبح خوب است"], "HE":["בריאות צריכה יוגה","הליכת בוקר טובה"],
"TR":["Sağlık için yoga gerek","Sabah yürüyüşü iyi"], "FR":["Santé a besoin de yoga","Marche matinale bonne"],
"DE":["Gesundheit braucht Yoga","Morgenspaziergang gut"], "ES":["Salud necesita yoga","Caminata mañana buena"],
"PT":["Saúde precisa yoga","Caminhada manhã boa"], "IT":["Salute ha bisogno di yoga","Passeggiata mattina buona"],
"NL":["Gezondheid heeft yoga nodig","Ochtendwandeling goed"], "PL":["Zdrowie potrzebuje jogi","Poranny spacer dobry"],
"RU":["Здоровой жизни нужна йога","Утренняя прогулка хороша"], "UK":["Здоровому життю потрібна йога","Ранкова прогулянка добра"],
"EL":["Υγεία χρειάζεται γιόγκα","Πρωινός περίπατος καλός"], "CS":["Zdraví potřebuje jógu","Ranní procházka dobrá"],
"RO":["Sănătate are nevoie de yoga","Plimbarea dimineața bună"], "HU":["Egészségnek jóga kell","Reggeli séta jó"],
"SV":["Hälsa behöver yoga","Morgonpromenad bra"], "DA":["Sundhed har brug for yoga","Morgentur god"],
"FI":["Terveys tarvitsee joogaa","Aamukävely hyvä"], "NO":["Helse trenger yoga","Morgentur god"],
"SW":["Afya inahitaji yoga","Kutembea asubuhi nzuri"], "AM":["ጤናማ ሕይወት ዮጋ ያስፈልገዋል","ጠዋት ጉዞ ጥሩ"],
"HA":["Lafiya na bukatar yoga","Tafiya da safe kyau"], "AF":["Gesondheid het joga nodig","Oggendstaptog goed"],
"SQ":["Shëndeti ka nevojë për joga","Shëtitja mëngjesit mirë"], "HR":["Zdravlje treba jogu","Jutarnja šetnja dobra"],
"SR":["Здравље треба јогу","Јутарња шетња добра"], "BG":["Здравето се нуждае от йога","Сутрешна разходка добра"],
"SK":["Zdravie potrebuje jogu","Ranná prechádzka dobrá"], "SL":["Zdravje potrebuje jogo","Jutranji sprehod dober"],
"LT":["Sveikatai reikia jogos","Rytinis pasivaikščiojimas geras"], "LV":["Veselībai vajag jogu","Rīta pastaiga laba"],
"ET":["Tervis vajab joogat","Hommikune jalutus hea"], "MT":["Saħħa teħtieġ yoga","Mixja filgħodu tajba"],
"GA":["Sláinte teastaíonn yoga","Siúlóid maidin maith"], "CY":["Iechyd angen yoga","Taith bore da"],
"EU":["Osasunak yoga behar du","Goizeko ibilaldia ona"], "CA":["Salut necessita ioga","Passeig matí bo"],
"GL":["Saúde precisa ioga","Paseo mañá bo"], "IS":["Heilsa þarf jóga","Morgunganga góð"],
"MK":["Здравјето има потреба од јога","Утринска прошетка добра"], "HY":["Առողջ կյանքը յոգայի կարիք ունի","Առավոտյան զբոսանքը լավ է"],
"KA":["ჯანსაღ ცხოვრებას იოგა სჭირდება","დილის გასეირნება კარგია"], "AZ":["Sağlamlıq yoqaya ehtiyac duyur","Səhər gəzintisi yaxşıdır"],
"KK":["Денсаулыққа йога қажет","Таңертеңгі серуен жақсы"], "UZ":["Sog'lom hayot yoga kerak","Ertalab yurish yaxshi"],
"PS":["روغ ژوند یوګا ته اړتیا لري","سهار ګرځېدل ښه دی"], "SD":["صحت کي يوگا جي ضرورت آهي","صبح جو گهمڻ سٺو"],
"KU":["Tenduristî bi yoga heye","Meşa sibehê baş e"], "BO":["བདེ་ཐང་ལ་ཡོ་ག་དགོས།","སྔ་དྲོའི་འཆམ་འགྲོ་ལེགས།"],
"DZ":["གཟུགས་གཞི་ལུ་ཡོ་ག་དགོ།","དྲོ་པའི་འཆམ་འགྲོ་ལེགས།"]
}
const AND_WORD:any = {
  EN:" and ", HI:" और ", OR:" ଏବଂ ", BN:" এবং ", TE:" మరియు ", TA:" மற்றும் ", KN:" ಮತ್ತು ", ML:" மற்றும் ", MR:" आणि ", GU:" અને ", PA:" ਅਤੇ ", UR:" اور ", AS:" আৰু ", NE:" र ", SI:" සහ ", MY:" နှင့် ", TH:" และ ", LO:" ແລະ ", KM:" និង ", VI:" và ", ID:" dan ", TL:" at ", ZH:" 和 ", JA:" と ", KO:" 그리고 ", AR:" و ", FA:" و ", HE:" ו ", TR:" ve ", FR:" et ", DE:" und ", ES:" y ", PT:" e ", IT:" e ", NL:" en ", PL:" i ", RU:" и ", UK:" і ", EL:" και ", CS:" a ", RO:" și ", HU:" és ", SV:" och ", DA:" og ", FI:" ja ", NO:" og ", SW:" na ", AM:" እና ", HA:" da ", AF:" en ", SQ:" dhe ", HR:" i ", SR:" и ", BG:" и ", SK:" a ", SL:" in ", LT:" ir ", LV:" un ", ET:" ja ", MT:" u ", GA:" agus ", CY:" a ", EU:" eta ", CA:" i ", GL:" e ", IS:" og ", MK:" и ", HY:" և ", KA:" და ", AZ:" və ", KK:" және ", UZ:" va ", PS:" او ", SD:" ۽ ", KU:" û ", BO:" དང་ ", DZ:" དང་ "
};
const getAnd = (lang:string)=> AND_WORD[lang] || " ";
const PUNCT:any = {
  HI:"।", MR:"।", NE:"।", BN:"।", AS:"।", OR:"।",
  UR:"۔", AR:"۔", FA:"۔", PS:"۔", SD:"۔", KU:"۔",
  ZH:"。", JA:"。", TH:".", LO:".",
  HE:".", BO:"།", DZ:"།",
};
const getPunct = (lang:string)=> PUNCT[lang] || ".";
const fixSentence = (s:string, lang:string)=>{
  let t = s.trim();
  const p = getPunct(lang);
  if(/[.!?।॥。۔།]$/.test(t)) return t;
  return t + p;
};
LANGS.forEach(([c]:any)=>{
  if(!DB[c]) DB[c]=["Native content for "+c,"Second sentence native for "+c];
  const base = [...DB[c]];
  DB[c] = base.map((s:string)=>fixSentence(s,c));
  let i = 0;
  while(DB[c].length < 30){
    const a = base[i % base.length].replace(/[.!?।॥。۔།]$/,"").trim();
    const b = base[(i+1) % base.length].replace(/[.!?।॥。۔།]$/,"").trim();
    const c2 = base[(i+2) % base.length].replace(/[.!?।॥。۔།]$/,"").trim();
    const candidate = DB[c].length % 2 === 0
      ? fixSentence(`${a}${getAnd(c)}${b}`, c)
      : fixSentence(`${b}${getAnd(c)}${c2}`, c);
    if(!DB[c].includes(candidate)) DB[c].push(candidate);
    i++;
    if(i>200) break;
  }
  DB[c] = DB[c].slice(0,30);
});
export default function Page(){
const [lang,setLang]=useState("HI")
const [cnt,setCnt]=useState(5)
const [out,setOut]=useState("")
const [page,setPage]=useState("home")
const [mode,setMode]=useState("SENTENCE")
const [copied,setCopied]=useState(false)
const [showDL,setShowDL]=useState(false)
const [isDisabled,setIsDisabled]=useState(false)
useEffect(()=>{supabase.from("tools").select("is_enabled").eq("slug","lorem-ipsum-generator").single().then(({data})=>{if(data && data.is_enabled===false) setIsDisabled(true)})},[])
const gen=()=>{
 if(cnt===0){setOut("");return}
 const base=DB[lang]
 let r=""
 if(mode==="SENTENCE"){ const a=[]; for(let i=0;i<cnt;i++) a.push(fixSentence(base[i%base.length], lang)); r=a.join(" ") }
 if(mode==="PARAGRAPH"){ const paras=[]; for(let p=0;p<cnt;p++){ const len=2+(p%3); const s=[]; for(let j=0;j<len;j++) s.push(fixSentence(base[(p*len+j)%base.length], lang)); paras.push(s.join(" ")); } r=paras.join("\n\n") }
 if(mode==="WORD"){ const all=base.join(" ").replace(/[.!?।॥。۔།,;:()"\-]/g,"").split(/\s+/).filter(Boolean); const a=[]; for(let i=0;i<cnt;i++) a.push(all[i%all.length]); r=a.join(" ") }
 if(mode==="LIST"){ const a=[]; for(let i=0;i<cnt;i++) a.push(`• ${fixSentence(base[i%base.length], lang)}`); r=a.join("\n") }
 setOut(r)
}
useEffect(()=>{gen()},[lang,cnt,mode])
const words = out.trim()?out.trim().split(/\s+/).length:0
const chars = out.length
const charsNoSpace = out.replace(/\s/g,"").length
const sentences = mode==="WORD" ? 0 : (out.trim()?out.split(/[.!?।]/).filter(s=>s.trim().length>2).length:0)
const paras = out.trim()?out.split("\n\n").filter(b=>b.trim()).length:0
const reading = Math.max(1,Math.ceil(words/200))
const isRTL = (l:string)=> ["AR","UR","FA","PS","SD","KU","HE"].includes(l);
const makePDF = (text:string, langCode:string)=>{
  const rtl = isRTL(langCode);
  const esc = text.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\n\n/g,"</p><p>").replace(/\n/g,"<br>");
  const html = `<!DOCTYPE html><html lang="${langCode.toLowerCase()}" dir="${rtl?"rtl":"ltr"}"><head><meta charset="utf-8"><title>Lorem Ipsum - ${langCode}</title><style>body{font-family:"Nirmala UI","Noto Sans","Noto Naskh Arabic","Noto Sans CJK SC","Microsoft YaHei",Arial,sans-serif;line-height:1.8;padding:40px;color:#000}h1{font-size:22px} p{font-size:15px} small{color:#666}</style></head><body><h1>Lorem Ipsum Generator - ${langCode}</h1><p>${esc}</p><p><small>Generated by LoremPro</small></p></body></html>`;
  const w = window.open("", "_blank");
  if(!w){ alert("Please allow popups to download PDF"); return; }
  w.document.write(html); w.document.close(); w.focus();
  setTimeout(()=>{ w.print(); }, 300);
};
const makeRTF = (text:string, langCode:string)=>{
  const rtl = isRTL(langCode);
  const isCJK = ["ZH","JA","KO"].includes(langCode);
  const isArabicScript = ["AR","UR","FA","PS","SD","KU"].includes(langCode);
  const isHebrew = langCode==="HE";
  let fontIdx = 0;
  if(isArabicScript) fontIdx = 1;
  else if(isCJK) fontIdx = 2;
  else if(isHebrew) fontIdx = 3;
  else fontIdx = 0;
  let out = "";
  for(let i=0;i<text.length;i++){
    const ch = text[i];
    const code = text.charCodeAt(i);
    if(ch === "\\") out += "\\\\";
    else if(ch === "{") out += "\\{";
    else if(ch === "}") out += "\\}";
    else if(ch === "\n") out += "\\par ";
    else if(code < 128) out += ch;
    else {
      if(code >= 0xD800 && code <= 0xDBFF && i+1 < text.length){
        const code2 = text.charCodeAt(i+1);
        if(code2 >= 0xDC00 && code2 <= 0xDFFF){
          const s1 = code > 32767 ? code - 65536 : code;
          const s2 = code2 > 32767 ? code2 - 65536 : code2;
          out += `\\u${s1}?\\u${s2}?`;
          i++;
          continue;
        }
      }
      const signed = code > 32767 ? code - 65536 : code;
      out += `\\u${signed}?`;
    }
  }
  const dirTag = rtl ? "\\rtlpar\\rtlch" : "\\pard\\ltrch";
  return new Blob([`{\\rtf1\\ansi\\ansicpg1252\\deff0\\uc1{\\fonttbl{\\f0\\fnil\\fcharset0 Nirmala UI;}{\\f1\\fnil\\fcharset0 Noto Naskh Arabic;}{\\f2\\fnil\\fcharset0 Microsoft YaHei;}{\\f3\\fnil\\fcharset0 Arial;}{\\f4\\fnil\\fcharset0 Arial;}}\\${dirTag}\\f${fontIdx}\\fs24 ${out}}`],{type:"application/rtf"});
};
const doDownload=(type:string)=>{
 if(!out) return
 if(type==="PDF"){ makePDF(out, lang); setShowDL(false); return; }
 let blob:any = null; let ext = type.toLowerCase();
 const BOM = "\uFEFF";
 if(type==="TXT") blob=new Blob([BOM+out],{type:"text/plain;charset=utf-8"});
 if(type==="HTML") blob=new Blob([BOM+`<!DOCTYPE html><html lang="${lang.toLowerCase()}" dir="${isRTL(lang)?"rtl":"ltr"}"><head><meta charset="utf-8"><title>Lorem Ipsum - ${lang}</title><style>body{font-family:"Nirmala UI","Noto Sans","Noto Naskh Arabic",Arial,sans-serif;line-height:1.8;padding:20px}</style></head><body><h1>Lorem Ipsum Generator - ${lang}</h1><p>${out.replace(/\n\n/g,"</p><p>").replace(/\n/g,"<br>")}</p><p><small>Generated by LoremPro</small></p></body></html>`],{type:"text/html;charset=utf-8"});
 if(type==="JSON") blob=new Blob([BOM+JSON.stringify({lang,mode,cnt,words,chars,text:out,generatedAt:new Date().toISOString(),tool:"LoremPro"},null,2)],{type:"application/json;charset=utf-8"});
 if(type==="CSV"){ const esc=(s:string)=>`"${s.replace(/"/g,'""')}"`; blob=new Blob([BOM+`lang,mode,counter,words,chars,text\n${lang},${mode},${cnt},${words},${chars},${esc(out)}`],{type:"text/csv;charset=utf-8"}); }
 if(type==="MD") blob=new Blob([BOM+`# Lorem Ipsum Generator - ${lang}\n\n**Mode:** ${mode} | **Count:** ${cnt} | **Words:** ${words} | **Chars:** ${chars}\n\n${out}\n\n---\nGenerated by LoremPro`],{type:"text/markdown;charset=utf-8"});
 if(type==="JS") blob=new Blob([BOM+`// LoremPro - ${lang} - ${mode}\nexport const loremText = ${JSON.stringify(out)};\nexport const meta = { lang: "${lang}", mode: "${mode}", count: ${cnt}, words: ${words}, chars: ${chars} };`],{type:"text/javascript;charset=utf-8"});
 if(type==="RTF") blob=makeRTF(out, lang);
 const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=`lorem-${lang}.${ext}`; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),2000);
 setShowDL(false)
}
const Wrap=({t,children}:any)=><div style={{background:"#fff",borderRadius:20,padding:20,color:"#000",lineHeight:1.8}}><button onClick={()=>setPage("menu")} style={{padding:"8px 16px",borderRadius:999,border:"2px solid #000",background:"#fff",fontWeight:800}}>← Back to Menu</button><h1 style={{fontSize:22,margin:"10px 0"}}>{t}</h1><div style={{fontSize:14}}>{children}</div></div>
if(isDisabled){return <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#f3f4f6"}}><div style={{background:"white",padding:40,borderRadius:24,textAlign:"center"}}><h1>🔴 Tool Disabled</h1><p>Admin ne isko OFF kiya hai</p></div></div>}
return(
<div style={{background:"#6366f1",minHeight:"100vh",fontFamily:"system-ui"}}>
<style>{`
  .hover-btn{transition:transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease !important; cursor:pointer}
  .hover-btn:hover{transform:translateY(-2px) scale(1.02); box-shadow:0 8px 20px rgba(0,0,0,0.2)}
  .hover-btn:active{transform:translateY(0px) scale(0.98)}
  .menu-btn{transition:transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease !important; cursor:pointer}
  .menu-btn:hover{transform:translateY(-3px) scale(1.03); box-shadow:0 10px 22px rgba(0,0,0,0.18); background:#000 !important; color:#fff !important}
  .lang-btn{transition:transform 0.15s ease, background 0.15s ease !important; cursor:pointer}
  .lang-btn:hover{transform:scale(1.03)}
  .tool-card{transition:transform 0.2s ease, box-shadow 0.2s ease !important}
  .tool-card:hover{transform:translateY(-3px) scale(1.02); box-shadow:0 10px 22px rgba(0,0,0,0.15)}
  .blog-btn{animation: blogPulse 1.5s infinite, blogShine 2.5s infinite; box-shadow: 0 0 0 0 rgba(255,106,0,0.6);}
  .blog-btn:hover{transform: translateY(-3px) scale(1.05) !important; box-shadow: 0 12px 25px rgba(255,106,0,0.5) !important;}
  @keyframes blogPulse{ 0%{ box-shadow: 0 0 0 0 rgba(255,106,0,0.6); } 70%{ box-shadow: 0 0 0 12px rgba(255,106,0,0); } 100%{ box-shadow: 0 0 0 0 rgba(255,106,0,0); } }
  @keyframes blogShine{ 0%{ filter: brightness(1); } 50%{ filter: brightness(1.25); } 100%{ filter: brightness(1); } }
`}</style>
<div style={{textAlign:"right", margin:"8px 0"}}><button onClick={()=>setPage(page==="menu"?"home":"menu")} className="hover-btn" style={{padding:"8px 14px", borderRadius:"20px", border:"1px solid #fff", background:"#000", color:"#fff", fontWeight:"700"}}>☰ Menu</button></div>
{page==="home" && <h1 style={{color:"#fff", fontSize:22, textAlign:"center", margin:"0 0 12px 0", padding:"0 12px"}}>Lorem Ipsum Generator - 77 Languages Free Tool</h1>}
{page==="menu" && (
<div style={{maxWidth:720,margin:"auto",padding:12}}>
<h2 style={{color:"#000",marginTop:0}}>Menu - {LANGS.length} Languages</h2>
<div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8}}>
<button onClick={()=>setPage("home")} className="menu-btn" style={{padding:14,borderRadius:12,background:"#000",color:"#fff",border:"2px solid #000",fontWeight:800,fontSize:13}}>🏠 Generator</button>
<a href="https://lorem-pro-tool.run4ravish.workers.dev/blog" target="_blank" rel="noopener noreferrer" className="blog-btn" style={{padding:14,borderRadius:12,background:"linear-gradient(90deg,#FF6A00,#FF3D00,#FF9800)",color:"#fff",border:"2px solid #000",fontWeight:900,fontSize:13,textDecoration:"none",textAlign:"center",display:"flex",alignItems:"center",justifyContent:"center",gap:6,position:"relative",overflow:"hidden"}}>📰 Blog <span style={{background:"#fff",color:"#FF3D00",fontSize:9,padding:"2px 6px",borderRadius:999,fontWeight:900}}>NEW</span></a>
</div>
<div style={{marginTop:12,border:"2px solid #000",borderRadius:12,padding:8,maxHeight:350,overflowY:"auto",display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:6}}>
{LANGS.map(([c,n]:any)=><button key={c} onClick={()=>{setLang(c);setPage("home")}} className="lang-btn" style={{background:lang===c?"#000":"#f3f4f6",color:lang===c?"#fff":"#000",padding:8,borderRadius:8,fontSize:11,fontWeight:700,border:"none",textAlign:"left"}}>{n}</button>)}
</div>
</div>
)}
<div style={{maxWidth:720,margin:"auto",padding:12}}>
{page==="home"&&<div style={{background:"#fff",borderRadius:20,padding:14}}>
<select value={lang} onChange={e=>setLang(e.target.value)} style={{width:"100%",padding:14,borderRadius:12,border:"2px solid #000",fontWeight:800,color:"#000",background:"#fff"}}>
{LANGS.map(([c,n]:any)=><option key={c} value={c}>{n}</option>)}
</select>
<div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginTop:12}}>
{["SENTENCE","PARAGRAPH","WORD","LIST"].map(m=><button key={m} onClick={()=>setMode(m)} className="hover-btn" style={{padding:11,borderRadius:10,background:mode===m?"#000":"#f3f4f6",color:mode===m?"#fff":"#000",border:"none",fontSize:11,fontWeight:900}}>{m}</button>)}
</div>
<div style={{marginTop:12,background:"#f3f4f6",padding:12,borderRadius:12,border:"2px solid #000"}}>
<label style={{fontWeight:900,color:"#000",fontSize:13}}>Counter - {cnt} / 100 (0-100 FREE)</label>
<div style={{display:"flex",gap:8,marginTop:8,alignItems:"center"}}>
<input type="range" min={0} max={100} value={cnt} onChange={e=>setCnt(Number(e.target.value))} style={{flex:1}}/>
<input type="number" min={0} max={100} value={cnt} onChange={e=>{let v=e.target.value===""?0:parseInt(e.target.value); if(isNaN(v)) v=0; setCnt(Math.min(100,Math.max(0,v)))}} style={{width:80,padding:10,borderRadius:10,border:"2px solid #000",fontWeight:800,color:"#000",background:"#fff",textAlign:"center"}}/>
</div>
</div>
<button onClick={gen} className="hover-btn" style={{width:"100%",background:"#000",color:"#fff",padding:14,borderRadius:12,marginTop:12,fontWeight:900,border:"none",fontSize:15}}>GENERATE {lang} - {cnt} {mode}</button>
<div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginTop:12}}>
<div style={{background:"#dbeafe",padding:10,borderRadius:12,textAlign:"center",border:"2px solid #000"}}><div style={{fontSize:18,fontWeight:900,color:"#000"}}>{words}</div><div style={{fontSize:9,fontWeight:800,color:"#000"}}>WORDS</div></div>
<div style={{background:"#fef9c3",padding:10,borderRadius:12,textAlign:"center",border:"2px solid #000"}}><div style={{fontSize:18,fontWeight:900,color:"#000"}}>{chars}</div><div style={{fontSize:9,fontWeight:800,color:"#000"}}>CHARS</div></div>
<div style={{background:"#dcfce7",padding:10,borderRadius:12,textAlign:"center",border:"2px solid #000"}}><div style={{fontSize:18,fontWeight:900,color:"#000"}}>{sentences}</div><div style={{fontSize:9,fontWeight:800,color:"#000"}}>SENT</div></div>
<div style={{background:"#fce7f3",padding:10,borderRadius:12,textAlign:"center",border:"2px solid #000"}}><div style={{fontSize:18,fontWeight:900,color:"#000"}}>{paras}</div><div style={{fontSize:9,fontWeight:800,color:"#000"}}>PARA</div></div>
</div>
<div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8,marginTop:8}}>
<div style={{background:"#fff",padding:8,borderRadius:10,textAlign:"center",border:"1px dashed #000",fontSize:11,fontWeight:700,color:"#000"}}>No Space: {charsNoSpace}</div>
<div style={{background:"#fff",padding:8,borderRadius:10,textAlign:"center",border:"1px dashed #000",fontSize:11,fontWeight:700,color:"#000"}}>Reading: {reading} min</div>
</div>
<div style={{border:"2px solid #000",borderRadius:12,padding:14,marginTop:12,minHeight:90,background:"#fff",color:"#000",fontSize:14,whiteSpace:"pre-wrap",fontWeight:600,lineHeight:mode==="SENTENCE"?1.4:1.8}}>{out||"Counter 0 hai - 1-100 daalo"}</div>
<div style={{display:"flex",gap:8,marginTop:10}}>
<button onClick={()=>{if(!out) return; navigator.clipboard.writeText(out); setCopied(true); setTimeout(()=>setCopied(false),2000)}} className="hover-btn" style={{flex:1,background:copied?"#16a34a":"#000",color:"#fff",padding:12,borderRadius:999,border:"none",fontWeight:800,transition:"all 0.3s"}}>{copied?"Copied ✅ - Green!":"Copy Text"}</button>
<button onClick={()=>{setOut(""); setCnt(0)}} className="hover-btn" style={{background:"#fff",color:"#000",padding:12,borderRadius:999,border:"2px solid #000",fontWeight:800}}>Clear</button>
</div>
<div style={{marginTop:12,position:"relative"}}>
<button onClick={()=>setShowDL(!showDL)} className="hover-btn" style={{width:"100%",padding:14,borderRadius:12,background:"linear-gradient(90deg,#f43f5e,#8b5cf6,#3b82f6)",color:"#fff",border:"2px solid #000",fontWeight:900}}>📥 DOWNLOAD 8 Types {showDL?"▲":"▼"}</button>
{showDL&&<div style={{position:"absolute",top:"56px",left:0,right:0,background:"#fff",border:"2px solid #000",borderRadius:14,zIndex:20,overflow:"hidden"}}>
{["TXT","HTML","JSON","CSV","MD","JS","RTF","PDF"].map(code=><button key={code} onClick={()=>doDownload(code)} className="hover-btn" style={{width:"100%",padding:12,background:"#fff",color:"#000",border:"none",borderBottom:"1px solid #eee",fontWeight:800,textAlign:"left",fontSize:12,display:"flex",justifyContent:"space-between"}}><span>{code}</span><span style={{fontSize:10,opacity:0.6}}>.{code.toLowerCase()}</span></button>)}
</div>}
</div>
</div>}
<div style={{marginTop:20,background:"#fff",border:"2px solid #000",borderRadius:16,padding:14}}>
<h3 style={{margin:"0 0 12px 0",color:"#000",fontSize:16,fontWeight:900}}>🔧 Other Useful Tools</h3>
<div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10}}>
<a href="/word-counter" className="tool-card" style={{textDecoration:"none",background:"#dbeafe",border:"2px solid #000",padding:12,borderRadius:12,textAlign:"center",display:"block"}}>
<div style={{fontSize:20}}>📝</div>
<div style={{fontSize:12,fontWeight:800,color:"#000",marginTop:4}}>Word Counter</div>
<div style={{fontSize:9,color:"#555"}}>Count words & chars</div>
</a>
<a href="/case-converter" className="tool-card" style={{textDecoration:"none",background:"#fef9c3",border:"2px solid #000",padding:12,borderRadius:12,textAlign:"center",display:"block"}}>
<div style={{fontSize:20}}>🔄</div>
<div style={{fontSize:12,fontWeight:800,color:"#000",marginTop:4}}>Case Converter</div>
<div style={{fontSize:9,color:"#555"}}>UPPER to lower</div>
</a>
<a href="/image-to-text" className="tool-card" style={{textDecoration:"none",background:"#dcfce7",border:"2px solid #000",padding:12,borderRadius:12,textAlign:"center",display:"block"}}>
<div style={{fontSize:20}}>🖼️</div>
<div style={{fontSize:12,fontWeight:800,color:"#000",marginTop:4}}>Image to Text</div>
<div style={{fontSize:9,color:"#555"}}>OCR Tool</div>
</a>
<a href="/qr-generator" className="tool-card" style={{textDecoration:"none",background:"#fce7f3",border:"2px solid #000",padding:12,borderRadius:12,textAlign:"center",display:"block"}}>
<div style={{fontSize:20}}>📱</div>
<div style={{fontSize:12,fontWeight:800,color:"#000",marginTop:4}}>QR Generator</div>
<div style={{fontSize:9,color:"#555"}}>Make QR Code</div>
</a>
<a href="/password-generator" className="tool-card" style={{textDecoration:"none",background:"#e0e7ff",border:"2px solid #000",padding:12,borderRadius:12,textAlign:"center",display:"block"}}>
<div style={{fontSize:20}}>🔑</div>
<div style={{fontSize:12,fontWeight:800,color:"#000",marginTop:4}}>Password Gen</div>
<div style={{fontSize:9,color:"#555"}}>Strong Password</div>
</a>
<a href="/age-calculator" className="tool-card" style={{textDecoration:"none",background:"#ffedd5",border:"2px solid #000",padding:12,borderRadius:12,textAlign:"center",display:"block"}}>
<div style={{fontSize:20}}>🎂</div>
<div style={{fontSize:12,fontWeight:800,color:"#000",marginTop:4}}>Age Calculator</div>
<div style={{fontSize:9,color:"#555"}}>Find your age</div>
</a>
</div>
<p style={{fontSize:10,color:"#666",textAlign:"center",marginTop:10,marginBottom:0}}>More tools coming soon - Stay tuned!</p>
</div>
{page==="home" && (
  <div style={{background:"#fff", marginTop:20, borderRadius:20}}>
    <SeoContent />
  </div>
)}
</div>
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Is Lorem Ipsum Generator free?",
            "acceptedAnswer": { "@type": "Answer", "text": "Yes, 100% free. No login, no signup, no watermark, unlimited generation." }
          },
          {
            "@type": "Question",
            "name": "Can I generate Lorem Ipsum in Hindi?",
            "acceptedAnswer": { "@type": "Answer", "text": "Yes. We support Hindi and 76 other languages including Bengali, Tamil, Telugu, Marathi, Urdu, Spanish, Arabic, French, German, and more." }
          },
          {
            "@type": "Question",
            "name": "Can I download the generated text?",
            "acceptedAnswer": { "@type": "Answer", "text": "Yes. You can download in 8 formats including TXT, HTML, PDF, DOC, JSON, CSV, and Markdown." }
          }
        ]
      })
    }}
  />
</div>)}
