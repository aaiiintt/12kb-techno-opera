// Mode: characters. The one piece that keeps named, labelled dots on stage
// throughout — the Duke gold and orbiting, Rigoletto grey and shrinking,
// Gilda white and small. The court is the mass around them: unlit cells
// that brighten, wash amber, dim and freeze with the scene, never a figure
// of its own. Gold to amber to a white bloom of horror, back to gold.
O.opera = {
  title: 'RIGOLETTO', lang: 'it',
  tempo: 108,
  root: 7, mode: 'major',
  stage: { bg: '#000', grid: 9, dot: 0.4, gap: 1 },
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
    // intro — black court forming, the Duke gold and careless
    [0, 'energy', null, { level: 2, dur: 0.5 }],
    [0, 'cue', null, { text: 'LA DONNA.', hold: 1.4 }],
    [0, 'wipe', null, { color: '#c9a227', from: 'left', dur: 1.2 }],
    [0, 'enter', 'a', { edge: 'left', to: [2, 4], dur: 1.2 }],
    [1.2, 'label', 'a', { text: 'DUKE', dur: 1 }],
    [1.4, 'orbit', 'a', { center: [4, 4], radius: 1.5, turns: 1 }],
    [1.6, 'sing', 'a', {}],

    // court — grid brightens amber, Rigoletto fixed and grey, watching
    ['1.1', 'stage', null, { bg: '#2a1f08', dur: 1 }],
    ['1.1', 'colourWash', 'grid', { color: '#5a4318', dur: 1 }],
    ['1.1', 'energy', null, { level: 4, dur: 1 }],
    ['1.1', 'cue', null, { text: 'MOBILE!', hold: 1.4 }],
    ['1.1', 'shimmer', null, { amount: 0.3, rate: 2.2, hue: 8, dur: 3 }],
    ['1.1', 'arpChorus', null, { numeral: 'v', dur: 1.5, rate: 45 }],
    ['1.2', 'appear', 'b', { cell: [4, 4], scale: 1 }],
    ['1.3', 'label', 'b', { text: 'RIGOLETTO', dur: 1 }],
    ['2.1', 'chord', null, { numeral: 'i', dur: 1, voice: 'bass' }],
    ['3.1', 'sing', 'a', {}],
    ['3.3', 'chord', null, { numeral: 'v', dur: 1, voice: 'bass' }],

    // vow — the room narrows and darkens, Gilda enters small at the edge
    ['5.1', 'stage', null, { bg: '#150d02', dur: 1.5 }],
    ['5.1', 'energy', null, { level: 5, dur: 1.5 }],
    ['5.1', 'cue', null, { text: 'MALEDIZIONE.', hold: 1.4 }],
    ['5.1', 'dim', 'grid', { to: 0.4, dur: 1.5 }],
    ['5.1', 'appear', 'c', { cell: [7, 6], scale: 0.6 }],
    ['5.2', 'label', 'c', { text: 'GILDA', dur: 1 }],
    ['5.2', 'grow', 'b', { to: 1.3, dur: 1 }],
    ['5.2', 'sing', 'b', {}],
    ['5.2', 'chord', null, { numeral: 'i', dur: 2, voice: 'bass' }],
    ['6.2', 'shrink', 'b', { to: 1, dur: 1 }],
    ['6.2', 'sing', 'c', { transform: 'inv' }],
    ['7.3', 'silence', null, { dur: 0.3 }],

    // sack — the room blows wide open, Rigoletto drags his hope to centre
    ['9.1', 'stage', null, { bg: '#050505', dur: 1 }],
    ['9.1', 'energy', null, { level: 8, dur: 1 }],
    ['9.1', 'cue', null, { text: 'VENDETTA!', hold: 1.4 }],
    ['9.1', 'shrink', 'b', { to: 0.4, dur: 1.5 }],
    ['9.1', 'path', 'b', { cells: [[7, 6], [6, 5], [5, 5], [4, 4]], trail: true, stepDur: 0.4 }],
    ['9.1', 'chord', null, { numeral: 'v', dur: 2, voice: 'bass' }],
    ['9.1', 'crescendo', null, { to: 0.95, dur: 2.5 }],
    ['10.2', 'ritardando', null, { stretch: 1.15, beats: 1 }],
    ['11.1', 'reveal', 'c', { to: [4, 4], dur: 0.3, color: '#fff' }],
    ['11.1', 'chord', null, { numeral: 'vi', dur: 1.5, voice: 'bass' }],
    ['11.1', 'sing', 'b', { transform: 'retro' }],
    ['11.1', 'titleCard', null, { text: 'GILDA!', size: 42, hold: 1.5, color: '#fff' }],
    ['11.1', 'bloom', 'c', { dur: 2, hold: 1 }],
    ['11.1', 'energy', null, { level: 1, dur: 2 }],
    ['13.1', 'shrink', 'b', { to: 0.2, dur: 1.5 }],
    ['13.1', 'approach', 'b', { target: 'c', dur: 1.5 }],
    ['13.1', 'roomChange', null, { cutoff: 350, feedback: 0.7, dur: 2 }],
    ['13.1', 'hold', 'b', { dur: 3 }],

    // outro — the bloom recedes, the court reforms, the Duke resumes
    ['o0', 'stage', null, { bg: '#000', grid: 9, dot: 0.4, gap: 1, dur: 3 }],
    ['o0', 'energy', null, { level: 2, dur: 3 }],
    ['o0', 'colourWash', 'grid', { color: '#221a05', dur: 3 }],
    ['o0', 'shimmer', null, { amount: 0.25, rate: 1.8, hue: 6, dur: 3 }],
    ['o0', 'roomChange', null, { cutoff: 3200, feedback: 0.15, dur: 3 }],
    ['o0', 'dissolve', 'b', { dur: 1.5 }],
    ['o0', 'dissolve', 'c', { dur: 1.5 }],
    ['o0.5', 'enter', 'a', { edge: 'left', to: [2, 4], dur: 1.2 }],
    ['o1', 'label', 'a', { text: 'DUKE', dur: 1 }],
    ['o1.5', 'orbit', 'a', { center: [4, 4], radius: 1.5, turns: 1 }],
  ],
};
