// @ts-nocheck
"use client";
import { useState, useEffect } from "react";

const ALL_FIELDS = ["Full Name","Email","Mobile","Address","City","Pincode","Company","PAN","Aadhaar","UPI ID"];

const LANGS = [
  "Hindi","Tamil","Telugu","Marathi","Bengali","Gujarati","Malayalam","Kannada","Punjabi","Marwari","Urdu","Bhojpuri","Odia","English","Hinglish","English (US)",
  "Spanish","French","German","Portuguese","Japanese","Chinese","Russian","Arabic","Korean","Italian","Turkish","Dutch","Thai","Vietnamese"
];

const DATA: any = {
  Hindi: { names: ["अमित शर्मा","रवि वर्मा","सुनील कुमार","पूजा गुप्ता","नेहा सिंह"], cities: ["दिल्ली","मुंबई","जयपुर","सूरतगढ़","लखनऊ"], addr: "एमजी रोड", comp: "प्रा. लि." },
  Tamil: { names: ["அர்ஜுன் குமார்","சூர்யா சிவகுமார்","பிரியா லட்சுமி"], cities: ["சென்னை","கோயம்புத்தூர்","மதுரை"], addr: "எம்.ஜி. சாலை", comp: "டெக்" },
  Telugu: { names: ["రవి తేజ","పవన్ కళ్యాణ్","సమంత అక్కినేని"], cities: ["హైదరాబాద్","విజయవాడ","విశాఖపట్నం"], addr: "ఎంజి రోడ్", comp: "టెక్ ప్రైవేట్" },
  Marathi: { names: ["साहिल जोशी","ओंकार पाटील","स्नेहा कुलकर्णी"], cities: ["पुणे","मुंबई","नागपूर"], addr: "एमजी रस्ता", comp: "टेक प्रा. लि." },
  Bengali: { names: ["অরিন্দম দাস","সৌরভ গাঙ্গুলী","রিয়া সেন"], cities: ["কলকাতা","হাওড়া","দার্জিলিং"], addr: "এমজি রোড", comp: "টেক প্রাইভেট" },
  Gujarati: { names: ["હાર્દિક પટેલ","કિંજલ દવે","ધારા મહેતા"], cities: ["અમદાવાદ","સુરત","વડોદરા"], addr: "એમજી રોડ", comp: "ટેક પ્રા.લિ." },
  Malayalam: { names: ["മോഹൻലാൽ","ദുൽഖർ","നയൻ താര"], cities: ["കൊച്ചി","തിരുവനന്തപുരം","കോഴിക്കോട്"], addr: "എംജി റോഡ്", comp: "ടെക് പ്രൈവറ്റ്" },
  Kannada: { names: ["ಯಶ್ ಗೌಡ","ರಶ್ಮಿಕಾ ಮಂದಣ್ಣ","ರಮ್ಯಾ"], cities: ["ಬೆಂಗಳೂರು","ಮೈಸೂರು","ಮಂಗಳೂರು"], addr: "ಎಂಜಿ ರಸ್ತೆ", comp: "ಟೆಕ್ ಪ್ರೈ. ಲಿ." },
  Punjabi: { names: ["ਜੱਸੀ ਗਿੱਲ","ਸਿਮਰਨ ਕੌਰ","ਦਿਲਜੀਤ"], cities: ["ਲੁਧਿਆਣਾ","ਅੰਮ੍ਰਿਤਸਰ","ਪਟਿਆਲਾ"], addr: "ਐਮਜੀ ਰੋਡ", comp: "ਟੈਕ ਪ੍ਰਾ. ਲਿ." },
  Marwari: { names: ["भंवर सिंह","कमला देवी","सुनीता जैन"], cities: ["बीकानेर","जोधपुर","सूरतगढ़"], addr: "एमजी रोड़", comp: "टेक प्रा. लि." },
  Urdu: { names: ["عمران خان","زویا شیخ","عائشہ صدیقی"], cities: ["کراچی","لاہور","دہلی"], addr: "ایم جی روڈ", comp: "ٹیک پرائیویٹ" },
  Bhojpuri: { names: ["खेसारी लाल","पवन सिंह","अक्षरा सिंह"], cities: ["पटना","आरा","बलिया"], addr: "एमजी रोड", comp: "टेक प्रा. लि." },
  Odia: { names: ["ଶୁଭମ ମହାନ୍ତି","ସୋନଲ ମହାପାତ୍ର"], cities: ["ଭୁବନେଶ୍ୱର","କଟକ","ପୁରୀ"], addr: "ଏମଜି ରୋଡ", comp: "ଟେକ୍ ପ୍ରା" },
  English: { names: ["Aarav Mehta","Ananya Singh","Rahul Kumar"], cities: ["Delhi","Mumbai","Jaipur"], addr: "MG Road", comp: "Tech Pvt Ltd" },
  Hinglish: { names: ["Aarav Sharma","Pooja Singh"], cities: ["Delhi","Mumbai"], addr: "MG Road", comp: "Tech Pvt Ltd" },
  "English (US)": { names: ["John Smith","Emma Johnson","Michael Brown"], cities: ["New York","Los Angeles","Chicago"], addr: "5th Avenue", comp: "Inc." },
  Spanish: { names: ["José García","María López","Carlos Ruiz"], cities: ["Madrid","Barcelona","Sevilla"], addr: "Calle Mayor", comp: "S.L." },
  French: { names: ["Pierre Dupont","Marie Dubois","Luc Martin"], cities: ["Paris","Lyon","Marseille"], addr: "Rue de la Paix", comp: "SARL" },
  German: { names: ["Hans Müller","Greta Schmidt","Klaus Weber"], cities: ["Berlin","Munich","Hamburg"], addr: "Hauptstrasse", comp: "GmbH" },
  Portuguese: { names: ["João Silva","Ana Santos","Pedro Oliveira"], cities: ["Lisboa","Porto","Braga"], addr: "Rua Augusta", comp: "Lda." },
  Japanese: { names: ["田中太郎","佐藤花子","鈴木一郎"], cities: ["東京","大阪","京都"], addr: "中央通り", comp: "株式会社" },
  Chinese: { names: ["张伟","王芳","李明"], cities: ["北京","上海","广州"], addr: "中山路", comp: "有限公司" },
  Russian: { names: ["Иван Иванов","Анна Петрова","Дмитрий Смирнов"], cities: ["Москва","Санкт-Петербург","Казань"], addr: "ул. Ленина", comp: "ООО" },
  Arabic: { names: ["محمد أحمد","فاطمة علي","عمر حسن"], cities: ["دبي","الرياض","القاهرة"], addr: "شارع الملك", comp: "ذ.م.م" },
  Korean: { names: ["김민준","박지연","이서준"], cities: ["서울","부산","인천"], addr: "강남대로", comp: "주식회사" },
  Italian: { names: ["Marco Rossi","Giulia Bianchi","Luca Esposito"], cities: ["Roma","Milano","Napoli"], addr: "Via Roma", comp: "S.r.l." },
  Turkish: { names: ["Mehmet Yılmaz","Ayşe Kaya","Mustafa Demir"], cities: ["Istanbul","Ankara","Izmir"], addr: "Atatürk Caddesi", comp: "A.Ş." },
  Dutch: { names: ["Jan Jansen","Emma de Vries","Bram van Dijk"], cities: ["Amsterdam","Rotterdam","Utrecht"], addr: "Damstraat", comp: "B.V." },
  Thai: { names: ["สมชาย ใจดี","สมหญิง รักไทย","ประยุทธ์ จันทร์"], cities: ["กรุงเทพ","เชียงใหม่","ภูเก็ต"], addr: "ถนนสุขุมวิท", comp: "จำกัด" },
  Vietnamese: { names: ["Nguyễn Văn A","Trần Thị B","Lê Văn C"], cities: ["Hà Nội","Hồ Chí Minh","Đà Nẵng"], addr: "Đường Lê Lợi", comp: "TNHH" },
};

