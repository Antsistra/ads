// Generates procedural raster assets (film grain tile) with zero dependencies.
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { ROOT } from './lib.mjs';

function crc32(buf) {
  let c, crc = 0xffffffff;
  for (let n = 0; n < buf.length; n++) {
    c = (crc ^ buf[n]) & 0xff;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crc = (crc >>> 8) ^ c;
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function png(w, h, rgba) {
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) { raw[y * (w * 4 + 1)] = 0; rgba.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4); }
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}

// seeded noise
let s = 12345;
const rnd = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };

const N = 512;
const buf = Buffer.alloc(N * N * 4);
for (let i = 0; i < N * N; i++) {
  // gaussian-ish noise centered on mid-grey (so overlay blend leaves the mean unchanged)
  const g = (rnd() + rnd() + rnd() + rnd() - 2) / 2; // -1..1
  const v = Math.max(0, Math.min(255, 128 + g * 120));
  buf[i * 4] = buf[i * 4 + 1] = buf[i * 4 + 2] = v; buf[i * 4 + 3] = 255;
}
const out = path.join(ROOT, 'assets/img/grain.png');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, png(N, N, buf));
console.log('wrote', out);
