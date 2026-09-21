// @ts-nocheck
"use client";
import { useState, useEffect } from "react";

const ALL_FIELDS = ["Full Name","Email","Mobile","Address","City","Pincode","Company","PAN","Aadhaar","UPI ID"];
const LANGS = ["English","Hindi","Hinglish","Marathi","Tamil","Telugu","Bengali","Gujarati","Malayalam","Kannada","Punjabi","Marwari","Urdu","Bhojpuri","Odia","English (US)"];

const NAMES: any = {
  Hindi: ["अमित शर्मा","रवि वर्मा","सुनील कुमार","विक्रम सिंह","अंजलि पटेल","पूजा गुप्ता","दीपक यादव","नेहा सिंह"],
  Tamil: ["அர்ஜுன் குமார்","கார்த்தி ராஜா","சூர்யா சிவகுமார்","பிரியா லட்சுமி","லட்சுமி மேனன்"],
  Telugu: ["రవి తేజ","పవన్ కళ్యాణ్","మహేష్ బాబు","సమంత అక్కినేని","అనుష్క శెట్టి"],
  Marathi: ["साहिल जोशी","ओंकार पाटील","स्नेहा कुलकर्णी","माधुरी दीक्षित","सचिन तेंडुलकर"],
  Bengali: ["অরিন্দম দাস","সৌরভ গাঙ্গুলী","রিয়া সেন","মিষ্টি চ্যাটার্জী","জিৎ ব্যানার্জী"],
  Gujarati: ["હાર્દિક પટેલ","જીગર શાહ","કિંજલ દવે","ધારા મહેતા","કેતન પટેલ"],
  Malayalam: ["മോഹൻലാൽ കുമാർ","ദുൽഖർ സൽമാൻ","നയൻ താര","മഞ്ജു വാര്യർ"],
  Kannada: ["ಯಶ್ ಗೌಡ","ದರ್ಶನ್ ಕುಮಾರ್","ರಶ್ಮಿಕಾ ಮಂದಣ್ಣ","ರಮ್ಯಾ ಕೃಷ್ಣನ್"],
  Punjabi: ["ਜੱਸੀ ਗਿੱਲ","ਹਰਮਨ ਸਿੰਘ","ਸਿਮਰਨ ਕੌਰ","ਗੁਰਪ੍ਰੀਤ ਢਿੱਲੋਂ","ਦਿਲਜੀਤ ਦੋਸਾਂਝ"],
  Marwari: ["भंवर सिंह राठौड़","घेवर मल सोनी","कमला देवी अग्रवाल","सुनीता जैन"],
  Urdu: ["عمران خان","فیضان احمد","زویا شیخ","عائشہ صدیقی","سلمان خان"],
  Bhojpuri: ["खेसारी लाल यादव","पवन सिंह","अक्षरा सिंह","आम्रपाली दुबे"],
  Odia: ["ଶୁଭମ ମହାନ୍ତି","ସମ୍ବିତ ପାତ୍ର","ସୋନଲ ମହାପାତ୍ର","ପ୍ରଜ୍ଞା ଅଲକା"],
  English: ["Aarav Mehta","Vivaan Shah","Rahul Kumar","Sai Kapoor","Ananya Singh"],
  "English (US)": ["John Smith","Emma Johnson","Michael Brown","Sophia Williams","David Miller"],
  Hinglish: ["Aarav Sharma","Rahul Verma","Sai Kumar","Pooja Singh","Riya Patel"]
};

function genOne(fields: string[], lang: string){
  const list = NAMES[lang] || NAMES["English"];
  const fullName = list[Math.floor(Math.random()*list.length)];
  const parts = fullName.split(" ");
  const first = parts[0] || "Amit";
  const last = parts[1] || "Kumar";
  const city = ["Delhi","Mumbai","Suratgarh","Jaipur","Pune","Kolkata"][Math.floor(Math.random()*6)];
  const o: any = {};
  if(fields.includes("Full Name")) o["Full Name"] = fullName;
  if(fields.includes("Email")) o["Email"] = `user${Math.floor(Math.random()*900)}@gmail.com`;
  if(fields.includes("Mobile")) o["Mobile"] = `9${Math.floor(Math.random()*900000000+100000000)}`;
  if(fields.includes("Address")) o["Address"] = `${Math.floor(Math.random()*500)} MG Road, ${city}`;
  if(fields.includes("City")) o["City"] = city;
  if(fields.includes("Pincode")) o["Pincode"] = `${Math.floor(Math.random()*900000+100000)}`;
  if(fields.includes("Company")) o["Company"] = `${last} Tech Pvt Ltd`;
  if(fields.includes("PAN")) o["PAN"] = `ABCDE${Math.floor(Math.random()*9000+1000)}F`;
  if(fields.includes("Aadhaar")) o["Aadhaar"] = `${Math.floor(Math.random()*900000000000+100000000000)}`.toString().slice(0,12);
  if(fields.includes("UPI ID")) o["UPI ID"] = `user${Math.floor(Math.random()*99)}@okhdfc`;
  return o;
}

