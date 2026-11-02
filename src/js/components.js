// Reusable app UI components, rebuilt from scratch as DOM (so each part can be animated independently).
import { h } from './engine.js';
import { icon } from './icons.js';
import * as art from './art.js';

export function greeting() {
  return h('div', { class: 'u u-greet' }, h('h1', { text: 'Halo, Petani!' }), h('p', { text: 'Mau rawat tanaman apa hari ini?' }));
}
export function bellBtn() { return h('div', { class: 'u u-circ', html: icon('bell', 44, { sw: 1.8 }) }); }
export function cartBtn(count = null) {
  const badge = h('div', { class: 'u-badge', text: String(count ?? 0) });
  const el = h('div', { class: 'u u-circ brand', html: icon('cart', 46, { sw: 1.8 }) }, badge);
  return { el, badge };
}
export function weather() {
  return h('div', { class: 'u u-weather', html: `<svg class="ic" viewBox="0 0 24 24" width="38" height="38"><circle cx="9" cy="9" r="4.2" fill="#FFC53D"/><path d="M7 20h10.2a3.9 3.9 0 0 0 .5-7.8A5.4 5.4 0 0 0 7.3 13.4 3.3 3.3 0 0 0 7 20z" fill="#DDE6EA"/></svg>Serang <b>30°C</b>` });
}
export function searchBar(text = 'Cari') {
  const label = h('span', { class: 'lbl', text });
  const el = h('div', { class: 'u u-search', html: icon('search', 46, { sw: 2 }) }, label);
  return { el, label };
}
export function banner() {
  const bg = h('div', { class: 'bg', html: art.fieldBg() });
  const bags = h('div', { class: 'art', style: 'right:10px;top:40px;width:440px;height:290px' },
    h('div', { style: 'position:absolute;left:70px;top:-4px;transform:rotate(-4deg)', html: art.sack({ title: 'PUPUK ORGANIK', sub: 'Untuk Tanaman Sehat dan Subur', w: 190, color: '#3E8E3F', kg: '5 KG' }) }),
    h('div', { style: 'position:absolute;left:250px;top:6px;transform:rotate(5deg)', html: art.sack({ title: 'PUPUK NPK', sub: '16-16-16', w: 170, color: '#2D7E3B', tone: '#F1ECD9', kg: '1 KG' }) }),
    h('div', { style: 'position:absolute;left:196px;top:84px;z-index:2', html: art.bottle({ w: 104 }) }),
  );
  const copy = h('div', { class: 'copy' },
    h('span', { class: 'u-pill-s', html: icon('leaf', 22, { filled: true, color: '#2E6B3C', cut: '#D4F0CC' }) + 'Untuk Petani, Oleh Petani' }),
    h('h2', { html: 'Solusi Tepat<br><span>Hasil Panen Hebat</span>' }),
    h('p', { text: 'Dapatkan pupuk berkualitas dengan harga terbaik untuk hasil panen maksimal.' }),
  );
  const shine = h('div', { class: 'shine', style: 'position:absolute;top:-20%;bottom:-20%;width:160px;left:-200px;background:linear-gradient(100deg,transparent,rgba(255,255,255,.55),transparent);transform:skewX(-18deg);mix-blend-mode:soft-light' });
  const el = h('div', { class: 'u u-banner' }, bg, h('div', { class: 'shade' }), bags, copy,
    h('div', { class: 'disc', text: 'Diskon Launch 30%' }),
    h('div', { class: 'ribbon', text: '30%' }),
    h('div', { class: 'choose', html: icon('sparkle', 24, { color: '#2E6B3C' }) + 'Pilih Petani<br>Cerdas' }),
    shine);
  return { el, shine, bags };
}
export function dots() { return h('div', { class: 'u u-dots' }, h('i', { class: 'on' }), h('i')); }

