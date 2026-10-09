/* The Dot Opera synth, ported to LittleJS.
   A port of ../../src/engine/synth.js and score.js: the same instrument
   recipes (formant soprano, detuned sawtooth tenor, triangle bass, square
   arp), the same one voice function, the same room (two cross-fed delays
   with a low-pass in the feedback), percussion from one noise buffer, and
   the score helpers (scale degrees, roman numeral chords, motifs, the
   transform kit). Follows ../../docs/music-guide.md.

   Differences from the original:
   - It uses LittleJS's audioContext and routes into audioMasterGain, so the
     engine's own autoplay handling (resume on first input) and volume apply.
   - No DOM lights. A note's `light` option is a string key; S.amp(key) reads
     the voice's envelope right now, so a sprite can glow with its voice.
   - S.key(root, mode) replaces O.opera.root / O.opera.mode.
   All times are audioContext seconds. S.now() is the clock. */

'use strict';

const S = {};

const SYNTH_MODES = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  harmonic: [0, 2, 3, 5, 7, 8, 11],
};

// ---- the house cast ----
S.inst = {
  tenor: { wave: 'sawtooth', detune: 4.5, attack: 0.05, decay: 0.12, release: 0.35, filterStart: 550, filterEnd: 2400, filterClose: 600, vibratoDepth: 4, vibratoDelay: 0.22, gain: 0.16, layer: 0.5, layerGain: 0.4 },
  soprano: {
    wave: 'sine', attack: 0.06, decay: 0.15, release: 0.6, gain: 0.15, formant: true,
    harmonics: [[1, 'sine', 0.85, 0], [2, 'triangle', 0.38, 2.5], [3, 'sine', 0.22, -1.5], [4, 'sine', 0.10, 1.0], [5, 'sine', 0.05, 0]],
    formants: [[850, 2.8, 0.65], [1550, 3.0, 0.55], [2950, 4.5, 1.25]],
    lfoRate: 5.3, lfoDelay: [0.15, 0.5], vibDepth: 5.8, tremolo: 0.20, breathFreq: 3600, roomSend: 1.55,
  },
  bass: { wave: 'triangle', detune: 0, attack: 0.02, decay: 0.1, release: 0.4, filterStart: 300, filterEnd: 500, vibratoDepth: 0, vibratoDelay: 0, gain: 0.2, octave: -1 },
  arp: { wave: 'square', detune: 0, attack: 0.005, decay: 0.04, release: 0.05, filterStart: 2600, filterEnd: 800, vibratoDepth: 0, vibratoDelay: 0, gain: 0.09 },
  // the chiptune pulse lead the microgame docs ask for: a square with a fast filter open
  pulse: { wave: 'square', detune: 3, attack: 0.01, decay: 0.06, release: 0.12, filterStart: 900, filterEnd: 3200, filterClose: 1200, vibratoDepth: 0, vibratoDelay: 0, gain: 0.1 },
  // ---- the 1989 additions (rave-games) ----
  // a 303-style line: one saw through a resonant lowpass whose cutoff falls through the note (the squelch); o.accent opens it wider
  acid: { wave: 'sawtooth', detune: 0, attack: 0.004, decay: 0.12, release: 0.06, filterStart: 1800, filterEnd: 420, filterClose: 260, q: 9, vibratoDepth: 0, vibratoDelay: 0, gain: 0.11 },
  // a piano stab for the Italo and Detroit levels: two detuned squares and an octave layer, fast decay
  stab: { wave: 'square', detune: 7, attack: 0.004, decay: 0.16, release: 0.1, filterStart: 3200, filterEnd: 900, filterClose: 600, layer: 2, layerGain: 0.25, vibratoDepth: 0, vibratoDelay: 0, gain: 0.09 },
  // a soft pad for the morning levels: triangle, slow attack
  pad: { wave: 'triangle', detune: 5, attack: 0.5, decay: 0.3, release: 0.9, filterStart: 600, filterEnd: 1400, vibratoDepth: 2, vibratoDelay: 0.6, gain: 0.08, roomSend: 1.4 },
};

let sctx = null;
S.master = null;
S.room = null;
S.roomSend = null;
S.noise = null;
S.root = 0;
S.mode = 'minor';

