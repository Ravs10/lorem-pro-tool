"use client";
import { useState, useMemo, useEffect, useRef } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, Legend } from "recharts";

const COLORS = ["#22C55E", "#FF7A1A", "#3B82F6", "#A855F7", "#EAB308"];

export default function MortgageCalculatorV3() {
  const [theme, setTheme] = useState("dark");
  const isDark = theme === "dark";
  const [mounted, setMounted] = useState(false);
  const [showLead, setShowLead] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // V3 STATES - Advanced
  const [homePrice, setHomePrice] = useState(350000);
  const [downPercent, setDownPercent] = useState(20);
  const [interest, setInterest] = useState(6.5);
  const [loanTerm, setLoanTerm] = useState(30);
  const [taxRate, setTaxRate] = useState(1.2);
  const [insurance, setInsurance] = useState(1800);
  const [pmiRate, setPmiRate] = useState(0.6);
  const [hoa, setHoa] = useState(0);
  const [extraPayment, setExtraPayment] = useState(200);
  const [paymentFreq, setPaymentFreq] = useState<"monthly" | "biweekly">("monthly");
  const [salary, setSalary] = useState(75000);
  const [currency, setCurrency] = useState<"USD" | "INR">("USD");
  const [tablePage, setTablePage] = useState(0);

  useEffect(() => {
    setMounted(true);
    audioRef.current = new Audio("https://cdn.pixabay.com/audio/2022/03/15/audio_0a6e7d0a9c.mp3");
    // Shareable URL logic
    const params = new URLSearchParams(window.location.search);
    if(params.get("price")) setHomePrice(Number(params.get("price")));
    if(params.get("down")) setDownPercent(Number(params.get("down")));
    if(params.get("rate")) setInterest(Number(params.get("rate")));
  }, []);

  const playSound = () => { audioRef.current && audioRef.current.play().catch(()=>{}); };

  const calc = useMemo(() => {
    const downAmount = homePrice * (downPercent/100);
    const loanAmount = homePrice - downAmount;
    const r = interest/100/12;
    const n = loanTerm*12;
    const monthlyPI = r === 0 ? loanAmount/n : loanAmount * (r*Math.pow(1+r,n))/(Math.pow(1+r,n)-1);
    const monthlyTax = (homePrice*(taxRate/100))/12;
    const monthlyInsurance = insurance/12;
    const monthlyPMI = downPercent < 20 ? (loanAmount*(pmiRate/100))/12 : 0;
    const monthlyHOA = hoa;
    
    let totalMonthly = monthlyPI + monthlyTax + monthlyInsurance + monthlyPMI + monthlyHOA + extraPayment;
    if(paymentFreq === "biweekly") totalMonthly = totalMonthly/2;

    const totalInterest = monthlyPI * n - loanAmount;
    const totalPaid = totalMonthly * (paymentFreq === "biweekly" ? n*2 : n);

    // Full amortization
    let balance = loanAmount;
    let totalIntPaid = 0;
    const fullSchedule = [];
    let month = 0;
    while(balance > 0 && month < 500){
      month++;
      const intPaid = balance * r;
      let princPaid = monthlyPI - intPaid + extraPayment;
      if(princPaid > balance) princPaid = balance;
      balance -= princPaid;
      totalIntPaid += intPaid;
      fullSchedule.push({ month, interest: intPaid, principal: princPaid, balance: Math.max(0,balance), totalInterest: totalIntPaid });
      if(balance <=0) break;
    }

    const afford28 = (salary/12)*0.28;
    const canAfford = afford28 >= totalMonthly;
    const pieData = [
      { name: "Principal & Interest", value: monthlyPI },
      { name: "Tax", value: monthlyTax },
      { name: "Insurance", value: monthlyInsurance },
      { name: "PMI", value: monthlyPMI },
      { name: "HOA + Extra", value: monthlyHOA + extraPayment },
    ].filter(d=>d.value>0);

    const fmt = (val:number) => {
      const v = currency==="INR" ? val*83 : val;
      return new Intl.NumberFormat(currency==="INR" ? "en-IN" : "en-US",{style:"currency",currency: currency==="INR" ? "INR" : "USD",maximumFractionDigits:0}).format(v);
    };

    const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/mortgage-calculator?price=${homePrice}&down=${downPercent}&rate=${interest}`;

    return { loanAmount, downAmount, monthlyPI, monthlyTax, monthlyInsurance, monthlyPMI, monthlyHOA, totalMonthly, totalInterest, totalPaid, fullSchedule, pieData, afford28, canAfford, fmt, shareUrl };
  }, [homePrice, downPercent, interest, loanTerm, taxRate, insurance, pmiRate, hoa, extraPayment, paymentFreq, salary, currency]);

  if(!mounted) return null;

  return (
    <div className={`min-h-screen ${isDark ? "bg-[#07070B] text-white" : "bg-[#FAFAFF] text-black"} transition-colors duration-500`}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;700;900&display=swap'); *{font-family:'Geist',sans-serif} .glass{backdrop-filter:blur(24px)} .hover-lift{transition:all .3s cubic-bezier(.175,.885,.32,1.275)} .hover-lift:hover{transform:translateY(-4px) scale(1.02)}`}</style>

      {/* HEADER */}
      <div className="w-full p-3 sticky top-0 z-50">
        <header className={`max-w-[1300px] mx-auto glass border rounded-2xl px-5 py-3 flex justify-between items-center ${isDark ? "bg-white/[0.06] border-white/[0.08]" : "bg-white/80 border-black/[0.06] shadow-lg"}`}>
          <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-600 to-emerald-500 flex items-center justify-center font-black text-white">M$</div><span className="font-black">Mortgage PRO MAX V3</span><span className="ml-2 hidden md:inline text-[10px] px-2 py-1 rounded-full bg-green-500/20 text-green-400 font-black">CPC $45</span></div>
          <div className="flex gap-2"><button onClick={()=>{navigator.clipboard.writeText(calc.shareUrl); playSound();}} className="px-3 py-1.5 rounded-full text-[11px] font-black border bg-white/10">🔗 Share Link</button><button onClick={()=>setTheme(isDark?"light":"dark")} className="w-10 h-10 rounded-full border bg-white/10">{isDark?"🌙":"☀️"}</button></div>
        </header>
      </div>

      <main className="max-w-[1300px] mx-auto px-4 py-6 grid lg:grid-cols-[1.2fr_0.8fr] gap-6">
        {/* LEFT */}
        <div className="space-y-5">
          <div className={`glass border rounded-[28px] p-7 ${isDark ? "bg-white/[0.04] border-white/[0.06]" : "bg-white border-black/5 shadow-xl"}`}>
            <h1 className="text-[36px] md:text-[46px] font-black leading-[0.9] tracking-tighter">Mortgage<br/><span className="bg-gradient-to-r from-green-500 to-emerald-400 bg-clip-text text-transparent">Calculator PRO MAX</span></h1>
            
            <div className="mt-6 grid md:grid-cols-2 gap-5">
              <div><div className="flex justify-between"><label className="text-[11px] font-black uppercase">Home Price</label><span className="text-green-500 font-black text-[13px]">{calc.fmt(homePrice)}</span></div><input type="range" min={50000} max={2000000} step={5000} value={homePrice} onChange={e=>setHomePrice(Number(e.target.value))} className="w-full mt-2 accent-green-500"/></div>
              <div><div className="flex justify-between"><label className="text-[11px] font-black uppercase">Down {downPercent}%</label><span className="font-bold text-[13px]">{calc.fmt(calc.downAmount)}</span></div><input type="range" min={0} max={50} value={downPercent} onChange={e=>setDownPercent(Number(e.target.value))} className="w-full mt-2"/></div>
              <div><label className="text-[11px] font-black uppercase">Interest {interest}%</label><input type="range" min={1} max={12} step={0.1} value={interest} onChange={e=>setInterest(Number(e.target.value))} className="w-full mt-2"/></div>
              <div><label className="text-[11px] font-black uppercase">HOA /mo</label><input type="number" value={hoa} onChange={e=>setHoa(Number(e.target.value))} className={`w-full px-3 py-2 rounded-xl border ${isDark ? "bg-black/50 border-white/10" : "bg-gray-100"}`}/></div>
              <div><label className="text-[11px] font-black uppercase">Extra Payment /mo</label><input type="number" value={extraPayment} onChange={e=>setExtraPayment(Number(e.target.value))} className={`w-full px-3 py-2 rounded-xl border ${isDark ? "bg-black/50 border-white/10" : "bg-gray-100"}`}/><p className="text-[10px] opacity-50 mt-1">Save {calc.fmt(calc.totalInterest - calc.fullSchedule[calc.fullSchedule.length-1]?.totalInterest || 0)} + {loanTerm*12 - calc.fullSchedule.length} months early!</p></div>
              <div><label className="text-[11px] font-black uppercase">Your Annual Salary (AI Check)</label><input type="number" value={salary} onChange={e=>setSalary(Number(e.target.value))} className={`w-full px-3 py-2 rounded-xl border ${isDark ? "bg-black/50 border-white/10" : "bg-gray-100"}`}/><p className={`text-[10px] mt-1 font-bold ${calc.canAfford ? "text-green-500" : "text-red-500"}`}>{calc.canAfford ? "✅ You can afford this!" : `❌ Need ${calc.fmt(calc.totalMonthly - calc.afford28)} more income`}</p></div>
            </div>
            <div className="mt-4 flex gap-2"><button onClick={()=>setPaymentFreq("monthly")} className={`px-4 py-2 rounded-full text-xs font-black border ${paymentFreq==="monthly" ? "bg-green-500 text-white" : "bg-white/10"}`}>Monthly</button><button onClick={()=>setPaymentFreq("biweekly")} className={`px-4 py-2 rounded-full text-xs font-black border ${paymentFreq==="biweekly" ? "bg-green-500 text-white" : "bg-white/10"}`}>Bi-Weekly (Save faster)</button></div>
          </div>

          {/* CHARTS */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className={`glass border rounded-[24px] p-5 ${isDark ? "bg-white/[0.03] border-white/5" : "bg-white shadow"}`}>
              <h3 className="font-black text-xs uppercase tracking-widest">Payment Breakdown</h3>
              <div className="h-[220px] mt-4"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={calc.pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>{calc.pieData.map((e,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}</Pie><Tooltip/><Legend wrapperStyle={{fontSize:"10px"}}/></PieChart></ResponsiveContainer></div>
            </div>
            <div className={`glass border rounded-[24px] p-5 ${isDark ? "bg-white/[0.03] border-white/5" : "bg-white shadow"}`}>
              <h3 className="font-black text-xs uppercase tracking-widest">Interest vs Principal (1st Year)</h3>
              <div className="h-[220px] mt-4"><ResponsiveContainer width="100%" height="100%"><BarChart data={calc.fullSchedule.slice(0,12)}><XAxis dataKey="month" fontSize={10}/><Tooltip/><Bar dataKey="interest" stackId="a" fill="#FF7A1A"/><Bar dataKey="principal" stackId="a" fill="#22C55E"/></BarChart></ResponsiveContainer></div>
            </div>
          </div>

          {/* FULL TABLE */}
          <div className={`glass border rounded-[24px] p-5 overflow-hidden ${isDark ? "bg-white/[0.03] border-white/5" : "bg-white shadow"}`}>
            <div className="flex justify-between items-center"><h3 className="font-black text-xs uppercase">Full Amortization Schedule ({calc.fullSchedule.length} months)</h3><button onClick={()=>{ const csv = "Month,Interest,Principal,Balance\n"+calc.fullSchedule.map(s=>`${s.month},${s.interest.toFixed(2)},${s.principal.toFixed(2)},${s.balance.toFixed(2)}`).join("\n"); const blob=new Blob([csv],{type:"text/csv"}); const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download="amortization.csv"; a.click(); }} className="text-[11px] px-3 py-1 rounded-full bg-white/10 border font-black">Export CSV</button></div>
            <div className="mt-4 max-h-[300px] overflow-auto text-[11px]">
              <table className="w-full"><thead className="sticky top-0 bg-inherit"><tr className="opacity-50"><th className="text-left py-2">Month</th><th>Interest</th><th>Principal</th><th>Balance</th></tr></thead><tbody>{calc.fullSchedule.slice(tablePage*20, (tablePage+1)*20).map(r=><tr key={r.month} className="border-t border-white/5 hover:bg-white/5"><td className="py-1.5">{r.month}</td><td>{calc.fmt(r.interest)}</td><td className="text-green-400">{calc.fmt(r.principal)}</td><td>{calc.fmt(r.balance)}</td></tr>)}</tbody></table>
            </div>
            <div className="flex gap-2 mt-3"><button disabled={tablePage===0} onClick={()=>setTablePage(p=>p-1)} className="px-3 py-1 rounded bg-white/10 disabled:opacity-30 text-xs">Prev</button><span className="text-xs py-1 opacity-60">Page {tablePage+1} / {Math.ceil(calc.fullSchedule.length/20)}</span><button disabled={(tablePage+1)*20 >= calc.fullSchedule.length} onClick={()=>setTablePage(p=>p+1)} className="px-3 py-1 rounded bg-white/10 disabled:opacity-30 text-xs">Next</button></div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-green-500 via-emerald-600 to-green-700 rounded-[28px] p-[1.5px] shadow-[0_20px_60px_rgba(34,197,94,0.3)]">
            <div className="bg-[#0A0A0F] rounded-[26px] p-7 text-white">
              <p className="text-[11px] tracking-[0.3em] text-white/40 font-black">{paymentFreq.toUpperCase()} PAYMENT</p>
              <h2 className="text-[52px] font-black tracking-tighter leading-none mt-1">{calc.fmt(calc.totalMonthly)}<span className="text-[18px] opacity-50">/{paymentFreq==="biweekly"?"2wk":"mo"}</span></h2>
              <p className="text-[11px] mt-2 opacity-60">28% Rule: You need {calc.fmt(calc.totalMonthly/0.28*12)}/year income</p>
              <div className="grid grid-cols-2 gap-3 mt-6">
                <div className="bg-white/[0.06] rounded-2xl p-3"><p className="text-[9px] opacity-40 font-black">LOAN AMOUNT</p><p className="font-black mt-1">{calc.fmt(calc.loanAmount)}</p></div>
                <div className="bg-white/[0.06] rounded-2xl p-3"><p className="text-[9px] opacity-40 font-black">TOTAL INTEREST</p><p className="font-black mt-1">{calc.fmt(calc.totalInterest)}</p></div>
                <div className="bg-white/[0.06] rounded-2xl p-3"><p className="text-[9px] opacity-40 font-black">PAYOFF IN</p><p className="font-black mt-1">{Math.floor(calc.fullSchedule.length/12)}y {calc.fullSchedule.length%12}m</p></div>
                <div className="bg-white/[0.06] rounded-2xl p-3"><p className="text-[9px] opacity-40 font-black">YOU SAVE</p><p className="font-black mt-1 text-green-400">{calc.fmt((loanTerm*12* (calc.monthlyPI)) - calc.loanAmount - calc.fullSchedule[calc.fullSchedule.length-1]?.totalInterest)}</p></div>
              </div>
              <button onClick={()=>setShowLead(true)} className="w-full mt-4 py-3.5 bg-white text-black rounded-full font-black text-[13px] hover:bg-green-500 hover:text-white transition hover-lift">Get Best Mortgage Rates →</button>
              <p className="text-[10px] text-center opacity-40 mt-2">Lead form = $15-40 per lead (USA)</p>
            </div>
          </div>
          <div className={`h-[250px] rounded-[20px] border border-dashed flex items-center justify-center text-[11px] font-bold tracking-widest ${isDark ? "bg-white/[0.02] border-white/10 text-white/30" : "bg-black/[0.02] border-black/10"}`}>AD SLOT - 300x250 ($45 CPC)</div>
        </div>
      </main>

      {/* LEAD FORM MODAL */}
      {showLead && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur flex items-center justify-center p-4">
          <div className="bg-[#111] border border-white/10 rounded-[20px] p-6 max-w-sm w-full">
            <h3 className="font-black text-lg">Get Lowest Mortgage Rates</h3><p className="text-xs opacity-60 mt-1">We compare 100+ lenders. Free, no spam.</p>
            <input placeholder="Name" className="w-full mt-4 px-4 py-3 rounded-xl bg-white/5 border border-white/10"/>
            <input placeholder="Email" className="w-full mt-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10"/>
            <input placeholder="ZIP Code (USA)" className="w-full mt-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10"/>
            <div className="flex gap-2 mt-4"><button onClick={()=>setShowLead(false)} className="flex-1 py-3 rounded-full bg-white/10 font-bold">Cancel</button><button onClick={()=>{ setShowLead(false); alert("Lead saved! $25 earned (simulated)"); }} className="flex-1 py-3 rounded-full bg-green-500 font-black text-black">Get Rates</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
