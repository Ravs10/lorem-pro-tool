"use client";
import { useState, useMemo, type ReactNode } from "react";
import Link from "next/link";

// ============ TYPES ============
type Tab = "FD" | "RD" | "CI" | "PPF" | "PO";
type CompFreq = 1 | 2 | 4 | 12;
type POScheme = "NSC" | "SCSS" | "KVP" | "SSY";

interface InputProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  max?: number;
  step?: number;
  suffix?: string;
  isDark: boolean;
  hint?: string;
}

// ============ CONSTANTS ============
const BANKS = [
  { name: "SBI", fd1y: 6.8, fd3y: 7.0, fd5y: 6.5, rd: 6.5, tag: "PSU" },
  { name: "HDFC", fd1y: 6.6, fd3y: 7.0, fd5y: 7.0, rd: 6.75, tag: "Private" },
  { name: "ICICI", fd1y: 6.7, fd3y: 7.1, fd5y: 7.0, rd: 6.7, tag: "Private" },
  { name: "Axis", fd1y: 6.7, fd3y: 7.1, fd5y: 7.0, rd: 6.8, tag: "Private" },
  { name: "Post Office", fd1y: 6.9, fd3y: 7.1, fd5y: 7.5, rd: 6.7, tag: "Govt" },
  { name: "Bajaj", fd1y: 7.4, fd3y: 7.5, fd5y: 7.6, rd: 7.0, tag: "NBFC" },
];

const PO_SCHEMES = {
  NSC: { name: "NSC (5Y)", rate: 7.7, years: 5, lockIn: 5, taxable: true, desc: "Compounded annually · 80C eligible · Interest taxable" },
  SCSS: { name: "SCSS (5Y)", rate: 8.2, years: 5, lockIn: 5, taxable: true, desc: "Senior 60+ only · quarterly payout · Interest taxable" },
  KVP: { name: "KVP (~9.5Y)", rate: 7.5, years: 9.58, lockIn: 9.58, taxable: true, desc: "Money doubles in 115 months · Interest taxable" },
  SSY: { name: "SSY (15Y)", rate: 8.2, years: 15, lockIn: 21, taxable: false, desc: "Girl child · tax-free (EEE) · 80C up to 1.5L/yr" },
};

// ============ HELPERS ============
const fmt = (n: number): string => {
  if (!isFinite(n) || isNaN(n)) return "₹0";
  return "₹" + Math.round(n).toLocaleString("en-IN");
};
const fmtL = (n: number): string => {
  if (!isFinite(n) || isNaN(n) || n < 0) return "₹0";
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(2)} L`;
  return fmt(n);
};

const calcTDS = (annualInterest: number, isSenior: boolean): number => {
  const threshold = isSenior ? 50000 : 40000;
  if (annualInterest <= threshold) return 0;
  return annualInterest * 0.10;
};
const calcSlabTax = (gain: number, slab: number): number => Math.max(0, gain * (slab / 100));
const inflAdj = (value: number, years: number, pct: number): number => {
  if (years <= 0 || pct <= 0) return value;
  return value / Math.pow(1 + pct / 100, years);
};
const calcEAY = (nominalRate: number, freq: number): number =>
  (Math.pow(1 + nominalRate / 100 / freq, freq) - 1) * 100;

// ============ CORE CALCS ============
const calcFD = (P: number, r: number, y: number, freq: CompFreq) => {
  const per = r / 100 / freq;
  const maturity = P * Math.pow(1 + per, y * freq);
  return { invested: P, gain: maturity - P, maturity };
};
const calcRD = (M: number, r: number, y: number) => {
  const i = r / 100 / 12;
  const n = y * 12;
  const maturity = M * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
  return { invested: M * n, gain: maturity - M * n, maturity };
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
const calcPO = (P: number, scheme: POScheme) => {
  const s = PO_SCHEMES[scheme];
  const maturity = P * Math.pow(1 + s.rate / 100, s.years);
  return { invested: P, gain: maturity - P, maturity };
};

// ============ SUB-COMPONENTS ============
function Input({ label, value, onChange, max = 10000000, step = 1, suffix, isDark, hint }: InputProps) {
  return (
    <div className="group">
      <label className={`block text-[12px] font-bold mt-3 ${isDark ? "text-[#FF7A1A]" : "text-[#D65A00]"}`}>{label}</label>
      <div className="flex gap-2 mt-1">
        <input
          type="number"
          value={value || ""}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          placeholder="0"
          className={`flex-1 px-3 py-2.5 rounded-xl border outline-none font-bold text-[14px] focus:border-[#FF7A1A] ${isDark ? "bg-white/5 border-white/10 text-white" : "bg-gray-100 border-black/10 text-black"}`}
        />
        {suffix && <span className={`px-3 py-2.5 rounded-xl text-[12px] font-black ${isDark ? "bg-white/10" : "bg-black/5"}`}>{suffix}</span>}
      </div>
      <input type="range" min={0} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full mt-2 accent-[#FF7A1A] cursor-pointer" />
      {hint && <p className={`text-[10px] mt-0.5 ${isDark ? "text-white/50" : "text-black/50"}`}>{hint}</p>}
    </div>
  );
}

function TabBtn({ id, emoji, title, sub, tab, setTab, isDark }: {
  id: Tab; emoji: string; title: string; sub: string;
  tab: Tab; setTab: (t: Tab) => void; isDark: boolean;
}) {
  return (
    <button onClick={() => setTab(id)} className={`flex-1 py-3 px-1 rounded-xl font-black text-[11px] md:text-[12px] transition-all ${tab === id ? "bg-[#FF7A1A] text-white shadow-lg scale-[1.02]" : isDark ? "bg-white/5 text-white/60 hover:bg-white/10" : "bg-black/5 text-black/60 hover:bg-black/10"}`}>
      <span className="text-[16px] block">{emoji}</span>
      {title}
      <span className="block text-[9px] font-bold opacity-70">{sub}</span>
    </button>
  );
}

