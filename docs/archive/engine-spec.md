# Phase 0: engine spec

What to build, exactly. Read `docs/PLAN.md` sections 0 to 3, `docs/music-guide.md` in full, and `docs/gestures.md` before this. The current `src/index.src.html` and `src/tween.js` are quarry: take what works, leave the acts.

## Files

```
src/engine/tween.js     the existing timeline engine, unchanged unless a gesture needs it
src/engine/synth.js     voices, automation, pitch, chords, transforms, patterns, noise, room
src/engine/stage.js     grid, dots, camera, cue, label, speech, actor registry
src/engine/gestures.js  the gesture table: name -> function
src/engine/score.js     opera loader: reads a module, resolves times, schedules gestures
src/engine/index.js     concatenation order and the public `Opera` entry point
src/shell.html          page chrome: title, byte badge, play, nav; one <script src=engine.js>, one for the opera
operas/scratch.js       the Phase 0 scratch score (throwaway)
build.js                rewritten, see Build
```

No modules at runtime. Files are concatenated in the order above and wrapped in one IIFE. Every symbol an opera or the shell needs hangs off one global, `O`.

## Opera module shape

A plain object assigned to `O.opera`. Every field below is required except where a default is shown.

```js
O.opera = {
  title: 'SCRATCH', lang: 'it',
  tempo: 84,                     // BPM inside the re-version
  root: 2, mode: 'phrygian',     // root as semitones above C, mode name from the mode table
  cast: {                        // up to three actors plus 'grid'
    a: { color: '#e63b2e', size: 1.3, voice: 'soprano' },
    b: { color: '#f5a623', size: 1.0, voice: 'tenor' },
  },
  motif: ['5 4 3 2 1', 'x-x.x-x.'],   // scale degrees, rhythm one char per eighth: x hit, - hold, . rest
  chords: 'i iv V i',                 // roman numerals over the mode; lower is minor, upper major, 7 and o allowed
  room: [900, 0.45],                  // starting cutoff Hz and feedback
  intro: 6, outro: 6,                 // seconds of free time either side
  score: [
    [0,    'enter',  'a', { edge: 'left', to: [2, 4] }],
    [0.5,  'cue',    null, { text: 'VITA.' }],
    ['1.1', 'sing',  'a', {}],
    ['3.1', 'sing',  'b', { transform: 'inv' }],
    ['o0.5','dissolve','a', {}],
  ],
};
```

Time in a score line is one of: a number (seconds from the start of the intro), `'b.q'` a string of bar and beat inside the re-version (bar 1 beat 1 is the first beat after the intro), or `'oN'` seconds into the outro. Beats are quarter notes. Bars are four beats. `score.js` converts all three to timeline seconds once, before scheduling, walking a tempo map so `ritardando` can stretch later beats.

Scale degrees: `1` to `7`, with `+` or `-` suffix for octave up or down, `0` for a rest inside a degree list. Rhythm strings are per eighth note. A motif with more `x` than degrees repeats degrees; with more degrees than `x`, the extras are dropped.

## synth.js

Follow the music guide. These are the only public functions.

- `O.inst`: the four house instruments as objects `{wave, detune, attack, decay, release, filterStart, filterEnd, vibratoDepth, vibratoDelay, gain}`. Names: `tenor` (two saws detuned, low-pass opens on attack), `soprano` (sine plus a quieter octave, late vibrato), `bass` (triangle, one or two octaves down), `arp` (single triangle or square, used by arpChorus). Start from the current `note()` voice recipes but express them as these objects. One extra field per instrument is allowed if the guide's sound demands it; say which.
- `O.voice(instName, semi, t, dur, {vol, pan})`: the one generic voice function. Builds oscillators from the instrument, applies attack, decay, release, filter envelope, delayed vibrato, panning, and routes to the room. Returns nothing.
- `O.auto(param, start, end, dur, t, curve='exp')`: the one automation helper. Exponential by default, linear on request. Guards zero for exponential ramps.
- `O.hz(semi)`: semitones from C3 to Hz, as now.
- `O.deg(d)`: scale degree string to semitones using `O.opera.root` and the mode table. Modes: major, minor, dorian, phrygian, lydian, mixolydian, harmonic. Store each as seven semitone offsets.
- `O.chord(numeral)`: roman numeral to `[bassSemi, colourSemi]`, the bass and the one note that defines the emotion (third for major/minor, seventh for 7, the diminished fifth for o). Never returns the plain fifth.
- `O.motif()`: returns `[semis[], rhythm]` for the current opera's motif.
- Transforms, each a function on a `[semis, rhythm]` pair returning a new pair, each under 40 characters of minified code: `tr(n)`, `mi()` flattens 3 and 6 relative to root, `inv()`, `aug()`, `dim()`, `frag(n=3)`, `retro()`. Exposed as `O.T = { tr, mi, inv, aug, dim, frag, retro }`.
- `O.play(voice, [semis, rhythm], t, {vol, pan, beat})`: plays a motif pair at time `t`, one eighth note per rhythm char, `beat` seconds per quarter note. This is what `sing` calls.
- `O.noise`: one buffer of a second of random samples, made once.
- `O.drum(kind, t, vol)`: kick, snare, hat, heartbeat, from the guide's recipes, using `O.noise` and pitch-plunging sines.
- `O.room`: two cross-fed delays (0.31 s and 0.47 s) with a low-pass in the loop and a master gain. `O.setRoom(cutoff, feedback, dur, t)` ramps both. `O.master` is the master GainNode.
- `O.arp(numeral, dur, rateHz, t, {vol})`: one oscillator cycling the chord tones, as now but using `O.chord` for the notes plus the fifth (arps may include the fifth; the flicker needs three notes).

