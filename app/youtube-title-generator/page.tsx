"use client";

import { useEffect, useMemo, useState } from "react";

type Lang = "en" | "hi" | "es";
type Tone = "Viral" | "Professional" | "Funny" | "Educational";
type Theme = "dark" | "light";

type Result = {
  titles: string[];
  descriptions: string;
  tags: string[];
  hashtags: string;
  keywords: string[];
  thumbnails: string[];
  pinnedComment: string;
  chapters: string;
  language: string;
  keyword: string;
  niche: string;
  tone: string;
  date: string;
};

const translations: Record<Lang, Record<string, string>> = {
  en: {
    title: "YouTube Viral Kit Generator",
    topic: "Video topic or main keyword",
    niche: "Niche",
    tone: "Content tone",
    language: "Output language",
    generate: "✨ GENERATE VIRAL KIT 🚀",
    generating: "Generating...",
    titles: "Viral Title Ideas",
    description: "SEO Video Description",
    tags: "YouTube Tags",
    hashtags: "Hashtags",
    keywords: "Target Keywords",
    thumbnail: "Thumbnail Text Ideas",
    pinned: "Pinned Comment",
    chapters: "Suggested Chapters",
    copy: "Copy",
    copyAll: "Copy All",
    export: "Export TXT",
    empty: "Enter a topic to generate your YouTube kit.",
    info: "YouTube SEO Guide",
    history: "Recent History",
    clear: "Clear History",
    search: "Search in results...",
    seo: "SEO Checklist",
  },
  hi: {
    title: "YouTube वायरल किट जनरेटर",
    topic: "वीडियो का विषय या मुख्य कीवर्ड",
    niche: "विषय श्रेणी",
    tone: "कंटेंट का अंदाज़",
    language: "आउटपुट भाषा",
    generate: "✨ वायरल किट बनाएं 🚀",
    generating: "बनाया जा रहा है...",
    titles: "वीडियो टाइटल सुझाव",
    description: "SEO वीडियो डिस्क्रिप्शन",
    tags: "YouTube टैग",
    hashtags: "हैशटैग",
    keywords: "मुख्य कीवर्ड",
    thumbnail: "थंबनेल टेक्स्ट सुझाव",
    pinned: "पिन किया जाने वाला कमेंट",
    chapters: "सुझाए गए चैप्टर",
    copy: "कॉपी",
    copyAll: "सब कॉपी करें",
    export: "TXT डाउनलोड",
    empty: "YouTube किट बनाने के लिए विषय लिखें।",
    info: "YouTube SEO गाइड",
    history: "हाल की हिस्ट्री",
    clear: "हिस्ट्री साफ करें",
    search: "रिजल्ट में खोजें...",
    seo: "SEO चेकलिस्ट",
  },
  es: {
    title: "Generador de Kit Viral para YouTube",
    topic: "Tema del video o palabra clave",
    niche: "Nicho",
    tone: "Estilo de contenido",
    language: "Idioma de salida",
    generate: "✨ GENERAR KIT 🚀",
    generating: "Generando...",
    titles: "Ideas de títulos",
    description: "Descripción SEO",
    tags: "Etiquetas de YouTube",
    hashtags: "Hashtags",
    keywords: "Palabras clave",
    thumbnail: "Texto para miniaturas",
    pinned: "Comentario fijado",
    chapters: "Capítulos sugeridos",
    copy: "Copiar",
    copyAll: "Copiar todo",
    export: "Exportar TXT",
    empty: "Introduce un tema para generar tu kit.",
    info: "Guía SEO de YouTube",
    history: "Historial reciente",
    clear: "Borrar historial",
    search: "Buscar en resultados...",
    seo: "Lista SEO",
  },
};

const niches = [
  "General", "Tech", "Finance", "Gaming", "Vlog", "Education",
  "Cricket", "Chess", "Food", "Travel", "Fitness", "Business",
  "Entertainment", "Lifestyle", "News", "Comedy",
];

const tones: Tone[] = [
  "Viral", "Professional", "Funny", "Educational",
];

