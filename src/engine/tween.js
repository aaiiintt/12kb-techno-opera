/* Minimal timeline and easing engine for the 12KB Techno Opera.
   timeline({onComplete}).to/fromTo/set/call/seek/kill, plus fromTo and delayedCall.
   Props: opacity, scale, x, y. Options: duration, ease, yoyo, repeat.
   Eases are Robert Penner's equations: power1, power2, sine, back, elastic. */
const PI2 = Math.PI * 2;
const EASES = {
  'power1.out': (p) => 1 - (1 - p) * (1 - p),
  'power1.inOut': (p) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2),
  'power2.in': (p) => p * p * p,
  'power2.out': (p) => 1 - Math.pow(1 - p, 3),
  'power2.inOut': (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2),
  'sine.in': (p) => 1 - Math.cos((p * Math.PI) / 2),
  'sine.out': (p) => Math.sin((p * Math.PI) / 2),
  'sine.inOut': (p) => -(Math.cos(Math.PI * p) - 1) / 2,
};
function ease(name) {
  if (!name) return EASES['power1.out'];
  if (EASES[name]) return EASES[name];
  const m = /^(elastic|back)\.(in|out)(?:\(([^)]*)\))?/.exec(name);
  if (!m) return EASES['power1.out'];
  const args = (m[3] || '').split(',').map(Number);
  if (m[1] === 'back') {
    const s = m[3] ? args[0] : 1.70158;
    const out = (p) => --p * p * ((s + 1) * p + s) + 1;
    return m[2] === 'out' ? out : (p) => 1 - out(1 - p);
  }
  const amp = Math.max(1, args[0] || 1), per = args[1] || 0.3;
  const p1 = (per / PI2) * Math.asin(1 / amp), p2 = PI2 / per;
  return (p) => (p === 1 ? 1 : amp * Math.pow(2, -10 * p) * Math.sin((p - p1) * p2) + 1);
}

// One state object per element so x, y and scale compose into a single transform.
const STATES = new WeakMap();
function state(el) {
  let s = STATES.get(el);
  if (!s) {
    const cs = getComputedStyle(el);
    const mtx = new DOMMatrix(cs.transform === 'none' ? '' : cs.transform);
    s = { x: mtx.e, y: mtx.f, scale: mtx.a, opacity: parseFloat(cs.opacity) };
    STATES.set(el, s);
  }
  return s;
}
function apply(el, s) {
  el.style.transform = `translate(${s.x}px,${s.y}px) scale(${s.scale})`;
  el.style.opacity = s.opacity;
}
const val = (v, cur) => (typeof v === 'function' ? v() : typeof v === 'string' ? cur + parseFloat(v.slice(2)) * (v[0] === '-' ? -1 : 1) : v);

class Timeline {
  constructor(o = {}) {
    this.items = [];
    this.t = 0;
    this.end = 0;
    this.dead = false;
    this.onComplete = o.onComplete;
    this.last = 0;
    this.raf = requestAnimationFrame(this.tick);
  }
  add(el, from, to, o, time) {
    const rep = o.repeat || 0, d = o.duration || 0, n = d * (rep + 1);
    // el may be a function returning the real element, resolved once when
    // the tween activates - not when it's added - so a tween on "whichever
    // cell an actor occupies" reads that cell as of playback, not build time.
    const isFn = typeof el === 'function';
    const items = (isFn ? [null] : Array.isArray(el) ? el : [el]).map((e) => ({
      el: e, getEl: isFn ? el : null, from, to, s: time, d, n, rep, yoyo: !!o.yoyo, f: ease(o.ease), on: false, done: false,
    }));
    this.items.push(...items);
    this.end = Math.max(this.end, time + n);
    return this;
  }
  to(el, o, time = this.end) { return this.add(el, null, o, o, time); }
  fromTo(el, a, b, time = this.end) { return this.add(el, a, b, b, time); }
  set(el, o, time = this.end) { return this.add(el, null, o, { duration: 0 }, time); }
  call(fn, args, time = this.end) { this.items.push({ fn, s: time, n: 0, done: false }); this.end = Math.max(this.end, time); return this; }
  seek(t) {
    this.t = t;
    this.last = 0;
    this.items.forEach((i) => { i.done = i.on = false; });
    this.render();
  }
  kill() { this.dead = true; cancelAnimationFrame(this.raf); }
  tick = (now) => {
    if (this.dead) return;
    if (this.paused) { this.last = now; this.raf = requestAnimationFrame(this.tick); return; }
    if (this.last) this.t += (now - this.last) / 1000;
    this.last = now;
    const live = this.render();
    if (O.onFrame) O.onFrame(this.t);
    if (live) this.raf = requestAnimationFrame(this.tick);
    else if (this.onComplete) this.onComplete();
  };
  render() {
    if (!this.sorted) { this.items.sort((a, b) => a.s - b.s); this.sorted = true; }
    let live = false;
    for (const i of this.items) {
      if (i.done) continue;
      if (this.t < i.s) { live = true; continue; }
      if (i.fn) { i.done = true; i.fn(); continue; }
      if (i.getEl && !i.on) i.el = i.getEl();
      if (!i.el) { i.done = true; continue; }
      const st = state(i.el);
      if (!i.on) {
        i.on = true;
        i.a = {}; i.b = {};
        for (const k in i.to) if (k in st) {
          i.a[k] = i.from && k in i.from ? val(i.from[k], st[k]) : st[k];
          i.b[k] = val(i.to[k], st[k]);
        }
      }
      const el = this.t - i.s;
      let p;
      if (el >= i.n) { p = i.yoyo && (i.rep + 1) % 2 === 0 ? 0 : 1; i.done = true; }
      else { const c = Math.floor(el / i.d), r = (el - c * i.d) / i.d; p = i.yoyo && c % 2 ? 1 - r : r; live = true; }
      const q = i.f(p);
      for (const k in i.a) st[k] = i.a[k] + (i.b[k] - i.a[k]) * q;
      apply(i.el, st);
    }
    return live;
  }
}
const gsap = {
  timeline: (o) => new Timeline(o),
  delayedCall: (s, fn) => setTimeout(fn, s * 1000),
  fromTo: (el, a, b) => new Timeline().fromTo(el, a, b, 0),
};
