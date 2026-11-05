"use client";
import { useState, useMemo } from "react";

export default function IncomeTaxCalculatorPro() {
  const [theme, setTheme] = useState("dark");
  const isDark = theme === "dark";

  // ===== INPUTS =====
  const [salary, setSalary] = useState(1200000);
  const [basic, setBasic] = useState(600000);
  const [hraReceived, setHraReceived] = useState(240000);
  const [rentPaid, setRentPaid] = useState(180000);
  const [isMetro, setIsMetro] = useState(true);

  const [ppf, setPpf] = useState(50000);
  const [elss, setElss] = useState(50000);
  const [lic, setLic] = useState(25000);
  const [epf, setEpf] = useState(25000);
  const [homeLoanInterest, setHomeLoanInterest] = useState(0);

  const [healthSelf, setHealthSelf] = useState(25000);
  const [healthParents, setHealthParents] = useState(25000);
  const [isParentSenior, setIsParentSenior] = useState(false);

  const [stcg, setStcg] = useState(0);
  const [ltcgEquity, setLtcgEquity] = useState(0);
  const [cryptoGain, setCryptoGain] = useState(0);
  const [otherIncome, setOtherIncome] = useState(0);

  const [showBreakup, setShowBreakup] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // ===== CALCULATION =====
  const result = useMemo(() => {
    // --- HRA Exemption ---
    const hra1 = hraReceived;
    const hra2 = isMetro ? basic * 0.5 : basic * 0.4;
    const hra3 = Math.max(0, rentPaid - basic * 0.1);
    const hraExempt = Math.min(hra1, hra2, hra3);

    // --- 80C (Max 1.5L) ---
    const total80C = Math.min(150000, ppf + elss + lic + epf);
    // --- 80D ---
    const limitSelf = 25000;
    const limitParents = isParentSenior ? 50000 : 25000;
    const total80D = Math.min(limitSelf, healthSelf) + Math.min(limitParents, healthParents);
    // --- 24(b) Home Loan ---
    const total24b = Math.min(200000, homeLoanInterest);

    const totalDeductions = total80C + total80D + total24b;

    // --- Taxable Salary ---
    const grossSalary = salary + otherIncome;
    const taxableOld = Math.max(0, grossSalary - 50000 - hraExempt - totalDeductions);
    const taxableNew = Math.max(0, grossSalary - 75000); // New regime std deduction 75k

    // --- New Regime Tax ---
    const calcSlabNew = (inc: number) => {
      let t = 0;
      const slabs: [number, number, number][] = [
        [0, 400000, 0], [400000, 800000, 0.05], [800000, 1200000, 0.10],
        [1200000, 1600000, 0.15], [1600000, 2000000, 0.20],
        [2000000, 2400000, 0.25], [2400000, Infinity, 0.30],
      ];
      for (const [l, h, r] of slabs) if (inc > l) t += (Math.min(inc, h) - l) * r;
      if (inc <= 1200000) t = 0; // Rebate 87A
      // Marginal Relief - 12L se thoda upar
      if (inc > 1200000 && inc < 1300000) {
        const taxWithoutRelief = t;
        const maxPayable = inc - 1200000;
        if (taxWithoutRelief > maxPayable) t = maxPayable;
      }
      return t;
    };

    // --- Old Regime Tax ---
    const calcSlabOld = (inc: number) => {
      let t = 0;
      if (inc > 250000) t += (Math.min(inc, 500000) - 250000) * 0.05;
      if (inc > 500000) t += (Math.min(inc, 1000000) - 500000) * 0.20;
      if (inc > 1000000) t += (inc - 1000000) * 0.30;
      if (inc <= 500000) t = 0;
      return t;
    };

    let newSlabTax = calcSlabNew(taxableNew);
    let oldSlabTax = calcSlabOld(taxableOld);

    // --- Capital Gains Tax ---
    const stcgTax = stcg * 0.20;
    const ltcgTaxable = Math.max(0, ltcgEquity - 125000); // 1.25L exempt
    const ltcgTax = ltcgTaxable * 0.125;
    const cryptoTax = cryptoGain * 0.30;
    const cgTax = stcgTax + ltcgTax + cryptoTax;

    // --- Total Before Surcharge ---
    let newTotal = newSlabTax + cgTax;
    let oldTotal = oldSlabTax + cgTax;

    // --- Surcharge ---
    const getSurcharge = (totalInc: number, tax: number) => {
      let rate = 0;
      if (totalInc > 5000000 && totalInc <= 10000000) rate = 0.10;
      else if (totalInc > 10000000 && totalInc <= 20000000) rate = 0.15;
      else if (totalInc > 20000000 && totalInc <= 50000000) rate = 0.25;
      else if (totalInc > 50000000) rate = 0.37; // Old, New me max 25%
      return tax * rate;
    };
    const newSurcharge = getSurcharge(taxableNew, newTotal) * (taxableNew > 20000000 ? 0.68 : 1); // New me cap
    const oldSurcharge = getSurcharge(taxableOld, oldTotal);

    const newTax = Math.round((newTotal + newSurcharge) * 1.04);
    const oldTax = Math.round((oldTotal + oldSurcharge) * 1.04);

    const best = newTax <= oldTax ? "NEW" : "OLD";
    const saving = Math.abs(newTax - oldTax);
    const bestTax = best === "NEW" ? newTax : oldTax;
    const inHand = grossSalary - bestTax;
    const monthlyTDS = Math.round(bestTax / 12);

    return {
      hraExempt, total80C, total80D, total24b, totalDeductions,
      taxableOld, taxableNew, newTax, oldTax, best, saving, bestTax, inHand, monthlyTDS,
      stcgTax, ltcgTax, cryptoTax, cgTax, newSlabTax, oldSlabTax, newSurcharge, oldSurcharge, grossSalary
    };
  }, [salary, basic, hraReceived, rentPaid, isMetro, ppf, elss, lic, epf, homeLoanInterest, healthSelf, healthParents, isParentSenior, stcg, ltcgEquity, cryptoGain, otherIncome]);

  const format = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");
  const maxTax = Math.max(result.newTax, result.oldTax, 1);
  const monthlyData = Array.from({ length: 12 }, (_, i) => ({ month: ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"][i], tds: result.monthlyTDS }));

  const Input = ({ label, value, onChange, max = 5000000 }: any) => (
    <div>
      <label className="block text-[12px] font-bold text-[#FF7A1A] mt-4">{label}</label>
      <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} className={`w-full mt-1.5 px-4 py-2.5 rounded-xl border outline-none font-bold text-[14px] ${isDark ? "bg-[#0A0A14] border-white/10" : "bg-[#F2F2F6] border-black/10"}`} />
    </div>
  );

  return (
    <div className={`min-h-screen transition-colors ${isDark ? "bg-[#0A0A14] text-white" : "bg-[#F8F8FC] text-black"}`}>
      <div className="max-w-[1000px] mx-auto px-4 pt-6 flex justify-between items-center print:hidden">
        <a href="/" className="flex items-center gap-2 font-black text-[18px]"><span className="w-9 h-9 bg-[#FF7A1A] rounded-lg flex items-center justify-center text-white">V</span>VELORA</a>
        <div className="flex gap-2">
          <button onClick={() => window.print()} className="bg-white text-black px-4 py-2 rounded-full text-[12px] font-black hover:scale-105 transition">📄 PDF Download</button>
          <button onClick={() => setTheme(isDark ? "light" : "dark")} className={`w-9 h-9 rounded-full ${isDark ? "bg-white/10" : "bg-black/10"}`}>{isDark ? "🌙" : "☀️"}</button>
        </div>
      </div>

      <div className="max-w-[1000px] mx-auto px-4 py-6">
        <div className="text-center">
          <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-4 py-1.5 rounded-full text-[11px] font-black tracking-widest">🏆 PRO • FY 2026-27 • CA LEVEL CALCULATION</span>
          <h1 className="text-[30px] md:text-[46px] font-black leading-[1.05] mt-4">Income Tax <span className="text-[#FF7A1A]">Calculator Pro</span></h1>
          <p className={`mt-2 text-[13px] md:text-[14px] ${isDark ? "text-white/60" : "text-black/60"}`}>HRA + 80C + 80D + Capital Gains + Surcharge - Sab kuch ek jagah. New vs Old ka asli farak dekho.</p>
        </div>

        {/* RESULT TOP */}
        <div className="grid md:grid-cols-3 gap-4 mt-7">
          <div className="bg-gradient-to-br from-orange-500 via-[#ff6b00] to-[#ff3c00] rounded-[22px] p-5 text-white md:col-span-1 relative overflow-hidden">
            <p className="text-[11px] font-black tracking-widest text-black/70">🏆 BEST REGIME</p>
            <h3 className="text-[28px] font-black mt-1">{result.best} REGIME</h3>
            <p className="text-[13px] font-bold">Tum {format(result.saving)} bachaoge</p>
            <div className="bg-black/25 rounded-xl p-3 mt-4 text-[13px] space-y-1"><p className="flex justify-between"><span>Total Tax</span><b>{format(result.bestTax)}</b></p><p className="flex justify-between"><span>In-Hand</span><b>{format(result.inHand)}</b></p><p className="flex justify-between"><span>Monthly TDS</span><b>{format(result.monthlyTDS)}</b></p></div>
          </div>
          <div className={`rounded-[22px] border p-5 md:col-span-2 ${isDark ? "bg-[#15151F] border-white/10" : "bg-white border-black/10"}`}>
            <p className="font-black text-[14px]">📊 New vs Old Comparison</p>
            <div className="mt-4 space-y-4">
              <div><div className="flex justify-between text-[12px] font-bold"><span className="text-emerald-400">● New Regime</span><span>{format(result.newTax)}</span></div><div className="h-3 bg-black/10 rounded-full mt-1 overflow-hidden"><div className="h-full bg-gradient-to-r from-emerald-400 to-green-600 transition-all duration-700" style={{ width: `${(result.newTax / maxTax) * 100}%` }} /></div></div>
              <div><div className="flex justify-between text-[12px] font-bold"><span className="text-[#FF7A1A]">● Old Regime</span><span>{format(result.oldTax)}</span></div><div className="h-3 bg-black/10 rounded-full mt-1 overflow-hidden"><div className="h-full bg-gradient-to-r from-orange-400 to-red-500 transition-all duration-700" style={{ width: `${(result.oldTax / maxTax) * 100}%` }} /></div></div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <button onClick={() => setShowBreakup(!showBreakup)} className="py-2.5 bg-[#FF7A1A] rounded-xl font-black text-white text-[12px] hover:scale-[1.02] transition">{showBreakup ? "Hide Breakup ▲" : "Full Breakup Dekho ▼"}</button>
              <button onClick={() => navigator.clipboard.writeText(`Mera Tax FY 2026-27: New ${format(result.newTax)}, Old ${format(result.oldTax)}, Best ${result.best}, Saving ${format(result.saving)} - Lorem Pro Tool`)} className={`py-2.5 rounded-xl font-black text-[12px] border hover:scale-[1.02] transition ${isDark ? "bg-white/10 border-white/10" : "bg-black/5 border-black/10"}`}>📋 Copy Result</button>
            </div>
          </div>
        </div>

        {showBreakup && (
          <div className={`mt-4 rounded-[22px] border p-5 text-[13px] ${isDark ? "bg-[#15151F] border-white/10" : "bg-white border-black/10"}`}>
            <h3 className="font-black">🧾 Full Tax Breakup</h3>
            <div className="grid md:grid-cols-2 gap-4 mt-3">
              <div className="space-y-2"><p className="flex justify-between"><span>Gross Salary + Other</span><b>{format(result.grossSalary)}</b></p><p className="flex justify-between text-emerald-500"><span>HRA Exempt</span><b>- {format(result.hraExempt)}</b></p><p className="flex justify-between text-emerald-500"><span>80C Deduction</span><b>- {format(result.total80C)}</b></p><p className="flex justify-between text-emerald-500"><span>80D Health</span><b>- {format(result.total80D)}</b></p><p className="flex justify-between text-emerald-500"><span>Home Loan 24(b)</span><b>- {format(result.total24b)}</b></p><p className="flex justify-between font-black border-t pt-2"><span>Taxable (Old)</span><b>{format(result.taxableOld)}</b></p><p className="flex justify-between font-black"><span>Taxable (New)</span><b>{format(result.taxableNew)}</b></p></div>
              <div className="space-y-2"><p className="flex justify-between"><span>Slab Tax (New)</span><b>{format(result.newSlabTax)}</b></p><p className="flex justify-between"><span>Slab Tax (Old)</span><b>{format(result.oldSlabTax)}</b></p><p className="flex justify-between"><span>Capital Gains Tax</span><b>{format(result.cgTax)}</b></p><p className="text-[11px] opacity-60">STCG {format(result.stcgTax)} + LTCG {format(result.ltcgTax)} + Crypto {format(result.cryptoTax)}</p><p className="flex justify-between"><span>Surcharge (New)</span><b>{format(result.newSurcharge)}</b></p><p className="flex justify-between"><span>Surcharge (Old)</span><b>{format(result.oldSurcharge)}</b></p><p className="flex justify-between font-black border-t pt-2 text-[#FF7A1A]"><span>Final Tax (4% Cess incl.)</span><b>{format(result.bestTax)}</b></p></div>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-5 mt-5">
          {/* LEFT INPUTS */}
          <div className={`rounded-[22px] border p-5 ${isDark ? "bg-[#15151F] border-white/10" : "bg-white border-black/10"}`}>
            <h2 className="font-black">💼 Salary & HRA</h2>
            <Input label="Annual Salary (₹)" value={salary} onChange={setSalary} />
            <Input label="Other Income - FD Interest, Rent (₹)" value={otherIncome} onChange={setOtherIncome} />
            <Input label="Basic Salary (₹)" value={basic} onChange={setBasic} />
            <Input label="HRA Received (₹)" value={hraReceived} onChange={setHraReceived} />
            <Input label="Rent Paid Yearly (₹)" value={rentPaid} onChange={setRentPaid} />
            <div className="flex gap-2 mt-4">
              <button onClick={() => setIsMetro(true)} className={`flex-1 py-2.5 rounded-xl text-[12px] font-bold border hover:scale-105 transition ${isMetro ? "bg-[#FF7A1A] text-white" : isDark ? "bg-white/5" : "bg-black/5"}`}>🏙️ Metro City (50%)</button>
              <button onClick={() => setIsMetro(false)} className={`flex-1 py-2.5 rounded-xl text-[12px] font-bold border hover:scale-105 transition ${!isMetro ? "bg-[#FF7A1A] text-white" : isDark ? "bg-white/5" : "bg-black/5"}`}>🏘️ Non-Metro (40%)</button>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 mt-4 text-[12px] font-bold">✅ HRA Exempt: <span className="text-emerald-500">{format(result.hraExempt)}</span> <span className="opacity-60 font-normal">- 3 rules me se sabse kam wala</span></div>

            <h2 className="font-black mt-6">🏥 Deductions - 80C / 80D / Home Loan</h2>
            <div className="grid grid-cols-2 gap-x-4">
              <Input label="PPF (₹)" value={ppf} onChange={setPpf} />
              <Input label="ELSS Mutual Fund (₹)" value={elss} onChange={setElss} />
              <Input label="LIC Premium (₹)" value={lic} onChange={setLic} />
              <Input label="EPF (₹)" value={epf} onChange={setEpf} />
            </div>
            <p className="text-[11px] mt-2 opacity-60">80C Total: {format(result.total80C)} / Max ₹1,50,000</p>
            <Input label="Health Insurance - Self (₹)" value={healthSelf} onChange={setHealthSelf} />
            <Input label="Health Insurance - Parents (₹)" value={healthParents} onChange={setHealthParents} />
            <button onClick={() => setIsParentSenior(!isParentSenior)} className={`w-full mt-3 py-2.5 rounded-xl text-[12px] font-bold border hover:scale-[1.02] transition ${isParentSenior ? "bg-emerald-500 text-white" : isDark ? "bg-white/5" : "bg-black/5"}`}>{isParentSenior ? "✅ Parents Senior Citizen (60+) - Limit ₹50,000" : "Parents Senior Citizen hai? Click karo - Limit ₹50,000"}</button>
            <Input label="Home Loan Interest 24(b) (₹)" value={homeLoanInterest} onChange={setHomeLoanInterest} />
            <p className="text-[11px] mt-2 opacity-60">Total Deductions: <b className="text-emerald-500">{format(result.totalDeductions)}</b></p>
          </div>

          {/* RIGHT - CAPITAL GAINS + TDS */}
          <div className="space-y-5">
            <div className={`rounded-[22px] border p-5 ${isDark ? "bg-[#15151F] border-white/10" : "bg-white border-black/10"}`}>
              <div className="flex justify-between items-center"><h2 className="font-black">📈 Capital Gains</h2><button onClick={() => setShowAdvanced(!showAdvanced)} className="text-[12px] font-black text-[#FF7A1A]">{showAdvanced ? "Hide ▲" : "Show ▼"}</button></div>
              {showAdvanced && (
                <div>
                  <Input label="STCG - Stocks (Short Term) Profit (₹)" value={stcg} onChange={setStcg} />
                  <p className="text-[11px] opacity-60 mt-1">Tax: 20% = {format(result.stcgTax)}</p>
                  <Input label="LTCG - Equity Profit (₹)" value={ltcgEquity} onChange={setLtcgEquity} />
                  <p className="text-[11px] opacity-60 mt-1">1.25L Exempt, Baaki pe 12.5% = {format(result.ltcgTax)}</p>
                  <Input label="Crypto Profit (₹)" value={cryptoGain} onChange={setCryptoGain} />
                  <p className="text-[11px] opacity-60 mt-1">Flat 30% + 1% TDS = {format(result.cryptoTax)}</p>
                </div>
              )}
              {!showAdvanced && <p className="text-[12px] opacity-60 mt-2">Stock, Crypto ka profit hai? Show pe click karo.</p>}
            </div>

            <div className={`rounded-[22px] border p-5 ${isDark ? "bg-[#15151F] border-white/10" : "bg-white border-black/10"}`}>
              <h2 className="font-black">📅 Monthly TDS Breakup</h2>
              <p className="text-[12px] opacity-60 mt-1">Har mahine tumhari salary se kitna TDS katega:</p>
              <div className="grid grid-cols-3 gap-2 mt-3">
                {monthlyData.map((m) => (
                  <div key={m.month} className={`rounded-xl p-2.5 text-center border ${isDark ? "bg-[#0A0A14] border-white/10" : "bg-[#F8F8FC] border-black/10"}`}>
                    <p className="text-[11px] font-bold opacity-60">{m.month}</p><p className="font-black text-[13px]">{format(m.tds)}</p>
                  </div>
                ))}
              </div>
              <button onClick={() => window.print()} className="w-full mt-4 py-3 bg-black text-white rounded-xl font-black text-[13px] hover:scale-[1.02] transition print:hidden">📄 Full Report PDF Me Download Karo</button>
            </div>

            <div className={`rounded-[22px] border p-5 ${isDark ? "bg-[#15151F] border-white/10" : "bg-white border-black/10"}`}>
              <h2 className="font-black">💡 Pro Tax Saving Tips</h2>
              <ul className="text-[12px] space-y-2 mt-3 opacity-80 leading-relaxed">
                <li>• 80C me abhi <b>{format(150000 - result.total80C)}</b> bacha hai - PPF / ELSS me daalo to tax aur kam hoga.</li>
                <li>• NPS 80CCD(1B) me extra ₹50,000 ka deduction milta hai - Old Regime me.</li>
                <li>• Agar salary 12L se thodi zyada hai to New Regime me Marginal Relief se fayda lo.</li>
                <li>• Crypto pe 30% tax hai, loss ko carry forward nahi kar sakte.</li>
              </ul>
            </div>
          </div>
        </div>

        <div className={`mt-6 rounded-[22px] border p-6 print:hidden ${isDark ? "bg-[#15151F] border-white/10" : "bg-white border-black/10"}`}>
          <h2 className="font-black text-[17px]">Income Tax Calculator Pro - FAQ</h2>
          <p className="text-[13px] leading-relaxed mt-2 opacity-70">12 Lakh tak New Regime me 0 tax kaise? 87A Rebate ki wajah se 12L tak ki income pe poora tax maaf ho jata hai. HRA exemption ka formula kya hai? HRA Received, Basic ka 50% (Metro) / 40% (Non-Metro), aur (Rent - Basic ka 10%) - in teeno me se jo sabse kam hai wahi exempt hota hai. Ye calculator sirf estimate hai, final ITR filing ke liye CA se salah lein.</p>
        </div>
        <p className="text-center text-[11px] opacity-40 mt-4">Disclaimer: Estimate only. Slabs FY 2026-27 ke hisaab se. Final tax ke liye CA se consult karein.</p>
      </div>
    </div>
  );
}
