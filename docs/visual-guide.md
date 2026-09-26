# Lighting the Techno Opera

The visual half of the brief, third version. `music-guide.md` says how the sound is made; this says how the light is made. The v2 guide is kept as `visual-guide-v2-rejected.md` as a record of what not to do: shaded spheres, drifting 3D grids, invented colours, effects stacked like slide transitions.

Read this and the music guide before touching a story card, a gesture or an opera file. The rules at the end are hard rules.

## The law in one paragraph

A fixed grid of flat discs on black. Each disc is a bulb behind a perfect diffuser: it has a colour from a palette of eight and a brightness, and nothing else. **A disc is lit because something is sounding.** Its brightness is that sound's envelope. The story is a hero disc's journey through acts, told with choreography and a small vocabulary of LED-display moves. One mass move and one soloist at a time. The presentation is austere; underneath it is sweet, like a rescue-the-princess game. The original 12KB opera is the reference for restraint, energy and refinement.

## The disc

- **Flat.** A solid circle. No gradient, no highlight, no core, no 3D.
- **OKLCH.** A light is `oklch(L C H)`. Brightness is `L` alone, so a step in L looks like the same step in every hue.
- **Dimming is warm and grey.** Chroma falls as L falls: `C = Cmax × (L − 0.22) / (Lmax − 0.22)`. A bulb greys before it goes out.
- **Off is not black.** An unlit disc is dusk: `L 0.22`, `C ≈ 0.02`, the hue of the scene's ground. The grid is always faintly visible, as in the original.
- **Glow is quiet.** A tight halo, the disc's own hue at 70 percent chroma, blurred about a tenth of the disc's width, opacity `L × 0.32`. A second wide halo exists only on large discs, faint. Nothing pulses on its own.
- **Bigger is closer.** Scale is depth. The tight halo scales with the disc; the wide halo appears as the disc grows past about twice the cell size.

## The palette

Eight lights. Story cards and scores name a light, never a value. The hues are fixed; `Lmax` is where each reads as itself.

| Light | H | Cmax | Lmax | Meaning in the house |
| --- | --- | --- | --- | --- |
| bulb | 85 | 0.03 | 0.94 | warm white, the resting light |
| gold | 80 | 0.16 | 0.80 | the hero |
| sakura | 350 | 0.14 | 0.80 | the beloved |
| coral | 30 | 0.18 | 0.74 | passion, danger |
| lemon | 105 | 0.17 | 0.92 | joy, alarm |
| mint | 160 | 0.13 | 0.84 | innocence, the world |
| sky | 245 | 0.15 | 0.74 | calm, night, distance |
| violet | 295 | 0.17 | 0.72 | peace, memory, the sacred |

A rainbow is these seven hues in wheel order: coral, gold, lemon, mint, sky, violet, sakura.

At most two lights plus bulb on stage in any one section. A rainbow is the one exception, and it is an event, not a state.

## Light is the voice

This is the rule that makes the series one system, as in Tenori-on and Electroplankton: every visible thing is audible and every audible thing is visible.

- **Every light change is scheduled by the call that schedules its sound.** A disc does not light on its own. When a voice plays a note, the disc bound to that voice takes the note's envelope as its L: attack, decay, sustain and release from the same instrument object that shapes the gain.
- **Named actors carry their voice.** The hero's disc is lit by the hero's voice. When the hero sings, the disc rises on each attack, holds through the vibrato, falls through the release. For long held notes the disc's L may follow the voice's real output through an analyser, so vibrato and tremolo are visible.
- **The field is the arp and the chorus.** A chord arpeggio lights the cells it plays, one per note, in the order and at the rate the arp runs. Percussion lights cells too: a kick is a flash, a hat is a sparkle.
- **Silence is dark.** When nothing sounds, everything is dusk. A held note with a four-second tail is a disc fading over four seconds.
- **Brightness never exceeds the sound.** Loud is bright, quiet is dim. A crescendo is a disc brightening. There is no way to make a disc flash that does not also make a sound.

## The stage

