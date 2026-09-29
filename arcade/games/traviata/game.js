/* LA TRAVIATA: six operatic microgames.
   Verdi, 1853. B flat major for the party, and the key goes dark after it.
   Violetta in white with a camellia, Alfredo in evening blue, Germont in
   grey, the salon in crimson and gold, the deathbed in violet. One job per
   act: clink on the downbeat, (a toy: snip camellias), hold the pen, fling
   the purse, shield the flame, reach.
   Tunes quoted from memory as scale degrees; check them against the score.

   The picture: every action screen is a dark, static room with one player
   thing and one bright target; the spectacle (particles, flashes, shakes) is
   kept for the outcome. Both outcomes of an act end on the same tableau. */

'use strict';

const SP = {};
const COL = {
  bg: '#12060e', ink: '#f7ecdf', dim: '#7d6272', card: '#f7ecdf', cardInk: '#12060e',
  bravo: '#f4c95d', tragic: '#ff5a64', fuse: '#f7ecdf',
  crimson: '#8f1d2c', gold: '#f4c95d', white: '#ffffff', violet: '#5b3a8c', grey: '#9a9aaa', black: '#1a1420',
  skin: '#f1c9a5', pale: '#f0e4ee', dark: '#1a1020', green: '#2f7a45', camellia: '#ff3355', candle: '#ffb347',
  suit: '#34427e', hair: '#3a2418', paper: '#f7ecdf', ink2: '#241838', snow: '#dfe8ff',
};
const c = PX.c;
PX.SCALE = 2;
const GROUND = MG.GROUND;
const stageFloor = (col) => MG.floor(col, COL.dim);
const say = (t, x, y, col = COL.ink) => MG.say(t, x, y, col, COL.dark);
const sing = MG.sing;
const isOut = (m) => m.phase === MG.phase.OUTCOME;
const isAct = (m) => m.phase === MG.phase.ACTION;

function traviataSprites() {
  setGravity(vec2(0, -0.05));                 // for the particles: confetti falls, bubbles use negative gravity
  // the cast, animated (lib/cast.js)
  const body = (h, f, b, l, s = COL.white, e = COL.dark) => CAST.body({ h, f, b, l, s, e, m: e === COL.dark ? undefined : e });
  const dress = (h, f, r, k) => CAST.dress({ h, f, r, k, e: COL.dark });
  SP.violetta = dress(COL.hair, COL.skin, COL.white, COL.camellia);
  SP.violettaPale = dress(COL.hair, '#e8c4bc', COL.pale, COL.camellia);
  SP.alfredo = body(COL.hair, COL.skin, COL.suit, '#1e2650');
  SP.germont = body('#e0e0e8', COL.skin, COL.grey, '#4a4a5a');
  const g = '#3a1624';
  SP.guest = body(g, g, g, g, g, g);
  SP.coupe = PX.sprite(['wyyyw', '.wyw.', '..w..', '..w..', '.www.'], { w: '#dfe6f5', y: COL.gold });
  SP.camellia = PX.sprite(['.r.r.', 'rrrrr', 'rrprr', 'rrrrr', '.r.r.'], { r: COL.camellia, p: '#ffd0da' });
  SP.camelliaW = PX.sprite(['.r.r.', 'rrrrr', 'rrprr', 'rrrrr', '.r.r.'], { r: COL.white, p: COL.gold });
  SP.bud = PX.sprite(['.r.', 'grg', '.g.'], { r: COL.camellia, g: '#5fbf6a' });
  SP.bee = PX.sprite(['.ww.', 'ykyk'], { w: '#dfe8ff', y: COL.gold, k: COL.dark });
  SP.scissors = PX.sprite(['g...g', '.g.g.', '..s..', '.s.s.', 's...s'], { g: '#dfe6f5', s: COL.gold });
  SP.letter = PX.sprite(['qqqqqqqqqqqq', 'qllllllqqqqq', 'qqqqqqqqqqqq', 'qllllllllqqq', 'qqqqqqqqqqqq', 'qlllllllllqq', 'qqqqqqqqqqqq', 'qqqqqqqqqqqq', 'qqqqqqqqqqqq'], { q: COL.paper, l: '#a89aa8' });
  SP.note = PX.sprite(['qqqqqq', 'qllllq', 'qqqqqq', 'qlllqq', 'qqqqqq'], { q: COL.paper, l: '#a89aa8' });
  SP.quill = PX.sprite(['....w', '...ww', '..ww.', '.dw..', 'd....'], { w: COL.white, d: COL.ink2 });
  SP.inkwell = PX.sprite(['.g.', 'kgk', 'kkk'], { g: COL.grey, k: COL.ink2 });
  SP.purse = PX.sprite(['..tt..', '..gg..', '.gggg.', 'gggggg', 'ggyggg', 'gggggg', '.gggg.'], { t: COL.camellia, g: COL.gold, y: '#b8862a' });
  SP.purseEmpty = PX.sprite(['.t....', 'gggggg', 'g.gg.g'], { t: COL.camellia, g: '#b8862a' });
  SP.coin = PX.sprite(['.y.', 'ygg', '.g.'], { y: '#fff2a8', g: COL.gold });
  SP.candle = PX.sprite(['www', 'www', 'www', 'www', 'www', 'www'], { w: COL.paper });
  SP.flame = PX.sprite(['.y.', '.y.', 'yoy', 'owo', '.o.'], { y: '#fff2a8', o: COL.candle, w: COL.white });
  SP.hand = PX.sprite(['.ss.', 'ssss', 'ssss', '.ss.', '.ss.'], { s: COL.skin });
  SP.portrait = PX.sprite(['ggggg', 'gdddg', 'gdsdg', 'gdwdg', 'gdddg', 'ggggg'], { g: COL.gold, d: COL.dark, s: COL.skin, w: COL.white });
  SP.heart = PX.sprite(['.r.r.', 'rrrrr', 'rrrrr', '.rrr.', '..r..'], { r: COL.camellia });
}

