import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Character Counter & Word Counter (Free) - Textlyzer PRO | Hindi, English, Emoji",
  description: "Free online character counter & word counter. Count characters with/without spaces, words, sentences, paragraphs, emoji, reading time. Hindi + Hinglish + English support. SEO title checker, meta description checker, duplicate line remover, slug generator included.",
  keywords: [
    "character counter",
    "character counter online",
    "word counter",
    "word counter online",
    "character count",
    "letter counter",
    "text counter",
    "word count tool",
    "Hindi character counter",
    "Hinglish word counter",
    "character count without spaces",
    "word count with spaces",
    "SEO title checker",
    "meta description checker",
    "duplicate line remover",
    "remove duplicate lines",
    "slug generator",
    "reading time calculator",
    "text analyzer",
    "textlyzer"
  ],
  authors: [{ name: "Textlyzer" }],
  creator: "Textlyzer PRO",
  publisher: "Textlyzer",
  applicationName: "Textlyzer PRO",
  category: "Productivity",
  classification: "Text Tools",
  metadataBase: new URL("https://textlyzer.app"),
  alternates: {
    canonical: "/character-counter",
  },
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
    title: "Character Counter & Word Counter - Free Online Tool | Textlyzer PRO",
    description: "Count characters, words, sentences instantly. Supports Hindi, English, Hinglish & emoji. Free SEO tools: title checker, meta description checker, duplicate remover.",
    url: "https://textlyzer.app/character-counter",
    siteName: "Textlyzer PRO",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/og/character-counter.png",
        width: 1200,
        height: 630,
        alt: "Textlyzer Character Counter & Word Counter Tool",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Character Counter & Word Counter - Free | Textlyzer PRO",
    description: "Best free character counter & word counter for Hindi, English, Hinglish. Check SEO title, meta description, remove duplicates.",
    images: ["/og/character-counter.png"],
    creator: "@textlyzer",
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "name": "Textlyzer PRO - Character Counter & Word Counter",
        "url": "https://textlyzer.app/character-counter",
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Any",
        "description": "Free online character counter and word counter with Hindi support, SEO title and meta description checker, duplicate line remover and slug generator.",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
        "featureList": [
          "Character count with and without spaces",
          "Word count, sentence count, paragraph count",
          "Hindi and Hinglish word counter",
          "Emoji counter",
          "Reading time and speaking time calculator",
          "SEO title length checker 50-60 chars",
          "Meta description checker 150-160 chars",
          "Duplicate line remover with case-insensitive option",
          "Slug generator",
          "Base64 encode decode",
          "Voice typing and text to speech"
        ],
        "inLanguage": ["en", "hi"],
        "isAccessibleForFree": true
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://textlyzer.app/" },
          { "@type": "ListItem", "position": 2, "name": "Character Counter", "item": "https://textlyzer.app/character-counter" }
        ]
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          { "@type": "Question", "name": "What is a character counter?", "acceptedAnswer": { "@type": "Answer", "text": "A character counter counts characters, words, sentences, paragraphs. Textlyzer does it live for Hindi, English, Hinglish and emoji." }},
          { "@type": "Question", "name": "How to count characters without spaces?", "acceptedAnswer": { "@type": "Answer", "text": "Textlyzer shows two counts: total characters and characters without spaces, plus word count." }},
          { "@type": "Question", "name": "Does it support Hindi?", "acceptedAnswer": { "@type": "Answer", "text": "Yes, full Unicode Hindi and Hinglish support with accurate character counting." }},
          { "@type": "Question", "name": "What is duplicate line remover?", "acceptedAnswer": { "@type": "Answer", "text": "It removes repeated lines, keeps first occurrence, preserves order, with optional case-insensitive matching." }}
        ]
      },
      {
        "@type": "SoftwareApplication",
        "name": "Textlyzer Character Counter",
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.8",
          "ratingCount": "1247",
          "bestRating": "5",
          "worstRating": "1"
        }
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
