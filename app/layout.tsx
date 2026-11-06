import "./globals.css";
import type { Metadata } from "next";
import Header from "./components/Header";
import Footer from "./components/Footer";
import GlobalBannerWrapper from "./components/GlobalBannerWrapper";

const SITE_URL = "https://lorem-pro-tool.run4ravish.workers.dev";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Lorem Pro Tool - 26 Free Online Tools | Lorem Ipsum, Calculators & AI Tools",
    template: "%s | Lorem Pro Tool",
  },
  description:
    "26 Free Online Tools in One Place. Lorem Ipsum Generator in 77 Languages, FD, RD, SIP, Income Tax & EMI Calculator, Word Counter, AI Detector, Password Generator, QR Generator, YouTube Tools & More. 100% Free, No Login, No Signup.",
  keywords: [
    "lorem pro tool",
    "free online tools",
    "online tools free",
    "all in one tools",
    "free tools website",
    "best online tools",
    "lorem ipsum generator",
    "lorem ipsum generator 77 languages",
    "dummy text generator",
    "placeholder text generator",
    "hindi lorem ipsum",
    "fd calculator",
    "fd rd calculator",
    "fd rd compound calculator",
    "fixed deposit calculator",
    "rd calculator",
    "sip calculator",
    "mutual fund sip calculator",
    "fire calculator",
    "mortgage calculator",
    "home loan emi calculator",
    "personal loan emi calculator",
    "personal loan calculator",
    "income tax calculator",
    "income tax calculator india",
    "word counter",
    "character counter",
    "case converter",
    "uppercase lowercase converter",
    "fancy text",
    "stylish fancy text generator",
    "slug generator",
    "seo slug generator",
    "remove duplicates",
    "remove duplicate lines",
    "text to handwriting",
    "resume builder",
    "free resume builder",
    "youtube title generator",
    "youtube earnings calculator",
    "youtube money calculator",
    "youtube thumbnail downloader",
    "hashtag generator",
    "avatar generator",
    "avatar maker",
    "ai detector",
    "ai content detector",
    "password generator",
    "strong password generator",
    "fake data generator",
    "image to text",
    "ocr image to text",
    "color palette generator",
    "placeholder qr generator",
    "qr code generator",
    "placeholder image generator",
  ],
  authors: [{ name: "Ravish", url: SITE_URL }],
  creator: "Ravish",
  publisher: "Lorem Pro Tool",
  category: "Tools",
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
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: "Lorem Pro Tool",
    title: "Lorem Pro Tool - 26 Free Online Tools in One Place",
    description:
      "Lorem Ipsum in 77 Languages, FD, SIP, Income Tax Calculator, Word Counter, AI Detector, QR Generator & YouTube Tools. 100% Free, No Login.",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Lorem Pro Tool - 26 Free Online Tools",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lorem Pro Tool - 26 Free Online Tools in One Place",
    description:
      "Lorem Ipsum in 77 Languages, FD, SIP, Income Tax Calculator, Word Counter, AI Detector & More. 100% Free, No Login.",
    images: ["/opengraph-image.png"],
    creator: "@loremprotool",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: "Lorem Pro Tool",
        description: "26 Free Online Tools - Lorem Ipsum Generator, Calculators, Text Tools, AI Tools & YouTube Tools",
        inLanguage: "en",
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: "Lorem Pro Tool",
        url: SITE_URL,
        logo: `${SITE_URL}/opengraph-image.png`,
      },
      {
        "@type": "ItemList",
        name: "26 Free Online Tools",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Lorem Ipsum Generator", url: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "FD RD Compound Calculator", url: `${SITE_URL}/fd-rd-calculator` },
          { "@type": "ListItem", position: 3, name: "SIP Calculator", url: `${SITE_URL}/sip-calculator` },
          { "@type": "ListItem", position: 4, name: "FIRE Calculator", url: `${SITE_URL}/fire-calculator` },
          { "@type": "ListItem", position: 5, name: "Mortgage Calculator", url: `${SITE_URL}/mortgage-calculator` },
          { "@type": "ListItem", position: 6, name: "Personal Loan EMI Calculator", url: `${SITE_URL}/personal-loan-emi-calculator` },
          { "@type": "ListItem", position: 7, name: "Income Tax Calculator", url: `${SITE_URL}/income-tax-calculator` },
          { "@type": "ListItem", position: 8, name: "Word Counter", url: `${SITE_URL}/word-counter` },
          { "@type": "ListItem", position: 9, name: "Character Counter", url: `${SITE_URL}/character-counter` },
          { "@type": "ListItem", position: 10, name: "Case Converter", url: `${SITE_URL}/case-converter` },
          { "@type": "ListItem", position: 11, name: "Fancy Text Generator", url: `${SITE_URL}/fancy-text` },
          { "@type": "ListItem", position: 12, name: "Slug Generator", url: `${SITE_URL}/slug-generator` },
          { "@type": "ListItem", position: 13, name: "Remove Duplicates", url: `${SITE_URL}/remove-duplicates` },
          { "@type": "ListItem", position: 14, name: "Text to Handwriting", url: `${SITE_URL}/text-to-handwriting` },
          { "@type": "ListItem", position: 15, name: "Resume Builder", url: `${SITE_URL}/resume-builder` },
          { "@type": "ListItem", position: 16, name: "YouTube Title Generator", url: `${SITE_URL}/youtube-title-generator` },
          { "@type": "ListItem", position: 17, name: "YouTube Earnings Calculator", url: `${SITE_URL}/youtube-earnings-calculator` },
          { "@type": "ListItem", position: 18, name: "YouTube Thumbnail Downloader", url: `${SITE_URL}/youtube-thumbnail-downloader` },
          { "@type": "ListItem", position: 19, name: "Hashtag Generator", url: `${SITE_URL}/hashtag-generator` },
          { "@type": "ListItem", position: 20, name: "Avatar Generator", url: `${SITE_URL}/avatar` },
          { "@type": "ListItem", position: 21, name: "AI Detector", url: `${SITE_URL}/ai-detector` },
          { "@type": "ListItem", position: 22, name: "Password Generator", url: `${SITE_URL}/password-generator` },
          { "@type": "ListItem", position: 23, name: "Fake Data Generator", url: `${SITE_URL}/fake-data-generator` },
          { "@type": "ListItem", position: 24, name: "Image to Text", url: `${SITE_URL}/image-to-text` },
          { "@type": "ListItem", position: 25, name: "Color Palette Generator", url: `${SITE_URL}/color-palette` },
          { "@type": "ListItem", position: 26, name: "Placeholder QR Generator", url: `${SITE_URL}/placeholder-qr-generator` },
        ],
      },
    ],
  };

  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Header />
        <GlobalBannerWrapper />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
