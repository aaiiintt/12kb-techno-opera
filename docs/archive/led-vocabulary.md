# LED vocabulary

Research for the visual redo (see PLAN.md, "Creative reset" and "Kawaii"). A catalogue of light-display behaviours to draw gestures from: LED matrix effect libraries, Tenori-on and Electroplankton, and kids' editors / party-light apps. Flat grid only — no gradients, no 3D, no camera tricks.

## 1. LED matrix effect libraries

**WLED** (220+ effects; grouped by kno.wled.ge and the WLED wiki):
- Solid — static fill.
- Blink / Strobe — whole strip or cell snaps on/off.
- Breathe — brightness rises and falls smoothly, like lungs.
- Wipe / Wipe Random — a colour front sweeps across in one pass.
- Sweep — wipe that reverses and repeats.
- Random Colors — cells reassigned colour at random on a timer.
- Chase / Theatre Chase — a short run of lit cells travels, classic marquee.
- Running Lights — sine-brightness wave travels along.
- Scan / Dual Scan — one (or two) bright dots sweep back and forth.
- Fireworks — random bursts that expand and fade.
- Fire / Fire 2012 — procedural flicker, heat rises and cools.
- Plasma — smooth procedural blobs of colour drifting.
- Sparkle / Glitter — brief random single-pixel flashes over a base.
- Twinkle / Twinklefox — random pixels fade in and out independently.
- Noise / Perlin Noise — organic, non-repeating brightness/colour field.
- Colorloop / Rainbow Cycle — hue rotates through the full ring over time.
- Pride — slow shifting rainbow with brightness waves.
- Meteor / Meteor Smooth — a bright head with a fading trail travels through.
- Ripple — rings expand outward from a point and fade.
- Colortwinkles — twinkle but each pixel keeps a persistent random colour.
- Palette — cycles a fixed set of colours across the grid.

**FastLED DemoReel100** (canonical example sketch):
- rainbow — hue cycles uniformly across all pixels.
- rainbowWithGlitter — rainbow plus random single-pixel white flashes.
- confetti — random pixels light in random hues, fade out.
- sinelon — a dot moves back and forth following a sine position, trailing fade.
- juggle — several sinusoidal dots of different colours cross each other.
- bpm — brightness pulses to a set beats-per-minute, coloured by palette.

**Pixelblaze pattern library** (patterns.electromage.com; 200+ community patterns, 1D/2D/3D):
- comet — bright head, exponentially fading tail, wraps or bounces.
- pulse / pulse2d — radiating brightness pulse from a point.
- fire2d — 2D flame simulation.
- plasma2d — animated Perlin-noise colour field.
- matrix rain — vertical falling streaks, Matrix-code style.
- spiral — hue or brightness rotates outward from a centre in a spiral arm.
- kaleidoscope — pattern mirrored/repeated across quadrants.
- life — Conway's Game of Life run as a light pattern.

## 2. Tenori-on and Electroplankton

**Tenori-on's sixteen layers**, grouped into six behaviour modes (Yamaha manual):
- Score (layers 1–7) — a fixed grid of lit cells plays left-to-right like a piano roll; each lit cell is a note, column position is time.
- Random (layers 8–11) — the same lit pattern reorders itself over time; melody and rhythm keep shifting.
- Draw (layers 12–13) — cells light as a finger traces across the grid, drawing a path that also plays as melody.
- Bounce (layer 14) — touching a cell releases a "ball" that falls (or bounces) down the grid, triggering a note on impact.
- Push (layer 15) — held cells sustain a note as a lit pad, for drones/pads.
- Solo (layer 16) — a single lit cell repeats and its pitch/speed can be tuned live.

**Electroplankton's ten plankton** (Wikipedia; StrategyWiki):
- Tracy — a plankton follows a drawn stylus line, playing notes as it swims the path.
- Hanenbow — plankton launch and bounce off leaves the player angles, each leaf hit makes a sound.
- Luminaria — four coloured plankton loop a fixed track; touching arrows changes direction; each colour is a fixed timbre.
- Sun-Animalcule — plankton spin off a rotating parent body in expanding orbits, each spawn a note.
- Rec-Rec — four plankton loop across the screen; touching one records/plays a 4-second loop.
- Nanocarp — plankton react to claps and voice, changing shape and answering with sound.
- Lumiloop — a chain of plankton loops and can be split, each segment looping its own recorded phrase.
- Marine-Snow — plankton drift downward like falling snow, chiming as they pass touch points.
- Beatnes — grid of plankton retriggers in a fixed rhythmic pattern, sequencer-like.
- Volvoice — touching a plankton records/distorts up to 16 seconds of voice, visualised as it warps.

