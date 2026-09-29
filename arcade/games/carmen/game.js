/* CARMEN: six operatic microgames.
   Bizet, 1875. D minor. Carmen in red, José in dragoon blue, Escamillo in
   the gold suit of lights, Seville in sand. Green is jealousy, white is the
   knife. One job per act: a toy (run through the petals), mash, hold, tap,
   jump, tap in time. Every act ends on one tableau whether you won or lost;
   only the manner differs.
   Tunes quoted from memory as scale degrees; check them against the score. */

'use strict';

const SP = {};
const COL = {
  bg: '#0b0710', ink: '#f4e9d8', dim: '#7a6a7a', card: '#f4e9d8', cardInk: '#0b0710',
  bravo: '#f4b93a', tragic: '#ff4d6d', fuse: '#f4e9d8',
  red: '#d4152f', blue: '#3d6fe0', gold: '#f4b93a', sand: '#e8c894', green: '#62c43a',
  skin: '#f1c9a5', dark: '#1a1424', night: '#141a33', white: '#ffffff', pink: '#ff7aa8',
  wood: '#4a2c1c', bull: '#241614',
};
const c = PX.c;
PX.SCALE = 2;                  // characters and props are drawn at 2x: 12x22 people on a 256x144 stage
const ACTION = MG.phase.ACTION, OUTCOME = MG.phase.OUTCOME;

function carmenSprites() {
  setGravity(vec2(0, -0.06));  // per frame: confetti and petals fall, damping gives them a gentle drift
  // the cast, animated (lib/cast.js): José kneels in the tavern, Escamillo jumps and is tossed, Carmen falls
  const d = COL.dark;
  SP.jose = CAST.body({ h: COL.night, f: COL.skin, b: COL.blue, l: d });
  SP.joseShadow = CAST.body({ h: d, f: d, b: d, l: d, e: d, m: d });
  SP.zuniga = CAST.body({ h: COL.gold, f: COL.skin, b: COL.night, l: d });
  SP.esca = CAST.body({ h: d, f: COL.skin, b: COL.gold, l: COL.gold });
  SP.carmen = CAST.dress({ h: d, f: COL.skin, r: COL.red, l: d });
  SP.carmenBack = CAST.dress({ h: d, f: d, r: COL.red, e: d, m: d });   // her back: all hair
  SP.carmenWhite = CAST.dress({ h: d, f: COL.white, r: COL.white, l: d });
  const flower = (p, y, g) => PX.sprite(['.p.p.', 'ppppp', '.pyp.', 'ppppp', '.pgp.', '..g..', '..g..'], { p, y, g });
  SP.flower = flower(COL.pink, COL.gold, COL.green);
  SP.flowerDead = flower('#6a5058', '#7a6a5a', '#5a5a3a');
  SP.coil = PX.sprite(['rrkrrkrr'], { r: COL.sand, k: '#b08a5a' });
  SP.cardBack = PX.sprite(['wwwwwww', 'wbwbwbw', 'wwbwbww', 'wbwbwbw', 'wwbwbww', 'wbwbwbw', 'wwbwbww', 'wbwbwbw', 'wwwwwww'], { w: COL.ink, b: COL.blue });
  SP.spade = PX.sprite(['wwwwwww', 'wwwkwww', 'wwkkkww', 'wkkkkkw', 'wkkkkkw', 'wwkwkww', 'wwwkwww', 'wwkkkww', 'wwwwwww'], { w: COL.white, k: COL.dark });
  SP.bull = PX.sprite([
    '.........w..', '.........ww.', '.hhhhhhhhhhh', 'thhhhhhhhhhe', '.hhhhhhhhhhh', '.hhhhhhhhhh.', '.h.h....h.h.', '.h.h....h.h.',
  ], { h: COL.bull, t: COL.bull, w: COL.ink, e: COL.red });
  SP.ring = PX.sprite(['.ggg.', 'g...g', 'g...g', 'g...g', '.ggg.'], { g: COL.gold });
  SP.knife = PX.sprite(['wwwwwwd', '.wwwwdd', '......d'], { w: COL.white, d: COL.dark });
  SP.petal = PX.sprite(['.w.', 'www', '.w.'], { w: COL.white });
  SP.heart = PX.sprite(['.r.r.', 'rrrrr', 'rrrrr', '.rrr.', '..r..'], { r: COL.pink });
}

