/* Pixels: sprites and a font drawn in code, baked once into one texture.
   No image files. A sprite is an array of strings, one row per pixel row,
   top row first, one character per pixel; '.' is transparent and every
   other character looks up a colour in the palette (a CSS hex string). The
   baker packs sprites into a canvas with a 1px gutter and registers it as
   a LittleJS texture, so each sprite is one drawTile quad.

   The pixel canvas: PX.setup(256, 144) fixes the canvas at that size, makes
   the scaling nearest-neighbour, and puts the camera so that one world unit
   is one pixel with the origin at the bottom left (LittleJS world y is up).

   Text: a 3x5 font (capitals, digits, punctuation). PX.text(str, x, y, colour,
   {align:'left'|'center'|'right', scale}) draws it with the baked glyphs. */

'use strict';

const PX = {};
PX.W = 256; PX.H = 144;
PX.SCALE = 1;              // default draw scale for sprites; an opera sets 2 for chunkier characters

const pxSprites = [];      // {rows, palette, w, h, tile}
let pxTexture = null;

PX.setup = (w = 256, h = 144) => {
  PX.W = w; PX.H = h;
  setCanvasFixedSize(vec2(w, h));
  setCanvasPixelRatio(1);
  setCanvasPixelated(true);
  setTilesPixelated(true);
  setTileDefaultBleed(0);
  setCameraPos(vec2(w / 2, h / 2));
  setCameraScale(1);
};

// define a sprite; returns a handle usable before baking (its tile is filled in by bake)
PX.sprite = (rows, palette) => {
  const w = Math.max(...rows.map((r) => r.length)), h = rows.length;
  const s = { rows, palette, w, h, tile: null };
  pxSprites.push(s);
  return s;
};

// pack every sprite into one canvas and register it as a texture
PX.bake = () => {
  const gutter = 1;
  // shelf packing: rows of sprites sorted by height
  const list = pxSprites.filter((s) => !s.tile);
  list.sort((a, b) => b.h - a.h);
  const W = 256;
  let x = gutter, y = gutter, rowH = 0;
  for (const s of list) {
    if (x + s.w + gutter > W) { x = gutter; y += rowH + gutter; rowH = 0; }
    s.x = x; s.y = y;
    x += s.w + gutter;
    rowH = Math.max(rowH, s.h);
  }
  const H = Math.max(1, y + rowH + gutter);
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d');
  for (const s of list)
    s.rows.forEach((row, ry) => {
      for (let rx = 0; rx < row.length; rx++) {
        const ch = row[rx];
        if (ch === '.' || ch === ' ') continue;
        g.fillStyle = s.palette[ch] || '#f0f';
        g.fillRect(s.x + rx, s.y + ry, 1, 1);
      }
    });
  const info = new TextureInfo(c);
  pxTexture = textureInfos.push(info) - 1;
  // TileInfo takes a pixel position; tile(vec2) would treat it as a grid index
  for (const s of list) s.tile = new TileInfo(vec2(s.x, s.y), vec2(s.w, s.h), info);
};

// draw a sprite with its bottom-left corner at (x, y), optional tint, flip and scale
PX.draw = (s, x, y, o = {}) => {
  const k = o.scale || PX.SCALE;
  const w = s.w * k, h = s.h * k;
  drawTile(vec2(x + w / 2, y + h / 2), vec2(w, h), s.tile, o.color || WHITE, o.angle || 0, !!o.flip, o.add);
};

// ---- a 3x5 font, each glyph 15 bits, row-major from the top ----
const PX_GLYPHS = {
  A: '010101111101101', B: '110101110101110', C: '011100100100011', D: '110101101101110', E: '111100110100111',
  F: '111100110100100', G: '011100101101011', H: '101101111101101', I: '111010010010111', J: '001001001101010',
  K: '101101110101101', L: '100100100100111', M: '101111111101101', N: '110101101101101', O: '010101101101010',
  P: '110101110100100', Q: '010101101011001', R: '110101110101101', S: '011100010001110', T: '111010010010010',
  U: '101101101101011', V: '101101101101010', W: '101101111111101', X: '101101010101101', Y: '101101010010010',
  Z: '111001010100111', '0': '010101101101010', '1': '010110010010111', '2': '110001010100111', '3': '110001010001110',
  '4': '101101111001001', '5': '111100110001110', '6': '011100110101010', '7': '111001010010010', '8': '010101010101010',
  '9': '010101011001110', '!': '010010010000010', '?': '110001010000010', '.': '000000000000010', ',': '000000000010100',
  "'": '010010000000000', ':': '000010000010000', '-': '000000111000000', '/': '001001010100100', '(': '001010010010001',
  ')': '100010010010100', '+': '000010111010000', '·': '000000010000000', '♪': '011010010110110', '♥': '000101111010000',
  'É': '111100110100111', 'È': '111100110100111', 'À': '010101111101101', 'Ú': '101101101101011', 'Ò': '010101101101010',
  'Ç': '011100100100011', 'Ó': '010101101101010', 'Í': '111010010010111', 'Ì': '111010010010111', 'Ù': '101101101101011',
  'Ú': '101101101101011', 'Á': '010101111101101', 'Â': '010101111101101', 'Ö': '010101101101010', 'Ô': '010101101101010',
  'Ê': '111100110100111', 'Ë': '111100110100111', 'Ñ': '110101101101101', 'Ü': '101101101101011',
};
const pxGlyphs = {};
PX.fontReady = false;
PX.initFont = () => {
  for (const ch in PX_GLYPHS) {
    const bits = PX_GLYPHS[ch];
    const rows = [];
    for (let r = 0; r < 5; r++) rows.push(bits.slice(r * 3, r * 3 + 3).replace(/1/g, '#').replace(/0/g, '.'));
    pxGlyphs[ch] = PX.sprite(rows, { '#': '#ffffff' });
  }
  PX.fontReady = true;
};

PX.textWidth = (str, scale = 1) => (str.length * 4 - 1) * scale;

// draw text with its baseline-bottom at y; x is the left edge, or the centre/right edge per align
PX.text = (str, x, y, color = WHITE, o = {}) => {
  const k = o.scale || 1;
  const w = PX.textWidth(str, k);
  let cx = o.align === 'center' ? x - w / 2 : o.align === 'right' ? x - w : x;
  cx = Math.round(cx);
  for (const ch of str.toUpperCase()) {
    const gl = pxGlyphs[ch];
    if (gl) PX.draw(gl, cx, y, { color, scale: k });
    cx += 4 * k;
  }
};

// a filled pixel rectangle with its bottom-left at (x, y)
PX.rect = (x, y, w, h, color) => drawRect(vec2(x + w / 2, y + h / 2), vec2(w, h), color);

// hex colour -> Color
PX.c = (hex, a = 1) => { const c = new Color(); c.setHex(hex); c.a = a; return c; };
