// Usage: node tools/sheet.mjs out.png cols scale file1 file2 ...   (contact sheet of preview frames)
import fs from 'fs'; import path from 'path';
import { launch } from './lib.mjs';
const [out, colsS, scaleS, ...files] = process.argv.slice(2);
const cols = +colsS, sc = +scaleS;
const w = Math.round(1080 * sc), hgt = Math.round(1920 * sc);
const rows = Math.ceil(files.length / cols);
const html = `<body style="margin:0;background:#222;display:grid;grid-template-columns:repeat(${cols},${w}px);gap:6px;width:${cols * w + (cols - 1) * 6}px">` +
  files.map((f) => `<div style="position:relative"><img src="data:image/png;base64,${fs.readFileSync(f).toString('base64')}" style="width:${w}px;height:${hgt}px;display:block"><span style="position:absolute;left:4px;top:4px;color:#fff;font:14px monospace;background:#0008;padding:2px 4px">${path.basename(f)}</span></div>`).join('') + '</body>';
const browser = await launch();
const page = await browser.newPage({ viewport: { width: cols * w + (cols - 1) * 6, height: rows * hgt + (rows - 1) * 6 } });
await page.setContent(html);
await page.screenshot({ path: out });
await browser.close();
console.log('sheet', out);
