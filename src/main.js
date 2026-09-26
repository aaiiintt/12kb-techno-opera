import { CONFIG, MODES, COLORS, MOTIF, PITCH, semitone } from './config.js';

const worldEl = document.getElementById('world');
const grid = document.getElementById('grid');
const replayBtn = document.getElementById('replay');

const SIZE = CONFIG.grid.size;
const CENTER = CONFIG.grid.center;

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

// Spatial panning: maps dot column to stereo balance (-1.0 left, 0 center, +1.0 right)
const panAt = (col) => (CONFIG.sound.spatial ? (col - CENTER) / CENTER : 0);

// Audio: one shared cathedral room, living voices
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

    // Cross-feedback stereo delay line (0.28s left, 0.38s right — prime ratio prevents flutter)
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

    // Noise buffer for biological heartbeat impact
    noiseBuf = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.15, audioCtx.sampleRate);
    const data = noiseBuf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
}

let isAmbient = true;

function note(freq, { dur = 0.5, vol = 0.12, type = 'sine', pan = 0, grit = false, voice = 'tenor', vibrato = false, attack = null } = {}) {
  if (isAmbient || !audioCtx) return;
  const t = audioCtx.currentTime;

  const isSoprano = voice === 'soprano';
  const att = attack !== null ? attack : (isSoprano ? 0.032 : 0.016);

  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.linearRampToValueAtTime(vol, t + att);
  gain.gain.exponentialRampToValueAtTime(0.0008, t + dur);

  // Equal-power stereo panning
  let out = gain;
  if (audioCtx.createStereoPanner) {
    const panner = audioCtx.createStereoPanner();
    panner.pan.setValueAtTime(Math.max(-1, Math.min(1, pan)), t);
    gain.connect(panner);
    out = panner;
  }

  out.connect(masterGain);

  // Send to cross-feedback room delay
  if (delayL && delayR) {
    const send = audioCtx.createGain();
    send.gain.value = isSoprano ? 0.55 : 0.42; // Soprano voice soars further in cathedral
    out.connect(send);
    send.connect(delayL);
    send.connect(delayR);
  }

  // Voice profiles:
  // Soprano: luminous singing fundamental + overtone fifth + subtle sub-octave
  // Tenor: micro-detuned fundamental pair (+-3.5 cents) + cello sub-octave body + fifth
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

  if (grit) {
    voices.push({ mult: 1, type: 'sawtooth', level: 0.20, detune: 0 });
  }

  // Operatic Vibrato LFO: swells after 250ms on sustained tones
  let vibGain = null;
  if (vibrato && dur > 0.6) {
    const lfo = audioCtx.createOscillator();
    lfo.frequency.value = 4.8; // 4.8 Hz natural human vibrato rate
    vibGain = audioCtx.createGain();
    vibGain.gain.setValueAtTime(0, t);
    vibGain.gain.setValueAtTime(0, t + 0.25);
    vibGain.gain.linearRampToValueAtTime(isSoprano ? 4.8 : 3.0, t + 0.75); // depth in Hz
    lfo.connect(vibGain);
    lfo.start(t);
    lfo.stop(t + dur + 0.15);
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
    g.connect(gain);
    osc.start(t);
    osc.stop(t + dur + 0.15);
  }
}

function thump(vol = 0.35, { startF = 82, endF = 36, dur = 0.16, noise = true } = {}) {
  if (isAmbient || !audioCtx) return;
  const t = audioCtx.currentTime;

  // 1. Biological pitch plunge (systolic contraction)
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

  // 2. Chest cavity thud: filtered noise impulse
  if (noise && noiseBuf) {
    const nSource = audioCtx.createBufferSource();
    nSource.buffer = noiseBuf;
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(110, t);

    const nGain = audioCtx.createGain();
    nGain.gain.setValueAtTime(vol * 0.4, t);
    nGain.gain.exponentialRampToValueAtTime(0.001, t + dur * 0.5);

    nSource.connect(filter);
    filter.connect(nGain);
    nGain.connect(masterGain);

    nSource.start(t);
    nSource.stop(t + dur * 0.6);
  }
}

