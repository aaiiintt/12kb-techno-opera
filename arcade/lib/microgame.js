/* The microgame runner: WarioWare's architecture for an opera, with the story told between the games.
   An opera is a list of beats. Two kinds, plus a toy:

     WATCH   a cutscene: letterbox bars, a typed caption, no fuse, nothing to do.
             { watch: true, bpm, beats, captions: [[atSeconds, 'TEXT'], ...], render(m), update?(m), music: { bar(t, b, i) } }
     PLAY    a microgame on a beat grid on the audio clock:
               COMMAND  2 beats   the verb, the instruction line and the input icon, on a card
               ACTION   N beats   the game (8 to 16 beats), the fuse burning along the top
               OUTCOME  4 beats   bravo or tragedy, bars in, the line on the bottom bar (at least 3.5 s)
             { name, command: 'CATCH!', instruction: 'DRAG TO CATCH THE FLOWER', verb: 'tap'|'mash'|'hold'|'drag',
               bpm, beats, cue(m) -> [x, y] where the icon sits until the first input,
               init(m), update(m), render(m), outcome(m) -> [lines], onOutcome?, updateOutcome?, renderOutcome?,
               music: { curtain(t, b), bar(t, b, i), outcome(t, b, won) }, shot, focus, outcomeSeconds }
     TOY     { toy: true, ... } a PLAY with no command card, no fuse and no verdict: seconds of feeling.
             It gets the icon once (cue) and its outcome line in the ink colour.

   After the last beat, a result card: bravos out of the games and the ending. Failure is never a game
   over; it is the other version of the scene, and the caption states the same story fact either way.

   Input is direct: tap or drag anywhere (mouse or touch), Space/Enter and the arrows on a keyboard.
   m.press (this frame), m.hold (held), m.down (pointer held), m.px / m.py (pointer, world units),
   m.left / m.right (arrows held). MG.drag moves a character under the pointer or with the arrows.
   shot: 'wide' | 'mid' | 'close' and focus(m) -> [x, y] as before; m.cut(shot, x, y) during a beat.
   m.t seconds into the phase, m.beat, m.frac, m.phase, m.won, m.done, m.act, m.i, m.len (phase seconds).
   The runner draws the bars, the captions, the fuse, the card, the icons, the marks and the result. */

'use strict';

const MG = {};

const MG_TITLE = 0, MG_WATCH = 1, MG_COMMAND = 2, MG_ACTION = 3, MG_OUTCOME = 4, MG_RESULT = 5;
const MG_LOOKAHEAD = 0.12;   // seconds ahead of the audio clock that music is scheduled
const MG_BAR = 20;           // the letterbox bars, in pixels

let mgOpera = null;
let mgPhase = MG_TITLE;
let mgPhaseStart = 0;        // audio time the phase began
let mgPhaseLen = 0;          // seconds
let mgActIndex = 0;
let mgBravos = 0;
let mgResults = [];
let mgBarsScheduled = 0;
let mgFlash = 0;
let mgTyped = 0;             // characters of the caption shown so far, for the tick
const m = {};                // the shared microgame state handed to acts
let SP_HAND = null;

const mgBeat = () => 60 / mgOpera.acts[mgActIndex].bpm;
const mgIsPlay = (a) => !a.watch && !a.toy;

MG.opera = (opera) => {
  mgOpera = opera;
  PX.setup(256, 144);
  setShowSplashScreen(false);
  setSoundVolume(0.5);
  setCanvasClearColor(PX.c(opera.colours.bg || '#000000'));
  setTouchGamepadEnable(false);
  setInputWASDEmulateDirection(true);
  engineInit(mgInit, mgUpdate, () => {}, mgRender, mgRenderPost);
};

// Review hooks. ?act=N starts at beat N (1-based) on the first press. ?force=w,l,w,...
// decides each game at 60% of its window (w wins, l loses, anything else plays).
// window.__mg reports {phase, act, t, len, won, bravos, playable, acts} for test/gallery.mjs.
const mgQuery = new URLSearchParams(location.search);
const mgForce = (mgQuery.get('force') || '').split(',');
const mgStartAt = Math.max(0, (parseInt(mgQuery.get('act'), 10) || 1) - 1);

