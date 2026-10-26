import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Resume Builder & ATS Checker - 100% Free, No Login | Lorem Pro Tool",
  description: "Build professional ATS-friendly resume in 60 seconds. Free Resume Builder with live preview, 10 templates, ATS score checker, PDF download. No login, unlimited, works offline.",
  keywords: ["resume builder", "free resume builder", "ats resume checker", "resume builder free", "ats score checker", "resume maker", "professional resume builder", "ats friendly resume", "resume builder no login"],
  metadataBase: new URL("https://lorem-pro-tool.run4ravish.workers.dev"),
  alternates: {
    canonical: "https://lorem-pro-tool.run4ravish.workers.dev/resume-builder",
  },
  openGraph: {
    title: "Free Resume Builder + ATS Checker - Build in 60 Sec",
    description: "10 Templates, ATS Score 0-100, Live Preview, PDF Download. 100% Free.",
    url: "https://lorem-pro-tool.run4ravish.workers.dev/resume-builder",
    siteName: "Lorem Pro Tool",
    images: [{ url: "https://lorem-pro-tool.run4ravish.workers.dev/og/resume-builder.png", width: 1200, height: 630 }],
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
