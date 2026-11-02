// Encodes frames/*.png + out/audio.wav into out/umah-tani-promo.mp4 (H.264 High + Opus, faststart).
// No ffmpeg is available in this sandbox, so Chrome's WebCodecs does the encoding and this file writes the MP4 container.
import fs from 'fs'; import path from 'path';
import { ROOT, serve, launch, W, H, FPS, TOTAL_FRAMES } from './lib.mjs';

const VIDEO_BITRATE = Number(process.env.VBR || 18e6), AUDIO_BITRATE = 192000;
const OUT = path.join(ROOT, 'out/umah-tani-promo.mp4');

const { srv, port } = await serve();
const browser = await launch();
const page = await (await browser.newContext({ viewport: { width: 400, height: 300 } })).newPage();
page.on('console', (m) => { const x = m.text(); if (!x.includes('GPU')) console.log('[page]', x); });
page.on('pageerror', (e) => console.log('[pageerror]', e.message));

const video = [], audio = []; let avcC = null;
await page.exposeFunction('sink', (kind, key, dur, b64) => {
  const buf = Buffer.from(b64, 'base64');
  if (kind === 'avcC') avcC = buf; else if (kind === 'v') video.push({ data: buf, key: !!key }); else audio.push({ data: buf, dur });
});
await page.goto(`http://127.0.0.1:${port}/tools/encoder.html`);
await page.waitForFunction('window.__ready === true');

const t0 = Date.now();
console.log('audio…');
const aSamples = await page.evaluate((b) => window.encodeAudio('/out/audio.wav', b), AUDIO_BITRATE);
console.log(`audio packets: ${audio.length} (${aSamples} PCM frames)`);
console.log('video…');
await page.evaluate(([n, b]) => window.encodeVideo(n, b), [TOTAL_FRAMES, VIDEO_BITRATE]);
console.log(`video samples: ${video.length}, ${((Date.now() - t0) / 1000).toFixed(0)}s`);
await browser.close(); srv.close();
audio.length = Math.min(audio.length, Math.round(30 * 48000 / 960)); // exactly 30.000 s (drop encoder tail packet)
if (!avcC) throw new Error('no avcC description from encoder');
if (video.length !== TOTAL_FRAMES) throw new Error(`expected ${TOTAL_FRAMES} video samples, got ${video.length}`);

// ------------------------------------------------------------------ MP4 muxer
const u32 = (n) => { const b = Buffer.alloc(4); b.writeUInt32BE(n >>> 0); return b; };
const u16 = (n) => { const b = Buffer.alloc(2); b.writeUInt16BE(n); return b; };
const u8 = (n) => Buffer.from([n]);
const box = (type, ...kids) => { const body = Buffer.concat(kids.map((k) => (Buffer.isBuffer(k) ? k : Buffer.from(k)))); return Buffer.concat([u32(8 + body.length), Buffer.from(type, 'latin1'), body]); };
const full = (type, ver, flags, ...kids) => box(type, u8(ver), Buffer.from([(flags >> 16) & 255, (flags >> 8) & 255, flags & 255]), ...kids);
const zeros = (n) => Buffer.alloc(n);
const MATRIX = Buffer.concat([u32(0x10000), u32(0), u32(0), u32(0), u32(0x10000), u32(0), u32(0), u32(0), u32(0x40000000)]);

const MOVIE_TS = 1000, V_TS = 30000, A_TS = 48000;
const vDur = video.length * (V_TS / FPS), aDur = audio.reduce((s, a) => s + Math.round(a.dur * A_TS / 1e6), 0);
const durMs = Math.round(video.length / FPS * 1000);

// interleave in 1 s chunks
const V_PER = FPS, A_PER = 50;
const vChunks = [], aChunks = [];
for (let i = 0; i < video.length; i += V_PER) vChunks.push(video.slice(i, i + V_PER));
for (let i = 0; i < audio.length; i += A_PER) aChunks.push(audio.slice(i, i + A_PER));
const order = [];
for (let i = 0; i < Math.max(vChunks.length, aChunks.length); i++) { if (vChunks[i]) order.push(['v', i]); if (aChunks[i]) order.push(['a', i]); }

function stscFor(chunks, per) {
  const e = []; const full_ = chunks.filter((c) => c.length === per).length;
  if (full_) e.push([1, per, 1]);
  const last = chunks[chunks.length - 1];
  if (last.length !== per) e.push([chunks.length, last.length, 1]);
  return full('stsc', 0, 0, u32(e.length), ...e.map((x) => Buffer.concat([u32(x[0]), u32(x[1]), u32(x[2])])));
}

