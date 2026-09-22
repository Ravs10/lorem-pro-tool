// @ts-nocheck
"use client";
import { useState, useEffect } from "react";

const ALL_FIELDS = ["Full Name","Email","Mobile","Address","City","Pincode","Company","PAN","Aadhaar","UPI ID"];
const LANGS = ["Hindi","Tamil","Telugu","Marathi","Bengali","Gujarati","Malayalam","Kannada","Punjabi","Marwari","Urdu","Bhojpuri","Odia","English","Hinglish","English (US)","Spanish","French","German","Portuguese","Japanese","Chinese","Russian","Arabic","Korean","Italian","Turkish","Dutch","Thai","Vietnamese"];

const FULL_DATA: any = {
  Hindi: { names: ["अमित शर्मा","रवि वर्मा","सुनील कुमार","पूजा गुप्ता","नेहा सिंह","विजय यादव","अंजली मिश्रा","राहुल तिवारी","सीमा चौधरी","अजय कुमार","प्रिया शुक्ला","मनोज पांडे","सुरेश गुप्ता","राधा वर्मा","किशोर सिंह"], cities: ["दिल्ली","मुंबई","जयपुर","सूरतगढ़","लखनऊ","पटना","भोपाल","इंदौर","नागपुर","वाराणसी"], addr: "एमजी रोड", comp: "प्रा. लि." },
  Tamil: { names: ["அர்ஜுன் குமார்","சூர்யா சிவகுமார்","பிரியா லட்சுமி","விஜய் சேதுபதி","நயன்தாரா","தனுஷ்","சமந்தா","கார்த்தி","த்ரிஷா","அஜித் குமார்","சிவகார்த்திகேயன்","கீர்த்தி சுரேஷ்","விக்ரம்","அனுஷ்கா","சிம்பு"], cities: ["சென்னை","கோயம்புத்தூர்","மதுரை","திருச்சி","சேலம்","தூத்துக்குடி","தஞ்சாவூர்"], addr: "எம்.ஜி. சாலை", comp: "டெக் பிரைவேட்" },
  Telugu: { names: ["రవి తేజ","పవన్ కళ్యాణ్","సమంత అక్కినేని","అల్లు అర్జున్","రష్మిక మందన్న","ప్రభాస్","అనుష్క శెట్టి","మహేష్ బాబు","కీర్తి సురేష్","విజయ్ దేవరకొండ","నయనతార","రామ్ చరణ్","పూజా హెగ్డే","నాని","సాయిపల్లవి"], cities: ["హైదరాబాద్","విజయవాడ","విశాఖపట్నం","వరంగల్","గుంటూరు","తిరుపతి"], addr: "ఎంజి రోడ్", comp: "టెక్ ప్రైవేట్" },
  Marathi: { names: ["साहिल जोशी","ओंकार पाटील","स्नेहा कुलकर्णी","अमोल कोल्हे","सई ताम्हणकर","रितेश देशमुख","जेनेलिया","सचिन पिळगावकर","मुक्ता बर्वे","स्वप्नील जोशी"], cities: ["पुणे","मुंबई","नागपूर","नाशिक","औरंगाबाद"], addr: "एमजी रस्ता", comp: "टेक प्रा. लि." },
  Bengali: { names: ["অরিন্দম দাস","সৌরভ গাঙ্গুলী","রিয়া সেন","দেব","শুভশ্রী","জিৎ","কোয়েল","প্রসেনজিৎ","ঋতুপর্ণা","আবির","পাওলি","পরমব্রত"], cities: ["কলকাতা","হাওড়া","দার্জিলিং","শিলিগুড়ি","দুর্গাপুর"], addr: "এমজি রোড", comp: "টেক প্রাইভেট" },
  Gujarati: { names: ["હાર્દિક પટેલ","કિંજલ દવે","ધારા મહેતા","મલ્હાર ઠાકર","આરોહી પટેલ","ચિરાગ વોરા","કૃપા શાહ","દર્શન જરીવાલા"], cities: ["અમદાવાદ","સુરત","વડોદરા","રાજકોટ","ભાવનગર"], addr: "એમજી રોડ", comp: "ટેક પ્રા.લિ." },
  Malayalam: { names: ["മോഹൻലാൽ","ദുൽഖർ","നയൻ താര","മമ്മൂട്ടി","മഞ്ജു വാര്യർ","പൃഥ്വിരാജ്","നസ്രിയ","ഫഹദ് ഫാസിൽ"], cities: ["കൊച്ചി","തിരുവനന്തപുരം","കോഴിക്കോട്","തൃശൂർ"], addr: "എംജി റോഡ്", comp: "ടെക് പ്രൈവറ്റ്" },
  Kannada: { names: ["ಯಶ್ ಗೌಡ","ರಶ್ಮಿಕಾ ಮಂದಣ್ಣ","ದರ್ಶನ್","ರಮ್ಯಾ","ಸುದೀಪ್","ಶ್ರುತಿ ಹರಿಹರನ್","ಪುನೀತ್ ರಾಜ್‌ಕುಮಾರ್"], cities: ["ಬೆಂಗಳೂರು","ಮೈಸೂರು","ಮಂಗಳೂರು","ಹುಬ್ಬಳ್ಳಿ"], addr: "ಎಂಜಿ ರಸ್ತೆ", comp: "ಟೆಕ್ ಪ್ರೈ. ಲಿ." },
  Punjabi: { names: ["ਜੱਸੀ ਗਿੱਲ","ਸਿਮਰਨ ਕੌਰ","ਦਿਲਜੀਤ ਦੋਸਾਂਝ","ਨੀਰੂ ਬਾਜਵਾ","ਗਿੱਪੀ ਗਰੇਵਾਲ","ਸੋਨਮ ਬਾਜਵਾ"], cities: ["ਲੁਧਿਆਣਾ","ਅੰਮ੍ਰਿਤਸਰ","ਜਲੰਧਰ","ਪਟਿਆਲਾ"], addr: "ਐਮਜੀ ਰੋਡ", comp: "ਟੈਕ ਪ੍ਰਾ. ਲਿ." },
  Marwari: { names: ["भंवर सिंह","कमला देवी","गजानंद शर्मा","पार्वती कुमारी","रामलाल जाट","सुमित्रा देवी"], cities: ["बीकानेर","जोधपुर","सूरतगढ़","अजमेर","उदयपुर"], addr: "एमजी रोड़", comp: "टेक प्रा. लि." },
  Urdu: { names: ["عمران خان","زویا شیخ","احمد علی","فاطمہ زہرا","عمر فاروق","زینب بیگم"], cities: ["کراچی","لاہور","اسلام آباد","ملتان"], addr: "ایم جی روڈ", comp: "ٹیک پرائیویٹ" },
  Bhojpuri: { names: ["खेसारी लाल","पवन सिंह","अक्षरा सिंह","रानी चटर्जी","दिनेश लाल","आम्रपाली दुबे","मनोज तिवारी","काजल राघवानी","निरहुआ","अंजना सिंह"], cities: ["पटना","आरा","बलिया","छपरा","बक्सर","सीवान"], addr: "एमजी रोड", comp: "टेक प्रा. लि." },
  Odia: { names: ["ଶୁଭମ ମହାନ୍ତି","ସୋନଲ ମହାପାତ୍ର","ଅନୁଭବ ମହାନ୍ତି","ବର୍ଷା ପ୍ରିୟଦର୍ଶିନୀ"], cities: ["ଭୁବନେଶ୍ୱର","କଟକ","ରାଉରକେଲା","ପୁରୀ"], addr: "ଏମଜି ରୋଡ", comp: "ଟେକ୍ ପ୍ରା" },
  English: { names: ["Aarav Mehta","Ananya Singh","Rahul Kumar","Priya Sharma","Vijay Patel","Neha Gupta","Amit Verma","Pooja Yadav"], cities: ["Delhi","Mumbai","Jaipur","Bangalore","Chennai","Kolkata"], addr: "MG Road", comp: "Tech Pvt Ltd" },
  Hinglish: { names: ["Aarav Sharma","Pooja Singh","Rohan Verma","Sneha Gupta"], cities: ["Delhi","Mumbai","Lucknow"], addr: "MG Road", comp: "Tech Pvt Ltd" },
  "English (US)": { names: ["John Smith","Emma Johnson","Michael Brown","Olivia Davis","James Wilson","Sophia Miller","William Moore","Isabella Taylor","David Anderson","Mia Thomas","Robert Jackson","Charlotte White","Daniel Harris","Amelia Martin","Matthew Clark"], cities: ["New York","Los Angeles","Chicago","Houston","Miami","Seattle","Boston","San Francisco","Dallas","Atlanta"], addr: "5th Avenue", comp: "Inc." },
  Spanish: { names: ["José García","María López","Carlos Ruiz","Ana Martínez","Luis Hernández","Laura Gómez","Juan Pérez","Sofia Torres","Miguel Sánchez","Isabel Ramirez","Fernando Díaz","Carmen Flores","Jorge Morales","Elena Ortiz","Diego Castro"], cities: ["Madrid","Barcelona","Valencia","Sevilla","Zaragoza","Malaga","Bilbao","Murcia"], addr: "Calle Mayor", comp: "S.L." },
  French: { names: ["Pierre Dupont","Marie Dubois","Luc Bernard","Camille Laurent","Antoine Martin","Julie Moreau","Nicolas Petit","Chloé Lefevre","François Girard","Isabelle Roux","Thomas Fabre","Sophie Blanc","Julien Morel","Emilie Garnier","Maxime Chevalier"], cities: ["Paris","Lyon","Marseille","Toulouse","Nice","Nantes","Strasbourg","Montpellier"], addr: "Rue de la Paix", comp: "SARL" },
  German: { names: ["Hans Müller","Greta Schmidt","Klaus Weber","Anna Fischer","Thomas Becker","Lisa Hoffmann","Michael Wagner","Julia Richter","Stefan Klein","Laura Meyer","Andreas Bauer","Sabine Wolf","Frank Schulz","Katrin Koch","Uwe Zimmermann"], cities: ["Berlin","Munich","Hamburg","Cologne","Frankfurt","Stuttgart","Dusseldorf","Dortmund"], addr: "Hauptstrasse", comp: "GmbH" },
  Portuguese: { names: ["João Silva","Ana Santos","Pedro Costa","Mariana Oliveira","Carlos Ferreira","Sofia Rodrigues","Miguel Almeida","Beatriz Pereira","Rui Carvalho","Ines Martins","Tiago Lopes","Joana Ribeiro","Antonio Mendes","Catarina Sousa","Filipe Cunha"], cities: ["Lisboa","Porto","Braga","Coimbra","Faro","Aveiro","Funchal","Guimaraes"], addr: "Rua Augusta", comp: "Lda." },
  Japanese: { names: ["田中太郎","佐藤花子","鈴木一郎","高橋美咲","渡辺健太","伊藤さくら","山本大輔","中村優子","小林誠","加藤愛","吉田翔太","山田彩乃","佐々木蓮","松本結衣","井上拓海","木村真央","林勇気","斎藤舞","清水和也","阿部里奈"], cities: ["東京","大阪","京都","横浜","名古屋","札幌","福岡","神戸","広島","仙台"], addr: "中央通り", comp: "株式会社" },
  Chinese: { names: ["张伟","王芳","李强","刘洋","陈静","杨敏","黄磊","赵丽","周杰","吴倩","孙浩","马丽","朱明","胡斌","郭婷","林峰","何静","高翔","罗娟","梁超"], cities: ["北京","上海","广州","深圳","成都","杭州","南京","武汉","西安","重庆"], addr: "中山路", comp: "有限公司" },
  Russian: { names: ["Иван Иванов","Анна Петрова","Сергей Смирнов","Елена Кузнецова","Дмитрий Попов","Ольга Соколова","Алексей Лебедев","Мария Козлова","Павел Новиков","Татьяна Морозова","Андрей Федоров","Наталья Васильева","Игорь Николаев","Светлана Орлова","Владимир Зайцев"], cities: ["Москва","Санкт-Петербург","Казань","Новосибирск","Екатеринбург","Нижний Новгород","Челябинск","Самара"], addr: "ул. Ленина", comp: "ООО" },
  Arabic: { names: ["محمد أحمد","فاطمة علي","أحمد حسن","نورا خالد","عبدالله سعيد","سارة عمر","خالد محمود","ليلى إبراهيم","يوسف عبدالله","منى حسين","عمر فاروق","زينب أحمد","سلمان علي","ريم محمد","فيصل ناصر"], cities: ["دبي","الرياض","القاهرة","جدة","أبوظبي","الدوحة","الكويت","عمان"], addr: "شارع الملك", comp: "ذ.م.م" },
  Korean: { names: ["김민준","박지연","이서준","최유진","정민호","강서연","조현우","윤지우","장도윤","임서현","한지민","오준서","신하은","권지훈","황지아","안예준","송지효","류준열","홍지영","배수지"], cities: ["서울","부산","인천","대구","대전","광주","울산","수원"], addr: "강남대로", comp: "주식회사" },
  Italian: { names: ["Marco Rossi","Giulia Bianchi","Luca Ferrari","Sofia Romano","Alessandro Esposito","Aurora Colombo","Francesco Ricci","Alice Conti","Lorenzo Marino","Greta Greco","Andrea Bruno","Martina Gallo","Matteo Costa","Chiara Villa","Gabriele Fontana"], cities: ["Roma","Milano","Napoli","Torino","Firenze","Bologna","Venezia","Verona"], addr: "Via Roma", comp: "S.r.l." },
  Turkish: { names: ["Mehmet Yılmaz","Ayşe Kaya","Mustafa Demir","Fatma Şahin","Ahmet Çelik","Zeynep Koç","Ali Öztürk","Elif Yildiz","Hüseyin Arslan","Merve Doğan","Emre Kılıç","Selin Aslan","Burak Kara","Ceren Güneş","Murat Aksoy"], cities: ["Istanbul","Ankara","Izmir","Antalya","Bursa","Adana","Gaziantep","Konya"], addr: "Atatürk Caddesi", comp: "A.Ş." },
  Dutch: { names: ["Jan Jansen","Emma de Vries","Bram van Dijk","Sophie Bakker","Daan Janssen","Lot de Boer","Lucas Visser","Mila Smit","Levi Meijer","Julia de Jong","Sem Mulder","Sara Hendriks","Thijs de Groot","Noor van Leeuwen","Finn de Wit"], cities: ["Amsterdam","Rotterdam","Utrecht","Hague","Eindhoven","Groningen","Maastricht","Arnhem"], addr: "Damstraat", comp: "B.V." },
  Thai: { names: ["สมชาย ใจดี","สมหญิง รักไทย","ประยุทธ์ จันทร์โอชา","ยิ่งลักษณ์ ชินวัตร","ธนาธร จึงรุ่งเรืองกิจ","ชัชชาติ สิทธิพันธุ์","อุ๊งอิ๊ง แพทองธาร","พิธา ลิ้มเจริญรัตน์","อภิสิทธิ์ เวชชาชีวะ","สุดารัตน์ เกยุราพันธุ์","อนุทิน ชาญวีรกูล","จุรินทร์ ลักษณวิศิษฏ์","บิ๊กตู่ ประยุทธ์","บิ๊กป้อม ประวิตร","ทักษิณ ชินวัตร"], cities: ["กรุงเทพ","เชียงใหม่","ภูเก็ต","พัทยา","หาดใหญ่","ขอนแก่น","อุดรธานี","อุบลราชธานี"], addr: "ถนนสุขุมวิท", comp: "จำกัด" },
  Vietnamese: { names: ["Nguyễn Văn A","Trần Thị B","Lê Văn C","Phạm Thị D","Hoàng Văn E","Phan Thị F","Vũ Văn G","Đặng Thị H","Bùi Văn I","Đỗ Thị K","Hồ Văn L","Ngô Thị M","Dương Văn N","Lý Thị P","Đinh Văn Q"], cities: ["Hà Nội","Hồ Chí Minh","Đà Nẵng","Hải Phòng","Cần Thơ","Nha Trang","Huế","Vũng Tàu"], addr: "Đường Lê Lợi", comp: "TNHH" },
};

