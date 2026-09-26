/* Synth: instrument recipes, one voice function, one automation helper,
   scale-index pitch, chord shapes, the transform kit, the room, percussion.
   Follows docs/music-guide.md. Shared top-level `O` is the engine's public surface. */
const O = {};

// ---- modes: seven semitone offsets each ----
const MODES = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  harmonic: [0, 2, 3, 5, 7, 8, 11],
};

// ---- house cast ----
// Phase 0.5: soprano is the formant voice (the act-seven recipe), ported as
// fields rather than a second function. `formant: true` switches O.voice
// into the formant branch; `harmonics` and `formants` are the five-partial /
// three-bandpass tables, `lfoRate`/`lfoDelay`/`vibDepth`/`tremolo` drive the
// late-blooming 5.3 Hz LFO, `breathFreq` is the onset noise burst's
// band-pass, `roomSend` is a per-instrument multiplier on the shared room
// bus (1 = unchanged, soprano's 1.55 ~= 0.62/0.40 from the original).
// tenor carries `filterClose` (the filter shuts back down by the note's
// end, not just opens) and `layer`/`layerGain` for its sine sub-octave.
// bass carries `octave` (an extra octave shift down, on top of O.chord's
// own -12, so it reads as two octaves under the lead, not a quiet tenor).
O.inst = {
  tenor: { wave: 'sawtooth', detune: 4.5, attack: 0.05, decay: 0.12, release: 0.35, filterStart: 550, filterEnd: 2400, filterClose: 600, vibratoDepth: 4, vibratoDelay: 0.22, gain: 0.16, layer: 0.5, layerGain: 0.4 },
  soprano: {
    wave: 'sine', attack: 0.06, decay: 0.15, release: 0.6, gain: 0.15, formant: true,
    harmonics: [[1, 'sine', 0.85, 0], [2, 'triangle', 0.38, 2.5], [3, 'sine', 0.22, -1.5], [4, 'sine', 0.10, 1.0], [5, 'sine', 0.05, 0]],
    formants: [[850, 2.8, 0.65], [1550, 3.0, 0.55], [2950, 4.5, 1.25]],
    lfoRate: 5.3, lfoDelay: [0.15, 0.5], vibDepth: 5.8, tremolo: 0.20, breathFreq: 3600, roomSend: 1.55,
  },
  bass: { wave: 'triangle', detune: 0, attack: 0.02, decay: 0.1, release: 0.4, filterStart: 300, filterEnd: 500, vibratoDepth: 0, vibratoDelay: 0, gain: 0.2, octave: -1 },
  arp: { wave: 'square', detune: 0, attack: 0.005, decay: 0.04, release: 0.05, filterStart: 2600, filterEnd: 800, vibratoDepth: 0, vibratoDelay: 0, gain: 0.09 },
};

let ctx;
O.master = null;
O.room = null;
O.roomSend = null;
O.noise = null;

// ---- light is the voice: every disc's brightness is a scheduled envelope,
// never a free-running animation. One rAF loop, started with the audio
// context, evaluates every active envelope against the audio clock and
// writes --l. Overlapping envelopes on one element take the max; finished
// ones drop out of the list they came from. ----
let lightEnvs = [];
const lit = new Set();
let lightLoopStarted = false;
O.registerLight = (els, start, end, ampFn) => {
  if (!els) return;
  const list = Array.isArray(els) ? els : [els];
  lightEnvs.push({ els: list, start, end, ampFn });
};
function tickLights() {
  if (ctx) {
    const now = ctx.currentTime;
    lightEnvs = lightEnvs.filter((e) => now <= e.end);
    const peak = new Map();
    for (const e of lightEnvs) {
      if (now < e.start) continue;
      const amp = Math.max(0, Math.min(1.4, e.ampFn(now - e.start)));
      for (const el of e.els) if (amp > (peak.get(el) || 0)) peak.set(el, amp);
    }
    // Every element ever lit is written every frame, so it settles back to
    // its rest level when its envelopes end. Named actors rest at a pilot
    // light (their colour, dim) so the hero never vanishes between notes.
    // Brightness is perceptual: amp^0.5, so a sustain reads as lit.
    for (const [el] of peak) lit.add(el);
    document.querySelectorAll('.actor').forEach((el) => lit.add(el));
    for (const el of lit) {
      const rest = el.classList.contains('actor') ? 0.3 : 0;
      // Brightness follows the envelope on a gentle curve, so a sustain
      // reads as the light itself. Colour falls slower than brightness
      // (sqrt), so a mid-bright gold is still gold, not ochre.
      const amp = Math.max(rest, Math.pow(Math.min(1, peak.get(el) || 0), 0.3));
      const st = el.style, lmax = parseFloat(st.getPropertyValue('--lmax')) || 0.8;
      st.setProperty('--l', (0.22 + amp * (lmax - 0.22)).toFixed(3));
      st.setProperty('--c', ((parseFloat(st.getPropertyValue('--cmax')) || 0.03) * Math.sqrt(amp)).toFixed(3));
    }
  }
  requestAnimationFrame(tickLights);
}
function startLightLoop() {
  if (lightLoopStarted) return;
  lightLoopStarted = true;
  requestAnimationFrame(tickLights);
}