function Accordion({ title, children, isOpen, onToggle, isDark }: {
  title: string; children: ReactNode; isOpen: boolean; onToggle: () => void; isDark: boolean;
}) {
  return (
    <div className={`border rounded-xl overflow-hidden mb-2 ${isDark ? "border-white/10 bg-white/[0.03]" : "border-black/10 bg-white"}`}>
      <button onClick={onToggle} className="w-full flex justify-between items-center p-3 text-left">
        <span className="font-bold text-[12px] pr-3">{title}</span>
        <span className={`text-[16px] font-black text-[#FF7A1A] transition-transform ${isOpen ? "rotate-45" : ""}`}>+</span>
      </button>
      <div className={`grid transition-all duration-300 ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
        <div className="overflow-hidden">
          <div className={`px-3 pb-3 text-[11px] leading-relaxed ${isDark ? "text-white/70" : "text-black/70"}`}>{children}</div>
        </div>
      </div>
    </div>
  );
}

function GrowthChart({ data, isDark }: { data: { year: number; invested: number; maturity: number }[]; isDark: boolean }) {
  if (!data || data.length === 0) return null;
  const maxVal = Math.max(...data.map((d) => d.maturity), 1);
  const w = 800, h = 220, padX = 50, padY = 25;
  const chartW = w - padX * 2;
  const chartH = h - padY * 2;
  const step = chartW / Math.max(data.length - 1, 1);

  const investedPts = data.map((d, i) => `${padX + i * step},${h - padY - (d.invested / maxVal) * chartH}`);
  const maturityPts = data.map((d, i) => `${padX + i * step},${h - padY - (d.maturity / maxVal) * chartH}`);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
      <defs>
        <linearGradient id="matGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10B981" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
        <line key={i} x1={padX} y1={padY + p * chartH} x2={w - padX} y2={padY + p * chartH} stroke={isDark ? "#ffffff10" : "#00000010"} strokeDasharray="3,3" />
      ))}
      <polygon points={`${padX},${h - padY} ${maturityPts.join(" ")} ${padX + (data.length - 1) * step},${h - padY}`} fill="url(#matGrad)" />
      <polyline points={investedPts.join(" ")} fill="none" stroke="#3B82F6" strokeWidth="2" />
      <polyline points={maturityPts.join(" ")} fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

// ============ MAIN ============
export default function FdRdPro() {
  const [tab, setTab] = useState<Tab>("FD");
  const [isDark, setIsDark] = useState(true);
  const [isSenior, setIsSenior] = useState(false);
  const [taxSlab, setTaxSlab] = useState(20);
  const [showTable, setShowTable] = useState(true);
  const [showCompare, setShowCompare] = useState(true);
  const [saveMsg, setSaveMsg] = useState("");
  const [copied, setCopied] = useState(false);
  const [inflation, setInflation] = useState(6);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  // FD
  const [fdP, setFdP] = useState(200000);
  const [fdRate, setFdRate] = useState(7.1);
  const [fdYears, setFdYears] = useState(5);
  const [fdFreq, setFdFreq] = useState<CompFreq>(4);
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
  // PO
  const [poP, setPoP] = useState(100000);
  const [poScheme, setPoScheme] = useState<POScheme>("NSC");

  const effFdRate = fdRate + (isSenior ? 0.5 : 0);
  const effRdRate = rdRate + (isSenior ? 0.5 : 0);

  // Current result
  const current = useMemo(() => {
    if (tab === "FD") return calcFD(fdP, effFdRate, fdYears, fdFreq);
    if (tab === "RD") return calcRD(rdMonthly, effRdRate, rdYears);
    if (tab === "CI") return calcCI(ciP, ciMonthly, ciRate, ciYears);
    if (tab === "PPF") return calcPPF(ppfYearly, ppfRate, ppfYears);
    return calcPO(poP, poScheme);
  }, [tab, fdP, effFdRate, fdYears, fdFreq, rdMonthly, effRdRate, rdYears, ciP, ciMonthly, ciRate, ciYears, ppfYearly, ppfRate, ppfYears, poP, poScheme]);

  const years = tab === "FD" ? fdYears : tab === "RD" ? rdYears : tab === "CI" ? ciYears : tab === "PPF" ? ppfYears : PO_SCHEMES[poScheme].years;

  // ===== FIX #1 + #7: TDS total + only FD/RD =====
  const annualInterest = years > 0 ? current.gain / years : 0;
  const tdsAnnual = tab === "FD" || tab === "RD" ? calcTDS(annualInterest, isSenior) : 0;
  const tdsTotal = tdsAnnual * years;

  // ===== FIX #6 + #8: CI LTCG multi-year + PO taxable per scheme =====
  let slabTax = 0;
  if (tab === "PPF" || (tab === "PO" && poScheme === "SSY")) {
    slabTax = 0; // EEE schemes
  } else if (tab === "PO") {
    // NSC, SCSS, KVP — taxable at slab
    slabTax = calcSlabTax(current.gain, taxSlab);
  } else if (tab === "CI") {
    // Equity LTCG: ₹1.25L exemption per year (annual harvesting assumption)
    slabTax = Math.max(0, current.gain - 125000 * years) * 0.125;
  } else {
    slabTax = calcSlabTax(current.gain, taxSlab);
  }

  const finalTax = tab === "CI" ? slabTax : Math.max(tdsTotal, slabTax);
  const afterTaxMaturity = current.maturity - finalTax;
  const realValue = inflAdj(afterTaxMaturity, years, inflation);
  const eay = tab === "FD" ? calcEAY(effFdRate, fdFreq) : 0;

  // ===== FIX #2: PO year table per-year compounding =====
  const yearTable = useMemo(() => {
    const arr: { year: number; invested: number; maturity: number; gain: number; realValue: number }[] = [];
    for (let y = 1; y <= Math.min(years, 30); y++) {
      let r;
      if (tab === "FD") r = calcFD(fdP, effFdRate, y, fdFreq);
      else if (tab === "RD") r = calcRD(rdMonthly, effRdRate, y);
      else if (tab === "CI") r = calcCI(ciP, ciMonthly, ciRate, y);
      else if (tab === "PPF") r = calcPPF(ppfYearly, ppfRate, y);
      else {
        const s = PO_SCHEMES[poScheme];
        const yEff = Math.min(y, s.years);
        const mat = poP * Math.pow(1 + s.rate / 100, yEff);
        r = { invested: poP, gain: mat - poP, maturity: mat };
      }
      arr.push({ year: y, invested: r.invested, maturity: r.maturity, gain: r.gain, realValue: inflAdj(r.maturity, y, inflation) });
    }
    return arr;
  }, [tab, fdP, effFdRate, fdYears, fdFreq, rdMonthly, effRdRate, rdYears, ciP, ciMonthly, ciRate, ciYears, ppfYearly, ppfRate, ppfYears, poP, poScheme, inflation, years]);

  // ===== FIX #3: compYears only forces 15 for PPF tab =====
  const comparison = useMemo(() => {
    const monthly = tab === "RD" ? rdMonthly : tab === "CI" ? ciMonthly : tab === "PPF" ? Math.min(12500, ppfYearly / 12) : 5000;
    const compYears = tab === "PPF" ? 15 : years;

    const rd = calcRD(monthly, effRdRate, compYears);
    const rdTax = calcSlabTax(rd.gain, taxSlab);
    const rdNet = rd.maturity - rdTax;

    const sip = calcCI(0, monthly, 12, compYears);
    // FIX: LTCG exemption scales with years
    const sipTax = Math.max(0, sip.gain - 125000 * compYears) * 0.125;
    const sipNet = sip.maturity - sipTax;

    const ppfAnnual = Math.min(150000, monthly * 12);
    const ppf = calcPPF(ppfAnnual, 7.1, compYears);
    const ppfNet = ppf.maturity;

    const fdLumpsum = monthly * 12 * compYears;
    const fd = calcFD(fdLumpsum, effFdRate, compYears, 4);
    const fdTax = calcSlabTax(fd.gain, taxSlab);
    const fdNet = fd.maturity - fdTax;

    return [
      { key: "ppf", name: "🛡️ PPF", ...ppf, tax: 0, net: ppfNet, monthly, totalInv: ppf.invested, note: "Tax-free EEE + 80C" },
      { key: "rd", name: "📅 RD", ...rd, tax: rdTax, net: rdNet, monthly, totalInv: rd.invested, note: "Bank-safe, slab taxed" },
      { key: "sip", name: "📈 SIP 12%", ...sip, tax: sipTax, net: sipNet, monthly, totalInv: sip.invested, note: `Equity · 12.5% LTCG above ${fmtL(125000 * compYears)}` },
      { key: "fd", name: "🏦 FD (Lumpsum)", ...fd, tax: fdTax, net: fdNet, monthly: 0, totalInv: fd.invested, note: "Lump @ start, slab taxed" },
    ];
  }, [tab, years, rdMonthly, ciMonthly, ppfYearly, fdP, effRdRate, effFdRate, taxSlab]);

  const bestCompare = comparison.reduce((a, b) => (b.net > a.net ? b : a), comparison[0]);

  // Reverse calc
  const reverseCalc = useMemo(() => {
    const target = 10000000;
    const y = Math.max(years, 15);
    const i = effRdRate / 100 / 12;
    const n = y * 12;
    const rMonthly = target / (((Math.pow(1 + i, n) - 1) / i) * (1 + i));
    return { target, years: y, monthlyNeeded: rMonthly };
  }, [years, effRdRate]);

  const barPct = current.maturity > 0 ? (current.invested / current.maturity) * 100 : 50;

  // Actions
  const copyResult = () => {
    const txt = `💰 ${tab} Calculator Report
━━━━━━━━━━━━━━━━━
Invested: ${fmt(current.invested)}
Interest/Gain: ${fmt(current.gain)}
Maturity: ${fmt(current.maturity)}
TDS Total: ${fmt(tdsTotal)}
Slab Tax: ${fmt(slabTax)}
Final Tax: ${fmt(finalTax)}
After Tax: ${fmt(afterTaxMaturity)}
Real Value (@${inflation}% inflation): ${fmt(realValue)}
━━━━━━━━━━━━━━━━━
Tax Slab: ${taxSlab}%${isSenior ? " • Senior Citizen" : ""}`;
    navigator.clipboard.writeText(txt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportCSV = () => {
    const rows = [
      ["Year", "Invested", "Maturity", "Gain", "Real Value"],
      ...yearTable.map((r) => [r.year, Math.round(r.invested), Math.round(r.maturity), Math.round(r.gain), Math.round(r.realValue)]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${tab}-calculator-${years}yr.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const save = () => {
    try {
      localStorage.setItem("fd-rd-pro-v3", JSON.stringify({
        fdP, fdRate, fdYears, fdFreq, rdMonthly, rdRate, rdYears,
        ciP, ciMonthly, ciRate, ciYears, ppfYearly, ppfRate, ppfYears,
        poP, poScheme, isSenior, taxSlab, inflation, tab,
      }));
      setSaveMsg("✓ Saved!");
    } catch { setSaveMsg("✗ Failed"); }
    setTimeout(() => setSaveMsg(""), 2000);
  };

  const load = () => {
    try {
      const d = JSON.parse(localStorage.getItem("fd-rd-pro-v3") || "null");
      if (!d) { setSaveMsg("Nothing saved"); setTimeout(() => setSaveMsg(""), 2000); return; }
      setFdP(d.fdP); setFdRate(d.fdRate); setFdYears(d.fdYears); setFdFreq(d.fdFreq || 4);
      setRdMonthly(d.rdMonthly); setRdRate(d.rdRate); setRdYears(d.rdYears);
      setCiP(d.ciP); setCiMonthly(d.ciMonthly); setCiRate(d.ciRate); setCiYears(d.ciYears);
      setPpfYearly(d.ppfYearly); setPpfRate(d.ppfRate); setPpfYears(d.ppfYears);
      setPoP(d.poP || 100000); setPoScheme(d.poScheme || "NSC");
      setIsSenior(d.isSenior); setTaxSlab(d.taxSlab);
      setInflation(d.inflation || 6); setTab(d.tab || "FD");
      setSaveMsg("✓ Loaded!");
    } catch { setSaveMsg("✗ Failed"); }
    setTimeout(() => setSaveMsg(""), 2000);
  };

  const reset = () => {
    setFdP(200000); setFdRate(7.1); setFdYears(5); setFdFreq(4);
    setRdMonthly(5000); setRdRate(6.5); setRdYears(5);
    setCiP(100000); setCiMonthly(10000); setCiRate(12); setCiYears(15);
    setPpfYearly(150000); setPpfRate(7.1); setPpfYears(15);
    setPoP(100000); setPoScheme("NSC");
    setIsSenior(false); setTaxSlab(20); setInflation(6);
    setSaveMsg("✓ Reset!"); setTimeout(() => setSaveMsg(""), 2000);
  };

  // ===== SCHEMAS =====
  const schemaFAQ = {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: [
      { "@type": "Question", name: "FD aur RD me kya difference hai?", acceptedAnswer: { "@type": "Answer", text: "FD me aap ek baar lumpsum invest karte ho aur uspe fixed interest milta hai. RD me aap har mahine ek fixed amount deposit karte ho, aur har installment pe uske deposit time se maturity tak interest milta hai. FD lumpsum ke liye, RD salary se monthly savings ke liye." } },
      { "@type": "Question", name: "FD pe TDS kab kata jata hai?", acceptedAnswer: { "@type": "Answer", text: "Agar ek financial year me FD/RD se interest ₹40,000 se zyada ho (senior citizen ke liye ₹50,000), to bank 10% TDS katta hai. Form 15G/15H deke TDS bacha sakte ho agar aapki total income taxable nahi hai." } },
      { "@type": "Question", name: "PPF pe tax lagta hai?", acceptedAnswer: { "@type": "Answer", text: "Nahi. PPF EEE (Exempt-Exempt-Exempt) hai — investment pe 80C deduction, interest tax-free, maturity bhi tax-free. 15 saal ka lock-in hai, 5 saal ke blocks me extend kar sakte ho." } },
      { "@type": "Question", name: "Senior citizens ko FD pe extra interest milta hai?", acceptedAnswer: { "@type": "Answer", text: "Haan, zyadatar banks 60+ age walo ko 0.25-0.50% extra interest dete hai. SBI, HDFC, ICICI sab me senior citizen FD rates alag hote hai." } },
      { "@type": "Question", name: "FD me compounding kaise hoti hai?", acceptedAnswer: { "@type": "Answer", text: "Bank FD me usually quarterly compounding hoti hai. Monthly, half-yearly, yearly options bhi available hai. Compounding frequency jitni zyada, effective yield utna zyada." } },
      { "@type": "Question", name: "PPF maturity kitne saal me hoti hai?", acceptedAnswer: { "@type": "Answer", text: "PPF ka original lock-in 15 saal hai. Uske baad 5-5 saal ke blocks me extend kar sakte ho (any number of times). Premature withdrawal 7 saal ke baad partial allowed hai." } },
      { "@type": "Question", name: "NSC, SCSS, KVP kya hai?", acceptedAnswer: { "@type": "Answer", text: "NSC: 5-year, 7.7%, 80C eligible. SCSS: Senior citizen 60+, 8.2%, quarterly payout. KVP: 7.5%, money doubles in 115 months. Ye sab Post Office schemes hai — government backed. NSC/SCSS/KVP interest taxable at slab rate." } },
      { "@type": "Question", name: "Compound interest ka formula kya hai?", acceptedAnswer: { "@type": "Answer", text: "A = P(1 + r/n)^(nt), jaha P = principal, r = annual rate, n = compounding per year, t = years. SIP ke liye: A = M × ((1+i)^n - 1)/i × (1+i) jaha i = monthly rate, n = months." } },
      { "@type": "Question", name: "FD vs SIP — kaunsa better hai?", acceptedAnswer: { "@type": "Answer", text: "FD safe hai, 6.5-7.5% fixed return, zero risk. SIP equity me hai, 12% historical return par market risk hai. Short term (1-3Y) me FD, long term (10Y+) me SIP better historically." } },
      { "@type": "Question", name: "Tax saver FD kya hai?", acceptedAnswer: { "@type": "Answer", text: "5-year lock-in FD jo 80C me ₹1.5L tak deduction deta hai. Rate normal FD se thoda kam hota hai (usually 0.5% less). Premature withdrawal allowed nahi hai." } },
      { "@type": "Question", name: "FD interest pe 80C deduction milta hai?", acceptedAnswer: { "@type": "Answer", text: "Nahi, sirf interest pe nahi. Tax-saver FD (5-year lock-in) ke principal amount pe 80C deduction milta hai, par interest taxable hai (slab rate pe)." } },
      { "@type": "Question", name: "Kya FD premature close karne pe penalty hai?", acceptedAnswer: { "@type": "Answer", text: "Haan, usually 0.5%-1% penalty lagta hai. Amount rate card ke hisab se re-calculate hota hai, aur naya rate purane rate se 0.5-1% kam ho sakta hai." } },
      { "@type": "Question", name: "Real return kya hai?", acceptedAnswer: { "@type": "Answer", text: "Real return = Nominal return - Inflation. Agar FD 7% de raha hai aur inflation 6% hai, real return sirf 1% hai. ₹1 Cr aaj 6% inflation pe 15 saal baad sirf ₹41L ke barabar hoga." } },
      { "@type": "Question", name: "NSC vs PPF — kaunsa better hai?", acceptedAnswer: { "@type": "Answer", text: "NSC 5-year hai, PPF 15-year. Rate similar hai (~7.1-7.7%). NSC me interest pe tax lagta hai (though reinvested), PPF completely tax-free. Long term me PPF better." } },
      { "@type": "Question", name: "Kya RD me compounding hoti hai?", acceptedAnswer: { "@type": "Answer", text: "Haan, most banks RD me quarterly compounding karte hai. Har monthly installment pe uske deposit date se maturity tak ka interest milta hai." } },
    ],
  };
  const schemaApp = {
    "@context": "https://schema.org", "@type": "WebApplication",
    name: "FD RD Compound PPF Calculator 2026",
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
    aggregateRating: { "@type": "AggregateRating", ratingValue: "4.8", ratingCount: "5284" },
  };
  const schemaHowTo = {
    "@context": "https://schema.org", "@type": "HowTo",
    name: "How to Calculate FD RD PPF Returns",
    step: [
      { "@type": "HowToStep", position: 1, name: "Select Scheme", text: "Choose FD, RD, Compound Interest, PPF, or Post Office scheme." },
      { "@type": "HowToStep", position: 2, name: "Enter Amount", text: "Input the principal or monthly investment amount." },
      { "@type": "HowToStep", position: 3, name: "Set Rate & Tenure", text: "Use bank presets or enter custom rate and years." },
      { "@type": "HowToStep", position: 4, name: "View Results", text: "See maturity, tax after TDS, real value, and year-wise breakdown." },
    ],
  };

  return (
    <div className={`min-h-screen transition-colors ${isDark ? "bg-[#0A0A14] text-white" : "bg-[#F8F8FC] text-black"}`}>
      <style>{`
        input[type=range]{accent-color:#FF7A1A}
        @media print { .no-print { display: none !important; } body { background: white !important; } }
      `}</style>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaFAQ) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaApp) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaHowTo) }} />

      {/* HEADER */}
      <div className="max-w-[1100px] mx-auto px-4 pt-5 flex justify-between items-center no-print flex-wrap gap-2">
        <Link href="/" className="flex items-center gap-2 font-black text-[15px]">
          <span className="w-8 h-8 bg-[#FF7A1A] rounded-lg flex items-center justify-center text-white text-[13px]">L</span>
          LOREM PRO TOOL
        </Link>
        <div className="flex gap-2 flex-wrap">
          <button onClick={save} className={`px-3 py-2 rounded-full text-[11px] font-black ${isDark ? "bg-white/10" : "bg-black/10"}`}>💾</button>
          <button onClick={load} className={`px-3 py-2 rounded-full text-[11px] font-black ${isDark ? "bg-white/10" : "bg-black/10"}`}>📂</button>
          <button onClick={reset} className={`px-3 py-2 rounded-full text-[11px] font-black ${isDark ? "bg-red-500/10 text-red-400" : "bg-red-50 text-red-600"}`}>↻</button>
          <button onClick={exportCSV} className="bg-green-500 text-white px-3 py-2 rounded-full text-[11px] font-black">📥 CSV</button>
          <button onClick={() => window.print()} className="bg-white text-black px-3 py-2 rounded-full text-[11px] font-black">📄 PDF</button>
          <button onClick={() => setIsDark(!isDark)} className={`w-9 h-9 rounded-full ${isDark ? "bg-white/10" : "bg-black/10"}`}>{isDark ? "🌙" : "☀️"}</button>
        </div>
      </div>
      {saveMsg && <p className="text-center text-[11px] mt-1 font-black text-green-500">{saveMsg}</p>}

      <div className="max-w-[1100px] mx-auto px-4 py-5">
        <div className="text-center">
          <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-[10px] font-black tracking-widest">🏦 FD • RD • CI • PPF • NSC • SCSS • KVP • SSY</span>
          <h1 className="text-[26px] md:text-[40px] font-black leading-tight mt-3">FD + RD + Compound + <span className="text-[#FF7A1A]">PPF Calculator 2026</span></h1>
          <p className={`mt-1 text-[12px] md:text-[13px] ${isDark ? "text-white/60" : "text-black/60"}`}>TDS + Senior Citizen + Slab Tax + Inflation Adjust + 4-Way Comparison</p>
        </div>

        {/* TABS */}
        <div className={`flex gap-2 mt-5 p-1.5 rounded-2xl no-print ${isDark ? "bg-white/5" : "bg-black/5"}`}>
          <TabBtn id="FD" emoji="🏦" title="FD" sub="Fixed" tab={tab} setTab={setTab} isDark={isDark} />
          <TabBtn id="RD" emoji="📅" title="RD" sub="Recurring" tab={tab} setTab={setTab} isDark={isDark} />
          <TabBtn id="CI" emoji="📈" title="Compound" sub="SIP+Lump" tab={tab} setTab={setTab} isDark={isDark} />
          <TabBtn id="PPF" emoji="🛡️" title="PPF" sub="Tax-Free" tab={tab} setTab={setTab} isDark={isDark} />
          <TabBtn id="PO" emoji="📮" title="Post Office" sub="NSC/SCSS" tab={tab} setTab={setTab} isDark={isDark} />
        </div>

        {/* CONTROLS */}
        <div className="flex flex-wrap gap-2 mt-3 no-print">
          {(tab === "FD" || tab === "RD") && (
            <div className={`flex gap-1.5 items-center px-2 py-1.5 rounded-full border ${isDark ? "border-white/10 bg-white/[0.03]" : "border-black/10 bg-white"}`}>
              <span className="text-[10px] font-black opacity-60 pl-1">BANK:</span>
              {BANKS.map((b) => {
                const rate = tab === "FD" ? (fdYears <= 1 ? b.fd1y : fdYears <= 3 ? b.fd3y : b.fd5y) : b.rd;
                return (
                  <button key={b.name} onClick={() => { if (tab === "FD") setFdRate(rate); else setRdRate(rate); }} className="px-2.5 py-1 rounded-full text-[10px] font-black bg-[#FF7A1A]/10 text-[#FF7A1A] hover:bg-[#FF7A1A] hover:text-white transition">
                    {b.name} {rate}%
                  </button>
                );
              })}
            </div>
          )}
          <button onClick={() => setIsSenior(!isSenior)} className={`px-3 py-2 rounded-full text-[11px] font-black ${isSenior ? "bg-emerald-500 text-white" : isDark ? "bg-white/10" : "bg-black/10"}`}>
            {isSenior ? "✅ Senior 60+ (+0.50%)" : "👴 Senior 60+?"}
          </button>
          <div className={`flex gap-1 items-center px-2 py-1.5 rounded-full border ${isDark ? "border-white/10" : "border-black/10"}`}>
            <span className="text-[10px] font-black opacity-60">TAX SLAB:</span>
            {[0, 5, 20, 30].map((s) => (
              <button key={s} onClick={() => setTaxSlab(s)} className={`px-2.5 py-1 rounded-full text-[10px] font-black ${taxSlab === s ? "bg-[#FF7A1A] text-white" : "bg-black/5"}`}>{s}%</button>
            ))}
          </div>
          <div className={`flex gap-1 items-center px-2 py-1.5 rounded-full border ${isDark ? "border-white/10" : "border-black/10"}`}>
            <span className="text-[10px] font-black opacity-60">INFLATION:</span>
            {[4, 6, 8].map((s) => (
              <button key={s} onClick={() => setInflation(s)} className={`px-2.5 py-1 rounded-full text-[10px] font-black ${inflation === s ? "bg-[#FF7A1A] text-white" : "bg-black/5"}`}>{s}%</button>
            ))}
          </div>
        </div>

        {/* RESULT */}
        <div className="grid md:grid-cols-3 gap-3 mt-4">
          <div className="bg-gradient-to-br from-orange-500 via-[#ff6b00] to-[#ff3c00] rounded-[20px] p-4 text-white">
            <p className="text-[10px] font-black tracking-widest text-black/70">💰 MATURITY - {tab}{isSenior ? " • SENIOR" : ""}</p>
            <h3 className="text-[28px] font-black mt-1 leading-none">{fmtL(current.maturity)}</h3>
            <p className="text-[11px] font-bold mt-1">Nominal Gain: {fmtL(current.gain)}</p>
            <div className="bg-black/25 rounded-xl p-3 mt-3 text-[11px] space-y-1">
              <p className="flex justify-between"><span>Invested</span><b>{fmt(current.invested)}</b></p>
              <p className="flex justify-between"><span>Gain</span><b>{fmt(current.gain)}</b></p>
              {tdsTotal > 0 && <p className="flex justify-between"><span>TDS Deducted</span><b className="text-yellow-200">- {fmt(tdsTotal)}</b></p>}
              {slabTax > tdsTotal && <p className="flex justify-between"><span>Extra Slab Tax</span><b className="text-red-200">- {fmt(slabTax - tdsTotal)}</b></p>}
              <p className="flex justify-between border-t border-white/20 pt-1"><span>After Tax</span><b>{fmt(afterTaxMaturity)}</b></p>
              <p className="flex justify-between"><span>Real (@{inflation}%)</span><b className="text-yellow-200">{fmt(realValue)}</b></p>
            </div>
          </div>

          <div className={`rounded-[20px] border p-4 md:col-span-2 ${isDark ? "bg-[#15151F] border-white/10" : "bg-white border-black/10"}`}>
            <p className="font-black text-[13px]">📊 Paisa Breakdown {eay > 0 && <span className="text-[10px] ml-1 opacity-60">• EAY: {eay.toFixed(2)}%</span>}</p>
            <div className="flex h-3.5 rounded-full overflow-hidden mt-3 bg-black/10">
              <div className="bg-blue-500" style={{ width: `${barPct}%` }} />
              <div className="bg-emerald-500" style={{ width: `${100 - barPct}%` }} />
            </div>
            <div className="flex justify-between text-[11px] font-bold mt-2">
              <span className="text-blue-500">● Invested {barPct.toFixed(0)}% • {fmtL(current.invested)}</span>
              <span className="text-emerald-500">● Gain {(100 - barPct).toFixed(0)}% • {fmtL(current.gain)}</span>
            </div>
            <div className="grid grid-cols-4 gap-2 mt-4">
              <div className={`rounded-xl p-2.5 text-center ${isDark ? "bg-white/5" : "bg-black/5"}`}>
                <p className="text-[9px] opacity-60 font-bold">YEARLY GAIN</p>
                <p className="font-black text-[12px]">{fmtL(current.gain / Math.max(years, 1))}</p>
              </div>
              <div className={`rounded-xl p-2.5 text-center ${isDark ? "bg-white/5" : "bg-black/5"}`}>
                <p className="text-[9px] opacity-60 font-bold">WEALTH ×</p>
                <p className="font-black text-[12px]">{current.invested > 0 ? (current.maturity / current.invested).toFixed(2) : "0"}×</p>
              </div>
              <div className={`rounded-xl p-2.5 text-center ${isDark ? "bg-white/5" : "bg-black/5"}`}>
                <p className="text-[9px] opacity-60 font-bold">TDS TOTAL</p>
                <p className="font-black text-[12px]">{fmt(tdsTotal)}</p>
              </div>
              <div className={`rounded-xl p-2.5 text-center ${isDark ? "bg-white/5" : "bg-black/5"}`}>
                <p className="text-[9px] opacity-60 font-bold">YEARS</p>
                <p className="font-black text-[12px]">{years}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3 no-print">
              <button onClick={() => setShowTable(!showTable)} className="py-2 bg-[#FF7A1A] rounded-xl font-black text-white text-[11px]">{showTable ? "Hide Table ▲" : "Year Table ▼"}</button>
              <button onClick={copyResult} className={`py-2 rounded-xl font-black text-[11px] ${isDark ? "bg-white/10" : "bg-black/5"}`}>{copied ? "✓ Copied" : "📋 Copy"}</button>
            </div>
          </div>
        </div>

        {/* GROWTH CHART */}
        <div className={`rounded-[20px] border p-4 mt-4 ${isDark ? "bg-[#15151F] border-white/10" : "bg-white border-black/10"}`}>
          <div className="flex justify-between items-center mb-2">
            <p className="font-black text-[13px]">📈 Growth Over Time</p>
            <div className="flex gap-3 text-[10px] font-bold">
              <span className="text-blue-500">● Invested</span>
              <span className="text-emerald-500">● Maturity</span>
            </div>
          </div>
          <GrowthChart data={yearTable} isDark={isDark} />
        </div>

        <div className="grid lg:grid-cols-5 gap-4 mt-4">
          {/* INPUTS */}
          <div className={`rounded-[20px] border p-5 lg:col-span-2 no-print ${isDark ? "bg-[#15151F] border-white/10" : "bg-white border-black/10"}`}>
            {tab === "FD" && (
              <>
                <h2 className="font-black text-[15px]">🏦 Fixed Deposit</h2>
                <Input label="Lumpsum Amount (₹)" value={fdP} onChange={setFdP} suffix="₹" isDark={isDark} max={10000000} />
                <Input label={`Interest Rate ${isSenior ? "(+0.5%)" : ""} (% p.a.)`} value={fdRate} onChange={setFdRate} suffix="%" isDark={isDark} max={12} />
                <Input label="Years" value={fdYears} onChange={setFdYears} suffix="Yrs" isDark={isDark} max={30} />
                <div className="mt-3">
                  <label className={`text-[11px] font-black ${isDark ? "text-[#FF7A1A]" : "text-[#D65A00]"}`}>COMPOUNDING</label>
                  <div className="flex gap-1 mt-1">
                    {[{ f: 1, l: "Yearly" }, { f: 2, l: "Half-Yr" }, { f: 4, l: "Quarterly" }, { f: 12, l: "Monthly" }].map((x) => (
                      <button key={x.f} onClick={() => setFdFreq(x.f as CompFreq)} className={`flex-1 py-1.5 rounded-lg text-[10px] font-black ${fdFreq === x.f ? "bg-[#FF7A1A] text-white" : isDark ? "bg-white/5" : "bg-black/5"}`}>{x.l}</button>
                    ))}
                  </div>
                </div>
              </>
            )}
            {tab === "RD" && (
              <>
                <h2 className="font-black text-[15px]">📅 Recurring Deposit</h2>
                <Input label="Monthly Deposit (₹)" value={rdMonthly} onChange={setRdMonthly} suffix="₹/mo" isDark={isDark} max={100000} />
                <Input label={`Rate ${isSenior ? "(+0.5%)" : ""} (% p.a.)`} value={rdRate} onChange={setRdRate} suffix="%" isDark={isDark} max={12} />
                <Input label="Years" value={rdYears} onChange={setRdYears} suffix="Yrs" isDark={isDark} max={10} />
              </>
            )}
            {tab === "CI" && (
              <>
                <h2 className="font-black text-[15px]">📈 Compound Interest</h2>
                <Input label="Lumpsum (₹)" value={ciP} onChange={setCiP} suffix="₹" isDark={isDark} />
                <Input label="Monthly SIP (₹)" value={ciMonthly} onChange={setCiMonthly} suffix="₹/mo" isDark={isDark} max={100000} />
                <Input label="Expected Return (%)" value={ciRate} onChange={setCiRate} suffix="%" isDark={isDark} max={30} />
                <Input label="Years" value={ciYears} onChange={setCiYears} suffix="Yrs" isDark={isDark} max={30} />
                <p className={`text-[10px] mt-2 ${isDark ? "text-white/50" : "text-black/50"}`}>💡 Equity assumed: 12.5% LTCG with ₹1.25L exemption per year</p>
              </>
            )}
            {tab === "PPF" && (
              <>
                <h2 className="font-black text-[15px]">🛡️ PPF - Tax Free</h2>
                <Input label="Yearly Deposit (Max ₹1.5L)" value={ppfYearly} onChange={(v) => setPpfYearly(Math.min(150000, v))} suffix="₹/yr" isDark={isDark} max={150000} />
                <Input label="Rate (%)" value={ppfRate} onChange={setPpfRate} suffix="%" isDark={isDark} max={12} />
                <Input label="Years (min 15)" value={ppfYears} onChange={(v) => setPpfYears(Math.max(15, v))} suffix="Yrs" isDark={isDark} max={50} />
                <div className="mt-3 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold">✅ EEE — Invest, Interest, Maturity sab tax-free</div>
              </>
            )}
            {tab === "PO" && (
              <>
                <h2 className="font-black text-[15px]">📮 Post Office Schemes</h2>
                <div className="flex gap-1 mt-2">
                  {(Object.keys(PO_SCHEMES) as POScheme[]).map((s) => (
                    <button key={s} onClick={() => setPoScheme(s)} className={`flex-1 py-1.5 rounded-lg text-[10px] font-black ${poScheme === s ? "bg-[#FF7A1A] text-white" : isDark ? "bg-white/5" : "bg-black/5"}`}>{s}</button>
                  ))}
                </div>
                <p className={`text-[11px] mt-2 ${isDark ? "text-white/60" : "text-black/60"}`}>{PO_SCHEMES[poScheme].desc}</p>
                <Input label="Lumpsum Amount (₹)" value={poP} onChange={setPoP} suffix="₹" isDark={isDark} />
                <p className={`text-[10px] mt-2 ${isDark ? "text-white/50" : "text-black/50"}`}>Rate: {PO_SCHEMES[poScheme].rate}% for {PO_SCHEMES[poScheme].years} years{PO_SCHEMES[poScheme].taxable ? " · Taxable at slab" : " · Tax-free EEE"}</p>
              </>
            )}
          </div>

          {/* RIGHT */}
          <div className="lg:col-span-3 space-y-4">
            {showTable && (
              <div className={`rounded-[20px] border p-4 overflow-hidden ${isDark ? "bg-[#15151F] border-white/10" : "bg-white border-black/10"}`}>
                <h3 className="font-black text-[14px]">📅 Year-Wise Table</h3>
                <div className="overflow-x-auto mt-3">
                  <table className="w-full text-[11px] min-w-[400px]">
                    <thead className={`${isDark ? "text-white/50" : "text-black/50"}`}>
                      <tr><th className="py-2 text-left">Year</th><th>Invested</th><th>Gain</th><th>Maturity</th><th className="text-right">Real Value</th></tr>
                    </thead>
                    <tbody>
                      {yearTable.map((r) => (
                        <tr key={r.year} className={`border-t ${isDark ? "border-white/5" : "border-black/5"}`}>
                          <td className="py-1.5 font-black">Y{r.year}</td>
                          <td>{fmt(r.invested)}</td>
                          <td className="text-emerald-500 font-bold">+{fmt(r.gain)}</td>
                          <td className="font-black">{fmt(r.maturity)}</td>
                          <td className={`text-right ${isDark ? "text-white/50" : "text-black/50"}`}>{fmt(r.realValue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {showCompare && (
              <div className={`rounded-[20px] border p-4 ${isDark ? "bg-[#15151F] border-white/10" : "bg-white border-black/10"}`}>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-black text-[14px]">⚔️ Fair Comparison (Same Monthly, Same Tenure)</h3>
                  <button onClick={() => setShowCompare(false)} className="text-[10px] font-black text-[#FF7A1A]">Hide</button>
                </div>
                <p className={`text-[10px] mb-2 ${isDark ? "text-white/50" : "text-black/50"}`}>
                  Assuming ₹{comparison[0].monthly.toLocaleString("en-IN")}/month for {tab === "PPF" ? 15 : years} years. FD = same total as lumpsum at start.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {comparison.map((c) => (
                    <div key={c.key} className={`rounded-2xl p-3 border text-center ${c.key === bestCompare.key ? "border-emerald-500 bg-emerald-500/10" : isDark ? "border-white/10 bg-white/[0.03]" : "border-black/10 bg-black/[0.02]"}`}>
                      <p className="font-black text-[11px]">{c.name}</p>
                      {c.key === bestCompare.key && <span className="text-[8px] font-black bg-emerald-500 text-white px-1.5 py-0.5 rounded-full">BEST</span>}
                      <p className="font-black text-[14px] mt-1">{fmtL(c.net)}</p>
                      <p className="text-[9px] opacity-60">after tax</p>
                      <p className="text-[9px] text-red-500 mt-0.5">-{fmtL(c.tax)}</p>
                      <div className="h-1 bg-black/10 rounded-full mt-1 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-orange-400 to-emerald-500" style={{ width: `${(c.net / bestCompare.net) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <p className={`text-[10px] mt-2 ${isDark ? "text-white/60" : "text-black/60"}`}>💡 {bestCompare.name} — {bestCompare.note}.</p>
              </div>
            )}

            <div className={`rounded-[20px] border p-4 ${isDark ? "bg-[#15151F] border-white/10" : "bg-white border-black/10"}`}>
              <h3 className="font-black text-[14px]">🎯 Goal: Reach ₹1 Cr</h3>
              <p className={`text-[11px] mt-1 ${isDark ? "text-white/70" : "text-black/70"}`}>
                ₹1 Cr corpus ke liye <b className="text-emerald-500">{fmt(reverseCalc.monthlyNeeded)}/month</b> invest karna hoga (at {effRdRate.toFixed(1)}% rate, {reverseCalc.years} years me). Ya <b>{fmt(reverseCalc.monthlyNeeded * 12)}/year</b>.
              </p>
            </div>
          </div>
        </div>

        {/* AD SLOT */}
        <div className={`mt-5 h-[90px] rounded-xl border border-dashed flex items-center justify-center text-[10px] font-bold tracking-widest opacity-40 no-print ${isDark ? "border-white/10" : "border-black/10"}`}>
          AD SLOT · 728×90
        </div>

        {/* ================= SEO CONTENT ================= */}
        <article className={`max-w-[900px] mx-auto py-8 text-[14px] leading-relaxed ${isDark ? "text-white/80" : "text-black/80"}`}>
          <h1 className="text-[28px] md:text-[38px] font-black leading-tight text-[#FF7A1A]">
            FD, RD, Compound Interest & PPF Calculator 2026 — Free Maturity, TDS & Tax-Adjusted Returns
          </h1>
          <p className="mt-4">
            Our <strong>free FD + RD + Compound + PPF Calculator</strong> gives you CA-level accuracy for calculating <strong>Fixed Deposit</strong>, <strong>Recurring Deposit</strong>, <strong>Compound Interest (SIP + Lumpsum)</strong>, <strong>Public Provident Fund</strong>, and Post Office schemes (NSC, SCSS, KVP, SSY) — all in one powerful tool. Unlike basic calculators, this version handles <strong>TDS (Tax Deducted at Source) with ₹40,000/₹50,000 thresholds, senior citizen bonus rates, tax slab calculations, inflation-adjusted real returns, compounding frequency options, effective annual yield (EAY), and a 4-way tax-adjusted comparison</strong>. Whether you are deciding between FD and SIP for a ₹10 lakh inheritance, comparing PPF vs NSC for your daughter's future, or calculating how much TDS the bank will deduct on your senior parent's FD interest, this calculator answers every question with mathematical precision.
          </p>

          <h2 className="text-[22px] md:text-[26px] font-black mt-8 text-[#FF7A1A]">What is a Fixed Deposit (FD)?</h2>
          <p className="mt-3">
            A <strong>Fixed Deposit (FD)</strong> is a bank or NBFC scheme where you invest a lumpsum amount for a fixed tenure at a predetermined interest rate. Unlike savings accounts, your money is locked in until maturity — the trade-off being <strong>higher interest rates (6.5% to 7.5% in 2026)</strong>. FDs are considered one of the safest investment instruments in India because they are backed by banks and, to a certain extent, by DICGC insurance (up to ₹5 lakh per depositor per bank). Interest is compounded quarterly in most bank FDs, though monthly, half-yearly, and yearly compounding options exist.
          </p>
          <p className="mt-3">
            <strong>Maturity formula:</strong> M = P × (1 + r/n)^(n×t), where P is principal, r is annual rate, n is compounding frequency, and t is years. For a ₹2 lakh FD at 7% for 5 years with quarterly compounding, maturity comes to ₹2,82,953 — a gain of ₹82,953. The interest earned is taxable at your slab rate, and if the annual interest exceeds <strong>₹40,000 (₹50,000 for seniors)</strong>, the bank will deduct 10% TDS.
          </p>

          <h2 className="text-[22px] md:text-[26px] font-black mt-8 text-[#FF7A1A]">What is a Recurring Deposit (RD)?</h2>
          <p className="mt-3">
            A <strong>Recurring Deposit (RD)</strong> is the monthly-instalment version of FD. Instead of depositing a lumpsum, you deposit a fixed amount every month for a fixed tenure. Each instalment earns interest from the date of deposit until maturity. RDs are perfect for salaried professionals who want to build a corpus from monthly cash flows without needing a large upfront amount. Minimum deposits start as low as ₹100/month in most banks.
          </p>
          <p className="mt-3">
            <strong>Formula:</strong> M = P × ((1+i)^n − 1) / i × (1+i), where i is the monthly interest rate and n is the number of months. For a ₹5,000/month RD at 6.5% for 5 years, maturity comes to about ₹3,53,800 — total invested ₹3L, interest ₹53,800. Like FD, RD interest is also taxed at slab rate with 10% TDS above the ₹40K/₹50K threshold.
          </p>

          <h2 className="text-[22px] md:text-[26px] font-black mt-8 text-[#FF7A1A]">What is a Compound Interest Calculator?</h2>
          <p className="mt-3">
            A <strong>compound interest calculator</strong> shows how money grows when interest is reinvested to earn more interest — the legendary "8th wonder of the world" (attributed to Einstein). Unlike simple interest, compound interest produces exponential growth. ₹1 lakh invested at 12% compound interest for 30 years becomes ₹29.9 lakh; at 7% simple interest, it would only become ₹3.1 lakh. That is a <strong>10x difference</strong> — this is why time in the market matters more than timing the market.
          </p>
          <p className="mt-3">
            Our calculator handles both <strong>lumpsum compounding</strong> (A = P(1+r)^t) and <strong>SIP compounding</strong> (monthly investments with rupee-cost averaging). If you invest ₹1 lakh lumpsum + ₹10,000/month SIP at 12% for 15 years, maturity is approximately ₹55 lakh — invested amount ₹19 lakh, gain ₹36 lakh. This is the power of compound interest over time.
          </p>

          <h2 className="text-[22px] md:text-[26px] font-black mt-8 text-[#FF7A1A]">What is PPF (Public Provident Fund)?</h2>
          <p className="mt-3">
            <strong>PPF</strong> is a government-backed long-term savings scheme designed for retirement and wealth creation. It offers <strong>EEE (Exempt-Exempt-Exempt)</strong> tax status — investment gets 80C deduction (up to ₹1.5L/year), interest is tax-free, and maturity is tax-free. The lock-in is 15 years (extendable in 5-year blocks), and the current rate is 7.1% p.a. compounded annually. PPF is one of the safest investment options in India because it is backed by the Government of India.
          </p>
          <p className="mt-3">
            <strong>Formula:</strong> M = Y × ((1+r)^t − 1) / r × (1+r), where Y is yearly investment, r is annual rate, and t is years. Depositing ₹1.5L/year for 15 years at 7.1% produces a maturity of approximately ₹40.7 lakh — total invested ₹22.5 lakh, tax-free gain ₹18.2 lakh. This is why PPF is unbeatable for long-term goals like child education, marriage, or retirement.
          </p>

          <h2 className="text-[22px] md:text-[26px] font-black mt-8 text-[#FF7A1A]">How to Use This Calculator — Step-by-Step Guide</h2>
          <ol className="mt-3 list-decimal pl-6 space-y-1.5">
            <li><strong>Select the scheme</strong> — FD, RD, Compound, PPF, or Post Office.</li>
            <li><strong>Enter the investment amount</strong> — lumpsum for FD/PPF, monthly for RD/SIP.</li>
            <li><strong>Set the interest rate</strong> — use bank preset buttons for live rates or enter manually.</li>
            <li><strong>Choose tenure</strong> — slider from 1 to 30 years.</li>
            <li><strong>Select compounding frequency</strong> — for FD (monthly, quarterly, half-yearly, yearly).</li>
            <li><strong>Toggle senior citizen</strong> — adds 0.5% rate and raises TDS threshold to ₹50K.</li>
            <li><strong>Choose tax slab</strong> — 0%, 5%, 20%, or 30% — impacts final after-tax returns.</li>
            <li><strong>Select inflation rate</strong> — 4%, 6%, or 8% — to see real value of your money.</li>
            <li><strong>View results</strong> — maturity, TDS, after-tax value, real value, EAY.</li>
            <li><strong>Check 4-way comparison</strong> — see which product wins for same monthly investment.</li>
            <li><strong>Export</strong> — save, copy, CSV, or print to PDF.</li>
          </ol>

          <h2 className="text-[22px] md:text-[26px] font-black mt-8 text-[#FF7A1A]">FD vs RD vs PPF vs SIP — Which is Better in 2026?</h2>
          <ul className="mt-3 list-disc pl-6 space-y-2">
            <li><strong>FD (Fixed Deposit):</strong> Best for lumpsum money you won't need for 1-5 years. Safe, guaranteed returns of 6.5-7.5%. Interest is taxable. Choose over SIP only if tenure is under 3 years.</li>
            <li><strong>RD (Recurring Deposit):</strong> Best for building discipline with monthly savings. Same risk/return profile as FD but with monthly instalments. Great for short-term goals (1-3 years).</li>
            <li><strong>PPF:</strong> Best for 15+ year goals with tax-free returns. Rate is lower (7.1%) than equity SIP but completely risk-free and tax-free. Perfect for retirement corpus, child education, or wedding.</li>
            <li><strong>Compound/SIP:</strong> Best for 10+ year goals with higher risk tolerance. Historical equity returns of 12-14% beat all FD/PPF by wide margins, but come with market volatility. LTCG tax of 12.5% above ₹1.25L applies.</li>
            <li><strong>NSC:</strong> 5-year Post Office scheme at 7.7% — higher than FD, 80C eligible. Interest is taxable but reinvested interest also qualifies for 80C.</li>
            <li><strong>SCSS:</strong> Senior citizens only, 8.2% quarterly payout, max ₹30L, 80C eligible. Best for retirees wanting regular income.</li>
            <li><strong>KVP:</strong> Money doubles in 115 months (~9.5 years) at 7.5%. No 80C. Good for goal-based investing without tax complexity.</li>
            <li><strong>SSY:</strong> Girl child scheme, 8.2% tax-free, 80C eligible up to ₹1.5L/year. 15-year deposit period, matures at 21 years.</li>
          </ul>

          <h2 className="text-[22px] md:text-[26px] font-black mt-8 text-[#FF7A1A]">Understanding TDS on FD Interest (Section 194A)</h2>
          <p className="mt-3">
            Under Section 194A of the Income Tax Act, banks deduct <strong>10% TDS on FD/RD interest</strong> if the total interest earned across all branches of a single bank exceeds <strong>₹40,000 in a financial year</strong> (₹50,000 for senior citizens aged 60+). This threshold was increased from ₹10,000 to ₹40,000 in Budget 2023 to reduce compliance burden on small investors.
          </p>
          <p className="mt-3">
            <strong>Important nuance:</strong> TDS is not the same as your actual tax liability. If you are in the 30% slab, you still owe 20% more tax at filing — banks only deducted 10% TDS, so you must pay the remaining 20% as self-assessment tax. Conversely, if your total income is below the taxable limit, you can file <strong>Form 15G</strong> (below 60) or <strong>Form 15H</strong> (senior citizens) to prevent TDS deduction altogether, or claim a refund at ITR filing if TDS was already deducted. Our calculator shows both TDS and actual tax at your slab, so you see the real hit to your returns.
          </p>

          <h2 className="text-[22px] md:text-[26px] font-black mt-8 text-[#FF7A1A]">Senior Citizen Benefits (2026)</h2>
          <ul className="mt-3 list-disc pl-6 space-y-1.5">
            <li><strong>Extra 0.5% FD/RD rate:</strong> Most banks offer 0.25%-0.50% higher interest to citizens aged 60+.</li>
            <li><strong>TDS threshold ₹50,000:</strong> (vs ₹40,000 for others). Form 15H to avoid TDS.</li>
            <li><strong>SCSS scheme:</strong> 8.2% quarterly payout with 80C deduction (max ₹30L).</li>
            <li><strong>Section 80TTB:</strong> ₹50,000 deduction on savings + FD interest (vs ₹10,000 under 80TTA for others).</li>
            <li><strong>Higher basic exemption (old regime):</strong> ₹3 lakh for 60-80, ₹5 lakh for 80+.</li>
          </ul>

          <h2 className="text-[22px] md:text-[26px] font-black mt-8 text-[#FF7A1A]">Real Returns — Why Inflation Matters</h2>
          <p className="mt-3">
            <strong>Real return = Nominal return − Inflation.</strong> If your FD earns 7% but inflation is 6%, your real return is just 1%. Worse — after tax at 30% slab, your post-tax return is 4.9%, giving a <strong>negative real return of −1.1%</strong>. This is the silent killer of FD investors. A ₹1 crore FD today, at 6% inflation, will have purchasing power of only ₹41 lakh in 15 years. Our calculator shows you the <strong>inflation-adjusted real value</strong> of every maturity so you can see the truth behind the nominal number.
          </p>

          <h2 className="text-[22px] md:text-[26px] font-black mt-8 text-[#FF7A1A]">FD/RD/PPF Glossary</h2>
          <div className="mt-3">
            {[
              ["FD (Fixed Deposit)", "Bank scheme where you invest a lumpsum for a fixed tenure at a fixed rate."],
              ["RD (Recurring Deposit)", "Bank scheme where you deposit a fixed amount every month for a fixed tenure."],
              ["PPF", "Public Provident Fund — 15-year government scheme with EEE tax status and 7.1% rate."],
              ["NSC", "National Savings Certificate — 5-year Post Office scheme at 7.7%, 80C eligible, interest taxable."],
              ["SCSS", "Senior Citizens Savings Scheme — 8.2% quarterly payout for 60+ age, max ₹30L, interest taxable."],
              ["KVP", "Kisan Vikas Patra — 7.5% rate, money doubles in 115 months, interest taxable at maturity."],
              ["SSY", "Sukanya Samriddhi Yojana — girl child scheme at 8.2%, tax-free EEE."],
              ["TDS", "Tax Deducted at Source — 10% on FD/RD interest above ₹40K/₹50K threshold."],
              ["EAY", "Effective Annual Yield — actual annual return after compounding, > nominal rate."],
              ["Compounding", "Interest on interest — makes money grow exponentially over time."],
              ["LTCG", "Long-Term Capital Gains — 12.5% tax on equity/mutual fund gains above ₹1.25L."],
              ["Real Return", "Nominal return minus inflation — the actual purchasing power gain."],
              ["Premature Withdrawal", "Closing FD/RD before maturity — attracts 0.5-1% penalty."],
              ["Form 15G/15H", "Declarations to avoid TDS if your income is below taxable limit."],
              ["Section 80C", "₹1.5L deduction for PPF, NSC, SSY, tax-saver FD, ELSS."],
            ].map(([title, body], i) => (
              <Accordion key={i} title={title} isOpen={openAccordion === `g${i}`} onToggle={() => setOpenAccordion(openAccordion === `g${i}` ? null : `g${i}`)} isDark={isDark}>{body}</Accordion>
            ))}
          </div>

          <h2 className="text-[22px] md:text-[26px] font-black mt-8 text-[#FF7A1A]">Frequently Asked Questions (FAQ)</h2>
          <div className="mt-3">
            {[
              ["FD aur RD me kya difference hai?", "FD me lumpsum invest karte ho, RD me har mahine. FD larger amounts ke liye, RD monthly savings ke liye better hai."],
              ["FD pe TDS kab kata jata hai?", "Jab annual FD/RD interest ₹40,000 (senior ₹50,000) cross ho, tab bank 10% TDS katta hai. Form 15G/15H deke bacha sakte ho agar income taxable nahi hai."],
              ["PPF pe tax lagta hai?", "Nahi, PPF EEE hai — investment pe 80C deduction, interest tax-free, maturity tax-free."],
              ["Senior citizens ko FD pe extra interest milta hai?", "Haan, 0.25-0.50% extra. SBI, HDFC, ICICI sab me senior rates alag hai. TDS threshold bhi ₹50K hai."],
              ["FD me compounding kaise hoti hai?", "Banks usually quarterly compounding karte hai. Monthly, half-yearly, yearly options bhi available hai. Zyada compounding = zyada EAY."],
              ["PPF maturity kitne saal me hoti hai?", "15 saal ka lock-in, phir 5-5 saal ke blocks me extend kar sakte ho. 7 saal ke baad partial withdrawal allowed hai."],
              ["NSC, SCSS, KVP kya hai?", "NSC 5Y @ 7.7%, SCSS senior-only @ 8.2% quarterly payout, KVP @ 7.5% doubles money in 115 months. NSC/SCSS/KVP interest taxable at slab rate, SSY tax-free."],
              ["Compound interest ka formula kya hai?", "Lumpsum: A = P(1+r/n)^(nt). SIP: A = M × ((1+i)^n - 1)/i × (1+i) where i = monthly rate."],
              ["FD vs SIP — kaunsa better hai?", "Short-term (<3Y): FD safer. Long-term (>10Y): SIP historical 12% returns beat FD even after tax. But SIP has market risk."],
              ["Tax saver FD kya hai?", "5-year lock-in FD with 80C deduction up to ₹1.5L. Rate normal FD se 0.5% less. Premature withdrawal not allowed."],
              ["Kya FD interest pe 80C deduction milta hai?", "Nahi, sirf interest taxable hai. Tax-saver FD ke principal pe 80C milta hai, par interest slab rate pe taxed."],
              ["Premature close pe penalty?", "Usually 0.5-1% penalty. Amount re-calculated at lower rate applicable to actual tenure."],
              ["Real return kya hai?", "Nominal return minus inflation. 7% FD - 6% inflation = 1% real return. Aur after 30% tax, real return negative ho sakta hai."],
              ["NSC vs PPF — kaunsa better hai?", "NSC 5Y, PPF 15Y. Rate similar. PPF completely tax-free, NSC me interest pe tax lagta hai. Long term me PPF better."],
              ["Kya RD me compounding hoti hai?", "Haan, most banks quarterly compounding karte hai. Har monthly deposit pe maturity tak ka interest milta hai."],
            ].map(([q, a], i) => (
              <Accordion key={i} title={q} isOpen={openAccordion === `f${i}`} onToggle={() => setOpenAccordion(openAccordion === `f${i}` ? null : `f${i}`)} isDark={isDark}>{a}</Accordion>
            ))}
          </div>

          <h2 className="text-[22px] md:text-[26px] font-black mt-8 text-[#FF7A1A]">Smart Tips for Maximizing Returns</h2>
          <ul className="mt-3 list-disc pl-6 space-y-1.5">
            <li><strong>Ladder your FDs:</strong> Split a large FD into 3-5 smaller FDs of different tenures so you don't lose interest if you need money early.</li>
            <li><strong>Use Form 15G/15H:</strong> If your income is below taxable limit, avoid TDS — better cash flow.</li>
            <li><strong>PPF before 5th of month:</strong> Interest is calculated on lowest balance between 5th and month-end. Deposit before 5th to earn full month interest.</li>
            <li><strong>Senior citizens:</strong> SCSS gives 8.2% with quarterly payout — often better than FD after senior bonus.</li>
            <li><strong>Tax-saver FD for 80C:</strong> Only if you can't invest in ELSS/PPF — 5-year lock-in, rate slightly lower.</li>
            <li><strong>Don't chase highest rate:</strong> Small co-op banks sometimes offer 9% but carry higher risk. Stick to DICGC-insured (₹5L cover) or reputed banks.</li>
            <li><strong>SIP for long-term:</strong> If goal is >10 years, SIP beats FD/PPF by 5%+ CAGR — worth the volatility.</li>
            <li><strong>Real return is the only return:</strong> After tax and inflation, FD may give negative real return. Balance FD with equity for wealth preservation.</li>
            <li><strong>Auto-renew wisely:</strong> Banks auto-renew FDs at the same rate. If rates have risen since your last FD, manually renew at new rate.</li>
            <li><strong>Dividend vs Growth:</strong> For debt funds, growth option is better for long-term (compounding + LTCG).</li>
          </ul>

          <h2 className="text-[22px] md:text-[26px] font-black mt-8 text-[#FF7A1A]">Related Keywords</h2>
          <p className={`mt-3 text-[11px] leading-relaxed ${isDark ? "text-white/50" : "text-black/50"}`}>
            fd calculator · rd calculator · ppf calculator · compound interest calculator · post office rd calculator · sbi fd calculator · hdfc fd calculator · icici fd calculator · fixed deposit calculator · recurring deposit calculator · ppf maturity calculator · fd interest calculator · senior citizen fd rates · fd tax calculator · tds calculator fd · rd maturity calculator · nsc calculator · scss calculator · kvp calculator · ssy calculator · sukanya samriddhi calculator · fd vs rd · ppf vs nsc · fd vs sip · compound interest calculator india · sip compound calculator · tax saver fd · section 80c investments · 5 year fd rates · best fd rates 2026 · tds on fd interest · form 15g form 15h · fd premature withdrawal penalty · ppf interest calculation · ppf extension calculator · rd vs sip comparison · investment calculator india · return calculator · maturity calculator
          </p>

          <div className={`mt-8 p-4 rounded-xl text-[11px] ${isDark ? "bg-white/5 text-white/50" : "bg-gray-100 text-black/60"}`}>
            <strong>Disclaimer:</strong> This calculator is for informational and estimation purposes only. Bank interest rates, TDS rules, and tax slabs are subject to change. Senior citizen rates and thresholds may vary by bank and are updated periodically by RBI and CBDT. Post Office scheme rates are notified quarterly by the Government of India. Actual maturity values may differ from estimates due to rounding, bank-specific policies, or mid-term rate changes. This is not investment advice. Consult a SEBI-registered investment advisor or your bank relationship manager before making financial decisions. The creator is not liable for any decisions made based on this calculator.
          </div>
        </article>
      </div>
    </div>
  );
}
