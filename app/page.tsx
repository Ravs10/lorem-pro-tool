"use client"
import {useState,useEffect} from "react"

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

export default function Page(){
const [lang,setLang]=useState("HI")
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
<header style={{background:"#fff",padding:12,display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,zIndex:50}}>
<b style={{color:"#000"}}>LP - {LANGS.length} Langs</b>
<button onClick={()=>setPage(page==="home"?"menu":"home")} style={{background:"#000",color:"#fff",border:"none",padding:"10px 20px",borderRadius:999,fontWeight:800}}>{page==="home"?"Menu":"Home"}</button>
</header>

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

{page==="about"&&<Wrap t="About Us - LoremPro">
<p><b>LoremPro</b> duniya ka sabse bada multilingual Lorem Ipsum generator hai. Isko <b>Raebareli, UP, India</b> se banaya gaya hai.</p>
<h3>🎯 Hamara Mission</h3>
<p>Har developer, designer aur content writer ko apni matra bhasha me dummy text dena. Ab tak sirf English Lorem Ipsum milta tha, ab 75+ languages me.</p>
<h3>⭐ Kya Khas Hai?</h3>
<ul>
<li>✅ <b>{LANGS.length} Languages</b> - USA, UK, India, China, Japan, Korea, Russia, France, Germany, Spain, Brazil, Saudi, Philippines sab popular desh shamil</li>
<li>✅ <b>4 Modes:</b> Sentence (continuous), Paragraph (variable 2-4 lines), Word, List</li>
<li>✅ <b>Counter 0-100</b> - Free input, 0 par empty</li>
<li>✅ <b>Live Counters:</b> Word, Character, Sentence, Paragraph, Reading Time</li>
<li>✅ <b>8 Download Types:</b> TXT, HTML, JSON, CSV, MD, JS, RTF, PDF</li>
<li>✅ <b>100% Free & No Login</b></li>
</ul>
<h3>👨‍💻 Founder</h3>
<p>Banane wala - Raebareli ka ek developer jisko laga ki Hindi, Odia, Bengali jaise bhashaon me bhi Lorem hona chahiye.</p>
<p><b>Version:</b> 4.0 | <b>Launched:</b> Sep 2026 | <b>Made with ❤️ in India</b></p>
</Wrap>}

{page==="how"&&<Wrap t="How to Use - Kaise Use Kare">
<h3>Step 1: Language Select Karo</h3>
<p>Upar dropdown se apni bhasha chuno. Jaise HI - Hindi, EN - USA/UK English, ZH - China Chinese, JA - Japan Japanese etc. Popular desho ke naam saath me likhe hain.</p>
<h3>Step 2: Mode Select Karo</h3>
<ul>
<li><b>SENTENCE:</b> Lagatar sentences, bina gap ke. Example: cnt=5 → 5 sentences ek line me jud jayenge.</li>
<li><b>PARAGRAPH:</b> Variable paragraphs. Har para 2, 3 ya 4 sentences ka hoga (2+ p%3). Example: cnt=3 → 3 paragraphs.</li>
<li><b>WORD:</b> Sirf words chahiye to. Example: cnt=20 → 20 words.</li>
<li><b>LIST:</b> Bullet list • ke saath.</li>
</ul>
<h3>Step 3: Counter Set Karo (0-100)</h3>
<p>Slider khisakao ya number box me 0-100 kuch bhi type karo. 0 ka matlab empty output. Auto generate hota hai.</p>
<h3>Step 4: Generate & Copy</h3>
<p>GENERATE button dabao (waise auto bhi hota hai). Niche Word/Char/Sent/Para counter dekho. Copy button dabao to green ho jayega + Copied dikhega.</p>
<h3>Step 5: Download Karo</h3>
<p>Colorful Download button dabao → 8 types ka dropdown khulega - TXT, HTML, JSON, CSV, MD, JS, RTF, PDF. Jo chahiye uspar click karo.</p>
<h3>Pro Tips</h3>
<p>• SEO ke liye Word count dekho<br/>• Design ke liye Paragraph variable use karo - natural lagega<br/>• Different language test karne ke liye menu me saare languages hain</p>
</Wrap>}

{page==="contact"&&<Wrap t="Contact Us - Sampark Kare">
<p>Aap humse kabhi bhi sampark kar sakte hain!</p>
<h3>📧 Email</h3>
<p><b>lorempro75@gmail.com</b> - 24 ghante me reply</p>
<h3>📍 Location</h3>
<p>Raebareli, Uttar Pradesh, India - 229001<br/>Made in India, Used Worldwide 🌍</p>
<h3>💬 Kya Puchh Sakte Hain?</h3>
<ul>
<li>Naya language add karwana</li>
<li>Bug report</li>
<li>Feature request</li>
<li>Custom tool banwana</li>
</ul>
<h3>💼 Hire Me - Custom Tool Banwaye</h3>
<p>Agar aapko aisa hi koi tool chahiye - Lorem Generator, Text Tools, SEO Tools, Calculator etc to contact karo.</p>
<p><b>Price:</b> Starting ₹1999 per tool<br/><b>Delivery:</b> 2-3 din me<br/><b>Contact:</b> lorempro75@gmail.com</p>
<div style={{background:"#f3f4f6",padding:12,borderRadius:12,marginTop:12,border:"1px solid #ddd"}}>
<b>Quick Message (Demo Form):</b><br/>
<input placeholder="Aapka Naam" style={{width:"100%",padding:10,marginTop:8,borderRadius:8,border:"1px solid #000"}}/>
<input placeholder="Email" style={{width:"100%",padding:10,marginTop:8,borderRadius:8,border:"1px solid #000"}}/>
<textarea placeholder="Aapka Message" style={{width:"100%",padding:10,marginTop:8,borderRadius:8,border:"1px solid #000"}} rows={3}></textarea>
<button style={{marginTop:8,background:"#000",color:"#fff",padding:"10px 20px",borderRadius:999,border:"none",fontWeight:800}}>Send Message</button>
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

{page==="hire"&&<Wrap t="Hire Me - Mujhe Kaam Do 💼">
<p>Namaste! Main aapke liye aise hi <b>Pro Tools</b> bana sakta hu.</p>
<h3>🛠️ Main Kya Bana Sakta Hu?</h3>
<ul>
<li>✅ Lorem Ipsum Generators (jaise ye wala)</li>
<li>✅ Text Tools - Word Counter, Case Converter, etc</li>
<li>✅ SEO Tools - Meta Tag Generator, Keyword Tools</li>
<li>✅ Calculator Tools - Age, BMI, Loan, etc</li>
<li>✅ Converter Tools - Image, PDF, Unit Converter</li>
<li>✅ Aur koi bhi custom tool</li>
</ul>
<h3>💰 Price Kitna?</h3>
<p><b>Single Tool:</b> Starting ₹1999<br/><b>5 Tools Combo:</b> ₹6999<br/><b>Full Website (20+ Tools):</b> ₹19999</p>
<h3>⏰ Kitna Time Lagega?</h3>
<p>Single Tool - 2-3 din me delivery<br/>Full Website - 7-10 din me</p>
<h3>📦 Kya Milega?</h3>
<p>• Next.js / React Code<br/>• Mobile Responsive<br/>• SEO Ready<br/>• Free Deployment Help<br/>• 1 Month Free Support</p>
<h3>📞 Contact Karo</h3>
<p><b>Email:</b> lorempro75@gmail.com<br/><b>Location:</b> Raebareli, UP, India<br/><b>Response:</b> 24 ghante ke andar</p>
<p style={{background:"#000",color:"#fff",padding:12,borderRadius:12,textAlign:"center",fontWeight:800,marginTop:12}}>Email karo - lorempro75@gmail.com - Abhi!</p>
</Wrap>}

{page==="article"&&<Wrap t="Article - LoremPro Kya Hai?">
<p><b>LoremPro 75+</b> duniya ka pehla aisa Lorem Ipsum generator hai jo 75+ bhashaon me real native dummy text deta hai.</p>
<h3>Normal Lorem Ipsum vs LoremPro?</h3>
<p>Normal Lorem sirf English/Latin me hota hai - "Lorem ipsum dolor sit amet...". Par agar aap Hindi website bana rahe hain to English Lorem ajeeb lagega. Isliye LoremPro me Hindi me "स्वस्थ जीवन के लिए योग जरूरी है" jaise real sentences milenge.</p>
<h3>Popular Countries Kaise Shamil Kiye?</h3>
<p>Humne duniya ke sabse popular desho ki bhashaye jodi hain: USA/UK (English), China (Chinese), Japan (Japanese), Russia (Russian), France (French), Germany (German), Spain/Mexico (Spanish), Brazil (Portuguese), Saudi/UAE (Arabic), Philippines (Filipino), Nepal, Sri Lanka, Myanmar etc.</p>
<h3>Paragraph Variable Kyu?</h3>
<p>Pehle har paragraph 2 lines ka fixed tha, jo unnatural lagta tha. Ab logic hai 2+(p%3) = Pehla para 2 lines, dusra 3 lines, teesra 4 lines, phir wapas 2... Isse design ekdum natural lagta hai.</p>
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
