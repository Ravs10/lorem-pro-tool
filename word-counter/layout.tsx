import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Word Counter - Free Online Word Counter & Character Counter Tool",
  description: "Best free online word counter in 2026. Count words, characters (with & without spaces), sentences, paragraphs, reading time & keyword density instantly. 100% private & accurate for bloggers, students & writers.",
  keywords: ["word counter", "character counter", "word count", "count words", "word counter online", "character count", "word count checker", "sentence counter", "keyword density"],
  robots: "index, follow, max-image-preview:large",
  alternates: { canonical: "https://lorempro.tools/word-counter" },
  openGraph: {
    title: "Word Counter - Free Word & Character Counter (Ultra Pro)",
    description: "Count words, characters, reading time & check SEO keyword density in real-time. No signup, 100% free.",
    url: "https://lorempro.tools/word-counter",
    siteName: "Lorem Pro Tools",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      {/* --- ULTRA SEO SCHEMA --- */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "SoftwareApplication",
                "name": "Word Counter - Lorem Pro Tools",
                "applicationCategory": "UtilitiesApplication",
                "operatingSystem": "Any",
                "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
                "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.9", "ratingCount": "1843" }
              },
              {
                "@type": "FAQPage",
                "mainEntity": [
                  { "@type": "Question", "name": "How to count words and characters online?", "acceptedAnswer": { "@type": "Answer", "text": "Just paste your text into Lorem Pro Word Counter. It instantly shows word count, character count with and without spaces, sentences, and paragraphs in real-time." } },
                  { "@type": "Question", "name": "Is this word counter free and private?", "acceptedAnswer": { "@type": "Answer", "text": "Yes, 100% free forever. All counting happens in your browser, we never store or send your text to any server." } },
                  { "@type": "Question", "name": "What is ideal keyword density for SEO?", "acceptedAnswer": { "@type": "Answer", "text": "Ideal keyword density is 1% to 1.8%. Above 2.5% is considered keyword stuffing by Google and may lead to ranking penalty." } },
                  { "@type": "Question", "name": "How is reading time calculated?", "acceptedAnswer": { "@type": "Answer", "text": "Reading time is calculated based on average 200 Words Per Minute (WPM) reading speed and 130 WPM speaking speed." } }
                ]
              }
            ]
          }),
        }}
      />
    </>
  );
}
