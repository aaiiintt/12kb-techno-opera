// Review panel server. Node built-in http only, no framework, no new deps.
// Serves review/index.html at /, dist/ under /dist/, .review/ under /review/.
// POST /note, POST /choose, POST /cancel — see docs/panel.md for the spec.
const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const OPERAS_DIR = path.join(ROOT, 'operas');
const DIST_DIR = path.join(ROOT, 'dist');
const REVIEW_DIR = path.join(ROOT, '.review');
const DOCS_REVIEW_DIR = path.join(ROOT, 'docs', 'review');
const SYNTH_PATH = path.join(ROOT, 'src', 'engine', 'synth.js');
const MUSIC_GUIDE_PATH = path.join(ROOT, 'docs', 'music-guide.md');
const ENGINE_API_PATH = path.join(ROOT, 'docs', 'engine-api.md');
const STORIES_PATH = path.join(ROOT, 'docs', 'stories.md');
const SYSTEM_PROMPT_PATH = path.join(__dirname, 'prompt.md');

const OPERA_BUDGET = 2048;
const ENGINE_BUDGET = 10240;
const PORT = Number(process.env.PORT) || 5173;

fs.mkdirSync(REVIEW_DIR, { recursive: true });
fs.mkdirSync(DOCS_REVIEW_DIR, { recursive: true });

// note+alternatives waiting for a /choose or /cancel, keyed by opera id.
const pending = new Map();

// ---- small helpers ----

const gzipLen = (buf) => zlib.gzipSync(Buffer.isBuffer(buf) ? buf : Buffer.from(buf), { level: 9 }).length;

function readIfExists(p) {
  try { return fs.readFileSync(p, 'utf8'); } catch { return null; }
}

function runBuild() {
  execFileSync('node', ['build.js'], { cwd: ROOT, stdio: 'pipe' });
}

// Fixed row order: scratch first, then whatever else exists in operas/*.js,
// alphabetically. Excludes the __preview* temp files this server writes
// while building alternatives.
function listOperaIds() {
  const files = fs.existsSync(OPERAS_DIR)
    ? fs.readdirSync(OPERAS_DIR).filter((f) => f.endsWith('.js') && !f.startsWith('__'))
    : [];
  const ids = files.map((f) => path.basename(f, '.js'));
  ids.sort((a, b) => {
    if (a === 'scratch') return -1;
    if (b === 'scratch') return 1;
    return a.localeCompare(b);
  });
  return ids;
}

function operaTitle(id) {
  const raw = readIfExists(path.join(OPERAS_DIR, `${id}.js`));
  if (!raw) return id.toUpperCase();
  const m = /title:\s*'([^']*)'/.exec(raw);
  return m ? m[1] : id.toUpperCase();
}

function operaBytes(id) {
  const p = path.join(DIST_DIR, `${id}.js`);
  const raw = readIfExists(p);
  return raw == null ? null : gzipLen(raw);
}

