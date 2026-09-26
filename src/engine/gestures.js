/* Gesture library: name -> (tl, time, actors, params) => endTime.
   Every gesture schedules its own motion and sound (if any) and returns the
   time its business finishes. This is the whole vocabulary from
   docs/visual-guide.md's table - nothing outside it. Every gesture that
   lights a disc does so by scheduling the sound that lights it: O.voice for
   a singer, O.arp for the field, O.drum for a flash. A disc lit with
   nothing sounding is a bug. */

const A = (actors) => (typeof actors === 'string' && actors !== 'grid' ? O.actors[actors] : actors);
const RAINBOW = ['coral', 'gold', 'lemon', 'mint', 'sky', 'violet', 'sakura'];

// ---- cell-shape helpers: every one returns a list of dot elements ----
const chebyshev = (d, c) => Math.max(Math.abs(d.col - c[0]), Math.abs(d.row - c[1]));
const ringAt = (center, r) => dots.filter((d) => chebyshev(d, center) === r).map((d) => d.el);
// Nearest first, so anything filled from a disc grows outward from its centre.
const diskAt = (center, r) => dots.filter((d) => chebyshev(d, center) <= r).sort((a, b) => Math.hypot(a.col - center[0], a.row - center[1]) - Math.hypot(b.col - center[0], b.row - center[1])).map((d) => d.el);
const rowEls = (row) => dots.filter((d) => d.row === row).map((d) => d.el);
const colEls = (col) => dots.filter((d) => d.col === col).map((d) => d.el);
const cellsFrom = (list) => list.map(([c, r]) => O.at(c, r).el);
const tint = (els, light) => { els.forEach((el) => O.light(el, light)); return els; };
const rndCells = (n) => { const pool = dots.slice(); const out = []; for (let i = 0; i < n && pool.length; i++) out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0].el); return out; };

