/* CARMEN: six operatic microgames.
   Bizet, 1875. D minor. Carmen in red, José in dragoon blue, Escamillo in
   the gold suit of lights, Seville in sand. Green is jealousy, white is the
   knife. One job per act: move, mash, hold, choose, dodge, tap.
   Tunes quoted from memory as scale degrees; check them against the score. */

'use strict';

const SP = {};
const COL = {
  bg: '#0b0710', ink: '#f4e9d8', dim: '#7a6a7a', card: '#f4e9d8', cardInk: '#0b0710',
  bravo: '#f4b93a', tragic: '#d4152f', fuse: '#f4e9d8',
  red: '#d4152f', blue: '#3d6fe0', gold: '#f4b93a', sand: '#e8c894', green: '#62c43a',
  skin: '#f1c9a5', dark: '#1a1424', night: '#141a33', white: '#ffffff', pink: '#ff7aa8',
};
const c = PX.c;
PX.SCALE = 2;                  // characters and props are drawn at 2x: 12x22 people on a 256x144 stage

function carmenSprites() {
  const body = (h, f, b, l) => PX.sprite([
    '..hh..', '.hhhh.', '.ffff.', '.ffff.', '..ff..', '.bbbb.', 'bbbbbb', 'b.bb.b', '..bb..', '.ll.ll', '.ll.ll',
  ], { h, f, b, l });
  const dress = (h, f, r) => PX.sprite([
    '..hhh..', '.hhhhh.', '.hfffh.', '.hfffh.', '..fff..', '..rrr..', '.rrrrr.', '.rrrrr.', 'rrrrrrr', 'rrrrrrr', '.f...f.',
  ], { h, f, r });
  SP.jose = body(COL.night, COL.skin, COL.blue, COL.dark);
  SP.joseShadow = body(COL.dark, COL.dark, COL.dark, COL.dark);
  SP.zuniga = body(COL.gold, COL.skin, COL.night, COL.dark);
  SP.esca = body(COL.dark, COL.skin, COL.gold, COL.gold);
  SP.carmen = dress(COL.dark, COL.skin, COL.red);
  SP.carmenWhite = dress(COL.dark, COL.white, COL.white);
  SP.bend = PX.sprite(['......', '......', '......', '..bbbb', '.bbbbh', 'bbbbhh', 'b.bbff', '..bb..', '.ll.ll', '.ll.ll'], { h: COL.night, f: COL.skin, b: COL.blue, l: COL.dark });
  SP.flower = PX.sprite(['.p.p.', 'ppppp', '.pyp.', 'ppppp', '.p.p.'], { p: COL.pink, y: COL.gold });
  SP.flowerDead = PX.sprite(['.p.p.', 'ppppp', '.pyp.', 'ppppp', '.p.p.'], { p: '#5a4a50', y: '#7a6a5a' });
  SP.rope = PX.sprite(['rr.rr.rr', '.rrr.rrr', 'rr.rr.rr'], { r: COL.sand });
  SP.cardBack = PX.sprite(['wwwwwww', 'wbwbwbw', 'wwbwbww', 'wbwbwbw', 'wwbwbww', 'wbwbwbw', 'wwbwbww', 'wbwbwbw', 'wwwwwww'], { w: COL.ink, b: COL.blue });
  SP.spade = PX.sprite(['wwwwwww', 'www.www', 'ww...ww', 'w.....w', 'w.....w', 'ww.w.ww', 'www.www', 'ww...ww', 'wwwwwww'], { w: COL.ink });
  SP.bull = PX.sprite([
    'hh..........', '.hhh........', '..hhhhhhhhh.', '.hhhhhhhhhhh', '.ehhhhhhhhhh', '..hhhhhhhhh.', '..h.h...h.h.', '..h.h...h.h.',
  ], { h: COL.dark, e: COL.red });
  SP.ring = PX.sprite(['.ggg.', 'g...g', 'g...g', 'g...g', '.ggg.'], { g: COL.gold });
  SP.knife = PX.sprite(['wwwwwwd', '.wwwwdd', '......d'], { w: COL.white, d: COL.dark });
  SP.heart = PX.sprite(['.r.r.', 'rrrrr', 'rrrrr', '.rrr.', '..r..'], { r: COL.red });
  SP.note = PX.sprite(['..n', '..n', '..n', 'nnn', 'nnn'], { n: COL.gold });
}

