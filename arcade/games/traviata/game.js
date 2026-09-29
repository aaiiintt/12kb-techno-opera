/* LA TRAVIATA: five games, one toy and six scenes, about two minutes.
   Verdi, 1853. B flat major for the party; the key goes dark after it.
   Violetta in rose with a camellia, Alfredo in evening blue, Germont in grey with a top hat,
   the salon crimson and gold, the sickroom violet. The story is told in WATCH beats between the
   games; each game has one job: tap on the beat, (a toy: drag the scissors), hold the pen, tap
   tap tap, hold the hand round the flame, drag the portrait. Both outcomes of a game end on one
   tableau and the caption states the same fact; only the manner differs. The ending is watched.
   Tunes: the Brindisi (Libiamo) and Addio, del passato are checked (lib/tunes.js, docs/MUSIC.md);
   everything else is filler in the key, not a quote. */

'use strict';

const SP = {};
const COL = {
  bg: '#12060e', ink: '#f7ecdf', dim: '#7d6272', card: '#f7ecdf', cardInk: '#12060e',
  bravo: '#f4c95d', tragic: '#ff5a64', fuse: '#f7ecdf',
  crimson: '#8f1d2c', gold: '#f4c95d', white: '#ffffff', violet: '#5b3a8c', grey: '#9a9aaa',
  skin: '#f1c9a5', pale: '#efc9cc', rose: '#e0708f', dark: '#1a1020', green: '#2f7a45', camellia: '#ff3355', candle: '#ffb347',
  suit: '#34427e', hair: '#3a2418', paper: '#f7ecdf', ink2: '#241838', snow: '#dfe8ff', wood: '#5a3a2a',
};
const c = PX.c;
PX.SCALE = 2;                  // people and props are drawn at 2x: 12x22 bodies on a 256x144 stage
const GROUND = MG.GROUND;
const ACTION = MG.phase.ACTION, OUTCOME = MG.phase.OUTCOME;

function traviataSprites() {
  setGravity(vec2(0, -0.05));  // per frame: petals and confetti fall
  const d = COL.dark, sk = COL.skin;
  const dress = (h, f, r, k) => CAST.dress({ h, f, r, k, e: d });
  SP.violetta = dress(COL.hair, sk, COL.rose, COL.camellia);
  SP.vCountry = dress(COL.hair, sk, '#f4e3a0', COL.camellia);
  SP.vPale = dress(COL.hair, '#ecc8bc', '#e6dcee', '#e6dcee');
  const body = (h, f, b, l, s = COL.white) => CAST.body({ h, f, b, l, s, e: d });
  SP.alfredo = body(COL.hair, sk, COL.suit, '#1e2650');
  SP.germont = body('#1c1c24', sk, '#8a8a9a', '#3a3a48');
  SP.baron = body('#c8c0b0', sk, '#2a1a32', '#120c18');
  const jew = (h, b) => body(h, '#c9a08a', b, '#1a1020');
  SP.g0 = jew('#2a1a30', '#4a1830'); SP.g1 = jew('#c9b48a', '#1c3a4a'); SP.g2 = jew('#3a2418', '#3a2a5a');
  const back = (h, b) => body(h, h, b, '#1a1020');
  SP.b0 = back('#2a1a30', '#4a1830'); SP.b1 = back('#c9b48a', '#1c3a4a'); SP.b2 = back('#3a2418', '#3a2a5a');
  SP.coupe = PX.sprite(['wyyyw', '.wyw.', '..w..', '..w..', '.www.'], { w: '#dfe6f5', y: COL.gold });
  SP.broken = PX.sprite(['w.y.w', '.www.', 'wwwww'], { w: '#dfe6f5', y: COL.gold });
  const cam = (r, p) => PX.sprite(['.r.r.', 'rrrrr', 'rrprr', 'rrrrr', '.r.r.'], { r, p });
  SP.camellia = cam(COL.camellia, '#ffd0da'); SP.camelliaW = cam(COL.white, COL.gold);
  SP.bud = PX.sprite(['.r.', 'grg', '.g.'], { r: COL.camellia, g: '#5fbf6a' });
  SP.bee = PX.sprite(['.ww.', 'ykyk'], { w: '#dfe8ff', y: COL.gold, k: d });
  SP.scissors = PX.sprite(['g...g', '.g.g.', '..s..', '.s.s.', 's...s'], { g: '#dfe6f5', s: COL.gold });
  SP.scissorsShut = PX.sprite(['..g..', '..g..', '..s..', '.s.s.', 's...s'], { g: '#dfe6f5', s: COL.gold });
  SP.basket = PX.sprite(['.bbbbbbbbb.', 'b.........b', 'kwkwkwkwkwk', 'wkwkwkwkwkw', 'kwkwkwkwkwk', '.kwkwkwkwk.'], { b: '#8a5a2a', k: '#7a4a24', w: '#a8703a' });
  SP.letter = PX.sprite(['qqqqqqqqqqqq', 'qllllllqqqqq', 'qqqqqqqqqqqq', 'qllllllllqqq', 'qqqqqqqqqqqq', 'qlllllllllqq', 'qqqqqqqqqqqq', 'qqqqqqqqqqqq', 'qqqqqqqqqqqq'], { q: COL.paper, l: '#a89aa8' });
  SP.quill = PX.sprite(['....w', '...ww', '..ww.', '.dw..', 'd....'], { w: COL.white, d: COL.ink2 });
  SP.inkwell = PX.sprite(['.g.', 'kgk', 'kkk'], { g: COL.grey, k: COL.ink2 });
  SP.purse = PX.sprite(['..tt..', '..gg..', '.gggg.', 'gggggg', 'ggyggg', 'gggggg', '.gggg.'], { t: COL.camellia, g: COL.gold, y: '#b8862a' });
  SP.purseEmpty = PX.sprite(['.t....', 'gggggg', 'g.gg.g'], { t: COL.camellia, g: '#b8862a' });
  SP.coin = PX.sprite(['.y.', 'ygg', '.g.'], { y: '#fff2a8', g: COL.gold });
  SP.candle = PX.sprite(['www', 'www', 'www', 'www', 'www', 'www'], { w: COL.paper });
  SP.flame = PX.sprite(['.y.', '.y.', 'yoy', 'owo', '.o.'], { y: '#fff2a8', o: COL.candle, w: COL.white });
  SP.hand = PX.sprite(['.ss.', 'ssss', 'ssss', '.ss.', '.ss.'], { s: sk });
  SP.portrait = PX.sprite(['ggggg', 'gdddg', 'gdsdg', 'gdwdg', 'gdddg', 'ggggg'], { g: COL.gold, d: d, s: sk, w: COL.white });
  SP.heart = PX.sprite(['.r.r.', 'rrrrr', 'rrrrr', '.rrr.', '..r..'], { r: COL.camellia });
  SP.petal = PX.sprite(['.w.', 'www', '.w.'], { w: COL.white });
}

// ---- music helpers ----
const BR = TUNES.brindisi.notes, BR_D = TUNES.brindisi.durs;         // Libiamo, 3/8, one game beat an eighth
const AD = TUNES.addio.notes, AD_D = TUNES.addio.durs;               // Addio, del passato
const sing = MG.sing, stingUp = MG.sting;
const kMaj = () => S.key(10, 'major'), kMin = () => S.key(10, 'minor');
const CHIME = ['1', '3', '5', '1+', '3+', '5+', '1++'];
const chime = (i, vol = 0.05) => S.voice('pulse', S.deg(CHIME[i % 7]) + 12, S.now(), 0.12, { vol });
const winSting = (t) => { CHIME.slice(0, 6).forEach((d, i) => S.voice('pulse', S.deg(d) + 12, t + i * 0.045, 0.1, { vol: 0.05 })); S.drum('hat', t, 0.14); };
const loseSting = (t) => { S.drum('kick', t, 0.3); S.voice('bass', S.deg('3'), t, 0.12, { vol: 0.16 }); S.voice('bass', S.deg('1') - 1, t + 0.13, 0.7, { vol: 0.18, grit: true }); };
// oom-pah-pah, laid over the game beats so the downbeat is every third beat, bar to bar
const waltz = (t, b, i, vol = 1) => {
  for (let k = 0; k < 4; k++) {
    const dn = (i * 4 + k) % 3 === 0;
    S.voice('bass', S.deg(dn ? '1-' : '5-'), t + k * b, b * 0.35, { vol: (dn ? 0.14 : 0.08) * vol });
    S.voice('arp', S.deg(dn ? '3' : '5'), t + k * b, b * 0.25, { vol: 0.05 * vol });
  }
};

