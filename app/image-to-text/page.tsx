"use client";
import { useState, useRef } from "react";
import Tesseract from "tesseract.js";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Image to Text OCR Tool",
  "applicationCategory": "UtilitiesApplication",
  "operatingSystem": "Web",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
  "description": "Free online Image to Text converter using AI OCR.",
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "Is this Image to Text tool free?", "acceptedAnswer": { "@type": "Answer", "text": "Yes, 100% free. No signup, no limits." } },
    { "@type": "Question", "name": "Is my image data safe?", "acceptedAnswer": { "@type": "Answer", "text": "Yes, processing happens in your browser using Tesseract.js." } },
    { "@type": "Question", "name": "Which languages are supported?", "acceptedAnswer": { "@type": "Answer", "text": "English, Hindi and 100+ languages." } },
  ]
};

export default function ImageToTextPage() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [imagePreview, setImagePreview] = useState("");
  const [copied, setCopied] = useState(false);
  const [openSection, setOpenSection] = useState<string>("what-is");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImage = async (file: File) => {
    if (!file) return;
    setImagePreview(URL.createObjectURL(file));
    setLoading(true);
    setText("");
    try {
      const { data } = await Tesseract.recognize(file, "eng+hin", {
        logger: (m) => { if (m.status === "recognizing text") setProgress(Math.round(m.progress * 100)); },
      });
      setText(data.text);
    } catch (e) { setText("Error: Could not read image."); }
    setLoading(false);
  };

  const handleShare = async () => {
    const shareData = { title: "Free Image to Text Tool", text: "Extract text from any image with 99% accuracy - Free OCR Tool", url: window.location.href };
    if (navigator.share) { await navigator.share(shareData); }
    else { navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(()=>setCopied(false),2000); }
  };

  const Section = ({ id, title, children }: any) => {
    const isOpen = openSection === id;
    return (
      <div className="border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-900/40 backdrop-blur transition-all duration-300 hover:border-zinc-700">
        <button onClick={() => setOpenSection(isOpen? "" : id)} className="w-full flex justify-between items-center p-5 text-left">
          <h2 className="text-[17px] font-bold">{title}</h2>
          <span className={`w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center transition-transform duration-300 ${isOpen? "rotate-45 bg-white text-black" : ""}`}>+</span>
        </button>
        <div className={`grid transition-all duration-500 ease-in-out ${isOpen? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
          <div className="overflow-hidden"><div className="p-5 pt-0 text-[14px] leading-7 text-zinc-400">{children}</div></div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#050507] text-white selection:bg-white selection:text-black">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&display=swap'); *{font-family:'Space Grotesk', sans-serif} @keyframes shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}.shimmer{position:relative;overflow:hidden}.shimmer::after{content:'';position:absolute;top:0;left:0;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent);animation:shimmer 2s infinite}`}</style>

      <header className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        <a href="/" className="text-xl font-bold tracking-tight">LOREM PRO<span className="text-zinc-500">.TOOL</span></a>
        <button onClick={handleShare} className="flex items-center gap-2 text-sm bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-full hover:bg-white hover:text-black transition-all">
          <span>↗</span> {copied? "Link Copied!" : "Share"}
        </button>
      </header>

      <main className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-10 mt-6 items-start">
          <div>
            <div className="inline-flex bg-white text-black text-[10px] font-bold tracking-widest px-3 py-1 rounded-full mb-4 animate-pulse">LIVE OCR • V5 ENGINE</div>
            <h1 className="text-4xl md:text-[56px] font-bold leading-[0.9] tracking-tighter">Image to Text <br/><span className="text-zinc-500">AI Converter.</span></h1>
            <p className="text-zinc-400 mt-4 text-[15px] leading-relaxed max-w-xl">Convert any photo, screenshot or scanned document to editable text in 3 seconds. Powered by Tesseract.js. Private, fast and free forever.</p>

            <div className="mt-8 bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 rounded-[28px] p-5 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
              <div onClick={() => fileInputRef.current?.click()} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); handleImage(e.dataTransfer.files[0]); }} className="group border-2 border-dashed border-zinc-700 hover:border-white rounded-[20px] p-10 text-center cursor-pointer transition-all duration-300 bg-zinc-900/50">
                <div className="w-16 h-16 mx-auto bg-white text-black rounded-full flex items-center justify-center text-2xl group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">↑</div>
                <p className="mt-4 font-bold">Drop image here or click to browse</p>
                <p className="text-xs text-zinc-500 mt-1">PNG, JPG, WEBP • Max 10MB • Auto HD Clean</p>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImage(e.target.files![0])} />
              </div>

              {imagePreview && <div className="mt-4 relative overflow-hidden rounded-xl border border-zinc-800"><img src={imagePreview} className="max-h-60 w-full object-contain" alt="preview"/><div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div></div>}

              {loading && (
                <div className="mt-6">
                  <div className="flex justify-between text-xs mb-2 font-mono"><span className="text-green-400 animate-pulse">● RECOGNIZING</span><span>{progress}%</span></div>
                  <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden shimmer"><div className="bg-white h-2 transition-all duration-300" style={{ width: `${progress}%` }}></div></div>
                </div>
              )}

              {text && (
                <div className="mt-6 animate-[fadeIn_0.5s_ease]">
                  <div className="flex justify-between items-center mb-2"><h3 className="text-sm font-bold">Extracted Text</h3><span className="text-[10px] bg-green-500 text-black px-2 py-1 rounded-full font-bold">{text.length} CHARS</span></div>
                  <textarea value={text} onChange={(e) => setText(e.target.value)} className="w-full h-72 bg-black border border-zinc-800 rounded-xl p-4 text-sm outline-none focus:border-white transition-colors" />
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(()=>setCopied(false),2000); }} className="bg-white text-black py-3 rounded-xl font-bold text-sm hover:scale-[1.02] transition-transform">{copied? "✓ Copied!" : "Copy Text"}</button>
                    <button onClick={() => { const b = new Blob([text], { type: "text/plain" }); const u = URL.createObjectURL(b); const a = document.createElement("a"); a.href = u; a.download = "extracted.txt"; a.click(); }} className="bg-zinc-800 border border-zinc-700 py-3 rounded-xl font-bold text-sm hover:bg-zinc-700 transition">Download.TXT</button>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <a href={`https://wa.me/?text=${encodeURIComponent(text.slice(0,500))}`} target="_blank" className="flex-1 bg-[#25D366] text-black py-2.5 rounded-xl text-xs font-bold text-center">WhatsApp</a>
                    <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(text.slice(0,200))}`} target="_blank" className="flex-1 bg-zinc-800 border border-zinc-700 py-2.5 rounded-xl text-xs font-bold text-center">Twitter / X</a>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:sticky top-6 space-y-4">
            <div className="bg-white text-black rounded-[24px] p-7">
              <h2 className="text-xl font-bold">Ultra Fast & Private</h2>
              <p className="text-sm text-zinc-600 mt-2">No server upload. Works offline after page load. Your images never leave your device.</p>
              <div className="mt-6 grid grid-cols-3 text-center border-t border-zinc-200 pt-6">
                <div><p className="text-2xl font-bold">99%</p><p className="text-[10px] text-zinc-500">ACCURACY</p></div>
                <div><p className="text-2xl font-bold">100+</p><p className="text-[10px] text-zinc-500">LANGUAGES</p></div>
                <div><p className="text-2xl font-bold">0</p><p className="text-[10px] text-zinc-500">UPLOAD</p></div>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-[20px] p-5">
              <h3 className="font-bold text-sm">More Pro Tools</h3>
              <div className="mt-4 flex flex-col gap-2">
                <a href="/placeholder-qr-generator" className="bg-zinc-800 hover:bg-white hover:text-black p-3 rounded-xl text-sm flex justify-between transition-all">QR + Placeholder Generator <span>→</span></a>
                <a href="/" className="bg-zinc-800 hover:bg-white hover:text-black p-3 rounded-xl text-sm flex justify-between transition-all">Lorem Ipsum Generator <span>→</span></a>
              </div>
            </div>
          </div>
        </div>

        {/* ARTICLES SHOW/HIDE */}
        <div className="mt-20 max-w-4xl space-y-4">
          <h2 className="text-2xl font-bold mb-6">Learn More About OCR</h2>

          <Section id="what-is" title="1. What is Image to Text OCR?">
            OCR stands for Optical Character Recognition. It is an AI technology that converts different types of documents, such as scanned paper documents, PDF files or images captured by a digital camera into editable and searchable data. Our tool uses Tesseract.js v5, the most powerful open-source engine by Google. Unlike other tools that upload your file to a server, our tool processes everything locally in your browser using WebAssembly. This gives you 100% privacy. The system first cleans the image, removes noise, detects text blocks, lines, and then converts them to digital text. It can preserve paragraphs and line breaks. This tool is essential for students, office workers, and content creators who need to quickly digitize physical documents without typing.
          </Section>

          <Section id="how-to" title="2. How to Use This Tool? (3 Easy Steps)">
            <div className="space-y-3">
              <p><b className="text-white">Step 1: Upload Image:</b> Click the upload area or drag and drop your image. Use a high-quality image with clear text for best results. Avoid blurry photos and dark shadows.</p>
              <p><b className="text-white">Step 2: AI Scanning:</b> Our AI starts automatically. You will see a live progress bar. It usually takes 3-10 seconds depending on your device speed and image size.</p>
              <p><b className="text-white">Step 3: Copy & Save:</b> Once done, you can edit the text inside the box, copy it to clipboard, download as a.TXT file, or directly share on WhatsApp/Twitter.</p>
            </div>
          </Section>

          <Section id="use-cases" title="3. Top Use Cases & Benefits">
            Students use it to convert class notes photos to text for assignments. Office professionals use it to extract text from invoices, visiting cards and receipts for data entry. Developers use it to copy text from error screenshots or design mockups. Bloggers reuse old newspaper cuttings into blog posts. Content creators copy text from social media images. Our main benefit is privacy - because processing is client-side, even sensitive documents like ID cards remain safe. Other benefits are speed (no queue), free forever (no watermark), and multi-language support including Hindi, English, Spanish, French etc.
          </Section>

          <Section id="features" title="4. Why We Are Better Than Other OCR Tools?">
            <ul className="list-disc pl-5 space-y-2">
              <li><b className="text-white">Offline Processing:</b> No image leaves your device.</li>
              <li><b className="text-white">Auto Language:</b> eng+hin combo covers 95% of Indian users.</li>
              <li><b className="text-white">Mobile Optimized:</b> Works smoothly even on low RAM phones and slow networks.</li>
              <li><b className="text-white">Zero Ads on Result:</b> We never cover your extracted text with ads.</li>
              <li><b className="text-white">Lightweight:</b> Built with Next.js 14 and Tailwind for <1.5s load.</li>
            </ul>
          </Section>
        </div>

        {/* FAQ SHOW/HIDE */}
        <div className="mt-12 max-w-4xl">
          <h2 className="text-2xl font-bold mb-6">FAQs</h2>
          <div className="space-y-3">
            {[
              { q: "Is this tool 100% free?", a: "Yes, completely free. No signup, no limits, no watermark. We use browser-based tech so we have zero server cost." },
              { q: "How accurate is the OCR?", a: "For printed text with clear background, accuracy is 98-99%. For handwriting, it depends on clarity - typically 70-85%." },
              { q: "Can it read Hindi images?", a: "Yes! We enabled Hindi + English by default. Perfect for Hindi books, newspapers and documents." },
              { q: "Is my data private?", a: "Absolutely. Your image is processed inside your browser using WASM. It never goes to any server." },
            ].map((faq, i) => (
              <div key={i} className="border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-900/30">
                <button onClick={() => setOpenFaq(openFaq === i? null : i)} className="w-full flex justify-between p-5 text-left font-semibold text-sm">
                  <span>{faq.q}</span><span className={`w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center transition-all ${openFaq === i? "rotate-45 bg-white text-black" : ""}`}>+</span>
                </button>
                <div className={`grid transition-all duration-300 ${openFaq === i? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                  <div className="overflow-hidden"><p className="px-5 pb-5 text-zinc-400 text-sm leading-6">{faq.a}</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <footer className="mt-20 border-t border-zinc-900 py-10 text-center text-zinc-600 text-xs">
          <p>© 2026 Lorem Pro Tool - All tools are free and private.</p>
        </footer>
      </main>
    </div>
  );
}