// Extract the story card section for an opera from docs/stories.md, if any.
// Cards are level-3 headings, e.g. "### CARMEN (French, tragedy)".
function storyCard(id) {
  const md = readIfExists(STORIES_PATH);
  if (!md) return null;
  const name = id.toUpperCase();
  const lines = md.split('\n');
  let start = -1, end = lines.length;
  for (let i = 0; i < lines.length; i++) {
    if (start === -1 && /^###\s+/.test(lines[i]) && lines[i].toUpperCase().includes(name)) { start = i; continue; }
    if (start !== -1 && /^###\s+/.test(lines[i])) { end = i; break; }
  }
  if (start === -1) return null;
  return lines.slice(start, end).join('\n').trim();
}

function threadLog(id) {
  return readIfExists(path.join(DOCS_REVIEW_DIR, `${id}.md`));
}

// ---- prompt assembly (exact order from docs/panel.md's diagram) ----

function assemblePrompt({ opera, currentFile, note }) {
  const parts = [];
  parts.push('## docs/music-guide.md\n\n' + fs.readFileSync(MUSIC_GUIDE_PATH, 'utf8'));
  parts.push('## docs/engine-api.md\n\n' + fs.readFileSync(ENGINE_API_PATH, 'utf8'));
  if (opera !== 'house') {
    const card = storyCard(opera);
    parts.push(card ? `## Story card for ${opera}\n\n${card}` : `## Story card for ${opera}\n\n(none — no story card exists for this opera yet)`);
  }
  parts.push(
    opera === 'house'
      ? `## Current src/engine/synth.js\n\n\`\`\`js\n${currentFile}\n\`\`\``
      : `## Current operas/${opera}.js\n\n\`\`\`js\n${currentFile}\n\`\`\``
  );
  const log = threadLog(opera);
  parts.push(log ? `## Thread log so far (docs/review/${opera}.md)\n\n${log}` : `## Thread log so far\n\n(none yet — this is the first note on ${opera})`);
  parts.push(`## The note\n\n${note}`);
  return parts.join('\n\n---\n\n');
}

function pickModel(note) {
  return /^\s*think harder/i.test(note) ? 'claude-fable-5-1' : 'sonnet';
}

// ---- calling claude -p ----

function extractJSON(text) {
  try { return JSON.parse(text); } catch {}
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) throw new Error('no JSON object found in agent output');
  return JSON.parse(text.slice(start, end + 1));
}

function callAgent({ opera, currentFile, note }) {
  const model = pickModel(note);
  const systemPrompt = fs.readFileSync(SYSTEM_PROMPT_PATH, 'utf8');
  const userPrompt = assemblePrompt({ opera, currentFile, note });

  const args = [
    '-p', '--model', model,
    '--output-format', 'json',
    '--system-prompt', systemPrompt,
    // The call only returns JSON text; it needs no tools and no permissions.
    '--disallowedTools', 'Bash', 'Edit', 'Write', 'WebFetch', 'WebSearch', 'Agent',
  ];

  let raw;
  try {
    raw = execFileSync('claude', args, {
      cwd: ROOT,
      input: userPrompt,
      maxBuffer: 32 * 1024 * 1024,
      encoding: 'utf8',
    });
  } catch (e) {
    throw new Error(`claude -p failed: ${e.stderr || e.message}`);
  }

  const envelope = extractJSON(raw);
  const resultText = typeof envelope.result === 'string' ? envelope.result : JSON.stringify(envelope);
  const parsed = extractJSON(resultText);
  if (!parsed || !Array.isArray(parsed.alternatives)) throw new Error('agent did not return {alternatives: [...]}');
  return { model, alternatives: parsed.alternatives };
}

// ---- building a candidate opera file into a preview ----

async function buildOperaPreview(opera, id, fileText) {
  const outDir = path.join(REVIEW_DIR, opera);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, `${id}.src.js`), fileText); // for /choose

  const previewName = `__preview_${opera}_${id}`;
  const operaPath = path.join(OPERAS_DIR, `${previewName}.js`);
  fs.writeFileSync(operaPath, fileText);
  let bytes = null, error = null;
  try {
    runBuild();
    const min = readIfExists(path.join(DIST_DIR, `${previewName}.js`));
    if (min == null) throw new Error('build did not produce a dist file');
    bytes = gzipLen(min);
  } catch (e) {
    error = e.message;
  }

  let url = null;
  if (!error) {
    const html = readIfExists(path.join(DIST_DIR, `${previewName}.html`));
    const min = readIfExists(path.join(DIST_DIR, `${previewName}.js`));
    fs.writeFileSync(path.join(outDir, `${id}.min.js`), min);
    const rewritten = html
      .replace('<script src="engine.js"></script>', '<script src="/dist/engine.js"></script>')
      .replace(`<script src="${previewName}.js"></script>`, `<script src="${id}.min.js"></script>`);
    fs.writeFileSync(path.join(outDir, `${id}.html`), rewritten);
    url = `/review/${opera}/${id}.html`;
  }

  // clean up the temp opera and its dist output
  for (const f of [operaPath, path.join(DIST_DIR, `${previewName}.js`), path.join(DIST_DIR, `${previewName}.html`), path.join(DIST_DIR, `${previewName}.standalone.html`)]) {
    try { fs.unlinkSync(f); } catch {}
  }

  return { bytes, url, error, budget: OPERA_BUDGET };
}

// ---- house note: diff-guard + build a candidate synth.js into a preview ----

