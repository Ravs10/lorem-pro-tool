"use client";
import { useState, useEffect } from "react";

const ALL_FIELDS = ["Full Name","Email","Mobile","Address","City","Pincode","Company","PAN","Aadhaar","UPI ID"] as const;
const LANGS = ["English","Hindi","Hinglish","Marathi","Tamil","Telugu","Bengali","Gujarati","Malayalam","Kannada","Punjabi","Marwari","Urdu","Bhojpuri","Odia","English (US)"];

const NAMES:any = {
  Hindi: ["Amit","Ravi","Sunil","Vikram","Anjali","Pooja","Deepak"],
  Tamil: ["Arjun","Karthi","Surya","Priya","Lakshmi","Vijay"],
  Telugu: ["Ravi","Pawan","Mahesh","Samantha","Anushka","Allu"],
  Marathi: ["Sahil","Omkar","Sneha","Madhuri","Sachin"],
  Bengali: ["Arindam","Sourav","Riya","Mishti","Jeet"],
  Gujarati: ["Hardik","Jigar","Kinjal","Dhara","Ketan"],
  Malayalam: ["Mohanlal","Dulquer","Nayan","Manju","Prithvi"],
  Kannada: ["Yash","Darshan","Rashmika","Ramya","Sudeep"],
  Punjabi: ["Jassi","Harman","Simran","Gurpreet","Diljit"],
  Marwari: ["Bhanwar","Ghewar","Kamla","Sunita","Mohan"],
  Urdu: ["Imran","Faizan","Zoya","Ayesha","Salman"],
  Bhojpuri: ["Khesari","Pawan","Akshara","Amrapali","Ravi"],
  Odia: ["Subham","Sambit","Sonal","Pragya","Anubhav"],
  English: ["Aarav","Vivaan","Rahul","Sai","Ananya","Ishaan"],
  "English (US)": ["John","Emma","Michael","Sophia","David"],
  Hinglish: ["Aarav","Rahul","Sai","Pooja","Riya"]
};

function genOne(fields:string[], lang:string){
  const list = NAMES[lang] || NAMES["English"];
  const first = list[Math.floor(Math.random()*list.length)];
  const last = ["Sharma","Verma","Singh","Patel","Kumar","Mehta","Gupta"][Math.floor(Math.random()*7)];
  const city = ["Delhi","Mumbai","Suratgarh","Jaipur","Pune","Kolkata","Chennai"][Math.floor(Math.random()*7)];
  const o:any={};
  if(fields.includes("Full Name")) o["Full Name"]=`${first} ${last}`;
  if(fields.includes("Email")) o["Email"]=`${first.toLowerCase()}${Math.floor(Math.random()*900)}@gmail.com`;
  if(fields.includes("Mobile")) o["Mobile"]=`9${Math.floor(Math.random()*900000000+100000000)}`;
  if(fields.includes("Address")) o["Address"]=`${Math.floor(Math.random()*500)} MG Road, ${city}`;
  if(fields.includes("City")) o["City"]=city;
  if(fields.includes("Pincode")) o["Pincode"]=`${Math.floor(Math.random()*900000+100000)}`;
  if(fields.includes("Company")) o["Company"]=`${last} Tech Pvt Ltd`;
  if(fields.includes("PAN")) o["PAN"]=`ABCDE${Math.floor(Math.random()*9000+1000)}F`;
  if(fields.includes("Aadhaar")) o["Aadhaar"]=`${Math.floor(Math.random()*900000000000+100000000000)}`.toString().slice(0,12);
  if(fields.includes("UPI ID")) o["UPI ID"]=`${first.toLowerCase()}@okhdfc`;
  return o;
}

