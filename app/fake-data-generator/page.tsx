"use client";
import { useState, useEffect } from "react";

const ALL_FIELDS = ["Full Name","Email","Mobile","Address","City","Pincode","Company","PAN","Aadhaar","UPI ID"];
const LANGS = ["English","Hindi","Hinglish","Marathi","Tamil","Telugu","Bengali","Gujarati","Malayalam","Kannada","Punjabi","Marwari","Urdu","Bhojpuri","Odia","English (US)"];

const NAMES = {
  Hindi: ["Amit","Ravi","Sunil","Vikram","Anjali","Pooja"],
  Tamil: ["Arjun","Karthi","Surya","Priya","Lakshmi"],
  Telugu: ["Ravi","Pawan","Mahesh","Samantha","Anushka"],
  Marathi: ["Sahil","Omkar","Sneha","Madhuri"],
  Bengali: ["Arindam","Sourav","Riya","Mishti"],
  Gujarati: ["Hardik","Jigar","Kinjal","Dhara"],
  Malayalam: ["Mohanlal","Dulquer","Nayan","Manju"],
  Kannada: ["Yash","Darshan","Rashmika","Ramya"],
  Punjabi: ["Jassi","Harman","Simran","Gurpreet"],
  Marwari: ["Bhanwar","Ghewar","Kamla","Sunita"],
  Urdu: ["Imran","Faizan","Zoya","Ayesha"],
  Bhojpuri: ["Khesari","Pawan","Akshara","Amrapali"],
  Odia: ["Subham","Sambit","Sonal","Pragya"],
  English: ["Aarav","Vivaan","Rahul","Sai","Ananya"],
  "English (US)": ["John","Emma","Michael","Sophia"],
  Hinglish: ["Aarav","Rahul","Sai","Pooja"]
};

