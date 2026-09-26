// Mode: mask. Canio and Nedda are never dots — they are voices only, never
// entered or appeared. The grid itself is the face: painted amber for the
// smile, a blue flood for the eye's private truth, a shrinking mouth as the
// cadence goes wrong. The mask — not a character — is the one dot that
// blooms and shatters when the face finally splits.
O.opera = {
  title: 'PAGLIACCI', lang: 'it',
  tempo: 96,
  root: 9, mode: 'minor',
  stage: { bg: '#000', grid: 9, dot: 0.5, gap: 1 },
  cast: {
    a: { color: '#e8a33d', size: 1, voice: 'tenor' },
    b: { color: '#4a7ebf', size: 0.8, voice: 'soprano' },
    c: { color: '#c98a3c', size: 1, voice: 'tenor' },
  },
  motif: ['1 -3 -4 2 1', 'x-x.xx-.'],
  chords: 'i iv v vi',
  room: [700, 0.25],
  intro: 5, outro: 7,
  score: [
    // intro — RIDI! — black face barely legible, the mouth painted on
    [0, 'energy', null, { level: 2, dur: 0.5 }],
    [0, 'cue', null, { text: 'RIDI!', hold: 1.4 }],
    [0.05, 'roomChange', null, { cutoff: 700, feedback: 0.25, dur: 0.1 }],
    [0.3, 'wipe', null, { color: '#c98a3c', from: 'left', dur: 1.2 }],
    [1.5, 'sing', 'a', {}],

    // mask — PAGLIACCIO! — held amber smile, energy up for the beat-pulse
    ['1.1', 'energy', null, { level: 6, dur: 1 }],
    ['1.1', 'colourWash', 'grid', { color: '#c98a3c', dur: 0.6 }],
    ['1.1', 'cue', null, { text: 'PAGLIACCIO!', hold: 1.2 }],
    ['1.1', 'sing', 'a', { transform: 'frag' }],
    ['1.1', 'arpChorus', null, { numeral: 'i', dur: 1.2, rate: 50 }],
    ['2.1', 'sing', 'a', { transform: 'frag' }],
    ['2.1', 'shimmer', null, { amount: 0.25, rate: 2, hue: 10, dur: 2 }],

    // crack — NEDDA — the eye's truth, then the wrong laugh
    ['3.1', 'stage', null, { bg: '#0a0a12', dur: 1 }],
    ['3.1', 'energy', null, { level: 4, dur: 1 }],
    ['3.1', 'sing', 'b', { transform: 'ma' }],
    ['3.1', 'flood', null, { color: '#4a7ebf', center: [2, 2], dur: 1, bg: false }],
    ['3.1', 'chord', null, { numeral: 'iv', dur: 1, voice: 'tenor' }],
    ['3.1', 'cue', null, { text: 'NEDDA.', hold: 1.2 }],
    ['3.3', 'chord', null, { numeral: 'i', dur: 1, voice: 'bass' }],
    ['3.3', 'flood', null, { color: '#0a0a12', center: [2, 2], dur: 1, bg: false }],
    ['4.1', 'sing', 'a', { transform: 'mi' }],
    ['4.1', 'flood', null, { color: '#8a5a2a', center: [4, 4], dur: 0.8, bg: false }],
    ['4.1', 'chord', null, { numeral: 'v', dur: 2, voice: 'tenor' }],
    ['4.3', 'ritardando', null, { stretch: 1.15, beats: 1 }],
    ['5.1', 'chord', null, { numeral: 'vi', dur: 2, voice: 'tenor' }],
    ['5.1', 'stage', null, { dot: 0.35, dur: 1 }],
    ['5.3', 'silence', null, { dur: 0.4 }],

    // split — FINITA — the mask, not a face, blooms and breaks
    ['6.1', 'energy', null, { level: 8, dur: 1 }],
    ['6.1', 'roomChange', null, { cutoff: 3000, feedback: 0.6, dur: 2 }],
    ['6.1', 'appear', 'c', { cell: [4, 4], scale: 0.6 }],
    ['6.1', 'sing', 'a', { transform: 'aug' }],
    ['6.1', 'crescendo', null, { to: 0.95, dur: 2.4 }],
    ['7.1', 'bloom', 'c', { dur: 1.5, hold: 0.8 }],
    ['7.1', 'energy', null, { level: 9, dur: 0.5 }],
    ['7.1', 'titleCard', null, { text: 'FINITA.', size: 40, hold: 1.6, color: '#c98a3c' }],
    ['8.1', 'strobe', null, { a: '#c98a3c', b: '#000', rate: 14, dur: 0.6 }],
    ['8.1', 'sing', 'a', { transform: 'dim' }],
    ['8.2', 'shatter', null, { center: [4, 4], dur: 0.6 }],

    // outro — LA COMMEDIA — black returns, the same dim face waiting
    ['o0', 'stage', null, { bg: '#000', grid: 9, dot: 0.5, gap: 1, dur: 2.5 }],
    ['o0', 'energy', null, { level: 1, dur: 2.5 }],
    ['o0', 'shimmer', null, { amount: 0.3, rate: 1.5, hue: 8, dur: 3 }],
    ['o0', 'chord', null, { numeral: 'i', dur: 3, voice: 'bass' }],
    ['o0', 'roomChange', null, { cutoff: 700, feedback: 0.25, dur: 3 }],
    ['o0', 'cue', null, { text: 'LA COMMEDIA.', hold: 2 }],
  ],
};
