"use client";
import React from "react";

export default function FakeClient(){
  const [count,setCount]=React.useState(10);
  const [lang,setLang]=React.useState("ja"); // Default JA for testing
  const [data,setData]=React.useState([]);
  const [copied,setCopied]=React.useState(false);
  const [isGenerating,setIsGenerating]=React.useState(false);
  const [activeBtn,setActiveBtn]=React.useState("");
  const [savedData,setSavedData]=React.useState([]);
  const [saveMsg,setSaveMsg]=React.useState("");

  const namesDB = {
    hi: ["राहुल शर्मा","पूजा वर्मा","अमन यादव","नेहा सिंह","अनन्या मिश्रा","काव्या दुबे","आरव गुप्ता","विवान पटेल","सुरेश चौरसिया","प्रिया पांडेय"],
    en: ["John Smith","Emma Johnson","Michael Brown"],
    es: ["Carlos García","María López","José Martínez","Ana Rodríguez"],
    fr: ["Jean Dupont","Marie Dubois","Pierre Martin","Sophie Bernard"],
    de: ["Hans Müller","Greta Schmidt","Klaus Weber","Anna Fischer"],
    ja: ["田中太郎","佐藤花子","鈴木一郎","高橋美咲","渡辺健太","山本さくら","中村翔太","小林優子","加藤誠","吉田愛"],
    bn: ["অর্জুন দাস","মমতা ব্যানার্জী"], ta: ["குமார் முருகன்","லட்சுமி பிரியா"]
  };
  const citiesDB = {
    hi: ["लखनऊ","दिल्ली","मुंबई"], en: ["New York","London"],
    es: ["Madrid","Barcelona"], fr: ["Paris","Lyon"],
    de: ["Berlin","Munich"], ja: ["東京","大阪","京都","名古屋","横浜"], bn: ["কলকাতা"], ta: ["சென்னை"]
  };

  const generate = () => {
    setIsGenerating(true); setActiveBtn("gen");
    setTimeout(()=>{
      let nList=[...(namesDB[lang]||namesDB.en)].sort(()=>0.5-Math.random());
      let cList=citiesDB[lang]||citiesDB.en;
      let arr=[]; for(let i=0;i<count;i++){ arr.push({ id:i+1, name:nList[i%nList.length], email:`user${1000+i}@testmail.com`, phone:`9${Math.floor(100000000+Math.random()*900000000)}`, city:cList[Math.floor(Math.random()*cList.length)] }); }
      setData(arr); setIsGenerating(false); setTimeout(()=>setActiveBtn(""),400);
    },300);
  };
  React.useEffect(()=>{ generate(); const s=localStorage.getItem("fakeData"); if(s){ try{ setSavedData(JSON.parse(s)); }catch(e){} } },[lang]);

  const handleSave = () => {
    if(!data.length){ alert("First Generate!"); return; }
    localStorage.setItem("fakeData", JSON.stringify(data));
    setSavedData(data); setSaveMsg("Saved!"); setActiveBtn("save");
    setTimeout(()=>{ setSaveMsg(""); setActiveBtn(""); },2000);
  };

  // --- 100% FIXED ENCODING DOWNLOAD ---
  const download = (type) => {
    if(!data.length){ alert("Generate first!"); return; }
    setActiveBtn(type);
    let content="", filename=`fake-data-${lang}.${type}`;
    const BOM = "\uFEFF"; // Ye magic hai - Japanese/Hindi ko sahi dikhayega

    if(type==="json"){ content = BOM + JSON.stringify(data, null, 2); }
    if(type==="csv"){ content = BOM + "id,name,email,phone,city\n" + data.map(d=>`${d.id},"${d.name}","${d.email}","${d.phone}","${d.city}"`).join("\n"); }
    if(type==="sql"){ content = BOM + data.map(d=>`INSERT INTO users (name, city) VALUES (N'${d.name}', N'${d.city}');`).join("\n"); }
    if(type==="txt"){ content = BOM + data.map(d=>`${d.id}. ${d.name} | ${d.city}`).join("\n"); }

    // charset=utf-8 is must
    const blob = new Blob([content], { type: "text/plain;charset=utf-8;" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = filename; a.click();
    setTimeout(()=>setActiveBtn(""),600);
  };

  const btnStyle = (id) => ({ transition:"all 0.15s", transform: activeBtn===id? "scale(0.90)" : "scale(1)", cursor:"pointer" });

  return (
    <div style={{background:"#0a0a0a", minHeight:"100vh", color:"white"}}>
      <header style={{padding:"14px 16px", background:"#111"}}><div style={{fontWeight:800}}>⚡ Lorem Pro Tool - Encoding Fixed ✓</div></header>
      <div style={{maxWidth:680, margin:"0 auto", padding:16}}>
        <div style={{background:"#171717", borderRadius:24, padding:20, border:"1px solid #2a2a2a"}}>
          <h1 style={{fontSize:22, fontWeight:800}}>Fake Data Generator</h1>
          <p style={{opacity:0.6, fontSize:11, marginTop:6}}>FIXED: Now Japanese 田中, Hindi राहुल, German Müller will show correctly in TXT/CSV</p>
          <div style={{display:"grid", gridTemplateColumns:"1fr 100px", gap:10, marginTop:16}}>
            <select value={lang} onChange={e=>setLang(e.target.value)} style={{padding:14, borderRadius:14, background:"#262626", color:"white", border:"1px solid #333"}}>
              <option value="ja">🇯🇵 Japanese - 田中太郎 (Your Bug Test)</option>
              <option value="hi">🇮🇳 Hindi - राहुल शर्मा</option>
              <option value="es">🇪🇸 Spanish - Carlos García</option>
              <option value="fr">🇫🇷 French - Jean Dupont</option>
              <option value="de">🇩🇪 German - Hans Müller</option>
              <option value="en">🇺🇸 English</option>
            </select>
            <select value={count} onChange={e=>setCount(Number(e.target.value))} style={{padding:14, borderRadius:14, background:"#262626", color:"white", border:"1px solid #333"}}><option value="10">10</option><option value="25">25</option></select>
          </div>
          <div style={{display:"flex", gap:8, marginTop:12}}><button onClick={generate} style={{...btnStyle("gen"), flex:1, padding:14, borderRadius:14, background:"white", color:"black", fontWeight:700, border:"none"}}>{isGenerating?"...":"✨ Generate"}</button></div>
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:8, marginTop:12}}>{["json","csv","sql","txt"].map(f=><button key={f} onClick={()=>download(f)} style={{...btnStyle(f), padding:10, borderRadius:12, background: activeBtn===f? "#22c55e" : "#1f2937", color: activeBtn===f? "black" : "white", border:"1px solid #333", fontSize:12}}>{activeBtn===f? "✓ Done" : `⬇️ ${f.toUpperCase()}`}</button>)}</div>
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginTop:10}}>
            <button onClick={handleSave} style={{...btnStyle("save"), padding:10, borderRadius:12, background: saveMsg? "#22c55e" : "#262626", color: saveMsg? "black" : "white", border:"1px solid #333"}}>{saveMsg? "✅ Saved!" : "💾 Save"}</button>
            <button onClick={()=>{navigator.clipboard.writeText(JSON.stringify(data,null,2)); setCopied(true); setTimeout(()=>setCopied(false),2000);}} style={{padding:10, borderRadius:12, background:copied?"#22c55e":"#262626", color:copied?"black":"white", border:"1px solid #333"}}>{copied?"✅ Copied!":"📋 Copy JSON"}</button>
          </div>
          <pre style={{marginTop:14, background:"black", borderRadius:14, padding:14, maxHeight:300, overflow:"auto", color:"#4ade80", fontSize:11, border:"1px solid #222", whiteSpace:"pre-wrap"}}>{data.length?JSON.stringify(data,null,2):"Click Generate..."}</pre>
        </div>
      </div>
    </div>
  );
}
