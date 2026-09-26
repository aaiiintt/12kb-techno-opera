// Phase 1 scratch: exercises every one of the 31 new gestures at least once.
// Not art -- a checklist with a pulse. ~25s intro to outro.
O.opera = {
  title: 'SCRATCH 2', lang: 'it',
  tempo: 110,
  root: 2, mode: 'dorian',
  cast: {
    a: { color: '#e63b2e', size: 1.2, voice: 'tenor' },
    b: { color: '#f5a623', size: 1.0, voice: 'soprano' },
    c: { color: '#4fd1c5', size: 1.1, voice: 'bass' },
  },
  motif: ['5 4 3 2 1', 'x-x.x-x.'],
  chords: 'i iv v i',
  room: [1000, 0.4],
  intro: 3, outro: 3,
  score: [
    [0, 'appear', 'a', { cell: [4, 4] }],
    [0, 'cue', null, { text: 'SCRATCH 2.', hold: 1 }],
    [0.3, 'appear', 'b', { cell: [2, 2] }],
    [0.6, 'appear', 'c', { cell: [6, 6] }],

    [1.0, 'path', 'a', { cells: [[4, 4], [4, 2], [6, 2], [6, 4]], stepDur: 0.3 }],
    [1.0, 'label', 'a', { text: 'LEAD', dur: 0.5 }],
    [2.5, 'speech', 'b', { text: 'ECHO', hold: 0.8 }],
    [2.5, 'echoVoice', 'b', {}],

    [3.0, 'orbit', 'a', { center: [4, 4], radius: 1.5, turns: 1 }],
    [3.0, 'shake', null, { amount: 6, dur: 0.3 }],
    [3.0, 'drum', null, { pattern: 'hat', vol: 0.2 }],
    [3.4, 'drum', null, { pattern: 'heartbeat', vol: 0.15 }],

    [4.6, 'sink', 'a', { rows: 2, stepDur: 0.4 }],
    [4.6, 'dash', 'b', { cells: [[2, 2], [4, 1], [6, 2]], speed: 2 }],

    [6.1, 'weave', 'c', { targets: ['a', 'b'], stepDur: 0.3 }],
    [6.1, 'scatter', null, { actors: ['a', 'b', 'c'], from: [4, 4], dur: 0.6 }],

    [7.1, 'wander', 'b', { range: 2, dur: 0.8 }],
    [7.1, 'waltz', 'a', { partner: 'b', turns: 1 }],

    [8.3, 'touch', 'b', { other: 'c' }],
    [8.8, 'merge', 'a', { other: 'b', dur: 0.6 }],
    [9.6, 'split', 'c', { to: [[3, 3], [7, 7]], dur: 0.6 }],
    [10.4, 'swapSize', 'a', { other: 'c', dur: 0.4 }],
    [11.0, 'keepDistance', 'b', { target: 'a', gap: 3 }],

    [11.6, 'fillRing', null, { center: [4, 4], ring: 2, color: '#4fd1c5' }],
    [12.4, 'fillColumn', null, { col: 4, stepDur: 0.2 }],
    [13.4, 'closeIn', null, { center: [4, 4], dur: 1.2 }],
    [14.8, 'curtainParts', null, { dur: 0.8 }],

    [15.8, 'colourWash', 'grid', { color: '#f5a623', dur: 1.2 }],
    [17.2, 'dim', 'a', { to: 0.3, dur: 0.6 }],
    [17.9, 'burnEmber', 'b', { dur: 1.2 }],

    [19.3, 'zoomTo', null, { target: 'c', zoom: 1.6, dur: 0.8 }],
    [20.2, 'drift', null, { to: [4, 4], dur: 1.2 }],
    [21.5, 'snapCut', null, { target: 'a', zoom: 1 }],

    [21.7, 'exit', 'a', { edge: 'right', speed: 1.5 }],
    [21.7, 'reveal', 'b', { to: [4, 4], dur: 0.4, color: '#fff' }],
    [22.3, 'stutter', 'c', { beats: 3 }],
    [23.2, 'slow', null, { dur: 1 }],

    [24.4, 'cue', null, { text: 'FINE 2.', hold: 1.5 }],
  ],
};
