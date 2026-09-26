# Gesture library: the catalogue

Per PLAN.md 4.3. Read against the eight story cards in `stories.md` and the transform kit, chord grammar and room in `music-guide.md`.

## The gesture contract

Every gesture is a function `(tl, time, actors, params) => endTime`: it takes the shared timeline, a start time, one actor or a list of actors, and a params object, schedules whatever GSAP tweens and Web Audio calls it needs starting at `time`, and returns the time its own business finishes so the score can chain the next beat off it. A gesture schedules both motion and sound in the same call unless its family is sound-only (it has no stage component) or it is explicitly silent — there is no third case, and no gesture waits on another gesture's internal state. Every param has a default, so a score line can pass `{}` or omit params entirely and still get a sane result. Gestures compose by time, not by nesting: two gestures at the same timestamp on different actors run side by side because the score put them there, not because one calls the other. A frame like "eclipse with a speech label" is two score lines sharing a `time`, never one gesture invoking another.

## The catalogue

Ten families, one table each. "Cards" names which opera's story card demands the gesture; a dash means the family table in PLAN 4.3 names the move but no card happened to need it — those rows are marked **speculative** and capped at ten across the whole catalogue.

### Entrance and exit

| name | spec | params (default) | sound pairing | cards | bytes |
| --- | --- | --- | --- | --- | --- |
| `enter` | slide in from a grid edge to a cell | `edge('left')`, `to`, `dur(0.6)` | pluck on actor's voice, panned from edge | Carmen, Rigoletto, Giovanni, Barber | 110 |
| `appear` | pop into existence at a cell, no travel | `cell`, `scale(1)` | short attack note, no pan sweep | Pagliacci, Giovanni | 70 |
| `exit` | travel off an edge (any side) and vanish, optionally rocketing | `edge`, `speed(1)` | note pitch-ramps up and cuts | The Magic Flute | 110 |
| `dissolve` | shrink and fade to nothing in place | `dur(1.2)` | voice fades under its own release | Carmen, Dido and Aeneas | 90 |
| `reveal` | swap an actor's colour/identity at a cell, mid-beat | `to`, `dur(0.3)` | one sharp accent on the swap frame | Rigoletto | 100 |

### Motion

| name | spec | params (default) | sound pairing | cards | bytes |
| --- | --- | --- | --- | --- | --- |
| `path` | travel a list of cells in order, optional trail | `cells`, `stepDur(0.4)`, `trail(false)` | one note per step on actor's voice | Don Giovanni | 160 |
| `orbit` | circle a fixed point or another actor | `center`, `radius(1.5)`, `turns(1)` | none by default | Carmen, Rigoletto | 150 |
| `wander` | undirected drift to a random nearby cell | `range(2)`, `dur(1)` | none | Pagliacci | 130 |
| `dash` | fast multi-point path leaving a bright trail | `cells`, `speed(2)` | fast arp burst per corner | The Barber of Seville | 170 |
| `weave` | path threading between other actors' current cells | `targets`, `stepDur(0.3)` | diminishing note run | The Barber of Seville | 160 |
| `rise` | travel upward one row per beat, unhurried | `rows`, `stepDur(0.8)` | held tone rising in register | The Magic Flute, Turandot | 120 |
| `sink` | travel downward one row per beat | `rows`, `stepDur(0.8)` | held tone falling in register | Dido and Aeneas | 120 |
| `scatter` | a group of actors flee outward from a point | `actors`, `from`, `dur(0.5)` | none | The Barber of Seville | 150 |
| `waltz`† | two actors circle each other in 3-beat turns | `partner`, `turns(2)` | triple-metre arp pulse | — | 140 |

† speculative.

### Relationship

