
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import JSZip from "jszip";

type VideoMeta = {
  title?: string;
  author_name?: string;
  thumbnail_url?: string;
  author_url?: string;
};

type Quality = {
  key: string;
  label: string;
  description: string;
};

const QUALITIES: Quality[] = [
  { key: "maxresdefault", label: "Maximum", description: "Highest available resolution" },
  { key: "sddefault", label: "SD", description: "Standard definition" },
  { key: "hqdefault", label: "HQ", description: "High quality" },
  { key: "mqdefault", label: "MQ", description: "Medium quality" },
];

const FAQS = [
  {
    q: "How do I download a YouTube thumbnail?",
    a: "Paste a YouTube video URL into the input field, select a thumbnail quality, preview the image, and click Download. You can also export available thumbnails from multiple videos as a ZIP file.",
  },
  {
    q: "Can I download thumbnails from YouTube Shorts?",
    a: "Yes. Paste a valid YouTube Shorts URL. The tool extracts the video ID and checks the available thumbnail image variants.",
  },
  {
    q: "Does this tool download thumbnails in real 4K?",
    a: "The tool retrieves the available YouTube thumbnail variants. Its enhancement feature can resize and adjust an image, but it cannot guarantee native 4K resolution or recover details that are not present in the original image.",
  },
  {
    q: "How many YouTube links can I process at once?",
    a: "Bulk mode accepts up to 20 unique video IDs per batch. ZIP export depends on network access and whether the image server allows cross-origin downloads.",
  },
  {
    q: "Why is the maximum-resolution thumbnail missing?",
    a: "Not every video has a maximum-resolution thumbnail. Try SD, HQ, or MQ instead. YouTube's available thumbnail variants depend on the video.",
  },
  {
    q: "Is a YouTube thumbnail downloader free?",
    a: "This frontend component does not require a paid API. Hosting, bandwidth, or other services used by the website may have separate costs.",
  },
  {
    q: "Can I use downloaded thumbnails commercially?",
    a: "Downloading an image does not transfer its copyright. Obtain permission or ensure you have the necessary rights before republishing or using a thumbnail commercially.",
  },
  {
    q: "Does this tool store my video links?",
    a: "This implementation stores recent video IDs in the browser's localStorage. It does not intentionally send your history to a custom backend.",
  },
];

const APP_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "YT Pro Max Thumbnail Downloader",
  applicationCategory: "MultimediaApplication",
  operatingSystem: "Any",
  description:
    "A browser-based YouTube thumbnail downloader with image previews, quality options, bulk ZIP export and image enhancement.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.a,
    },
  })),
};

function extractVideoId(input: string): string | null {
  const value = input.trim();

  // Accept a raw YouTube video ID.
  if (/^[a-zA-Z0-9_-]{11}$/.test(value)) return value;

  try {
    const parsed = new URL(value);
    const host = parsed.hostname.toLowerCase().replace(/^www\./, "");

    if (host === "youtu.be" || host === "m.youtube.com" || host === "youtube.com" || host === "music.youtube.com") {
      if (host === "youtu.be") {
        const id = parsed.pathname.split("/").filter(Boolean)[0];
        return id && /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
      }

      const v = parsed.searchParams.get("v");
      if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;

      const parts = parsed.pathname.split("/").filter(Boolean);
      const index = parts.findIndex((part) =>
        ["shorts", "embed", "live", "v"].includes(part)
      );

      if (index >= 0 && parts[index + 1]) {
        const id = parts[index + 1];
        return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
      }
    }
  } catch {
    return null;
  }

  return null;
}

function extractAllVideoIds(text: string): string[] {
  const tokens = text.split(/[\s,;]+/).filter(Boolean);
  const found = tokens
    .map(extractVideoId)
    .filter((id): id is string => Boolean(id));

  return [...new Set(found)].slice(0, 20);
}

function thumbnailUrl(id: string, quality: string) {
  return `https://img.youtube.com/vi/${id}/${quality}.jpg`;
}