// ---- the stage ----
const say = (text, x, y, colour = COL.ink) => MG.say(text, x, y, colour, COL.dark);
// a sprite with a one-pixel rim in one colour: the thing to look at
const glow = (s, x, y, col, a = 1, o = {}) => {
  const draw = s.idle ? CAST.draw : PX.draw;
  for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) draw(s, x + dx, y + dy, { ...o, color: c('#000000', a), add: c(col, 0) });
  draw(s, x, y, o);
};
// a puff of tinted squares (untextured particles): n of them from x, y at speed px per frame
const puff = (x, y, cols, n = 12, speed = 1.5, o = {}) => new ParticleEmitter(vec2(x, y), o.angle || 0, o.size ?? 2, 0.05, n * 20, o.cone ?? PI, o.tile,
  c(cols[0]), c(cols[1] || cols[0]), c(cols[0], o.keep ?? 0), c(cols[1] || cols[0], o.keep ?? 0),
  o.life ?? 0.8, o.s0 ?? 3, o.s1 ?? 2, speed, o.spin ?? 0.15, o.damp ?? 0.94, 1, o.g ?? 1, PI, 0.15, 0.5);
// petals: a slow fall of tinted petal tiles from above the room
const petals = (rate, life, cols) => new ParticleEmitter(vec2(128, 150), 0, vec2(260, 16), 0, rate, PI, SP.petal.tile,
  c(cols[0]), c(cols[1]), c(cols[0]), c(cols[1]), life, 3, 3, 0.1, 0.06, 0.96, 1, 0.9, PI, 0.1, 0.4);
// particles that reach the floor lie on it
const settle = (list) => { for (const e of list) for (const p of e.particles) if (p.pos.y < GROUND + 1) { p.pos.y = GROUND + 1; p.velocity.set(0, 0); p.angleVelocity = 0; } };
// the verdict, in the first frames of the outcome: a flash and a rising sting, or a shake and a low one
const verdict = (m) => { const t = m.v0 = S.now(); if (m.act.toy) S.arp('III', 1.2, 20, t, { vol: 0.05, octave: 1 }); else if (m.won) winSting(t); else loseSting(t); };
const verdictDraw = (m) => {
  const k = Math.min(1, 1 - (S.now() - m.v0) / 0.35);
  if (k > 0 && !m.act.toy) PX.rect(0, 0, PX.W, PX.H, m.won ? c(COL.white, 0.8 * k) : c('#000000', 0.55 * k));
};
const shake = (m) => { if (m.phase === OUTCOME && !m.won && S.now() - m.v0 < 0.4) setCameraPos(cameraPos.add(vec2(randInt(-2, 3), randInt(-2, 3)))); };
const out = (m) => m.phase === OUTCOME;
// an arm: a 2-pixel line of squares from a shoulder to a hand
const limb = (x0, y0, x1, y1, col) => { const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1); for (let i = 0; i <= n; i++) PX.rect(Math.round(x0 + (x1 - x0) * i / n), Math.round(y0 + (y1 - y0) * i / n), 2, 2, col); };
const box = (x, y, w, h, col) => { PX.rect(x, y, w, 1, col); PX.rect(x, y + h - 1, w, 1, col); PX.rect(x, y, 1, h, col); PX.rect(x + w - 1, y, 1, h, col); };
// a soft rounded glow
const halo = (x, y, w, h, col) => { PX.rect(x + 2, y, w - 4, 1, col); PX.rect(x + 2, y + h - 1, w - 4, 1, col); PX.rect(x + 1, y + 1, w - 2, 1, col); PX.rect(x + 1, y + h - 2, w - 2, 1, col); PX.rect(x, y + 2, w, h - 4, col); };
const hexOf = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const tmix = (a, b, k) => { const p = hexOf(a), q = hexOf(b); return '#' + p.map((v, i) => Math.round(v + (q[i] - v) * clamp(k)).toString(16).padStart(2, '0')).join(''); };
const hat = (x, y) => { PX.rect(x + 1, y + 21, 10, 2, c('#1c1c24')); PX.rect(x + 3, y + 22, 6, 6, c('#1c1c24')); PX.rect(x + 3, y + 23, 6, 1, c('#5a5a6a')); };   // Germont's top hat

const room = (wall, floorCol, px = 64, pw = 128) => {
  PX.rect(0, GROUND, 256, 120, c(wall));
  PX.rect(px, GROUND, pw, 70, c('#ffffff', 0.035));
  MG.floor(floorCol, COL.dim);
};
const chandelier = (x, y, t = 0) => {
  PX.rect(x - 1, y + 2, 2, 40, c('#8a6a2a'));
  PX.rect(x - 22, y - 6, 44, 20, c(COL.gold, 0.05));
  PX.rect(x - 16, y, 32, 2, c(COL.gold));
  for (let i = -16; i <= 16; i += 8) {
    PX.rect(x + i - 1, y + 2, 2, 4, c(COL.white));
    PX.rect(x + i - 1, y + 6, 2, 2, c('#fff2a8', 0.6 + 0.4 * Math.sin(t * 9 + i)));
    PX.rect(x + i, y - 3, 1, 3, c('#dfe6f5', 0.7));
  }
};
const salon = (t, o = {}) => {
  room(o.wall || '#240a14', o.floor || '#3d1020');
  for (let i = 0; i < 7; i++) PX.rect(8 + i * 40, GROUND + 1, 2, 110, c(o.panel || '#2e0e1a'));
  PX.rect(92, GROUND + 6, 72, 64, c('#2c1a32')); box(92, GROUND + 6, 72, 64, c(COL.gold, 0.7)); box(94, GROUND + 8, 68, 60, c(COL.gold, 0.25));   // the mirror
  PX.rect(100, GROUND + 14, 6, 44, c('#ffffff', 0.05));
  chandelier(128, 102, t);
};
const GX = [18, 36, 56, 194, 212, 232];
// the back row of guests: small, dark, swaying to the music; raised glasses; turned away when back is set
const guests = (m, xs = GX, o = {}) => xs.forEach((x, i) => {
  const k = i % 3, j = (Math.floor((m.beat || 0) / 2) + i) % 2;
  CAST.draw(SP[(o.back ? 'b' : 'g') + k], x, GROUND + 2 + (o.hop ? j : 0), { scale: 1, pose: 'idle', t: Math.max(0, m.t) + i });
  if (o.glass) PX.draw(SP.coupe, x + 5, GROUND + 9 + j, { scale: 1 });
});
const deathroom = (k = 0) => room(tmix('#140d24', '#3c1c34', k), tmix('#221638', '#54283c', k), 84, 96);
const bed = (x, k = 0) => {
  PX.rect(x, GROUND, 44, 8, c('#3a2656')); PX.rect(x, GROUND + 8, 44, 3, c(tmix(COL.violet, '#a04a6a', k)));
  PX.rect(x + 2, GROUND + 10, 10, 4, c(COL.pale)); PX.rect(x - 2, GROUND, 3, 18, c('#3a2656'));
};
const lying = (x, col, t) => CAST.draw(SP.vPale, x + 8, GROUND + 3, { angle: -PI / 2, color: col, pose: 'idle', t });
const sitting = (x, o = {}) => { CAST.draw(SP.vPale, x + 8, GROUND + 6, { pose: 'idle', ...o }); PX.rect(x, GROUND + 6, 44, 6, c(COL.violet)); PX.rect(x, GROUND + 11, 44, 1, c('#7a5aac')); };
const window_ = (x, moon) => { PX.rect(x, GROUND + 28, 24, 32, c('#0c1030')); box(x - 1, GROUND + 27, 26, 34, c('#4a3a6a')); PX.rect(x + 11, GROUND + 28, 2, 32, c('#4a3a6a')); if (moon) PX.rect(x, GROUND + 28, 24, 32, c('#9aa8ff', 0.25 * moon)); };
const nightstand = (x) => { PX.rect(x, GROUND, 20, 14, c('#2e2044')); PX.rect(x - 2, GROUND + 14, 24, 2, c('#4a3a6a')); };
// the candle on the nightstand; k is the flame's size (0 = out)
const candleAt = (x, k, lean = 0) => {
  PX.draw(SP.candle, x, GROUND + 16);
  if (k <= 0) { PX.rect(x + 2, GROUND + 28, 2, 2, c(COL.dark)); return; }
  halo(x - 12 + lean, GROUND + 26, 30, 34, c(COL.candle, 0.05 * k));
  halo(x - 8 + lean, GROUND + 29, 22, 26, c(COL.candle, 0.09 * k));
  halo(x - 4 + lean, GROUND + 31, 14, 18, c(COL.candle, 0.18 * k));
  PX.draw(SP.flame, x + 3 - 4.5 * k + lean, GROUND + 28, { scale: 3 * k });
};
const tick = (m, n) => Math.floor(m.t * n) !== Math.floor((m.t - timeDelta) * n);

