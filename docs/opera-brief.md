# Opera drafting brief

You are drafting one opera as a data file for the engine. Read, in order, and nothing else:

1. This file.
2. `docs/visual-guide.md` in full. The series map names your piece's mode. Its rules are hard rules.
3. `docs/PLAN.md` section 0 (decisions) and section 8 (music rules).
4. `docs/music-guide.md`, the "rules to write on the wall" and the sections on motifs, harmony, counterpoint, dynamics and silence.
5. `docs/engine-api.md`: every gesture, its params and defaults, every instrument field, every transform, the score time formats. This is the whole API. Do not read engine source.
6. `docs/stories-v2.md`: only your opera's card. It is a visual score: lighting state, energy, the mass, the singled-out dot, type and the bind, per section.
7. `operas/scratch3.js` for how the spectacle gestures, `stage` and `energy` are called, and `operas/scratch.js` for the file shape. They are not art.

## What to write

`operas/<id>.js`, assigning `O.opera = {...}` exactly in the module shape the engine-api documents. Ids: carmen, pagliacci, rigoletto, dido, flute, giovanni, barber, turandot.

- Title in uppercase, `lang` from the card.
- `tempo`, `root`, `mode` from the card. Modes available: major, minor, dorian, phrygian, lydian, mixolydian, harmonic.
- `stage`: the card's opening lighting state as `{bg, grid, dot, gap}`.
- `cast`: the card's forces as actors, ids `a`, `b`, `c`, each with color, size and voice. A force that is never a single dot still needs a cast entry for its voice; just never `enter` or `appear` it. The chorus is the grid.
- `motif`: the card's scale degrees and rhythm string, as `[degrees, rhythm]`.
- `chords`: the card's roman numerals as a string.
- `room`: starting cutoff and feedback.
- `intro` and `outro` seconds from the card's sections.
- `score`: the card's sections, translated to gesture lines. Intro beats use seconds, re-version beats use `'bar.beat'`, outro beats use `'oN'`. Every section opens with its `stage` change (if the lighting state changes) and its `energy` level. The mass line becomes the spectacle or crowd gesture named. The singled-out dot line becomes actor gestures. Type becomes `cue` or `titleCard` at the size given. The bind says which sound line each stage line shares a time with; put them at the same time.

## Rules

- The piece must be recognisably in its mode. If your mode is pure feeling, no actor is ever a visible dot. If it is instrument, every note lights a cell. Read the series map.
- Every section changes the lighting state and sets energy. Never leave energy at the default.
- One bloom, at the card's moment. At least one shimmer. Every `sing` visible. Every chord an event.
- One motif. Every sung line is `sing` with a transform or none. Do not write a second tune into params.
- Silence and crescendo where the card says, and at least one of each.
- The card's turnaround must be real: the last outro gestures leave every actor and the room where the first intro gesture expects them, so the loop is seamless.
- Change-voice is the plot: when the card says a different singer takes the motif, that is `sing` on the other actor.
- Cues are the card's, in the card's language, uppercase, with punctuation.
- Budget: 2,048 bytes gzipped for the file. The build fails above it. Aim under 1,500.
- Length: what the card says, about 60 seconds, up to 120.

## Checklist before you report

1. `npm run build` passes and prints your opera's size line.
2. `dist/<id>.html` plays end to end and loops in the built-in browser with a `window.onerror` listener showing nothing. Then close every tab you opened with `tabs_close`. Audio left playing disturbs Iain.
3. Recognisable in ten seconds: someone who knows the opera would know which it is from the first cue and the first sung phrase.
4. The arc: the card's colour journey happens, section by section, and the bloom lands where the card puts it.
5. The diagram test: if the stage could be a diagram of the plot, it is wrong. Something wipes, floods, blooms, strobes or shatters in every piece; the dots read as lamps; something shimmers.
6. It could not be mistaken for any other piece in the series.

Do not edit any other file. Do not commit. Report back in under 120 words: the size line, whether it plays and loops clean, the one thing you are least sure of, and any gesture you needed that does not exist.
