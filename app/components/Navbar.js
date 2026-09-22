"use client";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

export default function Navbar(){
  const pathname = usePathname();
  const router = useRouter();
  const isTools = pathname === "/tools" || pathname.startsWith("/tools/");

  return (
    <header style={{position:"sticky",top:0,zIndex:50,background:"black",color:"white"}}>
      <div style={{maxWidth:"1280px",margin:"0 auto",padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <Link href="/" style={{fontWeight:"bold",fontSize:"20px",color:"white",textDecoration:"none"}}>
          ⚡ Lorem Pro Tool
        </Link>
        <button 
          onClick={()=> router.push(isTools ? "/" : "/tools")}
          style={{background:"white",color:"black",padding:"8px 20px",borderRadius:"20px",border:"none",fontWeight:"bold",fontSize:"14px",cursor:"pointer"}}
        >
          {isTools ? "← Back" : "✨ All Tools"}
        </button>
      </div>
    </header>
  );
}
