# The kit

An opera file assigns:

```js
O.opera = {
  title, lang, tempo, root, mode,
  stage: { grid },              // grid size, e.g. 9
  lights: { name: cssColour },  // optional, alongside the built-in eight
  build(k) { ... },             // called once per loop
};
```

`build(k)` schedules everything on `k.tl` and must set `k.end`, the loop length in seconds. All times passed to the kit are seconds on `k.tl`.

## The kit object

- `k.tl` - the timeline.
- `k.bar(b, beat = 1)` - seconds at bar/beat, from tempo.
- `k.at(col, row)` - cell at stage coords (0..SIZE-1; outside reaches the outer grid).
- `k.cells()` / `k.stage()` - every cell / stage cells only.
- `k.size`, `k.centre` - stage size, centre coordinate.
- `k.paint(el or els, lightName)` - set cells' light, immediately.
- `k.bg(lightName or null, t)` - cut the background.
- `k.note(voice, semi, t, dur, { vol, pan, light })` - a note; `light` lights with its envelope.
- `k.deg('5#+')` - scale degree to semitone (`#`/`b`, `+`/`-` octave).
- `k.motif(degrees, rhythm)` - `'1 3 5'` / `'x-x-'` to `[semis, rhythm]`.
- `k.T` - transforms (`tr`, `mi`, `ma`, `inv`, `aug`, `dim`, `frag`, `retro`).
- `k.play(voice, pair, t, { beat, vol, light })` - a phrase, lit per note.
- `k.arp(numeral, t, dur, rate, { cells, fill })` - arpeggio; paint `cells` first for colour.
- `k.chord(numeral)` - `[bass, colour]` semitones.
- `k.drum(kind, t, vol, els)` - `kick`/`snare`/`hat`/`heartbeat`.
- `k.room(cutoff, feedback, t, dur)` - the reverb send.
- `k.swell(to, t, dur)` / `k.silence(t, dur)` - crescendo / hard drop.
- `k.pilot(el, lightName)` - mark a cell as a character's resting light.
- `k.hop(from, to, t)` - move that pilot light, with ember and elastic pop.
- `k.scale(el, to, t, dur, ease)` / `k.pulse(el, t)` - scale cells in place.
- `k.camera({ col, row, zoom, dur, ease }, t)`, `k.shake(t, amount, dur)`.
- `k.shot('wide' | 'mid' | 'close', t, { on: [col, row], dur, ease })` - the three shots; a cut unless `dur` is given. To follow a character in close, call it again at each hop with a short `dur`.
- `k.cue(text, t, hold)` - one lower-third line.
- `k.act(name, t)` - record an act marker (name, start second) for the current build. Step mode (`?step`) reads these to label its counter and to jump act to act with shift+arrow.

## Declared lights

`O.opera.lights = { amber: '#ffb347' }` adds a light next to the built-in eight (`bulb`, `gold`, `sakura`, `coral`, `lemon`, `mint`, `sky`, `violet`). Any CSS colour; converted to OKLCH once at load, behaves exactly like a built-in.

## Example: `operas/hello.js`

Gold hero at centre with a heartbeat (`pilot`+`pulse`+`drum`), a four-note tenor phrase (`motif`+`play`), a mint ring (`paint`+`arp`), background cuts to a declared amber for one cue, loops. ~15s. Proves the kit, not art - read alongside `src/index.src.html`.
