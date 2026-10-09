/* The Gaz '89 shell: twelve very small games, one after another, one verb (walk).
   A level is data plus four small functions. GAZ.level({
     id, title,                  // 'bedroom', 'LAINDON BEDROOM'
     open: 'LINE',               // typed on the bottom bar while the picture holds (3 s); null for none
     side: false,                // true: side view, left and right only, feet on floorY
     floorY: 24,                 // side view: where the feet are
     speed: 44,                  // Gaz's walk in pixels a second (one speed for the whole game; a level may slow it)
     init(m),                    // the scene: set m.gx, m.gy (Gaz, bottom-left, world pixels), m.walls = [[x, y, w, h]],
                                 // m.goal = [x, y, w, h]; anything else on m. Called again after a fail.
     update(m),                  // during play. Return a string to fail with that tag beside Gaz; or call m.fail('TAG')
     render(m),                  // the picture, every phase; the shell draws Gaz after it (set m.gazHidden to draw him yourself)
     end: { seconds: 4, line: 'LINE', hold: false, init?(m), update?(m), render?(m) },  // the watched ending; hold: wait for a tap
     music: { loop: spec } | { bar(t, b, i) },   // scheduled a bar ahead, looping, through every phase
     bot(m) -> [dx, dy] | null,  // for the test: a direction (-1..1 each) or null to wait
   })
   Phases: OPEN (bars, the line, Gaz stands) -> PLAY (bars out, walk) -> END (bars in, the ending) -> next.
   A fail: a tag for a second, then init again; the tune never stops. No score, no lives, no timer.
   m: gx, gy, facing, walking, t (seconds in phase), phase, n (level index), fails, say(text, x, y),
      fail(tag), px/py (pointer, world), down (pointer held), left/right/up/down keys as dx, dy.
   Input: arrows or WASD; on touch, hold a finger where you want him to go and he walks toward it. */

'use strict';

const GAZ = {};
const GZ_OPEN = 0, GZ_PLAY = 1, GZ_FAIL = 2, GZ_END = 3, GZ_TITLE = 4;
const GZ_BAR = 18;
const gzLevels = [];
let gzN = 0, gzPhase = GZ_TITLE, gzPhaseAt = 0, gzBarsAt = 0, gzBarsScheduled = 0, gzTyped = 0;
const m = {};
const gzTags = [];
const gzQuery = new URLSearchParams(location.search);
const gzBot = gzQuery.get('bot') === '1';
const gzStartAt = Math.max(0, (parseInt(gzQuery.get('level'), 10) || 1) - 1);

GAZ.level = (L) => { gzLevels.push(L); };
GAZ.W = 256; GAZ.H = 144;
GAZ.GAZ_W = 24; GAZ.GAZ_H = 32;      // at 2x

GAZ.start = () => {
  PX.setup(256, 144);
  PX.SCALE = 2;
  setShowSplashScreen(false);
  setSoundVolume(0.5);
  setCanvasClearColor(PX.c('#000000'));
  setTouchGamepadEnable(false);
  setInputWASDEmulateDirection(true);
  engineInit(gzInit, gzUpdate, () => {}, gzRender, gzRenderPost);
};

function gzInit() {
  PX.initFont();
  PEOPLE.init();
  for (const L of gzLevels) L.sprites?.();
  PX.bake();
  S.init();
  gzPhase = GZ_TITLE; gzPhaseAt = S.now();
}

// ---- helpers for levels ----
GAZ.say = (text, x, y, colour = '#efe9df') => { const p = worldToScreen(vec2(x, y)); gzTags.push({ text, sx: Math.round(p.x), sy: Math.round(PX.H - p.y), colour }); };
GAZ.rect = (x, y, w, h, hex, a) => PX.rect(x, y, w, h, PX.c(hex, a));
GAZ.gazBox = () => m.side ? [m.gx, m.gy, GAZ.GAZ_W, GAZ.GAZ_H] : [m.gx + 2, m.gy, GAZ.GAZ_W - 4, 10];   // feet box when top-down
const gzHit = (a, b) => a[0] < b[0] + b[2] && a[0] + a[2] > b[0] && a[1] < b[1] + b[3] && a[1] + a[3] > b[1];
GAZ.hit = gzHit;
GAZ.drawGaz = (x = m.gx, y = m.gy) => PEOPLE.draw(PEOPLE.cast.gaz, x, y, { walking: m.walking, flip: m.facing < 0 });
GAZ.typed = (line, t) => line.slice(0, Math.min(line.length, Math.floor(t * 40)));