O.G = {

  // ================= HERO: a single actor's own moves =================

  hop: (tl, t, a, p = {}) => {
    const { to, dur = 0.35, semi } = p;
    const actor = A(a);
    O.move(actor, to[0], to[1], tl, t, dur, 'elastic.out(1,0.5)');
    const s = semi ?? actor.lastSemi;
    if (s != null) { snd(tl, t, () => O.voice(actor.voice, s, ctx.currentTime, dur * 0.6, { vol: 0.14, pan: O.pan(actor), light: actor.el })); actor.lastSemi = s; }
    return t + dur;
  },

  bounce: (tl, t, a, p = {}) => {
    const { dur = 0.3, amount = 1.3 } = p;
    const actor = A(a);
    tl.to(actor.el, { scale: amount, duration: dur / 2, yoyo: true, repeat: 1 }, t);
    if (actor.lastSemi != null) snd(tl, t, () => O.voice(actor.voice, actor.lastSemi, ctx.currentTime, dur * 0.6, { vol: 0.12, pan: O.pan(actor), light: actor.el }));
    return t + dur;
  },

  flee: (tl, t, a, p = {}) => {
    const { to, dur = 0.3 } = p;
    const actor = A(a);
    O.move(actor, to[0], to[1], tl, t, dur, 'power1.in');
    tl.to(actor.el, { scale: 0.8, duration: dur }, t);
    if (actor.lastSemi != null) snd(tl, t, () => O.voice(actor.voice, actor.lastSemi + 3, ctx.currentTime, dur * 0.5, { vol: 0.08, pan: O.pan(actor), light: actor.el }));
    return t + dur;
  },

  pulse: (tl, t, a, p = {}) => {
    const { beats = 2 } = p;
    const actor = A(a);
    const beat = 60 / O.opera.tempo;
    for (let i = 0; i < beats; i++) {
      const bt = t + i * beat;
      tl.to(actor.el, { scale: 1.15, duration: beat * 0.18, yoyo: true, repeat: 1 }, bt);
      snd(tl, bt, () => O.drum('heartbeat', ctx.currentTime, 0.16, actor.el));
    }
    return t + beats * beat;
  },

  grow: (tl, t, a, p = {}) => {
    const { to = 1.6, dur = 1 } = p;
    const actor = A(a);
    tl.to(actor.el, { scale: to, duration: dur, ease: 'power2.out' }, t);
    tl.call(() => actor.el.style.setProperty('--wide', to > 2 ? 0.12 : 0), [], t);
    if (actor.lastSemi != null) snd(tl, t, () => O.voice(actor.voice, actor.lastSemi, ctx.currentTime, dur, { vol: 0.2, pan: O.pan(actor), light: actor.el }));
    return t + dur;
  },

  shrink: (tl, t, a, p = {}) => {
    const { to = 0.4, dur = 1 } = p;
    const actor = A(a);
    tl.to(actor.el, { scale: to, duration: dur, ease: 'power2.in' }, t);
    if (actor.lastSemi != null) snd(tl, t, () => O.voice(actor.voice, actor.lastSemi, ctx.currentTime, dur, { vol: 0.06, pan: O.pan(actor), light: actor.el }));
    return t + dur;
  },

  pop: (tl, t, a, p = {}) => {
    const { dur = 0.3, scale = 1 } = p;
    const actor = A(a);
    tl.set(actor.el, { scale: 0, opacity: 0 }, t);
    tl.to(actor.el, { scale, opacity: 1, duration: dur, ease: 'back.out(2)' }, t);
    const semi = actor.lastSemi ?? O.deg('1');
    snd(tl, t, () => O.voice(actor.voice, semi, ctx.currentTime, dur * 0.8, { vol: 0.14, pan: O.pan(actor), light: actor.el }));
    actor.lastSemi = semi;
    return t + dur;
  },

  fade: (tl, t, a, p = {}) => {
    const { dur = 2 } = p;
    const actor = A(a);
    tl.to(actor.el, { opacity: 0.3, duration: dur, ease: 'power1.in' }, t);
    if (actor.lastSemi != null) snd(tl, t, () => O.voice(actor.voice, actor.lastSemi, ctx.currentTime, dur, { vol: 0.05, pan: O.pan(actor), light: actor.el }));
    return t + dur;
  },

  // ================= TRAVEL: a path lit note by note =================

  chase: (tl, t, a, p = {}) => {
    const { center = [CENTER, CENTER], ring = CENTER, numeral = 'i', dur = 2, rate = 16, light = 'sky' } = p;
    const cells = ringAt(center, ring);
    tl.call(() => tint(cells, light), [], t);
    snd(tl, t, () => O.arp(numeral, dur, rate, ctx.currentTime, { vol: 0.08, cells }));
    return t + dur;
  },

  comet: (tl, t, a, p = {}) => {
    const { cells = [], numeral = 'i', dur = 2, rate = 10, light = 'sky' } = p;
    const els = cellsFrom(cells);
    tl.call(() => tint(els, light), [], t);
    snd(tl, t, () => O.arp(numeral, dur, rate, ctx.currentTime, { vol: 0.09, cells: els }));
    return t + dur;
  },

  scan: (tl, t, a, p = {}) => {
    const { row = null, col = null, numeral = 'i', dur = 1.5, rate = SIZE * 2, light = 'bulb' } = p;
    const els = row != null ? rowEls(row) : colEls(col ?? CENTER);
    tl.call(() => tint(els, light), [], t);
    snd(tl, t, () => O.arp(numeral, dur, rate, ctx.currentTime, { vol: 0.07, cells: els }));
    return t + dur;
  },

  draw: (tl, t, a, p = {}) => {
    const { cells = [], numeral = 'i', dur = 2, rate = 8, light = 'violet' } = p;
    const els = cellsFrom(cells);
    tl.call(() => tint(els, light), [], t);
    snd(tl, t, () => O.arp(numeral, dur, rate, ctx.currentTime, { vol: 0.08, cells: els }));
    return t + dur;
  },

  spiral: (tl, t, a, p = {}) => {
    const { center = [CENTER, CENTER], rings = CENTER, numeral = 'i', dur = 2.5, rate = 12, light = 'mint', inward = false } = p;
    let cells = [];
    for (let r = 0; r <= rings; r++) cells = cells.concat(ringAt(center, r));
    if (inward) cells.reverse();
    tl.call(() => tint(cells, light), [], t);
    snd(tl, t, () => O.arp(numeral, dur, rate, ctx.currentTime, { vol: 0.08, cells }));
    return t + dur;
  },

  orbit: (tl, t, a, p = {}) => {
    const { center = [CENTER, CENTER], radius = 1.5, turns = 1 } = p;
    const actor = A(a), steps = 8 * turns, stepDur = 0.2;
    let time = t;
    for (let i = 1; i <= steps; i++) {
      const ang = (i / 8) * Math.PI * 2;
      O.move(actor, center[0] + Math.cos(ang) * radius, center[1] + Math.sin(ang) * radius, tl, time, stepDur, 'sine.inOut');
      if (actor.lastSemi != null) snd(tl, time, () => O.voice(actor.voice, actor.lastSemi, ctx.currentTime, stepDur * 0.8, { vol: 0.08, pan: O.pan(actor), light: actor.el }));
      time += stepDur;
    }
    return time;
  },

  // ================= FILL: a shape, lit as one field move =================

  fillTop: (tl, t, a, p = {}) => {
    const { rows = 2, numeral = 'i', dur = 1.5, rate = 18, light = 'sky' } = p;
    const els = dots.filter((d) => d.row < rows).map((d) => d.el);
    tl.call(() => tint(els, light), [], t);
    snd(tl, t, () => O.arp(numeral, dur, rate, ctx.currentTime, { vol: 0.07, cells: els, fill: 1 }));
    return t + dur;
  },

  fillCentre: (tl, t, a, p = {}) => {
    const { radius = 1, numeral = 'i', dur = 1.2, rate = 20, light = 'mint' } = p;
    const els = diskAt([CENTER, CENTER], radius);
    tl.call(() => tint(els, light), [], t);
    snd(tl, t, () => O.arp(numeral, dur, rate, ctx.currentTime, { vol: 0.08, cells: els, fill: 1 }));
    return t + dur;
  },

  fillEdge: (tl, t, a, p = {}) => {
    const { numeral = 'i', dur = 1.5, rate = 16, light = 'violet' } = p;
    const els = ringAt([CENTER, CENTER], CENTER);
    tl.call(() => tint(els, light), [], t);
    snd(tl, t, () => O.arp(numeral, dur, rate, ctx.currentTime, { vol: 0.07, cells: els, fill: 1 }));
    return t + dur;
  },

  stripe: (tl, t, a, p = {}) => {
    const { row = null, col = null, numeral = 'i', dur = 1, rate = SIZE * 3, light = 'lemon' } = p;
    const els = row != null ? rowEls(row) : colEls(col ?? CENTER);
    tl.call(() => tint(els, light), [], t);
    snd(tl, t, () => O.arp(numeral, dur, rate, ctx.currentTime, { vol: 0.07, cells: els, fill: 1 }));
    return t + dur;
  },

  map: (tl, t, a, p = {}) => {
    const { cells = [], numeral = 'i', dur = 2, rate = 10, light = 'coral' } = p;
    const els = cellsFrom(cells);
    tl.call(() => tint(els, light), [], t);
    snd(tl, t, () => O.arp(numeral, dur, rate, ctx.currentTime, { vol: 0.08, cells: els, fill: 1 }));
    return t + dur;
  },

  // ================= BURST: percussive, one instant =================

  flash: (tl, t, a, p = {}) => {
    const { cells = [], light = 'lemon', pattern = 'hat', vol = 0.18 } = p;
    const els = cellsFrom(cells);
    tl.call(() => tint(els, light), [], t);
    snd(tl, t, () => O.drum(pattern, ctx.currentTime, vol, els));
    return t + 0.2;
  },

  explode: (tl, t, a, p = {}) => {
    const { center = [CENTER, CENTER], rings = 3, gap = 0.08, light = 'coral' } = p;
    for (let r = 0; r <= rings; r++) {
      const els = ringAt(center, r);
      tl.call(() => tint(els, light), [], t + r * gap);
      snd(tl, t + r * gap, () => O.drum(r === 0 ? 'kick' : 'hat', ctx.currentTime, 0.16 - r * 0.02, els));
    }
    return t + rings * gap + 0.2;
  },

  ripple: (tl, t, a, p = {}) => {
    const { center = [CENTER, CENTER], rings = CENTER, gap = 0.09, light = 'sky' } = p;
    for (let r = 0; r <= rings; r++) {
      const els = ringAt(center, r);
      tl.call(() => tint(els, light), [], t + r * gap);
      snd(tl, t + r * gap, () => O.drum('hat', ctx.currentTime, 0.1, els));
    }
    return t + rings * gap + 0.15;
  },

  sparkle: (tl, t, a, p = {}) => {
    const { count = 6, dur = 1.2, light = 'bulb' } = p;
    for (let i = 0; i < count; i++) {
      const el = rndCells(1)[0];
      const st = t + Math.random() * dur;
      tl.call(() => tint([el], light), [], st);
      snd(tl, st, () => O.drum('hat', ctx.currentTime, 0.08, [el]));
    }
    return t + dur;
  },

  glitter: (tl, t, a, p = {}) => {
    const { count = 14, dur = 1.6, numeral = 'i', light = 'lemon' } = p;
    const els = rndCells(count);
    tl.call(() => tint(els, light), [], t);
    snd(tl, t, () => O.arp(numeral, dur, count / dur, ctx.currentTime, { vol: 0.07, cells: els }));
    return t + dur;
  },

  confetti: (tl, t, a, p = {}) => {
    const { count = 12, dur = 1.6 } = p;
    const els = rndCells(count);
    tl.call(() => els.forEach((el, i) => O.light(el, RAINBOW[i % RAINBOW.length])), [], t);
    snd(tl, t, () => O.arp('i', dur, count / dur, ctx.currentTime, { vol: 0.09, cells: els }));
    return t + dur;
  },

  // ================= COLOUR: the seven-hue exception =================

  rainbowCentre: (tl, t, a, p = {}) => {
    const { rings = CENTER, gap = 0.12, dur = 1 } = p;
    for (let r = 0; r <= rings; r++) {
      const els = ringAt([CENTER, CENTER], r);
      tl.call(() => tint(els, RAINBOW[r % RAINBOW.length]), [], t + r * gap);
      snd(tl, t + r * gap, () => O.arp('i', dur, 30, ctx.currentTime, { vol: 0.08, cells: els }));
    }
    return t + rings * gap + dur;
  },

  rainbowCycle: (tl, t, a, p = {}) => {
    const { dur = 3.5 } = p;
    const step = dur / RAINBOW.length;
    RAINBOW.forEach((light, i) => {
      tl.call(() => tint(dots.map((d) => d.el), light), [], t + i * step);
      snd(tl, t + i * step, () => O.arp('i', step, 24, ctx.currentTime, { vol: 0.06, cells: dots.map((d) => d.el) }));
    });
    return t + dur;
  },

  jumpCut: (tl, t, a, p = {}) => {
    const { light = null } = p;
    tl.call(() => O.bg(light), [], t);
    snd(tl, t, () => O.drum('hat', ctx.currentTime, 0.12));
    return t;
  },

  // ================= ENDING =================

  decay: (tl, t, a, p = {}) => {
    const { dur = 3 } = p;
    const actor = A(a);
    if (actor && actor.lastSemi != null) snd(tl, t, () => O.voice(actor.voice, actor.lastSemi, ctx.currentTime, dur * 0.4, { vol: 0.14, pan: O.pan(actor), light: actor.el }));
    return t + dur;
  },

  burn: (tl, t, a, p = {}) => {
    const { dur = 2.5 } = p;
    const actor = A(a);
    tl.to(actor.el, { opacity: 0.5, duration: dur, ease: 'power1.in' }, t);
    snd(tl, t, () => {
      const start = ctx.currentTime;
      O.registerLight(actor.el, start, start + dur, (el) => Math.max(0, 1 - el / dur));
      const n = ctx.createBufferSource(); n.buffer = O.noise;
      const bp = ctx.createBiquadFilter(); bp.type = 'lowpass'; bp.frequency.value = 500;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.15, start);
      g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
      n.connect(bp); bp.connect(g); g.connect(O.master);
      n.start(start); n.stop(start + dur);
    });
    return t + dur;
  },

  snow: (tl, t, a, p = {}) => {
    const { dur = 3, count = 10, light = 'sky' } = p;
    for (let i = 0; i < count; i++) {
      const el = rndCells(1)[0];
      const st = t + (i / count) * dur;
      tl.call(() => tint([el], light), [], st);
      snd(tl, st, () => O.drum('hat', ctx.currentTime, 0.05, [el]));
    }
    return t + dur;
  },

  soloFade: (tl, t, a, p = {}) => {
    const { dur = 4 } = p;
    const actor = A(a);
    if (actor && actor.lastSemi != null) snd(tl, t, () => O.voice(actor.voice, actor.lastSemi, ctx.currentTime, dur * 0.3, { vol: 0.1, pan: O.pan(actor), light: actor.el }));
    tl.to(actor.el, { opacity: 0.5, duration: dur }, t);
    return t + dur;
  },

  // ================= SOUND-ONLY =================

  sing: (tl, t, a, p = {}) => {
    const actor = A(a);
    const voice = p.voice || actor.voice;
    const pair = applyT(O.motif(), p.transform);
    const [semis, rhythm] = pair;
    const beat = 60 / O.opera.tempo;
    let tm = t;
    for (const c of rhythm) tm += beat / 2;
    const vol = p.vol ?? 0.15, pan = O.pan(actor);
    snd(tl, t, () => O.play(voice, pair, ctx.currentTime, { vol, pan, beat, light: actor.el }));
    actor.lastSemi = semis.find((x) => x != null) ?? actor.lastSemi;
    return tm;
  },

  hold: (tl, t, a, p = {}) => {
    const actor = A(a);
    const { dur = 3, vol = 0.15 } = p;
    const semi = p.semi ?? actor.lastSemi ?? 0;
    snd(tl, t, () => O.voice(p.voice || actor.voice, semi, ctx.currentTime, dur, { vol, pan: O.pan(actor), light: actor.el }));
    return t + dur;
  },

  chord: (tl, t, a, p = {}) => {
    const { numeral = 'i', dur = 1.5, voice = 'bass' } = p;
    const actor = A(a);
    const [bass, colour] = O.chord(numeral);
    snd(tl, t, () => {
      O.voice(voice, bass, ctx.currentTime, dur, { vol: 0.18, pan: 0 });
      O.voice(actor ? actor.voice : 'tenor', colour, ctx.currentTime, dur, { vol: 0.14, pan: actor ? O.pan(actor) : 0, light: actor ? actor.el : null });
    });
    return t + dur;
  },

  arp: (tl, t, a, p = {}) => {
    const { numeral = 'i', dur = 2, rate = 20, cells = [], light = null } = p;
    const els = cells.length ? cellsFrom(cells) : [];
    if (light && els.length) tl.call(() => tint(els, light), [], t);
    snd(tl, t, () => O.arp(numeral, dur, rate, ctx.currentTime, { vol: 0.08, cells: els }));
    return t + dur;
  },

  drum: (tl, t, a, p = {}) => {
    const { pattern = 'kick', vol = 0.15, cells = [] } = p;
    const els = cells.length ? cellsFrom(cells) : null;
    snd(tl, t, () => O.drum(pattern, ctx.currentTime, vol, els));
    return t + 0.2;
  },

  silence: (tl, t, a, p = {}) => {
    const { dur = 0.25 } = p;
    snd(tl, t, () => {
      const g = O.master.gain, ct = ctx.currentTime, v = g.value;
      g.setValueAtTime(0.0001, ct);
      g.setValueAtTime(v, ct + dur);
    });
    return t + dur;
  },

  crescendo: (tl, t, a, p = {}) => {
    const { to = 0.9, dur = 2 } = p;
    snd(tl, t, () => O.auto(O.master.gain, O.master.gain.value, to, dur, ctx.currentTime, 'linear'));
    return t + dur;
  },

  ritardando: (tl, t) => t, // resolved in score.js before scheduling

  room: (tl, t, a, p = {}) => {
    const { cutoff = 1200, feedback = 0.45, dur = 1.5 } = p;
    snd(tl, t, () => O.setRoom(cutoff, feedback, dur, ctx.currentTime));
    return t + dur;
  },

  // ================= TEXT =================

  cue: (tl, t, a, p = {}) => {
    const { text = '', hold = 1.6 } = p;
    O.cue(tl, t, text, hold);
    return t + Math.max(4, text.length) * 0.055 + hold;
  },

  // ================= CAMERA =================

  closeUp: (tl, t, a, p = {}) => {
    const { dur = 0.12 } = p;
    const actor = A(a);
    const zoom = innerWidth / 2 / cellSize();
    O.camera(tl, t, { actor, zoom, dur, ease: 'power2.out' });
    return t + dur;
  },

  snapBack: (tl, t, a, p = {}) => {
    const { dur = 0.12 } = p;
    O.camera(tl, t, { col: CENTER, row: CENTER, zoom: 1, dur, ease: 'power2.out' });
    return t + dur;
  },

  shake: (tl, t, a, p = {}) => {
    const { amount = 6, dur = 0.3 } = p;
    tl.to(worldEl, { x: '+=' + amount, duration: dur / 6, yoyo: true, repeat: 5 }, t);
    return t + dur;
  },
};

function applyT(pair, spec) {
  if (!spec) return pair;
  if (typeof spec === 'string') return O.T[spec]()(pair);
  if (Array.isArray(spec[0])) return spec.reduce((p, sp) => applyT(p, sp), pair);
  const [name, arg] = spec;
  return O.T[name](arg)(pair);
}
