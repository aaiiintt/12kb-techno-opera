/* IL BARBIERE DI SIVIGLIA: six operatic microgames.
   Rossini, 1816. C major, and it only gets faster. Almaviva in sky blue,
   Rosina in cream and rose, Bartolo in black, Figaro in the striped apron,
   Seville in gold and crimson. One job per act: tap on the beat, mash when
   he's not looking, balance, steer, steer, steer.
   Tunes quoted from memory as scale degrees; check them against the score. */

'use strict';

const SP = {};
const COL = {
  bg: '#140a08', ink: '#fbead0', dim: '#8a6a58', card: '#fbead0', cardInk: '#140a08',
  bravo: '#f6c445', tragic: '#d8323c', fuse: '#fbead0',
  gold: '#f6c445', crimson: '#a3202e', cream: '#fbead0', rose: '#f28ca6', sky: '#5aa9e6', black: '#16121a',
  skin: '#f1c9a5', dark: '#1e1418', night: '#1b1a33', white: '#ffffff', green: '#5fbf6a', foam: '#ffffff', wood: '#7a4a2a',
};
const c = PX.c;
PX.SCALE = 2;
const GROUND = MG.GROUND;
const stageFloor = (col) => MG.floor(col, COL.dim);
const say = (t, x, y, col = COL.ink) => MG.say(t, x, y, col, COL.dark);
const sing = MG.sing;

function barberSprites() {
  const body = (h, f, b, l) => PX.sprite(['..hh..', '.hhhh.', '.ffff.', '.ffff.', '..ff..', '.bbbb.', 'bbbbbb', 'b.bb.b', '..bb..', '.ll.ll', '.ll.ll'], { h, f, b, l });
  const dress = (h, f, r) => PX.sprite(['..hhh..', '.hhhhh.', '.hfffh.', '.hfffh.', '..fff..', '..rrr..', '.rrrrr.', '.rrrrr.', 'rrrrrrr', 'rrrrrrr', '.f...f.'], { h, f, r });
  SP.almaviva = body(COL.dark, COL.skin, COL.sky, COL.dark);
  SP.soldier = body(COL.crimson, COL.skin, COL.crimson, COL.dark);       // Almaviva's drunken officer disguise
  SP.alonzo = body(COL.black, COL.skin, COL.black, COL.black);           // the pious music teacher
  SP.figaro = PX.sprite(['..hh..', '.hhhh.', '.ffff.', '.ffff.', '..ff..', '.sgsg.', 'sgsgsg', 's.gs.g', '..sg..', '.ll.ll', '.ll.ll'], { h: COL.dark, f: COL.skin, s: COL.cream, g: COL.green, l: COL.wood });
  SP.bartolo = body(COL.white, COL.skin, COL.black, COL.black);          // white wig
  SP.rosina = dress(COL.dark, COL.skin, COL.rose);
  SP.bartoloFace = PX.sprite([
    '..wwwwwwww..', '.wwwwwwwwww.', 'wwffffffffww', 'wwffffffffww', '.fffffffffff', '.ff.ffff.ff.', '.ffffffffff.', '.fffffffffff', '..ffffffff..', '...ffffff...', '....ffff....',
  ], { w: COL.white, f: COL.skin });
  SP.guitar = PX.sprite(['....bb', '...bb.', '..bb..', 'wwbb..', 'wwww..', '.ww...'], { b: COL.wood, w: COL.gold });
  SP.note = PX.sprite(['..n', '..n', '..n', 'nnn', 'nnn'], { n: COL.gold });
  SP.ribbon = PX.sprite(['r...r', '.r.r.', '..r..', '.r.r.', 'r...r'], { r: COL.rose });
  SP.bucket = PX.sprite(['wwwwww', '.wwww.', '.wwww.', '..ww..'], { w: '#8899aa' });
  SP.letter = PX.sprite(['wwwwwww', 'wr...rw', 'w.r.r.w', 'w..r..w', 'wwwwwww'], { w: COL.cream, r: COL.crimson });
  SP.billet = PX.sprite(['wwwwwww', 'w.www.w', 'w.....w', 'w.www.w', 'wwwwwww'], { w: COL.cream });
  SP.razor = PX.sprite(['ssssss.', '.sssssd', '......d'], { s: COL.white, d: COL.dark });
  SP.foam = PX.sprite(['.ww.', 'wwww', 'wwww', '.ww.'], { w: COL.foam });
  SP.ladder = PX.sprite(['w....w', 'wwwwww', 'w....w', 'wwwwww', 'w....w', 'wwwwww', 'w....w', 'wwwwww', 'w....w', 'wwwwww', 'w....w', 'wwwwww'], { w: COL.wood });
  SP.pen = PX.sprite(['...d', '..dd', '.gg.', 'gg..'], { d: COL.dark, g: COL.gold });
  SP.heart = PX.sprite(['.r.r.', 'rrrrr', 'rrrrr', '.rrr.', '..r..'], { r: COL.crimson });
  SP.zz = PX.sprite(['www', '.w.', 'www'], { w: COL.dim });
}

