# LittleJS notes for the arcade

What I learned from the engine's own docs and source on 28 Sep 2026, and what it means for making playable operas. Sources: [LittleJS](https://github.com/KilledByAPixel/LittleJS) 1.19.3 on npm (1.20.0 on main), its `REFERENCE.md`, `FAQ.md` and `AGENTS.md`, the [js13k branch](https://github.com/KilledByAPixel/LittleJS/tree/js13k) and [LittleJS-AI](https://github.com/KilledByAPixel/LittleJS-AI), the author's Claude Code plugin.

## What it is

A dependency-free HTML5 game engine by Frank Force (ZzFX, Space Huggers). Global API, no modules: `engineInit(gameInit, gameUpdate, gameUpdatePost, gameRender, gameRenderPost)` and then you draw with `drawCircle`, `drawRect`, `drawTile`, `drawText`, read input with `keyDirection()`, `mousePos`, `mouseWasPressed(0)`, and make sounds with `new Sound([zzfx params])`. Objects that extend `EngineObject` get physics, collision and render for free. Fixed 60 Hz update, WebGL2 batching with a Canvas2D fallback, world space with Y up and a camera.

Plugins ship in the same package: post-processing (`postProcessBloom` gives the discs their glow), tween system with easing, UI system, particles, 2D lights, ZzFXM chiptune music, audio effects (filter, reverb, delay), Box2D, path finding, a 3D renderer, three.js bridge. The npm `dist/littlejs.js` carries all of them.

The engine repo's own `AGENTS.md` is written for coding agents (conventions, pitfalls, headless testing), and the author's plugin skills are vendored into `.claude/skills/` (`littlejs-conventions`, `littlejs-api`, `atlas-shape-art`). Conventions that bite, from those: `drawCircle` size is the diameter; `lerp(a, b, percent)`; particle speeds are per frame; spin is `angleVelocity`; never declare a top-level `const` named like an engine global (`time`, `frame`, `gravity`, `RED`, `sin`, `lerp`).

## Sizes, measured

| Thing | Gzipped |
| --- | --- |
| `dist/littlejs.min.js`, the whole engine with every plugin | 80.6 KB |
| `dist/littlejs.esm.min.js` | 117 KB |
| Engine core from `src/` (no plugins), release mode, terser, plus the postProcess plugin and the hello game | 16.3 KB |
| js13k branch starter (older 1.18 core, WebGL, physics, particles, sound, tiles.png), zipped | ~7.2 KB |

So the floor for a playable opera on the main engine is about 15 KB, before any game. The original opera's whole 12 KB budget would not hold the engine; the arcade is a different scale, on purpose. The js13k branch exists if we ever want back under 13 KB: `SIZECODING-js13k.md` in this folder is its size-coding guide, the best writing I have seen on measuring bytes, and its advice transfers to the original opera too. Its headline: folding off `soundEnable`, `glEnable`, `enablePhysicsSolver`, `gamepadsEnable` and `touchInputEnable` as compile-time constants strips about 2.5 KB from a game that does not use them.

The arcade build (`arcade/build.mjs`) assembles the core from the npm package's `src/` files in upstream order, with `engineRelease.js` in place of `engineDebug.js` so asserts and the debug overlay are gone, then only the plugins a game lists. It prints the gzipped size of each page and fails a gate, like the root `build.js`.

## How the two engines fit

Dot Opera's engine (`src/engine/`) is a timeline: `build(k)` schedules lights and notes on `k.tl`, the audio clock drives everything, and the shell steps frames for review. LittleJS is a loop: `gameUpdate` sixty times a second, input every frame. A playable opera needs both, and the split is clean:

- **LittleJS owns the frame:** the stage, the discs, input, the camera, bloom, captions drawn with `drawText`, particles for embers, the tween system for hops (`Ease.ELASTIC`, `Ease.OUT(Ease.BOUNCE)`) in place of `src/tween.js`.
- **The opera synth owns the voices.** LittleJS audio is ZzFX: one-shot parametric sounds, `playNote(semitones)`, ZzFXM chiptunes. It has no formant soprano, no detuned tenor with a filter that opens, no room that closes as the drama does. Those are in `src/engine/synth.js` (`O.voice`, `O.play`, `O.drum`, `O.arp`, `O.setRoom`) and `score.js` (`O.deg`, `O.chord`, `O.motif`, `O.T`). They are Web Audio on a bare `AudioContext`; LittleJS exposes its own `audioContext` and `audioMasterGain` and resumes the context on the first input, so the synth can be handed LittleJS's context and routed into its master gain. That is the port to make when the first real game needs a voice, and it is a small one: `O.initAudio` creates the context, everything else takes a `t` in context seconds.
- **The tune is the clock.** Schedule the phrase on the audio clock, and let the game read `audioContext.currentTime` to know which beat it is on, so what the player does lands on the music. LittleJS's `time` is game time and drifts from audio; use it for animation, not for the score.
- **ZzFX for the arcade layer:** hits, pickups, the wink's little sting. `arcade/lib/gameFx.js` (vendored from LittleJS-AI) wraps ZzFX in named parameters and adds screen shake.

## Things the engine gives us that the opera engine did not

- Real input on phones: touch routes to the mouse, `isTouchDevice`, an optional on-screen gamepad, vibration.
- `postProcessBloom(threshold, strength, size)`: the glow, one line. Custom Shadertoy-style shaders too, per object or full screen, with a feedback texture for trails.
- Particles with collision and additive blending; the particle designer page in the upstream repo makes the numbers.
- `Timer`, `tweenProperty`, `EngineObject` children and parents, `engineObjectsCallback` for proximity.
- Headless deterministic stepping (`setHeadlessMode`, `setEngineManualStep`, `engineStep(n)`) for tests of time-driven logic without a browser.
- Save data (`readSaveData`, `writeSaveData`, always an object), medals, a UI system with buttons and sliders if we ever want a menu drawn on the canvas.

## Things to decide when the examples arrive

- **The grid.** Keep the 9x9 dot identity or let a game be its own shape. `hello` keeps it: `drawCircle` for 81 discs is nothing for the batcher; hundreds of moving dots want atlas tiles instead.
- **Chrome.** The Dot Opera shell (title, MENU, PLAY, pause, the language toggle) is HTML around the grid. The arcade page is a bare canvas; the chrome can be DOM again over it, or drawn. Iain's rule that the buttons never move still holds.
- **Review tooling.** The opera's step mode (`?step=N`) rebuilt the whole timeline at a frame. A game cannot be rebuilt at a frame, but headless stepping plus screenshots (`SHOT=dir npm test`) covers most of it, and a `?seed=` and a replay of inputs would make a play reproducible.
- **Budget.** A gate per game once we know the shape. The build's default is 64 KB; hello is 16 KB.

## Commands

```bash
cd arcade
npm install          # once: littlejsengine 1.19.3 and terser
npm run serve        # http://localhost:4174/games/hello/  (dev page, engine debug build with asserts)
npm run build        # dist/<id>.html for every game, gzipped size and gate
npm test             # headless Chromium: loads every dist page, holds a key, clicks, fails on errors
SHOT=/tmp/shots npm test   # same, plus a screenshot per game
```

Press Escape on the dev page for the engine's debug overlay; number keys toggle its views.

The author's Claude Code plugin can be installed on a machine with `/plugin marketplace add KilledByAPixel/LittleJS-AI` then `/plugin install littlejs@littlejs-ai`. This repo vendors its three portable skills so cloud sessions have them without the install; the fourth, `new-littlejs-game`, scaffolds standalone projects and is replaced here by `opera-game`.
