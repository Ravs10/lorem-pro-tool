/// <reference lib="webworker" />
export type WorkerIn = { pixels: Uint8ClampedArray; k: number };
export type WorkerOut = { colors: string[] };

function kmeans(pixels: number[][], k: number, iters = 20): number[][] {
  let centroids = Array.from({ length: k }, () =>
    pixels[Math.floor(Math.random() * pixels.length)]);
  for (let it = 0; it < iters; it++) {
    const buckets: number[][][] = Array.from({ length: k }, () => []);
    for (const p of pixels) {
      let best = 0, bd = Infinity;
      for (let i = 0; i < k; i++) {
        const c = centroids[i];
        const d = (p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2 + (p[2] - c[2]) ** 2;
        if (d < bd) { bd = d; best = i; }
      }
      buckets[best].push(p);
    }
    centroids = buckets.map((b, i) =>
      b.length
        ? [0, 1, 2].map((ch) => b.reduce((s, p) => s + p[ch], 0) / b.length)
        : centroids[i]);
  }
  return centroids;
}

self.onmessage = (e: MessageEvent<WorkerIn>) => {
  const { pixels, k } = e.data;
  const pts: number[][] = [];
  const step = Math.max(4, Math.floor(pixels.length / 4 / 4000));
  for (let i = 0; i < pixels.length; i += 4 * step) {
    const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2], a = pixels[i + 3];
    if (a < 128) continue;
    if (r + g + b < 30 || r + g + b > 735) continue;
    pts.push([r, g, b]);
  }
  const centroids = kmeans(pts, k);
  const colors = centroids.map(([r, g, b]) =>
    "#" + [r, g, b].map((n) => Math.round(n).toString(16).padStart(2, "0")).join(""));
  (self as unknown as Worker).postMessage({ colors } as WorkerOut);
};
export {};