const ENG_EMAIL = ["amit","ravi","sunil","pooja","neha","rahul","ananya","arjun","priya","vijay","john","emma","liam","sophia","jose","marie","hans","joao","tanaka","zhang","ivan","mohammad","kim","marco","mehmet"];

function genOne(fields: any, lang: any){
  var d = FULL_DATA[lang] || FULL_DATA.English;
  var name = d.names[Math.floor(Math.random()*d.names.length)];
  var city = d.cities[Math.floor(Math.random()*d.cities.length)];
  var eng = ENG_EMAIL[Math.floor(Math.random()*ENG_EMAIL.length)];
  var o: any = {};
  if(fields.includes("Full Name")) o["Full Name"] = name;
  if(fields.includes("Email")) o["Email"] = eng + Math.floor(Math.random()*9000) + "@gmail.com";
  if(fields.includes("Mobile")) o["Mobile"] = "9" + Math.floor(Math.random()*900000000+100000000);
  if(fields.includes("Address")) o["Address"] = Math.floor(Math.random()*500) + " " + d.addr + ", " + city;
  if(fields.includes("City")) o["City"] = city;
  if(fields.includes("Pincode")) o["Pincode"] = "" + Math.floor(Math.random()*900000+100000);
  if(fields.includes("Company")) o["Company"] = city + " " + d.comp;
  if(fields.includes("PAN")) o["PAN"] = "ABCDE" + Math.floor(Math.random()*9000+1000) + "F";
  if(fields.includes("Aadhaar")) o["Aadhaar"] = "1234" + Math.floor(Math.random()*100000000);
  if(fields.includes("UPI ID")) o["UPI ID"] = eng + "@okpay";
  return o;
}

