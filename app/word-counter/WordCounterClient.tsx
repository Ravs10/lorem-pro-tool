"use client";
import { useState, useMemo, useRef, useEffect, useCallback } from "react";

type ErrorItem = { message: string; offset: number; length: number; replacement: string; };
type Suggestion = { word: string; at: number; replaceLen: number };
type DocItem = { id: string; name: string; text: string; html: string; saved: number };
type InsightResult = {
  tone: { label: string; score: number; hint: string };
  sentiment: { label: string; score: number; positive: number; negative: number };
  passive: { count: number; percent: number; examples: string[] };
  adverbs: { count: number; percent: number; top: [string, number][] };
  cliches: { count: number; items: string[] };
  vocabulary: { ttr: number; uniqueWords: number; totalWords: number; label: string };
  variety: { score: number; label: string; distribution: { short: number; medium: number; long: number } };
};

const LANGUAGES = [
  { code: "en-US", label: "English (US)", flag: "🇺🇸" },
  { code: "en-GB", label: "English (UK)", flag: "🇬🇧" },
  { code: "hi-IN", label: "Hindi", flag: "🇮🇳" },
  { code: "es", label: "Spanish", flag: "🇪🇸" },
  { code: "fr", label: "French", flag: "🇫🇷" },
  { code: "de", label: "German", flag: "🇩🇪" },
  { code: "ja", label: "Japanese", flag: "🇯🇵" },
  { code: "zh", label: "Chinese", flag: "🇨🇳" },
  { code: "ar", label: "Arabic", flag: "🇸🇦" },
];

const PAGE_SIZES: Record<string, { w: number; h: number; label: string }> = {
  A4: { w: 210, h: 297, label: "A4 (210×297mm)" },
  Letter: { w: 216, h: 279, label: "Letter (216×279mm)" },
  Legal: { w: 216, h: 356, label: "Legal (216×356mm)" },
};

const FONTS = [
  { name: "Inter", css: "'Inter', sans-serif", mono: false },
  { name: "Poppins", css: "'Poppins', sans-serif", mono: false },
  { name: "Roboto", css: "'Roboto', sans-serif", mono: false },
  { name: "Merriweather", css: "'Merriweather', serif", mono: false },
  { name: "Playfair Display", css: "'Playfair Display', serif", mono: false },
  { name: "Lora", css: "'Lora', serif", mono: false },
  { name: "Georgia", css: "Georgia, serif", mono: false },
  { name: "Times New Roman", css: "'Times New Roman', serif", mono: false },
  { name: "Arial", css: "Arial, sans-serif", mono: false },
  { name: "Verdana", css: "Verdana, sans-serif", mono: false },
  { name: "JetBrains Mono", css: "'JetBrains Mono', monospace", mono: true },
  { name: "Fira Code", css: "'Fira Code', monospace", mono: true },
  { name: "Roboto Mono", css: "'Roboto Mono', monospace", mono: true },
  { name: "Courier New", css: "'Courier New', monospace", mono: true },
];

const COLOR_PALETTE = ["#111827","#7c3aed","#ec4899","#ef4444","#f59e0b","#10b981","#06b6d4","#3b82f6","#8b5cf6","#64748b"];
const HIGHLIGHT_PALETTE = ["#fef08a","#bbf7d0","#bfdbfe","#fecaca","#e9d5ff","#fed7aa","#fbcfe8","#a5f3fc"];
const HEADING_LEVELS = [
  { tag: "h1", label: "H1", size: "2em" },
  { tag: "h2", label: "H2", size: "1.6em" },
  { tag: "h3", label: "H3", size: "1.35em" },
  { tag: "h4", label: "H4", size: "1.15em" },
  { tag: "h5", label: "H5", size: "1em" },
  { tag: "h6", label: "H6", size: "0.9em" },
];

const AUTO_CORRECT: Record<string, string> = {
  teh: "the", adn: "and", recieve: "receive", seperate: "separate",
  occured: "occurred", definately: "definitely", wierd: "weird",
  freind: "friend", beleive: "believe", calender: "calendar",
  tommorow: "tomorrow", untill: "until", wich: "which", thier: "their",
};

const FILLER_WORDS = ["very","really","actually","basically","literally","just","quite","simply","totally","definitely","obviously","clearly","kind of","sort of","a lot","in order to","due to the fact","at this point in time"];
const WEAK_PHRASES = ["is being","was being","has been","have been","had been","would have","could have","should have","might have","may have"];

const DICTIONARY = ["about","above","across","action","actually","added","after","again","against","almost","along","already","although","always","among","amount","another","answer","anyone","anything","appear","around","available","back","became","because","become","before","begin","behind","believe","below","better","between","beyond","bring","business","called","cannot","carry","center","certain","change","children","choose","class","clear","close","color","coming","common","company","complete","consider","continue","could","country","course","create","current","decide","describe","develop","different","difficult","direct","during","early","education","effect","either","enough","every","example","experience","family","father","feeling","figure","follow","friend","future","general","given","government","great","ground","group","growth","happen","having","heard","heavy","history","however","hundred","important","include","inside","issue","itself","knowledge","language","large","later","learn","leave","letter","level","light","little","local","machine","major","material","matter","maybe","mean","measure","medical","member","memory","message","method","middle","might","minute","modern","moment","money","month","morning","mother","mountain","music","nation","natural","nature","nearly","necessary","need","never","night","nothing","notice","number","object","occur","offer","often","order","other","paper","particular","people","perhaps","person","picture","place","plan","point","police","policy","possible","power","practice","prepare","present","president","press","pretty","prevent","private","probably","problem","process","produce","product","program","project","property","provide","public","purpose","question","quickly","quiet","rather","reach","ready","really","reason","receive","recent","recognize","record","reduce","reflect","region","relate","remain","remember","remove","report","require","research","resource","respond","result","return","right","roughly","school","science","season","second","section","seem","sense","series","serious","serve","service","several","shall","share","short","should","similar","simple","simply","since","single","situation","small","social","society","some","someone","something","sometimes","space","speak","special","spend","stand","start","state","statement","station","stay","still","story","street","strong","structure","student","study","subject","success","suddenly","suggest","summer","support","system","table","taken","teach","thing","though","thought","thousand","through","throughout","together","tomorrow","tonight","total","toward","town","trade","training","travel","treatment","trouble","truth","understand","until","usually","value","various","victim","video","village","visit","voice","watch","water","weapon","weather","week","weight","welcome","western","whatever","whenever","wherever","whether","which","while","white","whole","whose","window","within","without","woman","wonder","world","worry","would","write","writer","wrong","year","young","yourself"];

const POSITIVE_WORDS = new Set(["good","great","excellent","amazing","wonderful","fantastic","love","happy","joy","success","best","awesome","beautiful","perfect","brilliant","outstanding","superb","delight","excited","pleased","positive","strong","benefit","improve","enhance","win","triumph","achieve","accomplish","proud","inspired","creative","innovative","bright","fresh"]);
const NEGATIVE_WORDS = new Set(["bad","terrible","awful","horrible","hate","sad","angry","fail","failure","worst","ugly","broken","poor","weak","wrong","problem","issue","difficult","hard","struggle","pain","hurt","loss","lose","fear","worry","anxious","stress","tired","exhausted","confused","frustrated","disappointed","negative","damage","harm","threat","risk","danger","crisis","disaster"]);
const FORMAL_MARKERS = new Set(["therefore","however","furthermore","moreover","consequently","nevertheless","accordingly","thus","hence","subsequently","regarding","concerning","pursuant","hereby","therein","whereas","whereby"]);
const INFORMAL_MARKERS = new Set(["gonna","wanna","gotta","yeah","yep","nope","cool","dude","ok","okay","stuff","totally","super","pretty","kinda","sorta"]);
const COMMON_ADVERBS = new Set(["very","really","quite","rather","somewhat","extremely","absolutely","definitely","certainly","clearly","obviously","simply","totally","basically","literally","actually","quickly","slowly","carefully","easily","hardly","barely","almost","nearly","always","never","often","sometimes","usually","rarely","frequently"]);
const CLICHES = ["at the end of the day","think outside the box","low-hanging fruit","back to the drawing board","piece of cake","break a leg","hit the nail on the head","when pigs fly","let the cat out of the bag","once in a blue moon","the ball is in your court","cut to the chase","bite the bullet","under the weather","spill the beans","burn the midnight oil","the tip of the iceberg","a blessing in disguise","better late than never","actions speak louder than words"];

const TRANSITIONS: Record<string, string[]> = {
  addition: ["Additionally","Furthermore","Moreover","Also","In addition","Besides","What's more"],
  contrast: ["However","Nevertheless","On the other hand","In contrast","Conversely","Yet","Still"],
  cause: ["Therefore","Thus","Hence","Consequently","As a result","Accordingly","Because of this"],
  example: ["For example","For instance","To illustrate","Such as","Namely","Specifically","In particular"],
  sequence: ["First","Second","Then","Next","Afterward","Finally","Meanwhile","Subsequently"],
  summary: ["In conclusion","To summarize","In short","Overall","In essence","All in all","Ultimately"],
  emphasis: ["Indeed","In fact","Certainly","Undoubtedly","Of course","Truly","Especially","Notably"],
  time: ["Meanwhile","Previously","Afterwards","Simultaneously","Eventually","Soon","Later","Currently"],
};

const EMOJI_CATEGORIES: Record<string, string[]> = {
  smileys: ["😀","😃","😄","😁","😆","😅","🤣","😂","🙂","🙃","😉","😊","😇","🥰","😍","🤩","😘","😋","😜","🤪","🤗","🤔","🤨","😐","😏","😒","🙄","😬","😌","😔","😴","😷","🤒","🤢","🥵","🥶","😵","🤯","🤠","🥳","😎","🤓","🧐","😕","🙁","😮","😲","😳","🥺","😨","😰","😥","😢","😭","😱","😖","😞","😩","😫","😤","😡","😠","🤬"],
  gestures: ["👍","👎","👌","✌️","🤞","🤟","🤘","🤙","👈","👉","👆","👇","☝️","✋","🤚","🖐️","🖖","👋","🤝","🙏","✍️","💪","👏","🙌","👐","🤲","🤜","🤛"],
  hearts: ["❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💔","❣️","💕","💞","💓","💗","💖","💘","💝","💟","💌"],
  nature: ["🌱","🌿","🍀","🌾","🌵","🌴","🌳","🌲","🌸","🌼","🌻","🌺","🌷","🌹","🥀","🍁","🍂","🍃","🌍","🌎","🌏","⭐","🌟","✨","💫","☀️","🌤️","⛅","🌥️","☁️","🌦️","🌧️","⛈️","🌩️","🌨️","❄️","☃️","⛄","🌬️","💨","🌪️","🌈","☔","💧","🌊","🔥"],
  food: ["🍎","🍊","🍋","🍌","🍉","🍇","🍓","🫐","🍈","🍒","🍑","🥭","🍍","🥥","🥝","🍅","🥑","🥦","🥬","🥒","🌶️","🌽","🥕","🧄","🧅","🥔","🍠","🥐","🍞","🥖","🥨","🧀","🥚","🍳","🧈","🥞","🧇","🥓","🥩","🍗","🍖","🌭","🍔","🍟","🍕","🥪","🥙","🌮","🌯","🥗","🍝","🍜","🍲","🍛","🍣","🍱","🍤","🍙","🍚","🍘","🍥","🍢","🍡","🍧","🍨","🍦","🥧","🧁","🍰","🎂","🍮","🍭","🍬","🍫","🍿","🍩","🍪"],
  activities: ["⚽","🏀","🏈","⚾","🥎","🎾","🏐","🏉","🎱","🏓","🏸","🏒","🏑","⛳","🏹","🎣","🥊","🥋","🎽","🛹","🎿","⛷️","🏂","🏋️","🤼","🤸","⛹️","🤺","🏌️","🏇","🧘","🏄","🏊","🚴","🏆","🥇","🥈","🥉","🏅","🎖️","🎫","🎪","🎭","🎨","🎬","🎤","🎧","🎼","🎹","🥁","🎷","🎺","🎸","🎻","🎲","🎯","🎮","🎰","🧩"],
  travel: ["✈️","🛫","🛬","💺","🛰️","🚀","🛸","🚁","🛶","⛵","🚤","🛥️","🛳️","🚢","⚓","🚂","🚄","🚆","🚇","🚈","🚊","🚌","🚍","🚐","🚑","🚒","🚓","🚕","🚖","🚗","🚘","🚙","🛻","🚚","🚛","🚜","🏎️","🏍️","🛵","🚲","🛴","🚏","🛣️","⛽","🚨","🚥","🚦","🛑","🚧"],
  symbols: ["❤️","🧡","💛","💚","💙","💜","☮️","✝️","☪️","🕉️","☸️","✡️","🕎","☯️","🛐","♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒","♓","🆔","⚛️","🉑","☢️","☣️","📴","📳","✴️","💮","🉐","㊙️","㊗️","❌","⭕","🛑","⛔","📛","🚫","💯","💢","♨️","🚷","🚯","🚳","🚱","🔞","📵","🚭","❗","❕","❓","❔","‼️","⁉️","⚠️","🚸","🔱","⚜️","🔰","♻️","✅","🈯","💹","❇️","✳️","❎","🌐","💠","Ⓜ️","🌀","💤","🏧","🚾","♿","🅿️"],
};

const SAMPLE = `Word Counter Pro is a powerful tool. Select some text, then use the toolbar to format it — Bold, Italic, colors, headings, and more. Only your selection will change!`;

const CONTENT_TYPES = [
  { name: "Blog Post", icon: "📝", recommended: "1,500 - 2,500 words", ideal: 2000, purpose: "SEO ranking & reader engagement" },
  { name: "Essay", icon: "📚", recommended: "500 - 1,500 words", ideal: 1000, purpose: "Academic assignments & school work" },
  { name: "Assignment", icon: "📄", recommended: "250 - 1,000 words", ideal: 500, purpose: "Homework & coursework" },
  { name: "YouTube Description", icon: "▶️", recommended: "150 - 300 words", ideal: 200, purpose: "SEO & viewer info (5000 char max)" },
  { name: "Social Media Post", icon: "📱", recommended: "10 - 100 words", ideal: 50, purpose: "Engagement on Twitter/Instagram/LinkedIn" },
  { name: "Product Description", icon: "🛍️", recommended: "100 - 300 words", ideal: 150, purpose: "E-commerce conversion" },
  { name: "News Article", icon: "📰", recommended: "400 - 800 words", ideal: 600, purpose: "Journalism & reporting" },
  { name: "Email", icon: "✉️", recommended: "50 - 200 words", ideal: 100, purpose: "Business or personal communication" },
  { name: "Academic Paper", icon: "🎓", recommended: "3,000 - 8,000 words", ideal: 5000, purpose: "Research & journals" },
];

const SOCIAL_PLATFORMS = [
  { name: "Instagram Caption", icon: "📷", limit: 2200, recommended: 125, hint: "First 125 chars visible before 'more'" },
  { name: "Facebook Post", icon: "👥", limit: 63206, recommended: 80, hint: "Short posts get 66% more engagement" },
  { name: "X / Twitter Post", icon: "🐦", limit: 280, recommended: 240, hint: "Leave room for hashtags & links" },
  { name: "LinkedIn Post", icon: "💼", limit: 3000, recommended: 1300, hint: "First 1300 chars visible before 'see more'" },
  { name: "YouTube Title", icon: "▶️", limit: 100, recommended: 60, hint: "Mobile shows only ~60 chars" },
  { name: "YouTube Description", icon: "📹", limit: 5000, recommended: 300, hint: "First 200 words most important for SEO" },
];

const safeGet = (k: string): string | null => {
  try { return typeof window !== "undefined" ? localStorage.getItem(k) : null; } catch { return null; }
};
const safeSet = (k: string, v: string) => {
  try { if (typeof window !== "undefined") localStorage.setItem(k, v); } catch {}
};
const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
   .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
const formatTime = (s: number) => {
  const m = Math.floor(s / 60); const sec = s % 60; const h = Math.floor(m / 60);
  if (h > 0) return `${h}h ${m % 60}m`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
};
const formatMinSec = (totalSeconds: number) => {
  if (totalSeconds < 60) return `${totalSeconds} sec`;
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return s > 0 ? `${m} min ${s} sec` : `${m} min`;
};

const getTextOffset = (node: Node, offset: number, root: Node): number => {
  let count = 0;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let n: Node | null;
  while ((n = walker.nextNode())) {
    if (n === node) return count + offset;
    count += (n.textContent?.length || 0);
  }
  return count;
};
const getNodeAtOffset = (offset: number, root: Node): { node: Text; offset: number } | null => {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let count = 0;
  let n: Node | null;
  while ((n = walker.nextNode())) {
    const len = n.textContent?.length || 0;
    if (count + len >= offset) return { node: n as Text, offset: offset - count };
    count += len;
  }
  return null;
};

const useAnimatedNumber = (target: number, duration = 500) => {
  const [value, setValue] = useState(target);
  const startRef = useRef(target);
  const rafRef = useRef<number | null>(null);
  useEffect(() => {
    const start = startRef.current;
    const end = target;
    if (start === end) return;
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const cur = Math.round(start + (end - start) * eased);
      setValue(cur);
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
      else { setValue(end); startRef.current = end; }
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration]);
  return value;
};

const AnimatedCounter = ({ value, className }: { value: number; className?: string }) => {
  const animated = useAnimatedNumber(value);
  return <span className={className}>{animated.toLocaleString()}</span>;
};

