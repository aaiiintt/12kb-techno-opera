// DON GIOVANNI: the statue that cannot move keeps coming anyway.
O.opera = {
  title: 'DON GIOVANNI', lang: 'it',
  tempo: 60,
  root: 2, mode: 'minor',
  cast: {
    a: { color: '#e63b2e', size: 1.3, voice: 'tenor' },
    b: { color: '#8a8a8a', size: 1, voice: 'bass' },
    c: { color: '#f0d28a', size: 0.7, voice: 'soprano' },
  },
  motif: ['1 1 1 1', 'x---x---'],
  chords: 'i i i i VII',
  room: [700, 0.6],
  intro: 8, outro: 12,
  score: [
    [0, 'appear', 'b', { cell: [8, 4], scale: 1 }],
    [1, 'sing', 'b', { vol: 0.22 }],
    [5, 'sing', 'b', { vol: 0.22 }],

    ['1.1', 'enter', 'a', { edge: 'right', to: [2, 4], dur: 0.6 }],
    ['1.1', 'cue', null, { text: 'VIVA LA LIBERTÀ!', hold: 1.6 }],
    ['1.1', 'roomChange', null, { cutoff: 2600, feedback: 0.35, dur: 0.8 }],
    ['1.1', 'sing', 'a', { transform: [['frag'], ['dim']], vol: 0.2 }],
    ['1.1', 'path', 'a', { cells: [[2, 4], [2, 2], [4, 2], [4, 4]], stepDur: 0.3 }],
    ['1.3', 'sing', 'b', { vol: 0.22 }],

    ['2.1', 'appear', 'c', { cell: [8, 1], scale: 0.7 }],
    ['2.1', 'sing', 'c', { transform: 'aug', vol: 0.18 }],
    ['2.1', 'path', 'a', { cells: [[4, 4], [6, 4], [6, 2]], stepDur: 0.3 }],
    ['2.3', 'sing', 'b', { vol: 0.22 }],

    ['3.1', 'cue', null, { text: 'CHI SIETE?', hold: 1.6 }],
    ['3.1', 'path', 'b', { cells: [[8, 4], [7, 4]], stepDur: 1 }],
    ['3.1', 'sing', 'b', { vol: 0.26 }],
    ['3.1', 'crescendo', null, { to: 0.85, dur: 8 }],
    ['3.3', 'dissolve', 'c', { dur: 1 }],

    ['4.1', 'cue', null, { text: 'RIDI!', hold: 1.4 }],
    ['4.1', 'grow', 'a', { to: 1.6, dur: 0.6 }],
    ['4.1', 'sing', 'a', { transform: 'inv', vol: 0.22 }],

    ['5.1', 'cue', null, { text: 'PENTITI!', hold: 1.8 }],
    ['5.1', 'eclipse', 'b', { target: 'a', dur: 1.2, numeral: 'VII' }],
    ['5.1', 'shrink', 'a', { to: 0, dur: 1.2 }],
    ['5.1', 'roomChange', null, { cutoff: 700, feedback: 0.65, dur: 1.2 }],

    ['6.1', 'hold', 'b', { dur: 4 }],
    ['6.1', 'silence', null, { dur: 0.5 }],

    ['o0', 'silence', null, { dur: 0.8 }],
    ['o2', 'sing', 'b', { vol: 0.12 }],
    ['o2', 'roomChange', null, { cutoff: 700, feedback: 0.6, dur: 1 }],
    ['o3', 'crescendo', null, { to: 0.05, dur: 3 }],
  ],
};
