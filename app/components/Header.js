"use client";
import { usePathname, useRouter } from "next/navigation";

export default function Header(){
  const pathname = usePathname();
  const router = useRouter();
  const isTools = pathname === "/tools";

  return (
    <header style={{display:"flex",justifyContent:"flex-end",alignItems:"center",padding:"12px 16px",position:"sticky",top:0,background:"white",zIndex:50,borderBottom:"1px solid #eee"}}>
      <button onClick={()=>router.push(isTools?"/":"/tools")} style={{padding:"8px 16px",borderRadius:"999px",background:"black",color:"white",border:"none",cursor:"pointer",fontWeight:600}}>
        {isTools?"← Back":"✨ All Tools"}
      </button>
    </header>
  );
}
