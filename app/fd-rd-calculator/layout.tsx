import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "FD + RD + Compound + PPF Calculator 2026 | Free FD RD Calculator - Lorem Pro Tool",
  description:
    "Free FD Calculator, RD Calculator, Compound Interest Calculator, PPF Calculator, NSC, SCSS, KVP, SSY in one tool. Calculate FD maturity, RD maturity, TDS, tax after slab, senior citizen bonus, inflation-adjusted real return with year-wise table. SBI, HDFC, ICICI, Post Office rates included.",
  keywords: [
    "fd calculator",
    "rd calculator",
    "ppf calculator",
    "compound interest calculator",
    "fixed deposit calculator",
    "recurring deposit calculator",
    "sbi fd calculator",
    "hdfc fd calculator",
    "post office rd calculator",
    "ppf maturity calculator",
    "fd interest calculator",
    "nsc calculator",
    "scss calculator",
    "kvp calculator",
    "ssy calculator",
    "sukanya samriddhi calculator",
    "tds calculator fd",
    "senior citizen fd rates",
    "fd tax calculator",
    "fd vs rd vs ppf",
    "fd vs sip",
  ],
  authors: [{ name: "Lorem Pro Tool" }],
  creator: "Lorem Pro Tool",
  publisher: "Lorem Pro Tool",
  category: "Finance",
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
  alternates: {
    canonical: "https://lorem-pro-tool.run4ravish.workers.dev/fd-rd-calculator",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://lorem-pro-tool.run4ravish.workers.dev/fd-rd-calculator",
    siteName: "Lorem Pro Tool",
    title: "FD + RD + Compound + PPF Calculator 2026 | Free FD RD Calculator",
    description:
      "Calculate FD, RD, Compound, PPF, NSC, SCSS, KVP, SSY maturity in 1 click. TDS + Tax + Senior Citizen + Inflation adjusted real return. Free, no signup.",
    images: [
      {
        url: "https://lorem-pro-tool.run4ravish.workers.dev/og/fd-rd-calculator.png",
        width: 1200,
        height: 630,
        alt: "FD RD PPF Calculator - Lorem Pro Tool",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FD + RD + Compound + PPF Calculator 2026",
    description:
      "Free FD, RD, PPF, NSC, SCSS Calculator with TDS, Tax, Senior Citizen bonus and Year-wise table.",
    images: ["https://lorem-pro-tool.run4ravish.workers.dev/og/fd-rd-calculator.png"],
    creator: "@loremprotool",
  },
  other: {
    "theme-color": "#FF7A1A",
  },
};

export default function FdRdLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
