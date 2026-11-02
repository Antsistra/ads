// Usage: node tools/render-frames.mjs [--from N] [--to N] [--workers N] [--force]
// Renders every frame of the timeline to frames/f_0000.png ... (lossless PNG). Resumable: existing files are skipped unless --force.
import fs from 'fs'; import path from 'path';
import { ROOT, serve, launch, W, H, TOTAL_FRAMES } from './lib.mjs';

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i < 0 ? d : (process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? Number(process.argv[i + 1]) : true); };
const from = arg('from', 0), to = arg('to', TOTAL_FRAMES - 1), workers = arg('workers', 6), force = process.argv.includes('--force');
const dir = path.join(ROOT, 'frames'); fs.mkdirSync(dir, { recursive: true });
const name = (i) => path.join(dir, `f_${String(i).padStart(4, '0')}.png`);

const todo = [];
for (let i = from; i <= to; i++) if (force || !fs.existsSync(name(i)) || fs.statSync(name(i)).size < 1000) todo.push(i);
console.log(`rendering ${todo.length} frames with ${workers} workers`);

const { srv, port } = await serve();
const t0 = Date.now();
let done = 0, failed = [];

async function worker(id) {
  const browser = await launch();
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.log(`[w${id} pageerror]`, e.message));
  await page.goto(`http://127.0.0.1:${port}/src/index.html`);
  await page.waitForFunction('window.__ready === true', null, { timeout: 90000 });
  while (todo.length) {
    const f = todo.shift();
    try {
      await page.evaluate((fr) => window.renderFrame(fr), f);
      await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => r())));
      const buf = await page.screenshot({ type: 'png' });
      fs.writeFileSync(name(f) + '.tmp', buf); fs.renameSync(name(f) + '.tmp', name(f));
    } catch (e) { console.log('frame', f, 'failed:', e.message.split('\n')[0]); failed.push(f); }
    done++;
    if (done % 50 === 0) console.log(`${done} done, ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  await browser.close();
}
await Promise.all(Array.from({ length: workers }, (_, i) => worker(i)));
srv.close();
console.log(`finished in ${((Date.now() - t0) / 1000).toFixed(0)}s; failed: ${failed.length ? failed.join(',') : 'none'}`);
if (failed.length) process.exit(1);
