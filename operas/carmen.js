// José, a soldier, cannot let Carmen go. Gold hero, coral beloved, on the
// house 9x9 grid. Habanera pedal from v2, unchanged; light follows voice.
O.opera = {
  title: 'CARMEN', lang: 'fr',
  tempo: 72,
  root: 2, mode: 'phrygian',
  stage: { grid: 9 },
  cast: {
    jose: { color: 'gold', voice: 'tenor' },
    carmen: { color: 'coral', voice: 'soprano' },
  },
  motif: ['5 4 3 2 1', 'x-x.x-x.'],
  room: [2600, 0.3],
  intro: 6, outro: 6,
  score: [
    // I. the guard — José alone, lit only by his heartbeat
    [0, 'pulse', 'jose', { beats: 4 }],

    // II. the flower — Carmen enters singing, circles him one cell out
    ['1.1', 'hop', 'carmen', { to: [0, 4], dur: 0.35 }],
    ['1.1', 'sing', 'carmen', {}],
    ['1.1', 'scan', null, { row: 8, dur: 6.6, light: 'coral' }],
    ['1.1', 'chord', 'jose', { numeral: 'i', dur: 6.6, voice: 'bass' }],
    ['1.3', 'orbit', 'carmen', { center: [4, 4], radius: 1, turns: 1 }],
    ['3.1', 'scan', null, { row: 8, dur: 6.6, light: 'coral' }],
    ['3.1', 'chord', 'jose', { numeral: 'i', dur: 6.6, voice: 'bass' }],
    ['4.1', 'sparkle', null, { count: 3, dur: 0.6, light: 'coral' }],
    ['4.2', 'pop', 'jose', { dur: 0.3, scale: 1.15 }],
    ['4.2', 'grow', 'jose', { to: 1.3, dur: 0.6 }],
    ['4.3', 'pulse', 'jose', { beats: 2 }],
    ['4.3', 'cue', null, { text: "L'AMOUR" }],

    // III. the crowd — canon answer, chase quickening, José shrinking
    ['5.1', 'sing', 'carmen', {}],
    ['5.1', 'chase', null, { light: 'bulb', dur: 3.3, rate: 12 }],
    ['5.1', 'shrink', 'jose', { to: 0.85, dur: 1 }],
    ['5.2', 'sing', 'jose', {}],
    ['6.1', 'chase', null, { light: 'bulb', dur: 3.3, rate: 16 }],
    ['6.1', 'shrink', 'jose', { to: 0.7, dur: 1 }],
    ['7.1', 'chase', null, { light: 'bulb', dur: 3.3, rate: 20 }],
    ['7.1', 'shrink', 'jose', { to: 0.55, dur: 1 }],
    ['7.3', 'drum', null, { pattern: 'hat' }],
    ['8.1', 'chase', null, { light: 'bulb', dur: 3.3, rate: 26 }],
    ['8.1', 'shrink', 'jose', { dur: 1 }],
    ['8.3', 'drum', null, { pattern: 'hat' }],
    ['8.4', 'cue', null, { text: 'TORÉADOR!' }],

    // IV. lost to her — José takes her motif, coral closes in ring by ring
    ['9.1', 'sing', 'jose', {}],
    ['9.1', 'room', null, { cutoff: 1400, feedback: 0.5, dur: 3 }],
    ['9.1', 'fillCentre', null, { radius: 1, light: 'coral', numeral: 'i' }],
    ['10.1', 'fillCentre', null, { radius: 2, light: 'coral', numeral: 'iv' }],
    ['11.1', 'sing', 'jose', {}],
    ['11.1', 'fillCentre', null, { radius: 3, light: 'coral', numeral: 'iv' }],
    ['12.1', 'fillCentre', null, { radius: 4, light: 'coral', numeral: 'v' }],
    ['12.4', 'cue', null, { text: "JE T'AIME" }],

    // V. libre — she breaks for the corner, the one big burst
    ['13.1', 'hop', 'carmen', { to: [8, 8], dur: 0.4 }],
    ['13.2', 'sing', 'jose', { transform: 'retro' }],
    ['13.3', 'crescendo', null, { to: 0.95, dur: 2 }],
    ['14.1', 'explode', null, { center: [8, 8], rings: 4, light: 'coral' }],
    ['15.3', 'cue', null, { text: 'LIBRE' }],

    // VI. the knife — a bar of near-silence, then the single stab
    ['16.1', 'ritardando', null, { stretch: 1.15, beats: 1 }],
    ['16.1', 'silence', null, { dur: 3 }],
    ['17.1', 'jumpCut', null, { light: 'coral' }],
    ['17.1', 'flash', null, { light: 'coral', pattern: 'snare' }],
    ['17.1', 'chord', 'jose', { numeral: 'v', dur: 0.8, voice: 'bass' }],
    ['17.1', 'closeUp', 'carmen', { dur: 0.12 }],
    ['17.1', 'sing', 'carmen', { transform: 'aug' }],
    ['17.1', 'burn', 'carmen', { dur: 2 }],
    ['18.1', 'snapBack', null, { dur: 0.12 }],
    ['18.1', 'jumpCut', null, {}],
    ['18.1', 'cue', null, { text: 'ADIEU' }],

    // VII. alone — the pedal holds, his heartbeat slows, the loop closes
    ['o0', 'chord', 'jose', { numeral: 'i', dur: 5, voice: 'bass' }],
    ['o0', 'grow', 'jose', { to: 1, dur: 3 }],
    ['o0', 'pulse', 'jose', { beats: 3 }],
    ['o2', 'cue', null, { text: 'CARMEN...' }],
  ],
};
