"use client";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

// --- MULTILINGUAL DATA - 35+ GLOBAL LANGUAGES ---
const LANGUAGES: any = {
  english: {
    label: "English 🇺🇸", flag: "🇺🇸", speechCode: "en-US",
    fonts: [
      { name: "Caveat", css: "'Caveat', cursive" },
      { name: "Patrick Hand", css: "'Patrick Hand', cursive" },
      { name: "Homemade Apple", css: "'Homemade Apple', cursive" },
      { name: "Shadows Into Light", css: "'Shadows Into Light', cursive" },
      { name: "Indie Flower", css: "'Indie Flower', cursive" },
      { name: "Dancing Script", css: "'Dancing Script', cursive" },
      { name: "Great Vibes", css: "'Great Vibes', cursive" },
      { name: "Sacramento", css: "'Sacramento', cursive" },
    ],
    sample: "Hello friends! This is my handwritten note.\nI created it in just one second using AI-powered handwriting generation."
  },
  hindi: {
    label: "Hindi 🇮🇳 हिन्दी", flag: "🇮🇳", speechCode: "hi-IN",
    fonts: [
      { name: "Kalam", css: "'Kalam', cursive" },
      { name: "Tiro Devanagari Hindi", css: "'Tiro Devanagari Hindi', serif" },
      { name: "Baloo 2", css: "'Baloo 2', cursive" },
      { name: "Hind", css: "'Hind', sans-serif" },
      { name: "Poppins Devanagari", css: "'Poppins', sans-serif" },
    ],
    sample: "नमस्ते दोस्तों! यह मेरी हस्तलिखित नोट है।\nमैंने इसे एक सेकंड में बनाया।"
  },
  bengali: {
    label: "Bengali 🇧🇩 বাংলা", flag: "🇧🇩", speechCode: "bn-IN",
    fonts: [
      { name: "Hind Siliguri", css: "'Hind Siliguri', sans-serif" },
      { name: "Baloo Da 2", css: "'Baloo Da 2', cursive" },
      { name: "Atma", css: "'Atma', cursive" },
    ],
    sample: "হ্যালো বন্ধুরা! এটি আমার হাতে লেখা নোট।"
  },
  tamil: {
    label: "Tamil 🇮🇳 தமிழ்", flag: "🇮🇳", speechCode: "ta-IN",
    fonts: [
      { name: "Baloo Thambi 2", css: "'Baloo Thambi 2', cursive" },
      { name: "Hind Madurai", css: "'Hind Madurai', sans-serif" },
      { name: "Catamaran", css: "'Catamaran', sans-serif" },
    ],
    sample: "வணக்கம் நண்பர்களே! இது என் கையெழுத்து குறிப்பு."
  },
  telugu: {
    label: "Telugu 🇮🇳 తెలుగు", flag: "🇮🇳", speechCode: "te-IN",
    fonts: [
      { name: "Baloo Tammudu 2", css: "'Baloo Tammudu 2', cursive" },
      { name: "Hind Guntur", css: "'Hind Guntur', sans-serif" },
      { name: "Mandali", css: "'Mandali', sans-serif" },
    ],
    sample: "హలో స్నేహితులారా! ఇది నా చేతివ్రాత నోట్."
  },
  marathi: {
    label: "Marathi 🇮🇳 मराठी", flag: "🇮🇳", speechCode: "mr-IN",
    fonts: [
      { name: "Kalam", css: "'Kalam', cursive" },
      { name: "Baloo 2", css: "'Baloo 2', cursive" },
      { name: "Mukta", css: "'Mukta', sans-serif" },
    ],
    sample: "नमस्कार मित्रांनो! ही माझी हस्तलिखित टीप आहे."
  },
  gujarati: {
    label: "Gujarati 🇮🇳 ગુજરાતી", flag: "🇮🇳", speechCode: "gu-IN",
    fonts: [
      { name: "Hind Vadodara", css: "'Hind Vadodara', sans-serif" },
      { name: "Baloo Bhai 2", css: "'Baloo Bhai 2', cursive" },
    ],
    sample: "નમસ્તે મિત્રો! આ મારી હસ્તલિખિત નોંધ છે."
  },
  punjabi: {
    label: "Punjabi 🇮🇳 ਪੰਜਾਬੀ", flag: "🇮🇳", speechCode: "pa-IN",
    fonts: [
      { name: "Baloo Paaji 2", css: "'Baloo Paaji 2', cursive" },
      { name: "Mukta Mahee", css: "'Mukta Mahee', sans-serif" },
    ],
    sample: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ ਦੋਸਤੋ! ਇਹ ਮੇਰੀ ਹੱਥ ਲਿਖਤ ਨੋਟ ਹੈ।"
  },
  kannada: {
    label: "Kannada 🇮🇳 ಕನ್ನಡ", flag: "🇮🇳", speechCode: "kn-IN",
    fonts: [
      { name: "Baloo Tamma 2", css: "'Baloo Tamma 2', cursive" },
      { name: "Hind Mysuru", css: "'Hind Mysuru', sans-serif" },
    ],
    sample: "ನಮಸ್ಕಾರ ಗೆಳೆಯರೇ! ಇದು ನನ್ನ ಕೈಬರಹ ಟಿಪ್ಪಣಿ."
  },
  malayalam: {
    label: "Malayalam 🇮🇳 മലയാളം", flag: "🇮🇳", speechCode: "ml-IN",
    fonts: [
      { name: "Baloo Chettan 2", css: "'Baloo Chettan 2', cursive" },
    ],
    sample: "ഹലോ സുഹൃത്തുക്കളേ! ഇത് എന്റെ കൈയെഴുത്ത് കുറിപ്പാണ്."
  },
  odia: {
    label: "Odia 🇮🇳 ଓଡ଼ିଆ", flag: "🇮🇳", speechCode: "or-IN",
    fonts: [{ name: "Baloo Bhaina 2", css: "'Baloo Bhaina 2', cursive" }],
    sample: "ନମସ୍କାର ବନ୍ଧୁମାନେ! ଏହା ମୋର ହସ୍ତଲିଖିତ ନୋଟ୍ |"
  },
  arabic: {
    label: "Arabic 🇸🇦 العربية", flag: "🇸🇦", speechCode: "ar-SA",
    fonts: [
      { name: "Cairo", css: "'Cairo', sans-serif" },
      { name: "Amiri", css: "'Amiri', serif" },
      { name: "Tajawal", css: "'Tajawal', sans-serif" },
      { name: "Lateef", css: "'Lateef', serif" },
    ],
    sample: "مرحبا أصدقائي! هذه ملاحظتي المكتوبة بخط اليد."
  },
  urdu: {
    label: "Urdu 🇵🇰 اردو", flag: "🇵🇰", speechCode: "ur-PK",
    fonts: [
      { name: "Gulzar", css: "'Gulzar', serif" },
      { name: "Noto Nastaliq Urdu", css: "'Noto Nastaliq Urdu', serif" },
      { name: "Lateef", css: "'Lateef', serif" },
    ],
    sample: "سلام دوستو! یہ میرا ہاتھ سے لکھا ہوا نوٹ ہے۔"
  },
  persian: {
    label: "Persian 🇮🇷 فارسی", flag: "🇮🇷", speechCode: "fa-IR",
    fonts: [
      { name: "Vazirmatn", css: "'Vazirmatn', sans-serif" },
      { name: "Gulzar", css: "'Gulzar', serif" },
    ],
    sample: "سلام دوستان! این یادداشت دست‌نویس من است."
  },
  hebrew: {
    label: "Hebrew 🇮🇱 עברית", flag: "🇮🇱", speechCode: "he-IL",
    fonts: [
      { name: "David Libre", css: "'David Libre', serif" },
      { name: "Rubik", css: "'Rubik', sans-serif" },
    ],
    sample: "שלום חברים! זו ההערה בכתב יד שלי."
  },
  russian: {
    label: "Russian 🇷🇺 Русский", flag: "🇷🇺", speechCode: "ru-RU",
    fonts: [
      { name: "Caveat", css: "'Caveat', cursive" },
      { name: "Pacifico", css: "'Pacifico', cursive" },
      { name: "Comfortaa", css: "'Comfortaa', cursive" },
    ],
    sample: "Привет друзья! Это моя рукописная заметка."
  },
  ukrainian: {
    label: "Ukrainian 🇺🇦 Українська", flag: "🇺🇦", speechCode: "uk-UA",
    fonts: [
      { name: "Caveat", css: "'Caveat', cursive" },
      { name: "Comfortaa", css: "'Comfortaa', cursive" },
    ],
    sample: "Привіт друзі! Це моя рукописна нотатка."
  },
  greek: {
    label: "Greek 🇬🇷 Ελληνικά", flag: "🇬🇷", speechCode: "el-GR",
    fonts: [
      { name: "Caveat", css: "'Caveat', cursive" },
      { name: "Comfortaa", css: "'Comfortaa', cursive" },
    ],
    sample: "Γεια σας φίλοι! Αυτή είναι η χειρόγραφη σημείωσή μου."
  },
  japanese: {
    label: "Japanese 🇯🇵 日本語", flag: "🇯🇵", speechCode: "ja-JP",
    fonts: [
      { name: "Yomogi", css: "'Yomogi', cursive" },
      { name: "Zen Kurenaido", css: "'Zen Kurenaido', sans-serif" },
      { name: "Klee One", css: "'Klee One', cursive" },
    ],
    sample: "こんにちは友達！これは私の手書きメモです。"
  },
  korean: {
    label: "Korean 🇰🇷 한국어", flag: "🇰🇷", speechCode: "ko-KR",
    fonts: [
      { name: "Gaegu", css: "'Gaegu', cursive" },
      { name: "Nanum Pen Script", css: "'Nanum Pen Script', cursive" },
      { name: "Poor Story", css: "'Poor Story', cursive" },
    ],
    sample: "안녕 친구들! 이것은 내 손글씨 메모입니다."
  },
  chinese: {
    label: "Chinese 🇨🇳 中文", flag: "🇨🇳", speechCode: "zh-CN",
    fonts: [
      { name: "Ma Shan Zheng", css: "'Ma Shan Zheng', cursive" },
      { name: "Zhi Mang Xing", css: "'Zhi Mang Xing', cursive" },
      { name: "Long Cang", css: "'Long Cang', cursive" },
    ],
    sample: "你好朋友们！这是我的手写笔记。"
  },
  thai: {
    label: "Thai 🇹🇭 ไทย", flag: "🇹🇭", speechCode: "th-TH",
    fonts: [
      { name: "Mali", css: "'Mali', cursive" },
      { name: "Itim", css: "'Itim', cursive" },
      { name: "Sarabun", css: "'Sarabun', sans-serif" },
    ],
    sample: "สวัสดีเพื่อน ๆ! นี่คือบันทึกลายมือของฉัน"
  },
  vietnamese: {
    label: "Vietnamese 🇻🇳 Tiếng Việt", flag: "🇻🇳", speechCode: "vi-VN",
    fonts: [
      { name: "Dancing Script", css: "'Dancing Script', cursive" },
      { name: "Pacifico", css: "'Pacifico', cursive" },
      { name: "Comfortaa", css: "'Comfortaa', cursive" },
    ],
    sample: "Xin chào các bạn! Đây là ghi chú viết tay của tôi."
  },
  indonesian: {
    label: "Indonesian 🇮🇩 Bahasa", flag: "🇮🇩", speechCode: "id-ID",
    fonts: [
      { name: "Caveat", css: "'Caveat', cursive" },
      { name: "Dancing Script", css: "'Dancing Script', cursive" },
      { name: "Indie Flower", css: "'Indie Flower', cursive" },
    ],
    sample: "Halo teman-teman! Ini catatan tulisan tangan saya."
  },
  malay: {
    label: "Malay 🇲🇾 Bahasa Melayu", flag: "🇲🇾", speechCode: "ms-MY",
    fonts: [
      { name: "Caveat", css: "'Caveat', cursive" },
      { name: "Dancing Script", css: "'Dancing Script', cursive" },
    ],
    sample: "Hello kawan-kawan! Ini nota tulisan tangan saya."
  },
  filipino: {
    label: "Filipino 🇵🇭 Tagalog", flag: "🇵🇭", speechCode: "fil-PH",
    fonts: [
      { name: "Caveat", css: "'Caveat', cursive" },
      { name: "Dancing Script", css: "'Dancing Script', cursive" },
    ],
    sample: "Kumusta mga kaibigan! Ito ang aking sulat-kamay na tala."
  },
  spanish: {
    label: "Spanish 🇪🇸 Español", flag: "🇪🇸", speechCode: "es-ES",
    fonts: [
      { name: "Caveat", css: "'Caveat', cursive" },
      { name: "Dancing Script", css: "'Dancing Script', cursive" },
      { name: "Pacifico", css: "'Pacifico', cursive" },
      { name: "Sacramento", css: "'Sacramento', cursive" },
    ],
    sample: "¡Hola amigos! Esta es mi nota escrita a mano."
  },
  french: {
    label: "French 🇫🇷 Français", flag: "🇫🇷", speechCode: "fr-FR",
    fonts: [
      { name: "Caveat", css: "'Caveat', cursive" },
      { name: "Dancing Script", css: "'Dancing Script', cursive" },
      { name: "Great Vibes", css: "'Great Vibes', cursive" },
      { name: "Sacramento", css: "'Sacramento', cursive" },
    ],
    sample: "Bonjour les amis ! Ceci est ma note manuscrite."
  },
  german: {
    label: "German 🇩🇪 Deutsch", flag: "🇩🇪", speechCode: "de-DE",
    fonts: [
      { name: "Caveat", css: "'Caveat', cursive" },
      { name: "Dancing Script", css: "'Dancing Script', cursive" },
      { name: "Comfortaa", css: "'Comfortaa', cursive" },
    ],
    sample: "Hallo Freunde! Dies ist meine handschriftliche Notiz."
  },
  italian: {
    label: "Italian 🇮🇹 Italiano", flag: "🇮🇹", speechCode: "it-IT",
    fonts: [
      { name: "Caveat", css: "'Caveat', cursive" },
      { name: "Dancing Script", css: "'Dancing Script', cursive" },
      { name: "Great Vibes", css: "'Great Vibes', cursive" },
      { name: "Sacramento", css: "'Sacramento', cursive" },
    ],
    sample: "Ciao amici! Questo è il mio appunto scritto a mano."
  },
  portuguese: {
    label: "Portuguese 🇵🇹 Português", flag: "🇵🇹", speechCode: "pt-PT",
    fonts: [
      { name: "Caveat", css: "'Caveat', cursive" },
      { name: "Dancing Script", css: "'Dancing Script', cursive" },
      { name: "Pacifico", css: "'Pacifico', cursive" },
    ],
    sample: "Olá amigos! Esta é minha nota escrita à mão."
  },
  dutch: {
    label: "Dutch 🇳🇱 Nederlands", flag: "🇳🇱", speechCode: "nl-NL",
    fonts: [
      { name: "Caveat", css: "'Caveat', cursive" },
      { name: "Dancing Script", css: "'Dancing Script', cursive" },
    ],
    sample: "Hallo vrienden! Dit is mijn handgeschreven notitie."
  },
  polish: {
    label: "Polish 🇵🇱 Polski", flag: "🇵🇱", speechCode: "pl-PL",
    fonts: [
      { name: "Caveat", css: "'Caveat', cursive" },
      { name: "Comfortaa", css: "'Comfortaa', cursive" },
    ],
    sample: "Cześć przyjaciele! To moja odręczna notatka."
  },
  swedish: {
    label: "Swedish 🇸🇪 Svenska", flag: "🇸🇪", speechCode: "sv-SE",
    fonts: [
      { name: "Caveat", css: "'Caveat', cursive" },
      { name: "Dancing Script", css: "'Dancing Script', cursive" },
    ],
    sample: "Hej vänner! Detta är min handskrivna anteckning."
  },
  turkish: {
    label: "Turkish 🇹🇷 Türkçe", flag: "🇹🇷", speechCode: "tr-TR",
    fonts: [
      { name: "Caveat", css: "'Caveat', cursive" },
      { name: "Dancing Script", css: "'Dancing Script', cursive" },
      { name: "Pacifico", css: "'Pacifico', cursive" },
    ],
    sample: "Merhaba arkadaşlar! Bu benim el yazısı notum."
  },
  swahili: {
    label: "Swahili 🇰🇪 Kiswahili", flag: "🇰🇪", speechCode: "sw-KE",
    fonts: [
      { name: "Caveat", css: "'Caveat', cursive" },
      { name: "Dancing Script", css: "'Dancing Script', cursive" },
    ],
    sample: "Habari marafiki! Hii ni noti yangu ya mkono."
  },
  nepali: {
    label: "Nepali 🇳🇵 नेपाली", flag: "🇳🇵", speechCode: "ne-NP",
    fonts: [
      { name: "Kalam", css: "'Kalam', cursive" },
      { name: "Mukta", css: "'Mukta', sans-serif" },
    ],
    sample: "नमस्ते साथीहरू! यो मेरो हस्तलिखित नोट हो।"
  },
};