function extractInstBlock(src) {
  const idx = src.indexOf('O.inst = {');
  if (idx === -1) return null;
  let depth = 0, i = idx + 'O.inst = {'.length - 1;
  for (; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') { depth--; if (depth === 0) { i++; break; } }
  }
  return src.slice(idx, i);
}

function extractRoomDefaultsLines(src) {
  const lines = src.split('\n');
  return lines.filter((l) => l.includes('lp.frequency.value') || (l.includes('fbL.gain.value') && l.includes('fbR.gain.value')));
}

// Confirms a candidate synth.js changes only O.inst and the room defaults.
function synthDiffOk(original, candidate) {
  const stripInstAndRoom = (src) => {
    const inst = extractInstBlock(src);
    let s = inst ? src.replace(inst, '@@INST@@') : src;
    for (const line of extractRoomDefaultsLines(s)) s = s.replace(line, '@@ROOM@@');
    return s;
  };
  return stripInstAndRoom(original) === stripInstAndRoom(candidate);
}

async function buildHousePreview(id, fileText, originalSynth) {
  const outDir = path.join(REVIEW_DIR, 'house');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, `${id}.src.js`), fileText); // for /choose

  if (!synthDiffOk(originalSynth, fileText)) {
    return { bytes: null, url: null, error: 'rejected: changed something outside O.inst and the room defaults', budget: ENGINE_BUDGET };
  }

  fs.writeFileSync(SYNTH_PATH, fileText);
  let bytes = null, error = null;
  try {
    runBuild();
    const engineMin = readIfExists(path.join(DIST_DIR, 'engine.js'));
    if (engineMin == null) throw new Error('build did not produce dist/engine.js');
    bytes = gzipLen(engineMin);
  } catch (e) {
    error = e.message;
  } finally {
    fs.writeFileSync(SYNTH_PATH, originalSynth); // restore immediately, always
  }

  let url = null;
  if (!error) {
    const engineMin = readIfExists(path.join(DIST_DIR, 'engine.js'));
    fs.writeFileSync(path.join(outDir, `${id}-engine.js`), engineMin);
    const scratchHtml = readIfExists(path.join(DIST_DIR, 'scratch.html'));
    if (scratchHtml) {
      const rewritten = scratchHtml.replace('<script src="engine.js"></script>', `<script src="/review/house/${id}-engine.js"></script>`);
      fs.writeFileSync(path.join(outDir, `${id}.html`), rewritten);
      url = `/review/house/${id}.html?scale`;
    }
  }

  // rebuild once more with the real synth.js so dist/ reflects committed reality
  try { runBuild(); } catch {}

  return { bytes, url, error, budget: ENGINE_BUDGET };
}

// ---- HTTP plumbing ----

const MIME = { '.html': 'text/html', '.js': 'application/javascript', '.json': 'application/json', '.css': 'text/css' };

function serveFile(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('not found'); return; }
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (c) => { body += c; if (body.length > 5 * 1024 * 1024) req.destroy(); });
    req.on('end', () => { try { resolve(body ? JSON.parse(body) : {}); } catch (e) { reject(e); } });
    req.on('error', reject);
  });
}

function sendJSON(res, status, obj) {
  const data = JSON.stringify(obj);
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(data);
}

function appendLog(opera, note, model, alternatives, chosenId) {
  const logPath = path.join(DOCS_REVIEW_DIR, `${opera}.md`);
  const existing = readIfExists(logPath) || `# Review log: ${opera}\n`;
  const date = new Date().toISOString().slice(0, 10);
  const lines = [`\n## ${date}`, '', `Note: ${note}`, `Model: ${model}`, ''];
  for (const alt of alternatives) lines.push(`- [${alt.id}] ${alt.description}${alt.id === chosenId ? '  ← chosen' : ''}`);
  lines.push('');
  fs.writeFileSync(logPath, existing + lines.join('\n'));
}

