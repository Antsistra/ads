// SCENE 3 — Tanya Tani AI: a chat is typed, sent, the AI "thinks", answers word-by-word and floats product recommendations out of the panel.
import { h, T, E, tw, pr, clamp, lerp, pulse, rng } from '../engine.js';
import { icon } from '../icons.js';
import * as C from '../components.js';
import * as art from '../art.js';
import { makeBg } from '../bg.js';

export const DUR = 8.6;
const PX = 40, PY = 444;            // chat panel origin (screen px)
const IRIS = { x: 540, y: 1300 };   // iris-open origin
const MSG = 'Daun cabai saya keriting, kenapa ya?';
const AI_TXT = [['Itu tanda ', 0], ['serangan kutu kebul', 1], [' atau kurang unsur hara. Semprot ', 0], ['insektisida nabati', 1], [' tiap 3 hari, lalu beri ', 0], ['pupuk NPK', 1], [' untuk memulihkan daun.', 0]];

export function create(root) {
  const el = h('div', { class: 'scene', id: 's3' });
  const clip = h('div', { class: 'fill' });
  const bgs = makeBg({ dark: true });
  const bg = bgs.el;
  const tag = h('div', { class: 's3-tag', html: '<i></i>03 · TANYA TANI AI' });
  const head = C.kinetic([{ text: 'Tanya apa saja.' }, { text: 'Dijawab AI.', accent: true }], { x: 66, y: 178, size: 100, lh: 1.02, color: '#F2FAF3', accent: '#8FE184' });

  // ---- 3D world with panel + independent layers above it
  const cam = h('div', { class: 'cam' });
  const world = h('div', { class: 'world' });
  cam.append(world);
  const L = []; // {el, x, y, z}
  const put = (node, x, y, z = 30) => { node.classList.add('p3'); node.style.left = '0'; node.style.top = '0'; world.append(node); const o = { el: node, x: PX + x, y: PY + y, z }; L.push(o); return o; };

  const stat = h('div', { class: 'st' });
  const panel = h('div', { class: 'p3 u c-panel shadow-pop', style: 'left:0;top:0' },
    h('div', { class: 'c-head' },
      h('div', { class: 'c-av', html: icon('chat', 46, { filled: true }) }),
      h('div', {}, h('div', { class: 'tt', text: 'Tanya Tani' }), stat),
      h('div', { style: 'margin-left:auto;color:#2E6B3C;display:flex;gap:18px', html: icon('sparkle', 40, { filled: true }) }),
    ));
  world.append(panel);

  // WhatsApp consult card
  const wa = h('div', { class: 'u c-wa', style: 'width:928px;height:148px' },
    h('div', { class: 'ic1', html: icon('chat', 44, { filled: true }) }),
    h('div', {}, h('b', { text: 'Konsultasi via WhatsApp' }), h('span', { text: 'Ngobrol langsung dengan penyuluh pertanian' })),
    h('div', { class: 'go', html: icon('send', 46, { filled: true }) }));
  const waO = put(wa, 36, 160, 34);

  // composer
  const typed = h('span', { class: 'typed' });
  const caret = h('i', { style: 'display:inline-block;width:3px;height:40px;background:#2E6B3C;margin-left:4px;vertical-align:middle' });
  const ph = h('span', { text: 'Tulis pertanyaanmu…' });
  const field = h('div', { class: 'f', style: 'overflow:hidden;white-space:nowrap' }, ph, typed, caret);
  const sendBtn = h('div', { class: 'sd', html: icon('send', 48, { filled: true }) });
  const input = h('div', { class: 'u c-input', style: 'width:928px' }, field, sendBtn);
  const inO = put(input, 36, 1244, 34);

  // user bubble
  const userB = h('div', { class: 'u c-user', style: 'display:block;width:640px;line-height:1.36;border-bottom-right-radius:8px;transform-origin:100% 100%', text: MSG });
  const userO = put(userB, 324, 336, 44);

  // thinking dots
  const dotsI = [0, 1, 2].map(() => h('i'));
  const thinkAv = h('div', { class: 'c-av s', html: icon('sparkle', 34, { filled: true }) });
  const think = h('div', { class: 'u c-ai', style: 'width:300px' }, thinkAv, h('div', { class: 'bub', style: 'flex:none;padding:26px 34px' }, h('div', { class: 'c-dots' }, ...dotsI)));
  const thinkO = put(think, 36, 508, 40);

  // AI answer
  const words = [];
  const bub = h('div', { class: 'bub', style: 'transform-origin:0 0' });
  AI_TXT.forEach(([txt, b]) => {
    txt.split(/(\s+)/).forEach((tok) => {
      if (!tok) return;
      if (/^\s+$/.test(tok)) { bub.append(document.createTextNode(' ')); return; }
      const s = h(b ? 'b' : 'span', { class: 'w', text: tok, style: 'display:inline-block;opacity:0' });
      bub.append(s); words.push(s);
    });
  });
  const aiAv = h('div', { class: 'c-av s', html: icon('sparkle', 34, { filled: true }) });
  const ai = h('div', { class: 'u c-ai', style: 'width:928px' }, aiAv, bub);
  const aiO = put(ai, 36, 508, 44);

  // recommendations
  const label = h('div', { class: 'u c-label', style: 'display:flex;align-items:center;gap:12px;font-size:30px', html: icon('sparkle', 30, { filled: true, color: '#2E6B3C' }) + '<span>Rekomendasi Produk</span>' });
  const labO = put(label, 40, 820, 44);
  const mkRec = (a, name, price, bg) => {
    const plus = h('div', { class: 'u-plus', style: 'margin-left:auto;flex:none', html: icon('plus', 40, { sw: 2.6 }) });
    const e = h('div', { class: 'u c-rec', style: 'width:928px;background:#fff' },
      h('div', { class: 'th2', style: `background:${bg}`, html: a }),
      h('div', {}, h('div', { class: 'nm', text: name }), h('div', { class: 'pc', text: price })), plus);
    return { e, plus };
  };
  const r1 = mkRec(art.sack({ title: 'NPK', sub: '16-16-16', w: 76, color: '#2D7E3B', tone: '#F1ECD9', kg: '1 KG' }), 'Pupuk NPK 16-16-16', 'Rp 38.000 · 1 kg', '#EFEBDD');
  const r2 = mkRec(art.bottle({ title: 'NEEM', w: 54, color: '#2F8F46' }), 'Insektisida Nabati Neem', 'Rp 45.000 · 500 ml', '#E8F1E2');
  const r1O = put(r1.e, 36, 876, 50);
  const r2O = put(r2.e, 36, 1046, 50);

  // touch + sparkles
  const touch = h('div', { class: 'p3 touch', style: 'left:0;top:0' });
  world.append(touch);
  const rip = h('div', { class: 'p3 tap-rip', style: 'left:0;top:0' });
  world.append(rip);
  const spark = Array.from({ length: 12 }, (_, i) => { const d = h('div', { class: 'p3 burst', style: 'left:0;top:0', html: icon(i % 2 ? 'sparkle' : 'leaf', 34, { filled: true, color: i % 2 ? '#C8FFB8' : '#7FDB72' }) }); world.append(d); return d; });

  const dim = h('div', { class: 'fill', style: 'background:#021009;opacity:0;pointer-events:none' });
  const ring = h('div', { class: 's3-iris' });

  clip.append(bg, cam, tag, head.el, dim);
  el.append(clip, ring);
  root.append(el);

  const R = rng(9);
  const sparkAng = spark.map(() => R() * 6.283), sparkD = spark.map(() => 120 + R() * 160);

  function update(t, tAbs) {
    // ---------- iris open from the previous scene
    const ir = tw(t, 0, 0.7, E.inOutSoft);
    const rad = ir * 1500;
    clip.style.clipPath = ir >= 1 ? 'none' : `circle(${rad.toFixed(1)}px at ${IRIS.x}px ${IRIS.y}px)`;
    if (ir > 0 && ir < 1) {
      ring.style.display = 'block';
      ring.style.left = `${IRIS.x - rad}px`; ring.style.top = `${IRIS.y - rad}px`; ring.style.width = `${rad * 2}px`; ring.style.height = `${rad * 2}px`;
      ring.style.opacity = String(1 - ir * ir);
    } else ring.style.display = 'none';

    // ---------- atmosphere (shared contour system, dark variant)
    bgs.update(tAbs, { lines: 1 });

    // ---------- type
    T(tag, { y: (1 - tw(t, 0.45, 0.8)) * -30, o: tw(t, 0.45, 0.5, E.lin) * (1 - pr(t, 7.4, 0.3)) });
    head.set(t, 0.5, 7.3, E);

    // ---------- camera
    const settle = tw(t, 0.3, 1.7, E.apple);
    const orbit = tw(t, 0.5, 4.5, E.inOutSoft);
    const exit = tw(t, 7.45, 1.1, E.inOut);
    world.style.transformOrigin = '540px 1150px';
    world.style.transform = `translate3d(0,${-exit * 40}px,${lerp(-260, 30, settle) + pr(t, 4.0, 3.4) * 24 - exit * 380}px) rotateX(${lerp(10, 0, orbit) - exit * 8}deg) rotateY(${lerp(18, -3, orbit) + Math.sin(t * 0.7) * 1.2 * orbit + exit * 22}deg)`;
    dim.style.opacity = String(0.6 * exit);

    // ---------- panel entrance
    {
      const p = E.apple(clamp((t - 0.45) / 1.1)), q = 1 - p;
      T(panel, { x: PX, y: PY + 900 * q, z: -700 * q, rx: 38 * q, rz: -4 * q, o: clamp((t - 0.45) / 0.2) });
    }
    const part = (o, t0, d = 0.9, from = {}) => {
      const p = E.apple(clamp((t - t0) / d)), q = 1 - p, sp = E.springSoft(clamp((t - t0) / (d * 0.9)));
      return { x: o.x + (from.dx || 0) * q, y: o.y + (from.dy || 0) * q, z: o.z + (from.dz || 0) * q, rx: (from.rx || 0) * q, ry: (from.ry || 0) * q, rz: (from.rz || 0) * q, s: lerp(from.s0 ?? 1, 1, sp), o: clamp((t - t0) / 0.2) };
    };
    // header status
    stat.innerHTML = (t > 3.2 && t < 4.0) ? '<span style="color:#2E6B3C;font-weight:600">Sedang berpikir…</span>' : (t >= 4.0 && t < 5.8 ? '<span style="color:#2E6B3C;font-weight:600">Sedang menjawab…</span>' : '<i style="display:inline-block;width:14px;height:14px;border-radius:7px;background:#25D26B;margin-right:10px"></i>Online · Asisten AI Petani');

    // WA card
    T(wa, part(waO, 1.0, 0.9, { dy: 140, dz: -200, rx: 20 }));
    const waPulse = pulse(t, 7.0, 0.5);
    wa.querySelector('.go').style.transform = `scale(${1 + waPulse * 0.12})`;

    // ---------- composer: typing -> send
    const n = Math.floor(clamp((t - 1.3) / 0.03, 0, MSG.length));
    const sent = t >= 2.55;
    typed.textContent = sent ? '' : MSG.slice(0, n);
    ph.style.display = (n > 0 || sent) && !sent ? 'none' : (sent ? '' : '');
    ph.style.display = (!sent && n > 0) ? 'none' : '';
    caret.style.display = (!sent && n > 0 && Math.floor(t * 3) % 2 === 0) || (!sent && n > 0 && n < MSG.length) ? 'inline-block' : 'none';
    const pressSend = pulse(t, 2.5, 0.22);
    sendBtn.style.transform = `scale(${1 - pressSend * 0.2})`;
    T(input, part(inO, 0.95, 0.9, { dy: 160, dz: -200, rx: 20 }));

    // ---------- user bubble flies up out of the composer
    {
      const t0 = 2.55, p = E.apple(clamp((t - t0) / 0.8)), q = 1 - p;
      const sp = E.springSoft(clamp((t - t0) / 0.8));
      T(userB, { x: userO.x, y: userO.y + (1244 - 336) * q * 0.97, z: userO.z - 20 * q, s: lerp(0.62, 1, sp), o: clamp((t - t0) / 0.08), rz: -2 * q });
    }

    // ---------- thinking
    {
      const on = t >= 3.25 && t < 4.0;
      dotsI.forEach((d, i) => { d.style.transform = `translateY(${(-12 * Math.max(0, Math.sin(t * 9 - i * 0.9))).toFixed(2)}px)`; d.style.opacity = String(0.45 + 0.55 * Math.max(0, Math.sin(t * 9 - i * 0.9))); });
      const p = E.springSoft(clamp((t - 3.25) / 0.5));
      const out = pr(t, 3.9, 0.12);
      T(think, { x: thinkO.x, y: thinkO.y, z: thinkO.z, s: lerp(0.7, 1, p), o: on ? clamp((t - 3.25) / 0.12) * (1 - out) : 0 });
    }

    // ---------- AI answer
    {
      const t0 = 4.0, p = E.springSoft(clamp((t - t0) / 0.7));
      const on = t >= t0;
      T(ai, { x: aiO.x, y: aiO.y + (1 - E.apple(clamp((t - t0) / 0.6))) * 24, z: aiO.z + 18 * pulse(t, 4.0, 1.0), s: lerp(0.9, 1, p), o: on ? clamp((t - t0) / 0.15) : 0 });
      ai.style.transformOrigin = '0 0';
      words.forEach((w, i) => {
        const q = E.apple(pr(t, 4.15 + i * 0.075, 0.5));
        w.style.opacity = String(q);
        w.style.transform = q >= 1 ? '' : `translateY(${((1 - q) * 14).toFixed(1)}px)`;
        w.style.filter = q >= 1 ? '' : `blur(${((1 - q) * 5).toFixed(1)}px)`;
      });
      aiAv.style.boxShadow = `0 0 0 ${8 * pulse(t, 4.0, 0.9)}px rgba(46,107,60,.25)`;
    }

    // ---------- recommendations float out of the panel
    T(label, part(labO, 5.85, 0.7, { dx: -60, dy: 20 }));
    const recFx = (o, t0, rec, tapAt) => {
      const d = 1.0, p = E.apple(clamp((t - t0) / d)), q = 1 - p, sp = E.springSoft(clamp((t - t0) / 0.9));
      const float = E.apple(clamp((t - t0 - 0.2) / 1.0));
      const base = part(o, t0, d, { dy: 60, dz: -120, rx: 18 });
      base.z = o.z + 70 * float + 12 * Math.sin(t * 1.7 + o.y) * float;
      base.s = lerp(0.9, 1.0, sp) * (1 + 0.02 * float);
      return base;
    };
    const rf1 = recFx(r1O, 5.95, r1), rf2 = recFx(r2O, 6.25, r2);
    T(r1.e, rf1); T(r2.e, rf2);
    r1.e.style.boxShadow = `0 ${20 + 30 * pr(t, 6.0, 1)}px ${50 + 40 * pr(t, 6.0, 1)}px rgba(5,40,20,${0.12 + 0.12 * pr(t, 6.0, 1)})`;
    r2.e.style.boxShadow = `0 ${20 + 30 * pr(t, 6.3, 1)}px ${50 + 40 * pr(t, 6.3, 1)}px rgba(5,40,20,${0.12 + 0.12 * pr(t, 6.3, 1)})`;
    // tap "+" on card 1 -> check
    const added = t > 6.92;
    r1.plus.innerHTML = added ? icon('check', 40, { sw: 3 }) : icon('plus', 40, { sw: 2.6 });
    r1.plus.style.transform = `scale(${1 - 0.25 * pulse(t, 6.9, 0.28) + (added ? 0.12 * pulse(t, 6.95, 0.4) : 0)})`;
    r1.plus.style.background = added ? '#1FA55A' : '';

    // ---------- touch indicator
    const sendPos = [PX + 36 + 928 - 54, PY + 1244 + 54];
    const recPos = [PX + 36 + 928 - 30 - 37, PY + 876 + 76];
    const t1 = clamp(pr(t, 2.05, 0.35));
    const t2 = clamp(pr(t, 6.45, 0.35));
    const touch1 = t1 > 0 && t < 3.0;
    const touch2 = t2 > 0 && t < 7.4;
    touch.style.display = touch1 || touch2 ? 'block' : 'none';
    if (touch1) {
      const pp = pulse(t, 2.5, 0.22);
      T(touch, { x: sendPos[0] - 48 + (1 - E.apple(t1)) * 120, y: sendPos[1] - 48 + (1 - E.apple(t1)) * 140, z: 260, s: (1 - pp * 0.28) * E.springSoft(t1), o: clamp(t1 * 3) * (1 - pr(t, 2.75, 0.2)) });
    } else if (touch2) {
      const pp = pulse(t, 6.9, 0.25);
      const base = r1O.z + 70;
      T(touch, { x: recPos[0] - 48 + (1 - E.apple(t2)) * 100, y: recPos[1] - 48 + (1 - E.apple(t2)) * 170, z: base + 190, s: (1 - pp * 0.28) * E.springSoft(t2), o: clamp(t2 * 3) * (1 - pr(t, 7.15, 0.2)) });
    }
    {
      const a = pr(t, 2.5, 0.5), b = pr(t, 6.9, 0.5);
      if (a > 0 && a < 1) T(rip, { x: sendPos[0] - 60, y: sendPos[1] - 60, z: 255, s: lerp(0.3, 1.8, E.expoOut(a)), o: (1 - a) * 0.7 });
      else if (b > 0 && b < 1) T(rip, { x: recPos[0] - 60, y: recPos[1] - 60, z: r1O.z + 250, s: lerp(0.3, 1.8, E.expoOut(b)), o: (1 - b) * 0.7 });
      else T(rip, { o: 0 });
    }

    // ---------- sparkles from the AI avatar
    spark.forEach((s, i) => {
      const p = pr(t, 4.0 + i * 0.012, 1.0);
      const d = sparkD[i] * E.expoOut(p);
      T(s, { x: PX + 36 + 33 + Math.cos(sparkAng[i]) * d - 17, y: PY + 508 + 33 + Math.sin(sparkAng[i]) * d * 0.8 - 17 - p * 30, z: 120, rz: p * 200, s: (1 - p) * (0.7 + (i % 3) * 0.3), o: p > 0 && p < 1 ? 1 : 0 });
    });
  }
  return { el, update, dur: DUR };
}
