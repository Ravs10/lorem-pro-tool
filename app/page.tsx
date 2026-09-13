"use client";
import { useState, useEffect } from "react";

const FLAGS:any={EN:"🇺🇸",HI:"🇮🇳",ES:"🇪🇸",FR:"🇫🇷",DE:"🇩🇪",AR:"🇸🇦",PT:"🇵🇹",RU:"🇷🇺",JA:"🇯🇵",IT:"🇮🇹",BN:"🇧🇩",UR:"🇵🇰"}
const COLORS:any={EN:["#3b82f6","#60a5fa"],HI:["#f97316","#fb923c"],ES:["#ef4444","#f87171"],FR:["#8b5cf6","#a78bfa"],DE:["#1f2937","#6b7280"],AR:["#059669","#10b981"],PT:["#0891b2","#22d3ee"],RU:["#2563eb","#60a5fa"],JA:["#db2777","#f472b6"],IT:["#16a34a","#4ade80"],BN:["#dc2626","#fb7185"],UR:["#15803d","#22c55e"]}

const DB:any={
  EN:{
    words:["lorem","ipsum","health","business","politics","social","sports","education","tech","food","travel"],
    health:["Healthy life needs daily exercise and yoga","Drink water and eat green vegetables","Meditation improves mental health","Sleep 8 hours for better health"],
    business:["Business growth needs smart planning and strategy","Marketing is key to success","Customer satisfaction is top priority","Startup needs funding and team"],
    political:["Democracy is important for every citizen","Elections decide the future of the country","Political debates should be peaceful","Good governance needs transparency","Vote is the power of common people"],
    social:["Society grows when people help each other","Social media connects people worldwide","Respect and equality are basic rights","Community service makes society better"],
    sports:["Cricket is loved by millions of fans","Daily sports keeps body fit and active","Football World Cup brings nations together","Sports teaches teamwork and discipline","Practice makes a perfect player"],
    education:["Education is the key to success","Online learning is future of education","Teachers build the nation","Reading books improves knowledge"],
    tech:["Artificial Intelligence is changing the world","Technology makes life easier and faster","Smartphones connect everyone","Coding is the language of future"],
    food:["Healthy food keeps you active all day","Street food has unique taste","Cooking is an art and skill","Eat fresh fruits daily"],
    travel:["Travel opens mind and gives experience","Mountains give peace and adventure","Beach holidays are relaxing","Travel teaches new cultures"],
    default:["Lorem ipsum dolor sit amet consectetur adipiscing elit","This is dummy placeholder text for design mockups and wireframes","Use this text for your next web project"]
  },
  HI:{
    words:["स्वास्थ्य","व्यापार","राजनीति","समाज","खेल","शिक्षा","तकनीक","भोजन","यात्रा"],
    health:["स्वस्थ जीवन के लिए रोज व्यायाम जरूरी है","रोज फल और हरी सब्जियां खाएं","ध्यान से मन शांत रहता है","8 घंटे की नींद जरूरी है"],
    business:["व्यापार बढ़ाने के लिए अच्छी योजना चाहिए","मार्केटिंग सफलता की कुंजी है","ग्राहक की संतुष्टि सबसे जरूरी है"],
    political:["लोकतंत्र में हर नागरिक का वोट महत्वपूर्ण है","चुनाव देश का भविष्य तय करते हैं","राजनीति में पारदर्शिता जरूरी है","अच्छा नेतृत्व देश को आगे ले जाता है","मतदान हर नागरिक का अधिकार है"],
    social:["समाज तभी आगे बढ़ता है जब लोग एक दूसरे की मदद करें","सामाजिक समानता जरूरी है","सामुदायिक सेवा समाज को बेहतर बनाती है","एकता में शक्ति है"],
    sports:["क्रिकेट भारत में सबसे लोकप्रिय खेल है","रोज खेलने से शरीर फिट रहता है","फुटबॉल दुनिया का सबसे देखा जाने वाला खेल है","खेल अनुशासन सिखाता है","अभ्यास से खिलाड़ी महान बनता है"],
    education:["शिक्षा सफलता की कुंजी है","ऑनलाइन पढ़ाई भविष्य है","शिक्षक राष्ट्र का निर्माण करते हैं","किताबें पढ़ने से ज्ञान बढ़ता है"],
    tech:["आर्टिफिशियल इंटेलिजेंस दुनिया बदल रहा है","तकनीक
