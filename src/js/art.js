// Vector illustrations that stand in for the app's product photography (all drawn from scratch).
let uid = 0;
const id = (p) => `${p}${++uid}`;
const FONT = `font-family="NS, Noto Sans, sans-serif"`;

// Fertilizer sack. kind: 'organik' | 'npk' | 'plain'
export function sack({ title = 'PUPUK', sub = '', w = 200, color = '#2E7D32', tone = '#F4EEDC', kg = '' } = {}) {
  const g = id('sg'), s = id('ss');
  return `<svg viewBox="0 0 200 260" width="${w}" height="${w * 1.3}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="${g}" x1="0" x2="1"><stop offset="0" stop-color="${tone}"/><stop offset=".55" stop-color="#fff"/><stop offset="1" stop-color="${tone}" stop-opacity=".92"/></linearGradient>
    <linearGradient id="${s}" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".18"/><stop offset=".3" stop-color="#000" stop-opacity="0"/><stop offset=".75" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></linearGradient>
  </defs>
  <ellipse cx="100" cy="252" rx="86" ry="8" fill="#000" opacity=".18"/>
  <path d="M16 36Q100 14 184 36L194 236Q100 258 6 236Z" fill="url(#${g})"/>
  <path d="M16 36Q100 14 184 36L182 58Q100 40 18 58Z" fill="${tone}" stroke="#00000014"/>
  <path d="M18 58Q100 40 182 58" fill="none" stroke="#00000022" stroke-width="2" stroke-dasharray="3 4"/>
  <rect x="30" y="76" width="140" height="134" rx="14" fill="${color}"/>
  <path d="M30 138H170" stroke="#fff" stroke-opacity=".25"/>
  <circle cx="54" cy="98" r="11" fill="#fff"/><path d="M49 103c0-7 4-10 11-11 0 7-3 10-9 11z" fill="${color}"/>
  <text x="72" y="103" ${FONT} font-size="11" font-weight="700" fill="#fff" opacity=".9">Umah Tani</text>
  <text x="100" y="152" ${FONT} font-size="${title.length > 9 ? 17 : 21}" font-weight="900" fill="#fff" text-anchor="middle">${title}</text>
  <text x="100" y="172" ${FONT} font-size="11" font-weight="600" fill="#fff" text-anchor="middle" opacity=".9">${sub}</text>
  <rect x="62" y="184" width="76" height="16" rx="8" fill="#fff" opacity=".92"/>
  <text x="100" y="196" ${FONT} font-size="10" font-weight="800" fill="${color}" text-anchor="middle">${kg}</text>
  <path d="M16 36Q100 14 184 36L194 236Q100 258 6 236Z" fill="url(#${s})"/>
  </svg>`;
}

export function bottle({ title = 'PUPUK CAIR', w = 110, color = '#2F8F46' } = {}) {
  const g = id('bg');
  return `<svg viewBox="0 0 110 220" width="${w}" height="${w * 2}" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="${g}" x1="0" x2="1"><stop offset="0" stop-color="${color}"/><stop offset=".4" stop-color="#6CC77F"/><stop offset="1" stop-color="${color}"/></linearGradient></defs>
  <ellipse cx="55" cy="212" rx="46" ry="6" fill="#000" opacity=".22"/>
  <rect x="38" y="4" width="34" height="24" rx="6" fill="#1D5E2E"/>
  <path d="M40 28h30l2 14c20 6 30 18 30 36v120a12 12 0 0 1-12 12H20a12 12 0 0 1-12-12V78c0-18 10-30 30-36z" fill="url(#${g})"/>
  <rect x="12" y="92" width="86" height="88" rx="8" fill="#fff"/>
  <rect x="12" y="92" width="86" height="22" rx="8" fill="#1D5E2E"/>
  <text x="55" y="107" ${FONT} font-size="11" font-weight="800" fill="#fff" text-anchor="middle">${title}</text>
  <text x="55" y="137" ${FONT} font-size="9" font-weight="600" fill="#2E6B3C" text-anchor="middle">Untuk Tanaman</text>
  <text x="55" y="149" ${FONT} font-size="9" font-weight="600" fill="#2E6B3C" text-anchor="middle">Sehat &amp; Subur</text>
  <circle cx="55" cy="167" r="6" fill="#58AE50"/>
  <path d="M10 60c14-8 14-8 24-10" stroke="#fff" stroke-opacity=".45" stroke-width="4" fill="none" stroke-linecap="round"/>
  </svg>`;
}

