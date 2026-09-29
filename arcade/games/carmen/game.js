/* CARMEN: five games and eight scenes, about two minutes.
   Bizet, 1875. D minor. Carmen in red, José in dragoon blue, Escamillo in
   the gold suit of lights, Seville in sand. Green is jealousy, white is the
   knife. The story is told in WATCH beats between the games (letterbox, a
   typed caption, nothing to do); each game has one job: drag, tap tap tap,
   hold, tap, tap. Every game ends on one tableau whether you won or lost and
   the caption states the same fact; only the manner differs. The ending is
   watched: the ring, the knife, then the petals.
   Tunes: the Habanera and the Toreador refrain are checked (docs/MUSIC.md); everything
   else is original filler in the key, not a quote. */

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
  const d = COL.dark;
  SP.jose = CAST.body({ h: COL.night, f: COL.skin, b: COL.blue, l: d });
  SP.joseShadow = CAST.body({ h: d, f: d, b: d, l: d, e: d, m: d });
  SP.zuniga = CAST.body({ h: COL.gold, f: COL.skin, b: COL.night, l: d });
  SP.esca = CAST.body({ h: d, f: COL.skin, b: COL.gold, l: COL.gold });
  SP.carmen = CAST.dress({ h: d, f: COL.skin, r: COL.red, l: d });
  SP.carmenBack = CAST.dress({ h: d, f: d, r: COL.red, e: d, m: d });   // her back: all hair
  SP.carmenWhite = CAST.dress({ h: d, f: COL.white, r: COL.white, l: d });
  SP.girl = CAST.dress({ h: d, f: COL.skin, r: '#9a7a8a', l: d });
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
// the habanera as the scene music: bass every bar, the tune every fourth
const habaneraBar = (t, b, i, vol = 0.14) => { habanera(t, b, 2); if (i % 4 === 0) sing('tenor', SLIDE, SLIDE_D, t, b * 2, { vol, light: 'lead' }); };
const toreadorBar = (t, b, i, vol = 0.13) => {
  S.key(5, 'major');
  if (i % 4 === 0) sing('tenor', TOREADOR, TOREADOR_D, t, b, { vol, light: 'lead' });
  for (let k = 0; k < 4; k++) { S.voice('bass', S.deg('1-') + (k % 2), t + k * b, b * 0.5, { vol: 0.13 }); S.drum(k % 2 ? 'hat' : 'kick', t + k * b, 0.14); }
  S.key(2, 'minor');
};

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
// a crowd: rows of small heads; lit or dim; jumping on the beat; eyes toward a point
const crowd = (y, rows, alpha, jump, lookX) => {
  for (let i = 0; i < 32; i++) for (let r = 0; r < rows; r++) {
    const x = i * 8 + 2, j = jump && (i + r + Math.floor(m.beat * 2)) % 2 ? 2 : 0;
    const col = [COL.red, COL.gold, COL.ink][(i + r) % 3];
    if (lookX != null) PX.rect(x - 1, y - 8, 6, 9, c(col, alpha * 0.5));      // a body, when they stand in the square
    PX.rect(x, y + r * 8 + j, 4, 4, c(lookX != null ? COL.skin : col, alpha));
    if (lookX != null) PX.rect(x + (lookX > x ? 2 : 1), y + r * 8 + j + 2, 1, 1, c(COL.dark));
  }
};
// the factory square: the building, its lit door up on the step
const factory = (lit = true) => {
  backdrop('#35283f');
  stageFloor(COL.sand);
  PX.rect(84, GROUND + 38, 88, 82, c('#241a2c'));
  PX.rect(110, GROUND + 50, 36, 40, c(lit ? '#8a5a42' : '#2a1a22'));
  PX.rect(106, GROUND + 48, 44, 2, c(COL.dim));
};
const tavern = () => { backdrop('#3a2230'); PX.rect(150, GROUND + 60, 6, 3, c(COL.gold)); stageFloor(COL.wood); };
const arena = (roar) => {
  backdrop('#21161c');
  crowd(66, 3, roar ? 0.9 : 0.3, roar);
  PX.rect(0, GROUND, 256, 40, c('#5a2a20'));               // the barrera
  PX.rect(0, GROUND + 38, 256, 2, c('#8a5a3a'));
  stageFloor(COL.sand);
};
const outside = () => { backdrop('#40202a'); PX.rect(0, GROUND + 62, 256, 60, c('#2a1418')); stageFloor(COL.sand); };

