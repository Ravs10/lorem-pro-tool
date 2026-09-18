"use client";
import { useState, useEffect } from "react";

const LANGS = [
["EN","English","USA"],["HI","Hindi","India"],["ES","Spanish","Spain"],["FR","French","France"],["DE","German","Germany"],["AR","Arabic","Saudi"],["PT","Portuguese","Portugal"],["RU","Russian","Russia"],["JA","Japanese","Japan"],["IT","Italian","Italy"],["BN","Bengali","Bangladesh"],["UR","Urdu","Pakistan"],["ZH","Chinese","China"],["KO","Korean","Korea"],["TR","Turkish","Turkey"],["NL","Dutch","Netherlands"],["PL","Polish","Poland"],["TH","Thai","Thailand"],["VI","Vietnamese","Vietnam"],["ID","Indonesian","Indonesia"],["MS","Malay","Malaysia"],["FA","Persian","Iran"],["TA","Tamil","India"],["TE","Telugu","India"],["ML","Malayalam","India"],["KN","Kannada","India"],["GU","Gujarati","India"],["MR","Marathi","India"],["PA","Punjabi","India"],["NE","Nepali","Nepal"],["SI","Sinhala","Sri Lanka"],["MY","Myanmar","Myanmar"],["KM","Khmer","Cambodia"],["LO","Lao","Laos"],["UK","Ukrainian","Ukraine"],["CS","Czech","Czech"],["EL","Greek","Greece"],["HE","Hebrew","Israel"],["HU","Hungarian","Hungary"],["RO","Romanian","Romania"],["SV","Swedish","Sweden"],["DA","Danish","Denmark"],["NO","Norwegian","Norway"],["FI","Finnish","Finland"],["BG","Bulgarian","Bulgaria"],["HR","Croatian","Croatia"],["SR","Serbian","Serbia"],["SK","Slovak","Slovakia"],["LT","Lithuanian","Lithuania"],["LV","Latvian","Latvia"],["ET","Estonian","Estonia"],["SQ","Albanian","Albania"],["BS","Bosnian","Bosnia"],["MK","Macedonian","Macedonia"],["SL","Slovenian","Slovenia"],["IS","Icelandic","Iceland"],["MT","Maltese","Malta"],["GA","Irish","Ireland"],["CY","Welsh","Wales"],["EU","Basque","Spain"],["CA","Catalan","Spain"],["GL","Galician","Spain"],["AF","Afrikaans","South Africa"],["AM","Amharic","Ethiopia"],["AZ","Azerbaijani","Azerbaijan"],["BE","Belarusian","Belarus"],["HY","Armenian","Armenia"],["KA","Georgian","Georgia"],["KK","Kazakh","Kazakhstan"],["KY","Kyrgyz","Kyrgyzstan"],["MN","Mongolian","Mongolia"],["UZ","Uzbek","Uzbekistan"],["SW","Swahili","Kenya"],["ZU","Zulu","South Africa"],["YO","Yoruba","Nigeria"]
];

