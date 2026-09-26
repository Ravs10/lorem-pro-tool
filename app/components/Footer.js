import Link from "next/link";

export default function Footer(){
  return (
    <>
      <style>{`
        @keyframes pulse-glow {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255,153,0,0.7); }
          70% { transform: scale(1.08); box-shadow: 0 0 0 10px rgba(255,153,0,0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255,153,0,0); }
        }
        .blog-anim {
          animation: pulse-glow 2s infinite;
          display: inline-block;
        }
      `}</style>

      <footer style={{background:"#111",color:"#aaa",padding:"40px 16px",marginTop:"50px",textAlign:"center"}}>
        <div style={{display:"flex",justifyContent:"center",gap:"20px",flexWrap:"wrap",marginBottom:"15px",alignItems:"center"}}>
          <Link href="/about" style={{color:"white",textDecoration:"none"}}>About</Link>
          <Link href="/contact" style={{color:"white",textDecoration:"none"}}>Contact</Link>
          <Link href="/privacy" style={{color:"white",textDecoration:"none"}}>Privacy Policy</Link>
          <Link href="/disclaimer" style={{color:"white",textDecoration:"none"}}>Disclaimer</Link>
          <Link href="/blog" className="blog-anim" style={{color:"black", fontWeight:"800", background:"#ff9900", padding:"6px 16px", borderRadius:"20px", textDecoration:"none"}}>Blog • NEW</Link>
        </div>
        <p style={{fontSize:"14px"}}>© {new Date().getFullYear()} Lorem Pro Tool - All Rights Reserved</p>
      </footer>
    </>
  );
}
