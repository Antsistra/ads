import fs from 'fs'; import path from 'path';
import { ROOT, serve, launch } from './lib.mjs';
const { srv, port } = await serve();
const browser = await launch();
const page = await (await browser.newContext({ viewport: { width: 400, height: 300 } })).newPage();
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
await page.goto(`http://127.0.0.1:${port}/tools/encoder.html`);
const res = await page.evaluate(async () => {
  const out = {};
  const v = document.createElement('video'); document.body.append(v); v.muted = true; v.preload = 'auto'; v.src = '/out/umah-tani-promo.mp4';
  await new Promise((r, j) => { v.onloadeddata = r; v.onerror = () => j(new Error('video error ' + (v.error && v.error.message))); });
  out.duration = v.duration; out.size = [v.videoWidth, v.videoHeight];
  const cv = new OffscreenCanvas(1080, 1920), ctx = cv.getContext('2d', { willReadFrequently: true });
  out.diffs = {};
  for (const fr of [0, 45, 100, 200, 340, 480, 560, 650, 700, 830, 880]) {
    const want = (fr + 0.5) / 30;
    v.currentTime = want;
    await new Promise((r) => { v.onseeked = r; });
    let md = { mediaTime: v.currentTime };
    await new Promise((r) => setTimeout(r, 250));

    ctx.drawImage(v, 0, 0);
    out['t' + fr] = +md.mediaTime.toFixed(4);
    const a = ctx.getImageData(0, 0, 1080, 1920).data;
    const src = await createImageBitmap(await (await fetch(`/frames/f_${String(fr).padStart(4, '0')}.png`)).blob());
    ctx.drawImage(src, 0, 0);
    const b = ctx.getImageData(0, 0, 1080, 1920).data;
    let s = 0, n = 0; for (let i = 0; i < a.length; i += 16) { s += Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) + Math.abs(a[i + 2] - b[i + 2]); n += 3; }
    out.diffs[fr] = +(s / n).toFixed(2);
  }
  // audio decode
  const ab = await (await fetch('/out/umah-tani-promo.mp4')).arrayBuffer();
  try {
    const ac = new OfflineAudioContext(2, 48000, 48000);
    const buf = await ac.decodeAudioData(ab.slice(0));
    const d = buf.getChannelData(0); let e = 0; for (let i = 0; i < d.length; i++) e += d[i] * d[i];
    out.audio = { dur: buf.duration, ch: buf.numberOfChannels, sr: buf.sampleRate, rms: +Math.sqrt(e / d.length).toFixed(4) };
  } catch (e) { out.audio = 'decode failed: ' + e.message; }
  return out;
});
console.log(JSON.stringify(res, null, 1));
await browser.close(); srv.close();
