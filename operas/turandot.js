// Mode: dawn. Calaf is a single lamp that only ever brightens, never a
// dot with business of its own. Turandot is the field itself: fixed,
// cold, unmoving until her one late step. Liù is a fragment of shimmer at
// the corner, gone before the climb starts. Black to white, one lamp
// lighting the whole field at VINCERÒ; the bloom is the sunrise.
O.opera = {
  title: 'TURANDOT', lang: 'it',
  tempo: 66,
  root: 8, mode: 'major',
  stage: { bg: '#000', grid: 9, dot: 0.2, gap: 1.5 },
  cast: {
    a: { color: '#fff4d6', size: 0.5, voice: 'tenor' },
    b: { color: '#8fd6ff', size: 1.6, voice: 'soprano' },
    c: { color: '#cfe8ff', size: 0.5, voice: 'soprano' },
  },
  motif: ['1 2 3 4 5 7+', 'x.x.x.x.x...x---'],
  chords: 'i ii iv iv i',
  room: [260, 0.15],
  intro: 6, outro: 8,
  score: [
    // intro — black, the lamp a pinprick, Turandot the cold unseen field
    [0, 'energy', null, { level: 1, dur: 0.5 }],
    [0, 'appear', 'b', { cell: [4, 4], scale: 1 }],
    [0.05, 'dim', 'b', { to: 0.12, dur: 0.3 }],
    [0.3, 'appear', 'a', { cell: [4, 8], scale: 0.3 }],
    [0, 'cue', null, { text: 'NESSUN DORMA.' }],
    [0.6, 'shimmer', null, { amount: 0.15, rate: 1, hue: 4, dur: 3 }],
    [1, 'chord', null, { numeral: 'i', dur: 3, voice: 'bass' }],
    [1, 'sing', 'a', {}],

    // night — Liù's fragment flickers at the corner, then is gone
    ['1.1', 'energy', null, { level: 2, dur: 0.5 }],
    ['1.1', 'appear', 'c', { cell: [0, 0], scale: 0.3 }],
    ['1.1', 'flicker', 'c', { beats: 3, amount: 0.2 }],
    ['1.1', 'sing', 'c', { transform: 'frag', vol: 0.07 }],
    ['1.3', 'shrink', 'c', { to: 0.1, dur: 1.5 }],

    // climb — DILEGUA, the lamp rises a degree a bar, room opening
    ['2.1', 'stage', null, { bg: '#0a0a14', dur: 4 }],
    ['2.1', 'energy', null, { level: 5, dur: 4 }],
    ['2.1', 'dissolve', 'c', { dur: 1 }],
    ['2.1', 'cue', null, { text: 'DILEGUA.' }],
    ['2.1', 'freeze', 'b', { dur: 18 }],
    ['2.1', 'rise', 'a', { rows: 1, stepDur: 0.8 }],
    ['2.1', 'grow', 'a', { to: 0.65, dur: 3.6 }],
    ['2.1', 'sing', 'a', {}],
    ['2.1', 'chord', null, { numeral: 'ii', dur: 3.6, voice: 'bass' }],
    ['2.1', 'roomChange', null, { cutoff: 900, feedback: 0.24, dur: 3.6 }],
    ['2.1', 'shimmer', null, { amount: 0.22, rate: 1.4, hue: 6, dur: 4 }],

    ['3.1', 'rise', 'a', { rows: 1, stepDur: 0.8 }],
    ['3.1', 'grow', 'a', { to: 0.8, dur: 3.6 }],
    ['3.1', 'sing', 'a', {}],
    ['3.1', 'roomChange', null, { cutoff: 1300, feedback: 0.3, dur: 3.6 }],

    ['4.1', 'rise', 'a', { rows: 1, stepDur: 0.8 }],
    ['4.1', 'grow', 'a', { to: 0.95, dur: 3.6 }],
    ['4.1', 'sing', 'a', {}],
    ['4.1', 'chord', null, { numeral: 'iv', dur: 3.6, voice: 'bass' }],
    ['4.1', 'roomChange', null, { cutoff: 1700, feedback: 0.36, dur: 3.6 }],

    ['5.1', 'rise', 'a', { rows: 1, stepDur: 0.8 }],
    ['5.1', 'grow', 'a', { to: 1.1, dur: 3.6 }],
    ['5.1', 'sing', 'a', {}],
    ['5.1', 'roomChange', null, { cutoff: 2100, feedback: 0.42, dur: 3.6 }],

    ['6.1', 'rise', 'a', { rows: 1, stepDur: 0.8 }],
    ['6.1', 'grow', 'a', { to: 1.25, dur: 3.6 }],
    ['6.1', 'sing', 'a', {}],
    ['6.1', 'roomChange', null, { cutoff: 2500, feedback: 0.48, dur: 3.6 }],

    // dawn — one silent bar, then the bloom: VINCERÒ, black becomes white
    ['7.1', 'energy', null, { level: 7, dur: 1 }],
    ['7.1', 'freeze', 'a', { dur: 3.6 }],
    ['7.1', 'silence', null, { dur: 3.6 }],

    ['8.1', 'energy', null, { level: 10, dur: 1 }],
    ['8.1', 'stage', null, { bg: '#fff', grid: 9, dot: 1.2, gap: 0.8, dur: 2 }],
    ['8.1', 'chord', null, { numeral: 'iv', dur: 4.5, voice: 'bass' }],
    ['8.1', 'bloom', 'a', { dur: 3, hold: 1.5 }],
    ['8.1', 'sing', 'a', { transform: 'aug' }],
    ['8.1', 'crescendo', null, { to: 0.95, dur: 4.5 }],
    ['8.1', 'shimmer', null, { amount: 0.4, rate: 2, hue: 10, dur: 4.5 }],
    ['8.1', 'titleCard', null, { text: 'VINCERÒ!', size: 45, hold: 2, color: '#3a2a05' }],

    // outro — Turandot's one step, the cold voice takes the warm tune
    ['o0', 'stage', null, { bg: '#000', grid: 9, dot: 0.2, gap: 1.5, dur: 3 }],
    ['o0', 'energy', null, { level: 3, dur: 3 }],
    ['o0', 'chord', null, { numeral: 'i', dur: 3, voice: 'soprano' }],
    ['o0', 'approach', 'b', { target: 'a', dur: 1 }],
    ['o0.2', 'sing', 'b', {}],
    ['o1', 'roomChange', null, { cutoff: 260, feedback: 0.15, dur: 3 }],
    ['o1', 'dim', 'a', { to: 0.15, dur: 3 }],
    ['o1', 'dim', 'b', { to: 0.12, dur: 3 }],
    ['o1', 'energy', null, { level: 1, dur: 3 }],
  ],
};
