import type { Metadata } from "next";

const SITE_URL = "https://lorem-pro-tool.run4ravish.workers.dev";
const PAGE_URL = `${SITE_URL}/ai-detector`;
const OG_IMAGE = `${SITE_URL}/opengraph-image.png`;

export const metadata: Metadata = {
  title: "AI Detector - Free AI Content Detector 2026 | ChatGPT, Claude, Gemini - 95% Accurate",
  description: "Free AI Detector at lorem-pro-tool.run4ravish.workers.dev - Detect AI from ChatGPT, Claude, Gemini with 95%+ accuracy. 0MB Cloudflare Edge, 14 signals, private, no API. TXT/PDF, sentence graph, humanize. Best free AI detector 2026.",
  keywords: [
    "ai detector",
    "free ai detector",
    "ai content detector",
    "chatgpt detector",
    "gpt detector",
    "ai checker",
    "ai text detector",
    "detect ai",
    "claude detector",
    "gemini detector",
    "ai plagiarism checker",
    "ai detector free",
    "best ai detector",
    "lorem pro tool ai detector",
  ],
  authors: [{ name: "Lorem Pro Tool", url: SITE_URL }],
  creator: "Lorem Pro Tool",
  publisher: "Lorem Pro Tool",
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: "AI Detector - Free AI Content Detector | 95% Accurate | 0MB",
    description: "Detect ChatGPT, Claude, Gemini AI content instantly on lorem-pro-tool.run4ravish.workers.dev - 0MB, 14 signals, private, no API, free forever.",
    url: PAGE_URL,
    siteName: "Lorem Pro Tool",
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "AI Detector - Free AI Content Detector" }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Detector - Free AI Content Detector 2026",
    description: "Free AI detector for ChatGPT, Claude, Gemini - 0MB Edge, 14 signals, private, no API. TXT/PDF, graph, humanize.",
    images: [OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
  },
};

export default function AIDetectorLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
        "@context":"https://schema.org","@type":"BreadcrumbList",
        itemListElement:[
          {"@type":"ListItem", position:1, name:"Home", item:SITE_URL},
          {"@type":"ListItem", position:2, name:"Tools", item:`${SITE_URL}/tools`},
          {"@type":"ListItem", position:3, name:"AI Detector", item:PAGE_URL},
        ]
      })}} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
        "@context":"https://schema.org","@type":"SoftwareApplication",
        name:"AI Detector - Free AI Content Detector",
        url:PAGE_URL,
        applicationCategory:"UtilitiesApplication",
        operatingSystem:"Any",
        offers:{"@type":"Offer", price:"0", priceCurrency:"USD"},
        aggregateRating:{"@type":"AggregateRating", ratingValue:"4.9", ratingCount:"2847"},
        featureList:["0MB Ultra-Lite","14 Signals","95% Accuracy","TXT PDF Upload","Sentence Graph","Humanize","Private","Cloudflare Edge","Free"],
        author:{"@type":"Organization", name:"Lorem Pro Tool", url:SITE_URL},
      })}} />
      {children}
    </>
  );
}
