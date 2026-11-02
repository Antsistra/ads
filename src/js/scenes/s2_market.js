// SCENE 2 — Agricultural Marketplace: assemble the home UI in 3D, scroll to products, add to cart, then list & sell a harvest.
import { h, T, E, tw, pr, clamp, lerp, pulse, win, fmtID } from '../engine.js';
import { icon } from '../icons.js';
import * as C from '../components.js';
import * as art from '../art.js';
import { makeParticles } from '../fx.js';

export const DUR = 7.7;

export function create(root) {
  const el = h('div', { class: 'scene', id: 's2' });
  const bg = h('div', { class: 'fill s2-bg' });
  const orbA = h('div', { class: 's2-orb a' }), orbB = h('div', { class: 's2-orb b' });
  const bigWord = h('div', { class: 's2-bigword', text: 'PASAR TANI' });
  const cv = h('canvas', { class: 'fx' });
  const pop = h('div', { class: 's2-pop' });
  const tag = h('div', { class: 's2-tag', html: '<i></i>01 · MARKETPLACE' });
  const headA = C.kinetic([{ text: 'Belanja' }, { text: 'kebutuhan' }, { text: 'tani.', accent: true }], { x: 66, y: 176, size: 132, lh: 1.0 });
  const headB = C.kinetic([{ text: 'Jual hasil' }, { text: 'panenmu.', accent: true }], { x: 66, y: 176, size: 132, lh: 1.0, accent: '#E8820C' });
  const parts = makeParticles(cv, { n: 46, seed: 5, color: '60,140,70', sizeMax: 14, comp: 'source-over', bokeh: 0.5 });

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
  const touchB = h('div', { class: 'p3 touch' });
  const thumbs = [0, 1].map((i) => { const d = h('div', { class: 'p3 fly-thumb', html: i ? art.seedPacket({ w: 54 }) : art.spinach({ w: 82 }) }); worldA.append(d); return d; });
  const rip = [0, 1].map(() => { const d = h('div', { class: 'p3 tap-rip' }); worldA.append(d); return d; });

  // ---------------- SELL world ----------------
  const camB = h('div', { class: 'cam' });
  const worldB = h('div', { class: 'world' });
  camB.append(worldB);
  const Q = [];
  const addB = (node, bx, by, bz, t0, from = {}) => { node.classList.add('p3'); node.style.left = '0'; node.style.top = '0'; worldB.append(node); Q.push({ el: node, bx, by, bz, t0, from }); return node; };

  const statusChip = h('div', { class: 'sell-chip', html: icon('check', 26, { sw: 3, color: '#fff' }) + 'Panen Hari Ini' });
  const crate = h('div', { class: 'abs', style: 'left:280px;top:30px', html: art.chiliCrate({ w: 400 }) });
  const sellBtn = h('div', { class: 'f-cta', style: 'margin:0 40px', html: icon('basket', 44, { filled: true }) + '<span class="bt">Tayangkan di Pasar</span>' });
  const stamp = h('div', { class: 'sell-stamp', html: icon('checkCircle', 64, { filled: true, color: '#fff', cut: '#1FA55A' }) + '<span>TERJUAL!</span>' });
  const price = h('div', { class: 'sell-price', text: 'Rp 38.000' });
  const listing = h('div', { class: 'u sell-card' },
    h('div', { class: 'sell-im' }, crate, statusChip),
    h('div', { class: 'sell-body' },
      h('div', { class: 'sell-t', text: 'Cabai Merah Keriting' }),
      h('div', { class: 'sell-meta', html: `<span>${icon('basket', 28, { filled: true })}50 kg</span><span>${icon('star', 26, { filled: true })}Grade A</span><span>${icon('shield', 28)}Segar</span>` }),
      h('div', { class: 'sell-row' }, price, h('small', { text: '/ kg' })),
    ), sellBtn, stamp);
  listing.style.transformOrigin = '50% 0';
  const headerB = addB(h('div', { class: 'u', html: '<div style="font-size:56px;font-weight:800;letter-spacing:-.02em">Jual Hasil Panen</div><div style="font-size:31px;margin-top:8px;color:#34443a">Tayangkan panenmu, pembeli datang sendiri.</div>' }), 60, 640, 40, 4.05, { dx: -300, dz: -300 });
  addB(listing, 60, 800, 60, 4.2, { dy: 700, dz: -700, rx: 45 });
  const toastData = [['BS', 'Bu Sari', '20 kg', 'Rp 760.000'], ['PD', 'Pak Dedi', '15 kg', 'Rp 570.000'], ['KT', 'Kios Tani Jaya', '15 kg', 'Rp 570.000']];
  const toasts = toastData.map(([ini, n, q, p], i) => {
    const t = h('div', { class: 'u toast', html: `<div class="av">${ini}</div><div class="tx"><b>Pesanan baru!</b><span>${n} · ${q}</span></div><div class="am">${p}</div>` });
    return addB(t, 90, 1420 + i * 160, 220 + i * 25, 99, {});
  });
  const revenue = h('div', { class: 'u sell-rev' }, h('small', { text: 'Total terjual hari ini' }), h('b', { text: 'Rp 0' }));
  addB(revenue, 60, 640, 260, 99, {});
  const revB = revenue.querySelector('b');
  worldB.append(touchB);
  const burst = Array.from({ length: 16 }, (_, i) => { const d = h('div', { class: 'p3 burst', html: icon(i % 3 === 0 ? 'coin' : 'leaf', 34, { filled: true, color: i % 3 === 0 ? '#FFC53D' : '#58AE50' }) }); worldB.append(d); return d; });

  el.append(bg, orbA, orbB, bigWord, cv, camA, camB, tag, headA.el, headB.el, pop);
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

  function update(t) {
    // ------- background
    const reveal = tw(t, 0, 1.0, E.cubicOut);
    bg.style.background = `radial-gradient(ellipse ${60 + reveal * 70}% ${40 + reveal * 50}% at 61% 39%, #F1F9F3 0%, #E6F2E9 55%, #DCEBDF 100%)`;
    T(orbA, { x: Math.sin(t * 0.5) * 60, y: Math.cos(t * 0.4) * 50, o: reveal });
    T(orbB, { x: Math.cos(t * 0.45) * 70, y: Math.sin(t * 0.35) * 60, o: reveal });
    T(bigWord, { x: lerp(120, -260, t / DUR), y: 0, o: reveal * (1 - pr(t, 6.9, 0.5)) });
    bigWord.textContent = t < 3.9 ? 'PASAR TANI' : 'PANEN & JUAL';
    parts.draw(t, { alpha: 0.5 * reveal, speed: 0.5, parallaxX: Math.sin(t * 0.4) * 0.5 });
    // iris ring on arrival (from the logo window)
    const ir = pr(t, 0, 1.2);
    T(pop, { x: 0, y: 0, s: lerp(0.05, 2.6, E.expoOut(ir)), o: (1 - ir) * 0.8 * (ir > 0 ? 1 : 0) });

    // ------- headline & tag
    T(tag, { y: (1 - tw(t, 0.25, 0.8)) * -30, o: tw(t, 0.25, 0.5, E.lin) * (1 - pr(t, 3.6, 0.3)) });
    headA.set(t, 0.35, 3.65, E);
    headB.set(t, 4.0, 6.85, E);
    if (t > 3.9) { tag.innerHTML = '<i></i>02 · JUAL HASIL PANEN'; tag.style.opacity = String(tw(t, 3.95, 0.5, E.lin) * (1 - pr(t, 6.8, 0.3))); }

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

    // ------- SELL world
    if (t >= 3.7) {
      const exitB = tw(t, 6.95, 0.55, E.inOut);
      const orbit = tw(t, 3.9, 3.3, E.inOutSoft);
      worldB.style.transformOrigin = '540px 1200px';
      worldB.style.transform = `translate3d(0,${-exitB * 60}px,${lerp(-120, 20, orbit) - exitB * 400}px) rotateX(${lerp(12, 1, orbit) + exitB * 10}deg) rotateY(${lerp(18, -8, orbit) - exitB * 24}deg)`;
      camB.style.opacity = String(clamp(pr(t, 3.75, 0.2)) * (1 - pr(t, 7.1, 0.3)));
      const shrink = tw(t, 5.85, 0.7, E.inOut);
      for (const o of Q) {
        if (o.t0 > 90) continue;
        const q = posOf(o, t);
        if (o.el === listing) { q.y -= 70 * shrink; q.s *= 1 - 0.16 * shrink; }
        if (o.el === headerB) q.o *= 1 - clamp(shrink * 2);
        T(o.el, q);
      }
      // crate bob
      crate.style.transform = `translateY(${Math.sin(t * 2.2) * 6}px) rotate(${Math.sin(t * 1.3) * 1.2}deg)`;
      // button press at 5.55 -> "Tayang"
      const bp = pulse(t, 5.45, 0.25);
      sellBtn.style.transform = `scale(${1 - 0.05 * bp})`;
      const live = t > 5.55;
      sellBtn.style.background = live ? '#1FA55A' : '#0B6B3E';
      sellBtn.querySelector('.bt').textContent = live ? 'Sedang Tayang' : 'Tayangkan di Pasar';
      sellBtn.querySelector('svg').outerHTML = live ? icon('check', 44, { sw: 3.2 }) : icon('basket', 44, { filled: true });
      statusChip.style.transform = `scale(${E.springSoft(pr(t, 4.7, 0.5))})`;
      const tp = pr(t, 5.1, 0.35);
      touchB.style.display = 'block';
      T(touchB, { x: 540 - 48, y: 1480 - 48, z: 280, s: (1 - bp * 0.28) * E.springSoft(tp), o: clamp(tp * 3) * (1 - pr(t, 5.75, 0.2)) });
      // price tick
      price.style.transform = `scale(${1 + 0.06 * pulse(t, 5.5, 0.4)})`;
      // toasts
      toasts.forEach((tt, i) => {
        const t0 = 6.05 + i * 0.4;
        const p = E.apple(clamp((t - t0) / 0.9)), s = E.springSoft(clamp((t - t0) / 0.8));
        T(tt, { x: 90 + (1 - p) * 700, y: 1420 + i * 160 + (1 - p) * 30, z: 240 + i * 30, ry: (1 - p) * -35, rz: (1 - p) * 4, s: lerp(0.8, 1, s), o: clamp((t - t0) / 0.15) });
      });
      // revenue
      const rp = pr(t, 6.0, 1.3);
      const val = 1900000 * E.cubicOut(rp);
      revB.textContent = 'Rp ' + fmtID(val);
      T(revenue, { x: 60, y: 640 + (1 - E.apple(pr(t, 6.0, 0.8))) * -40, z: 280, o: clamp((t - 6.0) / 0.25), s: 1 + 0.04 * pulse(t, 6.9, 0.4) });
      // stamp
      const sp = E.springHard(pr(t, 6.05, 0.6));
      T(stamp, { x: 0, y: 0, rz: -12, s: lerp(3.2, 1, sp), o: clamp(pr(t, 6.05, 0.1)) });
      // burst
      burst.forEach((b, i) => {
        const p = pr(t, 6.1, 1.1), a = (i / burst.length) * 6.283 + 0.4, d = (140 + (i % 4) * 90) * E.expoOut(p);
        const gx = 800 + Math.cos(a) * d, gy = 1000 + Math.sin(a) * d * 0.85 + p * p * 160;
        T(b, { x: gx, y: gy, z: 300, rz: p * (i % 2 ? 260 : -260), s: (1 - p) * (0.7 + (i % 3) * 0.25), o: p > 0 && p < 1 ? 1 : 0 });
      });
    }
  }
  return { el, update, dur: DUR };
}
