"use client";
import React from "react";

export default function FakeClient(){
  const [count,setCount]=React.useState(10);
  const [lang,setLang]=React.useState("hi");
  const [data,setData]=React.useState([]);

  React.useEffect(()=>{ generate() },[]);

  const names = {
    en: ["John Doe","Emma Smith","Michael Brown"],
    hi: ["Rahul Sharma","Pooja Verma","Aman Yadav","Neha Singh"],
    es: ["Carlos Garcia","Maria Lopez"],
    fr: ["Jean Dupont","Marie Dubois"]
  };

  const generate = () => {
    let arr=[]; for(let i=0;i<count;i++){
      arr.push({id:i+1, name:names[lang][Math.floor(Math.random()*names[lang].length)], email:`user${i+1}@test.com`, phone:`+91 9${Math.floor(100000000+Math.random()*900000000)}`})
    } setData(arr);
  };

  return (
    <div style={{background:"#0a0a0a", minHeight:"100vh", padding:16, color:"white"}}>
      <div style={{maxWidth:500, margin:"0 auto", background:"#171717", borderRadius:24, padding:20}}>
        <h1 style={{fontSize:24, fontWeight:800}}>Fake Data Generator - Free Dummy Data</h1>
        <p style={{opacity:0.6, fontSize:13}}>Generate realistic fake data in Hindi & English - Best for testing</p>
        <div style={{display:"flex", gap:10, marginTop:20}}>
          <select value={lang} onChange={e=>setLang(e.target.value)} style={{flex:1, padding:14, borderRadius:14, background:"#262626", color:"white"}}><option value="hi">🇮🇳 Hindi</option><option value="en">🇺🇸 English</option></select>
          <select value={count} onChange={e=>setCount(e.target.value)} style={{width:90, padding:14, borderRadius:14, background:"#262626", color:"white"}}><option value="10">10</option><option value="50">50</option><option value="100">100</option></select>
        </div>
        <button onClick={generate} style={{width:"100%", marginTop:12, padding:14, borderRadius:14, background:"white", color:"black", fontWeight:700}}>Generate Data</button>
        <pre style={{marginTop:16, background:"black", borderRadius:16, padding:16, color:"#4ade80", fontSize:12}}>{JSON.stringify(data,null,2)}</pre>
      </div>
    </div>
  );
}
