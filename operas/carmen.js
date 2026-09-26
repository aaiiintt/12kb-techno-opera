O.opera = {
  title: 'CARMEN', lang: 'fr',
  tempo: 72,
  root: 2, mode: 'phrygian',
  cast: {
    a: { color: '#e63b2e', size: 1.3, voice: 'soprano' },
    b: { color: '#f5a623', size: 1.0, voice: 'tenor' },
  },
  motif: ['5 4 3 2 1', 'x-x.x-x.'],
  chords: 'i iv v i',
  room: [2600, 0.35],
  intro: 6, outro: 6,
  score: [
    // intro — the plaza, wide open
    [0, 'appear', 'b', { cell: [4, 4] }],
    [0, 'appear', 'a', { cell: [1, 4] }],
    [0, 'cue', null, { text: "L'AMOUR.", hold: 1.6 }],
    [0.2, 'orbit', 'a', { center: [4, 4], radius: 2, turns: 1 }],
    [0.4, 'sing', 'a', {}],
    [3.6, 'freeze', 'b', { dur: 2.2 }],

    // build — chorus rings, canon a beat behind
    ['1.1', 'cue', null, { text: 'TORÉADOR!', hold: 1.4 }],
    ['1.1', 'fillRing', null, { center: [4, 4], ring: 2, color: '#f5a623' }],
    ['1.1', 'arpChorus', null, { numeral: 'i', dur: 2.6, rate: 42 }],
    ['1.1', 'sing', 'a', {}],
    ['1.2', 'sing', 'b', {}],
    ['2.1', 'sing', 'a', {}],
    ['2.2', 'sing', 'b', {}],
    ['2.1', 'crescendo', null, { to: 0.55, dur: 2.6 }],
    ['3.1', 'sing', 'a', {}],
    ['3.2', 'sing', 'b', {}],

    // circle — change voice: José takes her motif, room narrows, he shrinks
    ['4.1', 'cue', null, { text: "JE T'AIME.", hold: 1.4 }],
    ['4.1', 'roomChange', null, { cutoff: 1400, feedback: 0.5, dur: 2.6 }],
    ['4.1', 'sing', 'b', {}],
    ['4.1', 'shrink', 'b', { to: 0.8, dur: 2.6 }],
    ['5.1', 'orbit', 'a', { center: [4, 4], radius: 1.2, turns: 1 }],
    ['5.1', 'closeIn', null, { center: [4, 4], dur: 2.6 }],
    ['5.1', 'sing', 'a', {}],
    ['6.1', 'sing', 'b', {}],
    ['6.1', 'shrink', 'b', { to: 0.6, dur: 2.6 }],

    // close — planing chord slides down, feedback climbs, crescendo
    ['7.1', 'cue', null, { text: 'LIBRE.', hold: 1.4 }],
    ['7.1', 'chord', null, { numeral: 'v', dur: 1.6, voice: 'bass' }],
    ['7.1', 'crescendo', null, { to: 0.95, dur: 3.2 }],
    ['7.1', 'roomChange', null, { cutoff: 1000, feedback: 0.65, dur: 3.2 }],
    ['7.1', 'sing', 'a', {}],
    ['7.3', 'chord', null, { numeral: 'iv', dur: 1.6, voice: 'bass' }],
    ['8.1', 'chord', null, { numeral: 'i', dur: 1.6, voice: 'bass' }],
    ['8.1', 'sing', 'b', {}],
    ['8.1', 'orbit', 'a', { center: [4, 4], radius: 0.7, turns: 1 }],
    ['9.1', 'fillRing', null, { center: [4, 4], ring: 1, color: '#e63b2e' }],
    ['9.1', 'sing', 'a', {}],

    // one full bar of silence — the ring freezes
    ['10.1', 'freeze', 'a', { dur: 3.3 }],
    ['10.1', 'freeze', 'b', { dur: 3.3 }],
    ['10.1', 'silence', null, { dur: 3.3 }],

    // the orbit snaps shut — retrograde, augmented, unresolved
    ['11.1', 'cue', null, { text: 'ADIEU.', hold: 1.6 }],
    ['11.1', 'eclipse', 'a', { target: 'b', dur: 1.2, numeral: 'v' }],
    ['11.1', 'chord', null, { numeral: 'v', dur: 3.2, voice: 'bass' }],
    ['11.1', 'sing', 'a', { transform: 'retro' }],
    ['11.3', 'sing', 'a', { transform: [['retro'], ['frag'], ['aug']] }],

    // José alone, the pedal holds
    ['12.1', 'cue', null, { text: 'CARMEN...', hold: 2.4 }],
    ['12.1', 'dissolve', 'a', { dur: 1.5 }],
    ['12.1', 'hold', 'b', { dur: 6.4 }],

    // ritardando into the final chord
    ['14.1', 'ritardando', null, { stretch: 1.2, beats: 3 }],
    ['14.1', 'chord', null, { numeral: 'i', dur: 3, voice: 'bass' }],

    // turnaround — pedal fades, crowd resets, the plaza reopens
    ['o0', 'dissolve', 'b', { dur: 2 }],
    ['o0', 'roomChange', null, { cutoff: 2600, feedback: 0.35, dur: 4 }],
    ['o0.5', 'curtainParts', null, { dur: 3 }],
  ],
};
