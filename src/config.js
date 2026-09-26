export const SIZE = 9;
export const CENTER = (SIZE - 1) / 2;
export const ROOT = 130.81;
export const hz = (semi, root = ROOT) => root * Math.pow(2, semi / 12);

export const MODES = {
  PENTA: [0, 2, 4, 7, 9],
  WOUND: [0, 1, 6],
  ARP_MAJ: [0, 4, 7, 12],
  ARP_TENSION: [0, 1, 6, 12],
  ARP_HARP: [0, 4, 7, 11, 12, 16, 19, 24],
};

export const MOTIF = {
  heroBirth: [0, 7, 12, 16],
  heroDev: [12, 16, 19, 24, 21, 19],
  heroLove: [16, 19, 21, 24],
  belovedAnswer: [24, 21, 19, 16],
  heroBetrayed: [12, 15, 18, 11],
  heroWar: [11, 12, 11, 18],
  heroTransfigured: [12, 16, 18, 19],
  heroDying: [12, 16, 7],
  aria: [19, 21, 23, 24],
  ariaCadence: [21, 19, 16, 12],
};

export const COLORS = {
  soul: 'hsl(46, 100%, 54%)',
  beloved: 'hsl(335, 100%, 54%)',
  fusion: 'hsl(345, 100%, 62%)',
  dusk: 'hsl(225, 75%, 16%)',
  envy: 'hsl(110, 100%, 42%)',
  rage: 'hsl(0, 100%, 48%)',
  heroRage: 'hsl(0, 100%, 54%)',
  ember: 'hsl(14, 95%, 22%)',
  drain: 'hsl(245, 60%, 20%)',
  lastEmber: 'hsl(18, 100%, 50%)',
  memory: 'hsl(335, 100%, 58%)',
  explore: [
    'hsl(140, 100%, 45%)',
    'hsl(195, 100%, 48%)',
    'hsl(46, 100%, 54%)',
    'hsl(285, 100%, 54%)',
    'hsl(22, 100%, 50%)',
    'hsl(46, 100%, 54%)',
  ],
  rowStripe: (d) => `hsl(${[46, 140, 195, 230, 280][Math.min(d, 4)]}, 100%, ${d === 0 ? 54 : 46}%)`,
  // Synesthetic purple flood: hue shifts upward (272° -> 287°) and brightens as synth ascends
  peace: (ring, step = 0) => `hsl(${272 + step * 5 + ring * 2}, 100%, ${48 + step * 2 + ring}%)`,
  healing: [
    'hsl(0, 100%, 48%)',
    'hsl(14, 100%, 50%)',
    'hsl(28, 100%, 52%)',
    'hsl(38, 100%, 53%)',
    'hsl(46, 100%, 54%)',
  ],
};

export const CONFIG = {
  grid: { size: SIZE, center: CENTER },
  loop: true,
  sound: {
    enabled: true,
    volume: 0.85,
    spatial: true,
  },
  acts: {
    act1: { start: 0, heartbeats: 3 },
    act2: {
      start: 4.4,
      rowGap: 0.48,
      rowChord: [0, 4, 12, 16, 24],
      wander: [
        [4, 2],
        [7, 3],
        [6, 6],
        [2, 5],
        [3, 4],
        [4, 4],
      ],
    },
    act3: {
      start: 12.0,
      zoom: 1.15,
      hopGap: 0.95,
      heroDance: [[4, 4], [5, 4], [5, 5], [4, 5], [4, 4]],
      belovedDance: [[6, 4], [5, 4], [4, 4], [5, 5], [5, 4]],
    },
    act4: {
      start: 19.0,
      gateStep: 0.55,
      belovedCell: [5, 4],
      heroFlee: [[4, 6], [4, 7], [4, 8]],
    },
    act5: {
      start: 25.0,
      zoom: 0.94,
      hopGap: 0.38,
      huntPath: [
        [5, 7], [3, 6], [6, 6], [2, 5], [7, 5], [1, 4],
        [4, 4], [7, 4], [2, 3], [5, 2], [3, 1], [4, 0],
      ],
    },
    act6: {
      start: 31.8,
      zoom: 1.0,
      peaceSpread: 0.22,
      homePath: [[4, 1], [4, 2], [4, 3], [4, 4]],
      memoryCell: [5, 4],
      chordGap: 2.0,
      // Synesthetic Ascending Progression: coupled chord root, pitches, cues, and room acoustics
      ascension: [
        { root: 0, chord: [0, 4, 7, 12, 14, 16], cue: 0.4, room: 2800 },
        { root: 5, chord: [5, 9, 12, 16, 19, 21], cue: 1.8, room: 3100 },
        { root: 7, chord: [7, 11, 14, 19, 21, 24], cue: 3.2, room: 3500 },
        { root: 12, chord: [12, 16, 19, 21, 24, 28], cue: 4.6, room: 3900 },
      ],
    },
    act7: {
      start: 41.5,
      spread: 0.4,
      texture: 1.4,
      noteEvery: 3,
    },
  },
};
