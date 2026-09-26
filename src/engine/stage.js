/* Stage: an edge-to-edge grid of cells at the house pitch. The centre SIZE by
   SIZE block is the stage (stage coordinates 0..SIZE-1, unchanged); outer
   cells fill the rest of the screen and rest at dusk. Actors are cells, not
   floating dots: an actor's light lives on O.at(actor.col, actor.row).el.
   The grid never drifts; it only ever rebuilds whole, on load or resize. */
let SIZE = 9, CENTER = 4;
let OCOLS = 0, OROWS = 0, offCol = 0, offRow = 0;
let dots = [], gridEl, worldEl, _cell = 0;

// col/row are stage coordinates (0..SIZE-1 addresses the stage; anything
// else reaches an outer cell, as far as the built grid extends).
O.at = (col, row) => {
  const c = col + offCol, r = row + offRow;
  if (c < 0 || c >= OCOLS || r < 0 || r >= OROWS) return undefined;
  return dots[r * OCOLS + c];
};
O.every = (fn) => dots.forEach(fn);
O.stageCells = () => dots.filter((d) => d.col >= offCol && d.col < offCol + SIZE && d.row >= offRow && d.row < offRow + SIZE);

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
  el.style.setProperty('--h', L[0]);
  el.style.setProperty('--cmax', L[1]);
  el.style.setProperty('--lmax', L[2]);
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

O.pan = (actor) => (actor.col - CENTER) / CENTER;

// the camera cuts almost always; when it moves it moves once, deliberately.
// The stage sits exactly centred in the outer grid, so the pixel maths are
// unchanged by how far the grid now reaches past it.
O.camera = (tl, time, o = {}) => {
  const { col = CENTER, row = CENTER, zoom = 1, dur = 1.6, ease = 'power2.inOut', actor } = o;
  // An actor target is read when the move plays, not when the score is
  // built, so the camera finds the actor wherever its hops have taken it.
  tl.to(worldEl, {
    x: () => (CENTER - (actor ? actor.col : col)) * cellSize() * zoom,
    y: () => (CENTER - (actor ? actor.row : row)) * cellSize() * zoom,
    scale: zoom,
    duration: dur,
    ease,
  }, time);
};

// ---- actors: a logical binding of {col,row,light} to whichever cell they
// currently occupy. No floating element; O.at(actor.col,actor.row).el is
// always the actor's disc. pilotEls holds every cell currently claimed by an
// actor, so it rests at the pilot level instead of true dusk. ----
function claim(actor, cellObj) {
  pilotEls.add(cellObj.el);
  cellObj.el._occ = actor.id;
  O.light(cellObj.el, actor.light);
}

// The cell an actor just left cools like an ember: it keeps the actor's own
// hue while its pilot brightness fades over ~0.4s, then rests at dusk.
function coolCell(cellObj, actor, tl, time) {
  const el = cellObj.el;
  if (el._occ !== actor.id) return; // someone else has since claimed it
  el._occ = null;
  pilotEls.delete(el);
  const start = ctx.currentTime;
  O.registerLight(el, start, start + 0.4, (t) => Math.max(0, 0.3 * (1 - t / 0.4)));
  tl.call(() => { if (!el._occ) O.light(el, 'bulb'); }, [], time + 0.4);
}

function buildActors() {
  O.actors = {};
  for (const id in O.opera.cast) {
    const c = O.opera.cast[id];
    const actor = { id, col: CENTER, row: CENTER, light: c.color, size: c.size || 1, voice: c.voice, lastSemi: null };
    O.actors[id] = actor;
    const cell = O.at(CENTER, CENTER);
    if (cell) claim(actor, cell);
  }
}

// Relight the actor's cell to cell, on the beat: the destination cell pops
// in scale as the light arrives; the cell it left cools behind it.
O.move = (actor, col, row, tl, time, dur = 0.6, ease = 'elastic.out(1,0.5)', pop = 1.25, settle = true) => {
  const to = O.at(col, row);
  if (to) {
    if (settle) tl.to(to.el, { scale: pop, duration: dur / 2, yoyo: true, repeat: 1, ease }, time);
    else tl.to(to.el, { scale: pop, duration: dur, ease }, time);
  }
  tl.call(() => {
    const from = O.at(actor.col, actor.row);
    if (from && from !== to) coolCell(from, actor, tl, time);
    actor.col = col; actor.row = row;
    if (to) claim(actor, to);
  }, [], time);
};

// the original cue: a typed lower third, letterboxed in, held, cleared. The
// only type this stage shows.
let cueEl;
O.cue = (tl, time, text, hold = 1.6) => {
  cueEl = cueEl || document.getElementById('cue');
  const len = Math.max(4, text.length);
  tl.call(() => {
    cueEl.textContent = text;
    cueEl.style.visibility = 'visible';
    cueEl.getAnimations().forEach((a) => a.cancel());
    cueEl.animate({ clipPath: ['inset(0 100% 0 0)', 'inset(0 0 0 0)'] }, { duration: len * 55, easing: `steps(${len})`, fill: 'forwards' });
  }, [], time);
  tl.call(() => {
    if (cueEl.textContent !== text) return;
    cueEl.getAnimations().forEach((a) => a.cancel());
    cueEl.style.visibility = 'hidden';
  }, [], time + len * 0.055 + hold);
};

// On resize or full screen, rebuild the whole grid to cover the new
// viewport, then re-assert every actor's pilot light on its stage cell.
function reassertActors() {
  for (const id in O.actors || {}) {
    const a = O.actors[id], c = O.at(a.col, a.row);
    if (c) claim(a, c);
  }
}
addEventListener('resize', () => { sizeGrid(); reassertActors(); });
addEventListener('fullscreenchange', () => { sizeGrid(); reassertActors(); });