// Sound scheduled on the master timeline's clock.
function score(tl, time, fn) {
  tl.call(() => fn(), [], time);
}

// Camera: zooms close, travels far across the stage.
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

// Lights: the hero is a torch handed cell to cell.
// All paths are known at build time, so everything is scheduled.
function hop(tl, light, col, row, time, opts = {}) {
  const { leave = null, arriveScale = 1.3, note: freq = null, vol = 0.11, dur = 0.45, pan = null, grit = false, voice = 'tenor', vibrato = false } = opts;
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
  if (freq) {
    // Relate left/right stereo balance to horizontal grid position
    const notePan = pan !== null ? pan : panAt(col);
    score(tl, time, () => note(freq, { vol, dur, pan: notePan, grit, voice, vibrato }));
  }

  light.col = col;
  light.row = row;
}

// Organic decay: multi-source rot from random edge seeds
// + layered-trig noise. Every death is unique.
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

// ACT I — BIRTH: macro close-up, first light, vital heartbeat.
function actBirth(tl, hero) {
  const { start, heartbeats } = CONFIG.acts.birth;
  const soul = at(hero.col, hero.row);

  // Deep macro close-up right on the newborn soul dot
  camera(tl, start, { zoom: 2.2, dur: 0.1 });
  camera(tl, start + 0.3, { zoom: 1.6, dur: 3.5 });

  // Reset room acoustics to warm opera house (1800 Hz)
  score(tl, start, () => {
    if (roomFilter && audioCtx) roomFilter.frequency.setValueAtTime(1800, audioCtx.currentTime);
  });

  tl.call(() => {
    soul.el.style.setProperty('--dot-color', COLORS.soul);
  }, [], start);
  tl.to(soul.el, { opacity: 0.95, scale: 1.1, duration: 1.4, ease: 'power2.out' }, start);
  score(tl, start, () => note(PITCH.C3, { dur: 1.8, vol: 0.15, attack: 0.03, voice: 'tenor' }));

  for (let i = 0; i < heartbeats; i++) {
    const hb = start + 1.4 + i * 0.8;
    tl.to(soul.el, { scale: 1.3, duration: 0.14, ease: 'power2.out' }, hb).to(
      soul.el,
      { scale: 1.1, duration: 0.4, ease: 'power2.inOut' },
      hb + 0.14
    );
    score(tl, hb, () => thump(0.36));
  }
}