Audio scheduling is timeline-driven as now: a gesture calls `tl.call(() => O.voice(...), [], time)` and the voice uses `ctx.currentTime` plus a small lookahead. Keep `score()` from the current file for this.

## stage.js

- Grid 9x9 of `.dot` divs, as now, with `--dot-color` registered. Dot CSS from the current file.
- `O.actors`: built from `O.opera.cast`. Each actor is `{id, el, col, row, color, size, voice}`. An actor owns one dot that is not part of the chorus grid: it is an extra div on the same coordinate system, so chorus and actors never fight over a cell. `grid` is the chorus, addressed as `O.at(col,row)` and `O.every(fn)`.
- `O.cell(col,row)` returns pixel coordinates; `O.move(actor, col, row, tl, time, dur, ease)` tweens the actor's dot there and updates its col and row at the end.
- `O.camera(tl, time, {col,row,zoom,dur,ease})` as now.
- `O.cue(tl, time, text, hold)` as now: typed lower-third caption.
- `O.label(tl, time, actor, text, dur)`: a white uppercase tag with a bracket, positioned to the right of the actor's dot, for `THE CHASE`. One div reused.
- `O.speech(tl, time, actor, text, hold)`: a black box with white uppercase text centred on the actor's dot, for `HELLO`. One div reused.
- `O.pan(actor)`: stereo position from column, as `panAt` now.

## gestures.js

`O.G` is an object of name to function. Signature `(tl, time, actors, params) => endTime`. `actors` is an actor id, an array of ids, `'grid'`, or null. Every param has the default from `docs/gestures.md`. Build exactly these twenty, nothing else in Phase 0:

`cue sing crescendo silence hold freeze chord shrink enter flicker arpChorus ritardando approach roomChange dissolve pulse rise grow appear eclipse`

Notes on the ones that touch the clock or the synth:

- `sing`: `{voice: actor's voice, transform: null | 'inv' | ['tr', 5] | [['mi'],['aug']], vol, octave}`. Plays `O.motif()` through the transforms, on the actor's voice, panned to the actor. Returns the time the last note ends. Also lightly pulses the actor's dot on each note (scale 1.08, 80 ms) so the singer is visible; this is the only visual a sound gesture has.
- `chord`: `{numeral, dur, voice: 'bass'}`. Bass plays the root, the singing actor's voice or the tenor plays the colour note.
- `arpChorus`: `{numeral, dur, rate: 45}`. Lights the chorus faintly while it runs.
- `crescendo`: `{to: 0.9, dur: 2, target: 'master'}`. Ramps `O.master` or a voice's gain.
- `silence`: `{dur: 0.25}`. Drops the master to near zero and restores it. Also cancels nothing on stage; stage freezes are separate.
- `ritardando`: `{stretch: 1.15, beats: 1}`. Only affects the tempo map in `score.js`; it is resolved before scheduling. It must appear in the score before the beats it stretches.
- `roomChange`: `{cutoff, feedback, dur: 1.5}` calls `O.setRoom`.
- `hold`: `{dur: 2}` sustains the actor's last sung note (a long `O.voice` call) and does nothing on stage.

## score.js

