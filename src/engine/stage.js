/* Stage: an edge-to-edge grid of cells at the house pitch. The centre SIZE by
   SIZE block is the stage (stage coordinates 0..SIZE-1, unchanged); outer
   cells fill the rest of the screen and rest at dusk. O.at(col, row) returns
   the cell element itself; a character's light is O.pilot'd onto whichever
   cell it occupies, and O.hop moves that pilot claim, cell to cell.
   The grid never drifts; it only ever rebuilds whole, on load or resize. */
let SIZE = 9, CENTER = 4;
let OCOLS = 0, OROWS = 0, offCol = 0, offRow = 0;
let dots = [], gridEl, worldEl, _cell = 0;

// col/row are stage coordinates (0..SIZE-1 addresses the stage; anything
// else reaches an outer cell, as far as the built grid extends).
O.at = (col, row) => {
  const c = col + offCol, r = row + offRow;
  if (c < 0 || c >= OCOLS || r < 0 || r >= OROWS) return undefined;
  const d = dots[r * OCOLS + c];
  return d && d.el;
};
O.every = (fn) => dots.forEach(fn);
O.stageCells = () => dots.filter((d) => d.col >= offCol && d.col < offCol + SIZE && d.row >= offRow && d.row < offRow + SIZE);
O.cells = () => dots.map((d) => d.el);
O.stage = () => O.stageCells().map((d) => d.el);
O.size = () => SIZE;
O.centre = () => CENTER;

// ---- the eight lights: H, Cmax, Lmax. Named, never hex. ----
O.P = {
  bulb: [85, 0.03, 0.94],
  gold: [80, 0.16, 0.80],
  sakura: [350, 0.14, 0.80],
  coral: [30, 0.18, 0.74],
  lemon: [105, 0.17, 0.92],
  mint: [160, 0.13, 0.84],
  sky: [245, 0.15, 0.74],
  violet: [295, 0.17, 0.72],
};
O.light = (el, name) => {
  const L = O.P[name];
  if (el._l !== name) { el._was = el._l; el._l = name; }   // remember the last light, so a vacated cell can go back to it
  el.style.setProperty('--h', L[0]);
  el.style.setProperty('--cmax', L[1]);
  el.style.setProperty('--lmax', L[2]);
};

// ---- an opera may declare its own lights (O.opera.lights = { name: cssColour }),
// staged for that story rather than picked from the fixed eight. Each is
// converted to OKLCH once at load and registered into O.P by name, so
// k.paint/pilot/note light it exactly like a built-in: brightness via L,
// chroma falling with L, halos in its own hue. No dependency - a browser
// <div> resolves any CSS colour string to rgb(), then a few lines of the
// standard sRGB -> OKLab -> OKLCH maths (Björn Ottosson's public formulas)
// take it from there. Lmax for a declared light is its own L. ----
function cssToRgb01(css) {
  const d = document.createElement('div');
  d.style.color = css;
  document.body.appendChild(d);
  const m = getComputedStyle(d).color.match(/[\d.]+/g) || [0, 0, 0];
  document.body.removeChild(d);
  return [m[0] / 255, m[1] / 255, m[2] / 255];
}
const toLinear = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
function oklch(css) {
  const [r0, g0, b0] = cssToRgb01(css).map(toLinear);
  const l = 0.4122214708 * r0 + 0.5363325363 * g0 + 0.0514459929 * b0;
  const m = 0.2119034982 * r0 + 0.6806995451 * g0 + 0.1073969566 * b0;
  const s = 0.0883024619 * r0 + 0.2817188376 * g0 + 0.6299787005 * b0;
  const l_ = Math.cbrt(l), m_ = Math.cbrt(m), s_ = Math.cbrt(s);
  const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
  const b = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;
  const C = Math.hypot(a, b);
  let H = (Math.atan2(b, a) * 180) / Math.PI;
  if (H < 0) H += 360;
  return [H, C, L];
}
O.declareLights = (lights) => {
  for (const name in lights || {}) O.P[name] = oklch(lights[name]);
};

