// Hand-built vector icon set (24px grid) approximating the app's Material-style icons.
// Every icon is built from primitives so it can be re-colored / animated freely.
const S = (d) => d; // marker for outline-only path data

const OUT = {
  home: `<path d="M3.5 11.2 12 4l8.5 7.2"/><path d="M5.6 9.6V20h4.4v-5.6h4V20h4.4V9.6"/>`,
  leaf: `<path d="M5 19.2C4.2 10.8 9.2 5.2 19.6 4.4c.3 9.4-4.6 15-12.6 15z"/><path d="M5 19.2c3-4.6 6.4-8 10.4-10.6"/>`,
  chat: `<path d="M4 5.2A1.7 1.7 0 0 1 5.7 3.5H15a1.7 1.7 0 0 1 1.7 1.7v6.1A1.7 1.7 0 0 1 15 13H9.2L6 16v-3H5.7A1.7 1.7 0 0 1 4 11.3z"/><path d="M19.2 8.2h.1a1.7 1.7 0 0 1 1.7 1.7v8.6l-3-2.8h-6.2a1.7 1.7 0 0 1-1.7-1.7v-.6"/>`,
  cap: `<path d="m12 4-9.5 4.8L12 13.6l9.5-4.8z"/><path d="M6 11.4v4.6c0 1.3 2.7 2.7 6 2.7s6-1.4 6-2.7v-4.6"/><path d="M21.5 8.8v5.2"/>`,
  person: `<circle cx="12" cy="8" r="3.8"/><path d="M4.2 20.2c0-3.9 3.5-6 7.8-6s7.8 2.1 7.8 6"/>`,
  search: `<circle cx="10.5" cy="10.5" r="6.3"/><path d="m15.4 15.4 5.3 5.3"/>`,
  bell: `<path d="M6 17.2v-6a6 6 0 0 1 12 0v6l1.6 2H4.4z"/><path d="M10 21.4a2 2 0 0 0 4 0"/>`,
  cart: `<path d="M2.8 3.8h2.6l2.2 10.6h10.4L20.4 7H6.2"/><circle cx="9.2" cy="19" r="1.5"/><circle cx="17" cy="19" r="1.5"/>`,
  send: `<path d="M3 20.4 21.4 12 3 3.6v6.4L14.6 12 3 14z"/>`,
  check: `<path d="m5 12.6 4.6 4.6L19.2 7.4"/>`,
  checkCircle: `<circle cx="12" cy="12" r="9.2"/><path d="m7.8 12.4 3 3 5.6-6"/>`,
  calendar: `<rect x="3.8" y="5.2" width="16.4" height="15" rx="2.2"/><path d="M3.8 10h16.4M8 3.2v4M16 3.2v4"/>`,
  ruler: `<path d="M4 20V4l16 16z"/><path d="M4 14h3M4 9h2M10 20v-3M15 20v-2"/>`,
  flask: `<path d="M9.4 3.2h5.2M10.4 3.2v5.6L4.8 18.6a1.9 1.9 0 0 0 1.7 2.8h11a1.9 1.9 0 0 0 1.7-2.8l-5.6-9.8V3.2"/><path d="M7.4 15h9.2"/>`,
  repeat: `<path d="m17 2.8 3.2 3.2L17 9.2"/><path d="M20 6H8.2A4.2 4.2 0 0 0 4 10.2v.8"/><path d="m7 21.2-3.2-3.2L7 14.8"/><path d="M4 18h11.8a4.2 4.2 0 0 0 4.2-4.2V13"/>`,
  table: `<rect x="3.6" y="3.6" width="16.8" height="16.8" rx="1.6"/><path d="M3.6 9.2h16.8M3.6 14.8h16.8M9.2 3.6v16.8M14.8 3.6v16.8"/>`,
  book: `<path d="M2.8 5.2C5.4 4 8.6 4.2 12 6.4c3.4-2.2 6.6-2.4 9.2-1.2v13.2c-2.6-1.2-5.8-1-9.2 1.2-3.4-2.2-6.6-2.4-9.2-1.2z"/><path d="M12 6.4v13.4"/>`,
  info: `<circle cx="12" cy="12" r="9.2"/><path d="M12 11v5.6"/><circle cx="12" cy="7.8" r=".6"/>`,
  headset: `<path d="M4.6 13.4v-1.2a7.4 7.4 0 0 1 14.8 0v1.2"/><rect x="3" y="12.6" width="3.8" height="6" rx="1.6"/><rect x="17.2" y="12.6" width="3.8" height="6" rx="1.6"/><path d="M19.2 18.8c0 1.8-1.6 2.8-4.4 2.8"/>`,
  refresh: `<path d="M20.2 12a8.2 8.2 0 1 1-2.5-5.9"/><path d="M20.4 3.6v5.2h-5.2"/>`,
  chevR: `<path d="m9 5 7 7-7 7"/>`,
  chevD: `<path d="m5.2 9 6.8 6.8L18.8 9"/>`,
  back: `<path d="m15 5-7 7 7 7"/>`,
  plus: `<path d="M12 5v14M5 12h14"/>`,
  clock: `<circle cx="12" cy="12" r="9"/><path d="M12 7v5.2l3.2 1.8"/>`,
  grass: `<path d="M12 21V8.5M12 21c0-5-3-7.5-6.4-8.4M12 21c0-5 3-7.5 6.4-8.4M12 21c-.2-3-1.6-4.6-3.6-5.6M12 21c.2-3 1.6-4.6 3.6-5.6"/>`,
  tools: `<path d="M4.4 19.6 14.4 9.6"/><path d="m13.2 4.8 6 6-2.2 2.2-6-6z"/><path d="M19.6 19.6 9.6 9.6"/><circle cx="6.8" cy="6.8" r="3"/>`,
  cloud: `<path d="M7 19.4h10.2a4.1 4.1 0 0 0 .6-8.2A5.6 5.6 0 0 0 7.1 12.4 3.6 3.6 0 0 0 7 19.4z"/>`,
  shield: `<path d="M12 3 5 5.8v5.6c0 4.6 3 8 7 9.6 4-1.6 7-5 7-9.6V5.8z"/><path d="m8.8 12 2.4 2.4 4-4.4"/>`,
  tag: `<path d="M3.5 12.4V4.8a1.3 1.3 0 0 1 1.3-1.3h7.6l8.1 8.1a1.3 1.3 0 0 1 0 1.8l-6.5 6.5a1.3 1.3 0 0 1-1.8 0z"/><circle cx="8" cy="8" r="1.3"/>`,
};

