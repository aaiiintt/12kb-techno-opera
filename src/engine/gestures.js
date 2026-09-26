/* Gesture library: name -> (tl, time, actors, params) => endTime.
   Every gesture schedules its own motion and sound (if any) and returns the
   time its business finishes, per docs/gestures.md's contract. */

const A = (actors) => (typeof actors === 'string' && actors !== 'grid' ? O.actors[actors] : actors);

// ---- spectacle helpers: shared by wipe, flood, tide, swarm, shatter,
// collapse and the existing fillRing/closeIn ----

// per-dot delay (seconds), proportional to its distance from a cell
const distStagger = (c, rate) => (d) => Math.hypot(d.col - c[0], d.row - c[1]) * rate;

// tint a list of dot elements to a colour
const tint = (els, color) => els.forEach((el) => el.style.setProperty('--dot-color', color));

// a filtered noise swell through a band-pass, panned - the spectacle
// family's one bit of new low-level sound (wipe's "noise in the wipe
// direction"); everything else reuses O.voice/O.arp/O.drum/O.setRoom.
function noiseSwell(dur, pan = 0, freq = 1200) {
  const n = ctx.createBufferSource(); n.buffer = O.noise;
  const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = freq;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, ctx.currentTime);
  g.gain.linearRampToValueAtTime(0.12, ctx.currentTime + dur * 0.5);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
  const pn = ctx.createStereoPanner(); pn.pan.value = pan;
  n.connect(bp); bp.connect(g); g.connect(pn); pn.connect(O.master); pn.connect(O.roomSend);
  n.start(); n.stop(ctx.currentTime + dur + 0.05);
}

function applyT(pair, spec) {
  if (!spec) return pair;
  if (typeof spec === 'string') return O.T[spec]()(pair);
  if (Array.isArray(spec[0])) return spec.reduce((p, sp) => applyT(p, sp), pair);
  const [name, arg] = spec;
  return O.T[name](arg)(pair);
}

// shared by rise/sink: step one row per beat, dir -1 up (rise) or +1 down
// (sink), with the held note moving the opposite way in pitch.
const rowStep = (dir) => (tl, t, a, p = {}) => {
  const { rows = 2, stepDur = 0.8 } = p;
  const actor = A(a);
  let time = t, row = actor.row;
  for (let i = 0; i < rows; i++) {
    row += dir;
    O.move(actor, actor.col, row, tl, time, stepDur);
    if (actor.lastSemi != null) {
      const semi = actor.lastSemi - dir * i * 2;
      snd(tl, time, () => O.voice(actor.voice, semi, ctx.currentTime, stepDur, { vol: 0.12, pan: O.pan(actor) }));
    }
    time += stepDur;
  }
  return time;
};