| name | spec | params (default) | sound pairing | cards | bytes |
| --- | --- | --- | --- | --- | --- |
| `approach` | close the distance to a target actor over a duration | `target`, `dur(1)` | none | Rigoletto, Don Giovanni, Turandot | 110 |
| `touch` | two actors' cells coincide; instant contact beat | `other` | one sharp shared accent | Don Giovanni | 90 |
| `eclipse` | one actor's orbit or path closes down and snaps shut onto another | `target`, `dur(0.6)` | dry unresolved chord on snap | Carmen | 170 |
| `merge` | two actors become one at a shared cell | `other`, `dur(0.8)` | two voices resolve to one | Pagliacci | 130 |
| `split` | one actor becomes two, flying to separate cells | `to`, `dur(0.8)` | one voice divides into two panned copies | Pagliacci | 140 |
| `keepDistance` | actor is held apart from a target, never closing | `target`, `gap(3)` | none | Pagliacci | 90 |
| `swapSize`† | two actors trade their current scales | `other`, `dur(0.5)` | none | — | 120 |

† speculative — named in PLAN 4.3's reference-frame reading, not demanded by any card.

### Scale as meaning

| name | spec | params (default) | sound pairing | cards | bytes |
| --- | --- | --- | --- | --- | --- |
| `grow` | scale up smoothly, power or love | `to(1.6)`, `dur(1)` | note swells in volume | The Magic Flute, Don Giovanni | 70 |
| `shrink` | scale down smoothly, fear or death | `to(0.4)`, `dur(1)` | note fades toward silence | Carmen, Rigoletto, Dido and Aeneas, The Magic Flute | 70 |
| `pulse` | rhythmic brief scale beat, heartbeat-like | `beats(2)`, `amount(1.25)` | short accent per beat | Pagliacci, The Magic Flute, The Barber of Seville | 90 |

### Crowd and chorus

| name | spec | params (default) | sound pairing | cards | bytes |
| --- | --- | --- | --- | --- | --- |
| `fillRing` | light a concentric ring of chorus dots around a centre | `center`, `ring(1)`, `color` | arp-as-chorus shimmer | Carmen | 150 |
| `fillColumn` | light a column top to bottom in sequence | `col`, `stepDur(0.3)` | one note per lit cell, descending | Dido and Aeneas | 140 |
| `closeIn` | a ring or crowd contracts toward its centre | `center`, `dur(1.5)` | crescendo under the contraction | Carmen | 130 |
| `curtainParts`† | two chorus blocks slide apart to reveal the centre | `dur(1)` | held chord released on the parting | — | 160 |

† speculative.

### State

| name | spec | params (default) | sound pairing | cards | bytes |
| --- | --- | --- | --- | --- | --- |
| `colourWash` | flood the whole grid (or a group) to one colour/brightness | `color`, `actors('all')`, `dur(2)` | room opens or closes to match | Turandot | 120 |
| `dim` | reduce brightness/opacity without changing scale, one actor or a group | `to(0.3)`, `dur(1)` | none | Dido and Aeneas | 70 |
| `flicker` | rapid small unstable opacity/scale change | `beats(4)`, `amount(0.3)` | none | Pagliacci, Dido and Aeneas, The Magic Flute, Turandot | 90 |
| `freeze` | one or many actors hold their current pose exactly | `actors`, `dur(1)` | none by default | Carmen, Pagliacci, Rigoletto, The Barber of Seville, Turandot | 100 |
| `burnEmber`† | colour bleeds to ember red then dims to nothing | `dur(2)` | noise burst decaying under the fade | — | 160 |

† speculative.

### Camera

| name | spec | params (default) | sound pairing | cards | bytes |
| --- | --- | --- | --- | --- | --- |
| `zoomTo`† | wraps the existing `camera` helper to centre and scale on an actor | `target`, `zoom(1.5)`, `dur(1)` | none | — | 90 |
| `shake`† | short high-frequency camera jitter | `amount(6)`, `dur(0.3)` | none | — | 80 |
| `drift`† | slow unforced camera pan with no target | `to`, `dur(3)` | none | — | 90 |
| `snapCut`† | instant camera reframe, no tween | `target`, `zoom(1.5)` | none | — | 60 |

