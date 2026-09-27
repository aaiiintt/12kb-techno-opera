# Phase 0 report

Build output (`npm run build`, run 26 Sep 2026):

```
[original site] index.html: 35936 bytes, 12275 bytes gzipped, limit 12288, 13 spare
engine.js: 17303 bytes, 6361 bytes gzipped, limit 10240, 3879 spare
synth.js (standalone measure): 6963 bytes, 2466 bytes gzipped
shell.html: 2595 bytes, 1291 bytes gzipped
scratch.js: 1306 bytes, 640 bytes gzipped, limit 2048, 1408 spare
scratch.standalone.html: 21168 bytes, 8049 bytes gzipped, limit 12288, 4239 spare
site total (engine + shell + all operas): 8292 bytes gzipped
```

All hard gates pass with real headroom: engine at 6,361 of 10,240 (3,879 spare), the scratch opera at 640 of 2,048 (1,408 spare), the standalone at 8,049 of 12,288 (4,239 spare). The retired original site still builds unchanged at the repo root (12,275 of 12,288 — 13 bytes spare, exactly where it was).

`synth.js` alone gzips to 2,466 bytes, inside the guide's 1.5–3 KB benchmark for a serious chip-opera score.

## Scratch score: plays, loops, clean console

Verified in the built-in browser against `dist/scratch.html`: clicking Play builds and runs the timeline, all 20 gestures fire in sequence (visually confirmed via screenshots at multiple points — intro `appear`/`enter`, mid-score `sing`/`pulse`/`flicker`/`chord`/`arpChorus`/`approach`/`ritardando`/`eclipse`/`silence`/`grow`/`hold`/`roomChange`/`shrink`/`dissolve`, outro `cue` "FINE." and `dissolve`), the timeline reaches its end and loops back into a fresh intro (confirmed by screenshot showing both actors reset to full scale after ~13s), and a live `window.onerror` listener attached via the console caught zero errors across a full play-through of both `dist/scratch.html` and `dist/scratch.standalone.html`. (One stale console entry from an early bug-fix iteration — see below — kept resurfacing in `read_console_messages` even on an unrelated directory-listing page with no script at all, which proved it was a tool-side artifact, not a live error; the `window.onerror` listener is the trustworthy signal and reported clean.)

`dist/scratch.html?scale` also runs clean (checked the same way): it plays a C-major scale on each of the four instruments in turn and does nothing else.

## What I changed from the spec, and why

