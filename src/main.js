import { CONFIG, MODES, COLORS, MOTIF, ROOT, hz, SIZE, CENTER } from './config.js';

const worldEl = document.getElementById('world');
const grid = document.getElementById('grid');
const replayBtn = document.getElementById('replay');

let dots = []; // [row * SIZE + col] → { el, col, row, ring }
let opera;
let audioCtx, masterGain, roomFilter, delayL, delayR, delayGainL, delayGainR, noiseBuf;

// Stage
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

// Audio: shared cathedral room with living, breathing voices
function initAudio() {
  if (!CONFIG.sound.enabled) return;
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    masterGain = audioCtx.createGain();
    masterGain.gain.value = CONFIG.sound.volume;
    masterGain.connect(audioCtx.destination);

    // Warm opera house damping: velvet absorption in delay feedback path
    roomFilter = audioCtx.createBiquadFilter();
    roomFilter.type = 'lowpass';
    roomFilter.frequency.value = 1800;
    roomFilter.Q.value = 0.7;

    // Cross-feedback stereo delay line (0.28s / 0.38s — prime ratio prevents flutter)
    delayL = audioCtx.createDelay(1.0);
    delayR = audioCtx.createDelay(1.0);
    delayL.delayTime.value = 0.28;
    delayR.delayTime.value = 0.38;

    // Merge delays into stereo room filter, then to master
    const merger = audioCtx.createChannelMerger(2);
    delayL.connect(merger, 0, 0);
    delayR.connect(merger, 0, 1);
    merger.connect(roomFilter);
    roomFilter.connect(masterGain);

    // Cross-feedback loop: filtered Left crosses to Right delay, Right crosses to Left delay
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

    // Reusable 1-second white noise buffer for heartbeats, breath, and impacts
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

// Operatic Voice Synth: living formant filter envelopes, late vibrato, ring-mod menace
function note(pitchOrSemi, { dur = 0.5, vol = 0.12, type = 'sine', pan = 0, grit = false, voice = 'tenor', vibrato = false, attack = null } = {}) {
  if (isAmbient || !audioCtx) return;
  const t = audioCtx.currentTime;
  const freq = typeof pitchOrSemi === 'number' && pitchOrSemi < 60 ? hz(pitchOrSemi) : pitchOrSemi;

  const isSoprano = voice === 'soprano';
  const att = attack !== null ? attack : (isSoprano ? 0.035 : 0.02);

  // 1. Amplitude envelope (exponential release)
  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.linearRampToValueAtTime(vol, t + att);
  gain.gain.exponentialRampToValueAtTime(0.0008, t + dur);

  // 2. Vocal Formant Filter Envelope: opens on breath onset, warms on release
  const vFilter = audioCtx.createBiquadFilter();
  vFilter.type = 'lowpass';
  vFilter.Q.value = isSoprano ? 1.4 : 1.1;
  const fStart = isSoprano ? 1000 : 550;
  const fPeak = isSoprano ? 3600 : 2200;
  const fEnd = isSoprano ? 1100 : 600;
  vFilter.frequency.setValueAtTime(fStart, t);
  vFilter.frequency.exponentialRampToValueAtTime(fPeak, t + att * 1.5);
  vFilter.frequency.exponentialRampToValueAtTime(fEnd, t + dur);

  // Equal-power stereo panning
  let out = gain;
  if (audioCtx.createStereoPanner) {
    const panner = audioCtx.createStereoPanner();
    panner.pan.setValueAtTime(Math.max(-1, Math.min(1, pan)), t);
    gain.connect(panner);
    out = panner;
  }
  out.connect(masterGain);

  // Send to cross-feedback cathedral delay
  if (delayL && delayR) {
    const send = audioCtx.createGain();
    send.gain.value = isSoprano ? 0.58 : 0.42;
    out.connect(send);
    send.connect(delayL);
    send.connect(delayR);
  }

  // 3. Voice Profiles:
  // Soprano: singing fundamental + overtone 5th + subtle sub-octave
  // Tenor: micro-detuned fundamental pair (+-3.5 cents) + cello sub-octave body
  const voices = isSoprano
    ? [
        { mult: 1, type: 'sine', level: 0.72, detune: 0 },
        { mult: 1.5, type: 'triangle', level: 0.18, detune: 2 },
        { mult: 0.5, type: 'sine', level: 0.08, detune: 0 },
      ]
    : [
        { mult: 1, type, level: 0.55, detune: -3.5 },
        { mult: 1, type, level: 0.55, detune: 3.5 },
        { mult: 0.5, type: 'sine', level: 0.20, detune: 0 },
        { mult: 1.5, type: 'sine', level: 0.10, detune: 0 },
      ];

  // 4. Operatic Vibrato: straight onset, late bloom after 200ms
  let vibGain = null;
  if (vibrato && dur > 0.55) {
    const lfo = audioCtx.createOscillator();
    lfo.frequency.value = isSoprano ? 5.2 : 4.8; // Italian soprano rate
    vibGain = audioCtx.createGain();
    vibGain.gain.setValueAtTime(0, t);
    vibGain.gain.setValueAtTime(0, t + 0.20); // late arrival
    vibGain.gain.linearRampToValueAtTime(isSoprano ? 5.0 : 3.2, t + 0.65);
    lfo.connect(vibGain);
    lfo.start(t);
    lfo.stop(t + dur + 0.15);
  }

  // 5. Ring Modulation for Menace (Acts IV & V)
  let ringMod = null;
  if (grit) {
    voices.push({ mult: 1, type: 'sawtooth', level: 0.22, detune: 0 });
    const ringOsc = audioCtx.createOscillator();
    ringOsc.type = 'sawtooth';
    ringOsc.frequency.setValueAtTime(freq * 0.5, t);
    const ringGain = audioCtx.createGain();
    ringGain.gain.value = 0.5;
    ringOsc.connect(ringGain.gain);
    ringOsc.start(t);
    ringOsc.stop(t + dur + 0.15);
    ringMod = ringGain;
  }

  for (const v of voices) {
    const osc = audioCtx.createOscillator();
    osc.type = v.type;
    osc.frequency.value = freq * v.mult;
    if (v.detune && osc.detune) osc.detune.value = v.detune;
    if (vibGain) vibGain.connect(osc.frequency);

    const g = audioCtx.createGain();
    g.gain.value = v.level;
    osc.connect(g);

    if (ringMod && v.type === 'sawtooth') {
      g.connect(ringMod);
      ringMod.connect(vFilter);
    } else {
      g.connect(vFilter);
    }
    osc.start(t);
    osc.stop(t + dur + 0.15);
  }

  vFilter.connect(gain);
}

// Biological Lub-Dub Heartbeat: anatomical dual contraction
function thump(vol = 0.35, { startF = 82, endF = 36, dur = 0.16, noise = true, lubDub = false } = {}) {
  if (isAmbient || !audioCtx) return;
  const t = audioCtx.currentTime;

  const strike = (startTime, volume, sf, ef, d) => {
    const osc = audioCtx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(sf, startTime);
    osc.frequency.exponentialRampToValueAtTime(ef, startTime + d * 0.75);

    const oscGain = audioCtx.createGain();
    oscGain.gain.setValueAtTime(0.001, startTime);
    oscGain.gain.linearRampToValueAtTime(volume, startTime + 0.008);
    oscGain.gain.exponentialRampToValueAtTime(0.001, startTime + d);

    osc.connect(oscGain);
    oscGain.connect(masterGain);
    osc.start(startTime);
    osc.stop(startTime + d + 0.02);

    if (noise && noiseBuf) {
      const nSource = audioCtx.createBufferSource();
      nSource.buffer = noiseBuf;
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(110, startTime);

      const nGain = audioCtx.createGain();
      nGain.gain.setValueAtTime(volume * 0.38, startTime);
      nGain.gain.exponentialRampToValueAtTime(0.001, startTime + d * 0.5);

      nSource.connect(filter);
      filter.connect(nGain);
      nGain.connect(masterGain);

      nSource.start(startTime);
      nSource.stop(startTime + d * 0.6);
    }
  };

  // Lub (Systole)
  strike(t, vol, startF, endF, dur);

  // Dub (Diastole) — slightly higher, 35% quieter, 170ms later
  if (lubDub) {
    strike(t + 0.17, vol * 0.65, startF * 1.15, endF * 1.15, dur * 0.85);
  }
}

// Master timeline score callback
function score(tl, time, fn) {
  tl.call(() => fn(), [], time);
}

// Camera: zooms close, travels far across the stage
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

// Lights: hero torch handed cell to cell
function hop(tl, light, col, row, time, opts = {}) {
  const { leave = null, arriveScale = 1.3, note: pitch = null, vol = 0.11, dur = 0.45, pan = null, grit = false, voice = 'tenor', vibrato = false } = opts;
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
    score(tl, time, () => note(pitch, { vol, dur, pan: notePan, grit, voice, vibrato }));
  }

  light.col = col;
  light.row = row;
}