† speculative — the camera primitive already exists in `index.src.html`; no card's STAGE line calls for it directly, but the family and the reference frames assume it.

### Text

| name | spec | params (default) | sound pairing | cards | bytes |
| --- | --- | --- | --- | --- | --- |
| `cue` | typed lower-third caption, letterboxed reveal (as now) | `text`, `hold(1.6)` | none | all eight | 180 |
| `label` | a bracket or tag beside an actor, e.g. `THE CHASE` | `text`, `actor`, `dur(0.4)` | none | — (reference frames) | 140 |
| `speech` | black box, white uppercase text, on an actor, e.g. `HELLO` | `text`, `actor`, `hold(1)` | none | — (reference frames) | 160 |
| `dialogue` | two actors' labels answering each other, offset in time | `pair`, `texts`, `gap(0.4)` | none | — (reference frames) | 220 |

Text gestures never carry sound of their own; they compose with a `sing` or `silence` line at the same time when the beat needs one.

### Time

| name | spec | params (default) | sound pairing | cards | bytes |
| --- | --- | --- | --- | --- | --- |
| `hold` | actor and/or note sustain unchanged for a duration | `dur(2)` | held tone, long release | Carmen, Pagliacci, Rigoletto, Turandot | 70 |
| `stutter`† | rapid visual retrigger, same cell, no travel | `beats(4)` | none | — | 100 |
| `slow`† | the score's own clock eases for a span, independent of tempo | `factor(0.6)`, `dur(1)` | none | — | 90 |

† speculative.

### Sound-only

| name | spec | params (default) | changes | cards | bytes |
| --- | --- | --- | --- | --- | --- |
| `sing` | play the motif on a voice, optional transform | `voice`, `transform(null)` | plays motif/chord data through the named voice | all eight | 220 |
| `chord` | play a chord with a named harmonic move | `move('establish')`, `shape` | one chord voicing, bass + one colour note | Carmen, Pagliacci, Rigoletto, Don Giovanni | 200 |
| `arpChorus` | chord as fast arpeggio standing in for the crowd | `rate(45)`, `shape` | one oscillator cycling chord notes | Carmen, Rigoletto, Dido and Aeneas | 190 |
| `roomChange` | move the room's delay/filter toward a new state | `cutoff`, `feedback`, `dur(1.5)` | ramps the two live room params | The Magic Flute, The Barber of Seville, Turandot | 160 |
| `crescendo` | swell the master or a voice's gain over a span | `to(0.9)`, `dur(2)` | gain ramp | seven of eight | 90 |
| `silence` | mute the room/voice for a duration, then restore | `dur(0.25)` | drops master gain and restores it | seven of eight | 70 |
| `ritardando` | ease the clock's tempo into a cadence, then release | `stretch(1.15)`, `beats(1)` | tempo variable eased, not stepped | Carmen, Pagliacci, Rigoletto, Turandot | 80 |
| `drum`† | noise-buffer percussion hit from a named pattern | `pattern`, `vol(0.15)` | plays the shared noise buffer, filtered | — | 180 |
| `echoVoice`† | replay the last phrase quieter, on a different timbre | `delay(0.3)`, `voice` | second voice, offset and attenuated | — | 170 |

† speculative.

## The ranked twenty

Coverage counted as the number of STAGE, SOUND or CUE lines across the eight cards that a gesture's family covers, primary-tagged per line.

| rank | gesture | coverage |
| --- | --- | --- |
| 1 | `cue` | 36 |
| 2 | `sing` | 23 |
| 3 | `crescendo` | 9 |
| 4 | `silence` | 7 |
| 5 | `hold` | 7 |
| 6 | `freeze` | 6 |
| 7 | `chord` | 5 |
| 8 | `shrink` | 4 |
| 9 | `enter` | 4 |
| 10 | `flicker` | 4 |
| 11 | `arpChorus` | 4 |
| 12 | `ritardando` | 4 |
| 13 | `approach` | 3 |
| 14 | `roomChange` | 3 |
| 15 | `dissolve` | 2 |
| 16 | `pulse` | 2 |
| 17 | `rise` | 2 |
| 18 | `grow` | 2 |
| 19 | `appear` | 2 |
| 20 | `eclipse` | 1 (kept for the reference-frame decomposition in PLAN 4.3) |