// ---- music helpers ----
const B = { HAB: [0, 0.75, 1, 1.5] };                     // habanera bass: dum . da-dum dum
const habanera = (t, b, bars = 1, vol = 0.12, voice = 'bass') => {
  for (let i = 0; i < bars; i++) B.HAB.forEach((o, j) => S.voice(voice, S.deg(j === 1 ? '5-' : '1-'), t + (i * 2 + o) * b, b * 0.4, { vol, light: j ? null : 'bass' }));
};
const SLIDE = ['1+', '7#', '7', '6#', '6', '5'], SLIDE_D = [0.75, 0.25, 0.5, 0.5, 0.75, 1.25];
const sing = MG.sing;
const TOREADOR = ['5', '5', '5', '4', '3', '3', '1'], TOREADOR_D = [0.5, 0.5, 0.5, 0.5, 0.75, 0.25, 1];
const stingUp = MG.sting;

// ---- the stage ----
const GROUND = MG.GROUND;
const stageFloor = (colour) => MG.floor(colour, COL.dim);
const say = (text, x, y, colour = COL.ink) => MG.say(text, x, y, colour, COL.dark);

MG.opera({
  title: 'CARMEN',
  sub: 'BIZET · SIX MICROGAMES',
  key: [2, 'minor'],
  colours: COL,
  sprites: carmenSprites,
  ending: (m, bravos) => bravos === 6 ? ['CARMEN IS DEAD.', 'YOU DID EVERYTHING RIGHT.']
    : bravos === 0 ? ['CARMEN IS DEAD.', 'YOU DID NOTHING RIGHT. SAME ENDING.']
    : ['CARMEN IS DEAD.', 'IT WAS NEVER UP TO YOU.'],
  music: { result: (t, n) => { S.setRoom(3600, 0.5, 1, t); for (let i = 0; i < 4; i++) S.arp(['i', 'VI', 'III', 'VII'][i], 0.9, 25, t + i, { vol: 0.07, octave: 1 }); S.voice('soprano', S.deg('5+'), t + 4, 2.4, { vol: 0.12 }); } },
  renderTitle: () => { stageFloor(COL.sand); PX.draw(SP.carmen, 121, GROUND); PX.draw(SP.flower, 110, GROUND + 30 + MG.bounce(timeReal) * 4); },
  renderResult: (m, n) => { stageFloor(COL.dark); PX.draw(SP.jose, 100, GROUND); PX.draw(SP.carmenWhite, 130, GROUND - 6, { angle: -PI / 2 }); },

  acts: [
    // ---------------------------------------------------------------- I
    { name: 'ACT I · THE FACTORY', aria: 'HABANERA', command: 'CATCH!', bpm: 120, beats: 12, verb: 'move',
      init(m) { m.x = 60; m.fx = 128; m.fy = 112; m.fall = 0; m.sway = rand(2, 4); m.vx = 0; },
      update(m) {
        MG.walk(m, 'x', 80, 4, 240);
        // the blossom falls, swaying, for the whole window; a random drift each play
        m.fall += timeDelta;
        m.fy = 112 - m.fall * (80 / (m.beats * MG.beat() * 0.9));
        m.fx = 128 + Math.sin(m.fall * m.sway) * 40 + Math.sin(m.fall * 0.7) * 20;
        if (m.fy <= GROUND + 22 && Math.abs(m.fx + 5 - (m.x + 6)) < 10) m.win();
        else if (m.fy <= GROUND) m.lose();
      },
      render(m) {
        PX.rect(0, 0, 256, 144, c(COL.sand, 0.12));
        stageFloor(COL.sand);
        // the factory door and Carmen in it, up on the step
        PX.rect(104, GROUND + 56, 48, 64, c(COL.dark));
        PX.draw(SP.carmen, 121, GROUND + 58);
        if (m.phase === MG.phase.OUTCOME) {
          if (m.won) { PX.draw(SP.jose, m.x, GROUND); PX.draw(SP.flower, m.x + 2, GROUND + 12); if (m.t > 0.6) PX.draw(SP.heart, m.x + 14, GROUND + 26 + MG.bounce() * 3); }
          else { const bend = m.t < 1.2; PX.draw(bend ? SP.bend : SP.jose, m.x, GROUND); PX.draw(SP.flower, bend ? m.fx : m.x + 2, bend ? GROUND : GROUND + 12); }
        } else {
          PX.draw(SP.jose, m.x, GROUND, { flip: m.facing < 0 });
          if (m.phase === MG.phase.ACTION) PX.draw(SP.flower, m.fx, m.fy);
        }
        PX.rect(0, GROUND, 256, 1, c(COL.dim));
      },
      outcome: (m) => m.won ? ['HE CATCHES IT. HE IS LOST.'] : ['HE PICKS IT UP ANYWAY.'],
      music: {
        curtain: (t, b) => { stingUp(t); habanera(t, b, 2, 0.12); },
        bar: (t, b, i) => { habanera(t, b, 2); if (i % 2 === 0) sing('tenor', SLIDE, SLIDE_D, t, b, { vol: 0.14, light: 'lead' }); else sing('pulse', ['5', '4', '5', '6', '5', '4', '3'], [0.5, 0.25, 0.25, 0.5, 0.5, 0.5, 1.5], t, b, { vol: 0.07 }); },
        outcome: (t, b, won) => { habanera(t, b, 1); sing('soprano', won ? ['5', '6', '5', '3'] : ['3', '2', '1', '7-'], [0.5, 0.5, 0.5, 1.5], t, b, { vol: 0.13 }); },
      },
    },
    // ---------------------------------------------------------------- II
    { name: 'ACT I · THE ESCAPE', aria: 'SEGUIDILLA', command: 'UNTIE!', bpm: 140, beats: 12, verb: 'mash',
      init(m) { m.knot = 0; m.look = 0; m.snap = 0; m.mashes = 0; },
      update(m) {
        if (m.press) { m.knot = Math.min(1, m.knot + 0.09); m.mashes++; S.drum('hat', S.now(), 0.12); }
        m.knot = Math.max(0, m.knot - 0.22 * timeDelta);
        m.look = Math.sin(m.t * 1.3);                         // Zuniga's head turns, flavour only
        if (m.knot >= 1) { m.win(); m.snap = m.t; }
      },
      render(m) {
        stageFloor(COL.night);
        PX.rect(0, GROUND, 256, 120, c(COL.night, 0.5));
        PX.rect(196, GROUND, 32, 70, c(COL.dark));               // the guardroom door
        PX.draw(SP.zuniga, 206, GROUND, { flip: m.look > 0 });
        const done = m.phase === MG.phase.OUTCOME;
        const cx = done && m.won ? Math.min(300, 100 + m.t * 160) : 100;
        PX.draw(SP.jose, 76, GROUND, { flip: false });
        PX.draw(SP.carmen, cx, GROUND);
        if (!(done && m.won)) PX.draw(SP.rope, cx - 1, GROUND + 6, { color: done ? WHITE : c(COL.sand) });
        if (m.phase === MG.phase.ACTION || (done && !m.won)) {
          // the knot loosening: a bar that shakes with each mash
          const w = Math.round(60 * m.knot);
          PX.rect(84, GROUND + 30, 62, 5, c(COL.dark));
          PX.rect(85, GROUND + 31, w, 3, c(m.knot > 0.8 ? COL.gold : COL.sand));
        }
        if (done && !m.won && m.t > 1) say('ALLONS !', 176, GROUND + 26, COL.gold);
      },
      outcome: (m) => m.won ? ['SHE RUNS. HE STAYS FOR THE COURT MARTIAL.'] : ['THE KNOT HOLDS. HE GOES TO JAIL ANYWAY.'],
      music: {
        curtain: (t, b) => { stingUp(t); for (let i = 0; i < 12; i++) S.voice('pulse', S.deg(['1', '3', '5'][i % 3]), t + i * b / 3, b / 4, { vol: 0.06 }); },
        bar: (t, b) => { for (let i = 0; i < 12; i++) { S.voice('pulse', S.deg(['1', '3', '5', '3', '5', '1+'][i % 6]), t + i * b / 3, b / 4, { vol: 0.07, light: i % 3 ? null : 'lead' }); if (i % 3 === 0) S.voice('bass', S.deg(i % 6 ? '5-' : '1-'), t + i * b / 3, b / 2, { vol: 0.12 }); } },
        outcome: (t, b, won) => { if (won) { S.drum('snare', t, 0.2); sing('soprano', ['1+', '5', '3', '1'], [0.33, 0.33, 0.33, 1.5], t, b, { vol: 0.13 }); } else { S.drum('kick', t, 0.2); S.drum('kick', t + b, 0.2); S.voice('bass', S.deg('1-'), t + 2 * b, 1.5, { vol: 0.18 }); } },
      },
    },
    // ---------------------------------------------------------------- III
    { name: 'ACT II · THE TAVERN', aria: 'LA FLEUR', command: 'HOLD!', bpm: 120, beats: 14, verb: 'hold',
      init(m) { m.held = 0; m.total = 0; m.colour = 1; m.wasHeld = false; m.lamps = [-40, 60, 160]; m.timeoutWins = false; },
      update(m) {
        m.total += timeDelta;
        if (m.hold) { m.held += timeDelta; m.colour = Math.min(1, m.colour + timeDelta * 0.5); }
        else {
          m.colour = Math.max(0, m.colour - timeDelta * 0.9);
          if (m.wasHeld) S.voice('tenor', S.deg('1-'), S.now(), 0.35, { vol: 0.1, grit: true });
        }
        m.wasHeld = m.hold;
        m.timeoutWins = m.held / Math.max(0.01, m.total) >= 0.8 && m.colour > 0.5;
        // the searchlights sweep; flavour, they can't catch you
        m.lamps = m.lamps.map((x) => ((x + timeDelta * 60 + 60) % 380) - 60);
      },
      render(m) {
        stageFloor(COL.dark);
        for (const x of m.lamps) PX.rect(x, GROUND, 28, 120, c(COL.sand, 0.14));
        PX.draw(SP.jose, 122, GROUND);
        const fl = m.colour > 0.35 ? SP.flower : SP.flowerDead;
        const drained = m.phase === MG.phase.OUTCOME && !m.won;
        PX.draw(drained ? SP.flowerDead : fl, 124, GROUND + 12, { color: c('#ffffff', 0.4 + 0.6 * m.colour) });
        if (m.phase === MG.phase.ACTION) {
          // the flower's colour as a bar under him
          PX.rect(111, GROUND - 8, 34, 4, c(COL.dark));
          PX.rect(112, GROUND - 7, Math.round(32 * m.colour), 2, c(m.colour > 0.5 ? COL.pink : COL.dim));
          if (!m.hold && m.t > 0.5) say('HOLD IT', 138, GROUND + 26, COL.tragic);
        }
      },
      outcome: (m) => m.won ? ['THE FLOWER KEEPS ITS COLOUR. SO DOES HE.'] : ['THE COLOUR DRAINS. HE DESERTS.'],
      music: {
        curtain: (t, b) => { stingUp(t); S.setRoom(900, 0.5, 1, t); sing('tenor', ['5', '5', '6', '5'], [0.5, 0.5, 0.5, 1.5], t + b, b, { vol: 0.12, vibrato: 6 }); },
        bar: (t, b, i) => { habanera(t, b, 2, 0.09); const tune = i % 2 ? ['3', '1', '2', '3', '5', '4', '3'] : ['5', '5', '6', '5', '3', '5', '1+']; sing('tenor', tune, [0.5, 0.5, 0.5, 0.5, 1, 0.5, 1.5], t, b, { vol: 0.12, vibrato: 7, light: 'lead' }); },
        outcome: (t, b, won) => { S.setRoom(2400, 0.4, 2, t); if (won) sing('tenor', ['1+', '7', '6', '5'], [0.5, 0.5, 0.5, 2], t, b, { vol: 0.13, vibrato: 8 }); else sing('tenor', ['5', '4b', '3', '1-'], [0.5, 0.5, 0.5, 2], t, b, { vol: 0.13, grit: true }); },
      },
    },
    // ---------------------------------------------------------------- IV
    { name: 'ACT III · THE PASS', aria: 'THE CARDS', command: 'FLIP!', bpm: 110, beats: 10, verb: 'choose',
      init(m) { m.cur = 1; m.flipped = -1; m.was = false; },
      update(m) {
        const d = MG.stepped(m);
        if (d) { m.cur = clamp(m.cur + d, 0, 2); S.drum('hat', S.now(), 0.1); }
        if (m.press) { m.flipped = m.cur; m.win(); }
      },
      render(m) {
        stageFloor(COL.night);
        PX.rect(0, GROUND, 256, 120, c(COL.night, 0.3));
        PX.draw(SP.carmen, 40, GROUND);
        for (let i = 0; i < 3; i++) {
          const x = 100 + i * 36, y = GROUND + 4 + (m.phase === MG.phase.ACTION && i === m.cur ? Math.round(MG.bounce() * 2) : 0);
          const show = m.phase === MG.phase.OUTCOME && (i === m.flipped || m.t > 1.2 + i * 0.4);
          PX.draw(show ? SP.spade : SP.cardBack, x, y);
          if (m.phase === MG.phase.ACTION && i === m.cur) PX.rect(x, y - 3, 14, 1, c(COL.gold));
        }
        if (m.phase === MG.phase.OUTCOME && m.t > 2.2) say('LA MORTE', 56, GROUND + 26, COL.tragic);
      },
      outcome: (m) => m.won ? ['THE SPADE. SHE READS IT TWICE. THE SPADE.'] : ["SHE DOESN'T LOOK. IT'S STILL THE SPADE."],
      music: {
        curtain: (t, b) => { S.drone(S.deg('1-'), t, 5 * b, { tritone: true, vol: 0.05 }); S.drum('kick', t, 0.16, 'kick'); },
        bar: (t, b) => { S.drone(S.deg('1-'), t, 4.2 * b, { tritone: true, vol: 0.05 }); S.drum('kick', t, 0.14); S.drum('kick', t + 2 * b, 0.14); S.voice('soprano', S.deg('5'), t + b, 1.2, { vol: 0.09 }); },
        outcome: (t, b) => { S.drum('snare', t, 0.22, 'kick'); sing('soprano', ['5', '4', '3'], [1, 1, 2], t + b * 0.5, b, { vol: 0.14 }); S.drone(S.deg('1-'), t, 4 * b, { tritone: true, vol: 0.06 }); },
      },
    },
    // ---------------------------------------------------------------- V
    { name: 'ACT IV · THE BULLRING', aria: 'TOREADOR', command: 'GLORY!', bpm: 140, beats: 16, verb: 'dodge',
      init(m) { m.x = 128; m.bull = null; m.charges = 0; m.next = 1.2; m.cheer = 0; m.shadow = -20; m.timeoutWins = true; },
      update(m) {
        MG.walk(m, 'x', 100, 4, 240);
        const b = MG.beat();
        if (!m.bull && m.t >= m.next) {
          const fromLeft = m.charges % 2 === 0 ? rand() < 0.5 : m.lastLeft === false;
          m.lastLeft = fromLeft;
          m.bull = { x: fromLeft ? -26 : 262, dir: fromLeft ? 1 : -1, speed: 150 + m.charges * 25 };
          m.charges++;
          S.drum('thunder', S.now(), 0.25, 'bull');
        }
        if (m.bull) {
          m.bull.x += m.bull.dir * m.bull.speed * timeDelta;
          if (m.bull.x + 22 > m.x + 2 && m.bull.x + 2 < m.x + 10 && !m.gored) { m.gored = true; m.lose(); }
          if (m.bull.x < -28 || m.bull.x > 264) { m.bull = null; m.next = m.t + 2 * b + rand(0, b); m.cheer = 1; S.drum('crowd', S.now(), 0.2); }
        }
        m.cheer = Math.max(0, m.cheer - timeDelta);
        m.shadow = Math.min(50, m.shadow + timeDelta * 7);     // José creeps in behind
      },
      render(m) {
        stageFloor(COL.sand);
        // the crowd: rows of dots that jump on a cheer
        for (let i = 0; i < 32; i++) for (let r = 0; r < 3; r++) {
          const jump = m.cheer > 0 && (i + r) % 2 ? 2 : 0;
          PX.rect(i * 8 + 2, 106 + r * 9 + jump, 4, 4, c([COL.red, COL.gold, COL.ink][(i + r) % 3], 0.8));
        }
        PX.rect(0, 100, 256, 2, c(COL.dark));
        PX.draw(SP.joseShadow, m.shadow, GROUND + 46);
        if (m.bull) PX.draw(SP.bull, m.bull.x, GROUND, { flip: m.bull.dir < 0 });
        const gored = m.phase === MG.phase.OUTCOME && !m.won;
        PX.draw(SP.esca, m.x, gored ? GROUND - 10 : GROUND, { flip: m.facing < 0, angle: gored ? PI / 2 : 0 });
        if (m.phase === MG.phase.OUTCOME && m.won) {
          PX.rect(m.x - 10, GROUND + 4, 10, 16, c(COL.red));      // the cape
          if (m.t > 0.4) say('OLÉ !', m.x + 16, GROUND + 26, COL.gold);
        }
        if (m.phase === MG.phase.OUTCOME && m.t > 1.5) PX.draw(SP.joseShadow, 60, GROUND + 46);
      },
      outcome: (m) => m.won ? ['THE CROWD IS HIS. JOSÉ IS IN THE SHADOW.'] : ['GORED. THE CROWD GASPS. JOSÉ WAITS.'],
      music: {
        curtain: (t, b) => { stingUp(t); S.setRoom(3200, 0.45, 1, t); S.drum('crowd', t, 0.18); sing('pulse', ['1', '3', '5', '1+'], [0.25, 0.25, 0.25, 1], t + b, b, { vol: 0.09 }); },
        bar: (t, b, i) => {
          // F major fanfare over a creeping minor second in the bass
          S.key(5, 'major');
          sing('tenor', i % 2 ? ['5', '5', '5', '4', '3', '2', '1'] : TOREADOR, i % 2 ? [0.5, 0.5, 0.5, 0.5, 0.75, 0.25, 1] : TOREADOR_D, t, b, { vol: 0.13, light: 'lead' });
          for (let k = 0; k < 4; k++) { S.voice('bass', S.deg('1-') + (k % 2), t + k * b, b * 0.5, { vol: 0.13 }); S.drum(k % 2 ? 'hat' : 'kick', t + k * b, 0.14); }
          S.key(2, 'minor');
        },
        outcome: (t, b, won) => { S.key(5, 'major'); if (won) { S.drum('crowd', t, 0.25); sing('tenor', ['5', '5', '5', '1+'], [0.33, 0.33, 0.33, 2], t, b, { vol: 0.15 }); S.arp('I', 2.5 * b, 25, t + b, { vol: 0.07, octave: 1 }); } else { S.drum('snare', t, 0.25); S.voice('bass', S.deg('1-'), t, 2, { vol: 0.16, grit: true }); } S.key(2, 'minor'); },
      },
    },
    // ---------------------------------------------------------------- VI
    { name: 'ACT IV · OUTSIDE THE ARENA', aria: 'THE FINALE', command: 'REJECT!', bpm: 150, beats: 12, verb: 'tap', outcomeSeconds: 4.2,
      init(m) { m.jx = 16; m.cx = 200; m.thrown = false; m.ring = null; m.step = 0; m.knife = 0; m.lineY = 10; },
      update(m) {
        const b = MG.beat();
        // José advances one step a beat; the ring window is when he's within reach
        const step = Math.floor(m.beat);
        if (step > m.step) { m.step = step; m.jx = 16 + step * 14; S.drum('kick', S.now(), 0.18, 'kick'); }
        const near = m.cx - m.jx < 64 && m.cx - m.jx > 24;
        m.near = near;
        if (m.press) {
          if (near) { m.win(); m.ring = { x: m.cx, y: GROUND + 14, vx: -140 }; S.silence(S.now(), 1.2); }
          else S.drum('hat', S.now(), 0.1);
        }
        if (m.jx >= m.cx - 20) m.lose();
      },
      updateOutcome(m) {
        if (m.ring) { m.ring.x += m.ring.vx * timeDelta; m.ring.vx *= 0.97; m.ring.y -= 10 * timeDelta; }
        if (m.t > 1.6 && !m.knife) { m.knife = 1; S.drum('snare', S.now(), 0.3, 'knife'); }
      },
      render(m) {
        stageFloor(COL.sand);
        PX.rect(0, 100, 256, 2, c(COL.dark));
        PX.rect(0, 102, 256, 40, c(COL.red, 0.15));
        const out = m.phase === MG.phase.OUTCOME;
        const fallen = out && m.t > 1.6;
        if (fallen) { PX.rect(0, 0, 256, 144, c(COL.white, m.t < 1.75 ? 0.9 : 0)); PX.draw(SP.carmenWhite, m.cx + 6, GROUND - 6, { angle: -PI / 2 }); }
        else PX.draw(SP.carmen, m.cx, GROUND, { flip: true });
        PX.draw(SP.jose, m.jx, GROUND, { color: m.phase === MG.phase.ACTION && m.near ? c(COL.green) : WHITE });
        if (m.phase === MG.phase.ACTION) { PX.draw(SP.ring, m.cx - 10, GROUND + 14 + (m.near ? Math.round(MG.bounce() * 3) : 0), { color: m.near ? WHITE : c('#ffffff', 0.5) }); if (m.near) say('NOW', m.cx - 6, GROUND + 26, COL.gold); }
        if (m.ring && !fallen) PX.draw(SP.ring, m.ring.x, m.ring.y);
        if (out && m.t > 1.4 && !fallen) PX.draw(SP.knife, m.jx + 12, GROUND + 12);
        if (fallen && m.t > 2.4) say('MERDE !', m.jx + 14, GROUND + 26, COL.ink);   // the wink
      },
      outcome: (m) => m.won ? ['SHE THROWS THE RING. HE HAS A KNIFE.'] : ['SHE SAYS NOTHING. HE HAS A KNIFE.'],
      music: {
        curtain: (t, b) => { stingUp(t); S.setRoom(600, 0.55, 1, t); S.voice('tenor', S.deg('1-'), t, 3 * b, { vol: 0.12, grit: 0.5 }); },
        bar: (t, b) => { for (let k = 0; k < 4; k++) S.voice('tenor', S.deg(k % 2 ? '2b' : '1'), t + k * b, b * 0.6, { vol: 0.12, grit: 0.75, light: 'lead' }); S.voice('soprano', S.deg('5+'), t + 2 * b, 1.4 * b, { vol: 0.1 }); },
        outcome: (t, b, won) => { const k = t + 1.6; S.drum('snare', k, 0.3); S.voice('bass', S.deg('1-'), k + 0.1, 1.5, { vol: 0.18 }); S.arp('i', 1.6, 25, k + 0.3, { vol: 0.06, octave: 1 }); S.setRoom(320, 0.6, 1.5, k); },
      },
    },
  ],
});
