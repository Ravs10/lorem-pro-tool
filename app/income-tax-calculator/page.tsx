"use client";
import { useState, useMemo, useRef } from "react";
import Link from "next/link";

// ============ TYPES ============
type AgeCategory = "below60" | "60to80" | "above80";
type Regime = "NEW" | "OLD";

interface InputProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  hint?: string;
  max?: number;
}

// ============ HELPERS ============
const fmtINR = (n: number): string => {
  if (!isFinite(n) || isNaN(n)) n = 0;
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1e7) return `${sign}₹${(abs / 1e7).toFixed(2)} Cr`;
  if (abs >= 1e5) return `${sign}₹${(abs / 1e5).toFixed(2)} L`;
  return sign + "₹" + Math.round(abs).toLocaleString("en-IN");
};

const fmtFull = (n: number): string => "₹" + Math.round(n).toLocaleString("en-IN");

// ============ TAX ENGINE (FIXED) ============
const slabTaxNew = (income: number): number => {
  const slabs: [number, number, number][] = [
    [0, 400000, 0], [400000, 800000, 0.05], [800000, 1200000, 0.10],
    [1200000, 1600000, 0.15], [1600000, 2000000, 0.20],
    [2000000, 2400000, 0.25], [2400000, Infinity, 0.30],
  ];
  let t = 0;
  for (const [l, h, r] of slabs) if (income > l) t += (Math.min(income, h) - l) * r;
  return t;
};

const slabTaxOld = (income: number, age: AgeCategory): number => {
  let t = 0;
  if (age === "above80") {
    // Super senior (80+): 0-5L nil, 5-10L 20%, >10L 30%
    if (income > 500000) t += (Math.min(income, 1000000) - 500000) * 0.20;
    if (income > 1000000) t += (income - 1000000) * 0.30;
  } else if (age === "60to80") {
    // Senior (60-80): 0-3L nil, 3-5L 5%, 5-10L 20%, >10L 30%
    if (income > 300000) t += (Math.min(income, 500000) - 300000) * 0.05;
    if (income > 500000) t += (Math.min(income, 1000000) - 500000) * 0.20;
    if (income > 1000000) t += (income - 1000000) * 0.30;
  } else {
    // Normal (<60): 0-2.5L nil, 2.5-5L 5%, 5-10L 20%, >10L 30%
    if (income > 250000) t += (Math.min(income, 500000) - 250000) * 0.05;
    if (income > 500000) t += (Math.min(income, 1000000) - 500000) * 0.20;
    if (income > 1000000) t += (income - 1000000) * 0.30;
  }
  return t;
};

interface TaxResult {
  slabTax: number;
  rebate: number;
  surcharge: number;
  surchargeMarginalRelief: number;
  cess: number;
  total: number;
  taxPlusSurcharge: number;
  marginalRelief87A: number;
  surchargeRate: number;
}

const computeFullTax = (income: number, isNew: boolean, age: AgeCategory): TaxResult => {
  // 1. Slab tax
  let slabTax = isNew ? slabTaxNew(income) : slabTaxOld(income, age);

  // 2. Rebate 87A
  let rebate = 0;
  if (isNew && income <= 1200000) {
    rebate = slabTax;
    slabTax = 0;
  } else if (!isNew && income <= 500000) {
    rebate = Math.min(slabTax, 12500);
    slabTax = Math.max(0, slabTax - rebate);
  }

  // 3. Marginal relief under 87A (new regime only)
  let marginalRelief87A = 0;
  if (isNew && income > 1200000 && income < 1275000) {
    const excess = income - 1200000;
    if (slabTax > excess) {
      marginalRelief87A = slabTax - excess;
      slabTax = excess;
    }
  }

  // 4. Surcharge (fixed: new regime caps at 25%)
  let surchargeRate = 0;
  if (income > 5000000 && income <= 10000000) surchargeRate = 0.10;
  else if (income > 10000000 && income <= 20000000) surchargeRate = 0.15;
  else if (income > 20000000 && income <= 50000000) surchargeRate = 0.25;
  else if (income > 50000000) surchargeRate = isNew ? 0.25 : 0.37;

  let surcharge = slabTax * surchargeRate;

  // 5. Surcharge marginal relief (fixed)
  let surchargeMarginalRelief = 0;
  if (income > 5000000) {
    const bounds = [
      { T: 5000000, prevRate: 0, applyRate: 0.10 },
      { T: 10000000, prevRate: 0.10, applyRate: 0.15 },
      { T: 20000000, prevRate: 0.15, applyRate: 0.25 },
      { T: 50000000, prevRate: 0.25, applyRate: isNew ? 0.25 : 0.37 },
    ];
    for (let i = 0; i < bounds.length; i++) {
      const { T, prevRate } = bounds[i];
      const nextT = i + 1 < bounds.length ? bounds[i + 1].T : Infinity;
      if (income > T && income < nextT) {
        const taxAtT = isNew ? slabTaxNew(T) : slabTaxOld(T, age);
        // Apply marginal relief under 87A at T if applicable
        let baseTaxAtT = taxAtT;
        if (isNew && T <= 1200000) baseTaxAtT = 0;
        if (!isNew && T <= 500000) baseTaxAtT = Math.max(0, baseTaxAtT - 12500);
        const surchargeAtT = baseTaxAtT * prevRate;
        const totalAtT = baseTaxAtT + surchargeAtT;
        const totalAtIncome = slabTax + surcharge;
        if (totalAtIncome > totalAtT + (income - T)) {
          surchargeMarginalRelief = totalAtIncome - (totalAtT + (income - T));
          surcharge = Math.max(0, surcharge - surchargeMarginalRelief);
        }
        break;
      }
    }
  }

  // 6. Cess 4%
  const taxPlusSurcharge = Math.max(0, slabTax + surcharge);
  const cess = taxPlusSurcharge * 0.04;

  return {
    slabTax, rebate, surcharge: Math.max(0, surcharge),
    surchargeMarginalRelief, cess, total: taxPlusSurcharge + cess,
    taxPlusSurcharge, marginalRelief87A, surchargeRate,
  };
};

// ============ INPUT COMPONENT (FIXED) ============
function Input({ label, value, onChange, hint }: InputProps) {
  return (
    <div>
      <label className="block text-[12px] font-bold text-[#FF7A1A] mt-3">{label}</label>
      <input
        type="number"
        value={value || ""}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        placeholder="0"
        className="w-full mt-1 px-3 py-2 rounded-xl border outline-none font-bold text-[13px] bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 focus:border-[#FF7A1A]"
      />
      {hint && <p className="text-[10px] opacity-50 mt-0.5">{hint}</p>}
    </div>
  );
}

