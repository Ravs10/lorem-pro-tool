"use client";
import { useState } from "react";

const LANG_DATA:any = {
  EN: "Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum".split(" "),
  HI: "यह एक नमूना पाठ है जो डिज़ाइन और टाइपोग्राफी में उपयोग होता है लोरेम इप्सम केवल एक डमी टेक्स्ट है जिसे प्रिंटिंग उद्योग में उपयोग किया जाता है यह टेक्स्ट डिज़ाइनरों को वास्तविक सामग्री के बिना लेआउट देखने में मदद करता है हिन्दी लोरेम जनरेटर से आप तुरंत सुंदर पैराग्राफ बना सकते हैं यह उपकरण पूरी तरह से मुफ्त और ऑफ़लाइन काम करता है".split(" "),
  ES: "Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit".split(" "),
  FR: "Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat".split(" "),
  DE: "Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris".split(" "),
  AR: "لوريم إيبسوم هو ببساطة نص شكلي يستخدم في صناعة الطباعة والتنضيد هذا النص هو مثال لنص يمكن أن يستبدل في نفس المساحة لقد تم توليد هذا النص من مولد النص العربى حيث يمكنك توليد مثل هذا النص أو العديد من النصوص الأخرى".split(" "),
  PT: "Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud".split(" "),
  RU: "Лорем ипсум долор сит амет consectetur adipiscing элит сед до эиусмод темпор инцидидунт ут лаборе эт долоре магна аликуа ут эним ад миним вениам квис ноструд".split(" "),
  JA: "ロレム イプサム は 組版 や デザイン の サンプル テキスト です 印刷 業界 で 使われる ダミー テキスト で レイアウト を 確認 するために 使用 されます この ツール は 日本語 の ダミー テキスト を 簡単に 生成 できます".split(" "),
  IT: "Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim".split(" "),
  BN: "লোরেম ইপসাম ডলর সিট আমেট কনসেক্টেটর অ্যাডিপিসিং এলিট সেড ডো এইউসমোড টেম্পর ইনসিডিডান্ট উট ল্যাবোরে এট ডলোরে ম্যাগনা আলিকুয়া".split(" "),
  UR: "لوریم اپسم ڈالر سٹ امیٹ کونسیکٹیٹر ایڈیپیسنگ ایلیٹ سیڈ ڈو ایئسموڈ ٹیمپور انسیڈیڈنٹ یوٹ لیبورے ایٹ ڈولورے مگنا الیکوا".split(" "),
}

const FLAGS:any = {EN:"🇺🇸", HI:"🇮🇳", ES:"🇪🇸", FR:"🇫🇷", DE:"🇩🇪", AR:"🇸🇦", PT:"🇵🇹", RU:"🇷🇺", JA:"🇯🇵", IT:"🇮🇹", BN:"🇧🇩", UR:"🇵🇰"}
const COUNTRY_COLORS:any = {
  EN: ["#3b82f6","#60a5fa"], HI: ["#f97316","#fb923c"], ES: ["#ef4444","#f87171"], FR: ["#8b5cf6","#a78bfa"],
  DE: ["#111827","#4b5563"], AR: ["#059669","#10b981"], PT: ["#0e7490","#22d3ee"], RU: ["#1d4ed8","#3b82f6"],
  JA: ["#db2777","#f472b6"], IT: ["#16a34a","#4ade80"], BN: ["#dc2626","#f87171"], UR: ["#15803d","#22c55e"]
}
const TYPE_COLORS:any = {para:["#111","#444"], words:["#7c3aed","#a78bfa"], list:["#db2777","#f472b6"], sent:["#059669","#34d399"]}

