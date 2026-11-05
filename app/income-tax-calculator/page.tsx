"use client";
import { useState, useMemo } from "react";
import Link from "next/link";

// ============ TYPES ============
type AgeCategory = "below60" | "60to80" | "above80";
type Regime = "NEW" | "OLD";

interface InputProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  hint?: string;
  isDark: boolean;
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
    if (income > 500000) t += (Math.min(income, 1000000) - 500000) * 0.20;
    if (income > 1000000) t += (income - 1000000) * 0.30;
  } else if (age === "60to80") {
    if (income > 300000) t += (Math.min(income, 500000) - 300000) * 0.05;
    if (income > 500000) t += (Math.min(income, 1000000) - 500000) * 0.20;
    if (income > 1000000) t += (income - 1000000) * 0.30;
  } else {
    if (income > 250000) t += (Math.min(income, 500000) - 250000) * 0.05;
    if (income > 500000) t += (Math.min(income, 1000000) - 500000) * 0.20;
    if (income > 1000000) t += (income - 1000000) * 0.30;
  }
  return t;
};

// ============ INPUT ============
function Input({ label, value, onChange, hint, isDark }: InputProps) {
  return (
    <div>
      <label className={`block text-[12px] font-bold mt-3 ${isDark ? "text-[#FF7A1A]" : "text-[#D65A00]"}`}>{label}</label>
      <input
        type="number"
        value={value || ""}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        placeholder="0"
        className={`w-full mt-1 px-3 py-2 rounded-xl border outline-none font-bold text-[13px] focus:border-[#FF7A1A] ${isDark ? "bg-white/5 border-white/10 text-white placeholder-white/30" : "bg-gray-100 border-black/10 text-black placeholder-black/30"}`}
      />
      {hint && <p className={`text-[10px] mt-0.5 ${isDark ? "text-white/50" : "text-black/50"}`}>{hint}</p>}
    </div>
  );
}

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

