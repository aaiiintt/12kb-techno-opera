# Dot opera: the brief

Take a famous opera and turn it into about a minute of pure excitement: a grid of glowing discs and a few synthesised voices, playing its most famous tune, telling its story. The whole thing is a few kilobytes.

You know these operas better than we do. Use that.

## What it should feel like

A premium handheld game at its most beautiful: Tenori-on, Electroplankton. Every disc is a bulb behind a perfect diffuser, and every one of them earns its place. Colour, glow and rhythm do the work. The music and the light are one system: when something sounds, something lights.

Underneath, it's sweet. Small round lights with big feelings, a hero you root for, a quiet "HELP!" in the lower third. On the surface, it's austere: black, flat discs, one typeface.

Be ambitious with the grid. The failure mode is timidity: two dots in a sea of grey. Use rings of colour around a character, halos that bloom on a note, a whole row lighting as a chord lands, a rainbow when love wins, embers when it doesn't.

## The example

`src/index.src.html` is the original 12KB opera. Read it. It's the standard: seven acts, one gold hero, energetic, refined, and it uses the whole grid. Beat it.

## Hard limits

- Flat discs on black. No gradients, no 3D, no drifting grid.
- A handful of colours, taken from how the opera is traditionally staged: the costumes, sets and lighting audiences know. Carmen's red, a toreador's gold suit of lights, a soldier's blue. Rendered as light, not paint. Name where each one comes from.
- The opera's most recognisable tune, quoted, as the heart of the soundtrack.
- One lower-third cue per act at most, in the opera's language.
- It loops: the end is the beginning.
- Small. Report the gzipped size.

## How to work

1. **Treatment.** Write half a page: the acts, the hero, the tune (as notes), and the one visual idea per act that makes it unforgettable. Stop and show it.
2. **Build.** Write it.
3. **Look.** Open it with `?gate=` and the seconds that matter; it plays muted and freezes at each. Look at every frame as if you were Iain. Fix what's timid or ugly. Report the size and what you changed.