O.G = {
  cue: (tl, t, a, p = {}) => {
    const { text = '', hold = 1.6 } = p;
    O.cue(tl, t, text, hold);
    return t + Math.max(4, text.length) * 0.055 + hold;
  },

  sing: (tl, t, a, p = {}) => {
    const actor = A(a);
    const voice = p.voice || actor.voice;
    const pair = applyT(O.motif(), p.transform);
    const [semis, rhythm] = pair;
    const beat = 60 / O.opera.tempo;
    const eighth = beat / 2;
    let tm = t;
    for (const c of rhythm) {
      if (c === 'x') tl.to(actor.el, { scale: 1.08, duration: 0.08, yoyo: true, repeat: 1 }, tm);
      tm += eighth;
    }
    const vol = p.vol ?? 0.15, pan = O.pan(actor);
    snd(tl, t, () => O.play(voice, pair, ctx.currentTime, { vol, pan, beat }));
    actor.lastSemi = semis.find((x) => x != null) ?? actor.lastSemi;
    return tm;
  },

  crescendo: (tl, t, a, p = {}) => {
    const { to = 0.9, dur = 2 } = p;
    snd(tl, t, () => O.auto(O.master.gain, O.master.gain.value, to, dur, ctx.currentTime, 'linear'));
    return t + dur;
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

  hold: (tl, t, a, p = {}) => {
    const { dur = 2 } = p;
    const actor = A(a);
    if (actor && actor.lastSemi != null) snd(tl, t, () => O.voice(actor.voice, actor.lastSemi, ctx.currentTime, dur, { vol: 0.12, pan: O.pan(actor) }));
    return t + dur;
  },

  freeze: (tl, t, a, p = {}) => t + (p.dur ?? 1),

  chord: (tl, t, a, p = {}) => {
    const { numeral = 'i', dur = 1.5, voice = 'bass' } = p;
    const actor = A(a);
    const [bass, colour] = O.chord(numeral);
    snd(tl, t, () => {
      O.voice(voice, bass, ctx.currentTime, dur, { vol: 0.18, pan: 0 });
      O.voice(actor ? actor.voice : 'tenor', colour, ctx.currentTime, dur, { vol: 0.14, pan: actor ? O.pan(actor) : 0 });
    });
    return t + dur;
  },

  shrink: (tl, t, a, p = {}) => {
    const { to = 0.4, dur = 1 } = p;
    const actor = A(a);
    tl.to(actor.el, { scale: to, duration: dur, ease: 'power2.in' }, t);
    if (actor.lastSemi != null) snd(tl, t, () => O.voice(actor.voice, actor.lastSemi, ctx.currentTime, dur, { vol: 0.06, pan: O.pan(actor) }));
    return t + dur;
  },

  enter: (tl, t, a, p = {}) => {
    const { edge = 'left', to = [CENTER, CENTER], dur = 0.6 } = p;
    const actor = A(a);
    const start = edge === 'left' ? [0, to[1]] : edge === 'right' ? [8, to[1]] : edge === 'top' ? [to[0], 0] : [to[0], 8];
    const sp = O.cell(start[0], start[1]);
    actor.el.style.transform = `translate(${sp.x}px,${sp.y}px) scale(0.6)`;
    actor.col = start[0]; actor.row = start[1];
    tl.set(actor.el, { opacity: 0.2, scale: 0.6 }, t);
    tl.to(actor.el, { opacity: 1, scale: 1, duration: Math.max(dur * 0.3, 0.1) }, t);
    O.move(actor, to[0], to[1], tl, t, dur);
    snd(tl, t, () => O.voice(actor.voice, O.opera.root, ctx.currentTime, 0.3, { vol: 0.12, pan: start[0] < CENTER ? -1 : 1 }));
    return t + dur;
  },

  flicker: (tl, t, a, p = {}) => {
    const { beats = 4, amount = 0.3 } = p;
    const target = a === 'grid' ? dots.map((d) => d.el) : [A(a).el];
    const step = 60 / O.opera.tempo / 2;
    tl.to(target, { opacity: '-=' + amount, duration: step, yoyo: true, repeat: beats * 2 - 1 }, t);
    return t + beats * step * 2;
  },

  arpChorus: (tl, t, a, p = {}) => {
    const { numeral = 'i', dur = 2, rate = 45 } = p;
    snd(tl, t, () => O.arp(numeral, dur, rate, ctx.currentTime, { vol: 0.08 }));
    tl.to(dots.map((d) => d.el), { opacity: 0.55, duration: dur * 0.4, yoyo: true, repeat: 1 }, t);
    return t + dur;
  },

  ritardando: (tl, t) => t, // resolved in score.js before scheduling

  approach: (tl, t, a, p = {}) => {
    const { target, dur = 1 } = p;
    const actor = A(a), tgt = O.actors[target];
    const dc = Math.sign(tgt.col - actor.col), dr = Math.sign(tgt.row - actor.row);
    const nc = dc ? tgt.col - dc : tgt.col, nr = dr ? tgt.row - dr : tgt.row;
    O.move(actor, nc, nr, tl, t, dur);
    return t + dur;
  },

  roomChange: (tl, t, a, p = {}) => {
    const { cutoff = 1200, feedback = 0.45, dur = 1.5 } = p;
    snd(tl, t, () => O.setRoom(cutoff, feedback, dur, ctx.currentTime));
    return t + dur;
  },

  dissolve: (tl, t, a, p = {}) => {
    const { dur = 1.2 } = p;
    const actor = A(a);
    tl.to(actor.el, { scale: 0, opacity: 0, duration: dur, ease: 'power2.in' }, t);
    if (actor.lastSemi != null) snd(tl, t, () => O.voice(actor.voice, actor.lastSemi, ctx.currentTime, dur * 0.8, { vol: 0.05, pan: O.pan(actor) }));
    return t + dur;
  },

  pulse: (tl, t, a, p = {}) => {
    const { beats = 2, amount = 1.25 } = p;
    const actor = A(a);
    const beat = 60 / O.opera.tempo;
    for (let i = 0; i < beats; i++) {
      const bt = t + i * beat;
      tl.to(actor.el, { scale: amount, duration: beat * 0.2 }, bt);
      tl.to(actor.el, { scale: 1, duration: beat * 0.3 }, bt + beat * 0.2);
      snd(tl, bt, () => O.drum('hat', ctx.currentTime, 0.1));
    }
    return t + beats * beat;
  },

  rise: rowStep(-1),

  grow: (tl, t, a, p = {}) => {
    const { to = 1.6, dur = 1 } = p;
    const actor = A(a);
    tl.to(actor.el, { scale: to, duration: dur, ease: 'power2.out' }, t);
    if (actor.lastSemi != null) snd(tl, t, () => O.voice(actor.voice, actor.lastSemi, ctx.currentTime, dur, { vol: 0.2, pan: O.pan(actor) }));
    return t + dur;
  },

  appear: (tl, t, a, p = {}) => {
    const { cell, scale = 1 } = p;
    const actor = A(a);
    if (cell) {
      const pos = O.cell(cell[0], cell[1]);
      actor.el.style.transform = `translate(${pos.x}px,${pos.y}px) scale(0)`;
      actor.col = cell[0]; actor.row = cell[1];
    }
    tl.set(actor.el, { scale: 0, opacity: 0 }, t);
    tl.to(actor.el, { scale, opacity: 1, duration: 0.3, ease: 'back.out(2)' }, t);
    const semi = O.deg('1');
    snd(tl, t, () => O.voice(actor.voice, semi, ctx.currentTime, 0.25, { vol: 0.14, pan: O.pan(actor) }));
    actor.lastSemi = semi;
    return t + 0.3;
  },

  // Phase 0.5: the act-six "purple section" as a reusable move. A chord in
  // turn: bass on the root, tenor on the third (tenor's own vibrato makes it
  // the top voice), an arp of the whole triad plus octave, a ring pulse from
  // the centre outward, and the room opening a step further each time.
  ascend: (tl, t, a, p = {}) => {
    const { numerals = ['i', 'iv', 'v', 'i+'], gap = 2.0, hue = 272, hueStep = 5 } = p;
    let time = t, lastEnd = t;
    numerals.forEach((raw, step) => {
      const octUp = raw.endsWith('+');
      const numeral = octUp ? raw.slice(0, -1) : raw;
      const oct = octUp ? 12 : 0;
      const [bassSemi, colourSemi] = O.chord(numeral);
      const bass = bassSemi + oct, colour = colourSemi + oct;
      const dur = gap * 0.9;
      const pan = step % 2 ? 0.6 : -0.6;
      snd(tl, time, () => {
        const ct = ctx.currentTime;
        O.voice('bass', bass, ct, dur, { vol: 0.18, pan: 0 });
        O.voice('tenor', colour, ct, dur, { vol: 0.16, pan });
        O.arp(numeral, dur, 14 + step, ct, { vol: 0.09, pan: -pan, octave: octUp ? 1 : 0 });
        O.setRoom(2800 + step * 300, 0.44 + step * 0.02, 1.0, ct);
      });
      const ringColor = `hsl(${hue + step * hueStep}, 100%, 55%)`;
      for (let r = 0; r <= CENTER; r++) {
        const ringDots = dots.filter((d) => Math.max(Math.abs(d.col - CENTER), Math.abs(d.row - CENTER)) === r);
        const rt = time + r * 0.075;
        tl.call(() => ringDots.forEach((d) => d.el.style.setProperty('--dot-color', ringColor)), [], rt);
        tl.to(ringDots.map((d) => d.el), { scale: 1.25, opacity: 1, duration: 0.36, yoyo: true, repeat: 1, ease: 'elastic.out(1.15, 0.35)' }, rt);
      }
      lastEnd = time + dur + 0.45;
      time += gap;
    });
    return lastEnd;
  },

  eclipse: (tl, t, a, p = {}) => {
    const { target, dur = 0.6, numeral = 'v' } = p;
    const actor = A(a), tgt = O.actors[target];
    O.move(actor, tgt.col, tgt.row, tl, t, dur, 'power2.in');
    snd(tl, t + dur, () => {
      const [bass, colour] = O.chord(numeral);
      O.voice('bass', bass, ctx.currentTime, 0.8, { vol: 0.16, pan: 0 });
      O.voice('tenor', colour, ctx.currentTime, 0.8, { vol: 0.14, pan: 0 });
    });
    return t + dur + 0.8;
  },

  // ---- Phase 1: the remaining 32 from docs/gestures.md ----

  sink: rowStep(1),

  exit: (tl, t, a, p = {}) => {
    const { edge = 'right', speed = 1 } = p;
    const actor = A(a);
    const dur = 0.5 / speed;
    const end = edge === 'left' ? [-1, actor.row] : edge === 'right' ? [9, actor.row] : edge === 'top' ? [actor.col, -1] : [actor.col, 9];
    O.move(actor, end[0], end[1], tl, t, dur, 'power1.in');
    tl.to(actor.el, { opacity: 0, duration: dur }, t);
    if (actor.lastSemi != null) snd(tl, t, () => O.voice(actor.voice, actor.lastSemi + 12 * speed, ctx.currentTime, dur * 0.6, { vol: 0.12, pan: O.pan(actor) }));
    return t + dur;
  },

  reveal: (tl, t, a, p = {}) => {
    const { to, dur = 0.3, color } = p;
    const actor = A(a);
    if (to) O.move(actor, to[0], to[1], tl, t, dur);
    if (color) tl.call(() => actor.el.style.setProperty('--dot-color', color), [], t + dur / 2);
    tl.to(actor.el, { scale: 1.3, duration: dur / 2, yoyo: true, repeat: 1 }, t);
    snd(tl, t + dur / 2, () => O.drum('hat', ctx.currentTime, 0.15));
    return t + dur;
  },

  path: (tl, t, a, p = {}) => {
    const { cells = [], stepDur = 0.4, trail = false } = p;
    const actor = A(a);
    let time = t;
    cells.forEach((c) => {
      O.move(actor, c[0], c[1], tl, time, stepDur);
      if (trail) tl.to(actor.el, { opacity: 0.6, duration: stepDur * 0.3, yoyo: true, repeat: 1 }, time);
      if (actor.lastSemi != null) snd(tl, time, () => O.voice(actor.voice, actor.lastSemi, ctx.currentTime, stepDur * 0.8, { vol: 0.1, pan: O.pan(actor) }));
      time += stepDur;
    });
    return time;
  },

  orbit: (tl, t, a, p = {}) => {
    // the timeline only tweens x/y/scale/opacity on real elements (no
    // onUpdate), so a circle is stepped in short straight hops, not a curve.
    const { center = [CENTER, CENTER], radius = 1.5, turns = 1 } = p;
    const actor = A(a), steps = 8 * turns, stepDur = 0.2;
    let time = t;
    for (let i = 1; i <= steps; i++) {
      const ang = (i / 8) * Math.PI * 2;
      O.move(actor, center[0] + Math.cos(ang) * radius, center[1] + Math.sin(ang) * radius, tl, time, stepDur, 'sine.inOut');
      time += stepDur;
    }
    return time;
  },

  wander: (tl, t, a, p = {}) => {
    const { range = 2, dur = 1 } = p;
    const actor = A(a);
    const col = Math.max(0, Math.min(8, actor.col + Math.round((Math.random() * 2 - 1) * range)));
    const row = Math.max(0, Math.min(8, actor.row + Math.round((Math.random() * 2 - 1) * range)));
    O.move(actor, col, row, tl, t, dur, 'sine.inOut');
    return t + dur;
  },

  dash: (tl, t, a, p = {}) => {
    const { cells = [], speed = 2 } = p;
    const actor = A(a);
    const stepDur = 0.3 / speed;
    let time = t;
    cells.forEach((c) => {
      O.move(actor, c[0], c[1], tl, time, stepDur, 'power1.in');
      tl.to(actor.el, { opacity: 0.5, duration: stepDur, yoyo: true, repeat: 1 }, time);
      snd(tl, time, () => O.arp('i', stepDur, 60, ctx.currentTime, { vol: 0.06, pan: O.pan(actor) }));
      time += stepDur;
    });
    return time;
  },

  weave: (tl, t, a, p = {}) => {
    const { targets = [], stepDur = 0.3 } = p;
    const actor = A(a);
    let time = t, vol = 0.16;
    targets.forEach((id) => {
      const tg = O.actors[id];
      O.move(actor, tg.col, tg.row, tl, time, stepDur);
      if (actor.lastSemi != null) { const v = vol; snd(tl, time, () => O.voice(actor.voice, actor.lastSemi, ctx.currentTime, stepDur * 0.7, { vol: v, pan: O.pan(actor) })); }
      vol *= 0.7;
      time += stepDur;
    });
    return time;
  },

  scatter: (tl, t, a, p = {}) => {
    const { actors = [], from = [CENTER, CENTER], dur = 0.5 } = p;
    actors.forEach((id, i) => {
      const actor = O.actors[id];
      const ang = (i / actors.length) * Math.PI * 2;
      const col = Math.max(0, Math.min(8, Math.round(from[0] + Math.cos(ang) * 3)));
      const row = Math.max(0, Math.min(8, Math.round(from[1] + Math.sin(ang) * 3)));
      O.move(actor, col, row, tl, t, dur, 'power2.out');
    });
    return t + dur;
  },

  waltz: (tl, t, a, p = {}) => {
    const { partner, turns = 2 } = p;
    const actor = A(a), pt = O.actors[partner], steps = 6 * turns, stepDur = 0.2, dur = steps * stepDur;
    let time = t;
    for (let i = 1; i <= steps; i++) {
      const ang = (i / 6) * Math.PI * 2;
      O.move(actor, pt.col + Math.cos(ang) * 1.2, pt.row + Math.sin(ang) * 1.2, tl, time, stepDur, 'sine.inOut');
      time += stepDur;
    }
    snd(tl, t, () => O.arp('i', dur, 8, ctx.currentTime, { vol: 0.07, pan: 0 }));
    return t + dur;
  },

  touch: (tl, t, a, p = {}) => {
    const actor = A(a), other = O.actors[p.other];
    tl.to([actor.el, other.el], { scale: 1.3, duration: 0.1, yoyo: true, repeat: 1 }, t);
    snd(tl, t, () => O.drum('snare', ctx.currentTime, 0.12));
    return t + 0.2;
  },

  merge: (tl, t, a, p = {}) => {
    const { dur = 0.8 } = p;
    const actor = A(a), other = O.actors[p.other];
    O.move(other, actor.col, actor.row, tl, t, dur);
    tl.to(other.el, { scale: 0, opacity: 0, duration: dur * 0.4 }, t + dur * 0.6);
    if (actor.lastSemi != null) snd(tl, t + dur * 0.6, () => O.voice(actor.voice, actor.lastSemi, ctx.currentTime, dur * 0.6, { vol: 0.18, pan: O.pan(actor) }));
    return t + dur;
  },

  split: (tl, t, a, p = {}) => {
    const { to = [[3, 4], [5, 4]], dur = 0.8, hold = 4 } = p;
    const actor = A(a);
    const ghost = actor.el.cloneNode();
    gridEl.appendChild(ghost);
    const p1 = O.cell(to[0][0], to[0][1]), p2 = O.cell(to[1][0], to[1][1]);
    tl.to(actor.el, { x: p1.x, y: p1.y, duration: dur }, t);
    tl.to(ghost, { x: p2.x, y: p2.y, duration: dur }, t);
    tl.call(() => { actor.col = to[0][0]; actor.row = to[0][1]; }, [], t + dur);
    tl.call(() => ghost.remove(), [], t + dur + hold);
    if (actor.lastSemi != null) snd(tl, t, () => {
      O.voice(actor.voice, actor.lastSemi, ctx.currentTime, dur, { vol: 0.1, pan: -0.6 });
      O.voice(actor.voice, actor.lastSemi, ctx.currentTime, dur, { vol: 0.1, pan: 0.6 });
    });
    return t + dur;
  },

  keepDistance: (tl, t, a, p = {}) => {
    const { target, gap = 3 } = p;
    const actor = A(a), tgt = O.actors[target];
    const d = Math.hypot(actor.col - tgt.col, actor.row - tgt.row);
    if (d < gap) {
      const ang = Math.atan2(actor.row - tgt.row, actor.col - tgt.col) || 0.01;
      const col = Math.max(0, Math.min(8, Math.round(tgt.col + Math.cos(ang) * gap)));
      const row = Math.max(0, Math.min(8, Math.round(tgt.row + Math.sin(ang) * gap)));
      O.move(actor, col, row, tl, t, 0.6);
    }
    return t + 0.6;
  },

  swapSize: (tl, t, a, p = {}) => {
    const { dur = 0.5 } = p;
    const actor = A(a), other = O.actors[p.other];
    const s1 = actor.size, s2 = other.size;
    tl.to(actor.el, { scale: s2, duration: dur }, t);
    tl.to(other.el, { scale: s1, duration: dur }, t);
    tl.call(() => { actor.size = s2; other.size = s1; }, [], t + dur);
    return t + dur;
  },

  fillRing: (tl, t, a, p = {}) => {
    const { center = [CENTER, CENTER], ring = 1, color = '#fff' } = p;
    const ringDots = dots.filter((d) => Math.max(Math.abs(d.col - center[0]), Math.abs(d.row - center[1])) === ring).map((d) => d.el);
    tl.call(() => { tint(ringDots, color); ringDots.forEach((el) => el.style.setProperty('--lit', 1.8)); }, [], t);
    tl.to(ringDots, { scale: 1.3, opacity: 1, duration: 0.4, yoyo: true, repeat: 1 }, t);
    tl.call(() => ringDots.forEach((el) => el.style.setProperty('--lit', 1)), [], t + 0.8);
    snd(tl, t, () => O.arp('i', 0.8, 45, ctx.currentTime, { vol: 0.07 }));
    return t + 0.8;
  },

  // light an arbitrary set of chorus cells, in list order, so a score can
  // draw a shape on the grid (a smile, an eye, a letter, a wall segment).
  paint: (tl, t, a, p = {}) => {
    const { cells = [], color = '#fff', lit = 1, dur = 0.3, stagger = 0.03, hold = 0, silent = false } = p;
    let end = t;
    cells.forEach((c, i) => {
      const d = O.at(c[0], c[1]), dt = t + i * stagger, fin = dt + dur;
      tl.call(() => { tint([d.el], color); d.el.style.setProperty('--lit', lit); }, [], dt);
      tl.to(d.el, { opacity: 1, scale: 1, duration: dur }, dt);
      if (!silent) snd(tl, dt, () => O.voice('arp', O.opera.root, ctx.currentTime, dur, { vol: 0.06, pan: (c[0] - CENTER) / CENTER }));
      if (hold) tl.call(() => d.el.style.setProperty('--lit', 1), [], fin + hold);
      end = Math.max(end, fin);
    });
    return end + hold;
  },

  fillColumn: (tl, t, a, p = {}) => {
    const { col = CENTER, stepDur = 0.3, dir = 'down' } = p;
    let time = t;
    for (let i = 0; i < SIZE; i++) {
      const row = dir === 'up' ? SIZE - 1 - i : i;
      const d = O.at(col, row);
      tl.to(d.el, { opacity: 1, scale: 1.2, duration: stepDur * 0.6, yoyo: true, repeat: 1 }, time);
      snd(tl, time, () => O.voice('arp', O.opera.root - row, ctx.currentTime, stepDur * 0.5, { vol: 0.08 }));
      time += stepDur;
    }
    return time;
  },

  closeIn: (tl, t, a, p = {}) => {
    const { center = [CENTER, CENTER], dur = 1.5 } = p;
    const cp = O.cell(center[0], center[1]);
    const st = distStagger(center, 0.03);
    dots.forEach((d) => {
      const dp = O.cell(d.col, d.row);
      tl.to(d.el, { x: (cp.x - dp.x) * 0.4, y: (cp.y - dp.y) * 0.4, duration: dur, ease: 'power2.in' }, t + st(d));
    });
    snd(tl, t, () => O.auto(O.master.gain, O.master.gain.value, 0.95, dur, ctx.currentTime, 'linear'));
    tl.call(() => dots.forEach((d) => { d.el.style.transform = ''; }), [], t + dur + SIZE * 0.03 + 0.3);
    return t + dur;
  },

  curtainParts: (tl, t, a, p = {}) => {
    const { dur = 1 } = p;
    const left = dots.filter((d) => d.col < CENTER).map((d) => d.el);
    const right = dots.filter((d) => d.col > CENTER).map((d) => d.el);
    tl.to(left, { x: '-=' + cellSize() * 2, duration: dur, ease: 'power2.inOut' }, t);
    tl.to(right, { x: '+=' + cellSize() * 2, duration: dur, ease: 'power2.inOut' }, t);
    snd(tl, t + dur, () => {
      const [b, c] = O.chord('i');
      O.voice('bass', b, ctx.currentTime, 1, { vol: 0.16, pan: 0 });
      O.voice('tenor', c, ctx.currentTime, 1, { vol: 0.14, pan: 0 });
    });
    return t + dur;
  },

  colourWash: (tl, t, a, p = {}) => {
    const { color = '#fff', dur = 2 } = p;
    const target = a === 'grid' || a == null ? dots.map((d) => d.el) : Array.isArray(a) ? a.map((id) => O.actors[id].el) : [A(a).el];
    tl.call(() => target.forEach((el) => el.style.setProperty('--dot-color', color)), [], t);
    tl.to(target, { opacity: 0.8, duration: dur * 0.5, yoyo: true, repeat: 1 }, t);
    snd(tl, t, () => O.setRoom(2200, 0.5, dur, ctx.currentTime));
    return t + dur;
  },

  dim: (tl, t, a, p = {}) => {
    const { to = 0.3, dur = 1 } = p;
    const target = a === 'grid' ? dots.map((d) => d.el) : [A(a).el];
    tl.to(target, { opacity: to, duration: dur }, t);
    return t + dur;
  },

  burnEmber: (tl, t, a, p = {}) => {
    const { dur = 2 } = p;
    const actor = A(a);
    tl.call(() => actor.el.style.setProperty('--dot-color', '#8a1a00'), [], t);
    tl.to(actor.el, { opacity: 0, duration: dur, ease: 'power1.in' }, t);
    snd(tl, t, () => {
      const n = ctx.createBufferSource(); n.buffer = O.noise;
      const bp = ctx.createBiquadFilter(); bp.type = 'lowpass'; bp.frequency.value = 500;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.15, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
      n.connect(bp); bp.connect(g); g.connect(O.master);
      n.start(); n.stop(ctx.currentTime + dur);
    });
    return t + dur;
  },

  zoomTo: (tl, t, a, p = {}) => {
    const { target, zoom = 1.5, dur = 1 } = p;
    const tgt = target ? O.actors[target] : A(a);
    O.camera(tl, t, { col: tgt.col, row: tgt.row, zoom, dur });
    return t + dur;
  },

  shake: (tl, t, a, p = {}) => {
    const { amount = 6, dur = 0.3 } = p;
    tl.to(worldEl, { x: '+=' + amount, duration: dur / 6, yoyo: true, repeat: 5 }, t);
    return t + dur;
  },

  drift: (tl, t, a, p = {}) => {
    const { to = [CENTER, CENTER], dur = 3 } = p;
    O.camera(tl, t, { col: to[0], row: to[1], zoom: 1, dur, ease: 'sine.inOut' });
    return t + dur;
  },

  snapCut: (tl, t, a, p = {}) => {
    const { target, zoom = 1.5 } = p;
    const tgt = target ? O.actors[target] : A(a);
    O.camera(tl, t, { col: tgt.col, row: tgt.row, zoom, dur: 0.001 });
    return t;
  },

  label: (tl, t, a, p = {}) => {
    const { text = '', dur = 0.4 } = p;
    O.label(tl, t, A(a), text, dur);
    return t + dur;
  },

  speech: (tl, t, a, p = {}) => {
    const { text = '', hold = 1 } = p;
    O.speech(tl, t, A(a), text, hold);
    return t + hold;
  },

  stutter: (tl, t, a, p = {}) => {
    const { beats = 4 } = p;
    const actor = A(a);
    const step = 60 / O.opera.tempo / 4;
    tl.to(actor.el, { opacity: 0.3, duration: step, yoyo: true, repeat: beats * 2 - 1 }, t);
    return t + beats * step * 2;
  },

  // approximation: the timeline has no timeScale/onUpdate (it's a minimal
  // x/y/scale/opacity tweener, not full GSAP), so a live clock-ease isn't
  // possible here. Reads instead as a held breath: the grid dips and holds.
  slow: (tl, t, a, p = {}) => {
    const { dur = 1 } = p;
    tl.to(dots.map((d) => d.el), { opacity: 0.7, duration: dur * 0.4, yoyo: true, repeat: 1 }, t);
    return t + dur;
  },

  drum: (tl, t, a, p = {}) => {
    const { pattern = 'kick', vol = 0.15 } = p;
    snd(tl, t, () => O.drum(pattern, ctx.currentTime, vol));
    return t + 0.2;
  },

  echoVoice: (tl, t, a, p = {}) => {
    const { delay = 0.3, voice } = p;
    const actor = A(a);
    const v = voice || (actor.voice === 'tenor' ? 'soprano' : 'tenor');
    if (actor.lastSemi != null) snd(tl, t + delay, () => O.voice(v, actor.lastSemi, ctx.currentTime, 0.6, { vol: 0.06, pan: -O.pan(actor) }));
    return t + delay + 0.6;
  },

  // ---- the spectacle family: moves of the whole mass, the bg or the camera ----

  stage: (tl, t, a, p = {}) => {
    const { bg, grid, dot, gap, dur = 0 } = p;
    if (!dur) { tl.call(() => O.applyStage({ bg, grid, dot, gap }), [], t); return t; }
    if (bg != null) tl.call(() => O.transitionBg(bg, dur), [], t);
    if (grid != null) {
      tl.to(gridEl, { opacity: 0, duration: dur / 2 }, t);
      tl.call(() => O.applyStage({ grid, dot, gap }), [], t + dur / 2);
      tl.to(gridEl, { opacity: 1, duration: dur / 2 }, t + dur / 2);
    } else if (dot != null || gap != null) {
      tl.call(() => O.applyStage({ dot, gap }), [], t);
    }
    return t + dur;
  },

  energy: (tl, t, a, p = {}) => {
    const { level = 5, dur = 1 } = p;
    tl.call(() => O.energy(level, dur, t), [], t);
    return t + dur;
  },

  wipe: (tl, t, a, p = {}) => {
    const { color = '#fff', from = 'left', dur = 0.8, bg = false } = p;
    const horiz = from === 'left' || from === 'right';
    const rev = from === 'right' || from === 'bottom';
    const span = SIZE - 1 || 1;
    dots.forEach((d) => {
      const idx = horiz ? d.col : d.row;
      const dt = t + (rev ? span - idx : idx) / span * dur;
      tl.call(() => d.el.style.setProperty('--dot-color', color), [], dt);
      tl.to(d.el, { opacity: 1, scale: 1, duration: dur / SIZE + 0.05 }, dt);
    });
    if (bg) tl.call(() => O.transitionBg(color, dur), [], t);
    snd(tl, t, () => noiseSwell(dur, horiz ? (rev ? 1 : -1) : 0));
    return t + dur;
  },

  flood: (tl, t, a, p = {}) => {
    const { color = '#fff', center = [CENTER, CENTER], dur = 1, bg = false } = p;
    const st = distStagger(center, dur / SIZE);
    dots.forEach((d) => {
      const dt = t + st(d);
      tl.call(() => d.el.style.setProperty('--dot-color', color), [], dt);
      tl.to(d.el, { opacity: 1, scale: 1, duration: dur / SIZE + 0.05 }, dt);
    });
    if (bg) tl.call(() => O.transitionBg(color, dur), [], t);
    snd(tl, t, () => { O.setRoom(2400, 0.5, dur, ctx.currentTime); O.voice('tenor', O.opera.root, ctx.currentTime, dur, { vol: 0.14, pan: 0 }); });
    return t + dur;
  },

  blackout: (tl, t, a, p = {}) => {
    const { dur = 0, hold = 0.5 } = p;
    const d = Math.max(dur, 0.05);
    tl.to(dots.map((dd) => dd.el), { opacity: 0, duration: d }, t);
    tl.call(() => O.transitionBg('#000', d), [], t);
    snd(tl, t, () => { O.master.gain.setValueAtTime(0.0001, ctx.currentTime + d); O.setRoom(600, 0.15, hold, ctx.currentTime + d); });
    return t + dur + hold;
  },

  strobe: (tl, t, a, p = {}) => {
    const { a: colA = '#fff', b: colB = '#000', rate = 12, dur = 0.5 } = p;
    const step = 1 / rate, n = Math.floor(dur / step), els = dots.map((d) => d.el);
    for (let i = 0; i < n; i++) {
      const c = i % 2 ? colB : colA, dt = t + i * step;
      tl.call(() => { document.body.style.background = c; tint(els, c); els.forEach((el) => { el.style.opacity = 1; el.style.transform = 'scale(1)'; }); }, [], dt);
      snd(tl, dt, () => O.drum('hat', ctx.currentTime, 0.12));
    }
    return t + dur;
  },

  tide: (tl, t, a, p = {}) => {
    const { dir = 'down', period = 1.2, repeat = 3, color = '#fff' } = p;
    const rows = dir === 'up' || dir === 'down';
    const rev = dir === 'up' || dir === 'left';
    const span = SIZE - 1 || 1;
    for (let rep = 0; rep < repeat; rep++) {
      const base = t + rep * period;
      dots.forEach((d) => {
        const idx = rows ? d.row : d.col;
        const dt = base + (rev ? span - idx : idx) / span * period;
        tl.call(() => d.el.style.setProperty('--dot-color', color), [], dt);
        tl.to(d.el, { opacity: 1, scale: 1.15, duration: period / SIZE + 0.05, yoyo: true, repeat: 1 }, dt);
      });
      snd(tl, base, () => O.arp('i', period, 20, ctx.currentTime, { vol: 0.07 }));
    }
    return t + repeat * period;
  },

  swarm: (tl, t, a, p = {}) => {
    const { target, dur = 1.5, spread = 0.5 } = p;
    const tc = typeof target === 'string' ? [O.actors[target].col, O.actors[target].row] : target || [CENTER, CENTER];
    const cp = O.cell(tc[0], tc[1]);
    const st = distStagger(tc, (dur * 0.6) / SIZE);
    dots.forEach((d) => {
      const dp = O.cell(d.col, d.row), dt = t + st(d), jig = (Math.random() - 0.5) * spread * cellSize();
      tl.to(d.el, { x: cp.x - dp.x + jig, y: cp.y - dp.y + jig, opacity: 1, scale: 0.6, duration: Math.max(dur - st(d), 0.2) }, dt);
    });
    snd(tl, t, () => { O.auto(O.master.gain, O.master.gain.value, 0.95, dur, ctx.currentTime, 'linear'); O.setRoom(700, 0.55, dur, ctx.currentTime); });
    return t + dur;
  },

  shatter: (tl, t, a, p = {}) => {
    const { center = [CENTER, CENTER], dur = 0.6 } = p;
    const cp = O.cell(center[0], center[1]), far = cellSize() * SIZE;
    dots.forEach((d) => {
      const dp = O.cell(d.col, d.row);
      const ang = Math.atan2(dp.y - cp.y, dp.x - cp.x) || Math.random() * PI2;
      tl.to(d.el, { x: dp.x + Math.cos(ang) * far, y: dp.y + Math.sin(ang) * far, opacity: 0, duration: dur, ease: 'power2.in' }, t);
    });
    snd(tl, t, () => { const [b, c] = O.chord('v'); O.voice('bass', b, ctx.currentTime, 0.4, { vol: 0.2 }); O.voice('tenor', c, ctx.currentTime, 0.4, { vol: 0.18 }); O.master.gain.setValueAtTime(O.master.gain.value, ctx.currentTime + dur); O.master.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + dur + 0.3); });
    tl.call(() => dots.forEach((d) => { d.el.style.transform = ''; d.el.style.opacity = 0; }), [], t + dur + 0.5);
    return t + dur;
  },

  collapse: (tl, t, a, p = {}) => {
    const { dur = 1.5, stagger: stg = 0.06 } = p;
    for (let row = 0; row < SIZE; row++) {
      const dt = t + row * stg, rowDots = dots.filter((d) => d.row === row).map((d) => d.el);
      tl.to(rowDots, { y: '+=' + cellSize() * (SIZE - row + 2), opacity: 0, duration: Math.max(dur - row * stg, 0.2), ease: 'power2.in' }, dt);
    }
    snd(tl, t, () => { O.voice('bass', O.opera.root - 12, ctx.currentTime, dur, { vol: 0.22 }); O.setRoom(500, 0.2, dur, ctx.currentTime); });
    return t + dur;
  },

  bloom: (tl, t, a, p = {}) => {
    const { actor, dur = 2, hold = 1 } = p;
    const act = A(actor ?? a);
    const scale = (Math.hypot(innerWidth, innerHeight) / cellSize()) * 1.5;
    tl.to(act.el, { scale, duration: dur, ease: 'power2.in' }, t);
    tl.call(() => O.transitionBg(act.color, 0.3), [], t + dur * 0.6);
    if (act.lastSemi != null) snd(tl, t, () => O.voice(act.voice, act.lastSemi, ctx.currentTime, dur + hold, { vol: 0.22, pan: 0 }));
    snd(tl, t, () => O.auto(O.master.gain, O.master.gain.value, 0.95, dur, ctx.currentTime, 'linear'));
    return t + dur + hold;
  },

  quake: (tl, t, a, p = {}) => {
    const { amount = 8, dur = 0.6 } = p;
    tl.to(worldEl, { x: '+=' + amount, duration: dur / 8, yoyo: true, repeat: 7 }, t);
    dots.forEach((d) => {
      const jx = (Math.random() - 0.5) * amount, jy = (Math.random() - 0.5) * amount;
      tl.to(d.el, { x: '+=' + jx, y: '+=' + jy, duration: dur / 4, yoyo: true, repeat: 3 }, t);
    });
    snd(tl, t, () => O.voice('bass', O.opera.root - 12, ctx.currentTime, dur, { vol: 0.2, grit: true }));
    return t + dur;
  },

  zoomCrash: (tl, t, a, p = {}) => {
    const { target, zoom = 3, dur = 0.25 } = p;
    const tgt = target ? O.actors[target] : A(a);
    O.camera(tl, t, { col: tgt.col, row: tgt.row, zoom, dur, ease: 'power2.in' });
    snd(tl, t + dur, () => O.drum('kick', ctx.currentTime, 0.3));
    return t + dur;
  },

  titleCard: (tl, t, a, p = {}) => {
    const { text = '', size = 40, hold = 1.5, color = '#fff' } = p;
    O.titleCard(tl, t, text, size, hold, color);
    return t + hold;
  },

  // light on water: a CSS animation per dot (opacity + hue only, no
  // transform/box-shadow in the loop, so it costs nothing after the one
  // style write that starts it - see the 60fps rule).
  shimmer: (tl, t, a, p = {}) => {
    const { amount = 0.3, rate = 2, hue = 10, dur = 4 } = p;
    const period = 1 / rate;
    tl.call(() => dots.forEach((d) => {
      d.el.style.setProperty('--sh-amt', amount);
      d.el.style.setProperty('--sh-hue', hue + 'deg');
      d.el.style.animation = `shimmer ${period}s ease-in-out infinite`;
      d.el.style.animationDelay = -(Math.random() * period) + 's';
    }), [], t);
    tl.call(() => dots.forEach((d) => { d.el.style.animation = ''; }), [], t + dur);
    snd(tl, t, () => O.arp('i', dur, 14, ctx.currentTime, { vol: 0.05 }));
    return t + dur;
  },
};
