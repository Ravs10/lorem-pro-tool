"use client";
import { useState, useEffect } from "react";

const LANGS = [
["EN","English","USA"],["HI","Hindi","India"],["ES","Spanish","Spain"],["FR","French","France"],["DE","German","Germany"],["AR","Arabic","Saudi"],["PT","Portuguese","Portugal"],["RU","Russian","Russia"],["JA","Japanese","Japan"],["IT","Italian","Italy"],["BN","Bengali","Bangladesh"],["UR","Urdu","Pakistan"],["ZH","Chinese","China"],["KO","Korean","Korea"],["TR","Turkish","Turkey"],["NL","Dutch","Netherlands"],["PL","Polish","Poland"],["TH","Thai","Thailand"],["VI","Vietnamese","Vietnam"],["ID","Indonesian","Indonesia"],["MS","Malay","Malaysia"],["FA","Persian","Iran"],["TA","Tamil","India"],["TE","Telugu","India"],["ML","Malayalam","India"],["KN","Kannada","India"],["GU","Gujarati","India"],["MR","Marathi","India"],["PA","Punjabi","India"],["NE","Nepali","Nepal"],["SI","Sinhala","Sri Lanka"],["MY","Myanmar","Myanmar"],["KM","Khmer","Cambodia"],["LO","Lao","Laos"],["UK","Ukrainian","Ukraine"],["CS","Czech","Czech"],["EL","Greek","Greece"],["HE","Hebrew","Israel"],["HU","Hungarian","Hungary"],["RO","Romanian","Romania"],["SV","Swedish","Sweden"],["DA","Danish","Denmark"],["NO","Norwegian","Norway"],["FI","Finnish","Finland"],["BG","Bulgarian","Bulgaria"],["HR","Croatian","Croatia"],["SR","Serbian","Serbia"],["SK","Slovak","Slovakia"],["LT","Lithuanian","Lithuania"],["LV","Latvian","Latvia"],["ET","Estonian","Estonia"],["SQ","Albanian","Albania"],["BS","Bosnian","Bosnia"],["MK","Macedonian","Macedonia"],["SL","Slovenian","Slovenia"],["IS","Icelandic","Iceland"],["MT","Maltese","Malta"],["GA","Irish","Ireland"],["CY","Welsh","Wales"],["EU","Basque","Spain"],["CA","Catalan","Spain"],["GL","Galician","Spain"],["AF","Afrikaans","South Africa"],["AM","Amharic","Ethiopia"],["AZ","Azerbaijani","Azerbaijan"],["BE","Belarusian","Belarus"],["HY","Armenian","Armenia"],["KA","Georgian","Georgia"],["KK","Kazakh","Kazakhstan"],["KY","Kyrgyz","Kyrgyzstan"],["MN","Mongolian","Mongolia"],["UZ","Uzbek","Uzbekistan"],["SW","Swahili","Kenya"],["ZU","Zulu","South Africa"],["YO","Yoruba","Nigeria"]
];

const FULL_DB:any = {
HI:["Swasth jeevan ke liye roz yog jaroori hai.","Subah tehlne se sharir swasth rehta hai.","Santulit bhojan sehat ke liye jaroori hai.","Pani jyada peene se tajgi rehti hai.","Dhyan karne se tanav kam hota hai.","Hari sabjiyan khane se immunity badhti hai."],
EN:["Healthy life needs daily yoga.","Morning walk keeps body fit.","Balanced diet is essential.","Drinking water keeps you fresh.","Meditation reduces stress.","Green vegetables boost immunity."],
ES:["La vida saludable necesita yoga diario.","Caminar por la manana mantiene el cuerpo en forma.","Una dieta equilibrada es esencial.","Beber agua mantiene la frescura."],
FR:["Une vie saine necessite du yoga quotidien.","La marche matinale garde le corps en forme.","Une alimentation equilibree est essentielle."],
DE:["Gesundes Leben braucht tagliches Yoga.","Morgenspaziergang halt den Korper fit.","Ausgewogene Ernahrung ist wichtig."],
AR:["Al hayah al sihiyah tahtaj yoga yawmiya.","Al mashy al sabahi yuhafiz ala liyaqah."],
};