These twenty are what Phase 1 builds first.

## Coverage check

Every STAGE and SOUND line in every card resolves to at least one catalogue gesture, usually composed as a visual gesture plus a sound gesture at the same time, occasionally one gesture covering both (e.g. `hold` sustaining an actor's pose and its note together).

- **Carmen** — enter+orbit / sing+roomChange; fillRing / arpChorus; shrink / sing; closeIn / chord+crescendo; freeze / silence; eclipse / sing+chord; dissolve / hold. None uncovered.
- **Pagliacci** — appear / sing; freeze / arpChorus; keepDistance / sing; pulse / chord; flicker / crescendo; split / sing; wander / hold. None uncovered.
- **Rigoletto** — orbit / sing; freeze / arpChorus; enter / sing; approach / silence; shrink / crescendo; reveal / chord; hold / hold. None uncovered.
- **Dido and Aeneas** — fillColumn / sing; sink / sing; flicker / sing; shrink / crescendo; dissolve / silence; dim / arpChorus. None uncovered.
- **The Magic Flute** — pulse / sing; exit / sing; shrink / silence; rise / roomChange; grow / crescendo; flicker / sing. None uncovered.
- **Don Giovanni** — appear / chord; path / sing; enter / sing; approach / crescendo; grow / sing; touch / chord; hold / silence. None uncovered.
- **The Barber of Seville** — dash / sing; freeze / sing; enter / sing; weave / crescendo; freeze / silence; pulse / roomChange; scatter / crescendo. None uncovered.
- **Turandot** — colourWash / sing; flicker / sing; rise / roomChange; hold / hold; freeze / silence; hold / crescendo; approach / sing. None uncovered.

No card has a STAGE, SOUND or CUE line without a home in the catalogue above.

## Total

53 named gestures (43 real, 10 speculative, the speculative cap PLAN 4.3 allows). Sum of the byte estimates in the ten family tables: **≈6,620 bytes gzipped** for the gesture layer alone, built independently of the current stage grammar.

That number does not land clean against the 8,192-byte engine target in PLAN section 3. The current runtime (tween + synth + stage) is already measured at ~5.5 KB. About fifteen of the catalogue's gestures (`cue`, `enter`, all four camera gestures, `hold`, `freeze`, `path`) are thin wrappers over primitives (`hop`, `camera`, `cue`) that already live inside that 5.5 KB, so their true marginal cost is well under the standalone estimate above — call it 4,500 to 5,000 bytes of genuinely new code once shared plumbing is deducted. Added to the 5.5 KB baseline, that puts the full engine at roughly 10,000 to 10,400 bytes gzipped: 1,800 to 2,200 bytes over budget.

**Achievable, but not without cutting.** In order:

1. Drop all ten speculative gestures first (`waltz`, `swapSize`, `curtainParts`, `burnEmber`, the four camera gestures, `drum`, `echoVoice`). None is demanded by a card; together they're worth roughly 1,300 bytes. Camera can borrow the existing `camera` function directly from a score line instead of four named wrappers.
2. Fold `dialogue` into two `label` calls offset in time rather than its own function — it doesn't need bespoke code, just two score lines. Saves most of `dialogue`'s 220 bytes.
3. Fold `chord`'s named harmonic moves (`planing`, `deceptive`, `plagal`, pedal point) into the automation the music guide already specifies as arithmetic on the chord's root-offset array, rather than branching code per move name.

Those three cuts alone claw back close to 2,000 bytes, which puts the real, ship-shape gesture library within reach of the 8,192-byte target — assuming the baseline 5.5 KB doesn't grow elsewhere in Phase 0's rebuild.
