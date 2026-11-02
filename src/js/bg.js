// Shared background system so every scene feels like part of one identity:
//  - a calm mint gradient (identical in all light scenes, so cuts between them are invisible)
//  - fine terrace-contour lines (farmland topography), a pure function of absolute time
//  - optional layered hills with crop rows (intro / outro only)
import { h } from './engine.js';

const NS = 'http://www.w3.org/2000/svg';
export const BG_LIGHT = 'radial-gradient(ellipse 130% 90% at 61% 39%, #F1F9F3 0%, #E6F2E9 55%, #DCEBDF 100%)';
export const BG_DARK = 'radial-gradient(ellipse 110% 70% at 50% 58%, #0C4A38 0%, #083D2E 46%, #052A20 100%)';

function sv(tag, attrs) { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; }

export function makeBg({ dark = false, hills = false, lines = 15, lineOpacity = null } = {}) {
  const el = h('div', { class: 'fill', style: `background:${dark ? BG_DARK : BG_LIGHT}` });
  const svg = sv('svg', { viewBox: '0 0 1080 1920', width: 1080, height: 1920 });
  svg.style.cssText = 'position:absolute;left:0;top:0';
  el.append(svg);
  const col = dark ? '#9BE38F' : '#2E6B3C';
  const lop = lineOpacity ?? (dark ? 0.07 : 0.085);

  // hills (back to front) with crop-row lines on the nearest layers
  const hillDefs = [
    { y: 1330, fill: '#D5E6D5', amp: 70, ph: 0.4, rows: 0 },
    { y: 1470, fill: '#C6DCC6', amp: 80, ph: 1.7, rows: 7 },
    { y: 1640, fill: '#B3D0B5', amp: 70, ph: 3.1, rows: 9 },
  ];
  const hillG = sv('g', {}); const hillEls = [];
  if (hills) {
    svg.append(hillG);
    hillDefs.forEach((d) => {
      const g = sv('g', {}); const fill = sv('path', { fill: d.fill }); g.append(fill);
      const rows = []; for (let r = 0; r < d.rows; r++) { const p = sv('path', { fill: 'none', stroke: '#fff', 'stroke-opacity': 0.34, 'stroke-width': 1.6 }); g.append(p); rows.push(p); }
      hillG.append(g); hillEls.push({ g, fill, rows, d });
    });
  }
  const lineEls = [];
  const lg = sv('g', { fill: 'none', stroke: col, 'stroke-width': 1.6, 'stroke-linecap': 'round' });
  svg.append(lg);
  for (let k = 0; k < lines; k++) { const p = sv('path', {}); lg.append(p); lineEls.push(p); }

  const curve = (y, amp, ph, t, x0 = -40, x1 = 1120, step = 40, k = 1) => {
    let d = '';
    for (let x = x0; x <= x1; x += step) {
      const yy = y + Math.sin(x * 0.0048 + ph + t * 0.1) * amp + Math.sin(x * 0.011 - ph * 0.7 - t * 0.07) * amp * 0.38;
      d += (x === x0 ? 'M' : 'L') + x + ' ' + yy.toFixed(1);
    }
    return d;
  };

  return {
    el,
    // o: {lines: 0..1 opacity multiplier, hills: 0..1 reveal (0 hidden), shift: px vertical offset of hills, drift: seconds offset}
    update(tAbs, o = {}) {
      const lo = (o.lines ?? 1) * lop;
      lg.setAttribute('stroke-opacity', lo.toFixed(4));
      const span = 1780 / (lines - 1);
      lineEls.forEach((p, k) => {
        const y = 100 + k * span;
        p.setAttribute('d', curve(y, 34 + (k % 4) * 9, k * 0.62, tAbs));
        p.setAttribute('stroke-width', k % 5 === 0 ? 2.4 : 1.4);
      });
      if (hills) {
        const rv = o.hills ?? 1, sh = o.shift ?? 0;
        hillG.setAttribute('opacity', rv.toFixed(3));
        hillEls.forEach((hh, i) => {
          const rise = (1 - rv) * (120 + i * 70);
          const yb = hh.d.y + sh * (0.5 + i * 0.5) + rise;
          const top = curve(yb, hh.d.amp, hh.d.ph, tAbs * 0.8);
          hh.fill.setAttribute('d', top + ' L1120 1960 L-40 1960 Z');
          hh.rows.forEach((p, r) => {
            const yy = yb + 34 + r * (22 + r * 6);
            p.setAttribute('d', curve(yy, hh.d.amp * (1 + r * 0.05), hh.d.ph, tAbs * 0.8));
            p.setAttribute('stroke-opacity', (0.34 * (1 - r / (hh.rows.length + 2))).toFixed(3));
          });
        });
      }
    },
  };
}
