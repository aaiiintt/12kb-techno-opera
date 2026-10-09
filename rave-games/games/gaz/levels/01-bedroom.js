/* 1 · Laindon Bedroom. The Ordinary World.
   Top-down. His room on the left, the landing across the middle, the stairs at the right.
   Mum crosses the landing between her room (bottom) and the bathroom (top) with a tea.
   Get to the stairs without being on the landing while she is. Her door creaks a beat
   before she comes out. Lines from docs/DESIGN.html, verbatim. */

'use strict';

GAZ.level({
  id: 'bedroom', title: 'LAINDON BEDROOM',
  open: 'SATURDAY, 7PM. MUM THINKS HE IS STAYING IN.',
  init(m) {
    m.gx = 30; m.gy = 44; m.facing = 1;
    // the room: x 0..116, its door in the right wall at y 48..84; the landing 122..228; the stairs from 228
    m.walls = [[0, 136, 256, 8], [0, 0, 256, 6], [0, 0, 6, 144], [116, 84, 8, 60], [116, 0, 8, 48], [8, 96, 56, 36] /* bed */, [70, 110, 22, 26] /* tape deck */];
    m.goal = [232, 20, 24, 100];
    // Mum: y runs from her door (bottom, y 8) to the bathroom (top, y 112); she waits in each
    if (m.mum == null) { m.mum = { y: 112, dir: -1, wait: 2.6, creaked: false }; }
    else { m.mum.wait = Math.max(m.mum.wait, 1.2); }
  },
  update(m) {
    const mum = m.mum, dt = timeDelta;
    mum.vis = mum.wait <= 0;
    if (mum.wait > 0) {
      mum.wait -= dt;
      if (mum.wait < 0.6 && !mum.creaked) { mum.creaked = true; S.drum('hat', S.now(), 0.12); S.voice('pulse', S.deg('2') + 12, S.now(), 0.08, { vol: 0.04, slide: -3 }); mum.creakAt = m.t; }
      if (mum.wait <= 0) mum.creaked = false;
    } else {
      mum.y += mum.dir * 38 * dt;
      if (mum.y <= 8 || mum.y >= 112) { mum.y = clamp(mum.y, 8, 112); mum.dir *= -1; mum.wait = 3.2; }
    }
    if (mum.creakAt != null && m.t - mum.creakAt < 0.7) m.say('CREAK', 176, mum.dir < 0 ? 128 : 14);
    // she sees him anywhere on the landing while she is on it
    const box = GAZ.gazBox();
    if (mum.vis && box[0] + box[2] > 124 && box[0] < 228) return 'GAZ?';
  },
  render(m) {
    GAZ.rect(0, 0, 256, 144, '#2c3e78');                      // the carpet
    GAZ.rect(6, 6, 110, 130, '#8fa6e0', 0.35);                  // his room, lit cooler
    GAZ.rect(124, 6, 104, 130, '#7a5230');                      // the landing carpet
    GAZ.rect(124, 6, 104, 130, '#f3d27a', 0.12);                // the landing light
    GAZ.rect(228, 6, 28, 130, '#1a1020');                       // the stairwell
    for (let i = 0; i < 6; i++) GAZ.rect(232, 110 - i * 18, 22, 3, '#7a5230');   // the stairs
    GAZ.rect(8, 96, 56, 36, '#3d5fa8'); GAZ.rect(10, 120, 20, 10, '#f4f0e6');     // the bed, a pillow
    GAZ.rect(70, 110, 22, 26, '#1a1a1a'); GAZ.rect(74, 126, 14, 4, '#9cff3a');     // the tape deck
    GAZ.rect(14, 60, 30, 20, '#d8588f'); GAZ.rect(50, 64, 20, 14, '#9cff3a');       // posters
    for (const w of [[116, 84, 8, 60], [116, 0, 8, 48]]) GAZ.rect(...w, '#f3d27a', 0.5);  // the door frame
    // Mum's door (bottom) and the bathroom (top)
    GAZ.rect(166, 6, 22, 8, '#4a2a1a'); GAZ.rect(166, 130, 22, 8, '#4a2a1a');
    const mum = m.mum;
    if (mum && mum.vis) PEOPLE.draw(PEOPLE.cast.mum, 166, mum.y, { walking: true, flip: mum.dir < 0 });
  },
  end: {
    seconds: 4, line: 'HE SHUTS THE DOOR QUIETLY. TOO QUIETLY.',
    update(m) { if (m.t < 1.2) { m.gx += 0; m.gy = Math.max(10, m.gy - 30 * timeDelta); } if (m.t > 2 && !m.click) { m.click = 1; S.drum('hat', S.now(), 0.2); } },
    render(m) { if (m.t < 1.2) GAZ.drawGaz(m.gx, m.gy); },
  },
  // S'Express manner: 118 bpm, a bouncing octave bass, piano stabs on the offbeats, claps on 2 and 4, a bright riff
  music: { loop: {
    bpm: 118, key: [0, 'minor'],
    parts: {
      bass: [['1-', '.', '1', '.', '1-', '.', '1', '.', '1-', '.', '1', '.', '6b-', '.', '7b-', '.']],
      stab: [['.', '.', '1', '.', '.', '.', '3', '.', '.', '.', '1', '.', '.', '.', '5', '.'], ['.', '.', '6b', '.', '.', '.', '1+', '.', '.', '.', '7b', '.', '.', '.', '2+', '.']],
      lead: [['1+', '.', '.', '3+', '.', '.', '5+', '.', '.', '.', '3+', '.', '1+', '.', '.', '.'], ['.', '.', '.', '.', '.', '.', '.', '.', '7', '.', '1+', '.', '.', '.', '.', '.']],
    },
    drums: { k: ['x...x...x...x...'], c: ['....x.......x...'], h: ['..x...x...x...x.'], o: ['......x.......x.'] },
    vol: { lead: 0.05, stab: 0.07 },
  } },
  bot(m) {
    const mum = m.mum, box = GAZ.gazBox();
    // walk to the door first, then wait until she has just gone in, then go
    if (box[0] + box[2] < 112) return [1, m.gy < 58 ? 1 : m.gy > 66 ? -1 : 0];
    if (mum.wait > 2.6) return [1, 0];
    if (box[0] > 124) return [1, 0];
    return null;
  },
});
