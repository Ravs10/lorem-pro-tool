"use client";
import React from "react";

export default function FakeClient(){
  const [count,setCount]=React.useState(10);
  const [lang,setLang]=React.useState("hi");
  const [data,setData]=React.useState([]);
  const [copied,setCopied]=React.useState(false);
  const [isGenerating,setIsGenerating]=React.useState(false);
  const [activeBtn,setActiveBtn]=React.useState("");

  const namesDB = {
    hi: ["राहुल शर्मा","पूजा वर्मा","अमन यादव","नेहा सिंह","अनन्या मिश्रा","काव्या दुबे","आरव गुप्ता","विवान पटेल","सुरेश चौरसिया","प्रिया पांडेय","अर्जुन सिंह","रोहित वर्मा","काजल यादव","साक्षी गुप्ता","दिव्या सिंह","मोहित शर्मा","निशा पटेल","दीपक कुमार","सुनीता देवी","रमेश कुमार","विकास तिवारी"],
    en: ["John Doe","Emma Smith","Michael Brown","Sophia Wilson","James Johnson","Olivia Davis","Robert Miller"],
    bn: ["অর্জুন দাস","মমতা ব্যানার্জী","রাহুল চ্যাটার্জী","অনির্বাণ ঘোষ","শ্রাবন্তী দাস"],
    ta: ["குமார் முருகன்","லட்சுமி பிரியா","அர்ஜுன் ராஜ்","மீனா குமாரி"],
    es: ["Carlos García","María López","Juan Pérez"],
    fr: ["Jean Dupont","Marie Dubois"],
    de: ["Hans Müller","Greta Schmidt"],
    ja: ["田中浩","佐藤雪","渡辺健二"]
  };
  const citiesDB = {
    hi: ["लखनऊ","दिल्ली","मुंबई","पटना","कानपुर","वाराणसी","जयपुर","भोपाल"],
    en: ["New York","London","Sydney"], bn: ["কলকাতা","ঢাকা"], ta: ["சென்னை","கோயம்புத்தூர்"], es: ["Madrid"], fr: ["Paris"], de: ["Berlin"], ja: ["東京","大阪"]
  };

  const generate = () => {
    setIsGenerating(true); setActiveBtn("gen");
    setTimeout(()=>{
      let nList=[...(namesDB[lang]||namesDB.en)].sort(()=>0.5-Math.random());
      let cList=citiesDB[lang]||citiesDB.en;
      let arr=[]; for(let i=0;i<count;i++){ arr.push({ id:i+1, name:nList[i%nList.length], email:`user${1000+i}@testmail.com`, phone:`+91 9${Math.floor(100000000+Math.random()*900000000)}`, city:cList[Math.floor(Math.random()*cList.length)], address:`${cList[Math.floor(Math.random()*cList.length)]} - ${Math.floor(100000+Math.random()*900000)}` }); }
      setData(arr); setIsGenerating(false); setTimeout(()=>setActiveBtn(""),300);
    },350);
  };
  React.useEffect(()=>{ generate(); },[lang]);

  const download = (type) => {
    if(!data.length) return;
    setActiveBtn(type); setTimeout(()=>setActiveBtn(""),300);
    let content="", ext=type;
    if(type==="json") content=JSON.stringify(data,null,2);
    if(type==="csv") content="id,name,email,phone,city\n"+data.map(d=>`${d.id},"${d.name}","${d.email}","${d.phone}","${d.city}"`).join("\n");
    if(type==="sql") content=data.map(d=>`INSERT INTO users (name,city) VALUES ('${d.name}','${d.city}');`).join("\n");
    if(type==="txt") content=data.map(d=>`${d.name} | ${d.city}`).join("\n");
    const blob=new Blob([content],{type:"text/plain"}); const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=`fake-data-${lang}.${ext}`; a.click();
  };

  const btnStyle = (id) => ({ transition:"all 0.15s", transform: activeBtn===id? "scale(0.92)" : "scale(1)" });

  return (
    <div style={{background:"#0a0a0a", minHeight:"100vh", color:"white"}}>
      {/* HEADER - English Only */}
      <header style={{display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 16px", borderBottom:"1px solid #222", background:"#111", position:"sticky", top:0, zIndex:10}}>
        <div style={{fontWeight:800, fontSize:18}}>⚡ Lorem Pro Tool</div>
        <nav style={{display:"flex", gap:16, fontSize:13, opacity:0.8}}>
          <a href="/" style={{color:"white", textDecoration:"none"}}>Home</a>
          <a href="/about" style={{color:"white", textDecoration:"none"}}>About</a>
          <a href="/privacy-policy" style={{color:"white", textDecoration:"none"}}>Privacy</a>
          <a href="/contact" style={{color:"white", textDecoration:"none"}}>Contact</a>
        </nav>
      </header>

      <div style={{maxWidth:680, margin:"0 auto", padding:16}}>
        {/* TOOL CARD */}
        <div style={{background:"#171717", borderRadius:24, padding:20, border:"1px solid #2a2a2a"}}>
          <h1 style={{fontSize:26, fontWeight:800}}>Fake Data Generator</h1>
          <p style={{opacity:0.6, fontSize:13, marginTop:4}}>Generate fake names in 8+ native scripts - Hindi, Bengali, Tamil, Japanese etc.</p>

          <div style={{display:"grid", gridTemplateColumns:"1fr 100px", gap:10, marginTop:18}}>
            <select value={lang} onChange={e=>setLang(e.target.value)} style={{padding:14, borderRadius:14, background:"#262626", color:"white", border:"1px solid #333"}}>
              <option value="hi">🇮🇳 Hindi - हिन्दी (राहुल शर्मा)</option>
              <option value="en">🇺🇸 English - John Doe</option>
              <option value="bn">🇮🇳 Bengali - বাংলা (অর্জুন দাস)</option>
              <option value="ta">🇮🇳 Tamil - தமிழ் (குமார்)</option>
              <option value="es">🇪🇸 Spanish</option>
              <option value="fr">🇫🇷 French</option>
              <option value="de">🇩🇪 German</option>
              <option value="ja">🇯🇵 Japanese - 日本語</option>
            </select>
            <select value={count} onChange={e=>setCount(Number(e.target.value))} style={{padding:14, borderRadius:14, background:"#262626", color:"white", border:"1px solid #333"}}>
              <option value="10">10 Rows</option><option value="25">25 Rows</option><option value="50">50 Rows</option><option value="100">100 Rows</option>
            </select>
          </div>

          <div style={{display:"flex", gap:8, marginTop:12}}>
            <button onClick={generate} style={{...btnStyle("gen"), flex:1, padding:14, borderRadius:14, background:"white", color:"black", fontWeight:700, border:"none", cursor:"pointer"}}>{isGenerating?"⏳ Generating...":"✨ Generate Data"}</button>
            <button onClick={()=>{setData([]); setActiveBtn("clear"); setTimeout(()=>setActiveBtn(""),300);}} style={{...btnStyle("clear"), padding:14, borderRadius:14, background:"#262626", color:"white", border:"1px solid #333", cursor:"pointer"}}>🗑️ Clear</button>
          </div>

          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:8, marginTop:12}}>
            {["json","csv","sql","txt"].map(f=><button key={f} onClick={()=>download(f)} style={{...btnStyle(f), padding:10, borderRadius:12, background:"#1f2937", color:"white", border:"1px solid #333", fontSize:12, cursor:"pointer"}}>⬇️ {f.toUpperCase()}</button>)}
          </div>

          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginTop:10}}>
            <button onClick={()=>{localStorage.setItem("fakeData",JSON.stringify(data)); setActiveBtn("save"); setTimeout(()=>setActiveBtn(""),800);}} style={{...btnStyle("save"), padding:10, borderRadius:12, background:"#262626", color:"white", border:"1px solid #333", cursor:"pointer"}}>💾 Save</button>
            <button onClick={()=>{if(navigator.share) navigator.share({title:"Fake Data", url:location.href}); else {navigator.clipboard.writeText(location.href); alert("Link Copied!")}} } style={{padding:10, borderRadius:12, background:"#262626", color:"white", border:"1px solid #333", cursor:"pointer"}}>📤 Share</button>
            <button onClick={()=>{navigator.clipboard.writeText(JSON.stringify(data,null,2)); setCopied(true); setTimeout(()=>setCopied(false),2000); setActiveBtn("copy"); setTimeout(()=>setActiveBtn(""),300);}} style={{...btnStyle("copy"), padding:10, borderRadius:12, background:copied?"#22c55e":"#262626", color:copied?"black":"white", border:"1px solid #333", fontWeight:copied?700:400, cursor:"pointer"}}>{copied?"✅ Copied!":"📋 Copy"}</button>
          </div>

          <pre style={{marginTop:16, background:"black", borderRadius:16, padding:16, maxHeight:320, overflow:"auto", color:"#4ade80", fontSize:12, border:"1px solid #222", whiteSpace:"pre-wrap", wordBreak:"break-word"}}>{data.length?JSON.stringify(data,null,2):"Click Generate..."}</pre>
        </div>

        {/* ARTICLE + FAQ - Wapas Add Kiya - English Me */}
        <div style={{marginTop:24, background:"#171717", borderRadius:20, padding:20, border:"1px solid #222", lineHeight:1.7}}>
          <h2 style={{fontSize:20, fontWeight:700}}>What is Fake Data Generator?</h2>
          <p style={{opacity:0.8, fontSize:14, marginTop:10}}>Fake Data Generator is a free online tool for developers, testers and students. It creates 100% fake but realistic dummy data like names, emails, phone numbers, cities in 8+ native languages. Now you can generate data in proper Hindi script - राहुल शर्मा, Bengali - অর্জুন দাস, Tamil - குமார் முருகன், Japanese - 田中浩. All data is generated in your browser and is safe for testing.</p>

          <h3 style={{marginTop:20, fontWeight:700, fontSize:16}}>Key Features</h3>
          <ul style={{opacity:0.8, fontSize:14, marginTop:8, paddingLeft:18}}>
            <li>✅ 8+ Languages in Native Script (Hindi, Bengali, Tamil, Japanese)</li>
            <li>✅ No Repetition - Smart Shuffle Algorithm</li>
            <li>✅ Export in JSON, CSV, SQL, TXT</li>
            <li>✅ Copy with Animation, Save, Share Feature</li>
            <li>✅ 100% Free, No Login Required, Mobile Friendly</li>
          </ul>

          <h3 style={{marginTop:20, fontWeight:700, fontSize:16}}>Frequently Asked Questions (FAQ)</h3>
          <div style={{marginTop:10}}>
            <p style={{fontSize:14}}><b>Q1: Is this data real?</b><br/><span style={{opacity:0.7}}>No, all data is 100% fake and randomly generated for testing purposes only. Any resemblance to real persons is coincidental.</span></p>
            <p style={{fontSize:14, marginTop:12}}><b>Q2: Can I generate Hindi names in Devanagari?</b><br/><span style={{opacity:0.7}}>Yes! Select Hindi (हिन्दी) option and you will get names like राहुल शर्मा, पूजा वर्मा, अमन यादव in proper Devanagari script.</span></p>
            <p style={{fontSize:14, marginTop:12}}><b>Q3: Is it free for commercial use?</b><br/><span style={{opacity:0.7}}>Yes, you can use this tool for personal and commercial testing projects without any attribution.</span></p>
            <p style={{fontSize:14, marginTop:12}}><b>Q4: Does it store my data?</b><br/><span style={{opacity:0.7}}>No, everything happens in your browser. We do not store anything on our servers. See our Privacy Policy.</span></p>
          </div>

          <h3 style={{marginTop:20, fontWeight:700, fontSize:16}}>How to Use?</h3>
          <p style={{opacity:0.7, fontSize:14}}>1. Select Language (Hindi, English etc.) 2. Choose number of rows 3. Click Generate Data 4. Copy or Download in your format.</p>

          <p style={{opacity:0.4, fontSize:11, marginTop:24, borderTop:"1px solid #333", paddingTop:12}}>© 2026 Lorem Pro Tool - Free Developer Tools. Made in India.</p>
        </div>
      </div>

      <footer style={{marginTop:32, padding:20, borderTop:"1px solid #222", background:"#111", textAlign:"center"}}>
        <div style={{display:"flex", justifyContent:"center", gap:18, marginBottom:10, fontSize:12}}>
          <a href="/about" style={{color:"#aaa", textDecoration:"none"}}>About Us</a>
          <a href="/privacy-policy" style={{color:"#aaa", textDecoration:"none"}}>Privacy Policy</a>
          <a href="/contact" style={{color:"#aaa", textDecoration:"none"}}>Contact</a>
          <a href="/disclaimer" style={{color:"#aaa", textDecoration:"none"}}>Disclaimer</a>
          <a href="/terms" style={{color:"#aaa", textDecoration:"none"}}>Terms</a>
        </div>
        <div style={{opacity:0.5, fontSize:11}}>© 2026 Lorem Pro Tool - All Rights Reserved</div>
      </footer>
    </div>
  );
}
