import { CONFIG, MODES, COLORS, MOTIF, ROOT, hz, SIZE, CENTER } from './config.js';

const worldEl = document.getElementById('world');
const grid = document.getElementById('grid');
const replayBtn = document.getElementById('replay');

let dots = []; // [row * SIZE + col] → { el, col, row, ring }
let opera;
let audioCtx, masterGain, roomFilter, delayL, delayR, delayGainL, delayGainR, noiseBuf;

// Stage Grid Setup
function buildGrid() {
  grid.innerHTML = '';
  grid.style.gridTemplateColumns = `repeat(${SIZE}, var(--dot-size))`;
  grid.style.gridTemplateRows = `repeat(${SIZE}, var(--dot-size))`;
  dots = [];

  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      const el = document.createElement('div');
      el.className = 'dot';
      el.style.gridColumn = col + 1;
      el.style.gridRow = row + 1;
      grid.appendChild(el);
      const ring = Math.max(Math.abs(col - CENTER), Math.abs(row - CENTER));
      dots.push({ el, col, row, ring });
    }
  }
}

const at = (col, row) => dots[row * SIZE + col];
const everyDot = (fn) => dots.forEach(fn);

// Spatial panning: maps horizontal grid position (-1.0 left to +1.0 right)
const panAt = (col) => (CONFIG.sound.spatial ? (col - CENTER) / CENTER : 0);

// ============================================================
// AUDIO ENGINE: OPERA HOUSE & CHIPTUNE DSP
// ============================================================
function initAudio() {
  if (!CONFIG.sound.enabled) return;
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    masterGain = audioCtx.createGain();
    masterGain.gain.value = CONFIG.sound.volume;
    masterGain.connect(audioCtx.destination);

    // Warm opera house damping: lowpass in delay feedback loop
    roomFilter = audioCtx.createBiquadFilter();
    roomFilter.type = 'lowpass';
    roomFilter.frequency.value = 1800;
    roomFilter.Q.value = 0.7;

    // Cross-feedback stereo delay line (0.28s / 0.38s — prime ratio prevents flutter)
    delayL = audioCtx.createDelay(1.0);
    delayR = audioCtx.createDelay(1.0);
    delayL.delayTime.value = 0.28;
    delayR.delayTime.value = 0.38;

    const merger = audioCtx.createChannelMerger(2);
    delayL.connect(merger, 0, 0);
    delayR.connect(merger, 0, 1);
    merger.connect(roomFilter);
    roomFilter.connect(masterGain);

    // Cross-feedback network
    const splitter = audioCtx.createChannelSplitter(2);
    roomFilter.connect(splitter);

    delayGainL = audioCtx.createGain();
    delayGainR = audioCtx.createGain();
    delayGainL.gain.value = 0.34;
    delayGainR.gain.value = 0.34;

    splitter.connect(delayGainL, 0);
    delayGainL.connect(delayR);

    splitter.connect(delayGainR, 1);
    delayGainR.connect(delayL);

    // 1-second procedural white noise buffer
    noiseBuf = audioCtx.createBuffer(1, audioCtx.sampleRate, audioCtx.sampleRate);
    const data = noiseBuf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
}

// Dynamic acoustic room morphing (crypt <-> soaring cathedral)
function setRoom(freq, feedback = 0.34, time = 1.0) {
  if (!audioCtx || !roomFilter) return;
  const t = audioCtx.currentTime;
  roomFilter.frequency.setTargetAtTime(freq, t, time);
  if (delayGainL && delayGainR) {
    delayGainL.gain.setTargetAtTime(feedback, t, time);
    delayGainR.gain.setTargetAtTime(feedback, t, time);
  }
}

let isAmbient = true;

// Helper to resolve pitch (semitone number vs absolute Hz)
const toFreq = (p) => (typeof p === 'number' && p < 60 ? hz(p) : p);

