// SCENE 1 — Cinematic logo reveal, ending in a fly-through of the logo's window into scene 2.
import { h, T, E, tw, pr, clamp, lerp, splitChars, pulse } from '../engine.js';
import { makeLogo, svgT } from '../logo.js';
import { makeParticles } from '../fx.js';

export const DUR = 4.0;
const LOGO_W = 640, LOGO_L = 220, LOGO_T = 410;
const WIN_O = { x: (103 + 4) * (LOGO_W / 148), y: 68 * (LOGO_W / 148) }; // zoom target (centre of 1st window square) in logo px

export function create(root) {
  const el = h('div', { class: 'scene', id: 's1' });
  const bg = h('div', { class: 'fill s1-bg' });
  const shafts = [0, 1, 2].map((i) => h('div', { class: 's1-shaft', style: `left:${150 + i * 330}px` }));
  const cv = h('canvas', { class: 'fx' });
  const glow = h('div', { class: 's1-glow' });
  const waves = [0, 1].map(() => h('div', { class: 's1-wave' }));
  const logo = makeLogo({ uid: 's1' });
  const logoZoom = h('div', { style: 'position:absolute;inset:0' }, logo.el);
  const logoWrap = h('div', { class: 'p3 s1-logo', style: `left:${LOGO_L}px;top:${LOGO_T}px;width:${LOGO_W}px;height:${LOGO_W * 144 / 148}px;` }, logoZoom);
  logo.el.setAttribute('width', LOGO_W); logo.el.setAttribute('height', LOGO_W * 144 / 148);
  const rig = h('div', { class: 'cam', style: 'perspective:1600px;perspective-origin:50% 40%' }, h('div', { class: 'world' }, logoWrap));
  const flare = h('div', { class: 's1-flare' });

  const word = splitChars('Umah Tani');
  word.chars.forEach((c, i) => { if (i >= 5) c.classList.add('tani'); });
  const wordLine = h('div', { class: 's1-word' }, h('div', { class: 'mask s1-word-mask' }, word.root));
  const sub = h('div', { class: 's1-sub' }, h('span', { text: 'UNTUK PETANI, OLEH PETANI' }));
  const rule = [h('i', { class: 's1-rule l' }), h('i', { class: 's1-rule r' })];
  const white = h('div', { class: 'fill', style: 'background:#fff;opacity:0' });

  el.append(bg, ...shafts, cv, glow, ...waves, rig, flare, wordLine, sub, ...rule, white);
  root.append(el);
  const parts = makeParticles(cv, { n: 120, seed: 11, color: '150,240,160', sizeMax: 11 });

  function update(t) {
    // ---- atmosphere
    const bgIn = tw(t, 0, 1.2, E.cubicOut);
    bg.style.opacity = bgIn;
    shafts.forEach((s, i) => {
      const a = tw(t, 0.4 + i * 0.12, 1.4, E.cubicOut) * (0.55 + 0.25 * Math.sin(t * 0.9 + i * 2)) * (1 - pr(t, 3.0, 0.4));
      T(s, { rz: -16 + i * 3 + Math.sin(t * 0.4 + i) * 2, o: a * 0.9 });
    });
    const zoom = tw(t, 3.12, 0.78, E.inOut);
    parts.draw(t, { alpha: tw(t, 0.2, 1.2, E.cubicOut) * (1 - pr(t, 3.5, 0.3)), speed: 0.8 + zoom * 6, parallaxX: Math.sin(t * 0.5) * 0.3, streak: zoom * 1.4, cx: LOGO_L + WIN_O.x, cy: LOGO_T + WIN_O.y });

    // ---- camera on logo
    const camP = tw(t, 0.15, 2.4, E.apple);
    const drift = Math.sin(t * 0.8) * 1.6;
    // ---- rings draw on (outer first)
    logo.rings.forEach((r, i) => {
      const p = tw(t, 0.35 + i * 0.16, 1.05, E.apple);
      r.style.strokeDashoffset = String(1 - p);
      r.style.opacity = p > 0.004 ? '1' : '0';
      r.style.filter = `drop-shadow(0 0 ${3 + 6 * (1 - pr(t, 1.4, 1.2))}px rgba(150,255,160,.9))`;
    });
    // ---- body
    const bp = tw(t, 1.0, 0.7, E.apple);
    svgT(logo.blob, { s: lerp(0.86, 1, bp), o: bp, origin: '0% 100%' });
    // ---- leaves
    const lb = E.springHard(pr(t, 1.38, 0.8)), la = E.springHard(pr(t, 1.52, 0.8));
    svgT(logo.leafB, { sy: lb, sx: lerp(0.4, 1, lb), r: lerp(-38, 0, lb), o: clamp(pr(t, 1.38, 0.08)), origin: '70% 100%' });
    svgT(logo.leafA, { sy: la, sx: lerp(0.4, 1, la), r: lerp(-30, 0, la), o: clamp(pr(t, 1.52, 0.08)), origin: '0% 100%' });
    // ---- windows
    const order = [0, 1, 3, 2];
    logo.wins.forEach((w, i) => {
      const k = order.indexOf(i);
      const p = E.springHard(pr(t, 1.78 + k * 0.085, 0.55));
      svgT(w, { s: p, o: clamp(pr(t, 1.78 + k * 0.085, 0.05)) });
    });
    // logo group transform (3D camera)
    const fly = zoom;
    const sc = Math.exp(fly * Math.log(95));
    const pan = E.inOut(clamp(pr(t, 3.12, 0.7)));
    const tx = (540 - (LOGO_L + WIN_O.x)) * pan * 0.9;
    const ty = (900 - (LOGO_T + WIN_O.y)) * pan * 0.9;
    logoZoom.style.transformOrigin = `${WIN_O.x}px ${WIN_O.y}px`;
    T(logoZoom, { x: tx, y: ty, s: sc });
    logoZoom.style.filter = fly > 0.2 ? `blur(${(Math.sin(fly * Math.PI) * 2.2).toFixed(2)}px)` : '';
    T(logoWrap, { ry: lerp(-30, 0, camP) + drift, rx: lerp(10, 0, camP), s: lerp(1.28, 1, camP), o: tw(t, 0.1, 0.4, E.lin) });

    // ---- bloom / flash / shock waves / flare
    const f = pulse(t, 1.4, 1.4, E.cubicOut);
    glow.style.opacity = String(clamp(0.18 * tw(t, 0.6, 1.2, E.cubicOut) + 0.85 * f) * (1 - pr(t, 3.1, 0.5)));
    T(glow, { s: lerp(0.8, 1.15, tw(t, 1.2, 2.0, E.cubicOut)), o: 1 });
    waves.forEach((w, i) => {
      const p = pr(t, 1.48 + i * 0.16, 1.3);
      T(w, { s: lerp(0.15, 3.1, E.expoOut(p)), o: (1 - p) * (i ? 0.45 : 0.8) * (p > 0 ? 1 : 0) });
    });
    const fp = pr(t, 1.42, 1.1);
    T(flare, { sx: fp > 0 ? lerp(0.1, 1, E.expoOut(fp)) : 0, sy: lerp(1.6, 0.3, fp), o: fp > 0 ? (1 - fp) * 0.95 : 0 });

    // ---- wordmark
    word.chars.forEach((c, i) => {
      const p = E.apple(pr(t, 2.02 + i * 0.055, 0.85));
      c.style.transform = `translateY(${(1 - p) * 118}%) rotate(${(1 - p) * 6}deg)`;
      c.style.fontWeight = String(Math.round(lerp(160, 800, E.cubicOut(pr(t, 2.02 + i * 0.055, 1.1)))));
    });
    const ls = lerp(0.2, -0.015, E.apple(pr(t, 2.0, 1.3)));
    word.root.style.letterSpacing = ls.toFixed(4) + 'em';
    const out = E.inOut(pr(t, 3.05, 0.35));
    T(wordLine, { y: out * 40, s: 1 + out * 0.12, o: (1 - out) * (t > 2.0 ? 1 : 0), b: out * 8 });

    const sp = E.apple(pr(t, 2.75, 0.8));
    sub.style.clipPath = `inset(0 ${(1 - sp) * 50}% 0 ${(1 - sp) * 50}%)`;
    T(sub, { o: sp > 0.01 ? (1 - out) : 0, y: out * 24 });
    rule.forEach((r, i) => T(r, { sx: sp, o: (1 - out) * (sp > 0.01 ? 1 : 0) }));

    // ---- exit to white
    white.style.opacity = String(E.cubicIn(pr(t, 3.55, 0.3)));
  }
  return { el, update, dur: DUR };
}
