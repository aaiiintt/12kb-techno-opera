/* Level 1 as plates: the bedroom built from generated Bitmap-style plates at full resolution,
   layered with parallax, Gaz's walk frames cut from the sheet, Mum crossing the landing behind
   the door, a dialogue panel in front of everything. Arrows or hold a finger to walk. */

'use strict';

const STAGE_W = 768, STAGE_H = 512;        // the plates at half size
const ROOM_W = 1040;                        // the room is wider than the screen, so the camera pans
const FLOOR_Y = 72;                         // where feet are
const IMAGES = ['../gaz/plates/wall.png', '../gaz/plates/props-2.png', '../gaz/plates/objects-0.png', '../gaz/plates/objects-1.png', '../gaz/plates/objects-2.png',
  '../gaz/plates/objects-3.png', '../gaz/plates/objects-4.png', '../gaz/plates/objects-5.png', '../gaz/plates/props-1.png', '../gaz/plates/props-0.png',
  '../gaz/plates/panels-0.png', '../gaz/plates/panels-1.png', '../gaz/plates/cast-1.png',
  '../gaz/plates/gaz-0.png', '../gaz/plates/gaz-1.png', '../gaz/plates/gaz-2.png', '../gaz/plates/gaz-3.png', '../gaz/plates/gaz-4.png', '../gaz/plates/gaz-5.png'];
const T = { wall: 0, carpet: 1, bed: 2, wardrobe: 3, radio: 4, chair: 5, lamp: 6, trainers: 7, door: 8, bedpost: 9, panelMum: 10, panelGaz: 11, cast: 12, gaz: 13 };

// a whole texture (or a sub-rect of it) as a tile
const whole = (i) => { const t = textureInfos[i]; return new TileInfo(vec2(0, 0), t.size, t); };
const part = (i, x, y, w, h) => new TileInfo(vec2(x, y), vec2(w, h), textureInfos[i]);
// draw a plate with its bottom-left at (x, y) in world pixels, at scale s, shifted by the camera times a parallax factor
let camX = STAGE_W / 2;
const plate = (ti, x, y, s, par = 1, color = WHITE, mirror = false) => {
  const w = ti.size.x * s, h = ti.size.y * s;
  const px = x - (camX - STAGE_W / 2) * (par - 1);   // objects on the player's plane (par 1) move with the world; nearer move more, farther less
  drawTile(vec2(px + w / 2, y + h / 2), vec2(w, h), ti, color, 0, mirror);
};

const G = { x: 300, facing: 1, walking: false, t: 0, panel: null, panelT: 0, fails: 0, done: false, doneT: 0 };
const MUM = { y: 0, dir: 1, wait: 2.5, vis: false, creakAt: -9 };
let light, mumLight, lampLight, windowLight;

function gameInit() {
  setCanvasFixedSize(vec2(STAGE_W, STAGE_H));
  setCanvasPixelated(true); setTilesPixelated(true); setTileDefaultBleed(0);
  setCameraScale(1); setCameraPos(vec2(STAGE_W / 2, STAGE_H / 2));
  setShowSplashScreen(false); setTouchGamepadEnable(false); setInputWASDEmulateDirection(true);
  // light: a dim room, a warm lamp, sodium through the window, the landing light through the door
  new LightSystemPlugin(undefined, rgb(0.42, 0.40, 0.5));
  lampLight = new Light(vec2(0, 0), 260, rgb(1, 0.85, 0.55, 0.9), 220);
  windowLight = new Light(vec2(0, 0), 420, rgb(1, 0.6, 0.25, 0.55), 380);
  mumLight = new Light(vec2(0, 0), 300, rgb(1, 0.95, 0.75, 0.0), 260);
}

function gameUpdate() {
  G.t += timeDelta;
  if (G.panel) { G.panelT += timeDelta; if (G.panelT > 2.2 && (mouseWasPressed(0) || keyWasPressed('Space') || G.panelT > 4.5)) { if (G.done) return; G.panel = null; G.x = 300; } return; }
  if (G.done) return;
  // input: arrows, or hold a finger where you want him to go
  let dx = keyDirection().x;
  if (!dx && mouseIsDown(0)) { const ox = mousePos.x - G.x; if (Math.abs(ox) > 12) dx = Math.sign(ox); }
  G.walking = !!dx;
  if (dx) { G.facing = Math.sign(dx); G.x = clamp(G.x + dx * 170 * timeDelta, 120, ROOM_W - 60); }
  // Mum crosses the landing, seen through the door gap, with a wait at each end and a creak before she comes out
  if (MUM.wait > 0) { MUM.wait -= timeDelta; MUM.vis = false; if (MUM.wait < 0.7 && MUM.creakAt < G.t - 3) MUM.creakAt = G.t; }
  else { MUM.vis = true; MUM.y += MUM.dir * 90 * timeDelta; if (MUM.y > 260 || MUM.y < 0) { MUM.dir *= -1; MUM.wait = 3.4; } }
  // the door is at the right; reaching it while she is on the landing is being seen
  if (G.x > ROOM_W - 150) {
    if (MUM.vis) { G.panel = 'mum'; G.panelT = 0; G.fails++; G.line = ['GAZ?', 'WHERE ARE YOU GOING?', 'IS THAT MY TOP?', "IT'S HALF SEVEN."][G.fails % 4]; }
    else { G.panel = 'gaz'; G.panelT = 0; G.done = true; G.line = 'HE SHUTS THE DOOR QUIETLY. TOO QUIETLY.'; }
  }
  // camera follows him, loosely
  camX = lerp(camX, clamp(G.x, STAGE_W / 2, ROOM_W - STAGE_W / 2), 0.08);
  setCameraPos(vec2(camX, STAGE_H / 2));
  // lights follow their things
  lampLight.pos = vec2(640 - (camX - STAGE_W / 2) * (0.92 - 1), 150);
  windowLight.pos = vec2(520 - (camX - STAGE_W / 2) * (0.6 - 1), 420);
  mumLight.pos = vec2(ROOM_W - 60, 120); mumLight.color = rgb(1, 0.95, 0.75, MUM.vis ? 0.55 : MUM.wait < 0.7 ? 0.3 : 0.08);
}
function gameUpdatePost() {}