## 3. Kids' editors and party-light apps

**Kids' video editors** (CapCut-style transition/effect presets):
- confetti — small shapes fall and tumble across frame.
- sparkle — brief star-shaped glints scattered over an area.
- glitter — a wash of shimmering fine points, denser than sparkle.
- star wipe — a star shape grows to wipe from one scene to the next.
- heart burst — small hearts pop outward from a point and fade.
- rainbow trail — a rainbow streak follows a moving object.
- flash transition — one full-frame white flash cuts between scenes.
- pop — an element scales up fast then snaps to rest, with a flash.

**RGB party-light apps** (Party Light, Moodlight-style, and generic strip apps):
- strobe — hard on/off flicker, often synced to a tap or beat.
- pulse — smooth brightness breathing, usually slower and gentler than strobe.
- fade (smooth/medium/fast/snap) — named speeds for colour-to-colour transition.
- chase (single/double line) — one or two lit points run along in sequence.
- wipe / shuttle — a colour front moves across and back.
- police strobe — two colours alternate hard, side to side.
- jump — instant colour swap across the whole strip, no transition.
- disco/rave — fast random colour and brightness changes together.

## 4. Proposed gesture set

30–40 gestures for the fixed grid. Format: `name` — spec (cells, order, brightness curve) — register — source — byte estimate. Discs are flat and lit only by brightness/colour level; "curve" always means a brightness envelope over time, never a shading gradient across a disc.

Hero-ten (marked ★) are the ones to build first for a hero-dot's-journey opera: enough to carry entrance, travel, jeopardy, rescue and resolution without repeating a beat.

