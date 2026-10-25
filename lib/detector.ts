    export type ProgressCallback = (p: { progress: number; status: string }) => void;
    export async function getDetectorPipeline(onProgress?: ProgressCallback) {
      onProgress?.({progress:100,status:"Ultra-Lite Ready"}); return null;
    }
    export async function detectBatch(texts: string[]) {
      const { analyzeUltraLite } = await import("./ultralite");
      return texts.map(t => analyzeUltraLite(t).ai);
    }
