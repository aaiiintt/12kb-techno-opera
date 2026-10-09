// trace.mjs <image.png> <outPrefix> <height> [--shared] [--outline]
// Cuts every figure out of a flat-background sheet (2D boxes), downsamples each to <height> (area average,
// alpha by coverage), quantises to Mega Drive colour levels (3 bits per channel) and at most 15 colours
// (one palette shared by every figure with --shared), optionally draws a 1px dark outline, and writes
// <outPrefix>.json: [{rows, pal}, ...] in reading order (left to right, top to bottom).
import fs from 'node:fs'; import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
let chromium; for (const m of ['playwright-core', 'playwright', '/opt/node22/lib/node_modules/playwright']) { try { ({ chromium } = require(m)); break; } catch {} }
const [,, img, prefix, hStr, ...flags] = process.argv; const height = +hStr, shared = flags.includes('--shared'), outline = flags.includes('--outline');
const browser = await chromium.launch(); const page = await browser.newPage();
const b64 = fs.readFileSync(img).toString('base64');
const out = await page.evaluate(async ({ b64, height, shared, outline }) => {
  const im = new Image(); im.src = 'data:image/png;base64,' + b64; await im.decode();
  const W = im.width, H = im.height; const c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d'); g.drawImage(im, 0, 0); const d = g.getImageData(0, 0, W, H).data;
  const key = (i) => (d[i] >> 3) + ',' + (d[i + 1] >> 3) + ',' + (d[i + 2] >> 3); const cnt = {};
  for (let x = 0; x < W; x += 2) for (const y of [0, 1, H - 2, H - 1]) { const k = key((y * W + x) * 4); cnt[k] = (cnt[k] || 0) + 1; }
  const bgk = Object.entries(cnt).sort((a, b) => b[1] - a[1])[0][0].split(',').map((v) => v * 8 + 4);
  const isBg = (i) => Math.abs(d[i] - bgk[0]) < 14 && Math.abs(d[i + 1] - bgk[1]) < 14 && Math.abs(d[i + 2] - bgk[2]) < 14;
  // mask at 1/4 resolution, then flood fill boxes
  const S = 4, mw = W / S | 0, mh = H / S | 0, mask = new Uint8Array(mw * mh);
  for (let y = 0; y < mh; y++) for (let x = 0; x < mw; x++) { let n = 0; for (let yy = 0; yy < S; yy++) for (let xx = 0; xx < S; xx++) if (!isBg(((y * S + yy) * W + x * S + xx) * 4)) n++; mask[y * mw + x] = n > 2 ? 1 : 0; }
  const seen = new Uint8Array(mw * mh), boxes = [];
  for (let i = 0; i < mask.length; i++) { if (!mask[i] || seen[i]) continue; const st = [i]; seen[i] = 1; let x0 = mw, x1 = 0, y0 = mh, y1 = 0, n = 0;
    while (st.length) { const j = st.pop(); n++; const x = j % mw, y = j / mw | 0; x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1], [2, 0], [-2, 0], [0, 2], [0, -2]]) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= mw || ny >= mh) continue; const k = ny * mw + nx; if (mask[k] && !seen[k]) { seen[k] = 1; st.push(k); } } }
    if (n > 60) boxes.push({ x0: x0 * S, x1: (x1 + 1) * S, y0: y0 * S, y1: (y1 + 1) * S }); }
  // merge boxes that overlap in x and are close in y (a figure's head and body split by a thin neck)
  boxes.sort((a, b) => a.y0 - b.y0 || a.x0 - b.x0);
  // reading order: rows of figures by y0 clustering
  const rows = []; for (const b of boxes) { const r = rows.find((r) => Math.abs(r.y - b.y0) < (b.y1 - b.y0) * 0.5); if (r) { r.items.push(b); r.y = Math.min(r.y, b.y0); } else rows.push({ y: b.y0, items: [b] }); }
  rows.sort((a, b) => a.y - b.y); for (const r of rows) r.items.sort((a, b) => a.x0 - b.x0);
  const figs = rows.flatMap((r) => r.items).filter((b) => b.y1 - b.y0 > 60); console.log(JSON.stringify(boxes));
  const sprites = [];
  for (const b of figs) {
    const scale = (b.y1 - b.y0) / height, w = Math.max(1, Math.round((b.x1 - b.x0) / scale)); const px = [];
    for (let yy = 0; yy < height; yy++) { const row = []; for (let xx = 0; xx < w; xx++) {
      let r = 0, gg = 0, bb = 0, n = 0, a = 0; const sx0 = b.x0 + xx * scale, sy0 = b.y0 + yy * scale;
      for (let sy = Math.floor(sy0); sy < Math.min(b.y1, sy0 + scale); sy++) for (let sx = Math.floor(sx0); sx < Math.min(b.x1, sx0 + scale); sx++) { const i = (sy * W + sx) * 4; n++; if (isBg(i)) continue; a++; r += d[i]; gg += d[i + 1]; bb += d[i + 2]; }
      row.push(!a || a / n < 0.45 ? null : [r / a, gg / a, bb / a]); } px.push(row); }
    sprites.push({ px, w });
  }
  // quantise: median cut per sprite or shared, then snap to Mega Drive levels (0..7 * 36)
  const md = (v) => Math.round(v / 36) * 36;
  const quant = (pts, n) => { let boxes = [pts.slice()]; const info = (bx) => { const mn = [255, 255, 255], mx = [0, 0, 0]; for (const p of bx) for (let k = 0; k < 3; k++) { mn[k] = Math.min(mn[k], p[k]); mx[k] = Math.max(mx[k], p[k]); } const spans = mx.map((v, k) => v - mn[k]); return { span: Math.max(...spans), axis: spans.indexOf(Math.max(...spans)) }; };
    while (boxes.length < n) { boxes.sort((a, b) => info(b).span * Math.sqrt(b.length) - info(a).span * Math.sqrt(a.length)); const bx = boxes.shift(); if (!bx || bx.length < 2 || info(bx).span < 8) { if (bx) boxes.push(bx); break; } const ax = info(bx).axis; bx.sort((p, q) => p[ax] - q[ax]); const mid = bx.length >> 1; boxes.push(bx.slice(0, mid), bx.slice(mid)); }
    const pal = boxes.map((bx) => bx.reduce((s, p) => [s[0] + p[0] / bx.length, s[1] + p[1] / bx.length, s[2] + p[2] / bx.length], [0, 0, 0]).map(md));
    // dedupe after snapping
    const seenC = new Set(); return pal.filter((p) => { const k = p.join(','); if (seenC.has(k)) return false; seenC.add(k); return true; }); };
  const hex = (p) => '#' + p.map((v) => v.toString(16).padStart(2, '0')).join('');
  const keys = 'abcdefghijklmnopqrstuvwxyz';
  const nearest = (pal, p) => { let bi = 0, bd = 1e9; pal.forEach((q, i) => { const dd = (q[0] - p[0]) ** 2 + (q[1] - p[1]) ** 2 + (q[2] - p[2]) ** 2; if (dd < bd) { bd = dd; bi = i; } }); return bi; };
  const outlineCol = [36, 0, 36];
  const sharedPal = shared ? quant(sprites.flatMap((s) => s.px.flat().filter(Boolean)), outline ? 14 : 15) : null;
  return sprites.map(({ px, w }) => {
    const pal = sharedPal || quant(px.flat().filter(Boolean), outline ? 14 : 15);
    const full = outline ? [...pal, outlineCol] : pal; const oi = full.length - 1;
    const idx = px.map((row) => row.map((p) => p ? nearest(pal, p) : -1));
    if (outline) for (let y = 0; y < height; y++) for (let x = 0; x < w; x++) { if (idx[y][x] < 0) continue; let edge = false; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= w || ny >= height || idx[ny][nx] < 0) edge = true; } if (edge) idx[y][x] = oi; }
    const palette = {}; full.forEach((p, i) => palette[keys[i]] = hex(p));
    return { rows: idx.map((row) => row.map((i) => i < 0 ? '.' : keys[i]).join('')), pal: palette };
  });
}, { b64, height, shared, outline });
await browser.close();
fs.writeFileSync(prefix + '.json', JSON.stringify(out));
console.log(`${out.length} figures -> ${prefix}.json (${out.map((o) => o.rows[0].length + 'x' + o.rows.length).join(', ')})`);
