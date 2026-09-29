/* IL BARBIERE DI SIVIGLIA: six operatic microgames.
   Rossini, 1816. C major, and it only gets faster. Almaviva in sky blue,
   Rosina in rose, Bartolo in the white wig and the snuff-brown coat, Figaro
   in the striped apron, all on a Seville night: plum-dark walls, a dark floor,
   gold only for the thing you are playing for. A farce, so losing is the
   slapstick version of the same beat and the plot marches on regardless.
   One job per act: tap on the beat, sneak, balance, follow the key, lather
   (the toy: Largo al factotum, pure foam), carry the ladder.
   Tunes quoted from memory as scale degrees; check them against the score. */

'use strict';

const SP = {};
const COL = {
  bg: '#120c1c', ink: '#fbead0', dim: '#9a88a8', card: '#fbead0', cardInk: '#120c1c',
  bravo: '#ffd23a', tragic: '#ff5a64', fuse: '#fbead0',
  wall: '#1f1630', wall2: '#281d3c', floor: '#2f2242', line: '#54406c', night: '#0c0a1e',
  gold: '#ffd23a', glow: '#ffc861', crimson: '#c8303e', cream: '#fbead0', rose: '#f58cb0', sky: '#5aa9e6',
  skin: '#f1c9a5', hair: '#4a2a1c', eye: '#1a1020', coat: '#b0662e', slate: '#7a8aaa', white: '#ffffff',
  green: '#5fbf6a', wood: '#8a5a34', woodD: '#4e3222', foam: '#ffffff', boot: '#2a1a14',
};
const c = PX.c;
PX.SCALE = 2;
const GROUND = MG.GROUND;
const OUT = MG.phase.OUTCOME, ACTION = MG.phase.ACTION;
const say = (t, x, y, col = COL.ink) => MG.say(t, x, y, col, COL.eye);
const sing = MG.sing;
const ease = (t) => clamp(t, 0, 1);

function barberSprites() {
  setGravity(vec2(0, -0.04));      // confetti falls, bubbles (negative gravity scale) rise
  // the cast, animated (lib/cast.js)
  const body = (h, f, b, l, T) => CAST.body({ h, f, b, l, e: COL.eye }, T);
  SP.almaviva = body(COL.hair, COL.skin, COL.sky, COL.boot);
  SP.soldier = body(COL.crimson, COL.skin, COL.crimson, COL.boot);       // Almaviva's drunken officer disguise
  SP.alonzo = body(COL.hair, COL.skin, COL.slate, COL.slate);            // Don Alonso, the music master, in his robe
  SP.figaro = CAST.body({ h: COL.hair, f: COL.skin, b: COL.green, s: COL.cream, g: COL.green, l: COL.wood, e: COL.eye }, ['.sgsg.', 'sgsgsg', 'f.gs.f', '..sg..']);
  SP.bartolo = body(COL.white, COL.skin, COL.coat, COL.boot);            // white wig
  SP.rosina = CAST.dress({ h: COL.hair, f: COL.skin, r: COL.rose, e: COL.eye, l: COL.boot });
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
  SP.pen = PX.sprite(['...w', '..ww', '.gg.', 'gg..'], { w: COL.white, g: COL.gold });
  SP.ladder = PX.sprite(Array.from({ length: 24 }, (_, i) => i % 4 === 1 ? 'wwwwww' : 'w....w'), { w: COL.wood });
  SP.zz = PX.sprite(['www', '..w', '.w.', 'w..', 'www'], { w: COL.white });
}

// ---- feeling per byte: particles, a shake, a flash, a sting ----
// a burst of n pixel squares (or a sprite, o.tile) from x, y in colours a and b; o.g < 0 floats up
const fx = (x, y, a, b, n, o = {}) => new ParticleEmitter(vec2(x, y), o.ang || 0, o.w ?? 4, o.time ?? 0.1, n / (o.time ?? 0.1), o.cone ?? PI,
  o.tile?.tile, c(a), c(b), c(a, 0), c(b, 0), o.life ?? 1.2, o.s ?? 3, o.e ?? 2, o.v ?? 1.5, 0, o.damp ?? 0.93, 1, o.g ?? 1, 0, 0.2, 0.4);
const confetti = (x, y, n = 60) => { fx(x, y, COL.gold, COL.rose, n / 2, { v: 2.2, cone: 0.9, life: 2 }); fx(x, y, COL.sky, COL.white, n / 2, { v: 2.2, cone: 0.9, life: 2 }); };
const hearts = (x, y, n = 8) => fx(x, y, COL.rose, COL.crimson, n, { tile: SP.heart, s: 6, e: 5, v: 0.6, g: -0.4, life: 1.6, w: 10 });
const stars = (x, y) => fx(x, y, COL.gold, COL.white, 10, { tile: SP.star, s: 5, e: 3, v: 1.2, g: 0, life: 0.7 });
const bubbles = (x, y, n = 10, w = 16) => fx(x, y, COL.white, COL.sky, n, { tile: SP.bubble, s: 5, e: 7, v: 0.5, g: -0.5, life: 2, damp: 0.96, w });
// the verdict in the first frames: a white flash for a win, a thud of dark for a loss, and a shake
const verdict = (m) => {
  if (m.phase !== OUT || m.act.toy) return;
  if (m.won && m.t < 0.09) PX.rect(0, 0, 256, 144, c(COL.white, 0.55 * (1 - m.t / 0.09)));
  if (!m.won && m.t < 0.5) PX.rect(0, 0, 256, 144, c(COL.bg, 0.6 - m.t * 1.2));
};
const shaking = (m) => { if (m.shake > 0) { m.shake -= timeDelta * 2.5; setCameraPos(cameraPos.add(vec2(rand(-2, 2), rand(-2, 2)).scale(m.shake))); } };
const yay = (t = S.now()) => { ['1', '3', '5', '1+', '3+', '5+'].forEach((d, k) => S.voice('pulse', S.deg(d) + 12, t + k * 0.05, 0.12, { vol: 0.07 })); S.drum('hat', t, 0.12); };
const boo = (t = S.now()) => { S.drum('kick', t, 0.22); [4, 3, 2].forEach((d, k) => S.voice('pulse', d - 12, t + k * 0.2, k === 2 ? 0.6 : 0.16, { vol: 0.09, slide: k === 2 ? -3 : 0 })); };
// a shout in world space: at a mid shot it reads at twice the size of a caption
const shout = (t, x, y, col = COL.ink) => { PX.rect(x - 2, y - 2, PX.textWidth(t) + 4, 9, c(COL.eye)); PX.text(t, x, y, c(col)); };
const bonk = (m, x, y) => { m.shake = 1; S.drum('snare', S.now(), 0.25); stars(x, y); };