| name | spec | register | source | bytes |
|---|---|---|---|---|
| ★`bounce` | one dot drops row by row, brightness snaps full on arrival, decays after each impact, settles at bottom row | sweet, comic | Tenori-on Bounce | 90–140 |
| ★`flash` | one or all cells snap to full brightness for one frame, then cut to black | tense, comic | WLED Blink / party strobe | 60–90 |
| ★`chase` | a short run of N lit cells travels along a fixed path (row, ring, or edge), one step per beat | triumphant | WLED Chase / FastLED sinelon | 100–160 |
| ★`explode` | one cell at full brightness, then a ring of cells at increasing radius light in sequence and decay, outward only | triumphant, tense | Fireworks / heart burst | 140–200 |
| `fill-top` | rows light top to bottom, each row snapping to full then staying lit | triumphant | WLED Wipe | 80–120 |
| `fill-centre` | cells nearest the grid centre light first, spreading outward in rings until full | sweet | Ripple / Sun-Animalcule | 100–150 |
| `fill-edge` | one edge (e.g. left column) lights first, sweeping across to the opposite edge | tense | WLED Wipe | 80–120 |
| ★`decay` | all lit cells fade brightness together on an exponential curve to black, no relight | sad | Meteor tail / FastLED comet | 60–90 |
| `rainbow-centre` | hue rotates outward from the centre cell in rings, each ring one step further round the wheel | sweet | Sun-Animalcule / WLED Colorloop | 150–220 |
| `rainbow-cycle` | every cell's hue rotates together through the full wheel over a fixed duration | sweet | WLED Colorloop / Pride | 120–180 |
| ★`burn` | a lit region cools from full brightness through amber to black, cell by cell, unevenly (jitter per cell) | sad | Fire2012 | 150–220 |
| `tunnel` | a ring of lit cells contracts toward the centre over time, brightening as it shrinks | tense | Pixelblaze spiral/kaleidoscope | 120–170 |
| `stripe` | alternating rows or columns lit at fixed brightness, static or slow-scrolling | comic | WLED Theatre Chase | 70–110 |
| `spiral` | lit cell rotates outward from centre along a spiral path, one step per beat | sweet | Pixelblaze spiral | 130–190 |
| ★`sparkle` | random single cells flash to full brightness for one frame over a dim or dark base | sweet, comic | WLED Sparkle / kids' sparkle | 70–110 |
| `twinkle` | a fixed set of cells fades in and out independently and asynchronously, slow cycle each | sweet, sad | WLED Twinklefox | 90–140 |
| ★`comet` | a bright head cell moves along a path with a short fading trail behind it | triumphant, sad | FastLED comet/sinelon | 100–150 |
| `ripple` | rings of brightness expand from a point and fade as they widen | sweet, sad | WLED Ripple | 100–150 |
| `breathe` | one dot or the whole grid rises and falls in brightness on a slow smooth curve | sweet, sad | WLED Breathe | 60–100 |
| `scan` | a single bright cell sweeps back and forth along a row or ring, ping-pong | tense, comic | WLED Scan | 80–120 |
| `wave` | brightness travels as a sine ripple across rows, like a Mexican wave | sweet | FastLED sinelon (2D) | 110–160 |
| ★`heart` | a fixed heart-shaped mask of cells lights together, brightness pulses like a heartbeat | sweet | Kawaii cue / kids' heart burst | 90–140 |
| ★`map` | an arbitrary named shape mask (star, arrow, letter) lights as one static or pulsing frame | comic, triumphant | kids' star wipe / WLED Image | 100–160 |
| `push` | a held cell (or group) stays lit at sustained brightness until released | sweet | Tenori-on Push | 60–90 |
| `solo` | one cell repeats a flash at a settable tempo, alone on the grid | tense, comic | Tenori-on Solo | 70–100 |
| `draw` | cells light in the order a path is specified, one at a time, staying lit (a trail is built, not wiped) | sweet | Tenori-on Draw | 90–130 |
| `random-relight` | a fixed count of lit cells reassigns to new random positions on each beat | tense | Tenori-on Random | 100–140 |
| `confetti` | random cells light in random hues briefly, independent of each other, no path | sweet, comic | FastLED confetti / kids' confetti | 90–130 |
| `jump-cut` | the whole grid's colour or lit set changes instantly, no transition frame | comic, tense | party-light Jump | 50–80 |
| `police` | two colours alternate hard across two halves of the grid | tense, comic | party-light police strobe | 80–120 |
| `snow` | lit cells drift downward one row per beat, fading as they reach the bottom | sad, sweet | Marine-Snow | 110–160 |
| `orbit` | cells light in a ring around a moving centre point, spinning as the centre travels | triumphant | Sun-Animalcule | 130–190 |
| `glitter` | a dense, continuous scatter of brief single-cell flashes over a lit base (denser than sparkle) | sweet, comic | rainbowWithGlitter / kids' glitter | 90–130 |
| `pop` | one cell snaps from off to overbright then settles to normal, single beat | comic | kids' pop transition | 60–90 |
| `chase-double` | two chase runs travel the same path in opposite directions, crossing | tense, comic | party-light double chase | 120–170 |
| `noise-field` | brightness across the grid follows a slow non-repeating drift (precomputed table, not true Perlin) | sad, sweet | WLED Noise / Pixelblaze plasma | 150–220 |
| `solo-fade` | one cell holds at full brightness then fades alone to black, no relight | sad | Solo + Decay hybrid | 60–90 |

38 gestures listed (30–40 target met). Byte estimates assume the existing engine's shared tween/grid primitives carry the cost, and each gesture is a short parametrised call, not new engine code.

**Notes for the hero's-journey pilot (Carmen):** the ten starred gestures cover entrance (`sparkle`, `comet`), travel (`chase`, `bounce`), jeopardy (`flash`, `explode`, `burn`), tenderness (`heart`, `breathe`… `breathe` unstarred but cheap to add), and resolution (`decay`, `map` for a final shape). `fill-*`, `rainbow-*`, `ripple`, `tunnel`, `spiral`, `twinkle`, `wave`, `scan`, `stripe`, `push`, `solo`, `draw`, `random-relight`, `confetti`, `jump-cut`, `police`, `snow`, `orbit`, `glitter`, `pop`, `chase-double`, `noise-field`, `solo-fade` extend the vocabulary for the other seven operas without repeating a hero-opera beat.
