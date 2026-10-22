import { hexToRgb } from "./color";

const download = (blob: Blob, name: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
};

export const exportPNG = (colors: string[], name = "palette.png") => {
  const W = 1000, H = 240, sw = W / colors.length;
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const ctx = c.getContext("2d")!;
  colors.forEach((hex, i) => {
    ctx.fillStyle = hex;
    ctx.fillRect(i * sw, 0, sw, H);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 18px monospace";
    ctx.fillText(hex.toUpperCase(), i * sw + 10, H - 16);
  });
  c.toBlob((b) => b && download(b, name));
};

export const exportSVG = (colors: string[], name = "palette.svg") => {
  const W = 1000, H = 240, sw = W / colors.length;
  const rects = colors.map((hex, i) =>
    `<rect x="${i * sw}" y="0" width="${sw}" height="${H}" fill="${hex}"/>` +
    `<text x="${i * sw + 10}" y="${H - 16}" fill="#fff" font-family="monospace" font-size="18" font-weight="bold">${hex.toUpperCase()}</text>`
  ).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${rects}</svg>`;
  download(new Blob([svg], { type: "image/svg+xml" }), name);
};

export const exportJSON = (colors: string[], name = "palette.json") => {
  const data = { name, colors, createdAt: new Date().toISOString() };
  download(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }), name);
};

export const exportASE = (colors: string[], name = "palette.ase") => {
  const enc = (s: string) => [...s].map((c) => c.charCodeAt(0));
  const u16 = (n: number) => [(n >> 8) & 0xff, n & 0xff];
  const u32 = (n: number) => [(n >> 24) & 0xff, (n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
  const f32 = (n: number) => {
    const b = new ArrayBuffer(4); new DataView(b).setFloat32(0, n);
    return Array.from(new Uint8Array(b));
  };
  const blocks: number[] = [];
  for (const hex of colors) {
    const { r, g, b } = hexToRgb(hex);
    const nameArr = enc(`Color ${hex.slice(1).toUpperCase()}`);
    const blockLen = 2 + nameArr.length * 2 + 4 + 12 + 2;
    blocks.push(...u16(0x0001));
    blocks.push(...u32(blockLen));
    blocks.push(...u16(nameArr.length));
    nameArr.forEach((ch) => blocks.push(0, ch));
    blocks.push(...enc("RGB "));
    blocks.push(...f32(r / 255), ...f32(g / 255), ...f32(b / 255));
    blocks.push(0, 2);
  }
  const header = [0x41, 0x53, 0x45, 0x46, ...u16(1), ...u16(0), ...u32(blocks.length)];
  const body = [...header, ...blocks];
  download(new Blob([new Uint8Array(body)], { type: "application/octet-stream" }), name);
};
