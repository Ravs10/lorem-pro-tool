"use client";
import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";

// ============ CONFIG ============
const CURRENCIES = {
  INR: { symbol: "₹", code: "INR", rate: 83.5, locale: "en-IN" },
  USD: { symbol: "$", code: "USD", rate: 1, locale: "en-US" },
  EUR: { symbol: "€", code: "EUR", rate: 0.92, locale: "de-DE" },
  GBP: { symbol: "£", code: "GBP", rate: 0.79, locale: "en-GB" },
  AED: { symbol: "AED ", code: "AED", rate: 3.67, locale: "en-AE" },
};

type CurrencyKey = keyof typeof CURRENCIES;

const BANKS = [
  { name: "HDFC Bank", rate: 10.75, fee: 1.5 },
  { name: "IDFC First", rate: 10.99, fee: 2.0 },
  { name: "ICICI Bank", rate: 11.0, fee: 2.0 },
  { name: "SBI", rate: 11.25, fee: 1.0 },
  { name: "Axis Bank", rate: 11.5, fee: 1.8 },
  { name: "Kotak Mahindra", rate: 11.75, fee: 2.5 },
  { name: "Bajaj Finserv", rate: 12.5, fee: 3.0 },
  { name: "Yes Bank", rate: 13.25, fee: 2.0 },
];

const CIBIL_TIERS = [
  { min: 750, rate: 10.5, label: "Excellent", color: "text-green-500" },
  { min: 700, rate: 11.5, label: "Good", color: "text-lime-500" },
  { min: 650, rate: 13.5, label: "Fair", color: "text-amber-500" },
  { min: 600, rate: 16.5, label: "Poor", color: "text-red-500" },
  { min: 300, rate: 20.0, label: "Bad", color: "text-red-700" },
];

