# Workflow log

What worked and what didn't, per run. Newest first. One line per finding.

## The workflow (agreed 27 Sep)

1. **Scene loop, one act at a time, in chat.** Iain watches the act and steps its frames (`?step`), says what's wrong in his own words and refers to frames by number. I offer one or two concrete ways to do it. He picks. I change the code, check the frame, commit, and send the link back.
2. **Capture.** Every accepted change adds one line under Techniques (the pattern, when it fits, why). Every rejection adds one under Avoid.
3. **Prove it transfers.** Carmen, then a very different opera (for example Dido), starting from the technique list.
4. **Distil after two operas.** A JSON schema (title, key, tempo, lights with sources, tune, acts with name, length, idea, technique and settings, cue), techniques as kit functions, and a skill that goes from an opera's name to treatment, JSON, build and frame check. Any act may carry a few lines of its own code when a moment needs it.

## Techniques

- **Type on the grid (27 Sep).** Capitals are measured to the dots: the title's capitals run from the top of dot row two to the bottom of row three; the nav's capitals are exactly one dot tall, on the second-to-last row. Left edges on the second column, right edges on the second-to-last. A title that won't fit wraps onto the next pair of rows with one empty row between; if a single word won't fit, it drops to one-row capitals. Two nav items only: MENU left, PLAY right; PLAY toggles PAUSE, MENU toggles CLOSE. The menu is an overlay listing the whole series in one-row capitals from row two (unmade operas dimmed), ABOUT two rows above the nav. Long names wrap; if any wraps, an empty row between operas.
- **Three shots (27 Sep).** Wide is the whole grid: the world and mass moves, the opening and every new place. Mid is about five cells across: two characters and the space between. Close is two or three cells: one character's feeling, and the camera follows their dot. Cut between sizes on a beat; don't zoom, except one deliberate push-in per opera at the peak. Step one size at a time; jump wide to close only for a shock. The world keeps playing out of shot.
- **Following through a crowd (27 Sep).** Wide on a busy field, cut to mid as the hero moves, cut to close following the hero's dot as the crowd streams past the edges of frame, cut back to wide when they stop. Filmic, using only the grid.

## Avoid


## Run 1: Carmen, thin kit, beauty then golf (27 Sep)

Setup: `docs/BRIEF.md` (358 words), the original opera as the only example, a thin kit instead of the gesture library, one conversation.

- Treatment written straight from knowledge of the opera in one pass, no rules consulted. It chose Carmen, not José, as hero, and found a central visual idea tied to the tune (each chromatic semitone is a ring of red). Neither came out of the earlier rule-driven cards. Worked.
- Didn't work: colours picked from a generic palette (coral, lemon, sakura) read as odd. Fix: colours come from traditional staging (Carmen's red, the toreador's gold suit of lights, José's dragoon blue). Added to the brief.
- Worked: writing the opera as real code on the thin kit. The treatment's central idea (semitones as spreading rings) went straight into about fifteen lines, and it reads full screen. The preset library could not have produced it.
- Worked: the thin kit halved the engine (10.0 KB to 7.5 KB gzipped).
- Worked: gate mode caught every fault on the first look, eight frames in one pass.
- Didn't work first time: the kit's paint acts immediately, so painting later acts at build time leaked colours backwards. Fix in the opera: schedule paints on the timeline. Worth making the kit's paint take a time.
- Didn't work first time: mass paints repainted the characters (Carmen turned blue under José's wall). Fix: mass paints skip character cells. Worth building into the kit.
- Didn't work first time: transforms are factories, `k.T.inv()(pair)`, which KIT.md doesn't say. One error stopped the build at Act V and silently cut three acts.
- Beauty pass came in at 1.8 KB, under the 2 KB limit without trying. Golf pass deferred until Iain has seen it, since golfing something he wants changed is wasted work.
- Uncertain: the Habanera's second phrase is written from memory and may be slightly off; flagged for Iain's ear.

## Lessons carried in from earlier rounds

- Long rule lists made models timid: sparse grids, a couple of dots, grey. (v3 drafts)
- A free choice of colours and effects produced clip art: gradients, drifting 3D grids, stacked transitions. (v2 drafts)
- A preset gesture library made every opera feel assembled from the same parts. (v1 to v3)
- Splitting work across many agents meant no single model held the whole piece. (v1 to v3)
- Checking by hand-timed screenshots missed short moments; `?gate=` fixed that.
- What Iain loved: the original's purple ascension, the formant soprano, the gold hero with a heartbeat, rings and colour around the central dot.