export default function WordCounterClient() {
  const [html, setHtml] = useState("");
  const [text, setText] = useState("");
  const [errors, setErrors] = useState<ErrorItem[]>([]);
  const [checking, setChecking] = useState(false);
  const [font, setFont] = useState("Inter");
  const [fontSize, setFontSize] = useState(16);
  const [lineHeight, setLineHeight] = useState(1.7);
  const [color, setColor] = useState("#111827");
  const [highlight, setHighlight] = useState("#fef08a");
  const [pageSize, setPageSize] = useState("A4");
  const [showArticle, setShowArticle] = useState<string | null>("what-is");
  const [goal, setGoal] = useState(1000);
  const [isFocus, setIsFocus] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedStats, setCopiedStats] = useState(false);
  const [lang, setLang] = useState("en-US");
  const [autoLang, setAutoLang] = useState("Auto Detect: -");
  const [showHighlight, setShowHighlight] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [showFind, setShowFind] = useState(false);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [autoCorrect, setAutoCorrect] = useState(true);
  const [autoComplete, setAutoComplete] = useState(true);
  const [duplicateHighlight, setDuplicateHighlight] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [goalReached, setGoalReached] = useState(false);
  const [writingTime, setWritingTime] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [activeToolTab, setActiveToolTab] = useState<string>("suggested");
  const [activeSuggestedTool, setActiveSuggestedTool] = useState<string>("char");
  const [readingSpeed, setReadingSpeed] = useState<"slow" | "average" | "fast" | "custom">("average");
  const [customReadingWPM, setCustomReadingWPM] = useState(200);
  const [speakingWPM, setSpeakingWPM] = useState(130);
  const [academicLimit, setAcademicLimit] = useState(1500);
  const [academicType, setAcademicType] = useState("Essay");
  const [activeSocial, setActiveSocial] = useState("Instagram Caption");
  const [socialText, setSocialText] = useState("");
  const [showFormatBar, setShowFormatBar] = useState(true);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBgPicker, setShowBgPicker] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [activeFormats, setActiveFormats] = useState<Record<string, boolean>>({});
  const [insightTab, setInsightTab] = useState<"insights" | "session" | "visuals" | "cloud" | "emoji" | "docs">("insights");
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionElapsed, setSessionElapsed] = useState(0);
  const [sessionWordsBaseline, setSessionWordsBaseline] = useState(0);
  const [documents, setDocuments] = useState<DocItem[]>([]);
  const [docName, setDocName] = useState("");
  const [selectedEmojiCat, setSelectedEmojiCat] = useState("smileys");
  const [cloudPalette, setCloudPalette] = useState<"violet" | "ocean" | "sunset" | "forest">("violet");
  const [transitionCat, setTransitionCat] = useState("addition");

  const editorRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const grammarAbortRef = useRef<AbortController | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedSelRef = useRef<{ start: number; end: number } | null>(null);
  const shareMenuRef = useRef<HTMLDivElement>(null);
  const colorMenuRef = useRef<HTMLDivElement>(null);
  const bgMenuRef = useRef<HTMLDivElement>(null);

  // -------- LOAD --------
  useEffect(() => {
    const savedHtml = safeGet("lorem_word_html");
    const savedText = safeGet("lorem_word_text");
    if (savedHtml) {
      setHtml(savedHtml);
      if (editorRef.current) editorRef.current.innerHTML = savedHtml;
    } else if (savedText) {
      const escaped = escapeHtml(savedText).replace(/\n/g, "<br>");
      setHtml(escaped);
      if (editorRef.current) editorRef.current.innerHTML = escaped;
    }
    if (savedText) setText(savedText);
    const cfg = safeGet("lorem_cfg");
    if (cfg) {
      try {
        const c = JSON.parse(cfg);
        if (c.font) setFont(c.font);
        if (c.fontSize) setFontSize(c.fontSize);
        if (c.lineHeight) setLineHeight(c.lineHeight);
        if (c.color) setColor(c.color);
        if (c.pageSize) setPageSize(c.pageSize);
        if (c.goal) setGoal(c.goal);
        if (c.dark) setIsDark(c.dark);
        if (c.lang) setLang(c.lang);
        if (c.autoCorrect !== undefined) setAutoCorrect(c.autoCorrect);
        if (c.autoComplete !== undefined) setAutoComplete(c.autoComplete);
        if (c.readingSpeed) setReadingSpeed(c.readingSpeed);
        if (c.customReadingWPM) setCustomReadingWPM(c.customReadingWPM);
        if (c.speakingWPM) setSpeakingWPM(c.speakingWPM);
      } catch {}
    }
  }, []);

  // -------- AUTO SAVE --------
  useEffect(() => {
    setSaveStatus("saving");
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      safeSet("lorem_word_html", html);
      safeSet("lorem_word_text", text);
      safeSet("lorem_cfg", JSON.stringify({ font, fontSize, lineHeight, color, pageSize, goal, dark: isDark, lang, autoCorrect, autoComplete, readingSpeed, customReadingWPM, speakingWPM }));
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 1200);
    }, 400);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [html, text, font, fontSize, lineHeight, color, pageSize, goal, isDark, lang, autoCorrect, autoComplete, readingSpeed, customReadingWPM, speakingWPM]);

  // -------- AUTO LANGUAGE --------
  useEffect(() => {
    if (!text.trim()) { setAutoLang("Auto Detect: -"); return; }
    const hasHindi = /[\u0900-\u097F]/.test(text);
    const hasLatin = /[a-zA-Z]/.test(text);
    setAutoLang(hasHindi && !hasLatin ? "Auto Detect: Hindi 🇮🇳" : hasHindi ? "Auto Detect: Mixed 🌐" : "Auto Detect: English 🇺🇸");
  }, [text]);

  // -------- WRITING TIME --------
  useEffect(() => {
    const tick = setInterval(() => { if (isActive) setWritingTime(t => t + 1); }, 1000);
    return () => clearInterval(tick);
  }, [isActive]);

  const markActive = useCallback(() => {
    setIsActive(true);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => setIsActive(false), 5000);
  }, []);

  // -------- CLOSE MENUS ON OUTSIDE CLICK --------
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(e.target as Node)) setShowShareMenu(false);
      if (colorMenuRef.current && !colorMenuRef.current.contains(e.target as Node)) setShowColorPicker(false);
      if (bgMenuRef.current && !bgMenuRef.current.contains(e.target as Node)) setShowBgPicker(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  // v10 — session timer
  useEffect(() => {
    if (!sessionActive) return;
    const t = setInterval(() => setSessionElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, [sessionActive]);

  // v10 — load documents
  useEffect(() => {
    const saved = safeGet("lorem_documents");
    if (saved) { try { setDocuments(JSON.parse(saved)); } catch {} }
  }, []);

  // v10 — save documents
  useEffect(() => {
    safeSet("lorem_documents", JSON.stringify(documents));
  }, [documents]);

  const effectiveReadingWPM = readingSpeed === "slow" ? 100 : readingSpeed === "fast" ? 300 : readingSpeed === "custom" ? customReadingWPM : 200;

  // -------- STATS --------
  const stats = useMemo(() => {
    const trimmed = text.trim();
    const words = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
    const chars = text.length;
    const charsNoSpace = text.replace(/\s/g, "").length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length || 0;
    const paras = text.split(/\n+/).filter(p => p.trim().length > 0).length;
    const lines = text ? text.split(/\n/).length : 0;
    const readingSeconds = Math.round((words / effectiveReadingWPM) * 60);
    const speakingSeconds = Math.round((words / Math.max(1, speakingWPM)) * 60);
    const avgWPS = words / (sentences || 1);
    const syllables = text.toLowerCase().split(/\s+/).reduce((a, w) => a + Math.max(1, (w.match(/[aeiouy]+/g) || []).length), 0);
    const flesch = words > 0 ? Math.max(0, Math.min(100, Math.round(206.835 - 1.015 * avgWPS - 84.6 * (syllables / words)))) : 0;
    let level = "—";
    if (words > 0) {
      if (flesch >= 80) level = "Easy 🟢";
      else if (flesch >= 60) level = "Standard 🟡";
      else if (flesch >= 40) level = "Hard 🟠";
      else level = "Very Hard 🔴";
    }
    const freq: Record<string, number> = {};
    if (words > 0) trimmed.toLowerCase().split(/\s+/).forEach(w => {
      const c = w.replace(/[^a-z0-9\u0900-\u097F]/g, "");
      if (c.length > 2) freq[c] = (freq[c] || 0) + 1;
    });
    const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
    const top10 = sorted.slice(0, 10);
    const density = top10.map(([k, v]) => [k, ((v / words) * 100).toFixed(2)] as [string, string]);
    const sentArr = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
    const sentLens = sentArr.map(s => s.split(/\s+/).length);
    const short = sentLens.filter(l => l <= 10).length;
    const medium = sentLens.filter(l => l > 10 && l <= 20).length;
    const long = sentLens.filter(l => l > 20).length;
    return { words, chars, charsNoSpace, sentences, paras, lines, readingSeconds, speakingSeconds, flesch, level, top10, density, short, medium, long, totalSent: sentArr.length, letters: (text.match(/[a-zA-Z]/g) || []).length, digits: (text.match(/\d/g) || []).length, punct: (text.match(/[.,!?;:'"\-()]/g) || []).length };
  }, [text, effectiveReadingWPM, speakingWPM]);

  const duplicates = useMemo(() => {
    const trimmed = text.trim();
    if (!trimmed) return { words: [] as [string, number][], sentences: [] as { text: string; count: number }[], lines: [] as { text: string; count: number }[] };
    const words = trimmed.toLowerCase().split(/\s+/).map(w => w.replace(/[^a-z0-9]/g, "")).filter(w => w.length > 3);
    const wc: Record<string, number> = {};
    words.forEach(w => { wc[w] = (wc[w] || 0) + 1; });
    const dupWords = Object.entries(wc).filter(([, c]) => c > 1).sort((a, b) => b[1] - a[1]).slice(0, 20);
    const sentences = text.split(/[.!?]+/).map(s => s.trim().toLowerCase()).filter(s => s.length > 20);
    const sc: Record<string, number> = {};
    sentences.forEach(s => { sc[s] = (sc[s] || 0) + 1; });
    const dupSentences = Object.entries(sc).filter(([, c]) => c > 1).map(([s, c]) => ({ text: s.slice(0, 80), count: c }));
    const lines = text.split(/\n/).map(l => l.trim()).filter(l => l.length > 5);
    const lc: Record<string, number> = {};
    lines.forEach(l => { lc[l.toLowerCase()] = (lc[l.toLowerCase()] || 0) + 1; });
    const dupLines = Object.entries(lc).filter(([, c]) => c > 1).map(([l, c]) => ({ text: l.slice(0, 80), count: c }));
    return { words: dupWords, sentences: dupSentences, lines: dupLines };
  }, [text]);

  // v10 — AI Insights
  const insights: InsightResult = useMemo(() => {
    const trimmed = text.trim();
    const words = trimmed ? trimmed.split(/\s+/).filter(Boolean) : [];
    const lowerWords = words.map(w => w.toLowerCase().replace(/[^a-z]/g, "")).filter(Boolean);

    let pos = 0, neg = 0;
    lowerWords.forEach(w => { if (POSITIVE_WORDS.has(w)) pos++; if (NEGATIVE_WORDS.has(w)) neg++; });
    const sentTotal = pos + neg;
    const sentScore = sentTotal === 0 ? 0 : Math.round(((pos - neg) / sentTotal) * 100);
    const sentimentLabel = sentTotal === 0 ? "Neutral" : sentScore > 20 ? "Positive 😊" : sentScore < -20 ? "Negative 😟" : "Mixed 😐";

    let formal = 0, informal = 0;
    lowerWords.forEach(w => { if (FORMAL_MARKERS.has(w)) formal++; if (INFORMAL_MARKERS.has(w)) informal++; });
    const toneScore = (formal + informal) === 0 ? 50 : Math.round((formal / (formal + informal)) * 100);
    const toneLabel = toneScore >= 65 ? "Formal 🎩" : toneScore <= 35 ? "Informal 💬" : "Neutral ⚖️";

    const passiveRegex = /\b(is|are|was|were|be|been|being|am)\s+(\w+ed|born|made|done|given|taken|seen|known|shown|written|spoken|broken|chosen|driven|eaten|fallen|forgotten|frozen|gotten|hidden|ridden|risen|shaken|stolen|worn)\b/gi;
    const passiveMatches = text.match(passiveRegex) || [];
    const passivePct = words.length > 0 ? Math.round((passiveMatches.length / words.length) * 100 * 10) / 10 : 0;

    const adverbs = lowerWords.filter(w => w.endsWith("ly") || COMMON_ADVERBS.has(w));
    const adverbFreq: Record<string, number> = {};
    adverbs.forEach(a => { adverbFreq[a] = (adverbFreq[a] || 0) + 1; });
    const topAdverbs = Object.entries(adverbFreq).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const adverbPct = words.length > 0 ? Math.round((adverbs.length / words.length) * 100 * 10) / 10 : 0;

    const lowerText = trimmed.toLowerCase();
    const foundCliches = CLICHES.filter(c => lowerText.includes(c));

    const uniqueWords = new Set(lowerWords).size;
    const ttr = words.length > 0 ? Math.round((uniqueWords / words.length) * 100 * 10) / 10 : 0;
    const vocabLabel = ttr >= 60 ? "Rich 🌟" : ttr >= 45 ? "Good 👍" : ttr >= 30 ? "Repetitive 🔁" : "Very Repetitive ⚠️";

    const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(Boolean);
    const shortS = sentences.filter(s => s.split(/\s+/).length <= 8).length;
    const mediumS = sentences.filter(s => { const w = s.split(/\s+/).length; return w > 8 && w <= 20; }).length;
    const longS = sentences.filter(s => s.split(/\s+/).length > 20).length;
    const totalS = sentences.length || 1;
    const rawScore = Math.round((1 - Math.abs(shortS / totalS - 0.3) - Math.abs(mediumS / totalS - 0.5) - Math.abs(longS / totalS - 0.2)) * 100);
    const varScore = Math.max(0, Math.min(100, rawScore));
    const varLabel = varScore >= 70 ? "Excellent Variety 🌟" : varScore >= 50 ? "Good Mix 👍" : "Needs Variety 🔁";

    return {
      tone: { label: toneLabel, score: toneScore, hint: "Balance between formal and informal vocabulary" },
      sentiment: { label: sentimentLabel, score: sentScore, positive: pos, negative: neg },
      passive: { count: passiveMatches.length, percent: passivePct, examples: passiveMatches.slice(0, 5) },
      adverbs: { count: adverbs.length, percent: adverbPct, top: topAdverbs },
      cliches: { count: foundCliches.length, items: foundCliches },
      vocabulary: { ttr, uniqueWords, totalWords: words.length, label: vocabLabel },
      variety: { score: varScore, label: varLabel, distribution: { short: shortS, medium: mediumS, long: longS } },
    };
  }, [text]);

  // v10 — word cloud
  const wordCloud = useMemo(() => {
    const words = text.toLowerCase().split(/\s+/).map(w => w.replace(/[^a-z0-9\u0900-\u097F]/g, "")).filter(w => w.length > 3);
    const freq: Record<string, number> = {};
    words.forEach(w => { freq[w] = (freq[w] || 0) + 1; });
    const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 60);
    if (sorted.length === 0) return [] as { word: string; count: number; size: number }[];
    const max = sorted[0][1];
    const min = sorted[sorted.length - 1][1];
    return sorted.map(([word, count]) => ({
      word, count,
      size: 12 + ((count - min) / Math.max(1, max - min)) * 32,
    }));
  }, [text]);

  // v10 — session WPM
  const sessionWordsTyped = Math.max(0, stats.words - sessionWordsBaseline);
  const sessionWPM = sessionElapsed > 5 ? Math.round((sessionWordsTyped / sessionElapsed) * 60) : 0;

  const progress = goal > 0 ? Math.min(100, Math.round((stats.words / goal) * 100)) : 0;

  useEffect(() => {
    if (stats.words >= goal && goal > 0 && !goalReached) {
      setGoalReached(true);
      setShowConfetti(true);
      setToast(`🎉 Goal Reached! ${stats.words}/${goal} words`);
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator(); const g = ctx.createGain();
        osc.connect(g); g.connect(ctx.destination);
        osc.frequency.value = 880; g.gain.value = 0.08;
        osc.start(); osc.stop(ctx.currentTime + 0.15);
        setTimeout(() => {
          const o2 = ctx.createOscillator(); const g2 = ctx.createGain();
          o2.connect(g2); g2.connect(ctx.destination);
          o2.frequency.value = 1320; g2.gain.value = 0.08;
          o2.start(); o2.stop(ctx.currentTime + 0.2);
        }, 150);
      } catch {}
      setTimeout(() => setToast(null), 4000);
      setTimeout(() => setShowConfetti(false), 3500);
    } else if (stats.words < goal * 0.95) {
      setGoalReached(false);
    }
  }, [stats.words, goal, goalReached]);

  // -------- EDITOR SYNC --------
  const syncFromEditor = useCallback(() => {
    if (!editorRef.current) return;
    const newHtml = editorRef.current.innerHTML;
    const newText = editorRef.current.innerText || "";
    setHtml(newHtml);
    setText(newText);
  }, []);

  // -------- SELECTION SAVE --------
  const saveSelection = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || !editorRef.current) return;
    const range = sel.getRangeAt(0);
    if (!editorRef.current.contains(range.commonAncestorContainer)) return;
    if (range.toString().length === 0) return;
    const start = getTextOffset(range.startContainer, range.startOffset, editorRef.current);
    const end = getTextOffset(range.endContainer, range.endOffset, editorRef.current);
    if (start !== end) savedSelRef.current = { start, end };
  }, []);

  useEffect(() => {
    const handler = () => {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0 || !editorRef.current) return;
      const range = sel.getRangeAt(0);
      if (!editorRef.current.contains(range.commonAncestorContainer)) return;
      if (range.toString().length === 0) return;
      const start = getTextOffset(range.startContainer, range.startOffset, editorRef.current);
      const end = getTextOffset(range.endContainer, range.endOffset, editorRef.current);
      if (start !== end) savedSelRef.current = { start, end };
    };
    document.addEventListener("selectionchange", handler);
    return () => document.removeEventListener("selectionchange", handler);
  }, []);

  // -------- CARET --------
  const getCaretOffset = (): number => {
    if (!editorRef.current) return text.length;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return text.length;
    try {
      const range = sel.getRangeAt(0);
      const pre = range.cloneRange();
      pre.selectNodeContents(editorRef.current);
      pre.setEnd(range.endContainer, range.endOffset);
      return pre.toString().length;
    } catch { return text.length; }
  };

  const setCaretOffset = (offset: number) => {
    if (!editorRef.current) return;
    const root = editorRef.current;
    let remaining = offset;
    const range = document.createRange();
    let found = false;
    const visit = (n: Node): boolean => {
      if (found) return true;
      if (n.nodeType === Node.TEXT_NODE) {
        const len = n.textContent?.length || 0;
        if (remaining <= len) { range.setStart(n, remaining); range.collapse(true); found = true; return true; }
        remaining -= len;
      } else {
        for (let i = 0; i < n.childNodes.length; i++) if (visit(n.childNodes[i])) return true;
      }
      return false;
    };
    visit(root);
    if (!found) { range.selectNodeContents(root); range.collapse(false); }
    const sel = window.getSelection();
    if (sel) { sel.removeAllRanges(); sel.addRange(range); }
  };

  const restoreSelection = (): boolean => {
    if (!editorRef.current) return false;
    const saved = savedSelRef.current;
    if (!saved || saved.start === saved.end) return false;
    const startPos = getNodeAtOffset(saved.start, editorRef.current);
    const endPos = getNodeAtOffset(saved.end, editorRef.current);
    if (!startPos || !endPos) return false;
    try { editorRef.current.focus({ preventScroll: true }); } catch { editorRef.current.focus(); }
    try {
      const range = document.createRange();
      range.setStart(startPos.node, startPos.offset);
      range.setEnd(endPos.node, endPos.offset);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
      return true;
    } catch { return false; }
  };

  const hasSelection = (): boolean => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || !editorRef.current) return false;
    const r = sel.getRangeAt(0);
    return editorRef.current.contains(r.commonAncestorContainer) && !r.collapsed && r.toString().length > 0;
  };

  // -------- FORMATTING --------
  const updateActiveFormats = useCallback(() => {
    try {
      setActiveFormats({
        bold: document.queryCommandState("bold"),
        italic: document.queryCommandState("italic"),
        underline: document.queryCommandState("underline"),
        strikeThrough: document.queryCommandState("strikeThrough"),
        superscript: document.queryCommandState("superscript"),
        subscript: document.queryCommandState("subscript"),
        insertUnorderedList: document.queryCommandState("insertUnorderedList"),
        insertOrderedList: document.queryCommandState("insertOrderedList"),
        justifyLeft: document.queryCommandState("justifyLeft"),
        justifyCenter: document.queryCommandState("justifyCenter"),
        justifyRight: document.queryCommandState("justifyRight"),
        justifyFull: document.queryCommandState("justifyFull"),
      });
    } catch {}
  }, []);

  useEffect(() => {
    document.addEventListener("selectionchange", updateActiveFormats);
    return () => document.removeEventListener("selectionchange", updateActiveFormats);
  }, [updateActiveFormats]);

  // ✅ FIXED: exec() now reliably restores selection before applying command
  const exec = useCallback((cmd: string, val?: string) => {
    if (!editorRef.current) return;
    // If there is no current live selection but we have a saved one, restore it first
    if (!hasSelection() && savedSelRef.current) {
      restoreSelection();
    } else {
      try { editorRef.current.focus({ preventScroll: true }); } catch { editorRef.current.focus(); }
    }
    try { document.execCommand("styleWithCSS", false, "true"); } catch {}
    try { document.execCommand(cmd, false, val); } catch {}
    syncFromEditor();
    updateActiveFormats();
  }, [syncFromEditor, updateActiveFormats]);

  const applyColorToSelection = useCallback((newColor: string, isHighlight = false) => {
    const editor = editorRef.current;
    if (!editor) return;
    if (!hasSelection()) {
      if (!restoreSelection() || !hasSelection()) {
        setToast("⚠ Select text first to apply color");
        setTimeout(() => setToast(null), 2200);
        return;
      }
    }
    try { document.execCommand("styleWithCSS", false, "true"); } catch {}
    document.execCommand(isHighlight ? "hiliteColor" : "foreColor", false, newColor);
    if (isHighlight) setHighlight(newColor); else setColor(newColor);
    syncFromEditor();
    setToast(isHighlight ? "✨ Highlight applied" : "🎨 Text color applied");
    setTimeout(() => setToast(null), 1500);
  }, [syncFromEditor]);

  const applyFontToSelection = useCallback((fontName: string) => {
    const editor = editorRef.current;
    if (!editor) return;
    if (!hasSelection()) {
      if (!restoreSelection() || !hasSelection()) {
        setFont(fontName);
        setToast(`Font set to ${fontName} (whole editor)`);
        setTimeout(() => setToast(null), 1800);
        return;
      }
    }
    try { document.execCommand("styleWithCSS", false, "true"); } catch {}
    document.execCommand("fontName", false, fontName);
    setFont(fontName);
    syncFromEditor();
    setToast(`🔤 ${fontName} applied to selection`);
    setTimeout(() => setToast(null), 1500);
  }, [syncFromEditor]);

  const formatHeading = (tag: string) => {
    exec("formatBlock", tag);
    setToast(`📌 ${tag.toUpperCase()} applied`);
    setTimeout(() => setToast(null), 1200);
  };

  const insertLink = () => {
    const url = prompt("Enter URL:", "https://");
    if (!url || url === "https://") return;
    if (!hasSelection()) {
      if (!restoreSelection() || !hasSelection()) {
        setToast("⚠ Select text first to add link");
        setTimeout(() => setToast(null), 2200);
        return;
      }
    }
    exec("createLink", url);
    setToast("🔗 Link added");
    setTimeout(() => setToast(null), 1500);
  };

  const insertHR = () => { exec("insertHorizontalRule"); setToast("➖ Horizontal rule inserted"); setTimeout(() => setToast(null), 1200); };
  const insertVR = () => {
    editorRef.current?.focus();
    const htmlVr = `<div contenteditable="false" style="display:inline-block;border-left:2px solid #a855f7;height:1.2em;margin:0 8px;vertical-align:middle"></div>`;
    document.execCommand("insertHTML", false, htmlVr);
    syncFromEditor();
    setToast("│ Vertical rule inserted");
    setTimeout(() => setToast(null), 1200);
  };
  const insertCode = () => exec("formatBlock", "pre");
  const insertQuote = () => exec("formatBlock", "blockquote");

  // -------- SOCIAL SHARE --------
  const shareViaTwitter = () => {
    const u = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text.slice(0, 250))}`;
    window.open(u, "_blank", "noopener,noreferrer");
    setShowShareMenu(false);
  };
  const shareViaFacebook = () => {
    const u = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}&quote=${encodeURIComponent(text.slice(0, 250))}`;
    window.open(u, "_blank", "noopener,noreferrer");
    setShowShareMenu(false);
  };
  const shareViaWhatsApp = () => {
    const u = `https://wa.me/?text=${encodeURIComponent(text.slice(0, 500))}`;
    window.open(u, "_blank", "noopener,noreferrer");
    setShowShareMenu(false);
  };
  const shareViaLinkedIn = () => {
    const u = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`;
    window.open(u, "_blank", "noopener,noreferrer");
    setShowShareMenu(false);
  };
  const shareViaTelegram = () => {
    const u = `https://t.me/share/url?url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}&text=${encodeURIComponent(text.slice(0, 250))}`;
    window.open(u, "_blank", "noopener,noreferrer");
    setShowShareMenu(false);
  };
  const shareViaEmail = () => {
    const u = `mailto:?subject=${encodeURIComponent("Shared from Word Counter Pro")}&body=${encodeURIComponent(text.slice(0, 1500))}`;
    if (typeof window !== "undefined") window.location.href = u;
    setShowShareMenu(false);
  };
  const copyForShare = async () => {
    try { await navigator.clipboard.writeText(text); setToast("✓ Copied to clipboard"); setTimeout(() => setToast(null), 1500); } catch {}
    setShowShareMenu(false);
  };
  const nativeShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: "Word Counter Pro", text: text.slice(0, 200) }); } catch {}
    } else copyForShare();
    setShowShareMenu(false);
  };

  // -------- INPUT --------
  const handleInput = () => {
    markActive();
    if (!editorRef.current) return;
    let current = editorRef.current.innerText || "";
    if (autoCorrect) {
      const caret = getCaretOffset();
      const beforeCaret = current.slice(0, caret);
      const m = beforeCaret.match(/(\b[a-zA-Z]{2,})\s$/);
      if (m) {
        const word = m[1];
        const lower = word.toLowerCase();
        if (AUTO_CORRECT[lower]) {
          const fixed = word[0] === word[0].toUpperCase() ? AUTO_CORRECT[lower][0].toUpperCase() + AUTO_CORRECT[lower].slice(1) : AUTO_CORRECT[lower];
          const wordStart = caret - m[0].length;
          const next = current.slice(0, wordStart) + fixed + current.slice(wordStart + word.length);
          editorRef.current.innerText = next;
          current = next;
          setCaretOffset(wordStart + fixed.length);
        }
      }
    }
    setHtml(editorRef.current.innerHTML);
    setText(current);
    if (autoComplete) {
      const m = current.match(/([a-zA-Z]{2,})$/);
      if (m) {
        const prefix = m[1].toLowerCase();
        const sugg = DICTIONARY.filter(w => w.startsWith(prefix) && w !== prefix).slice(0, 5);
        setSuggestions(sugg.map(w => ({ word: w, at: current.length - m[1].length, replaceLen: m[1].length })));
      } else setSuggestions([]);
    } else setSuggestions([]);
  };

  const insertSuggestion = (s: Suggestion) => {
    if (!editorRef.current) return;
    const next = text.slice(0, s.at) + s.word + text.slice(s.at + s.replaceLen);
    editorRef.current.innerText = next;
    setHtml(editorRef.current.innerHTML);
    setText(next);
    setSuggestions([]);
    setCaretOffset(s.at + s.word.length);
    editorRef.current.focus();
  };

  const insertAtCursor = (insert: string) => {
    const editor = editorRef.current;
    if (!editor) { setText(t => t + (t ? " " : "") + insert); return; }
    editor.focus();
    document.execCommand("insertText", false, insert);
    syncFromEditor();
  };

  // -------- EDIT OPS --------
  const handleCopy = async () => {
    try {
      const sel = window.getSelection();
      const selected = sel && sel.toString().length > 0 ? sel.toString() : text;
      await navigator.clipboard.writeText(selected);
      setCopied(true); setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const handleCut = async () => {
    if (!hasSelection()) { setToast("⚠ Select text first to cut"); setTimeout(() => setToast(null), 2000); return; }
    const sel = window.getSelection();
    if (!sel) return;
    try { await navigator.clipboard.writeText(sel.toString()); } catch {}
    sel.deleteFromDocument();
    syncFromEditor();
  };

  const handlePaste = async () => {
    editorRef.current?.focus();
    try {
      const clip = await navigator.clipboard.readText();
      if (clip) document.execCommand("insertText", false, clip);
    } catch { document.execCommand("paste"); }
    syncFromEditor();
  };

  const handleDeleteKey = () => { editorRef.current?.focus(); document.execCommand("forwardDelete"); syncFromEditor(); };
  const handleBackspace = () => { editorRef.current?.focus(); document.execCommand("delete"); syncFromEditor(); };

  const handleClear = () => { if (!text) return; if (!confirm("Clear all text? This cannot be undone.")) return; if (editorRef.current) editorRef.current.innerHTML = ""; setHtml(""); setText(""); setErrors([]); setWritingTime(0); };

  const handleCopyStats = async () => {
    const s = `Words: ${stats.words} | Chars(with): ${stats.chars} | Chars(without): ${stats.charsNoSpace} | Sentences: ${stats.sentences} | Paragraphs: ${stats.paras} | Lines: ${stats.lines} | Reading: ${formatMinSec(stats.readingSeconds)} | Speaking: ${formatMinSec(stats.speakingSeconds)} | Writing: ${formatTime(writingTime)} | Flesch: ${stats.flesch} (${stats.level})`;
    try { await navigator.clipboard.writeText(s); setCopiedStats(true); setTimeout(() => setCopiedStats(false), 1500); } catch {}
  };

  const exportTxt = () => { const b = new Blob([text], { type: "text/plain" }); const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = "doc.txt"; a.click(); URL.revokeObjectURL(a.href); };
  const exportHtmlFile = () => { const b = new Blob([`<!doctype html><html><head><meta charset="utf-8"><title>Document</title></head><body style="font-family:${FONTS.find(f => f.name === font)?.css};font-size:${fontSize}px;line-height:${lineHeight};padding:40px;max-width:800px;margin:auto;color:${color}">${html || escapeHtml(text)}</body></html>`], { type: "text/html" }); const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = "doc.html"; a.click(); URL.revokeObjectURL(a.href); };
  const exportDoc = () => { const b = new Blob([`<html><body>${html || escapeHtml(text)}</body></html>`], { type: "application/msword" }); const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = "doc.doc"; a.click(); URL.revokeObjectURL(a.href); };
  const exportPdf = () => { const w = window.open("", "_blank"); if (w) { w.document.write(`<div style="font-family:${FONTS.find(f => f.name === font)?.css};font-size:${fontSize}px;line-height:${lineHeight};padding:24px;color:${color}">${html || escapeHtml(text)}</div>`); w.document.close(); setTimeout(() => w.print(), 300); } };
  const exportCsv = () => {
    const rows = [["Metric","Value"],["Words",stats.words],["Chars (with)",stats.chars],["Chars (without)",stats.charsNoSpace],["Sentences",stats.sentences],["Paragraphs",stats.paras],["Lines",stats.lines],["Reading Time",formatMinSec(stats.readingSeconds)],["Speaking Time",formatMinSec(stats.speakingSeconds)],["Writing Time",formatTime(writingTime)],["Flesch Score",stats.flesch],["Level",stats.level]];
    const csv = rows.map(r => r.join(",")).join("\n");
    const b = new Blob([csv], { type: "text/csv" }); const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = "stats.csv"; a.click(); URL.revokeObjectURL(a.href);
  };

  const toggleVoice = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert("❌ Voice typing only in Chrome/Edge over HTTPS."); return; }
    if (isListening && recognitionRef.current) { try { recognitionRef.current.stop(); } catch {} setIsListening(false); return; }
    try {
      const rec = new SR(); recognitionRef.current = rec;
      rec.lang = lang; rec.continuous = false; rec.interimResults = false; rec.maxAlternatives = 1;
      rec.onstart = () => setIsListening(true);
      rec.onresult = (event: any) => { const transcript = event.results[0][0].transcript; insertAtCursor(" " + transcript); };
      rec.onerror = (e: any) => { setIsListening(false); if (e.error === "not-allowed") alert("Mic permission blocked."); };
      rec.onend = () => setIsListening(false);
      rec.start();
    } catch (err: any) { alert("Voice error: " + err.message); setIsListening(false); }
  };

  const toggleSpeak = () => {
    if (isSpeaking) { speechSynthesis.cancel(); setIsSpeaking(false); return; }
    if (!text.trim()) return;
    const u = new SpeechSynthesisUtterance(text); u.lang = lang;
    u.onstart = () => setIsSpeaking(true); u.onend = () => setIsSpeaking(false); u.onerror = () => setIsSpeaking(false);
    speechSynthesis.speak(u);
  };

  const fixError = (err: ErrorItem) => { const nt = text.substring(0, err.offset) + err.replacement + text.substring(err.offset + err.length); if (editorRef.current) editorRef.current.innerText = nt; setHtml(editorRef.current?.innerHTML || ""); setText(nt); setErrors(p => p.filter(e => e !== err)); };
  const fixAll = () => { let nt = text; [...errors].sort((a, b) => b.offset - a.offset).forEach(err => { nt = nt.substring(0, err.offset) + err.replacement + nt.substring(err.offset + err.length); }); if (editorRef.current) editorRef.current.innerText = nt; setHtml(editorRef.current?.innerHTML || ""); setText(nt); setErrors([]); };

  const changeCase = (mode: string) => {
    if (!text || !mode) return;
    let out = text;
    if (mode === "upper") out = text.toUpperCase();
    else if (mode === "lower") out = text.toLowerCase();
    else if (mode === "title") out = text.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.substr(1).toLowerCase());
    else if (mode === "sentence") out = text.toLowerCase().replace(/(^\s*\w|[.!?]\s+\w)/g, c => c.toUpperCase());
    else if (mode === "capitalize") out = text.replace(/\b\w/g, c => c.toUpperCase());
    else if (mode === "toggle") out = text.split("").map(c => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()).join("");
    if (editorRef.current) editorRef.current.innerText = out;
    setHtml(editorRef.current?.innerHTML || "");
    setText(out);
  };

  const doReplace = () => {
    if (!findText) return;
    try {
      const flags = caseSensitive ? "g" : "gi";
      let pattern = findText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      if (wholeWord) pattern = `\\b${pattern}\\b`;
      const re = new RegExp(pattern, flags);
      const out = text.replace(re, replaceText);
      if (editorRef.current) editorRef.current.innerText = out;
      setHtml(editorRef.current?.innerHTML || "");
      setText(out);
      setToast("✓ Replaced all matches");
      setTimeout(() => setToast(null), 1800);
    } catch {
      const out = text.split(findText).join(replaceText);
      if (editorRef.current) editorRef.current.innerText = out;
      setText(out);
    }
  };

  // -------- SUGGESTED TOOLS --------
  const cleanExtraSpaces = () => { const t = text.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim(); if (editorRef.current) editorRef.current.innerHTML = escapeHtml(t).replace(/\n/g, "<br>"); setText(t); setHtml(editorRef.current?.innerHTML || ""); };
  const removeBlankLines = () => { const t = text.split(/\n/).filter(l => l.trim().length > 0).join("\n"); if (editorRef.current) editorRef.current.innerHTML = escapeHtml(t).replace(/\n/g, "<br>"); setText(t); setHtml(editorRef.current?.innerHTML || ""); };

  // ✅ FIXED: removeDupLines now reliably updates editor using innerHTML
  const removeDupLines = () => {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const rawLine of text.split(/\r?\n/)) {
      const k = rawLine.trim().toLowerCase();
      if (!k) { result.push(rawLine); continue; } // keep blank lines
      if (seen.has(k)) continue; // skip duplicates
      seen.add(k);
      result.push(rawLine);
    }
    const t = result.join("\n");
    if (editorRef.current) {
      editorRef.current.innerHTML = escapeHtml(t).replace(/\n/g, "<br>");
    }
    setText(t);
    setHtml(editorRef.current?.innerHTML || "");
    setToast("✓ Duplicate lines removed");
    setTimeout(() => setToast(null), 1500);
  };

  const removeDupSentences = () => { const seen = new Set<string>(); const t = text.split(/(?<=[.!?])\s+/).filter(s => { const k = s.trim().toLowerCase(); if (!k || seen.has(k)) return false; seen.add(k); return true; }).join(" "); if (editorRef.current) editorRef.current.innerHTML = escapeHtml(t).replace(/\n/g, "<br>"); setText(t); setHtml(editorRef.current?.innerHTML || ""); };
  const normalizePunctuation = () => { const t = text.replace(/\s+([,.!?;:])/g, "$1").replace(/([,.!?;:])(?=\S)/g, "$1 ").replace(/\s+/g, " ").trim(); if (editorRef.current) editorRef.current.innerHTML = escapeHtml(t).replace(/\n/g, "<br>"); setText(t); setHtml(editorRef.current?.innerHTML || ""); };
  const removeSpecialChars = () => { const t = text.replace(/[^\w\s.,!?'"\-()]/g, ""); if (editorRef.current) editorRef.current.innerHTML = escapeHtml(t).replace(/\n/g, "<br>"); setText(t); setHtml(editorRef.current?.innerHTML || ""); };
  const removeNumbers = () => { const t = text.replace(/\d+/g, ""); if (editorRef.current) editorRef.current.innerHTML = escapeHtml(t).replace(/\n/g, "<br>"); setText(t); setHtml(editorRef.current?.innerHTML || ""); };
  const removeHtmlTags = () => { const t = text.replace(/<[^>]*>/g, ""); if (editorRef.current) editorRef.current.innerHTML = escapeHtml(t).replace(/\n/g, "<br>"); setText(t); setHtml(editorRef.current?.innerHTML || ""); };
  const toSlug = () => { const t = text.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-"); setText(t); if (editorRef.current) editorRef.current.innerText = t; };
  const toCommaSeparated = () => { const t = text.split(/[\n,]+/).map(x => x.trim()).filter(Boolean).join(", "); setText(t); if (editorRef.current) editorRef.current.innerText = t; };
  const toLineSeparated = () => { const t = text.split(/[,\n]+/).map(x => x.trim()).filter(Boolean).join("\n"); setText(t); if (editorRef.current) editorRef.current.innerHTML = escapeHtml(t).replace(/\n/g, "<br>"); };
  const toPlainText = () => { const t = text.replace(/\s+/g, " ").trim(); setText(t); if (editorRef.current) editorRef.current.innerText = t; };
  const toJsonSafe = () => { const t = JSON.stringify(text).slice(1, -1); setText(t); if (editorRef.current) editorRef.current.innerText = t; };
  const sortAZ = () => { const t = text.split(/\n/).sort((a, b) => a.localeCompare(b)).join("\n"); setText(t); if (editorRef.current) editorRef.current.innerHTML = escapeHtml(t).replace(/\n/g, "<br>"); };
  const sortZA = () => { const t = text.split(/\n/).sort((a, b) => b.localeCompare(a)).join("\n"); setText(t); if (editorRef.current) editorRef.current.innerHTML = escapeHtml(t).replace(/\n/g, "<br>"); };
  const sortByLength = () => { const t = text.split(/\n/).sort((a, b) => a.length - b.length).join("\n"); setText(t); if (editorRef.current) editorRef.current.innerHTML = escapeHtml(t).replace(/\n/g, "<br>"); };
  const sortByWordCount = () => { const t = text.split(/\n/).sort((a, b) => a.split(/\s+/).length - b.split(/\s+/).length).join("\n"); setText(t); if (editorRef.current) editorRef.current.innerHTML = escapeHtml(t).replace(/\n/g, "<br>"); };
  const reverseChars = () => { const t = text.split("").reverse().join(""); setText(t); if (editorRef.current) editorRef.current.innerText = t; };
  const reverseWords = () => { const t = text.split(/\s+/).reverse().join(" "); setText(t); if (editorRef.current) editorRef.current.innerText = t; };
  const reverseLines = () => { const t = text.split(/\n/).reverse().join("\n"); setText(t); if (editorRef.current) editorRef.current.innerHTML = escapeHtml(t).replace(/\n/g, "<br>"); };
  const trimLeading = () => { const t = text.split(/\n/).map(l => l.replace(/^\s+/, "")).join("\n"); setText(t); if (editorRef.current) editorRef.current.innerHTML = escapeHtml(t).replace(/\n/g, "<br>"); };
  const trimTrailing = () => { const t = text.split(/\n/).map(l => l.replace(/\s+$/, "")).join("\n"); setText(t); if (editorRef.current) editorRef.current.innerHTML = escapeHtml(t).replace(/\n/g, "<br>"); };
  const collapseSpaces = () => { const t = text.replace(/[ \t]+/g, " "); setText(t); if (editorRef.current) editorRef.current.innerText = t; };
  const tabsToSpaces = () => { const t = text.replace(/\t/g, "    "); setText(t); if (editorRef.current) editorRef.current.innerText = t; };

  // -------- QUALITY --------
  const quality = useMemo(() => {
    const trimmed = text.trim();
    const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
    const longSentences = sentences.filter(s => s.split(/\s+/).length > 25).length;
    const paragraphs = text.split(/\n+/).map(p => p.trim()).filter(p => p.length > 0);
    const veryLongParas = paragraphs.filter(p => p.split(/\s+/).length > 150).length;
    const fillerCount = FILLER_WORDS.reduce((acc, fw) => acc + ((text.match(new RegExp(`\\b${fw}\\b`, "gi")) || []).length), 0);
    const weakCount = WEAK_PHRASES.reduce((acc, wp) => acc + ((text.match(new RegExp(wp.replace(/\s+/g, "\\s+"), "gi")) || []).length), 0);
    const excessivePunct = (text.match(/[!?]{2,}/g) || []).length + (text.match(/\.{4,}/g) || []).length;
    const multipleSpaces = (text.match(/ {2,}/g) || []).length;
    const allCapsWords = (trimmed.match(/\b[A-Z]{3,}\b/g) || []).length;
    return { longSentences, veryLongParas, fillerCount, weakCount, excessivePunct, multipleSpaces, allCapsWords, dupWordCount: duplicates.words.length, dupSentenceCount: duplicates.sentences.length };
  }, [text, duplicates]);

  const getGrammar = useCallback(async () => {
    if (!text.trim() || text.length < 5) return;
    if (grammarAbortRef.current) grammarAbortRef.current.abort();
    const ctrl = new AbortController(); grammarAbortRef.current = ctrl;
    setChecking(true);
    try {
      const res = await fetch("https://api.languagetool.org/v2/check", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `text=${encodeURIComponent(text)}&language=${lang}&level=picky`,
        signal: ctrl.signal,
      });
      const data = await res.json();
      const errs: ErrorItem[] = (data.matches || []).slice(0, 15).map((m: any) => ({ message: m.message, offset: m.offset, length: m.length, replacement: m.replacements?.[0]?.value || "" }));
      setErrors(errs);
    } catch {} finally { setChecking(false); }
  }, [text, lang]);

  useEffect(() => {
    if (text.length < 15) return;
    const t = setTimeout(() => { getGrammar(); }, 1500);
    return () => clearTimeout(t);
  }, [text, lang, getGrammar]);

  const highlightedHtml = useMemo(() => {
    if (!showHighlight || errors.length === 0) return "";
    let out = escapeHtml(text);
    [...errors].sort((a, b) => b.offset - a.offset).forEach(err => {
      const before = out.substring(0, err.offset);
      const mid = out.substring(err.offset, err.offset + err.length);
      const after = out.substring(err.offset + err.length);
      out = `${before}<span style="text-decoration:underline wavy red 2.5px;text-underline-offset:4px;background:rgba(255,0,0,0.08)" title="${escapeHtml(err.message)} → ${escapeHtml(err.replacement)}">${mid}</span>${after}`;
    });
    return out.replace(/\n/g, "<br>");
  }, [text, errors, showHighlight]);

  // -------- KEYBOARD SHORTCUTS --------
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;
      const inEditor = editorRef.current && document.activeElement === editorRef.current;
      if (ctrl && e.key.toLowerCase() === "s") { e.preventDefault(); safeSet("lorem_word_html", html); safeSet("lorem_word_text", text); setSaveStatus("saved"); setTimeout(() => setSaveStatus("idle"), 1000); return; }
      if (ctrl && e.key.toLowerCase() === "f") { e.preventDefault(); setShowFind(v => !v); return; }
      if (!inEditor) return;
      if (ctrl && !shift && e.key.toLowerCase() === "b") { e.preventDefault(); exec("bold"); return; }
      if (ctrl && !shift && e.key.toLowerCase() === "i") { e.preventDefault(); exec("italic"); return; }
      if (ctrl && !shift && e.key.toLowerCase() === "u") { e.preventDefault(); exec("underline"); return; }
      if (ctrl && shift && e.key.toLowerCase() === "s") { e.preventDefault(); exec("strikeThrough"); return; }
      if (ctrl && e.key.toLowerCase() === "k") { e.preventDefault(); insertLink(); return; }
      if (ctrl && !shift && e.key.toLowerCase() === "z") { e.preventDefault(); exec("undo"); return; }
      if (ctrl && shift && e.key.toLowerCase() === "z") { e.preventDefault(); exec("redo"); return; }
      if (ctrl && e.key.toLowerCase() === "y") { e.preventDefault(); exec("redo"); return; }
      if (ctrl && shift && e.key === "7") { e.preventDefault(); exec("insertOrderedList"); return; }
      if (ctrl && shift && e.key === "8") { e.preventDefault(); exec("insertUnorderedList"); return; }
      if (e.key === "Tab" && suggestions.length > 0) { e.preventDefault(); insertSuggestion(suggestions[0]); return; }
      if (e.key === "Escape") { setSuggestions([]); setShowShareMenu(false); setShowColorPicker(false); setShowBgPicker(false); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [html, text, suggestions, exec]);

  const loadSample = () => { const s = `<p>${SAMPLE}</p>`; if (editorRef.current) editorRef.current.innerHTML = s; setHtml(s); setText(SAMPLE); };
  const currentFont = FONTS.find(f => f.name === font) || FONTS[0];
  const page = PAGE_SIZES[pageSize] || PAGE_SIZES.A4;
  const activeSocialData = SOCIAL_PLATFORMS.find(s => s.name === activeSocial) || SOCIAL_PLATFORMS[0];
  const socialStats = useMemo(() => {
    const t = socialText;
    const chars = t.length;
    const words = t.trim() ? t.trim().split(/\s+/).filter(Boolean).length : 0;
    const remaining = activeSocialData.limit - chars;
    const progressPct = Math.min(100, Math.round((chars / activeSocialData.limit) * 100));
    const recommendedPct = Math.min(100, Math.round((chars / activeSocialData.recommended) * 100));
    return { chars, words, remaining, progressPct, recommendedPct };
  }, [socialText, activeSocialData]);

  const bgDecor = (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full opacity-40 blur-3xl animate-pulse" style={{ background: "radial-gradient(circle, #a855f7, transparent 70%)" }} />
      <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] rounded-full opacity-30 blur-3xl animate-pulse" style={{ background: "radial-gradient(circle, #ec4899, transparent 70%)", animationDelay: "1s" }} />
      <div className="absolute -bottom-40 left-1/3 w-[500px] h-[500px] rounded-full opacity-30 blur-3xl animate-pulse" style={{ background: "radial-gradient(circle, #06b6d4, transparent 70%)", animationDelay: "2s" }} />
    </div>
  );

  if (isFocus) {
    return (
      <div className={`min-h-screen relative ${isDark ? "bg-[#0a0a1a] text-white" : "bg-gradient-to-br from-violet-50 via-pink-50 to-cyan-50 text-black"} p-4 sm:p-8`}>
        {bgDecor}
        <div className="max-w-3xl mx-auto relative">
          <div className="flex justify-between mb-6 flex-wrap gap-2">
            <button onClick={() => setIsFocus(false)} className="px-4 py-2 glass-btn rounded-xl text-sm font-bold btn-shine">← Exit Focus</button>
            <span className="text-sm opacity-60">{stats.words} words • {formatTime(writingTime)} • {autoLang}</span>
          </div>
          <div className="glass rounded-3xl p-6">
            <div ref={editorRef} contentEditable suppressContentEditableWarning onInput={handleInput}
              onMouseUp={saveSelection} onKeyUp={saveSelection} onBlur={saveSelection}
              className="w-full min-h-[75vh] outline-none"
              style={{ fontFamily: currentFont.css, fontSize: `${fontSize}px`, lineHeight, color: isDark ? "#fff" : color }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isDark ? "bg-[#0a0a1a] text-white" : "bg-gradient-to-br from-violet-50 via-pink-50 to-cyan-50 text-gray-900"} min-h-screen relative`}>
      {bgDecor}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=Poppins:wght@400;700;900&family=Roboto:wght@400;700&family=Merriweather:wght@400;700&family=Playfair+Display:wght@400;700&family=Lora:wght@400;700&family=JetBrains+Mono:wght@400;700&family=Fira+Code:wght@400;700&family=Roboto+Mono:wght@400;700&display=swap');
        .glass{backdrop-filter:blur(20px) saturate(180%);background:${isDark ? "rgba(20,20,40,0.5)" : "rgba(255,255,255,0.5)"};border:1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.7)"};box-shadow:0 8px 32px rgba(0,0,0,0.08)}
        .glass-btn{backdrop-filter:blur(12px);background:${isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.65)"};border:1px solid ${isDark ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.9)"};transition:all 0.25s cubic-bezier(0.4,0,0.2,1);position:relative;overflow:hidden}
        .glass-btn:hover{transform:translateY(-2px) scale(1.02);box-shadow:0 12px 24px rgba(139,92,246,0.25);background:${isDark ? "rgba(168,85,247,0.18)" : "rgba(255,255,255,0.85)"}}
        .glass-btn:active{transform:translateY(0) scale(0.98)}
        .glass-btn.active-fmt{background:linear-gradient(135deg,#a855f7,#ec4899) !important;color:#fff !important;border-color:transparent !important;box-shadow:0 8px 20px rgba(168,85,247,0.4)}
        .fmt-btn{padding:0;min-width:34px;height:34px;display:inline-flex;align-items:center;justify-content:center;font-weight:700;border-radius:10px;font-size:13px;position:relative}
        [contenteditable]:focus{outline:none}
        [contenteditable] a{color:#7c3aed;text-decoration:underline}
        [contenteditable] blockquote{border-left:4px solid #a855f7;padding-left:12px;margin:8px 0;opacity:0.9}
        [contenteditable] pre{background:rgba(124,58,237,0.08);padding:10px;border-radius:8px;font-family:'JetBrains Mono',monospace;font-size:0.9em;white-space:pre-wrap}
        [contenteditable] code{background:rgba(124,58,237,0.1);padding:1px 5px;border-radius:4px;font-family:'JetBrains Mono',monospace;font-size:0.9em}
        [contenteditable] hr{border:none;border-top:2px solid rgba(168,85,247,0.3);margin:12px 0}
        [contenteditable] ul,[contenteditable] ol{padding-left:22px;margin:4px 0}
        [contenteditable] h1{font-size:2em;font-weight:900;margin:12px 0 8px}
        [contenteditable] h2{font-size:1.6em;font-weight:800;margin:10px 0 6px}
        [contenteditable] h3{font-size:1.35em;font-weight:700;margin:8px 0 5px}
        [contenteditable] h4{font-size:1.15em;font-weight:700;margin:6px 0 4px}
        [contenteditable] h5{font-size:1em;font-weight:700;margin:4px 0 3px}
        [contenteditable] h6{font-size:0.9em;font-weight:700;margin:4px 0 3px;opacity:0.85}
        @keyframes shimmer{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
        @keyframes popIn{0%{transform:scale(0.4);opacity:0}60%{transform:scale(1.15)}100%{transform:scale(1);opacity:1}}
        @keyframes slideDown{from{opacity:0;max-height:0;transform:translateY(-8px)}to{opacity:1;max-height:1200px;transform:translateY(0)}}
        @keyframes confettiFall{0%{transform:translateY(-20px) rotate(0deg);opacity:1}100%{transform:translateY(100vh) rotate(720deg);opacity:0}}
        @keyframes glowPulse{0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,0.4)}50%{box-shadow:0 0 0 12px rgba(34,197,94,0)}}
        @keyframes dropIn{0%{transform:translateY(-10px) scale(0.95);opacity:0}100%{transform:translateY(0) scale(1);opacity:1}}
        @keyframes barShine{0%{background-position:-200% 0}100%{background-position:200% 0}}
        .gradient-text{background:linear-gradient(90deg,#a855f7,#ec4899,#06b6d4);background-size:200% auto;animation:shimmer 4s linear infinite;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
        .anim-pop{animation:popIn 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards}
        .anim-slide{animation:slideDown 0.35s ease-out forwards;overflow:hidden}
        .anim-drop{animation:dropIn 0.2s ease-out forwards}
        .btn-shine::before{content:'';position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent);transition:left 0.5s;pointer-events:none}
        .btn-shine:hover::before{left:100%}
        .progress-bar{background-size:200% 100%;animation:barShine 2s linear infinite}
        .celebrate{animation:glowPulse 1.5s ease-in-out infinite}
        .tooltip-parent{position:relative}
        .tooltip-parent:hover .tooltip-box{opacity:1;visibility:visible;transform:translateX(-50%) translateY(-6px)}
        .tooltip-box{opacity:0;visibility:hidden;position:absolute;bottom:100%;left:50%;transform:translateX(-50%) translateY(0);background:rgba(17,24,39,0.95);color:#fff;padding:5px 9px;border-radius:8px;font-size:10px;white-space:nowrap;z-index:200;transition:all 0.2s;pointer-events:none}
        .confetti-piece{position:fixed;width:10px;height:10px;top:-20px;animation:confettiFall 3s linear forwards;z-index:100;pointer-events:none}
        .accordion-content{overflow:hidden;transition:max-height 0.4s cubic-bezier(0.4,0,0.2,1),padding 0.3s;max-height:0}
        .accordion-content.open{max-height:8000px}
        .tab-btn{transition:all 0.25s}
        .tab-btn.active{background:linear-gradient(135deg,#a855f7,#ec4899) !important;color:#fff !important;box-shadow:0 8px 20px rgba(168,85,247,0.35);border-color:transparent !important}
        .hide-when-active{transition:all 0.3s}
        .tooltip-arrow::after{content:'';position:absolute;top:100%;left:50%;transform:translateX(-50%);border:4px solid transparent;border-top-color:rgba(17,24,39,0.95)}
        @media (max-width:640px){.hide-mobile{display:none}}
      `}</style>

      {toast && (<div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-2xl shadow-2xl font-bold anim-pop max-w-[90vw] text-center">{toast}</div>)}

      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-40">
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={i} className="confetti-piece" style={{
              left: `${Math.random() * 100}%`,
              background: ["#a855f7","#ec4899","#06b6d4","#f59e0b","#10b981","#ef4444"][i % 6],
              animationDelay: `${Math.random() * 0.6}s`,
              animationDuration: `${2 + Math.random() * 1.5}s`,
              borderRadius: Math.random() > 0.5 ? "50%" : "2px",
            }} />
          ))}
        </div>
      )}

      <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-8 relative">
        {/* HEADER */}
        <div className="text-center mb-6">
          <div className="inline-flex px-4 py-1.5 rounded-full glass-btn text-[11px] tracking-widest mb-3 font-bold">✨ v10.1 · FIXED BOLD/ITALIC · FIXED DUPLICATE CLEANER · DEEP ARTICLE</div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black gradient-text">Word Counter Pro</h1>
          <p className="mt-2 opacity-70 text-xs sm:text-sm">Rich text editor, 40+ tools, grammar check, social share, AI insights</p>
          <div className="flex justify-center gap-2 mt-4 flex-wrap items-center">
            <select value={lang} onChange={e => setLang(e.target.value)} className="h-9 rounded-xl glass-btn px-3 text-xs sm:text-sm font-bold">{LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.flag} {l.label}</option>)}</select>
            <span className="text-[10px] sm:text-xs px-3 py-1.5 rounded-full bg-gradient-to-r from-violet-600 to-pink-600 text-white font-bold">{autoLang}</span>
            <span className="text-xs sm:text-sm opacity-70">{stats.words}/{goal} • {progress}%</span>
            <span className={`text-[10px] sm:text-xs px-2 py-1.5 rounded-full ${saveStatus === "saved" ? "bg-green-500/20 text-green-700 dark:text-green-300" : "glass-btn"}`}>{saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "Saved ✓" : "Auto-save"}</span>
            <span className={`text-[10px] sm:text-xs px-2 py-1.5 rounded-full ${isActive ? "bg-blue-500/20 text-blue-700 dark:text-blue-300" : "glass-btn"}`}>⏱ {formatTime(writingTime)}</span>
          </div>
          <div className="flex justify-center items-center gap-3 mt-3">
            <div className={`max-w-md w-full h-2.5 bg-white/40 dark:bg-white/10 rounded-full overflow-hidden ${goalReached ? "celebrate" : ""}`}>
              <div style={{ width: `${progress}%` }} className={`h-full transition-all duration-700 ease-out progress-bar ${progress >= 100 ? "bg-gradient-to-r from-green-400 to-emerald-500" : "bg-gradient-to-r from-violet-500 via-pink-500 to-cyan-500"}`} />
            </div>
            <span className="text-xs font-bold">{stats.words}/{goal}</span>
            <input type="number" min={1} value={goal} onChange={e => setGoal(Math.max(1, parseInt(e.target.value) || 1))} className="w-20 h-7 text-xs px-2 rounded-lg glass-btn" />
          </div>
        </div>

        {/* ✅ FIXED TOOLBAR ROW 1 — onMouseDown prevents focus loss */}
        <div
          className="glass rounded-2xl p-2 sm:p-3 mb-2 flex flex-wrap gap-1.5 items-center justify-between sticky top-2 z-30"
          onMouseDown={(e) => {
            const t = e.target as HTMLElement;
            if (!t.closest('select, input, textarea')) e.preventDefault();
          }}
        >
          <div className="flex gap-1 flex-wrap items-center">
            <div className="tooltip-parent"><button onClick={handleCut} className="h-9 px-3 rounded-lg glass-btn text-xs font-bold btn-shine">✂ Cut</button><span className="tooltip-box">Cut selected</span></div>
            <div className="tooltip-parent"><button onClick={handleCopy} className={`h-9 px-3 rounded-lg glass-btn text-xs font-bold btn-shine ${copied ? "bg-green-500 text-white" : ""}`}>{copied ? "✓ Copied!" : "📋 Copy"}</button><span className="tooltip-box">Copy</span></div>
            <div className="tooltip-parent"><button onClick={handlePaste} className="h-9 px-3 rounded-lg glass-btn text-xs font-bold btn-shine">📥 Paste</button><span className="tooltip-box">Paste</span></div>
            <div className="tooltip-parent hidden sm:block"><button onClick={handleBackspace} className="h-9 px-3 rounded-lg glass-btn text-xs font-bold btn-shine">⌫</button><span className="tooltip-box">Backspace</span></div>
            <div className="tooltip-parent hidden sm:block"><button onClick={handleDeleteKey} className="h-9 px-3 rounded-lg bg-red-500/20 text-red-700 dark:text-red-300 text-xs font-bold border border-red-300/40 btn-shine">⌦</button><span className="tooltip-box">Delete forward</span></div>
            <button onClick={() => setShowFormatBar(v => !v)} className={`h-9 px-3 rounded-lg text-xs font-bold btn-shine transition-all ${showFormatBar ? "glass-btn" : "bg-gradient-to-r from-violet-600 to-pink-600 text-white"}`}>
              {showFormatBar ? "▲ Hide Format Bar" : "▼ Show Format Bar"}
            </button>
            <button onClick={handleClear} className="h-9 px-3 rounded-lg bg-red-500/20 text-red-700 dark:text-red-300 text-xs font-bold border border-red-300/40 btn-shine">🗑 Clear</button>
          </div>
          <div className="flex gap-1.5 flex-wrap items-center">
            <div className="relative" ref={shareMenuRef}>
              <button onClick={() => setShowShareMenu(v => !v)} className={`h-9 px-3 rounded-xl text-xs font-bold btn-shine transition-all ${showShareMenu ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white" : "glass-btn"}`}>
                🔗 Share ▾
              </button>
              {showShareMenu && (
                <div className="absolute top-full mt-1 right-0 glass rounded-xl shadow-2xl overflow-hidden z-50 min-w-[200px] anim-drop">
                  <button onClick={shareViaTwitter} className="w-full text-left px-4 py-2 text-xs hover:bg-violet-500/20 transition-colors flex items-center gap-2">🐦 <span>Twitter / X</span></button>
                  <button onClick={shareViaFacebook} className="w-full text-left px-4 py-2 text-xs hover:bg-violet-500/20 transition-colors flex items-center gap-2">👥 <span>Facebook</span></button>
                  <button onClick={shareViaWhatsApp} className="w-full text-left px-4 py-2 text-xs hover:bg-violet-500/20 transition-colors flex items-center gap-2">💬 <span>WhatsApp</span></button>
                  <button onClick={shareViaLinkedIn} className="w-full text-left px-4 py-2 text-xs hover:bg-violet-500/20 transition-colors flex items-center gap-2">💼 <span>LinkedIn</span></button>
                  <button onClick={shareViaTelegram} className="w-full text-left px-4 py-2 text-xs hover:bg-violet-500/20 transition-colors flex items-center gap-2">✈️ <span>Telegram</span></button>
                  <button onClick={shareViaEmail} className="w-full text-left px-4 py-2 text-xs hover:bg-violet-500/20 transition-colors flex items-center gap-2">✉️ <span>Email</span></button>
                  <button onClick={copyForShare} className="w-full text-left px-4 py-2 text-xs hover:bg-violet-500/20 transition-colors flex items-center gap-2">📋 <span>Copy Text</span></button>
                  <button onClick={nativeShare} className="w-full text-left px-4 py-2 text-xs hover:bg-violet-500/20 transition-colors flex items-center gap-2 border-t border-white/20">📱 <span>Native Share...</span></button>
                </div>
              )}
            </div>
            <button onClick={() => setShowFind(v => !v)} className="h-9 px-3 rounded-xl glass-btn text-xs font-bold btn-shine">🔍 Find</button>
            <button onClick={() => setShowSettings(v => !v)} className="h-9 px-3 rounded-xl glass-btn text-xs font-bold btn-shine">⚙ Settings</button>
            <button onClick={toggleVoice} type="button" className={`h-10 px-4 sm:px-5 rounded-xl text-xs font-black border-2 shadow cursor-pointer transition btn-shine ${isListening ? "bg-red-500 text-white border-red-500 animate-pulse" : "bg-gradient-to-r from-violet-600 to-pink-600 text-white border-transparent hover:shadow-lg"}`}>{isListening ? "■ STOP" : "🎤 VOICE"}</button>
            <button onClick={toggleSpeak} className={`h-9 px-3 rounded-xl text-xs font-bold border btn-shine ${isSpeaking ? "bg-red-500 text-white border-red-500" : "glass-btn"}`}>{isSpeaking ? "■" : "🔊"}</button>
            <button onClick={() => setIsFocus(true)} className="h-9 px-3 rounded-xl bg-black/80 text-white text-xs font-bold btn-shine">⛶</button>
            <button onClick={() => setIsDark(!isDark)} className="h-9 px-3 rounded-xl glass-btn text-xs font-bold btn-shine">{isDark ? "☀" : "🌙"}</button>
          </div>
        </div>

        {/* ✅ FIXED TOOLBAR ROW 2 — onMouseDown prevents focus loss → B/I/U now work */}
        {showFormatBar && (
          <div
            className="glass rounded-2xl p-2 mb-3 flex flex-wrap gap-1 items-center sticky top-16 z-20 anim-slide"
            onMouseDown={(e) => {
              const t = e.target as HTMLElement;
              if (!t.closest('select, input, textarea')) e.preventDefault();
            }}
          >
            <div className="tooltip-parent"><button onClick={() => exec("bold")} className={`fmt-btn glass-btn ${activeFormats.bold ? "active-fmt" : ""}`}><b>B</b></button><span className="tooltip-box">Bold (Ctrl+B)</span></div>
            <div className="tooltip-parent"><button onClick={() => exec("italic")} className={`fmt-btn glass-btn ${activeFormats.italic ? "active-fmt" : ""}`}><i>I</i></button><span className="tooltip-box">Italic (Ctrl+I)</span></div>
            <div className="tooltip-parent"><button onClick={() => exec("underline")} className={`fmt-btn glass-btn ${activeFormats.underline ? "active-fmt" : ""}`}><u>U</u></button><span className="tooltip-box">Underline (Ctrl+U)</span></div>
            <div className="tooltip-parent"><button onClick={() => exec("strikeThrough")} className={`fmt-btn glass-btn ${activeFormats.strikeThrough ? "active-fmt" : ""}`}><s>S</s></button><span className="tooltip-box">Strikethrough</span></div>
            <div className="tooltip-parent"><button onClick={() => exec("superscript")} className={`fmt-btn glass-btn ${activeFormats.superscript ? "active-fmt" : ""}`}>X²</button><span className="tooltip-box">Superscript</span></div>
            <div className="tooltip-parent"><button onClick={() => exec("subscript")} className={`fmt-btn glass-btn ${activeFormats.subscript ? "active-fmt" : ""}`}>X₂</button><span className="tooltip-box">Subscript</span></div>

            <div className="w-px h-6 bg-white/30 mx-1" />

            <select onChange={e => { if (e.target.value) formatHeading(e.target.value); e.target.value = ""; }} className="h-9 rounded-lg glass-btn px-2 text-xs font-bold" title="Heading level">
              <option value="">Heading ▾</option>
              {HEADING_LEVELS.map(h => <option key={h.tag} value={h.tag}>{h.label} — {h.size}</option>)}
              <option value="p">Paragraph</option>
            </select>

            <div className="relative tooltip-parent" ref={colorMenuRef}>
              <button onClick={() => { saveSelection(); setShowColorPicker(v => !v); setShowBgPicker(false); }} className={`h-9 px-2.5 rounded-lg text-xs font-bold glass-btn btn-shine transition-all ${showColorPicker ? "active-fmt" : ""}`}>
                <span className="flex items-center gap-1">
                  <span className="font-black" style={{ color }}>A</span>
                  <span className="inline-block w-3 h-3 rounded border" style={{ background: color }} />
                  ▾
                </span>
              </button>
              <span className="tooltip-box">Text color (selection only)</span>
              {showColorPicker && (
                <div className="absolute top-full mt-1 left-0 glass rounded-xl shadow-2xl p-3 z-50 anim-drop min-w-[220px]">
                  <div className="text-[10px] uppercase opacity-60 font-bold mb-2">Text Color</div>
                  <input type="color" value={color} onChange={e => applyColorToSelection(e.target.value, false)} className="w-full h-8 rounded-lg cursor-pointer mb-2" />
                  <div className="grid grid-cols-5 gap-1.5">
                    {COLOR_PALETTE.map(c => (
                      <button key={c} onMouseDown={e => e.preventDefault()} onClick={() => applyColorToSelection(c, false)} className="w-7 h-7 rounded-lg border border-white/60 hover:scale-110 transition-transform" style={{ background: c }} title={c} />
                    ))}
                  </div>
                  <div className="text-[9px] opacity-50 mt-2">Select text first, then pick color</div>
                </div>
              )}
            </div>

            <div className="relative tooltip-parent" ref={bgMenuRef}>
              <button onClick={() => { saveSelection(); setShowBgPicker(v => !v); setShowColorPicker(false); }} className={`h-9 px-2.5 rounded-lg text-xs font-bold glass-btn btn-shine transition-all ${showBgPicker ? "active-fmt" : ""}`}>
                <span className="flex items-center gap-1">
                  <span className="px-1 rounded" style={{ background: highlight }}>H</span>
                  <span className="inline-block w-3 h-3 rounded border" style={{ background: highlight }} />
                  ▾
                </span>
              </button>
              <span className="tooltip-box">Background highlight (selection only)</span>
              {showBgPicker && (
                <div className="absolute top-full mt-1 left-0 glass rounded-xl shadow-2xl p-3 z-50 anim-drop min-w-[220px]">
                  <div className="text-[10px] uppercase opacity-60 font-bold mb-2">Background Color</div>
                  <input type="color" value={highlight} onChange={e => applyColorToSelection(e.target.value, true)} className="w-full h-8 rounded-lg cursor-pointer mb-2" />
                  <div className="grid grid-cols-4 gap-1.5">
                    {HIGHLIGHT_PALETTE.map(c => (
                      <button key={c} onMouseDown={e => e.preventDefault()} onClick={() => applyColorToSelection(c, true)} className="w-7 h-7 rounded-lg border border-white/60 hover:scale-110 transition-transform" style={{ background: c }} title={c} />
                    ))}
                  </div>
                  <button onClick={() => { restoreSelection(); exec("hiliteColor", "transparent"); }} className="w-full mt-2 text-[10px] py-1 rounded-lg glass-btn font-bold">Remove Highlight</button>
                  <div className="text-[9px] opacity-50 mt-2">Select text first, then pick background</div>
                </div>
              )}
            </div>

            <div className="tooltip-parent">
              <select onChange={e => { applyFontToSelection(e.target.value); e.target.value = ""; }} className="h-9 rounded-lg glass-btn px-2 text-xs font-bold">
                <option value="">Font ▾</option>
                {FONTS.map(f => <option key={f.name} value={f.name}>{f.name}</option>)}
              </select>
              <span className="tooltip-box">Font family (selection only)</span>
            </div>

            <div className="w-px h-6 bg-white/30 mx-1" />

            <div className="tooltip-parent"><button onClick={() => exec("insertUnorderedList")} className={`fmt-btn glass-btn ${activeFormats.insertUnorderedList ? "active-fmt" : ""}`}>•</button><span className="tooltip-box">Bullet list</span></div>
            <div className="tooltip-parent"><button onClick={() => exec("insertOrderedList")} className={`fmt-btn glass-btn ${activeFormats.insertOrderedList ? "active-fmt" : ""}`}>1.</button><span className="tooltip-box">Numbered list</span></div>
            <div className="tooltip-parent"><button onClick={() => exec("outdent")} className="fmt-btn glass-btn">⇤</button><span className="tooltip-box">Outdent</span></div>
            <div className="tooltip-parent"><button onClick={() => exec("indent")} className="fmt-btn glass-btn">⇥</button><span className="tooltip-box">Indent</span></div>

            <div className="w-px h-6 bg-white/30 mx-1" />

            <div className="tooltip-parent"><button onClick={() => exec("justifyLeft")} className={`fmt-btn glass-btn ${activeFormats.justifyLeft ? "active-fmt" : ""}`}>⬅</button><span className="tooltip-box">Left</span></div>
            <div className="tooltip-parent"><button onClick={() => exec("justifyCenter")} className={`fmt-btn glass-btn ${activeFormats.justifyCenter ? "active-fmt" : ""}`}>↔</button><span className="tooltip-box">Center</span></div>
            <div className="tooltip-parent"><button onClick={() => exec("justifyRight")} className={`fmt-btn glass-btn ${activeFormats.justifyRight ? "active-fmt" : ""}`}>➡</button><span className="tooltip-box">Right</span></div>
            <div className="tooltip-parent"><button onClick={() => exec("justifyFull")} className={`fmt-btn glass-btn ${activeFormats.justifyFull ? "active-fmt" : ""}`}>≡</button><span className="tooltip-box">Justify</span></div>

            <div className="w-px h-6 bg-white/30 mx-1" />

            <div className="tooltip-parent"><button onClick={insertLink} className="h-9 px-2.5 rounded-lg glass-btn text-xs font-bold btn-shine">🔗</button><span className="tooltip-box">Insert Link (Ctrl+K)</span></div>
            <div className="tooltip-parent"><button onClick={insertHR} className="h-9 px-2.5 rounded-lg glass-btn text-xs font-bold btn-shine">―</button><span className="tooltip-box">Horizontal Rule</span></div>
            <div className="tooltip-parent"><button onClick={insertVR} className="h-9 px-2.5 rounded-lg glass-btn text-xs font-bold btn-shine">│</button><span className="tooltip-box">Vertical Rule</span></div>
            <div className="tooltip-parent"><button onClick={insertCode} className="h-9 px-2.5 rounded-lg glass-btn text-xs font-bold btn-shine">{"</>"}</button><span className="tooltip-box">Code Block</span></div>
            <div className="tooltip-parent"><button onClick={insertQuote} className="h-9 px-2.5 rounded-lg glass-btn text-xs font-bold btn-shine">❝</button><span className="tooltip-box">Blockquote</span></div>

            <div className="w-px h-6 bg-white/30 mx-1" />

            <div className="tooltip-parent"><button onClick={() => exec("removeFormat")} className="h-9 px-2.5 rounded-lg glass-btn text-xs font-bold btn-shine">Tx</button><span className="tooltip-box">Clear formatting</span></div>
            <div className="tooltip-parent"><button onClick={() => exec("undo")} className="h-9 px-2.5 rounded-lg glass-btn text-xs font-bold btn-shine">↶</button><span className="tooltip-box">Undo</span></div>
            <div className="tooltip-parent"><button onClick={() => exec("redo")} className="h-9 px-2.5 rounded-lg glass-btn text-xs font-bold btn-shine">↷</button><span className="tooltip-box">Redo</span></div>

            <div className="w-px h-6 bg-white/30 mx-1" />

            <select onChange={e => { changeCase(e.target.value); e.target.value = ""; }} className="h-9 rounded-lg glass-btn px-2 text-xs font-bold">
              <option value="">Aa Case ▾</option>
              <option value="upper">UPPER</option>
              <option value="lower">lower</option>
              <option value="title">Title Case</option>
              <option value="sentence">Sentence case</option>
              <option value="capitalize">Capitalize Each Word</option>
              <option value="toggle">Toggle Case</option>
            </select>
          </div>
        )}

        {/* SETTINGS PANEL */}
        {showSettings && (
          <div className="glass rounded-2xl p-4 mb-3 grid md:grid-cols-4 gap-3 anim-slide">
            <div>
              <label className="text-[10px] uppercase opacity-60 font-bold">Page Size</label>
              <select value={pageSize} onChange={e => setPageSize(e.target.value)} className="w-full h-9 rounded-lg glass-btn px-2 text-sm border mt-1">{Object.entries(PAGE_SIZES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select>
            </div>
            <div>
              <label className="text-[10px] uppercase opacity-60 font-bold">Editor Font</label>
              <select value={font} onChange={e => setFont(e.target.value)} className="w-full h-9 rounded-lg glass-btn px-2 text-sm border mt-1">{FONTS.map(f => <option key={f.name} value={f.name}>{f.name}{f.mono ? " (mono)" : ""}</option>)}</select>
            </div>
            <div>
              <label className="text-[10px] uppercase opacity-60 font-bold">Font Size: {fontSize}px</label>
              <input type="range" min={10} max={32} value={fontSize} onChange={e => setFontSize(parseInt(e.target.value))} className="w-full mt-2" />
            </div>
            <div>
              <label className="text-[10px] uppercase opacity-60 font-bold">Line Height: {lineHeight}</label>
              <input type="range" min={1} max={2.5} step={0.1} value={lineHeight} onChange={e => setLineHeight(parseFloat(e.target.value))} className="w-full mt-2" />
            </div>
            <div className="md:col-span-4 flex flex-wrap gap-4 pt-2 border-t border-white/30">
              <label className="flex items-center gap-2 text-xs cursor-pointer"><input type="checkbox" checked={autoCorrect} onChange={e => setAutoCorrect(e.target.checked)} /> Auto Correct</label>
              <label className="flex items-center gap-2 text-xs cursor-pointer"><input type="checkbox" checked={autoComplete} onChange={e => setAutoComplete(e.target.checked)} /> Auto Complete (Tab)</label>
              <label className="flex items-center gap-2 text-xs cursor-pointer"><input type="checkbox" checked={showHighlight} onChange={e => setShowHighlight(e.target.checked)} /> Show Red Wavy</label>
              <label className="flex items-center gap-2 text-xs cursor-pointer"><input type="checkbox" checked={duplicateHighlight} onChange={e => setDuplicateHighlight(e.target.checked)} /> Duplicate Highlight</label>
            </div>
            <div className="md:col-span-4 flex flex-wrap gap-4 pt-2 border-t border-white/30">
              <div>
                <label className="text-[10px] uppercase opacity-60 font-bold block mb-1">Reading Speed</label>
                <div className="flex gap-1">
                  {["slow","average","fast","custom"].map(s => (
                    <button key={s} onClick={() => setReadingSpeed(s as any)} className={`text-xs px-3 py-1.5 rounded-lg ${readingSpeed === s ? "bg-gradient-to-r from-violet-600 to-pink-600 text-white" : "glass-btn"} font-bold capitalize`}>{s}</button>
                  ))}
                </div>
              </div>
              {readingSpeed === "custom" && (<div><label className="text-[10px] uppercase opacity-60 font-bold block mb-1">Custom WPM</label><input type="number" min={50} max={1000} value={customReadingWPM} onChange={e => setCustomReadingWPM(Math.max(50, parseInt(e.target.value) || 200))} className="w-24 h-8 text-xs px-2 rounded-lg glass-btn" /></div>)}
              <div><label className="text-[10px] uppercase opacity-60 font-bold block mb-1">Speaking WPM</label><input type="number" min={50} max={300} value={speakingWPM} onChange={e => setSpeakingWPM(Math.max(50, parseInt(e.target.value) || 130))} className="w-24 h-8 text-xs px-2 rounded-lg glass-btn" /></div>
              <span className="text-xs opacity-60 ml-auto">Reading: {effectiveReadingWPM} wpm • Speaking: {speakingWPM} wpm</span>
            </div>
          </div>
        )}

        {/* FIND & REPLACE */}
        {showFind && (
          <div className="glass rounded-2xl p-3 mb-3 flex gap-2 items-center flex-wrap anim-slide">
            <input value={findText} onChange={e => setFindText(e.target.value)} placeholder="Find..." className="h-9 px-3 rounded-lg glass-btn text-sm flex-1 min-w-[140px]" />
            <input value={replaceText} onChange={e => setReplaceText(e.target.value)} placeholder="Replace with..." className="h-9 px-3 rounded-lg glass-btn text-sm flex-1 min-w-[140px]" />
            <label className="flex items-center gap-1 text-xs cursor-pointer"><input type="checkbox" checked={caseSensitive} onChange={e => setCaseSensitive(e.target.checked)} /> Aa</label>
            <label className="flex items-center gap-1 text-xs cursor-pointer"><input type="checkbox" checked={wholeWord} onChange={e => setWholeWord(e.target.checked)} /> Whole</label>
            <button onClick={doReplace} disabled={!findText} className="h-9 px-4 rounded-lg bg-gradient-to-r from-violet-600 to-pink-600 text-white text-sm font-bold disabled:opacity-40 btn-shine">Replace All</button>
            <button onClick={() => setShowFind(false)} className="h-9 px-3 rounded-lg glass-btn text-sm">✕</button>
          </div>
        )}

        {/* ACTION BAR */}
        <div className="flex gap-2 mb-4 justify-between flex-wrap">
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => { getGrammar(); setShowHighlight(true); }} className="text-xs px-3 py-1.5 rounded-full bg-gradient-to-r from-violet-600 to-pink-600 text-white font-bold btn-shine">{checking ? "Checking..." : "✓ Grammar Check"}</button>
            {errors.length > 0 && (<button onClick={fixAll} className="text-xs px-3 py-1.5 rounded-full bg-green-500 text-white font-bold btn-shine">⚡ Fix All ({errors.length})</button>)}
            <button onClick={handleCopyStats} className="text-xs px-3 py-1.5 rounded-full glass-btn font-bold btn-shine">{copiedStats ? "✓ Copied!" : "⎙ Copy Stats"}</button>
            <button onClick={loadSample} className="text-xs px-3 py-1.5 rounded-full glass-btn font-bold btn-shine">📄 Sample</button>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={exportTxt} className="text-xs px-3 py-1.5 rounded-full glass-btn font-bold btn-shine">TXT</button>
            <button onClick={exportHtmlFile} className="text-xs px-3 py-1.5 rounded-full glass-btn font-bold btn-shine">HTML</button>
            <button onClick={exportDoc} className="text-xs px-3 py-1.5 rounded-full glass-btn font-bold btn-shine">DOC</button>
            <button onClick={exportCsv} className="text-xs px-3 py-1.5 rounded-full glass-btn font-bold btn-shine">CSV</button>
            <button onClick={exportPdf} className="text-xs px-3 py-1.5 rounded-full bg-black text-white font-bold btn-shine">PDF</button>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="glass rounded-3xl p-3 relative">
              <div className="px-3 py-1.5 text-[10px] opacity-60 flex justify-between flex-wrap gap-1">
                <span>📄 {page.label} • {fontSize}px • LH {lineHeight} • {currentFont.name}</span>
                <span>{currentFont.mono ? "🔤 Mono" : "🔡 Prop"}</span>
              </div>
              <div ref={editorRef} contentEditable suppressContentEditableWarning
                onInput={handleInput}
                onMouseUp={saveSelection}
                onKeyUp={saveSelection}
                onBlur={saveSelection}
                onMouseDown={updateActiveFormats}
                spellCheck={true}
                className={`w-full min-h-[400px] sm:min-h-[480px] p-4 sm:p-6 rounded-2xl ${isDark ? "bg-black/30 text-gray-100" : "bg-white/60"} outline-none`}
                style={{ fontFamily: currentFont.css, fontSize: `${fontSize}px`, lineHeight, color: isDark ? "#f3f4f6" : color }}
              />
              {suggestions.length > 0 && (
                <div className="absolute bottom-20 left-4 sm:left-8 glass rounded-xl shadow-2xl text-sm overflow-hidden z-30 anim-pop">
                  {suggestions.map((s, i) => (
                    <button key={s.word} onClick={() => insertSuggestion(s)} className={`block w-full text-left px-4 py-1.5 hover:bg-violet-500/20 ${i === 0 ? "bg-violet-500/10 font-bold" : ""}`}>
                      {s.word} {i === 0 && <span className="text-[10px] opacity-50 ml-2">Tab</span>}
                    </button>
                  ))}
                </div>
              )}
              <div className="px-3 py-2 text-[11px] opacity-60 flex justify-between flex-wrap gap-1">
                <span>💡 Select text → click A (color), H (highlight), or format buttons • Ctrl+/ for shortcuts</span>
                <span>{isActive ? "🟢 Active" : "⚪ Idle"} • ⏱ {formatTime(writingTime)}</span>
              </div>
            </div>

            {/* READING & SPEAKING */}
            <div className="glass rounded-3xl p-4 mt-4">
              <h3 className="font-bold text-xs uppercase mb-3">⏱ Reading & Speaking Analysis</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="glass-btn rounded-xl p-3 text-center">
                  <div className="text-[10px] uppercase opacity-60 font-bold">Reading Time</div>
                  <div className="text-lg font-black mt-1 gradient-text">{formatMinSec(stats.readingSeconds)}</div>
                  <div className="text-[10px] opacity-50 mt-1">{effectiveReadingWPM} wpm • {readingSpeed}</div>
                </div>
                <div className="glass-btn rounded-xl p-3 text-center">
                  <div className="text-[10px] uppercase opacity-60 font-bold">Speaking Time</div>
                  <div className="text-lg font-black mt-1 gradient-text">{formatMinSec(stats.speakingSeconds)}</div>
                  <div className="text-[10px] opacity-50 mt-1">{speakingWPM} wpm</div>
                </div>
              </div>
            </div>

            {showHighlight && (
              <div className="glass rounded-3xl p-4 mt-4">
                <h3 className="font-bold text-xs mb-2">🔍 Grammar Preview (Red Wavy)</h3>
                <div className={`min-h-[80px] p-4 rounded-2xl ${isDark ? "bg-black/30" : "bg-white/60"} text-[15px] leading-7`} style={{ fontFamily: currentFont.css }} dangerouslySetInnerHTML={{ __html: highlightedHtml || escapeHtml(text).replace(/\n/g, "<br>") || "<span class='opacity-40'>No errors</span>" }} />
              </div>
            )}

            {errors.length > 0 && (
              <div className="glass rounded-2xl p-4 mt-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-sm">🔴 {errors.length} Grammar Issues</h3>
                  <button onClick={fixAll} className="text-xs px-2 py-1 bg-green-500 text-white rounded font-bold btn-shine">Fix All</button>
                </div>
                {errors.map((err, i) => (
                  <div key={i} className="flex justify-between items-center p-2 glass rounded-xl text-xs mb-2 gap-2">
                    <span className="flex-1">{err.message} → <b className="text-green-600 dark:text-green-400">{err.replacement}</b></span>
                    <button onClick={() => fixError(err)} className="px-3 py-1 bg-black text-white rounded-lg whitespace-nowrap font-bold btn-shine">Fix</button>
                  </div>
                ))}
              </div>
            )}

            {(duplicates.words.length > 0 || duplicates.sentences.length > 0 || duplicates.lines.length > 0) && (
              <div className="glass rounded-2xl p-4 mt-4">
                <h3 className="font-bold text-sm mb-2">🔁 Duplicate Detection</h3>
                {duplicates.sentences.length > 0 && (<div className="mb-3"><div className="text-[10px] uppercase opacity-60 font-bold mb-1">Repeated Sentences ({duplicates.sentences.length})</div>{duplicates.sentences.map((d, i) => (<div key={i} className="text-xs p-2 bg-purple-500/15 rounded-lg mb-1"><b>{d.count}x</b> — "{d.text}..."</div>))}</div>)}
                {duplicates.lines.length > 0 && (<div className="mb-3"><div className="text-[10px] uppercase opacity-60 font-bold mb-1">Repeated Lines ({duplicates.lines.length})</div>{duplicates.lines.slice(0, 5).map((d, i) => (<div key={i} className="text-xs p-2 bg-blue-500/15 rounded-lg mb-1"><b>{d.count}x</b> — "{d.text}..."</div>))}</div>)}
                {duplicates.words.length > 0 && (<div><div className="text-[10px] uppercase opacity-60 font-bold mb-1">Repeated Words</div><div className="flex flex-wrap gap-1">{duplicates.words.slice(0, 12).map(([w, c]) => (<span key={w} className="text-[11px] px-2 py-1 bg-orange-500/20 rounded-full font-bold">{w} × {c}</span>))}</div></div>)}
              </div>
            )}

            <div className="glass rounded-2xl p-4 mt-4">
              <h3 className="font-bold text-xs uppercase mb-3">📊 Keyword Density</h3>
              {stats.density.length === 0 ? <p className="text-xs opacity-50">Type something...</p> : stats.density.map(([k, d]) => (
                <div key={k} className="flex justify-between text-xs py-1 border-b border-white/10 last:border-0">
                  <span>{k}</span><span className={`font-bold ${parseFloat(d) > 3 ? "text-red-500" : "text-green-600 dark:text-green-400"}`}>{d}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* SIDEBAR */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Stat label="Words" value={<AnimatedCounter value={stats.words} />} tip="Total words" />
              <Stat label="Chars (with)" value={<AnimatedCounter value={stats.chars} />} tip="Space included" />
              <Stat label="Chars (without)" value={<AnimatedCounter value={stats.charsNoSpace} />} tip="No spaces" />
              <Stat label="Sentences" value={<AnimatedCounter value={stats.sentences} />} />
              <Stat label="Paragraphs" value={<AnimatedCounter value={stats.paras} />} />
              <Stat label="Lines" value={<AnimatedCounter value={stats.lines} />} />
              <Stat label="Reading" value={formatMinSec(stats.readingSeconds)} tip="Configurable" />
              <Stat label="Speaking" value={formatMinSec(stats.speakingSeconds)} tip="Configurable" />
              <Stat label="Writing" value={formatTime(writingTime)} tip={isActive ? "Active" : "Idle"} />
              <Stat label="Flesch" value={<AnimatedCounter value={stats.flesch} />} tip={stats.level} />
            </div>
            <div className={`glass rounded-2xl p-4 ${goalReached ? "celebrate" : ""}`}>
              <h3 className="font-bold text-xs uppercase mb-3">🎯 Goal</h3>
              <div className="text-3xl font-black text-center gradient-text"><AnimatedCounter value={progress} />%</div>
              <div className="text-xs text-center opacity-60 mt-1">{stats.words} / {goal} words</div>
              {goalReached && <div className="text-center text-green-600 text-xs font-bold mt-2 anim-pop">🎉 Goal Achieved!</div>}
            </div>
            <div className="glass rounded-2xl p-4">
              <h3 className="font-bold text-xs uppercase mb-3">Top 10 Keywords</h3>
              {stats.top10.length === 0 ? <p className="text-xs opacity-50">Type...</p> : stats.top10.map(([k, v], i) => (
                <div key={k} className="flex justify-between text-xs py-1.5 border-b border-white/10 last:border-0"><span>{i + 1}. {k}</span><span className="font-bold">{v}x</span></div>
              ))}
            </div>
            <div className="glass rounded-2xl p-4">
              <h3 className="font-bold text-xs uppercase mb-3">📱 Social Limits (Live)</h3>
              <div className="space-y-2">
                {[{ name: "Twitter", limit: 280 }, { name: "Instagram", limit: 2200 }, { name: "LinkedIn", limit: 3000 }].map(s => {
                  const left = s.limit - stats.chars;
                  const pct = Math.min(100, Math.round((stats.chars / s.limit) * 100));
                  return (
                    <div key={s.name} className="glass-btn rounded-xl p-2">
                      <div className="flex justify-between px-1"><div className="text-[10px] opacity-70 font-bold">{s.name}</div><div className={`text-xs font-black ${left < 0 ? "text-red-500" : "text-green-600 dark:text-green-400"}`}>{left < 0 ? `${Math.abs(left)} over` : `${left} left`}</div></div>
                      <div className="mt-1.5 h-1 bg-white/40 dark:bg-white/10 rounded-full overflow-hidden"><div className="h-full transition-all duration-500" style={{ width: `${pct}%`, background: left < 0 ? "#ef4444" : "linear-gradient(90deg,#a855f7,#ec4899)" }} /></div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* TOOLS HUB */}
        <section className="mt-12">
          <h2 className="text-2xl sm:text-3xl font-black text-center gradient-text mb-2">🧰 Writing Tools Hub</h2>
          <p className="text-center opacity-70 text-sm mb-6">40+ tools for writers, students, and SEO professionals</p>
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {[{ id: "suggested", label: "📌 Suggested Tools" }, { id: "writing", label: "✍️ Writing Tools" }, { id: "academic", label: "🎓 Academic Tools" }, { id: "analyzer", label: "📊 Quality Analyzer" }].map(t => (
              <button key={t.id} onClick={() => setActiveToolTab(t.id)} className={`tab-btn px-4 py-2 rounded-xl text-xs font-bold glass-btn btn-shine ${activeToolTab === t.id ? "active" : ""}`}>{t.label}</button>
            ))}
          </div>

          {activeToolTab === "suggested" && (
            <div className="anim-pop">
              <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-9 gap-2 mb-4">
                {[{ id: "char", label: "Char", icon: "🔡" },{ id: "sentence", label: "Sentence", icon: "📝" },{ id: "paragraph", label: "Paragraph", icon: "📄" },{ id: "readability", label: "Readability", icon: "📊" },{ id: "density", label: "Density", icon: "🔍" },{ id: "case", label: "Case", icon: "Aa" },{ id: "cleaner", label: "Cleaner", icon: "🧹" },{ id: "find", label: "Find", icon: "🔎" },{ id: "dup", label: "Dup Lines", icon: "🔁" }].map(tool => (
                  <button key={tool.id} onClick={() => setActiveSuggestedTool(tool.id)} className={`tab-btn p-2 rounded-xl text-xs font-bold glass-btn btn-shine ${activeSuggestedTool === tool.id ? "active" : ""}`}><div className="text-lg">{tool.icon}</div><div className="text-[10px] mt-0.5">{tool.label}</div></button>
                ))}
              </div>
              <div className="glass rounded-2xl p-4 anim-slide" key={activeSuggestedTool}>
                {activeSuggestedTool === "char" && (<div><h3 className="font-bold text-sm mb-3">🔡 Character Counter</h3><div className="grid grid-cols-2 md:grid-cols-4 gap-3"><MiniStat label="Total Chars" value={stats.chars} /><MiniStat label="Without Spaces" value={stats.charsNoSpace} /><MiniStat label="With Spaces" value={stats.chars} /><MiniStat label="Spaces Only" value={stats.chars - stats.charsNoSpace} /></div></div>)}
                {activeSuggestedTool === "sentence" && (<div><h3 className="font-bold text-sm mb-3">📝 Sentence Counter</h3><div className="grid grid-cols-2 md:grid-cols-4 gap-3"><MiniStat label="Total" value={stats.sentences} /><MiniStat label="Short (1-10w)" value={stats.short} /><MiniStat label="Medium (11-20w)" value={stats.medium} /><MiniStat label="Long (21+ w)" value={stats.long} /></div><div className="mt-3 text-xs opacity-60">Avg words per sentence: {(stats.words / Math.max(1, stats.sentences)).toFixed(1)}</div></div>)}
                {activeSuggestedTool === "paragraph" && (<div><h3 className="font-bold text-sm mb-3">📄 Paragraph Counter</h3><div className="grid grid-cols-2 md:grid-cols-3 gap-3"><MiniStat label="Paragraphs" value={stats.paras} /><MiniStat label="Lines" value={stats.lines} /><MiniStat label="Avg Words/Para" value={stats.paras > 0 ? Math.round(stats.words / stats.paras) : 0} /></div></div>)}
                {activeSuggestedTool === "readability" && (<div><h3 className="font-bold text-sm mb-3">📊 Readability Checker</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-3"><MiniStat label="Flesch Score" value={stats.flesch} extra={stats.level} /><MiniStat label="Avg Words/Sentence" value={(stats.words / Math.max(1, stats.sentences)).toFixed(1)} /></div><div className="mt-3 text-xs opacity-70">90-100: Very Easy • 80-90: Easy • 70-80: Fairly Easy • 60-70: Standard • 50-60: Fairly Difficult • 30-50: Difficult • 0-30: Very Difficult</div></div>)}
                {activeSuggestedTool === "density" && (<div><h3 className="font-bold text-sm mb-3">🔍 Keyword Density</h3>{stats.density.length === 0 ? <p className="text-xs opacity-50">Type text to see keywords</p> : (<div className="space-y-1">{stats.density.map(([k, d]) => (<div key={k} className="flex justify-between text-xs py-1 border-b border-white/10 last:border-0"><span className="font-mono">{k}</span><span className={`font-bold ${parseFloat(d) > 3 ? "text-red-500" : "text-green-600 dark:text-green-400"}`}>{d}%</span></div>))}</div>)}</div>)}
                {activeSuggestedTool === "case" && (<div><h3 className="font-bold text-sm mb-3">Aa Case Converter</h3><div className="grid grid-cols-2 md:grid-cols-3 gap-2"><button onClick={() => changeCase("upper")} className="glass-btn p-2 rounded-lg text-xs font-bold btn-shine">UPPERCASE</button><button onClick={() => changeCase("lower")} className="glass-btn p-2 rounded-lg text-xs font-bold btn-shine">lowercase</button><button onClick={() => changeCase("title")} className="glass-btn p-2 rounded-lg text-xs font-bold btn-shine">Title Case</button><button onClick={() => changeCase("sentence")} className="glass-btn p-2 rounded-lg text-xs font-bold btn-shine">Sentence case</button><button onClick={() => changeCase("capitalize")} className="glass-btn p-2 rounded-lg text-xs font-bold btn-shine">Capitalize Each Word</button><button onClick={() => changeCase("toggle")} className="glass-btn p-2 rounded-lg text-xs font-bold btn-shine">tOGGLE cASE</button></div></div>)}
                {activeSuggestedTool === "cleaner" && (<div><h3 className="font-bold text-sm mb-3">🧹 Text Cleaner</h3><div className="grid grid-cols-2 md:grid-cols-3 gap-2"><button onClick={cleanExtraSpaces} className="glass-btn p-2 rounded-lg text-xs font-bold btn-shine">Extra Spaces</button><button onClick={removeBlankLines} className="glass-btn p-2 rounded-lg text-xs font-bold btn-shine">Blank Lines</button><button onClick={removeDupLines} className="glass-btn p-2 rounded-lg text-xs font-bold btn-shine">Dup Lines</button><button onClick={removeDupSentences} className="glass-btn p-2 rounded-lg text-xs font-bold btn-shine">Dup Sentences</button><button onClick={normalizePunctuation} className="glass-btn p-2 rounded-lg text-xs font-bold btn-shine">Punctuation</button><button onClick={removeSpecialChars} className="glass-btn p-2 rounded-lg text-xs font-bold btn-shine">Special Chars</button><button onClick={removeNumbers} className="glass-btn p-2 rounded-lg text-xs font-bold btn-shine">Numbers</button><button onClick={removeHtmlTags} className="glass-btn p-2 rounded-lg text-xs font-bold btn-shine">HTML Tags</button></div></div>)}
                {activeSuggestedTool === "find" && (<div><h3 className="font-bold text-sm mb-3">🔎 Find & Replace</h3><button onClick={() => setShowFind(true)} className="glass-btn p-3 rounded-xl text-xs font-bold btn-shine">Open Find & Replace (Ctrl+F)</button></div>)}
                {activeSuggestedTool === "dup" && (<div><h3 className="font-bold text-sm mb-3">🔁 Duplicate Line Remover</h3>{duplicates.lines.length === 0 ? <p className="text-xs opacity-50">No duplicate lines found ✓</p> : (<><p className="text-xs opacity-70 mb-3">{duplicates.lines.length} duplicate line groups found</p><button onClick={removeDupLines} className="glass-btn p-2 px-4 rounded-lg text-xs font-bold btn-shine">Remove All Duplicates</button></>)}</div>)}
              </div>
            </div>
          )}

          {activeToolTab === "writing" && (
            <div className="anim-pop grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="glass rounded-2xl p-4"><h3 className="font-bold text-sm mb-3">🔤 Text Formatter</h3><div className="grid grid-cols-2 gap-2"><button onClick={() => changeCase("upper")} className="glass-btn p-2 rounded-lg text-xs font-bold btn-shine">Uppercase</button><button onClick={() => changeCase("lower")} className="glass-btn p-2 rounded-lg text-xs font-bold btn-shine">Lowercase</button><button onClick={() => changeCase("title")} className="glass-btn p-2 rounded-lg text-xs font-bold btn-shine">Title Case</button><button onClick={() => changeCase("sentence")} className="glass-btn p-2 rounded-lg text-xs font-bold btn-shine">Sentence case</button><button onClick={() => changeCase("capitalize")} className="glass-btn p-2 rounded-lg text-xs font-bold btn-shine">Capitalize Each Word</button><button onClick={() => changeCase("toggle")} className="glass-btn p-2 rounded-lg text-xs font-bold btn-shine">Toggle Case</button></div></div>
              <div className="glass rounded-2xl p-4"><h3 className="font-bold text-sm mb-3">🧹 Text Cleaner</h3><div className="grid grid-cols-2 gap-2"><button onClick={cleanExtraSpaces} className="glass-btn p-2 rounded-lg text-xs font-bold btn-shine">Extra Spaces</button><button onClick={removeBlankLines} className="glass-btn p-2 rounded-lg text-xs font-bold btn-shine">Blank Lines</button><button onClick={removeDupLines} className="glass-btn p-2 rounded-lg text-xs font-bold btn-shine">Dup Lines</button><button onClick={removeDupSentences} className="glass-btn p-2 rounded-lg text-xs font-bold btn-shine">Dup Sentences</button><button onClick={normalizePunctuation} className="glass-btn p-2 rounded-lg text-xs font-bold btn-shine">Punctuation</button><button onClick={removeSpecialChars} className="glass-btn p-2 rounded-lg text-xs font-bold btn-shine">Special Chars</button><button onClick={removeNumbers} className="glass-btn p-2 rounded-lg text-xs font-bold btn-shine">Numbers</button><button onClick={removeHtmlTags} className="glass-btn p-2 rounded-lg text-xs font-bold btn-shine">HTML Tags</button></div></div>
              <div className="glass rounded-2xl p-4"><h3 className="font-bold text-sm mb-3">🔁 Text Converter</h3><div className="grid grid-cols-2 gap-2"><button onClick={toSlug} className="glass-btn p-2 rounded-lg text-xs font-bold btn-shine">Slug</button><button onClick={toSlug} className="glass-btn p-2 rounded-lg text-xs font-bold btn-shine">URL-friendly</button><button onClick={toCommaSeparated} className="glass-btn p-2 rounded-lg text-xs font-bold btn-shine">Comma-separated</button><button onClick={toLineSeparated} className="glass-btn p-2 rounded-lg text-xs font-bold btn-shine">Line-separated</button><button onClick={toJsonSafe} className="glass-btn p-2 rounded-lg text-xs font-bold btn-shine">JSON-safe</button><button onClick={toPlainText} className="glass-btn p-2 rounded-lg text-xs font-bold btn-shine">Plain Text</button></div></div>
              <div className="glass rounded-2xl p-4"><h3 className="font-bold text-sm mb-3">📊 Sorting Tools</h3><div className="grid grid-cols-2 gap-2"><button onClick={sortAZ} className="glass-btn p-2 rounded-lg text-xs font-bold btn-shine">Sort A-Z</button><button onClick={sortZA} className="glass-btn p-2 rounded-lg text-xs font-bold btn-shine">Sort Z-A</button><button onClick={sortByLength} className="glass-btn p-2 rounded-lg text-xs font-bold btn-shine">By Length</button><button onClick={sortByWordCount} className="glass-btn p-2 rounded-lg text-xs font-bold btn-shine">By Word Count</button><button onClick={removeDupLines} className="glass-btn p-2 rounded-lg text-xs font-bold btn-shine">Remove Dups</button></div></div>
              <div className="glass rounded-2xl p-4"><h3 className="font-bold text-sm mb-3">🔄 Text Reversal</h3><div className="grid grid-cols-1 gap-2"><button onClick={reverseChars} className="glass-btn p-2 rounded-lg text-xs font-bold btn-shine">Reverse Characters</button><button onClick={reverseWords} className="glass-btn p-2 rounded-lg text-xs font-bold btn-shine">Reverse Words</button><button onClick={reverseLines} className="glass-btn p-2 rounded-lg text-xs font-bold btn-shine">Reverse Lines</button></div></div>
              <div className="glass rounded-2xl p-4"><h3 className="font-bold text-sm mb-3">⎵ Space Tools</h3><div className="grid grid-cols-2 gap-2"><button onClick={trimLeading} className="glass-btn p-2 rounded-lg text-xs font-bold btn-shine">Trim Leading</button><button onClick={trimTrailing} className="glass-btn p-2 rounded-lg text-xs font-bold btn-shine">Trim Trailing</button><button onClick={collapseSpaces} className="glass-btn p-2 rounded-lg text-xs font-bold btn-shine">Collapse Spaces</button><button onClick={tabsToSpaces} className="glass-btn p-2 rounded-lg text-xs font-bold btn-shine">Tabs→Spaces</button></div></div>
            </div>
          )}

          {activeToolTab === "academic" && (
            <div className="anim-pop">
              <div className="glass rounded-2xl p-4 mb-4">
                <h3 className="font-bold text-sm mb-3">🎓 Academic Word Limit Tracker</h3>
                <div className="flex flex-wrap gap-3 items-end">
                  <div><label className="text-[10px] uppercase opacity-60 font-bold block mb-1">Type</label><select value={academicType} onChange={e => setAcademicType(e.target.value)} className="h-9 rounded-lg glass-btn px-2 text-sm">{["Essay","Assignment","Thesis","Abstract","Research Paper","Dissertation","Lab Report"].map(t => <option key={t}>{t}</option>)}</select></div>
                  <div><label className="text-[10px] uppercase opacity-60 font-bold block mb-1">Required Words</label><input type="number" min={1} value={academicLimit} onChange={e => setAcademicLimit(Math.max(1, parseInt(e.target.value) || 1))} className="w-32 h-9 rounded-lg glass-btn px-2 text-sm" /></div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3"><MiniStat label="Required" value={academicLimit} /><MiniStat label="Current" value={stats.words} /><MiniStat label="Remaining" value={Math.max(0, academicLimit - stats.words)} extra={stats.words > academicLimit ? `Over by ${stats.words - academicLimit}` : ""} /></div>
                <div className="mt-3 h-2.5 bg-white/40 dark:bg-white/10 rounded-full overflow-hidden"><div className="h-full transition-all duration-500 progress-bar" style={{ width: `${Math.min(100, (stats.words / academicLimit) * 100)}%`, background: stats.words > academicLimit ? "linear-gradient(90deg,#ef4444,#dc2626)" : "linear-gradient(90deg,#a855f7,#ec4899)" }} /></div>
                <div className="mt-2 text-xs opacity-70">{stats.words >= academicLimit ? "✅ Word limit reached!" : `You need ${academicLimit - stats.words} more words`}</div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="glass rounded-2xl p-4"><h3 className="font-bold text-sm mb-3">📝 Paragraph Analyzer</h3>{stats.paras === 0 ? <p className="text-xs opacity-50">No paragraphs yet</p> : (<div className="space-y-2">{text.split(/\n+/).filter(p => p.trim().length > 0).slice(0, 5).map((p, i) => (<div key={i} className="text-xs p-2 glass-btn rounded-lg"><div className="font-bold mb-1">Paragraph {i + 1}</div><div className="opacity-70">{p.split(/\s+/).filter(Boolean).length} words • {p.length} chars • {p.split(/[.!?]+/).filter(s => s.trim()).length} sentences</div></div>))}</div>)}</div>
                <div className="glass rounded-2xl p-4"><h3 className="font-bold text-sm mb-3">📚 Citation-Friendly Stats</h3><div className="grid grid-cols-2 gap-3"><MiniStat label="Words" value={stats.words} /><MiniStat label="Sentences" value={stats.sentences} /><MiniStat label="Paragraphs" value={stats.paras} /><MiniStat label="Chars (no space)" value={stats.charsNoSpace} /></div></div>
              </div>
            </div>
          )}

          {activeToolTab === "analyzer" && (
            <div className="anim-pop glass rounded-2xl p-4">
              <h3 className="font-bold text-sm mb-1">📊 Text Quality Analyzer</h3>
              <p className="text-[10px] opacity-60 mb-4">Basic client-side rule-based analysis (not a replacement for professional AI grammar tools)</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { label: "Repeated Words", value: quality.dupWordCount, warn: quality.dupWordCount > 10, danger: quality.dupWordCount > 25 },
                  { label: "Repeated Sentences", value: quality.dupSentenceCount, warn: quality.dupSentenceCount > 0, danger: quality.dupSentenceCount > 3 },
                  { label: "Long Sentences (25+ words)", value: quality.longSentences, warn: quality.longSentences > 3, danger: quality.longSentences > 10 },
                  { label: "Very Long Paragraphs (150+)", value: quality.veryLongParas, warn: quality.veryLongParas > 1, danger: quality.veryLongParas > 3 },
                  { label: "Filler Words", value: quality.fillerCount, warn: quality.fillerCount > 5, danger: quality.fillerCount > 15 },
                  { label: "Weak/Passive Phrases", value: quality.weakCount, warn: quality.weakCount > 3, danger: quality.weakCount > 10 },
                  { label: "Excessive Punctuation", value: quality.excessivePunct, warn: quality.excessivePunct > 0, danger: quality.excessivePunct > 3 },
                  { label: "Multiple Spaces", value: quality.multipleSpaces, warn: quality.multipleSpaces > 5, danger: quality.multipleSpaces > 15 },
                  { label: "ALL CAPS Words", value: quality.allCapsWords, warn: quality.allCapsWords > 3, danger: quality.allCapsWords > 10 },
                ].map(item => {
                  const hasIssue = item.value > 0;
                  const lbl = !hasIssue ? { text: "Good", color: "bg-green-500/20 text-green-700 dark:text-green-300" }
                    : item.danger ? { text: "Improve", color: "bg-red-500/20 text-red-700 dark:text-red-300" }
                    : { text: "Needs Attention", color: "bg-orange-500/20 text-orange-700 dark:text-orange-300" };
                  return (
                    <div key={item.label} className="glass-btn rounded-xl p-3 flex justify-between items-center">
                      <div><div className="text-xs font-bold">{item.label}</div><div className="text-[10px] opacity-60 mt-0.5">Found: {item.value}</div></div>
                      <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${lbl.color}`}>{lbl.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* v10 — AI INSIGHTS HUB */}
        <section className="mt-12">
          <h2 className="text-2xl sm:text-3xl font-black text-center gradient-text mb-2">🧠 AI Writing Insights</h2>
          <p className="text-center opacity-70 text-sm mb-6">Advanced client-side analysis — tone, sentiment, passive voice, vocabulary richness</p>

          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {([
              { id: "insights", label: "🧠 AI Insights" },
              { id: "session", label: "⏱ Session Dashboard" },
              { id: "visuals", label: "📊 Visual Analytics" },
              { id: "cloud", label: "☁️ Word Cloud" },
              { id: "emoji", label: "😀 Emoji Picker" },
              { id: "docs", label: "📁 Documents" },
            ] as const).map(t => (
              <button
                key={t.id}
                onClick={() => setInsightTab(t.id)}
                className={`tab-btn px-4 py-2 rounded-xl text-xs font-bold glass-btn btn-shine ${insightTab === t.id ? "active" : ""}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {insightTab === "insights" && (
            <div className="anim-pop glass rounded-2xl p-5">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="glass-btn rounded-2xl p-4">
                  <div className="text-[10px] uppercase opacity-60 font-bold mb-1">Writing Tone</div>
                  <div className="text-2xl font-black gradient-text mb-2">{insights.tone.label}</div>
                  <div className="h-2 bg-white/30 dark:bg-white/10 rounded-full overflow-hidden mb-2">
                    <div className="h-full progress-bar" style={{ width: `${insights.tone.score}%`, background: "linear-gradient(90deg,#3b82f6,#8b5cf6)" }} />
                  </div>
                  <div className="text-[10px] opacity-60">{insights.tone.hint}</div>
                </div>

                <div className="glass-btn rounded-2xl p-4">
                  <div className="text-[10px] uppercase opacity-60 font-bold mb-1">Sentiment</div>
                  <div className="text-2xl font-black gradient-text mb-2">{insights.sentiment.label}</div>
                  <div className="flex gap-2 text-[10px] mb-2">
                    <span className="text-green-600 dark:text-green-400 font-bold">+{insights.sentiment.positive}</span>
                    <span className="text-red-600 dark:text-red-400 font-bold">-{insights.sentiment.negative}</span>
                  </div>
                  <div className="text-[10px] opacity-60">Score: {insights.sentiment.score}</div>
                </div>

                <div className="glass-btn rounded-2xl p-4">
                  <div className="text-[10px] uppercase opacity-60 font-bold mb-1">Passive Voice</div>
                  <div className="text-2xl font-black gradient-text mb-2">{insights.passive.count} <span className="text-sm opacity-60">({insights.passive.percent}%)</span></div>
                  {insights.passive.count > 0 ? (
                    <div className="text-[10px] opacity-60 leading-relaxed">
                      {insights.passive.examples.slice(0, 3).map((e, i) => <div key={i}>· {e}</div>)}
                    </div>
                  ) : <div className="text-[10px] opacity-60">No passive constructions ✓</div>}
                </div>

                <div className="glass-btn rounded-2xl p-4">
                  <div className="text-[10px] uppercase opacity-60 font-bold mb-1">Adverb Density</div>
                  <div className="text-2xl font-black gradient-text mb-2">{insights.adverbs.percent}%</div>
                  <div className="flex flex-wrap gap-1">
                    {insights.adverbs.top.slice(0, 5).map(([w, c]) => (
                      <span key={w} className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 font-bold">{w} × {c}</span>
                    ))}
                  </div>
                </div>

                <div className="glass-btn rounded-2xl p-4">
                  <div className="text-[10px] uppercase opacity-60 font-bold mb-1">Vocabulary Richness (TTR)</div>
                  <div className="text-2xl font-black gradient-text mb-2">{insights.vocabulary.ttr}%</div>
                  <div className="text-xs mb-1">{insights.vocabulary.label}</div>
                  <div className="text-[10px] opacity-60">{insights.vocabulary.uniqueWords} unique / {insights.vocabulary.totalWords} total</div>
                </div>

                <div className="glass-btn rounded-2xl p-4">
                  <div className="text-[10px] uppercase opacity-60 font-bold mb-1">Sentence Variety</div>
                  <div className="text-2xl font-black gradient-text mb-2">{insights.variety.score}/100</div>
                  <div className="text-xs mb-2">{insights.variety.label}</div>
                  <div className="flex gap-1 text-[10px]">
                    <span className="px-2 py-0.5 rounded-full bg-green-500/20 font-bold">Short: {insights.variety.distribution.short}</span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/20 font-bold">Med: {insights.variety.distribution.medium}</span>
                    <span className="px-2 py-0.5 rounded-full bg-orange-500/20 font-bold">Long: {insights.variety.distribution.long}</span>
                  </div>
                </div>
              </div>

              {insights.cliches.count > 0 && (
                <div className="mt-4 glass-btn rounded-2xl p-4">
                  <div className="text-[10px] uppercase opacity-60 font-bold mb-2">⚠️ Cliches Detected ({insights.cliches.count})</div>
                  <div className="flex flex-wrap gap-2">
                    {insights.cliches.items.map(c => (
                      <span key={c} className="text-[11px] px-2 py-1 rounded-full bg-orange-500/20 font-bold">"{c}"</span>
                    ))}
                  </div>
                  <p className="text-[10px] opacity-60 mt-2">Consider replacing these overused phrases with fresher wording.</p>
                </div>
              )}
            </div>
          )}

          {insightTab === "session" && (
            <div className="anim-pop glass rounded-2xl p-5">
              <div className="flex flex-wrap gap-3 justify-center mb-5">
                <button
                  onClick={() => { setSessionActive(v => !v); if (!sessionActive) { setSessionElapsed(0); setSessionWordsBaseline(stats.words); } }}
                  className={`px-6 py-3 rounded-xl text-sm font-black btn-shine transition ${sessionActive ? "bg-red-500 text-white" : "bg-gradient-to-r from-violet-600 to-pink-600 text-white"}`}
                >
                  {sessionActive ? "■ End Session" : "▶ Start Writing Session"}
                </button>
                <button
                  onClick={() => { setSessionElapsed(0); setSessionWordsBaseline(stats.words); }}
                  className="px-4 py-3 rounded-xl text-sm font-bold glass-btn btn-shine"
                >
                  ↺ Reset
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <MiniStat label="Session Time" value={formatTime(sessionElapsed)} extra={sessionActive ? "🟢 Live" : "⏸ Paused"} />
                <MiniStat label="Words Typed" value={sessionWordsTyped} />
                <MiniStat label="Current WPM" value={sessionWPM} extra={sessionWPM > 40 ? "🔥 Fast" : sessionWPM > 20 ? "👍 Good" : "🐢 Slow"} />
                <MiniStat label="Total Words" value={stats.words} />
              </div>

              <div className="mt-5 glass-btn rounded-2xl p-4">
                <div className="text-[10px] uppercase opacity-60 font-bold mb-2">Session Progress (relative to {sessionWordsBaseline + 500} words)</div>
                <div className="h-3 bg-white/30 dark:bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full progress-bar transition-all duration-500" style={{ width: `${Math.min(100, (sessionWordsTyped / 500) * 100)}%`, background: "linear-gradient(90deg,#10b981,#06b6d4)" }} />
                </div>
                <div className="text-[10px] opacity-60 mt-2">
                  {sessionWordsTyped >= 500 ? "🎉 500-word milestone reached!" : `${500 - sessionWordsTyped} words to go for next milestone`}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                {[
                  { label: "Very Fast", range: "60+ WPM", color: "text-emerald-600" },
                  { label: "Fast", range: "40-60 WPM", color: "text-blue-600" },
                  { label: "Average", range: "20-40 WPM", color: "text-purple-600" },
                  { label: "Slow", range: "<20 WPM", color: "text-orange-600" },
                ].map(b => (
                  <div key={b.label} className="glass-btn rounded-xl p-2 text-center">
                    <div className={`text-[10px] font-bold ${b.color}`}>{b.label}</div>
                    <div className="text-[9px] opacity-60">{b.range}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {insightTab === "visuals" && (
            <div className="anim-pop grid md:grid-cols-2 gap-4">
              <div className="glass rounded-2xl p-4">
                <h3 className="font-bold text-sm mb-3">🍩 Character Composition</h3>
                <div className="flex items-center justify-center">
                  <svg viewBox="0 0 200 200" width="180" height="180">
                    {(() => {
                      const letters = stats.letters;
                      const digits = stats.digits;
                      const punct = stats.punct;
                      const spaces = stats.chars - stats.charsNoSpace;
                      const total = letters + digits + punct + spaces || 1;
                      const circ = 2 * Math.PI * 70;
                      const segments = [
                        { val: letters, color: "#8b5cf6", label: "Letters" },
                        { val: digits, color: "#ec4899", label: "Digits" },
                        { val: punct, color: "#06b6d4", label: "Punct" },
                        { val: spaces, color: "#f59e0b", label: "Spaces" },
                      ];
                      let offset = 0;
                      return (
                        <>
                          {segments.map(s => {
                            const len = (s.val / total) * circ;
                            const el = (
                              <circle key={s.label} cx="100" cy="100" r="70" fill="none" stroke={s.color} strokeWidth="24"
                                strokeDasharray={`${len} ${circ - len}`} strokeDashoffset={-offset}
                                transform="rotate(-90 100 100)" />
                            );
                            offset += len;
                            return el;
                          })}
                          <text x="100" y="100" textAnchor="middle" fontSize="22" fontWeight="900" fill="currentColor">{stats.chars}</text>
                          <text x="100" y="120" textAnchor="middle" fontSize="10" fill="currentColor" opacity="0.6">characters</text>
                        </>
                      );
                    })()}
                  </svg>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-3 text-[10px]">
                  <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded" style={{ background: "#8b5cf6" }} /> Letters: {stats.letters}</div>
                  <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded" style={{ background: "#ec4899" }} /> Digits: {stats.digits}</div>
                  <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded" style={{ background: "#06b6d4" }} /> Punct: {stats.punct}</div>
                  <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded" style={{ background: "#f59e0b" }} /> Spaces: {stats.chars - stats.charsNoSpace}</div>
                </div>
              </div>

              <div className="glass rounded-2xl p-4">
                <h3 className="font-bold text-sm mb-3">📊 Sentence Length Distribution</h3>
                <div className="flex items-end gap-2 h-[180px] pt-4">
                  {(() => {
                    const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(Boolean);
                    const buckets = [0, 0, 0, 0, 0, 0, 0, 0];
                    sentences.forEach(s => {
                      const w = s.split(/\s+/).length;
                      const idx = Math.min(7, Math.floor(w / 6));
                      buckets[idx]++;
                    });
                    const max = Math.max(...buckets, 1);
                    return buckets.map((v, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div className="text-[9px] font-bold">{v}</div>
                        <div className="w-full rounded-t transition-all duration-500 progress-bar" style={{
                          height: `${(v / max) * 130}px`,
                          minHeight: v > 0 ? "4px" : "0",
                          background: `linear-gradient(180deg, hsl(${260 - i * 20}, 80%, 60%), hsl(${260 - i * 20}, 80%, 45%))`,
                        }} />
                        <div className="text-[9px] opacity-60">{i * 6}-{i * 6 + 6}</div>
                      </div>
                    ));
                  })()}
                </div>
                <div className="text-[10px] opacity-60 text-center mt-2">Words per sentence</div>
              </div>

              <div className="glass rounded-2xl p-4 md:col-span-2">
                <h3 className="font-bold text-sm mb-3">🏆 Top 15 Most Used Words</h3>
                {stats.top10.length === 0 ? (
                  <p className="text-xs opacity-50 py-4 text-center">Type text to see the chart</p>
                ) : (
                  <div className="space-y-1.5">
                    {Object.entries(
                      (() => {
                        const trimmed = text.trim();
                        if (!trimmed) return {};
                        const freq: Record<string, number> = {};
                        trimmed.toLowerCase().split(/\s+/).forEach(w => {
                          const c = w.replace(/[^a-z0-9\u0900-\u097F]/g, "");
                          if (c.length > 2) freq[c] = (freq[c] || 0) + 1;
                        });
                        return Object.fromEntries(Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 15));
                      })()
                    ).map(([word, count]) => {
                      const max = Math.max(...Object.values((() => {
                        const trimmed = text.trim();
                        const freq: Record<string, number> = {};
                        trimmed.toLowerCase().split(/\s+/).forEach(w => {
                          const c = w.replace(/[^a-z0-9\u0900-\u097F]/g, "");
                          if (c.length > 2) freq[c] = (freq[c] || 0) + 1;
                        });
                        return freq;
                      })()), 1);
                      return (
                        <div key={word} className="flex items-center gap-2">
                          <span className="text-[11px] font-mono w-24 sm:w-32 truncate font-bold">{word}</span>
                          <div className="flex-1 h-5 bg-white/30 dark:bg-white/10 rounded-md overflow-hidden">
                            <div className="h-full progress-bar flex items-center justify-end pr-2 text-[9px] font-bold text-white transition-all duration-500"
                              style={{ width: `${(count / max) * 100}%`, background: "linear-gradient(90deg,#8b5cf6,#ec4899)" }}>
                              {count}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {insightTab === "cloud" && (
            <div className="anim-pop glass rounded-2xl p-5">
              <div className="flex flex-wrap gap-2 justify-center mb-4">
                {([
                  { id: "violet", label: "Violet Dream" },
                  { id: "ocean", label: "Ocean" },
                  { id: "sunset", label: "Sunset" },
                  { id: "forest", label: "Forest" },
                ] as const).map(p => (
                  <button key={p.id} onClick={() => setCloudPalette(p.id)}
                    className={`tab-btn px-3 py-1.5 rounded-lg text-xs font-bold glass-btn btn-shine ${cloudPalette === p.id ? "active" : ""}`}>
                    {p.label}
                  </button>
                ))}
              </div>
              <div className="min-h-[220px] flex flex-wrap items-center justify-center gap-2 p-4 rounded-2xl bg-white/20 dark:bg-black/20">
                {wordCloud.length === 0 ? (
                  <p className="text-sm opacity-50">Type text to generate a word cloud</p>
                ) : (
                  (() => {
                    const palettes: Record<string, string[]> = {
                      violet: ["#8b5cf6","#a855f7","#c084fc","#d8b4fe","#e9d5ff"],
                      ocean: ["#0ea5e9","#06b6d4","#22d3ee","#67e8f9","#a5f3fc"],
                      sunset: ["#f97316","#fb923c","#fbbf24","#facc15","#ef4444"],
                      forest: ["#059669","#10b981","#34d399","#6ee7b7","#a7f3d0"],
                    };
                    const colors = palettes[cloudPalette];
                    return wordCloud.map((w, i) => (
                      <span key={w.word}
                        className="font-black transition-all duration-300 hover:scale-125 cursor-pointer"
                        style={{ fontSize: `${w.size}px`, color: colors[i % colors.length], opacity: 0.6 + (w.size / 44) * 0.4 }}
                        title={`${w.word}: ${w.count} occurrences`}>
                        {w.word}
                      </span>
                    ));
                  })()
                )}
              </div>
              <p className="text-[10px] opacity-60 text-center mt-3">Word size = frequency • Hover to see exact count</p>
            </div>
          )}

          {insightTab === "emoji" && (
            <div className="anim-pop glass rounded-2xl p-5">
              <div className="flex flex-wrap gap-2 justify-center mb-4">
                {Object.keys(EMOJI_CATEGORIES).map(cat => (
                  <button key={cat} onClick={() => setSelectedEmojiCat(cat)}
                    className={`tab-btn px-3 py-1.5 rounded-lg text-xs font-bold capitalize glass-btn btn-shine ${selectedEmojiCat === cat ? "active" : ""}`}>
                    {cat}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-8 sm:grid-cols-12 md:grid-cols-16 gap-1 max-h-[320px] overflow-y-auto p-2 rounded-xl bg-white/20 dark:bg-black/20">
                {EMOJI_CATEGORIES[selectedEmojiCat].map((emoji, i) => (
                  <button key={`${emoji}-${i}`} onClick={() => insertAtCursor(emoji)}
                    className="text-2xl p-1.5 rounded-lg hover:bg-violet-500/30 hover:scale-125 transition-all btn-shine"
                    title={`Insert ${emoji}`}>
                    {emoji}
                  </button>
                ))}
              </div>
              <p className="text-[10px] opacity-60 text-center mt-3">Click any emoji to insert at cursor position</p>

              <div className="mt-5 glass-btn rounded-2xl p-4">
                <h4 className="font-bold text-sm mb-3">🔗 Transition Words Helper</h4>
                <div className="flex flex-wrap gap-2 mb-3">
                  {Object.keys(TRANSITIONS).map(cat => (
                    <button key={cat} onClick={() => setTransitionCat(cat)}
                      className={`px-3 py-1 rounded-lg text-[11px] font-bold capitalize transition ${transitionCat === cat ? "bg-gradient-to-r from-violet-600 to-pink-600 text-white" : "glass-btn"}`}>
                      {cat}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {TRANSITIONS[transitionCat].map(t => (
                    <button key={t} onClick={() => insertAtCursor(t + " ")}
                      className="text-xs px-3 py-1.5 rounded-full glass-btn font-bold btn-shine hover:scale-105 transition">
                      {t}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] opacity-60 mt-3">Click any word to insert at cursor • Improves flow and readability</p>
              </div>
            </div>
          )}

          {insightTab === "docs" && (
            <div className="anim-pop glass rounded-2xl p-5">
              <h3 className="font-bold text-sm mb-4">📁 Multi-Document Workspace</h3>

              <div className="flex flex-wrap gap-2 mb-4">
                <input value={docName} onChange={e => setDocName(e.target.value)}
                  placeholder="Document name (e.g. Blog Post 1)"
                  className="h-9 px-3 rounded-lg glass-btn text-sm flex-1 min-w-[200px]" />
                <button onClick={() => {
                  const name = docName.trim() || `Untitled ${documents.length + 1}`;
                  const doc: DocItem = { id: `d_${Date.now()}`, name, text, html, saved: Date.now() };
                  setDocuments(prev => [doc, ...prev.filter(d => d.name !== name)]);
                  setDocName("");
                  setToast(`✓ Saved "${name}"`);
                  setTimeout(() => setToast(null), 1500);
                }} className="px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-pink-600 text-white text-sm font-bold btn-shine">
                  💾 Save Current
                </button>
              </div>

              {documents.length === 0 ? (
                <p className="text-xs opacity-60 text-center py-8">No saved documents yet. Type something and click Save.</p>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {documents.map(doc => (
                    <div key={doc.id} className="glass-btn rounded-xl p-3 flex justify-between items-center gap-2 flex-wrap">
                      <div className="flex-1 min-w-[150px]">
                        <div className="font-bold text-sm">{doc.name}</div>
                        <div className="text-[10px] opacity-60">
                          {doc.text.split(/\s+/).filter(Boolean).length} words • Saved {new Date(doc.saved).toLocaleString()}
                        </div>
                      </div>
                      <div className="flex gap-1.5">
                        <button onClick={() => {
                          if (confirm(`Load "${doc.name}"? Current text will be replaced.`)) {
                            if (editorRef.current) editorRef.current.innerHTML = doc.html || escapeHtml(doc.text).replace(/\n/g, "<br>");
                            setHtml(doc.html);
                            setText(doc.text);
                            setToast(`✓ Loaded "${doc.name}"`);
                            setTimeout(() => setToast(null), 1500);
                          }
                        }} className="text-xs px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold btn-shine">
                          📂 Load
                        </button>
                        <button onClick={() => {
                          if (confirm(`Delete "${doc.name}"?`)) {
                            setDocuments(prev => prev.filter(d => d.id !== doc.id));
                            setToast("✓ Deleted");
                            setTimeout(() => setToast(null), 1200);
                          }
                        }} className="text-xs px-3 py-1.5 rounded-lg bg-red-500/20 text-red-700 dark:text-red-300 font-bold btn-shine">
                          🗑
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 grid grid-cols-2 gap-3">
                <MiniStat label="Saved Docs" value={documents.length} />
                <MiniStat label="Total Storage" value={`${(JSON.stringify(documents).length / 1024).toFixed(1)} KB`} />
              </div>
              <p className="text-[10px] opacity-60 mt-3">All documents stored locally in your browser. Nothing is uploaded.</p>
            </div>
          )}
        </section>

        {/* CONTENT TYPE TABLE */}
        <section className="mt-12">
          <h2 className="text-2xl sm:text-3xl font-black text-center gradient-text mb-2">📊 Word Count by Content Type</h2>
          <p className="text-center opacity-70 text-sm mb-6">Recommended word ranges for different writing formats</p>
          <div className="glass rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm">
                <thead><tr className="bg-gradient-to-r from-violet-600/20 to-pink-600/20"><th className="text-left p-3 font-bold">Content Type</th><th className="text-left p-3 font-bold">Recommended Range</th><th className="text-left p-3 font-bold hidden sm:table-cell">Ideal Count</th><th className="text-left p-3 font-bold hidden md:table-cell">Purpose</th></tr></thead>
                <tbody>{CONTENT_TYPES.map(c => (<tr key={c.name} className="border-t border-white/20 hover:bg-white/10 transition"><td className="p-3 font-bold">{c.icon} {c.name}</td><td className="p-3 opacity-80">{c.recommended}</td><td className="p-3 opacity-80 hidden sm:table-cell">{c.ideal.toLocaleString()}</td><td className="p-3 opacity-60 hidden md:table-cell">{c.purpose}</td></tr>))}</tbody>
              </table>
            </div>
          </div>
        </section>

        {/* SOCIAL MEDIA COUNTERS */}
        <section className="mt-12">
          <h2 className="text-2xl sm:text-3xl font-black text-center gradient-text mb-2">📱 Social Media Writing Counters</h2>
          <p className="text-center opacity-70 text-sm mb-6">Dedicated counters for each platform with recommended limits</p>
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {SOCIAL_PLATFORMS.map(s => (<button key={s.name} onClick={() => setActiveSocial(s.name)} className={`tab-btn px-3 py-2 rounded-xl text-xs font-bold glass-btn btn-shine ${activeSocial === s.name ? "active" : ""}`}>{s.icon} <span className="hidden sm:inline">{s.name}</span></button>))}
          </div>
          <div className="glass rounded-2xl p-4 anim-pop" key={activeSocial}>
            <div className="flex justify-between items-center mb-3"><h3 className="font-bold text-sm">{activeSocialData.icon} {activeSocialData.name}</h3><span className="text-[10px] opacity-60">{activeSocialData.hint}</span></div>
            <textarea value={socialText} onChange={e => setSocialText(e.target.value)} placeholder={`Type your ${activeSocialData.name.toLowerCase()}...`} className={`w-full min-h-[120px] p-3 rounded-xl ${isDark ? "bg-black/30" : "bg-white/60"} outline-none text-sm`} />
            <div className="mt-3 grid grid-cols-3 gap-3"><MiniStat label="Characters" value={socialStats.chars} /><MiniStat label="Words" value={socialStats.words} /><MiniStat label="Remaining" value={socialStats.remaining < 0 ? `Over ${Math.abs(socialStats.remaining)}` : socialStats.remaining} /></div>
            <div className="mt-3"><div className="flex justify-between text-[10px] opacity-60 mb-1"><span>Platform Limit ({activeSocialData.limit.toLocaleString()})</span><span>{socialStats.progressPct}%</span></div><div className="h-2 bg-white/40 dark:bg-white/10 rounded-full overflow-hidden"><div className="h-full transition-all duration-500 progress-bar" style={{ width: `${socialStats.progressPct}%`, background: socialStats.remaining < 0 ? "linear-gradient(90deg,#ef4444,#dc2626)" : socialStats.progressPct > 80 ? "linear-gradient(90deg,#f59e0b,#eab308)" : "linear-gradient(90deg,#a855f7,#ec4899)" }} /></div></div>
            <div className="mt-2"><div className="flex justify-between text-[10px] opacity-60 mb-1"><span>Recommended ({activeSocialData.recommended.toLocaleString()})</span><span>{socialStats.recommendedPct}%</span></div><div className="h-1.5 bg-white/40 dark:bg-white/10 rounded-full overflow-hidden"><div className="h-full transition-all duration-500" style={{ width: `${Math.min(100, socialStats.recommendedPct)}%`, background: socialStats.recommendedPct > 100 ? "#10b981" : "linear-gradient(90deg,#06b6d4,#3b82f6)" }} /></div></div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(socialText.slice(0, 280))}`, "_blank")} className="text-xs px-3 py-1.5 rounded-full glass-btn font-bold btn-shine">🐦 Share</button>
              <button onClick={() => { navigator.clipboard.writeText(socialText); setToast("✓ Copied"); setTimeout(() => setToast(null), 1500); }} className="text-xs px-3 py-1.5 rounded-full glass-btn font-bold btn-shine">📋 Copy</button>
            </div>
          </div>
        </section>

        {/* WHAT IS WORD COUNTER */}
        <section className="mt-12">
          <h2 className="text-2xl sm:text-3xl font-black text-center gradient-text mb-2">📖 What Is a Word Counter?</h2>
          <p className="text-center opacity-70 text-sm mb-6">Complete explanation of what word counters are and why they matter</p>
          <div className="glass rounded-2xl p-6">
            <div className="space-y-4 text-sm leading-relaxed">
              <div><h3 className="font-bold text-base mb-2">Definition</h3><p className="opacity-80">A <b>word counter</b> is a software tool that analyzes written text and reports quantitative statistics — word count, character count, sentence count, paragraph count, reading time, and readability metrics. It processes text in real-time as you type or paste, offering immediate feedback without requiring any manual counting.</p></div>
              <div><h3 className="font-bold text-base mb-2">Why Word Counting Matters</h3><p className="opacity-80">Word counts are foundational to almost every professional writing context. Academic institutions enforce strict word limits on essays and theses. Content marketers must hit target lengths for SEO ranking. Social media platforms cap characters. Journalists work within column inches.</p></div>
              <div className="grid md:grid-cols-2 gap-4 pt-2">
                {[{ title: "🎓 Students", desc: "Meet exact word limits on essays, assignments, and dissertations. Track progress toward minimum word counts." },{ title: "✍️ Writers", desc: "Track daily word goals (like 1,000 or 2,000 words/day). Monitor writing time and productivity." },{ title: "📝 Bloggers", desc: "Hit recommended 1,500-2,500 word ranges for SEO. Check keyword density (1-2% ideal)." },{ title: "🔍 SEO Professionals", desc: "Analyze keyword density. Verify content length against competitor benchmarks." },{ title: "📰 Journalists", desc: "Respect strict editorial word limits. Ensure leads fit character budgets." },{ title: "📱 Social Media Creators", desc: "Stay within platform character limits. Optimize hooks to visible character counts." },{ title: "💼 Business Professionals", desc: "Keep emails concise. Structure product descriptions for conversion." }].map((item, i) => (
                  <div key={i} className="glass-btn rounded-xl p-3"><h4 className="font-bold text-sm mb-1">{item.title}</h4><p className="text-xs opacity-70 leading-relaxed">{item.desc}</p></div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* OTHER TOOLS GRID */}
        <section className="mt-12">
          <h2 className="text-2xl sm:text-3xl font-black text-center gradient-text mb-2">🧰 Other Useful Tools</h2>
          <p className="text-center opacity-70 text-sm mb-6">Complete toolkit for writers, students, and SEO professionals</p>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {otherTools.map(t => (
              <a key={t.name} href={t.link} className="glass rounded-2xl p-5 hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer group btn-shine">
                <div className="text-4xl mb-2">{t.icon}</div>
                <h3 className="font-bold text-sm mb-1 group-hover:text-violet-600 transition">{t.name}</h3>
                <p className="text-xs opacity-60 leading-relaxed">{t.desc}</p>
              </a>
            ))}
          </div>
        </section>

        {/* ARTICLES (ACCORDION) */}
        <section className="mt-12 space-y-4">
          <h2 className="text-2xl sm:text-3xl font-black text-center gradient-text mb-6">📚 Guides & Documentation</h2>
          {articlesData.map(a => (
            <div key={a.id} className="glass rounded-2xl overflow-hidden">
              <button onClick={() => setShowArticle(showArticle === a.id ? null : a.id)} className="w-full flex justify-between items-center p-4 sm:p-5 font-bold text-left hover:bg-white/10 transition-all btn-shine">
                <span className="text-sm sm:text-base pr-2">{a.title}</span>
                <span className="text-2xl transition-transform duration-300" style={{ transform: showArticle === a.id ? "rotate(180deg)" : "rotate(0)" }}>{showArticle === a.id ? "−" : "+"}</span>
              </button>
              <div className={`accordion-content ${showArticle === a.id ? "open" : ""}`}>
                <div className={`p-4 sm:p-6 ${isDark ? "bg-black/20" : "bg-white/40"} text-xs sm:text-sm leading-7 whitespace-pre-line border-t border-white/20`}>{a.content}</div>
              </div>
            </div>
          ))}
        </section>

        {/* FAQ */}
        <section className="mt-12">
          <h2 className="text-2xl sm:text-3xl font-black text-center gradient-text mb-2">❓ Frequently Asked Questions</h2>
          <p className="text-center opacity-70 text-sm mb-6">Common questions about our Word Counter tool</p>
          <div className="grid md:grid-cols-2 gap-3">
            {faqData.map((f, i) => (
              <div key={i} className="glass rounded-2xl overflow-hidden">
                <button onClick={() => setShowArticle(showArticle === `faq-${i}` ? null : `faq-${i}`)} className="w-full flex justify-between items-center p-4 font-bold text-left text-sm hover:bg-white/10 transition-all btn-shine">
                  <span>{f.q}</span>
                  <span className="text-lg ml-2 flex-shrink-0 transition-transform duration-300" style={{ transform: showArticle === `faq-${i}` ? "rotate(45deg)" : "rotate(0)" }}>+</span>
                </button>
                <div className={`accordion-content ${showArticle === `faq-${i}` ? "open" : ""}`}>
                  <div className="px-4 pb-4 text-xs leading-6 opacity-80">{f.a}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <footer className="mt-16 text-center text-xs opacity-60 pb-8">
          <p>✨ Word Counter Pro v10.1 — 100% private, browser-only, no data sent to server</p>
          <p className="mt-1">Made with 💜 for writers, students, and SEO professionals</p>
        </footer>
      </div>
    </div>
  );
}

// ============ SUB COMPONENTS ============
function Stat({ label, value, tip }: { label: string; value: any; tip?: string }) {
  return (
    <div className="glass rounded-2xl p-3 sm:p-4 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5" title={tip}>
      <div className="text-[10px] uppercase tracking-widest opacity-60 font-bold">{label}</div>
      <div className="text-base sm:text-lg font-black mt-1">{value}</div>
      {tip && <div className="text-[9px] opacity-40 mt-1">{tip}</div>}
    </div>
  );
}

function MiniStat({ label, value, extra }: { label: string; value: any; extra?: string }) {
  return (
    <div className="glass-btn rounded-xl p-3 text-center">
      <div className="text-[10px] uppercase opacity-60 font-bold">{label}</div>
      <div className="text-base font-black mt-1">{typeof value === "number" ? <AnimatedCounter value={value} /> : value}</div>
      {extra && <div className="text-[9px] opacity-50 mt-0.5">{extra}</div>}
    </div>
  );
}

// ============ DATA ============
const otherTools = [
  { icon: "🔤", name: "Case Converter", desc: "Convert text to UPPER, lower, Title, or Sentence case instantly", link: "#" },
  { icon: "📄", name: "Lorem Ipsum Generator", desc: "Generate dummy placeholder text for designs and mockups", link: "#" },
  { icon: "✅", name: "Grammar Checker", desc: "Fix grammar, spelling, and punctuation errors in your writing", link: "#" },
  { icon: "🔄", name: "Paraphrasing Tool", desc: "Rewrite sentences and paragraphs in your own words", link: "#" },
  { icon: "📊", name: "Readability Checker", desc: "Check Flesch score, grade level, and reading ease", link: "#" },
  { icon: "🔍", name: "Plagiarism Checker", desc: "Scan your content for copied or duplicate text", link: "#" },
  { icon: "🔡", name: "Character Counter", desc: "Count characters with/without spaces for social media", link: "#" },
  { icon: "🔄", name: "Reverse Text", desc: "Flip text backwards or upside down instantly", link: "#" },
  { icon: "🆚", name: "Text Diff", desc: "Compare two texts and highlight differences", link: "#" },
  { icon: "{}", name: "JSON Formatter", desc: "Beautify, minify, and validate JSON data", link: "#" },
  { icon: "🔐", name: "Base64 Encoder", desc: "Encode and decode Base64 text or files", link: "#" },
  { icon: "🔗", name: "URL Encoder", desc: "Encode URLs and query strings safely", link: "#" },
];

const articlesData = [
  {
    id: "what-is",
    title: "📖 What is Word Counter? Complete Guide",
    content: `A Word Counter is a digital tool that analyzes written text and provides instant statistics — word count, character count, sentence count, paragraph count, reading time, and more.

━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHY YOU NEED IT
━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Students — Meet strict essay word limits (500/1000/2000)
• Bloggers — SEO-friendly content length 1500-2500 words
• Social Media — Twitter 280, Instagram 2200, LinkedIn 3000 chars
• Authors — Track daily word goals (2000/day)
• Translators — Bill accurately by word count
• SEO Pros — Keyword density 1-2% ideal

━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHAT IT MEASURES
━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Words, Chars (with/without spaces)
• Sentences, Paragraphs, Lines
• Reading Time (configurable WPM)
• Speaking Time (configurable WPM)
• Writing Time (active only)
• Flesch Score (0-100 readability)
• Keyword Density (top 10)

━━━━━━━━━━━━━━━━━━━━━━━━━━━
FLESCH READING EASE SCALE
━━━━━━━━━━━━━━━━━━━━━━━━━━━
90-100: Very Easy (5th grade)
80-90: Easy (6th grade)
70-80: Fairly Easy (7th grade)
60-70: Standard (8th-9th grade) ← aim here for web
50-60: Fairly Difficult (10-12th)
30-50: Difficult (college)
0-30: Very Difficult (graduate)

━━━━━━━━━━━━━━━━━━━━━━━━━━━
PRIVACY
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Everything runs in-browser. Auto-save uses localStorage. Only "Grammar Check" sends to LanguageTool API.`
  },
  {
    id: "what-is-detail",
    title: "📖 What Is a Word Counter? — Complete In-Depth Guide (History, Uses, Benefits, SEO, Academic, Business)",
    content: `A complete guide to understanding word counters, their history, purpose, benefits, and every profession that relies on them.

═══════════════════════════════════════════════════
1. WHAT IS A WORD COUNTER — DEFINITION
═══════════════════════════════════════════════════
A word counter is a text-analysis tool that instantly measures how many
words, characters, sentences, paragraphs, and lines are present in a
given piece of writing. It runs as you type or after you paste text,
and typically produces additional statistics such as:
  • Characters with spaces / without spaces
  • Reading time (in minutes and seconds)
  • Speaking time
  • Readability scores (Flesch, Flesch-Kincaid, Gunning Fog)
  • Keyword density and top keywords
  • Passive voice, filler words, adverb frequency

Modern word counters run entirely in your browser, meaning no text is
uploaded anywhere and privacy is fully preserved.

═══════════════════════════════════════════════════
2. BRIEF HISTORY
═══════════════════════════════════════════════════
Before computers, word counts were done manually — copy editors would
literally count words on a page using a ruler, a technique still called
"casting off." It was slow, expensive, and error-prone.

When word processors arrived in the 1980s (WordPerfect, Microsoft Word),
word count became a single command. In the 2000s, web-based counters
appeared (WordCountTool, WordCounter.net). Today, modern tools like this
one add readability scoring, keyword density, grammar checking, AI
insights, tone detection, and per-platform character tracking — all
client-side.

═══════════════════════════════════════════════════
3. WHY WORD COUNT MATTERS — THE CORE USE CASES
═══════════════════════════════════════════════════

▸ Publishers and editors
  Every magazine, newspaper, and online publication has strict column
  inches and word budgets. A 700-word feature is not a 750-word feature
  — the layout physically cannot fit it. Editors rely on exact counts.

▸ Search Engine Optimization (SEO)
  Google rewards comprehensive content. Studies show pages ranking on
  page one average 1,400-2,500 words. Bloggers use word counters to
  reach this range without bloat. Under 300 words often looks thin to
  Google. Over 3,000 words is fine if the topic genuinely requires it.

▸ Academic writing
  Assignments carry word limits — usually ±10% tolerance. A 1,500-word
  essay that comes in at 1,900 words gets penalised. A 500-word essay
  that comes in at 380 words looks underdeveloped. Counter + progress
  bar keeps students accurate without last-minute panic.

▸ Social media
  Platform character limits are hard ceilings:
    • X / Twitter post .......... 280 chars
    • Instagram caption ......... 2,200 chars
    • LinkedIn post ............. 3,000 chars
    • YouTube title ............. 100 chars
  Going over a limit truncates the post or blocks publishing. A live
  per-platform counter removes the guesswork.

▸ Advertising and copywriting
  Google Ads headlines are 30 characters each. Meta descriptions are
  ~155. Product titles on Amazon cap at 200. PPC managers live inside
  character counters.

▸ Freelance and translation work
  Many freelancers bill by the word. Translators price per 1,000 words.
  A reliable counter is directly tied to income.

▸ Voice-over and video
  Script length determines video duration. At a typical speaking rate
  of 130-150 words per minute, a 3-minute video needs ~400 words.

═══════════════════════════════════════════════════
4. WHO BENEFITS MOST — IN DETAIL
═══════════════════════════════════════════════════

🎓 STUDENTS
  • Meet exact word limits on essays, dissertations, abstracts
  • Check that assignments hit minimum word requirements
  • Track daily writing progress for long projects
  • Verify citations fit within allowed character budgets

✍️ AUTHORS & NOVELISTS
  • Track daily word targets (e.g., NaNoWriMo's 1,667 words/day)
  • Monitor writing time and words-per-minute
  • Estimate page count from word count for submissions
  • Check chapter balance across a manuscript

📝 BLOGGERS & CONTENT WRITERS
  • Hit SEO-recommended 1,500-2,500 word range
  • Check keyword density (1-2% ideal, above 3% looks like stuffing)
  • Verify readability (Flesch 60-70 for general web)
  • Prevent overly long paragraphs that hurt mobile UX

🔍 SEO PROFESSIONALS
  • Compare content length against top-ranking competitors
  • Match title tags (50-60 chars) and meta descriptions (150-160)
  • Audit existing pages for thin content
  • Estimate pixel width of titles before publishing

📱 SOCIAL MEDIA MANAGERS
  • Stay inside platform character limits
  • Optimise the visible "hook" to first 125 chars (Instagram)
  • Prepare multi-platform variants of the same message
  • Track emoji usage across campaigns

📰 JOURNALISTS & EDITORS
  • Enforce strict editorial word limits per section
  • Fit articles to pre-planned column inches
  • Meet wire-service word budgets
  • Cut copy quickly using find/replace and duplicate detection

💼 BUSINESS & MARKETING
  • Write concise emails (studies show shorter emails get more replies)
  • Structure product descriptions for conversion
  • Prepare landing-page copy to prescribed length
  • Meet pitch-deck slide word limits

🎬 VIDEO CREATORS & PODCASTERS
  • Script a video to precise duration using WPM estimates
  • Read time check for teleprompter sessions
  • Ensure YouTube titles fit mobile display (~60 chars)

🌐 TRANSLATORS & LOCALISATION
  • Bill accurately by source word count
  • Estimate turnaround time
  • Ensure UI strings fit character budgets in translated apps

═══════════════════════════════════════════════════
5. HOW THIS TOOL IS DIFFERENT — WHAT YOU GET HERE
═══════════════════════════════════════════════════
▸ Real-time statistics (updates every keystroke)
▸ Unicode-correct counting — Hindi, Arabic, Japanese, emoji all counted right
▸ Reading AND speaking time — both configurable
▸ Readability scores — Flesch, Flesch-Kincaid, Gunning Fog
▸ Keyword density — one-word, two-word, three-word phrases
▸ Social media counters — 6 platforms, dual progress bars
▸ Grammar check — LanguageTool API, 30+ languages
▸ AI Insights — tone, sentiment, passive voice, adverb density, TTR
▸ Visual Analytics — donut chart, histogram, top-words bar chart
▸ Word Cloud — 4 palettes
▸ Emoji Picker — 400+ emojis, 8 categories
▸ Multi-document workspace — save/load/delete
▸ Rich-text formatting — bold, italic, headings, colors, lists
▸ Duplicate detection — words, sentences, lines
▸ Full import/export — TXT, HTML, DOC, CSV, PDF
▸ 100% private — nothing leaves your browser except grammar check

═══════════════════════════════════════════════════
6. HOW WORD COUNT IS CALCULATED — THE TECHNICAL SIDE
═══════════════════════════════════════════════════
A "word" is technically a contiguous run of characters separated by
whitespace (space, tab, newline). But different tools interpret this
differently:

  • Some split on spaces only → "well-known" counts as one word
  • Some strip punctuation → "hello!" counts as "hello"
  • Some handle CJK scripts specially → 日本語 splits by character
  • Some count hyphenated words as one; others as two

This tool uses a Unicode-aware regular expression that:
  • Groups letters, numbers, and combining marks
  • Allows internal hyphens and apostrophes ("mother-in-law", "don't")
  • Correctly segments Devanagari (Hindi) and other Indic scripts
  • Counts emojis as grapheme clusters (1 emoji = 1 unit)

That's why our counts can differ slightly from other tools — and why
ours are more accurate for non-English and emoji-heavy text.

═══════════════════════════════════════════════════
7. PRACTICAL WORKFLOWS — HOW TO USE THIS TOOL
═══════════════════════════════════════════════════

📄 ESSAY WRITING
  1. Set academic target in Academic Tools (e.g., 1,500 words)
  2. Write freely — watch the progress bar fill
  3. Check Flesch score stays in 40-60 range (academic standard)
  4. Use Text Quality Analyzer to catch filler words
  5. Export as DOC or PDF for submission

📱 SOCIAL POST
  1. Open Social Media Writing Counters
  2. Pick platform (X / Instagram / LinkedIn)
  3. Type — see remaining characters update live
  4. Check the "recommended" bar too (not just the limit)
  5. Copy and paste directly into the platform

🔍 BLOG POST
  1. Set goal to 2,000 words
  2. Write with AI Insights open — check Tone stays "Neutral" or "Formal"
  3. Monitor readability (aim for Flesch 60-70)
  4. Check keyword density in sidebar — keep top keyword at 1-2%
  5. Save draft in Multi-Document Workspace for later

📝 EDITING PASS
  1. Use Duplicate Detection to catch repeated sentences
  2. Use Find & Replace to fix consistent typos
  3. Use Text Cleaner to remove extra spaces and blank lines
  4. Check passive voice in AI Insights — aim below 10%

═══════════════════════════════════════════════════
8. COMMON MISCONCEPTIONS
═══════════════════════════════════════════════════
✗ "Longer is always better for SEO" — quality + intent match matters more
✗ "Spaces don't count as characters" — they do on most platforms
✗ "Word count = reading time" — depends on WPM (150-300 varies widely)
✗ "All word counters show the same number" — they use different rules
✗ "Hindi characters count as many" — grapheme segmentation counts them right

═══════════════════════════════════════════════════
9. QUICK REFERENCE — AVERAGE STATISTICS
═══════════════════════════════════════════════════
• Average word length (English) ......... 4.7 characters
• Average sentence length (web) ......... 14-20 words
• Average sentence length (academic) .... 22-28 words
• Average paragraph length (web) ........ 40-80 words
• Reading speed (silent, adult) .......... 200-250 WPM
• Speaking speed (presentation) .......... 100-150 WPM
• Blog post ideal length ................. 1,500-2,500 words
• Homepage ideal length .................. 400-800 words
• Product page ideal length .............. 200-500 words
• Meta title max ......................... 50-60 chars / ~600px
• Meta description max ................... 150-160 chars

═══════════════════════════════════════════════════
10. BOTTOM LINE
═══════════════════════════════════════════════════
A word counter is not just a counter — it's a writing coach, an SEO
assistant, a social media safeguard, an academic referee, and a
productivity tracker all rolled into one. Whether you're a student
trying to hit 1,500 words, a marketer squeezing a message into 280
characters, or a novelist tracking daily output, the right tool saves
time, prevents mistakes, and improves the quality of everything you
write.`
  },
  {
    id: "user-guide",
    title: "📘 Complete User Guide — Every Feature Step-by-Step (v10.1)",
    content: `═══════════════════════════════
STEP 1 — START WRITING
═══════════════════════════════
Click the big editor box. Type freely. Stats update every keystroke. Text auto-saves every 400ms ("Saved ✓" in header).

═══════════════════════════════
STEP 2 — RICH TEXT FORMATTING TOOLBAR
═══════════════════════════════
Toggle "▲ Hide Format Bar" / "▼ Show Format Bar" at top-left of toolbar row 1.

Available buttons (second toolbar row):
▸ B (Bold) — Ctrl+B
▸ I (Italic) — Ctrl+I
▸ U (Underline) — Ctrl+U
▸ S (Strikethrough) — Ctrl+Shift+S
▸ X² (Superscript) — small raised text
▸ X₂ (Subscript) — small lowered text
▸ Heading ▾ — H1, H2, H3, H4, H5, H6, Paragraph
▸ A (Text Color) — custom picker + 10 preset swatches
▸ H (Background Highlight) — custom picker + 8 preset swatches + Remove
▸ Font ▾ — 14 fonts; applies to selection only
▸ • / 1. — Bullet / Numbered lists
▸ ⇤ ⇥ — Outdent / Indent
▸ ⬅ ↔ ➡ ≡ — Left / Center / Right / Justify
▸ 🔗 — Insert Link (Ctrl+K) with URL prompt
▸ ― — Horizontal Rule (full-width separator)
▸ │ — Vertical Rule (inline separator)
▸ </> — Code Block (monospace pre-formatted)
▸ ❝ — Blockquote
▸ Tx — Clear formatting on selection
▸ ↶ ↷ — Undo / Redo
▸ Aa Case ▾ — UPPER / lower / Title / Sentence / Capitalize Each Word / Toggle Case

EXAMPLE — Apply red color to a word:
1. Type "Hello World Test"
2. Select "World" with mouse
3. Click the A ▾ button in formatting toolbar
4. Choose red (#ef4444)
5. ONLY "World" turns red — rest untouched ✅

═══════════════════════════════
STEP 3 — EDIT OPERATIONS (Toolbar Row 1)
═══════════════════════════════
▸ ✂ Cut — Remove selection to clipboard
▸ 📋 Copy — Copies selection, or all text if none selected
▸ 📥 Paste — Insert clipboard at cursor
▸ ⌫ Backspace — Delete char before cursor
▸ ⌦ Delete — Delete char after cursor
▸ 🗑 Clear — Wipe everything (with confirmation)

═══════════════════════════════
STEP 4 — SOCIAL SHARE
═══════════════════════════════
Click "🔗 Share ▾" button in toolbar row 1. Menu shows:
▸ 🐦 Twitter / X
▸ 👥 Facebook
▸ 💬 WhatsApp
▸ 💼 LinkedIn
▸ ✈️ Telegram
▸ ✉️ Email
▸ 📋 Copy Text
▸ 📱 Native Share (Android/iOS)

═══════════════════════════════
STEP 5 — SETTINGS PANEL
═══════════════════════════════
Click ⚙ Settings:
▸ Page Size — A4, Letter, Legal
▸ Editor Font — 14 options
▸ Font Size — 10-32 px slider
▸ Line Height — 1.0 - 2.5 slider
▸ Auto Correct — toggle
▸ Auto Complete (Tab) — toggle
▸ Show Red Wavy — toggle
▸ Duplicate Highlight — toggle
▸ Reading Speed — slow/average/fast/custom
▸ Custom WPM — 50-1000
▸ Speaking WPM — 50-300

═══════════════════════════════
STEP 6 — WORD GOAL
═══════════════════════════════
Change the number in header to any target. On reaching goal: toast + sound + confetti.

═══════════════════════════════
STEP 7 — GRAMMAR CHECK
═══════════════════════════════
Auto-checks 1.5s after you stop typing. Or click "✓ Grammar Check". Red wavy underlines in preview.

═══════════════════════════════
STEP 8 — VOICE TYPING
═══════════════════════════════
Click 🎤 VOICE. Chrome/Edge + HTTPS required.

═══════════════════════════════
STEP 9 — TEXT TO SPEECH
═══════════════════════════════
Click 🔊 to hear text read aloud.

═══════════════════════════════
STEP 10 — FIND & REPLACE
═══════════════════════════════
Ctrl+F or click 🔍 Find.

═══════════════════════════════
STEP 11 — WRITING TOOLS HUB
═══════════════════════════════
4 animated tabs: Suggested Tools, Writing Tools, Academic Tools, Quality Analyzer.

═══════════════════════════════
STEP 12 — v10 AI INSIGHTS HUB
═══════════════════════════════
6 sub-tabs: AI Insights, Session Dashboard, Visual Analytics, Word Cloud, Emoji Picker, Documents.

═══════════════════════════════
KEYBOARD SHORTCUTS
═══════════════════════════════
Ctrl+B/I/U — Bold/Italic/Underline
Ctrl+Shift+S — Strikethrough
Ctrl+K — Insert Link
Ctrl+Z / Ctrl+Y — Undo / Redo
Ctrl+F — Find & Replace
Ctrl+S — Force Save
Ctrl+Shift+7 — Numbered List
Ctrl+Shift+8 — Bullet List
Tab — Accept autocomplete
Esc — Close popups`
  },
  {
    id: "features",
    title: "⚙️ Every Feature Explained (v10.1)",
    content: `📊 REAL-TIME STATISTICS
10 metrics update every keystroke.

💾 AUTO-SAVE
Every 400ms saves to localStorage.

✍️ AUTO-CORRECT
Silently fixes 20+ common typos.

💡 AUTO-COMPLETE
300-word dictionary, Tab to accept.

🔴 GRAMMAR CHECK (LanguageTool)
30+ languages, red wavy underlines.

🎨 TEXT COLOR (selection only)
Custom picker OR 10 preset swatches.

🖍️ BACKGROUND HIGHLIGHT
8 pastel presets + custom picker.

🔤 FONT FAMILY ON SELECTION
14 fonts: Inter, Poppins, Roboto, Merriweather, Playfair Display, Lora, Georgia, Times New Roman, Arial, Verdana, JetBrains Mono, Fira Code, Roboto Mono, Courier New.

📐 HEADINGS H1-H6

🔗 INSERT LINK
Ctrl+K OR click 🔗.

➖ HORIZONTAL RULE / │ VERTICAL RULE

</> CODE BLOCK

❝ BLOCKQUOTE

X² / X₂ SUPERSCRIPT / SUBSCRIPT

🔗 SOCIAL SHARE MENU
Twitter, Facebook, WhatsApp, LinkedIn, Telegram, Email, Copy, Native.

🔁 DUPLICATE DETECTION
Words, sentences, lines.

🎯 WORD TARGET
Progress bar + confetti.

⏱ WRITING TIME
Active typing only.

📈 READABILITY
Flesch Reading Ease 0-100.

📊 KEYWORD DENSITY
Top 10 words + percentage.

📱 SOCIAL MEDIA LIMITS (Live sidebar)

📱 SOCIAL WRITING COUNTERS (dedicated section)
6 platforms with dual progress bars.

🎤 VOICE TYPING

🔊 TEXT TO SPEECH

🔍 FIND & REPLACE

📤 EXPORT — TXT, HTML, DOC, CSV, PDF

🌙 DARK MODE / ⛶ FOCUS MODE

🎓 ACADEMIC TOOLS
Word limit tracker, paragraph analyzer.

📊 QUALITY ANALYZER
9 rule-based checks.

🧰 40+ WRITING TOOLS

═══════════════════════════════
v10 NEW FEATURES
═══════════════════════════════

🧠 AI WRITING INSIGHTS
Tone, Sentiment, Passive Voice, Adverb Density, Vocabulary Richness (TTR), Sentence Variety, Cliches.

⏱ SESSION DASHBOARD
Real-time WPM, session timer, words-typed counter, milestone tracking.

📊 VISUAL ANALYTICS
SVG donut chart, sentence histogram, top-15 word bar chart.

☁️ WORD CLOUD
4 palettes, size by frequency, hover tooltips.

😀 EMOJI & TRANSITION PICKER
400+ emojis, 8 categories, 8 transition-word categories.

📁 MULTI-DOCUMENT WORKSPACE
Save/load/delete named docs in localStorage.

═══════════════════════════════
v10.1 FIXES
═══════════════════════════════
✅ Bold / Italic / Underline / Strikethrough now work properly
✅ Duplicate line removal now reliably updates the editor
✅ New deep-dive article added to Guides section`
  },
];

const faqData = [
  { q: "Is this Word Counter free to use?", a: "Yes! 100% free forever. No sign-up, no ads, no limits." },
  { q: "Is my text saved on your servers?", a: "No. Everything runs in your browser. Only Grammar Check sends text to LanguageTool API. Auto-save uses localStorage." },
  { q: "How do I apply color to only SOME text?", a: "Select the text with your mouse, then click the A ▾ (text color) or H ▾ (highlight) button in the formatting toolbar. Only the selection changes color." },
  { q: "Difference between Chars (with) and Chars (without)?", a: "Chars (with) includes spaces — used for Twitter 280 and SMS limits. Chars (without) is letters/numbers only." },
  { q: "How accurate is reading time?", a: "Based on configurable words-per-minute. Default is 200 wpm." },
  { q: "What is a good Flesch Score?", a: "Web content: 60-70. Social media: 70-80. Academic: 30-50." },
  { q: "Why doesn't voice typing work?", a: "Requires Chrome or Edge over HTTPS. Check mic permission." },
  { q: "What is ideal keyword density?", a: "1-2% for SEO. Above 3% looks like keyword stuffing." },
  { q: "Does grammar check work in Hindi?", a: "Yes! Select Hindi from the language dropdown. LanguageTool supports 30+ languages." },
  { q: "Can I use this offline?", a: "Mostly yes. Grammar check needs internet." },
  { q: "What is duplicate detection?", a: "Finds repeated words, sentences, and lines." },
  { q: "How does auto-correct work?", a: "Watches 20+ common typos. Silently fixes on space." },
  { q: "What's the maximum text length?", a: "Practically unlimited. Tested with 100,000+ words." },
  { q: "How does the academic word limit tracker work?", a: "Set your required word count. Tracker shows Required, Current, Remaining, and progress bar." },
  { q: "What is the Text Quality Analyzer?", a: "Rule-based check for repeated words/sentences, long sentences, filler words, weak phrases, excessive punctuation, multiple spaces, ALL CAPS." },
  { q: "How do I insert a link on selected text?", a: "Select the text, press Ctrl+K (or click 🔗), paste URL, click OK." },
  { q: "What is a vertical rule used for?", a: "Inline vertical separator. Useful for dual-column layouts." },
  { q: "How do I remove text color or highlight?", a: "For highlight: click H ▾ → Remove Highlight. For text color: click Tx (clear formatting)." },
  { q: "How does social share work?", a: "Click '🔗 Share ▾'. Each opens platform share page with text pre-filled." },
  { q: "Can I customize reading and speaking speed?", a: "Yes. Open ⚙ Settings → Reading Speed section." },
  { q: "Are the animations performance-heavy?", a: "No. Uses CSS transforms and requestAnimationFrame." },
  { q: "Is the design responsive?", a: "Yes — fully responsive across mobile (320px+), tablet, laptop, desktop, and 4K." },
  { q: "What is AI Writing Insights?", a: "Client-side analysis of writing tone, sentiment, passive voice, adverb density, vocabulary richness (TTR), sentence variety, and cliche detection." },
  { q: "What is the Session Dashboard?", a: "Tracks your live writing WPM, session duration, and words typed." },
  { q: "What is the Word Cloud?", a: "Visual representation of your most-used words. Size scales with frequency." },
  { q: "What is the Multi-Document Workspace?", a: "Save, load, and delete named documents in localStorage." },
  { q: "What is the Emoji Picker?", a: "Click any emoji to insert at cursor. 400+ emojis across 8 categories." },
  { q: "What are the Visual Analytics?", a: "SVG donut chart, sentence-length histogram, and top-15 word bar chart." },
  { q: "Why weren't Bold / Italic working before?", a: "The toolbar button was stealing editor focus on mousedown, so the selection was lost. Now fixed — the selection is preserved and formatting applies correctly." },
  { q: "Why weren't duplicate lines being removed?", a: "The old code used innerText setter which sometimes fails on multi-line text in certain browsers. Now the editor uses direct HTML injection, so duplicate removal works reliably." },
];
