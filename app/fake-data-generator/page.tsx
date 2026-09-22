// @ts-nocheck
"use client";
import { useState, useEffect } from "react";

const ALL_FIELDS = ["Full Name","Email","Mobile","Address","City","Pincode","Company","PAN","Aadhaar","UPI ID"];
const LANGS = ["Hindi","Tamil","Telugu","Marathi","Bengali","Gujarati","Malayalam","Kannada","Punjabi","Marwari","Urdu","Bhojpuri","Odia","English","Hinglish","English (US)","Spanish","French","German","Portuguese","Japanese","Chinese","Russian","Arabic","Korean","Italian","Turkish","Dutch","Thai","Vietnamese"];

const DATA: any = {
  Hindi: { names: ["Amit Sharma","Ravi Verma"], cities: ["Delhi","Mumbai","Jaipur","Suratgarh"], addr: "MG Road", comp: "Pvt Ltd", localNames: ["अमित शर्मा","रवि वर्मा"] },
  Tamil: { names: ["Arjun Kumar"], cities: ["Chennai"], addr: "MG Road", comp: "Tech", localNames: ["அர்ஜுன் குமார்"] },
  Bhojpuri: { names: ["Khesari Lal"], cities: ["Patna","Ara"], addr: "MG Road", comp: "Tech Pvt Ltd", localNames: ["खेसारी लाल","पवन सिंह"] },
  English: { names: ["Aarav Mehta"], cities: ["Delhi","Mumbai"], addr: "MG Road", comp: "Tech Pvt Ltd", localNames: ["Aarav Mehta"] },
};