const SITE_URL = "https://lorem-pro-tool.run4ravish.workers.dev/";
const getCTRScore = (title: string) => {
  let score = 70;
  if (title.length >= 45 && title.length <= 65) score += 10;
  if (/\d+/.test(title)) score += 5;
  if (/[!?]|You Won't Believe|Mistakes|Secret|Trick|Complete|Ultimate/i.test(title)) score += 8;
  if (title.includes(":") || title.includes("-")) score += 3;
  return Math.min(score, 98);
};
const getTitleTemplates = (
  keyword: string,
  niche: string,
  tone: Tone,
  lang: Lang,
) => {
  const randNum = () => Math.floor(Math.random() * 5) + 3; // 3 se 7 tak random
  const year = new Date().getFullYear();

  if (lang === "hi") {
    const base = [
      `${keyword}: ये ${randNum()} बातें जानना बेहद जरूरी है!`,
      `${keyword} कैसे करें? पूरी जानकारी हिंदी में ${year}`,
      `${keyword} के बारे में पूरी सच्चाई!`,
      `${keyword}: शुरुआती लोगों की ${randNum()} बड़ी गलतियां`,
      `${keyword} की ऐसी ट्रिक जो आपका काम आसान कर देगी`,
      `${keyword} का पूरा गाइड | ${niche} हिंदी`,
      `${keyword} सीखें आसान तरीके से`,
      `${keyword}: ये गलतियां मत करना!`,
      `${keyword} के जरूरी टिप्स और ट्रिक्स ${year}`,
      `${keyword} Explained in Hindi - ${randNum()} Tips`,
      `${keyword}: ${randNum()} aise tarike jo kaam karte hain ${year} me`,
      `${keyword}: ये ${randNum()} तरीके जो ${year} में काम करते हैं`,
`${keyword} कैसे बनाएं? स्टेप बाय स्टेप पूरी जानकारी`,
`${keyword} में पैसे कैसे कमाएं ${year} में`,
`${keyword} का सबसे अच्छा तरीका क्या है?`,
`${keyword} में सफल कैसे बनें`,
`${keyword} की पूरी जानकारी हिंदी में`,
`${keyword} के फायदे और नुकसान`,
`${keyword} से घर बैठे कमाई कैसे करें`,
`${keyword} को वायरल कैसे करें ${year} में`,
`${keyword} में व्यूज कैसे बढ़ाएं`,
`${keyword} में सब्सक्राइबर कैसे बढ़ाएं`,
`${keyword} की सीक्रेट ट्रिक ${year}`,
`${keyword} में आने वाली ${randNum()} बड़ी गलतियां`,
`${keyword} का पूरा रोडमैप ${year}`,
`${keyword} क्या है? पूरी जानकारी`,
`${keyword} कैसे काम करता है?`,
`${keyword} के लिए बेस्ट टिप्स ${year}`,
`${keyword} में एक्सपर्ट कैसे बनें`,
`${keyword} में करियर कैसे बनाएं`,
`${keyword} कैसे शुरू करें जीरो से`,
`${keyword} कैसे सीखें मोबाइल से`,
`${keyword} कैसे करें बिना पैसे के`,
`${keyword} कैसे करें आसान भाषा में`,
`${keyword} कैसे करें ${randNum()} दिन में`,
`${keyword} कैसे बनाएं और वायरल करें`,
`${keyword} कैसे बनाएं 2026 में`,
`${keyword} कैसे बनाएं पैसे कमाने के लिए`,
`${keyword} में थंबनेल कैसे बनाएं`,
`${keyword} में टाइटल कैसे लिखें`,
`${keyword} का एसईओ कैसे करें`,
`${keyword} का एल्गोरिदम क्या है`,
`${keyword} में वॉच टाइम कैसे बढ़ाएं`,
`${keyword} का मोनेटाइजेशन कैसे करें`,
`${keyword} पर व्यूज क्यों नहीं आ रहे`,
`${keyword} को फास्ट कैसे ग्रो करें`,
`${keyword} का भविष्य क्या है ${year} में`,
`${keyword} से फेमस कैसे बनें`,
`${keyword} से लाखों कैसे कमाएं`,
`${keyword} का कंप्लीट कोर्स फ्री में`,
`${keyword} की कमाई कैसे होती है`,
`${keyword} के लिए बेस्ट ऐप कौन सा है`,
`${keyword} के लिए बेस्ट वेबसाइट`,
`${keyword} में मोटिवेशन कैसे लाएं`,
`${keyword} में 1M व्यूज कैसे लाएं`,
`${keyword} कैसे करें और सफल बनें`,
`${keyword}: मेरी ${randNum()} दिन की जर्नी`,
`${keyword} का काला सच ${year} में`,
`${keyword} vs ${niche} कौन सा बेस्ट है`,
`${keyword} में ये गलती कभी मत करना`,
`${keyword} कैसे करें प्रो की तरह`,
`${keyword} में ये ट्रिक काम करेगी`,
`${keyword} में ये हैक काम करता है`,
`${keyword} में ये सीक्रेट कोई नहीं बताता`,
`${keyword} कैसे करें बिना लैपटॉप के`,
`${keyword} कैसे करें जॉब के साथ`,
`${keyword} कैसे करें स्टूडेंट लाइफ में`,
`${keyword} कैसे करें घर से`,
`${keyword} कैसे करें और 1 लाख कमाएं`,
`${keyword} कैसे करें कम कंपटीशन में`,
`${keyword} कैसे करें ज्यादा कमाई के लिए`,
`${keyword} कैसे करें ट्रेंडिंग टॉपिक पर`,
`${keyword} कैसे करें यूट्यूब पर`,
`${keyword} यूट्यूब चैनल कैसे बनाएं`,
`${keyword} यूट्यूब वीडियो कैसे बनाएं`,
`${keyword} यूट्यूब पर कैसे वायरल करें`,
`${keyword} यूट्यूब ग्रोथ ${year}`,
`${keyword} यूट्यूब सक्सेस मंत्र`,
`${keyword} यूट्यूब टिप्स हिंदी ${year}`,
`${keyword} यूट्यूब ट्रिक्स जो काम करती हैं`,
`${keyword} यूट्यूब एल्गोरिदम कैसे काम करता है`,
`${keyword} यूट्यूब पर कैसे लाएं`,
`${keyword} यूट्यूब पर सर्च कैसे करें`,
`${keyword} यूट्यूब पर टॉप पर कैसे लाएं`,
`${keyword} यूट्यूब पर पैसे कैसे कमाएं`,
`${keyword} यूट्यूब शॉर्ट कैसे बनाएं`,
`${keyword} यूट्यूब लाइव कैसे करें`,
`${keyword} यूट्यूब एसईओ कैसे करें ${year} में`,
`${keyword} के वायरल टैग कैसे बनाएं`,
`${keyword} के वायरल हैशटैग कैसे बनाएं`,
`${keyword} कैसे बनाएं और रैंक करें`,
`${keyword} कैसे बनाएं और यूट्यूब पर डालें`,
`${keyword} कैसे बनाएं और पैसा कमाएं`,
`${keyword} कैसे बनाएं और फेमस बनें`,
`${keyword} कैसे बनाएं और ग्रोथ करें`,
`${keyword} कैसे बनाएं और व्यूज लाएं`,
`${keyword} कैसे बनाएं और सब्सक्राइबर बढ़ाएं`,
`${keyword} कैसे बनाएं एक दिन में`,
`${keyword} कैसे बनाएं 5 मिनट में`,
`${keyword} कैसे बनाएं 10 मिनट में`,
`${keyword} कैसे बनाएं बिना चेहरा दिखाए`,
`${keyword} कैसे बनाएं बिना आवाज के`,
`${keyword} कैसे बनाएं एआई की मदद से`,
`${keyword} कैसे बनाएं मोबाइल से प्रो लेवल`,
`${keyword} कैसे बनाएं लैपटॉप से`,
`${keyword} कैसे बनाएं फ्री में`,
`${keyword} कैसे बनाएं और मोनेटाइज करें`,
`${keyword} कैसे बनाएं और बेचें`,
`${keyword} कैसे बनाएं और ब्रांड बनाएं`,
`${keyword} कैसे बनाएं और वायरल करें ${year} में`,
`${keyword} में पैसा है या नहीं ${year} में`,
`${keyword} करना चाहिए या नहीं ${year} में`,
`${keyword} में कंपटीशन कितना है`,
`${keyword} में सबसे ज्यादा पैसे कैसे कमाएं`,
`${keyword} में 0 से शुरुआत कैसे करें`,
`${keyword} पर मेरा Honest Review ${year} में`,
`${keyword}: क्या ये सच में काम करता है?`,
`${keyword} की Unboxing और पहली झलक`,
`${keyword} का सस्ता vs महंगा Comparison`,
`${keyword} के ${randNum()} सबसे अच्छे विकल्प ${year} में`,
`${keyword} Challenge - क्या मैं ${randNum()} दिन में कर पाया?`,
`${keyword} के साथ मेरा एक पूरा दिन | Daily Vlog`,
`${keyword} करते हुए मेरी हालत खराब हो गई`,
`${keyword} पर ${randNum()} घंटे बिताए और ये सीखा`,
`${keyword} से मेरी जिंदगी कैसे बदली`,
`${keyword}: मेरी Fail होने की कहानी`,
`${keyword} ने मुझे क्या सिखाया ${year} में`,
`${keyword} पर हार मानने से पहले ये देखो`,
`${keyword} से पहले और बाद की जिंदगी`,
`${keyword} मेरी सबसे बड़ी गलती थी?`,
`${keyword} करने का सबसे आसान तरीका कोई नहीं बताता`,
`${keyword} पर ${randNum()} मिथक जो सब सच मानते हैं`,
`${keyword} के बारे में कड़वी सच्चाई`,
`${keyword}: क्या आप भी ये झूठ मानते हैं?`,
`${keyword} का ऐसा सच जो ${niche} वाले छुपाते हैं`,
`${keyword} vs ${niche} - कौन सा बेहतर है ${year} में?`,
`${keyword} के साथ ${niche} का Jugalbandi`,
`${keyword} और ${niche} में क्या फर्क है?`,
`${keyword} क्यों ${niche} से बेहतर है`,
`${keyword} क्यों लेना चाहिए ${year} में?`,
`${keyword} लेने से पहले ये ${randNum()} बातें जान लो`,
`${keyword} खरीदने लायक है या नहीं?`,
`${keyword} का Price और Features ${year}`,
`${keyword} का सबसे सस्ता जुगाड़`,
`${keyword} फ्री में कैसे लें ${year} में`,
`${keyword} से ${randNum()} दिन में क्या-क्या बदला`,
`${keyword} से मैंने पहला रुपया कैसे कमाया`,
`${keyword} का पहला दिन - मेरी कहानी`,
`${keyword} पर Live Q&A - आपके सारे सवालों के जवाब`,
`${keyword} पर सब्सक्राइबर ने क्या पूछा?`,
`${keyword} पर आपके कमेंट्स का जवाब`,
`${keyword} के बारे में Google पर क्या है?`,
`${keyword} के बारे में लोगों की राय क्या है?`,
`${keyword} के लिए मेरे Top ${randNum()} Gadgets`,
`${keyword} के लिए मेरा Setup Tour ${year}`,
`${keyword} कैसे करता हूं मैं - Behind The Scenes`,
`${keyword} की Editing कैसे करता हूं`,
`${keyword} की Script कैसे लिखता हूं`,
`${keyword} के लिए Thumbnail कैसे बनाया`,
`${keyword} का Title कैसे सोचा`,
`${keyword} पर Views नहीं आ रहे तो ये करो`,
`${keyword} पर Comment क्यों नहीं आते?`,
`${keyword} पर Like कैसे बढ़ाएं`,
`${keyword} पर Share कैसे बढ़ाएं`,
`${keyword} को Superfast कैसे बनाएं`,
`${keyword} को ${randNum()} गुना तेज कैसे करें`,
`${keyword} का Secret Formula ${year}`,
`${keyword} का Hidden Feature जो कोई नहीं जानता`,
`${keyword} में ये Setting ON कर लो`,
`${keyword} में ये Setting OFF कर दो वरना पछताओगे`,
`${keyword} का Best Time क्या है पोस्ट करने का?`,
`${keyword} कब पोस्ट करना चाहिए ${year} में`,
`${keyword} की Timing का सच`,
`${keyword} Morning में करें या Night में?`,
`${keyword} से जुड़ी मेरी ${randNum()} भविष्यवाणी ${year} के लिए`,
`${keyword} का Future क्या होगा ${year} के बाद?`,
`${keyword} खत्म होने वाला है क्या?`,
`${keyword} का नया Update आ गया ${year} में`,
`${keyword} के नए Rules ${year}`,
`${keyword} के नए Features जो आपको जानने चाहिए`,
`${keyword} पर नया क्या है ${year} में?`,
`${keyword} पुराने vs नए में क्या बदला?`,
`${keyword} का Old vs New Comparison`,
`${keyword} का Evolution - ${year} से अब तक`,
`${keyword} कैसे बदल गया है पिछले ${randNum()} सालों में`,
`${keyword} की History जो कोई नहीं बताता`,
`${keyword} की शुरुआत कैसे हुई थी?`,
`${keyword} किसने बनाया था?`,
`${keyword} का पूरा Timeline ${year}`,
`${keyword} पर Funny Moments Compilation`,
`${keyword} पर Memes Reaction`,
`${keyword} पर Try Not To Laugh Challenge`,
`${keyword} देखते हुए मैं हंस-हंस कर पागल हो गया`,
`${keyword} के सबसे Funny Comments`,
`${keyword} के मजेदार Facts ${year}`,
`${keyword} के बारे में ${randNum()} रोचक बातें`,
`${keyword} के बारे में अनसुनी बातें`,
`${keyword} के बारे में जो Wikipedia पर भी नहीं है`,
`${keyword} के ${randNum()} फायदे जो आपको हैरान कर देंगे`,
`${keyword} के नुकसान जो कोई नहीं बताता`,
`${keyword} से सावधान रहो - Scam Alert ${year}`,
`${keyword} में Fraud कैसे होता है?`,
`${keyword} असली है या नकली - कैसे पहचानें?`,
`${keyword} पर भरोसा करें या नहीं?`,
`${keyword} के लिए मेरी Final Advice`,
`${keyword} पर मेरी आखिरी वीडियो ${year} में`,
`${keyword} को लेकर मेरा आखिरी सच`,
`${keyword} छोड़ दूं क्या?`,
`${keyword} क्यों छोड़ रहा हूं - पूरी सच्चाई`,
`${keyword} का Case Study - ${randNum()} लोगों पर`,
`${keyword} का Data और Stats ${year} में`,
`${keyword} पर Research क्या कहती है?`,
`${keyword} पर Science क्या कहती है?`,
`${keyword} पर Experts की राय ${year} में`,
`${keyword} kaise banaye? Step by step puri jankari`,
`${keyword} me paise kaise kamaye ${year} me`,
`${keyword} ka best tarika kya hai?`,
`${keyword} me successful kaise bane`,
`${keyword} ki puri jankari Hindi me`,
`${keyword} ke fayde aur nuksan`,
`${keyword} se ghar baithe earning`,
`${keyword} viral kaise kare ${year} me`,
`${keyword} me views kaise badhaye`,
`${keyword} me subscriber kaise badhaye`,
`${keyword} ka secret trick ${year}`,
`${keyword} me aane wali ${randNum()} badi galtiyan`,
`${keyword} ka full roadmap ${year}`,
`${keyword} kya hai? Puri jankari`,
`${keyword} kaise kaam karta hai?`,
`${keyword} ke liye best tips ${year}`,
`${keyword} me expert kaise bane`,
`${keyword} me career kaise banaye`,
`${keyword} kaise start kare zero se`,
`${keyword} kaise sikhe mobile se`,
`${keyword} kaise kare bina paise ke`,
`${keyword} kaise kare aasan bhasha me`,
`${keyword} kaise kare ${randNum()} din me`,
`${keyword} kaise banaye aur viral kare`,
`${keyword} kaise banaye 2026 me`,
`${keyword} kaise banaye paise kamane ke liye`,
`${keyword} me thumbnail kaise banaye`,
`${keyword} me title kaise likhe`,
`${keyword} ka SEO kaise kare`,
`${keyword} ka algorithm kya hai`,
`${keyword} me watch time kaise badhaye`,
`${keyword} monetization kaise kare`,
`${keyword} par views kyu nahi aa rahe`,
`${keyword} kaise grow kare fast`,
`${keyword} ka future kya hai ${year} me`,
`${keyword} se famous kaise bane`,
`${keyword} se lakho kaise kamaye`,
`${keyword} ka complete course free me`,
`${keyword} ki earning kaise hoti hai`,
`${keyword} ke liye best app kaunsa hai`,
`${keyword} ke liye best website`,
`${keyword} me motivation kaise laye`,
`${keyword} me 1M views kaise laye`,
`${keyword} kaise kare aur successful bane`,
`${keyword}: Meri ${randNum()} din ki journey`,
`${keyword} ka dark sach ${year} me`,
`${keyword} vs ${niche} kaunsa best hai`,
`${keyword} me ye galti kabhi mat karna`,
`${keyword} kaise kare pro ki tarah`,
`${keyword} me ye trick kaam karegi`,
`${keyword} me ye hack kaam karta hai`,
`${keyword} me ye secret koi nahi batata`,
`${keyword} kaise kare bina laptop ke`,
`${keyword} kaise kare job ke sath`,
`${keyword} kaise kare student life me`,
`${keyword} kaise kare ghar se`,
`${keyword} kaise kare aur 1 lakh kamaye`,
`${keyword} kaise kare low competition me`,
`${keyword} kaise kare high earning ke liye`,
`${keyword} kaise kare trending topic par`,
`${keyword} kaise kare YouTube par`,
`${keyword} YouTube channel kaise banaye`,
`${keyword} YouTube video kaise banaye`,
`${keyword} YouTube par kaise viral kare`,
`${keyword} YouTube growth ${year}`,
`${keyword} YouTube success mantra`,
`${keyword} YouTube tips Hindi ${year}`,
`${keyword} YouTube tricks jo kaam karte hain`,
`${keyword} YouTube algorithm kaise kaam karta hai`,
`${keyword} YouTube par kaise laye`,
`${keyword} YouTube par search kaise kare`,
`${keyword} YouTube par top par kaise laye`,
`${keyword} YouTube par paise kaise kamaye`,
`${keyword} YouTube short kaise banaye`,
`${keyword} YouTube live kaise kare`,
`${keyword} YouTube SEO kaise kare ${year} me`,
`${keyword} ke viral tags kaise banaye`,
`${keyword} ke viral hashtags kaise banaye`,
`${keyword} kaise banaye aur rank kare`,
`${keyword} kaise banaye aur YouTube par dalen`,
`${keyword} kaise banaye aur paisa kamaye`,
`${keyword} kaise banaye aur famous bane`,
`${keyword} kaise banaye aur growth kare`,
`${keyword} kaise banaye aur views laye`,
`${keyword} kaise banaye aur subscriber badhaye`,
`${keyword} kaise banaye ek din me`,
`${keyword} kaise banaye 5 minute me`,
`${keyword} kaise banaye 10 minute me`,
`${keyword} kaise banaye bina face dikhaye`,
`${keyword} kaise banaye bina voice ke`,
`${keyword} kaise banaye AI ki madad se`,
`${keyword} kaise banaye mobile se pro level`,
`${keyword} kaise banaye laptop se`,
`${keyword} kaise banaye free me`,
`${keyword} kaise banaye aur monetize kare`,
`${keyword} kaise banaye aur sell kare`,
`${keyword} kaise banaye aur brand banaye`,
`${keyword} kaise banaye aur viral karen ${year} me`,
`${keyword} me paisa hai ya nahi ${year} me`,
`${keyword} karna chahiye ya nahi ${year} me`,
`${keyword} me competition kitna hai`,
`${keyword} me sabse jyada paise kaise kamaye`,
`${keyword} me 0 se start kaise kare`,
    ];
    return base.sort(() => Math.random() - 0.5);
  }

if (lang === "es") {
    const base = [
      `${keyword}: La guía completa para principiantes ${year}`,
      `${keyword}: ${randNum()} errores que debes evitar`,
      `Cómo funciona ${keyword}: explicación sencilla`,
      `${keyword}: Consejos y trucos esenciales ${year}`,
      `Todo lo que debes saber sobre ${keyword}`,
      `${keyword} en 10 minutos: guía práctica`,
      `La verdad sobre ${keyword} en ${year}`,
      `${keyword}: Lo que nadie te explica`,
      `Aprende ${keyword} paso a paso`,
      `${keyword}: Guía de ${niche} con ${randNum()} consejos`,
      `Cómo hacer ${keyword} paso a paso en ${year}`,
      `Cómo ganar dinero con ${keyword} en ${year}`,
      `${keyword}: ${randNum()} secretos que nadie te cuenta`,
      `${keyword} para principiantes - Guía completa`,
      `${keyword}: Todo lo que necesitas saber en ${year}`,
      `${keyword} explicado fácil y rápido`,
      `Cómo crecer en ${keyword} en ${year}`,
      `Cómo ser viral con ${keyword} en ${year}`,
      `Cómo conseguir más vistas en ${keyword}`,
      `Cómo conseguir suscriptores en ${keyword}`,
      `${keyword}: Errores comunes que debes evitar en ${year}`,
      `${keyword}: La verdad que nadie te dice`,
      `${keyword} en 5 minutos - Tutorial rápido`,
      `${keyword} en 10 minutos - Guía completa ${year}`,
      `${keyword}: Estrategia que realmente funciona`,
      `${keyword} desde cero hasta experto en ${year}`,
      `${keyword}: Mi experiencia de ${randNum()} días`,
      `Por qué tu ${keyword} no funciona y cómo arreglarlo`,
      `Cómo arreglar tu ${keyword} ahora mismo`,
      `${keyword}: Trucos que cambiarán tu vida`,
      `${keyword} vs ${niche} - Cuál es mejor en ${year}?`,
      `${keyword}: Lo que desearía haber sabido antes`,
      `${keyword}: Caso de estudio - Cómo conseguí 1M vistas`,
      `La mejor estrategia de ${keyword} en ${year}`,
      `${keyword}: Hoja de ruta completa hacia el éxito`,
      `Vale la pena ${keyword} en ${year}? Review honesta`,
      `Atajos de ${keyword} que usan los profesionales`,
      `Mitos sobre ${keyword} desmentidos en ${year}`,
      `Aprende ${keyword} más rápido que el 99%`,
      `${keyword}: Cuánto dinero puedes ganar en ${year}`,
      `${keyword}: Review de mis ${randNum()} días`,
      `${keyword} Preguntas y respuestas en vivo`,
      `${keyword} motivación que te cambiará`,
      `La psicología detrás de ${keyword}`,
      `Técnicas avanzadas de ${keyword} para ${niche}`,
      `Herramientas de ${keyword} que necesitas en ${year}`,
      `${keyword} ingresos pasivos - Cómo hacerlo en ${year}`,
      `${keyword} desde casa - Cómo empezar hoy`,
      `${keyword} sin inversión - Es posible en ${year}?`,
      `${keyword} sin mostrar tu cara - Guía ${year}`,
      `${keyword} con IA - Guía completa ${year}`,
      `Cómo hacer ${keyword} con el móvil en ${year}`,
      `Cómo hacer ${keyword} gratis en ${year}`,
      `Cómo monetizar tu ${keyword} en ${year}`,
      `Cómo viralizar tu ${keyword} en YouTube ${year}`,
      `Cómo hacer SEO para ${keyword} en ${year}`,
      `Algoritmo de ${keyword} explicado en ${year}`,
      `Tendencias de ${keyword} en ${year}`,
      `Futuro de ${keyword} en ${year}`,
      `Cómo crear un canal de ${keyword} exitoso`,
      `Ideas de videos sobre ${keyword} que son virales`,
      `Ideas de contenido para ${keyword} en ${year}`,
      `Cómo encontrar nicho para ${keyword}`,
      `Cómo buscar palabras clave para ${keyword}`,
      `Cómo escribir títulos para ${keyword} que enganchan`,
      `Cómo hacer miniaturas para ${keyword}`,
      `Mejores hashtags para ${keyword} en ${year}`,
      `Mejores etiquetas para ${keyword}`,
      `Cómo aumentar el watch time en ${keyword}`,
      `Por qué no tienes vistas en ${keyword} y solución`,
      `Cómo crecer rápido en ${keyword} en ${year}`,
      `Cómo ser famoso con ${keyword}`,
      `Cómo ganar 1000 euros con ${keyword} en ${year}`,
      `${keyword} para pequeños canales en ${year}`,
      `${keyword} para nuevos YouTubers - Guía ${year}`,
      `${keyword} masterclass completa ${year}`,
      `${keyword} curso completo gratis ${year}`,
      `${keyword} guía definitiva ${year}`,
      `${keyword} todo en un video - Completo`,
      `${keyword} explicado en detalle ${year}`,
      `${keyword} hecho fácil para todos`,
      `${keyword} sin complicaciones - ${year}`,
      `${keyword}: No cometas este gran error en ${year}`,
      `${keyword} consejos de expertos en ${year}`,
      `${keyword} trucos de expertos que funcionan`,
      `${keyword} hacks que funcionan en ${year}`,
      `${keyword} crecimiento exponencial en ${year}`,
      `${keyword} cómo lo hice yo - Historia real`,
      `Mi viaje con ${keyword} - Lo que aprendí en ${randNum()} días`,
      `${keyword} lado oscuro que nadie ve en ${year}`,
      `${keyword} cómo empezar desde cero en ${year}`,
      `${keyword} cómo empezar hoy mismo sin dinero`,
      `${keyword} cómo ganar tu primer euro en ${year}`,
      `${keyword} cómo llegar a 100K suscriptores`,
      `${keyword} cómo llegar a 1M vistas en ${year}`,
      `${keyword} mejores herramientas gratis en ${year}`,
      `${keyword} mejores apps para ${keyword} en ${year}`,
      `${keyword} mejores webs para ${keyword} en ${year}`,
      `${keyword} ingresos explicados ${year}`,
      `${keyword} prueba de ingresos real`,
      `${keyword} prueba en vivo ${year}`,
      `${keyword} tutorial avanzado ${year}`,
      `${keyword} tutorial básico ${year}`,
      `${keyword} guía para principiantes ${year}`,
      `${keyword} guía paso a paso completa ${year}`,
      `${keyword} todo lo que debes saber en ${year}`,
      `${keyword} lo que necesitas saber antes de empezar`,
      `${keyword} qué es y cómo funciona realmente`,
      `${keyword} cómo funciona realmente en ${year}`,
      `${keyword} explicación sencilla y completa`,
      `${keyword} sin experiencia previa - Empieza hoy`,
      `${keyword}: El secreto que nadie te cuenta en ${year}`,
      `${keyword}: ${randNum()} formas de ganar dinero extra`,
      `${keyword}: La fórmula secreta del éxito`,
      `${keyword}: El truco oculto que debes activar`,
      `${keyword}: Mejor hora para publicar en ${year}`,
      `${keyword}: Predicciones para ${year}`,
      `${keyword}: Estará muerto después de ${year}?`,
      `${keyword}: Nueva actualización importante ${year}`,
      `${keyword}: Nuevas reglas que debes saber ${year}`,
      `${keyword}: Nuevas funciones increíbles`,
      `Evolución de ${keyword} desde ${year}`,
      `Historia de ${keyword} que nadie cuenta`,
      `${keyword}: Momentos más divertidos - Recopilación`,
      `${keyword}: Reacción a memes de ${keyword}`,
      `${keyword}: Datos curiosos que te sorprenderán`,
      `${keyword}: Beneficios que te dejarán boquiabierto`,
      `${keyword}: Desventajas que nadie menciona`,
      `${keyword}: Alerta de estafa en ${year}`,
      `${keyword} real vs falso - Cómo identificar`,
      `Mi consejo final para ${keyword} en ${year}`,
      `Debería dejar ${keyword}? Mi verdad`,
      `Por qué dejo ${keyword} - La verdad completa`,
      `${randNum()} días sin ${keyword} - Qué pasó?`,
      `Experimento de ${randNum()} días con ${keyword}`,
      `Resultados de ${randNum()} días con ${keyword}`,
      `Prueba real de ${keyword} - Funciona?`,
      `${keyword} datos y estadísticas en ${year}`,
      `Qué dice la ciencia sobre ${keyword}?`,
      `Qué dicen los expertos sobre ${keyword} en ${year}`,
      `Cómo empezar ${keyword} desde cero en ${year}`,
      `Cómo aprender ${keyword} desde el móvil`,
      `Cómo hacer ${keyword} sin dinero y sin laptop`,
      `Cómo hacer ${keyword} en ${randNum()} días`,
      `Cómo crear y viralizar ${keyword} en ${year}`,
      `Mejor app para ${keyword} en ${year}`,
      `Mejor web para ${keyword} en ${year}`,
      `Cómo conseguir motivación para ${keyword}`,
      `El lado oscuro de ${keyword} en ${year}`,
      `Nunca cometas este error en ${keyword}`,
      `Cómo hacer ${keyword} como un profesional`,
      `Este truco funciona en ${keyword} - Probado`,
      `Este hack funciona para ${keyword} en ${year}`,
      `Secreto de ${keyword} que nadie revela`,
      `Cómo hacer ${keyword} con trabajo a tiempo completo`,
      `Cómo hacer ${keyword} siendo estudiante`,
      `Cómo ganar dinero desde casa con ${keyword}`,
      `${keyword} SEO YouTube en ${year}`,
      `${keyword} Explicación del algoritmo ${year}`,
      `${keyword} Futuro - Qué pasará en ${year}`,
      `Cómo crear contenido viral sobre ${keyword}`,
      `Cómo buscar nicho rentable para ${keyword}`,
      `Cómo escribir descripciones para ${keyword}`,
      `Hashtags virales para ${keyword} en ${year}`,
      `Tags virales para ${keyword}`,
      `Cómo aumentar retención en ${keyword}`,
      `Por qué no creces en ${keyword} - Error fatal`,
      `Cómo crecer rápido con ${keyword} en ${year}`,
      `Cómo hacerte famoso con ${keyword} en ${year}`,
      `Cómo ganar $1000 con ${keyword} - Método`,
      `${keyword} para canales pequeños - Guía ${year}`,
      `${keyword}: El método que me hizo viral`,
      `${keyword}: Mi primera ganancia explicada`,
      `${keyword}: Mi primer día - Historia completa`,
      `${keyword}: Directo Q&A - Respondo todo`,
      `${keyword}: Qué dice Google sobre ${keyword}`,
      `${keyword}: Mi setup completo para ${keyword} ${year}`,
      `Cómo edito mis videos de ${keyword}`,
      `Cómo escribo guiones para ${keyword}`,
      `Cómo hago miniaturas para ${keyword} que convierten`,
      `Cómo pienso títulos para ${keyword}`,
      `${keyword}: Completo sin rostro, sin voz, con IA`,
      `${keyword} con móvil nivel pro en ${year}`,
      `${keyword} gratis y monetizable en ${year}`,
      `${keyword}: Dinero real o mentira en ${year}?`,
      `${keyword}: Deberías hacerlo o no en ${year}?`,
      `${keyword}: Competencia y demanda en ${year}`,
      `${keyword}: Cómo ganar más dinero que todos`,
      `${keyword}: Cómo empezar desde 0 en ${year}`,
      `${keyword}: Mi review honesto en ${year}`,
    ];
    return base.sort(() => Math.random() - 0.5);
  }

  const viral = [
    `${keyword}: ${randNum()} Things Beginners Must Know in ${year}`,
    `I Tried ${keyword} for ${randNum()} Days — Here's What I Learned`,
    `${keyword}: ${randNum()} Mistakes You Should Avoid in ${year}`,
    `The Ultimate ${keyword} Guide for Beginners ${year}`,
    `${keyword} Explained in ${randNum()} Minutes`,
    `What Nobody Tells You About ${keyword}`,
    `${keyword}: ${randNum()} Tips That Make a Difference`,
    `How to Master ${keyword} Step by Step (${year})`,
    `${keyword}: The Complete ${niche} Guide`,
    `Before You Try ${keyword}, Watch This!`,
    `${keyword} Review: Does It Really Work in ${year}?`,
    `${keyword} Unboxing & First Impressions ${year}`,
    `${keyword}: Cheap vs Expensive Comparison`,
    `${keyword}: Top ${randNum()} Alternatives in ${year}`,
    `${keyword} Challenge - Can I Do It in ${randNum()} Days?`,
    `A Day With ${keyword} | My Daily Vlog`,
    `I Spent ${randNum()} Hours on ${keyword} and Learned This`,
    `How ${keyword} Changed My Life`,
    `My Failure Story With ${keyword}`,
    `What ${keyword} Taught Me in ${year}`,
    `Don't Give Up on ${keyword} Before Watching This`,
    `${keyword}: My Life Before vs After`,
    `Was ${keyword} My Biggest Mistake?`,
    `The Easiest Way to Do ${keyword} Nobody Talks About`,
    `${randNum()} Myths About ${keyword} Everyone Believes`,
    `The Bitter Truth About ${keyword}`,
    `Do You Believe This Lie About ${keyword}?`,
    `The Truth About ${keyword} That ${niche} Gurus Hide`,
    `${keyword} vs ${niche} - Which is Better in ${year}?`,
    `${keyword} + ${niche} Combo - Does It Work?`,
    `Difference Between ${keyword} and ${niche}?`,
    `Why ${keyword} is Better Than ${niche}`,
    `Why You Should Get ${keyword} in ${year}`,
    `${randNum()} Things to Know Before Buying ${keyword}`,
    `Is ${keyword} Worth Buying in ${year}?`,
    `${keyword} Price & Features ${year}`,
    `Cheapest Hack for ${keyword}`,
    `How to Get ${keyword} For Free in ${year}`,
    `What Changed in ${randNum()} Days With ${keyword}`,
    `How I Made My First Dollar From ${keyword}`,
    `My First Day With ${keyword} - My Story`,
    `${keyword} Live Q&A - All Your Questions Answered`,
    `Your Questions About ${keyword} Answered`,
    `What Google Says About ${keyword}`,
    `What People Really Think About ${keyword}`,
    `My Top ${randNum()} Gadgets for ${keyword}`,
    `My Setup Tour for ${keyword} ${year}`,
    `How I Do ${keyword} - Behind The Scenes`,
    `How I Edit My ${keyword} Videos`,
    `How I Write Scripts for ${keyword}`,
    `How I Made Thumbnail for ${keyword}`,
    `How I Thought of Title for ${keyword}`,
    `No Views on ${keyword}? Do This Now!`,
    `Why No Comments on ${keyword}?`,
    `How to Get More Likes on ${keyword}`,
    `How to Get More Shares on ${keyword}`,
    `How to Make ${keyword} Superfast`,
    `How to Make ${keyword} ${randNum()}x Faster`,
    `The Secret Formula of ${keyword} ${year}`,
    `Hidden Feature of ${keyword} Nobody Knows`,
    `Turn ON This Setting in ${keyword}`,
    `Turn OFF This Setting in ${keyword} or Regret`,
    `Best Time to Post ${keyword}?`,
    `When Should You Post ${keyword} in ${year}`,
    `The Truth About ${keyword} Timing`,
    `Should You Do ${keyword} in Morning or Night?`,
    `My ${randNum()} Predictions for ${keyword} in ${year}`,
    `What Will Happen to ${keyword} After ${year}?`,
    `Is ${keyword} Dying?`,
    `${keyword} New Update is Here in ${year}`,
    `New Rules of ${keyword} in ${year}`,
    `New Features of ${keyword} You Must Know`,
    `What's New in ${keyword} in ${year}?`,
    `${keyword} Old vs New - What Changed?`,
    `${keyword} Evolution From ${year} Till Now`,
    `How ${keyword} Changed in Last ${randNum()} Years`,
    `History of ${keyword} Nobody Tells You`,
    `How ${keyword} Started?`,
    `Who Created ${keyword}?`,
    `Complete Timeline of ${keyword} ${year}`,
    `${keyword} Funny Moments Compilation`,
    `${keyword} Memes Reaction`,
    `${keyword} Try Not To Laugh Challenge`,
    `I Went Crazy Watching ${keyword}`,
    `Funniest Comments on ${keyword}`,
    `Fun Facts About ${keyword} ${year}`,
    `${randNum()} Interesting Facts About ${keyword}`,
    `Unknown Facts About ${keyword}`,
    `Things About ${keyword} Not Even on Wikipedia`,
    `${randNum()} Benefits of ${keyword} That Will Shock You`,
    `Disadvantages of ${keyword} Nobody Tells`,
    `Beware of ${keyword} - Scam Alert ${year}`,
    `How Fraud Happens in ${keyword}?`,
    `${keyword} Real vs Fake - How to Identify?`,
    `Should You Trust ${keyword}?`,
    `My Final Advice for ${keyword}`,
    `My Last Video on ${keyword} in ${year}`,
    `My Final Truth About ${keyword}`,
    `Should I Quit ${keyword}?`,
    `Why I Am Quitting ${keyword} - Full Truth`,
    `${randNum()} Days Without ${keyword} - What Happened?`,
    `${randNum()} Days Experiment With ${keyword}`,
    `Results of ${randNum()} Days With ${keyword}`,
    `Live Proof of ${keyword} - Does It Work?`,
    `Case Study of ${keyword} on ${randNum()} People`,
    `${keyword} Data & Stats in ${year}`,
    `What Research Says About ${keyword}?`,
    `What Science Says About ${keyword}?`,
    `What Experts Say About ${keyword} in ${year}`,
    `How to Start ${keyword} From Zero in ${year}`,
    `How to Learn ${keyword} From Mobile`,
    `How to Do ${keyword} Without Money`,
    `How to Do ${keyword} in Simple Language`,
    `How to Do ${keyword} in ${randNum()} Days`,
    `How to Create and Viral ${keyword}`,
    `How to Make ${keyword} in 2026`,
    `Best App for ${keyword} in ${year}`,
    `Best Website for ${keyword}`,
    `How to Get Motivation for ${keyword}`,
    `How to Get 1M Views on ${keyword}`,
    `The Dark Truth of ${keyword} in ${year}`,
    `Never Make This Mistake in ${keyword}`,
    `How to Do ${keyword} Like a Pro`,
    `This Trick Works in ${keyword}`,
    `This Hack Works in ${keyword}`,
    `Secret About ${keyword} Nobody Tells`,
    `How to Do ${keyword} Without Laptop`,
    `How to Do ${keyword} With a Job`,
    `How to Do ${keyword} as a Student`,
    `How to Make Money From ${keyword} at Home`,
    `YouTube SEO for ${keyword} in ${year}`,
    `Algorithm of ${keyword} Explained`,
    `Future of ${keyword} in ${year}`,
    `How to Create a Channel for ${keyword}`,
    `Video Ideas for ${keyword}`,
    `Content Ideas for ${keyword}`,
    `How to Find Niche for ${keyword}`,
    `How to Search Keywords for ${keyword}`,
    `How to Write Titles for ${keyword}`,
    `How to Make Thumbnails for ${keyword}`,
    `Best Hashtags for ${keyword}`,
    `Best Tags for ${keyword}`,
    `How to Increase Watch Time on ${keyword}`,
    `Why No Views on ${keyword}`,
    `How to Grow Fast in ${keyword}`,
    `How to Become Famous With ${keyword}`,
    `How to Earn $1000 With ${keyword}`,
    `${keyword} Masterclass Complete ${year}`,
    `${keyword} Complete Course Free`,
    `${keyword} Ultimate Guide ${year}`,
    `${keyword}: Don't Make This Big Mistake`,
    `Expert Tips for ${keyword}`,
    `Expert Tricks for ${keyword}`,
    `Hacks That Work for ${keyword}`,
    `Exponential Growth in ${keyword}`,
    `How I Did ${keyword}`,
    `My Journey With ${keyword} - What I Learned`,
    `The Dark Side of ${keyword} Nobody Sees`,
    `How to Start ${keyword} From Scratch`,
    `How to Start ${keyword} Today`,
    `How to Earn Your First Dollar From ${keyword}`,
    `How to Reach 100K Subscribers With ${keyword}`,
    `How to Get 1M Views on ${keyword}`,
    `Best Free Tools for ${keyword}`,
    `Best Apps for ${keyword}`,
    `Best Websites for ${keyword}`,
    `${keyword} Income Explained`,
    `${keyword} Income Proof`,
    `${keyword} Live Proof`,
    `${keyword} Advanced Tutorial`,
    `${keyword} Basic Tutorial ${year}`,
    `Beginner Guide for ${keyword} ${year}`,
    `Complete Step-by-Step Guide for ${keyword}`,
    `Everything You Need to Know About ${keyword} in ${year}`,
    `What is ${keyword} and How Does It Work?`,
    `How ${keyword} Really Works`,
    `Simple and Complete Explanation of ${keyword}`,
    `${keyword} Without Prior Experience`,
    `${keyword} Passive Income - How To`,
    `${keyword} From Home - How to Start`,
    `${keyword} Without Investment - Is It Possible?`,
    `${keyword} Without Showing Your Face`,
    `${keyword} With AI - Guide ${year}`,
    `How to Make ${keyword} With Mobile`,
    `How to Make ${keyword} For Free`,
    `How to Monetize Your ${keyword}`,
    `How to Viral Your ${keyword} on YouTube`,
];

  if (tone === "Professional") {
    return [
      `${keyword}: A Complete Professional Guide ${year}`,
      `How ${keyword} Works: A Detailed Explanation`,
      `${keyword}: Best Practices and Key Insights`,
      `Understanding ${keyword}: Step-by-Step Guide`,
      `${keyword}: Strategies, Benefits and Common Mistakes`,
      ...viral,
    ].sort(() => Math.random() - 0.5).slice(0, 10);
  }

  if (tone === "Funny") {
    return [
      `${keyword} Went Wrong 😂 (${year})`,
      `I Tried ${keyword} So You Don't Have To`,
      `${keyword}: The Funniest ${randNum()} Mistakes`,
      `Expectation vs Reality: ${keyword}`,
      `When You Think You Understand ${keyword}...`,
      ...viral,
    ].sort(() => Math.random() - 0.5).slice(0, 10);
  }

  if (tone === "Educational") {
    return [
      `${keyword} Explained Simply for Beginners`,
      `Learn ${keyword} Step by Step in ${year}`,
      `${keyword}: Complete Tutorial and ${randNum()} Examples`,
      `How ${keyword} Works: Full Lesson`,
      `${keyword}: Essential Concepts You Need to Know`,
      ...viral,
    ].sort(() => Math.random() - 0.5).slice(0, 10);
  }

  return viral.sort(() => Math.random() - 0.5);
};

const informationalSections = [
  {
    title: "1. What is a YouTube SEO Generator?",
    content: `A YouTube SEO generator helps creators prepare video titles, descriptions, tags, hashtags and supporting metadata from a topic or keyword. Instead of writing every field from scratch, creators can use structured suggestions to organize their publishing workflow.

YouTube SEO is the process of making video content easier for viewers and search systems to understand. A clear title communicates the subject, a useful description provides context, and accurate metadata helps describe what the video covers. No generator can guarantee rankings, views or viral success because performance depends on many factors, including viewer satisfaction and competition.`,
  },
  {
    title: "2. How to Generate Better YouTube Titles",
    content: `A good YouTube title should describe the video accurately and give the intended audience a reason to watch. Include the primary keyword naturally when it fits. Keep the most important information near the beginning so viewers can understand the topic quickly.

Avoid misleading claims, excessive capital letters and promises that the video does not fulfil. Numbers, questions, tutorials and comparisons can be useful title formats, but they should only be used when the video supports them. Test alternative titles over time and compare performance using YouTube Analytics rather than assuming that a title is viral based on wording alone.`,
  },
  {
    title: "3. Writing an SEO-Friendly Video Description",
    content: `Your video description gives viewers additional context about the content. Start with a concise summary that explains what the viewer will learn. Use the main keyword naturally and include relevant related phrases where they genuinely describe the video.

Add useful links, resource references, chapters and a call to action when appropriate. Avoid repeating the same keyword excessively. A long description is not automatically better: relevance, readability and usefulness matter more than filling space. Always check that links work and that any sponsorship or affiliate relationship is disclosed when required.`,
  },
  {
    title: "4. YouTube Tags and Hashtags Explained",
    content: `Tags and hashtags serve different purposes. Tags are metadata keywords added to a video in YouTube Studio. They may help clarify spelling variants or less obvious terms, but YouTube says titles, thumbnails and descriptions are more important for discovery in most cases.

Hashtags are visible clickable labels that connect content to a topic. Use a small number of relevant hashtags rather than unrelated trending terms. Platform rules and hashtag display behaviour can change, so review current YouTube guidance before publishing. Neither tags nor hashtags guarantee impressions, recommendations or a top search position.`,
  },
  {
    title: "5. Multilingual YouTube SEO",
    content: `Multilingual creators can prepare metadata in the language their intended audience uses. Translate the title and description naturally instead of translating each word literally. Local expressions, spelling, search intent and cultural context can change how a phrase should be written.

If you publish for different audiences, consider YouTube's supported language and subtitle features. Keep translated metadata faithful to the actual video. This generator offers English, Hindi and Spanish templates, but its output is template-based and should be reviewed by a fluent speaker when accuracy matters. It does not automatically research keyword popularity in every language.`,
  },
  {
    title: "6. Thumbnail Text and Viewer Expectations",
    content: `Thumbnail text should be short, readable on mobile screens and consistent with the video title. Use a strong visual hierarchy and avoid placing too many words on the thumbnail. The title and thumbnail should work together rather than repeat the same sentence.

A thumbnail can encourage a click, but the video must deliver what it promises. Misleading packaging may disappoint viewers and weaken long-term trust. Preview thumbnails at small sizes, use clear contrast, and make sure any faces, logos or images are used with appropriate rights.`,
  },
  {
    title: "7. Use Keywords Naturally",
    content: `Start with one primary topic and identify a few closely related terms that describe the video. Place the main phrase in the title or opening description when it reads naturally. Use related phrases to explain subtopics, not to create a list of unrelated searches.

Keyword relevance matters more than keyword stuffing. Do not add names, brands, events or claims that are not actually covered in the video. A simple content plan can include the viewer's question, the answer the video provides, supporting examples and a clear next step.`,
  },
  {
    title: "8. YouTube Chapters and Timestamps",
    content: `Chapters can help viewers navigate longer videos. Use timestamps that match the actual edit and choose concise chapter labels that describe each section. The first timestamp should begin at 00:00, and the remaining timestamps should follow the correct order.

Suggested chapter templates from a generator are only placeholders. Replace them with the actual timing of your video before publishing. Incorrect timestamps can confuse viewers and make the description look unfinished. Chapters are most useful when they represent meaningful sections rather than arbitrary intervals.`,
  },
  {
    title: "9. Improve Results with YouTube Analytics",
    content: `After publishing, review impressions, click-through rate, watch time, audience retention and traffic sources in YouTube Analytics. Interpret these metrics in context. A high click-through rate with low retention may indicate that the packaging creates expectations the video does not meet. A lower click-through rate may have different causes depending on the audience and where the video is shown.

Compare videos with similar audiences and topics. Change one variable at a time when possible, and allow enough data to accumulate before drawing conclusions. This generator does not access your YouTube Analytics account or calculate live search volume.`,
  },
  {
    title: "10. Common YouTube SEO Mistakes",
    content: `Common mistakes include misleading titles, keyword stuffing, irrelevant tags, excessive hashtags, duplicated descriptions and unverified claims. Another mistake is relying on generic metadata without checking whether it accurately describes the finished video.

Avoid fake engagement, spam comments and tactics that violate platform policies. Review the final title, description, links, tags and captions before publishing. Accurate metadata helps set the right expectations, while useful content and a satisfying viewer experience remain essential.`,
  },
  {
    title: "11. How to Use This YouTube Viral Kit Generator",
    content: `Enter the main video topic, select a niche, choose a content tone and select an output language. Generate the kit to receive title ideas, a description template, tags, hashtags, target keyword suggestions, thumbnail text and a pinned comment.

Review every suggestion before using it. Edit generic claims, replace placeholder links, and change chapter timestamps to match your video. Copy individual sections or export the generated kit as a text file for later editing. Your browser's local history can help restore recent generations on the same device, depending on browser storage availability.`,
  },
  {
    title: "12. Privacy, Accuracy and Limitations",
    content: `This client-side version generates content from local templates and does not need an external AI API. It does not automatically inspect a YouTube channel, fetch live trending data or verify keyword search volumes. Its suggestions are starting points rather than predictions.

Do not enter passwords, API keys or sensitive personal information into content fields. Browser storage may be cleared by the user or browser settings. Before publishing, verify factual claims, links, copyright permissions and platform requirements. For changing platform rules, refer to the official YouTube Help Centre.`,
  },
];

const faqs = [
  {
    q: "Is this YouTube SEO tool free?",
    a: "This component runs in your browser and does not require a paid AI API. Hosting, domain and any third-party services you add may have separate costs.",
  },
  {
    q: "Does it guarantee viral views?",
    a: "No. It creates metadata suggestions. Views depend on audience interest, content quality, packaging, competition and many other factors.",
  },
  {
    q: "Does it use live YouTube search data?",
    a: "No. This version uses local templates and keyword combinations. Real-time search data would require a suitable data source or API.",
  },
  {
    q: "Can I generate Hindi and Spanish metadata?",
    a: "Yes. Select Hindi or Spanish in the language menu. Review the generated text before publishing, especially names, technical terms and regional expressions.",
  },
  {
    q: "Are the generated chapters accurate?",
    a: "They are placeholders. Update every timestamp to match the actual video before publishing.",
  },
  {
    q: "How important are tags?",
    a: "Tags can provide context, but YouTube says titles, thumbnails and descriptions are generally more important for discovery.",
  },
  {
    q: "Can I use the output commercially?",
    a: "You can edit and use the generated text, but check trademarks, factual claims, links and any third-party material you include.",
  },
  {
    q: "Does it store my history online?",
    a: "No account or server database is used by this component. Recent history is stored in local browser storage on the same device.",
  },
];

export default function YouTubeGenerator() {
  const [keyword, setKeyword] = useState("");
  const [niche, setNiche] = useState("General");
  const [tone, setTone] = useState<Tone>("Viral");
  const [theme, setTheme] = useState<Theme>("dark");
  const [lang, setLang] = useState<Lang>("en");
  const [result, setResult] = useState<Result | null>(null);
  const [copied, setCopied] = useState("");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [openSections, setOpenSections] = useState<number[]>([0]);
  const [history, setHistory] = useState<Result[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [notice, setNotice] = useState("");
  const [showGuide, setShowGuide] = useState(true);

  const t = translations[lang];
  const isDark = theme === "dark";

  const panel = isDark
    ? "bg-zinc-900 border-zinc-800"
    : "bg-white border-orange-100";

  const field = isDark
    ? "bg-black border-zinc-700 text-white"
    : "bg-[#fff7e6] border-orange-200 text-black";

  useEffect(() => {
    try {
      const saved = localStorage.getItem("yt_gen_history");
      if (saved) setHistory(JSON.parse(saved));
    } catch {
      // Storage is optional.
    }
  }, []);

  const playSound = (freq = 800) => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as Window & { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;

      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();

      oscillator.type = "sine";
      oscillator.frequency.value = freq;
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(
        0.00001,
        ctx.currentTime + 0.2,
      );

      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.2);
      oscillator.onended = () => void ctx.close();
    } catch {
      // Sound is optional.
    }
  };

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3000);
  };

  const generateData = () => {
    if (!keyword.trim()) {
      showNotice("Please enter a video topic first.");
      return;
    }

    setLoading(true);
    playSound(600);

    window.setTimeout(() => {
      const k = keyword.trim();
      const titles = getTitleTemplates(k, niche, tone, lang);

      const intro =
        lang === "hi"
          ? `इस वीडियो में हम ${k} के बारे में आसान भाषा में जानकारी देंगे। यह ${niche} में रुचि रखने वाले दर्शकों के लिए एक उपयोगी गाइड है।`
          : lang === "es"
            ? `En este video exploramos ${k} con una guía práctica para personas interesadas en ${niche}.`
            : `In this video, we explore ${k} with a practical guide for viewers interested in ${niche}.`;

      const learnHeading =
        lang === "hi"
          ? "📌 इस वीडियो में आप सीखेंगे:"
          : lang === "es"
            ? "📌 LO QUE APRENDERÁS:"
            : "📌 WHAT YOU'LL LEARN:";

      const learnLines =
        lang === "hi"
          ? [
              `✓ ${k} का परिचय`,
              "✓ जरूरी टिप्स और उदाहरण",
              "✓ सामान्य गलतियां और उनसे बचने के तरीके",
              "✓ आगे सीखने के उपयोगी सुझाव",
            ]
          : lang === "es"
            ? [
                `✓ Introducción a ${k}`,
                "✓ Consejos y ejemplos prácticos",
                "✓ Errores comunes y cómo evitarlos",
                "✓ Próximos pasos para aprender",
              ]
            : [
                `✓ Introduction to ${k}`,
                "✓ Useful tips and examples",
                "✓ Common mistakes to avoid",
                "✓ Practical next steps",
              ];

      const description = [
        intro,
        "",
        learnHeading,
        ...learnLines,
        "",
        lang === "hi"
          ? "🔔 ऐसे और वीडियो के लिए चैनल को सब्सक्राइब करें।"
          : lang === "es"
            ? "🔔 Suscríbete para ver más videos."
            : "🔔 Subscribe for more videos.",
        "",
        "🔗 RESOURCES:",
        "- Add your real resource links here",
        "",
        `#${k.replace(/[^\p{L}\p{N}]/gu, "")} #${niche.replace(/\s+/g, "")} #YouTube`,
        "",
        "TIMESTAMPS (edit to match your video):",
        "00:00 Introduction",
        "00:45 Topic overview",
        "02:30 Main tutorial",
        "05:00 Tips and recap",
        "",
        "Note: Update the links, claims and timestamps before publishing.",
      ].join("\n");
const year = new Date().getFullYear();
            const tags = Array.from(
        new Set(
          [
            k.toLowerCase(),
            `${k} tutorial`,
            `${k} for beginners`,
            `${k} guide`,
            `${k} explained`,
            `how to ${k}`,
            `${k} tips`,
            `${k} tricks`,
            `${niche} tips`,
            `${niche} tutorial`,
            `${k} step by step`,
            `${k} complete guide`,
            `${k} Hindi`,
            `${k} ${year}`,
            `YouTube ${niche}`,
          ].map((tag) => tag.trim()),
        ),
      ).filter(Boolean).sort(() => Math.random() - 0.5);

      const hashtags = [
        `#${k.replace(/[^\p{L}\p{N}]/gu, "")}`,
        `#${niche.replace(/\s+/g, "")}`,
        "#YouTube",
        "#YouTubeTips",
        "#ContentCreator",
      ].sort(() => Math.random() - 0.5).join(" ");

      const keywords = [
  k,
  `${k} tutorial`,
  `${k} guide`,
  `${k} explained`,
  `${k} for beginners`,
  `${niche} ${k}`,
  `how to ${k}`,
  `what is ${k}`,
  `${k} tips`,
  `${k} tricks`,
  `${k} secrets`,
  `${k} course`,
  `${k} full course`,
  `${k} masterclass`,
  `${k} complete guide`,
  `${k} step by step`,
  `${k} in ${year}`,
  `${k} ${year}`,
  `best ${k}`,
  `top ${k}`,
  `${k} review`,
  `${k} honest review`,
  `${k} tutorial for beginners ${year}`,
  `learn ${k}`,
  `${k} explained in Hindi`,
  `${k} for students`,
  `${k} for creators`,
  `${k} strategy`,
  `${k} strategy ${year}`,
  `${k} YouTube SEO`,
  `${k} viral tricks`,
  `${k} growth hacks`,
  `${k} case study`,
  `${k} income`,
  `${k} earning`,
  `${k} monetization`,
  `${k} without investment`,
  `${k} from scratch`,
  `${k} zero to hero`,
  `${k} tools`,
  `${k} best tools`,
  `${k} free tools`,
  `${k} apps`,
  `${k} website`,
  `how to grow ${k}`,
  `how to viral ${k}`,
  `how to start ${k}`,
  `${niche} ${k} tutorial`,
  `${niche} ${k} guide`,
  `YouTube ${k}`,
  `${k} YouTube channel`,
].sort(() => Math.random() - 0.5);
      const thumbnails =
        lang === "hi"
          ? [
              `${k}: पूरी सच्चाई`,
              "ये गलती मत करना!",
              "आसान तरीका",
              "पूरा गाइड",
              "5 जरूरी टिप्स",
            ]
          : lang === "es"
            ? [
                `${k}: La verdad`,
                "¡No cometas este error!",
                "Guía fácil",
                "5 consejos clave",
                "Paso a paso",
              ]
            : [
                `${k}: The Truth`,
                "Don't Make This Mistake!",
                "Easy Step-by-Step",
                "5 Essential Tips",
                "Complete Guide",
              ];

      const pinnedComment =
        lang === "hi"
          ? `वीडियो देखने के लिए धन्यवाद! 🙌 ${k} के बारे में आपका सवाल या अनुभव क्या है? नीचे कमेंट करें।`
          : lang === "es"
            ? `¡Gracias por ver el video! 🙌 ¿Qué opinas sobre ${k}? Déjalo en los comentarios.`
            : `Thanks for watching! 🙌 What is your biggest question about ${k}? Share it in the comments below.`;

      const chapters = [
        "00:00 Introduction",
        "00:45 Overview",
        "02:30 Main Content",
        "05:00 Tips and Examples",
        "07:00 Summary",
      ].join("\n");

      const data: Result = {
        titles,
        descriptions: description,
        tags,
        hashtags,
        keywords,
        thumbnails,
        pinnedComment,
        chapters,
        language: lang,
        keyword: k,
        niche,
        tone,
        date: new Date().toLocaleString(),
      };

      setResult(data);
      setLoading(false);

      const nextHistory = [data, ...history].slice(0, 10);
      setHistory(nextHistory);

      try {
        localStorage.setItem(
          "yt_gen_history",
          JSON.stringify(nextHistory),
        );
      } catch {
        // Generation should still work if storage is unavailable.
      }

      showNotice("Your YouTube kit is ready. Review it before publishing.");
    }, 250);
  };

  const copyText = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      playSound(1000);
      showNotice("Copied to clipboard!");
      window.setTimeout(() => setCopied(""), 2000);
    } catch {
      showNotice("Clipboard access failed. Please copy the text manually.");
    }
  };