// 1. OPERATIC VOICE SYNTHESIZER
// Galway PWM Tenor, Dramatic Operatic Soprano (Singer's Formant + 5.3Hz Coupled LFO), Vocal Formant Sweeps
function note(pitchOrSemi, { dur = 0.5, vol = 0.12, pan = 0, grit = false, voice = 'tenor', vibrato = false, attack = null, echo = false } = {}) {
  if (isAmbient || !audioCtx) return;
  const t = audioCtx.currentTime;
  const freq = toFreq(pitchOrSemi);

  const isSoprano = voice === 'soprano';
  const isPluck = voice === 'pluck';
  const att = attack !== null ? attack : (isSoprano ? 0.04 : isPluck ? 0.005 : 0.02);

  // Amplitude Envelope: Messa di Voce dynamic swell for long soprano notes
  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0.0001, t);
  if (isSoprano && dur > 1.2) {
    gain.gain.linearRampToValueAtTime(vol * 0.42, t + 0.08);
    gain.gain.linearRampToValueAtTime(vol, t + dur * 0.38);
    gain.gain.setValueAtTime(vol, t + dur * 0.72);
    gain.gain.exponentialRampToValueAtTime(0.0008, t + dur);
  } else {
    gain.gain.linearRampToValueAtTime(vol, t + att);
    gain.gain.exponentialRampToValueAtTime(0.0008, t + dur);
  }

  // Vocal Formant Filter Envelope for Tenor / Pluck
  const vFilter = audioCtx.createBiquadFilter();
  vFilter.type = 'lowpass';
  vFilter.Q.value = isPluck ? 3.2 : 1.1;
  const fStart = isPluck ? 4200 : 550;
  const fPeak = isPluck ? 4200 : 2400;
  const fEnd = isPluck ? 400 : 600;
  vFilter.frequency.setValueAtTime(fStart, t);
  vFilter.frequency.exponentialRampToValueAtTime(fPeak, t + (isPluck ? 0.01 : att * 1.5));
  vFilter.frequency.exponentialRampToValueAtTime(fEnd, t + dur);

  // Stereo Panning
  let out = gain;
  if (audioCtx.createStereoPanner) {
    const panner = audioCtx.createStereoPanner();
    panner.pan.setValueAtTime(Math.max(-1, Math.min(1, pan)), t);
    gain.connect(panner);
    out = panner;
  }
  out.connect(masterGain);

  // Send to Cathedral Delay
  if (delayL && delayR) {
    const send = audioCtx.createGain();
    send.gain.value = isSoprano ? 0.62 : 0.40;
    out.connect(send);
    send.connect(delayL);
    send.connect(delayR);
  }

  // Coupled Tri-LFO: 5.3 Hz Dramatic Soprano Vibrato + Tremolo + Formant Wobble
  let vibGain = null;
  if (vibrato && dur > 0.5) {
    const lfo = audioCtx.createOscillator();
    lfo.frequency.value = isSoprano ? 5.3 : 4.8;
    vibGain = audioCtx.createGain();
    vibGain.gain.setValueAtTime(0, t);
    vibGain.gain.setValueAtTime(0, t + (isSoprano ? 0.15 : 0.18));
    vibGain.gain.linearRampToValueAtTime(isSoprano ? 5.8 : 3.4, t + (isSoprano ? 0.50 : 0.65));
    lfo.connect(vibGain);

    if (isSoprano) {
      const tremoloGain = audioCtx.createGain();
      tremoloGain.gain.value = vol * 0.20;
      vibGain.connect(tremoloGain);
      tremoloGain.connect(gain.gain);
    }

    lfo.start(t);
    lfo.stop(t + dur + 0.2);
  }

  // Ring Modulation for Menace (Acts IV & V)
  let ringMod = null;
  if (grit) {
    const ringOsc = audioCtx.createOscillator();
    ringOsc.type = 'sawtooth';
    ringOsc.frequency.setValueAtTime(freq * 0.5, t);
    const ringGain = audioCtx.createGain();
    ringGain.gain.value = 0.55;
    ringOsc.connect(ringGain.gain);
    ringOsc.start(t);
    ringOsc.stop(t + dur + 0.15);
    ringMod = ringGain;
  }

  // Voice Waveforms
  if (isSoprano) {
    // 3-Band Parallel Vocal Tract Formant Filter Bank:
    // F1: Vowel body [ɑ] ~850 Hz (Q=2.8)
    // F2: Pharyngeal cavity ~1550 Hz (Q=3.0)
    // F3: Epilarynx "Singer's Formant" ~2950 Hz (Q=4.5, boosted for piercing acoustic ring)
    const f1 = audioCtx.createBiquadFilter(); f1.type = 'bandpass'; f1.frequency.value = 850; f1.Q.value = 2.8;
    const f2 = audioCtx.createBiquadFilter(); f2.type = 'bandpass'; f2.frequency.value = 1550; f2.Q.value = 3.0;
    const f3 = audioCtx.createBiquadFilter(); f3.type = 'bandpass'; f3.frequency.value = 2950; f3.Q.value = 4.5;

    const gF1 = audioCtx.createGain(); gF1.gain.value = 0.65;
    const gF2 = audioCtx.createGain(); gF2.gain.value = 0.55;
    const gF3 = audioCtx.createGain(); gF3.gain.value = 1.25;

    f1.connect(gF1); gF1.connect(gain);
    f2.connect(gF2); gF2.connect(gain);
    f3.connect(gF3); gF3.connect(gain);

    const glottisBus = audioCtx.createGain();
    glottisBus.connect(f1);
    glottisBus.connect(f2);
    glottisBus.connect(f3);

    // Multi-Harmonic Glottal Fold Source
    const sVoices = [
      { mult: 1.0, type: 'sine', level: 0.85, detune: 0 },
      { mult: 2.0, type: 'triangle', level: 0.38, detune: 2.5 },
      { mult: 3.0, type: 'sine', level: 0.22, detune: -1.5 },
      { mult: 4.0, type: 'sine', level: 0.10, detune: 1.0 },
      { mult: 5.0, type: 'sine', level: 0.05, detune: 0 },
    ];

    for (const v of sVoices) {
      const osc = audioCtx.createOscillator();
      osc.type = v.type;
      const targetF = freq * v.mult;
      // Diva portamento scoop: slide into high note from 1.5 semitones below over 75ms
      osc.frequency.setValueAtTime(targetF * 0.915, t);
      osc.frequency.exponentialRampToValueAtTime(targetF, t + 0.075);
      osc.detune.setValueAtTime(v.detune, t);

      if (vibGain) vibGain.connect(osc.frequency);
      const g = audioCtx.createGain();
      g.gain.value = v.level;
      osc.connect(g);
      g.connect(glottisBus);
      osc.start(t);
      osc.stop(t + dur + 0.2);
    }

    // Connect LFO to Singer's Formant filter frequency for organic formant wobble
    if (vibGain) {
      const f3ModGain = audioCtx.createGain();
      f3ModGain.gain.value = 24;
      vibGain.connect(f3ModGain);
      f3ModGain.connect(f3.frequency);
    }

    // Breath noise burst through vocal folds on note attack
    if (noiseBuf) {
      const nSrc = audioCtx.createBufferSource();
      nSrc.buffer = noiseBuf;
      const nFilt = audioCtx.createBiquadFilter();
      nFilt.type = 'bandpass';
      nFilt.frequency.value = 3600;
      nFilt.Q.value = 2.0;
      const nGain = audioCtx.createGain();
      nGain.gain.setValueAtTime(0.015 * vol, t);
      nGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
      nSrc.connect(nFilt);
      nFilt.connect(nGain);
      nGain.connect(gain);
      nSrc.start(t);
      nSrc.stop(t + 0.09);
    }
  } else {
    // Tenor: Galway-style PWM (two detuned saws with phase sweep) + cello body
    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const oscSub = audioCtx.createOscillator();

    osc1.type = grit ? 'sawtooth' : 'sawtooth';
    osc2.type = grit ? 'sawtooth' : 'sawtooth';
    oscSub.type = 'sine';

    osc1.frequency.value = freq;
    osc2.frequency.value = freq;
    oscSub.frequency.value = freq * 0.5;

    // Galway micro-PWM detune: slow beating string chorus
    osc1.detune.setValueAtTime(-4.5, t);
    osc2.detune.setValueAtTime(4.5, t);

    if (vibGain) {
      vibGain.connect(osc1.frequency);
      vibGain.connect(osc2.frequency);
    }

    const g1 = audioCtx.createGain(); g1.gain.value = 0.52;
    const g2 = audioCtx.createGain(); g2.gain.value = 0.52;
    const gSub = audioCtx.createGain(); gSub.gain.value = 0.22;

    osc1.connect(g1);
    osc2.connect(g2);
    oscSub.connect(gSub);

    if (ringMod) {
      g1.connect(ringMod);
      g2.connect(ringMod);
      ringMod.connect(vFilter);
    } else {
      g1.connect(vFilter);
      g2.connect(vFilter);
    }
    gSub.connect(vFilter);

    osc1.start(t);
    osc2.start(t);
    oscSub.start(t);
    osc1.stop(t + dur + 0.15);
    osc2.stop(t + dur + 0.15);
    oscSub.stop(t + dur + 0.15);

    vFilter.connect(gain);
  }

  // Follin Echo Channel: soft delayed counter-voice (NES echo hack)
  if (echo && dur > 0.4) {
    const echoT = t + 0.14;
    const echoGain = audioCtx.createGain();
    echoGain.gain.setValueAtTime(0.0001, echoT);
    echoGain.gain.linearRampToValueAtTime(vol * 0.45, echoT + 0.02);
    echoGain.gain.exponentialRampToValueAtTime(0.0008, echoT + dur * 0.8);

    const echoOsc = audioCtx.createOscillator();
    echoOsc.type = 'triangle';
    echoOsc.frequency.value = freq;

    const echoPanner = audioCtx.createStereoPanner ? audioCtx.createStereoPanner() : null;
    if (echoPanner) {
      echoPanner.pan.setValueAtTime(-pan * 0.8, echoT);
      echoGain.connect(echoPanner);
      echoPanner.connect(masterGain);
    } else {
      echoGain.connect(masterGain);
    }
    echoOsc.connect(echoGain);
    echoOsc.start(echoT);
    echoOsc.stop(echoT + dur + 0.1);
  }
}

