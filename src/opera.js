// 15KB TECHNO OPERA
// Sixty seconds of Silicon Valley on a 9x9 grid of dots.
// No libraries: a scheduler, CSS transitions, and a Web Audio synth.

const G = 9, C = 4;
const W = document.getElementById('w'), grid = document.getElementById('g');
const rnd = Math.random, rint = (n) => (rnd() * n) | 0;

// ---------- STAGE ----------
const dots = [];
for (let r = 0; r < G; r++)
  for (let c = 0; c < G; c++) {
    const el = document.createElement('i');
    grid.appendChild(el);
    dots.push({ el, c, r, ring: Math.max(Math.abs(c - C), Math.abs(r - C)), s: 0, o: 0, x: 0, y: 0, col: '#000' });
  }
const at = (c, r) => dots[r * G + c];
const each = (f) => dots.forEach(f);

// Move a dot: colour, scale, opacity, translate in cell units. One CSS transition per call.
function dot(d, p, dur = 0.6, e = 'ease') {
  const s = d.el.style;
  s.transition = `all ${dur}s ${e}`;
  if (p.c != null) s.setProperty('--c', (d.col = p.c));
  if (p.o != null) s.opacity = d.o = p.o;
  if (p.s != null) d.s = p.s;
  if (p.x != null) d.x = p.x;
  if (p.y != null) d.y = p.y;
  s.transform = `translate(calc(${d.x}*var(--cs)),calc(${d.y}*var(--cs))) scale(${d.s})`;
}
const off = (d, dur = 0.6) => dot(d, { o: 0, s: 0 }, dur);

// Camera: frame cell (c,r) at zoom z.
function cam(c, r, z, dur = 1.2, e = 'ease') {
  W.style.transition = `transform ${dur}s ${e}`;
  W.style.transform = `scale(${z}) translate(calc(${C - c}*var(--cs)),calc(${C - r}*var(--cs)))`;
}

// Glyphs: 81 chars, '#' is lit. A 9x9 grid can draw a heart.
const glyph = (s) => dots.filter((d, i) => s[i] == '#');
const HEART = glyph('..........##...##.##################.#######...#####.....###.......#.............');

// Shift the whole grid's state by one row/col (LED-matrix scroll).
function shift(dx, dy, fill) {
  const st = dots.map((d) => ({ col: d.col, o: d.o, s: d.s }));
  each((d) => {
    const src = at((d.c + dx + G) % G, (d.r + dy + G) % G);
    const wrap = (dx && (dx > 0 ? d.c == G - 1 : d.c == 0)) || (dy && (dy > 0 ? d.r == G - 1 : d.r == 0));
    const p = wrap ? fill(d) : st[src.r * G + src.c];
    d.el.style.transition = 'none';
    d.el.style.setProperty('--c', (d.col = p.col));
    d.el.style.opacity = d.o = p.o;
    d.s = p.s;
    d.el.style.transform = `scale(${d.s})`;
  });
}
// Glide the grid one cell then snap back with content shifted: looks endless.
function scroll(t, dx, dy, dur, fill) {
  T(t, () => {
    grid.style.transition = `transform ${dur}s cubic-bezier(.4,0,.2,1)`;
    grid.style.transform = `translate(calc(${-dx}*var(--cs)),calc(${-dy}*var(--cs)))`;
  });
  T(t + dur, () => {
    grid.style.transition = 'none';
    grid.style.transform = 'none';
    shift(dx, dy, fill);
  });
}

// ---------- SCHEDULER ----------
let ev = [], t0, raf, tmo;
const T = (t, f) => ev.push([t, f]);
function run() {
  ev.sort((a, b) => a[0] - b[0]);
  let i = 0;
  t0 = performance.now();
  const tick = (n) => {
    const e = (n - t0) / 1e3;
    while (i < ev.length && ev[i][0] <= e) ev[i++][1]();
    if (i < ev.length) raf = requestAnimationFrame(tick);
    else tmo = setTimeout(build, 1500);
  };
  raf = requestAnimationFrame(tick);
}

