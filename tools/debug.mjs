import fs from 'fs'; import path from 'path';
import { ROOT, serve, launch, W, H, FPS } from './lib.mjs';
const t = +process.argv[2] || 10.8;
const tests = JSON.parse(process.argv[3] || '[]');   // [{name, js}]
const { srv, port } = await serve();
const browser = await launch();
const page = await (await browser.newContext({ viewport: { width: W, height: H } })).newPage();
await page.goto(`http://127.0.0.1:${port}/src/index.html`);
await page.waitForFunction('window.__ready === true');
for (const tc of tests) {
  await page.evaluate((f) => window.renderFrame(f), Math.round(t * FPS));
  await page.evaluate(tc.js);
  const file = path.join(ROOT, `out/dbg_${tc.name}.png`);
  await page.screenshot({ path: file, clip: { x: 0, y: 0, width: 1080, height: 1920 } });
  console.log(tc.name, file);
}
await browser.close(); srv.close();