const ACTS = [
  // ---------------------------------------------------------------- 1 · Seville (watch)
  { watch: true, bpm: 120, beats: 10,
    captions: [[0, 'SEVILLE. THE CIGARETTE FACTORY.'], [2.6, 'EVERYONE LOOKS AT CARMEN. EXCEPT JOSÉ.']],
    render(m) {
      factory();
      const cx = Math.min(121, 10 + m.t * 42);            // she walks to the door
      crowd(GROUND + 34, 1, 0.55, false, cx);
      CAST.draw(SP.jose, 60, GROUND, { flip: true });       // on guard, facing away
      if (cx < 121) CAST.draw(SP.carmen, cx, GROUND);
      else CAST.draw(SP.carmen, 121, GROUND + 50);          // up on the step, in the door
      if (m.t > 3.4) glow(SP.carmen, 121, GROUND + 50, COL.gold, 0.6);
    },
    music: { curtain: (t, b) => { stingUp(t); }, bar: (t, b, i) => habaneraBar(t, b, i) },
  },
  // ---------------------------------------------------------------- 2 · CATCH (drag)
  // she throws the flower; slide José under it. Either way he ends up holding it
  { command: 'CATCH!', instruction: 'DRAG TO CATCH THE FLOWER', verb: 'drag', bpm: 120, beats: 16, outcomeSeconds: 4.2,
    cue: (m) => [m.x + 14, GROUND + 24],
    init(m) { m.x = 60; m.facing = 1; m.f = null; m.thrown = 0; m.got = 0; },
    onOutcome(m) { m.heart = 0; if (m.won) { m.got = 1; m.f.y = GROUND; } },
    update(m) {
      MG.drag(m, 'x', 90, 4, 240);
      if (!m.thrown && m.t > 0.7) {
        m.thrown = 1;
        const tx = rand(30, 210);
        m.f = { x: 131, y: GROUND + 60, vx: (tx - 131) / 3.4, vy: 14, w: 0 };
        S.drum('hat', S.now(), 0.15); chime(4, 0.05);
        puff(134, GROUND + 66, [COL.pink, COL.white], 6, 0.8, { life: 0.4, g: 0 });
      }
      const f = m.f;
      if (f) {
        f.vy = Math.max(-28, f.vy - 50 * timeDelta); f.w += timeDelta * 5;
        f.x += (f.vx + Math.sin(f.w) * 16) * timeDelta; f.y += f.vy * timeDelta;
        if (f.y < GROUND + 24 && f.y > GROUND + 2 && Math.abs(f.x + 2 - (m.x + 6)) < 9) { m.win(); }
        if (f.y <= GROUND) { f.y = GROUND; m.lose(); }
      }
    },
    updateOutcome(m) {
      const f = m.f;
      if (!m.got) {
        // he walks to it and picks it up
        const d = f.x - 4 - m.x;
        if (Math.abs(d) > 2) { m.x += Math.sign(d) * 70 * timeDelta; m.facing = Math.sign(d); }
        else if (m.t > 0.9) { m.got = 1; chime(2, 0.05); }
      } else if (!m.heart && m.t > 1.4) { m.heart = 1; chime(3, 0.06); chime(5, 0.05); puff(m.x + 7, GROUND + 20, [COL.pink, COL.red], 14, 1, { life: 1, g: 0.4 }); }
    },
    render(m) {
      const o = out(m), gone = o && m.t > 1;
      factory(!gone);
      if (!gone) CAST.draw(SP.carmen, 121, GROUND + 50, { pose: m.thrown && m.t < 1.2 && !o ? 'hold' : 0 });
      const f = m.f;
      if (!m.thrown) PX.draw(SP.flower, 133, GROUND + 60);
      else if (m.got) { const y = GROUND + (o && m.t > 0.9 ? 14 : 0); PX.draw(SP.flower, m.x + 10, y + 4); }
      else if (!o) glow(SP.flower, f.x, f.y, COL.gold);
      else PX.draw(SP.flower, f.x, GROUND);
      const kneel = o && !m.got && m.t > 0.9;
      CAST.draw(SP.jose, m.x, GROUND, { pose: m.got ? 'hold' : kneel ? 'kneel' : 0, flip: m.facing < 0 });
      if (m.heart) PX.draw(SP.heart, m.x + 2, GROUND + 28 + Math.round(MG.bounce() * 3));
    },
    outcome: (m) => [m.won ? 'HE CATCHES IT.' : 'HE PICKS IT UP ANYWAY.', 'HE KEEPS IT. HE IS LOST.'],
    music: {
      curtain: (t, b) => { stingUp(t); habanera(t, b, 1, 0.12); },
      bar: (t, b, i) => habaneraBar(t, b, i),
      outcome: (t, b, won) => { habanera(t, b, 1); sing('soprano', won ? ['5', '6', '5', '3'] : ['3', '2', '1', '7-'], [0.5, 0.5, 0.5, 1.5], t, b, { vol: 0.13 }); },
    },
  },
  // ---------------------------------------------------------------- 3 · the arrest (watch)
  { watch: true, bpm: 120, beats: 10,
    captions: [[0.6, 'SHE CUTS A GIRL IN A FIGHT. SHE IS ARRESTED.'], [3, 'JOSÉ IS HER GUARD.']],
    init(m) { m.scream = 0; },
    update(m) {
      if (!m.scream && m.t > 0.2) { m.scream = 1; S.voice('soprano', S.deg('5+') + 12, S.now(), 0.5, { vol: 0.12, grit: true }); S.drum('snare', S.now(), 0.25); }
      if (m.t > 3.6) m.cut('close', 112, GROUND + 12);      // the rope round her wrists
    },
    render(m) {
      factory(m.t > 0.8);
      const k = clamp((m.t - 1) / 2);                         // marched out of the door to the square
      const cx = lerp(121, 108, k), cy = lerp(GROUND + 50, GROUND, Math.min(1, k * 1.4));
      if (m.t < 0.5) PX.rect(110, GROUND + 50, 36, 40, c(COL.white, 0.9));
      if (m.t > 0.5 && k < 1) CAST.draw(SP.girl, 128, GROUND + 50, { pose: 'fall' });
      CAST.draw(SP.zuniga, lerp(132, 130, k), cy + (k < 1 ? 0 : 0));
      CAST.draw(SP.jose, 90, GROUND);
      CAST.draw(SP.carmen, cx, cy);
      for (let i = 0; i < 3; i++) glow(SP.coil, cx - 1, cy + 4 + i * 4, COL.dark);
    },
    music: { curtain: (t, b) => { S.drum('kick', t, 0.2, 'kick'); }, bar: (t, b) => { for (let k = 0; k < 4; k++) S.drum(k % 2 ? 'hat' : 'snare', t + k * b, 0.12); habanera(t, b * 1.5, 1, 0.1); } },
  },
  // ---------------------------------------------------------------- 4 · UNTIE (mash)
  // José loosens the rope round her; either way she pushes him down and runs
  { command: 'UNTIE!', instruction: 'TAP TAP TAP TO UNTIE HER', verb: 'mash', bpm: 140, beats: 12, shot: 'close', focus: () => [112, GROUND + 14],
    cue: () => [118, GROUND + 6],
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
      factory(false);
      CAST.draw(SP.zuniga, 130, GROUND);
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
    outcome: (m) => [m.won ? 'THE ROPE GIVES.' : 'THE KNOT HOLDS. SHE WRIGGLES FREE.', 'SHE RUNS. JOSÉ GOES TO JAIL FOR HER.'],
    music: {
      curtain: (t, b) => { stingUp(t); for (let i = 0; i < 6; i++) S.voice('pulse', S.deg(['1', '3', '5'][i % 3]), t + i * b / 3, b / 4, { vol: 0.06 }); },
      bar: (t, b) => { for (let i = 0; i < 12; i++) { S.voice('pulse', S.deg(['1', '3', '5', '3', '5', '1+'][i % 6]), t + i * b / 3, b / 4, { vol: 0.07, light: i % 3 ? null : 'lead' }); if (i % 3 === 0) S.voice('bass', S.deg(i % 6 ? '5-' : '1-'), t + i * b / 3, b / 2, { vol: 0.12 }); } },
      outcome: (t, b, won) => { if (won) { S.drum('snare', t, 0.2); sing('soprano', ['1+', '5', '3', '1'], [0.33, 0.33, 0.33, 1.5], t, b, { vol: 0.13 }); } else { S.drum('kick', t, 0.2); S.drum('kick', t + b, 0.2); S.voice('bass', S.deg('1-'), t + 2 * b, 1.5, { vol: 0.18 }); } },
    },
  },
  // ---------------------------------------------------------------- 5 · the tavern (watch)
  { watch: true, bpm: 120, beats: 10,
    captions: [[0, 'TWO MONTHS LATER. OUT OF JAIL.'], [2.6, 'HE KEPT THE FLOWER THE WHOLE TIME.']],
    render(m) {
      tavern();
      const jx = Math.min(100, 20 + Math.max(0, m.t - 1.2) * 60);          // he walks in with the dead flower
      CAST.draw(SP.carmenBack, 138 + Math.round(Math.sin(m.beat * PI) * 3), GROUND + Math.round(MG.bounce() * 2), { flip: Math.floor(m.beat) % 2 === 0 });
      if (m.t > 1.2) { CAST.draw(SP.jose, jx, GROUND, { pose: jx >= 100 ? 'hold' : 0 }); if (jx >= 100) glow(SP.flowerDead, 110, GROUND + 18, COL.pink, 0.4); else PX.draw(SP.flowerDead, jx + 10, GROUND + 10); }
    },
    music: { curtain: (t, b) => { stingUp(t); S.setRoom(900, 0.5, 1, t); }, bar: (t, b, i) => { S.key(2, 'major'); habaneraBar(t, b, i, 0.11); S.key(2, 'minor'); } },
  },
  // ---------------------------------------------------------------- 6 · HOLD
  // he holds the dry flower out; held, it blooms; she turns round either way
  { command: 'HOLD!', instruction: 'HOLD TO MAKE IT BLOOM', verb: 'hold', bpm: 120, beats: 14, shot: 'mid', focus: () => [124, GROUND + 22],
    cue: () => [118, GROUND + 22],
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
      tavern();
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
    outcome: (m) => [m.won ? 'IT BLOOMS. SHE TURNS.' : 'IT DROOPS. SHE TURNS ANYWAY.', 'SHE WANTS HIM TO DESERT. HE DOES.'],
    music: {
      curtain: (t, b) => { stingUp(t); S.setRoom(900, 0.5, 1, t); sing('tenor', ['5', '5', '6', '5'], [0.5, 0.5, 0.5, 1.5], t, b * 0.5, { vol: 0.12, vibrato: 6 }); },
      bar: (t, b, i) => { S.key(2, 'major'); habanera(t, b, 2, 0.09); if (i % 4 === 0) sing('tenor', SLIDE, SLIDE_D, t, b * 2, { vol: 0.12, vibrato: 7, light: 'lead' }); S.key(2, 'minor'); },
      outcome: (t, b, won) => { S.setRoom(2400, 0.4, 2, t); if (won) sing('tenor', ['1+', '7', '6', '5'], [0.5, 0.5, 0.5, 2], t, b, { vol: 0.13, vibrato: 8 }); else sing('tenor', ['5', '4b', '3', '1-'], [0.5, 0.5, 0.5, 2], t, b, { vol: 0.13, grit: true }); },
    },
  },
  // ---------------------------------------------------------------- 7 · Escamillo (watch)
  { watch: true, bpm: 120, beats: 12,
    captions: [[0.4, 'ESCAMILLO. THE TOREADOR.'], [3.4, 'JOSÉ IS JEALOUS.']],
    init(m) { m.bang = 0; m.bits = []; },
    update(m) {
      if (!m.bang && m.t > 0.3) { m.bang = 1; S.drum('kick', S.now(), 0.3); S.drum('crowd', S.now(), 0.25); }
      if (m.t > 3.2) m.cut('close', 106, GROUND + 12);      // close on José
      if (m.t > 3.4 && Math.floor(m.t * 8) !== Math.floor((m.t - timeDelta) * 8)) puff(106, GROUND + 2, [COL.green], 2, 0.5, { life: 0.7, g: -0.3, s0: 1, s1: 1 });
    },
    render(m) {
      tavern();
      PX.rect(236, GROUND, 20, 60, c(m.bang ? '#f0d890' : '#1a1020'));   // the door, flung open
      crowd(GROUND + 46, 1, m.bang ? 0.9 : 0.3, m.bang);
      const ex = Math.max(176, 236 - Math.max(0, m.t - 0.3) * 50);
      if (m.bang) glow(SP.esca, ex, GROUND, COL.gold, 0.7, { pose: ex <= 176 ? 'hold' : 0 });
      CAST.draw(SP.carmen, 138, GROUND, { flip: m.t > 1 });                  // she turns to look at him
      const g = clamp((m.t - 3.4) / 2.2);                                  // José goes green, from the feet up
      CAST.draw(SP.jose, 100, GROUND, { flip: true, color: new Color(1 - g * 0.6, 1, 1 - g * 0.75) });
      if (m.t > 4.4) say('GREEN = JEALOUS', 118, GROUND + 6, COL.green);
    },
    music: {
      curtain: (t, b) => { S.setRoom(900, 0.5, 1, t); },
      bar: (t, b, i) => { if (i === 0) toreadorBar(t, b, 0, 0.14); else { for (let k = 0; k < 4; k++) S.voice('bass', S.deg('1-') + (k % 2), t + k * b, b * 0.6, { vol: 0.14, grit: 0.5 }); S.drone(S.deg('1-'), t, 4 * b, { tritone: true, vol: 0.04 }); } },
    },
  },
  // ---------------------------------------------------------------- 8 · FLIP (tap)
  // three cards face down; each press turns the next one; every one is the spade
  { command: 'FLIP!', instruction: 'TAP TO TURN ALL 3 CARDS', verb: 'tap', bpm: 110, beats: 10, shot: 'mid', focus: () => [122, GROUND + 22],
    cue: (m) => [108 + Math.min(m.n, 2) * 22, GROUND + 24],
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
    outcome: (m) => [m.won ? 'SPADE. SPADE. SPADE.' : 'THE WIND TURNS THE REST.', 'THE CARDS SAY DEATH. SHE SHRUGS.'],
    music: {
      curtain: (t, b) => { S.drone(S.deg('1-'), t, 3 * b, { tritone: true, vol: 0.05 }); S.drum('kick', t, 0.16, 'kick'); },
      bar: (t, b) => { S.drone(S.deg('1-'), t, 4.2 * b, { tritone: true, vol: 0.05 }); S.drum('kick', t, 0.14); S.drum('kick', t + 2 * b, 0.14); S.voice('soprano', S.deg('5'), t + b, 1.2, { vol: 0.09 }); },
      outcome: (t, b) => { S.drum('snare', t, 0.22, 'kick'); sing('soprano', ['5', '4', '3'], [1, 1, 2], t + b * 0.5, b, { vol: 0.14 }); S.drone(S.deg('1-'), t, 4 * b, { tritone: true, vol: 0.06 }); },
    },
  },
  // ---------------------------------------------------------------- 9 · the bullring (watch)
  { watch: true, bpm: 120, beats: 8,
    captions: [[0, 'SEVILLE. THE BULLRING. CARMEN IS WITH ESCAMILLO NOW.']],
    render(m) {
      arena(true);
      const k = Math.min(1, m.t / 2.4);
      CAST.draw(SP.esca, lerp(20, 116, k), GROUND);
      CAST.draw(SP.carmen, lerp(4, 100, k), GROUND);
      glow(SP.joseShadow, 224, GROUND, COL.green, 0.7);      // José at the gate, green-rimmed
    },
    music: { curtain: (t, b) => { S.setRoom(3200, 0.45, 1, t); S.drum('crowd', t, 0.2); }, bar: (t, b, i) => toreadorBar(t, b, i) },
  },
  // ---------------------------------------------------------------- 10 · GLORY (tap)
  // the bull charges three times; jump it; tossed or not, the crowd is his
  { command: 'GLORY!', instruction: 'TAP TO JUMP THE BULL', verb: 'tap', bpm: 140, beats: 16, shot: 'mid', focus: () => [122, GROUND + 30],
    cue: (m) => [m.x + 14, GROUND + 26],
    init(m) { m.x = 122; m.y = 0; m.vy = 0; m.bull = null; m.charges = 0; m.passes = 0; m.next = 0.4; m.ole = 0; m.timeoutWins = true; },
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
      arena(roar);
      if (o && m.t > 1.2) glow(SP.joseShadow, 224, GROUND, COL.green, 0.6);   // José, at the gate
      if (m.bull) PX.draw(SP.bull, m.bull.x, GROUND, { flip: m.bull.dir < 0 });
      // tossed: up, over, down, and up again
      const tt = o && !m.won ? Math.max(0, m.t) : 9;
      if (tt < 0.8) CAST.draw(SP.esca, m.x, GROUND + Math.sin(tt / 0.8 * PI) * 40, { pose: 'jump', angle: tt * 9 });
      else if (tt < m.up) CAST.draw(SP.esca, m.x, GROUND, { pose: 'fall' });
      else glow(SP.esca, m.x, GROUND + (o ? Math.round(MG.bounce() * 2) : m.y), COL.white, o ? 0.5 : 0, { pose: m.y > 0 ? 'jump' : roar ? 'hold' : 0 });
      if (m.ole > 0.3) say('OLÉ !', m.x + 16, GROUND + 30, COL.gold);
      if (roar && m.t > m.up + 0.2) say('OLÉ !', m.x + 16, GROUND + 30, COL.gold);
    },
    renderOutcome: verdictDraw,
    outcome: (m) => [m.won ? 'THREE CLEAN PASSES.' : 'TOSSED. HE GETS UP. HE BOWS ANYWAY.', 'THE CROWD IS HIS. JOSÉ WAITS OUTSIDE.'],
    music: {
      curtain: (t, b) => { stingUp(t); S.setRoom(3200, 0.45, 1, t); S.drum('crowd', t, 0.18); sing('pulse', ['1', '3', '5', '1+'], [0.25, 0.25, 0.25, 1], t + b * 0.5, b, { vol: 0.09 }); },
      bar: (t, b, i) => toreadorBar(t, b, i),
      outcome: (t, b, won) => { S.key(5, 'major'); if (won) { S.drum('crowd', t, 0.25); sing('tenor', ['5', '5', '5', '1+'], [0.33, 0.33, 0.33, 2], t, b, { vol: 0.15 }); S.arp('I', 2.5 * b, 25, t + b, { vol: 0.07, octave: 1 }); } else { S.drum('snare', t, 0.25); S.voice('bass', S.deg('1-'), t, 2, { vol: 0.16, grit: true }); } S.key(2, 'minor'); },
    },
  },
  // ---------------------------------------------------------------- 11 · outside the arena (watch)
  // he walks up a step a beat and kneels with her ring
  { watch: true, bpm: 120, beats: 12, shot: 'wide',
    captions: [[0.5, 'JOSÉ BEGS HER TO COME BACK.']],
    init(m) { m.step = 0; m.jx = 84; },
    update(m) {
      const step = Math.min(12, Math.floor(m.beat));
      if (step > m.step && m.jx < 156) { m.step = step; m.jx = Math.min(156, 84 + step * 8); S.drum('kick', S.now(), 0.18, 'kick'); }
      if (m.t > 4.5) m.cut('mid', 176, GROUND + 22);
    },
    render(m) {
      outside();
      CAST.draw(SP.carmen, 196, GROUND, { flip: true });
      const there = m.jx >= 156;
      CAST.draw(SP.jose, m.jx, GROUND, { pose: there ? 'kneel' : 0 });
      if (there) glow(SP.ring, m.jx + 14, GROUND + 8 + Math.round(MG.bounce() * 2), COL.white);
      if (m.t > 5) say('JAMAIS !', 172, GROUND + 30);
    },
    music: {
      curtain: (t, b) => { stingUp(t); S.setRoom(600, 0.55, 1, t); },
      bar: (t, b) => { for (let k = 0; k < 4; k++) S.voice('tenor', S.deg(k % 2 ? '2b' : '1'), t + k * b, b * 0.6, { vol: 0.12, grit: 0.75, light: 'lead' }); S.voice('soprano', S.deg('5+'), t + 2 * b, 1.4 * b, { vol: 0.1 }); },
    },
  },
  // ---------------------------------------------------------------- 12 · the knife (watch)
  // second by second: the ring thrown back, the knife, the flash, the crowd inside, her last word
  { watch: true, bpm: 120, beats: 16, shot: 'mid', focus: () => [176, GROUND + 22],
    captions: [[0, 'SHE THROWS HIS RING BACK.'], [2, 'JOSÉ HAS A KNIFE.'], [4, 'HE STABS HER.'], [6, 'INSIDE, THE CROWD CHEERS ESCAMILLO.']],
    init(m) { m.land = 0; m.blood = []; m.hit = 0; m.ole = 0; },
    update(m) {
      settle(m.blood);
      const k = clamp(m.t / 0.6);
      m.rx = lerp(188, 176, k); m.ry = GROUND + 14 * (1 - k) + Math.sin(k * PI) * 20;
      if (k >= 1 && !m.land) { m.land = 1; chime(6, 0.04); S.drum('hat', S.now(), 0.12); }
      if (m.t > 2 && m.t < 4) m.cut('close', 168, GROUND + 12); else if (m.t >= 4) m.cut('mid', 176, GROUND + 22);
      if (m.t > 4.2 && !m.hit) {
        m.hit = 1; S.drum('snare', S.now(), 0.3, 'knife');
        m.blood.push(puff(200, GROUND + 14, [COL.red, COL.pink], 30, 0.9, { life: 1.6, keep: 1, g: 0.8, damp: 0.93, size: 8 }));
      }
      if (m.t > 6 && !m.ole) { m.ole = 1; S.drum('crowd', S.now(), 0.3); }
      if (m.hit && S.now() - m.hitAt < 0.4) setCameraPos(cameraPos.add(vec2(randInt(-2, 3), randInt(-2, 3))));
      if (m.hit && !m.hitAt) m.hitAt = S.now();
    },
    render(m) {
      outside();
      const fallen = m.t > 4.2;
      if (fallen) CAST.draw(SP.carmen, 200, GROUND, { pose: 'fall' });
      else CAST.draw(SP.carmen, 196, GROUND, { flip: true, pose: m.t < 0.5 ? 'hold' : 0 });
      const g = m.t < 2 ? 1 : clamp(1 - (m.t - 2) / 1.5);   // the green drains to black
      const jx = fallen ? 178 : 156;
      CAST.draw(SP.jose, jx, GROUND, { pose: m.t < 2 && !fallen ? 'kneel' : 0, color: new Color(1 - 0.6 * g, 1, 1 - 0.75 * g) });
      if (m.t < 4.2) PX.draw(SP.ring, m.rx, m.ry);
      if (m.t > 2.6 && m.t < 4.4) glow(SP.knife, jx + 12, GROUND + 12, COL.white, 0.5 + 0.5 * MG.bounce());
      if (m.t > 4.2 && m.t < 4.32) PX.rect(0, 0, 256, 144, c(COL.white, 0.9));
      if (m.ole && m.t < 7.2) say('OLÉ !', 250, GROUND + 60, COL.gold);
      if (m.t > 7) say('MERDE...', 214, GROUND + 6);       // the wink: her last word, deadpan
    },
    music: {
      curtain: (t, b) => { S.setRoom(600, 0.55, 1, t); S.voice('tenor', S.deg('1-'), t, 2 * b, { vol: 0.12, grit: 0.5 }); },
      bar: (t, b, i) => { if (i === 1) { const k = t + 0.2; S.drum('snare', k, 0.3); S.voice('bass', S.deg('1-'), k + 0.1, 1.5, { vol: 0.18 }); S.arp('i', 1.6, 25, k + 0.3, { vol: 0.06, octave: 1 }); S.setRoom(320, 0.6, 1.5, k); } else if (i < 3) S.drone(S.deg('1-'), t, 4 * b, { tritone: i === 0, vol: 0.05 }); },
    },
  },
  // ---------------------------------------------------------------- 13 · Libre (toy)
  // the stage empties; José alone; red petals fall; a touch stirs them
  { toy: true, verb: 'tap', bpm: 120, beats: 24, outcomeSeconds: 3.5, shot: 'wide',
    cue: () => [150, GROUND + 40],
    init(m) { m.falls = []; m.last = 0; m.n = 0; S.setRoom(3600, 0.55, 2); },
    update(m) {
      if (!m.falls.length) {
        m.falls.push(new ParticleEmitter(vec2(128, 150), 0, vec2(260, 16), 0, 26, PI, SP.petal.tile, c(COL.red), c(COL.pink), c(COL.red), c(COL.pink),
          9, 3, 3, 0.1, 0.06, 0.96, 1, 0.9, PI, 0.1, 0.4));
      }
      settle(m.falls);
      // a touch stirs the petals near it, and sounds a note
      if (m.down || m.press) {
        let any = 0;
        for (const e of m.falls) for (const p of e.particles) {
          const dx = p.pos.x - m.px, dy = p.pos.y - m.py;
          if (dx * dx + dy * dy < 400) { p.velocity.set(dx * 0.02 + rand(-0.3, 0.3), 0.4 + rand(0, 0.4)); p.angleVelocity = 0.2; any = 1; }
        }
        if (any && m.t - m.last > 0.12) { chime(m.n++ % 7, 0.045); m.last = m.t; }
      }
    },
    updateOutcome(m) { settle(m.falls); },
    render(m) {
      backdrop('#000000');
      stageFloor('#0d0810');
      const g = 0.5 + 0.5 * MG.bounce(m.t * 0.25);
      glow(SP.jose, 122, GROUND, '#8a7a7a', 0.25 * g, { pose: 'idle', color: c('#cfc0c8') });
    },
    outcome: () => ['SHE IS FREE.'],
    music: {
      curtain: (t, b) => {
        // a lament: a falling bass, a long soprano line, the room open; two loud chords at the end (not a quote)
        sing('bass', ['1-', '7--', '6b--', '5--', '1-', '7--', '6b--', '5--'], [3, 3, 3, 3], t, b, { vol: 0.12, legato: 0.98 });
        sing('soprano', ['5', '6b', '5', '3', '1', '2', '1', '.', '5', '4', '3', '1'], [2, 2, 2, 2, 2, 1, 3, 2, 1.5, 1.5, 2, 3], t + 2 * b, b, { vol: 0.12, vibrato: 5, legato: 0.98 });
        S.arp('i', 1.2, 30, t + 21 * b, { vol: 0.12, octave: 1 }); S.arp('i', 1.6, 30, t + 22.5 * b, { vol: 0.14, octave: 1 });
      },
      outcome: (t) => { S.silence(t + 2.8, 1.2); },
    },
  },
];
// every game gets the verdict: the sting at the first frame of the outcome
for (const a of ACTS) if (!a.watch) { const on = a.onOutcome; a.onOutcome = (m) => { verdict(m); on?.(m); }; }