const handleShare = async () => {
  if (!result) return;
  const shareText = `Check my YouTube Viral Kit for "${result.keyword}" - ${SITE_URL}`;
  if ((navigator as any).share) {
    await (navigator as any).share({ title: "YT GEN PRO", text: shareText, url: SITE_URL });
  } else {
    await navigator.clipboard.writeText(shareText);
    showNotice("Link copied!");
  }
};
const copyForYouTubeStudio = async () => {
  if (!result) return;
  const ytStudioText = `TITLE:\n${result.titles[0]}\n\nDESCRIPTION:\n${result.descriptions}\n\nTAGS:\n${result.tags.join(", ")}`;
  await copyText(ytStudioText, "yt-studio");
};
  const allContent = useMemo(() => {
    if (!result) return "";

    return [
      "YOUTUBE VIRAL KIT",
      "",
      "TITLES",
      ...result.titles,
      "",
      "DESCRIPTION",
      result.descriptions,
      "",
      "TAGS",
      result.tags.join(", "),
      "",
      "HASHTAGS",
      result.hashtags,
      "",
      "KEYWORDS",
      result.keywords.join(", "),
      "",
      "THUMBNAIL TEXT",
      ...result.thumbnails,
      "",
      "PINNED COMMENT",
      result.pinnedComment,
      "",
      "CHAPTERS",
      result.chapters,
    ].join("\n");
  }, [result]);

  const filteredTitles = result?.titles.filter((title) =>
    title.toLowerCase().includes(search.toLowerCase()),
  ) ?? [];

  const seoChecks = result
    ? [
        {
          label: "Title includes main keyword",
          ok: result.titles.some((title) =>
            title.toLowerCase().includes(result.keyword.toLowerCase()),
          ),
        },
        {
          label: "Description includes main keyword",
          ok: result.descriptions.toLowerCase().includes(
            result.keyword.toLowerCase(),
          ),
        },
        {
          label: "Tags generated",
          ok: result.tags.length > 0,
        },
        {
          label: "Hashtags generated",
          ok: result.hashtags.length > 0,
        },
        {
          label: "Thumbnail ideas generated",
          ok: result.thumbnails.length > 0,
        },
        {
          label: "Description reviewed by creator",
          ok: false,
        },
        {
          label: "Chapters verified against actual video",
          ok: false,
        },
      ]
    : [];

  const seoScore = seoChecks.length
    ? Math.round(
        (seoChecks.filter((item) => item.ok).length / seoChecks.length) *
          100,
      )
    : 0;

  const exportTxt = () => {
    if (!result) return;

    const blob = new Blob([allContent], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "youtube-viral-kit.txt";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const exportJson = () => {
    if (!result) return;

    const blob = new Blob([JSON.stringify(result, null, 2)], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "youtube-viral-kit.json";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const restoreHistory = (item: Result) => {
    setResult(item);
    setKeyword(item.keyword);
    setNiche(item.niche);
    setTone(item.tone as Tone);
    setLang(item.language as Lang);
    showNotice("Previous kit restored.");
  };

  const clearHistory = () => {
    setHistory([]);

    try {
      localStorage.removeItem("yt_gen_history");
    } catch {
      // Ignore storage errors.
    }

    showNotice("History cleared.");
  };

  const toggleSection = (index: number) => {
    setOpenSections((previous) =>
      previous.includes(index)
        ? previous.filter((item) => item !== index)
        : [...previous, index],
    );
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDark
          ? "bg-[#0a0a0a] text-white"
          : "bg-[#fffaf0] text-black"
      }`}
    >
      <style>{`
        @keyframes float {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-7px); }
        }
        @keyframes glow {
          0%,100% { box-shadow: 0 0 16px rgba(255,107,0,.18); }
          50% { box-shadow: 0 0 30px rgba(255,107,0,.35); }
        }
        .float { animation: float 3s ease-in-out infinite; }
        .glow { animation: glow 2s ease-in-out infinite; }
      `}</style>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "YT GEN PRO - YouTube Viral Kit Generator",
            applicationCategory: "MultimediaApplication",
            operatingSystem: "Web",
            description:
              "Generate YouTube title ideas, descriptions, tags, hashtags and multilingual metadata.",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
          }),
        }}
      />

      <header
        className={`sticky top-0 z-50 border-b backdrop-blur ${
          isDark
            ? "border-zinc-800 bg-black/85"
            : "border-orange-100 bg-white/90"
        }`}
      >
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div>
            <h1 className="text-xl font-black sm:text-2xl">
              YT <span className="text-orange-500">GEN</span> PRO
              <span className="ml-2 rounded-full bg-orange-500/10 px-2 py-1 text-[10px] text-orange-500">
                ADVANCED
              </span>
            </h1>
            <p className="mt-1 text-[10px] opacity-60">
              TITLES · TAGS · DESCRIPTION · MULTILINGUAL SEO
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              aria-label="Interface language"
              value={lang}
              onChange={(e) => setLang(e.target.value as Lang)}
              className={`rounded-full border px-3 py-2 text-xs ${field}`}
            >
              <option value="en">🇬🇧 English</option>
              <option value="hi">🇮🇳 हिंदी</option>
              <option value="es">🇪🇸 Español</option>
            </select>

            <button
              type="button"
              onClick={() => {
                setTheme(isDark ? "light" : "dark");
                playSound(400);
              }}
              aria-label="Toggle light or dark theme"
              className={`flex h-8 w-12 items-center rounded-full p-1 ${
                isDark
                  ? "justify-end bg-zinc-700"
                  : "justify-start bg-orange-200"
              }`}
            >
              <span className="h-6 w-6 rounded-full bg-white shadow" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0">
          <div
            className={`mb-6 flex h-[90px] items-center justify-center rounded-2xl border-2 border-dashed text-xs ${
              isDark
                ? "border-zinc-700 bg-zinc-900/50"
                : "border-orange-200 bg-orange-50"
            }`}
          >
            AdSense Top Banner Placeholder
          </div>

          <section
            className={`rounded-[28px] border p-5 sm:p-8 ${panel}`}
          >
            <span className="inline-block rounded-full bg-orange-500/10 px-3 py-1 text-xs font-bold text-orange-500">
              FREE CREATOR TOOL
            </span>

            <h2 className="mt-4 text-3xl font-black sm:text-4xl">
              {t.title.split(" ").slice(0, 2).join(" ")}{" "}
              <span className="text-orange-500">
                {t.title.split(" ").slice(2).join(" ")}
              </span>
            </h2>

            <p className="mt-3 text-sm leading-6 opacity-70">
              Generate title ideas, video descriptions, tags, hashtags,
              thumbnail text and keywords in multiple languages.
            </p>

            <div className="mt-6 space-y-4">
              <label
                htmlFor="yt-keyword"
                className="block text-xs font-black uppercase opacity-70"
              >
                {t.topic}
              </label>

              <input
                id="yt-keyword"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") generateData();
                }}
                maxLength={200}
                placeholder="e.g. cricket news, chess tricks, AI tools..."
                className={`w-full rounded-2xl border-2 px-5 py-4 font-bold outline-none transition focus:border-orange-500 ${field}`}
              />

              <div className="flex justify-between text-[10px] opacity-60">
                <span>Use a specific topic for relevant suggestions.</span>
                <span>{keyword.length}/200</span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <label className="text-xs font-bold">
                  {t.niche}
                  <select
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    className={`mt-2 w-full rounded-xl border-2 px-3 py-3 ${field}`}
                  >
                    {niches.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </label>

                <label className="text-xs font-bold">
                  {t.tone}
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value as Tone)}
                    className={`mt-2 w-full rounded-xl border-2 px-3 py-3 ${field}`}
                  >
                    {tones.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </label>

                <label className="text-xs font-bold">
                  {t.language}
                  <select
                    value={lang}
                    onChange={(e) => setLang(e.target.value as Lang)}
                    className={`mt-2 w-full rounded-xl border-2 px-3 py-3 ${field}`}
                  >
                    <option value="en">English</option>
                    <option value="hi">Hindi / हिंदी</option>
                    <option value="es">Spanish / Español</option>
                  </select>
                </label>
              </div>

              <button
                type="button"
                disabled={loading}
                onClick={generateData}
                className="glow w-full rounded-full bg-gradient-to-r from-orange-500 to-[#ff3c00] py-4 text-base font-black text-black transition hover:scale-[1.01] disabled:opacity-50 sm:text-lg"
              >
                {loading ? t.generating : t.generate}
              </button>

              {notice && (
                <div
                  role="status"
                  className="rounded-xl border border-orange-500/30 bg-orange-500/10 p-3 text-sm"
                >
                  {notice}
                </div>
              )}
            </div>
          </section>

          {result && (
            <div className="mt-6 space-y-6">
              <section className={`rounded-3xl border p-5 sm:p-6 ${panel}`}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-black">{t.seo}</h2>
                    <p className="mt-1 text-xs opacity-60">
                      A basic checklist, not a ranking prediction.
                    </p>
                  </div>
                  <div className="text-3xl font-black text-orange-500">
                    {seoScore}%
                  </div>
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-500/20">
                  <div
                    className="h-full rounded-full bg-orange-500 transition-all"
                    style={{ width: `${seoScore}%` }}
                  />
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {seoChecks.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center gap-2 text-sm"
                    >
                      <span className={item.ok ? "text-green-500" : "text-orange-500"}>
                        {item.ok ? "✓" : "○"}
                      </span>
                      {item.label}
                    </div>
                  ))}
                </div>
              </section>

              <section className={`rounded-3xl border p-5 sm:p-6 ${panel}`}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-xl font-black">📦 Complete Kit</h2>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => void copyText(allContent, "all")}
                      className="rounded-full bg-orange-500 px-4 py-2 text-xs font-black text-black"
                    >
                      {copied === "all" ? "Copied!" : t.copyAll}
                    </button>
                    <button
                      type="button"
                      onClick={exportTxt}
                      className="rounded-full border px-4 py-2 text-xs font-bold"
                    >
                      {t.export}
                    </button>
                    <button
                      type="button"
                      onClick={exportJson}
                      className="rounded-full border px-4 py-2 text-xs font-bold"
                    >
                      Export JSON
                    </button>
                    <button type="button" onClick={copyForYouTubeStudio} className="rounded-full bg-black text-white border border-orange-500 px-4 py-2 text-xs font-black">{copied === "yt-studio" ? "Ready for YT!" : "📋 Copy for YouTube Studio"}</button>
<button type="button" onClick={handleShare} className="rounded-full bg-[#25D366] text-black px-4 py-2 text-xs font-black">🔗 Share</button>
                  </div>
                </div>

                <p className="mt-2 break-words text-xs opacity-60">
                  Topic: {result.keyword} · {result.niche} · {result.tone} ·{" "}
                  {result.date}
                </p>
              </section>

              <section className={`rounded-3xl border p-5 sm:p-6 ${panel}`}>
                <h2 className="mb-4 text-lg font-black">🔥 {t.titles}</h2>

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t.search}
                  className={`mb-4 w-full rounded-xl border p-3 text-sm ${field}`}
                />

                <div className="space-y-3">
                  {filteredTitles.map((title, index) => (
                    <div
                      key={title}
                      className={`flex items-start gap-3 rounded-2xl border p-4 ${
                        isDark
                          ? "border-zinc-800 bg-black"
                          : "border-orange-100 bg-[#fffaf0]"
                      }`}
                    >
                      <span className="font-black text-orange-500">
                        {index + 1}.
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="break-words text-sm font-bold">
                          {title}
                        </p>
                        <p className="mt-2 text-[10px] opacity-50">
                          {title.length} characters
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => void copyText(title, `title-${index}`)}
                        className="rounded-full bg-orange-500 px-3 py-1.5 text-xs font-bold text-black"
                      >
                        {copied === `title-${index}` ? "Copied!" : t.copy}
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              <section className={`rounded-3xl border p-5 sm:p-6 ${panel}`}>
                <h2 className="mb-4 text-lg font-black">📝 {t.description}</h2>
                <div className="mb-2 flex justify-between text-xs opacity-60">
                  <span>Description template</span>
                  <span>{result.descriptions.length} characters</span>
                </div>
                <textarea
                  value={result.descriptions}
                  onChange={(e) =>
                    setResult({ ...result, descriptions: e.target.value })
                  }
                  className={`h-[320px] w-full rounded-2xl border p-4 text-sm leading-6 outline-none focus:border-orange-500 ${field}`}
                />
                <button
                  type="button"
                  onClick={() =>
                    void copyText(result.descriptions, "description")
                  }
                  className="mt-3 rounded-full bg-orange-500 px-4 py-2 text-xs font-black text-black"
                >
                  {copied === "description" ? "Copied!" : "Copy Description"}
                </button>
              </section>

              <section className={`rounded-3xl border p-5 sm:p-6 ${panel}`}>
                <h2 className="mb-4 text-lg font-black">🏷️ {t.tags}</h2>
                <div className="flex flex-wrap gap-2">
                  {result.tags.map((tag) => (
                    <button
                      type="button"
                      key={tag}
                      title="Click to copy this tag"
                      onClick={() => void copyText(tag, `tag-${tag}`)}
                      className={`rounded-full border px-3 py-2 text-xs font-bold transition hover:border-orange-500 ${
                        isDark
                          ? "border-zinc-700 bg-black"
                          : "border-orange-200 bg-orange-50"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => void copyText(result.tags.join(", "), "tags")}
                  className="mt-4 rounded-full bg-orange-500 px-4 py-2 text-xs font-black text-black"
                >
                  {copied === "tags" ? "Copied!" : "Copy All Tags"}
                </button>
              </section>

              <section className={`rounded-3xl border p-5 sm:p-6 ${panel}`}>
                <h2 className="mb-4 text-lg font-black">#️⃣ {t.hashtags}</h2>
                <p className="break-words text-sm leading-7">{result.hashtags}</p>
                <button
                  type="button"
                  onClick={() => void copyText(result.hashtags, "hashtags")}
                  className="mt-4 rounded-full bg-orange-500 px-4 py-2 text-xs font-black text-black"
                >
                  {copied === "hashtags" ? "Copied!" : "Copy Hashtags"}
                </button>
              </section>

              <section className={`rounded-3xl border p-5 sm:p-6 ${panel}`}>
                <h2 className="mb-4 text-lg font-black">🔎 {t.keywords}</h2>
                <div className="flex flex-wrap gap-2">
                  {result.keywords.map((item) => (
                    <span
                      key={item}
                      className="rounded-lg bg-orange-500/10 px-3 py-2 text-xs"
                    >
                      {item}
                    </span>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => void copyText(result.keywords.join(", "), "keywords")}
                  className="mt-4 rounded-full bg-orange-500 px-4 py-2 text-xs font-black text-black"
                >
                  {copied === "keywords" ? "Copied!" : "Copy Keywords"}
                </button>
              </section>

              <section className={`rounded-3xl border p-5 sm:p-6 ${panel}`}>
                <h2 className="mb-4 text-lg font-black">🖼️ {t.thumbnail}</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {result.thumbnails.map((item, index) => (
                    <button
                      type="button"
                      key={item}
                      onClick={() => void copyText(item, `thumb-${index}`)}
                      className="float rounded-2xl border-2 border-orange-500/40 bg-gradient-to-br from-orange-500/20 to-red-500/10 p-5 text-left text-base font-black"
                    >
                      {item}
                      <span className="mt-2 block text-[10px] font-normal opacity-60">
                        {item.length} characters · Click to copy
                      </span>
                    </button>
                  ))}
                </div>
              </section>

              <section className={`rounded-3xl border p-5 sm:p-6 ${panel}`}>
                <h2 className="mb-4 text-lg font-black">💬 {t.pinned}</h2>
                <p className="text-sm leading-7">{result.pinnedComment}</p>
                <button
                  type="button"
                  onClick={() => void copyText(result.pinnedComment, "pinned")}
                  className="mt-4 rounded-full bg-orange-500 px-4 py-2 text-xs font-black text-black"
                >
                  {copied === "pinned" ? "Copied!" : "Copy Comment"}
                </button>
              </section>

              <section className={`rounded-3xl border p-5 sm:p-6 ${panel}`}>
                <h2 className="mb-4 text-lg font-black">⏱️ {t.chapters}</h2>
                <p className="mb-3 text-xs text-orange-500">
                  Important: verify all timestamps against your final video.
                </p>
                <pre className="whitespace-pre-wrap text-sm leading-7">
                  {result.chapters}
                </pre>
                <button
                  type="button"
                  onClick={() => void copyText(result.chapters, "chapters")}
                  className="mt-4 rounded-full bg-orange-500 px-4 py-2 text-xs font-black text-black"
                >
                  {copied === "chapters" ? "Copied!" : "Copy Chapters"}
                </button>
              </section>
            </div>
          )}

          <section className={`mt-8 rounded-3xl border p-5 sm:p-6 ${panel}`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black">{t.info}</h2>
                <p className="mt-1 text-xs opacity-60">
                  Practical guidance for better YouTube metadata.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowGuide((previous) => !previous)}
                aria-expanded={showGuide}
                className="rounded-full border px-4 py-2 text-xs font-bold"
              >
                {showGuide ? "Collapse all" : "Expand all"}
              </button>
            </div>

            {showGuide && (
              <div className="mt-5 space-y-3">
                {informationalSections.map((section, index) => {
                  const isOpen = openSections.includes(index);

                  return (
                    <div
                      key={section.title}
                      className="overflow-hidden rounded-xl border border-orange-500/20"
                    >
                      <button
                        type="button"
                        onClick={() => toggleSection(index)}
                        aria-expanded={isOpen}
                        className="flex w-full items-center justify-between gap-3 p-4 text-left font-bold"
                      >
                        <span>{section.title}</span>
                        <span className="text-orange-500">
                          {isOpen ? "−" : "+"}
                        </span>
                      </button>
                      {isOpen && (
                        <div className="border-t border-orange-500/10 p-4">
                          {section.content.split("\n\n").map((paragraph, i) => (
                            <p
                              key={i}
                              className="mb-3 text-sm leading-7 opacity-80 last:mb-0"
                            >
                              {paragraph}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section className={`mt-6 rounded-3xl border p-5 sm:p-6 ${panel}`}>
            <h2 className="text-xl font-black">Frequently Asked Questions</h2>
            <div className="mt-4 space-y-3">
              {faqs.map((faq, index) => {
                const key = index + 100;
                const isOpen = openSections.includes(key);

                return (
                  <div
                    key={faq.q}
                    className="overflow-hidden rounded-xl border border-orange-500/20"
                  >
                    <button
                      type="button"
                      onClick={() => toggleSection(key)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between gap-3 p-4 text-left text-sm font-bold"
                    >
                      <span>{faq.q}</span>
                      <span className="text-orange-500">
                        {isOpen ? "−" : "+"}
                      </span>
                    </button>
                    {isOpen && (
                      <p className="border-t border-orange-500/10 p-4 text-sm leading-7 opacity-80">
                        {faq.a}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          <section className={`mt-6 rounded-3xl border p-5 sm:p-6 ${panel}`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-black">{t.history}</h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowHistory((previous) => !previous)}
                  className="rounded-full border px-4 py-2 text-xs font-bold"
                >
                  {showHistory ? "Hide" : "Show"}
                </button>
                <button
                  type="button"
                  onClick={clearHistory}
                  className="rounded-full border border-red-500/30 px-4 py-2 text-xs font-bold text-red-500"
                >
                  {t.clear}
                </button>
              </div>
            </div>

            {showHistory && (
              <div className="mt-4 space-y-2">
                {history.length === 0 && (
                  <p className="text-sm opacity-60">No saved generations yet.</p>
                )}
                {history.map((item, index) => (
                  <button
                    type="button"
                    key={`${item.date}-${index}`}
                    onClick={() => restoreHistory(item)}
                    className="flex w-full items-center justify-between gap-3 rounded-xl border border-orange-500/20 p-3 text-left"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold">
                        {item.keyword}
                      </span>
                      <span className="text-[10px] opacity-60">
                        {item.niche} · {item.language.toUpperCase()} · {item.date}
                      </span>
                    </span>
                    <span className="shrink-0 text-xs text-orange-500">
                      Restore
                    </span>
                  </button>
                ))}
              </div>
            )}
          </section>

          <footer className="py-8 text-center text-xs leading-6 opacity-60">
            <p>
              YT GEN PRO · YouTube Metadata Generator · Multilingual Content
              Toolkit
            </p>
            <p>
              Suggestions are templates, not guarantees of rankings or views.
              Always verify metadata before publishing.
            </p>
          </footer>
        </div>

        <aside className="hidden lg:block">
          <div
            className={`sticky top-28 flex h-[600px] items-center justify-center rounded-2xl border-2 border-dashed text-xs ${
              isDark
                ? "border-zinc-700 bg-zinc-900/50"
                : "border-orange-200 bg-orange-50"
            }`}
          >
            AdSense Sidebar Placeholder
          </div>
        </aside>
      </main>
    </div>
  );
}
