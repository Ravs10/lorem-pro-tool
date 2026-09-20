"use client";
import React from "react";

const translations = {
  hi: { title:"नकली डेटा जनरेटर", sub:"डेवलपर्स के लिए 100% मुफ्त, असली हिंदी नामों के साथ", gen:"✨ जनरेट करें", clear:"साफ़ करें", save:"सेव करें", share:"शेयर करें", copy:"कॉपी करें", copied:"कॉपी हो गया!", generating:"बन रहा है...", rows:"पंक्तियाँ", download:"डाउनलोड", what:"यह टूल क्या है?", whatDesc:"यह टूल डेवलपर्स के लिए नकली लेकिन असली जैसा डेटा बनाता है - नाम, ईमेल, शहर, पता। सारा डेटा हिंदी, बांग्ला, तमिल सहित 8 भाषाओं में।" },
  en: { title:"Fake Data Generator", sub:"100% Free dummy data for developers in 8+ native scripts", gen:"✨ Generate", clear:"Clear", save:"Save", share:"Share", copy:"Copy", copied:"Copied!", generating:"Generating...", rows:"Rows", download:"Download", what:"What is this tool?", whatDesc:"Generate fake but realistic data for testing your apps. Supports Hindi, Bengali, Tamil, Japanese and more in native scripts." },
  bn: { title:"ভুয়া ডেটা জেনারেটর", sub:"ডেভেলপারদের জন্য বিনামূল্যে", gen:"✨ তৈরি করুন", clear:"মুছুন", save:"সেভ", share:"শেয়ার", copy:"কপি", copied:"কপি হয়েছে!", generating:"তৈরি হচ্ছে...", rows:"সারি", download:"ডাউনলোড", what:"এই টুল কি?", whatDesc:"পরীক্ষার জন্য ভুয়া ডেটা তৈরি করুন।" },
  ta: { title:"போலி தரவு ஜெனரேட்டர்", sub:"டெவலப்பர்களுக்கு இலவசம்", gen:"✨ உருவாக்கு", clear:"அழி", save:"சேமி", share:"பகிர்", copy:"நகல்", copied:"நகலெடுக்கப்பட்டது!", generating:"உருவாக்குகிறது...", rows:"வரிசைகள்", download:"பதிவிறக்க", what:"இந்த கருவி என்ன?", whatDesc:"சோதனைக்கு போலி தரவை உருவாக்கவும்." }
};

