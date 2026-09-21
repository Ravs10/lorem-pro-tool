// @ts-nocheck
"use client";
import { useState, useEffect } from "react";

const ALL_FIELDS = ["Full Name","Email","Mobile","Address","City","Pincode","Company","PAN","Aadhaar","UPI ID"];
const LANGS = ["English","Hindi","Hinglish","Marathi","Tamil","Telugu","Bengali","Gujarati","Malayalam","Kannada","Punjabi","Marwari","Urdu","Bhojpuri","Odia","English (US)"];

const NAMES: any = {
  Hindi: ["Amit Sharma","Ravi Verma","Sunil Kumar","Vikram Singh","Anjali Patel","Pooja Gupta","Deepak Yadav","Neha Singh"],
  Tamil: ["Arjun Kumar","Karthi Raja","Surya Sivakumar","Priya Lakshmi","Lakshmi Menon","Vijay Sethupathi"],
  Telugu: ["Ravi Teja","Pawan Kalyan","Mahesh Babu","Samantha Akkineni","Anushka Shetty"],
  Marathi: ["Sahil Joshi","Omkar Patil","Sneha Kulkarni","Madhuri Dixit","Sachin Tendulkar"],
  Bengali: ["Arindam Das","Sourav Ganguly","Riya Sen","Mishti Chatterjee","Jeet Banerjee"],
  Gujarati: ["Hardik Patel","Jigar Shah","Kinjal Dave","Dhara Mehta","Ketan Patel"],
  Malayalam: ["Mohanlal Kumar","Dulquer Salmaan","Nayan Thara","Manju Warrier"],
  Kannada: ["Yash Gowda","Darshan Kumar","Rashmika Mandanna","Ramya Krishnan"],
  Punjabi: ["Jassi Gill","Harman Singh","Simran Kaur","Gurpreet Dhillon","Diljit Dosanjh"],
  Marwari: ["Bhanwar Singh","Ghewar Mal","Kamla Devi","Sunita Agarwal"],
  Urdu: ["Imran Khan","Faizan Ahmed","Zoya Sheikh","Ayesha Siddiqui","Salman Khan"],
  Bhojpuri: ["Khesari Lal","Pawan Singh","Akshara Singh","Amrapali Dubey"],
  Odia: ["Subham Mohanty","Sambit Patra","Sonal Mohapatra","Pragya Alka"],
  English: ["Aarav Mehta","Vivaan Shah","Rahul Kumar","Sai Kapoor","Ananya Singh","Ishaan Verma"],
  "English (US)": ["John Smith","Emma Johnson","Michael Brown","Sophia Williams","David Miller"],
  Hinglish: ["Aarav Sharma","Rahul Verma","Sai Kumar","Pooja Singh","Riya Patel"]
};

function genOne(fields: string[], lang: string){
  const list = NAMES[lang] || NAMES["English"];
  const fullName = list[Math.floor(Math.random()*list.length)];
  const parts = fullName.split(" ");
  const first = parts[0];
  const last = parts[1] || "Kumar";
  const city = ["Delhi","Mumbai","Suratgarh","Jaipur","Pune","Kolkata","Chennai","Lucknow"][Math.floor(Math.random()*8)];
  const o: any = {};
  if(fields.includes("Full Name")) o["Full Name"] = fullName;
  if(fields.includes("Email")) o["Email"] = `${first.toLowerCase()}${Math.floor(Math.random()*900)}@gmail.com`;
  if(fields.includes("Mobile")) o["Mobile"] = `9${Math.floor(Math.random()*900000000+100000000)}`;
  if(fields.includes("Address")) o["Address"] = `${Math.floor(Math.random()*500)} MG Road, ${city}`;
  if(fields.includes("City")) o["City"] = city;
  if(fields.includes("Pincode")) o["Pincode"] = `${Math.floor(Math.random()*900000+100000)}`;
  if(fields.includes("Company")) o["Company"] = `${last} Tech Pvt Ltd`;
  if(fields.includes("PAN")) o["PAN"] = `ABCDE${Math.floor(Math.random()*9000+1000)}F`;
  if(fields.includes("Aadhaar")) o["Aadhaar"] = `${Math.floor(Math.random()*900000000000+100000000000)}`.toString().slice(0,12);
  if(fields.includes("UPI ID")) o["UPI ID"] = `${first.toLowerCase()}@okhdfc`;
  return o;
}