function mgInit() {
  PX.initFont();
  // the pointing hand, the one input icon; animated four ways by the runner
  SP_HAND = PX.sprite(['..ww...', '..ww...', '..ww...', '..wwww.', '..wwwww', 'wwwwwww', '.wwwww.', '.wwwww.', '..www..'], { w: '#ffffff' });
  if (mgOpera.sprites) mgOpera.sprites();
  PX.bake();
  S.init();
  S.key(...mgOpera.key);
  setGravity(vec2(0, -0.02));       // for particles: they fall unless an emitter's gravityScale says otherwise
  mgPhase = MG_TITLE;
}

// ---- input: the keyboard, and the pointer (a touch is a pointer) ----
function mgReadInput() {
  const d = keyDirection();
  m.left = d.x < 0; m.right = d.x > 0;
  const tap = mouseWasPressed(0);
  m.press = keyWasPressed('Space') || keyWasPressed('Enter') || tap || gamepadWasPressed(0);
  m.hold = keyIsDown('Space') || keyIsDown('Enter') || mouseIsDown(0) || gamepadIsDown(0);
  m.tap = tap;
  m.down = mouseIsDown(0);
  m.px = mousePos.x; m.py = mousePos.y;
}

function mgStartPhase(phase, beats, minSeconds = 0) {
  mgPhase = phase;
  mgPhaseStart = Math.max(S.now(), mgPhaseStart + mgPhaseLen);
  mgPhaseLen = Math.max(beats * mgBeat(), minSeconds);
  m.phase = phase;
  m.len = mgPhaseLen;
  mgTyped = 0;
}

const MG_ZOOM = { wide: 1, mid: 2, close: 4 };
function mgApplyShot() {
  const zoom = MG_ZOOM[m.shotName] || 1;
  let [fx, fy] = m.focus || [PX.W / 2, PX.H / 2];
  // keep the frame on the stage
  const hw = PX.W / zoom / 2, hh = PX.H / zoom / 2;
  fx = clamp(fx, hw, PX.W - hw); fy = clamp(fy, hh, PX.H - hh);
  setCameraScale(zoom);
  setCameraPos(vec2(fx, fy));
}

function mgStartAct(i) {
  mgActIndex = i;
  engineObjectsDestroy();           // a beat's particle emitters do not outlive it
  for (const k of Object.keys(m)) delete m[k];
  m.i = i;
  const act = m.act = mgOpera.acts[i];
  m.shotName = act.shot || 'wide';
  m.cut = (shot, x, y) => { m.shotName = shot; if (x != null) { m.focus = [x, y]; m.cutFocus = true; } };
  m.beats = act.beats;
  m.won = false; m.done = false; m.cued = false;
  // a forced game (?force=) ignores the other verdict, so a gallery run is deterministic
  const forced = mgForce[i];
  const play = mgIsPlay(act);
  m.win = () => { if (!m.done && play && forced !== 'l') { m.done = true; m.won = true; } };
  m.lose = () => { if (!m.done && play && forced !== 'w') { m.done = true; m.won = false; } };
  m.W = PX.W; m.H = PX.H;
  act.init?.(m);
  mgPhaseLen = 0;
  mgPhaseStart = S.now() + 0.05;
  mgBarsScheduled = 0;
  const b = mgBeat();
  if (act.watch) { mgStartPhase(MG_WATCH, act.beats); act.music?.curtain?.(mgPhaseStart, b); }
  else if (act.toy) { mgStartPhase(MG_ACTION, act.beats); act.music?.curtain?.(mgPhaseStart, b); }
  else {
    mgStartPhase(MG_COMMAND, 2, 1.4);
    act.music?.curtain?.(mgPhaseStart, b);
    S.registerLight('curtain', mgPhaseStart, mgPhaseStart + 2 * b, (el) => Math.max(0, 1 - el / (2 * b)));
  }
}

function mgReport() {
  window.__mg = { phase: mgPhase, act: mgActIndex, t: m.t, len: mgPhaseLen, won: m.won, bravos: mgBravos,
    playable: mgOpera.acts.filter(mgIsPlay).length, acts: mgOpera.acts.length };
}
function mgIntegerScale() {
  // the engine stretches a fixed-size canvas to the window; snap that to a whole number of
  // screen pixels per canvas pixel, or a 256-wide picture at 4.3x has uneven pixels
  const k = Math.max(1, Math.floor(Math.min(innerWidth / PX.W, innerHeight / PX.H)));
  const w = PX.W * k + 'px', h = PX.H * k + 'px';
  for (const cv of [mainCanvas, glCanvas]) if (cv && cv.style.width !== w) { cv.style.width = w; cv.style.height = h; }
}