function genOne(fields: string[], lang: string){
  const d = DATA[lang] || DATA["English"];
  const name = d.names[Math.floor(Math.random()*d.names.length)];
  const city = d.cities[Math.floor(Math.random()*d.cities.length)];
  const first = name.split(" ")[0];
  const o: any = {};
  if(fields.includes("Full Name")) o["Full Name"] = name;
  if(fields.includes("Email")) o["Email"] = `${first.toLowerCase()}${Math.floor(Math.random()*900)}@gmail.com`;
  if(fields.includes("Mobile")) o["Mobile"] = `9${Math.floor(Math.random()*900000000+100000000)}`;
  if(fields.includes("Address")) o["Address"] = `${Math.floor(Math.random()*500)} ${d.addr}, ${city}`;
  if(fields.includes("City")) o["City"] = city;
  if(fields.includes("Pincode")) o["Pincode"] = `${Math.floor(Math.random()*900000+100000)}`;
  if(fields.includes("Company")) o["Company"] = `${name.split(" ")[1] || "Global"} ${d.comp}`;
  if(fields.includes("PAN")) o["PAN"] = `ABCDE${Math.floor(Math.random()*9000+1000)}F`;
  if(fields.includes("Aadhaar")) o["Aadhaar"] = `${Math.floor(Math.random()*9+1)}${Math.floor(Math.random()*100000000000).toString().padStart(11,'0')}`;
  if(fields.includes("UPI ID")) o["UPI ID"] = `${first.toLowerCase()}@ok${lang.slice(0,2).toLowerCase()}`;
  return o;
}