// ---------- SYNTH ----------
let ac, master, room, dL, dR, noise, mute = true;
function audio() {
  if (!ac) {
    ac = new AudioContext();
    master = ac.createGain();
    master.gain.value = 0.85;
    master.connect(ac.destination);
    // one warm hall: cross-fed stereo delay through a lowpass
    room = ac.createBiquadFilter();
    room.frequency.value = 1800;
    dL = ac.createDelay();
    dR = ac.createDelay();
    dL.delayTime.value = 0.28;
    dR.delayTime.value = 0.38;
    const m = ac.createChannelMerger(2), sp = ac.createChannelSplitter(2), fb = ac.createGain();
    fb.gain.value = 0.34;
    dL.connect(m, 0, 0);
    dR.connect(m, 0, 1);
    m.connect(room);
    room.connect(master);
    room.connect(sp);
    sp.connect(fb, 0);
    fb.connect(dR);
    sp.connect(fb, 1);
    fb.connect(dL);
    noise = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
    const b = noise.getChannelData(0);
    for (let i = 0; i < b.length; i++) b[i] = rnd() * 2 - 1;
  }
  if (ac.state == 'suspended') ac.resume();
}
const out = (g, pan, send) => {
  const p = ac.createStereoPanner();
  p.pan.value = pan;
  g.connect(p);
  p.connect(master);
  if (send) {
    const s = ac.createGain();
    s.gain.value = send;
    p.connect(s);
    s.connect(dL);
    s.connect(dR);
  }
};

// A voice. type 'sop' is a soprano (fifth overtone, vibrato), else tenor (detuned pair, cello sub).
function note(f, { dur = 0.5, vol = 0.12, pan = 0, o = 0, sop = 0, vib = 0, grit = 0, att = 0.02, type = 'sine', send = 0.45 } = {}) {
  if (mute) return;
  const t = ac.currentTime + o, g = ac.createGain();
  g.gain.setValueAtTime(1e-4, t);
  g.gain.linearRampToValueAtTime(vol, t + att);
  g.gain.exponentialRampToValueAtTime(8e-4, t + dur);
  out(g, pan, send);
  const parts = sop
    ? [[1, 'sine', 0.7, 0], [1.5, 'triangle', 0.18, 2], [0.5, 'sine', 0.08, 0]]
    : [[1, type, 0.55, -3.5], [1, type, 0.55, 3.5], [0.5, 'sine', 0.2, 0], [1.5, 'sine', 0.1, 0]];
  if (grit) parts.push([1, 'sawtooth', grit, 0]);
  let vg;
  if (vib && dur > 0.5) {
    const l = ac.createOscillator();
    l.frequency.value = 4.8;
    vg = ac.createGain();
    vg.gain.setValueAtTime(0, t);
    vg.gain.setValueAtTime(0, t + 0.25);
    vg.gain.linearRampToValueAtTime(vib, t + 0.75);
    l.connect(vg);
    l.start(t);
    l.stop(t + dur + 0.2);
  }
  for (const [m, ty, lv, dt] of parts) {
    const os = ac.createOscillator(), pg = ac.createGain();
    os.type = ty;
    os.frequency.value = f * m;
    os.detune.value = dt;
    if (vg) vg.connect(os.frequency);
    pg.gain.value = lv;
    os.connect(pg);
    pg.connect(g);
    os.start(t);
    os.stop(t + dur + 0.2);
  }
}
// Several singers on one pitch, spread across the stage.
const chorus = (f, n, p = {}) => {
  for (let i = 0; i < n; i++) note(f * (1 + (rnd() - 0.5) * 0.006), { ...p, pan: (i / (n - 1 || 1)) * 2 - 1, sop: i % 2 });
};
// Pitch plunge plus filtered noise. Heartbeat at rest, kick drum at 120.
function thump(vol = 0.35, a = 82, b = 36, dur = 0.16, hiss = 110, o = 0) {
  if (mute) return;
  const t = ac.currentTime + o, os = ac.createOscillator(), g = ac.createGain();
  os.frequency.setValueAtTime(a, t);
  os.frequency.exponentialRampToValueAtTime(b, t + dur * 0.75);
  g.gain.setValueAtTime(1e-3, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.008);
  g.gain.exponentialRampToValueAtTime(1e-3, t + dur);
  os.connect(g);
  g.connect(master);
  os.start(t);
  os.stop(t + dur + 0.02);
  if (hiss) hush(vol * 0.4, hiss, dur * 0.5, o);
}
// A burst of filtered noise.
function hush(vol, freq, dur, o = 0, type = 'lowpass', q = 1, to = 0) {
  if (mute) return;
  const t = ac.currentTime + o, n = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
  n.buffer = noise;
  f.type = type;
  f.frequency.setValueAtTime(freq, t);
  if (to) f.frequency.exponentialRampToValueAtTime(to, t + dur);
  f.Q.value = q;
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(1e-3, t + dur);
  n.connect(f);
  f.connect(g);
  g.connect(master);
  n.start(t);
  n.stop(t + dur);
}
// Plain tone for the modem.
const roomTo = (f, k = 1) => room && room.frequency.setTargetAtTime(f, ac.currentTime, k);
const kick = (o = 0, vol = 0.5) => thump(vol, 150, 42, 0.22, 90, o);
const hz = (root, semi) => root * 2 ** (semi / 12);
const C3 = 130.81, C4 = 261.63;
const PENTA = [0, 2, 4, 7, 9];

