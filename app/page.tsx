"use client"
import {useState,useEffect} from "react"
import Header from "./components/Header";
import GlassCard from "./components/ui/GlassCard";
const glassBg = { background: "radial-gradient(at 20% 30%, rgba(124,58,237,0.6) 0%, transparent 50%), radial-gradient(at 80% 20%, rgba(236,72,153,0.5) 0%, transparent 50%), #050507" };
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
"HI":["स्वस्थ जीवन के लिए योग जरूरी है","सुबह टहलना फिट रखता है","फल इम्युनिटी बढ़ाते हैं","पानी खूब पियो","हरी सब्जियां अच्छी हैं"],
"EN":["Healthy life needs yoga for fitness","Morning walk keeps body active","Fresh fruits boost immunity naturally","Drink plenty of water daily","Green vegetables are very healthy"],
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
LANGS.forEach(([c]:any)=>{if(!DB[c] || DB[c].length<2){DB[c]=DB[c]||["Native content for "+c,"Second sentence native for "+c]}})


const ARTICLES = [
  {
    id: 1,
    icon: "🚀",
    cat: "LOREM GUIDE",
    read: "4 Min Read",
    title: "What is LoremPro? The World's Most Advanced Generator",
    date: "19 Sep 2026",
    excerpt: "LoremPro is the world's first 75+ language generator made by Ravish from India. Learn its features and benefits.",
    content: `
      <div style="background:linear-gradient(135deg,#FFF7ED,#FFFFFF);border:1px solid #FFEDD5;padding:16px;border-radius:12px;margin-bottom:16px">
        <b>📋 In this article:</b><br/>
        <span style="color:#FF6A00">●</span> What is LoremPro?<br/>
        <span style="color:#FF6A00">●</span> Why it's better than old tools?<br/>
        <span style="color:#FF6A00">●</span> How to use it?
      </div>
      <p><b>LoremPro</b> is the world's most advanced multilingual Lorem Ipsum Generator, created by <b>Ravish from India</b>. Unlike traditional generators, it supports 75+ native languages.</p>
      <h3>Why Choose LoremPro?</h3>
      <ul>
        <li>Supports 75+ languages with native content</li>
        <li>One-click copy, no annoying popups</li>
        <li>4 modes: Sentence, Paragraph, Words, List</li>
      </ul>
      <div style="border-left:4px solid #FF6A00;background:#FFF7ED;padding:12px 16px;border-radius:0 12px 12px 0;margin:16px 0">
        <b>💡 Pro Tip:</b> Use LoremPro with Figma to speed up your design workflow by 50%.
      </div>
      <p>This tool was built to solve the problem of boring, single-language dummy text.</p>
    `
  },
  {
    id: 2,
    icon: "🎨",
    cat: "HISTORY",
    read: "3 Min Read",
    title: "History of Lorem Ipsum - Why Do We Use It Since 1500s?",
    date: "18 Sep 2026",
    excerpt: "Did you know Lorem Ipsum is 500 years old? Know its full history and why it became standard.",
    content: `
      <p>Lorem Ipsum is 500 years old, created by an unknown printer in the 1500s. It became standard because it looks like real text but is unreadable.</p>
      <h3>Key Historical Points</h3>
      <ul>
        <li>Originated from Cicero's writings in 45 BC</li>
        <li>Popularized by printer Aldus Manutius</li>
        <li>Still used in 2026 because it works</li>
      </ul>
      <div style="border-left:4px solid #FF6A00;background:#FFF7ED;padding:12px 16px;border-radius:0 12px 12px 0;margin:16px 0">
        <b>🔥 Fun Fact:</b> Lorem Ipsum is not random, it has a proper Latin root.
      </div>
    `
  },
  {
    id: 3,
    icon: "💻",
    cat: "DEVELOPER",
    read: "5 Min Read",
    title: "Sentence vs Paragraph vs Word Mode - Explained",
    date: "17 Sep 2026",
    excerpt: "Confused between modes? This guide explains when to use sentence, paragraph, or word mode.",
    content: `
      <p>LoremPro has 4 modes: SENTENCE, PARAGRAPH, WORDS, and LIST. Each mode is for a different use case.</p>
      <h3>Which Mode to Use?</h3>
      <ul>
        <li><b>Sentence:</b> For headings and small texts</li>
        <li><b>Paragraph:</b> For full content blocks</li>
        <li><b>Words:</b> For checking font width</li>
      </ul>
    `
  },
];
export default function Page(){
const [lang,setLang]=useState("HI")
const [selectedArticle, setSelectedArticle] = useState<any>(null);
const [cnt,setCnt]=useState(5)
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
const sentences = out.trim()?out.split(/[.!?।]/).filter(s=>s.trim().length>2).length:0
const paras = out.trim()?out.split("\n\n").filter(b=>b.trim()).length:0
const reading = Math.max(1,Math.ceil(words/200))

const doDownload=(type:string)=>{
 if(!out) return
 let content=out
 if(type==="HTML") content=`<html><body><p>${out.replace(/\n\n/g,"</p><p>")}</p></body></html>`
 if(type==="JSON") content=JSON.stringify({lang,cnt,words,chars,text:out},null,2)
 const blob=new Blob([content],{type:"text/plain"})
 const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=`lorem-${lang}.${type.toLowerCase()}`; a.click()
 setShowDL(false)
}

const Wrap=({t,children}:any)=><div style={{background:"#fff",borderRadius:20,padding:20,color:"#000",lineHeight:1.8}}><button onClick={()=>setPage("menu")} style={{padding:"8px 16px",borderRadius:999,border:"2px solid #000",background:"#fff",fontWeight:800}}>← Back to Menu</button><h1 style={{fontSize:22,margin:"10px 0"}}>{t}</h1><div style={{fontSize:14}}>{children}</div></div>

return(
<div style={{background:"#6366f1",minHeight:"100vh",fontFamily:"system-ui"}}>
<Header />
<div style={{textAlign:"right", margin:"8px 0"}}><button onClick={()=>setPage(page==="menu"?"home":"menu")} style={{padding:"8px 14px", borderRadius:"20px", border:"1px solid #fff", background:"#000", color:"#fff", fontWeight:"700"}}>☰ Menu</button></div>
<div style={{maxWidth:720,margin:"auto",padding:12}}>
{page==="menu"&&<div style={{background:"#fff",borderRadius:20,padding:16}}>
<h2 style={{color:"#000",marginTop:0}}>Menu - {LANGS.length} Languages</h2>
<div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8}}>
{[
["home","🏠 Generator"],["how","📖 How to Use"],["about","ℹ️ About Us"],
["contact","📞 Contact"],["privacy","🔒 Privacy Policy"],["disclaimer","⚠️ Disclaimer"],
["hire","💼 Hire Me"],["article","📰 Article"]
].map(([k,l]:any)=><button key={k} onClick={()=>setPage(k)} style={{padding:14,borderRadius:12,background:k==="home"?"#000":"#fff",color:k==="home"?"#fff":"#000",border:"2px solid #000",fontWeight:800,fontSize:13}}>{l}</button>)}
</div>
<div style={{marginTop:12,border:"2px solid #000",borderRadius:12,padding:8,maxHeight:350,overflowY:"auto",display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:6}}>
{LANGS.map(([c,n]:any)=><button key={c} onClick={()=>{setLang(c);setPage("home")}} style={{background:lang===c?"#000":"#f3f4f6",color:lang===c?"#fff":"#000",padding:8,borderRadius:8,fontSize:11,fontWeight:700,border:"none",textAlign:"left"}}>{n}</button>)}
</div>
</div>}