// schedule the beat's music one bar at a time, a little ahead of the clock
function mgScheduleBars(now) {
  const b = mgBeat(), barLen = 4 * b;
  while (mgBarsScheduled * barLen < m.beats * b && mgPhaseStart + mgBarsScheduled * barLen < now + MG_LOOKAHEAD + barLen * 0.5) {
    m.act.music?.bar?.(mgPhaseStart + mgBarsScheduled * barLen, b, mgBarsScheduled);
    mgBarsScheduled++;
  }
}

function mgNext() {
  if (mgActIndex + 1 < mgOpera.acts.length) mgStartAct(mgActIndex + 1);
  else { mgPhase = MG_RESULT; mgPhaseStart = S.now(); mgPhaseLen = 0; m.phase = MG_RESULT; mgOpera.music?.result?.(S.now(), mgBravos); }
}

function mgUpdate() {
  mgIntegerScale();
  mgReadInput();
  const now = S.now();
  m.t = now - mgPhaseStart;
  m.beat = m.t / mgBeat();
  m.phase = mgPhase;
  mgFlash = Math.max(0, mgFlash - timeDelta * 4);

  if (mgPhase === MG_TITLE) {
    if (m.press && audioIsRunning()) { mgBravos = 0; mgResults = []; mgStartAct(mgStartAt); }
    mgReport();
    return;
  }
  if (mgPhase === MG_RESULT) {
    if (m.t > 1.5 && m.press) { mgPhase = MG_TITLE; mgPhaseStart = now; }
    mgReport();
    return;
  }
  if (mgPhase === MG_WATCH) {
    mgScheduleBars(now);
    m.act.update?.(m);
    if (m.t >= mgPhaseLen) mgNext();
    mgReport();
    return;
  }
  if (mgPhase === MG_COMMAND) {
    if (m.t >= mgPhaseLen) { mgStartPhase(MG_ACTION, m.beats); mgFlash = 1; }
    mgReport();
    return;
  }
  if (mgPhase === MG_ACTION) {
    const b = mgBeat();
    m.frac = Math.min(1, m.t / mgPhaseLen);
    mgScheduleBars(now);
    // the icon goes once the player has done the thing
    const v = m.act.verb;
    if (!m.cued && (v === 'hold' ? m.hold : v === 'drag' ? (m.down || m.left || m.right) : m.press)) m.cued = true;
    if (!m.done) m.act.update(m);
    const forced = mgForce[mgActIndex];
    if (!m.done && mgIsPlay(m.act) && m.frac >= 0.6 && (forced === 'w' || forced === 'l')) { m.done = true; m.won = forced === 'w'; }
    if (m.done || m.t >= mgPhaseLen) {
      if (!m.done) { m.done = true; m.won = !!m.timeoutWins; }
      // the outcome starts on the next beat, so the music lands
      const nextBeat = mgPhaseStart + Math.ceil(m.t / b + 0.001) * b;
      mgPhaseLen = nextBeat - mgPhaseStart;
      mgStartPhase(MG_OUTCOME, 4, m.act.outcomeSeconds ?? 3.5);
      if (m.act.toy) m.won = true;
      else { if (m.won) mgBravos++; mgResults.push(m.won); }
      m.line = m.act.outcome(m);
      m.act.music?.outcome?.(mgPhaseStart, b, m.won);
      m.act.onOutcome?.(m);
    }
    mgReport();
    return;
  }
  if (mgPhase === MG_OUTCOME) {
    m.act.updateOutcome?.(m);
    mgReport();
    if (m.t >= mgPhaseLen) mgNext();
  }
}