export default function Page(){
  const [fields,setFields]=useState(["Full Name","Email","Mobile","City"]);
  const [lang,setLang]=useState("English");
  const [count,setCount]=useState(255);
  const [data,setData]=useState<any[]>([]);
  const [view,setView]=useState("table");

  const generate = () => {
    setData(Array.from({length: count}, () => genOne(fields, lang)));
  };
  useEffect(()=>{ generate(); }, []);
  // Jab language badlega auto generate
  useEffect(()=>{ generate(); }, [lang]);

  const jsonStr = JSON.stringify(data, null, 2);
  const csvStr = data.length? [Object.keys(data[0]).join(","),...data.map((r:any) => Object.values(r).map((v:any) => `"${v}"`).join(","))].join("\n") : "";
  const txtStr = data.map((r:any) => Object.entries(r).map(([k,v]) => `${k}: ${v}`).join(" | ")).join("\n");
  const sqlStr = data.length? `INSERT INTO users (${Object.keys(data[0]).join(", ")}) VALUES\n${data.map((r:any) => `(${Object.values(r).map((v:any) => `'${v}'`).join(", ")})`).join(",\n")};` : "";
  const getStr = () => { if(view==="json") return jsonStr; if(view==="csv") return csvStr; if(view==="txt") return txtStr; if(view==="sql") return sqlStr; return jsonStr; };

  return (
    <div className="min-h-screen bg-[#f8f8f7] text-zinc-900">
      <main className="max-w-[1100px] mx-auto px-3 py-4">
        <h1 className="text-[26px] font-black">Fake Data Generator - Indian Pro Tool</h1>
        <p className="text-zinc-500 text-[13px] mt-1">🌐 15 Indian Languages • 1000 Records • PAN Aadhaar UPI</p>

        <div className="bg-white rounded-[24px] border shadow-sm p-5 mt-4">
          <label className="font-bold text-[14px]">🌐 Select Language (15 Languages Supported)</label>
          <select value={lang} onChange={e=>setLang(e.target.value)} className="w-full mt-2 border-2 border-black rounded-full px-5 py-4 text-[15px] bg-yellow-50 font-bold outline-none">
            {LANGS.map(l=><option key={l} value={l}>{l}</option>)}
          </select>
          <div className="mt-2 bg-green-100 border border-green-300 text-green-800 text-[12px] font-bold px-3 py-2 rounded-full">✅ Active: {lang} - {lang==="Hindi"?"अब हिंदी नाम दिखेंगे":"Now "+lang+" names will show"}</div>

          <h3 className="font-bold text-[14px] mt-6">Select Fields ({fields.length} / 10)</h3>
          <div className="grid grid-cols-2 gap-2.5 mt-3">
            {ALL_FIELDS.map(f=>{ const active=fields.includes(f); return <button key={f} onClick={()=>{ if(active) setFields(fields.filter(x=>x!==f)); else if(fields.length<10) setFields([...fields,f]); }} className={`h-[48px] rounded-full font-medium text-[13px] ${active?"bg-black text-white":"bg-zinc-100 text-zinc-700"}`}>{f}</button>})}
          </div>
          <div className="mt-6">
            <label className="font-bold text-[14px]">Records: {count} / 1000</label>
            <input type="range" min={1} max={1000} value={count} onChange={e=>setCount(parseInt(e.target.value))} className="w-full mt-3 accent-black h-2" />
          </div>
          <button onClick={generate} className="mt-6 w-full h-[56px] bg-black text-white rounded-full font-black text-[16px]">⚡ Generate {count} Records in {lang}</button>
        </div>

        {data.length>0 && (
          <div className="mt-5 bg-white rounded-[24px] border shadow-sm p-4">
            <div className="flex gap-2 overflow-auto pb-2">
              {["table","json","csv","txt","sql"].map(v=><button key={v} onClick={()=>setView(v)} className={`px-6 h-10 rounded-full text-xs font-black uppercase ${view===v?"bg-black text-white":"bg-zinc-100"}`}>{v}</button>)}
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={()=>{navigator.clipboard.writeText(getStr());}} className="flex-1 h-12 rounded-full bg-black text-white text-[14px] font-bold">Copy</button>
              <a href={`data:text/plain;charset=utf-8,${encodeURIComponent(getStr())}`} download={`fake-data.${view==="table"?"json":view}`} className="flex-1 h-12 rounded-full bg-yellow-400 text-black text-[14px] font-black flex items-center justify-center">Download</a>
            </div>
            <div className="mt-4 border rounded-2xl overflow-auto max-h-[500px] bg-white">
              {view==="table"? <table className="w-full text-[13px]"><thead className="bg-zinc-50 sticky top-0"><tr>{Object.keys(data[0]||{}).map(k=><th key={k} className="text-left p-3.5 font-bold border-b">{k}</th>)}</tr></thead><tbody>{data.map((r:any,i:number)=><tr key={i} className="border-t"><td colSpan={20}><div className="flex">{Object.values(r).map((v:any,j:number)=><div key={j} className="p-3.5 min-w-[140px] border-r">{String(v)}</div>)}</div></td></tr>)}</tbody></table> : <pre className="p-4 text-[12px] whitespace-pre-wrap bg-zinc-50">{getStr()}</pre>}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