// ---- light is the voice: envelopes keyed by name, read back with S.amp ----
let synthEnvs = [];
S.registerLight = (key, start, end, ampFn) => { if (key) synthEnvs.push({ key, start, end, ampFn }); };
S.amp = (key) => {
  const now = S.now();
  let peak = 0;
  synthEnvs = synthEnvs.filter((e) => now <= e.end);
  for (const e of synthEnvs)
    if (e.key === key && now >= e.start) peak = Math.max(peak, Math.min(1.4, e.ampFn(now - e.start)));
  return peak;
};

function synthEnvAmp(inst, dur, el) {
  let base;
  if (inst.formant && dur > 1.2) {
    if (el < 0.08) base = (el / 0.08) * 0.42;
    else if (el < dur * 0.38) base = 0.42 + ((el - 0.08) / (dur * 0.38 - 0.08)) * 0.58;
    else if (el < dur * 0.72) base = 1;
    else if (el < dur) base = Math.exp((-(el - dur * 0.72) / (dur * 0.28)) * 5);
    else base = 0;
  } else {
    const sus = 0.35;
    if (el < inst.attack) base = el / inst.attack;
    else if (el < inst.attack + inst.decay) base = 1 + (sus - 1) * ((el - inst.attack) / inst.decay);
    else if (el < Math.max(inst.attack + inst.decay, dur)) base = sus;
    else base = sus * Math.exp((-(el - Math.max(inst.attack + inst.decay, dur)) / inst.release) * 5);
  }
  const rate = inst.lfoRate || 5.2;
  const d0 = inst.lfoDelay ? inst.lfoDelay[0] : inst.vibratoDelay;
  const d1 = inst.lfoDelay ? inst.lfoDelay[1] : (inst.vibratoDelay || 0) + 0.2;
  const depth = inst.tremolo ?? (inst.vibratoDepth ? inst.vibratoDepth / 60 : 0);
  if (depth > 0 && el > d0) {
    const ramp = Math.max(0, Math.min(1, (el - d0) / Math.max(d1 - d0, 0.001)));
    base *= 1 + depth * ramp * Math.sin(2 * PI * rate * el);
  }
  return base;
}