// Filled variants (used for active nav states, FABs, etc.)
const FILL = {
  home: `<path d="M12 3 2.4 11.3h2.8V20.4h4.6v-5.9h4.4v5.9h4.6v-9.1h2.8z"/>`,
  leaf: `<path d="M5 19.4C4 10.4 9.4 4.6 20 4.2c.4 9.8-4.8 15.6-13 15.6z"/><path d="M5 19.4c3-4.8 6.4-8.2 10.6-10.8" fill="none" stroke="var(--cut,#fff)" stroke-width="1.6" stroke-linecap="round"/>`,
  chat: `<path d="M4 5.2A1.7 1.7 0 0 1 5.7 3.5H15a1.7 1.7 0 0 1 1.7 1.7v6.1A1.7 1.7 0 0 1 15 13H9.2L6 16.2V13h-.3A1.7 1.7 0 0 1 4 11.3z"/><path d="M19.2 7.6h.1A1.7 1.7 0 0 1 21 9.3v9.2l-3.2-3h-6.1A1.7 1.7 0 0 1 10 13.8v-.3h6.9a2.4 2.4 0 0 0 2.3-2.4z"/>`,
  cap: `<path d="m12 3.6-10 5 10 5 10-5z"/><path d="M5.8 12.2v4.4c0 1.5 2.8 3 6.2 3s6.2-1.5 6.2-3v-4.4L12 15.4z"/><rect x="21" y="8.8" width="1.6" height="5.6" rx=".8"/>`,
  person: `<circle cx="12" cy="7.8" r="4.2"/><path d="M3.8 20.6c0-4.2 3.6-6.4 8.2-6.4s8.2 2.2 8.2 6.4z"/>`,
  grid: `<rect x="3.6" y="3.6" width="7.4" height="7.4" rx="2"/><rect x="13" y="3.6" width="7.4" height="7.4" rx="2"/><rect x="3.6" y="13" width="7.4" height="7.4" rx="2"/><rect x="13" y="13" width="7.4" height="7.4" rx="2"/>`,
  drop: `<path d="M12 2.8c4.2 5 6.8 8.2 6.8 11.8a6.8 6.8 0 0 1-13.6 0C5.2 11 7.8 7.8 12 2.8z"/>`,
  sprout: `<path d="M12.6 21v-8.4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M12.6 13.2C6.6 13.4 4 10 3.8 5.2c5.8.2 8.6 3.2 8.8 8z"/><path d="M12.6 11.4c0-4.6 2.8-7 8-7.2 0 4.8-2.8 7.2-8 7.2z"/>`,
  send: `<path d="M2.6 20.8 22 12 2.6 3.2l-.1 6.8L14.6 12 2.5 14z"/>`,
  flask: `<path d="M9 2.8h6v1.6h-1.2v4.5l5.6 9.7a2.2 2.2 0 0 1-1.9 3.3H6.5a2.2 2.2 0 0 1-1.9-3.3l5.6-9.7V4.4H9z"/><path d="M7.6 15.6h8.8" fill="none" stroke="var(--cut,#fff)" stroke-width="1.5" stroke-linecap="round"/>`,
  checkCircle: `<circle cx="12" cy="12" r="10"/><path d="m7.6 12.4 3.2 3.2 5.8-6.4" fill="none" stroke="var(--cut,#fff)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
  shapes: `<path d="M12 3.2 16.4 10H7.6z"/><circle cx="7.4" cy="16.8" r="3.6"/><rect x="13.2" y="13.2" width="7.2" height="7.2" rx="1.4"/>`,
  headsetSolid: `<circle cx="12" cy="12" r="10"/>`,
  star: `<path d="m12 3 2.7 5.8 6.3.7-4.7 4.3 1.3 6.2L12 16.8 6.4 20l1.3-6.2L3 9.5l6.3-.7z"/>`,
  sparkle: `<path d="M12 2c.8 5.2 2.8 7.2 8 8-5.2.8-7.2 2.8-8 8-.8-5.2-2.8-7.2-8-8 5.2-.8 7.2-2.8 8-8z"/>`,
  sun: `<circle cx="12" cy="12" r="4.6"/>`,
  bolt: `<path d="M13.4 2.5 5.2 13.4h5.4l-1 8.1 8.2-11h-5.4z"/>`,
  coin: `<circle cx="12" cy="12" r="9.5"/>`,
  basket: `<path d="M3 9.5h18l-1.8 9.2a1.6 1.6 0 0 1-1.6 1.3H6.4a1.6 1.6 0 0 1-1.6-1.3z"/><path d="M8 9.5 11 3.5M16 9.5 13 3.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>`,
};

export function icon(name, size = 24, o = {}) {
  const filled = o.filled && FILL[name];
  const body = filled ? FILL[name] : (OUT[name] || FILL[name] || '');
  const isFill = filled || (!OUT[name] && FILL[name]);
  const color = o.color || 'currentColor';
  const sw = o.sw ?? 1.9;
  const attrs = isFill
    ? `fill="${color}" stroke="none"`
    : `fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"`;
  const cut = o.cut ? `style="--cut:${o.cut}"` : '';
  return `<svg class="ic" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${size}" height="${size}" ${attrs} ${cut}>${body}</svg>`;
}
