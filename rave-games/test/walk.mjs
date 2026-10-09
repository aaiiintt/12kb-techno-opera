/* The walk: every level played by its bot, photographed, gated.
     node test/walk.mjs [outDir]
   Opens dist/gaz.html?bot=1 in headless Chromium. The shell hands input to each level's
   bot(). Each level is photographed at the open (1.5 s), early in play, mid play and at
   the end, and must end within its time budget; a fail count is reported. Writes a contact
   sheet (one row per level, four columns) and fails on any page error, a stuck level, or
   a level that never ends. The sheet is looked at by a person before anything ships. */

import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const out = process.argv[2] || path.join(process.env.TMPDIR || '/tmp', 'gaz-walk');
if (!fs.existsSync(path.join(ROOT, 'dist', 'gaz.html'))) { console.error('walk: build first'); process.exit(1); }
fs.mkdirSync(out, { recursive: true });
const require = createRequire(import.meta.url);
let chromium;
for (const mod of ['playwright-core', 'playwright', '/opt/node22/lib/node_modules/playwright']) { try { ({ chromium } = require(mod)); break; } catch {} }
const server = http.createServer((req, res) => {
  const f = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': f.endsWith('.html') ? 'text/html' : 'application/javascript' });
  fs.createReadStream(f).pipe(res);
});
await new Promise((r) => server.listen(0, r));
const port = server.address().port;
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage({ viewport: { width: 512, height: 288 } });
const errors = [];
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
page.on('console', (msg) => msg.type() === 'error' && errors.push('console: ' + msg.text()));
await page.goto(`http://127.0.0.1:${port}/dist/gaz.html?bot=1`);
await page.waitForTimeout(600);
await page.mouse.click(256, 144);
const PH = { OPEN: 0, PLAY: 1, FAIL: 2, END: 3, TITLE: 4 };
const COLS = ['open', 'play early', 'play mid', 'end'];
const frames = {}, rows = [];
const state = async () => page.evaluate(() => window.__gaz || {});
const shoot = async (lv, col) => { const f = path.join(out, `gaz-${lv}-${col}.png`); await page.screenshot({ path: f }); frames[`${lv}-${col}`] = f; };
let last = -1, shots = 0, t0 = Date.now(), levelAt = Date.now(), levels = 12;
while (Date.now() - t0 < 900000) {
  const s = await state();
  if (s.levels) levels = s.levels;
  if (s.done) break;
  if (s.level !== last) { if (last > 0) rows.push({ level: last, seconds: ((Date.now() - levelAt) / 1000).toFixed(0), fails: lastFails }); last = s.level; shots = 0; levelAt = Date.now(); }
  var lastFails = s.fails;
  if (s.phase === PH.OPEN && shots === 0 && s.t > 1.5) { await shoot(s.level, 0); shots = 1; }
  if (s.phase === PH.PLAY && shots <= 1 && s.t > 0.8) { await shoot(s.level, 1); shots = 2; }
  if (s.phase === PH.PLAY && shots === 2 && s.t > 4) { await shoot(s.level, 2); shots = 3; }
  if (s.phase === PH.END && shots <= 3 && s.t > 2.5) { await shoot(s.level, 3); shots = 4; }
  if (Date.now() - levelAt > 120000) { errors.push(`level ${s.level} did not end in 120 s`); break; }
  await page.waitForTimeout(60);
}
if (last > 0) rows.push({ level: last, seconds: ((Date.now() - levelAt) / 1000).toFixed(0), fails: lastFails });
// the sheet
const w = 384, h = 216;
const sp = await browser.newPage({ viewport: { width: 4 * w, height: levels * h + 24 } });
let html = `<body style="margin:0;background:#111;color:#0f0;font:14px monospace"><div style="height:24px;line-height:24px;padding-left:8px">gaz '89 · the bot's walk · ${rows.map((r) => `L${r.level} ${r.seconds}s/${r.fails}f`).join(' · ')}</div><div style="display:grid;grid-template-columns:repeat(4,${w}px)">`;
for (let a = 1; a <= levels; a++) for (let c = 0; c < 4; c++) {
  const f = frames[`${a}-${c}`];
  html += f ? `<div style="position:relative"><img src="data:image/png;base64,${fs.readFileSync(f).toString('base64')}" style="width:${w}px;height:${h}px;image-rendering:pixelated"><span style="position:absolute;left:4px;top:2px">${a} ${COLS[c]}</span></div>` : `<div style="width:${w}px;height:${h}px;background:#300">${a} ${COLS[c]} MISSING</div>`;
}
await sp.setContent(html + '</div></body>');
const sheet = path.join(out, 'gaz-walk.png');
await sp.screenshot({ path: sheet });
await browser.close(); server.close();
console.log('walk:', rows.map((r) => `level ${r.level}: ${r.seconds} s, ${r.fails} fails`).join('; '));
console.log('  ' + sheet);
for (const e of errors) console.log('  ' + e);
process.exit(errors.length ? 1 : 0);
