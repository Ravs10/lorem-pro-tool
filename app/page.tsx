"use client";
import { useState, useEffect } from "react";

const LANGS = [
["EN","English","USA"],["HI","Hindi","India"],["ES","Spanish","Spain"],["FR","French","France"],["DE","German","Germany"],["AR","Arabic","Saudi"],["PT","Portuguese","Portugal"],["RU","Russian","Russia"],["JA","Japanese","Japan"],["IT","Italian","Italy"],["BN","Bengali","Bangladesh"],["UR","Urdu","Pakistan"],["ZH","Chinese","China"],["KO","Korean","Korea"],["TR","Turkish","Turkey"],["NL","Dutch","Netherlands"],["PL","Polish","Poland"],["TH","Thai","Thailand"],["VI","Vietnamese","Vietnam"],["ID","Indonesian","Indonesia"],["MS","Malay","Malaysia"],["FA","Persian","Iran"],["TA","Tamil","India"],["TE","Telugu","India"],["ML","Malayalam","India"],["KN","Kannada","India"],["GU","Gujarati","India"],["MR","Marathi","India"],["PA","Punjabi","India"],["NE","Nepali","Nepal"],["SI","Sinhala","Sri Lanka"],["MY","Myanmar","Myanmar"],["KM","Khmer","Cambodia"],["LO","Lao","Laos"],["UK","Ukrainian","Ukraine"],["CS","Czech","Czech"],["EL","Greek","Greece"],["HE","Hebrew","Israel"],["HU","Hungarian","Hungary"],["RO","Romanian","Romania"],["SV","Swedish","Sweden"],["DA","Danish","Denmark"],["NO","Norwegian","Norway"],["FI","Finnish","Finland"],["BG","Bulgarian","Bulgaria"],["HR","Croatian","Croatia"],["SR","Serbian","Serbia"],["SK","Slovak","Slovakia"],["LT","Lithuanian","Lithuania"],["LV","Latvian","Latvia"],["ET","Estonian","Estonia"],["SQ","Albanian","Albania"],["BS","Bosnian","Bosnia"],["MK","Macedonian","Macedonia"],["SL","Slovenian","Slovenia"],["IS","Icelandic","Iceland"],["MT","Maltese","Malta"],["GA","Irish","Ireland"],["CY","Welsh","Wales"],["EU","Basque","Spain"],["CA","Catalan","Spain"],["GL","Galician","Spain"],["AF","Afrikaans","South Africa"],["AM","Amharic","Ethiopia"],["AZ","Azerbaijani","Azerbaijan"],["BE","Belarusian","Belarus"],["HY","Armenian","Armenia"],["KA","Georgian","Georgia"],["KK","Kazakh","Kazakhstan"],["KY","Kyrgyz","Kyrgyzstan"],["MN","Mongolian","Mongolia"],["UZ","Uzbek","Uzbekistan"],["SW","Swahili","Kenya"],["ZU","Zulu","South Africa"],["YO","Yoruba","Nigeria"]
];