// 2. 50Hz / 16Hz TRACKER ARPEGGIO GENERATOR (SID & NES Shimmer)
// Cycles single oscillator rapidly across chord intervals for instant harmonic layers
function arp(chordSemis, dur = 0.8, rateHz = 50, { vol = 0.08, root = ROOT, pan = 0, type = 'triangle' } = {}) {
  if (isAmbient || !audioCtx) return;
  const t = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  osc.type = type;

  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.linearRampToValueAtTime(vol, t + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0008, t + dur);

  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(2600, t);
  filter.frequency.exponentialRampToValueAtTime(800, t + dur);

  // Step-automate pitch across chord notes at rateHz
  const stepDur = 1 / rateHz;
  const totalSteps = Math.floor(dur / stepDur);
  for (let i = 0; i < totalSteps; i++) {
    const semi = chordSemis[i % chordSemis.length];
    const stepTime = t + i * stepDur;
    osc.frequency.setValueAtTime(hz(semi, root), stepTime);
  }

  let out = gain;
  if (audioCtx.createStereoPanner) {
    const panner = audioCtx.createStereoPanner();
    panner.pan.setValueAtTime(pan, t);
    gain.connect(panner);
    out = panner;
  }
  out.connect(masterGain);

  if (delayL && delayR) {
    const send = audioCtx.createGain();
    send.gain.value = 0.35;
    out.connect(send);
    send.connect(delayL);
    send.connect(delayR);
  }

  osc.connect(filter);
  filter.connect(gain);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

// 3. SYNTHETIC OPERATIC PERCUSSION & BIOLOGICAL SOUNDS (No Samples)
function drum(type = 'kick', vol = 0.32, { dur = 0.16, noise = true, startF = 140, endF = 38 } = {}) {
  if (isAmbient || !audioCtx) return;
  const t = audioCtx.currentTime;

  if (type === 'kick' || type === 'heartbeat') {
    const osc = audioCtx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(startF, t);
    osc.frequency.exponentialRampToValueAtTime(endF, t + dur * 0.75);

    const oscGain = audioCtx.createGain();
    oscGain.gain.setValueAtTime(0.001, t);
    oscGain.gain.linearRampToValueAtTime(vol, t + 0.008);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    osc.connect(oscGain);
    oscGain.connect(masterGain);
    osc.start(t);
    osc.stop(t + dur + 0.02);

    if (noise && noiseBuf) {
      const nSource = audioCtx.createBufferSource();
      nSource.buffer = noiseBuf;
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(120, t);

      const nGain = audioCtx.createGain();
      nGain.gain.setValueAtTime(vol * 0.38, t);
      nGain.gain.exponentialRampToValueAtTime(0.001, t + dur * 0.5);

      nSource.connect(filter);
      filter.connect(nGain);
      nGain.connect(masterGain);
      nSource.start(t);
      nSource.stop(t + dur * 0.6);
    }
  } else if (type === 'lubdub') {
    // Systole (Lub)
    drum('heartbeat', vol, { dur, startF, endF, noise });
    // Diastole (Dub) — slightly higher, 35% quieter, 170ms later
    setTimeout(() => {
      drum('heartbeat', vol * 0.65, { dur: dur * 0.85, startF: startF * 1.15, endF: endF * 1.15, noise });
    }, 170);
  } else if (type === 'hat') {
    // High-pass metallic noise burst
    if (noiseBuf) {
      const nSource = audioCtx.createBufferSource();
      nSource.buffer = noiseBuf;
      const hp = audioCtx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.setValueAtTime(6500, t);

      const nGain = audioCtx.createGain();
      nGain.gain.setValueAtTime(vol * 0.5, t);
      nGain.gain.exponentialRampToValueAtTime(0.0008, t + 0.04);

      nSource.connect(hp);
      hp.connect(nGain);
      nGain.connect(masterGain);
      nSource.start(t);
      nSource.stop(t + 0.05);
    }
  } else if (type === 'sfz') {
    // Sforzando Climax: Sub drop + Saw clash + Noise wash
    drum('kick', vol * 1.2, { dur: 0.6, startF: 160, endF: 30, noise: true });
    note(-12, { dur: 1.4, vol: 0.22, grit: true });
  }
}

// Master timeline score callback
function score(tl, time, fn) {
  tl.call(() => fn(), [], time);
}

// Camera tracking
let _cell = 0;
function cellSize() {
  if (!_cell) {
    const d = grid.querySelector('.dot');
    _cell = d.offsetWidth + parseFloat(getComputedStyle(grid).columnGap);
  }
  return _cell;
}

function camera(tl, time, { col = CENTER, row = CENTER, zoom = 1, dur = 1.6, ease = 'power2.inOut' } = {}) {
  tl.to(
    worldEl,
    {
      x: () => (CENTER - col) * cellSize() * zoom,
      y: () => (CENTER - row) * cellSize() * zoom,
      scale: zoom,
      duration: dur,
      ease,
    },
    time
  );
}

// Light hops
function hop(tl, light, col, row, time, opts = {}) {
  const { leave = null, arriveScale = 1.3, note: pitch = null, vol = 0.11, dur = 0.45, pan = null, grit = false, voice = 'tenor', vibrato = false, echo = false, hat = false } = opts;
  const prev = at(light.col, light.row);
  const next = at(col, row);

  if (prev && prev !== next && leave) {
    tl.call(() => prev.el.style.setProperty('--dot-color', leave.color), [], time);
    tl.to(prev.el, { opacity: leave.opacity, scale: leave.scale, duration: 0.6, ease: 'power2.inOut' }, time);
  }
  tl.call(() => next.el.style.setProperty('--dot-color', light.color), [], time);
  tl.fromTo(
    next.el,
    { scale: 0.5 },
    { opacity: 1, scale: arriveScale, duration: 0.45, ease: 'back.out(2)', immediateRender: false },
    time
  );
  if (pitch !== null) {
    const notePan = pan !== null ? pan : panAt(col);
    score(tl, time, () => note(pitch, { vol, dur, pan: notePan, grit, voice, vibrato, echo }));
  }
  if (hat) {
    score(tl, time, () => drum('hat', 0.18));
  }

  light.col = col;
  light.row = row;
}

// Organic decay map
const noise01 = (x, y) =>
  (Math.sin(x * 1.7 + 2.1) * Math.cos(y * 1.3 + 0.7) +
    Math.sin((x + y) * 0.9 + 4.2) * 0.6 +
    Math.sin(x * 0.5 - y * 0.8 + 1.3) * 0.4 +
    2) / 4;

function makeDeathMap() {
  const seeds = [];
  while (seeds.length < 4) {
    const edge = Math.floor(Math.random() * 4);
    const i = Math.floor(Math.random() * SIZE);
    const cell = [[i, 0], [i, SIZE - 1], [0, i], [SIZE - 1, i]][edge];
    if (!seeds.some(([c, r]) => c === cell[0] && r === cell[1])) seeds.push(cell);
  }
  const dist = new Array(SIZE * SIZE).fill(Infinity);
  const queue = [];
  for (const [c, r] of seeds) {
    dist[r * SIZE + c] = 0;
    queue.push([c, r]);
  }
  while (queue.length) {
    const [c, r] = queue.shift();
    for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nc = c + dc;
      const nr = r + dr;
      if (nc >= 0 && nc < SIZE && nr >= 0 && nr < SIZE && dist[nr * SIZE + nc] === Infinity) {
        dist[nr * SIZE + nc] = dist[r * SIZE + c] + 1;
        queue.push([nc, nr]);
      }
    }
  }
  const { spread, texture } = CONFIG.acts.death;
  return (d) => dist[d.row * SIZE + d.col] * spread + noise01(d.col, d.row) * texture;
}

