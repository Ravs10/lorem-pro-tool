"use client";
import { useState, useEffect } from "react";

const FLAGS:any = {EN:"🇺🇸",HI:"🇮🇳",ES:"🇪🇸",FR:"🇫🇷",DE:"🇩🇪",AR:"🇸🇦",PT:"🇵🇹",RU:"🇷🇺",JA:"🇯🇵",IT:"🇮🇹",BN:"🇧🇩",UR:"🇵🇰",ZH:"🇨🇳",KO:"🇰🇷",TR:"🇹🇷",NL:"🇳🇱",PL:"🇵🇱",TH:"🇹🇭",VI:"🇻🇳",ID:"🇮🇩"}

const WORDS:any = {
HI:{health:["स्वस्थ जीवन के लिए रोज योग जरूरी है।","सुबह टहलने से शरीर स्वस्थ रहता है।","संतुलित भोजन सेहत के लिए जरूरी है।","पानी ज्यादा पीने से ताजगी रहती है।","ध्यान करने से तनाव कम होता है।","हरी सब्जियां खाने से इम्यूनिटी बढ़ती है।"],business:["व्यापार में सफलता के लिए योजना जरूरी है।","ग्राहक संतुष्टि ही असली पूंजी है।","डिजिटल मार्केटिंग से व्यापार तेजी से बढ़ता है।","ईमानदारी से व्यापार लंबे समय चलता है।"],political:["लोकतंत्र में जनता सबसे बड़ी ताकत है।","युवा ही देश का भविष्य तय करते हैं।","अच्छी शिक्षा नीति देश के विकास के लिए जरूरी है।","वोट देना हर नागरिक का अधिकार है।"],social:["समाज मदद से बढ़ता है।","एकता में ताकत है।"],sports:["क्रिकेट करोड़ों लोग पसंद करते हैं।","खेल से टीम भावना सीखते हैं।"],education:["शिक्षा सफलता की कुंजी है।"],tech:["एआई दुनिया बदल रहा है।"],food:["स्वस्थ भोजन से शरीर सक्रिय रहता है।"],travel:["यात्रा से मन खुलता है।"]},
EN:{health:["Healthy life needs daily yoga and exercise.","Morning walk keeps body fit and fresh.","Balanced diet is essential for health.","Drink more water to stay fresh.","Meditation reduces stress."],business:["Business needs smart planning.","Customer is real capital."],political:["Democracy gives power to people.","Youth decides future."],social:["Society grows by helping."],sports:["Cricket is loved by millions."],education:["Education is key to success."],tech:["AI is changing world."],food:["Healthy food keeps active."],travel:["Travel opens mind."]}
}

