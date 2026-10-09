// cut.mjs <sheet.png> <outDir> <prefix>
// Cuts every figure or object out of a flat-background sheet at full resolution, writes
// <outDir>/<prefix>-<n>.png with alpha (the background made transparent, edges kept hard) and
// <outDir>/<prefix>.json with each cut's box and size, in reading order. No downsampling.
import fs from 'node:fs'; import path from 'node:path'; import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
let chromium; for (const m of ['playwright-core', 'playwright', '/opt/node22/lib/node_modules/playwright']) { try { ({ chromium } = require(m)); break; } catch {} }
const [,, img, outDir, prefix] = process.argv; fs.mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch(); const page = await browser.newPage();
const b64 = fs.readFileSync(img).toString('base64');
const out = await page.evaluate(async ({ b64 }) => {
  const im = new Image(); im.src = 'data:image/png;base64,' + b64; await im.decode();
  const W = im.width, H = im.height; const c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d'); g.drawImage(im, 0, 0); const id = g.getImageData(0, 0, W, H), d = id.data;
  const key = (i) => (d[i] >> 3) + ',' + (d[i + 1] >> 3) + ',' + (d[i + 2] >> 3); const cnt = {};
  for (let x = 0; x < W; x += 2) for (const y of [0, 1, H - 2, H - 1]) { const k = key((y * W + x) * 4); cnt[k] = (cnt[k] || 0) + 1; }
  for (let y = 0; y < H; y += 2) for (const x of [0, 1, W - 2, W - 1]) { const k = key((y * W + x) * 4); cnt[k] = (cnt[k] || 0) + 1; }
  const bgk = Object.entries(cnt).sort((a, b) => b[1] - a[1])[0][0].split(',').map((v) => v * 8 + 4);
  const isBg = (i) => Math.abs(d[i] - bgk[0]) < 16 && Math.abs(d[i + 1] - bgk[1]) < 16 && Math.abs(d[i + 2] - bgk[2]) < 16;
  // flood the background from the border so enclosed bg-coloured pixels inside an object are kept
  const bgMask = new Uint8Array(W * H); const st = [];
  for (let x = 0; x < W; x++) { st.push(x, (H - 1) * W + x); } for (let y = 0; y < H; y++) { st.push(y * W, y * W + W - 1); }
  while (st.length) { const j = st.pop(); if (bgMask[j] || !isBg(j * 4)) continue; bgMask[j] = 1; const x = j % W, y = j / W | 0; if (x > 0) st.push(j - 1); if (x < W - 1) st.push(j + 1); if (y > 0) st.push(j - W); if (y < H - 1) st.push(j + W); }
  // components of the foreground at 1/4 res
  const S = 4, mw = W / S | 0, mh = H / S | 0, mask = new Uint8Array(mw * mh);
  for (let y = 0; y < mh; y++) for (let x = 0; x < mw; x++) { let n = 0; for (let yy = 0; yy < S; yy++) for (let xx = 0; xx < S; xx++) if (!bgMask[(y * S + yy) * W + x * S + xx]) n++; mask[y * mw + x] = n > 1 ? 1 : 0; }
  const seen = new Uint8Array(mw * mh), boxes = [];
  for (let i = 0; i < mask.length; i++) { if (!mask[i] || seen[i]) continue; const q = [i]; seen[i] = 1; let x0 = mw, x1 = 0, y0 = mh, y1 = 0, n = 0;
    while (q.length) { const j = q.pop(); n++; const x = j % mw, y = j / mw | 0; x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
      for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= mw || ny >= mh) continue; const k = ny * mw + nx; if (mask[k] && !seen[k]) { seen[k] = 1; q.push(k); } } }
    if (n > 40) boxes.push({ x0: Math.max(0, x0 * S - 2), x1: Math.min(W, (x1 + 1) * S + 2), y0: Math.max(0, y0 * S - 2), y1: Math.min(H, (y1 + 1) * S + 2) }); }
  const rows = []; for (const b of boxes) { const r = rows.find((r) => Math.abs(r.y - b.y0) < (b.y1 - b.y0) * 0.6); if (r) { r.items.push(b); } else rows.push({ y: b.y0, items: [b] }); }
  rows.sort((a, b) => a.y - b.y); for (const r of rows) r.items.sort((a, b) => a.x0 - b.x0);
  const figs = rows.flatMap((r) => r.items);
  return figs.map((b) => { const w = b.x1 - b.x0, h = b.y1 - b.y0; const cc = document.createElement('canvas'); cc.width = w; cc.height = h; const gg = cc.getContext('2d');
    const sub = gg.createImageData(w, h); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const si = ((b.y0 + y) * W + b.x0 + x), di = (y * w + x) * 4; sub.data[di] = d[si * 4]; sub.data[di + 1] = d[si * 4 + 1]; sub.data[di + 2] = d[si * 4 + 2]; sub.data[di + 3] = bgMask[si] ? 0 : 255; }
    gg.putImageData(sub, 0, 0); return { box: b, w, h, png: cc.toDataURL('image/png') }; });
}, { b64 });
await browser.close();
const manifest = out.map((o, i) => { const f = `${prefix}-${i}.png`; fs.writeFileSync(path.join(outDir, f), Buffer.from(o.png.split(',')[1], 'base64')); return { file: f, w: o.w, h: o.h, box: o.box }; });
fs.writeFileSync(path.join(outDir, prefix + '.json'), JSON.stringify(manifest, null, 1));
console.log(manifest.map((m) => `${m.file} ${m.w}x${m.h}`).join('\n'));