- **Everything is on the grid.** There are no floating discs. A character is a grid cell lit in its colour; when it hops, its light moves to the next cell and the old cell cools like an ember. When it grows, shrinks or pulses, the cell it occupies scales in place.
- **The grid runs edge to edge.** The screen is filled with cells at the house pitch. The story is played on the central stage (9 by 9 by default, any odd size from 5 to 13, chosen once per opera); the cells beyond it rest in dusk and give the sense of expanse. They are used rarely and on purpose: a colour wipe across the whole screen, a ripple that carries past the stage, a rainbow that reaches the edges.
- **The grid is fixed.** Cells never drift, breathe, wobble or tilt, and the stage never changes size during a piece.
- **The camera cuts.** It holds still almost always. Rarely, and as a deliberate beat, it makes one energetic move: a hard zoom into a single disc until half of it fills the screen, a snap back, a shake on an impact. Never a drift, never a slow pan, never a perspective.
- **The background is black**, or one palette light at low L, cut on a beat. No fades of the background, no wipes of it.
- **Type is the original cue only.** Lower third, typed in letter by letter, held, cleared. Uppercase, one to three words, in the opera's language. No title cards, no labels, no speech boxes.

## Choreography

The original told its story as a hero disc's journey through acts: alone, out into the world, love, loss, a fight, a return, an ending. That is the model. Each opera finds its own acts from its source, but every one has a hero disc whose journey we follow.

- **One mass move and one soloist at a time.** The field can do one thing (a chase, a fill, a rainbow from the centre) while the hero does another (a hop, a flee, a bounce). Never two mass moves together.
- **Movement is hops.** A disc travels cell to cell with the original's elastic, snappy ease, leaving an ember behind. Travel is on the beat.
- **Scale is feeling.** The hero grows when brave or in love, shrinks when afraid, and a close-up is the camera's hard zoom, not a disc inflating to fill the screen.
- **Each act is one lighting state and one idea.** Hold it long enough to feel it. Change it on a cut.

## Kawaii underneath

The presentation is austere. The charm comes from:

- **Characters.** Small round discs with big feelings. A gold hero with a heartbeat. A sakura beloved. Something that can be taken, rescued, lost.
- **Sound.** A music-box arp, a soprano that scoops up a little more, a heartbeat kick, a bright little pluck when a disc lands.
- **Colour.** Milky, luminous lights; rainbows and sparkles as rewards, used sparingly.
- **Cues.** The register of a 1980s game: HELP!, AVANTI!, ADDIO. Knowing, quiet, one word where one will do.

## The vocabulary

A tasteful LED display, from `led-vocabulary.md`. Every gesture lights cells by scheduling sounds, so each has a sound pairing. This is the whole vocabulary; nothing outside it.

| Family | Gestures |
| --- | --- |
| Hero | hop, bounce, flee, pulse (heartbeat), grow, shrink, pop, fade |
| Travel | chase, comet, scan, draw, spiral, orbit |
| Fill | fillTop, fillCentre, fillEdge, stripe, map (an arbitrary shape) |
| Burst | flash, explode, ripple, sparkle, glitter, confetti |
| Colour | rainbowCentre, rainbowCycle, jumpCut |
| Ending | decay, burn, snow, soloFade |
| Camera | closeUp (hard zoom into one disc), snapBack, shake |
| Sound-only | sing, chord, arp, drum, silence, crescendo, ritardando, room |
| Text | cue |

## The taste gate

Before Iain sees a piece, the coordinator reviews six screenshots taken at its key beats against the four reference frames and the original. "No console errors" is not a pass. A piece fails if any frame shows a gradient, a drifting or tilted grid, a colour outside the palette, more than two lights plus bulb outside a rainbow, two mass moves at once, a disc lit with nothing sounding, or type other than the cue.

## Rules to write on the wall

- A disc is lit because something is sounding. Brightness is the envelope.
- Flat discs, eight lights, OKLCH. Name the light, never the value.
- Everything is on the grid. No floating discs.
- The grid runs edge to edge and never moves. The camera cuts.
- One mass move and one soloist at a time.
- Follow the hero.
- Austere on the surface, sweet underneath.
- If it looks like a slide transition, it is wrong.
