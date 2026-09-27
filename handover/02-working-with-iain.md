# 02. Working with Iain

Iain Tait is a creative director and technologist. He is the director of this series; you are the staging, sound and code. He reviews by watching, stepping frames, and saying what's wrong in his own words, sometimes with a sketch or a phone screenshot. Read this before you show him anything.

## How a review goes

1. You send a link and frame numbers (`?step=N`). Before anything else, you state **the feeling** the act is meant to give the audience and **how the scene achieves it**. Iain, 27 Sep: "When we do these reviews you need to tell me what the feeling we're trying to get from the audience and how this scene achieves that - this is the most important thing."
2. He watches, steps, and tells you what's wrong, referring to frames by number. Sometimes he pastes a sketch.
3. You offer **one or two** concrete ways to fix it, with a recommendation. For bigger forks, use multiple-choice questions (he asked for them, and answers fast). Never a survey of options you won't take.
4. He picks. You change the code, check the frame yourself in the browser pane, commit, deploy, and send the link back with the frames to look at.
5. Log the accepted change as a technique in `docs/LOG.md` (and `docs/TOOLSET.md` if reusable). Log a rejection under Avoid, with why.

Say what you haven't verified. If you checked the frames but didn't listen, say so. He listens on his phone.

## What he responds to

- **Feeling first.** Every choice serves what the audience should feel. His own starting mappings: lonely is wide with the character alone; busy is wide with dots jostling and crowded music; intimate is close, two people, soft glow.
- **Story, not effects.** "It feels like we don't have a coherent story - what's happening here?" killed a whole act of pretty comets and sweeping rows. Write the spine (one beat and one feeling per act) before any scene.
- **The crowd as a set.** His sketch for Toréador (rivals in a line, blocks of crowd either side, the crowd reacting) is the model for how a place and its people are staged.
- **Captions.** Small white-on-black tags beside a dot, knowing register: QUI EST-ELLE ?, OH LÀ LÀ !, ELLE EST À MOI. They're `[english, original]` pairs (English by default, a corner toggle to the original), and **an emoji pictogram leads the caption where one says it faster than words** (✂️ FIGARO !, 💌 POSTINO, 💤 ZZZ). Iain: "it's really helpful". The picture must still carry the plot with the captions covered. One caption style only.
- **The wink.** "A well timed 'merde!' just after Carmen gets killed takes the whole thing to a place that feels a lot more me." Full operatic feeling, then one deadpan word at exactly the wrong moment, from the character, and straight back into the feeling. One per opera is enough: a second one (BOF. from the crowd) was cut as "a wink for the sake of a wink".
- **Kawaii underneath, austere on top.** Sweet via sound, colour and characters with feelings; never cute in the chrome, type or layout.
- **Sound he loved in the original:** the violet ascending chords with ring pulses and a room opening step by step, and the formant soprano with scoop, breath and late vibrato. "Has it got a moment as good as the purple section?" is a fair test.
- **Time to feel it.** He asked for a lament and silence before the loop, and for the final note to ring out. The ending earns the most time.
- **Mobile.** He tests on his phone. Type sits close to the corners; the stage is the point.

## What he rejected, and why

| Rejected | Why |
| --- | --- |
| Shaded "sphere" dots, 3D-looking grids, free hex colours, effect piles | "Disgusting." Flat discs, colours from traditional staging, restraint. |
| Floating actors off the grid | Everything is a cell. Characters are lit cells. |
| A crowd that wanders while the hero walks | Her movement disappeared into theirs. Motion reads against stillness. |
| Characters that grow, halos, crosses, blocks round a character | "They should all be in dot form... they can glow." Size changes only in a power play. |
| A crowd meter that fills and drains | The changing size read, not the cheering. Blocks stay fixed; people flash. |
| A lower-third cue next to speech tags | Two caption treatments read as two systems. |
| A separate white "blade" dot between José and Carmen | "Too big and weird." She flashes white and red instead. |
| A hit that's one quick flash | Reads as a glitch. Name it in the silence, strobe, curtain, pity. |
| Looping straight after the climax | No time to wallow. |
| Elaborate pipelines, agent swarms, a review panel, "documents full of chuff" | "Massively overcomplicated." "Occam's razor." Keep it a conversation. |
| Rewriting his About copy | "Why have you rewritten the about page you fool." Never rewrite his words without asking. |
| Moving the MENU and PLAY buttons to fit a layout | The buttons never move. Everything else adapts. |

The full lists with dates are in `docs/LOG.md`.

## Constraints to keep in force

- No new dependencies without asking. Prefer 20 lines of plain code over a package.
- No agent swarms. One opera at a time, in chat.
- Don't stack changes on a red build.
- Never commit secrets.
- Don't rewrite Iain's copy (`src/about.html`, `docs/music-guide.md`) without asking.
- Don't leave audio playing in a hidden browser pane; mute during checks and close tabs.
- Commits: small, present tense, one concern, with the Co-Authored-By line.
- Report outcomes faithfully. If something wasn't checked, say so.

## His register

Lowercase, contractions, short, self-deprecating. He says "rad", "borked", "merde". Match the energy in chat (plain, direct, no corporate slop), but write docs and commits in clear technical prose.