// the normalised 0-1 amplitude of a voice's own gain envelope at `el`
// seconds after note-on, plus its late-blooming vibrato/tremolo wobble -
// exactly the fields that shape the sound, read back as light.
function envAmp(inst, dur, el) {
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
    base *= 1 + depth * ramp * Math.sin(PI2 * rate * el);
  }
  return base;
}

O.initAudio = () => {
  if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
  ctx = new (window.AudioContext || window.webkitAudioContext)();
  startLightLoop();
  O.master = ctx.createGain();
  O.master.gain.value = 0.85;
  O.master.connect(ctx.destination);

  const dl = ctx.createDelay(1), dr = ctx.createDelay(1);
  dl.delayTime.value = 0.31; dr.delayTime.value = 0.47;
  // Cross-fed: each delay has its own low-pass and feedback gain into the
  // other, so the round-trip loop gain is fbL*fbR, never their sum.
  const lp = ctx.createBiquadFilter(), lp2 = ctx.createBiquadFilter();
  lp.type = lp2.type = 'lowpass'; lp.frequency.value = lp2.frequency.value = 1800;
  const fbL = ctx.createGain(), fbR = ctx.createGain();
  fbL.gain.value = 0.45; fbR.gain.value = 0.45;
  dl.connect(lp); lp.connect(fbL); fbL.connect(dr); lp.connect(O.master);
  dr.connect(lp2); lp2.connect(fbR); fbR.connect(dl); lp2.connect(O.master);
  O.room = { dl, dr, lp, lp2, fbL, fbR };
  O.roomSend = ctx.createGain();
  O.roomSend.gain.value = 0.5;
  O.roomSend.connect(dl);
  O.roomSend.connect(dr);

  const buf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  O.noise = buf;
};

// current audio-clock time; used by the shell's ?scale harness. Not in the
// spec's public list, but there is no other way to reach ctx.currentTime
// from outside this module, and something has to drive the scale test.
O.now = () => ctx.currentTime;

O.setRoom = (cutoff, feedback, dur = 1.5, t) => {
  const time = t ?? (ctx ? ctx.currentTime : 0);
  const r = O.room;
  if (!r) return;
  for (const f of [r.lp, r.lp2]) {
    f.frequency.setValueAtTime(f.frequency.value, time);
    f.frequency.linearRampToValueAtTime(cutoff, time + dur);
  }
  r.fbL.gain.setValueAtTime(r.fbL.gain.value, time);
  r.fbL.gain.linearRampToValueAtTime(feedback, time + dur);
  r.fbR.gain.setValueAtTime(r.fbR.gain.value, time);
  r.fbR.gain.linearRampToValueAtTime(feedback, time + dur);
};

O.hz = (semi) => 130.81 * Math.pow(2, semi / 12);

O.auto = (param, start, end, dur, t, curve = 'exp') => {
  const floor = curve === 'exp' ? 0.0001 : start;
  param.setValueAtTime(Math.max(start, floor), t);
  if (curve === 'exp') param.exponentialRampToValueAtTime(Math.max(end, 0.0001), t + dur);
  else param.linearRampToValueAtTime(end, t + dur);
};

