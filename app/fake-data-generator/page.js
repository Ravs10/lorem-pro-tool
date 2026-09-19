
"use client";
import { useState } from 'react';

export default function FakeDataGenerator() {
  const [count, setCount] = useState(10);
  const [type, setType] = useState('users');
  const [data, setData] = useState([]);
  const [format, setFormat] = useState('json');

  const generate = () => {
    let result = [];
    for(let i=0; i<count; i++){
      if(type === 'users'){
        result.push({ id: i+1, name: `Rahul Sharma ${i+1}`, email: `user${i+1}@test.com`, phone: `+91 9${Math.floor(100000000 + Math.random()*900000000)}`, city: ['Delhi','Mumbai','Pune','Indore'][i%4] });
      } else if(type === 'products'){
        result.push({ id: i+1, product: `Wireless Headphone ${i+1}`, price: (Math.random()*5000+500).toFixed(2), rating: (Math.random()*2+3).toFixed(1), stock: Math.floor(Math.random()*100) });
      } else {
        result.push({ id: i+1, company: `Tech Solutions ${i+1}`, gst: `22AAAAA0000A1Z${i}`, revenue: `$${(Math.random()*100).toFixed(1)}M`, employees: Math.floor(Math.random()*500+10) });
      }
    }
    setData(result);
  };

  const getOutput = () => {
    if(data.length===0) return "";
    if(format==='json') return JSON.stringify(data, null, 2);
    if(format==='csv') return Object.keys(data[0]).join(',') + '\n' + data.map(r=>Object.values(r).join(',')).join('\n');
    return data.map(r=>Object.values(r).join(' | ')).join('\n');
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl md:text-5xl font-bold mb-2">Fake Data Generator</h1>
        <p className="text-gray-400 mb-8">Generate realistic dummy data for testing - JSON, CSV supported for developers.</p>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <select value={type} onChange={e=>setType(e.target.value)} className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white">
              <option value="users">👤 Users Data</option>
              <option value="products">📦 E-commerce Products</option>
              <option value="companies">🏢 Companies / GST</option>
            </select>
            <input type="number" value={count} onChange={e=>setCount(Number(e.target.value))} min="1" max="100" className="bg-zinc-800 border border-zinc-700 rounded-lg p-3" placeholder="Count" />
            <select value={format} onChange={e=>setFormat(e.target.value)} className="bg-zinc-800 border border-zinc-700 rounded-lg p-3">
              <option value="json">JSON</option>
              <option value="csv">CSV</option>
              <option value="table">Table Text</option>
            </select>
            <button onClick={generate} className="bg-white text-black font-bold rounded-lg p-3 hover:bg-gray-200 transition">Generate Data</button>
          </div>

          {data.length > 0 && (
            <div className="flex gap-2 mb-4">
              <button onClick={()=>navigator.clipboard.writeText(getOutput())} className="bg-zinc-800 px-4 py-2 rounded-lg text-sm border border-zinc-700">📋 Copy</button>
              <button onClick={()=>{const blob=new Blob([getOutput()],{type:'text/plain'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`fake-data.${format}`; a.click();}} className="bg-zinc-800 px-4 py-2 rounded-lg text-sm border border-zinc-700">⬇️ Download</button>
              <span className="ml-auto text-sm text-gray-400">{data.length} records generated</span>
            </div>
          )}

          <pre className="bg-black border border-zinc-800 rounded-xl p-4 overflow-auto max-h-[500px] text-sm text-green-400 whitespace-pre-wrap">{getOutput() || "Click Generate to create data..."}</pre>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="font-bold text-xl mb-2">Why use this tool?</h2>
          <p className="text-gray-400 text-sm leading-relaxed">Developers, testers and students need dummy data for their projects. This free tool generates Indian names, GST style data, e-commerce products in JSON and CSV format instantly. No API key needed. SEO friendly and fast.</p>
        </div>
      </div>
    </div>
  )
}