// ---- music helpers ----
// the habanera bass ostinato (d8 r16 a16 f8 a8, checked: docs/MUSIC.md), one 2/4 bar per two game beats
const HB = TUNES.habanera.bass;
const habanera = (t, b, bars = 1, vol = 0.12, voice = 'bass') => {
  for (let i = 0; i < bars; i++) HB.notes.forEach((n, j) => S.voice(voice, S.deg(n), t + (i * 2 + HB.at[j]) * b, b * HB.durs[j] * 0.9, { vol, light: j ? null : 'bass' }));
};
const SLIDE = TUNES.habanera.notes, SLIDE_D = TUNES.habanera.durs;   // "L'amour est un oiseau rebelle", 2/4
const sing = MG.sing;
const TOREADOR = TUNES.toreador.notes, TOREADOR_D = TUNES.toreador.durs;   // the refrain, F major, checked
const stingUp = MG.sting;
// hit sounds: a soft chime on a chord tone, a bright rising run for a win, a low drop for a loss
const CHIME = ['1', '3', '5', '1+', '3+', '5+', '1++'];
const chime = (i, vol = 0.05) => S.voice('pulse', S.deg(CHIME[i % 7]) + 12, S.now(), 0.12, { vol });
const winSting = (t) => { CHIME.slice(0, 6).forEach((d, i) => S.voice('pulse', S.deg(d) + 12, t + i * 0.045, 0.1, { vol: 0.05 })); S.drum('hat', t, 0.14); };
const loseSting = (t) => { S.drum('kick', t, 0.3); S.voice('bass', S.deg('3'), t, 0.12, { vol: 0.16 }); S.voice('bass', S.deg('1') - 1, t + 0.13, 0.7, { vol: 0.18, grit: true }); };

// ---- the stage ----
const GROUND = MG.GROUND;
const stageFloor = (colour) => MG.floor(colour, COL.dim);
const backdrop = (colour) => PX.rect(0, GROUND, 256, 144 - GROUND, c(colour));
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
// particles that reach the floor lie on it (petals, roses, rope ends)
const settle = (list) => { for (const e of list) for (const p of e.particles) if (p.pos.y < GROUND + 1) { p.pos.y = GROUND + 1; p.velocity.set(0, 0); p.angleVelocity = 0; } };
// the verdict, in the first frames of the outcome: a flash and a rising sting, or a shake and a low one
// (the outcome clock m.t starts on the next beat, so it can be negative here; the flash keeps its own)
const verdict = (m) => { const t = m.v0 = S.now(); if (m.act.toy) S.arp('III', 1.2, 20, t, { vol: 0.05, octave: 1 }); else if (m.won) winSting(t); else loseSting(t); };
const verdictDraw = (m) => {
  const k = Math.min(1, 1 - (S.now() - m.v0) / 0.35);
  if (k > 0 && !m.act.toy) PX.rect(0, 0, PX.W, PX.H, m.won ? c(COL.white, 0.8 * k) : c('#000000', 0.55 * k));
};
const shake = (m) => { if (m.phase === OUTCOME && !m.won && S.now() - m.v0 < 0.4) setCameraPos(cameraPos.add(vec2(randInt(-2, 3), randInt(-2, 3)))); };
const out = (m) => m.phase === OUTCOME;

