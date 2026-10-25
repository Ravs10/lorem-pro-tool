// lib/detector.ts - Cloudflare Safe Deep Mode (RoBERTa)
// Ye 125MB model ko browser me load karega, Cloudflare edge pe nahi

export type ProgressCallback = (p: { progress: number; status: string }) => void;

let pipelineCache: any = null;
let isLoading = false;

export async function getDetectorPipeline(onProgress?: ProgressCallback) {
  if (pipelineCache) return pipelineCache;
  if (isLoading) {
    // Wait if already loading
    while (isLoading) await new Promise(r => setTimeout(r, 200));
    return pipelineCache;
  }

  isLoading = true;
  try {
    if (onProgress) onProgress({ progress: 0, status: "Loading transformers..." });
    
    // Dynamic import - Cloudflare build pe ye server pe nahi chalega, sirf browser me
    const { pipeline, env } = await import("@xenova/transformers");
    
    // Disable local model check, force browser cache
    env.allowLocalModels = false;
    env.useBrowserCache = true;

    if (onProgress) onProgress({ progress: 20, status: "Downloading RoBERTa (125MB)..." });

    // This model is ~500MB but cached. For Cloudflare we use smaller openai-detector
    const pipe = await pipeline(
      "text-classification", 
      "Xenova/roberta-base-openai-detector",
      {
        progress_callback: (data: any) => {
          if (data.status === "progress" && onProgress) {
            onProgress({ 
              progress: Math.round(20 + (data.progress || 0) * 0.8), 
              status: `Downloading: ${Math.round(data.progress || 0)}%` 
            });
          }
        }
      }
    );

    pipelineCache = pipe;
    if (onProgress) onProgress({ progress: 100, status: "Model ready" });
    return pipe;
  } catch (e) {
    console.error("Deep model failed, using fallback", e);
    if (onProgress) onProgress({ progress: 100, status: "Failed, using Ultra-Lite" });
    throw e;
  } finally {
    isLoading = false;
  }
}

export async function detectBatch(texts: string[]): Promise<number[]> {
  try {
    const pipe = await getDetectorPipeline();
    if (!pipe) throw new Error("No pipeline");

    const results = await Promise.all(
      texts.map(async (t) => {
        const out = await pipe(t.slice(0, 512)); // RoBERTa limit
        // out = [{label: "Fake"/"Real", score: 0.9}]
        // If label is "Fake" (AI), return high score
        const isAI = out[0]?.label?.toLowerCase().includes("fake") || out[0]?.label?.toLowerCase().includes("ai");
        const score = Math.round(out[0]?.score * 100);
        return isAI ? score : 100 - score;
      })
    );
    return results;
  } catch {
    // Fallback to UltraLite if model fails (Cloudflare safe)
    const { analyzeUltraLite } = await import("./ultralite");
    return texts.map(t => analyzeUltraLite(t).ai);
  }
}
