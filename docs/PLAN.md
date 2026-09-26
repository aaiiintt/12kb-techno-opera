# Opera House: plan

Eight mini-operas on one site, each a legitimate operatic work in a few kilobytes, all built from a shared library of tiny visual and musical gestures. The library is the product. The eight operas are the first things it makes.

The aim, in Iain's words: maximum opera at minimal byte count, in a sonically and aesthetically beautiful way. Do the right thing, measure it, then name the number.

## 0. Decisions (26 Sep 2026)

| Question | Decision |
| --- | --- |
| Form | Every opera is intro, re-version of its known aria or theme, outro. The outro turns around into the intro so the loop is seamless. "Techno" means oscillators and chips, not club music. See [music-guide.md](music-guide.md). |
| Story time | The story lives in the re-version. The score is the timeline and the music drives the abstracted story. Intro sets the scene, outro resolves. |
| Melody | Evoke, don't quote. Essence only: keep the aria's leap, rhythm and harmonic ache in a new four-to-eight-note motif. Free form after that, driven by the story beats. Everything else is a transform of that motif. |
| Length | Aim for about 60 seconds. Tempo is free per opera. Go to two minutes if the story needs it. |
| Sound | One house cast across all eight: tenor, soprano, bass, arp-as-chorus, noise percussion, one two-delay room. Varied by tempo, key, mode, register, dynamics and room. Rules in [music-guide.md](music-guide.md). |
| Cues | Original language of the source, with the occasional English intrusion for the joke. |
| Cast | Three named actors maximum, plus the grid as chorus. |
| Selection | Research agent scores a shortlist, Iain approves the eight. |
| Size claim | Not fixed in advance. Build it right, measure, then name it. Both site and standalone numbers are reported. |
| Sequence | Research wave, then refactor, then gesture playground, then panel, then operas. |
| Music brief | [music-guide.md](music-guide.md). Every sound, story and engine agent reads it first. Its rules are hard rules. |
| The eight | Approved: Carmen, Pagliacci, Rigoletto, Dido and Aeneas, The Magic Flute, Don Giovanni, The Barber of Seville, Turandot. Alternates La Traviata, Tosca. See [operas.md](operas.md). |
| Panel | A review panel, not an authoring tool: eight previews down a page, a chat beside each, three agent-built alternatives per note, pick one or cancel. No new dependencies needed; the earlier approval of `vite` and `typescript` is moot unless the page outgrows one script. See [panel.md](panel.md). |
| Engine size | Target 10,240 bytes gzipped. Measured after Phase 1: 9,130 with all 53 gestures, formant soprano and ascend. `dialogue` dropped. |
| Ears | Phase 0.5 line-up approved by Iain: four voices distinct, formant soprano works. |
| Goal (26 Sep) | A curated series in the spirit of Tenori-on and Electroplankton: same dots, same voices, eight ways of telling (characters, pure feeling, light show, and combinations). Dots are discs of light; more shimmer. Premium 60 fps feel. Whole series under 48 KB. Series map in [visual-guide.md](visual-guide.md). |
| Eyes | First drafts rejected by Iain on 26 Sep: samey, literal one-dot-per-character, not enough movement, scale or feeling. The audio is great. Visual redo: [visual-guide.md](visual-guide.md), a spectacle gesture family, stage that changes (background, grid density, dot size), characters as forces first and a dot only when it matters, cards rewritten as visual scores, one pilot then seven. Engine target raised to 12,288 and standalone to 14,336 to pay for it. |
| The current opera | Retired. The site is the eight new operas. Its code is quarry for the engine, not a ninth piece. |


This document is the shared brief for every agent on the project. Read it before doing anything else.

## 1. What we already have

The 12KB Techno Opera proves the form: 81 dots, oscillators, Italian cues, one file, 12,177 bytes gzipped. Its parts, measured:

