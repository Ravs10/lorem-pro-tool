"use client";
import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";

export default function PersonalLoanEMI() {
  const [isDark, setIsDark] = useState(true);
  const [soundOn, setSoundOn] = useState(true);
  const [loanAmount, setLoanAmount] = useState(500000);
  const [rate, setRate] = useState(11.5);
  const [tenure, setTenure] = useState(60); // months
  const [tenureType, setTenureType] = useState<"months" | "years">("months");
  const [processingFee, setProcessingFee] = useState(2); // %
  const [prepayment, setPrepayment] = useState(0);
  const [prepayMonth, setPrepayMonth] = useState(12);
  const [showSchedule, setShowSchedule] = useState(false);
  const [activeTab, setActiveTab] = useState<"emi" | "eligibility" | "transfer">("emi");

  // Eligibility inputs
  const [monthlySalary, setMonthlySalary] = useState(60000);
  const [existingEMI, setExistingEMI] = useState(5000);
  const [otherEMI, setOtherEMI] = useState(0);

  // Balance Transfer
  const [oldRate, setOldRate] = useState(14);
  const [newRate, setNewRate] = useState(10.5);
  const [transferFee, setTransferFee] = useState(1);

  const audioRef = useRef<AudioContext | null>(null);
  const play = (type: "fire" | "tick" | "success" = "tick") => {
    if (!soundOn) return;
    try {
      if (!audioRef.current) audioRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const ctx = audioRef.current; if (ctx.state === "suspended") ctx.resume();
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      if (type === "fire") { o.frequency.setValueAtTime(220, ctx.currentTime); o.frequency.linearRampToValueAtTime(880, ctx.currentTime + 0.3); }
      else if (type === "success") { o.frequency.setValueAtTime(523, ctx.currentTime); o.frequency.linearRampToValueAtTime(1046, ctx.currentTime + 0.2); }
      else o.frequency.value = 880;
      g.gain.setValueAtTime(0.06, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      o.start(); o.stop(ctx.currentTime + 0.3);
    } catch {}
  };

  const calc = useMemo(() => {
    const P = loanAmount;
    const r = rate / 1200;
    const n = tenureType === "years" ? tenure * 12 : tenure;
    const emi = P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
    const totalPayment = emi * n;
    const totalInterest = totalPayment - P;
    const feeAmt = P * processingFee / 100;
    const totalCost = totalPayment + feeAmt;

    // Amortization with prepayment
    let balance = P, schedule: any[] = [], totalIntWithPrepay = 0, paidMonths = 0, saved = 0;
    for (let m = 1; m <= n; m++) {
      if (balance <= 0) break;
      const interest = balance * r;
      let principal = emi - interest;
      if (m === prepayMonth && prepayment > 0) {
        principal += prepayment;
        balance -= prepayment;
      }
      if (principal > balance) principal = balance;
      balance -= principal;
      totalIntWithPrepay += interest;
      paidMonths = m;
      if (m <= 12 || m % 12 === 0 || m === n || m === prepayMonth) schedule.push({ month: m, emi: Math.round(emi), principal: Math.round(principal), interest: Math.round(interest), balance: Math.max(0, Math.round(balance)) });
    }
    saved = totalInterest - totalIntWithPrepay;
    const monthsSaved = n - paidMonths;

    // Eligibility - 50% FOIR rule
    const maxEMIAllowed = (monthlySalary * 0.5) - existingEMI - otherEMI;
    const eligibleEMI = Math.max(0, maxEMIAllowed);
    // Reverse EMI to loan amount
    const eligibleAmount = eligibleEMI * (Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n));

    // Balance Transfer
    const oldR = oldRate / 1200, newR = newRate / 1200;
    const oldEMI = P * oldR * Math.pow(1 + oldR, n) / (Math.pow(1 + oldR, n) - 1);
    const newEMI = P * newR * Math.pow(1 + newR, n) / (Math.pow(1 + newR, n) - 1);
    const transferSaving = (oldEMI - newEMI) * n - (P * transferFee / 100);

    // Chart data - yearly
    const yearly: any[] = [];
    let bal = P;
    for (let y = 1; y <= Math.ceil(n / 12); y++) {
      let yInt = 0, yPrin = 0;
      for (let m = 1; m <= 12; m++) {
        const idx = (y - 1) * 12 + m; if (idx > n || bal <= 0) break;
        const intr = bal * r; const prin = Math.min(emi - intr, bal); bal -= prin; yInt += intr; yPrin += prin;
      }
      yearly.push({ year: y, interest: Math.round(yInt), principal: Math.round(yPrin), balance: Math.max(0, Math.round(bal)) });
    }

    return { emi, totalPayment, totalInterest, feeAmt, totalCost, schedule, totalIntWithPrepay, saved, monthsSaved, paidMonths, eligibleEMI, eligibleAmount, oldEMI, newEMI, transferSaving, yearly, n };
  }, [loanAmount, rate, tenure, tenureType, processingFee, prepayment, prepayMonth, monthlySalary, existingEMI, otherEMI, oldRate, newRate, transferFee]);

  const fmt = (v: number) => v >= 10000000 ? `₹${(v / 10000000).toFixed(2)} Cr` : v >= 100000 ? `₹${(v / 100000).toFixed(2)} L` : `₹${Math.round(v).toLocaleString("en-IN")}`;
  const maxY = Math.max(...calc.yearly.map(y => y.interest + y.principal), 1);

  const presets = [
    { label: "₹1 Lakh", amt: 100000 }, { label: "₹3 Lakh", amt: 300000 },
    { label: "₹5 Lakh", amt: 500000 }, { label: "₹10 Lakh", amt: 1000000 },
    { label: "₹15 Lakh", amt: 1500000 }, { label: "₹25 Lakh", amt: 2500000 },
  ];

  return (
    <div className={`min-h-screen transition-colors ${isDark ? "bg-[#0a0a0b] text-white" : "bg-[#f8f8f8] text-black"}`}>
      {/* HEADER */}
      <header className="max-w-[1280px] mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="font-black text-[18px]">Lorem<span className="text-amber-500"> Pro Tool</span> <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500 text-black">FREE</span></Link>
        <div className="flex gap-2">
          <button onClick={() => setSoundOn(!soundOn)} className={`w-9 h-9 rounded-full border flex items-center justify-center ${isDark ? "bg-white/10 border-white/10" : "bg-black/5 border-black/10"}`}>{soundOn ? "🔊" : "🔇"}</button>
          <button onClick={() => setIsDark(!isDark)} className={`w-9 h-9 rounded-full border flex items-center justify-center ${isDark ? "bg-white/10 border-white/10" : "bg-black/5 border-black/10"}`}>{isDark ? "☀️" : "🌙"}</button>
        </div>
      </header>

      {/* TITLE */}
      <div className="max-w-[1280px] mx-auto px-4 pt-2 pb-4 text-center">
        <p className="text-[11px] font-black tracking-[0.25em] text-amber-500">💰 PERSONAL LOAN EMI CALCULATOR 2026 • INDIA</p>
        <h1 className="text-[28px] md:text-[42px] font-black leading-tight mt-2">Personal Loan EMI <span className="text-amber-500">Calculator</span></h1>
        <p className={`text-[13px] md:text-[14px] mt-1 max-w-[700px] mx-auto ${isDark ? "text-white/60" : "text-black/60"}`}>EMI + Prepayment + Balance Transfer + Eligibility — Sab kuch ek hi jagah. HDFC, ICICI, SBI, Bajaj sabke liye.</p>
        <div className="flex justify-center gap-2 mt-3 flex-wrap">
          {["No Signup", "Prepayment Saving", "Bank Comparison", "100% Free"].map(t => <span key={t} className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${isDark ? "border-white/10 bg-white/5" : "border-black/10 bg-white"}`}>✓ {t}</span>)}
        </div>
      </div>

      {/* TABS */}
      <div className="max-w-[1280px] mx-auto px-4 flex gap-2 justify-center mb-4">
        {[{ id: "emi", l: "🧮 EMI Calculator" }, { id: "eligibility", l: "✅ Eligibility" }, { id: "transfer", l: "🔄 Balance Transfer" }].map(t => (
          <button key={t.id} onClick={() => { setActiveTab(t.id as any); play("tick"); }} className={`px-4 py-2 rounded-full text-[12px] font-black transition ${activeTab === t.id ? "bg-amber-500 text-black scale-105 shadow-lg shadow-amber-500/30" : isDark ? "bg-white/10 hover:bg-white/15" : "bg-white border shadow-sm"}`}>{t.l}</button>
        ))}
      </div>

      <main className="max-w-[1280px] mx-auto px-4 grid lg:grid-cols-[1fr_380px] gap-4 pb-6">
        {/* LEFT - INPUTS */}
        <div className={`rounded-[24px] p-5 border ${isDark ? "bg-white/[0.03] border-white/10" : "bg-white border-black/10 shadow-sm"}`}>
          {activeTab === "emi" && (
            <>
              <label className="text-[12px] font-black">LOAN AMOUNT: <span className="text-amber-500">{fmt(loanAmount)}</span></label>
              <input type="range" min={50000} max={4000000} step={10000} value={loanAmount} onChange={e => { setLoanAmount(+e.target.value); play("tick"); }} className="w-full accent-amber-500 mt-2" />
              <div className="flex gap-2 flex-wrap mt-2">{presets.map(p => <button key={p.label} onClick={() => { setLoanAmount(p.amt); play("fire"); }} className={`px-3 py-1.5 rounded-full text-[11px] font-bold border ${loanAmount === p.amt ? "bg-amber-500 text-black border-amber-500" : isDark ? "border-white/10 bg-white/5" : "border-black/10"}`}>{p.label}</button>)}</div>
              <div className="grid md:grid-cols-2 gap-4 mt-5">
                <div>
                  <label className="text-[12px] font-black">INTEREST RATE: <span className="text-amber-500">{rate}% p.a.</span></label>
                  <input type="range" min={8} max={24} step={0.1} value={rate} onChange={e => { setRate(+e.target.value); play("tick"); }} className="w-full accent-amber-500 mt-2" />
                  <div className="flex justify-between text-[10px] opacity-50"><span>8% - Best</span><span>24% - High</span></div>
                </div>
                <div>
                  <label className="text-[12px] font-black">TENURE: <span className="text-amber-500">{tenure} {tenureType === "months" ? "Months" : "Years"}</span></label>
                  <div className="flex gap-2 mt-2">
                    <input type="range" min={tenureType === "months" ? 6 : 1} max={tenureType === "months" ? 84 : 7} step={1} value={tenure} onChange={e => { setTenure(+e.target.value); play("tick"); }} className="flex-1 accent-amber-500" />
                    <div className="flex rounded-full overflow-hidden border border-white/10">
                      <button onClick={() => setTenureType("months")} className={`px-3 text-[11px] font-black ${tenureType === "months" ? "bg-amber-500 text-black" : "bg-white/10"}`}>Months</button>
                      <button onClick={() => setTenureType("years")} className={`px-3 text-[11px] font-black ${tenureType === "years" ? "bg-amber-500 text-black" : "bg-white/10"}`}>Years</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* PREPAYMENT - ADVANCE */}
              <div className={`mt-5 p-4 rounded-[18px] border border-dashed ${isDark ? "border-amber-500/30 bg-amber-500/5" : "border-amber-500/40 bg-amber-50"}`}>
                <p className="text-[12px] font-black">🔥 PREPAYMENT / PART-PAYMENT <span className="ml-1 text-[9px] px-2 py-0.5 rounded-full bg-green-500 text-white">SAVE ₹{Math.round(calc.saved).toLocaleString("en-IN")}</span></p>
                <div className="grid md:grid-cols-2 gap-4 mt-3">
                  <div><label className="text-[11px] font-bold">Prepay Amount: {fmt(prepayment)}</label><input type="range" min={0} max={1000000} step={10000} value={prepayment} onChange={e => setPrepayment(+e.target.value)} className="w-full accent-green-500" /></div>
                  <div><label className="text-[11px] font-bold">Prepay in Month: {prepayMonth}</label><input type="range" min={1} max={calc.n} step={1} value={prepayMonth} onChange={e => setPrepayMonth(+e.target.value)} className="w-full accent-green-500" /></div>
                </div>
                {prepayment > 0 && <p className="text-[11px] text-green-500 font-bold mt-2">✅ Tum {calc.monthsSaved} months pehle loan khatam kar doge aur ₹{Math.round(calc.saved).toLocaleString("en-IN")} interest bacha loge!</p>}
              </div>

              <div className="mt-4">
                <label className="text-[12px] font-black">PROCESSING FEE: {processingFee}% = {fmt(calc.feeAmt)}</label>
                <input type="range" min={0} max={5} step={0.25} value={processingFee} onChange={e => setProcessingFee(+e.target.value)} className="w-full accent-amber-500 mt-1" />
              </div>

              {/* YEARLY CHART */}
              <div className="mt-6">
                <p className="text-[12px] font-black mb-3">📊 YEAR WISE - PRINCIPAL vs INTEREST</p>
                <div className="flex items-end gap-2 h-[140px]">
                  {calc.yearly.map(y => (
                    <div key={y.year} className="flex-1 flex flex-col items-center gap-1 group">
                      <div className="w-full flex flex-col justify-end h-[120px]">
                        <div className="bg-amber-500 rounded-t-md transition-all group-hover:opacity-80" style={{ height: `${(y.principal / maxY) * 110}px` }} title={`Principal ${fmt(y.principal)}`} />
                        <div className="bg-red-500/80 rounded-b-md transition-all" style={{ height: `${(y.interest / maxY) * 110}px` }} title={`Interest ${fmt(y.interest)}`} />
                      </div>
                      <span className="text-[9px] font-bold opacity-60">Y{y.year}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-4 text-[10px] mt-2"><span>🟧 Principal</span><span>🟥 Interest</span></div>
              </div>
            </>
          )}

          {activeTab === "eligibility" && (
            <div className="space-y-4">
              <h3 className="text-[16px] font-black">Kitna Loan Milega?</h3>
              <div><label className="text-[12px] font-bold">Monthly In-Hand Salary: ₹{monthlySalary.toLocaleString("en-IN")}</label><input type="range" min={15000} max={300000} step={1000} value={monthlySalary} onChange={e => setMonthlySalary(+e.target.value)} className="w-full accent-amber-500" /></div>
              <div><label className="text-[12px] font-bold">Existing Loan EMI: ₹{existingEMI.toLocaleString("en-IN")}</label><input type="range" min={0} max={50000} step={500} value={existingEMI} onChange={e => setExistingEMI(+e.target.value)} className="w-full accent-amber-500" /></div>
              <div><label className="text-[12px] font-bold">Other EMI (Card etc): ₹{otherEMI.toLocaleString("en-IN")}</label><input type="range" min={0} max={30000} step={500} value={otherEMI} onChange={e => setOtherEMI(+e.target.value)} className="w-full accent-amber-500" /></div>
              <div className={`p-4 rounded-[16px] ${isDark ? "bg-green-500/10 border border-green-500/20" : "bg-green-50 border border-green-200"}`}>
                <p className="text-[12px]">Bank tumhe max <b className="text-green-500 text-[18px]">{fmt(calc.eligibleAmount)}</b> tak loan de sakti hai</p>
                <p className="text-[11px] opacity-70 mt-1">Max EMI afford kar sakte ho: {fmt(calc.eligibleEMI)} / month (50% FOIR Rule)</p>
              </div>
            </div>
          )}

          {activeTab === "transfer" && (
            <div className="space-y-4">
              <h3 className="text-[16px] font-black">Balance Transfer - Kitna Bachhega?</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div><label className="text-[12px] font-bold">Old Rate: {oldRate}%</label><input type="range" min={9} max={24} step={0.25} value={oldRate} onChange={e => setOldRate(+e.target.value)} className="w-full accent-red-500" /></div>
                <div><label className="text-[12px] font-bold">New Rate: {newRate}%</label><input type="range" min={8} max={18} step={0.25} value={newRate} onChange={e => setNewRate(+e.target.value)} className="w-full accent-green-500" /></div>
              </div>
              <div><label className="text-[12px] font-bold">Transfer Fee: {transferFee}%</label><input type="range" min={0} max={3} step={0.25} value={transferFee} onChange={e => setTransferFee(+e.target.value)} className="w-full accent-amber-500" /></div>
              <div className={`p-4 rounded-[16px] ${calc.transferSaving > 0 ? "bg-green-500/10 border border-green-500/20" : "bg-red-500/10 border border-red-500/20"}`}>
                <p className="text-[13px] font-bold">{calc.transferSaving > 0 ? `✅ Transfer karo! ₹${Math.round(calc.transferSaving).toLocaleString("en-IN")} bachega` : `❌ Transfer mat karo, ₹${Math.round(Math.abs(calc.transferSaving)).toLocaleString("en-IN")} ka nuksaan hoga`}</p>
                <p className="text-[11px] opacity-70 mt-1">Old EMI: {fmt(calc.oldEMI)} → New EMI: {fmt(calc.newEMI)} • Monthly Saving: {fmt(calc.oldEMI - calc.newEMI)}</p>
              </div>
            </div>
          )}

          {/* BANK COMPARISON */}
          <div className="mt-6">
            <p className="text-[12px] font-black mb-2">🏦 BANK COMPARISON - {fmt(loanAmount)} @ {calc.n} Months</p>
            <div className="overflow-x-auto">
              <table className={`w-full text-[11px] ${isDark ? "text-white/80" : "text-black/80"}`}>
                <thead><tr className={`border-b ${isDark ? "border-white/10" : "border-black/10"}`}><th className="text-left py-2">Bank</th><th>Rate</th><th>EMI</th><th>Total Interest</th><th></th></tr></thead>
                <tbody>
                  {[{ n: "HDFC Bank", r: 10.75 }, { n: "ICICI Bank", r: 11.0 }, { n: "SBI", r: 11.25 }, { n: "Bajaj Finserv", r: 12.5 }, { n: "Kotak", r: 11.75 }].map(b => {
                    const rr = b.r / 1200; const emi = loanAmount * rr * Math.pow(1 + rr, calc.n) / (Math.pow(1 + rr, calc.n) - 1); const intr = emi * calc.n - loanAmount;
                    return <tr key={b.n} className={`border-b ${isDark ? "border-white/5" : "border-black/5"} ${b.r === 10.75 ? "bg-green-500/5" : ""}`}><td className="py-2 font-bold">{b.n} {b.r === 10.75 && <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-green-500 text-white ml-1">LOWEST</span>}</td><td className="text-center">{b.r}%</td><td className="text-center font-bold">{fmt(emi)}</td><td className="text-center">{fmt(intr)}</td><td className="text-right"><button onClick={() => { setRate(b.r); setActiveTab("emi"); play("success"); }} className="px-2 py-1 rounded-full bg-amber-500 text-black text-[10px] font-black">Use</button></td></tr>;
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT - RESULT */}
        <div className="space-y-3">
          <div className="rounded-[24px] p-5 bg-gradient-to-br from-amber-400 to-orange-600 text-black relative overflow-hidden">
            <p className="text-[11px] font-black tracking-widest opacity-70">YOUR MONTHLY EMI</p>
            <p className="text-[36px] font-black leading-none mt-1">{fmt(calc.emi)}</p>
            <p className="text-[11px] font-bold mt-1 opacity-80">for {calc.n} months • {fmt(loanAmount)} @ {rate}%</p>
            <div className="grid grid-cols-2 gap-2 mt-4">
              <div className="bg-black/10 rounded-[14px] p-3"><p className="text-[10px] font-bold opacity-70">TOTAL INTEREST</p><p className="font-black text-[14px]">{fmt(calc.totalInterest)}</p></div>
              <div className="bg-black/10 rounded-[14px] p-3"><p className="text-[10px] font-bold opacity-70">TOTAL PAYMENT</p><p className="font-black text-[14px]">{fmt(calc.totalPayment)}</p></div>
              <div className="bg-black/10 rounded-[14px] p-3"><p className="text-[10px] font-bold opacity-70">PROCESSING FEE</p><p className="font-black text-[14px]">{fmt(calc.feeAmt)}</p></div>
              <div className="bg-black/10 rounded-[14px] p-3"><p className="text-[10px] font-bold opacity-70">TOTAL COST</p><p className="font-black text-[14px]">{fmt(calc.totalCost)}</p></div>
            </div>
            <button onClick={() => { setShowSchedule(!showSchedule); play("fire"); }} className="w-full mt-4 bg-black text-white py-3 rounded-full text-[12px] font-black hover:scale-[1.02] transition">{showSchedule ? "Hide Schedule ▲" : "View Full Amortization Schedule ▼"}</button>
          </div>

          {/* DONUT */}
          <div className={`rounded-[24px] p-4 border ${isDark ? "bg-white/[0.03] border-white/10" : "bg-white border-black/10"}`}>
            <p className="text-[12px] font-black mb-2">PRINCIPAL vs INTEREST</p>
            <div className="flex items-center gap-4">
              <div className="w-[90px] h-[90px] rounded-full shrink-0" style={{ background: `conic-gradient(#f59e0b 0 ${(loanAmount / calc.totalPayment) * 360}deg, #ef4444 ${(loanAmount / calc.totalPayment) * 360}deg 360deg)` }} />
              <div className="text-[11px] space-y-1"><p>🟧 Principal: {fmt(loanAmount)} ({Math.round(loanAmount / calc.totalPayment * 100)}%)</p><p>🟥 Interest: {fmt(calc.totalInterest)} ({Math.round(calc.totalInterest / calc.totalPayment * 100)}%)</p><p className="font-bold text-green-500">Prepay karke {fmt(calc.saved)} bachao</p></div>
            </div>
          </div>

          {/* QUICK TIP */}
          <div className={`rounded-[24px] p-4 border ${isDark ? "bg-white/[0.03] border-white/10" : "bg-white border-black/10"}`}>
            <p className="text-[12px] font-black">💡 SMART TIP</p>
            <p className="text-[11px] opacity-70 mt-1 leading-relaxed">EMI tumhari salary ka 40% se zyada nahi honi chahiye. Agar rate 1% bhi kam ho jaye to {fmt(calc.emi)} wali EMI pe {fmt(calc.totalPayment * 0.05)} tak bach sakta hai. Isliye Balance Transfer check karo.</p>
          </div>
        </div>
      </main>

      {/* SCHEDULE TABLE */}
      {showSchedule && (
        <div className="max-w-[1280px] mx-auto px-4 pb-6">
          <div className={`rounded-[24px] p-4 border overflow-x-auto ${isDark ? "bg-white/[0.03] border-white/10" : "bg-white border-black/10"}`}>
            <p className="text-[13px] font-black mb-3">📋 Amortization Schedule - Har Mahine Ka Hisab</p>
            <table className="w-full text-[11px] min-w-[500px]"><thead><tr className="border-b opacity-60"><th className="text-left py-2">Month</th><th>EMI</th><th>Principal</th><th>Interest</th><th className="text-right">Balance</th></tr></thead><tbody>{calc.schedule.map((s: any) => <tr key={s.month} className="border-b border-white/5"><td className="py-2 font-bold">Month {s.month}</td><td className="text-center">{fmt(s.emi)}</td><td className="text-center text-green-500">{fmt(s.principal)}</td><td className="text-center text-red-500">{fmt(s.interest)}</td><td className="text-right font-bold">{fmt(s.balance)}</td></tr>)}</tbody></table>
          </div>
        </div>
      )}

      {/* MORE FAVORITE TOOLS */}
      <section className="max-w-[1280px] mx-auto px-4 pb-2">
        <div className="flex justify-between items-end flex-wrap gap-2 mb-4"><div><p className="text-[11px] font-black tracking-[0.25em] text-amber-500">⭐ MORE FAVORITE TOOLS</p><h2 className="text-[22px] md:text-[28px] font-black leading-tight mt-1">Log Aur Bhi <span className="text-amber-500">Use Kar Rahe Hai</span></h2></div><a href="/" className="text-[11px] font-black px-3 py-2 rounded-full bg-amber-500 text-black">All Tools →</a></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[{ h: "/fire-calculator", i: "🔥", t: "FIRE Calculator", d: "Retire Early at 40" }, { h: "/sip-calculator", i: "📈", t: "SIP Calculator", d: "Mutual Fund Growth" }, { h: "/mortgage-calculator", i: "🏠", t: "Mortgage Calculator", d: "Home Loan EMI" }, { h: "/youtube-earnings-calculator", i: "▶️", t: "YouTube Earnings", d: "Views = Kitni Earning?" }].map(x => <a key={x.h} href={x.h} onMouseEnter={() => play("tick")} className={`rounded-[20px] p-4 border hover:-translate-y-1 hover:scale-[1.02] transition ${isDark ? "border-white/10 bg-white/[0.04]" : "border-black/10 bg-white"}`}><div className="text-[22px]">{x.i}</div><p className="font-black text-[13px] mt-2">{x.t}</p><p className={`text-[11px] ${isDark ? "text-white/50" : "text-black/50"}`}>{x.d}</p><p className="text-[11px] font-black mt-2 text-amber-500">Try Now →</p></a>)}
        </div>
      </section>

      {/* SEO CONTENT */}
      <article className={`max-w-[1280px] mx-auto px-4 py-8 text-[13px] leading-relaxed ${isDark ? "text-white/60" : "text-black/60"}`}>
        <h2 className={`text-[20px] font-black ${isDark ? "text-white" : "text-black"}`}>Personal Loan EMI Calculator - EMI Kaise Calculate Kare?</h2>
        <p className="mt-2">Personal Loan EMI ka formula hai: <b>EMI = P × r × (1+r)^n / [(1+r)^n - 1]</b> jaha P = Loan Amount, r = Monthly Interest Rate, n = Months. Example: ₹5 Lakh, 11.5% rate, 60 months pe EMI ₹10,997 banti hai aur total interest ₹1,59,820 lagta hai.</p>
        <h3 className={`text-[16px] font-black mt-4 ${isDark ? "text-white" : "text-black"}`}>Personal Loan EMI Kam Kaise Kare? 5 Tarike</h3>
        <p className="mt-1">1. <b>Prepayment karo:</b> Har saal bonus se part-payment karo, interest 30% tak bach jayega. 2. <b>Balance Transfer:</b> Agar tumhara rate 14% hai aur dusra bank 10.5% de raha hai to turant transfer karo. 3. <b>Tenure mat badhao:</b> Tenure badhane se EMI kam lagti hai par interest double ho jata hai. 4. <b>CIBIL Score 750+ rakho:</b> Score acha hoga to bank khud rate kam dega. 5. <b>Processing fee negotiate karo:</b> 2% ki jagah 0.5% bhi ho sakta hai.</p>
        <h3 className={`text-[16px] font-black mt-4 ${isDark ? "text-white" : "text-black"}`}>Eligibility Kya Hai?</h3>
        <p className="mt-1">Bank 50% FOIR rule lagati hai. Matlab tumhari total EMI tumhari salary ke 50% se zyada nahi honi chahiye. Salary ₹60,000 hai to max EMI ₹30,000 ho sakti hai. Agar pehle se ₹5,000 EMI chal rahi hai to naye loan ke liye ₹25,000 bachta hai.</p>
        <p className="mt-3 text-[11px] opacity-50">Disclaimer: Ye calculator sirf estimate ke liye hai. Actual EMI bank ke hisab se thodi alag ho sakti hai. Loan lene se pehle bank se confirm karein.</p>
      </article>
    </div>
  );
}
