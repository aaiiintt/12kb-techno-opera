const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { minify } = require('terser');
const CleanCSS = require('clean-css');

const ROOT_LIMIT = 12288;
const LIMITS = { engine: 10240, opera: 2048, standalone: 12288 };
const ENGINE_FILES = ['tween', 'synth', 'stage', 'gestures', 'score', 'index'].map((f) => `src/engine/${f}.js`);

const gzip = (s) => zlib.gzipSync(s, { level: 9 }).length;
const js = async (code) => (await minify(code, { compress: { passes: 3 }, mangle: true })).code;
const css = (code) => new CleanCSS({ level: 2 }).minify(code).styles.replace(/,\s+/g, ',');

async function buildOriginalSite() {
  // The retired-but-still-live 12KB Techno Opera. Keep building it exactly as
  // before: src/index.src.html with src/tween.js inlined, minified, written
  // to index.html at the repo root. Untouched by the Phase 0 engine rebuild.
  let html = fs.readFileSync('src/index.src.html', 'utf8');
  const engine = fs.readFileSync('src/tween.js', 'utf8');

  html = html.replace('<script>/* @include tween.js */</script>', '<script>' + (await js(engine)) + '</script>');

  const scripts = [];
  html = html.replace(/<script>([\s\S]*?)<\/script>/g, (m, code) => { scripts.push(code); return `<script>@@${scripts.length - 1}@@</script>`; });
  for (let i = 0; i < scripts.length; i++) html = html.replace(`@@${i}@@`, await js(scripts[i]));
  html = html.replace(/<style>([\s\S]*?)<\/style>/g, (m, code) => '<style>' + css(code) + '</style>');
  html = html.replace(/\n\s+/g, '\n').replace(/\n+/g, '\n');

  fs.writeFileSync('index.html', html);
  const gz = gzip(html);
  console.log(`[original site] index.html: ${html.length} bytes, ${gz} bytes gzipped, limit ${ROOT_LIMIT}, ${ROOT_LIMIT - gz} spare`);
  return gz <= ROOT_LIMIT;
}

async function buildShellTemplate() {
  let html = fs.readFileSync('src/shell.html', 'utf8');
  html = html.replace(/<style>([\s\S]*?)<\/style>/, (m, code) => '<style>' + css(code) + '</style>');
  const scriptMatch = /<script>([\s\S]*?)<\/script>/.exec(html);
  const minified = await js(scriptMatch[1]);
  html = html.replace(scriptMatch[0], '<script>' + minified + '</script>');
  html = html.replace(/\n\s+/g, '\n').replace(/\n+/g, '\n');
  return html;
}

async function buildEngine() {
  const src = ENGINE_FILES.map((f) => fs.readFileSync(f, 'utf8')).join('\n');
  const wrapped = `(function(){\n${src}\n})();`;
  return js(wrapped);
}

// ---- meta.js / sizes.json / playground: a small hand-rolled parser for the
// O.G = { name: (tl, ...) => {...}, ... } object in gestures.js, since we
// need each top-level entry's own source text (for per-gesture gzip size)
// without pulling in a real JS parser dependency.
function extractBalanced(src, openIdx) {
  let depth = 0, inStr = null;
  for (let i = openIdx; i < src.length; i++) {
    const c = src[i], prev = src[i - 1];
    if (inStr) { if (c === inStr && prev !== '\\') inStr = null; continue; }
    if (c === '"' || c === "'" || c === '`') { inStr = c; continue; }
    if (c === '/' && src[i + 1] === '/') { const nl = src.indexOf('\n', i); i = nl === -1 ? src.length : nl; continue; }
    if (c === '/' && src[i + 1] === '*') { const end = src.indexOf('*/', i + 2); i = end === -1 ? src.length : end + 1; continue; }
    if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) return { body: src.slice(openIdx + 1, i), end: i + 1 }; }
  }
  throw new Error('unbalanced braces while scanning O.G');
}

function splitTopLevelEntries(body) {
  const entries = [];
  let depth = 0, start = 0, inStr = null;
  for (let i = 0; i < body.length; i++) {
    const c = body[i], prev = body[i - 1];
    if (inStr) { if (c === inStr && prev !== '\\') inStr = null; continue; }
    if (c === '"' || c === "'" || c === '`') { inStr = c; continue; }
    if (c === '/' && body[i + 1] === '/') { const nl = body.indexOf('\n', i); i = nl === -1 ? body.length : nl; continue; }
    if (c === '/' && body[i + 1] === '*') { const end = body.indexOf('*/', i + 2); i = end === -1 ? body.length : end + 1; continue; }
    if ('{(['.includes(c)) depth++;
    else if ('})]'.includes(c)) depth--;
    else if (c === ',' && depth === 0) { entries.push(body.slice(start, i)); start = i + 1; }
  }
  const last = body.slice(start).trim();
  if (last) entries.push(last);
  return entries;
}

function parseEntry(entry) {
  const s = entry.replace(/^(\s*\/\/[^\n]*\n|\s*\/\*[\s\S]*?\*\/)+/, '').trimStart();
  const m = /^(\w+)\s*:\s*/.exec(s);
  if (!m) return null;
  return { name: m[1], value: s.slice(m[0].length).trim() };
}

function extractGestureEntries(src) {
  const marker = 'O.G = {';
  const idx = src.indexOf(marker);
  if (idx === -1) throw new Error('O.G object not found in gestures.js');
  const openIdx = idx + marker.length - 1;
  const { body } = extractBalanced(src, openIdx);
  return splitTopLevelEntries(body).map(parseEntry).filter(Boolean);
}