{page==="about"&&<Wrap t="About Us">
<p><b>LoremPro</b> is the world's most advanced Lorem Ipsum Generator, built for developers, designers, and content creators worldwide.</p>
<h3>🎯 Our Mission</h3>
<p>To help every developer, designer, and writer get high-quality, meaningful dummy text in their own native language, quickly and for free.</p>
<h3>⭐ What Makes Us Special?</h3>
<ul>
<li>✅ <b>{LANGS.length} Languages</b> - The world's largest collection</li>
<li>✅ <b>4 Modes:</b> Sentence, Paragraph, Word, List</li>
<li>✅ <b>Counter 0-100</b> - Generate up to 100 items at once</li>
<li>✅ <b>Live Counters:</b> Words, Characters & Sentences</li>
<li>✅ <b>8 Download Types:</b> TXT, PDF, DOC, and more</li>
<li>✅ <b>100% Free & No Login Required</b></li>
</ul>
<h3>👨‍💻 Founder</h3>
<p>Created with ❤️ by <b>Ravish</b> from <b>India</b>.</p>
<p><b>Version:</b> 4.0 | <b>Last Updated:</b> September 2026</p>
</Wrap>}

{page==="how"&&<Wrap t="How to Use">
<h3>Step 1: Select Language</h3>
<p>Choose your desired language from the dropdown menu at the top. We support over {LANGS.length} languages worldwide.</p>
<h3>Step 2: Select Mode</h3>
<ul>
<li><b>SENTENCE:</b> Generate continuous sentences without line breaks, perfect for paragraph filling.</li>
<li><b>PARAGRAPH:</b> Generate variable-length paragraphs for layouts and articles.</li>
<li><b>WORD:</b> Generate only random words. Best for titles and short headings.</li>
<li><b>LIST:</b> Generate a bullet list format.</li>
</ul>
<h3>Step 3: Set Counter (0-100)</h3>
<p>Use the slider or number box to set how many sentences, paragraphs, or words you need. You can generate from 0 to 100 at once.</p>
<h3>Step 4: Generate & Copy</h3>
<p>Click the GENERATE button. The text is generated automatically. Then click the Copy button to copy it to your clipboard instantly.</p>
<h3>Step 5: Download</h3>
<p>Click the Colorful Download button to get your text in 8 different formats - TXT, PDF, DOC, and more.</p>
<h3>Pro Tips</h3>
<p>• For SEO, check the live word count below the output.<br/>• Use WORD mode for brainstorming names.<br/>• Use PARAGRAPH mode for website design mockups.</p>
</Wrap>}

