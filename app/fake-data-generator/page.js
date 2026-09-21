"use client";
import { useState, useEffect } from "react";

const ALL_FIELDS = ["Full Name","Email","Mobile","Address","City","Pincode","Company","PAN","Aadhaar","UPI ID"] as const;
const LANGS = ["English","Hindi","Hinglish","Marwari","Punjabi"];

function genOne(fields:string[], lang:string){
  const enFirst = ["Aarav","Vivaan","Rahul","Sai","Arjun"];
  const hiFirst = ["Amit","Ravi","Sunil","Vikram","Deepak"];
  const first = lang==="Hindi"? hiFirst[Math.floor(Math.random()*hiFirst.length)] : enFirst[Math.floor(Math.random()*enFirst.length)];
  const last = ["Sharma","Verma","Singh","Patel"][Math.floor(Math.random()*4)];
  const city = ["Delhi","Mumbai","Suratgarh","Jaipur","Pune"][Math.floor(Math.random()*5)];
  const o:any={};
  if(fields.includes("Full Name")) o["Full Name"]= lang==="Hindi"? `${first} ${last} (हिंदी)` : `${first} ${last}`;
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
  const [count,setCount]=useState(10);
  const [data,setData]=useState<any[]>([]);
  const [view,setView]=useState<"table"|"json"|"csv"|"txt"|"sql">("table");
  const [faqOpen,setFaqOpen]=useState<number|null>(0);

  const generate=()=> setData(Array.from({length:count},()=>genOne(fields,lang)));

  useEffect(()=>{ generate(); },[]);

  const jsonStr = JSON.stringify(data,null,2);
  const csvStr = data.length? [Object.keys(data[0]).join(","),...data.map(r=>Object.values(r).map(v=>`"${v}"`).join(","))].join("\n") : "";
  const txtStr = data.map(r=>Object.entries(r).map(([k,v])=>`${k}: ${v}`).join(" | ")).join("\n");
  const sqlStr = data.length? `INSERT INTO users (${Object.keys(data[0]).join(", ")}) VALUES\n${data.map(r=>`(${Object.values(r).map(v=>`'${v}'`).join(", ")})`).join(",\n")};` : "";
  const getStr = ()=> view==="json"?jsonStr : view==="csv"?csvStr : view==="txt"?txtStr : view==="sql"?sqlStr : jsonStr;

  const share = async ()=>{
    if(navigator.share){ await navigator.share({title:"Fake Data", text:getStr()}); }
    else { navigator.clipboard.writeText(getStr()); alert("Copied for sharing!"); }
  }

  return (
    <div className="min-h-screen bg-[#f8f8f7] text-zinc-900">
      <main className="max-w-[1100px] mx-auto px-4 py-6">
        <h1 className="text-3xl md:text-4xl font-black">Fake Data Generator - Indian Pro Tool</h1>
        <p className="text-zinc-500 mt-2 max-w-2xl">Generate realistic Indian fake data with PAN, Aadhaar, UPI for testing. Free for developers, no login. Export in 4 formats.</p>

        <div className="grid md:grid-cols-[1fr_320px] gap-6 mt-6">
          {/* Left */}
          <div className="space-y-6">
            <div className="bg-white rounded-[24px] border p-6">
              <div className="flex justify-between items-center"><h3 className="font-bold">Select Fields ({fields.length}/10)</h3><select value={lang} onChange={e=>setLang(e.target.value)} className="border rounded-full px-3 py-1 text-sm">{LANGS.map(l=><option key={l}>{l}</option>)}</select></div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
                {ALL_FIELDS.map(f=>{
                  const a=fields.includes(f);
                  return <button key={f} onClick={()=>{ if(a) setFields(fields.filter(x=>x!==f)); else if(fields.length<10) setFields([...fields,f]); }} className={`h-12 rounded-full font-medium text-sm transition-all hover:scale-[1.02] ${a?"bg-black text-white shadow":"bg-zinc-100"}`}>{f}</button>
                })}
              </div>
              <div className="mt-6"><label className="font-bold">Records: {count} (Max 1000)</label><input type="range" min={1} max={1000} value={count} onChange={e=>setCount(parseInt(e.target.value))} className="w-full mt-2 accent-black h-2" /><div className="flex justify-between text-xs text-zinc-400"><span>1</span><span>1000</span></div></div>
              <button onClick={generate} className="mt-6 w-full h-14 bg-black text-white rounded-full font-black text-lg hover:bg-zinc-800 active:scale-[0.98] transition">⚡ Generate {count} Records</button>
            </div>

            {data.length>0 && (
              <div className="bg-white rounded-[24px] border p-5">
                <div className="flex flex-wrap gap-2 items-center">
                  {(["table","json","csv","txt","sql"] as const).map(v=>(
                    <button key={v} onClick={()=>setView(v)} className={`px-4 h-9 rounded-full text-xs font-black uppercase ${view===v?"bg-black text-white":"bg-zinc-100"}`}>{v}</button>
                  ))}
                  <div className="flex gap-2 ml-auto">
                    <button onClick={()=>{localStorage.setItem('saved-data',getStr()); alert('Saved!');}} className="px-4 h-9 rounded-full bg-zinc-100 text-sm font-bold">💾 Save</button>
                    <button onClick={share} className="px-4 h-9 rounded-full bg-zinc-100 text-sm font-bold">🔗 Share</button>
                    <button onClick={()=>navigator.clipboard.writeText(getStr())} className="px-4 h-9 rounded-full bg-black text-white text-sm font-bold">Copy</button>
                    <a href={`data:text/plain;charset=utf-8,${encodeURIComponent(getStr())}`} download={`fake-data.${view==="table"?"json":view}`} className="px-4 h-9 rounded-full bg-yellow-400 text-black text-sm font-black flex items-center">Download</a>
                  </div>
                </div>
                <div className="mt-4 border rounded-xl overflow-auto max-h-[420px] bg-zinc-50">
                  {view==="table"? <table className="w-full text-sm bg-white"><thead className="bg-zinc-50 sticky top-0"><tr>{Object.keys(data[0]).map(k=><th key={k} className="text-left p-3 font-bold border-b">{k}</th>)}</tr></thead><tbody>{data.map((r,i)=><tr key={i} className="border-t hover:bg-zinc-50"><td colSpan={10}><div className="flex">{Object.values(r).map((v:any,j)=><div key={j} className="p-3 min-w-[150px] truncate">{v as string}</div>)}</div></td></tr>)}</tbody></table> : <pre className="p-4 text-xs whitespace-pre-wrap">{getStr()}</pre>}
                </div>
              </div>
            )}

            {/* SEO Article - AdSense Compatible */}
            <article className="bg-white rounded-[24px] border p-6 md:p-8 prose prose-zinc max-w-none">
              <h2 className="text-2xl font-black">What is Fake Data Generator? Complete Guide 2026</h2>
              <p className="text-zinc-600 mt-3">Fake Data Generator is a free tool for developers, testers and designers to generate realistic but fake data like Name, Email, Mobile, PAN, Aadhaar, UPI ID. This data is 100% safe for testing your app, website or database.</p>
              <h3 className="font-bold text-lg mt-6">Why Developers Use It?</h3>
              <ul className="list-disc pl-5 mt-2 text-zinc-600 space-y-1"><li>Test apps without using real user data</li><li>Fill databases quickly with 1000 records</li><li>Supports Indian formats - PAN, Aadhaar, UPI, Pincode</li><li>Export in JSON, CSV, TXT, SQL</li></ul>
              <h3 className="font-bold text-lg mt-6">Features of Lorem Pro Fake Data Tool</h3>
              <p className="text-zinc-600 mt-2">Multi-language support (English, Hindi, Hinglish), Save locally, Share with team, One-click copy, Ad-free experience. This tool is part of Lorem Pro Tool hub which also has Lorem Ipsum 77 languages generator.</p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mt-6 text-sm"><b>AdSense Note:</b> This tool generates dummy data only. No real personal data is stored or collected. 100% safe and compliant.</div>
            </article>

            {/* FAQ */}
            <div className="bg-white rounded-[24px] border p-6">
              <h3 className="text-xl font-black">FAQ - Fake Data Generator</h3>
              <div className="mt-4 space-y-3">
                {[
                  {q:"Is this data real?",a:"No, all data is 100% fake and randomly generated. You can safely use it for testing."},
                  {q:"Can I generate 1000 records?",a:"Yes, use the slider up to 1000 and export as CSV or SQL for bulk import."},
                  {q:"Is PAN/Aadhaar valid?",a:"They follow format only, not real government verified numbers. Only for UI testing."},
                  {q:"Is it free for commercial use?",a:"Yes, 100% free forever. No login required."},
                ].map((f,i)=>(
                  <div key={i} className="border rounded-xl">
                    <button onClick={()=>setFaqOpen(faqOpen===i?null:i)} className="w-full text-left p-4 font-bold flex justify-between">{f.q}<span>{faqOpen===i?"−":"+"}</span></button>
                    {faqOpen===i && <div className="px-4 pb-4 text-sm text-zinc-600">{f.a}</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Ad Sidebar */}
          <div className="space-y-6">
            <div className="bg-zinc-900 text-white rounded-[24px] p-6">
              <h4 className="font-black">Why Lorem Pro Tool?</h4>
              <ul className="mt-3 text-sm text-zinc-400 space-y-2 list-disc pl-5"><li>No Ads Disturbance</li><li>Fast & SEO Friendly</li><li>Indian Data Support</li><li>Made for Developers</li></ul>
            </div>
            <div className="bg-white border rounded-[24px] p-6 text-center">
              <p className="text-xs text-zinc-400 uppercase tracking-widest">Advertisement</p>
              <div className="h-[250px] bg-zinc-50 rounded-xl mt-3 flex items-center justify-center text-zinc-400 text-sm">AdSense Ad Unit<br/>300x250</div>
            </div>
            <div className="bg-white border rounded-[24px] p-6">
              <h4 className="font-bold">Other Tools</h4>
              <div className="mt-3 space-y-2 text-sm"><div className="p-3 bg-zinc-50 rounded-xl">📝 Lorem Ipsum 77 Languages</div><div className="p-3 bg-zinc-50 rounded-xl">👤 Fake Data Generator (You are here)</div></div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
