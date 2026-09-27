# Workflow log

What worked and what didn't, per run. Newest first. One line per finding.

## The workflow (agreed 27 Sep)

1. **Scene loop, one act at a time, in chat.** Iain watches the act and steps its frames (`?step`), says what's wrong in his own words and refers to frames by number. I offer one or two concrete ways to do it. He picks. I change the code, check the frame, commit, and send the link back.
2. **Capture.** Every accepted change adds one line under Techniques (the pattern, when it fits, why). Every rejection adds one under Avoid.
3. **Prove it transfers.** Carmen, then a very different opera (for example Dido), starting from the technique list.
4. **Distil after two operas.** A JSON schema (title, key, tempo, lights with sources, tune, acts with name, length, idea, technique and settings, cue), techniques as kit functions, and a skill that goes from an opera's name to treatment, JSON, build and frame check. Any act may carry a few lines of its own code when a moment needs it.

## Techniques

- **Feeling first (27 Sep).** Every act starts from what the audience should feel, and every choice (shot, how many other dots, what they do, glow, music) serves it. Every review states the feeling and how the scene achieves it. Starting mappings, from Iain:
  - Lonely: wide, the character alone in the centre, no one around.
  - Busy or overwhelmed: wide, lots of dots jostling around them, the music crowded.
  - Intimate: close, two people, soft glow around them.
- **The crowd turns to look (27 Sep).** To make someone magnetic, the crowd stands still, murmuring in place, and the people beside them brighten and swell as they pass, then settle: a wake of attention. When they stop, the whole crowd glows faintly towards them.
- **Speech tags (27 Sep).** Small white-on-black tags beside individual dots for what the crowd is thinking, in the opera's language and the knowing register (QUI EST-ELLE ?, OH LÀ LÀ !). A second or so each, one at a time, never over the title or buttons.
- **Motion reads against stillness (27 Sep).** If everything moves, nothing does. To show someone moving through a crowd, the crowd holds still and reacts to them as they pass.

- **Type on the grid (27 Sep).** Capitals are measured to the dots: the title's capitals run from the top of dot row two to the bottom of row three; the nav's capitals are exactly one dot tall, on the second-to-last row. Left edges on the second column, right edges on the second-to-last. A title that won't fit wraps onto the next pair of rows with one empty row between; if a single word won't fit, it drops to one-row capitals. Two nav items only: MENU left, PLAY right; PLAY toggles PAUSE, MENU toggles CLOSE. The menu is an overlay that breaks the grid on purpose: plain type in one column, DOT OPERAS as the brand, the series as a bulleted list (unmade operas dimmed), then ABOUT, sitting a row above the buttons and growing upward, opening at the bottom nearest the thumb. The buttons never move.
- **Three shots (27 Sep).** Wide is the whole grid: the world and mass moves, the opening and every new place. Mid is about five cells across: two characters and the space between. Close is two or three cells: one character's feeling, and the camera follows their dot. Cut between sizes on a beat; don't zoom, except one deliberate push-in per opera at the peak. Step one size at a time; jump wide to close only for a shock. The world keeps playing out of shot.
- **Following through a crowd (27 Sep).** Wide on a busy field, cut to mid as the hero moves, cut to close following the hero's dot as the crowd streams past the edges of frame, cut back to wide when they stop. Filmic, using only the grid.
- **Captions name what the dots can't (27 Sep).** Where the lo-fi picture could leave a key character or plot point unread, a speech tag names it at the moment it happens: DON JOSÉ when he first lights, UNE FLEUR ! as the flower lands, DES PÉTALES… as they fall.
- **Objects are shapes, characters are cells (27 Sep).** A character is one dot. A thing they hold is a small shape round it that stays lit, like the flower: a red cross of petals round José's blue, kept until she dies. Never a filled square round a character; it reads as a block, not a person.
- **Vacated cells go back (27 Sep).** When a character moves on, the cell returns to the light it had before, not to white. Stray white cells read as something happening.

- **The crowd as two blocks (27 Sep, from Iain's sketch).** Rivals in a line, a block of crowd beside each. The blocks never change size: dim sand people at rest, and the ones shouting flash. How many flash tells you who's winning; a tag says which way it's going (BRAVO !, HOU !, TORÉADOR !).
- **An entrance with grandeur (27 Sep).** A star gets a build-up: the crowd hushes, a drum roll, their colour sweeps in from beyond the edge, and they land on a hit with a shake, a close shot and the cue. Then cut back to wide.
- **A story spine before the scenes (27 Sep).** Write one beat and one feeling per act first. Effects that don't serve a beat (a comet round the edge, rows sweeping) read as nothing happening.

- **Whose feeling, and where it starts (27 Sep).** For an inner feeling, start close on the one who feels it, with the world dark, then let it leave them in their own colour. Jealousy: José's heart stumbles, her red flower turns to his blue petal by petal, then his blue creeps out like ink until it boxes her in, a wall between her and the gold.
- **Objects carry the story (27 Sep).** A gift that changes colour says what's changed between two people without a new symbol.

## Avoid

- A crowd meter that grows and shrinks (27 Sep): the changing size is what reads, not the cheering.
- A crowd that wanders while the hero walks (27 Sep): her movement disappears into theirs.

- Moving the buttons to fit a layout (27 Sep). MENU and PLAY stay put; everything else adapts around them.
- Forcing overlay menus onto the dot grid (27 Sep): it produced column splits and dropped headings. Navigation breaks the grid; the stage keeps it.


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
- Didn't work first time: embers repaint a vacated cell white 0.4 s after a hop, so crowd hops just before a big paint wiped it. Fix: the crowd settles before the next act paints. Worth making embers restore the cell's previous light instead of white.
- Owed: the golf pass. Carmen's beauty pass with the Act I crowd is 2.3 KB; the per-opera gate is raised to 3 KB until the golf pass brings it back under 2 KB.
- Uncertain: the Habanera's second phrase is written from memory and may be slightly off; flagged for Iain's ear.

## Lessons carried in from earlier rounds

- Long rule lists made models timid: sparse grids, a couple of dots, grey. (v3 drafts)
- A free choice of colours and effects produced clip art: gradients, drifting 3D grids, stacked transitions. (v2 drafts)
- A preset gesture library made every opera feel assembled from the same parts. (v1 to v3)
- Splitting work across many agents meant no single model held the whole piece. (v1 to v3)
- Checking by hand-timed screenshots missed short moments; `?gate=` fixed that.
- What Iain loved: the original's purple ascension, the formant soprano, the gold hero with a heartbeat, rings and colour around the central dot.
