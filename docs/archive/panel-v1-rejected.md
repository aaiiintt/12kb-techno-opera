# The panel

A dev-only control surface for authoring opera modules (PLAN.md section 2). It reads and writes the plain-object shape — cast, mode/root/tempo, motif, chords, patterns, sequence, score — and previews the result live. No byte budget. Not shipped.

## Research: what to steal

- **Renoise / FastTracker.** The pattern-and-sequence grid, not the piano roll, is the composing surface — you type into cells, and repetition is structural, not incidental. Steal: patterns as named blocks, sequence as an index list.
- **LSDJ.** Every parameter lives on a tight numeric grid with no modal dialogs — you never leave the groove to tweak an envelope. Steal: inline sliders next to the note, not a separate "instrument properties" window.
- **Sointu's tracker / 4klang.** The synth is a small set of opcodes and the UI is literally the opcode list with sliders; the editor and the runtime share one model. Steal: the instrument editor's fields are exactly the engine's instrument object, nothing invented for the UI.
- **Farbrausch's V2 / Werkkzeug.** A live byte-cost readout sits next to every parameter change, so the trade-off is visible while you're still turning the knob. Steal: the always-on byte meter.
- **Strudel / Tone.js live patching.** Code and sound update on every keystroke with no explicit "run" step — the gap between editing and hearing is zero. Steal: auditioning a transform or a motif edit plays immediately, no apply button.
- **Bret Victor's scrubbable documents.** Dragging a number should let you see and hear the state at every value in between, not just the final one. Steal: the scrubber scrubs audio too, not just visual playhead.
- **Ableton's clip and automation view.** Gestures are blocks on a lane, automation is a breakpoint line under it, and both share the same horizontal time axis as the transport. Steal: one lane per actor, blocks you drag and resize, params below the block rather than in a modal.
- **Figma's variables panel.** Tokens are named, typed, and reused everywhere they apply, with one place to change a value that fans out. Steal: the global tokens panel is a flat list of named values the rest of the UI binds to, never hardcoded twice.

## 1. Wireframe

```
┌─────────────────────────────────────────────────────────────────────────┐
│ OPERA: CARMEN ▾        [ GLOBAL ] [ SOUND ] [ SCORE ]   ⏺ MODULE 1.4KB  │
│                                                          ⏺ STANDALONE 9.1KB│
├───────────────┬───────────────────────────────────────────────────────┤
│ CAST & VOICES │  STAGE PREVIEW                                        │
│ ○ carmen      │  ┌─────────────────────────────────────────────────┐ │
│   voice tenor▾│  │                                                 │ │
│   color ■     │  │              · · · ·  o  · · · ·                │ │
│ ○ jose        │  │                                                 │ │
│   voice sopr ▾│  │                    "L'AMOUR."                   │ │
│   color ■     │  └─────────────────────────────────────────────────┘ │
│ + add actor   │                                                       │
├───────────────┴───────────────────────────────────────────────────────┤
│ MOTIF   0 -1 -2 -3 | x.x.x-      [T][m][INV][AUG][DIM][FRAG][RETRO] ▶ │
│ CHORDS  [0,m] [5,m] [7,M] [0,m]                                       │
│ PATTERNS  A: A...A...   a: A.a.A.a.   B: ....B.B.                     │
│ SEQUENCE  0, 0, 1, 2, 1, 3                                            │
├────────────────────────────────────────────────────────────────────────┤
│ INTRO (sec)         │  RE-VERSION (bar.beat)          │ OUTRO (sec)   │
│ 0    2    4    6   8│  1.1  1.3  2.1  2.3  3.1  3.3  4.1│  0   1   2  3│
│──────────────────────────────────────────────────────────────────────│
│carmen │[enter]────  │        [sing:invert]══           │              │
│jose   │              │  [orbit]══════                  │  [exit]──   │
│sound  │              │  ▓cue▓  ▓chord▓───▓room:close▓   │              │
├────────────────────────────────────────────────────────────────────────┤
│ ◀◀  ▶  ■   00:14.2 / 00:58.0   ▬▬▬▬▬▬●───────────────────  loop [x]   │
└────────────────────────────────────────────────────────────────────────┘
```

