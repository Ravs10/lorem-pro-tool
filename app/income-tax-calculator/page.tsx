"use client";
import { useState, useMemo } from "react";

export default function IncomeTaxCalculator() {
  const [salary, setSalary] = useState(1200000);
  const [deductions, setDeductions] = useState(150000);
  const [age, setAge] = useState("below60");
  const [theme, setTheme] = useState("dark");
  const isDark = theme === "dark";

  // ✅ NEW REGIME 2026-27 SLABS
  const calcNewRegime = (income: number) => {
    let tax = 0;
    const slabs: [number, number, number][] = [
      [0, 400000, 0],
      [400000, 800000, 0.05],
      [800000, 1200000, 0.10],
      [1200000, 1600000, 0.15],
      [1600000, 2000000, 0.20],
      [2000000, 2400000, 0.25],
      [2400000, Infinity, 0.30],
    ];
    for (const [low, high, rate] of slabs) {
      if (income > low) tax += (Math.min(income, high) - low) * rate;
    }
    // Rebate - 12L tak 0 tax
    if (income <= 1200000) tax = 0;
    return tax;
  };

  // ✅ OLD REGIME SLABS
  const calcOldRegime = (income: number, ded: number) => {
    const taxable = Math.max(0, income - ded - 50000);
    let tax = 0;
    if (taxable > 250000) tax += (Math.min(taxable, 500000) - 250000) * 0.05;
    if (taxable > 500000) tax += (Math.min(taxable, 1000000) - 500000) * 0.20;
    if (taxable > 1000000) tax += (taxable - 1000000) * 0.30;
    if (taxable <= 500000) tax = 0; // 87A rebate
    return tax;
  };

  const result = useMemo(() => {
    const newTax = calcNewRegime(salary);
    const oldTax = calcOldRegime(salary, deductions);
    const newWithCess = Math.round(newTax * 1.04);
    const oldWithCess = Math.round(oldTax * 1.04);
    const best = newWithCess <= oldWithCess ? "NEW" : "OLD";
    const saving = Math.abs(newWithCess - oldWithCess);
    const monthlyNew = Math.round(newWithCess / 12);
    const monthlyOld = Math.round(oldWithCess / 12);
    const inHandNew = salary - newWithCess;
    const inHandOld = salary - oldWithCess;
    return { newTax: newWithCess, oldTax: oldWithCess, best, saving, monthlyNew, monthlyOld, inHandNew, inHandOld };
  }, [salary, deductions]);

  const format = (n: number) => "₹" + n.toLocaleString("en-IN");

  return (
    <div className={`min-h-screen transition-colors ${isDark ? "bg-[#0A0A14] text-white" : "bg-[#F8F8FC] text-black"}`}>
      {/* HEADER */}
      <div className="max-w-[900px] mx-auto px-4 pt-6 flex justify-between items-center">
        <a href="/" className="flex items-center gap-2 font-black text-[18px]"><span className="w-9 h-9 bg-[#FF7A1A] rounded-lg flex items-center justify-center text-white">V</span>VELORA</a>
        <button onClick={() => setTheme(isDark ? "light" : "dark")} className={`w-9 h-9 rounded-full ${isDark ? "bg-white/10" : "bg-black/10"}`}>{isDark ? "🌙" : "☀️"}</button>
      </div>

      <div className="max-w-[900px] mx-auto px-4 py-8">
        <div className="text-center">
          <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-4 py-1.5 rounded-full text-[11px] font-black tracking-widest">💰 FY 2026-27 • NEW + OLD REGIME • FREE</span>
          <h1 className="text-[32px] md:text-[48px] font-black leading-[1.05] mt-4">Income Tax<br /><span className="text-[#FF7A1A]">Calculator 2026</span></h1>
          <p className={`mt-3 text-[14px] ${isDark ? "text-white/60" : "text-black/60"}`}>New Regime vs Old Regime - 2 second me pata karo kaunsa tumhare liye sasta hai.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-5 mt-8">
          {/* INPUT CARD */}
          <div className={`rounded-[24px] border p-6 ${isDark ? "bg-[#15151F] border-white/10" : "bg-white border-black/10 shadow-sm"}`}>
            <h2 className="font-black text-[16px]">📝 Apni Details Daalo</h2>

            <label className="block mt-6 text-[12px] font-bold text-[#FF7A1A]">Annual Salary / Income</label>
            <div className="flex items-center gap-3 mt-2">
              <input type="range" min={100000} max={5000000} step={10000} value={salary} onChange={(e) => setSalary(Number(e.target.value))} className="flex-1 accent-[#FF7A1A]" />
              <span className="font-black text-[15px] min-w-[110px] text-right">{format(salary)}</span>
            </div>
            <input type="number" value={salary} onChange={(e) => setSalary(Number(e.target.value))} className={`w-full mt-2 px-4 py-3 rounded-xl border outline-none font-bold ${isDark ? "bg-[#0A0A14] border-white/10" : "bg-[#F2F2F6] border-black/10"}`} />

            <label className="block mt-5 text-[12px] font-bold text-[#FF7A1A]">Deductions - 80C, 80D, HRA (Old Regime Ke Liye)</label>
            <div className="flex items-center gap-3 mt-2">
              <input type="range" min={0} max={500000} step={5000} value={deductions} onChange={(e) => setDeductions(Number(e.target.value))} className="flex-1 accent-emerald-500" />
              <span className="font-black text-[15px] min-w-[90px] text-right">{format(deductions)}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-3">
              {[0, 150000, 250000].map((v) => (
                <button key={v} onClick={() => setDeductions(v)} className={`py-2 rounded-lg text-[12px] font-bold border transition-all hover:scale-105 ${deductions === v ? "bg-[#FF7A1A] text-white border-[#FF7A1A]" : isDark ? "bg-white/5 border-white/10" : "bg-black/5 border-black/10"}`}>{v === 0 ? "No Deduction" : format(v)}</button>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-2 mt-4">
              {[{ id: "below60", l: "< 60 Yr" }, { id: "senior", l: "60-80 Yr" }, { id: "super", l: "80+ Yr" }].map((a) => (
                <button key={a.id} onClick={() => setAge(a.id)} className={`py-2.5 rounded-xl text-[12px] font-bold border hover:scale-105 transition-all ${age === a.id ? "bg-white text-black border-white" : isDark ? "bg-white/5 border-white/10" : "bg-black/5 border-black/10"}`}>{a.l}</button>
              ))}
            </div>
            <p className={`text-[11px] mt-4 leading-relaxed ${isDark ? "text-white/40" : "text-black/40"}`}>* New Regime me koi deduction nahi milta. Old Regime me 80C + HRA + Standard Deduction milta hai. Cess 4% included hai.</p>
          </div>

          {/* RESULT CARD */}
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-orange-500 via-[#ff6b00] to-[#ff3c00] rounded-[24px] p-6 text-white relative overflow-hidden">
              <div className="absolute -right-6 -top-6 w-28 h-28 bg-white/10 rounded-full" />
              <p className="text-[11px] font-black tracking-widest text-black/70">🏆 TUMHARE LIYE BEST HAI</p>
              <h3 className="text-[32px] font-black mt-1">{result.best} REGIME</h3>
              <p className="text-[13px] font-bold mt-1">Tum {format(result.saving)} bacha loge!</p>
              <div className="grid grid-cols-2 gap-3 mt-5">
                <div className="bg-black/25 backdrop-blur rounded-xl p-3"><p className="text-[11px] opacity-80">New Regime Tax</p><p className="font-black text-[18px]">{format(result.newTax)}</p><p className="text-[11px] opacity-80">Per Month: {format(result.monthlyNew)}</p></div>
                <div className="bg-black/25 backdrop-blur rounded-xl p-3"><p className="text-[11px] opacity-80">Old Regime Tax</p><p className="font-black text-[18px]">{format(result.oldTax)}</p><p className="text-[11px] opacity-80">Per Month: {format(result.monthlyOld)}</p></div>
              </div>
            </div>

            <div className={`rounded-[24px] border p-5 ${isDark ? "bg-[#15151F] border-white/10" : "bg-white border-black/10"}`}>
              <div className="flex justify-between text-[13px] font-bold"><span>In-Hand Salary (Best Regime)</span><span className="text-emerald-500">{format(result.best === "NEW" ? result.inHandNew : result.inHandOld)}</span></div>
              <div className="h-3 bg-black/10 rounded-full mt-3 overflow-hidden"><div className="h-full bg-gradient-to-r from-emerald-400 to-green-600 transition-all duration-700" style={{ width: `${Math.min(100, ((result.best === "NEW" ? result.inHandNew : result.inHandOld) / salary) * 100)}%` }} /></div>
              <div className="flex justify-between text-[11px] mt-2 opacity-60"><span>Tax: {result.best === "NEW" ? ((result.newTax / salary) * 100).toFixed(1) : ((result.oldTax / salary) * 100).toFixed(1)}% of Salary</span><span>Effective Rate</span></div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                <button onClick={() => navigator.clipboard.writeText(`Mera Income Tax FY 2026-27: New Regime ${format(result.newTax)}, Old Regime ${format(result.oldTax)}, Best: ${result.best} Regime. Calculated on Lorem Pro Tool`)} className="py-3 bg-[#FF7A1A] rounded-xl font-black text-white text-[13px] hover:scale-[1.03] transition">📋 Copy Result</button>
                <a href="https://wa.me/?text=Check%20My%20Income%20Tax" target="_blank" className="py-3 bg-[#25D366] rounded-xl font-black text-black text-[13px] text-center hover:scale-[1.03] transition">Share on WhatsApp</a>
              </div>
            </div>
          </div>
        </div>

        {/* SEO / FAQ */}
        <div className={`mt-8 rounded-[24px] border p-6 ${isDark ? "bg-[#15151F] border-white/10" : "bg-white border-black/10"}`}>
          <h2 className="font-black text-[18px]">Income Tax Calculator - Kaunsa Regime Best Hai?</h2>
          <p className={`text-[13px] leading-relaxed mt-2 ${isDark ? "text-white/60" : "text-black/60"}`}>Agar tumhari salary 12 Lakh tak hai to New Regime me 0 tax hai (Rebate ke baad). Agar tumhare paas 80C, HRA, Home Loan jaisi badi deductions hai (2.5 Lakh se zyada) to Old Regime sasta pad sakta hai. Is calculator se dono ka exact farak pata chal jayega. Ye tool salaried, freelancer aur business owners sabke liye hai.</p>
          <div className="grid md:grid-cols-3 gap-3 mt-4 text-[12px] font-bold">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">✅ 12L Tak - 0 Tax (New Regime)</div>
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3">✅ 4% Health & Education Cess Included</div>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">✅ Standard Deduction ₹50,000</div>
          </div>
        </div>
        <p className="text-center text-[11px] opacity-40 mt-6">Disclaimer: Ye calculator sirf estimate ke liye hai. Final tax ke liye CA se salah lein.</p>
      </div>
    </div>
  );
}
