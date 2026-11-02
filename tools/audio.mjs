// Synthesised soundtrack (no external assets): cinematic pad + pulse + SFX locked to the on-screen events.
// Output: out/audio.wav (48 kHz, 16-bit stereo, 30.0 s)
import fs from 'fs'; import path from 'path';
import { ROOT } from './lib.mjs';

const SR = 48000, DUR = 30, N = SR * DUR;
const dry = [new Float32Array(N), new Float32Array(N)];  // un-reverbed bus
const wet = [new Float32Array(N), new Float32Array(N)];  // reverb send
const duck = new Float32Array(N).fill(1);                  // sidechain envelope for pads

let seed = 1234567;
const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
const TAU = Math.PI * 2;

// add a rendered mono/stereo signal fn(i)->value into a bus
function voice(t0, dur, fn, { gain = 1, pan = 0, send = 0.2 } = {}) {
  const s0 = Math.max(0, Math.floor(t0 * SR)), n = Math.floor(dur * SR);
  const gl = gain * Math.cos((pan + 1) * Math.PI / 4), gr = gain * Math.sin((pan + 1) * Math.PI / 4);
  for (let i = 0; i < n && s0 + i < N; i++) {
    const v = fn(i / SR, i);
    dry[0][s0 + i] += v * gl * (1 - send * 0.5); dry[1][s0 + i] += v * gr * (1 - send * 0.5);
    wet[0][s0 + i] += v * gl * send; wet[1][s0 + i] += v * gr * send;
  }
}
const env = (t, a, d, sus = 0, r = 0, total = 1) => { // simple AD(S)R
  if (t < a) return t / a;
  if (t < a + d) return 1 - (1 - sus) * ((t - a) / d);
  if (t > total - r) return Math.max(0, sus * (1 - (t - (total - r)) / r));
  return sus;
};
const expDecay = (t, k) => Math.exp(-t * k);