const ACTS = [
  // ---------------------------------------------------------------- I
  // the toy: she throws him the flower, it bursts, he runs and jumps through the petals
  { name: 'ACT I · THE FACTORY', aria: 'HABANERA', command: 'CATCH!', bpm: 120, beats: 12, verb: 'move', toy: true,
    init(m) { m.x = 60; m.y = 0; m.vy = 0; m.n = 0; m.last = 0; m.lit = 0; m.facing = 1; m.falls = []; },
    onOutcome(m) { m.cut('mid', 122, GROUND + 36); m.fl = 0; m.lit = 0; },
    update(m) {
      if (!m.falls.length) {
        // she throws: the flower bursts over the stage, then the petals keep coming
        m.falls.push(puff(128, 104, [COL.red, COL.pink], 36, 1.2, { size: vec2(200, 30), life: 7, keep: 1, g: 0.35, damp: 0.96, spin: 0.08, s0: 3, s1: 3, tile: SP.petal.tile }));
        m.falls.push(new ParticleEmitter(vec2(128, 124), 0, vec2(250, 36), 0, 12, PI, SP.petal.tile, c(COL.red), c(COL.pink), c(COL.red), c(COL.pink),
          7, 3, 3, 0.1, 0.06, 0.96, 1, 0.4, PI, 0.1, 0.4));
        S.drum('hat', S.now(), 0.15);
      }
      MG.walk(m, 'x', 90, 4, 240);
      if (m.press && !m.y) { m.vy = 190; S.drum('hat', S.now(), 0.1); }
      m.vy -= 640 * timeDelta; m.y = Math.max(0, m.y + m.vy * timeDelta); if (!m.y) m.vy = 0;
      m.lit = Math.max(0, m.lit - timeDelta * 4);
      settle(m.falls);
      // a petal he touches is a note, climbing the chord
      for (const e of m.falls) for (const p of e.particles) {
        const py = p.pos.y - GROUND - m.y;
        if (!p.destroyed && p.pos.y > GROUND + 2 && p.pos.x > m.x - 3 && p.pos.x < m.x + 15 && py > -2 && py < 25) {
          p.destroy(); m.lit = 1;
          puff(p.pos.x, p.pos.y, [COL.pink, COL.white], 5, 0.7, { life: 0.35, g: 0, s0: 2, s1: 1 });
          if (m.t - m.last > 0.06) { chime(m.n++); m.last = m.t; }
        }
      }
    },
    updateOutcome(m) {
      settle(m.falls);
      m.y = Math.max(0, m.y - 200 * timeDelta);
      m.facing = m.x < 104 ? 1 : -1;
      m.x += Math.sign(104 - m.x) * Math.min(Math.abs(104 - m.x), 150 * timeDelta);
      if (m.t > 0.9 && !m.fl) { m.fl = 1; chime(3, 0.06); chime(5, 0.05); puff(m.x + 7, GROUND + 18, [COL.pink, COL.red], 16, 1.1, { life: 1, g: 0.4 }); }
    },
    render(m) {
      backdrop('#35283f');
      stageFloor(COL.sand);
      // the factory and Carmen in its lit door, up on the step
      PX.rect(84, GROUND + 38, 88, 82, c('#241a2c'));
      PX.rect(110, GROUND + 50, 36, 40, c('#8a5a42'));
      PX.rect(106, GROUND + 48, 44, 2, c(COL.dim));
      CAST.draw(SP.carmen, 121, GROUND + 50);
      if (m.phase < ACTION) PX.draw(SP.flower, 133, GROUND + 60);
      const k = m.lit;
      const bob = out(m) ? Math.round(MG.bounce() * 2) : 0;
      CAST.draw(SP.jose, m.x, GROUND + m.y + bob, { pose: m.y > 0 ? 'jump' : 0, flip: m.facing < 0, add: new Color(k * 0.5, k * 0.25, k * 0.35, 0) });
      if (out(m)) {
        // the flower itself drifts down last, into his hand
        const f = Math.min(1, m.t / 0.9);
        PX.draw(SP.flower, lerp(130, m.x + 9, f), lerp(GROUND + 60, GROUND + 6 + bob, f));
        if (m.t > 1) PX.draw(SP.heart, m.x + 2, GROUND + 28 + Math.round(MG.bounce() * 3));
      }
    },
    outcome: () => ['SHE THROWS HIM A FLOWER. HE KEEPS IT.'],
    music: {
      curtain: (t, b) => { stingUp(t); habanera(t, b, 2, 0.12); },
      bar: (t, b, i) => { habanera(t, b, 2); if (i % 4 === 0) sing('tenor', SLIDE, SLIDE_D, t, b * 2, { vol: 0.14, light: 'lead' }); },
      outcome: (t, b, won) => { habanera(t, b, 1); sing('soprano', won ? ['5', '6', '5', '3'] : ['3', '2', '1', '7-'], [0.5, 0.5, 0.5, 1.5], t, b, { vol: 0.13 }); },
    },
  },
  // ---------------------------------------------------------------- II
  // José loosens the rope round her; either way she pushes him down and runs
  { name: 'ACT I · THE ESCAPE', aria: 'SEGUIDILLA', command: 'UNTIE!', bpm: 140, beats: 12, verb: 'mash', shot: 'mid', focus: () => [112, GROUND + 22],
    onOutcome(m) {
      m.cut('wide'); m.go = m.won ? 0.3 : 0.9; m.pushed = 0; m.bits = [];
      if (m.won) m.bits.push(puff(115, GROUND + 14, [COL.sand, COL.gold], 24, 1.8, { life: 2, keep: 1, g: 1 }));
    },
    init(m) { m.knot = 0; m.jig = 0; m.n = 0; m.tw = 0; m.tt = 0; },
    update(m) {
      if (m.press) {
        m.knot = Math.min(1, m.knot + 0.1); m.jig = 1;
        S.drum('hat', S.now(), 0.12); chime(m.n++ % 3, 0.03);
        puff(115, GROUND + 12, [COL.sand], 3, 1, { life: 0.4, s0: 2, s1: 1 });
      }
      m.knot = Math.max(0, m.knot - 0.2 * timeDelta);
      m.jig = Math.max(0, m.jig - timeDelta * 8);
      if (m.press) m.tw = 0.35;
      if (m.tw > 0) m.tt += timeDelta;
      m.tw = Math.max(0, m.tw - timeDelta);
      if (m.knot >= 1) m.win();
    },
    updateOutcome(m) {
      settle(m.bits);
      if (m.t > m.go && !m.pushed) { m.pushed = 1; S.drum('kick', S.now(), 0.25); S.drum('breath', S.now(), 0.3); m.bits.push(puff(88, GROUND + 2, [COL.sand, COL.dim], 10, 0.8, { life: 0.6, g: 0 })); }
    },
    render(m) {
      shake(m);
      backdrop('#2c3358');
      stageFloor(COL.dim);
      PX.rect(192, GROUND, 40, 72, c(COL.dark));                // the guardroom door, Zuniga in it
      CAST.draw(SP.zuniga, 206, GROUND);
      const o = out(m), gone = o && m.t > m.go;
      const cx = gone ? 108 + (m.t - m.go) * 190 : 108 + (o && !m.won ? Math.round(Math.sin(m.t * 40)) : 0);
      // José falls back when she shoves him
      if (gone) CAST.draw(SP.jose, 80, GROUND, { pose: 'fall' });
      else CAST.draw(SP.jose, 96 + Math.round(m.jig), GROUND, m.tw > 0 && m.phase === ACTION ? { pose: 'walk', t: m.tt * 0.5 } : { pose: 'idle' });
      CAST.draw(SP.carmen, cx, GROUND);
      // the rope: coils round her, one gone for each third of the knot
      if (!o || (!m.won && !gone)) {
        const n = o ? 3 : Math.max(1, 3 - Math.floor(m.knot * 3));
        for (let i = 0; i < n; i++) glow(SP.coil, cx - 1, GROUND + 4 + i * 4 + (m.jig > 0.5 ? 1 : 0), COL.dark);
      } else { PX.draw(SP.coil, 102, GROUND); PX.draw(SP.coil, 106, GROUND + 2); }   // on the floor, either way
    },
    renderOutcome: verdictDraw,
    outcome: (m) => m.won ? ['THE ROPE GIVES. SHE PUSHES HIM DOWN AND RUNS.'] : ['THE KNOT HOLDS. SHE PUSHES HIM DOWN AND RUNS.'],
    music: {
      curtain: (t, b) => { stingUp(t); for (let i = 0; i < 12; i++) S.voice('pulse', S.deg(['1', '3', '5'][i % 3]), t + i * b / 3, b / 4, { vol: 0.06 }); },
      bar: (t, b) => { for (let i = 0; i < 12; i++) { S.voice('pulse', S.deg(['1', '3', '5', '3', '5', '1+'][i % 6]), t + i * b / 3, b / 4, { vol: 0.07, light: i % 3 ? null : 'lead' }); if (i % 3 === 0) S.voice('bass', S.deg(i % 6 ? '5-' : '1-'), t + i * b / 3, b / 2, { vol: 0.12 }); } },
      outcome: (t, b, won) => { if (won) { S.drum('snare', t, 0.2); sing('soprano', ['1+', '5', '3', '1'], [0.33, 0.33, 0.33, 1.5], t, b, { vol: 0.13 }); } else { S.drum('kick', t, 0.2); S.drum('kick', t + b, 0.2); S.voice('bass', S.deg('1-'), t + 2 * b, 1.5, { vol: 0.18 }); } },
    },
  },
  // ---------------------------------------------------------------- III
  // he holds the dry flower out; held, it blooms; she turns round either way
  { name: 'ACT II · THE TAVERN', aria: 'LA FLEUR', command: 'HOLD!', bpm: 120, beats: 14, verb: 'hold', shot: 'mid', focus: () => [124, GROUND + 22],
    init(m) { m.bloom = 0; m.was = false; m.turned = 0; },
    onOutcome(m) {
      m.bits = [];
      if (m.won) m.bits.push(puff(117, GROUND + 22, [COL.pink, COL.red], 24, 1.3, { life: 2.5, keep: 1, g: 0.5, damp: 0.95 }));
      else m.bits.push(puff(117, GROUND + 18, ['#6a5058'], 5, 0.4, { life: 2, keep: 1, g: 0.5, damp: 0.95 }));
    },
    update(m) {
      if (m.hold) m.bloom = Math.min(1, m.bloom + timeDelta / 3); else m.bloom = Math.max(0, m.bloom - timeDelta / 4);
      if (m.hold && !m.was) chime(4, 0.04);
      if (!m.hold && m.was) S.voice('tenor', S.deg('1-'), S.now(), 0.35, { vol: 0.1, grit: true });
      m.was = m.hold;
      if (m.bloom >= 1) m.win();
    },
    updateOutcome(m) {
      settle(m.bits);
      const at = m.won ? 0.1 : 1.2;          // she turns round: at once, or after a moment
      if (m.t > at && !m.turned) { m.turned = 1; chime(2, 0.05); chime(4, 0.04); if (!m.won) m.bits.push(puff(117, GROUND + 22, [COL.pink], 10, 0.9, { life: 1 })); }
      if (m.turned) m.bloom = Math.min(1, m.bloom + timeDelta * 2);
    },
    render(m) {
      shake(m);
      backdrop('#3a2230');
      PX.rect(150, GROUND + 60, 6, 3, c(COL.gold));             // a lamp, and its warm pool
      stageFloor(COL.wood);
      const o = out(m);
      CAST.draw(SP.jose, 100, GROUND, { pose: 'kneel' });
      // the flower: dry, and blooming over it as he holds it out
      const droop = o && !m.won && !m.turned;
      const fx = 110, fy = GROUND + 6;
      if (m.phase === ACTION) glow(SP.flowerDead, fx, fy, COL.pink, m.hold ? 0.6 + 0.4 * MG.bounce() : 0.35);
      PX.draw(SP.flowerDead, fx, fy - (droop ? 2 : 0), { angle: droop ? 0.5 : 0 });
      PX.draw(SP.flower, fx, fy - (droop ? 2 : 0), { color: c(COL.white, m.bloom), angle: droop ? 0.5 : 0 });
      CAST.draw(m.turned ? SP.carmen : SP.carmenBack, 138, GROUND);
      if (m.turned) PX.draw(SP.heart, 126, GROUND + 30 + Math.round(MG.bounce() * 2));
      if (o && m.t > 1.7) say('LÀ-BAS !', 150, GROUND + 30);
    },
    renderOutcome: verdictDraw,
    outcome: (m) => m.won ? ['SHE TURNS. HE WILL DESERT FOR HER.'] : ['SHE TURNS ANYWAY. HE WILL DESERT FOR HER.'],
    music: {
      curtain: (t, b) => { stingUp(t); S.setRoom(900, 0.5, 1, t); sing('tenor', ['5', '5', '6', '5'], [0.5, 0.5, 0.5, 1.5], t + b, b, { vol: 0.12, vibrato: 6 }); },
      bar: (t, b, i) => { S.key(2, 'major'); habanera(t, b, 2, 0.09); if (i % 4 === 0) sing('tenor', SLIDE, SLIDE_D, t, b * 2, { vol: 0.12, vibrato: 7, light: 'lead' }); S.key(2, 'minor'); },
      outcome: (t, b, won) => { S.setRoom(2400, 0.4, 2, t); if (won) sing('tenor', ['1+', '7', '6', '5'], [0.5, 0.5, 0.5, 2], t, b, { vol: 0.13, vibrato: 8 }); else sing('tenor', ['5', '4b', '3', '1-'], [0.5, 0.5, 0.5, 2], t, b, { vol: 0.13, grit: true }); },
    },
  },
  // ---------------------------------------------------------------- IV
  // three cards face down; each press turns the next one; every one is the spade
  { name: 'ACT III · THE PASS', aria: 'THE CARDS', command: 'FLIP!', bpm: 110, beats: 10, verb: 'tap', shot: 'mid', focus: () => [122, GROUND + 22],
    init(m) { m.n = 0; m.pop = [0, 0, 0]; },
    flip(m, i, wind) {
      m.pop[i] = 1; m.n = Math.max(m.n, i + 1);
      puff(107 + i * 22, GROUND + 21, wind ? [COL.dim] : [COL.white, COL.blue], 8, 1, { life: 0.4, g: 0 });
      S.drum(wind ? 'breath' : 'snare', S.now(), 0.2); S.voice('pulse', S.deg(['5', '4', '3'][i]), S.now(), 0.3, { vol: 0.06 });
    },
    update(m) {
      const on = Math.abs(m.beat - Math.round(m.beat)) < 0.25;
      m.on = on;
      if (m.press && m.n < 3) {
        if (on) { m.act.flip(m, m.n); if (m.n === 3) m.win(); }
        else { m.shk = 0.3; S.voice('bass', S.deg('1-') + 5, S.now(), 0.06, { vol: 0.1 }); S.drum('hat', S.now(), 0.08); }
      }
      m.shk = Math.max(0, (m.shk || 0) - timeDelta);
      m.pop = m.pop.map((p) => Math.max(0, p - timeDelta * 4));
    },
    updateOutcome(m) {
      // the wind turns what she didn't
      if (m.n < 3 && m.t > 0.5 + m.n * 0.3) m.act.flip(m, m.n, true);
      m.pop = m.pop.map((p) => Math.max(0, p - timeDelta * 4));
    },
    render(m) {
      shake(m);
      backdrop('#23304a');
      PX.rect(0, GROUND, 256, 30, c('#1a2238'));               // the mountains, far off, still
      stageFloor(COL.dim);
      CAST.draw(SP.carmen, 72, GROUND);
      PX.rect(94, GROUND, 80, 12, c(COL.wood));                // the table
      PX.rect(94, GROUND + 11, 80, 1, c('#8a5a3a'));
      for (let i = 0; i < 3; i++) {
        const x = 100 + i * 22, next = m.phase === ACTION && i === m.n;
        const y = GROUND + 12 + (next && m.on ? 2 : 0);
        const s = i < m.n ? SP.spade : SP.cardBack;
        if (next) glow(s, x + (m.shk > 0 ? randInt(-1, 2) : 0), y, m.on ? COL.gold : COL.dim);
        else PX.draw(s, x, y, { color: i < m.n ? WHITE : c('#9a9ab0'), add: m.pop[i] ? new Color(m.pop[i], m.pop[i], m.pop[i], 0) : undefined });
      }
      if (out(m) && m.t > 1.6) say('LA MORT !', 66, GROUND + 28);
    },
    renderOutcome: verdictDraw,
    outcome: (m) => m.won ? ['SPADE. SPADE. SPADE. THE CARDS SAY DEATH.'] : ['THE WIND TURNS THEM. THE CARDS SAY DEATH.'],
    music: {
      curtain: (t, b) => { S.drone(S.deg('1-'), t, 5 * b, { tritone: true, vol: 0.05 }); S.drum('kick', t, 0.16, 'kick'); },
      bar: (t, b) => { S.drone(S.deg('1-'), t, 4.2 * b, { tritone: true, vol: 0.05 }); S.drum('kick', t, 0.14); S.drum('kick', t + 2 * b, 0.14); S.voice('soprano', S.deg('5'), t + b, 1.2, { vol: 0.09 }); },
      outcome: (t, b) => { S.drum('snare', t, 0.22, 'kick'); sing('soprano', ['5', '4', '3'], [1, 1, 2], t + b * 0.5, b, { vol: 0.14 }); S.drone(S.deg('1-'), t, 4 * b, { tritone: true, vol: 0.06 }); },
    },
  },
  // ---------------------------------------------------------------- V
  // the bull charges three times; jump it; tossed or not, the crowd is his
  { name: 'ACT IV · THE BULLRING', aria: 'TOREADOR', command: 'GLORY!', bpm: 140, beats: 16, verb: 'jump', shot: 'mid', focus: () => [122, GROUND + 30],
    init(m) { m.tag = 0; m.x = 122; m.y = 0; m.vy = 0; m.bull = null; m.charges = 0; m.passes = 0; m.next = 0.4; m.ole = 0; m.timeoutWins = true; },
    onOutcome(m) { m.roses = []; m.cheered = 0; m.up = m.won ? 0 : 1.5; },
    bullStep(m) {
      const bu = m.bull;
      if (!bu) return;
      bu.x += bu.dir * bu.speed * timeDelta;
      if (bu.x < 24 || bu.x > 206) m.bull = null;
    },
    update(m) {
      if (m.press && !m.y) { m.vy = 240; S.drum('hat', S.now(), 0.14); }
      m.vy -= 800 * timeDelta; m.y = Math.max(0, m.y + m.vy * timeDelta); if (!m.y) m.vy = 0;
      m.ole = Math.max(0, m.ole - timeDelta * 1.5);
      if (!m.bull && m.t >= m.next && m.charges < 3) {
        const left = m.charges % 2 === 0;
        m.bull = { x: left ? 36 : 194, dir: left ? 1 : -1, speed: 120 + m.charges * 25 };
        if (!m.charges) m.tag = m.t + 0.7;
        m.charges++;
        S.drum('thunder', S.now(), 0.3);
      }
      const bu = m.bull;
      if (bu) {
        if (bu.x + 22 > m.x + 2 && bu.x + 2 < m.x + 10 && m.y < 14) m.lose();
        if (!bu.passed && (bu.dir > 0 ? bu.x > m.x + 12 : bu.x + 24 < m.x)) {
          bu.passed = 1; m.passes++; m.ole = 1; S.drum('crowd', S.now(), 0.2); chime(m.passes + 2, 0.05);
          puff(m.x + 6, GROUND + 30, [COL.gold, COL.red], 8, 1.2, { life: 0.7 });
          if (m.passes === 3) m.win();
        }
        m.act.bullStep(m);
        if (!m.bull) m.next = m.t + 0.3;
      }
    },
    updateOutcome(m) {
      m.act.bullStep(m);
      settle(m.roses);
      if (m.t > m.up && !m.cheered) {
        m.cheered = 1; S.drum('crowd', S.now(), 0.28);
        m.roses.push(puff(128, 92, [COL.red, COL.pink], 40, 0.6, { size: vec2(220, 8), life: 4, keep: 1, g: 1, angle: PI, cone: 0.6 }));
      }
    },
    render(m) {
      shake(m);
      const o = out(m), roar = o && m.cheered;
      backdrop('#21161c');
      // the crowd: dim and still while he fights, on their feet after
      for (let i = 0; i < 32; i++) for (let r = 0; r < 3; r++) {
        const jump = roar && (i + r + Math.floor(m.beat * 2)) % 2 ? 2 : 0;
        PX.rect(i * 8 + 2, 66 + r * 8 + jump, 4, 4, c([COL.red, COL.gold, COL.ink][(i + r) % 3], roar ? 0.9 : 0.3));
      }
      PX.rect(0, GROUND, 256, 40, c('#5a2a20'));               // the barrera
      PX.rect(0, GROUND + 38, 256, 2, c('#8a5a3a'));
      stageFloor(COL.sand);
      if (o && m.t > 1.2) glow(SP.joseShadow, 70, GROUND, COL.green, 0.6);   // José, at the gate
      if (m.bull) PX.draw(SP.bull, m.bull.x, GROUND, { flip: m.bull.dir < 0 });
      // tossed: up, over, down, and up again
      const tt = o && !m.won ? Math.max(0, m.t) : 9;
      if (tt < 0.8) CAST.draw(SP.esca, m.x, GROUND + Math.sin(tt / 0.8 * PI) * 40, { pose: 'jump', angle: tt * 9 });
      else if (tt < m.up) CAST.draw(SP.esca, m.x, GROUND, { pose: 'fall' });
      else glow(SP.esca, m.x, GROUND + (o ? Math.round(MG.bounce() * 2) : m.y), COL.white, o ? 0.5 : 0, { pose: m.y > 0 ? 'jump' : roar ? 'hold' : 0 });
      if (m.phase === ACTION && m.t < m.tag) say('JUMP', m.x + 14, GROUND + 30, COL.gold);
      if (m.ole > 0.3) say('OLÉ !', m.x + 16, GROUND + 30, COL.gold);
      if (roar && m.t > m.up + 0.2) say('OLÉ !', m.x + 16, GROUND + 30, COL.gold);
    },
    renderOutcome: verdictDraw,
    outcome: (m) => m.won ? ['THREE PASSES. THE CROWD IS HIS.'] : ['TOSSED. HE GETS UP. THE CROWD IS HIS.'],
    music: {
      curtain: (t, b) => { stingUp(t); S.setRoom(3200, 0.45, 1, t); S.drum('crowd', t, 0.18); sing('pulse', ['1', '3', '5', '1+'], [0.25, 0.25, 0.25, 1], t + b, b, { vol: 0.09 }); },
      bar: (t, b, i) => {
        // F major fanfare over a creeping minor second in the bass
        S.key(5, 'major');
        if (i % 4 === 0) sing('tenor', TOREADOR, TOREADOR_D, t, b, { vol: 0.13, light: 'lead' });
        for (let k = 0; k < 4; k++) { S.voice('bass', S.deg('1-') + (k % 2), t + k * b, b * 0.5, { vol: 0.13 }); S.drum(k % 2 ? 'hat' : 'kick', t + k * b, 0.14); }
        S.key(2, 'minor');
      },
      outcome: (t, b, won) => { S.key(5, 'major'); if (won) { S.drum('crowd', t, 0.25); sing('tenor', ['5', '5', '5', '1+'], [0.33, 0.33, 0.33, 2], t, b, { vol: 0.15 }); S.arp('I', 2.5 * b, 25, t + b, { vol: 0.07, octave: 1 }); } else { S.drum('snare', t, 0.25); S.voice('bass', S.deg('1-'), t, 2, { vol: 0.16, grit: true }); } S.key(2, 'minor'); },
    },
  },
  // ---------------------------------------------------------------- VI
  // he walks up a step a beat; when he is in reach the ring shines: throw it back at him
  { name: 'ACT IV · OUTSIDE THE ARENA', aria: 'THE FINALE', command: 'REJECT!', bpm: 150, beats: 12, verb: 'tap', outcomeSeconds: 4.2,
    init(m) { m.nope = 0; m.jx = 90; m.cx = 196; m.step = 0; m.near = false; },
    onOutcome(m) { m.cut('mid', m.cx - 30, GROUND + 22); m.knife = 0; m.land = 0; m.rx = m.cx - 8; m.to = m.jx + 18; m.blood = []; },
    update(m) {
      const step = Math.floor(m.beat);
      if (step > m.step) { m.step = step; m.jx = 90 + step * 8; S.drum('kick', S.now(), 0.18, 'kick'); }
      m.near = m.cx - m.jx < 66;
      if (m.press) { if (m.near) m.win(); else { m.nope = m.t + 0.5; S.drum('kick', S.now(), 0.1); S.voice('bass', S.deg('1-'), S.now(), 0.08, { vol: 0.1 }); } }
    },
    updateOutcome(m) {
      settle(m.blood);
      // the ring lands at his feet: thrown in an arc, or dropped and rolling
      const k = m.won ? clamp(m.t / 0.5) : Math.min(1, Math.max(0, (m.t - 0.35) / 0.6));
      m.rx = lerp(m.cx - 8, m.to, k);
      m.ry = m.won ? GROUND + 14 * (1 - k) + Math.sin(k * PI) * 18 : GROUND + Math.max(0, 14 - m.t * 45);
      if (k >= 1 && !m.land) { m.land = 1; chime(6, 0.04); S.drum('hat', S.now(), 0.12); }
      if (m.t > 1.6 && !m.knife) {
        m.knife = 1; S.drum('snare', S.now(), 0.3, 'knife');
        m.blood.push(puff(m.cx + 10, GROUND + 14, [COL.red, COL.pink], 30, 0.9, { life: 1.6, keep: 1, g: 0.8, damp: 0.93, size: 8 }));
      }
    },
    render(m) {
      shake(m);
      backdrop('#40202a');
      PX.rect(0, GROUND + 62, 256, 60, c('#2a1418'));           // the arena wall
      stageFloor(COL.sand);
      const o = out(m), fallen = o && m.t > 1.6;
      if (fallen) CAST.draw(SP.carmen, m.cx + 4, GROUND, { pose: 'fall' });
      else CAST.draw(SP.carmen, m.cx, GROUND, { flip: true, pose: o && m.won && m.t < 0.5 ? 'hold' : 0 });
      CAST.draw(SP.jose, m.jx, GROUND, { color: m.phase === ACTION && m.near ? c(COL.green) : WHITE });
      if (!o) {
        const y = GROUND + 14 + (m.near ? Math.round(MG.bounce() * 3) : 0);
        if (m.near) glow(SP.ring, m.cx - 8, y, COL.white);
        else PX.draw(SP.ring, m.cx - 8, y, { color: c('#ffffff', 0.5) });
      } else PX.draw(SP.ring, m.rx, m.ry);
      if (!o && m.t < m.nope) say('NOT YET', m.cx - 30, GROUND + 30);
      if (o && m.t > 1.3) PX.draw(SP.knife, m.jx + 12, GROUND + 12);
      if (o && m.t > 1.6 && m.t < 1.75) PX.rect(0, 0, 256, 144, c(COL.white, 0.9));
      if (o && m.t > 2.6) say('MERDE !', m.jx + 14, GROUND + 28, COL.ink);   // the wink: José, deadpan, a beat too late
    },
    renderOutcome: verdictDraw,
    outcome: (m) => m.won ? ['SHE THROWS HIS RING AWAY. HE HAS A KNIFE.'] : ['SHE LETS HIS RING FALL. HE HAS A KNIFE.'],
    music: {
      curtain: (t, b) => { stingUp(t); S.setRoom(600, 0.55, 1, t); S.voice('tenor', S.deg('1-'), t, 3 * b, { vol: 0.12, grit: 0.5 }); },
      bar: (t, b) => { for (let k = 0; k < 4; k++) S.voice('tenor', S.deg(k % 2 ? '2b' : '1'), t + k * b, b * 0.6, { vol: 0.12, grit: 0.75, light: 'lead' }); S.voice('soprano', S.deg('5+'), t + 2 * b, 1.4 * b, { vol: 0.1 }); },
      outcome: (t, b, won) => { const k = t + 1.6; S.drum('snare', k, 0.3); S.voice('bass', S.deg('1-'), k + 0.1, 1.5, { vol: 0.18 }); S.arp('i', 1.6, 25, k + 0.3, { vol: 0.06, octave: 1 }); S.setRoom(320, 0.6, 1.5, k); },
    },
  },
];
// every act gets the verdict: the sting at the first frame of the outcome
for (const a of ACTS) { const on = a.onOutcome; a.onOutcome = (m) => { verdict(m); on?.(m); }; }

