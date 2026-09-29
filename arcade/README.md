# Dot Opera Arcade

**The goal.** Three playable operas that are Nintendo-level fun at under 48 KB each, with remarkable chiptune operatics: original orchestration of recognisable classics, and stories that make opera lovers smile and opera haters chuckle and want to know more.

A fork of Dot Opera where the operas are playable: famous operas retold in about a minute as small games on a grid of glowing discs, built on [LittleJS](https://github.com/KilledByAPixel/LittleJS).

The brief is the parent project's (`../docs/BRIEF.md`): flat discs on black, colours from the staging, the opera's tune quoted, one caption style, one wink, small. The new rule is that the audience plays it, with one finger, on a phone.

## Layout

```
package.json        littlejsengine (npm) and terser; nothing ships at runtime but the engine
build.mjs           games/<id>/ -> dist/<id>.html, one self-contained file each, gzipped size and gate
games/<id>/         one folder per opera: index.html (dev page), game.js, build.json
games/carmen/       Carmen: six microgames (catch, untie, hold, flip, glory, reject)
games/barber/       Il barbiere di Siviglia: serenade, slip, stagger, tune, shave, wed
games/traviata/     La traviata: toast, snip, renounce, fling, read, give
games/hello/        the kit demo: grid, hero, hops, notes, rings, bloom. Proves the toolchain, not art
lib/microgame.js    the runner: six acts on a beat grid, curtain / command / action / outcome, the result card, input
lib/synth.js        the Dot Opera synth ported to LittleJS's audio context: voices, room, drums, score helpers
lib/pixels.js       sprites and a 3x5 font drawn in code and baked into one texture; the 256x144 pixel canvas
lib/gameFx.js, textureGenerator.js   helper modules vendored from LittleJS-AI (MIT), unused so far
test/smoke.mjs      headless Chromium: every built page loads, runs, takes input, no errors
test/play.mjs       plays an opera through for N seconds with keys, a screenshot every 1.5 s
test/sheet.mjs      contact sheets from those screenshots, for review
docs/               LITTLEJS-NOTES.md (what the engine gives us, how it fits the opera synth), the js13k size-coding guide
dist/               build output, not committed
```

Skills for working here are in `../.claude/skills/`: `opera-game` (the workflow), `littlejs-conventions`, `littlejs-api` and `atlas-shape-art` (vendored from the engine author's Claude Code plugin).

## Run

```bash
npm install
npm run serve      # then open http://localhost:4174/games/hello/
```

## Build and test

```bash
npm run build      # prints the gzipped size of each dist page and fails on its gate
npm test           # needs a build first; SHOT=<dir> also saves a screenshot per game
node test/play.mjs carmen /tmp/play-carmen 80 && node test/sheet.mjs /tmp/play-carmen   # frames of a whole play
```

## Shots

Every act names its shot: wide (the whole stage), mid (half of it) or close (a quarter), on a focus point, and an outcome can cut. Untie is a close-up on the rope round her wrists; the signature and the candle are close; the bullring and the party are wide. Captions and the HUD stay at screen size whatever the shot.

## The form

Six acts per opera. Each act: a four-beat curtain with the act's name and aria, a one-beat command card (CATCH!), an action window of 8 to 16 beats with one job (move, mash, hold, tap on the beat, dodge, choose, steer, shield, reach), and a staged outcome. Failure is the other version of the scene and the story advances either way. After six, a result card: bravos out of six and the ending you earned. Keyboard Left, Right and Space; an on-screen gamepad on phones.

## Size

| Page | Gzipped |
| --- | --- |
| `dist/carmen.html` | 25.2 KB |
| `dist/barber.html` | 25.6 KB |
| `dist/traviata.html` | 25.5 KB |
| `dist/hello.html` (engine core, bloom plugin, the demo) | 15.9 KB |

The engine core alone is about 15 KB gzipped, so an arcade opera lives at a different scale from the 12 KB original. Measure, never estimate: `docs/SIZECODING-js13k.md`.
