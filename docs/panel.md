# The review panel

One page. All eight operas down the page, each playing in a small frame, each with a chat box beside it. You type a note in plain language. An agent that knows the engine proposes three alternatives. You watch them, pick one, and the opera file changes. Or you cancel.

There is no authoring UI. Authoring is the agent's job. The panel is for looking and saying.

## What it looks like

```
┌──────────────────────────────────────────────────────────────────────────┐
│ OPERA HOUSE · REVIEW                       engine 7,812 B · site 29,140 B│
├──────────────────────────────────────────────────────────────────────────┤
│ HOUSE                                                                    │
│ ┌──────────────────────┐  make everything a touch warmer                 │
│ │  (engine playground: │  ────────────────────────────────────────────   │
│ │   C major scale on   │  > 3 alternatives ready                         │
│ │   each voice, room)  │    [A] soprano vibrato later, room cutoff +400  │
│ └──────────────────────┘    [B] tenor detune 4c→7c                       │
│                             [C] all instruments attack +20ms   [cancel]  │
├──────────────────────────────────────────────────────────────────────────┤
│ 1  CARMEN                                   1,842 B · 0:58 · ▶ ■ ⟲       │
│ ┌──────────────────────┐  can we make the sound softer                   │
│ │                      │  ────────────────────────────────────────────   │
│ │      ●     ○         │  > 3 alternatives ready                         │
│ │                      │  ┌────────┐ ┌────────┐ ┌────────┐               │
│ │   L'AMOUR.           │  │ ▶ A    │ │ ▶ B    │ │ ▶ C    │   [cancel]    │
│ └──────────────────────┘  │ 1,839 B│ │ 1,851 B│ │ 1,840 B│               │
│                           └────────┘ └────────┘ └────────┘               │
│                           A  volume 0.85→0.6, room feedback up           │
│                           B  tenor→soprano for the habanera, softer atk  │
│                           C  drop percussion until section 3             │
│                           ────────────────────────────────────────────   │
│                           [ type a note about Carmen…            ] send  │
├──────────────────────────────────────────────────────────────────────────┤
│ 2  PAGLIACCI                                1,910 B · 1:04 · ▶ ■ ⟲       │
│ ...                                                                      │
```

Each row is one opera, in site order. Left: the real built opera in an iframe, scaled down, with play, stop and loop, and a scrubber under it. Right: a thread of your notes and the agent's responses for that opera, with the input at the bottom. The top row is the house: the shared engine, instruments and room, previewed as a scale on each voice. Notes there change every opera.

When three alternatives are ready they appear as three small frames under your note, each playing the whole opera with that change applied, each with a one-line description and its byte size. Click one to use it. Cancel discards all three. Nothing changes until you click.

## How a note becomes three alternatives

```
you type ─▶ POST /note {opera, text}
              │
              ▼
         server assembles a prompt:
           docs/music-guide.md        (hard rules)
           docs/engine-api.md         (every gesture, instrument field, transform, with byte cost)
           docs/stories.md#carmen     (the story card: what this opera is trying to be)
           opera/carmen.js            (the current data file)
           the thread so far          (earlier notes and what was chosen)
           the note
              │
              ▼
         claude -p, Sonnet, JSON out:
           three complete replacement opera files, each with a
           one-line description and a one-line rationale,
           deliberately different in approach (see below)
              │
              ▼
         server writes each to .review/carmen/{a,b,c}.js,
         builds each with build.js, measures, rejects any over budget,
         returns three preview URLs + descriptions
              │
              ▼
         you click A ─▶ POST /choose {opera, id}
              │
              ▼
         server copies a.js over opera/carmen.js, rebuilds, reloads the
         frame, appends the note and the choice to docs/review/carmen.md
```

**Three different approaches, not three sizes of the same knob.** The prompt asks for one alternative that changes only numbers (volume, attack, cutoff), one that changes the music (voice, transform, chord move, silence), and one that changes the staging (gesture, colour, scale, camera). "Softer" then gets a quieter mix, a different singer, and fewer dots moving. That is what makes picking useful.

**The agent never touches the engine from an opera row.** Opera notes can only produce opera data files. House notes can only produce instrument objects, room defaults and palette tokens. The engine's code is changed by a person, in a normal session, with the size check.

**Every note and choice is logged** to `docs/review/<opera>.md` as a dated list: the note, the three descriptions, which was chosen. That log goes into the next prompt for that opera, so the agent knows "softer" was already done once and does not undo it when you say "more drama".

## Parts

| Part | What it is | Size of the job |
| --- | --- | --- |
| `review/index.html` | The page. Plain HTML and one script. Eight rows from a list of opera ids. Iframes point at the site build. | Half a day |
| `review/server.js` | Node, no framework. Serves the page and the builds, two endpoints (`/note`, `/choose`), spawns `claude -p`. | Half a day |
| `review/prompt.md` | The system prompt: role, the rule that output is three complete files as JSON, the three-approaches rule, the byte budget. | An hour, then tuned |
| `docs/engine-api.md` | Generated from the engine by a script after Phase 1. Every gesture with signature, params, byte cost; every instrument field; every transform. This is what makes the agent "know the codebase" without reading source. | Comes from Phase 1 |
| `docs/review/*.md` | The logs. | Free |

No new dependencies. `claude -p` is the Claude Code CLI already installed. The server is Node's built-in `http`. If the page ever needs more than one script, that is the moment to reconsider, not before.

## What the panel does not do

- No sliders, lanes, or timeline editing. If you want a value changed, say so.
- No editing the engine. House notes change data the engine reads, never code.
- No undo button. The log has every choice; reverting is a note ("go back to before the softer change") and the agent has the log.
- No multi-user. It runs on localhost for one person.

## Build order

1. The page with eight iframes and play controls, reading the existing site build. Useful on its own for reviewing.
2. The server with `/note` returning three alternatives from `claude -p`, previews built into `.review/`.
3. `/choose`, the log, and the log feeding back into the prompt.
4. The house row.
5. Scrubber and per-section scoping ("in the second section, …"), only if notes keep needing it.

## Decisions

- **Model.** Sonnet generates the three alternatives. A note beginning "think harder" goes to the top model instead.
- **Scoping.** A note can name a section ("in the duet, …"). The agent knows the section names from the story card. No picker UI.
- **New operas.** Not from the panel. First drafts are written in Phase 3, one agent run per opera from its story card. The panel refines.
