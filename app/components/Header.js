import Link from "next/link";
export default function Header() {
  return (
    <header style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 20px', background:'#18181b', border:'1px solid #27272a', borderRadius:'14px', marginBottom:'25px'}}>
      <Link href="/" style={{textDecoration:'none', fontWeight:'900', color:'#fff'}}>LOREM PRO</Link>
      <Link href="/tools" style={{background:'#fff', color:'#000', padding:'7px 14px', borderRadius:'20px', textDecoration:'none', fontWeight:'800', fontSize:'13px'}}>All Tools 🚀</Link>
    </header>
  );
}
