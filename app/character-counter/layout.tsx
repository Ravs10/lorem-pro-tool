import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Character Counter & Word Counter (Free) - Textlyzer PRO",
  description: "Free character counter & word counter. Count characters with/without spaces, words, sentences, paragraphs, emoji, reading time. Hindi + Hinglish + English support with SEO title checker & duplicate remover.",
  metadataBase: new URL("https://lorem-pro-tool.run4ravish.workers.dev"),
  alternates: {
    canonical: "/character-counter",
  },
  authors: [{ name: "Textlyzer" }],
  creator: "Textlyzer PRO",
  publisher: "Textlyzer",
  applicationName: "Textlyzer PRO",
  category: "Productivity",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Character Counter & Word Counter - Free Tool | Textlyzer PRO",
    description: "Count characters, words, sentences instantly. Hindi, English, Hinglish & emoji support. Free SEO tools included.",
    url: "https://lorem-pro-tool.run4ravish.workers.dev/character-counter",
    siteName: "Textlyzer PRO",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "https://lorem-pro-tool.run4ravish.workers.dev/character-counter/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Textlyzer Character Counter & Word Counter Tool",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Character Counter & Word Counter - Free | Textlyzer PRO",
    description: "Best free character counter & word counter for Hindi, English, Hinglish. SEO title checker & duplicate remover included.",
    images: ["https://lorem-pro-tool.run4ravish.workers.dev/character-counter/opengraph-image.png"],
    creator: "@textlyzer",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Textlyzer PRO - Character Counter & Word Counter",
        url: "https://lorem-pro-tool.run4ravish.workers.dev/character-counter",
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Any",
        description: "Free online character counter and word counter with Hindi support, SEO title checker, duplicate remover and slug generator.",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        featureList: [
          "Character count with and without spaces",
          "Word count, sentence count, paragraph count",
          "Hindi and Hinglish word counter",
          "Emoji counter",
          "Reading time and speaking time calculator",
          "SEO title length checker 50-60 chars",
          "Meta description checker 150-160 chars",
          "Duplicate line remover with case-insensitive option",
          "Slug generator",
          "Base64 encode decode", "lorem pro tool", "lorem pro tool character counter", 
          "Voice typing and text to speech"
        ],
        inLanguage: ["en", "hi"],
        isAccessibleForFree: true
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://lorem-pro-tool.run4ravish.workers.dev/" },
          { "@type": "ListItem", position: 2, name: "Character Counter", item: "https://lorem-pro-tool.run4ravish.workers.dev/character-counter" }
        ]
      }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {children}
    </>
  );
}
