# Staging the Techno Opera

The visual half of the brief. `music-guide.md` says how the sound is made; this says how the stage is used. Read both before touching a story card, a gesture or an opera file. The rules at the end are hard rules.

## The problem this solves

The first eight drafts were samey. One dot per character, a scene at a time, small moves, and the grid mostly sat there as scenery. Nothing wiped the screen, nothing bloomed to fill it, nothing shook. They read as diagrams of operas. The music was already an emotional roller coaster; the stage was a seating plan.

Opera on stage is not literal either. It is a chorus of eighty people moving as one body, a lighting state that turns the whole set red in a bar, a soprano alone in a spotlight the size of a coin, a curtain. We have the same tools: a mass of dots, a background, a camera, colour, scale, and type. Use them the way a lighting designer and a choreographer would, not the way an animator of stick figures would.

## The series, and the curator

We are not one director staging eight operas the same way. We are curators of a series. The dots are the same, the four voices are the same, the room is the same. What changes between pieces is the way of telling. Some use the dots as characters. Some are pure feeling: waves, tides, weather, with no one singled out. Some are light shows, abstract but fitting, the grid as an instrument the music plays. Some combine modes. Eight pieces, eight ways of using one canvas.

The reference feel is Tenori-on and Electroplankton: a grid of light where the music and the picture are one system, every note visible, every visible thing audible. It should feel like a premium game running at 60 frames a second on the best screen you own, and come in under 48 KB for the whole series.

The dots are discs of light. Not circles: lamps. They have a lit core and a soft edge, they glow, they can flare, and they shimmer. Shimmer is the house texture: light on water, a slow independent twinkle across the field. When in doubt, add shimmer.

## Series map

A first curatorial pass. Each piece gets a mode so the eight are different on purpose.

| Piece | Mode | The way of telling |
| --- | --- | --- |
| Carmen | Forces and one dot | A red tide and a crowd; José is a dot only when taken and when alone |
| Pagliacci | Mask | A grid that is a face: a smile of lit dots that cracks. Characters as expressions of one surface |
| Rigoletto | Characters | The one piece that keeps named dots on stage throughout: a jester, a duke, a daughter; the sack is a reveal |
| Dido and Aeneas | Pure feeling | No characters. A ground bass as a tide that never stops descending; grief as weather; shimmer draining to black |
| The Magic Flute | Light show | Night and day as two lighting systems fighting; the Queen's aria is fireworks, Sarastro's is dawn; abstract |
| Don Giovanni | Wall | A grey mass advancing a row per bar against a red field; geometry as dread; the handshake is a bloom to grey |
| The Barber of Seville | Instrument | The grid as a Tenori-on: the patter runs across it as a sequencer, every note a lit cell; comedy as rhythm |
| Turandot | Dawn | Light show from black to white; a single lamp brightening until the whole field is lit at VINCERÒ |

The drafting brief for each piece names its mode, and the piece must be recognisably in that mode. Two pieces in the same mode is a curation failure.

## Principles

**Dots are forces, not people.** A character is a colour and a behaviour of the mass before it is a dot. Carmen is a red tide that takes the grid row by row. The Commendatore is a grey wall advancing a row per bar. The Queen of the Night is a burst that fractures the whole grid upward. A single named dot is singled out only when the story goes intimate: a touch, a death, an aria. It emerges from the mass and returns to it.

**Colour is the set.** The background and the whole grid change together. Every section of every opera has a lighting state: a background colour, a grid colour, a dot size, a density. Moving between states is a wipe, a flood, a blackout or a bloom, never a fade nobody notices. A section with the same colours as the last one is a missed cue.

**Every chord is an event.** The purple section is the model: a chord sounds, the room opens, and the whole grid pulses in rings. Bind stage events to the music's events. A chord change with nothing happening on stage is a bug. A `sing` line with the singer not visibly singing is a bug.

**Scale is emotion.** Big is power, love, terror, ecstasy. Small is fear, loss, death. A dot that grows until it fills the screen, as in the reference frame where the red disc rises behind HELLO, is the biggest feeling we have. Use it once per opera, at the moment that deserves it. A grid that shrinks to a single pixel and goes out is a death.

**Nothing stands still.** Between the set pieces the stage breathes. The energy curve (below) keeps the grid alive without a hand-placed gesture for every bar. But breathing is a floor, not a ceiling: each section needs at least one deliberate move of the mass.

**Type is a set piece.** Cues are not captions in the lower third. They can be the whole screen. A single word at 40 percent of the viewport height, as in the reference frames, is a chord in itself. Labels bracket the action, speech boxes sit on a dot, and both can be as big as the moment.

**Passion and violence are allowed.** These are operas about murder, jealousy, lust, defiance and grief. A stab is a strobe and a hard cut to red. A chase is the whole grid streaming. A death is a collapse. Timid staging of Carmen is wrong staging of Carmen.

## The stage

The stage is no longer fixed. Each opera declares a stage, and each section can change it.

| Property | Range | What it means |
| --- | --- | --- |
| `bg` | any colour | The background. Black is the default and the resting state. A coloured background is a lighting state and reads as full-screen colour. |
| `grid` | 5 to 13 | Dots per side. 5 is monumental, 13 is a crowd. Changing density mid-opera is a set change. |
| `dot` | 0.2 to 4 | Base dot scale relative to the cell. Below 0.5 the grid reads as pixels or stars; above 1.5 the dots touch and the grid reads as a surface or a wall. |
| `gap` | 0 to 2 | Spacing relative to the dot. Zero is a solid field. |

The stage is set at the top of the opera and changed by the `stage` gesture. A stage change is instantaneous by default so it lands as a cut. Give it a `dur` to make it a morph.

## The energy curve

