"use client";
import { useState } from "react";

const DATA:any = {
  EN: ["Lorem ipsum dolor sit amet, consectetur adipiscing elit.","Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.","Duis aute irure dolor in reprehenderit in voluptate velit esse cillum.","Excepteur sint occaecat cupidatat non proident, sunt in culpa.","Vivamus lacinia odio vitae vestibulum vestibulum.","Cras mattis consectetur purus sit amet fermentum."],
  HI: ["यह एक नमूना पाठ है जो डिज़ाइन और टाइपोग्राफी में उपयोग होता है।","लोरेम इप्सम केवल एक डमी टेक्स्ट है जिसे प्रिंटिंग उद्योग में उपयोग किया जाता है।","यह टेक्स्ट डिज़ाइनरों को वास्तविक सामग्री के बिना लेआउट देखने में मदद करता है।","हिन्दी लोरेम जनरेटर से आप तुरंत सुंदर पैराग्राफ बना सकते हैं।","यह उपकरण पूरी तरह से मुफ्त और ऑफ़लाइन काम करता है।","आप शब्दों और पैराग्राफ की संख्या आसानी से बदल सकते हैं।"],
  ES: ["Lorem ipsum dolor sit amet, consectetur adipiscing elit.","Vivamus lacinia odio vitae vestibulum vestibulum.","Cras mattis consectetur purus sit amet fermentum.","Vestibulum id ligula porta felis euismod semper.","Donec ullamcorper nulla non metus auctor fringilla."],
  FR: ["Lorem ipsum dolor sit amet, consectetur adipiscing elit.","Vivamus sagittis lacus vel augue laoreet rutrum faucibus.","Cras mattis consectetur purus sit amet fermentum.","Aenean lacinia bibendum nulla sed consectetur."],
  DE: ["Lorem ipsum dolor sit amet, consectetur adipiscing elit.","Er hörte leise Schritte hinter sich. Das bedeutete nichts Gutes.","Vestibulum id ligula porta felis euismod semper.","Cras mattis consectetur purus sit amet fermentum."],
  AR: ["لوريم إيبسوم هو ببساطة نص شكلي يستخدم في صناعة الطباعة.","هذا النص هو مثال لنص يمكن أن يستبدل في نفس المساحة.","لقد تم توليد هذا النص من مولد النص العربى حيث يمكنك توليد مثل هذا النص."],
  PT: ["Lorem ipsum dolor sit amet, consectetur adipiscing elit.","Vivamus lacinia odio vitae vestibulum vestibulum.","Donec sed odio dui. Cras mattis consectetur purus."],
  RU: ["Лорем ипсум долор сит амет, consectetur adipiscing эли.","Сед до эиусмод темпор инцидидунт ут лаборе эт долоре.","Вивамус лациниа одио витае вестибулум вестибулум."],
  JA: ["ロレム・イプサムは組版やデザインのサンプルテキストです。","印刷業界で使われるダミーテキストで、レイアウトを確認するために使用されます。","このツールは日本語のダミーテキストを簡単に生成できます。"],
  IT: ["Lorem ipsum dolor sit amet, consectetur adipiscing elit.","Vivamus lacinia odio vitae vestibulum vestibulum.","Cras mattis consectetur purus sit amet fermentum."],
  BN: ["লোরেম ইপসাম ডলর সিট আমেট, কনসেক্টেটর অ্যাডিপিসিং এলিট।","এটি একটি নমুনা পাঠ্য যা ডিজাইনে ব্যবহৃত হয়।","এই টুলটি দিয়ে আপনি সহজেই বাংলা ডামি টেক্সট তৈরি করতে পারেন।"],
  UR: ["لوریم اپسم ڈالر سٹ امیٹ، کونسیکٹیٹر ایڈیپیسنگ ایلیٹ۔","یہ ایک نمونہ متن ہے جو ڈیزائن اور ٹائپوگرافی میں استعمال ہوتا ہے۔","اس ٹول سے آپ اردو ڈمی ٹیکسٹ آسانی سے بنا سکتے ہیں۔"],
}
const FLAGS:any = {EN:"🇺🇸", HI:"🇮🇳", ES:"🇪🇸", FR:"🇫🇷", DE:"🇩🇪", AR:"🇸🇦", PT:"🇵🇹", RU:"🇷🇺", JA:"🇯🇵", IT:"🇮🇹", BN:"🇧🇩", UR:"🇵🇰"}
const COLORS:any = {para:["#7c3aed","#a78bfa"], words:["#059669","#34d399"], list:["#db2777","#f472b6"], sent:["#ea580c","#fb923c"]}

