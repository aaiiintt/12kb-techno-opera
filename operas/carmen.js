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
    chars = [carmen, jose, esca];
    const W = k.cells();

    // Carmen's walk through the square, from the crowd's edge to the centre
    const PATH = [[1, 7], [2, 7], [2, 6], [3, 6], [3, 5], [4, 5], [4, 4]];
    const start = cell(...PATH[0]);

    // ---- reset for each loop
    k.paint(W, 'sand');
    k.pilot(jose, null);
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
    k.cue("L'AMOUR", t + 0.4, 1.6);
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
    // the entrance: the crowd hushes, a drum roll, gold sweeps in from the far edge and lands
    for (let j = 0; j < 12; j++) k.drum('snare', t + j * B / 8, 0.02 + j * 0.008);
    const sweep = []; for (let c = 16; c >= 7; c--) sweep.push(cell(c, 4));
    sweep.filter(Boolean).forEach((el, j) => {
      paint(el, 'gold', t + 1.5 * B + j * 0.05 - 0.01);
      k.note('arp', k.deg('1+') + j, t + 1.5 * B + j * 0.05, 0.25, { vol: 0.06, light: el });
    });
    t += 1.5 * B + sweep.length * 0.05;
    pilot(esca, 'gold', t);
    paint(esca, 'gold', t, 1);
    k.drum('snare', t, 0.2, R);
    k.note('bass', k.deg('3-'), t, 2 * B, { vol: 0.14 });
    k.shake(t, 4, 0.25);
    k.shot('close', t, { on: [7, 4] });
    k.cue('TORÉADOR!', t + 0.1, 1.6);
    k.say(esca, 'ESCAMILLO', t + 0.2, 1.4);
    // B: he sings; his side goes wild, José's falls quiet
    const tb = t + B;
    k.shot('wide', tb + B);
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
    // Close on José in the dark: his heart races and stumbles, and her flower
    // turns from red to blue. Mid: he sings her Habanera
    // upside down and his blue creeps out from him like ink, a cell group per
    // note. Wide: it has boxed her in, a wall between her and the gold.
    k.act('JEALOUSY', t);
    k.room(700, 0.5, t, 6);
    k.shot('close', t, { on: [1, 4] });
    [0, 0.4, 1, 1.3, 1.9, 2.2, 2.6, 2.8].forEach((o) => { k.drum('heartbeat', t + o * B, 0.16, [jose]); });
    petals.forEach((el, i) => {
      const at = t + (0.4 + i * 0.7) * B;
      paint(el, 'blue', at - 0.01);
      k.note('tenor', SLIDE[i + 2] - 12, at, 0.6 * B, { vol: 0.1, light: el });
    });
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
      paint(g, 'blue', at - 0.01);
      g.forEach((el) => pilot(el, 'blue', at));
      k.note('tenor', n, at, d * 0.95, { vol: 0.16, light: [jose, ...g] });
      k.note('bass', n - 12, at, d, { vol: 0.1 });
      if (i === 4) k.shot('wide', at);
      at += d;
    });
    t = at + B;

    // ---- VI. The knife (46 to 50): a bar of dark, one beat of the arena, she burns out
    k.act('THE KNIFE', t);
    k.silence(t, 2 * B);
    t += 2 * B;
    k.bg('sand', t);
    ink.forEach(({ el }) => pilot(el, null, t));
    k.drum('snare', t, 0.2, W);
    k.bg(null, t + B * 0.5);
    k.shake(t, 6, 0.3);
    t += B;
    const back = SLIDE.slice().reverse();
    back.forEach((n, i) => {
      const r = ring(C, C, 6 - i);
      paint(r, 'red', t + i * B - 0.01);
      k.note('soprano', n, t + i * B, B * 0.9, { vol: 0.12, light: [carmen, ...r] });
    });
    t += back.length * B;
    k.scale(carmen, 0, t - 2 * B, 2 * B, 'power2.in');

    // ---- VII. Libre: rose petals fall all over the grid; the music box plays the slide once more
    k.act('LIBRE', t);
    petals.forEach((el) => pilot(el, null, t));
    k.cue('CARMEN...', t + 0.3, 2.4);
    // petals falling everywhere, over the whole grid, not just the stage
    let ps = 3;
    const pr = () => (ps = (ps * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 18; i++) {
      const x = -8 + Math.floor(pr() * 25), y = -10 + Math.floor(pr() * 22), at = t + i * B * 0.3;
      for (let j = 0; j < 4; j++) {                 // a petal drifting down: four cells, one after another
        const el = cell(x + (j % 2), y + j);
        if (!el) continue;
        paint(el, 'red', at + j * 0.22 - 0.01);
        k.note('arp', SLIDE[i % 6] + 12, at + j * 0.22, B * 0.5, { vol: 0.05 - j * 0.01, light: el });
        if (i === 2 && j === 1) k.say(el, 'DES PÉTALES…', at + j * 0.22, 1.6);
      }
    }
    k.note('tenor', k.deg('1'), t, 5 * B, { vol: 0.1, light: jose });
    t += 6 * B;
    k.scale(jose, 1, t - B, B);
    k.scale(carmen, 1, t - 0.3, 0.3);
    paint(W, 'sand', t - 0.3);
    paint(carmen, 'red', t - 0.3, 1);
    pilot(jose, null, t - 0.3);
    paint(jose, 'sand', t - 0.3, 1);

    k.end = t;
  },
};
