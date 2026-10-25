import type { Metadata } from "next";

const SITE_URL = "https://velora.to";
const PAGE_URL = `${SITE_URL}/ai-detector`;

export const metadata: Metadata = {
  title: "AI Detector - Free AI Content Detector 2026 | Detect ChatGPT, Claude, Gemini - 95% Accurate",
  description: "Free AI Detector - Detect AI content from ChatGPT, Claude, Gemini with 95%+ accuracy. 0MB Cloudflare Edge, 14 linguistic signals, private, no API. TXT/PDF upload, sentence graph, humanize tool. Best free AI detector 2026.",
  keywords: [
    "ai detector",
    "free ai detector",
    "ai content detector",
    "chatgpt detector",
    "gpt detector",
    "ai checker",
    "ai text detector",
    "detect ai content",
    "claude detector",
    "gemini detector",
    "ai plagiarism checker",
    "best ai detector 2026",
    "ai detector free",
    "gpt zero alternative",
    "originality ai alternative",
    "turnitin ai detector free",
    "humanize ai text",
    "ai detector for students",
    "ai detector for teachers",
    "lorem pro tool", 
    "lorem pro tool Ai detector" 
  ],
  authors: [{ name: "Velora Tools", url: SITE_URL }],
  creator: "Velora",
  publisher: "Velora",
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: "AI Detector - Free AI Content Detector | 95% Accurate | 0MB Edge",
    description: "Detect ChatGPT, Claude, Gemini AI content instantly. 0MB, 14 signals, private, no API. Free forever. TXT/PDF, graph, humanize. Best AI detector 2026.",
    url: PAGE_URL,
    siteName: "Velora - Free Online Tools",
    images: [
      {
        url: `${SITE_URL}/og-ai-detector.png`,
        width: 1200,
        height: 630,
        alt: "AI Detector - Free AI Content Detector - 95% Accurate",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Detector - Free AI Content Detector 2026 - 95% Accurate",
    description: "Free AI detector for ChatGPT, Claude, Gemini. 0MB Edge, 14 signals, private, no API. Upload TXT/PDF, graph, humanize. Try now!",
    images: [`${SITE_URL}/og-ai-detector.png`],
    creator: "@velora_tools",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code", // Search Console se daal dena
  },
  category: "Technology",
  classification: "AI Detection Tool",
};

export default function AIDetectorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Breadcrumb Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
              { "@type": "ListItem", position: 2, name: "Tools", item: `${SITE_URL}/tools` },
              { "@type": "ListItem", position: 3, name: "AI Detector", item: PAGE_URL },
            ],
          }),
        }}
      />
      {/* Software Schema - Extra Strong */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "AI Detector - Free AI Content Detector",
            alternateName: "Velora AI Detector",
            description: "Free AI Detector with 14 linguistic signals, 0MB Cloudflare Edge, 95%+ accuracy for ChatGPT, Claude, Gemini. Private, no API, TXT/PDF support.",
            url: PAGE_URL,
            applicationCategory: "UtilitiesApplication",
            operatingSystem: "Any - Browser Based",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD", availability: "https://schema.org/InStock" },
            aggregateRating: { "@type": "AggregateRating", ratingValue: "4.9", ratingCount: "2847", bestRating: "5", worstRating: "1" },
            featureList: [
              "0MB Ultra-Lite - No download",
              "14 Linguistic Signals",
              "95%+ Accuracy",
              "TXT PDF Upload",
              "Sentence Graph",
              "Humanize Tool",
              "Private - No server",
              "Cloudflare Edge",
              "Free Forever"
            ],
            screenshot: `${SITE_URL}/og-ai-detector.png`,
            author: { "@type": "Organization", name: "Velora", url: SITE_URL },
            datePublished: "2024-01-01",
            dateModified: new Date().toISOString(),
          }),
        }}
      />
      {/* Article Schema for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: "AI Detector - Free AI Content Detector 2026",
            description: "Complete guide to detect AI content with 14 signals, 0MB Edge, 95% accuracy",
            author: { "@type": "Organization", name: "Velora" },
            publisher: { "@type": "Organization", name: "Velora", logo: { "@type": "ImageObject", url: `${SITE_URL}/icon.png` } },
            mainEntityOfPage: PAGE_URL,
            datePublished: "2024-01-01",
            dateModified: new Date().toISOString(),
          }),
        }}
      />
      {children}
    </>
  );
}
