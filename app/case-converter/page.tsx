import type { Metadata } from "next";
import CaseConverter from "./components/CaseConverter";

/* ------------------------------------------------------------------ */
/*  ⚙️  Change this to your real domain before deploying               */
/* ------------------------------------------------------------------ */
const SITE_URL = "https://casecraft.example.com";
const SITE_NAME = "CaseCraft";

/* ----------------------------- SEO META ---------------------------- */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:
      "Advanced Case Converter – UPPERCASE, camelCase, snake_case & 16+ Formats",
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Free advanced case converter tool. Instantly convert text to UPPERCASE, lowercase, Title Case, Sentence case, camelCase, PascalCase, snake_case, kebab-case, CONSTANT_CASE, dot.case, path/case and more. Fast, private, mobile-friendly — no sign-up required.",
  keywords: [
    "case converter",
    "advanced case converter",
    "uppercase converter",
    "lowercase converter",
    "title case converter",
    "sentence case converter",
    "camelCase converter",
    "pascal case converter",
    "snake case converter",
    "kebab case converter",
    "constant case converter",
    "text case changer",
    "online text tools",
    "convert text case online",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "Utilities",
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      maxImagePreview: "large",
      maxSnippet: -1,
      maxVideoPreview: -1,
    },
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "Advanced Case Converter – 16+ Text Case Formats",
    description:
      "Convert any text to UPPERCASE, camelCase, snake_case, Title Case and 12 more formats in one click. Free, fast and 100% private.",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Advanced Case Converter – 16+ Text Case Formats",
    description:
      "Convert any text to UPPERCASE, camelCase, snake_case, Title Case and 12 more formats in one click.",
    creator: "@yourhandle",
  },
};

/* ------------------------------ FAQ DATA --------------------------- */
const FAQS = [
  {
    q: "What is an advanced case converter?",
    a: "An advanced case converter is an online text tool that instantly transforms your text into multiple naming formats such as UPPERCASE, lowercase, Title Case, Sentence case, camelCase, PascalCase, snake_case, kebab-case, CONSTANT_CASE, dot.case and path/case — all in a single click.",
  },
  {
    q: "Is this case converter tool free to use?",
    a: "Yes. The tool is 100% free, requires no sign-up, no installation and no watermarks. You can convert unlimited text as many times as you want.",
  },
  {
    q: "Is my text safe and private?",
    a: "Absolutely. All conversions happen locally inside your browser using JavaScript. Your text is never uploaded, stored or transmitted to any server.",
  },
  {
    q: "What is the difference between camelCase and PascalCase?",
    a: "camelCase starts with a lowercase letter and capitalises each following word (e.g. myVariableName). PascalCase capitalises every word including the first (e.g. MyVariableName).",
  },
  {
    q: "When should I use snake_case vs kebab-case?",
    a: "Use snake_case (my_variable_name) for Python, Ruby, databases and environment variables. Use kebab-case (my-variable-name) for URLs, CSS class names, HTML attributes and file names.",
  },
  {
    q: "Does it work on mobile phones and tablets?",
    a: "Yes. The interface is fully responsive and works smoothly on Android phones, iPhones, iPads, tablets, laptops and desktop computers.",
  },
];

/* ----------------------------- JSON-LD ----------------------------- */
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": `${SITE_URL}/#app`,
      name: "Advanced Case Converter",
      url: SITE_URL,
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Any",
      browserRequirements: "Requires JavaScript",
      description:
        "Free advanced case converter that transforms text into 16+ formats including UPPERCASE, lowercase, Title Case, Sentence case, camelCase, PascalCase, snake_case, kebab-case and CONSTANT_CASE.",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      featureList: [
        "UPPERCASE converter",
        "lowercase converter",
        "Title Case converter",
        "Sentence case converter",
        "camelCase converter",
        "PascalCase converter",
        "snake_case converter",
        "kebab-case converter",
        "CONSTANT_CASE converter",
        "dot.case converter",
        "path/case converter",
        "Alternating case converter",
        "Inverse case converter",
        "Copy to clipboard",
        "Download as .txt",
      ],
    },
    {
      "@type": "FAQPage",
      "@id": `${SITE_URL}/#faq`,
      mainEntity: FAQS.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${SITE_URL}/#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        {
          "@type": "ListItem",
          position: 2,
          name: "Case Converter",
          item: SITE_URL,
        },
      ],
    },
  ],
};

