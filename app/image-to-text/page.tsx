// @ts-nocheck
'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

export default function ImageQRGenerator() {
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [bg, setBg] = useState("#111827");
  const [color, setColor] = useState("#ffffff");
  const [text, setText] = useState("Lorem Pro Tool");
  const [qrText, setQrText] = useState("https://loremprotool.com");
  const canvasRef = useRef(null);
  const [showMore, setShowMore] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = width; canvas.height = height;
    ctx.fillStyle = bg; ctx.fillRect(0,0,width,height);
    ctx.fillStyle = color; ctx.font = `bold ${Math.max(20, width/15)}px Inter, sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const lines = text.split('\n');
    lines.forEach((line, i) => { ctx.fillText(line, width/2, height/2 + (i - (lines.length-1)/2)*40); });
    ctx.font = `12px sans-serif`; ctx.fillText(`${width} x ${height}`, width/2, height - 20);
  }, [width, height, bg, color, text]);

  const downloadImage = () => {
    const link = document.createElement('a');
    link.download = `placeholder-${width}x${height}.png`;
    link.href = canvasRef.current.toDataURL(); link.click();
  };

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(qrText)}&bgcolor=${bg.replace('#','')}&color=${color.replace('#','')}`;

  // NEW: Download QR with Text
  const downloadQRWithText = () => {
    const qrImg = new Image();
    qrImg.crossOrigin = "anonymous";
    qrImg.src = qrUrl;
    qrImg.onload = () => {
      const c = document.createElement('canvas');
      c.width = 500; c.height = 550;
      const ctx = c.getContext('2d');
      ctx.fillStyle = "#ffffff"; ctx.fillRect(0,0,c.width,c.height);
      ctx.drawImage(qrImg, 50, 20, 400, 400);
      ctx.fillStyle = "#000000"; ctx.font = "bold 18px sans-serif";
      ctx.textAlign = "center";
      // Text ko wrap karna
      const words = qrText.length > 30? qrText.substring(0,35) + "..." : qrText;
      ctx.fillText(words, c.width/2, 470);
      const link = document.createElement('a');
      link.download = `qr-with-text.png`;
      link.href = c.toDataURL(); link.click();
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-4xl font-bold text-center mt-4">Image Placeholder + QR Code Generator</h1>
        <p className="text-gray-400 text-center mt-2 mb-8">Custom placeholder image with text + instant QR - 2 in 1 Pro Tool</p>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
            <h2 className="font-bold">⚙️ Image Settings</h2>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-gray-400">Width</label><input type="number" value={width} onChange={e=>setWidth(Number(e.target.value))} className="w-full bg-black border border-zinc-700 rounded-lg p-2 mt-1"/></div>
              <div><label className="text-xs text-gray-400">Height</label><input type="number" value={height} onChange={e=>setHeight(Number(e.target.value))} className="w-full bg-black border border-zinc-700 rounded-lg p-2 mt-1"/></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-gray-400">BG Color</label><input type="color" value={bg} onChange={e=>setBg(e.target.value)} className="w-full h-10 bg-black rounded-lg"/></div>
              <div><label className="text-xs text-gray-400">Text Color</label><input type="color" value={color} onChange={e=>setColor(e.target.value)} className="w-full h-10 bg-black rounded-lg"/></div>
            </div>
            <div><label className="text-xs text-gray-400">Image Text</label><textarea value={text} onChange={e=>setText(e.target.value)} rows={3} className="w-full bg-black border border-zinc-700 rounded-lg p-2 mt-1"/></div>
            <div><label className="text-xs text-gray-400">QR Data (URL / Text)</label><input value={qrText} onChange={e=>setQrText(e.target.value)} className="w-full bg-black border border-zinc-700 rounded-lg p-2 mt-1"/></div>
          </div>

          <div className="space-y-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              <canvas ref={canvasRef} className="w-full rounded-xl bg-black"/>
              <button onClick={downloadImage} className="w-full mt-3 py-2.5 bg-white text-black rounded-full font-bold">Download Image PNG</button>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center">
              <img src={qrUrl} alt="QR Code" className="w-[200px] h-[200px] mx-auto rounded-xl bg-white p-2"/>
              <p className="text-xs text-gray-400 mt-3 break-all">{qrText}</p>

              <div className="grid grid-cols-2 gap-2 mt-3">
                <a href={qrUrl} download target="_blank" className="py-2.5 bg-zinc-800 text-white rounded-full font-bold text-sm text-center border border-zinc-700">QR Only</a>
                <button onClick={downloadQRWithText} className="py-2.5 bg-orange-500 text-black rounded-full font-bold text-sm">QR + Text ▼</button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
