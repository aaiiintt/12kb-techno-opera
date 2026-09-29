---
name: opera-game
description: Make a new playable opera for the Dot Opera Arcade (arcade/), a famous opera retold as WarioWare-style microgames with the story told between them on LittleJS, about two minutes in all. Use when asked to design, review, treat, build, time-line or tune an opera's microgames, or when a microgame treatment for an opera is pasted in for comment.
---

# Make an opera of games and scenes

The arcade is the playable fork of Dot Opera. Same music rules, same feeling-first reviews, one wink per opera, small. The form (settled with Iain on Carmen, 29 Sep): a list of **beats**, watched or played, about two minutes and never more. A WATCH beat is a cutscene: black bars in from the top and bottom, one typed caption, nothing to do. A PLAY beat is a five-to-ten second microgame with one verb, one instruction line and one of four input icons, on a beat grid, with the fuse burning along the top; failure is the other version of the same scene, never a game over. A TOY beat is a play with no fuse and no verdict: seconds of feeling.

Read first: `docs/music-guide.md` (hard rules), `arcade/docs/LITTLEJS-NOTES.md` (the engine), `arcade/docs/DECISIONS.md` (why things are the way they are), `arcade/lib/microgame.js` (the runner's contract, in its header comment), `arcade/docs/carmen-timeline.html` (the approved timeline, the model for every other one) and `arcade/games/carmen/game.js` (the worked example). Then the two LittleJS skills apply to every line: `littlejs-conventions` and `littlejs-api`.

Work in Iain's steps. Stop where it says stop. One opera at a time, in chat, with screenshots.

## 1. The timeline (a document, before any code)

Copy the shape of `carmen-timeline.html`: beats in order with a time, each one either WATCH, PLAY or TOY. For every beat: what you see, what you hear, the exact caption words, the story point it carries. For a PLAY beat also: the instruction line, the icon, the win and the loss, and the tableau both end on with the shared caption. **Stop** after the timeline; Iain approves or corrects it. Rules that came out of Carmen:

- The story reads for a newcomer. Spell plot points out in plain present tense: WHO, WHERE, WHAT HAPPENED. Every word counts. Colour rules are said once when they first matter (GREEN = JEALOUS).
- Interaction is tapping and dragging only: TAP, TAP TAP TAP, HOLD, DRAG. Nothing needs arrows on a phone. Counts go in the words (ALL 3 CARDS).
- Instruction lines say the job and the object: TAP TO UNTIE HER, DRAG TO CATCH THE FLOWER, HOLD TO MAKE IT BLOOM.
- The fuse is there only when there is something to do. A cutscene never has one.
- Losing never changes the story. Both outcomes end on the same tableau and the second caption line states the same fact ("HE KEEPS IT. HE IS LOST."). The first line is the manner, in the verdict colour.
- The last thing the player does is a game, not the death. Endings are watched.
- Not everything needs a win: one toy per opera where the opera is tender (Carmen's petals after she dies).
- Five games, six to eight scenes, one toy, about 1:55. Ceiling two minutes.
- The wink: one deadpan word in the opera's language, from a character, in a watched beat near the end (MERDE... beside Carmen on the ground).

## 2. Build it

`arcade/games/<id>/` with `index.html`, `game.js`, `build.json` (copy `carmen/`). One `MG.opera({...})` call: title, sub, key, colours, sprites, ending, the beats. Rules:

- 256x144 pixel canvas, sprites drawn in code as string arrays with a palette (`PX.sprite`), the cast from `lib/cast.js`, drawn at 2x. No image files, no audio files, no network
- the runner owns the phases, the bars, the captions, the fuse, the command card, the icons, the outcome lines, the marks, the result card and input (`m.press`, `m.hold`, `m.down`, `m.px`, `m.py`, `m.left`, `m.right`; `MG.drag` for a dragged character). A beat owns `init`, `update`, `render`, `outcome`, its `music`, its `captions` and anything it stores on `m`. End a game early with `m.win()` or `m.lose()`; set `m.timeoutWins` for jobs that succeed by lasting. `verb` is one of `tap`, `mash`, `hold`, `drag`; `instruction` is the line on the card; `cue(m)` is where the icon sits
- captions during play are the one style, `MG.say`, a small tag beside the speaker. The story is told in WATCH beats' `captions`, never in a lower third during play
- music from the opera's tune, on the Dot Opera synth (`S.voice`, `MG.sing`, `S.drum`, `S.arp`, `S.drone`, `S.setRoom`, `S.silence(t, dur)`), scheduled at the audio time the runner hands you. Never hand-rolled Web Audio in a game file. Quote only tunes verified in `lib/tunes.js` and `docs/MUSIC.md`; say in the file that everything else is filler in the key
- LittleJS globals, no modules, 2 spaces. Never a top-level name that is an engine global (`floor`, `time`, `frame`, `rand`, `RED`)
- list every plugin the game uses in `build.json`; the dev page has them all, the build only has what is listed

Then, every time:

```bash
cd arcade && npm run build && npm test
node test/gallery.mjs <id> /tmp/gal-<id>
```

The gallery runs the opera twice, every game forced to win and then to lose, and photographs every beat (a game at the card, the action and both ends of the outcome; a scene early, mid and late). The gate: no errors, bravos equal to the games on the win run, none on the lose run, and the two sheets looked at by whoever made the change before anything is called done. Report the gzipped size (the goal is under 48 KB; the gate is 64 KB).

## 3. Refine

Review in chat, one beat at a time. Say the feeling first and how the scene and the job achieve it. Send the built page (publish `dist/<id>.html` as an artifact) and the sheets. Iain says what's wrong; offer one or two fixes; he picks; change, build, gallery, commit. Log decisions in `arcade/docs/DECISIONS.md` and spend in `arcade/docs/SPEND.md`.

Golf only after sign-off. Look great first, then as small as it can be.
