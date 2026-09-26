O.opera = {
  title: 'THE MAGIC FLUTE', lang: 'de',
  tempo: 120,
  root: 2, mode: 'minor',
  cast: {
    a: { color: '#4b2e91', size: 0.6, voice: 'soprano' },
    b: { color: '#f4c6d0', size: 1.0, voice: 'soprano' },
    c: { color: '#17335c', size: 1.6, voice: 'bass' },
  },
  motif: ['1 1 1 5+ 6+', 'x.x.x.x-'],
  chords: 'viio viio viio III iv vi i',
  room: [3400, 0.25],
  intro: 6, outro: 6,
  score: [
    [0, 'appear', 'a', { cell: [4, 1], scale: 0.6 }],
    [0.3, 'pulse', 'a', { beats: 2, amount: 1.25 }],
    [1.2, 'appear', 'b', { cell: [4, 4], scale: 1.0 }],

    ['1.1', 'sing', 'a', { transform: 'frag', vol: 0.16 }],
    ['1.1', 'flicker', 'a', { beats: 2, amount: 0.25 }],
    ['1.1', 'cue', null, { text: 'DER HÖLLE.', hold: 1.3 }],
    ['1.1', 'chord', 'a', { numeral: 'viio', dur: 0.4, voice: 'tenor' }],
    ['1.2', 'chord', 'a', { numeral: 'viio', dur: 0.4, voice: 'tenor' }],
    ['1.3', 'chord', 'a', { numeral: 'viio', dur: 0.4, voice: 'tenor' }],

    ['2.1', 'sing', 'a', {}],
    ['2.1', 'grow', 'a', { to: 2.6, dur: 1.4 }],
    ['2.1', 'roomChange', null, { cutoff: 3900, feedback: 0.6, dur: 1 }],
    ['2.1', 'chord', 'a', { numeral: 'III', dur: 1.4, voice: 'soprano' }],
    ['2.1', 'cue', null, { text: 'RACHE!', hold: 1.4 }],

    ['3.1', 'exit', 'a', { edge: 'top', speed: 2.4 }],

    ['4.1', 'sing', 'b', { transform: ['tr', -3], vol: 0.13 }],
    ['4.1', 'shrink', 'b', { to: 0.8, dur: 0.8 }],
    ['4.3', 'silence', null, { dur: 0.4 }],

    ['5.1', 'appear', 'c', { cell: [4, 7], scale: 1.0 }],
    ['5.1', 'roomChange', null, { cutoff: 900, feedback: 0.55, dur: 0.1 }],
    ['5.1', 'ritardando', null, { stretch: 1.4, beats: 2 }],
    ['5.1', 'sing', 'c', {}],
    ['5.1', 'chord', 'c', { numeral: 'vi', dur: 1.6, voice: 'bass' }],
    ['5.1', 'rise', 'c', { rows: 3, stepDur: 0.6 }],

    ['7.1', 'grow', 'c', { to: 1.8, dur: 1.2 }],
    ['7.1', 'approach', 'b', { target: 'c', dur: 1.2 }],
    ['7.1', 'crescendo', null, { to: 0.95, dur: 2.4 }],
    ['7.1', 'cue', null, { text: 'WEISHEIT!', hold: 1.6 }],
    ['7.1', 'ascend', null, { numerals: ['iv', 'vi', 'i', 'iv+'], gap: 1.3, hue: 210, hueStep: 6 }],

    ['11.1', 'appear', 'a', { cell: [4, 0], scale: 0.5 }],
    ['11.1', 'flicker', 'a', { beats: 1, amount: 0.4 }],
    ['11.1', 'sing', 'a', { transform: 'frag', vol: 0.07 }],
    ['11.1', 'cue', null, { text: 'HELP!', hold: 1.2 }],
    ['11.3', 'roomChange', null, { cutoff: 2600, feedback: 0.35, dur: 1.5 }],

    ['o0', 'sing', 'a', { transform: 'frag', vol: 0.05 }],
    ['o0', 'roomChange', null, { cutoff: 3400, feedback: 0.25, dur: 2.5 }],
    ['o0.8', 'dissolve', 'c', { dur: 1.5 }],
    ['o0.8', 'dissolve', 'b', { dur: 1.5 }],
    ['o2', 'flicker', 'a', { beats: 1, amount: 0.3 }],
    ['o2', 'drum', null, { pattern: 'heartbeat', vol: 0.08 }],
  ],
};
