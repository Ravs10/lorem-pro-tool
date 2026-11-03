import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mortgage Calculator PRO - Free Home Loan Calculator [2025]",
  description: "Most advanced free mortgage calculator with PMI, property tax, insurance, HOA, extra payments, bi-weekly, amortization schedule, rent vs buy & payoff chart.",
  keywords: ["mortgage calculator", "home loan calculator", "amortization calculator", "PMI calculator"],
  openGraph: {
    title: "Mortgage Calculator PRO",
    description: "Calculate monthly payment, total interest, save $61k with extra payments.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mortgage Calculator PRO",
  },
};

export default function MortgageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