// ---- feel: particles, flashes, shakes, stings ----
// a burst (or a stream, time 0) of untextured square particles: champagne, confetti, petals, snow, smoke
const puff = (x, y, cols, o = {}) => new ParticleEmitter(
  vec2(x, y), o.a || 0, o.w ?? 4, o.time ?? 0.08, o.rate ?? 400, o.cone ?? PI, undefined,
  c(cols[0]), c(cols[1] || cols[0]), c(cols[0], o.fade ?? 0), c(cols[1] || cols[0], o.fade ?? 0),
  o.life ?? 1, o.s ?? 2, o.s1 ?? o.s ?? 2, o.v ?? 1, 0, o.damp ?? 0.94, 1, o.g ?? 1, 0, 0.2, 0.4);
// the camera shakes by m.shk pixels, decaying; called at the top of a render
const shake = (m) => { if (m.shk > 0.4) { setCameraPos(cameraPos.add(vec2(Math.round(rand(-m.shk, m.shk)), Math.round(rand(-m.shk, m.shk))))); m.shk *= 0.88; } };
// an arm: a 2-pixel line of squares from a shoulder to a hand
const limb = (x0, y0, x1, y1, col) => { const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1); for (let i = 0; i <= n; i++) PX.rect(Math.round(x0 + (x1 - x0) * i / n), Math.round(y0 + (y1 - y0) * i / n), 2, 2, col); };
const box = (x, y, w, h, col) => { PX.rect(x, y, w, 1, col); PX.rect(x, y + h - 1, w, 1, col); PX.rect(x, y, 1, h, col); PX.rect(x + w - 1, y, 1, h, col); };
// the verdict, heard the instant the act ends: a rising bell run, or a falling growl
const verdictSound = (won, gentle) => {
  const t = S.now(), r = S.deg('1') + 12;
  if (won) [0, 4, 7, 12, 16].forEach((n, i) => S.voice('arp', r + n, t + i * 0.055, 0.22, { vol: gentle ? 0.045 : 0.075 }));
  else { if (!gentle) S.drum('kick', t, 0.22); [0, -1, -6].forEach((n, i) => S.voice('bass', r - 12 + n, t + i * 0.14, 0.35, { vol: 0.15, grit: !gentle })); }
};
// every scored act is wrapped: the verdict sting, a flash (win) or a dip (loss), a shake, the outcome clock m.age
const act = (a) => ({
  ...a,
  onOutcome(m) { m.age = 0; if (!a.toy) { verdictSound(m.won, a.gentle); m.shk = m.won ? (a.gentle ? 0 : 2) : (a.gentle ? 2 : 4); } a.hit?.(m); },
  updateOutcome(m) { m.age += timeDelta; a.after?.(m); },
  renderOutcome(m) {
    if (a.toy) return;
    const k = Math.max(0, 1 - m.age * (a.gentle ? 2.5 : 4));
    PX.rect(0, 0, PX.W, PX.H, m.won ? c('#ffffff', k * (a.gentle ? 0.55 : 0.8)) : c('#000000', k * 0.75));
  },
});

// ---- rooms: a flat dark wall, a dark floor, a faint pool of light where the action is ----
// Act IV's coins: thrown in an arc, or rolling along the floor, each one clinks onto the pile at her feet
const flyCoins = (m) => {
  m.coins = m.coins.filter((k) => {
    k.x += k.vx * timeDelta; k.vy -= k.g * timeDelta; k.y += k.vy * timeDelta;
    if (k.roll) k.x = Math.min(k.x, k.roll);
    if (k.y > GROUND || k.vy > 0) return true;
    if (k.roll && k.x < k.roll) { k.y = GROUND; k.vy = Math.max(30, -k.vy * 0.5); return true; }
    m.landed++; S.voice('arp', S.deg('5+') + 12, S.now(), 0.08, { vol: 0.04 });
    return false;
  });
};
const room = (wall, floorCol, px = 64, pw = 128) => {
  PX.rect(0, GROUND, 256, 120, c(wall));
  PX.rect(px, GROUND, pw, 70, c('#ffffff', 0.035));
  stageFloor(floorCol);
};
const salon = (guests = true) => {
  room('#240a14', '#3d1020');
  for (let i = 0; i < 7; i++) PX.rect(8 + i * 40, GROUND + 1, 2, 110, c('#2e0e1a'));      // wall panels, static
  if (guests) for (const x of [52, 70, 186, 204]) CAST.draw(SP.guest, x, GROUND + 2, { t: time + x / 7 });
};
const BRINDISI = TUNES.brindisi.notes.slice(0, 17), BRINDISI_D = TUNES.brindisi.durs.slice(0, 17);   // 3/8, an eighth is one game beat; checked
const CLINK_X = 126, CLINK_Y = GROUND + 26;
const deathroom = () => { room('#140d24', '#221638', 96, 64); };
// the bed at x, with a pillow at its left end
const bed = (x) => { PX.rect(x, GROUND, 44, 8, c('#3a2656')); PX.rect(x, GROUND + 8, 44, 3, c(COL.violet)); PX.rect(x + 2, GROUND + 10, 10, 4, c(COL.pale)); PX.rect(x - 2, GROUND, 3, 18, c('#3a2656')); };
// Violetta lying on a bed at x, head on the pillow, breathing (t: 0 when she has stopped)
const lying = (x, col, t) => CAST.draw(SP.violettaPale, x + 8, GROUND + 3, { angle: -PI / 2, color: col, pose: 'idle', t });