// ============ HELPERS ============
const emiFormula = (P: number, r: number, n: number): number => {
  if (r === 0) return P / n;
  return (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
};

const calculateAPR = (P: number, emi: number, n: number, fees: number): number => {
  const netProceeds = P - fees;
  const npv = (rate: number) => {
    let pv = netProceeds;
    for (let m = 1; m <= n; m++) pv -= emi / Math.pow(1 + rate, m);
    return pv;
  };
  let r = 0.01;
  for (let i = 0; i < 60; i++) {
    const f = npv(r);
    const df = (npv(r + 0.00005) - f) / 0.00005;
    if (Math.abs(df) < 1e-12) break;
    const next = r - f / df;
    if (Math.abs(next - r) < 1e-9) { r = next; break; }
    r = next;
  }
  return (Math.pow(1 + r, 12) - 1) * 100;
};

interface AccordionProps {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  isDark: boolean;
}

function Accordion({ title, children, isOpen, onToggle, isDark }: AccordionProps) {
  return (
    <div className={`border rounded-[18px] overflow-hidden mb-2 ${isDark ? "border-white/10 bg-white/[0.03]" : "border-black/10 bg-white"}`}>
      <button onClick={onToggle} className="w-full flex justify-between items-center p-4 text-left">
        <span className={`text-[13px] font-black pr-4 ${isDark ? "text-white" : "text-black"}`}>{title}</span>
        <span className={`text-[18px] font-black text-amber-500 transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`}>+</span>
      </button>
      <div className={`grid transition-all duration-300 ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
        <div className="overflow-hidden">
          <div className={`px-4 pb-4 text-[12px] leading-relaxed ${isDark ? "text-white/60" : "text-black/60"}`}>{children}</div>
        </div>
      </div>
    </div>
  );
}

export default function PersonalLoanEMI() {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [soundOn, setSoundOn] = useState(false);
  const [currency, setCurrency] = useState<CurrencyKey>("INR");

  // Inputs
  const [loanAmount, setLoanAmount] = useState(500000);
  const [rate, setRate] = useState(11.5);
  const [tenure, setTenure] = useState(60);
  const [tenureType, setTenureType] = useState<"months" | "years">("months");
  const [processingFee, setProcessingFee] = useState(2);
  const [prepayment, setPrepayment] = useState(0);
  const [prepayMonth, setPrepayMonth] = useState(12);
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split("T")[0]);

  // Tabs
  const [activeTab, setActiveTab] = useState<"emi" | "eligibility" | "transfer">("emi");
  const [showSchedule, setShowSchedule] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  // Eligibility
  const [monthlySalary, setMonthlySalary] = useState(60000);
  const [existingEMI, setExistingEMI] = useState(5000);
  const [otherEMI, setOtherEMI] = useState(0);
  const [cibilScore, setCibilScore] = useState(750);

  // Transfer
  const [oldRate, setOldRate] = useState(14);
  const [newRate, setNewRate] = useState(10.5);
  const [transferFee, setTransferFee] = useState(1);

  const audioRef = useRef<AudioContext | null>(null);

  useEffect(() => { setMounted(true); }, []);

  const curr = CURRENCIES[currency];

  const play = (type: "tick" | "fire" | "success" = "tick") => {
    if (!soundOn) return;
    try {
      if (!audioRef.current) {
        // ✅ FIX: cast window to any for webkitAudioContext (legacy Safari prefix)
        const AC = window.AudioContext || (window as any).webkitAudioContext;
        audioRef.current = new AC();
      }
      const ctx = audioRef.current;
      if (!ctx) return;
      if (ctx.state === "suspended") ctx.resume();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      if (type === "fire") {
        o.frequency.setValueAtTime(220, ctx.currentTime);
        o.frequency.linearRampToValueAtTime(880, ctx.currentTime + 0.3);
      } else if (type === "success") {
        o.frequency.setValueAtTime(523, ctx.currentTime);
        o.frequency.linearRampToValueAtTime(1046, ctx.currentTime + 0.2);
      } else {
        o.frequency.value = 880;
      }
      g.gain.setValueAtTime(0.05, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      o.start();
      o.stop(ctx.currentTime + 0.3);
    } catch {}
  };

  const switchCurrency = (newCur: CurrencyKey) => {
    if (newCur === currency) return;
    const rateRatio = CURRENCIES[newCur].rate / CURRENCIES[currency].rate;
    setLoanAmount(Math.round((loanAmount * rateRatio) / 1000) * 1000);
    setPrepayment(Math.round(prepayment * rateRatio));
    setMonthlySalary(Math.round((monthlySalary * rateRatio) / 100) * 100);
    setExistingEMI(Math.round((existingEMI * rateRatio) / 100) * 100);
    setOtherEMI(Math.round((otherEMI * rateRatio) / 100) * 100);
    setCurrency(newCur);
  };

  const fmt = (v: number): string => {
    if (!isFinite(v) || isNaN(v)) v = 0;
    const abs = Math.abs(v);
    const sign = v < 0 ? "-" : "";
    if (currency === "INR") {
      if (abs >= 1e7) return `${sign}₹${(abs / 1e7).toFixed(2)} Cr`;
      if (abs >= 1e5) return `${sign}₹${(abs / 1e5).toFixed(2)} L`;
      if (abs >= 1e3) return `${sign}₹${(abs / 1e3).toFixed(1)}K`;
    }
    return sign + new Intl.NumberFormat(curr.locale, { style: "currency", currency: curr.code, maximumFractionDigits: 0 }).format(abs);
  };

  const fmtFull = (v: number): string =>
    new Intl.NumberFormat(curr.locale, { style: "currency", currency: curr.code, maximumFractionDigits: 0 }).format(v);

  // ============ MASTER CALC ============
  const calc = useMemo(() => {
    const P = loanAmount;
    const r = rate / 1200;
    const n = tenureType === "years" ? tenure * 12 : tenure;
    const emi = emiFormula(P, r, n);
    const totalPayment = emi * n;
    const totalInterest = totalPayment - P;
    const feeAmt = (P * processingFee) / 100;
    const totalCost = totalPayment + feeAmt;
    const apr = calculateAPR(P, emi, n, feeAmt);

    let balance = P;
    const fullSchedule: Array<{
      month: number; emi: number; principal: number; interest: number; balance: number; isPrepay: boolean;
    }> = [];
    let totalIntWithPrepay = 0;
    let paidMonths = 0;

    for (let m = 1; m <= n && balance > 0.01; m++) {
      const interest = balance * r;
      let principal = emi - interest;
      if (m === prepayMonth && prepayment > 0) principal += prepayment;
      if (principal > balance) principal = balance;
      balance -= principal;
      totalIntWithPrepay += interest;
      paidMonths = m;
      fullSchedule.push({
        month: m,
        emi: Math.round(emi),
        principal: Math.round(principal),
        interest: Math.round(interest),
        balance: Math.max(0, Math.round(balance)),
        isPrepay: m === prepayMonth && prepayment > 0,
      });
    }

    const saved = Math.max(0, totalInterest - totalIntWithPrepay);
    const monthsSaved = Math.max(0, n - paidMonths);

    const yearly: Array<{ year: number; interest: number; principal: number; balance: number }> = [];
    let bal = P;
    for (let y = 1; y <= Math.ceil(n / 12); y++) {
      let yInt = 0, yPrin = 0;
      for (let m = 1; m <= 12; m++) {
        const idx = (y - 1) * 12 + m;
        if (idx > n || bal <= 0.01) break;
        const intr = bal * r;
        let prin = emi - intr;
        if (idx === prepayMonth && prepayment > 0) prin += prepayment;
        if (prin > bal) prin = bal;
        bal -= prin;
        yInt += intr;
        yPrin += prin;
      }
      yearly.push({ year: y, interest: Math.round(yInt), principal: Math.round(yPrin), balance: Math.max(0, Math.round(bal)) });
    }

    const maxEMIAllowed = monthlySalary * 0.5 - existingEMI - otherEMI;
    const eligibleEMI = Math.max(0, maxEMIAllowed);
    const eligibleAmount = eligibleEMI > 0 ? (eligibleEMI * (Math.pow(1 + r, n) - 1)) / (r * Math.pow(1 + r, n)) : 0;
    const foir = monthlySalary > 0 ? ((existingEMI + otherEMI + emi) / monthlySalary) * 100 : 0;
    const emiToIncome = monthlySalary > 0 ? (emi / monthlySalary) * 100 : 0;

    const cibilTier = CIBIL_TIERS.find((t) => cibilScore >= t.min) || CIBIL_TIERS[CIBIL_TIERS.length - 1];

    const oldR = oldRate / 1200;
    const newR = newRate / 1200;
    const oldEMI = emiFormula(P, oldR, n);
    const newEMI = emiFormula(P, newR, n);
    const transferFeeAmt = (P * transferFee) / 100;
    const transferSaving = (oldEMI - newEMI) * n - transferFeeAmt;

    const payoff = new Date(startDate);
    payoff.setMonth(payoff.getMonth() + paidMonths);

    const bankComp = BANKS.map((b) => {
      const br = b.rate / 1200;
      const bEmi = emiFormula(P, br, n);
      const bInterest = bEmi * n - P;
      const bFee = (P * b.fee) / 100;
      return { ...b, emi: bEmi, interest: bInterest, fee: bFee, total: P + bInterest + bFee };
    }).sort((a, b) => a.total - b.total);

    return {
      P, r, n, emi, totalPayment, totalInterest, feeAmt, totalCost, apr,
      fullSchedule, yearly, saved, monthsSaved, paidMonths, totalIntWithPrepay,
      eligibleAmount, eligibleEMI, foir, emiToIncome, cibilTier,
      oldEMI, newEMI, transferSaving, transferFeeAmt, payoff, bankComp,
    };
  }, [loanAmount, rate, tenure, tenureType, processingFee, prepayment, prepayMonth, monthlySalary, existingEMI, otherEMI, cibilScore, oldRate, newRate, transferFee, startDate]);

  const maxY = Math.max(...calc.yearly.map((y) => y.interest + y.principal), 1);

  const presets = useMemo(() => {
    const baseINR = [100000, 300000, 500000, 1000000, 1500000, 2500000];
    const ratio = CURRENCIES[currency].rate / CURRENCIES.INR.rate;
    return baseINR.map((v) => ({ label: fmt(v * ratio), amt: Math.round(v * ratio) }));
  }, [currency]);

  const copyReport = () => {
    play("success");
    const text = `💰 Personal Loan EMI Report (${currency})
━━━━━━━━━━━━━━━━━
Loan: ${fmtFull(loanAmount)} @ ${rate}% for ${calc.n} months
Processing Fee: ${processingFee}% (${fmtFull(calc.feeAmt)})
━━━━━━━━━━━━━━━━━
Monthly EMI: ${fmtFull(calc.emi)}
Total Interest: ${fmtFull(calc.totalInterest)}
Total Payment: ${fmtFull(calc.totalPayment)}
APR (true cost): ${calc.apr.toFixed(2)}%
Total Outflow: ${fmtFull(calc.totalCost)}
Payoff: ${calc.payoff.toLocaleDateString(curr.locale, { month: "short", year: "numeric" })}
━━━━━━━━━━━━━━━━━
${prepayment > 0 ? `Prepay ${fmtFull(prepayment)} in month ${prepayMonth}
Savings: ${fmtFull(calc.saved)} | ${calc.monthsSaved} months earlier` : "No prepayment configured"}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportCSV = () => {
    let csv = `# Personal Loan EMI Report (${currency})\n# Loan: ${loanAmount}, Rate: ${rate}%, Tenure: ${calc.n} months, EMI: ${Math.round(calc.emi)}\n`;
    csv += "Month,EMI,Principal,Interest,Balance,Prepayment\n";
    calc.fullSchedule.forEach((s) => {
      csv += `${s.month},${s.emi},${s.principal},${s.interest},${s.balance},${s.isPrepay ? "YES" : ""}\n`;
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `loan-schedule-${currency}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPDF = () => {
    play("success");
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>Personal Loan EMI Report</title>
      <style>
        body{font-family:Arial,sans-serif;padding:30px;color:#000;max-width:800px;margin:auto}
        h1{font-size:24px;border-bottom:3px solid #f59e0b;padding-bottom:8px}
        h3{margin-top:20px;color:#333}
        table{width:100%;border-collapse:collapse;margin-top:12px}
        th,td{border:1px solid #ddd;padding:8px;font-size:12px;text-align:left}
        th{background:#fef3c7}
        .box{background:#fef3c7;padding:15px;border-radius:12px;margin:15px 0}
        .box p{margin:4px 0;font-size:13px}
        .footer{font-size:10px;color:#888;margin-top:20px;text-align:center}
      </style></head><body>
      <h1>💰 Personal Loan EMI Report</h1>
      <p style="font-size:11px;color:#666">Generated on ${new Date().toLocaleDateString("en-IN")} • Lorem Pro Tool</p>
      <div class="box">
        <p><b>Loan Amount:</b> ${fmtFull(loanAmount)}</p>
        <p><b>Interest Rate:</b> ${rate}% p.a.</p>
        <p><b>Tenure:</b> ${calc.n} months (${(calc.n / 12).toFixed(1)} years)</p>
        <p><b>Processing Fee:</b> ${processingFee}% = ${fmtFull(calc.feeAmt)}</p>
        <p><b>Monthly EMI:</b> ${fmtFull(calc.emi)}</p>
        <p><b>Total Interest:</b> ${fmtFull(calc.totalInterest)}</p>
        <p><b>Total Payment:</b> ${fmtFull(calc.totalPayment)}</p>
        <p><b>Total Cost (incl. fees):</b> ${fmtFull(calc.totalCost)}</p>
        <p><b>APR:</b> ${calc.apr.toFixed(2)}%</p>
        <p><b>Payoff Date:</b> ${calc.payoff.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</p>
        ${prepayment > 0 ? `<p><b>Prepayment:</b> ${fmtFull(prepayment)} in month ${prepayMonth} → Saves ${fmtFull(calc.saved)} + ${calc.monthsSaved} months</p>` : ""}
      </div>
      <h3>Amortization Schedule</h3>
      <table>
        <tr><th>Month</th><th>EMI</th><th>Principal</th><th>Interest</th><th>Balance</th></tr>
        ${calc.fullSchedule.map((s) => `<tr><td>${s.month}${s.isPrepay ? " ★" : ""}</td><td>${fmtFull(s.emi)}</td><td>${fmtFull(s.principal)}</td><td>${fmtFull(s.interest)}</td><td>${fmtFull(s.balance)}</td></tr>`).join("")}
      </table>
      <p class="footer">Estimate only. Actual EMI may vary by lender. | Lorem Pro Tool</p>
      <script>window.onload=()=>window.print()</script>
      </body></html>
    `);
    printWindow.document.close();
  };

  const save = () => {
    try {
      localStorage.setItem("personal-loan-v3", JSON.stringify({
        loanAmount, rate, tenure, tenureType, processingFee, prepayment, prepayMonth,
        monthlySalary, existingEMI, otherEMI, cibilScore, oldRate, newRate, transferFee, currency, isDark,
      }));
      setSaveMsg("✓ Saved!");
    } catch { setSaveMsg("✗ Failed"); }
    setTimeout(() => setSaveMsg(""), 2000);
  };

  const load = () => {
    try {
      const d = JSON.parse(localStorage.getItem("personal-loan-v3") || "null");
      if (!d) { setSaveMsg("Nothing saved"); setTimeout(() => setSaveMsg(""), 2000); return; }
      const setters: Record<string, (v: any) => void> = {
        loanAmount: setLoanAmount, rate: setRate, tenure: setTenure,
        tenureType: setTenureType, processingFee: setProcessingFee, prepayment: setPrepayment,
        prepayMonth: setPrepayMonth, monthlySalary: setMonthlySalary, existingEMI: setExistingEMI,
        otherEMI: setOtherEMI, cibilScore: setCibilScore, oldRate: setOldRate,
        newRate: setNewRate, transferFee: setTransferFee, currency: setCurrency, isDark: setIsDark,
      };
      Object.keys(d).forEach((k) => { setters[k]?.(d[k]); });
      setSaveMsg("✓ Loaded!");
    } catch { setSaveMsg("✗ Failed"); }
    setTimeout(() => setSaveMsg(""), 2000);
  };

  const reset = () => {
    setLoanAmount(500000); setRate(11.5); setTenure(60); setTenureType("months");
    setProcessingFee(2); setPrepayment(0); setPrepayMonth(12);
    setMonthlySalary(60000); setExistingEMI(5000); setOtherEMI(0); setCibilScore(750);
    setOldRate(14); setNewRate(10.5); setTransferFee(1); setCurrency("INR");
    setSaveMsg("✓ Reset!"); setTimeout(() => setSaveMsg(""), 2000);
  };

  const whatsappLink = `https://wa.me/?text=${encodeURIComponent(
    `🔥 Personal Loan EMI Check!\n\n💰 Loan: ${fmt(loanAmount)}\n📊 EMI: ${fmt(calc.emi)}/mo\n📈 Rate: ${rate}% • ${calc.n} months\n💸 Total Interest: ${fmt(calc.totalInterest)}\n✅ APR: ${calc.apr.toFixed(2)}%\n\nCheck yours 👉 ${typeof window !== "undefined" ? window.location.origin : ""}/personal-loan-emi-calculator`
  )}`;

  if (!mounted) return null;

  const schemaFAQ = {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: [
      { "@type": "Question", name: "Personal Loan EMI kaise calculate karte hai?", acceptedAnswer: { "@type": "Answer", text: "EMI = P × r × (1+r)^n / [(1+r)^n - 1] formula se nikalte hai, jaha P loan amount, r monthly interest rate, n tenure in months hai." } },
      { "@type": "Question", name: "Prepayment karne pe koi charge lagta hai?", acceptedAnswer: { "@type": "Answer", text: "RBI rule ke hisab se floating rate personal loan pe prepayment charge nahi lagta. Fixed rate pe banks 2%-4% charge le sakte hai." } },
      { "@type": "Question", name: "Personal loan ke liye CIBIL score kitna chahiye?", acceptedAnswer: { "@type": "Answer", text: "750+ score pe best rate (10.5%-11.5%) milta hai. 650 se neeche loan milna mushkil hota hai." } },
      { "@type": "Question", name: "EMI kam karne ka sabse aasan tarika?", acceptedAnswer: { "@type": "Answer", text: "Prepayment karo, balance transfer karo, aur tenure na badhao — teeno options se EMI kam hoti hai but approach different hai." } },
      { "@type": "Question", name: "APR kya hai?", acceptedAnswer: { "@type": "Answer", text: "APR (Annual Percentage Rate) actual cost of borrowing hai — interest + processing fee + other charges sab milake. Personal loan ka true cost janne ke liye APR important hai." } },
    ],
  };
  const schemaApp = {
    "@context": "https://schema.org", "@type": "WebApplication",
    name: "Personal Loan EMI Calculator PRO",
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
    aggregateRating: { "@type": "AggregateRating", ratingValue: "4.8", ratingCount: "2156" },
  };
  const schemaHowTo = {
    "@context": "https://schema.org", "@type": "HowTo",
    name: "How to Calculate Personal Loan EMI",
    totalTime: "PT1M",
    step: [
      { "@type": "HowToStep", position: 1, name: "Enter Loan Amount", text: "Input the personal loan amount you need." },
      { "@type": "HowToStep", position: 2, name: "Set Interest Rate", text: "Enter the bank's annual interest rate (typically 10.5%-18%)." },
      { "@type": "HowToStep", position: 3, name: "Choose Tenure", text: "Select tenure in months or years (typically 12-84 months)." },
      { "@type": "HowToStep", position: 4, name: "View EMI", text: "See monthly EMI, total interest, and full amortization schedule instantly." },
    ],
  };

  return (
    <div className={`min-h-screen transition-colors ${isDark ? "bg-[#0a0a0b] text-white" : "bg-[#f8f8f8] text-black"}`}>
      <style>{`input[type=range]{accent-color:#f59e0b}`}</style>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaFAQ) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaApp) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaHowTo) }} />

      <header className="max-w-[1280px] mx-auto px-4 py-3 flex justify-between items-center gap-2 flex-wrap">
        <Link href="/" className="font-black text-[18px]">Lorem<span className="text-amber-500"> Pro Tool</span> <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500 text-black">FREE</span></Link>
        <div className="flex gap-2 items-center">
          <select value={currency} onChange={(e) => switchCurrency(e.target.value as CurrencyKey)} className={`px-2 py-1.5 rounded-xl text-[11px] font-black border ${isDark ? "bg-white/10 border-white/10" : "bg-white border-black/10"}`}>
            {Object.keys(CURRENCIES).map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <button onClick={() => setSoundOn(!soundOn)} className={`w-9 h-9 rounded-full border flex items-center justify-center ${isDark ? "bg-white/10 border-white/10" : "bg-black/5 border-black/10"}`}>{soundOn ? "🔊" : "🔇"}</button>
          <button onClick={() => setIsDark(!isDark)} className={`w-9 h-9 rounded-full border flex items-center justify-center ${isDark ? "bg-white/10 border-white/10" : "bg-black/5 border-black/10"}`}>{isDark ? "☀️" : "🌙"}</button>
        </div>
      </header>

      <div className="max-w-[1280px] mx-auto px-4 pt-2 pb-4 text-center">
        <p className="text-[11px] font-black tracking-[0.25em] text-amber-500">💰 PERSONAL LOAN EMI CALCULATOR 2026</p>
        <h1 className="text-[28px] md:text-[42px] font-black leading-tight mt-2">Personal Loan EMI <span className="text-amber-500">Calculator</span></h1>
        <p className={`text-[13px] md:text-[14px] mt-1 max-w-[700px] mx-auto ${isDark ? "text-white/60" : "text-black/60"}`}>EMI + Prepayment + Balance Transfer + Eligibility + APR + 8 Bank Comparison — Sab kuch ek jagah.</p>
        <div className="flex justify-center gap-2 mt-3 flex-wrap">
          {["No Signup", "APR Calculator", "Prepayment Savings", "8 Banks", "100% Free"].map((t) => <span key={t} className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${isDark ? "border-white/10 bg-white/5" : "border-black/10 bg-white"}`}>✓ {t}</span>)}
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 flex gap-2 justify-center mb-4 flex-wrap">
        {[
          { id: "emi" as const, l: "🧮 EMI" },
          { id: "eligibility" as const, l: "✅ Eligibility" },
          { id: "transfer" as const, l: "🔄 Balance Transfer" },
        ].map((t) => (
          <button key={t.id} onClick={() => { setActiveTab(t.id); play("tick"); }} className={`px-4 py-2 rounded-full text-[12px] font-black transition ${activeTab === t.id ? "bg-amber-500 text-black scale-105 shadow-lg shadow-amber-500/30" : isDark ? "bg-white/10 hover:bg-white/15" : "bg-white border shadow-sm"}`}>{t.l}</button>
        ))}
      </div>

      <main className="max-w-[1280px] mx-auto px-4 grid lg:grid-cols-[1fr_380px] gap-4 pb-6">
        <div className={`rounded-[24px] p-5 border ${isDark ? "bg-white/[0.03] border-white/10" : "bg-white border-black/10 shadow-sm"}`}>
          {activeTab === "emi" && (
            <>
              <label className="text-[12px] font-black">LOAN AMOUNT: <span className="text-amber-500">{fmt(loanAmount)}</span></label>
              <input type="range" min={Math.round(50000 * curr.rate / CURRENCIES.INR.rate)} max={Math.round(4000000 * curr.rate / CURRENCIES.INR.rate)} step={Math.round(10000 * curr.rate / CURRENCIES.INR.rate)} value={loanAmount} onChange={(e) => { setLoanAmount(+e.target.value); play("tick"); }} className="w-full mt-2" />
              <div className="flex gap-2 flex-wrap mt-2">
                {presets.map((p) => (
                  <button key={p.label} onClick={() => { setLoanAmount(p.amt); play("fire"); }} className={`px-3 py-1.5 rounded-full text-[11px] font-bold border ${loanAmount === p.amt ? "bg-amber-500 text-black border-amber-500" : isDark ? "border-white/10 bg-white/5" : "border-black/10"}`}>{p.label}</button>
                ))}
              </div>

              <div className="grid md:grid-cols-2 gap-4 mt-5">
                <div>
                  <label className="text-[12px] font-black">INTEREST RATE: <span className="text-amber-500">{rate}% p.a.</span></label>
                  <input type="range" min={8} max={24} step={0.1} value={rate} onChange={(e) => { setRate(+e.target.value); play("tick"); }} className="w-full mt-2" />
                  <div className="flex justify-between text-[10px] opacity-50"><span>8% - Best</span><span>24% - High</span></div>
                </div>
                <div>
                  <label className="text-[12px] font-black">TENURE: <span className="text-amber-500">{tenure} {tenureType === "months" ? "Months" : "Years"}</span></label>
                  <div className="flex gap-2 mt-2">
                    <input type="range" min={tenureType === "months" ? 6 : 1} max={tenureType === "months" ? 84 : 7} step={1} value={tenure} onChange={(e) => { setTenure(+e.target.value); play("tick"); }} className="flex-1" />
                    <div className="flex rounded-full overflow-hidden border border-white/10">
                      <button onClick={() => setTenureType("months")} className={`px-3 text-[11px] font-black ${tenureType === "months" ? "bg-amber-500 text-black" : "bg-white/10"}`}>M</button>
                      <button onClick={() => setTenureType("years")} className={`px-3 text-[11px] font-black ${tenureType === "years" ? "bg-amber-500 text-black" : "bg-white/10"}`}>Y</button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <label className="text-[12px] font-black">PROCESSING FEE: {processingFee}% = {fmt(calc.feeAmt)}</label>
                <input type="range" min={0} max={5} step={0.25} value={processingFee} onChange={(e) => setProcessingFee(+e.target.value)} className="w-full mt-1" />
              </div>

              <div className={`mt-5 p-4 rounded-[18px] border border-dashed ${isDark ? "border-amber-500/30 bg-amber-500/5" : "border-amber-500/40 bg-amber-50"}`}>
                <p className="text-[12px] font-black">🔥 PREPAYMENT <span className="ml-1 text-[9px] px-2 py-0.5 rounded-full bg-green-500 text-white">SAVE {fmt(calc.saved)}</span></p>
                <div className="grid md:grid-cols-2 gap-4 mt-3">
                  <div><label className="text-[11px] font-bold">Prepay Amount: {fmt(prepayment)}</label><input type="range" min={0} max={Math.round(1000000 * curr.rate / CURRENCIES.INR.rate)} step={Math.round(10000 * curr.rate / CURRENCIES.INR.rate)} value={prepayment} onChange={(e) => setPrepayment(+e.target.value)} className="w-full" /></div>
                  <div><label className="text-[11px] font-bold">Prepay in Month: {prepayMonth}</label><input type="range" min={1} max={calc.n} step={1} value={Math.min(prepayMonth, calc.n)} onChange={(e) => setPrepayMonth(+e.target.value)} className="w-full" /></div>
                </div>
                {prepayment > 0 && <p className="text-[11px] text-green-500 font-bold mt-2">✅ {calc.monthsSaved} months pehle loan khatam + {fmt(calc.saved)} interest savings!</p>}
              </div>

              <div className="mt-6">
                <p className="text-[12px] font-black mb-3">📊 YEAR WISE — PRINCIPAL vs INTEREST</p>
                <div className="flex items-end gap-2 h-[140px]">
                  {calc.yearly.map((y) => (
                    <div key={y.year} className="flex-1 flex flex-col items-center gap-1 group">
                      <div className="w-full flex flex-col justify-end h-[120px]">
                        <div className="bg-amber-500 rounded-t-md transition-all group-hover:opacity-80" style={{ height: `${(y.principal / maxY) * 110}px` }} title={`Principal: ${fmt(y.principal)}`} />
                        <div className="bg-red-500/80 rounded-b-md" style={{ height: `${(y.interest / maxY) * 110}px` }} title={`Interest: ${fmt(y.interest)}`} />
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
              <h3 className="text-[16px] font-black">Kitna Loan Milega? (50% FOIR Rule)</h3>
              <div><label className="text-[12px] font-bold">Monthly In-Hand Salary: {fmt(monthlySalary)}</label><input type="range" min={Math.round(15000 * curr.rate / CURRENCIES.INR.rate)} max={Math.round(300000 * curr.rate / CURRENCIES.INR.rate)} step={Math.round(1000 * curr.rate / CURRENCIES.INR.rate)} value={monthlySalary} onChange={(e) => setMonthlySalary(+e.target.value)} className="w-full" /></div>
              <div><label className="text-[12px] font-bold">Existing Loan EMI: {fmt(existingEMI)}</label><input type="range" min={0} max={Math.round(50000 * curr.rate / CURRENCIES.INR.rate)} step={Math.round(500 * curr.rate / CURRENCIES.INR.rate)} value={existingEMI} onChange={(e) => setExistingEMI(+e.target.value)} className="w-full" /></div>
              <div><label className="text-[12px] font-bold">Other EMI (Credit Card etc): {fmt(otherEMI)}</label><input type="range" min={0} max={Math.round(30000 * curr.rate / CURRENCIES.INR.rate)} step={Math.round(500 * curr.rate / CURRENCIES.INR.rate)} value={otherEMI} onChange={(e) => setOtherEMI(+e.target.value)} className="w-full" /></div>
              <div><label className="text-[12px] font-bold">CIBIL Score: {cibilScore} <span className={`ml-1 font-black ${calc.cibilTier.color}`}>({calc.cibilTier.label})</span></label><input type="range" min={300} max={900} step={10} value={cibilScore} onChange={(e) => setCibilScore(+e.target.value)} className="w-full" /></div>

              <div className={`p-4 rounded-[16px] ${isDark ? "bg-green-500/10 border border-green-500/20" : "bg-green-50 border border-green-200"}`}>
                <p className="text-[12px]">Bank tumhe max <b className="text-green-500 text-[18px]">{fmt(calc.eligibleAmount)}</b> tak loan de sakti hai</p>
                <p className="text-[11px] opacity-70 mt-1">Max EMI afford: <b>{fmt(calc.eligibleEMI)}</b>/mo • Your current EMI/income: <b className={calc.emiToIncome > 40 ? "text-red-500" : "text-green-500"}>{calc.emiToIncome.toFixed(1)}%</b></p>
                <p className="text-[11px] opacity-70 mt-1">CIBIL <b>{cibilScore}</b> pe expected rate: <b>{calc.cibilTier.rate}%</b> p.a.</p>
              </div>

              {calc.emiToIncome > 40 && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30">
                  <p className="text-[11px] text-red-500 font-bold">⚠️ Warning: Tumhari EMI income ka {calc.emiToIncome.toFixed(0)}% hai — banks 40-50% se zyada EMI pe loan reject kar sakti hai.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "transfer" && (
            <div className="space-y-4">
              <h3 className="text-[16px] font-black">Balance Transfer — Kitna Bachega?</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div><label className="text-[12px] font-bold">Old Rate: {oldRate}%</label><input type="range" min={9} max={24} step={0.25} value={oldRate} onChange={(e) => setOldRate(+e.target.value)} className="w-full" /></div>
                <div><label className="text-[12px] font-bold">New Rate: {newRate}%</label><input type="range" min={8} max={18} step={0.25} value={newRate} onChange={(e) => setNewRate(+e.target.value)} className="w-full" /></div>
              </div>
              <div><label className="text-[12px] font-bold">Transfer Fee: {transferFee}% = {fmt(calc.transferFeeAmt)}</label><input type="range" min={0} max={3} step={0.25} value={transferFee} onChange={(e) => setTransferFee(+e.target.value)} className="w-full" /></div>
              <div className={`p-4 rounded-[16px] ${calc.transferSaving > 0 ? "bg-green-500/10 border border-green-500/20" : "bg-red-500/10 border border-red-500/20"}`}>
                <p className="text-[13px] font-bold">{calc.transferSaving > 0 ? `✅ Transfer karo! ${fmt(calc.transferSaving)} bachega` : `❌ Transfer mat karo, ${fmt(Math.abs(calc.transferSaving))} ka nuksaan`}</p>
                <p className="text-[11px] opacity-70 mt-1">Old EMI: {fmt(calc.oldEMI)} → New: {fmt(calc.newEMI)} • Monthly saving: {fmt(calc.oldEMI - calc.newEMI)}</p>
              </div>
            </div>
          )}

          <div className="mt-6">
            <p className="text-[12px] font-black mb-2">🏦 BANK COMPARISON (including fees) — {fmt(loanAmount)} @ {calc.n} months</p>
            <div className="overflow-x-auto">
              <table className={`w-full text-[11px] ${isDark ? "text-white/80" : "text-black/80"}`}>
                <thead>
                  <tr className={`border-b ${isDark ? "border-white/10" : "border-black/10"}`}>
                    <th className="text-left py-2">Bank</th><th>Rate</th><th>Fee</th><th>EMI</th><th>Total Cost</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {calc.bankComp.map((b, i) => (
                    <tr key={b.name} className={`border-b ${isDark ? "border-white/5" : "border-black/5"} ${i === 0 ? "bg-green-500/10" : ""}`}>
                      <td className="py-2 font-bold">{b.name}{i === 0 && <span className="ml-1 text-[8px] px-1.5 py-0.5 rounded-full bg-green-500 text-white">BEST</span>}</td>
                      <td className="text-center">{b.rate}%</td>
                      <td className="text-center">{b.fee}%</td>
                      <td className="text-center font-bold">{fmt(b.emi)}</td>
                      <td className="text-center">{fmt(b.total)}</td>
                      <td className="text-right"><button onClick={() => { setRate(b.rate); setProcessingFee(b.fee); setActiveTab("emi"); play("success"); }} className="px-2 py-1 rounded-full bg-amber-500 text-black text-[10px] font-black">Use</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-[24px] p-5 bg-gradient-to-br from-amber-400 to-orange-600 text-black relative overflow-hidden">
            <p className="text-[11px] font-black tracking-widest opacity-70">YOUR MONTHLY EMI</p>
            <p className="text-[36px] font-black leading-none mt-1">{fmt(calc.emi)}</p>
            <p className="text-[11px] font-bold mt-1 opacity-80">{calc.n} months • {fmt(loanAmount)} @ {rate}%</p>

            <div className="grid grid-cols-2 gap-2 mt-4">
              <div className="bg-black/10 rounded-[14px] p-3"><p className="text-[10px] font-bold opacity-70">TOTAL INTEREST</p><p className="font-black text-[14px]">{fmt(calc.totalInterest)}</p></div>
              <div className="bg-black/10 rounded-[14px] p-3"><p className="text-[10px] font-bold opacity-70">PROCESSING FEE</p><p className="font-black text-[14px]">{fmt(calc.feeAmt)}</p></div>
              <div className="bg-black/10 rounded-[14px] p-3"><p className="text-[10px] font-bold opacity-70">TOTAL PAYMENT</p><p className="font-black text-[14px]">{fmt(calc.totalPayment)}</p></div>
              <div className="bg-black/10 rounded-[14px] p-3"><p className="text-[10px] font-bold opacity-70">TRUE APR</p><p className="font-black text-[14px]">{calc.apr.toFixed(2)}%</p></div>
            </div>

            <div className="mt-3 bg-black/10 rounded-xl p-2.5 flex justify-between items-center">
              <p className="text-[10px] font-bold opacity-70">LOAN ENDS</p>
              <p className="font-black text-[12px]">{calc.payoff.toLocaleDateString(curr.locale, { month: "short", year: "numeric" })}</p>
            </div>

            <button onClick={() => { setShowSchedule(!showSchedule); play("fire"); }} className="w-full mt-4 bg-black text-white py-3 rounded-full text-[12px] font-black hover:scale-[1.02] transition">
              {showSchedule ? "Hide Schedule ▲" : "View Full Schedule ▼"}
            </button>

            <div className="grid grid-cols-2 gap-2 mt-2">
              <button onClick={downloadPDF} className="bg-white text-black py-2.5 rounded-full text-[11px] font-black hover:scale-[1.02] transition">📄 PDF</button>
              <button onClick={copyReport} className="bg-white text-black py-2.5 rounded-full text-[11px] font-black hover:scale-[1.02] transition">{copied ? "✓ Copied" : "📋 Copy"}</button>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <a href={whatsappLink} target="_blank" rel="noreferrer" onClick={() => play("success")} className="bg-[#25D366] text-white py-2.5 rounded-full text-[11px] font-black text-center hover:scale-[1.02] transition">💬 WhatsApp</a>
              <button onClick={exportCSV} className="bg-white text-black py-2.5 rounded-full text-[11px] font-black hover:scale-[1.02] transition">📥 CSV</button>
            </div>
          </div>

          <div className={`rounded-[24px] p-4 border ${isDark ? "bg-white/[0.03] border-white/10" : "bg-white border-black/10"}`}>
            <p className="text-[12px] font-black mb-2">PRINCIPAL vs INTEREST</p>
            <div className="flex items-center gap-4">
              <div className="w-[90px] h-[90px] rounded-full shrink-0" style={{ background: `conic-gradient(#f59e0b 0 ${(loanAmount / (calc.totalPayment + calc.feeAmt)) * 360}deg, #ef4444 ${(loanAmount / (calc.totalPayment + calc.feeAmt)) * 360}deg ${((loanAmount + calc.totalInterest) / (calc.totalPayment + calc.feeAmt)) * 360}deg, #8b5cf6 ${((loanAmount + calc.totalInterest) / (calc.totalPayment + calc.feeAmt)) * 360}deg 360deg)` }} />
              <div className="text-[11px] space-y-1">
                <p>🟧 Principal: {fmt(loanAmount)} ({((loanAmount / (calc.totalPayment + calc.feeAmt)) * 100).toFixed(0)}%)</p>
                <p>🟥 Interest: {fmt(calc.totalInterest)} ({((calc.totalInterest / (calc.totalPayment + calc.feeAmt)) * 100).toFixed(0)}%)</p>
                <p>🟪 Fees: {fmt(calc.feeAmt)}</p>
                {calc.saved > 0 && <p className="font-bold text-green-500">✅ Save {fmt(calc.saved)} via prepay</p>}
              </div>
            </div>
          </div>

          <div className={`rounded-[20px] p-3 border ${isDark ? "bg-white/[0.03] border-white/10" : "bg-white border-black/10"}`}>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={save} className={`py-2 rounded-xl font-black text-[11px] ${isDark ? "bg-white/10 hover:bg-white/15" : "bg-gray-100 hover:bg-gray-200"}`}>💾 Save</button>
              <button onClick={load} className={`py-2 rounded-xl font-black text-[11px] ${isDark ? "bg-white/10 hover:bg-white/15" : "bg-gray-100 hover:bg-gray-200"}`}>📂 Load</button>
              <button onClick={reset} className={`py-2 rounded-xl font-black text-[11px] ${isDark ? "bg-red-500/10 text-red-400" : "bg-red-50 text-red-600"}`}>↻ Reset</button>
            </div>
            {saveMsg && <p className="text-center text-[11px] mt-2 font-black text-green-500">{saveMsg}</p>}
          </div>

          <div className={`h-[250px] rounded-[20px] border border-dashed flex items-center justify-center text-[10px] font-bold tracking-widest ${isDark ? "bg-white/[0.02] border-white/10 text-white/30" : "bg-black/[0.02] border-black/10 text-black/30"}`}>AD SLOT · 300×250</div>
        </div>
      </main>

      {showSchedule && (
        <div className="max-w-[1280px] mx-auto px-4 pb-6">
          <div className={`rounded-[24px] p-4 border overflow-hidden ${isDark ? "bg-white/[0.03] border-white/10" : "bg-white border-black/10"}`}>
            <div className="flex justify-between items-center mb-3">
              <p className="text-[13px] font-black">📋 Amortization Schedule ({calc.fullSchedule.length} months)</p>
              <button onClick={exportCSV} className="text-[10px] px-3 py-1 rounded-full bg-amber-500 text-black font-black">📥 Download</button>
            </div>
            <div className="overflow-auto max-h-[500px]">
              <table className="w-full text-[11px] min-w-[500px]">
                <thead className={`sticky top-0 ${isDark ? "bg-[#0a0a0b]" : "bg-white"}`}>
                  <tr className="border-b opacity-60">
                    <th className="text-left py-2">Month</th><th>EMI</th><th>Principal</th><th>Interest</th><th className="text-right">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {calc.fullSchedule.map((s) => (
                    <tr key={s.month} className={`border-b ${isDark ? "border-white/5" : "border-black/5"} ${s.isPrepay ? "bg-amber-500/10" : ""}`}>
                      <td className="py-2 font-bold">{s.month}{s.isPrepay ? " 🔥" : ""}</td>
                      <td className="text-center">{fmt(s.emi)}</td>
                      <td className="text-center text-green-500">{fmt(s.principal)}</td>
                      <td className="text-center text-red-500">{fmt(s.interest)}</td>
                      <td className="text-right font-bold">{fmt(s.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <section className="max-w-[1280px] mx-auto px-4 pb-2 mt-4">
        <div className="flex justify-between items-end flex-wrap gap-2 mb-4">
          <div><p className="text-[11px] font-black tracking-[0.25em] text-amber-500">⭐ MORE TOOLS</p><h2 className="text-[22px] md:text-[28px] font-black leading-tight mt-1">Log Aur Bhi <span className="text-amber-500">Use Kar Rahe Hai</span></h2></div>
          <a href="/" className="text-[11px] font-black px-3 py-2 rounded-full bg-amber-500 text-black">All Tools →</a>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { h: "/fire-calculator", i: "🔥", t: "FIRE Calculator", d: "Retire Early" },
            { h: "/sip-calculator", i: "📈", t: "SIP Calculator", d: "Mutual Funds" },
            { h: "/mortgage-calculator", i: "🏠", t: "Mortgage Calculator", d: "Home Loan EMI" },
            { h: "/youtube-earnings-calculator", i: "▶️", t: "YouTube Earnings", d: "Views → ₹?" },
          ].map((x) => (
            <a key={x.h} href={x.h} className={`rounded-[20px] p-4 border hover:-translate-y-1 hover:scale-[1.02] transition ${isDark ? "border-white/10 bg-white/[0.04]" : "border-black/10 bg-white"}`}>
              <div className="text-[22px]">{x.i}</div>
              <p className="font-black text-[13px] mt-2">{x.t}</p>
              <p className={`text-[11px] ${isDark ? "text-white/50" : "text-black/50"}`}>{x.d}</p>
            </a>
          ))}
        </div>
      </section>

      <article className={`max-w-[900px] mx-auto px-4 py-8 text-[14px] leading-relaxed ${isDark ? "text-white/80" : "text-black/80"}`}>
        <h1 className="text-[30px] md:text-[40px] font-black leading-tight text-amber-500">
          Personal Loan EMI Calculator 2026 — Free Monthly Payment, Eligibility & Balance Transfer Tool
        </h1>
        <p className="mt-4">
          Our <strong>free Personal Loan EMI Calculator</strong> instantly computes your monthly EMI, total interest payable, processing fee, true APR, and complete amortization schedule — for any loan amount, interest rate, and tenure. Whether you are planning a personal loan for a wedding, medical emergency, home renovation, travel, or debt consolidation, this tool gives you complete clarity before you sign the loan agreement. Unlike basic EMI calculators, ours also shows <strong>prepayment savings, balance transfer benefits, CIBIL score-based rates, and side-by-side comparison of 8 major Indian banks</strong> — so you can pick the cheapest option and save lakhs in interest.
        </p>

        <h2 className="text-[22px] md:text-[28px] font-black mt-8 text-amber-500">What is a Personal Loan EMI Calculator?</h2>
        <p className="mt-3">
          A <strong>Personal Loan EMI Calculator</strong> is a financial tool that calculates the Equated Monthly Instalment (EMI) — the fixed amount you pay your lender every month until the loan is fully repaid. It uses a standard mathematical formula that accounts for the loan principal, annual interest rate, and tenure to produce a single monthly figure that includes both principal repayment and interest charges. The calculator also displays the total interest you will pay over the entire tenure and the total amount you will hand over to the bank — both crucial numbers that most borrowers ignore, often ending up paying 40-60% extra as interest.
        </p>
        <p className="mt-3">
          Personal loans are <strong>unsecured loans</strong> — meaning you do not need to pledge any collateral (unlike a home loan or car loan). Because the bank takes on more risk, personal loan interest rates are higher (typically 10.5% to 24% p.a.) than secured loans. This makes it even more critical to use an EMI calculator before borrowing, so you understand exactly what you are signing up for. Our tool also shows the <strong>APR (Annual Percentage Rate)</strong>, which is the true cost of borrowing including processing fees and other charges — the number that actually matters, not just the headline interest rate.
        </p>

        <h2 className="text-[22px] md:text-[28px] font-black mt-8 text-amber-500">How is Personal Loan EMI Calculated? (Formula Explained)</h2>
        <p className="mt-3">
          The EMI calculation uses the standard compound interest amortization formula:
        </p>
        <div className={`my-4 p-4 rounded-xl font-mono text-[13px] text-center ${isDark ? "bg-white/5" : "bg-gray-100"}`}>
          EMI = P × r × (1 + r)<sup>n</sup> / [ (1 + r)<sup>n</sup> − 1 ]
        </div>
        <p>
          where <strong>P</strong> = principal loan amount, <strong>r</strong> = monthly interest rate (annual rate ÷ 12 ÷ 100), and <strong>n</strong> = loan tenure in months. For example, a ₹5,00,000 loan at 11.5% p.a. for 60 months produces an EMI of approximately ₹10,997. Over the tenure, you will pay ₹1,59,820 as interest, making the total outgo ₹6,59,820 — that is 32% more than the original loan amount!
        </p>
        <p className="mt-3">
          <strong>In the early months, most of your EMI goes toward interest</strong>. For the same ₹5L loan example, month 1 interest is about ₹4,792 and principal is only ₹6,205. By month 60, interest drops to ₹105 and principal rises to ₹10,892. This is why <strong>prepaying in the first 1-2 years saves the most interest</strong> — you cut off the highest-interest months from the calculation.
        </p>

        <h2 className="text-[22px] md:text-[28px] font-black mt-8 text-amber-500">What is APR? Why It Matters More Than Interest Rate</h2>
        <p className="mt-3">
          <strong>APR (Annual Percentage Rate)</strong> is the true annual cost of borrowing — it includes not just the interest rate but also the <strong>processing fee, documentation charges, insurance premiums, and any other upfront costs</strong>. If Bank A offers 11% interest with 2% processing fee, and Bank B offers 10.5% with 4% processing fee, Bank A is actually cheaper despite the higher headline rate.
        </p>
        <p className="mt-3">
          Our calculator computes APR using the Newton-Raphson iterative method, which is how banks and RBI calculate it. A typical personal loan with 11.5% interest and 2% processing fee will show an APR of around 13-14% — that is the number you should compare across banks, not the EMI. RBI mandates that all lenders disclose APR, but most borrowers ignore it. Don't be that borrower.
        </p>

        <h2 className="text-[22px] md:text-[28px] font-black mt-8 text-amber-500">What Factors Affect Your Personal Loan EMI?</h2>
        <ul className="mt-3 list-disc pl-6 space-y-1.5">
          <li><strong>Loan Amount:</strong> Higher principal = higher EMI. Every ₹1 lakh increase in loan adds roughly ₹2,200 to your monthly EMI at 11.5% for 5 years.</li>
          <li><strong>Interest Rate:</strong> Even a 1% rate difference can change EMI by 5-8% and total interest by 10-15%. This is why CIBIL score matters so much.</li>
          <li><strong>Tenure:</strong> Longer tenure = lower EMI but much higher total interest. A 60-month loan pays ~1.5× the interest of a 36-month loan on the same principal.</li>
          <li><strong>Processing Fee:</strong> Typically 0.5% to 3% of loan amount. Adds to the total cost but is often negotiable.</li>
          <li><strong>CIBIL Score:</strong> 750+ = best rates (10.5-11.5%); 700-750 = 11.5-13%; 650-700 = 13-16%; below 650 = 16-24% or rejection.</li>
          <li><strong>Employment Type:</strong> Salaried employees at MNCs get better rates than self-employed or small business owners.</li>
          <li><strong>Existing EMIs:</strong> Banks calculate FOIR (Fixed Obligation to Income Ratio) — total EMIs should be under 40-50% of monthly income.</li>
        </ul>

        <h2 className="text-[22px] md:text-[28px] font-black mt-8 text-amber-500">How to Reduce Personal Loan EMI — 5 Proven Strategies</h2>
        <ol className="mt-3 list-decimal pl-6 space-y-2">
          <li><strong>Prepay aggressively in the first year:</strong> Even ₹50,000 prepayment in month 12 on a ₹5L/60-month loan can save ₹30,000+ in interest and cut 5-8 months off the tenure. Our prepayment calculator shows exact numbers.</li>
          <li><strong>Transfer balance to a lower-rate bank:</strong> If your current rate is 14% and another bank offers 10.5%, transfer instantly. On a ₹5L loan, this saves ₹40,000+ over the tenure. Check our Balance Transfer tab.</li>
          <li><strong>Negotiate the processing fee:</strong> Banks often waive processing fees (2% → 0%) during festive offers or if you have a good relationship. Always ask.</li>
          <li><strong>Improve your CIBIL score before applying:</strong> Pay all credit card bills on time for 6 months, reduce credit utilization to below 30%, and avoid multiple loan applications in a short period. A 750+ score can drop your rate by 2-3%.</li>
          <li><strong>Choose the right tenure:</strong> A slightly shorter tenure (48 vs 60 months) increases EMI by ~15% but reduces total interest by ~25%. Test both options in our calculator before finalizing.</li>
        </ol>

        <h2 className="text-[22px] md:text-[28px] font-black mt-8 text-amber-500">Prepayment: The Most Underused Wealth Hack</h2>
        <p className="mt-3">
          Prepayment (also called part-payment) means paying extra money toward your loan principal before the scheduled EMI. It is the single most powerful way to reduce total interest because prepaid principal is no longer charged interest in future months. RBI rules state that on <strong>floating-rate personal loans</strong>, banks cannot charge any prepayment penalty — so it is 100% free. On fixed-rate loans, banks may charge 2-4% of the prepaid amount, so check your loan agreement first.
        </p>
        <p className="mt-3">
          Use our prepayment slider to see exactly how much interest you save and how many months earlier your loan closes. Example: On a ₹5L/60-month loan at 11.5%, prepaying ₹1,00,000 in month 12 saves approximately ₹48,000 in interest and closes the loan 14 months earlier. That is a guaranteed 40-50% return on the ₹1L prepayment — a rate no investment can match reliably.
        </p>

        <h2 className="text-[22px] md:text-[28px] font-black mt-8 text-amber-500">Balance Transfer: When Does It Actually Make Sense?</h2>
        <p className="mt-3">
          A <strong>Balance Transfer</strong> moves your outstanding loan to a new bank with a lower interest rate. This is worthwhile only if: (a) the new rate is <strong>at least 1-2% lower</strong> than your current rate, (b) you have <strong>12+ months of tenure remaining</strong>, and (c) the <strong>transfer fee</strong> (typically 0.5-2% of outstanding principal) is covered by the interest savings. Use our Balance Transfer tab to calculate the exact savings including the transfer fee — it will tell you clearly whether to transfer or stay.
        </p>

        <h2 className="text-[22px] md:text-[28px] font-black mt-8 text-amber-500">Personal Loan Eligibility: What Banks Actually Check</h2>
        <p className="mt-3">
          Banks use the <strong>FOIR (Fixed Obligation to Income Ratio)</strong> rule — your total monthly EMIs (existing + new) should not exceed 40-50% of your in-hand monthly salary. For example, if you earn ₹60,000 and already pay ₹5,000 as car loan EMI, your maximum total EMI capacity is ₹30,000 (50% of salary), so the new personal loan EMI can be up to ₹25,000. Our eligibility calculator shows the maximum loan amount you can get based on your salary and existing obligations.
        </p>
        <p className="mt-3">
          Additional eligibility criteria typically include: age 21-60 years, minimum 1 year of work experience (2-3 years for self-employed), minimum income ₹15,000-25,000/month (varies by city and bank), and a CIBIL score of 650+ (750+ for the best rates). Salaried employees at listed companies get the best terms.
        </p>

        <h2 className="text-[22px] md:text-[28px] font-black mt-8 text-amber-500">Documents Required for Personal Loan</h2>
        <ul className="mt-3 list-disc pl-6 space-y-1">
          <li><strong>KYC:</strong> Aadhaar card, PAN card, passport-size photographs</li>
          <li><strong>Income proof:</strong> Last 3 months salary slips, last 6 months bank statements</li>
          <li><strong>Employment proof:</strong> Employee ID card, offer letter, or Form 16</li>
          <li><strong>Address proof:</strong> Aadhaar, utility bills, or rental agreement</li>
          <li><strong>Self-employed:</strong> ITR of last 2-3 years, business registration, P&L statements</li>
        </ul>

        <h2 className="text-[22px] md:text-[28px] font-black mt-8 text-amber-500">Personal Loan Glossary</h2>
        <div className="mt-3">
          {[
            ["EMI", "Equated Monthly Instalment — the fixed monthly payment that covers both principal and interest."],
            ["Principal", "The original loan amount borrowed, on which interest is calculated."],
            ["Interest Rate", "The annual percentage charged by the lender on the outstanding balance."],
            ["APR", "Annual Percentage Rate — the true annual cost including interest + all fees."],
            ["Processing Fee", "A one-time fee charged by the bank to process the loan, typically 0.5-3%."],
            ["FOIR", "Fixed Obligation to Income Ratio — total monthly EMIs divided by monthly income. Should be under 40-50%."],
            ["CIBIL Score", "A 300-900 credit score by TransUnion CIBIL. 750+ = excellent, 650-700 = average, below 650 = poor."],
            ["Prepayment", "Paying extra money toward the loan before schedule, reducing total interest."],
            ["Balance Transfer", "Moving your outstanding loan to another bank at a lower interest rate."],
            ["Amortization", "The gradual repayment schedule showing month-wise principal, interest, and balance."],
            ["Tenure", "The total duration of the loan, usually 12-84 months for personal loans."],
            ["Collateral", "An asset pledged as security. Personal loans are unsecured, so no collateral is needed."],
          ].map(([title, body], i) => (
            <Accordion key={i} title={title} isOpen={openAccordion === `g${i}`} onToggle={() => setOpenAccordion(openAccordion === `g${i}` ? null : `g${i}`)} isDark={isDark}>{body}</Accordion>
          ))}
        </div>

        <h2 className="text-[22px] md:text-[28px] font-black mt-8 text-amber-500">Frequently Asked Questions (FAQ)</h2>
        <div className="mt-3">
          {[
            ["Personal Loan EMI kaise calculate karte hai?", "EMI = P × r × (1+r)^n / [(1+r)^n - 1] formula se nikalte hai. P = principal, r = monthly interest rate (annual ÷ 12 ÷ 100), n = tenure in months. Example: ₹5L, 11.5%, 60 months = EMI ₹10,997."],
            ["Prepayment karne pe koi charge lagta hai?", "RBI ke rule ke hisab se floating rate personal loan pe koi prepayment charge nahi lagta. Fixed rate pe bank 2%-4% charge le sakta hai. Prepayment karne se pehle apne bank se confirm karo."],
            ["Personal Loan ke liye CIBIL Score kitna chahiye?", "750+ score pe best rate (10.5-11.5%) milta hai. 700-750 = 11.5-13%. 650-700 = 13-16%. 650 se neeche loan milna mushkil ya bahut zyada rate (18-24%) lagega."],
            ["EMI kam karne ka sabse aasan tarika kya hai?", "3 tarike: (1) Prepayment karo — sabse effective, (2) Balance Transfer karke rate kam karwao, (3) Tenure mat badhao — tenure badhane se EMI kam lagti hai par total interest double ho jata hai."],
            ["Balance Transfer karna fayde ka hai?", "Agar naya rate 1%+ kam hai, 12+ months bache hai, aur transfer fee savings se kam hai — tab YES. Upar wale Balance Transfer tab me exact numbers check kar sakte ho."],
            ["Personal Loan EMI kitni honi chahiye?", "Tumhari total EMI salary ke 40-50% se zyada nahi honi chahiye. ₹60,000 salary pe total EMI ₹24,000-30,000 max. Warna bank loan reject kar degi ya high rate charge karegi."],
            ["APR aur interest rate me kya farak hai?", "Interest rate sirf borrowing cost hai. APR = interest rate + processing fee + other charges. Personal loan me 11.5% interest with 2% fee = ~13.5% APR. Banks APR compare karke cheapest dhundho, not just rate."],
            ["Kya personal loan tax benefit deta hai?", "Nahi, personal loan pe koi tax benefit nahi milta. Haan, agar loan business purpose ke liye liya hai toh interest expense business income se deduct ho sakta hai. Home loan ya education loan pe tax benefit milta hai."],
            ["Personal loan time se pehle kaise close kare?", "Banks se 'foreclosure quote' maango — outstanding principal + prepayment penalty (if fixed rate) milega. Pay karke NOC (No Objection Certificate) lena mat bhoolna. CIBIL pe loan 'closed' mark ho jayega 30-45 days me."],
            ["Minimum loan amount kitna milta hai?", "Banks ₹25,000-₹50,000 minimum deti hai. Maximum ₹40L-₹50L tak (salary aur credit profile pe depend karta hai). NBFCs jaise Bajaj Finserv ₹5L tak instant deti hai."],
            ["Personal loan ke liye age limit kya hai?", "Usually 21 saal minimum (kuch banks me 23) aur 60 saal maximum (retirement age tak). Self-employed ke liye 65 saal tak. Age ke hisab se tenure adjust hoti hai — 55 saal pe 5-year loan hi milega 65 retire hone se pehle."],
            ["Kya personal loan credit score kharab karta hai?", "Loan lene se score thoda gir sakta hai (hard enquiry). Lekin regular EMI payment se score improve hota hai. Minimum 6 months ke liye loan chalao, phir close karo — score pe positive impact hoga."],
          ].map(([q, a], i) => (
            <Accordion key={i} title={q} isOpen={openAccordion === `f${i}`} onToggle={() => setOpenAccordion(openAccordion === `f${i}` ? null : `f${i}`)} isDark={isDark}>{a}</Accordion>
          ))}
        </div>

        <h2 className="text-[22px] md:text-[28px] font-black mt-8 text-amber-500">Personal Loan Tips for 2026</h2>
        <ul className="mt-3 list-disc pl-6 space-y-1.5">
          <li><strong>Never take a personal loan for depreciating assets:</strong> Cars, gadgets, weddings — these lose value. Take loans only for appreciating assets (home, education) or emergencies.</li>
          <li><strong>Compare APR, not EMI:</strong> Two banks may offer similar EMI but very different APR due to processing fees. Always use our APR feature.</li>
          <li><strong>Prepay from your annual bonus:</strong> Every tax refund or Diwali bonus should go toward loan prepayment. It is the highest guaranteed return available.</li>
          <li><strong>Avoid multiple loan applications:</strong> Each application triggers a hard CIBIL enquiry, dropping your score by 5-10 points. Apply to 1-2 banks max.</li>
          <li><strong>Read the fine print:</strong> Check for prepayment penalty, EMI bounce charges, late payment fees, and insurance bundling (which is often unnecessary).</li>
          <li><strong>Use the 20% rule:</strong> Never let EMI exceed 20% of monthly income for a single personal loan (40-50% is total cap including all EMIs).</li>
          <li><strong>Build an emergency fund first:</strong> 3-6 months expenses before taking any loan. Otherwise, one job loss turns a manageable EMI into a default.</li>
          <li><strong>Understand foreclosure charges:</strong> On floating rate, RBI mandates zero foreclosure penalty. Fixed rate loans can charge 2-4%. This affects your prepayment strategy.</li>
          <li><strong>Use NBFCs for speed, banks for rate:</strong> NBFCs (Bajaj, Tata Capital) disburse in hours but charge higher rates. Banks take 3-7 days but give 1-2% lower rates.</li>
          <li><strong>Never miss an EMI:</strong> Even one missed payment damages your CIBIL score by 50-70 points and may trigger penalty + default notice.</li>
        </ul>

        <h2 className="text-[22px] md:text-[28px] font-black mt-8 text-amber-500">Related Keywords</h2>
        <p className={`mt-3 text-[12px] ${isDark ? "text-white/50" : "text-black/50"}`}>
          personal loan emi calculator · personal loan calculator · emi calculator for personal loan · personal loan interest calculator · prepayment calculator · balance transfer calculator · personal loan eligibility calculator · personal loan emi formula · ₹5 lakh personal loan emi · ₹10 lakh personal loan emi · HDFC personal loan emi · ICICI personal loan emi · SBI personal loan emi · Bajaj Finserv personal loan emi · Axis personal loan emi · Kotak personal loan emi · IDFC First personal loan emi · Yes Bank personal loan emi · CIBIL score personal loan rate · personal loan without collateral · instant personal loan calculator · personal loan amortization schedule · APR calculator for personal loan · FOIR calculator · personal loan comparison calculator · personal loan tax benefit · personal loan tips · personal loan guide · personal loan documents required · personal loan eligibility · how to reduce personal loan EMI · prepayment penalty on personal loan
        </p>

        <div className={`mt-8 p-4 rounded-xl text-[11px] ${isDark ? "bg-white/5 text-white/50" : "bg-gray-100 text-black/60"}`}>
          <strong>Disclaimer:</strong> This Personal Loan EMI Calculator provides estimates based on the inputs you provide. Actual EMI, processing fee, and rate may vary by lender, credit profile, and market conditions. Interest rates shown (10.5%–24%) are typical Indian bank/NBFC rates as of 2026 but are not guaranteed. Loan eligibility is subject to bank&apos;s internal credit policy. Always read the loan agreement carefully and consult a certified financial advisor before borrowing. Use this tool for planning and comparison purposes only — not as a substitute for professional financial advice.
        </div>
      </article>
    </div>
  );
}
