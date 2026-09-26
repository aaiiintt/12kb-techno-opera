// Phase 2 scratch: exercises every one of the spectacle family's fifteen
// gestures at least once, plus two stage changes and an energy ramp 1->9,
// in a deliberately dramatic order so a human can see them all. Not art.
O.opera = {
  title: 'SCRATCH 3', lang: 'it',
  tempo: 96,
  root: 0, mode: 'phrygian',
  stage: { bg: '#000', grid: 9, dot: 1, gap: 1 },
  cast: {
    a: { color: '#e63b2e', size: 1.2, voice: 'soprano' },
    b: { color: '#f5a623', size: 1.0, voice: 'tenor' },
  },
  motif: ['5 4 3 2 1', 'x-x.x-x.'],
  chords: 'i iv v i',
  room: [900, 0.4],
  intro: 0, outro: 3,
  score: [
    // black field, energy rising
    [0, 'appear', 'a', { cell: [4, 4] }],
    [0, 'appear', 'b', { cell: [2, 6] }],
    [0, 'cue', null, { text: 'SCRATCH 3.', hold: 0.8 }],
    [0, 'energy', null, { level: 1, dur: 0.1 }],
    [0.3, 'energy', null, { level: 9, dur: 6 }],

    // a flood, then shimmer right after it
    [1.2, 'flood', null, { color: '#e63b2e', center: [4, 4], dur: 1.4, bg: false }],
    [2.8, 'shimmer', null, { amount: 0.35, rate: 2.5, hue: 15, dur: 2.2 }],

    // a tide
    [5.2, 'tide', null, { dir: 'down', period: 0.5, repeat: 4, color: '#f5a623' }],

    // a swarm into one dot, then a bloom on that dot
    [7.5, 'swarm', null, { target: 'a', dur: 1.4, spread: 0.3 }],
    [7.5, 'sing', 'a', { transform: 'aug' }],
    [9.2, 'bloom', 'a', { dur: 1.6, hold: 0.8 }],

    // a strobe and a shatter
    [12.0, 'strobe', null, { a: '#fff', b: '#e63b2e', rate: 14, dur: 0.5 }],
    [12.7, 'shatter', null, { center: [4, 4], dur: 0.5 }],

    // a collapse
    [13.5, 'collapse', null, { dur: 1.3, stagger: 0.05 }],

    // a blackout
    [15.1, 'blackout', null, { dur: 0.15, hold: 0.5 }],

    // a titleCard
    [16.0, 'titleCard', null, { text: 'DARK.', size: 42, hold: 1.4, color: '#fff' }],

    // a stage change to a 13 grid of pixels
    [18.0, 'stage', null, { grid: 13, dot: 0.35, gap: 0.6, dur: 1 }],
    [19.3, 'appear', 'b', { cell: [9, 9] }],

    // a wipe
    [19.6, 'wipe', null, { color: '#4fd1c5', from: 'left', dur: 1, bg: true }],

    // a quake with a zoomCrash
    [21.0, 'quake', null, { amount: 10, dur: 0.6 }],
    [21.0, 'zoomCrash', 'b', { zoom: 3, dur: 0.25 }],
    [22.0, 'chord', 'b', { numeral: 'i', dur: 1 }],

    // back to the opening stage
    [23.2, 'stage', null, { bg: '#000', grid: 9, dot: 1, gap: 1, dur: 1.2 }],
    [23.2, 'energy', null, { level: 3, dur: 1.5 }],

    [25.0, 'cue', null, { text: 'SCRATCH 3 END.', hold: 1.4 }],
    [26.6, 'dissolve', 'a', {}],
    [26.6, 'dissolve', 'b', {}],
  ],
};