function gameRender() {
  // far: the wall at 0.6 scale, parallax 0.6
  plate(whole(T.wall), -80, 0, 0.6, 0.6);
  // the landing seen through the door: Mum crossing (parallax 0.85), then the door in front of her
  plate(whole(T.door), ROOM_W - 300, FLOOR_Y - 10, 0.5, 0.9);
  // Mum in the doorway: she comes along the landing toward the door and goes back, so she grows and shrinks and fades at the ends
  if (MUM.vis) { const k = MUM.y / 260, near = Math.sin(k * PI); plate(part(T.cast, 268, 0, 232, 856), ROOM_W - 250 - near * 10, FLOOR_Y + 10 - near * 6, 0.2 + near * 0.06, 0.9, rgb(1, 1, 1, Math.min(1, near * 3)), MUM.dir < 0); }
  // the carpet, tiled along the floor on the player's plane
  const carpet = whole(T.carpet);
  for (let i = 0; i < 4; i++) plate(carpet, i * 354 - 40, -14, 0.5, 1);
  // furniture against the wall, slightly behind the player's plane
  plate(whole(T.wardrobe), 60, FLOOR_Y - 6, 0.5, 0.92);
  plate(whole(T.bed), 150, FLOOR_Y - 20, 0.5, 0.96);
  plate(whole(T.lamp), 625, FLOOR_Y - 4, 0.5, 0.94);
  plate(whole(T.chair), 700, FLOOR_Y - 8, 0.5, 0.95);
  plate(whole(T.radio), 470, FLOOR_Y - 12, 0.45, 0.99);
  plate(whole(T.trainers), 380, FLOOR_Y - 14, 0.45, 1);
  // Gaz: the stand frame or the five walk frames, bottom-centred on his x
  const f = G.walking ? 1 + Math.floor(G.t * 9) % 5 : 0;
  const ti = whole(T.gaz + f), s = 0.42, w = ti.size.x * s, h = ti.size.y * s;
  drawTile(vec2(G.x, FLOOR_Y + h / 2), vec2(w, h), ti, WHITE, 0, G.facing < 0);
  // near: the end of the bed in front of the camera, darker, parallax 1.35
  plate(whole(T.bedpost), -60, FLOOR_Y - 60, 0.62, 1.22, rgb(0.5, 0.5, 0.58));
}

function gameRenderPost() {
  // the dialogue panel in front of everything, in screen space, with the line typed
  if (!G.panel) { if (G.t < 3) { const k = Math.min(1, G.t); drawRect(vec2(STAGE_W / 2, 22), vec2(STAGE_W, 44), rgb(0, 0, 0, 1), 0, false, true); drawTextScreen('SATURDAY, 7PM. MUM THINKS HE IS STAYING IN.'.slice(0, Math.floor(G.t * 30)), vec2(STAGE_W / 2, STAGE_H - 22), 18, WHITE, 0, undefined, 'center', 'monospace'); } return; }
  const ti = whole(G.panel === 'mum' ? T.panelMum : T.panelGaz), s = 0.5, w = ti.size.x * s, h = ti.size.y * s;
  const y = STAGE_H - h / 2 - 8 - Math.max(0, 1 - G.panelT * 4) * 60;
  drawTile(vec2(STAGE_W / 2, y), vec2(w, h), ti, WHITE, 0, false, undefined, false, true);
  const n = Math.floor(G.panelT * 28), shown = G.line.slice(0, n);
  // wrap into the dark area: about 30 characters a line at this size
  const words = shown.split(' '), lines = ['']; for (const wd of words) { if ((lines[lines.length - 1] + ' ' + wd).trim().length > 30) lines.push(wd); else lines[lines.length - 1] = (lines[lines.length - 1] + ' ' + wd).trim(); }
  lines.forEach((l, i) => drawTextScreen(l, vec2(STAGE_W / 2 - 112, y - 14 + i * 26), 22, rgb(0.95, 0.9, 0.8), 0, undefined, 'left', 'monospace'));
  if (G.panelT > 2.2 && !G.done && Math.floor(G.panelT * 2) % 2) drawTextScreen('TAP', vec2(STAGE_W - 40, y + 50), 14, rgb(0.8, 0.8, 0.8), 0, undefined, 'right', 'monospace');
}

engineInit(gameInit, gameUpdate, gameUpdatePost, gameRender, gameRenderPost, IMAGES);
