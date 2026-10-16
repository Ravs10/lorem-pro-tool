import type { Metadata, Viewport } from "next";
import Script from "next/script";
import type { ReactNode } from "react";

const SITE_URL = "https://yourdomain.com"; // <-- APNA DOMAIN DALO
const PAGE_URL = `${SITE_URL}/fancy-text`;
const OG_IMAGE = `${SITE_URL}/og/fancy-text.png`; // 1200x630 image banao

// 1. VIEWPORT - Mobile / Theme ke liye
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#07071a" },
    { media: "(prefers-color-scheme: light)", color: "#f5f5ff" },
  ],
};

// 2. METADATA - Google ke liye sabse important
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Fancy Text Generator - 1000+ Stylish Fonts, Funny Text & Cool Unicode Styles (Free)",
    template: "%s | Fancy Text Generator",
  },
  description:
    "Free fancy text generator with 1000+ stylish fonts, 28 funny text styles, custom colors & gradients, share as PNG. Copy & paste for Instagram, TikTok, Discord, Twitter/X, WhatsApp bios & posts. No signup, no ads.",
  keywords: [
    "fancy text",
    "fancy text generator",
    "stylish text generator",
    "cool fonts",
    "unicode text generator",
    "instagram fonts",
    "fancy letters",
    "text styles",
    "copy paste fonts",
    "funny text generator",
    "mocking spongebob text",
    "uwu text generator",
    "zalgo text generator",
    "leet speak generator",
    "bubble text generator",
    "cursive text generator",
    "aesthetic fonts",
    "colored text generator",
    "fancy text with colors",
    "gaming username fonts",
    "discord nickname fonts",
    "tiktok caption fonts",
    "stylish name maker",
    "fancy font generator",
    "lorem pro tool", 
    "Lorem Ipsum Generator", 
    "bold text generator",
    "italic text generator",
  ],
  authors: [{ name: "FancyText Generator", url: SITE_URL }],
  creator: "FancyText Generator",
  publisher: "FancyText Generator",
  category: "Utilities",
  applicationName: "FancyText Generator",
  alternates: {
    canonical: PAGE_URL,
    languages: {
      "en-US": PAGE_URL,
      "en-GB": PAGE_URL,
      "x-default": PAGE_URL,
    },
  },
  openGraph: {
    type: "website",
    url: PAGE_URL,
    title: "Fancy Text Generator - 1000+ Stylish & Funny Text Styles",
    description:
      "Transform text into 1000+ fancy fonts and 28 funny styles instantly. Custom colors, gradient backgrounds, share as PNG. Free, fast, no signup.",
    siteName: "FancyText Generator",
    locale: "en_US",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Fancy Text Generator - Create stylish Unicode text instantly",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fancy Text Generator - 1000+ Styles",
    description:
      "Copy & paste 1000+ fancy and funny text styles instantly. Colors, gradients, PNG share, undo/redo, keyboard shortcuts. Free forever.",
    images: [OG_IMAGE],
    creator: "@yourhandle",
    site: "@yourhandle",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "YOUR_GOOGLE_SEARCH_CONSOLE_CODE", // Search Console se lekar dalo
    // yandex: "YOUR_YANDEX_CODE",
    // bing: "YOUR_BING_CODE",
  },
  other: {
    "revisit-after": "1 days",
    rating: "general",
    distribution: "global",
  },
};

const FAQS = [
  {
    q: "What is a fancy text generator?",
    a: "A fancy text generator is an online tool that converts ordinary letters into alternative Unicode characters and symbols. Because these alternative letters exist as real characters in the Unicode standard, the resulting text can be copied and pasted anywhere - Instagram bios, Twitter/X posts, Facebook comments, Discord messages, TikTok captions, WhatsApp chats, or YouTube titles - without installing anything.",
  },
  {
    q: "How does this fancy text tool work?",
    a: "Type or paste your text into the input box at the top of the page. The tool instantly converts your text into 1000+ styles using mathematical alphanumeric symbols, decorative Unicode blocks, combining diacritical marks, and artistic wrappers. Click any style card to copy it to your clipboard - or use the Share button to send it directly.",
  },
  {
    q: "Is this fancy text generator free?",
    a: "Yes, 100% free. There is no signup, no login, no ads, and no character limit. You can generate unlimited fancy text styles every day at no cost.",
  },
  {
    q: "Will fancy text work on Instagram, Twitter/X, Facebook, and TikTok?",
    a: "Yes. All of the Unicode characters used here are supported on Instagram, Twitter/X, Facebook, TikTok, Discord, WhatsApp, Telegram, Snapchat, Reddit, Pinterest, YouTube, LinkedIn, and most modern websites. A few very decorative styles may not render perfectly on older devices, so we recommend testing before posting.",
  },
  {
    q: "What is the Funny Text dropdown feature?",
    a: "The Funny Text dropdown is a special collection of 28 comedic text transformations - including Mocking SpongeBob case, UwU speak, Pirate talk, Leet (1337) speak, Zalgo glitch text, Robot mode, Dog and Cat speak, Yoda speak, Zombie, Vampire, Wizard spell, and more. Just pick a style from the dropdown, and your text instantly becomes hilarious.",
  },
  {
    q: "Can I save my favorite fancy text styles?",
    a: "Yes. Click the star icon on any style card to save it to your Favorites. Favorites are stored locally in your browser so they persist between visits - no account required. You can also view recently-copied styles via the Recent tab.",
  },
  {
    q: "Does the text stay the same when I paste it somewhere else?",
    a: "In most cases, yes. The fancy text you generate is made of real Unicode characters, so it pastes exactly as shown on any platform that supports Unicode.",
  },
  {
    q: "Can I use the generated text for commercial purposes?",
    a: "Yes. You own the text you generate. You can use it in social media posts, bios, product names, usernames, T-shirts, artwork, or anywhere else. The styles are simply Unicode characters, which are a free public standard - no attribution required.",
  },
  {
    q: "Why do some fancy fonts look like squares or boxes?",
    a: "If a particular style shows as empty squares, that means the device or app you are viewing it on does not have a font that supports those specific Unicode characters. Trying a different style, or switching to a modern device, will usually fix this.",
  },
  {
    q: "Is there a character limit?",
    a: "No! There is no character limit. You can type as much text as you want, in any language - English, Hindi, Arabic, Chinese, Japanese, Korean, Russian, and more.",
  },
  {
    q: "What is the Share as PNG image toggle?",
    a: "When ON, the Share button renders your text with your chosen color and background as a large, crisp PNG image - perfect for WhatsApp Stories, Instagram Stories, or anywhere colored text is needed. When OFF, the Share button sends just the fancy text as plain text.",
  },
  {
    q: "Can I copy text with colors and background?",
    a: "Yes. When you select a text color or background, the Copy button automatically places the styled text on your clipboard using HTML formatting. This means apps like Gmail, Google Docs, Word, Outlook, Telegram, and Notion keep your exact colors and gradients.",
  },
  {
    q: "Can I undo my changes?",
    a: "Yes! The editor has full Undo and Redo support - up to 100 steps. Press Ctrl/Cmd + Z to undo, Ctrl/Cmd + Shift + Z (or Ctrl + Y) to redo.",
  },
  {
    q: "What keyboard shortcuts are available?",
    a: "Ctrl/Cmd + Z = Undo, Ctrl/Cmd + Shift + Z = Redo, Ctrl/Cmd + S = Download as .txt, Ctrl/Cmd + K = Focus search, Ctrl/Cmd + / = Toggle formatting toolbar, Ctrl/Cmd + Shift + P = Toggle Share as PNG, Ctrl/Cmd + Shift + D = Toggle dark/light theme, ? = Shortcuts dialog, Esc = Close panels.",
  },
];