// ============================================================
// THE 7 ACTS: CHOREOGRAPHY & OPERATIC SCORE
// ============================================================

// ACT I — BIRTH: Single PWM soul, sub-bass drone, biological lub-dub heartbeats
function actBirth(tl, hero) {
  const { start, heartbeats } = CONFIG.acts.birth;
  const soul = at(hero.col, hero.row);

  camera(tl, start, { zoom: 2.2, dur: 0.1 });
  camera(tl, start + 0.3, { zoom: 1.6, dur: 3.5 });

  score(tl, start, () => setRoom(1800, 0.34, 0.1));

  tl.call(() => {
    soul.el.style.setProperty('--dot-color', COLORS.soul);
  }, [], start);
  tl.to(soul.el, { opacity: 0.95, scale: 1.1, duration: 1.4, ease: 'power2.out' }, start);

  // Tenor opening fundamental: C3 (0 semitones) with Galway PWM breathing
  score(tl, start, () => note(0, { dur: 2.2, vol: 0.16, attack: 0.04, voice: 'tenor' }));

  for (let i = 0; i < heartbeats; i++) {
    const hb = start + 1.4 + i * 0.85;
    tl.to(soul.el, { scale: 1.3, duration: 0.12, ease: 'power2.out' }, hb)
      .to(soul.el, { scale: 1.15, duration: 0.15, ease: 'power2.inOut' }, hb + 0.12)
      .to(soul.el, { scale: 1.22, duration: 0.10, ease: 'power2.out' }, hb + 0.27)
      .to(soul.el, { scale: 1.1, duration: 0.35, ease: 'power2.inOut' }, hb + 0.37);

    score(tl, hb, () => drum('lubdub', 0.36, { startF: 78, endF: 34 }));
  }
}

// ACT II — DEVELOPMENT: Symmetrical anthem + 50Hz SID arpeggios trailing hops
function actDevelopment(tl, hero) {
  const { start, rowGap, rowChord, wander } = CONFIG.acts.development;

  camera(tl, start, { zoom: 1.35, dur: 1.8 });

  everyDot((d) => {
    const dist = Math.abs(d.row - CENTER);
    const time = start + dist * rowGap + d.col * 0.03;
    tl.call(() => d.el.style.setProperty('--dot-color', COLORS.rowStripe(dist)), [], time);
    const op = dist === 0 ? 0.92 : 0.78;
    tl.to(d.el, { opacity: op, scale: 1, duration: 0.9, ease: 'elastic.out(1, 0.6)', immediateRender: false }, time);
  });

  // Stacked open C Major chords without muddy 5ths
  for (let dist = 0; dist <= CENTER; dist++) {
    const t = start + dist * rowGap;
    score(tl, t, () => note(rowChord[dist], { dur: 1.8, vol: 0.12, voice: 'pluck' }));
  }

  // Hero wander: Tenor motif with 50Hz SID arpeggio sparkles
  let t = start + CENTER * rowGap + 1.2;
  wander.forEach(([col, row], i) => {
    const leaveDot = at(hero.col, hero.row);
    const leaveDist = Math.abs(leaveDot.row - CENTER);
    hop(tl, hero, col, row, t, {
      leave: {
        color: COLORS.rowStripe(leaveDist),
        opacity: leaveDist === 0 ? 0.92 : 0.78,
        scale: 1,
      },
      note: MOTIF.hero[i % 2],
      vol: 0.14,
      voice: 'tenor',
      echo: true,
    });
    // Trigger 50Hz sparkling tracker arpeggio
    score(tl, t, () => arp(MODES.ARP_MAJ, 0.6, 50, { vol: 0.07, pan: panAt(col) }));
    camera(tl, t, { col, row, zoom: 1.85, dur: 0.65 });
    t += 0.7;
  });
  camera(tl, t + 0.3, { zoom: 1.5, dur: 1.2 });
}

