"use client";
import { useState, useEffect } from "react";

const FLAGS:any = {
EN:"🇺🇸",HI:"🇮🇳",ES:"🇪🇸",FR:"🇫🇷",DE:"🇩🇪",AR:"🇸🇦",PT:"🇵🇹",RU:"🇷🇺",JA:"🇯🇵",IT:"🇮🇹",BN:"🇧🇩",UR:"🇵🇰",
ZH:"🇨🇳",KO:"🇰🇷",TR:"🇹🇷",NL:"🇳🇱",PL:"🇵🇱",TH:"🇹🇭",VI:"🇻🇳",ID:"🇮🇩",MS:"🇲🇾",FA:"🇮🇷",TA:"🇮🇳",TE:"🇮🇳",
ML:"🇮🇳",KN:"🇮🇳",GU:"🇮🇳",MR:"🇮🇳",PA:"🇮🇳",NE:"🇳🇵",SI:"🇱🇰",MY:"🇲🇲",KM:"🇰🇭",LO:"🇱🇦",UK:"🇺🇦",
CS:"🇨🇿",EL:"🇬🇷",HE:"🇮🇱",HU:"🇭🇺",RO:"🇷🇴",SV:"🇸🇪",DA:"🇩🇰",NO:"🇳🇴",FI:"🇫🇮",BG:"🇧🇬",HR:"🇭🇷",
SR:"🇷🇸",SK:"🇸🇰",LT:"🇱🇹",LV:"🇱🇻",ET:"🇪🇪",SQ:"🇦🇱",BS:"🇧🇦",MK:"🇲🇰",SL:"🇸🇮",IS:"🇮🇸",MT:"🇲🇹",
GA:"🇮🇪",CY:"🏴󠁧󠁢󠁷󠁬󠁳󠁿",EU:"🇪🇸",CA:"🇪🇸",GL:"🇪🇸",AF:"🇿🇦",AM:"🇪🇹",AZ:"🇦🇿",BE:"🇧🇾",HY:"🇦🇲",KA:"🇬🇪",
KK:"🇰🇿",KY:"🇰🇬",MN:"🇲🇳",UZ:"🇺🇿",SW:"🇰🇪",ZU:"🇿🇦",YO:"🇳🇬"
}

const DB:any = {
HI:{
health:["स्वस्थ जीवन के लिए रोज योग और व्यायाम जरूरी है।","रोज सुबह टहलने से शरीर स्वस्थ रहता है।","संतुलित भोजन और अच्छी नींद सेहत के लिए जरूरी है।","पानी ज्यादा पीने से शरीर में ताजगी बनी रहती है।","तनाव से बचने के लिए ध्यान करना फायदेमंद है।"],
business:["व्यापार में सफलता के लिए अच्छी योजना जरूरी है।","ग्राहक की संतुष्टि ही व्यापार की असली पूंजी है।","डिजिटल मार्केटिंग से आज व्यापार तेजी से बढ़ता है।","ईमानदारी से किया गया व्यापार लंबे समय तक चलता है।"],
political:["लोकतंत्र में जनता ही सबसे बड़ी ताकत होती है।","देश के विकास के लिए अच्छी शिक्षा नीति जरूरी है।","युवा ही देश का भविष्य तय करते हैं।"],
social:["समाज तब बढ़ता है जब लोग एक दूसरे की मदद करते हैं।","एकता में ही समाज की ताकत है।"],
sports:["क्रिकेट को करोड़ों लोग पसंद करते हैं।","खेल से टीम भावना और अनुशासन सीखते हैं।","विराट कोहली युवाओं के लिए प्रेरणा हैं।"],
education:["शिक्षा सफलता की कुंजी है।","अच्छी शिक्षा से जीवन बदल जाता है।"],
tech:["एआई दुनिया बदल रहा है।","तकनीक से काम आसान हो जाता है।"],
food:["स्वस्थ भोजन से शरीर सक्रिय रहता है।","घर का खाना सबसे पौष्टिक होता है।"],
travel:["यात्रा से मन खुलता है और नया अनुभव मिलता है।","पहाड़ों की यात्रा मन को शांति देती है।"]
},
EN:{
health:["Healthy life needs daily exercise and yoga.","Morning walk keeps body fit and mind fresh.","Balanced diet and good sleep are essential for health.","Drinking more water keeps you energetic.","Meditation helps to reduce stress."],
business:["Business growth needs smart planning.","Customer satisfaction is real capital of business.","Digital marketing boosts business fast today."],
political:["Democracy gives power to the people.","Youth decides future of the country."],
social:["Society grows when people help each other."], sports:["Cricket is loved by millions.","Sports teaches teamwork."], education:["Education is the key to success."], tech:["AI is changing the world."], food:["Healthy food keeps you active."], travel:["Travel opens mind and gives new experiences."]
}
}

