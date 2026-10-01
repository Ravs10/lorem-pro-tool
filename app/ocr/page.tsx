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

const MAX_FILES = 10;
const MAX_SIZE = 25 * 1024 * 1024;
const MAX_PDF_PAGES = 25;

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

/* ------------------------------------------------------------------ */
/*  IMAGE PRE-PROCESSING                                               */
/* ------------------------------------------------------------------ */

interface PreOpts {
  brightness: number;
  contrast: number;
  rotate: number;
  grayscale: boolean;
  binarize: boolean;
  threshold: number;
  upscale: boolean;
}

const preprocess = (src: string, o: PreOpts): Promise<string> =>
  new Promise((resolve) => {
    const img = new Image();
    img.decoding = "sync";

    img.onload = () => {
      try {
        const rad = (o.rotate * Math.PI) / 180;
        const cos = Math.abs(Math.cos(rad));
        const sin = Math.abs(Math.sin(rad));

        const rotW = img.width * cos + img.height * sin;
        const rotH = img.width * sin + img.height * cos;

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
        ctx.drawImage(img, -img.width / 2, -img.height / 2, img.width, img.height);
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
/*  UI ATOMS                                                           */
/* ------------------------------------------------------------------ */

function Accordion({
  open,
  onToggle,
  title,
  children,
}: {
  open: boolean;
  onToggle: () => void;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 overflow-hidden mb-3">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-3 p-4 sm:p-5 text-left hover:bg-zinc-800/30 transition-colors"
      >
        <span className="font-semibold text-[13px] sm:text-[15px] leading-snug">{title}</span>
        <span
          className={`shrink-0 w-7 h-7 sm:w-8 sm:h-8 grid place-items-center rounded-full border border-zinc-700 text-sm transition-all duration-300 ${
            open ? "rotate-45 bg-white text-black" : "bg-zinc-800"
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
          <div className="px-4 sm:px-5 pb-5 text-[13px] sm:text-sm leading-7 text-zinc-400">
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
/*  PAGE                                                               */
/* ------------------------------------------------------------------ */

export default function Page() {
  const [results, setResults] = useState<OcrResult[]>([]);
  const [lang, setLang] = useState("eng+hin");
  const [toast, setToast] = useState<{ msg: string; kind: "ok" | "err" } | null>(null);
  const [busy, setBusy] = useState(false);

  // preprocessing
  const [brightness, setBrightness] = useState(110);
  const [contrast, setContrast] = useState(115);
  const [rotate, setRotate] = useState(0);
  const [grayscale, setGrayscale] = useState(false);
  const [binarize, setBinarize] = useState(false);
  const [threshold, setThreshold] = useState(160);
  const [upscale, setUpscale] = useState(true);
  const [autoTidy, setAutoTidy] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  // advanced
  const [psm, setPsm] = useState<string>("6");
  const [whitelist, setWhitelist] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  // camera
  const [showCamera, setShowCamera] = useState(false);
  const [facing, setFacing] = useState<"environment" | "user">("environment");
  const [cameraReady, setCameraReady] = useState(false);

  // misc UI
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

  /* -------- localStorage persistence -------- */
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
    } catch {}
    hydratedRef.current = true;
  }, []);

  useEffect(() => {
    if (!hydratedRef.current) return;
    try {
      const toStore = results.slice(-20).map((r) => ({
        ...r,
        preview: r.preview?.startsWith("data:") ? "" : "",
        original: "",
      }));
      localStorage.setItem("ocr-results-v1", JSON.stringify(toStore));
    } catch {}
  }, [results]);

  /* -------- worker -------- */
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

  /* -------- OCR job -------- */
  const runOCR = useCallback(
    async (src: string, name: string, previewUrl: string) => {
      const id = uid();
      const opts: PreOpts = {
        brightness,
        contrast,
        rotate,
        grayscale,
        binarize,
        threshold,
        upscale,
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
        const worker = await getWorker(lang);
        if (cancelRef.current) throw new Error("cancelled");

        // Apply PSM & whitelist if available
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
        patch({
          text,
          confidence: Math.round(data.confidence ?? 0),
          progress: 100,
          status: "done",
          message: "Completed",
          words: countWords(text),
        });
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

  /* -------- PDF -------- */
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

  /* -------- batch -------- */
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
        const isImage =
          file.type.startsWith("image/") ||
          /\.(png|jpe?g|webp|bmp|gif|tiff?)$/i.test(file.name);

        if (isPdf) {
          await handlePdf(file);
        } else if (isImage) {
          const url = URL.createObjectURL(file);
          urlsRef.current.push(url);
          await runOCR(url, file.name, url);
        } else {
          showToast(`Unsupported file: ${file.name}`, "err");
        }
      }

      setBusy(false);
      cancelRef.current = false;
    },
    [handlePdf, runOCR, showToast]
  );

  processRef.current = processFiles;

  /* -------- paste -------- */
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

  /* -------- camera -------- */
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

  /* -------- derived -------- */
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

  /* -------- actions -------- */
  const copyAll = async () => {
    if (!allText) return showToast("Nothing to copy", "err");
    try {
      await navigator.clipboard.writeText(allText);
      showToast("All text copied");
    } catch {
      showToast("Clipboard blocked by browser", "err");
    }
  };

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
      if (r.text) rows.push([r.name, String(r.confidence), String(countWords(r.text)), r.text.replace(/"/g, '""')]);
    });
    if (rows.length < 2) return showToast("Nothing to export", "err");
    const csv = rows
      .map((row) => row.map((c) => `"${c.replace(/"/g, '""')}"`).join(","))
      .join("\n");
    triggerDownload(new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" }), "ocr-results.csv");
  };

  /* -------- SHARE (FIXED) -------- */
  const handleShare = async () => {
    const text = allText;
    if (!text) return showToast("Nothing to share yet", "err");

    // 1) Try native file share
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
      // 2) Try native text share
      if (nav.share) {
        await nav.share({
          title: "OCR Result",
          text: text.length > 4000 ? text.slice(0, 4000) + "…" : text,
        });
        return;
      }
    } catch (e: any) {
      if (e?.name === "AbortError") return; // user cancelled
    }

    // 3) Fallback: copy + offer platform links
    try {
      await navigator.clipboard.writeText(text);
    } catch {}

    const encoded = encodeURIComponent(text.length > 1800 ? text.slice(0, 1800) + "…" : text);
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isMobile) {
      // On mobile open a chooser via WhatsApp; user can switch app
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
    await runOCR(r.original, r.name, r.original);
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

  /* -------- text tools -------- */
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

  /* -------- esc for lightbox -------- */
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
        @media (prefers-reduced-motion: reduce){ *{ transition:none !important; animation:none !important } }
      `}</style>

      {/* SINGLE HEADER (FIXED - duplicate removed) */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-[#070709]/85 border-b border-zinc-900">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 flex items-center justify-between gap-2">
          <a href="/" className="font-bold text-sm sm:text-base whitespace-nowrap">
            ⚡ Lorem Pro Tool
          </a>
          <div className="flex items-center gap-2">
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              aria-label="OCR language"
              className="bg-zinc-900 border border-zinc-800 rounded-full px-2.5 sm:px-3 py-2 text-[11px] font-bold outline-none focus:border-zinc-600 max-w-[120px] sm:max-w-[220px]"
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
              📁 Upload Image / PDF
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
            accept="image/*,application/pdf"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) processFiles(e.target.files);
              e.target.value = "";
            }}
          />
          {/* PDF-only now truly PDF-only (FIXED) */}
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

          <button
            type="button"
            onClick={() => setShowSettings((s) => !s)}
            aria-expanded={showSettings}
            className="mt-3 w-full flex items-center justify-between px-3 py-2.5 rounded-xl border border-zinc-800 bg-black/40 text-[11px] font-bold text-zinc-300 hover:border-zinc-700 transition"
          >
            <span>⚙️ Image enhancement &amp; OCR settings</span>
            <span className={`transition-transform ${showSettings ? "rotate-180" : ""}`}>
              ▾
            </span>
          </button>

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

              <button
                type="button"
                onClick={() => setShowAdvanced((s) => !s)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border border-zinc-800 bg-black/40 text-[11px] font-bold text-zinc-300 hover:border-zinc-700 transition"
              >
                <span>🔬 Advanced OCR (accuracy boost)</span>
                <span className={`transition-transform ${showAdvanced ? "rotate-180" : ""}`}>
                  ▾
                </span>
              </button>

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
                      Character whitelist (optional — leave empty for all)
                    </span>
                    <input
                      value={whitelist}
                      onChange={(e) => setWhitelist(e.target.value)}
                      placeholder="e.g. 0123456789  (numbers only)"
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
              {isDragActive ? "Drop files here 👇" : "Drop images or PDFs here (max 10)"}
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
              return (
                <article
                  key={r.id}
                  className="bg-black/60 border border-zinc-800 rounded-2xl p-3 sm:p-4 flex flex-col md:flex-row gap-3 sm:gap-4"
                >
                  <div className="flex md:flex-col items-center md:items-stretch gap-3 md:w-24 shrink-0">
                    <button
                      type="button"
                      onClick={() => setLightbox(r.preview)}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-zinc-800 shrink-0 group relative"
                      title="View larger"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={r.preview}
                        alt={r.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
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
                      </p>
                    )}

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
                      className="w-full mt-2.5 bg-zinc-900/80 border border-zinc-800 rounded-xl p-3 text-xs leading-6 h-32 sm:h-28 outline-none focus:border-white resize-y transition"
                    />

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
                rotate, upscale, adjust brightness/contrast, optionally
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
            title="2. How to use batch OCR, PDF &amp; camera capture"
          >
            <div className="space-y-2">
              <p>
                <b className="text-white">Upload:</b> click “Upload Image / PDF”,
                drag files onto the dashed box, or press{" "}
                <kbd className="px-1.5 py-0.5 rounded border border-zinc-700 bg-black text-[10px]">
                  Ctrl+V
                </kbd>{" "}
                to paste a screenshot. Up to {MAX_FILES} files per batch.
              </p>
              <p>
                <b className="text-white">PDF:</b> every page is rendered to a
                canvas at 3× scale and OCR'd individually (first{" "}
                {MAX_PDF_PAGES} pages).
              </p>
              <p>
                <b className="text-white">Camera:</b> opens the rear camera by
                default — tap Flip for the selfie camera, then Capture.
              </p>
              <p>
                <b className="text-white">Accuracy boost:</b> open Advanced OCR
                and choose PSM 6 for uniform blocks, PSM 11 for receipts, PSM 7
                for single lines. Use the whitelist for numbers-only scans.
              </p>
            </div>
          </Accordion>

          <Accordion
            open={openSec === "why"}
            onToggle={() => setOpenSec(openSec === "why" ? "" : "why")}
            title="3. Why this tool is better — features &amp; use cases"
          >
            <ul className="list-disc pl-5 space-y-1.5">
              <li>100% private — processing happens on-device, no uploads.</li>
              <li>Batch OCR with a shared Tesseract worker (much faster).</li>
              <li>Non-destructive rotation that never crops your image.</li>
              <li>Brightness, contrast, grayscale and B&amp;W binarisation.</li>
              <li>
                Advanced OCR controls — PSM mode + character whitelist for
                receipts, numbers and single lines.
              </li>
              <li>
                Unicode-safe PDF/DOC export — Hindi, Arabic and CJK render
                correctly (jsPDF's built-in fonts cannot do this).
              </li>
              <li>Live camera capture, clipboard paste, drag &amp; drop.</li>
              <li>
                Per-file confidence score, word count, reading time and result
                filtering.
              </li>
              <li>
                Text tools: UPPER/lower/Title case and Find &amp; Replace across
                all results.
              </li>
              <li>
                Export to TXT, DOC, per-file PDF, combined PDF, CSV or ZIP.
              </li>
              <li>Auto-save — your last 20 results survive a page refresh.</li>
            </ul>
          </Accordion>

          <Accordion
            open={openSec === "seo"}
            onToggle={() => setOpenSec(openSec === "seo" ? "" : "seo")}
            title="4. Related searches &amp; keywords"
          >
            <p>
              image to text, batch OCR, JPG to text, PNG to text, photo to text
              converter, free OCR online, Hindi OCR, Tamil OCR, PDF to text,
              camera OCR, handwritten text recognition, receipt scanner,
              screenshot to text, OCR without uploading, offline OCR.
            </p>
          </Accordion>
        </div>

        <div className="mt-10 max-w-4xl mx-auto">
          <h2 className="text-lg sm:text-xl font-bold mb-4">
            Frequently asked questions
          </h2>
          {[
            {
              q: "Why couldn't I upload a PDF before?",
              a: "Fixed. The main Upload button now accepts images AND PDFs, and there is a dedicated PDF-only button. Each PDF page is rendered at 3× scale before OCR.",
            },
            {
              q: "Drag &amp; drop did nothing?",
              a: "Fixed. The drop zone now highlights while you drag over it and handles the drop correctly — plus you can click it to open the file picker, or press Ctrl+V to paste an image.",
            },
            {
              q: "What does the Share button share?",
              a: "It shares the extracted TEXT, not the URL. First it tries the native share sheet with a .txt file, then plain text, and as a final fallback it copies to clipboard and offers a WhatsApp share.",
            },
            {
              q: "Do Brightness / Contrast / Rotate actually work?",
              a: "Yes. They are baked into the image before OCR runs, and rotation now expands the canvas so nothing gets cropped. The thumbnail shows the processed result.",
            },
            {
              q: "Why does a rotated photo come out cut off?",
              a: "That was a bug in the old code — the canvas kept its original size. The new pre-processor calculates the rotated bounding box, so all four corners are preserved.",
            },
            {
              q: "Is my data uploaded anywhere?",
              a: "No. Tesseract runs via WebAssembly in your browser. The only network requests are the one-time download of the OCR engine, the language model, and the PDF.js worker from a CDN.",
            },
            {
              q: "PDF export shows boxes/garbage for Hindi or Arabic?",
              a: "jsPDF's built-in fonts are Latin-only. This tool instead rasterises the text through your browser's own font engine, so Devanagari, Arabic and CJK all export perfectly.",
            },
            {
              q: "How do I get 100% accuracy?",
              a: "No OCR is 100% on every image, but you can get very close: use a sharp, well-lit photo, set PSM to 6 (or 7 for a single line), enable Auto upscale and B&W binarisation, and pick the correct language. On clean printed scans this reaches 99%+ confidence.",
            },
            {
              q: "How large can my files be?",
              a: `Up to ${MAX_FILES} files per batch, 25 MB each, and the first ${MAX_PDF_PAGES} pages of any PDF.`,
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

        <footer className="mt-14 text-center text-[11px] text-zinc-600">
          Built with Tesseract.js · PDF.js · jsPDF · JSZip — everything runs in
          your browser.
        </footer>
      </main>

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