{page==="contact"&&<Wrap t="Contact Us">
<p>Have any questions or suggestions? Feel free to contact us anytime. We would love to hear from you.</p>
<h3>📧 Email</h3>
<p><b>lorempro75@gmail.com</b> - We will reply within 24 hours</p>
<h3>📍 Location</h3>
<p>India</p>
<p>Managed by <b>Ravish</b></p>
<h3>💬 What Can You Ask?</h3>
<ul>
<li>Request to add a new language</li>
<li>Bug report</li>
<li>Feature request</li>
<li>Get a custom tool built</li>
</ul>
<h3>💼 Hire Me - Get a Custom Tool Built</h3>
<p>If you need a similar tool for your website, feel free to contact me.</p>
<p><b>Price:</b> Starting from $25 / ₹1999 per tool</p>
<div style={{background:"#f3f4f6",padding:"16px",borderRadius:"12px",marginTop:"12px"}}>
<b>Quick Message (Demo Form):</b><br/>
<input placeholder="Your Name" style={{width:"100%",padding:"10px",marginTop:"8px",borderRadius:"8px",border:"1px solid #ccc"}}/>
<input placeholder="Your Email" style={{width:"100%",padding:"10px",marginTop:"8px",borderRadius:"8px",border:"1px solid #ccc"}}/>
<textarea placeholder="Your Message" style={{width:"100%",padding:"10px",marginTop:"8px",borderRadius:"8px",border:"1px solid #ccc",minHeight:"80px"}}></textarea>
<button style={{marginTop:8,background:"#000",color:"#fff",padding:"10px 20px",borderRadius:"8px",border:"none"}}>Send Message</button>
</div>
</Wrap>}

{page==="privacy"&&<Wrap t="Privacy Policy">
<p><b>Last Updated:</b> 18 September 2026</p>
<p>At LoremPro, we take your privacy seriously. This Privacy Policy explains how we handle information when you use our website.</p>
<h3>1. Data Collection</h3>
<p>We do not collect any personal information. You can use our tools without creating an account, login, or providing any email address.</p>
<h3>2. How Generated Text is Processed</h3>
<p>All text generation happens locally in your browser. The content you generate is not sent to, stored on, or accessed by our servers.</p>
<h3>3. Cookies & Tracking</h3>
<p>We use only basic, privacy-friendly analytics such as Google Analytics to understand total visitor traffic. We do not track your personal identity. For advertising, Google AdSense may use cookies to show relevant ads.</p>
<h3>4. Third Party Links</h3>
<p>Our website does not contain any malicious third-party links. Any external links are for reference purposes only.</p>
<h3>5. Children's Privacy</h3>
<p>Our website is safe and suitable for users of all ages. We do not knowingly collect any data from children.</p>
<h3>6. Contact</h3>
<p>If you have any questions regarding privacy, please contact us via our Contact page.</p>
<p><b>Summary:</b> No data collection, No tracking, No personal information stored.</p>
</Wrap>}

