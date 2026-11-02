// SCENE 5 — Outro. The official symbol assembles, widens into the official horizontal lockup, then one line of copy.
import { h, T, E, tw, pr, clamp, lerp } from '../engine.js';
import { buildLogo, svgT, LOGO } from '../logo.js';
import { makeBg } from '../bg.js';
import * as C from '../components.js';

export const DUR = 4.1;
const NS = 'http://www.w3.org/2000/svg';
const LW = 800;                        // lockup width on screen (px) for the 1562-unit artwork
const CYL = 830;                       // vertical centre of the lockup

export function create(root) {
  const el = h('div', { class: 'scene', id: 's5' });
  const bg = makeBg({ hills: true });

  const logo = buildLogo('long');
  const bb = LOGO.long.bbox;                       // artwork bounds in symbol units
  const sc = LW / bb.w;                            // px per unit
  logo.el.setAttribute('width', LOGO.long.vb[2] * sc); logo.el.setAttribute('height', LOGO.long.vb[3] * sc);
  const left = 540 - (bb.x + bb.w / 2) * sc, top = CYL - (bb.y + bb.h / 2) * sc;
  // symbol bounds (everything left of the wordmark)
  const icx = 173.6, icy = bb.y + bb.h / 2;
  const iconPx = { x: left + icx * sc, y: top + icy * sc };
  const box = h('div', { class: 'abs', style: `left:${left}px;top:${top}px;width:${LOGO.long.vb[2] * sc}px;height:${LOGO.long.vb[3] * sc}px` }, logo.el);
  box.style.transformOrigin = `${icx * sc}px ${icy * sc}px`;

  // wordmark + descriptor go into clipped groups (horizontal wipe + baseline masks)
  const defs = document.createElementNS(NS, 'defs');
  const mk = (id, y0, y1) => { const cp = document.createElementNS(NS, 'clipPath'); cp.setAttribute('id', id); const r = document.createElementNS(NS, 'rect'); r.setAttribute('y', y0); r.setAttribute('height', y1 - y0); r.setAttribute('x', 340); r.setAttribute('width', 0); cp.append(r); defs.append(cp); return r; };
  const clipW = mk('wc5', 60, 278), clipT = mk('tc5', 288, 372);
  logo.el.prepend(defs);
  const gW = document.createElementNS(NS, 'g'); gW.setAttribute('clip-path', 'url(#wc5)');
  const gT = document.createElementNS(NS, 'g'); gT.setAttribute('clip-path', 'url(#tc5)');
  logo.el.append(gW, gT);
  const words = (logo.roles.word || []).sort((a, b) => a.it.bb.x - b.it.bb.x);
  const tags = (logo.roles.tag || []).sort((a, b) => a.it.bb.x - b.it.bb.x);
  words.forEach((w) => gW.append(w.el)); tags.forEach((w) => gT.append(w.el));
  const R = logo.roles; const one = (k) => (R[k] || []).map((x) => x.el);

  const tagline = C.kinetic([
    { parts: [{ text: 'Teknologi Cerdas untuk' }] },
    { parts: [{ text: 'Pertanian yang' }, { text: 'Lebih Baik.', color: '#3F8450', weight: 700 }] },
  ], { x: 0, y: 984, size: 56, lh: 1.3, weight: 500, color: '#0B3B2D', track: '-0.012em' });
  tagline.el.style.width = '1080px'; tagline.el.style.textAlign = 'center';

  el.append(bg.el, box, tagline.el);
  root.append(el);

  function update(t, tAbs) {
    bg.update(tAbs, { lines: 1, hills: tw(t, 0, 1.2, E.cubicOut), shift: 0 });

    // ---- symbol build (compressed version of the intro)
    const a = (t0, d = 0.7) => tw(t, t0, d, E.apple);
    one('arcB').forEach((e) => { const p = a(0.1, 0.7); svgT(e, { s: lerp(0.55, 1, p), o: clamp(p * 3), origin: '0% 100%' }); });
    one('arcA').forEach((e) => { const p = a(0.22, 0.8); svgT(e, { s: lerp(0.55, 1, p), o: clamp(p * 3), origin: '0% 100%' }); });
    one('leaf3').forEach((e) => { const p = a(0.4, 0.6); svgT(e, { s: lerp(0.3, 1, E.springSoft(pr(t, 0.4, 0.6))), o: clamp(p * 3), origin: '0% 100%' }); });
    one('body2').forEach((e) => { const p = a(0.38, 0.7); svgT(e, { y: (1 - p) * 60, o: clamp(p * 3) }); });
    logo.reveal(tw(t, 0.45, 0.9, E.inOutSoft));
    one('leaf').forEach((e) => { const s = E.springSoft(pr(t, 0.8, 0.8)); svgT(e, { s: lerp(0.15, 1, s), r: lerp(-22, 0, s), o: clamp(pr(t, 0.8, 0.08)), origin: '8% 96%' }); });
    one('leaf2').forEach((e) => { const s = E.springSoft(pr(t, 0.92, 0.8)); svgT(e, { s: lerp(0.15, 1, s), r: lerp(18, 0, s), o: clamp(pr(t, 0.92, 0.08)), origin: '90% 96%' }); });
    one('dot').forEach((e) => { const s = E.springHard(pr(t, 1.05, 0.55)); svgT(e, { s, o: clamp(pr(t, 1.05, 0.05)) }); });
    one('sliver').forEach((e) => svgT(e, { o: clamp(pr(t, 1.3, 0.25)) }));
    logo.shutters.forEach((r, i) => {
      const p = tw(t, 1.0 + [0, 1, 3, 2][i] * 0.07, 0.5, E.inOut);
      r.style.transformBox = 'fill-box'; r.style.transformOrigin = '50% 50%';
      r.style.transform = p >= 1 ? 'scale(0)' : `scale(${(1 - p).toFixed(4)})`; r.style.visibility = p >= 1 ? 'hidden' : '';
    });

    // ---- symbol widens into the lockup
    const m = tw(t, 1.2, 0.85, E.inOutSoft);
    const s0 = 2.1;
    const scl = lerp(s0, 1, m);
    const dx = lerp(540 - iconPx.x, 0, m);
    const rise = (1 - tw(t, 0, 1.4, E.apple)) * 24;
    box.style.transform = `translate(${dx.toFixed(2)}px,${rise.toFixed(2)}px) scale(${scl.toFixed(4)})`;

    // ---- wordmark: horizontal wipe + letters rise through the baseline
    const wp = tw(t, 1.3, 0.95, E.inOutSoft);
    const full = LOGO.long.vb[2] - 340;
    clipW.setAttribute('width', (full * wp + 0.01).toFixed(1)); clipT.setAttribute('width', (full * clamp(wp * 1.1 - 0.1) + 0.01).toFixed(1));
    words.forEach((w, i) => {
      const p = E.apple(pr(t, 1.3 + i * 0.05, 0.8));
      w.el.style.transform = p >= 1 ? '' : `translateY(${((1 - p) * 120).toFixed(1)}px)`;
    });
    tags.forEach((w, i) => {
      const p = E.apple(pr(t, 1.7 + i * 0.03, 0.6));
      w.el.style.transform = p >= 1 ? '' : `translateY(${((1 - p) * 40).toFixed(1)}px)`;
    });

    // ---- one line of copy
    tagline.set(t, 2.0, 1e9, E);
  }
  return { el, update, dur: DUR };
}
