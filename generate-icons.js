import fs from 'fs';
import zlib from 'zlib';
import path from 'path';

// CRC32 table
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c >>> 0;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function createPNG(width, height, getPixelRGBA) {
  // 8 bytes PNG signature
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // bit depth 8
  ihdrData.writeUInt8(6, 9); // color type 6: RGBA
  ihdrData.writeUInt8(0, 10); // compression
  ihdrData.writeUInt8(0, 11); // filter
  ihdrData.writeUInt8(0, 12); // interlace

  const ihdrChunk = createChunk('IHDR', ihdrData);

  // Raw image data with 0 filter byte per scanline
  const rowLength = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowLength);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowLength;
    rawData[rowOffset] = 0; // Filter None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixelRGBA(x, y, width, height);
      const pixelOffset = rowOffset + 1 + x * 4;
      rawData[pixelOffset] = Math.max(0, Math.min(255, Math.round(r)));
      rawData[pixelOffset + 1] = Math.max(0, Math.min(255, Math.round(g)));
      rawData[pixelOffset + 2] = Math.max(0, Math.min(255, Math.round(b)));
      rawData[pixelOffset + 3] = Math.max(0, Math.min(255, Math.round(a)));
    }
  }

  const compressedData = zlib.deflateSync(rawData, { level: 9 });
  const idatChunk = createChunk('IDAT', compressedData);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(4 + 4 + len + 4);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4);
  data.copy(chunk, 8);
  const typeAndData = chunk.subarray(4, 8 + len);
  const crc = crc32(typeAndData);
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

// Distance from point to line segment
function distToSegment(px, py, x1, y1, x2, y2) {
  const l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
  if (l2 === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1)));
}

// Check if (x, y) is inside rounded rectangle
function insideRoundedRect(x, y, rx, ry, rw, rh, rad) {
  if (x < rx || x > rx + rw || y < ry || y > ry + rh) return 0;
  // check 4 corners
  const cx = x < rx + rad ? rx + rad : (x > rx + rw - rad ? rx + rw - rad : x);
  const cy = y < ry + rad ? ry + rad : (y > ry + rh - rad ? ry + rh - rad : y);
  const d = Math.hypot(x - cx, y - cy);
  if (d <= rad) return 1;
  if (d <= rad + 1) return Math.max(0, 1 - (d - rad));
  return 0;
}

