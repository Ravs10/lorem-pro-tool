import Link from "next/link";

export default function Header(){
  return(
    <>
      <style>{`
        @keyframes pulse-glow {
          0% { box-shadow: 0 0 0 0 rgba(255,255,255,0.7); transform: scale(1); }
          70% { box-shadow: 0 0 0 10px rgba(255,255,255,0); transform: scale(1.05); }
          100% { box-shadow: 0 0 0 0 rgba(255,255,255,0); transform: scale(1); }
        }
        @keyframes shine {
          0% { left: -100%; }
          100% { left: 100%; }
        }
      `}</style>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 0"}}>
        <Link href="/" style={{textDecoration:"none", color:"#fff", fontWeight:"900", fontSize:"20px", letterSpacing:"-0.5px"}}>LOREM PRO</Link>
        
        <Link href="/tools" style={{
          background:"#fff", 
          color:"#000", 
          padding:"8px 16px", 
          borderRadius:"20px", 
          textDecoration:"none", 
          fontWeight:"800", 
          fontSize:"13px",
          position:"relative",
          overflow:"hidden",
          animation:"pulse-glow 2s infinite",
          display:"flex",
          alignItems:"center",
          gap:"5px"
        }}>
          <span style={{
            position:"absolute",
            top:0,
            left:"-100%",
            width:"100%",
            height:"100%",
            background:"linear-gradient(120deg, transparent, rgba(99,102,241,0.4), transparent)",
            animation:"shine 2.5s infinite"
          }}></span>
          🚀 All Tools
        </Link>
      </div>
    </>
  )
}
