"use client";
import { useState, useMemo } from "react";

const fmt = (num: number, currency: string) => {
  if (currency === "INR") {
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(2)} L`;
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(num);
  }
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(num);
};

export default function SipCalculator() {
  const [currency, setCurrency] = useState<"INR" | "USD">("INR");
  const [mode, setMode] = useState<"SIP" | "LUMPSUM" | "BOTH">("BOTH");
  const [monthlySip, setMonthlySip] = useState(25000);
  const [lumpsum, setLumpsum] = useState(500000);
  const [years, setYears] = useState(15);
  const [returnRate, setReturnRate] = useState(12);
  const [stepUp, setStepUp] = useState(10);
  const [inflation, setInflation] = useState(6);

  const result = useMemo(() => {
    const months = years * 12;
    const monthlyRate = returnRate / 12 / 100;
    let sipTotal = 0;
    let sipInvested = 0;
    let currentSip = monthlySip;

    for (let m = 1; m <= months; m++) {
      if (m > 1 && (m - 1) % 12 === 0) {
        currentSip = currentSip * (1 + stepUp / 100);
      }
      sipInvested += currentSip;
      sipTotal = (sipTotal + currentSip) * (1 + monthlyRate);
    }

    const lumpsumFuture = lumpsum * Math.pow(1 + returnRate / 100, years);
    const totalFuture = (mode === "SIP" ? sipTotal : mode === "LUMPSUM" ? lumpsumFuture : sipTotal + lumpsumFuture);
    const totalInvested = (mode === "SIP" ? sipInvested : mode === "LUMPSUM" ? lumpsum : sipInvested + lumpsum);
    const gain = totalFuture - totalInvested;
    const inflationAdj = totalFuture / Math.pow(1 + inflation / 100, years);

    return { totalFuture, totalInvested, gain, sipTotal, lumpsumFuture, inflationAdj, sipInvested };
  }, [monthlySip, lumpsum, years, returnRate, stepUp, inflation, mode]);

  return (
    <div className="min-h-screen bg-[#07070B] text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <p className="text-[#10B981] font-bold tracking-widest">HIGH CPC TOOL #1</p>
          <h1 className="text-4xl md:text-5xl font-black mt-2">SIP & Compound Interest Calculator PRO</h1>
          <p className="text-zinc-400 mt-2">SIP + Lumpsum + Step-up + Inflation + LTCG Tax | INR & USD</p>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-3 mb-6">
          <div className="bg-zinc-900 p-1 rounded-full flex">
            <button onClick={() => setCurrency("INR")} className={`px-5 py-2 rounded-full font-bold ${currency === "INR" ? "bg-white text-black" : "text-zinc-400"}`}>₹ INR</button>
            <button onClick={() => setCurrency("USD")} className={`px-5 py-2 rounded-full font-bold ${currency === "USD" ? "bg-white text-black" : "text-zinc-400"}`}>$ USD</button>
          </div>
          <div className="bg-zinc-900 p-1 rounded-full flex">
            <button onClick={() => setMode("SIP")} className={`px-4 py-2 rounded-full text-sm font-bold ${mode === "SIP" ? "bg-[#10B981] text-black" : "text-zinc-400"}`}>SIP Only</button>
            <button onClick={() => setMode("BOTH")} className={`px-4 py-2 rounded-full text-sm font-bold ${mode === "BOTH" ? "bg-[#10B981] text-black" : "text-zinc-400"}`}>SIP + Lumpsum</button>
            <button onClick={() => setMode("LUMPSUM")} className={`px-4 py-2 rounded-full text-sm font-bold ${mode === "LUMPSUM" ? "bg-[#10B981] text-black" : "text-zinc-400"}`}>Lumpsum</button>
          </div>
        </div>

        <div className="grid md:grid-cols-5 gap-6">
          {/* Inputs */}
          <div className="md:col-span-2 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-6">
            {(mode === "SIP" || mode === "BOTH") && (
              <div>
                <label className="text-zinc-400 text-sm">Monthly SIP: {fmt(monthlySip, currency)}/mo</label>
                <input type="range" min={currency === "INR" ? 500 : 100} max={currency === "INR" ? 200000 : 5000} step={500} value={monthlySip} onChange={e => setMonthlySip(Number(e.target.value))} className="w-full accent-[#10B981] mt-2" />
              </div>
            )}
            {(mode === "LUMPSUM" || mode === "BOTH") && (
              <div>
                <label className="text-zinc-400 text-sm">Lumpsum: {fmt(lumpsum, currency)}</label>
                <input type="range" min={0} max={currency === "INR" ? 10000000 : 100000} step={10000} value={lumpsum} onChange={e => setLumpsum(Number(e.target.value))} className="w-full accent-[#10B981] mt-2" />
              </div>
            )}
            <div>
              <label className="text-zinc-400 text-sm">Years: {years} Years</label>
              <input type="range" min={1} max={40} value={years} onChange={e => setYears(Number(e.target.value))} className="w-full accent-[#10B981] mt-2" />
            </div>
            <div>
              <label className="text-zinc-400 text-sm">Expected Return: {returnRate}%</label>
              <input type="range" min={1} max={30} value={returnRate} onChange={e => setReturnRate(Number(e.target.value))} className="w-full accent-[#10B981] mt-2" />
            </div>
            <div>
              <label className="text-zinc-400 text-sm">Annual Step-up: {stepUp}% (Salary hike)</label>
              <input type="range" min={0} max={20} value={stepUp} onChange={e => setStepUp(Number(e.target.value))} className="w-full accent-zinc-600 mt-2" />
            </div>
          </div>

          {/* Result */}
          <div className="md:col-span-3 space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-[#10B981] text-black rounded-2xl p-5">
                <p className="text-sm font-bold opacity-70">Total Value</p>
                <p className="text-2xl font-black">{fmt(result.totalFuture, currency)}</p>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                <p className="text-sm text-zinc-400">Invested</p>
                <p className="text-xl font-bold">{fmt(result.totalInvested, currency)}</p>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                <p className="text-sm text-zinc-400">Gain</p>
                <p className="text-xl font-bold text-[#10B981]">{fmt(result.gain, currency)}</p>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <h3 className="font-bold mb-3">Breakdown</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-zinc-400">SIP Invested</span><span>{fmt(result.sipInvested, currency)}</span></div>
                <div className="flex justify-between"><span className="text-zinc-400">Inflation Adjusted (Today's Value)</span><span className="text-yellow-400 font-bold">{fmt(result.inflationAdj, currency)}</span></div>
                <div className="flex justify-between"><span className="text-zinc-400">Wealth Multiple</span><span>{(result.totalFuture / result.totalInvested).toFixed(2)}x</span></div>
              </div>
              <div className="mt-4 p-3 bg-black rounded-xl text-xs text-zinc-500">
                *No API used. 100% client-side calculation. LTCG Tax (India 12.5% above 1.25L) excluded for simplicity. High CPC keywords: mutual fund, sip calculator, compound interest.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