function loadMeta(gesturesSrc) {
  const metaPath = path.resolve('src/engine/meta.js');
  if (fs.existsSync(metaPath)) {
    try {
      const code = fs.readFileSync(metaPath, 'utf8');
      const mod = { exports: {} };
      new Function('module', 'exports', 'require', code)(mod, mod.exports, require);
      return { meta: mod.exports, real: true };
    } catch (e) {
      console.warn(`meta.js present but failed to load (${e.message}); falling back to gesture names from gestures.js`);
    }
  }
  const meta = {};
  extractGestureEntries(gesturesSrc).forEach(({ name }) => {
    meta[name] = { family: 'unsorted', doc: '', actors: 1, params: {} };
  });
  return { meta, real: false };
}

async function buildMetaAndSizes() {
  const gesturesSrc = fs.readFileSync('src/engine/gestures.js', 'utf8');
  const { meta, real } = loadMeta(gesturesSrc);
  fs.writeFileSync('dist/meta.json', JSON.stringify(meta));
  console.log(`meta.json: ${real ? 'from src/engine/meta.js' : 'FALLBACK (meta.js not found yet) - gesture names only, empty params'}, ${Object.keys(meta).length} gestures`);

  const entries = extractGestureEntries(gesturesSrc);
  const sizes = {};
  for (const { name, value } of entries) {
    const wrapped = `const g = ${value};`;
    let min;
    try { min = await js(wrapped); } catch (e) { console.warn(`sizes.json: could not minify gesture "${name}" alone (${e.message}); using raw length`); min = wrapped; }
    sizes[name] = gzip(min);
  }
  fs.writeFileSync('dist/sizes.json', JSON.stringify(sizes));
  console.log(`sizes.json: ${entries.length} gestures measured individually`);
}

async function buildPlaygroundPage() {
  let html = fs.readFileSync('src/playground.html', 'utf8');
  html = html.replace(/<style>([\s\S]*?)<\/style>/, (m, code) => '<style>' + css(code) + '</style>');
  const scriptMatch = /<script>([\s\S]*?)<\/script>/.exec(html);
  if (scriptMatch) {
    const minified = await js(scriptMatch[1]);
    html = html.replace(scriptMatch[0], '<script>' + minified + '</script>');
  }
  html = html.replace(/\n\s+/g, '\n').replace(/\n+/g, '\n');
  fs.writeFileSync('dist/playground.html', html);
  console.log(`playground.html: ${html.length} bytes, ${gzip(html)} bytes gzipped (dev tool, no size gate)`);
}

async function buildNewSite() {
  fs.mkdirSync('dist', { recursive: true });

  const engineMin = await buildEngine();
  fs.writeFileSync('dist/engine.js', engineMin);
  const engineGz = gzip(engineMin);
  console.log(`engine.js: ${engineMin.length} bytes, ${engineGz} bytes gzipped, limit ${LIMITS.engine}, ${LIMITS.engine - engineGz} spare`);

  const synthMin = await js(fs.readFileSync('src/engine/synth.js', 'utf8'));
  console.log(`synth.js (standalone measure): ${synthMin.length} bytes, ${gzip(synthMin)} bytes gzipped`);

  const shellTpl = await buildShellTemplate();
  const shellGz = gzip(shellTpl.replace('%%BYTES%%', '0'));
  console.log(`shell.html: ${shellTpl.length} bytes, ${shellGz} bytes gzipped`);

  let fail = false;
  if (engineGz > LIMITS.engine) fail = true;

  let siteTotal = engineGz + shellGz;
  const operaDir = 'operas';
  const operaFiles = fs.existsSync(operaDir) ? fs.readdirSync(operaDir).filter((f) => f.endsWith('.js')) : [];

  for (const file of operaFiles) {
    const name = path.basename(file, '.js');
    const raw = fs.readFileSync(`${operaDir}/${file}`, 'utf8');
    const operaMin = await js(raw);
    fs.writeFileSync(`dist/${name}.js`, operaMin);
    const operaGz = gzip(operaMin);
    siteTotal += operaGz;
    console.log(`${name}.js: ${operaMin.length} bytes, ${operaGz} bytes gzipped, limit ${LIMITS.opera}, ${LIMITS.opera - operaGz} spare`);
    if (operaGz > LIMITS.opera) fail = true;

    const siteBytes = engineGz + shellGz + operaGz;
    const sitePage = shellTpl.replace('OPERA.js', `${name}.js`).replace('%%BYTES%%', String(siteBytes));
    fs.writeFileSync(`dist/${name}.html`, sitePage);

    const standaloneTpl = shellTpl
      .replace('<script src="engine.js"></script>', `<script>${engineMin}</script>`)
      .replace('<script src="OPERA.js"></script>', `<script>${operaMin}</script>`);
    // two-pass: badge shows the standalone file's own gzipped size
    const draftGz = gzip(standaloneTpl.replace('%%BYTES%%', '0'));
    const standalone = standaloneTpl.replace('%%BYTES%%', String(draftGz));
    fs.writeFileSync(`dist/${name}.standalone.html`, standalone);
    const standaloneGz = gzip(standalone);
    console.log(`${name}.standalone.html: ${standalone.length} bytes, ${standaloneGz} bytes gzipped, limit ${LIMITS.standalone}, ${LIMITS.standalone - standaloneGz} spare`);
    if (standaloneGz > LIMITS.standalone) fail = true;
  }

  console.log(`site total (engine + shell + all operas): ${siteTotal} bytes gzipped`);

  await buildMetaAndSizes();
  if (fs.existsSync('src/playground.html')) await buildPlaygroundPage();

  return !fail;
}

(async () => {
  const originalOk = await buildOriginalSite();
  const newOk = await buildNewSite();
  if (!originalOk || !newOk) process.exit(1);
})();