export default function YTProEnterprise() {
  const [url, setUrl] = useState("");
  const [bulkText, setBulkText] = useState("");
  const [bulkMode, setBulkMode] = useState(false);
  const [ids, setIds] = useState<string[]>([]);
  const [meta, setMeta] = useState<VideoMeta | null>(null);
  const [metaLoading, setMetaLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historySearch, setHistorySearch] = useState("");
  const [aiEnhance, setAiEnhance] = useState(true);
  const [dark, setDark] = useState(true);
  const [sound, setSound] = useState(false);
  const [activeQuality, setActiveQuality] = useState("maxresdefault");
  const [imageSize, setImageSize] = useState("");
  const [imageErrors, setImageErrors] = useState<string[]>([]);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [openGuide, setOpenGuide] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentId = useMemo(
    () => (bulkMode ? ids[0] || null : extractVideoId(url)),
    [bulkMode, ids, url]
  );

  const theme = dark
    ? "bg-[#090b12] text-white"
    : "bg-slate-50 text-slate-900";

  const panel = dark
    ? "bg-white/[0.045] border-white/10"
    : "bg-white border-slate-200 shadow-sm";

  const muted = dark ? "text-slate-400" : "text-slate-600";

  const buttonSecondary = dark
    ? "bg-white/5 border-white/10 hover:bg-white/10"
    : "bg-slate-100 border-slate-200 hover:bg-slate-200";

  // Restore browser history.
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("yt_hist") || "[]");
      if (Array.isArray(saved)) {
        setHistory(
          saved.filter(
            (id): id is string =>
              typeof id === "string" && /^[a-zA-Z0-9_-]{11}$/.test(id)
          ).slice(0, 20)
        );
      }
    } catch {
      setHistory([]);
    }
  }, []);

  const saveHistory = useCallback((id: string) => {
    setHistory((previous) => {
      const next = [id, ...previous.filter((item) => item !== id)].slice(0, 20);
      try {
        localStorage.setItem("yt_hist", JSON.stringify(next));
      } catch {
        // Private browsing or storage restrictions may prevent persistence.
      }
      return next;
    });
  }, []);

  // Load video metadata when a valid single video is selected.
  useEffect(() => {
    if (!currentId) {
      setMeta(null);
      setMetaLoading(false);
      setImageSize("");
      return;
    }

    let cancelled = false;
    const controller = new AbortController();

    async function loadMetadata() {
      setMetaLoading(true);
      setMeta(null);
      setImageSize("");
      setStatus("");

      try {
        const endpoint =
          "https://www.youtube.com/oembed?format=json&url=" +
          encodeURIComponent(`https://www.youtube.com/watch?v=${currentId}`);

        const response = await fetch(endpoint, {
          signal: controller.signal,
        });

        if (!response.ok) throw new Error("Metadata unavailable");

        const data = (await response.json()) as VideoMeta;

        if (!cancelled) {
          setMeta(data);
          saveHistory(currentId);
        }
      } catch {
        if (!cancelled) {
          setMeta(null);
          setStatus(
            "Video details could not be loaded. Thumbnail previews may still work."
          );
        }
      } finally {
        if (!cancelled) setMetaLoading(false);
      }
    }

    void loadMetadata();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [currentId, saveHistory]);

  // Auto-paste YouTube links.
  useEffect(() => {
    const onPaste = (event: ClipboardEvent) => {
      const pasted = event.clipboardData?.getData("text") || "";
      if (!/youtu\.?be|youtube\.com/i.test(pasted)) return;

      if (bulkMode) {
        setBulkText(pasted);
        setIds(extractAllVideoIds(pasted));
      } else {
        const id = extractVideoId(pasted);
        setUrl(pasted);
        if (!id) setStatus("Please paste a valid YouTube video URL.");
      }
    };

    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [bulkMode]);

  // Optional subtle click sound, generated locally.
  const playSound = useCallback(() => {
    if (!sound) return;

    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as typeof window & { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;

      if (!AudioContextClass) return;

      const context = new AudioContextClass();
      const oscillator = context.createOscillator();
      const gain = context.createGain();

      oscillator.type = "sine";
      oscillator.frequency.value = 620;
      gain.gain.value = 0.035;

      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.045);
      oscillator.onended = () => void context.close();
    } catch {
      // Sound is optional.
    }
  }, [sound]);

  const submitUrl = () => {
    const id = extractVideoId(url);
    playSound();

    if (!id) {
      setStatus("Invalid link. Paste a YouTube watch, Shorts, live, embed or youtu.be URL.");
      return;
    }

    setIds([id]);
    setBulkMode(false);
    setStatus("Video selected.");
  };

  const handleBulkChange = (value: string) => {
    setBulkText(value);
    setIds(extractAllVideoIds(value));
    setImageErrors([]);
    setStatus("");
  };

  const handleImageError = (quality: string) => {
    setImageErrors((previous) =>
      previous.includes(quality) ? previous : [...previous, quality]
    );
  };

  const downloadImage = async (id: string, quality: string) => {
    playSound();
    setStatus("");
    const source = thumbnailUrl(id, quality);

    try {
      const response = await fetch(source);
      if (!response.ok) throw new Error("Image unavailable");

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = `${id}_${quality}.jpg`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1500);
      setStatus(`${quality} thumbnail download started.`);
    } catch {
      // External image hosts may block fetch through CORS.
      window.open(source, "_blank", "noopener,noreferrer");
      setStatus(
        "Direct download was restricted by the image host. The image opened in a new tab; use Save image."
      );
    }
  };

  const downloadEnhanced = async (id: string, quality: string) => {
    playSound();
    setBusy(true);
    setStatus("Preparing enhanced image…");

    try {
      const source = thumbnailUrl(id, quality);
      const response = await fetch(source);
      if (!response.ok) throw new Error("Image could not be fetched.");

      const blob = await response.blob();
      const bitmap = await createImageBitmap(blob);

      const scale = aiEnhance ? 4 : 2;
      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width * scale;
      canvas.height = bitmap.height * scale;

      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas is not supported.");

      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

      if (aiEnhance) {
        // Visual adjustments only; this is not AI super-resolution.
        context.filter = "contrast(1.08) saturate(1.12) brightness(1.02)";
        context.drawImage(canvas, 0, 0);
        context.filter = "none";
      }

      bitmap.close();

      const enhancedBlob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (result) =>
            result
              ? resolve(result)
              : reject(new Error("Could not create the enhanced image.")),
          "image/jpeg",
          0.94
        );
      });

      const objectUrl = URL.createObjectURL(enhancedBlob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = `${id}_${quality}_${scale}x_enhanced.jpg`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1500);
      setStatus(
        `Enhanced image prepared at ${scale}× dimensions. This is resizing, not native 4K or AI reconstruction.`
      );
    } catch (error) {
      setStatus(
        error instanceof Error
          ? `${error.message} Try the standard download option.`
          : "Image enhancement failed. Try the standard download option."
      );
    } finally {
      setBusy(false);
    }
  };

  const downloadZip = async () => {
    const targets = bulkMode
      ? ids
      : [extractVideoId(url)].filter((id): id is string => Boolean(id));

    if (!targets.length) {
      setStatus("Add at least one valid YouTube URL before creating a ZIP.");
      return;
    }

    playSound();
    setBusy(true);
    setProgress(0);
    setImageErrors([]);
    setStatus("Preparing thumbnail ZIP…");

    const zip = new JSZip();
    const errors: string[] = [];
    let completed = 0;
    const total = targets.length * QUALITIES.length;

    try {
      for (const id of targets) {
        const folder = zip.folder(id);

        for (const quality of QUALITIES) {
          try {
            const response = await fetch(thumbnailUrl(id, quality.key));

            if (!response.ok) {
              throw new Error("Image request failed");
            }

            const blob = await response.blob();

            if (!blob.type.startsWith("image/")) {
              throw new Error("Response was not an image");
            }

            folder?.file(`${id}_${quality.key}.jpg`, blob);
          } catch {
            errors.push(`${id} (${quality.key})`);
          } finally {
            completed += 1;
            setProgress(Math.round((completed / total) * 100));
          }
        }
      }

      if (Object.keys(zip.files).length === 0) {
        throw new Error(
          "No thumbnails could be added. The image host may block cross-origin requests."
        );
      }

      const content = await zip.generateAsync({ type: "blob" });
      const objectUrl = URL.createObjectURL(content);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = `YT_Thumbnails_${Date.now()}.zip`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 3000);

      setStatus(
        errors.length
          ? `ZIP created. ${errors.length} image request(s) failed; available thumbnails were included.`
          : `ZIP created successfully for ${targets.length} video(s).`
      );

      targets.forEach(saveHistory);
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "Could not create the ZIP."
      );
    } finally {
      setBusy(false);
    }
  };

  const copyVideoLink = async () => {
    if (!currentId) return;

    try {
      await navigator.clipboard.writeText(
        `https://www.youtube.com/watch?v=${currentId}`
      );
      setStatus("Video link copied.");
    } catch {
      setStatus("Clipboard access was blocked by the browser.");
    }
  };

  const shareVideo = async () => {
    if (!currentId) return;

    const shareData = {
      title: meta?.title || "YouTube thumbnail",
      url: `https://www.youtube.com/watch?v=${currentId}`,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        setStatus("Sharing is unavailable here. Video link copied instead.");
      }
    } catch {
      // User may cancel the native share dialog.
    }
  };

  const filteredHistory = history.filter((id) =>
    id.toLowerCase().includes(historySearch.toLowerCase())
  );

  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem("yt_hist");
    } catch {
      // Ignore unavailable storage.
    }
    setStatus("Local browser history cleared.");
  };

  return (
    <main className={`min-h-screen transition-colors duration-300 ${theme}`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(APP_SCHEMA) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }}
      />

      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-4">
          <a href="#home" className="text-lg font-black tracking-tight">
            <span className="text-violet-400">YT</span> PRO MAX
            <span className="ml-2 rounded-md bg-violet-500/15 px-2 py-1 text-xs text-violet-400">
              THUMBNAILS
            </span>
          </a>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setDark(!dark)}
              className={`rounded-xl border px-3 py-2 text-sm ${buttonSecondary}`}
            >
              {dark ? "☀️ Light mode" : "🌙 Dark mode"}
            </button>

            <button
              type="button"
              onClick={() => setSound(!sound)}
              className={`rounded-xl border px-3 py-2 text-sm ${buttonSecondary}`}
              aria-pressed={sound}
            >
              {sound ? "🔊 Sound on" : "🔇 Sound off"}
            </button>
          </div>
        </header>

        {/* Hero */}
        <section id="home" className="py-12 text-center sm:py-16">
          <div className="mb-5 inline-flex rounded-full border border-violet-400/25 bg-violet-500/10 px-4 py-2 text-xs font-semibold text-violet-400 sm:text-sm">
            FREE TOOL · NO SIGN-UP REQUIRED
          </div>

          <h1 className="mx-auto max-w-4xl bg-gradient-to-r from-violet-400 via-blue-400 to-cyan-300 bg-clip-text text-4xl font-black leading-tight text-transparent sm:text-6xl">
            YouTube Thumbnail Downloader
          </h1>

          <p className={`mx-auto mt-5 max-w-2xl text-base leading-7 sm:text-lg ${muted}`}>
            Preview and download YouTube video thumbnails in available
            resolutions. Process individual videos or prepare a ZIP of
            thumbnails for multiple videos.
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-2 text-xs sm:text-sm">
            {["HD previews", "Bulk ZIP", "Shorts support", "Browser history"].map(
              (feature) => (
                <span
                  key={feature}
                  className={`rounded-full border px-3 py-2 ${panel}`}
                >
                  ✓ {feature}
                </span>
              )
            )}
          </div>
        </section>

        {/* Downloader */}
        <section
          aria-label="YouTube thumbnail downloader tool"
          className={`rounded-3xl border p-4 sm:p-7 ${panel}`}
        >
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold sm:text-2xl">
                Download YouTube Thumbnails
              </h2>
              <p className={`mt-1 text-sm ${muted}`}>
                Paste a video URL to get started.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setBulkMode(!bulkMode);
                setStatus("");
                playSound();
              }}
              className="rounded-xl border border-violet-400/30 bg-violet-500/10 px-4 py-2.5 text-sm font-bold text-violet-400 hover:bg-violet-500/20"
            >
              {bulkMode ? "← Single video" : "Bulk ZIP mode →"}
            </button>
          </div>

          {!bulkMode ? (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                submitUrl();
              }}
              className="flex flex-col gap-3 sm:flex-row"
            >
              <input
                ref={inputRef}
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="Paste YouTube, Shorts or youtu.be URL..."
                aria-label="YouTube video URL"
                className={`min-w-0 flex-1 rounded-xl border px-4 py-4 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 ${
                  dark
                    ? "border-white/10 bg-black/20 placeholder:text-slate-500"
                    : "border-slate-200 bg-white placeholder:text-slate-400"
                }`}
              />

              <button
                type="submit"
                className="rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-6 py-4 font-bold text-white transition hover:brightness-110"
              >
                Get Thumbnail
              </button>

              <button
                type="button"
                onClick={downloadZip}
                disabled={busy}
                className="rounded-xl bg-white px-5 py-4 font-bold text-black transition hover:bg-slate-200 disabled:opacity-50"
              >
                ZIP
              </button>
            </form>
          ) : (
            <div>
              <label htmlFor="bulk-input" className="mb-2 block text-sm font-semibold">
                Video URLs (up to 20 unique videos)
              </label>

              <textarea
                id="bulk-input"
                value={bulkText}
                onChange={(event) => handleBulkChange(event.target.value)}
                placeholder={"Paste URLs separated by new lines:\nhttps://youtube.com/watch?v=...\nhttps://youtu.be/..."}
                className={`h-40 w-full rounded-xl border p-4 outline-none focus:border-violet-500 ${
                  dark
                    ? "border-white/10 bg-black/20 placeholder:text-slate-500"
                    : "border-slate-200 bg-white placeholder:text-slate-400"
                }`}
              />

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <p className={`text-sm ${muted}`}>
                  {ids.length} valid unique video(s) detected. Maximum 20.
                </p>

                <button
                  type="button"
                  onClick={downloadZip}
                  disabled={busy || ids.length === 0}
                  className="rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-6 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {busy ? "Preparing ZIP…" : `Download ZIP (${ids.length})`}
                </button>
              </div>
            </div>
          )}

          {busy && (
            <div className="mt-5" aria-live="polite">
              <div className="mb-2 flex justify-between text-sm">
                <span className={muted}>Processing thumbnails</span>
                <span>{progress}%</span>
              </div>
              <div
                className={`h-2 overflow-hidden rounded-full ${dark ? "bg-white/10" : "bg-slate-200"}`}
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress}
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {status && (
            <p
              className={`mt-4 rounded-xl border p-3 text-sm ${
                dark
                  ? "border-white/10 bg-white/5 text-slate-300"
                  : "border-slate-200 bg-slate-50 text-slate-700"
              }`}
              role="status"
              aria-live="polite"
            >
              {status}
            </p>
          )}

          {currentId && !bulkMode && (
            <div className="mt-7 grid gap-5 lg:grid-cols-5">
              {/* Main preview */}
              <div className={`overflow-hidden rounded-2xl border lg:col-span-3 ${panel}`}>
                <div className="relative">
                  <img
                    key={`${currentId}-${activeQuality}`}
                    src={thumbnailUrl(currentId, activeQuality)}
                    alt={`${meta?.title || "YouTube video"} thumbnail preview`}
                    className="aspect-video w-full bg-black object-contain"
                    onLoad={(event) => {
                      const image = event.currentTarget;
                      setImageSize(`${image.naturalWidth} × ${image.naturalHeight} px`);
                    }}
                    onError={() => handleImageError(activeQuality)}
                  />
                  <span className="absolute left-3 top-3 rounded-lg bg-black/75 px-3 py-1.5 text-xs font-bold text-white">
                    {activeQuality}
                  </span>
                </div>

                <div className="p-4 sm:p-5">
                  {metaLoading ? (
                    <p className={`animate-pulse text-sm ${muted}`}>
                      Loading video details…
                    </p>
                  ) : (
                    <>
                      <h3 className="line-clamp-2 text-lg font-bold">
                        {meta?.title || "YouTube video thumbnail"}
                      </h3>
                      <p className={`mt-1 text-sm ${muted}`}>
                        {meta?.author_name || "Video details unavailable"}
                      </p>
                    </>
                  )}

                  <p className={`mt-3 text-xs ${muted}`}>
                    {imageErrors.includes(activeQuality)
                      ? "This thumbnail variant may not be available."
                      : imageSize || "Image dimensions loading…"}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => downloadImage(currentId, activeQuality)}
                      className="rounded-xl bg-white px-4 py-3 text-sm font-bold text-black hover:bg-slate-200"
                    >
                      ↓ Download Image
                    </button>
                    <button
                      type="button"
                      onClick={() => void copyVideoLink()}
                      className={`rounded-xl border px-4 py-3 text-sm ${buttonSecondary}`}
                    >
                      Copy Video Link
                    </button>
                    <button
                      type="button"
                      onClick={() => void shareVideo()}
                      className={`rounded-xl border px-4 py-3 text-sm ${buttonSecondary}`}
                    >
                      Share
                    </button>
                  </div>
                </div>
              </div>

              {/* Quality cards */}
              <div className="grid grid-cols-2 gap-3 lg:col-span-2">
                {QUALITIES.map((quality) => (
                  <article
                    key={quality.key}
                    className={`overflow-hidden rounded-2xl border transition duration-200 hover:-translate-y-1 hover:border-violet-400/60 ${panel}`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setActiveQuality(quality.key);
                        setImageSize("");
                        setStatus("");
                      }}
                      className={`block w-full text-left ${
                        activeQuality === quality.key ? "ring-2 ring-inset ring-violet-500" : ""
                      }`}
                      aria-label={`Preview ${quality.label} thumbnail`}
                    >
                      <img
                        src={thumbnailUrl(currentId, quality.key)}
                        alt={`${quality.label} thumbnail`}
                        className="aspect-video w-full bg-black object-cover"
                        onError={() => handleImageError(quality.key)}
                      />
                      <div className="p-3">
                        <h3 className="text-sm font-bold">{quality.label}</h3>
                        <p className={`mt-1 text-xs ${muted}`}>
                          {imageErrors.includes(quality.key)
                            ? "May be unavailable"
                            : quality.description}
                        </p>
                      </div>
                    </button>

                    <div className="grid gap-2 p-3 pt-0">
                      <button
                        type="button"
                        onClick={() => downloadImage(currentId, quality.key)}
                        className={`rounded-lg border px-2 py-2 text-xs font-semibold ${buttonSecondary}`}
                      >
                        Download
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void downloadEnhanced(currentId, quality.key)}
                        className="rounded-lg bg-violet-600 px-2 py-2 text-xs font-bold text-white hover:bg-violet-500 disabled:opacity-50"
                      >
                        {aiEnhance ? "Enhance 4×" : "Resize 2×"}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {!currentId && !bulkMode && (
            <div className={`mt-6 rounded-2xl border border-dashed p-8 text-center sm:p-12 ${panel}`}>
              <div className="text-4xl">🖼️</div>
              <h3 className="mt-4 text-lg font-bold">Your thumbnail preview appears here</h3>
              <p className={`mx-auto mt-2 max-w-lg text-sm leading-6 ${muted}`}>
                Paste a YouTube video URL above. You can preview available
                thumbnail sizes, download an image, or prepare a ZIP archive.
              </p>
              <button
                type="button"
                onClick={() => inputRef.current?.focus()}
                className="mt-5 rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white"
              >
                Paste a video URL
              </button>
            </div>
          )}
        </section>

        {/* History */}
        <section className="mt-10">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold sm:text-2xl">Recent Thumbnail History</h2>
              <p className={`mt-1 text-sm ${muted}`}>
                Your latest video IDs saved in this browser.
              </p>
            </div>
            {history.length > 0 && (
              <button
                type="button"
                onClick={clearHistory}
                className={`rounded-lg border px-3 py-2 text-sm ${buttonSecondary}`}
              >
                Clear history
              </button>
            )}
          </div>

          {history.length > 0 ? (
            <>
              <input
                value={historySearch}
                onChange={(event) => setHistorySearch(event.target.value)}
                placeholder="Search history by video ID..."
                aria-label="Search recent history"
                className={`mb-4 w-full rounded-xl border px-4 py-3 sm:max-w-sm ${
                  dark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"
                }`}
              />

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {filteredHistory.map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      setBulkMode(false);
                      setUrl(`https://www.youtube.com/watch?v=${id}`);
                      setIds([id]);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className={`overflow-hidden rounded-xl border text-left transition hover:-translate-y-1 hover:border-violet-500 ${panel}`}
                  >
                    <img
                      src={thumbnailUrl(id, "mqdefault")}
                      alt={`Recent video ${id}`}
                      loading="lazy"
                      className="aspect-video w-full object-cover"
                    />
                    <p className={`truncate p-2 text-xs ${muted}`}>{id}</p>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <p className={`rounded-2xl border border-dashed p-6 text-sm ${panel} ${muted}`}>
              No history yet. Select a video to start building your local history.
            </p>
          )}
        </section>

        {/* How to use */}
        <section className={`mt-12 rounded-3xl border p-5 sm:p-8 ${panel}`}>
          <button
            type="button"
            onClick={() => setOpenGuide(!openGuide)}
            className="flex w-full items-center justify-between gap-4 text-left"
            aria-expanded={openGuide}
          >
            <div>
              <p className="text-sm font-semibold text-violet-400">STEP-BY-STEP GUIDE</p>
              <h2 className="mt-1 text-2xl font-black sm:text-3xl">
                How to Download a YouTube Thumbnail
              </h2>
            </div>
            <span className="text-2xl">{openGuide ? "−" : "+"}</span>
          </button>

          {openGuide && (
            <ol className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["01", "Copy the video URL", "Open the YouTube video or Short and copy its link."],
                ["02", "Paste the link", "Paste it into the downloader input and select Get Thumbnail."],
                ["03", "Choose a quality", "Preview available maximum, SD, HQ or MQ thumbnail variants."],
                ["04", "Download or export", "Download one image or use Bulk ZIP mode for multiple video IDs."],
              ].map(([number, title, description]) => (
                <li key={number} className={`rounded-2xl border p-5 ${panel}`}>
                  <span className="text-3xl font-black text-violet-400">{number}</span>
                  <h3 className="mt-3 font-bold">{title}</h3>
                  <p className={`mt-2 text-sm leading-6 ${muted}`}>{description}</p>
                </li>
              ))}
            </ol>
          )}
        </section>

        {/* SEO informational content */}
        <article className="mt-14 space-y-10">
          <section>
            <h2 className="text-2xl font-black sm:text-3xl">
              Free YouTube Thumbnail Downloader Online
            </h2>
            <p className={`mt-4 leading-8 ${muted}`}>
              A YouTube thumbnail is the preview image viewers see before opening
              a video. A clear thumbnail helps communicate the subject of a video
              and can make browsing easier. This YouTube thumbnail downloader
              lets you preview available image variants and save them using a
              modern browser interface. Paste a supported YouTube link to check
              the thumbnail images associated with that video.
            </p>
            <p className={`mt-4 leading-8 ${muted}`}>
              Use the tool for reference, content planning, design inspiration,
              or managing thumbnail assets you are authorized to use. You do not
              need to install a desktop application for the basic workflow.
              Availability of image variants depends on the source video and
              YouTube's thumbnail delivery service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black sm:text-3xl">
              YouTube Thumbnail Sizes and Quality Options
            </h2>
            <p className={`mt-4 leading-8 ${muted}`}>
              The tool checks four commonly used thumbnail endpoints: maximum
              resolution, standard definition, high quality and medium quality.
              The largest variant is not guaranteed to exist for every video.
              If the main preview is missing or displays an unavailable image,
              select another quality card and try again.
            </p>
            <div className={`mt-5 overflow-x-auto rounded-2xl border ${panel}`}>
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead className={dark ? "bg-white/5" : "bg-slate-100"}>
                  <tr>
                    <th className="p-4">Variant</th>
                    <th className="p-4">Endpoint</th>
                    <th className="p-4">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {QUALITIES.map((quality) => (
                    <tr key={quality.key} className="border-t border-current/10">
                      <td className="p-4 font-semibold">{quality.label}</td>
                      <td className="p-4 font-mono text-xs">{quality.key}.jpg</td>
                      <td className={`p-4 ${muted}`}>{quality.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black sm:text-3xl">
              Bulk YouTube Thumbnail Downloader with ZIP Export
            </h2>
            <p className={`mt-4 leading-8 ${muted}`}>
              When you need images from several videos, switch to Bulk ZIP mode
              and paste up to 20 unique valid video links. The tool extracts the
              video IDs, removes duplicates, and attempts to retrieve the four
              supported thumbnail variants for each video. A progress bar shows
              the number of image requests processed. Available files are
              grouped by video ID in the resulting ZIP archive.
            </p>
            <p className={`mt-4 leading-8 ${muted}`}>
              Bulk export uses browser-side image requests, so cross-origin
              restrictions, network failures, missing images, or server
              throttling can prevent some files from being included. A failed
              image request does not necessarily mean that the video is invalid.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black sm:text-3xl">
              Image Enhancement and Thumbnail Resizing
            </h2>
            <p className={`mt-4 leading-8 ${muted}`}>
              The enhancement option enlarges an available thumbnail using
              browser canvas interpolation and applies mild visual adjustments.
              This can be useful for resizing an image for a mockup or preview.
              It is not a dedicated AI super-resolution model and does not
              guarantee true 4K detail. Enlarging a small image may make
              compression artifacts and softness more noticeable.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black sm:text-3xl">
              Privacy, Copyright and Responsible Use
            </h2>
            <p className={`mt-4 leading-8 ${muted}`}>
              Recent video IDs are stored in the browser's localStorage so you
              can revisit them on the same browser. Clearing the history removes
              the IDs stored by this component. The tool does not include a
              custom database or backend in this implementation. Requests to
              YouTube and its image host still go to those external services.
            </p>
            <p className={`mt-4 leading-8 ${muted}`}>
              Thumbnail images may be protected by copyright or other rights.
              Downloading an image does not give you permission to redistribute
              it, use it in an advertisement, or represent another creator's
              work as your own. Follow applicable law, platform terms, and the
              rights holder's requirements before reusing images.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black sm:text-3xl">
              YouTube Thumbnail Downloader FAQs
            </h2>
            <div className="mt-5 space-y-3">
              {FAQS.map((item, index) => (
                <div key={item.q} className={`overflow-hidden rounded-2xl border ${panel}`}>
                  <button
                    type="button"
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="flex w-full items-center justify-between gap-4 p-4 text-left sm:p-5"
                    aria-expanded={openFaq === index}
                  >
                    <h3 className="font-bold">{item.q}</h3>
                    <span className="text-xl text-violet-400">
                      {openFaq === index ? "−" : "+"}
                    </span>
                  </button>
                  {openFaq === index && (
                    <p className={`px-4 pb-5 leading-7 sm:px-5 ${muted}`}>
                      {item.a}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        </article>

        {/* Footer */}
        <footer className={`mt-14 border-t py-7 text-center text-sm ${muted}`}>
          <p>YT Pro Max Thumbnail Downloader</p>
          <p className="mt-2">
            An independent browser-based utility. Not affiliated with or endorsed
            by YouTube or Google.
          </p>
          <a href="#home" className="mt-3 inline-block text-violet-400 hover:underline">
            Back to top ↑
          </a>
        </footer>
      </div>
    </main>
  );
}
