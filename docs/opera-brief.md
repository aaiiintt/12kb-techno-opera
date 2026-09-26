# Opera drafting brief

You are drafting one opera as a data file for the engine. Read, in order, and nothing else:

1. This file.
2. `docs/PLAN.md` section 0 (decisions) and section 8 (music rules).
3. `docs/music-guide.md`, the "rules to write on the wall" and the sections on motifs, harmony, counterpoint, dynamics and silence.
4. `docs/engine-api.md`: every gesture, its params and defaults, every instrument field, every transform, the score time formats. This is the whole API. Do not read engine source.
5. `docs/stories.md`: only your opera's card.
6. `operas/scratch.js` and `operas/scratch2.js` as examples of the file shape and of how gestures are called. They are not art.

## What to write

`operas/<id>.js`, assigning `O.opera = {...}` exactly in the module shape the engine-api documents. Ids: carmen, pagliacci, rigoletto, dido, flute, giovanni, barber, turandot.

- Title in uppercase, `lang` from the card.
- `tempo`, `root`, `mode` from the card. Modes available: major, minor, dorian, phrygian, lydian, mixolydian, harmonic.
- `cast`: the card's actors, three at most, ids `a`, `b`, `c`, each with color, size and voice. The chorus is the grid.
- `motif`: the card's scale degrees and rhythm string, as `[degrees, rhythm]`.
- `chords`: the card's roman numerals as a string.
- `room`: starting cutoff and feedback.
- `intro` and `outro` seconds from the card's sections.
- `score`: the card's beats, translated to gesture lines. Intro beats use seconds, re-version beats use `'bar.beat'`, outro beats use `'oN'`. Every STAGE line becomes one or more stage gestures, every SOUND line one or more sound gestures, every CUE line a `cue`. Put stage and sound lines for the same beat at the same time.

## Rules

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
4. One clear visual idea, the card's dot idea, happens and is the biggest thing on stage.
5. The ascension test: is there one moment as good as the purple section (full chords, a ring pulse, the room opening)? If the card's drama allows an `ascend`, use it once.

Do not edit any other file. Do not commit. Report back in under 120 words: the size line, whether it plays and loops clean, the one thing you are least sure of, and any gesture you needed that does not exist.
