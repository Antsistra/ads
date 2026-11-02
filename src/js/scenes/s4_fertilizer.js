// SCENE 4 — Smart Fertilizer Recommendation: fill the form, AI analyses, result assembles with data viz.
import { h, T, E, tw, pr, clamp, lerp, pulse, rng } from '../engine.js';
import { icon } from '../icons.js';
import * as C from '../components.js';
import * as art from '../art.js';
import { makeBg } from '../bg.js';

export const DUR = 7.2;
const X0 = 60;

const kf = (t, pts) => { // keyframes [[t,x,y],...] with eased interpolation
  if (t <= pts[0][0]) return [pts[0][1], pts[0][2]];
  for (let i = 1; i < pts.length; i++) {
    if (t <= pts[i][0]) { const a = pts[i - 1], b = pts[i], p = E.inOutSoft(clamp((t - a[0]) / (b[0] - a[0]))); return [lerp(a[1], b[1], p), lerp(a[2], b[2], p)]; }
  }
  const l = pts[pts.length - 1]; return [l[1], l[2]];
};

export function create(root) {
  const el = h('div', { class: 'scene', id: 's4' });
  const clip = h('div', { class: 'fill' });
  const bgs = makeBg({});
  const bg = bgs.el;
  const head = C.kinetic([{ text: 'Pupuk tepat,' }, { text: 'dosis pas.', accent: true }], { x: 66, y: 140, size: 104, lh: 1.02 });
  const edge = h('div', { class: 's4-edge' });

  const cam = h('div', { class: 'cam' });
  const world = h('div', { class: 'world' });
  cam.append(world);
  const FORM = [], RES = [];
  const put = (arr, node, x, y, z, t0, from = {}) => { node.classList.add('p3'); node.style.left = '0'; node.style.top = '0'; world.append(node); const o = { el: node, x, y, z, t0, from }; arr.push(o); return o; };

  // ---------------- FORM ----------------
  const card = h('div', { class: 'f-card', style: 'width:960px;height:640px;border-radius:44px' });
  const cardO = put(FORM, card, X0, 480, 0, 0.45, { dy: 700, dz: -600, rx: 40 });
  const mkSel = (label, ic, ph, y, t0, from) => {
    const val = h('span', { class: 'val', text: ph, style: 'color:#7B867F' });
    const icn = h('span', { class: 'ico', html: icon(ic, 44, { sw: 1.8, color: '#7B867F' }), style: 'display:flex' });
    const sel = h('div', { class: 'f-sel' }, icn, val, h('div', { class: 'chev', html: icon('chevD', 40, { sw: 2.2 }) }));
    const g = h('div', { class: 'u', style: 'width:896px' }, h('div', { class: 'f-lab', text: label }), sel);
    const o = put(FORM, g, X0 + 32, y, 40, t0, from);
    return { g, sel, val, icn, o };
  };
  const s1 = mkSel('Jenis Tanaman', 'sprout', 'Pilih jenis tanaman', 514, 0.7, { dx: -300, dz: -200, ry: 20 });
  const s2 = mkSel('Umur Tanaman', 'calendar', 'Pilih umur tanaman', 714, 0.85, { dx: 300, dz: -200, ry: -20 });
  const s3 = mkSel('Luas Lahan', 'ruler', 'Masukkan luas lahan', 914, 1.0, { dx: -300, dz: -200, ry: 20 });
  const tip = h('div', { class: 'u f-tip', style: 'width:960px' }, h('div', { class: 'sq', html: icon('sparkle', 38, { filled: true }) }),
    h('div', {}, h('b', { text: 'Tips Petani Cerdas' }), h('span', { text: 'Isi data dengan benar supaya rekomendasi pupuk sesuai kebutuhan tanamanmu.' })));
  put(FORM, tip, X0, 1150, 30, 1.15, { dy: 400, dz: -400, rx: 30 });
  const ctaLbl = h('span', { text: 'Dapatkan Rekomendasi' });
  const cta = h('div', { class: 'u f-cta', style: 'width:960px' }, h('span', { html: icon('sparkle', 44, { filled: true }) }), ctaLbl);
  const ctaWrap = h('div', { class: 'u', style: 'width:960px' }, cta);
  const ctaO = put(FORM, ctaWrap, X0, 1360, 60, 1.28, { dy: 400, dz: -400, rx: 30 });
  const navEl = C.nav('pupuk');
  const navO = put(FORM, navEl, X0, 1700, 100, 1.4, { dy: 300, dz: -300, rx: 30 });
  // dropdown
  const opts = [['Padi', 'grass'], ['Jagung', 'sprout'], ['Cabai Merah', 'sprout'], ['Tomat', 'leaf']];
  const optEls = opts.map(([n, ic]) => h('div', { style: 'height:84px;border-radius:22px;display:flex;align-items:center;gap:22px;padding:0 24px;font-size:34px;font-weight:500', html: icon(ic, 40, { filled: ic === 'sprout', sw: 1.8, color: '#2E6B3C' }) + `<span>${n}</span>` }));
  const dd = h('div', { class: 'u shadow-pop', style: 'width:896px;padding:10px;border-radius:30px;background:#fff;border:2px solid #cfe0d3;transform-origin:50% 0' }, ...optEls);
  const ddO = put(FORM, dd, X0 + 32, 690, 140, 99);

  // ---------------- ANALYSIS ----------------
  const AC = { x: 540, y: 980 };
  const R_ = 210, CIRC = 2 * Math.PI * R_;
  const ring = h('div', { class: 'p3 an-ring' });
  ring.innerHTML = `<svg width="560" height="560" viewBox="-280 -280 560 560">
    <defs><linearGradient id="ang" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#58AE50"/><stop offset="1" stop-color="#0B6B3E"/></linearGradient></defs>
    <circle r="${R_ + 40}" fill="none" stroke="#2E6B3C" stroke-opacity=".12" stroke-width="2" stroke-dasharray="3 14"/>
    <circle r="${R_}" fill="#fff" stroke="#DCE9DF" stroke-width="22"/>
    <circle class="arc" r="${R_}" fill="none" stroke="url(#ang)" stroke-width="22" stroke-linecap="round" stroke-dasharray="${CIRC}" stroke-dashoffset="${CIRC}" transform="rotate(-90)"/>
    <g class="sweep"><path d="M0 0 L0 -${R_ - 20} A${R_ - 20} ${R_ - 20} 0 0 1 ${(R_ - 20) * 0.5} -${(R_ - 20) * 0.866} Z" fill="#58AE50" fill-opacity=".22"/></g>
  </svg>`;
  const arc = ring.querySelector('.arc'), sweep = ring.querySelector('.sweep');
  const core = h('div', { class: 'p3 an-core', html: icon('sprout', 150, { filled: true, color: '#2E6B3C' }) });
  const checkC = h('div', { class: 'p3 an-check', html: icon('check', 110, { sw: 3.4, color: '#fff' }) });
  const cap = h('div', { class: 'p3 u an-cap', html: '<b>Menganalisis kondisi tanaman…</b><span>Mencocokkan jenis, umur dan luas lahan</span>' });
  const chips = [['Cabai Merah', 'sprout'], ['45 hari', 'calendar'], ['1.000 m²', 'ruler']].map(([txt, ic]) => { const c = h('div', { class: 'p3 u an-chip', html: icon(ic, 34, { sw: 2, color: '#2E6B3C' }) + `<span>${txt}</span>` }); world.append(c); return c; });
  world.append(ring, core, checkC, cap);

  // ---------------- RESULT ----------------
  const kgv = h('span', { text: '0 kg' });
  const kgPill = h('span', { class: 'pill', style: 'display:inline-block;min-width:200px;text-align:center' }, kgv);
  const ferti = h('div', { class: 'u f-ferti', style: 'width:960px' },
    h('div', { class: 'hd' }, h('div', { class: 'fl', html: icon('flask', 54, { filled: true }) }),
      h('div', {}, h('div', { class: 'nm', text: 'Pupuk NPK 16-16-16' }), h('div', { class: 'ds', text: 'Pupuk majemuk · fase vegetatif' })),
      h('div', { class: 'kg' }, kgPill, h('small', { text: 'untuk 1.000 m²' }))),
    h('hr'),
    h('div', { class: 'f-row', html: icon('calendar', 36, { color: '#2E6B3C' }) + '<span><b>Frekuensi:</b> tiap 14 hari, 3 kali</span>' }),
    h('div', { class: 'f-row', html: icon('clock', 36, { color: '#2E6B3C' }) + '<span><b>Waktu:</b> pagi hari, 06.00 – 09.00</span>' }),
    h('div', { class: 'f-row', html: icon('ruler', 36, { color: '#2E6B3C' }) + '<span><b>Cara:</b> tabur melingkar 10 cm dari batang</span>' }));
  const fertiO = put(RES, ferti, X0, 480, 40, 4.3, { dy: 600, dz: -600, rx: 35 });

  const barDefs = [['N', 'Nitrogen', 80, '#2E8B43'], ['P', 'Fosfor', 55, '#58AE50'], ['K', 'Kalium', 70, '#E8820C']];
  const bars = barDefs.map(([k, n, v, c]) => ({ v, el: h('div', { class: 'bar' }, h('div', { class: 'k', style: `background:${c}`, text: k }), h('div', { class: 'tr' }, h('div', { class: 'fl', style: `background:${c}` })), h('div', { class: 'v', text: '0%' })) }));
  const segR = 78, segC = 2 * Math.PI * segR;
  const segs = [0, 1, 2].map((i) => { const gap = 18, len = segC / 3 - gap; return `<circle class="seg" r="${segR}" fill="none" stroke="#2E6B3C" stroke-width="26" stroke-linecap="round" stroke-dasharray="${len} ${segC - len}" stroke-dashoffset="${-i * (segC / 3)}" transform="rotate(${-90 + 9})" opacity="0"/>`; }).join('');
  const gauge = h('div', { class: 'dv-r', html: `<svg width="240" height="240" viewBox="-120 -120 240 240"><circle r="${segR}" fill="none" stroke="#E4ECE5" stroke-width="26"/>${segs}</svg><div class="gc"><b>3×</b><span>aplikasi</span></div>` });
  const data = h('div', { class: 'u f-card dv' }, h('div', { class: 'dv-l' }, h('div', { class: 'dv-t', text: 'Kebutuhan Hara Tanaman' }), ...bars.map((b) => b.el)), gauge);
  const dataO = put(RES, data, X0, 970, 70, 4.55, { dy: 600, dz: -600, rx: 35 });
  const segEls = [...gauge.querySelectorAll('.seg')];

  const info = h('div', { class: 'u f-info', style: 'width:960px;margin:0', html: `<b class="t">${icon('info', 34, { color: '#14693A' })}Catatan</b>Siram secukupnya setelah penaburan agar pupuk terserap sempurna dan tidak membakar akar.` });
  const infoO = put(RES, info, X0, 1370, 50, 4.85, { dy: 500, dz: -500, rx: 30 });
  const bShare = h('div', { class: 'f-btn o', html: icon('send', 38, { sw: 2 }) + 'Bagikan' });
  const bWA = h('div', { class: 'f-btn g', html: icon('chat', 42, { filled: true }) + 'Kirim via WhatsApp' });
  const btns = h('div', { class: 'u f-btns', style: 'width:960px' }, bShare, bWA);
  const btnO = put(RES, btns, X0, 1700, 90, 5.05, { dy: 400, dz: -400, rx: 25 });

  const touch = h('div', { class: 'p3 touch', style: 'left:0;top:0' });
  const rip = h('div', { class: 'p3 tap-rip', style: 'left:0;top:0' });
  world.append(touch, rip);
  const sparks = Array.from({ length: 14 }, (_, i) => { const d = h('div', { class: 'p3 burst', style: 'left:0;top:0', html: icon(i % 2 ? 'sparkle' : 'leaf', 34, { filled: true, color: i % 2 ? '#FFC53D' : '#58AE50' }) }); world.append(d); return d; });
  const R = rng(4); const sa = sparks.map(() => R() * 6.283), sd = sparks.map(() => 160 + R() * 240);

  clip.append(bg, cam, head.el);
  el.append(clip, edge);
  root.append(el);

  const place = (o, t, extra = {}) => {
    const f = o.from, p = E.apple(clamp((t - o.t0) / 1.1)), q = 1 - p, sp = E.springSoft(clamp((t - o.t0) / 1.0));
    return {
      x: o.x + (f.dx || 0) * q, y: o.y + (f.dy || 0) * q, z: o.z + (f.dz || 0) * q + (extra.z || 0),
      rx: (f.rx || 0) * q + (extra.rx || 0), ry: (f.ry || 0) * q, rz: (f.rz || 0) * q + (extra.rz || 0), s: lerp(0.94, 1, sp) * (extra.s ?? 1),
      o: clamp((t - o.t0) / 0.28) * (extra.o ?? 1), b: extra.b || 0,
    };
  };

  function setSel(s, filled, hl, text, ic) {
    s.sel.classList.toggle('hl', hl);
    s.val.textContent = filled ? text : s.val.textContent;
    s.val.style.color = filled ? '#101a13' : '#7B867F';
    s.val.style.fontWeight = filled ? '600' : '500';
    if (filled && !s.done) { s.icn.innerHTML = icon(ic, 44, { filled: ic === 'sprout', sw: 1.8, color: '#2E6B3C' }); s.done = true; }
    if (!filled && s.done) { s.done = false; }
  }
  const PH = { s1: 'Pilih jenis tanaman', s2: 'Pilih umur tanaman', s3: 'Masukkan luas lahan' };

  function update(t, tAbs) {
    // ---------- wipe-in
    const wp = tw(t, 0, 0.6, E.inOutSoft);
    clip.style.clipPath = wp >= 1 ? 'none' : `inset(${((1 - wp) * 100).toFixed(2)}% 0 0 0 round 90px 90px 0 0)`;
    edge.style.display = wp > 0 && wp < 1 ? 'block' : 'none';
    edge.style.top = `${((1 - wp) * 1920 - 6).toFixed(1)}px`;

    // ---------- background (shared system)
    bgs.update(tAbs, { lines: 1 });
    const exitT = 6.2;
    head.set(t, 0.4, exitT, E);

    // ---------- camera
    const exit = tw(t, exitT, 0.65, E.inOut);
    const o1 = tw(t, 0.3, 3.2, E.inOutSoft), o2 = tw(t, 3.4, 3.6, E.inOutSoft);
    world.style.transformOrigin = '540px 1180px';
    const z = lerp(-80, 40, o1) - tw(t, 3.3, 0.7, E.inOut) * 60 + o2 * 70 - exit * 420;
    const rx = lerp(10, 3, o1) + (o2 * -2) + exit * 12;
    const ry = lerp(-18, 6, o1) + lerp(0, -14, tw(t, 3.4, 1.4, E.inOutSoft)) + lerp(0, 18, o2) + exit * 28;
    world.style.transform = `translate3d(0,${-28 - exit * 60}px,${z}px) rotateX(${rx}deg) rotateY(${ry}deg)`;

    // ---------- FORM items
    const recede = tw(t, 3.25, 0.55, E.inOut);
    FORM.forEach((o, i) => {
      if (o.t0 > 90) return;
      const x = place(o, t, { z: -700 * recede, o: 1 - clamp(recede * 1.3), b: recede * 8, rx: -20 * recede });
      T(o.el, x);
    });
    // dropdown
    {
      const on = t > 1.7 && t < 2.55, p = E.springSoft(pr(t, 1.7, 0.5)), q = E.inOut(pr(t, 2.38, 0.2));
      T(dd, { x: ddO.x, y: ddO.y - 6 * (1 - p), z: 140 - 700 * recede, sy: lerp(0.6, 1, p) * (1 - q * 0.2), o: on ? clamp((t - 1.7) / 0.12) * (1 - q) : 0 });
      optEls.forEach((e, i) => { e.style.background = i === 2 && t > 2.1 ? '#DCEADD' : ''; e.style.fontWeight = i === 2 && t > 2.1 ? '700' : '500'; });
    }
    setSel(s1, t > 2.4, t > 1.5 && t < 2.5, 'Cabai Merah', 'sprout');
    setSel(s2, t > 2.85, t > 2.5 && t < 2.95, '45 hari setelah tanam', 'calendar');
    setSel(s3, t > 3.1, t > 2.8 && t < 3.15, '1.000 m²', 'ruler');
    if (t <= 2.4) s1.val.textContent = PH.s1; if (t <= 2.85) s2.val.textContent = PH.s2; if (t <= 3.1) s3.val.textContent = PH.s3;
    [s1, s2, s3].forEach((s, i) => { const at = [2.4, 2.85, 3.1][i]; const pp = pulse(t, at, 0.3); s.sel.style.transform = `scale(${1 + 0.025 * pp})`; });
    // CTA press + loading
    const ctaP = pulse(t, 3.2, 0.22);
    cta.style.transform = `scale(${1 - 0.04 * ctaP})`;
    cta.style.background = t > 3.25 ? '#1FA55A' : '#0B6B3E';
    ctaLbl.textContent = t > 3.25 ? 'Menganalisis…' : 'Dapatkan Rekomendasi';

    // ---------- touch path
    {
      const pts = [[0.9, 940, 1100], [1.5, 640, 640], [2.1, 520, 912], [2.55, 700, 820], [2.85, 700, 1020], [3.2, 540, 1419], [3.5, 540, 1440]];
      const [tx, ty] = kf(t, pts);
      const vis = clamp((t - 0.95) / 0.25) * (1 - pr(t, 3.35, 0.2));
      const pr_ = Math.max(pulse(t, 1.5, 0.2), pulse(t, 2.15, 0.2), pulse(t, 2.55, 0.2), pulse(t, 2.85, 0.2), pulse(t, 3.2, 0.2));
      T(touch, { x: tx - 48, y: ty - 48, z: 260 - 700 * recede, s: (1 - pr_ * 0.28), o: vis });
      const taps = [[1.5, 640, 640], [2.15, 520, 912], [2.55, 700, 820], [2.85, 700, 1020], [3.2, 540, 1419]];
      let best = null;
      taps.forEach(([ta, x, y]) => { const p = pr(t, ta, 0.5); if (p > 0 && p < 1) best = [p, x, y]; });
      if (best) T(rip, { x: best[1] - 60, y: best[2] - 60, z: 255, s: lerp(0.3, 1.8, E.expoOut(best[0])), o: (1 - best[0]) * 0.7 }); else T(rip, { o: 0 });
    }

    // ---------- ANALYSIS
    {
      const a0 = 3.5, ap = pr(t, a0, 0.5), arcP = E.inOutSoft(pr(t, 3.6, 0.7));
      const gone = E.inOut(pr(t, 4.45, 0.4));
      const on = t > a0 && t < 4.9;
      const sc = E.springSoft(ap) * (1 - gone * 0.4);
      const oo = on ? clamp(ap * 3) * (1 - gone) : 0;
      T(ring, { x: AC.x - 280, y: AC.y - 280, z: 120, s: sc, o: oo });
      arc.style.strokeDashoffset = String(CIRC * (1 - arcP));
      sweep.style.transform = `rotate(${(t - a0) * 520}deg)`;
      sweep.style.opacity = String(1 - pr(t, 4.2, 0.2));
      const done = t > 4.25;
      T(core, { x: AC.x - 75, y: AC.y - 75 + Math.sin(t * 5) * 4, z: 130, s: (done ? 0 : 1) * sc * (1 + 0.06 * Math.sin(t * 8)), o: on ? oo : 0 });
      const ck = E.springHard(pr(t, 4.25, 0.45));
      T(checkC, { x: AC.x - 100, y: AC.y - 100, z: 135, s: ck * (1 - gone * 0.4), o: on && done ? clamp(pr(t, 4.25, 0.05)) * (1 - gone) : 0 });
      cap.querySelector('b').textContent = done ? 'Rekomendasi siap!' : 'Menganalisis kondisi tanaman…';
      T(cap, { x: 540 - 440, y: AC.y + 320, z: 120, s: 1, o: oo * 1 });
      // chips converge
      const starts = [[540, 609], [540, 809], [540, 1009]];
      chips.forEach((c, i) => {
        const p = E.inOutSoft(pr(t, 3.4 + i * 0.1, 0.65));
        const x = lerp(starts[i][0], AC.x, p), y = lerp(starts[i][1], AC.y, p);
        T(c, { x: x - 120, y: y - 34 - Math.sin(p * Math.PI) * 80, z: 170, s: lerp(1, 0.4, p), o: p > 0 && p < 1 ? clamp(pr(t, 3.4 + i * 0.1, 0.1)) * (1 - E.cubicIn(p)) : 0 });
      });
    }

    // ---------- RESULT
    RES.forEach((o) => {
      const floatY = Math.sin(t * 1.3 + o.y * 0.01) * 4 * clamp(pr(t, o.t0 + 1, 0.8));
      const x = place(o, t, { o: 1 - exit });
      x.y += floatY - exit * 40;
      T(o.el, x);
    });
    // dosage count-up and pulse
    const kp = E.cubicOut(pr(t, 4.6, 0.9));
    kgv.textContent = `${Math.round(12 * kp)} kg`;
    kgPill.style.transform = `scale(${1 + 0.08 * pulse(t, 5.4, 0.4)})`;
    // bars
    bars.forEach((b, i) => {
      const p = E.apple(pr(t, 4.85 + i * 0.14, 1.0));
      b.el.querySelector('.fl').style.width = `${(b.v * p).toFixed(1)}%`;
      b.el.querySelector('.v').textContent = `${Math.round(b.v * p)}%`;
    });
    // gauge segments
    segEls.forEach((s, i) => { const p = E.springSoft(pr(t, 5.0 + i * 0.22, 0.5)); s.setAttribute('opacity', String(clamp(p * 4))); s.style.transformOrigin = '0 0'; });
    gauge.querySelector('.gc').style.transform = `scale(${lerp(0.6, 1, E.springSoft(pr(t, 4.95, 0.6)))})`;
    // WhatsApp press
    const wp2 = pulse(t, 5.6, 0.25);
    bWA.style.transform = `scale(${1 - 0.05 * wp2})`;
    bWA.style.boxShadow = `0 0 0 ${pr(t, 5.65, 0.6) * 40}px rgba(34,208,102,${(1 - pr(t, 5.65, 0.6)) * 0.35})`;
    if (t > 5.15 && t < 5.95) {
      const p = clamp((t - 5.15) / 0.4);
      const bz = btnO.z;
      touch.style.display = 'block';
      T(touch, { x: 790 - 48 + (1 - E.apple(p)) * 120, y: 1756 - 48 + (1 - E.apple(p)) * 150, z: bz + 200, s: (1 - wp2 * 0.28) * E.springSoft(p), o: clamp(p * 3) * (1 - pr(t, 5.8, 0.15)) });
      const rp = pr(t, 5.6, 0.5);
      if (rp > 0 && rp < 1) T(rip, { x: 790 - 60, y: 1756 - 60, z: bz + 190, s: lerp(0.3, 1.8, E.expoOut(rp)), o: (1 - rp) * 0.7 });
    }
    // sparkles when result lands
    sparks.forEach((s, i) => {
      const p = pr(t, 4.4 + i * 0.01, 1.1), d = sd[i] * E.expoOut(p);
      T(s, { x: 540 + Math.cos(sa[i]) * d - 17, y: 980 + Math.sin(sa[i]) * d * 0.9 - 17 + p * p * 120, z: 200, rz: p * 220, s: (1 - p) * (0.7 + (i % 3) * 0.3), o: p > 0 && p < 1 ? 1 : 0 });
    });
  }
  return { el, update, dur: DUR };
}
