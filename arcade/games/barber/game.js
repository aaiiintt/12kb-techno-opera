/* IL BARBIERE DI SIVIGLIA: five games, six scenes and a toy, about two minutes.
   Rossini, 1816. C major (Una voce in its own E major), and it only gets faster.
   Almaviva in sky blue, Rosina in rose, Bartolo in the white wig and the snuff-brown
   coat, Figaro in the striped apron; Seville from dawn to a stormy midnight. A farce:
   losing is the slapstick version of the same beat and the plot marches on. The story is
   told in WATCH beats (letterbox, a typed caption); each game has one job, and input is
   tap or drag only: tap on the beat (SERENADE), drag the letter (SLIP), tap the glowing
   arrow (STAGGER), tap the gold key (TUNE), lather (the toy, drag), tap tap tap (WED).
   Both outcomes of a game end on one tableau; the second caption line states the same fact.
   Tunes: Ecco ridente, Una voce poco fa and the Largo al factotum are checked
   (docs/MUSIC.md); the march, the scale, the storm and the run are filler in the key. */

'use strict';

const SP = {};
const COL = {
  bg: '#120c1c', ink: '#fbead0', dim: '#9a88a8', card: '#fbead0', cardInk: '#120c1c',
  bravo: '#ffd23a', tragic: '#ff5a64', fuse: '#fbead0',
  wall: '#1f1630', wall2: '#281d3c', floor: '#2f2242', line: '#54406c', night: '#0c0a1e',
  gold: '#ffd23a', glow: '#ffc861', crimson: '#c8303e', cream: '#fbead0', rose: '#f58cb0', sky: '#5aa9e6',
  skin: '#f1c9a5', hair: '#4a2a1c', eye: '#1a1020', coat: '#b0662e', slate: '#7a8aaa', white: '#ffffff',
  green: '#5fbf6a', wood: '#8a5a34', woodD: '#4e3222', foam: '#ffffff', boot: '#2a1a14', stone: '#33243c',
};
const c = PX.c;
PX.SCALE = 2;
const GROUND = MG.GROUND;
const OUT = MG.phase.OUTCOME, ACTION = MG.phase.ACTION;
const out = (m) => m.phase === OUT;
const say = (t, x, y, col = COL.ink) => MG.say(t, x, y, col, COL.eye);
const sing = MG.sing;
const ease = (t) => clamp(t, 0, 1);
const LX = 158, RX = 192, BY = GROUND + 34;   // the ladder's foot, Rosina's window, the balcony floor

function barberSprites() {
  setGravity(vec2(0, -0.04));      // confetti falls, bubbles (negative gravity scale) rise
  const body = (h, f, b, l, e = COL.eye) => CAST.body({ h, f, b, l, e });
  SP.almaviva = body(COL.hair, COL.skin, COL.sky, COL.boot);
  SP.soldier = body(COL.crimson, COL.skin, COL.crimson, COL.boot);            // the drunk soldier
  SP.alonzo = body('#1c1830', COL.skin, '#2a2440', '#2a2440', '#e8f0ff');     // Don Alonso: black gown, white spectacles
  SP.mus1 = body('#3a2a1c', COL.skin, '#8a4a8a', COL.boot);
  SP.mus2 = body(COL.crimson, COL.skin, '#5a8a6a', COL.boot);
  SP.notary = body('#14101c', COL.skin, '#2a2a3a', COL.boot);
  SP.figaro = CAST.body({ h: COL.hair, f: COL.skin, b: COL.green, s: COL.cream, g: COL.green, l: COL.wood, e: COL.eye }, ['.sgsg.', 'sgsgsg', 'f.gs.f', '..sg..']);
  SP.bartolo = body(COL.white, COL.skin, COL.coat, COL.boot);                 // white wig
  SP.bartoloDark = body('#0a0812', '#0a0812', '#0a0812', '#0a0812', '#0a0812');
  SP.rosina = CAST.dress({ h: COL.hair, f: COL.skin, r: COL.rose, e: COL.eye, l: COL.boot });
  SP.rosinaBack = CAST.dress({ h: COL.hair, f: COL.hair, r: COL.rose, e: COL.hair, m: COL.hair, l: COL.boot });
  SP.face = PX.sprite([
    '..wwwwwwww..', '.wwwwwwwwww.', 'wwffffffffww', 'wwffffffffww', '.fffffffffff', '.ffeffffeff.', '.ffffffffff.', '.fffffffffff', '..ffmmmmff..', '...ffffff...', '....ffff....',
  ], { w: COL.white, f: COL.skin, e: COL.eye, m: COL.crimson });
  SP.guitar = PX.sprite(['....bb', '...bb.', '..bb..', 'wwbb..', 'wwww..', '.ww...'], { b: COL.woodD, w: COL.wood });
  SP.note = PX.sprite(['..nn.', '..n.n', '..n..', 'nnn..', 'nnn..'], { n: COL.white });
  SP.heart = PX.sprite(['.r.r.', 'rrrrr', 'rrrrr', '.rrr.', '..r..'], { r: COL.white });
  SP.star = PX.sprite(['..w..', '..w..', 'wwwww', '..w..', '..w..'], { w: COL.white });
  SP.bubble = PX.sprite(['.www.', 'w..ww', 'w...w', 'w...w', '.www.'], { w: COL.white });
  SP.letter = PX.sprite(['dwwwwwwd', 'wdwwwwdw', 'wwdwwdww', 'wwwrrwww', 'wwwwwwww', 'wwwwwwww'], { w: COL.cream, d: '#b8a088', r: COL.crimson });
  SP.arrow = PX.sprite(['..w...', '.ww...', 'wwwwww', 'wwwwww', '.ww...', '..w...'], { w: COL.white });
  SP.billet = PX.sprite(['ggggggg', 'g.....g', 'g.ggg.g', 'g.....g', 'ggggggg'], { g: COL.gold });
  SP.paper = PX.sprite(['wwwwwwwww', 'wllwlllww', 'wwwwwwwww', 'wlllwllww', 'wwwwwwwww', 'wllwlllww', 'wwwwwwwww'], { w: COL.cream, l: '#8a7a70' });
  SP.foam = PX.sprite(['.ww.', 'wwww', 'wwww', '.ww.'], { w: COL.foam });
  SP.brush = PX.sprite(['.ddd.', 'dwwwd', 'dwwwd', '.ddd.', '..b..', '..b..', '..b..'], { w: COL.foam, d: COL.woodD, b: COL.wood });
  SP.hand = PX.sprite(['sss', 'sss'], { s: COL.skin });
  SP.key = PX.sprite(['.kk.....', 'k..kkkkk', '.kk..k.k'], { k: COL.gold });
  SP.bottle = PX.sprite(['.g.', '.g.', 'ggg', 'ggg', 'ggg'], { g: COL.green });
  SP.sign = PX.sprite(['.gggg.', 'gggggg', 'gggggg', '.gggg.', '..w...', '..w...', '..w...'], { g: COL.gold, w: COL.wood });
  SP.book = PX.sprite(['wwww', 'wddw', 'wwww'], { w: COL.cream, d: '#8a7a70' });
  SP.ladder = PX.sprite(Array.from({ length: 24 }, (_, i) => i % 3 === 1 ? 'wwwwww' : 'w....w'), { w: COL.wood });
  SP.zz = PX.sprite(['www', '..w', '.w.', 'w..', 'www'], { w: COL.white });
}

// ---- feeling per byte: particles, a shake, a flash, a sting ----
// a burst of n pixel squares (or a sprite, o.tile) from x, y in colours a and b; o.g < 0 floats up
const fx = (x, y, a, b, n, o = {}) => new ParticleEmitter(vec2(x, y), o.ang || 0, o.w ?? 4, o.time ?? 0.1, n / (o.time ?? 0.1), o.cone ?? PI,
  o.tile?.tile, c(a), c(b), c(a, 0), c(b, 0), o.life ?? 1.2, o.s ?? 3, o.e ?? 2, o.v ?? 1.5, 0, o.damp ?? 0.93, 1, o.g ?? 1, 0, 0.2, 0.4);