// Render Darex Monogram Icon
function renderDarexIcon(x, y, w, h, isMaskable) {
  // Normalize coordinates to 0..1
  const nx = x / w;
  const ny = y / h;

  // Background
  // Deep space obsidian: #090a0f to #0e1526
  const bgDist = Math.hypot(nx - 0.5, ny - 0.5) * 1.4;
  let bgR = Math.round(9 + (1 - bgDist) * 12);
  let bgG = Math.round(11 + (1 - bgDist) * 18);
  let bgB = Math.round(18 + (1 - bgDist) * 35);
  bgR = Math.max(9, Math.min(25, bgR));
  bgG = Math.max(10, Math.min(30, bgG));
  bgB = Math.max(15, Math.min(48, bgB));

  let r = bgR;
  let g = bgG;
  let b = bgB;
  let a = 255;

  // If not maskable, we draw a rounded container badge with subtle border
  if (!isMaskable) {
    const margin = 0.04;
    const cornerRad = 0.22;
    const inBadge = insideRoundedRect(nx, ny, margin, margin, 1 - 2 * margin, 1 - 2 * margin, cornerRad);
    if (inBadge < 0.05) {
      return [0, 0, 0, 0]; // Transparent outside badge
    }
    a = Math.round(inBadge * 255);
  }

  // Scale factor: for maskable icons, keep logo inside 65% area
  const scale = isMaskable ? 0.62 : 0.76;
  const cx = 0.5;
  const cy = 0.5;
  const lx = (nx - cx) / scale + 0.5;
  const ly = (ny - cy) / scale + 0.5;

  // Glow halo in the center
  const haloDist = Math.hypot(lx - 0.5, ly - 0.48);
  if (haloDist < 0.45) {
    const haloIntensity = Math.pow(1 - (haloDist / 0.45), 2) * 0.35;
    r = Math.min(255, r + 59 * haloIntensity);
    g = Math.min(255, g + 130 * haloIntensity);
    b = Math.min(255, b + 246 * haloIntensity);
  }

  // Draw the "D" Logo:
  // Stem: x from 0.24 to 0.36, y from 0.20 to 0.80, with rounded ends
  // Outer Arc of D: centered at (0.36, 0.50), radius 0.30, from -pi/2 to pi/2
  // Inner Cut of D: centered at (0.36, 0.50), radius 0.17, from -pi/2 to pi/2
  // Inner hole x range: 0.36 to 0.36, y from 0.33 to 0.67

  let inLogo = 0;
  
  // Left stem
  const stemX1 = 0.25;
  const stemX2 = 0.36;
  const stemY1 = 0.22;
  const stemY2 = 0.78;
  const stemRad = 0.05;

  if (lx >= stemX1 && lx <= stemX2 && ly >= stemY1 && ly <= stemY2) {
    inLogo = 1;
  }

  // Top & bottom caps connecting to arc
  if (lx >= stemX2 && lx <= 0.42 && ((ly >= stemY1 && ly <= stemY1 + 0.13) || (ly >= stemY2 - 0.13 && ly <= stemY2))) {
    inLogo = 1;
  }

  // Right curved part
  const arcCenterX = 0.36;
  const arcCenterY = 0.50;
  const distFromArcCenter = Math.hypot(lx - arcCenterX, ly - arcCenterY);
  const outerR = 0.28;
  const innerR = 0.14;

  if (lx >= arcCenterX && distFromArcCenter <= outerR && distFromArcCenter >= innerR && ly >= 0.22 && ly <= 0.78) {
    inLogo = 1;
  }

  // Anti-aliasing edges
  if (inLogo === 0) {
    // Check distance to outer contour
    const dStem = distToSegment(lx, ly, stemX1, stemY1, stemX1, stemY2);
    if (dStem < 0.012 && lx < stemX1) {
      inLogo = Math.max(0, 1 - dStem / 0.012);
    }
  }

  // Inner window cutout (the hole in the D)
  if (lx >= 0.35 && distFromArcCenter < innerR && ly > 0.33 && ly < 0.67) {
    inLogo = 0;
  }

  // Electric modern accent diagonal slit through the top curve of D for futuristic tech vibe
  const slitY = 0.32 + (lx - 0.4) * 0.6;
  if (lx > 0.44 && lx < 0.58 && Math.abs(ly - slitY) < 0.016) {
    inLogo = 0;
  }

  // Color the Logo
  if (inLogo > 0) {
    // Gradient: Sapphire Blue (#2563eb / #3b82f6) to Cyan (#06b6d4) to Indigo (#818cf8)
    const gradT = (lx + ly) * 0.6;
    const logoR = Math.round(37 + gradT * 40 + (1 - ly) * 40);
    const logoG = Math.round(99 + gradT * 110 + (1 - ly) * 30);
    const logoB = Math.round(235 + gradT * 20);

    // Bevel highlight on top
    const highlight = Math.max(0, 1 - Math.hypot(lx - 0.35, ly - 0.24) * 4) * 60;

    r = Math.round(r * (1 - inLogo) + Math.min(255, logoR + highlight) * inLogo);
    g = Math.round(g * (1 - inLogo) + Math.min(255, logoG + highlight) * inLogo);
    b = Math.round(b * (1 - inLogo) + Math.min(255, logoB + highlight) * inLogo);
  }

  // Subtle corner border for non-maskable badge
  if (!isMaskable) {
    const margin = 0.04;
    const cornerRad = 0.22;
    const dOuter = insideRoundedRect(nx, ny, margin, margin, 1 - 2 * margin, 1 - 2 * margin, cornerRad);
    const dInner = insideRoundedRect(nx, ny, margin + 0.015, margin + 0.015, 1 - 2 * (margin + 0.015), 1 - 2 * (margin + 0.015), cornerRad - 0.015);
    const borderAlpha = Math.max(0, dOuter - dInner) * 0.4;
    if (borderAlpha > 0) {
      r = Math.round(r * (1 - borderAlpha) + 59 * borderAlpha);
      g = Math.round(g * (1 - borderAlpha) + 130 * borderAlpha);
      b = Math.round(b * (1 - borderAlpha) + 246 * borderAlpha);
    }
  }

  return [r, g, b, a];
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

console.log('Generating PWA icons...');

// 192x192 PNG
const png192 = createPNG(192, 192, (x, y, w, h) => renderDarexIcon(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), png192);
console.log('pwa-192x192.png generated.');

// 512x512 PNG
const png512 = createPNG(512, 512, (x, y, w, h) => renderDarexIcon(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), png512);
console.log('pwa-512x512.png generated.');

// 512x512 Maskable PNG
const pngMaskable512 = createPNG(512, 512, (x, y, w, h) => renderDarexIcon(x, y, w, h, true));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), pngMaskable512);
console.log('pwa-maskable-512x512.png generated.');

