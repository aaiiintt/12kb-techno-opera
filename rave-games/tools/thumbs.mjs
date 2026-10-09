import fs from 'node:fs'; import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
let chromium; for (const m of ['playwright-core', 'playwright', '/opt/node22/lib/node_modules/playwright']) { try { ({ chromium } = require(m)); break; } catch {} }
const browser = await chromium.launch(); const page = await browser.newPage();
for (const f of process.argv.slice(2)) {
  const b64 = fs.readFileSync(f).toString('base64');
  const out = await page.evaluate(async (b64) => { const im = new Image(); im.src = 'data:image/png;base64,' + b64; await im.decode(); const c = document.createElement('canvas'); c.width = 512; c.height = 512 * im.height / im.width; c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); return c.toDataURL('image/jpeg', 0.85); }, b64);
  fs.writeFileSync(f.replace(/\.png$/, '-512.jpg'), Buffer.from(out.split(',')[1], 'base64'));
}
await browser.close();