// Organic decay: multi-source rot from random edge seeds + layered trig noise
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

// ACT I — BIRTH: macro close-up, first light, anatomical lub-dub heartbeat
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

  // Tenor opening fundamental: C3 (0 semitones)
  score(tl, start, () => note(0, { dur: 1.8, vol: 0.15, attack: 0.03, voice: 'tenor' }));

  for (let i = 0; i < heartbeats; i++) {
    const hb = start + 1.4 + i * 0.85;
    // Systolic pulse + Diastolic rebound in dot scale
    tl.to(soul.el, { scale: 1.3, duration: 0.12, ease: 'power2.out' }, hb)
      .to(soul.el, { scale: 1.15, duration: 0.15, ease: 'power2.inOut' }, hb + 0.12)
      .to(soul.el, { scale: 1.22, duration: 0.10, ease: 'power2.out' }, hb + 0.27)
      .to(soul.el, { scale: 1.1, duration: 0.35, ease: 'power2.inOut' }, hb + 0.37);

    score(tl, hb, () => thump(0.36, { lubDub: true }));
  }
}

// ACT II — DEVELOPMENT: wide anthem sweep, open voicing (drop 5th)
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

  // The Anthem: stacked open C Major voicings without muddy 5ths
  for (let dist = 0; dist <= CENTER; dist++) {
    const t = start + dist * rowGap;
    score(tl, t, () => note(rowChord[dist], { dur: 1.6, vol: 0.12, type: 'triangle' }));
  }

  // Hero's first journey: camera punches in, tenor motif [12, 16] (C4 -> E4)
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
      vol: 0.13,
      voice: 'tenor',
    });
    camera(tl, t, { col, row, zoom: 1.85, dur: 0.65 });
    t += 0.7;
  });
  camera(tl, t + 0.3, { zoom: 1.5, dur: 1.2 });
}

