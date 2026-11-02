// Umah Tani logo mark rebuilt as layered vector parts so each part can be animated independently:
//  - two leaves (sprout) on top, dark "hill/house" body, signal rings (bottom-left), 2x2 window (top-right).
import { svgEl } from './engine.js';

export const BRAND = {
  deep: '#0E4A30', brand: '#2E6B3C', leafA: '#58AE50', leafB: '#2F8040', ring1: '#6CC067', ring2: '#E9F5EA', ring3: '#3E9A4E',
};

export function makeLogo({ body = BRAND.deep, ring = [BRAND.ring1, BRAND.ring2, BRAND.ring3], uid = Math.random().toString(36).slice(2, 7) } = {}) {
  const blobD = 'M0 116V90C0 64 22 46 48 50C70 53 82 64 106 52C126 42 140 56 140 80V116Q140 140 116 140H24Q0 140 0 116Z';
  const rad = [30, 54, 78];
  const arcs = rad.map((r, i) => `<path class="lg-ring r${i}" pathLength="1" d="M${r} 140A${r} ${r} 0 0 0 0 ${140 - r}" fill="none" stroke="${ring[i]}" stroke-width="${i === 1 ? 6 : 8}" stroke-linecap="round" stroke-dasharray="1 1" stroke-dashoffset="0"/>`).join('');
  const sq = [[97, 62], [111, 62], [97, 76], [111, 76]]
    .map(([x, y], i) => `<rect class="lg-win w${i}" x="${x}" y="${y}" width="12" height="12" rx="2.6" fill="#fff"/>`).join('');
  const svg = svgEl(`
    <defs>
      <clipPath id="lgclip-${uid}"><path d="${blobD}"/></clipPath>
      <linearGradient id="lgbody-${uid}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${body}"/><stop offset="1" stop-color="${body}"/>
      </linearGradient>
    </defs>
    <g class="lg-leafB"><path d="M56 53C36 47 30 25 42 5C60 13 66 34 56 53Z" fill="${BRAND.leafB}"/><path d="M55 50C48 38 44 24 43 10" fill="none" stroke="#1B5E2C" stroke-width="1.6" stroke-linecap="round" opacity=".7"/></g>
    <g class="lg-leafA"><path d="M58 52C53 26 76 7 121 7C123 38 97 61 58 52Z" fill="${BRAND.leafA}"/><path d="M61 49C80 37 99 24 115 11" fill="none" stroke="#2F7D3B" stroke-width="1.8" stroke-linecap="round" opacity=".75"/></g>
    <g class="lg-blobwrap"><path class="lg-blob" d="${blobD}" fill="url(#lgbody-${uid})"/></g>
    <g class="lg-rings" clip-path="url(#lgclip-${uid})">${arcs}</g>
    <g class="lg-window">${sq}</g>
  `, 'viewBox="-4 0 148 144" overflow="visible"');
  svg.setAttribute('class', 'logo-svg');
  svg.style.overflow = 'visible';
  const q = (s) => svg.querySelector(s);
  const qa = (s) => [...svg.querySelectorAll(s)];
  return {
    el: svg,
    leafA: q('.lg-leafA'), leafB: q('.lg-leafB'), blob: q('.lg-blob'), blobwrap: q('.lg-blobwrap'),
    rings: qa('.lg-ring'), wins: qa('.lg-win'), windowG: q('.lg-window'), ringsG: q('.lg-rings'),
  };
}

// Style helper for SVG parts: transforms around their own box
export function svgT(el, { x = 0, y = 0, s = 1, sx, sy, r = 0, o = 1, origin = '50% 50%' } = {}) {
  el.style.transformBox = 'fill-box';
  el.style.transformOrigin = origin;
  el.style.transform = `translate(${x}px,${y}px) rotate(${r}deg) scale(${sx ?? s},${sy ?? s})`;
  el.style.opacity = o >= 0.999 ? '' : String(Math.max(0, o));
}