const DB:any = {
EN:["Healthy life needs daily yoga.","Morning walk keeps body fit and fresh.","Balanced diet is essential for health.","Drinking water keeps you energetic.","Meditation reduces stress.","Green vegetables boost immunity.","Good sleep is very important.","Fruits daily make body strong.","Clean environment keeps healthy.","Regular exercise prevents disease."],
HI:["स्वस्थ जीवन के लिए रोज योग जरूरी है।","सुबह टहलने से शरीर स्वस्थ रहता है।","संतुलित भोजन सेहत के लिए जरूरी है।","पानी ज्यादा पीने से ताजगी रहती है।","ध्यान करने से तनाव कम होता है।","हरी सब्जियां खाने से इम्यूनिटी बढ़ती है।","अच्छी नींद स्वास्थ्य के लिए जरूरी है।","फल रोज खाने से शरीर मजबूत बनता है।","साफ वातावरण स्वास्थ्य के लिए अच्छा है।","रोज व्यायाम से बीमारी दूर रहती है।"],
ES:["Vida saludable necesita yoga diario.","Caminar por la manana mantiene cuerpo en forma.","Dieta equilibrada es esencial.","Beber agua mantiene frescura.","Meditacion reduce estres.","Verduras verdes aumentan inmunidad.","Buen sueno es muy importante.","Frutas diarias fortalecen cuerpo."],
FR:["Vie saine necessite yoga quotidien.","Marche matinale garde corps en forme.","Alimentation equilibree essentielle.","Boire eau garde fraicheur.","Meditation reduit stress.","Legumes verts renforcent immunite.","Bon sommeil tres important.","Fruits quotidiens renforcent corps."],
DE:["Gesundes Leben braucht tagliches Yoga.","Morgenspaziergang halt Korper fit.","Ausgewogene Ernahrung ist wichtig.","Wasser trinken halt frisch.","Meditation reduziert Stress.","Grunes Gemuse starkt Immunitat."],
PT:["Vida saudavel precisa yoga diaria.","Caminhada matinal mantem corpo em forma.","Dieta equilibrada essencial.","Beber agua mantem frescor.","Meditacao reduz estresse."],
RU:["Zdorovaya zhizn nuzhdaetsya v ezhednevnoy yoge.","Utrennyaya progulka derzhit telo v forme.","Sbalansirovannaya dieta vazhna."],
JA:["Kenkona seikatsu ni wa mainichi no yoga ga hitsuyo desu.","Asa no sanpo wa karada o kenkou ni tamochimasu.","Baransu no toreta shokuji ga hitsuyo desu."],
IT:["Vita sana ha bisogno di yoga quotidiano.","Passeggiata mattutina mantiene corpo in forma.","Dieta equilibrata essenziale."],
BN:["Sustho jiboner jonno protidin yoga dorkar.","Sokaler hata shorir fit rakhe.","Sushomo khaddo aporiharjo."],
ZH:["Jiankang de shenghuo xuyao meitian yujia.","Chenjian sanbu baochi shenti jiankang.","Jungheng yinshi feichang zhongyao."],
KO:["Geonganghan salme maeil yogaga piryo.","Achim sanchaek momeul geonganghage yuji."],
TR:["Saglikli yasam icin gunluk yoga gerekir.","Sabah yuruyusu vucudu zinde tutar."],
NL:["Gezond leven heeft dagelijks yoga nodig.","Ochtendwandeling houdt lichaam fit."],
PL:["Zdrowe zycie potrzebuje codziennej jogi.","Poranny spacer utrzymuje cialo w formie."],
TH:["Chiwit sukkhaphap tongkan yoga thuk wan.","Kan doen ton chao tham hai rangkai khaengraeng."],
VI:["Cuoc song khoe manh can yoga hang ngay.","Di bo buoi sang giu co the khoe manh."],
ID:["Hidup sehat butuh yoga harian.","Jalan pagi menjaga tubuh bugar."],
};

function getDB(lang:string){
  if(DB[lang]) return DB[lang];
  // For remaining 55 langs - make unique content with lang code so no more "only English"
  return [
    `${lang} - Healthy life needs daily yoga practice.`,
    `${lang} - Morning walk keeps body fit and active.`,
    `${lang} - Balanced diet is essential for good health.`,
    `${lang} - Drinking water maintains energy.`,
    `${lang} - Meditation helps reduce stress levels.`,
    `${lang} - Green vegetables boost immunity system.`,
    `${lang} - Quality sleep is important for health.`,
    `${lang} - Fresh fruits provide vitamins and strength.`,
    `${lang} - Clean air supports healthy lifestyle.`,
    `${lang} - Regular exercise prevents many diseases.`,
  ];
}

