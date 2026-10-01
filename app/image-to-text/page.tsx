"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

/* ------------------------------------------------------------------ */
/*  CONSTANTS                                                          */
/* ------------------------------------------------------------------ */

const LANGUAGES = [
  { code: "eng", label: "English" },
  { code: "hin", label: "Hindi" },
  { code: "eng+hin", label: "Hindi + English" },
  { code: "eng+spa", label: "Spanish" },
  { code: "eng+fra", label: "French" },
  { code: "ara", label: "Arabic" },
  { code: "eng+deu", label: "German" },
  { code: "eng+por", label: "Portuguese" },
  { code: "eng+rus", label: "Russian" },
  { code: "eng+chi_sim", label: "Chinese (Simplified)" },
  { code: "eng+jpn", label: "Japanese" },
  { code: "eng+kor", label: "Korean" },
];

// 🔗 Change these to your own tool pages
const OTHER_TOOLS = [
  { icon: "📝", title: "Lorem Ipsum Generator", desc: "77 languages · paragraphs, words, sentences", href: "/" },
  { icon: "🖼️", title: "Image Compressor", desc: "Shrink JPG/PNG/WEBP without quality loss", href: "/tools/image-compressor" },
  { icon: "📄", title: "PDF Merge & Split", desc: "Combine, split, rotate pages instantly", href: "/tools/pdf-tools" },
  { icon: "🔤", title: "Case Converter", desc: "UPPER, lower, Title, Sentence case", href: "/tools/case-converter" },
  { icon: "🔐", title: "Password Generator", desc: "Strong, custom, offline passwords", href: "/tools/password-generator" },
  { icon: "🎨", title: "Color Picker", desc: "HEX · RGB · HSL · gradient maker", href: "/tools/color-picker" },
  { icon: "🧮", title: "Unit Converter", desc: "Length, weight, temp, currency", href: "/tools/unit-converter" },
  { icon: "🔗", title: "URL Shortener", desc: "Clean, trackable, private links", href: "/tools/url-shortener" },
  { icon: "📊", title: "JSON Formatter", desc: "Beautify, minify, validate JSON", href: "/tools/json-formatter" },
  { icon: "🎯", title: "QR Code Generator", desc: "URL, text, WiFi, vCard QR codes", href: "/tools/qr-generator" },
  { icon: "🔡", title: "Word Counter", desc: "Words, chars, reading time, keywords", href: "/tools/word-counter" },
  { icon: "🕐", title: "Timestamp Converter", desc: "Unix ↔ human date, timezones", href: "/tools/timestamp" },
];

const MAX_FILES = 10;
const MAX_SIZE = 25 * 1024 * 1024;
const MAX_PDF_PAGES = 25;
const HISTORY_KEY = "ocr-history-v2";

type Status =
  | "cleaning"
  | "loading"
  | "reading"
  | "done"
  | "failed"
  | "cancelled";

interface OcrResult {
  id: string;
  name: string;
  original: string;
  preview: string;
  text: string;
  confidence: number;
  progress: number;
  status: Status;
  message: string;
  words?: number;
  lines?: { text: string; confidence: number }[];
  cropBox?: { x: number; y: number; w: number; h: number } | null;
}

interface HistoryEntry {
  id: string;
  name: string;
  text: string;
  confidence: number;
  words: number;
  chars: number;
  date: number;
  lang: string;
  starred?: boolean;
}

const FINISHED: Status[] = ["done", "failed", "cancelled"];

const STATUS_META: Record<Status, { label: string; cls: string }> = {
  cleaning: { label: "Preparing", cls: "text-amber-300 bg-amber-400/10 border-amber-400/25" },
  loading: { label: "Loading", cls: "text-sky-300 bg-sky-400/10 border-sky-400/25" },
  reading: { label: "Reading", cls: "text-violet-300 bg-violet-400/10 border-violet-400/25" },
  done: { label: "Done", cls: "text-emerald-300 bg-emerald-400/10 border-emerald-400/25" },
  failed: { label: "Failed", cls: "text-red-300 bg-red-400/10 border-red-400/25" },
  cancelled: { label: "Cancelled", cls: "text-zinc-300 bg-zinc-400/10 border-zinc-400/25" },
};

const uid = () => Math.random().toString(36).slice(2, 10);
const safeName = (n: string) => n.replace(/\.[^/.]+$/, "").replace(/[\\/:*?"<>|]/g, "_");

const tidyText = (t: string) =>
  t
    .replace(/\r/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const countWords = (t: string) => (t.trim() ? t.trim().split(/\s+/).length : 0);

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const triggerDownload = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
};

const formatDate = (ts: number) => {
  const d = new Date(ts);
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const dayKey = (ts: number) => {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
};

const relativeDay = (ts: number) => {
  const today = dayKey(Date.now());
  const yesterday = dayKey(Date.now() - 86400000);
  const k = dayKey(ts);
  if (k === today) return "Today";
  if (k === yesterday) return "Yesterday";
  return new Date(ts).toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const detectScript = (src: string): Promise<"latin" | "devanagari" | "arabic" | "unknown"> =>
  new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const W = Math.min(400, img.width);
        const H = Math.min(400, img.height);
        canvas.width = W;
        canvas.height = H;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve("unknown");
        ctx.drawImage(img, 0, 0, W, H);
        const data = ctx.getImageData(0, 0, W, H).data;
        let dark = 0;
        for (let i = 0; i < data.length; i += 4) {
          const g = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          if (g < 100) dark++;
        }
        const ratio = dark / (W * H);
        resolve(ratio > 0.005 ? "latin" : "unknown");
      } catch {
        resolve("unknown");
      }
    };
    img.onerror = () => resolve("unknown");
    img.src = src;
  });

/* ------------------------------------------------------------------ */
/*  IMAGE PRE-PROCESSING (with optional crop)                          */
/* ------------------------------------------------------------------ */

interface PreOpts {
  brightness: number;
  contrast: number;
  rotate: number;
  grayscale: boolean;
  binarize: boolean;
  threshold: number;
  upscale: boolean;
  crop?: { x: number; y: number; w: number; h: number } | null;
}

const preprocess = (src: string, o: PreOpts): Promise<string> =>
  new Promise((resolve) => {
    const img = new Image();
    img.decoding = "sync";

    img.onload = () => {
      try {
        let sx = 0, sy = 0, sw = img.width, sh = img.height;
        if (o.crop) {
          sx = Math.max(0, o.crop.x * img.width);
          sy = Math.max(0, o.crop.y * img.height);
          sw = Math.max(1, o.crop.w * img.width);
          sh = Math.max(1, o.crop.h * img.height);
        }

        const rad = (o.rotate * Math.PI) / 180;
        const cos = Math.abs(Math.cos(rad));
        const sin = Math.abs(Math.sin(rad));

        const rotW = sw * cos + sh * sin;
        const rotH = sw * sin + sh * cos;

        const longest = Math.max(rotW, rotH);
        let scale = 1;
        if (o.upscale) {
          if (longest < 1000) scale = 2;
          else if (longest < 1600) scale = 1.5;
        }
        if (longest * scale > 4000) scale = 4000 / longest;

        const w = Math.max(1, Math.round(rotW * scale));
        const h = Math.max(1, Math.round(rotH * scale));

        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return resolve(src);

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, w, h);

        ctx.save();
        ctx.translate(w / 2, h / 2);
        ctx.rotate(rad);
        ctx.scale(scale, scale);
        try {
          ctx.filter = `brightness(${o.brightness}%) contrast(${o.contrast}%)${
            o.grayscale ? " grayscale(1)" : ""
          }`;
        } catch {}
        ctx.drawImage(img, sx, sy, sw, sh, -sw / 2, -sh / 2, sw, sh);
        ctx.restore();

        if (o.binarize) {
          const data = ctx.getImageData(0, 0, w, h);
          const d = data.data;
          const th = o.threshold;
          for (let i = 0; i < d.length; i += 4) {
            const g = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
            const v = g > th ? 255 : 0;
            d[i] = d[i + 1] = d[i + 2] = v;
            d[i + 3] = 255;
          }
          ctx.putImageData(data, 0, 0);
        }

        resolve(canvas.toDataURL("image/jpeg", 0.95));
      } catch {
        resolve(src);
      }
    };

    img.onerror = () => resolve(src);
    img.src = src;
  });

/* ------------------------------------------------------------------ */
/*  UNICODE-SAFE PDF BUILDER                                           */
/* ------------------------------------------------------------------ */

async function buildPdfFromText(text: string, filename: string) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4", compress: true });

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 42;
  const fontSize = 11;
  const lineHeight = 16.5;
  const maxWidth = pageW - margin * 2;
  const linesPerPage = Math.max(1, Math.floor((pageH - margin * 2) / lineHeight));
  const SCALE = 3;

  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(pageW * SCALE);
  canvas.height = Math.ceil(pageH * SCALE);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas unavailable");

  const font = `${fontSize}px "Space Grotesk","Noto Sans","Noto Sans Devanagari","Noto Sans Arabic",Arial,sans-serif`;
  const meas = document.createElement("canvas").getContext("2d")!;
  meas.font = font;

  const lines: string[] = [];
  for (const raw of text.split("\n")) {
    if (!raw.trim()) {
      lines.push("");
      continue;
    }
    let cur = "";
    for (const word of raw.split(/\s+/)) {
      const test = cur ? `${cur} ${word}` : word;
      if (meas.measureText(test).width <= maxWidth) {
        cur = test;
        continue;
      }
      if (cur) {
        lines.push(cur);
        cur = "";
      }
      let chunk = "";
      for (const ch of word) {
        if (chunk && meas.measureText(chunk + ch).width > maxWidth) {
          lines.push(chunk);
          chunk = "";
        }
        chunk += ch;
      }
      cur = chunk;
    }
    if (cur) lines.push(cur);
  }
  if (!lines.length) lines.push("");

  const pages: string[][] = [];
  for (let i = 0; i < lines.length; i += linesPerPage)
    pages.push(lines.slice(i, i + linesPerPage));

  pages.forEach((pageLines, idx) => {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.scale(SCALE, SCALE);
    ctx.fillStyle = "#111111";
    ctx.font = font;
    ctx.textBaseline = "top";
    pageLines.forEach((line, i) => ctx.fillText(line, margin, margin + i * lineHeight));
    if (idx > 0) doc.addPage();
    doc.addImage(canvas.toDataURL("image/jpeg", 0.9), "JPEG", 0, 0, pageW, pageH);
  });

  doc.save(filename);
}

/* ------------------------------------------------------------------ */
/*  MULTI-PAGE TIFF READER                                             */
/* ------------------------------------------------------------------ */

async function readTiffPages(file: File): Promise<string[]> {
  const buf = await file.arrayBuffer();
  // @ts-ignore
  const UTIF: any = await import("utif");

  const ifds = UTIF.decode(buf);
  if (!ifds || !ifds.length) throw new Error("No IFD found");

  const pages: string[] = [];
  for (let i = 0; i < ifds.length; i++) {
    UTIF.decodeImage(buf, ifds[i]);
    const rgba = UTIF.toRGBA8(ifds[i]);
    const w = ifds[i].width;
    const h = ifds[i].height;

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) continue;
    const imgData = ctx.createImageData(w, h);
    imgData.data.set(rgba);
    ctx.putImageData(imgData, 0, 0);
    pages.push(canvas.toDataURL("image/jpeg", 0.95));
  }
  return pages;
}

/* ------------------------------------------------------------------ */
/*  UI ATOMS                                                           */
/* ------------------------------------------------------------------ */