// ACT III — LOVE: The Bel Canto Duet
// Tenor call, soprano answer, sweeping stage pan, parallel thirds
function actLove(tl, hero, beloved) {
  const { start, hopGap, heroDance, belovedDance } = CONFIG.acts.love;

  // Sapphire dusk falls
  camera(tl, start, { zoom: 1.5, dur: 1.5 });
  tl.call(() => everyDot((d) => d.el.style.setProperty('--dot-color', COLORS.dusk)), [], start);
  tl.to(dots.map((d) => d.el), { opacity: 0.18, scale: 0.85, duration: 1.2, ease: 'power2.inOut' }, start);

  tl.call(() => at(hero.col, hero.row).el.style.setProperty('--dot-color', COLORS.soul), [], start + 0.2);
  tl.to(at(hero.col, hero.row).el, { opacity: 0.8, scale: 1.15, duration: 0.8 }, start + 0.2);

  // 1. THE QUESTION (Tenor Call: C4 -> D4)
  const callAt = start + 0.5;
  score(tl, callAt, () => note(MOTIF.heroCall[0], { dur: 0.5, vol: 0.12, pan: -0.2, voice: 'tenor' }));
  score(tl, callAt + 0.45, () => note(MOTIF.heroCall[1], { dur: 0.7, vol: 0.13, pan: -0.2, voice: 'tenor' }));

  // 2. SHE APPEARS at (6, 4) in rose light
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

  // 3. THE ANSWER (Soprano contrary descent: G4 -> E4 with late vibrato)
  score(tl, appearAt + 0.2, () => note(MOTIF.belovedAnswer[0], { dur: 0.55, vol: 0.13, pan: 0.3, voice: 'soprano' }));
  score(tl, appearAt + 0.65, () => note(MOTIF.belovedAnswer[1], { dur: 0.85, vol: 0.14, pan: 0.3, voice: 'soprano', vibrato: true }));

  beloved.col = bc;
  beloved.row = br;
  const duskLook = () => ({ color: COLORS.dusk, opacity: 0.18, scale: 0.85 });
  const stepAt = start + 2.5;
  hop(tl, beloved, belovedDance[0][0], belovedDance[0][1], stepAt, {
    leave: duskLook(),
    note: 16, // E4
    vol: 0.12,
    voice: 'soprano',
  });

  // 4. THE DUET: Intimate close two-shot (zoom: 2.3) at (4.5, 4.5)
  camera(tl, start + 3.0, { col: 4.5, row: 4.5, zoom: 2.3, dur: 1.8 });

  // Parallel Thirds as they twirl on the 2x2 box:
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
      vol: 0.12,
      pan: -0.25,
      voice: 'tenor',
    });
    hop(tl, beloved, belovedDance[i][0], belovedDance[i][1], t + 0.15, {
      leave: duskLook(),
      note: bSemi,
      vol: 0.13,
      pan: 0.25,
      voice: 'soprano',
      vibrato: true,
    });
  }

  // 5. HELD TOGETHER: Open cathedral chord (C3 + C4 + E4 soprano with late vibrato)
  const held = start + 3.4 + (heroDance.length - 1) * hopGap + 0.7;
  camera(tl, held, { col: 4.5, row: 4.5, zoom: 1.55, dur: 2.2 });
  score(tl, held, () => {
    note(0, { dur: 3.8, vol: 0.10, pan: 0.0, type: 'triangle' }); // C3 deep floor
    note(12, { dur: 3.5, vol: 0.12, pan: -0.25, voice: 'tenor', attack: 0.03 }); // C4 tenor
    note(16, { dur: 3.6, vol: 0.14, pan: 0.25, voice: 'soprano', vibrato: true, attack: 0.04 }); // E4 soprano
  });
}

