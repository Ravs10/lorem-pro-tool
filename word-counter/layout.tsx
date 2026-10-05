import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Word Counter - Free Word & Character Counter Tool",
  description: "Free word counter to count words, characters, sentences & keyword density instantly.",
  alternates: {
    canonical: "https://lorem-pro-tool.run4ravish.workers.dev/word-counter",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
