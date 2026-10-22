export type RGB = { r: number; g: number; b: number };
export type HSL = { h: number; s: number; l: number };

export const randomHex = (): string =>
  "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");

export const hexToRgb = (hex: string): RGB => ({
  r: parseInt(hex.slice(1, 3), 16),
  g: parseInt(hex.slice(3, 5), 16),
  b: parseInt(hex.slice(5, 7), 16),
});

export const rgbToHex = ({ r, g, b }: RGB): string =>
  "#" +
  [r, g, b]
    .map((n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0"))
    .join("");

export const hexToHsl = (hex: string): HSL => {
  const { r, g, b } = hexToRgb(hex);
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rn: h = (gn - bn) / d + (gn < bn ? 6 : 0); break;
      case gn: h = (bn - rn) / d + 2; break;
      case bn: h = (rn - gn) / d + 4; break;
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
};

export const hslToHex = (h: number, s: number, l: number): string => {
  s /= 100; l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else { r = c; b = x; }
  return rgbToHex({ r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 });
};

const srgbToLinear = (v: number) => {
  v /= 255;
  return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
};

const relLuminance = ({ r, g, b }: RGB) =>
  0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);

export const contrastRatio = (a: string, b: string): number => {
  const L1 = relLuminance(hexToRgb(a));
  const L2 = relLuminance(hexToRgb(b));
  return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
};

export const wcagLevel = (ratio: number): "AAA" | "AA" | "AA Large" | "Fail" => {
  if (ratio >= 7) return "AAA";
  if (ratio >= 4.5) return "AA";
  if (ratio >= 3) return "AA Large";
  return "Fail";
};

export const apcaContrast = (bg: string, txt: string): number => {
  const Ybg = relLuminance(hexToRgb(bg));
  const Ytxt = relLuminance(hexToRgb(txt));
  const blk = 0.022, wht = 1.414;
  const normBG = Math.pow(Ybg, 0.56);
  const normTXT = Math.pow(Ytxt, 0.57);
  const C = Ybg > Ytxt
    ? (normBG - normTXT) * wht - blk
    : (normBG - normTXT) * wht + blk;
  return +(C * 100).toFixed(1);
};

type Matrix = number[][];
const CVD: Record<string, Matrix> = {
  protanopia:    [[0.567, 0.433, 0], [0.558, 0.442, 0], [0, 0.242, 0.758]],
  deuteranopia:  [[0.625, 0.375, 0], [0.700, 0.300, 0], [0, 0.300, 0.700]],
  tritanopia:    [[0.950, 0.050, 0], [0, 0.433, 0.567], [0, 0.475, 0.525]],
  achromatopsia: [[0.299, 0.587, 0.114], [0.299, 0.587, 0.114], [0.299, 0.587, 0.114]],
};

export const simulateCVD = (hex: string, mode: string): string => {
  if (mode === "normal" || !CVD[mode]) return hex;
  const { r, g, b } = hexToRgb(hex);
  const m = CVD[mode];
  const out = m.map((row) => row[0] * r + row[1] * g + row[2] * b);
  return rgbToHex({ r: out[0], g: out[1], b: out[2] });
};

export type HarmonyMode =
  | "random" | "monochromatic" | "analogous"
  | "complementary" | "triadic" | "tetradic" | "shades" | "split";

export const generateHarmony = (
  base: string,
  mode: HarmonyMode,
  count = 5
): string[] => {
  const { h, s, l } = hexToHsl(base);
  const H = (x: number) => ((x % 360) + 360) % 360;
  switch (mode) {
    case "random": return Array.from({ length: count }, randomHex);
    case "monochromatic":
      return Array.from({ length: count }, (_, i) =>
        hslToHex(h, s, Math.max(8, Math.min(92, 15 + i * 17))));
    case "analogous":
      return [-60, -30, 0, 30, 60].map((o) => hslToHex(H(h + o), s, l));
    case "complementary":
      return [0, 0, 180, 180, 180].map((o, i) =>
        hslToHex(H(h + o), s, i < 2 ? l : Math.max(20, l - 25)));
    case "triadic":
      return [0, 120, 240, 0, 120].map((o, i) =>
        hslToHex(H(h + o), s, 30 + i * 10));
    case "tetradic":
      return [0, 90, 180, 270, 0].map((o, i) =>
        hslToHex(H(h + o), s, 35 + i * 8));
    case "split":
      return [0, 150, 210, 0, 150].map((o, i) =>
        hslToHex(H(h + o), s, 30 + i * 10));
    case "shades":
      return Array.from({ length: count }, (_, i) => hslToHex(h, 10 + i * 20, l));
  }
};