Top bar: opera picker, tab switcher (Global / Sound / Score — Global and Sound are drawers over the same layout, Score is the main view above), and the byte meter, always visible, both numbers always live.

## 2. Controls

| Control | Type | Maps to | Default |
| --- | --- | --- | --- |
| **Global** | | | |
| Palette | 5 color swatches | `palette[]` | current site palette |
| Background | color | `--bg-deep`, `--bg-glow` | `#080706`, `#18130f` |
| Grid size | slider (rows × cols) | `buildGrid(rows, cols)` | 9 × 9 |
| Grid shape | select (square, hex, ring) | `buildGrid(shape)` | square |
| Dot shape | select (circle, square, glyph) | `.dot` shape variant | circle |
| Typeface | select (system stack) | `--font-swiss` | Helvetica Neue stack |
| Cue position | select (lower third, center, top) | `.cue` position class | lower third |
| Cue type-in speed | slider, ms/char | `cue(text, speed)` | 28 ms |
| **Sound** | | | |
| Voice preset | select per actor (tenor, soprano, mezzo, bass, chorus) | `cast[actor].voice` | per house cast |
| Instrument sliders | grid, 8 sliders per voice | `instruments[voice]` fields | see section 3 |
| Drum kit | 4 toggles (kick, snare, hat, heartbeat) | `drum(type, params)` | kick + hat on |
| Room preset | select (crypt, hall, bright) | `room.cutoff`, `room.feedback` | hall |
| Room cutoff / feedback | 2 sliders | `room.cutoff`, `room.feedback` | 1600 Hz, 0.5 |
| Key / mode | select | `root`, `mode` | 2, phrygian |
| Tempo | slider, 40–200 bpm | `tempo` | 72 |
| **Score** | | | |
| Actor lane | row, one per cast member | `score[]` filtered by actor | — |
| Sound lane | row | `score[]` filtered by `gesture` in {chord, arp, drum, room, sing} | — |
| Gesture block | drag-drop grid cell | one `score` entry `[time, gesture, actors, params]` | — |
| Block params | inline form, fields per gesture | `params` object | gesture defaults |
| Time ruler mode | toggle, seconds ↔ bar.beat | display only, stored value unchanged | seconds in intro/outro |
| **Preview / export** | | | |
| Transport | play, pause, stop | scheduler clock | stopped |
| Scrubber | draggable playhead | `tl.seek(t)` | 0 |
| Loop | toggle | scheduler loop flag | off |
| Byte meter (module) | numeric readout | gzip size of opera file | live |
| Byte meter (standalone) | numeric readout | gzip size of inlined build | live |
| Export | button | writes `opera/<name>.js`, runs build | — |

## 3. Instrument editor

One row per voice (tenor, soprano, bass, arp), one slider per field of the instrument object, matched to the music guide exactly — no invented parameters:

`wave` (select: sine, triangle, saw, square) · `detune` (±15 cents) · `attack` (0–200 ms) · `decay` (0–4 s) · `filterStart` (200–8000 Hz) · `filterEnd` (200–8000 Hz) · `vibratoDepth` (0–20 cents) · `vibratoDelay` (0–400 ms).

Each row has an **audition** button that plays a C major scale, ascending then descending, on that voice alone at the current tempo. This is the guide's own "done when" test for casting voices — the panel just wires a button to it. Editing any slider mid-scale updates the next note, so the scale becomes a live scrub through the instrument's parameter space (the Bret Victor idea).

## 4. Motif and pattern editor

**Motif** is two text fields side by side: scale degrees (`0 -1 -2 -3`) and a rhythm string (`x.x.x-`, `x` a hit, `.` a rest, `-` a hold). Typing in either re-plays the motif on the currently selected voice after a 300 ms debounce — no apply step.

