const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { minify } = require('terser');
const CleanCSS = require('clean-css');

const ROOT_LIMIT = 12288;
const LIMITS = { engine: 12288, opera: 2048, standalone: 14336, index: 2048 };
const ENGINE_FILES = ['tween', 'synth', 'stage', 'score', 'index'].map((f) => `src/engine/${f}.js`);

// Site order for the index: the eight shipped operas, in programme order.
// Anything with an id starting "scratch" is a dev demo and never appears here.
const SITE_ORDER = [
  { id: 'carmen', title: 'CARMEN', lang: 'French', short: 'Carmen' },
  { id: 'pagliacci', title: 'PAGLIACCI', lang: 'Italian', short: 'Pagliacci' },
  { id: 'rigoletto', title: 'RIGOLETTO', lang: 'Italian', short: 'Rigoletto' },
  { id: 'dido', title: 'DIDO AND AENEAS', lang: 'English', short: 'Dido' },
  { id: 'flute', title: 'DIE ZAUBERFLÖTE', lang: 'German', short: 'Flute' },
  { id: 'giovanni', title: 'DON GIOVANNI', lang: 'Italian', short: 'Giovanni' },
  { id: 'barber', title: 'IL BARBIERE DI SIVIGLIA', lang: 'Italian', short: 'Barber' },
  { id: 'turandot', title: 'TURANDOT', lang: 'Italian', short: 'Turandot' },
];

// --only <operaId>: fast path for the review panel. Skips the original-site
// build, reuses dist/engine.js when it already exists, and builds just that
// one opera's three dist files, printing and gating only on those. No flag:
// behaviour is unchanged.
const argv = process.argv.slice(2);
const onlyIdx = argv.indexOf('--only');
const ONLY = onlyIdx !== -1 ? argv[onlyIdx + 1] : null;

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

async function buildIndexPage(operaList, siteTotalGz) {
  let html = fs.readFileSync('src/site.html', 'utf8');

  const strapKB = Math.ceil(siteTotalGz / 1024);
  html = html.replace('%%STRAP%%', `EIGHT OPERAS. ONE GRID. UNDER ${strapKB} KB.`);

  const rows = operaList
    .map(
      (o, i) =>
        `<li><a class="op" href="${o.id}.html"><span class="no">${i + 1}</span><span class="ti">${o.title}</span><span class="la">${o.lang}</span><span class="sz">${o.gz} B</span></a></li>`
    )
    .join('');
  html = html.replace('%%LIST%%', rows);

  const dl =
    'Standalone: ' +
    operaList.map((o) => `<a href="${o.id}.standalone.html">${o.short}</a>`).join(', ') +
    ' · <a href="about.html">About</a>';
  html = html.replace('%%DL%%', dl);

  html = html.replace(/<style>([\s\S]*?)<\/style>/, (m, code) => '<style>' + css(code) + '</style>');
  html = html.replace(/\n\s+/g, '\n').replace(/\n+/g, '\n');
  return html;
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

  const operaDir = 'operas';
  const operaFiles = fs.existsSync(operaDir) ? fs.readdirSync(operaDir).filter((f) => f.endsWith('.js')) : [];
  const operaGzById = {};

  for (const file of operaFiles) {
    const name = path.basename(file, '.js');
    const raw = fs.readFileSync(`${operaDir}/${file}`, 'utf8');
    const operaMin = await js(raw);
    fs.writeFileSync(`dist/${name}.js`, operaMin);
    const operaGz = gzip(operaMin);
    operaGzById[name] = operaGz;
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

  // The index lists only operas whose file actually exists; a SITE_ORDER id
  // with no operas/<id>.js (kept in archive for a redraft) is skipped, not
  // a build failure.
  const shipped = SITE_ORDER.filter((o) => o.id in operaGzById);
  const siteTotal = engineGz + shellGz + shipped.reduce((sum, o) => sum + operaGzById[o.id], 0);
  console.log(`site total (engine + shell + ${shipped.length} opera${shipped.length === 1 ? '' : 's'}): ${siteTotal} bytes gzipped`);

  const operaList = shipped.map((o) => ({ ...o, gz: operaGzById[o.id] }));
  const indexHtml = await buildIndexPage(operaList, siteTotal);
  fs.writeFileSync('dist/index.html', indexHtml);
  const indexGz = gzip(indexHtml);
  console.log(`index.html: ${indexHtml.length} bytes, ${indexGz} bytes gzipped, limit ${LIMITS.index}, ${LIMITS.index - indexGz} spare`);
  if (indexGz > LIMITS.index) fail = true;

  console.log(`series total (engine + shell + index + ${shipped.length} opera${shipped.length === 1 ? '' : 's'}): ${siteTotal + indexGz} bytes gzipped`);

  return !fail;
}

async function buildOnly(id) {
  fs.mkdirSync('dist', { recursive: true });

  const operaPath = path.join('operas', `${id}.js`);
  if (!fs.existsSync(operaPath)) {
    console.error(`--only ${id}: operas/${id}.js not found`);
    return false;
  }

  const enginePath = 'dist/engine.js';
  const engineMin = fs.existsSync(enginePath) ? fs.readFileSync(enginePath, 'utf8') : await buildEngine();
  if (!fs.existsSync(enginePath)) fs.writeFileSync(enginePath, engineMin);
  const engineGz = gzip(engineMin);

  const shellTpl = await buildShellTemplate();
  const shellGz = gzip(shellTpl.replace('%%BYTES%%', '0'));

  let fail = false;

  const raw = fs.readFileSync(operaPath, 'utf8');
  const operaMin = await js(raw);
  fs.writeFileSync(`dist/${id}.js`, operaMin);
  const operaGz = gzip(operaMin);
  console.log(`${id}.js: ${operaMin.length} bytes, ${operaGz} bytes gzipped, limit ${LIMITS.opera}, ${LIMITS.opera - operaGz} spare`);
  if (operaGz > LIMITS.opera) fail = true;

  const siteBytes = engineGz + shellGz + operaGz;
  const sitePage = shellTpl.replace('OPERA.js', `${id}.js`).replace('%%BYTES%%', String(siteBytes));
  fs.writeFileSync(`dist/${id}.html`, sitePage);

  const standaloneTpl = shellTpl
    .replace('<script src="engine.js"></script>', `<script>${engineMin}</script>`)
    .replace('<script src="OPERA.js"></script>', `<script>${operaMin}</script>`);
  const draftGz = gzip(standaloneTpl.replace('%%BYTES%%', '0'));
  const standalone = standaloneTpl.replace('%%BYTES%%', String(draftGz));
  fs.writeFileSync(`dist/${id}.standalone.html`, standalone);
  const standaloneGz = gzip(standalone);
  console.log(`${id}.standalone.html: ${standalone.length} bytes, ${standaloneGz} bytes gzipped, limit ${LIMITS.standalone}, ${LIMITS.standalone - standaloneGz} spare`);
  if (standaloneGz > LIMITS.standalone) fail = true;

  return !fail;
}

(async () => {
  if (ONLY) {
    const ok = await buildOnly(ONLY);
    if (!ok) process.exit(1);
    return;
  }
  const originalOk = await buildOriginalSite();
  const newOk = await buildNewSite();
  if (!originalOk || !newOk) process.exit(1);
})();
