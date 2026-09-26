// Demo score for the rebuilt lighting law: a hero (gold, tenor) and a
// beloved (sakura, soprano) on the house-default 9x9 grid. Every beat here
// is one of the kept gestures - nothing outside the vocabulary.
O.opera = {
  title: 'LIGHTS', lang: 'en',
  tempo: 100,
  root: 0, mode: 'major',
  stage: { grid: 9, dot: 1, gap: 1 },
  cast: {
    hero: { color: 'gold', voice: 'tenor' },
    beloved: { color: 'sakura', voice: 'soprano' },
  },
  motif: ['1 3 5 8 5 3 1 0', 'x-x-x-x-'],
  room: [1800, 0.45],
  score: [
    // intro in dusk: the hero's heartbeat, nothing else lit
    [0, 'cue', null, { text: 'NOTTURNO', hold: 1.2 }],
    [0, 'pulse', 'hero', { beats: 4 }],

    // the hero hops across four cells, each hop a pluck lighting it
    [2.6, 'hop', 'hero', { to: [3, 4], dur: 0.35, semi: 0 }],
    [3.0, 'hop', 'hero', { to: [4, 4], dur: 0.35, semi: 4 }],
    [3.4, 'hop', 'hero', { to: [5, 4], dur: 0.35, semi: 7 }],
    [3.8, 'hop', 'hero', { to: [6, 4], dur: 0.35, semi: 12 }],

    // the hero sings the motif; its disc follows every note
    [4.3, 'sing', 'hero', {}],

    // a chord arp in mint lights a ring of cells, note by note
    [6.9, 'arp', null, { numeral: 'i', dur: 2.2, rate: 14, light: 'mint',
      cells: [[3, 3], [4, 3], [5, 3], [5, 4], [5, 5], [4, 5], [3, 5], [3, 4]] }],

    // the beloved answers on soprano, her disc following her
    [9.3, 'sing', 'beloved', {}],

    // one bar of silence: everything dusk
    [11.9, 'silence', null, { dur: 2.4 }],

    // close on the hero for its long held note - vibrato visible in the light
    [14.3, 'closeUp', 'hero', { dur: 0.12 }],
    [14.42, 'hold', 'hero', { dur: 6.5, vol: 0.17 }],
    [21.42, 'snapBack', null, { dur: 0.12 }],

    // one cue, and out
    [21.7, 'cue', null, { text: 'ADDIO', hold: 2 }],
  ],
};
