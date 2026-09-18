"use client";
import { useState, useEffect } from "react";

const FLAGS:any = {EN:"🇺🇸",HI:"🇮🇳",ES:"🇪🇸",FR:"🇫🇷",DE:"🇩🇪",AR:"🇸🇦",PT:"🇵🇹",RU:"🇷🇺",JA:"🇯🇵",IT:"🇮🇹",BN:"🇧🇩",UR:"🇵🇰",ZH:"🇨🇳",KO:"🇰🇷",TR:"🇹🇷",NL:"🇳🇱",PL:"🇵🇱",TH:"🇹🇭",VI:"🇻🇳",ID:"🇮🇩",MS:"🇲🇾",FA:"🇮🇷",TA:"🇮🇳",TE:"🇮🇳",ML:"🇮🇳",KN:"🇮🇳",GU:"🇮🇳",MR:"🇮🇳",PA:"🇮🇳",NE:"🇳🇵",SI:"🇱🇰",MY:"🇲🇲",KM:"🇰🇭",LO:"🇱🇦",UK:"🇺🇦",CS:"🇨🇿",EL:"🇬🇷",HE:"🇮🇱",HU:"🇭🇺",RO:"🇷🇴",SV:"🇸🇪",DA:"🇩🇰",NO:"🇳🇴",FI:"🇫🇮",BG:"🇧🇬",HR:"🇭🇷",SR:"🇷🇸",SK:"🇸🇰",LT:"🇱🇹",LV:"🇱🇻",ET:"🇪🇪",SQ:"🇦🇱",BS:"🇧🇦",MK:"🇲🇰",SL:"🇸🇮",IS:"🇮🇸",MT:"🇲🇹",GA:"🇮🇪",CY:"🏴󠁧󠁢󠁷󠁬󠁳󠁿",EU:"🇪🇸",CA:"🇪🇸",GL:"🇪🇸",AF:"🇿🇦",AM:"🇪🇹",AZ:"🇦🇿",BE:"🇧🇾",HY:"🇦🇲",KA:"🇬🇪",KK:"🇰🇿",KY:"🇰🇬",MN:"🇲🇳",UZ:"🇺🇿",SW:"🇰🇪",ZU:"🇿🇦",YO:"🇳🇬"}

const DB:any = {
HI:{
health:["स्वस्थ जीवन के लिए रोज योग और व्यायाम जरूरी है।","रोज सुबह टहलने से शरीर स्वस्थ रहता है।","संतुलित भोजन और अच्छी नींद सेहत के लिए जरूरी है।","पानी ज्यादा पीने से शरीर में ताजगी बनी रहती है।","तनाव से बचने के लिए ध्यान करना फायदेमंद है।","फल और हरी सब्जियां खाने से इम्यूनिटी बढ़ती है।"],
business:["व्यापार में सफलता के लिए अच्छी योजना जरूरी है।","ग्राहक की संतुष्टि ही व्यापार की असली पूंजी है।","डिजिटल मार्केटिंग से आज व्यापार तेजी से बढ़ता है।"],
political:["लोकतंत्र में जनता ही सबसे बड़ी ताकत होती है।"], social:["समाज तब बढ़ता है जब लोग एक दूसरे की मदद करते हैं।"], sports:["क्रिकेट को करोड़ों लोग पसंद करते हैं।","खेल से टीम भावना सीखते हैं।"], education:["शिक्षा सफलता की कुंजी है।"], tech:["एआई दुनिया बदल रहा है।"], food:["स्वस्थ भोजन से शरीर सक्रिय रहता है।"], travel:["यात्रा से मन खुलता है।"]
},
EN:{
health:["Healthy life needs daily exercise and yoga.","Morning walk keeps body fit.","Balanced diet and good sleep are essential.","Drinking water keeps you energetic.","Meditation reduces stress."],
business:["Business growth needs smart planning."], political:["Democracy gives power to people."], social:["Society grows when people help each other."], sports:["Cricket is loved by millions."], education:["Education is key to success."], tech:["AI is changing the world."], food:["Healthy food keeps you active."], travel:["Travel opens mind."]
}
}