const PENS = [
  { name: "Blue", color: "#1e40af" }, { name: "Black", color: "#111827" },
  { name: "Red", color: "#dc2626" }, { name: "Green", color: "#047857" },
  { name: "Purple", color: "#7c3aed" }, { name: "Orange", color: "#ea580c" },
  { name: "Pink", color: "#db2777" }, { name: "Teal", color: "#0d9488" },
  { name: "Brown", color: "#78350f" }, { name: "Navy", color: "#1e3a8a" },
  { name: "Maroon", color: "#7f1d1d" }, { name: "Indigo", color: "#4338ca" },
];

const PEN_TYPES = [
  { id: "ballpoint", name: "🖊️ Ballpoint" },
  { id: "fountain", name: "🖋️ Fountain" },
  { id: "gel", name: "✒️ Gel" },
  { id: "pencil", name: "✏️ Pencil" },
  { id: "marker", name: "🖍️ Marker" },
  { id: "calligraphy", name: "🖌️ Calligraphy" },
];

const PAPERS = [
  { id: "ruled", name: "Ruled 📓" },
  { id: "plain", name: "Plain 📄" },
  { id: "grid", name: "Grid ⊞" },
  { id: "aged", name: "Aged 📜" },
  { id: "sticky", name: "Sticky 🗒️" },
  { id: "letter", name: "Letter ✉️" },
  { id: "diary", name: "Diary 📔" },
  { id: "music", name: "Music 🎵" },
  { id: "legal", name: "Legal ⚖️" },
  { id: "notebook", name: "Notebook 📒" },
];

const TEMPLATES = [
  { id: "blank", name: "Blank Page", icon: "📄", text: "" },
  { id: "letter", name: "Formal Letter", icon: "✉️", text: "Dear [Name],\n\nI hope this letter finds you well. I am writing to...\n\nSincerely,\n[Your Name]" },
  { id: "diary", name: "Diary Entry", icon: "📔", text: "Dear Diary,\n\nToday was an amazing day because...\n\nUntil tomorrow,\nMe" },
  { id: "notes", name: "Study Notes", icon: "📚", text: "Topic: [Chapter Name]\n\n• Key Point 1\n• Key Point 2\n• Key Point 3\n\nImportant: Remember to revise!" },
  { id: "recipe", name: "Recipe Card", icon: "🍳", text: "Recipe: [Dish Name]\n\nIngredients:\n- Item 1\n- Item 2\n\nSteps:\n1. First step...\n2. Second step..." },
  { id: "todo", name: "To-Do List", icon: "✅", text: "Today's Tasks:\n\n☐ Task 1\n☐ Task 2\n☐ Task 3\n\nPriority: High!" },
  { id: "poem", name: "Poem", icon: "🌹", text: "Roses are red,\nViolets are blue,\nHandwriting is beautiful,\nAnd so are you." },
  { id: "invitation", name: "Invitation", icon: "🎉", text: "You're Invited!\n\nJoin us for a celebration\nDate: [Date]\nTime: [Time]\nVenue: [Location]" },
];