// ---------- PALETTE ----------
// Rule: every colour is light. Saturation 100%, lightness 50-70%.
// Dimness is opacity or scale, never a darker or greyer paint.
const PHOS = 'hsl(120,100%,60%)'; // phosphor
const FOUR = ['hsl(217,100%,60%)', 'hsl(4,100%,60%)', 'hsl(45,100%,55%)', 'hsl(145,100%,45%)'];
const BLUE = 'hsl(214,100%,55%)';
const LIKE = 'hsl(350,100%,72%)';
const BADGE = 'hsl(0,100%,58%)';
const WHITE = 'hsl(0,0%,100%)';
const EMBER = 'hsl(24,100%,55%)';
const GOLD = 'hsl(46,100%,56%)';

// ---------- THE OPERA ----------
// 1. DIAL-UP (0-6): raster scan. modem handshake.
function dialup(s) {
  T(s, () => {
    cam(C, C, 1, 0.01);
    roomTo(1800, 0.1);
    note(C3 / 2, { dur: 5.5, vol: 0.1, att: 1.5, send: 0.6 });
    note(hz(C3, 7), { dur: 5, vol: 0.04, att: 2, o: 0.5, sop: 1, vib: 2 });
    hush(0.05, 200, 4.5, 0.3, 'bandpass', 2, 3000);
  });
  each((d) => {
    const t = s + 2.4 + d.r * 0.36 + d.c * 0.012;
    T(t, () => {
      dot(d, { c: WHITE, o: 1, s: 0.9 }, 0.05);
      d.c == 0 && hush(0.05, 3000, 0.04, 0, 'highpass');
    });
    T(t + 0.12, () => dot(d, { c: PHOS, o: 0.85, s: rnd() < 0.12 ? 0.75 : 0.4 }, 0.5));
  });
  T(s + 5.6, () => {
    each((d) => dot(d, { o: 0, s: 0.3 }, 0.4));
    hush(0.1, 400, 0.3);
  });
}

