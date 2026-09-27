# 03. How to make an opera

This is the workflow that produced Carmen, in the order Iain set (his notebook page, 27 Sep): acts; what happens and what the audience feels; recreate it with the toolset (set, characters, actions, music, emotion); three versions, pick one; refine. The skill `/dot-opera` encodes the same steps.

## 0. Prepare

- Read `docs/BRIEF.md`, `docs/TOOLSET.md`, `docs/KIT.md`, `docs/music-guide.md`, and `operas/carmen.js` beside `docs/treatments/carmen.json`.
- Read `docs/archive/operas.md` for the research on this opera (tune, strongest dot idea, "fewest moving parts" musical analysis).
- Know the opera better than the audience: plot, characters, the famous tune, the traditional staging colours.

## Shortcut: the one-shot prompt

`docs/PROMPT.md` does steps 1 to 4 in one go: fill in the opera's name, run it, save the JSON it returns to `docs/treatments/<id>.json`, sanity-check it (plot, tune, colours), and take it to Iain to pick versions. The prompt carries the stage rules and the proven moves, so it works in any LLM without the repo.

## 1. Break it into acts

Five to seven acts that tell a simple story, one plot beat each, named in the opera's language. Carmen: SEVILLE, L'AMOUR, THE FLOWER, TORÉADOR, JEALOUSY, THE KNIFE, LIBRE. The last act is the audience's feeling at the curtain, not a plot beat: give it the most time.

## 2. What happens, and what it makes the audience feel

One sentence of plot and a few words of feeling per act. The feeling is the thing. Then:

- **The tune**, quoted, as scale degrees in `k.deg` notation (`'1+'` is the tonic an octave up, `'7#'` a sharp seventh, `'5-'` the fifth an octave down). Mark `fromMemory: true` until Iain has heard it and said it's right.
- **Characters**, one dot each, colour from traditional staging with the source named (Carmen's red dress, the dragoon's blue, the suit of lights). Three is the sweet spot.
- **Story colours**, at most three, each meaning one thing (green is jealousy, white is the knife).
- **The wink**: one deadpan beat, from a character, at the worst moment.

## 3. Recreate it with the toolset

For each act, using `docs/TOOLSET.md`:

| Field | Question |
| --- | --- |
| set | What is the place, as light? A crowd? Blocks? Dark? |
| characters | Who's on stage, where, who's lit, who enters here? |
| actions | What moves? Which shots (wide, mid, close), cut on which beats? |
| music | Which theme, which voice, where's the silence, what's the room doing? |
| emotion | How do those add up to the feeling? |

Write it into `docs/treatments/<id>.json` (schema `docs/treatment.schema.json`). Validate with `node -e "JSON.parse(require('fs').readFileSync('docs/treatments/<id>.json'))"`.

## 4. Propose three versions, pick one

For each act, three genuinely different versions: usually one straight from the toolset, one that bends a technique, one new idea. Show Iain the treatment as a short table per act (feeling, three versions, your recommendation) and **stop**. Use multiple-choice questions when a fork is unclear. Record his pick in `chosen`.

## 5. Build, then refine act by act

### Build

Copy the shape of `operas/carmen.js`:

```js
O.opera = {
  title: 'CARMEN', lang: 'fr',
  tempo: 72, root: 2, mode: 'minor',
  stage: { grid: 9 },
  lights: { red: '#d4152f', blue: '#3d6fe0', gold: '#f4b93a', sand: '#e8c894', green: '#62c43a' },
  build(k) {
    const B = 60 / 72, C = k.centre, T = k.tl;
    // helpers: scheduled paint/pilot, ring(), a seeded rnd(), sing(), the bass pattern
    // characters as cells; chars = [] guards them from mass paints once they've entered
    // ---- reset for each loop: paint the world, clear pilots, wide shot
    // ---- Act I ... k.act('NAME', t) at the start of each act; let t advance
    // ---- last act: lament, last chords, blackout, silence
    k.end = t;
  },
};
```

Conventions that matter (details in 04):

- Keep `let t` as the running clock; each act starts with `k.act(name, t)` and advances `t`.
- `paint(els, name, t, force)` and `pilot(el, name, t)` are opera-side wrappers that schedule via `T.call`, because the kit's own `k.paint` and `k.pilot` act immediately.
- The reset at the top of `build` runs every loop: repaint the world, clear every character's pilot (including cells they moved to), set the wide shot at 0.
- Use a seeded random (`rnd`) so step mode is stable.
- Every caption is `k.say(el, text, t, hold)`; the act's name is `k.cue(text, t, hold, el)` which is the same thing beside the hero.

Build with `npm run build` and fix any gate failure before going on.

### Refine

One act at a time, in chat:

1. Open `dist/<id>.html?step=N` in the browser pane, muted. Find the act's start frames with the `O.acts` snippet in 01. Screenshot the frames that matter. Check the console for errors. Close the tab.
2. Report to Iain: the feeling, how the scene achieves it, a table of frames and what happens, the step link, anything you haven't verified (you can't hear it; say so).
3. Take his notes. Offer one or two fixes. He picks. Change, check, commit, deploy (`./deploy.sh`), send the link.
4. Log: technique to `docs/LOG.md` (and `docs/TOOLSET.md` if reusable), rejection to Avoid. Update the treatment JSON's `chosen`, `captions`, `wink`, `notes`.

Also check the opera on a phone-sized viewport (the browser pane's mobile preset, 375×812): captions on screen, type in the corners, nothing off the edge that matters.

### Sign-off, then golf

When Iain says it's done, do the golf pass: shorten helper names, share patterns, drop anything unheard or unseen. Nothing visible or audible may change. Aim for under 3 KB gzipped per opera. Then deploy.

## Adding an opera to the site

Nothing to register. The build picks up every `operas/<id>.js`; the menu lists `SITE_ORDER` in `build.js` and lights an entry when its file exists. `id` must match `SITE_ORDER` (`pagliacci`, `rigoletto`, `dido`, `flute`, `giovanni`, `barber`, `turandot`). The About page's sizes update from the build.