// Build the graph on LittleJS's context. Call once, any time after the
// engine has loaded; the context resumes itself on the first input.
S.init = () => {
  if (sctx) return;
  sctx = audioContext;
  S.master = sctx.createGain();
  S.master.gain.value = 0.85;
  S.master.connect(audioMasterGain);

  const dl = sctx.createDelay(1), dr = sctx.createDelay(1);
  dl.delayTime.value = 0.31; dr.delayTime.value = 0.47;
  const lp = sctx.createBiquadFilter(), lp2 = sctx.createBiquadFilter();
  lp.type = lp2.type = 'lowpass'; lp.frequency.value = lp2.frequency.value = 1800;
  const fbL = sctx.createGain(), fbR = sctx.createGain();
  fbL.gain.value = 0.45; fbR.gain.value = 0.45;
  dl.connect(lp); lp.connect(fbL); fbL.connect(dr); lp.connect(S.master);
  dr.connect(lp2); lp2.connect(fbR); fbR.connect(dl); lp2.connect(S.master);
  S.room = { dl, dr, lp, lp2, fbL, fbR };
  S.roomSend = sctx.createGain();
  S.roomSend.gain.value = 0.5;
  S.roomSend.connect(dl);
  S.roomSend.connect(dr);

  const buf = sctx.createBuffer(1, sctx.sampleRate, sctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  S.noise = buf;
};

S.now = () => (sctx ? sctx.currentTime : 0);
S.key = (root, mode) => { S.root = root; S.mode = mode; };

S.setRoom = (cutoff, feedback, dur = 1.5, t = S.now()) => {
  const r = S.room;
  if (!r) return;
  for (const f of [r.lp, r.lp2]) {
    f.frequency.setValueAtTime(f.frequency.value, t);
    f.frequency.linearRampToValueAtTime(cutoff, t + dur);
  }
  for (const g of [r.fbL, r.fbR]) {
    g.gain.setValueAtTime(g.gain.value, t);
    g.gain.linearRampToValueAtTime(feedback, t + dur);
  }
};

S.hz = (semi) => 130.81 * Math.pow(2, semi / 12);

S.auto = (param, start, end, dur, t, curve = 'exp') => {
  const floor = curve === 'exp' ? 0.0001 : start;
  param.setValueAtTime(Math.max(start, floor), t);
  if (curve === 'exp') param.exponentialRampToValueAtTime(Math.max(end, 0.0001), t + dur);
  else param.linearRampToValueAtTime(end, t + dur);
};

// the master swell and the hard drop, in audio time
S.swell = (to, t, dur) => S.auto(S.master.gain, S.master.gain.value, to, dur, t, 'linear');
S.silence = (t, dur) => {
  const g = S.master.gain, v = 0.85;
  g.cancelScheduledValues(t);
  g.setValueAtTime(0.0001, t);
  g.setValueAtTime(v, t + dur);
};

// one generic voice, driven entirely by the instrument object
S.voice = (name, semi, t, dur, o = {}) => {
  if (semi == null || !sctx) return;
  const inst = S.inst[name];
  const vol = o.vol ?? inst.gain, pan = o.pan || 0;
  let freq = S.hz(semi);
  if (inst.octave) freq *= Math.pow(2, inst.octave);
  const g = sctx.createGain();
  const stop = t + dur + inst.release + 0.05;

  let vibGain = null;
  if (inst.formant) {
    if (dur > 1.2) {
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(vol * 0.42, t + 0.08);
      g.gain.linearRampToValueAtTime(vol, t + dur * 0.38);
      g.gain.setValueAtTime(vol, t + dur * 0.72);
      g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    } else {
      const sus = Math.max(vol * 0.35, 0.0003);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(vol, t + inst.attack);
      g.gain.exponentialRampToValueAtTime(sus, t + inst.attack + inst.decay);
      g.gain.setValueAtTime(sus, Math.max(t + inst.attack + inst.decay, t + dur));
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur + inst.release);
    }
    if (dur > 0.5) {
      const lfo = sctx.createOscillator();
      lfo.type = 'sine'; lfo.frequency.value = inst.lfoRate;
      lfo.start(t); lfo.stop(stop);
      vibGain = sctx.createGain();
      vibGain.gain.setValueAtTime(0, t);
      vibGain.gain.setValueAtTime(0, t + inst.lfoDelay[0]);
      vibGain.gain.linearRampToValueAtTime(inst.vibDepth, t + inst.lfoDelay[1]);
      lfo.connect(vibGain);
      const trem = sctx.createGain();
      trem.gain.value = vol * inst.tremolo;
      vibGain.connect(trem);
      trem.connect(g.gain);
    }
    const glottis = sctx.createGain();
    const chains = inst.formants.map(([ffreq, q, flvl]) => {
      const bp = sctx.createBiquadFilter();
      bp.type = 'bandpass'; bp.frequency.value = ffreq; bp.Q.value = q;
      bp.connect(g);
      const fg = sctx.createGain(); fg.gain.value = flvl;
      fg.connect(bp);
      glottis.connect(fg);
      return bp;
    });
    if (vibGain) {
      const f3Mod = sctx.createGain(); f3Mod.gain.value = 24;
      vibGain.connect(f3Mod);
      f3Mod.connect(chains[2].frequency);
    }
    inst.harmonics.forEach(([mult, type, lvl, det]) => {
      const osc = sctx.createOscillator();
      osc.type = type;
      const target = freq * mult;
      osc.frequency.setValueAtTime(target * 0.915, t);
      osc.frequency.exponentialRampToValueAtTime(target, t + 0.075);
      osc.detune.setValueAtTime(det, t);
      if (vibGain) vibGain.connect(osc.frequency);
      const hg = sctx.createGain(); hg.gain.value = lvl;
      osc.connect(hg); hg.connect(glottis);
      osc.start(t); osc.stop(stop);
    });
    if (S.noise) {
      const n = sctx.createBufferSource(); n.buffer = S.noise;
      const bp = sctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = inst.breathFreq; bp.Q.value = 2;
      const ng = sctx.createGain();
      ng.gain.setValueAtTime(0.0001, t);
      ng.gain.linearRampToValueAtTime(0.015 * vol, t + 0.01);
      ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
      n.connect(bp); bp.connect(ng); ng.connect(g);
      n.start(t); n.stop(t + 0.09);
    }
  } else {
    const sus = Math.max(vol * 0.35, 0.0003);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + inst.attack);
    g.gain.exponentialRampToValueAtTime(sus, t + inst.attack + inst.decay);
    g.gain.setValueAtTime(sus, Math.max(t + inst.attack + inst.decay, t + dur));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur + inst.release);

    const f = sctx.createBiquadFilter();
    f.type = 'lowpass';
    if (inst.q) f.Q.value = inst.q;
    f.frequency.setValueAtTime(inst.filterStart * (o.accent ? 1.8 : 1), t);
    f.frequency.exponentialRampToValueAtTime(Math.max(inst.filterEnd, 20), t + Math.max(inst.attack * 1.5, 0.05));
    if (inst.filterClose) f.frequency.exponentialRampToValueAtTime(Math.max(inst.filterClose, 20), t + dur);
    f.connect(g);

    let dest = f;
    if (o.grit) {
      // ring mod: a saw at half frequency drives the gain the oscillators pass through, for menace
      const ringOsc = sctx.createOscillator();
      ringOsc.type = 'sawtooth';
      ringOsc.frequency.setValueAtTime(freq * (o.grit === true ? 0.5 : o.grit), t);
      ringOsc.start(t); ringOsc.stop(stop);
      const ringGain = sctx.createGain();
      ringGain.gain.value = 0.55;
      ringOsc.connect(ringGain.gain);
      ringGain.connect(f);
      dest = ringGain;
    }
    const oscs = [];
    const mk = (fr, det) => {
      const osc = sctx.createOscillator();
      osc.type = inst.wave;
      osc.frequency.setValueAtTime(fr, t);
      if (o.slide) osc.frequency.exponentialRampToValueAtTime(fr * Math.pow(2, o.slide / 12), t + dur);
      if (det) osc.detune.setValueAtTime(det, t);
      osc.connect(dest);
      osc.start(t);
      osc.stop(stop);
      oscs.push(osc);
    };
    if (inst.detune) { mk(freq, -inst.detune); mk(freq, inst.detune); } else mk(freq, 0);
    if (inst.layer) {
      const lg = sctx.createGain(); lg.gain.value = inst.layerGain ?? 0.32;
      const lo = sctx.createOscillator();
      lo.type = inst.wave;
      lo.frequency.setValueAtTime(freq * inst.layer, t);
      lo.connect(lg); lg.connect(dest);
      lo.start(t); lo.stop(stop);
    }
    const vd = o.vibrato ?? inst.vibratoDepth;
    if (vd) {
      const lfo = sctx.createOscillator();
      lfo.type = 'sine'; lfo.frequency.value = 5.2;
      lfo.start(t); lfo.stop(stop);
      const dep = sctx.createGain();
      dep.gain.setValueAtTime(0, t);
      dep.gain.setValueAtTime(0, t + inst.vibratoDelay);
      dep.gain.linearRampToValueAtTime(vd, t + inst.vibratoDelay + 0.2);
      lfo.connect(dep);
      oscs.forEach((osc) => dep.connect(osc.frequency));
    }
  }

  const pn = sctx.createStereoPanner();
  pn.pan.setValueAtTime(Math.max(-1, Math.min(1, pan)), t);
  g.connect(pn);
  pn.connect(S.master);
  const send = sctx.createGain();
  send.gain.value = inst.roomSend ?? 1;
  pn.connect(send);
  send.connect(S.roomSend);

  if (o.light) {
    const ratio = Math.min(1.4, vol / inst.gain);
    S.registerLight(o.light, t, stop, (el) => synthEnvAmp(inst, dur, el) * ratio);
  }
};

