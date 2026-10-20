import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Advanced Case Converter - 14+ Free Text Case Tools | UPPER, lower, camelCase",
  description: "Free advanced case converter tool. Convert text to UPPERCASE, lowercase, Title Case, Sentence case, camelCase, PascalCase, snake_case, kebab-case, CONSTANT_CASE, dot.case, path/case & more. 100% free, private, no signup, works offline.",
  keywords: [
    "case converter", "text case converter", "advanced case converter",
    "uppercase converter", "lowercase converter", "title case converter",
    "camelCase converter", "PascalCase converter", "snake_case converter",
    "kebab-case converter", "constant case converter", "text converter",
    "free case converter", "online case converter", "case converter tool", 
    "lorem pro tool", "lorem pro tool case converter" 
  ],
  openGraph: {
    title: "Advanced Case Converter - 14+ Text Case Tools Free",
    description: "Convert text to 14+ cases instantly. UPPERCASE, lowercase, Title Case, camelCase, PascalCase, snake_case & more. Free & Private.",
    url: "https://lorem-pro-tool.run4ravish.workers.dev/case-converter",
    siteName: "Lorem Pro Tool",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://lorem-pro-tool.run4ravish.workers.dev/case-converter/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Advanced Case Converter - 14+ Text Case Tools",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Advanced Case Converter - Free 14+ Case Tools",
    description: "Free tool to convert text to UPPERCASE, lowercase, Title Case, camelCase, snake_case and 9 more formats.",
    images: ["https://lorem-pro-tool.run4ravish.workers.dev/case-converter/opengraph-image.png"],
  },
  alternates: {
    canonical: "https://lorem-pro-tool.run4ravish.workers.dev/case-converter",
  },
  category: "Utilities",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