const FAQS = [
  { q: "Is this Text to Handwriting Generator completely free?", a: "Yes, 100% free forever. No signup, no watermark, unlimited PNG & PDF downloads. Your text never leaves your browser — complete privacy guaranteed." },
  { q: "How many languages are supported?", a: "We support 35+ global languages including English, Hindi, Bengali, Tamil, Telugu, Marathi, Gujarati, Punjabi, Kannada, Malayalam, Arabic, Urdu, Persian, Hebrew, Russian, Ukrainian, Greek, Japanese, Korean, Chinese, Thai, Vietnamese, Indonesian, Malay, Filipino, Spanish, French, German, Italian, Portuguese, Dutch, Polish, Swedish, Turkish, Swahili, and Nepali." },
  { q: "How do I download as PDF?", a: "Simply type your text, select your preferred font, pen and paper style, then click the PDF Download button. You will receive a high-quality A4 PDF file instantly." },
  { q: "Can I use this for school assignments?", a: "This tool is perfect for practice, notes, quotes, and design projects. However, always check your school's or teacher's rules about using generated handwriting for actual submissions." },
  { q: "Is my data safe and private?", a: "Absolutely. All conversion happens 100% in your browser using client-side JavaScript. We do not store, track, upload, or share your text with anyone. Your privacy is our top priority." },
  { q: "Can I create my own signature?", a: "Yes! Enable Signature Mode in the Advanced tab to generate personalized signatures with various handwriting styles, pen pressures, and ink effects." },
  { q: "Does it support multi-page documents?", a: "Yes. Long texts automatically split into multiple A4 pages with proper page breaks. The PDF export handles all pages seamlessly." },
  { q: "What keyboard shortcuts are available?", a: "Ctrl+S: Download PDF | Ctrl+P: Download PNG | Ctrl+K: Clear text | Ctrl+D: Toggle dark mode | Ctrl+Z: Reset all settings | Ctrl+/: Show shortcuts" },
  { q: "Can I use voice input to write text?", a: "Yes! Click the microphone button in the text area to use your voice. We support speech recognition in 35+ languages using your browser's built-in Web Speech API. Click again to stop listening." },
  { q: "Can I listen to my text being read aloud?", a: "Yes! Click the speaker button to hear your text read aloud using text-to-speech. Click the stop button to halt playback. You can also share your creation on WhatsApp, Facebook, Twitter, LinkedIn, and more." },
  { q: "What background textures are available?", a: "You can apply coffee stains, crumpled paper effects, and aged paper stains to any paper style. These textures add realistic character to your handwritten notes." },
  { q: "Which browsers are supported?", a: "All modern browsers including Chrome, Edge, Firefox, Safari, and Opera. Voice features work best in Chrome and Edge. For the best experience, use the latest version of Chrome." },
];

// --- OTHER USEFUL TOOLS ---
const OTHER_TOOLS = [
  { icon: "📝", name: "Text to Image", desc: "Convert text into beautiful images", color: "from-blue-500 to-cyan-500" },
  { icon: "🔤", name: "Fancy Text Generator", desc: "Stylish fonts for social media", color: "from-pink-500 to-rose-500" },
  { icon: "🔠", name: "Case Converter", desc: "UPPER, lower, Title, Sentence", color: "from-violet-500 to-purple-500" },
  { icon: "📊", name: "Word Counter", desc: "Count words, chars, sentences", color: "from-green-500 to-emerald-500" },
  { icon: "🔐", name: "Password Generator", desc: "Strong secure passwords", color: "from-red-500 to-orange-500" },
  { icon: "📱", name: "QR Code Generator", desc: "Create QR codes instantly", color: "from-indigo-500 to-blue-500" },
  { icon: "🎨", name: "Color Picker", desc: "Pick colors from any image", color: "from-yellow-500 to-amber-500" },
  { icon: "📄", name: "PDF Merger", desc: "Combine multiple PDFs", color: "from-teal-500 to-cyan-500" },
  { icon: "🖼️", name: "Image Compressor", desc: "Reduce image file size", color: "from-fuchsia-500 to-pink-500" },
  { icon: "✂️", name: "Background Remover", desc: "Remove image backgrounds", color: "from-lime-500 to-green-500" },
  { icon: "📅", name: "Age Calculator", desc: "Calculate exact age", color: "from-sky-500 to-blue-500" },
  { icon: "🔗", name: "URL Shortener", desc: "Shorten long URLs", color: "from-purple-500 to-indigo-500" },
];

