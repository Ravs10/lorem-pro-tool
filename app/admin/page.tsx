"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// === YE AAPKI MASTER KEY HAI - DAIRY ME LIKH LO ===
const MASTER_KEY = "LoremMaster@123";

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [pass, setPass] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    // Google ko admin page index karne se rokne ke liye
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);

    if (localStorage.getItem("lorem_admin") === "true") setIsLoggedIn(true);
  }, []);

  const handleLogin = () => {
    const savedPass = localStorage.getItem("lorem_pass") || "admin123";
    if (pass === savedPass || pass === MASTER_KEY) {
      localStorage.setItem("lorem_admin", "true");
      setIsLoggedIn(true);
      if(pass === MASTER_KEY) alert("Master Key se login hua! Ab Password Change kar lo.");
    } else {
      alert("Galat password!");
    }
  };

  const handlePublish = async () => {
    if (!title || !content) return alert("Title / Content likho");
    const { error } = await supabase.from("blogs").insert([{ title, content, slug: title.toLowerCase().replace(/ /g, "-") }]);
    if (error) alert(error.message);
    else {
      alert("Live ho gaya! Ab turant site pe dikhega.");
      setTitle(""); setContent("");
    }
  };

  if (!isLoggedIn) {
    return (
      <div style={{padding:'40px'}}><h1>Admin Login</h1>
        <input type="password" placeholder="Password ya Master Key" value={pass} onChange={e=>setPass(e.target.value)} style={{padding:'10px', marginTop:'10px'}}/>
        <button onClick={handleLogin} style={{padding:'10px 20px', marginLeft:'10px', background:'black', color:'white'}}>Login</button>
        <p style={{marginTop:'10px', fontSize:'13px'}}>Normal password bhool gaye to MASTER_KEY use karo: {MASTER_KEY}</p>
      </div>
    );
  }

  return (
    <div style={{padding:'20px', maxWidth:'600px', margin:'auto'}}>
      <h1>Publish Blog Post (Turant Live)</h1>
      <input placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} style={{width:'100%', padding:'10px', marginTop:'15px'}}/>
      <textarea placeholder="Content" value={content} onChange={e=>setContent(e.target.value)} style={{width:'100%', padding:'10px', height:'200px', marginTop:'10px'}}/>
      <button onClick={handlePublish} style={{padding:'12px', background:'black', color:'white', width:'100%', marginTop:'10px'}}>Publish Blog Post</button>
      
      <hr style={{margin:'20px 0'}}/>
      <h3>Password Change Karo</h3>
      <button onClick={()=>{ const n=prompt("Naya password daalo"); if(n){localStorage.setItem("lorem_pass", n); alert("Password change ho gaya!");}}} style={{padding:'8px'}}>Password Change</button>
      <button onClick={()=>{localStorage.removeItem("lorem_admin"); location.reload();}} style={{padding:'8px', marginLeft:'10px'}}>Logout</button>
    </div>
  );
}