// the stage background: black, or one light at low L, cut with no transition.
O.bg = (name) => {
  if (!name) { document.body.style.background = '#000'; return; }
  const L = O.P[name];
  document.body.style.background = `oklch(18% ${(L[1] * 0.25).toFixed(3)} ${L[0]})`;
};

function cellSize() {
  if (!_cell && dots.length) {
    // Exact, unrounded and untransformed: computed width plus gap. Rounded
    // offsetWidth drifted things off their cells by a pixel or two per column.
    const d = dots[0].el;
    _cell = parseFloat(getComputedStyle(d).width) + parseFloat(getComputedStyle(gridEl).columnGap);
  }
  return _cell;
}

// Rebuild the whole grid at cols x rows outer cells, offset so the centre
// SIZE x SIZE block is exactly the stage. Every actor's pilot light is lost
// here (its cell is destroyed); callers re-assert it.
function buildDots(cols, rows) {
  dots.forEach((d) => d.el.remove());
  dots = [];
  pilotEls.clear();
  OCOLS = cols; OROWS = rows;
  offCol = (OCOLS - SIZE) / 2; offRow = (OROWS - SIZE) / 2;
  gridEl.style.gridTemplateColumns = `repeat(${OCOLS},var(--dot-size))`;
  gridEl.style.gridTemplateRows = `repeat(${OROWS},var(--dot-size))`;
  const frag = document.createDocumentFragment();
  for (let row = 0; row < OROWS; row++) {
    for (let col = 0; col < OCOLS; col++) {
      const el = document.createElement('div');
      el.className = 'dot';
      el.style.gridColumn = col + 1;
      el.style.gridRow = row + 1;
      O.light(el, 'bulb');
      frag.appendChild(el);
      dots.push({ el, col, row });
    }
  }
  gridEl.appendChild(frag);
  _cell = 0;
}

// Size the outer grid to cover the viewport at the house pitch, at any
// aspect ratio, keeping the same parity as SIZE so the stage lands exactly
// centred on whole cells.
function sizeGrid() {
  if (!dots.length) buildDots(SIZE, SIZE); // seed, to measure the house pitch
  const cs = cellSize();
  let cols = Math.max(SIZE, Math.ceil(innerWidth / cs) + 1);
  let rows = Math.max(SIZE, Math.ceil(innerHeight / cs) + 1);
  if ((cols - SIZE) % 2) cols++;
  if ((rows - SIZE) % 2) rows++;
  if (cols !== OCOLS || rows !== OROWS) buildDots(cols, rows);
}

function buildGrid() {
  gridEl = document.getElementById('grid');
  worldEl = document.getElementById('world');
  sizeGrid();
}

// grid size is set once per opera load, from O.opera.stage; dot-scale/gap
// may also change. Never called again mid-piece.
O.applyStage = (o = {}) => {
  const { grid, dot, gap } = o;
  if (grid != null && grid !== SIZE) {
    dots.forEach((d) => d.el.remove());
    dots = []; OCOLS = OROWS = 0;
    SIZE = grid; CENTER = (SIZE - 1) / 2;
  }
  if (dot != null) document.documentElement.style.setProperty('--dot-scale', dot);
  if (gap != null) document.documentElement.style.setProperty('--gap-ratio', gap);
  sizeGrid();
};

// the camera cuts almost always; when it moves it moves once, deliberately.
// The stage sits exactly centred in the outer grid, so the pixel maths are
// unchanged by how far the grid now reaches past it.
O.camera = (tl, time, o = {}) => {
  const { col = CENTER, row = CENTER, zoom = 1, dur = 1.6, ease = 'power2.inOut' } = o;
  const z = () => (typeof zoom === 'function' ? zoom() : zoom);   // resolved when the move plays
  tl.to(worldEl, {
    x: () => (CENTER - col) * cellSize() * z(),
    y: () => (CENTER - row) * cellSize() * z(),
    scale: z,
    duration: dur,
    ease,
  }, time);
};

