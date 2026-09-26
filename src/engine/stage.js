/* Stage: the chorus grid (5-13 dots/side), actor dots, camera, cue, label,
   speech, titleCard, plus the stage properties and energy curve. */
let SIZE = 9, CENTER = 4;
let dots = [], gridEl, worldEl, driftEl, breatheEl, _cell = 0;

O.at = (col, row) => dots[row * SIZE + col];
O.every = (fn) => dots.forEach(fn);

function fillGrid() {
  gridEl.style.gridTemplateColumns = `repeat(${SIZE},var(--dot-size))`;
  gridEl.style.gridTemplateRows = `repeat(${SIZE},var(--dot-size))`;
  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      const el = document.createElement('div');
      el.className = 'dot';
      el.style.gridColumn = col + 1;
      el.style.gridRow = row + 1;
      gridEl.appendChild(el);
      dots.push({ el, col, row });
    }
  }
  _cell = 0;
}

function buildGrid() {
  gridEl = document.getElementById('grid');
  worldEl = document.getElementById('world');
  driftEl = document.getElementById('drift');
  breatheEl = document.getElementById('breathe');
  fillGrid();
}

// ---- stage properties: bg, grid (density), dot (base scale), gap ----
O.applyStage = (o = {}) => {
  const { bg, grid, dot, gap } = o;
  if (bg != null) document.body.style.background = bg;
  if (grid != null && grid !== SIZE) {
    dots.forEach((d) => d.el.remove());
    dots = [];
    SIZE = grid; CENTER = (SIZE - 1) / 2;
    fillGrid();
  }
  if (dot != null) document.documentElement.style.setProperty('--dot-scale', dot);
  if (gap != null) document.documentElement.style.setProperty('--gap-ratio', gap);
};
O.transitionBg = (bg, dur) => {
  document.body.style.transition = `background ${dur}s`;
  document.body.style.background = bg;
};

// ---- energy curve: derived every frame from a target level 0-10 ----
let eLevel = 3, eFrom = 3, eTo = 3, eStart = 0, eDur = 0;
O.energy = (level, dur = 1, t = 0) => { eFrom = eLevel; eTo = level; eStart = t; eDur = dur; };
O.onFrame = (t) => {
  if (!breatheEl) return;
  const p = eDur > 0 ? Math.min(1, (t - eStart) / eDur) : 1;
  eLevel = eFrom + (eTo - eFrom) * p;
  const lv = eLevel / 10;
  let scale = 1 + Math.sin(t * (0.3 + lv * 1.2) * PI2) * lv * 0.12;
  if (eLevel >= 6 && O.opera) {
    const ph = (t % (60 / O.opera.tempo)) / (60 / O.opera.tempo);
    scale *= 1 + Math.pow(1 - ph, 8) * 0.18;
  }
  breatheEl.style.transform = `scale(${scale})`;
  breatheEl.style.opacity = 0.12 + lv * 0.88;
  const w = innerWidth * 0.008 * lv;
  driftEl.style.transform = `translate(${Math.sin(t * 0.06) * w}px,${Math.cos(t * 0.045) * w * 0.6}px) scale(${1 + Math.sin(t * 0.04) * lv * 0.06})`;
};

function cellSize() {
  if (!_cell) {
    const d = gridEl.querySelector('.dot');
    _cell = d.offsetWidth + parseFloat(getComputedStyle(gridEl).columnGap);
  }
  return _cell;
}

O.cell = (col, row) => ({ x: col * cellSize(), y: row * cellSize() });
O.pan = (actor) => (actor.col - CENTER) / CENTER;

O.camera = (tl, time, o = {}) => {
  const { col = CENTER, row = CENTER, zoom = 1, dur = 1.6, ease = 'power2.inOut' } = o;
  tl.to(worldEl, {
    x: () => (CENTER - col) * cellSize() * zoom,
    y: () => (CENTER - row) * cellSize() * zoom,
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
    el.style.setProperty('--dot-color', c.color);
    el.style.opacity = 0;
    el.style.transform = 'scale(0)';
    gridEl.appendChild(el);
    O.actors[id] = { id, el, col: CENTER, row: CENTER, color: c.color, size: c.size || 1, voice: c.voice, lastSemi: null };
  }
}

O.move = (actor, col, row, tl, time, dur = 0.6, ease = 'power2.inOut') => {
  const p = O.cell(col, row);
  tl.to(actor.el, { x: p.x, y: p.y, duration: dur, ease }, time);
  tl.call(() => { actor.col = col; actor.row = row; }, [], time + dur);
};

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

// shared positioned-div factory for the two text-on-actor gestures: each
// keeps one reused div, positions it off the actor's cell by dx cells, and
// shows it for `hold` seconds.
function textDiv(cls, dx) {
  let el;
  return (tl, time, actor, text, hold) => {
    if (!el) { el = document.createElement('div'); el.className = cls; gridEl.appendChild(el); }
    tl.call(() => {
      el.textContent = text;
      const p = O.cell(actor.col, actor.row);
      el.style.transform = `translate(${p.x + cellSize() * dx}px,${p.y}px)`;
      el.style.opacity = 1;
    }, [], time);
    tl.call(() => { el.style.opacity = 0; }, [], time + hold);
  };
}
const _label = textDiv('label', 0.75);
const _speech = textDiv('speech', 0.5);
O.label = (tl, time, actor, text, dur = 0.4) => _label(tl, time, actor, text, dur + 1);
O.speech = (tl, time, actor, text, hold = 1) => _speech(tl, time, actor, text, hold);

// full-screen cue for titleCard: one reused div, centred, sized in vh.
let titleEl;
O.titleCard = (tl, time, text, size, hold, color) => {
  if (!titleEl) { titleEl = document.createElement('div'); titleEl.className = 'titlecard'; document.body.appendChild(titleEl); }
  tl.call(() => {
    titleEl.textContent = text;
    titleEl.style.color = color;
    titleEl.style.fontSize = size + 'vh';
    titleEl.style.opacity = 1;
  }, [], time);
  tl.call(() => { titleEl.style.opacity = 0; }, [], time + hold);
};
