O.opera = {
  title: 'RIGOLETTO', lang: 'it',
  tempo: 108,
  root: 7, mode: 'major',
  cast: {
    a: { color: '#d9b23c', size: 1.6, voice: 'tenor' },
    b: { color: '#8a8a8a', size: 1.0, voice: 'bass' },
    c: { color: '#ffffff', size: 0.6, voice: 'soprano' },
  },
  motif: ['1 4 3 2 1', 'x.xx.x.x'],
  chords: 'i v i v vi',
  room: [3200, 0.15],
  intro: 5, outro: 6,
  score: [
    [0, 'enter', 'a', { edge: 'left', to: [2, 4], dur: 0.6 }],
    [0, 'roomChange', null, { cutoff: 3200, feedback: 0.15, dur: 0.5 }],
    [0.8, 'orbit', 'a', { center: [4, 4], radius: 1.5, turns: 1 }],
    [1.2, 'appear', 'b', { cell: [4, 4], scale: 1 }],
    [1.6, 'freeze', 'b', { dur: 2.4 }],

    ['1.1', 'orbit', 'a', { center: [4, 4], radius: 1.5, turns: 1 }],
    ['1.1', 'sing', 'a', {}],
    ['1.1', 'cue', null, { text: 'LA DONNA.', hold: 1.4 }],

    ['2.1', 'chord', null, { numeral: 'i', dur: 1, voice: 'bass' }],
    ['2.1', 'cue', null, { text: 'MOBILE!', hold: 1.2 }],
    ['2.3', 'arpChorus', null, { numeral: 'v', dur: 1, rate: 45 }],

    ['3.1', 'enter', 'c', { edge: 'right', to: [6, 4], dur: 0.6 }],
    ['3.1', 'grow', 'b', { to: 1.3, dur: 0.6 }],
    ['3.1', 'sing', 'b', {}],
    ['3.1', 'cue', null, { text: 'MALEDIZIONE.', hold: 1.4 }],

    ['4.1', 'orbit', 'a', { center: [6, 4], radius: 1, turns: 1 }],
    ['4.1', 'sing', 'c', { transform: 'inv' }],
    ['4.3', 'silence', null, { dur: 0.3 }],

    ['5.1', 'shrink', 'b', { to: 0.5, dur: 1.2 }],
    ['5.1', 'chord', null, { numeral: 'v', dur: 2, voice: 'bass' }],
    ['5.1', 'crescendo', null, { to: 0.95, dur: 2 }],
    ['5.1', 'ritardando', null, { stretch: 1.15, beats: 1 }],
    ['5.1', 'cue', null, { text: 'VENDETTA!', hold: 1.4 }],

    ['6.1', 'reveal', 'c', { to: [4, 4], dur: 0.3, color: '#fff' }],
    ['6.1', 'chord', null, { numeral: 'vi', dur: 1.5, voice: 'bass' }],
    ['6.1', 'sing', 'b', { transform: 'retro' }],
    ['6.1', 'cue', null, { text: 'GILDA!', hold: 1.4 }],

    ['7.1', 'shrink', 'b', { to: 0.25, dur: 1 }],
    ['7.1', 'approach', 'b', { target: 'c', dur: 0.8 }],
    ['7.1', 'hold', 'b', { dur: 3 }],
    ['7.1', 'roomChange', null, { cutoff: 400, feedback: 0.7, dur: 1.5 }],

    ['o0', 'colourWash', 'grid', { color: '#000', dur: 2 }],
    ['o0.2', 'dissolve', 'b', { dur: 1 }],
    ['o0.2', 'dissolve', 'c', { dur: 1 }],
    ['o2.5', 'enter', 'a', { edge: 'left', to: [2, 4], dur: 0.6 }],
    ['o2.5', 'roomChange', null, { cutoff: 3200, feedback: 0.15, dur: 1 }],
    ['o3.2', 'orbit', 'a', { center: [4, 4], radius: 1.5, turns: 1 }],
  ],
};
