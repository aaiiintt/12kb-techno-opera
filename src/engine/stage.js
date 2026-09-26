/* Stage: the chorus grid (5-13 dots/side), actor dots, camera, cue, and the
   eight-light palette. The grid is fixed once at load; it never resizes,
   drifts or breathes after that. The camera cuts; it never pans on its own. */
let SIZE = 9, CENTER = 4;
let dots = [], gridEl, worldEl, _cell = 0;

O.at = (col, row) => dots[row * SIZE + col];
O.every = (fn) => dots.forEach(fn);

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

function fillGrid() {
  gridEl.style.gridTemplateColumns = `repeat(${SIZE},var(--dot-size))`;
  gridEl.style.gridTemplateRows = `repeat(${SIZE},var(--dot-size))`;
  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      const el = document.createElement('div');
      el.className = 'dot';
      el.style.gridColumn = col + 1;
      el.style.gridRow = row + 1;
      O.light(el, 'bulb');
      gridEl.appendChild(el);
      dots.push({ el, col, row });
    }
  }
  _cell = 0;
}

function buildGrid() {
  gridEl = document.getElementById('grid');
  worldEl = document.getElementById('world');
  fillGrid();
}

// grid size/dot-scale/gap are set once, at load, from O.opera.stage. Never
// called again mid-piece.
O.applyStage = (o = {}) => {
  const { grid, dot, gap } = o;
  if (grid != null && grid !== SIZE) {
    dots.forEach((d) => d.el.remove());
    dots = [];
    SIZE = grid; CENTER = (SIZE - 1) / 2;
    fillGrid();
  }
  if (dot != null) document.documentElement.style.setProperty('--dot-scale', dot);
  if (gap != null) document.documentElement.style.setProperty('--gap-ratio', gap);
};

function cellSize() {
  if (!_cell) {
    // Exact, unrounded and untransformed: computed width plus gap. Rounded
    // offsetWidth drifted actors off their cells by a pixel or two per column.
    const d = gridEl.querySelector('.dot');
    _cell = parseFloat(getComputedStyle(d).width) + parseFloat(getComputedStyle(gridEl).columnGap);
  }
  return _cell;
}

O.cell = (col, row) => ({ x: col * cellSize(), y: row * cellSize() });
O.pan = (actor) => (actor.col - CENTER) / CENTER;

// the camera cuts almost always; when it moves it moves once, deliberately.
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

function buildActors() {
  O.actors = {};
  for (const id in O.opera.cast) {
    const c = O.opera.cast[id];
    const el = document.createElement('div');
    el.className = 'dot actor';
    O.light(el, c.color);
    gridEl.appendChild(el);
    O.actors[id] = { id, el, col: CENTER, row: CENTER, light: c.color, size: c.size || 1, voice: c.voice, lastSemi: null };
    // Draw it where it logically is: the centre cell, not cell zero.
    const p0 = O.cell(CENTER, CENTER);
    gsap.timeline().set(el, { x: p0.x, y: p0.y }, 0);
  }
}

O.move = (actor, col, row, tl, time, dur = 0.6, ease = 'power2.inOut') => {
  tl.to(actor.el, { x: () => O.cell(col, row).x, y: () => O.cell(col, row).y, duration: dur, ease }, time);
  tl.call(() => { actor.col = col; actor.row = row; }, [], time + dur);
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

// On resize or full screen, re-measure and put every actor back on its cell.
addEventListener('resize', () => {
  _cell = 0;
  for (const id in O.actors || {}) {
    const a = O.actors[id], p = O.cell(a.col, a.row);
    gsap.timeline().set(a.el, { x: p.x, y: p.y }, 0);
  }
});
