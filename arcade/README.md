# Dot Opera Arcade

A fork of Dot Opera where the operas are playable: famous operas retold in about a minute as small games on a grid of glowing discs, built on [LittleJS](https://github.com/KilledByAPixel/LittleJS).

The brief is the parent project's (`../docs/BRIEF.md`): flat discs on black, colours from the staging, the opera's tune quoted, one caption style, one wink, small. The new rule is that the audience plays it, with one finger, on a phone.

## Layout

```
package.json        littlejsengine (npm) and terser; nothing ships at runtime but the engine
build.mjs           games/<id>/ -> dist/<id>.html, one self-contained file each, gzipped size and gate
games/<id>/         one folder per opera: index.html (dev page), game.js, build.json
games/hello/        the kit demo: grid, hero, hops, notes, rings, bloom. Proves the toolchain, not art
lib/                helper modules vendored from LittleJS-AI (MIT): gameFx.js, textureGenerator.js
test/smoke.mjs      headless Chromium: every built page loads, runs, takes input, no errors
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
```

## Size

| Page | Gzipped |
| --- | --- |
| `dist/hello.html` (engine core, bloom plugin, the game) | 16.3 KB |

The engine core alone is about 15 KB gzipped, so an arcade opera lives at a different scale from the 12 KB original. Measure, never estimate: `docs/SIZECODING-js13k.md`.
