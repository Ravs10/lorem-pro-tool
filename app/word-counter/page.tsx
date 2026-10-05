import WordCounterClient from "./WordCounterClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Word Counter - Free Online Word & Character Counter Tool 2025",
  description: "Free online word counter tool to count words, characters, sentences, paragraphs, reading time & keyword density instantly. 100% free, no signup, private & accurate for essays, blogs and SEO.",
  keywords: ["word counter", "character counter", "word count tool", "online word counter", "count words online", "lorem pro tool word counter"],
  alternates: {
    canonical: "https://lorem-pro-tool.run4ravish.workers.dev/word-counter",
  },
  openGraph: {
    title: "Word Counter - Free Online Word & Character Counter",
    description: "Count words, characters, sentences & reading time instantly. Free and accurate tool for writers and students.",
    url: "https://lorem-pro-tool.run4ravish.workers.dev/word-counter",
    type: "website",
  },
};

export default function Page() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Word Counter Tool - Lorem Pro Tool",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Any",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
    "description": "Free tool to count words, characters, sentences, paragraphs and reading time."
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <WordCounterClient />
    </>
  );
}
