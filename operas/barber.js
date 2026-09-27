/* IL BARBIERE DI SIVIGLIA, a dot opera.
   Rossini's comic masterpiece: speed, patter, disguises, and farce.
   Treatment: docs/treatments/barber.json. */
O.opera = {
  title: 'IL BARBIERE DI SIVIGLIA', lang: 'it',
  tempo: 132, root: 0, mode: 'major',
  stage: { grid: 9 },
  lights: {
    sand: '#e8c894',     // Seville streets, town square & wedding cathedral
    night: '#1c2a4a',    // Dawn moonlight & midnight storm indigo
    gold: '#f4b93a',     // Almaviva: nobleman's coat, candlelight, church altar
    rose: '#f08098',     // Rosina: bride's silk dress & mischief
    soldier: '#62c43a',  // Almaviva's drunken soldier disguise
    fusty: '#8b5a2b',    // Dr. Bartolo: fusty brown frock coat
    bulb: '#ffffff',     // Figaro: clean white linen & lightning strobe
  },

  build(k) {
    const B = 60 / 132, C = k.centre, T = k.tl;
    const cell = (c, r) => k.at(c, r);
    const paint = (els, name, t) => T.call(() => k.paint(els, name), [], t);
    const pilot = (el, name, t) => T.call(() => k.pilot(el, name), [], t);

    const W = k.cells();
    const ring = (cx, cy, d) => W.filter((_, i) => Math.round(Math.hypot(i % 9 - cx, Math.floor(i / 9) - cy)) === d);

    const M = (s) => s.split(' ').map(k.deg);
    const sing = (voice, notes, durs, t, light, vol = .16) => {
      let at = t;
      notes.forEach((n, i) => {
        const d = durs[i] * B;
        k.note(voice, n, at, d * .92, { vol, light: light ? light(i) : null });
        at += d;
      });
      return at;
    };

    O.inst.guitar = {
      wave: 'triangle', detune: 1.5,
      attack: .003, decay: .22, release: .26,
      filterStart: 2800, filterEnd: 650,
      gain: .17
    };

    const strum = (notes, at, vol = .08) => M(notes).forEach((n, i) => {
      k.note('guitar', n, at + i * .022, .45 * B, { vol, light: alma });
    });

    const figaro = cell(C, C), alma = cell(4, 7), rosina = cell(4, 1), bartolo = cell(2, 4);
    const introLine = [1, 3, 5, 7].map((c) => cell(c, 4));

    // Reset for each loop
    k.bg('night', 0);
    k.paint(W, 'night');
    k.pilot(W, null);
    k.room(2000, .32, 0, .1);
    k.shot('wide', 0);

    let t = 0;

    // 0. I PERSONAGGI (Horizontal Lineup & Pan)
    k.act('I PERSONAGGI', t);
    [
      ['gold', ['ALMAVIVA : THE LOVER 🎸', "ALMAVIVA : L'INNAMORATO 🎸"], () => strum('1 3 5 1+', t + .1, .12)],
      ['rose', ['ROSINA : THE WARD', 'ROSINA : LA PUPILLA'], (el) => M('1+ 3+').forEach((d, j) => k.note('soprano', d, t + .1 + j * .4 * B, .8 * B, { vol: .16, light: el }))],
      ['fusty', ['BARTOLO : THE GUARDIAN', 'BARTOLO : IL TUTORE'], (el) => k.note('bass', k.deg('1-'), t + .1, B, { vol: .18, light: el })],
      ['bulb', ['FIGARO : THE BARBER ✂️', 'FIGARO : IL BARBIERE ✂️'], (el) => {
        [1, 2].forEach((j) => k.drum('hat', t + j * .1, .1, [el]));
        k.note('arp', k.deg('1+'), t + .3, .6 * B, { vol: .12, light: el });
      }],
    ].forEach(([light, title, fn], i) => {
      const el = introLine[i];
      pilot(el, light, t); paint(el, light, t, 1);
      k.shot('close', t, { on: [2 * i + 1, 4], dur: .35 });
      fn(el);
      k.say(el, title, t + .1, 1.8);
      t += 2.0;
    });

    k.shot('wide', t, { dur: .6 });
    paint(introLine, 'night', t + .6, 1);
    pilot(introLine, null, t + .6);
    t += .8;

    // I. ECCO RIDENTE IN CIELO (Spanish guitar serenade & upward light waves)
    k.act('ECCO RIDENTE', t);
    paint(W, 'night', t - .01, 1);
    pilot(alma, 'gold', t); paint(alma, 'gold', t, 1);

    strum('1 3 5 1+', t, .1);
    strum('5 7 2+ 5+', t + 1.2 * B, .1);
    strum('1 3 5 1+', t + 2.4 * B, .12);
    t += 3.4 * B;

    const ECCO1 = M('1 3 5 6 5 3 4 2 1'), ECCO1_D = [1, .5, .5, 1, .5, .5, .5, .5, 1.5];
    const ECCO2 = M('5 1+ 7 6 5 4 3 2 1'), ECCO2_D = [.75, .25, .5, .5, .75, .25, .5, .5, 1.5];

    [[ECCO1, ECCO1_D, 6, [3, 4, 5], '1 3 5', 6.5], [ECCO2, ECCO2_D, 5, [2, 4, 6], '5 7 2+', 5.5]].forEach(([notes, durs, row0, cols, ch, dur]) => {
      sing('tenor', notes, durs, t, () => alma, .15);
      for (let i = 0; i < 5; i++) {
        const at = t + i * 1.15 * B, beam = cols.map((c) => cell(c, row0 - i)).filter(Boolean);
        paint(beam, 'gold', at - .01);
        strum(ch, at, .06);
        k.note('arp', k.deg(['1+', '3+', '5+'][i % 3]), at, .35, { vol: .04, light: beam });
        paint(beam, 'night', at + .35);
      }
      t += dur * B;
    });

    const balcony = W.filter((_, i) => i < 27 && Math.abs(i % 9 - 4) <= 1);
    paint(balcony, 'gold', t - .01);
    pilot(rosina, 'rose', t); paint(rosina, 'rose', t, 1);
    k.shot('mid', t, { on: [4, 1] });
    k.note('soprano', k.deg('1+'), t, 1.4 * B, { vol: .16, light: rosina });

    t += 1.8 * B;
    k.say(alma, '🎸 LINDORO', t, 1.8 * B);
    strum('1 3 5 1+', t, .1);
    k.note('tenor', k.deg('1'), t, 1.2 * B, { vol: .14, light: alma });

    k.hop(rosina, cell(5, 1), t + .6 * B);
    k.hop(cell(5, 1), rosina, t + 1.4 * B);
    k.note('soprano', k.deg('3+'), t + .6 * B, .8 * B, { vol: .13, light: rosina });
    t += 2.5 * B;

    paint(balcony, 'night', t, 1);
    pilot(rosina, null, t); pilot(alma, null, t);
    paint([alma, rosina], 'night', t, 1);

    // II. LARGO AL FACTOTUM (Full Bleed Seville Morning, Figaro Solo & Snake Patter)
    k.act('LARGO AL FACTOTUM', t);
    k.shot('wide', t);
    k.bg('sand', t);
    paint(W, 'sand', t, 1);

    for (let r = 0; r < 9; r++) paint(W.slice(r * 9, r * 9 + 9), 'sand', t + r * .05, 1);
    t += 9 * .05 + .2;

    pilot(figaro, 'bulb', t); paint(figaro, 'bulb', t, 1);
    k.shot('mid', t, { on: [C, C] });
    k.say(figaro, '✂️ FIGARO !', t + .2, 1.8 * B);

    const LARGO = M('1 3 5 1+ 7 6 5 4 3 2 1'), LARGO_D = [.5, .5, .5, 1, .5, .5, .5, .5, .5, .5, 1];
    const LARGO_REP = M('5 6 7 1+ 2+ 1+ 7 6 5'), LARGO_REP_D = [.5, .5, .5, 1, .5, .5, .5, .5, 1.5];
    const PATTER = M('1 1 1 5 1 1 1 5 1+ 1+ 1+ 5 1+ 1+ 1+ 5 2+ 2+ 2+ 5 1+ 7 6 5');

    for (let b = 0; b < 14; b++) {
      const at = t + b * 2 * B;
      k.note('bass', k.deg('1-'), at, B * .4, { vol: .14 });
      k.note('bass', k.deg('5-'), at + B, B * .4, { vol: .12 });
      k.drum('kick', at, .16); k.drum('hat', at + B * .5, .04);
      k.drum('snare', at + B, .12); k.drum('hat', at + B * 1.5, .04);
    }

    sing('tenor', LARGO, LARGO_D, t, () => figaro, .18);
    for (let r = 1; r <= 3; r++) {
      const at = t + r * 1.2 * B, rc = ring(C, C, r);
      paint(rc, 'gold', at - .01);
      k.note('arp', k.deg('1+'), at, .4 * B, { vol: .04, light: rc });
    }
    t += 6.5 * B;

    k.shot('wide', t);
    const crowd = W.filter((el, i) => i % 2 === 0 && el !== figaro);
    crowd.forEach((el) => pilot(el, 'sand', t));

    for (let m = 0; m < 6; m++) {
      const el = crowd[(m * 7) % crowd.length];
      k.note('arp', k.deg(['1+', '3+', '5+'][m % 3]), t + m * .4 * B, .2, { vol: .025, light: el });
    }

    sing('tenor', LARGO_REP, LARGO_REP_D, t, () => figaro, .17);
    t += 6.0 * B;

    const CUES = [
      ['✂️ BARBER', '✂️ BARBIERE'],
      ['🦱 WIGMAKER', '🦱 PARRUCCHIERE'],
      ['🧪 DOCTOR', '🧪 DOTTORE'],
      ['💌 POSTMAN', '💌 POSTINO'],
    ];
    let prevPos = cell(C, C), cueIdx = 0, pIdx = 0;
    '34 33 23 22! 13 14 15 16 26! 36 46 56 66! 76 75 74 73 62! 63 53 43 44'.split(' ').forEach((tok) => {
      const bump = tok[2] === '!', to = cell(+tok[0], +tok[1]);
      k.hop(prevPos, to, t);
      k.note('arp', PATTER[pIdx++ % PATTER.length] + 12, t, .22 * B, { vol: .08, light: to });
      prevPos = to;
      if (bump) {
        k.pulse(to, t);
        k.drum('hat', t, .14, [to]);
        k.note('tenor', M('1 3 5 1+')[cueIdx % 4], t, .8 * B, { vol: .16, light: to });
        k.say(to, CUES[cueIdx++], t + .05, 1.3 * B);
        t += 1.4 * B;
      } else {
        t += .25 * B;
      }
    });

    // The Wink: Figaro freezes dead centre; the crowd calls him!
    k.shot('close', t, { on: [C, C] });
    k.drum('snare', t, .2, crowd);
    k.note('arp', k.deg('1+'), t, .8 * B, { vol: .08, light: crowd });
    k.say(cell(1, 4), 'FIGARO !', t, 1.2 * B);

    k.note('tenor', k.deg('1'), t + .9 * B, 1.8 * B, { vol: .17, light: figaro });
    k.say(figaro, ['😉 HERE I AM !', '😉 SON QUA !'], t + .9 * B, 1.8 * B);
    t += 3.0 * B;

    pilot([figaro, ...crowd], null, t);
    paint(W, 'night', t, 1);

    // III. UNA VOCE POCO FA (Clear Parlour: Bartolo Guard Left, Rosina Right, Letter Handoff)
    k.act('UNA VOCE POCO FA', t);
    k.bg('night', t);
    paint(W, 'night', t - .01, 1);
    pilot(W, null, t - .01);

    const rCell = cell(6, 4);
    pilot(bartolo, 'fusty', t); paint(bartolo, 'fusty', t, 1);
    pilot(rCell, 'rose', t); paint(rCell, 'rose', t, 1);

    k.shot('mid', t, { on: [4, 4] });

    const VOCE = M('3 4 5 6 5 4 3 2 1 7- 1'), VOCE_D = [.75, .25, .25, .75, .5, .5, .5, .5, .5, .5, 1.5];
    sing('soprano', VOCE, VOCE_D, t, () => rCell);

    for (let b = 0; b < 4; b++) {
      k.note('bass', k.deg('1-'), t + b * 1.5 * B, .5 * B, { vol: .08 });
      k.note('arp', k.deg('3'), t + b * 1.5 * B + .5 * B, .3 * B, { vol: .04 });
    }
    t += 6.5 * B;

    // Rosina shows the secret note
    k.say(rCell, ['💌 A LOVE LETTER', '💌 IL BIGLIETTO'], t, 1.5 * B);
    k.note('soprano', k.deg('3+'), t, .8 * B, { vol: .15, light: rCell });
    t += 1.6 * B;

    // Figaro enters as the courier / postman
    pilot(figaro, 'bulb', t); paint(figaro, 'bulb', t, 1);
    k.say(figaro, ['💌 POSTMAN', '💌 POSTINO'], t, 1.3 * B);
    k.drum('hat', t, .1, [figaro]);
    t += 1.4 * B;

    // Rosina passes note to Figaro
    k.say(rCell, ['💌 FOR LINDORO!', '💌 PER LINDORO!'], t, 1.3 * B);
    k.note('soprano', k.deg('5+'), t, .8 * B, { vol: .16, light: rCell });
    t += 1.4 * B;

    // Figaro confirms
    k.say(figaro, ['🤫 LEAVE IT TO ME!', '🤫 LASCIA FARE!'], t, 1.3 * B);
    t += 1.4 * B;

    // Figaro slips down to Lindoro waiting in the street outside
    pilot(cell(4, 7), 'gold', t); paint(cell(4, 7), 'gold', t, 1);
    k.hop(figaro, cell(4, 6), t);
    strum('1 3 5 1+', t + .4 * B, .12);
    [cell(4, 7), figaro].forEach((el) => pilot(el, null, t + 1.4 * B));
    paint([cell(4, 7), cell(4, 6)], 'night', t + 1.4 * B, 1);
    t += 1.5 * B;

    // Bartolo investigates, Rosina plays innocent
    k.hop(bartolo, cell(4, 4), t);
    k.note('bass', k.deg('1-'), t, B, { vol: .18, light: cell(4, 4) });
    k.say(cell(4, 4), ['🧐 WHO WAS THAT?!', '🧐 CHI ERA?!'], t + .1, 1.3 * B);
    t += 1.5 * B;

    k.note('soprano', k.deg('1+'), t, .8 * B, { vol: .14, light: rCell });
    k.say(rCell, ['😇 NOBODY!', '😇 NESSUNO!'], t + .1, 1.3 * B);
    t += 1.5 * B;

    k.hop(cell(4, 4), bartolo, t);
    k.note('bass', k.deg('5-'), t, B, { vol: .15, light: bartolo });
    t += 1.4 * B;

    // Rosina winks to audience
    k.note('soprano', k.deg('5+'), t, 1.2 * B, { vol: .17, light: rCell });
    k.say(rCell, ['😉 …BUT!', '😉 …MA!'], t + .1, 1.4 * B);
    t += 1.8 * B;

    [rCell, bartolo].forEach((el) => pilot(el, null, t));
    paint([rCell, bartolo], 'night', t, 1);

    // IV. IL SOLDATO (The Sleeping Guard, Tiptoe & Wakeup)
    k.act('IL SOLDATO', t);
    k.shot('mid', t, { on: [4, 4] });

    const guard = cell(4, 4), lover = cell(1, 4), ward = cell(7, 4);
    paint(guard, 'soldier', t - .01, 1); pilot(guard, 'soldier', t);
    paint(ward, 'rose', t - .01, 1); pilot(ward, 'rose', t);

    // Guard is snoring asleep
    k.say(guard, ['💤 SNORE...', '💤 RONF...'], t + .1, 2.2 * B);
    k.pulse(guard, t);
    k.note('bass', k.deg('1-') - 12, t, .8 * B, { vol: .18, light: guard });
    k.drum('hat', t + .7 * B, .06, [guard]);
    k.pulse(guard, t + 1.4 * B);
    k.note('bass', k.deg('1-') - 12, t + 1.4 * B, .8 * B, { vol: .16, light: guard });
    t += 2.8 * B;

    // Almaviva enters and tiptoes past
    pilot(lover, 'gold', t); paint(lover, 'gold', t, 1);
    k.hop(lover, cell(2, 4), t);
    k.note('arp', k.deg('1+'), t, .2 * B, { vol: .08, light: cell(2, 4) });
    k.hop(cell(2, 4), cell(3, 4), t + .6 * B);
    k.note('arp', k.deg('3+'), t + .6 * B, .2 * B, { vol: .08, light: cell(3, 4) });
    t += 1.2 * B;

    // Guard loud snort; Almaviva freezes
    k.note('bass', k.deg('1-') - 5, t, .4 * B, { vol: .2, light: guard });
    k.say(guard, '💤 ZZZ!', t, 1.0 * B);
    t += 1.4 * B;

    // Almaviva slips around guard; clatter!
    k.hop(cell(3, 4), cell(4, 3), t);
    k.hop(cell(4, 3), cell(5, 4), t + .4 * B);
    t += .8 * B;

    k.shake(t, 10, .35);
    k.drum('kick', t, .3, [guard]);
    k.drum('snare', t + .05, .25, [guard]);

    // Guard snaps awake!
    k.pulse(guard, t);
    k.note('tenor', k.deg('5'), t + .1, 1.2 * B, { vol: .18, light: guard });
    k.say(guard, ['🛑 STOP!', '🛑 ALTO!'], t + .1, 1.3 * B);
    t += 1.5 * B;

    // Almaviva grabs Rosina and runs
    k.hop(cell(5, 4), cell(6, 4), t);
    k.say(cell(6, 4), ['🏃 RUN!', '🏃 VIA!'], t + .1, 1.4 * B);
    k.note('tenor', k.deg('1+'), t + .1, B, { vol: .17, light: cell(6, 4) });
    k.note('soprano', k.deg('3+'), t + .1, B, { vol: .17, light: ward });
    t += 2.0 * B;

    const runaway = [guard, cell(6, 4), ward];
    runaway.forEach((el) => pilot(el, null, t));
    paint(runaway, 'night', t, 1);

    // V. LA TEMPESTA (Full Bleed Lightning Flash & Downward Escape)
    k.act('LA TEMPESTA', t);
    k.shot('wide', t);
    k.bg('night', t);
    paint(W, 'night', t - .01, 1);

    const STORM = M('1+ 7 7b 6 6b 5 5b 4 3 2 1');
    for (let loop = 0; loop < 2; loop++) {
      const at0 = t + loop * 4.4 * B;
      STORM.forEach((n, i) => {
        const at = at0 + i * .28 * B;
        const col = (i * 3 + loop * 2 + 1) % 9, row = (i * 2) % 8;
        const rainDrops = [cell(col, row), cell(col, row + 1)].filter(Boolean);
        paint(rainDrops, 'bulb', at - .01);
        k.note('arp', n + 12, at, .22 * B, { vol: .08, light: rainDrops });
        paint(rainDrops, 'night', at + .25 * B);
      });

      [at0 + 2.0 * B, at0 + 2.12 * B].forEach((s, x) => {
        paint(W, 'bulb', s - .01, 1);
        k.drum('snare', s, .45, W); k.drum('kick', s, .35);
        k.shake(s, 8 + x * 6, .25);
        k.note('bass', k.deg(x ? '5-' : '1-'), s, 1.5, { vol: .2 });
        paint(W, 'night', s + .3);
      });
      k.room(700, .72, at0 + 2.0 * B, 2);
    }
    t += 9.2 * B;

    k.shot('mid', t, { on: [4, 4] });
    const baseF = cell(3, 7), baseA = cell(4, 7);
    paint(baseF, 'bulb', t - .01, 1); paint(baseA, 'gold', t - .01, 1);
    pilot(baseF, 'bulb', t); pilot(baseA, 'gold', t);

    k.say(baseA, ['🪜 THE LADDER!', '🪜 LA SCALA!'], t + .1, 1.4 * B);
    t += 1.8 * B;

    M('3+ 1+ 5 3 1').forEach((n, j) => {
      const el = cell(4, j + 2);
      paint(el, 'gold', t + j * .4 * B - .01, 1);
      k.note('arp', n, t + j * .4 * B, .35 * B, { vol: .07, light: el });
    });
    t += 2 * B;

    pilot(rosina, 'rose', t); paint(rosina, 'rose', t, 1);
    k.hop(cell(4, 1), cell(4, 3), t);
    k.hop(cell(4, 3), cell(4, 5), t + .5 * B);
    k.hop(cell(4, 5), cell(5, 7), t + B);
    t += 1.5 * B;

    k.note('soprano', k.deg('1+'), t, 1.2 * B, { vol: .16, light: cell(5, 7) });
    k.note('tenor', k.deg('1'), t, 1.2 * B, { vol: .14, light: baseA });
    paint([2, 3, 4, 5, 6].map((r) => cell(4, r)), 'night', t, 1);

    k.say(baseF, ['🏃 RUN!', '🏃 VIA!'], t + .1, 1.2 * B);
    t += .8 * B;

    k.hop(baseF, cell(1, 7), t);
    k.hop(baseA, cell(2, 7), t + .2 * B);
    k.hop(cell(5, 7), cell(3, 7), t + .4 * B);
    t += 1.8 * B;

    [baseF, baseA, cell(5, 7), rosina].forEach((el) => pilot(el, null, t));
    paint([cell(1, 7), cell(2, 7), cell(3, 7)], 'night', t, 1);

    // VI. FELICITÀ (Cathedral Wedding, Altar Zoom, Heart & Pink Love Wave)
    k.act('FELICITÀ', t);
    k.shot('wide', t);
    k.bg('night', t);
    k.room(3500, .7, t, .5);

    const allPews = W.filter((_, i) => i >= 27 && i < 72 && (i % 9) % 4 !== 0);
    paint(allPews, 'sand', t - .01, 1);
    pilot(allPews, 'sand', t);

    const altarGroom = cell(3, 2), altarBride = cell(5, 2), altarFigaro = cell(4, 1), heart = cell(4, 2);
    paint([altarGroom, heart], 'gold', t - .01, 1);
    paint(altarBride, 'rose', t - .01, 1);
    paint(altarFigaro, 'bulb', t - .01, 1);
    pilot([altarGroom, heart], 'gold', t);
    pilot(altarBride, 'rose', t);
    pilot(altarFigaro, 'bulb', t);

    // Church bells and chatter: establish the wedding
    k.say(altarFigaro, ['💍 THE WEDDING', '💍 LE NOZZE'], t + .2, 1.8 * B);
    for (let c = 0; c < 4; c++) {
      const at = t + c * .45 * B;
      k.note('arp', k.deg(['1+', '3+', '5+', '1+'][c]) + 12, at, .8 * B, { vol: .07 });
      const g = allPews[(c * 5) % allPews.length];
      k.note('arp', k.deg('5+'), at, .25 * B, { vol: .03, light: g });
    }
    t += 2.2 * B;

    // Church doors open at back
    const churchDoors = cell(4, 8);
    paint(churchDoors, 'fusty', t - .01, 1); pilot(churchDoors, 'fusty', t);
    k.note('bass', k.deg('1-'), t, 1.2 * B, { vol: .16, light: churchDoors });
    k.say(churchDoors, 'STOP!', t + .1, 1.2 * B);
    t += 1.4 * B;

    k.say(altarBride, ['💍 MARRIED!', '💍 SPOSI!'], t, 1.4 * B);
    t += 1.4 * B;

    k.say(churchDoors, ['🤷 OH WELL!', '🤷 PAZIENZA!'], t, 1.4 * B);
    t += 1.6 * B;

    // Sweet moment: zoom in on couple at altar
    k.shot('close', t, { on: [4, 2], dur: .4 });
    k.pulse(altarGroom, t); k.pulse(altarBride, t);
    k.say(heart, '❤️', t + .1, 3.5 * B);

    // Musical crescendo with harmonious duet
    const FELICE_D = [.5, .5, .5, 1, .5, .5, 1.5];
    const FELICE1 = M('1 3 5 1+ 5 3 1'), FELICE2 = M('3 5 1+ 3+ 1+ 5 3');
    sing('tenor', FELICE1, FELICE_D, t, () => altarGroom, .18);
    sing('soprano', FELICE2, FELICE_D, t, () => altarBride, .18);

    for (let c = 0; c < 8; c++) {
      k.note('arp', k.deg(['1+', '3+', '5+', '1+'][c % 4]) + 12, t + c * .4 * B, .6 * B, { vol: .06 });
    }
    t += 5.0 * B;

    // Camera pulls wide; love sweeps outward in concentric pink waves
    k.shot('wide', t, { dur: .5 });
    for (let r = 1; r <= 6; r++) {
      const at = t + (r - 1) * .5 * B, ringCells = ring(4, 2, r).filter((el) => el !== altarGroom && el !== altarFigaro);
      paint(ringCells, 'rose', at - .01, 1);
      pilot(ringCells, 'rose', at);
      k.note('arp', k.deg(['1+', '3+', '5+'][r % 3]) + 12, at, .5 * B, { vol: .05, light: ringCells });
    }
    t += 3.5 * B;

    const chordCadence = (at, dur, isLast) => {
      paint(allPews, 'rose', at - .01, 1);
      M('1- 5-').forEach((d) => k.note('bass', d, at, dur, { vol: .15 }));
      M('1 3 5').forEach((d) => k.note('tenor', d, at, dur, { vol: .14, light: [altarGroom, altarBride] }));
      k.note('soprano', k.deg('1+'), at, dur, { vol: .16, light: [altarGroom, altarBride] });
      k.note('arp', k.deg('1+') + 24, at, dur, { vol: .08 });
      k.drum('kick', at, .24); k.drum('snare', at, .2);
      if (isLast) k.say(altarFigaro, ['🎉 HAPPINESS!', '🎉 FELICITÀ!'], at + .1, 2.2);
    };

    [0, 1.5, 3].forEach((off, idx) => chordCadence(t + off * B, idx === 2 ? 4 * B : 1.2 * B, idx === 2));
    t += 7.2 * B;

    pilot(W, null, t);
    paint(W, 'night', t, 1);

    t += 3.5 * B;
    k.end = t;
  },
};