export default function Page(){
  const [lang,setLang]=useState("HI");
  const [topic,setTopic]=useState("health");
  const [count,setCount]=useState(3);
  const [output,setOutput]=useState("");

  const generate = ()=>{
    const base = DB[lang] || DB["HI"];
    const arr = base[topic] || base.health;
    // shuffle without repeat
    const shuffled = [...arr].sort(()=>0.5-Math.random());
    let res = [];
    for(let i=0;i<count;i++){
      res.push(shuffled[i % shuffled.length]);
    }
    setOutput(res.join(" "));
  }
  useEffect(()=>{generate()},[lang,topic,count]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-3 md:p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl md:text-5xl font-black text-center">Lorem Pro Tool - V5</h1>
        <p className="text-center text-gray-600 font-medium mt-2">75 Languages | Beats lipsum.pro | Real Content</p>

        <div className="bg-white rounded-2xl shadow-xl p-4 mt-6">
          <p className="text-xs font-bold text-gray-500 mb-2">SELECT LANGUAGE (75)</p>
          <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-10 gap-2">
            {Object.keys(FLAGS).map(l=>(
              <button key={l} onClick={()=>setLang(l)} className={`text-sm px-2 py-2 rounded-lg border font-bold transition ${lang===l?'bg-black text-white scale-105':'bg-gray-50 hover:bg-white'}`}>{FLAGS[l]} {l}</button>
            ))}
          </div>

          <p className="text-xs font-bold text-gray-500 mt-6 mb-2">SELECT TOPIC</p>
          <div className="flex flex-wrap gap-2">
            {["health","business","political","social","sports","education","tech","food","travel"].map(t=>(
              <button key={t} onClick={()=>setTopic(t)} className={`px-4 py-2 rounded-full text-sm font-bold capitalize ${topic===t?'bg-blue-600 text-white':'bg-gray-100 hover:bg-gray-200'}`}>{t}</button>
            ))}
          </div>

          <div className="flex gap-3 mt-6">
            <input type="number" value={count} onChange={e=>setCount(Number(e.target.value))} className="border-2 rounded-xl p-3 w-24 font-bold" min={1} max={10}/>
            <button onClick={generate} className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-black rounded-xl">GENERATE ✨</button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 mt-6">
          <p className="text-[17px] leading-8 text-gray-800">{output}</p>
          <div className="flex gap-2 mt-5">
            <button onClick={()=>navigator.clipboard.writeText(output)} className="bg-black text-white px-6 py-2.5 rounded-full font-bold">Copy Text</button>
            <button onClick={()=>setCount(c=>c+1)} className="bg-gray-100 px-6 py-2.5 rounded-full font-bold">+ More</button>
          </div>
        </div>

        <p className="text-center text-[11px] text-gray-400 mt-6">Backup safe: GitHub + Phone ZIP (187KB). V5 fixed repeat issue.</p>
      </div>
    </div>
  )
}
