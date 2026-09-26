/* Gesture library: name -> (tl, time, actors, params) => endTime.
   Every gesture schedules its own motion and sound (if any) and returns the
   time its business finishes, per docs/gestures.md's contract. */

const A = (actors) => (typeof actors === 'string' && actors !== 'grid' ? O.actors[actors] : actors);

function applyT(pair, spec) {
  if (!spec) return pair;
  if (typeof spec === 'string') return O.T[spec]()(pair);
  if (Array.isArray(spec[0])) return spec.reduce((p, sp) => applyT(p, sp), pair);
  const [name, arg] = spec;
  return O.T[name](arg)(pair);
}

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

  rise: (tl, t, a, p = {}) => {
    const { rows = 2, stepDur = 0.8 } = p;
    const actor = A(a);
    let time = t, col = actor.col, row = actor.row;
    for (let i = 0; i < rows; i++) {
      row -= 1;
      O.move(actor, col, row, tl, time, stepDur);
      if (actor.lastSemi != null) {
        const semi = actor.lastSemi + i * 2;
        snd(tl, time, () => O.voice(actor.voice, semi, ctx.currentTime, stepDur, { vol: 0.12, pan: O.pan(actor) }));
      }
      time += stepDur;
    }
    return time;
  },

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
        O.arp(numeral, dur, 14 + step, ct, { vol: 0.09, pan: -pan });
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
};
