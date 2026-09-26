import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Password Generator - Free Secure & Strong Password Maker | Lorem Pro Tools",
  description: "Generate ultra-secure, random passwords instantly with our free Advanced Password Generator. Custom length, symbols, numbers. 100% private, no data stored.",
  keywords: ["password generator", "strong password generator", "secure password maker", "random password generator", "free password tool", "online password generator"],
  openGraph: {
    title: "Free Password Generator - Create Strong & Secure Passwords",
    description: "Create unhackable passwords in one click. Free, fast and private.",
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
