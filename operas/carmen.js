/* CARMEN, a dot opera. Beauty pass: readable, not yet golfed.
   Treatment: docs/treatments/carmen.md. The Habanera's chromatic slide is
   the picture: each semitone lights a ring of red spreading out from her. */
O.opera = {
  title: 'CARMEN', lang: 'fr',
  tempo: 72, root: 2, mode: 'minor',            // D minor
  stage: { grid: 9 },
  lights: {
    red: '#d4152f',    // Carmen: her dress, the flower
    blue: '#3d6fe0',   // José: the dragoon's uniform
    gold: '#f4b93a',   // Escamillo: the suit of lights
    sand: '#e8c894',   // Seville: sun on the square, the arena
    green: '#62c43a',  // jealousy, the green-eyed monster: a storytelling colour, José's alone
  },

  build(k) {
    const B = 60 / 72, C = k.centre;             // one beat, the centre cell index
    const T = k.tl;
    const cell = (c, r) => k.at(c, r);
    // paint and pilot at a time on the timeline (the kit's own versions act now)
    // a mass paint never repaints a character; paint them by name when you mean it
    let chars = [];
    const paint = (els, name, t, force) => T.call(() => k.paint(force ? els : [].concat(els).filter((e) => !chars.includes(e)), name), [], t);
    const pilot = (el, name, t) => T.call(() => k.pilot(el, name), [], t);
    // cells whose distance from (cx, cy) rounds to r, reaching the outer grid
    const ring = (cx, cy, r) => {
      const out = [];
      for (let c = cx - r - 1; c <= cx + r + 1; c++)
        for (let w = cy - r - 1; w <= cy + r + 1; w++)
          if (Math.round(Math.hypot(c - cx, w - cy)) === r) out.push(cell(c, w));
      return out.filter(Boolean);
    };

    // The tune. Slide: L'amour est un oiseau rebelle. Answer: que nul ne peut apprivoiser.
    const SLIDE = ['1+', '7#', '7', '6#', '6', '5'].map(k.deg);
    const SLIDE_D = [0.75, 0.25, 0.5, 0.5, 0.75, 1.25];
    const ANSWER = ['5', '4', '5', '6', '5', '4', '3'].map(k.deg);
    const ANSWER_D = [0.5, 0.25, 0.25, 0.5, 0.5, 0.5, 1.5];
    const sing = (voice, notes, durs, t, light, o = {}) => {
      let at = t;
      notes.forEach((n, i) => {
        const d = durs[i] * B * (o.slow || 1);
        k.note(voice, n + (o.up || 0), at, d * 0.95, { vol: o.vol || 0.16, light: light ? light(i) : null });
        at += d;
      });
      return at;
    };
    // Habanera bass: dum . . da-dum dum, one pattern per two beats
    const HAB = [0, 0.75, 1, 1.5];
    const habanera = (t, bars, light, vol = 0.12) => {
      for (let b = 0; b < bars; b++) HAB.forEach((o, i) => {
        const at = t + (b * 2 + o) * B;
        k.note('bass', k.deg(i === 1 ? '5-' : '1-'), at, B * 0.4, { vol, light: light ? light(b, i) : null });
      });
      return t + bars * 2 * B;
    };

    const carmen = cell(C, C);
    const jose = cell(1, 4), esca = cell(7, 4);   // the line-up: José, Carmen, Escamillo
    chars = [carmen];                              // José and Escamillo join when they enter
    const W = k.cells();

    // Carmen's walk through the square, from the crowd's edge to the centre
    const PATH = [[1, 7], [2, 7], [2, 6], [3, 6], [3, 5], [4, 5], [4, 4]];
    const start = cell(...PATH[0]);

    // ---- reset for each loop
    k.paint(W, 'sand');
    k.pilot(jose, null);
    k.pilot(cell(3, 4), null);
    k.pilot(cell(2, 4), null);
    k.pilot(esca, null);
    k.pilot(carmen, null);
    paint(start, 'red', 0, 1);
    pilot(start, 'red', 0);
    k.scale(carmen, 1, 0, 0.01);
    k.room(2400, 0.34, 0, 0.1);
    k.shot('wide', 0);

    // ---- I. Seville. Feeling: she draws every eye. The square is packed and
    // warm and still; only Carmen moves, and the people beside her brighten
    // and swell as she passes, heads turning, a wake of attention. Wide on the
    // crowd, mid as she starts, close following her, wide as she stops dead.
    k.act('SEVILLE', 0);
    let seed = 7;                                  // seeded, so every rebuild is the same crowd
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const CHAT = ['1', '3', '4', '5', '7', '1+', '3+'].map(k.deg);
    const walkStart = 2.5, arrive = walkStart + (PATH.length - 1) * B;
    const onPath = (c, r) => PATH.some(([x, y]) => x === c && y === r);
    // the crowd: about half the square, standing, each one a dim resting light
    const crowd = [];
    for (let c = -9; c <= 17; c++) for (let r = -11; r <= 19; r++) {
      const el = cell(c, r);
      if (el && rnd() < 0.5 && !onPath(c, r) && !(c === C && r === C)) crowd.push({ el, c, r });
    }
    crowd.forEach(({ el }) => { paint(el, 'sand', 0); pilot(el, 'sand', 0); });
    // murmur: each person twinkles now and then on their own little note, in place
    for (let at = 0.1; at < arrive; at += 0.12)     // about 25 murmurs a second, from anyone
      for (let n = 0; n < 3; n++)
        k.note('arp', CHAT[Math.floor(rnd() * CHAT.length)] + 12, at + rnd() * 0.1, 0.1, { vol: 0.012, light: crowd[Math.floor(rnd() * crowd.length)].el });
    habanera(0.3, Math.ceil((arrive + 0.6) / (2 * B)), null, 0.1);
    k.shot('mid', walkStart, { on: PATH[0] });
    PATH.slice(1).forEach(([c, r], i) => {
      const at = walkStart + i * B, from = cell(...PATH[i]), to = cell(c, r);
      paint(to, 'red', at - 0.01, 1);
      k.hop(from, to, at);
      k.note('soprano', k.deg(['5', '4', '3', '2', '3', '5'][i]), at, B * 0.5, { vol: 0.05, light: to });
      if (i >= 1) k.shot('close', at, { on: [c, r], dur: 0.35 });   // close, and the camera walks with her
      // the people beside her turn to look: brighten, swell, settle
      const near = crowd.filter((p) => Math.hypot(p.c - c, p.r - r) < 1.6).map((p) => p.el);
      if (near.length) {
        k.note('arp', k.deg('5+'), at + 0.06, B * 0.7, { vol: 0.045, light: near });
        k.scale(near, 1.18, at + 0.06, 0.18, 'power2.out');
        k.scale(near, 1, at + 0.4, 0.6, 'sine.inOut');
      }
    });
    // what the crowd says, one voice at a time
    const voice = (i, text) => { const [c, r] = PATH[i + 1]; const p = crowd.filter((q) => Math.hypot(q.c - c, q.r - r) < 1.6)[0]; if (p) k.say(p.el, text, walkStart + i * B + 0.1, 1.1); };
    voice(0, 'QUI EST-ELLE ?');
    voice(3, 'OH LÀ LÀ !');
    voice(5, 'CARMEN !');
    // she stops dead; the whole square glows faintly towards her
    k.shot('wide', arrive + 0.2);
    const byRing = {};
    crowd.forEach((p) => { const d = Math.round(Math.hypot(p.c - C, p.r - C)); (byRing[d] = byRing[d] || []).push(p.el); });
    Object.keys(byRing).forEach((d) => k.note('arp', k.deg('1+'), arrive + 0.2 + d * 0.04, 1.4, { vol: 0.02, light: byRing[d] }));
    crowd.forEach(({ el }) => pilot(el, null, arrive + 0.4));
    let t = arrive + 0.6;

    // ---- II. L'amour (6 to 22): each semitone of the slide is a ring of red
    k.act("L'AMOUR", t);
    k.cue("L'AMOUR", t + 0.4, 1.6, carmen);
    for (let p = 0; p < 2; p++) {
      const start = t;
      habanera(start, 4, (b, i) => (i === 0 || i === 3) ? W.filter((_, n) => n % 2 === 0) : null, 0.06);
      let a = start; SLIDE.forEach((_, i) => { paint(ring(C, C, i + 1), 'red', a - 0.01); a += SLIDE_D[i] * B; });
      const slideEnd = sing('soprano', SLIDE, SLIDE_D, start, (i) => [carmen, ...ring(C, C, i + 1)], { vol: 0.17 });
      t = sing('soprano', ANSWER, ANSWER_D, slideEnd, () => [carmen, ...ring(C, C, 1)], { vol: 0.15 });
      t = Math.max(t, start + 8 * B);
    }

    // ---- III. The flower. Feeling: she chooses him. José stands apart in his
    // blue, named so we know him; she throws her flower, it lands on him and
    // stays beside him as one red dot, and his heart beats with it.
    k.act('THE FLOWER', t);
    T.call(() => chars.push(jose), [], t);
    pilot(jose, 'blue', t);
    paint(jose, 'blue', t, 1);
    k.say(jose, 'DON JOSÉ', t + 0.1, 1.6);
    k.note('tenor', k.deg('1'), t, B, { vol: 0.1, light: jose });
    t += 1.5 * B;
    const arc = [[3, 3], [3, 2], [2, 2], [2, 3]];
    arc.forEach(([c, r], i) => {
      const el = cell(c, r);
      paint(el, 'red', t + i * 0.12 - 0.01);
      k.note('arp', k.deg('5+') + i, t + i * 0.12, 0.1, { vol: 0.07, light: el });
    });
    t += arc.length * 0.12;
    const petals = [cell(2, 4)];                     // the flower: one red dot beside him
    paint(petals, 'red', t - 0.01);
    petals.forEach((el) => pilot(el, 'red', t));  // he keeps her flower until she dies
    k.say(petals[0], 'UNE FLEUR !', t + 0.1, 1.4);
   
    for (let h = 0; h < 6; h++) {
      k.drum('heartbeat', t + h * B, 0.14, [jose, ...petals]);
     
    }
    k.note('tenor', k.deg('3'), t, 4 * B, { vol: 0.13, light: jose });
    t += 6 * B;

    // ---- IV. Toréador. Feeling: a star arrives and José is eclipsed. Iain's
    // sketch: José, Carmen, Escamillo in a line, a block of crowd either side.
    // The blocks never change size: dim sand people, and the ones shouting
    // flash. José's side cheers him; a drum roll, and Escamillo sweeps in with
    // grandeur; then his side goes wild and José's falls quiet.
    k.act('TORÉADOR', t);
    T.call(() => chars.push(esca), [], t);
    const block = (c0) => { const o = []; for (let c = c0; c < c0 + 4; c++) for (let r = 0; r <= 8; r++) o.push(cell(c, r)); return o.filter(Boolean); };
    const L = block(-4), R = block(9);
    paint([...L, ...R], 'sand', t - 0.01);
    [...L, ...R].forEach((el) => pilot(el, 'sand', t));
    // n people in a block shout during one beat: high and bright to cheer, low to jeer
    const shout = (m, n, at, cheer) => { for (let j = 0; j < n; j++) k.note('arp', k.deg(cheer ? ['3+', '5+', '1+'][j % 3] : '1-') + (cheer ? 12 : 0), at + rnd() * B, 0.14, { vol: cheer ? 0.025 : 0.03, light: m[Math.floor(rnd() * m.length)] }); };
    // A: José's side cheers him, the other side grumbles
    for (let i = 0; i < 3; i++) { shout(L, 10, t + i * B, 1); shout(R, 2, t + i * B, 0); }
    k.say(L[13], 'BRAVO !', t + 0.5 * B, 1.2);
    k.say(R[22], 'HOU !', t + 1.5 * B, 1.2);
    t += 3 * B;
    // the entrance: the crowd hushes and a drum roll builds. Mid on his side:
    // he walks in through his crowd, the people either side flashing as he
    // passes. Close as he lands, and he announces himself with a fanfare.
    for (let j = 0; j < 12; j++) k.drum('snare', t + j * B / 8, 0.02 + j * 0.008);
    k.shot('mid', t, { on: [10, 4] });
    const walk = [13, 12, 11, 10, 9, 8, 7].map((c) => cell(c, 4));
    const w0 = t + 1.5 * B;
    paint(walk[0], 'gold', w0 - 0.02, 1);
    pilot(walk[0], 'gold', w0 - 0.01);
    walk.slice(1).forEach((to, i) => {
      const at = w0 + (i + 1) * B / 2, from = walk[i], c = 12 - i;
      paint(to, 'gold', at - 0.01, 1);
      k.hop(from, to, at);
      k.note('arp', k.deg(['1', '3', '5', '1+', '3+', '5+'][i]), at, 0.3, { vol: 0.06, light: to });
      const near = [cell(c, 3), cell(c, 5)].filter((el) => R.includes(el));
      if (near.length) k.note('arp', k.deg('5+'), at + 0.05, 0.4, { vol: 0.03, light: near });
      if (R.includes(from)) { paint(from, 'sand', at + 0.42, 1); pilot(from, 'sand', at + 0.45); }
    });
    t = w0 + 3 * B;
    paint(esca, 'gold', t, 1);
    k.shot('close', t, { on: [7, 4] });
    k.drum('snare', t, 0.2, R);
    k.shake(t, 4, 0.25);
    // the fanfare: up the chord and hold the top, the whole of his crowd roaring
    ['5-', '1', '3', '5'].forEach((d, i) => k.note('tenor', k.deg(d), t + i * 0.13, 0.2, { vol: 0.15, light: esca }));
    k.note('tenor', k.deg('1+'), t + 0.52, 1.8 * B, { vol: 0.16, light: esca });
    k.note('bass', k.deg('1-'), t, 2 * B, { vol: 0.14 });
    shout(R, 16, t + 0.5, 1);
    k.say(esca, 'ESCAMILLO !', t + 0.6, 1.8);
    // B: he sings; his side goes wild, José's falls quiet
    const tb = t + 3 * B;
    k.shot('wide', tb);
    const TOR = ['7', '1+', '7', '5', '5', '5', '4', '5', '6', '5'].map(k.deg);   // Toréador, en garde (from memory, relative major)
    const TOR_D = [0.75, 0.25, 0.5, 1, 0.5, 0.25, 0.25, 0.5, 0.5, 1.5];
    sing('tenor', TOR, TOR_D, tb, () => esca, { vol: 0.16 });
    for (let i = 0; i < 6; i++) {
      const at = tb + i * B;
      shout(R, 6 + i * 3, at, 1);
      shout(L, Math.max(0, 5 - i), at, 1);
     
      k.note('bass', k.deg(i % 2 ? '5-' : '1-'), at, B * 0.4, { vol: 0.1 });
    }
    k.say(R[4], 'TORÉADOR !', tb + 3 * B, 1.4);
    // Carmen shines between them: sparks round her on the offbeats
    for (let i = 0; i < 12; i++) k.note('arp', k.deg(['1+', '3+', '5+'][i % 3]), tb + i * B / 2 + B / 4, 0.15, { vol: 0.03, light: ring(C, C, 1)[i * 3 % 8] });
    t = tb + 6 * B;
    [...L, ...R].forEach((el) => pilot(el, null, t));

    // ---- V. Jealousy. Feeling: suffocating; his love turns to possession.
    // Close on José in the dark: his heart races and stumbles, his blue turns
    // green, then her flower. Mid: he sings her Habanera upside down and the
    // green creeps out from him like ink, a cell group per note. Wide: it has
    // boxed her in, a wall between her and the gold. Green is jealousy only.
    k.act('JEALOUSY', t);
    k.room(700, 0.5, t, 6);
    k.shot('close', t, { on: [1, 4] });
    [0, 0.4, 1, 1.3, 1.9, 2.2, 2.6, 2.8].forEach((o) => { k.drum('heartbeat', t + o * B, 0.16, [jose]); });
    // his blue turns green, then her flower beside him
    pilot(jose, 'green', t + 1 * B);
    k.note('tenor', SLIDE[2] - 12, t + 1 * B, 1.2 * B, { vol: 0.12, light: jose });
    paint(petals, 'green', t + 1.9 * B - 0.01, 1);
    k.note('tenor', SLIDE[4] - 12, t + 1.9 * B, 1.2 * B, { vol: 0.1, light: petals });
    k.say(jose, 'ELLE EST À MOI', t + 1.2 * B, 1.8);
    t += 3.2 * B;
    // the ink: the box round her, nearest him first
    const ink = [];
    for (let c = 2; c <= 6; c++) for (let r = 1; r <= 7; r++) if (!(c === C && r === C)) ink.push({ el: cell(c, r), d: Math.hypot(c - 1, r - 4) });
    ink.sort((x, y) => x.d - y.d);
    const inv = k.T.inv()([SLIDE, 'x'.repeat(6)])[0];
    k.shot('mid', t, { on: [3, 4] });
    let at = t;
    inv.forEach((n, i) => {
      const d = SLIDE_D[i] * B * 1.3;
      const g = ink.slice(Math.floor(i * ink.length / 6), Math.floor((i + 1) * ink.length / 6)).map((x) => x.el);
      paint(g, 'green', at - 0.01);
      g.forEach((el) => pilot(el, 'green', at));
      k.note('tenor', n, at, d * 0.95, { vol: 0.16, light: [jose, ...g] });
      k.note('bass', n - 12, at, d, { vol: 0.1 });
      if (i === 4) k.shot('wide', at);
      at += d;
    });
    t = at + B;

    // ---- VI. The knife. Feeling: shock, then pity for her. The crowd is back,
    // cheering the toreador offstage. José, still green, steps to her,
    // pleading; she answers NON and glows towards the gold. Close; the
    // cheering cuts to silence; UN COUTEAU !. The hit: she flashes white and
    // red, white and red. Then, still close,
    // she sings the end of her tune slowly and fades. A red curtain falls and
    // leaves him alone, blue again.
    k.act('THE KNIFE', t);
    ink.forEach(({ el }) => pilot(el, null, t));
    [...L, ...R].forEach((el) => pilot(el, 'sand', t));
    k.shot('mid', t, { on: [3, 4] });
    for (let i = 0; i < 5; i++) { shout(L, 6, t + i * B, 1); shout(R, 8, t + i * B, 1); }
    k.say(R[4], 'TORÉADOR !', t + 0.5 * B, 1.4);
    const jose2 = cell(2, 4), jose3 = cell(3, 4);
    [[jose, jose2], [jose2, jose3]].forEach(([from, to], i) => {
      const at = t + (1 + i * 2) * B;
      paint(to, 'green', at - 0.01, 1);
      k.hop(from, to, at);
      k.note('tenor', k.deg(['3', '2'][i]), at, 1.8 * B, { vol: 0.14, light: to });
    });
    k.say(jose2, "CARMEN, JE T'AIME", t + 1.2 * B, 1.6);
    k.note('soprano', k.deg('5'), t + 3.6 * B, B, { vol: 0.15, light: [carmen, esca] });   // she looks to the gold
    k.say(carmen, 'NON !', t + 3.6 * B, 1.2);
    t += 5 * B;
    // silence, close on the two of them, side by side
    k.shot('close', t, { on: [3.5, 4] });
    k.silence(t, 3 * B);
    k.say(jose3, 'UN COUTEAU !', t + 1.6 * B, 1.3);
    t += 3 * B;
    // the hit: she flashes white and red, white and red, a snare on each white
    k.shake(t, 6, 0.3);
    k.note('soprano', SLIDE[5], t, 2 * B, { vol: 0.14, light: carmen });
    for (let i = 0; i < 4; i++) {
      paint(carmen, 'bulb', t + i * B / 2 - 0.01, 1);
      paint(carmen, 'red', t + i * B / 2 + B / 4, 1);
      k.drum('snare', t + i * B / 2, 0.2 - i * 0.04, [carmen]);
    }
    t += 2 * B;
    // the wink: José realises what he's done. A beat of nothing, then one word
    // and a small falling "uh-oh" in his voice.
    k.say(jose3, 'MERDE !', t + 0.4 * B, 1.4);
    k.note('tenor', k.deg('3'), t + 0.4 * B, 0.3 * B, { vol: 0.12, light: jose3 });
    k.note('tenor', k.deg('1'), t + 0.75 * B, 0.6 * B, { vol: 0.1, light: jose3 });
    t += 1.6 * B;
    // pity: still close, she sings the end of her Habanera, slow and soft, and fades out
    t = sing('soprano', ANSWER, ANSWER_D, t, () => carmen, { vol: 0.09, slow: 1.3 });
    pilot(carmen, null, t - B);
    t += 0.5 * B;
    // the curtain: red falls from above, row by row, to her tune falling, and
    // wipes everything away but him
    k.shot('wide', t);
    sing('soprano', SLIDE, SLIDE_D, t, null, { vol: 0.12 });
    for (let r = -6; r <= 14; r++) {
      const at = t + (r + 6) * 0.13, line = [];
      for (let c = -12; c <= 20; c++) { const el = cell(c, r); if (el && el !== jose3) line.push(el); }
      paint(line, 'red', at - 0.01, 1);
      k.note('arp', k.deg('1') - r, at, 0.5, { vol: 0.012, light: line });
      line.forEach((el) => pilot(el, null, at));
    }
    t += 21 * 0.13 + 0.5;
    // alone, and himself again
    pilot(jose3, 'blue', t);
    k.note('tenor', k.deg('1-'), t, 3 * B, { vol: 0.12, light: jose3 });
    k.say(jose3, 'CARMEN… ADORÉE', t + 0.2, 2.2);
    t += 3.5 * B;

    // ---- VII. Libre. Feeling: grief, then catharsis, how an audience feels
    // as the curtain comes down on Carmen. One red dot rises from where she
    // fell and off the top: she's free. Then a long lament on the fate motif,
    // petals drifting, José glowing alone; two last fortissimo chords light the
    // whole grid red; blackout and silence; only then does the loop begin.
    k.act('LIBRE', t);
    k.cue('CARMEN...', t + 0.3, 2.4, carmen);
    for (let r = 4; r >= -8; r--) {
      const el = cell(C, r), at = t + (4 - r) * 0.16;
      paint(el, 'red', at - 0.01, 1);
      k.note('arp', k.deg('5') + (4 - r), at, 0.4, { vol: 0.05, light: el });
    }
    t += 13 * 0.16 + 0.3;
    // the lament: time to wallow. The fate motif from the prelude, slow and
    // low, over a held D in the bass, in a dark, long room. Petals drift down,
    // slow, a few at a time, and José glows on every note.
    k.room(500, 0.62, t, 2);
    const FATE = ['5', '6', '7#', '1+', '1+', '7', '6', '5'].map(k.deg);   // fate: A Bb C# D, then down (from memory)
    const FATE_D = [1.5, 1.5, 1.5, 2.5, 1.5, 1.5, 1.5, 3.5];
    sing('tenor', FATE, FATE_D, t, () => jose3, { vol: 0.15 });
    sing('soprano', FATE, FATE_D, t + 0.1, null, { up: 12, vol: 0.05 });
    const lament = FATE_D.reduce((x, y) => x + y) * B;
    for (let at = t; at < t + lament; at += 3 * B) k.note('bass', k.deg('1-'), at, 3 * B, { vol: 0.12 });
    let ps = 3;
    const pr = () => (ps = (ps * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 12; i++) {
      const x = -8 + Math.floor(pr() * 25), y = -10 + Math.floor(pr() * 18), at = t + i * lament / 12;
      for (let j = 0; j < 5; j++) {                 // a petal drifting down, slowly
        const el = cell(x + (j % 2), y + j);
        if (!el || el === jose3) continue;
        paint(el, 'red', at + j * 0.4 - 0.01);
        k.note('arp', FATE[(i + j) % 8] + 12, at + j * 0.4, 0.9, { vol: 0.025 - j * 0.004, light: el });
        if (i === 2 && j === 1) k.say(el, 'DES PÉTALES…', at + j * 0.4, 2);
      }
    }
    t += lament;
    // the last chords: fortissimo, the whole grid glows red once, twice, and holds
    const last = (at, dur) => {
      paint(W.filter((el) => el !== jose3), 'red', at - 0.01, 1);
      ['1-', '5-'].forEach((d) => k.note('bass', k.deg(d), at, dur, { vol: 0.1 }));
      ['1', '3', '5'].forEach((d, i) => k.note('tenor', k.deg(d), at, dur, { vol: 0.07, light: i ? null : [jose3, ...W] }));
      k.note('soprano', k.deg('1+'), at, dur, { vol: 0.1 });
    };
    last(t, B);
    last(t + 1.5 * B, 4 * B);
    t += 5.5 * B;
    // blackout: the last chord and the room ring out untouched, then a long
    // silence before the square fills again (no k.silence: it would cut the tail)
    pilot(jose3, null, t);
    t += 2.5 + 3 * B;
    k.scale(jose, 1, t - B, B);
    k.scale(carmen, 1, t - 0.3, 0.3);
    paint(W, 'sand', t - 0.3);
    paint(carmen, 'red', t - 0.3, 1);
    pilot(jose, null, t - 0.3);
    pilot(jose3, null, t - 0.3);
    paint(jose, 'sand', t - 0.3, 1);

    k.end = t;
  },
};