function gzStartLevel(n) {
  gzN = n;
  const L = gzLevels[n];
  for (const k of Object.keys(m)) delete m[k];
  m.n = n; m.L = L; m.t = 0; m.fails = 0; m.facing = 1; m.walking = false; m.side = !!L.side; m.speed = L.speed || 44; m.walls = []; m.goal = null;
  m.say = GAZ.say; m.fail = (tag) => { if (gzPhase === GZ_PLAY) gzFail(tag); };
  L.init(m);
  if (m.side && L.floorY != null) m.gy = L.floorY;
  gzPhase = L.open == null ? GZ_PLAY : GZ_OPEN; gzPhaseAt = S.now(); gzTyped = 0;
  gzBarsAt = S.now() + 0.05; gzBarsScheduled = 0;
  m.phase = gzPhase;
}
function gzFail(tag) {
  m.fails++; m.failTag = tag; gzPhase = GZ_FAIL; gzPhaseAt = S.now(); m.phase = gzPhase; m.walking = false;
  S.drum('kick', S.now(), 0.18); S.voice('bass', S.deg('1-'), S.now(), 0.25, { vol: 0.12 });
}
function gzEnd() {
  const L = m.L;
  gzPhase = GZ_END; gzPhaseAt = S.now(); gzTyped = 0; m.phase = gzPhase; m.walking = false;
  L.end?.init?.(m);
}
function gzNext() {
  if (gzN + 1 < gzLevels.length) gzStartLevel(gzN + 1);
  else { gzPhase = GZ_TITLE; gzPhaseAt = S.now(); m.phase = gzPhase; m.done = true; }
}

function gzMusic(now) {
  const L = m.L; if (!L || !L.music) return;
  const bpm = L.music.loop?.bpm || L.music.bpm || 120, b = 60 / bpm, bar = 4 * b;
  while (gzBarsAt + gzBarsScheduled * bar < now + 0.15 + bar * 0.5) {
    const t = gzBarsAt + gzBarsScheduled * bar;
    if (L.music.loop) LOOPS.play(L.music.loop, t, b, gzBarsScheduled);
    L.music.bar?.(t, b, gzBarsScheduled);
    gzBarsScheduled++;
  }
}

function gzReadInput() {
  const d = keyDirection();
  m.dx = d.x; m.dy = d.y;
  m.down = mouseIsDown(0); m.press = mouseWasPressed(0) || keyWasPressed('Space') || keyWasPressed('Enter');
  m.px = mousePos.x; m.py = mousePos.y;
  if (m.down && !m.dx && !m.dy) {
    // walk toward the finger
    const cx = m.gx + GAZ.GAZ_W / 2, cy = m.gy + (m.side ? 0 : 5);
    const ox = m.px - cx, oy = m.py - cy;
    if (Math.abs(ox) > 3) m.dx = Math.sign(ox);
    if (!m.side && Math.abs(oy) > 3) m.dy = Math.sign(oy);
  }
  if (gzBot && gzPhase === GZ_PLAY) { const r = m.L.bot?.(m); m.dx = r ? r[0] : 0; m.dy = r ? r[1] : 0; }
}

function gzMove() {
  let dx = m.dx, dy = m.side ? 0 : m.dy;
  if (dx && dy) { dx *= 0.71; dy *= 0.71; }
  m.walking = !!(dx || dy);
  if (dx) m.facing = Math.sign(dx);
  const sp = m.speed * timeDelta;
  const tryMove = (ax, ay) => {
    const box = GAZ.gazBox(); box[0] += ax; box[1] += ay;
    for (const w of m.walls) if (gzHit(box, w)) return false;
    m.gx += ax; m.gy += ay; return true;
  };
  if (dx) tryMove(dx * sp, 0);
  if (dy) tryMove(0, dy * sp);
  m.gx = clamp(m.gx, -4, PX.W - GAZ.GAZ_W + 4); m.gy = clamp(m.gy, 0, PX.H - GAZ.GAZ_H);
}

function gzReport() { window.__gaz = { level: gzN + 1, phase: gzPhase, t: m.t, x: m.gx, y: m.gy, fails: m.fails, levels: gzLevels.length, done: !!m.done }; }