// 180x180 Apple Touch Icon PNG
const pngApple180 = createPNG(180, 180, (x, y, w, h) => renderDarexIcon(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), pngApple180);
console.log('apple-touch-icon.png generated.');

// Also generate high quality SVG for icon.svg
const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <defs>
    <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#1e293b" />
      <stop offset="100%" stop-color="#090a0f" />
    </radialGradient>
    <linearGradient id="primaryGrad" x1="20%" y1="20%" x2="80%" y2="80%">
      <stop offset="0%" stop-color="#60a5fa" />
      <stop offset="50%" stop-color="#3b82f6" />
      <stop offset="100%" stop-color="#06b6d4" />
    </linearGradient>
    <linearGradient id="bevelLight" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.3" />
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
    </linearGradient>
    <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="24" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>
  
  <!-- Base Squircle Frame -->
  <rect width="512" height="512" rx="115" fill="url(#bgGlow)" />
  <rect x="16" y="16" width="480" height="480" rx="100" stroke="#3b82f6" stroke-width="4" stroke-opacity="0.3" fill="none" />
  
  <!-- Subtle Backing Glow -->
  <circle cx="260" cy="256" r="140" fill="#2563eb" opacity="0.2" filter="blur(40px)" />
  
  <!-- Darex Geometric 'D' Monogram -->
  <g filter="url(#softGlow)">
    <!-- Main Stem & Body -->
    <path d="M 136 120 C 136 111.163 143.163 104 152 104 L 260 104 C 343.947 104 412 172.053 412 256 C 412 339.947 343.947 408 260 408 L 152 408 C 143.163 408 136 400.837 136 392 L 136 120 Z M 204 172 L 204 340 L 254 340 C 300.392 340 338 302.392 338 256 C 338 209.608 300.392 172 254 172 L 204 172 Z" fill="url(#primaryGrad)" />
    
    <!-- Bevel highlight overlay -->
    <path d="M 136 120 C 136 111.163 143.163 104 152 104 L 260 104 C 343.947 104 412 172.053 412 256 C 412 270 408 285 402 298 C 392 195 320 120 250 120 L 152 120 C 143.163 120 136 122 136 120 Z" fill="url(#bevelLight)" />

    <!-- Tech diagonal accent cut -->
    <polygon points="280,116 350,116 332,156 262,156" fill="#38bdf8" opacity="0.9" />
  </g>
</svg>`;

fs.writeFileSync(path.join(publicDir, 'icon.svg'), iconSvg);
console.log('icon.svg generated.');

// Also write favicon.ico (can be a copy of or small PNG)
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), png192);
console.log('favicon.ico generated.');

console.log('All icons generated successfully!');
