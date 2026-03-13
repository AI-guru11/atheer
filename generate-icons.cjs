#!/usr/bin/env node
/**
 * Atheer PWA Icon Generator
 * Produces icon-192.png and icon-512.png in /public
 * Uses only Node.js built-ins — no npm packages needed.
 * Run once: node generate-icons.js
 */
const fs = require("fs");
const zlib = require("zlib");
const path = require("path");

// --- CRC32 table ---
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[i] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const typeBytes = Buffer.from(type, "ascii");
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBytes, data])), 0);
  return Buffer.concat([lenBuf, typeBytes, data, crcBuf]);
}

/**
 * Draws a dark-background icon with a violet/fuchsia radial glow,
 * a white sparkle star in the center, and subtle corner rounding.
 */
function createIcon(size) {
  const cx = size / 2;
  const cy = size / 2;

  // Colour palette (brand colours)
  const BG   = [7,   7,   10];   // #07070a
  const V1   = [124, 58,  237];  // violet-600
  const V2   = [192, 38,  211];  // fuchsia-600
  const WH   = [255, 255, 255];  // white

  const glowR  = size * 0.44;   // outer glow radius
  const coreR  = size * 0.18;   // solid fuchsia core radius
  const cornerR = size * 0.22;  // rounded-corner mask radius

  // Raw pixel buffer: 1 filter byte per row + 3 bytes RGB per pixel
  const stride = 1 + size * 3;
  const rawData = Buffer.alloc(size * stride, 0);

  for (let y = 0; y < size; y++) {
    rawData[y * stride] = 0; // filter: None

    for (let x = 0; x < size; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Rounded-corner mask (squircle-ish): clip corners
      const ax = Math.abs(dx);
      const ay = Math.abs(dy);
      const halfSize = size / 2 - cornerR;
      const inCornerZone = ax > halfSize && ay > halfSize;
      const cornerDx = ax - halfSize;
      const cornerDy = ay - halfSize;
      const cornerDist = Math.sqrt(cornerDx * cornerDx + cornerDy * cornerDy);
      if (inCornerZone && cornerDist > cornerR) {
        // Outside rounded corner — fully transparent (write BG for PNG)
        const off = y * stride + 1 + x * 3;
        rawData[off] = BG[0]; rawData[off + 1] = BG[1]; rawData[off + 2] = BG[2];
        continue;
      }

      let r, g, b;

      if (dist <= coreR) {
        // Core: fuchsia → violet blend
        const t = dist / coreR;
        r = Math.round(V2[0] + (V1[0] - V2[0]) * t);
        g = Math.round(V2[1] + (V1[1] - V2[1]) * t);
        b = Math.round(V2[2] + (V1[2] - V2[2]) * t);
      } else if (dist <= glowR) {
        // Glow ring: violet fading into dark
        const t = (dist - coreR) / (glowR - coreR);
        const eased = t * t; // quadratic fade
        r = Math.round(V1[0] * (1 - eased) + BG[0] * eased);
        g = Math.round(V1[1] * (1 - eased) + BG[1] * eased);
        b = Math.round(V1[2] * (1 - eased) + BG[2] * eased);
      } else {
        r = BG[0]; g = BG[1]; b = BG[2];
      }

      // Sparkle: 4-point star overlay in the core
      const starSize = size * 0.07;
      const onStar =
        (Math.abs(dx) < starSize * 0.18 && Math.abs(dy) < starSize) ||
        (Math.abs(dy) < starSize * 0.18 && Math.abs(dx) < starSize) ||
        (Math.abs(Math.abs(dx) - Math.abs(dy)) < starSize * 0.15 &&
          dist < starSize * 1.1);

      if (onStar && dist < starSize * 1.15) {
        const fade = Math.max(0, 1 - dist / (starSize * 1.15));
        r = Math.round(r + (WH[0] - r) * fade * 0.9);
        g = Math.round(g + (WH[1] - g) * fade * 0.9);
        b = Math.round(b + (WH[2] - b) * fade * 0.9);
      }

      const off = y * stride + 1 + x * 3;
      rawData[off] = r; rawData[off + 1] = g; rawData[off + 2] = b;
    }
  }

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr.writeUInt8(8, 8);  // 8-bit depth
  ihdr.writeUInt8(2, 9);  // RGB colour type
  // bytes 10-12: compression=0, filter=0, interlace=0 (already 0)

  const compressed = zlib.deflateSync(rawData, { level: 9 });

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), // PNG signature
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", compressed),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

const publicDir = path.join(__dirname, "public");
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir);

console.log("Generating icons…");
fs.writeFileSync(path.join(publicDir, "icon-192.png"), createIcon(192));
fs.writeFileSync(path.join(publicDir, "icon-512.png"), createIcon(512));
console.log("✓ public/icon-192.png  (192×192)");
console.log("✓ public/icon-512.png  (512×512)");
console.log("Done. Replace these with your final brand icons before launch.");