function genOne(fields, lang){
  const list = NAMES[lang] || NAMES["English"];
  const first = list[Math.floor(Math.random()*list.length)];
  const last = ["Sharma","Verma","Singh","Patel","Kumar","Mehta"][Math.floor(Math.random()*6)];
  const city = ["Delhi","Mumbai","Suratgarh","Jaipur","Pune","Kolkata"][Math.floor(Math.random()*6)];
  const o={};
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
  const [fields,setFields]=useState(["Full Name","Email","Mobile","City"]);
  const [lang,setLang]=useState("English");
  const [count,setCount]=useState(255);
  const [data,setData]=useState([]);
  const [view,setView]=useState("table");
  const [copyText,setCopyText]=useState("Copy");
  const [saveText,setSaveText]=useState("Save");
  const [showArticle,setShowArticle]=useState(false);
  const [faqOpen,setFaqOpen]=useState(0);
  const [menuOpen,setMenuOpen]=useState(false);

  const generate=()=> setData(Array.from({length:count},()=>genOne(fields,lang)));
  useEffect(()=>{ generate(); },[]);

  const jsonStr = JSON.stringify(data,null,2);
  const csvStr = data.length? [Object.keys(data[0]).join(","),...data.map(r=>Object.values(r).map(v=>`"${v}"`).join(","))].join("\n") : "";
  const txtStr = data.map(r=>Object.entries(r).map(([k,v])=>`${k}: ${v}`).join(" | ")).join("\n");
  const sqlStr = data.length? `INSERT INTO users (${Object.keys(data[0]).join(", ")}) VALUES\n${data.map(r=>`(${Object.values(r).map(v=>`'${v}'`).join(", ")})`).join(",\n")};` : "";
  const getStr = ()=> view==="json"?jsonStr : view==="csv"?csvStr : view==="txt"?txtStr : view==="sql"?sqlStr : jsonStr;

  const handleCopy=()=>{ navigator.clipboard.writeText(getStr()); setCopyText("Copied!"); setTimeout(()=>setCopyText("Copy"),2000); }
  const handleSave=()=>{ localStorage.setItem('saved-data',getStr()); setSaveText("Saved!"); setTimeout(()=>setSaveText("Save"),2000); }

  return (
    <div className="min-h-screen bg-[#f8f8f7] text-zinc-900">
      <header className="sticky top-0 z-50 bg-black text-white px-4 py-3 flex justify-between items-center">
        <h1 className="text-base font-black">⚡ Lorem Pro Tool</h1>
        <button className="bg-zinc-800 px-3 py-1 rounded-lg" onClick={()=>setMenuOpen(!menuOpen)}>☰</button>
        {menuOpen && <div className="absolute top-[48px] left-0 w-full bg-black p-4 flex flex-col gap-3 text-sm"><a href="/" className="py-2">Home</a><a href="/fake-data-generator" className="py-2 text-yellow-400 font-bold">Fake Data</a></div>}
      </header>
      <main className="max-w-[1100px] mx-auto px-3 py-4">
        <h1 className="text-[22px] font-black">Fake Data Generator - Indian Pro</h1>
        <div className="bg-white rounded-[20px] border p-4 mt-4">
          <label className="font-bold text-sm">🌐 Language (15 Languages)</label>
          <select value={lang} onChange={e=>setLang(e.target.value)} className="w-full mt-2 border rounded-full px-4 py-3 text-sm bg-zinc-50 font-bold">{LANGS.map(l=><option key={l} value={l}>{l}</option>)}</select>
          <h3 className="font-bold text-sm mt-5">Fields ({fields.length}/10)</h3>
          <div className="grid grid-cols-2 gap-2 mt-3">{ALL_FIELDS.map(f=>{const a=fields.includes(f); return <button key={f} onClick={()=>{ if(a) setFields(fields.filter(x=>x!==f)); else if(fields.length<10) setFields([...fields,f]); }} className={`h-12 rounded-full text-[13px] ${a?"bg-black text-white":"bg-zinc-100"}`}>{f}</button>})}</div>
          <div className="mt-5"><label className="font-bold text-sm">Records: {count}</label><input type="range" min={1} max={1000} value={count} onChange={e=>setCount(parseInt(e.target.value))} className="w-full mt-2 accent-black" /></div>
          <button onClick={generate} className="mt-5 w-full h-14 bg-black text-white rounded-full font-black">⚡ Generate {count} in {lang}</button>
        </div>
        {data.length>0 && <div className="mt-4 bg-white rounded-[20px] border p-3"><div className="flex gap-2 overflow-auto">{["table","json","csv","txt","sql"].map(v=><button key={v} onClick={()=>setView(v)} className={`px-4 h-9 rounded-full text-xs font-black uppercase ${view===v?"bg-black text-white":"bg-zinc-100"}`}>{v}</button>)}</div><div className="flex gap-2 mt-3"><button onClick={handleSave} className={`flex-1 h-10 rounded-full text-sm font-bold ${saveText.includes("Saved")?"bg-green-500 text-white":"bg-zinc-100"}`}>{saveText}</button><button onClick={handleCopy} className={`flex-1 h-10 rounded-full text-sm font-bold ${copyText.includes("Copied")?"bg-green-500 text-white":"bg-black text-white"}`}>{copyText}</button><a href={`data:text/plain;charset=utf-8,${encodeURIComponent(getStr())}`} download={`fake.${view==="table"?"json":view}`} className="flex-1 h-10 rounded-full bg-yellow-400 text-black text-sm font-black flex items-center justify-center">Download</a></div><div className="mt-3 border rounded-xl overflow-auto max-h-[400px]">{view==="table"?<table className="w-full text-[13px]"><thead className="bg-zinc-50 sticky top-0"><tr>{Object.keys(data[0]||{}).map(k=><th key={k} className="text-left p-3 border-b">{k}</th>)}</tr></thead><tbody>{data.map((r,i)=><tr key={i} className="border-t"><td colSpan={10}><div className="flex">{Object.values(r).map((v,j)=><div key={j} className="p-3 min-w-[120px]">{v}</div>)}</div></td></tr>)}</tbody></table>:<pre className="p-3 text-xs whitespace-pre-wrap bg-zinc-50">{getStr()}</pre>}</div></div>}
        <div className="mt-4 bg-white rounded-[20px] border"><button onClick={()=>setShowArticle(!showArticle)} className="w-full p-4 flex justify-between font-black text-left">📘 What is Fake Data? <span>{showArticle?"−":"+"}</span></button>{showArticle && <div className="px-4 pb-4 text-sm text-zinc-600">Fake Data Generator free tool for developers. 15 languages support. Export JSON CSV TXT SQL. 100% safe.</div>}</div>
        <div className="mt-4 bg-white rounded-[20px] border p-4"><h3 className="font-black">FAQ</h3><div className="mt-3 space-y-2">{[{q:"Is data real?",a:"No, 100% fake."},{q:"15 languages?",a:"Select language and Generate."},{q:"SQL download?",a:"SQL tab > Download."}].map((f,i)=><div key={i} className="border rounded-xl overflow-hidden"><button onClick={()=>setFaqOpen(faqOpen===i?null:i)} className="w-full text-left p-3 font-bold flex justify-between text-sm bg-zinc-50">{f.q}<span>{faqOpen===i?"−":"+"}</span></button>{faqOpen===i && <div className="px-3 py-2 text-xs bg-white">{f.a}</div>}</div>)}</div></div>
      </main>
    </div>
  )
}
