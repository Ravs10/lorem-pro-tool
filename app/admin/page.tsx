"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [pass, setPass] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    if (localStorage.getItem("lorem_admin") === "true") setIsLoggedIn(true);
  }, []);

  const handleLogin = async () => {
    const res = await fetch("/api/admin-login", {
      method: "POST",
      body: JSON.stringify({ password: pass }),
    });
    const data = await res.json();
    if (data.success) {
      localStorage.setItem("lorem_admin", "true");
      setIsLoggedIn(true);
    } else {
      alert("Galat password!");
    }
  };

  const handlePublish = async () => {
    if (!title || !content) return alert("Title / Content likho");
    const { error } = await supabase.from("blogs").insert([{ title, content, slug: title.toLowerCase().replace(/ /g, "-") }]);
    if (error) alert(error.message);
    else {
      alert("Live ho gaya!");
      setTitle(""); setContent("");
    }
  };

  if (!isLoggedIn) {
    return (
      <div style={{padding:'40px'}}><h1>Admin Login</h1>
        <input type="password" placeholder="Password" value={pass} onChange={e=>setPass(e.target.value)} style={{padding:'10px', marginTop:'10px'}}/>
        <button onClick={handleLogin} style={{padding:'10px 20px', marginLeft:'10px', background:'black', color:'white'}}>Login</button>
      </div>
    );
  }

  return (
    <div style={{padding:'20px', maxWidth:'600px', margin:'auto'}}>
      <h1>Publish Blog Post</h1>
      <input placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} style={{width:'100%', padding:'10px', marginTop:'15px'}}/>
      <textarea placeholder="Content" value={content} onChange={e=>setContent(e.target.value)} style={{width:'100%', padding:'10px', height:'200px', marginTop:'10px'}}/>
      <button onClick={handlePublish} style={{padding:'12px', background:'black', color:'white', width:'100%', marginTop:'10px'}}>Publish Blog Post</button>
      <button onClick={()=>{localStorage.removeItem("lorem_admin"); location.reload();}} style={{padding:'8px', marginTop:'20px'}}>Logout</button>
    </div>
  );
}