- `O.load(opera)`: builds actors, resolves every score time to seconds via the tempo map, sorts, and schedules each line by calling `O.G[name](tl, t, actors, params)`. Unknown gesture names throw at load, with the name.
- Tempo map: start with `60 / tempo` seconds per beat from the end of the intro. Each `ritardando` line multiplies the beat length for its span, then restores. `'oN'` times are offset from the end of the last re-version bar, which is the largest bar referenced plus one.
- `O.start()`, `O.stop()`, loop: the timeline's `onComplete` restarts after a 0 s gap so the outro can turn around into the intro. Ambient mode is dropped; loop is the only mode.
- `O.duration`: total seconds, for the shell's badge.

## shell.html

The current page's title, nav and play button style, reduced: title from `O.opera.title`, a byte badge filled by the build, a play control, an about link. No ambient mode, no fitTitle beyond what the title needs. Under 1,024 bytes gzipped on its own.

## Scratch score

`operas/scratch.js`, about 20 seconds: intro with `appear` and a `cue`, four bars using `sing` on two voices with `inv` and `aug`, one `chord` line, one `arpChorus`, a `crescendo`, a `silence`, a `ritardando` into the last bar, `roomChange` twice, `approach` and `eclipse` between the actors, `shrink` then `dissolve`, and an outro `cue`. It has to exercise all twenty gestures at least once. It is not art.

## Build

`build.js` produces:

- `dist/engine.js`: concatenated engine, terser with `mangle.properties` on a regex for internal names, `compress.passes: 3`.
- `dist/<opera>.html`: the shell with `<script src="engine.js">` and `<script src="<opera>.js">`, and `dist/<opera>.js` minified.
- `dist/<opera>.standalone.html`: shell with engine and opera inlined.
- Console: gzipped size of `engine.js`, of each opera `.js`, of the shell, of each standalone, and the site total (engine plus shell plus every opera). One line each. Exits non-zero if the engine exceeds 10,240, an opera exceeds 2,048, or a standalone exceeds 12,288.
- Also print the gzipped size of `synth.js` on its own, minified, so we can compare with the guide's 1.5 to 3 KB benchmark.

Keep `python3 -m http.server` as the dev server, serving `dist/`. Update `.claude/launch.json` to serve `dist`.

## Exit criteria

1. `npm run build` succeeds and prints every size line.
2. `dist/scratch.html` plays end to end, loops, and every one of the twenty gestures visibly or audibly does something.
3. The four instruments, played as a C major scale each (add a `?scale` query flag to the shell that does this and nothing else), sound like four different characters.
4. A single held note in the room sounds like it is in a building.
5. The measured sizes are written into `docs/phase0-report.md` with a note on anything that surprised you.

Do not commit. Do not edit `docs/PLAN.md`, `docs/music-guide.md`, `docs/stories.md` or `docs/gestures.md`. If the spec is wrong or impossible somewhere, do the sensible thing and write down what you changed in the report.

## Phase 0.5: voices and the ascension (added 26 Sep after Iain listened)

Iain's verdict on the scratch score: sounds pretty good overall, but the four voices are hard to tell apart. His two reference moments from the original opera are the act-six "purple section" (four ascending chords with ring pulses and the room opening) and the act-seven formant soprano. Both recipes are in `src/index.src.html` and neither made it into the engine. Bring them forward.

1. **Soprano is the formant voice.** Port the `isSoprano` branch of the original `note()` exactly: five harmonics (1 to 5) at levels 0.85, 0.38, 0.22, 0.10, 0.05 with the second a triangle; a scoop from 0.915 of the target pitch over 75 ms; three band-pass formants at 850, 1550 and 2950 Hz with Qs 2.8, 3.0, 4.5 and gains 0.65, 0.55, 1.25; a 5.3 Hz LFO whose depth ramps in from 150 ms to 500 ms and drives pitch (5.8 cents), tremolo (20 percent of volume) and the third formant (24 Hz); a breath burst from the noise buffer through a 3.6 kHz band-pass at onset; and on notes over 1.2 s the sung envelope (to 42 percent at 80 ms, to full at 38 percent of the duration, hold to 72 percent, decay). Send more of it to the room (0.62 versus 0.40). Express it as fields on the instrument object plus one `formant` branch in `O.voice`, not a second voice function.
2. **Tenor as the original.** Two saws at ±4.5 cents plus a sine sub-octave, low-pass from 550 Hz opening to 2.4 kHz over 1.5 times the attack then closing to 600 Hz by the end of the note, and an optional `grit` ring-mod (a saw at half the frequency driving a gain at 0.55) for menace.
3. **Bass darker.** Triangle two octaves below the lead through a low-pass that never opens above 500 Hz, so it is felt more than heard. It must not sound like a quiet tenor.
4. **Arp thinner.** Square or pulse, short, no vibrato, so it reads as the chip shimmer rather than a fourth singer.
5. **`ascend` gesture.** The purple section as a reusable move. Params: `numerals` (default the four chords the mode makes of I, IV, V and I an octave up), `gap` (2.0 s), `hue` (272) and `hueStep` (5). For each chord in turn: a full voicing (bass on the root, tenor on the third with vibrato on the top voice, a 14 + step Hz arp of the whole triad plus octave, panned alternately), a ring pulse across the chorus grid from the centre outward with the ring colour at `hue + step * hueStep`, and the room cutoff stepping up (2800 base, plus 300 per step) with feedback 0.44 plus 0.02 per step. Returns the time after the last chord's release.
6. **`?scale` becomes a line-up.** Play the same four-note phrase on tenor, then soprano, then bass, then arp, with a second of silence between, then a single soprano note held for four seconds. Iain's test is: can you name the voice with your eyes shut.
7. **Scratch score.** Add an `ascend` line before the outro so the purple section can be heard against the rest, and make the soprano's `sing` lines hold their last note for two seconds so the formant voice gets to bloom.