// ---------------------------------------------------------------- instruments
function pad(t0, dur, midi, gain = 0.1, pan = 0) {
  const fs_ = [mtof(midi), mtof(midi) * 1.0035, mtof(midi) * 0.9965];
  let lp = 0;
  voice(t0, dur + 1.2, (t) => {
    const e = env(t, 1.0, 0.5, 0.85, 1.2, dur + 1.2);
    let v = 0;
    for (const f of fs_) { const ph = (t * f) % 1; v += (ph * 2 - 1) * 0.33; }
    v += Math.sin(TAU * mtof(midi) * t) * 0.4 + Math.sin(TAU * mtof(midi) * 0.5 * t) * 0.25;
    lp += (v - lp) * 0.07;           // soft low-pass
    return lp * e;
  }, { gain, pan, send: 0.45 });
}
function pluck(t0, midi, gain = 0.09, pan = 0) {
  const f = mtof(midi);
  voice(t0, 0.7, (t) => {
    const e = expDecay(t, 6.5) * Math.min(1, t / 0.004);
    return (Math.sin(TAU * f * t) + 0.45 * Math.sin(TAU * f * 2 * t) * expDecay(t, 12) + 0.2 * Math.sin(TAU * f * 3.01 * t) * expDecay(t, 18)) * e;
  }, { gain, pan, send: 0.35 });
}
function bass(t0, dur, midi, gain = 0.28) {
  const f = mtof(midi);
  voice(t0, dur, (t) => { const e = env(t, 0.01, 0.1, 0.8, 0.12, dur); return (Math.sin(TAU * f * t) + 0.25 * Math.sin(TAU * f * 2 * t)) * e; }, { gain, send: 0.05 });
}
function kick(t0, gain = 0.5) {
  let ph = 0;
  voice(t0, 0.35, (t) => { const f = 42 + 110 * expDecay(t, 28); ph += TAU * f / SR; return (Math.sin(ph) * expDecay(t, 9) + (t < 0.006 ? rnd() * 0.5 : 0)); }, { gain, send: 0.02 });
  const s0 = Math.floor(t0 * SR);
  for (let i = 0; i < 0.22 * SR && s0 + i < N; i++) duck[s0 + i] = Math.min(duck[s0 + i], 0.45 + 0.55 * Math.min(1, i / (0.22 * SR)) ** 1.5);
}
function hat(t0, gain = 0.07, open = false) {
  let prev = 0;
  voice(t0, open ? 0.25 : 0.06, (t) => { const n = rnd() * 2 - 1; const hp = n - prev; prev = n; return hp * expDecay(t, open ? 14 : 70); }, { gain, pan: (rnd() - 0.5) * 0.5, send: 0.15 });
}
function clap(t0, gain = 0.16) {
  voice(t0, 0.3, (t) => { const burst = expDecay((t % 0.012), 300) * (t < 0.036 ? 1 : 0); return (rnd() * 2 - 1) * (burst * 0.8 + expDecay(t, 22) * 0.5); }, { gain, send: 0.3 });
}
function whoosh(t0, dur, { up = true, gain = 0.3, pan = 0 } = {}) {
  let lp = 0, lp2 = 0;
  voice(t0, dur, (t) => {
    const x = t / dur, e = Math.sin(Math.PI * Math.pow(x, up ? 1.6 : 0.7));
    const c = up ? 0.01 + 0.5 * x * x : 0.01 + 0.5 * (1 - x) * (1 - x);
    lp += (rnd() * 2 - 1 - lp) * c; lp2 += (lp - lp2) * c;
    return lp2 * e * 2.4;
  }, { gain, pan, send: 0.3 });
}
function riser(t0, dur, f0 = 200, f1 = 1800, gain = 0.12) {
  let ph = 0, lp = 0;
  voice(t0, dur, (t) => {
    const x = t / dur; ph += TAU * (f0 + (f1 - f0) * x * x) / SR; lp += ((rnd() * 2 - 1) - lp) * (0.02 + 0.3 * x);
    return (Math.sin(ph) * 0.5 + lp * 0.9) * Math.pow(x, 1.8) * (x > 0.985 ? 0 : 1);
  }, { gain, send: 0.4 });
}
function boom(t0, gain = 0.6) {
  let ph = 0, lp = 0;
  voice(t0, 2.4, (t) => { const f = 30 + 70 * expDecay(t, 6); ph += TAU * f / SR; lp += ((rnd() * 2 - 1) - lp) * 0.05; return Math.sin(ph) * expDecay(t, 1.7) + lp * expDecay(t, 3) * 0.7; }, { gain, send: 0.5 });
}
function chime(t0, midi, gain = 0.16, pan = 0, len = 1.8) {
  const f = mtof(midi);
  voice(t0, len, (t) => {
    const e = Math.min(1, t / 0.002);
    return (Math.sin(TAU * f * t) * expDecay(t, 2.8) + 0.5 * Math.sin(TAU * f * 2.76 * t) * expDecay(t, 5.5) + 0.25 * Math.sin(TAU * f * 5.4 * t) * expDecay(t, 9)) * e;
  }, { gain, pan, send: 0.55 });
}
function click(t0, gain = 0.2, f = 1700) {
  voice(t0, 0.09, (t) => (Math.sin(TAU * f * t) * expDecay(t, 90) + (rnd() * 2 - 1) * expDecay(t, 200) * 0.6), { gain, send: 0.12 });
}
function pop(t0, f0 = 700, gain = 0.2, pan = 0) {
  let ph = 0;
  voice(t0, 0.25, (t) => { ph += TAU * (f0 * (0.6 + 0.8 * expDecay(t, 25))) / SR; return Math.sin(ph) * expDecay(t, 22); }, { gain, pan, send: 0.2 });
}
function tick(t0, gain = 0.08) { click(t0, gain, 2400 + rnd() * 1200); }
function sparkle(t0, gain = 0.1, n = 6, base = 84) {
  for (let i = 0; i < n; i++) chime(t0 + i * 0.045, base + [0, 4, 7, 12, 16, 19][i % 6], gain * (1 - i * 0.08), (rnd() - 0.5) * 1.4, 1.0);
}
function stamp(t0) { boom(t0, 0.45); click(t0, 0.3, 900); voice(t0, 0.12, (t) => (rnd() * 2 - 1) * expDecay(t, 40), { gain: 0.25, send: 0.2 }); }

