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

export default function FdRdCalculator() {
  const [tab, setTab] = useState<Tab>("FD");
  const [isDark, setIsDark] = useState(true);
  const [saveMsg, setSaveMsg] = useState("");

  // FD
  const [fdP, setFdP] = useState(100000);
  const [fdRate, setFdRate] = useState(7.1);
  const [fdYears, setFdYears] = useState(5);

  // RD
  const [rdMonthly, setRdMonthly] = useState(5000);
  const [rdRate, setRdRate] = useState(6.5);
  const [rdYears, setRdYears] = useState(5);

  // Compound Interest
  const [ciP, setCiP] = useState(100000);
  const [ciMonthly, setCiMonthly] = useState(5000);
  const [ciRate, setCiRate] = useState(12);
  const [ciYears, setCiYears] = useState(10);

  // PPF
  const [ppfYearly, setPpfYearly] = useState(150000);
  const [ppfRate, setPpfRate] = useState(7.1);
  const [ppfYears, setPpfYears] = useState(15);

  const result = useMemo(() => {
    if (tab === "FD") {
      const n = 4; // Quarterly compounding - Bank FD
      const maturity = fdP * Math.pow(1 + fdRate / 100 / n, n * fdYears);
      return { invested: fdP, gain: maturity - fdP, maturity };
    }
    if (tab === "RD") {
      const i = rdRate / 100 / 12;
      const n = rdYears * 12;
      const maturity = rdMonthly * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
      const invested = rdMonthly * n;
      return { invested, gain: maturity - invested, maturity };
    }
    if (tab === "CI") {
      const r = ciRate / 100;
      const n = ciYears;
      // Lump sum + Monthly SIP jaisa compound
      const lump = ciP * Math.pow(1 + r, n);
      const i = r / 12;
      const months = n * 12;
      const sip = ciMonthly * ((Math.pow(1 + i, months) - 1) / i) * (1 + i);
      const maturity = lump + sip;
      const invested = ciP + ciMonthly * months;
      return { invested, gain: maturity - invested, maturity };
    }
    // PPF - Yearly deposit, 15 years default
    const i = ppfRate / 100;
    const maturity = ppfYearly * ((Math.pow(1 + i, ppfYears) - 1) / i) * (1 + i);
    const invested = ppfYearly * ppfYears;
    return { invested, gain: maturity - invested, maturity };
  }, [tab, fdP, fdRate, fdYears, rdMonthly, rdRate, rdYears, ciP, ciMonthly, ciRate, ciYears, ppfYearly, ppfRate, ppfYears]);

  const gainPct = result.invested > 0 ? (result.gain / result.invested) * 100 : 0;
  const barInvested = result.maturity > 0 ? (result.invested / result.maturity) * 100 : 50;

  const reset = () => {
    setFdP(100000); setFdRate(7.1); setFdYears(5);
    setRdMonthly(5000); setRdRate(6.5); setRdYears(5);
    setCiP(100000); setCiMonthly(5000); setCiRate(12); setCiYears(10);
    setPpfYearly(150000); setPpfRate(7.1); setPpfYears(15);
    setSaveMsg("✓ Reset!"); setTimeout(() => setSaveMsg(""), 2000);
  };

  const copyResult = () => {
    const txt = `${tab} Calculator - Lorem Pro Tool\nInvested: ${fmt(result.invested)}\nGain: ${fmt(result.gain)}\nMaturity: ${fmt(result.maturity)}`;
    navigator.clipboard.writeText(txt);
    setSaveMsg("✓ Copied!"); setTimeout(() => setSaveMsg(""), 2000);
  };

  const Input = ({ label, value, onChange, max }: any) => (
    <div>
      <label className={`block text-[12px] font-bold mt-4 ${isDark ? "text-[#FF7A1A]" : "text-[#D65A00]"}`}>{label}</label>
      <input type="number" value={value || ""} onChange={(e) => onChange(Number(e.target.value) || 0)}
        className={`w-full mt-1 px-3 py-2.5 rounded-xl border outline-none font-bold text-[14px] ${isDark ? "bg-white/5 border-white/10 text-white" : "bg-gray-100 border-black/10 text-black"}`} />
      <input type="range" min={0} max={max || 1500000} value={value} onChange={(e) => onChange(Number(e.target.value))}
        className="w-full mt-2 accent-[#FF7A1A]" />
    </div>
  );

  return (
    <div className={`min-h-screen ${isDark ? "bg-[#0A0A14] text-white" : "bg-[#F8F8FC] text-black"}`}>
      <div className="max-w-[900px] mx-auto px-4 pt-5 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 font-black text-[16px]">
          <span className="w-8 h-8 bg-[#FF7A1A] rounded-lg flex items-center justify-center text-white text-[13px]">L</span>
          LOREM PRO TOOL
        </Link>
        <div className="flex gap-2">
          <button onClick={copyResult} className="bg-[#FF7A1A] text-white px-3 py-2 rounded-full text-[11px] font-black">📋 Copy</button>
          <button onClick={reset} className="bg-red-500/10 text-red-400 px-3 py-2 rounded-full text-[11px] font-black">↻ Reset</button>
          <button onClick={() => setIsDark(!isDark)} className={`w-9 h-9 rounded-full ${isDark ? "bg-white/10" : "bg-black/10"}`}>{isDark ? "🌙" : "☀️"}</button>
        </div>
      </div>
      {saveMsg && <p className="text-center text-[11px] mt-1 font-black text-green-500">{saveMsg}</p>}

      <div className="max-w-[900px] mx-auto px-4 py-5">
        <div className="text-center">
          <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-[10px] font-black tracking-widest">🏦 FD • RD • COMPOUND • PPF</span>
          <h1 className="text-[28px] md:text-[42px] font-black leading-tight mt-3">FD + RD <span className="text-[#FF7A1A]">Calculator</span></h1>
          <p className={`mt-1 text-[12px] ${isDark ? "text-white/60" : "text-black/60"}`}>Fixed Deposit, Recurring Deposit, Compound Interest aur PPF - sab ek jagah.</p>
        </div>

        {/* TABS */}
        <div className={`flex gap-2 mt-5 p-1.5 rounded-2xl ${isDark ? "bg-white/5" : "bg-black/5"}`}>
          {([
            { id: "FD", label: "🏦 FD", desc: "Fixed Deposit" },
            { id: "RD", label: "📅 RD", desc: "Recurring" },
            { id: "CI", label: "📈 Compound", desc: "SIP + Lump" },
            { id: "PPF", label: "🛡️ PPF", desc: "Tax Free" },
          ] as const).map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 py-3 rounded-xl font-black text-[12px] md:text-[13px] transition ${tab === t.id ? "bg-[#FF7A1A] text-white shadow-lg" : isDark ? "text-white/60" : "text-black/60"}`}>
              {t.label}
              <span className="block text-[9px] font-bold opacity-70">{t.desc}</span>
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-4 mt-4">
          {/* INPUTS */}
          <div className={`rounded-[20px] border p-5 ${isDark ? "bg-[#15151F] border-white/10" : "bg-white border-black/10"}`}>
            {tab === "FD" && (
              <>
                <h2 className="font-black text-[15px]">🏦 Fixed Deposit</h2>
                <Input label="Ek Baar Kitna Jama Karoge? (₹)" value={fdP} onChange={setFdP} max={10000000} />
                <Input label="Interest Rate (% p.a.)" value={fdRate} onChange={setFdRate} max={15} />
                <Input label="Kitne Saal Ke Liye? (Years)" value={fdYears} onChange={setFdYears} max={30} />
                <p className="text-[11px] mt-3 opacity-60">Bank FD me quarterly compounding hoti hai. Post Office / SBI / HDFC sab pe same formula.</p>
              </>
            )}
            {tab === "RD" && (
              <>
                <h2 className="font-black text-[15px]">📅 Recurring Deposit</h2>
                <Input label="Har Mahine Kitna Jama Karoge? (₹)" value={rdMonthly} onChange={setRdMonthly} max={100000} />
                <Input label="Interest Rate (% p.a.)" value={rdRate} onChange={setRdRate} max={15} />
                <Input label="Kitne Saal Ke Liye? (Years)" value={rdYears} onChange={setRdYears} max={10} />
                <p className="text-[11px] mt-3 opacity-60">RD me har mahine paisa jama hota hai, interest monthly compounding pe milta hai.</p>
              </>
            )}
            {tab === "CI" && (
              <>
                <h2 className="font-black text-[15px]">📈 Compound Interest</h2>
                <Input label="Pehle Se Kitna Hai? (Lump Sum ₹)" value={ciP} onChange={setCiP} max={10000000} />
                <Input label="Har Mahine Kitna Add Karoge? (₹)" value={ciMonthly} onChange={setCiMonthly} max={100000} />
                <Input label="Expected Return (% p.a.)" value={ciRate} onChange={setCiRate} max={30} />
                <Input label="Kitne Saal? (Years)" value={ciYears} onChange={setCiYears} max={30} />
                <p className="text-[11px] mt-3 opacity-60">Ye SIP + Mutual Fund + Stock jaisa compound hai. 12% = Mutual Fund average.</p>
              </>
            )}
            {tab === "PPF" && (
              <>
                <h2 className="font-black text-[15px]">🛡️ PPF - Public Provident Fund</h2>
                <Input label="Har Saal Kitna Jama Karoge? (₹) Max 1.5L" value={ppfYearly} onChange={(v: number) => setPpfYearly(Math.min(150000, v))} max={150000} />
                <Input label="Interest Rate (% p.a.)" value={ppfRate} onChange={setPpfRate} max={15} />
                <Input label="Kitne Saal? (15-50 Years)" value={ppfYears} onChange={setPpfYears} max={50} />
                <div className="mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-bold">
                  ✅ PPF Tax Free hai - Paisa + Interest + Maturity teeno pe 0 Tax. 80C me bhi deduction milega.
                </div>
              </>
            )}
          </div>

          {/* RESULT */}
          <div className="space-y-3">
            <div className="bg-gradient-to-br from-orange-500 via-[#ff6b00] to-[#ff3c00] rounded-[20px] p-5 text-white">
              <p className="text-[10px] font-black tracking-widest text-black/70">💰 MATURITY VALUE - {tab}</p>
              <h3 className="text-[32px] font-black mt-1">{fmtL(result.maturity)}</h3>
              <p className="text-[12px] font-bold">Total Gain: {fmtL(result.gain)} ({gainPct.toFixed(1)}%)</p>
              <div className="bg-black/25 rounded-xl p-3 mt-3 text-[12px] space-y-1">
                <p className="flex justify-between"><span>Total Jama (Invested)</span><b>{fmt(result.invested)}</b></p>
                <p className="flex justify-between"><span>Total Interest / Gain</span><b>{fmt(result.gain)}</b></p>
                <p className="flex justify-between"><span>Maturity</span><b>{fmt(result.maturity)}</b></p>
              </div>
            </div>

            <div className={`rounded-[20px] border p-4 ${isDark ? "bg-[#15151F] border-white/10" : "bg-white border-black/10"}`}>
              <p className="font-black text-[13px]">📊 Kahan Gaya Paisa?</p>
              <div className="flex h-4 rounded-full overflow-hidden mt-3">
                <div className="bg-blue-500" style={{ width: `${barInvested}%` }} />
                <div className="bg-emerald-500" style={{ width: `${100 - barInvested}%` }} />
              </div>
              <div className="flex justify-between text-[11px] font-bold mt-2">
                <span className="text-blue-500">● Tumhara Paisa {barInvested.toFixed(0)}%</span>
                <span className="text-emerald-500">● Interest {(100 - barInvested).toFixed(0)}%</span>
              </div>
              {tab === "PPF" && <p className="text-[11px] mt-3 opacity-70">PPF me 15 saal ke baad 5-5 saal ke liye extend kar sakte ho. 15 saal me 1.5L/year = ₹40.68L banta hai 7.1% pe.</p>}
              {tab === "FD" && <p className="text-[11px] mt-3 opacity-70">Senior Citizen ko FD pe 0.50% extra milta hai. 5 saal FD pe 80C me ₹1.5L deduction bhi milta hai.</p>}
              {tab === "RD" && <p className="text-[11px] mt-3 opacity-70">RD me agar 1 kist miss hui to penalty lagta hai. Post Office RD 6.5% deta hai.</p>}
              {tab === "CI" && <p className="text-[11px] mt-3 opacity-70">Compound ka jadoo: 10 saal me paisa double, 20 saal me 4x. Isliye jaldi start karo.</p>}
            </div>
          </div>
        </div>

        {/* SEO CONTENT */}
        <article className={`max-w-[900px] mx-auto py-8 text-[14px] leading-relaxed ${isDark ? "text-white/80" : "text-black/80"}`}>
          <h2 className="text-[22px] font-black text-[#FF7A1A]">FD vs RD vs PPF - Kaunsa Better Hai?</h2>
          <p className="mt-3"><strong>FD:</strong> Ek baar paisa hai to FD best hai. Safe, fixed return. <strong>RD:</strong> Salary se har mahine bachana hai to RD best hai. <strong>PPF:</strong> 15 saal ke liye bhool jana hai aur Tax Free chahiye to PPF best hai. <strong>Compound / SIP:</strong> Lamba paisa banana hai to Compound best hai, risk thoda zyada par return sabse zyada.</p>
          <h2 className="text-[22px] font-black mt-8 text-[#FF7A1A]">FD Calculator Kaise Use Karein?</h2>
          <p className="mt-3">Bas apna amount, rate aur saal daalo. Slider se bhi badal sakte ho. Type karte hi maturity turant dikh jayegi. Koi Calculate button dabane ki zaroorat nahi.</p>
          <p className="mt-3 text-[11px] opacity-50">fd calculator, rd calculator, ppf calculator, compound interest calculator, post office rd calculator, sbi fd calculator, fixed deposit calculator, recurring deposit calculator, ppf maturity calculator, 7.1% ppf, 15 years ppf, fd interest calculator, rd interest calculator</p>
        </article>
      </div>
    </div>
  );
}