// one generic voice, driven entirely by the instrument object. The formant
// branch (soprano) is a fork inside this same function, on fields of the
// instrument, not a second voice function.
O.voice = (name, semi, t, dur, o = {}) => {
  if (semi == null || !ctx) return;
  const inst = O.inst[name];
  const vol = o.vol ?? inst.gain, pan = o.pan || 0;
  let freq = O.hz(semi);
  if (inst.octave) freq *= Math.pow(2, inst.octave);
  const g = ctx.createGain();
  const stop = t + dur + inst.release + 0.05;

  let vibGain = null;
  if (inst.formant) {
    // ---- formant branch: the act-seven singer's-formant soprano ----
    if (dur > 1.2) {
      // sung envelope: slow bloom in, long hold, decay
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
      const lfo = ctx.createOscillator();
      lfo.type = 'sine'; lfo.frequency.value = inst.lfoRate;
      lfo.start(t); lfo.stop(stop);
      vibGain = ctx.createGain();
      vibGain.gain.setValueAtTime(0, t);
      vibGain.gain.setValueAtTime(0, t + inst.lfoDelay[0]);
      vibGain.gain.linearRampToValueAtTime(inst.vibDepth, t + inst.lfoDelay[1]);
      lfo.connect(vibGain);
      const trem = ctx.createGain();
      trem.gain.value = vol * inst.tremolo;
      vibGain.connect(trem);
      trem.connect(g.gain);
    }

    // glottis feeds three parallel formant chains (gain -> bandpass) into
    // the note's envelope gain
    const glottis = ctx.createGain();
    const chains = inst.formants.map(([ffreq, q, flvl]) => {
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass'; bp.frequency.value = ffreq; bp.Q.value = q;
      bp.connect(g);
      const fg = ctx.createGain(); fg.gain.value = flvl;
      fg.connect(bp);
      glottis.connect(fg);
      return bp;
    });
    if (vibGain) {
      const f3Mod = ctx.createGain(); f3Mod.gain.value = 24;
      vibGain.connect(f3Mod);
      f3Mod.connect(chains[2].frequency);
    }

    inst.harmonics.forEach(([mult, type, lvl, det]) => {
      const osc = ctx.createOscillator();
      osc.type = type;
      const target = freq * mult;
      osc.frequency.setValueAtTime(target * 0.915, t);
      osc.frequency.exponentialRampToValueAtTime(target, t + 0.075);
      osc.detune.setValueAtTime(det, t);
      if (vibGain) vibGain.connect(osc.frequency);
      const hg = ctx.createGain(); hg.gain.value = lvl;
      osc.connect(hg); hg.connect(glottis);
      osc.start(t); osc.stop(stop);
    });

    if (O.noise) {
      const n = ctx.createBufferSource(); n.buffer = O.noise;
      const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = inst.breathFreq; bp.Q.value = 2;
      const ng = ctx.createGain();
      ng.gain.setValueAtTime(0.0001, t);
      ng.gain.linearRampToValueAtTime(0.015 * vol, t + 0.01);
      ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
      n.connect(bp); bp.connect(ng); ng.connect(g);
      n.start(t); n.stop(t + 0.09);
    }
  } else {
    // ---- standard branch: tenor / bass / arp ----
    const sus = Math.max(vol * 0.35, 0.0003);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + inst.attack);
    g.gain.exponentialRampToValueAtTime(sus, t + inst.attack + inst.decay);
    g.gain.setValueAtTime(sus, Math.max(t + inst.attack + inst.decay, t + dur));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur + inst.release);

    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.setValueAtTime(inst.filterStart, t);
    f.frequency.exponentialRampToValueAtTime(Math.max(inst.filterEnd, 20), t + Math.max(inst.attack * 1.5, 0.05));
    if (inst.filterClose) f.frequency.exponentialRampToValueAtTime(Math.max(inst.filterClose, 20), t + dur);
    f.connect(g);

    let dest = f;
    if (o.grit) {
      // ring mod: a saw at half frequency drives the gain the main
      // oscillators pass through, for menace
      const ringOsc = ctx.createOscillator();
      ringOsc.type = 'sawtooth';
      ringOsc.frequency.setValueAtTime(freq * 0.5, t);
      ringOsc.start(t); ringOsc.stop(stop);
      const ringGain = ctx.createGain();
      ringGain.gain.value = 0.55;
      ringOsc.connect(ringGain.gain);
      ringGain.connect(f);
      dest = ringGain;
    }

    const oscs = [];
    const mk = (fr, det) => {
      const osc = ctx.createOscillator();
      osc.type = inst.wave;
      osc.frequency.setValueAtTime(fr, t);
      if (det) osc.detune.setValueAtTime(det, t);
      osc.connect(dest);
      osc.start(t);
      osc.stop(stop);
      oscs.push(osc);
    };
    if (inst.detune) { mk(freq, -inst.detune); mk(freq, inst.detune); } else mk(freq, 0);
    if (inst.layer) {
      const lg = ctx.createGain(); lg.gain.value = inst.layerGain ?? 0.32;
      const lo = ctx.createOscillator();
      lo.type = inst.wave;
      lo.frequency.setValueAtTime(freq * inst.layer, t);
      lo.connect(lg); lg.connect(dest);
      lo.start(t); lo.stop(stop);
    }
    if (inst.vibratoDepth) {
      const lfo = ctx.createOscillator();
      lfo.type = 'sine'; lfo.frequency.value = 5.2;
      lfo.start(t); lfo.stop(stop);
      const dep = ctx.createGain();
      dep.gain.setValueAtTime(0, t);
      dep.gain.setValueAtTime(0, t + inst.vibratoDelay);
      dep.gain.linearRampToValueAtTime(inst.vibratoDepth, t + inst.vibratoDelay + 0.2);
      lfo.connect(dep);
      oscs.forEach((osc) => dep.connect(osc.frequency));
    }
  }

  const pn = ctx.createStereoPanner();
  pn.pan.setValueAtTime(Math.max(-1, Math.min(1, pan)), t);
  g.connect(pn);
  pn.connect(O.master);
  const send = ctx.createGain();
  send.gain.value = inst.roomSend ?? 1;
  pn.connect(send);
  send.connect(O.roomSend);

  if (o.light) {
    const ratio = Math.min(1.4, vol / inst.gain);
    O.registerLight(o.light, t, stop, (el) => envAmp(inst, dur, el) * ratio);
  }
};

