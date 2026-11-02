// Official Umah Tani logo. The SVG files in /assets/logo are the single source of truth:
// path data and colours are read from them at runtime and never redrawn or approximated.
// Animation only moves/reveals the original paths; at rest every transform is the identity.
export const LOGO = {};
const NS = 'http://www.w3.org/2000/svg';
let uidN = 0;

function parse(text) {
  const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
  const svg = doc.documentElement;
  const css = svg.querySelector('style')?.textContent || '';
  const fills = {};
  css.replace(/\.(cls-\d+)\s*\{\s*fill:\s*(#[0-9a-fA-F]{3,8})\s*;/g, (m, c, f) => { fills[c] = f; return m; });
  const vb = svg.getAttribute('viewBox').trim().split(/\s+/).map(Number);
  const paths = [...svg.querySelectorAll('path')].map((p) => ({ d: p.getAttribute('d'), fill: fills[p.getAttribute('class')] || '#000' }));
  return { vb, paths };
}

const ICON_ROLES = [
  ['M76.94,138.5', 'body'], ['M88.89,140.37', 'body2'], ['M2.6,75.55c33.19', 'arcA'], ['M72.87.08', 'leaf'], ['M2.2,99.46c19.7', 'arcB'],
  ['M28.95,36.11', 'leaf2'], ['M17.24,140.37', 'leaf3'], ['M33.49,47.68', 'dot'],
];
const LONG_ROLES = [
  ['M228.1,360.62', 'body2'], ['M172.74,360.62', 'arcA'], ['M21.69,265.73', 'arcB'], ['M347.26,99.96', 'body'], ['M122.79,122.78', 'leaf'],
  ['M89.09,117.08', 'leaf2'], ['M109.34,165.82', 'dot'], ['M46.72,329.64', 'leaf3'],
];
// window holes in the body (taken from the sub-paths of the official body path)
const ICON_WINDOWS = [[99.22, 44.73, 10.17, 10.17], [119.71, 44.73, 10.17, 10.17], [99.22, 65.22, 10.17, 10.17], [119.71, 65.22, 10.17, 10.17]];
const LONG_WINDOWS = [[252.18, 138.41, 24.07, 24.02], [299.72, 138.4, 24.07, 24.02], [252.18, 185.85, 24.07, 24.02], [299.72, 185.85, 24.07, 24.02]];

function annotate(p, roles) {
  const out = p.paths.map((pt, i) => {
    const r = roles.find(([pre]) => pt.d.startsWith(pre));
    return { ...pt, i, role: r ? r[1] : null };
  });
  return out;
}

export async function loadLogos() {
  const [it, lt] = await Promise.all([
    fetch('/assets/logo/umah-tani-icon.svg').then((r) => r.text()),
    fetch('/assets/logo/umah-tani-logo-long.svg').then((r) => r.text()),
  ]);
  const icon = parse(it), long = parse(lt);
  icon.items = annotate(icon, ICON_ROLES); icon.windows = ICON_WINDOWS; icon.bodyFill = icon.items.find((x) => x.role === 'body').fill;
  long.items = annotate(long, LONG_ROLES); long.windows = LONG_WINDOWS; long.bodyFill = long.items.find((x) => x.role === 'body').fill;
  // measure bounding boxes (needs a DOM)
  for (const l of [icon, long]) {
    const s = document.createElementNS(NS, 'svg'); s.setAttribute('viewBox', l.vb.join(' ')); s.style.cssText = 'position:absolute;left:-9999px;top:0;width:100px;height:100px';
    const g = document.createElementNS(NS, 'g'); s.append(g);
    const els = l.items.map((it2) => { const p = document.createElementNS(NS, 'path'); p.setAttribute('d', it2.d); g.append(p); return p; });
    document.body.append(s);
    l.items.forEach((it2, k) => { const b = els[k].getBBox(); it2.bb = { x: b.x, y: b.y, w: b.width, h: b.height }; });
    const bb = g.getBBox(); l.bbox = { x: bb.x, y: bb.y, w: bb.width, h: bb.height };
    const ib = l.items.filter((x) => x.role && x.role !== 'sliver'); // artwork only (no export slivers)
    s.remove();
    void ib;
  }
  // the wordmark of the long logo: everything that is not part of the symbol
  for (const it2 of long.items) if (!it2.role) it2.role = it2.bb.y > 290 ? 'tag' : 'word';
  for (const it2 of icon.items) if (!it2.role) it2.role = 'sliver';
  LOGO.icon = icon; LOGO.long = long;
}

// Build a DOM <svg> from the official paths. Returns the element and handles to each role.
export function buildLogo(kind = 'icon') {
  const L = LOGO[kind];
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', L.vb.join(' ')); svg.setAttribute('xmlns', NS); svg.style.overflow = 'visible'; svg.style.display = 'block';
  const roles = {};
  const cid = 'bc' + (++uidN);
  const defs = document.createElementNS(NS, 'defs'); const cp = document.createElementNS(NS, 'clipPath'); cp.setAttribute('id', cid);
  const cr = document.createElementNS(NS, 'rect'); cr.setAttribute('x', -20); cr.setAttribute('y', -20); cr.setAttribute('width', L.vb[2] + 40); cr.setAttribute('height', L.vb[3] + 40);
  cp.append(cr); defs.append(cp); svg.append(defs);
  const order = ['sliver', 'body', 'body2', 'arcA', 'arcB', 'leaf', 'leaf2', 'leaf3', 'dot', 'tag', 'word'];
  // keep original paint order
  const parts = [];
  for (const it of L.items) {
    const p = document.createElementNS(NS, 'path');
    p.setAttribute('d', it.d); p.setAttribute('fill', it.fill);
    if (it.role === 'body') p.setAttribute('clip-path', `url(#${cid})`);
    svg.append(p);
    (roles[it.role] ||= []).push({ el: p, it });
    parts.push(p);
  }
  // window shutters sit above the body and cover the holes until they "open"
  const shutters = L.windows.map(([x, y, w, h]) => {
    const r = document.createElementNS(NS, 'rect');
    const e = 0.18 * (w / 10.17 > 1 ? 2 : 1);
    r.setAttribute('x', x - e); r.setAttribute('y', y - e); r.setAttribute('width', w + 2 * e); r.setAttribute('height', h + 2 * e); r.setAttribute('fill', L.bodyFill);
    r.setAttribute('clip-path', `url(#${cid})`);
    svg.append(r); r.dataset.cx = x + w / 2; r.dataset.cy = y + h / 2;
    return r;
  });
  void order;
  // bottom-up reveal of the body (and its window covers) in symbol coordinates; p = 0..1
  const reveal = (p) => { const H = L.vb[3] + 40; cr.setAttribute('y', (-20 + H * (1 - p)).toFixed(2)); cr.setAttribute('height', (H * p + 0.01).toFixed(2)); };
  return { el: svg, roles, shutters, parts, vb: L.vb, bbox: L.bbox, reveal };
}

// Static markup of the official symbol (used on product packaging)
export function logoMark(x, y, size) {
  const L = LOGO.icon, s = size / L.vb[2];
  return `<g transform="translate(${x} ${y}) scale(${s.toFixed(5)})">${L.items.map((it) => `<path d="${it.d}" fill="${it.fill}"/>`).join('')}</g>`;
}

// Style helper for SVG parts: transforms around their own box
export function svgT(el, { x = 0, y = 0, s = 1, sx, sy, r = 0, o = 1, origin = '50% 50%' } = {}) {
  el.style.transformBox = 'fill-box';
  el.style.transformOrigin = origin;
  const ident = !x && !y && !r && (sx ?? s) === 1 && (sy ?? s) === 1;
  el.style.transform = ident ? '' : `translate(${x}px,${y}px) rotate(${r}deg) scale(${sx ?? s},${sy ?? s})`;
  el.style.opacity = o >= 0.999 ? '' : String(Math.max(0, o));
  el.style.visibility = o <= 0.002 ? 'hidden' : '';
}
