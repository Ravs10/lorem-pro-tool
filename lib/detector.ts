// lib/detector.ts - CLOUDFLARE FINAL - No .node error
export type ProgressCallback = (p: { progress: number; status: string }) => void;

let cache: any = null;

export async function getDetectorPipeline(onProgress?: ProgressCallback) {
  if (cache) return cache;
  if (typeof window === "undefined") {
    onProgress?.({ progress: 100, status: "Lite Mode (Server)" });
    return null;
  }
  try {
    onProgress?.({ progress: 10, status: "Trying Deep..." });
    // IMPORTANT: Only browser, dynamic
    const { pipeline, env } = await import("@xenova/transformers");
    env.allowLocalModels = false;
    env.useBrowserCache = true;
    env.useFSCache = false;
    env.allowRemoteModels = true;

    const pipe = await pipeline("text-classification", "Xenova/roberta-base-openai-detector", {
      quantized: true,
    });

    cache = pipe;
    onProgress?.({ progress: 100, status: "Deep Ready 125MB" });
    return pipe;
  } catch (e) {
    console.log("Deep fail, Lite active", e);
    onProgress?.({ progress: 100, status: "Ultra-Lite 0MB Active" });
    return null;
  }
}

export async function detectBatch(texts: string[]) {
  const pipe = await getDetectorPipeline().catch(() => null);
  if (pipe) {
    try {
      const res = await Promise.all(texts.map(async (t) => {
        const out = await pipe(t.slice(0, 512));
        return out[0].label === "LABEL_1" ? Math.round(out[0].score * 100) : Math.round((1 - out[0].score) * 100);
      }));
      return res;
    } catch {}
  }
  const { analyzeUltraLite } = await import("./ultralite");
  return texts.map((t) => analyzeUltraLite(t).ai);
}
