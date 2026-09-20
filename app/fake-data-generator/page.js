"use client";
import React from "react";

export default function FakeDataGenerator(){
  const [count,setCount]=React.useState(10);
  const [lang,setLang]=React.useState("hi");
  const [data,setData]=React.useState([]);
  const [copied,setCopied]=React.useState(false);

  React.useEffect(()=>{
    document.title="Fake Data Generator - Advanced Multi Language Dummy Data";
  },[]);

  const names = {
    en: ["John Doe","Emma Smith","Michael Brown","Sophia Wilson"],
    hi: ["Rahul Sharma","Pooja Verma","Aman Yadav","Neha Singh"],
    es: ["Carlos Garcia","Maria Lopez"],
    fr: ["Jean Dupont","Marie Dubois"]
  };

  const generate = () => {
    let arr=[];
    for(let i=0;i<count;i++){
      arr.push({
        id: i+1,
        name: names[lang][Math.floor(Math.random()*names[lang].length)],
        email: `user${i+1}@test.com`,
        phone: `+91 ${Math.floor(9000000000+Math.random()*1000000000)}`,
        city: lang==="hi"?"Lucknow, India":"New York, USA"
      })
    }
    setData(arr);
  };

  React.useEffect(()=>{generate()},[]);

  return (
    <div style={{background:"#0a0a0a", minHeight:"100vh", padding:16, color:"white"}}>
      <div style={{maxWidth:500, margin:"0 auto", background:"#171717", borderRadius:24, padding:20, border:"1px solid #2a2a2a"}}>
        <h1 style={{fontSize:26, fontWeight:800}}>Fake Data Generator</h1>
        <p style={{opacity:0.6, fontSize:13, marginTop:4}}>Generate realistic dummy data - Multi Language + SEO Ready</p>

        <div style={{display:"flex", gap:10, marginTop:20}}>
          <select value={lang} onChange={e=>setLang(e.target.value)} style={{flex:1, padding:14, borderRadius:14, background:"#262626", color:"white", border:"1px solid #333"}}>
            <option value="hi">🇮🇳 Hindi</option>
            <option value="en">🇺🇸 English</option>
            <option value="es">🇪🇸 Spanish</option>
            <option value="fr">🇫🇷 French</option>
          </select>
          <select value={count} onChange={e=>setCount(e.target.value)} style={{width:90, padding:14, borderRadius:14, background:"#262626", color:"white", border:"1px solid #333"}}>
            <option value="10">10 Rows</option>
            <option value="25">25 Rows</option>
            <option value="50">50 Rows</option>
            <option value="100">100 Rows</option>
          </select>
        </div>

        <button onClick={generate} style={{width:"100%", marginTop:12, padding:14, borderRadius:14, background:"white", color:"black", fontWeight:700, border:"none"}}>✨ Generate Data</button>

        <pre style={{marginTop:16, background:"black", borderRadius:16, padding:16, maxHeight:400, overflow:"auto", color:"#4ade80", fontSize:12, border:"1px solid #222"}}>{JSON.stringify(data,null,2)}</pre>
      </div>
    </div>
  );
}
