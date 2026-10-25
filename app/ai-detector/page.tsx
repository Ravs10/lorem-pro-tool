"use client";
import { useState, useCallback, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { analyzeUltraLite, type UltraLiteResult } from "@/lib/ultralite";

type Mode = "ultralite" | "deep";

type SentenceResult = {
  text: string;
  ai: number;
  status: "AI" | "MIX" | "HUMAN";
};

type FinalResult = {
  ai: number;
  human: number;
  status: string;
  words: number;
  sentences: number;
  mode: string;
  confidence: number;
  date: string;
  signals?: { name: string; score: number; weight: number }[];
  metrics?: UltraLiteResult["metrics"];
};

export default function AIDetector() {
  const [text, setText] = useState("");
  const [mode, setMode] = useState<Mode>("ultralite");
  const [result, setResult] = useState<FinalResult | null>(null);
  const [sentences, setSentences] = useState<SentenceResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deepReady, setDeepReady] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [history, setHistory] = useState<any[]>([]);
  const [showSignals, setShowSignals] = useState(false);

  useEffect(() => {
    try {
      const h = JSON.parse(localStorage.getItem("ai_detector_hist") || "[]");
      if (Array.isArray(h)) setHistory(h);
    } catch {}
  }, []);

  const wordCount = useMemo(
    () => text.split(/\s+/).filter(Boolean).length,
    [text]
  );

  // Ultra-Lite analysis
  const runUltraLite = useCallback(() => {
    const r = analyzeUltraLite(text);

    // Per-sentence breakdown (split for display)
    const rawSentences = text
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 10);

    const sentencesAnalyzed: SentenceResult[] = rawSentences.map((s) => {
      const sr = analyzeUltraLite(s);
      return {
        text: s,
        ai: sr.ai,
        status: (sr.ai > 65 ? "AI" : sr.ai > 40 ? "MIX" : "HUMAN") as SentenceResult["status"],
      };
    });

    const confidence = Math.min(
      95,
      Math.round(50 + r.signals.filter((s) => s.score > 60).length * 4)
    );

    const final: FinalResult = {
      ai: r.ai,
      human: 100 - r.ai,
      status: r.ai > 70 ? "AI Generated" : r.ai > 45 ? "Mixed Content" : "Human Written",
      words: wordCount,
      sentences: sentencesAnalyzed.length,
      mode: "Ultra-Lite (0 MB download)",
      confidence,
      date: new Date().toLocaleString(),
      signals: r.signals,
      metrics: r.metrics,
    };

    return { final, sentencesAnalyzed };
  }, [text, wordCount]);

  // Deep mode (RoBERTa)
  const runDeep = useCallback(async () => {
    setError(null);

    // Warning before large download
    if (!deepReady) {
      const ok = confirm(
        "Deep Mode downloads a ~125 MB ML model ONCE.\n\n" +
        "It will be cached in your browser for future use.\n\n" +
        "Continue?"
      );
      if (!ok) return { final: null, sentencesAnalyzed: [] };
    }

    const { getDetectorPipeline, detectBatch } = await import("@/lib/detector");
    await getDetectorPipeline((p) => {
      setDownloadProgress(p.progress);
    });
    setDeepReady(true);

    const rawSentences = text
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 10);

    const scores = await detectBatch(rawSentences);

    const sentencesAnalyzed: SentenceResult[] = rawSentences.map((s, i) => ({
      text: s,
      ai: scores[i],
      status: (scores[i] > 65 ? "AI" : scores[i] > 40 ? "MIX" : "HUMAN") as SentenceResult["status"],
    }));

    const avgAi = Math.round(
      sentencesAnalyzed.reduce((a, b) => a + b.ai, 0) / sentencesAnalyzed.length
    );
    const variance =
      sentencesAnalyzed.reduce((a, b) => a + (b.ai - avgAi) ** 2, 0) /
      sentencesAnalyzed.length;
    const confidence = Math.max(55, Math.round(100 - Math.sqrt(variance) / 2));

    const final: FinalResult = {
      ai: avgAi,
      human: 100 - avgAi,
      status: avgAi > 70 ? "AI Generated" : avgAi > 45 ? "Mixed Content" : "Human Written",
      words: wordCount,
      sentences: sentencesAnalyzed.length,
      mode: "Deep ML (RoBERTa, browser)",
      confidence,
      date: new Date().toLocaleString(),
    };

    return { final, sentencesAnalyzed };
  }, [text, wordCount, deepReady]);

  const analyze = useCallback(async () => {
    setError(null);
    if (wordCount < 15) {
      setError("Please enter at least 15 words.");
      return;
    }
    setLoading(true);
    setResult(null);
    setSentences([]);

    try {
      let output: { final: FinalResult | null; sentencesAnalyzed: SentenceResult[] };

      if (mode === "deep") {
        try {
          output = await runDeep();
        } catch {
          setError("Deep model unavailable. Switched to Ultra-Lite.");
          output = runUltraLite();
        }
      } else {
        output = runUltraLite();
      }

      if (!output.final) {
        setLoading(false);
        return;
      }

      setResult(output.final);
      setSentences(output.sentencesAnalyzed);

      const entry = { ...output.final, id: Date.now().toString() };
      const newHistory = [entry, ...history].slice(0, 8);
      setHistory(newHistory);
      localStorage.setItem("ai_detector_hist", JSON.stringify(newHistory));
    } catch {
      setError("Analysis failed. Try again.");
    } finally {
      setLoading(false);
      setDownloadProgress(0);
    }
  }, [wordCount, mode, runUltraLite, runDeep, history]);

  const humanize = () => {
    const map: Record<string, string> = {
      "delve": "look into", "leverage": "use", "utilize": "use",
      "furthermore": "also", "moreover": "also", "in conclusion": "finally",
      "additionally": "also", "robust": "strong", "seamless": "smooth",
      "revolutionize": "change", "in today's digital age": "today",
      "dive into": "explore", "realm": "area", "pivotal": "key",
      "myriad": "many", "plethora": "lots", "testament": "proof",
      "intricate": "complex", "profound": "deep", "elevate": "raise",
    };
    let t = text;
    Object.entries(map).forEach(([k, v]) => {
      t = t.replace(new RegExp(`\\b${k}\\b`, "gi"), v);
    });
    setText(t);
    setResult(null);
    setSentences([]);
  };

  const downloadReport = () => {
    if (!result) return;
    const r = `AI DETECTION REPORT
=====================
Date: ${result.date}
Mode: ${result.mode}
Confidence: ${result.confidence}%
Score: ${result.ai}% AI / ${result.human}% Human
Status: ${result.status}
Words: ${result.words}

${result.signals ? "SIGNALS\n" + result.signals.map((s) => `• ${s.name}: ${s.score}`).join("\n") + "\n\n" : ""}SENTENCES
${sentences.map((s, i) => `${i + 1}. [${s.status} ${s.ai}%] ${s.text}`).join("\n\n")}

TEXT
${text}`;
    const blob = new Blob([r], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ai-report-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#070710] text-white">
      <header className="max-w-[1400px] mx-auto p-6 flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="font-black text-xl tracking-widest">
            SENTINEL <span className="text-[#FF7A1A]">AI DETECTOR</span>
          </div>
          <div className="text-[10px] opacity-50 tracking-wider">
            100% FREE · NO API · NO SIGNUP
          </div>
        </div>
        <div className="flex gap-1 bg-black/30 p-1 rounded-full">
          <button
            onClick={() => setMode("ultralite")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
              mode === "ultralite" ? "bg-[#FF7A1A] text-white" : "text-white/60"
            }`}
          >
            ⚡ Ultra-Lite (0 MB)
          </button>
          <button
            onClick={() => setMode("deep")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
              mode === "deep" ? "bg-[#FF7A1A] text-white" : "text-white/60"
            }`}
          >
            🧠 Deep (125 MB)
          </button>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto p-4 grid lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 rounded-[2rem] border border-white/10 bg-white/[0.03] p-5">
          <div className="flex gap-2 mb-3 items-center">
            <button
              onClick={humanize}
              className="px-4 py-2 rounded-full bg-[#FF7A1A] text-sm font-bold"
            >
              ✨ Humanize
            </button>
            <button
              onClick={() => {
                setText("");
                setResult(null);
                setSentences([]);
                setError(null);
              }}
              className="px-4 py-2 rounded-full bg-white/10 text-sm"
            >
              🗑 Clear
            </button>
            <span className="ml-auto text-xs opacity-50">{wordCount} words</span>
          </div>

          {error && (
            <div className="mb-3 p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-sm">
              ⚠ {error}
            </div>
          )}

          {mode === "deep" && !deepReady && (
            <div className="mb-3 p-3 rounded-xl bg-blue-500/20 border border-blue-500/40 text-xs">
              🧠 Deep mode will download a 125 MB model once. Cached afterwards.
              For instant results without download, use <b>Ultra-Lite</b>.
            </div>
          )}

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste text here..."
            className="w-full h-[400px] p-4 rounded-2xl bg-black/40 border border-white/10 focus:border-[#FF7A1A] outline-none resize-none"
          />

          <button
            onClick={analyze}
            disabled={loading || wordCount < 15}
            className="w-full mt-4 py-3 rounded-full bg-gradient-to-r from-[#FF7A1A] to-[#FF3D00] font-black disabled:opacity-50"
          >
            {loading
              ? downloadProgress > 0
                ? `Downloading model... ${downloadProgress}%`
                : "Analyzing..."
              : mode === "ultralite"
              ? "⚡ DETECT (Instant)"
              : "🧠 DETECT (Deep ML)"}
          </button>
        </div>

        <div className="lg:col-span-5 rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
          <h2 className="font-bold mb-4 flex justify-between items-center">
            Result
            {result?.signals && (
              <button
                onClick={() => setShowSignals(!showSignals)}
                className="text-xs px-3 py-1 rounded-full bg-white/10"
              >
                {showSignals ? "Hide Signals" : "Show Signals"}
              </button>
            )}
          </h2>

          {!result && !loading && (
            <div className="h-[400px] flex flex-col items-center justify-center opacity-30">
              <div className="text-6xl mb-3">🧠</div>
              <p>Ready to analyze</p>
              <p className="text-xs mt-1">No download needed in Ultra-Lite</p>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              <div className="text-center p-6 rounded-3xl bg-black/50">
                <div
                  className={`text-7xl font-black ${
                    result.ai > 70
                      ? "text-red-400"
                      : result.ai > 45
                      ? "text-yellow-400"
                      : "text-green-400"
                  }`}
                >
                  {result.ai}%
                </div>
                <div className="mt-2 inline-block px-4 py-1 rounded-full bg-white/10 font-bold text-sm">
                  {result.status}
                </div>
                <div className="mt-2 text-xs opacity-60">
                  {result.mode} · {result.confidence}% confidence
                </div>
              </div>

              {showSignals && result.signals && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-1.5 max-h-[220px] overflow-y-auto"
                >
                  {result.signals.map((s, i) => (
                    <div key={i} className="p-2 rounded-lg bg-white/5">
                      <div className="flex justify-between text-[10px] mb-1">
                        <span>{s.name}</span>
                        <span className="font-bold">{s.score}</span>
                      </div>
                      <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            s.score > 65
                              ? "bg-red-400"
                              : s.score > 40
                              ? "bg-yellow-400"
                              : "bg-green-400"
                          }`}
                          style={{ width: `${s.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}

              <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                {sentences.map((s, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-xl text-sm border-l-4 ${
                      s.status === "AI"
                        ? "bg-red-500/10 border-red-500"
                        : s.status === "MIX"
                        ? "bg-yellow-500/10 border-yellow-500"
                        : "bg-green-500/10 border-green-500"
                    }`}
                  >
                    <div className="flex justify-between text-[10px] opacity-60 mb-1">
                      <span>{s.status}</span>
                      <span>{s.ai}%</span>
                    </div>
                    {s.text}
                  </div>
                ))}
              </div>

              <button
                onClick={downloadReport}
                className="w-full py-3 rounded-full bg-white text-black font-bold"
              >
                📥 Download Report
              </button>

              {history.length > 0 && (
                <div className="pt-3 border-t border-white/10">
                  <p className="text-xs opacity-60 mb-2">Recent</p>
                  {history.map((h) => (
                    <div
                      key={h.id}
                      className="flex justify-between text-xs p-2 rounded bg-white/5 mb-1"
                    >
                      <span className="opacity-60">{h.date}</span>
                      <span
                        className={
                          h.ai > 70
                            ? "text-red-400"
                            : h.ai > 45
                            ? "text-yellow-400"
                            : "text-green-400"
                        }
                      >
                        {h.ai}%
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
