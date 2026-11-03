"use client";
import { useState, useMemo } from "react";

const fmt = (n: number, c: string) => {
  if (c === "INR") {
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
    if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
  }
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
};

export default function SipProMax() {
  const [currency, setCurrency] = useState<"INR" | "USD">("INR");
  const [mode, setMode] = useState<"SIP" | "LUMPSUM" | "BOTH">("BOTH");
  const [monthlySip, setMonthlySip] = useState(25000);
  const [lumpsum, setLumpsum] = useState(500000);
  const [years, setYears] = useState(15);
  const [returnRate, setReturnRate] = useState(12);
  const [stepUp, setStepUp] = useState(10);
  const [inflation, setInflation] = useState(6);
  const [expense, setExpense] = useState(1);
  const [target, setTarget] = useState(10000000);

  const data = useMemo(() => {
    const effRate = returnRate - expense;
    const monthlyRate = effRate / 12 / 100;
    let table = [];
    let total = lumpsum;
    let invested = lumpsum;
    let curSip = monthlySip;
    let totalSipInvested = 0;

    for (let y = 1; y <= years; y++) {
      let yearlySip = 0;
      for (let m = 0; m < 12; m++) {
        if (y > 1 && m === 0) curSip *= (1 + stepUp / 100);
        total = (total + curSip) * (1 + monthlyRate);
        yearlySip += curSip;
        totalSipInvested += curSip;
      }
      invested += yearlySip;
      const gain = total - invested;
      const ltcgTax = currency === "INR" ? Math.max(0, (gain - 125000) * 0.125) : gain * 0.15;
      table.push({ year: y, sipPerMonth: curSip, invested, total, gain, tax: ltcgTax, net: total - ltcgTax });
    }
    
    const final = table[table.length - 1] || { total: lumpsum, invested: lumpsum, gain: 0, tax: 0, net: lumpsum };
    const inflationAdj = final.total / Math.pow(1 + inflation / 100, years);
    // Reverse SIP for target
    const r = effRate / 12 / 100;
    const n = years * 12;
    const sipNeeded = (target * r) / ((Math.pow(1 + r, n) - 1) * (1 + r));

    return { table, final, inflationAdj, sipNeeded };
  }, [monthlySip, lumpsum, years, returnRate, stepUp, inflation, expense, currency, target]);

  const exportCSV = () => {
    let csv = "Year,Invested,Total Value,Gain,Tax,Net After Tax\n";
    data.table.forEach(row => {
      csv += `${row.year},${row.invested},${row.total},${row.gain},${row.tax},${row.net}\n`;
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "sip-schedule.csv"; a.click();
  };

  return (
    <div className="min-h-screen bg-[#07070B] text-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6">
          <p className="text-[#10B981] font-bold text-sm">LOREM PRO TOOL • HIGH CPC • NO API</p>
          <h1 className="text-3xl md:text-5xl font-black">SIP Calculator PRO MAX 2025</h1>
          <p className="text-zinc-500 text-sm mt-1">Step-up + LTCG Tax + Expense Ratio + Inflation + Goal + CSV Export</p>
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
          {/* LEFT CONTROLS */}
          <div className="lg:col-span-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-4 h-fit">
            <div className="flex gap-2">
              <button onClick={() => setCurrency("INR")} className={`flex-1 py-2 rounded-full font-bold ${currency==="INR"?"bg-white text-black":"bg-zinc-800 text-zinc-400"}`}>₹ INR</button>
              <button onClick={() => setCurrency("USD")} className={`flex-1 py-2 rounded-full font-bold ${currency==="USD"?"bg-white text-black":"bg-zinc-800 text-zinc-400"}`}>$ USD</button>
            </div>
            <div className="grid grid-cols-3 gap-1 bg-zinc-800 p-1 rounded-full">
              {["SIP","BOTH","LUMPSUM"].map(m => (
                <button key={m} onClick={()=>setMode(m as any)} className={`py-1.5 rounded-full text-xs font-bold ${mode===m?"bg-[#10B981] text-black":"text-zinc-400"}`}>{m}</button>
              ))}
            </div>

            {(mode!=="LUMPSUM") && <div><label className="text-xs text-zinc-400">Monthly SIP: {fmt(monthlySip,currency)}</label><input type="range" min={500} max={200000} step={500} value={monthlySip} onChange={e=>setMonthlySip(Number(e.target.value))} className="w-full accent-[#10B981]" /></div>}
            {(mode!=="SIP") && <div><label className="text-xs text-zinc-400">Lumpsum: {fmt(lumpsum,currency)}</label><input type="range" min={0} max={10000000} step={50000} value={lumpsum} onChange={e=>setLumpsum(Number(e.target.value))} className="w-full accent-[#10B981]" /></div>}
            
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-zinc-400">Years: {years}Y</label><input type="range" min={1} max={40} value={years} onChange={e=>setYears(Number(e.target.value))} className="w-full accent-[#10B981]" /></div>
              <div><label className="text-xs text-zinc-400">Return: {returnRate}%</label><input type="range" min={1} max={30} value={returnRate} onChange={e=>setReturnRate(Number(e.target.value))} className="w-full accent-[#10B981]" /></div>
              <div><label className="text-xs text-zinc-400">Step-up: {stepUp}%</label><input type="range" min={0} max={20} value={stepUp} onChange={e=>setStepUp(Number(e.target.value))} className="w-full accent-zinc-600" /></div>
              <div><label className="text-xs text-zinc-400">Expense: {expense}%</label><input type="range" min={0} max={3} step={0.1} value={expense} onChange={e=>setExpense(Number(e.target.value))} className="w-full accent-zinc-600" /></div>
            </div>

            <div className="bg-black rounded-xl p-3 border border-zinc-800">
              <label className="text-xs text-zinc-400">🎯 Goal: {fmt(target,currency)} ke liye SIP?</label>
              <input type="range" min={1000000} max={100000000} step={100000} value={target} onChange={e=>setTarget(Number(e.target.value))} className="w-full accent-yellow-500 mt-1" />
              <p className="text-[#10B981] font-black mt-1">{fmt(data.sipNeeded,currency)}/mo needed</p>
            </div>
          </div>

          {/* RIGHT RESULTS */}
          <div className="lg:col-span-8 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[#10B981] text-black rounded-2xl p-4"><p className="text-xs font-bold opacity-70">Future Value</p><p className="text-xl md:text-2xl font-black">{fmt(data.final.total,currency)}</p><p className="text-[11px]">After expense</p></div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4"><p className="text-xs text-zinc-400">Net After Tax</p><p className="text-xl font-bold">{fmt(data.final.net,currency)}</p><p className="text-[11px] text-red-400">Tax: {fmt(data.final.tax,currency)}</p></div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4"><p className="text-xs text-zinc-400">Today's Value</p><p className="text-xl font-bold text-yellow-400">{fmt(data.inflationAdj,currency)}</p><p className="text-[11px]">Inflation {inflation}%</p></div>
            </div>

            {/* Year Table */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold">Year-wise Schedule (Advanced)</h3>
                <button onClick={exportCSV} className="text-xs bg-white text-black px-3 py-1.5 rounded-full font-bold">Export CSV</button>
              </div>
              <div className="overflow-auto max-h-[380px]">
                <table className="w-full text-xs">
                  <thead className="text-zinc-500 sticky top-0 bg-zinc-900"><tr><th className="text-left p-2">Yr</th><th className="text-right p-2">Invested</th><th className="text-right p-2">Total</th><th className="text-right p-2">Gain</th><th className="text-right p-2">Net</th></tr></thead>
                  <tbody>{data.table.map(r=><tr key={r.year} className="border-t border-zinc-800/50"><td className="p-2">{r.year}</td><td className="p-2 text-right">{fmt(r.invested,currency)}</td><td className="p-2 text-right font-bold">{fmt(r.total,currency)}</td><td className="p-2 text-right text-[#10B981]">{fmt(r.gain,currency)}</td><td className="p-2 text-right">{fmt(r.net,currency)}</td></tr>)}</tbody>
                </table>
              </div>
            </div>

            <p className="text-[11px] text-zinc-600 text-center">No API used • 100% Client-side • High CPC Keywords: SIP Calculator, Mutual Fund Returns, LTCG Tax, FIRE Calculator, Compound Interest Calculator India</p>
          </div>
        </div>
      </div>
    </div>
  );
}
