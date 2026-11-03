"use client";
import { useState, useMemo, useEffect, useRef } from "react";

export default function MortgageCalculatorV3() {
  const [mounted, setMounted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [homePrice, setHomePrice] = useState(350000);
  const [downPercent, setDownPercent] = useState(20);
  const [interest, setInterest] = useState(6.5);
  const [loanTerm, setLoanTerm] = useState(30);
  const [extraPayment, setExtraPayment] = useState(200);
  const [salary, setSalary] = useState(75000);
  const [hoa, setHoa] = useState(0);
  const [tablePage, setTablePage] = useState(0);

  useEffect(()=>{ setMounted(true); }, []);

  const calc = useMemo(() => {
    const downAmount = homePrice * (downPercent/100);
    const loanAmount = homePrice - downAmount;
    const r = interest/100/12;
    const n = loanTerm*12;
    const monthlyPI = r===0 ? loanAmount/n : loanAmount*(r*Math.pow(1+r,n))/(Math.pow(1+r,n)-1);
    const monthlyTax = (homePrice*0.012)/12;
    const totalMonthly = monthlyPI + monthlyTax + hoa + extraPayment;
    const totalInterest = monthlyPI * n - loanAmount;
    let balance = loanAmount;
    const fullSchedule = [];
    let month=0;
    while(balance>0 && month<500){
      month++; const intPaid=balance*r; let princ=monthlyPI-intPaid+extraPayment;
      if(princ>balance) princ=balance; balance-=princ;
      fullSchedule.push({month, interest:intPaid, principal:princ, balance:Math.max(0,balance)});
      if(balance<=0) break;
    }
    const afford = (salary/12)*0.28;
    const canAfford = afford >= totalMonthly;
    const fmt = (val:number)=> new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(val);
    // For CSS Pie
    const principalPct = (monthlyPI/totalMonthly)*100;
    const taxPct = (monthlyTax/totalMonthly)*100;
    const extraPct = (extraPayment/totalMonthly)*100;
    return { loanAmount, downAmount, monthlyPI, monthlyTax, totalMonthly, totalInterest, fullSchedule, fmt, canAfford, afford, principalPct, taxPct, extraPct };
  }, [homePrice, downPercent, interest, loanTerm, extraPayment, salary, hoa]);

  if(!mounted) return null;

  return (
    <div className="min-h-screen bg-[#07070B] text-white p-4">
      <div className="max-w-[1200px] mx-auto grid lg:grid-cols-[1.2fr_0.8fr] gap-5">
        <div className="bg-white/[0.04] border border-white/10 rounded-[28px] p-7">
          <h1 className="text-[40px] font-black leading-none tracking-tighter">Mortgage <span className="text-green-500">PRO MAX V3</span></h1>
          
          <div className="mt-6 space-y-4">
            <div><div className="flex justify-between text-xs font-black"><span>Home Price</span><span className="text-green-400">{calc.fmt(homePrice)}</span></div><input type="range" min={50000} max={2000000} step={5000} value={homePrice} onChange={e=>setHomePrice(Number(e.target.value))} className="w-full mt-2 accent-green-500"/></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-[11px] font-black uppercase">Down {downPercent}%</label><input type="range" min={0} max={50} value={downPercent} onChange={e=>setDownPercent(Number(e.target.value))} className="w-full"/></div>
              <div><label className="text-[11px] font-black uppercase">Interest {interest}%</label><input type="range" min={1} max={12} step={0.1} value={interest} onChange={e=>setInterest(Number(e.target.value))} className="w-full"/></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-[11px] font-black uppercase">Extra /mo</label><input type="number" value={extraPayment} onChange={e=>setExtraPayment(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10"/></div>
              <div><label className="text-[11px] font-black uppercase">Salary /yr</label><input type="number" value={salary} onChange={e=>setSalary(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10"/></div>
            </div>
          </div>

          {/* CSS PIE CHART - No Recharts */}
          <div className="mt-6 bg-black/30 rounded-2xl p-5 border border-white/5">
            <h3 className="text-xs font-black tracking-widest uppercase opacity-60">Payment Breakdown (CSS Only)</h3>
            <div className="mt-4 flex gap-2 h-4 rounded-full overflow-hidden bg-white/5">
              <div style={{width: `${calc.principalPct}%`}} className="bg-green-500 h-full transition-all duration-500"></div>
              <div style={{width: `${calc.taxPct}%`}} className="bg-blue-500 h-full transition-all duration-500"></div>
              <div style={{width: `${calc.extraPct}%`}} className="bg-orange-500 h-full transition-all duration-500"></div>
            </div>
            <div className="flex gap-4 mt-3 text-[10px] font-bold"><span className="text-green-400">● P&I {calc.principalPct.toFixed(0)}%</span><span className="text-blue-400">● Tax {calc.taxPct.toFixed(0)}%</span><span className="text-orange-400">● Extra {calc.extraPct.toFixed(0)}%</span></div>
          </div>

          {/* TABLE */}
          <div className="mt-5 bg-black/30 rounded-2xl p-5 border border-white/5 max-h-[300px] overflow-auto">
            <div className="flex justify-between"><h3 className="text-xs font-black uppercase">Amortization ({calc.fullSchedule.length} months)</h3><button onClick={()=>{const csv="Month,Interest,Principal,Balance\n"+calc.fullSchedule.map(s=>`${s.month},${s.interest},${s.principal},${s.balance}`).join("\n"); const b=new Blob([csv],{type:"text/csv"}); const u=URL.createObjectURL(b); const a=document.createElement("a"); a.href=u; a.download="schedule.csv"; a.click();}} className="text-[10px] px-3 py-1 rounded-full bg-white/10">CSV Export</button></div>
            <table className="w-full mt-3 text-[11px]"><tbody>{calc.fullSchedule.slice(tablePage*20,(tablePage+1)*20).map(r=><tr key={r.month} className="border-t border-white/5"><td className="py-1">{r.month}</td><td>{calc.fmt(r.interest)}</td><td className="text-green-400">{calc.fmt(r.principal)}</td><td>{calc.fmt(r.balance)}</td></tr>)}</tbody></table>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-gradient-to-br from-green-500 to-emerald-700 p-[1.5px] rounded-[28px]"><div className="bg-[#0A0A0F] rounded-[26px] p-7"><p className="text-[11px] opacity-40 font-black tracking-widest">TOTAL MONTHLY</p><h2 className="text-[48px] font-black leading-none mt-2">{calc.fmt(calc.totalMonthly)}</h2><p className={`text-xs mt-2 font-bold ${calc.canAfford ? "text-green-400" : "text-red-400"}`}>{calc.canAfford ? "✅ You can afford" : "❌ Need more income"}</p><div className="grid grid-cols-2 gap-3 mt-5"><div className="bg-white/5 rounded-xl p-3"><p className="text-[9px] opacity-40">LOAN</p><p className="font-black">{calc.fmt(calc.loanAmount)}</p></div><div className="bg-white/5 rounded-xl p-3"><p className="text-[9px] opacity-40">INTEREST</p><p className="font-black">{calc.fmt(calc.totalInterest)}</p></div></div></div></div>
          <div className="h-[250px] rounded-[20px] border border-dashed border-white/10 flex items-center justify-center text-[11px] opacity-30">AD SLOT 300x250 ($45 CPC)</div>
        </div>
      </div>
    </div>
  );
}
