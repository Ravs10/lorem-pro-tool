// @ts-nocheck
'use client';
import { useState, useRef, useEffect, useMemo } from "react";
import JSZip from "jszip";

export default function ImageQRGenerator() {
  //... aapka upar wala pura state same rahega, yaha se cut mat karo...
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [bg, setBg] = useState("#111827");
  const [bg2, setBg2] = useState("#4f46e5");
  const [color, setColor] = useState("#ffffff");
  const [text, setText] = useState("Lorem Pro");
  const [useGradient, setUseGradient] = useState(true);
  const canvasRef = useRef(null);
  const [qrType, setQrType] = useState("url");
  const [urlVal, setUrlVal] = useState("https://lorem-pro-tool.vercel.app");
  const [textVal, setTextVal] = useState("Hello World");
  const [wifiSSID, setWifiSSID] = useState("");
  const [wifiPass, setWifiPass] = useState("");
  const [wifiType, setWifiType] = useState("WPA");
  const [emailTo, setEmailTo] = useState("test@test.com");
  const [phoneVal, setPhoneVal] = useState("919999999999");
  const [waNum, setWaNum] = useState("919999999999");
  const [waMsg, setWaMsg] = useState("Hi");
  const [upiId, setUpiId] = useState("merchant@upi");
  const [upiName, setUpiName] = useState("Lorem Pro");
  const [upiAmt, setUpiAmt] = useState("100");
  const [bulkSizes, setBulkSizes] = useState("300x250, 728x90, 1200x630, 800x600");
  const [isZipping, setIsZipping] = useState(false);
  const API_BASE = "https://lorem-pro-tool.vercel.app/api";

  const qrData = useMemo(() => {
    switch(qrType){
      case "url": return urlVal;
      case "text": return textVal;
      case "wifi": return `WIFI:T:${wifiType};S:${wifiSSID};P:${wifiPass};;`;
      case "email": return `mailto:${emailTo}`;
      case "phone": return `tel:${phoneVal}`;
      case "whatsapp": return `https://wa.me/${waNum}?text=${encodeURIComponent(waMsg)}`;
      case "upi": return `upi://pay?pa=${upiId}&pn=${upiName}&am=${upiAmt}`;
      default: return urlVal;
    }
  }, [qrType, urlVal, textVal, wifiSSID, wifiPass, wifiType, emailTo, phoneVal, waNum, waMsg, upiId, upiName, upiAmt]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = width; canvas.height = height;
    if(useGradient){
      const g = ctx.createLinearGradient(0,0,width,height);
      g.addColorStop(0, bg); g.addColorStop(1, bg2);
      ctx.fillStyle = g;
    } else { ctx.fillStyle = bg; }
    ctx.fillRect(0,0,width,height);
    ctx.fillStyle = color; ctx.font = `bold ${Math.max(14, width/15)}px sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const lines = text.split('\n');
    lines.forEach((line, i) => { ctx.fillText(line, width/2, height/2 + i*30); });
    ctx.font = `12px sans-serif`; ctx.fillText(`${width} x ${height}`, width/2, height-20);
  }, [width, height, bg, bg2, color, text, useGradient]);

  const downloadImage = () => {
    const link = document.createElement('a');
    link.download = `placeholder-${width}x${height}.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
  };
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(qrData)}`;
  const downloadQRWithText = () => {
    const qrImg = new Image(); qrImg.crossOrigin = "anonymous"; qrImg.src = qrUrl;
    qrImg.onload = () => {
      const c = document.createElement('canvas'); c.width = 500; c.height = 550;
      const ctx = c.getContext('2d');
      ctx.fillStyle = "#ffffff"; ctx.fillRect(0,0,c.width,c.height);
      ctx.drawImage(qrImg, 50, 20, 400, 400);
      ctx.fillStyle = "#000000"; ctx.font = "bold 18px sans-serif"; ctx.textAlign = "center";
      const display = qrData.length > 35? qrData.substring(0,35)+"...": qrData;
      ctx.fillText(display, c.width/2, 470);
      ctx.font = "12px sans-serif"; ctx.fillText(`Type: ${qrType.toUpperCase()}`, c.width/2, 490);
      const link = document.createElement('a'); link.download = `qr-${qrType}-with-text.png`;
      link.href = c.toDataURL(); link.click();
    }
  };
  const downloadBulkZip = async () => {
    setIsZipping(true);
    const zip = new JSZip();
    const sizes = bulkSizes.split(',').map(s=>s.trim()).filter(Boolean);
    for(let size of sizes){
      try{
        const url = `${API_BASE}/${size}?text=${encodeURIComponent(text)}&bg=${bg.replace('#','')}&bg2=${bg2.replace('#','')}&color=${color.replace('#','')}&gradient=${useGradient?'1':'0'}`;
        const res = await fetch(url); const blob = await res.blob(); zip.file(`${size}.png`, blob);
      }catch(e){}
    }
    const content = await zip.generateAsync({type:"blob"});
    const a = document.createElement('a'); a.href = URL.createObjectURL(content);
    a.download = `lorem-pro-bulk-${Date.now()}.zip`; a.click(); setIsZipping(false);
  };
  const currentApiUrl = `${API_BASE}/${width}x${height}?text=${encodeURIComponent(text)}&bg=${bg.replace('#','')}&bg2=${bg2.replace('#','')}&color=${color.replace('#','')}&gradient=${useGradient?'1':'0'}`;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto p-6">
        {/* AAPKI DEMAND KE HISAAB SE HEADING */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-extrabold">2 in 1 Ultra Pro Tool</h1>
          <h2 className="text-2xl font-bold text-violet-400 mt-2">Placeholder QR Generator</h2>
          <p className="text-gray-400 mt-1">via.placeholder.com ka apna alternative + QR Pro</p>
        </div>

        {/* TOOL SAME */}
        <div className="grid md:grid-cols-2 gap-6">
          {/*... aapka pura tool ka JSX same yaha rahega, maine short kar diya hai, aap upar wala hi rakho... */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-4">
            <h2 className="font-bold">⚙️ Image Generator</h2>
            <div className="grid grid-cols-2 gap-2">
              <div><label className="text-xs">Width</label><input type="number" value={width} onChange={e=>setWidth(parseInt(e.target.value)||100)} className="w-full bg-zinc-800 p-2 rounded"/></div>
              <div><label className="text-xs">Height</label><input type="number" value={height} onChange={e=>setHeight(parseInt(e.target.value)||100)} className="w-full bg-zinc-800 p-2 rounded"/></div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div><label className="text-xs">BG1</label><input type="color" value={bg} onChange={e=>setBg(e.target.value)} className="w-full h-10"/></div>
              <div><label className="text-xs">BG2</label><input type="color" value={bg2} onChange={e=>setBg2(e.target.value)} className="w-full h-10"/></div>
              <div><label className="text-xs">Text Color</label><input type="color" value={color} onChange={e=>setColor(e.target.value)} className="w-full h-10"/></div>
            </div>
            <label className="flex gap-2 text-sm"><input type="checkbox" checked={useGradient} onChange={e=>setUseGradient(e.target.checked)}/> Gradient ON</label>
            <input value={text} onChange={e=>setText(e.target.value)} className="w-full bg-zinc-800 p-2 rounded" placeholder="Text"/>
            <div className="bg-black p-2 rounded border border-zinc-800"><p className="text-[10px] text-gray-400">Your API Link:</p><p className="text-[10px] break-all">{currentApiUrl}</p></div>
            <div className="bg-black border border-green-900 rounded-xl p-3">
              <label className="text-xs text-green-400">Bulk Sizes (comma)</label>
              <input value={bulkSizes} onChange={e=>setBulkSizes(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 mt-1 text-sm"/>
              <button onClick={downloadBulkZip} disabled={isZipping} className="w-full mt-2 py-2 bg-green-500 text-black rounded-full font-bold text-sm">{isZipping?"ZIP Bana Raha...":"📦 Bulk ZIP Download (API se)"}</button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <canvas ref={canvasRef} className="w-full rounded bg-zinc-800"></canvas>
              <button onClick={downloadImage} className="w-full mt-3 bg-white text-black py-2 rounded-full font-bold">Download Image</button>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <h2 className="font-bold">📱 QR Generator Pro</h2>
              <select value={qrType} onChange={e=>setQrType(e.target.value)} className="w-full bg-zinc-800 p-2 rounded mt-2">
                <option value="url">🌐 Website</option><option value="text">📝 Plain Text</option><option value="wifi">📶 WiFi</option><option value="email">📧 Email</option><option value="phone">📞 Phone</option><option value="whatsapp">💬 WhatsApp</option><option value="upi">💸 UPI Pay</option>
              </select>
              {qrType==="url" && <input value={urlVal} onChange={e=>setUrlVal(e.target.value)} className="w-full bg-zinc-800 p-2 rounded mt-2" />}
              {qrType==="text" && <textarea value={textVal} onChange={e=>setTextVal(e.target.value)} className="w-full bg-zinc-800 p-2 rounded mt-2" />}
              {qrType==="wifi" && <div className="grid grid-cols-2 gap-2 mt-2"><input value={wifiSSID} onChange={e=>setWifiSSID(e.target.value)} placeholder="SSID" className="bg-zinc-800 p-2 rounded"/><input value={wifiPass} onChange={e=>setWifiPass(e.target.value)} placeholder="Password" className="bg-zinc-800 p-2 rounded"/></div>}
              {qrType==="email" && <input value={emailTo} onChange={e=>setEmailTo(e.target.value)} className="w-full bg-zinc-800 p-2 rounded mt-2"/>}
              {qrType==="phone" && <input value={phoneVal} onChange={e=>setPhoneVal(e.target.value)} className="w-full bg-zinc-800 p-2 rounded mt-2"/>}
              {qrType==="whatsapp" && <div className="grid grid-cols-2 gap-2 mt-2"><input value={waNum} onChange={e=>setWaNum(e.target.value)} className="bg-zinc-800 p-2 rounded"/><input value={waMsg} onChange={e=>setWaMsg(e.target.value)} className="bg-zinc-800 p-2 rounded"/></div>}
              {qrType==="upi" && <div className="space-y-2 mt-2"><input value={upiId} onChange={e=>setUpiId(e.target.value)} className="w-full bg-zinc-800 p-2 rounded" placeholder="UPI ID"/><input value={upiName} onChange={e=>setUpiName(e.target.value)} className="w-full bg-zinc-800 p-2 rounded" placeholder="Name"/><input value={upiAmt} onChange={e=>setUpiAmt(e.target.value)} className="w-full bg-zinc-800 p-2 rounded" placeholder="Amount"/></div>}
              <div className="bg-zinc-800 mt-4 p-4 rounded flex justify-center"><img src={qrUrl} alt="QR Code" className="w-64"/></div>
              <div className="grid grid-cols-2 gap-2 mt-3">
                <a href={qrUrl} download target="_blank" className="bg-zinc-700 text-center py-2 rounded">Download QR</a>
                <button onClick={downloadQRWithText} className="bg-white text-black py-2 rounded">Download with Text</button>
              </div>
            </div>
          </div>
        </div>

        {/* SEO ARTICLE - YE GOOGLE KE LIYE HAI */}
        <div className="mt-16 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 prose prose-invert max-w-none">
          <h2 className="text-2xl font-bold text-white">What is 2 in 1 Placeholder QR Generator?</h2>
          <p className="text-zinc-400">This is a free <strong>2-in-1 Ultra Pro Tool</strong> that combines a Placeholder Image Generator (best alternative to via.placeholder.com) and a powerful QR Code Generator in one page. You can create dummy images with custom size, text, colors, gradient and also generate QR codes for UPI payment, WiFi, WhatsApp, URL, Email and Phone without any watermark.</p>

          <h2 className="text-xl font-bold mt-8">Features of Placeholder Generator</h2>
          <ul className="list-disc pl-6 text-zinc-400">
            <li>Custom Width & Height (e.g., 300x250, 728x90, 1200x630)</li>
            <li>Text, Background Color, Gradient Support</li>
            <li>Your own API: <code>/api/WIDTHxHEIGHT?text=&bg=&color=</code> - No via.placeholder.com dependency</li>
            <li>Bulk ZIP Download - Generate 10+ sizes in 1 click</li>
          </ul>

          <h2 className="text-xl font-bold mt-8">Features of QR Generator</h2>
          <ul className="list-disc pl-6 text-zinc-400">
            <li><strong>UPI QR:</strong> Generate UPI payment QR for Google Pay, PhonePe, Paytm</li>
            <li><strong>WiFi QR:</strong> Share WiFi without typing password</li>
            <li><strong>WhatsApp QR:</strong> Direct chat with pre-filled message</li>
            <li>Download QR with text label</li>
          </ul>

          <h2 className="text-xl font-bold mt-8">How to Use?</h2>
          <ol className="list-decimal pl-6 text-zinc-400">
            <li>Set width, height, colors and text for placeholder image</li>
            <li>Canvas will auto-preview. Click Download Image or copy API link for developers</li>
            <li>For bulk, enter sizes comma separated and click Bulk ZIP Download</li>
            <li>For QR, select type (URL, UPI, WiFi etc), fill details and download QR</li>
          </ol>

          <h2 className="text-xl font-bold mt-8">FAQ</h2>
          <h3 className="font-semibold text-white">Is it free and without watermark?</h3>
          <p className="text-zinc-400">Yes, 100% free, no watermark, no login required.</p>
          <h3 className="font-semibold text-white mt-4">Difference from via.placeholder.com?</h3>
          <p className="text-zinc-400">via.placeholder.com is external. This tool uses YOUR own /api route, supports gradient, custom fonts and bulk ZIP which via.placeholder does not offer.</p>
        </div>
      </div>
    </div>
  );
}