const getSentences = (l:string)=>{
  if(FULL_DB[l]) return FULL_DB[l];
  return [
    `${l} - Healthy life requires daily practice.`,
    `${l} - Morning exercise keeps body active.`,
    `${l} - Nutritious food is essential for growth.`,
    `${l} - Hydration maintains freshness and energy.`,
    `${l} - Mindfulness reduces anxiety and stress.`,
    `${l} - Natural vegetables improve immunity power.`,
    `${l} - Proper sleep cycle improves health.`,
    `${l} - Fresh fruits provide vitamins and strength.`,
  ];
};

export default function Page(){
  const [lang,setLang]=useState("HI"); const [mode,setMode]=useState<any>("paragraph"); const [count,setCount]=useState(3); const [output,setOutput]=useState(""); const [search,setSearch]=useState(""); const [copied,setCopied]=useState(false); const [menu,setMenu]=useState(false);
  const generate=()=>{
    const s=getSentences(lang).sort(()=>Math.random()-0.5);
    if(mode==="word"){ const all=s.join(" ").split(" "); let w=[]; for(let i=0;i<count*12;i++) w.push(all[i%all.length]); setOutput(w.join(" ")); }
    else if(mode==="sentence"){ let r=[]; for(let i=0;i<count;i++) r.push(s[i%s.length]); setOutput(r.join(" ")); }
    else if(mode==="list"){ let r=[]; for(let i=0;i<count;i++) r.push(`- ${s[i%s.length]}`); setOutput(r.join("\n")); }
    else{ let p=[]; for(let i=0;i<count;i++){ let chunk=[]; for(let j=0;j<3;j++) chunk.push(s[(i*3+j)%s.length]); p.push(chunk.join(" ")); } setOutput(p.join("\n\n")); }
  };
  useEffect(()=>{generate()},[lang,mode,count]);
  const filtered = LANGS.filter(([c,n,co])=> (c+" "+n+" "+co).toLowerCase().includes(search.toLowerCase()));
  const download = (t:string)=>{ let c=output; if(t==="UPPER") c=c.toUpperCase(); if(t==="LOWER") c=c.toLowerCase(); const b=new Blob([c]); const a=document.createElement("a"); a.href=URL.createObjectURL(b); a.download=`lorem-${lang}-${t}.txt`; a.click(); };

  return (
    <div style={{background:"#f6f7fb", color:"#111", minHeight:"100vh", fontFamily:"system-ui"}}>
      <header style={{position:"sticky", top:0, zIndex:100, background:"white", borderBottom:"1px solid #e2e8f0"}}>
        <div style={{maxWidth:1200, margin:"auto", padding:"10px 14px", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
          <div style={{display:"flex", alignItems:"center", gap:8}}><div style={{width:32, height:32, background:"linear-gradient(to right,#2563eb,#7c3aed)", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontWeight:900}}>L</div><b style={{fontSize:20}}>Lorem<span style={{color:"#2563eb"}}>Pro</span> Tool</b></div>
          <nav style={{display:"flex", gap:6}}><a href="#generator" style={{fontSize:11, fontWeight:800, background:"#f1f5f9", padding:"7px 10px", borderRadius:20, textDecoration:"none", color:"#111"}}>Generator</a><a href="#articles" style={{fontSize:11, fontWeight:800, background:"#f1f5f9", padding:"7px 10px", borderRadius:20, textDecoration:"none", color:"#111"}}>Articles</a><button onClick={()=>setMenu(!menu)} style={{background:"black", color:"white", borderRadius:20, padding:"7px 12px", fontSize:11, fontWeight:900, border:"none"}}>Menu</button></nav>
        </div>
      </header>

      <main style={{maxWidth:900, margin:"auto", padding:12}}>
        <div style={{background:"white", borderRadius:20, padding:14, border:"1px solid #e2e8f0", marginTop:8}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search language or country... e.g. Hindi, Japan" style={{width:"100%", padding:"14px", borderRadius:12, border:"2px solid #2563eb", fontWeight:700, fontSize:14}}/>
          {search && filtered.length===0 && <div style={{marginTop:10, background:"#fef2f2", color:"#dc2626", padding:10, borderRadius:10, fontSize:12, fontWeight:800, textAlign:"center"}}>Language / Country Not Found - Try Hindi, English, USA</div>}
        </div>

        <div id="generator" style={{background:"white", borderRadius:24, padding:16, border:"1px solid #e2e8f0", marginTop:12}}>
          <p style={{fontSize:11, fontWeight:900, color:"#94a3b8"}}>SELECT LANGUAGE ({filtered.length}/75)</p>
          <div style={{display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginTop:8, maxHeight:260, overflowY:"auto"}}>
            {filtered.map(([c,n,co])=><button key={c} onClick={()=>setLang(c)} style={{padding:"10px 4px", borderRadius:12, border:"1px solid #e2e8f0", fontWeight:900, fontSize:11, background: lang===c? "black":"white", color: lang===c? "white":"black"}}>{c}<br/><span style={{fontSize:8}}>{co}</span></button>)}
          </div>

          <div style={{display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:6, marginTop:12}}>
            {(["paragraph","sentence","word","list"] as const).map(m=><button key={m} onClick={()=>setMode(m)} style={{padding:10, borderRadius:10, fontSize:10, fontWeight:900, textTransform:"uppercase", background: mode===m? "#2563eb":"#f1f5f9", color: mode===m? "white":"black", border:"none"}}>{m}</button>)}
          </div>

          <div style={{display:"flex", gap:8, marginTop:10, alignItems:"center"}}><input type="range" min={1} max={15} value={count} onChange={e=>setCount(Number(e.target.value))} style={{flex:1}}/><span style={{border:"2px solid #e2e8f0", borderRadius:10, padding:"6px 12px", fontWeight:900}}>{count}</span></div>
          <button onClick={generate} style={{width:"100%", marginTop:10, background:"linear-gradient(to right,#2563eb,#7c3aed)", color:"white", fontWeight:900, padding:12, borderRadius:12, border:"none"}}>GENERATE {mode.toUpperCase()} - {lang}</button>

          <div style={{background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:14, padding:12, marginTop:12, whiteSpace:"pre-wrap", fontSize:14}}>{output}</div>

          <div style={{display:"flex", flexWrap:"wrap", gap:6, marginTop:10}}>
            <button onClick={()=>{navigator.clipboard.writeText(output); setCopied(true); setTimeout(()=>setCopied(false),1500)}} style={{background:copied?"#16a34a":"black", color:"white", padding:"10px 16px", borderRadius:20, fontWeight:900, border:"none", fontSize:12}}>{copied?"Copied":"Copy Text"}</button>
            {["TXT","HTML","MD","JSON","UPPER","LOWER","SLUG","LIST"].map(t=><button key={t} onClick={()=>download(t)} style={{background:"white", border:"1px solid #e2e8f0", padding:"8px 10px", borderRadius:20, fontSize:10, fontWeight:900}}>{t}</button>)}
          </div>
        </div>

        <a href="https://www.blogger.com" target="_blank" style={{display:"block", marginTop:12, background:"linear-gradient(90deg,#f97316,#ea580c)", color:"white", textAlign:"center", padding:"16px", borderRadius:16, fontWeight:900, textDecoration:"none", fontSize:14, width:"100%", boxShadow:"0 8px 20px rgba(249,115,22,.4)"}}>Move to Blogger - Full Width</a>

        <div style={{background:"white", border:"1px dashed #cbd5e1", borderRadius:12, padding:12, textAlign:"center", fontSize:11, color:"#94a3b8", marginTop:12}}>ADSENSE AD PLACE</div>
      </main>
    </div>
  )
}