const confetti = (x, y, n = 60) => { fx(x, y, COL.gold, COL.rose, n / 2, { v: 2.2, cone: 0.9, life: 2 }); fx(x, y, COL.sky, COL.white, n / 2, { v: 2.2, cone: 0.9, life: 2 }); };
const hearts = (x, y, n = 8) => fx(x, y, COL.rose, COL.crimson, n, { tile: SP.heart, s: 6, e: 5, v: 0.6, g: -0.4, life: 1.6, w: 10 });
const starburst = (x, y) => fx(x, y, COL.gold, COL.white, 10, { tile: SP.star, s: 5, e: 3, v: 1.2, g: 0, life: 0.7 });
const bubbles = (x, y, n = 10, w = 16) => fx(x, y, COL.white, COL.sky, n, { tile: SP.bubble, s: 5, e: 7, v: 0.5, g: -0.5, life: 2, damp: 0.96, w });
const noteUp = (x, y, a = COL.gold, b = COL.glow) => fx(x, y, a, b, 1, { tile: SP.note, s: 7, e: 5, v: 0.5, ang: 0.3, cone: 0.5, g: -0.2, life: 1.1, w: 2 });

// hit sounds: a chime on a chord tone, a bright rising run for a win, a low drop for a loss
const CHIME = ['1', '3', '5', '1+', '3+', '5+', '1++'];
const chime = (i, vol = 0.05) => S.voice('pulse', S.deg(CHIME[i % 7]) + 12, S.now(), 0.12, { vol });
const winSting = (t) => { CHIME.slice(0, 6).forEach((d, i) => S.voice('pulse', S.deg(d) + 12, t + i * 0.045, 0.1, { vol: 0.05 })); S.drum('hat', t, 0.14); };
const loseSting = (t) => { S.drum('kick', t, 0.3); S.voice('bass', S.deg('3'), t, 0.12, { vol: 0.16 }); S.voice('bass', S.deg('1') - 1, t + 0.13, 0.7, { vol: 0.18, grit: true }); };
// the verdict, in the first frames of the outcome: a flash and a rising sting, or a dark thud and a low one
const verdict = (m) => { const t = m.v0 = S.now(); if (m.act.toy) S.arp('III', 1.2, 20, t, { vol: 0.05, octave: 1 }); else if (m.won) winSting(t); else loseSting(t); };
const verdictDraw = (m) => {
  const k = Math.min(1, 1 - (S.now() - m.v0) / 0.35);
  if (k > 0 && !m.act.toy) PX.rect(0, 0, PX.W, PX.H, m.won ? c(COL.white, 0.8 * k) : c('#000000', 0.55 * k));
};
const shake = (m) => {
  if (out(m) && !m.won && m.v0 && S.now() - m.v0 < 0.4) setCameraPos(cameraPos.add(vec2(randInt(-2, 3), randInt(-2, 3))));
  if (m.sh > 0) { m.sh -= timeDelta * 2.5; setCameraPos(cameraPos.add(vec2(rand(-2, 2), rand(-2, 2)).scale(m.sh))); }
};
const bonk = (m, x, y) => { m.sh = 1; S.drum('snare', S.now(), 0.25); starburst(x, y); };
// a sprite standing on its feet at fx0 (its centre), tipped by angle a (clockwise), pivoting on the feet
const tipped = (s, fx0, y, a, o = {}) => PX.draw(s, fx0 + Math.sin(a) * s.h - s.w, y + Math.cos(a) * s.h - s.h, { ...o, angle: a });
// a sprite with a one-pixel rim in one colour: the thing to look at
const glow = (s, x, y, col, a = 1, o = {}) => {
  for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) PX.draw(s, x + dx, y + dy, { ...o, color: c('#000000', a), add: c(col, 0) });
  PX.draw(s, x, y, o);
};

// ---- the stage ----
const bmix = (a, b, k) => {
  const x = parseInt(a.slice(1), 16), y = parseInt(b.slice(1), 16), ch = (s) => Math.round(((x >> s) & 255) * (1 - k) + ((y >> s) & 255) * k);
  return '#' + ((1 << 24) | ch(16) << 16 | ch(8) << 8 | ch(0)).toString(16).slice(1);
};
const NIGHT = ['#0a0a22', '#10123a', '#181a48', '#22225a', '#2e2a66', '#3c3070'];
const DAWN = ['#1e2860', '#3a3a80', '#7a4a8a', '#c8607a', '#f08a6a', '#ffc47a'];
const skyAt = (k) => { for (let i = 0; i < 6; i++) PX.rect(0, GROUND + (5 - i) * 20, 256, 20, c(bmix(NIGHT[i], DAWN[i], k))); };
const disc = (x, y, r, col) => { for (let dy = -r; dy <= r; dy++) { const w = Math.round(Math.sqrt(r * r - dy * dy)); PX.rect(x - w, y + dy, w * 2, 1, c(col)); } };
const RT = [[0, 30, 14], [26, 22, 22], [44, 30, 12], [70, 26, 18], [92, 34, 10], [122, 24, 16], [142, 30, 22], [166, 12, 12]];
// Seville: the sky at dawn amount k, the sun coming up behind the roofs, the roofs, the floor
const street = (k) => {
  skyAt(k);
  if (k > 0.1) disc(58, GROUND + 4 + Math.round(k * 26), 12, bmix('#ffb060', '#ffe6a0', k));
  for (const [x, w, h] of RT) PX.rect(x, GROUND, w, h, c(bmix('#100c24', '#3a2440', k)));
  MG.floor(COL.floor, COL.line);
};
const nightStreet = () => {
  skyAt(0);
  for (let i = 0; i < 18; i++) PX.rect((i * 53) % 250 + 3, GROUND + 50 + (i * 29) % 66, 1, 1, c(COL.white, 0.4 + 0.4 * ((i * 7) % 3) / 2));
  disc(30, 118, 6, '#f4ecc0');
  for (const [x, w, h] of RT) PX.rect(x, GROUND, w, h, c('#0e0a1e'));
  MG.floor(COL.floor, COL.line);
};
// the house with Rosina's window: the shutters open by open (0..1), the room lit by lit
const house = (open, lit) => {
  PX.rect(176, GROUND, 80, 120, c(COL.stone));
  for (let y = GROUND + 6; y < 144; y += 8) PX.rect(176, y, 80, 1, c('#3d2c46'));
  PX.rect(176, GROUND, 2, 120, c('#241a2c'));
  PX.rect(182, BY + 3, 36, 34, c(COL.woodD));
  PX.rect(184, BY + 5, 32, 30, c(COL.night));
  PX.rect(184, BY + 5, 32, 30, c(COL.glow, 0.12 + 0.6 * lit));
};
const shutters = (open) => {
  const w = Math.round(16 * (1 - open)) + 3;
  for (const x of [184, 216 - w]) { PX.rect(x, BY + 5, w, 30, c(COL.wood)); for (let y = BY + 7; y < BY + 35; y += 4) PX.rect(x, y, w, 1, c(COL.woodD)); }
};
const balcony = () => {
  PX.rect(168, BY, 58, 3, c(COL.wood)); PX.rect(170, BY - 6, 3, 6, c(COL.woodD)); PX.rect(221, BY - 6, 3, 6, c(COL.woodD));
  for (let x = 170; x < 226; x += 4) PX.rect(x, BY + 3, 1, 8, c(COL.woodD));
  PX.rect(168, BY + 11, 58, 2, c(COL.wood));
};
// the balcony scene, complete: Rosina at the window when it is open
const balconyScene = (open, lit) => { house(open, lit); if (open > 0.3) CAST.draw(SP.rosina, RX, BY + 3); shutters(open); balcony(); };
// Bartolo's street door: open shows the dark, with his silhouette; shut, planks and a lock
const doorway = (x, open, lit) => {
  PX.rect(x - 2, GROUND, 28, 46, c(COL.woodD));
  if (open) { PX.rect(x, GROUND, 24, 44, c(lit ? '#f0d890' : '#0a0812')); }
  else { PX.rect(x, GROUND, 24, 44, c(COL.wood)); for (let i = 6; i < 24; i += 6) PX.rect(x + i, GROUND, 1, 44, c(COL.woodD)); PX.rect(x + 17, GROUND + 20, 3, 3, c(COL.gold)); }
};
const room = () => { PX.rect(0, GROUND, 256, 120, c(COL.wall)); PX.rect(0, GROUND + 12, 256, 2, c(COL.wall2)); MG.floor(COL.floor, COL.line); };
const armchair = (x) => { PX.rect(x, GROUND, 30, 28, c(COL.crimson)); PX.rect(x, GROUND, 30, 12, c(COL.woodD)); };
const ladderAt = (a) => tipped(SP.ladder, LX, GROUND, a);
const fallenLadder = () => { PX.rect(108, GROUND, 50, 2, c(COL.wood)); for (let x = 112; x < 156; x += 6) PX.rect(x, GROUND, 1, 4, c(COL.wood)); PX.rect(108, GROUND + 4, 50, 1, c(COL.wood)); };
// the wedding, both ends of WED and the bill: the notary in the door, the couple hand in hand,
// Bartolo arrived too late beside the ladder he has pulled down
const WED = { bx: 116, fx: 148, ax: 172, rx: 188 };
const weddingTableau = (m, fx0 = WED.fx, fpose, showHeart = true) => {
  nightStreet();
  house(1, 1); shutters(1); balcony();
  doorway(232, true, true);
  CAST.draw(SP.notary, 236, GROUND, { flip: true }); PX.draw(SP.book, 230, GROUND + 12);
  fallenLadder();
  CAST.draw(SP.bartolo, WED.bx, GROUND, { pose: 'idle' });
  CAST.draw(SP.figaro, fx0, GROUND, fpose ? { pose: fpose } : {});
  CAST.draw(SP.almaviva, WED.ax, GROUND, { flip: m.turn });
  CAST.draw(SP.rosina, WED.rx, GROUND);
  if (showHeart) PX.draw(SP.heart, 184, GROUND + 26 + Math.round(MG.bounce() * 2), { color: c(COL.rose) });
};

