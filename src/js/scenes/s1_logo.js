// SCENE 1 — Intro. The official symbol assembles on a calm field, its window opens, and the camera passes
// through the window into the app (the hole shows the same background the next scene starts on).
import { h, T, E, tw, pr, clamp, lerp } from '../engine.js';
import { buildLogo, svgT } from '../logo.js';
import { makeBg } from '../bg.js';

export const DUR = 4.0;
const SZ = 400;                         // symbol width on screen
const L = 340, TOP = 628;               // top-left of the symbol box (symbol is centred horizontally)
const CX = 540, CY = TOP + SZ * 0.5;    // visual centre of the symbol

export function create(root) {
  const el = h('div', { class: 'scene', id: 's1' });
  const bg = makeBg({ hills: true });
  const zoomLayer = h('div', { class: 'abs', style: 'left:0;top:0;width:1080px;height:1920px' });

  const disc = h('div', { class: 's1-disc', style: `left:${CX - 400}px;top:${CY - 400}px` });
  const ringSvg = h('div', { class: 'abs', style: `left:${CX - 440}px;top:${CY - 440}px;width:880px;height:880px`, html: '<svg viewBox="0 0 880 880" width="880" height="880"><circle class="rg" cx="440" cy="440" r="436" fill="none" stroke="#2E6B3C" stroke-opacity=".28" stroke-width="1.6" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1" transform="rotate(-90 440 440)"/></svg>' });
  const rg = ringSvg.querySelector('.rg');

  const logo = buildLogo('icon');
  logo.el.setAttribute('width', SZ); logo.el.setAttribute('height', SZ * logo.vb[3] / logo.vb[2]);
  const box = h('div', { class: 'abs', style: `left:${L}px;top:${TOP}px;width:${SZ}px;height:${SZ * logo.vb[3] / logo.vb[2]}px` }, logo.el);

  zoomLayer.append(disc, ringSvg, box);
  el.append(bg.el, zoomLayer);
  root.append(el);

  const R = logo.roles;
  const one = (k) => (R[k] || []).map((x) => x.el);
  // zoom target: centre of the first window
  const WX = (logo.shutters[0].dataset.cx / logo.vb[2]) * SZ, WY = (logo.shutters[0].dataset.cy / logo.vb[3]) * (SZ * logo.vb[3] / logo.vb[2]);
  const TX = L + WX, TY = TOP + WY;

  function update(t, tAbs) {
    const zoomP = tw(t, 2.85, 0.95, E.inOutSoft);
    const sink = tw(t, 2.85, 0.5, E.inOut);
    // background: hills rise at the start and drop away as we dive in
    bg.update(tAbs, { lines: 1, hills: tw(t, 0, 1.4, E.cubicOut) * (1 - sink), shift: sink * 260 });

    // plate + orbit ring
    const dp = tw(t, 0.1, 1.1, E.apple);
    T(disc, { s: lerp(0.86, 1, dp), o: dp * (1 - sink) });
    rg.style.strokeDashoffset = String(1 - tw(t, 0.4, 1.9, E.inOutSoft));
    ringSvg.style.opacity = String((1 - sink) * clamp(pr(t, 0.4, 0.3)));

    // ---- symbol build (official paths only)
    const a = (k, t0, d = 0.8) => tw(t, t0, d, E.apple);
    one('arcB').forEach((e) => { const p = a('', 0.35, 0.8); svgT(e, { s: lerp(0.55, 1, p), o: clamp(p * 3), origin: '0% 100%' }); });
    one('arcA').forEach((e) => { const p = a('', 0.5, 0.9); svgT(e, { s: lerp(0.55, 1, p), o: clamp(p * 3), origin: '0% 100%' }); });
    one('leaf3').forEach((e) => { const p = a('', 0.75, 0.7); svgT(e, { s: lerp(0.3, 1, E.springSoft(pr(t, 0.75, 0.7))), o: clamp(p * 3), origin: '0% 100%' }); });
    one('body2').forEach((e) => { const p = a('', 0.7, 0.8); svgT(e, { y: (1 - p) * 40, o: clamp(p * 3) }); });
    one('body').forEach((e) => {
      logo.reveal(tw(t, 0.8, 1.0, E.inOutSoft));
    });
    one('leaf').forEach((e) => { const s = E.springSoft(pr(t, 1.2, 0.9)); svgT(e, { s: lerp(0.15, 1, s), r: lerp(-22, 0, s), o: clamp(pr(t, 1.2, 0.08)), origin: '8% 96%' }); });
    one('leaf2').forEach((e) => { const s = E.springSoft(pr(t, 1.35, 0.9)); svgT(e, { s: lerp(0.15, 1, s), r: lerp(18, 0, s), o: clamp(pr(t, 1.35, 0.08)), origin: '90% 96%' }); });
    one('dot').forEach((e) => { const s = E.springHard(pr(t, 1.55, 0.6)); svgT(e, { s, o: clamp(pr(t, 1.55, 0.05)) }); });
    one('sliver').forEach((e) => svgT(e, { o: clamp(pr(t, 1.9, 0.25)) }));
    // windows open
    logo.shutters.forEach((r, i) => {
      const cx = +r.dataset.cx, cy = +r.dataset.cy;
      const p = tw(t, 1.65 + [0, 1, 3, 2][i] * 0.08, 0.55, E.inOut);
      r.style.transformBox = 'fill-box'; r.style.transformOrigin = '50% 50%';
      r.style.transform = p >= 1 ? 'scale(0)' : `scale(${(1 - p).toFixed(4)})`;
      r.style.visibility = p >= 1 ? 'hidden' : '';
      void cx; void cy;
    });

    // ---- camera: gentle push, then dive through the window
    const dolly = 1 + 0.03 * E.sineInOut(pr(t, 0.3, 2.5));
    const S = Math.exp(zoomP * Math.log(120));
    const pan = E.inOut(clamp(pr(t, 2.85, 0.8)));
    zoomLayer.style.transformOrigin = `${TX}px ${TY}px`;
    zoomLayer.style.transform = `translate(${(540 - TX) * pan}px,${(960 - TY) * pan}px) scale(${dolly * S})`;
    // bottom of the stack: whole symbol rises a few px as it settles
    T(box, { y: (1 - tw(t, 0.2, 1.4, E.apple)) * 26 });
  }
  return { el, update, dur: DUR };
}