// the interior: a plum wall with a darker panel line, the floor
const room = () => { PX.rect(0, GROUND, 256, 120, c(COL.wall)); PX.rect(0, GROUND + 12, 256, 2, c(COL.wall2)); MG.floor(COL.floor, COL.line); };
// the balcony window, lit from inside; Rosina stands in it
const windowLit = (x, y, lit) => {
  PX.rect(x - 2, y - 2, 36, 38, c(COL.woodD));
  PX.rect(x, y, 32, 34, c(COL.night));
  PX.rect(x, y, 32, 34, c(COL.glow, 0.15 + 0.55 * lit));
  PX.rect(x - 6, y - 4, 44, 3, c(COL.wood));
};
// the Rossini crescendo sting: the same figure, each act a tone higher and faster
const crescendo = (t, b, i) => { for (let k = 0; k < 8; k++) S.voice('pulse', S.deg(['1', '3', '5', '1+'][k % 4]) + i * 2, t + k * b / 4, b / 5, { vol: 0.05 + k * 0.006 }); };
const LARGO = TUNES.largo.notes.filter((n) => n !== '.');   // the entry, checked: docs/MUSIC.md
// a sprite standing on its feet at fx, tipped by angle a (clockwise), pivoting on the feet
const tipped = (s, fx0, y, a, o = {}) => PX.draw(s, fx0 + Math.sin(a) * s.h - s.w, y + Math.cos(a) * s.h - s.h, { ...o, angle: a });

