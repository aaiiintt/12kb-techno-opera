# Dot opera: the brief

Take a famous opera and turn it into about a minute of pure excitement: a grid of glowing discs and a few synthesised voices, playing its most famous tune, telling its story. The whole thing is a few kilobytes.

You know these operas better than we do. Use that.

## What it should feel like

A premium handheld game at its most beautiful: Tenori-on, Electroplankton. Every disc is a bulb behind a perfect diffuser, and every one of them earns its place. Colour, glow and rhythm do the work. The music and the light are one system: when something sounds, something lights.

Underneath, it's sweet and funny. Small round lights with big feelings, a hero you root for, a quiet "HELP!" beside a dot. Full operatic feeling, then one deadpan caption at exactly the wrong moment: José's MERDE ! just after the knife. The tragedy still lands; the wink makes it ours. One or two per opera, not a joke per act. On the surface, it's austere: black, flat discs, one typeface.

An EDM show in a few kilobytes: the grid is an LED wall, and every act has one full-grid move locked to the music (a pulse, a wash, a sweep, a storm, a strobe, a blackout), with stillness around it so it lands. Be ambitious with the grid. The failure mode is timidity: two dots in a sea of grey. Use rings of colour spreading from a character, crowds that flash as they cheer, a whole row lighting as a chord lands, a rainbow when love wins, embers when it doesn't.

## The example

`src/index.src.html` is the original 12KB opera. Read it. It's the standard: seven acts, one gold hero, energetic, refined, and it uses the whole grid. Beat it.

## Hard limits

- Flat discs on black. No gradients, no 3D, no drifting grid.
- A handful of colours, taken from how the opera is traditionally staged: the costumes, sets and lighting audiences know. Carmen's red, a toreador's gold suit of lights, a soldier's blue. Rendered as light, not paint. Name where each one comes from. On top of those, up to three storytelling colours for feelings the picture can't otherwise show (Carmen's green for jealousy, white for the knife); each means one thing only.
- The opera's most recognisable tune, quoted, as the heart of the soundtrack.
- One caption style only: small white-on-black tags beside the dot they belong to, English by default with a toggle to the opera's language, led by an emoji pictogram where one says it faster than words (✂️ FIGARO !, 💌, 🛑). An act's name is one of these, beside its hero, never a separate lower third.
- It loops: the end is the beginning.
- Small. Report the gzipped size.

## How to work

Use the `dot-opera` skill (`.claude/skills/dot-opera/SKILL.md`): acts, then what happens and the feeling, then how the toolset recreates the set, characters, actions, music and emotion, then three versions per act and a pick, then refine frame by frame with Iain.
