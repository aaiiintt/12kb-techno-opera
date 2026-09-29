/* LA TRAVIATA: six operatic microgames.
   Verdi, 1853. B flat major for the party, and the key goes dark after it.
   Violetta in white with a camellia, Alfredo in evening black, Germont in
   grey, the salon in crimson and gold, the deathbed in violet. One job per
   act: tap on the downbeat, mash, hold, steer, shield, reach.
   Tunes quoted from memory as scale degrees; check them against the score. */

'use strict';

const SP = {};
const COL = {
  bg: '#12060e', ink: '#f7ecdf', dim: '#7d6272', card: '#f7ecdf', cardInk: '#12060e',
  bravo: '#f4c95d', tragic: '#d8323c', fuse: '#f7ecdf',
  crimson: '#8f1d2c', gold: '#f4c95d', white: '#ffffff', violet: '#5b3a8c', grey: '#8a8a96', black: '#1a1420',
  skin: '#f1c9a5', pale: '#f7e6dc', dark: '#1a1020', night: '#120b1f', green: '#5fbf6a', camellia: '#e8324a', candle: '#ffb347',
};
const c = PX.c;
PX.SCALE = 2;
const GROUND = MG.GROUND;
const stageFloor = (col) => MG.floor(col, COL.dim);
const say = (t, x, y, col = COL.ink) => MG.say(t, x, y, col, COL.dark);
const sing = MG.sing;

function traviataSprites() {
  const body = (h, f, b, l) => PX.sprite(['..hh..', '.hhhh.', '.ffff.', '.ffff.', '..ff..', '.bbbb.', 'bbbbbb', 'b.bb.b', '..bb..', '.ll.ll', '.ll.ll'], { h, f, b, l });
  const dress = (h, f, r, k) => PX.sprite(['..hhh..', '.hhhhh.', '.hfffh.', '.hfffh.', '..fff..', '..rkr..', '.rrrrr.', '.rrrrr.', 'rrrrrrr', 'rrrrrrr', '.f...f.'], { h, f, r, k });
  SP.violetta = dress(COL.dark, COL.skin, COL.white, COL.camellia);
  SP.violettaPale = dress(COL.dark, COL.pale, COL.pale, COL.camellia);
  SP.alfredo = body(COL.dark, COL.skin, COL.black, COL.black);
  SP.germont = body(COL.grey, COL.skin, COL.grey, COL.dark);
  SP.germontShadow = body(COL.dark, COL.dark, COL.dark, COL.dark);
  SP.guest = body(COL.dark, COL.skin, COL.crimson, COL.dark);
  SP.glass = PX.sprite(['gggg', '.gg.', '..g.', '..g.', '.ggg'], { g: COL.gold });
  SP.glassBroken = PX.sprite(['g..g', '.g..', '..g.', '....', 'g.gg'], { g: COL.gold });
  SP.flower = PX.sprite(['.w.w.', 'wwwww', '.wyw.', 'wwwww', '.w.w.'], { w: COL.white, y: COL.gold });
  SP.scissors = PX.sprite(['g...g', '.g.g.', '..s..', '.s.s.', 's...s'], { g: COL.gold, s: COL.grey });
  SP.letter = PX.sprite(['wwwwwww', 'w.....w', 'w.rrr.w', 'w.....w', 'wwwwwww'], { w: COL.pale, r: COL.crimson });
  SP.pen = PX.sprite(['...d', '..dd', '.gg.', 'gg..'], { d: COL.dark, g: COL.gold });
  SP.coin = PX.sprite(['.gg.', 'gggg', 'gggg', '.gg.'], { g: COL.gold });
  SP.candle = PX.sprite(['.f.', 'fff', '.f.', '.w.', '.w.', '.w.', 'www'], { f: COL.candle, w: COL.pale });
  SP.candleOut = PX.sprite(['...', '...', '.d.', '.w.', '.w.', '.w.', 'www'], { d: COL.grey, w: COL.pale });
  SP.hand = PX.sprite(['.ss.', 'ssss', 'ssss', '.ss.', '.ss.'], { s: COL.skin });
  SP.portrait = PX.sprite(['ggggg', 'g.d.g', 'g.s.g', 'g.w.g', 'ggggg'], { g: COL.gold, d: COL.dark, s: COL.skin, w: COL.white });
  SP.bed = PX.sprite(['wwwwwwwwwwwwwwwwwwww', 'pppppppppppppppppppp', 'pppppppppppppppppppp', 'dddddddddddddddddddd', 'd..................d'], { w: COL.pale, p: COL.violet, d: COL.dark });
  SP.heart = PX.sprite(['.r.r.', 'rrrrr', 'rrrrr', '.rrr.', '..r..'], { r: COL.camellia });
}