**Transforms** are seven buttons: Transpose (with a semitone stepper), Minor, Invert, Augment, Diminish, Fragment, Retrograde. Clicking one does not mutate the stored motif — it plays the transformed result immediately and shows the resulting degree string in a read-only preview field with a "commit as new motif" or "use inline in this pattern" choice. This keeps the one-motif rule honest: transforms are always computed, never hand-typed as a second motif.

**Patterns** are one-character-per-step text fields, one row per pattern letter (`A`, `a`, `B`, …), each with a step count set by the tempo/subdivision. A pattern field auto-plays on blur.

**Sequence** is a horizontal strip of pattern-letter chips in order, editable by drag-to-reorder or by typing a comma list (`0,0,1,2,1,3`); it's the row directly under the pattern list, so the composing surface reads top-to-bottom exactly like a tracker's pattern-then-order pane.

## 5. Score editor

A gesture is placed by clicking an empty cell on an actor's or the sound lane's timeline; the panel inserts `[time, gesture, actors, params]` with default params and opens the params form. Dragging a block moves its time; dragging its right edge, where the gesture supports a duration, resizes it. Clicking a block re-opens the params form beside the lane, not in a modal, so the timeline stays visible while you edit (Ableton's automation-under-the-clip layout).

Time display follows PLAN.md section 7: the ruler shows **seconds** across intro and outro and **bar.beat** across the re-version, as three concatenated ranges with a visible section-boundary tick. A toggle flips the whole ruler to the other unit for checking; the stored `time` value is untouched — the toggle is a display transform computed from `tempo`, never round-tripped into the data.

## 6. Export

Export writes the current in-memory module object to `opera/<name>.js` as the literal data object from PLAN.md section 2, then invokes the existing `build.js` for both outputs. The panel shows two numbers, gzipped: the opera module alone, and the standalone single-file build for that opera. Either number turning red (over its section 3 target) fails visibly — a red border on the meter and a blocking banner ("STANDALONE OVER BUDGET BY 640B") — export still writes the file so you can inspect it, but the panel refuses to call it "done" until both are green.

## 7. Stack recommendation

Plain TypeScript, Vite, no framework. The panel is one page with a canvas-drawn stage preview, native `<input type="range">` sliders, and a hand-rolled timeline grid — none of that needs component reactivity beyond "re-render this div when this value changes," which plain DOM code does in a few lines. A framework would earn its weight only if the panel grew nested reusable components with real local state (it doesn't — actors, sliders and blocks are flat lists over one shared module object) or if the source shouldn't be readable without framework knowledge (this repo's whole point is that it should be).

No new runtime dependencies — the panel never ships. Dev dependencies, each justified:

- **vite** — dev server and TS transform for the panel page. Not currently in `package.json`; add it as a devDependency scoped to the panel only, separate from `build.js`, which keeps shipping the operas.
- **typescript** — type-checking the module shape against the PLAN.md section 2 object, so a malformed opera module fails in the editor, not in the browser.

`terser` and `clean-css`, already devDependencies, are reused as-is by invoking the existing `build.js` from the export button; the panel doesn't reimplement the build.

## 8. Build order

**Day one, in order:** global tokens drawer (it's static config, proves the module read/write round-trip) → instrument editor with audition scale (proves audio wiring and the one thing the music guide tests for) → motif/pattern/sequence editor with live audition on transform (proves the data model for the score) → a read-only score timeline that just renders an existing opera module's `score[]` as blocks, no editing yet → byte meter reading the current module through `build.js`, wired to the export button that just writes the file (no build UI polish). That's a usable panel: you can cast voices, write a motif, and see and hear whether it's in budget.

**Can wait:** drag-to-place and drag-to-resize on the timeline (start with a form: pick actor, gesture, time, params, add row); the bar.beat/seconds ruler toggle (ship seconds-only first, since bar.beat is only needed once a re-version section exists); grid shape and dot shape beyond circle/square (cosmetic); loop and scrub-while-playing (nice, not blocking); drum kit toggles beyond kick+hat (percussion is one noise buffer either way); a `type_url`-style opera picker beyond a hardcoded file list. All of it composes cleanly onto the day-one core because every later feature edits the same module object the core already reads and writes.