// Toast Component
const Toast = ({ message, type, onClose }: any) => {
  useEffect(() => {
    const t = setTimeout(onClose, 2500);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className={`fixed bottom-6 right-6 z-[100] px-5 py-3 rounded-2xl shadow-2xl font-semibold text-white flex items-center gap-3 animate-slideUp ${
      type === "success" ? "bg-gradient-to-r from-green-500 to-emerald-500" :
      type === "error" ? "bg-gradient-to-r from-red-500 to-rose-500" :
      "bg-gradient-to-r from-violet-600 to-pink-500"
    }`}>
      <span>{type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️"}</span>
      <span>{message}</span>
    </div>
  );
};

// AdSense Component
const AdSlot = ({ slot, format = "auto", label = "Advertisement", dark }: any) => (
  <div className={`my-6 rounded-2xl overflow-hidden border-2 border-dashed ${dark ? "border-white/10 bg-white/[0.02]" : "border-gray-200 bg-gray-50/50"}`}>
    <div className={`text-[10px] uppercase tracking-widest text-center py-1 font-semibold ${dark ? "text-white/30" : "text-gray-400"}`}>{label}</div>
    <div className="min-h-[100px] flex items-center justify-center text-xs opacity-40 px-4 py-8">
      <ins className="adsbygoogle" style={{ display: "block" }} data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" data-ad-slot={slot} data-ad-format={format} data-full-width-responsive="true" />
    </div>
  </div>
);

export default function Page() {
  const [langKey, setLangKey] = useState("english");
  const [text, setText] = useState(LANGUAGES.english.sample);
  const [fontIdx, setFontIdx] = useState(0);
  const [pen, setPen] = useState(PENS[0]);
  const [penType, setPenType] = useState(PEN_TYPES[0]);
  const [paper, setPaper] = useState(PAPERS[0]);
  const [fontSize, setFontSize] = useState(28);
  const [lineHeight, setLineHeight] = useState(1.8);
  const [letterSpacing, setLetterSpacing] = useState(0.5);
  const [inkOpacity, setInkOpacity] = useState(1);
  const [tilt, setTilt] = useState(0);
  const [dark, setDark] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [showGuide, setShowGuide] = useState(true);
  const [showAbout, setShowAbout] = useState(false);
  const [copied, setCopied] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"text" | "style" | "paper" | "advanced">("text");
  const [alignment, setAlignment] = useState<"left" | "center" | "right" | "justify">("left");
  const [inkTexture, setInkTexture] = useState(true);
  const [strokePressure, setStrokePressure] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [marginX, setMarginX] = useState(0);
  const [marginY, setMarginY] = useState(0);
  const [showMarginLine, setShowMarginLine] = useState(true);
  const [multiPage, setMultiPage] = useState(false);
  const [bgTexture, setBgTexture] = useState<"none" | "coffee" | "crumple" | "stain">("none");
  const [animateText, setAnimateText] = useState(false);
  const [showSignature, setShowSignature] = useState(false);
  const [signatureName, setSignatureName] = useState("John Doe");
  const [signatureStyle, setSignatureStyle] = useState(0);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [wordGoal, setWordGoal] = useState(500);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [langSearch, setLangSearch] = useState("");
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [speechSupported, setSpeechSupported] = useState({ recognition: false, synthesis: false });

  const paperRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef<string>("");
  const listeningRef = useRef(false);
  const baseTextRef = useRef("");
  
  const currentLang = LANGUAGES[langKey];
  const currentFont = currentLang.fonts[fontIdx] || currentLang.fonts[0];
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;
  const readingTime = Math.ceil(wordCount / 200);
  const speakingTime = Math.ceil(wordCount / 130);
  const pageCount = Math.max(1, Math.ceil(text.length / 1800));
  const isRTL = ["arabic", "urdu", "persian", "hebrew"].includes(langKey);

  const filteredLangs = useMemo(() => {
    const q = langSearch.toLowerCase().trim();
    return Object.keys(LANGUAGES).filter(k =>
      !q || LANGUAGES[k].label.toLowerCase().includes(q) || k.toLowerCase().includes(q)
    );
  }, [langSearch]);

  const showToast = useCallback((msg: string, type = "info") => {
    setToast({ msg, type });
  }, []);

  // Check browser speech support on mount
  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setSpeechSupported({
      recognition: !!SR,
      synthesis: "speechSynthesis" in window,
    });
  }, []);

  // Cleanup: stop speech when component unmounts
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) {}
      }
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Auto-stop voice recognition when language changes
  useEffect(() => {
    if (isListening && recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch (e) {}
      setIsListening(false);
    }
    // Auto-cancel speech on language change
    if (isSpeaking && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [langKey]);

  const changeLang = (k: string) => {
    setLangKey(k);
    setFontIdx(0);
    setText(LANGUAGES[k].sample);
    setShowLangDropdown(false);
    setLangSearch("");
    showToast(`Switched to ${LANGUAGES[k].label}`, "info");
  };

  const applyTemplate = (tpl: any) => {
    setText(tpl.text);
    showToast(`Applied ${tpl.name} template`, "success");
  };

  // --- VOICE INPUT (Speech-to-Text) - FIXED ---
  const startListening = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      showToast("Voice input not supported in this browser. Try Chrome or Edge.", "error");
      return;
    }

    // Stop any ongoing speech synthesis
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    const recognition = new SR();
    recognition.lang = currentLang.speechCode || "en-US";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    finalTranscriptRef.current = text? text + " " : "";

    recognition.onstart = () => {
      setIsListening(true);
      showToast("🎤 Listening... Speak now. Click again to stop.", "info");
    };

    recognition.onresult = (event: any) => {
  let finalText = "";
  let interimText = "";
  for (let i = 0; i < event.results.length; i++) {
    const transcript = event.results[i][0].transcript;
    if (event.results[i].isFinal) finalText += transcript + " ";
    else interimText += transcript;
  }
  setText(finalTranscriptRef.current + finalText + interimText);
};

    recognition.onerror = (event: any) => {
      // 'no-speech' and 'aborted' are not real errors
      if (event.error !== "no-speech" && event.error !== "aborted") {
        showToast(`Voice error: ${event.error}`, "error");
      }
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
    } catch (e) {
      showToast("Failed to start voice input", "error");
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
    setIsListening(false);
    showToast("Voice input stopped", "info");
  };

  const toggleListening = () => {
    if (isListening) stopListening();
    else startListening();
  };

  // --- TEXT-TO-SPEECH - FIXED ---
  const speakText = () => {
    if (!("speechSynthesis" in window)) {
      showToast("Text-to-speech not supported in this browser", "error");
      return;
    }

    // If already speaking, stop it
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      showToast("Speech stopped", "info");
      return;
    }

    // Stop any voice recognition
    if (isListening && recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch (e) {}
      setIsListening(false);
    }

    const cleanText = text.trim();
    if (!cleanText) {
      showToast("No text to speak", "error");
      return;
    }

    // Cancel any pending speech first
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = currentLang.speechCode || "en-US";
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    // Try to select a matching voice
    const voices = window.speechSynthesis.getVoices();
    const matchingVoice = voices.find(v => v.lang === utterance.lang) ||
                          voices.find(v => v.lang.startsWith(utterance.lang.split("-")[0]));
    if (matchingVoice) utterance.voice = matchingVoice;

    utterance.onstart = () => {
      setIsSpeaking(true);
      showToast("🔊 Reading text aloud...", "info");
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = (e: any) => {
      if (e.error !== "canceled" && e.error !== "interrupted") {
        showToast("Speech playback error", "error");
      }
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Load voices (needed in some browsers)
  useEffect(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  // Stop speaking when text changes externally (optional safeguard)
  useEffect(() => {
    if (isSpeaking && "speechSynthesis" in window) {
      // Only cancel if user edits text during playback
      // This prevents weird behavior
    }
  }, [text]);

  // --- PAPER STYLE + BACKGROUND TEXTURE - FIXED ---
  const getPaperStyle = () => {
    const style: any = {};

    // Base paper patterns
    switch (paper.id) {
      case "ruled":
        style.backgroundColor = "#ffffff";
        style.backgroundImage = `repeating-linear-gradient(to bottom, transparent 0px, transparent 43px, #93c5fd 43px, #93c5fd 44px)`;
        break;
      case "grid":
        style.backgroundColor = "#ffffff";
        style.backgroundImage = `linear-gradient(to right, #e5e7eb 1px, transparent 1px), linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)`;
        style.backgroundSize = "24px 24px";
        break;
      case "aged":
        style.background = "linear-gradient(135deg, #fdf6e3 0%, #f5e6c8 100%)";
        break;
      case "sticky":
        style.background = "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)";
        break;
      case "letter":
        style.background = "linear-gradient(180deg, #fffef9 0%, #fefce8 100%)";
        break;
      case "diary":
        style.backgroundColor = "#fffbf5";
        style.backgroundImage = `repeating-linear-gradient(to bottom, transparent 0px, transparent 31px, #d1d5db 31px, #d1d5db 32px)`;
        break;
      case "music":
        style.backgroundColor = "#ffffff";
        style.backgroundImage = `repeating-linear-gradient(to bottom, transparent 0px, transparent 19px, #9ca3af 19px, #9ca3af 20px, transparent 20px, transparent 29px, #9ca3af 29px, #9ca3af 30px)`;
        break;
      case "legal":
        style.backgroundColor = "#fffbeb";
        style.backgroundImage = `repeating-linear-gradient(to right, transparent 0px, transparent 39px, #fecaca 39px, #fecaca 40px)`;
        break;
      case "notebook":
        style.backgroundColor = "#ffffff";
        style.backgroundImage = `repeating-linear-gradient(to bottom, transparent 0px, transparent 27px, #bfdbfe 27px, #bfdbfe 28px)`;
        break;
      default:
        style.backgroundColor = "#ffffff";
    }

    // Apply texture overlays ON TOP of base pattern
    // Using multiple background layers
    if (bgTexture === "coffee") {
      // Coffee stain rings - realistic circular stains
      const coffeeOverlay = `
        radial-gradient(circle at 15% 20%, rgba(101, 67, 33, 0.18) 0%, rgba(101, 67, 33, 0.12) 8%, transparent 15%),
        radial-gradient(circle at 85% 75%, rgba(101, 67, 33, 0.15) 0%, rgba(101, 67, 33, 0.08) 6%, transparent 12%),
        radial-gradient(ellipse at 50% 50%, rgba(120, 72, 20, 0.06) 0%, transparent 30%),
        radial-gradient(circle at 70% 15%, rgba(139, 90, 43, 0.10) 0%, transparent 10%)
      `;
      style.backgroundImage = `${coffeeOverlay}, ${style.backgroundImage || "none"}`;
    } else if (bgTexture === "crumple") {
      // Crumpled paper effect - crossing diagonal lines
      const crumpleOverlay = `
        repeating-linear-gradient(45deg, rgba(0,0,0,0.04) 0px, rgba(0,0,0,0.04) 1px, transparent 1px, transparent 6px),
        repeating-linear-gradient(-45deg, rgba(0,0,0,0.03) 0px, rgba(0,0,0,0.03) 1px, transparent 1px, transparent 8px),
        repeating-linear-gradient(0deg, rgba(0,0,0,0.02) 0px, rgba(0,0,0,0.02) 1px, transparent 1px, transparent 12px)
      `;
      style.backgroundImage = `${crumpleOverlay}, ${style.backgroundImage || "none"}`;
    } else if (bgTexture === "stain") {
      // Aged brownish stains
      const stainOverlay = `
        radial-gradient(ellipse 30% 20% at 25% 35%, rgba(139, 90, 43, 0.15) 0%, transparent 100%),
        radial-gradient(ellipse 25% 15% at 75% 65%, rgba(120, 72, 20, 0.12) 0%, transparent 100%),
        radial-gradient(ellipse 20% 12% at 50% 85%, rgba(101, 67, 33, 0.10) 0%, transparent 100%),
        radial-gradient(ellipse 15% 10% at 15% 75%, rgba(139, 90, 43, 0.08) 0%, transparent 100%)
      `;
      style.backgroundImage = `${stainOverlay}, ${style.backgroundImage || "none"}`;
    }

    return style;
  };

  const getPenEffect = () => {
    if (!inkTexture) return {};
    const base: any = {};
    if (penType.id === "fountain") {
      base.textShadow = `0 0 0.5px ${pen.color}, 0 1px 1px ${pen.color}40`;
      base.filter = `contrast(${1 + strokePressure * 0.1})`;
    } else if (penType.id === "gel") {
      base.textShadow = `0 0 2px ${pen.color}60`;
      base.filter = `saturate(${1 + strokePressure * 0.15})`;
    } else if (penType.id === "pencil") {
      base.opacity = inkOpacity * 0.85;
      base.filter = `blur(0.2px) contrast(${0.9 + strokePressure * 0.1})`;
    } else if (penType.id === "marker") {
      base.textShadow = `0 0 3px ${pen.color}80`;
      base.fontWeight = 600;
    } else if (penType.id === "calligraphy") {
      base.textShadow = `1px 1px 0 ${pen.color}40, -1px -1px 0 ${pen.color}20`;
      base.fontWeight = 500;
    } else {
      base.textShadow = `0 0.5px 0.5px ${pen.color}30`;
    }
    return base;
  };

  const downloadPNG = async () => {
    if (!paperRef.current) return;
    setIsDownloading(true);
    showToast("Generating PNG...", "info");
    try {
      const c = await html2canvas(paperRef.current, { scale: 2, backgroundColor: null, useCORS: true });
      const a = document.createElement("a");
      a.download = `handwriting-${langKey}-${Date.now()}.png`;
      a.href = c.toDataURL("image/png");
      a.click();
      showToast("PNG downloaded successfully!", "success");
    } catch (e) { showToast("Download failed", "error"); }
    setIsDownloading(false);
  };

  const downloadPDF = async () => {
    if (!paperRef.current) return;
    setIsDownloading(true);
    showToast("Generating PDF...", "info");
    try {
      const c = await html2canvas(paperRef.current, { scale: 2, backgroundColor: null, useCORS: true });
      const pdf = new jsPDF("p", "mm", "a4");
      const w = pdf.internal.pageSize.getWidth();
      const h = (c.height * w) / c.width;
      pdf.addImage(c.toDataURL("image/png"), "PNG", 0, 0, w, h);
      pdf.save(`handwriting-${langKey}-${Date.now()}.pdf`);
      showToast("PDF downloaded successfully!", "success");
    } catch (e) { showToast("Download failed", "error"); }
    setIsDownloading(false);
  };

  const copyText = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    showToast("Text copied to clipboard!", "success");
    setTimeout(() => setCopied(false), 1500);
  };

  const resetAll = () => {
    setFontIdx(0); setPen(PENS[0]); setPenType(PEN_TYPES[0]); setPaper(PAPERS[0]);
    setFontSize(28); setLineHeight(1.8); setLetterSpacing(0.5); setInkOpacity(1);
    setTilt(0); setAlignment("left"); setInkTexture(true); setStrokePressure(1);
    setRotation(0); setMarginX(0); setMarginY(0); setBgTexture("none");
    showToast("All settings reset", "info");
  };

  // --- SOCIAL SHARE ---
  const shareTo = (platform: string) => {
    const shareText = `Check out my handwritten note created with Handwriting Generator PRO! ✍️`;
    const url = typeof window !== "undefined" ? window.location.href : "";
    let shareUrl = "";
    switch (platform) {
      case "whatsapp": shareUrl = `https://wa.me/?text=${encodeURIComponent(shareText + " " + url)}`; break;
      case "facebook": shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`; break;
      case "twitter": shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`; break;
      case "linkedin": shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`; break;
      case "telegram": shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`; break;
      case "reddit": shareUrl = `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(shareText)}`; break;
      case "email": shareUrl = `mailto:?subject=Check this out&body=${encodeURIComponent(shareText + " " + url)}`; break;
      case "copy": navigator.clipboard.writeText(url); showToast("Link copied to clipboard!", "success"); return;
    }
    window.open(shareUrl, "_blank", "width=600,height=500");
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "s") { e.preventDefault(); downloadPDF(); }
        else if (e.key === "p") { e.preventDefault(); downloadPNG(); }
        else if (e.key === "k") { e.preventDefault(); setText(""); showToast("Text cleared", "info"); }
        else if (e.key === "d") { e.preventDefault(); setDark(d => !d); }
        else if (e.key === "z") { e.preventDefault(); resetAll(); }
        else if (e.key === "/") { e.preventDefault(); setShowShortcuts(s => !s); }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const textStyle: any = {
    fontFamily: currentFont.css,
    color: pen.color,
    fontSize: `${fontSize}px`,
    lineHeight,
    letterSpacing: `${letterSpacing}px`,
    opacity: inkOpacity,
    transform: `rotate(${tilt}deg)`,
    textAlign: alignment,
    ...getPenEffect(),
  };

  const tabs = [
    { id: "text", label: "Text", icon: "📝" },
    { id: "style", label: "Style", icon: "🖋️" },
    { id: "paper", label: "Paper", icon: "📃" },
    { id: "advanced", label: "Pro", icon: "🚀" },
  ];

  return (
    <div className={`min-h-screen transition-colors duration-500 ${dark ? "bg-[#0a0a0f] text-white" : "bg-gradient-to-br from-[#f8f7ff] via-[#fef9ff] to-[#f0f9ff] text-gray-900"}`}>
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className={`absolute top-20 -left-20 w-96 h-96 rounded-full blur-3xl opacity-20 animate-float ${dark ? "bg-violet-600" : "bg-violet-300"}`} />
        <div className={`absolute bottom-20 -right-20 w-96 h-96 rounded-full blur-3xl opacity-20 animate-float-delay ${dark ? "bg-pink-600" : "bg-pink-300"}`} />
      </div>

      <header className={`sticky top-0 z-50 backdrop-blur-xl border-b transition-all ${dark ? "bg-black/60 border-white/10" : "bg-white/80 border-gray-200"}`}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center gap-3">
          <h1 className="text-lg md:text-2xl font-black flex items-center gap-2 group cursor-pointer">
            <span className="group-hover:rotate-12 transition-transform inline-block">✍️</span>
            <span className="bg-gradient-to-r from-violet-600 via-pink-500 to-orange-500 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">Handwriting</span>
            <span className="hidden md:inline">Generator</span>
            <span className="hidden lg:inline text-[10px] px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold">PRO</span>
          </h1>
          <div className="flex gap-2 items-center">
            <span className={`hidden md:flex text-xs px-3 py-1 rounded-full font-semibold items-center gap-2 ${dark ? "bg-green-500/20 text-green-400" : "bg-green-100 text-green-700"}`}>
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              {wordCount} Words • {charCount} Chars • ~{readingTime}m read
            </span>
            <button onClick={() => setShowShare(true)} title="Share" className={`hidden md:flex w-10 h-10 rounded-full items-center justify-center text-lg hover:scale-110 transition-all ${dark ? "bg-white/10" : "bg-gray-100"}`}>📤</button>
            <button onClick={() => setShowShortcuts(true)} title="Keyboard Shortcuts (Ctrl+/)" className={`hidden md:flex w-10 h-10 rounded-full items-center justify-center text-lg hover:scale-110 transition-all ${dark ? "bg-white/10" : "bg-gray-100"}`}>⌨️</button>
            <button onClick={() => setDark(!dark)} className={`w-10 h-10 rounded-full flex items-center justify-center text-xl hover:scale-110 hover:rotate-12 transition-all ${dark ? "bg-white/10" : "bg-gray-100"}`}>{dark ? "☀️" : "🌙"}</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Hero */}
        <div className="text-center mb-6 animate-fadeIn">
          <h2 className="text-2xl md:text-4xl font-black mb-3">
            Convert Typed Text into{" "}
            <span className="bg-gradient-to-r from-violet-600 to-pink-500 bg-clip-text text-transparent">Realistic Handwriting</span>
          </h2>
          <p className="text-sm md:text-base opacity-70 max-w-3xl mx-auto">35+ languages • 30+ fonts • 6 pen types • Voice input • Text-to-speech • PNG & PDF download — 100% Free, No Signup Required</p>
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {["🌍 35+ Languages", "🎨 30+ Fonts", "🎤 Voice Input", "🔊 Text-to-Speech", "📤 Social Share", "🔒 Privacy First"].map((b, i) => (
              <span key={i} className={`text-xs px-3 py-1 rounded-full font-semibold ${dark ? "bg-white/10" : "bg-white shadow border"}`}>{b}</span>
            ))}
          </div>
        </div>

        <AdSlot slot="1234567890" label="Advertisement" dark={dark} />

        <div className="grid lg:grid-cols-[400px_1fr] gap-6">
          {/* CONTROLS */}
          <div className={`rounded-[24px] overflow-hidden h-fit lg:sticky lg:top-20 shadow-xl ${dark ? "bg-white/[0.06] border border-white/10" : "bg-white border"}`}>
            <div className="flex border-b border-gray-100 dark:border-white/10">
              {tabs.map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id as any)} className={`flex-1 py-3 text-xs font-bold transition-all relative ${activeTab === t.id ? "text-violet-600" : "opacity-60 hover:opacity-100"}`}>
                  <div className="text-lg">{t.icon}</div>
                  <div>{t.label}</div>
                  {activeTab === t.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-600 to-pink-500" />}
                </button>
              ))}
            </div>

            <div className="p-5 space-y-5 max-h-[calc(100vh-200px)] overflow-y-auto custom-scroll">
              {/* TEXT TAB */}
              {activeTab === "text" && (
                <>
                  <div className="animate-fadeIn">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-bold">🌍 Language</label>
                      <span className="text-xs bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 px-2 py-0.5 rounded-full font-bold">{currentLang.flag} {currentLang.label.split(" ")[0]}</span>
                    </div>
                    <div className="relative">
                      <button onClick={() => setShowLangDropdown(!showLangDropdown)} className={`w-full p-3 rounded-xl border font-semibold outline-none focus:ring-2 focus:ring-violet-500 transition-all flex justify-between items-center ${dark? "bg-black/40 border-white/10" : "bg-gray-50 border-gray-200"}`}>
                        <span className={`transition-transform ${showLangDropdown ? "rotate-180" : ""}`}>▼</span>
                      </button>
                      {showLangDropdown && (
                        <div className={`absolute z-50 mt-2 w-full max-h-80 overflow-y-auto custom-scroll rounded-xl shadow-2xl border ${dark ? "bg-[#1a1a2e] border-white/10" : "bg-white border-gray-200"}`}>
                          <div className="p-2 sticky top-0 bg-inherit border-b border-gray-100 dark:border-white/10">
                           <input type="text" value={langSearch} onChange={(e) => setLangSearch(e.target.value)} placeholder="Search language..." className="w-full p-2 rounded-lg text-sm outline-none border" style={{ color: "#111827", backgroundColor: "#ffffff", borderColor: "#d1d5db" }} autoFocus />
                          </div>
                          {filteredLangs.map(k => (
                            <button key={k} onClick={() => changeLang(k)} className="w-full text-left px-4 py-2.5 text-sm transition-all flex justify-between items-center" style={{ color: "#111827", backgroundColor: langKey === k? "#ede9fe" : "#ffffff", fontWeight: langKey === k? 700 : 400 }}>
                              <span>{LANGUAGES[k].label}</span>
                              {langKey === k && <span className="text-violet-600">✓</span>}
                            </button>
                          ))}
                          {filteredLangs.length === 0 && <div className="p-4 text-center text-sm opacity-60">No languages found</div>}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="animate-fadeIn">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-bold">✏️ Your Text</label>
                      <div className="flex gap-2 items-center">
                        <button
                          onClick={toggleListening}
                          title={!speechSupported.recognition ? "Voice input not supported in this browser" : isListening ? "Stop voice input" : "Start voice input"}
                          disabled={!speechSupported.recognition}
                          className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold transition-all ${
                            !speechSupported.recognition
                              ? "bg-gray-200 dark:bg-white/5 text-gray-400 cursor-not-allowed"
                              : isListening
                                ? "bg-red-500 text-white animate-pulse"
                                : "bg-white text-violet-700 border-2 border-violet-600 hover:bg-violet-600 hover:text-white"
                          }`}
                          style={{ color: isListening? "#ffffff" : "#6d28d9", backgroundColor: isListening? "#ef4444" : "#ffffff" }}
                        >
                          {isListening ? "⏹ Stop" : "🎤 Voice"}
                        </button>
                        <button
  onClick={speakText}
  title={!speechSupported.synthesis? "Text-to-speech not supported" : isSpeaking? "Stop speaking" : "Read text aloud"}
  disabled={!speechSupported.synthesis}
  className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full font-bold border-2 transition-all"
  style={{
    color: "#ffffff",
    backgroundColor: isSpeaking? "#dc2626" : "#db2777",
    borderColor: isSpeaking? "#dc2626" : "#db2777",
    opacity:!speechSupported.synthesis? 0.5 : 1,
  }}
>
  {isSpeaking? "⏹ Stop" : "🔊 Listen"}
</button>
                        <button onClick={() => setText("")} className="text-red-500 text-xs hover:underline font-semibold">Clear</button>
                      </div>
                    </div>
                    <textarea ref={textareaRef} value={text} onChange={(e) => setText(e.target.value)} rows={6} dir={isRTL ? "rtl" : "ltr"} placeholder="Type or paste your text here..." className={`w-full rounded-2xl p-4 text-[15px] outline-none resize-none focus:ring-2 focus:ring-violet-500 transition-all ${dark ? "bg-black/40 border-white/10" : "bg-gray-50 border"}`} />
                    <div className="flex justify-between items-center mt-2">
                      <button
  onClick={() => setText(currentLang.sample)}
  className="text-[12px] px-3 py-1.5 rounded-full font-bold border-2 border-violet-600 bg-white hover:bg-violet-600 hover:text-white transition-all shadow-sm"
  style={{ color: "#6d28d9", backgroundColor: "#ffffff" }}
>
  ↺ Load Sample
</button>
                      <div className="flex gap-2 text-[11px] opacity-60">
                        <span>📖 {readingTime}m read</span>
                        <span>•</span>
                        <span>🔊 {speakingTime}m speak</span>
                        <span>•</span>
                        <span>📄 {pageCount} page{pageCount > 1 ? "s" : ""}</span>
                      </div>
                    </div>
                  </div>

                  <div className="animate-fadeIn">
                    <label className="text-sm font-bold block mb-2">📋 Quick Templates</label>
                    <div className="grid grid-cols-2 gap-2">
                      {TEMPLATES.map(t => (
                        <button key={t.id} onClick={() => applyTemplate(t)} className={`p-2 rounded-xl text-xs font-semibold border-2 transition-all hover:-translate-y-0.5 hover:shadow-md ${dark ? "border-white/10 bg-white/5" : "border-gray-100 bg-gray-50"}`}>
                          <div className="text-lg">{t.icon}</div>
                          <div className="truncate">{t.name}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* STYLE TAB */}
              {activeTab === "style" && (
                <>
                  <div className="animate-fadeIn">
                    <label className="text-sm font-bold block mb-2">🖋️ Handwriting Style ({currentLang.fonts.length} available)</label>
                    <div className="grid grid-cols-2 gap-2">
                      {currentLang.fonts.map((f: any, i: number) => (
                        <button key={i} onClick={() => setFontIdx(i)} style={{ fontFamily: f.css }} className={`py-2.5 px-3 rounded-xl text-[17px] border-2 transition-all hover:-translate-y-0.5 hover:shadow-md ${fontIdx === i ? "border-violet-600 bg-violet-50 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 scale-[1.02]" : dark ? "border-white/10 bg-white/5" : "border-gray-100 bg-gray-50"}`}>{f.name}</button>
                      ))}
                    </div>
                  </div>

                  <div className="animate-fadeIn">
                    <label className="text-sm font-bold block mb-2">✒️ Pen Type</label>
                    <div className="grid grid-cols-3 gap-2">
                      {PEN_TYPES.map(p => (
                        <button key={p.id} onClick={() => setPenType(p)} className={`py-2 rounded-xl text-xs font-semibold border-2 transition-all hover:scale-105 ${penType.id === p.id ? "border-violet-600 bg-violet-600 text-white" : dark ? "border-white/10" : "border-gray-200"}`}>{p.name}</button>
                      ))}
                    </div>
                  </div>

                  <div className="animate-fadeIn">
                    <label className="text-sm font-bold block mb-2">🎨 Pen Color ({PENS.length} options)</label>
                    <div className="flex flex-wrap gap-2.5">
                      {PENS.map(p => (
                        <button key={p.name} title={p.name} onClick={() => { setPen(p); showToast(`${p.name} pen selected`, "info"); }} style={{ background: p.color }} className={`w-9 h-9 rounded-full hover:scale-125 transition-all ${pen.color === p.color ? "ring-[3px] ring-offset-2 ring-violet-500 scale-110" : ""}`} />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4 animate-fadeIn">
                    <div>
                      <div className="flex justify-between text-sm font-bold"><span>Font Size</span><span className="text-violet-600">{fontSize}px</span></div>
                      <input type="range" min={16} max={48} value={fontSize} onChange={(e) => setFontSize(+e.target.value)} className="w-full accent-violet-600" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm font-bold"><span>Line Spacing</span><span className="text-violet-600">{lineHeight}</span></div>
                      <input type="range" min={1.2} max={2.5} step={0.1} value={lineHeight} onChange={(e) => setLineHeight(+e.target.value)} className="w-full accent-pink-500" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm font-bold"><span>Letter Spacing</span><span className="text-violet-600">{letterSpacing}px</span></div>
                      <input type="range" min={0} max={3} step={0.1} value={letterSpacing} onChange={(e) => setLetterSpacing(+e.target.value)} className="w-full accent-violet-600" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm font-bold"><span>✨ Ink Darkness</span><span className="text-violet-600">{inkOpacity}</span></div>
                      <input type="range" min={0.5} max={1} step={0.05} value={inkOpacity} onChange={(e) => setInkOpacity(+e.target.value)} className="w-full accent-violet-600" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm font-bold"><span>↗️ Handwriting Tilt</span><span className="text-violet-600">{tilt}°</span></div>
                      <input type="range" min={-3} max={3} step={0.5} value={tilt} onChange={(e) => setTilt(+e.target.value)} className="w-full accent-pink-500" />
                    </div>
                  </div>

                  <div className="animate-fadeIn">
                    <label className="text-sm font-bold block mb-2">📐 Alignment</label>
                    <div className="grid grid-cols-4 gap-2">
                      {[["left", "⬅️"], ["center", "↔️"], ["right", "➡️"], ["justify", "☰"]].map(([a, i]) => (
                        <button key={a} onClick={() => setAlignment(a as any)} className={`py-2 rounded-xl text-lg border-2 transition-all hover:scale-105 ${alignment === a ? "border-violet-600 bg-violet-600 text-white" : dark ? "border-white/10" : "border-gray-200"}`}>{i}</button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* PAPER TAB */}
              {activeTab === "paper" && (
                <>
                  <div className="animate-fadeIn">
                    <label className="text-sm font-bold block mb-2">📄 Paper Style ({PAPERS.length} options)</label>
                    <div className="grid grid-cols-2 gap-2">
                      {PAPERS.map(p => (
                        <button key={p.id} onClick={() => setPaper(p)} className={`py-2.5 rounded-xl text-sm font-semibold border-2 hover:scale-[1.03] transition-all ${paper.id === p.id ? "border-violet-600 bg-violet-600 text-white shadow-lg" : dark ? "border-white/10" : "border-gray-200"}`}>{p.name}</button>
                      ))}
                    </div>
                  </div>

                  <div className="animate-fadeIn">
                    <label className="text-sm font-bold block mb-2">🎨 Background Texture</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: "none", name: "✨ None" },
                        { id: "coffee", name: "☕ Coffee Stain" },
                        { id: "crumple", name: "📰 Crumpled" },
                        { id: "stain", name: "🍂 Aged Stain" },
                      ].map(t => (
                        <button
                          key={t.id}
                          onClick={() => {
                            setBgTexture(t.id as any);
                            showToast(t.id === "none" ? "Texture removed" : `${t.name} applied`, "info");
                          }}
                          className={`py-2 rounded-xl text-xs font-semibold border-2 transition-all hover:scale-105 ${bgTexture === t.id ? "border-violet-600 bg-violet-600 text-white" : dark ? "border-white/10" : "border-gray-200"}`}
                        >
                          {t.name}
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] opacity-50 mt-2">✨ Texture is applied as an overlay on any paper style</p>
                  </div>

                  <div className="animate-fadeIn space-y-3">
                    <label className="flex items-center justify-between text-sm font-bold cursor-pointer">
                      <span>📏 Show Margin Line</span>
                      <input type="checkbox" checked={showMarginLine} onChange={(e) => setShowMarginLine(e.target.checked)} className="w-4 h-4 accent-violet-600" />
                    </label>
                    <div>
                      <div className="flex justify-between text-sm font-bold"><span>Horizontal Margin</span><span className="text-violet-600">{marginX}px</span></div>
                      <input type="range" min={0} max={100} value={marginX} onChange={(e) => setMarginX(+e.target.value)} className="w-full accent-violet-600" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm font-bold"><span>Vertical Margin</span><span className="text-violet-600">{marginY}px</span></div>
                      <input type="range" min={0} max={80} value={marginY} onChange={(e) => setMarginY(+e.target.value)} className="w-full accent-violet-600" />
                    </div>
                  </div>
                </>
              )}

              {/* ADVANCED TAB */}
              {activeTab === "advanced" && (
                <>
                  <div className="animate-fadeIn space-y-3">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-violet-500/10 to-pink-500/10 border border-violet-200 dark:border-violet-800">
                      <div className="text-xs font-bold text-violet-600 mb-2">🚀 PRO FEATURES</div>
                      <label className="flex items-center justify-between text-sm font-bold cursor-pointer mb-2">
                        <span>🖋️ Ink Texture Effects</span>
                        <input type="checkbox" checked={inkTexture} onChange={(e) => setInkTexture(e.target.checked)} className="w-4 h-4 accent-violet-600" />
                      </label>
                      <label className="flex items-center justify-between text-sm font-bold cursor-pointer mb-2">
                        <span>✍️ Writing Animation</span>
                        <input type="checkbox" checked={animateText} onChange={(e) => setAnimateText(e.target.checked)} className="w-4 h-4 accent-violet-600" />
                      </label>
                      <label className="flex items-center justify-between text-sm font-bold cursor-pointer">
                        <span>📚 Multi-Page Mode</span>
                        <input type="checkbox" checked={multiPage} onChange={(e) => setMultiPage(e.target.checked)} className="w-4 h-4 accent-violet-600" />
                      </label>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm font-bold"><span>💪 Stroke Pressure</span><span className="text-violet-600">{strokePressure}x</span></div>
                      <input type="range" min={0.5} max={2} step={0.1} value={strokePressure} onChange={(e) => setStrokePressure(+e.target.value)} className="w-full accent-violet-600" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm font-bold"><span>🔄 Rotation</span><span className="text-violet-600">{rotation}°</span></div>
                      <input type="range" min={-10} max={10} step={0.5} value={rotation} onChange={(e) => setRotation(+e.target.value)} className="w-full accent-pink-500" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm font-bold"><span>🎯 Word Goal</span><span className="text-violet-600">{wordCount}/{wordGoal}</span></div>
                      <input type="range" min={100} max={2000} step={100} value={wordGoal} onChange={(e) => setWordGoal(+e.target.value)} className="w-full accent-violet-600" />
                      <div className="mt-2 h-2 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-violet-600 to-pink-500 transition-all" style={{ width: `${Math.min(100, (wordCount / wordGoal) * 100)}%` }} />
                      </div>
                    </div>
                  </div>

                  <div className="animate-fadeIn">
                    <label className="flex items-center justify-between text-sm font-bold cursor-pointer mb-2">
                      <span>✒️ Signature Mode</span>
                      <input type="checkbox" checked={showSignature} onChange={(e) => setShowSignature(e.target.checked)} className="w-4 h-4 accent-violet-600" />
                    </label>
                    {showSignature && (
                      <div className="space-y-2 animate-slideDown">
                        <input type="text" value={signatureName} onChange={(e) => setSignatureName(e.target.value)} placeholder="Your name" className={`w-full p-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-500 ${dark ? "bg-black/40 border-white/10" : "bg-gray-50 border"}`} />
                        <div className="grid grid-cols-3 gap-2">
                          {["'Caveat', cursive", "'Homemade Apple', cursive", "'Shadows Into Light', cursive"].map((f, i) => (
                            <button key={i} onClick={() => setSignatureStyle(i)} style={{ fontFamily: f }} className={`py-2 rounded-lg text-sm border-2 transition-all ${signatureStyle === i ? "border-violet-600 bg-violet-50 dark:bg-violet-900/40" : dark ? "border-white/10" : "border-gray-200"}`}>
                              {signatureName.split(" ")[0] || "Signature"}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <button onClick={resetAll} className="w-full py-2.5 rounded-xl font-bold text-sm border-2 border-red-200 dark:border-red-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                    🔄 Reset All Settings (Ctrl+Z)
                  </button>
                </>
              )}
            </div>

            <div className="p-5 pt-0 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <button onClick={downloadPNG} disabled={isDownloading} className="py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 relative overflow-hidden group">
                  <span className="relative z-10">{isDownloading ? "⏳ Processing..." : "📷 Download PNG"}</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
                <button onClick={downloadPDF} disabled={isDownloading} className="py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 relative overflow-hidden group">
                  <span className="relative z-10">{isDownloading ? "⏳ Processing..." : "📄 Download PDF"}</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-rose-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={copyText} className={`py-3 rounded-2xl font-bold border-2 border-dashed transition-all hover:bg-violet-50 dark:hover:bg-violet-900/20 text-sm ${dark ? "border-white/20" : ""}`}>
                  {copied ? "✅ Copied!" : "📋 Copy Text"}
                </button>
                <button onClick={() => setShowShare(true)} className={`py-3 rounded-2xl font-bold border-2 border-dashed transition-all hover:bg-pink-50 dark:hover:bg-pink-900/20 text-sm ${dark ? "border-white/20" : ""}`}>
                  📤 Share
                </button>
              </div>
            </div>
          </div>

          {/* PREVIEW */}
          <div>
            <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
              <h2 className="font-bold text-lg flex items-center gap-2">👀 Live Preview <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" /></h2>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white dark:bg-white/10 shadow border dark:border-white/10">A4 • {paper.name} • {currentLang.flag} {currentLang.label.split(" ")[0]}</span>
                <div className="flex items-center gap-1 bg-white dark:bg-white/10 rounded-full px-2 py-1 shadow border dark:border-white/10">
                  <button onClick={() => setZoom(z => Math.max(50, z - 10))} className="w-6 h-6 rounded-full hover:bg-violet-100 dark:hover:bg-violet-900/40 text-sm">−</button>
                  <span className="text-xs font-bold w-10 text-center">{zoom}%</span>
                  <button onClick={() => setZoom(z => Math.min(150, z + 10))} className="w-6 h-6 rounded-full hover:bg-violet-100 dark:hover:bg-violet-900/40 text-sm">+</button>
                </div>
              </div>
            </div>

            <div className="overflow-auto max-h-[80vh] custom-scroll rounded-lg">
              <div
                ref={paperRef}
                style={{
                  ...getPaperStyle(),
                  transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                  transformOrigin: "top center",
                  padding: `${32 + marginY}px ${32 + marginX}px`,
                }}
                className="relative w-full min-h-[700px] rounded-[4px] shadow-[0_20px_60px_rgba(0,0,0,0.2)] overflow-hidden transition-all duration-300"
              >
                {paper.id === "ruled" && showMarginLine && <div className="absolute left-[60px] top-0 bottom-0 w-[2px] bg-red-300/70" />}
                {paper.id === "diary" && showMarginLine && <div className="absolute left-[50px] top-0 bottom-0 w-[2px] bg-red-300/70" />}
                {paper.id === "notebook" && showMarginLine && <div className="absolute left-[45px] top-0 bottom-0 w-[2px] bg-red-400/70" />}
                <div
                  dir={isRTL ? "rtl" : "ltr"}
                  style={textStyle}
                  className={`whitespace-pre-wrap break-words transition-all duration-300 ${animateText ? "animate-writeIn" : ""} ${paper.id === "ruled" || paper.id === "diary" || paper.id === "notebook" ? "md:pl-8" : ""}`}
                >
                  {text || "Your handwritten text will appear here..."}
                </div>

                {showSignature && (
                  <div style={{ fontFamily: ["'Caveat', cursive", "'Homemade Apple', cursive", "'Shadows Into Light', cursive"][signatureStyle], color: pen.color, fontSize: `${fontSize * 1.4}px`, transform: "rotate(-3deg)" }} className="absolute bottom-16 right-12 opacity-90">
                    {signatureName}
                  </div>
                )}

                <div className="absolute bottom-4 right-6 text-[11px] text-gray-400 flex items-center gap-2">
                  <span>Made with Handwriting Generator PRO</span>
                  {multiPage && <span className="px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-300 font-bold">Page 1 of {pageCount}</span>}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
              {[["⚡", "Instant", "No Signup", "from-yellow-400 to-orange-500"], ["🌍", "35+ Languages", "Global Support", "from-blue-400 to-cyan-500"], ["🎨", "30+ Fonts", "6 Pen Types", "from-violet-400 to-pink-500"], ["🔒", "100% Private", "Browser Only", "from-green-400 to-emerald-500"]].map(([i, t, s, g]) => (
                <div key={t} className={`group p-4 rounded-2xl text-center hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 cursor-pointer relative overflow-hidden ${dark ? "bg-white/5 border border-white/10" : "bg-white border"}`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${g} opacity-0 group-hover:opacity-10 transition-opacity`} />
                  <div className="text-3xl group-hover:scale-125 transition-transform">{i}</div>
                  <div className="font-bold text-sm mt-1">{t}</div>
                  <div className="text-xs opacity-60">{s}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <AdSlot slot="2345678901" label="Advertisement" dark={dark} />

        {/* OTHER USEFUL TOOLS */}
        <section className="mt-12">
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-black mb-2">
              🛠️ Other <span className="bg-gradient-to-r from-violet-600 to-pink-500 bg-clip-text text-transparent">Useful Tools</span>
            </h2>
            <p className="text-sm opacity-70 max-w-2xl mx-auto">Explore our collection of free online tools to boost your productivity and creativity</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {OTHER_TOOLS.map((tool, i) => (
              <div key={i} className={`group p-5 rounded-2xl border transition-all duration-300 cursor-pointer hover:-translate-y-2 hover:shadow-2xl relative overflow-hidden ${dark ? "bg-white/5 border-white/10" : "bg-white border-gray-200"}`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all mb-3`}>
                  {tool.icon}
                </div>
                <h3 className="font-bold text-sm mb-1">{tool.name}</h3>
                <p className="text-xs opacity-60">{tool.desc}</p>
                <div className="mt-3 text-xs font-bold text-violet-600 opacity-0 group-hover:opacity-100 transition-opacity">Try Now →</div>
              </div>
            ))}
          </div>
        </section>

        {/* SEO CONTENT */}
        <div className="mt-12 space-y-4">
          <div className={`rounded-2xl overflow-hidden border transition-all hover:shadow-lg ${dark ? "bg-white/5 border-white/10" : "bg-white border-gray-200"}`}>
            <button onClick={() => setShowGuide(!showGuide)} className="w-full flex justify-between items-center p-5 font-bold text-left hover:bg-violet-50/50 dark:hover:bg-violet-900/20 transition-all">
              <span className="flex items-center gap-2">📖 Complete User Guide — How to Use This Tool</span>
              <span className={`text-xs bg-violet-600 text-white px-2 py-1 rounded-full transition-transform ${showGuide ? "rotate-180" : ""}`}>{showGuide ? "▲" : "▼"}</span>
            </button>
            {showGuide && (
              <div className="p-5 pt-0 text-sm leading-relaxed space-y-3 opacity-90 animate-slideDown">
                <p><b className="text-violet-600">Step 1 — Select Your Language:</b> Choose from 35+ global languages including English, Hindi, Bengali, Tamil, Telugu, Marathi, Gujarati, Punjabi, Kannada, Malayalam, Arabic, Urdu, Persian, Hebrew, Russian, Japanese, Korean, Chinese, Thai, Vietnamese, Spanish, French, German, Italian, Portuguese, and many more. Use the search box to quickly find your language.</p>
                <p><b className="text-violet-600">Step 2 — Enter Your Text:</b> Type or paste your text directly, or click 🎤 Voice to dictate using your microphone. Click again to stop. The 🔊 Listen button reads your text aloud using text-to-speech. Click ⏹ Stop to halt playback. Quick Templates instantly load letters, diary entries, notes, recipes, to-do lists, poems, and invitations.</p>
                <p><b className="text-violet-600">Step 3 — Customize Style:</b> Select from 30+ handwriting fonts, 6 pen types (Ballpoint, Fountain, Gel, Pencil, Marker, Calligraphy), 12 pen colors, and adjust font size, line spacing, letter spacing, ink darkness, tilt, and text alignment. Every change reflects instantly in the live preview.</p>
                <p><b className="text-violet-600">Step 4 — Choose Paper & Texture:</b> Pick from 10 paper styles including Ruled, Plain, Grid, Aged, Sticky, Letter, Diary, Music, Legal, and Notebook. Apply background textures (Coffee Stain, Crumpled, Aged Stain) as overlays for realistic character. Adjust margins for perfect positioning.</p>
                <p><b className="text-violet-600">Step 5 — Pro Features:</b> Enable ink texture effects, writing animation, multi-page mode, stroke pressure control, rotation, word goal tracking, and signature mode.</p>
                <p><b className="text-violet-600">Step 6 — Download & Share:</b> Preview your creation, then download as high-quality PNG or A4 PDF. Share directly to WhatsApp, Facebook, Twitter/X, LinkedIn, Telegram, Reddit, or email. Keyboard shortcuts: Ctrl+S (PDF), Ctrl+P (PNG), Ctrl+K (Clear), Ctrl+D (Dark mode), Ctrl+Z (Reset), Ctrl+/ (Shortcuts).</p>
                <p className="p-3 rounded-xl bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 border border-amber-200 dark:border-amber-800"><b>💡 Pro Tip:</b> For the most realistic handwriting, use Ink Darkness at 0.85, Tilt at 0.5°, Stroke Pressure at 1.2x, and keep Ink Texture ON. Try the combination of Fountain pen + Ruled paper + Caveat font for the most natural look!</p>
                <p className="p-3 rounded-xl bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 border border-blue-200 dark:border-blue-800"><b>🎤 Voice Tips:</b> Voice input works best in Chrome and Edge. Click 🎤 Voice to start, speak clearly, and click ⏹ Stop when done. The language automatically matches your selected language. Text-to-speech uses your system's built-in voices — for best results, install more voices in your OS settings.</p>
              </div>
            )}
          </div>

          <div className={`rounded-2xl overflow-hidden border transition-all hover:shadow-lg ${dark ? "bg-white/5 border-white/10" : "bg-white border-gray-200"}`}>
            <button onClick={() => setShowAbout(!showAbout)} className="w-full flex justify-between items-center p-5 font-bold text-left hover:bg-violet-50/50 dark:hover:bg-violet-900/20 transition-all">
              <span className="flex items-center gap-2">ℹ️ What is Text to Handwriting Generator?</span>
              <span className={`text-xs bg-violet-600 text-white px-2 py-1 rounded-full transition-transform ${showAbout ? "rotate-180" : ""}`}>{showAbout ? "▲" : "▼"}</span>
            </button>
            {showAbout && (
              <div className="p-5 pt-0 text-sm leading-relaxed space-y-3 opacity-90 animate-slideDown">
                <p><b>Text to Handwriting Generator PRO</b> is an advanced free online tool that transforms typed text into realistic handwritten notes. It is designed for students, teachers, content creators, designers, professionals, and anyone who wants to create beautiful handwritten content without actually writing by hand.</p>
                <p><b>Global Language Support:</b> We support 35+ languages including English, Hindi, Bengali, Tamil, Telugu, Marathi, Gujarati, Punjabi, Kannada, Malayalam, Odia, Arabic, Urdu, Persian, Hebrew, Russian, Ukrainian, Greek, Japanese, Korean, Chinese, Thai, Vietnamese, Indonesian, Malay, Filipino, Spanish, French, German, Italian, Portuguese, Dutch, Polish, Swedish, Turkish, Swahili, and Nepali. Each language uses native fonts for authentic output.</p>
                <p><b>Realism Features:</b> Multiple pen types (fountain, ballpoint, gel, pencil, marker, calligraphy) each with unique ink effects. Advanced controls for ink texture, stroke pressure, tilt, darkness, and background textures create a truly authentic handwritten appearance.</p>
                <p><b>Voice & Speech:</b> Use the 🎤 Voice Input button to dictate text in 35+ languages using Web Speech API. Click again to stop. The 🔊 Text-to-Speech feature reads your text aloud for proofreading or accessibility.</p>
                <p><b>Sharing & Export:</b> Download your creations as high-quality PNG images or A4 PDF documents. Share instantly to WhatsApp, Facebook, Twitter/X, LinkedIn, Telegram, Reddit, or email.</p>
                <p><b>Use Cases:</b> Study notes, assignments practice, quotes, greeting cards, worksheets, diary entries, formal letters, signature creation, recipe cards, to-do lists, poems, invitations, and creative design projects.</p>
                <p><b>Privacy First:</b> All processing happens 100% in your browser using client-side JavaScript. We do not store, track, upload, or share your text with anyone. Your privacy is our top priority.</p>
              </div>
            )}
          </div>

          <div className={`rounded-2xl overflow-hidden border ${dark ? "bg-white/5 border-white/10" : "bg-white border-gray-200"}`}>
            <div className="p-5 pb-2"><h3 className="font-bold text-lg">❓ Frequently Asked Questions (FAQ)</h3></div>
            <div className="p-5 pt-2 space-y-2">
              {FAQS.map((f, i) => (
                <div key={i} className={`rounded-xl border overflow-hidden transition-all ${dark ? "border-white/10" : "border-gray-100"} ${openFaq === i ? "shadow-md" : ""}`}>
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex justify-between items-center p-4 text-left font-semibold text-sm hover:bg-violet-50/50 dark:hover:bg-violet-900/20 transition-all">
                    <span>{f.q}</span>
                    <span className={`text-violet-600 font-bold transition-transform ${openFaq === i ? "rotate-180" : ""}`}>{openFaq === i ? "−" : "+"}</span>
                  </button>
                  {openFaq === i && <p className="px-4 pb-4 text-sm opacity-80 leading-relaxed animate-slideDown">{f.a}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>

        <AdSlot slot="3456789012" label="Advertisement" dark={dark} />
      </main>

      <footer className={`mt-12 py-8 border-t text-center text-sm opacity-70 ${dark ? "border-white/10" : "border-gray-200"}`}>
        <p className="font-semibold">✍️ Handwriting Generator PRO — Made with ❤️ for creators worldwide</p>
        <p className="text-xs mt-2">100% Free • No Signup • Privacy First • 35+ Languages • Voice Input • PNG & PDF Export</p>
      </footer>

      {/* Shortcuts Modal */}
      {showShortcuts && (
        <div className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn" onClick={() => setShowShortcuts(false)}>
          <div className={`max-w-md w-full rounded-3xl p-6 shadow-2xl animate-slideUp ${dark ? "bg-[#1a1a2e]" : "bg-white"}`} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-xl">⌨️ Keyboard Shortcuts</h3>
              <button onClick={() => setShowShortcuts(false)} className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-white/10">✕</button>
            </div>
            <div className="space-y-2">
              {[["Ctrl + S", "Download PDF"], ["Ctrl + P", "Download PNG"], ["Ctrl + K", "Clear Text"], ["Ctrl + D", "Toggle Dark Mode"], ["Ctrl + Z", "Reset All Settings"], ["Ctrl + /", "Show Shortcuts"]].map(([k, v]) => (
                <div key={k} className="flex justify-between items-center p-3 rounded-xl bg-gray-50 dark:bg-white/5">
                  <span className="text-sm opacity-80">{v}</span>
                  <kbd className="px-3 py-1 rounded-lg bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 text-xs font-bold">{k}</kbd>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShare && (
        <div className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn" onClick={() => setShowShare(false)}>
          <div className={`max-w-md w-full rounded-3xl p-6 shadow-2xl animate-slideUp ${dark ? "bg-[#1a1a2e]" : "bg-white"}`} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-xl">📤 Share This Tool</h3>
              <button onClick={() => setShowShare(false)} className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-white/10">✕</button>
            </div>
            <p className="text-sm opacity-70 mb-4">Share this free handwriting generator with your friends and colleagues!</p>
            <div className="grid grid-cols-4 gap-3">
              {[
                { id: "whatsapp", name: "WhatsApp", icon: "💬", color: "bg-green-500" },
                { id: "facebook", name: "Facebook", icon: "📘", color: "bg-blue-600" },
                { id: "twitter", name: "Twitter/X", icon: "🐦", color: "bg-black" },
                { id: "linkedin", name: "LinkedIn", icon: "💼", color: "bg-blue-700" },
                { id: "telegram", name: "Telegram", icon: "✈️", color: "bg-sky-500" },
                { id: "reddit", name: "Reddit", icon: "🤖", color: "bg-orange-500" },
                { id: "email", name: "Email", icon: "✉️", color: "bg-gray-600" },
                { id: "copy", name: "Copy Link", icon: "🔗", color: "bg-violet-600" },
              ].map(s => (
                <button key={s.id} onClick={() => shareTo(s.id)} className={`${s.color} text-white p-3 rounded-2xl flex flex-col items-center gap-1 hover:scale-110 transition-all shadow-lg`}>
                  <span className="text-2xl">{s.icon}</span>
                  <span className="text-[10px] font-bold">{s.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&family=Kalam&family=Patrick+Hand&family=Shadows+Into+Light&family=Homemade+Apple&family=Indie+Flower&family=Dancing+Script:wght@500;700&family=Great+Vibes&family=Sacramento&family=Pacifico&family=Comfortaa&family=Tiro+Devanagari+Hindi&family=Baloo+2&family=Baloo+Bhai+2&family=Baloo+Bhaina+2&family=Baloo+Da+2&family=Baloo+Paaji+2&family=Baloo+Tamma+2&family=Baloo+Tammudu+2&family=Baloo+Thambi+2&family=Baloo+Chettan+2&family=Hind&family=Hind+Guntur&family=Hind+Madurai&family=Hind+Mysuru&family=Hind+Siliguri&family=Hind+Vadodara&family=Mukta&family=Mukta+Mahee&family=Mandali&family=Catamaran&family=Atma&family=Cairo&family=Amiri&family=Tajawal&family=Lateef&family=Gulzar&family=Noto+Nastaliq+Urdu&family=Vazirmatn&family=David+Libre&family=Rubik&family=Yomogi&family=Zen+Kurenaido&family=Klee+One&family=Gaegu&family=Nanum+Pen+Script&family=Poor+Story&family=Ma+Shan+Zheng&family=Zhi+Mang+Xing&family=Long+Cang&family=Mali&family=Itim&family=Sarabun&family=Poppins:wght@400;600&display=swap');
        
        @keyframes gradient { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
        @keyframes float { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(30px,-30px) scale(1.1)} }
        @keyframes float-delay { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-30px,30px) scale(1.1)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes writeIn { from{clip-path:inset(0 100% 0 0)} to{clip-path:inset(0 0 0 0)} }
        
        .animate-gradient { animation: gradient 3s ease infinite; }
        .animate-float { animation: float 8s ease-in-out infinite; }
        .animate-float-delay { animation: float-delay 10s ease-in-out infinite; }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out; }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
        .animate-slideDown { animation: slideDown 0.3s ease-out; }
        .animate-writeIn { animation: writeIn 2s ease-out; }
        
        .custom-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.4); border-radius: 10px; }
        .custom-scroll::-webkit-scrollbar-thumb:hover { background: rgba(139,92,246,0.7); }
        
        input[type="range"] { -webkit-appearance: none; height: 6px; border-radius: 10px; background: linear-gradient(90deg, #8b5cf6, #ec4899); outline: none; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%; background: white; box-shadow: 0 2px 8px rgba(139,92,246,0.5); cursor: pointer; transition: transform 0.2s; }
        input[type="range"]::-webkit-slider-thumb:hover { transform: scale(1.2); }
        input[type="range"]::-moz-range-thumb { width: 18px; height: 18px; border-radius: 50%; background: white; border: none; cursor: pointer; box-shadow: 0 2px 8px rgba(139,92,246,0.5); }
      `}</style>
    </div>
  );
}