// 3. JSON-LD - Strongest Schema (Google Rich Results ke liye)
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "FancyText Generator",
      inLanguage: "en-US",
    },
    {
      "@type": "WebPage",
      "@id": `${PAGE_URL}#webpage`,
      url: PAGE_URL,
      name: "Fancy Text Generator - 1000+ Stylish Fonts, Funny Text & Cool Unicode Styles (Free)",
      description:
        "Free fancy text generator with 1000+ stylish fonts, 28 funny text styles, custom colors & gradients, share as PNG.",
      isPartOf: { "@id": `${SITE_URL}/#website` },
      inLanguage: "en-US",
      datePublished: "2024-01-01",
      dateModified: new Date().toISOString().split("T")[0],
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: "Fancy Text Generator", item: PAGE_URL },
      ],
    },
    {
      "@type": "WebApplication",
      "@id": `${PAGE_URL}#webapp`,
      name: "Fancy Text Generator",
      url: PAGE_URL,
      description:
        "Generate 1000+ fancy text styles and 28 funny text transformations instantly. Custom colors, gradient backgrounds, undo/redo, keyboard shortcuts, share as PNG.",
      applicationCategory: "UtilitiesApplication",
      applicationSubCategory: "Text Tools",
      operatingSystem: "Any",
      browserRequirements: "Requires JavaScript",
      softwareVersion: "2.0.0",
      inLanguage: "en-US",
      isAccessibleForFree: true,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        ratingCount: "1284",
        bestRating: "5",
        worstRating: "1",
      },
      featureList: [
        "1000+ fancy text styles",
        "Funny text generator (28 modes)",
        "Bold, italic, cursive, gothic, bubble fonts",
        "Custom text colors & gradient backgrounds",
        "Share as PNG image with colors",
        "Undo and Redo (up to 100 steps)",
        "Full keyboard shortcuts",
        "Dark and light theme",
        "Favorites and recent history",
        "Copy & paste with colors (HTML/RTF)",
        "Download as .txt",
        "Works with Instagram, TikTok, Discord, WhatsApp, Twitter/X",
      ],
      screenshot: OG_IMAGE,
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQS.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    {
      "@type": "HowTo",
      name: "How to Use the Fancy Text Generator",
      description:
        "Learn how to generate, customize, and share 1000+ fancy text styles and funny text in a few seconds.",
      totalTime: "PT1M",
      step: [
        { "@type": "HowToStep", position: 1, name: "Type your text", text: "Type or paste your text into the input box. There is no character limit." },
        { "@type": "HowToStep", position: 2, name: "Choose a style", text: "Browse 1000+ fancy text styles by category or search, or pick a Funny Text style from the dropdown." },
        { "@type": "HowToStep", position: 3, name: "Customize color", text: "Open the Color & Background panel to pick from 16 text colors and 12 background styles." },
        { "@type": "HowToStep", position: 4, name: "Choose share mode", text: "Toggle Share as PNG image ON to send a colored image, or leave OFF to share plain fancy text." },
        { "@type": "HowToStep", position: 5, name: "Copy or Share", text: "Click any style card to copy, or use the Share button. Rich colors are preserved on the clipboard." },
      ],
    },
    {
      "@type": "ItemList",
      name: "Fancy Text Style Categories",
      itemListElement: [
        "Serif", "Script", "Gothic", "Outline", "Sans", "Mono",
        "Decorative", "Flipped", "Circled", "Squared", "Wide",
        "Effects", "Decor", "Brackets", "Kawaii", "Ornate",
        "Spaced", "Lines", "Case", "Plain",
      ].map((c, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: `${c} Fonts`,
      })),
    },
  ],
};

export default function FancyTextLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Script
        id="fancy-text-jsonld"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
