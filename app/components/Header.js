"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header({ onCloseMenu }: { onCloseMenu?: () => void }){
  const path = usePathname();
  const isToolsPage = path === "/tools";

  return(
    <>
      <style>{`
        @keyframes pulse-color {
          0% { box-shadow: 0 0 0 0 rgba(255,154,0,0.7); transform: scale(1); }
          70% { box-shadow: 0 0 0 12px rgba(255,154,0,0); transform: scale(1.05); }
          100% { box-shadow: 0 0 0 0 rgba(255,154,0,0); transform: scale(1); }
        }
        @keyframes shine {
          0% { left: -100%; }
          100% { left: 200%; }
        }
      `}</style>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 0"}}>
        <Link href="/" onClick={onCloseMenu} style={{textDecoration:"none", color:"#fff", fontWeight:"900", fontSize:"20px"}}>LOREM PRO</Link>
        
        <Link href={isToolsPage ? "/" : "/tools"} onClick={onCloseMenu} style={{
          background:"linear-gradient(135deg, #FFD60A, #FF7A00)",
          color:"#000", 
          padding:"9px 18px", 
          borderRadius:"24px", 
          textDecoration:"none", 
          fontWeight:"900", 
          fontSize:"13px",
          position:"relative",
          overflow:"hidden",
          animation:"pulse-color 1.8s infinite",
          border:"2px solid #fff",
          display:"flex",
          alignItems:"center",
          gap:"4px"
        }}>
          <span style={{
            position:"absolute", top:0, left:"-100%", width:"60%", height:"100%",
            background:"linear-gradient(120deg, transparent, rgba(255,255,255,0.8), transparent)",
            animation:"shine 2s infinite"
          }}></span>
          {isToolsPage ? "← Back" : "🚀 All Tools"}
        </Link>
      </div>
    </>
  )
}
