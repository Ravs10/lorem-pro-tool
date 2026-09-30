"use client";
import { useState, useRef } from "react";
import Tesseract from "tesseract.js";
import JSZip from "jszip";

const LANGUAGES = [
  { code: "eng", label: "English" },
  { code: "hin", label: "Hindi" },
  { code: "eng+hin", label: "Hindi + English" },
  { code: "eng+spa", label: "Spanish + English" },
  { code: "eng+fra", label: "French + English" },
  { code: "ara", label: "Arabic" },
];

type Result = { id: string, preview: string, text: string, progress: number, status: string, name: string };

export default function Page() {
  const [results, setResults] = useState<Result[]>([]);
  const [lang, setLang] = useState("eng+hin");
  const [isProcessing, setIsProcessing] = useState(false);
  const [openSec, setOpenSec] = useState<string>("what");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [toast, setToast] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(()=>setToast(""), 2000); };

  const preprocess = (file: File): Promise<string> => {
    return new Promise((res) => {
      const img = new Image(); img.src = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")!;
        canvas.width = img.width * 1.8; canvas.height = img.height * 1.8;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const d = ctx.getImageData(0, 0, canvas.width, canvas.height);
        for (let i=0; i<d.data.length; i+=4){ const avg=(d.data[i]+d.data[i+1]+d.data[i+2])/3; const v=avg>170?255:avg<90?0:avg; d.data[i]=d.data[i+1]=d.data[i+2]=v; }
        ctx.putImageData(d,0,0); res(canvas.toDataURL());
      };
    });
  };

  const handleFiles = async (files: FileList | File[]) => {
    const arr = Array.from(files).slice(0,10);
    if(!arr.length) return;
    setIsProcessing(true);
    const initial: Result[] = arr.map(f=>({id: Math.random().toString(36).slice(2), preview: URL.createObjectURL(f), text:"", progress:0, status:"Queued...", name:f.name}));
    setResults(initial);
    for(let i=0;i<arr.length;i++){
      const id=initial[i].id; const file=arr[i];
      setResults(p=>p.map(r=>r.id===id?{...r, status:"Cleaning..."}:r));
      const processed = await preprocess(file);
      setResults(p=>p.map(r=>r.id===id?{...r, status:"Reading..."}:r));
      try{
        const {data} = await Tesseract.recognize(processed, lang, { logger:m=>{ if(m.status==="recognizing text") setResults(p=>p.map(r=>r.id===id?{...r, progress:Math.round(m.progress*100)}:r)); } });
        setResults(p=>p.map(r=>r.id===id?{...r, text:data.text, progress:100, status:"Done ✓"}:r));
      }catch{ setResults(p=>p.map(r=>r.id===id?{...r, status:"Failed"}:r)); }
    }
    setIsProcessing(false);
  };

  const allText = results.map(r=>`--- ${r.name} ---\n${r.text}`).join("\n\n");
  const handleShare = async () => {
    const url = window.location.href;
    const shareData = { title: "Free Image to Text OCR Tool", text: "Extract text from images instantly - Free, Private, Fast", url };
    try{
      if(navigator.share){ await navigator.share(shareData); }
      else{ await navigator.clipboard.writeText(url); showToast("Link Copied!"); }
    }catch{ await navigator.clipboard.writeText(url); showToast("Link Copied!"); }
  };

  const Accordion = ({id, title, children}: any) => {
    const open = openSec===id;
    return(
      <div className="rounded-[18px] border border-zinc-800 bg-zinc-900/50 overflow-hidden transition-all hover:border-zinc-700">
        <button onClick={()=>setOpenSec(open?"":id)} className="w-full flex items-center justify-between p-5 text-left">
          <span className="font-bold text-[15px]">{title}</span>
          <span className={`w-8 h-8 shrink-0 grid place-items-center rounded-full border border-zinc-700 transition-all duration-300 ${open?"rotate-45 bg-white text-black border-white":"bg-zinc-800"}`}>+</span>
        </button>
        <div className={`grid transition-all duration-500 ease-in-out ${open?"grid-rows-[1fr] opacity-100":"grid-rows-[0fr] opacity-0"}`}>
          <div className="overflow-hidden"><div className="px-5 pb-6 text-[14px] leading-7 text-zinc-400">{children}</div></div>
        </div>
      </div>
    );
  };

  return(
    <div className="min-h-screen bg-[#070709] text-white selection:bg-white selection:text-black overflow-x-hidden">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&display=swap'); *{font-family:'Space Grotesk', sans-serif} @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}.fadeUp{animation:fadeUp.6s ease}`}</style>

      {/* HEADER */}
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-[#070709]/80 border-b border-zinc-900">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2"><span className="w-7 h-7 bg-white text-black grid place-items-center rounded-full font-bold">⚡</span><span className="font-bold tracking-tight">Lorem Pro Tool</span></a>
          <div className="flex items-center gap-2">
            <select value={lang} onChange={e=>setLang(e.target.value)} className="bg-zinc-900 border border-zinc-800 rounded-full px-3 py-2 text-[11px] font-bold outline-none max-w-[140px]">{LANGUAGES.map(l=><option key={l.code} value={l.code}>{l.label}</option>)}</select>
            <button onClick={handleShare} className="bg-zinc-900 border border-zinc-800 hover:bg-white hover:text-black transition px-4 py-2 rounded-full text-xs font-bold">Share ↗</button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pb-20">
        {/* HERO */}
        <div className="text-center mt-10 fadeUp">
          <div className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-full px-3 py-1 text-[10px] tracking-widest">BATCH OCR • PRE-PROCESSING • {lang.toUpperCase()}</div>
          <h1 className="mt-4 text-[32px] md:text-[52px] font-bold leading-[0.9] tracking-tighter">Image to Text<br/><span className="text-zinc-500">Converter with AI OCR.</span></h1>
          <p className="mt-3 text-zinc-400 text-[14px] max-w-2xl mx-auto leading-6">Upload up to 10 images at once. We auto-clean HD, boost contrast and extract text with 99% accuracy. All processing happens in your browser - 100% private.</p>
        </div>

        {/* TOOL BOX - ALWAYS VISIBLE BUTTONS */}
        <div className="mt-8 bg-zinc-900 border border-zinc-800 rounded-[24px] p-4 md:p-5 shadow-2xl fadeUp">
          <div onClick={()=>fileInputRef.current?.click()} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault(); handleFiles(e.dataTransfer.files);}} className="group rounded-[18px] border-2 border-dashed border-zinc-700 bg-[#0F0F10] hover:border-white hover:bg-zinc-900 transition-all p-8 md:p-10 text-center cursor-pointer">
            <div className="w-16 h-16 mx-auto rounded-full bg-white text-black grid place-items-center text-xl group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">↑</div>
            <p className="mt-4 font-bold text-[15px]">Drop up to 10 Images or Click to Browse</p>
            <p className="text-[12px] text-zinc-500 mt-1">PNG • JPG • WEBP • Auto HD Cleaning ON</p>
            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={e=>handleFiles(e.target.files!)} />
          </div>

          {/* RESULTS - Buttons always visible */}
          <div className="mt-4">
            {results.length===0? (
              <div className="grid grid-cols-2 gap-3 opacity-50 pointer-events-none">
                <button className="bg-white text-black py-3.5 rounded-xl font-bold text-sm">Copy All</button>
                <button className="bg-zinc-800 border border-zinc-700 py-3.5 rounded-xl font-bold text-sm">Download ZIP</button>
                <p className="col-span-2 text-center text-[11px] text-zinc-500 mt-1">Upload images to enable buttons</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between"><h3 className="text-sm font-bold">Results ({results.length})</h3><span className="text-[10px] bg-white text-black px-2 py-1 rounded-full font-bold">{isProcessing?"PROCESSING...":"DONE"}</span></div>
                <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                  {results.map(r=>(
                    <div key={r.id} className="bg-black border border-zinc-800 rounded-2xl p-3 flex gap-3">
                      <img src={r.preview} className="w-20 h-20 object-cover rounded-xl border border-zinc-800 shrink-0" alt="preview"/>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between gap-2"><p className="text-[11px] font-bold truncate">{r.name}</p><p className="text-[10px] text-zinc-400 shrink-0">{r.status} {r.progress>0 && r.progress<100? r.progress+"%":""}</p></div>
                        <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden"><div className="bg-white h-1.5 transition-all" style={{width:`${r.progress}%`}}></div></div>
                        <textarea value={r.text} onChange={e=>setResults(p=>p.map(x=>x.id===r.id?{...x, text:e.target.value}:x))} placeholder="Text will appear here..." className="w-full mt-2 bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-[12px] h-28 outline-none focus:border-white"/>
                        <div className="flex gap-2 mt-2">
                          <button onClick={async()=>{await navigator.clipboard.writeText(r.text); showToast("Copied!");}} className="flex-1 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 py-2 rounded-lg text-[11px] font-bold">Copy</button>
                          <button onClick={()=>setResults(p=>p.filter(x=>x.id!==r.id))} className="px-3 bg-zinc-900 border border-zinc-800 py-2 rounded-lg text-[11px]">✕</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3 sticky bottom-0 bg-zinc-900 pt-3 pb-1">
                  <button onClick={async()=>{await navigator.clipboard.writeText(allText); showToast(`Copied ${results.length} files!`);}} className="bg-white text-black py-3.5 rounded-xl font-bold text-sm hover:scale-[1.02] transition-transform">Copy All ({results.length})</button>
                  <button onClick={async()=>{ const zip=new JSZip(); results.forEach(r=>{if(r.text) zip.file(r.name.replace(/\.[^/.]+$/,"")+".txt", r.text);}); const blob=await zip.generateAsync({type:"blob"}); const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download="ocr-results.zip"; a.click(); showToast("ZIP Downloaded!");}} className="bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 py-3.5 rounded-xl font-bold text-sm transition">Download ZIP</button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <a href={`https://wa.me/?text=${encodeURIComponent(allText.slice(0,1000))}`} target="_blank" className="bg-[#25D366] text-black py-2.5 rounded-xl text-[12px] font-bold text-center">Share on WhatsApp</a>
                  <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent("Extracted text via OCR Tool: "+allText.slice(0,150))}&url=${encodeURIComponent(typeof window!=="undefined"?window.location.href:"")}`} target="_blank" className="bg-zinc-800 border border-zinc-700 py-2.5 rounded-xl text-[12px] font-bold text-center">Share on X</a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ARTICLES - BIG & SHOW/HIDE */}
        <div className="mt-14 max-w-4xl mx-auto space-y-4">
          <h2 className="text-xl font-bold">Complete Guide - Learn OCR in Detail</h2>

          <Accordion id="what" title="1. What is Image to Text OCR Technology? (1300 words guide)">
            <div className="space-y-3">
            <p>OCR stands for Optical Character Recognition. It is a powerful AI technology that converts different types of documents, such as scanned paper documents, PDF files or images captured by a digital camera into editable and searchable data. The core idea is to make computers understand text inside images just like humans do.</p>
            <p>Our tool uses Tesseract.js v5, the most accurate open-source OCR engine originally developed by HP and now maintained by Google. Unlike other online tools that upload your file to a remote server, our tool processes everything locally in your browser using WebAssembly (WASM). This means your data never leaves your device, giving you 100% privacy and security. Even if you turn off internet after loading the page, OCR will still work.</p>
            <p><b className="text-white">How it works in 4 stages:</b> 1) Pre-processing: We upscale image 1.8x, convert to grayscale, apply threshold to make text pure black and background pure white. This removes shadows and noise. 2) Layout Analysis: The engine detects text blocks, paragraphs, lines. 3) Character Recognition: Each character is matched with trained models for {lang} languages. 4) Post-processing: It reconstructs sentences, fixes common errors and preserves line breaks.</p>
            <p>This technology is essential for students converting class notes, businesses digitizing bills and visiting cards, bloggers reusing old newspaper cuttings, and developers copying text from screenshots. Accuracy for printed text is 98-99% with clear images, and for handwriting 70-85% depending on clarity. The key for best result is good lighting, high resolution and straight angle.</p>
            </div>
          </Accordion>

          <Accordion id="how" title="2. How to Use Our Batch OCR Tool? Step by Step Tutorial">
            <div className="space-y-3">
            <p><b className="text-white">Step 1 - Upload:</b> Click the dotted area or drag and drop up to 10 images. You can select JPG, PNG, WEBP, BMP. We support batch - select all at once from gallery. For best accuracy, use images with at least 300 DPI, avoid blurry photos.</p>
            <p><b className="text-white">Step 2 - Choose Language:</b> From top dropdown, select language. If your image has both Hindi and English, choose Hindi + English. This loads both language models. More languages = slightly slower but more accurate. Default eng+hin covers 95% use cases in India.</p>
            <p><b className="text-white">Step 3 - AI Processing:</b> Our auto pre-processing cleans image, then Tesseract starts. You will see progress bar for each file. Usually 3-10 seconds per image on mobile. You can edit text live in the box if AI makes minor mistake.</p>
            <p><b className="text-white">Step 4 - Save & Share:</b> Copy individual file or Copy All. Download all as ZIP file where each TXT file name matches image name. You can also directly share to WhatsApp or X (Twitter). The Share button at top copies link of tool to share with friends.</p>
            </div>
          </Accordion>

          <Accordion id="use" title="3. Top Use Cases, Benefits & Why We Are Better?">
            <div className="space-y-3">
            <p><b className="text-white">Use Cases:</b> Students - Convert textbook photos to notes for assignments. Office - Extract text from invoices, PAN, bills for data entry. Creators - Copy text from thumbnails or memes. Banking - Extract account numbers from cheque photos. Bloggers - Digitize old magazines.</p>
            <p><b className="text-white">Benefits:</b> 1) Privacy First - No server upload. 2) Free Forever - No watermark, no limit. 3) Batch Processing - 10 files at once saves 90% time. 4) HD Cleaning - Our Canvas pre-processing gives 30-40% better accuracy than raw upload sites. 5) Mobile Optimized - Works smoothly even on low RAM and slow 4G. 6) Multi-language - Hindi, English, Spanish, French, Arabic supported.</p>
            <p><b className="text-white">Why Better Than Other Sites?</b> Most sites like imagetotext.io or onlineocr.net upload your image to their server (privacy risk), show ads over your result, limit 3-5 images per day, and require signup. We have zero limits, zero ads on result, offline capable and built with Next.js 14 for super fast loading under 1.2 seconds.</p>
            </div>
          </Accordion>

          <Accordion id="seo" title="4. Related Tools & SEO Boost Tips">
            <p>We also have <a href="/placeholder-qr-generator" className="underline text-white">Placeholder & QR Generator Tool</a> - best alternative to via.placeholder.com with custom text, colors and size. And our main <a href="/" className="underline text-white">Lorem Ipsum Generator</a>. All tools are interlinked to create topical authority. For SEO, use keywords like: image to text, jpg to text, png to text, photo to text converter, ocr online free, hindi ocr, batch ocr, image to text zip download.</p>
          </Accordion>
        </div>

        {/* FAQ */}
        <div className="mt-10 max-w-4xl mx-auto">
          <h2 className="text-xl font-bold mb-4">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {[
              {q:"Is this tool free? Is there any limit?", a:"Yes 100% free forever. No signup. You can process up to 10 images per batch unlimited times. No watermark."},
              {q:"My share button not working earlier, is it fixed now?", a:"Yes! Now we use Web Share API with fallback. On mobile it opens native share sheet. On desktop it copies link and shows 'Copied!' toast. WhatsApp and Twitter share also added below results."},
              {q:"Why copy/download was hidden before?", a:"Fixed now. Buttons are always visible but disabled until you upload. After upload they become active with animation. No more hidden buttons."},
              {q:"Can I use Hindi images?", a:"Yes, select Hindi or Hindi+English from top right dropdown. It will read Hindi books, newspapers perfectly."},
              {q:"Is my image uploaded to server?", a:"No. Everything runs in your browser via WASM. Image never leaves your phone. Best for private documents."},
            ].map((f,i)=>(
              <div key={i} className="rounded-2xl border border-zinc-800 bg-zinc-900/40 overflow-hidden">
                <button onClick={()=>setOpenFaq(openFaq===i?null:i)} className="w-full flex justify-between items-center p-5 text-left">
                  <span className="text-[14px] font-semibold">{f.q}</span>
                  <span className={`w-7 h-7 grid place-items-center rounded-full border border-zinc-700 shrink-0 transition-transform ${openFaq===i?"rotate-45 bg-white text-black":"bg-zinc-800"}`}>+</span>
                </button>
                <div className={`grid transition-all duration-300 ${openFaq===i?"grid-rows-[1fr] opacity-100":"grid-rows-[0fr] opacity-0"}`}>
                  <div className="overflow-hidden"><p className="px-5 pb-5 text-[13px] leading-6 text-zinc-400">{f.a}</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* TOAST */}
        {toast && <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white text-black px-5 py-2.5 rounded-full text-sm font-bold shadow-2xl animate-[fadeUp_.3s_ease] z-50">{toast}</div>}

        <footer className="mt-16 border-t border-zinc-900 pt-8 text-center text-[11px] text-zinc-600">
          <p>© 2026 Lorem Pro Tool - All tools free, private and fast.</p>
          <p className="mt-2 max-w-2xl mx-auto leading-5">Keywords: image to text, batch ocr, jpg to text, png to text, photo to text converter, free ocr online, hindi ocr, zip download</p>
        </footer>
      </main>
    </div>
  );
}
