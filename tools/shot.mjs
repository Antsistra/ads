// Usage: node tools/shot.mjs <seconds> [<seconds> ...]   -> out/preview/t_<sec>.png
import fs from 'fs'; import path from 'path';
import { ROOT, serve, launch, W, H, FPS } from './lib.mjs';
const times = process.argv.slice(2).map(Number).filter((x) => !isNaN(x));
const { srv, port } = await serve();
const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
page.on('console', (m) => { const x = m.text(); if (!x.includes('GPU') && !x.includes('DevTools')) console.log('[page]', x); });
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
await page.goto(`http://127.0.0.1:${port}/src/index.html`);
await page.waitForFunction('window.__ready === true', null, { timeout: 60000 });
const dir = path.join(ROOT, 'out/preview'); fs.mkdirSync(dir, { recursive: true });
for (const t of times) {
  const t0 = Date.now();
  await page.evaluate((f) => window.renderFrame(f), Math.round(t * FPS));
  const file = path.join(dir, `t_${t.toFixed(2)}.png`);
  await page.screenshot({ path: file, type: 'png' });
  console.log(file, (Date.now() - t0) + 'ms');
}
await browser.close(); srv.close();
