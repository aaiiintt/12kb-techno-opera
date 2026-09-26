// ============================================================
// 15KB TECHNO OPERA — CONFIG
// A short interactive story in seven acts that fits in 15 kilobytes,
// told with a 9x9 grid of dots, color, motion, and sound.
//
// The hero is a LIGHT, not a dot — a glowing identity handed
// cell to cell like a torch. The camera follows him: he stays
// center-frame and the world slides beneath. Every visual
// event sings. Birth and death both end at the center cell.
// ============================================================

const SIZE = 9;
const CENTER = (SIZE - 1) / 2;

// MUSIC TOOLKIT — semitone offsets from a root frequency
//   PENTA — no dissonant interval exists; safe joy
//   WOUND — minor 2nd / tritone; unease, used quietly
//   OPEN  — 4ths/5ths; the hymn sound of acceptance
export const MODES = {
  PENTA: [0, 2, 4, 7, 9],
  WOUND: [0, 1, 6],
  OPEN: [0, 5, 7, 12],
};

export const semitone = (root, semi) => root * Math.pow(2, semi / 12);

export const PITCH = {
  C2: 65.41,
  C3: 130.81,
  B3: 246.94,
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392.0,
  A4: 440.0,
  C5: 523.25,
};

// LEITMOTIFS — each character has operatic voice profiles:
//   Hero (Tenor): upward C-D question, C-E hope
//   Beloved (Soprano): G-E tender answer, E-G harmony
//   Aria: G4 -> A4 -> C5 high soprano climax
//   Broken: B-E mournful drop in revenge
export const MOTIF = {
  hero: [PITCH.C4, PITCH.E4],
  beloved: [PITCH.E4, PITCH.G4],
  heroCall: [PITCH.C4, PITCH.D4],
  belovedAnswer: [PITCH.G4, PITCH.E4],
  heroBroken: [PITCH.B3, PITCH.E4],
  aria: [PITCH.G4, PITCH.A4, PITCH.C5],
};

// PALETTES — Pure spectral colors of light: ZERO beige, ZERO muddy pigments
export const COLORS = {
  soul: 'hsl(46, 100%, 56%)', // the hero: pure radiant sun gold light
  beloved: 'hsl(335, 100%, 65%)', // the beloved: pure vibrant rose light
  dusk: 'hsl(225, 75%, 16%)', // the world in love's deep sapphire twilight
  envy: 'hsl(110, 100%, 46%)', // the gate: piercing laser green
  rage: 'hsl(0, 100%, 48%)', // consumed cells: pure spectral ruby red
  heroRage: 'hsl(0, 100%, 60%)', // the hero, hunting in searing crimson flame
  ember: 'hsl(14, 95%, 22%)', // aftermath: deep glowing coal embers
  drain: 'hsl(245, 60%, 20%)', // color leaving: fading twilight indigo
  lastEmber: 'hsl(18, 100%, 52%)', // the final light: tungsten orange ember
  memory: 'hsl(335, 95%, 64%)', // where she was: glowing tender rose petal

  // Development: symmetric anthem rainbow — pure spectral wavelengths:
  // Gold (46) -> Emerald (135) -> Cyan (185) -> Cobalt (220) -> Violet (275)
  rowStripe: (dist) => {
    const hues = [46, 135, 185, 220, 275];
    const lightness = dist === 0 ? 62 : 52;
    return `hsl(${hues[Math.min(dist, 4)]}, 100%, ${lightness}%)`;
  },

  // Acceptance: celestial violet wash (radiant, NOT muddy gray/beige)
  peace: (ring) => `hsl(${258 + ring * 5}, 85%, ${58 + ring * 2}%)`,

  // The hero heals on his walk home down col 4: ruby -> vermilion -> fire amber -> golden amber -> sun gold
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

  // Rebirth: when death ends, the opera begins again.
  loop: true,

  sound: {
    enabled: true,
    volume: 0.85,
    delayTime: 0.24,
    delayFeedback: 0.32,
    // Spatial sound: maps horizontal grid column (-1.0 left to +1.0 right)
    // so sound moves across stereo headphones as the dot moves across the stage.
    spatial: true,
  },

  acts: {
    birth: { start: 0, heartbeats: 3 },

    // The equator row ignites full-width; row-pairs bloom
    // up/down together, each pair a stacked chord tone.
    development: {
      start: 4.4,
      rowGap: 0.55, // seconds between row-pairs
      rowChord: [0, 4, 7, 12, 16], // C E G C E — the anthem
      wander: [
        // the hero's first small journey, camera follows
        [4, 3], [5, 3], [5, 4], [4, 4],
      ],
    },

    // Dusk falls; the beloved appears; they twirl on a 2x2
    // box, always at opposite corners; the camera pushes in.
    love: {
      start: 12.0,
      zoom: 1.07,
      hopGap: 1.1, // seconds per step of the dance
      heroDance: [[4, 4], [5, 4], [5, 5], [4, 5]],
      belovedDance: [[5, 5], [4, 5], [4, 4], [5, 4]],
    },

    // The green gate descends row by row. It takes her at row 4.
    // He flees downward and is cornered in the last row.
    jealousy: {
      start: 19.0,
      gateStep: 0.55, // seconds per row of the gate
      belovedCell: [5, 4],
      heroFlee: [[4, 6], [4, 7], [4, 8]],
    },

    // He turns and hunts upward, eating the gate. Direction
    // reversal = narrative reversal.
    revenge: {
      start: 25.0,
      zoom: 0.94,
      hopGap: 0.38,
      huntPath: [
        [5, 7], [3, 6], [6, 6], [2, 5], [7, 5], [1, 4],
        [4, 4], [7, 4], [2, 3], [5, 2], [3, 1], [4, 0],
      ],
    },

    // He walks home step-by-step from (4, 0) to (4, 4), healing as he goes.
    // Peace floods outward from where he rests. IV–I, twice.
    acceptance: {
      start: 31.8,
      zoom: 1.0,
      peaceSpread: 0.32, // seconds per ring of calm
      homePath: [[4, 1], [4, 2], [4, 3], [4, 4]],
      memoryCell: [5, 4],
      chordGap: 2.2,
    },

    // Rot spreads from random edge seeds + noise: every death
    // is unique. Color drains, then the dots go. He is last.
    death: {
      start: 41.5,
      spread: 0.4, // seconds per BFS ring of decay
      texture: 1.4, // noise jitter in seconds
      noteEvery: 3, // score only every Nth fading dot
    },
  },
};
