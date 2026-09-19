"use client";
import { usePathname, useRouter } from "next/navigation";

export default function Header({ onCloseMenu }) {
  const pathname = usePathname();
  const router = useRouter();
  const isToolsPage = pathname === "/tools";

  const handleClick = () => {
    if (isToolsPage) {
      router.push("/");
      if (onCloseMenu) onCloseMenu();
    } else {
      router.push("/tools");
    }
  };

  return (
    <header style={{display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 20px", background:"#fff", borderBottom:"1px solid #eee"}}>
      <div style={{fontWeight:"800", fontSize:"20px"}}>Lorem Pro Tool</div>
      <button onClick={handleClick} style={{padding:"10px 18px", borderRadius:"25px", border:"none", background:"linear-gradient(90deg, #FFD60A, #FF8C00)", color:"#000", fontWeight:"800", cursor:"pointer", boxShadow:"0 2px 8px rgba(0,0,0,0.15)"}}>
        {isToolsPage ? "← Back" : "✨ All Tools"}
      </button>
    </header>
  );
}
