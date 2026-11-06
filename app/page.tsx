import HomeClient from "./HomeClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lorem Ipsum Generator - 77 Languages | 26 Free Tools | LoremPro",
  description:
    "Free Lorem Ipsum Generator in 77 Languages - Hindi, English, Spanish, French + 25 Other Free Tools like FD Calculator, SIP Calculator, Word Counter, QR Generator. No Login, 100% Free.",
  keywords:
    "lorem ipsum generator, lorem ipsum generator hindi, 77 languages, free tools, fd calculator, sip calculator",
  alternates: {
    canonical: "https://lorem-pro-tool.run4ravish.workers.dev/",
  },
  openGraph: {
    title: "Lorem Ipsum Generator - 77 Languages | LoremPro",
    description:
      "Generate Lorem Ipsum in 77 Languages + Use 25 Other Free Tools. 100% Free, No Login.",
    url: "https://lorem-pro-tool.run4ravish.workers.dev/",
    siteName: "LoremPro",
    type: "website",
  },
};

export default function Page() {
  return <HomeClient />;
}