// ACT II — DEVELOPMENT: wide anthem sweep, then kinetic
// camera chase as hero wanders across cells.
function actDevelopment(tl, hero) {
  const { start, rowGap, rowChord, wander } = CONFIG.acts.development;

  // Pull back to reveal the full anthem in glowing stripes
  camera(tl, start, { zoom: 1.35, dur: 1.8 });

  everyDot((d) => {
    const dist = Math.abs(d.row - CENTER);
    const time = start + dist * rowGap + d.col * 0.03;
    tl.call(() => d.el.style.setProperty('--dot-color', COLORS.rowStripe(dist)), [], time);
    // Gold equator stays luminous (0.92) so it never dims to brown/beige
    const op = dist === 0 ? 0.92 : 0.78;
    tl.to(d.el, { opacity: op, scale: 1, duration: 0.9, ease: 'elastic.out(1, 0.6)', immediateRender: false }, time);
  });

  // The anthem: each row-pair adds one chord tone, stacking C-E-G-C-E
  for (let dist = 0; dist <= CENTER; dist++) {
    const t = start + dist * rowGap;
    score(tl, t, () => note(semitone(PITCH.C3, rowChord[dist]), { dur: 1.6, vol: 0.12, type: 'triangle' }));
  }

  // The hero's first journey: camera punches in close (zoom: 1.85) and sweeps across cells!
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

// ACT III — LOVE: The Bel Canto Duet.
// Tenor call, soprano answer, sweeping stage pan, parallel thirds.
function actLove(tl, hero, beloved) {
  const { start, zoom, hopGap, heroDance, belovedDance } = CONFIG.acts.love;

  // Dusk falls — world dims to soft violet haze
  camera(tl, start, { zoom: 1.5, dur: 1.5 });
  tl.call(() => everyDot((d) => d.el.style.setProperty('--dot-color', COLORS.dusk)), [], start);
  tl.to(
    dots.map((d) => d.el),
    { opacity: 0.18, scale: 0.85, duration: 1.2, ease: 'power2.inOut' },
    start
  );

  // He remains lit at center (4, 4)
  tl.call(() => at(hero.col, hero.row).el.style.setProperty('--dot-color', COLORS.soul), [], start + 0.2);
  tl.to(at(hero.col, hero.row).el, { opacity: 0.8, scale: 1.15, duration: 0.8 }, start + 0.2);

  // 1. THE QUESTION (Tenor Call): He sings toward the empty stage
  const callAt = start + 0.5;
  score(tl, callAt, () => note(MOTIF.heroCall[0], { dur: 0.5, vol: 0.12, pan: -0.2, voice: 'tenor' }));
  score(tl, callAt + 0.45, () => note(MOTIF.heroCall[1], { dur: 0.7, vol: 0.13, pan: -0.2, voice: 'tenor' }));

  // 2. SHE APPEARS across the hall at (6, 4) in glowing rose!
  const [bc, br] = [6, 4];
  const appearAt = start + 1.4;
  tl.call(() => at(bc, br).el.style.setProperty('--dot-color', COLORS.beloved), [], appearAt);
  tl.fromTo(
    at(bc, br).el,
    { scale: 0 },
    { opacity: 0.85, scale: 1.25, duration: 0.8, ease: 'back.out(2)', immediateRender: false },
    appearAt
  );
  // Camera sweeps dynamically across the stage to frame her
  camera(tl, appearAt, { col: bc, row: br, zoom: 2.1, dur: 0.9 });

  // 3. THE ANSWER (Soprano): She sings back to him
  score(tl, appearAt + 0.2, () => note(MOTIF.belovedAnswer[0], { dur: 0.55, vol: 0.13, pan: 0.3, voice: 'soprano' }));
  score(tl, appearAt + 0.65, () => note(MOTIF.belovedAnswer[1], { dur: 0.85, vol: 0.14, pan: 0.3, voice: 'soprano', vibrato: true }));

  // She steps closer toward the center box
  beloved.col = bc;
  beloved.row = br;
  const duskLook = () => ({ color: COLORS.dusk, opacity: 0.18, scale: 0.85 });
  const stepAt = start + 2.5;
  hop(tl, beloved, belovedDance[0][0], belovedDance[0][1], stepAt, {
    leave: duskLook(),
    note: PITCH.E4,
    vol: 0.12,
    voice: 'soprano',
  });

  // 4. THE DUET: Camera pulls into an intimate close two-shot (zoom: 2.3) at (4.5, 4.5)
  camera(tl, start + 3.0, { col: 4.5, row: 4.5, zoom: 2.3, dur: 1.8 });

  // Parallel Thirds as they twirl on the 2x2 box:
  const duetThirds = [
    [PITCH.E4, PITCH.G4],
    [PITCH.F4, PITCH.A4],
    [PITCH.G4, PITCH.B3 * 2],
  ];

  for (let i = 1; i < heroDance.length; i++) {
    const t = start + 3.4 + (i - 1) * hopGap;
    const [hPitch, bPitch] = duetThirds[(i - 1) % duetThirds.length];

    hop(tl, hero, heroDance[i][0], heroDance[i][1], t, {
      leave: duskLook(),
      note: hPitch,
      vol: 0.12,
      pan: -0.25,
      voice: 'tenor',
    });
    hop(tl, beloved, belovedDance[i][0], belovedDance[i][1], t + 0.15, {
      leave: duskLook(),
      note: bPitch,
      vol: 0.13,
      pan: 0.25,
      voice: 'soprano',
      vibrato: true,
    });
  }

  // 5. HELD TOGETHER: The C Major chord blooms, camera eases back to zoom: 1.55
  const held = start + 3.4 + (heroDance.length - 1) * hopGap + 0.7;
  camera(tl, held, { col: 4.5, row: 4.5, zoom: 1.55, dur: 2.2 });
  score(tl, held, () => {
    note(PITCH.C4, { dur: 3.5, vol: 0.12, pan: -0.3, voice: 'tenor', attack: 0.03 });
    note(PITCH.E4, { dur: 3.5, vol: 0.13, pan: 0.3, voice: 'soprano', vibrato: true, attack: 0.04 });
    note(PITCH.G4, { dur: 3.8, vol: 0.10, pan: 0.0, vibrato: true, attack: 0.04 });
  });
}

// ACT IV — JEALOUSY: looming gate, agonizing suspension,
// high-speed downward flee into the corner.
function actJealousy(tl, hero, beloved) {
  const { start, gateStep, belovedCell, heroFlee } = CONFIG.acts.jealousy;

  // The room contracts: acoustics become dark, muffled, and claustrophobic (650 Hz)
  score(tl, start, () => {
    if (roomFilter && audioCtx) roomFilter.frequency.setTargetAtTime(650, audioCtx.currentTime, 0.8);
  });

  // Camera pulls back to zoom: 1.3 to show the looming menace of the green wall
  camera(tl, start, { zoom: 1.3, dur: 1.2 });

  tl.to(
    dots.filter((d) => d.el !== at(hero.col, hero.row).el && d.el !== at(beloved.col, beloved.row).el).map((d) => d.el),
    { opacity: 0.25, duration: 1.0, ease: 'power2.inOut' },
    start
  );

  // The gate descends
  for (let row = 0; row < SIZE; row++) {
    const t = start + row * gateStep;
    everyDot((d) => {
      if (d.row !== row) return;
      if (d.col === hero.col && d.row === 8) return; // he is never taken
      tl.call(() => d.el.style.setProperty('--dot-color', COLORS.envy), [], t + d.col * 0.02);
      tl.to(d.el, { opacity: 0.75, scale: 0.95, duration: 0.5, ease: 'power2.out' }, t + d.col * 0.02);
    });
    score(tl, t, () => note(semitone(PITCH.C3, MODES.WOUND[row % 3]), { dur: 0.8, vol: 0.06 }));
  }

  // It takes her — AGONIZING OPERATIC SUSPENSION:
  // Her voice hangs in the air for 400ms while the crashing tritone bass hits beneath her!
  const taken = start + belovedCell[1] * gateStep;
  tl.call(() => at(belovedCell[0], belovedCell[1]).el.style.setProperty('--dot-color', COLORS.envy), [], taken);
  tl.to(at(belovedCell[0], belovedCell[1]).el, { scale: 0.9, opacity: 0.75, duration: 0.6 }, taken);
  score(tl, taken, () => {
    note(PITCH.E4, { dur: 0.9, vol: 0.12, pan: 0.3, voice: 'soprano', vibrato: true }); // Her suspended cry
    note(semitone(PITCH.C3, 6), { dur: 1.5, vol: 0.10, pan: 0.0 }); // Crashing tritone
  });
  beloved.dead = true;

  // He flees downward at high velocity; camera lunges down tracking him!
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

// ACT V — REVENGE: blood red hero, breathless zigzag hunt,
// explosive sforzando (sfz) camera impact.
function actRevenge(tl, hero) {
  const { start, zoom, hopGap, huntPath } = CONFIG.acts.revenge;

  // He turns red — close-up on fury at (4, 8)
  tl.call(() => (hero.color = COLORS.heroRage), [], start);
  tl.call(() => at(hero.col, hero.row).el.style.setProperty('--dot-color', COLORS.heroRage), [], start);
  score(tl, start, () => note(MOTIF.heroBroken[0], { vol: 0.14, dur: 0.8, type: 'triangle', grit: true, voice: 'tenor' }));
  camera(tl, start, { col: hero.col, row: hero.row, zoom: 2.1, dur: 0.8 });

  // The hunt: 12 rapid zigzag hops across the entire board!
  // At zoom: 1.85, the camera hurls hundreds of pixels across the canvas!
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
    // Vacated cell cools to ember; neighbours flare
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

  // Final strike at (4, 0): SFORZANDO (sfz) CLIMAX + micro-cam shake!
  const finalHuntT = start + 0.6 + (huntPath.length - 1) * hopGap;
  score(tl, finalHuntT, () => {
    note(PITCH.C2, { dur: 1.4, vol: 0.22, type: 'sawtooth', grit: true });
  });
  tl.to(worldEl, { y: '+=14', duration: 0.05, yoyo: true, repeat: 3, ease: 'sine.inOut' }, finalHuntT);

  // What remains: embers, everywhere. Camera STAYS locked on hero at (4, 0).
  const after = finalHuntT + 0.6;
  camera(tl, after, { col: 4, row: 0, zoom: 1.75, dur: 1.0 });
  tl.call(() => everyDot((d) => d.el.style.setProperty('--dot-color', COLORS.ember)), [], after);
  tl.to(
    dots.filter((d) => !(d.col === hero.col && d.row === hero.row)).map((d) => d.el),
    { opacity: 0.14, scale: 0.65, duration: 1.2, ease: 'power2.inOut' },
    after
  );
  // Hero remains bright and vivid at (4, 0), solitary and breathing
  tl.to(at(hero.col, hero.row).el, { opacity: 1.0, scale: 1.2, duration: 0.8 }, after);
  score(tl, after + 0.2, () => note(PITCH.C3, { dur: 1.8, vol: 0.09, type: 'triangle' }));
}

// ACT VI — ACCEPTANCE: he walks home step-by-step,
// healing from (4, 0) to (4, 4). Peace ripples outward.
function actAcceptance(tl, hero) {
  const { start, peaceSpread, homePath, memoryCell, chordGap } = CONFIG.acts.acceptance;

  // The room opens into soaring cathedral acoustics (2400 Hz)
  score(tl, start, () => {
    if (roomFilter && audioCtx) roomFilter.frequency.setTargetAtTime(2400, audioCtx.currentTime, 1.2);
  });

  // Hero begins walk home from (4, 0) -> (4, 1) -> (4, 2) -> (4, 3) -> (4, 4)
  // Step-by-step healing: red -> ember -> amber -> golden amber -> soul gold
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
    // Camera glides down column 4 keeping him dead-center!
    camera(tl, t, { col: 4, row, zoom: 1.75, dur: 0.75 });
  });

  // He arrives at center (4, 4) at start + 0.35 + 3 * 0.85 = start + 2.9s (~34.7s)
  // Settle: camera pulls back to reveal the full stage
  const settleT = start + 3.2;
  camera(tl, settleT, { col: CENTER, row: CENTER, zoom: 1.25, dur: 2.2 });

  const home = at(CENTER, CENTER);
  tl.to(home.el, { scale: 1.3, duration: 1.6, yoyo: true, repeat: 2, ease: 'sine.inOut' }, settleT);

  // Peace floods outward from center across concentric rings
  const floodStart = settleT + 0.4;
  everyDot((d) => {
    if (d.col === CENTER && d.row === CENTER) return;
    const t = floodStart + d.ring * peaceSpread;
    tl.call(() => d.el.style.setProperty('--dot-color', COLORS.peace(d.ring)), [], t);
    tl.to(d.el, { opacity: 0.72, scale: 1, duration: 1.2, ease: 'sine.inOut' }, t);
  });

  // The Amen cadence, twice (IV - I)
  [0, chordGap].forEach((offset) => {
    score(tl, settleT + 0.6 + offset, () => note(PITCH.F4, { dur: 2.0, vol: 0.09, type: 'triangle', attack: 0.03 }));
    score(tl, settleT + 0.6 + offset + 0.05, () => note(PITCH.C4, { dur: 2.0, vol: 0.07, type: 'triangle', attack: 0.03 }));
    score(tl, settleT + 0.6 + offset + chordGap / 2, () => note(PITCH.C4, { dur: 2.6, vol: 0.11, type: 'triangle', attack: 0.03 }));
  });

  // Where she was at (5, 4), a tender rose memory light remains
  const mem = at(memoryCell[0], memoryCell[1]);
  tl.call(() => mem.el.style.setProperty('--dot-color', COLORS.memory), [], settleT + 1.2);
  tl.to(mem.el, { opacity: 0.85, scale: 1.15, duration: 1.0, ease: 'sine.inOut' }, settleT + 1.2);
}