- **`O.now()`** — added one function to `synth.js` beyond the spec's exact public-function list (`O.hz`, `O.voice`, `O.auto`, `O.deg`, `O.chord`, `O.motif`, `O.T`, `O.play`, `O.noise`, `O.drum`, `O.room`/`O.setRoom`, `O.arp`). `ctx` (the AudioContext) is a module-private variable with no other path out of `synth.js`, and the shell's `?scale` harness and the ambient wiring both need the current audio-clock time. One tiny getter was the least-bad option.
- **No `mangle.properties` on `dist/engine.js`** — the spec asked for property mangling with a regex for internal names. I skipped it: `engine.js`, each opera's `.js`, and the shell's inline script are minified in **separate** terser passes and only agree on behaviour through literal property names on `O` (`O.opera`, `O.load`, `O.G`, `O.voice`, `O.T`, …). Mangling those properties inside `engine.js`'s own pass would rename them without the opera/shell passes knowing, breaking the cross-file contract the whole architecture depends on. Plain `mangle: true` (variables and function names only) already leaves 3,879 bytes of headroom, so there was no pressure to take the risk. If a later phase wants property mangling, it needs a shared, consistently-applied name map across all three build passes, not a per-file regex.
- **`O.play` batches a motif in one audio-clock read, not per-note `tl.call`s.** The spec's literal signature `O.play(voice, [semis, rhythm], t, {vol, pan, beat})` has no `tl` parameter, so it can't schedule each note as its own timeline call the way the old `note()`-per-beat pattern did. Instead `sing` wraps the whole call in one `tl.call`, reads `ctx.currentTime` once, and `O.play` schedules every note's Web Audio automation as offsets from that single read. For a motif spanning a few seconds this is imperceptible drift against `requestAnimationFrame` jitter; visual pulses on the singing actor are still scheduled as separate `tl.to` calls at the correct timeline times, so the picture stays perfectly in sync even if the audio drifts a few milliseconds.
- **`shrink`'s "note fades toward silence" and `dissolve`'s "voice fades under its own release"** are both implemented as a new, quiet `O.voice` call rather than reaching into a still-playing note's gain node — `O.voice` returns nothing (per spec) and doesn't hand back a node to automate further, so there's no live note to fade. Close enough for Phase 0; a future pass could have `O.voice` optionally return its gain node for gestures that need to modulate a note already in flight.
- **`eclipse`'s "dry unresolved chord on snap"** doesn't bypass the room — every `O.voice` call always sends to both master and the room per the generic voice function's fixed routing (spec: "one generic voice function... routes to the room"), and there's no per-call dry/wet flag in the `{vol, pan}` options. It plays the chord as normal; the "dry" quality is approximated instead by choosing a tense numeral (`v` by default) rather than by actually skipping the reverb send.
- **`shell.html` is 1,291 bytes gzipped, not under the 1,024 target** (stretch: 768). The CSS for the grid/dot/cue/label/speech vocabulary and the `?scale` test harness (which has to enumerate four instrument names and eight scale degrees) both cost real bytes that the original plan's shell estimate didn't have to carry. It's not a hard gate — `build.js` only fails the build on the engine, opera, and standalone limits, per the spec's own exit-criteria list, which doesn't mention the shell — and at 1,291 bytes it's a rounding error against the 34,816-byte whole-site budget. I trimmed what was cheap (merged CSS selectors, single-layer glow instead of double, `,`-space stripping in `build.js`'s CSS minifier, `Element.id` global lookups instead of `getElementById`) but didn't chase the last ~250 bytes at the cost of readability.
- **Byte badge (`%%BYTES%%`)** is filled by `build.js` in a small two-pass step for the standalone file (build once with a placeholder, measure its own gzipped size, substitute, done) so the badge shown on a standalone download is that file's own real number, not an estimate. The site page's badge shows engine + shell + opera summed, since that's the actual first-load weight for that page.
- **Timeline doesn't run until Play is clicked.** Early in testing I had `O.load(O.opera)` fire unconditionally on page load (so the stage would be alive even before someone presses Play, mirroring the old ambient mode). That's exactly what the spec says to drop ("Ambient mode is dropped; loop is the only mode"), and it also crashed: gesture callbacks read `ctx.currentTime` unconditionally, and `ctx` doesn't exist until `O.initAudio()` runs from a user gesture. Building the timeline only inside the Play handler (after `O.start()`) fixed both problems at once — it's simpler and it's what the spec asked for.
- **Room topology**: the coordinator caught and fixed a bug in my first pass — both delays fed into one shared low-pass whose single output drove both feedback gains, so the effective loop gain was `fbL + fbR` (0.9, then 1.1 after the bar-8 `roomChange`), which would have howled. It's now two independent filtered feedback paths (`dl → lp → fbL → dr`, `dr → lp2 → fbR → dl`), each ramped by `O.setRoom`. Verified by reading the current file rather than re-deriving it.

## Gesture and gap notes

- `ritardando` does all its work in `score.js`'s tempo-map pass before scheduling, exactly as the spec requires; `O.G.ritardando` is a no-op placeholder that exists only so the gesture-name contract holds (unknown-gesture names throw at load).
- `freeze` is a genuine no-op — the engine has no per-actor pause primitive, so "freeze" is simply not scheduling any change for its duration, which reads correctly on stage (nothing moves) without needing new machinery.
- `chord`'s diminished quality flattens the fifth by one semitone off the diatonic scale tone rather than deriving a true diminished triad from first principles; documented as a simplification rather than silently wrong.
- All 20 gestures from the ranked list in `docs/gestures.md` are implemented in `src/engine/gestures.js` and each is exercised at least once in `operas/scratch.js`.

## Files delivered

`src/engine/{tween,synth,stage,gestures,score,index}.js`, `src/shell.html`, `operas/scratch.js`, rewritten `build.js` (keeps the original root `index.html` build as step one, then builds `dist/`), and `.claude/launch.json` updated to serve `dist/`. `src/index.src.html` and `about.html` were not touched.

## Phase 0.5: voices and the ascension (26 Sep 2026)

Build output after porting the formant soprano, the original tenor/bass/arp recipes, and the `ascend` gesture:

```
[original site] index.html: 35936 bytes, 12275 bytes gzipped, limit 12288, 13 spare
engine.js: 20525 bytes, 7246 bytes gzipped, limit 10240, 2994 spare
synth.js (standalone measure): 9464 bytes, 3056 bytes gzipped
shell.html: 2696 bytes, 1317 bytes gzipped
scratch.js: 1385 bytes, 656 bytes gzipped, limit 2048, 1392 spare
scratch.standalone.html: 24570 bytes, 8990 bytes gzipped, limit 12288, 3298 spare
site total (engine + shell + all operas): 9219 bytes gzipped
```

All hard gates still pass, with less headroom than Phase 0: engine at 7,246 of 10,240 (2,994 spare, down from 3,879), scratch opera at 656 of 2,048 (1,392 spare), standalone at 8,990 of 12,288 (3,298 spare). `synth.js` alone now gzips to 3,056 bytes — right at the top edge of the guide's 1.5–3 KB benchmark (3,072 bytes), 16 bytes under.

**What the formant soprano cost**: isolating just the `formant` branch and the soprano's harmonic/formant/LFO/breath fields (reverting to a plain-sine soprano and re-minifying/re-gzipping for comparison) puts the soprano recipe at **463 gzipped bytes** on its own — the rest of the ~590-byte synth.js growth is the tenor's filter-close/grit/sub-octave fields, the bass octave drop, the arp wave change, and the per-instrument room-send weighting.

### What I changed from the spec

- **The soprano's 5.8/3.4 "cents" LFO depths are ported as raw Hz offsets, not converted to cents.** The original `note()` connects the vibrato LFO's gain (value 5.8 for soprano) directly to each harmonic oscillator's `.frequency` AudioParam, which is an absolute-Hz additive offset, not a cents-scaled one — despite the guide's language. I ported that behaviour exactly rather than "fixing" it into a true cents conversion, since item 1 says to port the branch exactly and the original engine already treats vibrato this way for tenor (`vibratoDepth: 4`, also raw Hz).
- **`ascend`'s arp doesn't transpose for the "octave up" final chord.** `O.arp(numeral, ...)` recomputes its own bass/colour from `O.chord(numeral)` with no octave parameter in its public signature, so the bass/tenor voicing for the last chord shifts up an octave (per spec) but the arp underneath it stays at the base register. Extending `O.arp`'s contract felt like the wrong tradeoff for one bar of one gesture; noted rather than silently fixed.
- **Room-send is now a per-instrument multiplier (`inst.roomSend`, default 1) in series with the existing shared `O.roomSend` bus**, rather than every voice connecting to that bus directly. Tenor/bass/arp default to 1, preserving Phase 0's exact mix; soprano is set to 1.55 (≈ 0.62⁄0.40, the original's soprano-vs-everyone-else send ratio) so it gets measurably more room without touching the room's own topology.
- **`operas/scratch.js`'s soprano `hold` lines land at the start of the next bar** (`3.1` and `6.1`), which is where the actor's `sing` phrase actually finishes (the motif's 8-eighth rhythm fills exactly one bar), rather than at some fraction into the following bar — this does mean the hold overlaps whatever the score already has scheduled at those bar-starts (the `chord`/`arpChorus`/`approach` line at `3.1`, `eclipse`/`silence` at `6.1`). That's a deliberate layering, not a collision bug: the hold is quiet (`vol: 0.12`, from the existing `hold` gesture) and the point of the exercise is exactly to hear the formant voice bloom against the rest of the texture.
- **The scratch score grew a ninth bar** (`['9.1', 'ascend', null, {}]`) to fit the purple section in before the outro without deleting anything from bars 1–8; `score.js` derives the intro/outro split from the highest bar referenced, so this pushed the outro later automatically rather than needing any engine change.
