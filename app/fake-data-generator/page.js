"use client";
import { useState } from "react";

const ALL_FIELDS = [
  { id: "name", label: "Full Name" },
  { id: "email", label: "Email" },
  { id: "mobile", label: "Mobile (+91)" },
  { id: "address", label: "Address" },
  { id: "city", label: "City" },
  { id: "pincode", label: "Pincode" },
  { id: "company", label: "Company" },
  { id: "pan", label: "PAN" },
  { id: "aadhaar", label: "Aadhaar" },
  { id: "upi", label: "UPI ID" },
];

const fake = {
  name: () => ["Rahul Sharma","Priya Verma","Aman Singh","Neha Gupta"][Math.floor(Math.random()*4)],
  email: () => `user${Math.floor(Math.random()*9000)}@gmail.com`,
  mobile: () => `+91 98${Math.floor(10000000 + Math.random()*89999999)}`,
  address: () => "MG Road, Suratgarh",
  city: () => ["Jaipur","Delhi","Mumbai","Suratgarh"][Math.floor(Math.random()*4)],
  pincode: () => "335804",
  company: () => "ToolBaba Pvt Ltd",
  pan: () => "ABCDE1234F",
  aadhaar: () => "XXXX-XXXX-1234",
  upi: () => `user${Math.floor(Math.random()*99)}@okaxis`,
};

export default function FakeDataPage() {
  const [selected, setSelected] = useState<string[]>(["name","email","mobile"]);
  const [count, setCount] = useState(1);
  const [showArticle, setShowArticle] = useState(false);
  const [records, setRecords] = useState<any[]>([]);

  const toggle = (id: string) => {
    if (selected.includes(id)) {
      if (selected.length > 1) setSelected(selected.filter(f => f!== id));
    } else {
      if (selected.length < 10) setSelected([...selected, id]);
    }
  };

  const generate = () => {
    const newRecs = Array.from({ length: count }).map(() => {
      let obj: any = {};
      selected.forEach(f => { obj[f] = (fake as any)[f](); });
      return obj;
    });
    setRecords(newRecs);
  };

  return (
    <div className="max-w-4xl mx-auto p-3 md:p-6">
      <h1 className="text-2xl md:text-3xl font-bold">Fake Data Generator - Pro</h1>
      <p className="text-sm text-gray-600 mt-1">1 se 10 field tak select karo, mobile friendly</p>

      <div className="mt-4 p-4 border rounded-2xl bg-white shadow-sm">
        <h3 className="font-semibold text-sm">1. Fields Select Karo ({selected.length}/10)</h3>
        <div className="grid grid-cols-2 gap-2 mt-3">
          {ALL_FIELDS.map(f => (
            <button key={f.id} onClick={()=>toggle(f.id)}
              className={`p-3 text-xs md:text-sm border rounded-xl text-left font-medium ${selected.includes(f.id)? 'bg-black text-white border-black' : 'bg-gray-50'}`}>
              {selected.includes(f.id)? '✓ ' : '+ '}{f.label}
            </button>
          ))}
        </div>

        <h3 className="font-semibold text-sm mt-6">2. Kitne Records? - {count}</h3>
        <input type="range" min={1} max={50} value={count} onChange={e=>setCount(parseInt(e.target.value))} className="w-full mt-2" />

        <button onClick={generate} className="mt-5 w-full bg-black text-white py-3 rounded-xl font-bold">Generate {count} Record</button>
      </div>

      {records.length > 0 && (
        <div className="mt-5">
          <div className="space-y-3">
            {records.map((r, i) => (
              <div key={i} className="bg-white border rounded-xl p-3 text-xs">
                {Object.entries(r).map(([k, v]) => (
                  <div key={k} className="flex justify-between py-1 border-b last:border-0">
                    <span className="font-bold uppercase text-gray-500">{k}</span>
                    <span className="font-medium">{String(v)}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <pre className="mt-3 bg-gray-900 text-green-400 p-3 rounded-xl text-[10px] overflow-auto">{JSON.stringify(records, null, 2)}</pre>
        </div>
      )}

      {/* Article Section - Root Style + Hide Show */}
      <div className="mt-8">
        <button onClick={()=>setShowArticle(!showArticle)} className="w-full flex justify-between items-center bg-white border p-4 rounded-2xl shadow-sm">
          <span className="font-bold">📝 Articles & Guide</span>
          <span className="text-xs bg-black text-white px-3 py-1 rounded-full">{showArticle? 'Hide ▲' : 'Show ▼'}</span>
        </button>

        {showArticle && (
          <div className="mt-4 space-y-4">
            <div className="bg-white border rounded-2xl p-5 shadow-sm">
              <h2 className="text-xl font-bold">What is Fake Data Generator?</h2>
              <p className="mt-2 text-sm text-gray-600 leading-6">Free tool for developers to generate Indian fake data. Useful for testing forms, database seeding, and UI design without using real data.</p>
              <ul className="list-disc ml-5 mt-3 text-sm text-gray-600 space-y-1">
                <li>No signup, 100% free</li>
                <li>Indian data: +91, Pincode, PAN, UPI</li>
                <li>Select 1 to 10 fields</li>
              </ul>
            </div>
            <div className="bg-white border rounded-2xl p-5 shadow-sm">
              <h2 className="text-xl font-bold">How to Use 1 to 10 Fields?</h2>
              <p className="mt-2 text-sm text-gray-600 leading-6">Just tick the fields you need. If you want only 2 fields, select only 2. Our system will generate only selected fields. Perfect for custom testing.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
