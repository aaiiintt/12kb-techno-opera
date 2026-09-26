// Mode: light show. No characters — two lighting systems fight over one
// grid. Night (a) is indigo strobe and shatter, violent and small becoming
// vast. Day (c) is a slow wipe and a bloom of gold-white, dawn breaking.
// Pamina (b) is the single flicker caught between them, borrowing light
// from whichever side is winning, never her own colour.
O.opera = {
  title: 'DIE ZAUBERFLÖTE', lang: 'de',
  tempo: 108,
  root: 2, mode: 'harmonic',
  stage: { bg: '#000', grid: 9, dot: 0.4, gap: 1.4 },
  cast: {
    a: { color: '#c93fd6', size: 0.5, voice: 'soprano' },
    b: { color: '#f6c9d6', size: 0.4, voice: 'soprano' },
    c: { color: '#fff4d6', size: 0.5, voice: 'bass' },
  },
  motif: ['1 1 1 5+ 6+', 'x.x.x.x-'],
  chords: 'viio III iv vi i',
  room: [1400, 0.3],
  intro: 6, outro: 6,
  score: [
    // intro — black, night's point flickering at the edge
    [0, 'energy', null, { level: 3, dur: 0.5 }],
    [0, 'appear', 'a', { cell: [8, 1], scale: 0.4 }],
    [0.1, 'flicker', 'a', { beats: 4, amount: 0.35 }],
    [0, 'cue', null, { text: 'DER HÖLLE.' }],
    [1.2, 'chord', 'a', { numeral: 'viio', dur: 0.4, voice: 'tenor' }],

    // fury — the shriek, RACHE!, night eats the screen
    ['1.1', 'stage', null, { bg: '#1a0a2e', dot: 0.6, dur: 0.4 }],
    ['1.1', 'energy', null, { level: 9, dur: 0.5 }],
    ['1.1', 'strobe', null, { a: '#8b2fc9', b: '#000', rate: 16, dur: 0.5 }],
    ['1.1', 'chord', 'a', { numeral: 'viio', dur: 0.4, voice: 'tenor' }],
    ['1.1', 'sing', 'a', {}],
    ['1.2', 'chord', 'a', { numeral: 'viio', dur: 0.4, voice: 'tenor' }],
    ['1.3', 'chord', 'a', { numeral: 'viio', dur: 0.4, voice: 'tenor' }],
    ['2.1', 'shatter', null, { center: [8, 1], dur: 0.6 }],
    ['2.1', 'sing', 'a', { transform: 'frag', vol: 0.09 }],
    ['2.2', 'flood', null, { color: '#c93fd6', center: [4, 8], dur: 1 }],
    ['2.2', 'chord', 'a', { numeral: 'III', dur: 1.4, voice: 'soprano' }],
    ['2.2', 'titleCard', null, { text: 'RACHE!', size: 40, color: '#c93fd6' }],
    ['3.1', 'sing', 'a', { transform: ['tr', -3] }],
    ['3.1', 'dissolve', 'a', { dur: 1 }],

    // between — the fight pauses, Pamina's one caught flicker, one silence
    ['3.3', 'stage', null, { bg: '#0a0a12', dot: 0.3, dur: 0.6 }],
    ['3.3', 'energy', null, { level: 4, dur: 0.5 }],
    ['4.1', 'appear', 'b', { cell: [4, 4], scale: 0.4 }],
    ['4.1', 'flicker', 'b', { beats: 3, amount: 0.3 }],
    ['4.1', 'sing', 'b', { transform: ['tr', -3], vol: 0.1 }],
    ['4.3', 'silence', null, { dur: 0.5 }],

    // temple — hard cut, dawn wipes upward, the one bloom, WEISHEIT!
    ['5.1', 'stage', null, { bg: '#c9a24a', dot: 1, gap: 0.6, dur: 0.05 }],
    ['5.1', 'energy', null, { level: 6, dur: 1 }],
    ['5.1', 'ritardando', null, { stretch: 1.3, beats: 1 }],
    ['5.1', 'appear', 'c', { cell: [4, 8], scale: 0.5 }],
    ['5.1', 'wipe', null, { color: '#fff4d6', from: 'bottom', dur: 1.2 }],
    ['5.1', 'chord', 'c', { numeral: 'vi', dur: 1.6, voice: 'bass' }],
    ['5.1', 'sing', 'c', { transform: 'ma' }],
    ['5.1', 'dissolve', 'b', { dur: 1 }],
    ['6.1', 'energy', null, { level: 8, dur: 1 }],
    ['6.1', 'grow', 'c', { to: 1.4, dur: 1.2 }],
    ['6.1', 'crescendo', null, { to: 0.95, dur: 2.4 }],
    ['6.1', 'chord', 'c', { numeral: 'i', dur: 2.4, voice: 'bass' }],
    ['6.1', 'bloom', 'c', { dur: 2, hold: 1 }],
    ['6.1', 'titleCard', null, { text: 'WEISHEIT!', size: 40, color: '#3a2a05' }],

    // outro — dawn recedes, one last indigo flicker, night waits under calm
    ['o0', 'stage', null, { bg: '#000', grid: 9, dot: 0.4, gap: 1.4, dur: 2.5 }],
    ['o0', 'energy', null, { level: 2, dur: 3 }],
    ['o0', 'appear', 'a', { cell: [8, 1], scale: 0.4 }],
    ['o0.5', 'flicker', 'a', { beats: 1, amount: 0.3 }],
    ['o0.5', 'sing', 'a', { transform: 'frag', vol: 0.05 }],
    ['o1', 'shimmer', null, { amount: 0.3, rate: 2.5, hue: 12, dur: 3 }],
    ['o1', 'cue', null, { text: 'HELP!' }],
  ],
};