// ACT VII — DEATH & THE "FAT LADY" ARIA:
// Dying heartbeats, the beloved's ghost halo re-ignites,
// soaring high soprano aria (G4 -> A4 -> C5), final dissolve.
function actDeath(tl, hero) {
  const { start, noteEvery } = CONFIG.acts.death;
  const deathTime = makeDeathMap();
  const heroCell = at(hero.col, hero.row);

  // Slow push-in framing both hero (4, 4) and beloved ghost cell (5, 4)
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
      score(tl, t, () => note(semitone(PITCH.C3, semi), { dur: 1.0, vol: 0.045, pan: panAt(d.col) }));
    }
  });

  // The last light: hero cools to a solitary amber ember
  const maxDeath = start + Math.max(...order.map(deathTime));
  const emberAt = maxDeath + 0.6;
  tl.call(() => {
    heroCell.el.style.setProperty('--dot-color', COLORS.lastEmber);
  }, [], emberAt);
  tl.to(heroCell.el, { opacity: 0.9, scale: 0.95, duration: 0.8, ease: 'power2.out' }, emberAt);

  // 1. Slow, heavy heartbeat at 48 BPM: 68 Hz -> 28 Hz plunge
  score(tl, emberAt + 0.6, () => thump(0.28, { startF: 68, endF: 28, dur: 0.22, noise: false }));
  tl.to(heroCell.el, { scale: 1.1, duration: 0.18 }, emberAt + 0.6).to(
    heroCell.el,
    { scale: 0.9, duration: 0.6 },
    emberAt + 0.78
  );

  // Hero starts motif... and stops mid-phrase
  score(tl, emberAt + 0.6, () => note(MOTIF.hero[0], { dur: 0.8, vol: 0.10, voice: 'tenor' }));

  // 2. THE "FAT LADY" SINGS (The Beloved's Ghost Re-ignites at 5, 4):
  // Pure rose light with deep expansive bloom (NO white core!)
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

  // Climactic Soprano Aria: G4 -> A4 -> High C5 (523.25 Hz) with swelling operatic vibrato!
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
  score(tl, finalBeatAt + 1.2, () => note(PITCH.E4, { dur: 1.2, vol: 0.10, pan: 0.3, voice: 'soprano', vibrato: true }));

  // 4. Silence: Her celestial star and his amber ember dissolve together into eternity
  const fadeAt = finalBeatAt + 2.4;
  tl.to(heroCell.el, { opacity: 0, scale: 0.1, duration: 3.2, ease: 'power2.in' }, fadeAt);
  tl.to(ghostCell.el, { opacity: 0, scale: 0.1, duration: 3.2, ease: 'power2.in' }, fadeAt);
  tl.call(() => ghostCell.el.classList.remove('ghost-aria'), [], fadeAt + 3.2);

  // Subterranean C1 organ pedal fading into eternity
  score(tl, fadeAt, () => {
    note(PITCH.C2, { dur: 3.6, vol: 0.11 });
    note(PITCH.C2 / 2, { dur: 4.8, vol: 0.08, type: 'sine' }); // 32.7 Hz C1 pedal
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
  titleEl.style.fontSize = '100px';
  const byWidth = 100 * (innerWidth * 0.96) / technoSpan.offsetWidth;
  const byHeight = (innerHeight - 92) / (3 * 0.82);
  titleEl.style.fontSize = Math.min(byWidth, byHeight) + 'px';
}

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
  // Restart from frame 0 with sound!
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

  // Restart silent ambient playback behind the title!
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

replayBtn.addEventListener('click', replay);

// Invalidate cached cell size on resize and fit title
window.addEventListener('resize', () => {
  _cell = 0;
  fitTitle();
});

