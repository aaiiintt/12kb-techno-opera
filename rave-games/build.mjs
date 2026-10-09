/* Gaz '89 build.
   One page with every level (dist/gaz.html) and one page per level (dist/gaz-NN.html),
   each self-contained: the LittleJS engine core assembled from the npm package's src/ in
   release mode, the shared libs, then the level files, minified with terser and inlined
   into games/gaz/index.html. Each page must come in under the gate, 128 KB on disk,
   uncompressed, as the brief asks; the gzipped size is printed too.
   Per-game config: games/gaz/build.json { title, libs: [...], levels: [...], gate } */

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { minify } from 'terser';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const GAME = path.join(ROOT, 'games', 'gaz');
const DIST = path.join(ROOT, 'dist');
const ENGINE_DIR = path.join(ROOT, 'node_modules', 'littlejsengine');
const ENGINE_CORE = ['engine', 'engineRelease', 'engineMath', 'engineUtilities', 'engineSettings', 'engineObject',
  'engineDraw', 'engineInput', 'engineAudio', 'engineTileLayer', 'engineParticles', 'engineWebGL', 'engineLogo']
  .map((f) => path.join(ENGINE_DIR, 'src', f + '.js'));

const gz = (s) => zlib.gzipSync(s, { level: 9 }).length;
const kb = (n) => (n / 1024).toFixed(1) + ' KB';
if (!ENGINE_CORE.every((f) => fs.existsSync(f))) { console.error('build: engine not found. Run `npm install` first.'); process.exit(1); }

const cfg = JSON.parse(fs.readFileSync(path.join(GAME, 'build.json'), 'utf8'));
const gate = cfg.gate || 128 * 1024;
const only = process.argv[2];   // a level number, to build just that page
const read = (f) => fs.readFileSync(path.join(GAME, f), 'utf8');
const engine = ENGINE_CORE.map((f) => fs.readFileSync(f, 'utf8')).join('\n');
const plugins = (cfg.plugins || []).map((n) => fs.readFileSync(path.join(ENGINE_DIR, 'plugins', n + '.js'), 'utf8')).join('\n');
const libs = plugins + '\n' + cfg.libs.map(read).join('\n');
const html = read('index.html');
fs.mkdirSync(DIST, { recursive: true });

async function page(name, levelFiles) {
  const js = [engine, libs, ...levelFiles.map(read), 'GAZ.start();'].join('\n');
  const min = await minify(js, { toplevel: true, compress: { passes: 2 }, mangle: true, format: { comments: false } });
  if (min.error) throw min.error;
  const out = html.replace(/<script[^>]*src="[^"]*"[^>]*><\/script>\s*/g, '').replace(/<script>GAZ.start\(\);<\/script>\s*/, '').replace('</body>', `<script>${min.code}</script></body>`);
  const file = path.join(DIST, name + '.html');
  fs.writeFileSync(file, out);
  const size = Buffer.byteLength(out), ok = size <= gate;
  console.log(`  ${name}.html  ${size} B (${kb(size)})  gz ${kb(gz(out))}  gate ${kb(gate)}  ${ok ? 'ok' : 'OVER'}`);
  return ok;
}

let ok = true;
if (!only) ok = (await page('gaz', cfg.levels)) && ok;
for (let i = 0; i < cfg.levels.length; i++) {
  const n = String(i + 1).padStart(2, '0');
  if (only && only !== n && only !== String(i + 1)) continue;
  ok = (await page('gaz-' + n, [cfg.levels[i]])) && ok;
}
process.exit(ok ? 0 : 1);