function Accordion({
  open,
  onToggle,
  title,
  children,
  highlight = false,
}: {
  open: boolean;
  onToggle: () => void;
  title: string;
  children: ReactNode;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border overflow-hidden mb-3 ${
        highlight
          ? "border-transparent bg-gradient-to-br from-violet-500/20 via-fuchsia-500/15 to-amber-500/20 shadow-[0_0_30px_-10px_rgba(168,85,247,0.5)]"
          : "border-zinc-800 bg-zinc-900/50"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className={`w-full flex items-center justify-between gap-3 p-4 sm:p-5 text-left transition-colors ${
          highlight ? "hover:bg-white/5" : "hover:bg-zinc-800/30"
        }`}
      >
        <span
          className={`font-semibold text-[13px] sm:text-[15px] leading-snug ${
            highlight
              ? "bg-gradient-to-r from-violet-300 via-fuchsia-300 to-amber-300 bg-clip-text text-transparent"
              : ""
          }`}
        >
          {title}
        </span>
        <span
          className={`shrink-0 w-7 h-7 sm:w-8 sm:h-8 grid place-items-center rounded-full border text-sm transition-all duration-300 ${
            open
              ? "rotate-45 bg-white text-black border-white"
              : highlight
              ? "bg-fuchsia-500/20 border-fuchsia-400/50 text-fuchsia-200"
              : "bg-zinc-800 border-zinc-700"
          }`}
        >
          +
        </span>
      </button>
      <div
        className={`grid transition-all duration-300 ease-out ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div
            className={`px-4 sm:px-5 pb-5 text-[13px] sm:text-sm leading-7 ${
              highlight ? "text-zinc-300" : "text-zinc-400"
            }`}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function Range({
  label,
  value,
  min,
  max,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  suffix?: string;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block rounded-xl border border-zinc-800 bg-black/40 px-3 py-2.5">
      <span className="flex items-center justify-between text-[11px] font-bold text-zinc-400 mb-2">
        <span>{label}</span>
        <span className="text-white tabular-nums">
          {value}
          {suffix}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-white cursor-pointer"
        aria-label={label}
      />
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange,
  hint,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  hint?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors ${
        checked
          ? "border-white/70 bg-white/10"
          : "border-zinc-800 bg-black/40 hover:border-zinc-700"
      }`}
    >
      <span className="min-w-0">
        <span className="block text-[11px] font-bold">{label}</span>
        {hint && <span className="block text-[10px] text-zinc-500">{hint}</span>}
      </span>
      <span
        className={`shrink-0 w-9 h-5 rounded-full relative transition-colors ${
          checked ? "bg-white" : "bg-zinc-700"
        }`}
      >
        <span
          className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${
            checked ? "bg-black" : "bg-zinc-300"
          }`}
          style={{ left: checked ? 18 : 2 }}
        />
      </span>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  CROP TOOL                                                          */
/* ------------------------------------------------------------------ */

function CropModal({
  src,
  onCancel,
  onApply,
}: {
  src: string;
  onCancel: () => void;
  onApply: (box: { x: number; y: number; w: number; h: number }) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ x: 0.1, y: 0.1, w: 0.8, h: 0.8 });
  const [drag, setDrag] = useState<{ corner: string; sx: number; sy: number; orig: any } | null>(
    null
  );

  const startDrag = (corner: string) => (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDrag({
      corner,
      sx: e.clientX,
      sy: e.clientY,
      orig: { ...box },
    });
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  useEffect(() => {
    if (!drag) return;
    const move = (e: PointerEvent) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const dx = (e.clientX - drag.sx) / rect.width;
      const dy = (e.clientY - drag.sy) / rect.height;
      let { x, y, w, h } = drag.orig;
      const MIN = 0.05;

      if (drag.corner.includes("n")) {
        const ny = Math.max(0, Math.min(1 - MIN, y + dy));
        h = h - (ny - y);
        y = ny;
      }
      if (drag.corner.includes("s")) {
        h = Math.max(MIN, Math.min(1 - y, h + dy));
      }
      if (drag.corner.includes("w")) {
        const nx = Math.max(0, Math.min(1 - MIN, x + dx));
        w = w - (nx - x);
        x = nx;
      }
      if (drag.corner.includes("e")) {
        w = Math.max(MIN, Math.min(1 - x, w + dx));
      }
      setBox({ x, y, w, h });
    };
    const up = () => setDrag(null);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [drag]);

  const corners: { key: string; cls: string }[] = [
    { key: "nw", cls: "top-0 left-0 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize" },
    { key: "ne", cls: "top-0 right-0 translate-x-1/2 -translate-y-1/2 cursor-nesw-resize" },
    { key: "sw", cls: "bottom-0 left-0 -translate-x-1/2 translate-y-1/2 cursor-nesw-resize" },
    { key: "se", cls: "bottom-0 right-0 translate-x-1/2 translate-y-1/2 cursor-nwse-resize" },
  ];

  return (
    <div className="fixed inset-0 z-[65] bg-black/95 backdrop-blur-sm grid place-items-center p-3">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 w-full max-w-2xl">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-bold">✂️ Crop — drag the corners</p>
          <button
            type="button"
            onClick={onCancel}
            className="w-8 h-8 grid place-items-center rounded-full border border-zinc-700 hover:bg-zinc-800"
          >
            ✕
          </button>
        </div>
        <div
          ref={containerRef}
          className="relative w-full select-none touch-none"
          style={{ aspectRatio: "4/3" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt="crop"
            className="absolute inset-0 w-full h-full object-contain bg-black rounded-xl"
            draggable={false}
          />
          <div
            className="absolute border-2 border-white rounded-md pointer-events-none"
            style={{
              left: `${box.x * 100}%`,
              top: `${box.y * 100}%`,
              width: `${box.w * 100}%`,
              height: `${box.h * 100}%`,
              boxShadow: "0 0 0 9999px rgba(0,0,0,0.55)",
            }}
          />
          {corners.map((c) => (
            <div
              key={c.key}
              onPointerDown={startDrag(c.key)}
              className={`absolute w-6 h-6 bg-white rounded-full border-2 border-black ${c.cls}`}
              style={{
                left:
                  c.key.includes("w")
                    ? `${box.x * 100}%`
                    : `${(box.x + box.w) * 100}%`,
                top:
                  c.key.includes("n")
                    ? `${box.y * 100}%`
                    : `${(box.y + box.h) * 100}%`,
              }}
            />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2 mt-3">
          <button
            type="button"
            onClick={() => setBox({ x: 0, y: 0, w: 1, h: 1 })}
            className="bg-zinc-800 border border-zinc-700 py-2.5 rounded-xl font-bold text-xs hover:bg-zinc-700"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={() => onApply(box)}
            className="bg-white text-black py-2.5 rounded-xl font-bold text-xs hover:bg-zinc-200"
          >
            Apply Crop
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  PAGE                                                               */
/* ------------------------------------------------------------------ */

export default function Page() {
  const [results, setResults] = useState<OcrResult[]>([]);
  const [lang, setLang] = useState("eng+hin");
  const [autoLang, setAutoLang] = useState(true);
  const [toast, setToast] = useState<{ msg: string; kind: "ok" | "err" } | null>(null);
  const [busy, setBusy] = useState(false);

  const [brightness, setBrightness] = useState(110);
  const [contrast, setContrast] = useState(115);
  const [rotate, setRotate] = useState(0);
  const [grayscale, setGrayscale] = useState(false);
  const [binarize, setBinarize] = useState(false);
  const [threshold, setThreshold] = useState(160);
  const [upscale, setUpscale] = useState(true);
  const [autoTidy, setAutoTidy] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  // Advanced OCR — now has its own top-level visibility
  const [psm, setPsm] = useState<string>("6");
  const [whitelist, setWhitelist] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(true);
  const [showAdvancedTop, setShowAdvancedTop] = useState(false);

  const [fontSize, setFontSize] = useState(12);
  const [showConfidence, setShowConfidence] = useState(false);

  const [showCamera, setShowCamera] = useState(false);
  const [facing, setFacing] = useState<"environment" | "user">("environment");
  const [cameraReady, setCameraReady] = useState(false);

  const [cropFor, setCropFor] = useState<OcrResult | null>(null);

  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [historyQuery, setHistoryQuery] = useState("");

  const [openSec, setOpenSec] = useState("what");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [isDragActive, setIsDragActive] = useState(false);
  const [query, setQuery] = useState("");
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [replaceFrom, setReplaceFrom] = useState("");
  const [replaceTo, setReplaceTo] = useState("");
  const [showReplace, setShowReplace] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const workerRef = useRef<{ lang: string; worker: any } | null>(null);
  const jobRef = useRef<string | null>(null);
  const urlsRef = useRef<string[]>([]);
  const cancelRef = useRef(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const processRef = useRef<(f: FileList | File[]) => void>(() => {});
  const hydratedRef = useRef(false);

  const showToast = useCallback((msg: string, kind: "ok" | "err" = "ok") => {
    setToast({ msg, kind });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem("ocr-results-v1");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setResults(
            parsed.map((r: any) => ({
              ...r,
              status: FINISHED.includes(r.status) ? r.status : "done",
              message: FINISHED.includes(r.status) ? r.message : "Completed",
              progress: 100,
            }))
          );
        }
      }
      const rawH = localStorage.getItem(HISTORY_KEY);
      if (rawH) {
        const parsedH = JSON.parse(rawH);
        if (Array.isArray(parsedH)) setHistory(parsedH);
      }
    } catch {}
    hydratedRef.current = true;
  }, []);

  useEffect(() => {
    if (!hydratedRef.current) return;
    try {
      const toStore = results.slice(-20).map((r) => ({
        ...r,
        preview: "",
        original: "",
      }));
      localStorage.setItem("ocr-results-v1", JSON.stringify(toStore));
    } catch {}
  }, [results]);

  useEffect(() => {
    if (!hydratedRef.current) return;
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 200)));
    } catch {}
  }, [history]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);

      const mod = e.ctrlKey || e.metaKey;
      if (!mod) {
        if (e.key === "Escape") {
          setLightbox(null);
          setCropFor(null);
        }
        return;
      }

      if (e.key.toLowerCase() === "o" && e.shiftKey) {
        e.preventDefault();
        imageInputRef.current?.click();
      } else if (e.key.toLowerCase() === "k" && e.shiftKey) {
        e.preventDefault();
        setShowCamera(true);
      } else if (e.key.toLowerCase() === "h" && e.shiftKey) {
        e.preventDefault();
        setShowHistory((s) => !s);
      } else if (e.key.toLowerCase() === "s" && e.shiftKey) {
        e.preventDefault();
        if (allTextRef.current) copyAllRef.current?.();
      } else if (e.key === "/" && e.shiftKey) {
        e.preventDefault();
        if (resultsRef.current.length) clearAllRef.current?.();
      } else if (e.key === "ArrowUp" && !typing) {
        e.preventDefault();
        setFontSize((s) => Math.min(22, s + 1));
      } else if (e.key === "ArrowDown" && !typing) {
        e.preventDefault();
        setFontSize((s) => Math.max(10, s - 1));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const getWorker = useCallback(async (langCode: string) => {
    if (workerRef.current && workerRef.current.lang === langCode) {
      return workerRef.current.worker;
    }
    if (workerRef.current) {
      try {
        await workerRef.current.worker.terminate();
      } catch {}
      workerRef.current = null;
    }

    const { createWorker } = await import("tesseract.js");
    const worker = await createWorker(langCode, 1, {
      logger: (m: any) => {
        const id = jobRef.current;
        if (!id) return;
        setResults((prev) =>
          prev.map((r) => {
            if (r.id !== id) return r;
            if (m.status === "recognizing text") {
              return {
                ...r,
                status: "reading",
                message: "Recognizing text…",
                progress: Math.round((m.progress ?? 0) * 100),
              };
            }
            const friendly =
              typeof m.status === "string"
                ? m.status.replace(/^\w/, (c: string) => c.toUpperCase())
                : "Working…";
            return { ...r, status: "loading", message: friendly };
          })
        );
      },
      errorHandler: (e: any) => console.warn("tesseract:", e),
    });

    workerRef.current = { lang: langCode, worker };
    return worker;
  }, []);

  useEffect(() => {
    return () => {
      try {
        workerRef.current?.worker?.terminate();
      } catch {}
      workerRef.current = null;
      urlsRef.current.forEach((u) => {
        try {
          URL.revokeObjectURL(u);
        } catch {}
      });
      urlsRef.current = [];
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const allTextRef = useRef("");
  const resultsRef = useRef<OcrResult[]>([]);
  const copyAllRef = useRef<(() => void) | null>(null);
  const clearAllRef = useRef<(() => void) | null>(null);

  const runOCR = useCallback(
    async (
      src: string,
      name: string,
      previewUrl: string,
      overrideLang?: string,
      cropBox?: { x: number; y: number; w: number; h: number } | null
    ) => {
      const id = uid();
      const useLang = overrideLang || lang;
      const opts: PreOpts = {
        brightness,
        contrast,
        rotate,
        grayscale,
        binarize,
        threshold,
        upscale,
        crop: cropBox ?? null,
      };

      setResults((prev) => [
        ...prev,
        {
          id,
          name,
          original: src,
          preview: previewUrl,
          text: "",
          confidence: 0,
          progress: 0,
          status: "cleaning",
          message: "Preparing image…",
          words: 0,
          lines: [],
          cropBox: cropBox ?? null,
        },
      ]);

      const patch = (p: Partial<OcrResult>) =>
        setResults((prev) => prev.map((r) => (r.id === id ? { ...r, ...p } : r)));

      try {
        const cleaned = await preprocess(src, opts);
        if (cancelRef.current) throw new Error("cancelled");

        patch({
          preview: cleaned,
          status: "loading",
          message: "Starting OCR engine…",
          progress: 5,
        });

        jobRef.current = id;
        const worker = await getWorker(useLang);
        if (cancelRef.current) throw new Error("cancelled");

        try {
          const setParams: any = (worker as any).setParameters;
          if (typeof setParams === "function") {
            await setParams({
              tessedit_pageseg_mode: psm,
              tessedit_char_whitelist: whitelist,
              preserve_interword_spaces: "1",
            });
          }
        } catch {}

        const { data } = await worker.recognize(cleaned);
        jobRef.current = null;

        const text = autoTidy ? tidyText(data.text || "") : data.text || "";
        const confidence = Math.round(data.confidence ?? 0);

        const lines: { text: string; confidence: number }[] = [];
        try {
          const rawLines: any[] = (data as any).lines || [];
          for (const l of rawLines) {
            const lt = (l.text || "").trim();
            if (lt) lines.push({ text: lt, confidence: Math.round(l.confidence ?? 0) });
          }
        } catch {}

        patch({
          text,
          confidence,
          progress: 100,
          status: "done",
          message: "Completed",
          words: countWords(text),
          lines,
        });

        if (text.trim()) {
          setHistory((h) =>
            [
              {
                id,
                name,
                text,
                confidence,
                words: countWords(text),
                chars: text.length,
                date: Date.now(),
                lang: useLang,
                starred: false,
              },
              ...h,
            ].slice(0, 200)
          );
        }
      } catch {
        jobRef.current = null;
        const cancelled = cancelRef.current;
        patch({
          status: cancelled ? "cancelled" : "failed",
          message: cancelled
            ? "Cancelled"
            : "OCR failed — try a sharper image or another language",
          progress: 100,
        });
        if (!cancelled) showToast(`Failed: ${name}`, "err");
      }
    },
    [
      brightness,
      contrast,
      rotate,
      grayscale,
      binarize,
      threshold,
      upscale,
      autoTidy,
      lang,
      psm,
      whitelist,
      getWorker,
      showToast,
    ]
  );

  const handlePdf = useCallback(
    async (file: File) => {
      try {
        const pdfjs: any = await import("pdfjs-dist");
        const major = parseInt(String(pdfjs.version).split(".")[0], 10);
        pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${
          pdfjs.version
        }/build/pdf.worker.min.${major >= 4 ? "mjs" : "js"}`;

        const buf = await file.arrayBuffer();
        const doc = await pdfjs.getDocument({ data: buf }).promise;
        const total = Math.min(doc.numPages, MAX_PDF_PAGES);

        if (doc.numPages > MAX_PDF_PAGES) {
          showToast(`Only first ${MAX_PDF_PAGES} of ${doc.numPages} pages processed`, "err");
        }

        for (let p = 1; p <= total; p++) {
          if (cancelRef.current) break;
          const page = await doc.getPage(p);
          const viewport = page.getViewport({ scale: 3 });
          const canvas = document.createElement("canvas");
          canvas.width = Math.floor(viewport.width);
          canvas.height = Math.floor(viewport.height);
          const ctx = canvas.getContext("2d");
          if (!ctx) continue;

          await page.render({ canvasContext: ctx, viewport, canvas } as any).promise;

          const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
          await runOCR(dataUrl, `${file.name} · p${p}`, dataUrl);
        }

        try {
          await doc.destroy();
        } catch {}
      } catch (e) {
        console.error(e);
        showToast("PDF could not be read — try exporting pages as images", "err");
      }
    },
    [runOCR, showToast]
  );

  const processFiles = useCallback(
    async (input: FileList | File[]) => {
      const files = Array.from(input as any) as File[];
      if (!files.length) return;

      const accepted = files.slice(0, MAX_FILES);
      if (files.length > MAX_FILES)
        showToast(`Only the first ${MAX_FILES} files were queued`, "err");

      cancelRef.current = false;
      setBusy(true);
      setIsDragActive(false);

      for (const file of accepted) {
        if (cancelRef.current) break;

        if (file.size > MAX_SIZE) {
          showToast(`${file.name} is too large (max 25 MB)`, "err");
          continue;
        }

        const isPdf =
          file.type === "application/pdf" || /\.pdf$/i.test(file.name);
        const isTiff =
          file.type === "image/tiff" ||
          file.type === "image/tif" ||
          /\.tiff?$/i.test(file.name);
        const isImage =
          file.type.startsWith("image/") ||
          /\.(png|jpe?g|webp|bmp|gif)$/i.test(file.name);

        if (isPdf) {
          await handlePdf(file);
        } else if (isTiff) {
          try {
            const pages = await readTiffPages(file);
            if (!pages.length) {
              showToast(`TIFF has no pages: ${file.name}`, "err");
              continue;
            }
            for (let i = 0; i < pages.length; i++) {
              if (cancelRef.current) break;
              await runOCR(pages[i], `${file.name} · p${i + 1}`, pages[i]);
            }
          } catch (e) {
            console.error(e);
            showToast(`TIFF could not be read: ${file.name}`, "err");
          }
        } else if (isImage) {
          const url = URL.createObjectURL(file);
          urlsRef.current.push(url);

          let useLang = lang;
          if (autoLang && !/\+/.test(lang)) {
            const script = await detectScript(url);
            if (script === "latin" && lang === "hin") useLang = "eng";
          }
          await runOCR(url, file.name, url, useLang);
        } else {
          showToast(`Unsupported file: ${file.name}`, "err");
        }
      }

      setBusy(false);
      cancelRef.current = false;
    },
    [autoLang, handlePdf, lang, runOCR, showToast]
  );

  processRef.current = processFiles;

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      const files: File[] = [];
      for (const it of Array.from(items)) {
        if (it.kind === "file" && it.type.startsWith("image/")) {
          const f = it.getAsFile();
          if (f) files.push(f);
        }
      }
      if (files.length) {
        e.preventDefault();
        showToast(`${files.length} image(s) pasted`);
        processRef.current(files);
      }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [showToast]);

  useEffect(() => {
    if (!showCamera) return;
    let cancelled = false;
    let stream: MediaStream | null = null;

    (async () => {
      if (!window.isSecureContext) {
        showToast("Camera needs HTTPS (use your Vercel link)", "err");
        setShowCamera(false);
        return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: facing,
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
        setCameraReady(true);
      } catch {
        showToast("Camera permission denied", "err");
        setShowCamera(false);
      }
    })();

    return () => {
      cancelled = true;
      setCameraReady(false);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [showCamera, facing, showToast]);

  const captureCamera = useCallback(async () => {
    const video = videoRef.current;
    const c = canvasRef.current;
    if (!video || !c || !video.videoWidth) {
      showToast("Camera not ready yet", "err");
      return;
    }
    c.width = video.videoWidth;
    c.height = video.videoHeight;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, c.width, c.height);
    const dataUrl = c.toDataURL("image/jpeg", 0.95);

    setShowCamera(false);
    setBusy(true);
    await runOCR(dataUrl, `camera-${Date.now()}.jpg`, dataUrl);
    setBusy(false);
  }, [runOCR, showToast]);

  const allText = useMemo(
    () =>
      results
        .filter((r) => r.text)
        .map((r) => `--- ${r.name} ---\n${r.text}`)
        .join("\n\n")
        .trim(),
    [results]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return results;
    return results.filter(
      (r) => r.name.toLowerCase().includes(q) || r.text.toLowerCase().includes(q)
    );
  }, [results, query]);

  const filteredHistory = useMemo(() => {
    const q = historyQuery.trim().toLowerCase();
    if (!q) return history;
    return history.filter(
      (h) => h.name.toLowerCase().includes(q) || h.text.toLowerCase().includes(q)
    );
  }, [history, historyQuery]);

  const groupedHistory = useMemo(() => {
    const map = new Map<string, HistoryEntry[]>();
    for (const h of filteredHistory) {
      const k = dayKey(h.date);
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(h);
    }
    return Array.from(map.entries());
  }, [filteredHistory]);

  const stats = useMemo(() => {
    const done = results.filter((r) => r.status === "done");
    const words = done.reduce((a, r) => a + countWords(r.text), 0);
    const chars = done.reduce((a, r) => a + r.text.length, 0);
    const conf = done.length
      ? Math.round(done.reduce((a, r) => a + r.confidence, 0) / done.length)
      : 0;
    return { files: results.length, done: done.length, words, chars, conf };
  }, [results]);

  const finishedCount = results.filter((r) => FINISHED.includes(r.status)).length;
  const overall = results.length
    ? Math.round((finishedCount / results.length) * 100)
    : 0;

  const copyAll = async () => {
    if (!allText) return showToast("Nothing to copy", "err");
    try {
      await navigator.clipboard.writeText(allText);
      showToast("All text copied");
    } catch {
      showToast("Clipboard blocked by browser", "err");
    }
  };

  allTextRef.current = allText;
  resultsRef.current = results;
  copyAllRef.current = copyAll;

  const downloadZip = async () => {
    if (!results.length) return;
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();
    results.forEach((r, i) => {
      if (r.text)
        zip.file(`${String(i + 1).padStart(2, "0")}-${safeName(r.name)}.txt`, r.text);
    });
    const blob = await zip.generateAsync({ type: "blob" });
    triggerDownload(blob, "ocr-texts.zip");
  };

  const exportAllPdf = async () => {
    if (!allText) return showToast("Nothing to export", "err");
    showToast("Building PDF…");
    try {
      await buildPdfFromText(allText, "ocr-all.pdf");
    } catch (e) {
      console.error(e);
      showToast("PDF export failed", "err");
    }
  };

  const downloadAllTxt = () => {
    if (!allText) return showToast("Nothing to export", "err");
    triggerDownload(
      new Blob([allText], { type: "text/plain;charset=utf-8" }),
      "ocr-all.txt"
    );
  };

  const downloadCsv = () => {
    const rows = [["File", "Confidence", "Words", "Text"]];
    results.forEach((r) => {
      if (r.text)
        rows.push([
          r.name,
          String(r.confidence),
          String(countWords(r.text)),
          r.text.replace(/"/g, '""'),
        ]);
    });
    if (rows.length < 2) return showToast("Nothing to export", "err");
    const csv = rows
      .map((row) => row.map((c) => `"${c.replace(/"/g, '""')}"`).join(","))
      .join("\n");
    triggerDownload(
      new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" }),
      "ocr-results.csv"
    );
  };

  const handleShare = async () => {
    const text = allText;
    if (!text) return showToast("Nothing to share yet", "err");

    const file = new File([text], "ocr-result.txt", { type: "text/plain" });
    const nav: any = navigator;
    try {
      if (nav.canShare && nav.canShare({ files: [file] })) {
        await nav.share({
          title: "OCR Result",
          text: text.slice(0, 400),
          files: [file],
        });
        return;
      }
      if (nav.share) {
        await nav.share({
          title: "OCR Result",
          text: text.length > 4000 ? text.slice(0, 4000) + "…" : text,
        });
        return;
      }
    } catch (e: any) {
      if (e?.name === "AbortError") return;
    }

    try {
      await navigator.clipboard.writeText(text);
    } catch {}

    const encoded = encodeURIComponent(
      text.length > 1800 ? text.slice(0, 1800) + "…" : text
    );
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isMobile) {
      const choice = window.confirm(
        "Native share not available.\n\nOK = Open WhatsApp share\nCancel = Copy text only (already copied)"
      );
      if (choice) {
        window.open(`https://wa.me/?text=${encoded}`, "_blank", "noopener");
      } else {
        showToast("Copied to clipboard");
      }
    } else {
      showToast("Share not supported — text copied to clipboard");
    }
  };

  const copyOne = async (text: string) => {
    if (!text) return showToast("Nothing to copy", "err");
    try {
      await navigator.clipboard.writeText(text);
      showToast("Copied");
    } catch {
      showToast("Clipboard blocked", "err");
    }
  };

  const downloadTxt = (r: OcrResult) =>
    triggerDownload(
      new Blob([r.text], { type: "text/plain;charset=utf-8" }),
      `${safeName(r.name)}.txt`
    );

  const downloadPdf = async (r: OcrResult) => {
    if (!r.text) return showToast("Nothing to export", "err");
    try {
      await buildPdfFromText(r.text, `${safeName(r.name)}.pdf`);
    } catch {
      showToast("PDF export failed", "err");
    }
  };

  const downloadDoc = (r: OcrResult) => {
    if (!r.text) return showToast("Nothing to export", "err");
    const html = `<html xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><title>${escapeHtml(
      r.name
    )}</title></head><body><pre style="font-family:Calibri,Arial,sans-serif;white-space:pre-wrap;font-size:11pt">${escapeHtml(
      r.text
    )}</pre></body></html>`;
    triggerDownload(
      new Blob(["\ufeff", html], { type: "application/msword;charset=utf-8" }),
      `${safeName(r.name)}.doc`
    );
    showToast("DOC downloaded");
  };

  const removeResult = (id: string) =>
    setResults((prev) => prev.filter((r) => r.id !== id));

  const retryResult = async (r: OcrResult) => {
    setResults((prev) => prev.filter((x) => x.id !== r.id));
    setBusy(true);
    cancelRef.current = false;
    await runOCR(r.original, r.name, r.original, undefined, r.cropBox ?? null);
    setBusy(false);
  };

  const clearAll = () => {
    urlsRef.current.forEach((u) => {
      try {
        URL.revokeObjectURL(u);
      } catch {}
    });
    urlsRef.current = [];
    setResults([]);
    setQuery("");
    try {
      localStorage.removeItem("ocr-results-v1");
    } catch {}
    showToast("Cleared");
  };

  clearAllRef.current = clearAll;

  const cancelAll = async () => {
    cancelRef.current = true;
    if (workerRef.current) {
      try {
        await workerRef.current.worker.terminate();
      } catch {}
      workerRef.current = null;
    }
    setBusy(false);
    setResults((prev) =>
      prev.map((r) =>
        FINISHED.includes(r.status)
          ? r
          : { ...r, status: "cancelled", message: "Cancelled", progress: 100 }
      )
    );
    showToast("Processing cancelled", "err");
  };

  const transformAll = (mode: "upper" | "lower" | "title") => {
    if (!results.length) return;
    setResults((prev) =>
      prev.map((r) => {
        if (!r.text) return r;
        let t = r.text;
        if (mode === "upper") t = t.toUpperCase();
        else if (mode === "lower") t = t.toLowerCase();
        else
          t = t.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
        return { ...r, text: t, words: countWords(t) };
      })
    );
    showToast(`Text ${mode} applied`);
  };

  const applyReplace = () => {
    if (!replaceFrom) return showToast("Enter text to find", "err");
    let count = 0;
    setResults((prev) =>
      prev.map((r) => {
        if (!r.text) return r;
        const before = r.text;
        const t = r.text.split(replaceFrom).join(replaceTo);
        if (t !== before) count++;
        return { ...r, text: t, words: countWords(t) };
      })
    );
    showToast(count ? `Replaced in ${count} file(s)` : "No matches found");
  };

  const openCrop = (r: OcrResult) => setCropFor(r);
  const applyCrop = async (box: { x: number; y: number; w: number; h: number }) => {
    const r = cropFor;
    setCropFor(null);
    if (!r) return;
    setResults((prev) =>
      prev.map((x) => (x.id === r.id ? { ...x, cropBox: box } : x))
    );
    setBusy(true);
    cancelRef.current = false;
    await runOCR(r.original, r.name, r.original, undefined, box);
    setBusy(false);
  };

  const historyToResults = (h: HistoryEntry) => {
    const r: OcrResult = {
      id: uid(),
      name: h.name,
      original: "",
      preview: "",
      text: h.text,
      confidence: h.confidence,
      progress: 100,
      status: "done",
      message: "From history",
      words: countWords(h.text),
      lines: [],
      cropBox: null,
    };
    setResults((prev) => [r, ...prev]);
    setShowHistory(false);
    showToast("Loaded from history");
  };

  const removeHistory = (id: string) =>
    setHistory((prev) => prev.filter((h) => h.id !== id));

  const clearHistory = () => {
    if (!history.length) return;
    if (!window.confirm("Clear all history? This cannot be undone.")) return;
    setHistory([]);
    showToast("History cleared");
  };

  const toggleStar = (id: string) =>
    setHistory((prev) =>
      prev.map((h) => (h.id === id ? { ...h, starred: !h.starred } : h))
    );

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setLightbox(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox]);

  const hasResults = results.length > 0;

  return (
    <div className="min-h-screen bg-[#070709] text-white antialiased">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');
        *{ font-family:'Space Grotesk', ui-sans-serif, system-ui, sans-serif; }
        ::-webkit-scrollbar{ width:9px; height:9px }
        ::-webkit-scrollbar-track{ background:#0b0b0d }
        ::-webkit-scrollbar-thumb{ background:#2a2a2e; border-radius:9px }
        ::-webkit-scrollbar-thumb:hover{ background:#3d3d42 }
        input[type=range]{ height:18px }
        @keyframes attentionGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(168,85,247,0.5), 0 0 20px -5px rgba(168,85,247,0.4); }
          50% { box-shadow: 0 0 0 6px rgba(168,85,247,0), 0 0 30px -5px rgba(236,72,153,0.6); }
        }
        @keyframes shimmerSlide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes borderFlow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes floatCard {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .attention-box {
          position: relative;
          background: linear-gradient(90deg, #a855f7, #ec4899, #f59e0b, #a855f7);
          background-size: 300% 100%;
          animation: borderFlow 6s ease infinite;
          padding: 1.5px;
          border-radius: 0.75rem;
        }
        .attention-inner {
          background: #0a0a0b;
          border-radius: 0.65rem;
          position: relative;
          overflow: hidden;
          animation: attentionGlow 3s ease-in-out infinite;
        }
        .attention-inner::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 40%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
          animation: shimmerSlide 3.5s ease-in-out infinite;
          pointer-events: none;
        }
        .conf-low { background: rgba(239,68,68,0.18); border-radius: 4px; padding: 0 2px; }
        .conf-mid { background: rgba(245,158,11,0.16); border-radius: 4px; padding: 0 2px; }

        /* Tools card animations */
        .tool-card {
          position: relative;
          overflow: hidden;
          transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .tool-card::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 1px;
          background: linear-gradient(135deg, transparent, transparent);
          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0;
          transition: opacity 0.4s ease;
          pointer-events: none;
        }
        .tool-card:hover::before {
          background: linear-gradient(135deg, #a855f7, #ec4899, #f59e0b);
          opacity: 1;
        }
        .tool-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px -12px rgba(168,85,247,0.4);
        }
        .tool-card:hover .tool-icon {
          transform: scale(1.15) rotate(-6deg);
        }
        .tool-icon {
          transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
          display: inline-block;
        }
        .tool-card::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -60%;
          width: 40%;
          height: 200%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent);
          transform: rotate(25deg);
          transition: left 0.7s ease;
          pointer-events: none;
        }
        .tool-card:hover::after {
          left: 120%;
        }
        @media (prefers-reduced-motion: reduce){ *{ transition:none !important; animation:none !important } }
      `}</style>

      <header className="sticky top-0 z-30 backdrop-blur-xl bg-[#070709]/85 border-b border-zinc-900">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 flex items-center justify-between gap-2">
          <a href="/" className="font-bold text-sm sm:text-base whitespace-nowrap">
            ⚡ Lorem Pro Tool
          </a>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowHistory(true)}
              className="bg-zinc-900 border border-zinc-800 rounded-full px-2.5 sm:px-3 py-2 text-[11px] font-bold hover:border-zinc-600 transition"
              title="History (Ctrl+Shift+H)"
            >
              📜 <span className="hidden sm:inline">History</span>
            </button>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              aria-label="OCR language"
              className="bg-zinc-900 border border-zinc-800 rounded-full px-2.5 sm:px-3 py-2 text-[11px] font-bold outline-none focus:border-zinc-600 max-w-[110px] sm:max-w-[200px]"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleShare}
              className="bg-white text-black px-3 sm:px-4 py-2 rounded-full text-[11px] sm:text-xs font-bold hover:bg-zinc-200 active:scale-95 transition"
            >
              Share <span className="hidden sm:inline">Result </span>↗
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-3 sm:px-4 pb-24">
        <div className="text-center mt-8 sm:mt-12">
          <h1 className="text-[30px] sm:text-[42px] md:text-[56px] font-bold leading-[0.95] tracking-tighter">
            All-in-One
            <br />
            <span className="text-zinc-500">OCR + PDF + Camera.</span>
          </h1>
          <p className="mt-4 text-xs sm:text-sm text-zinc-500 max-w-2xl mx-auto leading-6">
            Batch up to {MAX_FILES} files · 12 languages · 100% on-device
            (nothing is uploaded) · PDF pages, live camera &amp; clipboard paste.
          </p>
        </div>

        <section className="mt-7 bg-zinc-900/70 border border-zinc-800 rounded-[20px] p-3 sm:p-4">
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="bg-white text-black px-4 py-3 rounded-xl text-sm font-bold hover:bg-zinc-200 active:scale-[0.98] transition"
            >
              📁 Upload Image / PDF / TIFF
            </button>
            <button
              type="button"
              onClick={() => setShowCamera(true)}
              className="bg-zinc-800 border border-zinc-700 px-4 py-3 rounded-xl text-sm font-bold hover:bg-zinc-700 active:scale-[0.98] transition"
            >
              📷 Live Camera
            </button>
            <button
              type="button"
              onClick={() => pdfInputRef.current?.click()}
              className="bg-black border border-zinc-700 px-4 py-3 rounded-xl text-sm font-bold hover:border-zinc-500 active:scale-[0.98] transition"
            >
              📄 PDF Only
            </button>
          </div>

          <input
            ref={imageInputRef}
            type="file"
            accept="image/*,application/pdf,.tif,.tiff"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) processFiles(e.target.files);
              e.target.value = "";
            }}
          />
          <input
            ref={pdfInputRef}
            type="file"
            accept="application/pdf,.pdf"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) processFiles(e.target.files);
              e.target.value = "";
            }}
          />

          {/* 🔬 ADVANCED OCR — TOP LEVEL (visible immediately) */}
          <div className="mt-3 attention-box">
            <button
              type="button"
              onClick={() => setShowAdvancedTop((s) => !s)}
              aria-expanded={showAdvancedTop}
              className="attention-inner w-full flex items-center justify-between px-4 py-3 text-[12px] sm:text-[13px] font-bold text-white"
            >
              <span className="flex items-center gap-2">
                <span className="text-base">🔬</span>
                <span>Advanced OCR — Accuracy Boost</span>
                <span className="text-[10px] font-normal text-amber-300 hidden sm:inline">
                  PSM · Whitelist · tap to open
                </span>
              </span>
              <span className={`transition-transform duration-300 ${showAdvancedTop ? "rotate-180" : ""}`}>
                ▾
              </span>
            </button>
          </div>

          {showAdvancedTop && (
            <div className="mt-3 space-y-3">
              <label className="block rounded-xl border border-zinc-800 bg-black/40 px-3 py-2.5">
                <span className="block text-[11px] font-bold text-zinc-400 mb-2">
                  Page segmentation mode (PSM)
                </span>
                <select
                  value={psm}
                  onChange={(e) => setPsm(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs outline-none focus:border-zinc-500"
                >
                  <option value="3">3 — Fully automatic (default)</option>
                  <option value="6">6 — Single uniform block (best for most)</option>
                  <option value="4">4 — Single column of text</option>
                  <option value="11">11 — Sparse text (receipts)</option>
                  <option value="7">7 — Single text line</option>
                  <option value="8">8 — Single word</option>
                  <option value="13">13 — Raw line (no post-proc)</option>
                </select>
                <p className="mt-2 text-[10px] text-zinc-500 leading-5">
                  Tells Tesseract how the text is laid out on the page. Choose
                  the mode matching your image for best accuracy.
                </p>
              </label>

              <label className="block rounded-xl border border-zinc-800 bg-black/40 px-3 py-2.5">
                <span className="block text-[11px] font-bold text-zinc-400 mb-2">
                  Character whitelist (optional — leave empty for all)
                </span>
                <input
                  value={whitelist}
                  onChange={(e) => setWhitelist(e.target.value)}
                  placeholder="e.g. 0123456789  (numbers only)"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs outline-none focus:border-zinc-500"
                />
                <p className="mt-2 text-[10px] text-zinc-500 leading-5">
                  Restrict recognition to specific characters. Great for
                  invoices, phone numbers or ID cards.
                </p>
              </label>
            </div>
          )}

          {/* ⚙️ SETTINGS TOGGLE */}
          <div className="mt-3 attention-box">
            <button
              type="button"
              onClick={() => setShowSettings((s) => !s)}
              aria-expanded={showSettings}
              className="attention-inner w-full flex items-center justify-between px-4 py-3 text-[12px] sm:text-[13px] font-bold text-white"
            >
              <span className="flex items-center gap-2">
                <span className="text-base">⚙️</span>
                <span>Image Enhancement &amp; OCR Settings</span>
                <span className="text-[10px] font-normal text-violet-300 hidden sm:inline">
                  tap to customise
                </span>
              </span>
              <span className={`transition-transform duration-300 ${showSettings ? "rotate-180" : ""}`}>
                ▾
              </span>
            </button>
          </div>

          {showSettings && (
            <div className="mt-3 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <Range
                  label="Brightness"
                  min={50}
                  max={150}
                  value={brightness}
                  suffix="%"
                  onChange={setBrightness}
                />
                <Range
                  label="Contrast"
                  min={50}
                  max={200}
                  value={contrast}
                  suffix="%"
                  onChange={setContrast}
                />
                <Range
                  label="Rotate"
                  min={0}
                  max={359}
                  value={rotate}
                  suffix="°"
                  onChange={setRotate}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <Range
                  label="Font Size (results)"
                  min={10}
                  max={22}
                  value={fontSize}
                  suffix="px"
                  onChange={setFontSize}
                />
                <Toggle
                  label="Auto language detect"
                  hint="Defaults Latin text to English"
                  checked={autoLang}
                  onChange={setAutoLang}
                />
                <Toggle
                  label="Show line confidence"
                  hint="Highlight weak lines in results"
                  checked={showConfidence}
                  onChange={setShowConfidence}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                <Toggle
                  label="Grayscale"
                  hint="Helps with coloured scans"
                  checked={grayscale}
                  onChange={setGrayscale}
                />
                <Toggle
                  label="Black &amp; White"
                  hint="Hard threshold binarisation"
                  checked={binarize}
                  onChange={setBinarize}
                />
                <Toggle
                  label="Auto upscale"
                  hint="Enlarges small images"
                  checked={upscale}
                  onChange={setUpscale}
                />
                <Toggle
                  label="Auto clean text"
                  hint="Fix spacing &amp; blank lines"
                  checked={autoTidy}
                  onChange={setAutoTidy}
                />
              </div>

              {binarize && (
                <Range
                  label="Binarisation threshold"
                  min={60}
                  max={220}
                  value={threshold}
                  onChange={setThreshold}
                />
              )}

              {/* Advanced also visible inside settings */}
              <div className="attention-box">
                <button
                  type="button"
                  onClick={() => setShowAdvanced((s) => !s)}
                  className="attention-inner w-full flex items-center justify-between px-4 py-3 text-[12px] sm:text-[13px] font-bold text-white"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-base">🔬</span>
                    <span>Advanced OCR (duplicate access)</span>
                    <span className="text-[10px] font-normal text-amber-300 hidden sm:inline">
                      PSM · Whitelist
                    </span>
                  </span>
                  <span className={`transition-transform duration-300 ${showAdvanced ? "rotate-180" : ""}`}>
                    ▾
                  </span>
                </button>
              </div>

              {showAdvanced && (
                <div className="space-y-3">
                  <label className="block rounded-xl border border-zinc-800 bg-black/40 px-3 py-2.5">
                    <span className="block text-[11px] font-bold text-zinc-400 mb-2">
                      Page segmentation mode (PSM)
                    </span>
                    <select
                      value={psm}
                      onChange={(e) => setPsm(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs outline-none focus:border-zinc-500"
                    >
                      <option value="3">3 — Fully automatic (default)</option>
                      <option value="6">6 — Single uniform block (best for most)</option>
                      <option value="4">4 — Single column of text</option>
                      <option value="11">11 — Sparse text (receipts)</option>
                      <option value="7">7 — Single text line</option>
                      <option value="8">8 — Single word</option>
                      <option value="13">13 — Raw line (no post-proc)</option>
                    </select>
                  </label>

                  <label className="block rounded-xl border border-zinc-800 bg-black/40 px-3 py-2.5">
                    <span className="block text-[11px] font-bold text-zinc-400 mb-2">
                      Character whitelist (optional)
                    </span>
                    <input
                      value={whitelist}
                      onChange={(e) => setWhitelist(e.target.value)}
                      placeholder="e.g. 0123456789"
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs outline-none focus:border-zinc-500"
                    />
                  </label>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-500">
                <span>
                  Live preview applies to the next OCR run ·{" "}
                  <span className="text-zinc-300">
                    {brightness}% / {contrast}% / {rotate}°
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setBrightness(110);
                    setContrast(115);
                    setRotate(0);
                    setGrayscale(false);
                    setBinarize(false);
                    setThreshold(160);
                    setUpscale(true);
                    setAutoTidy(true);
                    setPsm("6");
                    setWhitelist("");
                    setFontSize(12);
                    setAutoLang(true);
                    setShowConfidence(false);
                  }}
                  className="px-3 py-1.5 rounded-full border border-zinc-700 font-bold hover:border-zinc-500 transition"
                >
                  Reset defaults
                </button>
              </div>
            </div>
          )}
        </section>

        {showCamera && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm grid place-items-center p-3 sm:p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-[20px] p-3 sm:p-4 w-full max-w-md">
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full rounded-xl bg-black aspect-[3/4] object-cover"
                />
                {!cameraReady && (
                  <div className="absolute inset-0 grid place-items-center text-xs text-zinc-400">
                    Starting camera…
                  </div>
                )}
              </div>
              <canvas ref={canvasRef} className="hidden" />
              <div className="grid grid-cols-3 gap-2 mt-3">
                <button
                  type="button"
                  onClick={() =>
                    setFacing((f) => (f === "environment" ? "user" : "environment"))
                  }
                  className="bg-zinc-800 border border-zinc-700 py-3 rounded-xl font-bold text-xs hover:bg-zinc-700 transition"
                >
                  🔄 Flip
                </button>
                <button
                  type="button"
                  onClick={captureCamera}
                  disabled={!cameraReady}
                  className="bg-white text-black py-3 rounded-xl font-bold text-sm disabled:opacity-40 hover:bg-zinc-200 transition"
                >
                  Capture
                </button>
                <button
                  type="button"
                  onClick={() => setShowCamera(false)}
                  className="bg-zinc-800 border border-zinc-700 py-3 rounded-xl font-bold text-xs hover:bg-zinc-700 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {cropFor && (
          <CropModal
            src={cropFor.original || cropFor.preview}
            onCancel={() => setCropFor(null)}
            onApply={applyCrop}
          />
        )}

        <section className="mt-4 bg-zinc-900/70 border border-zinc-800 rounded-[24px] p-3 sm:p-4">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragActive(true);
            }}
            onDragLeave={() => setIsDragActive(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragActive(false);
              processFiles(e.dataTransfer.files);
            }}
            onClick={() => imageInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") imageInputRef.current?.click();
            }}
            className={`cursor-pointer rounded-2xl border-2 border-dashed bg-[#0F0F10] p-6 sm:p-10 text-center transition-all outline-none focus-visible:border-white ${
              isDragActive
                ? "border-white bg-zinc-800/80 scale-[1.01]"
                : "border-zinc-700 hover:border-zinc-600"
            }`}
          >
            <p className="font-bold text-sm sm:text-base">
              {isDragActive ? "Drop files here 👇" : "Drop images, PDFs or TIFFs here (max 10)"}
            </p>
            <p className="text-[11px] sm:text-xs text-zinc-500 mt-1.5">
              JPG · PNG · WEBP · BMP · GIF · TIFF · PDF — or press{" "}
              <kbd className="px-1.5 py-0.5 rounded border border-zinc-700 bg-black text-[10px]">
                Ctrl
              </kbd>
              +
              <kbd className="px-1.5 py-0.5 rounded border border-zinc-700 bg-black text-[10px]">
                V
              </kbd>{" "}
              to paste a screenshot
            </p>
          </div>

          {busy && (
            <div className="mt-3 rounded-xl border border-zinc-800 bg-black/40 p-3">
              <div className="flex items-center justify-between text-[11px] font-bold mb-2">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Processing {finishedCount}/{results.length}
                </span>
                <button
                  type="button"
                  onClick={cancelAll}
                  className="px-3 py-1 rounded-full border border-red-500/30 text-red-400 hover:bg-red-500/10 transition"
                >
                  Cancel
                </button>
              </div>
              <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-white h-full transition-all duration-300"
                  style={{ width: `${overall}%` }}
                />
              </div>
            </div>
          )}

          {hasResults && (
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { k: "Files", v: stats.files },
                { k: "Words", v: stats.words.toLocaleString() },
                { k: "Characters", v: stats.chars.toLocaleString() },
                { k: "Avg. confidence", v: `${stats.conf}%` },
              ].map((s) => (
                <div
                  key={s.k}
                  className="rounded-xl border border-zinc-800 bg-black/40 px-3 py-2"
                >
                  <p className="text-[10px] uppercase tracking-wide text-zinc-500 font-bold">
                    {s.k}
                  </p>
                  <p className="text-sm font-bold tabular-nums mt-0.5">{s.v}</p>
                </div>
              ))}
            </div>
          )}

          <div className="mt-3 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            <button
              type="button"
              onClick={copyAll}
              disabled={!allText}
              className="py-3 rounded-xl font-bold text-xs bg-white text-black disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed hover:bg-zinc-200 transition"
            >
              Copy All ({results.length})
            </button>
            <button
              type="button"
              onClick={downloadAllTxt}
              disabled={!allText}
              className="py-3 rounded-xl font-bold text-xs border border-zinc-700 bg-zinc-800 disabled:bg-zinc-900 disabled:border-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed hover:border-zinc-500 transition"
            >
              TXT ↓
            </button>
            <button
              type="button"
              onClick={downloadZip}
              disabled={!allText}
              className="py-3 rounded-xl font-bold text-xs border border-zinc-700 bg-zinc-800 disabled:bg-zinc-900 disabled:border-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed hover:border-zinc-500 transition"
            >
              ZIP ↓
            </button>
            <button
              type="button"
              onClick={exportAllPdf}
              disabled={!allText}
              className="py-3 rounded-xl font-bold text-xs border border-zinc-700 bg-zinc-800 disabled:bg-zinc-900 disabled:border-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed hover:border-zinc-500 transition"
            >
              PDF ↓
            </button>
            <button
              type="button"
              onClick={downloadCsv}
              disabled={!allText}
              className="py-3 rounded-xl font-bold text-xs border border-zinc-700 bg-zinc-800 disabled:bg-zinc-900 disabled:border-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed hover:border-zinc-500 transition"
            >
              CSV ↓
            </button>
            <button
              type="button"
              onClick={clearAll}
              disabled={!hasResults}
              className="py-3 rounded-xl font-bold text-xs bg-red-500/10 border border-red-500/25 text-red-400 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-red-500/20 transition"
            >
              Clear All
            </button>
          </div>

          {hasResults && (
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => transformAll("upper")}
                className="py-2.5 rounded-xl text-[11px] font-bold border border-zinc-700 bg-zinc-800 hover:border-zinc-500 transition"
              >
                AA UPPER
              </button>
              <button
                type="button"
                onClick={() => transformAll("lower")}
                className="py-2.5 rounded-xl text-[11px] font-bold border border-zinc-700 bg-zinc-800 hover:border-zinc-500 transition"
              >
                aa lower
              </button>
              <button
                type="button"
                onClick={() => transformAll("title")}
                className="py-2.5 rounded-xl text-[11px] font-bold border border-zinc-700 bg-zinc-800 hover:border-zinc-500 transition"
              >
                Aa Title
              </button>
              <button
                type="button"
                onClick={() => setShowReplace((s) => !s)}
                className={`py-2.5 rounded-xl text-[11px] font-bold border transition ${
                  showReplace
                    ? "border-white/70 bg-white/10"
                    : "border-zinc-700 bg-zinc-800 hover:border-zinc-500"
                }`}
              >
                Find &amp; Replace
              </button>
            </div>
          )}

          {showReplace && hasResults && (
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2">
              <input
                value={replaceFrom}
                onChange={(e) => setReplaceFrom(e.target.value)}
                placeholder="Find…"
                className="bg-black/50 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs outline-none focus:border-zinc-600"
              />
              <input
                value={replaceTo}
                onChange={(e) => setReplaceTo(e.target.value)}
                placeholder="Replace with…"
                className="bg-black/50 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs outline-none focus:border-zinc-600"
              />
              <button
                type="button"
                onClick={applyReplace}
                className="bg-white text-black px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-zinc-200 transition"
              >
                Apply
              </button>
            </div>
          )}

          {results.length > 2 && (
            <div className="mt-3">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="🔎 Filter results by file name or extracted text…"
                className="w-full bg-black/50 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-zinc-600 transition"
              />
            </div>
          )}

          <div className="mt-3 space-y-3">
            {filtered.map((r) => {
              const meta = STATUS_META[r.status];
              const isBusy = !FINISHED.includes(r.status);
              const wc = r.words ?? countWords(r.text);
              const readMin = Math.max(1, Math.round(wc / 200));
              const weakLineCount = r.lines?.filter((l) => l.confidence < 75).length ?? 0;
              return (
                <article
                  key={r.id}
                  className="bg-black/60 border border-zinc-800 rounded-2xl p-3 sm:p-4 flex flex-col md:flex-row gap-3 sm:gap-4"
                >
                  <div className="flex md:flex-col items-center md:items-stretch gap-3 md:w-24 shrink-0">
                    <button
                      type="button"
                      onClick={() => r.preview && setLightbox(r.preview)}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-zinc-800 shrink-0 group relative bg-zinc-900"
                      title="View larger"
                    >
                      {r.preview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={r.preview}
                          alt={r.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      ) : (
                        <span className="w-full h-full grid place-items-center text-zinc-600 text-xs">
                          🗎
                        </span>
                      )}
                    </button>
                    <div className="flex md:flex-col items-center gap-1.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${meta.cls}`}
                      >
                        {meta.label}
                      </span>
                      {r.status === "done" && (
                        <span className="text-[10px] text-zinc-500 tabular-nums">
                          {r.confidence}% conf.
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[11px] font-bold truncate" title={r.name}>
                        {r.name}
                        {r.cropBox && (
                          <span className="ml-2 text-[10px] text-violet-300 font-normal">
                            ✂️ cropped
                          </span>
                        )}
                      </p>
                      <button
                        type="button"
                        onClick={() => removeResult(r.id)}
                        aria-label={`Remove ${r.name}`}
                        className="shrink-0 w-6 h-6 grid place-items-center rounded-full border border-zinc-800 text-zinc-500 hover:text-red-400 hover:border-red-500/40 transition text-xs"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex-1 bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            r.status === "failed"
                              ? "bg-red-500"
                              : r.status === "cancelled"
                              ? "bg-zinc-500"
                              : "bg-white"
                          }`}
                          style={{ width: `${r.progress}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-zinc-500 tabular-nums shrink-0">
                        {isBusy && r.progress > 0 && r.progress < 100
                          ? `${r.progress}%`
                          : r.message}
                      </span>
                    </div>

                    {r.text && (
                      <p className="mt-1.5 text-[10px] text-zinc-500 tabular-nums">
                        {wc.toLocaleString()} words · ~{readMin} min read
                        {weakLineCount > 0 && (
                          <span className="ml-2 text-amber-400">
                            · {weakLineCount} weak line{weakLineCount > 1 ? "s" : ""}
                          </span>
                        )}
                      </p>
                    )}

                    {showConfidence && r.lines && r.lines.length > 0 ? (
                      <div
                        className="w-full mt-2.5 bg-zinc-900/80 border border-zinc-800 rounded-xl p-3 leading-6 h-32 sm:h-28 overflow-auto"
                        style={{ fontSize: `${fontSize}px` }}
                      >
                        {r.lines.map((ln, i) => (
                          <div
                            key={i}
                            className={
                              ln.confidence < 60
                                ? "conf-low"
                                : ln.confidence < 80
                                ? "conf-mid"
                                : ""
                            }
                            title={`${ln.confidence}% confidence`}
                          >
                            {ln.text}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <textarea
                        value={r.text}
                        onChange={(e) =>
                          setResults((prev) =>
                            prev.map((x) =>
                              x.id === r.id
                                ? { ...x, text: e.target.value, words: countWords(e.target.value) }
                                : x
                            )
                          )
                        }
                        placeholder="Extracted text will appear here…"
                        spellCheck={false}
                        className="w-full mt-2.5 bg-zinc-900/80 border border-zinc-800 rounded-xl p-3 leading-6 h-32 sm:h-28 outline-none focus:border-white resize-y transition"
                        style={{ fontSize: `${fontSize}px` }}
                      />
                    )}

                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <button
                        type="button"
                        onClick={() => copyOne(r.text)}
                        className="bg-white text-black px-3 py-1.5 rounded-full text-[11px] font-bold hover:bg-zinc-200 transition"
                      >
                        Copy
                      </button>
                      <button
                        type="button"
                        onClick={() => downloadTxt(r)}
                        className="bg-zinc-800 border border-zinc-700 px-3 py-1.5 rounded-full text-[11px] font-bold hover:border-zinc-500 transition"
                      >
                        TXT ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => downloadPdf(r)}
                        className="bg-zinc-800 border border-zinc-700 px-3 py-1.5 rounded-full text-[11px] font-bold hover:border-zinc-500 transition"
                      >
                        PDF ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => downloadDoc(r)}
                        className="bg-zinc-800 border border-zinc-700 px-3 py-1.5 rounded-full text-[11px] font-bold hover:border-zinc-500 transition"
                      >
                        DOC ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => openCrop(r)}
                        disabled={!r.original}
                        className="bg-violet-600 hover:bg-violet-500 disabled:opacity-40 px-3 py-1.5 rounded-full text-[11px] font-bold transition"
                        title="Crop then re-run OCR"
                      >
                        ✂️ Crop
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          window.open(
                            `https://wa.me/?text=${encodeURIComponent(
                              r.text.slice(0, 1500)
                            )}`,
                            "_blank",
                            "noopener"
                          )
                        }
                        className="bg-green-600 hover:bg-green-500 px-3 py-1.5 rounded-full text-[11px] font-bold transition"
                      >
                        WhatsApp
                      </button>
                      {(r.status === "failed" || r.status === "cancelled") && (
                        <button
                          type="button"
                          onClick={() => retryResult(r)}
                          className="bg-amber-500/15 border border-amber-500/30 text-amber-300 px-3 py-1.5 rounded-full text-[11px] font-bold hover:bg-amber-500/25 transition"
                        >
                          ↻ Retry
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}

            {hasResults && filtered.length === 0 && (
              <p className="text-center text-xs text-zinc-500 py-6">
                No results match “{query}”.
              </p>
            )}
          </div>
        </section>

        {/* ---------------- COMPLETE GUIDE ---------------- */}
        <div className="mt-12 max-w-4xl mx-auto">
          <h2 className="text-lg sm:text-xl font-bold mb-4">
            Complete Guide — Learn OCR in Detail
          </h2>

          <Accordion
            open={openSec === "what"}
            onToggle={() => setOpenSec(openSec === "what" ? "" : "what")}
            title="1. What is Image-to-Text OCR technology?"
          >
            <div className="space-y-3">
              <p>
                OCR stands for <b className="text-white">Optical Character
                Recognition</b>. It converts scanned documents, PDF files or
                camera images into editable, searchable data. This tool runs
                Tesseract.js (originally by HP, now maintained by Google)
                entirely inside your browser using WebAssembly — your files
                never leave your device.
              </p>
              <p>
                <b className="text-white">The 4 stages:</b> 1) Pre-processing —
                rotate, crop, upscale, adjust brightness/contrast, optionally
                binarise to pure black &amp; white. 2) Layout analysis — detect
                blocks and text lines. 3) Character recognition — match glyphs
                against the trained model for the language you selected. 4)
                Post-processing — rebuild words and sentences. Printed text
                typically reaches 98–99% accuracy on clean images.
              </p>
            </div>
          </Accordion>

          <Accordion
            open={openSec === "how"}
            onToggle={() => setOpenSec(openSec === "how" ? "" : "how")}
            title="2. How to Use — Complete Step-by-Step Guide (Every Option Explained)"
          >
            <div className="space-y-5">
              <div>
                <h3 className="text-white font-bold text-sm mb-2">
                  🚀 Step 1 — Choose Your Input Method
                </h3>
                <ul className="space-y-2 pl-4 list-disc marker:text-zinc-600">
                  <li>
                    <b className="text-white">📁 Upload Image / PDF / TIFF</b> —
                    Best for files already on your device. Accepts JPG, PNG,
                    WEBP, BMP, GIF, TIFF (including multi-page), and PDF. Up to{" "}
                    <b>10 files at once</b>.
                  </li>
                  <li>
                    <b className="text-white">📷 Live Camera</b> — Opens your
                    phone's camera. Tap <b>Flip</b> to switch cameras, then{" "}
                    <b>Capture</b> to instantly run OCR.
                  </li>
                  <li>
                    <b className="text-white">📄 PDF Only</b> — Strictly for
                    PDF files. Each page is rendered at 3× resolution for
                    maximum accuracy.
                  </li>
                  <li>
                    <b className="text-white">Drag &amp; Drop Box</b> — On
                    desktop, drag files directly onto the dashed area.
                  </li>
                  <li>
                    <b className="text-white">Ctrl + V (Paste)</b> — Copy any
                    image and press Ctrl+V to auto-OCR it.
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-white font-bold text-sm mb-2">
                  🌐 Step 2 — Select the OCR Language
                </h3>
                <p>
                  Choose your language from the top-right dropdown.{" "}
                  <b>Tesseract uses a different trained model per language</b>,
                  so correct selection is critical.
                </p>
                <p className="mt-2">
                  <b className="text-white">Auto language detect</b> — when
                  enabled, if you leave language on "Hindi" but the image looks
                  like Latin script, the tool auto-switches to English.
                </p>
                <p className="mt-2 text-zinc-500 text-xs">
                  ⚠️ Wrong language = garbage output. For mixed content use a
                  combined option like "Hindi + English".
                </p>
              </div>

              <div>
                <h3 className="text-white font-bold text-sm mb-2">
                  🔬 Step 3 — Advanced OCR (Now Visible at Top!)
                </h3>
                <p>
                  <b className="text-emerald-300">
                    New in this version:
                  </b>{" "}
                  The Advanced OCR panel now sits <b>directly below the upload
                  buttons</b>, highlighted with an animated border. You don't
                  need to open the settings first anymore.
                </p>
                <div className="mt-3 rounded-xl border border-zinc-800 bg-black/30 p-3">
                  <p className="text-white text-xs font-bold mb-2">
                    📄 Page Segmentation Mode (PSM)
                  </p>
                  <p className="text-xs mb-2">
                    Tells Tesseract <b>how the text is arranged</b>. Choosing
                    the right mode dramatically improves accuracy.
                  </p>
                  <ul className="space-y-1.5 pl-4 list-disc marker:text-zinc-600 text-xs">
                    <li><b>PSM 3</b> — Fully automatic (default)</li>
                    <li><b>PSM 6 ⭐</b> — Single uniform block (best for most documents)</li>
                    <li><b>PSM 4</b> — Single column of text</li>
                    <li><b>PSM 11</b> — Sparse text (receipts, business cards)</li>
                    <li><b>PSM 7</b> — Single text line</li>
                    <li><b>PSM 8</b> — Single word</li>
                    <li><b>PSM 13</b> — Raw line (no post-processing)</li>
                  </ul>
                </div>
                <div className="mt-3 rounded-xl border border-zinc-800 bg-black/30 p-3">
                  <p className="text-white text-xs font-bold mb-2">
                    ✅ Character whitelist
                  </p>
                  <p className="text-xs mb-2">
                    Restrict recognition to specific characters only. Wrong
                    characters are eliminated, boosting accuracy.
                  </p>
                  <ul className="space-y-1.5 pl-4 list-disc marker:text-zinc-600 text-xs">
                    <li><b>Numbers only</b> → <code className="bg-black px-1 rounded text-[10px]">0123456789</code></li>
                    <li><b>Numbers + decimals</b> → <code className="bg-black px-1 rounded text-[10px]">0123456789.,</code></li>
                    <li><b>Uppercase only</b> → <code className="bg-black px-1 rounded text-[10px]">ABCDEFGHIJKLMNOPQRSTUVWXYZ</code></li>
                    <li><b>Alphanumeric</b> → <code className="bg-black px-1 rounded text-[10px]">0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ</code></li>
                    <li><b>Blank</b> — allows all characters</li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="text-white font-bold text-sm mb-2">
                  ⚙️ Step 4 — Image Enhancement
                </h3>
                <p>
                  Tap <b>"Image Enhancement &amp; OCR Settings"</b> below the
                  Advanced panel (also animated). These controls apply to the
                  <b> next OCR run</b>.
                </p>

                <div className="mt-3 space-y-3">
                  <div className="rounded-xl border border-zinc-800 bg-black/30 p-3">
                    <p className="text-white text-xs font-bold mb-1">
                      ☀️ Brightness (50% – 150%)
                    </p>
                    <p className="text-xs">
                      Faded scans try <b>120–130%</b>. Overexposed photos try{" "}
                      <b>80–90%</b>.
                    </p>
                  </div>
                  <div className="rounded-xl border border-zinc-800 bg-black/30 p-3">
                    <p className="text-white text-xs font-bold mb-1">
                      🌗 Contrast (50% – 200%)
                    </p>
                    <p className="text-xs">
                      Blurry documents — <b>130–150%</b>.
                    </p>
                  </div>
                  <div className="rounded-xl border border-zinc-800 bg-black/30 p-3">
                    <p className="text-white text-xs font-bold mb-1">
                      🔄 Rotate (0° – 359°)
                    </p>
                    <p className="text-xs">
                      Rotates the image. The canvas expands automatically, so
                      corners are never cropped.
                    </p>
                  </div>
                  <div className="rounded-xl border border-zinc-800 bg-black/30 p-3">
                    <p className="text-white text-xs font-bold mb-1">
                      ⚫ Grayscale toggle
                    </p>
                    <p className="text-xs">
                      Converts colour images to black &amp; white. Useful for
                      coloured backgrounds.
                    </p>
                  </div>
                  <div className="rounded-xl border border-zinc-800 bg-black/30 p-3">
                    <p className="text-white text-xs font-bold mb-1">
                      ⚪ Black &amp; White (Binarisation)
                    </p>
                    <p className="text-xs">
                      Best for old/faded documents, receipts, forms.
                    </p>
                  </div>
                  <div className="rounded-xl border border-zinc-800 bg-black/30 p-3">
                    <p className="text-white text-xs font-bold mb-1">
                      🎚️ Binarisation threshold (60 – 220)
                    </p>
                    <p className="text-xs">Default <b>160</b> works for most.</p>
                  </div>
                  <div className="rounded-xl border border-zinc-800 bg-black/30 p-3">
                    <p className="text-white text-xs font-bold mb-1">
                      🔍 Auto upscale toggle
                    </p>
                    <p className="text-xs">Recommended <b>ON.</b></p>
                  </div>
                  <div className="rounded-xl border border-zinc-800 bg-black/30 p-3">
                    <p className="text-white text-xs font-bold mb-1">
                      ✨ Auto clean text toggle
                    </p>
                    <p className="text-xs">Fixes extra spaces and blank lines.</p>
                  </div>
                  <div className="rounded-xl border border-violet-500/30 bg-violet-500/5 p-3">
                    <p className="text-violet-200 text-xs font-bold mb-1">
                      🔤 Font Size (10px – 22px)
                    </p>
                    <p className="text-xs text-zinc-300">
                      Changes the text size in every result text area. Use{" "}
                      <b>Ctrl + ↑ / ↓</b> for quick changes.
                    </p>
                  </div>
                  <div className="rounded-xl border border-sky-500/30 bg-sky-500/5 p-3">
                    <p className="text-sky-200 text-xs font-bold mb-1">
                      🌐 Auto language detect toggle
                    </p>
                    <p className="text-xs text-zinc-300">
                      Prevents the most common "wrong language" mistake.
                    </p>
                  </div>
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3">
                    <p className="text-amber-200 text-xs font-bold mb-1">
                      📊 Show line confidence toggle
                    </p>
                    <p className="text-xs text-zinc-300">
                      Result text becomes a read-only view where each line is
                      colour coded: <span className="conf-low px-1">Red</span>{" "}
                      (&lt;60%), <span className="conf-mid px-1">Amber</span>{" "}
                      (60–80%), no colour (80%+).
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-white font-bold text-sm mb-2">
                  ✂️ Step 5 — Crop Tool (Manual 4-Corner Drag)
                </h3>
                <p>
                  After OCR completes, each result has a{" "}
                  <b className="text-white">✂️ Crop</b> button. Drag any of
                  the 4 white corner handles to trim. Tap <b>Apply Crop</b> to
                  re-run OCR on just that region.
                </p>
              </div>

              <div>
                <h3 className="text-white font-bold text-sm mb-2">
                  📜 Step 6 — OCR History (Date-wise)
                </h3>
                <p>
                  Every successful OCR is saved automatically. Open with{" "}
                  <b>📜 History</b> in the header or{" "}
                  <kbd className="px-1.5 py-0.5 rounded border border-zinc-700 bg-black text-[10px]">Ctrl+Shift+H</kbd>.
                </p>
              </div>

              <div>
                <h3 className="text-white font-bold text-sm mb-2">
                  ⌨️ Step 7 — Keyboard Shortcuts
                </h3>
                <ul className="space-y-1.5 pl-4 list-disc marker:text-zinc-600">
                  <li><kbd className="px-1.5 py-0.5 rounded border border-zinc-700 bg-black text-[10px]">Ctrl+Shift+O</kbd> — Upload</li>
                  <li><kbd className="px-1.5 py-0.5 rounded border border-zinc-700 bg-black text-[10px]">Ctrl+Shift+K</kbd> — Camera</li>
                  <li><kbd className="px-1.5 py-0.5 rounded border border-zinc-700 bg-black text-[10px]">Ctrl+Shift+H</kbd> — History</li>
                  <li><kbd className="px-1.5 py-0.5 rounded border border-zinc-700 bg-black text-[10px]">Ctrl+Shift+S</kbd> — Copy all</li>
                  <li><kbd className="px-1.5 py-0.5 rounded border border-zinc-700 bg-black text-[10px]">Ctrl+Shift+/</kbd> — Clear</li>
                  <li><kbd className="px-1.5 py-0.5 rounded border border-zinc-700 bg-black text-[10px]">Ctrl+↑ / ↓</kbd> — Font size</li>
                  <li><kbd className="px-1.5 py-0.5 rounded border border-zinc-700 bg-black text-[10px]">Esc</kbd> — Close modals</li>
                </ul>
              </div>

              <div>
                <h3 className="text-white font-bold text-sm mb-2">
                  📄 Step 8 — Multi-page TIFF Support
                </h3>
                <p>
                  Upload a multi-page TIFF and every page is extracted and OCR'd
                  separately. Each page becomes its own result card.
                </p>
              </div>

              <div>
                <h3 className="text-white font-bold text-sm mb-2">
                  🔗 Step 9 — Explore Other Tools
                </h3>
                <p>
                  Scroll to the bottom of this page to find the{" "}
                  <b className="text-white">"Other Useful Tools"</b> grid —
                  animated cards linking to Lorem Ipsum Generator, Image
                  Compressor, PDF Tools, and more.
                </p>
              </div>

              <div>
                <h3 className="text-white font-bold text-sm mb-2">
                  💾 Step 10 — Export &amp; Share
                </h3>
                <ul className="space-y-2 pl-4 list-disc marker:text-zinc-600">
                  <li><b>Copy All</b> — clipboard</li>
                  <li><b>TXT</b> — plain text (combined)</li>
                  <li><b>ZIP</b> — separate .txt per file</li>
                  <li><b>PDF</b> — Unicode-safe combined PDF</li>
                  <li><b>CSV</b> — Excel-friendly metadata</li>
                  <li><b>Share</b> — native share sheet or WhatsApp fallback</li>
                  <li><b>Per-file</b>: Copy · TXT · PDF · DOC · ✂️ Crop · WhatsApp</li>
                </ul>
              </div>
            </div>
          </Accordion>

          <Accordion
            open={openSec === "why"}
            onToggle={() => setOpenSec(openSec === "why" ? "" : "why")}
            title="3. Why This Tool Is Better — Features &amp; Use Cases"
          >
            <ul className="list-disc pl-5 space-y-1.5">
              <li>100% private — processing happens on-device, no uploads.</li>
              <li>Batch OCR with a shared Tesseract worker (much faster).</li>
              <li>Non-destructive rotation that never crops your image.</li>
              <li>Advanced OCR panel always visible at the top.</li>
              <li>Manual crop tool with 4-corner drag.</li>
              <li>Line-by-line confidence colour coding.</li>
              <li>Auto language detect — prevents the #1 mistake.</li>
              <li>Keyboard shortcuts — power users fly through batches.</li>
              <li>Font size control — accessible for every screen.</li>
              <li>Multi-page TIFF support — scanners and faxes just work.</li>
              <li>Date-wise OCR history — 200 entries with search, star, and load-back.</li>
              <li>Unicode-safe PDF/DOC export — Hindi, Arabic and CJK.</li>
              <li>Live camera capture, clipboard paste, drag &amp; drop.</li>
              <li>Export to TXT, DOC, per-file PDF, combined PDF, CSV or ZIP.</li>
              <li>Auto-save — your last 20 results survive a page refresh.</li>
            </ul>
          </Accordion>

          <Accordion
            open={openSec === "features"}
            onToggle={() => setOpenSec(openSec === "features" ? "" : "features")}
            title="4. ⭐ Complete Feature List — Every Single Thing This Tool Does"
            highlight
          >
            <div className="space-y-4">
              <p className="text-zinc-200">
                <b className="text-white">Complete feature breakdown</b>.
              </p>

              <div>
                <h3 className="text-white font-bold text-sm mb-2">
                  📥 Input Methods (5 Ways)
                </h3>
                <ul className="space-y-1.5 pl-4 list-disc marker:text-zinc-600">
                  <li>Upload button — images, PDFs and TIFFs</li>
                  <li>Dedicated PDF-only button</li>
                  <li>Live camera capture with flip</li>
                  <li>Drag &amp; drop zone</li>
                  <li>Clipboard paste (Ctrl+V)</li>
                  <li>Multi-page TIFF</li>
                </ul>
              </div>

              <div>
                <h3 className="text-white font-bold text-sm mb-2">
                  🔬 Advanced OCR (Now Visible at Top)
                </h3>
                <ul className="space-y-1.5 pl-4 list-disc marker:text-zinc-600">
                  <li>Advanced OCR panel below upload buttons</li>
                  <li>Also accessible inside settings (double access)</li>
                  <li>7 Page Segmentation Modes</li>
                  <li>Character whitelist</li>
                </ul>
              </div>

              <div>
                <h3 className="text-white font-bold text-sm mb-2">
                  ✂️ Manual Crop Tool
                </h3>
                <ul className="space-y-1.5 pl-4 list-disc marker:text-zinc-600">
                  <li>Per-result ✂️ Crop button</li>
                  <li>4-corner drag handles with dark overlay</li>
                  <li>Reset · Apply → re-runs OCR on cropped region</li>
                </ul>
              </div>

              <div>
                <h3 className="text-white font-bold text-sm mb-2">
                  ⌨️ Keyboard Shortcuts
                </h3>
                <ul className="space-y-1.5 pl-4 list-disc marker:text-zinc-600">
                  <li>Ctrl+Shift+O — upload</li>
                  <li>Ctrl+Shift+K — camera</li>
                  <li>Ctrl+Shift+H — history</li>
                  <li>Ctrl+Shift+S — copy all</li>
                  <li>Ctrl+Shift+/ — clear all</li>
                  <li>Ctrl+↑ / ↓ — font size</li>
                  <li>Esc — close modals</li>
                </ul>
              </div>

              <div>
                <h3 className="text-white font-bold text-sm mb-2">
                  📊 Line-by-Line Confidence
                </h3>
                <ul className="space-y-1.5 pl-4 list-disc marker:text-zinc-600">
                  <li>Red (&lt;60%), Amber (60–80%), no highlight (80%+)</li>
                  <li>Hover for exact percentage</li>
                  <li>Weak line count on result card</li>
                </ul>
              </div>

              <div>
                <h3 className="text-white font-bold text-sm mb-2">
                  🔤 Font Size Control
                </h3>
                <ul className="space-y-1.5 pl-4 list-disc marker:text-zinc-600">
                  <li>10px to 22px</li>
                  <li>Ctrl+↑ / ↓ shortcut</li>
                </ul>
              </div>

              <div>
                <h3 className="text-white font-bold text-sm mb-2">
                  📜 OCR History (Date-wise)
                </h3>
                <ul className="space-y-1.5 pl-4 list-disc marker:text-zinc-600">
                  <li>Up to 200 entries, local only</li>
                  <li>Grouped by Today / Yesterday / date</li>
                  <li>Search · ⭐ Star · Load · Delete</li>
                </ul>
              </div>

              <div>
                <h3 className="text-white font-bold text-sm mb-2">
                  🌐 Auto Language Detect
                </h3>
                <ul className="space-y-1.5 pl-4 list-disc marker:text-zinc-600">
                  <li>Lightweight pixel analysis</li>
                  <li>Defaults Latin-script images to English</li>
                </ul>
              </div>

              <div>
                <h3 className="text-white font-bold text-sm mb-2">
                  📄 Multi-page TIFF
                </h3>
                <ul className="space-y-1.5 pl-4 list-disc marker:text-zinc-600">
                  <li>Every page = its own result card</li>
                  <li>Handled by UTIF.js (on-demand)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-white font-bold text-sm mb-2">
                  🖼️ Image Enhancement (8 Controls)
                </h3>
                <ul className="space-y-1.5 pl-4 list-disc marker:text-zinc-600">
                  <li>Brightness (50–150%)</li>
                  <li>Contrast (50–200%)</li>
                  <li>Rotation (0–359°) with canvas expansion</li>
                  <li>Grayscale · B&amp;W · Threshold (60–220)</li>
                  <li>Auto-upscale · Auto text cleanup</li>
                </ul>
              </div>

              <div>
                <h3 className="text-white font-bold text-sm mb-2">
                  🌐 Languages (12 Combinations)
                </h3>
                <ul className="space-y-1.5 pl-4 list-disc marker:text-zinc-600">
                  <li>English, Hindi, Hindi+English</li>
                  <li>Spanish, French, German, Portuguese, Russian</li>
                  <li>Arabic (RTL support)</li>
                  <li>Chinese, Japanese, Korean</li>
                </ul>
              </div>

              <div>
                <h3 className="text-white font-bold text-sm mb-2">
                  📊 Result Management
                </h3>
                <ul className="space-y-1.5 pl-4 list-disc marker:text-zinc-600">
                  <li>Editable text (font size control)</li>
                  <li>Word count + reading time</li>
                  <li>Status badge + progress bar</li>
                  <li>Filter · Retry · Remove</li>
                  <li>Statistics dashboard</li>
                </ul>
              </div>

              <div>
                <h3 className="text-white font-bold text-sm mb-2">
                  🔤 Text Transformation
                </h3>
                <ul className="space-y-1.5 pl-4 list-disc marker:text-zinc-600">
                  <li>UPPERCASE · lowercase · Title Case</li>
                  <li>Find &amp; Replace across all files</li>
                </ul>
              </div>

              <div>
                <h3 className="text-white font-bold text-sm mb-2">
                  💾 Export Formats (7 Options)
                </h3>
                <ul className="space-y-1.5 pl-4 list-disc marker:text-zinc-600">
                  <li>Copy · TXT · ZIP · PDF · CSV · DOC · per-file PDF</li>
                </ul>
              </div>

              <div>
                <h3 className="text-white font-bold text-sm mb-2">
                  📤 Sharing
                </h3>
                <ul className="space-y-1.5 pl-4 list-disc marker:text-zinc-600">
                  <li>Native share sheet · .txt · plain text</li>
                  <li>WhatsApp direct share</li>
                  <li>Clipboard fallback</li>
                </ul>
              </div>

              <div>
                <h3 className="text-white font-bold text-sm mb-2">
                  🔗 Tools Hub Integration
                </h3>
                <ul className="space-y-1.5 pl-4 list-disc marker:text-zinc-600">
                  <li>Animated "Other Useful Tools" grid</li>
                  <li>Click any card → navigate to sibling tool</li>
                  <li>Hover: gradient glow + shimmer + lift</li>
                </ul>
              </div>

              <div>
                <h3 className="text-white font-bold text-sm mb-2">
                  🔒 Privacy &amp; Performance
                </h3>
                <ul className="space-y-1.5 pl-4 list-disc marker:text-zinc-600">
                  <li>100% on-device processing (WebAssembly)</li>
                  <li>No uploads to any server</li>
                  <li>Shared Tesseract worker</li>
                  <li>Auto-save results (last 20) + history (last 200)</li>
                  <li>PDF multi-page (25 pages) · TIFF unlimited</li>
                  <li>Batch up to 10 files · Cancel-all button</li>
                </ul>
              </div>

              <div className="rounded-xl border border-violet-500/30 bg-violet-500/5 p-3">
                <p className="text-violet-200 text-xs">
                  <b>Total: 75+ features</b> — the most complete browser-based
                  OCR tool available, free, private, no account required.
                </p>
              </div>
            </div>
          </Accordion>

          <Accordion
            open={openSec === "best"}
            onToggle={() => setOpenSec(openSec === "best" ? "" : "best")}
            title="5. 🏆 Why This Is the Best OCR Tool — Better Than Every Other Option"
            highlight
          >
            <div className="space-y-4">
              <p className="text-zinc-200">
                Most online OCR tools look similar. There is a massive
                difference in <b className="text-white">how</b> they work.
              </p>

              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3">
                <p className="text-emerald-200 text-xs font-bold mb-1">
                  🔒 1. Your Files Never Leave Your Device
                </p>
                <p className="text-xs text-zinc-300">
                  Most "free OCR" websites upload your documents. This tool
                  runs Tesseract.js entirely in your browser. <b>Zero uploads.
                  Zero tracking. Zero risk.</b>
                </p>
              </div>

              <div className="rounded-xl border border-sky-500/30 bg-sky-500/5 p-3">
                <p className="text-sky-200 text-xs font-bold mb-1">
                  ⚡ 2. Batch Processing With a Shared Worker
                </p>
                <p className="text-xs text-zinc-300">
                  Keeps a <b>single Tesseract worker in memory</b> — processing
                  10 files is nearly as fast as processing 1.
                </p>
              </div>

              <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3">
                <p className="text-amber-200 text-xs font-bold mb-1">
                  🎯 3. Professional-Grade Accuracy Controls
                </p>
                <p className="text-xs text-zinc-300">
                  Advanced OCR tools charge hundreds for these. Here you get
                  them <b>free</b> — and now <b>always visible at the top</b>.
                </p>
              </div>

              <div className="rounded-xl border border-fuchsia-500/30 bg-fuchsia-500/5 p-3">
                <p className="text-fuchsia-200 text-xs font-bold mb-1">
                  🌏 4. True Unicode Support
                </p>
                <p className="text-xs text-zinc-300">
                  Rasterises text through your browser's own font engine —
                  Devanagari, Arabic, CJK all export perfectly.
                </p>
              </div>

              <div className="rounded-xl border border-violet-500/30 bg-violet-500/5 p-3">
                <p className="text-violet-200 text-xs font-bold mb-1">
                  📜 5. Date-wise OCR History
                </p>
                <p className="text-xs text-zinc-300">
                  Every successful OCR is stored with a timestamp, grouped by
                  day, searchable, starrable.
                </p>
              </div>

              <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-3">
                <p className="text-rose-200 text-xs font-bold mb-1">
                  💸 6. Genuinely Free — No Hidden Limits
                </p>
                <p className="text-xs text-zinc-300">
                  No accounts, no ads, no daily limits, no watermarks.
                </p>
              </div>

              <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-3">
                <p className="text-cyan-200 text-xs font-bold mb-1">
                  ⌨️ 7. Power-User Shortcuts
                </p>
                <p className="text-xs text-zinc-300">
                  Keyboard shortcuts for every action, plus font-size control.
                </p>
              </div>

              <div className="rounded-xl border border-teal-500/30 bg-teal-500/5 p-3">
                <p className="text-teal-200 text-xs font-bold mb-1">
                  📄 8. Scanners &amp; Faxes Just Work
                </p>
                <p className="text-xs text-zinc-300">
                  Multi-page TIFF support — whatever your scanner outputs,
                  this tool reads it.
                </p>
              </div>

              <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-3">
                <p className="text-indigo-200 text-xs font-bold mb-1">
                  🏅 Bottom Line
                </p>
                <p className="text-xs text-zinc-300">
                  If you want a tool that respects privacy, gives you
                  professional controls, exports in every format, works on any
                  device, and never charges you — this is it.
                </p>
              </div>
            </div>
          </Accordion>

          <Accordion
            open={openSec === "seo"}
            onToggle={() => setOpenSec(openSec === "seo" ? "" : "seo")}
            title="6. Related searches &amp; keywords"
          >
            <p>
              image to text, batch OCR, JPG to text, PNG to text, photo to text
              converter, free OCR online, Hindi OCR, Tamil OCR, PDF to text,
              camera OCR, handwritten text recognition, receipt scanner,
              screenshot to text, OCR without uploading, offline OCR,
              multi-page TIFF OCR, line confidence OCR, crop OCR.
            </p>
          </Accordion>
        </div>

        <div className="mt-10 max-w-4xl mx-auto">
          <h2 className="text-lg sm:text-xl font-bold mb-4">
            Frequently asked questions
          </h2>
          {[
            {
              q: "Where is the Advanced OCR panel now?",
              a: "It's now visible directly at the top, just below the upload buttons, highlighted with an animated gradient border. You can also find it inside Settings for convenience.",
            },
            {
              q: "Why couldn't I upload a PDF before?",
              a: "Fixed. The main Upload button now accepts images, PDFs AND TIFFs, and there is a dedicated PDF-only button.",
            },
            {
              q: "What does the Share button share?",
              a: "It shares the extracted TEXT, not the URL. Native share sheet first, then plain text, then clipboard + WhatsApp fallback.",
            },
            {
              q: "How does the manual Crop tool work?",
              a: "Open any result and tap ✂️ Crop. Drag the 4 corner handles to select just the region you want, then tap Apply Crop. The tool re-runs OCR on only that cropped region.",
            },
            {
              q: "What is line-by-line confidence?",
              a: "Turn on 'Show line confidence' in Settings. Result text becomes a colour-coded read-only view: red (<60%), amber (60–80%), no colour (80%+).",
            },
            {
              q: "How does Auto language detect work?",
              a: "When enabled, if you have 'Hindi' selected but the image looks like Latin script, the tool auto-switches to English for that file.",
            },
            {
              q: "Where is my history stored?",
              a: "Entirely in your browser's localStorage on this device. Up to 200 entries. Nothing is synced.",
            },
            {
              q: "Does multi-page TIFF work?",
              a: "Yes. Every page is extracted and OCR'd separately using UTIF.js (loaded on demand).",
            },
            {
              q: "Which keyboard shortcuts are supported?",
              a: "Ctrl+Shift+O (upload), Ctrl+Shift+K (camera), Ctrl+Shift+H (history), Ctrl+Shift+S (copy all), Ctrl+Shift+/ (clear), Ctrl+↑/↓ (font size), Esc (close modals).",
            },
            {
              q: "Is my data uploaded anywhere?",
              a: "No. Tesseract runs via WebAssembly in your browser. Only network requests: Tesseract engine, language models, PDF.js worker, UTIF.js (only if you upload TIFF).",
            },
            {
              q: "How do I get 100% accuracy?",
              a: "Sharp photo, PSM 6 (or 7 for single lines), Auto upscale ON, B&W binarisation ON, correct language, use Crop tool. Reaches 99%+ confidence on clean scans.",
            },
            {
              q: "How large can my files be?",
              a: `Up to ${MAX_FILES} files per batch, 25 MB each, first ${MAX_PDF_PAGES} pages of any PDF, unlimited pages in a TIFF.`,
            },
            {
              q: "Where are the other tools?",
              a: "Scroll to the bottom of this page — you'll find the animated 'Other Useful Tools' grid with links to Lorem Ipsum Generator, Image Compressor, PDF Tools and more.",
            },
          ].map((f, i) => (
            <div
              key={i}
              className="border border-zinc-800 rounded-2xl bg-zinc-900/40 mt-3 overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                aria-expanded={openFaq === i}
                className="w-full flex items-center justify-between gap-3 p-4 sm:p-5 text-left"
              >
                <span
                  className="font-semibold text-[13px] sm:text-sm"
                  dangerouslySetInnerHTML={{ __html: f.q }}
                />
                <span
                  className={`shrink-0 w-7 h-7 grid place-items-center rounded-full border border-zinc-700 text-sm transition-all duration-300 ${
                    openFaq === i ? "rotate-45 bg-white text-black" : "bg-zinc-800"
                  }`}
                >
                  +
                </span>
              </button>
              <div
                className={`grid transition-all duration-300 ${
                  openFaq === i
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <p className="px-4 sm:px-5 pb-5 text-xs text-zinc-400 leading-6">
                    {f.a}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ---------------- OTHER USEFUL TOOLS ---------------- */}
        <section className="mt-16 max-w-6xl mx-auto">
          <div className="relative rounded-3xl border border-transparent bg-gradient-to-br from-violet-500/20 via-fuchsia-500/15 to-amber-500/20 p-[1.5px] shadow-[0_0_50px_-20px_rgba(168,85,247,0.6)]">
            <div className="rounded-3xl bg-[#0a0a0b] p-5 sm:p-8">
              <div className="text-center mb-6">
                <p className="text-[11px] uppercase tracking-[0.2em] text-violet-300 font-bold mb-2">
                  More from Lorem Pro Tool
                </p>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-200 via-fuchsia-200 to-amber-200 bg-clip-text text-transparent">
                  Other Useful Tools
                </h2>
                <p className="text-xs sm:text-sm text-zinc-500 mt-2 max-w-xl mx-auto">
                  One hub, many tools. All free, all private, all in your
                  browser.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {OTHER_TOOLS.map((t) => (
                  <a
                    key={t.title}
                    href={t.href}
                    className="tool-card group rounded-2xl border border-zinc-800 bg-black/40 p-4 hover:border-transparent"
                  >
                    <div className="flex items-start gap-3">
                      <span className="tool-icon text-2xl shrink-0">{t.icon}</span>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-sm text-white truncate">
                          {t.title}
                        </p>
                        <p className="text-[11px] text-zinc-500 mt-1 leading-5">
                          {t.desc}
                        </p>
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-violet-300 mt-2 group-hover:text-fuchsia-300 transition-colors">
                          Open tool
                          <span className="transition-transform duration-300 group-hover:translate-x-1">
                            →
                          </span>
                        </span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>

              <div className="mt-6 text-center">
                <a
                  href="/"
                  className="inline-flex items-center gap-2 rounded-full bg-white text-black px-5 py-2.5 text-xs font-bold hover:bg-zinc-200 active:scale-95 transition"
                >
                  Explore all tools
                  <span>↗</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        <footer className="mt-14 text-center text-[11px] text-zinc-600">
          Built with Tesseract.js · PDF.js · jsPDF · JSZip · UTIF.js —
          everything runs in your browser.
        </footer>
      </main>

      {/* HISTORY DRAWER */}
      {showHistory && (
        <div
          className="fixed inset-0 z-[62] bg-black/80 backdrop-blur-sm"
          onClick={() => setShowHistory(false)}
        >
          <aside
            onClick={(e) => e.stopPropagation()}
            className="absolute right-0 top-0 h-full w-full sm:w-[480px] bg-[#0a0a0b] border-l border-zinc-800 flex flex-col"
          >
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between gap-2">
              <div>
                <p className="font-bold text-sm">📜 OCR History</p>
                <p className="text-[10px] text-zinc-500">
                  {history.length} entries · stored on this device only
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowHistory(false)}
                aria-label="Close history"
                className="w-8 h-8 grid place-items-center rounded-full border border-zinc-700 hover:bg-zinc-800"
              >
                ✕
              </button>
            </div>

            <div className="p-3 border-b border-zinc-800 space-y-2">
              <input
                value={historyQuery}
                onChange={(e) => setHistoryQuery(e.target.value)}
                placeholder="🔎 Search history…"
                className="w-full bg-black/50 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs outline-none focus:border-zinc-600"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={clearHistory}
                  disabled={!history.length}
                  className="flex-1 py-2 rounded-xl text-[11px] font-bold border border-red-500/30 text-red-400 disabled:opacity-40 hover:bg-red-500/10 transition"
                >
                  Clear history
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-3 space-y-4">
              {groupedHistory.length === 0 && (
                <p className="text-center text-xs text-zinc-500 py-10">
                  {history.length === 0
                    ? "No history yet. Complete an OCR to start building your log."
                    : `No entries match "${historyQuery}".`}
                </p>
              )}
              {groupedHistory.map(([k, entries]) => (
                <div key={k}>
                  <p className="text-[10px] uppercase tracking-wide text-zinc-500 font-bold mb-2">
                    {relativeDay(entries[0].date)}
                  </p>
                  <div className="space-y-2">
                    {entries.map((h) => (
                      <div
                        key={h.id}
                        className="rounded-xl border border-zinc-800 bg-black/40 p-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-[11px] font-bold truncate" title={h.name}>
                              {h.starred && <span className="text-amber-400 mr-1">⭐</span>}
                              {h.name}
                            </p>
                            <p className="text-[10px] text-zinc-500 mt-0.5">
                              {formatDate(h.date)} · {h.confidence}% conf. ·{" "}
                              {h.words} words · {h.lang}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => toggleStar(h.id)}
                              title="Star"
                              className="w-6 h-6 grid place-items-center rounded-full border border-zinc-800 text-zinc-500 hover:text-amber-400 hover:border-amber-500/40 text-xs"
                            >
                              {h.starred ? "★" : "☆"}
                            </button>
                            <button
                              type="button"
                              onClick={() => removeHistory(h.id)}
                              title="Delete"
                              className="w-6 h-6 grid place-items-center rounded-full border border-zinc-800 text-zinc-500 hover:text-red-400 hover:border-red-500/40 text-xs"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-2 line-clamp-3">
                          {h.text.slice(0, 240)}
                          {h.text.length > 240 ? "…" : ""}
                        </p>
                        <div className="flex gap-1.5 mt-2">
                          <button
                            type="button"
                            onClick={() => historyToResults(h)}
                            className="bg-white text-black px-3 py-1 rounded-full text-[10px] font-bold hover:bg-zinc-200"
                          >
                            Load
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                await navigator.clipboard.writeText(h.text);
                                showToast("Copied from history");
                              } catch {
                                showToast("Clipboard blocked", "err");
                              }
                            }}
                            className="bg-zinc-800 border border-zinc-700 px-3 py-1 rounded-full text-[10px] font-bold hover:border-zinc-500"
                          >
                            Copy
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              triggerDownload(
                                new Blob([h.text], { type: "text/plain;charset=utf-8" }),
                                `${safeName(h.name)}.txt`
                              )
                            }
                            className="bg-zinc-800 border border-zinc-700 px-3 py-1 rounded-full text-[10px] font-bold hover:border-zinc-500"
                          >
                            TXT ↓
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      )}

      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-sm grid place-items-center p-4 cursor-zoom-out"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightbox}
            alt="Processed preview"
            className="max-w-full max-h-[88vh] object-contain rounded-xl border border-zinc-800"
          />
          <button
            type="button"
            onClick={() => setLightbox(null)}
            aria-label="Close preview"
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-zinc-900 border border-zinc-700 grid place-items-center font-bold hover:bg-zinc-800 transition"
          >
            ✕
          </button>
        </div>
      )}

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-[70] px-5 py-3 rounded-full text-xs sm:text-sm font-bold shadow-2xl border max-w-[92vw] text-center ${
            toast.kind === "err"
              ? "bg-red-500 text-white border-red-400"
              : "bg-white text-black border-white"
          }`}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}
