"use client";
import { useState, useMemo, useRef } from "react";

export default function FireCalculatorProMax() {
  const [age, setAge] = useState(25);
  const [retireAge, setRetireAge] = useState(45);
  const [currentSavings, setCurrentSavings] = useState(500000);
  const [monthlyInvest, setMonthlyInvest] = useState(25000);
  const [annualReturn, setAnnualReturn] = useState(12);
  const [inflation, setInflation] = useState(6);
  const [monthlyExpense, setMonthlyExpense] = useState(50000);
  const [withdrawRate, setWithdrawRate] = useState(4);
  const [currency, setCurrency] = useState("₹");
  const audioRef = useRef<AudioContext | null>(null);

  const play = (t: "hover" | "click" | "fire") => {
    try {
      if (!audioRef.current) audioRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const ctx = audioRef.current; if (ctx.state === "suspended") ctx.resume();
      const o = ctx.createOscillator(); const g = ctx.createGain(); o.connect(g); g.connect(ctx.destination);
      if (t === "hover") { o.frequency.value = 700; g.gain.setValueAtTime(0.04, ctx.currentTime); o.start(); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12); o.stop(ctx.currentTime + 0.12); }
      else if (t === "click") { o.frequency.value = 1100; g.gain.setValueAtTime(0.12, ctx.currentTime); o.start(); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25); o.stop(ctx.currentTime + 0.25); }
      else { o.frequency.value = 200; o.frequency.linearRampToValueAtTime(1200, ctx.currentTime + 0.6); g.gain.setValueAtTime(0.25, ctx.currentTime); o.start(); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8); o.stop(ctx.currentTime + 0.8); }
    } catch {}
  };

  const result = useMemo(() => {
    const yearsToRetire = retireAge - age;
    const months = yearsToRetire * 12;
    const r = annualReturn / 100 / 12;
    let fv = currentSavings * Math.pow(1 + annualReturn / 100, yearsToRetire);
    if (r > 0) fv += monthlyInvest * ((Math.pow(1 + r, months) - 1) / r);
    else fv += monthlyInvest * months;

    const realReturn = (annualReturn - inflation) / 100;
    const fvReal = fv / Math.pow(1 + inflation / 100, yearsToRetire);
    const annualExpenseAtRetire = monthlyExpense * 12 * Math.pow(1 + inflation / 100, yearsToRetire);
    const fireNumber = annualExpenseAtRetire / (withdrawRate / 100);
    const isFire = fv >= fireNumber;
    const shortfall = Math.max(0, fireNumber - fv);
    const yearsCanSustain = fv / annualExpenseAtRetire * (withdrawRate / 4);

    const chart = [];
    let bal = currentSavings;
    for (let y = 0; y <= yearsToRetire; y++) {
      if (y > 0) bal = bal * (1 + annualReturn / 100) + monthlyInvest * 12;
      chart.push({ year: age + y, balance: Math.round(bal) });
    }

    return { fv, fvReal, fireNumber, annualExpenseAtRetire, isFire, shortfall, yearsToRetire, chart, yearsCanSustain };
  }, [age, retireAge, currentSavings, monthlyInvest, annualReturn, inflation, monthlyExpense, withdrawRate]);

  return (
    <div className="min-h-screen bg-[#07070B] text-white overflow-x-hidden">
      <style>{`
        .glass { background: rgba(255,255,255,0.06); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.08); }
        .glass-strong { background: rgba(255,255,255,0.10); backdrop-filter: blur(28px); border: 1px solid rgba(255,255,255,0.12); }
        .range::-webkit-slider-thumb { appearance:none; width:22px; height:22px; border-radius:50%; background:#F59E0B; cursor:pointer; box-shadow:0 0 14px rgba(245,158,11,0.6); }
        @keyframes float { 0%,100%{ transform:translateY(0)} 50%{ transform:translateY(-8px)} } .float{ animation:float 3.5s ease-in-out infinite; }
        @keyframes firePulse { 0%,100%{ box-shadow:0 0 20px rgba(245,158,11,0.4)} 50%{ box-shadow:0 0 40px rgba(245,158,11,0.8)} } .fire-glow{ animation:firePulse 2s infinite; }
      `}</style>

      <div className="max-w-[1200px] mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-amber-600 flex items-center justify-center font-black text-black">🔥</div>
          <span className="font-black tracking-widest text-[12px]">FIRE CALC PRO MAX</span>
          <span className="ml-2 text-[9px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">RETIRE EARLY</span>
        </div>
        <button onClick={() => setCurrency(currency === "₹" ? "$" : "₹")} onMouseEnter={() => play("hover")} className="glass px-3 py-1.5 rounded-full text-xs font-bold hover:bg-white/10 transition">{currency} Toggle</button>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 pb-12 grid lg:grid-cols-[1.1fr_0.9fr] gap-6">
        {/* LEFT INPUTS */}
        <div className="space-y-4">
          <div className="glass-strong rounded-[28px] p-6 md:p-8">
            <h1 className="text-[28px] md:text-[38px] font-black leading-[0.9]">Retire at {retireAge}?<br/><span className="text-amber-400">You Need {currency}{(result.fireNumber/10000000).toFixed(2)} Cr</span></h1>
            <p className="text-white/40 text-[11px] mt-3 tracking-widest">F.I.R.E = Financial Independence Retire Early • 4% Rule • Inflation Adjusted</p>

            <div className="mt-8 space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <div><div className="flex justify-between text-[10px] font-bold text-white/50"><span>CURRENT AGE</span><span className="text-white">{age}</span></div><input type="range" min="18" max="60" value={age} onChange={e => { setAge(+e.target.value); play("fire"); }} className="range w-full h-1 bg-white/10 rounded-full appearance-none mt-2" /></div>
                <div><div className="flex justify-between text-[10px] font-bold text-white/50"><span>RETIRE AGE</span><span className="text-amber-400 font-black">{retireAge}</span></div><input type="range" min={age + 1} max="70" value={retireAge} onChange={e => { setRetireAge(+e.target.value); play("fire"); }} className="range w-full h-1 bg-white/10 rounded-full appearance-none mt-2" /></div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-bold tracking-widest text-white/60"><span>CURRENT SAVINGS</span><span className="text-white text-[13px]">{currency}{currentSavings.toLocaleString()}</span></div>
                <input type="range" min="0" max="10000000" step="50000" value={currentSavings} onChange={e => { setCurrentSavings(+e.target.value); play("fire"); }} className="range w-full h-1 bg-white/10 rounded-full appearance-none mt-2" />
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-bold tracking-widest text-white/60"><span>MONTHLY INVEST (SIP)</span><span className="text-amber-400 text-[14px]">{currency}{monthlyInvest.toLocaleString()}</span></div>
                <input type="range" min="1000" max="200000" step="1000" value={monthlyInvest} onChange={e => { setMonthlyInvest(+e.target.value); play("fire"); }} className="range w-full h-1 bg-white/10 rounded-full appearance-none mt-2" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div><div className="flex justify-between text-[10px] font-bold text-white/50"><span>RETURN %</span><span className="text-green-400">{annualReturn}%</span></div><input type="range" min="5" max="20" step="0.5" value={annualReturn} onChange={e => setAnnualReturn(+e.target.value)} className="range w-full h-1 bg-white/10 rounded-full appearance-none mt-2" /></div>
                <div><div className="flex justify-between text-[10px] font-bold text-white/50"><span>INFLATION %</span><span className="text-red-400">{inflation}%</span></div><input type="range" min="2" max="10" step="0.5" value={inflation} onChange={e => setInflation(+e.target.value)} className="range w-full h-1 bg-white/10 rounded-full appearance-none mt-2" /></div>
              </div>

              <details className="glass rounded-xl p-4">
                <summary className="cursor-pointer text-[11px] font-black tracking-widest flex justify-between">ADVANCE (Expense + Withdraw Rate) <span>▼</span></summary>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <label className="text-[10px]">Monthly Expense Today <input type="number" value={monthlyExpense} onChange={e => setMonthlyExpense(+e.target.value)} className="glass mt-1 w-full p-2 rounded-lg bg-transparent outline-none text-sm border border-amber-500/20" /></label>
                  <label className="text-[10px]">Safe Withdraw % (4% Rule) <input type="range" min="3" max="6" step="0.25" value={withdrawRate} onChange={e => setWithdrawRate(+e.target.value)} className="range mt-1 w-full h-1 bg-white/10 rounded-full appearance-none" /><span className="text-[11px] font-bold text-amber-400">{withdrawRate}%</span></label>
                </div>
              </details>
            </div>
          </div>

          <div className="glass rounded-[20px] p-5">
            <h3 className="font-bold text-[11px] tracking-widest">YOUR FIRE JOURNEY CHART</h3>
            <div className="mt-4 flex items-end gap-1 h-[100px]">
              {result.chart.map((p, i) => {
                const max = result.chart[result.chart.length - 1].balance;
                const h = max > 0 ? (p.balance / max) * 100 : 0;
                return <div key={i} className="flex-1 bg-gradient-to-t from-amber-600 to-yellow-400 rounded-t" style={{ height: `${h}%` }} title={`${p.year}: ${currency}${(p.balance/100000).toFixed(1)}L`} />;
              })}
            </div>
            <div className="flex justify-between text-[9px] text-white/30 mt-1"><span>{age} yrs</span><span>{retireAge} yrs</span></div>
          </div>
        </div>

        {/* RIGHT RESULT */}
        <div className="space-y-4">
          <div className={`glass-strong rounded-[28px] p-7 float relative overflow-hidden ${result.isFire ? "fire-glow border-amber-500/40" : "border-red-500/20"}`}>
            <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 blur-[50px] rounded-full" />
            <p className="text-[11px] tracking-[0.2em] text-white/30 font-black">{result.isFire ? "🔥 YOU ARE FIRE READY!" : "⏳ NOT YET FIRE"}</p>
            <h2 className="text-[44px] font-black leading-none mt-2">{currency}{(result.fv/10000000).toFixed(2)} Cr<span className="text-[13px] text-white/30"> corpus</span></h2>
            <p className="text-[12px] mt-1 text-white/50">Real value (inflation adj): <b className="text-white">{currency}{(result.fvReal/10000000).toFixed(2)} Cr</b></p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="glass rounded-xl p-3"><p className="text-[10px] text-white/40">FIRE Number Needed</p><p className="font-bold mt-1">{currency}{(result.fireNumber/10000000).toFixed(2)} Cr</p><p className="text-[9px] text-white/30 mt-1">Expense at {retireAge}: {currency}{Math.round(result.annualExpenseAtRetire/12).toLocaleString()}/mo</p></div>
              <div className="glass rounded-xl p-3"><p className="text-[10px] text-white/40">Years to Retire</p><p className="font-bold mt-1 text-amber-400">{result.yearsToRetire} years</p><p className="text-[9px] text-white/30 mt-1">From {age} to {retireAge}</p></div>
              <div className={`glass rounded-xl p-3 ${result.isFire ? "bg-green-500/10 border-green-500/30" : "bg-red-500/10 border-red-500/20"}`}><p className="text-[10px] text-white/40">Status</p><p className={`font-black mt-1 ${result.isFire ? "text-green-400" : "text-red-400"}`}>{result.isFire ? "✅ FIRE Achieved" : `❌ Short: ${currency}${(result.shortfall/100000).toFixed(1)}L`}</p></div>
              <div className="glass rounded-xl p-3"><p className="text-[10px] text-white/40">Sustainability</p><p className="font-bold mt-1">{result.yearsCanSustain.toFixed(1)} yrs @ {withdrawRate}%</p></div>
            </div>

            <div className="mt-5">
              <div className="h-2 bg-white/10 rounded-full overflow-hidden flex">
                <div className={`h-full ${result.isFire ? "bg-green-500" : "bg-amber-500"}`} style={{ width: `${Math.min(100, (result.fv/result.fireNumber)*100)}%` }} />
              </div>
              <p className="text-[10px] text-white/40 mt-1">{Math.round((result.fv/result.fireNumber)*100)}% of FIRE goal reached</p>
            </div>

            <button onClick={() => { navigator.clipboard.writeText(`I will retire at ${retireAge} with ${currency}${(result.fv/10000000).toFixed(2)}Cr - FIRE Calc`); play("click"); }} onMouseEnter={() => play("hover")} className="w-full mt-5 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-black font-black hover:scale-[1.02] transition">Copy My FIRE Plan 🔥</button>
          </div>

          <div className="glass rounded-[20px] p-5">
            <h4 className="font-bold text-[11px] tracking-widest">HOW TO RETIRE 5 YEARS EARLY?</h4>
            <ul className="text-[12px] mt-3 space-y-1.5 text-white/60">
              <li>• Increase SIP to <b className="text-white">{currency}{monthlyInvest + 10000}</b> → Retire at {retireAge - 2}</li>
              <li>• Cut expense to {currency}{monthlyExpense - 10000} → FIRE number {currency}{((monthlyExpense-10000)*12*Math.pow(1+inflation/100, result.yearsToRetire)/(withdrawRate/100)/10000000).toFixed(2)}Cr only</li>
              <li>• 12% → 14% return = <b className="text-green-400">+{currency}{((currentSavings*Math.pow(1.14, result.yearsToRetire) - currentSavings*Math.pow(1.12, result.yearsToRetire))/100000).toFixed(0)}L extra</b></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="text-center text-[10px] tracking-[0.2em] text-white/20 pb-8">© LOREM PRO TOOL • FIRE CALC PRO MAX • 4% RULE • INFLATION ADJUSTED</div>
    </div>
  );
}