// 2. FOUR DOTS (6-12): they bounce, then they rank everything.
function fourdots(s) {
  const four = [3, 4, 5, 6].map((c) => at(c, C));
  T(s, () => cam(4.5, C, 1.9, 1.4));
  four.forEach((d, i) => {
    T(s + 0.2 + i * 0.12, () => {
      dot(d, { c: FOUR[i], o: 1, s: 1 }, 0.4, 'cubic-bezier(.34,1.56,.64,1)');
      note(hz(C4, [0, 4, 7, 12][i]), { dur: 1.2, vol: 0.06, pan: (i - 1.5) / 2, sop: 1, att: 0.05 });
    });
    for (let b = 0; b < 4; b++) {
      const t = s + 1 + b * 0.55 + i * 0.09;
      T(t, () => dot(d, { s: 1.35, y: -0.35 }, 0.18, 'ease-out'));
      T(t + 0.18, () => dot(d, { s: 1, y: 0 }, 0.3, 'cubic-bezier(.34,1.56,.64,1)'));
    }
  });
  T(s + 3.3, () => {
    cam(C, C, 1.05, 2.2);
    note(C3, { dur: 2.6, vol: 0.14, att: 0.05 });
  });
  // the four claim the world: every dot ranked, brightest at the top
  each((d) => {
    const i = (d.c + d.r) % 4;
    const t = s + 3.5 + d.r * 0.22 + rnd() * 0.15;
    T(t, () => dot(d, { c: FOUR[i], o: 0.9, s: 1 - d.r * 0.085 }, 0.7, 'cubic-bezier(.34,1.56,.64,1)'));
  });
  [0, 4, 7, 12, 16].forEach((semi, i) => T(s + 3.6 + i * 0.4, () => note(hz(C3, semi), { dur: 1.8, vol: 0.1, type: 'triangle', pan: (i - 2) / 3 })));
}

// 4. CONTAGION (15-23): blue spreads like a friend request. a heart. notifications.
function contagion(s) {
  const dist = dots.map((d) => Math.abs(d.c - C) + Math.abs(d.r - C));
  T(s, () => {
    cam(C, C, 1.3, 1.8);
    roomTo(1400);
  });
  each((d, i) => {
    const t = s + 0.3 + dist[i] * 0.42 + rnd() * 0.3;
    T(t, () => {
      dot(d, { c: BLUE, o: 0.75, s: 0.95 }, 0.5, 'cubic-bezier(.34,1.56,.64,1)');
      if (rnd() < 0.3) note(hz(C4, PENTA[rint(5)]), { dur: 0.5, vol: 0.05, pan: (d.c - C) / C, sop: 1 });
    });
  });
  T(s + 0.3, () => chorus(C3, 3, { dur: 4, vol: 0.06, att: 0.5 }));
  T(s + 2, () => chorus(hz(C3, 7), 3, { dur: 3.5, vol: 0.06, att: 0.5 }));
  // the heart
  const beats = [4.2, 4.9, 5.7, 6.3, 6.9, 7.3];
  beats.forEach((b, i) => {
    T(s + b, () => {
      HEART.forEach((d) => dot(d, { c: 'hsl(340,100%,82%)', o: 1, s: 1.2 }, 0.12, 'ease-out'));
      dots.filter((d) => !HEART.includes(d)).forEach((d) => dot(d, { o: 0.3 }, 0.12));
      thump(0.28, 90, 40, 0.14, 0);
      note(hz(C4, [4, 7, 9, 12, 14, 16][i]), { dur: 0.5, vol: 0.08, sop: 1 });
    });
    T(s + b + 0.25, () => each((d) => dot(d, { c: BLUE, o: 0.75, s: 0.95 }, 0.6)));
  });
  // notifications, accelerating
  for (let t = 4, i = 0; t < 8; t += Math.max(0.09, 0.55 - i * 0.045), i++) {
    const d = dots[rint(81)];
    T(s + t, () => {
      dot(d, { c: BADGE, o: 1, s: 1.4 }, 0.06);
      note(hz(C4, 12 + PENTA[rint(5)]), { dur: 0.15, vol: 0.06, pan: (d.c - C) / C, att: 0.005 });
    });
    T(s + t + 0.12, () => dot(d, { c: BLUE, o: 0.75, s: 0.95 }, 0.35));
  }
}

// 5. SCROLL (23-30): the feed never ends. the heartbeat becomes a kick.
function feed(s) {
  const post = () => (rnd() < 0.15 ? { col: LIKE, o: 1, s: 1.15 } : rnd() < 0.1 ? { col: BADGE, o: 1, s: 0.9 } : { col: BLUE, o: 0.8, s: 0.35 + rnd() * 0.6 });
  T(s, () => cam(C, C, 1.15, 2));
  const beat = 0.5;
  for (let b = 0; b < 14; b++) {
    const t = s + b * beat;
    scroll(t, 0, 1, 0.42, post);
    T(t, () => {
      kick(0, 0.35 + b * 0.015);
      each((d) => dot(d, { s: d.s * 1.12 }, 0.08, 'ease-out'));
    });
    T(t + 0.1, () => each((d) => dot(d, { s: d.s / 1.12 }, 0.3)));
    if (b % 2 == 0) T(t, () => note(hz(C3, [0, 0, 7, 5][(b / 2) % 4]), { dur: 0.9, vol: 0.1, type: 'triangle' }));
  }
  T(s + 1, () => chorus(hz(C4, 4), 4, { dur: 5.5, vol: 0.05, att: 1, vib: 3 }));
}

