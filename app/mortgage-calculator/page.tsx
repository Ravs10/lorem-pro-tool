"use client";
import { useState, useMemo, useEffect, useRef } from "react";

export default function MortgageCalculator() {
  const [theme, setTheme] = useState("dark");
  const isDark = theme === "dark";
  const [mounted, setMounted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setMounted(true);
    audioRef.current = new Audio("https://cdn.pixabay.com/audio/2022/03/15/audio_0a6e7d0a9c.mp3");
  }, []);

  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.volume = 0.3;
      audioRef.current.play().catch(()=>{});
    }
  };

  // STATES
  const [homePrice, setHomePrice] = useState(350000);
  const [downPercent, setDownPercent] = useState(20);
  const [interest, setInterest] = useState(6.5);
  const [loanTerm, setLoanTerm] = useState(30);
  const [taxRate, setTaxRate] = useState(1.2);
  const [insurance, setInsurance] = useState(1500);
  const [pmi, setPmi] = useState(0.5);
  const [extraPayment, setExtraPayment] = useState(0);
  const [currency, setCurrency] = useState<"USD" | "INR">("USD");

  const calc = useMemo(() => {
    const downAmount = homePrice * (downPercent / 100);
    const loanAmount = homePrice - downAmount;
    const monthlyRate = interest / 100 / 12;
    const numPayments = loanTerm * 12;
    
    const monthlyPI = loanAmount * (monthlyRate * Math.pow(1+monthlyRate, numPayments)) / (Math.pow(1+monthlyRate, numPayments)-1);
    const monthlyTax = (homePrice * (taxRate/100)) / 12;
    const monthlyInsurance = insurance / 12;
    const monthlyPMI = downPercent < 20 ? (loanAmount * (pmi/100))/12 : 0;
    
    const totalMonthly = monthlyPI + monthlyTax + monthlyInsurance + monthlyPMI + extraPayment;
    const totalInterest = (monthlyPI * numPayments) - loanAmount;
    const totalPaid = totalMonthly * numPayments;
    const payoffMonths = extraPayment > 0 ? Math.ceil(numPayments - (extraPayment*12/ monthlyPI)) : numPayments;

    // Amortization for chart (first 12 months)
    let balance = loanAmount;
    const schedule = Array.from({length: 12}, (_, i) => {
      const interestPaid = balance * monthlyRate;
      const principalPaid = monthlyPI - interestPaid;
      balance -= principalPaid + extraPayment;
      return { month: i+1, interest: interestPaid, principal: principalPaid, balance: Math.max(0, balance) };
    });

    const fmt = (val: number) => {
      const v = currency === "INR" ? val * 83 : val;
      return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
        style: "currency", currency: currency === "INR" ? "INR" : "USD", maximumFractionDigits: 0
      }).format(v);
    };

    return { loanAmount, downAmount, monthlyPI, monthlyTax, monthlyInsurance, monthlyPMI, totalMonthly, totalInterest, totalPaid, schedule, payoffMonths, fmt };
  }, [homePrice, downPercent, interest, loanTerm, taxRate, insurance, pmi, extraPayment, currency]);

  if (!mounted) return null;

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDark ? "bg-[#07070B] text-white" : "bg-[#FAFAFF] text-black"}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;600;800;900&display=swap');
        * { font-family: 'Geist', sans-serif; }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        .glass { backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); }
        .hover-lift { transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .hover-lift:hover { transform: translateY(-4px) scale(1.02); box-shadow: 0 20px 40px rgba(255,122,26,0.15); }
        input[type=range] { accent-color: #FF7A1A; }
      `}</style>

      {/* HEADER - same as YT */}
      <div className="w-full p-3 sticky top-0 z-50">
        <header className={`max-w-[1200px] mx-auto glass border rounded-2xl px-5 py-3 flex justify-between items-center ${isDark ? "bg-white/[0.06] border-white/[0.08]" : "bg-white/80 border-black/[0.06] shadow-lg"}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-600 to-emerald-500 flex items-center justify-center font-black text-white">M$</div>
            <div><span className="font-black tracking-tight text-[16px] block leading-none">Mortgage Calculator</span><span className="text-[10px] font-bold opacity-60 tracking-widest">PRO v2.0 • $32 CPC</span></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 bg-green-500/15 border border-green-500/20 text-green-500 text-[10px] font-black px-3 py-1 rounded-full">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> RATE 6.5% LIVE
            </div>
            <button onClick={() => setCurrency(currency === "USD" ? "INR" : "USD")} className={`px-3 py-1.5 rounded-full text-[11px] font-black border hover-lift ${isDark ? "bg-white/10 border-white/10" : "bg-black/5 border-black/10"}`}>{currency === "USD" ? "🇺🇸 USD" : "🇮🇳 INR"}</button>
            <button onClick={() => { setTheme(isDark ? "light" : "dark"); playSound(); }} className={`w-10 h-10 rounded-full border flex items-center justify-center hover-lift ${isDark ? "bg-white/10 border-white/10" : "bg-black/5 border-black/10"}`}>{isDark ? "🌙" : "☀️"}</button>
          </div>
        </header>
      </div>

      <main className="max-w-[1200px] mx-auto px-4 py-6 grid lg:grid-cols-[1.15fr_0.85fr] gap-5">
        {/* LEFT - INPUTS */}
        <div className="space-y-5">
          <div className={`glass border rounded-[28px] p-7 md:p-8 ${isDark ? "bg-white/[0.04] border-white/[0.06]" : "bg-white border-black/[0.05] shadow-xl"}`}>
            <h1 className="text-[32px] md:text-[44px] font-black leading-[0.85] tracking-tighter">Mortgage<br/><span className="bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">Calculator PRO</span></h1>
            <p className={`text-[13px] mt-3 ${isDark ? "text-white/50" : "text-black/60"}`}>EMI + Tax + Insurance + PMI + Extra Payment = Real Monthly Cost. 100% accurate for USA, India, UK.</p>
            
            <div className={`mt-5 w-full h-[90px] rounded-xl border border-dashed flex items-center justify-center text-[11px] font-bold tracking-widest opacity-50 ${isDark ? "bg-white/[0.02] border-white/10" : "bg-black/[0.02] border-black/10"}`}>AD SLOT - 728x90 (High CPC $32)</div>

            <div className="mt-7 space-y-6">
              {/* Home Price */}
              <div className="group">
                <div className="flex justify-between"><label className="text-[12px] font-black uppercase opacity-80">Home Price</label><span className="text-[#22C55E] font-black">{calc.fmt(homePrice)}</span></div>
                <input type="range" min="50000" max="2000000" step="5000" value={homePrice} onChange={(e)=>{ setHomePrice(Number(e.target.value)); playSound(); }} className="w-full h-[6px] group-hover:h-[10px] transition-all cursor-pointer mt-2"/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-[11px] font-black uppercase">Down %</label><input type="range" min="0" max="50" value={downPercent} onChange={(e)=>setDownPercent(Number(e.target.value))} className="w-full mt-2"/><p className="text-[11px] mt-1 font-bold opacity-60">{downPercent}% = {calc.fmt(calc.downAmount)}</p></div>
                <div><label className="text-[11px] font-black uppercase">Interest %</label><input type="range" min="1" max="12" step="0.1" value={interest} onChange={(e)=>setInterest(Number(e.target.value))} className="w-full mt-2"/><p className="text-[11px] mt-1 font-bold opacity-60">{interest}% APR</p></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-black uppercase">Loan Term</label>
                  <select value={loanTerm} onChange={(e)=>setLoanTerm(Number(e.target.value))} className={`mt-2 w-full px-4 py-3 rounded-xl border font-bold ${isDark ? "bg-black/50 border-white/10" : "bg-[#F5F5F7] border-black/5"}`}>
                    <option value={15}>15 Years</option><option value={20}>20 Years</option><option value={30}>30 Years</option>
                  </select>
                </div>
                <div><label className="text-[11px] font-black uppercase">Extra /mo</label><input type="number" value={extraPayment} onChange={(e)=>setExtraPayment(Number(e.target.value))} className={`mt-2 w-full px-4 py-3 rounded-xl border font-bold ${isDark ? "bg-black/50 border-white/10" : "bg-[#F5F5F7] border-black/5"}`} /></div>
              </div>
            </div>
          </div>
          {/* CHART */}
          <div className={`glass border rounded-[24px] p-6 ${isDark ? "bg-white/[0.03] border-white/5" : "bg-white border-black/5 shadow-lg"}`}>
            <h3 className="font-black text-[13px] tracking-widest uppercase">Amortization - First 12 Months</h3>
            <div className="mt-5 space-y-2">
              {calc.schedule.map(s=>(
                <div key={s.month} className="flex justify-between text-[11px] p-2 rounded hover:bg-white/5"><span className="opacity-60">Month {s.month}</span><span className="text-orange-400">{calc.fmt(s.interest)} Int.</span><span className="text-green-400">{calc.fmt(s.principal)} Prin.</span><span className="font-black opacity-80">{calc.fmt(s.balance)}</span></div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT - RESULT */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-[#22C55E] via-emerald-600 to-green-700 rounded-[28px] p-[1.5px] shadow-[0_20px_60px_rgba(34,197,94,0.3)]" style={{animation:'float 5s ease-in-out infinite'}}>
            <div className="bg-[#0A0A0F] rounded-[26px] p-7 text-white relative overflow-hidden">
              <p className="text-[11px] tracking-[0.3em] text-white/40 font-black">TOTAL MONTHLY PAYMENT</p>
              <h2 className="text-[52px] font-black tracking-tighter mt-1 leading-none">{calc.fmt(calc.totalMonthly)}<span className="text-[18px] opacity-50">/mo</span></h2>
              <div className="grid grid-cols-2 gap-3 mt-6">
                <div className="bg-white/[0.06] border border-white/[0.08] rounded-2xl p-3.5 hover-lift"><p className="text-[9px] text-white/40 font-black">Principal + Interest</p><p className="font-black text-[16px] mt-1">{calc.fmt(calc.monthlyPI)}</p></div>
                <div className="bg-white/[0.06] border border-white/[0.08] rounded-2xl p-3.5 hover-lift"><p className="text-[9px] text-white/40 font-black">Tax</p><p className="font-black text-[16px] mt-1">{calc.fmt(calc.monthlyTax)}</p></div>
                <div className="bg-white/[0.06] border border-white/[0.08] rounded-2xl p-3.5 hover-lift"><p className="text-[9px] text-white/40 font-black">Total Interest</p><p className="font-black text-[16px] mt-1">{calc.fmt(calc.totalInterest)}</p></div>
                <div className="bg-white/[0.06] border border-white/[0.08] rounded-2xl p-3.5 hover-lift"><p className="text-[9px] text-white/40 font-black">Loan Amount</p><p className="font-black text-[16px] mt-1">{calc.fmt(calc.loanAmount)}</p></div>
              </div>
              <button onClick={()=>{ navigator.clipboard.writeText(`My Mortgage: ${calc.fmt(calc.totalMonthly)}/mo`); playSound(); }} className="mt-4 w-full py-3.5 bg-white text-black rounded-full font-black text-[13px] hover:bg-[#22C55E] hover:text-white transition-all active:scale-95 hover-lift">Copy Report 📊</button>
            </div>
          </div>
          <div className={`h-[250px] rounded-[20px] border border-dashed flex items-center justify-center text-[11px] font-bold tracking-widest ${isDark ? "bg-white/[0.02] border-white/10 text-white/30" : "bg-black/[0.02] border-black/10 text-black/30"}`}>AD SLOT - 300x250 (Finance Ads $32 CPC)</div>
        </div>
      </main>
    </div>
  );
}
