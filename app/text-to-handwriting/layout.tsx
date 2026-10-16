import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Text to Handwriting Generator - Convert Text to Handwriting Online Free",
  description: "Free Text to Handwriting Generator. Convert typed text into realistic handwritten notes in English, Hindi, Bengali, Tamil, Telugu, Arabic & more. Download as PNG & PDF. No signup.",
  keywords: ["text to handwriting", "handwriting generator", "text to handwriting converter", "handwriting maker", "hindi handwriting generator", "convert text to handwriting pdf"],
  openGraph: {
    title: "Text to Handwriting Generator - Free Online Tool",
    description: "Convert any text into beautiful handwriting in 10+ languages. Download PNG & PDF.",
    type: "website",
  },
  alternates: { canonical: "/text-to-handwriting" },
  robots: { index: true, follow: true },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      { "@type": "Question", name: "Is Text to Handwriting Generator free?", acceptedAnswer: { "@type": "Answer", text: "Yes, it is 100% free. No signup, no watermark, unlimited downloads in PNG and PDF." } },
      { "@type": "Question", name: "Can I generate Hindi handwriting?", acceptedAnswer: { "@type": "Answer", text: "Yes, you can generate handwriting in Hindi, English, Bengali, Tamil, Telugu, Marathi, Arabic, Urdu and more with native fonts." } },
      { "@type": "Question", name: "Can I download as PDF?", acceptedAnswer: { "@type": "Answer", text: "Yes, you can download your handwritten page as high-quality PNG image and A4 PDF." } },
      { "@type": "Question", name: "Is my text safe?", acceptedAnswer: { "@type": "Answer", text: "Yes, all conversion happens in your browser. We never save or upload your text to any server." } },
      { "@type": "Question", name: "Can I use it for assignments?", acceptedAnswer: { "@type": "Answer", text: "You can use it for practice, notes, quotes and design. For school assignments, always follow your teacher's rules." } },
    ],
  };

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Text to Handwriting Generator",
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    aggregateRating: { "@type": "AggregateRating", ratingValue: "4.8", ratingCount: "1240" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      {children}
    </>
  );
}