const salon = (guests = true) => {
  PX.rect(0, GROUND, 256, 120, c(COL.crimson, 0.18));
  for (let i = 0; i < 6; i++) { PX.rect(16 + i * 42, GROUND + 90, 2, 30, c(COL.gold, 0.5)); PX.rect(10 + i * 42, GROUND + 118, 14, 2, c(COL.gold, 0.5)); }
  if (guests) for (let i = 0; i < 5; i++) PX.draw(SP.guest, 8 + i * 58, GROUND + 6, { color: c('#ffffff', 0.45) });
};
const BRINDISI = ['5', '3', '5', '3', '5', '6', '5', '4', '3', '2', '1'];
const BRINDISI_D = [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 1];

MG.opera({
  title: 'LA TRAVIATA',
  sub: 'VERDI · SIX MICROGAMES',
  key: [10, 'major'],
  colours: COL,
  sprites: traviataSprites,
  ending: (m, n) => n === 6 ? ['VIOLETTA DIES. EVERYONE IS VERY SORRY.']
    : n === 0 ? ['VIOLETTA DIES. PARIS GOES BACK TO THE PARTY.']
    : ['VIOLETTA DIES. THE LETTER CAME TOO LATE.'],
  music: { result: (t) => { S.key(10, 'major'); S.setRoom(3600, 0.55, 1, t); for (let i = 0; i < 4; i++) S.arp(['I', 'vi', 'IV', 'I'][i], 0.9, 25, t + i, { vol: 0.06, octave: 1 }); S.voice('soprano', S.deg('3+'), t + 4, 3, { vol: 0.11 }); } },
  renderTitle: () => { salon(false); stageFloor(COL.crimson); PX.draw(SP.alfredo, 108, GROUND); PX.draw(SP.violetta, 128, GROUND); PX.draw(SP.glass, 118, GROUND + 14 + MG.bounce(timeReal) * 2); },
  renderResult: () => { PX.rect(0, GROUND, 256, 120, c(COL.violet, 0.15)); stageFloor(COL.night); PX.draw(SP.bed, 100, GROUND); PX.draw(SP.violettaPale, 108, GROUND + 4, { angle: -PI / 2 }); PX.draw(SP.alfredo, 150, GROUND); PX.draw(SP.germont, 176, GROUND); },

  acts: [
    // ---------------------------------------------------------------- I
    { name: 'ACT I · THE SALON', aria: 'LIBIAMO', command: 'TOAST!', bpm: 125, beats: 15, verb: 'tap on the downbeat', shot: 'mid', focus: () => [128, GROUND + 24],
      init(m) { m.clinks = 0; m.coughs = 0; m.timeoutWins = false; m.flash = 0; m.lastBar = -1; },
      update(m) {
        // a waltz: the downbeat is every third beat; tap on it
        const bar = m.beat / 3, off = Math.abs(bar - Math.round(bar)) * 3;
        if (m.press) {
          if (off < 0.28) { m.clinks++; m.flash = 1; S.voice('arp', S.deg('1+') + 12, S.now(), 0.3, { vol: 0.08, light: 'lead' }); S.drum('hat', S.now(), 0.12); }
          else { m.coughs++; S.drum('breath', S.now(), 0.3); }
        }
        m.flash = Math.max(0, m.flash - timeDelta * 3);
        m.timeoutWins = m.clinks >= 3 && m.coughs < 3;
      },
      render(m) {
        salon();
        stageFloor(COL.crimson);
        const out = m.phase === MG.phase.OUTCOME;
        PX.draw(SP.alfredo, 104, GROUND);
        PX.draw(SP.violetta, 132, GROUND + (out && !m.won && m.t > 0.4 ? -2 : 0));
        if (out && !m.won && m.t > 0.4) { PX.draw(SP.glassBroken, 128, GROUND); if (m.t > 0.9) say('KOFF', 150, GROUND + 26, COL.dim); }
        else PX.draw(SP.glass, 118 + (m.flash > 0 ? 6 : 0), GROUND + 14 + (m.flash > 0 ? 4 : 0));
        PX.draw(SP.glass, 138 - (m.flash > 0 ? 4 : 0), GROUND + 14 + (m.flash > 0 ? 4 : 0), { flip: true });
        if (m.flash > 0) PX.rect(126, GROUND + 26, 4, 4, c(COL.white, m.flash));
        if (m.phase === MG.phase.ACTION) {
          // the waltz: three dots, the first one is the downbeat
          const bar = m.beat / 3, ph = bar - Math.floor(bar);
          for (let i = 0; i < 3; i++) PX.rect(118 + i * 8, GROUND + 44, 4, 4, c(i === 0 ? COL.gold : COL.dim, i === Math.floor(ph * 3) ? 1 : 0.35));
        }
        if (out && m.won && m.t > 0.6) PX.draw(SP.heart, 124, GROUND + 34 + MG.bounce() * 3);
      },
      outcome: (m) => m.won ? ['THE GLASSES RING. SHE IS RADIANT. SHE IS ILL.'] : ['SHE COUGHS. THE GLASS BREAKS. THE PARTY GOES ON.'],
      music: {
        curtain: (t, b) => { S.key(10, 'major'); MG.sting(t, 'I'); for (let k = 0; k < 6; k++) S.voice('bass', S.deg(k % 3 ? '5-' : '1-'), t + b + k * b / 2, b / 3, { vol: 0.1 }); },
        bar: (t, b, i) => {
          // 3/4: the bar function is called per four beats, so lay out by beat count
          for (let k = 0; k < 4; k++) { const beatN = i * 4 + k; S.voice('bass', S.deg(beatN % 3 === 0 ? '1-' : '5-'), t + k * b, b * 0.35, { vol: beatN % 3 === 0 ? 0.14 : 0.08 }); S.voice('arp', S.deg(beatN % 3 === 0 ? '3' : '5'), t + k * b, b * 0.25, { vol: 0.05 }); }
          if (i % 2 === 0) sing('soprano', BRINDISI, BRINDISI_D, t, b, { vol: 0.11, light: 'lead' });
        },
        outcome: (t, b, won) => { if (won) { sing('tenor', ['5', '6', '5', '1+'], [0.5, 0.5, 0.5, 1.5], t, b, { vol: 0.13 }); S.drum('crowd', t + b, 0.15); } else { S.drum('breath', t, 0.35); S.voice('bass', S.deg('1-'), t + 0.4, 1.2, { vol: 0.14, grit: true }); } },
      },
    },
    // ---------------------------------------------------------------- II
    { name: 'ACT II · THE COUNTRY', aria: 'UN DÌ, FELICE', command: 'SNIP!', bpm: 135, beats: 12, verb: 'mash', shot: 'mid', focus: () => [90, GROUND + 20],
      init(m) { m.cut = 0; m.need = 12; m.shadow = 262; m.timeoutWins = false; m.flowers = []; },
      update(m) {
        if (m.press && m.cut < m.need) { m.cut++; m.flowers.push({ x: 60 + m.cut * 4, y: GROUND + 22 }); S.drum('hat', S.now(), 0.14); S.voice('arp', S.deg(['1', '3', '5', '1+'][m.cut % 4]) + 12, S.now(), 0.1, { vol: 0.06 }); }
        m.shadow = 262 - (m.t / (m.beats * MG.beat())) * 150;             // Germont arrives whatever you do
        if (m.cut >= m.need) m.win();
      },
      render(m) {
        PX.rect(0, GROUND, 256, 120, c(COL.green, 0.08));
        stageFloor(COL.green);
        for (let i = 0; i < 14; i++) PX.draw(SP.flower, 20 + i * 16, GROUND + 2 + (i % 2) * 4, { scale: 1, color: c('#ffffff', i < m.cut ? 0.15 : 1) });
        PX.draw(SP.violetta, 60, GROUND);
        PX.draw(SP.scissors, 76, GROUND + 12 + (m.press ? 4 : 0));
        PX.draw(SP.alfredo, 20, GROUND);
        for (const f of m.flowers) PX.draw(SP.flower, f.x, f.y, { scale: 1 });
        const out = m.phase === MG.phase.OUTCOME;
        PX.draw(SP.germontShadow, out ? 200 : m.shadow, GROUND, { flip: true });
        if (m.phase === MG.phase.ACTION) { PX.rect(60, GROUND + 34, 30, 4, c(COL.dark)); PX.rect(61, GROUND + 35, Math.round(28 * m.cut / m.need), 2, c(COL.white)); }
        if (out && m.t > 0.8) say(m.won ? 'SIGNORA.' : 'SIGNORA ?', 172, GROUND + 26, COL.grey);
      },
      outcome: (m) => m.won ? ['THE BOUQUET IS FULL. A MAN IN GREY IS AT THE GATE.'] : ['HALF A BOUQUET. A MAN IN GREY IS AT THE GATE.'],
      music: {
        curtain: (t, b) => { S.key(10, 'major'); MG.sting(t, 'I'); S.arp('I', 3 * b, 25, t + b, { vol: 0.06, octave: 1 }); },
        bar: (t, b, i) => { for (let k = 0; k < 4; k++) S.arp(['I', 'vi', 'IV', 'V'][k], b * 0.9, 25, t + k * b, { vol: 0.06, octave: 1, light: k ? null : 'lead' }); sing('tenor', i % 2 ? ['3', '2', '1', '2', '3'] : ['1', '3', '5', '6', '5'], [0.5, 0.5, 0.5, 0.5, 2], t, b, { vol: 0.11, vibrato: 6 }); },
        outcome: (t, b, won) => { S.key(10, 'minor'); S.voice('bass', S.deg('1-'), t + b, 2, { vol: 0.15 }); S.voice('bass', S.deg('2b-'), t + 2 * b, 1.5, { vol: 0.13 }); if (won) sing('soprano', ['5', '3'], [0.5, 1.5], t, b, { vol: 0.11 }); },
      },
    },
    // ---------------------------------------------------------------- III
    { name: "ACT II · GERMONT'S DEMAND", aria: 'PURA SICCOME UN ANGELO', command: 'RENOUNCE!', bpm: 110, beats: 12, verb: 'hold', shot: 'close', focus: () => [122, GROUND + 20],
      onOutcome(m) { m.cut('mid', 130, GROUND + 22); },
      init(m) { m.sign = 0; m.timeoutWins = false; m.lineY = 10; },
      update(m) {
        // hold to sign: the pen moves while you hold, and the letter is the sacrifice
        if (m.hold) { m.sign = Math.min(1, m.sign + timeDelta / (m.beats * MG.beat() * 0.62)); if (Math.floor(m.sign * 40) !== Math.floor((m.sign - timeDelta * 0.5) * 40)) S.drum('hat', S.now(), 0.05); }
        m.timeoutWins = m.sign >= 1;
        if (m.sign >= 1) m.win();
      },
      render(m) {
        PX.rect(0, GROUND, 256, 120, c(COL.grey, 0.08));
        stageFloor(COL.dark);
        PX.rect(96, GROUND, 64, 16, c(COL.black));                      // the writing desk
        PX.draw(SP.letter, 112, GROUND + 16);
        PX.draw(SP.violetta, 84, GROUND);
        PX.draw(SP.germont, 180, GROUND, { flip: true });
        const out = m.phase === MG.phase.OUTCOME;
        // the signature: a line that grows across the letter while she holds the pen
        PX.rect(114, GROUND + 20, Math.round(10 * m.sign), 1, c(COL.crimson));
        PX.draw(SP.pen, 114 + Math.round(10 * m.sign), GROUND + 18, { color: m.hold || out ? WHITE : c('#ffffff', 0.5) });
        if (m.phase === MG.phase.ACTION && !m.hold && m.t > 0.6) say('HOLD THE PEN', 118, GROUND + 48, COL.tragic);
        if (m.phase === MG.phase.ACTION && m.t > 1) say('FOR MY DAUGHTER', 176, GROUND + 26, COL.grey);
        if (out) { if (m.won && m.t > 0.6) say('AMAMI, ALFREDO', 96, GROUND + 26, COL.ink); if (!m.won && m.t > 0.6) say('I WILL WRITE IT', 176, GROUND + 26, COL.grey); }
      },
      outcome: (m) => m.won ? ['SIGNED. HIS FAMILY IS SAVED. SHE IS NOT.'] : ["SHE CAN'T. GERMONT WRITES IT FOR HER."],
      music: {
        curtain: (t, b) => { S.key(10, 'minor'); S.setRoom(700, 0.55, 1, t); S.drum('kick', t, 0.16); S.voice('bass', S.deg('1-'), t, 3 * b, { vol: 0.13 }); S.voice('bass', S.deg('2b-'), t + 1.5 * b, 1.5 * b, { vol: 0.1 }); },
        bar: (t, b) => { for (let k = 0; k < 4; k++) { S.drum('kick', t + k * b, 0.1); S.voice('bass', S.deg(k % 2 ? '2b-' : '1-'), t + k * b, b * 0.8, { vol: 0.12 }); } sing('tenor', ['3', '3', '2', '1', '7-', '1'], [0.5, 0.5, 0.5, 0.5, 1, 1], t, b, { vol: 0.11, vibrato: 4, light: 'lead' }); },
        outcome: (t, b, won) => { S.setRoom(2400, 0.45, 2, t); if (won) sing('soprano', ['5', '3', '2', '1'], [0.5, 0.5, 0.5, 2], t, b, { vol: 0.14 }); else S.voice('bass', S.deg('1-'), t, 2.5, { vol: 0.15, grit: true }); },
      },
    },
    // ---------------------------------------------------------------- IV
    { name: "ACT II · FLORA'S PARTY", aria: 'THE GAMBLING TABLE', command: 'FLING!', bpm: 160, beats: 12, verb: 'steer',
      init(m) { m.x = 60; m.vx = 0; m.aim = 0; m.coins = []; m.timeoutWins = false; m.flung = false; },
      update(m) {
        MG.walk(m, 'x', 120, 4, 160);
        m.vx = 150 + Math.sin(m.t * 1.4) * 40 + Math.sin(m.t * 3.9) * 18;   // Violetta drifts along the far side
        const facing = Math.abs(m.x + 6 - (m.vx + 7)) < 9;
        if (facing) m.aim = Math.min(1, m.aim + timeDelta * 0.9);
        if (m.aim >= 1 && !m.flung) { m.flung = true; m.win(); for (let i = 0; i < 12; i++) m.coins.push({ x: m.x + 6, y: GROUND + 20, vx: rand(20, 90), vy: rand(20, 80) }); S.drum('snare', S.now(), 0.25); }
        m.timeoutWins = false;
      },
      updateOutcome(m) {
        if (!m.won && !m.flung) { m.flung = true; for (let i = 0; i < 12; i++) m.coins.push({ x: m.x + 6, y: GROUND + 20, vx: rand(-60, 100), vy: rand(30, 90) }); }
        for (const k of m.coins) { k.x += k.vx * timeDelta; k.vy -= 120 * timeDelta; k.y += k.vy * timeDelta; if (k.y < GROUND) { k.y = GROUND; k.vy *= -0.4; k.vx *= 0.8; } }
      },
      render(m) {
        salon();
        stageFloor(COL.crimson);
        PX.rect(30, GROUND + 14, 196, 4, c(COL.green));                   // the gaming table
        PX.rect(30, GROUND, 196, 14, c(COL.dark));
        PX.draw(SP.violetta, m.vx, GROUND + 18, { flip: true });
        PX.draw(SP.alfredo, m.x, GROUND, { color: m.aim > 0.5 ? c(COL.gold) : WHITE });
        for (const k of m.coins) PX.draw(SP.coin, k.x, k.y, { scale: 1 });
        if (m.phase === MG.phase.ACTION) { PX.rect(m.x - 2, GROUND - 8, 16, 3, c(COL.dark)); PX.rect(m.x - 1, GROUND - 7, Math.round(14 * m.aim), 1, c(COL.gold)); }
        if (m.phase === MG.phase.OUTCOME && m.t > 0.7) say(m.won ? 'PAID IN FULL' : 'ALFREDO !', m.x + 12, GROUND + 26, m.won ? COL.gold : COL.grey);
      },
      outcome: (m) => m.won ? ['GOLD AT HER FEET, IN FRONT OF EVERYONE.'] : ['HE THROWS WIDE. THE INSULT LANDS ANYWAY.'],
      music: {
        curtain: (t, b) => { S.key(10, 'minor'); MG.sting(t, 'i'); S.setRoom(2000, 0.4, 1, t); for (let k = 0; k < 8; k++) S.voice('pulse', S.deg(['1', '5', '1+', '5'][k % 4]), t + b + k * b / 4, b / 6, { vol: 0.07 }); },
        bar: (t, b) => { for (let k = 0; k < 8; k++) { S.voice('pulse', S.deg(['1', '.', '3', '1', '5', '.', '4', '3'][k]), t + k * b / 2, b / 4, { vol: 0.09, light: k % 2 ? null : 'lead' }); } for (let k = 0; k < 4; k++) { S.drum(k % 2 ? 'snare' : 'kick', t + k * b, 0.15); S.voice('bass', S.deg(k % 2 ? '5-' : '1-'), t + k * b + b / 2, b * 0.3, { vol: 0.12 }); } },
        outcome: (t, b, won) => { S.drum('snare', t, 0.25); S.drum('crowd', t + 0.2, 0.2); sing('bass', ['1-', '7--', '6b--'], [0.5, 0.5, 2], t, b, { vol: 0.16 }); if (won) S.voice('soprano', S.deg('3+'), t + b, 1.5 * b, { vol: 0.11 }); },
      },
    },
    // ---------------------------------------------------------------- V
    { name: 'ACT III · THE DEATHBED', aria: 'ADDIO, DEL PASSATO', command: 'READ!', bpm: 100, beats: 12, verb: 'shield', shot: 'close', focus: () => [142, GROUND + 18],
      init(m) { m.flame = 1; m.side = 0; m.draft = 0; m.nextDraft = 1.2; m.gust = 0; m.timeoutWins = true; m.out = false; },
      update(m) {
        // drafts come from a side, telegraphed a beat early; put the hand on that side
        const b = MG.beat();
        if (!m.draft && m.t >= m.nextDraft - b) m.warn = m.warnSide ?? (m.warnSide = rand() < 0.5 ? -1 : 1); else if (m.draft) m.warn = 0;
        if (!m.draft && m.t >= m.nextDraft) { m.draft = m.warnSide; m.draftEnd = m.t + 1.2 * b; m.warnSide = null; S.drum('breath', S.now(), 0.35); }
        if (m.draft && m.t >= m.draftEnd) { m.draft = 0; m.nextDraft = m.t + b + rand(0, 1.5 * b); }
        if (m.left) m.side = -1; else if (m.right) m.side = 1;
        if (m.draft && m.side !== m.draft) m.flame = Math.max(0, m.flame - timeDelta * 0.9);
        else m.flame = Math.min(1, m.flame + timeDelta * 0.15);
        if (m.flame <= 0) { m.out = true; m.lose(); }
      },
      render(m) {
        PX.rect(0, GROUND, 256, 120, c(COL.violet, 0.15));
        stageFloor(COL.night);
        PX.draw(SP.bed, 96, GROUND);
        PX.draw(SP.violettaPale, 104, GROUND + 6, { angle: -PI / 2 });
        PX.draw(SP.letter, 122, GROUND + 14);
        const out = m.phase === MG.phase.OUTCOME;
        const lit = out ? m.won : m.flame > 0;
        PX.draw(lit ? SP.candle : SP.candleOut, 150, GROUND + 10, { color: c('#ffffff', out ? 1 : 0.4 + 0.6 * m.flame) });
        if (lit) PX.rect(140, GROUND, 26, 40, c(COL.candle, 0.05 + 0.1 * m.flame));
        if (!out) PX.draw(SP.hand, m.side < 0 ? 138 : 160, GROUND + 14);
        if (m.warn) for (let i = 0; i < 3; i++) PX.rect(m.warn < 0 ? 100 + i * 8 : 190 + i * 8, GROUND + 30 + i * 3, 6, 1, c(COL.grey, 0.5));
        if (m.draft) for (let i = 0; i < 5; i++) PX.rect(m.draft < 0 ? 100 + i * 8 + Math.round(m.t * 60) % 16 : 200 - i * 8 - Math.round(m.t * 60) % 16, GROUND + 22 + i * 3, 8, 1, c(COL.grey, 0.8));
        if (m.phase === MG.phase.ACTION && m.t > 0.5 && m.draft && m.side !== m.draft) say('THE DRAFT', m.draft < 0 ? 96 : 176, GROUND + 44, COL.tragic);
        if (out && m.t > 0.8) say(m.won ? 'PERDONA...' : 'TOO DARK', 128, GROUND + 44, m.won ? COL.ink : COL.dim);
      },
      outcome: (m) => m.won ? ['SHE READS IT TO THE END. HE FORGIVES HER. TOO LATE.'] : ['THE CANDLE GOES OUT. SHE KNOWS WHAT IT SAYS.'],
      music: {
        curtain: (t, b) => { S.key(10, 'minor'); S.setRoom(500, 0.6, 1, t); S.drum('heartbeat', t, 0.14, 'heart'); S.drum('heartbeat', t + 2 * b, 0.12, 'heart'); },
        bar: (t, b, i) => { S.drum('heartbeat', t, 0.12, 'heart'); S.drum('heartbeat', t + 2 * b, 0.1, 'heart'); sing('soprano', i % 2 ? ['3', '2', '1', '7-'] : ['5', '4', '3', '2'], [1, 1, 1, 1], t, b, { vol: 0.09, light: 'lead' }); if (i % 2) S.drum('crowd', t + b, 0.06); },
        outcome: (t, b, won) => { S.drum('heartbeat', t + b, 0.1); if (won) sing('soprano', ['5', '6', '5'], [0.5, 0.5, 2.5], t, b, { vol: 0.12 }); else S.voice('bass', S.deg('1-'), t, 2.5, { vol: 0.12 }); },
      },
    },
    // ---------------------------------------------------------------- VI
    { name: 'ACT III · THE FAREWELL', aria: "PRENDI, QUEST'È L'IMMAGINE", command: 'GIVE!', bpm: 175, beats: 8, verb: 'reach', outcomeSeconds: 4.2, shot: 'close', focus: () => [140, GROUND + 20],
      onOutcome(m) { m.cut('mid', 150, GROUND + 22); },
      init(m) { m.reach = 0; m.pulse = 1; m.given = false; m.timeoutWins = false; m.lineY = 10; },
      update(m) {
        // hold Right to reach; her pulse runs down whatever you do
        if (m.right || m.hold) m.reach = Math.min(1, m.reach + timeDelta * 0.55);
        else m.reach = Math.max(0, m.reach - timeDelta * 0.3);
        m.pulse = Math.max(0, 1 - m.t / (m.beats * MG.beat()));
        if (m.reach >= 1) { m.given = true; m.win(); S.silence(S.now(), 2.5); }
      },
      render(m) {
        PX.rect(0, GROUND, 256, 120, c(COL.violet, 0.15));
        stageFloor(COL.night);
        PX.draw(SP.bed, 96, GROUND);
        PX.draw(SP.violettaPale, 104, GROUND + 6, { angle: -PI / 2 });
        PX.draw(SP.alfredo, 150, GROUND);
        PX.draw(SP.germont, 176, GROUND);
        const out = m.phase === MG.phase.OUTCOME;
        const hx = 120 + Math.round(m.reach * 26);
        if (!out || m.won) { PX.draw(SP.hand, hx, GROUND + 18); PX.draw(SP.portrait, out && m.won ? 154 : hx + 6, out && m.won ? GROUND + 22 : GROUND + 20, { scale: 1 }); }
        if (m.phase === MG.phase.ACTION) {
          PX.rect(96, GROUND + 40, 40, 3, c(COL.dark));
          PX.rect(97, GROUND + 41, Math.round(38 * m.pulse), 1, c(COL.camellia));
          if (m.t > 0.4 && !(m.right || m.hold)) say('REACH', 122, GROUND + 48, COL.tragic);
        }
        if (out) {
          if (m.t > 1.4) PX.draw(SP.violettaPale, 104, GROUND + 6, { angle: -PI / 2, color: c('#ffffff', 0.5) });
          if (m.t > 2.2) say('SCUSA.', 190, GROUND + 26, COL.grey);           // the wink: Germont, deadpan, a little late
        }
      },
      outcome: (m) => m.won ? ['THE PORTRAIT IS IN HIS HANDS. SILENCE.'] : ['HER HAND STOPS SHORT. THE PORTRAIT STAYS ON THE BED.'],
      music: {
        curtain: (t, b) => { S.key(10, 'major'); S.setRoom(2400, 0.5, 1, t); S.drum('heartbeat', t, 0.12, 'heart'); S.arp('I', 3 * b, 25, t + b, { vol: 0.05, octave: 1 }); },
        bar: (t, b) => { S.drum('heartbeat', t, 0.1, 'heart'); S.drum('heartbeat', t + 2 * b, 0.08, 'heart'); sing('soprano', ['1', '1+'], [1, 3], t, b, { vol: 0.13, light: 'lead' }); S.arp('I', 4 * b, 25, t, { vol: 0.05, octave: 1 }); },
        outcome: (t, b, won) => { if (!won) { S.drum('heartbeat', t, 0.1); S.drum('heartbeat', t + 1.2 * b, 0.07); } S.key(10, 'minor'); S.voice('bass', S.deg('1-'), t + 2.5, 2, { vol: 0.14 }); S.arp('i', 1.6, 25, t + 2.7, { vol: 0.05, octave: 1 }); },
      },
    },
  ],
});
