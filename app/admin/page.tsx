"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [pass, setPass] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showMasterInfo, setShowMasterInfo] = useState(false);
  const [activeTab, setActiveTab] = useState("blog");
  const [tools, setTools] = useState<any[]>([]);

  useEffect(() => {
    if (localStorage.getItem("lorem_admin") === "true") {
      setIsLoggedIn(true);
      fetchTools();
    }
  }, []);

  const fetchTools = async () => {
    const { data } = await supabase.from("tools").select("*").order("name");
    if (data) setTools(data);
  };

  const handleLogin = async () => {
    if (!pass) return alert("Please enter password");
    setLoading(true);
    try {
      const res = await fetch("/api/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pass }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("lorem_admin", "true");
        setIsLoggedIn(true);
        fetchTools();
      } else {
        alert("Wrong password");
      }
    } catch (e) {
      alert("Login failed");
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("lorem_admin");
    setIsLoggedIn(false);
    router.push("/admin/login");
  };

  const handleBlogSubmit = async () => {
    if (!title || !content) return alert("Fill all fields");
    setLoading(true);
    const { error } = await supabase.from("blogs").insert([{ title, content }]);
    setLoading(false);
    if (error) alert(error.message);
    else {
      alert("Blog posted!");
      setTitle("");
      setContent("");
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-sm">
          <h1 className="text-2xl font-bold mb-4">Admin Login</h1>
          <input
            type={showPass ? "text" : "password"}
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            placeholder="Password"
            className="w-full p-3 border rounded-xl mb-4"
          />
          <button
            onClick={handleLogin}
            className="w-full bg-black text-white p-3 rounded-xl"
          >
            {loading ? "Loading..." : "Login"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <button onClick={handleLogout} className="text-red-500">Logout</button>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("blog")}
            className={`px-4 py-2 rounded-xl ${activeTab === "blog" ? "bg-black text-white" : "bg-white"}`}
          >
            Blog
          </button>
          <button
            onClick={() => setActiveTab("tools")}
            className={`px-4 py-2 rounded-xl ${activeTab === "tools" ? "bg-black text-white" : "bg-white"}`}
          >
            Tools
          </button>
        </div>

        {activeTab === "blog" ? (
          <div className="bg-white rounded-2xl p-6 shadow">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Blog Title"
              className="w-full p-3 border rounded-xl mb-3"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Blog Content"
              className="w-full p-3 border rounded-xl h-40 mb-3"
            />
            <button
              onClick={handleBlogSubmit}
              className="w-full bg-black text-white p-3 rounded-xl"
            >
              Post Blog
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-6 shadow">
            <h2 className="font-bold mb-4">Tools ({tools.length})</h2>
            {tools.map((tool: any) => (
              <div key={tool.id} className="border p-3 rounded-xl mb-2">
                {tool.name}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