// ---------------------------------------------------------------- score
const BEAT = 0.5;
const CH = [ // D  A  Bm  G  (one bar = 2 beats * 2 = 2 s)
  { r: 38, pad: [57, 62, 66, 69], arp: [62, 66, 69, 74, 69, 66] },
  { r: 33, pad: [57, 61, 64, 69], arp: [61, 64, 69, 73, 69, 64] },
  { r: 35, pad: [54, 59, 62, 66], arp: [59, 62, 66, 71, 66, 62] },
  { r: 31, pad: [55, 59, 62, 67], arp: [59, 62, 67, 71, 67, 62] },
];
const BAR = 2.0;

// ---- Scene 1 (0 – 4.0): drone, logo bloom, windows, fly-through
bass(0.0, 4.0, 26, 0.25);
pad(0.0, 3.8, 50, 0.07); pad(0.2, 3.6, 57, 0.06); pad(0.4, 3.4, 62, 0.05);
riser(0.2, 1.25, 120, 900, 0.1);
boom(1.4, 0.55);
whoosh(1.38, 1.0, { up: false, gain: 0.18 });
[0, 1, 3, 2].forEach((k, i) => chime(1.78 + k * 0.085 + 0.02, 81 + [0, 4, 7, 12][i], 0.12, [-0.4, 0.4, -0.2, 0.2][i], 1.6));
sparkle(1.5, 0.08, 5, 88);
riser(2.8, 1.2, 300, 2800, 0.16);
whoosh(3.0, 1.1, { up: true, gain: 0.5 });
tick(2.1); tick(2.2); tick(2.3);

// ---- chord bed from 4.0 – 26.0
for (let t = 4.0, bar = 0; t < 26.0 - 1e-6; t += BAR, bar++) {
  const c = CH[bar % 4];
  c.pad.forEach((m, i) => pad(t, BAR + 0.1, m, 0.045 + (t > 10.8 ? 0.012 : 0), (i - 1.5) * 0.35));
  bass(t, BAR * 0.98, c.r, 0.22);
}
// pulse
for (let t = 4.0; t < 26.0 - 1e-6; t += BEAT) {
  const beat = Math.round((t - 4.0) / BEAT);
  kick(t, t < 10.8 ? 0.38 : 0.5);
  if (t >= 6.0 && beat % 2 === 1) hat(t + BEAT / 2 * 0 + 0.25, 0.06 + (t > 19 ? 0.02 : 0)); // off-beat 8ths
  if (t >= 6.0 && beat % 4 === 3) hat(t + 0.5 - 0.0001, 0.05, true);
  if (t >= 10.9 && beat % 2 === 1) clap(t, t < 19 ? 0.13 : 0.17);
}
// arpeggio (16ths build)
for (let t = 4.0, k = 0; t < 26.0 - 1e-6; t += 0.25, k++) {
  const bar = Math.floor((t - 4.0) / BAR), c = CH[bar % 4];
  const level = t < 6.0 ? 0 : (t < 10.9 ? 0.07 : (t < 19.0 ? 0.085 : 0.1));
  if (level > 0) pluck(t, c.arp[k % c.arp.length] + (t > 19 ? 12 * (k % 8 === 7 ? 1 : 0) : 0), level, Math.sin(k * 0.7) * 0.5);
}

// ---- Scene transitions
whoosh(3.7, 0.7, { up: false, gain: 0.45 });                    // flash into marketplace
whoosh(10.5, 0.9, { up: true, gain: 0.4 }); boom(10.9, 0.35);   // iris to AI
whoosh(18.6, 0.9, { up: true, gain: 0.4 }); riser(18.0, 1.0, 300, 2400, 0.1);
whoosh(18.95, 0.7, { up: false, gain: 0.4 });                   // wipe up into fertilizer
whoosh(25.4, 0.8, { up: true, gain: 0.35 }); riser(24.9, 1.1, 250, 2600, 0.12);