// 7. THE SCRAPE (27-35): every light in the world goes out, ring by ring, and the centre takes it.
function scrape(s) {
  const hues = [214, 4, 45, 145, 285, 350, 190, 60];
  T(s, () => {
    cam(C, C, 1, 1.5);
    roomTo(2400, 2);
    each((d) => dot(d, { c: `hsl(${hues[rint(8)]},100%,58%)`, o: 0.8, s: 0.8 }, 1.2));
  });
  T(s + 0.5, () => chorus(C3, 5, { dur: 7.5, vol: 0.05, att: 1.5, vib: 2 }));
  const centre = at(C, C);
  each((d) => {
    if (d == centre) return;
    const t = s + 1.6 + (4 - d.ring) * 1.1 + rnd() * 0.6;
    T(t, () => dot(d, { o: 1, s: 1 }, 0.15));
    T(t + 0.15, () => {
      dot(d, { o: 0, s: 0.2 }, 0.8, 'ease-in');
      if (rnd() < 0.4) note(hz(C4, PENTA[rint(5)] + [0, 0, 12, 12, 24][d.ring]), { dur: 1.6, vol: 0.04, pan: (d.c - C) / C, sop: d.ring % 2, send: 0.7 });
    });
  });
  [1.6, 2.7, 3.8, 4.9, 6].forEach((t, i) => {
    T(s + t, () => {
      dot(centre, { c: `hsl(45,100%,${58 + i * 8}%)`, o: 1, s: 1 + i * 0.28 }, 1.6);
      cam(C, C, 1 + i * 0.18, 1.6);
    });
  });
  T(s + 6.4, () => {
    dot(centre, { c: WHITE, s: 2 }, 1.4);
    chorus(hz(C4, 12), 6, { dur: 3, vol: 0.06, att: 0.4, vib: 5, send: 0.8 });
    note(C3 / 2, { dur: 3, vol: 0.12, att: 0.3 });
  });
}

// 8. THE BUBBLE (44-52): the model gives it all back, and it is all the same.
// One overexposed light, alone, inflating. sparks around it. everyone on one note.
function slop(s) {
  const centre = at(C, C);
  T(s, () => {
    cam(C, C, 1, 3);
    roomTo(900, 1.5);
  });
  // 140 bpm, chromatic climb, and the light grows a little every beat
  const beat = 60 / 140;
  for (let b = 0; b < 17; b++) {
    const t = s + 0.4 + b * beat;
    T(t, () => {
      kick(0, 0.5);
      dot(centre, { c: WHITE, o: 1, s: 2.2 + b * 0.32 }, beat, 'ease-out');
      const f = hz(C4, 12 + b);
      note(f, { dur: 0.4, vol: 0.06, att: 0.005, type: 'triangle' });
      if (b % 4 == 0) chorus(f / 2, 4, { dur: 1.8, vol: 0.05, att: 0.02 });
    });
  }
  // hallucinations: single spectral sparks in the dark around it
  for (let t = 1.5; t < 7.4; t += 0.05 + rnd() * 0.2) {
    const d = dots[rint(81)], h = rint(360);
    if (d.ring < 2) continue;
    T(s + t, () => {
      dot(d, { c: `hsl(${h},100%,60%)`, o: 1, s: 0.9 }, 0.03);
      hush(0.04, 2000 + rint(4000), 0.05, 0, 'bandpass', 8);
    });
    T(s + t + 0.09, () => dot(d, { o: 0, s: 0.3 }, 0.3));
  }
  T(s + 6, () => {
    hush(0.15, 300, 2, 0, 'lowpass');
    note(hz(C4, 30), { dur: 2, vol: 0.09, sop: 1, vib: 7, att: 0.6 });
  });
}