MG.opera({
  title: 'CARMEN',
  sub: 'BIZET · SIX MICROGAMES',
  key: [2, 'minor'],
  colours: COL,
  sprites: carmenSprites,
  ending: (m, bravos) => bravos === 5 ? ['CARMEN IS DEAD.', 'YOU DID EVERYTHING RIGHT.']
    : bravos === 0 ? ['CARMEN IS DEAD.', 'YOU DID NOTHING RIGHT. SAME ENDING.']
    : ['CARMEN IS DEAD.', 'IT WAS NEVER UP TO YOU.'],
  music: { result: (t, n) => { S.setRoom(3600, 0.5, 1, t); for (let i = 0; i < 4; i++) S.arp(['i', 'VI', 'III', 'VII'][i], 0.9, 25, t + i, { vol: 0.07, octave: 1 }); S.voice('soprano', S.deg('5+'), t + 4, 2.4, { vol: 0.12 }); } },
  renderTitle: () => { stageFloor(COL.sand); CAST.draw(SP.carmen, 121, GROUND); PX.draw(SP.flower, 110, GROUND + 30 + MG.bounce(timeReal) * 4); },
  renderResult: () => { stageFloor(COL.dark); CAST.draw(SP.jose, 100, GROUND); CAST.draw(SP.carmenWhite, 130, GROUND, { pose: 'fall' }); },
  acts: ACTS,
});
