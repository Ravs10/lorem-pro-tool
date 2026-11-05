"use client";
import { useState, useMemo } from "react";
import Link from "next/link";

type Tab = "FD" | "RD" | "CI" | "PPF";

const fmt = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");
const fmtL = (n: number) => {
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(2)} L`;
  return fmt(n);
};

const BANKS = [
  { name: "SBI", fd: 7.0, rd: 6.5 },
  { name: "HDFC", fd: 7.25, rd: 6.75 },
  { name: "ICICI", fd: 7.2, rd: 6.7 },
  { name: "Post Office", fd: 7.5, rd: 6.7 },
  { name: "PPF Govt", fd: 7.1, rd: 7.1 },
];

export default function FdRdPro() {
  const [tab, setTab] = useState<Tab>("FD");
  const [isDark, setIsDark] = useState(true);
  const [isSenior, setIsSenior] = useState(false);
  const [taxSlab, setTaxSlab] = useState(20); // 0, 5, 20, 30
  const [showTable, setShowTable] = useState(true);
  const [showCompare, setShowCompare] = useState(true);
  const [saveMsg, setSaveMsg] = useState("");
  const [copied, setCopied] = useState(false);

  // FD
  const [fdP, setFdP] = useState(200000);
  const [fdRate, setFdRate] = useState(7.1);
  const [fdYears, setFdYears] = useState(5);
  // RD
  const [rdMonthly, setRdMonthly] = useState(5000);
  const [rdRate, setRdRate] = useState(6.5);
  const [rdYears, setRdYears] = useState(5);
  // CI
  const [ciP, setCiP] = useState(100000);
  const [ciMonthly, setCiMonthly] = useState(10000);
  const [ciRate, setCiRate] = useState(12);
  const [ciYears, setCiYears] = useState(15);
  // PPF
  const [ppfYearly, setPpfYearly] = useState(150000);
  const [ppfRate, setPpfRate] = useState(7.1);
  const [ppfYears, setPpfYears] = useState(15);

  const effFdRate = fdRate + (isSenior ? 0.5 : 0);
  const effRdRate = rdRate + (isSenior ? 0.5 : 0);

  // ---- CALC HELPERS ----
  const calcFD = (P: number, r: number, y: number) => {
    const mat = P * Math.pow(1 + r / 100 / 4, 4 * y);
    return { invested: P, gain: mat - P, maturity: mat };
  };
  const calcRD = (M: number, r: number, y: number) => {
    const i = r / 100 / 12;
    const n = y * 12;
    const mat = M * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
    return { invested: M * n, gain: mat - M * n, maturity: mat };
  };
  const calcCI = (P: number, M: number, r: number, y: number) => {
    const lump = P * Math.pow(1 + r / 100, y);
    const i = r / 100 / 12;
    const n = y * 12;
    const sip = M * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
    const mat = lump + sip;
    const inv = P + M * n;
    return { invested: inv, gain: mat - inv, maturity: mat };
  };
  const calcPPF = (Y: number, r: number, y: number) => {
    const i = r / 100;
    const mat = Y * ((Math.pow(1 + i, y) - 1) / i) * (1 + i);
    return { invested: Y * y, gain: mat - Y * y, maturity: mat };
  };

  const current = useMemo(() => {
    if (tab === "FD") return calcFD(fdP, effFdRate, fdYears);
    if (tab === "RD") return calcRD(rdMonthly, effRdRate, rdYears);
    if (tab === "CI") return calcCI(ciP, ciMonthly, ciRate, ciYears);
    return calcPPF(ppfYearly, ppfRate, ppfYears);
  }, [tab, fdP, effFdRate, fdYears, rdMonthly, effRdRate, rdYears, ciP, ciMonthly, ciRate, ciYears, ppfYearly, ppfRate, ppfYears]);

  // Tax - FD/RD pe tax lagta hai, PPF pe 0, CI pe LTCG 12.5% approx
  const taxOnGain = tab === "PPF" ? 0 : tab === "CI" ? current.gain * 0.125 : current.gain * (taxSlab / 100);
  const afterTaxMaturity = current.maturity - taxOnGain;
  const afterTaxGain = current.gain - taxOnGain;

  // Year-wise table
  const yearTable = useMemo(() => {
    const years = tab === "FD" ? fdYears : tab === "RD" ? rdYears : tab === "CI" ? ciYears : ppfYears;
    const arr: { year: number; invested: number; maturity: number; gain: number }[] = [];
    for (let y = 1; y <= Math.min(years, 30); y++) {
      let r;
      if (tab === "FD") r = calcFD(fdP, effFdRate, y);
      else if (tab === "RD") r = calcRD(rdMonthly, effRdRate, y);
      else if (tab === "CI") r = calcCI(ciP, ciMonthly, ciRate, y);
      else r = calcPPF(ppfYearly, ppfRate, y);
      arr.push({ year: y, invested: r.invested, maturity: r.maturity, gain: r.gain });
    }
    return arr;
  }, [tab, fdP, effFdRate, fdYears, rdMonthly, effRdRate, rdYears, ciP, ciMonthly, ciRate, ciYears, ppfYearly, ppfRate, ppfYears]);

  // 4-Way Comparison - Same paisa sab me
  const compare = useMemo(() => {
    const baseMonthly = tab === "RD" ? rdMonthly : tab === "CI" ? ciMonthly : 5000;
    const baseYears = tab === "FD" ? fdYears : tab === "RD" ? rdYears : tab === "CI" ? ciYears : ppfYears;
    const lumpForFD = baseMonthly * 12 * baseYears; // agar RD wala paisa ek saath FD me dalta
    const fd = calcFD(lumpForFD, effFdRate, baseYears);
    const rd = calcRD(baseMonthly, effRdRate, baseYears);
    const ci = calcCI(0, baseMonthly, 12, baseYears);
    const ppf = calcPPF(Math.min(150000, baseMonthly * 12), 7.1, Math.max(baseYears, 15));
    return [
      { name: "🏦 FD", ...fd, taxFree: false },
      { name: "📅 RD", ...rd, taxFree: false },
      { name: "📈 Compound 12%", ...ci, taxFree: false },
      { name: "🛡️ PPF Tax Free", ...ppf, taxFree: true },
    ];
  }, [tab, rdMonthly, ciMonthly, fdYears, rdYears, ciYears, ppfYears, effFdRate, effRdRate]);

  const bestCompare = compare.reduce((a, b) => (b.maturity > a.maturity ? b : a));

  const barPct = current.maturity > 0 ? (current.invested / current.maturity) * 100 : 50;

  // Actions
  const copyResult = () => {
    const txt = `💰 ${tab} Calculator - Lorem Pro Tool\nInvested: ${fmt(current.invested)}\nGain: ${fmt(current.gain)}\nMaturity: ${fmt(current.maturity)}\nAfter Tax: ${fmt(afterTaxMaturity)}`;
    navigator.clipboard.writeText(txt);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };
  const exportCSV = () => {
    const rows = [["Year", "Invested", "Maturity", "Gain"], ...yearTable.map(r => [r.year, Math.round(r.invested), Math.round(r.maturity), Math.round(r.gain)])];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${tab}-calculator.csv`; a.click(); URL.revokeObjectURL(url);
  };
  const save = () => {
    localStorage.setItem("fd-rd-pro-v1", JSON.stringify({ fdP, fdRate, fdYears, rdMonthly, rdRate, rdYears, ciP, ciMonthly, ciRate, ciYears, ppfYearly, ppfRate, ppfYears, isSenior, taxSlab, tab }));
    setSaveMsg("✓ Saved!"); setTimeout(() => setSaveMsg(""), 2000);
  };
  const load = () => {
    const d = JSON.parse(localStorage.getItem("fd-rd-pro-v1") || "null");
    if (!d) { setSaveMsg("Nothing saved"); setTimeout(() => setSaveMsg(""), 2000); return; }
    setFdP(d.fdP); setFdRate(d.fdRate); setFdYears(d.fdYears);
    setRdMonthly(d.rdMonthly); setRdRate(d.rdRate); setRdYears(d.rdYears);
    setCiP(d.ciP); setCiMonthly(d.ciMonthly); setCiRate(d.ciRate); setCiYears(d.ciYears);
    setPpfYearly(d.ppfYearly); setPpfRate(d.ppfRate); setPpfYears(d.ppfYears);
    setIsSenior(d.isSenior); setTaxSlab(d.taxSlab); setTab(d.tab);
    setSaveMsg("✓ Loaded!"); setTimeout(() => setSaveMsg(""), 2000);
  };
  const reset = () => {
    setFdP(200000); setFdRate(7.1); setFdYears(5);
    setRdMonthly(5000); setRdRate(6.5); setRdYears(5);
    setCiP(100000); setCiMonthly(10000); setCiRate(12); setCiYears(15);
    setPpfYearly(150000); setPpfRate(7.1); setPpfYears(15);
    setIsSenior(false); setTaxSlab(20);
    setSaveMsg("✓ Reset!"); setTimeout(() => setSaveMsg(""), 2000);
  };

  const Input = ({ label, value, onChange, max, step = 1, suffix }: any) => (
    <div className="group">
      <label className={`block text-[12px] font-bold mt-4 transition group-hover:text-[#FF7A1A] ${isDark ? "text-[#FF7A1A]" : "text-[#D65A00]"}`}>{label}</label>
      <div className="flex gap-2 mt-1">
        <input type="number" value={value || ""} onChange={(e) => onChange(Number(e.target.value) || 0)}
          className={`flex-1 px-3 py-2.5 rounded-xl border outline-none font-bold text-[14px] transition hover:border-[#FF7A1A] focus:border-[#FF7A1A] focus:ring-2 focus:ring-[#FF7A1A]/20 ${isDark ? "bg-white/5 border-white/10 text-white" : "bg-gray-100 border-black/10 text-black"}`} />
        {suffix && <span className={`px-3 py-2.5 rounded-xl text-[12px] font-black ${isDark ? "bg-white/10" : "bg-black/5"}`}>{suffix}</span>}
      </div>
      <input type="range" min={0} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))}
        className="w-full mt-2 accent-[#FF7A1A] cursor-pointer hover:scale-y-125 transition" />
    </div>
  );

  const TabBtn = ({ id, emoji, title, sub }: any) => (
    <button onClick={() => setTab(id)}
      className={`flex-1 py-3 px-1 rounded-xl font-black text-[12px] md:text-[13px] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg active:scale-95 ${tab === id ? "bg-[#FF7A1A] text-white shadow-[0_8px_20px_rgba(255,122,26,0.4)] scale-[1.02]" : isDark ? "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white" : "bg-black/5 text-black/60 hover:bg-black/10 hover:text-black"}`}>
      <span className="text-[18px] block">{emoji}</span>
      {title}
      <span className="block text-[9px] font-bold opacity-70">{sub}</span>
    </button>
  );

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? "bg-[#0A0A14] text-white" : "bg-[#F8F8FC] text-black"}`}>
      <style>{`@media print{.no-print{display:none!important}} @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}} .animate-float{animation:float 3s ease-in-out infinite}`}</style>

      {/* HEADER */}
      <div className="max-w-[1100px] mx-auto px-4 pt-5 flex justify-between items-center no-print flex-wrap gap-2">
        <Link href="/" className="flex items-center gap-2 font-black text-[16px] hover:scale-105 transition">
          <span className="w-8 h-8 bg-[#FF7A1A] rounded-lg flex items-center justify-center text-white text-[13px] shadow-lg">L</span>
          LOREM PRO TOOL
        </Link>
        <div className="flex gap-2 flex-wrap">
          <button onClick={save} className={`px-3 py-2 rounded-full text-[11px] font-black transition hover:-translate-y-0.5 hover:shadow ${isDark ? "bg-white/10" : "bg-black/10"}`}>💾 Save</button>
          <button onClick={load} className={`px-3 py-2 rounded-full text-[11px] font-black transition hover:-translate-y-0.5 hover:shadow ${isDark ? "bg-white/10" : "bg-black/10"}`}>📂 Load</button>
          <button onClick={reset} className="px-3 py-2 rounded-full text-[11px] font-black bg-red-500/10 text-red-400 transition hover:-translate-y-0.5">↻ Reset</button>
          <button onClick={exportCSV} className="bg-green-500 text-white px-3 py-2 rounded-full text-[11px] font-black transition hover:-translate-y-0.5 hover:shadow-lg hover:bg-green-600">📥 CSV</button>
          <button onClick={() => window.print()} className="bg-white text-black px-3 py-2 rounded-full text-[11px] font-black transition hover:-translate-y-0.5 hover:shadow-lg">📄 PDF</button>
          <button onClick={() => setIsDark(!isDark)} className={`w-9 h-9 rounded-full transition hover:rotate-180 duration-500 ${isDark ? "bg-white/10" : "bg-black/10"}`}>{isDark ? "🌙" : "☀️"}</button>
        </div>
      </div>
      {saveMsg && <p className="text-center text-[11px] mt-1 font-black text-green-500 animate-bounce">{saveMsg}</p>}

      <div className="max-w-[1100px] mx-auto px-4 py-5">
        <div className="text-center">
          <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-[10px] font-black tracking-widest animate-float inline-block">🏦 FD • RD • COMPOUND • PPF • TAX FREE</span>
          <h1 className="text-[28px] md:text-[42px] font-black leading-tight mt-3">FD + RD + <span className="text-[#FF7A1A]">Compound</span> Calculator</h1>
          <p className={`mt-1 text-[12px] md:text-[13px] ${isDark ? "text-white/60" : "text-black/60"}`}>Bank Rates + Senior Citizen + Tax Ke Baad Wala Paisa + Year-Wise Table + 4-Way Comparison — sab ek jagah.</p>
        </div>

        {/* TABS */}
        <div className={`flex gap-2 mt-5 p-1.5 rounded-2xl no-print ${isDark ? "bg-white/5" : "bg-black/5"}`}>
          <TabBtn id="FD" emoji="🏦" title="FD" sub="Fixed Deposit" />
          <TabBtn id="RD" emoji="📅" title="RD" sub="Recurring" />
          <TabBtn id="CI" emoji="📈" title="Compound" sub="SIP + Lump" />
          <TabBtn id="PPF" emoji="🛡️" title="PPF" sub="Tax Free" />
        </div>

        {/* BANK + SENIOR + TAX */}
        <div className="flex flex-wrap gap-2 mt-3 no-print">
          <div className={`flex gap-1.5 items-center px-2 py-1.5 rounded-full border ${isDark ? "border-white/10 bg-white/[0.03]" : "border-black/10 bg-white"}`}>
            <span className="text-[10px] font-black opacity-60 pl-1">BANK:</span>
            {BANKS.map(b => (
              <button key={b.name} onClick={() => { if (tab === "FD") setFdRate(b.fd); if (tab === "RD") setRdRate(b.rd); if (tab === "PPF") setPpfRate(7.1); }}
                className="px-2.5 py-1.5 rounded-full text-[10px] font-black bg-[#FF7A1A]/10 text-[#FF7A1A] hover:bg-[#FF7A1A] hover:text-white transition active:scale-95">
                {b.name} {tab === "FD" ? b.fd : b.rd}%
              </button>
            ))}
          </div>
          <button onClick={() => setIsSenior(!isSenior)} className={`px-3 py-2 rounded-full text-[11px] font-black transition hover:-translate-y-0.5 ${isSenior ? "bg-emerald-500 text-white shadow-lg" : isDark ? "bg-white/10" : "bg-black/10"}`}>
            {isSenior ? "✅ Senior 60+ (+0.50%)" : "👴 Senior 60+? +0.50%"}
          </button>
          <div className={`flex gap-1 items-center px-2 py-1.5 rounded-full border ${isDark ? "border-white/10" : "border-black/10"}`}>
            <span className="text-[10px] font-black opacity-60">TAX SLAB:</span>
            {[0, 5, 20, 30].map(s => (
              <button key={s} onClick={() => setTaxSlab(s)} className={`px-2.5 py-1 rounded-full text-[10px] font-black transition active:scale-95 ${taxSlab === s ? "bg-[#FF7A1A] text-white" : "bg-black/5"}`}>{s}%</button>
            ))}
          </div>
        </div>

        {/* RESULT TOP */}
        <div className="grid md:grid-cols-3 gap-3 mt-4">
          <div className="bg-gradient-to-br from-orange-500 via-[#ff6b00] to-[#ff3c00] rounded-[20px] p-4 text-white hover:shadow-[0_12px_30px_rgba(255,107,0,0.4)] hover:-translate-y-1 transition duration-300">
            <p className="text-[10px] font-black tracking-widest text-black/70">💰 MATURITY - {tab} {isSenior ? "• SENIOR" : ""}</p>
            <h3 className="text-[30px] font-black mt-1 leading-none">{fmtL(current.maturity)}</h3>
            <p className="text-[12px] font-bold mt-1">Gain: {fmtL(current.gain)}</p>
            <div className="bg-black/25 rounded-xl p-3 mt-3 text-[12px] space-y-1">
              <p className="flex justify-between"><span>Invested</span><b>{fmt(current.invested)}</b></p>
              <p className="flex justify-between"><span>Gain</span><b>{fmt(current.gain)}</b></p>
              <p className="flex justify-between"><span>Tax ({tab === "PPF" ? "0%" : tab === "CI" ? "12.5% LTCG" : `${taxSlab}%`})</span><b>- {fmt(taxOnGain)}</b></p>
              <p className="flex justify-between border-t border-white/20 pt-1"><span>After Tax</span><b>{fmt(afterTaxMaturity)}</b></p>
            </div>
          </div>

          <div className={`rounded-[20px] border p-4 md:col-span-2 hover:shadow-lg hover:-translate-y-0.5 transition duration-300 ${isDark ? "bg-[#15151F] border-white/10" : "bg-white border-black/10"}`}>
            <p className="font-black text-[13px]">📊 Kahan Gaya Paisa?</p>
            <div className="flex h-3.5 rounded-full overflow-hidden mt-3 bg-black/10">
              <div className="bg-blue-500 transition-all duration-700" style={{ width: `${barPct}%` }} />
              <div className="bg-emerald-500 transition-all duration-700" style={{ width: `${100 - barPct}%` }} />
            </div>
            <div className="flex justify-between text-[11px] font-bold mt-2">
              <span className="text-blue-500">● Tumhara Paisa {barPct.toFixed(0)}% • {fmt(current.invested)}</span>
              <span className="text-emerald-500">● Interest {(100 - barPct).toFixed(0)}% • {fmt(current.gain)}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4">
              <div className={`rounded-xl p-3 text-center hover:scale-105 transition cursor-default ${isDark ? "bg-white/5" : "bg-black/5"}`}><p className="text-[10px] opacity-60 font-bold">MONTHLY</p><p className="font-black text-[13px]">{fmt(current.maturity / ((tab === "FD" ? fdYears : tab === "RD" ? rdYears : tab === "CI" ? ciYears : ppfYears) * 12))}</p></div>
              <div className={`rounded-xl p-3 text-center hover:scale-105 transition cursor-default ${isDark ? "bg-white/5" : "bg-black/5"}`}><p className="text-[10px] opacity-60 font-bold">YEARLY GAIN</p><p className="font-black text-[13px]">{fmt(current.gain / (tab === "FD" ? fdYears : tab === "RD" ? rdYears : tab === "CI" ? ciYears : ppfYears))}</p></div>
              <div className={`rounded-xl p-3 text-center hover:scale-105 transition cursor-default ${isDark ? "bg-white/5" : "bg-black/5"}`}><p className="text-[10px] opacity-60 font-bold">WEALTH x</p><p className="font-black text-[13px]">{current.invested > 0 ? (current.maturity / current.invested).toFixed(2) : "0"}x</p></div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3 no-print">
              <button onClick={() => setShowTable(!showTable)} className="py-2 bg-[#FF7A1A] rounded-xl font-black text-white text-[11px] hover:bg-[#e66a00] hover:shadow-lg transition active:scale-95">{showTable ? "Hide Table ▲" : "Year Table ▼"}</button>
              <button onClick={copyResult} className={`py-2 rounded-xl font-black text-[11px] transition hover:shadow active:scale-95 ${isDark ? "bg-white/10" : "bg-black/5"}`}>{copied ? "✓ Copied" : "📋 Copy Result"}</button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-4 mt-4">
          {/* INPUTS */}
          <div className={`rounded-[20px] border p-5 lg:col-span-2 no-print hover:shadow-lg transition ${isDark ? "bg-[#15151F] border-white/10" : "bg-white border-black/10"}`}>
            {tab === "FD" && (<><h2 className="font-black text-[15px]">🏦 Fixed Deposit</h2><Input label="Ek Baar Kitna? (₹)" value={fdP} onChange={setFdP} max={10000000} suffix="₹" /><Input label={`Interest Rate ${isSenior ? "(+0.50% Senior)" : ""} (% p.a.)`} value={fdRate} onChange={setFdRate} max={12} suffix="%" /><Input label="Kitne Saal?" value={fdYears} onChange={setFdYears} max={30} suffix="Yrs" /><p className="text-[11px] mt-3 opacity-60">💡 Bank FD me quarterly compounding hoti hai. Senior ko +0.50% extra.</p></>)}
            {tab === "RD" && (<><h2 className="font-black text-[15px]">📅 Recurring Deposit</h2><Input label="Har Mahine Kitna? (₹)" value={rdMonthly} onChange={setRdMonthly} max={100000} suffix="₹/mo" /><Input label={`Interest Rate ${isSenior ? "(+0.50% Senior)" : ""} (% p.a.)`} value={rdRate} onChange={setRdRate} max={12} suffix="%" /><Input label="Kitne Saal?" value={rdYears} onChange={setRdYears} max={10} suffix="Yrs" /><p className="text-[11px] mt-3 opacity-60">💡 RD salary walo ke liye best hai. 1 kist miss hui to penalty lagega.</p></>)}
            {tab === "CI" && (<><h2 className="font-black text-[15px]">📈 Compound Interest</h2><Input label="Pehle Se Kitna Hai? (₹)" value={ciP} onChange={setCiP} max={10000000} suffix="₹" /><Input label="Har Mahine Kitna Add? (₹)" value={ciMonthly} onChange={setCiMonthly} max={100000} suffix="₹/mo" /><Input label="Expected Return (% p.a.)" value={ciRate} onChange={setCiRate} max={30} suffix="%" /><Input label="Kitne Saal?" value={ciYears} onChange={setCiYears} max={30} suffix="Yrs" /><p className="text-[11px] mt-3 opacity-60">💡 12% = Mutual Fund average. 15 saal me paisa 4x hota hai compound se.</p></>)}
            {tab === "PPF" && (<><h2 className="font-black text-[15px]">🛡️ PPF - Tax Free</h2><Input label="Har Saal Kitna? Max 1.5L (₹)" value={ppfYearly} onChange={(v: number) => setPpfYearly(Math.min(150000, v))} max={150000} suffix="₹/yr" /><Input label="Interest Rate (% p.a.)" value={ppfRate} onChange={setPpfRate} max={12} suffix="%" /><Input label="Kitne Saal? (15-50)" value={ppfYears} onChange={setPpfYears} max={50} suffix="Yrs" /><div className="mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-bold hover:bg-emerald-500/20 transition">✅ PPF Tax Free - Paisa + Interest + Maturity teeno pe 0 Tax. 80C me bhi ₹1.5L deduction.</div></>)}
          </div>

          {/* RIGHT - TABLE + COMPARE */}
          <div className="lg:col-span-3 space-y-4">
            {showTable && (
              <div className={`rounded-[20px] border p-4 overflow-hidden ${isDark ? "bg-[#15151F] border-white/10" : "bg-white border-black/10"}`}>
                <h3 className="font-black text-[14px]">📅 Year-Wise Growth Table</h3>
                <div className="overflow-x-auto mt-3 -mx-4 px-4">
                  <table className="w-full text-[12px] min-w-[420px]">
                    <thead><tr className={`text-left ${isDark ? "text-white/50" : "text-black/50"}`}><th className="py-2">Year</th><th>Invested</th><th>Gain</th><th className="text-right">Maturity</th></tr></thead>
                    <tbody>
                      {yearTable.map(r => (
                        <tr key={r.year} className={`border-t hover:bg-[#FF7A1A]/10 transition cursor-default ${isDark ? "border-white/5" : "border-black/5"}`}>
                          <td className="py-2 font-black">Year {r.year}</td><td>{fmt(r.invested)}</td><td className="text-emerald-500 font-bold">+{fmt(r.gain)}</td><td className="text-right font-black">{fmt(r.maturity)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {showCompare && (
              <div className={`rounded-[20px] border p-4 ${isDark ? "bg-[#15151F] border-white/10" : "bg-white border-black/10"}`}>
                <div className="flex justify-between items-center"><h3 className="font-black text-[14px]">⚔️ 4-Way Comparison - Same Paisa, Kahan Zyada?</h3><button onClick={() => setShowCompare(false)} className="text-[11px] font-black text-[#FF7A1A]">Hide</button></div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
                  {compare.map(c => (
                    <div key={c.name} className={`rounded-2xl p-3 border text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:scale-[1.02] cursor-default ${c.name === bestCompare.name ? "border-emerald-500 bg-emerald-500/10 shadow-lg" : isDark ? "border-white/10 bg-white/[0.03]" : "border-black/10 bg-black/[0.02]"}`}>
                      <p className="font-black text-[11px]">{c.name}</p>
                      {c.name === bestCompare.name && <span className="text-[9px] font-black bg-emerald-500 text-white px-2 py-0.5 rounded-full">🏆 BEST</span>}
                      <p className="font-black text-[15px] mt-1">{fmtL(c.maturity)}</p>
                      <p className="text-[10px] opacity-60">Gain {fmtL(c.gain)}</p>
                      <div className="h-1.5 bg-black/10 rounded-full mt-2 overflow-hidden"><div className="h-full bg-gradient-to-r from-orange-400 to-emerald-500 transition-all duration-700" style={{ width: `${(c.maturity / bestCompare.maturity) * 100}%` }} /></div>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] mt-3 opacity-70">💡 {bestCompare.name} me sabse zyada milega kyunki {bestCompare.taxFree ? "Tax 0 hai aur rate bhi achha hai." : "rate zyada hai."} Lekin FD safe hai, Compound me risk hai.</p>
              </div>
            )}
          </div>
        </div>

        {/* SEO */}
        <article className={`max-w-[900px] mx-auto py-8 text-[14px] leading-relaxed ${isDark ? "text-white/80" : "text-black/80"}`}>
          <h2 className="text-[22px] font-black text-[#FF7A1A]">FD vs RD vs PPF vs Compound - Kaunsa Better Hai?</h2>
          <p className="mt-3"><strong>FD:</strong> Ek baar paisa hai to FD. Safe, fixed. <strong>RD:</strong> Salary se har mahine bachana hai to RD. <strong>PPF:</strong> 15 saal ke liye bhool jana hai aur Tax Free chahiye to PPF. <strong>Compound / SIP:</strong> Lamba paisa banana hai to Compound, return sabse zyada par risk bhi hai.</p>
          <h2 className="text-[22px] font-black mt-8 text-[#FF7A1A]">FD Calculator Kaise Use Karein?</h2>
          <p className="mt-3">Bas tab dabao, amount type karo ya slider khiskao. Type karte hi result turant badal jayega. Bank ka button dabate hi us bank ka rate aa jayega. Senior ho to Senior button dabao, +0.50% auto add ho jayega.</p>
          <p className="mt-3 text-[11px] opacity-50">fd calculator, rd calculator, ppf calculator, compound interest calculator, post office rd calculator, sbi fd calculator, fixed deposit calculator, recurring deposit calculator, ppf maturity calculator, fd interest calculator, senior citizen fd rates, fd tax calculator</p>
          <div className="mt-8 p-4 rounded-xl text-center text-[11px] opacity-40"><p>© 2026 Lorem Pro Tool • FD + RD + Compound Calculator</p><p className="mt-1">Developed by Velora • Estimate only, verify with bank before investing.</p></div>
        </article>
      </div>
    </div>
  );
}
