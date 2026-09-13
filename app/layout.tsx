import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LoremGen PRO - Free Lorem Ipsum Generator in 12 Languages | AI Topic",
  description: "Generate Lorem Ipsum in 12 languages - Hindi, English, Spanish, French, German, Arabic, Portuguese, Russian, Japanese, Italian, Bengali, Urdu. AI Topic generator for political, sports, health, business, education, tech content. Free tool for designers & developers.",
  keywords: ["lorem ipsum generator", "hindi lorem ipsum", "lorem ipsum in hindi", "lorem generator 12 languages", "ai lorem ipsum", "free lorem ipsum tool", "multilingual lorem ipsum", "lorem ipsum pro"],
  authors: [{ name: "LoremGen PRO" }],
  openGraph: {
    title: "LoremGen PRO - 12 Languages Lorem Ipsum Generator",
    description: "Free AI-powered Lorem Ipsum generator in 12 languages. Generate political, sports, health content instantly.",
    type: "website",
    locale: "en_US",
    images: ["/icon.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "LoremGen PRO - 12 Languages Lorem Ipsum",
    description: "Free AI Lorem Ipsum Generator in 12 languages",
    images: ["/icon.png"],
  },
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
    verification: {
    google: "iKilQkNiLUK2e2WF8WHLvKYEEhS_PBhnR88mViZSufQ",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icon.png" />
        <link rel="apple-touch-icon" href="/icon.png" />
      </head>
      <body>{children}</body>
    </html>
  );
}