// ---- music helpers ----
const oom = (t, b, vol = 0.11) => { for (let k = 0; k < 4; k++) { S.voice('bass', S.deg(k % 2 ? '5-' : '1-'), t + k * b, b * 0.3, { vol }); S.voice('arp', S.deg(['3', '5'][k % 2]), t + k * b + b / 2, b * 0.2, { vol: vol * 0.5 }); } };
// the Rossini crescendo sting: the same figure, each game a tone higher and faster
const crescendo = (t, b, i) => { for (let k = 0; k < 8; k++) S.voice('pulse', S.deg(['1', '3', '5', '1+'][k % 4]) + i * 2, t + k * b / 4, b / 5, { vol: 0.05 + k * 0.006 }); };
const ECCO = TUNES.eccoRidente, UNA = TUNES.unaVoce, LARGO = TUNES.largo.notes.filter((n) => n !== '.');
// a stumbling march (filler in the key): a drunk oompah, the bass always a little late
const march = (t, b) => { for (let k = 0; k < 4; k++) { S.drum(k % 2 ? 'snare' : 'kick', t + k * b + (k === 3 ? b * 0.12 : 0), 0.13); S.voice('bass', S.deg(k % 2 ? '5-' : '1-'), t + k * b, b * 0.5, { vol: 0.12, slide: k === 3 ? -2 : 0 }); } for (let k = 0; k < 8; k++) S.voice('pulse', S.deg(['1', '3', '5', '3'][k % 4]) + 12, t + k * b / 2, b / 3, { vol: 0.07, slide: k % 3 ? 0 : -2 }); };