const CX = 126, CY = GROUND + 28;          // where the two glasses meet
const BUSH = [];                           // the camellias on the hedge: x, y of each blossom
for (let i = 0; i < 13; i++) BUSH.push([116 + i * 10, GROUND + 6 + ((i * 7) % 4) * 7]);
const BASKET = [80, GROUND];

const ACTS = [
  // ---------------------------------------------------------------- 1 · the party (watch)
  { watch: true, bpm: 125, beats: 10,
    captions: [[0, "PARIS. A PARTY AT VIOLETTA'S."], [2.2, 'VIOLETTA IS FAMOUS, ADORED, AND ILL. ALFREDO LOVES HER.']],
    init(m) { m.cough = 0; },
    update(m) {
      if (m.t > 2.2) m.cut('mid', 104, GROUND + 26);
      if (m.t > 3.3 && !m.cough) { m.cough = 1; S.drum('breath', S.now(), 0.25); puff(140, GROUND + 22, ['#8a7a8a'], 4, 0.5, { life: 0.8, g: -0.2, s0: 2, s1: 3 }); }
    },
    render(m) {
      salon(m.t);
      guests(m, GX, { hop: true, glass: true });
      for (const x of [20, 224]) { CAST.draw(SP.g1, x, GROUND - 2, { pose: 'idle' }); PX.draw(SP.coupe, x + 11, GROUND + 22 + Math.round(MG.bounce() * 2)); }
      const ax = Math.min(72, -10 + m.t * 52);                       // Alfredo comes to the edge of the circle
      CAST.draw(SP.alfredo, ax, GROUND);
      CAST.draw(SP.violetta, 128, GROUND, { pose: 'hold', flip: false });
      PX.draw(SP.coupe, 138, GROUND + 22 + Math.round(MG.bounce() * 2));
      CAST.draw(SP.g2, 154, GROUND, { flip: true }); CAST.draw(SP.g0, 172, GROUND, { flip: true });
      if (ax >= 72 && m.t > 2.5) PX.draw(SP.heart, ax + 3, GROUND + 28 + Math.round(MG.bounce() * 2));
    },
    music: {
      curtain: (t) => { kMaj(); stingUp(t, 'I'); },
      bar: (t, b, i) => { kMaj(); waltz(t, b, i, 0.9); if (i === 0) sing('soprano', BR.slice(0, 8), BR_D.slice(0, 8), t, b, { vol: 0.11, light: 'lead' }); },
    },
  },
  // ---------------------------------------------------------------- 2 · TOAST (tap)
  // two glasses swing toward each other; a gold square closes on the meeting point; tap on the downbeat
  { command: 'TOAST!', instruction: 'TAP TO CLINK ON THE BEAT', verb: 'tap', bpm: 125, beats: 17, shot: 'mid', focus: () => [128, GROUND + 22],
    cue: () => [CX + 12, CY - 24],
    init(m) { m.clinks = 0; m.flash = 0; m.lastBar = -1; m.bits = []; },
    update(m) {
      const bar = Math.round(m.beat / 3), off = Math.abs(m.beat / 3 - bar) * 3;
      if (m.press) {
        if (off < 0.4 && bar !== m.lastBar && bar > 0) {
          m.lastBar = bar; m.clinks++; m.flash = 1;
          S.voice('arp', S.deg('1+') + 12, S.now(), 0.3, { vol: 0.08 }); S.voice('arp', S.deg('5+') + 12, S.now() + 0.05, 0.3, { vol: 0.06 });
          puff(CX, CY, [COL.gold, COL.white], 10, 1.2, { life: 0.5, g: 0.2 });
          if (m.clinks >= 3) m.win();
        } else { m.clinks = Math.max(0, m.clinks - 1); S.drum('breath', S.now(), 0.25); CAST.hit(SP.violetta); }
      }
      m.flash = Math.max(0, m.flash - timeDelta * 3);
    },
    onOutcome(m) {
      if (m.won) { m.bits.push(puff(CX, CY, [COL.gold, COL.white], 30, 1.8, { life: 1.6, keep: 1, g: 0.2 })); m.bits.push(puff(CX, CY, [COL.camellia, COL.gold], 18, 2.4, { life: 1.8, keep: 1, g: 0.5 })); }
      else m.bits.push(puff(CX + 12, CY - 6, [COL.gold], 16, 1, { angle: PI, cone: 0.6, life: 0.8, g: 1 }));
    },
    updateOutcome(m) {
      if (!m.won && m.t > 0.4 && !m.tink) { m.tink = 1; S.voice('arp', S.deg('5+') + 24, S.now(), 0.2, { vol: 0.07 }); S.voice('arp', S.deg('2+') + 24, S.now() + 0.06, 0.15, { vol: 0.05 }); }
      if (!m.won && m.t > 0.7 && !m.laugh) { m.laugh = 1; S.voice('soprano', S.deg('5+'), S.now(), 0.12, { vol: 0.07 }); S.voice('soprano', S.deg('5+') + 4, S.now() + 0.14, 0.12, { vol: 0.06 }); }
      if (m.t > 1.3 && !m.coughed) { m.coughed = 1; S.drum('breath', S.now(), 0.3); CAST.hit(SP.violetta); m.bits.push(puff(146, GROUND + 22, ['#8a7a8a'], 5, 0.5, { life: 1, g: -0.2, s0: 2, s1: 3 })); }
    },
    render(m) {
      shake(m);
      salon(m.t);
      guests(m, GX);
      const o = out(m), late = o && m.t > 1.2;
      const q = ((m.beat / 3) % 1 + 1) % 1;
      let sep = m.phase === ACTION ? Math.round(9 * Math.sin(PI * q)) : 0;
      if (late) sep = 9;
      const cough = o && m.t > 1.3;
      const lift = m.flash > 0 ? 2 : 0, gy = late ? CY - 16 : CY - 8 + lift;
      // a loss: her glass drops, breaks on the floor, and she is handed another
      const ft = Math.max(0, m.t - 0.15), dropped = o && !m.won && m.t < 1.2, gfall = CY - 8 - 300 * ft * ft;
      const ax = late ? lerp(96, 122, clamp((m.t - 1.2) / 0.5)) : 96;
      if (!late) {
        limb(106, GROUND + 11, CX - 7 - sep, gy, c(COL.suit));
        limb(146, GROUND + 11, CX + sep + 5, dropped ? CY - 8 - Math.min(1, ft / 0.3) * 10 : gy, c(COL.pale));
      }
      CAST.draw(SP.alfredo, ax, GROUND, { flip: false });
      CAST.draw(SP.violetta, 146, GROUND - (cough && m.t < 1.6 ? 1 : 0), { flip: true, pose: cough ? 'hold' : 0 });
      PX.draw(SP.coupe, late ? ax + 10 : CX - 10 - sep, late ? GROUND + 10 : gy);
      if (dropped && gfall <= GROUND) PX.draw(SP.broken, CX + sep + 2, GROUND + 1, { color: c(COL.white, clamp((1.2 - m.t) * 5)) });
      else if (late) PX.draw(SP.coupe, 156, GROUND + 6);
      else if (!dropped || gfall > GROUND) PX.draw(SP.coupe, CX + sep, dropped ? gfall : gy, { angle: dropped ? 0.5 + ft * 8 : 0 });
      if (m.phase === ACTION) {
        const s = Math.round(8 + 40 * (1 - q)), near = q > 0.85 || q < 0.1;
        box(CX - s / 2, CY - s / 2, s, s, c(COL.gold, 0.35 + 0.65 * q));
        box(CX - 5, CY - 5, 10, 10, c(near ? COL.white : COL.gold, near ? 1 : 0.6));
        for (let i = 0; i < 3; i++) PX.draw(SP.heart, 110 + i * 12, GROUND + 52, { color: i < m.clinks ? WHITE : c('#5a2a3a') });
      }
      if (m.flash > 0) PX.rect(CX - 2, CY - 2, 4, 4, c(COL.white, m.flash));
      if (late) { limb(ax + 8, GROUND + 12, 144, GROUND + 14, c(COL.suit)); }   // his hand on her arm
      if (cough && m.t < 2.6) say('KOFF', 158, GROUND + 30, COL.grey);
      if (!m.won && o && m.t > 0.7 && m.t < 1.6) say('HA HA!', 152, GROUND + 40, COL.ink);
    },
    renderOutcome: verdictDraw,
    outcome: (m) => [m.won ? 'THREE CLINKS. SHE COUGHS. SHE LAUGHS IT OFF.' : 'A GLASS BREAKS. SHE COUGHS. SHE LAUGHS IT OFF.', 'SHE LEAVES PARIS TO LIVE WITH ALFREDO.'],
    music: {
      curtain: (t, b) => { kMaj(); stingUp(t, 'I'); },
      bar: (t, b, i) => { kMaj(); waltz(t, b, i); if (i === 0) sing('soprano', BR.slice(0, 17), BR_D.slice(0, 17), t, b, { vol: 0.11, light: 'lead' }); },
      outcome: (t, b, won) => { kMaj(); if (won) { sing('tenor', ['5', '6', '5', '1+'], [0.5, 0.5, 0.5, 1.5], t, b, { vol: 0.13 }); S.drum('crowd', t + b, 0.15); } else { S.drum('breath', t, 0.3); S.voice('bass', S.deg('1-'), t + 0.4, 1.2, { vol: 0.14, grit: true }); } },
    },
  },
  // ---------------------------------------------------------------- 3 · SNIP (toy, drag)
  // the country: drag the scissors along the hedge; every camellia met drops into the basket with a note
  { toy: true, verb: 'drag', bpm: 120, beats: 19, shot: 'wide', outcomeSeconds: 3.5,
    cue: (m) => [m.x + 12, GROUND + 28],
    init(m) {
      m.x = 100; m.sy = GROUND + 14; m.at = BUSH.map(() => 0); m.fly = []; m.n = 0; m.snip = 0; m.k = 0; m.bits = [];
      m.bits.push(petals(5, 8, [COL.camellia, '#ffd0da']));
      m.bits.push(petals(3, 8, [COL.white, '#ffe6ee']));
    },
    update(m) {
      settle(m.bits);
      MG.drag(m, 'x', 100, 8, 236, 10);
      if (m.down) m.sy += (clamp(m.py - 8, GROUND + 2, GROUND + 30) - m.sy) * 0.3;
      m.snip = Math.max(0, m.snip - timeDelta);
      BUSH.forEach(([bx, by], i) => {
        if (m.t >= m.at[i] && Math.abs(m.x + 5 - bx - 5) < 8 && Math.abs(m.sy + 9 - by - 5) < 10) {
          m.at[i] = m.t + 5; m.snip = 0.12; m.fly.push({ x: bx, y: by, t: m.t, i });
          S.drum('hat', S.now(), 0.1);
          puff(bx + 5, by + 5, i % 2 ? [COL.white, '#ffd0da'] : [COL.camellia, '#ffd0da'], 6, 0.8, { life: 0.5, g: 0.3 });
        }
      });
      m.fly = m.fly.filter((f) => {
        if (m.t - f.t < 0.7) return true;
        m.n++; S.voice('arp', S.deg(['1', '2', '3', '5', '6', '1+', '2+', '3+'][m.k++ % 8]) + 12, S.now(), 0.28, { vol: 0.07 });
        return false;
      });
    },
    updateOutcome(m) { settle(m.bits); },
    render(m) {
      room('#0e1a14', '#1a3322');
      PX.rect(0, GROUND, 256, 50, c('#122a20'));
      // the hedge, with a gate in it
      PX.rect(108, GROUND, 136, 34, c('#1f4a2a'));
      for (let i = 0; i < 40; i++) PX.rect(110 + (i * 37) % 132, GROUND + 2 + (i * 11) % 30, 3, 2, c(i % 2 ? '#2a6a38' : '#16381e'));
      PX.rect(58, GROUND, 3, 34, c('#6a5a4a')); PX.rect(72, GROUND, 3, 34, c('#6a5a4a')); PX.rect(58, GROUND + 32, 17, 2, c('#6a5a4a'));
      CAST.draw(SP.alfredo, 10, GROUND, { flip: false });
      CAST.draw(SP.vCountry, 34, GROUND);
      BUSH.forEach(([bx, by], i) => {
        if (m.t >= m.at[i]) PX.draw(i % 2 ? SP.camelliaW : SP.camellia, bx, by);
        else if (m.t - (m.at[i] - 5) > 3.6) PX.draw(SP.bud, bx + 2, by + 2);
      });
      PX.draw(SP.basket, BASKET[0], BASKET[1]);
      for (let i = 0; i < Math.min(m.n, 12); i++) PX.draw(i % 2 ? SP.camelliaW : SP.camellia, BASKET[0] + 3 + (i % 4) * 4, BASKET[1] + 6 + Math.floor(i / 4) * 3, { scale: 1 });
      for (const f of m.fly) {
        const k = clamp((m.t - f.t) / 0.7);
        PX.draw(f.i % 2 ? SP.camelliaW : SP.camellia, lerp(f.x, BASKET[0] + 8, k), lerp(f.y, BASKET[1] + 10, k) + Math.sin(k * PI) * 16);
      }
      PX.draw(m.snip > 0 ? SP.scissorsShut : SP.scissors, m.x, m.sy + (m.snip > 0 ? -1 : 0));
      const bt = m.t + 3;
      PX.draw(SP.bee, 150 + Math.sin(bt * 1.3) * 60, GROUND + 46 + Math.sin(bt * 3.1) * 6, { flip: Math.cos(bt * 1.3) < 0 });
    },
    outcome: () => ['HAPPY MONTHS IN THE COUNTRY.'],
    music: {
      curtain: (t, b) => { kMaj(); S.setRoom(3000, 0.5, 1, t); S.arp('I', 3 * b, 25, t, { vol: 0.06, octave: 1 }); },
      bar: (t, b, i) => { kMaj(); for (let k = 0; k < 4; k++) S.arp(['I', 'vi', 'IV', 'V'][k], b * 0.9, 25, t + k * b, { vol: 0.05, octave: 1, light: k ? null : 'lead' }); if (i % 2 === 0) sing('tenor', BR.slice(0, 8), BR_D.slice(0, 8), t, b * 0.8, { vol: 0.09, vibrato: 6 }); },
      outcome: (t, b) => { kMaj(); S.arp('I', 3 * b, 25, t, { vol: 0.05, octave: 1 }); },
    },
  },
  // ---------------------------------------------------------------- 4 · a man in grey (watch)
  { watch: true, bpm: 120, beats: 16,
    captions: [[0, "ALFREDO'S FATHER, GERMONT."], [2.6, "THE SCANDAL WILL RUIN HIS DAUGHTER'S WEDDING."], [5.2, 'HE ASKS VIOLETTA TO LEAVE ALFREDO. FOR GOOD.']],
    update(m) { if (m.t > 1.6) m.cut('mid', 150, GROUND + 26); },
    render(m) {
      room('#0e1a14', '#1a3322');
      PX.rect(0, GROUND, 256, 50, c('#122a20'));
      PX.rect(0, GROUND, 150, 34, c('#1f4a2a')); PX.rect(196, GROUND, 60, 34, c('#1f4a2a'));
      PX.rect(150, GROUND, 4, 40, c('#6a5a4a')); PX.rect(192, GROUND, 4, 40, c('#6a5a4a')); PX.rect(150, GROUND + 38, 46, 3, c('#6a5a4a'));
      for (let i = 0; i < 6; i++) PX.rect(157 + i * 6, GROUND, 1, 30, c('#6a5a4a'));
      const gx = Math.max(200, 262 - Math.max(0, m.t - 0.2) * 40);        // he walks up, and stops at the gate, still
      CAST.draw(SP.germont, gx, GROUND, { flip: true }); hat(gx, GROUND);
      const set = m.t > 3.4;                                              // she sets the basket down
      CAST.draw(SP.vCountry, 104, GROUND, { pose: set && m.t < 4.4 ? 'kneel' : m.t < 3.4 ? 'hold' : 0, flip: m.t > 3 });
      if (m.t < 3.4) PX.draw(SP.basket, 116, GROUND + 22, { scale: 1 });
      else PX.draw(SP.basket, 120, GROUND, { scale: 1.5 });
      if (m.t > 2.4 && m.t < 3.6) PX.draw(SP.heart, 108, GROUND + 30 + Math.round(MG.bounce() * 2), { color: c('#5a5a6a') });
    },
    music: {
      curtain: (t, b) => { kMaj(); S.arp('I', 2 * b, 25, t, { vol: 0.05, octave: 1 }); },
      bar: (t, b, i) => { kMin(); S.setRoom(700, 0.55, 1, t); S.voice('bass', S.deg('1-'), t, 4 * b, { vol: 0.11, grit: 0.4 }); if (i === 1) S.voice('bass', S.deg('2b-'), t + 2 * b, 2 * b, { vol: 0.1 }); if (i === 2) S.drone(S.deg('1-'), t, 4 * b, { tritone: true, vol: 0.04 }); },
    },
  },
  // ---------------------------------------------------------------- 5 · RENOUNCE (hold)
  // the letter on the desk, its outline pulsing; hold and the signature draws itself; let go and the ink runs back
  { command: 'RENOUNCE!', instruction: 'HOLD TO SIGN THE LETTER', verb: 'hold', bpm: 110, beats: 15, shot: 'mid', focus: () => [128, GROUND + 22],
    cue: () => [124, GROUND + 6],
    init(m) { m.sign = 0; m.scr = 0; m.sealed = 0; m.bits = []; },
    update(m) {
      if (m.hold) { m.sign = Math.min(1, m.sign + timeDelta / 4.4); m.scr += timeDelta; if (m.scr > 0.09) { m.scr = 0; S.drum('hat', S.now(), 0.05); } }
      else m.sign = Math.max(0, m.sign - timeDelta / 2);
      if (m.sign >= 1) m.win();
    },
    onOutcome(m) { if (m.won) m.bits.push(puff(134, GROUND + 22, [COL.gold, COL.white], 14, 1.2, { life: 0.9, g: 0.4 })); },
    updateOutcome(m) {
      if (!m.won && m.sign < 1 && m.t > 0.4) { m.sign = Math.min(1, m.sign + timeDelta * 1.5); m.scr += timeDelta; if (m.scr > 0.08) { m.scr = 0; S.drum('hat', S.now(), 0.05); } }
      if (m.sign >= 1 && !m.sealed) { m.sealed = 1; S.drum('kick', S.now(), 0.12); m.bits.push(puff(146, GROUND + 22, [COL.camellia, COL.gold], 10, 1, { life: 0.6, g: 0.5 })); }
    },
    render(m) {
      shake(m);
      room('#15121f', '#261f33', 80, 96);
      PX.rect(92, GROUND, 72, 12, c('#3a2418')); PX.rect(90, GROUND + 12, 76, 3, c('#7a5238'));
      const o = out(m);
      // the letter and its outline
      PX.rect(100, GROUND + 15, 56, 34, c(COL.paper));
      for (const [y, w] of [[41, 40], [36, 44], [31, 32]]) PX.rect(106, GROUND + y, w, 2, c('#a89aa8'));
      if (m.phase === ACTION) box(98, GROUND + 13, 60, 38, c(COL.gold, m.hold ? 0.3 : 0.4 + 0.6 * MG.bounce()));
      const n = Math.round(40 * m.sign), sy = (i) => GROUND + 20 + Math.round(3 + 3 * Math.sin(i * 0.5) * Math.cos(i * 0.11));
      for (let i = 0; i < n; i++) PX.rect(106 + i, sy(i), 2, 2, c(COL.ink2));
      PX.draw(SP.inkwell, 148, GROUND + 15);
      if (m.sealed) PX.rect(146, GROUND + 18, 6, 6, c(COL.camellia));
      // Germont steps in and signs for her on a loss; either way he leaves once it is done
      const base = m.won || !o ? 176 : lerp(176, 152, clamp(m.t / 0.4));
      const gx = base + Math.max(0, m.t - (o ? (m.won ? 1.4 : 2.4) : 99)) * 100;
      CAST.draw(SP.violetta, 78, GROUND, { pose: 0 });
      if (gx < 250) { CAST.draw(SP.germont, gx, GROUND, { flip: true }); hat(gx, GROUND); }
      const tip = [106 + n, sy(n) - 1];
      const jit = m.hold && m.phase === ACTION ? randInt(0, 2) : 0;
      if (m.sealed && m.t > 0.5) { PX.draw(SP.quill, 149, GROUND + 19); }
      else { PX.draw(SP.quill, tip[0], tip[1] + jit); limb(m.won || !o ? 92 : gx + 2, m.won || !o ? GROUND + 14 : GROUND + 14, tip[0] + 4, tip[1] + 4, c(m.won || !o ? COL.pale : COL.grey)); }
      if (m.phase === ACTION && m.t > 1.2) say('FOR MY DAUGHTER', 152, GROUND + 34, COL.grey);
    },
    renderOutcome: verdictDraw,
    outcome: (m) => [m.won ? 'SHE SIGNS IT.' : 'HER HAND SHAKES. GERMONT SIGNS FOR HER.', 'SHE WILL LEAVE ALFREDO. SHE CANNOT TELL HIM WHY.'],
    music: {
      curtain: (t, b) => { kMin(); S.setRoom(700, 0.55, 1, t); S.drum('kick', t, 0.16); S.voice('bass', S.deg('1-'), t, 3 * b, { vol: 0.13 }); },
      bar: (t, b) => { kMin(); for (let k = 0; k < 4; k++) { S.drum('kick', t + k * b, 0.1); S.voice('bass', S.deg(k % 2 ? '2b-' : '1-'), t + k * b, b * 0.8, { vol: 0.12 }); } sing('tenor', ['3', '3', '2', '1', '7-', '1'], [0.5, 0.5, 0.5, 0.5, 1, 1], t, b, { vol: 0.11, vibrato: 4, light: 'lead' }); },   // filler in the key: Pura siccome un angelo is not verified
      outcome: (t, b, won) => { kMin(); S.setRoom(2400, 0.45, 2, t); if (won) sing('soprano', ['5', '3', '2', '1'], [0.5, 0.5, 0.5, 2], t, b, { vol: 0.14 }); else S.voice('bass', S.deg('1-'), t, 2.5, { vol: 0.15, grit: true }); },
    },
  },
  // ---------------------------------------------------------------- 6 · Flora's party (watch)
  { watch: true, bpm: 120, beats: 16,
    captions: [[0, "PARIS. FLORA'S PARTY."], [2.2, 'ALFREDO THINKS SHE LEFT HIM FOR THE BARON.'], [5, 'HE WINS AT CARDS. HE WANTS TO PAY HER BACK.']],
    update(m) { if (m.t > 5) m.cut('mid', 110, GROUND + 24); },
    render(m) {
      salon(m.t, { wall: '#0e1e2e', floor: '#1a3a3a', panel: '#142838' });
      guests(m, [16, 34, 52, 230], { hop: true });
      PX.rect(96, GROUND, 60, 12, c('#1a0c14')); PX.rect(94, GROUND + 11, 64, 3, c(COL.green));
      const n = Math.min(15, Math.floor(m.t * 3));                                 // the winnings stack up
      for (let i = 0; i < n; i++) PX.draw(SP.coin, 100 + (i % 5) * 9, GROUND + 14 + Math.floor(i / 5) * 3, { scale: 2 });
      const scoop = Math.floor(m.beat) % 2 === 0;
      CAST.draw(SP.alfredo, 78, GROUND, { pose: scoop ? 'hold' : 0 });
      if (m.t > 5) { PX.draw(SP.heart, 82, GROUND + 30, { color: c('#5a2a3a') }); }
      // the Baron brings her in on his arm; she looks the other way
      const bx = Math.max(184, 260 - m.t * 22);
      CAST.draw(SP.baron, bx, GROUND, { flip: true });
      CAST.draw(SP.violetta, bx + 14, GROUND, { flip: false });
      limb(bx + 4, GROUND + 12, bx + 16, GROUND + 12, c('#2a1a32'));
    },
    music: {
      curtain: (t) => { kMin(); stingUp(t, 'i'); },
      bar: (t, b, i) => { kMin(); S.setRoom(2000, 0.4, 1, t); for (let k = 0; k < 8; k++) S.voice('pulse', S.deg(['1', '.', '3', '1', '5', '.', '4', '3'][k]), t + k * b / 2, b / 4, { vol: 0.08, light: k % 2 ? null : 'lead' }); for (let k = 0; k < 4; k++) S.voice('bass', S.deg(k % 2 ? '5-' : '1-'), t + k * b, b * 0.3, { vol: 0.1 }); },   // a gambling figure in the key: filler
    },
  },
  // ---------------------------------------------------------------- 7 · FLING (mash)
  // a purse held high; each tap a coin, arcing to her feet; twelve coins
  { command: 'FLING!', instruction: 'TAP TAP TAP TO THROW THE COINS', verb: 'mash', bpm: 160, beats: 19, shot: 'mid', focus: () => [128, GROUND + 22],
    cue: () => [100, GROUND + 22],
    init(m) { m.thrown = 0; m.landed = 0; m.coins = []; m.pile = []; m.arm = 0; m.bits = []; },
    fly(m) {
      m.arm = Math.max(0, m.arm - timeDelta);
      m.coins = m.coins.filter((k) => {
        if (k.roll) { k.x += k.vx * timeDelta; if (k.x < k.tx) return true; }
        else { k.x += k.vx * timeDelta; k.vy -= 500 * timeDelta; k.y += k.vy * timeDelta; if (k.y > GROUND || k.vy > 0) return true; }
        m.landed++; m.pile.push([k.tx, GROUND + (m.landed % 3) * 2]); S.voice('arp', S.deg('5+') + 12, S.now(), 0.08, { vol: 0.04 });
        return false;
      });
    },
    update(m) {
      if (m.press && m.thrown < 12) {
        const tx = 150 + (m.thrown * 7) % 30, T = 0.7;
        m.coins.push({ x: 88, y: GROUND + 36, vx: (tx - 88) / T, vy: (GROUND - GROUND - 36 + 0.5 * 500 * T * T) / T, tx });
        m.thrown++; m.arm = 0.15; S.drum('hat', S.now(), 0.12);
        if (m.thrown >= 12) m.win();
      }
      m.act.fly(m);
    },
    onOutcome(m) {
      if (m.won) { m.bits.push(puff(164, GROUND + 30, [COL.gold, '#fff2a8'], 16, 0.8, { life: 1, g: 0.6 })); S.drum('crowd', S.now() + 0.1, 0.2); }
      else { S.drum('thunder', S.now() + 0.2, 0.12); m.split = 0; }
    },
    updateOutcome(m) {
      if (!m.won && !m.split && m.t > 0.3) {                 // the purse drops, splits, and the rest of the gold rolls to her anyway
        m.split = 1; m.bits.push(puff(90, GROUND + 4, [COL.gold], 14, 1.2, { life: 0.6, g: 1 }));
        for (let i = m.thrown; i < 12; i++) m.coins.push({ x: 90 + i, y: GROUND, vx: 150 + i * 14, roll: 1, tx: 150 + (i * 7) % 30 });
        m.thrown = 12;
      }
      m.act.fly(m);
    },
    render(m) {
      shake(m);
      salon(m.t, { wall: '#0e1e2e', floor: '#1a3a3a', panel: '#142838' });
      const o = out(m), turned = o && m.t > 0.9;
      guests(m, [16, 34, 52, 232], { back: turned });
      const empty = m.thrown >= 12, purseUp = m.won || !o || m.t < 0.3 ? !(o && m.t > 0.8) : false;
      CAST.draw(SP.alfredo, 76, GROUND, { pose: purseUp ? 'hold' : 0 });
      if (purseUp) PX.draw(empty ? SP.purseEmpty : SP.purse, 84 + (m.arm > 0 ? 4 : 0), GROUND + 24 - (m.arm > 0 ? 2 : 0));
      else PX.draw(SP.purseEmpty, 92, GROUND);
      CAST.draw(SP.baron, 196, GROUND, { flip: true });
      CAST.draw(SP.violetta, 168, GROUND, { flip: true });
      for (const [x, y] of m.pile) PX.draw(SP.coin, x, y);
      for (const k of m.coins) PX.draw(SP.coin, k.x, k.y);
      if (m.phase === ACTION) for (let i = 0; i < 12; i++) PX.rect(96 + i * 5, GROUND + 56, 3, 3, i < m.thrown ? c(COL.gold) : c('#5a4a2a'));
      if (o && m.t > 0.2 && m.t < 1.3) say('OH!', 132, GROUND + 34, COL.ink);
      if (o && m.t > 2.4) { CAST.draw(SP.germont, 226, GROUND, { flip: true }); hat(226, GROUND); }   // his father arrives
    },
    renderOutcome: verdictDraw,
    outcome: (m) => [m.won ? 'EVERY COIN LANDS. PARIS GASPS.' : 'THE PURSE SPLITS. THE GOLD ROLLS TO HER FEET.', 'HE SHAMES HER. HIS FATHER ARRIVES AND SHAMES HIM.'],
    music: {
      curtain: (t, b) => { kMin(); stingUp(t, 'i'); S.setRoom(2000, 0.4, 1, t); },
      bar: (t, b) => { kMin(); for (let k = 0; k < 8; k++) S.voice('pulse', S.deg(['1', '.', '3', '1', '5', '.', '4', '3'][k]), t + k * b / 2, b / 4, { vol: 0.09, light: k % 2 ? null : 'lead' }); for (let k = 0; k < 4; k++) { S.drum(k % 2 ? 'snare' : 'kick', t + k * b, 0.15); S.voice('bass', S.deg(k % 2 ? '5-' : '1-'), t + k * b + b / 2, b * 0.3, { vol: 0.12 }); } },
      outcome: (t, b, won) => { kMin(); S.drum('snare', t, 0.25); S.drum('crowd', t + 0.2, 0.2); sing('bass', ['1-', '7--', '6b--'], [0.5, 0.5, 2], t, b, { vol: 0.16 }); if (won) S.voice('soprano', S.deg('3+'), t + b, 1.5 * b, { vol: 0.11 }); },
    },
  },
  // ---------------------------------------------------------------- 8 · the sickroom (watch)
  { watch: true, bpm: 120, beats: 10,
    captions: [[0, 'MONTHS LATER. VIOLETTA IS DYING.'], [2, 'A LETTER FROM GERMONT. SHE READS IT AGAIN.']],
    init(m) { m.bits = [puff(200, 106, [COL.snow, '#9aa8d8'], 2, 0.3, { size: vec2(20, 1), life: 3, keep: 1, g: 0.1, s0: 2, s1: 2 })]; },
    update(m) { if (m.t > 2) m.cut('mid', 126, GROUND + 22); },
    render(m) {
      deathroom();
      window_(190, 0.5);
      bed(92); nightstand(138); candleAt(143, 0.6 + 0.2 * Math.sin(m.t * 9));
      if (m.t < 3.2) { lying(92, WHITE, Math.max(0, m.t)); PX.rect(94, GROUND + 6, 44, 4, c(COL.violet)); PX.draw(SP.letter, 116, GROUND + 10, { scale: 1 }); }
      else { sitting(92, { t: Math.max(0, m.t) }); PX.draw(SP.letter, 116, GROUND + 14, { scale: 1 }); }
    },
    music: {
      curtain: (t, b) => { kMin(); S.setRoom(500, 0.6, 1, t); S.drum('heartbeat', t, 0.14, 'heart'); },
      bar: (t, b, i) => { kMin(); S.setRoom(500, 0.6, 1, t); S.drum('heartbeat', t, 0.1, 'heart'); S.drum('heartbeat', t + 2 * b, 0.08, 'heart'); if (i === 0) sing('soprano', AD.slice(0, 14), AD_D.slice(0, 14), t, b * 0.8, { vol: 0.08, light: 'lead' }); },
    },
  },
  // ---------------------------------------------------------------- 9 · READ (hold)
  // draughts blow at the candle; hold and her hand cups the flame; let go and the letter's lines light as she reads
  { command: 'READ!', instruction: 'HOLD TO SHIELD THE FLAME', verb: 'hold', bpm: 100, beats: 13, shot: 'mid', focus: () => [130, GROUND + 22],
    cue: () => [152, GROUND + 34],
    GUSTS: [[1.4, 2.6], [3.6, 4.8], [5.6, 6.8]],
    init(m) { m.read = 0; m.flame = 1; m.gust = 0; m.streak = 0; m.blocked = 0; m.late = 0; m.bits = []; },
    update(m) {
      const g = m.act.GUSTS.find(([a, b]) => m.t >= a && m.t < b);
      m.gust = g ? 1 : 0; m.warn = m.act.GUSTS.some(([a]) => m.t >= a - 0.7 && m.t < a);
      m.blocked = m.gust && m.hold;
      if (m.gust && !m.blocked) m.flame = Math.max(0, m.flame - timeDelta * 0.7); else m.flame = Math.min(1, m.flame + timeDelta * 0.3);
      if (m.gust && tick(m, 5)) S.drum('breath', S.now(), 0.06);
      if (!m.hold && m.flame > 0) m.read = Math.min(1, m.read + timeDelta / 3.4);
      if (m.hold && !m.gust && m.t > 2 && !m.late) m.late = m.t;
      if (m.flame <= 0) m.lose();
      if (m.read >= 1) m.win();
    },
    onOutcome(m) { m.relit = 0; m.read = m.won ? 1 : m.read; m.bits.push(puff(146, GROUND + 34, m.won ? [COL.gold, '#fff2a8'] : ['#6a6a7a', '#3a3a4a'], 10, 0.5, { life: 1.6, g: m.won ? 0 : -0.2 })); },
    updateOutcome(m) { if (!m.won && m.t > 1.5 && !m.relit) { m.relit = 1; S.drum('hat', S.now(), 0.1); S.voice('arp', S.deg('5') + 12, S.now(), 0.3, { vol: 0.05 }); } },
    render(m) {
      shake(m);
      const o = out(m);
      deathroom();
      const lit = o ? m.won || m.relit : m.flame > 0;
      window_(190, o && !m.won && !m.relit ? 0.9 : 0.4);
      bed(92); nightstand(138);
      sitting(92, { pose: o ? 'hold' : 0 });
      // the letter in her lap: its lines light as she reads
      const lines = [[8, 26], [13, 22], [18, 26], [23, 18]];
      PX.rect(112, GROUND + 12, 30, 28, c(COL.paper));
      lines.forEach(([y, w], i) => PX.rect(115, GROUND + 12 + y, w, 2, m.read > (i + 0.5) / 4 || (o && m.won) ? c(COL.candle) : c('#a89aa8')));
      const lean = m.gust && !m.blocked && lit ? -3 : 0;
      candleAt(143, lit ? (o ? (m.won ? 1.2 : 0.6) : 0.4 + 0.6 * m.flame) : 0, lean);
      // her hand: resting, or cupped round the flame while held
      const cup = m.phase === ACTION && m.hold;
      const hx = cup ? 154 : 128, hy = cup ? GROUND + 28 : GROUND + 16;
      if (m.phase === ACTION) { limb(124, GROUND + 14, hx + 1, hy + 2, c(COL.pale)); PX.draw(SP.hand, hx, hy); }
      if (m.phase === ACTION && m.gust) {
        for (let i = 0; i < 6; i++) {
          const p = ((m.t * 2.4) + i / 6) % 1, x0 = 190, stop = m.blocked ? 158 : 148;
          PX.rect(Math.round(x0 - p * (x0 - stop)) - 5, GROUND + 26 + (i % 3) * 5, 10, 2, c(COL.snow, 0.9));
        }
        if (m.blocked && tick(m, 8)) puff(160, GROUND + 32, [COL.snow], 2, 0.6, { life: 0.3, g: 0 });
      } else if (m.phase === ACTION && m.warn && Math.floor(m.t * 8) % 2) for (let i = 0; i < 3; i++) PX.rect(180, GROUND + 26 + i * 5, 10, 2, c(COL.snow, 0.7));
      if (m.phase === ACTION && m.late && m.t - m.late > 1.2 && m.hold && !m.gust) say('LET GO TO READ', 100, GROUND + 50, COL.gold);
      if (o && m.t > 1.7) say('È TARDI !', 122, GROUND + 46, COL.ink);
    },
    renderOutcome: verdictDraw,
    outcome: (m) => [m.won ? 'SHE READS IT TO THE END.' : 'THE CANDLE DIES. SHE KNOWS IT BY HEART.', 'GERMONT HAS TOLD ALFREDO THE TRUTH. HE IS COMING.'],
    music: {
      curtain: (t, b) => { kMin(); S.setRoom(500, 0.6, 1, t); S.drum('heartbeat', t, 0.14, 'heart'); },
      bar: (t, b, i) => { kMin(); S.drum('heartbeat', t, 0.12, 'heart'); S.drum('heartbeat', t + 2 * b, 0.1, 'heart'); if (i % 2 === 0) sing('soprano', AD.slice(0, 14), AD_D.slice(0, 14), t, b * 0.8, { vol: 0.09, light: 'lead' }); },
      outcome: (t, b, won) => { kMin(); S.drum('heartbeat', t + b, 0.1); if (won) sing('soprano', ['5', '6', '5'], [0.5, 0.5, 2.5], t, b, { vol: 0.12 }); else S.voice('bass', S.deg('1-'), t, 2.5, { vol: 0.12 }); },
    },
  },
  // ---------------------------------------------------------------- 10 · Alfredo (watch)
  { watch: true, bpm: 120, beats: 14,
    captions: [[0.2, 'ALFREDO. THEY WILL LEAVE PARIS TOGETHER, HE SAYS.'], [3.8, 'SHE FEELS STRONG AGAIN. FOR A MOMENT.']],
    init(m) { m.bits = []; m.hug = 0; },
    update(m) {
      if (m.t > 3.2) m.cut('mid', 126, GROUND + 22);
      if (m.t > 3.4 && !m.hug) { m.hug = 1; S.arp('I', 2, 25, S.now(), { vol: 0.06, octave: 1 }); m.bits.push(puff(126, GROUND + 26, [COL.gold, COL.pale], 12, 0.7, { life: 1.4, g: -0.1 })); }
    },
    render(m) {
      const warm = clamp((m.t - 2.6) / 1.4);                              // colour comes back into the room
      deathroom(warm);
      window_(190, 0.3 * (1 - warm));
      PX.rect(216, GROUND, 24, 50, c(tmix('#241838', '#f0d890', clamp(m.t / 0.6)))); box(215, GROUND, 26, 51, c('#4a3a6a'));   // the door, flung open
      bed(92, warm); nightstand(138); candleAt(143, 0.6);
      const ax = Math.max(m.hug ? 126 : 132, 236 - Math.max(0, m.t - 0.5) * 64);
      const up = m.t > 1.2;
      if (up) sitting(92); else { lying(92, WHITE, Math.max(0, m.t)); PX.rect(94, GROUND + 6, 44, 4, c(COL.violet)); }
      if (m.t > 0.5) CAST.draw(SP.alfredo, ax, GROUND, { flip: true });
      if (m.hug) { limb(130, GROUND + 14, 120, GROUND + 16, c(COL.suit)); limb(118, GROUND + 16, 128, GROUND + 18, c(COL.pale)); PX.draw(SP.heart, 118, GROUND + 34 + Math.round(MG.bounce() * 3)); }
    },
    music: {
      curtain: (t, b) => { kMaj(); S.setRoom(1600, 0.5, 1, t); },
      bar: (t, b, i) => { kMaj(); S.setRoom(2400, 0.5, 2, t); S.arp(['i', 'VI', 'III', 'V'][i % 4], 3.8 * b, 25, t, { vol: 0.06, octave: 1 }); for (let k = 0; k < 2; k++) S.voice('bass', S.deg(k ? '5-' : '1-'), t + 2 * k * b, 2 * b * 0.9, { vol: 0.1 }); if (i === 1) sing('soprano', BR.slice(0, 8), BR_D.slice(0, 8), t, b * 1.3, { vol: 0.09 }); },   // the Brindisi bass under it, slow
    },
  },
  // ---------------------------------------------------------------- 11 · GIVE (drag)
  // she holds out her portrait; Alfredo's open hand bobs a little way off; slide it across
  { command: 'GIVE!', instruction: 'DRAG THE PORTRAIT TO HIS HAND', verb: 'drag', bpm: 140, beats: 14, shot: 'mid', focus: () => [136, GROUND + 22], outcomeSeconds: 3,
    cue: (m) => [m.x + 2, GROUND + 38],
    init(m) { m.x = 122; m.on = 0; m.bits = []; m.rel = 0; },
    hand(m) { return [152 + Math.round(5 * Math.sin(m.t * 2.6)), GROUND + 18 + Math.round(MG.bounce() * 3)]; },
    update(m) {
      MG.drag(m, 'x', 70, 118, 158, 10);
      const [hx] = m.act.hand(m);
      m.on = Math.abs(m.x + 5 - (hx + 4)) < 6 ? m.on + timeDelta : 0;
      if (m.on > 0.25) m.win();
    },
    onOutcome(m) { m.from = m.x; if (m.won) m.bits.push(puff(160, GROUND + 28, [COL.gold, COL.white], 10, 0.8, { life: 1, g: 0.2 })); },
    updateOutcome(m) { if (m.t > 1.2 && !m.thud && !m.won) { m.thud = 1; S.drum('kick', S.now(), 0.1); } },
    render(m) {
      shake(m);
      deathroom(1);
      window_(190, 0);
      bed(92, 1); nightstand(138); candleAt(143, 0.6);
      const o = out(m);
      sitting(92, { pose: o ? 0 : 'hold' });
      const [hx, hy] = o ? [152, GROUND + 18] : m.act.hand(m);
      CAST.draw(SP.alfredo, 172, GROUND, { flip: true });
      limb(174, GROUND + 12, hx + 4, hy + 4, c(COL.suit)); PX.draw(SP.hand, hx, hy);
      let px = m.x, py = GROUND + 26;
      if (o) {
        if (m.won) { px = hx - 1; py = hy + 4; }
        else if (m.t < 1) { px = m.from; py = Math.max(GROUND, GROUND + 26 - m.t * m.t * 90); }                          // it slips
        else { px = hx - 1; py = hy + 4; }                                                                                  // he picks it up
      } else limb(122, GROUND + 22, px + 4, py + 4, c(COL.pale));
      PX.draw(SP.portrait, px, py);
      if (m.phase === ACTION) box(hx - 3, hy - 2, 12, 14, c(COL.gold, 0.4 + 0.6 * MG.bounce()));
      if (o && m.t > 2) { CAST.draw(SP.germont, 218, GROUND, { flip: true }); hat(218, GROUND); }    // Germont in the doorway
    },
    renderOutcome: verdictDraw,
    outcome: (m) => [m.won ? 'SHE PUTS IT IN HIS HAND.' : 'IT SLIPS. HE PICKS IT UP.', 'HER PORTRAIT IS FOR THE GIRL HE WILL MARRY ONE DAY.'],
    music: {
      curtain: (t, b) => { kMaj(); S.setRoom(2400, 0.5, 1, t); S.drum('heartbeat', t, 0.12, 'heart'); },
      bar: (t, b) => { kMaj(); S.drum('heartbeat', t, 0.1, 'heart'); S.drum('heartbeat', t + 2 * b, 0.08, 'heart'); sing('soprano', TUNES.addio.alfredo.notes, TUNES.addio.alfredo.durs, t, b * 0.6, { vol: 0.12, light: 'lead' }); S.arp('I', 4 * b, 25, t, { vol: 0.05, octave: 1 }); },   // L'amore d'Alfredo, from Addio, del passato
      outcome: (t, b, won) => { kMaj(); if (!won) S.drum('heartbeat', t, 0.1); S.arp('I', 2.5, 25, t + 0.2, { vol: 0.05, octave: 1 }); },
    },
  },
  // ---------------------------------------------------------------- 12 · the end (watch)
  // she stands; white camellia petals fall; the pain has gone; she falls; Germont, deadpan
  { watch: true, bpm: 120, beats: 16,
    captions: [[0.6, 'SHE SAYS THE PAIN HAS GONE.'], [4.2, 'SHE DIES.']],
    init(m) { m.bits = [petals(22, 9, [COL.white, '#ffe6ee'])]; m.done = 0; m.thump = 0; },
    update(m) {
      settle(m.bits);
      if (m.t > 3.6) m.cut('mid', 150, GROUND + 22);
      if (m.t > 3.7 && !m.thump) { m.thump = 1; S.drum('kick', S.now(), 0.1); S.arp('i', 2.4, 20, S.now() + 0.1, { vol: 0.05, octave: 1 }); }
    },
    render(m) {
      const fall = m.t > 3.7, cold = clamp((m.t - 3.7) / 1.5);
      deathroom(1 - cold * 0.9);
      window_(190, 0.2);
      bed(92, 1 - cold); nightstand(138); candleAt(143, fall ? 0 : 0.6);
      if (m.t < 0.6) { sitting(92); }
      else {
        PX.rect(94, GROUND + 6, 44, 6, c(COL.violet));            // the empty bed
        const vx = lerp(100, 118, clamp((m.t - 0.6) / 1.4));
        if (!fall) CAST.draw(SP.vPale, vx, GROUND, { pose: m.t < 2 ? 'walk' : 0 });
        else CAST.draw(SP.vPale, 112, GROUND + 9, { pose: 'fall' });    // Alfredo holds her up
      }
      CAST.draw(SP.alfredo, fall ? 140 : 150, GROUND, { flip: true, pose: fall ? 'kneel' : 0 });
      if (fall) limb(142, GROUND + 12, 128, GROUND + 14, c(COL.suit));
      CAST.draw(SP.germont, 196, GROUND, { flip: true }); hat(196, GROUND);
      if (m.t > 5.6) say('SCUSA.', 190, GROUND + 34, COL.grey);           // the wink: Germont, deadpan, a little late
    },
    music: {
      curtain: (t, b) => { kMaj(); S.setRoom(3600, 0.55, 2, t); },
      bar: (t, b, i) => { kMaj(); if (i === 0) sing('soprano', AD.slice(0, 14), AD_D.slice(0, 14), t, b * 0.8, { vol: 0.12, light: 'lead', vibrato: 5 }); if (i === 1) { kMin(); S.arp('i', 3.5 * b, 25, t, { vol: 0.05, octave: 1 }); } if (i === 3) S.silence(t + 0.4, 1.4); },
    },
  },
];
// every game gets the verdict: the sting at the first frame of the outcome
// the runner renders one frame before its first update: give the clocks a value so nothing computes NaN
for (const a of ACTS) { const oi = a.init; a.init = (m) => { m.t = 0; m.beat = 0; m.frac = 0; oi?.(m); }; }
for (const a of ACTS) if (!a.watch) { const on = a.onOutcome; a.onOutcome = (m) => { verdict(m); on?.(m); }; }

