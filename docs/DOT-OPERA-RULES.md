# Dot opera: the rules

A dot opera is a famous opera retold in about a minute by a grid of lights and a few synthesised voices. The whole piece ships in a few kilobytes. **Max opera, minimum filesize.**

These are the core principles. Break a detail if the story needs it; never break a principle.

## 1. Story

- **Condense, don't summarise.** Keep the key plot points and cut everything else. Five to seven acts, each one idea, about 60 seconds in total (up to 120 if the story truly needs it).
- **Follow a hero.** One disc is the hero and we follow their journey. At most two other characters. The crowd, the weather and the world are the rest of the grid.
- **Sweet underneath, austere on top.** The characters are small round lights with big feelings: a heartbeat, a flower, a hop. The presentation is stripped back and serious.
- **Loop.** The last moment is the first moment, so the piece plays forever.

## 2. Music

- **Use the opera's most recognisable music.** The tune everyone knows, arranged for the house voices, as the hero's theme. Quote its melody and rhythm accurately; simplify its harmony. Notes are scale degrees; add `#` or `b` for chromatic notes (`7#`), and `+` or `-` for octaves (`1+`, `5-`), in that order: `7#+`.
- **Store it once, transform it.** The tune is written once. Every other appearance is a transform: transposed, inverted, minor, slowed, fragmented, or sung by a different character.
- **Four voices, each a character.** Tenor (warm, rough), soprano (formant, with vibrato that arrives late), bass (felt more than heard), arp (music-box shimmer that stands in for the chorus and the chords). Filtered noise for percussion and breath. One room.
- **Drama is cheap.** Silence before the big moment. A crescendo. A held note. The room opening or closing. Use these before adding anything.

## 3. Light

- **A disc is lit because something is sounding.** Its brightness is the sound's envelope. No light without sound, except a character's dim pilot light at rest.
- **Flat discs, eight lights.** Solid circles, no gradients. Lights by name only: bulb, gold, sakura, coral, lemon, mint, sky, violet. At most two plus bulb in any act; a rainbow is the only exception.
- **Everything is on the grid.** Characters are lit cells. They hop cell to cell and leave an ember. The grid runs edge to edge; the story plays on the central stage, and the outer cells are for rare full-screen moments.
- **The grid never moves. The camera cuts.** A rare hard close-up on a disc, a snap back, a shake. Never a drift.
- **Background is black**, or one light cut on a beat.

## 4. Choreography

- **One mass move and one soloist at a time.** The grid does one thing while the hero does another. Never two mass moves together.
- **One idea per act, held long enough to feel.** Change on a cut.
- **The vocabulary is a tasteful LED display.** Hop, bounce, pulse, grow, shrink; chase, comet, scan, spiral; fill from the top, centre or edge; flash, explode, ripple, sparkle; rainbow; decay, burn, snow. The full list with parameters is in `docs/engine-api.md`.
- **Type is one lower-third cue per act at most.** Typed in, one to three words, uppercase, in the opera's language, in the register of an old videogame: HELP!, AVANTI!, ADDIO.

## 5. Size

- **One opera file: under 2,048 bytes gzipped.** Aim for about 1,000. The engine, shell and voices are shared.
- **Data, not code.** The opera is one object: cast, tune, chords, and a score of timed gestures. If you write something twice, it should be a transform.

## 6. Check before you ship

Build it. Open it with `?gate=` and the six seconds that matter most; it plays muted and freezes at each. Look at every frame and ask: is it flat, still, on-palette, one mass move, lit only by sound, and could it be one of the reference frames? If it could be a slide transition, it's wrong.

## Reference

- `docs/engine-api.md`: every gesture, instrument and transform, and the score format.
- `operas/carmen.js`: a finished dot opera.
- `docs/music-guide.md` and `docs/visual-guide.md`: the long versions of sections 2 and 3, for when you want the why.
