/* The review gallery: every phase of every act, both outcomes, deterministic.
     node test/gallery.mjs <id> [outDir]
   Runs the built opera twice in headless Chromium, once forcing every act to
   win and once to lose (?force=), and photographs each act at: the curtain,
   the command card, the action at about 40% of its window, the outcome early
   and the outcome late. Writes <outDir>/<id>-win.png and <id>-lose.png as
   contact sheets (6 rows, one per act, 5 columns), plus the frames. This is
   the strict loop: build, then look at these two sheets before anything ships. */

import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const id = process.argv[2];
const out = process.argv[3] || path.join(process.env.TMPDIR || '/tmp', 'arcade-gallery');
if (!id || !fs.existsSync(path.join(ROOT, 'dist', id + '.html'))) { console.error('gallery: build first, then node test/gallery.mjs <id>'); process.exit(1); }
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

const PH = { CURTAIN: 1, COMMAND: 2, ACTION: 3, OUTCOME: 4, RESULT: 5 };
const COLS = ['curtain', 'command', 'action', 'outcome', 'outcome late'];
const errorsAll = [];

async function run(mode) {
  const page = await browser.newPage({ viewport: { width: 1024, height: 576 } });
  page.on('pageerror', (e) => errorsAll.push(`${mode} pageerror: ${e.message}`));
  page.on('console', (msg) => msg.type() === 'error' && errorsAll.push(`${mode} console: ${msg.text()}`));
  const force = Array(6).fill(mode === 'win' ? 'w' : 'l').join(',');
  await page.goto(`http://127.0.0.1:${port}/dist/${id}.html?force=${force}`);
  await page.waitForTimeout(600);
  await page.mouse.click(512, 288);
  await page.keyboard.press('Space');
  const frames = {};   // `${act}-${col}` -> file
  const state = async () => page.evaluate(() => window.__mg || {});
  let last = { phase: -1, act: -1 }, actionShotAt = 0, outcomeShots = 0, t0 = Date.now();
  // keep the player doing something plausible so action frames aren't static
  let dir = 'ArrowRight';
  while (Date.now() - t0 < 900000) {
    const s = await state();
    if (s.phase === PH.RESULT) break;
    if (s.phase !== last.phase || s.act !== last.act) {
      if (s.phase === PH.CURTAIN) { await page.waitForTimeout(350); await shoot(page, frames, s.act, 0, mode); }
      if (s.phase === PH.COMMAND) { await page.waitForTimeout(150); await shoot(page, frames, s.act, 1, mode); }
      if (s.phase === PH.ACTION) { actionShotAt = 0; await page.keyboard.down(dir); }
      if (s.phase === PH.OUTCOME) { await page.keyboard.up(dir); dir = dir === 'ArrowRight' ? 'ArrowLeft' : 'ArrowRight'; outcomeShots = 0; await page.waitForTimeout(700); await shoot(page, frames, s.act, 3, mode); outcomeShots = 1; }
      last = { phase: s.phase, act: s.act };
    }
    if (s.phase === PH.ACTION && !actionShotAt && s.t > 0.7) { await page.keyboard.press('Space'); await page.waitForTimeout(80); await shoot(page, frames, s.act, 2, mode); actionShotAt = 1; }
    if (s.phase === PH.ACTION && s.t > 0.3 && Math.random() < 0.12) await page.keyboard.press('Space');
    if (s.phase === PH.OUTCOME && outcomeShots === 1 && s.t > 2.3) { await shoot(page, frames, s.act, 4, mode); outcomeShots = 2; }
    await page.waitForTimeout(60);
  }
  const res = await state();
  await page.close();
  console.log(`  ${mode} run took ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  return { frames, bravos: res.bravos, playable: res.playable ?? 6 };
}

async function shoot(page, frames, act, col, mode) {
  const file = path.join(out, `${id}-${mode}-${act + 1}-${col}.png`);
  await page.screenshot({ path: file });
  frames[`${act}-${col}`] = file;
}

async function sheet(frames, mode, bravos) {
  const w = 384, h = 216;
  const page = await browser.newPage({ viewport: { width: 5 * w, height: 6 * h + 24 } });
  let html = `<body style="margin:0;background:#111;color:#0f0;font:14px monospace"><div style="height:24px;line-height:24px;padding-left:8px">${id} · every act forced to ${mode} · ${bravos} bravos · columns: ${COLS.join(' / ')}</div><div style="display:grid;grid-template-columns:repeat(5,${w}px)">`;
  for (let a = 0; a < 6; a++) for (let c = 0; c < 5; c++) {
    const f = frames[`${a}-${c}`];
    html += f ? `<div style="position:relative"><img src="data:image/png;base64,${fs.readFileSync(f).toString('base64')}" style="width:${w}px;height:${h}px;image-rendering:pixelated"><span style="position:absolute;left:4px;top:2px">${a + 1} ${COLS[c]}</span></div>` : `<div style="width:${w}px;height:${h}px;background:#300">${a + 1} ${COLS[c]} MISSING</div>`;
  }
  html += '</div></body>';
  await page.setContent(html);
  const file = path.join(out, `${id}-${mode}.png`);
  await page.screenshot({ path: file });
  await page.close();
  return file;
}

const win = await run('win');
const lose = await run('lose');
const a = await sheet(win.frames, 'win', win.bravos);
const b = await sheet(lose.frames, 'lose', lose.bravos);
await browser.close();
server.close();
console.log(`gallery: ${id}  win run ${win.bravos}/${win.playable} bravos (expect ${win.playable})  lose run ${lose.bravos}/${win.playable} (expect 0)\n  ${a}\n  ${b}`);
for (const e of errorsAll) console.log('  ' + e);
const bad = errorsAll.length || win.bravos !== win.playable || lose.bravos !== 0;
process.exit(bad ? 1 : 0);