// ACT III — LOVE: The Bel Canto Duet
// Tenor PWM & Soprano pure bell in parallel thirds + Follin echo counterpoint
function actLove(tl, hero, beloved) {
  const { start, hopGap, heroDance, belovedDance } = CONFIG.acts.love;

  camera(tl, start, { zoom: 1.5, dur: 1.5 });
  tl.call(() => everyDot((d) => d.el.style.setProperty('--dot-color', COLORS.dusk)), [], start);
  tl.to(dots.map((d) => d.el), { opacity: 0.18, scale: 0.85, duration: 1.2, ease: 'power2.inOut' }, start);

  tl.call(() => at(hero.col, hero.row).el.style.setProperty('--dot-color', COLORS.soul), [], start + 0.2);
  tl.to(at(hero.col, hero.row).el, { opacity: 0.8, scale: 1.15, duration: 0.8 }, start + 0.2);

  // 1. THE QUESTION (Tenor Call: C4 -> D4)
  const callAt = start + 0.5;
  score(tl, callAt, () => note(MOTIF.heroCall[0], { dur: 0.55, vol: 0.13, pan: -0.2, voice: 'tenor', echo: true }));
  score(tl, callAt + 0.45, () => note(MOTIF.heroCall[1], { dur: 0.75, vol: 0.14, pan: -0.2, voice: 'tenor', echo: true }));

  // 2. SHE APPEARS at (6, 4) in vibrant rose light
  const [bc, br] = [6, 4];
  const appearAt = start + 1.4;
  tl.call(() => at(bc, br).el.style.setProperty('--dot-color', COLORS.beloved), [], appearAt);
  tl.fromTo(
    at(bc, br).el,
    { scale: 0 },
    { opacity: 0.85, scale: 1.25, duration: 0.8, ease: 'back.out(2)', immediateRender: false },
    appearAt
  );
  camera(tl, appearAt, { col: bc, row: br, zoom: 2.1, dur: 0.9 });

  // 3. THE ANSWER (Soprano contrary descent: G4 -> E4 with blooming 5.2Hz vibrato)
  score(tl, appearAt + 0.2, () => note(MOTIF.belovedAnswer[0], { dur: 0.6, vol: 0.14, pan: 0.3, voice: 'soprano' }));
  score(tl, appearAt + 0.65, () => note(MOTIF.belovedAnswer[1], { dur: 0.95, vol: 0.15, pan: 0.3, voice: 'soprano', vibrato: true }));

  beloved.col = bc;
  beloved.row = br;
  const duskLook = () => ({ color: COLORS.dusk, opacity: 0.18, scale: 0.85 });
  const stepAt = start + 2.5;
  hop(tl, beloved, belovedDance[0][0], belovedDance[0][1], stepAt, {
    leave: duskLook(),
    note: 16, // E4
    vol: 0.13,
    voice: 'soprano',
    vibrato: true,
  });

  // 4. THE DUET: Parallel Thirds on 2x2 box
  camera(tl, start + 3.0, { col: 4.5, row: 4.5, zoom: 2.3, dur: 1.8 });

  const duetThirds = [
    [16, 19], // E4 (Tenor) / G4 (Soprano)
    [17, 21], // F4 (Tenor) / A4 (Soprano)
    [19, 23], // G4 (Tenor) / B4 (Soprano)
  ];

  for (let i = 1; i < heroDance.length; i++) {
    const t = start + 3.4 + (i - 1) * hopGap;
    const [hSemi, bSemi] = duetThirds[(i - 1) % duetThirds.length];

    hop(tl, hero, heroDance[i][0], heroDance[i][1], t, {
      leave: duskLook(),
      note: hSemi,
      vol: 0.13,
      pan: -0.25,
      voice: 'tenor',
      echo: true,
    });
    hop(tl, beloved, belovedDance[i][0], belovedDance[i][1], t + 0.15, {
      leave: duskLook(),
      note: bSemi,
      vol: 0.14,
      pan: 0.25,
      voice: 'soprano',
      vibrato: true,
    });
  }

  // 5. HELD TOGETHER: Open cathedral chord + shimmering harp arpeggio
  const held = start + 3.4 + (heroDance.length - 1) * hopGap + 0.7;
  camera(tl, held, { col: 4.5, row: 4.5, zoom: 1.55, dur: 2.2 });
  score(tl, held, () => {
    note(0, { dur: 4.0, vol: 0.11, pan: 0.0, type: 'triangle' }); // C3 deep floor
    note(12, { dur: 3.8, vol: 0.13, pan: -0.25, voice: 'tenor', attack: 0.04 }); // C4 tenor
    note(16, { dur: 3.9, vol: 0.15, pan: 0.25, voice: 'soprano', vibrato: true, attack: 0.04 }); // E4 soprano
    arp(MODES.ARP_HARP, 3.5, 12, { vol: 0.06, pan: 0.0 }); // 12Hz slow harp shimmer
  });
}

// ACT IV — JEALOUSY: Crypt room, audio-rate ring modulation, minor-second tension
function actJealousy(tl, hero, beloved) {
  const { start, gateStep, belovedCell, heroFlee } = CONFIG.acts.jealousy;

  // Crypt room acoustics: muffled 600 Hz lowpass
  score(tl, start, () => setRoom(600, 0.45, 0.8));
  camera(tl, start, { zoom: 1.3, dur: 1.2 });

  tl.to(
    dots.filter((d) => d.el !== at(hero.col, hero.row).el && d.el !== at(beloved.col, beloved.row).el).map((d) => d.el),
    { opacity: 0.25, duration: 1.0, ease: 'power2.inOut' },
    start
  );

  // The gate descends row by row with ring-modulated wound dissonance
  for (let row = 0; row < SIZE; row++) {
    const t = start + row * gateStep;
    everyDot((d) => {
      if (d.row !== row) return;
      if (d.col === hero.col && d.row === 8) return;
      tl.call(() => d.el.style.setProperty('--dot-color', COLORS.envy), [], t + d.col * 0.02);
      tl.to(d.el, { opacity: 0.75, scale: 0.95, duration: 0.5, ease: 'power2.out' }, t + d.col * 0.02);
    });
    score(tl, t, () => {
      note(MODES.WOUND[row % 3], { dur: 0.85, vol: 0.08, grit: true });
      arp(MODES.ARP_TENSION, 0.5, 30, { vol: 0.05, pan: (row / SIZE) * 2 - 1 });
    });
  }

  // AGONIZING SUSPENSION: Soprano hangs, cold tritone crash beneath
  const taken = start + belovedCell[1] * gateStep;
  tl.call(() => at(belovedCell[0], belovedCell[1]).el.style.setProperty('--dot-color', COLORS.envy), [], taken);
  tl.to(at(belovedCell[0], belovedCell[1]).el, { scale: 0.9, opacity: 0.75, duration: 0.6 }, taken);
  score(tl, taken, () => {
    note(16, { dur: 1.1, vol: 0.14, pan: 0.3, voice: 'soprano', vibrato: true }); // suspended E4
    note(6, { dur: 1.6, vol: 0.13, pan: 0.0, grit: true }); // tritone crash
    drum('kick', 0.4, { dur: 0.3, startF: 110, endF: 30 });
  });
  beloved.dead = true;

  // Hero flees downward; camera tracks him
  heroFlee.forEach(([col, row], i) => {
    const t = taken + 0.3 + i * 0.5;
    hop(tl, hero, col, row, t, {
      leave: { color: COLORS.dusk, opacity: 0.25, scale: 0.85 },
      note: MOTIF.hero[i % 2],
      vol: 0.11,
      voice: 'tenor',
    });
    camera(tl, t, { col, row, zoom: 1.95, dur: 0.45, ease: 'power1.out' });
  });
}

