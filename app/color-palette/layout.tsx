import type { Metadata } from "next";

const SITE_URL = "https://lorem-pro-tool.run4ravish.workers.dev";
const PAGE_URL = `${SITE_URL}/color-palette`;

export const metadata: Metadata = {
  title: "Color Palette Generator - Free Tailwind, Image & AI Picker",
  description: "Generate beautiful color palettes instantly. Press Space to generate, lock colors, pick from screen with EyeDropper, extract from image, and AI generate palettes. Export to Tailwind, CSS Variables, JSON.",
  keywords: ["color palette generator", "tailwind palette", "color picker", "image color extractor", "ai color palette", "coolors alternative"],
  alternates: {
    canonical: "/color-palette",
  },
  openGraph: {
    title: "Color Palette Generator - Free Online Tool",
    description: "The fastest color palette generator. Press Space, Lock, Drag, Extract from Image & AI.",
    url: PAGE_URL,
    siteName: "Lorem Pro Tool",
    images: [{ url: `${PAGE_URL}/opengraph-image`, width: 1200, height: 630, alt: "Color Palette Generator" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Color Palette Generator",
    description: "Generate palettes with Space, EyeDropper, Image & AI. Export Tailwind & CSS.",
    images: [`${PAGE_URL}/opengraph-image`],
  },
};

export default function ColorPaletteLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Color Palette Generator",
    "url": PAGE_URL,
    "applicationCategory": "DesignApplication",
    "offers": { "@type": "Offer", "price": "0" }
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {children}
    </>
  );
}
