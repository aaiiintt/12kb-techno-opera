// Mode: forces and one dot. Carmen is never a character-dot except twice —
// taken, then alone. She is the tide, the flood, the disc that eats the
// screen. José is a fixed amber patch the crowd closes on. The chorus is
// the grid: it fans open black, rolls red, closes like a fist, drowns.
O.opera = {
  title: 'CARMEN', lang: 'fr',
  tempo: 72,
  root: 2, mode: 'phrygian',
  stage: { bg: '#000', grid: 9, dot: 0.3, gap: 1.2 },
  cast: {
    a: { color: '#e63b2e', size: 1.3, voice: 'soprano' },
    b: { color: '#f5a623', size: 1.0, voice: 'tenor' },
  },
  motif: ['5 4 3 2 1', 'x-x.x-x.'],
  chords: 'i iv v i',
  room: [2600, 0.3],
  intro: 6, outro: 6,
  score: [
    // intro — black plaza, José a faint amber patch, Carmen not yet a dot
    [0, 'energy', null, { level: 2, dur: 0.5 }],
    [0, 'appear', 'b', { cell: [4, 4], scale: 0.6 }],
    [0.1, 'dim', 'b', { to: 0.25, dur: 0.4 }],
    [0, 'cue', null, { text: "L'AMOUR." }],
    [0.6, 'wipe', null, { color: '#e63b2e', from: 'left', dur: 1.5 }],
    [2.1, 'sing', 'a', {}],

    // build — the tide rolls, the ring starts to close, José dims under it
    ['1.1', 'stage', null, { bg: '#1a0000', dot: 0.5, dur: 1 }],
    ['1.1', 'energy', null, { level: 5, dur: 1 }],
    ['1.1', 'cue', null, { text: 'TORÉADOR!' }],
    ['1.1', 'tide', null, { dir: 'right', color: '#e63b2e', period: 1, repeat: 3 }],
    ['1.1', 'shimmer', null, { amount: 0.3, rate: 2, hue: 15, dur: 3 }],
    ['1.1', 'arpChorus', null, { numeral: 'i', dur: 3, rate: 42 }],
    ['1.1', 'sing', 'a', {}],
    ['1.2', 'sing', 'b', {}],
    ['2.1', 'cue', null, { text: "JE T'AIME." }],
    ['2.1', 'closeIn', null, { center: [4, 4], dur: 1.2 }],
    ['2.1', 'roomChange', null, { cutoff: 1400, feedback: 0.5, dur: 2.6 }],
    ['2.1', 'sing', 'a', {}],
    ['2.2', 'sing', 'b', {}],
    ['2.3', 'dim', 'b', { to: 0.6, dur: 1 }],
    ['3.1', 'sing', 'a', {}],
    ['3.2', 'sing', 'b', {}],
    ['4.1', 'sing', 'a', {}],
    ['4.1', 'crescendo', null, { to: 0.7, dur: 3 }],
    ['4.2', 'sing', 'b', {}],

    // circle — the touch, then the bloom: one red disc eats the screen
    ['5.1', 'energy', null, { level: 8, dur: 1 }],
    ['5.1', 'sing', 'a', {}],
    ['5.1', 'chord', null, { numeral: 'i', dur: 1, voice: 'bass' }],
    ['5.1', 'roomChange', null, { cutoff: 1000, feedback: 0.65, dur: 3 }],
    ['5.2', 'grow', 'b', { to: 1.2, dur: 0.3 }],
    ['5.2', 'touch', 'a', { other: 'b' }],
    ['5.3', 'chord', null, { numeral: 'iv', dur: 1, voice: 'bass' }],
    ['5.3', 'bloom', 'a', { dur: 2, hold: 1 }],
    ['5.3', 'crescendo', null, { to: 0.95, dur: 3 }],
    ['6.1', 'chord', null, { numeral: 'v', dur: 1, voice: 'bass' }],
    ['6.1', 'titleCard', null, { text: 'LIBRE.', size: 40, hold: 1.5, color: '#fff' }],
    ['6.1', 'energy', null, { level: 9, dur: 1 }],
    ['6.2', 'hold', 'a', { dur: 1.5 }],

    // close — the silent bar, the strobe, the knife
    ['7.1', 'energy', null, { level: 9, dur: 0 }],
    ['7.1', 'blackout', null, { dur: 0, hold: 2.6 }],
    ['7.1', 'silence', null, { dur: 2.6 }],
    ['8.1', 'energy', null, { level: 0, dur: 0.1 }],
    ['8.1', 'ritardando', null, { stretch: 1.15, beats: 1 }],
    ['8.1', 'strobe', null, { a: '#fff', b: '#000', rate: 16, dur: 0.4 }],
    ['8.1', 'sing', 'b', { transform: [['retro'], ['aug']] }],
    ['8.1', 'chord', null, { numeral: 'v', dur: 1, voice: 'bass' }],
    ['8.2', 'shatter', null, { center: [4, 4], dur: 0.6 }],
    ['8.2', 'appear', 'b', { cell: [4, 4], scale: 0.8 }],
    ['8.3', 'cue', null, { text: 'ADIEU.' }],

    // outro — the plaza reforms, José dissolves, the pedal fades alone
    ['o0', 'stage', null, { bg: '#000', grid: 9, dot: 0.3, gap: 1.2, dur: 3 }],
    ['o0', 'energy', null, { level: 2, dur: 3 }],
    ['o0', 'chord', null, { numeral: 'i', dur: 3, voice: 'bass' }],
    ['o0', 'shimmer', null, { amount: 0.2, rate: 1.5, hue: 10, dur: 3 }],
    ['o0', 'dissolve', 'b', { dur: 1.2 }],
    ['o0', 'cue', null, { text: 'CARMEN...' }],
  ],
};
