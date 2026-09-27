/* Entry point: build the grid once, expose the global, wire the public alias. */
buildGrid();
O.Opera = O.load;
window.O = O;

// Step mode (?step or ?step=N, wired up by shell.html once the opera script
// has set O.opera): review a loop one beat-frame at a time. Muted - the
// master gain is pinned to 0 rather than skipping O.initAudio, since the
// lighting itself only ever depends on O.now() (see synth.js), never on the
// AudioContext actually running. Frozen - every arrow key rebuilds the
// opera from scratch and fast-forwards a virtual clock to the frame's own
// time (Timeline.seek(t, true), tween.js), so a frame looks the same
// however you arrive at it. size in beats = 60 / tempo; frame 1 is t = 0.
O.initStep = () => {
  const qs = new URLSearchParams(location.search);
  const beat = () => 60 / O.opera.tempo;
  const timeOf = (nn) => (nn - 1) * beat();
  const maxN = () => Math.floor(O.duration / beat()) + 1;
  const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
  let n = Math.max(1, parseInt(qs.get('step'), 10) || 1);

  const ctr = document.createElement('div');
  ctr.className = 'st';
  document.body.appendChild(ctr);
  pb.style.display = 'none';

  function label(t) {
    let idx = 0;
    O.acts.forEach((a, i) => { if (a.t <= t + 1e-6) idx = i; });
    const a = O.acts[idx] || { name: '' };
    return (roman[idx] || '') + ' ' + a.name + ' · ' + n + ' · ' + t.toFixed(1) + ' s';
  }
  // an act's own frame: the first frame at or after its start second (ceil,
  // never the beat just before it).
  function actFrame(a) { return Math.ceil(a.t / beat() - 1e-6) + 1; }
  // previous/next act's frame, for shift+arrow, worked out in frame numbers
  // throughout (not seconds) - an act's start second is almost never exactly
  // on a beat, so comparing the current frame's own time back against it
  // would nearly always read as "mid-act", even right after landing there.
  function actAt(nn, dir) {
    const A = O.acts;
    if (!A.length) return nn;
    let i = 0;
    A.forEach((a, k) => { if (actFrame(a) <= nn) i = k; });
    if (dir > 0) return A[i + 1] ? actFrame(A[i + 1]) : actFrame(A[i]);
    if (nn > actFrame(A[i])) return actFrame(A[i]);
    return actFrame(A[i - 1] || A[0]);
  }
  function show(nn) {
    if (O.tl) O.tl.kill(); // else its paused rAF loop would run forever
    O.cells().forEach((el) => { el.style.transform = ''; el.style.opacity = ''; });
    worldEl.style.transform = ''; worldEl.style.opacity = '';
    STATES = new WeakMap(); // clear cached tween bases - see tween.js
    O.initAudio();
    O.master.gain.value = 0;
    O.load(O.opera);
    O.tl.paused = 1;
    n = Math.min(Math.max(1, nn), maxN());
    const t = timeOf(n);
    O.tl.seek(t, 1);
    history.replaceState(null, '', location.pathname + '?step=' + n);
    ctr.textContent = label(t);
  }
  addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    const dir = e.key === 'ArrowRight' ? 1 : -1;
    if (e.shiftKey) show(actAt(n, dir));
    else show(n + dir);
  });
  show(n);
};