/* ------------------------------ PAGE ------------------------------- */
export default function HomePage() {
  return (
    <>
      {/* Structured Data for Rich Results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Global keyframes (no extra dependency needed) */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes blobFloat {
              0%,100% { transform: translate(0,0) scale(1); }
              33%     { transform: translate(40px,-60px) scale(1.12); }
              66%     { transform: translate(-30px,30px) scale(0.94); }
            }
            @keyframes fadeUp {
              from { opacity: 0; transform: translateY(20px); }
              to   { opacity: 1; transform: translateY(0); }
            }
            @keyframes shimmer {
              0%   { background-position: -200% 0; }
              100% { background-position: 200% 0; }
            }
            .animate-blob   { animation: blobFloat 20s ease-in-out infinite; }
            .animate-fade-up{ animation: fadeUp .7s cubic-bezier(.22,1,.36,1) both; }
            .text-shimmer {
              background: linear-gradient(90deg,#22d3ee,#a78bfa,#f0abfc,#22d3ee);
              background-size: 200% auto;
              -webkit-background-clip: text;
              background-clip: text;
              color: transparent;
              animation: shimmer 6s linear infinite;
            }
            @media (prefers-reduced-motion: reduce) {
              .animate-blob, .animate-fade-up, .text-shimmer { animation: none !important; }
            }
          `,
        }}
      />

      {/* ---------------- Animated Glassmorphism Background ---------------- */}
      <div
        aria-hidden="true"
        className="fixed inset-0 -z-10 overflow-hidden bg-slate-950"
      >
        <div className="absolute -left-40 -top-40 h-[28rem] w-[28rem] rounded-full bg-fuchsia-600/30 blur-[120px] animate-blob" />
        <div
          className="absolute -right-40 top-1/3 h-[26rem] w-[26rem] rounded-full bg-cyan-500/30 blur-[120px] animate-blob"
          style={{ animationDelay: "3s" }}
        />
        <div
          className="absolute -bottom-40 left-1/3 h-[24rem] w-[24rem] rounded-full bg-indigo-600/30 blur-[120px] animate-blob"
          style={{ animationDelay: "6s" }}
        />
        {/* subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
      </div>

      <main className="mx-auto w-full max-w-6xl px-4 pb-20 pt-10 sm:px-6 sm:pt-14 lg:px-8">
        {/* ----------------------------- HERO ----------------------------- */}
        <header className="animate-fade-up text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-medium text-cyan-200 backdrop-blur-xl">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
            </span>
            100% Free • No Sign-up • Works Offline
          </span>

          <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
            Advanced <span className="text-shimmer">Case Converter</span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
            Instantly convert your text into{" "}
            <strong className="font-semibold text-white">
              UPPERCASE, lowercase, Title Case, Sentence case, camelCase,
              PascalCase, snake_case, kebab-case
            </strong>{" "}
            and 8+ more formats — right inside your browser.
          </p>
        </header>

        {/* ---------------------------- THE TOOL --------------------------- */}
        <CaseConverter />

        {/* ---------------------------- FEATURES --------------------------- */}
        <section
          aria-labelledby="features-heading"
          className="animate-fade-up mt-20"
          style={{ animationDelay: "0.15s" }}
        >
          <h2
            id="features-heading"
            className="text-center text-2xl font-bold text-white sm:text-3xl"
          >
            Why developers &amp; writers love this tool
          </h2>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: "⚡",
                title: "16+ Case Formats",
                text: "From UPPERCASE to path/case — every naming convention you will ever need, in one place.",
              },
              {
                icon: "🔒",
                title: "100% Private",
                text: "Everything runs in your browser. Your text never leaves your device or touches a server.",
              },
              {
                icon: "📱",
                title: "Fully Responsive",
                text: "Pixel-perfect experience on phones, tablets, laptops and ultra-wide desktops.",
              },
              {
                icon: "🎯",
                title: "Live Conversion",
                text: "Toggle auto-convert and watch your text transform in real time as you type.",
              },
              {
                icon: "📋",
                title: "One-Click Copy",
                text: "Copy the result instantly or download it as a .txt file for later use.",
              },
              {
                icon: "🚀",
                title: "Blazing Fast",
                text: "Zero network calls, zero loading spinners. Conversion happens in microseconds.",
              },
            ].map((f) => (
              <article
                key={f.title}
                className="group rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-white/[0.09]"
              >
                <div className="text-2xl" aria-hidden="true">
                  {f.icon}
                </div>
                <h3 className="mt-3 text-base font-semibold text-white">
                  {f.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-400">
                  {f.text}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* --------------------------- HOW TO USE -------------------------- */}
        <section
          aria-labelledby="howto-heading"
          className="animate-fade-up mt-20"
          style={{ animationDelay: "0.2s" }}
        >
          <h2
            id="howto-heading"
            className="text-center text-2xl font-bold text-white sm:text-3xl"
          >
            How to convert text case in 3 steps
          </h2>

          <ol className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              {
                n: "01",
                t: "Paste your text",
                d: "Type or paste any text into the input box — a paragraph, a variable name or a whole document.",
              },
              {
                n: "02",
                t: "Pick a case format",
                d: "Click any format button like UPPERCASE, camelCase or snake_case. The result appears instantly.",
              },
              {
                n: "03",
                t: "Copy or download",
                d: "Hit Copy to grab the converted text, or download it as a .txt file with a single click.",
              },
            ].map((s) => (
              <li
                key={s.n}
                className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-xl"
              >
                <span className="text-3xl font-black text-white/15">{s.n}</span>
                <h3 className="mt-2 text-base font-semibold text-white">
                  {s.t}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-400">
                  {s.d}
                </p>
              </li>
            ))}
          </ol>
        </section>

        {/* ------------------------------- FAQ ----------------------------- */}
        <section
          aria-labelledby="faq-heading"
          className="animate-fade-up mt-20"
          style={{ animationDelay: "0.25s" }}
        >
          <h2
            id="faq-heading"
            className="text-center text-2xl font-bold text-white sm:text-3xl"
          >
            Frequently asked questions
          </h2>

          <div className="mx-auto mt-8 max-w-3xl space-y-3">
            {FAQS.map((f) => (
              <details
                key={f.q}
                className="group rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-4 backdrop-blur-xl transition-colors hover:border-cyan-400/30 open:border-cyan-400/40"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-sm font-semibold text-white sm:text-base">
                  {f.q}
                  <span
                    aria-hidden="true"
                    className="shrink-0 text-cyan-300 transition-transform duration-300 group-open:rotate-45"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    >
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-slate-400">
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* ----------------------------- FOOTER ---------------------------- */}
        <footer className="mt-20 border-t border-white/10 pt-8 text-center">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} {SITE_NAME}. Built with Next.js —
            free forever, no tracking, no limits.
          </p>
        </footer>
      </main>
    </>
  );
}