// ACT IV — JEALOUSY: claustrophobic room, dissonant wounds, agonizing suspension
function actJealousy(tl, hero, beloved) {
  const { start, gateStep, belovedCell, heroFlee } = CONFIG.acts.jealousy;

  // The room contracts: muffled crypt acoustics (650 Hz)
  score(tl, start, () => setRoom(650, 0.42, 0.8));
  camera(tl, start, { zoom: 1.3, dur: 1.2 });

  tl.to(
    dots.filter((d) => d.el !== at(hero.col, hero.row).el && d.el !== at(beloved.col, beloved.row).el).map((d) => d.el),
    { opacity: 0.25, duration: 1.0, ease: 'power2.inOut' },
    start
  );

  // The gate descends row by row with minor second / tritone wound intervals
  for (let row = 0; row < SIZE; row++) {
    const t = start + row * gateStep;
    everyDot((d) => {
      if (d.row !== row) return;
      if (d.col === hero.col && d.row === 8) return;
      tl.call(() => d.el.style.setProperty('--dot-color', COLORS.envy), [], t + d.col * 0.02);
      tl.to(d.el, { opacity: 0.75, scale: 0.95, duration: 0.5, ease: 'power2.out' }, t + d.col * 0.02);
    });
    score(tl, t, () => note(MODES.WOUND[row % 3], { dur: 0.8, vol: 0.06 }));
  }

  // It takes her — AGONIZING OPERATIC SUSPENSION:
  // Her voice hangs for 400ms while crashing tritone hits beneath her
  const taken = start + belovedCell[1] * gateStep;
  tl.call(() => at(belovedCell[0], belovedCell[1]).el.style.setProperty('--dot-color', COLORS.envy), [], taken);
  tl.to(at(belovedCell[0], belovedCell[1]).el, { scale: 0.9, opacity: 0.75, duration: 0.6 }, taken);
  score(tl, taken, () => {
    note(16, { dur: 0.9, vol: 0.12, pan: 0.3, voice: 'soprano', vibrato: true }); // suspended E4
    note(6, { dur: 1.5, vol: 0.11, pan: 0.0, grit: true }); // tritone crash
  });
  beloved.dead = true;

  // Hero flees downward at high velocity; camera lunges down tracking him
  heroFlee.forEach(([col, row], i) => {
    const t = taken + 0.3 + i * 0.5;
    hop(tl, hero, col, row, t, {
      leave: { color: COLORS.dusk, opacity: 0.25, scale: 0.85 },
      note: MOTIF.hero[i % 2],
      vol: 0.10,
      voice: 'tenor',
    });
    camera(tl, t, { col, row, zoom: 1.95, dur: 0.45, ease: 'power1.out' });
  });
}