function mgRender() {
  const C = mgOpera.colours, ink = PX.c(C.ink || '#ffffff');
  const W = PX.W, H = PX.H;
  if (mgPhase === MG_TITLE || mgPhase === MG_RESULT) { setCameraScale(1); setCameraPos(vec2(W / 2, H / 2)); }
  if (mgPhase === MG_TITLE) {
    mgOpera.renderTitle?.(m);
    PX.text(mgOpera.title, W / 2, H / 2 + 8, ink, { align: 'center', scale: 3 });
    if (mgOpera.sub) PX.text(mgOpera.sub, W / 2, H / 2 - 4, PX.c(C.dim || '#888888'), { align: 'center' });
    return;
  }
  if (mgPhase === MG_RESULT) {
    mgOpera.renderResult?.(m, mgBravos);
    PX.text(mgOpera.title, W / 2, H - 22, ink, { align: 'center', scale: 2 });
    // one mark per game: lit for a bravo
    const n = mgResults.length;
    for (let i = 0; i < n; i++) {
      const x = W / 2 - n * 6 + i * 12 + 6;
      PX.rect(x - 4, H / 2 + 8, 8, 8, mgResults[i] ? PX.c(C.bravo || '#ffd23a') : PX.c(C.dim || '#444444'));
    }
    const playable = mgOpera.acts.filter(mgIsPlay).length;
    PX.text(`${mgBravos} BRAVO${mgBravos === 1 ? '' : 'S'} OF ${playable}`, W / 2, H / 2 - 6, ink, { align: 'center' });
    const lines = mgOpera.ending(m, mgBravos);
    lines.forEach((l, i) => PX.text(l, W / 2, H / 2 - 20 - i * 8, PX.c(C.dim || '#888888'), { align: 'center' }));
    return;
  }

  const act = m.act;
  if (act.focus && !m.cutFocus) m.focus = act.focus(m);
  mgApplyShot();
  act.render(m);
}

// the letterbox: bars in from the top and bottom over k (0..1)
function mgBars(k) {
  const h = Math.round(MG_BAR * k);
  if (h <= 0) return;
  const black = PX.c('#000000');
  PX.rect(0, PX.H - h, PX.W, h, black);
  PX.rect(0, 0, PX.W, h, black);
}
// lines on the bottom bar, centred; the last line lowest
function mgBarText(lines, col) {
  lines.forEach((l, i) => PX.text(l, PX.W / 2, 4 + (lines.length - 1 - i) * 8, col, { align: 'center' }));
}
// the caption of a WATCH beat: the latest one whose time has come, typed out
function mgCaption(act) {
  const caps = act.captions || [];
  let cap = null;
  for (const c of caps) if (m.t >= c[0]) cap = c;
  if (!cap) return;
  if (cap !== m.lastCap) { m.lastCap = cap; mgTyped = 0; }
  const n = Math.min(cap[1].length, Math.floor((m.t - cap[0]) * 40));
  if (n > mgTyped) { if (n % 2 === 0) S.voice('pulse', S.deg('5+') + 12, S.now(), 0.03, { vol: 0.012 }); mgTyped = n; }
  mgBarText([cap[1].slice(0, n)], PX.c(mgOpera.colours.ink || '#ffffff'));
}

// the input icon: the hand, animated by verb, at screen x, y (its bottom-left), t seconds
MG.cue = (x, y, verb, t, col = '#ffffff') => {
  const ink = PX.c(col), dim = PX.c(col, 0.5);
  if (verb === 'drag') {
    const dx = Math.round(Math.sin(t * 3) * 6);
    PX.rect(x - 6, y - 3, 19, 1, dim); PX.rect(x - 7, y - 2, 1, 1, dim); PX.rect(x - 7, y - 4, 1, 1, dim); PX.rect(x + 13, y - 2, 1, 1, dim); PX.rect(x + 13, y - 4, 1, 1, dim);
    PX.draw(SP_HAND, x + dx, y, { color: ink, scale: 1 });
    return;
  }
  if (verb === 'hold') {
    const k = (t % 1.6) / 1.6, f = Math.min(1, k / 0.7);
    PX.rect(x - 3, y - 4, 13, 3, dim);
    PX.rect(x - 3, y - 4, Math.round(13 * f), 3, ink);
    PX.draw(SP_HAND, x, y - 2, { color: ink, scale: 1 });
    return;
  }
  const rate = verb === 'mash' ? 4 : 1.5;
  const k = (t * rate) % 1;                  // 0..1 through one tap
  const down = k < 0.35 ? Math.round(Math.sin(k / 0.35 * PI) * 2) : 0;
  if (k < 0.5) {                             // the ripple on the tip
    const r = 2 + Math.round(k * 12), a = 1 - k * 2;
    const cx = x + 3, cy = y + 9 - down;
    const rc = PX.c(col, a * 0.7);
    PX.rect(cx - r, cy - r, r * 2, 1, rc); PX.rect(cx - r, cy + r, r * 2, 1, rc); PX.rect(cx - r, cy - r, 1, r * 2, rc); PX.rect(cx + r, cy - r, 1, r * 2 + 1, rc);
  }
  PX.draw(SP_HAND, x, y - down, { color: ink, scale: 1 });
};

