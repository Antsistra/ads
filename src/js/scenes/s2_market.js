// SCENE 2 — Agricultural Marketplace: assemble the home UI in 3D, add products to the cart, then browse the full catalogue (seeds, fertilizer, AB Mix, growing media, tools).
import { h, T, E, tw, pr, clamp, lerp, pulse, win, fmtID } from '../engine.js';
import { icon } from '../icons.js';
import * as C from '../components.js';
import * as art from '../art.js';
import { makeBg } from '../bg.js';

export const DUR = 7.7;

export function create(root) {
  const el = h('div', { class: 'scene', id: 's2' });
  const bg = makeBg({});
  const tag = h('div', { class: 's2-tag', html: '<i></i>01 · MARKETPLACE' });
  const headA = C.kinetic([{ text: 'Belanja' }, { text: 'kebutuhan' }, { text: 'tani.', accent: true }], { x: 66, y: 176, size: 104, lh: 1.02 });
  const headB = C.kinetic([{ text: 'Pupuk, benih,' }, { text: 'hingga peralatan.', accent: true }], { x: 66, y: 176, size: 104, lh: 1.02 });

  // ---------------- BUY world ----------------
  const camA = h('div', { class: 'cam s2-cam' });
  const worldA = h('div', { class: 'world' });
  camA.append(worldA);
  const scroller = h('div', { class: 'p3 g3', style: 'left:0;top:0;width:1080px;height:1920px' });
  worldA.append(scroller);
  const P = []; // {el, bx, by, bz, t0, from:{...}}
  const add = (parent, node, bx, by, bz, t0, from = {}) => { node.classList.add('p3'); node.style.left = '0'; node.style.top = '0'; parent.append(node); P.push({ el: node, bx, by, bz, t0, from, top: by < 1300 && by > 600 && parent === scroller && !(by >= 1330) }); return node; };

  const greet = add(scroller, C.greeting(), 60, 640, 40, 0.40, { dx: -380, dz: -300, ry: 25 });
  const bell = add(scroller, C.bellBtn(), 812, 636, 70, 0.52, { dy: -160, dz: -200, s0: 0.2 });
  const cartHdr = C.cartBtn(0);
  cartHdr.badge.style.display = 'none';
  add(scroller, cartHdr.el, 926, 636, 70, 0.60, { dy: -160, dz: -200, s0: 0.2 });
  add(scroller, C.weather(), 60, 774, 30, 0.66, { dx: -300, dz: -200 });
  const sb = C.searchBar('Cari');
  add(scroller, sb.el, 60, 854, 24, 0.72, { dx: 420, dz: -260, ry: -30 });
  sb.el.style.width = '960px';
  const bn = C.banner();
  add(scroller, bn.el, 60, 990, 100, 0.84, { dy: 420, dz: -500, rx: 40 });
  add(scroller, C.dots(), 60, 1330, 24, 1.12, { dy: 200, dz: -100 });
  scroller.lastChild.style.width = '960px';
  add(scroller, h('div', { class: 'u u-h2', text: 'Kategori' }), 60, 1378, 24, 1.15, { dx: -200, dz: -100 });
  C.CATS.forEach((c, i) => add(scroller, C.catItem(c, i === 0), 60 + i * 160, 1456, 60, 1.2 + i * 0.07, { dy: 420, dz: -420, rx: 50, rz: (i - 2.5) * 6 }));
  add(scroller, h('div', { class: 'u u-h2', text: 'Produk Pilihan' }), 60, 1700, 24, 1.0, { dx: -200, dz: -100 });
  const pBayam = C.prodCard({ title: 'Bayam segar', price: 'Rp 12.000', unit: '/ ikat', art: art.spinach({ w: 330 }), bg: '#F4EBDD' });
  pBayam.el.querySelector('.tt').style.minHeight = '114px';
  const pCabai = C.prodCard({ title: 'Benih Cabai Merah Keriting', price: 'Rp 24.000', unit: '/ sachet', art: art.seedPacket({ w: 230 }), bg: '#EAF2E0', official: true, ribbon: true });
  add(scroller, pBayam.el, 60, 1770, 110, 1.05, { dy: 700, dz: -600, rx: 40, rz: -6 });
  add(scroller, pCabai.el, 552, 1770, 110, 1.18, { dy: 700, dz: -600, rx: 40, rz: 6 });
  const navA = C.nav('home');
  add(worldA, navA, 60, 1736, 150, 1.3, { dy: 300, dz: -300, rx: 35 });
  const cartFab = C.cartBtn(0);
  add(worldA, cartFab.el, 926, 650, 180, 99, { s0: 0.1 }); // custom-timed

  // touch indicator + flying thumbs
  const touch = h('div', { class: 'p3 touch' });
  worldA.append(touch);
  const thumbs = [0, 1].map((i) => { const d = h('div', { class: 'p3 fly-thumb', html: i ? art.seedPacket({ w: 54 }) : art.spinach({ w: 82 }) }); worldA.append(d); return d; });
  const rip = [0, 1].map(() => { const d = h('div', { class: 'p3 tap-rip' }); worldA.append(d); return d; });

  // ---------------- CATALOGUE world ----------------
  const camB = h('div', { class: 'cam' });
  const worldB = h('div', { class: 'world' });
  camB.append(worldB);
  const Q = [];
  const addB = (parent, node, bx, by, bz, t0, from = {}, extra = {}) => { node.classList.add('p3'); node.style.left = '0'; node.style.top = '0'; parent.append(node); const o = { el: node, bx, by, bz, t0, from, ...extra }; Q.push(o); return o; };

  // category chips
  const chipDefs = [['Semua', 'grid', 176], ['Benih', 'sprout', 164], ['Pupuk', 'leaf', 164], ['AB Mix', 'drop', 176], ['Media Tanam', 'grass', 246], ['Peralatan', 'tools', 216]];
  const chipX = []; let cx0 = 60; chipDefs.forEach(([, , w]) => { chipX.push(cx0); cx0 += w + 14; });
  const chips = chipDefs.map(([n, ic, w], i) => {
    const e = h('div', { class: 'u cat-chip', style: `width:${w}px`, html: icon(ic, 36, { filled: ic !== 'tools' && ic !== 'grass' && ic !== 'leaf', sw: 1.9 }) + `<span>${n}</span>` });
    return addB(worldB, e, chipX[i], 660, 60, 3.95 + i * 0.07, { dy: 200, dz: -300, rx: 30 }, { chip: i });
  });

  // product grid (scrolls)
  const grid = h('div', { class: 'p3 g3', style: 'left:0;top:0;width:1080px;height:1920px' });
  worldB.append(grid);
  const prods = [
    ['Benih Cabai Rawit Hibrida', 'Rp 28.000', '/ sachet', art.seedPack({ w: 190, title: 'BENIH CABAI', veg: 'chili', name: 'RAWIT F1', sub: 'Pedas · Hibrida' }), '#EAF2E0'],
    ['Benih Tomat Cherry', 'Rp 22.000', '/ sachet', art.seedPack({ w: 190, title: 'BENIH TOMAT', veg: 'tomato', color: ['#F0A24A', '#D2691E'], band: '#2E7D32', name: 'CHERRY F1', sub: 'Manis · Genjah' }), '#F8EBDC'],
    ['Pupuk NPK 16-16-16', 'Rp 38.000', '/ kg', art.sack({ title: 'NPK', sub: '16-16-16', w: 168, color: '#2D7E3B', tone: '#F1ECD9', kg: '1 KG' }), '#EFEBDD'],
    ['Pupuk Organik Granul', 'Rp 55.000', '/ 5 kg', art.sack({ title: 'ORGANIK', sub: 'Granul Subur', w: 168, color: '#3E8E3F', kg: '5 KG' }), '#E8F0DD'],
    ['AB Mix Sayuran', 'Rp 45.000', '/ set 5 L', art.abMix({ w: 190 }), '#E3EEF2'],
    ['Cocopeat Blok', 'Rp 32.000', '/ blok 5 kg', art.sack({ title: 'COCOPEAT', sub: 'Media Tanam', w: 168, color: '#8B5E34', tone: '#E9DCC8', kg: '5 KG' }), '#F1E8DA'],
    ['Sprayer Elektrik 16 L', 'Rp 389.000', '/ unit', art.sprayer({ w: 180 }), '#E7F0E9'],
    ['Cangkul Baja Premium', 'Rp 85.000', '/ unit', art.hoe({ w: 250 }), '#F2ECE2'],
  ];
  const cards = prods.map(([title, price, unit, a, bgc], i) => {
    const pc = C.prodCard({ title, price, unit, art: a, bg: bgc });
    pc.el.classList.add('cat-card');
    const row = i >> 1, col = i & 1;
    const o = addB(grid, pc.el, 60 + col * 492, 790 + row * 466, 70, 4.15 + row * 0.12 + col * 0.08, { dy: 700, dz: -600, rx: 40, rz: col ? 5 : -5 }, { card: true, row, h: 430 });
    return o;
  });
  const navB = addB(worldB, C.nav('home'), 60, 1736, 150, 4.5, { dy: 300, dz: -300, rx: 35 });
  const touchB = h('div', { class: 'p3 touch', style: 'left:0;top:0' });
  const ripB = h('div', { class: 'p3 tap-rip', style: 'left:0;top:0' });
  worldB.append(touchB, ripB);

  el.append(bg.el, camA, camB, tag, headA.el, headB.el);
  root.append(el);

  const posOf = (o, t) => {
    const f = o.from, p = E.apple(clamp((t - o.t0) / 1.1)), q = 1 - p;
    const spr = E.springSoft(clamp((t - o.t0) / 1.0));
    return {
      x: o.bx + (f.dx || 0) * q, y: o.by + (f.dy || 0) * q, z: o.bz + (f.dz || 0) * q,
      rx: (f.rx || 0) * q, ry: (f.ry || 0) * q, rz: (f.rz || 0) * q, s: lerp(f.s0 ?? 1, 1, spr),
      o: clamp((t - o.t0) / 0.28),
    };
  };

  function update(t, tAbs) {
    // ------- background (shared system; identical to the intro's so the window push-through is seamless)
    bg.update(tAbs, { lines: 1 });

    // ------- headline & tag
    T(tag, { y: (1 - tw(t, 0.25, 0.8)) * -30, o: tw(t, 0.25, 0.5, E.lin) * (1 - pr(t, 3.6, 0.3)) });
    headA.set(t, 0.35, 3.55, E);
    headB.set(t, 4.0, 6.85, E);
    if (t > 3.9) { tag.innerHTML = '<i></i>02 · KATALOG LENGKAP'; tag.style.opacity = String(tw(t, 3.95, 0.5, E.lin) * (1 - pr(t, 6.8, 0.3))); }

    // ------- BUY world visibility
    const buyOn = t < 4.15;
    camA.style.display = buyOn ? '' : 'none';
    camB.style.display = t >= 3.8 ? '' : 'none';

    if (buyOn) {
      const sy = lerp(0, -620, tw(t, 1.95, 0.8, E.inOutSoft));
      scroller.style.transform = `translate3d(0,${sy}px,0)`;
      const orbit = tw(t, 0.2, 4.0, E.inOutSoft);
      const exitA = tw(t, 3.7, 0.5, E.inOut);
      worldA.style.transformOrigin = '540px 1250px';
      worldA.style.transform = `translate3d(0,${-exitA * 80}px,${lerp(-60, 60, orbit) - exitA * 500}px) rotateX(${lerp(14, 3, orbit) + exitA * 14}deg) rotateY(${lerp(-22, 14, orbit) + exitA * 30}deg)`;
      camA.style.opacity = String(1 - pr(t, 3.75, 0.35));
      const scP = tw(t, 1.95, 0.8, E.inOutSoft);
      for (const o of P) { if (o.t0 > 90) continue; const q = posOf(o, t); if (o.top) q.o *= 1 - clamp(scP * 1.5); T(o.el, q); }
      // banner shimmer
      const sh = pr(t, 1.9, 0.9);
      T(bn.shine, { x: lerp(0, 1300, E.inOut(sh)), o: sh > 0 && sh < 1 ? 1 : 0 });
      bn.bags.style.transform = `translateX(${Math.sin(t * 1.6) * 6}px) translateY(${Math.sin(t * 2) * 5}px)`;
      // search typing placeholder
      // cart floating button
      const cp = E.springHard(pr(t, 2.2, 0.7));
      T(cartFab.el, { x: 926, y: 650 + 4 * Math.sin(t * 2), z: 220, s: cp, o: clamp(pr(t, 2.2, 0.15)) });
      const cnt = t > 3.55 ? 2 : t > 3.3 ? 1 : 0;
      cartFab.badge.textContent = String(cnt);
      const bump = Math.max(pulse(t, 3.3, 0.3), pulse(t, 3.55, 0.3));
      cartFab.badge.style.transform = `scale(${cnt ? 1 + bump * 0.55 : 0})`;
      cartFab.el.style.transform += ` scale(${1 + bump * 0.12})`;
      // navigation bar
      // tap interactions
      const plusPos = [[465, 1632], [957, 1632]];
      const taps = [2.85, 3.1];
      const cartPos = [973, 697];
      touch.style.display = 'block';
      const tp = pr(t, 2.5, 0.3);
      const mv = E.inOut(pr(t, 2.97, 0.16));
      const tx = lerp(plusPos[0][0], plusPos[1][0], mv) + 8, ty = plusPos[0][1] + 20;
      const pressed = Math.max(pulse(t, taps[0], 0.2), pulse(t, taps[1], 0.2));
      T(touch, { x: tx - 48, y: ty - 48, z: 240, s: (1 - pressed * 0.28) * E.springSoft(tp), o: clamp(tp * 3) * (1 - pr(t, 3.45, 0.2)) });
      // taps (ripple + plus press)
      rip.forEach((r, i) => {
        const p = pr(t, taps[i], 0.5);
        T(r, { x: plusPos[i][0] - 60, y: plusPos[i][1] - 60 + 0, z: 230, s: lerp(0.3, 1.8, E.expoOut(p)), o: p > 0 && p < 1 ? (1 - p) * 0.7 : 0 });
      });
      [pBayam, pCabai].forEach((pc, i) => {
        const p = pulse(t, taps[i], 0.3);
        pc.plus.style.transform = `scale(${1 - 0.22 * p})`;
        pc.plus.innerHTML = t > taps[i] + 0.04 ? icon('check', 40, { sw: 3 }) : icon('plus', 40, { sw: 2.6 });
      });
      thumbs.forEach((th, i) => {
        const p = pr(t, taps[i] + 0.03, 0.45);
        if (p <= 0 || p >= 1) { th.style.visibility = 'hidden'; return; }
        const e = E.inOutSoft(p);
        const p0 = plusPos[i], p1 = cartPos, cx = (p0[0] + p1[0]) / 2 + (i ? -80 : -240), cy = Math.min(p0[1], p1[1]) - 120;
        const px = (1 - e) * (1 - e) * p0[0] + 2 * (1 - e) * e * cx + e * e * p1[0];
        const py = (1 - e) * (1 - e) * (p0[1]) + 2 * (1 - e) * e * cy + e * e * p1[1];
        T(th, { x: px - 30, y: py - 30 + 0, z: 250, s: lerp(1, 0.35, e), o: 1 });
      });
    }

    // ------- CATALOGUE world
    if (t >= 3.7) {
      const exitB = tw(t, 6.95, 0.55, E.inOut);
      const orbit = tw(t, 3.9, 3.3, E.inOutSoft);
      worldB.style.transformOrigin = '540px 1200px';
      worldB.style.transform = `translate3d(0,${-exitB * 60}px,${lerp(-120, 20, orbit) - exitB * 400}px) rotateX(${lerp(12, 1, orbit) + exitB * 10}deg) rotateY(${lerp(16, -6, orbit) - exitB * 24}deg)`;
      camB.style.opacity = String(clamp(pr(t, 3.75, 0.2)) * (1 - pr(t, 7.1, 0.3)));

      // tabs: Benih (default) -> Pupuk (5.0) -> AB Mix (5.8) -> Peralatan (6.55)
      const taps = [5.0, 5.8, 6.55], tabs = [2, 3, 5];
      const active = t >= taps[2] ? tabs[2] : t >= taps[1] ? tabs[1] : t >= taps[0] ? tabs[0] : 1;
      const scr = -466 * tw(t, taps[0] + 0.05, 0.7, E.inOutSoft) - 466 * tw(t, taps[1] + 0.05, 0.7, E.inOutSoft);
      const rowShift = -240 * tw(t, 5.05, 0.7, E.inOutSoft);
      grid.style.transform = `translate3d(0,${scr}px,0)`;
      chips.forEach((o) => {
        const q = posOf(o, t);
        q.x += rowShift;
        if (o.chip === 0) q.o *= 1 - clamp((-rowShift - 20) / 60); // first chip slides out of the left edge
        T(o.el, q);
        const on = o.chip === active;
        o.el.classList.toggle('on', on);
        const tp = taps.findIndex((ta, k) => tabs[k] === o.chip);
        const pp = tp >= 0 ? pulse(t, taps[tp], 0.3) : 0;
        o.el.style.transform += ` scale(${1 + 0.07 * pp})`;
      });
      cards.forEach((o) => {
        const q = posOf(o, t);
        const ys = o.by + scr;
        q.o *= clamp((ys + o.h - 800) / 110);        // cards leave softly under the tab bar
        // cards of the selected category lift slightly
        const secRow = active === 2 ? [2, 3] : active === 3 ? [4, 5] : active === 5 ? [6, 7] : [0, 1];
        const idx = cards.indexOf(o);
        const lift = secRow.includes(idx) ? E.apple(pr(t, active === 1 ? 4.7 : taps[tabs.indexOf(active)] + 0.2, 0.7)) : 0;
        q.z += 40 * lift; q.y += -6 * lift;
        T(o.el, q);
      });
      T(navB.el, posOf(navB, t));

      // touch
      const pts = [[3.95, 880, 1100], [4.9, 520, 704], [5.55, 520, 704], [5.75, 454, 704], [6.4, 454, 704], [6.5, 924, 704], [6.9, 924, 704]];
      const kfp = (() => { for (let i = 1; i < pts.length; i++) if (t <= pts[i][0]) { const A = pts[i - 1], B = pts[i], p = E.inOutSoft(clamp((t - A[0]) / (B[0] - A[0]))); return [lerp(A[1], B[1], p), lerp(A[2], B[2], p)]; } return [pts[pts.length - 1][1], pts[pts.length - 1][2]]; })();
      const press = Math.max(...taps.map((ta) => pulse(t, ta, 0.22)));
      const vis = clamp((t - 4.45) / 0.3) * (1 - pr(t, 6.85, 0.2));
      touchB.style.display = 'block';
      T(touchB, { x: kfp[0] - 48, y: kfp[1] - 48, z: 260, s: (1 - press * 0.28), o: vis });
      let best = null; taps.forEach((ta, k) => { const p = pr(t, ta, 0.5); if (p > 0 && p < 1) best = [p, k]; });
      if (best) { const cxp = [510, 454, 924][best[1]]; T(ripB, { x: cxp - 60, y: 704 - 60, z: 255, s: lerp(0.3, 1.8, E.expoOut(best[0])), o: (1 - best[0]) * 0.7 }); } else T(ripB, { o: 0 });
    }
  }
  return { el, update, dur: DUR };
}
