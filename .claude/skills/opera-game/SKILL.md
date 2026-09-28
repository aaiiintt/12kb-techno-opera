---
name: opera-game
description: Make a new playable mini opera for the Dot Opera Arcade (arcade/), a famous opera retold in about a minute as a small game on LittleJS. Use when asked to design, review, treat, build or tune an opera mini game, or when a game idea for an opera is pasted in for comment.
---

# Make an opera mini game

The arcade is the playable fork of Dot Opera. Same brief, same feel, same music rules, one new thing: the audience plays it. Read first: `docs/BRIEF.md` (the feel and the hard limits), `docs/music-guide.md` (hard rules), `arcade/docs/LITTLEJS-NOTES.md` (what the engine gives us and how the two engines fit), and `arcade/games/hello/game.js` (the kit demo). Then the two LittleJS skills apply to every line of game code: `littlejs-conventions` (rules and pitfalls) and `littlejs-api` (exact signatures).

Work in Iain's steps. Stop where it says stop. One game at a time, in chat, with screenshots.

## 1. The opera, in acts

Five to seven acts, one beat of plot each, one sentence of what happens and a few words of what the audience should feel. The feeling is the most important thing. The tune, quoted, as scale degrees. Characters as dots and colours from traditional staging, with the source. This is steps 1 and 2 of `.claude/skills/dot-opera/SKILL.md`; reuse a treatment in `docs/treatments/` if one exists.

## 2. The verb

Every mini game has one verb, and it is the opera's own. Carmen: choose. Figaro: juggle. Dido: hold on. Turandot: answer. Write it in a sentence: "You are X. You [verb] to [want]. The opera wins when [the plot beat]." Then:

- **the loop:** what the player does every few seconds, and how the music answers (when something is played, something lights and something sounds)
- **the arc:** how the acts become phases of one play of about a minute. The tune is the clock: phrases, not timers
- **the ending:** the opera's ending is the game's ending. The player can lose the game but never change the story; the tragedy still lands. Losing early is a shorter opera, not a game over screen
- **the wink:** one deadpan caption at exactly the wrong moment
- **the spectacle:** the one full-grid move per act, locked to the music
- **input:** one finger. Tap, hold, drag or a single key. Phone first

Propose two or three genuinely different verbs for the opera with a recommendation. **Stop.** Iain picks.

## 3. Build it

`arcade/games/<id>/` with `index.html`, `game.js`, `build.json` (copy `hello/`). Rules:

- LittleJS globals, no modules, no `LJS.` prefix, 2 spaces like the rest of the repo
- shapes and text only: no images, no audio files, no network. `drawCircle` for discs, atlas tiles (`atlas-shape-art` skill, `arcade/lib/textureGenerator.js`) when there are hundreds
- flat discs on black, colours from the staging, up to three story colours, bloom is the glow
- captions are the one style: small white-on-black tags beside a dot, emoji-led where it helps
- music from the opera's tune; voices from the Dot Opera synth (`src/engine/synth.js`) once it is ported, ZzFX for hits and the arcade layer. Never hand-rolled Web Audio inside a game file
- list every plugin the game uses in `build.json`; the dev page has them all, the build only has what is listed

Then, every time:

```bash
cd arcade && npm run build && SHOT=/tmp/shots npm test
```

Report the gzipped size. Look at the screenshot yourself before sending anything.

## 4. Refine

Review in chat, one act or phase at a time. Say the feeling first and how the scene and the verb achieve it. Send the built page, a screenshot and what to press. Iain says what's wrong; offer one or two fixes; he picks; change, build, test, commit. Log accepted techniques in `docs/LOG.md` and reusable ones in `docs/TOOLSET.md`, the arcade ones under an Arcade heading.

Golf only after sign-off. Look great first, then as small as it can be.