// ---- Scene 2 events (abs = 3.8 + local)
const S2 = 3.8;
for (let i = 0; i < 12; i++) pop(S2 + 0.4 + i * 0.09, 500 + i * 70, 0.07, (i % 2 ? 0.5 : -0.5)); // UI parts assembling
whoosh(S2 + 0.35, 1.0, { up: false, gain: 0.28 });
whoosh(S2 + 1.95, 0.8, { up: true, gain: 0.2 });                // scroll
click(S2 + 2.85, 0.22); pop(S2 + 2.88, 900, 0.16); click(S2 + 3.1, 0.22); pop(S2 + 3.13, 1100, 0.16);
chime(S2 + 3.3, 88, 0.12, 0.5); chime(S2 + 3.55, 91, 0.12, 0.5);  // cart badge
whoosh(S2 + 4.05, 0.9, { up: false, gain: 0.3 });
for (let i = 0; i < 6; i++) pop(S2 + 4.3 + i * 0.1, 450 + i * 80, 0.06, i % 2 ? 0.4 : -0.4);
click(S2 + 5.45, 0.25); chime(S2 + 5.55, 86, 0.14);
stamp(S2 + 6.05);
[0, 1, 2].forEach((i) => { chime(S2 + 6.05 + i * 0.4 + 0.15, 93 + i * 2, 0.15, [-0.5, 0.5, 0][i], 1.4); });
for (let i = 0; i < 18; i++) tick(S2 + 6.0 + i * 0.07, 0.05);       // revenue counter

// ---- Scene 3 events (abs = 10.9 + local)
const S3 = 10.9;
whoosh(S3 + 0.45, 1.0, { up: false, gain: 0.3 });
for (let i = 0; i < 36; i++) tick(S3 + 1.3 + i * 0.03, 0.06);
click(S3 + 2.5, 0.25); whoosh(S3 + 2.55, 0.6, { up: false, gain: 0.2 }); pop(S3 + 2.62, 600, 0.12);
for (let i = 0; i < 3; i++) pop(S3 + 3.3 + i * 0.22, 520 + i * 60, 0.07);
sparkle(S3 + 4.0, 0.12, 7, 86);
for (let i = 0; i < 20; i++) tick(S3 + 4.15 + i * 0.075, 0.045);     // word-by-word reveal
pop(S3 + 5.95, 700, 0.18, -0.3); chime(S3 + 5.98, 84, 0.12, -0.3);
pop(S3 + 6.25, 780, 0.18, 0.3); chime(S3 + 6.28, 88, 0.12, 0.3);
click(S3 + 6.9, 0.22); chime(S3 + 6.95, 95, 0.14);

// ---- Scene 4 events (abs = 19.0 + local)
const S4 = 19.0;
for (let i = 0; i < 7; i++) pop(S4 + 0.5 + i * 0.1, 480 + i * 70, 0.07, i % 2 ? 0.5 : -0.5);
[1.5, 2.15, 2.55, 2.85].forEach((t, i) => { click(S4 + t, 0.22); pop(S4 + t + 0.02, 800 + i * 120, 0.12); });
chime(S4 + 2.4, 86, 0.1); chime(S4 + 2.85, 90, 0.1); chime(S4 + 3.1, 93, 0.1);
click(S4 + 3.2, 0.28); whoosh(S4 + 3.25, 0.6, { up: true, gain: 0.3 });
riser(S4 + 3.5, 0.8, 200, 2600, 0.14);
chime(S4 + 4.25, 91, 0.2, 0, 2.2); chime(S4 + 4.27, 95, 0.16, 0.2, 2.2); chime(S4 + 4.29, 98, 0.14, -0.2, 2.2);
sparkle(S4 + 4.4, 0.1, 8, 88);
pop(S4 + 4.35, 650, 0.16); pop(S4 + 4.6, 700, 0.16); pop(S4 + 4.9, 760, 0.15); pop(S4 + 5.1, 820, 0.15);
for (let i = 0; i < 12; i++) tick(S4 + 4.6 + i * 0.07, 0.05);        // dosage count-up
for (let i = 0; i < 3; i++) chime(S4 + 5.0 + i * 0.22, 79 + i * 5, 0.12, (i - 1) * 0.5, 1.2); // 3 segments
click(S4 + 6.35, 0.25); pop(S4 + 6.37, 1000, 0.15); chime(S4 + 6.45, 98, 0.15, 0.4);