export default function Page(){
  const [lang,setLang]=useState("HI");
  const [topic,setTopic]=useState("health");
  const [count,setCount]=useState(3);
  const [output,setOutput]=useState("");
  const [copied,setCopied]=useState(false);

  const generate = ()=>{
    const base = DB[lang] || DB.HI;
    const arr = base[topic] || base.health;
    const shuffled = [...arr].sort(()=>0.5-Math.random());
    let res=[];
    for(let i=0;i<count;i++) res.push(shuffled[i % shuffled.length]);
    setOutput(res.join(" "));
  }
  useEffect(()=>{generate()},[lang,topic,count]);

  const words = output.split(" ").filter(Boolean).length;
  const chars = output.length;

  const download = (type:string)=>{
    let content = output;
    let ext = "txt";
    if(type==="HTML"){ content = `<p>${output}</p>`; ext="html"; }
    if(type==="MD"){ content = `> ${output}`; ext="md"; }
    if(type==="JSON"){ content = JSON.stringify({lang,topic,text:output},null,2); ext="json"; }
    if(type==="UPPER"){ content = output.toUpperCase(); }
    if(type==="LOWER"){ content = output.toLowerCase(); }
    if(type==="SLUG"){ content = output.toLowerCase().replace(/[^a-z0-9\u0900-\u097F]+/g,"-"); }
    if(type==="LIST"){ content = output.split("।").map(s=>`- ${s}`).join("\n"); }
    const blob = new Blob([content],{type:"text/plain"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `lorem-pro-${type.toLowerCase()}.${ext}`;
    a.click();
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-black p-3" style={{colorScheme:"light"}}>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-black text-center pt-4">Lorem Pro Tool - V6</h1>
        <p className="text-center text-gray-500 text-sm">Counter + 8 Downloads + Animation</p>

        {/* LANG */}
        <div className="bg-white rounded-2xl shadow p-4 mt-4 border">
          <p className="text-[11px] font-bold text-gray-500">SELECT LANGUAGE (75)</p>
          <div className="grid grid-cols-4 md:grid-cols-10 gap-2 mt-2">
            {Object.keys(FLAGS).map(l=>(
              <button key={l} onClick={()=>setLang(l)} className={`px-2 py-2 rounded-xl border text-xs font-bold transition-all duration-200 active:scale-90 hover:scale-105 ${lang===l?'bg-black text-white shadow-lg':'bg-gray-50'}`}>{FLAGS[l]} {l}</button>
            ))}
          </div>

          <p className="text-[11px] font-bold text-gray-500 mt-4">SELECT TOPIC</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {Object.keys(DB.HI).map(t=>(
              <button key={t} onClick={()=>setTopic(t)} className={`px-4 py-2 rounded-full text-xs font-bold capitalize transition-all active:scale-95 ${topic===t?'bg-blue-600 text-white shadow-md':'bg-gray-100'}`}>{t}</button>
            ))}
          </div>

          <div className="flex gap-2 mt-4 items-center">
            <input type="number" value={count} onChange={e=>setCount(Number(e.target.value))} className="border-2 rounded-xl p-2.5 w-20 font-black text-center" min={1} max={10}/>
            <button onClick={generate} className="flex-1 bg-gradient-to-r from-blue-600 to-violet-600 text-white font-black py-3 rounded-xl shadow-lg transition-all active:scale-[0.98] hover:shadow-xl hover:scale-[1.02]">GENERATE ✨</button>
          </div>

          {/* COUNTER */}
          <div className="flex gap-3 mt-3 text-[12px] font-bold">
            <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full">Words: {words}</span>
            <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full">Chars: {chars}</span>
            <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full">Para: {count}</span>
          </div>
        </div>

        {/* OUTPUT */}
        <div className="bg-white rounded-2xl shadow p-5 mt-4 border">
          <p className="text-[16px] leading-7">{output}</p>
          <div className="flex gap-2 mt-4">
            <button onClick={()=>{navigator.clipboard.writeText(output); setCopied(true); setTimeout(()=>setCopied(false),1500)}} className={`px-5 py-2.5 rounded-full font-black transition-all active:scale-90 ${copied?'bg-green-600 text-white':'bg-black text-white hover:scale-105'}`}>{copied?'Copied ✓':'Copy Text'}</button>
          </div>

          {/* 8 TYPE DOWNLOAD */}
          <p className="text-[11px] font-bold text-gray-500 mt-6">8 TYPE DOWNLOAD</p>
          <div className="grid grid-cols-4 gap-2 mt-2">
            {["TXT","HTML","MD","JSON","UPPER","LOWER","SLUG","LIST"].map(t=>(
              <button key={t} onClick={()=>download(t)} className="bg-gray-50 border py-2.5 rounded-xl text-[11px] font-black hover:bg-black hover:text-white transition-all active:scale-90">{t}</button>
            ))}
          </div>
        </div>

        <p className="text-center text-[10px] text-gray-400 mt-4 pb-10">V6: Counter + 8 Downloads + Animation attributes - GitHub + ZIP safe</p>
      </div>
    </div>
  )
}
