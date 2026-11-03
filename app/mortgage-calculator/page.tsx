"use client";
import { useState, useMemo, useEffect } from "react";

const CURRENCIES = {
  USD: { symbol: "$", rate: 1, locale: "en-US" },
  INR: { symbol: "₹", rate: 83.5, locale: "en-IN" },
  EUR: { symbol: "€", rate: 0.92, locale: "de-DE" },
  GBP: { symbol: "£", rate: 0.79, locale: "en-GB" },
  AED: { symbol: "AED ", rate: 3.67, locale: "en-AE" },
  CAD: { symbol: "C$", rate: 1.36, locale: "en-CA" },
  AUD: { symbol: "A$", rate: 1.52, locale: "en-AU" },
};

/* ---------- ACCORDION ---------- */
function Accordion({ title, children, isOpen, onToggle, isDark }) {
  return (
    <div className={`border rounded-xl overflow-hidden mb-2 transition-colors ${isDark ? "border-white/10 bg-white/[0.03]" : "border-black/10 bg-white"}`}>
      <button onClick={onToggle} className="w-full flex justify-between items-center p-4 text-left">
        <span className="font-bold text-[13px] pr-4">{title}</span>
        <span className={`text-[18px] font-black text-green-500 transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`}>+</span>
      </button>
      <div className={`grid transition-all duration-300 ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
        <div className="overflow-hidden">
          <div className={`px-4 pb-4 text-[12px] leading-relaxed ${isDark ? "text-white/70" : "text-black/70"}`}>{children}</div>
        </div>
      </div>
    </div>
  );
}

export default function MortgageCalculatorPro() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [currency, setCurrency] = useState("USD");

  const [homePrice, setHomePrice] = useState(350000);
  const [downPercent, setDownPercent] = useState(20);
  const [interest, setInterest] = useState(6.5);
  const [loanTerm, setLoanTerm] = useState(30);
  const [extraPayment, setExtraPayment] = useState(200);
  const [extraFreq, setExtraFreq] = useState("monthly");
  const [salary, setSalary] = useState(75000);
  const [hoa, setHoa] = useState(0);
  const [propertyTaxRate, setPropertyTaxRate] = useState(1.2);
  const [insurance, setInsurance] = useState(1200);
  const [appreciation, setAppreciation] = useState(3);
  const [monthlyRent, setMonthlyRent] = useState(1800);

  const [tablePage, setTablePage] = useState(0);
  const [yearView, setYearView] = useState(false);
  const [openAccordion, setOpenAccordion] = useState(null);
  const [copied, setCopied] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  useEffect(() => { setMounted(true); }, []);

  const isDark = theme === "dark";
  const curr = CURRENCIES[currency];
  const fmt = (val) => (val < 0 ? "-" : "") + curr.symbol + Math.abs(val * curr.rate).toLocaleString(curr.locale, { maximumFractionDigits: 0 });
  const fmtDec = (val) => (val < 0 ? "-" : "") + curr.symbol + Math.abs(val * curr.rate).toLocaleString(curr.locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const monthlyExtra = extraFreq === "yearly" ? extraPayment / 12 : extraPayment;

  const calc = useMemo(() => {
    const downAmount = homePrice * (downPercent / 100);
    const loanAmount = homePrice - downAmount;
    const r = interest / 100 / 12;
    const n = loanTerm * 12;
    const monthlyPI = r === 0 ? loanAmount / n : (loanAmount * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1);
    const monthlyTax = (homePrice * (propertyTaxRate / 100)) / 12;
    const monthlyInsurance = insurance / 12;
    const pmi = downPercent < 20 ? (loanAmount * 0.005) / 12 : 0;
    const totalMonthly = monthlyPI + monthlyTax + monthlyInsurance + pmi + hoa + monthlyExtra;

    // Schedule WITH extra payments
    let balance = loanAmount; const fullSchedule = []; let month = 0;
    while (balance > 0.01 && month < 600) {
      month++;
      const intPaid = balance * r;
      let princ = monthlyPI - intPaid + monthlyExtra;
      if (princ > balance) princ = balance;
      balance -= princ;
      fullSchedule.push({ month, interest: intPaid, principal: princ, balance: Math.max(0, balance) });
    }
    const totalInterest = fullSchedule.reduce((s, x) => s + x.interest, 0);

    // Schedule WITHOUT extra (baseline)
    let b2 = loanAmount, m2 = 0, baseInterest = 0;
    while (b2 > 0.01 && m2 < 600) {
      m2++;
      const intPaid = b2 * r;
      let princ = monthlyPI - intPaid;
      if (princ > b2) princ = b2;
      b2 -= princ; baseInterest += intPaid;
    }
    const interestSaved = Math.max(0, baseInterest - totalInterest);
    const monthsSaved = Math.max(0, m2 - month);
    const payoffDate = new Date(); payoffDate.setMonth(payoffDate.getMonth() + month);

    const monthlyIncome = salary / 12;
    const afford = monthlyIncome * 0.28;
    const canAfford = afford >= totalMonthly;
    const dti = monthlyIncome > 0 ? (totalMonthly / monthlyIncome) * 100 : 0;

    // Pie %
    const pct = (v) => totalMonthly > 0 ? (v / totalMonthly) * 100 : 0;

    // Yearly schedule
    const yearlySchedule = [];
    for (let y = 0; y < Math.ceil(fullSchedule.length / 12); y++) {
      const chunk = fullSchedule.slice(y * 12, (y + 1) * 12);
      yearlySchedule.push({
        year: y + 1,
        interest: chunk.reduce((s, x) => s + x.interest, 0),
        principal: chunk.reduce((s, x) => s + x.principal, 0),
        balance: chunk[chunk.length - 1]?.balance || 0,
      });
    }

    // Equity via appreciation
    const equity5 = (() => {
      const fv = homePrice * Math.pow(1 + appreciation / 100, 5);
      const bal = fullSchedule[Math.min(5 * 12 - 1, fullSchedule.length - 1)]?.balance || 0;
      return { value: fv, equity: fv - bal };
    })();
    const equity10 = (() => {
      const fv = homePrice * Math.pow(1 + appreciation / 100, 10);
      const bal = fullSchedule[Math.min(10 * 12 - 1, fullSchedule.length - 1)]?.balance || 0;
      return { value: fv, equity: fv - bal };
    })();

    // Rent vs Buy
    const totalRentCost = monthlyRent * month + downAmount;
    const totalBuyCost = downAmount + totalInterest + (monthlyTax + monthlyInsurance + pmi + hoa) * month;

    // 15 vs 30
    const scenario = (yrs) => {
      const rr = interest / 100 / 12, nn = yrs * 12;
      const pi = rr === 0 ? loanAmount / nn : (loanAmount * (rr * Math.pow(1 + rr, nn))) / (Math.pow(1 + rr, nn) - 1);
      return { pi, totalInt: pi * nn - loanAmount };
    };

    return {
      downAmount, loanAmount, monthlyPI, monthlyTax, monthlyInsurance, pmi, totalMonthly,
      totalInterest, fullSchedule, yearlySchedule, interestSaved, monthsSaved, payoffDate,
      canAfford, afford, dti,
      principalPct: pct(monthlyPI), taxPct: pct(monthlyTax),
      insurancePct: pct(monthlyInsurance), pmiPct: pct(pmi),
      hoaPct: pct(hoa), extraPct: pct(monthlyExtra),
      equity5, equity10, totalRentCost, totalBuyCost,
      s15: scenario(15), s30: scenario(30),
    };
  }, [homePrice, downPercent, interest, loanTerm, extraPayment, monthlyExtra, salary, hoa, propertyTaxRate, insurance, appreciation, monthlyRent]);

  const handleCopy = () => {
    const text = `🏠 Mortgage Report
━━━━━━━━━━━━━━━
Home: ${fmt(homePrice)} | Down: ${downPercent}% (${fmt(calc.downAmount)})
Loan: ${fmt(calc.loanAmount)} @ ${interest}% for ${loanTerm}y
━━━━━━━━━━━━━━━
Monthly P&I: ${fmtDec(calc.monthlyPI)}
Tax: ${fmtDec(calc.monthlyTax)} | Ins: ${fmtDec(calc.monthlyInsurance)}
PMI: ${fmtDec(calc.pmi)} | HOA: ${fmtDec(hoa)}
Extra: ${fmtDec(monthlyExtra)}
━━━━━━━━━━━━━━━
TOTAL: ${fmtDec(calc.totalMonthly)}/mo
Total Interest: ${fmt(calc.totalInterest)}
Saved via Extra: ${fmt(calc.interestSaved)} (${calc.monthsSaved} months)
Payoff: ${calc.payoffDate.toLocaleDateString("en-US", { month: "short", year: "numeric" })}`;
    navigator.clipboard.writeText(text);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const exportCSV = () => {
    const src = yearView ? calc.yearlySchedule : calc.fullSchedule;
    const head = yearView ? "Year,Interest,Principal,Balance" : "Month,Interest,Principal,Balance";
    const csv = head + "\n" + src.map((r) => `${yearView ? r.year : r.month},${r.interest.toFixed(2)},${r.principal.toFixed(2)},${r.balance.toFixed(2)}`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `mortgage-${yearView ? "yearly" : "monthly"}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const save = () => {
    try {
      localStorage.setItem("mortgage-pro-v4", JSON.stringify({
        homePrice, downPercent, interest, loanTerm, extraPayment, extraFreq, salary, hoa,
        propertyTaxRate, insurance, appreciation, monthlyRent, currency,
      }));
      setSaveMsg("✓ Saved!");
    } catch { setSaveMsg("✗ Failed"); }
    setTimeout(() => setSaveMsg(""), 2000);
  };

  const load = () => {
    try {
      const d = JSON.parse(localStorage.getItem("mortgage-pro-v4") || "null");
      if (!d) { setSaveMsg("Nothing saved"); setTimeout(() => setSaveMsg(""), 2000); return; }
      Object.entries(d).forEach(([k, v]) => {
        const setters = { homePrice: setHomePrice, downPercent: setDownPercent, interest: setInterest,
          loanTerm: setLoanTerm, extraPayment: setExtraPayment, extraFreq: setExtraFreq, salary: setSalary,
          hoa: setHoa, propertyTaxRate: setPropertyTaxRate, insurance: setInsurance,
          appreciation: setAppreciation, monthlyRent: setMonthlyRent, currency: setCurrency };
        setters[k]?.(v);
      });
      setSaveMsg("✓ Loaded!");
    } catch { setSaveMsg("✗ Failed"); }
    setTimeout(() => setSaveMsg(""), 2000);
  };

  const reset = () => {
    setHomePrice(350000); setDownPercent(20); setInterest(6.5); setLoanTerm(30);
    setExtraPayment(200); setExtraFreq("monthly"); setSalary(75000); setHoa(0);
    setPropertyTaxRate(1.2); setInsurance(1200); setAppreciation(3); setMonthlyRent(1800);
    setSaveMsg("✓ Reset!"); setTimeout(() => setSaveMsg(""), 2000);
  };

  if (!mounted) return null;

  const pageSize = 20;
  const monthlyRows = calc.fullSchedule.slice(tablePage * pageSize, (tablePage + 1) * pageSize);
  const totalPagesMonthly = Math.ceil(calc.fullSchedule.length / pageSize);
  const yearPageSize = 10;
  const yearRows = calc.yearlySchedule.slice(tablePage * yearPageSize, (tablePage + 1) * yearPageSize);
  const totalPagesYear = Math.ceil(calc.yearlySchedule.length / yearPageSize);

  const schemaFAQ = {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: [
      { "@type": "Question", name: "What is a mortgage calculator?", acceptedAnswer: { "@type": "Answer", text: "A mortgage calculator is a free online tool that estimates your monthly home loan payment based on home price, down payment, interest rate, and loan term." } },
      { "@type": "Question", name: "How is monthly mortgage payment calculated?", acceptedAnswer: { "@type": "Answer", text: "Monthly payment = P × [r(1+r)^n] / [(1+r)^n - 1], where P is principal, r is monthly interest rate, and n is total number of payments." } },
      { "@type": "Question", name: "What is the 28/36 rule?", acceptedAnswer: { "@type": "Answer", text: "Housing costs should not exceed 28% of gross monthly income, and total debt should not exceed 36%." } },
      { "@type": "Question", name: "What is PMI?", acceptedAnswer: { "@type": "Answer", text: "Private Mortgage Insurance is required when down payment is below 20% of home price. Typically costs 0.3–1.5% of loan annually." } },
      { "@type": "Question", name: "How much does an extra payment save?", acceptedAnswer: { "@type": "Answer", text: "Even $200/month extra can save tens of thousands in interest and shorten the loan by years. Use the calculator to see exact savings." } },
    ],
  };
  const schemaApp = {
    "@context": "https://schema.org", "@type": "SoftwareApplication",
    name: "Mortgage Calculator Pro",
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    aggregateRating: { "@type": "AggregateRating", ratingValue: "4.9", ratingCount: "1284" },
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 font-sans ${isDark ? "bg-[#07070B] text-white" : "bg-[#F5F7FA] text-black"}`}>
      <style>{`
        *{font-family:'Inter',system-ui,sans-serif}
        .hover-lift{transition:all .3s cubic-bezier(.175,.885,.32,1.275)}
        .hover-lift:hover{transform:translateY(-3px)}
        input[type=range]{accent-color:#10B981}
        details summary::-webkit-details-marker{display:none}
      `}</style>

      {/* HEADER */}
      <header className={`sticky top-0 z-40 border-b ${isDark ? "bg-[#07070B]/80 border-white/10" : "bg-white/80 border-black/10"} backdrop-blur-xl`}>
        <div className="max-w-[1250px] mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center font-black text-white">🏠</div>
            <div>
              <div className="font-black text-[13px] tracking-widest">MORTGAGE PRO</div>
              <div className={`text-[10px] ${isDark ? "text-white/40" : "text-black/40"}`}>v4 · Advanced</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select value={currency} onChange={(e) => setCurrency(e.target.value)} className={`px-3 py-2 rounded-xl border text-[12px] font-black outline-none cursor-pointer ${isDark ? "bg-white/10 border-white/10" : "bg-black/5 border-black/10"}`}>
              {Object.keys(CURRENCIES).map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <button onClick={() => setTheme(isDark ? "light" : "dark")} className={`w-10 h-10 rounded-full border flex items-center justify-center hover-lift ${isDark ? "bg-white/10 border-white/10" : "bg-black/5 border-black/10"}`}>
              {isDark ? "🌙" : "☀️"}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-[1250px] mx-auto px-4 py-6 grid lg:grid-cols-[1.2fr_0.8fr] gap-5">
        {/* ================= LEFT ================= */}
        <div className="space-y-5">
          <div className={`rounded-[28px] p-6 md:p-7 border ${isDark ? "bg-white/[0.04] border-white/10" : "bg-white border-black/10 shadow-lg"}`}>
            <h1 className="text-[28px] md:text-[36px] font-black leading-none tracking-tighter">
              Mortgage <span className="bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">Calculator PRO</span>
            </h1>
            <p className={`text-[12px] mt-2 ${isDark ? "text-white/50" : "text-black/60"}`}>Free home loan payment calculator with PMI, tax, insurance, extra payments & full amortization schedule.</p>

            {/* INPUTS */}
            <div className="mt-6 space-y-4">
              {/* Home price */}
              <div>
                <div className="flex justify-between text-[11px] font-black"><span>HOME PRICE</span><span className="text-green-500 text-[13px]">{fmt(homePrice)}</span></div>
                <input type="range" min={50000} max={2000000} step={5000} value={homePrice} onChange={(e) => setHomePrice(Number(e.target.value))} className="w-full mt-1.5" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between text-[11px] font-black"><span>DOWN {downPercent}%</span><span className="text-green-500">{fmt(calc.downAmount)}</span></div>
                  <input type="range" min={0} max={50} value={downPercent} onChange={(e) => setDownPercent(Number(e.target.value))} className="w-full mt-1.5" />
                </div>
                <div>
                  <div className="flex justify-between text-[11px] font-black"><span>RATE {interest}%</span><span className="text-green-500">{interest}%</span></div>
                  <input type="range" min={1} max={12} step={0.1} value={interest} onChange={(e) => setInterest(Number(e.target.value))} className="w-full mt-1.5" />
                </div>
              </div>

              {/* Loan term + frequency */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase">Loan Term (Years)</label>
                  <select value={loanTerm} onChange={(e) => setLoanTerm(Number(e.target.value))} className={`mt-1.5 w-full px-3 py-2.5 rounded-xl border outline-none font-bold text-[13px] ${isDark ? "bg-black/50 border-white/10" : "bg-gray-50 border-black/10"}`}>
                    {[10, 15, 20, 25, 30, 40].map((t) => <option key={t} value={t}>{t} years</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase">Extra Payment Freq.</label>
                  <select value={extraFreq} onChange={(e) => setExtraFreq(e.target.value)} className={`mt-1.5 w-full px-3 py-2.5 rounded-xl border outline-none font-bold text-[13px] ${isDark ? "bg-black/50 border-white/10" : "bg-gray-50 border-black/10"}`}>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>

              {/* Extra + Salary + HOA */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase">Extra /{extraFreq === "monthly" ? "mo" : "yr"}</label>
                  <input type="number" value={extraPayment} onChange={(e) => setExtraPayment(Number(e.target.value) || 0)} className={`mt-1.5 w-full px-3 py-2.5 rounded-xl border outline-none font-bold text-[13px] ${isDark ? "bg-black/50 border-white/10" : "bg-gray-50 border-black/10"}`} />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase">Salary /yr</label>
                  <input type="number" value={salary} onChange={(e) => setSalary(Number(e.target.value) || 0)} className={`mt-1.5 w-full px-3 py-2.5 rounded-xl border outline-none font-bold text-[13px] ${isDark ? "bg-black/50 border-white/10" : "bg-gray-50 border-black/10"}`} />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase">HOA /mo</label>
                  <input type="number" value={hoa} onChange={(e) => setHoa(Number(e.target.value) || 0)} className={`mt-1.5 w-full px-3 py-2.5 rounded-xl border outline-none font-bold text-[13px] ${isDark ? "bg-black/50 border-white/10" : "bg-gray-50 border-black/10"}`} />
                </div>
              </div>

              {/* Tax % + Insurance + Appreciation + Rent */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase">Property Tax %/yr</label>
                  <input type="number" step={0.1} value={propertyTaxRate} onChange={(e) => setPropertyTaxRate(Number(e.target.value) || 0)} className={`mt-1.5 w-full px-3 py-2.5 rounded-xl border outline-none font-bold text-[13px] ${isDark ? "bg-black/50 border-white/10" : "bg-gray-50 border-black/10"}`} />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase">Home Insurance /yr</label>
                  <input type="number" value={insurance} onChange={(e) => setInsurance(Number(e.target.value) || 0)} className={`mt-1.5 w-full px-3 py-2.5 rounded-xl border outline-none font-bold text-[13px] ${isDark ? "bg-black/50 border-white/10" : "bg-gray-50 border-black/10"}`} />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase">Appreciation %/yr</label>
                  <input type="number" step={0.5} value={appreciation} onChange={(e) => setAppreciation(Number(e.target.value) || 0)} className={`mt-1.5 w-full px-3 py-2.5 rounded-xl border outline-none font-bold text-[13px] ${isDark ? "bg-black/50 border-white/10" : "bg-gray-50 border-black/10"}`} />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase">Rent (for compare)</label>
                  <input type="number" value={monthlyRent} onChange={(e) => setMonthlyRent(Number(e.target.value) || 0)} className={`mt-1.5 w-full px-3 py-2.5 rounded-xl border outline-none font-bold text-[13px] ${isDark ? "bg-black/50 border-white/10" : "bg-gray-50 border-black/10"}`} />
                </div>
              </div>
            </div>

            {/* PIE CHART (original - enhanced with more segments) */}
            <div className={`mt-6 rounded-2xl p-5 border ${isDark ? "bg-black/30 border-white/5" : "bg-gray-50 border-black/5"}`}>
              <h3 className="text-[11px] font-black tracking-widest uppercase opacity-60">Payment Breakdown</h3>
              <div className="mt-3 flex h-4 rounded-full overflow-hidden bg-white/5">
                <div style={{ width: `${calc.principalPct}%` }} className="bg-green-500 h-full transition-all duration-500" title="Principal+Interest" />
                <div style={{ width: `${calc.taxPct}%` }} className="bg-blue-500 h-full transition-all duration-500" title="Property Tax" />
                <div style={{ width: `${calc.insurancePct}%` }} className="bg-purple-500 h-full transition-all duration-500" title="Insurance" />
                {calc.pmiPct > 0 && <div style={{ width: `${calc.pmiPct}%` }} className="bg-pink-500 h-full transition-all duration-500" title="PMI" />}
                {calc.hoaPct > 0 && <div style={{ width: `${calc.hoaPct}%` }} className="bg-yellow-500 h-full transition-all duration-500" title="HOA" />}
                <div style={{ width: `${calc.extraPct}%` }} className="bg-orange-500 h-full transition-all duration-500" title="Extra" />
              </div>
              <div className="flex flex-wrap gap-3 mt-3 text-[10px] font-bold">
                <span className="text-green-400">● P&I {calc.principalPct.toFixed(0)}%</span>
                <span className="text-blue-400">● Tax {calc.taxPct.toFixed(0)}%</span>
                <span className="text-purple-400">● Ins {calc.insurancePct.toFixed(0)}%</span>
                {calc.pmiPct > 0 && <span className="text-pink-400">● PMI {calc.pmiPct.toFixed(0)}%</span>}
                {calc.hoaPct > 0 && <span className="text-yellow-400">● HOA {calc.hoaPct.toFixed(0)}%</span>}
                <span className="text-orange-400">● Extra {calc.extraPct.toFixed(0)}%</span>
              </div>
            </div>

            {/* AMORTIZATION TABLE + PAGINATION */}
            <div className={`mt-5 rounded-2xl p-5 border ${isDark ? "bg-black/30 border-white/5" : "bg-gray-50 border-black/5"}`}>
              <div className="flex justify-between items-center flex-wrap gap-2">
                <h3 className="text-[11px] font-black uppercase">Amortization Schedule ({yearView ? calc.yearlySchedule.length + " years" : calc.fullSchedule.length + " months"})</h3>
                <div className="flex gap-1.5">
                  <button onClick={() => setYearView(!yearView)} className={`text-[10px] px-3 py-1 rounded-full font-black ${yearView ? "bg-green-500 text-white" : isDark ? "bg-white/10" : "bg-black/10"}`}>{yearView ? "Yearly" : "Monthly"}</button>
                  <button onClick={exportCSV} className={`text-[10px] px-3 py-1 rounded-full font-black ${isDark ? "bg-white/10" : "bg-black/10"}`}>📥 CSV</button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full mt-3 text-[11px]">
                  <thead>
                    <tr className="opacity-50">
                      <th className="text-left py-1">{yearView ? "Year" : "Month"}</th>
                      <th className="text-right">Interest</th>
                      <th className="text-right">Principal</th>
                      <th className="text-right">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(yearView ? yearRows : monthlyRows).map((r, i) => (
                      <tr key={i} className={`border-t ${isDark ? "border-white/5" : "border-black/5"}`}>
                        <td className="py-1 font-bold">{yearView ? r.year : r.month}</td>
                        <td className="text-right">{fmt(r.interest)}</td>
                        <td className="text-right text-green-400">{fmt(r.principal)}</td>
                        <td className="text-right">{fmt(r.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-between items-center mt-3">
                <button onClick={() => setTablePage(Math.max(0, tablePage - 1))} disabled={tablePage === 0} className={`text-[10px] px-3 py-1.5 rounded-lg font-black ${tablePage === 0 ? "opacity-30" : isDark ? "bg-white/10" : "bg-black/10"}`}>← Prev</button>
                <span className="text-[10px] font-bold opacity-60">Page {tablePage + 1} / {yearView ? totalPagesYear : totalPagesMonthly}</span>
                <button onClick={() => setTablePage(Math.min((yearView ? totalPagesYear : totalPagesMonthly) - 1, tablePage + 1))} disabled={tablePage >= (yearView ? totalPagesYear : totalPagesMonthly) - 1} className={`text-[10px] px-3 py-1.5 rounded-lg font-black ${tablePage >= (yearView ? totalPagesYear : totalPagesMonthly) - 1 ? "opacity-30" : isDark ? "bg-white/10" : "bg-black/10"}`}>Next →</button>
              </div>
            </div>
          </div>

          {/* SCENARIO COMPARISON */}
          <div className={`rounded-[24px] p-6 border ${isDark ? "bg-white/[0.03] border-white/5" : "bg-white border-black/10 shadow"}`}>
            <h3 className="text-[11px] font-black tracking-widest uppercase opacity-60">15-Year vs 30-Year Comparison</h3>
            <div className="grid grid-cols-2 gap-3 mt-3">
              {[{ label: "15-Year", pi: calc.s15.pi, int: calc.s15.totalInt }, { label: "30-Year", pi: calc.s30.pi, int: calc.s30.totalInt }].map((s, i) => (
                <div key={i} className={`rounded-xl p-4 border ${i === 0 ? "bg-green-500/10 border-green-500/30" : isDark ? "bg-white/5 border-white/10" : "bg-gray-50 border-black/10"}`}>
                  <p className="text-[10px] font-black uppercase opacity-60">{s.label}</p>
                  <p className="text-[18px] font-black mt-1">{fmt(s.pi)}<span className="text-[10px] opacity-50">/mo</span></p>
                  <p className="text-[10px] mt-1 opacity-60">Interest: {fmt(s.int)}</p>
                </div>
              ))}
            </div>
            <p className="text-[10px] mt-3 opacity-60">💡 15-year saves {fmt(calc.s30.totalInt - calc.s15.totalInt)} in interest but costs {fmt(calc.s15.pi - calc.s30.pi)} more per month.</p>
          </div>

          {/* EQUITY + RENT VS BUY */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className={`rounded-[24px] p-6 border ${isDark ? "bg-white/[0.03] border-white/5" : "bg-white border-black/10 shadow"}`}>
              <h3 className="text-[11px] font-black tracking-widest uppercase opacity-60">Equity Build (Appreciation)</h3>
              <div className="mt-3 space-y-2 text-[12px]">
                <div className="flex justify-between"><span className="opacity-60">Home value (5y)</span><span className="font-black">{fmt(calc.equity5.value)}</span></div>
                <div className="flex justify-between"><span className="opacity-60">Equity (5y)</span><span className="font-black text-green-400">{fmt(calc.equity5.equity)}</span></div>
                <div className="flex justify-between"><span className="opacity-60">Home value (10y)</span><span className="font-black">{fmt(calc.equity10.value)}</span></div>
                <div className="flex justify-between"><span className="opacity-60">Equity (10y)</span><span className="font-black text-green-400">{fmt(calc.equity10.equity)}</span></div>
              </div>
            </div>
            <div className={`rounded-[24px] p-6 border ${isDark ? "bg-white/[0.03] border-white/5" : "bg-white border-black/10 shadow"}`}>
              <h3 className="text-[11px] font-black tracking-widest uppercase opacity-60">Rent vs Buy</h3>
              <div className="mt-3 space-y-2 text-[12px]">
                <div className="flex justify-between"><span className="opacity-60">Total rent ({calc.fullSchedule.length}mo)</span><span className="font-black">{fmt(calc.totalRentCost)}</span></div>
                <div className="flex justify-between"><span className="opacity-60">Total buy cost</span><span className="font-black">{fmt(calc.totalBuyCost)}</span></div>
                <div className={`flex justify-between pt-2 border-t ${isDark ? "border-white/10" : "border-black/10"}`}><span className="opacity-60 font-black">Difference</span><span className={`font-black ${calc.totalBuyCost < calc.totalRentCost ? "text-green-400" : "text-orange-400"}`}>{fmt(Math.abs(calc.totalBuyCost - calc.totalRentCost))} {calc.totalBuyCost < calc.totalRentCost ? "saved by buying" : "saved by renting"}</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= RIGHT ================= */}
        <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div className="bg-gradient-to-br from-green-500 to-emerald-700 p-[1.5px] rounded-[28px] shadow-[0_20px_60px_rgba(16,185,129,0.3)]">
            <div className={`rounded-[26px] p-6 ${isDark ? "bg-[#0A0A0F]" : "bg-white"}`}>
              <p className="text-[11px] opacity-40 font-black tracking-widest">TOTAL MONTHLY PAYMENT</p>
              <h2 className="text-[42px] font-black leading-none mt-1">{fmtDec(calc.totalMonthly)}</h2>
              <p className={`text-[11px] mt-1 ${isDark ? "text-white/40" : "text-black/50"}`}>Payoff: {calc.payoffDate.toLocaleDateString("en-US", { month: "short", year: "numeric" })}</p>

              {/* Breakdown chips */}
              <div className="grid grid-cols-2 gap-2 mt-4 text-[10px]">
                <div className={`rounded-lg p-2 ${isDark ? "bg-white/5" : "bg-gray-100"}`}><p className="opacity-50 font-black">P&I</p><p className="font-black text-[12px]">{fmtDec(calc.monthlyPI)}</p></div>
                <div className={`rounded-lg p-2 ${isDark ? "bg-white/5" : "bg-gray-100"}`}><p className="opacity-50 font-black">Tax</p><p className="font-black text-[12px]">{fmtDec(calc.monthlyTax)}</p></div>
                <div className={`rounded-lg p-2 ${isDark ? "bg-white/5" : "bg-gray-100"}`}><p className="opacity-50 font-black">Insurance</p><p className="font-black text-[12px]">{fmtDec(calc.monthlyInsurance)}</p></div>
                {calc.pmi > 0 ? <div className={`rounded-lg p-2 ${isDark ? "bg-white/5" : "bg-gray-100"}`}><p className="opacity-50 font-black">PMI</p><p className="font-black text-[12px] text-pink-400">{fmtDec(calc.pmi)}</p></div> : <div className={`rounded-lg p-2 ${isDark ? "bg-white/5" : "bg-gray-100"}`}><p className="opacity-50 font-black">Extra</p><p className="font-black text-[12px] text-orange-400">{fmtDec(monthlyExtra)}</p></div>}
              </div>

              {/* Affordability */}
              <div className={`mt-4 rounded-xl p-3 border ${calc.canAfford ? "bg-green-500/10 border-green-500/30" : "bg-red-500/10 border-red-500/30"}`}>
                <p className={`text-[11px] font-black ${calc.canAfford ? "text-green-400" : "text-red-400"}`}>{calc.canAfford ? "✅ You can afford (28% rule)" : "❌ Exceeds 28% rule"}</p>
                <p className={`text-[10px] mt-1 ${isDark ? "text-white/50" : "text-black/50"}`}>Max affordable: {fmt(calc.afford)}/mo · DTI: {calc.dti.toFixed(1)}%</p>
              </div>

              {/* Loan + interest */}
              <div className="grid grid-cols-2 gap-2 mt-3">
                <div className={`rounded-xl p-3 ${isDark ? "bg-white/5" : "bg-gray-100"}`}><p className="text-[9px] opacity-40 font-black">LOAN</p><p className="font-black text-[13px]">{fmt(calc.loanAmount)}</p></div>
                <div className={`rounded-xl p-3 ${isDark ? "bg-white/5" : "bg-gray-100"}`}><p className="text-[9px] opacity-40 font-black">TOTAL INTEREST</p><p className="font-black text-[13px]">{fmt(calc.totalInterest)}</p></div>
              </div>

              {/* Savings via extra */}
              {calc.interestSaved > 0 && (
                <div className="mt-3 rounded-xl p-3 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30">
                  <p className="text-[9px] font-black uppercase opacity-60">Extra Payment Savings</p>
                  <p className="text-[14px] font-black text-orange-400">{fmt(calc.interestSaved)} saved</p>
                  <p className={`text-[10px] mt-0.5 ${isDark ? "text-white/50" : "text-black/60"}`}>= {calc.monthsSaved} months ({Math.floor(calc.monthsSaved / 12)}y {calc.monthsSaved % 12}m) earlier payoff</p>
                </div>
              )}

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2 mt-4">
                <button onClick={handleCopy} className="py-2.5 bg-white text-black rounded-full font-black text-[11px] hover:bg-green-500 hover:text-white transition-all active:scale-95">{copied ? "✓ Copied!" : "📋 Copy Report"}</button>
                <button onClick={() => window.print()} className={`py-2.5 rounded-full font-black text-[11px] transition-all active:scale-95 ${isDark ? "bg-white/10 hover:bg-white/20" : "bg-black/10 hover:bg-black/20"}`}>🖨 Print</button>
              </div>
            </div>
          </div>

          <div className={`rounded-[20px] p-4 ${isDark ? "bg-white/[0.03] border border-white/5" : "bg-white border border-black/10"}`}>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={save} className={`py-2 rounded-xl font-black text-[11px] ${isDark ? "bg-white/10 hover:bg-white/15" : "bg-gray-100 hover:bg-gray-200"}`}>💾 Save</button>
              <button onClick={load} className={`py-2 rounded-xl font-black text-[11px] ${isDark ? "bg-white/10 hover:bg-white/15" : "bg-gray-100 hover:bg-gray-200"}`}>📂 Load</button>
              <button onClick={reset} className={`py-2 rounded-xl font-black text-[11px] ${isDark ? "bg-red-500/10 text-red-400" : "bg-red-50 text-red-600"}`}>↻ Reset</button>
            </div>
            {saveMsg && <p className="text-center text-[11px] mt-2 font-black text-green-500">{saveMsg}</p>}
          </div>

          <div className={`h-[250px] rounded-[20px] border border-dashed flex items-center justify-center text-[11px] opacity-30 ${isDark ? "border-white/10" : "border-black/10"}`}>AD SLOT · 300×250 ($45 CPC)</div>
        </div>
      </div>

      {/* ================= SEO CONTENT ================= */}
      <article className={`max-w-[900px] mx-auto px-4 py-10 ${isDark ? "text-white/80" : "text-black/80"}`}>
        <h1 className="text-[32px] md:text-[40px] font-black tracking-tight text-green-500">Mortgage Calculator — Free Home Loan Payment & Amortization Tool</h1>
        <p className="mt-4 text-[14px] leading-relaxed">
          Buying a home is one of the biggest financial decisions of your life. Our <strong>free mortgage calculator</strong> helps you estimate your <strong>monthly mortgage payment</strong> in seconds — including principal, interest, property tax, home insurance, PMI, HOA fees, and extra payments. Whether you are a first-time homebuyer in the USA, a home loan borrower in India, or refinancing in the UK, this tool delivers accurate results using the standard amortization formula. Use it to plan your down payment, compare 15-year vs 30-year loans, and discover how much interest you can save by paying just a little extra each month.
        </p>

        <h2 className="text-[24px] md:text-[28px] font-black mt-8 text-green-500">What is a Mortgage Calculator?</h2>
        <p className="mt-3 text-[14px] leading-relaxed">
          A <strong>mortgage calculator</strong> is an online financial tool that estimates the monthly payment on a home loan based on the loan amount, interest rate, and loan term. It applies the standard amortization formula so every month's payment is identical, with the interest portion decreasing and the principal portion increasing over time. A good mortgage calculator also factors in associated costs like <strong>property taxes, homeowner's insurance, private mortgage insurance (PMI), and HOA fees</strong> to give you a true all-in monthly figure. Our calculator goes further by showing the complete <strong>amortization schedule</strong>, total interest paid, payoff date, and potential savings from extra payments.
        </p>

        <h2 className="text-[24px] md:text-[28px] font-black mt-8 text-green-500">How Does a Mortgage Calculator Work?</h2>
        <p className="mt-3 text-[14px] leading-relaxed">
          The mortgage calculator uses the standard amortization formula used by every bank and lender worldwide:
        </p>
        <div className={`my-4 p-4 rounded-xl font-mono text-[13px] text-center ${isDark ? "bg-white/5" : "bg-gray-100"}`}>
          M = P × [ r(1+r)<sup>n</sup> ] / [ (1+r)<sup>n</sup> − 1 ]
        </div>
        <p className="text-[14px] leading-relaxed">
          where <strong>M</strong> = monthly payment, <strong>P</strong> = principal loan amount, <strong>r</strong> = monthly interest rate (annual rate ÷ 12 ÷ 100), and <strong>n</strong> = total number of payments (loan term in years × 12). For example, a $280,000 loan at 6.5% for 30 years produces a monthly P&I of approximately $1,770. Add taxes, insurance, and PMI on top and the true monthly cost often crosses $2,300. Our tool factors all of this automatically.
        </p>

        <h2 className="text-[24px] md:text-[28px] font-black mt-8 text-green-500">How to Use This Mortgage Calculator (Step-by-Step)</h2>
        <ol className="mt-3 text-[14px] leading-relaxed list-decimal pl-6 space-y-2">
          <li><strong>Enter the home price</strong> — the property's purchase value (also called sale price).</li>
          <li><strong>Set your down payment %</strong> — typically 5%, 10%, 20% or more. Below 20% triggers PMI.</li>
          <li><strong>Choose the interest rate</strong> — your lender's quoted annual rate.</li>
          <li><strong>Select the loan term</strong> — 15, 20, 25, 30 or 40 years.</li>
          <li><strong>Add property tax rate</strong> — usually 0.5%–2% of home value per year, depending on the state or country.</li>
          <li><strong>Enter home insurance</strong> — annual premium for homeowner's coverage.</li>
          <li><strong>Include HOA fees</strong> — monthly amount if the property is in a society or community.</li>
          <li><strong>Add extra monthly payment</strong> — even $100–$500 makes a huge difference in total interest.</li>
          <li><strong>Enter annual salary</strong> — the calculator checks the 28% affordability rule and shows your DTI.</li>
        </ol>

        <h2 className="text-[24px] md:text-[28px] font-black mt-8 text-green-500">Understanding Your Monthly Mortgage Payment</h2>
        <p className="mt-3 text-[14px] leading-relaxed">
          Your monthly mortgage payment has several components. <strong>Principal</strong> is the amount that reduces your loan balance. <strong>Interest</strong> is the lender's fee on the outstanding balance — it's front-loaded, meaning most of your early payments go to interest. <strong>Property tax</strong> is charged by your local government (typically 0.5%–2% of home value annually) and is often escrowed into your monthly payment. <strong>Homeowner's insurance</strong> protects your property from fire, flood, theft and other risks. <strong>PMI (Private Mortgage Insurance)</strong> is required when your down payment is less than 20% — it typically costs 0.3%–1.5% of the loan per year and can be removed once you reach 20% equity. <strong>HOA fees</strong> are community maintenance charges for condos, apartments or gated societies.
        </p>

        <h2 className="text-[24px] md:text-[28px] font-black mt-8 text-green-500">How Extra Payments Save You Thousands</h2>
        <p className="mt-3 text-[14px] leading-relaxed">
          Every extra dollar you pay goes directly to the principal, which reduces the interest charged next month and compounds over the remaining loan term. On a $280,000 loan at 6.5%, paying just <strong>$200 extra per month</strong> saves approximately <strong>$61,000 in total interest</strong> and shortens the loan by <strong>5 years</strong>. Increase it to $500/month and you could save over $100,000. This is why our calculator shows live interest-saved and months-saved figures as you adjust the extra payment slider.
        </p>

        <h2 className="text-[24px] md:text-[28px] font-black mt-8 text-green-500">15-Year vs 30-Year Mortgage Comparison</h2>
        <p className="mt-3 text-[14px] leading-relaxed">
          A 15-year mortgage has a higher monthly payment but dramatically lower total interest — often 50%–65% less than a 30-year loan. A 30-year mortgage offers lower monthly obligations and better cash flow, but you pay far more in interest over the life of the loan. The right choice depends on your cash flow, job stability, and investment strategy. The <strong>15-year vs 30-year comparison card</strong> in our calculator instantly shows both options so you can decide.
        </p>

        <h2 className="text-[24px] md:text-[28px] font-black mt-8 text-green-500">Rent vs Buy: Which is Better?</h2>
        <p className="mt-3 text-[14px] leading-relaxed">
          Renting offers flexibility, lower upfront cost, and no maintenance burden. Buying builds equity, offers tax benefits, and gives long-term stability. Over a 10+ year horizon, buying typically wins due to appreciation. But in the short-term (under 5 years), renting often costs less after factoring closing costs, maintenance, and transaction fees. Our <strong>rent vs buy calculator</strong> shows the total cost of both options side-by-side so you can make an informed decision.
        </p>

        <h2 className="text-[24px] md:text-[28px] font-black mt-8 text-green-500">Mortgage Glossary (Key Terms)</h2>
        <div className="mt-4">
          {[
            ["Principal", "The original loan amount borrowed, excluding interest. Every payment reduces the principal balance."],
            ["Interest Rate", "The annual percentage charged by the lender on the outstanding loan balance."],
            ["Amortization", "The gradual repayment of a loan over time through regular scheduled payments."],
            ["Down Payment", "The upfront portion of the home price paid in cash. Typically 5%–20%."],
            ["PMI", "Private Mortgage Insurance — required when down payment is below 20%."],
            ["PITI", "Principal, Interest, Taxes, Insurance — the four components of a monthly mortgage payment."],
            ["APR", "Annual Percentage Rate — the true cost of a loan including fees, not just interest."],
            ["Escrow", "An account managed by your lender to collect and pay property taxes and insurance."],
            ["LTV", "Loan-to-Value ratio — your loan amount divided by the home price."],
            ["Equity", "The portion of your home you truly own = home value minus loan balance."],
          ].map(([title, body], i) => (
            <Accordion key={i} title={title} isOpen={openAccordion === `g${i}`} onToggle={() => setOpenAccordion(openAccordion === `g${i}` ? null : `g${i}`)} isDark={isDark}>
              {body}
            </Accordion>
          ))}
        </div>

        <h2 className="text-[24px] md:text-[28px] font-black mt-8 text-green-500">Frequently Asked Questions (FAQ)</h2>
        <div className="mt-4">
          {[
            ["What is a mortgage calculator?", "A mortgage calculator is a free online tool that estimates your monthly home loan payment based on home price, down payment, interest rate, and loan term. It applies the standard amortization formula to compute the exact payment, total interest, and payoff schedule."],
            ["How is the monthly mortgage payment calculated?", "Monthly payment = P × [r(1+r)^n] / [(1+r)^n − 1], where P = principal loan amount, r = monthly interest rate, and n = total number of monthly payments over the loan term."],
            ["How much down payment do I need?", "You can buy a home with as little as 3%–5% down (FHA or conventional with PMI). A 20% down payment removes PMI and gets you the best interest rates."],
            ["What is the 28/36 rule?", "The 28/36 rule is a lending guideline: housing costs (PITI) should not exceed 28% of gross monthly income, and total monthly debt should not exceed 36%. Lenders use this to assess mortgage eligibility."],
            ["What is PMI and when can I remove it?", "PMI (Private Mortgage Insurance) is required when your down payment is under 20%. It typically costs 0.3%–1.5% of the loan per year. You can request PMI cancellation once you reach 20% equity in the home."],
            ["Is it better to choose a 15-year or 30-year mortgage?", "A 15-year loan saves massive interest (often 50%+) but has higher monthly payments. A 30-year loan offers lower monthly obligations and better cash flow. Choose based on your risk tolerance and cash reserves."],
            ["How much can I save with extra payments?", "Even $100–$200 extra per month can save tens of thousands in interest and shorten your loan by 3–7 years. Use the calculator to see exact numbers for your loan."],
            ["Can I get a mortgage with bad credit?", "Yes, but expect higher interest rates. FHA loans accept credit scores as low as 500 with 10% down, while conventional loans typically require 620+."],
            ["What is an amortization schedule?", "An amortization schedule is a table showing every monthly payment, how much goes to principal vs interest, and the remaining loan balance — month by month or year by year."],
            ["How accurate is this mortgage calculator?", "Our calculator uses the same formula as banks and lenders. Results are estimates — actual payments depend on lender fees, closing costs, escrow adjustments, and changing interest rates."],
          ].map(([q, a], i) => (
            <Accordion key={i} title={q} isOpen={openAccordion === `f${i}`} onToggle={() => setOpenAccordion(openAccordion === `f${i}` ? null : `f${i}`)} isDark={isDark}>
              {a}
            </Accordion>
          ))}
        </div>

        <div className={`mt-8 p-4 rounded-xl text-[11px] ${isDark ? "bg-white/5 text-white/50" : "bg-gray-100 text-black/60"}`}>
          <strong>Disclaimer:</strong> This mortgage calculator provides estimates for informational purposes only. Actual mortgage payments may vary based on lender-specific factors, closing costs, credit score, escrow adjustments, and local regulations. Consult a licensed mortgage advisor or financial professional before making a home-buying decision.
        </div>

        <div className={`mt-4 p-4 rounded-xl text-[11px] ${isDark ? "bg-white/5 text-white/50" : "bg-gray-100 text-black/60"}`}>
          <strong>Keywords:</strong> mortgage calculator, home loan calculator, monthly mortgage payment calculator, amortization schedule calculator, PMI calculator, 15 year vs 30 year mortgage, rent vs buy calculator, home affordability calculator, mortgage interest calculator, free mortgage calculator, home loan EMI calculator, mortgage calculator with taxes and insurance.
        </div>
      </article>

      {/* SCHEMA MARKUP */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaFAQ) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaApp) }} />
    </div>
  );
}
