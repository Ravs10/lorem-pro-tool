"use client";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";

const CURRENCIES = {
  INR: { symbol: "₹", locale: "en-IN", rate: 1 },
  USD: { symbol: "$", locale: "en-US", rate: 1 / 83.5 },
};

const fmt = (n, currency) => {
  if (!isFinite(n) || isNaN(n)) n = 0;
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (currency === "INR") {
    if (abs >= 1e7) return `${sign}₹${(abs / 1e7).toFixed(2)} Cr`;
    if (abs >= 1e5) return `${sign}₹${(abs / 1e5).toFixed(2)} L`;
    return sign + new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(abs);
  }
  if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(2)}M`;
  if (abs >= 1e3) return `${sign}$${(abs / 1e3).toFixed(1)}K`;
  return sign + new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(abs);
};

const fmtFull = (n, currency) => {
  if (currency === "INR") return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
};

function Accordion({ title, children, isOpen, onToggle, isDark }) {
  return (
    <div className={`border rounded-xl overflow-hidden mb-2 ${isDark ? "border-white/10 bg-white/[0.03]" : "border-black/10 bg-white"}`}>
      <button onClick={onToggle} className="w-full flex justify-between items-center p-4 text-left">
        <span className="font-bold text-[13px] pr-4">{title}</span>
        <span className={`text-[18px] font-black text-amber-500 transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`}>+</span>
      </button>
      <div className={`grid transition-all duration-300 ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
        <div className="overflow-hidden">
          <div className={`px-4 pb-4 text-[12px] leading-relaxed ${isDark ? "text-white/70" : "text-black/70"}`}>{children}</div>
        </div>
      </div>
    </div>
  );
}