// ---- pitch: scale degree -> semitone, roman numeral -> chord ----
function synthSemitone(n) {
  const m = SYNTH_MODES[S.mode];
  const i = n - 1;
  return m[((i % 7) + 7) % 7] + 12 * Math.floor(i / 7);
}
S.deg = (d) => {
  let s = String(d), oct = 0;
  if (s === '0' || s === '.') return null;
  while (s.endsWith('+')) { oct++; s = s.slice(0, -1); }
  while (s.endsWith('-')) { oct--; s = s.slice(0, -1); }
  const acc = s.endsWith('#') ? 1 : s.endsWith('b') ? -1 : 0;
  if (acc) s = s.slice(0, -1);
  return S.root + synthSemitone(+s) + 12 * oct + acc;
};
const SYNTH_ROMAN = { i: 1, ii: 2, iii: 3, iv: 4, v: 5, vi: 6, vii: 7 };
S.chord = (numeral) => {
  const seventh = numeral.indexOf('7') > -1;
  const dimq = /o/i.test(numeral) && !seventh;
  const n = SYNTH_ROMAN[numeral.replace(/[7oO]/g, '').toLowerCase()];
  const bass = S.root + synthSemitone(n) - 12;
  const colour = seventh ? S.root + synthSemitone(n + 6)
    : dimq ? S.root + synthSemitone(n + 4) - 1
    : S.root + synthSemitone(n + 2);
  return [bass, colour];
};
S.motif = (degs, rhythm) => [degs.split(' ').map(S.deg), rhythm];

