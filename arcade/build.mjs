/* Dot Opera Arcade build.
   Builds every game in games/ (or one, with `node build.mjs <id>`) into a
   single self-contained dist/<id>.html: the LittleJS engine core assembled
   from the npm package's src/ in release mode (asserts and the debug overlay
   stripped), only the plugins the game names, then the game's sources,
   minified with terser and inlined into the game's own index.html. Prints
   the gzipped size of each page and fails on the gate, the way the root
   build.js does for the original opera.

   The dev page (games/<id>/index.html) loads dist/littlejs.js from npm, which
   carries every plugin, so a plugin a game forgets to list in build.json
   works in dev and is missing from the build. The smoke test catches that.

   Per-game config: games/<id>/build.json
     {
       "title": "HELLO",                      // page title, defaults to id
       "plugins": ["postProcess"],            // node_modules/littlejsengine/plugins/<name>.js, optional
       "sources": ["../../lib/gameFx.js", "game.js"], // concatenated in order, engine NOT listed
       "gate": 65536                          // gzipped byte limit, optional
     }
   Paths in build.json are relative to the game folder. */

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { minify } from 'terser';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const GAMES = path.join(ROOT, 'games');
const DIST = path.join(ROOT, 'dist');
const ENGINE_DIR = path.join(ROOT, 'node_modules', 'littlejsengine');
// the engine core in the order upstream src/engineBuild.mjs concatenates it
const ENGINE_CORE = ['engine', 'engineRelease', 'engineMath', 'engineUtilities', 'engineSettings', 'engineObject',
  'engineDraw', 'engineInput', 'engineAudio', 'engineTileLayer', 'engineParticles', 'engineWebGL', 'engineLogo']
  .map((f) => path.join(ENGINE_DIR, 'src', f + '.js'));
const DEFAULT_GATE = 64 * 1024; // generous until the games tell us what they need

const gz = (s) => zlib.gzipSync(s, { level: 9 }).length;
const kb = (n) => (n / 1024).toFixed(1) + ' KB';

if (!ENGINE_CORE.every((f) => fs.existsSync(f))) {
  console.error('build: engine not found. Run `npm install` in arcade/ first.');
  process.exit(1);
}

const only = process.argv[2];
const ids = fs.readdirSync(GAMES).filter((d) => fs.existsSync(path.join(GAMES, d, 'build.json')));
const todo = only ? ids.filter((d) => d === only) : ids;
if (!todo.length) {
  console.error(only ? `build: no game "${only}" in games/` : 'build: no games with a build.json');
  process.exit(1);
}

fs.mkdirSync(DIST, { recursive: true });
let failed = false;
for (const id of todo) {
  try {
    await build(id);
  } catch (e) {
    failed = true;
    console.error(`  ${id}: ${e.message}`);
  }
}
process.exit(failed ? 1 : 0);

async function build(id) {
  const dir = path.join(GAMES, id);
  const cfg = JSON.parse(fs.readFileSync(path.join(dir, 'build.json'), 'utf8'));
  const title = cfg.title ?? id;
  const gate = cfg.gate ?? DEFAULT_GATE;
  if (!Array.isArray(cfg.sources) || !cfg.sources.length) throw new Error('build.json needs a non-empty "sources" array');

  const files = [
    ...ENGINE_CORE,
    ...(cfg.plugins ?? []).map((p) => path.join(ENGINE_DIR, 'plugins', p + '.js')),
    ...cfg.sources.map((s) => path.join(dir, s)),
  ];
  for (const f of files) if (!fs.existsSync(f)) throw new Error(`missing ${path.relative(ROOT, f)}`);

  const js = files.map((f) => fs.readFileSync(f, 'utf8').replace(/\r/g, '')).join('\n');
  const min = await minify(js, { toplevel: true, compress: { passes: 2 }, mangle: true, format: { comments: false } });
  if (min.error) throw min.error;

  const bundle = `<script>${min.code}</script>`;
  const htmlPath = path.join(dir, 'index.html');
  let html;
  if (fs.existsSync(htmlPath)) {
    // keep the game's own page; replace its <script src> tags with the bundle
    html = fs.readFileSync(htmlPath, 'utf8');
    let placed = false;
    html = html.replace(/<script\b[^>]*\bsrc\s*=[^>]*>\s*<\/script>\s*/gi, () => (placed ? '' : ((placed = true), bundle)));
    if (!placed) html = html.replace(/<\/body>/i, bundle + '</body>');
    html = html.replace(/<title>[^<]*<\/title>/i, `<title>${title}</title>`);
  } else {
    html = `<!DOCTYPE html><html><head><meta charset=utf-8><title>${title}</title><meta name=viewport content="width=device-width,initial-scale=1,maximum-scale=1"><style>body{margin:0;background:#000}</style></head><body>${bundle}</body></html>`;
  }

  const out = path.join(DIST, id + '.html');
  fs.writeFileSync(out, html);
  const size = gz(html);
  const ok = size <= gate;
  console.log(`  ${id}.html  ${html.length} B  gz ${size} B (${kb(size)})  gate ${gate} B  ${ok ? 'ok' : 'OVER'}`);
  if (!ok) throw new Error(`${id} is ${size - gate} B over its ${gate} B gate`);
}
