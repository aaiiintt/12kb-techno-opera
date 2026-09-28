/* HELLO, the arcade's kit demo. Proves the toolchain, not art.
   A 9x9 grid of discs on black. A gold hero at the centre. Arrows, WASD or a
   tap on a cell hop the hero one cell; each hop sings a note of the scale
   and sends a ring of colour out across the grid. Bloom makes the discs
   glow. Everything is drawn with LittleJS shapes: no images, no audio files. */

'use strict';

setShowSplashScreen(false);
setSoundVolume(.4);
setCanvasClearColor(BLACK);

const GRID = 9;                       // cells per side
const HALF = (GRID - 1) / 2;
const scale = [0, 2, 4, 7, 9, 12, 14, 16]; // pentatonic, two octaves
const pluck = new Sound([.6, 0, 220, .01, .2, .35, , 1.4, , , , , , , , , , .55, .06]);

let hero, held = false, hops = 0;
const rings = [];                     // {c, r, t0, hue}

function gameInit() {
  postProcessBloom(.4, 1.2, 8);
  hero = vec2(0, 0);
  cameraPos = vec2(0, 0);
}

function hop(d) {
  const to = hero.add(d);
  if (abs(to.x) > HALF || abs(to.y) > HALF) return;
  hero = to;
  pluck.playNote(scale[hops++ % scale.length], undefined, .8);
  rings.push({ c: hero.copy(), t0: time, hue: (hops * .11) % 1 });
}

function gameUpdate() {
  // one hop per key press: keyDirection() is held state, so edge-detect it
  const d = keyDirection();
  if (d.x || d.y) {
    if (!held) hop(vec2(sign(d.x), d.x ? 0 : sign(d.y)));
    held = true;
  } else held = false;

  // tap or click: step one cell toward the pointer
  if (mouseWasPressed(0)) {
    const dx = mousePos.x - hero.x, dy = mousePos.y - hero.y;
    if (abs(dx) > .5 || abs(dy) > .5)
      hop(abs(dx) > abs(dy) ? vec2(sign(dx), 0) : vec2(0, sign(dy)));
  }

  // rings live for two seconds
  while (rings.length && time - rings[0].t0 > 2) rings.shift();
}

function gameUpdatePost() {
  // fit the whole grid whatever the screen shape
  setCameraScale(min(mainCanvasSize.x, mainCanvasSize.y) / (GRID + 1.5));
}

function gameRender() {
  for (let x = -HALF; x <= HALF; x++)
    for (let y = -HALF; y <= HALF; y++) {
      const p = vec2(x, y);
      let color = hsl(0, 0, .06);      // unlit disc: a bulb behind a diffuser, off
      for (const r of rings) {
        const age = time - r.t0;
        const radius = age * 6;        // cells per second
        const dist = p.distance(r.c);
        const hit = 1 - abs(dist - radius) / 1.2;
        if (hit > 0) color = color.lerp(hsl(r.hue, .9, .55), hit * (1 - age / 2));
      }
      if (x == hero.x && y == hero.y) color = hsl(.12, 1, .6); // gold
      drawCircle(p, .72, color);
    }
}

function gameRenderPost() {
  drawTextScreen('HELLO', vec2(mainCanvasSize.x / 2, 28), 18, hsl(0, 0, .5), 0, BLACK, 'center', 'monospace');
}

engineInit(gameInit, gameUpdate, gameUpdatePost, gameRender, gameRenderPost);