function mgRenderPost() {
  // the HUD, drawn after the engine's objects (particles) so nothing covers it
  const C = mgOpera.colours, W = PX.W, H = PX.H, ink = PX.c(C.ink || '#ffffff');
  if (mgPhase === MG_TITLE || mgPhase === MG_RESULT) {
    mgDrawTags();
    PX.screen = true;
    const blink = Math.floor(timeReal * 2) % 2 === 0;
    mgBars(1);                        // the cards are watched too
    if (mgPhase === MG_TITLE || m.t > 1.5) {
      const label = mgPhase === MG_TITLE ? 'TAP TO BEGIN' : 'TAP TO PLAY AGAIN';
      const w = PX.textWidth(label) + 12;
      if (blink) PX.text(label, W / 2 - 6, 7, ink, { align: 'center' });
      MG.cue(W / 2 + w / 2 - 8, 4, 'tap', timeReal, C.ink || '#ffffff');
    }
    PX.screen = false;
    return;
  }
  const act = m.act;
  mgDrawTags();
  PX.screen = true;                 // everything below is HUD

  if (mgPhase === MG_WATCH) {
    mgBars(Math.min(1, m.t / 0.35));
    mgCaption(act);
  } else if (mgPhase === MG_COMMAND) {
    mgBars(Math.max(0, 1 - m.t / 0.3));
    // the card: the verb huge, the instruction under it with the icon, snapping in
    const k = Math.min(1, m.t * 12);
    const instr = act.instruction || '';
    const w = Math.max(PX.textWidth(act.command, 3), PX.textWidth(instr) + 14) + 14, h = 40;
    const x0 = W / 2 - w / 2, y0 = H / 2 - h / 2 + 2;
    PX.rect(x0, y0, Math.round(w * k), h, PX.c(C.card || '#ffffff'));
    if (k >= 1) {
      const cink = C.cardInk || C.bg || '#000000';
      PX.text(act.command, W / 2, y0 + h - 20, PX.c(cink), { align: 'center', scale: 3 });
      const iw = PX.textWidth(instr) + 14;
      PX.text(instr, W / 2 - 7, y0 + 6, PX.c(cink), { align: 'center' });
      MG.cue(W / 2 + iw / 2 - 10, y0 + 4, act.verb, m.t, cink);
    }
  } else if (mgPhase === MG_ACTION) {
    if (!act.toy) {
      // the fuse: a bar of beats burning down along the top
      const left = 1 - m.frac;
      PX.rect(0, H - 3, Math.round(W * left), 2, PX.c(C.fuse || '#ffffff', 0.8));
      for (let i = 1; i < m.beats; i++) PX.rect(Math.round(W * i / m.beats), H - 3, 1, 2, PX.c(C.bg || '#000000', 0.6));
    }
    // the icon beside the thing, until the first input (a toy shows it for a moment)
    const show = act.toy ? m.t < 3 && !m.cued : !m.cued;
    if (show && act.verb) {
      const [cx, cy] = act.cue ? PX.toScreen(...act.cue(m)) : [W / 2, H / 2];
      MG.cue(clamp(cx, 8, W - 16), clamp(cy, 8, H - 20), act.verb, m.t, C.ink || '#ffffff');
    }
    if (mgFlash > 0) PX.rect(0, 0, W, H, PX.c('#ffffff', mgFlash * 0.5));
  } else if (mgPhase === MG_OUTCOME) {
    act.renderOutcome?.(m);
    mgBars(Math.min(1, Math.max(0, m.t + 0.2) / 0.35));
    const line = m.line;
    if (line && m.t > 0.25) {
      const lines = Array.isArray(line) ? line : [line];
      const col = act.toy ? (C.ink || '#ffffff') : m.won ? (C.bravo || '#ffd23a') : (C.tragic || '#ff4d6d');
      // the manner in the verdict's colour, the story fact in ink
      lines.forEach((l, i) => PX.text(l, W / 2, 4 + (lines.length - 1 - i) * 8, i ? ink : PX.c(col), { align: 'center' }));
    }
  }
  mgRenderMarks();
  PX.screen = false;
}

