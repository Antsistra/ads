// Tiny deterministic motion engine. Every visual is a pure function of time `t` (seconds).
// No CSS animations/transitions are used, so any frame can be rendered in any order.

export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const map = (x, a, b, c, d) => c + (d - c) * ((x - a) / (b - a));
export const mix = lerp;
export const smooth = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };

// ---- easing ---------------------------------------------------------------
export function bezier(x1, y1, x2, y2) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sx = (t) => ((ax * t + bx) * t + cx) * t;
  const sy = (t) => ((ay * t + by) * t + cy) * t;
  const dx = (t) => (3 * ax * t + 2 * bx) * t + cx;
  return (x) => {
    if (x <= 0) return 0; if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 8; i++) { const e = sx(t) - x; if (Math.abs(e) < 1e-6) break; const d = dx(t); if (Math.abs(d) < 1e-6) break; t -= e / d; }
    let lo = 0, hi = 1;
    if (t < 0 || t > 1) { t = x; for (let i = 0; i < 24; i++) { const v = sx(t); if (Math.abs(v - x) < 1e-6) break; if (v < x) lo = t; else hi = t; t = (lo + hi) / 2; } }
    return sy(t);
  };
}
export const E = {
  lin: (x) => x,
  apple: bezier(0.16, 1, 0.3, 1),        // very snappy start, long soft landing
  expoOut: (x) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x)),
  expoIn: (x) => (x <= 0 ? 0 : Math.pow(2, 10 * (x - 1))),
  quintOut: (x) => 1 - Math.pow(1 - x, 5),
  quintIn: (x) => x * x * x * x * x,
  cubicOut: (x) => 1 - Math.pow(1 - x, 3),
  cubicIn: (x) => x * x * x,
  inOut: bezier(0.65, 0, 0.35, 1),
  inOutSoft: bezier(0.45, 0, 0.15, 1),
  inOutExpo: (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x < 0.5 ? Math.pow(2, 20 * x - 10) / 2 : (2 - Math.pow(2, -20 * x + 10)) / 2),
  sineInOut: (x) => -(Math.cos(Math.PI * x) - 1) / 2,
  back: (x, s = 1.70158) => { const c3 = s + 1; return 1 + c3 * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2); },
  backSoft: (x) => E.back(x, 1.0),
  // analytic damped spring, 0 -> 1 with overshoot
  spring: (x, damp = 6.5, freq = 1.6) => (x <= 0 ? 0 : x >= 1 ? 1 : 1 - Math.exp(-damp * x) * Math.cos(freq * 2 * Math.PI * x)),
  springSoft: (x) => E.spring(x, 5.5, 1.0),
  springHard: (x) => E.spring(x, 7.5, 2.0),
};

// progress of an eased tween starting at t0 lasting d
export const tw = (t, t0, d, e = E.apple) => e(clamp((t - t0) / d));
// raw 0..1
export const pr = (t, t0, d) => clamp((t - t0) / d);
// pulse: 0 -> 1 -> 0 inside [t0, t0+d]
export const pulse = (t, t0, d, e = E.sineInOut) => { const x = clamp((t - t0) / d); return e(x < 0.5 ? x * 2 : 2 - x * 2); };
// window helper: in/out visibility 0..1
export const win = (t, a, b, fi = 0.2, fo = 0.2) => clamp(Math.min((t - a) / Math.max(fi, 1e-6), (b - t) / Math.max(fo, 1e-6)));

// ---- seeded randomness -----------------------------------------------------
export function rng(seed = 1) {
  let a = seed >>> 0;
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// ---- DOM helpers -------------------------------------------------------------
const SVGNS = 'http://www.w3.org/2000/svg';
export function h(tag, props, ...kids) {
  const svg = tag.startsWith('svg:');
  const el = svg ? document.createElementNS(SVGNS, tag.slice(4)) : document.createElement(tag);
  if (props) {
    for (const k in props) {
      const v = props[k];
      if (v == null || v === false) continue;
      if (k === 'class') el.setAttribute('class', v);
      else if (k === 'style') el.style.cssText = v;
      else if (k === 'html') el.innerHTML = v;
      else if (k === 'text') el.textContent = v;
      else el.setAttribute(k, v);
    }
  }
  for (const c of kids.flat(Infinity)) {
    if (c == null || c === false) continue;
    el.append(c.nodeType ? c : document.createTextNode(String(c)));
  }
  return el;
}
export const svgEl = (inner, attrs = '') => { const d = document.createElement('div'); d.innerHTML = `<svg xmlns="${SVGNS}" ${attrs}>${inner}</svg>`; return d.firstChild; };

// Transform setter with caching (avoids layout thrash). o = {x,y,z,rx,ry,rz,s,sx,sy,o,b,vis}
export function T(el, p = {}) {
  const x = p.x || 0, y = p.y || 0, z = p.z || 0;
  const sx = p.sx ?? p.s ?? 1, sy = p.sy ?? p.s ?? 1;
  let tf = `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,${z.toFixed(2)}px)`;
  if (p.rx) tf += ` rotateX(${p.rx.toFixed(3)}deg)`;
  if (p.ry) tf += ` rotateY(${p.ry.toFixed(3)}deg)`;
  if (p.rz) tf += ` rotate(${p.rz.toFixed(3)}deg)`;
  if (sx !== 1 || sy !== 1) tf += ` scale(${sx.toFixed(4)},${sy.toFixed(4)})`;
  const o = p.o ?? 1;
  const hidden = o <= 0.002 || p.vis === false;
  if (hidden) { if (el.style.visibility !== 'hidden') el.style.visibility = 'hidden'; return el; }
  if (el.style.visibility === 'hidden') el.style.visibility = '';
  el.style.transform = tf;
  el.style.opacity = o >= 0.999 ? '' : o.toFixed(3);
  if (p.b !== undefined) el.style.filter = p.b > 0.15 ? `blur(${p.b.toFixed(2)}px)` : '';
  return el;
}
// Hide / show shortcut for 2d-only elements
export const show = (el, v) => { el.style.visibility = v ? '' : 'hidden'; };

// Wrap each char of a string in an inline-block span (for kinetic type). Returns {root, chars}
export function splitChars(text, cls = 'ch') {
  const root = document.createElement('span'); root.className = 'split';
  const chars = [];
  for (const ch of text) {
    const s = document.createElement('span');
    s.className = cls; s.textContent = ch === ' ' ? '\u00a0' : ch;
    s.style.display = 'inline-block';
    root.append(s); chars.push(s);
  }
  return { root, chars };
}
export function splitWords(text, cls = 'wd') {
  const root = document.createElement('span'); root.className = 'split';
  const words = [];
  text.split(' ').forEach((w, i, arr) => {
    const s = document.createElement('span'); s.className = cls; s.textContent = w; s.style.display = 'inline-block';
    root.append(s); words.push(s);
    if (i < arr.length - 1) root.append(document.createTextNode(' '));
  });
  return { root, words };
}

export const fmtID = (n) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