const chili = (x, y, r, s = 1) => `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})">
  <path d="M0 0C14 4 20 38 8 82C4 92 -2 92 -4 84C-8 56 -12 14 0 0Z" fill="#D8262B"/>
  <path d="M2 6C10 12 12 40 5 70" stroke="#FF7A6E" stroke-opacity=".75" stroke-width="3" fill="none" stroke-linecap="round"/>
  <path d="M-6 2c2-8 8-10 12-10 0 6-2 9-6 12z" fill="#2F7D32"/></g>`;

export function seedPacket({ w = 230 } = {}) {
  const g = id('pk');
  return `<svg viewBox="0 0 230 330" width="${w}" height="${w * 330 / 230}" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="${g}" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#8CCB4B"/><stop offset="1" stop-color="#4E9E2B"/></linearGradient></defs>
  <ellipse cx="115" cy="322" rx="92" ry="7" fill="#000" opacity=".2"/>
  <path d="M10 10h210v300H10z" fill="url(#${g})"/>
  <path d="M10 10h210v14H10zM10 296h210v14H10z" fill="#000" opacity=".12"/>
  <path d="M10 18h210M10 302h210" stroke="#fff" stroke-opacity=".35" stroke-dasharray="2 3"/>
  <rect x="26" y="34" width="178" height="30" rx="4" fill="#fff"/>
  <text x="115" y="55" ${FONT} font-size="15" font-weight="900" fill="#2E6B3C" text-anchor="middle">BENIH CABAI</text>
  <rect x="34" y="76" width="162" height="150" rx="6" fill="#E9F3D6" stroke="#fff" stroke-width="5"/>
  <path d="M34 150c30-30 60-20 90-6s52 6 72-10v92H34z" fill="#8FC45A" opacity=".6"/>
  ${chili(80, 92, -10, 1)}${chili(118, 86, 6, 1.1)}${chili(156, 94, 20, 0.95)}${chili(100, 120, -24, 0.7)}
  <rect x="26" y="238" width="178" height="30" rx="4" fill="#E3262B"/>
  <text x="115" y="259" ${FONT} font-size="17" font-weight="900" fill="#fff" text-anchor="middle">TANGGUH F1</text>
  <text x="115" y="287" ${FONT} font-size="11" font-weight="700" fill="#fff" text-anchor="middle">Merah Keriting · Hibrida</text>
  <path d="M10 10h210v300H10z" fill="none" stroke="#000" stroke-opacity=".12"/>
  </svg>`;
}

export function parcel({ w = 300 } = {}) {
  const dots = [];
  for (let r = 0; r < 7; r++) for (let c = 0; c < 9; c++) dots.push(`<circle cx="${40 + c * 22 + (r % 2) * 11}" cy="${58 + r * 22}" r="8.5" fill="#fff" fill-opacity=".16" stroke="#00000018"/>`);
  return `<svg viewBox="0 0 300 260" width="${w}" height="${w * 260 / 300}" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="150" cy="238" rx="124" ry="12" fill="#000" opacity=".2"/>
  <path d="M30 70 160 30 270 78 140 120z" fill="#D2A06B"/>
  <path d="M30 70 140 120 140 232 30 176z" fill="#B27D4B"/>
  <path d="M140 120 270 78 270 184 140 232z" fill="#9C6A3E"/>
  <path d="M60 80l60-18 8 6-60 20z" fill="#fff" opacity=".9"/>
  <rect x="150" y="150" width="86" height="44" rx="4" fill="#fff" transform="skewY(-12.5) translate(0 62)"/>
  <rect x="158" y="160" width="40" height="5" fill="#2E6B3C" transform="skewY(-12.5) translate(0 62)"/>
  <rect x="158" y="171" width="68" height="3" fill="#9aa" transform="skewY(-12.5) translate(0 62)"/>
  <rect x="158" y="179" width="52" height="3" fill="#9aa" transform="skewY(-12.5) translate(0 62)"/>
  </svg>`;
}