function buildMoov(vOff, aOff) {
  const mvhd = full('mvhd', 0, 0, u32(0), u32(0), u32(MOVIE_TS), u32(durMs), u32(0x10000), u16(0x100), zeros(10), MATRIX, zeros(24), u32(3));
  const tkhd = (id, dur, vol, w, h) => full('tkhd', 0, 3, u32(0), u32(0), u32(id), u32(0), u32(dur), zeros(8), u16(0), u16(0), u16(vol), u16(0), MATRIX, u32(w << 16), u32(h << 16));
  const mdhd = (ts, dur) => full('mdhd', 0, 0, u32(0), u32(0), u32(ts), u32(dur), u16(0x55c4), u16(0));
  const hdlr = (type, name) => full('hdlr', 0, 0, u32(0), Buffer.from(type), zeros(12), Buffer.from(name + '\0'));
  const dinf = box('dinf', full('dref', 0, 0, u32(1), full('url ', 0, 1)));

  // video sample entry
  const colr = box('colr', 'nclx', u16(1), u16(1), u16(1), u8(0));
  const avc1 = box('avc1', zeros(6), u16(1), u16(0), u16(0), zeros(12), u16(W), u16(H), u32(0x480000), u32(0x480000), u32(0), u16(1), zeros(32), u16(0x18), u16(0xffff), box('avcC', avcC), colr);
  const vStts = full('stts', 0, 0, u32(1), u32(video.length), u32(V_TS / FPS));
  const keys = video.map((s, i) => (s.key ? i + 1 : 0)).filter(Boolean);
  const vStss = full('stss', 0, 0, u32(keys.length), ...keys.map(u32));
  const vStsz = full('stsz', 0, 0, u32(0), u32(video.length), ...video.map((s) => u32(s.data.length)));
  const vStco = full('stco', 0, 0, u32(vChunks.length), ...vOff.map(u32));
  const vStbl = box('stbl', full('stsd', 0, 0, u32(1), avc1), vStts, vStss, stscFor(vChunks, V_PER), vStsz, vStco);
  const vTrak = box('trak', tkhd(1, durMs, 0, W, H), box('mdia', mdhd(V_TS, vDur), hdlr('vide', 'VideoHandler'), box('minf', full('vmhd', 0, 1, zeros(8)), dinf, vStbl)));

  // audio sample entry (Opus in ISOBMFF)
  const dOps = box('dOps', u8(0), u8(2), u16(312), u32(48000), u16(0), u8(0));
  const opus = box('Opus', zeros(6), u16(1), zeros(8), u16(2), u16(16), u16(0), u16(0), u32(48000 << 16), dOps);
  const aStts = full('stts', 0, 0, u32(1), u32(audio.length), u32(960));
  const aStsz = full('stsz', 0, 0, u32(0), u32(audio.length), ...audio.map((s) => u32(s.data.length)));
  const aStco = full('stco', 0, 0, u32(aChunks.length), ...aOff.map(u32));
  const aStbl = box('stbl', full('stsd', 0, 0, u32(1), opus), aStts, stscFor(aChunks, A_PER), aStsz, aStco);
  const aTrak = box('trak', tkhd(2, Math.round(aDur / A_TS * 1000), 0x100, 0, 0), box('mdia', mdhd(A_TS, aDur), hdlr('soun', 'SoundHandler'), box('minf', full('smhd', 0, 0, u32(0)), dinf, aStbl)));
  return box('moov', mvhd, vTrak, aTrak);
}

const ftyp = box('ftyp', 'isom', u32(512), 'isom', 'iso2', 'avc1', 'mp41');
const dummy = buildMoov(vChunks.map(() => 0), aChunks.map(() => 0));
const mdatStart = ftyp.length + dummy.length + 8;
const vOff = [], aOff = []; const parts = []; let cur = mdatStart;
for (const [k, i] of order) {
  const ch = k === 'v' ? vChunks[i] : aChunks[i];
  (k === 'v' ? vOff : aOff).push(cur);
  const b = Buffer.concat(ch.map((s) => s.data)); parts.push(b); cur += b.length;
}
const moov = buildMoov(vOff, aOff);
if (moov.length !== dummy.length) throw new Error('moov size changed between passes');
const mdatBody = Buffer.concat(parts);
const mdat = Buffer.concat([u32(8 + mdatBody.length), Buffer.from('mdat'), mdatBody]);
fs.writeFileSync(OUT, Buffer.concat([ftyp, moov, mdat]));
const mb = fs.statSync(OUT).size / 1e6;
console.log(`wrote ${OUT}  ${mb.toFixed(1)} MB  video ${video.length} frames (${keys(video)} keyframes), audio ${audio.length} packets`);
function keys(v) { return v.filter((s) => s.key).length; }
