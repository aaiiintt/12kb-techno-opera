/* Contact sheets from a play.mjs screenshot folder, for review.
     node test/sheet.mjs <dir> [perSheet=12]
   Writes sheet0.png, sheet1.png ... into the same folder, 3 columns, half size. */

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
let chromium;
for (const m of ['playwright-core', 'playwright', '/opt/node22/lib/node_modules/playwright']) { try { ({ chromium } = require(m)); break; } catch {} }
const dir = process.argv[2], per = +(process.argv[3] || 12), cols = 3, w = 512, h = 288;
const files = fs.readdirSync(dir).filter((f) => /^t\d+\.png$/.test(f)).sort();
const browser = await chromium.launch();
for (let k = 0; k * per < files.length; k++) {
  const batch = files.slice(k * per, (k + 1) * per);
  const rows = Math.ceil(batch.length / cols);
  const page = await browser.newPage({ viewport: { width: cols * w, height: rows * h } });
  const html = `<body style="margin:0;background:#000;display:grid;grid-template-columns:repeat(${cols},${w}px)">` +
    batch.map((f) => `<div style="position:relative;width:${w}px;height:${h}px"><img src="data:image/png;base64,${fs.readFileSync(path.join(dir, f)).toString('base64')}" style="width:${w}px;height:${h}px;image-rendering:pixelated"><span style="position:absolute;left:4px;top:2px;color:#0f0;font:12px monospace">${f}</span></div>`).join('') + '</body>';
  await page.setContent(html);
  await page.screenshot({ path: path.join(dir, `sheet${k}.png`) });
  await page.close();
}
await browser.close();
console.log(`sheet: ${Math.ceil(files.length / per)} sheets in ${dir}`);