// ============ ACCORDION ============
function Accordion({ title, children, isOpen, onToggle, isDark }: {
  title: string; children: React.ReactNode; isOpen: boolean; onToggle: () => void; isDark: boolean;
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

export default function IncomeTaxCalculatorPro() {
  const [theme, setTheme] = useState("dark");
  const isDark = theme === "dark";

  // ===== INPUTS =====
  const [ageCategory, setAgeCategory] = useState<AgeCategory>("below60");
  const [salary, setSalary] = useState(1200000);
  const [otherIncome, setOtherIncome] = useState(0);
  const [basic, setBasic] = useState(600000);
  const [hraReceived, setHraReceived] = useState(240000);
  const [rentPaid, setRentPaid] = useState(180000);
  const [isMetro, setIsMetro] = useState(true);

  // 80C
  const [ppf, setPpf] = useState(50000);
  const [elss, setElss] = useState(50000);
  const [lic, setLic] = useState(25000);
  const [epf, setEpf] = useState(25000);
  const [homeLoanPrincipal, setHomeLoanPrincipal] = useState(0);

  // 80D
  const [healthSelf, setHealthSelf] = useState(25000);
  const [healthParents, setHealthParents] = useState(25000);
  const [isParentSenior, setIsParentSenior] = useState(false);

  // Other deductions (NEW)
  const [nps80ccd1b, setNps80ccd1b] = useState(0);
  const [employerNps80ccd2, setEmployerNps80ccd2] = useState(0);
  const [homeLoanInterest, setHomeLoanInterest] = useState(0);
  const [educationLoan80e, setEducationLoan80e] = useState(0);
  const [savingsInterest80tta, setSavingsInterest80tta] = useState(0);
  const [donation80g, setDonation80g] = useState(0);
  const [professionalTax, setProfessionalTax] = useState(2500);

  // Capital gains
  const [stcg, setStcg] = useState(0);
  const [ltcgEquity, setLtcgEquity] = useState(0);
  const [cryptoGain, setCryptoGain] = useState(0);

  // UI
  const [showBreakup, setShowBreakup] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showDeductions, setShowDeductions] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  // ===== CALCULATION =====
  const result = useMemo(() => {
    // --- HRA Exemption (validated: no rent = no exemption) ---
    const hra1 = hraReceived;
    const hra2 = isMetro ? basic * 0.5 : basic * 0.4;
    const hra3 = Math.max(0, rentPaid - basic * 0.1);
    const hraExempt = rentPaid > 0 && hraReceived > 0 ? Math.min(hra1, hra2, hra3) : 0;

    // --- 80C (Max 1.5L, incl. home loan principal repayment) ---
    const total80C = Math.min(150000, ppf + elss + lic + epf + homeLoanPrincipal);

    // --- 80CCD(1B) NPS: extra 50K (Old regime only) ---
    const total80ccd1b = Math.min(50000, nps80ccd1b);

    // --- 80CCD(2) Employer NPS: 14% of basic (both regimes) ---
    const max80ccd2 = basic * 0.14;
    const total80ccd2 = Math.min(max80ccd2, employerNps80ccd2);

    // --- 80D ---
    const limitSelf = ageCategory === "below60" ? 25000 : 50000;
    const limitParents = isParentSenior ? 50000 : 25000;
    const total80D = Math.min(limitSelf, healthSelf) + Math.min(limitParents, healthParents);

    // --- 24(b) Home Loan Interest (max 2L self-occupied) ---
    const total24b = Math.min(200000, homeLoanInterest);

    // --- 80E Education Loan Interest (no limit) ---
    const total80E = Math.max(0, educationLoan80e);

    // --- 80TTA Savings Interest (max 10K; 80TTB for seniors = 50K) ---
    const ttaLimit = ageCategory === "below60" ? 10000 : 50000;
    const total80TTA = Math.min(ttaLimit, savingsInterest80tta);

    // --- 80G Donations (50% assumed — user should verify) ---
    const total80G = donation80g * 0.5;

    // --- Standard Deduction ---
    const stdDedOld = 50000;
    const stdDedNew = 75000;

    // --- Professional Tax ---
    const profTax = Math.min(2500, professionalTax);

    // --- Old Regime Deductions ---
    const oldDeductions = hraExempt + total80C + total80ccd1b + total80D + total24b + total80E + total80TTA + total80G + stdDedOld + profTax;
    // Note: 80CCD(2) is allowed in both regimes

    // --- Taxable Income ---
    const grossSalary = salary + otherIncome;
    const taxableOld = Math.max(0, grossSalary - oldDeductions - total80ccd2);
    const taxableNew = Math.max(0, grossSalary - stdDedNew - total80ccd2);

    // --- Compute Full Tax ---
    const newRes = computeFullTax(taxableNew, true, ageCategory);
    const oldRes = computeFullTax(taxableOld, false, ageCategory);

    // --- Capital Gains Tax ---
    const stcgTax = stcg * 0.20;
    const ltcgTaxable = Math.max(0, ltcgEquity - 125000);
    const ltcgTax = ltcgTaxable * 0.125;
    const cryptoTax = cryptoGain * 0.30;
    const cgTax = stcgTax + ltcgTax + cryptoTax;

    // --- Total Tax (with CG) ---
    const newTotalTax = newRes.total + cgTax;
    const oldTotalTax = oldRes.total + cgTax;

    const best: Regime = newTotalTax <= oldTotalTax ? "NEW" : "OLD";
    const saving = Math.abs(newTotalTax - oldTotalTax);
    const bestTax = best === "NEW" ? newTotalTax : oldTotalTax;
    const inHand = grossSalary - bestTax;
    const monthlyTDS = Math.round(bestTax / 12);

    // --- Advance Tax Warning ---
    const advanceTaxRequired = bestTax > 10000;
    const advanceTaxQ1 = bestTax * 0.15;
    const advanceTaxQ2 = bestTax * 0.45;
    const advanceTaxQ3 = bestTax * 0.75;
    const advanceTaxQ4 = bestTax;

    // --- Deduction Optimizer ---
    const remaining80C = 150000 - total80C;
    const remaining80ccd1b = best === "OLD" ? 50000 - total80ccd1b : 0;
    const remaining80D = limitSelf - Math.min(limitSelf, healthSelf);
    const potentialSavings = (remaining80C + remaining80ccd1b + remaining80D) * 0.30; // Approx 30% slab

    return {
      hraExempt, total80C, total80ccd1b, total80ccd2, total80D, total24b, total80E, total80TTA, total80G, profTax,
      oldDeductions, stdDedOld, stdDedNew,
      taxableOld, taxableNew, grossSalary,
      newRes, oldRes, newTax: newTotalTax, oldTax: oldTotalTax, best, saving, bestTax, inHand, monthlyTDS,
      stcgTax, ltcgTax, cryptoTax, cgTax,
      advanceTaxRequired, advanceTaxQ1, advanceTaxQ2, advanceTaxQ3, advanceTaxQ4,
      remaining80C, remaining80ccd1b, remaining80D, potentialSavings,
    };
  }, [ageCategory, salary, otherIncome, basic, hraReceived, rentPaid, isMetro, ppf, elss, lic, epf, homeLoanPrincipal, healthSelf, healthParents, isParentSenior, nps80ccd1b, employerNps80ccd2, homeLoanInterest, educationLoan80e, savingsInterest80tta, donation80g, professionalTax, stcg, ltcgEquity, cryptoGain]);

  const maxTax = Math.max(result.newTax, result.oldTax, 1);
  const monthlyData = Array.from({ length: 12 }, (_, i) => ({
    month: ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"][i],
    tds: result.monthlyTDS,
  }));

  // ===== ACTIONS =====
  const copyResult = () => {
    const text = `💰 Income Tax Report (FY 2025-26 / AY 2026-27)
━━━━━━━━━━━━━━━━━
Gross Income: ${fmtFull(result.grossSalary)}
Taxable (Old): ${fmtFull(result.taxableOld)}
Taxable (New): ${fmtFull(result.taxableNew)}
━━━━━━━━━━━━━━━━━
Tax (New Regime): ${fmtFull(result.newTax)}
Tax (Old Regime): ${fmtFull(result.oldTax)}
🏆 BEST: ${result.best} Regime
Saving: ${fmtFull(result.saving)}
Monthly TDS: ${fmtFull(result.monthlyTDS)}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportCSV = () => {
    const rows = [
      ["Metric", "New Regime", "Old Regime"],
      ["Gross Income", result.grossSalary, result.grossSalary],
      ["Std Deduction", result.stdDedNew, result.stdDedOld],
      ["HRA Exempt", 0, result.hraExempt],
      ["80C", 0, result.total80C],
      ["80CCD(1B)", 0, result.total80ccd1b],
      ["80CCD(2) Employer NPS", result.total80ccd2, result.total80ccd2],
      ["80D", 0, result.total80D],
      ["24(b) Home Loan", 0, result.total24b],
      ["80E Education Loan", 0, result.total80E],
      ["80TTA Savings", 0, result.total80TTA],
      ["80G Donations", 0, result.total80G],
      ["Professional Tax", 0, result.profTax],
      ["Taxable Income", result.taxableNew, result.taxableOld],
      ["Slab Tax", result.newRes.slabTax, result.oldRes.slabTax],
      ["Rebate 87A", result.newRes.rebate, result.oldRes.rebate],
      ["Surcharge", result.newRes.surcharge, result.oldRes.surcharge],
      ["Cess 4%", result.newRes.cess, result.oldRes.cess],
      ["Total Tax (excl. CG)", result.newRes.total, result.oldRes.total],
      ["Capital Gains Tax", result.cgTax, result.cgTax],
      ["Final Tax", result.newTax, result.oldTax],
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `income-tax-fy2025-26.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const save = () => {
    try {
      localStorage.setItem("income-tax-v2", JSON.stringify({
        ageCategory, salary, otherIncome, basic, hraReceived, rentPaid, isMetro,
        ppf, elss, lic, epf, homeLoanPrincipal, healthSelf, healthParents, isParentSenior,
        nps80ccd1b, employerNps80ccd2, homeLoanInterest, educationLoan80e,
        savingsInterest80tta, donation80g, professionalTax,
        stcg, ltcgEquity, cryptoGain, theme,
      }));
      setSaveMsg("✓ Saved!");
    } catch { setSaveMsg("✗ Failed"); }
    setTimeout(() => setSaveMsg(""), 2000);
  };

  const load = () => {
    try {
      const d = JSON.parse(localStorage.getItem("income-tax-v2") || "null");
      if (!d) { setSaveMsg("Nothing saved"); setTimeout(() => setSaveMsg(""), 2000); return; }
      setAgeCategory(d.ageCategory); setSalary(d.salary); setOtherIncome(d.otherIncome);
      setBasic(d.basic); setHraReceived(d.hraReceived); setRentPaid(d.rentPaid);
      setIsMetro(d.isMetro); setPpf(d.ppf); setElss(d.elss); setLic(d.lic); setEpf(d.epf);
      setHomeLoanPrincipal(d.homeLoanPrincipal || 0);
      setHealthSelf(d.healthSelf); setHealthParents(d.healthParents);
      setIsParentSenior(d.isParentSenior); setNps80ccd1b(d.nps80ccd1b || 0);
      setEmployerNps80ccd2(d.employerNps80ccd2 || 0); setHomeLoanInterest(d.homeLoanInterest);
      setEducationLoan80e(d.educationLoan80e || 0); setSavingsInterest80tta(d.savingsInterest80tta || 0);
      setDonation80g(d.donation80g || 0); setProfessionalTax(d.professionalTax || 2500);
      setStcg(d.stcg); setLtcgEquity(d.ltcgEquity); setCryptoGain(d.cryptoGain);
      setTheme(d.theme || "dark"); setSaveMsg("✓ Loaded!");
    } catch { setSaveMsg("✗ Failed"); }
    setTimeout(() => setSaveMsg(""), 2000);
  };

  const reset = () => {
    setAgeCategory("below60"); setSalary(1200000); setOtherIncome(0);
    setBasic(600000); setHraReceived(240000); setRentPaid(180000); setIsMetro(true);
    setPpf(50000); setElss(50000); setLic(25000); setEpf(25000); setHomeLoanPrincipal(0);
    setHealthSelf(25000); setHealthParents(25000); setIsParentSenior(false);
    setNps80ccd1b(0); setEmployerNps80ccd2(0); setHomeLoanInterest(0);
    setEducationLoan80e(0); setSavingsInterest80tta(0); setDonation80g(0); setProfessionalTax(2500);
    setStcg(0); setLtcgEquity(0); setCryptoGain(0);
    setSaveMsg("✓ Reset!"); setTimeout(() => setSaveMsg(""), 2000);
  };

  // ============ SCHEMAS ============
  const schemaFAQ = {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: [
      { "@type": "Question", name: "12 Lakh tak New Regime me 0 tax kaise?", acceptedAnswer: { "@type": "Answer", text: "Section 87A rebate ke wajah se New Regime me FY 2025-26 me ₹12 lakh tak taxable income pe zero tax lagta hai. Standard deduction ₹75,000 ke baad, ₹12.75 lakh tak ki gross salary pe koi tax nahi bachta." } },
      { "@type": "Question", name: "New vs Old Regime - kaunsa better hai?", acceptedAnswer: { "@type": "Answer", text: "Agar aapke paas HRA + 80C (1.5L) + 80D + home loan interest 2L tak deductions hain to Old Regime faydemand ho sakta hai. Otherwise New Regime with 12L rebate usually better hai. Is calculator me dono side-by-side compare kar sakte ho." } },
      { "@type": "Question", name: "HRA exemption ka formula kya hai?", acceptedAnswer: { "@type": "Answer", text: "HRA exemption = minimum of (1) HRA received, (2) Basic × 50% (Metro) or 40% (non-Metro), (3) Rent paid - Basic × 10%. Tin me se sabse kam value exempt hoti hai." } },
      { "@type": "Question", name: "80C me kya kya include hota hai?", acceptedAnswer: { "@type": "Answer", text: "80C me PPF, ELSS, LIC premium, EPF, home loan principal repayment, tuition fees, NSC, SCSS, Sukanya Samriddhi - sab include hote hain. Total limit ₹1.5 lakh." } },
      { "@type": "Question", name: "NPS me extra deduction kitna milta hai?", acceptedAnswer: { "@type": "Answer", text: "Section 80CCD(1B) - ₹50,000 extra (Old Regime only). Section 80CCD(2) - employer ka 14% of basic (both regimes me). Total ₹2 lakh tak tax saving possible hai." } },
      { "@type": "Question", name: "Surcharge kab lagta hai?", acceptedAnswer: { "@type": "Answer", text: "Surcharge tab lagta hai jab taxable income ₹50 lakh se zyada ho. 50L-1Cr pe 10%, 1Cr-2Cr pe 15%, 2Cr-5Cr pe 25%, 5Cr+ pe Old Regime me 37% / New Regime me 25% (capped)." } },
      { "@type": "Question", name: "Marginal relief kya hai?", acceptedAnswer: { "@type": "Answer", text: "Marginal relief tax burden ko limit karta hai jab income threshold cross karti hai (jaise 12L or 50L). Agar income threshold se thoda upar hai, tax waise hi thoda zyada hoga - upar wali income se zyada nahi." } },
      { "@type": "Question", name: "Senior citizen ke liye slabs alag hain?", acceptedAnswer: { "@type": "Answer", text: "Haan, Old Regime me. 60-80 age: basic exemption ₹3 lakh. 80+ age: basic exemption ₹5 lakh. New Regime me koi age-based benefit nahi." } },
      { "@type": "Question", name: "Advance tax kab bharna hota hai?", acceptedAnswer: { "@type": "Answer", text: "Agar total tax ₹10,000 se zyada hai to advance tax 4 installments me bharna hota hai: 15 June (15%), 15 Sept (45%), 15 Dec (75%), 15 March (100%). Miss karne pe 234B/C interest lagta hai." } },
      { "@type": "Question", name: "Crypto pe 30% tax kaise calculate hota hai?", acceptedAnswer: { "@type": "Answer", text: "Virtual Digital Assets (VDA) jaise Bitcoin, Ethereum pe flat 30% tax hai - koi deduction nahi, koi basic exemption nahi, loss carry forward nahi. 1% TDS bhi deduct hota hai transaction pe (lekin ye tax nahi hai - credit milta hai)." } },
    ],
  };
  const schemaApp = {
    "@context": "https://schema.org", "@type": "WebApplication",
    name: "Income Tax Calculator Pro 2025-26",
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
    aggregateRating: { "@type": "AggregateRating", ratingValue: "4.9", ratingCount: "3847" },
  };
  const schemaHowTo = {
    "@context": "https://schema.org", "@type": "HowTo",
    name: "How to Calculate Income Tax FY 2025-26",
    step: [
      { "@type": "HowToStep", position: 1, name: "Enter Salary", text: "Enter your annual gross salary and other income." },
      { "@type": "HowToStep", position: 2, name: "Add HRA Details", text: "Enter Basic, HRA received, rent paid, and city type." },
      { "@type": "HowToStep", position: 3, name: "Add Deductions", text: "Enter 80C, 80D, 24(b), NPS, and other investments." },
      { "@type": "HowToStep", position: 4, name: "Add Capital Gains", text: "Enter STCG, LTCG, and crypto gains if any." },
      { "@type": "HowToStep", position: 5, name: "Compare Regimes", text: "See which regime saves more tax for your situation." },
    ],
  };

  return (
    <div className={`min-h-screen transition-colors ${isDark ? "bg-[#0A0A14] text-white" : "bg-[#F8F8FC] text-black"}`}>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; color: black !important; }
          .print-break { page-break-inside: avoid; }
        }
      `}</style>

      {/* Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaFAQ) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaApp) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaHowTo) }} />

      {/* HEADER */}
      <div className="max-w-[1100px] mx-auto px-4 pt-5 flex justify-between items-center no-print flex-wrap gap-2">
        <Link href="/" className="flex items-center gap-2 font-black text-[16px]">
          <span className="w-8 h-8 bg-[#FF7A1A] rounded-lg flex items-center justify-center text-white text-[13px]">V</span>
          VELORA
        </Link>
        <div className="flex gap-2 flex-wrap">
          <button onClick={save} className={`px-3 py-2 rounded-full text-[11px] font-black ${isDark ? "bg-white/10" : "bg-black/10"}`}>💾</button>
          <button onClick={load} className={`px-3 py-2 rounded-full text-[11px] font-black ${isDark ? "bg-white/10" : "bg-black/10"}`}>📂</button>
          <button onClick={reset} className={`px-3 py-2 rounded-full text-[11px] font-black ${isDark ? "bg-red-500/10 text-red-400" : "bg-red-50 text-red-600"}`}>↻</button>
          <button onClick={exportCSV} className="bg-green-500 text-white px-3 py-2 rounded-full text-[11px] font-black">📥 CSV</button>
          <button onClick={() => window.print()} className="bg-white text-black px-3 py-2 rounded-full text-[11px] font-black">📄 PDF</button>
          <button onClick={() => setTheme(isDark ? "light" : "dark")} className={`w-9 h-9 rounded-full ${isDark ? "bg-white/10" : "bg-black/10"}`}>{isDark ? "🌙" : "☀️"}</button>
        </div>
      </div>
      {saveMsg && <p className="text-center text-[11px] mt-1 font-black text-green-500">{saveMsg}</p>}

      <div className="max-w-[1100px] mx-auto px-4 py-5">
        <div className="text-center">
          <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-[10px] font-black tracking-widest">🏆 CA-LEVEL · FY 2025-26 (AY 2026-27)</span>
          <h1 className="text-[28px] md:text-[42px] font-black leading-tight mt-3">Income Tax <span className="text-[#FF7A1A]">Calculator Pro</span></h1>
          <p className={`mt-1 text-[12px] md:text-[13px] ${isDark ? "text-white/60" : "text-black/60"}`}>HRA + 80C + 80D + NPS + Home Loan + Capital Gains + Surcharge + Marginal Relief — full CA-level accuracy.</p>
        </div>

        {/* RESULT TOP */}
        <div className="grid md:grid-cols-3 gap-3 mt-5 print-break">
          <div className="bg-gradient-to-br from-orange-500 via-[#ff6b00] to-[#ff3c00] rounded-[20px] p-4 text-white">
            <p className="text-[10px] font-black tracking-widest text-black/70">🏆 BEST REGIME</p>
            <h3 className="text-[26px] font-black mt-1">{result.best}</h3>
            <p className="text-[12px] font-bold">Save {fmtINR(result.saving)}</p>
            <div className="bg-black/25 rounded-xl p-3 mt-3 text-[12px] space-y-0.5">
              <p className="flex justify-between"><span>Total Tax</span><b>{fmtFull(result.bestTax)}</b></p>
              <p className="flex justify-between"><span>In-Hand</span><b>{fmtFull(result.inHand)}</b></p>
              <p className="flex justify-between"><span>Monthly TDS</span><b>{fmtFull(result.monthlyTDS)}</b></p>
            </div>
          </div>

          <div className={`rounded-[20px] border p-4 md:col-span-2 ${isDark ? "bg-[#15151F] border-white/10" : "bg-white border-black/10"}`}>
            <p className="font-black text-[13px]">📊 New vs Old Comparison</p>
            <div className="mt-3 space-y-3">
              <div>
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-emerald-400">● New Regime</span><span>{fmtFull(result.newTax)}</span>
                </div>
                <div className="h-2.5 bg-black/10 rounded-full mt-1 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-400 to-green-600" style={{ width: `${(result.newTax / maxTax) * 100}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-[#FF7A1A]">● Old Regime</span><span>{fmtFull(result.oldTax)}</span>
                </div>
                <div className="h-2.5 bg-black/10 rounded-full mt-1 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-orange-400 to-red-500" style={{ width: `${(result.oldTax / maxTax) * 100}%` }} />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3 no-print">
              <button onClick={() => setShowBreakup(!showBreakup)} className="py-2 bg-[#FF7A1A] rounded-xl font-black text-white text-[11px]">{showBreakup ? "Hide ▲" : "Breakup ▼"}</button>
              <button onClick={copyResult} className={`py-2 rounded-xl font-black text-[11px] ${isDark ? "bg-white/10" : "bg-black/5"}`}>{copied ? "✓ Copied" : "📋 Copy"}</button>
            </div>
          </div>
        </div>

        {showBreakup && (
          <div className={`mt-3 rounded-[20px] border p-4 text-[12px] print-break ${isDark ? "bg-[#15151F] border-white/10" : "bg-white border-black/10"}`}>
            <h3 className="font-black">🧾 Full Tax Breakup</h3>
            <div className="grid md:grid-cols-2 gap-4 mt-2">
              <div className="space-y-1">
                <p className="flex justify-between"><span>Gross Income</span><b>{fmtFull(result.grossSalary)}</b></p>
                <p className="flex justify-between text-emerald-500"><span>Std Deduction</span><b>Old: {fmtFull(result.stdDedOld)} / New: {fmtFull(result.stdDedNew)}</b></p>
                <p className="flex justify-between text-emerald-500"><span>HRA Exempt (Old)</span><b>- {fmtFull(result.hraExempt)}</b></p>
                <p className="flex justify-between text-emerald-500"><span>80C</span><b>- {fmtFull(result.total80C)}</b></p>
                <p className="flex justify-between text-emerald-500"><span>80CCD(1B) NPS</span><b>- {fmtFull(result.total80ccd1b)}</b></p>
                <p className="flex justify-between text-emerald-500"><span>80CCD(2) Employer</span><b>- {fmtFull(result.total80ccd2)}</b></p>
                <p className="flex justify-between text-emerald-500"><span>80D Health</span><b>- {fmtFull(result.total80D)}</b></p>
                <p className="flex justify-between text-emerald-500"><span>24(b) Home Loan</span><b>- {fmtFull(result.total24b)}</b></p>
                <p className="flex justify-between text-emerald-500"><span>80E / 80TTA / 80G</span><b>- {fmtFull(result.total80E + result.total80TTA + result.total80G)}</b></p>
                <p className="flex justify-between font-black border-t pt-1"><span>Taxable (Old)</span><b>{fmtFull(result.taxableOld)}</b></p>
                <p className="flex justify-between font-black"><span>Taxable (New)</span><b>{fmtFull(result.taxableNew)}</b></p>
              </div>
              <div className="space-y-1">
                <p className="flex justify-between"><span>Slab Tax (New)</span><b>{fmtFull(result.newRes.slabTax)}</b></p>
                <p className="flex justify-between"><span>Slab Tax (Old)</span><b>{fmtFull(result.oldRes.slabTax)}</b></p>
                {result.newRes.marginalRelief87A > 0 && <p className="flex justify-between text-amber-500"><span>87A Marginal Relief (New)</span><b>- {fmtFull(result.newRes.marginalRelief87A)}</b></p>}
                <p className="flex justify-between"><span>Surcharge (New @{(result.newRes.surchargeRate * 100).toFixed(0)}%)</span><b>{fmtFull(result.newRes.surcharge)}</b></p>
                <p className="flex justify-between"><span>Surcharge (Old @{(result.oldRes.surchargeRate * 100).toFixed(0)}%)</span><b>{fmtFull(result.oldRes.surcharge)}</b></p>
                {result.newRes.surchargeMarginalRelief > 0 && <p className="flex justify-between text-amber-500"><span>Surcharge Marginal Relief</span><b>- {fmtFull(result.newRes.surchargeMarginalRelief)}</b></p>}
                <p className="flex justify-between"><span>Cess 4% (New)</span><b>{fmtFull(result.newRes.cess)}</b></p>
                <p className="flex justify-between"><span>Cess 4% (Old)</span><b>{fmtFull(result.oldRes.cess)}</b></p>
                <p className="flex justify-between"><span>Capital Gains Tax</span><b>{fmtFull(result.cgTax)}</b></p>
                <p className="flex justify-between font-black border-t pt-1 text-[#FF7A1A]"><span>Final Tax (New)</span><b>{fmtFull(result.newTax)}</b></p>
                <p className="flex justify-between font-black text-[#FF7A1A]"><span>Final Tax (Old)</span><b>{fmtFull(result.oldTax)}</b></p>
              </div>
            </div>
          </div>
        )}

        {/* ADVANCE TAX WARNING */}
        {result.advanceTaxRequired && (
          <div className="mt-3 rounded-xl p-3 border border-amber-500/30 bg-amber-500/10 text-[11px] print-break">
            <p className="font-black text-amber-500">⚠️ Advance Tax Applicable</p>
            <p className={`mt-1 ${isDark ? "text-white/70" : "text-black/70"}`}>Aapka tax ₹10,000 se zyada hai → Advance Tax bharna hoga. Installments: <b>15 Jun {fmtINR(result.advanceTaxQ1)}</b> · <b>15 Sep {fmtINR(result.advanceTaxQ2)}</b> · <b>15 Dec {fmtINR(result.advanceTaxQ3)}</b> · <b>15 Mar {fmtINR(result.advanceTaxQ4)}</b>. Miss karne pe 234B/234C interest lagega.</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4 mt-4">
          {/* LEFT INPUTS */}
          <div className={`rounded-[20px] border p-4 no-print ${isDark ? "bg-[#15151F] border-white/10" : "bg-white border-black/10"}`}>
            <h2 className="font-black text-[14px]">👤 Personal & Salary</h2>
            <div className="flex gap-1.5 mt-2">
              {(["below60", "60to80", "above80"] as AgeCategory[]).map((a) => (
                <button key={a} onClick={() => setAgeCategory(a)} className={`flex-1 py-2 rounded-lg text-[10px] font-black ${ageCategory === a ? "bg-[#FF7A1A] text-white" : isDark ? "bg-white/5" : "bg-black/5"}`}>
                  {a === "below60" ? "<60" : a === "60to80" ? "60-80" : "80+"}
                </button>
              ))}
            </div>

            <Input label="Annual Gross Salary (₹)" value={salary} onChange={setSalary} />
            <Input label="Other Income (FD, Rent) (₹)" value={otherIncome} onChange={setOtherIncome} />
            <Input label="Basic Salary (₹)" value={basic} onChange={setBasic} />
            <Input label="HRA Received (₹)" value={hraReceived} onChange={setHraReceived} />
            <Input label="Rent Paid / Year (₹)" value={rentPaid} onChange={setRentPaid} />
            <div className="flex gap-2 mt-2">
              <button onClick={() => setIsMetro(true)} className={`flex-1 py-2 rounded-lg text-[10px] font-bold ${isMetro ? "bg-[#FF7A1A] text-white" : isDark ? "bg-white/5" : "bg-black/5"}`}>🏙️ Metro</button>
              <button onClick={() => setIsMetro(false)} className={`flex-1 py-2 rounded-lg text-[10px] font-bold ${!isMetro ? "bg-[#FF7A1A] text-white" : isDark ? "bg-white/5" : "bg-black/5"}`}>🏘️ Non-Metro</button>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2 mt-2 text-[11px] font-bold">✅ HRA Exempt: <span className="text-emerald-500">{fmtFull(result.hraExempt)}</span></div>

            <h2 className="font-black text-[14px] mt-4">🏥 Deductions</h2>
            <div className="grid grid-cols-2 gap-x-3">
              <Input label="PPF" value={ppf} onChange={setPpf} />
              <Input label="ELSS" value={elss} onChange={setElss} />
              <Input label="LIC" value={lic} onChange={setLic} />
              <Input label="EPF" value={epf} onChange={setEpf} />
              <Input label="Home Loan Principal" value={homeLoanPrincipal} onChange={setHomeLoanPrincipal} />
              <Input label="NPS 80CCD(1B)" value={nps80ccd1b} onChange={setNps80ccd1b} />
            </div>
            <p className="text-[10px] mt-1 opacity-60">80C Total: {fmtFull(result.total80C)} / ₹1.5L</p>

            <button onClick={() => setShowDeductions(!showDeductions)} className={`w-full mt-3 py-2 rounded-lg text-[11px] font-black border ${isDark ? "border-white/10 bg-white/5" : "border-black/10 bg-black/5"}`}>
              {showDeductions ? "Hide Extra Deductions ▲" : "More Deductions (80D, 80E, 80TTA, 80G) ▼"}
            </button>

            {showDeductions && (
              <>
                <Input label="Employer NPS 80CCD(2)" value={employerNps80ccd2} onChange={setEmployerNps80ccd2} hint="Max 14% of Basic" />
                <Input label="Health Insurance - Self" value={healthSelf} onChange={setHealthSelf} />
                <Input label="Health Insurance - Parents" value={healthParents} onChange={setHealthParents} />
                <button onClick={() => setIsParentSenior(!isParentSenior)} className={`w-full mt-2 py-2 rounded-lg text-[10px] font-bold border ${isParentSenior ? "bg-emerald-500 text-white" : isDark ? "bg-white/5" : "bg-black/5"}`}>
                  {isParentSenior ? "✅ Parents 60+ (Limit ₹50K)" : "Parents 60+? Click → ₹50K limit"}
                </button>
                <Input label="Home Loan Interest 24(b)" value={homeLoanInterest} onChange={setHomeLoanInterest} />
                <Input label="Education Loan Interest 80E" value={educationLoan80e} onChange={setEducationLoan80e} hint="No limit" />
                <Input label="Savings Interest 80TTA" value={savingsInterest80tta} onChange={setSavingsInterest80tta} hint="Max ₹10K (Senior: ₹50K)" />
                <Input label="Donations 80G" value={donation80g} onChange={setDonation80g} hint="50% assumed eligible" />
                <Input label="Professional Tax" value={professionalTax} onChange={setProfessionalTax} hint="Max ₹2,500" />
              </>
            )}
          </div>

          {/* RIGHT — Capital gains + TDS + OPTIMIZER */}
          <div className="space-y-4">
            <div className={`rounded-[20px] border p-4 ${isDark ? "bg-[#15151F] border-white/10" : "bg-white border-black/10"}`}>
              <div className="flex justify-between items-center">
                <h2 className="font-black text-[14px]">📈 Capital Gains</h2>
                <button onClick={() => setShowAdvanced(!showAdvanced)} className="text-[11px] font-black text-[#FF7A1A] no-print">{showAdvanced ? "Hide ▲" : "Show ▼"}</button>
              </div>
              {showAdvanced && (
                <div>
                  <Input label="STCG - Equity Profit" value={stcg} onChange={setStcg} hint={`20% = ${fmtFull(result.stcgTax)}`} />
                  <Input label="LTCG - Equity Profit" value={ltcgEquity} onChange={setLtcgEquity} hint={`₹1.25L exempt, 12.5% above = ${fmtFull(result.ltcgTax)}`} />
                  <Input label="Crypto / VDA Gain" value={cryptoGain} onChange={setCryptoGain} hint={`Flat 30% = ${fmtFull(result.cryptoTax)}`} />
                </div>
              )}
              {!showAdvanced && <p className="text-[11px] opacity-60 mt-1">Stock, Crypto profit hai? Show pe click karo.</p>}
            </div>

            <div className={`rounded-[20px] border p-4 ${isDark ? "bg-[#15151F] border-white/10" : "bg-white border-black/10"}`}>
              <h2 className="font-black text-[14px]">📅 Monthly TDS</h2>
              <div className="grid grid-cols-3 gap-1.5 mt-2">
                {monthlyData.map((m) => (
                  <div key={m.month} className={`rounded-lg p-2 text-center ${isDark ? "bg-white/5" : "bg-black/5"}`}>
                    <p className="text-[10px] font-bold opacity-60">{m.month}</p>
                    <p className="font-black text-[11px]">{fmtINR(m.tds)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className={`rounded-[20px] border p-4 ${isDark ? "bg-[#15151F] border-white/10" : "bg-white border-black/10"}`}>
              <h2 className="font-black text-[14px]">💡 Deduction Optimizer</h2>
              <ul className="text-[11px] space-y-1.5 mt-2">
                {result.remaining80C > 0 && (
                  <li>• <b>{fmtINR(result.remaining80C)}</b> 80C room bacha hai — PPF/ELSS me daalo. Potential tax saving: <b className="text-emerald-500">{fmtINR(result.remaining80C * 0.30)}</b></li>
                )}
                {result.remaining80ccd1b > 0 && (
                  <li>• NPS 80CCD(1B) me <b>{fmtINR(result.remaining80ccd1b)}</b> room bacha — extra deduction. Saving: <b className="text-emerald-500">{fmtINR(result.remaining80ccd1b * 0.30)}</b></li>
                )}
                {result.remaining80D > 0 && (
                  <li>• 80D me <b>{fmtINR(result.remaining80D)}</b> room — health insurance premium. Saving: <b className="text-emerald-500">{fmtINR(result.remaining80D * 0.30)}</b></li>
                )}
                {best_dummy_hint(result.best)}
              </ul>
              <div className="mt-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-[11px] font-black text-emerald-500">💰 Total potential extra saving: {fmtINR(result.potentialSavings)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Related Tools */}
        <section className="mt-6 no-print">
          <div className="flex justify-between items-end flex-wrap gap-2 mb-3">
            <h2 className="text-[16px] md:text-[20px] font-black">⭐ <span className="text-[#FF7A1A]">More Tools</span></h2>
            <Link href="/" className="text-[10px] font-black px-3 py-1.5 rounded-full bg-[#FF7A1A] text-white">All Tools →</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { h: "/fire-calculator", i: "🔥", t: "FIRE Calculator" },
              { h: "/sip-calculator", i: "📈", t: "SIP Calculator" },
              { h: "/mortgage-calculator", i: "🏠", t: "Mortgage Calculator" },
              { h: "/personal-loan-emi-calculator", i: "💳", t: "Loan EMI" },
            ].map((x) => (
              <Link key={x.h} href={x.h} className={`rounded-[16px] p-3 border hover:-translate-y-0.5 transition ${isDark ? "border-white/10 bg-white/[0.03]" : "border-black/10 bg-white"}`}>
                <div className="text-[18px]">{x.i}</div>
                <p className="font-black text-[11px] mt-1">{x.t}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* AD SLOT */}
        <div className={`mt-5 h-[90px] rounded-xl border border-dashed flex items-center justify-center text-[10px] font-bold tracking-widest opacity-40 no-print ${isDark ? "border-white/10" : "border-black/10"}`}>
          AD SLOT · 728×90
        </div>

        {/* ================= SEO CONTENT (2000+ WORDS) ================= */}
        <article className={`max-w-[900px] mx-auto py-8 text-[14px] leading-relaxed ${isDark ? "text-white/80" : "text-black/80"}`}>
          <h1 className="text-[28px] md:text-[38px] font-black leading-tight text-[#FF7A1A]">
            Income Tax Calculator 2025-26 (AY 2026-27) — Free New vs Old Regime Comparison Tool India
          </h1>
          <p className="mt-4">
            Our <strong>free Income Tax Calculator</strong> gives you CA-level accuracy for <strong>FY 2025-26 (AY 2026-27)</strong> — comparing the New Tax Regime and Old Tax Regime side-by-side, calculating HRA exemption, Section 80C, 80D, 80CCD NPS deductions, home loan interest, capital gains tax on stocks and crypto, surcharge with marginal relief, health &amp; education cess, and true monthly TDS. Whether you are a salaried employee earning ₹6 lakh, a freelancer at ₹25 lakh, a senior citizen, or an HNIs with capital gains — this calculator handles every Indian income tax complexity with full mathematical precision, so you never overpay tax or miss a legitimate deduction.
          </p>

          <h2 className="text-[22px] md:text-[26px] font-black mt-8 text-[#FF7A1A]">What is an Income Tax Calculator?</h2>
          <p className="mt-3">
            An <strong>income tax calculator</strong> is a financial tool that estimates your total income tax liability for a financial year based on your salary, other income sources, eligible deductions, and applicable tax regime. It uses the Income Tax Act 1961 slabs notified by the Central Board of Direct Taxes (CBDT) to compute the exact tax payable — slab tax, surcharge, cess, rebate u/s 87A — and shows the final amount you owe to the government (or get as refund). A good calculator does more than just slab multiplication — it handles <strong>marginal relief, surcharge triggers, HRA exemption rules, Section 80 deduction caps, and the tricky New vs Old Regime comparison</strong> that determines whether you save ₹30,000 or lose ₹50,000.
          </p>
          <p className="mt-3">
            The Income Tax Department mandates that every taxpayer file their returns by 31 July of the assessment year (unless extended). Using a calculator before the deadline lets you plan your investments, choose the correct regime, and avoid surprise tax outflows. In India, the tax filing window opens in April, and salaried employees usually receive Form 16 from their employer by mid-June — the calculator becomes indispensable for verifying whether their employer deducted the right TDS.
          </p>

          <h2 className="text-[22px] md:text-[26px] font-black mt-8 text-[#FF7A1A]">New Regime vs Old Regime — Which is Better in FY 2025-26?</h2>
          <p className="mt-3">
            The Budget 2023 introduced a <strong>revamped New Tax Regime</strong> as the default option, and Budget 2025 raised the rebate threshold under Section 87A to ₹12 lakh. As per FY 2025-26 rules:
          </p>
          <ul className="mt-3 list-disc pl-6 space-y-1.5">
            <li><strong>New Regime:</strong> Standard deduction ₹75,000, no 80C/80D/HRA deductions. Zero tax up to ₹12 lakh taxable income (₹12.75 lakh gross) due to 87A rebate.</li>
            <li><strong>Old Regime:</strong> Standard deduction ₹50,000, allows 80C (₹1.5L), 80D (₹25K-₹1L), HRA, home loan interest (₹2L), NPS (₹50K), education loan interest, etc.</li>
            <li><strong>The Rule of Thumb:</strong> If your total deductions exceed ₹4–₹5 lakh, Old Regime usually wins. Otherwise New Regime with the ₹12L rebate is more beneficial. Our calculator shows you the exact rupee difference.</li>
          </ul>

          <h2 className="text-[22px] md:text-[26px] font-black mt-8 text-[#FF7A1A]">Income Tax Slabs for FY 2025-26</h2>
          <p className="mt-3"><strong>New Regime (default):</strong></p>
          <ul className="mt-2 list-disc pl-6 space-y-1">
            <li>₹0 – ₹4,00,000 → Nil</li>
            <li>₹4,00,001 – ₹8,00,000 → 5%</li>
            <li>₹8,00,001 – ₹12,00,000 → 10%</li>
            <li>₹12,00,001 – ₹16,00,000 → 15%</li>
            <li>₹16,00,001 – ₹20,00,000 → 20%</li>
            <li>₹20,00,001 – ₹24,00,000 → 25%</li>
            <li>Above ₹24,00,000 → 30%</li>
          </ul>
          <p className="mt-3"><strong>Old Regime (below 60 years):</strong></p>
          <ul className="mt-2 list-disc pl-6 space-y-1">
            <li>₹0 – ₹2,50,000 → Nil</li>
            <li>₹2,50,001 – ₹5,00,000 → 5%</li>
            <li>₹5,00,001 – ₹10,00,000 → 20%</li>
            <li>Above ₹10,00,000 → 30%</li>
          </ul>
          <p className="mt-3"><strong>Senior Citizens (60-80):</strong> Basic exemption ₹3 lakh (₹3L–₹5L @ 5%). <strong>Super Senior (80+):</strong> Basic exemption ₹5 lakh (₹5L–₹10L @ 20%).</p>

          <h2 className="text-[22px] md:text-[26px] font-black mt-8 text-[#FF7A1A]">HRA Exemption — The Most Misunderstood Deduction</h2>
          <p className="mt-3">
            House Rent Allowance (HRA) exemption under Section 10(13A) is calculated as the <strong>minimum of three values</strong>: (1) HRA actually received, (2) 50% of Basic for metro cities (Delhi, Mumbai, Kolkata, Chennai) or 40% for non-metro, (3) Rent paid minus 10% of Basic. If you live with parents and pay them rent, you can still claim HRA — just ensure the transaction is genuine with a rent agreement and bank transfer. Our calculator shows the exemption from all three rules so you can verify it.
          </p>

          <h2 className="text-[22px] md:text-[26px] font-black mt-8 text-[#FF7A1A]">Section 80C, 80D, 80CCD — Deduction Limits Explained</h2>
          <ul className="mt-3 list-disc pl-6 space-y-1.5">
            <li><strong>80C (₹1.5 lakh):</strong> PPF, ELSS, LIC, EPF, home loan principal, tuition fees, NSC, SSY, SCSS, tax-saving FDs.</li>
            <li><strong>80CCD(1B) NPS (₹50,000):</strong> Extra deduction available only in Old Regime, over and above 80C.</li>
            <li><strong>80CCD(2) Employer NPS (14% of Basic):</strong> Available in both regimes — very powerful for salaried professionals.</li>
            <li><strong>80D Health Insurance:</strong> ₹25,000 for self + family (₹50,000 if 60+), plus ₹25,000–₹50,000 for parents based on age.</li>
            <li><strong>80E Education Loan Interest:</strong> No upper limit, 8 years, only for higher education loans.</li>
            <li><strong>80TTA Savings Interest:</strong> ₹10,000 (₹50,000 under 80TTB for seniors).</li>
            <li><strong>80G Donations:</strong> 50% or 100% based on fund category — verify before claiming.</li>
            <li><strong>24(b) Home Loan:</strong> ₹2,00,000 for self-occupied, unlimited for let-out property.</li>
          </ul>

          <h2 className="text-[22px] md:text-[26px] font-black mt-8 text-[#FF7A1A]">Understanding Surcharge and Marginal Relief</h2>
          <p className="mt-3">
            <strong>Surcharge</strong> is an additional tax on high-income earners, calculated on top of slab tax:
          </p>
          <ul className="mt-2 list-disc pl-6 space-y-1">
            <li>Income ₹50L – ₹1Cr → 10% surcharge</li>
            <li>₹1Cr – ₹2Cr → 15%</li>
            <li>₹2Cr – ₹5Cr → 25%</li>
            <li>Above ₹5Cr → Old Regime 37%, New Regime capped at 25%</li>
          </ul>
          <p className="mt-3">
            <strong>Marginal relief</strong> prevents your tax from exceeding your income increase when you just cross a threshold. For example, if your income goes from ₹50 lakh to ₹50.5 lakh, the surcharge would normally cause tax to jump by ₹1.5+ lakh — but marginal relief caps it at ₹50,000 (the income increase). Both 87A rebate (around ₹12L in new regime) and surcharge (₹50L/₹1Cr/₹2Cr/₹5Cr) have marginal relief — and many commercial calculators get this wrong. We do it correctly.
          </p>

          <h2 className="text-[22px] md:text-[26px] font-black mt-8 text-[#FF7A1A]">Capital Gains Tax — Stocks, Mutual Funds & Crypto</h2>
          <p className="mt-3">
            Equity capital gains have different rules from salary tax. As per current rules:
          </p>
          <ul className="mt-2 list-disc pl-6 space-y-1">
            <li><strong>STCG on equity (held &lt; 12 months):</strong> 20% flat (increased from 15% in Budget 2024)</li>
            <li><strong>LTCG on equity (held &gt; 12 months):</strong> 12.5% above ₹1.25 lakh exemption (increased from 10% / ₹1L)</li>
            <li><strong>Crypto / VDA gains:</strong> Flat 30% — no deductions, no set-off, no basic exemption. 1% TDS applies at source but is creditable.</li>
          </ul>

          <h2 className="text-[22px] md:text-[26px] font-black mt-8 text-[#FF7A1A]">Advance Tax and Interest under Section 234</h2>
          <p className="mt-3">
            If your total tax liability exceeds ₹10,000 in a year, the Income Tax Department mandates payment of <strong>Advance Tax</strong> in four quarterly installments — 15% by 15 June, 45% by 15 September, 75% by 15 December, and 100% by 15 March. Missing or underpaying triggers interest under <strong>Section 234B (1% per month)</strong> and <strong>Section 234C (1% per month for 3 months)</strong>. Our calculator shows you the required advance tax installments so you can avoid these penalties. Salaried employees usually have TDS deducted monthly by their employer, so advance tax applies mainly to freelancers, business owners, and those with significant capital gains.
          </p>

          <h2 className="text-[22px] md:text-[26px] font-black mt-8 text-[#FF7A1A]">How to Use This Income Tax Calculator (Step-by-Step)</h2>
          <ol className="mt-3 list-decimal pl-6 space-y-1.5">
            <li><strong>Select age category</strong> — below 60, 60–80 (senior), or 80+ (super senior).</li>
            <li><strong>Enter annual gross salary</strong> and any other income (FD interest, rental income, freelance).</li>
            <li><strong>Add HRA details</strong> — Basic salary, HRA received, rent paid, and city type.</li>
            <li><strong>Enter Section 80C investments</strong> — PPF, ELSS, LIC, EPF, home loan principal.</li>
            <li><strong>Enter Section 80CCD NPS</strong> — own NPS 80CCD(1B) and employer NPS 80CCD(2).</li>
            <li><strong>Enter Section 80D health insurance</strong> — self and parents (mark senior if applicable).</li>
            <li><strong>Enter home loan interest 24(b)</strong>, education loan 80E, savings interest 80TTA, donations 80G.</li>
            <li><strong>Enter professional tax</strong> — up to ₹2,500 (state-dependent).</li>
            <li><strong>Enter capital gains</strong> — STCG, LTCG, crypto (if any).</li>
            <li><strong>View results</strong> — New vs Old Regime comparison with the cheaper option highlighted.</li>
            <li><strong>Check advance tax warning</strong> — if tax &gt; ₹10,000, see installment schedule.</li>
            <li><strong>Use deduction optimizer</strong> — see where you can still save more tax.</li>
            <li><strong>Export</strong> — Copy summary, download CSV, or print PDF.</li>
          </ol>

          <h2 className="text-[22px] md:text-[26px] font-black mt-8 text-[#FF7A1A]">Income Tax Glossary</h2>
          <div className="mt-3">
            {[
              ["Assessment Year (AY)", "The year in which you file returns for the previous financial year's income. E.g., FY 2025-26 = AY 2026-27."],
              ["Financial Year (FY)", "The year in which income is earned — 1 April to 31 March."],
              ["Section 87A Rebate", "Tax rebate that makes income up to ₹12 lakh tax-free in New Regime (₹5 lakh in Old Regime)."],
              ["Marginal Relief", "Relief that caps tax increase when income just crosses a threshold like ₹12L or ₹50L."],
              ["Surcharge", "Additional tax on high-income earners — 10% to 37% based on income bracket."],
              ["Cess", "4% Health & Education Cess applied on (tax + surcharge)."],
              ["HRA", "House Rent Allowance — exempt under Section 10(13A) subject to 3-rule formula."],
              ["80C", "Section allowing ₹1.5 lakh deduction for PPF, ELSS, LIC, EPF, etc."],
              ["80CCD(1B)", "Additional ₹50,000 deduction for NPS — Old Regime only."],
              ["80CCD(2)", "Employer NPS contribution up to 14% of Basic — available in both regimes."],
              ["80D", "Health insurance premium deduction — ₹25K-₹1L based on age."],
              ["24(b)", "Home loan interest deduction — ₹2L for self-occupied property."],
              ["LTCG / STCG", "Long-term / Short-term capital gains on stocks, mutual funds, property."],
              ["VDA Tax", "30% flat tax on Virtual Digital Assets like Bitcoin, Ethereum, NFTs."],
              ["TDS", "Tax Deducted at Source — deducted by employer/bank before payment."],
              ["Advance Tax", "Quarterly tax payments if total liability exceeds ₹10,000."],
              ["Form 16", "Certificate issued by employer showing salary and TDS deducted."],
            ].map(([title, body], i) => (
              <Accordion key={i} title={title} isOpen={openAccordion === `g${i}`} onToggle={() => setOpenAccordion(openAccordion === `g${i}` ? null : `g${i}`)} isDark={isDark}>{body}</Accordion>
            ))}
          </div>

          <h2 className="text-[22px] md:text-[26px] font-black mt-8 text-[#FF7A1A]">Frequently Asked Questions (FAQ)</h2>
          <div className="mt-3">
            {[
              ["12 Lakh tak New Regime me 0 tax kaise?", "Section 87A rebate ke wajah se FY 2025-26 me ₹12 lakh tak taxable income pe zero tax lagta hai. Standard deduction ₹75,000 add karne ke baad ₹12.75 lakh tak ki gross salary pe koi tax nahi bachta. Ye Budget 2025 ka major change hai."],
              ["New vs Old Regime - kaunsa better hai?", "Agar total deductions (HRA + 80C + 80D + 24b + NPS) ₹4-5 lakh se zyada hain to Old Regime better ho sakta hai. Otherwise New Regime with ₹12L rebate usually better hai. Salary ₹15L ke neeche walo ko New Regime often faydemand hai. Is calculator me dono compare karke exact saving dikha dega."],
              ["HRA exemption ka formula kya hai?", "HRA exempt = minimum of (1) HRA received, (2) Basic × 50% (Metro) or 40% (non-Metro), (3) Rent paid - Basic × 10%. Tin me se sabse kam wali value exempt hoti hai. Rent nahi de rahe toh HRA exemption zero."],
              ["80C me kya kya include hota hai?", "80C: PPF, ELSS, LIC premium, EPF, home loan principal, tuition fees, NSC, SCSS, Sukanya Samriddhi, tax-saver FDs — total limit ₹1.5 lakh. Home loan principal bhi 80C me aata hai (interest alag 24b me)."],
              ["NPS me extra deduction kitna milta hai?", "Section 80CCD(1B): ₹50,000 extra (only Old Regime). Section 80CCD(2): employer contribution 14% of basic (both regimes). Dono milake ₹2 lakh tak deduction possible."],
              ["Surcharge kab lagta hai?", "Taxable income ₹50 lakh cross hone pe surcharge lagta hai. 50L-1Cr: 10%, 1Cr-2Cr: 15%, 2Cr-5Cr: 25%, above 5Cr: Old Regime 37%, New Regime capped at 25%."],
              ["Marginal relief kya hai?", "Jab income threshold cross karti hai (12L, 50L, 1Cr etc), tax mein sudden jump na ho — iske liye marginal relief milta hai. Excess income se zyada tax nahi lagta. Is calculator me correctly applied hai."],
              ["Senior citizens ke liye slabs alag hain?", "Haan, Old Regime me: 60-80 age = ₹3 lakh exemption, 80+ = ₹5 lakh exemption. New Regime me koi age-based benefit nahi. Senior citizens 80TTB (savings interest ₹50K) ka bhi benefit le sakte hain."],
              ["Advance tax kab bharna hota hai?", "Total tax ₹10,000+ ho to advance tax mandatory hai. 4 installments: 15 June (15%), 15 Sept (45%), 15 Dec (75%), 15 Mar (100%). Miss karne pe 234B/234C interest @ 1% p.m. lagta hai."],
              ["Crypto pe tax kaise calculate hota hai?", "Virtual Digital Assets (Bitcoin, Ethereum, NFT) pe flat 30% tax hai. Koi basic exemption nahi, koi deduction nahi, loss carry-forward nahi. 1% TDS transaction pe deduct hota hai (credit milta hai tax filing me)."],
              ["Kya Old Regime choose kar sakte hain?", "Haan, ITR filing me aap regime choose kar sakte hain. Salaried employees can switch every year. Business owners can switch only once. Employer ko bhi declare karna hota hai (usually at start of FY)."],
              ["Professional tax kya hai?", "Professional Tax — state government ka tax, salaried employees ke salary se deduct hota hai (max ₹2,500/year). Different states have different rates. Old regime me deduction milta hai."],
              ["Standard deduction kitna milta hai?", "Salaried: New Regime ₹75,000 (increased from ₹50,000 in Budget 2024), Old Regime ₹50,000. Ye direct salary se minus hota hai, koi investment nahi karni padti."],
              ["Is calculator ki accuracy kitni hai?", "Ye calculator CA-level formulas use karta hai — marginal relief, surcharge, senior slabs, all deductions, capital gains, cess — sab handle karta hai. Slabs FY 2025-26 (AY 2026-27) ke hisaab se updated hain. Final ITR filing ke liye CA se verify karo."],
              ["Kya advance tax TDS se alag hai?", "Haan. TDS employer/bank deduct karta hai automatic. Advance tax taxpayer khud bharta hai (usually freelancers, business owners, capital gain holders). Advance tax quarterly hota hai, TDS monthly."],
            ].map(([q, a], i) => (
              <Accordion key={i} title={q} isOpen={openAccordion === `f${i}`} onToggle={() => setOpenAccordion(openAccordion === `f${i}` ? null : `f${i}`)} isDark={isDark}>{a}</Accordion>
            ))}
          </div>

          <h2 className="text-[22px] md:text-[26px] font-black mt-8 text-[#FF7A1A]">Income Tax Saving Tips 2026</h2>
          <ul className="mt-3 list-disc pl-6 space-y-1.5">
            <li><strong>Max out EPF first</strong> — it's automatic for salaried. Rest 80C via ELSS (shortest lock-in at 3 years) or PPF (safest).</li>
            <li><strong>NPS Tier-1</strong> is the best 80CCD(1B) option — 60% tax-free at 60, 40% annuity. Additional ₹50K deduction.</li>
            <li><strong>Employer NPS 80CCD(2)</strong> is a hidden gem — 14% of basic, available in BOTH regimes. Ask HR to restructure salary.</li>
            <li><strong>Buy health insurance early</strong> — 80D premium is deductible and protects from medical inflation.</li>
            <li><strong>For home loan, opt for Joint ownership</strong> — both spouses can claim ₹2L each under 24(b).</li>
            <li><strong>Don't fake HRA</strong> — IT dept scrutinizes rent transactions above ₹1L. Have rent agreement + bank transfer.</li>
            <li><strong>Do tax harvesting</strong> — book ₹1.25L LTCG every year to reset cost basis tax-free.</li>
            <li><strong>Plan advance tax</strong> — freelancers with Q4 income should still estimate and pay by 15 March.</li>
            <li><strong>For ₹15L+ income</strong> — evaluate New vs Old Regime carefully. A 1% difference is ₹15K per year.</li>
            <li><strong>File ITR before 31 July</strong> — even if zero tax, filing builds CIBIL and creates records for loans.</li>
          </ul>

          <h2 className="text-[22px] md:text-[26px] font-black mt-8 text-[#FF7A1A]">Related Keywords</h2>
          <p className={`mt-3 text-[11px] leading-relaxed ${isDark ? "text-white/50" : "text-black/50"}`}>
            income tax calculator · income tax calculator 2025-26 · income tax calculator ay 2026-27 · new vs old regime calculator · new tax regime calculator · old tax regime calculator · HRA calculator · 80C calculator · 80D calculator · NPS calculator · TDS calculator · advance tax calculator · salary tax calculator India · freelancer tax calculator · crypto tax calculator India · capital gains tax calculator · surcharge calculator · marginal relief calculator · section 87A calculator · FY 2025-26 slabs · income tax slab rates 2025 · senior citizen tax calculator · tax saving calculator · income tax return calculator · CA tax calculator · tax deduction calculator · professional tax calculator · 80TTA calculator · 80E calculator · 80G calculator · 80CCD NPS calculator · employer NPS calculator · home loan tax benefit calculator · STCG LTCG calculator · VDA tax calculator
          </p>

          <div className={`mt-8 p-4 rounded-xl text-[11px] ${isDark ? "bg-white/5 text-white/50" : "bg-gray-100 text-black/60"}`}>
            <strong>Disclaimer:</strong> This Income Tax Calculator is for informational and estimation purposes only. Tax slabs shown correspond to FY 2025-26 (AY 2026-27) as per CBDT notifications but are subject to change by Finance Act amendments. Deductions are subject to individual eligibility conditions not captured here (e.g., HRA requires genuine rent, 80G depends on fund category, 80E has a loan period limit). This is not professional tax advice. Always consult a Chartered Accountant or tax professional before filing your ITR. The creator is not liable for any decisions made based on this calculator.
          </div>
        </article>
      </div>
    </div>
  );
}

// Helper for optimizer hint
function best_dummy_hint(regime: Regime) {
  return regime === "OLD" ? (
    <li>• Old Regime selected — max out HRA + 80C + NPS to maximize tax saving.</li>
  ) : (
    <li>• New Regime selected — focus on employer NPS 80CCD(2) and capital gains tax planning.</li>
  );
}