// ---- transform kit: each a function on a [semis, rhythm] pair ----
S.T = {
  tr: (n) => ([s, r]) => [s.map((x) => (x == null ? x : x + n)), r],
  mi: () => ([s, r]) => [s.map((x) => { if (x == null) return x; const d = ((x - S.root) % 12 + 12) % 12; return d === 4 || d === 9 ? x - 1 : x; }), r],
  ma: () => ([s, r]) => [s.map((x) => { if (x == null) return x; const d = ((x - S.root) % 12 + 12) % 12; return d === 3 || d === 8 ? x + 1 : x; }), r],
  inv: () => ([s, r]) => { const b = s.find((x) => x != null) ?? 0; return [s.map((x) => (x == null ? x : 2 * b - x)), r]; },
  aug: () => ([s, r]) => [s, r.split('').map((c) => c + (c === 'x' ? '-' : c)).join('')],
  dim: () => ([s, r]) => [s, (r.match(/.{1,2}/g) || []).map((p) => p[0]).join('')],
  frag: (n = 3) => ([s, r]) => [s.slice(0, n), r],
  retro: () => ([s, r]) => [s.slice().reverse(), r.split('').reverse().join('')],
};

// ---- playing a motif pair on a voice. rhythm: x = note on, - = hold, . = rest, one eighth each ----
S.play = (voice, pair, t, o = {}) => {
  const [semis, rhythm] = pair;
  const beat = o.beat || 0.5;
  const eighth = beat / 2;
  let time = t, idx = 0, curStart = null, curSemi = null, curLen = 0;
  const flush = () => {
    if (curLen > 0 && curSemi != null) S.voice(voice, curSemi + (o.up || 0), curStart, curLen * eighth * (o.legato ?? 0.95), o);
    if (curLen > 0 && o.onNote) o.onNote(curStart, curLen * eighth, curSemi);
  };
  for (let i = 0; i < rhythm.length; i++) {
    const c = rhythm[i];
    if (c === 'x') {
      flush();
      curSemi = semis[idx % semis.length]; idx++;
      curStart = time; curLen = 1;
    } else if (c === '-') {
      curLen++;
    } else {
      flush();
      curSemi = null; curLen = 0;
    }
    time += eighth;
  }
  flush();
  return time;
};

