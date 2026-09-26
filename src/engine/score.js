/* Opera loader: resolves score times to seconds via a tempo map, schedules
   every gesture, and drives start/stop/loop. */

function parseBarBeat(t) {
  const m = /^(\d+)\.(\d+)$/.exec(t);
  return [+m[1], +m[2]];
}

function buildTempoMap(score, tempo) {
  const defaultLen = 60 / tempo;
  const rits = score.filter((l) => l[1] === 'ritardando').map((l) => {
    const [bar, beat] = parseBarBeat(l[0]);
    const p = l[3] || {};
    return { start: (bar - 1) * 4 + (beat - 1), span: p.beats ?? 1, stretch: p.stretch ?? 1.15 };
  });
  function beatLen(i) {
    for (const r of rits) if (i >= r.start && i < r.start + r.span) return defaultLen * r.stretch;
    return defaultLen;
  }
  const cache = [0];
  return {
    beatIndexToSeconds(bIdx) {
      while (cache.length <= bIdx) cache.push(cache[cache.length - 1] + beatLen(cache.length - 1));
      return cache[bIdx];
    },
  };
}

function resolveTime(t, introSec, outroStart, map) {
  if (typeof t === 'number') return t;
  if (t[0] === 'o') return outroStart + parseFloat(t.slice(1));
  const [bar, beat] = parseBarBeat(t);
  return introSec + map.beatIndexToSeconds((bar - 1) * 4 + (beat - 1));
}

let tl;
O.duration = 0;

function buildTimeline(opera) {
  const introSec = opera.intro ?? 0;
  const map = buildTempoMap(opera.score, opera.tempo);
  let maxBar = 0;
  opera.score.forEach(([t]) => {
    if (typeof t === 'string' && t[0] !== 'o') maxBar = Math.max(maxBar, parseBarBeat(t)[0]);
  });
  const outroStart = introSec + map.beatIndexToSeconds(maxBar * 4);
  const resolved = opera.score
    .map(([t, g, a, p]) => [resolveTime(t, introSec, outroStart, map), g, a, p || {}])
    .sort((x, y) => x[0] - y[0]);
  tl = gsap.timeline({ onComplete: () => buildTimeline(opera) });
  resolved.forEach(([t, g, a, p]) => {
    if (!O.G[g]) throw new Error('unknown gesture: ' + g);
    O.G[g](tl, t, a, p);
  });
  O.duration = tl.end;
}

O.load = (opera) => {
  O.opera = opera;
  const s = opera.stage || {};
  O.bg(null);
  O.applyStage({ grid: s.grid ?? 9, dot: s.dot ?? 1, gap: s.gap ?? 1 });
  buildActors();
  buildTimeline(opera);
};

O.start = () => O.initAudio();
O.stop = () => { if (tl) tl.kill(); };