// the balcony: a window up on the right with shutters that can be open or shut
const balcony = (open, x = 184) => {
  PX.rect(x, GROUND + 64, 40, 48, c(COL.dark));
  PX.rect(x - 4, GROUND + 60, 48, 4, c(COL.wood));
  if (!open) { PX.rect(x, GROUND + 64, 19, 48, c(COL.wood)); PX.rect(x + 21, GROUND + 64, 19, 48, c(COL.wood)); }
};
// the Rossini crescendo sting: the same figure, each act a tone higher and faster
const crescendo = (t, b, i) => { for (let k = 0; k < 8; k++) S.voice('pulse', S.deg(['1', '3', '5', '1+'][k % 4]) + i * 2, t + k * b / 4, b / 5, { vol: 0.05 + k * 0.006 }); };
const LARGO = ['1', '1', '1', '1', '3', '3', '3', '3', '5', '5', '5', '5', '1+', '5', '3', '1'];

MG.opera({
  title: 'IL BARBIERE',
  sub: 'ROSSINI · SIX MICROGAMES',
  key: [0, 'major'],
  colours: COL,
  sprites: barberSprites,
  ending: (m, n) => n === 6 ? ['MARRIED. FIGARO SENDS THE BILL.']
    : n === 0 ? ['MARRIED ANYWAY. IT IS A COMEDY.']
    : ['MARRIED ANYWAY. BARTOLO KEEPS THE LADDER.'],
  music: { result: (t) => { S.setRoom(3600, 0.5, 1, t); for (let i = 0; i < 4; i++) S.arp(['I', 'IV', 'V', 'I'][i], 0.6, 25, t + i * 0.6, { vol: 0.07, octave: 1 }); sing('tenor', ['5', '3', '1'], [0.25, 0.25, 1.5], t + 2.4, 0.5, { vol: 0.14 }); } },
  renderTitle: () => { stageFloor(COL.gold); balcony(true); PX.draw(SP.rosina, 196, GROUND + 66); PX.draw(SP.figaro, 60, GROUND); PX.draw(SP.almaviva, 120, GROUND); PX.draw(SP.guitar, 132, GROUND + 6); },
  renderResult: () => { stageFloor(COL.gold); PX.draw(SP.almaviva, 108, GROUND); PX.draw(SP.rosina, 124, GROUND); PX.draw(SP.heart, 118, GROUND + 26 + MG.bounce(timeReal) * 3); PX.draw(SP.figaro, 60, GROUND); PX.draw(SP.bartolo, 200, GROUND); PX.draw(SP.ladder, 224, GROUND); },

  acts: [
    // ---------------------------------------------------------------- I
    { name: 'ACT I · THE STREET', aria: 'ECCO RIDENTE IN CIELO', command: 'SERENADE!', bpm: 120, beats: 16, verb: 'tap on the beat',
      init(m) { m.hits = 0; m.misses = 0; m.notes = []; m.timeoutWins = false; m.shut = false; },
      update(m) {
        if (m.press) {
          const off = Math.abs(m.beat - Math.round(m.beat));
          if (off < 0.22) { m.hits++; m.notes.push({ x: 126, y: GROUND + 20, t: m.t }); S.voice('pulse', S.deg(['1', '3', '5', '1+'][m.hits % 4]) + 12, S.now(), 0.25, { vol: 0.09, light: 'lead' }); }
          else { m.misses++; S.voice('bass', S.deg('1-'), S.now(), 0.15, { vol: 0.14, grit: true }); }
        }
        m.timeoutWins = m.hits >= 5 && m.misses < 4;
        for (const n of m.notes) { n.y += 28 * timeDelta; n.x += Math.sin(n.y / 6) * 0.5; }
        m.notes = m.notes.filter((n) => n.y < GROUND + 70);
      },
      render(m) {
        PX.rect(0, 0, 256, 144, c(COL.night, 0.5));
        stageFloor(COL.wood);
        const out = m.phase === MG.phase.OUTCOME;
        balcony(!out || m.won);
        if (!out || m.won) PX.draw(SP.rosina, 196, GROUND + 66);
        PX.draw(SP.almaviva, 120, GROUND);
        PX.draw(SP.guitar, 132, GROUND + 6);
        for (const n of m.notes) PX.draw(SP.note, n.x, n.y);
        if (m.phase === MG.phase.ACTION) {
          // the beat: a dot that lands on the line
          const ph = 1 - (m.beat % 1);
          PX.rect(120, GROUND + 50, 24, 1, c(COL.dim));
          PX.rect(131 + 0, GROUND + 50 + Math.round(ph * 14), 2, 2, c(COL.gold));
        }
        if (out) {
          if (m.won && m.t > 0.5) { PX.draw(SP.ribbon, 200, GROUND + 66 - Math.min(40, (m.t - 0.5) * 40)); if (m.t > 1.6) PX.draw(SP.heart, 136, GROUND + 26); }
          if (!m.won && m.t > 0.4) { PX.draw(SP.bucket, 198, GROUND + 60 + 4 * Math.sin(m.t * 3), { flip: true }); PX.rect(126, GROUND, 6, Math.max(0, Math.min(56, (m.t - 0.4) * 120)), c('#8899aa', 0.8)); if (m.t > 1.2) say('BARTOLO !', 138, GROUND + 26, COL.crimson); }
        }
      },
      outcome: (m) => m.won ? ['SHE DROPS A RIBBON. HE IS LINDORO NOW.'] : ['BARTOLO EMPTIES THE BUCKET. ON WITH THE FARCE.'],
      music: {
        curtain: (t, b) => { MG.sting(t, 'I'); crescendo(t + b, b, 0); },
        bar: (t, b, i) => { for (let k = 0; k < 4; k++) { S.voice('bass', S.deg(k % 2 ? '5-' : '1-'), t + k * b, b * 0.3, { vol: 0.12 }); S.voice('arp', S.deg(['3', '5'][k % 2]), t + k * b + b / 2, b * 0.2, { vol: 0.06 }); } if (i % 2 === 0) sing('tenor', ['3', '3', '2', '1', '2', '3', '5'], [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 1], t, b, { vol: 0.11, vibrato: 5 }); else sing('tenor', ['5', '4', '3', '2', '1'], [0.5, 0.5, 0.5, 0.5, 2], t, b, { vol: 0.11, vibrato: 5 }); },
        outcome: (t, b, won) => { if (won) sing('soprano', ['5', '6', '7', '1+'], [0.33, 0.33, 0.33, 1.5], t, b, { vol: 0.13 }); else { S.drum('thunder', t, 0.2); S.voice('bass', S.deg('1-'), t + 0.2, 1, { vol: 0.16, grit: true }); } },
      },
    },
    // ---------------------------------------------------------------- II
    { name: "ACT I · ROSINA'S ROOM", aria: 'UNA VOCE POCO FA', command: 'SLIP!', bpm: 135, beats: 14, verb: 'mash when he is not looking', shot: 'mid', focus: () => [130, GROUND + 26],
      init(m) { m.ink = 0; m.looking = false; m.nextLook = 2.2; m.warn = 0; m.caught = false; },
      update(m) {
        // Bartolo glances in on a schedule: a warning beat, then he looks for a beat and a half
        const b = MG.beat();
        if (!m.looking && m.t >= m.nextLook - b) m.warn = 1; else m.warn = 0;
        if (!m.looking && m.t >= m.nextLook) { m.looking = true; m.lookEnd = m.t + 1.5 * b; S.drum('hat', S.now(), 0.16); }
        if (m.looking && m.t >= m.lookEnd) { m.looking = false; m.nextLook = m.t + 1.5 * b + rand(0, 1.5 * b); }
        if (m.press) {
          if (m.looking) { m.caught = true; m.lose(); S.drum('snare', S.now(), 0.25); }
          else { m.ink = Math.min(1, m.ink + 0.08); S.drum('hat', S.now(), 0.09); S.voice('arp', S.deg('1+') + randInt(0, 5), S.now(), 0.08, { vol: 0.05 }); }
        }
        if (m.ink >= 1) m.win();
      },
      render(m) {
        stageFloor(COL.crimson);
        PX.rect(0, GROUND, 256, 120, c(COL.crimson, 0.15));
        PX.rect(196, GROUND, 40, 80, c(COL.dark));                      // the doorway
        const out = m.phase === MG.phase.OUTCOME;
        const peek = m.looking || (out && !m.won);
        if (peek) PX.draw(SP.bartolo, 204, GROUND, { color: m.warn ? c(COL.ink) : WHITE });
        else if (m.warn) PX.rect(214, GROUND + 8, 4, 14, c(COL.white, 0.5));   // a sliver of wig at the door
        PX.rect(60, GROUND, 60, 14, c(COL.wood));                        // the desk
        PX.draw(SP.rosina, 70, GROUND + 14);
        PX.draw(SP.letter, out && m.won ? Math.min(192, 96 + m.t * 90) : 96, out && m.won ? GROUND + 2 : GROUND + 16);
        if (m.phase === MG.phase.ACTION) {
          PX.rect(96, GROUND + 30, 30, 4, c(COL.dark));
          PX.rect(97, GROUND + 31, Math.round(28 * m.ink), 2, c(COL.crimson));
          if (m.looking) say('HE LOOKS', 150, GROUND + 40, COL.tragic);
          else if (m.warn) say('...', 150, GROUND + 40, COL.dim);
        }
        if (out && !m.won && m.t > 0.8) say(m.caught ? 'COSA SCRIVI ?' : 'A LETTER ?', 150, GROUND + 40, COL.crimson);
      },
      outcome: (m) => m.won ? ['UNDER THE DOOR. OBEDIENT ON THE SURFACE.'] : [m.caught ? 'CAUGHT WITH THE PEN. SHE SAYS IT IS A LAUNDRY LIST.' : 'UNFINISHED. SHE HIDES IT IN HER SLEEVE.'],
      music: {
        curtain: (t, b) => { MG.sting(t, 'I'); crescendo(t + b, b, 1); },
        bar: (t, b, i) => { for (let k = 0; k < 4; k++) S.voice('bass', S.deg(k % 2 ? '5-' : '1-'), t + k * b, b * 0.3, { vol: 0.11 }); const run = i % 2 ? ['3', '4', '5', '6', '7', '1+', '7', '5'] : ['5', '6', '5', '4', '3', '2', '1', '2']; sing('soprano', run, [0.5], t, b, { vol: 0.1, light: 'lead' }); },
        outcome: (t, b, won) => { if (won) sing('soprano', ['1+', '2+', '3+'], [0.33, 0.33, 1.5], t, b, { vol: 0.13 }); else { S.drum('snare', t, 0.2); sing('bass', ['5-', '1-'], [0.5, 1.5], t, b, { vol: 0.16 }); } },
      },
    },
    // ---------------------------------------------------------------- III
    { name: "ACT I · BARTOLO'S HOUSE", aria: 'THE DRUNKEN OFFICER', command: 'STAGGER!', bpm: 145, beats: 12, verb: 'balance', shot: 'mid', focus: () => [130, GROUND + 22],
      init(m) { m.tilt = 0; m.v = 0; m.timeoutWins = true; m.fell = false; m.push = 0; },
      update(m) {
        // the room spins: a drift that grows, and shoves; the arrows lean against it
        m.v += (Math.sin(m.t * 2.3) * 0.6 + Math.sin(m.t * 5.1) * 0.4) * timeDelta * 1.6;
        if (m.left) m.v -= 3.2 * timeDelta;
        if (m.right) m.v += 3.2 * timeDelta;
        m.v *= 0.985;
        m.tilt += m.v * timeDelta * 3;
        if (Math.abs(m.tilt) > 1) { m.fell = true; m.lose(); S.drum('thunder', S.now(), 0.25); }
      },
      render(m) {
        stageFloor(COL.wood);
        PX.rect(0, GROUND, 256, 120, c(COL.gold, 0.06));
        PX.draw(SP.bartolo, 190, GROUND, { flip: true });
        const out = m.phase === MG.phase.OUTCOME;
        const ang = out ? (m.won ? 0 : PI / 2) : m.tilt * 0.9;
        PX.draw(SP.soldier, 100, out && !m.won ? GROUND - 8 : GROUND, { angle: ang });
        if (m.phase === MG.phase.ACTION) {
          // the balance bar
          PX.rect(80, GROUND + 34, 52, 3, c(COL.dark));
          PX.rect(105 + Math.round(m.tilt * 24), GROUND + 33, 2, 5, c(Math.abs(m.tilt) > 0.7 ? COL.tragic : COL.gold));
          if (Math.abs(m.tilt) > 0.7) say('WHOA', 114, GROUND + 42, COL.tragic);
        }
        if (out && m.won) { PX.draw(SP.billet, 176, GROUND + 14 - (m.t < 0.4 ? (0.4 - m.t) * 40 : 0)); if (m.t > 0.8) say('QUARTIERE !', 110, GROUND + 42, COL.gold); }
        if (out && !m.won && m.t > 0.8) say('ZZZ', 118, GROUND + 6, COL.dim);
      },
      outcome: (m) => m.won ? ['THE BILLET LANDS ON HIS CHEST. THE GUARDS ARRIVE.'] : ['FLAT ON THE FLOOR. THE GUARDS ARRIVE ANYWAY.'],
      music: {
        curtain: (t, b) => { MG.sting(t, 'I'); crescendo(t + b, b, 2); },
        bar: (t, b) => { for (let k = 0; k < 8; k++) S.voice('pulse', S.deg(['1', '3', '5', '3'][k % 4]) + 12, t + k * b / 2, b / 3, { vol: 0.08, slide: k % 3 ? 0 : -2, light: 'lead' }); for (let k = 0; k < 4; k++) S.drum(k % 2 ? 'snare' : 'kick', t + k * b, 0.13); S.voice('bass', S.deg('1-'), t, b * 0.8, { vol: 0.12, slide: -3 }); },
        outcome: (t, b, won) => { if (won) { S.drum('snare', t, 0.2); sing('tenor', ['5', '5', '1+'], [0.25, 0.25, 1.5], t, b, { vol: 0.14 }); } else { S.drum('thunder', t, 0.22); S.voice('bass', S.deg('1-'), t, 1.2, { vol: 0.16, slide: -7 }); } },
      },
    },
    // ---------------------------------------------------------------- IV
    { name: 'ACT II · THE MUSIC ROOM', aria: 'THE LESSON', command: 'TUNE!', bpm: 155, beats: 12, verb: 'steer', shot: 'mid', focus: () => [136, GROUND + 26],
      init(m) { m.pitch = 0.3; m.target = 0.6; m.inTune = 0; m.total = 0; m.timeoutWins = false; m.nod = 0; },
      update(m) {
        m.total += timeDelta;
        m.target = 0.5 + Math.sin(m.t * 0.9) * 0.3 + Math.sin(m.t * 2.7) * 0.12;
        m.pitch += (m.left ? -0.7 : m.right ? 0.7 : 0) * timeDelta;
        m.pitch = clamp(m.pitch, 0, 1);
        const ok = Math.abs(m.pitch - m.target) < 0.08;
        if (ok) m.inTune += timeDelta;
        m.timeoutWins = m.inTune / Math.max(0.01, m.total) > 0.55;
        m.nod = Math.sin(m.t * 1.5);
      },
      render(m) {
        stageFloor(COL.crimson);
        PX.rect(0, GROUND, 256, 120, c(COL.crimson, 0.12));
        PX.rect(40, GROUND, 70, 22, c(COL.dark));                         // the harpsichord
        for (let i = 0; i < 12; i++) PX.rect(44 + i * 5, GROUND + 16, 3, 5, c(i % 3 === 1 ? COL.dark : COL.cream));
        PX.draw(SP.alonzo, 56, GROUND + 22);
        PX.draw(SP.rosina, 120, GROUND);
        PX.draw(SP.bartolo, 200, GROUND + (m.nod > 0.6 ? -2 : 0));
        if (m.nod > 0.6 || (m.phase === MG.phase.OUTCOME && m.won)) PX.draw(SP.zz, 216, GROUND + 26);
        if (m.phase === MG.phase.ACTION) {
          // the pitch: her note against the line she should be on
          const x0 = 120, w = 60;
          PX.rect(x0, GROUND + 34, w, 8, c(COL.dark));
          PX.rect(x0 + Math.round(m.target * w) - 3, GROUND + 34, 7, 8, c(COL.gold, 0.5));
          PX.rect(x0 + Math.round(m.pitch * w), GROUND + 35, 2, 6, c(Math.abs(m.pitch - m.target) < 0.08 ? COL.ink : COL.tragic));
          if (Math.abs(m.pitch - m.target) >= 0.08 && m.t > 0.5) say(m.pitch < m.target ? 'FLAT' : 'SHARP', 136, GROUND + 48, COL.tragic);
        }
        if (m.phase === MG.phase.OUTCOME) {
          if (m.won && m.t > 0.5) PX.draw(SP.heart, 100, GROUND + 26 + MG.bounce() * 3);
          if (!m.won && m.t > 0.6) say('CHE VOCE !', 174, GROUND + 26, COL.crimson);
        }
      },
      outcome: (m) => m.won ? ['BARTOLO SLEEPS. THEY PLAN THE ELOPEMENT.'] : ['BARTOLO WAKES. HE LIKED THE OLD SONGS BETTER.'],
      music: {
        curtain: (t, b) => { MG.sting(t, 'I'); crescendo(t + b, b, 3); },
        bar: (t, b, i) => { for (let k = 0; k < 4; k++) S.arp(['I', 'IV', 'V', 'I'][k], b * 0.9, 50, t + k * b, { vol: 0.06 }); sing('soprano', i % 2 ? ['5', '4', '3', '5', '1+'] : ['3', '5', '6', '5', '3'], [0.5, 0.5, 0.5, 0.5, 2], t, b, { vol: 0.11, light: 'lead' }); },
        outcome: (t, b, won) => { if (won) { S.arp('I', 2 * b, 50, t, { vol: 0.06 }); sing('soprano', ['1+', '3+'], [0.5, 2], t, b, { vol: 0.12 }); } else { S.drum('snare', t, 0.2); S.voice('bass', S.deg('7-') - 1, t, 1.2, { vol: 0.15, grit: true }); } },
      },
    },
    // ---------------------------------------------------------------- V
    { name: "ACT II · THE BARBER'S CHAIR", aria: 'LARGO AL FACTOTUM', command: 'SHAVE!', bpm: 165, beats: 12, verb: 'steer', shot: 'mid', focus: () => [128, GROUND + 36],
      init(m) { m.x = 128; m.foam = [100, 124, 148, 112, 136].map((x, i) => ({ x, y: GROUND + 40 + (i % 2) * 6, left: 1, done: false })); m.timeoutWins = false; m.shaved = 0; },
      update(m) {
        MG.walk(m, 'x', 110, 80, 168);
        for (const f of m.foam) {
          if (f.done) continue;
          if (Math.abs(m.x + 7 - (f.x + 4)) < 7) { f.left -= timeDelta * 3; if (f.left <= 0) { f.done = true; m.shaved++; S.drum('hat', S.now(), 0.14); S.voice('pulse', S.deg('5') + 12 + m.shaved * 2, S.now(), 0.12, { vol: 0.08 }); } }
        }
        m.timeoutWins = m.shaved >= m.foam.length;
        if (m.shaved >= m.foam.length) m.win();
      },
      render(m) {
        stageFloor(COL.wood);
        PX.rect(0, GROUND, 256, 120, c(COL.gold, 0.06));
        PX.rect(92, GROUND, 72, 30, c(COL.crimson));                     // the chair
        PX.draw(SP.bartoloFace, 116, GROUND + 30);                        // Bartolo's great chin
        for (const f of m.foam) if (!f.done) PX.draw(SP.foam, f.x, f.y, { color: c('#ffffff', 0.5 + 0.5 * f.left) });
        const out = m.phase === MG.phase.OUTCOME;
        PX.draw(SP.figaro, 40, GROUND);
        if (!out) PX.draw(SP.razor, m.x, GROUND + 54 + MG.bounce() * 2);
        if (out) {
          if (m.won) { PX.rect(118, GROUND + 40, 20, 8, c(COL.foam)); PX.draw(SP.almaviva, 200, GROUND); if (m.t > 0.6) PX.draw(SP.pen, 212, GROUND + 26, { color: c(COL.gold) }); if (m.t > 1) say('FIGARO !', 56, GROUND + 26, COL.gold); }
          else if (m.t > 0.5) say('BASTA !', 140, GROUND + 56, COL.crimson);
        }
      },
      outcome: (m) => m.won ? ['FOAM IN HIS EYES. THE COUNT HAS THE KEY.'] : ['HALF A SHAVE. BARTOLO KEEPS THE KEY.'],
      music: {
        curtain: (t, b) => { MG.sting(t, 'I'); crescendo(t + b, b, 4); },
        bar: (t, b, i) => { const line = i % 2 ? ['5', '5', '5', '.', '5', '5', '5', '.', '5', '3', '1', '.', '5', '3', '1', '.'] : LARGO; sing('tenor', line, [0.25], t, b, { vol: 0.13, legato: 0.7, light: 'lead' }); for (let k = 0; k < 4; k++) { S.voice('bass', S.deg(k % 2 ? '5-' : '1-'), t + k * b, b * 0.3, { vol: 0.12 }); S.drum(k % 2 ? 'hat' : 'kick', t + k * b, 0.12); } },
        outcome: (t, b, won) => { if (won) { sing('tenor', ['5', '3', '1', '5', '3', '1', '5', '3', '1'], [0.25, 0.25, 0.25], t, b, { vol: 0.14, legato: 0.7 }); S.arp('I', 1.5 * b, 25, t + 2.25 * b, { vol: 0.07, octave: 1 }); } else { S.drum('snare', t, 0.2); sing('bass', ['3-', '2-', '1-'], [0.33, 0.33, 1.5], t, b, { vol: 0.15 }); } },
      },
    },
    // ---------------------------------------------------------------- VI
    { name: 'ACT II · THE BALCONY', aria: 'ZITTI, ZITTI, PIANO, PIANO', command: 'WED!', bpm: 180, beats: 12, verb: 'steer', outcomeSeconds: 4, shot: 'wide',
      onOutcome(m) { if (m.won) m.cut('mid', 150, GROUND + 24); },
      init(m) { m.x = 120; m.wind = 0; m.climb = 0; m.timeoutWins = false; m.flash = 0; m.nextFlash = 1; m.lineY = 10; },
      update(m) {
        // the storm shoves the ladder; keep its foot under the balcony and Rosina climbs down
        m.wind = Math.sin(m.t * 1.7) * 30 + Math.sin(m.t * 4.3) * 18;
        m.x += m.wind * timeDelta;
        MG.walk(m, 'x', 120, 60, 200);
        const under = Math.abs(m.x + 6 - 204) < 8;
        if (under) m.climb = Math.min(1, m.climb + timeDelta * 0.45);
        if (m.t >= m.nextFlash) { m.flash = 1; m.nextFlash = m.t + rand(1.2, 2.4); S.drum('thunder', S.now(), 0.22, 'thunder'); }
        m.flash = Math.max(0, m.flash - timeDelta * 3);
        m.timeoutWins = m.climb >= 1;
        if (m.climb >= 1) m.win();
      },
      render(m) {
        PX.rect(0, 0, 256, 144, c(COL.night, 0.6));
        if (m.flash > 0) PX.rect(0, 0, 256, 144, c(COL.white, m.flash * 0.35));
        stageFloor(COL.dark);
        for (let i = 0; i < 40; i++) PX.rect((i * 37 + Math.round(m.t * 90)) % 256, (i * 53 + Math.round(m.t * 160)) % 144, 1, 3, c(COL.sky, 0.4));   // rain
        balcony(true, 184);
        const out = m.phase === MG.phase.OUTCOME;
        PX.draw(SP.ladder, m.x, GROUND, { angle: clamp((204 - m.x - 6) / 60, -0.5, 0.5) * 0.5 });
        const ry = GROUND + 66 - m.climb * 60;
        PX.draw(SP.rosina, out && m.won ? 150 : 196, out && m.won ? GROUND : ry);
        PX.draw(SP.almaviva, 130, GROUND);
        PX.draw(SP.figaro, 96, GROUND);
        if (m.phase === MG.phase.ACTION && Math.abs(m.x + 6 - 204) >= 8 && m.t > 0.5) say('THE LADDER', 150, GROUND + 40, COL.tragic);
        if (out) {
          if (m.won) { if (m.t > 0.5) PX.draw(SP.pen, 160, GROUND + 26 + MG.bounce() * 2, { color: c(COL.gold) }); if (m.t > 1.2) PX.draw(SP.heart, 146, GROUND + 26); if (m.t > 2.2) say('E IL CONTO ?', 108, GROUND + 26, COL.ink); }   // the wink: Figaro, deadpan, about his fee
          else { PX.draw(SP.bartolo, 224, GROUND); if (m.t > 0.6) say('FERMI !', 200, GROUND + 26, COL.crimson); }
        }
      },
      outcome: (m) => m.won ? ['SIGNED, BEFORE THE DOOR OPENS. MARRIED.'] : ['BARTOLO BURSTS IN. THEY SIGN ANYWAY, LATER.'],
      music: {
        curtain: (t, b) => { MG.sting(t, 'I'); crescendo(t + b, b, 5); S.setRoom(2600, 0.5, 1, t); },
        bar: (t, b) => { for (let k = 0; k < 12; k++) S.voice('pulse', S.deg(['1', '3', '5', '3', '1', '5-'][k % 6]) + 12, t + k * b / 3, b / 4, { vol: 0.07, light: k % 3 ? null : 'lead' }); for (let k = 0; k < 4; k++) S.drum(k % 2 ? 'hat' : 'kick', t + k * b, 0.12); },
        outcome: (t, b, won) => { if (won) { S.setRoom(3600, 0.5, 1, t); sing('tenor', ['1', '3', '5', '1+'], [0.25, 0.25, 0.25, 1.5], t, b, { vol: 0.14 }); sing('soprano', ['3+', '5+'], [0.5, 1.5], t + 0.75 * b, b, { vol: 0.12 }); S.arp('I', 2 * b, 25, t + b, { vol: 0.07, octave: 1 }); } else { S.drum('thunder', t, 0.25); S.drum('snare', t + b * 0.5, 0.2); sing('bass', ['5-', '1-'], [0.5, 1.5], t, b, { vol: 0.16 }); } },
      },
    },
  ],
});