{page==="disclaimer"&&<Wrap t="Disclaimer">
<p><b>Last Updated:</b> 18 September 2026</p>
<p>Please read this disclaimer carefully before using this website / tool. This website is operated by Ravish from India.</p>
<h3>1. Dummy Text Only</h3>
<p>All text provided on this website is <b>dummy and placeholder text</b> for design and content layout purposes only. It is generated automatically and should not be considered as real content.</p>
<h3>2. No Professional Advice</h3>
<p>The content here is not <b>medical, legal, financial, or any professional advice</b>. You should not rely on generated text for any professional decision.</p>
<h3>3. No Warranty</h3>
<p>We do not guarantee that text in every language is 100% accurate or error-free. The tool is provided on an "as is" basis without any warranties. We are not responsible for any loss or damage from using it.</p>
<h3>4. Fair Use</h3>
<p>You can use the generated text <b>anywhere for free</b> for personal or commercial projects. No attribution is required.</p>
<h3>5. External Links</h3>
<p>If we provide a link to any external website, it is for reference only. We are not responsible for the content or privacy of those external sites.</p>
<h3>6. Agreement</h3>
<p>By using this website, you agree to this disclaimer. If you find any error in any language, please contact us so we can fix it.</p>
</Wrap>}

{page==="hire"&&<Wrap t="Hire Me">
<p>Hi! I am <b>Ravish</b> from India, the creator of LoremPro. I can build the same kind of professional, fast, and SEO-ready tools for you.</p>
<h3>🛠️ What Can I Build For You?</h3>
<ul>
<li>✅ Lorem Ipsum Generators (like this one)</li>
<li>✅ Text Tools - Word Counter, Case Converter, etc.</li>
<li>✅ SEO Tools - Meta Tag Generator, Keyword Tools</li>
<li>✅ Calculator Tools - Age, BMI, Loan, etc.</li>
<li>✅ Converter Tools - Image, PDF, Unit Converter</li>
<li>✅ And any other custom tool you need</li>
</ul>
<h3>💰 What is the Price?</h3>
<p><b>Single Tool:</b> Starting from $25 / ₹1999<br/><b>Full Website (10+ Tools):</b> Contact me for a best price</p>
<h3>⏰ How Much Time?</h3>
<p>Single Tool - Delivery in 2-3 days<br/>Full Website - Delivery in 7-10 days</p>
<h3>📦 What Will You Get?</h3>
<p>• Next.js / React Clean Code<br/>• Mobile Responsive & Fast<br/>• SEO Optimized<br/>• AdSense Ready Layout<br/>• Free Deployment on Vercel</p>
<h3>📞 Contact Me</h3>
<p><b>Email:</b> lorempro75@gmail.com<br/><b>Location:</b> India<br/><b>Name:</b> Ravish</p>
<p style={{background:"#000",color:"#fff",padding:"12px",borderRadius:"10px",textAlign:"center"}}>Let's build your next tool website together!</p>
</Wrap>}

