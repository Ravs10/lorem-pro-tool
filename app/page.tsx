import HomeClient from "./HomeClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lorem Pro Tool - 26 Free Online Tools | Lorem Ipsum Generator, SIP, FD Calculator & More",
  description:
    "Lorem Pro Tool - A Complete Tools Hub & 26 Tools Suite. Free Lorem Ipsum Generator in 77 Languages, FD Calculator, SIP Calculator, Word Counter, QR Generator, etc. No Login, 100% Free.",
  keywords:
    "lorem pro tool, lorem ipsum generator, lorem ipsum generator hindi, 77 languages, free tools hub, 26 tools suite, fd calculator, sip calculator",
  alternates: {
    canonical: "https://lorem-pro-tool.run4ravish.workers.dev/",
  },
  openGraph: {
    title: "Lorem Pro Tool - 26 Free Online Tools | Lorem Ipsum Generator & More",
    description:
      "Lorem Pro Tool - A Complete Tools Hub & 26 Tools Suite. Free Lorem Ipsum Generator in 77 Languages, FD Calculator, SIP Calculator, Word Counter, QR Generator, etc.",
    url: "https://lorem-pro-tool.run4ravish.workers.dev/",
    siteName: "Lorem Pro Tool",
    type: "website",
  },
};

export default function Page() {
  return <HomeClient />;
}
