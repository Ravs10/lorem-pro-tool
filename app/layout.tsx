import "./globals.css";
import type { Metadata } from "next";
import Header from "./components/Header";
import Footer from "./components/Footer";
import GlobalBannerWrapper from "./components/GlobalBannerWrapper";

const SITE_URL = "https://lorem-pro-tool.run4ravish.workers.dev";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Lorem Pro Tool - Free Lorem Ipsum Generator in 77 Languages",
    template: "%s | Lorem Pro Tool",
  },
  description:
    "Free Lorem Ipsum Generator in 77 Languages. Generate Sentences, Paragraphs, Words & Lists in Hindi, English, Spanish, Arabic & more. No Login, 100% Free.",
  keywords: [
    "lorem ipsum generator",
    "lorem pro tool",
    "lorem ipsum generator 77 languages",
    "dummy text generator",
    "placeholder text generator",
    "hindi lorem ipsum",
  ],
  authors: [{ name: "Ravish" }],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Lorem Pro Tool",
    title: "Lorem Pro Tool - Free Lorem Ipsum Generator in 77 Languages",
    description:
      "Generate dummy text in 77 native languages. Sentence, Paragraph, Word & List modes. 100% Free, No Login.",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Lorem Pro Tool",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lorem Pro Tool - Free Lorem Ipsum Generator in 77 Languages",
    description:
      "Generate dummy text in 77 native languages. Sentence, Paragraph, Word & List modes.",
    images: ["/opengraph-image.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <GlobalBannerWrapper />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
