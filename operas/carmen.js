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
    const col = (c, from = -12, to = 20) => { const o = []; for (let r = from; r <= to; r++) o.push(cell(c, r)); return o.filter(Boolean); };
    const row = (r, from = -20, to = 28) => { const o = []; for (let c = from; c <= to; c++) o.push(cell(c, r)); return o.filter(Boolean); };

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
    const jose = cell(8, 6);
    chars = [carmen, jose];
    const W = k.cells();

    // ---- reset for each loop
    k.paint(W, 'sand');
    k.pilot(jose, null);
    k.paint(carmen, 'red');
    k.pilot(carmen, 'red');
    k.scale(carmen, 1, 0, 0.01);
    k.room(2400, 0.34, 0, 0.1);

    // ---- I. Seville (0 to 6): the square breathes on the habanera bass, a column per beat
    let t = 0.3;
    t = habanera(t, 3, (b, i) => col(-6 + b * 8 + i * 2), 0.1);

    // ---- II. L'amour (6 to 22): each semitone of the slide is a ring of red
    k.cue("L'AMOUR", t + 0.4, 1.6);
    for (let p = 0; p < 2; p++) {
      const start = t;
      habanera(start, 4, (b, i) => (i === 0 || i === 3) ? W.filter((_, n) => n % 2 === 0) : null, 0.06);
      let a = start; SLIDE.forEach((_, i) => { paint(ring(C, C, i + 1), 'red', a - 0.01); a += SLIDE_D[i] * B; });
      const slideEnd = sing('soprano', SLIDE, SLIDE_D, start, (i) => [carmen, ...ring(C, C, i + 1)], { vol: 0.17 });
      t = sing('soprano', ANSWER, ANSWER_D, slideEnd, () => [carmen, ...ring(C, C, 1)], { vol: 0.15 });
      t = Math.max(t, start + 8 * B);
    }

    // ---- III. The flower (22 to 30): a red spark arcs to José, whose blue heart starts beating
    const arc = [[5, 3], [6, 2], [7, 2], [8, 3], [9, 4], [9, 5], [8, 6]];
    arc.forEach(([c, r], i) => {
      const el = cell(c, r);
      paint(el, 'red', t + i * 0.12 - 0.01);
      k.note('arp', k.deg('5+') + i, t + i * 0.12, 0.1, { vol: 0.07, light: el });
    });
    t += arc.length * 0.12 + 0.2;
    pilot(jose, 'blue', t);
    k.pulse(jose, t);
    const joseHalo = ring(8, 6, 1);
    paint(joseHalo, 'blue', t);
    for (let h = 0; h < 6; h++) {
      k.drum('heartbeat', t + h * B, 0.14, [jose, ...joseHalo]);
      k.pulse(jose, t + h * B);
    }
    k.note('tenor', k.deg('3'), t, 4 * B, { vol: 0.13, light: jose });
    t += 6 * B;

    // ---- IV. Toréador (30 to 38): a gold comet races the stage's edge, sparkling
    k.cue('TORÉADOR!', t + 0.2, 1.4);
    const edge = [];
    for (let c = 0; c < 9; c++) edge.push([c, 0]);
    for (let r = 1; r < 9; r++) edge.push([8, r]);
    for (let c = 7; c >= 0; c--) edge.push([c, 8]);
    for (let r = 7; r > 0; r--) edge.push([0, r]);
    const edgeEls = edge.map(([c, r]) => cell(c, r));
    paint(edgeEls, 'gold', t);
    const lap = 8 * B, step = lap / edgeEls.length;
    edgeEls.forEach((el, i) => {
      const at = t + i * step;
      k.note('arp', k.deg(['1+', '3+', '5+'][i % 3]), at, step * 6, { vol: 0.09, light: el });
      if (i % 2 === 0) {                          // sparkles: the suit of lights
        const [c, r] = edge[i], s = cell(c + (r === 0 ? 0 : c === 8 ? 1 : -1), r + (r === 0 ? -1 : r === 8 ? 1 : 0));
        if (s) { paint(s, 'gold', at); k.drum('hat', at + step, 0.05, [s]); }
      }
    });
    sing('tenor', SLIDE, SLIDE_D, t, null, { up: 12, vol: 0.12 });
    habanera(t, 4, (b, i) => { if (!(i % 2)) return null; const r = row(b * 2 + 1); paint(r, 'sand', t + (b * 2 + HAB[i]) * B - 0.01); return r; }, 0.05);
    k.scale(jose, 0.7, t, lap);
    t += lap;

    // ---- V. Jealousy (38 to 46): José sings her tune back, inverted, minor; his blue walls in
    k.room(700, 0.5, t, 6);
    const inv = k.T.inv()([SLIDE, 'x'.repeat(6)])[0];
    let at = t;
    inv.forEach((n, i) => {
      const d = SLIDE_D[i] * B * 1.3;
      const wall = col(8 - i, -2, 10);
      paint(wall, 'blue', at - 0.01);
      k.note('tenor', n, at, d * 0.95, { vol: 0.16, light: [jose, ...wall] });
      k.note('bass', n - 12, at, d, { vol: 0.1 });
      at += d;
    });
    t = at + 0.3;

    // ---- VI. The knife (46 to 50): a bar of dark, one beat of the arena, she burns out
    k.silence(t, 2 * B);
    t += 2 * B;
    k.bg('sand', t);
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

    // ---- VII. Libre (50 to 58): her embers rise off the top; the music box plays the slide once more
    k.cue('CARMEN...', t + 0.3, 2.4);
    SLIDE.forEach((n, i) => {
      const x = C + [0, -2, 2, -1, 1, 0][i], at = t + i * B * 0.75;
      for (let j = 0; j < 4; j++) {                 // a petal drifting up: four cells, one after another
        const el = cell(x + (j % 2), C - 1 - i - j * 2);
        if (!el) continue;
        paint(el, 'red', at + j * 0.18 - 0.01);
        k.note('arp', n + 12, at + j * 0.18, B * 0.5, { vol: 0.06 - j * 0.01, light: el });
      }
    });
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