// ACT V — REVENGE: crimson fury, ring-modulated hunt, sforzando impact
function actRevenge(tl, hero) {
  const { start, hopGap, huntPath } = CONFIG.acts.revenge;

  tl.call(() => (hero.color = COLORS.heroRage), [], start);
  tl.call(() => at(hero.col, hero.row).el.style.setProperty('--dot-color', COLORS.heroRage), [], start);
  score(tl, start, () => note(MOTIF.heroBroken[0], { vol: 0.14, dur: 0.8, type: 'sawtooth', grit: true, voice: 'tenor' }));
  camera(tl, start, { col: hero.col, row: hero.row, zoom: 2.1, dur: 0.8 });

  // The hunt: 12 rapid zigzag hops across the board
  huntPath.forEach(([col, row], i) => {
    const t = start + 0.6 + i * hopGap;
    hop(tl, hero, col, row, t, {
      leave: { color: COLORS.rage, opacity: 0.75, scale: 0.95 },
      arriveScale: 1.25,
      note: MOTIF.heroBroken[i % 2],
      vol: 0.13,
      dur: 0.45,
      pan: panAt(col),
      grit: true,
      voice: 'tenor',
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

  // Final strike at (4, 0): SFORZANDO (sfz) CLIMAX + micro camera shake
  const finalHuntT = start + 0.6 + (huntPath.length - 1) * hopGap;
  score(tl, finalHuntT, () => {
    note(-12, { dur: 1.4, vol: 0.22, type: 'sawtooth', grit: true }); // C2 growl
  });
  tl.to(worldEl, { y: '+=14', duration: 0.05, yoyo: true, repeat: 3, ease: 'sine.inOut' }, finalHuntT);

  // What remains: embers. Solitary hero at (4, 0)
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

// ACT VI — ACCEPTANCE: step-by-step healing walk home, outward violet peace, double Amen cadence
function actAcceptance(tl, hero) {
  const { start, peaceSpread, homePath, memoryCell, chordGap } = CONFIG.acts.acceptance;

  // The room opens into soaring cathedral acoustics (2400 Hz)
  score(tl, start, () => setRoom(2400, 0.40, 1.2));

  tl.call(() => at(hero.col, hero.row).el.style.setProperty('--dot-color', COLORS.healing[0]), [], start);

  homePath.forEach(([col, row], i) => {
    const t = start + 0.35 + i * 0.85;
    const stepColor = COLORS.healing[i + 1];
    tl.call(() => (hero.color = stepColor), [], t);
    hop(tl, hero, col, row, t, {
      leave: { color: COLORS.ember, opacity: 0.14, scale: 0.65 },
      arriveScale: 1.25,
      note: MOTIF.hero[i % 2],
      vol: 0.12,
      dur: 0.75,
      voice: 'tenor',
    });
    camera(tl, t, { col: 4, row, zoom: 1.75, dur: 0.75 });
  });

  const settleT = start + 3.2;
  camera(tl, settleT, { col: CENTER, row: CENTER, zoom: 1.25, dur: 2.2 });

  const home = at(CENTER, CENTER);
  tl.to(home.el, { scale: 1.3, duration: 1.6, yoyo: true, repeat: 2, ease: 'sine.inOut' }, settleT);

  // Concentric rings of violet peace
  const floodStart = settleT + 0.4;
  everyDot((d) => {
    if (d.col === CENTER && d.row === CENTER) return;
    const t = floodStart + d.ring * peaceSpread;
    tl.call(() => d.el.style.setProperty('--dot-color', COLORS.peace(d.ring)), [], t);
    tl.to(d.el, { opacity: 0.72, scale: 1, duration: 1.2, ease: 'sine.inOut' }, t);
  });

  // The Plagal Cadence, twice (IV -> I) in pure two-voice open harmony:
  // IV: F3 (5) + A3 (9)  -->  I: C3 (0) + E3 (4)
  [0, chordGap].forEach((offset) => {
    // IV (F - A)
    score(tl, settleT + 0.6 + offset, () => {
      note(5, { dur: 2.0, vol: 0.09, type: 'triangle', attack: 0.04 });
      note(9, { dur: 2.0, vol: 0.08, type: 'triangle', attack: 0.04 });
    });
    // I (C - E resolution)
    score(tl, settleT + 0.6 + offset + chordGap / 2, () => {
      note(0, { dur: 2.6, vol: 0.11, type: 'triangle', attack: 0.04 });
      note(4, { dur: 2.6, vol: 0.09, type: 'triangle', attack: 0.04 });
    });
  });

  // Where she was at (5, 4): tender rose memory light remains
  const mem = at(memoryCell[0], memoryCell[1]);
  tl.call(() => mem.el.style.setProperty('--dot-color', COLORS.memory), [], settleT + 1.2);
  tl.to(mem.el, { opacity: 0.85, scale: 1.15, duration: 1.0, ease: 'sine.inOut' }, settleT + 1.2);
}

// ACT VII — DEATH & THE "FAT LADY" ARIA:
// Dying heartbeats, beloved's ghost halo, soaring high soprano aria (G4 -> A4 -> C5), subterranean C1 pedal
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
      score(tl, t, () => note(semi, { dur: 1.0, vol: 0.045, pan: panAt(d.col) }));
    }
  });

  // The last light: hero cools to a solitary tungsten ember
  const maxDeath = start + Math.max(...order.map(deathTime));
  const emberAt = maxDeath + 0.6;
  tl.call(() => {
    heroCell.el.style.setProperty('--dot-color', COLORS.lastEmber);
  }, [], emberAt);
  tl.to(heroCell.el, { opacity: 0.9, scale: 0.95, duration: 0.8, ease: 'power2.out' }, emberAt);

  // 1. Slow, heavy anatomical heartbeat at 48 BPM:
  score(tl, emberAt + 0.6, () => thump(0.28, { startF: 68, endF: 28, dur: 0.22, noise: false, lubDub: true }));
  tl.to(heroCell.el, { scale: 1.1, duration: 0.14 }, emberAt + 0.6)
    .to(heroCell.el, { scale: 0.95, duration: 0.14 }, emberAt + 0.74)
    .to(heroCell.el, { scale: 1.03, duration: 0.10 }, emberAt + 0.88)
    .to(heroCell.el, { scale: 0.9, duration: 0.40 }, emberAt + 0.98);

  // Hero starts motif... and stops mid-phrase
  score(tl, emberAt + 0.6, () => note(MOTIF.hero[0], { dur: 0.8, vol: 0.10, voice: 'tenor' }));

  // 2. THE "FAT LADY" SINGS (The Beloved's Ghost Re-ignites at 5, 4):
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

  // Climactic Soprano Aria: G4 (19) -> A4 (21) -> High C5 (24 = 523.25 Hz) with swelling vibrato!
  score(tl, ariaAt + 0.2, () => note(MOTIF.aria[0], { dur: 0.85, vol: 0.13, pan: 0.35, voice: 'soprano' }));
  score(tl, ariaAt + 0.9, () => note(MOTIF.aria[1], { dur: 0.95, vol: 0.14, pan: 0.35, voice: 'soprano' }));
  score(tl, ariaAt + 1.7, () => note(MOTIF.aria[2], { dur: 2.4, vol: 0.16, pan: 0.35, voice: 'soprano', vibrato: true }));

  // 3. Final dying cardiac pulse underneath the high C
  const finalBeatAt = ariaAt + 2.4;
  score(tl, finalBeatAt, () => thump(0.18, { startF: 55, endF: 24, dur: 0.24, noise: false }));
  tl.to(heroCell.el, { scale: 0.96, duration: 0.18 }, finalBeatAt).to(
    heroCell.el,
    { scale: 0.75, duration: 0.8 },
    finalBeatAt + 0.18
  );

  // Soprano tender descent (E4 -> C4) as her breath finishes
  score(tl, finalBeatAt + 1.2, () => note(16, { dur: 1.2, vol: 0.10, pan: 0.3, voice: 'soprano', vibrato: true }));

  // 4. Silence: Her celestial star and his amber ember dissolve together into eternity
  const fadeAt = finalBeatAt + 2.4;
  tl.to(heroCell.el, { opacity: 0, scale: 0.1, duration: 3.2, ease: 'power2.in' }, fadeAt);
  tl.to(ghostCell.el, { opacity: 0, scale: 0.1, duration: 3.2, ease: 'power2.in' }, fadeAt);
  tl.call(() => ghostCell.el.classList.remove('ghost-aria'), [], fadeAt + 3.2);

  // Subterranean C1 organ pedal fading into eternity
  score(tl, fadeAt, () => {
    note(-12, { dur: 3.6, vol: 0.11 });       // C2
    note(-24, { dur: 4.8, vol: 0.08, type: 'sine' }); // 32.7 Hz C1 pedal
  });
}

// THE OPERA
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

document.fonts.ready.then(() => fitTitle());

if (titleEl && technoSpan) {
  fitTitle();
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    [...titleEl.children].forEach((s, i) =>
      s.animate(
        { clipPath: ['inset(0 100% 0 0)', 'inset(0 0 0 0)'] },
        { duration: 420, delay: 200 + i * 260, easing: `steps(${s.textContent.length})`, fill: 'backwards' }
      )
    );
  }
}

buildGrid();

function startOpera() {
  isAmbient = false;
  document.body.classList.add('playing');
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
