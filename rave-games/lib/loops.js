/* Loops: a level's tune as a 16-step pattern per bar, played by the synth.
   LOOPS.play(spec, t, b, bar) schedules one bar of the spec at audio time t
   with beat length b (bar index `bar`, for patterns longer than one bar).
   spec: { bpm, key: [root, mode], parts: { acid, bass, stab, lead, pad }, drums: { k, s, c, h, o } }
     a part is an array of bars; a bar is an array of 16 steps; a step is '.' (rest), a
     scale degree ('1', '3+', '5b-'), or [degree, { accent, slide, len }] with len in steps
     (default 1 for acid, 2 for bass, 1 for stab); the degree tokens are the arcade's.
     drums are strings of 16 characters per bar: 'x' a hit, 'X' an accent, '.' a rest;
     k kick, s snare, c clap, h closed hat, o open hat.
   Every loop here is an original in the manner of the record the level names: its tempo,
   its kit, its chord move and its sound. No melody is quoted. */

'use strict';

const LOOPS = {};
LOOPS.play = (spec, t, b, bar = 0) => {
  const step = b / 4;
  const barOf = (part) => part[bar % part.length];
  if (spec.key) S.key(...spec.key);
  const parts = spec.parts || {};
  for (const name in parts) {
    const inst = { acid: 'acid', bass: 'bass', stab: 'stab', lead: 'pulse', pad: 'pad', tenor: 'tenor', arp: 'arp' }[name] || name;
    const bars = parts[name];
    const steps = barOf(bars);
    steps.forEach((st, i) => {
      if (st === '.' || st == null) return;
      const [deg, o] = Array.isArray(st) ? st : [st, {}];
      const len = o.len ?? (name === 'bass' ? 2 : 1);
      S.voice(inst, S.deg(deg), t + i * step, step * len * 0.9, { vol: o.vol ?? spec.vol?.[name], accent: o.accent, slide: o.slide, light: o.light });
    });
  }
  const drums = spec.drums || {};
  const kinds = { k: 'kick', s: 'snare', c: 'clap', h: 'hat', o: 'hat' };
  for (const d in drums) {
    const pat = barOf(drums[d]);
    for (let i = 0; i < 16; i++) {
      const ch = pat[i];
      if (ch !== 'x' && ch !== 'X') continue;
      const vol = (spec.drumVol?.[d] ?? (d === 'k' ? 0.2 : d === 'c' ? 0.14 : 0.07)) * (ch === 'X' ? 1.4 : 1);
      S.drum(kinds[d], t + i * step, d === 'o' ? vol * 1.6 : vol, i === 0 && d === 'k' ? 'kick' : null);
    }
  }
};
