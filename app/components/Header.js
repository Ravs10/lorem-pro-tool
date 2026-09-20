"use client";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function Header(){
  const [open,setOpen]=useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const isTools = pathname === "/tools";

  const go = (url) => {
    setOpen(false);
    setTimeout(()=>router.push(url), 10);
  };

  return (
    <header style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 20px",position:"sticky",top:0,background:"white",zIndex:50,borderBottom:"1px solid #eee"}}>
      <div style={{fontWeight:800,fontSize:"18px",cursor:"pointer"}} onClick={()=>go("/")}>Lorem Pro</div>
      
      <div style={{display:"flex",gap:"10px",alignItems:"center"}}>
        <button onClick={()=>go(isTools?"/":"/tools")} style={{padding:"6px 12px",borderRadius:"8px",background:"black",color:"white",border:"none",cursor:"pointer"}}>
          {isTools?"← Back":"✨ All Tools"}
        </button>
        
        <button onClick={()=>setOpen(o=>!o)} style={{fontSize:"22px",background:"none",border:"none",cursor:"pointer"}}>☰</button>
      </div>

      {open && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",zIndex:60}} onClick={()=>setOpen(false)}>
          <div style={{position:"absolute",right:0,top:0,width:"260px",height:"100%",background:"white",padding:"20px",display:"flex",flexDirection:"column",gap:"12px"}} onClick={e=>e.stopPropagation()}>
            <button onClick={()=>setOpen(false)} style={{alignSelf:"flex-end",fontSize:"20px",background:"none",border:"none"}}>✕</button>
            <button onClick={()=>go("/")} style={{textAlign:"left",padding:"10px",border:"none",background:"#f5f5f5",borderRadius:"8px"}}>🏠 Generator</button>
            <button onClick={()=>{setOpen(false); window.scrollTo(0,0);}} style={{textAlign:"left",padding:"10px",border:"none",background:"#f5f5f5",borderRadius:"8px"}}>📖 How to Use</button>
            <button onClick={()=>go("/")} style={{textAlign:"left",padding:"10px",border:"none",background:"#f5f5f5",borderRadius:"8px"}}>📞 Contact</button>
          </div>
        </div>
      )}
    </header>
  );
}