// ACT V — REVENGE: Crimson fury, ring-mod saw stabs, synthetic percussion, sforzando crash
function actRevenge(tl, hero) {
  const { start, hopGap, huntPath } = CONFIG.acts.revenge;

  tl.call(() => (hero.color = COLORS.heroRage), [], start);
  tl.call(() => at(hero.col, hero.row).el.style.setProperty('--dot-color', COLORS.heroRage), [], start);
  score(tl, start, () => note(MOTIF.heroBroken[0], { vol: 0.16, dur: 0.8, type: 'sawtooth', grit: true, voice: 'tenor' }));
  camera(tl, start, { col: hero.col, row: hero.row, zoom: 2.1, dur: 0.8 });

  // 12 rapid zigzag hops across the grid with percussive hats & ring-mod stabs
  huntPath.forEach(([col, row], i) => {
    const t = start + 0.6 + i * hopGap;
    hop(tl, hero, col, row, t, {
      leave: { color: COLORS.rage, opacity: 0.75, scale: 0.95 },
      arriveScale: 1.25,
      note: MOTIF.heroBroken[i % 2],
      vol: 0.15,
      dur: 0.45,
      pan: panAt(col),
      grit: true,
      voice: 'tenor',
      hat: true,
    });

    const prevCell = huntPath[i - 1] || [4, 8];
    const burned = [prevCell];
    for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nc = col + dc;
      const nr = row + dr;
      if (nc >= 0 && nc < SIZE && nr >= 0 && nr < SIZE && !(nc === col && nr === row)) burned.push([nc, nr]);
    }
    burned.forEach(([c, r]) => {
      if (c === col && r === row) return;
      const d = at(c, r);
      tl.call(() => d.el.style.setProperty('--dot-color', COLORS.rage), [], t);
      tl.to(d.el, { opacity: 0.65, scale: 0.95, duration: 0.3 }, t);
      tl.call(() => d.el.style.setProperty('--dot-color', COLORS.ember), [], t + 1.1);
      tl.to(d.el, { opacity: 0.18, scale: 0.7, duration: 1.0, ease: 'power2.inOut' }, t + 1.1);
    });
    camera(tl, t, { col, row, zoom: 1.85, dur: hopGap * 1.2, ease: 'power2.inOut' });
  });

  // Final strike at (4, 0): SFORZANDO (sfz) IMPACT + screen shake
  const finalHuntT = start + 0.6 + (huntPath.length - 1) * hopGap;
  score(tl, finalHuntT, () => drum('sfz', 0.45));
  tl.to(worldEl, { y: '+=14', duration: 0.05, yoyo: true, repeat: 3, ease: 'sine.inOut' }, finalHuntT);

  // Embers and silence: solitary hero at (4, 0)
  const after = finalHuntT + 0.6;
  camera(tl, after, { col: 4, row: 0, zoom: 1.75, dur: 1.0 });
  tl.call(() => everyDot((d) => d.el.style.setProperty('--dot-color', COLORS.ember)), [], after);
  tl.to(
    dots.filter((d) => !(d.col === hero.col && d.row === hero.row)).map((d) => d.el),
    { opacity: 0.14, scale: 0.65, duration: 1.2, ease: 'power2.inOut' },
    after
  );
  tl.to(at(hero.col, hero.row).el, { opacity: 1.0, scale: 1.2, duration: 0.8 }, after);
  score(tl, after + 0.2, () => note(0, { dur: 1.8, vol: 0.09, type: 'triangle' }));
}

// ACT VI — ACCEPTANCE: Soaring cathedral, healing walk, crystal harp arpeggios, double Amen cadence
function actAcceptance(tl, hero) {
  const { start, peaceSpread, homePath, memoryCell, chordGap } = CONFIG.acts.acceptance;

  // Cathedral opens wide: 2600 Hz lowpass + enhanced delay feedback
  score(tl, start, () => setRoom(2600, 0.42, 1.2));

  tl.call(() => at(hero.col, hero.row).el.style.setProperty('--dot-color', COLORS.healing[0]), [], start);

  homePath.forEach(([col, row], i) => {
    const t = start + 0.35 + i * 0.85;
    const stepColor = COLORS.healing[i + 1];
    tl.call(() => (hero.color = stepColor), [], t);
    hop(tl, hero, col, row, t, {
      leave: { color: COLORS.ember, opacity: 0.14, scale: 0.65 },
      arriveScale: 1.25,
      note: MOTIF.hero[i % 2],
      vol: 0.13,
      dur: 0.75,
      voice: 'tenor',
      echo: true,
    });
    camera(tl, t, { col: 4, row, zoom: 1.75, dur: 0.75 });
  });

  const settleT = start + 3.2;
  camera(tl, settleT, { col: CENTER, row: CENTER, zoom: 1.25, dur: 2.2 });

  const home = at(CENTER, CENTER);
  tl.to(home.el, { scale: 1.3, duration: 1.6, yoyo: true, repeat: 2, ease: 'sine.inOut' }, settleT);

  // Concentric violet peace rings + 14Hz harp cascades
  const floodStart = settleT + 0.4;
  everyDot((d) => {
    if (d.col === CENTER && d.row === CENTER) return;
    const t = floodStart + d.ring * peaceSpread;
    tl.call(() => d.el.style.setProperty('--dot-color', COLORS.peace(d.ring)), [], t);
    tl.to(d.el, { opacity: 0.72, scale: 1, duration: 1.2, ease: 'sine.inOut' }, t);
  });
  score(tl, floodStart, () => arp(MODES.ARP_HARP, 3.2, 14, { vol: 0.07, pan: 0.0 }));

  // Plagal "Amen" Cadence (IV -> I) in pure two-voice harmony:
  // IV: F3 (5) + A3 (9)  -->  I: C3 (0) + E3 (4)
  [0, chordGap].forEach((offset) => {
    // IV (F - A)
    score(tl, settleT + 0.6 + offset, () => {
      note(5, { dur: 2.2, vol: 0.10, voice: 'pluck', attack: 0.04 });
      note(9, { dur: 2.2, vol: 0.09, voice: 'pluck', attack: 0.04 });
    });
    // I (C - E resolution)
    score(tl, settleT + 0.6 + offset + chordGap / 2, () => {
      note(0, { dur: 2.8, vol: 0.12, type: 'triangle', attack: 0.04 });
      note(4, { dur: 2.8, vol: 0.10, voice: 'tenor', attack: 0.04 });
    });
  });

  // Tender rose memory light at (5, 4)
  const mem = at(memoryCell[0], memoryCell[1]);
  tl.call(() => mem.el.style.setProperty('--dot-color', COLORS.memory), [], settleT + 1.2);
  tl.to(mem.el, { opacity: 0.85, scale: 1.15, duration: 1.0, ease: 'sine.inOut' }, settleT + 1.2);
}

