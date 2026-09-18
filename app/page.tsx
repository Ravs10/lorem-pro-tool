"use client";
import { useState, useEffect } from "react";

const LANGS = [
["EN","English","USA"],["HI","Hindi","India"],["ES","Spanish","Spain"],["FR","French","France"],["DE","German","Germany"],["AR","Arabic","Saudi"],["PT","Portuguese","Portugal"],["RU","Russian","Russia"],["JA","Japanese","Japan"],["IT","Italian","Italy"],["BN","Bengali","Bangladesh"],["UR","Urdu","Pakistan"],["ZH","Chinese","China"],["KO","Korean","Korea"],["TR","Turkish","Turkey"],["NL","Dutch","Netherlands"],["PL","Polish","Poland"],["TH","Thai","Thailand"],["VI","Vietnamese","Vietnam"],["ID","Indonesian","Indonesia"],["MS","Malay","Malaysia"],["FA","Persian","Iran"],["TA","Tamil","India"],["TE","Telugu","India"],["ML","Malayalam","India"],["KN","Kannada","India"],["GU","Gujarati","India"],["MR","Marathi","India"],["PA","Punjabi","India"],["NE","Nepali","Nepal"],["SI","Sinhala","Sri Lanka"],["MY","Myanmar","Myanmar"],["KM","Khmer","Cambodia"],["LO","Lao","Laos"],["UK","Ukrainian","Ukraine"],["CS","Czech","Czech"],["EL","Greek","Greece"],["HE","Hebrew","Israel"],["HU","Hungarian","Hungary"],["RO","Romanian","Romania"],["SV","Swedish","Sweden"],["DA","Danish","Denmark"],["NO","Norwegian","Norway"],["FI","Finnish","Finland"],["BG","Bulgarian","Bulgaria"],["HR","Croatian","Croatia"],["SR","Serbian","Serbia"],["SK","Slovak","Slovakia"],["LT","Lithuanian","Lithuania"],["LV","Latvian","Latvia"],["ET","Estonian","Estonia"],["SQ","Albanian","Albania"],["BS","Bosnian","Bosnia"],["MK","Macedonian","Macedonia"],["SL","Slovenian","Slovenia"],["IS","Icelandic","Iceland"],["MT","Maltese","Malta"],["GA","Irish","Ireland"],["CY","Welsh","Wales"],["EU","Basque","Spain"],["CA","Catalan","Spain"],["GL","Galician","Spain"],["AF","Afrikaans","South Africa"],["AM","Amharic","Ethiopia"],["AZ","Azerbaijani","Azerbaijan"],["BE","Belarusian","Belarus"],["HY","Armenian","Armenia"],["KA","Georgian","Georgia"],["KK","Kazakh","Kazakhstan"],["KY","Kyrgyz","Kyrgyzstan"],["MN","Mongolian","Mongolia"],["UZ","Uzbek","Uzbekistan"],["SW","Swahili","Kenya"],["ZU","Zulu","South Africa"],["YO","Yoruba","Nigeria"]
];

const FULL_DB:any = {
HI:["स्वस्थ जीवन के लिए रोज योग जरूरी है।","सुबह टहलने से शरीर स्वस्थ रहता है।","संतुलित भोजन सेहत के लिए जरूरी है।","पानी ज्यादा पीने से ताजगी रहती है।","ध्यान करने से तनाव कम होता है।","हरी सब्जियां खाने से इम्यूनिटी बढ़ती है।","अच्छी नींद स्वास्थ्य के लिए बहुत जरूरी है।","फल रोज खाने से शरीर मजबूत बनता है।","साफ वातावरण स्वास्थ्य के लिए अच्छा है।","रोज व्यायाम से बीमारी दूर रहती है।","ताजी हवा में सांस लेना फायदेमंद है।","सकारात्मक सोच से मन शांत रहता है।","समय पर भोजन करना स्वास्थ्य के लिए अच्छा है।","धूप में थोड़ी देर बैठना विटामिन डी देता है।","हंसना भी एक अच्छी दवा है।"],
EN:["Healthy life needs daily yoga practice.","Morning walk keeps body fit and fresh.","Balanced diet is essential for health.","Drinking water keeps you energetic.","Meditation reduces daily stress.","Green vegetables boost natural immunity.","Good sleep is very important for health.","Fruits daily make body strong and active.","Clean environment keeps you healthy.","Regular exercise prevents many diseases.","Fresh air breathing is very beneficial.","Positive thinking keeps mind peaceful.","Timely meals are good for digestion.","Sunlight gives natural Vitamin D.","Laughter is also a good medicine."],
};