export default function Page(){
  const [fields,setFields]=useState(["Full Name","Address","City","Company"]);
  const [lang,setLang]=useState("Bhojpuri");
  const [count,setCount]=useState(124);
  const [data,setData]=useState<any[]>([]);
  const [view,setView]=useState("table");
  const generate = () => setData(Array.from({length: count}, () => genOne(fields, lang)));
  useEffect(()=>{ generate(); }, []);
  useEffect(()=>{ generate(); }, [lang]);
  const getStr = () => {
    if(view==="json") return JSON.stringify(data,null,2);
    if(view==="csv") return data.length? [Object.keys(data[0]).join(","),...data.map(r=>Object.values(r).map(v=>`"${v}"`).join(","))].join("\n") : "";
    if(view==="txt") return data.map(r=>Object.entries(r).map(([k,v])=>`${k}: ${v}`).join(" | ")).join("\n");
    if(view==="sql") return data.length? `INSERT INTO users (${Object.keys(data[0]).join(", ")}) VALUES\n${data.map(r=>`(${Object.values(r).map(v=>`'${v}'`).join(", ")})`).join(",\n")};` : "";
    return JSON.stringify(data,null,2);
  };
  return (
    <div className="min-h-screen bg-[#f8f8f7] text-zinc-900">
      <main className="max-w-[1100px] mx-auto px-3 py-4">
        <h1 className="text-[24px] font-black">Fake Data Generator - 30 Languages</h1>
        <p className="text-zinc-500 text-[12px] mt-1">🌐 15 Indian + 15 Global Languages • All Fields Localized</p>
        <div className="bg-white rounded-[24px] border shadow-sm p-5 mt-4">
          <label className="font-bold text-[14px]">🌐 Select Language (30 Languages - All Fields Change)</label>
          <select value={lang} onChange={e=>setLang(e.target.value)} className="w-full mt-2 border-2 border-black rounded-full px-5 py-4 text-[15px] bg-yellow-50 font-bold outline-none">
            <optgroup label="🇮🇳 Indian Languages (15)">{LANGS.slice(0,16).map(l=><option key={l} value={l}>{l}</option>)}</optgroup>
            <optgroup label="🌍 Global Languages (14)">{LANGS.slice(16).map(l=><option key={l} value={l}>{l}</option>)}</optgroup>
          </select>
          <div className="mt-2 bg-green-100 border text-green-800 text-[12px] font-bold px-3 py-2 rounded-full">✅ Active: {lang} - City, Address, Company bhi {lang} me ayega</div>
          <h3 className="font-bold text-[14px] mt-6">Select Fields ({fields.length} / 10)</h3>
          <div className="grid grid-cols-2 gap-2.5 mt-3">
            {ALL_FIELDS.map(f=>{ const active=fields.includes(f); return <button key={f} onClick={()=>{ if(active) setFields(fields.filter(x=>x!==f)); else if(fields.length<10) setFields([...fields,f]); }} className={`h-[48px] rounded-full text-[13px] ${active?"bg-black text-white":"bg-zinc-100"}`}>{f}</button>})}
          </div>
          <div className="mt-6"><label className="font-bold text-[14px]">Records: {count} / 1000</label><input type="range" min={1} max={1000} value={count} onChange={e=>setCount(parseInt(e.target.value))} className="w-full mt-3 accent-black h-2" /></div>
          <button onClick={generate} className="mt-6 w-full h-[56px] bg-black text-white rounded-full font-black text-[16px]">⚡ Generate {count} Records in {lang}</button>
        </div>
        {data.length>0 && (
          <div className="mt-5 bg-white rounded-[24px] border p-4">
            <div className="flex gap-2 overflow-auto pb-2">{["table","json","csv","txt","sql"].map(v=><button key={v} onClick={()=>setView(v)} className={`px-6 h-10 rounded-full text-xs font-black uppercase ${view===v?"bg-black text-white":"bg-zinc-100"}`}>{v}</button>)}</div>
            <div className="flex gap-2 mt-4"><button onClick={()=>navigator.clipboard.writeText(getStr())} className="flex-1 h-12 rounded-full bg-black text-white font-bold">Copy</button><a href={`data:text/plain;charset=utf-8,[STRIPPED] download={`fake-data.${view==="table"?"json":view}`} className="flex-1 h-12 rounded-full bg-yellow-400 text-black font-black flex items-center justify-center">Download</a></div>
            <div className="mt-4 border rounded-2xl overflow-auto max-h-[500px]">{view==="table"? <table className="w-full text-[13px]"><thead className="bg-zinc-50 sticky top-0"><tr>{Object.keys(data[0]||{}).map(k=><th key={k} className="text-left p-3.5 font-bold border-b">{k}</th>)}</tr></thead><tbody>{data.map((r:any,i:number)=><tr key={i} className="border-t"><td colSpan={20}><div className="flex">{Object.values(r).map((v:any,j:number)=><div key={j} className="p-3.5 min-w-[150px] border-r">{String(v)}</div>)}</div></td></tr>)}</tbody></table> : <pre className="p-4 text-[12px] whitespace-pre-wrap bg-zinc-50">{getStr()}</pre>}</div>
          </div>
        )}
      </main>
    </div>
  )
}
