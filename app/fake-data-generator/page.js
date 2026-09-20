import FakeClient from "./client";

export const metadata = {
  title: "Fake Data Generator - Free Fake Name Generator in 8 Languages (Hindi, Japanese, German)",
  description: "Free fake data generator tool. Generate realistic fake names like राहुल शर्मा, 田中太郎, Hans Müller, Jean Dupont, Carlos García. Supports Hindi, Japanese, German, French, Spanish, English, Bengali, Tamil. Download JSON, CSV, SQL, TXT with 100% UTF-8 fix.",
  keywords: "fake data generator, fake name generator hindi, japanese fake name generator, german fake data, 田中太郎, राहुल शर्मा, Hans Müller, dummy data generator, lorem pro tool",
  openGraph: {
    title: "Fake Data Generator - 8 Languages - राहुल, 田中, Müller",
    description: "Generate 100% fake but realistic data in 8 native scripts. Fixed encoding - no more broken Japanese text.",
    url: "https://lorem-pro-tool.vercel.app/fake-data-generator",
    siteName: "Lorem Pro Tool",
    type: "website",
  },
  alternates: {
    canonical: "https://lorem-pro-tool.vercel.app/fake-data-generator",
  },
};

export default function Page(){
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Fake Data Generator - Lorem Pro Tool",
            "applicationCategory": "DeveloperApplication",
            "operatingSystem": "Web",
            "offers": { "@type": "Offer", "price": "0", "priceCurrency": "INR" },
            "description": "Free tool to generate fake names like Rahul Sharma, Tanaka Taro in 8 languages.",
            "featureList": ["Hindi - राहुल शर्मा - भारत", "Japanese - 田中太郎 - 日本", "German - Hans Müller - Deutschland", "French - Jean Dupont - France", "Spanish - Carlos García - España"],
            "inLanguage": ["hi", "ja", "de", "fr", "es", "en", "bn", "ta"]
          })
        }}
      />
      <FakeClient />
    </>
  );
}