// ---- Scene 5 (abs = 26.0 + local)
const S5 = 26.0;
boom(S5 + 0.05, 0.6); whoosh(S5, 0.8, { up: false, gain: 0.45 });
[0, 1, 2, 3].forEach((k) => chime(S5 + 1.1 + k * 0.1, 86 + [0, 4, 7, 12][k], 0.14, (k - 1.5) * 0.4, 2.0));
for (let i = 0; i < 9; i++) pop(S5 + 1.0 + i * 0.045, 600 + i * 40, 0.06);
sparkle(S5 + 1.1, 0.1, 7, 90);
// tagline word hits
const hits = [1.45, 1.65, 1.82, 2.0, 2.2]; hits.forEach((t, i) => { click(S5 + t, 0.14, 1400 + i * 120); pop(S5 + t + 0.01, 420 + i * 60, 0.09); });
// final resolve chord (D major add9), sustained then faded by master fade
[50, 57, 62, 66, 69, 74].forEach((m, i) => pad(S5 + 0.1, 3.9, m, 0.06, (i - 2.5) * 0.3));
bass(S5 + 0.1, 3.9, 26, 0.3);
chime(S5 + 2.3, 86, 0.14, 0, 2.4); chime(S5 + 2.4, 90, 0.12, 0.3, 2.4); chime(S5 + 2.5, 93, 0.12, -0.3, 2.4);
sparkle(S5 + 2.7, 0.08, 6, 92);

// ---------------------------------------------------------------- reverb (stereo Schroeder/Moorer-ish)
function reverb(inp, delays, fb = 0.78, damp = 0.35) {
  const out = new Float32Array(N);
  for (const d of delays) {
    const buf = new Float32Array(d); let idx = 0, lp = 0;
    for (let i = 0; i < N; i++) {
      const y = buf[idx]; lp += (y - lp) * (1 - damp);
      buf[idx] = inp[i] + lp * fb; idx = (idx + 1) % d; out[i] += y * 0.25;
    }
  }
  // two series allpasses
  for (const d of [225, 556]) {
    const buf = new Float32Array(d); let idx = 0;
    for (let i = 0; i < N; i++) { const y = buf[idx]; const x = out[i]; const v = x + y * -0.5; buf[idx] = x + y * 0.5 * 1; out[i] = y + v * 0.5 * 0 + (-0.5 * x + y); idx = (idx + 1) % d; }
  }
  return out;
}
const rvL = reverb(wet[0], [1687, 1931, 2203, 2447, 2713], 0.82), rvR = reverb(wet[1], [1747, 1979, 2269, 2503, 2791], 0.82);

// ---------------------------------------------------------------- mix & master
const L = new Float32Array(N), Rr = new Float32Array(N);
// pads are rendered into the same bus as everything; apply the sidechain to the whole bed lightly
for (let i = 0; i < N; i++) { const d = 0.78 + 0.22 * duck[i]; L[i] = (dry[0][i] * d + rvL[i] * 0.9); Rr[i] = (dry[1][i] * d + rvR[i] * 0.9); }
// master: gentle limiter, fade in/out
let peak = 0;
for (let i = 0; i < N; i++) {
  const t = i / SR;
  const fadeIn = Math.min(1, t / 0.05), fadeOut = t > 28.9 ? Math.max(0, 1 - (t - 28.9) / 1.0) : 1;
  const g = fadeIn * fadeOut;
  L[i] = Math.tanh(L[i] * 1.25) * g; Rr[i] = Math.tanh(Rr[i] * 1.25) * g;
  peak = Math.max(peak, Math.abs(L[i]), Math.abs(Rr[i]));
}
const norm = 0.89 / peak;
const pcm = Buffer.alloc(N * 4);
for (let i = 0; i < N; i++) {
  pcm.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(L[i] * norm * 32767))), i * 4);
  pcm.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(Rr[i] * norm * 32767))), i * 4 + 2);
}
const hdr = Buffer.alloc(44);
hdr.write('RIFF', 0); hdr.writeUInt32LE(36 + pcm.length, 4); hdr.write('WAVEfmt ', 8); hdr.writeUInt32LE(16, 16); hdr.writeUInt16LE(1, 20); hdr.writeUInt16LE(2, 22);
hdr.writeUInt32LE(SR, 24); hdr.writeUInt32LE(SR * 4, 28); hdr.writeUInt16LE(4, 32); hdr.writeUInt16LE(16, 34); hdr.write('data', 36); hdr.writeUInt32LE(pcm.length, 40);
fs.mkdirSync(path.join(ROOT, 'out'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'out/audio.wav'), Buffer.concat([hdr, pcm]));
console.log(`audio.wav written: ${DUR}s, peak before norm ${peak.toFixed(3)}, size ${(pcm.length / 1e6).toFixed(1)} MB`);
