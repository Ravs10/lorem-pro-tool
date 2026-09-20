"use client";
import React from "react";
import Link from "next/link";

export default function Navbar(){
  const [open,setOpen]=React.useState(false);
  return (
    <header style={{display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 16px", borderBottom:"1px solid #222", background:"#111", position:"sticky", top:0, zIndex:50}}>
      <Link href="/" style={{fontWeight:900, fontSize:18, color:"white", textDecoration:"none", letterSpacing:0.5}}>⚡ Lorem Pro Tool</Link>
      
      {/* Desktop Menu */}
      <nav style={{display:"flex", gap:18, fontSize:13}} className="desktop-menu">
        <Link href="/" style={{color:"#aaa", textDecoration:"none"}}>Home</Link>
        <Link href="/fake-data-generator" style={{color:"white", textDecoration:"none", fontWeight:700}}>Fake Data</Link>
        <Link href="/lorem-ipsum" style={{color:"#aaa", textDecoration:"none"}}>Lorem</Link>
        <Link href="/about" style={{color:"#aaa", textDecoration:"none"}}>About</Link>
        <Link href="/contact" style={{color:"#aaa", textDecoration:"none"}}>Contact</Link>
      </nav>

      {/* Mobile Button */}
      <button onClick={()=>setOpen(!open)} style={{display:"none", background:"#222", color:"white", border:"1px solid #333", padding:"6px 12px", borderRadius:8}} className="mobile-btn">
        {open?"✕":"☰"}
      </button>

      {/* Mobile Menu */}
      {open && (
        <div style={{position:"absolute", top:56, left:0, right:0, background:"#111", borderBottom:"1px solid #222", padding:16, display:"flex", flexDirection:"column", gap:14}}>
          <Link href="/" onClick={()=>setOpen(false)} style={{color:"white", textDecoration:"none"}}>🏠 Home</Link>
          <Link href="/fake-data-generator" onClick={()=>setOpen(false)} style={{color:"#4ade80", textDecoration:"none", fontWeight:700}}>⚡ Fake Data Generator</Link>
          <Link href="/lorem-ipsum" onClick={()=>setOpen(false)} style={{color:"white", textDecoration:"none"}}>📝 Lorem Ipsum</Link>
          <Link href="/about" onClick={()=>setOpen(false)} style={{color:"white", textDecoration:"none"}}>ℹ️ About</Link>
          <Link href="/privacy-policy" onClick={()=>setOpen(false)} style={{color:"white", textDecoration:"none"}}>🔒 Privacy Policy</Link>
          <Link href="/contact" onClick={()=>setOpen(false)} style={{color:"white", textDecoration:"none"}}>📩 Contact</Link>
        </div>
      )}

      <style>{`
        @media(max-width: 700px){
          .desktop-menu{ display:none !important; }
          .mobile-btn{ display:block !important; }
        }
        @media(min-width: 701px){
          .desktop-menu{ display:flex !important; }
        }
      `}</style>
    </header>
  );
}