// ---- percussion: one noise buffer, a handful of recipes ----
S.drum = (kind, t, vol = 0.15, light) => {
  if (!sctx) return;
  if (kind === 'kick') {
    const o = sctx.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(150, t);
    o.frequency.exponentialRampToValueAtTime(40, t + 0.06);
    const g = sctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
    o.connect(g); g.connect(S.master); g.connect(S.roomSend);
    o.start(t); o.stop(t + 0.2);
    if (light) S.registerLight(light, t, t + 0.18, (el) => Math.max(0, 1 - el / 0.18));
  } else if (kind === 'clap') {
    // a 909-style clap: three short noise bursts then a longer one, through a bandpass
    for (let i = 0; i < 4; i++) {
      const n = sctx.createBufferSource(); n.buffer = S.noise;
      const bp = sctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1300; bp.Q.value = 1.2;
      const ng = sctx.createGain(), at = t + i * 0.011, d = i < 3 ? 0.012 : 0.12;
      ng.gain.setValueAtTime(vol * 0.9, at);
      ng.gain.exponentialRampToValueAtTime(0.0001, at + d);
      n.connect(bp); bp.connect(ng); ng.connect(S.master); ng.connect(S.roomSend);
      n.start(at); n.stop(at + d + 0.01);
    }
    if (light) S.registerLight(light, t, t + 0.15, (el) => Math.max(0, 1 - el / 0.15));
  } else if (kind === 'heartbeat') {
    S.drum('kick', t, vol, light);
    S.drum('kick', t + 0.17, vol * 0.65, light);
  } else if (kind === 'snare') {
    S.drum('kick', t, vol * 0.7, light);
    const n = sctx.createBufferSource(); n.buffer = S.noise;
    const bp = sctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1500;
    const ng = sctx.createGain();
    ng.gain.setValueAtTime(vol * 0.8, t);
    ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
    n.connect(bp); bp.connect(ng); ng.connect(S.master); ng.connect(S.roomSend);
    n.start(t); n.stop(t + 0.12);
  } else if (kind === 'hat') {
    const n = sctx.createBufferSource(); n.buffer = S.noise;
    const hp = sctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 6000;
    const ng = sctx.createGain();
    ng.gain.setValueAtTime(vol * 0.6, t);
    ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
    n.connect(hp); hp.connect(ng); ng.connect(S.master);
    n.start(t); n.stop(t + 0.05);
    if (light) S.registerLight(light, t, t + 0.05, (el) => Math.max(0, 1 - el / 0.05));
  } else if (kind === 'thunder' || kind === 'crowd') {
    // a long low noise wash: thunder for a storm, a crowd for the arena
    const n = sctx.createBufferSource(); n.buffer = S.noise;
    const lp = sctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = kind === 'thunder' ? 220 : 900;
    const ng = sctx.createGain();
    const d = kind === 'thunder' ? 1.6 : 1.0;
    ng.gain.setValueAtTime(0.0001, t);
    ng.gain.linearRampToValueAtTime(vol, t + 0.05);
    ng.gain.exponentialRampToValueAtTime(0.0001, t + d);
    n.connect(lp); lp.connect(ng); ng.connect(S.master); ng.connect(S.roomSend);
    n.start(t); n.stop(t + d);
    if (light) S.registerLight(light, t, t + d, (el) => Math.max(0, 1 - el / d));
  } else if (kind === 'breath') {
    const n = sctx.createBufferSource(); n.buffer = S.noise;
    const bp = sctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 2400; bp.Q.value = 0.7;
    const ng = sctx.createGain();
    ng.gain.setValueAtTime(0.0001, t);
    ng.gain.linearRampToValueAtTime(vol * 0.5, t + 0.12);
    ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
    n.connect(bp); bp.connect(ng); ng.connect(S.master);
    n.start(t); n.stop(t + 0.5);
  }
};

// a chord arpeggio: one oscillator cycling the triad at rateHz (50 Hz implies a chord, C64 style)
S.arp = (numeral, dur, rateHz, t, o = {}) => {
  if (!sctx) return;
  const [bass, colour] = S.chord(numeral);
  const oct = (o.octave || 0) * 12;
  const fifth = bass + 19;
  const tones = [bass + 12 + oct, colour + oct, fifth + oct];
  const vol = o.vol || 0.08, pan = o.pan || 0;
  const osc = sctx.createOscillator();
  osc.type = o.wave || S.inst.arp.wave;
  const g = sctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.02);
  g.gain.setValueAtTime(vol, t + dur * 0.8);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  const step = 1 / rateHz, steps = Math.floor(dur / step);
  for (let s = 0; s < steps; s++) osc.frequency.setValueAtTime(S.hz(tones[s % tones.length]), t + s * step);
  const pn = sctx.createStereoPanner();
  pn.pan.setValueAtTime(pan, t);
  osc.connect(g); g.connect(pn); pn.connect(S.master); pn.connect(S.roomSend);
  osc.start(t); osc.stop(t + dur + 0.05);
  if (o.light) S.registerLight(o.light, t, t + dur, (el) => Math.min(1, vol / 0.08) * (el < dur * 0.8 ? 1 : (dur - el) / (dur * 0.2)));
};

// a held drone: one oscillator, optional second a tritone up, for the card scene and the deathbed
S.drone = (semi, t, dur, o = {}) => {
  if (!sctx) return;
  const vol = o.vol || 0.07;
  const mk = (s, type) => {
    const osc = sctx.createOscillator();
    osc.type = type; osc.frequency.setValueAtTime(S.hz(s), t);
    const g = sctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.4);
    g.gain.setValueAtTime(vol, t + dur - 0.4);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g); g.connect(S.master); g.connect(S.roomSend);
    osc.start(t); osc.stop(t + dur + 0.05);
  };
  mk(semi, o.wave || 'triangle');
  if (o.tritone) mk(semi + 6, 'sawtooth');
};
