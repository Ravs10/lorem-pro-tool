import type { Metadata } from "next";
import WordCounterClient from "./WordCounterClient";

export const metadata: Metadata = {
  title: "Word Counter - Free Online Word & Character Counter Tool 2026",
  description: "Free online word counter tool to count words, characters, sentences, paragraphs, reading time & keyword density instantly. 100% free, no signup, private & accurate for essays, blogs and SEO.",
  keywords: ["word counter", "character counter", "word count tool", "online word counter", "count words online", "lorem pro tool word counter"],
  alternates: {
    canonical: "https://lorem-pro-tool.run4ravish.workers.dev/word-counter",
  },
  openGraph: {
    title: "Word Counter - Free Online Word & Character Counter Tool 2026",
    description: "Count words, characters, sentences & reading time instantly. Free and accurate tool for writers and students.",
    url: "https://lorem-pro-tool.run4ravish.workers.dev/word-counter",
    type: "website",
    images: [{ url: "/icon.png", width: 512, height: 512, alt: "Word Counter" }],
  },
};

export default function Page() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "@id": "https://lorem-pro-tool.run4ravish.workers.dev/word-counter#app",
        name: "Word Counter Tool - Lorem Pro Tool",
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Any",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        description: "Free tool to count words, characters, sentences, paragraphs and reading time.",
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.8",
          ratingCount: "1250",
          bestRating: "5",
          worstRating: "1",
        },
        featureList: ["Real-time word count", "Character counter", "Grammar check", "Readability score", "Keyword density", "40+ writing tools"],
      },
      {
        "@type": "FAQPage",
        "@id": "https://lorem-pro-tool.run4ravish.workers.dev/word-counter#faq",
        mainEntity: [
          { "@type": "Question", name: "Is Word Counter free?", acceptedAnswer: { "@type": "Answer", text: "Yes, 100% free forever. No signup, no limits, 100% private." } },
          { "@type": "Question", name: "Is my text saved on servers?", acceptedAnswer: { "@type": "Answer", text: "No. Everything runs in your browser using localStorage." } },
          { "@type": "Question", name: "What is ideal keyword density?", acceptedAnswer: { "@type": "Answer", text: "1-2% ideal. Above 3% is keyword stuffing." } },
        ],
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://lorem-pro-tool.run4ravish.workers.dev/" },
          { "@type": "ListItem", position: 2, name: "Word Counter", item: "https://lorem-pro-tool.run4ravish.workers.dev/word-counter" },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <WordCounterClient />
    </>
  );
}