MG.opera({
  title: 'IL BARBIERE',
  sub: 'ROSSINI · SIX MICROGAMES',
  key: [0, 'major'],
  colours: COL,
  sprites: barberSprites,
  ending: (m, n) => n === 5 ? ['MARRIED. FIGARO SENDS THE BILL.']
    : n === 0 ? ['MARRIED ANYWAY. IT IS A COMEDY.']
    : ['MARRIED ANYWAY. BARTOLO KEEPS THE LADDER.'],
  music: { result: (t) => { S.setRoom(3600, 0.5, 1, t); for (let i = 0; i < 4; i++) S.arp(['I', 'IV', 'V', 'I'][i], 0.6, 25, t + i * 0.6, { vol: 0.07, octave: 1 }); sing('tenor', ['5', '3', '1'], [0.25, 0.25, 1.5], t + 2.4, 0.5, { vol: 0.14 }); } },
  renderTitle: () => { MG.floor(COL.floor, COL.line); PX.rect(200, GROUND, 56, 120, c(COL.wall)); windowLit(212, GROUND + 60, 1); CAST.draw(SP.rosina, 221, GROUND + 60); CAST.draw(SP.figaro, 40, GROUND); CAST.draw(SP.almaviva, 150, GROUND); PX.draw(SP.guitar, 158, GROUND + 6); },
  renderResult: () => { MG.floor(COL.floor, COL.line); CAST.draw(SP.almaviva, 112, GROUND); CAST.draw(SP.rosina, 128, GROUND); PX.draw(SP.heart, 122, GROUND + 22, { scale: 1, color: c(COL.rose) }); CAST.draw(SP.figaro, 64, GROUND); CAST.draw(SP.bartolo, 190, GROUND); PX.draw(SP.ladder, 222, GROUND); },

  acts: [
    // ---------------------------------------------------------------- I
    // Almaviva under the window: strum as the gold ring closes on the note. Six good strums
    // light her window. Either way she drops him a note and he calls himself Lindoro.
    { name: 'ACT I · THE STREET', aria: 'ECCO RIDENTE IN CIELO', command: 'SERENADE!', bpm: 120, beats: 16, verb: 'tap on the beat', shot: 'mid', focus: () => [168, 50],
      init(m) { m.hits = 0; m.pop = 0; m.bad = 0; },
      update(m) {
        if (m.press) {
          if (Math.abs(m.beat - Math.round(m.beat)) < 0.2) {
            m.hits++; m.pop = 1;
            S.voice('pulse', S.deg(['1', '3', '5', '1+'][m.hits % 4]) + 12, S.now(), 0.25, { vol: 0.09 });
            fx(146, GROUND + 44, COL.gold, COL.glow, 3, { tile: SP.note, s: 7, e: 5, v: 1.3, ang: 1.3, cone: 0.2, g: 0, damp: 1, life: 0.9, w: 2 });
            if (m.hits >= 6) m.win();
          } else { m.bad = 1; m.hits = Math.max(0, m.hits - 1); S.voice('bass', S.deg('1-') + 1, S.now(), 0.2, { vol: 0.14, grit: true, slide: -2 }); }
        }
      },
      updateOutcome(m) { if (!m.won && !m.bonked && m.t > 0.35) { m.bonked = 1; bonk(m, 138, GROUND + 24); CAST.hit(SP.almaviva); } },
      onOutcome(m) { if (m.won) { yay(); hearts(212, GROUND + 50, 10); fx(212, GROUND + 50, COL.glow, COL.white, 30, { v: 1.8 }); } else boo(); },
      render(m) {
        shaking(m);
        const out = m.phase === OUT;
        m.pop = Math.max(0, m.pop - timeDelta * 4); m.bad = Math.max(0, m.bad - timeDelta * 4);
        PX.rect(180, GROUND, 76, 120, c(COL.wall));
        MG.floor(COL.floor, COL.line);
        windowLit(196, GROUND + 26, out ? 1 : Math.min(1, m.hits / 6));
        CAST.draw(SP.rosina, 205, GROUND + 26);
        // Almaviva; on the slapstick side the note bonks him and he reels
        const reel = out && !m.won && m.t > 0.35 && m.t < 1.3;
        CAST.draw(SP.almaviva, 128, GROUND, { angle: reel ? 0.35 * Math.sin(m.t * 14) : 0 });
        PX.draw(SP.guitar, 136, GROUND + 6);
        if (m.phase === ACTION) {
          // the beat: a big gold note, and a ring that closes on it exactly on the beat
          const f = m.beat % 1, s = Math.round(16 + 26 * (1 - f)), cx = 146, cy = GROUND + 44;
          const col = c(m.bad > 0 ? COL.tragic : m.pop > 0 ? COL.white : COL.gold);
          PX.draw(SP.note, cx - 7 + (m.bad > 0 ? rand(-2, 2) : 0), cy - 7, { scale: 3 + (f < 0.15 ? 0.4 : 0), color: col });
          const ringCol = c(COL.gold, 0.35 + 0.65 * f), h = s / 2;
          PX.rect(cx - h, cy - h, s, 1, ringCol); PX.rect(cx - h, cy + h - 1, s, 1, ringCol);
          PX.rect(cx - h, cy - h, 1, s, ringCol); PX.rect(cx + h - 1, cy - h, 1, s, ringCol);
        }
        if (out) {
          // her note: on the good side it flutters into his hand, on the other it drops like a stone on his head
          const k = m.won ? ease((m.t - 0.2) / 1.2) : ease(m.t / 0.35);
          const nx = 210 + (140 - 210) * k + (m.won ? Math.sin(m.t * 7) * 6 * (1 - k) : 0);
          const ny = GROUND + 46 + ((m.won || m.t > 1.3 ? GROUND + 12 : GROUND + 22) - GROUND - 46) * k;
          PX.draw(SP.letter, nx, ny);
          if (m.t > 1.5) shout('LINDORO!', 110, GROUND + 30, COL.gold);
        }
        verdict(m);
      },
      outcome: (m) => m.won ? ['SHE DROPS HIM A NOTE. HE SAYS HE IS LINDORO.'] : ['HER NOTE HITS HIS HEAD. HE IS LINDORO ANYWAY.'],
      music: {
        curtain: (t, b) => { MG.sting(t, 'I'); crescendo(t + b, b, 0); },
        bar: (t, b, i) => { for (let k = 0; k < 4; k++) { S.voice('bass', S.deg(k % 2 ? '5-' : '1-'), t + k * b, b * 0.3, { vol: 0.12 }); S.voice('arp', S.deg(['3', '5'][k % 2]), t + k * b + b / 2, b * 0.2, { vol: 0.06 }); } if (i % 4 === 0) sing('tenor', TUNES.eccoRidente.notes, TUNES.eccoRidente.durs, t, b * 1.2, { vol: 0.11, vibrato: 5, light: 'lead' }); },
        outcome: (t, b, won) => { if (won) sing('soprano', ['5', '6', '7', '1+'], [0.33, 0.33, 0.33, 1.5], t, b, { vol: 0.13 }); else { S.drum('thunder', t, 0.2); S.voice('bass', S.deg('1-'), t + 0.2, 1, { vol: 0.16, grit: true }); } },
      },
    },
    // ---------------------------------------------------------------- II
    // Rosina nudges her letter across the floor to the gold light under the door, where
    // Figaro waits. Bartolo reads his paper; when it drops, freeze. Either way it goes under.
    { name: "ACT I · ROSINA'S ROOM", aria: 'UNA VOCE POCO FA', command: 'SLIP!', bpm: 135, beats: 14, verb: 'mash when he is not looking', shot: 'mid', focus: () => [128, 50],
      init(m) { m.lx = 120; m.to = 120; m.looking = false; m.warn = false; m.nextLook = 1.6; m.caught = false; m.kick = 0; },
      update(m) {
        // Bartolo lowers his paper on a schedule: it trembles for a beat, then he looks for a beat and a half
        const b = MG.beat();
        m.warn = !m.looking && m.t >= m.nextLook - b;
        if (!m.looking && m.t >= m.nextLook) { m.looking = true; m.lookEnd = m.t + 1.5 * b; S.drum('breath', S.now(), 0.3); }
        if (m.looking && m.t >= m.lookEnd) { m.looking = false; m.nextLook = m.t + 1.5 * b + rand(0, 1.5 * b); }
        if (m.warn && Math.random() < 0.1) S.drum('breath', S.now(), 0.12);
        if (m.press) {
          if (m.looking) { m.caught = true; m.lose(); }
          else { m.to = Math.min(164, m.to + 3); m.kick = 1; S.drum('hat', S.now(), 0.1); S.voice('arp', S.deg('1+') + (m.to - 120) / 4, S.now(), 0.08, { vol: 0.05 }); }
        }
        if (m.to >= 164) m.win();
      },
      onOutcome(m) { if (m.won) { yay(); fx(170, GROUND + 2, COL.gold, COL.white, 30, { v: 1.6, cone: 1.2 }); } else { boo(); m.shake = 1; S.drum('snare', S.now(), 0.25); } },
      render(m) {
        shaking(m);
        const out = m.phase === OUT, t = m.t;
        m.kick = Math.max(0, m.kick - timeDelta * 6);
        m.lx += (m.to - m.lx) * Math.min(1, timeDelta * 14);
        room();
        // the door on the right, a line of gold light under it: Figaro is outside
        PX.rect(166, GROUND, 26, 54, c(COL.woodD)); PX.rect(168, GROUND + 2, 22, 50, c(COL.wood)); PX.rect(170, GROUND + 26, 3, 3, c(COL.gold));
        PX.rect(166, GROUND - 1, 26, 3, c(COL.gold, 0.6 + 0.4 * MG.bounce()));
        // Bartolo in his armchair behind the paper; the paper drops when he looks
        const look = out || m.looking;
        PX.rect(66, GROUND, 30, 28, c(COL.crimson)); PX.rect(66, GROUND, 30, 12, c(COL.woodD));
        CAST.draw(SP.bartolo, 75, GROUND + 6);
        PX.draw(SP.paper, 73 + (m.warn ? rand(-1, 1) : 0), look ? GROUND + 8 : GROUND + 16);
        if (m.phase === ACTION && m.looking) PX.text('!', 84, GROUND + 32, c(COL.tragic), { scale: 3 });
        // Rosina and the letter on the floor
        const jump = out && !m.won && t < 0.6 ? 6 : 0;
        CAST.draw(SP.rosina, 108 + m.kick * 2, GROUND + jump, { pose: jump ? 'jump' : 0 });
        const gone = out && (m.won ? t > 0.15 : t > 0.45);
        if (!gone) PX.draw(SP.letter, out ? m.lx + (164 - m.lx) * ease((t - (m.won ? 0 : 0.3)) / 0.15) : m.lx, GROUND);
        if (out) {
          if (!m.won && t < 1.2) shout(m.caught ? 'AH-HA!' : 'EH?', 70, GROUND + 34, COL.tragic);
          if (t > 1.3) { shout('HM?', 76, GROUND + 34); shout('GRAZIE!', 150, GROUND + 56, COL.gold); }
        }
        verdict(m);
      },
      outcome: (m) => m.won ? ['UNDER THE DOOR. THE LETTER IS ON ITS WAY.'] : [m.caught ? 'AH-HA! SHE KICKS IT UNDER THE DOOR ANYWAY.' : 'TOO SLOW. SHE KICKS IT UNDER THE DOOR ANYWAY.'],
      music: {
        curtain: (t, b) => { MG.sting(t, 'I'); crescendo(t + b, b, 1); },
        bar: (t, b, i) => { for (let k = 0; k < 4; k++) S.voice('bass', S.deg(k % 2 ? '5-' : '1-'), t + k * b, b * 0.3, { vol: 0.11 }); if (i % 4 === 0) sing('soprano', TUNES.unaVoce.notes, TUNES.unaVoce.durs, t, b, { vol: 0.1, light: 'lead' }); },
        outcome: (t, b, won) => { if (won) sing('soprano', ['1+', '2+', '3+'], [0.33, 0.33, 1.5], t, b, { vol: 0.13 }); else { S.drum('snare', t, 0.2); sing('bass', ['5-', '1-'], [0.5, 1.5], t, b, { vol: 0.16 }); } },
      },
    },
    // ---------------------------------------------------------------- III
    // The drunken officer sways on his heels; lean against it until Bartolo takes the billet.
    // Upright, he slaps it on Bartolo's chest; flat on the floor, it lands there anyway.
    { name: "ACT I · BARTOLO'S HOUSE", aria: 'THE DRUNKEN OFFICER', command: 'STAGGER!', bpm: 145, beats: 12, verb: 'balance', shot: 'mid', focus: () => [128, 50],
      init(m) { m.a = 0; m.w = 0; m.timeoutWins = true; },
      update(m) {
        // the room spins: a sway that grows, and a lean that feeds itself; the arrows push back
        const drunk = (Math.sin(m.t * 2.3) * 0.7 + Math.sin(m.t * 5.1 + 1) * 0.5) * (0.6 + m.frac);
        m.w += (1.6 * Math.sin(m.a) + drunk * 1.3 + (m.right ? 2.6 : m.left ? -2.6 : 0)) * timeDelta;
        m.w -= m.w * 1.4 * timeDelta;
        m.a += m.w * timeDelta;
        if (m.t < 1.5 && Math.abs(m.a) > 0.85) { m.a = Math.sign(m.a) * 0.85; m.w = 0; }   // he finds his feet for the first bar
        if (Math.abs(m.a) > 1) { m.a = Math.sign(m.a); m.w = 0; m.lose(); }
      },
      updateOutcome(m) { if (!m.won && !m.bonked && m.t > 0.3) { m.bonked = 1; bonk(m, 100, GROUND + 6); S.drum('thunder', S.now(), 0.2); } },
      onOutcome(m) { if (m.won) { yay(); S.drum('snare', S.now() + 0.25, 0.2); confetti(160, GROUND + 50, 50); } else boo(); },
      render(m) {
        shaking(m);
        const out = m.phase === OUT, t = m.t;
        room();
        PX.rect(150, GROUND, 30, 50, c(COL.night)); PX.rect(148, GROUND + 50, 34, 3, c(COL.woodD));   // Bartolo's doorway
        CAST.draw(SP.bartolo, 159, GROUND, { flip: true });
        // the officer: tipped by the sway during the act; on the floor and back up on the slapstick side
        let a = m.a;
        if (out) a = m.won ? 0 : t < 0.3 ? m.a + (Math.sign(m.a || 1) * PI / 2 - m.a) * t / 0.3 : t < 1.3 ? Math.sign(m.a || 1) * PI / 2 : 0;
        tipped(CAST.frame(SP.soldier, Math.abs(a) > 1.2 ? 'fall' : 'hold', time), 112, GROUND, a);   // the billet held high; flat out, arms flung
        // the billet, the gold thing: held high while he sways, then on Bartolo's chest
        const k = out ? ease((t - (m.won ? 0 : 0.4)) / 0.4) : 0;
        const hx = 112 + Math.sin(a) * 30 - 7, hy = GROUND + Math.cos(a) * 30 - 5;
        if (m.phase !== MG.phase.CURTAIN) PX.draw(SP.billet, hx + (158 - hx) * k, hy + (GROUND + 3 - hy) * k + Math.sin(k * PI) * 16, { angle: out && !m.won ? k * PI * 4 : 0 });
        if (m.phase === ACTION && Math.abs(m.a) > 0.4) {
          // the fix, spelled out: push the other way
          PX.draw(SP.arrow, m.a > 0 ? 80 : 134, GROUND + 26, { flip: m.a < 0, color: c(Math.abs(m.a) > 0.7 ? COL.tragic : COL.gold) });
        }
        if (out && t > 1.4) { shout('QUARTIERE!', 90, GROUND + 34); shout('?!', 164, GROUND + 28, COL.gold); }
        verdict(m);
      },
      outcome: (m) => m.won ? ['THE BILLET LANDS ON BARTOLO. HE FREEZES.'] : ['HE FALLS. THE BILLET LANDS ON BARTOLO ANYWAY.'],
      music: {
        curtain: (t, b) => { MG.sting(t, 'I'); crescendo(t + b, b, 2); },
        bar: (t, b) => { for (let k = 0; k < 8; k++) S.voice('pulse', S.deg(['1', '3', '5', '3'][k % 4]) + 12, t + k * b / 2, b / 3, { vol: 0.08, slide: k % 3 ? 0 : -2, light: 'lead' }); for (let k = 0; k < 4; k++) S.drum(k % 2 ? 'snare' : 'kick', t + k * b, 0.13); S.voice('bass', S.deg('1-'), t, b * 0.8, { vol: 0.12, slide: -3 }); },
        outcome: (t, b, won) => { if (won) { S.drum('snare', t, 0.2); sing('tenor', ['5', '5', '1+'], [0.25, 0.25, 1.5], t, b, { vol: 0.14 }); } else { S.drum('thunder', t, 0.22); S.voice('bass', S.deg('1-'), t, 1.2, { vol: 0.16, slide: -7 }); } },
      },
    },
    // ---------------------------------------------------------------- IV
    // The lesson: Don Alonso (Almaviva again) follows the gold key along the harpsichord while
    // Rosina sings; wrong notes stir Bartolo. Either way he is snoring when they fix midnight.
    { name: 'ACT II · THE MUSIC ROOM', aria: 'THE LESSON', command: 'TUNE!', bpm: 155, beats: 16, verb: 'follow the key', shot: 'mid', focus: () => [122, 50],
      init(m) { m.hx = 66; m.k = 2; m.inT = 0; m.tot = 0.01; m.lb = -1; m.wake = 0; m.ok = false; m.pl = 0; },
      update(m) {
        MG.walk(m, 'hx', 80, 62, 139);
        const bi = Math.floor(m.beat);
        m.k = [2, 4, 5, 3, 6, 4, 1, 3, 5, 2][(bi >> 1) % 10];
        m.ok = Math.abs(m.hx - (62 + m.k * 10 + 4.5)) < 5.5;
        m.tot += timeDelta; if (m.ok) m.inT += timeDelta;
        if (bi !== m.lb) {
          m.lb = bi; m.pl = 1;
          if (m.ok) { S.voice('arp', S.deg(['1', '2', '3', '4', '5', '6', '7', '1+'][m.k]) + 12, S.now(), 0.15, { vol: 0.05 }); fx(146, GROUND + 22, COL.rose, COL.white, 1, { tile: SP.note, s: 6, e: 5, v: 0.5, g: -0.3, cone: 0.5, life: 1.2 }); }
          else if (bi > 0) { m.wake = 1; S.voice('bass', S.deg('7-'), S.now(), 0.2, { vol: 0.13, grit: true }); }
        }
        m.wake = Math.max(0, m.wake - timeDelta * 2.5); m.pl = Math.max(0, m.pl - timeDelta * 6);
        m.timeoutWins = m.inT / m.tot > 0.5;
      },
      updateOutcome(m) { if (!m.won && !m.bonked && m.t > 0.05) { m.bonked = 1; m.shake = 0.8; fx(178, GROUND + 26, COL.white, COL.white, 16, { v: 1.4, cone: 0.8 }); } },
      onOutcome(m) { if (m.won) { yay(); hearts(126, GROUND + 26, 10); } else boo(); },
      render(m) {
        shaking(m);
        const out = m.phase === OUT, t = m.t;
        room();
        // Bartolo in the armchair, asleep; a wrong note jolts him, and on the slapstick side he leaps
        PX.rect(162, GROUND, 30, 26, c(COL.crimson)); PX.rect(162, GROUND, 30, 10, c(COL.woodD));
        const leap = out && !m.won && t < 0.9 ? Math.sin(ease(t / 0.9) * PI) * 22 : 0;
        CAST.draw(SP.bartolo, 171, GROUND + 6 + leap + (m.wake > 0.5 ? 2 : 0), { pose: leap > 0 ? 'jump' : 'idle' });
        if (leap > 0) shout('CHE VOCE!', 140, GROUND + 54, COL.tragic);
        else if (m.wake > 0.3 && m.phase === ACTION) PX.text('!', 176, GROUND + 32, c(COL.tragic), { scale: 3 });
        else PX.draw(SP.zz, 178, GROUND + 32 + MG.bounce() * 3, { color: c(COL.dim) });
        // Alonso behind the harpsichord, his hand on a key; the gold key is the note she needs
        const hx = out ? 62 + m.k * 10 + 4.5 : m.hx;
        CAST.draw(SP.alonzo, hx - 6, GROUND + 20, { pose: 'idle' });
        PX.rect(58, GROUND, 86, 20, c(COL.woodD)); PX.rect(60, GROUND + 2, 82, 2, c(COL.wood));
        for (let i = 0; i < 8; i++) {
          const target = i === m.k && m.phase !== MG.phase.CURTAIN;
          PX.rect(62 + i * 10, GROUND + 20, 9, 6, c(target ? (m.ok ? COL.white : COL.gold) : COL.cream, target ? 1 : 0.55));
        }
        if (m.phase === ACTION) PX.rect(62 + m.k * 10 + 3, GROUND + 30 + Math.round(MG.bounce() * 3), 3, 3, c(COL.gold));
        PX.draw(SP.hand, 62 + clamp(Math.round((hx - 66.5) / 10), 0, 7) * 10 + 3, GROUND + 26 + Math.round(m.pl * 2), { scale: 1 });
        CAST.draw(SP.rosina, 146, GROUND);
        if (out && t > 1.4) shout('MIDNIGHT!', 104, GROUND + 50, COL.gold);
        verdict(m);
      },
      outcome: (m) => m.won ? ['BARTOLO SNORES. THE ELOPEMENT IS SET: MIDNIGHT.'] : ['BARTOLO LEAPS, THEN DOZES. MIDNIGHT IS SET ANYWAY.'],
      music: {
        curtain: (t, b) => { MG.sting(t, 'I'); crescendo(t + b, b, 3); },
        bar: (t, b, i) => { for (let k = 0; k < 4; k++) S.arp(['I', 'IV', 'V', 'I'][k], b * 0.9, 50, t + k * b, { vol: 0.06 }); sing('soprano', i % 2 ? ['5', '4', '3', '5', '1+'] : ['3', '5', '6', '5', '3'], [0.5, 0.5, 0.5, 0.5, 2], t, b, { vol: 0.11, light: 'lead' }); },
        outcome: (t, b, won) => { if (won) { S.arp('I', 2 * b, 50, t, { vol: 0.06 }); sing('soprano', ['1+', '3+'], [0.5, 2], t, b, { vol: 0.12 }); } else { S.drum('snare', t, 0.2); S.voice('bass', S.deg('7-') - 1, t, 1.2, { vol: 0.15, grit: true }); } },
      },
    },
    // ---------------------------------------------------------------- V
    // The toy. Largo al factotum: every press is a stroke of Figaro's brush, foam and bubbles
    // everywhere, a note of the patter. No verdict; he comes out of it with the balcony key.
    { name: "ACT II · THE BARBER'S CHAIR", aria: 'LARGO AL FACTOTUM', command: 'SHAVE!', bpm: 165, beats: 16, verb: 'lather', toy: true, shot: 'mid', focus: () => [124, 50],
      init(m) {
        m.foam = []; m.sw = 0; m.n = 0;
        // the lather bowl bubbles quietly the whole time
        new ParticleEmitter(vec2(164, GROUND + 20), 0, 8, 0, 3, 0.4, SP.bubble.tile, c(COL.white), c(COL.sky), c(COL.white, 0), c(COL.sky, 0), 2.5, 4, 6, 0.3, 0, 0.97, 1, -0.4, 0, 0.2, 0.4);
      },
      update(m) {
        if (m.press) {
          m.sw = 1; m.n++;
          if (m.foam.length < 10) m.foam.push([randInt(-12, 10), randInt(-2, 14)]);
          bubbles(130, GROUND + 34, 8, 20);
          fx(118, GROUND + 34, COL.white, COL.foam, 8, { v: 1.2, ang: -1.2, cone: 1, life: 0.6, s: 4, e: 1 });
          S.voice('pulse', S.deg(LARGO[m.n % LARGO.length]) + 12, S.now(), 0.12, { vol: 0.08 });
          S.drum('hat', S.now(), 0.12);
          if (m.n % 8 === 0) { hearts(100, GROUND + 50, 3); S.voice('tenor', S.deg('5'), S.now(), 0.3, { vol: 0.1 }); }
        }
        m.sw = Math.max(0, m.sw - timeDelta * 5);
      },
      onOutcome() { yay(); confetti(124, GROUND + 70, 70); bubbles(132, GROUND + 30, 30, 40); stars(96, GROUND + 50); },
      render(m) {
        shaking(m);
        const out = m.phase === OUT, t = m.t;
        room();
        // the chair, Bartolo in the white cape, his face and the foam on it
        PX.rect(114, GROUND, 38, 44, c(COL.woodD)); PX.rect(110, GROUND + 10, 46, 6, c(COL.crimson));
        PX.rect(118, GROUND + 6, 30, 20, c(COL.white));
        PX.draw(SP.face, 121, GROUND + 24);
        const foam = out ? [[-12, 8], [-7, 12], [-2, 14], [3, 12], [8, 8], [-12, 2], [8, 2], [-6, -2], [2, -2], [-4, 14], [-9, 5], [5, 5]] : m.foam;
        for (const [dx, dy] of foam) PX.draw(SP.foam, 129 + dx, GROUND + 24 + dy);
        PX.rect(127, GROUND + 34, 2, 2, c(COL.eye)); PX.rect(137, GROUND + 34, 2, 2, c(COL.eye)); PX.rect(129, GROUND + 28, 8, 2, c(COL.crimson));   // eyes and mouth stay clear of the foam
        // the lather bowl on its stool
        PX.rect(158, GROUND, 4, 12, c(COL.wood)); PX.rect(154, GROUND + 12, 20, 6, c(COL.slate)); PX.rect(156, GROUND + 18, 16, 2, c(COL.foam));
        // Figaro, dancing to the patter, the brush swinging to the face with each press
        const hop = Math.round(MG.bounce() * 2);
        CAST.draw(SP.figaro, 94, GROUND + hop, { pose: out ? 'hold' : 'walk' });   // he dances the patter; after, the key held up
        if (!out) PX.draw(SP.brush, 106 + m.sw * 12, GROUND + 14 + hop - m.sw * 2, { angle: 0.5 - m.sw * 1.2 });
        else {
          PX.draw(SP.key, 92, GROUND + 24 + Math.sin(t * 6) * 2);
          if (t > 0.8) shout('FIGARO QUA!', 64, GROUND + 40, COL.gold);
          if (t > 1.2) shout('MMF!', 150, GROUND + 50);
        }
      },
      outcome: () => ['FOAM TO THE WIG. FIGARO POCKETS THE BALCONY KEY.'],
      music: {
        curtain: (t, b) => { MG.sting(t, 'I'); crescendo(t + b, b, 4); },
        bar: (t, b, i) => { const L = TUNES.largo; if (i % 3 === 0) sing('tenor', L.notes, L.durs, t, b * 0.5, { vol: 0.13, legato: 0.7, light: 'lead' }); else if (i % 3 === 2) sing('tenor', L.figaro.notes, L.figaro.durs, t, b * 0.5, { vol: 0.13, legato: 0.7, light: 'lead' }); for (let k = 0; k < 4; k++) { S.voice('bass', S.deg(k % 2 ? '5-' : '1-'), t + k * b, b * 0.3, { vol: 0.12 }); S.drum(k % 2 ? 'hat' : 'kick', t + k * b, 0.12); } },
        outcome: (t, b, won) => { if (won) { sing('tenor', ['5', '3', '1', '5', '3', '1', '5', '3', '1'], [0.25, 0.25, 0.25], t, b, { vol: 0.14, legato: 0.7 }); S.arp('I', 1.5 * b, 25, t + 2.25 * b, { vol: 0.07, octave: 1 }); } else { S.drum('snare', t, 0.2); sing('bass', ['3-', '2-', '1-'], [0.33, 0.33, 1.5], t, b, { vol: 0.15 }); } },
      },
    },
    // ---------------------------------------------------------------- VI
    // Midnight in the storm: carry the ladder to the gold mark under her balcony and hold it
    // against the gusts while she climbs down. Either way she ends in his arms, and married.
    { name: 'ACT II · THE BALCONY', aria: 'ZITTI, ZITTI, PIANO, PIANO', command: 'WED!', bpm: 180, beats: 12, verb: 'steer', outcomeSeconds: 4, shot: 'mid', focus: () => [150, 50],
      init(m) { m.x = 100; m.wind = 0; m.climb = 0; m.on = false; m.nextT = 0.8; },
      update(m) {
        // the storm shoves him and the ladder; keep its foot on the mark and she climbs down
        m.wind = Math.sin(m.t * 1.7 + 1) * 34 + Math.sin(m.t * 4.3) * 18;
        m.x += m.wind * timeDelta;
        MG.walk(m, 'x', 90, 86, 176);
        m.on = Math.abs(m.x + 16 - 166) < 6;
        if (m.on) m.climb = Math.min(1, m.climb + timeDelta * 0.55);
        if (m.t >= m.nextT) { m.nextT = m.t + rand(1, 2); S.drum('thunder', S.now(), 0.16); }
        if (m.climb >= 1) m.win();
      },
      updateOutcome(m) {
        if (m.won) return;
        if (!m.b1 && m.t > 0.4) { m.b1 = 1; bonk(m, 140, GROUND + 22); CAST.hit(SP.almaviva); }
        if (!m.b2 && m.t > 0.75) { m.b2 = 1; bonk(m, 146, GROUND + 10); }
      },
      onOutcome(m) { if (m.won) { yay(); confetti(150, GROUND + 70, 80); hearts(148, GROUND + 28, 10); } else boo(); },
      render(m) {
        shaking(m);
        const out = m.phase === OUT, t = m.t;
        PX.rect(172, GROUND, 84, 120, c(COL.wall));
        MG.floor(COL.floor, COL.line);
        windowLit(176, GROUND + 40, 1);
        const foot = out ? 166 : m.x + 16;
        // the mark: a gold arrow on the cobbles under the balcony, pulsing on the beat
        if (m.phase !== OUT && !m.on) for (let i = 0; i < 4; i++) PX.rect(166 - 4 + i, GROUND + 8 - i * 2 + Math.round(MG.bounce() * 3), 8 - i * 2, 2, c(COL.gold));
        PX.rect(158, GROUND - 2, 16, 2, c(COL.gold, m.on ? 1 : 0.7));
        // the ladder: upright in his hands, leaning on the rail on the mark, flat on him on the slapstick side
        let la = m.on || out ? 0.1 : clamp(m.wind * 0.004, -0.15, 0.15);
        if (out && !m.won && t < 1.3) la = t < 1 ? -1.45 * ease(t / 0.4) : -1.45 + 1.55 * ease((t - 1) / 0.3);
        tipped(SP.ladder, foot, GROUND, la);
        // Rosina: on the balcony, down the ladder as he holds it, into his arms (or onto him)
        let rx = 185, ry = GROUND + 36;
        if (!out) { if (m.climb > 0) { rx = foot - 7; ry = GROUND + 36 * (1 - m.climb); } }
        else if (m.won) { rx = 166 - 7 + (154 - 159) * ease(t / 0.4); ry = GROUND + (1 - m.climb) * 36 * (1 - ease(t / 0.4)) + Math.sin(ease(t / 0.4) * PI) * 8; }
        else if (t < 1) { rx = 185 + (150 - 185) * ease((t - 0.3) / 0.45); ry = GROUND + 36 * (1 - ease((t - 0.3) / 0.45)); }
        else { rx = 154; ry = GROUND; }
        const heap = out && !m.won && t > 0.4 && t < 1;
        const ax = out ? 138 : m.x;
        if (heap) { CAST.draw(SP.almaviva, ax - 4, GROUND, { pose: 'fall' }); CAST.draw(SP.rosina, rx, t > 0.75 ? GROUND + 10 : Math.max(GROUND + 6, ry), t > 0.75 ? { pose: 'fall', angle: PI } : { pose: 'jump' }); }
        else { CAST.draw(SP.almaviva, ax, GROUND); CAST.draw(SP.rosina, rx, ry, { pose: out ? (t < 0.4 || !m.won && t < 1.3 ? 'jump' : 0) : m.climb > 0 ? 'hold' : 0 }); }
        if (m.phase === ACTION) {
          // the gusts, as streaks: which way the storm is shoving
          for (let i = 0; i < 6; i++) PX.rect((i * 43 + Math.round(m.t * m.wind * 3)) % 128 + 86, GROUND + 30 + (i * 17) % 50, 7, 1, c(COL.sky, 0.5));
        }
        if (out) {
          if (t > 1.6) PX.draw(SP.heart, 146, GROUND + 28 + MG.bounce() * 2, { color: c(COL.rose) });
          if (t > 1.2) PX.draw(SP.pen, 187, GROUND + 14, { scale: 2 });
          if (t > 1.4) shout('E IL CONTO?', 164, GROUND + 26, COL.gold);
        }
        CAST.draw(SP.figaro, foot + 8, GROUND, { pose: 'idle' });   // he steadies the ladder's foot
        verdict(m);
      },
      outcome: (m) => m.won ? ['DOWN THE LADDER, INTO HIS ARMS. MARRIED!'] : ['THE LADDER FALLS. SHE JUMPS. MARRIED ANYWAY!'],
      music: {
        curtain: (t, b) => { MG.sting(t, 'I'); crescendo(t + b, b, 5); S.setRoom(2600, 0.5, 1, t); },
        bar: (t, b) => { for (let k = 0; k < 12; k++) S.voice('pulse', S.deg(['1', '3', '5', '3', '1', '5-'][k % 6]) + 12, t + k * b / 3, b / 4, { vol: 0.07, light: k % 3 ? null : 'lead' }); for (let k = 0; k < 4; k++) S.drum(k % 2 ? 'hat' : 'kick', t + k * b, 0.12); },
        outcome: (t, b, won) => { if (won) { S.setRoom(3600, 0.5, 1, t); sing('tenor', ['1', '3', '5', '1+'], [0.25, 0.25, 0.25, 1.5], t, b, { vol: 0.14 }); sing('soprano', ['3+', '5+'], [0.5, 1.5], t + 0.75 * b, b, { vol: 0.12 }); S.arp('I', 2 * b, 25, t + b, { vol: 0.07, octave: 1 }); } else { S.drum('thunder', t, 0.25); S.drum('snare', t + b * 0.5, 0.2); sing('bass', ['5-', '1-'], [0.5, 1.5], t, b, { vol: 0.16 }); } },
      },
    },
  ],
});
