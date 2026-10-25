// lib/detector.ts - FINAL - 100% Cloudflare Safe, 0 MB, No external dependency
export type ProgressCallback = (p: { progress: number; status: string }) => void;

export async function getDetectorPipeline(onProgress?: ProgressCallback) {
  // Simulate progress for UI, but no real download
  if (onProgress) {
    onProgress({ progress: 20, status: "Initializing Ultra-Lite..." });
    await new Promise(r => setTimeout(r, 100));
    onProgress({ progress: 60, status: "Analyzing linguistic signals..." });
    await new Promise(r => setTimeout(r, 100));
    onProgress({ progress: 100, status: "Ready (0 MB)" });
  }
  return true;
}

export async function detectBatch(texts: string[]): Promise<number[]> {
  // Use Ultra-Lite only - Cloudflare compatible
  const { analyzeUltraLite } = await import("./ultralite");
  return texts.map(t => analyzeUltraLite(t).ai);
}
