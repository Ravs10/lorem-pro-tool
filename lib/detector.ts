// lib/detector.ts - FINAL HYBRID - 100% Working
// Deep Mode (125MB) if @xenova installed, else Ultra-Lite (0MB) fallback
// Cloudflare Edge Safe - No build error

export type ProgressCallback = (p: { progress: number; status: string }) => void;

let pipelineCache: any = null;
let isDeepAvailable: boolean | null = null;

export async function getDetectorPipeline(onProgress?: ProgressCallback) {
  // Already cached
  if (pipelineCache) {
    return pipelineCache;
  }

  // Server side pe kabhi load mat karo
  if (typeof window === "undefined") {
    onProgress?.({ progress: 100, status: "Server - Using Lite" });
    return null;
  }

  // Try Deep Mode
  try {
    onProgress?.({ progress: 5, status: "Checking Deep Model..." });

    // Dynamic import - agar package nahi hai to error nahi, null ayega
    const transformersModule = await import("@xenova/transformers").catch(() => null);

    if (!transformersModule) {
      throw new Error("Transformers package not found - using Lite");
    }

    const { pipeline, env } = transformersModule;

    // Browser cache setting
    env.allowLocalModels = false;
    env.useBrowserCache = true;
    env.allowRemoteModels = true;

    onProgress?.({ progress: 20, status: "Loading RoBERTa (125MB)..." });

    const pipe = await pipeline(
      "text-classification",
      "Xenova/roberta-base-openai-detector",
      {
        quantized: true, // 50MB tak kam ho jayega
        progress_callback: (data: any) => {
          if (data.status === "progress" && data.progress) {
            const pct = Math.round(data.progress);
            onProgress?.({ progress: 20 + Math.round(pct * 0.7), status: `Downloading Deep Model... ${pct}%` });
          }
        },
      }
    );

    pipelineCache = pipe;
    isDeepAvailable = true;
    onProgress?.({ progress: 100, status: "Deep Ready (125MB Cached)" });
    return pipe;

  } catch (err) {
    console.log("Deep not available, fallback to Ultra-Lite:", err);
    isDeepAvailable = false;
    onProgress?.({ progress: 100, status: "Ultra-Lite Active (0MB - Cloudflare Safe)" });
    return null;
  }
}

export async function detectBatch(texts: string[]): Promise<number[]> {
  const pipe = await getDetectorPipeline();

  // If Deep pipeline loaded - Use REAL Deep
  if (pipe) {
    try {
      const results = await Promise.all(
        texts.map(async (t) => {
          const truncated = t.slice(0, 800);
          const out = await pipe(truncated, { truncation: true });
          // RoBERTa output: LABEL_0 = Human, LABEL_1 = AI
          const top = out[0];
          if (!top) return 50;
          const isAI = top.label === "LABEL_1" || top.label.toLowerCase().includes("fake") || top.label.toLowerCase().includes("ai");
          return isAI ? Math.round(top.score * 100) : Math.round((1 - top.score) * 100);
        })
      );
      return results;
    } catch (e) {
      console.error("Deep detect failed, using lite", e);
    }
  }

  // Fallback - Ultra-Lite (Your 14 signals)
  const { analyzeUltraLite } = await import("./ultralite");
  return texts.map((t) => analyzeUltraLite(t).ai);
}

// Helper to check which mode is active
export function isDeepModeActive(): boolean {
  return isDeepAvailable === true && pipelineCache !== null;
}
