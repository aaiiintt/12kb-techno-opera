# Spend

Budget: $70 for the redesign pass, set 29 Sep. Tokens are estimates: the harness does not report a subagent's usage back, so each line is the prompt size plus a guess at what the agent read and wrote, priced at list rates. Assumed rates per million tokens: Fable 5.1 $15 in / $75 out (assumed equal to Opus, unconfirmed), Opus 5.5 $15 / $75, Sonnet 5.5 $3 / $15. Cached prompt tokens are cheaper than this, so the true figure is likely lower.

| When | Who | What | Tokens (est.) | Cost (est.) |
| --- | --- | --- | --- | --- |
| 28 Sep | Fable (this session) | research, runner, synth port, three operas, shots | ~600k in (mostly cached context), ~60k out | ~$13 (uncertain: cached reads are billed at a fraction) |
| 29 Sep | Fable | gallery harness, toy acts, plan, ledgers | ~150k in, ~15k out | ~$3 |
| 29 Sep | Fable | music check: fetching and reading eight scores, tunes.js, MUSIC.md | ~120k in (score images are ~1.5k tokens each), ~12k out | ~$3 |
| 29 Sep | Opus 5.5, Traviata agent | six acts redesigned, four gallery loops | 234k (reported by the harness) | ~$5.6 |
| 29 Sep | Opus 5.5, Barber agent | six acts redesigned, four gallery loops | 242k (reported) | ~$5.8 |
| 29 Sep | Opus 5.5, Carmen agent | six acts redesigned, five gallery loops | 255k (reported) | ~$6.1 |
| 29 Sep | Fable | wiring the tunes, runner fixes from the agents' requests, review of all sheets, ledgers | ~200k in, ~15k out | ~$4 |

| 29 Sep | Opus 5.5, cast agent | lib/cast.js (idle, walk, jump, kneel, fall, hold; eyes; squash) adopted in all three operas; found and fixed a crash in the shave toy | 222k (reported) | ~$5.3 |
| 29 Sep | Sonnet 5.5 x3, polish agents | each opera's weak list: Carmen 108k, Barber 117k, Traviata 131k tokens (reported) | 356k | ~$1.7 |
| 29 Sep | Fable | verifying and committing each pass, final gallery, ledgers, report | ~120k in, ~8k out | ~$2.5 |


| 29 Sep | Fable | the Carmen timeline document, its revision, the runner rewrite (WATCH beats, cards, icons, direct input), Carmen rebuilt to the timeline, gallery loops | ~350k in (cached context), ~45k out | ~$8 |

Agent lines are priced at an assumed 85% input / 15% output split of the reported total.
Running total: about $59 of $70.