O.shake = (tl, time, amount = 6, dur = 0.3) => {
  tl.to(worldEl, { x: '+=' + amount, duration: dur / 6, yoyo: true, repeat: 5 }, time);
};

// ---- pilot light: a cell a character is resting on keeps its own hue at
// a dim, steady level instead of true dusk. pilotEls (from synth.js, which
// also drives the light loop) holds every cell currently claimed this way. ----
O.pilot = (el, name) => {
  if (!el) return;
  if (!name) { pilotEls.delete(el); el._pilot = null; return; } // null clears it
  el._pilot = name;
  pilotEls.add(el);
  startLightLoop();                                 // resting lights show before any sound has played
  O.light(el, name);
};

// The cell a character just left cools like an ember: it keeps its own hue
// while the pilot brightness fades over ~0.4s, then rests at true dusk.
function coolCell(el, tl, time) {
  if (!el || !pilotEls.has(el)) return;
  pilotEls.delete(el);
  el._pilot = null;
  const start = O.now();
  O.registerLight(el, start, start + 0.4, (t) => Math.max(0, 0.3 * (1 - t / 0.4)));
}

// Move a character's pilot light from one cell to another: the destination
// pops in scale (an elastic settle) as the light arrives; the cell it left
// cools behind it, ember-style.
O.hop = (tl, time, from, to, dur = 0.6, ease = 'elastic.out(1,0.5)', pop = 1.25) => {
  if (to) tl.to(to, { scale: pop, duration: dur / 2, yoyo: true, repeat: 1, ease }, time);
  tl.call(() => {
    const name = from && from._pilot;
    if (from && from !== to) coolCell(from, tl, time);
    if (to && name) O.pilot(to, name);
  }, [], time);
  // scheduled now, not from inside the call above, so a step-mode jump fires it in order
  if (from && from !== to) tl.call(() => { if (!pilotEls.has(from)) O.light(from, from._was || 'bulb'); }, [], time + 0.4);
};

// the original cue: a typed lower third, letterboxed in, held, cleared. The
// only type this stage shows.
let cueEl;
// A fresh rebuild (normal loop point, or a step-mode jump to any frame)
// must start from the same cue state a first load would: hidden, no
// leftover reveal animation.
O.resetCue = () => {
  cueEl = cueEl || document.getElementById('cue');
  cueEl.getAnimations().forEach((a) => a.cancel());
  cueEl.style.visibility = 'hidden';
};
O.cue = (tl, time, text, hold = 1.6) => {
  cueEl = cueEl || document.getElementById('cue');
  const len = Math.max(4, text.length);
  tl.call(() => {
    cueEl.textContent = text;
    cueEl.style.visibility = 'visible';
    cueEl.getAnimations().forEach((a) => a.cancel());
    const anim = cueEl.animate({ clipPath: ['inset(0 100% 0 0)', 'inset(0 0 0 0)'] }, { duration: len * 55, easing: `steps(${len})`, fill: 'forwards' });
    // Step mode: this reveal is a native Web Animation, outside the timeline's
    // own clock - freeze it at the frame's own progress instead of real time.
    if (O.step != null) { anim.currentTime = Math.max(0, (tl.t - time) * 1000); anim.pause(); }
  }, [], time);
  tl.call(() => {
    if (cueEl.textContent !== text) return;
    cueEl.getAnimations().forEach((a) => a.cancel());
    cueEl.style.visibility = 'hidden';
  }, [], time + len * 0.055 + hold);
};

// On resize or full screen, rebuild the whole grid to cover the new
// viewport. Every cell's pilot claim is lost with it (the elements
// themselves are destroyed); the opera keeps playing on the new grid.
addEventListener('resize', sizeGrid);
addEventListener('fullscreenchange', sizeGrid);
