// Mode: instrument. The grid is a 13x13 Tenori-on, never a cast of dots —
// Figaro, Rosina and Bartolo are colours of light sweeping the mass, not
// travellers on it. No enter, no appear: every voice lights the grid as a
// spectacle event (tide, wipe, flood), never a persistent dot. Figaro's
// orange tide is the sequencer, quickening each repeat; Bartolo's brown
// wipe always lands a beat late; Rosina's pink floods the off-beat. One
// drop to a cavernous echo, one bloom, then a hard cut back to the same
// tiny points it opened on.
O.opera = {
  title: 'THE BARBER OF SEVILLE', lang: 'it',
  tempo: 152,
  root: 0, mode: 'major',
  stage: { bg: '#000', grid: 13, dot: 0.25, gap: 1.6 },
  cast: {
    a: { color: '#e8891c', size: 1.0, voice: 'tenor' },
    b: { color: '#f2a8c4', size: 0.7, voice: 'soprano' },
    c: { color: '#6b4226', size: 1.6, voice: 'bass' },
  },
  motif: ['1 2 3 5 4 2 1', 'xxxxxxx-'],
  chords: 'i v i v',
  room: [3000, 0.15],
  intro: 4, outro: 5,
  score: [
    // intro — FIGARO! the patter as a repeating orange sweep, a sequencer
    [0, 'energy', null, { level: 4, dur: 0.3 }],
    [0, 'tide', null, { dir: 'right', period: 0.3, repeat: 4, color: '#e8891c' }],
    [0, 'sing', 'a', {}],
    [0, 'cue', null, { text: 'FIGARO!', hold: 1.4 }],

    // patter — the orange sweep quickens, Bartolo's brown wipe lands late
    ['1.1', 'stage', null, { dot: 0.3, dur: 0.3 }],
    ['1.1', 'energy', null, { level: 6, dur: 1 }],
    ['1.1', 'tide', null, { dir: 'right', period: 0.25, repeat: 4, color: '#e8891c' }],
    ['1.1', 'sing', 'a', {}],
    ['1.3', 'wipe', null, { color: '#6b4226', from: 'left', dur: 0.6, bg: false }],
    ['1.3', 'sing', 'c', { transform: [['frag'], ['aug']] }],

    // chase — LINDORO! Rosina's pink floods the off-beat, transposed bright
    ['2.1', 'stage', null, { dot: 0.35, dur: 0.3 }],
    ['2.1', 'energy', null, { level: 8, dur: 1 }],
    ['2.1', 'flood', null, { color: '#f2a8c4', center: [7, 7], dur: 0.5, bg: false }],
    ['2.1', 'sing', 'b', { transform: ['tr', 12] }],
    ['2.1', 'cue', null, { text: 'LINDORO!', hold: 1 }],
    ['2.1', 'tide', null, { dir: 'right', period: 0.2, repeat: 4, color: '#e8891c' }],
    ['2.3', 'sing', 'a', { transform: 'dim' }],
    ['2.3', 'crescendo', null, { to: 0.7, dur: 1.2 }],
    ['3.1', 'flood', null, { color: '#f2a8c4', center: [7, 7], dur: 0.4, bg: false }],
    ['3.1', 'sing', 'b', { transform: ['tr', 12] }],
    ['3.1', 'tide', null, { dir: 'right', period: 0.15, repeat: 4, color: '#e8891c' }],
    ['3.1', 'sing', 'a', { transform: [['dim'], ['dim']] }],
    ['3.3', 'wipe', null, { color: '#6b4226', from: 'left', dur: 0.5, bg: false }],
    ['3.3', 'sing', 'c', { transform: [['frag'], ['aug']] }],

    // chorus — ZITTO! the hard freeze, BRAVO! the one bloom, FACTOTUM! max speed
    ['4.1', 'stage', null, { dot: 0.4, dur: 0.2 }],
    ['4.1', 'energy', null, { level: 9, dur: 0.1 }],
    ['4.1', 'blackout', null, { dur: 0, hold: 0.5 }],
    ['4.1', 'silence', null, { dur: 0.5 }],
    ['4.1', 'cue', null, { text: 'ZITTO!', hold: 0.9 }],
    ['4.3', 'energy', null, { level: 5, dur: 0.1 }],
    ['4.3', 'roomChange', null, { cutoff: 700, feedback: 0.65, dur: 0.1 }],
    ['4.3', 'bloom', 'c', { dur: 1, hold: 0.5 }],
    ['4.3', 'sing', 'c', { transform: [['frag'], ['aug']] }],
    ['4.3', 'cue', null, { text: 'BRAVO!', hold: 0.9 }],
    ['5.1', 'roomChange', null, { cutoff: 3000, feedback: 0.15, dur: 0.1 }],
    ['5.1', 'energy', null, { level: 10, dur: 0.3 }],
    ['5.1', 'tide', null, { dir: 'right', period: 0.12, repeat: 5, color: '#e8891c' }],
    ['5.1', 'sing', 'a', {}],
    ['5.1', 'chord', null, { numeral: 'v', dur: 0.5, voice: 'bass' }],
    ['5.1', 'titleCard', null, { text: 'FACTOTUM!', size: 40, hold: 1.2 }],
    ['5.3', 'chord', null, { numeral: 'i', dur: 0.4, voice: 'bass' }],

    // outro — dead cut back to the intro's exact tiny points, no fade
    ['o0', 'stage', null, { bg: '#000', grid: 13, dot: 0.25, gap: 1.6, dur: 0 }],
    ['o0', 'energy', null, { level: 4, dur: 0 }],
    ['o0', 'silence', null, { dur: 0.15 }],
    ['o0', 'shimmer', null, { amount: 0.25, rate: 3, hue: 8, dur: 1.5 }],
    ['o0.2', 'chord', null, { numeral: 'v', dur: 0.4, voice: 'bass' }],
    ['o0.6', 'chord', null, { numeral: 'i', dur: 0.4, voice: 'bass' }],
  ],
};