| Part | Where | Rough gzipped share |
| --- | --- | --- |
| Timeline and easing engine | `src/tween.js` | 1.4 KB |
| Synth (voices, arp, drums, room) | `note`, `arp`, `drum`, `setRoom` | ~2.5 KB |
| Stage grammar (grid, hop, camera, cue, shake) | `buildGrid`, `hop`, `camera`, `cue` | ~1.5 KB |
| Chrome (title, nav, play, about, CSS) | markup and style | ~2.5 KB |
| The opera itself (seven act functions, cues, config) | `act1` to `act7`, `CUES`, `CONFIG` | ~4 KB |

The lesson: the opera-specific part is the biggest slice, and it is hand-written imperative code. Turn the acts into data over a gesture vocabulary and each opera shrinks by half or more, and becomes something a builder tool can author.

## 2. Architecture

Three layers. Each has a byte budget and an owner.

```
engine.js      shared runtime, loaded once, cached      (tween + synth + stage + gestures)
opera/*.js     one file per opera, pure data + tiny glue (cast, palette, score, cues)
site           index + per-opera page shell            (chrome only)
```

**Engine.** Everything reusable. The tween engine, the synth, the stage grammar, and the gesture library. A gesture is a named function `(tl, time, actors, params) => endTime` that schedules both motion and sound. The engine is the one place where quality compounds: a better soprano or a better `eclipse` gesture improves all eight operas at once.

The audio half of the engine follows the music guide exactly:

- One generic voice function driven by an instrument object (`{wave, detune, attack, decay, filterStart, filterEnd, vibratoDepth, vibratoDelay}`), not a function per instrument. Four house instruments: tenor, soprano, bass, arp. Percussion from one noise buffer.
- One automation helper `(param, start, end, duration, curve)` for every envelope, sweep, swell and pitch drop.
- Pitch as scale index over a mode array, converted at play time. Chords as shape indices over root offsets.
- A motif transform kit: transpose, minor, invert, augment, diminish, fragment, retrograde, each under 40 characters.
- Patterns as strings (one character per step, dot for rest, dash for hold) plus a sequence of pattern indices.
- One room: two cross-fed delays with a low-pass in the loop; cutoff and feedback are live parameters the score can move.
- One scheduler, one clock, a tempo variable so cadences can breathe.

**Opera module.** A plain object. No functions except where a gesture genuinely needs a callback.

```js
export default {
  title: 'CARMEN', lang: 'fr',
  cast: { carmen: { color: '#e63b2e', voice: 'soprano' }, jose: { color: '#f5a623', voice: 'tenor' } },
  mode: 'phrygian', root: 2, tempo: 72,
  motif: '0 -1 -2 -3 | x.x.x-',            // contour evoking the Habanera's descent, not its notes
  chords: [[0,'m'],[5,'m'],[7,'M'],[0,'m']], // root offsets and shape indices
  patterns: ['A...A...', 'A.a.A.a.', ...],   // one char per step; A motif, a fragment, dots rest
  sequence: [0,0,1,2,1,3],
  score: [
    [0,   'enter', 'carmen', { from: 'left' }],
    [0.5, 'cue', 'L\'AMOUR.'],
    ['b2', 'orbit', ['jose','carmen'], { turns: 2 }],
    ['b4', 'sing', 'carmen', { transform: 'invert' }],
    ...
  ],
};
```

The score is a list of `[time, gesture, actors, params]`, where time is seconds in the intro and outro and bar.beat inside the re-version. Cues are gestures too. The music is one motif, one chord grammar, a few patterns and a sequence, with all variation done by transforms. Nothing stored twice.

**Site.** An index that lists eight titles in the existing typographic style, and one page per opera that loads the engine plus that opera. Same look as now: black, one Swiss face, uppercase, the byte count shown as a badge because the byte count is part of the joke.

**Two build outputs per opera.** The site version (shared engine, small opera file) and a standalone single-file version (engine inlined, for the demoscene reading of the project). The build reports both sizes and fails on the budget.

## 3. Size targets

Extreme but passable. These are the numbers to design against; Phase 0 measures whether they hold and adjusts before anyone writes an opera.

