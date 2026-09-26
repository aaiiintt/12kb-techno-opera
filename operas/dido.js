// Mode: pure feeling. No actor is ever a visible dot. The ground bass is a
// tide that never stops descending; grief is weather in the mass; shimmer
// drains the field to black. The cast exists only for voice — a, b and c
// never enter, appear, grow or dissolve as a dot. The one bloom is the
// field itself cresting, not a character.
O.opera = {
  title: 'DIDO AND AENEAS', lang: 'en',
  tempo: 56,
  root: 7, mode: 'minor',
  stage: { bg: '#0d0a14', grid: 9, dot: 0.4, gap: 1 },
  cast: {
    a: { color: '#8b5cf6', size: 1, voice: 'soprano' },
    b: { color: '#cbd5e1', size: 1, voice: 'soprano' },
    c: { color: '#3a2e55', size: 1, voice: 'bass' },
  },
  motif: ['1 7- 6- 5-', 'x-x-x-x-'],
  chords: 'i iv vi v',
  room: [700, 0.4],
  intro: 8, outro: 8,
  score: [
    // intro — half-closed violet-grey; the ground bass made visible as a
    // falling column, unbroken
    [0, 'energy', null, { level: 3, dur: 0.5 }],
    [0, 'roomChange', null, { cutoff: 700, feedback: 0.4, dur: 0.3 }],
    [0, 'colourWash', 'grid', { color: '#3a2e55', dur: 0.5 }],
    [0.3, 'fillColumn', null, { col: 4, stepDur: 0.6, dir: 'down' }],
    [0.3, 'sing', 'c', {}],
    [4.3, 'fillColumn', null, { col: 4, stepDur: 0.6, dir: 'down' }],
    [4.6, 'sing', 'c', {}],

    // ground — the vocal line enters as a violet tide sinking over the
    // pedal; a comfort-fragment flares in shimmer and is swallowed back
    ['1.1', 'stage', null, { bg: '#150f22', dur: 1.5 }],
    ['1.1', 'energy', null, { level: 5, dur: 1 }],
    ['1.1', 'cue', null, { text: 'REMEMBER ME.', hold: 1.8 }],
    ['1.1', 'tide', null, { dir: 'down', color: '#6b5aa8', period: 1.2, repeat: 4 }],
    ['1.1', 'sing', 'a', { transform: ['tr', 12] }],
    ['1.1', 'sing', 'c', {}],
    ['2.1', 'sing', 'c', {}],
    ['3.1', 'shimmer', null, { amount: 0.4, rate: 3, hue: 15, dur: 1.5 }],
    ['3.1', 'sing', 'b', { transform: [['frag', 2], ['dim']] }],
    ['3.1', 'sing', 'c', {}],
    ['4.1', 'sing', 'c', {}],

    // remember me — grief crests: the one bloom, then the field drains to
    // black and the pattern outlives the singer
    ['5.1', 'energy', null, { level: 7, dur: 2 }],
    ['5.1', 'cue', null, { text: 'BUT AH.', hold: 1.6 }],
    ['5.1', 'sing', 'a', { transform: [['tr', 12], ['aug']] }],
    ['5.1', 'crescendo', null, { to: 0.85, dur: 4 }],
    ['5.1', 'sing', 'c', {}],
    ['6.1', 'sing', 'c', {}],
    ['7.1', 'cue', null, { text: 'FORGET MY FATE.', hold: 2 }],
    ['7.1', 'chord', null, { numeral: 'iv', dur: 2, voice: 'soprano' }],
    ['7.1', 'bloom', 'a', { dur: 2, hold: 1 }],
    ['7.1', 'sing', 'c', {}],
    ['8.1', 'colourWash', 'grid', { color: '#232030', dur: 3 }],
    ['8.1', 'energy', null, { level: 2, dur: 3 }],
    ['8.1', 'hold', 'a', { dur: 3 }],
    ['8.1', 'sing', 'c', {}],
    ['9.1', 'silence', null, { dur: 0.3 }],
    ['9.1', 'blackout', null, { dur: 0, hold: 1 }],
    ['9.1', 'roomChange', null, { cutoff: 900, feedback: 0.7, dur: 3 }],
    ['9.1', 'shimmer', null, { amount: 0.15, rate: 1.5, hue: 10, dur: 12 }],
    ['9.1', 'fillColumn', null, { col: 4, stepDur: 0.6, dir: 'down' }],
    ['9.1', 'sing', 'c', {}],
    ['10.1', 'fillColumn', null, { col: 4, stepDur: 0.6, dir: 'up' }],
    ['10.1', 'sing', 'c', {}],
    ['11.1', 'fillColumn', null, { col: 4, stepDur: 0.6, dir: 'down' }],
    ['11.1', 'sing', 'c', {}],
    ['12.1', 'shimmer', null, { amount: 0.15, rate: 1.5, hue: 10, dur: 9 }],
    ['12.1', 'fillColumn', null, { col: 4, stepDur: 0.6, dir: 'up' }],
    ['12.1', 'sing', 'c', { voice: 'arp' }],
    ['13.1', 'fillColumn', null, { col: 4, stepDur: 0.6, dir: 'down' }],
    ['13.1', 'sing', 'c', { voice: 'arp' }],
    ['14.1', 'fillColumn', null, { col: 4, stepDur: 0.6, dir: 'up' }],
    ['14.1', 'sing', 'c', { voice: 'arp' }],

    // outro — the ground bass relights on shimmer, morphing back to the
    // intro's exact values so the descent is always about to sink again
    ['o0', 'sing', 'c', { voice: 'arp' }],
    ['o0.2', 'roomChange', null, { cutoff: 700, feedback: 0.4, dur: 6 }],
    ['o0.5', 'colourWash', 'grid', { color: '#3a2e55', dur: 5 }],
    ['o1', 'fillColumn', null, { col: 4, stepDur: 0.6, dir: 'down' }],
    ['o1', 'shimmer', null, { amount: 0.5, rate: 2, hue: 20, dur: 4 }],
    ['o2', 'stage', null, { bg: '#0d0a14', grid: 9, dot: 0.4, gap: 1, dur: 3 }],
    ['o2', 'energy', null, { level: 3, dur: 3 }],
  ],
};
