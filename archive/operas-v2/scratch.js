O.opera = {
  title: 'SCRATCH', lang: 'it',
  tempo: 100,
  root: 2, mode: 'phrygian',
  cast: {
    a: { color: '#e63b2e', size: 1.2, voice: 'tenor' },
    b: { color: '#f5a623', size: 1.0, voice: 'soprano' },
  },
  motif: ['5 4 3 2 1', 'x-x.x-x.'],
  chords: 'i iv v i',
  room: [900, 0.45],
  intro: 4, outro: 4,
  score: [
    [0, 'appear', 'a', { cell: [3, 4] }],
    [0, 'cue', null, { text: 'VITA.', hold: 1.2 }],
    [0.2, 'roomChange', null, { cutoff: 900, feedback: 0.45, dur: 0.5 }],
    [1.5, 'enter', 'b', { edge: 'right', to: [5, 4], dur: 0.8 }],
    [2.6, 'freeze', 'a', { dur: 0.6 }],

    ['1.1', 'sing', 'a', {}],
    ['1.1', 'pulse', 'b', { beats: 2, amount: 1.2 }],

    ['2.1', 'sing', 'b', { transform: 'inv' }],
    ['2.1', 'flicker', 'grid', { beats: 2, amount: 0.25 }],
    ['3.1', 'hold', 'b', { dur: 2 }],

    ['3.1', 'chord', null, { numeral: 'i', dur: 1.6 }],
    ['3.1', 'arpChorus', null, { numeral: 'iv', dur: 1.6, rate: 40 }],
    ['3.3', 'approach', 'b', { target: 'a', dur: 0.8 }],

    ['4.1', 'sing', 'a', { transform: ['tr', 5] }],
    ['4.1', 'crescendo', null, { to: 0.95, dur: 2 }],

    ['5.1', 'ritardando', null, { stretch: 1.2, beats: 2 }],
    ['5.1', 'sing', 'b', { transform: [['mi'], ['aug']] }],
    ['5.3', 'rise', 'a', { rows: 2, stepDur: 0.5 }],
    ['6.1', 'hold', 'b', { dur: 2 }],

    ['6.1', 'eclipse', 'b', { target: 'a', dur: 0.6, numeral: 'v' }],
    ['6.1', 'silence', null, { dur: 0.3 }],

    ['7.1', 'grow', 'a', { to: 1.5, dur: 0.8 }],
    ['7.1', 'hold', 'b', { dur: 1.2 }],

    ['8.1', 'roomChange', null, { cutoff: 2600, feedback: 0.55, dur: 1.2 }],
    ['8.1', 'shrink', 'a', { to: 0.3, dur: 1 }],
    ['8.3', 'dissolve', 'b', { dur: 1 }],

    ['9.1', 'ascend', null, {}],

    ['o0', 'cue', null, { text: 'FINE.', hold: 2 }],
    ['o0.5', 'dissolve', 'a', { dur: 1.5 }],
  ],
};