const FULL_DATA:any = {
EN:["Healthy life needs daily yoga.","Morning walk keeps body fit.","Balanced diet is essential.","Drinking water keeps you fresh.","Meditation reduces stress.","Green vegetables boost immunity.","Good sleep is very important.","Fruits daily make body strong.","Clean environment keeps healthy.","Regular exercise prevents disease."],
HI:["स्वस्थ जीवन के लिए रोज योग जरूरी है।","सुबह टहलने से शरीर स्वस्थ रहता है।","संतुलित भोजन सेहत के लिए जरूरी है।","पानी ज्यादा पीने से ताजगी रहती है।","ध्यान करने से तनाव कम होता है।","हरी सब्जियां खाने से इम्यूनिटी बढ़ती है।","अच्छी नींद स्वास्थ्य के लिए जरूरी है।","फल रोज खाने से शरीर मजबूत बनता है।","साफ वातावरण स्वास्थ्य के लिए अच्छा है।","रोज व्यायाम से बीमारी दूर रहती है।"],
ES:["Vida saludable necesita yoga diario.","Caminar por la manana mantiene cuerpo en forma.","Dieta equilibrada es esencial para salud.","Beber agua mantiene frescura y energia.","Meditacion reduce estres diario.","Verduras verdes aumentan inmunidad natural.","Buen sueno es muy importante.","Frutas diarias fortalecen cuerpo humano."],
FR:["Vie saine necessite yoga quotidien.","Marche matinale garde corps en forme.","Alimentation equilibree essentielle sante.","Boire eau garde fraicheur energie.","Meditation reduit stress quotidien.","Legumes verts renforcent immunite.","Bon sommeil tres important sante.","Fruits quotidiens renforcent corps."],
DE:["Gesundes Leben braucht tagliches Yoga.","Morgenspaziergang halt Korper fit und frisch.","Ausgewogene Ernahrung ist wichtig.","Wasser trinken halt frisch und energisch.","Meditation reduziert taglichen Stress.","Grunes Gemuse starkt Immun-system.","Guter Schlaf sehr wichtig.","Obst taglich macht stark."],
AR:["Hayat sihiya tahtaj yoga yawmi.","Mashi sabah yuhafiz jism fit.","Nizam ghizai mutawazin mohim jiddan.","Shurb ma yuhafiz nashaat.","Taammul yuqallil tawatur yawmi.","Khodar khadra tuqawwi manaa."],
PT:["Vida saudavel precisa yoga diaria.","Caminhada matinal mantem corpo em forma.","Dieta equilibrada essencial saude.","Beber agua mantem frescor energia.","Meditacao reduz estresse diario."],
RU:["Zdorovaya zhizn nuzhdaetsya yoge ezhednevno.","Utrennyaya progulka derzhit telo fit.","Sbalansirovannaya dieta vazhna zdorovye.","Voda sokhranyayet svezhest energii.","Meditatsiya snizhayet stress."],
JA:["Kenkona seikatsu mainichi yoga hitsuyo.","Asa sanpo karada fit tamotsu.","Baransu shokuji kenkou hissu.","Mizu nomu genki tamotsu.","Meiso sutoresu herasu."],
IT:["Vita sana ha bisogno yoga quotidiano.","Passeggiata mattutina mantiene corpo forma.","Dieta equilibrata essenziale salute.","Bere acqua mantiene freschezza energia.","Meditazione riduce stress giornaliero."],
BN:["Sustho jiboner jonno protidin yoga dorkar.","Sokaler hata shorir fit rakhe.","Sushomo khaddo swasther jonno joruri.","Besi jol pan sotej rakhe.","Dhyan chap komay."],
ZH:["Jiankang shenghuo xuyao meitian yujia.","Chenjian sanbu baochi shenti jiankang.","Jungheng yinshi feichang zhongyao.","Duo he shui baochi huoli."],
KO:["Geonganghan salme maeil yoga pilyo.","Achim sanchaek momeul fit yuji.","Gyunhyeong japsin jungyo geongang."],
TR:["Saglikli yasam icin gunluk yoga gerekir.","Sabah yuruyusu vucudu zinde tutar.","Dengeli beslenme saglik icin sart.","Su icmek enerji korur."],
};

function getSentences(lang:string){
  if(FULL_DATA[lang]) return FULL_DATA[lang];
  return [
    `${lang} - Healthy life needs daily yoga practice and discipline.`,
    `${lang} - Morning walk keeps body fit, mind fresh and active.`,
    `${lang} - Balanced diet with vitamins is essential for health.`,
    `${lang} - Drinking enough water maintains energy and freshness.`,
    `${lang} - Daily meditation reduces stress and improves focus.`,
    `${lang} - Green vegetables and natural foods boost immunity.`,
    `${lang} - Proper 8 hour sleep is very important for body.`,
    `${lang} - Fresh seasonal fruits provide strength and vitamins.`,
    `${lang} - Clean air and environment support healthy living.`,
    `${lang} - Regular health checkup prevents many future diseases.`
  ];
}