export default function Page(){
  const [fields,setFields]=useState<string[]>(["Full Name","Email","Mobile","City"]);
  const [lang,setLang]=useState("English");
  const [count,setCount]=useState(255);
  const [data,setData]=useState<any[]>([]);
  const [view,setView]=useState<"table"|"json"|"csv"|"txt"|"sql">("table");
  const [copyText,setCopyText]=useState("Copy");
  const [saveText,setSaveText]=useState("💾 Save");
  const [showArticle,setShowArticle]=useState(false);
  const [faqOpen,setFaqOpen]=useState<number|null>(0);
  const [menuOpen,setMenuOpen]=useState(false);

  const generate=()=> setData(Array.from({length:count},()=>genOne(fields,lang)));
  useEffect(()=>{ generate(); },[]);

  const jsonStr = JSON.stringify(data,null,2);
  const csvStr = data.length? [Object.keys(data[0]).join(","),...data.map(r=>Object.values(r).map(v=>`"${v}"`).join(","))].join("\n") : "";
  const txtStr = data.map(r=>Object.entries(r).map(([k,v])=>`${k}: ${v}`).join(" | ")).join("\n");
  const sqlStr = data.length? `INSERT INTO users (${Object.keys(data[0]).join(", ")}) VALUES\n${data.map(r=>`(${Object.values(r).map(v=>`'${v}'`).join(", ")})`).join(",\n")};` : "";
  const getStr = ()=> view==="json"?jsonStr : view==="csv"?csvStr : view==="txt"?txtStr : view==="sql"?sqlStr : jsonStr;

  const handleCopy=()=>{
    navigator.clipboard.writeText(getStr());
    setCopyText("✓ Copied!");
    setTimeout(()=>setCopyText("Copy"),2000);
  }
  const handleSave=()=>{
    localStorage.setItem('saved-data',getStr());
    setSaveText("✓ Saved!");
    setTimeout(()=>setSaveText("💾 Save"),2000);
  }

  return (
    <div className="min-h-screen bg-[#f8f8f7] text-zinc-900">
      <header className="sticky top-0 z-50 bg-black text-white px-4 py-3 flex justify-between items-center">
        <h1 className="text-base font-black">⚡ Lorem Pro Tool</h1>
        <button className="bg-zinc-800 px-3 py-1 rounded-lg" onClick={()=>setMenuOpen(!menuOpen)}>☰</button>
        {menuOpen && (
          <div className="absolute top-[48px] left-0 w-full bg-black p-4 flex flex-col gap-3 text-sm">
            <a href="/" className="py-2 border-b border-zinc-800">Home</a>
            <a href="/fake-data-generator" className="py-2 border-b border-zinc-800 text-yellow-400 font-bold">Fake Data Generator</a>
            <a href="/tools" className="py-2">All Tools</a>
          </div>
        )}
      </header>

      <main className="max-w-[1100px] mx-auto px-3 py-4">
        <h1 className="text-[24px] font-black leading-tight">Fake Data Generator - Indian Pro Tool</h1>
        <p className="text-zinc-500 text-sm mt-1">Generate realistic data in 15 languages. 1000 Records. 4 Formats.</p>

        <div className="bg-white rounded-[20px] border p-4 mt-4">
          <label className="font-bold text-sm">🌐 Select Language (15 Languages)</label>
          <select value={lang} onChange={e=>setLang(e.target.value)} className="w-full mt-2 border rounded-full px-4 py-3 text-sm bg-zinc-50 font-bold">
            {LANGS.map(l=><option key={l} value={l}>{l} - {NAMES[l]?.[0] || "Test"}</option>)}
          </select>

          <h3 className="font-bold text-sm mt-5">Select Fields ({fields.length}/10)</h3>
          <div className="grid grid-cols-2 gap-2 mt-3">
            {ALL_FIELDS.map(f=>{
              const a=fields.includes(f);
              return <button key={f} onClick={()=>{ if(a) setFields(fields.filter(x=>x!==f)); else if(fields.length<10) setFields([...fields,f]); }} className={`h-12 rounded-full font-medium text-[14px] transition-all ${a?"bg-black text-white":"bg-zinc-100"}`}>{f}</button>
            })}
          </div>

          <div className="mt-5"><label className="font-bold text-sm">Records: {count} (Max 1000)</label><input type="range" min={1} max={1000} value={count} onChange={e=>setCount(parseInt(e.target.value))} className="w-full mt-2 accent-black h-2" /></div>
          <button onClick={generate} className="mt-5 w-full h-14 bg-black text-white rounded-full font-black text-[16px]">⚡ Generate {count} in {lang}</button>
        </div>

        {data.length>0 && (
          <div className="mt-4 bg-white rounded-[20px] border p-3">
            <div className="flex gap-2 overflow-auto pb-2">
              {(["table","json","csv","txt","sql"] as const).map(v=>(
                <button key={v} onClick={()=>setView(v)} className={`px-4 h-9 rounded-full text-xs font-black uppercase whitespace-nowrap ${view===v?"bg-black text-white":"bg-zinc-100"}`}>{v}</button>
              ))}
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={handleSave} className={`flex-1 h-10 rounded-full text-sm font-bold transition-colors ${saveText.includes("Saved")?"bg-green-500 text-white":"bg-zinc-100"}`}>{saveText}</button>
              <button onClick={handleCopy} className={`flex-1 h-10 rounded-full text-sm font-bold transition-colors ${copyText.includes("Copied")?"bg-green-500 text-white":"bg-black text-white"}`}>{copyText}</button>
              <a href={`data:text/plain;charset=utf-8,[STRIPPED] download={`fake-data.${view==="table"?"json":view}`} className="flex-1 h-10 rounded-full bg-yellow-400 text-black text-sm font-black flex items-center justify-center">Download</a>
            </div>
            <div className="mt-3 border rounded-xl overflow-auto max-h-[400px] bg-white">
              {view==="table"? <table className="w-full text-[13px]"><thead className="bg-zinc-50 sticky top-0"><tr>{Object.keys(data[0]).map(k=><th key={k} className="text-left p-3 font-bold border-b">{k}</th>)}</tr></thead><tbody>{data.map((r,i)=><tr key={i} className="border-t"><td colSpan={10}><div className="flex">{Object.values(r).map((v:any,j)=><div key={j} className="p-3 min-w-[120px] truncate">{v as string}</div>)}</div></td></tr>)}</tbody></table> : <pre className="p-3 text-xs whitespace-pre-wrap bg-zinc-50">{getStr()}</pre>}
            </div>
          </div>
        )}

        <div className="mt-4 bg-white rounded-[20px] border">
          <button onClick={()=>setShowArticle(!showArticle)} className="w-full p-4 flex justify-between items-center font-black text-left">📘 What is Fake Data? Guide <span>{showArticle?"−":"+"}</span></button>
          {showArticle && <div className="px-4 pb-4 text-sm text-zinc-600 leading-6">Fake Data Generator is a free tool for developers to generate fake but realistic data like Name, Email, Mobile, PAN, Aadhaar. Now supports 15 Indian languages including Hindi, Marathi, Tamil, Telugu, Bengali, Gujarati etc. Export in JSON, CSV, TXT, SQL. 100% safe for testing. No real data used.</div>}
        </div>

        <div className="mt-4 bg-white rounded-[20px] border p-4">
          <h3 className="font-black">FAQ</h3>
          <div className="mt-3 space-y-2">
            {[
              {q:"Is this data real?",a:"No, 100% fake random data."},
              {q:"How 15 languages work?",a:"Select language, Generate click karo. Names change ho jayenge."},
              {q:"SQL download?",a:"SQL tab select karke Download dabao."},
            ].map((f,i)=>(
              <div key={i} className="border rounded-xl overflow-hidden">
                <button onClick={()=>setFaqOpen(faqOpen===i?null:i)} className="w-full text-left p-3 font-bold flex justify-between text-sm bg-zinc-50">{f.q}<span>{faqOpen===i?"−":"+"}</span></button>
                {faqOpen===i && <div className="px-3 py-2 text-xs text-zinc-600 bg-white">{f.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