function LineChart({ data, max, color, isDark, showMarker, markerIndex, label }: any) {
  if (!data || data.length === 0) return null;
  const w = 600, h = 140;
  const step = w / Math.max(1, data.length - 1);
  const points = data.map((v, i) => `${i * step},${h - (Math.min(v, max) / max) * (h - 20) - 10}`).join(" ");
  const areaPoints = `0,${h} ${points} ${w},${h}`;
  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="w-full h-[140px]">
        <defs>
          <linearGradient id={`grad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={areaPoints} fill={`url(#grad-${color.replace("#", "")})`} />
        <polyline points={points} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {showMarker && markerIndex !== undefined && markerIndex >= 0 && markerIndex < data.length && (
          <>
            <line x1={markerIndex * step} y1="0" x2={markerIndex * step} y2={h} stroke={isDark ? "#ffffff40" : "#00000040"} strokeWidth="1" strokeDasharray="3,3" />
            <circle cx={markerIndex * step} cy={h - (Math.min(data[markerIndex], max) / max) * (h - 20) - 10} r="4" fill={color} stroke={isDark ? "#000" : "#fff"} strokeWidth="2" />
          </>
        )}
      </svg>
      {label && <p className={`text-[9px] text-center mt-1 ${isDark ? "text-white/40" : "text-black/50"}`}>{label}</p>}
    </div>
  );
}

export default function FireCalculatorUltra() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [currency, setCurrency] = useState("INR");
  const [soundOn, setSoundOn] = useState(false);

  // Core inputs (all original preserved)
  const [age, setAge] = useState(25);
  const [retireAge, setRetireAge] = useState(45);
  const [income, setIncome] = useState(1200000);
  const [savings, setSavings] = useState(500000);
  const [monthlyInvest, setMonthlyInvest] = useState(40000);
  const [ret, setRet] = useState(12);
  const [inflation, setInflation] = useState(6);
  const [expense, setExpense] = useState(60000);
  const [withdraw, setWithdraw] = useState(4);

  // Advanced inputs (all original preserved)
  const [taxRate, setTaxRate] = useState(20);
  const [health, setHealth] = useState(5000);
  const [social, setSocial] = useState(20000);
  const [healthInflation, setHealthInflation] = useState(8);

  // UI state
  const [openAccordion, setOpenAccordion] = useState(null);
  const [saveMsg, setSaveMsg] = useState("");
  const [copied, setCopied] = useState(false);
  const [showDecumulation, setShowDecumulation] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => { setMounted(true); }, []);

  const isDark = theme === "dark";

  const play = useCallback((type) => {
    if (!soundOn) return;
    try {
      if (!audioRef.current) {
  const AC = window.AudioContext || (window as any).webkitAudioContext;
  audioRef.current = new AC();
}
      const ctx = audioRef.current;
      if (ctx.state === "suspended") ctx.resume();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.value = type === "fire" ? 220 : 660;
      if (type === "fire") o.frequency.linearRampToValueAtTime(1320, ctx.currentTime + 0.4);
      g.gain.setValueAtTime(0.15, ctx.currentTime);
      o.start();
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (type === "fire" ? 0.6 : 0.15));
      o.stop(ctx.currentTime + (type === "fire" ? 0.6 : 0.15));
    } catch {}
  }, [soundOn]);

  // -------- CURRENCY SWITCH (fixed - converts values) --------
  const switchCurrency = (newCur) => {
    if (newCur === currency) return;
    const rate = CURRENCIES[newCur].rate / CURRENCIES[currency].rate;
    setIncome(Math.round(income * rate));
    setSavings(Math.round(savings * rate));
    setMonthlyInvest(Math.round(monthlyInvest * rate));
    setExpense(Math.round(expense * rate));
    setHealth(Math.round(health * rate));
    setSocial(Math.round(social * rate));
    setCurrency(newCur);
  };

  // -------- MASTER CALC ENGINE --------
  const data = useMemo(() => {
    const yearsToRetire = Math.max(1, retireAge - age);
    const r_m = ret / 12 / 100;
    const n_months = yearsToRetire * 12;
    const annualExpenseToday = expense * 12;
    const annualHealthToday = health * 12;

    // Correct monthly compounding FV
    const fvLump = savings * Math.pow(1 + r_m, n_months);
    const fvSip = monthlyInvest * ((Math.pow(1 + r_m, n_months) - 1) / r_m) * (1 + r_m);
    const fv = fvLump + fvSip;

    // Expenses at retirement (inflation-adjusted)
    const annualExpenseAtRet = annualExpenseToday * Math.pow(1 + inflation / 100, yearsToRetire);
    const annualHealthAtRet = annualHealthToday * Math.pow(1 + healthInflation / 100, yearsToRetire);

    // Tax on withdrawal (approximation)
    const taxFactor = 1 + taxRate / 100;
    const totalAnnualNeed = (annualExpenseAtRet + annualHealthAtRet) * taxFactor;

    // FIRE number = annual need / SWR
    const fireNumber = totalAnnualNeed / (withdraw / 100);
    const lean = fireNumber * 0.7;
    const fat = fireNumber * 1.5;

    // Coast FIRE (correct: what you need NOW for it to grow to FIRE without more SIP)
    const coast = fireNumber / Math.pow(1 + ret / 100, yearsToRetire);

    // Barista FIRE (reduce need by part-time income)
    const barista = Math.max(0, (totalAnnualNeed - social * 12) / (withdraw / 100));

    // FIRE age finder
    let fireAge = null;
    for (let testAge = age; testAge <= 80; testAge++) {
      const testYears = testAge - age;
      const testN = testYears * 12;
      const tFvL = savings * Math.pow(1 + r_m, testN);
      const tFvS = testN > 0 ? monthlyInvest * ((Math.pow(1 + r_m, testN) - 1) / r_m) * (1 + r_m) : 0;
      const tFv = tFvL + tFvS;
      const tExp = annualExpenseToday * Math.pow(1 + inflation / 100, testYears);
      const tHealth = annualHealthToday * Math.pow(1 + healthInflation / 100, testYears);
      const tNeed = ((tExp + tHealth) * taxFactor) / (withdraw / 100);
      if (tFv >= tNeed) { fireAge = testAge; break; }
    }

    // Savings rate
    const savingsRate = income > 0 ? ((monthlyInvest * 12) / income) * 100 : 0;

    // Monte Carlo (30-year retirement with social security + taxes)
    let successCount = 0;
    const numSims = 1000;
    for (let i = 0; i < numSims; i++) {
      let bal = fv;
      let ok = true;
      for (let y = 0; y < 30; y++) {
        const mRet = ret + (Math.random() * 30 - 15);
        bal = bal * (1 + mRet / 100);
        const yearExp = (annualExpenseAtRet + annualHealthAtRet) * Math.pow(1 + inflation / 100, y) * taxFactor;
        bal = bal - yearExp + social * 12;
        if (bal < 0) { ok = false; break; }
      }
      if (ok) successCount++;
    }
    const successRate = (successCount / numSims) * 100;

    // How many years will money last?
    let yearsLast = 0, bTest = fv;
    while (bTest > 0 && yearsLast < 100) {
      const yearExp = (annualExpenseAtRet + annualHealthAtRet) * Math.pow(1 + inflation / 100, yearsLast) * taxFactor;
      bTest = bTest * (1 + ret / 100) - yearExp + social * 12;
      yearsLast++;
    }

    // Accumulation chart
    const chartAcc = [];
    let bAcc = savings;
    for (let y = 0; y <= yearsToRetire; y++) {
      chartAcc.push(Math.max(0, Math.round(bAcc)));
      for (let m = 0; m < 12; m++) bAcc = bAcc * (1 + r_m) + monthlyInvest;
    }

    // Decumulation chart (20 years post-retire)
    const chartDec = [];
    let bDec = fv;
    for (let y = 0; y <= 20; y++) {
      chartDec.push(Math.max(0, Math.round(bDec)));
      const marketGain = bDec * (ret / 100);
      const yearExp = (annualExpenseAtRet + annualHealthAtRet) * Math.pow(1 + inflation / 100, y) * taxFactor;
      bDec = bDec + marketGain - yearExp + social * 12;
    }

    // 1-more-year analysis
    const oneMore = (() => {
      const n2 = (yearsToRetire + 1) * 12;
      const fv2L = savings * Math.pow(1 + r_m, n2);
      const fv2S = monthlyInvest * ((Math.pow(1 + r_m, n2) - 1) / r_m) * (1 + r_m);
      const fv2 = fv2L + fv2S;
      const exp2 = annualExpenseToday * Math.pow(1 + inflation / 100, yearsToRetire + 1);
      const health2 = annualHealthToday * Math.pow(1 + healthInflation / 100, yearsToRetire + 1);
      const need2 = ((exp2 + health2) * taxFactor) / (withdraw / 100);
      return { extraCorpus: fv2 - fv, extraSafety: ((fv2 - need2) / need2) * 100 };
    })();

    // What-if: 10% higher SIP
    const whatIf10Sip = (() => {
      const newSip = monthlyInvest * 1.25;
      const nFv = savings * Math.pow(1 + r_m, n_months) + newSip * ((Math.pow(1 + r_m, n_months) - 1) / r_m) * (1 + r_m);
      const gap = fireNumber - nFv;
      return { newCorpus: nFv, gap, yearsEarlier: gap <= 0 ? "Already FIRE" : null };
    })();

    // Corpus reality check
    const readyPct = fireNumber > 0 ? Math.min(100, (fv / fireNumber) * 100) : 0;
    const gap = Math.max(0, fireNumber - fv);

    return {
      yearsToRetire, fv, annualExpenseAtRet, annualHealthAtRet,
      totalAnnualNeed, fireNumber, lean, fat, coast, barista, savingsRate,
      successRate, chartAcc, chartDec, oneMore, yearsLast, fireAge,
      whatIf10Sip, readyPct, gap, taxFactor,
    };
  }, [age, retireAge, income, savings, monthlyInvest, ret, inflation, expense, withdraw, taxRate, health, social, healthInflation]);

  // -------- ACTIONS --------
  const copyPlan = () => {
    play("fire");
    const text = `🔥 FIRE Plan Report (${currency})
━━━━━━━━━━━━━━━━━
Age: ${age} → Retire: ${retireAge} (${data.yearsToRetire} yrs)
Income: ${fmt(income, currency)}/yr | Savings Rate: ${data.savingsRate.toFixed(1)}%
Monthly SIP: ${fmt(monthlyInvest, currency)}
Return: ${ret}% | Inflation: ${inflation}% | SWR: ${withdraw}%
━━━━━━━━━━━━━━━━━
Corpus at ${retireAge}: ${fmt(data.fv, currency)}
FIRE Number: ${fmt(data.fireNumber, currency)}
Status: ${data.fv >= data.fireNumber ? "✅ FIRE READY" : `❌ GAP ${fmt(data.gap, currency)}`}
Monte Carlo Success: ${data.successRate.toFixed(1)}%
Money lasts: ${data.yearsLast} years
━━━━━━━━━━━━━━━━━
LEAN: ${fmt(data.lean, currency)}
REGULAR: ${fmt(data.fireNumber, currency)}
FAT: ${fmt(data.fat, currency)}
COAST: ${fmt(data.coast, currency)}
BARISTA: ${fmt(data.barista, currency)}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportCSV = () => {
    let csv = "Age,Accumulation Corpus,Decumulation Corpus\n";
    const maxLen = Math.max(data.chartAcc.length, data.chartDec.length);
    for (let i = 0; i < maxLen; i++) {
      const acc = data.chartAcc[i] !== undefined ? data.chartAcc[i] : "";
      const dec = data.chartDec[i] !== undefined ? data.chartDec[i] : "";
      csv += `${age + i},${acc},${dec}\n`;
    }
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `fire-plan-${currency}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const save = () => {
    try {
      localStorage.setItem("fire-ultra-v2", JSON.stringify({
        age, retireAge, income, savings, monthlyInvest, ret, inflation, expense, withdraw,
        taxRate, health, social, healthInflation, currency, theme,
      }));
      setSaveMsg("✓ Saved!");
    } catch { setSaveMsg("✗ Failed"); }
    setTimeout(() => setSaveMsg(""), 2000);
  };

  const load = () => {
    try {
      const d = JSON.parse(localStorage.getItem("fire-ultra-v2") || "null");
      if (!d) { setSaveMsg("Nothing saved"); setTimeout(() => setSaveMsg(""), 2000); return; }
      setAge(d.age); setRetireAge(d.retireAge); setIncome(d.income); setSavings(d.savings);
      setMonthlyInvest(d.monthlyInvest); setRet(d.ret); setInflation(d.inflation);
      setExpense(d.expense); setWithdraw(d.withdraw); setTaxRate(d.taxRate);
      setHealth(d.health); setSocial(d.social); setHealthInflation(d.healthInflation);
      setCurrency(d.currency); setTheme(d.theme || "dark");
      setSaveMsg("✓ Loaded!");
    } catch { setSaveMsg("✗ Failed"); }
    setTimeout(() => setSaveMsg(""), 2000);
  };

  const reset = () => {
    setAge(25); setRetireAge(45); setIncome(1200000); setSavings(500000);
    setMonthlyInvest(40000); setRet(12); setInflation(6); setExpense(60000);
    setWithdraw(4); setTaxRate(20); setHealth(5000); setSocial(20000);
    setHealthInflation(8); setCurrency("INR");
    setSaveMsg("✓ Reset!"); setTimeout(() => setSaveMsg(""), 2000);
  };

  if (!mounted) return null;

  const isFireReady = data.fv >= data.fireNumber;
  const maxChartVal = Math.max(data.fireNumber * 1.2, data.fv * 1.1, ...data.chartAcc, ...data.chartDec);
  const accumColor = "#F59E0B";
  const decColor = "#10B981";

  return (
    <div className={`min-h-screen transition-colors duration-300 font-sans ${isDark ? "bg-[#060609] text-white" : "bg-[#F5F7FA] text-black"}`}>
      <style>{`
        input[type=range]{accent-color:#F59E0B}
        .hover-lift{transition:all .3s cubic-bezier(.175,.885,.32,1.275)}
        .hover-lift:hover{transform:translateY(-2px)}
      `}</style>

      {/* HEADER */}
      <header className={`sticky top-0 z-40 border-b backdrop-blur-xl ${isDark ? "bg-[#060609]/80 border-white/10" : "bg-white/80 border-black/10"}`}>
        <div className="max-w-[1280px] mx-auto px-4 py-3 flex justify-between items-center flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center font-black text-black text-[18px]">🔥</div>
            <div>
              <div className="font-black tracking-widest text-[13px]">FIRE ULTRA v2</div>
              <div className={`text-[9px] ${isDark ? "text-white/40" : "text-black/40"}`}>Monte Carlo · FIRE Age · Coast · Barista</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setSoundOn(!soundOn)} className={`w-10 h-10 rounded-full border flex items-center justify-center ${isDark ? "bg-white/10 border-white/10" : "bg-black/5 border-black/10"}`}>{soundOn ? "🔊" : "🔇"}</button>
            <div className="flex gap-1 bg-black/20 rounded-full p-1">
              {["INR", "USD"].map((c) => (
                <button key={c} onClick={() => switchCurrency(c)} className={`px-3 py-1.5 rounded-full text-[11px] font-black transition ${currency === c ? "bg-amber-500 text-black" : isDark ? "text-white/60" : "text-black/60"}`}>
                  {c === "INR" ? "₹ INR" : "$ USD"}
                </button>
              ))}
            </div>
            <button onClick={() => setTheme(isDark ? "light" : "dark")} className={`w-10 h-10 rounded-full border flex items-center justify-center ${isDark ? "bg-white/10 border-white/10" : "bg-black/5 border-black/10"}`}>{isDark ? "🌙" : "☀️"}</button>
          </div>
        </div>
      </header>

      <div className="max-w-[1280px] mx-auto px-4 py-6 grid lg:grid-cols-[1.15fr_0.85fr] gap-6">
        {/* ========== LEFT: INPUTS + CHARTS ========== */}
        <div className="space-y-4">
          <div className={`rounded-[28px] p-6 md:p-7 ${isDark ? "bg-white/[0.04] border border-white/10" : "bg-white border border-black/10 shadow-lg"}`}>
            <div className="flex justify-between items-start flex-wrap gap-2">
              <div>
                <h1 className="text-[26px] md:text-[34px] font-black leading-[0.9]">
                  Retire at {retireAge} with<br />
                  <span className="text-amber-500">{fmt(data.fv, currency)}</span>
                  <span className={`text-[12px] ml-2 ${isDark ? "text-white/40" : "text-black/50"}`}>• {data.successRate.toFixed(0)}% success</span>
                </h1>
                {data.fireAge && (
                  <p className={`text-[11px] mt-1 ${isDark ? "text-white/50" : "text-black/60"}`}>
                    Earliest FIRE age: <strong className="text-green-400">{data.fireAge}</strong> {data.fireAge > retireAge ? `(${data.fireAge - retireAge} years later)` : "(on track!)"}
                  </p>
                )}
              </div>
              <span className={`text-[10px] px-2.5 py-1 rounded-full font-black ${isFireReady ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                {isFireReady ? "✓ FIRE READY" : `GAP: ${fmt(data.gap, currency)}`}
              </span>
            </div>

            {/* Core sliders */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <p className={`text-[9px] font-bold ${isDark ? "text-white/40" : "text-black/50"}`}>AGE</p>
                <input type="range" min="18" max="60" value={age} onChange={(e) => { setAge(+e.target.value); play("fire"); }} className="w-full h-1 rounded-full appearance-none mt-1" />
                <p className="text-[12px] font-bold mt-1">{age} → {retireAge} ({data.yearsToRetire}y)</p>
              </div>
              <div>
                <p className={`text-[9px] font-bold ${isDark ? "text-white/40" : "text-black/50"}`}>INCOME / yr</p>
                <input type="range" min={300000} max={5000000} step={50000} value={income} onChange={(e) => setIncome(+e.target.value)} className="w-full h-1 rounded-full appearance-none mt-1" />
                <p className="text-[12px] font-bold mt-1">{fmt(income, currency)} • {data.savingsRate.toFixed(0)}% saved</p>
              </div>
              <div>
                <p className={`text-[9px] font-bold ${isDark ? "text-white/40" : "text-black/50"}`}>MONTHLY SIP</p>
                <input type="range" min={5000} max={150000} step={1000} value={monthlyInvest} onChange={(e) => { setMonthlyInvest(+e.target.value); play("fire"); }} className="w-full h-1 rounded-full appearance-none mt-1" />
                <p className="text-[12px] font-bold mt-1 text-amber-500">{fmt(monthlyInvest, currency)}</p>
              </div>
              <div>
                <p className={`text-[9px] font-bold ${isDark ? "text-white/40" : "text-black/50"}`}>RETIRE AGE</p>
                <input type="range" min={age + 1} max="70" value={retireAge} onChange={(e) => { setRetireAge(+e.target.value); play("fire"); }} className="w-full h-1 rounded-full appearance-none mt-1" />
                <p className="text-[12px] font-bold mt-1">{retireAge} yrs</p>
              </div>
            </div>

            {/* Secondary sliders */}
            <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className={`p-2.5 rounded-xl ${isDark ? "bg-white/5" : "bg-gray-100"}`}>
                <p className="text-[9px] font-bold opacity-60">Return %</p>
                <input type="range" min="6" max="18" step="0.5" value={ret} onChange={(e) => setRet(+e.target.value)} className="w-full h-1 rounded-full appearance-none mt-1" />
                <p className="text-[11px] font-black text-green-500 mt-0.5">{ret}%</p>
              </div>
              <div className={`p-2.5 rounded-xl ${isDark ? "bg-white/5" : "bg-gray-100"}`}>
                <p className="text-[9px] font-bold opacity-60">Inflation %</p>
                <input type="range" min="3" max="9" step="0.5" value={inflation} onChange={(e) => setInflation(+e.target.value)} className="w-full h-1 rounded-full appearance-none mt-1" />
                <p className="text-[11px] font-black text-red-500 mt-0.5">{inflation}%</p>
              </div>
              <div className={`p-2.5 rounded-xl ${isDark ? "bg-white/5" : "bg-gray-100"}`}>
                <p className="text-[9px] font-bold opacity-60">Expense / mo</p>
                <input type="number" value={expense} onChange={(e) => setExpense(+e.target.value || 0)} className="bg-transparent w-full font-black outline-none mt-1 text-[12px]" />
              </div>
              <div className={`p-2.5 rounded-xl ${isDark ? "bg-white/5" : "bg-gray-100"}`}>
                <p className="text-[9px] font-bold opacity-60">SWR %</p>
                <input type="range" min="3" max="6" step="0.25" value={withdraw} onChange={(e) => setWithdraw(+e.target.value)} className="w-full h-1 rounded-full appearance-none mt-1" />
                <p className="text-[11px] font-black text-amber-500 mt-0.5">{withdraw}%</p>
              </div>
            </div>

            {/* Advanced section */}
            <details className={`rounded-xl p-3 mt-4 ${isDark ? "bg-white/5" : "bg-gray-100"}`}>
              <summary className="cursor-pointer text-[10px] font-black tracking-widest">ADVANCED: TAX · HEALTH · SOCIAL SECURITY · MEDICAL INFLATION</summary>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                <label className="text-[10px]">Tax on Withdrawal %<input type="number" value={taxRate} onChange={(e) => setTaxRate(+e.target.value || 0)} className={`w-full p-2 rounded-lg outline-none mt-1 text-xs ${isDark ? "bg-black/40" : "bg-white"}`} /></label>
                <label className="text-[10px]">Health / mo at retire<input type="number" value={health} onChange={(e) => setHealth(+e.target.value || 0)} className={`w-full p-2 rounded-lg outline-none mt-1 text-xs ${isDark ? "bg-black/40" : "bg-white"}`} /></label>
                <label className="text-[10px]">Social Security / mo<input type="number" value={social} onChange={(e) => setSocial(+e.target.value || 0)} className={`w-full p-2 rounded-lg outline-none mt-1 text-xs ${isDark ? "bg-black/40" : "bg-white"}`} /></label>
                <label className="text-[10px]">Medical Inflation %<input type="number" value={healthInflation} onChange={(e) => setHealthInflation(+e.target.value || 0)} className={`w-full p-2 rounded-lg outline-none mt-1 text-xs ${isDark ? "bg-black/40" : "bg-white"}`} /></label>
              </div>
            </details>
          </div>

          {/* CHART */}
          <div className={`rounded-[20px] p-4 ${isDark ? "bg-white/[0.03] border border-white/10" : "bg-white border border-black/10"}`}>
            <div className="flex justify-between items-center">
              <p className="text-[10px] font-black tracking-widest">WEALTH JOURNEY</p>
              <div className="flex gap-1">
                <button onClick={() => setShowDecumulation(false)} className={`text-[9px] px-2 py-1 rounded-full font-black ${!showDecumulation ? "bg-amber-500 text-black" : isDark ? "bg-white/10" : "bg-black/10"}`}>Accumulate</button>
                <button onClick={() => setShowDecumulation(true)} className={`text-[9px] px-2 py-1 rounded-full font-black ${showDecumulation ? "bg-green-500 text-white" : isDark ? "bg-white/10" : "bg-black/10"}`}>Drawdown</button>
              </div>
            </div>
            {!showDecumulation ? (
              <>
                <LineChart data={data.chartAcc} max={maxChartVal} color={accumColor} isDark={isDark} showMarker markerIndex={data.chartAcc.length - 1} />
                <div className={`flex justify-between text-[9px] mt-1 ${isDark ? "text-white/30" : "text-black/40"}`}>
                  <span>Age {age} • {fmt(savings, currency)}</span>
                  <span>Retire {retireAge} • {fmt(data.fv, currency)}</span>
                </div>
              </>
            ) : (
              <>
                <LineChart data={data.chartDec} max={maxChartVal} color={decColor} isDark={isDark} />
                <div className={`flex justify-between text-[9px] mt-1 ${isDark ? "text-white/30" : "text-black/40"}`}>
                  <span>Retire {retireAge} • {fmt(data.fv, currency)}</span>
                  <span>Age {retireAge + 20} • {fmt(data.chartDec[data.chartDec.length - 1], currency)}</span>
                </div>
              </>
            )}
            <div className={`mt-3 pt-3 border-t text-[10px] flex justify-between ${isDark ? "border-white/10 text-white/60" : "border-black/10 text-black/60"}`}>
              <span>Money lasts: <strong className={data.yearsLast >= 30 ? "text-green-500" : "text-red-500"}>{data.yearsLast} yrs</strong></span>
              <span>FIRE Number: <strong>{fmt(data.fireNumber, currency)}</strong></span>
            </div>
          </div>

          {/* AD SLOT */}
          <div className={`h-[90px] rounded-xl border border-dashed flex items-center justify-center text-[10px] font-bold tracking-widest opacity-50 ${isDark ? "bg-white/[0.02] border-white/10" : "bg-black/[0.02] border-black/10"}`}>
            AD SLOT · 728×90 (High CPC — Finance)
          </div>

          {/* WHAT-IF ENGINE */}
          <div className={`rounded-[20px] p-4 ${isDark ? "bg-white/[0.03] border border-white/10" : "bg-white border border-black/10"}`}>
            <p className="text-[10px] font-black tracking-widest">⚡ WHAT-IF ENGINE</p>
            <div className={`text-[11px] mt-2 space-y-1.5 ${isDark ? "text-white/70" : "text-black/70"}`}>
              <p>• <strong>One more year:</strong> extra corpus <strong className="text-amber-500">{fmt(data.oneMore.extraCorpus, currency)}</strong> (+{data.oneMore.extraSafety.toFixed(0)}% safety buffer)</p>
              <p>• <strong>+25% SIP:</strong> corpus becomes <strong className="text-green-500">{fmt(data.whatIf10Sip.newCorpus, currency)}</strong> {data.whatIf10Sip.gap <= 0 ? "→ already FIRE!" : `→ gap ${fmt(data.whatIf10Sip.gap, currency)}`}</p>
              <p>• <strong>Coast FIRE:</strong> need <strong className="text-blue-400">{fmt(data.coast, currency)}</strong> today; you have {fmt(savings, currency)} → {savings >= data.coast ? <span className="text-green-500">✓ ACHIEVED</span> : <span className="text-red-400">✗ {fmt(data.coast - savings, currency)} short</span>}</p>
              <p>• <strong>Ready score:</strong> {data.readyPct.toFixed(1)}% of FIRE number</p>
            </div>
          </div>

          {/* YEARLY TABLE */}
          <div className={`rounded-[20px] p-4 ${isDark ? "bg-white/[0.03] border border-white/10" : "bg-white border border-black/10"}`}>
            <div className="flex justify-between items-center">
              <p className="text-[10px] font-black tracking-widest">YEAR-BY-YEAR PROJECTION</p>
              <div className="flex gap-1">
                <button onClick={copyPlan} className="text-[9px] bg-amber-500 text-black px-2 py-1 rounded-full font-black">{copied ? "✓ Copied" : "📋 Copy"}</button>
                <button onClick={exportCSV} className={`text-[9px] px-2 py-1 rounded-full font-black ${isDark ? "bg-white/10" : "bg-black/10"}`}>📥 CSV</button>
              </div>
            </div>
            <div className="overflow-auto max-h-[260px] mt-2">
              <table className="w-full text-[11px]">
                <thead className={`sticky top-0 ${isDark ? "bg-white/[0.03]" : "bg-gray-100"}`}>
                  <tr className={isDark ? "text-white/50" : "text-black/50"}>
                    <th className="text-left p-1.5">Age</th>
                    <th className="text-right p-1.5">Corpus</th>
                    <th className="text-right p-1.5">vs FIRE</th>
                  </tr>
                </thead>
                <tbody>
                  {data.chartAcc.filter((_, i) => i === 0 || i === data.chartAcc.length - 1 || i % Math.max(1, Math.floor(data.chartAcc.length / 10)) === 0).map((v, i, arr) => {
                    const actualIdx = i === 0 ? 0 : i === arr.length - 1 ? data.chartAcc.length - 1 : i * Math.max(1, Math.floor(data.chartAcc.length / 10));
                    const isRetire = actualIdx === data.chartAcc.length - 1;
                    return (
                      <tr key={actualIdx} className={`border-t ${isDark ? "border-white/5" : "border-black/5"} ${isRetire ? "bg-green-500/10" : ""}`}>
                        <td className="p-1.5 font-bold">{age + actualIdx}{isRetire ? " (retire)" : ""}</td>
                        <td className="p-1.5 text-right font-bold">{fmt(v, currency)}</td>
                        <td className={`p-1.5 text-right ${v >= data.fireNumber ? "text-green-500" : "text-red-400"}`}>
                          {v >= data.fireNumber ? "✓" : `${((v / data.fireNumber) * 100).toFixed(0)}%`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ========== RIGHT: FIRE TYPES + MC ========== */}
        <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div className={`rounded-[28px] p-6 ${isDark ? "bg-white/[0.04] border border-white/10" : "bg-white border border-black/10 shadow-lg"}`}>
            <p className={`text-[10px] tracking-widest font-black ${isDark ? "text-white/40" : "text-black/50"}`}>5 TYPES OF FIRE</p>
            <div className="grid grid-cols-2 gap-2.5 mt-3">
              <div className={`rounded-xl p-3 ${isDark ? "bg-white/5" : "bg-gray-50"}`}>
                <p className={`text-[9px] ${isDark ? "text-white/40" : "text-black/50"}`}>LEAN FIRE</p>
                <p className="font-black mt-1">{fmt(data.lean, currency)}</p>
                <p className={`text-[9px] mt-1 ${isDark ? "text-white/30" : "text-black/40"}`}>70% of FIRE</p>
              </div>
              <div className={`rounded-xl p-3 border-2 ${isFireReady ? "border-green-500/40 bg-green-500/10" : "border-amber-500/40 bg-amber-500/10"}`}>
                <p className={`text-[9px] ${isDark ? "text-white/40" : "text-black/50"}`}>REGULAR FIRE</p>
                <p className="font-black mt-1">{fmt(data.fireNumber, currency)}</p>
                <p className={`text-[9px] mt-1 ${isFireReady ? "text-green-500" : "text-amber-500"}`}>{isFireReady ? "✓ Ready" : `Gap ${fmt(data.gap, currency)}`}</p>
              </div>
              <div className={`rounded-xl p-3 ${isDark ? "bg-white/5" : "bg-gray-50"}`}>
                <p className={`text-[9px] ${isDark ? "text-white/40" : "text-black/50"}`}>FAT FIRE</p>
                <p className="font-black mt-1">{fmt(data.fat, currency)}</p>
                <p className={`text-[9px] mt-1 ${isDark ? "text-white/30" : "text-black/40"}`}>150% of FIRE</p>
              </div>
              <div className={`rounded-xl p-3 ${isDark ? "bg-white/5" : "bg-gray-50"}`}>
                <p className={`text-[9px] ${isDark ? "text-white/40" : "text-black/50"}`}>COAST FIRE</p>
                <p className={`font-black mt-1 ${savings >= data.coast ? "text-green-500" : "text-blue-400"}`}>{fmt(data.coast, currency)}</p>
                <p className={`text-[9px] mt-1 ${isDark ? "text-white/30" : "text-black/40"}`}>{savings >= data.coast ? "✓ Achieved" : `Need ${fmt(data.coast - savings, currency)}`}</p>
              </div>
            </div>
            <div className={`rounded-xl p-3 mt-3 border ${isDark ? "bg-white/5 border-purple-500/20" : "bg-purple-50 border-purple-200"}`}>
              <p className={`text-[9px] ${isDark ? "text-white/40" : "text-black/50"}`}>BARISTA FIRE</p>
              <p className="font-black mt-1">{fmt(data.barista, currency)} <span className={`text-[10px] font-normal ${isDark ? "text-white/40" : "text-black/50"}`}>+ {fmt(social, currency)}/mo part-time</span></p>
            </div>

            {/* Monte Carlo */}
            <div className="mt-4">
              <div className="flex justify-between text-[10px]">
                <span className={isDark ? "text-white/60" : "text-black/60"}>Monte Carlo Success (30y)</span>
                <span className={`font-black ${data.successRate > 80 ? "text-green-500" : data.successRate > 60 ? "text-yellow-500" : "text-red-500"}`}>{data.successRate.toFixed(1)}%</span>
              </div>
              <div className={`h-2 rounded-full mt-1 overflow-hidden ${isDark ? "bg-white/10" : "bg-black/10"}`}>
                <div className={`h-full ${data.successRate > 80 ? "bg-gradient-to-r from-green-500 to-emerald-400" : data.successRate > 60 ? "bg-gradient-to-r from-yellow-500 to-orange-400" : "bg-gradient-to-r from-red-500 to-pink-500"}`} style={{ width: `${data.successRate}%` }} />
              </div>
              <p className={`text-[9px] mt-1 ${isDark ? "text-white/30" : "text-black/40"}`}>1,000 simulations with ±15% market variance</p>
            </div>

            <button onClick={copyPlan} className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-black font-black hover-lift">
              {copied ? "✓ Copied!" : "Copy Ultra FIRE Plan 🔥"}
            </button>
          </div>

          <div className={`rounded-[20px] p-4 ${isDark ? "bg-white/[0.03] border border-white/10" : "bg-white border border-black/10"}`}>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={save} className={`py-2 rounded-xl font-black text-[11px] ${isDark ? "bg-white/10 hover:bg-white/15" : "bg-gray-100 hover:bg-gray-200"}`}>💾 Save</button>
              <button onClick={load} className={`py-2 rounded-xl font-black text-[11px] ${isDark ? "bg-white/10 hover:bg-white/15" : "bg-gray-100 hover:bg-gray-200"}`}>📂 Load</button>
              <button onClick={reset} className={`py-2 rounded-xl font-black text-[11px] ${isDark ? "bg-red-500/10 text-red-400" : "bg-red-50 text-red-600"}`}>↻ Reset</button>
            </div>
            {saveMsg && <p className="text-center text-[11px] mt-2 font-black text-green-500">{saveMsg}</p>}
          </div>

          <div className={`h-[250px] rounded-[20px] border border-dashed flex items-center justify-center text-[10px] font-bold tracking-widest ${isDark ? "bg-white/[0.02] border-white/10 text-white/30" : "bg-black/[0.02] border-black/10 text-black/30"}`}>
            AD SLOT · 300×250
          </div>
        </div>
      </div>

      {/* ================= SEO CONTENT ================= */}
      <article className={`max-w-[900px] mx-auto px-4 py-10 ${isDark ? "text-white/80" : "text-black/80"}`}>
        <h1 className="text-[30px] md:text-[42px] font-black tracking-tight text-amber-500 leading-tight">
          FIRE Calculator 2025 — Financial Independence Retire Early Calculator (Free, India + USA)
        </h1>
        <p className="mt-4 text-[14px] leading-relaxed">
          Our <strong>free FIRE calculator</strong> helps you find the exact retirement number you need to achieve <strong>Financial Independence, Retire Early (FIRE)</strong>. Whether you plan to retire at 40, 45, or 50, this advanced tool calculates your <strong>FIRE number, Coast FIRE, Barista FIRE, Lean FIRE, Fat FIRE,</strong> and Regular FIRE targets — plus a <strong>Monte Carlo simulation</strong> to test whether your corpus survives 30 years of market volatility. It works for both Indian investors (₹) and global investors ($), with tax, health inflation, and social security factored in. Unlike basic FIRE calculators, this tool shows <strong>year-by-year projections, drawdown simulations, FIRE age finder, one-more-year analysis, and a what-if engine</strong> — so you can actually plan, not just dream.
        </p>

        <h2 className="text-[22px] md:text-[28px] font-black mt-8 text-amber-500">What is a FIRE Calculator?</h2>
        <p className="mt-3 text-[14px] leading-relaxed">
          A <strong>FIRE calculator</strong> is a financial planning tool that computes how much money you need to save and invest so you can retire early and live off your investments indefinitely. It takes your current age, monthly income, monthly investment, expected return rate, inflation, and annual expenses — then applies the standard <strong>4% safe withdrawal rate (SWR)</strong> to calculate your <strong>FIRE number</strong> (target retirement corpus). The FIRE calculator is the single most important tool for anyone pursuing financial independence because it converts vague "save more" advice into a concrete target: a specific rupee or dollar number you need to hit by a specific age.
        </p>
        <p className="mt-3 text-[14px] leading-relaxed">
          Unlike generic retirement calculators that assume a fixed retirement age of 60, a FIRE calculator is built around <strong>early retirement</strong> — typically 35–50 — and thus needs to account for inflation over a longer decumulation phase, higher medical costs with age, and sequence-of-returns risk. Our FIRE calculator handles all of these complexities in a single screen.
        </p>

        <h2 className="text-[22px] md:text-[28px] font-black mt-8 text-amber-500">What is FIRE (Financial Independence, Retire Early)?</h2>
        <p className="mt-3 text-[14px] leading-relaxed">
          <strong>FIRE</strong> is a lifestyle movement built on two pillars: extreme savings (typically 50%–70% of income) and aggressive investing (usually in low-cost equity index funds). The goal is to accumulate enough wealth — typically <strong>25× your annual expenses</strong> — so that a 4% annual withdrawal from your portfolio covers your living costs forever. Once you hit your FIRE number, you are technically <strong>financially independent</strong> — work becomes optional, not mandatory.
        </p>
        <p className="mt-3 text-[14px] leading-relaxed">
          The FIRE movement gained massive popularity through the <strong>Mr. Money Mustache blog, the ChooseFI podcast, and the book "Your Money or Your Life"</strong>. Today, millions of people — from software engineers in Bangalore to teachers in Ohio — use FIRE principles to retire decades earlier than the conventional 60. The Indian FIRE community is particularly active, with popular subreddits like <em>r/FIREIndia</em> and <em>r/IndiaInvestments</em> helping young earners build their FIRE roadmaps.
        </p>

        <h2 className="text-[22px] md:text-[28px] font-black mt-8 text-amber-500">The 4% Rule Explained (Bengen's Rule)</h2>
        <p className="mt-3 text-[14px] leading-relaxed">
          The <strong>4% rule</strong>, first proposed by financial planner William Bengen in 1994, states that you can safely withdraw <strong>4% of your retirement corpus each year</strong>, adjusted for inflation, and your money should last at least 30 years. This is derived from the Trinity Study, which tested historical stock/bond portfolios and found that a 4% withdrawal rate never ran out of money over any 30-year period from 1926 to 1995.
        </p>
        <p className="mt-3 text-[14px] leading-relaxed">
          The inverse gives us the FIRE number formula: <strong>FIRE Number = Annual Expenses ÷ Withdrawal Rate</strong>. At 4%, that means <strong>25× annual expenses</strong>. If you spend ₹6 lakh/year, your FIRE number is ₹1.5 crore. If you spend $40,000/year, your FIRE number is $1M. Some planners recommend a more conservative <strong>3.25%–3.5% SWR</strong> for early retirees (since they need the money to last 40–50 years, not just 30), while optimists use 4.5%–5%.
        </p>

        <h2 className="text-[22px] md:text-[28px] font-black mt-8 text-amber-500">The 5 Types of FIRE (Explained)</h2>
        <div className="mt-4">
          {[
            ["1. Lean FIRE", "Lean FIRE means achieving financial independence on a minimal budget — typically ₹30–50 lakh (or $300K–$500K) in today's money. You retire early but live frugally: no international vacations, no luxury cars, modest housing. Lean FIRE is popular among minimalists and people willing to sacrifice lifestyle for freedom. Our calculator shows Lean FIRE as 70% of the Regular FIRE number."],
            ["2. Regular / Traditional FIRE", "Regular FIRE is the standard FIRE target — 25× annual expenses at a 4% withdrawal rate. It assumes you maintain your current lifestyle after early retirement. This is the number most FIRE calculators show, and it's the one our tool displays most prominently."],
            ["3. Fat FIRE", "Fat FIRE means achieving financial independence with a luxury lifestyle — dining out, travel, premium healthcare, and comfort. The target is typically 150%–200% of Regular FIRE, or roughly 33×–40× annual expenses. Fat FIRE is popular among high-income earners (tech, finance, medicine) who want early retirement without sacrifice."],
            ["4. Coast FIRE", "Coast FIRE is the point at which you have enough invested that — even if you STOP contributing today — the existing corpus will grow to your full FIRE number by traditional retirement age. After hitting Coast FIRE, you can \"coast\" with a lower-stress job that covers current expenses. Mathematically, Coast FIRE = FIRE Number / (1 + return)^years to retirement."],
            ["5. Barista FIRE", "Barista FIRE is a hybrid: you hit a partial FIRE number and then work part-time (like a barista at Starbucks) to cover health insurance and daily expenses. Your investments cover the rest. This is popular among people who don't want to fully retire but want the freedom to work on their own terms."],
          ].map(([title, body], i) => (
            <Accordion key={i} title={title} isOpen={openAccordion === `g${i}`} onToggle={() => setOpenAccordion(openAccordion === `g${i}` ? null : `g${i}`)} isDark={isDark}>{body}</Accordion>
          ))}
        </div>

        <h2 className="text-[22px] md:text-[28px] font-black mt-8 text-amber-500">How to Use This FIRE Calculator — Step-by-Step Guide</h2>
        <ol className={`mt-3 text-[14px] leading-relaxed list-decimal pl-6 space-y-1.5 ${isDark ? "text-white/80" : "text-black/80"}`}>
          <li><strong>Select Currency</strong> — ₹ for INR, $ for USD. All values convert automatically.</li>
          <li><strong>Enter your current age</strong> — this drives the investment horizon.</li>
          <li><strong>Enter your target retirement age</strong> — the sooner, the more aggressive your savings must be.</li>
          <li><strong>Enter annual income</strong> — used to compute savings rate and affordability.</li>
          <li><strong>Enter current savings / investments</strong> — total portfolio value today.</li>
          <li><strong>Enter monthly SIP / investment</strong> — the amount you invest every month.</li>
          <li><strong>Enter expected return %</strong> — 12% for Indian equity, 7%–10% for US index funds.</li>
          <li><strong>Enter inflation %</strong> — 6% for India, 2%–3% for USA.</li>
          <li><strong>Enter current monthly expenses</strong> — post-retirement lifestyle is assumed similar.</li>
          <li><strong>Enter withdrawal rate</strong> — 4% is standard, 3.5% for ultra-safe, 5% for aggressive.</li>
          <li><strong>Advanced: tax on withdrawal</strong> — LTCG, income tax, etc.</li>
          <li><strong>Advanced: health / medical costs</strong> — inflates at higher rate (8% typical).</li>
          <li><strong>Advanced: social security / pension</strong> — monthly income in retirement.</li>
          <li><strong>Review the 5 FIRE types</strong> — Lean, Regular, Fat, Coast, Barista numbers all appear.</li>
          <li><strong>Check your "FIRE age"</strong> — the earliest age you can actually retire.</li>
          <li><strong>Export plan</strong> — copy report or download CSV for your records.</li>
        </ol>

        <h2 className="text-[22px] md:text-[28px] font-black mt-8 text-amber-500">What is Monte Carlo Simulation?</h2>
        <p className="mt-3 text-[14px] leading-relaxed">
          <strong>Monte Carlo simulation</strong> is a statistical technique that runs hundreds or thousands of retirement scenarios with <strong>random market returns</strong> to test how often your FIRE corpus survives. Instead of assuming a constant 12% return (which never happens in real markets), Monte Carlo simulation applies returns varying between, say, −15% and +27% each year, then checks whether your money lasts through 30 years of retirement.
        </p>
        <p className="mt-3 text-[14px] leading-relaxed">
          Our FIRE calculator runs <strong>1,000 simulations</strong>, each with random annual returns, and reports what percentage of them succeed. A <strong>success rate above 80% is considered safe</strong>; below 60% is dangerous. Monte Carlo is particularly important for early retirees because a market crash in the first few years of retirement (<em>sequence-of-returns risk</em>) can permanently damage a portfolio, even if long-term averages are fine.
        </p>

        <h2 className="text-[22px] md:text-[28px] font-black mt-8 text-amber-500">Understanding Your FIRE Number</h2>
        <p className="mt-3 text-[14px] leading-relaxed">
          Your <strong>FIRE number</strong> is the total investment corpus you need to never work again. It's calculated as: <strong>FIRE Number = (Annual Expenses + Annual Health Costs) × (1 + Tax Rate) ÷ SWR</strong>. For example, if your monthly expenses are ₹60,000 and health costs are ₹5,000 at retirement, your annual need is ₹7.8 lakh (plus tax). At 4% SWR, your FIRE number is ₹1.95 crore. Every input matters: raising expenses by ₹10,000/month adds roughly ₹30 lakh to your FIRE target; lowering SWR from 4% to 3.5% adds about 14% more corpus needed.
        </p>

        <h2 className="text-[22px] md:text-[28px] font-black mt-8 text-amber-500">FIRE Glossary</h2>
        <div className="mt-4">
          {[
            ["FIRE", "Financial Independence, Retire Early — a movement to achieve financial freedom decades before traditional retirement age."],
            ["FIRE Number", "The total retirement corpus needed to retire early. Calculated as annual expenses ÷ safe withdrawal rate."],
            ["SWR (Safe Withdrawal Rate)", "The maximum % of your corpus you can withdraw annually without depleting it. Standard is 4%; safe for early retirees is 3.25%–3.5%."],
            ["Coast FIRE", "The point at which your existing corpus can grow to your full FIRE number without any further contributions."],
            ["Barista FIRE", "Partial FIRE with part-time work covering health insurance and daily expenses."],
            ["Lean FIRE", "FIRE on a minimal, frugal budget — typically 70% of Regular FIRE."],
            ["Fat FIRE", "FIRE with a luxury lifestyle — typically 150% of Regular FIRE."],
            ["4% Rule", "Bengen's rule stating that withdrawing 4% of corpus per year (inflation-adjusted) should last 30+ years."],
            ["Sequence-of-Returns Risk", "The risk that poor returns early in retirement permanently damage your corpus."],
            ["Coast Number", "The corpus value today that guarantees FIRE at target retirement age with zero additional investment."],
            ["Accumulation Phase", "The years spent saving and investing before retirement."],
            ["Decumulation Phase", "The retirement years when you withdraw from your corpus to cover expenses."],
          ].map(([title, body], i) => (
            <Accordion key={i} title={title} isOpen={openAccordion === `glo${i}`} onToggle={() => setOpenAccordion(openAccordion === `glo${i}` ? null : `glo${i}`)} isDark={isDark}>{body}</Accordion>
          ))}
        </div>

        <h2 className="text-[22px] md:text-[28px] font-black mt-8 text-amber-500">Frequently Asked Questions (FAQ)</h2>
        <div className="mt-4">
          {[
            ["What is a FIRE calculator?", "A FIRE calculator computes the total retirement corpus you need to achieve financial independence and retire early. It uses your income, savings, investment returns, inflation, and expenses to calculate a target number based on the 4% safe withdrawal rule."],
            ["What does FIRE stand for?", "FIRE stands for Financial Independence, Retire Early. It's a movement where people save and invest 50%–70% of their income to retire in their 30s or 40s instead of 60."],
            ["What is the 4% rule?", "The 4% rule states that withdrawing 4% of your retirement corpus per year (adjusted for inflation) should allow your money to last 30+ years. It implies your FIRE number is 25× your annual expenses."],
            ["What is a good FIRE number?", "A good FIRE number is 25× your annual expenses at a 4% SWR. For ₹6L/year expense, that's ₹1.5 crore. For $40K/year expense, that's $1M. Fat FIRE requires 33×–40× expenses; Lean FIRE needs only ~17×."],
            ["How is FIRE different from regular retirement?", "FIRE targets retirement at 35–50, while regular retirement targets 60+. Because FIRE requires money to last 40–50 years (not 20–30), the SWR should be lower (3.25%–3.5%) and health-cost inflation matters more."],
            ["What is Coast FIRE?", "Coast FIRE is the corpus you need TODAY such that — with no further investment — it will grow to your full FIRE number by traditional retirement age. Once you hit Coast FIRE, you can work lower-stress jobs that just cover current expenses."],
            ["What is Barista FIRE?", "Barista FIRE means you've accumulated enough to cover most expenses, and take a part-time job (like a barista at Starbucks, mainly for health insurance) to bridge the gap until full retirement."],
            ["What is Lean FIRE vs Fat FIRE?", "Lean FIRE is financial independence on a minimal budget (70% of Regular FIRE) — frugal but free. Fat FIRE is financial independence with a luxury lifestyle (150%+ of Regular FIRE) — expensive but comfortable."],
            ["What return rate should I assume for FIRE?", "For Indian equity: 11%–13%. For US index funds (S&P 500 historical): 9%–10% nominal. Conservative planners use 8%–10%. Always run Monte Carlo with ±15% variance to stress-test your plan."],
            ["What is Monte Carlo simulation in FIRE?", "Monte Carlo simulation runs 1,000+ retirement scenarios with random market returns and checks what % of them succeed. A success rate above 80% is considered safe; below 60% means your plan is fragile."],
            ["Can I retire at 40 in India?", "Yes — with disciplined saving (50%+ of income), 12% equity returns, and moderate lifestyle expenses. Many Indian tech professionals FIRE by 40 with ₹3–5 crore portfolios. Use this calculator to compute your exact number."],
            ["What is the safest withdrawal rate for early retirement?", "For a 40–50 year retirement, use 3.25%–3.5% instead of the traditional 4%. This provides extra safety against sequence-of-returns risk. Some planners recommend a dynamic withdrawal strategy (guardrails)."],
            ["How does inflation affect FIRE?", "Inflation is the silent killer of FIRE. At 6% inflation, your ₹1 crore corpus loses 50% of its purchasing power in 12 years. Medical costs inflate at 8%–10% — even faster. Our calculator adjusts all expenses for inflation automatically."],
            ["What is the FIRE age finder?", "It finds the earliest age at which your projected corpus will exceed the FIRE number at that age — factoring in both investment growth and rising expenses due to inflation."],
            ["Is this FIRE calculator free?", "Yes, 100% free, no signup, no email. All calculations run in your browser — your financial data never leaves your device."],
          ].map(([q, a], i) => (
            <Accordion key={i} title={q} isOpen={openAccordion === `f${i}`} onToggle={() => setOpenAccordion(openAccordion === `f${i}` ? null : `f${i}`)} isDark={isDark}>{a}</Accordion>
          ))}
        </div>

        <h2 className="text-[22px] md:text-[28px] font-black mt-8 text-amber-500">FIRE Investment Tips for 2025</h2>
        <ul className={`mt-3 text-[14px] leading-relaxed list-disc pl-6 space-y-1.5 ${isDark ? "text-white/80" : "text-black/80"}`}>
          <li><strong>Track savings rate, not returns:</strong> A 60% savings rate at 10% return beats a 30% savings rate at 15% return — savings rate dominates early FIRE math.</li>
          <li><strong>Use step-up SIPs:</strong> Increase SIP by 10%–15% each year as your salary grows. This alone can cut 5+ years off your FIRE timeline.</li>
          <li><strong>Keep lifestyle inflation in check:</strong> Increasing expenses by ₹10K/month pushes FIRE number up by ~₹30L. Frugality beats optimization.</li>
          <li><strong>Use tax-advantaged accounts:</strong> Max out EPF/NPS/PPF (India) or 401(k)/Roth IRA (USA) before taxable accounts.</li>
          <li><strong>Build a 2-year emergency fund:</strong> Early retirees need bigger buffers because they can't rely on salary income in a crash.</li>
          <li><strong>Plan for health insurance separately:</strong> Health costs inflate at 8%–10%, faster than CPI. Buy a super top-up policy before retirement.</li>
          <li><strong>Diversify globally:</strong> 60%–70% Indian equity + 20% US/international + 10%–20% debt is a solid FIRE portfolio.</li>
          <li><strong>Beware sequence-of-returns risk:</strong> A market crash in year 1–3 of retirement can permanently damage your plan. Consider a 2-year cash buffer in retirement.</li>
          <li><strong>Use the 25× rule as a starting point, not a target:</strong> Adjust for your specific lifestyle, health, and risk tolerance.</li>
          <li><strong>Review annually:</strong> Rebalance once a year, but don't tinker monthly — noise kills returns.</li>
        </ul>

        <h2 className="text-[22px] md:text-[28px] font-black mt-8 text-amber-500">Related FIRE Keywords</h2>
        <p className={`mt-3 text-[12px] leading-relaxed ${isDark ? "text-white/60" : "text-black/60"}`}>
          FIRE calculator · FIRE number calculator · financial independence calculator · retire early calculator · Coast FIRE calculator · Barista FIRE calculator · Lean FIRE calculator · Fat FIRE calculator · 4% rule calculator · safe withdrawal rate calculator · Monte Carlo retirement calculator · FIRE India calculator · FIRE calculator 2025 · early retirement calculator · corpus calculator · retirement corpus calculator · how much to retire early · financial freedom calculator · 25x rule calculator · MRR calculator · FIRE calculator with inflation · FIRE calculator with tax · SWP calculator · mutual fund corpus calculator · SIP for FIRE · FIRE age calculator · when can I retire calculator · how much do I need to retire · retirement number calculator · Indian FIRE calculator · USA FIRE calculator
        </p>

        <div className={`mt-8 p-4 rounded-xl text-[11px] ${isDark ? "bg-white/5 text-white/50" : "bg-gray-100 text-black/60"}`}>
          <strong>Disclaimer:</strong> This FIRE calculator provides estimates for educational purposes only. Actual retirement outcomes depend on market returns, inflation, taxes, healthcare costs, and personal lifestyle changes — none of which can be perfectly predicted. Monte Carlo simulations show probability distributions, not guarantees. Consult a SEBI-registered investment advisor (India) or fiduciary financial planner (USA) before making major retirement decisions. Past returns never guarantee future performance.
        </div>
      </article>
    </div>
  );
}
