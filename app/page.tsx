"use client";
import { useState, useEffect } from "react";

const LANGS = [
["EN","🇺🇸","English","USA"],["HI","🇮🇳","Hindi","India"],["ES","🇪🇸","Spanish","Spain"],["FR","🇫🇷","French","France"],["DE","🇩🇪","German","Germany"],["AR","🇸🇦","Arabic","Saudi"],["PT","🇵🇹","Portuguese","Portugal"],["RU","🇷🇺","Russian","Russia"],["JA","🇯🇵","Japanese","Japan"],["IT","🇮🇹","Italian","Italy"],["BN","🇧🇩","Bengali","Bangladesh"],["UR","🇵🇰","Urdu","Pakistan"],["ZH","🇨🇳","Chinese","China"],["KO","🇰🇷","Korean","Korea"],["TR","🇹🇷","Turkish","Turkey"],["NL","🇳🇱","Dutch","Netherlands"],["PL","🇵🇱","Polish","Poland"],["TH","🇹🇭","Thai","Thailand"],["VI","🇻🇳","Vietnamese","Vietnam"],["ID","🇮🇩","Indonesian","Indonesia"],["MS","🇲🇾","Malay","Malaysia"],["FA","🇮🇷","Persian","Iran"],["TA","🇮🇳","Tamil","India"],["TE","🇮🇳","Telugu","India"],["ML","🇮🇳","Malayalam","India"],["KN","🇮🇳","Kannada","India"],["GU","🇮🇳","Gujarati","India"],["MR","🇮🇳","Marathi","India"],["PA","🇮🇳","Punjabi","India"],["NE","🇳🇵","Nepali","Nepal"],["SI","🇱🇰","Sinhala","Sri Lanka"],["MY","🇲🇲","Myanmar","Myanmar"],["KM","🇰🇭","Khmer","Cambodia"],["LO","🇱🇦","Lao","Laos"],["UK","🇺🇦","Ukrainian","Ukraine"],["CS","🇨🇿","Czech","Czech"],["EL","🇬🇷","Greek","Greece"],["HE","🇮🇱","Hebrew","Israel"],["HU","🇭🇺","Hungarian","Hungary"],["RO","🇷🇴","Romanian","Romania"],["SV","🇸🇪","Swedish","Sweden"],["DA","🇩🇰","Danish","Denmark"],["NO","🇳🇴","Norwegian","Norway"],["FI","🇫🇮","Finnish","Finland"],["BG","🇧🇬","Bulgarian","Bulgaria"],["HR","🇭🇷","Croatian","Croatia"],["SR","🇷🇸","Serbian","Serbia"],["SK","🇸🇰","Slovak","Slovakia"],["LT","🇱🇹","Lithuanian","Lithuania"],["LV","🇱🇻","Latvian","Latvia"],["ET","🇪🇪","Estonian","Estonia"],["SQ","🇦🇱","Albanian","Albania"],["BS","🇧🇦","Bosnian","Bosnia"],["MK","🇲🇰","Macedonian","Macedonia"],["SL","🇸🇮","Slovenian","Slovenia"],["IS","🇮🇸","Icelandic","Iceland"],["MT","🇲🇹","Maltese","Malta"],["GA","🇮🇪","Irish","Ireland"],["CY","🏴󠁧󠁢󠁷󠁬󠁳󠁿","Welsh","Wales"],["EU","🇪🇸","Basque","Spain"],["CA","🇪🇸","Catalan","Spain"],["GL","🇪🇸","Galician","Spain"],["AF","🇿🇦","Afrikaans","South Africa"],["AM","🇪🇹","Amharic","Ethiopia"],["AZ","🇦🇿","Azerbaijani","Azerbaijan"],["BE","🇧🇾","Belarusian","Belarus"],["HY","🇦🇲","Armenian","Armenia"],["KA","🇬🇪","Georgian","Georgia"],["KK","🇰🇿","Kazakh","Kazakhstan"],["KY","🇰🇬","Kyrgyz","Kyrgyzstan"],["MN","🇲🇳","Mongolian","Mongolia"],["UZ","🇺🇿","Uzbek","Uzbekistan"],["SW","🇰🇪","Swahili","Kenya"],["ZU","🇿🇦","Zulu","South Africa"],["YO","🇳🇬","Yoruba","Nigeria"]
];
const DB:any = {HI:["स्वस्थ जीवन के लिए रोज योग जरूरी है।","सुबह टहलने से शरीर स्वस्थ रहता है।","संतुलित भोजन सेहत के लिए जरूरी है।","पानी ज्यादा पीने से ताजगी रहती है।"], EN:["Healthy life needs daily yoga.","Morning walk keeps body fit.","Balanced diet is essential.","Drinking more water keeps fresh."]};
const getSentences = (lang:string)=> DB[lang] || [`${lang} - Healthy life needs daily exercise.`,`${lang} - Morning walk keeps body fit.`,`${lang} - Balanced diet is important.`,`${lang} - Drink more water for energy.`,`${lang} - Meditation reduces stress.`,`${lang} - Vegetables boost immunity.`];

