# 06. Open issues

In rough priority order. Tick them off in this file or move them to `docs/LOG.md` as they close.

## Owed

- ~~Push to origin~~ and ~~delete the first Vercel deployment~~: both done 27 Sep. `main` tracks `origin/main`; `dot-opera-bbwgjkx7d` is removed.
- **Carmen golf pass.** Carmen is signed off at about 3.8 KB gzipped. Aim under 3 KB with nothing visible or audible changing. Candidates: shorten helper names, share the crowd-block and walk code, drop the unused `SLIDE_D`-style duplicates, trim comments (they're stripped anyway; the cost is in code shape).
- **Tunes written from memory**, flagged `fromMemory: true` in `docs/treatments/carmen.json`: the Habanera answer phrase, the Toréador refrain (in the relative major), the fate motif. Iain hasn't confirmed them by ear. Ask him to listen and correct degrees.

## Should fix

- **Parallel sessions.** On 27 Sep two sessions worked on the repo at once, and a `git add -A` in one swept the other's uncommitted Barber work into an unrelated commit (`9e059ff`). Before committing, run `git status` and stage only your own files. Check with Iain whether another session is live.
- **Barber is 24 B under its gate** and unreviewed. Its first act (a roll call of the cast) and the Nokia-snake Figaro need Iain's eye; the golf pass on it is owed before anything is added.

- **Captions off screen on phones.** Crowd tags on the far edges of the Act IV blocks (`R[4]`, `L[13]`) target cells that don't exist on a narrow grid, so `k.say` skips them. Move those tags to cells inside the stage or pick the speaker from cells that exist (`.filter(Boolean)`).
- **Step-mode first load with every light off.** Reproduce, then check whether `startLightLoop` runs before the page is visible and whether `tickLights` needs a `visibilitychange` kick.
- **The About line "one hundredth of a second of a YouTube video"** will go stale as operas are added. Ask Iain whether to recompute it in the build or reword.
- **`dist/` still holds old v2 output** (barber, dido, flute, giovanni, pagliacci, rigoletto, turandot, scratch*, lights, palette, playground, meta.json, sizes.json). Harmless (never deployed; `deploy.sh` copies only current operas) but confusing. Delete the stale files once, or make the build clean `dist/`.
- **Ink runs under the title on wide screens** in Jealousy (rows 1 to 7 of the box). Trim to rows 2 to 6 if Iain minds.

## Stale documents

- `docs/PLAN.md` is the 26 Sep plan. Several decisions there were reversed (evoke don't quote became quote the tune; lower-third cue became captions; 16-colour palette became staging colours per opera; 2 KB gate became 4 KB). Treat it as history. Consider moving it to `docs/archive/`.
- `docs/archive/` holds every rejected draft. Only `operas.md` (the research) is still useful.
- `review/prompt.md` and `review/server.js` describe the retired panel workflow and old budgets.
- `README.md` at the root describes the original 12KB opera only. It should eventually describe Dot Opera too, in Iain's words, so ask before writing it.

## Ideas parked

- A house "purple section": Iain's favourite moment in the original was four ascending full chords with ring pulses and the room opening. No Dot Opera has an equivalent yet. Turandot's dawn or Flute's trials could carry one.
- A push-in: the three-shots technique allows one deliberate zoom per opera at the peak. Carmen uses cuts only.
- Seville sand is shared by Carmen and Il barbiere di Siviglia. A shared colour across two operas would be a quiet series joke.