export function spinach({ w = 260 } = {}) {
  const leaf = (x, y, r, s, c) => `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})"><path d="M0 0C-34 -30 -30 -90 0 -118C30 -90 34 -30 0 0Z" fill="${c}"/><path d="M0 0V-104" stroke="#1f6b2a" stroke-opacity=".55" stroke-width="3"/><path d="M0 -40l-14 -16M0 -62l16 -16M0 -82l-10 -12" stroke="#1f6b2a" stroke-opacity=".4" stroke-width="2"/></g>`;
  return `<svg viewBox="0 0 260 200" width="${w}" height="${w * 200 / 260}" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="130" cy="186" rx="96" ry="9" fill="#000" opacity=".2"/>
  ${leaf(130, 178, -56, 0.95, '#3C9A3B')}${leaf(130, 178, 56, 0.95, '#43A844')}${leaf(130, 178, -26, 1.1, '#4FB84D')}${leaf(130, 178, 26, 1.1, '#3FA542')}${leaf(130, 178, 0, 1.2, '#5BC45A')}
  <path d="M104 176h52l-6 14h-40z" fill="#CFA06A"/>
  </svg>`;
}

export function chiliCrate({ w = 320 } = {}) {
  return `<svg viewBox="0 0 320 240" width="${w}" height="${w * 240 / 320}" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="160" cy="226" rx="132" ry="10" fill="#000" opacity=".2"/>
  <path d="M40 120h240l-14 100H54z" fill="#C79A63"/>
  <path d="M40 120h240v16H40z" fill="#DDB27B"/>
  <path d="M60 150h200M64 178h192" stroke="#8d6738" stroke-opacity=".5" stroke-width="3"/>
  ${chili(80, 40, -64, .9)}${chili(120, 28, -30, 1)}${chili(160, 20, 4, 1.05)}${chili(204, 28, 34, 1)}${chili(240, 44, 66, .9)}${chili(140, 56, -12, .9)}${chili(184, 54, 14, .9)}
  <path d="M40 112h240v14H40z" fill="#E8C690"/>
  </svg>`;
}

export function melon({ w = 200 } = {}) {
  const g = id('mg');
  let net = '';
  for (let i = 0; i < 9; i++) net += `<path d="M${22 + i * 18} 20 Q${40 + i * 15} 80 ${22 + i * 18} 140" stroke="#fff" stroke-opacity=".5" fill="none" stroke-width="2"/>`;
  for (let i = 0; i < 7; i++) net += `<path d="M10 ${28 + i * 17}Q100 ${44 + i * 17} 190 ${28 + i * 17}" stroke="#fff" stroke-opacity=".45" fill="none" stroke-width="2"/>`;
  return `<svg viewBox="0 0 200 160" width="${w}" height="${w * .8}" xmlns="http://www.w3.org/2000/svg">
  <defs><radialGradient id="${g}" cx=".35" cy=".3"><stop offset="0" stop-color="#C5D8A0"/><stop offset="1" stop-color="#7FA45B"/></radialGradient><clipPath id="${g}c"><ellipse cx="100" cy="82" rx="90" ry="70"/></clipPath></defs>
  <ellipse cx="100" cy="82" rx="90" ry="70" fill="url(#${g})"/><g clip-path="url(#${g}c)">${net}</g>
  <path d="M96 12c2-8 10-10 14-8" stroke="#5A7A36" stroke-width="5" fill="none" stroke-linecap="round"/>
  </svg>`;
}

// banner field landscape (rice terraces) used behind the hero banner
export function fieldBg() {
  const rows = [];
  for (let i = 0; i < 11; i++) {
    const y = 120 + i * 22;
    rows.push(`<path d="M0 ${y}Q480 ${y - 26 + i * 3} 960 ${y}V${y + 22}H0z" fill="${i % 2 ? '#7DB352' : '#6AA844'}" opacity="${0.55 + i * 0.04}"/>`);
  }
  return `<svg viewBox="0 0 960 330" width="960" height="330" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="fb1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#CFE7B0"/><stop offset=".42" stop-color="#9CCB78"/><stop offset="1" stop-color="#3F8A38"/></linearGradient></defs>
  <rect width="960" height="330" fill="url(#fb1)"/>
  <path d="M0 118Q150 70 320 108T640 100T960 96V140H0z" fill="#5C9B50" opacity=".55"/>
  ${rows.join('')}
  </svg>`;
}
