"use client";
import { useState } from "react";
const ALL_FIELDS = ["Full Name","Email","Mobile","Address","City","Pincode","Company","PAN","Aadhaar","UPI ID"] as const;

function genOne(fields:string[]){
  const first = ["Aarav","Vivaan","Aditya","Sai","Rahul","Ishaan"][Math.floor(Math.random()*6)];
  const last = ["Sharma","Verma","Singh","Patel","Kumar"][Math.floor(Math.random()*5)];
  const city = ["Delhi","Mumbai","Jaipur","Pune","Suratgarh","Bangalore"][Math.floor(Math.random()*6)];
  const o:any={};
  if(fields.includes("Full Name")) o["Full Name"]=`${first} ${last}`;
  if(fields.includes("Email")) o["Email"]=`${first.toLowerCase()}${Math.floor(Math.random()*900)}@gmail.com`;
  if(fields.includes("Mobile")) o["Mobile"]=`9${Math.floor(Math.random()*900000000+100000000)}`;
  if(fields.includes("Address")) o["Address"]=`${Math.floor(Math.random()*500)} MG Road`;
  if(fields.includes("City")) o["City"]=city;
  if(fields.includes("Pincode")) o["Pincode"]=`${Math.floor(Math.random()*900000+100000)}`;
  if(fields.includes("Company")) o["Company"]=`${last} Tech Pvt Ltd`;
  if(fields.includes("PAN")) o["PAN"]=`ABCDE${Math.floor(Math.random()*9000+1000)}F`;
  if(fields.includes("Aadhaar")) o["Aadhaar"]=`${Math.floor(Math.random()*9+1)}${Math.floor(Math.random()*100000000000).toString().padStart(11,'0')}`.slice(0,12);
  if(fields.includes("UPI ID")) o["UPI ID"]=`${first.toLowerCase()}@okhdfc`;
  return o;
}

export default function Page(){
  const [fields,setFields]=useState<string[]>(["Full Name","Email","Mobile"]);
  const [count,setCount]=useState(1);
  const [data,setData]=useState<any[]>([]);
  const [view,setView]=useState<"table"|"json"|"csv"|"txt"|"sql">("table");

  const toggle=(f:string)=>{ if(fields.includes(f)) setFields(fields.filter(x=>x!==f)); else if(fields.length<10) setFields([...fields,f]); }
  const generate=()=>{ setData(Array.from({length:count},()=>genOne(fields))); }

  const jsonStr = JSON.stringify(data,null,2);
  const csvStr = data.length? [Object.keys(data[0]).join(","),...data.map(r=>Object.values(r).map(v=>`"${v}"`).join(","))].join("\n") : "";
  const txtStr = data.map(r=>Object.entries(r).map(([k,v])=>`${k}: ${v}`).join(" | ")).join("\n");
  const sqlStr = data.length? `INSERT INTO users (${Object.keys(data[0]).join(", ")}) VALUES\n${data.map(r=>`(${Object.values(r).map(v=>`'${v}'`).join(", ")})`).join(",\n")};` : "";

  const getCurrentStr = ()=> view==="json"?jsonStr : view==="csv"?csvStr : view==="txt"?txtStr : view==="sql"?sqlStr : jsonStr;

  return (
    <div className="min-h-screen bg-[#fcfcfb]">
      <div className="max-w-[1100px] mx-auto px-4 py-6">
        <div className="bg-white rounded-[24px] border p-6 shadow-sm">
          <h3 className="font-bold">Fields ({fields.length}/10)</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
            {ALL_FIELDS.map(f=>{
              const a=fields.includes(f);
              return <button key={f} onClick={()=>toggle(f)} className={`h-12 rounded-full font-medium transition-all hover:scale-[1.03] ${a?"bg-black text-white":"bg-zinc-100"}`}>{f}</button>
            })}
          </div>
          <div className="mt-8"><label className="font-bold">Records: {count}</label><input type="range" min={1} max={100} value={count} onChange={e=>setCount(parseInt(e.target.value))} className="w-full mt-2 accent-black"/></div>
          <button onClick={generate} className="mt-6 w-full h-14 bg-black text-white rounded-full font-bold text-lg hover:bg-zinc-800 transition-all active:scale-[0.98]">Generate</button>
        </div>

        {data.length>0 && (
          <div className="mt-6 bg-white rounded-[24px] border p-5">
            <div className="flex flex-wrap gap-2">
              {(["table","json","csv","txt","sql"] as const).map(v=>(
                <button key={v} onClick={()=>setView(v)} className={`px-5 h-9 rounded-full text-sm font-bold uppercase ${view===v?"bg-black text-white":"bg-zinc-100"}`}>{v}</button>
              ))}
              <button onClick={()=>navigator.clipboard.writeText(getCurrentStr())} className="ml-auto px-5 h-9 rounded-full bg-zinc-900 text-white text-sm">Copy</button>
              <a href={`data:text/plain;charset=utf-8,${encodeURIComponent(getCurrentStr())}`} download={`fake-data.${view==="table"?"json":view}`} className="px-5 h-9 rounded-full bg-yellow-400 text-black text-sm font-bold flex items-center">Download</a>
            </div>
            <div className="mt-4 overflow-auto max-h-[400px] border rounded-xl">
              {view==="table"? <table className="w-full text-sm"><thead className="bg-zinc-50 sticky top-0"><tr>{Object.keys(data[0]).map(k=><th key={k} className="text-left p-3">{k}</th>)}</tr></thead><tbody>{data.map((r,i)=><tr key={i} className="border-t"><td colSpan={10}><div className="flex">{Object.values(r).map((v:any,j)=><div key={j} className="p-3 min-w-[150px]">{v}</div>)}</div></td></tr>)}</tbody></table> : <pre className="p-4 text-xs whitespace-pre-wrap">{getCurrentStr()}</pre>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
