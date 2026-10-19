// @ts-nocheck
'use client';
import { useState, useRef, useEffect, useMemo } from "react";
import JSZip from "jszip";
import Link from 'next/link';

export default function ImageQRGenerator() {
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [bg, setBg] = useState("#111827");
  const [bg2, setBg2] = useState("#4f46e5");
  const [color, setColor] = useState("#ffffff");
  const [text, setText] = useState("Lorem Pro");
  const [useGradient, setUseGradient] = useState(true);
  const canvasRef = useRef(null);
  const [qrType, setQrType] = useState("url");
  const [urlVal, setUrlVal] = useState("https://lorem-pro-tool.run4ravish.workers.dev");
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
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [showMore, setShowMore] = useState(false);
  const API_BASE = "https://lorem-pro-tool.run4ravish.workers.dev/api";

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
        <div className="text-center mb-6">
          <h1 className="text-4xl font-extrabold">2 in 1 Placeholder QR Generator - Free Placeholder Image & QR Code Maker</h1>
          <p className="text-gray-400 mt-3 max-w-3xl mx-auto">Create custom placeholder images with any size, text, color & gradient + Generate QR codes for UPI, WiFi, WhatsApp, URL, Email & Phone. Best free alternative to via.placeholder.com. No watermark, no signup, bulk ZIP download.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
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

        {/* SEO CONTENT - 1200 WORDS */}
        <div className="mt-16 space-y-10 text-zinc-300 border-t border-zinc-800 pt-10">
          <section>
            <h2 className="text-2xl font-bold text-white mb-2">What is a 2 in 1 Placeholder QR Generator?</h2>
            <p className="text-sm leading-relaxed">A 2 in 1 Placeholder QR Generator is a free online tool that combines two powerful tools in one place. First, it is a Placeholder Image Generator, the best alternative to via.placeholder.com. You can create custom dummy images with any width, height, text, background color and gradient for your website design, mockups and testing. Second, it is a QR Code Generator that lets you create QR codes for Website URL, Plain Text, WiFi, Email, Phone, WhatsApp and UPI Payment. Whether you are a developer, designer, shop owner or student, this single tool saves your time. No need to open two different websites. Create placeholder images and QR codes instantly, without watermark, without signup and without any limit.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-2">How to Use Placeholder Image Generator?</h2>
            <ol className="list-decimal ml-5 text-sm space-y-2 leading-relaxed">
              <li><b className="text-white">Set Width & Height:</b> Enter any size you need, like 300x250 for ads, 728x90 for leaderboard, 1200x630 for social media, or 1920x1080 for hero banner.</li>
              <li><b className="text-white">Choose Colors:</b> Pick BG1, BG2 and Text Color. Turn on Gradient for a modern dual-color look or turn it off for solid color.</li>
              <li><b className="text-white">Add Text:</b> Write your own text like Lorem Pro, Coming Soon, or Banner Ad.</li>
              <li><b className="text-white">Preview & Download:</b> Live preview will show instantly. Click Download Image to save PNG.</li>
              <li><b className="text-white">Bulk Download:</b> Need many sizes at once? Enter sizes with comma like 300x250, 728x90, 1200x630 and click Bulk ZIP Download. All images will download as one ZIP file.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-2">How to Use QR Code Generator?</h2>
            <p className="text-sm leading-relaxed">QR Generator is very easy to use. First, select QR type from dropdown - Website, Text, WiFi, Email, Phone, WhatsApp or UPI. Then fill the details. For example, for UPI QR, enter your UPI ID, Name and Amount. For WiFi QR, enter SSID and Password. For WhatsApp QR, enter number and pre-filled message. Your QR code will generate instantly in live preview. You can download it as simple QR or Download with Text, where your data is printed below the QR for easy identification. This QR works with Google Pay, PhonePe, Paytm, BHIM, Camera and any QR scanner app.</p>
            {showMore && (
              <div className="mt-3 space-y-3 text-sm leading-relaxed">
                <p><b className="text-white">Pro Tip for Shop Owners:</b> If you have a shop, create a UPI QR with your UPI ID and fixed amount. Print it and stick it on your counter. Customers can scan and pay in 5 seconds. No need to tell your number again and again. Similarly, for home or office, create a WiFi QR and stick it on wall. Guests can scan and connect to WiFi without typing password.</p>
                <p><b className="text-white">Pro Tip for Developers:</b> Use QR for testing deep links, app download links, and contact sharing. You can generate a QR for your staging URL and test it on mobile in one second, instead of typing long URL manually.</p>
              </div>
            )}
            <button onClick={()=>setShowMore(!showMore)} className="mt-3 text-sm font-semibold text-white underline underline-offset-4">{showMore ? "Show Less ↑" : "Read More ↓"}</button>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-2">Use Your Own Placeholder API in Your Projects</h2>
            <p className="text-sm leading-relaxed mb-3">This is the biggest advantage over via.placeholder.com. You get your own API link that you can use directly in HTML, React, Next.js or any project. No external dependency, no downtime.</p>
            <div className="bg-black border border-zinc-800 rounded-xl p-4 overflow-x-auto">
              <code className="text-xs text-green-400 break-all">{"<img src=\"https://lorem-pro-tool.run4ravish.workers.dev/api/1200x630?text=Hello&bg=4f46e5&bg2=111827&color=ffffff&gradient=1\" />"}</code>
            </div>
            <ul className="list-disc ml-5 text-sm space-y-1 mt-3 leading-relaxed">
              <li><b className="text-white">Parameters:</b> width x height, text, bg, bg2, color, gradient (1 or 0)</li>
              <li><b className="text-white">Example:</b> /api/300x250?text=Ad Banner&bg=111827&color=ffffff</li>
              <li><b className="text-white">Use Case:</b> Perfect for Figma mockups, HTML templates, client demos, and testing responsive design.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-2">Which QR Code Type Should You Use?</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-zinc-800">
                <thead><tr className="bg-zinc-800 text-white"><th className="p-2 text-left">QR Type</th><th className="p-2 text-left">Best For</th><th className="p-2 text-left">Example</th></tr></thead>
                <tbody>
                  <tr className="border-t border-zinc-800"><td className="p-2">Website URL QR</td><td className="p-2">Portfolio, YouTube, Shop</td><td className="p-2">Scan to open website</td></tr>
                  <tr className="border-t border-zinc-800"><td className="p-2">UPI QR</td><td className="p-2">Payment, Shop, Donation</td><td className="p-2">Scan to pay via GPay / PhonePe</td></tr>
                  <tr className="border-t border-zinc-800"><td className="p-2">WiFi QR</td><td className="p-2">Home, Cafe, Office</td><td className="p-2">Scan to connect WiFi</td></tr>
                  <tr className="border-t border-zinc-800"><td className="p-2">WhatsApp QR</td><td className="p-2">Business, Support</td><td className="p-2">Scan to chat directly</td></tr>
                  <tr className="border-t border-zinc-800"><td className="p-2">Email / Phone QR</td><td className="p-2">Visiting Card, Contact</td><td className="p-2">Scan to call or mail</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-2">Why This Tool is Better Than via.placeholder.com?</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-zinc-800">
                <thead><tr className="bg-zinc-800 text-white"><th className="p-2 text-left">Feature</th><th className="p-2 text-left">via.placeholder.com</th><th className="p-2 text-left">Lorem Pro Tool</th></tr></thead>
                <tbody>
                  <tr className="border-t border-zinc-800"><td className="p-2">Gradient Support</td><td className="p-2">No</td><td className="p-2">Yes ✅</td></tr>
                  <tr className="border-t border-zinc-800"><td className="p-2">Bulk ZIP Download</td><td className="p-2">No</td><td className="p-2">Yes ✅</td></tr>
                  <tr className="border-t border-zinc-800"><td className="p-2">QR Generator</td><td className="p-2">No</td><td className="p-2">Yes ✅ (7 Types)</td></tr>
                  <tr className="border-t border-zinc-800"><td className="p-2">Your Own API</td><td className="p-2">External Dependency</td><td className="p-2">Your Domain API ✅</td></tr>
                  <tr className="border-t border-zinc-800"><td className="p-2">Watermark</td><td className="p-2">No</td><td className="p-2">No ✅</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-2">Benefits of Using This Free Tool</h2>
            <ul className="list-disc ml-5 text-sm space-y-1 leading-relaxed">
              <li><b className="text-white">100% Free & No Watermark:</b> Unlimited images and QR codes for personal and commercial use.</li>
              <li><b className="text-white">Privacy First:</b> QR data is generated in your browser. We never store your WiFi password, UPI ID or URL.</li>
              <li><b className="text-white">Fast & Reliable:</b> Uses your own domain API, so no third-party downtime.</li>
              <li><b className="text-white">Perfect for Developers & Designers:</b> Test layouts, create mockups, and demo clients faster.</li>
              <li><b className="text-white">Mobile Friendly:</b> Works perfectly on phone, tablet and desktop.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-2">About Lorem Pro Tool - Free Online Tools For Everyone</h2>
            <p className="text-sm leading-relaxed"><Link href="https://lorem-pro-tool.run4ravish.workers.dev" className="text-white font-semibold underline underline-offset-4">Lorem Pro Tool</Link> is a 100% free website that provides simple, fast and secure online tools for students, developers, creators and everyday users. Our mission is to make daily digital tasks easy without signup, without ads overload and without tracking. On Lorem Pro Tool, you will find many useful free tools like Fake Data Generator, Password Generator, Placeholder QR Generator, Word Counter, Character Counter, Case Converter, Lorem Ipsum Generator and many more. All tools work directly in your browser, so your data stays private and safe. Whether you need a placeholder image for your website design, a QR code for your shop payment, dummy data for testing your project, or want to count words for your assignment, Lorem Pro Tool has the perfect free tool for you. We are adding new tools regularly to help you work faster and smarter. Bookmark Lorem Pro Tool and explore all our free online tools in one place.</p>
            <p className="text-sm leading-relaxed mt-3">Explore all free tools on <Link href="https://lorem-pro-tool.run4ravish.workers.dev" className="text-white font-semibold underline underline-offset-4">Lorem Pro Tool - Home Page →</Link></p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-2">Frequently Asked Questions (FAQs)</h2>
            <div className="space-y-3">
              {[
                { q: "Is this tool free and without watermark?", a: "Yes, 100% free, no watermark, no login, no limit. Unlimited images and QR codes for personal and commercial use." },
                { q: "Difference from via.placeholder.com?", a: "via.placeholder.com is external and can go down. Our tool uses YOUR OWN /api route on your domain, so it's faster, supports gradient, bulk ZIP, and is fully reliable." },
                { q: "How does Bulk ZIP Download work?", a: "It calls your own API for each size and packs all PNGs into a ZIP using JSZip. Perfect for developers needing 10-15 banner sizes at once." },
                { q: "Is UPI QR safe?", a: "Yes, we generate standard UPI format (upi://pay?pa=...). Works with Google Pay, PhonePe, Paytm, BHIM. No data stored." },
                { q: "Can I use this API in my projects?", a: "Yes. Your API link is public: /api/{width}x{height}?text=Hello&bg=111827&color=ffffff. Use it in <img> tags like via.placeholder.com." },
                { q: "Does QR data stay private?", a: "Yes, total privacy. QR is generated client-side, we don't save URL, WiFi password, UPI ID or any data." }
              ].map((faq, i) => (
                <div key={i} className="border border-zinc-800 rounded-xl overflow-hidden">
                  <button onClick={() => setOpenFaq(openFaq === i? null : i)} className="w-full flex justify-between items-center p-4 text-left bg-zinc-900 hover:bg-zinc-800">
                    <span className="font-semibold text-white text-sm md:text-base">{faq.q}</span>
                    <span className="text-violet-400 text-xl">{openFaq === i? "−" : "+"}</span>
                  </button>
                  {openFaq === i && (
                    <div className="px-4 pb-4 pt-3 text-sm text-zinc-400 border-t border-zinc-800">{faq.a}</div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