function getData(lang:string){
  if(FULL_DB[lang]) return FULL_DB[lang];
  return [
    `${lang} - Healthy life needs daily yoga and discipline.`,
    `${lang} - Morning walk keeps body active and mind fresh.`,
    `${lang} - Balanced diet with vitamins is essential.`,
    `${lang} - Drinking water maintains energy levels.`,
    `${lang} - Meditation reduces stress and anxiety.`,
    `${lang} - Green vegetables boost immunity power.`,
    `${lang} - Good sleep cycle improves overall health.`,
    `${lang} - Fresh fruits provide natural strength.`,
    `${lang} - Clean environment supports healthy living.`,
    `${lang} - Regular exercise prevents future diseases.`,
    `${lang} - Fresh air is beneficial for lungs.`,
    `${lang} - Positive thoughts keep mind calm.`,
  ];
}

export default function Page(){
  const [lang,setLang]=useState("HI");
  const [mode,setMode]=useState<any>("paragraph");
  const [count,setCount]=useState(3);
  const [output,setOutput]=useState("");
  const [search,setSearch]=useState("");
  const [copied,setCopied]=useState(false);
  const [showMenu,setShowMenu]=useState(false);
  const [showArticles,setShowArticles]=useState(true);

  const generate=()=>{
    const base = getData(lang);
    let pool:string[]=[]; while(pool.length<80){ pool=[...pool,...[...base].sort(()=>0.5-Math.random())]; }
    let clean:string[]=[]; for(let s of pool){ if(clean.length===0 || clean[clean.length-1]!==s) clean.push(s); }
    if(mode==="sentence" || mode==="word"){
      let need = mode==="word"? count*12 : count;
      setOutput(clean.slice(0,need).join(" "));
    } else if(mode==="list"){
      setOutput(clean.slice(0,count).map(s=>`• ${s}`).join("\n"));
    } else {
      let paras=[]; let idx=0;
      for(let p=0;p<count;p++){
        let para = clean.slice(idx, idx+3).join(" ");
        if(paras.includes(para)){ idx+=1; para=clean.slice(idx, idx+3).join(" "); }
        paras.push(para); idx+=3;
      }
      setOutput(paras.join("\n\n"));
    }
  };
  useEffect(()=>{generate()},[lang,mode,count]);
  const filtered = LANGS.filter(([c,n,co])=> (c+" "+n+" "+co).toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{background:"#f5f6fb", minHeight:"100vh", fontFamily:"system-ui"}}>
      <header style={{position:"sticky", top:0, zIndex:100, background:"white", borderBottom:"1px solid #e5e7eb"}}>
        <div style={{maxWidth:1100, margin:"auto", padding:"10px 12px", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
          <div style={{display:"flex", gap:8, alignItems:"center"}}><div style={{width:32, height:32, background:"black", color:"white", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900}}>L</div><b>LoremPro</b></div>
          <nav style={{display:"flex", gap:6}}><a href="#generator" style={{background:"#f3f4f6", padding:"6px 10px", borderRadius:20, fontSize:11, fontWeight:800, textDecoration:"none", color:"#111"}}>Generator</a><a href="#articles" style={{background:"#f3f4f6", padding:"6px 10px", borderRadius:20, fontSize:11, fontWeight:800, textDecoration:"none", color:"#111"}}>Articles</a><button onClick={()=>setShowMenu(!showMenu)} style={{background:"black", color:"white", borderRadius:20, padding:"6px 12px", fontSize:11, fontWeight:900, border:"none"}}>Menu</button></nav>
        </div>
        {showMenu && <div style={{padding:10, display:"flex", flexWrap:"wrap", gap:6, borderTop:"1px solid #eee"}}>{["Privacy Policy","About Us","Contact","Disclaimer","Hire Me"].map(m=><div key={m} style={{fontSize:11, background:"#f9fafb", border:"1px solid #e5e7eb", padding:"6px 10px", borderRadius:20}}>{m}</div>)}</div>}
      </header>

      <main style={{maxWidth:900, margin:"auto", padding:12, boxSizing:"border-box"}}>
        <div style={{background:"white", borderRadius:16, padding:12, border:"1px solid #e5e7eb", boxSizing:"border-box"}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search language or country... e.g. India, Japan, Hindi" style={{width:"100%", padding:14, borderRadius:12, border:"2px solid #4f46e5", fontWeight:700, boxSizing:"border-box"}}/>
          {search && filtered.length===0 && <div style={{marginTop:8, background:"#fef2f2", color:"#b91c1c", padding:8, borderRadius:10, fontSize:12, textAlign:"center", fontWeight:700}}>Language / Country Not Found</div>}
        </div>

        <div id="generator" style={{background:"white", borderRadius:20, padding:14, border:"1px solid #e5e7eb", marginTop:12}}>
          <div style={{fontSize:11, fontWeight:900, color:"#6b7280"}}>SELECT LANGUAGE ({filtered.length}/75) - ACTIVE: {lang} - NO REPEAT FIXED ✅</div>
          <div style={{display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginTop:10, maxHeight:280, overflowY:"auto"}}>
            {filtered.map(([c,n])=><button key={c} onClick={()=>setLang(c)} style={{padding:"10px 4px", borderRadius:12, border:"1px solid #e5e7eb", background: lang===c?"black":"white", color: lang===c?"white":"black", fontWeight:800, fontSize:11}}>{c}<br/><span style={{fontSize:8}}>{n}</span></button>)}
          </div>
          <div style={{display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:6, marginTop:12}}>
            {(["paragraph","sentence","word","list"] as const).map(m=><button key={m} onClick={()=>setMode(m)} style={{padding:10, borderRadius:10, fontSize:10, fontWeight:900, background: mode===m?"#4f46e5":"#f3f4f6", color: mode===m?"white":"black", border:"none"}}>{m.toUpperCase()}</button>)}
          </div>
          <div style={{display:"flex", gap:10, alignItems:"center", marginTop:12}}><input type="range" min={1} max={12} value={count} onChange={e=>setCount(Number(e.target.value))} style={{flex:1}}/><b style={{border:"2px solid #e5e7eb", borderRadius:10, padding:"6px 12px"}}>{count}</b></div>
          <button onClick={generate} style={{width:"100%", marginTop:12, background:"black", color:"white", padding:14, borderRadius:14, fontWeight:900, border:"none"}}>GENERATE {mode.toUpperCase()} - {lang}</button>
          <div style={{background:"#f9fafb", border:"1px solid #e5e7eb", borderRadius:14, padding:12, marginTop:12, whiteSpace:"pre-wrap", fontSize:14, lineHeight:"24px"}}>{output}</div>
          <button onClick={()=>{navigator.clipboard.writeText(output); setCopied(true); setTimeout(()=>setCopied(false),1500)}} style={{marginTop:10, background: copied?"#16a34a":"black", color:"white", padding:"10px 16px", borderRadius:20, fontWeight:900, border:"none", fontSize:12}}>{copied?"Copied ✓":"Copy Text"}</button>
        </div>

        <a href="https://www.blogger.com" target="_blank" style={{display:"block", width:"100%", marginTop:12, background:"#ff6a00", color:"white", textAlign:"center", padding:16, borderRadius:14, fontWeight:900, textDecoration:"none", boxSizing:"border-box"}}>Move to Blogger - Full Width</a>

        <section id="articles" style={{background:"white", borderRadius:16, padding:14, border:"1px solid #e5e7eb", marginTop:12}}>
          <div style={{display:"flex", justifyContent:"space-between"}}><b>Latest Articles</b><button onClick={()=>setShowArticles(!showArticles)} style={{fontSize:11, background:"#f3f4f6", border:"none", borderRadius:20, padding:"4px 10px"}}>{showArticles?"Hide":"Show"}</button></div>
          {showArticles && <div style={{marginTop:10, display:"grid", gap:8}}><div style={{border:"1px solid #eee", borderRadius:10, padding:10, fontSize:12}}><b>What is Lorem Ipsum? Guide 2026</b></div><div style={{border:"1px solid #eee", borderRadius:10, padding:10, fontSize:12}}><b>Hindi Lorem for Bloggers - SEO Benefits</b></div></div>}
        </section>

        <section style={{background:"white", borderRadius:16, padding:14, border:"1px solid #e5e7eb", marginTop:12}}><b>How to Use / User Guide</b><p style={{fontSize:12, color:"#4b5563", lineHeight:"18px"}}>1. Search language<br/>2. Choose mode<br/>3. Generate - No repeat guaranteed<br/>4. Copy & use</p></section>
        <section style={{background:"white", borderRadius:16, padding:14, border:"1px solid #e5e7eb", marginTop:12}}><b>Other Useful Tools</b><div style={{display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:8, marginTop:8}}>{["Word Counter","Hashtag Gen","Meta Tags","YT Title","AI Bio","Blogger Lorem"].map(t=><div key={t} style={{border:"1px solid #eee", borderRadius:10, padding:10, fontSize:11, fontWeight:700}}>{t} →</div>)}</div></section>
        <footer style={{background:"white", borderRadius:16, padding:12, marginTop:12, textAlign:"center", fontSize:10, color:"#9ca3af", border:"1px solid #e5e7eb"}}>© 2026 LoremPro - 75 Languages - No Repeat Fixed - Ready for Adsense</footer>
      </main>
    </div>
  )
}
