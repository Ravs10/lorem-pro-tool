"use client";
import { usePathname, useRouter } from "next/navigation";

export default function Header(){
  const pathname = usePathname();
  const router = useRouter();
  const isToolsPage = pathname === "/tools";

  const handleClick = () => {
    if (isToolsPage) {
      router.push("/");
    } else {
      router.push("/tools");
    }
  };

  return (
    <header style={{display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 20px"}}>
      <div style={{fontWeight:"800", fontSize:"18px"}}>Lorem Pro</div>
      <button onClick={handleClick} style={{padding:"6px 12px", borderRadius:"8px", background:"black", color:"white", border:"none", cursor:"pointer"}}>
        {isToolsPage ? "← Back" : "✨ All Tools"}
      </button>
    </header>
  );
}
