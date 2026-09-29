/* The microgame runner: WarioWare's architecture for an opera.
   Six acts. Each act runs on a beat grid on the audio clock:

     CURTAIN  4 beats   the act's name and its aria, the music's intro
     COMMAND  1 beat    one imperative verb, huge
     ACTION   N beats   the microgame (8 to 16 beats, 5 to 10 s)
     OUTCOME  4 beats   bravo or tragedy, staged, then the next act (at least 3 s;
                        an act sets outcomeSeconds for a longer ending)

   After the sixth act a result card: bravos out of six and the ending you
   earned. Failure is never a game over; it is the other version of the scene.

   An opera file calls MG.opera({...}) with:
     title, sub, key: [root, mode], colours: {bg, ink, ...}, ending(m, won) -> [line, line],
     acts: [{
       name, aria, command, bpm, beats, verb,
       init(m)              // once, at the curtain; set up the scene
       update(m)            // each frame of ACTION; call m.win() or m.lose() to end early
       render(m)            // each frame of CURTAIN, ACTION and OUTCOME; m.phase says which
       music: { curtain(t, b), bar(t, b, i), outcome(t, b, won) }  // schedule audio at time t, beat length b
       outcome(m)           // returns [english line] shown at OUTCOME, after m.won is known
     }]
   shot: 'wide' | 'mid' | 'close' (the camera: the whole 256x144 stage, half of it, a quarter), with
   focus(m) -> [x, y] the world point the mid and close shots centre on. m.cut(shot, x, y) changes
   it during the act, and the outcome can cut too: an act's outcome is a place for a close-up.
   m is the microgame state: m.left / m.right (held), m.press (Space or button, this frame),
   m.hold (held), m.t (seconds into the phase), m.beat (beats into the phase, fractional),
   m.beats (the action's length), m.phase, m.won, m.done, m.act (the act object), m.i (its index),
   m.frac (0..1 through the action), plus anything the act stores on it.
   The runner draws the beat fuse, the command card, the outcome line and the result card;
   the act draws its scene. */

'use strict';

const MG = {};

const MG_TITLE = 0, MG_CURTAIN = 1, MG_COMMAND = 2, MG_ACTION = 3, MG_OUTCOME = 4, MG_RESULT = 5;
const MG_LOOKAHEAD = 0.12;   // seconds ahead of the audio clock that music is scheduled

let mgOpera = null;
let mgPhase = MG_TITLE;
let mgPhaseStart = 0;        // audio time the phase began
let mgPhaseLen = 0;          // seconds
let mgActIndex = 0;
let mgBravos = 0;
let mgResults = [];
let mgBarsScheduled = 0;
let mgFlash = 0;
const m = {};                // the shared microgame state handed to acts

const mgBeat = () => 60 / mgOpera.acts[mgActIndex].bpm;

MG.opera = (opera) => {
  mgOpera = opera;
  PX.setup(256, 144);
  setShowSplashScreen(false);
  setSoundVolume(0.5);
  setCanvasClearColor(PX.c(opera.colours.bg || '#000000'));
  setTouchGamepadEnable(true);
  setTouchGamepadAnalog(false);
  setTouchGamepadButtonCount(1);
  setTouchGamepadSize(70);
  setTouchGamepadAlpha(0.25);
  setTouchGamepadDisplayTime(0);
  setInputWASDEmulateDirection(true);
  engineInit(mgInit, mgUpdate, () => {}, mgRender, mgRenderPost);
};

function mgInit() {
  PX.initFont();
  if (mgOpera.sprites) mgOpera.sprites();
  PX.bake();
  S.init();
  S.key(...mgOpera.key);
  mgPhase = MG_TITLE;
}

// ---- input, keyboard and gamepad (the touch gamepad is a gamepad) ----
function mgReadInput() {
  const d = keyDirection();
  const stick = gamepadStick(0), dpad = gamepadDpad();
  const gx = Math.abs(stick.x) > 0.3 ? Math.sign(stick.x) : dpad.x;
  m.left = d.x < 0 || gx < 0;
  m.right = d.x > 0 || gx > 0;
  m.press = keyWasPressed('Space') || keyWasPressed('Enter') || gamepadWasPressed(0) || gamepadWasPressed(1);
  m.hold = keyIsDown('Space') || keyIsDown('Enter') || gamepadIsDown(0) || gamepadIsDown(1);
  m.tap = mouseWasPressed(0) && !touchGamepadEnable;
}