const ACTS = [
  // ---------------------------------------------------------------- 1 · under the balcony (watch)
  { watch: true, bpm: 120, beats: 10,
    captions: [[0, 'SEVILLE. DAWN. A BALCONY.'], [2.4, 'COUNT ALMAVIVA LOVES ROSINA. SHE HAS NEVER SEEN HIM.']],
    init(m) { m.n = 0; },
    update(m) { const k = Math.floor(m.t * 2); if (m.t > 2.4 && k > m.n) { m.n = k; noteUp(130, GROUND + 24); } },
    render(m) {
      street(0.05 + 0.45 * ease(m.t / 5));
      balconyScene(0, 0);
      const ax = Math.min(122, 8 + m.t * 48), here = ax >= 122;
      CAST.draw(SP.mus1, ax - 24, GROUND); CAST.draw(SP.mus2, ax - 40, GROUND);
      CAST.draw(SP.almaviva, ax, GROUND);
      PX.draw(SP.guitar, ax + 8, GROUND + 6 + (here ? Math.round(MG.bounce() * 2) : 0));
    },
    music: { curtain: (t, b) => MG.sting(t, 'I'), bar: (t, b, i) => { oom(t, b, 0.09); if (i === 0) sing('tenor', ECCO.notes, ECCO.durs, t, b * 0.8, { vol: 0.11, vibrato: 5, light: 'lead' }); } },
  },
  // ---------------------------------------------------------------- 2 · SERENADE (tap on the beat)
  // a ring closes on the gold note each beat; tap as it lands; six good strums open her shutters.
  // Either way she drops him a note and he calls himself Lindoro.
  { command: 'SERENADE!', instruction: 'TAP TO STRUM ON THE BEAT', verb: 'tap', bpm: 120, beats: 14,
    cue: () => [162, GROUND + 50],
    init(m) { m.hits = 0; m.pop = 0; m.bad = 0; m.last = -1; },
    update(m) {
      if (!m.press) return;
      const r = Math.round(m.beat);
      if (Math.abs(m.beat - r) < 0.25 && r !== m.last) {
        m.last = r; m.hits++; m.pop = 1;
        S.voice('pulse', S.deg(['1', '3', '5', '1+'][m.hits % 4]) + 12, S.now(), 0.25, { vol: 0.09 });
        noteUp(146, GROUND + 46);
        if (m.hits >= 6) m.win();
      } else if (r !== m.last) { m.bad = 1; m.hits = Math.max(0, m.hits - 1); S.voice('bass', S.deg('1-') + 1, S.now(), 0.2, { vol: 0.14, grit: true, slide: -2 }); }
    },
    updateOutcome(m) { if (!m.won && !m.bonked && m.t > 0.35) { m.bonked = 1; bonk(m, 134, GROUND + 26); CAST.hit(SP.almaviva); } },
    onOutcome(m) { m.sh = 0; if (m.won) { hearts(RX + 6, BY + 10, 8); fx(RX + 6, BY + 14, COL.glow, COL.white, 26, { v: 1.8 }); } },
    render(m) {
      const o = out(m); shake(m);
      m.pop = Math.max(0, m.pop - timeDelta * 4); m.bad = Math.max(0, m.bad - timeDelta * 4);
      street(0.5);
      balconyScene(o ? 1 : Math.min(0.7, m.hits / 6 * 0.7), o ? 1 : Math.min(1, m.hits / 6));
      const reel = o && !m.won && m.t > 0.35 && m.t < 1.3;
      const held = o && m.t > 1.3;
      CAST.draw(SP.almaviva, 122, GROUND, { angle: reel ? 0.35 * Math.sin(m.t * 14) : 0, pose: held ? 'hold' : 0 });
      PX.draw(SP.guitar, 130, GROUND + 2);
      if (m.phase === ACTION) {
        // the beat: a big gold note, and a ring that closes on it exactly on the beat
        const f = m.beat % 1, s = Math.round(16 + 26 * (1 - f)), cx = 146, cy = GROUND + 48, h = s / 2;
        PX.draw(SP.note, cx - 7 + (m.bad > 0 ? rand(-2, 2) : 0), cy - 7, { scale: 3 + (f < 0.15 ? 0.4 : 0), color: c(m.bad > 0 ? COL.tragic : m.pop > 0 ? COL.white : COL.gold) });
        const rc = c(COL.gold, 0.35 + 0.65 * f);
        PX.rect(cx - h, cy - h, s, 1, rc); PX.rect(cx - h, cy + h - 1, s, 1, rc); PX.rect(cx - h, cy - h, 1, s, rc); PX.rect(cx + h - 1, cy - h, 1, s, rc);
      }
      if (o) {
        // her note: it flutters into his hand, or drops like a stone on his head; then he holds it
        const k = m.won ? ease((m.t - 0.2) / 1.1) : ease(m.t / 0.35);
        const hx = 132, hy = GROUND + 20;
        if (!held) {
          const tx = m.won ? hx : 130, ty = m.won || m.t > 0.5 ? hy : GROUND + 24;
          PX.draw(SP.letter, RX + 4 + (tx - RX - 4) * k + (m.won ? Math.sin(m.t * 7) * 5 * (1 - k) : 0), BY + 8 + (ty - BY - 8) * k);
        } else PX.draw(SP.letter, 131, GROUND + 22);
        if (m.t > 1.5) say('LINDORO!', 96, GROUND + 40, COL.gold);
      }
    },
    renderOutcome: verdictDraw,
    outcome: (m) => [m.won ? 'THE SHUTTERS OPEN. A NOTE FLUTTERS DOWN.' : 'OFF THE BEAT. THE NOTE HITS HIS HEAD.', 'SHE DROPS HIM A NOTE. HE SAYS HE IS LINDORO. A LIE.'],
    music: {
      curtain: (t, b) => { MG.sting(t, 'I'); crescendo(t + b, b, 0); },
      bar: (t, b, i) => { oom(t, b, 0.1); if (i % 4 === 0) sing('tenor', ECCO.notes, ECCO.durs, t, b, { vol: 0.1, vibrato: 5, light: 'lead' }); },
      outcome: (t, b, won) => { if (won) sing('soprano', ['5', '6', '7', '1+'], [0.33, 0.33, 0.33, 1.5], t, b, { vol: 0.13 }); else { S.drum('thunder', t, 0.2); S.voice('bass', S.deg('1-'), t + 0.2, 1, { vol: 0.16, grit: true }); } },
    },
  },
  // ---------------------------------------------------------------- 3 · Figaro (watch)
  { watch: true, bpm: 120, beats: 12,
    captions: [[0, 'FIGARO. THE BARBER. HE FIXES EVERYTHING, FOR A FEE.'], [2.4, 'DR BARTOLO KEEPS ROSINA LOCKED UP.'], [4.1, 'HE MEANS TO MARRY HER HIMSELF.']],
    init(m) { m.lock = 0; },
    update(m) { if (!m.lock && m.t > 2.5) { m.lock = 1; S.drum('kick', S.now(), 0.25); S.voice('pulse', S.deg('5+') + 12, S.now(), 0.05, { vol: 0.08 }); } },
    render(m) {
      street(0.6);
      house(0, 0); shutters(0); balcony();
      const shut = m.t > 2.5;
      doorway(232, !shut, false);
      if (!shut) CAST.draw(SP.bartoloDark, 236, GROUND, { flip: true });
      else if (m.t < 3.0) PX.draw(SP.key, 226, GROUND + 22, { color: c(COL.gold, 1 - (m.t - 2.5) * 2) });
      const fxp = Math.min(96, -10 + m.t * 60);
      CAST.draw(SP.almaviva, 120, GROUND, { flip: true });
      CAST.draw(SP.figaro, fxp, GROUND, m.t > 1.9 && m.t < 2.5 ? { pose: 'hold' } : {});
      PX.draw(SP.guitar, fxp - 6, GROUND + 4); PX.draw(SP.sign, fxp + 12, GROUND + 6);
    },
    music: { curtain: (t, b) => MG.sting(t, 'I'), bar: (t, b, i) => { oom(t, b, 0.1); if (i === 0) sing('tenor', TUNES.largo.notes, TUNES.largo.durs, t, b * 0.5, { vol: 0.12, legato: 0.7, light: 'lead' }); } },
  },
  // ---------------------------------------------------------------- 4 · SLIP (drag)
  // Rosina's letter on the floor, a line of light under the door. Drag it along. Bartolo's paper
  // trembles a beat before he looks up: move while he looks and he catches you. Either way it goes under.
  { command: 'SLIP!', instruction: 'DRAG THE LETTER UNDER THE DOOR', verb: 'drag', bpm: 132, beats: 16,
    cue: (m) => [m.lx + 2, GROUND + 16],
    init(m) { m.lx = 104; m.plx = 104; m.looking = false; m.warn = false; m.nextLook = 1.8; m.caught = 0; m.kick = 0; },
    update(m) {
      const b = MG.beat();
      MG.drag(m, 'lx', 22, 104, 174, 16);
      m.warn = !m.looking && m.t >= m.nextLook - b;
      if (!m.looking && m.t >= m.nextLook) { m.looking = true; m.lookAt = m.t; m.lookEnd = m.t + 1.5 * b; S.drum('breath', S.now(), 0.3); }
      if (m.looking && m.t >= m.lookEnd) { m.looking = false; m.nextLook = m.t + 1.2 * b + rand(0, 1.6 * b); }
      if (m.warn && Math.random() < 0.1) S.drum('breath', S.now(), 0.12);
      if (Math.abs(m.lx - m.plx) > 0.05) { m.kick = 1; if (m.looking && m.t - m.lookAt > 0.12) { m.caught = 1; m.lose(); } }
      m.plx = m.lx;
      m.kick = Math.max(0, m.kick - timeDelta * 6);
      if (m.lx >= 172) m.win();
    },
    onOutcome(m) { if (m.won) fx(184, GROUND + 2, COL.gold, COL.white, 24, { v: 1.4, cone: 1.2 }); },
    render(m) {
      const o = out(m), t = m.t; shake(m);
      room();
      // the door on the right, a line of gold light under it: Figaro is outside
      PX.rect(186, GROUND, 30, 54, c(COL.woodD)); PX.rect(188, GROUND + 2, 26, 50, c(COL.wood)); PX.rect(191, GROUND + 26, 3, 3, c(COL.gold));
      PX.rect(186, GROUND - 1, 30, 3, c(COL.gold, 0.6 + 0.4 * MG.bounce()));
      // Bartolo in his armchair behind the paper; the paper drops when he looks
      const look = (o && !m.won && t < 1.2) || (!o && m.looking);
      armchair(40);
      CAST.draw(SP.bartolo, 49, GROUND + 6);
      PX.draw(SP.paper, 47 + (m.warn && !o ? rand(-1, 1) : 0), look ? GROUND + 8 : GROUND + 16);
      if (m.phase === ACTION && m.looking) PX.text('!', 64, GROUND + 34, c(COL.tragic), { scale: 3 });
      const jump = o && !m.won && t < 0.6 && t > 0.3 ? 6 : 0;
      CAST.draw(SP.rosina, 90 + m.kick * 2, GROUND + jump, { pose: jump ? 'jump' : 0 });
      const gone = o && (m.won ? t > 0.15 : t > 0.75);
      if (!gone) PX.draw(SP.letter, o ? m.lx + (176 - m.lx) * ease((t - (m.won ? 0 : 0.45)) / 0.3) : m.lx, GROUND);
      if (o) {
        if (!m.won && t < 1.2) say(m.caught ? 'AH-HA!' : 'EH?', 68, GROUND + 38, COL.tragic);
        if (t > 1.3) { say('HM?', 68, GROUND + 38); say('GRAZIE!', 130, GROUND + 30, COL.gold); }
      }
    },
    renderOutcome: verdictDraw,
    outcome: (m) => [m.won ? 'UNDER THE DOOR, INTO THE LIGHT.' : m.caught ? 'AH-HA! SHE KICKS IT UNDER THE DOOR ANYWAY.' : 'TOO SLOW. SHE KICKS IT UNDER THE DOOR ANYWAY.', 'THE LETTER IS ON ITS WAY. ROSINA WANTS LINDORO TOO.'],
    music: {
      curtain: (t, b) => { MG.sting(t, 'I'); crescendo(t + b, b, 1); },
      bar: (t, b, i) => { S.key(...UNA.key); oom(t, b, 0.1); if (i % 4 === 0) sing('soprano', UNA.notes, UNA.durs, t, b, { vol: 0.1, light: 'lead' }); S.key(0, 'major'); },
      outcome: (t, b, won) => { if (won) sing('soprano', ['1+', '2+', '3+'], [0.33, 0.33, 1.5], t, b, { vol: 0.13 }); else { S.drum('snare', t, 0.2); sing('bass', ['5-', '1-'], [0.5, 1.5], t, b, { vol: 0.16 }); } },
    },
  },
  // ---------------------------------------------------------------- 5 · the drunk soldier (watch)
  { watch: true, bpm: 120, beats: 12,
    captions: [[0, 'THE COUNT COMES BACK IN DISGUISE: A DRUNK SOLDIER.'], [2.6, 'HIS PAPERS SAY HE MAY SLEEP HERE. BARTOLO SAYS NO.']],
    render(m) {
      room();
      PX.rect(150, GROUND, 34, 52, c(COL.night)); PX.rect(148, GROUND + 52, 38, 3, c(COL.woodD));   // Bartolo's doorway
      CAST.draw(SP.bartolo, 159, GROUND, { flip: true });
      const x = Math.min(112, 10 + m.t * 34), a = x < 112 ? Math.sin(m.t * 3.1) * 0.22 + Math.sin(m.t * 7) * 0.08 : 0;
      tipped(CAST.frame(SP.soldier, 'walk', (m.t > 0 ? m.t : 0) * 1.2), x, GROUND, a);
      PX.draw(SP.bottle, x + 10 + Math.sin(a) * 20, GROUND + 14 + (x < 112 ? Math.round(Math.sin(m.t * 6)) : 0));
      PX.draw(SP.paper, x - 20, GROUND + 14 + Math.round(Math.abs(Math.sin(m.t * 3.1)) * 4), { scale: 1 });
      if (m.t > 4.6) say('NO!', 172, GROUND + 46, COL.tragic);
    },
    music: { curtain: (t, b) => MG.sting(t, 'I'), bar: (t, b) => march(t, b) },
  },
  // ---------------------------------------------------------------- 6 · STAGGER (tap the glowing arrow)
  // he crosses the hall toward Bartolo, tipping; the arrow on the side he is falling to glows:
  // tap while it glows to right him. Four tips. Either way the billet lands on Bartolo.
  { command: 'STAGGER!', instruction: 'TAP TO STEADY HIM', verb: 'tap', bpm: 130, beats: 14,
    cue: (m) => [m.sx + 20, GROUND + 30],
    init(m) { m.a = 0; m.tip = 0; m.dir = [1, -1, 1, -1]; m.sx = 24; m.glow = false; m.dull = 0; m.ok = 0; },
    update(m) {
      m.sx = 24 + 108 * m.frac;
      const T0 = [1.2, 4.2, 7.2, 10.2], i = m.tip;
      m.dull = Math.max(0, m.dull - timeDelta * 5); m.ok = Math.max(0, m.ok - timeDelta * 4);
      if (i < 4 && m.beat >= T0[i]) {
        const u = m.beat - T0[i];
        m.a = m.dir[i] * Math.min(0.9, u * 0.38);
        m.glow = u >= 0.8;
        if (m.press) {
          if (m.glow) { m.tip++; m.glow = false; m.ok = 1; chime(m.tip * 2, 0.07); S.drum('hat', S.now(), 0.14); starburst(m.sx + 6, GROUND + 26); if (m.tip === 4) m.win(); }
          else { m.dull = 1; S.voice('bass', S.deg('1-') + 3, S.now(), 0.08, { vol: 0.1 }); }
        } else if (u > 2.4) m.lose();
      } else {
        m.glow = false;
        m.a += ((Math.sin(m.beat * 2.2) * 0.07 * (i ? 1 : 0)) - m.a) * Math.min(1, timeDelta * 10);
        if (m.press) { m.dull = 1; S.voice('bass', S.deg('1-') + 3, S.now(), 0.08, { vol: 0.1 }); }
      }
    },
    onOutcome(m) { m.x0 = m.sx; m.a0 = m.a; },
    updateOutcome(m) {
      const t = m.t;
      if (!m.won && !m.bonked && t > 0.45) { m.bonked = 1; bonk(m, 160, GROUND + 26); S.drum('thunder', S.now(), 0.2); }
      const go = m.won ? t > 0.1 : t > 1.2;
      if (go && m.sx < 132) m.sx = Math.min(132, m.sx + 90 * timeDelta);
    },
    render(m) {
      const o = out(m), t = m.t; shake(m);
      room();
      PX.rect(150, GROUND, 34, 52, c(COL.night)); PX.rect(148, GROUND + 52, 38, 3, c(COL.woodD));
      const froze = o && t > 0.5;
      CAST.draw(SP.bartolo, 159, GROUND, { flip: true, color: froze ? new Color(0.7, 0.85, 1) : undefined });
      // the soldier: tipped by the sway; flat out and up again on the slapstick side
      let a = m.a;
      if (o) a = m.won ? 0 : t < 0.3 ? m.a0 + (Math.sign(m.a0 || 1) * PI / 2 - m.a0) * ease(t / 0.3) : t < 1.2 ? Math.sign(m.a0 || 1) * PI / 2 : 0;
      const sx = m.sx;
      if (Math.abs(a) > 1.2) CAST.draw(SP.soldier, sx, GROUND, { pose: 'fall' });
      else tipped(CAST.frame(SP.soldier, o && t > 0.2 ? 'idle' : 'hold', time), sx, GROUND, a + (m.dull > 0 ? Math.sin(time * 60) * 0.04 : 0));
      // the billet, the gold thing: held high while he sways, then on Bartolo's chest
      const k = o ? ease((t - (m.won ? 0.3 : 0.4)) / 0.4) : 0;
      const hx = sx + Math.sin(a) * 30 - 7, hy = GROUND + Math.cos(a) * 30 - 5;
      PX.draw(SP.billet, hx + (160 - hx) * k, hy + (GROUND + 8 - hy) * k + Math.sin(k * PI) * 16, { angle: o && !m.won ? k * PI * 4 : 0 });
      if (m.phase === ACTION && m.tip < 4 && Math.abs(m.a) > 0.05) {
        // the arrow on the side he is falling to: white while it is coming, gold and pulsing while it glows
        const d = Math.sign(m.a), ax = sx + (d > 0 ? 16 : -28);
        if (m.glow) glow(SP.arrow, ax, GROUND + 26, COL.gold, 0.9, { flip: d > 0, color: c(COL.gold) }); else PX.draw(SP.arrow, ax, GROUND + 26, { flip: d > 0, color: c(COL.white, 0.35) });
      }
      if (o && t > 0.9) {
        CAST.draw(SP.rosina, Math.max(206, 256 - (t - 0.9) * 90), GROUND, { flip: true });
        if (t > 1.6) PX.draw(SP.heart, 172, GROUND + 34 + Math.round(MG.bounce() * 2), { color: c(COL.rose) });
        if (t > 1.6) say('?!', 166, GROUND + 58, COL.gold);
      }
      if (o && t > 1.3) say('QUARTIERE!', 90, GROUND + 34);
    },
    renderOutcome: verdictDraw,
    outcome: (m) => [m.won ? 'UPRIGHT. HE SLAPS THE BILLET ON BARTOLO.' : 'HE FALLS. THE BILLET LANDS ON BARTOLO ANYWAY.', 'BARTOLO FREEZES. THE LOVERS SWAP NOTES UNDER HIS NOSE.'],
    music: {
      curtain: (t, b) => { MG.sting(t, 'I'); crescendo(t + b, b, 2); },
      bar: (t, b) => march(t, b),
      outcome: (t, b, won) => { if (won) { S.drum('snare', t, 0.2); sing('tenor', ['5', '5', '1+'], [0.25, 0.25, 1.5], t, b, { vol: 0.14 }); } else { S.drum('thunder', t, 0.22); S.voice('bass', S.deg('1-'), t, 1.2, { vol: 0.16, slide: -7 }); } },
    },
  },
  // ---------------------------------------------------------------- 7 · the music lesson (watch)
  { watch: true, bpm: 120, beats: 12,
    captions: [[0, 'DISGUISE TWO: DON ALONSO, MUSIC TEACHER.'], [2.6, 'THE LESSON IS A COVER. THEY PLAN TO ELOPE TONIGHT.']],
    init(m) { m.yawn = 0; },
    update(m) { if (!m.yawn && m.t > 3.6) { m.yawn = 1; S.voice('bass', S.deg('5'), S.now(), 0.9, { vol: 0.12, slide: -9 }); } },
    render(m) {
      room();
      CAST.draw(SP.alonzo, 84, GROUND + 8);
      PX.rect(52, GROUND, 82, 18, c(COL.woodD)); PX.rect(52, GROUND + 18, 82, 2, c(COL.wood));
      for (let i = 0; i < 7; i++) PX.rect(56 + i * 10, GROUND + 3, 9, 11, c(COL.cream, 0.85));
      PX.draw(SP.hand, 56 + (Math.floor(m.t * 3) % 7) * 10 + 3, GROUND + 14, { scale: 1 });
      CAST.draw(SP.rosina, 140, GROUND);
      const bx = Math.min(176, 210 - m.t * 40), sat = bx <= 176;
      armchair(166);
      CAST.draw(SP.bartolo, bx, GROUND + (sat ? 6 : 0), { pose: sat ? 'idle' : 'walk', flip: !sat });
      if (m.yawn) PX.draw(SP.zz, 182, GROUND + 34 + Math.round(MG.bounce() * 3), { color: c(COL.dim) });
    },
    music: { curtain: (t, b) => MG.sting(t, 'I'), bar: (t, b, i) => { if (i === 0) sing('soprano', ['1', '2', '3', '4', '5', '6', '5', '3'], [0.5], t, b, { vol: 0.1, light: 'lead' }); else oom(t, b, 0.07); } },
  },
  // ---------------------------------------------------------------- 8 · TUNE (tap the gold key)
  // one key at a time turns gold; tap it before it fades. Each right note sends Bartolo's head a little lower.
  { command: 'TUNE!', instruction: 'TAP THE GOLD KEY', verb: 'tap', bpm: 140, beats: 16, shot: 'mid', focus: () => [120, 46],
    cue: (m) => [56 + (m.seq[Math.min(m.ki, 6)]) * 10 + 8, GROUND + 26],
    init(m) { m.seq = [3, 5, 1, 6, 4, 0, 5]; m.ki = 0; m.hit = 0; m.miss = 0; m.gold = -1; m.u = 0; m.jolt = 0; m.pl = 0; m.done1 = false; },
    update(m) {
      const u = m.beat - (1 + 2 * m.ki);
      m.u = u; m.gold = m.ki < 7 && u >= 0 && u < 1.7 ? m.seq[m.ki] : -1;
      m.jolt = Math.max(0, m.jolt - timeDelta * 2.5); m.pl = Math.max(0, m.pl - timeDelta * 6);
      if (m.press) {
        m.pl = 1;
        const gx = 56 + m.gold * 10 + 4.5;
        if (m.gold >= 0 && Math.abs(m.px - gx) < 8) {
          m.hit++; m.ki++; S.voice('arp', S.deg(['1', '2', '3', '4', '5', '6', '7', '1+'][m.seq[m.ki - 1]]) + 12, S.now(), 0.2, { vol: 0.07 });
          noteUp(gx, GROUND + 24, COL.rose, COL.white);
          if (m.hit >= 5) m.win();
        } else { m.jolt = 1; S.voice('bass', S.deg('7-'), S.now(), 0.2, { vol: 0.13, grit: true }); }
      } else if (m.ki < 7 && u >= 1.7) { m.miss++; m.ki++; m.jolt = 1; S.voice('bass', S.deg('7-'), S.now(), 0.2, { vol: 0.13, grit: true }); if (m.miss >= 3) m.lose(); }
    },
    updateOutcome(m) { if (!m.won && !m.bonked && m.t > 0.05) { m.bonked = 1; m.sh = 0.8; fx(168, GROUND + 26, COL.white, COL.white, 16, { v: 1.4, cone: 0.8 }); } if (m.won && !m.hearted && m.t > 0.4) { m.hearted = 1; hearts(140, GROUND + 26, 6); } },
    render(m) {
      const o = out(m), t = m.t; shake(m);
      room();
      // Bartolo in the armchair; a wrong note jolts him, and on the slapstick side he leaps, then dozes
      armchair(150);
      const leap = o && !m.won && t < 0.9 ? Math.sin(ease(t / 0.9) * PI) * 22 : 0;
      const low = o ? 5 : Math.min(5, m.hit);
      CAST.draw(SP.bartolo, 159, GROUND + 6 + leap - low + (m.jolt > 0.5 ? 2 : 0), { pose: leap > 0 ? 'jump' : 'idle' });
      if (leap > 0) say('CHE VOCE!', 118, GROUND + 50, COL.tragic);
      else if (m.jolt > 0.3 && !o) PX.text('!', 164, GROUND + 34, c(COL.tragic), { scale: 3 });
      else if (m.hit >= 2 || o) PX.draw(SP.zz, 168, GROUND + 32 + MG.bounce() * 3, { color: c(COL.dim) });
      // Alonso behind the harpsichord, his hand on the gold key
      const k = o ? 4 : Math.max(0, m.gold >= 0 ? m.gold : 3);
      CAST.draw(SP.alonzo, 84, GROUND + 8, { pose: 'idle' });
      PX.rect(52, GROUND, 82, 18, c(COL.woodD)); PX.rect(52, GROUND + 18, 82, 2, c(COL.wood));
      for (let i = 0; i < 7; i++) {
        const isGold = i === m.gold && m.phase === ACTION, x = 56 + i * 10;
        PX.rect(x, GROUND + 3, 9, 11, c(isGold ? COL.gold : COL.cream, isGold ? 0.55 + 0.45 * ease(1 - m.u / 1.7) : 0.85));
        if (i % 3 !== 2 && i < 6) PX.rect(x + 7, GROUND + 8, 5, 6, c(COL.eye));
        if (isGold) { PX.rect(x, GROUND + 3, 9, 1, c(COL.white)); PX.rect(x + 3, GROUND + 16 + Math.round(MG.bounce() * 2), 3, 3, c(COL.gold)); }
      }
      PX.draw(SP.hand, 56 + k * 10 + 3, GROUND + 14 + Math.round(m.pl * 2), { scale: 1 });
      CAST.draw(SP.rosina, 138, GROUND);
      if (o && t > 1.3) { say('PSST!', 96, GROUND + 38, COL.gold); }
    },
    renderOutcome: verdictDraw,
    outcome: (m) => [m.won ? 'EVERY NOTE LANDS. HIS HEAD DROOPS.' : 'A WRONG NOTE. HE LEAPS UP, THEN DOZES ANYWAY.', 'BARTOLO SNORES. MIDNIGHT, THE BALCONY. THAT IS THE PLAN.'],
    music: {
      curtain: (t, b) => { MG.sting(t, 'I'); crescendo(t + b, b, 3); },
      bar: (t, b, i) => { for (let k = 0; k < 4; k++) S.arp(['I', 'IV', 'V', 'I'][k], b * 0.9, 50, t + k * b, { vol: 0.05 }); S.voice('bass', S.deg('1-'), t, b * 0.4, { vol: 0.1 }); S.voice('bass', S.deg('5-'), t + 2 * b, b * 0.4, { vol: 0.1 }); },
      outcome: (t, b, won) => { if (won) { S.arp('I', 2 * b, 50, t, { vol: 0.06 }); sing('soprano', ['1+', '3+'], [0.5, 2], t, b, { vol: 0.12 }); } else { S.drum('snare', t, 0.2); S.voice('bass', S.deg('7-') - 1, t, 1.2, { vol: 0.15, grit: true }); } },
    },
  },
  // ---------------------------------------------------------------- 9 · SHAVE (toy, drag)
  // Largo al factotum: every pass of the brush piles foam and sounds a note of the patter.
  // No way to fail; it just gets sillier. He comes out of it with the balcony key.
  { toy: true, verb: 'drag', bpm: 120, beats: 20, shot: 'mid', focus: () => [124, 46],
    cue: () => [120, GROUND + 48],
    init(m) {
      m.foam = []; m.n = 0; m.bx = 128; m.by = GROUND + 36; m.lx = null; m.acc = 0;
      new ParticleEmitter(vec2(166, GROUND + 22), 0, 8, 0, 3, 0.4, SP.bubble.tile, c(COL.white), c(COL.sky), c(COL.white, 0), c(COL.sky, 0), 2.5, 4, 6, 0.3, 0, 0.97, 1, -0.4, 0, 0.2, 0.4);
    },
    update(m) {
      if (m.down) {
        m.bx = clamp(m.px, 100, 158); m.by = clamp(m.py, GROUND + 14, GROUND + 56);
        if (m.lx != null) m.acc += Math.hypot(m.bx - m.lx, m.by - m.ly);
        m.lx = m.bx; m.ly = m.by;
        while (m.acc > 7) {
          m.acc -= 7; m.n++;
          if (m.foam.length < 44) m.foam.push([m.bx + randInt(-4, 4), m.by + randInt(-4, 4), randInt(1, 3)]);
          bubbles(m.bx, m.by, 3, 12);
          S.voice('pulse', S.deg(LARGO[m.n % LARGO.length]) + 12, S.now(), 0.12, { vol: 0.08 });
          if (m.n % 6 === 0) { S.drum('hat', S.now(), 0.12); hearts(m.bx, m.by + 8, 2); }
        }
      } else { m.lx = null; m.acc = 0; }
    },
    onOutcome() { confetti(124, GROUND + 66, 60); bubbles(132, GROUND + 30, 24, 40); starburst(96, GROUND + 50); },
    render(m) {
      const o = out(m), t = m.t;
      room();
      // the chair, Bartolo in the white cape, his face and the foam on it
      PX.rect(114, GROUND, 38, 44, c(COL.woodD)); PX.rect(110, GROUND + 10, 46, 6, c(COL.crimson));
      PX.rect(118, GROUND + 6, 30, 20, c(COL.white));
      PX.draw(SP.face, 121, GROUND + 24);
      const heap = [[-12, 8], [-7, 12], [-2, 14], [3, 12], [8, 8], [-12, 2], [8, 2], [-6, -2], [2, -2], [-4, 14], [-9, 5], [5, 5], [-8, 18], [0, 19], [7, 17], [-13, 13], [12, 13]];
      if (o) for (const [dx, dy] of heap) PX.draw(SP.foam, 129 + dx, GROUND + 24 + dy, { scale: 3 });
      else for (const [x, y, s] of m.foam) PX.draw(SP.foam, x - 4, y - 4, { scale: s });
      PX.rect(127, GROUND + 34, 2, 2, c(COL.eye)); PX.rect(137, GROUND + 34, 2, 2, c(COL.eye));
      // the lather bowl on its stool
      PX.rect(160, GROUND, 4, 12, c(COL.wood)); PX.rect(156, GROUND + 12, 20, 6, c(COL.slate)); PX.rect(158, GROUND + 18, 16, 2, c(COL.foam));
      // Figaro, dancing to the patter; the brush is wherever the finger is
      CAST.draw(SP.figaro, 90, GROUND + Math.round(MG.bounce() * 2), { pose: o ? 'hold' : 'walk' });
      if (!o) PX.draw(SP.brush, m.bx - 5, m.by - 4, { angle: m.down ? 0.5 + Math.sin(time * 20) * 0.2 : 0.5 });
      else {
        PX.draw(SP.key, 92, GROUND + 26 + Math.sin(t * 6) * 2);
        if (t > 0.8) say('FIGARO QUA!', 60, GROUND + 40, COL.gold);
        if (t > 1.2) say('MMF!', 150, GROUND + 52);
      }
    },
    outcome: () => ['FIGARO POCKETS THE BALCONY KEY.'],
    music: {
      curtain: (t, b) => { MG.sting(t, 'I'); crescendo(t + b, b, 4); },
      bar: (t, b) => { for (let k = 0; k < 4; k++) { S.voice('bass', S.deg(k % 2 ? '5-' : '1-'), t + k * b, b * 0.3, { vol: 0.1 }); S.drum(k % 2 ? 'hat' : 'kick', t + k * b, 0.1); } },
      outcome: (t, b) => { sing('tenor', ['5', '3', '1', '5', '3', '1', '5', '3', '1'], [0.25, 0.25, 0.25], t, b, { vol: 0.14, legato: 0.7 }); S.arp('I', 1.5 * b, 25, t + 2.25 * b, { vol: 0.07, octave: 1 }); },
    },
  },
  // ---------------------------------------------------------------- 10 · midnight (watch)
  { watch: true, bpm: 120, beats: 14,
    captions: [[0, 'MIDNIGHT. A STORM. A LADDER.'], [1.9, 'BARTOLO HAS TOLD ROSINA THAT LINDORO IS A FRAUD.'], [4.3, 'HE SHOWS HER: LINDORO IS THE COUNT. SHE SAYS YES.']],
    init(m) { m.fl = 0; m.next = 0.4; },
    update(m) {
      m.fl = Math.max(0, m.fl - timeDelta * 3);
      if (m.t > m.next) { m.next += 2.1; m.fl = 1; S.drum('thunder', S.now() + 0.3, 0.22); }
    },
    render(m) {
      const t = m.t;
      nightStreet();
      PX.rect(0, 0, 256, 144, c('#000000', 0.25));
      for (const [x, y, w] of [[10, 118, 60], [90, 124, 70], [170, 116, 76]]) PX.rect(x + Math.round(t * 2) % 8, y, w, 12, c('#1a1630'));
      house(1, 0.6);
      const back = t < 4.3;
      CAST.draw(back ? SP.rosinaBack : SP.rosina, RX, BY + 3);
      shutters(1); balcony();
      ladderAt(0.25);
      // Figaro then the Count go up the ladder and onto the balcony
      for (const [s, x0, bx] of [[SP.figaro, 0.6, 168], [SP.almaviva, 1.6, 180]]) {
        const p = ease((t - x0) / 1.8);
        CAST.draw(s, p >= 1 ? bx : LX - 6 + 12 * p, p >= 1 ? BY + 3 : GROUND + (BY + 3 - GROUND) * p, { pose: p > 0 && p < 1 ? 'walk' : 0 });
      }
      if (t > 4.4) hearts(RX + 7, BY + 26, 1);
      // rain, and the lightning
      for (let i = 0; i < 36; i++) PX.rect((i * 37 + Math.round(t * 50)) % 256, GROUND + ((((i * 53 - Math.round(t * 230)) % 120) + 120) % 120), 1, 4, c(COL.sky, 0.45));
      if (m.fl > 0) PX.rect(0, 0, 256, 144, c(COL.white, 0.55 * m.fl * m.fl));
    },
    music: { curtain: (t, b) => { S.setRoom(2400, 0.5, 1, t); S.drum('thunder', t, 0.25); }, bar: (t, b, i) => { for (let k = 0; k < 16; k++) S.voice('pulse', S.deg('1-') + (k % 2 ? 3 : 0), t + k * b / 4, b / 5, { vol: 0.04 + i * 0.012 }); S.drone(S.deg('1-'), t, 4 * b, { tritone: true, vol: 0.04 }); if (i === 3) S.arp('I', 1.6, 25, t + b, { vol: 0.06, octave: 1 }); } },
  },
  // ---------------------------------------------------------------- 11 · WED (tap tap tap)
  // Rosina on the ladder: each tap a rung. Bartolo's footsteps get louder along the ground:
  // he is coming back with the notary. Either way she ends in the Count's arms and they are married.
  { command: 'WED!', instruction: 'TAP TAP TAP TO CLIMB DOWN', verb: 'mash', bpm: 150, beats: 20, outcomeSeconds: 4.4,
    cue: () => [LX + 22, GROUND + 26],
    init(m) { m.r = 0; m.tt = 0; m.bx = -16; m.ls = -1; m.turn = false; },
    update(m) {
      if (m.press && m.r < 16) { m.r++; m.tt += 0.125; S.drum('hat', S.now(), 0.1); chime(m.r, 0.04); }
      m.bx = -16 + 134 * m.frac;
      const st = Math.floor(m.beat * 2);
      if (st !== m.ls) { m.ls = st; S.drum('kick', S.now(), 0.04 + 0.2 * m.frac); }
      if (m.r >= 16) m.win();
    },
    onOutcome(m) { m.b0 = m.bx; m.p = m.r / 16; m.tY = m.won ? 1.1 : 0.7; },
    updateOutcome(m) {
      const t = m.t, tY = m.tY;
      if (t > tY && !m.pulled) { m.pulled = 1; S.drum('kick', S.now(), 0.25); S.drum('thunder', S.now(), 0.15); bonk(m, WED.bx + 6, GROUND + 24); }
      if (t > tY + 1.4 && !m.cheer) { m.cheer = 1; confetti(180, GROUND + 60, 60); hearts(180, GROUND + 30, 6); chime(6, 0.06); }
    },
    render(m) {
      const o = out(m), t = m.t, tY = m.tY; shake(m);
      nightStreet();
      house(1, 1); shutters(1); balcony();
      doorway(232, o && t > tY + 0.3, true);
      if (o && t > tY + 0.3) { CAST.draw(SP.notary, 236, GROUND, { flip: true }); PX.draw(SP.book, 230, GROUND + 12); }
      // Bartolo runs in from the left
      const bx = o ? Math.min(WED.bx, m.b0 + Math.max(0, t) * 110) : m.bx;
      CAST.draw(SP.bartolo, bx, GROUND, { pose: !o || bx < WED.bx ? 'walk' : 'idle' });
      // the ladder: upright on the mark; over on its side once he pulls it
      const k = o ? ease((t - tY) / 0.5) : 0;
      if (k < 1) ladderAt(0.25 - 1.75 * k * k); else fallenLadder();
      // Rosina: down the rungs, then into his arms (or onto the floor beside him)
      const p = o ? m.p : m.r / 16;
      let rx = LX + 12 * (1 - p) - 7, ry = GROUND + (BY + 3 - GROUND) * (1 - p);
      let pose = m.phase === ACTION && m.r > 0 ? 'walk' : 'hold';
      if (o) {
        const j = ease((t - (m.won ? 0.1 : tY)) / 0.45);
        rx = rx + (WED.rx - rx) * j; ry = ry + (GROUND - ry) * j + Math.sin(j * PI) * 10;
        pose = j > 0 && j < 1 ? 'jump' : j >= 1 ? 0 : pose;
      }
      CAST.draw(SP.rosina, rx, ry, { pose, t: m.tt });
      CAST.draw(SP.almaviva, WED.ax, GROUND, { pose: !o ? 'hold' : 0 });
      CAST.draw(SP.figaro, 140, GROUND);
      if (o && t > tY + 1.2) { PX.draw(SP.heart, 184, GROUND + 26 + Math.round(MG.bounce() * 2), { color: c(COL.rose) }); say('BRIGANTI!', WED.bx - 8, GROUND + 30, COL.tragic); }
    },
    renderOutcome: verdictDraw,
    outcome: (m) => [m.won ? 'DOWN THE LADDER, INTO HIS ARMS.' : 'BARTOLO PULLS THE LADDER. SHE JUMPS. CAUGHT ANYWAY.', 'THE NOTARY MARRIES THEM ON THE SPOT. EVERYONE IS HAPPY.'],
    music: {
      curtain: (t, b) => { MG.sting(t, 'I'); crescendo(t + b, b, 5); S.setRoom(2600, 0.5, 1, t); },
      bar: (t, b) => { for (let k = 0; k < 12; k++) S.voice('pulse', S.deg(['1', '3', '5', '3', '1', '5-'][k % 6]) + 12, t + k * b / 3, b / 4, { vol: 0.07, light: k % 3 ? null : 'lead' }); for (let k = 0; k < 4; k++) S.drum(k % 2 ? 'hat' : 'kick', t + k * b, 0.12); },
      outcome: (t, b, won) => { if (won) { S.setRoom(3600, 0.5, 1, t); sing('tenor', ['1', '3', '5', '1+'], [0.25, 0.25, 0.25, 1.5], t, b, { vol: 0.14 }); sing('soprano', ['3+', '5+'], [0.5, 1.5], t + 0.75 * b, b, { vol: 0.12 }); S.arp('I', 2 * b, 25, t + b, { vol: 0.07, octave: 1 }); } else { S.drum('thunder', t, 0.25); S.drum('snare', t + b * 0.5, 0.2); sing('bass', ['5-', '1-'], [0.5, 1.5], t, b, { vol: 0.16 }); sing('tenor', ['1', '3', '5', '1+'], [0.25, 0.25, 0.25, 1.5], t + 2 * b, b, { vol: 0.13 }); } },
    },
  },
  // ---------------------------------------------------------------- 12 · the bill (watch)
  { watch: true, bpm: 120, beats: 8,
    captions: [],
    init(m) { m.done = 0; m.turn = false; },
    update(m) {
      if (!m.done && m.t > 0.1) { m.done = 1; confetti(180, GROUND + 60, 70); }
      if (m.t > 1.6) m.turn = true;
    },
    render(m) {
      const k = ease((m.t - 0.8) / 1.0);
      weddingTableau(m, WED.fx + 12 * k, m.t > 1.8 ? 'hold' : 0, true);
      if (m.t > 2.0) say('E IL CONTO ?', 132, GROUND + 34, COL.gold);
    },
    music: { curtain: (t, b) => { S.setRoom(3600, 0.5, 1, t); MG.sting(t, 'I'); }, bar: (t, b, i) => { if (i === 0) { sing('tenor', ['1', '2', '3', '4', '5', '6', '7', '1+'], [0.25], t, b, { vol: 0.11 }); S.arp('I', 2 * b, 30, t + 2 * b, { vol: 0.06, octave: 1 }); } else { S.arp('V', 0.7, 30, t, { vol: 0.06 }); sing('tenor', ['5', '1+'], [0.5, 2], t + b, b, { vol: 0.12 }); } } },
  },
];
// every game gets the verdict: the sting at the first frame of the outcome
for (const a of ACTS) if (!a.watch) { const on = a.onOutcome; a.onOutcome = (m) => { verdict(m); on?.(m); }; }

