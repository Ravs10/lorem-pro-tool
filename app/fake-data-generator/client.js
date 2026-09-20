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
    hi: ["राहुल शर्मा","पूजा वर्मा","अमन यादव","नेहा सिंह","अनन्या मिश्रा","काव्या दुबे","आरव गुप्ता","विवान पटेल","सुरेश चौरसिया","प्रिया पांडेय","अर्जुन सिंह","रोहित वर्मा","काजल यादव","साक्षी गुप्ता"],
    en: ["John Smith","Emma Johnson","Michael Brown","Sophia Williams","James Jones","Olivia Davis","Robert Miller"],
    es: ["Carlos García","María López","José Martínez","Ana Rodríguez","Juan Pérez","Laura González","Miguel Sánchez","Sofía Fernández"],
    fr: ["Jean Dupont","Marie Dubois","Pierre Martin","Sophie Bernard","Luc Moreau","Camille Laurent","Antoine Girard","Julie Lefevre"],
    de: ["Hans Müller","Greta Schmidt","Klaus Weber","Anna Fischer","Max Wagner","Sophie Becker","Paul Hoffmann","Lena Schäfer"],
    ja: ["田中太郎","佐藤花子","鈴木一郎","高橋美咲","渡辺健太","山本さくら"],
    bn: ["অর্জুন দাস","মমতা ব্যানার্জী","রাহুল চ্যাটার্জী","শ্রাবন্তী দাস"],
    ta: ["குமார் முருகன்","லட்சுமி பிரியா","அர்ஜுன் ராஜ்","மீனா குமாரி"]
  };
  const citiesDB = {
    hi: ["लखनऊ","दिल्ली","मुंबई","पटना","कानपुर","वाराणसी"], en: ["New York","London","Sydney"],
    es: ["Madrid","Barcelona","Valencia"], fr: ["Paris","Lyon","Marseille"],
    de: ["Berlin","Munich","Hamburg"], ja: ["東京","大阪","京都"], bn: ["কলকাতা"], ta: ["சென்னை"]
  };

  const generate = () => {
    setIsGenerating(true); setActiveBtn("gen");
    setTimeout(()=>{
      let nList=[...(namesDB[lang]||namesDB.en)].sort(()=>0.5-Math.random());
      let cList=citiesDB[lang]||citiesDB.en;
      let arr=[]; for(let i=0;i<count;i++){ arr.push({ id:i+1, name:nList[i%nList.length], email:`user${1000+i}@testmail.com`, phone:`+91 9${Math.floor(100000000+Math.random()*900000000)}`, city:cList[Math.floor(Math.random()*cList.length)], country: lang }); }
      setData(arr); setIsGenerating(false); setTimeout(()=>setActiveBtn(""),300);
    },350);
  };

  React.useEffect(()=>{ generate(); const s=localStorage.getItem("fakeData"); if(s){ try{ setSavedData(JSON.parse(s)); }catch(e){} } },[lang]);

  const handleSave = () => {
    if(!data.length){ alert("First Generate Data!"); return; }
    localStorage.setItem("fakeData", JSON.stringify(data));
    setSavedData(data); setSaveMsg("Saved!"); setActiveBtn("save");
    setTimeout(()=>{ setSaveMsg(""); setActiveBtn(""); },2000);
  };

  const download = (type) => {
    if(!data.length) return; setActiveBtn(type); setTimeout(()=>setActiveBtn(""),300);
    let content= type==="json"? JSON.stringify(data,null,2) : "id,name,city\n"+data.map(d=>`${d.id},${d.name},${d.city}`).join("\n");
    const blob=new Blob([content],{type:"text/plain"}); const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=`fake-data-${lang}.${type}`; a.click();
  };

  const btnStyle = (id) => ({ transition:"all 0.15s", transform: activeBtn===id? "scale(0.92)" : "scale(1)", cursor:"pointer" });

  return (
    <div style={{background:"#0a0a0a", minHeight:"100vh", color:"white"}}>
      <header style={{display:"flex", justifyContent:"space-between", padding:"14px 16px", borderBottom:"1px solid #222", background:"#111", position:"sticky", top:0}}><div style={{fontWeight:800}}>⚡ Lorem Pro Tool</div><nav style={{display:"flex", gap:12, fontSize:12, opacity:0.7}}><a href="/" style={{color:"white", textDecoration:"none"}}>Home</a><a href="/about" style={{color:"white", textDecoration:"none"}}>About</a><a href="/privacy-policy" style={{color:"white", textDecoration:"none"}}>Privacy</a></nav></header>
      <div style={{maxWidth:680, margin:"0 auto", padding:16}}>
        <div style={{background:"#171717", borderRadius:24, padding:20, border:"1px solid #2a2a2a"}}>
          <h1 style={{fontSize:26, fontWeight:800}}>Fake Data Generator</h1>
          <p style={{opacity:0.6, fontSize:13}}>Generate in 8+ native scripts</p>
          <div style={{display:"grid", gridTemplateColumns:"1fr 100px", gap:10, marginTop:18}}>
            <select value={lang} onChange={e=>setLang(e.target.value)} style={{padding:14, borderRadius:14, background:"#262626", color:"white", border:"1px solid #333"}}>
              <option value="hi">🇮🇳 Hindi - राहुल शर्मा</option><option value="en">🇺🇸 English</option><option value="es">🇪🇸 Spanish - García</option><option value="fr">🇫🇷 French - Dupont</option><option value="de">🇩🇪 German - Müller</option><option value="ja">🇯🇵 Japanese - 田中</option><option value="bn">🇮🇳 Bengali</option><option value="ta">🇮🇳 Tamil</option>
            </select>
            <select value={count} onChange={e=>setCount(Number(e.target.value))} style={{padding:14, borderRadius:14, background:"#262626", color:"white", border:"1px solid #333"}}><option value="10">10 Rows</option><option value="25">25</option><option value="50">50</option></select>
          </div>
          <div style={{display:"flex", gap:8, marginTop:12}}><button onClick={generate} style={{...btnStyle("gen"), flex:1, padding:14, borderRadius:14, background:"white", color:"black", fontWeight:700, border:"none"}}>{isGenerating?"⏳ Generating...":"✨ Generate Data"}</button><button onClick={()=>setData([])} style={{...btnStyle("clear"), padding:14, borderRadius:14, background:"#262626", color:"white", border:"1px solid #333"}}>🗑️ Clear</button></div>
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:8, marginTop:12}}>{["json","csv","sql","txt"].map(f=><button key={f} onClick={()=>download(f)} style={{...btnStyle(f), padding:10, borderRadius:12, background:"#1f2937", color:"white", border:"1px solid #333", fontSize:12}}>⬇️ {f.toUpperCase()}</button>)}</div>

          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginTop:10}}>
            <button onClick={handleSave} style={{...btnStyle("save"), padding:10, borderRadius:12, background: saveMsg? "#22c55e" : "#262626", color: saveMsg? "black" : "white", border:"1px solid #333", fontWeight: saveMsg? 700 : 400}}>{saveMsg? "✅ Saved!" : "💾 Save"}</button>
            <button onClick={()=>{if(navigator.share) navigator.share({title:"Fake Data", url:location.href}); else {navigator.clipboard.writeText(location.href); alert("Link Copied!")}} } style={{padding:10, borderRadius:12, background:"#262626", color:"white", border:"1px solid #333"}}>📤 Share</button>
            <button onClick={()=>{navigator.clipboard.writeText(JSON.stringify(data,null,2)); setCopied(true); setActiveBtn("copy"); setTimeout(()=>{setCopied(false); setActiveBtn("");},2000);}} style={{...btnStyle("copy"), padding:10, borderRadius:12, background:copied?"#22c55e":"#262626", color:copied?"black":"white", border:"1px solid #333"}}>{copied?"✅ Copied!":"📋 Copy"}</button>
          </div>

          {savedData.length > 0 && (
            <div style={{marginTop:12, padding:12, background:"#1a2e1a", borderRadius:12, border:"1px solid #22c55e"}}>
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                <span style={{fontSize:12, color:"#4ade80"}}>💾 Last Saved: {savedData.length} rows - {savedData[0]?.name}</span>
                <div style={{display:"flex", gap:6}}><button onClick={()=>{ setData(savedData); window.scrollTo({top:0, behavior:"smooth"}); }} style={{fontSize:11, padding:"4px 10px", borderRadius:8, background:"#22c55e", color:"black", border:"none", fontWeight:700}}>Load</button><button onClick={()=>{ localStorage.removeItem("fakeData"); setSavedData([]); }} style={{fontSize:11, padding:"4px 8px", borderRadius:8, background:"#333", color:"white", border:"none"}}>X</button></div>
              </div>
            </div>
          )}

          <pre style={{marginTop:16, background:"black", borderRadius:16, padding:16, maxHeight:350, overflow:"auto", color:"#4ade80", fontSize:12, border:"1px solid #222", whiteSpace:"pre-wrap"}}>{data.length?JSON.stringify(data,null,2):"Click Generate..."}</pre>
        </div>
      </div>
      <footer style={{marginTop:32, padding:20, borderTop:"1px solid #222", background:"#111", textAlign:"center", opacity:0.5, fontSize:11}}>© 2026 Lorem Pro Tool</footer>
    </div>
  );
}
