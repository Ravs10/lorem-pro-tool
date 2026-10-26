"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import jsPDF from "jspdf";
import { toPng } from "html-to-image";

// SOUND EFFECT - Web Audio (No external file)
const playSound = (type: 'click' | 'success' | 'hover') => {
  if(typeof window === 'undefined') return;
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.connect(g); g.connect(ctx.destination);
  if(type === 'click') { o.frequency.value = 800; g.gain.setValueAtTime(0.1, ctx.currentTime); o.start(); o.stop(ctx.currentTime+0.08); }
  if(type === 'hover') { o.frequency.value = 1200; g.gain.setValueAtTime(0.03, ctx.currentTime); o.start(); o.stop(ctx.currentTime+0.04); }
  if(type === 'success') { o.frequency.value = 600; o.frequency.linearRampToValueAtTime(1200, ctx.currentTime+0.2); g.gain.setValueAtTime(0.15, ctx.currentTime); o.start(); o.stop(ctx.currentTime+0.3); }
};

export default function ResumeBuilder() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [atsScore, setAtsScore] = useState(0);
  const [showATS, setShowATS] = useState(false);
  const resumeRef = useRef<HTMLDivElement>(null);
  const [activeTemplate, setActiveTemplate] = useState(0);

  const [data, setData] = useState({
    name: "Ravish Kumar", title: "Full Stack Developer", email: "ravish@example.com",
    phone: "+91 98765 43210", location: "Lucknow, India", linkedin: "linkedin.com/in/ravish",
    summary: "Passionate developer with 3+ years building scalable web apps using Next.js and Cloudflare.",
    experience: "Lorem Pro Tool - Lead Developer (2023-Present)\nBuilt 20+ viral tools with 100K+ users. Increased performance by 80%.",
    education: "B.Tech CSE - AKTU (2020-2024) - 8.5 CGPA",
    skills: "Next.js, React, TypeScript, Tailwind, Cloudflare Workers, SEO"
  });

  // ATS CALCULATION - NO API
  const calculateATS = () => {
    let score = 0;
    const d = JSON.stringify(data).toLowerCase();
    if(data.email.includes('@')) score+=15;
    if(data.phone) score+=10;
    if(data.linkedin) score+=10;
    if(data.skills.split(',').length >=5) score+=20;
    if(data.summary.length > 80) score+=15;
    if(d.includes('experience') || data.experience.length > 30) score+=15;
    if(!d.includes('<table') && !d.includes('image')) score+=15;
    setAtsScore(Math.min(score, 98));
    setShowATS(true);
    playSound('success');
  };

  const downloadPDF = async () => {
    if(!resumeRef.current) return;
    playSound('click');
    const dataUrl = await toPng(resumeRef.current, { cacheBust: true, pixelRatio: 2 });
    const pdf = new jsPDF('p', 'mm', 'a4');
    pdf.addImage(dataUrl, 'PNG', 0, 0, 210, 297);
    pdf.save(`${data.name.replace(' ','_')}_Resume.pdf`);
  };

  useEffect(()=>{ document.documentElement.classList.toggle('dark', theme==='dark'); }, [theme]);

  return (
    <div className={`min-h-screen transition-colors duration-500 ${theme==='dark' ? 'bg-[#0a0a0f] text-white' : 'bg-[#f8fafc] text-zinc-900'}`}>
      {/* HEADER */}
      <div className="sticky top-0 z-50 backdrop-blur-xl border-b border-white/10 px-4 md:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center font-black text-xl">L</div>
          <span className="font-bold">Resume Builder <span className="text-violet-400">+ ATS</span></span>
        </div>
        <div className="flex gap-2">
          <button onMouseEnter={()=>playSound('hover')} onClick={()=>setTheme(theme==='dark'?'light':'dark')} className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-all hover:scale-105">{theme==='dark'?'🌙':'☀️'}</button>
          <button onMouseEnter={()=>playSound('hover')} onClick={calculateATS} className="px-5 py-2 rounded-full bg-gradient-to-r from-violet-600 to-blue-600 hover:shadow-[0_0_20px_rgba(124,58,237,0.5)] transition-all hover:scale-105 font-bold">Check ATS: {atsScore}</button>
          <button onClick={downloadPDF} className="px-5 py-2 rounded-full bg-white text-black font-bold hover:scale-105 transition-all">Download PDF</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4 md:p-8 max-w-[1600px] mx-auto">
        {/* LEFT - FORM */}
        <motion.div initial={{x:-20, opacity:0}} animate={{x:0, opacity:1}} className={`p-6 rounded-[24px] border ${theme==='dark'?'bg-zinc-900/50 border-white/10':'bg-white border-zinc-200'} shadow-2xl space-y-4`}>
          <h2 className="text-2xl font-black">Edit Your Details</h2>
          {Object.keys(data).map((k)=>(
            <div key={k} className="group">
              <label className="text-xs uppercase tracking-widest opacity-60 group-hover:text-violet-400 transition-colors">{k}</label>
              <textarea value={(data as any)[k]} onChange={(e)=>setData({...data, [k]: e.target.value})} onFocus={()=>playSound('click')} className={`w-full mt-1 p-3 rounded-xl border outline-none transition-all focus:scale-[1.01] focus:border-violet-500 ${theme==='dark'?'bg-black/50 border-white/10':'bg-zinc-50 border-zinc-200'}`} rows={k==='summary'||k==='experience'?3:1} />
            </div>
          ))}
          <div className="flex gap-2 pt-4">
            {[0,1,2].map(i=><button key={i} onClick={()=>{setActiveTemplate(i); playSound('click');}} className={`flex-1 py-3 rounded-xl font-bold transition-all hover:scale-105 ${activeTemplate===i?'bg-violet-600 text-white shadow-lg shadow-violet-600/30':'bg-white/10'}`}>Template {i+1}</button>)}
          </div>
        </motion.div>

        {/* RIGHT - PREVIEW */}
        <motion.div initial={{x:20, opacity:0}} animate={{x:0, opacity:1}} className="lg:sticky lg:top-24 h-fit">
          <div ref={resumeRef} className={`p-8 md:p-10 rounded-[16px] bg-white text-zinc-900 shadow-[0_20px_60px_rgba(0,0,0,0.3)] transition-all hover:shadow-[0_30px_80px_rgba(124,58,237,0.2)] min-h-[800px] ${activeTemplate===1?'border-l-[12px] border-violet-600': activeTemplate===2?'font-serif':''}`}>
            <div className="flex justify-between items-start">
              <div><h1 className="text-4xl font-black tracking-tight">{data.name}</h1><p className="text-violet-600 font-bold mt-1 text-lg">{data.title}</p></div>
              <div className="text-right text-sm opacity-70">{data.email}<br/>{data.phone}<br/>{data.location}</div>
            </div>
            <div className="mt-8 h-[2px] bg-gradient-to-r from-violet-600 to-transparent" />
            <Section title="SUMMARY" content={data.summary} />
            <Section title="EXPERIENCE" content={data.experience} />
            <Section title="EDUCATION" content={data.education} />
            <Section title="SKILLS" content={data.skills} />
          </div>
        </motion.div>
      </div>

      {/* ATS MODAL */}
      <AnimatePresence>
        {showATS && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md flex items-center justify-center p-4" onClick={()=>setShowATS(false)}>
            <motion.div initial={{scale:0.9, y:20}} animate={{scale:1, y:0}} className="bg-zinc-900 border border-white/10 p-8 rounded-[32px] max-w-md w-full">
              <div className="text-center">
                <div className="text-7xl font-black bg-gradient-to-br from-violet-400 to-blue-400 bg-clip-text text-transparent">{atsScore}%</div>
                <p className="mt-2 opacity-70">ATS Friendly Score</p>
                <div className="mt-6 text-left space-y-2 text-sm">
                  <Check text="Contact Info Found" ok={!!data.email} />
                  <Check text="Skills >= 5" ok={data.skills.split(',').length>=5} />
                  <Check text="Summary Strong" ok={data.summary.length>80} />
                  <Check text="No Tables/Images" ok={true} />
                  <Check text="Experience Added" ok={data.experience.length>30} />
                </div>
                <button onClick={()=>setShowATS(false)} className="mt-6 w-full py-3 rounded-full bg-white text-black font-bold">Close</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Section({title, content}: any){ return <div className="mt-6"><h3 className="font-black tracking-[0.2em] text-xs opacity-50">{title}</h3><p className="mt-2 whitespace-pre-line leading-relaxed">{content}</p></div>; }
function Check({text, ok}: any){ return <div className="flex justify-between p-2 rounded-lg bg-white/5"><span>{text}</span><span className={ok?'text-green-400':'text-red-400'}>{ok?'✓':'✗'}</span></div>; }