export default function Page(){
  const [lang,setLang]=useState("HI"); const [mode,setMode]=useState<"paragraph"|"sentence"|"word"|"list">("paragraph"); const [count,setCount]=useState(3); const [output,setOutput]=useState(""); const [search,setSearch]=useState(""); const [showMenu,setShowMenu]=useState(false); const [showArticles,setShowArticles]=useState(true); const [copied,setCopied]=useState(false);
  const generate=()=>{
    const s=getSentences(lang);
    if(mode==="word"){ const w=s.join(" ").split(" "); let r=[]; for(let i=0;i<count*12;i++) r.push(w[i%w.length]); setOutput(r.join(" "));}
    else if(mode==="sentence"){ let r=[]; for(let i=0;i<count;i++) r.push(s[i%s.length]); setOutput(r.join(" "));}
    else if(mode==="list"){ let r=[]; for(let i=0;i<count;i++) r.push(`• ${s[i%s.length]}`); setOutput(r.join("\n"));}
    else{ let p=[]; for(let i=0;i<count;i++){ let t=[]; for(let j=0;j<3;j++) t.push(s[(i*3+j)%s.length]); p.push(t.join(" ")); } setOutput(p.join("\n\n")); }
  };
  useEffect(()=>{generate()},[lang,mode,count]);
  const filtered = LANGS.filter(([c,f,n,co])=> (c+""+n+""+co).toLowerCase().includes(search.toLowerCase()));

  const ARTICLES = [
    {title:"What is Lorem Ipsum? Complete Guide 2026", date:"Sep 2026", desc:"Learn why designers use dummy text and how our 75 language tool beats lipsum.pro"},
    {title:"Hindi Lorem Ipsum for Bloggers - SEO Benefits", date:"Sep 2026", desc:"Real Hindi content ranks better than fake lorem. How to use it."},
    {title:"How to Use Dummy Text for Website Design", date:"Aug 2026", desc:"Step by step guide for beginners."}
  ];

  return (
    <div style={{background:"#f8fafc", color:"#111", minHeight:"100vh", fontFamily:"system-ui"}}>
      {/* HEADER + NAV */}
      <header style={{position:"sticky", top:0, background:"white", borderBottom:"1px solid #e2e8f0", zIndex:100}}>
        <div style={{maxWidth:1200, margin:"auto", padding:"10px 16px", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
          <b style={{fontSize:22}}>Lorem<span style={{color:"#2563eb"}}>Pro</span> Tool</b>
          <nav style={{display:"flex", gap:12, alignItems:"center"}}>
            <a href="#generator" style={{fontSize:12, fontWeight:800, textDecoration:"none", color:"#111"}}>Generator</a>
            <a href="#articles" style={{fontSize:12, fontWeight:800, textDecoration:"none", color:"#111"}}>Articles</a>
            <a href="#howto" style={{fontSize:12, fontWeight:800, textDecoration:"none", color:"#111"}}>Guide</a>
            <button onClick={()=>setShowMenu(!showMenu)} style={{background:"black", color:"white", padding:"8px 14px", borderRadius:20, fontSize:12, fontWeight:900, border:"none"}}>☰ Menu</button>
          </nav>
        </div>
        {showMenu && (
          <div style={{background:"#fff", borderTop:"1px solid #eee", padding:12, display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:8}}>
            {["Privacy Policy","Terms & Conditions","About Us","Contact Us","Disclaimer","Hire Me"].map(m=><a key={m} href={`#${m.toLowerCase().replace(/ /g,"")}`} style={{fontSize:12, fontWeight:700, padding:8, background:"#f8fafc", borderRadius:8, textDecoration:"none", color:"#111"}}>{m}</a>)}
          </div>
        )}
      </header>

      {/* ADSENSE TOP */}
      <div style={{maxWidth:1200, margin:"10px auto", background:"#fff", border:"1px dashed #cbd5e1", borderRadius:12, padding:18, textAlign:"center", fontSize:11, color:"#94a3b8"}}>ADSENSE TOP BANNER - 728x90 - Place your Google Ad Code Here</div>

      <main style={{maxWidth:1200, margin:"auto", padding:16, display:"grid", gridTemplateColumns:"1fr", gap:16}}>

        {/* HERO + GENERATOR */}
        <section id="generator" style={{background:"white", borderRadius:24, padding:18, border:"1px solid #e2e8f0"}}>
          <h1 style={{fontSize:32, fontWeight:900, margin:0, textAlign:"center"}}>Real Lorem Ipsum - 75 Languages Tool</h1>
          <p style={{textAlign:"center", color:"#64748b", fontSize:12, marginTop:6}}>Beats lipsum.pro - Search any language/country instantly</p>

          {/* LANGUAGE SEARCH BAR */}
          <div style={{marginTop:14, position:"relative"}}>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Search language or country... e.g. India, Japan, French, Hindi..." style={{width:"100%", padding:"14px 16px", borderRadius:14, border:"2px solid #2563eb", fontSize:14, fontWeight:700}}/>
            {search && <button onClick={()=>setSearch("")} style={{position:"absolute", right:10, top:12, background:"#f1f5f9", border:"none", borderRadius:20, padding:"6px 10px", fontSize:11}}>Clear ✕</button>}
          </div>

          <p style={{fontSize:11, fontWeight:900, color:"#94a3b8", marginTop:12}}>LANGUAGES ({filtered.length}/75) - {lang} SELECTED</p>
          <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(80px,1fr))", gap:7, marginTop:8, maxHeight:220, overflowY:"auto"}}>
            {filtered.map(([c,f,n,co])=><button key={c} onClick={()=>setLang(c)} style={{padding:"10px 2px", borderRadius:12, border:"1px solid #e2e8f0", fontWeight:900, fontSize:11, background: lang===c? "black":"white", color: lang===c? "white":"black"}}>{f} {c}<br/><span style={{fontSize:8, fontWeight:400}}>{co}</span></button>)}
          </div>

          <div style={{display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, marginTop:14}}>
            {(["paragraph","sentence","word","list"] as const).map(m=><button key={m} onClick={()=>setMode(m)} style={{padding:10, borderRadius:12, fontWeight:900, fontSize:10, textTransform:"uppercase", background: mode===m? "#2563eb":"#f1f5f9", color: mode===m? "white":"black", border:"none"}}>{m}</button>)}
          </div>

          <div style={{display:"flex", gap:8, marginTop:12, alignItems:"center"}}>
            <input type="range" min={1} max={15} value={count} onChange={e=>setCount(Number(e.target.value))} style={{flex:1}}/>
            <input type="number" value={count} onChange={e=>setCount(Number(e.target.value))} style={{border:"2px solid #e2e8f0", borderRadius:10, width:60, textAlign:"center", fontWeight:900, padding:6}}/>
          </div>
          <button onClick={generate} style={{width:"100%", marginTop:10, background:"linear-gradient(to right,#2563eb,#7c3aed)", color:"white", fontWeight:900, padding:13, borderRadius:14, border:"none"}}>GENERATE {mode.toUpperCase()} ✨</button>

          <div style={{background:"#f8fafc", borderRadius:14, padding:14, marginTop:12, border:"1px solid #e2e8f0", whiteSpace:"pre-wrap"}}>{output}</div>
          <div style={{display:"flex", gap:8, marginTop:10}}>
            <button onClick={()=>{navigator.clipboard.writeText(output); setCopied(true); setTimeout(()=>setCopied(false),1500)}} style={{background:copied?"#16a34a":"black", color:"white", padding:"10px 16px", borderRadius:20, fontWeight:900, border:"none", fontSize:12}}>{copied?"Copied ✓":"Copy Text"}</button>
            <a href="https://www.blogger.com" target="_blank" style={{background:"#f97316", color:"white", padding:"10px 16px", borderRadius:20, fontWeight:900, textDecoration:"none", fontSize:12}}>Move to Blogger →</a>
          </div>
        </section>

        {/* ADSENSE IN ARTICLE */}
        <div style={{background:"#fff", border:"1px dashed #cbd5e1", borderRadius:12, padding:18, textAlign:"center", fontSize:11, color:"#94a3b8"}}>ADSENSE IN-ARTICLE AD - Place Ad Code Here - Responsive</div>

        {/* ARTICLES SECTION WITH HIDE */}
        <section id="articles" style={{background:"white", borderRadius:24, padding:18, border:"1px solid #e2e8f0"}}>
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
            <h2 style={{fontWeight:900, fontSize:18, margin:0}}>📝 Latest Articles - नाम Menu</h2>
            <button onClick={()=>setShowArticles(!showArticles)} style={{background:"#f1f5f9", border:"none", borderRadius:20, padding:"6px 12px", fontSize:11, fontWeight:800}}>{showArticles? "Hide ↑":"Show ↓"}</button>
          </div>
          {showArticles && (
            <div style={{marginTop:12, display:"grid", gap:10}}>
              {ARTICLES.map((a,i)=><div key={i} style={{border:"1px solid #e2e8f0", borderRadius:14, padding:12}}>
                <b style={{fontSize:13}}>{a.title}</b><span style={{fontSize:10, background:"#dbeafe", color:"#1e40af", padding:"2px 8px", borderRadius:10, marginLeft:8}}>{a.date}</span>
                <p style={{fontSize:11, color:"#64748b", marginTop:4}}>{a.desc}</p>
                <button style={{marginTop:6, background:"black", color:"white", borderRadius:20, padding:"5px 10px", fontSize:10, fontWeight:800, border:"none"}}>Read More →</button>
              </div>)}
              <div style={{background:"#f0f9ff", border:"1px dashed #7dd3fc", borderRadius:12, padding:12, textAlign:"center", fontSize:11}}>➕ New Article Auto Show Here When You Post - Just add to ARTICLES array</div>
            </div>
          )}
        </section>

        {/* HOW TO USE */}
        <section id="howto" style={{background:"white", borderRadius:24, padding:18, border:"1px solid #e2e8f0"}}>
          <h2 style={{fontWeight:900, fontSize:18, margin:0}}>How to Use / User Guide</h2>
          <p style={{fontSize:12, color:"#475569", lineHeight:"20px", marginTop:8}}>1. <b>Search Language</b> - Type country name like India, Japan in search bar.<br/>2. <b>Select Type</b> - Paragraph / Sentence / Word / List.<br/>3. <b>Generate & Copy</b> - Use in Blogger, WordPress for SEO.</p>
        </section>

        {/* NECESSARY PAGES */}
        <section style={{display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:12}}>
          <div id="privacypolicy" style={{background:"white", borderRadius:16, padding:14, border:"1px solid #e2e8f0"}}><b style={{fontSize:13}}>Privacy Policy</b><p style={{fontSize:11, color:"#64748b", marginTop:4}}>We don't collect personal data. Google Adsense may use cookies.</p></div>
          <div id="aboutus" style={{background:"white", borderRadius:16, padding:14, border:"1px solid #e2e8f0"}}><b style={{fontSize:13}}>About Us</b><p style={{fontSize:11, color:"#64748b", marginTop:4}}>LoremPro Tool beats lipsum.pro with 75 real languages.</p></div>
          <div id="contactus" style={{background:"white", borderRadius:16, padding:14, border:"1px solid #e2e8f0"}}><b style={{fontSize:13}}>Contact</b><p style={{fontSize:11, color:"#64748b", marginTop:4}}>Email: support@lorempro.tool</p></div>
          <div id="hireme" style={{background:"black", borderRadius:16, padding:14, color:"white"}}><b style={{fontSize:13}}>Hire Me</b><p style={{fontSize:11, color:"#94a3b8", marginTop:4}}>I make SEO tools that rank & earn. Contact now.</p><button style={{marginTop:8, background:"white", color:"black", borderRadius:20, padding:"6px 12px", fontSize:11, fontWeight:900, border:"none"}}>Hire Me Now</button></div>
        </section>

        {/* ADSENSE FOOTER */}
        <div style={{background:"#fff", border:"1px dashed #cbd5e1", borderRadius:12, padding:18, textAlign:"center", fontSize:11, color:"#94a3b8"}}>ADSENSE FOOTER AD - Place Ad Code Here - 728x90</div>
      </main>

      <footer style={{background:"white", borderTop:"1px solid #e2e8f0", marginTop:20, padding:16, textAlign:"center", fontSize:10, color:"#94a3b8"}}>
        © 2026 LoremPro Tool - 75 Langs - Adsense Ready - All Pages Included
      </footer>
    </div>
  )
}