const FULL_DATA: any = {
  Hindi: { names: ["अमित शर्मा","रवि वर्मा","सुनील कुमार","पूजा गुप्ता","नेहा सिंह"], cities: ["दिल्ली","मुंबई","जयपुर","सूरतगढ़","लखनऊ"], addr: "एमजी रोड", comp: "प्रा. लि." },
  Tamil: { names: ["அர்ஜுன் குமார்","சூர்யா சிவகுமார்","பிரியா லட்சுமி"], cities: ["சென்னை","கோயம்புத்தூர்","மதுரை"], addr: "எம்.ஜி. சாலை", comp: "டெக்" },
  Telugu: { names: ["రవి తేజ","పవన్ కళ్యాణ్","సమంత అక్కినేని"], cities: ["హైదరాబాద్","విజయవాడ"], addr: "ఎంజి రోడ్", comp: "టెక్ ప్రైవేట్" },
  Marathi: { names: ["साहिल जोशी","ओंकार पाटील"], cities: ["पुणे","मुंबई"], addr: "एमजी रस्ता", comp: "टेक प्रा. लि." },
  Bengali: { names: ["অরিন্দম দাস","সৌরভ গাঙ্গুলী"], cities: ["কলকাতা","হাওড়া"], addr: "এমজি রোড", comp: "টেক প্রাইভেট" },
  Gujarati: { names: ["હાર્દિક પટેલ","કિંજલ દવે"], cities: ["અમદાવાદ","સુરત"], addr: "એમજી રોડ", comp: "ટેક પ્રા.લિ." },
  Malayalam: { names: ["മോഹൻലാൽ","ദുൽഖർ"], cities: ["കൊച്ചി","തിരുവനന്തപുരം"], addr: "എംജി റോഡ്", comp: "ടെക് പ്രൈവറ്റ്" },
  Kannada: { names: ["ಯಶ್ ಗೌಡ","ರಶ್ಮಿಕಾ ಮಂದಣ್ಣ"], cities: ["ಬೆಂಗಳೂರು","ಮೈಸೂರು"], addr: "ಎಂಜಿ ರಸ್ತೆ", comp: "ಟೆಕ್ ಪ್ರೈ. ಲಿ." },
  Punjabi: { names: ["ਜੱਸੀ ਗਿੱਲ","ਸਿਮਰਨ ਕੌਰ"], cities: ["ਲੁਧਿਆਣਾ","ਅੰਮ੍ਰਿਤਸਰ"], addr: "ਐਮਜੀ ਰੋਡ", comp: "ਟੈਕ ਪ੍ਰਾ. ਲਿ." },
  Marwari: { names: ["भंवर सिंह","कमला देवी"], cities: ["बीकानेर","जोधपुर","सूरतगढ़"], addr: "एमजी रोड़", comp: "टेक प्रा. लि." },
  Urdu: { names: ["عمران خان","زویا شیخ"], cities: ["کراچی","لاہور"], addr: "ایم جی روڈ", comp: "ٹیک پرائیویٹ" },
  Bhojpuri: { names: ["खेसारी लाल","पवन सिंह","अक्षरा सिंह"], cities: ["पटना","आरा","बलिया"], addr: "एमजी रोड", comp: "टेक प्रा. लि." },
  Odia: { names: ["ଶୁଭମ ମହାନ୍ତି","ସୋନଲ ମହାପାତ୍ର"], cities: ["ଭୁବନେଶ୍ୱର","କଟକ"], addr: "ଏମଜି ରୋଡ", comp: "ଟେକ୍ ପ୍ରା" },
  English: { names: ["Aarav Mehta","Ananya Singh"], cities: ["Delhi","Mumbai","Jaipur"], addr: "MG Road", comp: "Tech Pvt Ltd" },
  Hinglish: { names: ["Aarav Sharma","Pooja Singh"], cities: ["Delhi","Mumbai"], addr: "MG Road", comp: "Tech Pvt Ltd" },
  "English (US)": { names: ["John Smith","Emma Johnson"], cities: ["New York","Los Angeles"], addr: "5th Avenue", comp: "Inc." },
  Spanish: { names: ["Jose Garcia","Maria Lopez"], cities: ["Madrid","Barcelona"], addr: "Calle Mayor", comp: "S.L." },
  French: { names: ["Pierre Dupont","Marie Dubois"], cities: ["Paris","Lyon"], addr: "Rue de la Paix", comp: "SARL" },
  German: { names: ["Hans Muller","Greta Schmidt"], cities: ["Berlin","Munich"], addr: "Hauptstrasse", comp: "GmbH" },
  Portuguese: { names: ["Joao Silva","Ana Santos"], cities: ["Lisboa","Porto"], addr: "Rua Augusta", comp: "Lda." },
  Japanese: { names: ["Tanaka Taro","Sato Hanako"], cities: ["Tokyo","Osaka"], addr: "Chuo Street", comp: "Co Ltd" },
  Chinese: { names: ["Zhang Wei","Wang Fang"], cities: ["Beijing","Shanghai"], addr: "Zhongshan Road", comp: "Co Ltd" },
  Russian: { names: ["Ivan Ivanov","Anna Petrova"], cities: ["Moscow"], addr: "Lenina Street", comp: "OOO" },
  Arabic: { names: ["Mohammad Ahmed","Fatima Ali"], cities: ["Dubai","Riyadh"], addr: "King Street", comp: "LLC" },
  Korean: { names: ["Kim Minjun","Park Jiyeon"], cities: ["Seoul","Busan"], addr: "Gangnam Road", comp: "Corp" },
  Italian: { names: ["Marco Rossi","Giulia Bianchi"], cities: ["Roma","Milano"], addr: "Via Roma", comp: "S.r.l." },
  Turkish: { names: ["Mehmet Yilmaz","Ayse Kaya"], cities: ["Istanbul","Ankara"], addr: "Ataturk Street", comp: "A.S." },
  Dutch: { names: ["Jan Jansen","Emma de Vries"], cities: ["Amsterdam","Rotterdam"], addr: "Damstraat", comp: "B.V." },
  Thai: { names: ["Somchai Jaidee"], cities: ["Bangkok","Chiang Mai"], addr: "Sukhumvit Road", comp: "Co Ltd" },
  Vietnamese: { names: ["Nguyen Van A","Tran Thi B"], cities: ["Hanoi","Ho Chi Minh"], addr: "Le Loi Street", comp: "Co Ltd" },
};

