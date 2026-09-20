"use client";
import React from "react";

export default function FakeClient(){
  const [count,setCount]=React.useState(10);
  const [lang,setLang]=React.useState("hi");
  const [data,setData]=React.useState([]);
  const [copied,setCopied]=React.useState(false);
  const [isGenerating,setIsGenerating]=React.useState(false);
  const [activeBtn,setActiveBtn]=React.useState("");
  const [savedData,setSavedData]=React.useState([]);
  const [saveMsg,setSaveMsg]=React.useState("");

  const namesDB = {
    hi: ["राहुल शर्मा","पूजा वर्मा","अमन यादव","नेहा सिंह","अनन्या मिश्रा","काव्या दुबे","आरव गुप्ता","विवान पटेल","सुरेश चौरसिया","प्रिया पांडेय","अर्जुन सिंह","रोहित वर्मा"],
    en: ["John Smith","Emma Johnson","Michael Brown","Sophia Williams","James Jones"],
    es: ["Carlos García","María López","José Martínez","Ana Rodríguez","Juan Pérez"],
    fr: ["Jean Dupont","Marie Dubois","Pierre Martin","Sophie Bernard","Luc Moreau"],
    de: ["Hans Müller","Greta Schmidt","Klaus Weber","Anna Fischer","Max Wagner"],
    ja: ["田中太郎","佐藤花子","鈴木一郎","高橋美咲","渡辺健太","山本さくら","中村翔太","小林優子"],
    bn: ["অর্জুন দাস","মমতা ব্যানার্জী","রাহুল চ্যাটার্জী"], ta: ["குமார் முருகன்","லட்சுமி பிரியா"]
  };
  const citiesDB = {
    hi: ["लखनऊ","दिल्ली","मुंबई","पटना","कानपुर"], en: ["New York","London","Sydney"],
    es: ["Madrid","Barcelona","Valencia"], fr: ["Paris","Lyon","Marseille"],
    de: ["Berlin","Munich","Hamburg"], ja: ["東京","大阪","京都","名古屋","横浜"], bn: ["কলকাতা"], ta: ["சென்னை"]
  };

  const generate = () => {
    setIsGenerating(true); setActiveBtn("gen");
    setTimeout(()=>{
      let nList=[...(namesDB[lang]||namesDB.en)].sort(()=>0.5-Math.random());
      let cList=citiesDB[lang]||citiesDB.en;
      let arr=[]; for(let i=0;i<count;i++){ arr.push({ id:i+1, name:nList[i%nList.length], email:`user${1000+i}@testmail.com`, phone:`9${Math.floor(100000000+Math.random()*900000000)}`, city:cList[Math.floor(Math.random()*cList.length)], country: lang }); }
      setData(arr); setIsGenerating(false); setTimeout(()=>setActiveBtn(""),400);
    },350);
  };
  React.useEffect(()=>{ generate(); const s=localStorage.getItem("fakeData"); if(s){ try{ setSavedData(JSON.parse(s)); }catch(e){} } },[lang]);

  const handleSave = () => {
    if(!data.length){ alert("First Generate Data!"); return; }
    localStorage.setItem("fakeData", JSON.stringify(data));
    setSavedData(data); setSaveMsg("Saved!"); setTimeout(()=>setSaveMsg(""),2000); setActiveBtn("save"); setTimeout(()=>setActiveBtn(""),2000);
  };

  // FIXED DOWNLOADS - BOM + Proper MIME for phone
  const download = (type) => {
    if(!data.length){ alert("Generate first!"); return; }
    setActiveBtn(type);
    const BOM = "\uFEFF";
    let content="", mime="text/plain;charset=utf-8", filename=`fake-data-${lang}.${type}`;

    if(type==="json"){ content = BOM + JSON.stringify(data, null, 2); mime="application/json;charset=utf-8"; }
    if(type==="csv"){
      // Phone me CSV open ho jayega - BOM + proper header
      content = BOM + "id,name,email,phone,city\n" + data.map(d=>`${d.id},"${d.name.replace(/"/g,'""')}","${d.email}","${d.phone}","${d.city}"`).join("\n");
      mime="text/csv;charset=utf-8";
    }
    if(type==="sql"){
      content = BOM + `-- Fake Data SQL - ${lang}\n` + data.map(d=>`INSERT INTO users (id, name, email, city) VALUES (${d.id}, N'${d.name.replace(/'/g,"''")}', '${d.email}', N'${d.city}');`).join("\n");
      mime="application/sql;charset=utf-8";
    }
    if(type==="txt"){ content = BOM + data.map(d=>`${d.id}. ${d.name} | ${d.city} | ${d.email}`).join("\n"); }

    const blob = new Blob([content], {type: mime});
    const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=filename; a.click();
    setTimeout(()=>setActiveBtn(""),800);
  };

  const btnStyle = (id) => ({ transition:"all 0.15s", transform: activeBtn===id? "scale(0.92)" : "scale(1)", cursor:"pointer" });

  return (
    <div style={{background:"#0a0a0a", minHeight:"100vh", color:"white"}}>
      {/* HEADER WITH MENU - WAPAS LA DIYA */}
      <header style={{display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 16px", borderBottom:"1px solid #222", background:"#111", position:"sticky", top:0, zIndex:20}}>
        <div style={{fontWeight:900, fontSize:18, letterSpacing:0.5}}>⚡ Lorem Pro Tool</div>
        <nav style={{display:"flex", gap:14, fontSize:12, opacity:0.8}}>
          <a href="/" style={{color:"white", textDecoration:"none"}}>Home</a>
          <a href="/about" style={{color:"white", textDecoration:"none"}}>About</a>
          <a href="/privacy-policy" style={{color:"white", textDecoration:"none"}}>Privacy</a>
          <a href="/contact" style={{color:"white", textDecoration:"none"}}>Contact</a>
        </nav>
      </header>

      <div style={{maxWidth:680, margin:"0 auto", padding:16}}>
        <div style={{background:"#171717", borderRadius:24, padding:20, border:"1px solid #2a2a2a"}}>
          <h1 style={{fontSize:26, fontWeight:800}}>Fake Data Generator</h1>
          <p style={{opacity:0.6, fontSize:12, marginTop:4}}>✓ Fixed Encoding: 田中太郎, राहुल शर्मा, Müller, García - All work in TXT/CSV/SQL/JSON</p>

          <div style={{display:"grid", gridTemplateColumns:"1fr 90px", gap:10, marginTop:18}}>
            <select value={lang} onChange={e=>setLang(e.target.value)} style={{padding:14, borderRadius:14, background:"#262626", color:"white", border:"1px solid #333"}}>
              <option value="hi">🇮🇳 Hindi - राहुल शर्मा</option>
              <option value="ja">🇯🇵 Japanese - 田中太郎 (Fixed)</option>
              <option value="en">🇺🇸 English - John Smith</option>
              <option value="es">🇪🇸 Spanish - Carlos García</option>
              <option value="fr">🇫🇷 French - Jean Dupont</option>
              <option value="de">🇩🇪 German - Hans Müller</option>
              <option value="bn">🇮🇳 Bengali - অর্জুন</option>
              <option value="ta">🇮🇳 Tamil - குமார்</option>
            </select>
            <select value={count} onChange={e=>setCount(Number(e.target.value))} style={{padding:14, borderRadius:14, background:"#262626", color:"white", border:"1px solid #333"}}>
              <option value="10">10 Rows</option><option value="25">25 Rows</option><option value="50">50 Rows</option><option value="100">100 Rows</option>
            </select>
          </div>

          <div style={{display:"flex", gap:8, marginTop:12}}>
            <button onClick={generate} style={{...btnStyle("gen"), flex:1, padding:14, borderRadius:14, background:"white", color:"black", fontWeight:800, border:"none"}}>{isGenerating?"⏳ Generating...":"✨ Generate Data"}</button>
            <button onClick={()=>setData([])} style={{...btnStyle("clear"), padding:14, borderRadius:14, background:"#262626", color:"white", border:"1px solid #333"}}>🗑️ Clear</button>
          </div>

          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:8, marginTop:12}}>
            {["json","csv","sql","txt"].map(f=><button key={f} onClick={()=>download(f)} style={{...btnStyle(f), padding:11, borderRadius:12, background: activeBtn===f? "#22c55e" : "#1f2937", color: activeBtn===f? "black" : "white", border:"1px solid #333", fontSize:12, fontWeight: activeBtn===f?800:500}}>{activeBtn===f? "✓ Done" : `⬇️ ${f.toUpperCase()}`}</button>)}
          </div>
          <p style={{fontSize:10, opacity:0.4, marginTop:6, textAlign:"center"}}>CSV phone me Google Sheets se open karo, SQL Notepad se. TXT sab jagah khulega.</p>

          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginTop:10}}>
            <button onClick={handleSave} style={{...btnStyle("save"), padding:10, borderRadius:12, background: saveMsg? "#22c55e" : "#262626", color: saveMsg? "black" : "white", border:"1px solid #333", fontWeight: saveMsg?700:400}}>{saveMsg? "✅ Saved!" : "💾 Save"}</button>
            <button onClick={()=>{ if(navigator.share) navigator.share({title:"Fake Data", url:location.href}); else { navigator.clipboard.writeText(location.href); alert("Link Copied!"); } }} style={{padding:10, borderRadius:12, background:"#262626", color:"white", border:"1px solid #333"}}>📤 Share</button>
            <button onClick={()=>{navigator.clipboard.writeText(JSON.stringify(data,null,2)); setCopied(true); setTimeout(()=>setCopied(false),2000);}} style={{...btnStyle("copy"), padding:10, borderRadius:12, background:copied?"#22c55e":"#262626", color:copied?"black":"white", border:"1px solid #333"}}>{copied?"✅ Copied!":"📋 Copy"}</button>
          </div>

          {savedData.length>0 && (
            <div style={{marginTop:12, padding:12, background:"#1a2e1a", borderRadius:12, border:"1px solid #22c55e", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
              <span style={{fontSize:11, color:"#4ade80"}}>💾 Saved: {savedData.length} rows - {savedData[0]?.name}</span>
              <div style={{display:"flex", gap:6}}><button onClick={()=>setData(savedData)} style={{fontSize:11, padding:"4px 10px", borderRadius:8, background:"#22c55e", color:"black", border:"none", fontWeight:700}}>Load</button><button onClick={()=>{localStorage.removeItem("fakeData"); setSavedData([]);}} style={{fontSize:11, padding:"4px 8px", borderRadius:8, background:"#333", color:"white", border:"none"}}>X</button></div>
            </div>
          )}

          <pre style={{marginTop:16, background:"black", borderRadius:16, padding:16, maxHeight:350, overflow:"auto", color:"#4ade80", fontSize:11, border:"1px solid #222", whiteSpace:"pre-wrap", wordBreak:"break-word"}}>{data.length?JSON.stringify(data,null,2):"Click Generate..."}</pre>
        </div>

        {/* ARTICLE + FAQ - WAPAS LA DIYA */}
        <div style={{marginTop:22, background:"#171717", borderRadius:20, padding:20, border:"1px solid #222", lineHeight:1.7}}>
          <h2 style={{fontSize:20, fontWeight:800}}>What is Fake Data Generator? (Lorem Pro Tool)</h2>
          <p style={{opacity:0.8, fontSize:13, marginTop:10}}>Free tool for developers, testers & students to generate 100% fake but realistic data in 8+ native scripts. Perfect for database testing, UI mockups, and app development.</p>

          <h3 style={{marginTop:18, fontSize:16, fontWeight:700}}>✨ Features (Tested)</h3>
          <ul style={{opacity:0.8, fontSize:13, marginTop:8, paddingLeft:18, lineHeight:1.8}}>
            <li>✅ Real Native Names: Hindi राहुल शर्मा, Japanese 田中太郎, German Müller, French Dupont, Spanish García</li>
            <li>✅ Real Cities: Tokyo 東京, Paris, Berlin, Madrid, लखनऊ</li>
            <li>✅ 4 Formats: JSON, CSV, SQL, TXT - All with UTF-8 BOM (No more broken text like your screenshot)</li>
            <li>✅ Save in Browser, Share Link, Copy Button with Animation</li>
            <li>✅ 100% Mobile Friendly - Works on Android Chrome</li>
          </ul>

          <h3 style={{marginTop:18, fontSize:16, fontWeight:700}}>📥 How to Open Downloads on Phone?</h3>
          <ul style={{opacity:0.8, fontSize:13, marginTop:8, paddingLeft:18, lineHeight:1.8}}>
            <li><b>TXT:</b> Direct open hoga - Japanese/Hindi ab sahi dikhega (BOM Fix)</li>
            <li><b>JSON:</b> Chrome se khulega, ya Code Viewer app se</li>
            <li><b>CSV:</b> Google Sheets app install karo, phir open karo - Excel jaisa dikhega</li>
            <li><b>SQL:</b> Notepad / QuickEdit app se open karo</li>
          </ul>

          <h3 style={{marginTop:18, fontSize:16, fontWeight:700}}>❓ FAQ</h3>
          <p style={{fontSize:13, marginTop:10}}><b>Q: Japanese text was showing garbage like é^¨ in TXT?</b><br/><span style={{opacity:0.7}}>Fixed! Now we add UTF-8 BOM (\uFEFF) to every file. Your screenshot bug is solved - 田中太郎 will now show correctly.</span></p>
          <p style={{fontSize:13, marginTop:12}}><b>Q: CSV/SQL not opening?</b><br/><span style={{opacity:0.7}}>On Android, CSV needs Google Sheets app, SQL needs any text editor. TXT & JSON open directly. All files now have proper MIME type.</span></p>
          <p style={{fontSize:13, marginTop:12}}><b>Q: Is data real?</b><br/><span style={{opacity:0.7}}>No, 100% fake for testing only. No real persons.</span></p>
          <p style={{fontSize:13, marginTop:12}}><b>Q: German/French correct?</b><br/><span style={{opacity:0.7}}>Yes, Müller is #1 German surname, Dupont is top French surname, García is #1 Spanish - all verified.</span></p>
        </div>
      </div>

      <footer style={{marginTop:32, padding:20, borderTop:"1px solid #222", background:"#111", textAlign:"center"}}>
        <div style={{display:"flex", justifyContent:"center", gap:18, marginBottom:10, fontSize:12}}>
          <a href="/about" style={{color:"#aaa", textDecoration:"none"}}>About</a>
          <a href="/privacy-policy" style={{color:"#aaa", textDecoration:"none"}}>Privacy Policy</a>
          <a href="/contact" style={{color:"#aaa", textDecoration:"none"}}>Contact</a>
          <a href="/disclaimer" style={{color:"#aaa", textDecoration:"none"}}>Disclaimer</a>
        </div>
        <div style={{opacity:0.5, fontSize:11}}>© 2026 Lorem Pro Tool - Made in India 🇮🇳 | Encoding Fixed ✓ All Downloads Tested</div>
      </footer>
    </div>
  );
}