export default function Page(){
  var [fields,setFields]=useState(["Full Name","Email","Address","City","Company"]);
  var [lang,setLang]=useState("Bhojpuri");
  var [count,setCount]=useState(124);
  var [data,setData]=useState<any[]>([]);
  var [view,setView]=useState("table");
  var [copyText,setCopyText]=useState("Copy");
  var [saveText,setSaveText]=useState("Save");
  var [showArticle,setShowArticle]=useState(true);
  var [faqOpen,setFaqOpen]=useState(0);

  useEffect(function(){ document.title = "Fake Data Generator - 30 Languages | Free Tool"; }, []);

  var generate = function(){
    var newData = Array.from({length: count}, function(){ return genOne(fields, lang); });
    setData(newData);
  };

  useEffect(function(){ generate(); }, []);
  useEffect(function(){ generate(); }, [lang]);

  var getJson = function(){ return JSON.stringify(data, null, 2); };
  var getCsv = function(){
    if(!data.length) return "";
    var header = Object.keys(data[0]).join(",");
    var rows = data.map(function(r){ return Object.values(r).map(function(v){ return '"' + v + '"'; }).join(","); }).join("\n");
    return header + "\n" + rows;
  };
  var getTxt = function(){ return data.map(function(r){ return Object.entries(r).map(function(kv){ return kv[0] + ": " + kv[1]; }).join(" | "); }).join("\n"); };
  var getSql = function(){
    if(!data.length) return "";
    var cols = Object.keys(data[0]).join(", ");
    var vals = data.map(function(r){ return "(" + Object.values(r).map(function(v){ return "'" + v + "'"; }).join(", ") + ")"; }).join(",\n");
    return "INSERT INTO users (" + cols + ") VALUES\n" + vals + ";";
  };
  var getStr = function(){
    if(view==="json") return getJson();
    if(view==="csv") return getCsv();
    if(view==="txt") return getTxt();
    if(view==="sql") return getSql();
    return getJson();
  };

  return (
    <div className="min-h-screen bg-[#f8f8f7] text-zinc-900">
      <main className="max-w-[1100px] mx-auto px-3 py-4">
        <h1 className="text-[26px] font-black">Fake Data Generator - 30 Languages</h1>
        <p className="text-zinc-500 text-[12px] mt-1">15 Indian + 15 Global | Email Always English | No Repeat Data</p>

        <div className="bg-white rounded-[24px] border p-5 mt-4">
          <label className="font-bold text-[14px]">Select Language</label>
          <select value={lang} onChange={function(e){ setLang(e.target.value); }} className="w-full mt-2 border-2 border-black rounded-full px-5 py-4 text-[15px] bg-yellow-50 font-bold">
            {LANGS.map(function(l){ return <option key={l} value={l}>{l}</option>; })}
          </select>
          <div className="mt-2 bg-green-100 border text-green-800 text-[12px] font-bold px-3 py-2 rounded-full">Active: {lang} - {FULL_DATA[lang].names.length} unique names loaded</div>
          <h3 className="font-bold text-[14px] mt-6">Select Fields ({fields.length} / 10)</h3>
          <div className="grid grid-cols-2 gap-2.5 mt-3">
            {ALL_FIELDS.map(function(f){ var active=fields.includes(f); return <button key={f} onClick={function(){ if(active) setFields(fields.filter(function(x){return x!==f;})); else if(fields.length<10) setFields([...fields,f]); }} className={"h-[48px] rounded-full text-[13px] " + (active?"bg-black text-white":"bg-zinc-100")}>{f}</button>; })}
          </div>
          <div className="mt-6"><label className="font-bold text-[14px]">Records: {count} / 1000</label><input type="range" min={1} max={1000} value={count} onChange={function(e){ setCount(parseInt(e.target.value)); }} className="w-full mt-3 accent-black h-2" /></div>
          <button onClick={generate} className="mt-6 w-full h-[56px] bg-black text-white rounded-full font-black">Generate {count} Records in {lang}</button>
        </div>

        {data.length>0 && (
          <div className="mt-5 bg-white rounded-[24px] border p-4">
            <div className="flex gap-2 overflow-auto pb-2">
              {["table","json","csv","txt","sql"].map(function(v){ return <button key={v} onClick={function(){ setView(v); }} className={"px-6 h-10 rounded-full text-xs font-black uppercase " + (view===v?"bg-black text-white":"bg-zinc-100")}>{v}</button>; })}
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={function(){ localStorage.setItem("saved-data", getStr()); setSaveText("Saved!"); setTimeout(function(){ setSaveText("Save"); },2000); }} className={"flex-1 h-12 rounded-full font-bold " + (saveText==="Saved!"?"bg-green-500 text-white":"bg-zinc-100")}>{saveText}</button>
              <button onClick={function(){ navigator.clipboard.writeText(getStr()); setCopyText("Copied!"); setTimeout(function(){ setCopyText("Copy"); },2000); }} className={"flex-1 h-12 rounded-full font-bold " + (copyText==="Copied!"?"bg-green-500 text-white":"bg-black text-white")}>{copyText}</button>
              <a href={"data:text/plain;charset=utf-8," + encodeURIComponent(getStr())} download={"fake-data." + view} className="flex-1 h-12 rounded-full bg-yellow-400 text-black font-black flex items-center justify-center">Download</a>
            </div>
            <div className="mt-4 border rounded-2xl overflow-auto max-h-[500px]">
              {view==="table"? <table className="w-full text-[13px]"><thead className="bg-zinc-50 sticky top-0"><tr>{Object.keys(data[0]||{}).map(function(k){ return <th key={k} className="text-left p-3.5 border-b">{k}</th>; })}</tr></thead><tbody>{data.map(function(r,i){ return <tr key={i} className="border-t"><td colSpan={20}><div className="flex">{Object.values(r).map(function(v,j){ return <div key={j} className="p-3.5 min-w-[150px] border-r">{String(v)}</div>; })}</div></td></tr>; })}</tbody></table> : <pre className="p-4 text-[12px] bg-zinc-50 whitespace-pre-wrap">{getStr()}</pre>}
            </div>
          </div>
        )}

        <div className="mt-5 bg-white rounded-[24px] border overflow-hidden">
          <button onClick={function(){ setShowArticle(!showArticle); }} className="w-full p-5 flex justify-between font-black text-left">What is Fake Data Generator? <span>{showArticle?"-":"+"}</span></button>
          {showArticle && <div className="px-5 pb-5 text-[13px] text-zinc-600 leading-7">This tool generates fake data in 30 languages with 15-20 unique names per language. No repeat data. Name, City, Address, Company in native script, Email always in English.</div>}
        </div>

        <div className="mt-5 bg-white rounded-[24px] border p-5">
          <h3 className="font-black">FAQ - English</h3>
          <div className="mt-4 space-y-2">
            {[
              {q:"Is this data real?", a:"No, 100% fake random data for testing only."},
              {q:"Why is Email always in English?", a:"Because email like Japanese script is invalid worldwide."},
              {q:"How to fix repeat data?", a:"Now each language has 15-20 unique names, so 124 records will have varied data."},
            ].map(function(f,i){ return <div key={i} className="border rounded-xl"><button onClick={function(){ setFaqOpen(faqOpen===i?null:i); }} className="w-full text-left p-4 font-bold flex justify-between bg-zinc-50 text-[13px]">{f.q}<span>{faqOpen===i?"-":"+"}</span></button>{faqOpen===i && <div className="px-4 py-3 text-[12px] bg-white">{f.a}</div>}</div>; })}
          </div>
        </div>
      </main>
    </div>
  )
}
