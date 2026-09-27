# 01. Project state

As of 27 September 2026, end of the Carmen session.

## What exists

- **A shared engine** (`src/engine/`, built to `dist/engine.js`, about 8.3 KB gzipped): synth voices, the grid of discs, lights driven by audio envelopes, a timeline, a camera, captions, step mode.
- **A shell** (`src/shell.html`, about 3 KB gzipped): the page chrome. Title on the grid, MENU and PLAY, the menu overlay, the about page, the fade while playing, pause.
- **One finished opera:** `operas/carmen.js` (about 3.8 KB gzipped, an 88 s loop, seven acts). Its treatment is `docs/treatments/carmen.json`.
- **A kit demo:** `operas/hello.js`. Proves the kit, not art. Never ships.
- **The live site:** https://dot-opera.vercel.app (Vercel project `dot-opera`, team `iaintaits-projects`). Index with the menu open, About, Carmen.
- **The original 12KB Techno Opera** still lives at the repo root (`index.html`, `about.html`, built from `src/index.src.html` and `src/tween.js`). It is the reference and must keep building under 12,288 B gzipped. Don't touch it.

## Repo map

```
build.js                  the build: minify, gzip, gate, write dist/
operas/<id>.js            one file per opera (code against the kit)
src/engine/{tween,synth,stage,score,index}.js   the engine, concatenated in that order
src/shell.html            the chrome, shared by every page
src/about.html            the About text (Iain's copy; sizes filled by the build)
src/index.src.html, src/tween.js   the original opera (reference only)
dist/                     build output; the deployable files are index.html, about.html, engine.js, <id>.html, <id>.js, <id>.standalone.html
docs/BRIEF.md             the brief (hard limits, feel, how to work)
docs/TOOLSET.md           what we can make, grouped as set / characters / actions / music / emotion
docs/KIT.md               the kit API
docs/LOG.md               techniques and Avoid, dated, with reasons
docs/music-guide.md       Iain's music brief
docs/treatment.schema.json, docs/treatments/<id>.json   treatments
docs/PLAN.md              historical: the 26 Sep plan; many of its decisions were later reversed (see 02)
docs/archive/             earlier drafts of everything; operas.md has the research on the eight
.claude/skills/dot-opera/SKILL.md   the workflow skill
.claude/launch.json       "opera": a static server for dist/ on port 4173
review/                   an older review panel (server.js, port 5173). Iain called the panel useless; the server is still handy as a static server for /dist/
archive/operas-v2, -v3    old drafts of the operas, rejected
handover/                 this folder
```

## Commands

```bash
npm run build
```
Builds everything: the original site, the engine, the shell, every opera in `operas/`, the index and about pages. Prints gzipped sizes and fails on any gate. Run it after every change; never stack changes on a red build.

```bash
node build.js --only carmen
```
Fast path: rebuilds one opera only.

**Viewing locally.** Either start the launch config `opera` (static server on http://localhost:4173, serving `dist/`), or run `npm run review` and use http://localhost:5173/dist/. Pages:

- `dist/<id>.html`: the opera. PLAY starts it.
- `dist/<id>.html?step=N`: **step mode**, the review tool. Muted. One frame per beat, rebuilt from scratch and fast-forwarded, so a frame looks the same however you reach it. Arrow keys step; shift+arrow jumps between acts; the counter bottom right shows act, frame and seconds. Frame 1 is t = 0.
- `dist/<id>.html?gate=12.5,43.3`: gate mode, plays muted and freezes at each second; `O.gateNext()` continues. Step mode has mostly replaced it.
- `dist/index.html`: the index (menu open). `dist/about.html`.

**Checking in the browser pane.** Open the tab, check frames, mute if you start playback (`O.master.gain.value = 0`), and close the tab when done. Never leave audio playing in a hidden pane. Useful snippets:

```js
JSON.stringify(O.acts.map(a => [a.name, Math.round(a.t / (60 / O.opera.tempo)) + 1]))  // act start frames
O.duration  // loop length in seconds
```

## Size gates (build.js `LIMITS`)

| Thing | Gate (gzipped) | Now |
| --- | --- | --- |
| engine.js | 12,288 | ~8,320 |
| each opera | 4,096 | Carmen ~3,800 |
| each standalone page | 16,384 | Carmen ~14,300 |
| index.html | 4,096 | ~3,100 |
| original index.html (root) | 12,288 | ~12,275 (13 B spare; don't touch) |

Iain loosened the opera gate from 2 KB to 4 KB on 27 Sep: "look great first, then as small as it can be". The series target is still to come in under about 48 KB in total. Report the gzipped size on every build. Golf only after sign-off.

## Deploying

Only the new site's files go up, to the Vercel project `dot-opera`. The repo root has its own `.vercel/` link to a different project (`pop-up`); don't deploy from the root.

```bash
./deploy.sh
```

`deploy.sh` (repo root) builds, copies the deployable files into a temp folder, links it to `dot-opera` and runs `vercel deploy --prod`. It excludes `hello` and anything starting with `scratch`. After it runs, check https://dot-opera.vercel.app/<id>.html. If you deploy by hand instead: never let a `.env.local` into the deploy folder (`vercel link` writes one containing a token); the script's `.vercelignore` guards against that.

## Git

Branch `main`. Commits are small, present tense, one concern each, and end with `Co-Authored-By: Claude <model> <noreply@anthropic.com>` (use the line the session gives you). At handover, main is many commits ahead of `origin/main` and has not been pushed. Ask Iain before pushing.

Never commit secrets: `.env*`, `credentials.json`, `token.json`, API keys. Check before staging.