| Thing | Target (gzipped) | Stretch | Why this number |
| --- | --- | --- | --- |
| Engine, with the full gesture library | 12,288 bytes | 10,240 | Raised from 8 KB on 26 Sep after the catalogue estimated ~10 KB for 53 gestures |
| One opera module | 2,048 bytes | 1,024 | Current opera is ~4 KB as imperative code; data halves it |
| Of which, the score (motif, chords, patterns, sequence) | 512 bytes | 256 | 4k intros fit a whole track in ~1 KB of notes; ours are a minute long |
| Site index | 2,048 bytes | 1,536 | Text and a list |
| Per-opera page shell | 1,024 bytes | 768 | Shares CSS with the index |
| Standalone single-file opera | 14,336 bytes | 12,288 | Engine + opera + minimal chrome. Raised 26 Sep to pay for the spectacle gestures. |
| Whole site, all eight operas, first load of everything | 49,152 bytes | 32,768 | "Eight operas in 32 KB." One floppy sector is 512 B; this is 64 sectors |

Tactics that get us there, in order of payoff:

1. Data over code. Scores as arrays, not functions. Motifs as semitone strings like `"0 4 7 12"`.
2. One minifier pass over engine and operas together, so property names mangle consistently. Terser with `mangle.properties` on a reserved regex.
3. A shared dictionary. Gzip already loves repetition, so keep gesture names short and stable and keep params in the same order everywhere.
4. Measure per gesture. The build prints the byte cost of each gesture so the library can be pruned. A gesture that costs 300 bytes and is used once is a candidate to inline into that opera.
5. No dead eases, no dead voices. Tree-shake by hand: the standalone build includes only gestures the score references.

## 4. Pre-production research (the part before any code)

Four research tasks. Each produces one markdown file in `docs/`, written by a Sonnet agent from a tight brief, then reviewed once by the orchestrating model. Findings go in the file, not in chat.

### 4.1 Which eight operas: `docs/operas.md`

Score candidates on a rubric, 1 to 5 each:

- **Recognition.** Does a non-opera audience know a tune from it? (Habanera, Nessun dorma, Queen of the Night, Ride of the Valkyries, Largo al factotum, Brindisi, Flower Duet.)
- **Reducibility.** Can the plot survive as three actors and six beats? Two lovers and an obstacle reduces well. Court intrigue does not.
- **Dot-ability.** Does it have one strong visual idea our grammar can carry? A fall from a parapet, a moth to a flame, a mob closing in, a door that will not open.
- **Motif-ability.** Can the aria's essence survive as a four-to-eight-note motif with one leap and a tappable rhythm, without quoting it? Strong contour and simple rhythm score high.
- **Language and tone spread.** Across the eight we want Italian, French, German, maybe English, and at least two comedies.
- **Rights.** Melody must be public domain. Everything before 1926 is safe everywhere. Turandot is fine for Puccini's own material; avoid the Alfano ending.

Starting shortlist for the agent to score, not a decision: Carmen, La Traviata, The Magic Flute, Tosca, Madama Butterfly, Don Giovanni, Die Walküre, The Barber of Seville, La Bohème, Turandot, Rigoletto, Aida, Orfeo ed Euridice, Pagliacci, Dido and Aeneas, The Marriage of Figaro. Output: a scored table, a recommended eight, two alternates, and one line per pick on the single strongest visual idea.

### 4.2 Story deconstruction: `docs/stories.md`

One story card per chosen opera, all in one file, same template:

- Logline in one sentence.
- Cast as dots: three actors maximum, plus optional chorus. Colour and size for each, and what the size means (status, love, danger).
- Sections, not seconds. Intro (free time), then the track in named sections (build, drop, breakdown, second drop, or whatever the brief in section 8 settles on), then outro. Each section gets one or two story beats: a sentence of what happens on stage, a sentence of what we hear, and one cue in the original language. Cues are one to three words, knowing, minimal, in the spirit of `VENDETTA!` and `ADDIO.`
- The motif: which aria or theme it evokes, and what we keep (contour, rhythm, the one leap, a harmonic move) without quoting. Four to eight notes, written as scale degrees and a tappable rhythm.
- The chord grammar: root sequence and shapes, and which of the six moves it uses (delayed resolution, borrowed minor, deceptive cadence, plagal cadence, planing, pedal point).
- Which voice sings the motif first, and which transforms tell the story (the soprano singing the tenor's line is a plot point).
- Tempo, root and mode, and where the tempo breathes.
- The arc of the room: how the reverb and filter move with the drama.
- How the outro turns around into the intro, visually and musically.
- Running time. About 60 seconds, up to two minutes if needed.

These cards are drafts for the brainstorm, not final scripts. Quantity and clarity over polish.

### 4.3 Gesture library brainstorm: `docs/gestures.md`

The heart of the project. Read the eight story cards, then list every distinct visual or musical move they need. Merge duplicates, name each one, and give it a one-line spec, its parameters, its sound pairing, and a rough byte estimate. Aim for 50 to 70 named gestures. Group them:

| Family | Examples from the reference frames and the story cards |
| --- | --- |
| Entrance and exit | enter from edge, appear at cell, fade, fall off the bottom, dissolve to embers |
| Motion | path (a list of cells), chase, flee, orbit, waltz, wander, march in rank |
| Relationship | approach, touch, eclipse (one circle rises over another), swap sizes, merge, split, keep distance |
| Scale as meaning | grow (power, love), shrink (fear, death), pulse (heartbeat), breathe |
| Crowd and chorus | fill rows, fill rings, disperse, close in, part like a curtain, stripe the grid |
| State | colour wash, dim, flicker, freeze, burn to ember, drain |
| Camera | zoom to actor, shake, drift, snap cut |
| Text | cue (typed, lower third), label (a bracket or tag on an actor, like THE CHASE), speech (a black box on the actor, like HELLO), dialogue (two labels answering each other, like NO YOU CAN'T / YES I CAN) |
| Time | hold, stutter, slow, silence |
| Sound-only | sing (motif with a transform), chord, arp as chorus, echo voice, drum pattern, room change, crescendo, silence, ritardando |

The four reference frames are read as: `eclipse` with a `speech` label; `path` with `intruder` dots and a `label`; `dialogue` with a `swapSize` beat. That is the level of granularity we want: each frame is two or three gestures composed.

Then rank: which 20 gestures cover the most beats across the eight cards. Those are what we prototype first in the playground.

### 4.4 The review panel: `docs/panel.md`

Not an authoring tool. One page with all eight operas playing down it, a chat box beside each. A note in plain language ("can we make the sound softer", "this doesn't feel romantic enough") goes to an agent that knows the engine API, the music guide and that opera's story card. It returns three alternatives that differ in approach (numbers, music, staging), each built and playing in a small frame with its byte size. Pick one and the opera file changes; cancel and nothing does. A house row at the top does the same for the shared instruments, room and palette. Every note and choice is logged and fed back into the next prompt. Spec in `docs/panel.md`. The rejected tracker-style spec is kept as `docs/panel-v1-rejected.md` for reference.

## 5. Build phases

### Phase 0: build the engine (top model plans, Sonnet builds)

Build `engine.js` from the current code and the music guide, and prove it with a short scratch score. The current opera is retired, so nothing has to be preserved; its code is quarry.

1. Extract `engine.js` (tween, synth, stage, cue, camera, hop).
2. Rebuild the synth to the guide: one voice function plus instrument objects, one automation helper, scale-index pitch, chord shapes, the transform kit, string patterns plus a sequence, one room, one scheduler with a tempo variable. Steps 1 to 5 and 7 of the guide's working method.
3. Write a scratch score of about 20 seconds using a first cut of ten gestures, one motif, one chord grammar, two patterns and a sequence. It exists to exercise the engine, not to be shown.
4. Build both outputs and print sizes per part, with the audio module's gzipped size on its own line.
5. Adjust the size targets in section 3 from measurements.

Exit criterion: the scratch score plays end to end, every voice sounds like a character, the room sounds like a building, and the measured sizes are in this doc.

### Phase 1: gesture library and playground (Sonnet builds, top model reviews)

Implement the top 20 gestures from `docs/gestures.md` in the engine. Build a bare playground page that renders any gesture with sliders for its params and a byte readout. This is the playground before the panel: ugly, fast, for finding out which gestures are worth their bytes.

### Phase 2: the review panel (Sonnet builds from `docs/panel.md`)

The page, the server, the prompt, and `docs/engine-api.md` generated from the engine. Needs Phase 1's gestures to exist so the agent has something to propose with.

### Phase 3: eight operas (Sonnet drafts, top model directs)

One opera per agent run, in parallel, each from its story card. The orchestrator reviews all eight in one session against a checklist: recognisable in ten seconds, one clear visual idea, cues land, under budget. Gestures missing from the library get added to the engine, not hacked into an opera.

### Phase 4: site and ship

Index, per-opera pages, about page, byte badges, standalone downloads. Deploy on Vercel as now.

## 6. Multi-agent plan and token discipline

The expensive model orchestrates, decides and reviews. It does not write boilerplate or research summaries.

| Task | Model | Runs | Notes |
| --- | --- | --- | --- |
| Brief, architecture, size targets, reviews | Fable (this session) | ongoing | Writes specs and checklists, reads outputs, decides |
| 4.1 opera selection | Sonnet | 1 | One prompt, one file |
| 4.2 story cards | Sonnet | 1 | All eight in one run, after 4.1 lands |
| 4.3 gesture brainstorm | Sonnet | 1 | Reads 4.2, writes catalogue |
| 4.4 panel research | Sonnet | 1 | Parallel with 4.2 and 4.3 |
| Phase 0 refactor | Sonnet | 1 to 2 | Spec from Fable includes the gesture signatures |
| Phase 1 gestures | Sonnet | 2 to 4 | Batches of five to seven gestures per run |
| Byte measurement, renaming, table updates | Haiku | many | Mechanical |
| Phase 3 operas | Sonnet | 8, parallel | Each gets only its story card, the engine API doc and the checklist |
| Review passes | Fable | 3 | After Phase 0, after Phase 1, after Phase 3 |

Rules that keep tokens down:

- **Agents read files, not conversations.** Every agent gets this doc plus the one or two files its task needs. Nothing else. Anyone touching sound, story cards or the engine also gets `docs/music-guide.md`.
- **Agents write files, not essays.** Output goes to `docs/` or `src/`. The report back to the orchestrator is under 200 words: what was written, what is uncertain, what it needs decided.
- **One engine API doc.** After Phase 1, `docs/engine-api.md` lists every gesture with its signature and byte cost, every instrument field and every transform. Opera agents and the review panel's agent read that, never the engine source.
- **Batch parallel work.** The four research tasks are two waves (4.1 and 4.4 first, then 4.2 and 4.3). The eight operas are one wave.
- **Review with checklists, not rereads.** The orchestrator checks outputs against the exit criteria in this doc rather than reading everything line by line.
- **Iain tests in the browser.** Agents run the build and the size check. Anything that needs ears and eyes gets a numbered checklist for Iain instead of a browser automation loop.

## 7. Open decisions

Assumptions the plan makes. Change them here and the agents inherit the change.

- **Shared engine on the site, standalone builds as downloads.** Both are measured. Which number is the headline is decided after measurement.
- **Panel is a dev tool in this repo**, not a product. If it turns out to be good, that is a later decision.
- **Scores are written in bars and beats**, not seconds, inside the track section. Intro and outro can use seconds.

## 8. Music brief

The music brief is [music-guide.md](music-guide.md), Iain's guide to soundtracking the opera. It is the spec for the synth, the template for the sound half of every story card, and the review checklist for every opera's music. Its "rules to write on the wall" are hard rules for every agent:

- Every voice is a character. If you can't say who it is, cut it.
- The bass and one other note define a chord. Drop the rest.
- A motif is stored once. Everything else is a function of it.
- Timbre is change over time. If a sound is static, it's wrong.
- Silence and dynamics are the cheapest drama you have. Use them before adding a voice.
- If you typed it twice, it's a pattern. If it changes smoothly, it's a formula.
- Check the size on every commit.

What "re-version of the known track" means under this brief: not a remix and not a quotation. The opera's famous aria or theme is studied for its fewest moving parts (its leap, its rhythm, its harmonic ache), a new four-to-eight-note motif is written that carries those parts, and the whole re-version is that motif in the house cast, transformed as the story turns. The music guide's listening list is the reference set, and its working method is the order of work for the audio side of Phase 0.