Rebuild, keep every gate, and add the new sizes to `docs/phase0-report.md` under a Phase 0.5 heading with a line on what the soprano cost in bytes. Do not commit.

## Phase 1: the full catalogue and the playground

Two agents in parallel. The gesture agent owns `src/engine/gestures.js`, `src/engine/meta.js`, `tools/gen-api.js` and may touch `synth.js` and `stage.js`. The playground agent owns `build.js` and `src/playground.html`. Neither touches the other's files. They meet at `meta.js`.

### meta.js (not shipped)

A plain data file the build reads. It is never concatenated into the engine.

```js
module.exports = {
  enter: { family: 'entrance', doc: 'slide in from a grid edge to a cell', actors: 1,
           params: { edge: ['left', ['left','right','top','bottom']], to: [[2,4], 'cell'], dur: [0.6, 0.1, 3] } },
  sing:  { family: 'sound', doc: 'play the motif on the actor\'s voice, optional transform', actors: 1,
           params: { transform: [null, ['inv','retro','aug','dim','frag','mi']], vol: [0.14, 0, 0.4], octave: [0, -2, 2] } },
  ...
};
```

Each param is `[default, control]` where control is `[min, max]` for a number, an array of strings for a select, `'cell'` for a grid cell, `'text'` for a string, or `'numeral'` for a chord numeral. `actors` is how many actor ids the gesture takes: 0, 1, 2 or `'grid'`. Every gesture in `O.G` has an entry, including the twenty already built and `ascend`.

### Gesture agent

Build every remaining gesture from `docs/gestures.md` except `dialogue` (dropped). That is 31: exit, reveal, path, orbit, wander, dash, weave, sink, scatter, waltz, touch, merge, split, keepDistance, swapSize, fillRing, fillColumn, closeIn, curtainParts, colourWash, dim, burnEmber, zoomTo, shake, drift, snapCut, label, speech, stutter, slow, drum, echoVoice. (`ascend` is done.) Add to `O.arp` an `octave` param so `ascend`'s last chord can lift. Fill `meta.js` for all 52. Write `tools/gen-api.js`, a Node script that reads `meta.js`, `dist/sizes.json` (per-gesture gzipped bytes, produced by the build) and the instrument objects and transform names from `synth.js` (by regex is fine), and writes `docs/engine-api.md`: one table per family with name, doc, actors, params and defaults, bytes; then the instrument fields; then the transforms; then the score time formats. Run it as the last step of `npm run build` once the playground agent's build change lands (coordinate by leaving a `postbuild` script in package.json that the build agent can wire).

### Playground agent

`dist/playground.html`, built from `src/playground.html` by `build.js`, no budget, dev only. It loads `dist/engine.js` and `dist/meta.json` (emitted by the build from `meta.js`). Layout: the stage on the left with the chorus grid and two actors (a red soprano, an amber tenor), a list of every gesture grouped by family on the right; click a gesture to see its params as controls generated from the meta, a play button that runs just that gesture from a fresh timeline at time 0 with those params, and its gzipped byte cost. Also a "house" panel at the top: the four instruments' fields as sliders that write straight into `O.inst`, and a room cutoff and feedback pair. It is ugly and fast. One page, one script, no framework, no dependencies. `build.js` additionally emits `dist/meta.json` and `dist/sizes.json`, the latter by extracting each `name: (` block from `gestures.js`, minifying it alone and gzipping it. Add a `postbuild` script to package.json that runs `tools/gen-api.js` if it exists.

Both: no commits, every gate still passes, close any browser tabs you open.