function mgRenderMarks() {
  // one small mark per game in the top corner, lit as the bravos come
  if (mgPhase === MG_COMMAND || mgPhase === MG_ACTION) return;
  const C = mgOpera.colours, n = mgOpera.acts.filter(mgIsPlay).length;
  for (let i = 0; i < n; i++) {
    const lit = i < mgResults.length && mgResults[i];
    PX.rect(PX.W - 4 - (n - i) * 5, PX.H - 7, 3, 3, lit ? PX.c(C.bravo || '#ffd23a') : PX.c(C.dim || '#666666', 0.7));
  }
}

// ---- helpers for acts ----
MG.phase = { TITLE: MG_TITLE, WATCH: MG_WATCH, COMMAND: MG_COMMAND, ACTION: MG_ACTION, OUTCOME: MG_OUTCOME, RESULT: MG_RESULT };
MG.beat = () => mgBeat();
MG.actIndex = () => mgActIndex;
// a side-to-side walker: moves m[key] by speed pixels per second with the arrows, clamped
MG.walk = (m, key, speed, lo, hi) => {
  if (m.left) m[key] -= speed * timeDelta;
  if (m.right) m[key] += speed * timeDelta;
  m[key] = clamp(m[key], lo, hi);
  if (m.left) m.facing = -1; else if (m.right) m.facing = 1;
};
// a dragged walker: under the pointer while it is down (chasing it fast), or the arrows
MG.drag = (m, key, speed, lo, hi, w = 12) => {
  if (m.down) {
    const to = clamp(m.px - w / 2, lo, hi), d = to - m[key];
    const step = Math.sign(d) * Math.min(Math.abs(d), speed * 2.5 * timeDelta);
    m[key] += step;
    if (Math.abs(d) > 1) m.facing = Math.sign(d);
  } else MG.walk(m, key, speed, lo, hi);
};
// a pulse from 0 to 1 and back once per beat, for things that bounce to the music
MG.bounce = (beat = m.beat) => Math.abs(Math.sin(beat * PI));
// an edge-detected press of Left or Right this frame (m.left / m.right are held state)
MG.stepped = (m) => {
  const L = m.left && !m.wasL, R = m.right && !m.wasR;
  m.wasL = m.left; m.wasR = m.right;
  return L ? -1 : R ? 1 : 0;
};
// the stage floor: a band of colour with a hairline on top
MG.GROUND = 24;
MG.floor = (colour, dim = '#7a6a7a') => { PX.rect(0, 0, PX.W, MG.GROUND, PX.c(colour)); PX.rect(0, MG.GROUND, PX.W, 1, PX.c(dim)); };
// the one caption style: a small tag beside the speaker, white on black
// x, y is a world point beside the speaker. The tag is queued and drawn in the runner's
// post-render pass at screen size, so it sits over particles and reads in any shot.
const mgTags = [];
MG.say = (text, x, y, colour = '#f4e9d8', bg = '#1a1424') => {
  const [sx, sy] = PX.screen ? [x, y] : PX.toScreen(x, y);
  mgTags.push({ text, sx, sy, colour, bg });
};
function mgDrawTags() {
  PX.screen = true;
  for (const t of mgTags) {
    const w = PX.textWidth(t.text) + 4;
    const sx = clamp(t.sx, 2, PX.W - w - 2), sy = clamp(t.sy, MG_BAR + 2, PX.H - MG_BAR - 8);
    PX.rect(sx - 2, sy - 2, w, 9, PX.c(t.bg));
    PX.text(t.text, sx, sy, PX.c(t.colour));
  }
  mgTags.length = 0;
  PX.screen = false;
}
// sing a line: scale degrees and durations in beats, on a voice, from time t
MG.sing = (voice, notes, durs, t, b, o = {}) => {
  let at = t;
  notes.forEach((n, i) => {
    const d = (durs[i] ?? durs[durs.length - 1]) * b;
    if (n !== '.') S.voice(voice, S.deg(n) + (o.up || 0), at, d * (o.legato ?? 0.92), o);
    at += d;
  });
  return at;
};
// the curtain sting: a kick and a quick rising arpeggio, the beat's boundary
MG.sting = (t, numeral = 'i') => { S.drum('kick', t, 0.2, 'kick'); S.arp(numeral, 0.5, 14, t, { vol: 0.07, octave: 1 }); };