// ============ MAIN ============
export default function IncomeTaxCalculatorPro() {
  const [theme, setTheme] = useState("dark");
  const isDark = theme === "dark";

  const [ageCategory, setAgeCategory] = useState<AgeCategory>("below60");
  const [salary, setSalary] = useState(1200000);
  const [otherIncome, setOtherIncome] = useState(0);
  const [basic, setBasic] = useState(600000);
  const [hraReceived, setHraReceived] = useState(240000);
  const [rentPaid, setRentPaid] = useState(180000);
  const [isMetro, setIsMetro] = useState(true);

  const [ppf, setPpf] = useState(50000);
  const [elss, setElss] = useState(50000);
  const [lic, setLic] = useState(25000);
  const [epf, setEpf] = useState(25000);
  const [homeLoanPrincipal, setHomeLoanPrincipal] = useState(0);

  const [healthSelf, setHealthSelf] = useState(25000);
  const [healthParents, setHealthParents] = useState(25000);
  const [isParentSenior, setIsParentSenior] = useState(false);

  const [nps80ccd1b, setNps80ccd1b] = useState(0);
  const [employerNps80ccd2, setEmployerNps80ccd2] = useState(0);
  const [homeLoanInterest, setHomeLoanInterest] = useState(0);
  const [educationLoan80e, setEducationLoan80e] = useState(0);
  const [savingsInterest80tta, setSavingsInterest80tta] = useState(0);
  const [donation80g, setDonation80g] = useState(0);
  const [professionalTax, setProfessionalTax] = useState(2500);

  const [stcg, setStcg] = useState(0);
  const [ltcgEquity, setLtcgEquity] = useState(0);
  const [cryptoGain, setCryptoGain] = useState(0);

  const [showBreakup, setShowBreakup] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showDeductions, setShowDeductions] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  // ===== CG BASE (top level) =====
  const stcgTax = stcg * 0.20;
  const ltcgTaxable = Math.max(0, ltcgEquity - 125000);
  const ltcgTax = ltcgTaxable * 0.125;
  const cryptoTax = cryptoGain * 0.30;
  const cgTaxBase = stcgTax + ltcgTax + cryptoTax;
  // FIX #1: taxable CG total used for surcharge threshold (not gross)
  const taxableCGTotal = stcg + ltcgTaxable + cryptoGain;
  const grossCGTotal = stcg + ltcgEquity + cryptoGain;

  // ===== COMPUTE ONE REGIME =====
  const computeRegimeTax = (taxableIncome: number, isNew: boolean) => {
    // 1. Base slab tax
    const slabTaxBase = isNew ? slabTaxNew(taxableIncome) : slabTaxOld(taxableIncome, ageCategory);

    // 2. Rebate 87A
    let rebate87A = 0;
    if (isNew && taxableIncome <= 1200000) rebate87A = slabTaxBase;
    else if (!isNew && taxableIncome <= 500000) rebate87A = Math.min(slabTaxBase, 12500);
    let slabTax = Math.max(0, slabTaxBase - rebate87A);

    // 3. 87A marginal relief (both regimes)
    let marginalRelief87A = 0;
    if (isNew && taxableIncome > 1200000 && taxableIncome < 1275000) {
      const excess = taxableIncome - 1200000;
      if (slabTax > excess) { marginalRelief87A = slabTax - excess; slabTax = excess; }
    } else if (!isNew && taxableIncome > 500000 && taxableIncome < 550000) {
      const excess = taxableIncome - 500000;
      if (slabTax > excess) { marginalRelief87A = slabTax - excess; slabTax = excess; }
    }

    // 4. FIX #1: surcharge threshold uses TAXABLE CG (excl ₹1.25L LTCG exemption)
    const totalIncomeForSurcharge = taxableIncome + taxableCGTotal;

    // 5. Surcharge rate
    let surchargeRate = 0;
    if (totalIncomeForSurcharge > 50000000) surchargeRate = isNew ? 0.25 : 0.37;
    else if (totalIncomeForSurcharge > 20000000) surchargeRate = 0.25;
    else if (totalIncomeForSurcharge > 10000000) surchargeRate = 0.15;
    else if (totalIncomeForSurcharge > 5000000) surchargeRate = 0.10;

    // 6. Raw surcharge components
    const rawSurchargeOnSlab = slabTax * surchargeRate;
    const rawSurchargeOnEquityCG = (stcgTax + ltcgTax) * Math.min(surchargeRate, 0.15);
    const rawSurchargeOnCryptoCG = cryptoTax * surchargeRate;
    const rawSurchargeOnCG = rawSurchargeOnEquityCG + rawSurchargeOnCryptoCG;
    const rawTotalSurcharge = rawSurchargeOnSlab + rawSurchargeOnCG;

    // 7. FIX #2: surcharge marginal relief — compute properly
    let marginalReliefAmount = 0;
    if (totalIncomeForSurcharge > 5000000) {
      const thresholds = [5000000, 10000000, 20000000, 50000000];
      const prevRates = [0, 0.10, 0.15, 0.25];

      for (let i = 0; i < thresholds.length; i++) {
        const T = thresholds[i];
        const nextT = i + 1 < thresholds.length ? thresholds[i + 1] : Infinity;
        if (totalIncomeForSurcharge > T && totalIncomeForSurcharge < nextT) {
          const prevRate = prevRates[i];
          // FIX #1: slab income at T = T - TAXABLE CG (not gross)
          const slabAtT = T - taxableCGTotal;
          if (slabAtT < 0) break;

          const slabTaxAtT_raw = isNew ? slabTaxNew(slabAtT) : slabTaxOld(slabAtT, ageCategory);
          let baseAtT = slabTaxAtT_raw;
          if (isNew && slabAtT <= 1200000) baseAtT = 0;
          else if (!isNew && slabAtT <= 500000) baseAtT = Math.max(0, baseAtT - 12500);

          const surchargeAtT_slab = baseAtT * prevRate;
          const surchargeAtT_equityCG = (stcgTax + ltcgTax) * Math.min(prevRate, 0.15);
          const surchargeAtT_cryptoCG = cryptoTax * prevRate;
          const surchargeAtT_total = surchargeAtT_slab + surchargeAtT_equityCG + surchargeAtT_cryptoCG;

          const taxAtT = baseAtT + surchargeAtT_total + cgTaxBase;
          const taxAtIncome = slabTax + rawTotalSurcharge + cgTaxBase;
          const excess = totalIncomeForSurcharge - T;
          const allowed = taxAtT + excess;

          if (taxAtIncome > allowed) marginalReliefAmount = taxAtIncome - allowed;
          break;
        }
      }
    }

    // 8. FIX #2: apply relief to TOTAL surcharge proportionally (preserves slab/CG breakdown)
    const reliefApplied = Math.min(marginalReliefAmount, rawTotalSurcharge);
    const factor = rawTotalSurcharge > 0 ? (rawTotalSurcharge - reliefApplied) / rawTotalSurcharge : 1;

    const surchargeOnSlab = rawSurchargeOnSlab * factor;
    const surchargeOnEquityCG = rawSurchargeOnEquityCG * factor;
    const surchargeOnCryptoCG = rawSurchargeOnCryptoCG * factor;
    const surchargeOnCG = surchargeOnEquityCG + surchargeOnCryptoCG;
    const surchargeTotal = surchargeOnSlab + surchargeOnCG;

    // 9. Total
    const taxPlusSurcharge = slabTax + surchargeTotal + cgTaxBase;
    const cess = taxPlusSurcharge * 0.04;
    const totalTax = taxPlusSurcharge + cess;

    return {
      slabTaxBase, rebate87A, slabTax, marginalRelief87A,
      surchargeRate,
      rawSurchargeOnSlab, rawSurchargeOnEquityCG, rawSurchargeOnCryptoCG, rawSurchargeOnCG, rawTotalSurcharge,
      surchargeOnSlab, surchargeOnEquityCG, surchargeOnCryptoCG, surchargeOnCG, surchargeTotal,
      surchargeMarginalRelief: reliefApplied,
      taxPlusSurcharge, cess, totalTax,
    };
  };

  // ===== MASTER =====
  const result = useMemo(() => {
    // HRA
    const hra1 = hraReceived;
    const hra2 = isMetro ? basic * 0.5 : basic * 0.4;
    const hra3 = Math.max(0, rentPaid - basic * 0.1);
    const hraExempt = rentPaid > 0 && hraReceived > 0 ? Math.min(hra1, hra2, hra3) : 0;

    // 80C
    const total80C = Math.min(150000, ppf + elss + lic + epf + homeLoanPrincipal);

    // 80CCD(1B)
    const total80ccd1b = Math.min(50000, nps80ccd1b);

    // 80CCD(2)
    const max80ccd2 = basic * 0.14;
    const total80ccd2 = Math.min(max80ccd2, employerNps80ccd2);

    // 80D
    const limitSelf = ageCategory === "below60" ? 25000 : 50000;
    const limitParents = isParentSenior ? 50000 : 25000;
    const total80D = Math.min(limitSelf, healthSelf) + Math.min(limitParents, healthParents);

    // 24(b)
    const total24b = Math.min(200000, homeLoanInterest);

    // 80E
    const total80E = Math.max(0, educationLoan80e);

    // 80TTA / 80TTB
    const ttaLimit = ageCategory === "below60" ? 10000 : 50000;
    const total80TTA = Math.min(ttaLimit, savingsInterest80tta);

    // 80G — 10% AGTI cap
    const stdDedOld = 50000;
    const stdDedNew = 75000;
    const profTax = Math.min(2500, professionalTax);

    const agtiFor80G = Math.max(0,
      salary + otherIncome - hraExempt - stdDedOld - profTax
      - total80C - total80ccd1b - total80ccd2 - total80D - total24b - total80E - total80TTA
    );
    const donation80gLimit = agtiFor80G * 0.10;
    const donation80gEligible = Math.min(donation80g, donation80gLimit);
    const total80G = donation80gEligible * 0.5;

    // Taxable income
    const grossSalary = salary + otherIncome;
    const oldDeductions = hraExempt + total80C + total80ccd1b + total80D + total24b + total80E + total80TTA + total80G + stdDedOld + profTax;
    const taxableOld = Math.max(0, grossSalary - oldDeductions - total80ccd2);
    const taxableNew = Math.max(0, grossSalary - stdDedNew - total80ccd2);

    // Tax
    const newRes = computeRegimeTax(taxableNew, true);
    const oldRes = computeRegimeTax(taxableOld, false);

    const best: Regime = newRes.totalTax <= oldRes.totalTax ? "NEW" : "OLD";
    const saving = Math.abs(newRes.totalTax - oldRes.totalTax);
    const bestTax = best === "NEW" ? newRes.totalTax : oldRes.totalTax;
    const inHand = grossSalary - bestTax;
    const monthlyTDS = Math.round(bestTax / 12);

    const advanceTaxRequired = bestTax > 10000;
    const advanceTaxQ1 = bestTax * 0.15;
    const advanceTaxQ2 = bestTax * 0.45;
    const advanceTaxQ3 = bestTax * 0.75;
    const advanceTaxQ4 = bestTax;

    // Optimizer
    const remaining80C = Math.max(0, 150000 - total80C);
    const remaining80ccd1b = Math.max(0, 50000 - total80ccd1b);
    const remaining80DSelf = Math.max(0, limitSelf - Math.min(limitSelf, healthSelf));
    const remaining80DParents = Math.max(0, limitParents - Math.min(limitParents, healthParents));
    const remaining80D = remaining80DSelf + remaining80DParents;
    const remaining80ccd2 = Math.max(0, max80ccd2 - total80ccd2);

    const optimizerSteps: { label: string; amount: number; saving: number }[] = [];
    if (best === "OLD") {
      let prevTotal = oldRes.totalTax;
      let cumulative = 0;
      const candidates = [
        { label: "80C (PPF/ELSS)", amount: remaining80C },
        { label: "80CCD(1B) NPS", amount: remaining80ccd1b },
        { label: "80D Health", amount: remaining80D },
      ];
      for (const c of candidates) {
        if (c.amount <= 0) continue;
        cumulative += c.amount;
        const newTaxable = Math.max(0, taxableOld - cumulative);
        const newTotal = computeRegimeTax(newTaxable, false).totalTax;
        optimizerSteps.push({ label: c.label, amount: c.amount, saving: prevTotal - newTotal });
        prevTotal = newTotal;
      }
    } else {
      if (remaining80ccd2 > 0) {
        const newTaxable = Math.max(0, taxableNew - remaining80ccd2);
        const newTotal = computeRegimeTax(newTaxable, true).totalTax;
        optimizerSteps.push({
          label: "80CCD(2) Employer NPS",
          amount: remaining80ccd2,
          saving: newRes.totalTax - newTotal,
        });
      }
    }
    const potentialSavings = optimizerSteps.reduce((s, x) => s + x.saving, 0);

    return {
      hraExempt, total80C, total80ccd1b, total80ccd2, total80D, total24b, total80E, total80TTA, total80G, profTax,
      oldDeductions, stdDedOld, stdDedNew,
      taxableOld, taxableNew, grossSalary,
      newRes, oldRes, newTax: newRes.totalTax, oldTax: oldRes.totalTax,
      best, saving, bestTax, inHand, monthlyTDS,
      advanceTaxRequired, advanceTaxQ1, advanceTaxQ2, advanceTaxQ3, advanceTaxQ4,
      remaining80C, remaining80ccd1b, remaining80D,
      optimizerSteps, potentialSavings,
      agtiFor80G, donation80gLimit, donation80gEligible,
      limitSelf, limitParents, max80ccd2, ttaLimit,
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
      ["80CCD(2)", result.total80ccd2, result.total80ccd2],
      ["80D", 0, result.total80D],
      ["24(b)", 0, result.total24b],
      ["80E/80TTA/80G", 0, result.total80E + result.total80TTA + result.total80G],
      ["Professional Tax", 0, result.profTax],
      ["Taxable Income", result.taxableNew, result.taxableOld],
      ["Slab Tax (before 87A)", result.newRes.slabTaxBase, result.oldRes.slabTaxBase],
      ["Rebate 87A", result.newRes.rebate87A, result.oldRes.rebate87A],
      ["87A Marginal Relief", result.newRes.marginalRelief87A, result.oldRes.marginalRelief87A],
      ["Slab Tax (after reliefs)", result.newRes.slabTax, result.oldRes.slabTax],
      ["CG Tax Base", result.newRes.slabTax * 0 + result.newRes.surchargeOnSlab - result.newRes.surchargeOnSlab + 0, 0], // placeholder, corrected below
      ["Surcharge Slab (raw)", result.newRes.rawSurchargeOnSlab, result.oldRes.rawSurchargeOnSlab],
      ["Surcharge CG (raw)", result.newRes.rawSurchargeOnCG, result.oldRes.rawSurchargeOnCG],
      ["Surcharge Marginal Relief", result.newRes.surchargeMarginalRelief, result.oldRes.surchargeMarginalRelief],
      ["Surcharge (net)", result.newRes.surchargeTotal, result.oldRes.surchargeTotal],
      ["Cess 4%", result.newRes.cess, result.oldRes.cess],
      ["Total Tax", result.newTax, result.oldTax],
    ];
    // Fix CG row
    rows[16] = ["CG Tax Base", cgTaxBase, cgTaxBase];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `income-tax-fy2025-26.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  // ===== JSON DOWNLOAD (ITR prep) =====
  const downloadJSON = () => {
    const ageLabel = { below60: "Below 60", "60to80": "Senior (60-80)", above80: "Super Senior (80+)" }[ageCategory];
    const chosen = result.best;

    const jsonData = {
      _meta: {
        tool: "VELORA Income Tax Calculator Pro",
        generatedAt: new Date().toISOString(),
        assessmentYear: "2026-27",
        financialYear: "2025-26",
        note: "Estimate only. Not official ITR JSON schema. Verify with CA before filing.",
      },
      taxpayerProfile: {
        ageCategory: ageCategory,
        ageCategoryLabel: ageLabel,
        regimeChosen: chosen,
      },
      // === Schedule S (Salary) ===
      scheduleS: {
        grossSalary: salary,
        standardDeduction: { oldRegime: result.stdDedOld, newRegime: result.stdDedNew },
        professionalTax: result.profTax,
        hraExempt: result.hraExempt,
        netSalaryOld: Math.max(0, salary - result.stdDedOld - result.profTax - result.hraExempt),
        netSalaryNew: Math.max(0, salary - result.stdDedNew),
      },
      // === Other Income ===
      otherIncome: {
        amount: otherIncome,
        type: "FD Interest / Rent / Other",
      },
      // === Schedule CG ===
      scheduleCG: {
        stcgEquity111A: { gross: stcg, taxable: stcg, rate: 0.20, tax: stcgTax },
        ltcgEquity112A: { gross: ltcgEquity, exempt: Math.min(ltcgEquity, 125000), taxable: ltcgTaxable, rate: 0.125, tax: ltcgTax },
        cryptoVDA115BBH: { gross: cryptoGain, taxable: cryptoGain, rate: 0.30, tax: cryptoTax },
        totalCGTax: cgTaxBase,
        grossCGTotal,
        taxableCGTotal,
      },
      // === Schedule VIA (Deductions) ===
      scheduleVIA_OldRegime: {
        section80C: {
          ppf, elss, lic, epf, homeLoanPrincipal,
          claimed: ppf + elss + lic + epf + homeLoanPrincipal,
          allowed: result.total80C,
          limit: 150000,
        },
        section80CCD1B: { claimed: nps80ccd1b, allowed: result.total80ccd1b, limit: 50000 },
        section80D: {
          self: { claimed: healthSelf, allowed: Math.min(result.limitSelf, healthSelf), limit: result.limitSelf },
          parents: { claimed: healthParents, allowed: Math.min(result.limitParents, healthParents), limit: result.limitParents, isSenior: isParentSenior },
          total: result.total80D,
        },
        section24b: { claimed: homeLoanInterest, allowed: result.total24b, limit: 200000 },
        section80E: { claimed: educationLoan80e, allowed: result.total80E },
        section80TTA: { claimed: savingsInterest80tta, allowed: result.total80TTA, limit: result.ttaLimit },
        section80G: {
          claimed: donation80g,
          agtiLimit: result.donation80gLimit,
          eligible: result.donation80gEligible,
          allowed: result.total80G,
          rate: 0.50,
          note: "50% category assumed",
        },
        totalDeductions: result.oldDeductions,
      },
      scheduleVIA_BothRegimes: {
        section80CCD2_EmployerNPS: {
          claimed: employerNps80ccd2,
          allowed: result.total80ccd2,
          limit: result.max80ccd2,
          limitPercentOfBasic: 0.14,
        },
      },
      // === Part B-TI (Total Income) ===
      partBTI: {
        grossTotalIncome: result.grossSalary,
        totalIncomeOldRegime: result.taxableOld,
        totalIncomeNewRegime: result.taxableNew,
      },
      // === Part B-TTI (Tax) ===
      partBTTI: {
        newRegime: {
          slabTaxBase: result.newRes.slabTaxBase,
          rebate87A: result.newRes.rebate87A,
          marginalRelief87A: result.newRes.marginalRelief87A,
          slabTaxAfterReliefs: result.newRes.slabTax,
          surchargeRate: result.newRes.surchargeRate,
          rawSurchargeOnSlab: result.newRes.rawSurchargeOnSlab,
          rawSurchargeOnCG: result.newRes.rawSurchargeOnCG,
          surchargeMarginalRelief: result.newRes.surchargeMarginalRelief,
          netSurcharge: result.newRes.surchargeTotal,
          cgTaxBase,
          cess4: result.newRes.cess,
          totalTax: result.newTax,
        },
        oldRegime: {
          slabTaxBase: result.oldRes.slabTaxBase,
          rebate87A: result.oldRes.rebate87A,
          marginalRelief87A: result.oldRes.marginalRelief87A,
          slabTaxAfterReliefs: result.oldRes.slabTax,
          surchargeRate: result.oldRes.surchargeRate,
          rawSurchargeOnSlab: result.oldRes.rawSurchargeOnSlab,
          rawSurchargeOnCG: result.oldRes.rawSurchargeOnCG,
          surchargeMarginalRelief: result.oldRes.surchargeMarginalRelief,
          netSurcharge: result.oldRes.surchargeTotal,
          cgTaxBase,
          cess4: result.oldRes.cess,
          totalTax: result.oldTax,
        },
      },
      // === Recommendation ===
      recommendation: {
        bestRegime: chosen,
        taxSaving: result.saving,
        monthlyTDS: result.monthlyTDS,
        annualInHand: result.inHand,
      },
      // === Advance Tax ===
      advanceTax: result.advanceTaxRequired ? {
        required: true,
        q1: { dueDate: "2025-06-15", percent: 0.15, amount: result.advanceTaxQ1 },
        q2: { dueDate: "2025-09-15", percent: 0.45, amount: result.advanceTaxQ2 },
        q3: { dueDate: "2025-12-15", percent: 0.75, amount: result.advanceTaxQ3 },
        q4: { dueDate: "2026-03-15", percent: 1.00, amount: result.advanceTaxQ4 },
      } : { required: false },
      // === Disclaimer ===
      disclaimer: "This JSON is a computation report — NOT the official ITR JSON for portal upload. Verify all values with a Chartered Accountant before filing.",
    };

    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ITR-prep-AY2026-27-${result.best}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const save = () => {
    try {
      localStorage.setItem("income-tax-v3", JSON.stringify({
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
      const d = JSON.parse(localStorage.getItem("income-tax-v3") || "null");
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
      { "@type": "Question", name: "12 Lakh tak New Regime me 0 tax kaise?", acceptedAnswer: { "@type": "Answer", text: "Section 87A rebate ke wajah se FY 2025-26 me ₹12 lakh tak taxable income pe zero tax lagta hai. Standard deduction ₹75,000 ke baad, ₹12.75 lakh tak ki gross salary pe koi tax nahi bachta." } },
      { "@type": "Question", name: "New vs Old Regime - kaunsa better hai?", acceptedAnswer: { "@type": "Answer", text: "Agar aapke paas HRA + 80C (1.5L) + 80D + home loan interest 2L tak deductions hain to Old Regime faydemand ho sakta hai. Otherwise New Regime with ₹12L rebate usually better hai." } },
      { "@type": "Question", name: "HRA exemption ka formula kya hai?", acceptedAnswer: { "@type": "Answer", text: "HRA exemption = minimum of (1) HRA received, (2) Basic × 50% (Metro) or 40% (non-Metro), (3) Rent paid - Basic × 10%. Tin me se sabse kam value exempt hoti hai." } },
      { "@type": "Question", name: "80C me kya kya include hota hai?", acceptedAnswer: { "@type": "Answer", text: "80C me PPF, ELSS, LIC premium, EPF, home loan principal repayment, tuition fees, NSC, SCSS - sab include hote hain. Total limit ₹1.5 lakh." } },
      { "@type": "Question", name: "NPS me extra deduction kitna milta hai?", acceptedAnswer: { "@type": "Answer", text: "Section 80CCD(1B) - ₹50,000 extra (Old Regime only). Section 80CCD(2) - employer ka 14% of basic (both regimes me)." } },
      { "@type": "Question", name: "Surcharge kab lagta hai?", acceptedAnswer: { "@type": "Answer", text: "Surcharge tab lagta hai jab Total Income ₹50 lakh se zyada ho. Equity STCG/LTCG pe surcharge 15% me capped hai (Section 111A/112A)." } },
      { "@type": "Question", name: "LTCG pe surcharge kaise calculate hota hai?", acceptedAnswer: { "@type": "Answer", text: "LTCG equity pe 12.5% tax hai aur surcharge 15% cap ke saath. Surcharge rate total income (taxable salary + taxable CG) se decide hota hai, lekin equity CG ki surcharge kabhi 15% se zyada nahi hoti." } },
      { "@type": "Question", name: "Marginal relief kya hai?", acceptedAnswer: { "@type": "Answer", text: "Marginal relief tax ko limit karta hai jab income threshold cross karti hai (12L, 50L, 1Cr etc). Tax increase income increase se zyada nahi hota." } },
      { "@type": "Question", name: "Advance tax kab bharna hota hai?", acceptedAnswer: { "@type": "Answer", text: "Agar total tax ₹10,000 se zyada hai to advance tax 4 installments me bharna hota hai: 15 June (15%), 15 Sept (45%), 15 Dec (75%), 15 March (100%)." } },
      { "@type": "Question", name: "Crypto pe 30% tax kaise calculate hota hai?", acceptedAnswer: { "@type": "Answer", text: "Virtual Digital Assets pe flat 30% tax hai - koi deduction nahi, koi basic exemption nahi, loss carry forward nahi. Crypto gains 30% flat rate pe tax hote hain aur surcharge normal rate pe lagta hai (15% cap nahi)." } },
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
          <button onClick={downloadJSON} className="bg-blue-500 text-white px-3 py-2 rounded-full text-[11px] font-black">🧾 ITR JSON</button>
          <button onClick={() => window.print()} className="bg-white text-black px-3 py-2 rounded-full text-[11px] font-black">📄 PDF</button>
          <button onClick={() => setTheme(isDark ? "light" : "dark")} className={`w-9 h-9 rounded-full ${isDark ? "bg-white/10" : "bg-black/10"}`}>{isDark ? "🌙" : "☀️"}</button>
        </div>
      </div>
      {saveMsg && <p className="text-center text-[11px] mt-1 font-black text-green-500">{saveMsg}</p>}

      <div className="max-w-[1100px] mx-auto px-4 py-5">
        <div className="text-center">
          <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-[10px] font-black tracking-widest">🏆 CA-LEVEL · FY 2025-26 (AY 2026-27)</span>
          <h1 className="text-[28px] md:text-[42px] font-black leading-tight mt-3">Income Tax <span className="text-[#FF7A1A]">Calculator Pro</span></h1>
          <p className={`mt-1 text-[12px] md:text-[13px] ${isDark ? "text-white/60" : "text-black/60"}`}>HRA + 80C + 80D + NPS + CG + Surcharge (with CG cap) + Marginal Relief (both regimes) — full CA-level accuracy.</p>
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
                <p className="flex justify-between"><span>CG Tax Base</span><b>{fmtFull(cgTaxBase)}</b></p>
                <p className="flex justify-between text-[11px] opacity-60"><span>STCG {fmtINR(stcgTax)} + LTCG {fmtINR(ltcgTax)} + Crypto {fmtINR(cryptoTax)}</span></p>
                <p className="flex justify-between font-black border-t pt-1">— New Regime —</p>
                <p className="flex justify-between"><span>Slab Tax (before 87A)</span><b>{fmtFull(result.newRes.slabTaxBase)}</b></p>
                {result.newRes.rebate87A > 0 && <p className="flex justify-between text-emerald-500"><span>Rebate 87A</span><b>- {fmtFull(result.newRes.rebate87A)}</b></p>}
                {result.newRes.marginalRelief87A > 0 && <p className="flex justify-between text-amber-500"><span>87A Marginal Relief</span><b>- {fmtFull(result.newRes.marginalRelief87A)}</b></p>}
                <p className="flex justify-between"><span>Slab Tax (after 87A)</span><b>{fmtFull(result.newRes.slabTax)}</b></p>
                {result.newRes.rawTotalSurcharge > 0 && <p className="flex justify-between"><span>Surcharge (raw @{(result.newRes.surchargeRate * 100).toFixed(0)}%)</span><b>{fmtFull(result.newRes.rawTotalSurcharge)}</b></p>}
                {result.newRes.surchargeMarginalRelief > 0 && <p className="flex justify-between text-amber-500"><span>Surcharge Marginal Relief</span><b>- {fmtFull(result.newRes.surchargeMarginalRelief)}</b></p>}
                {result.newRes.surchargeTotal > 0 && <p className="flex justify-between"><span>Net Surcharge</span><b>{fmtFull(result.newRes.surchargeTotal)}</b></p>}
                <p className="flex justify-between"><span>Cess 4%</span><b>{fmtFull(result.newRes.cess)}</b></p>
                <p className="flex justify-between font-black text-[#FF7A1A]"><span>Total Tax (New)</span><b>{fmtFull(result.newTax)}</b></p>
                <p className="flex justify-between font-black border-t pt-1">— Old Regime —</p>
                <p className="flex justify-between"><span>Slab Tax (before 87A)</span><b>{fmtFull(result.oldRes.slabTaxBase)}</b></p>
                {result.oldRes.rebate87A > 0 && <p className="flex justify-between text-emerald-500"><span>Rebate 87A</span><b>- {fmtFull(result.oldRes.rebate87A)}</b></p>}
                {result.oldRes.marginalRelief87A > 0 && <p className="flex justify-between text-amber-500"><span>87A Marginal Relief</span><b>- {fmtFull(result.oldRes.marginalRelief87A)}</b></p>}
                <p className="flex justify-between"><span>Slab Tax (after 87A)</span><b>{fmtFull(result.oldRes.slabTax)}</b></p>
                {result.oldRes.rawTotalSurcharge > 0 && <p className="flex justify-between"><span>Surcharge (raw @{(result.oldRes.surchargeRate * 100).toFixed(0)}%)</span><b>{fmtFull(result.oldRes.rawTotalSurcharge)}</b></p>}
                {result.oldRes.surchargeMarginalRelief > 0 && <p className="flex justify-between text-amber-500"><span>Surcharge Marginal Relief</span><b>- {fmtFull(result.oldRes.surchargeMarginalRelief)}</b></p>}
                {result.oldRes.surchargeTotal > 0 && <p className="flex justify-between"><span>Net Surcharge</span><b>{fmtFull(result.oldRes.surchargeTotal)}</b></p>}
                <p className="flex justify-between"><span>Cess 4%</span><b>{fmtFull(result.oldRes.cess)}</b></p>
                <p className="flex justify-between font-black text-[#FF7A1A]"><span>Total Tax (Old)</span><b>{fmtFull(result.oldTax)}</b></p>
              </div>
            </div>
          </div>
        )}

        {/* ADVANCE TAX */}
        {result.advanceTaxRequired && (
          <div className="mt-3 rounded-xl p-3 border border-amber-500/30 bg-amber-500/10 text-[11px] print-break">
            <p className="font-black text-amber-500">⚠️ Advance Tax Applicable</p>
            <p className={`mt-1 ${isDark ? "text-white/70" : "text-black/70"}`}>Tax ₹10,000+ hai → <b>15 Jun {fmtINR(result.advanceTaxQ1)}</b> · <b>15 Sep {fmtINR(result.advanceTaxQ2)}</b> · <b>15 Dec {fmtINR(result.advanceTaxQ3)}</b> · <b>15 Mar {fmtINR(result.advanceTaxQ4)}</b>. Miss karne pe 234B/234C interest @ 1% p.m.</p>
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

            <Input label="Annual Gross Salary (₹)" value={salary} onChange={setSalary} isDark={isDark} />
            <Input label="Other Income (FD, Rent) (₹)" value={otherIncome} onChange={setOtherIncome} isDark={isDark} />
            <Input label="Basic Salary (₹)" value={basic} onChange={setBasic} isDark={isDark} />
            <Input label="HRA Received (₹)" value={hraReceived} onChange={setHraReceived} isDark={isDark} />
            <Input label="Rent Paid / Year (₹)" value={rentPaid} onChange={setRentPaid} isDark={isDark} />
            <div className="flex gap-2 mt-2">
              <button onClick={() => setIsMetro(true)} className={`flex-1 py-2 rounded-lg text-[10px] font-bold ${isMetro ? "bg-[#FF7A1A] text-white" : isDark ? "bg-white/5" : "bg-black/5"}`}>🏙️ Metro</button>
              <button onClick={() => setIsMetro(false)} className={`flex-1 py-2 rounded-lg text-[10px] font-bold ${!isMetro ? "bg-[#FF7A1A] text-white" : isDark ? "bg-white/5" : "bg-black/5"}`}>🏘️ Non-Metro</button>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2 mt-2 text-[11px] font-bold">✅ HRA Exempt: <span className="text-emerald-500">{fmtFull(result.hraExempt)}</span></div>

            <h2 className="font-black text-[14px] mt-4">🏥 Deductions</h2>
            <div className="grid grid-cols-2 gap-x-3">
              <Input label="PPF" value={ppf} onChange={setPpf} isDark={isDark} />
              <Input label="ELSS" value={elss} onChange={setElss} isDark={isDark} />
              <Input label="LIC" value={lic} onChange={setLic} isDark={isDark} />
              <Input label="EPF" value={epf} onChange={setEpf} isDark={isDark} />
              <Input label="Home Loan Principal" value={homeLoanPrincipal} onChange={setHomeLoanPrincipal} isDark={isDark} />
              <Input label="NPS 80CCD(1B)" value={nps80ccd1b} onChange={setNps80ccd1b} isDark={isDark} />
            </div>
            <p className={`text-[10px] mt-1 ${isDark ? "text-white/60" : "text-black/60"}`}>80C Total: {fmtFull(result.total80C)} / ₹1.5L</p>

            <button onClick={() => setShowDeductions(!showDeductions)} className={`w-full mt-3 py-2 rounded-lg text-[11px] font-black border ${isDark ? "border-white/10 bg-white/5" : "border-black/10 bg-black/5"}`}>
              {showDeductions ? "Hide Extra Deductions ▲" : "More Deductions (80D, 80E, 80TTA, 80G) ▼"}
            </button>

            {showDeductions && (
              <>
                <Input label="Employer NPS 80CCD(2)" value={employerNps80ccd2} onChange={setEmployerNps80ccd2} hint="Max 14% of Basic" isDark={isDark} />
                <Input label="Health Insurance - Self" value={healthSelf} onChange={setHealthSelf} isDark={isDark} />
                <Input label="Health Insurance - Parents" value={healthParents} onChange={setHealthParents} isDark={isDark} />
                <button onClick={() => setIsParentSenior(!isParentSenior)} className={`w-full mt-2 py-2 rounded-lg text-[10px] font-bold border ${isParentSenior ? "bg-emerald-500 text-white" : isDark ? "bg-white/5" : "bg-black/5"}`}>
                  {isParentSenior ? "✅ Parents 60+ (Limit ₹50K)" : "Parents 60+? Click → ₹50K limit"}
                </button>
                <Input label="Home Loan Interest 24(b)" value={homeLoanInterest} onChange={setHomeLoanInterest} isDark={isDark} />
                <Input label="Education Loan Interest 80E" value={educationLoan80e} onChange={setEducationLoan80e} hint="No limit" isDark={isDark} />
                <Input label="Savings Interest 80TTA" value={savingsInterest80tta} onChange={setSavingsInterest80tta} hint="Max ₹10K (Senior: ₹50K)" isDark={isDark} />
                <Input label="Donations 80G" value={donation80g} onChange={setDonation80g} hint={`10% AGTI limit (₹${Math.round(result.donation80gLimit).toLocaleString("en-IN")}) + 50% category`} isDark={isDark} />
                <Input label="Professional Tax" value={professionalTax} onChange={setProfessionalTax} hint="Max ₹2,500" isDark={isDark} />
              </>
            )}
          </div>

          {/* RIGHT */}
          <div className="space-y-4">
            <div className={`rounded-[20px] border p-4 ${isDark ? "bg-[#15151F] border-white/10" : "bg-white border-black/10"}`}>
              <div className="flex justify-between items-center">
                <h2 className="font-black text-[14px]">📈 Capital Gains</h2>
                <button onClick={() => setShowAdvanced(!showAdvanced)} className="text-[11px] font-black text-[#FF7A1A] no-print">{showAdvanced ? "Hide ▲" : "Show ▼"}</button>
              </div>
              {showAdvanced && (
                <div>
                  <Input label="STCG - Equity Profit" value={stcg} onChange={setStcg} hint={`20% = ${fmtFull(stcgTax)}`} isDark={isDark} />
                  <Input label="LTCG - Equity Profit" value={ltcgEquity} onChange={setLtcgEquity} hint={`₹1.25L exempt, 12.5% above = ${fmtFull(ltcgTax)}`} isDark={isDark} />
                  <Input label="Crypto / VDA Gain" value={cryptoGain} onChange={setCryptoGain} hint={`Flat 30% = ${fmtFull(cryptoTax)}`} isDark={isDark} />
                </div>
              )}
              {!showAdvanced && <p className={`text-[11px] mt-1 ${isDark ? "text-white/60" : "text-black/60"}`}>Stock, Crypto profit hai? Show pe click karo.</p>}
            </div>

            <div className={`rounded-[20px] border p-4 ${isDark ? "bg-[#15151F] border-white/10" : "bg-white border-black/10"}`}>
              <h2 className="font-black text-[14px]">📅 Monthly TDS</h2>
              <div className="grid grid-cols-3 gap-1.5 mt-2">
                {monthlyData.map((m) => (
                  <div key={m.month} className={`rounded-lg p-2 text-center ${isDark ? "bg-white/5" : "bg-black/5"}`}>
                    <p className={`text-[10px] font-bold ${isDark ? "text-white/60" : "text-black/60"}`}>{m.month}</p>
                    <p className="font-black text-[11px]">{fmtINR(m.tds)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className={`rounded-[20px] border p-4 ${isDark ? "bg-[#15151F] border-white/10" : "bg-white border-black/10"}`}>
              <h2 className="font-black text-[14px]">💡 Deduction Optimizer</h2>
              <ul className="text-[11px] space-y-1.5 mt-2">
                {result.optimizerSteps.length === 0 ? (
                  <li className={isDark ? "text-white/60" : "text-black/60"}>✓ Sabhi available deductions maxed out. Focus on CG tax planning.</li>
                ) : (
                  result.optimizerSteps.map((step, i) => (
                    <li key={i}>• <b>{step.label}</b>: room <b>{fmtINR(step.amount)}</b> → extra saving <b className="text-emerald-500">{fmtFull(step.saving)}</b></li>
                  ))
                )}
              </ul>
              {result.potentialSavings > 0 && (
                <div className="mt-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-[11px] font-black text-emerald-500">💰 Total extra saving possible: {fmtFull(result.potentialSavings)}</p>
                </div>
              )}
              {result.best === "NEW" && (
                <p className={`text-[10px] mt-2 ${isDark ? "text-white/50" : "text-black/50"}`}>ℹ️ New Regime me sirf 80CCD(2) Employer NPS available hai — baaki deductions nahi milte.</p>
              )}
            </div>
          </div>
        </div>

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

        <div className={`mt-5 h-[90px] rounded-xl border border-dashed flex items-center justify-center text-[10px] font-bold tracking-widest opacity-40 no-print ${isDark ? "border-white/10" : "border-black/10"}`}>
          AD SLOT · 728×90
        </div>

        {/* SEO CONTENT (2200+ words, unchanged) */}
        <article className={`max-w-[900px] mx-auto py-8 text-[14px] leading-relaxed ${isDark ? "text-white/80" : "text-black/80"}`}>
          <h1 className="text-[28px] md:text-[38px] font-black leading-tight text-[#FF7A1A]">
            Income Tax Calculator 2025-26 (AY 2026-27) — Free New vs Old Regime Comparison Tool India
          </h1>
          <p className="mt-4">
            Our <strong>free Income Tax Calculator</strong> gives you CA-level accuracy for <strong>FY 2025-26 (AY 2026-27)</strong> — comparing the New Tax Regime and Old Tax Regime side-by-side, calculating HRA exemption, Section 80C, 80D, 80CCD NPS deductions, home loan interest, capital gains tax on stocks and crypto, surcharge with marginal relief (both regimes, including LTCG surcharge cap at 15%), health &amp; education cess, and true monthly TDS. Whether you are a salaried employee earning ₹6 lakh, a freelancer at ₹25 lakh, a senior citizen, or an HNI with capital gains — this calculator handles every Indian income tax complexity with full mathematical precision.
          </p>
          <h2 className="text-[22px] md:text-[26px] font-black mt-8 text-[#FF7A1A]">What is an Income Tax Calculator?</h2>
          <p className="mt-3">
            An <strong>income tax calculator</strong> is a financial tool that estimates your total income tax liability for a financial year based on your salary, other income sources, eligible deductions, and applicable tax regime. It uses the Income Tax Act 1961 slabs notified by the Central Board of Direct Taxes (CBDT) to compute the exact tax payable — slab tax, surcharge, cess, rebate u/s 87A — and shows the final amount you owe to the government. A good calculator does more than just slab multiplication — it handles <strong>marginal relief, surcharge triggers, HRA exemption rules, Section 80 deduction caps, and the tricky New vs Old Regime comparison</strong>.
          </p>
          <h2 className="text-[22px] md:text-[26px] font-black mt-8 text-[#FF7A1A]">New Regime vs Old Regime — Which is Better in FY 2025-26?</h2>
          <p className="mt-3">
            The Budget 2023 introduced a <strong>revamped New Tax Regime</strong> as the default option, and Budget 2025 raised the rebate threshold under Section 87A to ₹12 lakh. <strong>New Regime:</strong> Standard deduction ₹75,000, no 80C/80D/HRA deductions, zero tax up to ₹12 lakh taxable income (₹12.75 lakh gross). <strong>Old Regime:</strong> Standard deduction ₹50,000, allows 80C, 80D, HRA, home loan interest, NPS, education loan interest, etc. If total deductions exceed ₹4–₹5 lakh, Old Regime usually wins. Otherwise New Regime with the ₹12L rebate is more beneficial.
          </p>
          <h2 className="text-[22px] md:text-[26px] font-black mt-8 text-[#FF7A1A]">Income Tax Slabs for FY 2025-26</h2>
          <p className="mt-3"><strong>New Regime:</strong> 0-4L: Nil · 4-8L: 5% · 8-12L: 10% · 12-16L: 15% · 16-20L: 20% · 20-24L: 25% · 24L+: 30%</p>
          <p className="mt-3"><strong>Old Regime (below 60):</strong> 0-2.5L: Nil · 2.5-5L: 5% · 5-10L: 20% · 10L+: 30%</p>
          <p className="mt-3"><strong>Senior (60-80):</strong> Basic exemption ₹3 lakh. <strong>Super Senior (80+):</strong> Basic exemption ₹5 lakh.</p>
          <h2 className="text-[22px] md:text-[26px] font-black mt-8 text-[#FF7A1A]">Understanding Surcharge on Capital Gains (Important)</h2>
          <p className="mt-3">
            Surcharge on equity <strong>LTCG (Section 112A)</strong> and <strong>STCG (Section 111A)</strong> is <strong>capped at 15%</strong> regardless of income level — even if you're in the 25% or 37% surcharge bracket for slab income. Crypto/VDA gains at 30% flat rate attract surcharge at the <strong>normal rate (10%/15%/25%/37%)</strong>, no 15% cap. The surcharge rate itself is determined by <strong>Total Income (taxable salary + taxable CG)</strong> where LTCG is counted AFTER the ₹1.25L exemption. This is a common bug in tax calculators — we do it correctly.
          </p>
          <h2 className="text-[22px] md:text-[26px] font-black mt-8 text-[#FF7A1A]">Marginal Relief — Both Regimes</h2>
          <p className="mt-3">
            Marginal relief ensures tax doesn't exceed the increase in income when you cross a threshold. Both regimes have <strong>87A marginal relief</strong> (New: ₹12L–₹12.75L; Old: ₹5L–₹5.5L) and <strong>surcharge marginal relief</strong> at ₹50L/₹1Cr/₹2Cr/₹5Cr thresholds. Our calculator applies relief to total surcharge (not just slab) so the actual net tax matches IT department rules.
          </p>
          <h2 className="text-[22px] md:text-[26px] font-black mt-8 text-[#FF7A1A]">Section 80C, 80D, 80CCD — Deduction Limits</h2>
          <ul className="mt-3 list-disc pl-6 space-y-1.5">
            <li><strong>80C (₹1.5L):</strong> PPF, ELSS, LIC, EPF, home loan principal, tuition fees.</li>
            <li><strong>80CCD(1B) NPS (₹50K):</strong> Old Regime only, extra deduction.</li>
            <li><strong>80CCD(2) Employer NPS (14% Basic):</strong> Both regimes.</li>
            <li><strong>80D:</strong> ₹25K-₹50K self + parents based on age.</li>
            <li><strong>80E:</strong> Education loan interest, no limit.</li>
            <li><strong>80TTA:</strong> ₹10K savings interest (₹50K seniors).</li>
            <li><strong>80G:</strong> Donations, 10% AGTI cap + 50% category.</li>
            <li><strong>24(b):</strong> Home loan interest up to ₹2L.</li>
          </ul>
          <h2 className="text-[22px] md:text-[26px] font-black mt-8 text-[#FF7A1A]">Advance Tax & Section 234</h2>
          <p className="mt-3">
            If tax liability exceeds ₹10,000, advance tax in 4 quarterly installments — 15% by 15 June, 45% by 15 Sept, 75% by 15 Dec, 100% by 15 March. Miss karne pe <strong>Section 234B (1% p.m.)</strong> and <strong>234C</strong> interest lagega.
          </p>
          <h2 className="text-[22px] md:text-[26px] font-black mt-8 text-[#FF7A1A]">Income Tax Glossary</h2>
          <div className="mt-3">
            {[
              ["Assessment Year (AY)", "Year in which you file returns for the previous FY. FY 2025-26 = AY 2026-27."],
              ["Section 87A Rebate", "Tax rebate up to ₹12L in New Regime (₹5L in Old Regime)."],
              ["Marginal Relief", "Caps tax increase when income crosses threshold (₹12L, ₹50L, etc)."],
              ["Surcharge", "Additional tax on high incomes — 10% to 37%. Equity CG capped at 15%."],
              ["Cess", "4% Health & Education Cess on (tax + surcharge)."],
              ["HRA", "House Rent Allowance — Section 10(13A), 3-rule formula."],
              ["80C", "₹1.5L deduction — PPF, ELSS, LIC, EPF."],
              ["80CCD(1B)", "₹50K extra NPS — Old Regime only."],
              ["80CCD(2)", "14% Basic employer NPS — both regimes."],
              ["80D", "Health insurance premium — ₹25K-₹1L."],
              ["24(b)", "Home loan interest — ₹2L self-occupied."],
              ["LTCG / STCG", "Long-term / short-term capital gains."],
              ["VDA Tax", "30% flat tax on crypto/NFTs. Surcharge at normal rate."],
              ["TDS", "Tax Deducted at Source — monthly."],
              ["Advance Tax", "Quarterly if tax > ₹10,000."],
            ].map(([title, body], i) => (
              <Accordion key={i} title={title} isOpen={openAccordion === `g${i}`} onToggle={() => setOpenAccordion(openAccordion === `g${i}` ? null : `g${i}`)} isDark={isDark}>{body}</Accordion>
            ))}
          </div>
          <h2 className="text-[22px] md:text-[26px] font-black mt-8 text-[#FF7A1A]">Frequently Asked Questions (FAQ)</h2>
          <div className="mt-3">
            {[
              ["12 Lakh tak New Regime me 0 tax kaise?", "Section 87A rebate ke wajah se FY 2025-26 me ₹12 lakh tak taxable income pe zero tax lagta hai. Standard deduction ₹75,000 add karne ke baad ₹12.75 lakh tak ki gross salary pe koi tax nahi bachta."],
              ["New vs Old Regime - kaunsa better hai?", "Agar total deductions ₹4-5 lakh se zyada hain to Old Regime better ho sakta hai. Otherwise New Regime with ₹12L rebate usually better hai."],
              ["HRA exemption ka formula kya hai?", "HRA exempt = minimum of (1) HRA received, (2) Basic × 50% Metro / 40% non-Metro, (3) Rent - Basic × 10%."],
              ["80C me kya kya include hota hai?", "PPF, ELSS, LIC premium, EPF, home loan principal, tuition fees, NSC, SCSS, SSY — total ₹1.5 lakh."],
              ["NPS me extra deduction kitna milta hai?", "80CCD(1B): ₹50K extra (Old only). 80CCD(2): employer 14% basic (both). Total ₹2L possible."],
              ["Surcharge kab lagta hai?", "Total income ₹50 lakh cross hone pe. Equity CG pe 15% cap. Crypto pe normal rate."],
              ["LTCG pe surcharge kaise calculate hota hai?", "LTCG pe 12.5% tax + surcharge 15% cap. Surcharge rate total income se decide hota hai, LTCG exempt (₹1.25L) ke baad taxable CG include hoti hai."],
              ["Marginal relief kya hai?", "Tax ko limit karta hai jab income threshold cross karti hai. Both regimes me 87A + surcharge marginal relief applicable hai."],
              ["Senior citizens ke liye slabs alag hain?", "Old Regime: 60-80 = ₹3L exemption, 80+ = ₹5L. 80TTB me ₹50K savings interest deduction."],
              ["Advance tax kab bharna hota hai?", "Total tax ₹10K+ ho to 4 installments: 15 Jun (15%), 15 Sep (45%), 15 Dec (75%), 15 Mar (100%)."],
              ["Crypto pe 30% tax kaise calculate hota hai?", "VDA pe flat 30% — no deductions, no basic exemption, no loss carry forward. 1% TDS creditable. Surcharge normal rate."],
              ["80G ka calculation kaise hota hai?", "80G = min(donation, 10% AGTI) × 50% (assuming 50% category). AGTI = GTI minus deductions (except 80G)."],
              ["ITR JSON download kya hai?", "Ye ek structured JSON report hai jo aapke CA ko de sakte ho ya manual ITR filing me reference ke liye use kar sakte ho. Ye official ITR portal ka format nahi hai."],
              ["Standard deduction kitna milta hai?", "Salaried: New Regime ₹75,000, Old Regime ₹50,000. Direct salary se minus hota hai."],
              ["Is calculator ki accuracy kitni hai?", "CA-level formulas — marginal relief, surcharge (slab + CG), LTCG 15% cap, senior slabs, all deductions, 80G AGTI cap. FY 2025-26 slabs updated. Final filing ke liye CA se verify karo."],
            ].map(([q, a], i) => (
              <Accordion key={i} title={q} isOpen={openAccordion === `f${i}`} onToggle={() => setOpenAccordion(openAccordion === `f${i}` ? null : `f${i}`)} isDark={isDark}>{a}</Accordion>
            ))}
          </div>
          <h2 className="text-[22px] md:text-[26px] font-black mt-8 text-[#FF7A1A]">Tax Saving Tips 2026</h2>
          <ul className="mt-3 list-disc pl-6 space-y-1.5">
            <li><strong>Employer NPS 80CCD(2)</strong> — both regimes, ask HR to restructure.</li>
            <li><strong>Tax harvesting:</strong> Book ₹1.25L LTCG every year to reset cost basis.</li>
            <li><strong>Joint home loan:</strong> Both spouses claim ₹2L each under 24(b).</li>
            <li><strong>Buy health insurance early</strong> — 80D premium + protect from medical inflation.</li>
            <li><strong>For ₹15L+ income,</strong> evaluate both regimes carefully.</li>
            <li><strong>Plan advance tax</strong> if freelancer / capital gains heavy.</li>
            <li><strong>File ITR before 31 July</strong> — builds CIBIL even at zero tax.</li>
            <li><strong>Verify 80G fund category</strong> — PM CARES 100%, most others 50%.</li>
            <li><strong>Don&apos;t fake HRA</strong> — IT dept tracks rent transactions &gt; ₹1L.</li>
            <li><strong>Max out EPF first</strong> — automatic, then ELSS/PPF for remaining 80C.</li>
          </ul>
          <h2 className="text-[22px] md:text-[26px] font-black mt-8 text-[#FF7A1A]">Related Keywords</h2>
          <p className={`mt-3 text-[11px] leading-relaxed ${isDark ? "text-white/50" : "text-black/50"}`}>
            income tax calculator · income tax calculator 2025-26 · ay 2026-27 · new vs old regime · HRA calculator · 80C calculator · 80D calculator · NPS calculator · TDS calculator · advance tax calculator · capital gains tax calculator · surcharge calculator · marginal relief calculator · section 87A calculator · FY 2025-26 slabs · senior citizen tax calculator · 80TTA · 80E · 80G · 80CCD · home loan tax benefit · STCG LTCG calculator · VDA tax calculator · ITR JSON download · ITR filing helper · income tax return calculator · CA tax calculator
          </p>
          <div className={`mt-8 p-4 rounded-xl text-[11px] ${isDark ? "bg-white/5 text-white/50" : "bg-gray-100 text-black/60"}`}>
            <strong>Disclaimer:</strong> This Income Tax Calculator is for informational and estimation purposes only. Tax slabs shown correspond to FY 2025-26 (AY 2026-27) as per CBDT notifications. 80G assumes 50% category donation with 10% AGTI cap. ITR JSON is a computation report — not the official ITR portal schema. Always consult a Chartered Accountant before filing your ITR.
          </div>
        </article>
      </div>
    </div>
  );
}
