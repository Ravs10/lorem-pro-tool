import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://lorem-pro-tool.run4ravish.workers.dev"),
  title: "Text to Handwriting Generator - Convert Text to Handwriting Online Free",
  description: "Free Text to Handwriting Generator. Convert typed text into realistic handwritten notes in 15+ languages including English, Hindi, Bengali, Tamil, Telugu, Marathi, Urdu, Arabic & Vietnamese. Download as PNG & PDF. No signup.",
  keywords: ["text to handwriting", "handwriting generator", "text to handwriting converter", "handwriting maker", "hindi handwriting generator", "convert text to handwriting pdf", "lorem pro tool", "lipsum pro", "Lorem Ipsum Generator", "lorem pro"],
  openGraph: {
    title: "Text to Handwriting Generator - Free Online Tool",
    description: "Convert any text into beautiful handwriting in 15+ languages. Download PNG & PDF.",
    url: "https://lorem-pro-tool.run4ravish.workers.dev/text-to-handwriting",
    type: "website",
    siteName: "Lorem Pro",
    images: [
      {
        url: "/og-handwriting.png",
        width: 1200,
        height: 630,
        alt: "Text to Handwriting Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Text to Handwriting Generator - Free Online Tool",
    description: "Convert any text into beautiful handwriting in 15+ languages. Download PNG & PDF.",
    images: ["/og-handwriting.png"],
  },
  alternates: { canonical: "https://lorem-pro-tool.run4ravish.workers.dev/text-to-handwriting" },
  robots: { index: true, follow: true },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      { "@type": "Question", name: "Is Text to Handwriting Generator free?", acceptedAnswer: { "@type": "Answer", text: "Yes, it is 100% free. No signup, no watermark, unlimited downloads in PNG and PDF." } },
      { "@type": "Question", name: "Can I generate Hindi handwriting?", acceptedAnswer: { "@type": "Answer", text: "Yes, you can generate handwriting in Hindi, English, Bengali, Tamil, Telugu, Marathi, Arabic, Urdu, Vietnamese and more with native fonts." } },
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
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      {children}
    </>
  );
}
