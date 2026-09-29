/* Play a built opera through in headless Chromium and screenshot it.
     node test/play.mjs <id> [outDir] [seconds]
   Presses Space to start, then plays for `seconds` (default 90): alternates
   holding Left and Right, taps Space on most beats, holds it through some
   stretches. A screenshot every 1.5 s goes to outDir (default the scratch
   folder under /tmp). Fails on any page error. Not a test of skill, a test
   that every phase of every act renders and nothing throws. */

import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const id = process.argv[2];
const out = process.argv[3] || path.join(process.env.TMPDIR || '/tmp', 'arcade-play', id || 'x');
const seconds = +(process.argv[4] || 90);
if (!id || !fs.existsSync(path.join(ROOT, 'dist', id + '.html'))) { console.error('play: build first, then node test/play.mjs <id>'); process.exit(1); }
fs.mkdirSync(out, { recursive: true });

const require = createRequire(import.meta.url);
let chromium;
for (const m of ['playwright-core', 'playwright', '/opt/node22/lib/node_modules/playwright']) { try { ({ chromium } = require(m)); break; } catch {} }

const server = http.createServer((req, res) => {
  const f = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': f.endsWith('.html') ? 'text/html' : 'application/javascript' });
  fs.createReadStream(f).pipe(res);
});
await new Promise((r) => server.listen(0, r));
const port = server.address().port;
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage({ viewport: { width: 1024, height: 576 } });
const errors = [];
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
page.on('console', (m) => (m.type() === 'error' || m.type() === 'warning') && errors.push(m.type() + ': ' + m.text()));
await page.goto(`http://127.0.0.1:${port}/dist/${id}.html`);
await page.waitForTimeout(800);
await page.screenshot({ path: path.join(out, 'title.png') });
await page.mouse.click(512, 288);
await page.keyboard.press('Space');
await page.waitForTimeout(300);
await page.keyboard.press('Space');

const t0 = Date.now();
let shot = 0, dir = 'ArrowLeft', nextShot = 0, nextSwap = 0, holding = false;
while (Date.now() - t0 < seconds * 1000) {
  const el = (Date.now() - t0) / 1000;
  if (el >= nextSwap) { await page.keyboard.up(dir); dir = dir === 'ArrowLeft' ? 'ArrowRight' : 'ArrowLeft'; await page.keyboard.down(dir); nextSwap = el + 0.6 + Math.random() * 0.9; }
  // hold Space for stretches, tap it otherwise
  const stretch = Math.floor(el / 6) % 3 === 1;
  if (stretch && !holding) { await page.keyboard.down('Space'); holding = true; }
  else if (!stretch && holding) { await page.keyboard.up('Space'); holding = false; }
  else if (!stretch) await page.keyboard.press('Space');
  if (el >= nextShot) { await page.screenshot({ path: path.join(out, `t${String(Math.round(el)).padStart(3, '0')}.png`) }); shot++; nextShot = el + 1.5; }
  await page.waitForTimeout(120);
}
await browser.close();
server.close();
console.log(`play: ${id} ran ${seconds}s, ${shot} screenshots in ${out}`);
for (const e of errors) console.log('  ' + e);
process.exit(errors.length ? 1 : 0);
