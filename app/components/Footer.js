
import Link from "next/link";

export default function Footer(){
  return (
    <footer style={{background:"#111",color:"#aaa",padding:"40px 16px",marginTop:"50px",textAlign:"center"}}>
      <div style={{display:"flex",justifyContent:"center",gap:"20px",flexWrap:"wrap",marginBottom:"15px"}}>
        <Link href="/about" style={{color:"white",textDecoration:"none"}}>About</Link>
        <Link href="/contact" style={{color:"white",textDecoration:"none"}}>Contact</Link>
        <Link href="/privacy" style={{color:"white",textDecoration:"none"}}>Privacy Policy</Link>
        <Link href="/disclaimer" style={{color:"white",textDecoration:"none"}}>Disclaimer</Link>
        //<Link href="/blog" style={{color:"white",textDecoration:"none"}}>Blog</Link>
    // <Link href="/blog" style={{color:"#ff9900", fontWeight:"800", background:"rgba(255,153,0,0.15)", padding:"5px 14px", borderRadius:"20px", textDecoration:"none"}}>Blog 🔥</Link>
 <Link href="/blog" style={{color:"black", fontWeight:"800", background:"#ff9900", padding:"5px 14px", borderRadius:"20px", textDecoration:"none"}}>Blog • NEW</Link>
  </div>
      <p style={{fontSize:"14px"}}>© {new Date().getFullYear()} Lorem Pro Tool - All Rights Reserved</p>
    </footer>
  );
}