export default function Page(){
  const [lang,setLang]=useState("EN");
  const [para,setPara]=useState(3);
  const [words,setWords]=useState(50);
  const [type,setType]=useState("para");
  const [out,setOut]=useState(DATA.EN.slice(0,3).join("\n\n"));
  const [copied,setCopied]=useState(false);

  const generate=()=>{
    const sentences = DATA[lang];
    const allWords = sentences.join(" ").split(" ");
    let txt="";
    if(type==="para"){
      txt = Array(para).fill(0).map(()=> {
        const count = 2 + Math.floor(Math.random()*3);
        let p = "";
        for(let i=0;i<count;i++) p += sentences[Math.floor(Math.random()*sentences.length)] + " ";
        return p.trim();
      }).join("\n\n");
    }
    if(type==="words") txt = allWords.slice(0, words).join(" ") + ".";
    if(type==="sent") txt = Array(para).fill(0).map(()=> sentences[Math.floor(Math.random()*sentences.length)]).join(" ");
    if(type==="list") txt = Array(para).fill(0).map((_,i)=> `${i+1}. ${sentences[Math.floor(Math.random()*sentences.length)]}`).join("\n");
    setOut(txt);
  }

  const download=()=>{
    const blob = new Blob(["\uFEFF" + out], {type: "text/plain;charset=utf-8"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `lorem-${lang}.txt`; a.click();
  }
  const copy=()=>{navigator.clipboard.writeText(out); setCopied(true); setTimeout(()=>setCopied(false),1500)};

  return(
    <div style={{minHeight:"100vh", background:"#f7f6f3", color:"#111", padding:"14px"}}>
      <div style={{maxWidth:"1100px", margin:"0 auto"}}>
        <div style={{background:"white", border:"1px solid #e8e3db", borderRadius:"22px", padding:"0 18px", height:"70px", display:"flex", justifyContent:"space-between", alignItems:"center", boxShadow:"0 6px 24px rgba(0,0,0,0.05)"}}>
          <div style={{display:"flex", alignItems:"center", gap:"12px"}}><div style={{width:"42px", height:"42px", borderRadius:"14px", background:"linear-gradient(135deg,#111,#555)", color:"white", display:"grid", placeItems:"center", fontWeight:900, fontSize:"20px"}}>L</div><div><div style={{fontWeight:900, fontSize:"18px"}}>LoremGen PRO</div><div style={{fontSize:"10px", opacity:0.5, fontWeight:800, letterSpacing:"1px"}}>BLOGGER EDITION • 12 LANG</div></div></div>
          <div style={{fontSize:"11px", background:"#111", color:"white", padding:"6px 14px", borderRadius:"20px", fontWeight:800}}>ULTRA PRO MAX</div>
        </div>

        <div style={{display:"grid", gap:"16px", marginTop:"16px"}} className="grid">
          <style>{`@media(min-width:900px){.grid{grid-template-columns:410px 1fr}}`}</style>

          <div style={{background:"white", border:"1px solid #e8e3db", borderRadius:"28px", padding:"20px"}}>
            <div style={{fontSize:"11px", fontWeight:900, letterSpacing:"2px", opacity:0.35}}>GENERATION TYPE</div>
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", marginTop:"12px"}}>
              {[
                {k:"para", t:"PARAGRAPH"},
                {k:"words", t:"WORDS"},
                {k:"sent", t:"SENTENCES"},
                {k:"list", t:"LIST"},
              ].map(b=>{
                const active = type===b.k;
                return <button key={b.k} onClick={()=>setType(b.k)} style={{height:"62px", borderRadius:"18px", border: active?`2px solid ${COLORS[b.k][0]}`:"2px solid #eee", background: active?`linear-gradient(135deg,${COLORS[b.k][0]},${COLORS[b.k][1]})`:"white", color: active?"white":"#222", fontWeight:900, fontSize:"14px", letterSpacing:"0.5px", cursor:"pointer", boxShadow: active?`0 8px 20px ${COLORS[b.k][0]}40`:"none"}}>{b.t}</button>
              })}
            </div>

            <div style={{fontSize:"11px", fontWeight:900, letterSpacing:"2px", opacity:0.35, marginTop:"24px"}}>12 LANGUAGES</div>
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"10px", marginTop:"12px"}}>
              {Object.keys(DATA).map(k=>(
                <button key={k} onClick={()=>setLang(k)} style={{height:"60px", borderRadius:"16px", border: lang===k?"2px solid #111":"2px solid #eee", background: lang===k?"#111":"white", color: lang===k?"white":"#111", fontWeight:900, fontSize:"14px", cursor:"pointer"}}>
                  <div style={{fontSize:"18px"}}>{FLAGS[k]}</div><div style={{fontSize:"13px", marginTop:"2px"}}>{k}</div>
                </button>
              ))}
            </div>

            <div style={{background:"#f7f6f3", borderRadius:"18px", padding:"16px", marginTop:"22px", border:"1.5px solid #eee"}}>
              <div style={{display:"flex", justifyContent:"space-between", fontWeight:900}}><span style={{fontSize:"12px", opacity:0.5}}>{type==="words"?"TOTAL WORDS":"TOTAL COUNT"}</span><span style={{background:"#111", color:"white", padding:"4px 12px", borderRadius:"20px", fontSize:"13px"}}>{type==="words"?words:para}</span></div>
              <input type="range" min={1} max={type==="words"?200:12} value={type==="words"?words:para} onChange={e=> type==="words"?setWords(Number(e.target.value)):setPara(Number(e.target.value))} style={{width:"100%", marginTop:"14px", accentColor:"#111"}} />
            </div>

            <button onClick={generate} style={{width:"100%", marginTop:"16px", height:"62px", borderRadius:"18px", border:"none", background:"#111", color:"white", fontWeight:900, fontSize:"17px", letterSpacing:"1px", cursor:"pointer"}}>✨ GENERATE NOW</button>
          </div>

          <div style={{background:"white", border:"1px solid #e8e3db", borderRadius:"28px", overflow:"hidden", display:"flex", flexDirection:"column"}}>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", padding:"0 18px", height:"62px", borderBottom:"1px solid #eee", background:"#fcfbf9"}}>
              <span style={{fontSize:"12px", fontWeight:900, opacity:0.5}}>{out.split(/\s+/).length} WORDS • {out.length} CHARS • {lang}</span>
              <button onClick={copy} style={{padding:"9px 18px", borderRadius:"20px", border:"none", background:"#111", color:"white", fontWeight:900, fontSize:"13px", cursor:"pointer"}}>{copied?"✓ COPIED":"COPY"}</button>
            </div>
            <textarea value={out} onChange={e=>setOut(e.target.value)} style={{flex:1, minHeight:"500px", border:"none", padding:"20px", fontSize:"16px", lineHeight:"32px", outline:"none", resize:"none", color:"#222"}} />
            <div style={{padding:"14px", background:"#fcfbf9", borderTop:"1px solid #eee", display:"flex", gap:"12px"}}>
              <button onClick={copy} style={{flex:1, height:"50px", borderRadius:"14px", border:"none", background:"#111", color:"white", fontWeight:900, fontSize:"15px", cursor:"pointer"}}>Copy</button>
              <button onClick={download} style={{flex:1, height:"50px", borderRadius:"14px", border:"2px solid #111", background:"white", fontWeight:900, fontSize:"15px", cursor:"pointer"}}>Download.txt</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
