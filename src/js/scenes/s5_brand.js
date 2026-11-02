// SCENE 5 — Brand reveal: logo re-assembles, wordmark, tagline kinetic type, feature recap.
import { h, T, E, tw, pr, clamp, lerp, splitChars, pulse, rng } from '../engine.js';
import { makeLogo, svgT } from '../logo.js';
import { makeParticles } from '../fx.js';
import { icon } from '../icons.js';
import * as C from '../components.js';

export const DUR = 4.1;
const LOGO_W = 400, LOGO_L = 340, LOGO_T = 290;
const CX = 540, CY = LOGO_T + (LOGO_W * 144 / 148) * 0.5;

export function create(root) {
  const el = h('div', { class: 'scene', id: 's5' });
  const clip = h('div', { class: 'fill' });
  const bg = h('div', { class: 'fill s1-bg' });
  const shafts = [0, 1, 2].map((i) => h('div', { class: 's1-shaft', style: `left:${150 + i * 330}px` }));
  const cv = h('canvas', { class: 'fx' });
  const parts = makeParticles(cv, { n: 100, seed: 41, color: '150,240,160', sizeMax: 11 });
  const glow = h('div', { class: 's1-glow', style: `top:${CY - 500}px` });
  const wave = h('div', { class: 's1-wave', style: `top:${CY - 200}px` });

  const inner = h('div', { class: 'fill' });
  const logo = makeLogo({ uid: 's5' });
  logo.el.setAttribute('width', LOGO_W); logo.el.setAttribute('height', LOGO_W * 144 / 148);
  const logoBox = h('div', { class: 'abs', style: `left:${LOGO_L}px;top:${LOGO_T}px;width:${LOGO_W}px;height:${LOGO_W * 144 / 148}px` }, logo.el);

  const word = splitChars('Umah Tani');
  word.chars.forEach((c, i) => { if (i >= 5) c.classList.add('tani'); });
  const wordLine = h('div', { class: 'abs', style: 'left:0;width:1080px;top:722px;text-align:center' }, h('div', { class: 'mask s1-word-mask' }, h('div', { class: 's5-word' }, word.root)));

  const tag = C.kinetic([{ text: 'Teknologi Cerdas' }, { text: 'untuk Pertanian' }, { text: 'yang Lebih Baik.', accent: true }], { x: 0, y: 960, size: 108, lh: 1.04, color: '#F2FAF3', accent: '#8FE184', stag: 0.1 });
  tag.el.style.width = '1080px'; tag.el.style.textAlign = 'center';
  const under = h('div', { class: 'abs', style: 'left:340px;top:1302px;width:400px;height:6px;border-radius:3px;background:linear-gradient(90deg,rgba(143,225,132,0),#8FE184,rgba(143,225,132,0));transform-origin:50% 50%' });

  const pillData = [['basket', 'Marketplace'], ['chat', 'Tanya Tani AI'], ['flask', 'Rekomendasi Pupuk']];
  const pills = pillData.map(([ic, txt]) => h('div', { class: 's5-pill', html: icon(ic, 32, { filled: true, color: '#8FE184', cut: '#0A3D26' }) + `<span>${txt}</span>` }));
  const pillRow = h('div', { class: 'abs s5-pills' }, ...pills);
  const sub = h('div', { class: 's1-sub', style: 'top:1690px' }, h('span', { text: 'UNTUK PETANI, OLEH PETANI' }));
  const rule = [h('i', { class: 's1-rule l', style: 'top:1706px' }), h('i', { class: 's1-rule r', style: 'top:1706px' })];

  const burst = Array.from({ length: 14 }, (_, i) => { const d = h('div', { class: 'abs burst', html: icon(i % 3 === 0 ? 'sparkle' : 'leaf', 34, { filled: true, color: i % 3 === 0 ? '#E6FFD9' : '#8FE184' }) }); return d; });
  const R = rng(17); const ba = burst.map(() => R() * 6.283), bd = burst.map(() => 200 + R() * 260);
  const ring = h('div', { class: 's3-iris' });
  const flash = h('div', { class: 'fill', style: 'background:radial-gradient(circle at 50% 30%, rgba(230,255,230,.9), rgba(230,255,230,0) 60%);opacity:0;mix-blend-mode:screen' });

  inner.append(logoBox, wordLine, tag.el, under, pillRow, sub, ...rule, ...burst);
  clip.append(bg, ...shafts, cv, glow, wave, inner, flash);
  el.append(clip, ring);
  root.append(el);

  function update(t) {
    // ---------- radial reveal from centre (dark opens over the light fertilizer scene)
    const ir = tw(t, 0, 0.75, E.inOutSoft);
    const rad = ir * 1700;
    clip.style.clipPath = ir >= 1 ? 'none' : `circle(${rad.toFixed(1)}px at ${CX}px ${CY + 200}px)`;
    if (ir > 0 && ir < 1) {
      ring.style.display = 'block';
      ring.style.left = `${CX - rad}px`; ring.style.top = `${CY + 200 - rad}px`; ring.style.width = `${rad * 2}px`; ring.style.height = `${rad * 2}px`;
      ring.style.opacity = String(1 - ir * ir);
    } else ring.style.display = 'none';

    // ---------- atmosphere
    shafts.forEach((s, i) => {
      const a = tw(t, 0.3 + i * 0.12, 1.2, E.cubicOut) * (0.55 + 0.25 * Math.sin(t * 0.9 + i * 2));
      T(s, { rz: -16 + i * 3 + Math.sin(t * 0.4 + i) * 2, o: a * 0.9 });
    });
    parts.draw(t, { alpha: tw(t, 0.2, 1.0, E.cubicOut), speed: 0.8, parallaxX: Math.sin(t * 0.5) * 0.3 });

    // slow dolly-in on everything
    const dolly = 1 + 0.05 * E.sineInOut(pr(t, 0.4, 3.4));
    inner.style.transformOrigin = '540px 900px';
    inner.style.transform = `scale(${dolly})`;

    // ---------- logo (compressed S1 build)
    const s = (t - 0.2) * 1.8 + 0.2;
    logo.rings.forEach((r, i) => {
      const p = tw(s, 0.35 + i * 0.16, 1.05, E.apple);
      r.style.strokeDashoffset = String(1 - p);
      r.style.opacity = p > 0.004 ? '1' : '0';
      r.style.filter = `drop-shadow(0 0 ${3 + 6 * (1 - pr(s, 1.4, 1.2))}px rgba(150,255,160,.9))`;
    });
    const bp = tw(s, 1.0, 0.7, E.apple);
    svgT(logo.blob, { s: lerp(0.86, 1, bp), o: bp, origin: '0% 100%' });
    const lb = E.springHard(pr(s, 1.38, 0.8)), la = E.springHard(pr(s, 1.52, 0.8));
    svgT(logo.leafB, { sy: lb, sx: lerp(0.4, 1, lb), r: lerp(-38, 0, lb), o: clamp(pr(s, 1.38, 0.08)), origin: '70% 100%' });
    svgT(logo.leafA, { sy: la, sx: lerp(0.4, 1, la), r: lerp(-30, 0, la), o: clamp(pr(s, 1.52, 0.08)), origin: '0% 100%' });
    const order = [0, 1, 3, 2];
    logo.wins.forEach((w, i) => { const k = order.indexOf(i); const p = E.springHard(pr(s, 1.78 + k * 0.085, 0.55)); svgT(w, { s: p, o: clamp(pr(s, 1.78 + k * 0.085, 0.05)) }); });
    const drift = Math.sin(t * 1.2) * 4;
    T(logoBox, { y: drift, s: lerp(1.1, 1, tw(t, 0.2, 1.4)), o: tw(t, 0.1, 0.3, E.lin) });

    const f = pulse(s, 1.4, 1.4, E.cubicOut);
    glow.style.opacity = String(clamp(0.2 * tw(t, 0.3, 1, E.cubicOut) + 0.85 * f));
    T(glow, { s: lerp(0.8, 1.1, tw(t, 0.5, 2, E.cubicOut)), o: 1 });
    const wp = pr(t, 0.95, 1.1);
    T(wave, { s: lerp(0.15, 3.0, E.expoOut(wp)), o: wp > 0 ? (1 - wp) * 0.8 : 0 });
    flash.style.opacity = String(0.6 * pulse(t, 0.95, 0.5, E.cubicOut));

    // ---------- wordmark
    word.chars.forEach((c, i) => {
      const p = E.apple(pr(t, 1.0 + i * 0.045, 0.8));
      c.style.transform = `translateY(${(1 - p) * 118}%) rotate(${(1 - p) * 6}deg)`;
      c.style.fontWeight = String(Math.round(lerp(160, 800, E.cubicOut(pr(t, 1.0 + i * 0.045, 1.0)))));
    });
    word.root.style.letterSpacing = lerp(0.2, -0.015, E.apple(pr(t, 1.0, 1.2))).toFixed(4) + 'em';

    // ---------- tagline
    tag.set(t, 1.45, 1e9, E);
    const up = E.apple(pr(t, 2.2, 0.8));
    T(under, { sx: up, o: up > 0 ? 1 : 0 });

    // ---------- feature recap pills
    pills.forEach((p, i) => {
      const q = E.apple(pr(t, 2.25 + i * 0.12, 0.8)), sp = E.springSoft(pr(t, 2.25 + i * 0.12, 0.8));
      T(p, { y: (1 - q) * 50, s: lerp(0.8, 1, sp), o: clamp((t - 2.25 - i * 0.12) / 0.2) });
    });
    const sp = E.apple(pr(t, 2.7, 0.8));
    sub.style.clipPath = `inset(0 ${(1 - sp) * 50}% 0 ${(1 - sp) * 50}%)`;
    T(sub, { o: sp > 0.01 ? 1 : 0 });
    rule.forEach((r) => T(r, { sx: sp, o: sp > 0.01 ? 1 : 0 }));

    // ---------- burst when the logo locks in
    burst.forEach((b, i) => {
      const p = pr(t, 1.1 + i * 0.01, 1.1), d = bd[i] * E.expoOut(p);
      T(b, { x: CX + Math.cos(ba[i]) * d - 17, y: CY + Math.sin(ba[i]) * d * 0.9 - 17 + p * p * 90, rz: p * 220, s: (1 - p) * (0.7 + (i % 3) * 0.3), o: p > 0 && p < 1 ? 1 : 0 });
    });
  }
  return { el, update, dur: DUR };
}
