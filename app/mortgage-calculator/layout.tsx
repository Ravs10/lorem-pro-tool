import type { Metadata } from "next";

const BASE_URL = "https://lorem-pro-tool.run4ravish.workers.dev";

export const metadata: Metadata = {
  title: "Mortgage Calculator PRO - Advanced Free Tool | Lorem Pro Tool",
  description: "Most advanced free mortgage calculator with PMI, property tax, insurance, HOA, extra payments, bi-weekly, amortization schedule, rent vs buy & payoff chart.",
  keywords: ["mortgage calculator", "home loan calculator", "lorem pro tool", "amortization calculator"],
  
  // Ye line sabse important hai tumhare liye
  metadataBase: new URL(BASE_URL),
  
  alternates: {
    canonical: "/mortgage-calculator",
  },
  openGraph: {
    title: "Mortgage Calculator PRO - Save $61k Interest",
    description: "Free tool with PMI, Tax, Amortization, Rent vs Buy calculator.",
    url: `${BASE_URL}/mortgage-calculator`,
    siteName: "Lorem Pro Tool",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mortgage Calculator PRO",
    description: "Free advanced mortgage calculator.",
  },
};

export default function MortgageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