export default function Page(){
  const [fields,setFields]=useState(["Full Name","Email","Mobile","City"]);
  const [lang,setLang]=useState("English");
  const [count,setCount]=useState(255);
  const [data,setData]=useState<any[]>([]);
  const [view,setView]=useState("table");
  const [copyText,setCopyText]=useState("Copy");
  const [saveText,setSaveText]=useState("💾 Save");
  const [menuOpen,setMenuOpen]=useState(false);
  const [showArticle,setShowArticle]=useState(false);
  const [faqOpen,setFaqOpen]=useState<number | null>(0);

  const generate = () => {
    const newData = Array.from({length: count}, () => genOne(fields, lang));
    setData(newData);
  };

  useEffect(() => { generate(); }, []);

  const jsonStr = JSON.stringify(data, null, 2);
  const csvStr = data.length? [Object.keys(data[0]).join(","),...data.map((r:any) => Object.values(r).map((v:any) => `"${v}"`).join(","))].join("\n") : "";
  const txtStr = data.map((r:any) => Object.entries(r).map(([k,v]) => `${k}: ${v}`).join(" | ")).join("\n");
  const sqlStr = data.length? `INSERT INTO users (${Object.keys(data[0]).join(", ")}) VALUES\n${data.map((r:any) => `(${Object.values(r).map((v:any) => `'${v}'`).join(", ")})`).join(",\n")};` : "";

  const getStr = () => {
    if(view === "json") return jsonStr;
    if(view === "csv") return csvStr;
    if(view === "txt") return txtStr;
    if(view === "sql") return sqlStr;
    return jsonStr;
  };

  return (
    <div className="min-h-screen bg-[#f8f8f7] text-zinc-900">
      <header className="sticky top-0 z-50 bg-black text-white px-4 py-3 flex justify-between items-center">
        <h1 className="text-base font-black tracking-tight">⚡ Lorem Pro Tool</h1>
        <button className="bg-zinc-800 px-3 py-2 rounded-lg text-sm" onClick={()=>setMenuOpen(!menuOpen)}>☰ Menu</button>
        {menuOpen && (
          <div className="absolute top-[52px] left-0 w-full bg-black p-4 flex flex-col gap-3 text-sm border-t border-zinc-800">
            <a href="/" className="py-2 border-b border-zinc-800">🏠 Home</a>
            <a href="/fake-data-generator" className="py-2 text-yellow-400 font-bold">📊 Fake Data - 15 Languages</a>
          </div>
        )}
      </header>

      <main className="max-w-[1100px] mx-auto px-3 py-4">
        <div className="mb-2">
          <h1 className="text-[26px] font-black leading-tight">Fake Data Generator - Indian Pro Tool</h1>
          <p className="text-zinc-500 text-[13px] mt-1">🌐 15 Indian Languages • 1000 Records • JSON CSV TXT SQL • PAN Aadhaar UPI</p>
        </div>

        <div className="bg-white rounded-[24px] border shadow-sm p-5 mt-4">
          <label className="font-bold text-[14px]">🌐 Select Language (15 Languages Supported)</label>
          <select value={lang} onChange={e=>setLang(e.target.value)} className="w-full mt-2 border-2 border-zinc-200 rounded-full px-5 py-4 text-[14px] bg-zinc-50 font-bold outline-none">
            {LANGS.map(l=><option key={l} value={l}>{l}</option>)}
          </select>

          <h3 className="font-bold text-[14px] mt-6">Select Fields ({fields.length} / 10 Selected)</h3>
          <div className="grid grid-cols-2 gap-2.5 mt-3">
            {ALL_FIELDS.map(f=>{
              const active = fields.includes(f);
              return (
                <button key={f} onClick={()=>{ if(active) setFields(fields.filter(x=>x!==f)); else if(fields.length<10) setFields([...fields,f]); }} className={`h-[48px] rounded-full font-medium text-[13px] transition-all ${active?"bg-black text-white shadow-md":"bg-zinc-100 text-zinc-700"}`}>{f}</button>
              )
            })}
          </div>

          <div className="mt-6">
            <label className="font-bold text-[14px]">Records: {count} / 1000</label>
            <input type="range" min={1} max={1000} value={count} onChange={e=>setCount(parseInt(e.target.value))} className="w-full mt-3 accent-black h-2" />
          </div>

          <button onClick={generate} className="mt-6 w-full h-[56px] bg-black text-white rounded-full font-black text-[16px] shadow-lg active:scale-[0.98] transition-all">⚡ Generate {count} Records in {lang}</button>
        </div>

        {data.length>0 && (
          <div className="mt-5 bg-white rounded-[24px] border shadow-sm p-4">
            <div className="flex gap-2 overflow-auto pb-2 no-scrollbar">
              {["table","json","csv","txt","sql"].map(v=>(
                <button key={v} onClick={()=>setView(v)} className={`px-6 h-10 rounded-full text-xs font-black uppercase tracking-wider whitespace-nowrap ${view===v?"bg-black text-white":"bg-zinc-100 text-zinc-600"}`}>{v}</button>
              ))}
            </div>

            <div className="flex gap-2 mt-4">
              <button onClick={()=>{localStorage.setItem('saved-data',getStr()); setSaveText("✓ Saved!"); setTimeout(()=>setSaveText("💾 Save"),2000);}} className={`flex-1 h-12 rounded-full text-[14px] font-bold transition-all ${saveText.includes("Saved")?"bg-green-500 text-white":"bg-zinc-100 text-black"}`}>{saveText}</button>
              <button onClick={()=>{navigator.clipboard.writeText(getStr()); setCopyText("✓ Copied!"); setTimeout(()=>setCopyText("Copy"),2000);}} className={`flex-1 h-12 rounded-full text-[14px] font-bold transition-all ${copyText.includes("Copied")?"bg-green-500 text-white":"bg-black text-white"}`}>{copyText}</button>
              <a href={`data:text/plain;charset=utf-8,${encodeURIComponent(getStr())}`} download={`fake-data.${view==="table"?"json":view}`} className="flex-1 h-12 rounded-full bg-yellow-400 text-black text-[14px] font-black flex items-center justify-center">Download</a>
            </div>

            <div className="mt-4 border rounded-2xl overflow-auto max-h-[450px] bg-white">
              {view==="table"? (
                <table className="w-full text-[13px]">
                  <thead className="bg-zinc-50 sticky top-0 z-10"><tr>{Object.keys(data[0]||{}).map(k=><th key={k} className="text-left p-3.5 font-bold border-b whitespace-nowrap">{k}</th>)}</tr></thead>
                  <tbody>{data.map((r:any,i:number)=><tr key={i} className="border-t hover:bg-zinc-50"><td colSpan={20}><div className="flex">{Object.values(r).map((v:any,j:number)=><div key={j} className="p-3.5 min-w-[140px] truncate border-r last:border-r-0">{v}</div>)}</div></td></tr>)}</tbody>
                </table>
              ) : (
                <pre className="p-4 text-[12px] whitespace-pre-wrap bg-zinc-50 font-mono">{getStr()}</pre>
              )}
            </div>
          </div>
        )}

        <div className="mt-5 bg-white rounded-[24px] border shadow-sm overflow-hidden">
          <button onClick={()=>setShowArticle(!showArticle)} className="w-full p-5 flex justify-between items-center font-black text-left text-[15px]">📘 What is Fake Data Generator? Complete Guide <span className="text-xl">{showArticle?"−":"+"}</span></button>
          {showArticle && <div className="px-5 pb-5 text-[13px] text-zinc-600 leading-7">Fake Data Generator is free tool for developers. Generate realistic but fake Indian data like PAN, Aadhaar, UPI, Mobile in 15 languages: Hindi, Marathi, Tamil, Telugu, Bengali, Gujarati, Malayalam, Kannada, Punjabi, Marwari, Urdu, Bhojpuri, Odia. Export to JSON, CSV, TXT, SQL. No real data is used.</div>}
        </div>

        <div className="mt-5 bg-white rounded-[24px] border shadow-sm p-5">
          <h3 className="font-black text-[16px]">❓ FAQ</h3>
          <div className="mt-4 space-y-2.5">
            {[
              {q:"Is this data real? Can I use for official work?", a:"No, 100% fake and random data. Only for testing and development. Never use for real KYC or official work."},
              {q:"15 languages kaise kaam karta hai?", a:"Upar dropdown se language select karo - Hindi, Marathi, Tamil, Telugu, Bengali etc. Fir Generate dabao, naam usi language style ke aayenge."},
              {q:"SQL file kaise download karu?", a:"SQL tab pe click karo > Download button dabao. Direct.sql file download hogi."},
            ].map((f:any,i:number)=>(
              <div key={i} className="border rounded-xl overflow-hidden">
                <button onClick={()=>setFaqOpen(faqOpen===i?null:i)} className="w-full text-left p-4 font-bold flex justify-between items-center text-[13px] bg-zinc-50">{f.q}<span className="text-lg">{faqOpen===i?"−":"+"}</span></button>
                {faqOpen===i && <div className="px-4 py-3 text-[12px] text-zinc-600 bg-white leading-6">{f.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
