"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [pass, setPass] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    if (localStorage.getItem("lorem_admin") === "true") setIsLoggedIn(true);
  }, []);

  const handleLogin = async () => {
    try {
      const res = await fetch("/api/admin-login", { method: "POST", body: JSON.stringify({ password: pass }) });
      const data = await res.json();
      if (data.success) {
        if (data.isMaster) {
          localStorage.removeItem("lorem_pass");
          alert("Master Key se login hua! Purana password reset kar diya gaya.");
        }
        localStorage.setItem("lorem_admin", "true");
        setIsLoggedIn(true);
        return;
      }
    } catch (e) {
      console.log("API fail, local check kar rahe hai");
    }

    // Blog wala panel + Master Key ka local fallback
    const savedPass = localStorage.getItem("lorem_pass") || "admin123";
    const MASTER_KEY = "LoremMaster@123";
    
    if (pass === savedPass || pass === "admin123" || pass === MASTER_KEY) {
      if (pass === MASTER_KEY) {
        localStorage.removeItem("lorem_pass");
        alert("Master Key se login hua! Purana password reset kar diya gaya.");
      }
      localStorage.setItem("lorem_admin", "true");
      setIsLoggedIn(true);
    } else {
      alert("Galat password!");
    }
  };

  const handlePublish = async () => {
    if (!title || !content) return alert("Title / Content likho");
    const { error } = await supabase.from("blogs").insert([{ title, content, slug: title.toLowerCase().replace(/\s+/g, "-") }]);
    if (error) alert(error.message);
    else {
      alert("Live ho gaya!");
      setTitle("");
      setContent("");
    }
  };

  if (!isLoggedIn) {
    return (
      <div style={{ padding: '40px' }}>
        <h1>Admin Login</h1>
        <input type="password" placeholder="Password" value={pass} onChange={(e) => setPass(e.target.value)} />
        <button onClick={handleLogin}>Login</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
      <h1>Publish Blog Post</h1>
      <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
      <textarea placeholder="Content" value={content} onChange={(e) => setContent(e.target.value)} />
      <button onClick={handlePublish}>Publish</button>
    </div>
  );
}