Each section of the score carries an energy from 0 to 10. The engine derives from it, every frame, with no per-bar data:

- Grid brightness: 0 is near-black dots, 10 is full.
- Breathing: a slow scale oscillation on every dot, amplitude and rate rising with energy. At 0 the grid is still. At 10 it seethes.
- Camera drift: a slow, unforced pan and zoom that widens with energy.
- Beat pulse: at energy 6 and above, the whole grid ticks on the beat.

This is the guide's "derive, don't store" applied to the stage. It costs one number per section and keeps the stage alive between set pieces. Set pieces sit on top of it.

## The spectacle family

New gestures. Each is a move of the whole mass, the background or the camera. Each has a sound pairing, because a set piece with no sound is a slide.

| name | spec | params (default) | sound pairing |
| --- | --- | --- | --- |
| `stage` | set bg, grid, dot, gap; a cut or a morph | `bg`, `grid`, `dot`, `gap`, `dur(0)` | none; pair with a chord |
| `wipe` | a colour sweeps the grid from one edge to the other, dot by dot in rows or columns | `color`, `from('left')`, `dur(0.8)`, `bg(false)` also wipes the background | filtered noise swell in the wipe direction, panned |
| `flood` | a colour spreads from a point outward in rings | `color`, `center`, `dur(1)`, `bg(false)` | chord swell, room opens with the rings |
| `blackout` | everything to black, instant or over dur; dots and bg | `dur(0)`, `hold(0.5)` | silence, then room feedback drops |
| `strobe` | the grid and bg flash between two colours on a rate for a duration | `a('#fff')`, `b('#000')`, `rate(12)`, `dur(0.5)` | noise hats on each flash |
| `tide` | rows roll across the grid like a wave, repeating | `dir('down')`, `period(1.2)`, `repeat(3)`, `color` | slow arp rising and falling with the rows |
| `swarm` | every dot streams toward a cell or an actor, then hangs there | `target`, `dur(1.5)`, `spread(0.5)` | crescendo, room closing |
| `shatter` | every dot flies outward from a point and off the grid | `center`, `dur(0.6)` | one hard chord, then silence |
| `collapse` | the grid falls off the bottom, row by row, or all at once | `dur(1.5)`, `stagger(0.06)` | bass drops an octave, room cutoff falls |
| `bloom` | one dot grows until it covers the screen, holding its colour; the bg becomes that colour | `actor`, `dur(2)`, `hold(1)` | held soprano note or chord, crescendo; the grand gesture |
| `quake` | camera shake plus every dot jitters | `amount(8)`, `dur(0.6)` | ring-mod growl on the bass |
| `zoomCrash` | camera slams into a cell then holds | `target`, `zoom(3)`, `dur(0.25)` | one accent |
| `titleCard` | a cue at full-screen scale, centred, held | `text`, `size(40)` (percent of viewport height), `hold(1.5)`, `color` | none; pair with silence or a chord |
| `energy` | set the energy curve for what follows | `level(5)`, `dur(1)` to ramp | none |
| `shimmer` | every dot twinkles independently, a slow sine of brightness and scale with a random phase per dot and a small hue drift; light on water | `amount(0.3)`, `rate(2)`, `hue(10)`, `dur(4)` | quiet high arp at 14 Hz |

`bloom` and `titleCard` are the two reference frames: the red disc behind HELLO, the huge NO YOU CAN'T. `flood` and `wipe` are the purple section generalised to any colour and any origin. The rest are what passion and violence need.

## How a visual score is written

A story card now has a visual score, not a cast list. For each section:

1. **Lighting state.** Background, grid colour, density, dot size. Named in words first ("black, a field of grey pixels", "the whole screen goes blood red"), then as `stage` values.
2. **Energy.** A number, 0 to 10.
3. **The mass.** What the whole grid does. One deliberate move at least, from the spectacle family or the crowd family.
4. **The singled-out dot**, if any. Who, why, and what the intimate move is.
5. **Type.** Which cue, at what scale, where.
6. **The bind.** Which musical event each stage event is tied to: a chord, a `sing`, a silence, the room opening.

The eight cards also carry an arc line: the colour journey of the whole piece in one sentence ("black to red to white to black"), and the one bloom.

## Rules to write on the wall

- Every section changes the lighting state. Same colours as before is a missed cue.
- Every chord is an event on stage. Every `sing` is visible.
- The mass moves at least once per section. Named dots appear only for intimate beats.
- One bloom per opera, at the moment that deserves it.
- Cues can be the whole screen. Use the size.
- Energy is set per section and never left at the default.
- If the stage could be a diagram of the plot, it is wrong.
- The dots are lamps. If they look like flat circles, the look is wrong.
- Each piece is in its own mode from the series map. Same mode twice is a curation failure.

## Performance: 60 frames a second

Premium means smooth. Every animated property is `transform`, `opacity` or a custom property consumed by a transform or a filter. Never animate `top`, `left`, `width`, `height` or `box-shadow` per frame. The glow is a pseudo-element whose opacity animates, not a shadow that changes. The energy loop touches custom properties, not layout. If a gesture drops frames on a laptop, it is wrong.

## Budget: 48 KB for the series

Site total, gzipped: engine, shell, index and all eight operas, under 49,152 bytes. Currently around 19 KB, so the ceiling is generous; spend it on shimmer, not on a framework.

## Things that look expensive and aren't

- A full-screen colour: one background property.
- The whole grid streaming to a point: one loop over the dots with a stagger.
- A strobe: a class toggled on an interval.
- A word the size of the screen: font-size.
- The grid breathing for a minute: one number and a sine.

## Things that look cheap and aren't

- A separate animation per named character across the whole piece. Use the mass.
- Twelve small moves in a section. One big one beats them.
- Hand-placed brightness per bar. Use the energy curve.
