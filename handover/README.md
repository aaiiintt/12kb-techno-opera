# Dot Opera: handover

Start here. This folder tells a new agent how to take Dot Opera from one finished opera (Carmen) to the full series of eight.

**The project in one paragraph.** Dot Opera is a curated series of famous operas, each retold in about a minute on a grid of glowing flat discs, sung by synthesised voices, with the opera's most recognisable tune quoted. The feel is Tenori-on and Electroplankton: premium, minimal, austere on the surface and sweet underneath, with one deadpan comic wink per opera. The principle is "max opera, minimum filesize". Carmen is finished and live at https://dot-opera.vercel.app. Seven remain: Pagliacci, Rigoletto, Dido and Aeneas, Die Zauberflöte, Don Giovanni, Il barbiere di Siviglia, Turandot.

## Read in this order

| File | What it gives you |
| --- | --- |
| [01-project-state.md](01-project-state.md) | Where everything lives, what's built, the commands, the sizes, how to deploy. |
| [02-working-with-iain.md](02-working-with-iain.md) | How Iain reviews, what he likes, what he rejected and why. Read this before you show him anything. |
| [03-how-to-make-an-opera.md](03-how-to-make-an-opera.md) | The workflow, step by step, with the treatment JSON, the shape of an opera file, and the review loop. |
| [04-engine-and-kit-notes.md](04-engine-and-kit-notes.md) | The kit's gotchas, the engine's quirks, and where to change the chrome. |
| [05-the-next-seven.md](05-the-next-seven.md) | A starting brief for each remaining opera: story spine, feeling per act, tune, colours, characters, the toolset test it poses, wink candidates. |
| [06-open-issues.md](06-open-issues.md) | The punch list: what's owed, what's unverified, what's stale. |

Then read the working documents in the repo, which the handover points at rather than duplicates:

- `docs/BRIEF.md`: the hard limits and the feel. Short. Every choice answers to it.
- `docs/TOOLSET.md`: what we can make with dots, sound and captions, proven in Carmen.
- `docs/KIT.md`: the API an opera file writes against.
- `docs/LOG.md`: every technique that was accepted and every idea that was rejected, with reasons.
- `docs/music-guide.md`: Iain's own music brief. Its rules are hard rules.
- `docs/PROMPT.md`: the one-shot prompt that turns an opera's name into a treatment brief.
- `.claude/skills/dot-opera/SKILL.md`: the five-step workflow as a skill. Invoke it with `/dot-opera` when starting an opera.
- `operas/carmen.js` and `docs/treatments/carmen.json`: the worked example. Read them side by side.

## The mission for the next agent

1. Make the remaining seven operas, one at a time, in chat with Iain, using the five-step workflow. Start with Dido and Aeneas: it's the opposite of Carmen and is the test that the toolset transfers.
2. Keep the docs true: every accepted change is a technique in `docs/LOG.md` and, if reusable, an entry in `docs/TOOLSET.md`; every rejection goes under Avoid.
3. Keep the site live: build, check, commit, deploy after every accepted change.
4. Golf each opera only after Iain has signed it off.

Don't build pipelines, agent swarms or review panels. Iain rejected all three. The workflow is a conversation, one act at a time, with frame numbers.
