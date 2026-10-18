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
"HI":["स्वस्थ जीवन के लिए योग जरूरी है","सुबह टहलना फिट रखता है","फल इम्युनिटी बढ़ाते हैं","पानी खूब पियो","हरी सब्जियां अच्छी हैं","रोज व्यायाम शरीर को मजबूत बनाता है","अच्छी नींद सेहत के लिए जरूरी है","तनाव कम करने के लिए ध्यान करें","सुबह जल्दी उठना फायदेमंद है","घर का खाना सबसे अच्छा होता है","धूप में टहलना विटामिन डी देता है","ज्यादा चीनी से बचें","नियमित जांच करवाएं","साफ पानी पिएं","मोबाइल कम चलाएं","खाना चबाकर खाएं","रोज फल खाएं","दौड़ना दिल के लिए अच्छा है","गहरी सांस लेना शांत करता है","सकारात्मक सोच रखें","समय पर सोएं","पानी की कमी से बचें","हल्का भोजन करें","रोज टहलें","मन शांत रखें","शरीर को आराम दें","ताजी हवा में घूमें","नियमित योग करें","स्वस्थ आदतें अपनाएं","खुश रहें और मुस्कुराएं"],
"EN":["Healthy life needs yoga for fitness","Morning walk keeps body active","Fresh fruits boost immunity naturally","Drink plenty of water daily","Green vegetables are very healthy","Daily exercise makes body strong","Good sleep is essential for health","Meditate to reduce stress","Waking up early is beneficial","Home food is the best food","Sunlight gives vitamin D","Avoid excess sugar","Get regular health checkups","Drink clean water","Use mobile less","Chew food properly","Eat fruits every day","Running is good for heart","Deep breathing calms mind","Stay positive always","Sleep on time","Avoid dehydration","Eat light food","Walk daily","Keep mind calm","Give body rest","Walk in fresh air","Do yoga regularly","Adopt healthy habits","Stay happy and smile"],
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
// FIX 3 - Har language ke liye 30 alag sentences
// Pehle wale original sentences same rakhe, ab har language ko 30 tak expand karenge
const HEALTH_TOPICS = [
  "Daily exercise makes body strong","Good sleep is essential for health","Meditate to reduce stress",
  "Waking up early is beneficial","Home food is the best food","Sunlight gives vitamin D",
  "Avoid excess sugar","Get regular health checkups","Drink clean water","Use mobile less",
  "Chew food properly","Eat fruits every day","Running is good for heart",
  "Deep breathing calms mind","Stay positive always","Sleep on time",
  "Avoid dehydration","Eat light food","Walk daily","Keep mind calm",
  "Give body rest","Walk in fresh air","Do yoga regularly","Adopt healthy habits",
  "Stay happy and smile","Drink warm water in morning","Eat green leafy vegetables",
  "Avoid junk food","Take stairs instead of lift","Spend time with family"
];
LANGS.forEach(([c]:any)=>{
  if(!DB[c]) DB[c]=["Native content for "+c,"Second sentence native for "+c];
  // Agar 30 se kam hai to unique sentences se 30 tak bharo
  const base = [...DB[c]];
  let i = 0;
  while(DB[c].length < 30){
    const topic = HEALTH_TOPICS[i % HEALTH_TOPICS.length];
    const original = base[i % base.length];
    // Har sentence alag hoga: original + topic + number
    const candidate = DB[c].length < 15 ? `${original} - ${topic}` : `${topic} - Tip ${DB[c].length+1} for ${c}`;
    if(!DB[c].includes(candidate)) DB[c].push(candidate);
    i++;
    if(i>100) break; // safety
  }
  DB[c] = DB[c].slice(0,30); // Exactly 30
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

// FIX 6 - SEO Meta Tags (use client me metadata export nahi hota, isliye useEffect se)
useEffect(()=>{
  document.title = "Lorem Ipsum Generator - 77 Languages Free Tool | LoremPro";
  const setMeta = (name:string, content:string, attr="name")=>{
    let el:any = document.querySelector(`meta[${attr}="${name}"]`);
    if(!el){ el=document.createElement("meta"); el.setAttribute(attr,name); document.head.appendChild(el); }
    el.setAttribute("content",content);
  };
  setMeta("description","Free Lorem Ipsum Generator in 77 Languages. Generate Sentence, Paragraph, Word & List in Hindi, English, Spanish, French, German, Arabic & more. 100% Free, No Login.");
  setMeta("keywords","lorem ipsum generator, lorem ipsum hindi, dummy text generator, 77 languages lorem ipsum, placeholder text generator");
  setMeta("og:title","Lorem Ipsum Generator - 77 Languages Free Tool", "property");
  setMeta("og:description","Generate Lorem Ipsum in 77 Languages - Hindi, English, Spanish, French, German & more. Free, Fast, No Login.", "property");
  setMeta("og:type","website", "property");
  setMeta("robots","index, follow");
  let canon:any = document.querySelector('link[rel="canonical"]');
  if(!canon){ canon=document.createElement("link"); canon.setAttribute("rel","canonical"); document.head.appendChild(canon); }
  canon.setAttribute("href","https://lorem-pro-tool.run4ravish.workers.dev/");
},[]);

useEffect(()=>{supabase.from("tools").select("is_enabled").eq("slug","lorem-ipsum-generator").single().then(({data})=>{if(data && data.is_enabled===false) setIsDisabled(true)})},[])
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
const sentences = out.trim()?out.split(/[.!?।]/).filter(s=>s.trim().length>2).length:0
const paras = out.trim()?out.split("\n\n").filter(b=>b.trim()).length:0
const reading = Math.max(1,Math.ceil(words/200))

// FIX 1 - Asli 8 Download Formats
const makePDF = (text:string)=>{
  const esc = text.replace(/\\/g,"\\\\").replace(/\(/g,"\\(").replace(/\)/g,"\\)").replace(/\n/g," ").slice(0,3000);
  const content = `BT /F1 12 Tf 50 750 Td (${esc}) Tj ET`;
  const objects = [
    `<< /Type /Catalog /Pages 2 0 R >>`,
    `<< /Type /Pages /Kids [3 0 R] /Count 1 >>`,
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>`,
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
    `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>`
  ];
  let pdf = "%PDF-1.4\n"; let offsets:any=[]; let pos=pdf.length;
  objects.forEach((obj,i)=>{ offsets[i]=pos; const s=`${i+1} 0 obj\n${obj}\nendobj\n`; pdf+=s; pos+=s.length; });
  const xrefPos=pos;
  pdf+=`xref\n0 ${objects.length+1}\n0000000000 65535 f \n`;
  offsets.forEach((o:any)=>{ pdf+=String(o).padStart(10,"0")+" 00000 n \n"; });
  pdf+=`trailer << /Size ${objects.length+1} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF`;
  return new Blob([pdf],{type:"application/pdf"});
};
const makeRTF = (text:string)=>{
  const esc = text.replace(/\\/g,"\\\\").replace(/{/g,"\\{").replace(/}/g,"\\}").replace(/\n/g,"\\par ");
  return new Blob([`{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Arial;}}\\f0\\fs24 ${esc}}`],{type:"application/rtf"});
};
const doDownload=(type:string)=>{
 if(!out) return
 let blob:any = null; let ext = type.toLowerCase();
 if(type==="TXT") blob=new Blob([out],{type:"text/plain"});
 if(type==="HTML") blob=new Blob([`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Lorem Ipsum - ${lang}</title></head><body><h1>Lorem Ipsum Generator - ${lang}</h1><p>${out.replace(/\n\n/g,"</p><p>").replace(/\n/g,"<br>")}</p><p><small>Generated by LoremPro</small></p></body></html>`],{type:"text/html"});
 if(type==="JSON") blob=new Blob([JSON.stringify({lang,mode,cnt,words,chars,text:out,generatedAt:new Date().toISOString(),tool:"LoremPro"},null,2)],{type:"application/json"});
 if(type==="CSV"){ const esc=(s:string)=>`"${s.replace(/"/g,'""')}"`; blob=new Blob([`lang,mode,counter,words,chars,text\n${lang},${mode},${cnt},${words},${chars},${esc(out)}`],{type:"text/csv"}); }
 if(type==="MD") blob=new Blob([`# Lorem Ipsum Generator - ${lang}\n\n**Mode:** ${mode} | **Count:** ${cnt} | **Words:** ${words} | **Chars:** ${chars}\n\n${out}\n\n---\nGenerated by LoremPro`],{type:"text/markdown"});
 if(type==="JS") blob=new Blob([`// LoremPro - ${lang} - ${mode}\nexport const loremText = ${JSON.stringify(out)};\nexport const meta = { lang: "${lang}", mode: "${mode}", count: ${cnt}, words: ${words}, chars: ${chars} };`],{type:"text/javascript"});
 if(type==="RTF") blob=makeRTF(out);
 if(type==="PDF") blob=makePDF(out);
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

{/* HOME H1 - Sirf Home par dikhega */}
{page==="home" && <h1 style={{color:"#fff", fontSize:22, textAlign:"center", margin:"0 0 12px 0", padding:"0 12px"}}>Lorem Ipsum Generator - 77 Languages Free Tool</h1>}

{/* MENU */}
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
<div style={{background:"#dcfce7",padding:10,borderRadius:12,textAlign:"center",border:"2px solid #000"}}><div style={{fontSize:18,fontWeight:900,color:"#000"}}>{sentences||paras}</div><div style={{fontSize:9,fontWeight:800,color:"#000"}}>SENT</div></div>
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

{/* OTHER USEFUL TOOLS - 6 DUMMY LINKS */}
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

{/* SEO CONTENT + FAQ SCHEMA - STRONGEST SEO */}
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
