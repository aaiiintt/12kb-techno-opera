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

## 29 Sep · the first redesign pass, what the three agents did

Each opera got an Opus 5.5 agent, the rules above, and the gallery. All three converged on the same moves without talking to each other, which is a good sign the rules are right: mid shots everywhere (close shots cropped the fiction away), a static dark room per act, the target the one bright or gold-outlined thing, a shared verdict (white flash and rising run for a win, dark dip, shake and falling sting for a loss), particles in every outcome, and both outcomes ending on the same tableau with the caption stating the same fact.

- **Carmen.** Act I is the toy: she throws the flower, it bursts into petals, José runs and jumps through them, each one a note. Untie is three rope coils that come off one by one; either way she pushes him down and runs. Hold is a dried flower that blooms while held and wilts when let go. Flip flips all three cards, spades every time. Glory is jump over three charges. Reject is a timed throw when the ring glows; either way the ring ends at his feet, then the knife. The agent dropped MERDE !; put back, because Iain asked for the wink.
- **Il barbiere.** Serenade is a big note with a ring closing on the beat; six strums. Slip is nudging the letter to the line of light under the door while Bartolo's newspaper trembles a beat before he looks. Stagger tips visibly with an arrow saying which way to lean. Tune is follow-the-gold-key along the harpsichord. Shave is the toy: the brush lathers Bartolo to the Largo, foam to the wig, Figaro pockets the key. Wed is holding the ladder under the balcony against gusts; either way married, and E IL CONTO ?
- **La traviata.** Toast is the glasses swinging and meeting on the downbeat with a gold square closing on the meeting point; three hearts, a cough costs one. Snip is the toy: camellias snipped into her bouquet while petals drift and a bee wanders; Germont arrives at the gate regardless. Renounce is a big letter with a pulsing outline; hold to sign, or Germont walks over and signs it. Fling is mash: coins arc onto a pile at her feet, or the purse splits and they roll there anyway. Read is a haloed flame, a hand, draughts as streaks. Give is her sitting up with the portrait and his boxed, bobbing hand; SCUSA. from Germont.

**Runner changes the pass asked for and got:** the gallery gate counts bravos out of the winnable acts; captions are queued and drawn in the post-render pass so particles never cover them; the runner sets gravity for particles; the gallery's time limit was too short for a 16-beat opera and its random presses ended Flip before the action shot.

**Music wired in after the pass:** the Habanera bass and melody, the Toreador refrain, Ecco ridente, Una voce, Largo al factotum, the Brindisi and Addio del passato now play from `lib/tunes.js`. Acts whose aria is unverified play a verified tune of the same opera instead (docs/MUSIC.md).

**Known weak, carried to the next pass (from the agents' own lists):** no walk or run animation frames anywhere, which is the biggest gap to a SNES feel; Escamillo and the bull are small in the bullring; Flip is too easy; the shave brush reads as an ice-cream cone; Violetta's white dress competes with the target; Barber's Wed loss ends on a heap, not quite the win's tableau; toy particles get busy; outcome captions are small.
