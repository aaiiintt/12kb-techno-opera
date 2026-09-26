O.opera = {
  title: 'PAGLIACCI', lang: 'it',
  tempo: 96,
  root: 9, mode: 'minor',
  cast: {
    a: { color: '#e8a33d', size: 1.3, voice: 'tenor' },
    b: { color: '#4a7ebf', size: 0.8, voice: 'soprano' },
  },
  motif: ['1 -3 -4 2 1', 'x-x.xx-.'],
  chords: 'i iv v vi',
  room: [700, 0.25],
  intro: 6, outro: 9,
  score: [
    [0, 'appear', 'a', { cell: [4, 4], scale: 1.3 }],
    [0, 'cue', null, { text: 'RIDI!', hold: 1.4 }],
    [0.05, 'roomChange', null, { cutoff: 700, feedback: 0.25, dur: 0.1 }],
    [0.6, 'fillRing', null, { center: [4, 4], ring: 4, color: '#4a4a4a' }],
    [1.4, 'sing', 'a', {}],

    ['1.1', 'freeze', 'a', { dur: 2.4 }],
    ['1.1', 'sing', 'a', { transform: ['frag', 2] }],
    ['1.1', 'arpChorus', null, { numeral: 'i', dur: 1.2, rate: 55 }],
    ['1.1', 'cue', null, { text: 'PAGLIACCIO!', hold: 1.2 }],

    ['2.1', 'pulse', 'a', { beats: 4, amount: 1.15 }],
    ['2.1', 'sing', 'a', { transform: ['frag', 3] }],

    ['3.1', 'enter', 'b', { edge: 'right', to: [7, 1], dur: 0.8 }],
    ['3.1', 'sing', 'b', {}],
    ['3.1', 'cue', null, { text: 'NEDDA.', hold: 1.2 }],

    ['4.1', 'sing', 'a', { transform: 'mi' }],
    ['4.1', 'chord', null, { numeral: 'iv', dur: 2, voice: 'bass' }],

    ['5.1', 'pulse', 'a', { beats: 4, amount: 1.3 }],
    ['5.1', 'chord', null, { numeral: 'v', dur: 2.2, voice: 'tenor' }],

    ['6.1', 'hold', 'a', { dur: 2.2 }],
    ['6.1', 'chord', null, { numeral: 'v', dur: 2.2, voice: 'tenor' }],

    ['7.1', 'chord', null, { numeral: 'vi', dur: 2, voice: 'tenor' }],
    ['7.3', 'silence', null, { dur: 0.4 }],

    ['8.1', 'hold', 'a', { dur: 2.2 }],

    ['9.1', 'shrink', 'a', { to: 0.7, dur: 1.2 }],
    ['9.1', 'flicker', 'a', { beats: 6, amount: 0.3 }],
    ['9.1', 'sing', 'a', { transform: 'dim' }],
    ['9.1', 'cue', null, { text: 'AH!', hold: 1 }],

    ['10.1', 'sing', 'a', { transform: 'dim' }],
    ['10.1', 'crescendo', null, { to: 0.9, dur: 2.2 }],
    ['10.1', 'roomChange', null, { cutoff: 2200, feedback: 0.58, dur: 2.2 }],

    ['11.1', 'sing', 'a', { transform: 'dim' }],
    ['11.1', 'shrink', 'a', { to: 0.5, dur: 1.2 }],

    ['12.1', 'silence', null, { dur: 0.6 }],
    ['12.1', 'freeze', 'a', { dur: 2.2 }],
    ['12.1', 'hold', 'a', { dur: 1.6 }],

    ['13.1', 'split', 'a', { to: [[1, 1], [7, 7]], dur: 1.6 }],
    ['13.1', 'sing', 'a', { transform: 'aug' }],
    ['13.1', 'ascend', null, { gap: 1.5, hue: 30 }],
    ['13.1', 'cue', null, { text: 'FINITA.', hold: 1.8 }],

    ['15.1', 'freeze', 'a', { dur: 0.1 }],

    ['o0', 'shrink', 'a', { to: 0.45, dur: 1.8 }],
    ['o0', 'dim', 'a', { to: 0.4, dur: 1.8 }],
    ['o0', 'chord', null, { numeral: 'i', dur: 3.4, voice: 'bass' }],
    ['o0', 'roomChange', null, { cutoff: 700, feedback: 0.25, dur: 3.6 }],
    ['o0', 'cue', null, { text: 'LA COMMEDIA.', hold: 2.4 }],

    ['o4.2', 'exit', 'b', { edge: 'right', speed: 1 }],
    ['o4.2', 'hold', 'a', { dur: 1.8 }],

    ['o6.5', 'path', 'a', { cells: [[1, 1], [3, 3], [4, 4]], stepDur: 0.7, trail: true }],
    ['o6.5', 'grow', 'a', { to: 1.3, dur: 2.0 }],
  ],
};