export default function FakeClient(){
  const [count,setCount]=React.useState(10);
  const [lang,setLang]=React.useState("hi");
  const [data,setData]=React.useState([]);
  const [copied,setCopied]=React.useState(false);
  const [isGenerating,setIsGenerating]=React.useState(false);

  const t = translations[lang] || translations["en"];

  const namesDB = {
    hi: ["राहुल शर्मा","पूजा वर्मा","अमन यादव","नेहा सिंह","अनन्या मिश्रा","काव्या दुबे","आरव गुप्ता","विवान पटेल","सुरेश चौरसिया","प्रिया पांडेय","अर्जुन सिंह","रोहित वर्मा","काजल यादव","साक्षी गुप्ता","दिव्या सिंह","मोहित शर्मा","निशा पटेल","दीपक कुमार","सुनीता देवी","रमेश कुमार"],
    en: ["John Doe","Emma Smith","Michael Brown","Sophia Wilson"],
    bn: ["অর্জুন দাস","মমতা ব্যানার্জী","রাহুল চ্যাটার্জী","শ্রাবন্তী দাস"],
    ta: ["குமார் முருகன்","லட்சுமி பிரியா","அர்ஜுன் ராஜ்","மீனா குமாரி"],
    es: ["Carlos García","María López"], fr: ["Jean Dupont","Marie Dubois"], de: ["Hans Müller"], ja: ["田中浩","佐藤雪"]
  };
  const citiesDB = {
    hi: ["लखनऊ","दिल्ली","मुंबई","पटना","कानपुर","वाराणसी","जयपुर"], en: ["New York","London"], bn: ["কলকাতা","ঢাকা"], ta: ["சென்னை","கோயம்புத்தூர்"], es: ["Madrid"], fr: ["Paris"], de: ["Berlin"], ja: ["東京"]
  };

  const generate = () => {
    setIsGenerating(true);
    setTimeout(()=>{
      let nList=[...(namesDB[lang]||namesDB.en)].sort(()=>0.5-Math.random());
      let cList=citiesDB[lang]||citiesDB.en;
      let arr=[]; for(let i=0;i<count;i++){ arr.push({ id:i+1, name:nList[i%nList.length], email:`user${Math.floor(1000+Math.random()*9000)}@testmail.com`, phone:`+91 9${Math.floor(100000000+Math.random()*900000000)}`, city:cList[Math.floor(Math.random()*cList.length)], address:`${cList[Math.floor(Math.random()*cList.length)]}, भारत` }); }
      setData(arr); setIsGenerating(false);
    },400);
  };
  React.useEffect(()=>{ generate(); },[lang]);

  const download = (type) => {
    let content= type==="json"? JSON.stringify(data,null,2) : "id,name,city\n"+data.map(d=>`${d.id},${d.name},${d.city}`).join("\n");
    const blob=new Blob([content],{type:"text/plain"}); const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=`fake-data.${type}`; a.click();
  };

  return (
    <div style={{background:"#0a0a0a", minHeight:"100vh", color:"white"}}>
      <header style={{display:"flex", justifyContent:"space-between", padding:"14px 16px", borderBottom:"1px solid #222", background:"#111", position:"sticky", top:0}}>
        <div style={{fontWeight:800}}>⚡ Lorem Pro Tool</div>
        <div style={{display:"flex", gap:12, fontSize:12, opacity:0.7}}><a href="/" style={{color:"white", textDecoration:"none"}}>Home</a><a href="/about" style={{color:"white", textDecoration:"none"}}>About</a><a href="/privacy-policy" style={{color:"white", textDecoration:"none"}}>Privacy</a></div>
      </header>
      <div style={{maxWidth:680, margin:"0 auto", padding:16}}>
        <div style={{background:"#171717", borderRadius:24, padding:20, border:"1px solid #2a2a2a"}}>
          <h1 style={{fontSize:26, fontWeight:800}}>{t.title}</h1>
          <p style={{opacity:0.6, fontSize:13}}>{t.sub}</p>
          <div style={{display:"grid", gridTemplateColumns:"1fr 100px", gap:10, marginTop:18}}>
            <select value={lang} onChange={e=>setLang(e.target.value)} style={{padding:14, borderRadius:14, background:"#262626", color:"white", border:"1px solid #333"}}>
              <option value="hi">🇮🇳 हिन्दी</option><option value="en">🇺🇸 English</option><option value="bn">🇮🇳 বাংলা</option><option value="ta">🇮🇳 தமிழ்</option><option value="es">🇪🇸 Español</option><option value="ja">🇯🇵 日本語</option>
            </select>
            <select value={count} onChange={e=>setCount(Number(e.target.value))} style={{padding:14, borderRadius:14, background:"#262626", color:"white", border:"1px solid #333"}}><option value="10">10 {t.rows}</option><option value="25">25</option><option value="50">50</option></select>
          </div>
          <div style={{display:"flex", gap:8, marginTop:12}}>
            <button onClick={generate} style={{flex:1, padding:14, borderRadius:14, background:"white", color:"black", fontWeight:700, border:"none"}}>{isGenerating? t.generating : t.gen}</button>
            <button onClick={()=>setData([])} style={{padding:14, borderRadius:14, background:"#262626", color:"white", border:"1px solid #333"}}>{t.clear}</button>
          </div>
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:8, marginTop:12}}>
            {["json","csv","sql","txt"].map(f=><button key={f} onClick={()=>download(f)} style={{padding:10, borderRadius:12, background:"#1f2937", color:"white", border:"1px solid #333", fontSize:12}}>{f.toUpperCase()}</button>)}
          </div>
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginTop:10}}>
            <button style={{padding:10, borderRadius:12, background:"#262626", color:"white", border:"1px solid #333"}}>{t.save}</button>
            <button style={{padding:10, borderRadius:12, background:"#262626", color:"white", border:"1px solid #333"}}>{t.share}</button>
            <button onClick={()=>{navigator.clipboard.writeText(JSON.stringify(data,null,2)); setCopied(true); setTimeout(()=>setCopied(false),2000);}} style={{padding:10, borderRadius:12, background:copied?"#22c55e":"#262626", color:copied?"black":"white", border:"1px solid #333"}}>{copied? t.copied : t.copy}</button>
          </div>
          <pre style={{marginTop:16, background:"black", borderRadius:16, padding:16, maxHeight:320, overflow:"auto", color:"#4ade80", fontSize:12, border:"1px solid #222", whiteSpace:"pre-wrap"}}>{data.length?JSON.stringify(data,null,2):"..."}</pre>
        </div>
      </div>
      <footer style={{marginTop:32, padding:20, borderTop:"1px solid #222", background:"#111", textAlign:"center", opacity:0.6, fontSize:12}}>© 2026 Lorem Pro Tool</footer>
    </div>
  );
}
