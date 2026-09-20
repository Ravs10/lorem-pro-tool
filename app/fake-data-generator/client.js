
"use client";
import React from "react";

export default function FakeClient(){
  const [count,setCount]=React.useState(10);
  const [lang,setLang]=React.useState("hi");
  const [format,setFormat]=React.useState("json");
  const [data,setData]=React.useState([]);
  const [saved,setSaved]=React.useState(false);

  const namesDB = {
    hi: ["Aarav Sharma","Vivaan Gupta","Aditya Yadav","Sai Patel","Pooja Verma","Neha Singh","Ananya Mishra","Kavya Dubey","Rahul Kumar","Aman Tiwari","Suresh Chaurasia","Priya Pandey"],
    en: ["John Doe","Emma Smith","Michael Brown","Sophia Wilson","James Johnson","Olivia Davis"],
    es: ["Carlos Garcia","Maria Lopez","Juan Perez","Sofia Martinez"],
    fr: ["Jean Dupont","Marie Dubois","Pierre Martin"],
    de: ["Hans Mueller","Greta Schmidt"],
    ja: ["Hiroshi Tanaka","Yuki Sato"],
    bn: ["Arjun Das","Mamata Banerjee","Rahul Chatterjee"],
    ta: ["Kumar Murugan","Lakshmi Priya"]
  };

  const citiesDB = {
    hi: ["Lucknow","Delhi","Mumbai","Pune","Patna","Kanpur","Varanasi"],
    en: ["New York","London","Sydney"],
    es: ["Madrid","Barcelona"],
    fr: ["Paris","Lyon"],
    de: ["Berlin"],
    ja: ["Tokyo","Osaka"],
    bn: ["Kolkata","Dhaka"],
    ta: ["Chennai","Coimbatore"]
  };

  const generate = () => {
    let arr=[];
    let nList = namesDB[lang] || namesDB["en"];
    let cList = citiesDB[lang] || citiesDB["en"];
    for(let i=0;i<count;i++){
      let n = nList[Math.floor(Math.random()*nList.length)];
      let c = cList[Math.floor(Math.random()*cList.length)];
      arr.push({
        id: i+1,
        name: n,
        email: `${n.toLowerCase().replace(" ","")}${i+1}@example.com`,
        phone: `+91 9${Math.floor(100000000 + Math.random()*900000000)}`,
        city: c,
        address: `${c}, India - ${Math.floor(100000+Math.random()*900000)}`
      })
    }
    setData(arr);
  };

  React.useEffect(()=>{ generate(); },[lang]);

  // Downloads
  const download = (type) => {
    if(data.length===0) return alert("Pehle Generate karo!");
    let content="", mime="", ext="";
    if(type==="json"){ content=JSON.stringify(data,null,2); mime="application/json"; ext="json"; }
    if(type==="csv"){
      content="id,name,email,phone,city\n"+data.map(d=>`${d.id},"${d.name}","${d.email}","${d.phone}","${d.city}"`).join("\n");
      mime="text/csv"; ext="csv";
    }
    if(type==="sql"){
      content=data.map(d=>`INSERT INTO users (name,email,phone,city) VALUES ('${d.name}','${d.email}','${d.phone}','${d.city}');`).join("\n");
      mime="text/sql"; ext="sql";
    }
    if(type==="txt"){
      content=data.map(d=>`${d.name} - ${d.email} - ${d.phone}`).join("\n");
      mime="text/plain"; ext="txt";
    }
    const blob=new Blob([content],{type:mime});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a"); a.href=url; a.download=`fake-data-${lang}.${ext}`; a.click();
  };

  const clearAll = () => setData([]);
  const saveData = () => { localStorage.setItem("fakeData",JSON.stringify(data)); setSaved(true); setTimeout(()=>setSaved(false),2000); };
  const shareData = async () => {
    if(navigator.share){ await navigator.share({title:"Fake Data", text: JSON.stringify(data.slice(0,3)) }); }
    else { navigator.clipboard.writeText(window.location.href); alert("Link Copied!"); }
  };

  return (
    <div style={{background:"#0a0a0a", minHeight:"100vh", color:"white", padding:16}}>
      <div style={{maxWidth:650, margin:"0 auto"}}>
        {/* TOOL CARD */}
        <div style={{background:"#171717", borderRadius:24, padding:20, border:"1px solid #2a2a2a"}}>
          <h1 style={{fontSize:26, fontWeight:800}}>Fake Data Generator</h1>
          <p style={{opacity:0.6, fontSize:13}}>Free tool to generate test data in 8+ languages with download options</p>

          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginTop:20}}>
            <select value={lang} onChange={e=>setLang(e.target.value)} style={{padding:14, borderRadius:14, background:"#262626", color:"white", border:"1px solid #333"}}>
              <option value="hi">🇮🇳 Hindi (हिंदी)</option>
              <option value="en">🇺🇸 English</option>
              <option value="es">🇪🇸 Spanish</option>
              <option value="fr">🇫🇷 French</option>
              <option value="de">🇩🇪 German</option>
              <option value="ja">🇯🇵 Japanese</option>
              <option value="bn">🇮🇳 Bengali</option>
              <option value="ta">🇮🇳 Tamil</option>
            </select>
            <select value={count} onChange={e=>setCount(Number(e.target.value))} style={{padding:14, borderRadius:14, background:"#262626", color:"white", border:"1px solid #333"}}>
              <option value="10">10 Rows</option><option value="25">25 Rows</option><option value="50">50 Rows</option><option value="100">100 Rows</option>
            </select>
          </div>

          <div style={{display:"flex", gap:8, marginTop:12, flexWrap:"wrap"}}>
            <button onClick={generate} style={{flex:1, padding:14, borderRadius:14, background:"white", color:"black", fontWeight:700, border:"none"}}>✨ Generate</button>
            <button onClick={clearAll} style={{padding:14, borderRadius:14, background:"#262626", color:"white", border:"1px solid #333"}}>🗑️ Clear</button>
          </div>

          <div style={{display:"flex", gap:8, marginTop:12, flexWrap:"wrap"}}>
            <button onClick={()=>download("json")} style={{flex:1, padding:10, borderRadius:10, background:"#1f2937", color:"white", border:"1px solid #333", fontSize:12}}>⬇️ JSON</button>
            <button onClick={()=>download("csv")} style={{flex:1, padding:10, borderRadius:10, background:"#1f2937", color:"white", border:"1px solid #333", fontSize:12}}>⬇️ CSV</button>
            <button onClick={()=>download("sql")} style={{flex:1, padding:10, borderRadius:10, background:"#1f2937", color:"white", border:"1px solid #333", fontSize:12}}>⬇️ SQL</button>
            <button onClick={()=>download("txt")} style={{flex:1, padding:10, borderRadius:10, background:"#1f2937", color:"white", border:"1px solid #333", fontSize:12}}>⬇️ TXT</button>
          </div>

          <div style={{display:"flex", gap:8, marginTop:10}}>
            <button onClick={saveData} style={{flex:1, padding:10, borderRadius:10, background:"#262626", color:"white", border:"1px solid #333"}}>{saved?"✅ Saved":"💾 Save"}</button>
            <button onClick={shareData} style={{flex:1, padding:10, borderRadius:10, background:"#262626", color:"white", border:"1px solid #333"}}>📤 Share</button>
            <button onClick={()=>navigator.clipboard.writeText(JSON.stringify(data,null,2))} style={{flex:1, padding:10, borderRadius:10, background:"#262626", color:"white", border:"1px solid #333"}}>📋 Copy</button>
          </div>

          <pre style={{marginTop:16, background:"black", borderRadius:16, padding:16, maxHeight:300, overflow:"auto", color:"#4ade80", fontSize:11, border:"1px solid #222"}}>{data.length?JSON.stringify(data,null,2):"Click Generate..."}</pre>
        </div>

        {/* ADSENSE ARTICLE SECTION */}
        <div style={{marginTop:32, background:"#171717", borderRadius:20, padding:20, border:"1px solid #222", lineHeight:1.6}}>
          <h2 style={{fontSize:20, fontWeight:700}}>What is Fake Data Generator?</h2>
          <p style={{opacity:0.8, fontSize:14, marginTop:10}}>Fake Data Generator is a free online tool for developers, testers and students. It helps you create realistic dummy data like names, emails, phone numbers, cities and addresses in multiple Indian and international languages. This data is 100% fake and safe to use for testing your apps, websites and databases.</p>

          <h3 style={{marginTop:20, fontWeight:700}}>Features of Our Tool</h3>
          <ul style={{opacity:0.8, fontSize:14, marginTop:8}}>
            <li>✅ Supports 8+ Languages - Hindi, English, Bengali, Tamil etc.</li>
            <li>✅ Export in JSON, CSV, SQL, TXT formats</li>
            <li>✅ 100% Free, No Login Required</li>
            <li>✅ Save, Copy & Share Feature</li>
            <li>✅ Mobile Friendly & Fast</li>
          </ul>

          <h3 style={{marginTop:20, fontWeight:700}}>Frequently Asked Questions (FAQ)</h3>
          <p style={{fontSize:14, marginTop:10}}><b>Q: Is this data real?</b><br/><span style={{opacity:0.7}}>No, all data generated is completely fake and random for testing purposes only.</span></p>
          <p style={{fontSize:14, marginTop:10}}><b>Q: Can I use it for my project?</b><br/><span style={{opacity:0.7}}>Yes, you can use it for any personal or commercial testing project.</span></p>
          <p style={{fontSize:14, marginTop:10}}><b>Q: Does it support Hindi names?</b><br/><span style={{opacity:0.7}}>Yes! Select Hindi language to generate Indian names like Rahul Sharma, Pooja Verma etc.</span></p>

          <p style={{opacity:0.5, fontSize:12, marginTop:24, borderTop:"1px solid #333", paddingTop:12}}>© 2026 Lorem Pro Tool - Free Developer Tools for Testing. Made in India.</p>
        </div>
      </div>
    </div>
  );
}