function gzUpdate() {
  gzIntegerScale();
  const now = S.now();
  m.t = now - gzPhaseAt; m.phase = gzPhase;
  gzReadInput();
  if (gzPhase === GZ_TITLE) {
    if ((m.press || gzBot) && audioIsRunning() && !m.done) gzStartLevel(gzStartAt);
    gzReport(); return;
  }
  gzMusic(now);
  const L = m.L;
  if (gzPhase === GZ_OPEN) { if (m.t >= 3 || (m.t > 1 && m.press && !gzBot)) { gzPhase = GZ_PLAY; gzPhaseAt = now; m.phase = gzPhase; } }
  else if (gzPhase === GZ_PLAY) {
    gzMove();
    const r = L.update?.(m);
    if (gzPhase === GZ_PLAY && typeof r === 'string') gzFail(r);
    if (gzPhase === GZ_PLAY && m.goal && gzHit(GAZ.gazBox(), m.goal)) gzEnd();
  } else if (gzPhase === GZ_FAIL) {
    if (m.t >= 1) { L.init(m); if (m.side && L.floorY != null) m.gy = L.floorY; gzPhase = GZ_PLAY; gzPhaseAt = now; m.phase = gzPhase; }
  } else if (gzPhase === GZ_END) {
    L.end?.update?.(m);
    const secs = L.end?.seconds ?? 4;
    if (m.t >= secs) {
      if (L.end?.hold) { if (m.press || (gzBot && m.t > secs + 1)) gzNext(); }
      else if (m.press || gzBot || m.t >= secs + 6) gzNext();
    }
  }
  gzReport();
}

function gzIntegerScale() {
  const k = Math.max(1, Math.floor(Math.min(innerWidth / PX.W, innerHeight / PX.H)));
  const w = PX.W * k + 'px', h = PX.H * k + 'px';
  for (const cv of [mainCanvas, glCanvas]) if (cv && cv.style.width !== w) { cv.style.width = w; cv.style.height = h; }
}

function gzRender() {
  setCameraScale(1); setCameraPos(vec2(PX.W / 2, PX.H / 2));
  if (gzPhase === GZ_TITLE) return;
  const L = m.L;
  L.render(m);
  if (gzPhase === GZ_END && L.end?.render) L.end.render(m);
  else if (!m.gazHidden) GAZ.drawGaz();
}

function gzBars(k) { const h = Math.round(GZ_BAR * k); if (h <= 0) return; PX.rect(0, PX.H - h, PX.W, h, PX.c('#000000')); PX.rect(0, 0, PX.W, h, PX.c('#000000')); }
function gzLine(line, t) {
  const n = Math.min(line.length, Math.floor(t * 40));
  if (n > gzTyped) { if (n % 2 === 0) S.voice('pulse', S.deg('5+') + 12, S.now(), 0.03, { vol: 0.01 }); gzTyped = n; }
  PX.text(line.slice(0, n), PX.W / 2, 6, PX.c('#efe9df'), { align: 'center' });
}
function gzRenderPost() {
  PX.screen = true;
  for (const t of gzTags) {
    const w = PX.textWidth(t.text) + 4, sx = clamp(t.sx, 2, PX.W - w - 2), sy = clamp(t.sy, GZ_BAR + 2, PX.H - GZ_BAR - 8);
    PX.rect(sx - 2, sy - 2, w, 9, PX.c('#000000')); PX.text(t.text, sx, sy, PX.c(t.colour));
  }
  gzTags.length = 0;
  const L = m.L;
  if (gzPhase === GZ_TITLE) {
    gzBars(1);
    PX.rect(0, 0, PX.W, PX.H, PX.c('#000000'));
    PX.text("GAZ '89", PX.W / 2, PX.H / 2 + 2, PX.c('#efe9df'), { align: 'center', scale: 3 });
    if (!m.done) { if (Math.floor(timeReal * 2) % 2 === 0) PX.text('TAP TO START', PX.W / 2, 6, PX.c('#efe9df'), { align: 'center' }); }
  } else if (gzPhase === GZ_OPEN) { gzBars(Math.min(1, m.t / 0.3)); if (L.open) gzLine(L.open, m.t - 0.3); }
  else if (gzPhase === GZ_PLAY) { const k = L.open == null ? 0 : Math.max(0, 1 - m.t / 0.3); gzBars(k); }
  else if (gzPhase === GZ_FAIL) { const p = worldToScreen(vec2(m.gx + 12, m.gy + 36)); if (m.failTag) { const w = PX.textWidth(m.failTag) + 4, sx = clamp(Math.round(p.x) - w / 2, 2, PX.W - w - 2); PX.rect(sx - 2, PX.H - p.y - 2, w, 9, PX.c('#000000')); PX.text(m.failTag, sx, PX.H - p.y, PX.c('#efe9df')); } }
  else if (gzPhase === GZ_END) {
    gzBars(Math.min(1, m.t / 0.3));
    const at = L.end?.lineAt ?? 1;
    if (L.end?.line && m.t > at) gzLine(L.end.line, m.t - at);
    const secs = L.end?.seconds ?? 4;
    if (m.t > secs && Math.floor(timeReal * 2) % 2 === 0 && !gzBot) PX.text(gzN + 1 < gzLevels.length ? 'TAP' : 'TAP', PX.W - 4, PX.H - 12, PX.c('#efe9df', 0.7), { align: 'right' });
  }
  PX.screen = false;
}
