# Decisions

A running log of what was decided and why, newest at the bottom. Read with `LITTLEJS-NOTES.md` (the engine) and `SPEND.md` (the money).

## 28 Sep · the form

- **Six WarioWare microgames per opera** on a beat grid: 4-beat curtain, 1-beat command, 8 to 16 beats of play, an outcome of 4 beats and at least 3 s. One shared runner (`lib/microgame.js`), one file per opera. Iain's three treatments were the same state machine with different tables, so the runner is the product and the operas are data plus six small scenes.
- **8-bit sprites, a new look**, not the dot grid. 256x144 canvas, code-drawn sprites at 2x, a 3x5 font. Dot Opera stays its own series. (Iain, question 1.)
- **Keyboard first, on-screen gamepad on phones.** Left, Right, Space. (Iain, question 2.)
- **The Dot Opera synth, ported**, for the arias. ZzFX is available for hits but the voices are the series' voices. (Iain, question 3.)
- **A result card**: bravos out of the playable acts and one line of story. The story never changes with the score. (Iain, question 4.)
- **One job per act.** The treatments' second jobs are flavour or cut. (Iain: "walk and jump is not right".)
- **The wink stays, English only.** One deadpan word from a character in the last act's outcome. (Iain, question 8.)
- **Shots per act**: wide, mid, close, with a focus point and outcome cuts. The rope round her wrists is a close-up. Captions and the HUD stay at screen size. (Iain, 29 Sep.)

## 29 Sep · the review, and what it changes

Iain's verdict after playing: the music seems fine but check it note for note; about 40% of the acts are workable; most suffer from not knowing what is going on or what winning is; losing must not feel like it changes the course of the story; the picture looks like a mess, with contrast problems (yellow on yellow); iterate until it is a SNES-level experience in a tiny file. Plus: not every act needs a win. Petals, particles, rainbows, pulses and sound, as much feeling as possible from as few bytes as possible.

### The rules we now build to (WarioWare's, applied here)

1. **Fiction is the mechanic.** The picture must say the goal before the command does. One player thing, one target thing, and their relationship is something everyone already knows (a flower falls, a man stands under it). If it needs a meter to be understood, the fiction is wrong; a meter may confirm progress, never explain the goal.
2. **Stark inside the act, noisy between.** The action screen is high-contrast and uncluttered: a static, dark, low-detail background; the player and the target bright, outlined or lit; nothing else moves. The curtain and the command card are where the jazz goes.
3. **The command is a prime, not a rule.** One verb. The verb plus the picture must be enough in the first half second.
4. **Agency is one input.** Left/Right or Space, and it is obvious which from the picture (a thing to walk under means Left/Right; a thing to grab means Space).
5. **The verdict is instant and unambiguous.** A win: a bright flash, a rising sting, a happy sprite. A loss: a fall, a sad sting, a drop. The same second the act ends, before the caption.
6. **Losing is the other version of the same scene, and the story is the same.** Both outcomes end on the *same tableau*: the same characters in the same places with the same props, so the next act starts from one state of the world. The caption states the same story fact either way; only the manner differs (he catches the flower / he picks it up off the ground; either way the last frame is José holding the flower). The words "anyway" and "still" are the tell.
7. **Not everything has a win.** A toy act (`toy: true`) is six seconds of feeling: run through falling petals, jump for them, make sounds. No fuse pressure, no verdict, a warm line at the end. One or two per opera, placed where the opera itself is tender (the flower, the country, the serenade).
8. **Feeling per byte.** Particles (the engine's `ParticleEmitter`, untextured squares tinted in a colour), pulses on the beat, colour washes, screen flashes, screen shake, and a sound on every touch. Cheap, and they are what "adorable" is made of.

### The picture

- **Integer scaling.** The engine stretched the 256x144 canvas to the window; at 4.3x the pixels were uneven and the whole thing looked smeared. That was "the shader". The runner now snaps the canvas to a whole multiple. (Runner, 29 Sep.)
- **Text always on a band.** The outcome line sits on a near-black band; captions sit on a dark tag. No coloured text on a coloured floor, ever. The bravo gold and tragic red are for text on black only.
- **Palette discipline per opera:** one dark background family, one floor, two or three character colours, one accent for the target, white for the flash. The target of the act is the brightest thing on screen during the action.
- **Sprites read at a glance.** Characters at 2x (12x22). Props at 2x too, never 1x beside a 2x character. A prop that is the target is drawn brighter, or with a one-pixel outline, or bobbing on the beat.

### The loop

`npm run review` = build, smoke test, then `test/gallery.mjs` for each opera: two deterministic runs (every act forced to win, then to lose) photographed at the curtain, the command, the action, the outcome early and late, laid out one row per act. The gate: no errors, 6/6 bravos on the win run, 0 on the lose run, and the sheets looked at by a person (or the agent that made the change) before anything is called done. The play-through (`test/play.mjs`) stays for feel.

### Music

Every quoted phrase was written from memory. Checked note for note on 29 Sep; see the per-opera notes at the top of each game file for what changed.

### Models and money

Fable plans and reviews; Opus 5.5 does the art and gameplay passes (taste); Sonnet 5.5 does mechanical passes (helpers, checks). Budget $70. `SPEND.md`.