export default function Page(){
  const [lang,setLang]=useState("HI");
  const [mode,setMode]=useState<"paragraph"|"sentence"|"word"|"list">("paragraph");
  const [count,setCount]=useState(3);
  const [output,setOutput]=useState("");
  const [search,setSearch]=useState("");
  const [copied,setCopied]=useState(false);
  const [showMenu,setShowMenu]=useState(false);
  const [showArticles,setShowArticles]=useState(true);

  const generate=()=>{
    const base = getSentences(lang);
    let shuffled = [...base].sort(()=>0.5-Math.random());
    let needed = mode==="word"? count*12 : mode==="sentence" || mode==="list"? count : count*3;
    let res: string[] = [];
    let i=0;
    while(res.length < needed){
      if(i>=shuffled.length){ shuffled=[...base].sort(()=>0.5-Math.random()); i=0; }
      const line = shuffled[i++];
      if(res.length>0 && res[res.length-1]===line) continue;
      res.push(line);
    }
    if(mode==="word") setOutput(res.join(" "));
    else if(mode==="sentence") setOutput(res.join(" "));
    else if(mode==="list") setOutput(res.map(r=>`• ${r}`).join("\n"));
    else {
      let paras=[]; for(let p=0;p<count;p++) paras.push(res.slice(p*3,(p+1)*3).join(" ")); setOutput(paras.join("\n\n"));
    }
  };
  useEffect(()=>{generate()},[lang,mode,count]);

  const filtered = LANGS.filter(([c,n,co])=> (c+" "+n+" "+co).toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{background:"#f5f6fb", color:"#111", minHeight:"100vh", fontFamily:"system-ui", margin:0}}>
      <header style={{position:"sticky", top:0, zIndex:100, background:"white", borderBottom:"1px solid #e5e7eb"}}>
        <div style={{maxWidth:1100, margin:"0 auto", padding:"10px 12px", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
          <div style={{display:"flex", gap:8, alignItems:"center"}}><div style={{width:32, height:32, background:"#111", color:"white", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900}}>L</div><b style={{fontSize:18}}>LoremPro Tool</b></div>
          <nav style={{display:"flex", gap:6}}><a href="#generator" style={{background:"#f3f4f6", padding:"6px 10px", borderRadius:20, fontSize:11, fontWeight:800, textDecoration:"none", color:"#111"}}>Generator</a><a href="#articles" style={{background:"#f3f4f6", padding:"6px 10px", borderRadius:20, fontSize:11, fontWeight:800, textDecoration:"none", color:"#111"}}>Articles</a><button onClick={()=>setShowMenu(!showMenu)} style={{background:"black", color:"white", borderRadius:20, padding:"6px 12px", fontSize:11, fontWeight:900, border:"none"}}>Menu</button></nav>
        </div>
        {showMenu && <div style={{padding:10, borderTop:"1px solid #eee", display:"flex", flexWrap:"wrap", gap:6}}>{["Privacy Policy","About Us","Contact","Disclaimer","Hire Me","Other Tools"].map(m=><a key={m} href="#" style={{fontSize:11, background:"#f9fafb", border:"1px solid #e5e7eb", padding:"6px 10px", borderRadius:20, textDecoration:"none", color:"#111"}}>{m}</a>)}</div>}
      </header>

      <main style={{maxWidth:900, margin:"0 auto", padding:"12px", boxSizing:"border-box"}}>
        <div style={{background:"white", borderRadius:16, padding:12, border:"1px solid #e5e7eb", boxSizing:"border-box"}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search language or country... e.g. India, Japan, Spanish" style={{width:"100%", padding:"14px", borderRadius:12, border:"2px solid #4f46e5", fontWeight:700, fontSize:14, boxSizing:"border-box"}}/>
          {search && filtered.length===0 && <div style={{marginTop:8, background:"#fef2f2", color:"#b91c1c", padding:10, borderRadius:10, fontSize:12, fontWeight:800, textAlign:"center"}}>Language / Country Not Found</div>}
        </div>

        <div id="generator" style={{background:"white", borderRadius:20, padding:14, border:"1px solid #e5e7eb", marginTop:12}}>
          <div style={{fontSize:11, fontWeight:900, color:"#6b7280"}}>SELECT LANGUAGE ({filtered.length}/75) - ACTIVE: {lang}</div>
          <div style={{display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginTop:10, maxHeight:300, overflowY:"auto"}}>
            {filtered.map(([c,n,co])=><button key={c} onClick={()=>{setLang(c);}} style={{padding:"10px 4px", borderRadius:12, border:"1px solid #e5e7eb", background: lang===c?"black":"white", color: lang===c?"white":"black", fontWeight:900, fontSize:11, lineHeight:1.2}}>{c}<br/><span style={{fontSize:9, fontWeight:400}}>{n}</span></button>)}
          </div>

          <div style={{display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:6, marginTop:14}}>
            {(["paragraph","sentence","word","list"] as const).map(m=><button key={m} onClick={()=>setMode(m)} style={{padding:10, borderRadius:10, fontSize:10, fontWeight:900, background: mode===m?"#4f46e5":"#f3f4f6", color: mode===m?"white":"black", border:"none"}}>{m.toUpperCase()}</button>)}
          </div>

          <div style={{display:"flex", alignItems:"center", gap:10, marginTop:12}}><input type="range" min={1} max={12} value={count} onChange={e=>setCount(Number(e.target.value))} style={{flex:1}}/><div style={{border:"2px solid #e5e7eb", borderRadius:10, padding:"6px 14px", fontWeight:900}}>{count}</div></div>

          <button onClick={generate} style={{width:"100%", marginTop:12, background:"black", color:"white", padding:14, borderRadius:14, fontWeight:900, border:"none"}}>GENERATE {mode.toUpperCase()} - {lang}</button>

          <div style={{background:"#f9fafb", border:"1px solid #e5e7eb", borderRadius:14, padding:12, marginTop:12, whiteSpace:"pre-wrap", lineHeight:"24px", fontSize:14}}>{output}</div>

          <div style={{display:"flex", flexWrap:"wrap", gap:6, marginTop:10}}>
            <button onClick={()=>{navigator.clipboard.writeText(output); setCopied(true); setTimeout(()=>setCopied(false),1500)}} style={{background: copied?"#16a34a":"black", color:"white", padding:"10px 16px", borderRadius:20, fontWeight:900, border:"none", fontSize:12}}>{copied?"Copied ✓":"Copy Text"}</button>
            {["TXT","HTML","MD","JSON","UPPER","LOWER","SLUG","LIST"].map(t=><button key={t} onClick={()=>{let c=output; if(t==="UPPER") c=c.toUpperCase(); if(t==="LOWER") c=c.toLowerCase(); const b=new Blob([c]); const a=document.createElement("a"); a.href=URL.createObjectURL(b); a.download=`lorem-${t}.txt`; a.click();}} style={{background:"white", border:"1px solid #e5e7eb", padding:"8px 10px", borderRadius:20, fontSize:10, fontWeight:900}}>{t}</button>)}
          </div>
        </div>

        <div style={{marginTop:12}}>
          <a href="https://www.blogger.com" target="_blank" style={{display:"block", width:"100%", background:"#ff6a00", color:"white", textAlign:"center", padding:16, borderRadius:14, fontWeight:900, textDecoration:"none", boxSizing:"border-box"}}>Move to Blogger →</a>
        </div>

        <section id="articles" style={{background:"white", borderRadius:16, padding:14, border:"1px solid #e5e7eb", marginTop:12}}>
          <div style={{display:"flex", justifyContent:"space-between"}}><b style={{fontSize:14}}>Latest Articles</b><button onClick={()=>setShowArticles(!showArticles)} style={{fontSize:11, background:"#f3f4f6", border:"none", borderRadius:20, padding:"4px 10px"}}>{showArticles?"Hide":"Show"}</button></div>
          {showArticles && <div style={{marginTop:10, display:"grid", gap:8}}><div style={{border:"1px solid #eee