MG.opera({
  title: 'IL BARBIERE',
  sub: 'ROSSINI · FIVE GAMES · TWO MINUTES',
  key: [0, 'major'],
  colours: COL,
  sprites: barberSprites,
  ending: (m, n) => n === 5 ? ['ROSINA AND THE COUNT ARE MARRIED.', 'FIGARO GOT PAID. YOU FIXED EVERYTHING.']
    : n === 0 ? ['ROSINA AND THE COUNT ARE MARRIED.', 'FIGARO GOT PAID. YOU FIXED NOTHING.']
    : ['ROSINA AND THE COUNT ARE MARRIED.', 'FIGARO GOT PAID. BARTOLO KEEPS THE LADDER.'],
  music: { result: (t) => { S.setRoom(3600, 0.5, 1, t); for (let i = 0; i < 4; i++) S.arp(['I', 'IV', 'V', 'I'][i], 0.6, 25, t + i * 0.6, { vol: 0.07, octave: 1 }); sing('tenor', ['5', '3', '1'], [0.25, 0.25, 1.5], t + 2.4, 0.5, { vol: 0.14 }); } },
  renderTitle: () => { street(0.4); house(0, 0); shutters(0); balcony(); CAST.draw(SP.figaro, 40, GROUND); CAST.draw(SP.almaviva, 150, GROUND); PX.draw(SP.guitar, 158, GROUND + 6); },
  renderResult: () => { nightStreet(); MG.floor(COL.floor, COL.line); CAST.draw(SP.almaviva, 112, GROUND); CAST.draw(SP.rosina, 128, GROUND); PX.draw(SP.heart, 122, GROUND + 26, { scale: 1, color: c(COL.rose) }); CAST.draw(SP.figaro, 64, GROUND); CAST.draw(SP.bartolo, 190, GROUND); },
  acts: ACTS,
});
