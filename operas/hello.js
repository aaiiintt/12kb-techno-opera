// HELLO: the kit's own proof-of-life, not art. A gold hero holds the centre
// with a heartbeat, sings a four-note phrase, a mint ring answers around it,
// one cue, and out. ~15s, looping.
O.opera = {
  title: 'HELLO', lang: 'en',
  tempo: 100, root: 0, mode: 'major',
  stage: { grid: 9 },
  // one story-specific light, alongside the built-in eight - any CSS colour.
  lights: { amber: '#ffb347' },

  build(k) {
    const hero = k.at(k.centre, k.centre);
    k.pilot(hero, 'gold');

    // heartbeat: two beats, the hero's own pulse and drum
    k.pulse(hero, 0); k.drum('heartbeat', 0, 0.16, hero);
    k.pulse(hero, 1.2); k.drum('heartbeat', 1.2, 0.16, hero);

    // a four-note phrase on the tenor, lighting the hero note by note
    const phrase = k.motif('1 3 5 8', 'x-x-x-x-');
    k.play('tenor', phrase, 3.0, { beat: 0.6, vol: 0.18, light: hero });

    // a mint arp fills the ring of cells around the hero
    const ring = [];
    for (let dc = -1; dc <= 1; dc++) {
      for (let dr = -1; dr <= 1; dr++) if (dc || dr) ring.push(k.at(k.centre + dc, k.centre + dr));
    }
    k.paint(ring, 'mint');
    k.arp('i', 6.0, 2.0, 14, { cells: ring, fill: 1, vol: 0.09 });

    // the declared light gets a moment: the background cuts to amber for the cue
    k.bg('amber', 8.5);
    k.cue('HELLO', 8.5, 1.5);
    k.bg(null, 10.5);

    k.end = 15;
  },
};
