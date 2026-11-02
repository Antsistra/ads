// Master timeline. window.renderFrame(frame) positions every element for that exact frame.
import * as S1 from './scenes/s1_logo.js';

const FPS = 30;
const stage = document.getElementById('stage');
const host = document.getElementById('scenes');
const grain = document.getElementById('grain');
const fade = document.getElementById('fade');
const vignette = document.getElementById('vignette');

// absolute start (s) of each scene, and how long its layer stays alive
const SCENES = [
  { id: 's1', mod: S1, start: 0.0, end: 4.05 },
];
const optional = [
  ['s2', './scenes/s2_market.js', 3.8, 11.5],
  ['s3', './scenes/s3_ai.js', 10.9, 19.75],
  ['s4', './scenes/s4_fertilizer.js', 19.0, 26.7],
  ['s5', './scenes/s5_brand.js', 26.0, 30.1],
];
for (const [id, path, start, end] of optional) {
  try { const mod = await import(path); SCENES.push({ id, mod, start, end }); } catch (e) { if (!String(e).includes('Failed to fetch') && !String(e).includes('error loading')) console.warn(id, e); }
}

await Promise.all([
  document.fonts.load('800 40px NS'), document.fonts.load('400 40px NS'), document.fonts.load('900 40px NSX'), document.fonts.load('700 40px NSX'),
]);
await document.fonts.ready;

for (const s of SCENES) { s.api = s.mod.create(host); s.api.el.style.display = 'none'; }

const FADE_START = 29.55, FADE_END = 30.0;

window.renderFrame = (frame) => {
  const t = frame / FPS;
  for (const s of SCENES) {
    const on = t >= s.start && t < s.end;
    if (!on) { if (s.api.el.style.display !== 'none') s.api.el.style.display = 'none'; continue; }
    if (s.api.el.style.display === 'none') s.api.el.style.display = '';
    s.api.update(t - s.start, t);
  }
  // film grain: jitter per-frame (deterministic)
  const gx = (frame * 97) % 512, gy = (frame * 61) % 512;
  grain.style.transform = `translate(${-gx % 200}px, ${-gy % 200}px)`;
  // vignette only on dark scenes (S1 until zoom-out-to-white, S3, S5)
  const vig = t < 3.2 ? 1 : t < 3.9 ? 1 - (t - 3.2) / 0.7 : t < 10.8 ? 0.0 : t < 11.4 ? (t - 10.8) / 0.6 : t < 18.6 ? 1 : t < 19.4 ? 1 - (t - 18.6) / 0.8 : t < 25.6 ? 0 : t < 26.4 ? (t - 25.6) / 0.8 : 1;
  vignette.style.opacity = String(vig);
  const f = Math.min(1, Math.max(0, (t - FADE_START) / (FADE_END - FADE_START)));
  fade.style.opacity = String(f * f);
  return t;
};
window.__ready = true;
