// Mode: wall. No named dots — dread is a wall. The Commendatore is a grey
// advance eating the grid row by row against a red field, exact and silent
// between hammers. Giovanni is never a dot, only the fast fragmented voice
// riding the same slow clock. Elvira is a gold shimmer that cannot stop it.
// The handshake is the one bloom, grey, swallowing the red field whole.
O.opera = {
  title: 'DON GIOVANNI', lang: 'it',
  tempo: 60,
  root: 2, mode: 'minor',
  stage: { bg: '#2a0505', grid: 9, dot: 0.5, gap: 0.8 },
  cast: {
    a: { color: '#e63b2e', size: 1, voice: 'tenor' },
    b: { color: '#8a8a8a', size: 1.4, voice: 'bass' },
    c: { color: '#f0d28a', size: 0.8, voice: 'soprano' },
  },
  motif: ['1 1 1 1', 'x---x---'],
  chords: 'i i i VII',
  room: [700, 0.6],
  intro: 6, outro: 8,
  score: [
    // intro — the grey edge already fixed, red field dim, silence between hammers
    [0, 'energy', null, { level: 2, dur: 0.5 }],
    [0, 'sing', 'b', { vol: 0.24 }],
    [0, 'chord', null, { numeral: 'i', dur: 2, voice: 'bass' }],
    [0, 'flicker', 'grid', { beats: 1, amount: 0.5 }],
    [0, 'wipe', null, { color: '#666', from: 'top', dur: 38 }],
    [4, 'silence', null, { dur: 1.2 }],

    // approach — red brightens, the fragmented dance ignores the wall entirely
    ['1.1', 'stage', null, { bg: '#4a0808', dur: 1 }],
    ['1.1', 'energy', null, { level: 5, dur: 1 }],
    ['1.1', 'cue', null, { text: 'VIVA LA LIBERTÀ!' }],
    ['1.1', 'tide', null, { dir: 'right', color: '#e63b2e', period: 1.2, repeat: 3 }],
    ['1.1', 'sing', 'a', { transform: [['frag'], ['dim']], vol: 0.2 }],
    ['3.1', 'sing', 'b', { vol: 0.24 }],
    ['3.1', 'chord', null, { numeral: 'i', dur: 2, voice: 'bass' }],
    ['3.1', 'flicker', 'grid', { beats: 1, amount: 0.4 }],

    // defiance — gold plea threads the red, the hammer unchanged, the mocking invert
    ['5.1', 'stage', null, { bg: '#5a0a0a', dur: 1 }],
    ['5.1', 'energy', null, { level: 6, dur: 2 }],
    ['5.1', 'cue', null, { text: 'CHI SIETE?' }],
    ['5.1', 'shimmer', null, { amount: 0.3, rate: 2, hue: 20, dur: 6 }],
    ['5.1', 'sing', 'c', { transform: 'aug', vol: 0.2 }],
    ['5.1', 'sing', 'b', { vol: 0.24 }],
    ['5.1', 'chord', null, { numeral: 'i', dur: 2, voice: 'bass' }],
    ['7.1', 'cue', null, { text: 'RIDI!' }],
    ['7.1', 'sing', 'a', { transform: 'inv', vol: 0.22 }],
    ['7.1', 'flicker', 'grid', { beats: 1, amount: 0.4 }],
    ['8.1', 'crescendo', null, { to: 0.9, dur: 4 }],

    // arrival — the wall reaches the edge: the handshake, bloom to grey, then black
    ['9.1', 'stage', null, { bg: '#333', dur: 1 }],
    ['9.1', 'energy', null, { level: 9, dur: 0 }],
    ['9.1', 'appear', 'b', { cell: [4, 4], scale: 1 }],
    ['9.1', 'chord', null, { numeral: 'VII', dur: 2, voice: 'bass' }],
    ['9.1', 'bloom', 'b', { dur: 2, hold: 1 }],
    ['9.1', 'titleCard', null, { text: 'PENTITI!', size: 40, hold: 3, color: '#888' }],
    ['9.1', 'roomChange', null, { cutoff: 350, feedback: 0.75, dur: 3 }],
    ['9.4', 'energy', null, { level: 0, dur: 0.3 }],
    ['9.4', 'blackout', null, { dur: 0, hold: 1 }],
    ['9.4', 'shrink', 'b', { to: 0, dur: 0.3 }],

    // outro — from black, the same fixed grey edge and dim red field reform
    ['o0', 'stage', null, { bg: '#2a0505', grid: 9, dot: 0.5, gap: 0.8, dur: 2 }],
    ['o0', 'energy', null, { level: 1, dur: 2 }],
    ['o0', 'shimmer', null, { amount: 0.2, rate: 1.5, hue: 5, dur: 3 }],
    ['o0', 'sing', 'b', { vol: 0.1 }],
  ],
};