// ACT VII — DEATH & THE "FAT LADY" ARIA:
// Dying heartbeats, beloved's ghost halo, High Soprano Aria (G4 -> A4 -> C5), subterranean 32.7Hz C1 pedal
function actDeath(tl, hero) {
  const { start, noteEvery } = CONFIG.acts.death;
  const deathTime = makeDeathMap();
  const heroCell = at(hero.col, hero.row);

  camera(tl, start, { col: 4.5, row: 4, zoom: 2.2, dur: 9 });

  const dying = dots.filter((d) => d.el !== heroCell.el);
  const order = [...dying].sort((a, b) => deathTime(a) - deathTime(b));

  order.forEach((d, i) => {
    const t = start + deathTime(d);
    tl.call(() => {
      d.el.classList.remove('ghost-aria');
      d.el.style.setProperty('--dot-color', COLORS.drain);
    }, [], t);
    tl.to(d.el, { opacity: 0, scale: 0.2, duration: 1.5, ease: 'power2.in' }, t + 0.8);
    if (i % noteEvery === 0) {
      const semi = MODES.PENTA[(order.length - 1 - i) % MODES.PENTA.length];
      score(tl, t, () => note(semi, { dur: 1.0, vol: 0.05, pan: panAt(d.col), voice: 'pluck' }));
    }
  });

  // Hero cools to a solitary tungsten ember
  const maxDeath = start + Math.max(...order.map(deathTime));
  const emberAt = maxDeath + 0.6;
  tl.call(() => {
    heroCell.el.style.setProperty('--dot-color', COLORS.lastEmber);
  }, [], emberAt);
  tl.to(heroCell.el, { opacity: 0.9, scale: 0.95, duration: 0.8, ease: 'power2.out' }, emberAt);

  // Slow 48 BPM anatomical lub-dub heartbeat:
  score(tl, emberAt + 0.6, () => drum('lubdub', 0.30, { startF: 68, endF: 26, noise: false }));
  tl.to(heroCell.el, { scale: 1.1, duration: 0.14 }, emberAt + 0.6)
    .to(heroCell.el, { scale: 0.95, duration: 0.14 }, emberAt + 0.74)
    .to(heroCell.el, { scale: 1.03, duration: 0.10 }, emberAt + 0.88)
    .to(heroCell.el, { scale: 0.9, duration: 0.40 }, emberAt + 0.98);

  // Hero begins motif... and stops mid-phrase
  score(tl, emberAt + 0.6, () => note(MOTIF.hero[0], { dur: 0.85, vol: 0.11, voice: 'tenor' }));

  // THE "FAT LADY" SINGS (Beloved's Ghost Re-ignites at 5, 4):
  const ariaAt = emberAt + 1.6;
  const ghostCell = at(5, 4);
  tl.call(() => {
    ghostCell.el.classList.add('ghost-aria');
    ghostCell.el.style.setProperty('--dot-color', COLORS.beloved);
  }, [], ariaAt);
  tl.fromTo(
    ghostCell.el,
    { scale: 0, opacity: 0 },
    { scale: 1.2, opacity: 1.0, duration: 1.4, ease: 'power2.out', immediateRender: false },
    ariaAt
  );
  tl.to(ghostCell.el, { scale: 1.1, opacity: 0.92, duration: 1.8, yoyo: true, repeat: 2, ease: 'sine.inOut' }, ariaAt + 1.4);

  // Cathedral acoustics for the grand finale aria:
  score(tl, ariaAt, () => setRoom(4200, 0.52));

  // Climactic Wagnerian Soprano Aria:
  // 1. Pickup: G4 (19) - tender onset
  score(tl, ariaAt + 0.1, () => note(MOTIF.aria[0], { dur: 0.75, vol: 0.14, pan: 0.35, voice: 'soprano' }));
  // 2. Rising Step: A4 (21) - swelling chest resonance
  score(tl, ariaAt + 0.8, () => note(MOTIF.aria[1], { dur: 0.75, vol: 0.16, pan: 0.35, voice: 'soprano' }));
  // 3. Leading Tone: B4 (23) - soaring tension
  score(tl, ariaAt + 1.5, () => note(MOTIF.aria[2], { dur: 0.65, vol: 0.17, pan: 0.35, voice: 'soprano' }));
  // 4. Climactic High C5 (24 = 523.25 Hz) - grand Messa di Voce, blooming 5.3Hz vibrato + tremolo + Singer's Formant ring!
  score(tl, ariaAt + 2.1, () => note(MOTIF.aria[3], { dur: 3.2, vol: 0.22, pan: 0.35, voice: 'soprano', vibrato: true }));

  // Final dying cardiac pulse underneath the sustained high C
  const finalBeatAt = ariaAt + 3.2;
  score(tl, finalBeatAt, () => drum('kick', 0.20, { startF: 52, endF: 22, dur: 0.26, noise: false }));
  tl.to(heroCell.el, { scale: 0.96, duration: 0.18 }, finalBeatAt).to(
    heroCell.el,
    { scale: 0.75, duration: 0.8 },
    finalBeatAt + 0.18
  );

  // 5. Dying Melisma Cadence: A4 (21) -> G4 (19) -> E4 (16) -> C4 (12)
  score(tl, finalBeatAt + 1.0, () => note(MOTIF.ariaCadence[0], { dur: 0.55, vol: 0.13, pan: 0.3, voice: 'soprano' }));
  score(tl, finalBeatAt + 1.5, () => note(MOTIF.ariaCadence[1], { dur: 0.65, vol: 0.12, pan: 0.3, voice: 'soprano' }));
  score(tl, finalBeatAt + 2.1, () => note(MOTIF.ariaCadence[2], { dur: 0.85, vol: 0.11, pan: 0.3, voice: 'soprano', vibrato: true }));
  score(tl, finalBeatAt + 2.9, () => note(MOTIF.ariaCadence[3], { dur: 2.2, vol: 0.09, pan: 0.3, voice: 'soprano', vibrato: true }));

  // Silence: celestial star and amber ember dissolve together into eternity
  const fadeAt = finalBeatAt + 4.2;
  tl.to(heroCell.el, { opacity: 0, scale: 0.1, duration: 3.2, ease: 'power2.in' }, fadeAt);
  tl.to(ghostCell.el, { opacity: 0, scale: 0.1, duration: 3.2, ease: 'power2.in' }, fadeAt);
  tl.call(() => ghostCell.el.classList.remove('ghost-aria'), [], fadeAt + 3.2);

  // Subterranean C1 organ pedal fading into eternity
  score(tl, fadeAt, () => {
    note(-12, { dur: 3.8, vol: 0.12 });               // C2 (65.4 Hz)
    note(-24, { dur: 5.2, vol: 0.09, type: 'sine' }); // C1 pedal (32.7 Hz)
  });
}