MG.opera({
  title: 'LA TRAVIATA',
  sub: 'VERDI · SIX MICROGAMES',
  key: [10, 'major'],
  colours: COL,
  sprites: traviataSprites,
  ending: (m, n) => n === 5 ? ['VIOLETTA DIES. EVERYONE IS VERY SORRY.']
    : n === 0 ? ['VIOLETTA DIES. PARIS GOES BACK TO THE PARTY.']
    : ['VIOLETTA DIES. THE LETTER CAME TOO LATE.'],
  music: { result: (t) => { S.key(10, 'major'); S.setRoom(3600, 0.55, 1, t); for (let i = 0; i < 4; i++) S.arp(['I', 'vi', 'IV', 'I'][i], 0.9, 25, t + i, { vol: 0.06, octave: 1 }); S.voice('soprano', S.deg('3+'), t + 4, 3, { vol: 0.11 }); } },
  renderTitle: () => { salon(false); CAST.draw(SP.alfredo, 106, GROUND); CAST.draw(SP.violetta, 136, GROUND); PX.draw(SP.coupe, 118, GROUND + 18 + MG.bounce(timeReal) * 2); PX.draw(SP.coupe, 128, GROUND + 18 + MG.bounce(timeReal) * 2); },
  renderResult: () => { deathroom(); bed(96); lying(96, WHITE, 0); CAST.draw(SP.alfredo, 150, GROUND); CAST.draw(SP.germont, 174, GROUND, { flip: true }); PX.draw(SP.portrait, 150, GROUND + 12); },

  acts: [
    // ---------------------------------------------------------------- I
    // A waltz. The two glasses swing apart and back together once a bar; a gold square
    // closes on the point where they meet. Press as it closes: the glasses ring.
    act({ name: 'ACT I · THE SALON', aria: 'LIBIAMO', command: 'TOAST!', bpm: 125, beats: 15, verb: 'tap on the downbeat', shot: 'mid', focus: () => [128, GROUND + 30],
      init(m) { m.clinks = 0; m.timeoutWins = false; m.flash = 0; m.lastBar = -1; },
      update(m) {
        // the downbeat is every third beat; tap on it
        const bar = Math.round(m.beat / 3), off = Math.abs(m.beat / 3 - bar) * 3;
        if (m.press) {
          if (off < 0.3 && bar !== m.lastBar && bar > 0) {
            m.lastBar = bar; m.clinks++; m.flash = 1;
            S.voice('arp', S.deg('1+') + 12, S.now(), 0.3, { vol: 0.08 }); S.voice('arp', S.deg('5+') + 12, S.now() + 0.05, 0.3, { vol: 0.06 });
            puff(CLINK_X, CLINK_Y, [COL.gold, COL.white], { v: 1.4, life: 0.5, g: 0.2, time: 0.05 });
            if (m.clinks >= 3) m.win();
          } else {
            // off the beat: she coughs, and a heart goes out
            m.clinks = Math.max(0, m.clinks - 1); S.drum('breath', S.now(), 0.3); CAST.hit(SP.violetta);
            puff(152, GROUND + 19, ['#8a7a8a'], { a: PI / 2, cone: 0.6, v: 0.8, life: 0.6, g: -0.2, time: 0.05, rate: 200 });
          }
        }
        m.flash = Math.max(0, m.flash - timeDelta * 3);
      },
      hit(m) {
        if (m.won) {
          puff(CLINK_X, CLINK_Y + 2, [COL.gold, COL.white], { time: 0.8, rate: 90, v: 1.6, cone: 0.5, g: -0.3, life: 1.6, fade: 1 });
          puff(CLINK_X, CLINK_Y, [COL.camellia, COL.gold], { v: 2.6, life: 2, fade: 1, rate: 700, time: 0.08 });
        } else puff(CLINK_X + 12, CLINK_Y - 6, [COL.gold], { a: PI, cone: 0.5, v: 0.8, g: 1, life: 0.8, rate: 250, time: 0.1 });   // the champagne spills
      },
      after(m) { if (m.age > 1.3 && !m.coughed) { m.coughed = 1; S.drum('breath', S.now(), 0.3); CAST.hit(SP.violetta); puff(152, GROUND + 19, ['#8a7a8a'], { a: PI / 2, cone: 0.6, v: 0.8, life: 0.8, g: -0.2, time: 0.1, rate: 200 }); } },
      render(m) {
        shake(m);
        salon();
        const out = isOut(m);
        // the glasses meet on the downbeat and part in between: the waltz you can see
        const q = ((m.beat / 3) % 1 + 1) % 1;
        let sep = isAct(m) ? Math.round(9 * Math.sin(PI * q)) : 9;
        if (out) sep = m.won ? 0 : Math.round(8 * Math.max(0, 1 - m.age / 1.2));
        const cough = out && m.age > 1.3 && m.age < 2.2;
        const lift = m.flash > 0 ? 2 : 0;
        // the arms that hold the glasses up
        limb(106, GROUND + 11, CLINK_X - 7 - sep, CLINK_Y - 8 + lift, c(COL.suit));
        limb(146, GROUND + 11, CLINK_X + sep + 5, CLINK_Y - 8 + lift, c(COL.pale));
        CAST.draw(SP.alfredo, 96, GROUND);
        CAST.draw(SP.violetta, 146, GROUND - (cough ? 1 : 0), { flip: true });
        PX.draw(SP.coupe, CLINK_X - 10 - sep, CLINK_Y - 8 + lift);
        PX.draw(SP.coupe, CLINK_X + sep, CLINK_Y - 8 + lift, { angle: out && !m.won && m.age < 0.6 ? 0.5 : 0 });
        if (isAct(m)) {
          // the beat target: a square that closes on the meeting point, landing on the downbeat
          const s = Math.round(8 + 40 * (1 - q)), near = q > 0.85 || q < 0.1;
          box(CLINK_X - s / 2, CLINK_Y - s / 2, s, s, c(COL.gold, 0.35 + 0.65 * q));
          box(CLINK_X - 5, CLINK_Y - 5, 10, 10, c(near ? COL.white : COL.gold, near ? 1 : 0.6));
          // three hearts: the clinks you need
          for (let i = 0; i < 3; i++) PX.draw(SP.heart, 110 + i * 12, GROUND + 50, { color: i < m.clinks ? WHITE : c('#5a2a3a') });
        }
        if (m.flash > 0) PX.rect(CLINK_X - 2, CLINK_Y - 2, 4, 4, c(COL.white, m.flash));
        if (out && m.won && m.age > 0.3) PX.draw(SP.heart, CLINK_X - 5, GROUND + 44 + MG.bounce() * 3);
        if (cough) say('KOFF', 158, GROUND + 26, COL.grey);
      },
      outcome: (m) => m.won ? ['THE GLASSES RING. THEN SHE COUGHS.'] : ['THE GLASSES MISS. SHE COUGHS ANYWAY.'],
      music: {
        curtain: (t, b) => { S.key(10, 'major'); MG.sting(t, 'I'); for (let k = 0; k < 6; k++) S.voice('bass', S.deg(k % 3 ? '5-' : '1-'), t + b + k * b / 2, b / 3, { vol: 0.1 }); },
        bar: (t, b, i) => {
          // 3/4: the bar function is called per four beats, so lay out by beat count
          for (let k = 0; k < 4; k++) { const beatN = i * 4 + k; S.voice('bass', S.deg(beatN % 3 === 0 ? '1-' : '5-'), t + k * b, b * 0.35, { vol: beatN % 3 === 0 ? 0.14 : 0.08 }); S.voice('arp', S.deg(beatN % 3 === 0 ? '3' : '5'), t + k * b, b * 0.25, { vol: 0.05 }); }
          if (i === 0) sing('soprano', BRINDISI, BRINDISI_D, t, b, { vol: 0.11, light: 'lead' });
        },
        outcome: (t, b, won) => { if (won) { sing('tenor', ['5', '6', '5', '1+'], [0.5, 0.5, 0.5, 1.5], t, b, { vol: 0.13 }); S.drum('crowd', t + b, 0.15); } else { S.drum('breath', t, 0.35); S.voice('bass', S.deg('1-'), t + 0.4, 1.2, { vol: 0.14, grit: true }); } },
      },
    }),
    // ---------------------------------------------------------------- II
    // The toy. The country house, the happy months: snip camellias off the hedge,
    // each one a puff of petals and a note, and they grow back. No win, no loss.
    act({ name: 'ACT II · THE COUNTRY', aria: 'UN DÌ, FELICE', command: 'SNIP!', bpm: 135, beats: 12, verb: 'play', toy: true, shot: 'mid', focus: () => [128, GROUND + 30],
      init(m) {
        m.bloom = [1, 1, 1, 1, 1]; m.next = 0; m.snips = 0; m.snipT = 9;
        puff(128, 104, [COL.camellia, '#ffd0da'], { a: PI, w: vec2(150, 2), time: 0, rate: 5, cone: 0.6, v: 0.3, g: 0.2, damp: 0.96, life: 6, fade: 1 });
      },
      update(m) {
        m.snipT += timeDelta;
        m.bloom = m.bloom.map((v) => Math.min(1, v + timeDelta * 0.8));      // they grow back
        if (m.bloom[m.next] < 1) { const j = m.bloom.findIndex((v) => v >= 1); if (j >= 0) m.next = j; }   // the scissors go to an open one
        if (m.press && m.bloom[m.next] < 1) S.drum('hat', S.now(), 0.05);        // still a bud: a little click
        else if (m.press) {
          const x = 120 + m.next * 10, y = GROUND + (m.next % 2 ? 20 : 14);
          m.snipT = 0; m.bloom[m.next] = 0; m.snips++;
          puff(x + 5, y + 5, [m.next % 2 ? COL.white : COL.camellia, '#ffd0da'], { v: 1.2, g: 0.15, damp: 0.95, life: 1.8, fade: 1, rate: 300, time: 0.04 });
          S.drum('hat', S.now(), 0.1);
          S.voice('arp', S.deg(['1', '2', '3', '5', '6', '1+', '2+', '3+'][m.snips % 8]) + 12, S.now(), 0.25, { vol: 0.06 });
          m.next = (m.next + 1) % 5;
        }
      },
      hit(m) {
        m.gx = 262;
        puff(140, 70, [COL.camellia, COL.white], { a: PI, w: vec2(60, 4), time: 0.3, rate: 80, cone: 0.8, v: 0.4, g: 0.2, damp: 0.96, life: 4, fade: 1 });
      },
      after(m) { m.gx = Math.max(177, 262 - m.age * 90); },
      render(m) {
        room('#0e1a14', '#1a3322');
        // the hedge and its gate
        PX.rect(114, GROUND, 58, 20, c('#1f4a2a'));
        PX.rect(118, GROUND + 20, 50, 6, c('#1f4a2a'));
        PX.rect(173, GROUND, 3, 32, c('#6a5a4a')); PX.rect(190, GROUND, 3, 32, c('#6a5a4a')); PX.rect(173, GROUND + 30, 20, 2, c('#6a5a4a'));
        for (let i = 0; i < 5; i++) {
          const x = 120 + i * 10, y = GROUND + (i % 2 ? 20 : 14), v = m.bloom[i];
          if (v >= 1) PX.draw(i % 2 ? SP.camelliaW : SP.camellia, x, y);
          else if (v > 0.4) PX.draw(SP.bud, x + 2, y + 2);
        }
        CAST.draw(SP.alfredo, 70, GROUND);
        CAST.draw(SP.violetta, 92, GROUND);
        // her bouquet, growing
        for (let i = 0; i < Math.min(m.snips, 7); i++) PX.draw(i % 2 ? SP.camelliaW : SP.camellia, 100 + (i % 3) * 4, GROUND + 8 + Math.floor(i / 3) * 4, { scale: 1 });
        // the scissors hover over the next blossom, on the beat
        if (isAct(m)) {
          const x = 120 + m.next * 10, y = GROUND + (m.next % 2 ? 20 : 14);
          PX.draw(SP.scissors, x, y + 10 + (m.snipT < 0.12 ? -3 : Math.round(MG.bounce() * 2)));
        }
        // a bee, the one thing that wanders
        const bt = m.t + (isOut(m) ? 20 : 0);
        PX.draw(SP.bee, 142 + Math.sin(bt * 1.7) * 26, GROUND + 38 + Math.sin(bt * 3.1) * 6, { flip: Math.cos(bt * 1.7) < 0 });
        if (isOut(m)) {
          CAST.draw(SP.germont, m.gx, GROUND, { flip: true });
          if (m.age > 1.2) say('SIGNORA.', 150, GROUND + 40, COL.grey);
        }
      },
      outcome: () => ['HAPPY MONTHS. THEN A MAN IN GREY AT THE GATE.'],
      music: {
        curtain: (t, b) => { S.key(10, 'major'); MG.sting(t, 'I'); S.arp('I', 3 * b, 25, t + b, { vol: 0.06, octave: 1 }); },
        bar: (t, b, i) => { for (let k = 0; k < 4; k++) S.arp(['I', 'vi', 'IV', 'V'][k], b * 0.9, 25, t + k * b, { vol: 0.06, octave: 1, light: k ? null : 'lead' }); if (i % 2 === 0) sing('tenor', BRINDISI.slice(0, 8), BRINDISI_D.slice(0, 8), t, b * 0.8, { vol: 0.11, vibrato: 6 }); },   // Un dì felice is unverified; the Brindisi, slow, in the country
        outcome: (t, b, won) => { S.key(10, 'minor'); S.voice('bass', S.deg('1-'), t + b, 2, { vol: 0.15 }); S.voice('bass', S.deg('2b-'), t + 2 * b, 1.5, { vol: 0.13 }); if (won) sing('soprano', ['5', '3'], [0.5, 1.5], t, b, { vol: 0.11 }); },
      },
    }),
    // ---------------------------------------------------------------- III
    // The letter on the desk, the pen on the letter. Hold, and she signs her name.
    // Let go and Germont takes the pen. Either way the letter is signed.
    act({ name: "ACT II · GERMONT'S DEMAND", aria: 'PURA SICCOME UN ANGELO', command: 'RENOUNCE!', bpm: 110, beats: 12, verb: 'hold', shot: 'mid', focus: () => [128, GROUND + 26],
      init(m) { m.sign = 0; m.scr = 0; m.timeoutWins = false; m.gx = 164; },
      update(m) {
        if (m.hold) {
          m.sign = Math.min(1, m.sign + timeDelta / (m.beats * MG.beat() * 0.62));
          m.scr += timeDelta; if (m.scr > 0.09) { m.scr = 0; S.drum('hat', S.now(), 0.05); }
        }
        if (m.sign >= 1) m.win();
      },
      hit(m) {
        if (m.won) puff(128, GROUND + 22, [COL.gold, COL.white], { v: 1.6, g: 0.3, life: 1.2, fade: 1, rate: 600, time: 0.06 });
      },
      after(m) {
        // a loss: Germont steps to the desk, signs it for her, and steps back
        if (!m.won) {
          m.gx = 164 - 16 * Math.min(1, m.age / 0.4, Math.max(0, (1.6 - m.age) / 0.4));
          if (m.age > 0.4 && m.sign < 1) { m.sign = Math.min(1, m.sign + timeDelta * 1.6); m.scr += timeDelta; if (m.scr > 0.08) { m.scr = 0; S.drum('hat', S.now(), 0.05); } }
        }
        if (m.sign >= 1 && !m.sealed) { m.sealed = 1; m.sealAt = m.age; S.drum('kick', S.now(), 0.12); puff(135, GROUND + 18, [COL.camellia, COL.gold], { v: 1, g: 0.5, life: 0.6, rate: 400, time: 0.04 }); }
      },
      render(m) {
        shake(m);
        room('#15121f', '#261f33', 80, 96);
        // the desk, the letter on it, the inkwell
        PX.rect(100, GROUND + 12, 56, 3, c('#7a5238'));
        PX.rect(102, GROUND, 3, 12, c('#5a3a2a')); PX.rect(151, GROUND, 3, 12, c('#5a3a2a'));
        const out = isOut(m), done = out && m.sign >= 1;
        const glow = isAct(m) ? 0.4 + 0.6 * MG.bounce() : 0;
        if (glow) box(115, GROUND + 14, 26, 20, c(COL.gold, glow));
        PX.draw(SP.letter, 116, GROUND + 15);
        PX.draw(SP.inkwell, 144, GROUND + 15);
        // the signature: an ink scrawl that grows along the bottom of the letter
        const n = Math.round(18 * m.sign), wave = [0, 1, 2, 1, 0, 1, 2, 2, 1, 0];
        for (let i = 0; i < n; i++) PX.rect(119 + i, GROUND + 17 + wave[i % 10], 1, 1, c(COL.ink2));
        if (done && m.sealed) PX.rect(134, GROUND + 16, 4, 4, c(COL.camellia));
        CAST.draw(SP.violetta, 84, GROUND);
        CAST.draw(SP.germont, m.gx, GROUND, { flip: true });
        // the pen: at the tip of the signature while it is being written, in the inkwell once it is done
        if (done && m.sealed) PX.draw(SP.quill, 145, GROUND + 19);
        else PX.draw(SP.quill, 118 + n, GROUND + 17 + (m.hold && isAct(m) ? Math.round(rand(0, 1)) : 0));
        if (isAct(m) && !m.hold && m.t > 0.6) say('HOLD SPACE', 110, GROUND + 44, COL.gold);
        if (isAct(m) && m.t > 1.2) say('FOR MY DAUGHTER', 170, GROUND + 30, COL.grey);
        if (out && m.age > 1.8) say(m.won ? 'AMAMI, ALFREDO!' : 'CORAGGIO.', m.won ? 72 : 160, GROUND + 30, m.won ? COL.ink : COL.grey);
      },
      outcome: (m) => m.won ? ['SHE SIGNS IT. SHE WILL LEAVE ALFREDO.'] : ['GERMONT SIGNS FOR HER. SHE LEAVES ALFREDO ANYWAY.'],
      music: {
        curtain: (t, b) => { S.key(10, 'minor'); S.setRoom(700, 0.55, 1, t); S.drum('kick', t, 0.16); S.voice('bass', S.deg('1-'), t, 3 * b, { vol: 0.13 }); S.voice('bass', S.deg('2b-'), t + 1.5 * b, 1.5 * b, { vol: 0.1 }); },
        bar: (t, b) => { for (let k = 0; k < 4; k++) { S.drum('kick', t + k * b, 0.1); S.voice('bass', S.deg(k % 2 ? '2b-' : '1-'), t + k * b, b * 0.8, { vol: 0.12 }); } sing('tenor', ['3', '3', '2', '1', '7-', '1'], [0.5, 0.5, 0.5, 0.5, 1, 1], t, b, { vol: 0.11, vibrato: 4, light: 'lead' }); },
        outcome: (t, b, won) => { S.setRoom(2400, 0.45, 2, t); if (won) sing('soprano', ['5', '3', '2', '1'], [0.5, 0.5, 0.5, 2], t, b, { vol: 0.14 }); else S.voice('bass', S.deg('1-'), t, 2.5, { vol: 0.15, grit: true }); },
      },
    }),
    // ---------------------------------------------------------------- IV
    // Alfredo with his winnings over his head, Violetta across the gaming table.
    // Each press flings a coin at her feet. Empty the purse.
    act({ name: "ACT II · FLORA'S PARTY", aria: 'THE GAMBLING TABLE', command: 'FLING!', bpm: 160, beats: 12, verb: 'mash', shot: 'mid', focus: () => [128, GROUND + 26],
      init(m) { m.thrown = 0; m.landed = 0; m.coins = []; m.timeoutWins = false; m.need = 10; m.purseY = GROUND + 24; m.arm = 0; },
      update(m) {
        if (m.press && m.thrown < m.need) {
          m.thrown++; m.arm = 0.15;
          const tx = 162 + (m.thrown % 5) * 4, T = 0.6;
          m.coins.push({ x: 88, y: GROUND + 34, vx: (tx - 88) / T, vy: 34 / T * -1 + 200 * T, g: 400 });
          S.drum('hat', S.now(), 0.12);
          if (m.thrown >= m.need) m.win();
        }
        m.arm = Math.max(0, m.arm - timeDelta);
        flyCoins(m);
      },
      hit(m) {
        if (m.won) { puff(176, GROUND + 50, [COL.gold, '#fff2a8'], { a: PI, w: vec2(40, 4), time: 0.5, rate: 200, cone: 0.3, v: 0.5, g: 1, life: 1.2, fade: 1, s: 2 }); S.drum('crowd', S.now() + 0.1, 0.2); }
        else S.drum('thunder', S.now() + 0.25, 0.12);
      },
      after(m) {
        if (!m.won) {
          // the purse drops, splits, and the rest of the gold rolls to her feet anyway
          m.purseY = Math.max(GROUND, GROUND + 24 - m.age * 90);
          if (m.purseY <= GROUND && m.thrown < m.need && m.age > 0.35) {
            puff(84, GROUND + 4, [COL.gold], { v: 1.2, g: 1, life: 0.6, rate: 300, time: 0.05 });
            for (; m.thrown < m.need; m.thrown++) m.coins.push({ x: 80 + m.thrown, y: GROUND + 2, vx: 140 + m.thrown * 12, vy: 40 + rand(0, 40), g: 400, roll: 162 + (m.thrown % 5) * 4 });
          }
        } else m.purseY = m.age > 0.5 ? Math.max(GROUND, GROUND + 24 - (m.age - 0.5) * 90) : GROUND + 24;
        flyCoins(m);
      },
      render(m) {
        shake(m);
        salon();
        // the gaming table
        PX.rect(104, GROUND + 12, 48, 3, c(COL.green));
        PX.rect(106, GROUND, 44, 12, c('#1a0c14'));
        CAST.draw(SP.alfredo, 76, GROUND, { pose: m.purseY > GROUND ? 'hold' : 'idle' });   // the purse over his head
        CAST.draw(SP.violetta, 168, GROUND, { flip: true });
        // the pile at her feet
        for (let i = 0; i < m.landed; i++) PX.draw(SP.coin, 160 + (i % 5) * 4, GROUND + Math.floor(i / 5) * 3);
        for (const k of m.coins) PX.draw(SP.coin, k.x, k.y);
        // the purse: over his head, then on the floor, empty
        const empty = m.thrown >= m.need;
        if (m.purseY > GROUND) PX.draw(empty ? SP.purseEmpty : SP.purse, 76 + (m.arm > 0 ? 4 : 0), m.purseY - (m.arm > 0 ? 2 : 0));
        else PX.draw(SP.purseEmpty, 88, GROUND);
        if (isOut(m) && m.age > 1.4) say('ALFREDO!', 178, GROUND + 30, COL.ink);
      },
      outcome: (m) => m.won ? ['EVERY COIN AT HER FEET. PARIS GASPS.'] : ['THE PURSE SPLITS. THE GOLD REACHES HER ANYWAY.'],
      music: {
        curtain: (t, b) => { S.key(10, 'minor'); MG.sting(t, 'i'); S.setRoom(2000, 0.4, 1, t); for (let k = 0; k < 8; k++) S.voice('pulse', S.deg(['1', '5', '1+', '5'][k % 4]), t + b + k * b / 4, b / 6, { vol: 0.07 }); },
        bar: (t, b) => { for (let k = 0; k < 8; k++) { S.voice('pulse', S.deg(['1', '.', '3', '1', '5', '.', '4', '3'][k]), t + k * b / 2, b / 4, { vol: 0.09, light: k % 2 ? null : 'lead' }); } for (let k = 0; k < 4; k++) { S.drum(k % 2 ? 'snare' : 'kick', t + k * b, 0.15); S.voice('bass', S.deg(k % 2 ? '5-' : '1-'), t + k * b + b / 2, b * 0.3, { vol: 0.12 }); } },
        outcome: (t, b, won) => { S.drum('snare', t, 0.25); S.drum('crowd', t + 0.2, 0.2); sing('bass', ['1-', '7--', '6b--'], [0.5, 0.5, 2], t, b, { vol: 0.16 }); if (won) S.voice('soprano', S.deg('3+'), t + b, 1.5 * b, { vol: 0.11 }); },
      },
    }),
    // ---------------------------------------------------------------- V
    // She reads Germont's letter by one candle. Draughts blow in from the window or
    // the door; the streaks show which side. Put your hand on that side.
    act({ name: 'ACT III · THE DEATHBED', aria: 'ADDIO, DEL PASSATO', command: 'READ!', bpm: 100, beats: 12, verb: 'shield', gentle: true, shot: 'mid', focus: () => [128, GROUND + 30],
      init(m) { m.flame = 1; m.side = 0; m.draft = 0; m.nextDraft = 1.2; m.timeoutWins = true; },
      update(m) {
        // drafts come from a side, telegraphed a beat early; put the hand on that side
        const b = MG.beat();
        if (!m.draft && m.t >= m.nextDraft - b) m.warn = m.warnSide ?? (m.warnSide = rand() < 0.5 ? -1 : 1); else if (m.draft) m.warn = 0;
        if (!m.draft && m.t >= m.nextDraft) { m.draft = m.warnSide; m.draftAt = m.t; m.draftEnd = m.t + 1.2 * b; m.warnSide = null; S.drum('breath', S.now(), 0.35); }
        if (m.draft && m.t >= m.draftEnd) { m.draft = 0; m.nextDraft = m.t + b + rand(0, 1.5 * b); }
        const was = m.side;
        if (m.left) m.side = -1; else if (m.right) m.side = 1;
        if (was !== m.side) S.drum('hat', S.now(), 0.06);
        m.blocked = m.draft && m.side === m.draft;
        if (m.draft && !m.blocked) m.flame = Math.max(0, m.flame - timeDelta * 0.9);
        else m.flame = Math.min(1, m.flame + timeDelta * 0.15);
        if (m.flame <= 0) m.lose();
      },
      hit(m) {
        if (m.won) puff(128, GROUND + 34, [COL.gold, '#fff2a8'], { v: 1.2, g: -0.2, life: 1.2, rate: 500, time: 0.05 });
        else puff(128, GROUND + 30, ['#6a6a7a', '#3a3a4a'], { a: 0, cone: 0.4, v: 0.5, g: -0.2, life: 2, rate: 60, time: 0.5, s: 3 });
        // snow at the window, both ways
        puff(80, GROUND + 58, [COL.snow, '#9aa8d8'], { a: PI, w: vec2(20, 1), time: 0, rate: 9, cone: 0.3, v: 0.2, g: 0.1, damp: 0.96, life: 3.4, fade: 1 });
      },
      render(m) {
        shake(m);
        deathroom();
        const out = isOut(m);
        const lit = out ? m.won : m.flame > 0;
        const moon = out && !m.won ? Math.min(1, m.age / 1.2) : out ? 0.4 : 0;
        // the window (left) and the door (right): where the draughts come from
        PX.rect(68, GROUND + 28, 24, 32, c('#0c1030')); box(67, GROUND + 27, 26, 34, c('#4a3a6a')); PX.rect(79, GROUND + 28, 2, 32, c('#4a3a6a'));
        if (moon) PX.rect(68, GROUND + 28, 24, 32, c('#9aa8ff', 0.25 * moon));
        PX.rect(178, GROUND, 14, 44, c('#241838')); box(177, GROUND, 16, 45, c('#4a3a6a'));
        // the warm pool of the candle, the moonlight on the bed
        if (moon) PX.rect(136, GROUND, 40, 30, c('#9aa8ff', 0.1 * moon));
        bed(136); lying(136);
        PX.draw(SP.note, 150, GROUND + 22);
        // the nightstand and the candle
        PX.rect(118, GROUND, 20, 14, c('#2e2044')); PX.rect(116, GROUND + 14, 24, 2, c('#4a3a6a'));
        PX.draw(SP.candle, 125, GROUND + 16);
        if (lit) {
          const lean = isAct(m) && m.draft && !m.blocked ? -m.draft * 2 : 0;
          const k = out ? (m.won ? 1 + 0.5 * Math.max(0, 1 - m.age) : 1) : 0.5 + 0.5 * m.flame;
          PX.rect(116 + lean, GROUND + 22, 24, 30, c(COL.candle, 0.06 * k));
          PX.rect(120 + lean, GROUND + 26, 16, 22, c(COL.candle, 0.1 * k));
          PX.rect(123 + lean, GROUND + 28, 10, 16, c(COL.candle, 0.2 * k));
          PX.draw(SP.flame, 128 - 4.5 * k + lean, GROUND + 28, { scale: 3 * k });
        } else PX.rect(127, GROUND + 28, 2, 2, c(COL.dark));
        if (isAct(m)) {
          // the hand: left, right, or resting on the stand at the start
          PX.draw(SP.hand, m.side < 0 ? 112 : m.side > 0 ? 136 : 124, m.side ? GROUND + 28 : GROUND + 16);
          const sx = (d) => d < 0 ? 64 : 186;
          if (m.warn && Math.floor(m.t * 8) % 2) for (let i = 0; i < 3; i++) PX.rect(sx(m.warn) + (m.warn < 0 ? 0 : -4), GROUND + 28 + i * 5, 10, 2, c(COL.snow, 0.8));
          if (m.draft) {
            // the streaks fly at the flame and stop at the hand
            const stop = m.blocked ? (m.draft < 0 ? 112 : 144) : 128;
            for (let i = 0; i < 6; i++) {
              const p = ((m.t - m.draftAt) * 2.2 + i / 6) % 1;
              const x = m.draft < 0 ? 64 + p * (stop - 64) : 192 - p * (192 - stop);
              PX.rect(Math.round(x) - 5, GROUND + 28 + (i % 3) * 5, 10, 2, c(COL.snow, 0.9));
            }
          }
        }
        if (out && m.age > 1.6) say('È TARDI!', 146, GROUND + 44, COL.ink);
      },
      outcome: (m) => m.won ? ['SHE READS IT TO THE END. ALFREDO IS COMING.'] : ['THE CANDLE DIES. SHE KNOWS IT BY HEART: HE IS COMING.'],
      music: {
        curtain: (t, b) => { S.key(10, 'minor'); S.setRoom(500, 0.6, 1, t); S.drum('heartbeat', t, 0.14, 'heart'); S.drum('heartbeat', t + 2 * b, 0.12, 'heart'); },
        bar: (t, b, i) => { S.drum('heartbeat', t, 0.12, 'heart'); S.drum('heartbeat', t + 2 * b, 0.1, 'heart'); if (i % 4 === 0) sing('soprano', TUNES.addio.notes.slice(0, 14), TUNES.addio.durs.slice(0, 14), t, b * 0.8, { vol: 0.09, light: 'lead' }); if (i % 2) S.drum('crowd', t + b, 0.06); },
        outcome: (t, b, won) => { S.drum('heartbeat', t + b, 0.1); if (won) sing('soprano', ['5', '6', '5'], [0.5, 0.5, 2.5], t, b, { vol: 0.12 }); else S.voice('bass', S.deg('1-'), t, 2.5, { vol: 0.12 }); },
      },
    }),
    // ---------------------------------------------------------------- VI
    // Sitting up in bed, the portrait in her hand, Alfredo's open hand beside the bed.
    // Hold Right to reach it to him. Either way he ends up holding it.
    act({ name: 'ACT III · THE FAREWELL', aria: "PRENDI, QUEST'È L'IMMAGINE", command: 'GIVE!', bpm: 175, beats: 8, verb: 'reach', gentle: true, outcomeSeconds: 4.2, shot: 'mid', focus: () => [128, GROUND + 26],
      init(m) { m.reach = 0; m.timeoutWins = false; },
      update(m) {
        if (m.right || m.hold) m.reach = Math.min(1, m.reach + timeDelta * 0.55);
        else m.reach = Math.max(0, m.reach - timeDelta * 0.3);
        if (m.reach >= 1) { m.win(); S.silence(S.now() + 0.5, 2); }
      },
      hit(m) {
        m.from = 122 + Math.round(m.reach * 22);
        if (m.won) puff(150, GROUND + 22, [COL.gold, COL.white], { v: 1.2, g: -0.1, life: 1, rate: 500, time: 0.05 });
      },
      after(m) {
        if (m.age > 1.8 && !m.petals) { m.petals = 1; puff(118, 100, [COL.camellia, '#ffd0da'], { a: PI, w: vec2(70, 2), time: 2, rate: 8, cone: 0.5, v: 0.3, g: 0.2, damp: 0.96, life: 5, fade: 1 }); }
        if (!m.won && m.age > 0.4 && !m.thud) { m.thud = 1; S.drum('kick', S.now(), 0.1); }
      },
      render(m) {
        shake(m);
        deathroom();
        const out = isOut(m), lay = out && m.age > 1.8;
        bed(80);
        if (lay) lying(80, c('#ffffff', 0.85), 0);
        else { CAST.draw(SP.violettaPale, 108, GROUND + 6); PX.rect(78, GROUND + 6, 46, 6, c(COL.violet)); }
        limb(157, GROUND + 11, 151, GROUND + 17, c(COL.suit));
        CAST.draw(SP.alfredo, 156, GROUND, { flip: true });
        CAST.draw(SP.germont, 182, GROUND, { flip: true });
        // his open hand, the target, bobbing on the beat until it holds the portrait
        const hx = 122 + Math.round(m.reach * 22);
        let px = hx, py = GROUND + 20;
        if (out) {
          if (m.won) { px = 144; py = GROUND + 20; }
          else if (m.age < 1.5) { px = m.from; py = Math.max(GROUND, GROUND + 20 - m.age * 60); }
          else { px = 144; py = GROUND + 20; }
        }
        PX.draw(SP.hand, 144, GROUND + 14 + (isAct(m) ? Math.round(MG.bounce() * 2) : 0));
        if (isAct(m)) box(142, GROUND + 12, 12, 14, c(COL.gold, 0.4 + 0.6 * MG.bounce()));
        // her arm and hand while she reaches
        if (!out || (!lay && m.won && m.age < 0.6)) { PX.rect(118, GROUND + 18, hx - 116, 2, c(COL.pale)); PX.draw(SP.hand, hx, GROUND + 14); }
        PX.draw(SP.portrait, px, py);
        if (isAct(m) && m.t > 0.4 && !(m.right || m.hold)) say('HOLD RIGHT', 104, GROUND + 44, COL.gold);
        if (out && m.age > 2.4) say('SCUSA.', 192, GROUND + 30, COL.grey);           // the wink: Germont, deadpan, a little late
      },
      outcome: (m) => m.won ? ['SHE PUTS IT IN HIS HAND. SHE DIES.'] : ['IT FALLS. HE PICKS IT UP. SHE DIES ANYWAY.'],
      music: {
        curtain: (t, b) => { S.key(10, 'major'); S.setRoom(2400, 0.5, 1, t); S.drum('heartbeat', t, 0.12, 'heart'); S.arp('I', 3 * b, 25, t + b, { vol: 0.05, octave: 1 }); },
        bar: (t, b) => { S.drum('heartbeat', t, 0.1, 'heart'); S.drum('heartbeat', t + 2 * b, 0.08, 'heart'); sing('soprano', TUNES.addio.alfredo.notes, TUNES.addio.alfredo.durs, t, b * 0.6, { vol: 0.13, light: 'lead' }); S.arp('I', 4 * b, 25, t, { vol: 0.05, octave: 1 }); },   // Prendi is unverified: this is 'L'amore d'Alfredo' from Addio del passato
        outcome: (t, b, won) => { if (!won) { S.drum('heartbeat', t, 0.1); S.drum('heartbeat', t + 1.2 * b, 0.07); } S.key(10, 'minor'); S.voice('bass', S.deg('1-'), t + 2.5, 2, { vol: 0.14 }); S.arp('i', 1.6, 25, t + 2.7, { vol: 0.05, octave: 1 }); },
      },
    }),
  ],
});