MG.opera({
  title: 'LA TRAVIATA',
  sub: 'VERDI · FIVE GAMES · TWO MINUTES',
  key: [10, 'major'],
  colours: COL,
  sprites: traviataSprites,
  ending: (m, n) => ['VIOLETTA IS DEAD. PARIS TALKS ABOUT SOMETHING ELSE.', n === 5 ? 'YOU DID EVERYTHING RIGHT.' : n === 0 ? 'YOU DID NOTHING RIGHT. SAME ENDING.' : 'THE LETTER CAME TOO LATE.'],
  music: { result: (t) => { kMaj(); S.setRoom(3600, 0.55, 1, t); for (let i = 0; i < 4; i++) S.arp(['I', 'vi', 'IV', 'I'][i], 0.9, 25, t + i, { vol: 0.06, octave: 1 }); S.voice('soprano', S.deg('3+'), t + 4, 3, { vol: 0.11 }); } },
  renderTitle: () => { salon(timeReal); CAST.draw(SP.alfredo, 104, GROUND); CAST.draw(SP.violetta, 136, GROUND, { flip: true }); PX.draw(SP.coupe, 118, GROUND + 20 + Math.round(MG.bounce(timeReal) * 2)); PX.draw(SP.coupe, 128, GROUND + 20 + Math.round(MG.bounce(timeReal) * 2)); },
  renderResult: () => { deathroom(0); bed(92); lying(92, WHITE, 0); PX.rect(94, GROUND + 6, 44, 4, c(COL.violet)); CAST.draw(SP.alfredo, 142, GROUND, { flip: true, pose: 'kneel' }); CAST.draw(SP.germont, 190, GROUND, { flip: true }); hat(190, GROUND); PX.draw(SP.portrait, 150, GROUND + 12); },
  acts: ACTS,
});