// ============================================================
// OPERA LIFECYCLE & SLAB TITLE
// ============================================================

function buildOpera() {
  if (opera) opera.kill();

  const hero = { col: CENTER, row: CENTER, color: COLORS.soul };
  const beloved = { col: 6, row: 4, color: COLORS.beloved, dead: false };

  opera = gsap.timeline({
    onComplete: () => {
      if (isAmbient || CONFIG.loop) {
        gsap.delayedCall(1.5, buildOpera); // rebirth
      } else {
        stopOpera();
      }
    },
  });

  // Reset the stage
  opera.set(worldEl, { x: 0, y: 0, scale: 1 }, 0);
  opera.set(dots.map((d) => d.el), { opacity: 0, scale: 0 }, 0);
  opera.call(() => everyDot((d) => {
    d.el.className = 'dot';
    d.el.style.setProperty('--dot-color', COLORS.dusk);
  }), [], 0);
  if (isAmbient) {
    const centerDot = at(CENTER, CENTER);
    centerDot.el.style.setProperty('--dot-color', COLORS.soul);
    opera.set(centerDot.el, { opacity: 0.92, scale: 1.15 }, 0);
  }

  actBirth(opera, hero);
  actDevelopment(opera, hero);
  actLove(opera, hero, beloved);
  actJealousy(opera, hero, beloved);
  actRevenge(opera, hero);
  actAcceptance(opera, hero);
  actDeath(opera, hero);
}

// Slab Title & Navigation
const titleEl = document.querySelector('.t');
const technoSpan = titleEl ? titleEl.children[1] : null;
const playBtn = document.getElementById('play-btn');

function fitTitle() {
  if (!titleEl || !technoSpan) return;
  const subEl = titleEl.querySelector('.sub');

  titleEl.style.fontSize = '100px';
  if (subEl) subEl.style.fontSize = '100px';

  const tW = technoSpan.offsetWidth || 1;
  const sW = subEl ? (subEl.offsetWidth || 1) : 1;

  const byWidth = 100 * (innerWidth * 0.94) / tW;
  const byHeight = (innerHeight - 110) / (3.6 * 0.82);
  const titleSize = Math.min(byWidth, byHeight);

  titleEl.style.fontSize = titleSize + 'px';
  if (subEl) {
    subEl.style.fontSize = (titleSize * (tW / sW)) + 'px';
  }
}

function clearTypeAnim() {
  if (!titleEl) return;
  [...titleEl.children].forEach((s) => s.getAnimations().forEach((a) => a.cancel()));
}

function typeIn() {
  if (!titleEl) return;
  clearTypeAnim();
  titleEl.style.visibility = 'visible';
  const children = [...titleEl.children];
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    children.forEach((s) => (s.style.clipPath = 'inset(0 0 0 0)'));
    titleEl.style.opacity = '1';
    return;
  }
  titleEl.style.opacity = '1';
  children.forEach((s, i) => {
    const len = Math.max(4, s.textContent.trim().length);
    s.style.clipPath = 'inset(0 0 0 0)';
    s.animate(
      { clipPath: ['inset(0 100% 0 0)', 'inset(0 0 0 0)'] },
      { duration: 280, delay: 60 + i * 140, easing: `steps(${len})`, fill: 'backwards' }
    );
  });
}

function typeOut(onComplete) {
  if (!titleEl) {
    if (onComplete) onComplete();
    return;
  }
  clearTypeAnim();
  const children = [...titleEl.children];
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    children.forEach((s) => (s.style.clipPath = 'inset(0 100% 0 0)'));
    titleEl.style.visibility = 'hidden';
    if (onComplete) onComplete();
    return;
  }
  let remaining = children.length;
  children.forEach((s, i) => {
    const revIndex = children.length - 1 - i;
    const len = Math.max(4, s.textContent.trim().length);
    const anim = s.animate(
      { clipPath: ['inset(0 0 0 0)', 'inset(0 100% 0 0)'] },
      { duration: 180, delay: revIndex * 60, easing: `steps(${len})`, fill: 'forwards' }
    );
    anim.onfinish = () => {
      s.style.clipPath = 'inset(0 100% 0 0)';
      remaining--;
      if (remaining === 0) {
        titleEl.style.visibility = 'hidden';
        if (onComplete) onComplete();
      }
    };
  });
}

document.fonts.ready.then(() => fitTitle());

if (titleEl && technoSpan) {
  fitTitle();
  typeIn();
}

buildGrid();

function startOpera() {
  isAmbient = false;
  document.body.classList.add('playing');
  typeOut();
  initAudio();
  if (masterGain && audioCtx) {
    masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
    masterGain.gain.setValueAtTime(CONFIG.sound.volume, audioCtx.currentTime);
  }
  if (playBtn) {
    playBtn.textContent = 'Pause';
    playBtn.setAttribute('aria-label', 'Pause performance');
  }
  if (replayBtn) replayBtn.classList.remove('visible');
  buildOpera();
}

function stopOpera() {
  document.body.classList.remove('playing');
  typeIn();
  if (replayBtn) replayBtn.classList.remove('visible');

  // Mute audio smoothly
  isAmbient = true;
  if (audioCtx && masterGain) {
    const t = audioCtx.currentTime;
    masterGain.gain.cancelScheduledValues(t);
    masterGain.gain.setValueAtTime(masterGain.gain.value, t);
    masterGain.gain.linearRampToValueAtTime(0.0001, t + 0.2);
  }

  if (playBtn) {
    playBtn.textContent = 'Play';
    playBtn.setAttribute('aria-label', 'Play performance');
  }

  buildOpera();
}

// Start playing silently in the background immediately
buildOpera();
if (new URLSearchParams(window.location.search).get('play') === '1') {
  startOpera();
}

if (playBtn) {
  playBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAmbient) {
      startOpera();
    } else {
      stopOpera();
    }
  });
}

// Clicking anywhere on stage starts/pauses
window.addEventListener('click', (e) => {
  if (e.target.closest('a') || e.target.closest('button')) return;
  if (isAmbient) {
    startOpera();
  }
});

function replay() {
  startOpera();
}

if (replayBtn) {
  replayBtn.addEventListener('click', replay);
}

// Invalidate cached cell size on resize and fit title
window.addEventListener('resize', () => {
  _cell = 0;
  fitTitle();
});
