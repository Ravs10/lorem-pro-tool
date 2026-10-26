import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Resume Builder & ATS Checker - 100% Free, No Login | Lorem Pro Tool",
  description: "Build professional ATS-friendly resume in 60 seconds. Free Resume Builder with live preview, 6 premium templates, ATS score checker, PDF/DOC/TXT export. No login, unlimited, works offline.",
  keywords: ["resume builder", "free resume builder", "ats resume checker", "resume maker", "ats friendly resume", "resume builder no login", "free ats checker", "lorem pro tool", "lorem pro tool resume builder"],
  metadataBase: new URL("https://lorem-pro-tool.run4ravish.workers.dev"),
  alternates: {
    canonical: "/resume-builder",
  },
  openGraph: {
    title: "Free Resume Builder + ATS Checker - Build in 60 Sec",
    description: "6 Premium Templates, ATS Score 0-100, Live Preview, PDF/DOC/TXT Download. 100% Free, No Login Required.",
    url: "/resume-builder",
    siteName: "Lorem Pro Tool",
    images: [{ url: "/og/resume-builder.png", width: 1200, height: 630, alt: "Free Resume Builder" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Resume Builder + ATS Checker",
    description: "Build ATS-friendly resume in 60 seconds. 100% Free, No Login.",
    images: ["/og/resume-builder.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
