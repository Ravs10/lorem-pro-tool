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
    hi: ["राहुल शर्मा","पूजा वर्मा","अमन यादव","नेहा सिंह","अनन्या मिश्रा","काव्या दुबे","आरव गुप्ता","विवान पटेल","सुरेश चौरसिया","प्रिया पांडेय","अर्जुन सिंह","रोहित वर्मा","काजल यादव","साक्षी गुप्ता","दिव्या सिंह","मोहित शर्मा","निशा पटेल","दीपक कुमार","सुनीता देवी","रमेश कुमार","विकास तिवारी","अंकित मिश्रा","रितु सिंह","संजय यादव","मनोज कुमार"],
    en: ["John Doe","Emma Smith","Michael Brown","Sophia Wilson","James Johnson","Olivia Davis","Robert Miller","Ava Garcia","William Jones","Isabella Martinez"],
    es: ["Carlos Garcia","Maria Lopez","Juan Perez","Sofia Martinez","Diego Sanchez","Lucia Gomez"],
    fr: ["Jean Dupont","Marie Dubois","Pierre Martin","Sophie Bernard","Luc Moreau"],
    de: ["Hans Mueller","Greta Schmidt","Klaus Weber","Anna Fischer"],
    ja: ["Hiroshi Tanaka","Yuki Sato","Kenji Watanabe","Sakura Yamamoto"],
    bn: ["অর্জুন দাস","মমতা ব্যানার্জী","রাহুল চ্যাটার্জী","অনির্বাণ ঘোষ","শ্রাবন্তী দাস"],
    ta: ["குமார் முருகன்","லட்சுமி பிரியா","அர்ஜுன் ராஜ்","மீனா குமாரி"]
  };

  const citiesDB = {
    hi: ["Lucknow","Delhi","Mumbai","Pune","Patna","Kanpur","Varanasi","Jaipur","Bhopal","Indore"],
    en: ["New York","London","Sydney","Toronto","Dubai"],
    es: ["Madrid","Barcelona","Valencia"], fr: ["Paris","Lyon","Marseille"],
    de: ["Berlin","Munich"], ja: ["Tokyo","Osaka","Kyoto"], bn: ["Kolkata","Dhaka","Howrah"], ta: ["Chennai","Coimbatore","Madurai"]
  };

  // FIX: No Repetition Logic
  const generate = () => {
    setIsGenerating(true);
    setActiveBtn("gen");
    setTimeout(()=>{
      let arr=[];
      let nList = [...(namesDB[lang] || namesDB["en"])].sort(()=>0.5-Math.random());
      let cList = citiesDB[lang] || citiesDB["en"];
      for(let i=0;i<count;i++){
        let name = nList[i % nList.length] + (i >= nList.length? ` ${i+1}` : "");
        let city = cList[Math.floor(Math.random()*cList.length)];
        arr.push({
          id: i+1,
          name: name,
          email: `${name.toLowerCase().replace(/[^a-z]/g,"").slice(0,10)}${i+1}@testmail.com`,
          phone: `+91 9${Math.floor(100000000 + Math.random()*900000000)}`,
          city: city,
          address: `${city}, ${lang==='hi'?'India':'World'} - ${Math.floor(100000+Math.random()*900000)}`
        })
      }
      setData(arr);
      setIsGenerating(false);
      setTimeout(()=>setActiveBtn(""),300);
    },400);
  };

  React.useEffect(()=>{ generate(); },[lang]);

  const download = (type) => {
    if(!data.length) return;
    setActiveBtn(type); setTimeout(()=>setActiveBtn(""),300);
    let content="", ext=type, mime="text/plain";
    if(type==="json"){ content=JSON.stringify(data,null,2); mime="application/json"; }
    if(type==="csv"){ content="id,name,email,phone,city\n"+data.map(d=>`${d.id},"${d.name}","${d.email}","${d.phone}","${d.city}"`).join("\n"); mime="text/csv"; }
    if(type==="sql"){ content=data.map(d=>`INSERT INTO users (name,email,phone,city) VALUES ('${d.name}','${d.email}','${d.phone}','${d.city}');`).join("\n"); }
    if(type==="txt"){ content=data.map(d=>`${d.name} | ${d.email} | ${d.phone}`).join("\n"); }
    const blob=new Blob([content],{type:mime}); const url=URL.createObjectURL(blob);
    const a=document.createElement("a"); a.href=url; a.download=`fake-data-${lang}.${ext}`; a.click();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(data,null,2));
    setCopied(true); setActiveBtn("copy");
    setTimeout(()=>{ setCopied(false); setActiveBtn(""); },2000);
  };

  const btnStyle = (id) => ({
    transition:"all 0.15s ease",
    transform: activeBtn===id? "scale(0.92)" : "scale(1)",
    filter: activeBtn===id? "brightness(1.2)" : "brightness(1)"
  });

  return (
    <div style={{background:"#0a0a0a", minHeight:"100vh", color:"white"}}>
      {/* HEADER */}
      <header style={{display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 16px", borderBottom:"1px solid #222", background:"#111", position:"sticky", top:0, zIndex:10}}>
        <div style={{fontWeight:800, fontSize:18}}>⚡ Lorem Pro Tool</div>
        <div style={{display:"flex", gap:12, fontSize:13, opacity:0.7}}>
          <span onClick={()=>window.location.href='/'}>Home</span>
          <span onClick={()=>window.location.href='/about'}>About</span>
          <span onClick={()=>window.location.href='/privacy-policy'}>Privacy</span>
        </div>
      </header>

      <div style={{maxWidth:680, margin:"0 auto", padding:16}}>
        <div style={{background:"#171717", borderRadius:24, padding:20, border:"1px solid #2a2a2a"}}>
          <h1 style={{fontSize:26, fontWeight:800}}>Fake Data Generator</h1>
          <p style={{opacity:0.6, fontSize:13, marginTop:4}}>Advanced dummy data in 8+ languages - No repeat, AdSense ready</p>

          <div style={{display:"grid", gridTemplateColumns:"1fr 100px", gap:10, marginTop:18}}>
            <select value={lang} onChange={e=>setLang(e.target.value)} style={{padding:14, borderRadius:14, background:"#262626", color:"white", border:"1px solid #333"}}>
              <option value="hi">🇮🇳 Hindi (हिंदी)</option><option value="en">🇺🇸 English</option><option value="bn">🇮🇳 Bengali</option><option value="ta">🇮🇳 Tamil</option><option value="es">🇪🇸 Spanish</option><option value="fr">🇫🇷 French</option><option value="de">🇩🇪 German</option><option value="ja">🇯🇵 Japanese</option>
            </select>
            <select value={count} onChange={e=>setCount(Number(e.target.value))} style={{padding:14, borderRadius:14, background:"#262626", color:"white", border:"1px solid #333"}}>
              <option value="10">10 Rows</option><option value="25">25</option><option value="50">50</option><option value="100">100</option>
            </select>
          </div>

          <div style={{display:"flex", gap:8, marginTop:12}}>
            <button onClick={generate} style={{...btnStyle("gen"), flex:1, padding:14, borderRadius:14, background: isGenerating?"#555":"white", color: isGenerating?"white":"black", fontWeight:700, border:"none", cursor:"pointer"}}>{isGenerating?"⏳ Generating...":"✨ Generate"}</button>
            <button onClick={()=>{setData([]); setActiveBtn("clear"); setTimeout(()=>setActiveBtn(""),300);}} style={{...btnStyle("clear"), padding:14, borderRadius:14, background:"#262626", color:"white", border:"1px solid #333"}}>🗑️ Clear</button>
          </div>

          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:8, marginTop:12}}>
            {["json","csv","sql","txt"].map(f=>(
              <button key={f} onClick={()=>download(f)} style={{...btnStyle(f), padding:10, borderRadius:12, background:"#1f2937", color:"white", border:"1px solid #333", fontSize:12, cursor:"pointer"}}>⬇️ {f.toUpperCase()}</button>
            ))}
          </div>

          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginTop:10}}>
            <button onClick={()=>{localStorage.setItem("fakeData",JSON.stringify(data)); setActiveBtn("save"); setTimeout(()=>setActiveBtn(""),1000);}} style={{...btnStyle("save"), padding:10, borderRadius:12, background:"#262626", color:"white", border:"1px solid #333"}}>💾 Save</button>
            <button onClick={()=>{if(navigator.share) navigator.share({title:"Fake Data", url: window.location.href}); else {navigator.clipboard.writeText(window.location.href); alert("Link Copied!")} setActiveBtn("share"); setTimeout(()=>setActiveBtn(""),500);}} style={{...btnStyle("share"), padding:10, borderRadius:12, background:"#262626", color:"white", border:"1px solid #333"}}>📤 Share</button>
            <button onClick={handleCopy} style={{...btnStyle("copy"), padding:10, borderRadius:12, background: copied?"#22c55e":"#262626", color: copied?"black":"white", border:"1px solid #333", fontWeight: copied?700:400, transition:"all 0.3s ease"}}>{copied?"✅ Copied!":"📋 Copy"}</button>
          </div>

          <pre style={{marginTop:16, background:"black", borderRadius:16, padding:16, maxHeight:320, overflow:"auto", color:"#4ade80", fontSize:11, border:"1px solid #222", transition:"all 0.3s"}}>{data.length?JSON.stringify(data,null,2):"No data..."}</pre>
        </div>

        {/* ARTICLE FOR ADSENSE */}
        <div style={{marginTop:24, background:"#171717", borderRadius:20, padding:20, border:"1px solid #222", lineHeight:1.7}}>
          <h2 style={{fontSize:18, fontWeight:700}}>What is Fake Data Generator?</h2>
          <p style={{opacity:0.8, fontSize:13, marginTop:8}}>This tool generates 100% fake but realistic data for testing. No repetition logic added - every time you click Generate, you get unique shuffled names. Perfect for developers building apps in India.</p>
          <h3 style={{marginTop:16, fontSize:15, fontWeight:700}}>Why Choose Us?</h3>
          <ul style={{opacity:0.7, fontSize:13}}><li>✅ No duplicate data - Smart shuffle algorithm</li><li>✅ Real Hindi names - 22+ Indian names</li><li>✅ Animated UI - Copy button turns green</li><li>✅ Header/Footer for AdSense Approval</li></ul>
          <h3 style={{marginTop:16, fontSize:15, fontWeight:700}}>FAQ</h3>
          <p style={{fontSize:13}}><b>Q: Hindi repeat kyun hota tha?</b><br/><span style={{opacity:0.6}}>Ab fix hai - shuffle logic se unique names aayenge.</span></p>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{marginTop:32, padding:20, borderTop:"1px solid #222", background:"#111", textAlign:"center", opacity:0.6, fontSize:12}}>
        <div style={{display:"flex", justifyContent:"center", gap:16, marginBottom:10}}>
          <a href="/about" style={{color:"white"}}>About</a>
          <a href="/privacy-policy" style={{color:"white"}}>Privacy</a>
          <a href="/contact" style={{color:"white"}}>Contact</a>
          <a href="/terms" style={{color:"white"}}>Terms</a>
        </div>
        © 2026 Lorem Pro Tool - Made in India for Developers
      </footer>
    </div>
  );
}
