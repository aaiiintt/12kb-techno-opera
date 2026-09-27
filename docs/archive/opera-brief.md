# Opera drafting brief (v3)

You are drafting one opera as a data file for the engine. Read, in order, and nothing else:

1. This file.
2. `docs/visual-guide.md` in full. It is the law. Its rules and its taste gate are hard rules.
3. `docs/music-guide.md`, the "rules to write on the wall" and the sections on motifs, harmony, dynamics and silence.
4. `docs/engine-api.md`: every gesture, its params and defaults, the instruments, the transforms, the score time formats. This is the whole API. Do not read engine source.
5. `docs/stories-v3.md`: only your opera's card. It names the hero, the acts, and per act the light, the soloist move, the mass move and the cue.
6. `archive/operas-v2/<id>.js`: only for its music block (tempo, root, mode, motif, chords, room, and how `sing` lines use transforms). The music was approved; keep it. Ignore everything visual in it.
7. `operas/lights.js`: the reference demo of the v3 engine. Copy its file shape and how it lights the hero, holds notes and uses the close-up.

## What to write

`operas/<id>.js`, assigning `O.opera = {...}`:

- `title` uppercase, `lang`, `tempo`, `root`, `mode`, `motif`, `chords`, `room`, `intro`, `outro` from the card and the v2 music.
- `stage: { grid }` once; the grid never changes.
- `cast`: the hero and at most two others, each `{ color: <light name>, voice }`. Light names only: bulb, gold, sakura, coral, lemon, mint, sky, violet.
- `score`: the card's acts in order. Intro in seconds, the body in `'bar.beat'`, the outro in `'oN'`.

## Rules

- A disc is lit because something is sounding. Never light a cell without a gesture that sounds it. Named characters have a dim pilot light at rest; that is the only light without sound.
- One mass move and one soloist move at a time. Never two mass moves overlapping.
- At most two lights plus bulb in any act, except during a rainbow.
- The hero is always on stage and the story follows them.
- Every `sing` and `hold` is on an actor so their disc follows the voice. Use `hold` for long operatic notes.
- The cue is the only type. Keep the card's cues, in order, in the opera's language.
- The last state is the first state, so the loop is seamless.
- Budget: 2,048 bytes gzipped. Aim under 1,200.

## Before you report

1. `npm run build` passes and prints your opera's size line.
2. Work out the six gate times, in seconds from play, for the card's six taste-gate frames: intro seconds, then each bar is 4 × 60 / tempo seconds (stretch for any ritardando before it). Aim for the peak of each move, not its start.
3. Open `dist/<id>.html?gate=t1,t2,t3,t4,t5,t6` in the built-in browser and press play. Gate mode is muted and freezes the picture and the audio clock at each listed second. Take a screenshot at each freeze, then run `O.gateNext()` in the console to continue to the next. Attach a `window.onerror` listener before pressing play; it must stay empty.
4. Check each frame against the visual guide's taste gate. Fix anything that fails and repeat.
5. Close every tab you opened with `tabs_close`.

Do not edit any other file. Do not commit. Report back in under 150 words: the size line, whether it loops clean, what each of the six frames shows in one line each, and anything the card asked for that the engine could not do.
