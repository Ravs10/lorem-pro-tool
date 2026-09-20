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
    hi: ["राहुल शर्मा","पूजा वर्मा","अमन यादव","नेहा सिंह","अनन्या मिश्रा","काव्या दुबे","आरव गुप्ता","विवान पटेल","सुरेश चौरसिया","प्रिया पांडेय","अर्जुन सिंह","रोहित वर्मा","काजल यादव","साक्षी गुप्ता","दिव्या सिंह","मोहित शर्मा","निशा पटेल","दीपक कुमार","सुनीता देवी","रमेश कुमार"],
    en: ["John Smith","Emma Johnson","Michael Brown","Sophia Williams","James Jones","Olivia Davis","Robert Miller","Ava Wilson","William Moore","Isabella Taylor"],
    es: ["Carlos García","María López","José Martínez","Ana Rodríguez","Juan Pérez","Laura González","Miguel Sánchez","Sofía Fernández","Pablo Torres","Lucía Díaz","Javier Ruiz","Carmen Flores"],
    fr: ["Jean Dupont","Marie Dubois","Pierre Martin","Sophie Bernard","Luc Moreau","Camille Laurent","Antoine Girard","Julie Lefevre","François Rousseau","Isabelle Mercier","Louis Blanc","Émilie Fabre"],
    de: ["Hans Müller","Greta Schmidt","Klaus Weber","Anna Fischer","Max Wagner","Sophie Becker","Paul Hoffmann","Lena Schäfer","Fritz Bauer","Heidi Koch","Otto Richter","Clara Wolf"],
    ja: ["田中太郎","佐藤花子","鈴木一郎","高橋美咲","渡辺健太","山本さくら","中村翔太","小林優子","加藤誠","吉田愛"],
    bn: ["অর্জুন দাস","মমতা ব্যানার্জী","রাহুল চ্যাটার্জী","অনির্বাণ ঘোষ","শ্রাবন্তী দাস","সৌরভ গাঙ্গুলী"],
    ta: ["குமார் முருகன்","லட்சுமி பிரியா","அர்ஜுன் ராஜ்","மீனா குமாரி","சுரேஷ் குமார்","பிரியா ராமன்"]
  };
  const citiesDB = {
    hi: ["लखनऊ","दिल्ली","मुंबई","पटना","कानपुर","वाराणसी","जयपुर","भोपाल","इंदौर","प्रयागराज"],
    en: ["New York","London","Sydney","Los Angeles","Toronto","Chicago"],
    es: ["Madrid","Barcelona","Valencia","Sevilla","Zaragoza","Málaga","Bilbao","Granada"],
    fr: ["Paris","Lyon","Marseille","Toulouse","Nice","Nantes","Strasbourg","Lille"],
    de: ["Berlin","Munich","Hamburg","Frankfurt","Cologne","Stuttgart","Düsseldorf","Leipzig"],
    ja: ["東京","大阪","京都","名古屋","横浜","福岡","札幌","神戸"],
    bn: ["কলকাতা","ঢাকা","হাওড়া","শিলিগুড়ি"],
    ta: ["சென்னை","கோயம்புத்தூர்","மதுரை","திருச்சி","சேலம்"]
  };

  const generate = () => {
    setIsGenerating(true); setActiveBtn("gen");
    setTimeout(()=>{
      let nList=[...(namesDB[lang]||namesDB.en)].sort(()=>0.5-Math.random());
      let cList=citiesDB[lang]||citiesDB.en;
      let arr=[];
      for(let i=0;i<count;i++){
        let name = nList[i % nList.length];
        arr.push({
          id:i+1,
          name: name,
          email:`user${1000+i}@testmail.com`,
          phone:`+${lang==='en'?'1':lang==='es'?'34':lang==='fr'?'33':lang==='de'?'49':lang==='ja'?'81':'91'} 9${Math.floor(100000000+Math.random()*900000000)}`.slice(0,16),
          city:cList[Math.floor(Math.random()*cList.length)],
          country: lang==='hi'?'India':lang==='es'?'Spain':lang==='fr'?'France':lang==='de'?'Germany':lang==='ja'?'Japan':lang==='bn'?'Bangladesh':lang==='ta'?'India':'USA',
          address:`${cList[Math.floor(Math.random()*cList.length)]}`
        });
      }
      setData(arr); setIsGenerating(false); setTimeout(()=>setActiveBtn(""),300);
    },350);
  };
  React.useEffect(()=>{ generate(); },[lang]);

  const download = (type) => {
    if(!data.length) return;
    setActiveBtn(type); setTimeout(()=>setActiveBtn(""),300);
    let content="", ext=type;
    if(type==="json") content=JSON.stringify(data,null,2);
    if(type==="csv") content="id,name,email,phone,city,country\n"+data.map(d=>`${d.id},"${d.name}","${d.email}","${d.phone}","${d.city}","${d.country}"`).join("\n");
    if(type==="sql") content=data.map(d=>`INSERT INTO users (name,city,country) VALUES ('${d.name}','${d.city}','${d.country}');`).join("\n");
    if(type==="txt") content=data.map(d=>`${d.name} | ${d.city}, ${d.country}`).join("\n");
    const blob=new Blob([content],{type:"text/plain"}); const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=`fake-data-${lang}.${ext}`; a.click();
  };

  const btnStyle = (id) => ({ transition:"all 0.15s", transform: activeBtn===id? "scale(0.92)" : "scale(1)", cursor:"pointer" });

  return (
    <div style={{background:"#0a0a0a", minHeight:"100vh", color:"white"}}>
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
        <div style={{background:"#171717", borderRadius:24, padding:20, border:"1px solid #2a2a2a"}}>
          <h1 style={{fontSize:26, fontWeight:800}}>Fake Data Generator</h1>
          <p style={{opacity:0.6, fontSize:13, marginTop:4}}>Generate real native names - Select language below. UI stays in English.</p>

          <div style={{display:"grid", gridTemplateColumns:"1fr 100px", gap:10, marginTop:18}}>
            <select value={lang} onChange={e=>setLang(e.target.value)} style={{padding:14, borderRadius:14, background:"#262626", color:"white", border:"1px solid #333"}}>
              <option value="hi">🇮🇳 Hindi - राहुल शर्मा</option>
              <option value="en">🇺🇸 English - John Smith</option>
              <option value="es">🇪🇸 Spanish - Carlos García (Madrid)</option>
              <option value="fr">🇫🇷 French - Jean Dupont (Paris)</option>
              <option value="de">🇩🇪 German - Hans Müller (Berlin)</option>
              <option value="ja">🇯🇵 Japanese - 田中太郎 (東京)</option>
              <option value="bn">🇮🇳 Bengali - অর্জুন দাস</option>
              <option value="ta">🇮🇳 Tamil - குமார் முருகன்</option>
            </select>
            <select value={count} onChange={e=>setCount(Number(e.target.value))} style={{padding:14, borderRadius:14, background:"#262626", color:"white", border:"1px solid #333"}}>
              <option value="10">10 Rows</option><option value="25">25 Rows</option><option value="50">50 Rows</option><option value="100">100 Rows</option>
            </select>
          </div>

          <div style={{display:"flex", gap:8, marginTop:12}}>
            <button onClick={generate} style={{...btnStyle("gen"), flex:1, padding:14, borderRadius:14, background:"white", color:"black", fontWeight:700, border:"none"}}>{isGenerating?"⏳ Generating...":"✨ Generate Data"}</button>
            <button onClick={()=>{setData([]); setActiveBtn("clear"); setTimeout(()=>setActiveBtn(""),300);}} style={{...btnStyle("clear"), padding:14, borderRadius:14, background:"#262626", color:"white", border:"1px solid #333"}}>🗑️ Clear</button>
          </div>

          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:8, marginTop:12}}>
            {["json","csv","sql","txt"].map(f=><button key={f} onClick={()=>download(f)} style={{...btnStyle(f), padding:10, borderRadius:12, background:"#1f2937", color:"white", border:"1px solid #333", fontSize:12}}>⬇️ {f.toUpperCase()}</button>)}
          </div>

          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginTop:10}}>
            <button onClick={()=>{localStorage.setItem("fakeData",JSON.stringify(data)); setActiveBtn("save"); setTimeout(()=>setActiveBtn(""),800);}} style={{...btnStyle("save"), padding:10, borderRadius:12, background:"#262626", color:"white", border:"1px solid #333"}}>💾 Save</button>
            <button onClick={()=>{if(navigator.share) navigator.share({title:"Fake Data", url:location.href}); else {navigator.clipboard.writeText(location.href); alert("Link Copied!")}} } style={{padding:10, borderRadius:12, background:"#262626", color:"white", border:"1px solid #333"}}>📤 Share</button>
            <button onClick={()=>{navigator.clipboard.writeText(JSON.stringify(data,null,2)); setCopied(true); setActiveBtn("copy"); setTimeout(()=>{setCopied(false); setActiveBtn("");},2000);}} style={{...btnStyle("copy"), padding:10, borderRadius:12, background:copied?"#22c55e":"#262626", color:copied?"black":"white", border:"1px solid #333", fontWeight:copied?700:400}}>{copied?"✅ Copied!":"📋 Copy"}</button>
          </div>

          <pre style={{marginTop:16, background:"black", borderRadius:16, padding:16, maxHeight:350, overflow:"auto", color:"#4ade80", fontSize:12, border:"1px solid #222", whiteSpace:"pre-wrap", wordBreak:"break-word"}}>{data.length?JSON.stringify(data,null,2):"Click Generate..."}</pre>
        </div>

        <div style={{marginTop:24, background:"#171717", borderRadius:20, padding:20, border:"1px solid #222", lineHeight:1.7}}>
          <h2 style={{fontSize:20, fontWeight:700}}>What is Fake Data Generator?</h2>
          <p style={{opacity:0.8, fontSize:14, marginTop:10}}>Free tool for developers to generate 100% fake but realistic data in 8+ native scripts. Select Spanish to get Carlos García from Madrid, French to get Jean Dupont from Paris, German to get Hans Müller from Berlin, Hindi to get राहुल शर्मा from लखनऊ.</p>
          <h3 style={{marginTop:18, fontSize:16, fontWeight:700}}>Features</h3>
          <ul style={{opacity:0.8, fontSize:14, marginTop:8, paddingLeft:18}}><li>✅ Real Native Names & Cities for each language</li><li>✅ No Repetition - Shuffled</li><li>✅ JSON, CSV, SQL, TXT Download</li><li>✅ Save, Share, Animated Copy Button</li></ul>
          <h3 style={{marginTop:18, fontSize:16, fontWeight:700}}>FAQ</h3>
          <p style={{fontSize:14, marginTop:8}}><b>Q: Spanish/German was showing English?</b><br/><span style={{opacity:0.7}}>Fixed now! Spanish gives García, López, French gives Dupont, German gives Müller with native cities like Madrid, Paris, Berlin.</span></p>
          <p style={{fontSize:14, marginTop:10}}><b>Q: Is data real?</b><br/><span style={{opacity:0.7}}>No, 100% fake for testing only.</span></p>
        </div>
      </div>

      <footer style={{marginTop:32, padding:20, borderTop:"1px solid #222", background:"#111", textAlign:"center"}}>
        <div style={{display:"flex", justifyContent:"center", gap:18, marginBottom:10, fontSize:12}}>
          <a href="/about" style={{color:"#aaa", textDecoration:"none"}}>About</a>
          <a href="/privacy-policy" style={{color:"#aaa", textDecoration:"none"}}>Privacy</a>
          <a href="/contact" style={{color:"#aaa", textDecoration:"none"}}>Contact</a>
          <a href="/disclaimer" style={{color:"#aaa", textDecoration:"none"}}>Disclaimer</a>
        </div>
        <div style={{opacity:0.5, fontSize:11}}>© 2026 Lorem Pro Tool - Made in India 🇮🇳</div>
      </footer>
    </div>
  );
}
