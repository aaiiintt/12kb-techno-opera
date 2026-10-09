/* People: 12x16 four-colour sprites, drawn at 2x, one walk for everyone.
   PEOPLE.make(rows, palette) takes the standing frame (16 rows, feet on the
   bottom two) and derives two walk frames by moving the legs: one with the
   legs apart, one with them together and the body a pixel lower. Everybody
   in Gaz '89 walks the same way; nobody has any other move.
   PEOPLE.draw(p, x, y, {walking, t, flip, color}) draws with bottom-left at x, y.
   The rows are strings: '.' transparent, any other character a palette key. */

'use strict';

const PEOPLE = {};
{
  const legsApart = (rows) => {
    // the last four rows are legs and feet: push the left pair left and the right pair right
    const r = rows.slice();
    for (let i = rows.length - 4; i < rows.length; i++) {
      const row = rows[i];
      const w = row.length, mid = Math.floor(w / 2);
      const left = row.slice(0, mid).replace(/^\./, '') + '.', right = '.' + row.slice(mid).replace(/\.$/, '');
      r[i] = (left + right).slice(0, w).padEnd(w, '.');
    }
    return r;
  };
  const sink = (rows) => ['.'.repeat(rows[0].length), ...rows.slice(0, rows.length - 3), ...rows.slice(rows.length - 2)];
  PEOPLE.make = (rows, pal) => {
    const p = { stand: PX.sprite(rows, pal), walk: [PX.sprite(legsApart(rows), pal), PX.sprite(sink(rows), pal)] };
    p.w = p.stand.w; p.h = p.stand.h;
    return p;
  };
  PEOPLE.draw = (p, x, y, o = {}) => {
    const s = o.walking ? p.walk[Math.floor((o.t ?? time) * 7) % 2] : p.stand;
    PX.draw(s, x, y, { flip: o.flip, color: o.color, scale: o.scale });
  };
}

// the cast palettes and rows, from docs/DESIGN.html; the sketches are the source of truth
PEOPLE.rows = {
  gaz: ['..hhhh......', '.hhhhhh.....', '..hhhhhh....', '..ffffff....', '..fefeff....', '...ffff.....', '.ssssssss...', 'sfssssssfs..', 'sfssssssfs..', '.ssssssss...', '..jjjjjj....', '..jjjjjj....', '..jj..jj....', '..jj..jj....', '.ww....ww...', '.ww....ww...'],
  mum: ['...hhhhhh...', '..hhhhhhhh..', '..hhffffhh..', '..hhfefehh..', '...hffffh...', '....ffff....', '..ssssssss..', '.ssssssssss.', '.ssssssssss.', '.ssssssssss.', '..ssssssss..', '..ssssssss..', '..ssssssss..', '..ssssssss..', '..ww....ww..', '..ww....ww..'],
  deano: ['..hhhhhh....', '.hhhhhhhh...', '.hhffffhh...', '..fefeff....', '...ffff.....', '.ssssssss...', 'sfssjjssfs..', 'sfssjjssfs..', '.ssssssss...', '.ssssssss...', '..jjjjjj....', '..jjjjjj....', '..jj..jj....', '..jj..jj....', '.ww....ww...', '.ww....ww...'],
  terry: ['..hhhhhh....', '.hhhhhhhh...', '.hhffffhh...', '.hfefefhh...', '.h.ffff.h...', '.h......h...', '.ssssssss...', 'sfssssssfs..', 'sfssssssfs..', '.ssssssss...', '..jjjjjj....', '..jjjjjj....', '..jj..jj....', '..jj..jj....', '.ww....ww...', '.ww....ww...'],
  bouncer: ['...hhhhhh...', '...ffffff...', '...fefeff...', '....ffff....', '.ssssssssss.', 'ssssssssssss', 'ssssssssssss', 'ssssssssssss', 'ssssssssssss', '.ssssssssss.', '..jjjjjjjj..', '..jjjjjjjj..', '..jjj..jjj..', '..jjj..jjj..', '.www....www.', '.www....www.'],
};
PEOPLE.pal = {
  gaz: { h: '#4a2a1a', f: '#f1c9a5', s: '#dfe8f4', j: '#3d5fa8', w: '#ffffff', e: '#1a1020' },
  mum: { h: '#8a5a3a', f: '#f1c9a5', s: '#d8588f', w: '#7a5230', e: '#1a1020' },
  deano: { h: '#2a1a10', f: '#f1c9a5', s: '#8a3fd0', j: '#9cff3a', w: '#ffffff', e: '#1a1020' },
  terry: { h: '#1a1a1a', f: '#f1c9a5', s: '#f4f0e6', j: '#2a2a30', w: '#2a2a30', e: '#1a1020' },
  bouncer: { h: '#1a1a1a', f: '#e8b898', s: '#0c0a10', j: '#0c0a10', w: '#0c0a10', e: '#1a1020' },
};
PEOPLE.props = {
  nova: [['......wwwwwwwwwww.......', '.....wggggwwwggggw......', '....wggggwwwwwggggw.....', 'ywwwwwwwwwwwwwwwwwwwwwwr', 'wwwwwwwwwwwwwwwwwwwwwwww', 'wwwwwwwwwwwwwwwwwwwwwwww', 'ywwwkkkwwwwwwwwwwkkkwwwr', '...kkkkk........kkkkk...', '...kkkkk........kkkkk...', '....kkk..........kkk....'], { w: '#f4f0e6', k: '#1a1a1a', g: '#8fb8e0', r: '#d4252a', y: '#f3d27a' }],
  phonebox: [['..rrrrrrrr..', '.rrrrrrrrrr.', '.rrwwwwwwrr.', '.rrrrrrrrrr.', '.rrggggggrr.', '.rrggggggrr.', '.rrggkkggrr.', '.rrggggggrr.', '.rrrrrrrrrr.', '.rrggggggrr.', '.rrggggkkrr.', '.rrggggkkrr.', '.rrggggggrr.', '.rrrrrrrrrr.', '.rrggggggrr.', '.rrggggggrr.', '.rrggggggrr.', '.rrrrrrrrrr.'], { r: '#8a1e2a', g: '#f2a33a', k: '#0c0a10', w: '#f4f0e6' }],
};
// build every person and prop once; call after PX.setup, before PX.bake
PEOPLE.init = () => {
  PEOPLE.cast = {};
  for (const k in PEOPLE.rows) PEOPLE.cast[k] = PEOPLE.make(PEOPLE.rows[k], PEOPLE.pal[k]);
  PEOPLE.prop = {};
  for (const k in PEOPLE.props) PEOPLE.prop[k] = PX.sprite(...PEOPLE.props[k]);
};