async function handleNote(req, res) {
  let body;
  try { body = await readBody(req); } catch { return sendJSON(res, 400, { error: 'bad JSON body' }); }
  const { opera, text } = body;
  if (!opera || !text) return sendJSON(res, 400, { error: 'opera and text are required' });

  let currentFile;
  if (opera === 'house') {
    currentFile = readIfExists(SYNTH_PATH);
  } else {
    currentFile = readIfExists(path.join(OPERAS_DIR, `${opera}.js`));
  }
  if (currentFile == null) return sendJSON(res, 404, { error: `no current file for ${opera}` });

  let agentResult;
  try {
    agentResult = callAgent({ opera, currentFile, note: text });
  } catch (e) {
    return sendJSON(res, 502, { error: e.message });
  }

  const results = [];
  for (const alt of agentResult.alternatives.slice(0, 3)) {
    const id = alt.id || String.fromCharCode(97 + results.length);
    let built;
    if (opera === 'house') built = await buildHousePreview(id, alt.file, currentFile);
    else built = await buildOperaPreview(opera, id, alt.file);

    let description = alt.description || '';
    if (built.error) description += `  [rejected: ${built.error}]`;
    else if (built.bytes != null && built.bytes > built.budget) description += `  [over budget: ${built.bytes} B]`;

    results.push({ id, description, rationale: alt.rationale || '', bytes: built.bytes, url: built.url });
  }

  pending.set(opera, { note: text, model: agentResult.model, alternatives: results });
  sendJSON(res, 200, { alternatives: results });
}

async function handleChoose(req, res) {
  let body;
  try { body = await readBody(req); } catch { return sendJSON(res, 400, { error: 'bad JSON body' }); }
  const { opera, id } = body;
  const p = pending.get(opera);
  if (!p) return sendJSON(res, 400, { error: `no pending alternatives for ${opera}` });

  // The chosen alternative's full source text was written to .review/ at
  // /note time as <id>.src.js, for both opera and house notes.
  const srcPath = opera === 'house'
    ? path.join(REVIEW_DIR, 'house', `${id}.src.js`)
    : path.join(REVIEW_DIR, opera, `${id}.src.js`);
  const source = readIfExists(srcPath);
  if (source == null) return sendJSON(res, 404, { error: `no stored source for ${opera}/${id}` });

  const target = opera === 'house' ? SYNTH_PATH : path.join(OPERAS_DIR, `${opera}.js`);
  fs.writeFileSync(target, source);
  try { runBuild(); } catch (e) { return sendJSON(res, 500, { error: `rebuild failed: ${e.message}` }); }

  appendLog(opera, p.note, p.model, p.alternatives, id);

  const bytesPath = opera === 'house' ? path.join(DIST_DIR, 'engine.js') : path.join(DIST_DIR, `${opera}.js`);
  const bytes = gzipLen(readIfExists(bytesPath));

  try { fs.rmSync(path.join(REVIEW_DIR, opera), { recursive: true, force: true }); } catch {}
  pending.delete(opera);
  sendJSON(res, 200, { bytes });
}

async function handleCancel(req, res) {
  let body;
  try { body = await readBody(req); } catch { return sendJSON(res, 400, { error: 'bad JSON body' }); }
  const { opera } = body;
  try { fs.rmSync(path.join(REVIEW_DIR, opera), { recursive: true, force: true }); } catch {}
  pending.delete(opera);
  sendJSON(res, 200, { ok: true });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  try {
    if (req.method === 'GET' && url.pathname === '/') return serveFile(res, path.join(__dirname, 'index.html'));
    if (req.method === 'GET' && url.pathname === '/operas') {
      const ids = listOperaIds();
      return sendJSON(res, 200, ids.map((id) => ({ id, title: operaTitle(id), bytes: operaBytes(id) })));
    }
    if (req.method === 'GET' && url.pathname.startsWith('/dist/')) return serveFile(res, path.join(DIST_DIR, url.pathname.slice('/dist/'.length)));
    if (req.method === 'GET' && url.pathname.startsWith('/review/')) return serveFile(res, path.join(REVIEW_DIR, url.pathname.slice('/review/'.length)));
    if (req.method === 'POST' && url.pathname === '/note') return await handleNote(req, res);
    if (req.method === 'POST' && url.pathname === '/choose') return await handleChoose(req, res);
    if (req.method === 'POST' && url.pathname === '/cancel') return await handleCancel(req, res);
    res.writeHead(404); res.end('not found');
  } catch (e) {
    sendJSON(res, 500, { error: e.message });
  }
});

server.listen(PORT, () => console.log(`review panel: http://localhost:${PORT}`));
