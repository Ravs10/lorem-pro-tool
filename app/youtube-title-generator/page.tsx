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

const getTitleTemplates = (
  keyword: string,
  niche: string,
  tone: Tone,
  lang: Lang,
) => {
  if (lang === "hi") {
    return [
      `${keyword}: ये 5 बातें जानना बेहद जरूरी है!`,
      `${keyword} कैसे करें? पूरी जानकारी हिंदी में`,
      `${keyword)}`.replace(")", "") + ` के बारे में पूरी सच्चाई!`,
      `${keyword}: शुरुआती लोगों की 7 बड़ी गलतियां`,
      `${keyword} की ऐसी ट्रिक जो आपका काम आसान कर देगी`,
      `${keyword} का पूरा गाइड | ${niche} हिंदी`,
      `${keyword} सीखें आसान तरीके से`,
      `${keyword}: ये गलतियां मत करना!`,
      `${keyword} के जरूरी टिप्स और ट्रिक्स`,
      `${keyword} Explained in Hindi`,
    ];
  }

  if (lang === "es") {
    return [
      `${keyword}: La guía completa para principiantes`,
      `${keyword}: 7 errores que debes evitar`,
      `Cómo funciona ${keyword}: explicación sencilla`,
      `${keyword}: Consejos y trucos esenciales`,
      `Todo lo que debes saber sobre ${keyword}`,
      `${keyword} en 10 minutos: guía práctica`,
      `La verdad sobre ${keyword}`,
      `${keyword}: Lo que nadie te explica`,
      `Aprende ${keyword} paso a paso`,
      `${keyword}: Guía de ${niche}`,
    ];
  }

  const viral = [
    `${keyword}: 7 Things Beginners Must Know`,
    `I Tried ${keyword} — Here's What I Learned`,
    `${keyword}: 5 Mistakes You Should Avoid`,
    `The Ultimate ${keyword} Guide for Beginners`,
    `${keyword} Explained in 10 Minutes`,
    `What Nobody Tells You About ${keyword}`,
    `${keyword}: Tips That Make a Difference`,
    `How to Master ${keyword} Step by Step`,
    `${keyword}: The Complete ${niche} Guide`,
    `Before You Try ${keyword}, Watch This`,
  ];

  if (tone === "Professional") {
    return [
      `${keyword}: A Complete Professional Guide`,
      `How ${keyword} Works: A Detailed Explanation`,
      `${keyword}: Best Practices and Key Insights`,
      `Understanding ${keyword}: Step-by-Step Guide`,
      `${keyword}: Strategies, Benefits and Common Mistakes`,
      ...viral.slice(0, 5),
    ];
  }

  if (tone === "Funny") {
    return [
      `${keyword} Went Wrong 😂`,
      `I Tried ${keyword} So You Don't Have To`,
      `${keyword}: The Funniest Mistakes`,
      `Expectation vs Reality: ${keyword}`,
      `When You Think You Understand ${keyword}...`,
      ...viral.slice(0, 5),
    ];
  }

  if (tone === "Educational") {
    return [
      `${keyword} Explained Simply for Beginners`,
      `Learn ${keyword} Step by Step`,
      `${keyword}: Complete Tutorial and Examples`,
      `How ${keyword} Works: Full Lesson`,
      `${keyword}: Essential Concepts You Need to Know`,
      ...viral.slice(0, 5),
    ];
  }

  return viral;
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
            `${k} 2026`,
            `YouTube ${niche}`,
          ].map((tag) => tag.trim()),
        ),
      ).filter(Boolean);

      const hashtags = [
        `#${k.replace(/[^\p{L}\p{N}]/gu, "")}`,
        `#${niche.replace(/\s+/g, "")}`,
        "#YouTube",
        "#YouTubeTips",
        "#ContentCreator",
      ].join(" ");

      const keywords = [
        k,
        `${k} tutorial`,
        `${k} guide`,
        `${k} explained`,
        `${k} for beginners`,
        `${niche} ${k}`,
        `how to ${k}`,
      ];

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