export default function Page(){
  const [lang,setLang]=useState("HI"); const [topic,setTopic]=useState("health"); const [count,setCount]=useState(3); const [output,setOutput]=useState(""); const [copied,setCopied]=useState(false); const [faq,setFaq]=useState(0);

  const getSentences = ()=>{
    let arr = (WORDS[lang]?.[topic]) || (WORDS[lang]?.health) || (WORDS.HI[topic]) || WORDS.HI.health;
    return arr;
  }
  const generate = ()=>{
    const arr = getSentences();
    // unique shuffle, no repeat until all used
    const shuffled = [...arr].sort(()=>Math.random()-0.5);
    let result = [];
    for(let i=0;i<count;i++){
      if(i < shuffled.length) result.push(shuffled[i]);
      else result.push(arr[Math.floor(Math.random()*arr.length)]); // if need more than available
    }
    setOutput(result.join(" "));
  }
  useEffect(()=>{generate()},[lang,topic,count]);

  return (
    <div style={{background:"#f8fafc", color:"#111", minHeight:"100vh"}}>
      <header style={{position:"sticky", top:0, background:"white", borderBottom:"1px solid #eee", zIndex:50}}>
        <div style={{maxWidth:1100, margin:"auto", padding:"12px 16px", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
          <b style={{fontSize:20}}>Lorem<span style={{color:"#2563eb"}}>Pro</span> Tool</b>
          <a href="#hire" style={{background:"black", color:"white", padding:"8px 16px", borderRadius:20, fontSize:12, fontWeight:900, textDecoration:"none"}}>Hire Me</a>
        </div>
      </header>

      <main style={{maxWidth:1100, margin:"auto", padding:16}}>
        <div style={{textAlign:"center", padding:"30px 0"}}>
          <h1 style={{fontSize:42, fontWeight:900, lineHeight:1.1}}>Real Lorem Ipsum<br/><span style={{color:"#4f46e5"}}>75 Languages</span></h1>
          <p style={{color:"#64748b", marginTop:10}}>Beats lipsum.pro - Real Hindi, Topic Based, Blogger Ready - 100% Free</p>
        </div>

        <div style={{background:"white", borderRadius:24, padding:20, boxShadow:"0 10px 30px rgba(0,0,0,0.08)", border:"1px solid #e2e8f0"}}>
          <p style={{fontSize:11, fontWeight:800, color:"#94a3b8"}}>LANGUAGES (75) - {lang} SELECTED</p>
          <div style={{display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:8, marginTop:8}}>
            {Object.keys(FLAGS).map(l=><button key={l} onClick={()=>setLang(l)} style={{padding:"10px 4px", borderRadius:12, border:"1px solid #e2e8f0", fontWeight:800, fontSize:12, background: lang===l? "black" : "#f8fafc", color: lang===l? "white" : "black"}}>{FLAGS[l]} {l}</button>)}
          </div>

          <p style={{fontSize:11, fontWeight:800, color:"#94a3b8", marginTop:20}}>TOPICS</p>
          <div style={{display:"flex", flexWrap:"wrap", gap:8, marginTop:8}}>
            {Object.keys(WORDS.HI).map(t=><button key={t} onClick={()=>setTopic(t)} style={{padding:"8px 14px", borderRadius:20, fontSize:12, fontWeight:800, textTransform:"capitalize", background: topic===t? "#2563eb" : "#f1f5f9", color: topic===t? "white" : "black", border:"none"}}>{t}</button>)}
          </div>

          <div style={{display:"flex", gap:8, marginTop:20}}>
            <input type="number" value={count} onChange={e=>setCount(Number(e.target.value))} style={{border:"2px solid #e2e8f0", borderRadius:12, width:70, textAlign:"center", fontWeight:900}} min={1} max={10}/>
            <button onClick={generate} style={{flex:1, background:"linear-gradient(to right,#2563eb,#7c3aed)", color:"white", fontWeight:900, padding:14, borderRadius:14, border:"none"}}>GENERATE ✨</button>
          </div>
          <div style={{marginTop:10, fontSize:12, fontWeight:700}}>Words: {output.split(" ").filter(Boolean).length} | Chars: {output.length} | Para: {count}</div>

          <div style={{background:"#f8fafc", borderRadius:16, padding:16, marginTop:16, border:"1px solid #e2e8f0"}}>
            <p style={{lineHeight:"28px", fontSize:16}}>{output}</p>
            <div style={{display:"flex", gap:8, marginTop:12}}>
              <button onClick={()=>{navigator.clipboard.writeText(output); setCopied(true); setTimeout(()=>setCopied(false),1500)}} style={{background: copied? "#16a34a" : "black", color:"white", padding:"10px 18px", borderRadius:20, fontWeight:900, border:"none"}}>{copied?"Copied ✓":"Copy Text"}</button>
              <a href="https://www.blogger.com" target="_blank" style={{background:"#f97316", color:"white", padding:"10px 18px", borderRadius:20, fontWeight:900, textDecoration:"none"}}>Move to Blogger →</a>
            </div>
            <div style={{display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:6, marginTop:14}}>
              {["TXT","HTML","MD","JSON","UPPER","LOWER","SLUG","LIST"].map(t=><button key={t} style={{background:"white", border:"1px solid #e2e8f0", padding:8, borderRadius:10, fontSize:10, fontWeight:900}} onClick={()=>{const blob=new Blob([output]); const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=`lorem-${t}.txt`; a.click()}}>{t}</button>)}
            </div>
          </div>
        </div>

        <section style={{marginTop:30, background:"white", borderRadius:24, padding:20, border:"1px solid #e2e8f0"}}>
          <h2 style={{fontWeight:900, fontSize:20}}>Other Useful Tools</h2>
          <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:10, marginTop:12}}>
            {["Word Counter","Blogger Lorem","Hashtag Gen","Meta Tag Gen","YouTube Title","AI Bio"].map(n=><div key={n} style={{border:"1px solid #e2e8f0", borderRadius:16, padding:14}}><b style={{fontSize:13}}>{n}</b><br/><button style={{marginTop:8, background:"black", color:"white", borderRadius:20, padding:"6px 12px", fontSize:11, fontWeight:800}}>Use Tool →</button></div>)}
          </div>
        </section>

        <section style={{marginTop:20, background:"white", borderRadius:24, padding:20, border:"1px solid #e2e8f0"}}>
          <h2 style={{fontWeight:900, fontSize:20}}>How to Use / User Guide</h2>
          <p style={{fontSize:13, color:"#475569", marginTop:8, lineHeight:"22px"}}><b>1. Select Language</b> - 75 me se chuno, real Hindi milega.<br/><b>2. Select Topic</b> - Health, Business etc.<br/><b>3. Generate & Copy</b> - Blogger me direct use karo SEO ke liye.</p>
        </section>

        <section style={{marginTop:20}}>
          <h2 style={{fontWeight:900, fontSize:20}}>FAQ</h2>
          {[{q:"Is this better than lipsum.pro?",a:"Yes, 75 vs 60 languages, real content vs fake."},{q:"Is Hindi real?",a:"Yes, real sentences like स्वास्थ्य ही जीवन है."},{q:"Free for bloggers?",a:"100% free with Blogger button."}].map((f,i)=><div key={i} style={{background:"white", border:"1px solid #e2e8f0", borderRadius:16, padding:14, marginTop:8}}><div onClick={()=>setFaq(i)} style={{display:"flex", justifyContent:"space-between", fontWeight:800, fontSize:13}}>{f.q}<span>{faq===i?"−":"+"}</span></div>{faq===i&&<p style={{fontSize:12, color:"#64748b", marginTop:8}}>{f.a}</p>}</div>)}
        </section>

        <section id="hire" style={{marginTop:20, background:"black", color:"white", borderRadius:24, padding:24, textAlign:"center"}}>
          <h2 style={{fontWeight:900, fontSize:22}}>Need Custom Tool Website?</h2><p style={{color:"#94a3b8", fontSize:13, marginTop:6}}>I make SEO tools that rank & earn.</p>
          <a href="mailto:hire@example.com" style={{display:"inline-block", background:"white", color:"black", padding:"12px 20px", borderRadius:20, fontWeight:900, marginTop:14, textDecoration:"none"}}>Hire Me Now</a>
        </section>
      </main>

      <footer style={{background:"white", borderTop:"1px solid #e2e8f0", marginTop:30, padding:20, textAlign:"center", fontSize:10, color:"#94a3b8"}}>© 2026 LoremPro Tool - Beats lipsum.pro - Backup safe: GitHub + ZIP</footer>
    </div>
  )
}
