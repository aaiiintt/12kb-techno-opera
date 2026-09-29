---
name: opera-game
description: Make a new playable opera for the Dot Opera Arcade (arcade/), a famous opera retold as six WarioWare-style microgames on LittleJS, about a minute in all. Use when asked to design, review, treat, build or tune an opera's microgames, or when a microgame treatment for an opera is pasted in for comment.
---

# Make an opera of six microgames

The arcade is the playable fork of Dot Opera. Same music rules, same feeling-first reviews, one wink per opera, small. The form is WarioWare's: six acts, each a 5 to 10 second microgame with one verb, on a beat grid, and failure is the other version of the scene, never a game over. Read first: `docs/music-guide.md` (hard rules), `arcade/docs/LITTLEJS-NOTES.md` (the engine, the runner, the decisions taken), `arcade/lib/microgame.js` (the runner's contract, in its header comment) and `arcade/games/carmen/game.js` (the worked example). Then the two LittleJS skills apply to every line: `littlejs-conventions` and `littlejs-api`.

Work in Iain's steps. Stop where it says stop. One opera at a time, in chat, with screenshots.

## 1. The opera, in six acts

Six beats of plot in order, one sentence of what happens and a few words of what the audience should feel. The feeling is the most important thing. For each act, the aria it lives in, quoted as scale degrees. Characters and their colours from traditional staging, with the source; up to three story colours, each meaning one thing.

## 2. The microgame table

One row per act. **Stop** after the table; Iain picks and corrects.

| Column | What goes in it |
| --- | --- |
| command | one imperative verb with an exclamation mark: CATCH!, UNTIE!, SHAVE! |
| job | exactly one of: move, mash, hold, tap on the beat, dodge, choose, steer, shield, reach. Never two jobs. The second input can do something visible but can never fail you |
| bpm, beats | the act's tempo and its action window, 8 to 16 beats. The tables in the treatment win over "always accelerate"; drama first |
| bravo | what you see when it goes right, in one line, and the caption |
| tragedy | what you see when it goes wrong. It advances the story exactly as far. It is the funnier or sadder version, never a punishment |
| music | the aria's phrase for the bar, the curtain figure, the two outcome stings |
| spectacle | the act's one full-stage move, locked to the music |

Plus, for the opera: the title card, the result card's ending lines (six bravos, none, in between; the ending never changes), and the wink: one deadpan word in the opera's language at exactly the wrong moment, from a character, in the last act's outcome (Carmen: MERDE ! after the knife). Commands and captions are English.

## 3. Build it

`arcade/games/<id>/` with `index.html`, `game.js`, `build.json` (copy `carmen/`). One `MG.opera({...})` call: title, key, colours, sprites, ending, six acts. Rules:

- 256x144 pixel canvas, sprites drawn in code as string arrays with a palette (`PX.sprite`), drawn at 2x. No image files, no audio files, no network
- the runner owns the phases, the fuse, the command card, the outcome line, the result card and input (`m.left`, `m.right`, `m.press`, `m.hold`). An act owns `init`, `update`, `render`, `outcome`, its `music` and anything it stores on `m`. End early with `m.win()` or `m.lose()`; set `m.timeoutWins` for jobs that succeed by lasting
- captions are the one style, `MG.say`, a small tag beside the speaker. The act's name is the curtain, never a lower third during play
- music from the opera's tune, on the Dot Opera synth (`S.voice`, `MG.sing`, `S.drum`, `S.arp`, `S.drone`, `S.setRoom`, `S.silence`), scheduled at the audio time the runner hands you. Never hand-rolled Web Audio in a game file. Say in the file that the tunes are quoted from memory
- LittleJS globals, no modules, 2 spaces. Never a top-level name that is an engine global (`floor`, `time`, `frame`, `RED`)
- list every plugin the game uses in `build.json`; the dev page has them all, the build only has what is listed

Then, every time:

```bash
cd arcade && npm run build && npm test
node test/play.mjs <id> /tmp/play-<id> 80 && node test/sheet.mjs /tmp/play-<id>
```

Report the gzipped size. Look at the contact sheets yourself before sending anything: every act's curtain, command, action and both outcomes.

## 4. Refine

Review in chat, one act at a time. Say the feeling first and how the scene and the job achieve it. Send the built page, the frames and what to press. Iain says what's wrong; offer one or two fixes; he picks; change, build, test, commit. Log accepted techniques in `docs/LOG.md` and reusable ones in `docs/TOOLSET.md`, the arcade ones under an Arcade heading.

Golf only after sign-off. Look great first, then as small as it can be.
