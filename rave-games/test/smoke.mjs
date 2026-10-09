/* Headless smoke test for every built game in dist/.
   Serves arcade/ over HTTP, opens each dist/<id>.html in headless Chromium,
   waits for the engine to run frames, presses an arrow key and clicks the
   canvas, and fails on any page error or console error. Run `npm run build`
   first. Uses the Playwright that is installed globally in this environment
   (or `npm i -D playwright-core` locally). */

import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const DIST = path.join(ROOT, 'dist');
const require = createRequire(import.meta.url);
let chromium;
for (const m of ['playwright-core', 'playwright', '/opt/node22/lib/node_modules/playwright']) {
  try { ({ chromium } = require(m)); break; } catch {}
}
if (!chromium) { console.error('smoke: playwright not found'); process.exit(1); }

const pages = fs.existsSync(DIST) ? fs.readdirSync(DIST).filter((f) => f.endsWith('.html')) : [];
if (!pages.length) { console.error('smoke: nothing in dist/. Run `npm run build` first.'); process.exit(1); }

const server = http.createServer((req, res) => {
  const f = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': f.endsWith('.html') ? 'text/html' : 'application/javascript' });
  fs.createReadStream(f).pipe(res);
});
await new Promise((r) => server.listen(0, r));
const port = server.address().port;

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'],
});
let failed = 0;
for (const f of pages) {
  const errors = [];
  const page = await browser.newPage({ viewport: { width: 640, height: 640 } });
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push('console: ' + m.text()));
  // the build mangles top-level names, so count animation frames from outside
  await page.addInitScript(() => {
    window.__frames = 0;
    const raf = window.requestAnimationFrame;
    window.requestAnimationFrame = (cb) => raf.call(window, (t) => { window.__frames++; cb(t); });
  });
  await page.goto(`http://127.0.0.1:${port}/dist/${f}`);
  await page.waitForTimeout(600);
  const f0 = await page.evaluate(() => window.__frames);
  await page.keyboard.down('ArrowRight');   // hold across a few frames so keyIsDown sees it
  await page.waitForTimeout(100);
  await page.keyboard.up('ArrowRight');
  await page.mouse.click(400, 260);           // off-centre, so a step game has somewhere to go
  await page.waitForTimeout(600);
  const f1 = await page.evaluate(() => window.__frames);
  const canvases = await page.evaluate(() => document.querySelectorAll('canvas').length);
  const ok = !errors.length && f1 > f0 && canvases > 0;
  console.log(`  ${f}  frames ${f0} -> ${f1}  canvases ${canvases}  ${ok ? 'ok' : 'FAIL'}`);
  for (const e of errors) console.log('    ' + e);
  if (!ok) failed++;
  if (process.env.SHOT) await page.screenshot({ path: path.join(process.env.SHOT, f.replace('.html', '.png')) });
  await page.close();
}
await browser.close();
server.close();
process.exit(failed ? 1 : 0);