export default function Page(){
  const [lang,setLang]=useState("EN");
  const [count,setCount]=useState(3);
  const [type,setType]=useState("para");
  const [out,setOut]=useState("");
  const [aiTopic,setAiTopic]=useState("");
  const [aiMode,setAiMode]=useState(false);
  const [copied,setCopied]=useState(false);

  const makeText = () => {
    const words = LANG_DATA[lang];
    const getSentence = () => {
      const len = 8 + Math.floor(Math.random()*10);
      let s = [];
      for(let i=0;i<len;i++) s.push(words[Math.floor(Math.random()*words.length)]);
      return s.join(" ") + ".";
    }

    let result = "";
    if(type==="words"){
      let w = [];
      for(let i=0;i<count;i++) w.push(words[Math.floor(Math.random()*words.length)]);
      result = w.join(" ") + ".";
    }
    if(type==="para"){
      let paras = [];
      for(let p=0;p<count;p++){
        let paraText = "";
        const sentCount = 3 + Math.floor(Math.random()*2);
        for(let s=0;s<sentCount;s++) paraText += getSentence() + " ";
        paras.push(paraText.trim());
      }
      result = paras.join("\n\n");
    }
    if(type==="sent"){
      let sents = [];
      for(let i=0;i<count;i++) sents.push(getSentence());
      result = sents.join(" ");
    }
    if(type==="list"){
      let list = [];
      for(let i=0;i<count;i++) list.push(`${i+1}. ${getSentence()}`);
      result = list.join("\n");
    }

    if(aiMode && aiTopic){
      result = `Topic: ${aiTopic}\n\n` + result + `\n\n[AI Enhanced for ${lang} - ${aiTopic}]`;
    }

    setOut(result);
  }

  const download = () => {
    const blob = new Blob(["\uFEFF" + out], {type: "text/plain;charset=utf-8"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `lorem-${lang}-${type}.txt`; a.click();
  }

  // initial
  useState(()=>{ makeText(); })

  return(
    <div style={{minHeight:"100vh", background:"#f8f7f4", padding:"12px"}}>
      <div style={{maxWidth:"1150px", margin:"0 auto"}}>
        <div style={{background:"white", borderRadius:"22px", height:"72px", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 20px", border:"1px solid #eee", boxShadow:"0 4px 20px rgba(0,0,0,0.04)"}}>
          <b style={{fontSize:"19px"}}>LoremGen <span style={{opacity:0.4}}>PRO</span> <span style={{background:"linear-gradient(90deg,#7c3aed,#ec4899)", color:"white", fontSize:"10px", padding:"5px 10px", borderRadius:"20px", marginLeft:"8px"}}>AI + 12 LANG</span></b>
          <span style={{fontSize:"10px", background:"#111", color:"white", padding:"6px 12px", borderRadius:"20px", fontWeight:800}}>BLOGGER EDITION</span>
        </div>

        <div style={{display:"grid", gap:"16px", marginTop:"16px"}} className="main">
          <style>{`@media(min-width:950px){.main{grid-template-columns:430px 1fr}}`}</style>

          <div style={{background:"white", borderRadius:"28px", padding:"20px", border:"1px solid #eee"}}>
            {/* TYPE */}
            <div style={{fontSize:"11px", fontWeight:900, letterSpacing:"2px", opacity:0.4}}>TYPE</div>
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", marginTop:"10px"}}>
              {[{k:"para",l:"PARAGRAPH"},{k:"words",l:"WORDS"},{k:"sent",l:"SENTENCES"},{k:"list",l:"LIST"}].map(b=>{
                const active = type===b.k;
                return <button key={b.k} onClick={()=>setType(b.k)} style={{height:"64px", borderRadius:"18px", border: active?"none":"2px solid #eee", background: active?`linear-gradient(135deg,${TYPE_COLORS[b.k][0]},${TYPE_COLORS[b.k][1]})`:"white", color: active?"white":"#111", fontWeight:900, fontSize:"15px", cursor:"pointer"}}>{b.l}</button>
              })}
            </div>

            {/* AI FEATURE */}
            <div style={{marginTop:"20px", background:"linear-gradient(135deg,#f5f3ff,#fdf2f8)", border:"2px dashed #d8b4fe", borderRadius:"18px", padding:"14px"}}>
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                <span style={{fontSize:"12px", fontWeight:900}}>🤖 AI TOPIC GENERATOR</span>
                <button onClick={()=>setAiMode(!aiMode)} style={{padding:"4px 12px", borderRadius:"20px", border:"none", background: aiMode?"#7c3aed":"#ddd", color: aiMode?"white":"#111", fontSize:"11px", fontWeight:800, cursor:"pointer"}}>{aiMode?"ON":"OFF"}</button>
              </div>
              {aiMode && <input value={aiTopic} onChange={e=>setAiTopic(e.target.value)} placeholder="Ex: business, nature, tech..." style={{width:"100%", marginTop:"10px", height:"42px", borderRadius:"12px", border:"1.5px solid #ddd", padding:"0 12px", outline:"none"}} />}
            </div>

            {/* COUNTRIES COLORFUL */}
            <div style={{fontSize:"11px", fontWeight:900, letterSpacing:"2px", opacity:0.4, marginTop:"22px"}}>12 LANGUAGES • SELECT COUNTRY</div>
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"10px", marginTop:"12px"}}>
              {Object.keys(LANG_DATA).map(k=>{
                const active = lang===k;
                return <button key={k} onClick={()=>setLang(k)} style={{height:"68px", borderRadius:"18px", border: active?"2px solid #111":"2px solid transparent", background: `linear-gradient(135deg,${COUNTRY_COLORS[k][0]},${COUNTRY_COLORS[k][1]})`, color:"white", fontWeight:900, fontSize:"14px", cursor:"pointer", boxShadow: active?"0 8px 20px rgba(0,0,0,0.2)":"0 4px 10px rgba(0,0,0,0.1)", transform: active?"scale(1.05)":"scale(1)", transition:"all 0.2s"}}>
                  <div style={{fontSize:"20px"}}>{FLAGS[k]}</div><div style={{fontSize:"13px", letterSpacing:"1px"}}>{k}</div>
                </button>
              })}
            </div>

            <div style={{background:"#f8f7f4", borderRadius:"18px", padding:"16px", marginTop:"20px", border:"1px solid #eee"}}>
              <div style={{display:"flex", justifyContent:"space-between", fontWeight:900}}><span style={{fontSize:"12px", opacity:0.5}}>{type.toUpperCase()} COUNT</span><span style={{background:"#111", color:"white", padding:"4px 12px", borderRadius:"20px", fontSize:"13px"}}>{count}</span></div>
              <input type="range" min={1} max={type==="words"?200:12} value={count} onChange={e=>setCount(Number(e.target.value))} style={{width:"100%", marginTop:"12px"}} />
            </div>

            <button onClick={makeText} style={{width:"100%", marginTop:"16px", height:"64px", borderRadius:"18px", border:"none", background:"#111", color:"white", fontWeight:900, fontSize:"17px", cursor:"pointer"}}>✨ GENERATE {type.toUpperCase()}</button>
          </div>

          <div style={{background:"white", borderRadius:"28px", border:"1px solid #eee", display:"flex", flexDirection:"column", overflow:"hidden"}}>
            <div style={{height:"60px", display:"flex", justifyContent:"space-between", alignItems:"center", padding:"0 18px", borderBottom:"1px solid #eee", background:"#fcfbf9"}}>
              <span style={{fontSize:"12px", fontWeight:900, opacity:0.5}}>{out.split(/\s+/).filter(Boolean).length} WORDS • {out.length} CHARS • {lang}</span>
              <button onClick={()=>{navigator.clipboard.writeText(out); setCopied(true); setTimeout(()=>setCopied(false),1500)}} style={{padding:"8px 18px", borderRadius:"20px", border:"none", background:"#111", color:"white", fontWeight:900, cursor:"pointer"}}>{copied?"COPIED ✓":"COPY"}</button>
            </div>
            <textarea value={out} placeholder="Click GENERATE..." onChange={e=>setOut(e.target.value)} style={{flex:1, minHeight:"520px", border:"none", padding:"20px", fontSize:"16px", lineHeight:"32px", outline:"none", resize:"none", color:"#222"}} />
            <div style={{padding:"14px", background:"#fcfbf9", borderTop:"1px solid #eee", display:"flex", gap:"12px"}}>
              <button onClick={()=>{navigator.clipboard.writeText(out); setCopied(true); setTimeout(()=>setCopied(false),1500)}} style={{flex:1, height:"52px", borderRadius:"14px", border:"none", background:"#111", color:"white", fontWeight:900, fontSize:"15px", cursor:"pointer"}}>Copy</button>
              <button onClick={download} style={{flex:1, height:"52px", borderRadius:"14px", border:"2px solid #111", background:"white", fontWeight:900, fontSize:"15px", cursor:"pointer"}}>Download.txt</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
