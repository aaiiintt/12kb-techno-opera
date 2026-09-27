# 04. Engine and kit notes

The reference is `docs/KIT.md`. These are the things that bit us, and where things live.

## Kit gotchas

- **`k.paint` and `k.pilot` act immediately**, at build time, not at their timeline moment. Operas wrap them: `const paint = (els, name, t, force) => T.call(() => k.paint(...), [], t)`. Scheduling a paint at `t - 0.01` (just before the note that lights it) is the house convention.
- **Characters and mass paints.** Carmen's `paint` skips any cell in `chars` unless `force` is set. A character is pushed onto `chars` **when they enter** (`T.call(() => chars.push(jose), [], t)`), not at build start, or their empty cell shows up as a rogue dot inside other people's colour sweeps (the "two beige circles in L'amour" bug).
- **Transforms are factories:** `k.T.inv()(pair)`, not `k.T.inv(pair)`. Getting this wrong throws inside `build` and silently cuts every act after it.
- **`k.pilot(el, null)` clears a resting light.** Clear every character's pilot in the loop reset, including the cells they hopped to during the opera (Carmen clears `cell(2,4)` and `cell(3,4)` because José ends there).
- **`k.hop(from, to, t)`** moves the pilot claim and, 0.4 s later, restores the vacated cell to the light it had before (stage.js remembers `el._was`). It no longer pops the destination by default (characters don't grow); pass a fourth argument to pop.
- **Captions are bilingual.** `k.say` takes a string or an `[english, original]` pair; `O.getText` picks by `O.lang` (`'en'` default, `'orig'` via the EN/IT toggle beside the byte badge, `O.setLang`). Emoji in captions render with the system emoji font; nothing to configure. Tags are removed at each `k.act`.
- **`k.say(el, ...)`** skips silently if `el` is undefined (a cell that doesn't exist on a small grid). Put captions on cells near the stage so phones show them.
- **`k.shot(size, t, { on: [col, row], dur })`**: wide, mid (about 5 cells across the short side), close (about 2.5). A cut unless `dur` is given. To follow a walking character, call it at each hop with a short `dur`. Zoom is resolved when the move plays; if the page had no size then (hidden tab), it falls back to wide instead of scaling to zero.
- **`k.silence(t, dur)`** mutes the master output hard. Don't use it right after a chord you want to ring out; leave time instead.
- **`k.note(voice, semi, t, dur, { vol, light })`**: `light` is a cell or an array of cells, lit by the note's envelope. A quiet note still lights fully if its envelope is loud relative to the light curve; the strobe/glint trick is a bright short note on a cell.
- **Story colours** are declared like any light in `O.opera.lights`; white is the built-in `'bulb'`.
- **Seeded random.** Use an LCG (`seed = seed * 16807 % 2147483647`) so every rebuild (and every step-mode frame) is identical. `Math.random` makes frames differ between visits.

## Engine facts

- **Light is the voice.** A disc lights by the envelope of the sound that lights it (`registerLight`), evaluated on the audio clock in one rAF loop. Resting (pilot) lights sit at amp 0.3. Discs are flat OKLCH: hue, max chroma and max lightness per light; chroma follows √amp; off is L 0.22.
- **Grid.** Runs edge to edge; the central 9×9 is the stage; `O.at(col, row)` accepts coordinates outside it. Cells only; no floating actors. The grid rebuilds whole on resize, which loses pilot claims (the opera keeps playing).
- **Voices** (`O.inst` in synth.js): `tenor` (two detuned saws, filter, late vibrato), `soprano` (the formant recipe: scoop, breath, late vibrato; the benchmark voice), `bass` (triangle, an octave down), `arp` (square, short). Drums: `kick`, `snare`, `hat`, `heartbeat`. `O.setRoom(cutoff, feedback)` is the one two-delay room. Don't change `O.inst` values without asking; they were tuned to Iain's taste.
- **Step mode** (`?step=N`, `src/engine/index.js`): rebuilds the opera, seeks the timeline to the frame with a virtual clock, runs every `tl.call` up to it in order. Anything scheduled from *inside* a call at rebuild time won't be seen by a seek; schedule at build time (why `hop` schedules the restore up front).
- **Chrome** (`src/shell.html`): `layout()` measures the dots (ignoring the camera transform) and sizes the title to the first two whole rows and MENU/PLAY to the last whole row, edges on the first and last whole columns. The menu overlay is a plain column that deliberately breaks the grid. `.pl` on `body` fades the title and MENU to zero while playing; MENU returns on hover/open. PLAY loads on first press; after that it pauses/resumes (`O.tl.paused`, `O.suspend`).
- **Build** (`build.js`): concatenates the engine files into one IIFE exposing `O`, minifies with terser, injects the menu (`%%MENU%%`) and byte badge (`%%BYTES%%`), writes three files per opera plus index and about, gates sizes.

## Known quirks

- In step mode, a first load occasionally shows every light off until reload. Suspected: the light loop not starting before the page is visible. Unverified; see 06.
- The browser pane, when emulating a wide viewport (1440), renders scaled into a corner. A tool artefact, not a page bug. Test at the pane's own size or at the mobile preset.
- `review/server.js` still carries old budgets (2 KB opera, 10 KB engine) in its constants; they're not the build's gates. The panel it serves is retired.
