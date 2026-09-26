// ============================================================
// 15KB TECHNO OPERA — CONFIG
// A short interactive story in seven acts that fits in 15 kilobytes,
// told with a 9x9 grid of dots, color, motion, and sound.
//
// Operatic Chiptune Audio Architecture:
// Galway PWM, SID 50Hz arpeggio shimmers, audio-rate ring mod,
// biological lub-dub percussion, dynamic vocal formant sweeps.
// ============================================================

export const SIZE = 9;
export const CENTER = (SIZE - 1) / 2;

// MUSIC TOOLKIT — Operatic interval grammar
// Pitches calculated as semitones from root C3 (130.81 Hz)
export const ROOT = 130.81;
export const hz = (semi, root = ROOT) => root * Math.pow(2, semi / 12);

export const MODES = {
  PENTA: [0, 2, 4, 7, 9],
  WOUND: [0, 1, 6], // Minor 2nd / tritone: operatic dread
  OPEN:  [0, 4, 12, 16, 24], // Root + Major 3rd (drop 5th for cathedral clarity)
  // Tracker Arpeggio Shapes
  ARP_MAJ: [0, 4, 7, 12],
  ARP_MIN: [0, 3, 7, 12],
  ARP_TENSION: [0, 1, 6, 12],
  ARP_HARP: [0, 4, 7, 11, 12, 16, 19, 24],
};

// Wagnerian Leitmotif Transformation Kit
export const transpose = (m, semi) => m.map(s => s + semi);
export const minor = (m) => m.map(s => (s % 12 === 4 ? s - 1 : s));
export const invert = (m, pivot = m[0]) => m.map(s => pivot * 2 - s);
export const fragment = (m, n = 2) => m.slice(0, n);

// Semitone definitions for the leitmotifs (relative to C3 = 0)
export const MOTIF = {
  hero: [12, 16],          // C4 -> E4 (tenor hope)
  heroCall: [12, 14],      // C4 -> D4 (the question)
  belovedAnswer: [19, 16], // G4 -> E4 (tender contrary descent)
  aria: [19, 21, 23, 24],        // G4 -> A4 -> B4 -> High C5 (Wagnerian soprano ascension)
  ariaCadence: [21, 19, 16, 12], // A4 -> G4 -> E4 -> C4 (dying melisma descent)
};

// PALETTES — Pure spectral colors of light: ZERO beige, ZERO muddy pigments
export const COLORS = {
  soul: 'hsl(46, 100%, 56%)',      // hero: pure radiant sun gold light
  beloved: 'hsl(335, 100%, 65%)',  // beloved: pure vibrant rose light
  dusk: 'hsl(225, 75%, 16%)',      // sapphire twilight
  envy: 'hsl(110, 100%, 46%)',     // gate: piercing laser green
  rage: 'hsl(0, 100%, 48%)',       // consumed cells: pure spectral ruby red
  heroRage: 'hsl(0, 100%, 60%)',   // hero in crimson flame
  ember: 'hsl(14, 95%, 22%)',      // aftermath: deep glowing coal embers
  drain: 'hsl(245, 60%, 20%)',     // fading twilight indigo
  lastEmber: 'hsl(18, 100%, 52%)', // tungsten orange ember
  memory: 'hsl(335, 95%, 64%)',    // glowing rose petal

  // Development: symmetric anthem rainbow
  rowStripe: (dist) => {
    const hues = [46, 135, 185, 220, 275];
    return `hsl(${hues[Math.min(dist, 4)]}, 100%, ${dist === 0 ? 62 : 52}%)`;
  },

  // Acceptance: celestial violet wash
  peace: (ring) => `hsl(${258 + ring * 5}, 85%, ${58 + ring * 2}%)`,

  // Hero heals down column 4: ruby -> vermilion -> fire amber -> golden amber -> sun gold
  healing: [
    'hsl(0, 100%, 50%)',
    'hsl(14, 100%, 52%)',
    'hsl(28, 100%, 54%)',
    'hsl(38, 100%, 55%)',
    'hsl(46, 100%, 56%)',
  ],
};

// THE ACTS — timings and tunables
export const CONFIG = {
  grid: { size: SIZE, center: CENTER },
  loop: true,
  sound: {
    enabled: true,
    volume: 0.85,
    spatial: true,
  },

  acts: {
    birth: { start: 0, heartbeats: 3 },

    // Equator row ignites; row-pairs bloom with stacked open chord tones + tracker arpeggios
    development: {
      start: 4.4,
      rowGap: 0.55,
      rowChord: [0, 4, 12, 16, 24],
      wander: [[4, 3], [5, 3], [5, 4], [4, 4]],
    },

    // Dusk falls; beloved appears; parallel-thirds duet on 2x2 box + Follin echo
    love: {
      start: 12.0,
      zoom: 1.07,
      hopGap: 1.1,
      heroDance: [[4, 4], [5, 4], [5, 5], [4, 5]],
      belovedDance: [[5, 5], [4, 5], [4, 4], [5, 4]],
    },

    // Green gate descends; ring-mod menace; soprano suspension; downward flight
    jealousy: {
      start: 19.0,
      gateStep: 0.55,
      belovedCell: [5, 4],
      heroFlee: [[4, 6], [4, 7], [4, 8]],
    },

    // Reversal: hero hunts in crimson fury with ring-mod saw & synthesized percussion
    revenge: {
      start: 25.0,
      zoom: 0.94,
      hopGap: 0.38,
      huntPath: [
        [5, 7], [3, 6], [6, 6], [2, 5], [7, 5], [1, 4],
        [4, 4], [7, 4], [2, 3], [5, 2], [3, 1], [4, 0],
      ],
    },

    // Hero heals home; outward violet flood; crystal harp arpeggios; double Amen cadence (IV–I)
    acceptance: {
      start: 31.8,
      zoom: 1.0,
      peaceSpread: 0.32,
      homePath: [[4, 1], [4, 2], [4, 3], [4, 4]],
      memoryCell: [5, 4],
      chordGap: 2.2,
    },

    // Organic decay; dying heartbeats; climactic Soprano Aria; C1 pedal
    death: {
      start: 41.5,
      spread: 0.4,
      texture: 1.4,
      noteEvery: 3,
    },
  },
};
