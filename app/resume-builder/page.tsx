"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const playSound = (type: 'click' | 'success' | 'hover' | 'drag') => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    if(type==='click'){o.frequency.value=800; g.gain.setValueAtTime(0.1, ctx.currentTime); o.start(); o.stop(ctx.currentTime+0.08);}
    if(type==='hover'){o.frequency.value=1200; g.gain.setValueAtTime(0.03, ctx.currentTime); o.start(); o.stop(ctx.currentTime+0.04);}
    if(type==='success'){o.frequency.value=600; o.frequency.linearRampToValueAtTime(1200, ctx.currentTime+0.2); g.gain.setValueAtTime(0.15, ctx.currentTime); o.start(); o.stop(ctx.currentTime+0.3);}
    if(type==='drag'){o.frequency.value=400; g.gain.setValueAtTime(0.08, ctx.currentTime); o.start(); o.stop(ctx.currentTime+0.15);}
  } catch {}
};

export default function ResumeBuilderPro() {
  const [theme, setTheme] = useState<'light'|'dark'>('dark');
  const resumeRef = useRef<HTMLDivElement>(null);
  const [activeTemplate, setActiveTemplate] = useState(0);
  const [showATS, setShowATS] = useState(false);
  const [jobDesc, setJobDesc] = useState("");
  const [atsScore, setAtsScore] = useState(0);
  const [atsDetails, setAtsDetails] = useState<any>({});
  const [dragIndex, setDragIndex] = useState<number|null>(null);

  const [data, setData] = useState({
    name: "Ravish Kumar", title: "Full Stack Developer",
    email: "ravish@example.com", phone: "+91 98765 43210",
    location: "Lucknow, India", linkedin: "linkedin.com/in/ravish",
    summary: "Passionate Full Stack Developer with 3+ years building scalable web apps using Next.js and Cloudflare Workers. Built 20+ tools serving 100K+ users."
  });
  const [experiences, setExperiences] = useState([
    { id: 1, role: "Lead Developer", company: "Lorem Pro Tool", duration: "2023 - Present", desc: "Built 20+ viral tools with 100K+ users. Increased performance by 80% using Cloudflare Workers." },
    { id: 2, role: "Frontend Intern", company: "StartupXYZ", duration: "2022 - 2023", desc: "Developed React components and improved SEO score to 98." }
  ]);
  const [educations, setEducations] = useState([
    { id: 1, degree: "B.Tech CSE", college: "AKTU, Lucknow", year: "2020-2024 - 8.5 CGPA" }
  ]);
  const [skills, setSkills] = useState("Next.js, React, TypeScript, Tailwind, Cloudflare Workers, SEO, Supabase, Node.js");

  // REAL ATS ENGINE - JD MATCH
  const calculateRealATS = () => {
    const resumeText = (data.summary + " " + experiences.map(e=>e.role+" "+e.desc).join(" ") + " " + skills).toLowerCase();
    const jdWords = jobDesc.toLowerCase().split(/[^a-z0-9+.#]+/).filter(w=>w.length>2);
    const uniqueJD = Array.from(new Set(jdWords));
    const matched = uniqueJD.filter(w=> resumeText.includes(w));
    const missing = uniqueJD.filter(w=> !resumeText.includes(w)).slice(0, 12);
    
    let score = 0;
    if(data.email.includes('@')) score+=10;
    if(data.phone) score+=5;
    if(data.linkedin) score+=5;
    if(skills.split(',').length>=5) score+=15;
    if(data.summary.length>80) score+=15;
    if(experiences.length>0) score+=15;
    const jdScore = jobDesc ? Math.round((matched.length / Math.max(uniqueJD.length,1))*35) : 0;
    score+=jdScore;
    const finalScore = Math.min(score, 98);
    setAtsScore(finalScore);
    setAtsDetails({ matched: matched.length, total: uniqueJD.length, missing, jdScore });
    setShowATS(true);
    playSound('success');
  };

  const downloadPDF = async () => {
    if(!resumeRef.current) return;
    playSound('click');
    const canvas = await html2canvas(resumeRef.current, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
    const dataUrl = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p','mm','a4');
    pdf.addImage(dataUrl, 'PNG', 0, 0, 210, 297);
    pdf.save(`${data.name.replace(' ','_')}_Resume.pdf`);
  };

  const addExp = () => { setExperiences([...experiences, { id: Date.now(), role: "New Role", company: "Company", duration: "2024 - Present", desc: "Describe your achievement..." }]); playSound('click'); };
  const delExp = (id:number) => { setExperiences(experiences.filter(e=>e.id!==id)); playSound('click'); };
  const moveExp = (from:number, to:number) => {
    const arr = [...experiences]; const [item] = arr.splice(from,1); arr.splice(to,0,item); setExperiences(arr); playSound('drag');
  };

  useEffect(()=>{ document.documentElement.classList.toggle('dark', theme==='dark'); }, [theme]);

  return (
    <div className={`min-h-screen transition-colors duration-500 ${theme==='dark'?'bg-[#0a0a0f] text-white':'bg-[#f8fafc] text-zinc-900'}`}>
      <div className="sticky top-0 z-50 backdrop-blur-xl border-b border-white/10 px-4 md:px-8 py-4 flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center font-black">L</div><span className="font-bold">Resume Builder <span className="text-violet-400">PRO ATS</span></span></div>
        <div className="flex gap-2 flex-wrap">
          <button onMouseEnter={()=>playSound('hover')} onClick={()=>setTheme(theme==='dark'?'light':'dark')} className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-all hover:scale-105">{theme==='dark'?'🌙':'☀️'}</button>
          <button onMouseEnter={()=>playSound('hover')} onClick={calculateRealATS} className="px-5 py-2 rounded-full bg-gradient-to-r from-violet-600 to-blue-600 font-bold hover:shadow-[0_0_20px_rgba(124,58,237,0.5)] hover:scale-105 transition-all">ATS: {atsScore}%</button>
          <button onClick={downloadPDF} className="px-5 py-2 rounded-full bg-white text-black font-bold hover:scale-105 transition-all">Download PDF</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6 p-4 md:p-8 max-w-[1700px] mx-auto">
        {/* LEFT EDITOR */}
        <motion.div initial={{x:-20,opacity:0}} animate={{x:0,opacity:1}} className={`p-6 rounded-[24px] border space-y-6 ${theme==='dark'?'bg-zinc-900/50 border-white/10':'bg-white border-zinc-200'} shadow-2xl max-h-[90vh] overflow-y-auto`}>
          <div>
            <h2 className="font-black text-xl">Templates</h2>
            <div className="grid grid-cols-3 gap-2 mt-3">
              {['Minimal','Left Border','Serif','Two Tone','Photo','Compact'].map((t,i)=>(
                <button key={i} onClick={()=>{setActiveTemplate(i); playSound('click');}} className={`py-3 rounded-xl text-xs font-bold transition-all hover:scale-105 ${activeTemplate===i?'bg-violet-600 text-white shadow-lg':'bg-white/10'}`}>{t}</button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold">Personal Info</h3>
            {Object.keys(data).map(k=>(
              <div key={k}><label className="text-[10px] uppercase opacity-60">{k}</label><input value={(data as any)[k]} onChange={e=>setData({...data,[k]:e.target.value})} className={`w-full p-3 rounded-xl border outline-none focus:border-violet-500 focus:scale-[1.01] transition-all ${theme==='dark'?'bg-black/50 border-white/10':'bg-zinc-50 border-zinc-200'}`} /></div>
            ))}
          </div>

          <div className="space-y-3">
            <div className="flex justify-between"><h3 className="font-bold">Experience (Drag to Reorder)</h3><button onClick={addExp} className="text-xs px-3 py-1 rounded-full bg-violet-600 text-white font-bold hover:scale-105 transition-all">+ Add</button></div>
            {experiences.map((exp, idx)=>(
              <div key={exp.id} draggable onDragStart={()=>setDragIndex(idx)} onDragOver={e=>e.preventDefault()} onDrop={()=>{if(dragIndex!==null) moveExp(dragIndex, idx);}} onMouseEnter={()=>playSound('hover')} className="p-3 rounded-xl border border-white/10 bg-black/20 hover:bg-black/30 transition-all cursor-grab group">
                <div className="flex justify-between"><input value={exp.role} onChange={e=>{const arr=[...experiences]; arr[idx].role=e.target.value; setExperiences(arr);}} className="font-bold bg-transparent outline-none w-[40%]" /><button onClick={()=>delExp(exp.id)} className="opacity-0 group-hover:opacity-100 text-red-400 text-xs">Delete</button></div>
                <input value={exp.company+" | "+exp.duration} onChange={e=>{const parts=e.target.value.split('|'); const arr=[...experiences]; arr[idx].company=parts[0]||""; arr[idx].duration=parts[1]||""; setExperiences(arr);}} className="w-full text-xs opacity-70 bg-transparent outline-none mt-1" />
                <textarea value={exp.desc} onChange={e=>{const arr=[...experiences]; arr[idx].desc=e.target.value; setExperiences(arr);}} className="w-full mt-2 text-sm bg-transparent outline-none resize-none" rows={2} />
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <h3 className="font-bold">Skills (comma separated)</h3>
            <textarea value={skills} onChange={e=>setSkills(e.target.value)} className={`w-full p-3 rounded-xl border ${theme==='dark'?'bg-black/50 border-white/10':'bg-zinc-50'}`} rows={2} />
          </div>

          <div className="space-y-2 p-4 rounded-xl bg-violet-500/10 border border-violet-500/20">
            <h3 className="font-bold text-violet-400">Paste Job Description (Real ATS Check)</h3>
            <textarea value={jobDesc} onChange={e=>setJobDesc(e.target.value)} placeholder="Paste job description here to check match..." className="w-full p-3 rounded-xl bg-black/30 border border-white/10 text-sm" rows={4} />
            <p className="text-[11px] opacity-60">We will match your resume keywords with this JD.</p>
          </div>
        </motion.div>

        {/* RIGHT PREVIEW */}
        <motion.div initial={{x:20,opacity:0}} animate={{x:0,opacity:1}} className="lg:sticky lg:top-24 h-fit">
          <div ref={resumeRef} className={`p-8 md:p-10 rounded-[16px] bg-white text-zinc-900 shadow-[0_20px_60px_rgba(0,0,0,0.3)] min-h-[850px] transition-all ${activeTemplate===1?'border-l-[12px] border-violet-600': activeTemplate===2?'font-serif': activeTemplate===3?'bg-gradient-to-br from-white to-violet-50': activeTemplate===4?'border-t-[8px] border-black': activeTemplate===5?'p-6 text-[13px] leading-tight':''}`}>
            <div className={activeTemplate===4?'flex gap-6':''}>
              {activeTemplate===4 && <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center text-white font-black text-3xl">{data.name[0]}</div>}
              <div className="flex-1"><h1 className="text-3xl font-black tracking-tight">{data.name}</h1><p className="text-violet-600 font-bold mt-1">{data.title}</p><p className="text-xs opacity-60 mt-2">{data.email} • {data.phone} • {data.location} • {data.linkedin}</p></div>
            </div>
            <div className="mt-6 h-[2px] bg-gradient-to-r from-violet-600 to-transparent" />
            <div className="mt-6"><h3 className="font-black tracking-[0.2em] text-[11px] opacity-50">SUMMARY</h3><p className="mt-2 leading-relaxed">{data.summary}</p></div>
            <div className="mt-6"><h3 className="font-black tracking-[0.2em] text-[11px] opacity-50">EXPERIENCE</h3>{experiences.map(e=><div key={e.id} className="mt-3"><p className="font-bold">{e.role} <span className="opacity-60 font-normal">— {e.company}</span></p><p className="text-xs opacity-60">{e.duration}</p><p className="mt-1 text-sm leading-relaxed">{e.desc}</p></div>)}</div>
            <div className="mt-6"><h3 className="font-black tracking-[0.2em] text-[11px] opacity-50">EDUCATION</h3>{educations.map(e=><p key={e.id} className="mt-2 text-sm">{e.degree} - {e.college} ({e.year})</p>)}</div>
            <div className="mt-6"><h3 className="font-black tracking-[0.2em] text-[11px] opacity-50">SKILLS</h3><p className="mt-2 text-sm">{skills}</p></div>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>{showATS && (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md flex items-center justify-center p-4" onClick={()=>setShowATS(false)}>
          <motion.div initial={{scale:0.9,y:20}} animate={{scale:1,y:0}} className="bg-zinc-900 border border-white/10 p-8 rounded-[32px] max-w-lg w-full" onClick={e=>e.stopPropagation()}>
            <div className="text-center"><div className="text-7xl font-black bg-gradient-to-br from-violet-400 to-blue-400 bg-clip-text text-transparent">{atsScore}%</div><p className="opacity-60">Real ATS Score</p>
              <div className="mt-6 grid grid-cols-2 gap-3 text-left text-xs">
                <div className="p-3 rounded-xl bg-white/5">Matched Keywords: <b className="text-green-400">{atsDetails.matched}/{atsDetails.total}</b></div>
                <div className="p-3 rounded-xl bg-white/5">JD Score: <b className="text-violet-400">{atsDetails.jdScore}/35</b></div>
              </div>
              {atsDetails.missing?.length>0 && <div className="mt-4 text-left"><p className="text-xs font-bold opacity-60">MISSING KEYWORDS (Add these):</p><div className="flex flex-wrap gap-2 mt-2">{atsDetails.missing.map((w:string)=><span key={w} className="px-2 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-[11px]">{w}</span>)}</div></div>}
              <button onClick={()=>setShowATS(false)} className="mt-6 w-full py-3 rounded-full bg-white text-black font-bold">Close</button>
            </div>
          </motion.div>
        </motion.div>
      )}</AnimatePresence>
    </div>
  );
}