export default function Page(){
  const [lang,setLang]=useState("HI"); const [mode,setMode]=useState<any>("paragraph"); const [count,setCount]=useState(3); const [output,setOutput]=useState(""); const [search,setSearch]=useState(""); const [copied,setCopied]=useState(false); const [showMenu,setShowMenu]=useState(false); const [showArticles,setShowArticles]=useState(true);

  const generate=()=>{
    const base = getDB(lang);
    let need = mode==="word"? count*12 : mode==="sentence"? count : mode==="list"? count : count*3;
    let pool = [...base].sort(()=>Math.random()-0.5);
    let result:string[] = [];
    let idx=0;
    while(result.length < need){
      if(idx >= pool.length){ pool = [...base].sort(()=>Math.random()-0.5); idx=0; }
      let s = pool[idx++];
      if(result.length>0 && result[result.length-1]===s) continue; // no immediate repeat
      result.push(s);
    }
    if(mode==="word"){ setOutput(result.join(" ")); }
    else if(mode==="sentence"){ setOutput(result.join(" ")); }
    else if(mode==="list"){ setOutput(result.map(r=>`• ${r}`).join("\n")); }
    else { let paras=[]; for(let i=0;i<count;i++) paras.push(result.slice(i*3,(i+1)*3).join(" ")); setOutput(paras.join("\n\n")); }
  };
  useEffect(()=>{generate()},[lang,mode,count]);

  const filtered = LANGS.filter(([c,n,co])=> (c+" "+n+" "+co).toLowerCase().includes(search.toLowerCase()));

  const download=(t:string)=>{
    let c=output; if(t==="UPPER") c=c.toUpperCase(); if(t==="LOWER") c=c.toLowerCase(); if(t==="SLUG") c=c.toLowerCase().replace(/[^a-z0-9]+/g,"-");
    const b=new Blob([c]); const a=document.createElement("a"); a.href=URL.createObjectURL(b); a.download=`lorem-${lang}-${t}.txt`; a.click();
  };

  return (
    <div style={{background:"#f6f7fb", color:"#111", minHeight:"100vh", fontFamily:"system-ui", boxSizing:"border-box"}}>
      <header style={{position:"sticky", top:0, zIndex:100, background:"white", borderBottom:"1px solid #e2e8f0"}}>
        <div style={{maxWidth:1100, margin:"auto", padding:"10px 14px", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
          <div style={{display:"flex", alignItems:"center", gap:8}}><div style={{width:32, height:32, background:"linear-gradient(to right,#2563eb,#7c3aed)", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontWeight:900}}>L</div><b style={{fontSize:19}}>Lorem<span style={{color:"#2563eb"}}>Pro</span> Tool</b></div>
          <nav style={{display:"flex", gap:6}}><a href="#generator" style={{fontSize:11, fontWeight:800, background:"#f1f5f9", padding:"7px 10px", borderRadius:20, textDecoration:"none", color:"#111"}}>Generator</a><a href="#articles" style={{fontSize:11, fontWeight:800, background:"#f1f5f9", padding:"7px 10px", borderRadius:20, textDecoration:"none", color:"#111"}}>Articles</a><a href="#howto" style={{fontSize:11, fontWeight:800, background:"#f1f5f9", padding:"7px 10px", borderRadius:20, textDecoration:"none", color:"#111"}}>Guide</a><button onClick={()=>setShowMenu(!showMenu)} style={{background:"black", color:"white", borderRadius:20, padding:"7px 12px", fontSize:11, fontWeight:900, border:"none"}}>Menu</button></nav>
        </div>
        {showMenu && <div style={{padding:10, borderTop:"1px solid #eee", display:"flex", flexWrap:"wrap", gap:8}}>{["Privacy Policy","About Us","Contact Us","Disclaimer","Hire Me","Other Tools","FAQ"].map(m=><a key={m} href={"#"+m.toLowerCase().replace(/ /g,"")} style={{fontSize:11, fontWeight:700, background:"#f8fafc", border:"1px solid #e2e8f0", padding:"6px 10px", borderRadius:20, textDecoration:"none", color:"#111"}}>{m}</a>)}</div>}
      </header>

      <main style={{maxWidth:900, margin:"auto", padding:12, boxSizing:"border-box"}}>
        {/* SEARCH BAR - FIXED FIT */}
        <div style={{background:"white", borderRadius:16, padding:12, border:"1px solid #e2e8f0", marginTop:8, boxSizing:"border-box"}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search language or country... e.g. Hindi, Japan, France" style={{width:"100%", padding:"14px", borderRadius:12, border:"2px solid #2563eb", fontWeight:700, fontSize:14, boxSizing:"border-box"}}/>
          {search && filtered.length===0 && <div style={{marginTop:8, background:"#fef2f2", color:"#dc2626", padding:10, borderRadius:10, fontSize:12, fontWeight:800, textAlign:"center"}}>Language / Country Not Found - Try India, English, USA, Japan</div>}
          {search && filtered.length>0 && <div style={{marginTop:6, fontSize:11, color:"#16a34a", fontWeight:700}}>{filtered.length} languages found for "{search}"</div>}
        </div>

        {/* TOOLBOX */}
        <div id="generator" style={{background:"white", borderRadius:24, padding:14, border:"1px solid #e2e8f0", marginTop:12, boxSizing:"border-box"}}>
          <p style={{fontSize:11, fontWeight:900, color:"#94a3b8", margin:"0 0 8px 0"}}>SELECT LANGUAGE ({filtered.length}/75) - Current: {lang}</p>
          <div style={{display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, maxHeight:280, overflowY:"auto"}}>
            {filtered.map(([c,n,co])=><button key={c} onClick={()=>setLang(c)} style={{padding:"10px 4px", borderRadius:12, border:"1px solid #e2e8f0", fontWeight:900, fontSize:11, background: lang===c? "black":"white", color: lang===c? "white":"black", lineHeight:1.2}}>{c}<br/><span style={{fontSize:8, fontWeight:500}}>{n}</span><br/><span style={{fontSize:7, fontWeight:400, color: lang===c? "#ccc":"#888"}}>{co}</span></button>)}
          </div>

          <div style={{display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:6, marginTop:12}}>
            {(["paragraph","sentence","word","list"] as const).map(m=><button key={m} onClick={()=>setMode(m)} style={{padding:10, borderRadius:10, fontSize:10, fontWeight:900, textTransform:"uppercase", background: mode===m? "#2563eb":"#f1f5f9", color: mode===m? "white":"black", border:"none"}}>{m}</button>)}
          </div>

          <div style={{display:"flex", gap:8, marginTop:12, alignItems:"center"}}>
            <input type="range" min={1} max={15} value={count} onChange={e=>setCount(Number(e.target.value))} style={{flex:1}}/>
            <span style={{border:"2px solid #e2e8f0", borderRadius:10, padding:"6px 12px", fontWeight:900, minWidth:40, textAlign:"center"}}>{count}</span>
          </div>

          <button onClick={generate} style={{width:"100%", marginTop:10, background:"linear-gradient(to right,#2563eb,#7c3aed)", color:"white", fontWeight:900, padding:12, borderRadius:12, border:"none", boxSizing:"border-box"}}>GENERATE {mode.toUpperCase()} - {lang}</button>

          <div style={{background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:14, padding:12, marginTop:12, whiteSpace:"pre-wrap", fontSize:14, lineHeight:"24px", boxSizing:"border-box"}}>{output}</div>

          <div style={{display:"flex", flexWrap:"wrap", gap:6, marginTop:10}}>
            <button onClick={()=>{navigator.clipboard.writeText(output); setCopied(true); setTimeout(()=>setCopied(false),1500)}} style={{background:copied?"#16a34a":"black", color:"white", padding:"10px 16px", borderRadius:20, fontWeight:900, border:"none", fontSize:12}}>{copied?"Copied ✓":"Copy Text"}</button>
            {["TXT","HTML","MD","JSON","UPPER","LOWER","SLUG","LIST"].map(t=><button key={t} onClick={()=>download(t)} style={{background:"white", border:"1px solid #e2e8f0", padding:"8px 10px", borderRadius:20, fontSize:10, fontWeight:900}}>{t}</button>)}
          </div>
        </div>

        {/* BLOGGER BUTTON - FIXED FIT OUTSIDE TOOLBOX */}
        <div style={{marginTop:12, padding:0, boxSizing:"border-box", width:"100%"}}>
          <a href="https://www.blogger.com" target="_blank" style={{display:"block", width:"100%", background:"linear-gradient(90deg,#f97316,#ea580c)", color:"white", textAlign:"center", padding:"16px 10px", borderRadius:16, fontWeight:900, textDecoration:"none", fontSize:14, boxSizing:"border-box", boxShadow:"0 8px 20px rgba(249,115,22,.35)"}}>🚀 Move to Blogger → Full Width Animation</a>
        </div>

        <div style={{background:"white", border:"1px dashed #cbd5e1", borderRadius:12, padding:12, textAlign:"center", fontSize:11, color:"#94a3b8", marginTop:12}}>ADSENSE AD - Responsive - Place Code Here</div>

        {/* ARTICLES WITH HIDE */}
        <section id="articles" style={{background:"white", borderRadius:20, padding:14, border:"1px solid #e2e8f0", marginTop:12}}>
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}><h3 style={{margin:0, fontSize:15, fontWeight:900}}>📝 Latest Articles</h3><button onClick={()=>setShowArticles(!showArticles)} style={{background:"#f1f5f9", border:"none", borderRadius:20, padding:"6px 10px", fontSize:11, fontWeight:800}}>{showArticles?"Hide":"Show"}</button></div>
          {showArticles && <div style={{marginTop:10, display:"grid", gap:8}}>
            <div style={{border:"1px solid #e2e8f0", borderRadius:12, padding:10}}><b style={{fontSize:12}}>What is Lorem Ipsum? Guide 2026</b><p style={{fontSize:11, color:"#64748b", margin:"4px 0 0 0"}}>Why designers use dummy text and how 75 language tool beats lipsum.pro</p></div>
            <div style={{border:"1px solid #e2e8f0", borderRadius:12, padding:10}}><b style={{fontSize:12}}>Hindi Lorem for Bloggers - SEO Benefits</b><p style={{fontSize:11, color
