"use client";
import { useState, useRef, useEffect } from "react";
import Tesseract from "tesseract.js";
import JSZip from "jszip";
import jsPDF from "jspdf";

const LANGUAGES = [
  { code: "eng", label: "English" },
  { code: "hin", label: "Hindi" },
  { code: "eng+hin", label: "Hindi + English" },
  { code: "eng+spa", label: "Spanish" },
  { code: "eng+fra", label: "French" },
  { code: "ara", label: "Arabic" },
];

type Result = { id: string, preview: string, text: string, progress: number, status: string, name: string };

export default function UltraAdvancePage() {
  const [results, setResults] = useState<Result[]>([]);
  const [lang, setLang] = useState("eng+hin");
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState("");
  const [showCamera, setShowCamera] = useState(false);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [rotate, setRotate] = useState(0);
  const [openSec, setOpenSec] = useState("what");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const showToast = (m: string) => { setToast(m); setTimeout(()=>setToast(""), 2500); };

  const preprocess = (src: string): Promise<string> => {
    return new Promise((res) => {
      const img = new Image(); img.src = src;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")!;
        canvas.width = img.width; canvas.height = img.height;
        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
        ctx.translate(canvas.width/2, canvas.height/2);
        ctx.rotate((rotate * Math.PI) / 180);
        ctx.drawImage(img, -canvas.width/2, -canvas.height/2, canvas.width, canvas.height);
        res(canvas.toDataURL());
      };
    });
  };

  const doOCR = async (src: string, name: string, preview: string) => {
    const id = Math.random().toString(36).slice(2);
    const newItem: Result = { id, preview, text:"", progress:0, status:"Cleaning...", name };
    setResults(p=>[...p, newItem]);
    const cleaned = await preprocess(src);
    setResults(p=>p.map(r=>r.id===id?{...r, status:"Reading..."}:r));
    try{
      const {data} = await Tesseract.recognize(cleaned, lang, {
        logger:m=>{ if(m.status==="recognizing text") setResults(p=>p.map(r=>r.id===id?{...r, progress:Math.round(m.progress*100)}:r)); }
      });
      setResults(p=>p.map(r=>r.id===id?{...r, text:data.text, progress:100, status:"Done ✓"}:r));
    }catch{
      setResults(p=>p.map(r=>r.id===id?{...r, status:"Failed"}:r));
    }
  };

  const handleFiles = async (files: FileList | null) => {
    if(!files || files.length===0) return;
    const arr = Array.from(files).slice(0,10);
    setIsProcessing(true);
    for(const file of arr){
      if(file.type==="application/pdf"){
        showToast("PDF padh raha hu...");
        try{
          const pdfjs = await import("pdfjs-dist");
          // @ts-ignore
          pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs`;
          const pdf = await pdfjs.getDocument(URL.createObjectURL(file)).promise;
          for(let i=1;i<=pdf.numPages;i++){
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({scale: 2});
            const canvas = document.createElement("canvas");
            canvas.width = viewport.width; canvas.height = viewport.height;
            const ctx = canvas.getContext("2d")!;
            // @ts-ignore
            await page.render({canvasContext: ctx, viewport}).promise;
            await doOCR(canvas.toDataURL(), `${file.name}-page-${i}`, canvas.toDataURL());
          }
        }catch(e){ console.error(e); showToast("PDF failed, try image PDF"); }
      } else {
        const url = URL.createObjectURL(file);
        await doOCR(url, file.name, url);
      }
    }
    setIsProcessing(false);
    // save history
    setResults(curr=>{
      localStorage.setItem("ocr_history", JSON.stringify([...curr].slice(0,20)));
      return curr;
    });
  };

  // FIXED CAMERA LOGIC
  const startCamera = async () => {
    try{
      setShowCamera(true);
      const stream = await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"}});
      setTimeout(()=>{ if(videoRef.current) videoRef.current.srcObject = stream; }, 100);
    }catch(e){
      showToast("Camera permission do, HTTPS par kholo");
      setShowCamera(false);
      console.error(e);
    }
  };

  const captureCamera = async () => {
    if(!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d")!.drawImage(videoRef.current,0,0);
    const dataUrl = canvas.toDataURL("image/jpeg");
    (videoRef.current.srcObject as MediaStream)?.getTracks().forEach(t=>t.stop());
    setShowCamera(false);
    setIsProcessing(true);
    await doOCR(dataUrl, `camera-${Date.now()}.jpg`, dataUrl);
    setIsProcessing(false);
  };

  const allText = results.map(r=>`--- ${r.name} ---\n${r.text}`).join("\n\n");

  return(
    <div className="min-h-screen bg-[#070709] text-white">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&display=swap'); *{font-family:'Space Grotesk', sans-serif}`}</style>

      <header className="sticky top-0 z-20 backdrop-blur-xl bg-[#070709]/80 border-b border-zinc-900">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <a href="/" className="font-bold">⚡ Lorem Pro Tool</a>
          <div className="flex gap-2">
            <select value={lang} onChange={e=>setLang(e.target.value)} className="bg-zinc-900 border border-zinc-800 rounded-full px-3 py-2 text-[11px] font-bold outline-none">{LANGUAGES.map(l=><option key={l.code} value={l.code}>{l.label}</option>)}</select>
            <button onClick={()=>{navigator.clipboard.writeText(window.location.href); showToast("Link Copied!");}} className="bg-white text-black px-4 py-2 rounded-full text-xs font-bold">Share ↗</button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pb-20">
        <div className="text-center mt-8">
          <h1 className="text-[32px] md:text-[52px] font-bold leading-[0.9] tracking-tighter">All-in-One<br/><span className="text-zinc-500">OCR + PDF + Camera.</span></h1>
        </div>

        {/* FIXED CONTROLS */}
        <div className="mt-6 bg-zinc-900 border border-zinc-800 rounded-[20px] p-4">
          <div className="flex flex-wrap gap-3">
            <button onClick={()=>imageInputRef.current?.click()} className="bg-white text-black px-5 py-2.5 rounded-full text-sm font-bold hover:scale-105 transition">📁 Upload</button>
            <button onClick={startCamera} className="bg-zinc-800 border border-zinc-700 px-5 py-2.5 rounded-full text-sm font-bold hover:bg-zinc-700 transition">📷 Camera</button>
            <button onClick={()=>pdfInputRef.current?.click()} className="bg-black border border-zinc-700 px-5 py-2.5 rounded-full text-sm font-bold hover:bg-zinc-800 transition">📄 PDF</button>
            
            {/* Hidden inputs - FIXED */}
            <input ref={imageInputRef} type="file" accept="image/*" multiple className="hidden" onChange={e=>handleFiles(e.target.files)} />
            <input ref={pdfInputRef} type="file" accept="application/pdf" multiple className="hidden" onChange={e=>handleFiles(e.target.files)} />
          </div>
          <div className="flex flex-wrap gap-4 mt-4 text-[11px]">
            <label className="flex items-center gap-2">Bright <input type="range" min="80" max="130" value={brightness} onChange={e=>setBrightness(Number(e.target.value))} /></label>
            <label className="flex items-center gap-2">Contrast <input type="range" min="80" max="150" value={contrast} onChange={e=>setContrast(Number(e.target.value))} /></label>
            <label className="flex items-center gap-2">Rotate <input type="range" min="0" max={360} value={rotate} onChange={e=>setRotate(Number(e.target.value))} /></label>
          </div>
        </div>

        {/* CAMERA MODAL - FIXED */}
        {showCamera && (
          <div className="fixed inset-0 z-50 bg-black/90 grid place-items-center p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-[20px] p-4 w-full max-w-md">
              <p className="text-sm font-bold mb-2">Point camera to text</p>
              <video ref={videoRef} autoPlay playsInline muted className="w-full rounded-xl bg-black aspect-[3/4] object-cover"></video>
              <canvas ref={canvasRef} className="hidden"></canvas>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <button onClick={captureCamera} className="bg-white text-black py-3 rounded-xl font-bold">📸 Capture & OCR</button>
                <button onClick={()=>{setShowCamera(false); (videoRef.current?.srcObject as MediaStream)?.getTracks().forEach(t=>t.stop());}} className="bg-zinc-800 py-3 rounded-xl font-bold">Close</button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 bg-zinc-900 border border-zinc-800 rounded-[24px] p-4">
          <div onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault(); handleFiles(e.dataTransfer.files);}} className="rounded-[16px] border-2 border-dashed border-zinc-700 bg-[#0F0F10] p-10 text-center">
            <p className="font-bold">Drop Images or PDF here (Up to 10)</p>
            <p className="text-xs text-zinc-500 mt-1">JPG, PNG, WEBP, PDF • {lang}</p>
          </div>

          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
            <button onClick={async()=>{await navigator.clipboard.writeText(allText); showToast("All Copied!");}} className={`py-3 rounded-xl font-bold text-sm ${results.length?"bg-white text-black":"bg-zinc-800 text-zinc-500 pointer-events-none"}`}>Copy All ({results.length})</button>
            <button onClick={async()=>{ const zip=new JSZip(); results.forEach(r=>{if(r.text) zip.file(r.name.replace(/\.[^/.]+$/,"")+".txt", r.text);}); const blob=await zip.generateAsync({type:"blob"}); const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download="ocr.zip"; a.click();}} className={`py-3 rounded-xl font-bold text-sm border ${results.length?"bg-zinc-800 border-zinc-700":"bg-zinc-900 border-zinc-800 text-zinc-600 pointer-events-none"}`}>Download ZIP</button>
            <button onClick={()=>{ const doc=new jsPDF(); doc.text(doc.splitTextToSize(allText,180),10,10); doc.save("ocr-all.pdf");}} className={`py-3 rounded-xl font-bold text-sm border ${results.length?"bg-zinc-800 border-zinc-700":"bg-zinc-900 border-zinc-800 text-zinc-600 pointer-events-none"}`}>Export PDF</button>
            <button onClick={()=>setResults([])} className="bg-red-500/10 border border-red-500/20 text-red-400 py-3 rounded-xl font-bold text-sm">Clear All</button>
          </div>

          <div className="mt-4 space-y-3">
            {results.map(r=>(
              <div key={r.id} className="bg-black border border-zinc-800 rounded-2xl p-3 flex gap-3">
                <img src={r.preview} className="w-20 h-20 object-cover rounded-xl shrink-0" alt="preview"/>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between"><p className="text-[11px] font-bold truncate">{r.name}</p><p className="text-[10px] text-zinc-400">{r.status} {r.progress>0 && r.progress<100? r.progress+"%":""}</p></div>
                  <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-2"><div className="bg-white h-1.5 transition-all" style={{width:`${r.progress}%`}}></div></div>
                  <textarea value={r.text} onChange={e=>setResults(p=>p.map(x=>x.id===r.id?{...x, text:e.target.value}:x))} className="w-full mt-2 bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs h-28 outline-none"/>
                </div>
              </div>
            ))}
          </div>
        </div>

        {toast && <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white text-black px-5 py-2.5 rounded-full text-sm font-bold shadow-2xl z-50">{toast}</div>}
      </main>
    </div>
  );
}