// ---- pitch: scale degree -> semitone, roman numeral -> chord ----
function semitone(n) {
  const m = MODES[O.opera.mode];
  const i = n - 1;
  return m[((i % 7) + 7) % 7] + 12 * Math.floor(i / 7);
}

O.deg = (d) => {
  let s = String(d), oct = 0;
  if (s === '0') return null;
  if (s.endsWith('+')) { oct = 1; s = s.slice(0, -1); }
  else if (s.endsWith('-')) { oct = -1; s = s.slice(0, -1); }
  return O.opera.root + semitone(+s) + 12 * oct;
};

const ROMAN = { i: 1, ii: 2, iii: 3, iv: 4, v: 5, vi: 6, vii: 7 };
O.chord = (numeral) => {
  const seventh = numeral.indexOf('7') > -1;
  const dimq = /o/i.test(numeral) && !seventh;
  const n = ROMAN[numeral.replace(/[7oO]/g, '').toLowerCase()];
  const bass = O.opera.root + semitone(n) - 12;
  const colour = seventh ? O.opera.root + semitone(n + 6)
    : dimq ? O.opera.root + semitone(n + 4) - 1
    : O.opera.root + semitone(n + 2);
  return [bass, colour];
};

O.motif = () => {
  const [degs, rhythm] = O.opera.motif;
  return [degs.split(' ').map(O.deg), rhythm];
};

// ---- transform kit: each a function on a [semis, rhythm] pair ----
O.T = {
  tr: (n) => ([s, r]) => [s.map((x) => (x == null ? x : x + n)), r],
  mi: () => ([s, r]) => [s.map((x) => { if (x == null) return x; const d = ((x - O.opera.root) % 12 + 12) % 12; return d === 4 || d === 9 ? x - 1 : x; }), r],
  ma: () => ([s, r]) => [s.map((x) => { if (x == null) return x; const d = ((x - O.opera.root) % 12 + 12) % 12; return d === 3 || d === 8 ? x + 1 : x; }), r],
  inv: () => ([s, r]) => { const b = s.find((x) => x != null) ?? 0; return [s.map((x) => (x == null ? x : 2 * b - x)), r]; },
  aug: () => ([s, r]) => [s, r.split('').map((c) => c + (c === 'x' ? '-' : c)).join('')],
  dim: () => ([s, r]) => [s, (r.match(/.{1,2}/g) || []).map((p) => p[0]).join('')],
  frag: (n = 3) => ([s, r]) => [s.slice(0, n), r],
  retro: () => ([s, r]) => [s.slice().reverse(), r.split('').reverse().join('')],
};