MG.opera({
  title: 'CARMEN',
  sub: 'BIZET · FIVE GAMES · TWO MINUTES',
  key: [2, 'minor'],
  colours: COL,
  sprites: carmenSprites,
  ending: (m, bravos) => bravos === 5 ? ['CARMEN IS DEAD.', 'YOU DID EVERYTHING RIGHT.']
    : bravos === 0 ? ['CARMEN IS DEAD.', 'YOU DID NOTHING RIGHT. SAME ENDING.']
    : ['CARMEN IS DEAD.', 'IT WAS NEVER UP TO YOU.'],
  music: { result: (t, n) => { S.setRoom(3600, 0.5, 1, t); for (let i = 0; i < 4; i++) S.arp(['i', 'VI', 'III', 'VII'][i], 0.9, 25, t + i, { vol: 0.07, octave: 1 }); S.voice('soprano', S.deg('5+'), t + 4, 2.4, { vol: 0.12 }); } },
  renderTitle: () => { stageFloor(COL.sand); CAST.draw(SP.carmen, 121, GROUND); PX.draw(SP.flower, 104, GROUND + 2 + Math.round(MG.bounce(timeReal) * 3)); },
  renderResult: () => { stageFloor(COL.dark); CAST.draw(SP.jose, 100, GROUND); CAST.draw(SP.carmenWhite, 130, GROUND, { pose: 'fall' }); },
  acts: ACTS,
});
