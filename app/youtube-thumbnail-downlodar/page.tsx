"use client";
import { useState, useRef, useEffect } from "react";

const SOUND_URL = "https://cdn.pixabay.com/audio/2022/03/24/audio_8f8c3c1cbe.mp3";

export default function YTThumbnailDownloader() {
  const [url, setUrl] = useState("");
  const [videoId, setVideoId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const playSound = () => {
    audioRef.current?.play().catch(()=>{}).then(()=>{ if(audioRef.current) audioRef.current.currentTime=0 });
    if(audioRef.current){ audioRef.current.currentTime=0; audioRef.current.play().catch(()=>{}); }
  };

  const extractId = (link: string) => {
    const reg = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^\"&?\/\s]{11})/;
    return link.match(reg)?.[1] || null;
  };

  const processUrl = (link: string) => {
    const id = extractId(link);
    if (!id) return;
    setLoading(true);
    setTimeout(() => {
      setVideoId(id);
      setLoading(false);
      playSound();
    }, 300);
  };

  // ✅ AUTO FETCH ON PASTE
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const text = e.clipboardData?.getData("text") || "";
      if (text.includes("youtube.com") || text.includes("youtu.be")) {
        setUrl(text);
        processUrl(text);
      }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, []);

  // ✅ AUTO FETCH ON TYPING (debounce)
  useEffect(() => {
    if (!url) return;
    const id = extractId(url);
    if (id) {
      const t = setTimeout(() => processUrl(url), 600);
      return () => clearTimeout(t);
    }
  }, [url]);

  const handleFetch = () => {
    playSound();
    processUrl(url);
  };

  const thumbnails = videoId ? [
    { label: "HD (1280x720)", file: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`, badge: "HD 4K" },
    { label: "SD (640x480)", file: `https://img.youtube.com/vi/${videoId}/sddefault.jpg`, badge: "SD" },
    { label: "MQ (320x180)", file: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`, badge: "MQ" },
    { label: "HQ (480x360)", file: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`, badge: "HQ" },
  ] : [];

  const downloadImage = async (imgUrl: string, name: string) => {
    playSound();
    try {
      const res = await fetch(imgUrl);
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `yt-thumb-${name}.jpg`;
      a.click();
    } catch { window.open(imgUrl, "_blank"); }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white px-4 py-8 md:py-14">
      <audio ref={audioRef} src={SOUND_URL} preload="auto" />
      <div className="max-w-5xl mx-auto text-center">
        <h1 className="text-3xl md:text-5xl font-black bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
          YouTube Thumbnail Downloader
        </h1>
        <p className="mt-3 text-zinc-400 animate-pulse">Just Paste Link - Auto Fetch - No Click Needed ✨</p>

        <div className="mt-8 flex flex-col md:flex-row gap-3 max-w-2xl mx-auto p-2 bg-zinc-900 rounded-2xl border border-zinc-800 focus-within:border-violet-500 focus-within:shadow-[0_0_20px_rgba(124,58,237,0.3)] transition-all">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onPaste={(e)=>{ const t = e.clipboardData.getData('text'); setTimeout(()=>processUrl(t),100); }}
            placeholder="Paste YouTube link here... auto fetch hoga"
            className="flex-1 bg-transparent px-4 py-3 outline-none"
            autoFocus
          />
          <button onClick={handleFetch} className="px-8 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 hover:scale-[1.02] active:scale-[0.98] font-bold transition-all">
            {loading ? "Fetching..." : "Get"}
          </button>
        </div>
      </div>

      {videoId && (
        <div className="max-w-5xl mx-auto mt-12 grid md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="md:col-span-2 rounded-2xl overflow-hidden border border-zinc-800">
            <img src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`} className="w-full aspect-video object-cover" alt="preview"/>
          </div>
          {thumbnails.map((t, i) => (
            <div key={i} className="group rounded-2xl bg-zinc-900 border border-zinc-800 p-4 hover:border-violet-500/50 hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-900/20 transition-all duration-300">
              <div className="flex justify-between mb-3">
                <span className="px-3 py-1 text-xs font-bold rounded-full bg-violet-600 group-hover:scale-110 transition">{t.badge}</span>
                <span className="text-xs text-zinc-500">{t.label}</span>
              </div>
              <img src={t.file} alt={t.label} className="rounded-xl w-full aspect-video object-cover group-hover:scale-[1.02] transition"/>
              <div className="mt-4 flex gap-2">
                <button onClick={() => downloadImage(t.file, t.badge)} className="flex-1 py-2.5 rounded-xl bg-white text-black font-bold hover:bg-zinc-200">Download</button>
                <button onClick={() => { navigator.clipboard.writeText(t.file); playSound(); }} className="px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 hover:bg-zinc-700">Copy</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
