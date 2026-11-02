// Shared helpers: static file server + headless Chrome launcher (no npm deps needed).
import http from 'http';
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const PW_CANDIDATES = [
  process.env.PLAYWRIGHT_CORE_DIR,
  '/inner_container/opt/toolchains/.nvm/versions/node/v22.23.4/lib/node_modules/@playwright/mcp/',
  '/root/.nvm/versions/node/v22.23.4/lib/node_modules/@playwright/mcp/',
].filter(Boolean);

export function loadPlaywright() {
  for (const base of PW_CANDIDATES) {
    try {
      const req = createRequire(base.endsWith('/') ? base : base + '/');
      return req('playwright-core');
    } catch {}
  }
  try { return createRequire(import.meta.url)('playwright-core'); } catch {}
  throw new Error('playwright-core not found. Set PLAYWRIGHT_CORE_DIR to a dir containing node_modules/playwright-core');
}

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.ttf': 'font/ttf', '.woff2': 'font/woff2', '.wav': 'audio/wav', '.mp4': 'video/mp4',
};

export function serve(port = 0, root = ROOT) {
  return new Promise((resolve) => {
    const srv = http.createServer((req, res) => {
      const u = decodeURIComponent(req.url.split('?')[0]);
      const f = path.join(root, u === '/' ? '/src/index.html' : u);
      if (!f.startsWith(root)) { res.statusCode = 403; return res.end(); }
      fs.readFile(f, (err, buf) => {
        if (err) { res.statusCode = 404; return res.end('404'); }
        res.setHeader('content-type', MIME[path.extname(f)] || 'application/octet-stream');
        res.setHeader('cache-control', 'no-store');
        res.setHeader('accept-ranges', 'bytes');
        const m = /bytes=(\d*)-(\d*)/.exec(req.headers.range || '');
        if (m) {
          const a = m[1] ? +m[1] : 0, b = m[2] ? Math.min(+m[2], buf.length - 1) : buf.length - 1;
          res.statusCode = 206; res.setHeader('content-range', `bytes ${a}-${b}/${buf.length}`); res.setHeader('content-length', b - a + 1);
          return res.end(buf.subarray(a, b + 1));
        }
        res.end(buf);
      });
    }).listen(port, '127.0.0.1', () => resolve({ srv, port: srv.address().port }));
  });
}

export async function launch({ headless = true, gpu = false } = {}) {
  const { chromium } = loadPlaywright();
  const exe = process.env.CHROME_PATH || '/usr/local/bin/chrome';
  return chromium.launch({
    executablePath: exe,
    headless,
    args: [
      '--no-sandbox', '--disable-crash-reporter', '--disable-breakpad', '--disable-dev-shm-usage',
      '--force-color-profile=srgb', '--disable-lcd-text', '--font-render-hinting=none',
      '--hide-scrollbars', '--mute-audio', '--autoplay-policy=no-user-gesture-required',
      '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist',
      ...(gpu ? [] : ['--disable-gpu']),
    ],
    env: { ...process.env, HOME: path.join(ROOT, '.home') },
  });
}

export const W = 1080, H = 1920, FPS = 30, DURATION = 30, TOTAL_FRAMES = FPS * DURATION;