function mgStartPhase(phase, beats, minSeconds = 0) {
  mgPhase = phase;
  mgPhaseStart = Math.max(S.now(), mgPhaseStart + mgPhaseLen);
  mgPhaseLen = Math.max(beats * mgBeat(), minSeconds);
  m.phase = phase;
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
  for (const k of Object.keys(m)) delete m[k];
  m.i = i;
  m.shotName = mgOpera.acts[i].shot || 'wide';
  m.cut = (shot, x, y) => { m.shotName = shot; if (x != null) { m.focus = [x, y]; m.cutFocus = true; } };
  m.act = mgOpera.acts[i];
  m.beats = m.act.beats;
  m.won = false; m.done = false;
  m.win = () => { if (!m.done) { m.done = true; m.won = true; } };
  m.lose = () => { if (!m.done) { m.done = true; m.won = false; } };
  m.W = PX.W; m.H = PX.H;
  m.act.init(m);
  mgPhaseLen = 0;
  mgPhaseStart = S.now() + 0.05;
  mgStartPhase(MG_CURTAIN, 4);
  mgBarsScheduled = 0;
  const b = mgBeat();
  m.act.music?.curtain?.(mgPhaseStart, b);
  S.registerLight('curtain', mgPhaseStart, mgPhaseStart + 4 * b, (el) => Math.max(0, 1 - el / (4 * b)));
}

function mgUpdate() {
  mgReadInput();
  const now = S.now();
  m.t = now - mgPhaseStart;
  m.beat = m.t / mgBeat();
  m.phase = mgPhase;
  mgFlash = Math.max(0, mgFlash - timeDelta * 4);

  if (mgPhase === MG_TITLE) {
    if ((m.press || m.tap) && audioIsRunning()) { mgBravos = 0; mgResults = []; mgStartAct(0); }
    return;
  }
  if (mgPhase === MG_RESULT) {
    if (m.t > 1.5 && (m.press || m.tap)) { mgPhase = MG_TITLE; mgPhaseStart = now; }
    return;
  }
  if (mgPhase === MG_CURTAIN) {
    if (m.t >= mgPhaseLen) mgStartPhase(MG_COMMAND, 1);
    return;
  }
  if (mgPhase === MG_COMMAND) {
    if (m.t >= mgPhaseLen) {
      mgStartPhase(MG_ACTION, m.beats);
      mgFlash = 1;
    }
    return;
  }
  if (mgPhase === MG_ACTION) {
    const b = mgBeat();
    m.frac = Math.min(1, m.t / mgPhaseLen);
    // schedule the action music one bar at a time, a little ahead of the clock
    const barLen = 4 * b;
    while (mgBarsScheduled * barLen < m.beats * b && mgPhaseStart + mgBarsScheduled * barLen < now + MG_LOOKAHEAD + barLen * 0.5) {
      m.act.music?.bar?.(mgPhaseStart + mgBarsScheduled * barLen, b, mgBarsScheduled);
      mgBarsScheduled++;
    }
    if (!m.done) m.act.update(m);
    if (m.done || m.t >= mgPhaseLen) {
      if (!m.done) { m.done = true; m.won = !!m.timeoutWins; }
      // the outcome starts on the next beat, so the music lands
      const nextBeat = mgPhaseStart + Math.ceil(m.t / b + 0.001) * b;
      mgPhaseLen = nextBeat - mgPhaseStart;
      mgStartPhase(MG_OUTCOME, 4, m.act.outcomeSeconds ?? 3);
      if (m.won) mgBravos++;
      mgResults.push(m.won);
      m.line = m.act.outcome(m);
      m.act.music?.outcome?.(mgPhaseStart, b, m.won);
      m.act.onOutcome?.(m);
    }
    return;
  }
  if (mgPhase === MG_OUTCOME) {
    m.act.updateOutcome?.(m);
    if (m.t >= mgPhaseLen) {
      if (mgActIndex + 1 < mgOpera.acts.length) mgStartAct(mgActIndex + 1);
      else { mgPhase = MG_RESULT; mgPhaseStart = S.now(); mgPhaseLen = 0; m.phase = MG_RESULT; mgOpera.music?.result?.(S.now(), mgBravos); }
    }
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
    const blink = Math.floor(timeReal * 2) % 2 === 0;
    if (blink) PX.text(isTouchDevice ? 'TAP TO BEGIN' : 'PRESS SPACE', W / 2, 18, ink, { align: 'center' });
    PX.text('6 ACTS · 1 MINUTE', W / 2, 8, PX.c(C.dim || '#888888'), { align: 'center' });
    return;
  }
  if (mgPhase === MG_RESULT) {
    mgOpera.renderResult?.(m, mgBravos);
    PX.text(mgOpera.title, W / 2, H - 22, ink, { align: 'center', scale: 2 });
    // six marks, one per act: lit for a bravo
    for (let i = 0; i < mgResults.length; i++) {
      const x = W / 2 - 6 * 9 + i * 12 + 6;
      PX.rect(x - 4, H / 2 + 8, 8, 8, mgResults[i] ? PX.c(C.bravo || '#ffd23a') : PX.c(C.dim || '#444444'));
    }
    PX.text(`${mgBravos} BRAVO${mgBravos === 1 ? '' : 'S'} OF 6`, W / 2, H / 2 - 6, ink, { align: 'center' });
    const lines = mgOpera.ending(m, mgBravos);
    lines.forEach((l, i) => PX.text(l, W / 2, H / 2 - 20 - i * 8, PX.c(C.dim || '#888888'), { align: 'center' }));
    if (m.t > 1.5 && Math.floor(timeReal * 2) % 2 === 0) PX.text('AGAIN?', W / 2, 10, ink, { align: 'center' });
    return;
  }

  const act = m.act;
  if (act.focus && !m.cutFocus) m.focus = act.focus(m);
  mgApplyShot();
  act.render(m);
  PX.screen = true;                 // everything below is HUD

  if (mgPhase === MG_CURTAIN) {
    // the act's name and its aria over the scene, fading as the curtain rises
    const a = Math.min(1, 1.6 - m.t / mgPhaseLen);
    PX.rect(0, 0, W, H, PX.c(C.bg || '#000000', 0.65 * a));
    PX.text(act.name, W / 2, H / 2 + 6, PX.c(C.ink || '#ffffff', a), { align: 'center', scale: 2 });
    PX.text(act.aria, W / 2, H / 2 - 8, PX.c(C.dim || '#888888', a), { align: 'center' });
  } else if (mgPhase === MG_COMMAND) {
    // the semantic prime: one verb, huge, on a card that snaps in
    const k = Math.min(1, m.t * 12);
    const w = PX.textWidth(act.command, 3) + 12, h = 23;
    PX.rect(W / 2 - w / 2, H / 2 - h / 2, w * k, h, PX.c(C.card || '#ffffff'));
    if (k >= 1) PX.text(act.command, W / 2, H / 2 - 7, PX.c(C.cardInk || C.bg || '#000000'), { align: 'center', scale: 3 });
  } else if (mgPhase === MG_ACTION) {
    // the fuse: a bar of beats burning down along the top
    const left = 1 - m.frac;
    PX.rect(0, H - 3, Math.round(W * left), 2, PX.c(C.fuse || '#ffffff', 0.8));
    for (let i = 1; i < m.beats; i++) PX.rect(Math.round(W * i / m.beats), H - 3, 1, 2, PX.c(C.bg || '#000000', 0.6));
    if (mgFlash > 0) PX.rect(0, 0, W, H, PX.c('#ffffff', mgFlash * 0.5));
  } else if (mgPhase === MG_OUTCOME) {
    act.renderOutcome?.(m);
    const y = act.lineY ?? 10;
    const line = m.line;
    if (line && m.t > 0.25) {
      const lines = Array.isArray(line) ? line : [line];
      lines.forEach((l, i) => PX.text(l, W / 2, y + (lines.length - 1 - i) * 8, PX.c(m.won ? (C.bravo || '#ffd23a') : (C.tragic || '#ff4d6d')), { align: 'center' }));
    }
  }
  PX.screen = false;
}

