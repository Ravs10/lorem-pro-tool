"use client";
import { useState, useMemo, useEffect } from "react";

const FX = { INR: 1, USD: 1 / 83.5 };

const fmt = (n, c) => {
  if (!isFinite(n) || isNaN(n)) return c === "INR" ? "₹0" : "$0";
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (c === "INR") {
    if (abs >= 1e7) return `${sign}₹${(abs / 1e7).toFixed(2)} Cr`;
    if (abs >= 1e5) return `${sign}₹${(abs / 1e5).toFixed(2)} L`;
    return sign + new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(abs);
  }
  return sign + new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(abs);
};

const fmtFull = (n, c) => c === "INR"
  ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(n)
  : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(n);

const TAX_TYPES = {
  INR: [
    { id: "equity", label: "Equity MF — 12.5% LTCG (₹1.25L exempt)" },
    { id: "debt", label: "Debt MF — 30% slab rate" },
    { id: "none", label: "No tax (tax-free / NRI)" },
  ],
  USD: [
    { id: "long", label: "Long-term (15% LTCG, held >1yr)" },
    { id: "short", label: "Short-term (37% ordinary)" },
    { id: "none", label: "No tax" },
  ],
};

function Accordion({ title, children, isOpen, onToggle, isDark }) {
  return (
    <div className={`border rounded-xl overflow-hidden mb-2 ${isDark ? "border-white/10 bg-white/[0.03]" : "border-black/10 bg-white"}`}>
      <button onClick={onToggle} className="w-full flex justify-between items-center p-4 text-left">
        <span className="font-bold text-[13px] pr-4">{title}</span>
        <span className={`text-[18px] font-black text-[#10B981] transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`}>+</span>
      </button>
      <div className={`grid transition-all duration-300 ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
        <div className="overflow-hidden">
          <div className={`px-4 pb-4 text-[12px] leading-relaxed ${isDark ? "text-white/70" : "text-black/70"}`}>{children}</div>
        </div>
      </div>
    </div>
  );
}

export default function SipCalculatorProMax() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [currency, setCurrency] = useState("INR");
  const [mode, setMode] = useState("BOTH");
  const [monthlySip, setMonthlySip] = useState(25000);
  const [lumpsum, setLumpsum] = useState(500000);
  const [years, setYears] = useState(15);
  const [returnRate, setReturnRate] = useState(12);
  const [stepUp, setStepUp] = useState(10);
  const [inflation, setInflation] = useState(6);
  const [expense, setExpense] = useState(1);
  const [exitLoad, setExitLoad] = useState(0);
  const [target, setTarget] = useState(10000000);
  const [taxType, setTaxType] = useState("equity");
  const [tablePage, setTablePage] = useState(0);
  const [openAccordion, setOpenAccordion] = useState(null);
  const [copied, setCopied] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  useEffect(() => { setMounted(true); }, []);

  const isDark = theme === "dark";

  // -------- FIXED CURRENCY SWITCH (converts values) --------
  const switchCurrency = (newCur) => {
    if (newCur === currency) return;
    const rate = FX[newCur] / FX[currency];
    setMonthlySip(Math.max(500, Math.round(monthlySip * rate / 10) * 10));
    setLumpsum(Math.round(lumpsum * rate / 500) * 500);
    setTarget(Math.round(target * rate / 1000) * 1000);
    setCurrency(newCur);
    setTaxType(newCur === "USD" ? "long" : "equity");
    setTablePage(0);
  };

  // -------- SLIDER SCALES (adaptive per currency) --------
  const isINR = currency === "INR";
  const sliders = {
    sip: { min: isINR ? 500 : 10, max: isINR ? 200000 : 2500, step: isINR ? 500 : 10 },
    lump: { min: 0, max: isINR ? 10000000 : 120000, step: isINR ? 50000 : 500 },
    target: { min: isINR ? 1000000 : 12000, max: isINR ? 100000000 : 1200000, step: isINR ? 100000 : 1000 },
  };

  // -------- TAX CALCULATOR --------
  const calcTax = (gain) => {
    if (gain <= 0) return 0;
    if (currency === "INR") {
      if (taxType === "equity") return Math.max(0, (gain - 125000) * 0.125);
      if (taxType === "debt") return gain * 0.30;
      return 0;
    }
    if (taxType === "long") return gain * 0.15;
    if (taxType === "short") return gain * 0.37;
    return 0;
  };

  // -------- MASTER CALCULATION (mode-fixed) --------
  const data = useMemo(() => {
    const isSipMode = mode === "SIP" || mode === "BOTH";
    const isLumpsumMode = mode === "LUMPSUM" || mode === "BOTH";
    const effMonthlySip = isSipMode ? monthlySip : 0;
    const effLumpsum = isLumpsumMode ? lumpsum : 0;

    const effRate = returnRate - expense;
    const monthlyRate = effRate / 12 / 100;
    const totalMonths = years * 12;

    let table = [];
    let total = effLumpsum;
    let invested = effLumpsum;
    let curSip = effMonthlySip;
    let totalSipInvested = 0;

    for (let y = 1; y <= years; y++) {
      let yearlySip = 0;
      for (let m = 0; m < 12; m++) {
        if (y > 1 && m === 0 && stepUp > 0) curSip *= (1 + stepUp / 100);
        total = (total + curSip) * (1 + monthlyRate);
        yearlySip += curSip;
        totalSipInvested += curSip;
      }
      invested += yearlySip;
      const gain = total - invested;
      const tax = calcTax(gain);
      const exitLoadAmt = total * (exitLoad / 100);
      table.push({
        year: y, sipPerMonth: curSip, invested, total,
        gain, tax, exitLoad: exitLoadAmt,
        net: total - tax - exitLoadAmt,
        inflationAdj: total / Math.pow(1 + inflation / 100, y),
      });
    }

    const final = table[table.length - 1] || {
      total: effLumpsum, invested: effLumpsum, gain: 0, tax: 0,
      exitLoad: 0, net: effLumpsum, inflationAdj: effLumpsum,
    };

    // CAGR & absolute return
    const absoluteReturn = final.invested > 0 ? ((final.total - final.invested) / final.invested) * 100 : 0;
    const cagr = final.invested > 0 && years > 0
      ? (Math.pow(final.total / final.invested, 1 / years) - 1) * 100
      : 0;

    // Goal SIP needed (accounts for current lumpsum)
    const lumpsumFV = effLumpsum * Math.pow(1 + monthlyRate, totalMonths);
    const remaining = Math.max(0, target - lumpsumFV);
    const sipNeeded = remaining === 0 ? 0
      : (remaining * monthlyRate) / ((Math.pow(1 + monthlyRate, totalMonths) - 1) * (1 + monthlyRate));

    // Goal status
    const goalAchieved = final.total >= target;
    const goalPct = target > 0 ? Math.min(100, (final.total / target) * 100) : 0;
    const shortfall = Math.max(0, target - final.total);

    // SIP vs Lumpsum comparison (same total capital over period)
    const totalSipCapital = effMonthlySip > 0 ? effMonthlySip * totalMonths : 0;
    const lumpsumEqCapital = totalSipCapital + effLumpsum;
    const lumpEquivalentFV = lumpsumEqCapital * Math.pow(1 + monthlyRate, totalMonths);

    // Monthly first-year breakdown
    const monthlyBreak = [];
    if (isSipMode || isLumpsumMode) {
      let mb = effLumpsum;
      let mSip = effMonthlySip;
      for (let m = 1; m <= 12; m++) {
        mb = (mb + mSip) * (1 + monthlyRate);
        const inv = effLumpsum + mSip * m;
        monthlyBreak.push({ month: m, invested: inv, value: mb, gain: mb - inv });
      }
    }

    return {
      table, final, absoluteReturn, cagr, sipNeeded, goalAchieved, goalPct, shortfall,
      monthlyBreak, totalSipCapital, lumpsumEqCapital, lumpEquivalentFV,
      effMonthlySip, effLumpsum, isSipMode, isLumpsumMode,
      investedPct: final.total > 0 ? (final.invested / final.total) * 100 : 0,
      gainPct: final.total > 0 ? ((final.total - final.invested) / final.total) * 100 : 0,
    };
  }, [mode, monthlySip, lumpsum, years, returnRate, stepUp, inflation, expense, exitLoad, target, currency, taxType]);

  // -------- ACTIONS --------
  const exportCSV = () => {
    let csv = "Year,Invested,Value,Gain,TaxIfRedeemed,ExitLoad,NetAfterTax,InflationAdjusted\n";
    data.table.forEach((r) => {
      csv += `${r.year},${r.invested.toFixed(2)},${r.total.toFixed(2)},${r.gain.toFixed(2)},${r.tax.toFixed(2)},${r.exitLoad.toFixed(2)},${r.net.toFixed(2)},${r.inflationAdj.toFixed(2)}\n`;
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `sip-${currency}-${years}y.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const copyReport = () => {
    const text = `📊 SIP Calculator Report (${currency})
━━━━━━━━━━━━━━━━━
Mode: ${mode}
${data.isSipMode ? `Monthly SIP: ${fmt(monthlySip, currency)}\n` : ""}${data.isLumpsumMode ? `Lumpsum: ${fmt(lumpsum, currency)}\n` : ""}Duration: ${years} years @ ${returnRate}% return (${expense}% expense)
Step-up: ${stepUp}% | Inflation: ${inflation}% | Tax: ${taxType}
━━━━━━━━━━━━━━━━━
Invested: ${fmt(data.final.invested, currency)}
Future Value: ${fmt(data.final.total, currency)}
Gain: ${fmt(data.final.gain, currency)}
Tax: ${fmt(data.final.tax, currency)}
Net: ${fmt(data.final.net, currency)}
CAGR: ${data.cagr.toFixed(2)}%
Today's Value: ${fmt(data.final.inflationAdj, currency)}
━━━━━━━━━━━━━━━━━
Goal: ${fmt(target, currency)} — ${data.goalAchieved ? "✅ ACHIEVED" : "❌ Shortfall " + fmt(data.shortfall, currency)}`;
    navigator.clipboard.writeText(text);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const save = () => {
    try {
      localStorage.setItem("sip-pro-v2", JSON.stringify({
        currency, mode, monthlySip, lumpsum, years, returnRate, stepUp,
        inflation, expense, exitLoad, target, taxType, theme,
      }));
      setSaveMsg("✓ Saved!");
    } catch { setSaveMsg("✗ Failed"); }
    setTimeout(() => setSaveMsg(""), 2000);
  };

  const load = () => {
    try {
      const d = JSON.parse(localStorage.getItem("sip-pro-v2") || "null");
      if (!d) { setSaveMsg("Nothing saved"); setTimeout(() => setSaveMsg(""), 2000); return; }
      setCurrency(d.currency); setMode(d.mode); setMonthlySip(d.monthlySip);
      setLumpsum(d.lumpsum); setYears(d.years); setReturnRate(d.returnRate);
      setStepUp(d.stepUp); setInflation(d.inflation); setExpense(d.expense);
      setExitLoad(d.exitLoad); setTarget(d.target); setTaxType(d.taxType);
      setTheme(d.theme || "dark"); setSaveMsg("✓ Loaded!");
    } catch { setSaveMsg("✗ Failed"); }
    setTimeout(() => setSaveMsg(""), 2000);
  };

  const reset = () => {
    setCurrency("INR"); setMode("BOTH"); setMonthlySip(25000); setLumpsum(500000);
    setYears(15); setReturnRate(12); setStepUp(10); setInflation(6);
    setExpense(1); setExitLoad(0); setTarget(10000000); setTaxType("equity");
    setSaveMsg("✓ Reset!"); setTimeout(() => setSaveMsg(""), 2000);
  };

  if (!mounted) return null;

  // Pagination
  const pageSize = 10;
  const totalPages = Math.ceil(data.table.length / pageSize);
  const pageRows = data.table.slice(tablePage * pageSize, (tablePage + 1) * pageSize);

  // Bar chart max
  const maxBarValue = Math.max(...data.table.map((r) => r.total), 1);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? "bg-[#07070B] text-white" : "bg-[#F5F7FA] text-black"}`}>
      <style>{`
        *{font-family:'Inter',system-ui,sans-serif}
        input[type=range]{accent-color:#10B981}
      `}</style>

      {/* HEADER */}
      <header className={`sticky top-0 z-40 border-b backdrop-blur-xl ${isDark ? "bg-[#07070B]/80 border-white/10" : "bg-white/80 border-black/10"}`}>
        <div className="max-w-[1250px] mx-auto px-4 py-3 flex justify-between items-center flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10B981] to-emerald-700 flex items-center justify-center font-black text-black">₹</div>
            <div>
              <div className="font-black text-[13px] tracking-widest">SIP CALC PRO MAX</div>
              <div className={`text-[10px] ${isDark ? "text-white/40" : "text-black/40"}`}>v2.0 · Step-up + Tax + CAGR</div>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <div className="flex gap-1 bg-black/20 rounded-full p-1">
              {["INR", "USD"].map((c) => (
                <button key={c} onClick={() => switchCurrency(c)} className={`px-3 py-1.5 rounded-full text-[11px] font-black transition ${currency === c ? "bg-white text-black" : isDark ? "text-white/60" : "text-black/60"}`}>
                  {c === "INR" ? "₹ INR" : "$ USD"}
                </button>
              ))}
            </div>
            <button onClick={() => setTheme(isDark ? "light" : "dark")} className={`w-10 h-10 rounded-full border flex items-center justify-center ${isDark ? "bg-white/10 border-white/10" : "bg-black/5 border-black/10"}`}>
              {isDark ? "🌙" : "☀️"}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-[1250px] mx-auto px-4 py-6">
        <div className="text-center mb-6">
          <p className="text-[#10B981] font-bold text-[11px] tracking-widest">FREE · CLIENT-SIDE · NO SIGNUP · 2025 UPDATED</p>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight mt-1">SIP Calculator <span className="text-[#10B981]">PRO MAX 2025</span></h1>
          <p className={`text-[12px] mt-2 ${isDark ? "text-white/50" : "text-black/50"}`}>Step-up SIP + LTCG Tax + Expense Ratio + Inflation + CAGR + Goal Planner + CSV</p>
        </div>

        <div className="grid lg:grid-cols-12 gap-5">
          {/* LEFT CONTROLS */}
          <div className={`lg:col-span-4 rounded-2xl p-5 space-y-4 h-fit lg:sticky lg:top-20 ${isDark ? "bg-zinc-900/60 border border-zinc-800" : "bg-white border border-black/10 shadow-lg"}`}>
            {/* Mode */}
            <div className="grid grid-cols-3 gap-1 bg-black/20 rounded-full p-1">
              {["SIP", "BOTH", "LUMPSUM"].map((m) => (
                <button key={m} onClick={() => setMode(m)} className={`py-1.5 rounded-full text-[11px] font-black transition ${mode === m ? "bg-[#10B981] text-black" : isDark ? "text-zinc-400" : "text-black/60"}`}>
                  {m}
                </button>
              ))}
            </div>

            {/* SIP slider */}
            {data.isSipMode && (
              <div>
                <div className="flex justify-between text-[11px]">
                  <span className={isDark ? "text-zinc-400" : "text-black/60"}>Monthly SIP</span>
                  <span className="text-[#10B981] font-black">{fmt(monthlySip, currency)}</span>
                </div>
                <input type="range" min={sliders.sip.min} max={sliders.sip.max} step={sliders.sip.step} value={monthlySip} onChange={(e) => setMonthlySip(Number(e.target.value))} className="w-full mt-1" />
              </div>
            )}

            {/* Lumpsum slider */}
            {data.isLumpsumMode && (
              <div>
                <div className="flex justify-between text-[11px]">
                  <span className={isDark ? "text-zinc-400" : "text-black/60"}>Lumpsum</span>
                  <span className="text-[#10B981] font-black">{fmt(lumpsum, currency)}</span>
                </div>
                <input type="range" min={sliders.lump.min} max={sliders.lump.max} step={sliders.lump.step} value={lumpsum} onChange={(e) => setLumpsum(Number(e.target.value))} className="w-full mt-1" />
              </div>
            )}

            {/* Grid of 4 */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex justify-between text-[10px]"><span className={isDark ? "text-zinc-400" : "text-black/60"}>Years</span><span className="font-black">{years}Y</span></div>
                <input type="range" min={1} max={40} value={years} onChange={(e) => setYears(Number(e.target.value))} className="w-full mt-1" />
              </div>
              <div>
                <div className="flex justify-between text-[10px]"><span className={isDark ? "text-zinc-400" : "text-black/60"}>Return</span><span className="font-black">{returnRate}%</span></div>
                <input type="range" min={1} max={30} step={0.5} value={returnRate} onChange={(e) => setReturnRate(Number(e.target.value))} className="w-full mt-1" />
              </div>
              <div>
                <div className="flex justify-between text-[10px]"><span className={isDark ? "text-zinc-400" : "text-black/60"}>Step-up</span><span className="font-black">{stepUp}%</span></div>
                <input type="range" min={0} max={25} value={stepUp} onChange={(e) => setStepUp(Number(e.target.value))} className="w-full mt-1" />
              </div>
              <div>
                <div className="flex justify-between text-[10px]"><span className={isDark ? "text-zinc-400" : "text-black/60"}>Expense</span><span className="font-black">{expense}%</span></div>
                <input type="range" min={0} max={3} step={0.1} value={expense} onChange={(e) => setExpense(Number(e.target.value))} className="w-full mt-1" />
              </div>
              <div>
                <div className="flex justify-between text-[10px]"><span className={isDark ? "text-zinc-400" : "text-black/60"}>Inflation</span><span className="font-black">{inflation}%</span></div>
                <input type="range" min={0} max={15} value={inflation} onChange={(e) => setInflation(Number(e.target.value))} className="w-full mt-1" />
              </div>
              <div>
                <div className="flex justify-between text-[10px]"><span className={isDark ? "text-zinc-400" : "text-black/60"}>Exit Load</span><span className="font-black">{exitLoad}%</span></div>
                <input type="range" min={0} max={2} step={0.1} value={exitLoad} onChange={(e) => setExitLoad(Number(e.target.value))} className="w-full mt-1" />
              </div>
            </div>

            {/* Tax type */}
            <div>
              <label className={`text-[10px] font-black uppercase ${isDark ? "text-zinc-400" : "text-black/60"}`}>Tax Type</label>
              <select value={taxType} onChange={(e) => setTaxType(e.target.value)} className={`mt-1 w-full px-3 py-2 rounded-xl border text-[12px] font-bold outline-none ${isDark ? "bg-black border-zinc-700 text-white" : "bg-gray-50 border-black/10"}`}>
                {TAX_TYPES[currency].map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </div>

            {/* Goal */}
            <div className={`rounded-xl p-3 border ${isDark ? "bg-black border-zinc-800" : "bg-gray-50 border-black/10"}`}>
              <div className="flex justify-between text-[11px]">
                <span className={isDark ? "text-zinc-400" : "text-black/60"}>🎯 Target Corpus</span>
                <span className="text-yellow-500 font-black">{fmt(target, currency)}</span>
              </div>
              <input type="range" min={sliders.target.min} max={sliders.target.max} step={sliders.target.step} value={target} onChange={(e) => setTarget(Number(e.target.value))} className="w-full mt-1 accent-yellow-500" />
              <p className={`text-[10px] mt-1 ${isDark ? "text-zinc-500" : "text-black/50"}`}>SIP needed: <span className="text-[#10B981] font-black">{fmt(data.sipNeeded, currency)}/mo</span></p>
            </div>
          </div>

          {/* RIGHT RESULTS */}
          <div className="lg:col-span-8 space-y-4">
            {/* Top stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-gradient-to-br from-[#10B981] to-emerald-700 text-black rounded-2xl p-4">
                <p className="text-[10px] font-bold opacity-80">FUTURE VALUE</p>
                <p className="text-[18px] md:text-[22px] font-black leading-tight mt-1">{fmt(data.final.total, currency)}</p>
              </div>
              <div className={`rounded-2xl p-4 ${isDark ? "bg-zinc-900 border border-zinc-800" : "bg-white border border-black/10"}`}>
                <p className={`text-[10px] ${isDark ? "text-zinc-400" : "text-black/60"}`}>NET AFTER TAX</p>
                <p className="text-[18px] md:text-[22px] font-black leading-tight mt-1">{fmt(data.final.net, currency)}</p>
                <p className="text-[10px] text-red-400 mt-0.5">-{fmt(data.final.tax + data.final.exitLoad, currency)}</p>
              </div>
              <div className={`rounded-2xl p-4 ${isDark ? "bg-zinc-900 border border-zinc-800" : "bg-white border border-black/10"}`}>
                <p className={`text-[10px] ${isDark ? "text-zinc-400" : "text-black/60"}`}>TODAY&apos;S VALUE</p>
                <p className="text-[18px] md:text-[22px] font-black leading-tight mt-1 text-yellow-400">{fmt(data.final.inflationAdj, currency)}</p>
                <p className={`text-[10px] mt-0.5 ${isDark ? "text-zinc-500" : "text-black/50"}`}>@ {inflation}% inflation</p>
              </div>
              <div className={`rounded-2xl p-4 ${isDark ? "bg-zinc-900 border border-zinc-800" : "bg-white border border-black/10"}`}>
                <p className={`text-[10px] ${isDark ? "text-zinc-400" : "text-black/60"}`}>CAGR</p>
                <p className="text-[18px] md:text-[22px] font-black leading-tight mt-1 text-[#10B981]">{data.cagr.toFixed(2)}%</p>
                <p className={`text-[10px] mt-0.5 ${isDark ? "text-zinc-500" : "text-black/50"}`}>Abs: {data.absoluteReturn.toFixed(0)}%</p>
              </div>
            </div>

            {/* Goal Status + Donut */}
            <div className="grid md:grid-cols-2 gap-3">
              <div className={`rounded-2xl p-4 border ${data.goalAchieved ? "bg-green-500/10 border-green-500/30" : "bg-orange-500/10 border-orange-500/30"}`}>
                <p className="text-[10px] font-black opacity-70">🎯 GOAL STATUS</p>
                <p className={`text-[14px] font-black mt-1 ${data.goalAchieved ? "text-green-500" : "text-orange-500"}`}>
                  {data.goalAchieved ? "✅ Target will be achieved" : `❌ Shortfall: ${fmt(data.shortfall, currency)}`}
                </p>
                <div className={`h-2 rounded-full mt-2 overflow-hidden ${isDark ? "bg-white/10" : "bg-black/10"}`}>
                  <div className={`h-full transition-all duration-700 ${data.goalAchieved ? "bg-green-500" : "bg-orange-500"}`} style={{ width: `${data.goalPct}%` }} />
                </div>
                <p className={`text-[10px] mt-1 ${isDark ? "text-white/50" : "text-black/50"}`}>{data.goalPct.toFixed(1)}% of target reached</p>
              </div>

              <div className={`rounded-2xl p-4 ${isDark ? "bg-zinc-900 border border-zinc-800" : "bg-white border border-black/10"}`}>
                <p className={`text-[10px] font-black ${isDark ? "text-zinc-400" : "text-black/60"}`}>INVESTED vs GAIN</p>
                <div className="flex items-center gap-3 mt-2">
                  <svg viewBox="0 0 36 36" className="w-[70px] h-[70px]">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke={isDark ? "#27272a" : "#e5e7eb"} strokeWidth="4" />
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#10B981" strokeWidth="4" strokeDasharray={`${data.investedPct} ${100 - data.investedPct}`} strokeDashoffset="25" />
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f59e0b" strokeWidth="4" strokeDasharray={`${data.gainPct} ${100 - data.gainPct}`} strokeDashoffset={25 - data.investedPct} />
                  </svg>
                  <div className="text-[11px] space-y-0.5">
                    <p><span className="text-[#10B981]">●</span> Invested: {fmt(data.final.invested, currency)}</p>
                    <p><span className="text-yellow-500">●</span> Gain: {fmt(data.final.gain, currency)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Yearly bar chart */}
            <div className={`rounded-2xl p-4 ${isDark ? "bg-zinc-900 border border-zinc-800" : "bg-white border border-black/10"}`}>
              <p className={`text-[11px] font-black uppercase ${isDark ? "text-zinc-400" : "text-black/60"}`}>📈 Yearly Growth</p>
              <div className="mt-3 flex items-end gap-1 h-[110px]">
                {data.table.filter((_, i) => years <= 20 || i % Math.ceil(years / 20) === 0).map((r, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center group">
                    <div className="w-full bg-gradient-to-t from-[#10B981] to-emerald-400 rounded-t hover-lift" style={{ height: `${Math.max(4, (r.total / maxBarValue) * 100)}%` }} title={`Y${r.year}: ${fmt(r.total, currency)}`} />
                    <span className={`text-[8px] mt-0.5 ${isDark ? "text-zinc-600" : "text-black/40"}`}>{r.year}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* SIP vs Lumpsum comparison */}
            <div className={`rounded-2xl p-4 ${isDark ? "bg-zinc-900 border border-zinc-800" : "bg-white border border-black/10"}`}>
              <p className={`text-[11px] font-black uppercase ${isDark ? "text-zinc-400" : "text-black/60"}`}>⚖️ SIP vs Lumpsum Comparison</p>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div className="rounded-xl p-3 bg-[#10B981]/10 border border-[#10B981]/30">
                  <p className="text-[10px] font-black opacity-70">SIP (current)</p>
                  <p className="text-[14px] font-black text-[#10B981] mt-0.5">{fmt(data.final.total, currency)}</p>
                </div>
                <div className={`rounded-xl p-3 ${isDark ? "bg-white/5 border border-white/10" : "bg-gray-50 border border-black/10"}`}>
                  <p className="text-[10px] font-black opacity-70">Same capital as Lumpsum</p>
                  <p className="text-[14px] font-black mt-0.5">{fmt(data.lumpEquivalentFV, currency)}</p>
                </div>
              </div>
              <p className={`text-[10px] mt-2 ${isDark ? "text-white/50" : "text-black/50"}`}>
                {data.lumpEquivalentFV > data.final.total
                  ? `Lumpsum would earn ${fmt(data.lumpEquivalentFV - data.final.total, currency)} more (ignores market volatility).`
                  : `SIP would earn ${fmt(data.final.total - data.lumpEquivalentFV, currency)} more (better rupee-cost averaging).`}
              </p>
            </div>

            {/* Year Table with pagination */}
            <div className={`rounded-2xl p-4 ${isDark ? "bg-zinc-900 border border-zinc-800" : "bg-white border border-black/10"}`}>
              <div className="flex justify-between items-center flex-wrap gap-2 mb-2">
                <p className={`text-[11px] font-black uppercase ${isDark ? "text-zinc-400" : "text-black/60"}`}>Year-wise Schedule</p>
                <div className="flex gap-1">
                  <button onClick={copyReport} className="text-[10px] bg-[#10B981] text-black px-3 py-1 rounded-full font-black">{copied ? "✓ Copied!" : "📋 Copy"}</button>
                  <button onClick={() => window.print()} className={`text-[10px] px-3 py-1 rounded-full font-black ${isDark ? "bg-white/10" : "bg-black/10"}`}>🖨 Print</button>
                  <button onClick={exportCSV} className={`text-[10px] px-3 py-1 rounded-full font-black ${isDark ? "bg-white text-black" : "bg-black text-white"}`}>📥 CSV</button>
                </div>
              </div>
              <div className="overflow-auto">
                <table className="w-full text-[11px]">
                  <thead className={`sticky top-0 ${isDark ? "bg-zinc-900 text-zinc-500" : "bg-white text-black/50"}`}>
                    <tr>
                      <th className="text-left p-2">Yr</th>
                      <th className="text-right p-2">Invested</th>
                      <th className="text-right p-2">Value</th>
                      <th className="text-right p-2">Gain</th>
                      <th className="text-right p-2 hidden md:table-cell">Net</th>
                      <th className="text-right p-2 hidden md:table-cell">Today&apos;s Val</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageRows.map((r) => (
                      <tr key={r.year} className={`border-t ${isDark ? "border-zinc-800" : "border-black/5"}`}>
                        <td className="p-2 font-bold">{r.year}</td>
                        <td className="p-2 text-right">{fmt(r.invested, currency)}</td>
                        <td className="p-2 text-right font-bold">{fmt(r.total, currency)}</td>
                        <td className="p-2 text-right text-[#10B981]">{fmt(r.gain, currency)}</td>
                        <td className="p-2 text-right hidden md:table-cell">{fmt(r.net, currency)}</td>
                        <td className={`p-2 text-right hidden md:table-cell ${isDark ? "text-zinc-400" : "text-black/60"}`}>{fmt(r.inflationAdj, currency)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-between items-center mt-2">
                <button onClick={() => setTablePage(Math.max(0, tablePage - 1))} disabled={tablePage === 0} className={`text-[10px] px-3 py-1 rounded-lg font-black ${tablePage === 0 ? "opacity-30" : isDark ? "bg-white/10" : "bg-black/10"}`}>← Prev</button>
                <span className={`text-[10px] font-bold ${isDark ? "text-zinc-500" : "text-black/50"}`}>Page {tablePage + 1} / {totalPages}</span>
                <button onClick={() => setTablePage(Math.min(totalPages - 1, tablePage + 1))} disabled={tablePage >= totalPages - 1} className={`text-[10px] px-3 py-1 rounded-lg font-black ${tablePage >= totalPages - 1 ? "opacity-30" : isDark ? "bg-white/10" : "bg-black/10"}`}>Next →</button>
              </div>
            </div>

            {/* Save/Load/Reset */}
            <div className={`rounded-2xl p-3 ${isDark ? "bg-zinc-900 border border-zinc-800" : "bg-white border border-black/10"}`}>
              <div className="grid grid-cols-3 gap-2">
                <button onClick={save} className={`py-2 rounded-xl font-black text-[11px] ${isDark ? "bg-white/10 hover:bg-white/15" : "bg-gray-100 hover:bg-gray-200"}`}>💾 Save</button>
                <button onClick={load} className={`py-2 rounded-xl font-black text-[11px] ${isDark ? "bg-white/10 hover:bg-white/15" : "bg-gray-100 hover:bg-gray-200"}`}>📂 Load</button>
                <button onClick={reset} className={`py-2 rounded-xl font-black text-[11px] ${isDark ? "bg-red-500/10 text-red-400" : "bg-red-50 text-red-600"}`}>↻ Reset</button>
              </div>
              {saveMsg && <p className="text-center text-[11px] mt-2 font-black text-green-500">{saveMsg}</p>}
            </div>
          </div>
        </div>

        {/* ================= SEO CONTENT ================= */}
        <article className={`max-w-[900px] mx-auto mt-10 ${isDark ? "text-white/80" : "text-black/80"}`}>
          <h1 className="text-[30px] md:text-[40px] font-black tracking-tight text-[#10B981] leading-tight">
            SIP Calculator 2025 — Free Systematic Investment Plan Return Calculator (India & USA)
          </h1>
          <p className="mt-4 text-[14px] leading-relaxed">
            Our <strong>free SIP calculator</strong> helps investors estimate the future value of their <strong>Systematic Investment Plan (SIP)</strong> in mutual funds. Whether you invest ₹25,000 monthly in an Indian equity mutual fund or $500 monthly in a US index fund, this advanced tool shows the exact corpus you will accumulate — including <strong>step-up SIP, LTCG tax, expense ratio, exit load, inflation adjustment, and CAGR</strong>. Unlike basic SIP calculators, our PRO MAX version handles every variable that affects real-world returns, so your financial planning is based on truth, not wishful thinking.
          </p>

          <h2 className="text-[22px] md:text-[26px] font-black mt-8 text-[#10B981]">What is a SIP Calculator?</h2>
          <p className="mt-3 text-[14px] leading-relaxed">
            A <strong>SIP calculator</strong> is an online financial tool that calculates the future value of your monthly mutual fund investments based on three core inputs: <strong>monthly SIP amount, expected annual return rate, and investment duration</strong>. It uses the compound interest formula to project how your money grows over time, showing the total amount invested, the wealth gained, and the final maturity value. A premium SIP calculator also factors in <strong>step-up (annual increase), expense ratio, exit load, LTCG tax, and inflation</strong> — all of which our tool handles automatically.
          </p>
          <p className="mt-3 text-[14px] leading-relaxed">
            SIP calculators are widely used in India for mutual fund planning, but they work universally — whether you are investing in <strong>Indian ELSS funds, US ETFs, UK ISA accounts, or UAE mutual funds</strong>. The core mathematics is identical; only the currency and tax rules change.
          </p>

          <h2 className="text-[22px] md:text-[26px] font-black mt-8 text-[#10B981]">What is SIP (Systematic Investment Plan)?</h2>
          <p className="mt-3 text-[14px] leading-relaxed">
            A <strong>Systematic Investment Plan (SIP)</strong> is a method of investing a fixed amount in a mutual fund at regular intervals — typically monthly. Instead of trying to time the market with a large one-time investment (lumpsum), SIP lets you invest small amounts consistently, benefiting from <strong>rupee-cost averaging</strong>. When markets are down, your fixed SIP amount buys more units; when markets are up, it buys fewer units. Over time, this averages out the purchase price and reduces the impact of volatility.
          </p>
          <p className="mt-3 text-[14px] leading-relaxed">
            SIP has become the preferred investment route for millions of retail investors in India because it requires no market timing, no large capital upfront, and can be started with as little as ₹500 per month. It enforces financial discipline, leverages compounding, and — most importantly — removes emotion from investing.
          </p>

          <h2 className="text-[22px] md:text-[26px] font-black mt-8 text-[#10B981]">How Does a SIP Calculator Work?</h2>
          <p className="mt-3 text-[14px] leading-relaxed">
            The SIP calculator uses the standard compound interest formula for periodic investments:
          </p>
          <div className={`my-4 p-4 rounded-xl font-mono text-[13px] text-center ${isDark ? "bg-white/5" : "bg-gray-100"}`}>
            FV = P × [ ((1 + r)<sup>n</sup> − 1) / r ] × (1 + r)
          </div>
          <p className="text-[14px] leading-relaxed">
            where <strong>FV</strong> = future value, <strong>P</strong> = monthly SIP amount, <strong>r</strong> = monthly return rate (annual rate ÷ 12 ÷ 100), and <strong>n</strong> = total number of months. The extra <strong>(1 + r)</strong> multiplier assumes investment at the beginning of each month (annuity-due), which is accurate for SIPs debited on the 1st to 5th of every month.
          </p>
          <p className="mt-3 text-[14px] leading-relaxed">
            <strong>Example:</strong> ₹25,000/month SIP at 12% annual return for 15 years = ₹1.26 crore (₹45L invested + ₹81L gain). The SIP calculator does this math instantly, so you can experiment with different scenarios without spreadsheet headaches.
          </p>

          <h2 className="text-[22px] md:text-[26px] font-black mt-8 text-[#10B981]">How to Use This SIP Calculator — Step-by-Step Guide</h2>
          <ol className={`mt-3 text-[14px] leading-relaxed list-decimal pl-6 space-y-2 ${isDark ? "text-white/80" : "text-black/80"}`}>
            <li><strong>Select Currency</strong> — INR (₹) for Indian investors, USD ($) for US/global investors.</li>
            <li><strong>Choose Mode</strong> — SIP only, Lumpsum only, or BOTH (mixed portfolio).</li>
            <li><strong>Enter Monthly SIP</strong> — the amount you invest every month.</li>
            <li><strong>Enter Lumpsum</strong> — one-time amount (if any).</li>
            <li><strong>Set Investment Duration</strong> — 1 to 40 years.</li>
            <li><strong>Enter Expected Return Rate</strong> — 10%–12% for equity, 6%–7% for debt, 12%–15% for aggressive.</li>
            <li><strong>Choose Step-up %</strong> — annual increase in SIP (0% = fixed SIP, 10% = increased by 10% every year).</li>
            <li><strong>Enter Expense Ratio</strong> — 0.5%–2% (index funds cheaper, active funds costlier).</li>
            <li><strong>Enter Exit Load</strong> — 0%–2% (1% is common if redeemed within 1 year).</li>
            <li><strong>Set Inflation</strong> — 5%–7% for India, 2%–3% for USA.</li>
            <li><strong>Choose Tax Type</strong> — Equity LTCG / Debt slab / US long-term or short-term.</li>
            <li><strong>Set Target Corpus</strong> — how much you want to accumulate (tool shows required SIP).</li>
            <li><strong>Review Results</strong> — FV, Net after tax, Today&apos;s value, CAGR, goal status, year table.</li>
            <li><strong>Export</strong> — Download CSV or copy report for your financial advisor.</li>
          </ol>

          <h2 className="text-[22px] md:text-[26px] font-black mt-8 text-[#10B981]">What is Step-up SIP? (Top-up SIP)</h2>
          <p className="mt-3 text-[14px] leading-relaxed">
            A <strong>step-up SIP</strong> (also called top-up SIP) is a SIP where you increase the investment amount by a fixed percentage every year — usually aligned with your annual salary hike. If you start a ₹25,000/month SIP with 10% annual step-up, in year 2 you invest ₹27,500, in year 3 you invest ₹30,250, and so on. Over a 15-year period, a 10% step-up SIP can create <strong>2–3× more corpus</strong> than a flat SIP, without proportionally increasing your initial monthly outflow. This is one of the most powerful levers for wealth creation.
          </p>

          <h2 className="text-[22px] md:text-[26px] font-black mt-8 text-[#10B981]">SIP vs Lumpsum — Which is Better?</h2>
          <p className="mt-3 text-[14px] leading-relaxed">
            <strong>Lumpsum</strong> investing works best when markets are cheap (post-crash) and you have idle capital. <strong>SIP</strong> works best when you want to invest regularly from monthly income, reduce market timing risk, and build discipline. In a rising market, lumpsum usually beats SIP mathematically. In a volatile or falling market, SIP outperforms due to rupee-cost averaging. Most financial advisors recommend SIP for salaried investors and lumpsum for windfall gains. Our calculator shows both side-by-side so you can decide based on your own scenario.
          </p>

          <h2 className="text-[22px] md:text-[26px] font-black mt-8 text-[#10B981]">Understanding LTCG Tax on Mutual Funds (India 2024–25)</h2>
          <p className="mt-3 text-[14px] leading-relaxed">
            As per the Finance (No. 2) Act 2024, <strong>equity mutual funds</strong> held for more than 12 months attract <strong>Long-Term Capital Gains (LTCG) tax of 12.5%</strong> on gains exceeding <strong>₹1.25 lakh per financial year</strong>. <strong>Debt mutual funds</strong> are taxed at the investor&apos;s applicable <strong>income tax slab rate (up to 30%)</strong> regardless of holding period, since April 2023. Our calculator applies both rules correctly so your "net after tax" figure is accurate.
          </p>

          <h2 className="text-[22px] md:text-[26px] font-black mt-8 text-[#10B981]">What is Expense Ratio & How Does It Affect Returns?</h2>
          <p className="mt-3 text-[14px] leading-relaxed">
            The <strong>expense ratio</strong> is the annual fee charged by a mutual fund to manage your money — typically 0.1%–0.5% for index funds and 1%–2% for actively managed funds. A 2% expense ratio might seem small, but over 20 years it can erode <strong>30%–40% of your total corpus</strong> compared to a 0.5% fund. Our SIP calculator deducts the expense ratio from your expected return before computing compound growth, so your projection reflects what you will actually earn.
          </p>

          <h2 className="text-[22px] md:text-[26px] font-black mt-8 text-[#10B981]">Inflation-Adjusted Returns — Nominal vs Real Wealth</h2>
          <p className="mt-3 text-[14px] leading-relaxed">
            A ₹1 crore corpus in 2040 will not have the same purchasing power as ₹1 crore today. At 6% inflation, ₹1 crore in 15 years is worth only about <strong>₹41 lakh in today&apos;s money</strong>. That is why our calculator shows the <strong>"Today&apos;s Value"</strong> — the real wealth you will actually experience. Always plan for real returns (return minus inflation), not just nominal returns. A 12% nominal return with 6% inflation equals only a 6% real return.
          </p>

          <h2 className="text-[22px] md:text-[26px] font-black mt-8 text-[#10B981]">What is CAGR (Compound Annual Growth Rate)?</h2>
          <p className="mt-3 text-[14px] leading-relaxed">
            CAGR is the <strong>annualised rate at which your investment grows</strong>, assuming profits are reinvested. It smooths out volatility and gives you a single number to compare across investments. If a SIP of ₹25,000/month for 15 years produces ₹1.26 crore, the CAGR is ~12%. Absolute return (total gain %) and CAGR are both shown in our calculator — absolute return tells you how much you gained in total, CAGR tells you the effective annual rate.
          </p>

          <h2 className="text-[22px] md:text-[26px] font-black mt-8 text-[#10B981]">SIP Calculator Glossary</h2>
          <div className="mt-4">
            {[
              ["SIP", "Systematic Investment Plan — investing a fixed amount in mutual funds at regular intervals (usually monthly)."],
              ["Lumpsum", "A one-time large investment, as opposed to periodic SIP contributions."],
              ["Step-up SIP", "A SIP where the monthly investment amount increases by a fixed % every year."],
              ["Expense Ratio", "Annual fee charged by a mutual fund, deducted from returns, typically 0.1%–2%."],
              ["Exit Load", "A penalty charged if you redeem mutual fund units before a specified period (usually 1 year)."],
              ["LTCG", "Long-Term Capital Gains — profit from selling an asset held beyond the holding period, taxed at a concessional rate."],
              ["STCG", "Short-Term Capital Gains — profit from selling an asset held for a short period, taxed at higher rates."],
              ["CAGR", "Compound Annual Growth Rate — the annualised return that accounts for compounding."],
              ["RPM", "Not used in SIP — see CAGR for annualised return metrics."],
              ["Corpus", "The total accumulated wealth from your SIP investments at maturity."],
            ].map(([title, body], i) => (
              <Accordion key={i} title={title} isOpen={openAccordion === `g${i}`} onToggle={() => setOpenAccordion(openAccordion === `g${i}` ? null : `g${i}`)} isDark={isDark}>
                {body}
              </Accordion>
            ))}
          </div>

          <h2 className="text-[22px] md:text-[26px] font-black mt-8 text-[#10B981]">SIP Investment Tips for 2025</h2>
          <ul className={`mt-3 text-[14px] leading-relaxed list-disc pl-6 space-y-1.5 ${isDark ? "text-white/80" : "text-black/80"}`}>
            <li><strong>Start early:</strong> A 25-year-old investing ₹10,000/month for 35 years accumulates more than a 40-year-old investing ₹30,000/month for 20 years — compounding favors time over amount.</li>
            <li><strong>Use step-up SIP:</strong> Increase SIP by 10% every year to match salary growth. This alone can double your corpus.</li>
            <li><strong>Prefer index funds:</strong> Low-cost Nifty 50 or S&P 500 index funds beat 80% of actively managed funds over 15 years.</li>
            <li><strong>Don&apos;t stop SIP in market falls:</strong> Bear markets are when you accumulate the most units at low prices — this is when SIP shines.</li>
            <li><strong>Review annually, don&apos;t tinker monthly:</strong> Rebalance once a year based on asset allocation, not market noise.</li>
            <li><strong>Use tax harvesting:</strong> Book ₹1.25 lakh LTCG each year to use the exemption and reset cost basis.</li>
            <li><strong>Diversify:</strong> Split between equity (70%), debt (20%), and gold (10%) based on risk profile.</li>
            <li><strong>Plan for goal-based SIP:</strong> Different SIPs for retirement, child education, home down payment — never mix them.</li>
          </ul>

          <h2 className="text-[22px] md:text-[26px] font-black mt-8 text-[#10B981]">Frequently Asked Questions (FAQ)</h2>
          <div className="mt-4">
            {[
              ["What is a SIP calculator?", "A SIP calculator is a free online tool that estimates the future value of your monthly mutual fund investments based on the SIP amount, expected return rate, and investment duration. It applies the compound interest formula to show your total corpus, invested amount, and wealth gained."],
              ["Is this SIP calculator accurate?", "Yes — it uses the standard annuity-due compound formula used by AMFI and major fund houses. Results are projections based on assumed constant returns; actual returns will vary with market performance."],
              ["What is a step-up SIP calculator?", "A step-up SIP calculator lets you increase your SIP amount by a fixed percentage every year, showing a more realistic corpus projection for salaried investors whose income rises annually."],
              ["How much should I invest in SIP monthly?", "A common rule is to invest 20%–30% of your net monthly income. For retirement, target a corpus of 30× your annual expenses. Use our goal planner to calculate the required SIP."],
              ["What return should I assume for SIP?", "12%–14% for equity mutual funds (historical Nifty 50 average), 6%–7% for debt funds, and 10%–12% for hybrid funds. Conservative planners should use 10%."],
              ["Is SIP better than lumpsum?", "SIP is better for salaried investors and volatile markets. Lumpsum is better if you have idle capital during market corrections. Both are shown in our SIP vs Lumpsum comparison."],
              ["How is LTCG tax calculated on SIP?", "Each SIP instalment is treated as a separate purchase with its own holding period. Units held over 12 months qualify for LTCG at 12.5% above ₹1.25 lakh (equity). Our calculator applies tax to the total gain assuming full redemption."],
              ["Can I stop SIP anytime?", "Yes. SIP is completely flexible — you can pause, stop, or modify the amount anytime without penalty. Exit load (0%–1%) applies if you redeem within the lock-in period."],
              ["What is the difference between SIP and EMI?", "SIP is an investment — you build wealth. EMI is a loan repayment — you pay interest to the bank. SIP builds your assets; EMI reduces your liability. A balanced financial plan uses both."],
              ["What is the minimum SIP amount?", "₹500 per month in most Indian mutual funds; $50 in US index funds. Our calculator allows ₹500 minimum for INR mode and $10 for USD mode."],
              ["Is SIP safe during a market crash?", "Yes — SIP is actually most effective during market crashes because your fixed amount buys more units at lower prices (rupee-cost averaging). Do not stop SIP in bear markets."],
              ["Can NRIs use SIP in India?", "Yes, NRIs can invest in Indian mutual funds via NRE/NRO accounts, subject to FEMA regulations. Tax rules differ — consult a CA for LTCG and DTAA benefits."],
            ].map(([q, a], i) => (
              <Accordion key={i} title={q} isOpen={openAccordion === `f${i}`} onToggle={() => setOpenAccordion(openAccordion === `f${i}` ? null : `f${i}`)} isDark={isDark}>
                {a}
              </Accordion>
            ))}
          </div>

          <h2 className="text-[22px] md:text-[26px] font-black mt-8 text-[#10B981]">Key SIP Calculator Keywords</h2>
          <p className={`mt-3 text-[12px] leading-relaxed ${isDark ? "text-white/60" : "text-black/60"}`}>
            SIP calculator · SIP calculator India · free SIP calculator · step-up SIP calculator · SIP return calculator · mutual fund calculator · monthly investment calculator · SIP calculator 2025 · SIP calculator with inflation · SIP calculator with tax · SIP calculator with CAGR · SIP vs lumpsum calculator · LTCG tax calculator India · ELSS SIP calculator · ₹500 SIP calculator · ₹25,000 SIP calculator · ₹1 crore SIP calculator · retirement SIP calculator · FIRE calculator India · SIP compound interest calculator · SIP plan calculator · best SIP calculator 2025 · online SIP calculator · SIP future value calculator · SIP maturity calculator · SIP wealth calculator · SIP calculator with step-up · SIP calculator for 10 years · SIP calculator for 20 years · SIP calculator for 30 years
          </p>

          <div className={`mt-8 p-4 rounded-xl text-[11px] ${isDark ? "bg-white/5 text-white/50" : "bg-gray-100 text-black/60"}`}>
            <strong>Disclaimer:</strong> This SIP calculator provides projections based on user-entered assumptions. Actual mutual fund returns will vary due to market volatility, fund performance, and economic conditions. Mutual fund investments are subject to market risks — read all scheme-related documents carefully. This tool is for educational purposes and should not be treated as investment advice. Consult a SEBI-registered investment advisor before making financial decisions.
          </div>
        </article>
      </div>
    </div>
  );
}