// ---- playing a motif pair on a voice ----
O.play = (voice, pair, t, o = {}) => {
  const [semis, rhythm] = pair;
  const beat = o.beat || 0.5;
  const eighth = beat / 2;
  let time = t, idx = 0, curStart = null, curSemi = null, curLen = 0;
  const flush = () => {
    if (curLen > 0 && curSemi != null) O.voice(voice, curSemi, curStart, curLen * eighth, o);
    if (curLen > 0 && o.onNote) o.onNote(curStart, curLen * eighth);
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

// ---- percussion: one noise buffer, a handful of recipes. A kick is a
// flash, a hat is a sparkle: pass `light` (an element or list) and the hit
// lights it, decaying with the hit. ----
O.drum = (kind, t, vol = 0.15, light) => {
  if (!ctx) return;
  if (kind === 'kick') {
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(150, t);
    o.frequency.exponentialRampToValueAtTime(40, t + 0.06);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
    o.connect(g); g.connect(O.master); g.connect(O.roomSend);
    o.start(t); o.stop(t + 0.2);
    if (light) O.registerLight(light, t, t + 0.18, (el) => Math.max(0, 1 - el / 0.18));
  } else if (kind === 'heartbeat') {
    O.drum('kick', t, vol, light);
    O.drum('kick', t + 0.17, vol * 0.65, light);
  } else if (kind === 'snare') {
    O.drum('kick', t, vol * 0.7, light);
    const n = ctx.createBufferSource(); n.buffer = O.noise;
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1500;
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(vol * 0.8, t);
    ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
    n.connect(bp); bp.connect(ng); ng.connect(O.master); ng.connect(O.roomSend);
    n.start(t); n.stop(t + 0.12);
  } else if (kind === 'hat') {
    const n = ctx.createBufferSource(); n.buffer = O.noise;
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 6000;
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(vol * 0.6, t);
    ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
    n.connect(hp); hp.connect(ng); ng.connect(O.master);
    n.start(t); n.stop(t + 0.05);
    if (light) O.registerLight(light, t, t + 0.05, (el) => Math.max(0, 1 - el / 0.05));
  }
};

// a chord arpeggio: one oscillator cycling the triad. Given `cells` (a list
// of elements, one per grid cell in the field), it lights them one per
// note, in the order and at the rate the arp runs.
O.arp = (numeral, dur, rateHz, t, o = {}) => {
  if (!ctx) return;
  const [bass, colour] = O.chord(numeral);
  const oct = (o.octave || 0) * 12;
  const fifth = bass + 19;
  const tones = [bass + 12 + oct, colour + oct, fifth + oct];
  const vol = o.vol || 0.08, pan = o.pan || 0;
  const osc = ctx.createOscillator();
  osc.type = O.inst.arp.wave;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.02);
  g.gain.setValueAtTime(vol, t + dur * 0.8);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  const step = 1 / rateHz, steps = Math.floor(dur / step);
  for (let s = 0; s < steps; s++) osc.frequency.setValueAtTime(O.hz(tones[s % tones.length]), t + s * step);
  const pn = ctx.createStereoPanner();
  pn.pan.setValueAtTime(pan, t);
  osc.connect(g); g.connect(pn); pn.connect(O.master); pn.connect(O.roomSend);
  osc.start(t); osc.stop(t + dur + 0.05);
  // The chord sounds for the whole arpeggio, so every cell it has reached
  // glows at the chord's level until the chord releases; the playhead
  // flares each cell as it passes. Cells are spread across the steps in
  // order, so a fill reaches every cell however many there are.
  if (o.cells && o.cells.length) {
    const peak = Math.min(1, vol / 0.08), n = o.cells.length, end = t + dur, rel = 0.35;
    const glow = (st) => (el) => {
      const now = st + el;
      const g = now < end * 0.999 - dur * 0.2 ? 1 : Math.max(0, (end - now) / (dur * 0.2));
      return peak * 0.55 * (now > end ? Math.max(0, 1 - (now - end) / rel) : g);
    };
    if (o.fill) o.cells.forEach((cell, i) => {
      const st = t + Math.floor((i * steps) / n) * step;
      O.registerLight(cell, st, end + rel, glow(st));
    });
    for (let s = 0; s < steps; s++) {
      const cell = o.cells[Math.floor((s * n) / steps) % n];
      const st = t + s * step;
      O.registerLight(cell, st, st + step * 3, (el) => peak * Math.max(0, 1 - el / (step * 3)));
    }
  }
};

// schedule a small audio-graph callback at a timeline time, reading the
// audio clock fresh when it fires (kept from the current file's pattern).
const snd = (tl, t, fn) => tl.call(fn, [], t);