const LOCAL_DATA: any = {
  Hindi: { names: ["अमित शर्मा","रवि वर्मा"], cities: ["दिल्ली","मुंबई"] },
  Tamil: { names: ["அர்ஜுன் குமார்"], cities: ["சென்னை"] },
  Bhojpuri: { names: ["खेसारी लाल","पवन सिंह"], cities: ["पटना","आरा"] },
};

const ENG_EMAIL = ["amit","ravi","sunil","pooja","neha","rahul","ananya","arjun","priya","vijay"];

function genOne(fields: any, lang: any){
  var d = FULL_DATA[lang] || FULL_DATA.English;
  var name = d.names[Math.floor(Math.random()*d.names.length)];
  var city = d.cities[Math.floor(Math.random()*d.cities.length)];
  var eng = ENG_EMAIL[Math.floor(Math.random()*ENG_EMAIL.length)];
  var o: any = {};
  if(fields.includes("Full Name")) o["Full Name"] = name;
  if(fields.includes("Email")) o["Email"] = eng + Math.floor(Math.random()*900) + "@gmail.com";
  if(fields.includes("Mobile")) o["Mobile"] = "9" + Math.floor(Math.random()*900000000+100000000);
  if(fields.includes("Address")) o["Address"] = Math.floor(Math.random()*500) + " " + d.addr + ", " + city;
  if(fields.includes("City")) o["City"] = city;
  if(fields.includes("Pincode")) o["Pincode"] = "" + Math.floor(Math.random()*900000+100000);
  if(fields.includes("Company")) o["Company"] = d.comp;
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

  useEffect(()=>{ document.title = "Fake Data Generator - 30 Languages | Free Tool"; }, []);

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
        <p className="text-zinc-500 text-[12px] mt-1">SEO Ready: 15 Indian + 15 Global - Email Always English</p>

        <div className="bg-white rounded-[24px] border p-5 mt-4">
          <label className="font-bold text-[14px]">Select Language (All Fields Change Except Email)</label>
          <select value={lang} onChange={function(e){ setLang(e.target.value); }} className="w-full mt-2 border-2 border-black rounded-full px-5 py-4 text-[15px] bg-yellow-50 font-bold">
            {LANGS.map(function(l){ return <option key={l} value={l}>{l}</option>; })}
          </select>
          <div className="mt-2 bg-green-100 border text-green-800 text-[12px] font-bold px-3 py-2 rounded-full">Active: {lang} - Email always English</div>
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
          {showArticle && <div className="px-5 pb-5 text-[13px] text-zinc-600 leading-7">This tool generates fake data in 30 languages - 15 Indian and 15 Global. Name, City, Address, Company change as per language. Email is always in English because email IDs like Hindi script are not valid. 100% fake for testing only. Export in JSON, CSV, TXT, SQL.</div>}
        </div>

        <div className="mt-5 bg-white rounded-[24px] border p-5">
          <h3 className="font-black">FAQ - English</h3>
          <div className="mt-4 space-y-2">
            {[
              {q:"Is this data real?", a:"No, 100% fake random data for testing only."},
              {q:"Why is Email always in English?", a:"Because email like अमित@gmail.com is invalid worldwide. Only amit@gmail.com is valid, so Email is always English."},
              {q:"How does 30 language work?", a:"Select language, click Generate. Name City Address Company will be in that language, Email remains English."},
              {q:"What does Save do?", a:"Save stores data in browser local storage."},
            ].map(function(f,i){ return <div key={i} className="border rounded-xl"><button onClick={function(){ setFaqOpen(faqOpen===i?null:i); }} className="w-full text-left p-4 font-bold flex justify-between bg-zinc-50 text-[13px]">{f.q}<span>{faqOpen===i?"-":"+"}</span></button>{faqOpen===i && <div className="px-4 py-3 text-[12px] bg-white">{f.a}</div>}</div>; })}
          </div>
        </div>
      </main>
    </div>
  )
}