export const CATS = [
  { n: 'Semua', i: 'grid', f: true }, { n: 'AB Mix', i: 'drop', f: true }, { n: 'Benih', i: 'sprout', f: true },
  { n: 'Media Tanam', i: 'grass' }, { n: 'Peralatan Tani', i: 'tools' }, { n: 'Pupuk', i: 'sprout', f: true },
];
export function catItem(c, on = false) {
  return h('div', { class: 'u u-cat' + (on ? ' on' : '') }, h('div', { class: 'c', html: icon(c.i, 54, { filled: c.f, sw: 1.9 }) }), h('span', { html: c.n.replace(' ', '<br>') }));
}

export function prodCard({ title, price, unit, art: a, bg = '#F2EADF', ribbon = false, official = false }) {
  const plus = h('div', { class: 'u-plus', html: icon('plus', 40, { sw: 2.6 }) });
  const el = h('div', { class: 'u u-prod' },
    h('div', { class: 'im', style: `background:${bg}`, html: a }),
    ribbon ? h('div', { class: 'u-ribbon', html: 'Rekomendasi<br>Petani' }) : null,
    official ? h('div', { class: 'u-off', html: icon('shield', 20, { color: '#D62B2B' }) + 'Official Store' }) : null,
    h('div', { class: 'tt', text: title }),
    h('div', { class: 'pr' }, h('div', {}, h('span', { text: price }), h('small', { text: unit })), plus));
  return { el, plus };
}

export function nav(active = 'home') {
  const it = (k, ic, label) => h('div', { class: 'it' + (active === k ? ' on' : ''), html: icon(ic, 46, { filled: active === k, sw: 1.8 }) + `<span>${label}</span>` });
  const fab = h('div', { class: 'fab' + (active === 'ai' ? ' on' : '') }, h('div', { class: 'b', html: icon('chat', 56, { filled: true }) }), h('span', { text: 'Tanya Tani' }));
  return h('div', { class: 'u u-nav' }, it('home', 'home', 'Beranda'), it('pupuk', 'leaf', 'Pupuk'), fab, it('edu', 'cap', 'Edukasi'), it('profil', 'person', 'Profil'));
}

// Kinetic headline: lines of words, each word rises through a mask. Returns {el, set(t, tin, tout)}
export function kinetic(lines, { x = 72, y = 160, size = 150, lh = 1.0, weight = 800, color = '#0E2A1A', accent = '#2E8B43', stag = 0.075, font = "'NS'", track = '-0.035em' } = {}) {
  const el = h('div', { class: 'abs', style: `left:${x}px;top:${y}px;font-family:${font};font-size:${size}px;line-height:${lh};font-weight:${weight};letter-spacing:${track};color:${color}` });
  const words = [];
  lines.forEach((ln, li) => {
    const mask = h('div', { class: 'mask', style: `padding:${size * 0.06}px ${size * 0.04}px ${size * 0.16}px;margin:-${size * 0.06}px -${size * 0.04}px -${size * 0.16}px` });
    const row = h('div', { class: 'line' });
    ln.text.split(' ').forEach((w, wi, arr) => {
      const s = h('span', { text: w, style: `display:inline-block;will-change:transform;${ln.accent ? `color:${ln.color || accent};` : ''}` });
      row.append(s); if (wi < arr.length - 1) row.append(document.createTextNode(' '));
      words.push({ s, li });
    });
    mask.append(row); el.append(mask);
  });
  return {
    el, words,
    set(t, tin, tout = 1e9, ease) {
      const E = ease;
      words.forEach((w, i) => {
        const pin = E.apple(Math.min(1, Math.max(0, (t - tin - i * 0.075) / 0.9)));
        const pout = E.inOut(Math.min(1, Math.max(0, (t - tout - i * 0.04) / 0.55)));
        const y = (1 - pin) * 112 - pout * 112;
        w.s.style.transform = `translateY(${y}%) rotate(${(1 - pin) * 4}deg)`;
        w.s.style.opacity = (t < tin - 0.01 || pout >= 1) ? '0' : '1';
      });
    },
  };
}