function mgRenderPost() {
  // the act counter, tiny, in the corner
  PX.screen = true;
  if (mgPhase >= MG_CURTAIN && mgPhase <= MG_OUTCOME)
    PX.text(`${mgActIndex + 1}/6`, PX.W - 2, 2, PX.c(mgOpera.colours.dim || '#666666'), { align: 'right' });
  PX.screen = false;
}

// ---- helpers for acts ----
MG.phase = { TITLE: MG_TITLE, CURTAIN: MG_CURTAIN, COMMAND: MG_COMMAND, ACTION: MG_ACTION, OUTCOME: MG_OUTCOME, RESULT: MG_RESULT };
MG.beat = () => mgBeat();
MG.actIndex = () => mgActIndex;
// a side-to-side walker: moves m[key] by speed pixels per second with the arrows, clamped
MG.walk = (m, key, speed, lo, hi) => {
  if (m.left) m[key] -= speed * timeDelta;
  if (m.right) m[key] += speed * timeDelta;
  m[key] = clamp(m[key], lo, hi);
  if (m.left) m.facing = -1; else if (m.right) m.facing = 1;
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
MG.say = (text, x, y, colour = '#f4e9d8', bg = '#1a1424') => {
  // x, y is a world point beside the speaker; the tag is drawn at screen size, wherever the shot is
  const was = PX.screen;
  let [sx, sy] = was ? [x, y] : PX.toScreen(x, y);
  const w = PX.textWidth(text) + 4;
  sx = clamp(sx, 2, PX.W - w - 2); sy = clamp(sy, 12, PX.H - 12);
  PX.screen = true;
  PX.rect(sx - 2, sy - 2, w, 9, PX.c(bg));
  PX.text(text, sx, sy, PX.c(colour));
  PX.screen = was;
};
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
// the curtain sting: a kick and a quick rising arpeggio, the act's four-beat boundary
MG.sting = (t, numeral = 'i') => { S.drum('kick', t, 0.2, 'kick'); S.arp(numeral, 0.5, 14, t, { vol: 0.07, octave: 1 }); };
