O.opera = {
  title: 'TURANDOT', lang: 'it',
  tempo: 66,
  root: 8, mode: 'major',
  cast: {
    a: { color: '#f0c674', size: 0.9, voice: 'tenor' },
    b: { color: '#8fd6ff', size: 1.5, voice: 'soprano' },
    c: { color: '#9a9a9a', size: 0.65, voice: 'soprano' },
  },
  motif: ['1 2 3 4 5 7+', 'x.x.x.x.x...x---'],
  chords: 'i ii iv iv i',
  room: [260, 0.15],
  intro: 6, outro: 8,
  score: [
    [0, 'colourWash', 'grid', { color: '#050505', dur: 0.1 }],
    [0, 'appear', 'a', { cell: [4, 8] }],
    [0.3, 'appear', 'b', { cell: [4, 4] }],
    [0.3, 'dim', 'b', { to: 0.4, dur: 0.1 }],
    [1, 'chord', null, { numeral: 'i', dur: 3.5, voice: 'bass' }],

    ['1.1', 'cue', null, { text: 'NESSUN DORMA.', hold: 2 }],
    ['1.1', 'sing', 'a', {}],

    ['2.1', 'appear', 'c', { cell: [1, 1] }],
    ['2.1', 'flicker', 'c', { beats: 3, amount: 0.4 }],
    ['2.1', 'sing', 'c', { transform: 'frag', vol: 0.07 }],
    ['2.3', 'shrink', 'c', { to: 0.1, dur: 1.5 }],

    ['3.1', 'dissolve', 'c', { dur: 1 }],
    ['3.1', 'cue', null, { text: 'DILEGUA.', hold: 1.8 }],
    ['3.1', 'rise', 'a', { rows: 1, stepDur: 0.9 }],
    ['3.1', 'sing', 'a', {}],
    ['3.1', 'roomChange', null, { cutoff: 700, feedback: 0.22, dur: 3.6 }],

    ['4.1', 'rise', 'a', { rows: 1, stepDur: 0.9 }],
    ['4.1', 'sing', 'a', {}],
    ['4.1', 'roomChange', null, { cutoff: 1100, feedback: 0.28, dur: 3.6 }],

    ['5.1', 'rise', 'a', { rows: 1, stepDur: 0.9 }],
    ['5.1', 'sing', 'a', {}],
    ['5.1', 'roomChange', null, { cutoff: 1500, feedback: 0.34, dur: 3.6 }],

    ['6.1', 'rise', 'a', { rows: 1, stepDur: 0.9 }],
    ['6.1', 'sing', 'a', {}],
    ['6.1', 'roomChange', null, { cutoff: 1900, feedback: 0.4, dur: 3.6 }],
    ['6.1', 'grow', 'a', { to: 1.15, dur: 3 }],

    ['7.1', 'rise', 'a', { rows: 1, stepDur: 0.9 }],
    ['7.1', 'sing', 'a', {}],
    ['7.1', 'chord', null, { numeral: 'ii', dur: 7, voice: 'bass' }],
    ['7.1', 'roomChange', null, { cutoff: 2200, feedback: 0.44, dur: 7 }],
    ['7.1', 'grow', 'a', { to: 1.3, dur: 3 }],

    ['8.1', 'rise', 'a', { rows: 1, stepDur: 0.9 }],
    ['8.1', 'sing', 'a', {}],

    ['9.1', 'silence', null, { dur: 3.6 }],
    ['9.1', 'freeze', 'a', { dur: 3.6 }],

    ['10.1', 'rise', 'a', { rows: 2, stepDur: 0.9 }],
    ['10.1', 'cue', null, { text: 'VINCERÒ!', hold: 2.2 }],
    ['10.1', 'sing', 'a', { transform: 'aug' }],
    ['10.1', 'crescendo', null, { to: 0.95, dur: 6 }],
    ['10.1', 'roomChange', null, { cutoff: 2800, feedback: 0.5, dur: 7 }],

    ['11.1', 'pulse', 'a', { beats: 3, amount: 1.3 }],
    ['11.1', 'chord', null, { numeral: 'iv', dur: 3.6, voice: 'tenor' }],

    ['12.1', 'ascend', null, { numerals: ['ii', 'iv', 'iv+', 'i+'], gap: 0.9, hue: 200, hueStep: 10 }],
    ['12.1', 'hold', 'a', { dur: 3.6 }],

    ['13.1', 'colourWash', 'grid', { color: '#ffffff', dur: 3 }],
    ['13.1', 'approach', 'b', { target: 'a', dur: 3.4 }],
    ['13.1', 'sing', 'b', {}],
    ['13.1', 'chord', null, { numeral: 'iv', dur: 3.6, voice: 'soprano' }],

    ['14.1', 'chord', null, { numeral: 'i', dur: 3.6, voice: 'soprano' }],
    ['14.1', 'dim', 'a', { to: 0.6, dur: 3 }],

    ['15.1', 'hold', 'a', { dur: 3.6 }],
    ['15.1', 'hold', 'b', { dur: 3.6 }],

    ['o0', 'freeze', 'a', { dur: 1.5 }],
    ['o0', 'freeze', 'b', { dur: 1.5 }],
    ['o1.5', 'colourWash', 'grid', { color: '#050505', dur: 3 }],
    ['o1.5', 'roomChange', null, { cutoff: 260, feedback: 0.15, dur: 3.5 }],
    ['o2.5', 'dissolve', 'a', { dur: 2 }],
    ['o2.7', 'dissolve', 'b', { dur: 2 }],
  ],
};
