/* Opera loader: builds a fresh kit each loop, hands it to opera.build(k),
   and drives start/stop/loop. The kit is the thin surface an opera author
   writes against - see docs/KIT.md. Every audio call on the kit is wrapped
   in tl.call so the author just passes a timeline time; the callback reads
   the audio clock fresh when it actually fires, exactly as snd() always did. */

function makeKit(tl) {
  const beat = 60 / O.opera.tempo;
  const k = {
    tl,
    end: 0,
    size: SIZE,
    centre: CENTER,

    bar: (b, beat2 = 1) => ((b - 1) * 4 + (beat2 - 1)) * beat,

    at: O.at,
    cells: O.cells,
    stage: O.stage,

    paint: (els, name) => (Array.isArray(els) ? els : [els]).forEach((el) => el && O.light(el, name)),
    bg: (name, t) => snd(tl, t, () => O.bg(name)),

    note: (voice, semi, t, dur, o = {}) => snd(tl, t, () => O.voice(voice, semi, O.now(), dur, o)),
    deg: O.deg,
    motif: O.motif,
    T: O.T,
    play: (voice, pair, t, o = {}) => snd(tl, t, () => O.play(voice, pair, O.now(), o)),
    arp: (numeral, t, dur, rate, o = {}) => snd(tl, t, () => O.arp(numeral, dur, rate, O.now(), o)),
    chord: O.chord,
    drum: (kind, t, vol, els) => snd(tl, t, () => O.drum(kind, O.now(), vol, els)),
    room: (cutoff, feedback, t, dur) => snd(tl, t, () => O.setRoom(cutoff, feedback, dur, O.now())),
    swell: (to, t, dur) => snd(tl, t, () => O.auto(O.master.gain, O.master.gain.value, to, dur, O.now(), 'linear')),
    silence: (t, dur) => snd(tl, t, () => {
      const g = O.master.gain, ct = O.now(), v = g.value;
      g.setValueAtTime(0.0001, ct);
      g.setValueAtTime(v, ct + dur);
    }),

    pilot: O.pilot,
    hop: (from, to, t, pop = 1) => O.hop(tl, t, from, to, undefined, undefined, pop),   // no pop by default: characters don't grow

    scale: (els, to, t, dur = 0.5, ease) => tl.to(els, { scale: to, duration: dur, ease }, t),
    pulse: (els, t) => tl.to(els, { scale: 1.15, duration: 0.15, yoyo: true, repeat: 1 }, t),

    camera: (o, t) => O.camera(tl, t, o),
    // Three shots. Wide: the whole grid. Mid: about five cells across the
    // screen's shorter side. Close: about two and a half. A cut by default.
    shot: (size, t, o = {}) => {
      const [col, row] = o.on || [CENTER, CENTER], n = { mid: 5, close: 2.5 }[size];
      O.camera(tl, t, { col, row, zoom: n ? () => Math.min(innerWidth, innerHeight) / (n * cellSize()) : 1, dur: o.dur || 0.001, ease: o.ease || 'power2.inOut' });
    },
    shake: (t, amount, dur) => O.shake(tl, t, amount, dur),

    // a small speech tag beside a cell: someone in the crowd says something
    say: (el, text, t, hold = 1) => {
      let d;
      if (!el) return;                              // the cell may not exist on a small grid
      tl.call(() => {
        const b = el.getBoundingClientRect();
        d = document.createElement('div');
        d.className = 'say'; d.textContent = text;
        document.body.appendChild(d);
        // beside the speaker, but always on screen and clear of the title and buttons
        const w = d.offsetWidth, h = d.offsetHeight;
        const ti = document.querySelector('#ti span'), nv = document.querySelector('.n a');
        const top = ti ? ti.getBoundingClientRect().bottom + 8 : 8, bot = nv ? nv.getBoundingClientRect().top - h - 8 : innerHeight - h - 8;
        d.style.left = (b.right + w < innerWidth - 8 ? b.right : Math.max(8, b.left - w)) + 'px';
        d.style.top = Math.min(bot, Math.max(top, b.top - b.height * 0.2)) + 'px';
      }, [], t);
      tl.call(() => d && d.remove(), [], t + hold);
    },
    act: (name, t) => O.acts.push({ name, t }),
  };
  // an act's cue is a caption like any other, beside the dot it belongs to
  k.cue = (text, t, hold = 1.6, el = O.at(CENTER, CENTER)) => k.say(el, text, t, hold);
  return k;
}

O.duration = 0;

function buildTimeline(opera) {
  tl = gsap.timeline({ onComplete: () => buildTimeline(opera) });
  O.tl = tl;
  O.acts = [];
  document.querySelectorAll('.say').forEach((d) => d.remove());
  const k = makeKit(tl);
  opera.build(k);
  // Hold the timeline live until the loop's declared end, even if the last
  // scheduled note or paint finishes earlier - the loop point is the
  // author's call, not whatever happens to be the final tween.
  tl.call(() => {}, [], k.end);
  O.duration = tl.end;
}

O.load = (opera) => {
  O.opera = opera;
  O.declareLights(opera.lights);
  const s = opera.stage || {};
  O.bg(null);
  O.applyStage({ grid: s.grid ?? 9 });
  buildTimeline(opera);
};

// Gate mode for review: ?gate=12.5,43.3 plays muted and freezes the picture
// and the audio clock at each listed second until O.gateNext() is called.
let tl;
const G = (new URLSearchParams(location.search).get('gate') || '').split(',').filter(Boolean).map(Number);
O.onFrame = () => { if (G.length && tl && !tl.paused && tl.t >= G[0]) { G.shift(); tl.paused = 1; O.suspend(1); } };
O.gateNext = () => { tl.paused = 0; O.suspend(0); };
O.start = () => { O.initAudio(); if (location.search.includes('gate')) O.master.gain.value = 0; };
O.stop = () => { if (tl) tl.kill(); };
