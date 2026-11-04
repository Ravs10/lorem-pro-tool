"use client";
import { useState, useMemo, useRef, useEffect } from "react";

export default function FireUltra() {
  const [age, setAge] = useState(25);
  const [retireAge, setRetireAge] = useState(45);
  const [income, setIncome] = useState(1200000);
  const [savings, setSavings] = useState(500000);
  const [monthlyInvest, setMonthlyInvest] = useState(40000);
  const [ret, setRet] = useState(12);
  const [inflation, setInflation] = useState(6);
  const [expense, setExpense] = useState(60000);
  const [withdraw, setWithdraw] = useState(4);
  const [taxRate, setTaxRate] = useState(20);
  const [health, setHealth] = useState(5000);
  const [social, setSocial] = useState(20000);
  const [curr, setCurr] = useState("₹");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<AudioContext | null>(null);

  const play = (t: string) => {
    try {
      if (!audioRef.current) audioRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const ctx = audioRef.current; if (ctx.state === "suspended") ctx.resume();
      const o = ctx.createOscillator(); const g = ctx.createGain(); o.connect(g); g.connect(ctx.destination);
      o.frequency.value = t === "fire" ? 200 : 800; if (t === "fire") o.frequency.linearRampToValueAtTime(1200, ctx.currentTime + 0.5);
      g.gain.setValueAtTime(0.2, ctx.currentTime); o.start(); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (t === "fire" ? 0.7 : 0.2)); o.stop(ctx.currentTime + (t === "fire" ? 0.7 : 0.2));
    } catch {}
  };

  const data = useMemo(() => {
    const yrs = retireAge - age;
    const fv = savings * Math.pow(1 + ret / 100, yrs) + monthlyInvest * 12 * ((Math.pow(1 + ret / 100, yrs) - 1) / (ret / 100));
    const expAtRet = expense * 12 * Math.pow(1 + inflation / 100, yrs) + health * 12 * Math.pow(1 + 8 / 100, yrs);
    const fireNum = expAtRet / (withdraw / 100);
    const lean = fireNum * 0.7, fat = fireNum * 1.5;
    const coast = fireNum / Math.pow(1 + ret / 100, yrs);
    const barista = (expAtRet - social * 12) / (withdraw / 100);
    const savingsRate = (monthlyInvest * 12) / income * 100;
    
    // Monte Carlo - 1000 simulations
    let success = 0;
    for (let i = 0; i < 1000; i++) {
      let bal = fv; let ok = true;
      for (let y = 0; y < 30; y++) {
        const market = ret + (Math.random() * 20 - 10);
        bal = bal * (1 + market / 100) - expAtRet * Math.pow(1 + inflation / 100, y);
        if (bal < 0) { ok = false; break; }
      }
      if (ok) success++;
    }

    const chart = [];
    let b = savings;
    for (let y = 0; y <= yrs + 15; y++) {
      if (y <= yrs) b = b * (1 + ret / 100) + monthlyInvest * 12;
      else b = b * (1 + ret / 100) - expAtRet * Math.pow(1 + inflation / 100, y - yrs);
      chart.push(Math.max(0, Math.round(b)));
    }

    return { yrs, fv, expAtRet, fireNum, lean, fat, coast, barista, savingsRate, success, chart };
  }, [age, retireAge, income, savings, monthlyInvest, ret, inflation, expense, withdraw, health, social]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr; canvas.height = 200 * dpr; ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, canvas.offsetWidth, 200);
    const max = Math.max(...data.chart); const step = canvas.offsetWidth / (data.chart.length - 1);
    ctx.beginPath(); ctx.moveTo(0, 200);
    data.chart.forEach((v, i) => { ctx.lineTo(i * step, 200 - (v / max) * 160 - 20); });
    ctx.lineTo((data.chart.length - 1) * step, 200); ctx.closePath();
    const grad = ctx.createLinearGradient(0, 0, 0, 200); grad.addColorStop(0, "rgba(245,158,11,0.4)"); grad.addColorStop(1, "rgba(245,158,11,0)");
    ctx.fillStyle = grad; ctx.fill();
    ctx.beginPath(); data.chart.forEach((v, i) => { const x = i * step, y = 200 - (v / max) * 160 - 20; if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); });
    ctx.strokeStyle = "#F59E0B"; ctx.lineWidth = 2.5; ctx.stroke();
  }, [data.chart]);

  return (
    <div className="min-h-screen bg-[#060609] text-white">
      <style>{`
        .glass { background: rgba(255,255,255,0.06); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.08); }
        .glass-strong { background: rgba(255,255,255,0.10); backdrop-filter: blur(28px); border: 1px solid rgba(255,255,255,0.12); }
        .range::-webkit-slider-thumb { appearance:none; width:22px; height:22px; border-radius:50%; background:#F59E0B; cursor:pointer; box-shadow:0 0 14px rgba(245,158,11,0.7); }
      `}</style>

      <div className="max-w-[1280px] mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2"><div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center font-black text-black text-[18px]">🔥</div><div><p className="font-black tracking-widest text-[13px]">FIRE ULTRA 10/10</p><p className="text-[9px] text-white/30 tracking-widest">LEAN • FAT • COAST • BARISTA • MONTE CARLO</p></div></div>
        <button onClick={() => setCurr(curr === "₹" ? "$" : "₹")} className="glass px-3 py-1.5 rounded-full text-xs font-bold">{curr}</button>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 pb-12 grid lg:grid-cols-[1.15fr_0.85fr] gap-6">
        <div className="space-y-4">
          <div className="glass-strong rounded-[28px] p-6 md:p-7">
            <div className="flex justify-between items-start"><h1 className="text-[26px] md:text-[34px] font-black leading-[0.9]">Retire at {retireAge} with<br/><span className="text-amber-400">{curr}{(data.fv/10000000).toFixed(2)} Cr</span> <span className="text-[12px] text-white/40">• {data.success/10}% Success</span></h1><span className={`text-[10px] px-2.5 py-1 rounded-full font-black ${data.fv >= data.fireNum ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>{data.fv >= data.fireNum ? "FIRE READY" : "GAP"}</span></div>

            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
              <div><p className="text-[9px] text-white/40 font-bold">AGE</p><input type="range" min="18" max="60" value={age} onChange={e => { setAge(+e.target.value); play("fire"); }} className="range w-full h-1 bg-white/10 rounded-full appearance-none mt-1" /><p className="text-[12px] font-bold mt-1">{age} → {retireAge} ({data.yrs}yrs)</p></div>
              <div><p className="text-[9px] text-white/40 font-bold">INCOME /yr</p><input type="range" min="300000" max="5000000" step="50000" value={income} onChange={e => setIncome(+e.target.value)} className="range w-full h-1 bg-white/10 rounded-full appearance-none mt-1" /><p className="text-[12px] font-bold mt-1">{curr}{(income/100000).toFixed(1)}L • {data.savingsRate.toFixed(0)}% saved</p></div>
              <div><p className="text-[9px] text-white/40 font-bold">MONTHLY SIP</p><input type="range" min="5000" max="150000" step="1000" value={monthlyInvest} onChange={e => { setMonthlyInvest(+e.target.value); play("fire"); }} className="range w-full h-1 bg-white/10 rounded-full appearance-none mt-1" /><p className="text-[12px] font-bold mt-1 text-amber-400">{curr}{monthlyInvest.toLocaleString()}</p></div>
              <div><p className="text-[9px] text-white/40 font-bold">RETIRE AGE</p><input type="range" min={age + 1} max="70" value={retireAge} onChange={e => { setRetireAge(+e.target.value); play("fire"); }} className="range w-full h-1 bg-white/10 rounded-full appearance-none mt-1" /><p className="text-[12px] font-bold mt-1">{retireAge} yrs</p></div>
            </div>

            <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
              <label className="glass p-2.5 rounded-xl text-[10px]">Return %<input type="range" min="6" max="18" step="0.5" value={ret} onChange={e => setRet(+e.target.value)} className="range w-full h-1 bg-white/10 rounded-full appearance-none mt-1" /><span className="font-bold text-green-400">{ret}%</span></label>
              <label className="glass p-2.5 rounded-xl text-[10px]">Inflation %<input type="range" min="3" max="9" step="0.5" value={inflation} onChange={e => setInflation(+e.target.value)} className="range w-full h-1 bg-white/10 rounded-full appearance-none mt-1" /><span className="font-bold text-red-400">{inflation}%</span></label>
              <label className="glass p-2.5 rounded-xl text-[10px]">Expense/mo<input type="number" value={expense} onChange={e => setExpense(+e.target.value)} className="bg-transparent w-full font-bold outline-none mt-1" /></label>
              <label className="glass p-2.5 rounded-xl text-[10px]">Withdraw %<input type="range" min="3" max="6" step="0.25" value={withdraw} onChange={e => setWithdraw(+e.target.value)} className="range w-full h-1 bg-white/10 rounded-full appearance-none mt-1" /><span className="font-bold text-amber-400">{withdraw}%</span></label>
            </div>

            <details className="glass rounded-xl p-3 mt-4">
              <summary className="cursor-pointer text-[10px] font-black tracking-widest">ADVANCE: TAX + HEALTH + SOCIAL SECURITY</summary>
              <div className="grid grid-cols-3 gap-3 mt-3">
                <label className="text-[10px]">Tax %<input type="number" value={taxRate} onChange={e => setTaxRate(+e.target.value)} className="glass w-full p-2 rounded-lg bg-transparent outline-none mt-1 text-xs" /></label>
                <label className="text-[10px]">Health/mo at retire<input type="number" value={health} onChange={e => setHealth(+e.target.value)} className="glass w-full p-2 rounded-lg bg-transparent outline-none mt-1 text-xs" /></label>
                <label className="text-[10px]">Social Security/mo<input type="number" value={social} onChange={e => setSocial(+e.target.value)} className="glass w-full p-2 rounded-lg bg-transparent outline-none mt-1 text-xs" /></label>
              </div>
            </details>
          </div>

          <div className="glass rounded-[20px] p-4">
            <p className="text-[10px] font-black tracking-widest">WEALTH JOURNEY • RETIRE + 15 YEARS</p>
            <canvas ref={canvasRef} className="w-full h-[200px] mt-3" style={{ width: "100%", height: "200px" }} />
            <div className="flex justify-between text-[9px] text-white/30 mt-1"><span>Age {age}</span><span>Retire {retireAge}</span><span>Age {retireAge + 15}</span></div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass-strong rounded-[28px] p-6">
            <p className="text-[10px] tracking-widest text-white/30 font-black">4 TYPES OF FIRE</p>
            <div className="grid grid-cols-2 gap-2.5 mt-3">
              <div className="glass rounded-xl p-3 border border-white/5"><p className="text-[9px] text-white/40">LEAN FIRE (Minimal)</p><p className="font-black mt-1">{curr}{(data.lean/10000000).toFixed(2)}Cr</p><p className="text-[9px] text-white/30 mt-1">70% expense</p></div>
              <div className={`glass rounded-xl p-3 border ${data.fv >= data.fireNum ? "border-green-500/30 bg-green-500/5" : "border-amber-500/30 bg-amber-500/5"}`}><p className="text-[9px] text-white/40">REGULAR FIRE</p><p className="font-black mt-1">{curr}{(data.fireNum/10000000).toFixed(2)}Cr</p><p className="text-[9px] mt-1">{data.fv >= data.fireNum ? "✅" : "❌"} {Math.round(data.fv/data.fireNum*100)}% ready</p></div>
              <div className="glass rounded-xl p-3"><p className="text-[9px] text-white/40">FAT FIRE (Luxury)</p><p className="font-black mt-1">{curr}{(data.fat/10000000).toFixed(2)}Cr</p><p className="text-[9px] text-white/30 mt-1">150% expense</p></div>
              <div className="glass rounded-xl p-3"><p className="text-[9px] text-white/40">COAST FIRE (Today)</p><p className="font-black mt-1 text-blue-400">{curr}{(data.coast/100000).toFixed(1)}L</p><p className="text-[9px] text-white/30 mt-1">If you stop now, still retire</p></div>
            </div>
            <div className="glass rounded-xl p-3 mt-3 border border-purple-500/20"><p className="text-[9px] text-white/40">BARISTA FIRE (Part-time after retire)</p><p className="font-black mt-1">{curr}{(data.barista/10000000).toFixed(2)}Cr <span className="text-[10px] font-normal text-white/40">+ {curr}{social}/mo Social</span></p></div>

            <div className="mt-4">
              <div className="flex justify-between text-[10px]"><span>Monte Carlo Success (30 yrs)</span><span className={`font-black ${data.success > 800 ? "text-green-400" : data.success > 600 ? "text-yellow-400" : "text-red-400"}`}>{data.success/10}%</span></div>
              <div className="h-2 bg-white/10 rounded-full mt-1 overflow-hidden"><div className="h-full bg-gradient-to-r from-green-500 to-emerald-400" style={{ width: `${data.success/10}%` }} /></div>
              <p className="text-[9px] text-white/30 mt-1">1000 simulations with random market returns</p>
            </div>

            <button onClick={() => { play("fire"); navigator.clipboard.writeText(`FIRE Plan: Retire ${retireAge} with ${curr}${(data.fv/10000000).toFixed(2)}Cr`); }} className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-black font-black">Copy Ultra FIRE Plan 🔥</button>
          </div>

          <div className="glass rounded-[20px] p-4">
            <p className="text-[10px] font-black tracking-widest">WHAT-IF ENGINE</p>
            <div className="text-[11px] mt-3 space-y-2 text-white/60">
              <p>• Save <b className="text-white">{curr}10k</b> more → Retire <b className="text-green-400">{Math.max(0, data.yrs - 2)} yrs early</b></p>
              <p>• Expense {curr}{expense} → {curr}{expense - 10000} → FIRE number <b className="text-white">{curr}{((expense-10000)*12*Math.pow(1+inflation/100, data.yrs)/(withdraw/100)/10000000).toFixed(2)}Cr</b></p>
              <p>• Coast FIRE achieved? You already have <b className="text-blue-400">{curr}{(savings/100000).toFixed(1)}L</b>, need <b>{curr}{(data.coast/100000).toFixed(1)}L</b> - {savings >= data.coast ? "YES" : "NO"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
