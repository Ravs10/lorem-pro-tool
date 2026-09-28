// @ts-nocheck
'use client';
import { useState, useRef, useEffect, useMemo } from 'react';

export default function ImageQRGenerator() {
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [bg, setBg] = useState("#111827");
  const [color, setColor] = useState("#ffffff");
  const [text, setText] = useState("Lorem Pro Tool");
  const canvasRef = useRef(null);

  // QR TYPES
  const [qrType, setQrType] = useState("url");
  const [urlVal, setUrlVal] = useState("https://loremprotool.com");
  const [textVal, setTextVal] = useState("Hello World");
  const [wifiSSID, setWifiSSID] = useState("My WiFi");
  const [wifiPass, setWifiPass] = useState("12345678");
  const [wifiType, setWifiType] = useState("WPA");
  const [emailTo, setEmailTo] = useState("test@gmail.com");
  const [phoneVal, setPhoneVal] = useState("+919999999999");
  const [waNum, setWaNum] = useState("919999999999");
  const [waMsg, setWaMsg] = useState("Hi");
  const [upiId, setUpiId] = useState("merchant@upi");
  const [upiName, setUpiName] = useState("Lorem Store");
  const [upiAmt, setUpiAmt] = useState("100");

  const qrData = useMemo(() => {
    switch(qrType){
      case "url": return urlVal;
      case "text": return textVal;
      case "wifi": return `WIFI:T:${wifiType};S:${wifiSSID};P:${wifiPass};;`;
      case "email": return `mailto:${emailTo}?subject=Hello&body=Contact from QR`;
      case "phone": return `tel:${phoneVal}`;
      case "whatsapp": return `https://wa.me/${waNum}?text=${encodeURIComponent(waMsg)}`;
      case "upi": return `upi://pay?pa=${upiId}&pn=${encodeURIComponent(upiName)}&am=${upiAmt}&cu=INR`;
      default: return urlVal;
    }
  }, [qrType, urlVal, textVal, wifiSSID, wifiPass, wifiType, emailTo, phoneVal, waNum, waMsg, upiId, upiName, upiAmt]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if(!canvas) return;
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

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(qrData)}&bgcolor=${bg.replace('#','')}&color=${color.replace('#','')}`;

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
      ctx.fillStyle = "#000000"; ctx.font = "bold 16px sans-serif";
      ctx.textAlign = "center";
      const display = qrData.length > 35? qrData.substring(0,35)+"..." : qrData;
      ctx.fillText(display, c.width/2, 470);
      ctx.font = "12px sans-serif"; ctx.fillStyle = "#666";
      ctx.fillText(`Type: ${qrType.toUpperCase()}`, c.width/2, 495);
      const link = document.createElement('a');
      link.download = `qr-${qrType}-with-text.png`;
      link.href = c.toDataURL(); link.click();
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-4xl font-bold text-center mt-4">Image Placeholder + QR Pro</h1>
        <p className="text-gray-400 text-center mt-2 mb-8">Placeholder + 7 Type QR Generator</p>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
            <h2 className="font-bold">⚙️ Image Settings</h2>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-gray-400">Width</label><input type="number" value={width} onChange={e=>setWidth(Number(e.target.value))} className="w-full bg-black border border-zinc-700 rounded-lg p-2 mt-1"/></div>
              <div><label className="text-xs text-gray-400">Height</label><input type="number" value={height} onChange={e=>setHeight(Number(e.target.value))} className="w-full bg-black border border-zinc-700 rounded-lg p-2 mt-1"/></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-gray-400">BG</label><input type="color" value={bg} onChange={e=>setBg(e.target.value)} className="w-full h-10 bg-black rounded-lg"/></div>
              <div><label className="text-xs text-gray-400">Text Color</label><input type="color" value={color} onChange={e=>setColor(e.target.value)} className="w-full h-10 bg-black rounded-lg"/></div>
            </div>
            <div><label className="text-xs text-gray-400">Image Text</label><textarea value={text} onChange={e=>setText(e.target.value)} rows={2} className="w-full bg-black border border-zinc-700 rounded-lg p-2 mt-1"/></div>

            <hr className="border-zinc-800"/>
            <h2 className="font-bold">📱 QR Type</h2>
            <select value={qrType} onChange={e=>setQrType(e.target.value)} className="w-full bg-black border border-zinc-700 rounded-lg p-2.5">
              <option value="url">🌐 Website URL</option>
              <option value="text">📝 Plain Text</option>
              <option value="wifi">📶 WiFi Login</option>
              <option value="email">📧 Email</option>
              <option value="phone">📞 Phone Call</option>
              <option value="whatsapp">💬 WhatsApp</option>
              <option value="upi">💸 UPI Payment</option>
            </select>

            {qrType==="url" && <input value={urlVal} onChange={e=>setUrlVal(e.target.value)} placeholder="https://..." className="w-full bg-black border border-zinc-700 rounded-lg p-2"/>}
            {qrType==="text" && <textarea value={textVal} onChange={e=>setTextVal(e.target.value)} className="w-full bg-black border border-zinc-700 rounded-lg p-2" rows={2}/>}
            {qrType==="wifi" && <div className="space-y-2"><input value={wifiSSID} onChange={e=>setWifiSSID(e.target.value)} placeholder="WiFi Name" className="w-full bg-black border border-zinc-700 rounded-lg p-2"/><input value={wifiPass} onChange={e=>setWifiPass(e.target.value)} placeholder="Password" className="w-full bg-black border border-zinc-700 rounded-lg p-2"/><select value={wifiType} onChange={e=>setWifiType(e.target.value)} className="w-full bg-black border border-zinc-700 rounded-lg p-2"><option>WPA</option><option>WEP</option><option>nopass</option></select></div>}
            {qrType==="email" && <input value={emailTo} onChange={e=>setEmailTo(e.target.value)} placeholder="email@gmail.com" className="w-full bg-black border border-zinc-700 rounded-lg p-2"/>}
            {qrType==="phone" && <input value={phoneVal} onChange={e=>setPhoneVal(e.target.value)} placeholder="+91..." className="w-full bg-black border border-zinc-700 rounded-lg p-2"/>}
            {qrType==="whatsapp" && <div className="space-y-2"><input value={waNum} onChange={e=>setWaNum(e.target.value)} placeholder="9199999999" className="w-full bg-black border border-zinc-700 rounded-lg p-2"/><input value={waMsg} onChange={e=>setWaMsg(e.target.value)} placeholder="Message" className="w-full bg-black border border-zinc-700 rounded-lg p-2"/></div>}
            {qrType==="upi" && <div className="space-y-2"><input value={upiId} onChange={e=>setUpiId(e.target.value)} placeholder="UPI ID" className="w-full bg-black border border-zinc-700 rounded-lg p-2"/><input value={upiName} onChange={e=>setUpiName(e.target.value)} placeholder="Name" className="w-full bg-black border border-zinc-700 rounded-lg p-2"/><input value={upiAmt} onChange={e=>setUpiAmt(e.target.value)} placeholder="Amount" className="w-full bg-black border border-zinc-700 rounded-lg p-2"/></div>}

            <div className="text-xs text-gray-500 bg-black p-2 rounded border border-zinc-800 break-all">Final QR Data: {qrData}</div>
          </div>

          <div className="space-y-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              <canvas ref={canvasRef} className="w-full rounded-xl bg-black"/>
              <button onClick={downloadImage} className="w-full mt-3 py-2.5 bg-white text-black rounded-full font-bold">Download Image PNG</button>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center">
              <img src={qrUrl} alt="QR Code" className="w-[220px] h-[220px] mx-auto rounded-xl bg-white p-2"/>
              <p className="text-xs text-gray-400 mt-2">Type: {qrType.toUpperCase()}</p>
              <div className="grid grid-cols-2 gap-2 mt-4">
                <a href={qrUrl} download target="_blank" className="py-2.5 bg-zinc-800 text-white rounded-full font-bold text-sm text-center border border-zinc-700">QR Only</a>
                <button onClick={downloadQRWithText} className="py-2.5 bg-orange-500 text-black rounded-full font-bold text-sm">QR + Text</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