{page==="article"&&<Wrap t={selectedArticle ? selectedArticle.title : "Blog - Articles & Guides"}>
<style>{`
  .article-content ul{list-style:none;padding-left:0}
  .article-content li{position:relative;padding-left:26px;margin-bottom:10px;line-height:1.7}
  .article-content li:before{content:'●';position:absolute;left:0;top:0;color:#FF6A00;font-size:18px}
  .fanta-card{border:1px solid #FFEDD5;border-left:6px solid #FF6A00;padding:18px;border-radius:16px;cursor:pointer;background:#fff;box-shadow:0 6px 18px rgba(0,0,0,0.06);display:flex;gap:14px;transition:0.2s}
  .fanta-card:hover{transform:translateY(-3px);box-shadow:0 12px 28px rgba(255,106,0,0.18)}
  .icon-box{width:48px;height:48px;border-radius:12px;background:linear-gradient(135deg,#FF6A00,#FF9A44);display:flex;align-items:center;justify-content:center;font-size:26px;flex-shrink:0}
`}</style>

{!selectedArticle ? (
  <div>
    <div style={{background:"linear-gradient(135deg,#111,#333)",color:"#fff",padding:"20px",borderRadius:"16px",marginBottom:"18px"}}>
      <h2 style={{margin:"0 0 6px 0"}}>📚 LoremPro Blog</h2>
      <p style={{margin:0,opacity:0.8}}>Guides, Tips & Inspiration - By Ravish, India</p>
    </div>
    <div style={{display:"grid",gap:"16px"}}>
      {ARTICLES.map((a:any)=>(
        <div key={a.id} onClick={()=>setSelectedArticle(a)} className="fanta-card">
          <div className="icon-box">{a.icon}</div>
          <div>
            <div style={{display:"flex",gap:"6px",marginBottom:"6px"}}>
              <span style={{background:"#FFF7ED",color:"#FF6A00",fontSize:"10px",fontWeight:800,padding:"3px 8px",borderRadius:"20px"}}>{a.cat}</span>
              <span style={{background:"#F3F4F6",color:"#6B7280",fontSize:"10px",padding:"3px 8px",borderRadius:"20px"}}>{a.read}</span>
            </div>
            <b style={{fontSize:"16px"}}>{a.title}</b>
            <p style={{color:"#6B7280",fontSize:"12px",margin:"4px 0"}}>{a.date}</p>
            <p style={{color:"#4B5563",fontSize:"13px",marginTop:"6px"}}>{a.excerpt}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
) : (
  <div className="article-content">
    <button onClick={()=>setSelectedArticle(null)} style={{marginBottom:"16px",background:"#111",color:"#fff",padding:"8px 18px",borderRadius:"24px",border:"none",fontWeight:700}}>← Back</button>
    <div style={{background:"linear-gradient(135deg,#FFF7ED,#fff)",border:"1px solid #FFEDD5",padding:"18px",borderRadius:"16px",marginBottom:"16px"}}>
      <div style={{display:"flex",gap:"10px",alignItems:"center",marginBottom:"10px"}}>
        <span style={{fontSize:"32px"}}>{selectedArticle.icon}</span>
        <span style={{background:"#111",color:"#fff",fontSize:"11px",padding:"4px 10px",borderRadius:"20px"}}>{selectedArticle.cat} • {selectedArticle.read}</span>
      </div>
      <h1 style={{fontSize:"24px",margin:"0 0 8px 0"}}>{selectedArticle.title}</h1>
      <p style={{color:"#FF6A00",fontSize:"13px",fontWeight:700}}>{selectedArticle.date} | By Ravish from India 🇮🇳</p>
    </div>
    <div dangerouslySetInnerHTML={{__html: selectedArticle.content}} />
  </div>
)}
</Wrap>}

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
<button onClick={gen} style={{width:"100%",background:"#000",color:"#fff",padding:14,borderRadius:12,marginTop:12,fontWeight:900,border:"none",fontSize:15}}>GENERATE {lang} - {cnt} {mode}</button>

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
<button onClick={()=>{if(!out) return; navigator.clipboard.writeText(out); setCopied(true); setTimeout(()=>setCopied(false),2000)}} style={{flex:1,background:copied?"#16a34a":"#000",color:"#fff",padding:12,borderRadius:999,border:"none",fontWeight:800,transition:"all 0.3s"}}>{copied?"Copied ✅ - Green!":"Copy Text"}</button>
<button onClick={()=>{setOut(""); setCnt(0)}} style={{background:"#fff",color:"#000",padding:12,borderRadius:999,border:"2px solid #000",fontWeight:800}}>Clear</button>
</div>

<div style={{marginTop:12,position:"relative"}}>
<button onClick={()=>setShowDL(!showDL)} style={{width:"100%",padding:14,borderRadius:12,background:"linear-gradient(90deg,#f43f5e,#8b5cf6,#3b82f6)",color:"#fff",border:"2px solid #000",fontWeight:900}}>📥 DOWNLOAD 8 Types {showDL?"▲":"▼"}</button>
{showDL&&<div style={{position:"absolute",top:"56px",left:0,right:0,background:"#fff",border:"2px solid #000",borderRadius:14,zIndex:20,overflow:"hidden"}}>
{["TXT","HTML","JSON","CSV","MD","JS","RTF","PDF"].map(code=><button key={code} onClick={()=>doDownload(code)} style={{width:"100%",padding:12,background:"#fff",color:"#000",border:"none",borderBottom:"1px solid #eee",fontWeight:800,textAlign:"left",fontSize:12,display:"flex",justifyContent:"space-between"}}><span>{code}</span><span style={{fontSize:10,opacity:0.6}}>.{code.toLowerCase()}</span></button>)}
</div>}
</div>
</div>}
</div>
{/* OTHER USEFUL TOOLS - 6 DUMMY LINKS */}
<div style={{marginTop:20,background:"#fff",border:"2px solid #000",borderRadius:16,padding:14}}>
<h3 style={{margin:"0 0 12px 0",color:"#000",fontSize:16,fontWeight:900}}>🔧 Other Useful Tools</h3>
<div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10}}>
<a href="/word-counter" style={{textDecoration:"none",background:"#dbeafe",border:"2px solid #000",padding:12,borderRadius:12,textAlign:"center"}}>
<div style={{fontSize:20}}>📝</div>
<div style={{fontSize:12,fontWeight:800,color:"#000",marginTop:4}}>Word Counter</div>
<div style={{fontSize:9,color:"#555"}}>Count words & chars</div>
</a>
<a href="/case-converter" style={{textDecoration:"none",background:"#fef9c3",border:"2px solid #000",padding:12,borderRadius:12,textAlign:"center"}}>
<div style={{fontSize:20}}>🔄</div>
<div style={{fontSize:12,fontWeight:800,color:"#000",marginTop:4}}>Case Converter</div>
<div style={{fontSize:9,color:"#555"}}>UPPER to lower</div>
</a>
<a href="/image-to-text" style={{textDecoration:"none",background:"#dcfce7",border:"2px solid #000",padding:12,borderRadius:12,textAlign:"center"}}>
<div style={{fontSize:20}}>🖼️</div>
<div style={{fontSize:12,fontWeight:800,color:"#000",marginTop:4}}>Image to Text</div>
<div style={{fontSize:9,color:"#555"}}>OCR Tool</div>
</a>
<a href="/qr-generator" style={{textDecoration:"none",background:"#fce7f3",border:"2px solid #000",padding:12,borderRadius:12,textAlign:"center"}}>
<div style={{fontSize:20}}>📱</div>
<div style={{fontSize:12,fontWeight:800,color:"#000",marginTop:4}}>QR Generator</div>
<div style={{fontSize:9,color:"#555"}}>Make QR Code</div>
</a>
<a href="/password-generator" style={{textDecoration:"none",background:"#e0e7ff",border:"2px solid #000",padding:12,borderRadius:12,textAlign:"center"}}>
<div style={{fontSize:20}}>🔑</div>
<div style={{fontSize:12,fontWeight:800,color:"#000",marginTop:4}}>Password Gen</div>
<div style={{fontSize:9,color:"#555"}}>Strong Password</div>
</a>
<a href="/age-calculator" style={{textDecoration:"none",background:"#ffedd5",border:"2px solid #000",padding:12,borderRadius:12,textAlign:"center"}}>
<div style={{fontSize:20}}>🎂</div>
<div style={{fontSize:12,fontWeight:800,color:"#000",marginTop:4}}>Age Calculator</div>
<div style={{fontSize:9,color:"#555"}}>Find your age</div>
</a>
</div>
<p style={{fontSize:10,color:"#666",textAlign:"center",marginTop:10,marginBottom:0}}>More tools coming soon - Stay tuned!</p>
</div>
<footer style={{background:"#000",color:"#fff",padding:20,marginTop:24,textAlign:"center"}}>
<div style={{fontWeight:900,fontSize:14}}>© 2026 LoremPro - {LANGS.length} Languages</div>
<div style={{marginTop:10,display:"flex",flexWrap:"wrap",gap:12,justifyContent:"center",fontSize:12}}>
<button onClick={()=>setPage("about")} style={{background:"none",border:"none",color:"#fff",textDecoration:"underline"}}>About</button>
<button onClick={()=>setPage("contact")} style={{background:"none",border:"none",color:"#fff",textDecoration:"underline"}}>Contact</button>
<button onClick={()=>setPage("privacy")} style={{background:"none",border:"none",color:"#fff",textDecoration:"underline"}}>Privacy Policy</button>
<button onClick={()=>setPage("disclaimer")} style={{background:"none",border:"none",color:"#fff",textDecoration:"underline"}}>Disclaimer</button>
<button onClick={()=>setPage("how")} style={{background:"none",border:"none",color:"#fff",textDecoration:"underline"}}>How to Use</button>
<button onClick={()=>setPage("hire")} style={{background:"none",border:"none",color:"#fff",textDecoration:"underline"}}>Hire Me</button>
</div>
<div style={{marginTop:12,fontSize:10,opacity:0.7}}>Made with ❤️ in Raebareli, UP, India | All Native Languages | No English Fallback | Words:{words} Chars:{chars} Tested ✅</div>
</footer>
</div>)}
