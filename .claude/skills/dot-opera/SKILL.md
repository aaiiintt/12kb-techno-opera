---
name: dot-opera
description: Make a new Dot Opera, a famous opera retold in about a minute on a grid of lit dots with synthesised music. Use when asked to make, treat, or build an opera for the series.
---

# Make a Dot Opera

Read first: `docs/BRIEF.md` (the limits), `docs/TOOLSET.md` (what we can make), `docs/KIT.md` (the API), `docs/music-guide.md`, and `operas/carmen.js` with `docs/treatments/carmen.json` as the worked example.

Work in Iain's five steps. Stop where it says stop.

## Shortcut for steps 1 to 4

`docs/PROMPT.md` is a one-shot prompt: fill in the opera's name, run it, and it returns the pitch and the treatment JSON with three versions per act. Save the JSON to `docs/treatments/<id>.json`, check it against the schema and against what you know of the opera, then take it to Iain for step 4. Steps 1 to 4 below are what the prompt does, for when you'd rather do them by hand.

## 1. Break it into acts

Break the opera into five to seven key acts that tell a simple story. One beat of plot each. Name each act in the opera's language.

## 2. What happens, and what it makes the audience feel

For each act write one sentence of what happens and a few words of what the audience should feel. The feeling is the most important thing in the treatment.

Pick the tune (quoted, as scale degrees), the characters (one dot and one colour each, from traditional staging, with the source), and up to three story colours.

## 3. Recreate it with the toolset

For each act, using `docs/TOOLSET.md`, work out:

- **set:** the place, as light
- **characters:** who's on stage, where, who's lit
- **actions:** what moves, and the shots
- **music:** which theme, which voice, where the silence is
- **emotion:** how those add up to the feeling
- **wink:** across the whole opera, one or two deadpan, knowing moments (a word in the opera's language at exactly the wrong time) that make it ours without undercutting the feeling. Carmen's is José's MERDE ! just after the knife.

Write it all into `docs/treatments/<id>.json` (schema: `docs/treatment.schema.json`).

## 4. Propose three versions, pick one

For each act, three genuinely different versions: usually one from the toolset as it stands, one that bends a technique, one new idea. Put them in `versions` and show Iain the whole treatment as a short table per act with a recommendation. **Stop.** Iain picks; record `chosen`. Ask multiple-choice questions when a choice is unclear.

## 5. Refine

Build `operas/<id>.js`, one act at a time, from the chosen versions. Then review in chat, act by act:

- Say the act's feeling, and how the scene achieves it, before anything else.
- Give frame numbers and `?step=N` links (`npm run build`, then `http://localhost:5173/dist/<id>.html?step=N`). Check the frames yourself in the browser pane first, muted, and close the tab.
- Iain says what's wrong; offer one or two ways to fix it; he picks; change, check, commit, send the link.
- Log every accepted change as a technique in `docs/LOG.md`, every rejection under Avoid. If it's reusable, add it to `docs/TOOLSET.md`.

Report the gzipped size on every build (`npm run build`; opera gate 4 KB). Look great first, then as small as it can be.
- Handover for the next agent: `handover/README.md`.
