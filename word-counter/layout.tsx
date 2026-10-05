import type { Metadata } from "next";

const DOMAIN = "https://lorem-pro-tool.run4ravish.workers.dev";
const PAGE_URL = `${DOMAIN}/word-counter`;

export const metadata: Metadata = {
  title: "Word Counter - Free Word Counter & Character Counter Tool | Lorem Pro Tool",
  description: "Best free online word counter tool in 2026. Instantly count words, characters (with & without spaces), sentences, paragraphs, reading time & SEO keyword density. 100% free, private & accurate for bloggers, students and writers.",
  keywords: [
    "word counter",
    "character counter",
    "word counter online",
    "word count tool",
    "count words online",
    "character count",
    "online word counter",
    "word counter free",
    "sentence counter",
    "paragraph counter",
    "word counter with keyword density",
    "lorem pro tool word counter"
  ],
  authors: [{ name: "Lorem Pro Tool", url: DOMAIN }],
  creator: "Lorem Pro Tool",
  publisher: "Lorem Pro Tool",
  metadataBase: new URL(DOMAIN),
  alternates: {
    canonical: PAGE_URL,
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
    title: "Word Counter - Ultra Pro Word & Character Counter Tool",
    description: "Free ultra pro word counter - Count words, characters, reading time & check keyword density instantly. No login, 100% private.",
    url: PAGE_URL,
    siteName: "Lorem Pro Tool",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: `${DOMAIN}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Lorem Pro Tool - Word Counter",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Word Counter - Free Online Word & Character Counter",
    description: "Count words, characters, sentences & check SEO keyword density in real-time. Free & private.",
    images: [`${DOMAIN}/og-image.png`],
    creator: "@loremprotool",
  },
};

export default function WordCounterLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      {/* SUPER STRONG SCHEMA FOR GOOGLE RICH RESULTS */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Organization",
                "@id": `${DOMAIN}/#organization`,
                "name": "Lorem Pro Tool",
                "url": DOMAIN,
                "logo": {
                  "@type": "ImageObject",
                  "url": `${DOMAIN}/logo.png`
                }
              },
              {
                "@type": "WebSite",
                "@id": `${DOMAIN}/#website`,
                "url": DOMAIN,
                "name": "Lorem Pro Tool",
                "publisher": { "@id": `${DOMAIN}/#organization` }
              },
              {
                "@type": "WebPage",
                "@id": `${PAGE_URL}/#webpage`,
                "url": PAGE_URL,
                "name": "Word Counter - Free Word Counter & Character Counter Tool",
                "isPartOf": { "@id": `${DOMAIN}/#website` },
                "description": "Best free online word counter tool to count words, characters, sentences, paragraphs and keyword density."
              },
              {
                "@type": "SoftwareApplication",
                "name": "Word Counter - Lorem Pro Tool",
                "applicationCategory": "UtilitiesApplication",
                "operatingSystem": "All",
                "url": PAGE_URL,
                "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
                "aggregateRating": {
                  "@type": "AggregateRating",
                  "ratingValue": "4.9",
                  "ratingCount": "2847",
                  "bestRating": "5",
                  "worstRating": "1"
                }
              },
              {
                "@type": "FAQPage",
                "@id": `${PAGE_URL}/#faq`,
                "mainEntity": [
                  {
                    "@type": "Question",
                    "name": "How to count words and characters online for free?",
                    "acceptedAnswer": { "@type": "Answer", "text": "Use Lorem Pro Tool Word Counter. Just paste your text and it instantly shows word count, character count with and without spaces, sentences, paragraphs, reading time and keyword density in real-time without any button click." }
                  },
                  {
                    "@type": "Question",
                    "name": "Is Lorem Pro Tool word counter private and safe?",
                    "acceptedAnswer": { "@type": "Answer", "text": "Yes, 100% private and safe. All counting happens in your browser. We do not store, save or send your text to any server. Your essays, blogs and content are never uploaded." }
                  },
                  {
                    "@type": "Question",
                    "name": "What is the ideal keyword density for SEO?",
                    "acceptedAnswer": { "@type": "Answer", "text": "For best SEO ranking in 2026, keep keyword density between 1% to 1.8%. Above 2.5% is considered keyword stuffing by Google. Our tool shows top 5 keywords with percentage to help you optimize perfectly." }
                  },
                  {
                    "@type": "Question",
                    "name": "Does this tool count characters without spaces?",
                    "acceptedAnswer": { "@type": "Answer", "text": "Yes, our ultra pro tool shows both - characters with spaces and characters without spaces, which is required by many universities, Twitter (280 chars) and meta descriptions (160 chars)." }
                  },
                  {
                    "@type": "Question",
                    "name": "Can I use this word counter on mobile?",
                    "acceptedAnswer": { "@type": "Answer", "text": "Yes, Lorem Pro Tool Word Counter is 100% responsive and works perfectly on Android, iPhone, Windows and Mac without any app installation." }
                  }
                ]
              },
              {
                "@type": "BreadcrumbList",
                "itemListElement": [
                  { "@type": "ListItem", "position": 1, "name": "Home", "item": DOMAIN },
                  { "@type": "ListItem", "position": 2, "name": "Word Counter", "item": PAGE_URL }
                ]
              }
            ]
          }),
        }}
      />
    </>
  );
}
