/* Cast: the characters, alive. A character is a set of frames, not one sprite:
   idle (a breath), walk (stride, pass, stride, pass, with a bob), jump (tuck,
   arms up), kneel, fall (lying, arms flung) and hold (one arm up, for a prop).
   Every frame is the same size as the old static sprite (6x11 a body, 7x11 a
   dress) with its feet on the bottom row, so positions and hit tests hold.

   CAST.body({h, f, b, l, s?, e?, m?}, torso?)  hat/hair, face, body, legs, shirt, eyes, mouth
   CAST.dress({h, f, r, k?, l?, e?, m?})          hair, face, skirt, corsage, feet
   CAST.draw(ch, x, y, {pose, t, flip, color, add, angle, scale})
     pose: 'idle' | 'walk' | 'jump' | 'kneel' | 'fall' | 'hold'. Left out, a
     character that moved since the last frame walks and one that did not
     breathes. t: seconds (default the engine clock, offset per character so
     the cast does not breathe in unison). A fall lies on the ground at y,
     head to the left, over the spot it stood on. Coming down from a jump
     squashes for a tenth of a second; CAST.hit(ch) does the same on a knock.
   CAST.frame(ch, pose, t) is the sprite, for a caller that draws it itself.
   Call CAST.body / CAST.dress where sprites are defined, before PX.bake. */

'use strict';

const CAST = {};
{
  let n = 0;
  // everything above row i sinks a pixel: the breath and the bob
  const sink = (r, i) => ['.'.repeat(r[0].length), ...r.slice(0, i), ...r.slice(i + 1)];
  const make = (pal, poses) => {
    const ch = { id: n++ }, baked = new Map();
    for (const p in poses) ch[p] = poses[p].map((r) => baked.get(r) || baked.set(r, PX.sprite(r, pal)).get(r));
    ch.w = ch.idle[0].w; ch.h = ch.idle[0].h;
    return ch;
  };
  const pal = (p) => { const q = { e: '#1a1020', m: '#c87a70', s: p.b, k: p.r, l: p.f }; for (const k in p) if (p[k]) q[k] = p[k]; return q; };

  const H = ['..hh..', '.hhhh.', '.ffff.', '.fefe.', '..fm..'];
  CAST.body = (p, T = ['.bssb.', 'bbssbb', 'f.bb.f', '..bb..']) => {
    const stand = [...H, ...T, '.ll.ll', '.ll.ll'];
    const up = ['f.hh.f', 'bhhhhb', '.ffff.', '.fefe.', '..fm..', ...T.slice(0, 2), '.bbbb.'];
    const jump = [...up, '.ll.l.', 'l..l..', '......'];
    const pass = [...H, T[0], T[1], '.fbb..', '..bbf.', '..ll..', '..ll..'];
    return make(pal(p), {
      idle: [stand, sink(stand, 8)],
      walk: [['......', ...H, T[0], T[1], 'fbbbf.', '.l..l.', 'l....l'], pass, ['......', ...H, T[0], T[1], '.fbbbf', '.l..l.', 'l....l'], pass],
      jump: [jump],
      fall: [[...up, '.llll.', '.l..l.', '.l..l.']],
      kneel: [['......', '......', ...H, T[0], 'bbssbf', 'bbbll.', '.ll.l.']],
      hold: [['..hh.f', '.hhhhb', '.ffffb', '.fefeb', '..fmb.', T[0], 'bbssb.', 'f.bb..', ...stand.slice(8)]],
    });
  };

  const DH = ['..hhh..', '.hhhhh.', '.hfffh.', '.hefeh.', '..fmf..', '..rkr..'];
  CAST.dress = (p) => {
    const skirt = (a, b) => ['frrrrrf', '.rrrrr.', a, b];
    const stand = [...DH, ...skirt('rrrrrrr', 'rrrrrrr'), '.l...l.'];
    const pass = [...DH, ...skirt('rrrrrrr', 'rrrrrrr'), '..l.l..'];
    const up = ['f.hhh.f', 'fhhhhhf', '.hfffh.', '.hefeh.', '..fmf..', '..rkr..', '.rrrrr.', '.rrrrr.'];
    return make(pal(p), {
      idle: [stand, sink(stand, 7)],
      walk: [sink([...DH, ...skirt('rrrrrrr', '.rrrrrr'), '.l..l..'], 7), pass, sink([...DH, ...skirt('rrrrrrr', 'rrrrrr.'), '..l..l.'], 7), pass],
      jump: [[...up, 'rrrrrrr', 'r.l.l.r', '.......']],
      fall: [[...up, 'rrrrrrr', 'rrrrrrr', '.l...l.']],
      hold: [['..hhh.f', '.hhhhhf', '.hfffhf', '.hefehf', '..fmfr.', '..rkr..', 'frrrrr.', ...stand.slice(7)]],
    });
  };

  CAST.frame = (ch, p, t) => { const F = ch[p] || ch.idle; return F[Math.floor(t * (p === 'walk' ? 8 : 1.5)) % F.length]; };
  CAST.hit = (ch) => { ch.sq = time; };
  CAST.draw = (ch, x, y, o = {}) => {
    // moved since the last frame (a small step, not a teleport): walking, for a moment
    if (frame !== ch.lf) { const d = Math.abs(x - ch.lx); if (d > 0.01 && d < 9 && frame - ch.lf < 5) ch.mt = time; ch.lx = x; ch.lf = frame; }
    const p = o.pose || (time - ch.mt < 0.15 ? 'walk' : 'idle');
    if (ch.lp === 'jump' && p !== 'jump') ch.sq = time;       // landed
    ch.lp = p;
    const s = CAST.frame(ch, p, o.t ?? time + ch.id * 0.37), k = o.scale || PX.SCALE, w = s.w * k, h = s.h * k;
    const q = p !== 'fall' && time - ch.sq < 0.1 ? 0.15 : 0, W = w * (1 + q), Hh = h * (1 - q);
    drawTile(p === 'fall' ? pxPos(x, y + (w - h) / 2, w, h) : pxPos(x - w * q / 2, y, W, Hh), vec2(W, Hh), s.tile, o.color || WHITE,
      (o.angle || 0) - (p === 'fall' ? PI / 2 : 0), !!o.flip, o.add, glEnable, PX.screen);
  };
}