// 9. POP (52-57): one kick. nothing. the lights go out from the edges in.
function pop(s) {
  T(s, () => {
    kick(0, 0.9);
    hush(0.3, 8000, 0.25, 0, 'highpass');
    dot(at(C, C), { o: 0, s: 0.2 }, 0.06);
    cam(C, C, 1, 0.1);
  });
  each((d) => {
    const t = s + 0.5 + (4 - d.ring) * 0.35 + rnd() * 0.5;
    T(t, () => {
      dot(d, { o: 0, s: 0.1 }, 0.9, 'ease-in');
      if (rnd() < 0.2) note(hz(C3, PENTA[rint(5)] - 12 * (d.ring % 2)), { dur: 1.2, vol: 0.035, pan: (d.c - C) / C });
    });
  });
  T(s + 3.2, () => note(C3 / 4, { dur: 4, vol: 0.14, att: 0.5 }));
}

// 10. AFTER (57-60): two warm dots remain. a new one is born, one cell to the left.
function after(s) {
  const a = at(6, 6), b = at(2, 3), born = at(3, 4);
  T(s, () => {
    cam(3.5, 4.5, 1.5, 3);
    [a, b].forEach((d) => dot(d, { c: EMBER, o: 0.6, s: 0.5 }, 1.5));
    note(hz(C4, 7), { dur: 2.5, vol: 0.08, sop: 1, vib: 4, att: 0.3 });
  });
  T(s + 1.8, () => {
    dot(born, { c: GOLD, o: 1, s: 1 }, 0.8, 'cubic-bezier(.34,1.56,.64,1)');
    thump(0.4);
    note(C3, { dur: 1.5, vol: 0.1 });
  });
  T(s + 2.4, () => thump(0.3));
  T(s + 3, () => {});
}

function build() {
  cancelAnimationFrame(raf);
  clearTimeout(tmo);
  ev = [];
  grid.style.transition = 'none';
  grid.style.transform = 'none';
  each((d) => {
    d.el.style.transition = 'none';
    d.x = d.y = 0;
    dot(d, { c: '#000', o: 0, s: 0 }, 0);
  });
  cam(C, C, 1, 0);
  dialup(0);
  fourdots(6);
  contagion(12);
  feed(20);
  scrape(27);
  slop(35);
  pop(43);
  after(48);
  run();
}

// ---------- TITLE & CONTROLS ----------
const title = document.querySelector('.t'), play = document.getElementById('p');
function fit() {
  title.style.fontSize = '100px';
  const w = (100 * innerWidth * 0.96) / title.children[1].offsetWidth, h = (innerHeight - 92) / 2.46;
  title.style.fontSize = Math.min(w, h) + 'px';
}
fit();
if (!matchMedia('(prefers-reduced-motion:reduce)').matches)
  [...title.children].forEach((s, i) =>
    s.animate({ clipPath: ['inset(0 100% 0 0)', 'inset(0 0 0 0)'] }, { duration: 420, delay: 200 + i * 260, easing: `steps(${s.textContent.length})`, fill: 'backwards' })
  );
addEventListener('resize', fit);

function start() {
  mute = false;
  audio();
  master.gain.cancelScheduledValues(ac.currentTime);
  master.gain.setValueAtTime(0.85, ac.currentTime);
  document.body.classList.add('playing');
  play.textContent = 'Pause';
  build();
}
function stop() {
  mute = true;
  document.body.classList.remove('playing');
  play.textContent = 'Play';
  if (ac) master.gain.linearRampToValueAtTime(1e-4, ac.currentTime + 0.2);
  build();
}
play.onclick = (e) => {
  e.preventDefault();
  mute ? start() : stop();
};
addEventListener('click', (e) => {
  if (!e.target.closest('a') && mute) start();
});
addEventListener('keydown', (e) => e.key == ' ' && (mute ? start() : stop()));

build(); // silent, behind the title
