# The Dot Opera prompt

One shot. Replace `{{OPERA}}` and run it in any capable LLM. It returns a brief that drops straight into `docs/treatments/<id>.json` and the five-step workflow (`.claude/skills/dot-opera/SKILL.md`). Nothing else is needed to start an opera.

---

You are writing the brief for a **Dot Opera**: **{{OPERA}}**, retold in about a minute on a grid of glowing dots, sung by synthesised voices, quoting its most famous tune. Think of it as a demake: the whole opera rebuilt at 8-bit resolution, keeping only what survives.

## The stage you're writing for

- A grid of flat discs of light on black, running edge to edge. The story plays on the central 9×9 stage (columns 0 to 8 left to right, rows 0 to 8 top to bottom, centre 4,4); the outer cells are the world beyond it.
- **A character is one dot**, in one colour, that glows when they sing. Dots never grow, wear halos or become shapes. A thing a character holds is one dot beside them. At most three named characters; everyone else is the crowd.
- **Colours come from how the opera is traditionally staged** (costumes, sets, lighting audiences know): Carmen's red dress, the dragoon's blue, the toreador's suit of lights, Seville's sand. Name the source of each. On top, **up to three story colours**, each meaning exactly one thing (green was jealousy; white was the knife).
- **The crowd is the set.** Dim resting lights that stand still, murmur, flash when they cheer, turn to look, cheer offstage. A place is its people and one colour.
- **Three shots**: wide (the whole grid), mid (about five cells: two people and the space between), close (two or three cells: one feeling; the camera follows the dot). Cut on the beat.
- **Captions**: small white-on-black tags beside a dot, in a knowing register, written as a pair `["ENGLISH", "ORIGINAL"]` (the page shows English by default and has a toggle to the opera's language). **Lead with an emoji pictogram where one says it faster than words**: ✂️ FIGARO !, 💌 FOR LINDORO !, 🤫 LEAVE IT TO ME !, 💤 ZZZ, 🛑 STOP !, 🪜 THE LADDER !, ❤️. The emoji is the silent-film gesture; the words are the title card. Names on first entrance. Each act's name is a caption beside its hero. Sparse: the picture must still tell the story with the captions covered.
- **Sound**: four voices (soprano, tenor, bass, arp), noise drums, one reverb room. The famous tune is quoted, sung by the character it belongs to. Silence is the cheapest drama.
- **Light is the voice**: a dot lights with the note that sings it. Everything visible has a sound and everything sung has a light.

## What it must feel like

An EDM show in a few kilobytes. The grid is an LED wall at an arena, and the opera is the set: builds, drops, breakdowns, blackouts, the whole wall breathing on the bass, one colour slamming across everything on a downbeat, a strobe under three flashes a second, a wave rolling from one edge to the other, rings pulsing out from a singer on every note. Every disc is a pixel and a bulb; use all of them. The failure mode is timidity: two dots in a sea of grey and a caption doing the work. Push the system to the limit, then hold still so the next hit lands.

Story gives it meaning; spectacle gives it feeling. They're the same thing when the big move *is* the plot beat: the storm is the chase, the curtain of red is the death, the grid going white is the dawn, the rings are her voice reaching everyone.

## How to think

- **Like a lighting designer at a show.** Every act has one full-grid move locked to the music: a pulse on the drop, a wash on the chord, a sweep on the run, a strobe on the hit, a blackout on the silence. Name it, name the sound it's locked to, and say which act is the drop of the whole set.
- **Like an EDM producer.** Shape the hour into a set: intro, build, drop, breakdown, build, bigger drop, outro. Quiet is what makes loud enormous. Silence is the cheapest drama.
- **Feeling first.** Before any picture, say what the audience should feel. Then the one picture that makes them feel it. Every choice serves the feeling.
- **Like a demake designer.** Keep the one thing everyone remembers (the tune, the flower, the statue), cut anything that can't be read at 9×9.
- **Like a pixel artist.** A character is a colour and a position. A change of heart is a palette swap. Readable at a glance or not at all.
- **Like a comic adapter.** One image per beat; the gutter does the work between panels. Every act has a money panel: describe it.
- **Like a silent-film director.** Emotion is gesture, light and music; a title card only where the picture can't say it, and a pictogram before a sentence. Chaplin's rule: tragedy in close-up, comedy in long shot.
- **The ending earns the most time.** Leave the audience where an opera audience is at the curtain: a lament or an apotheosis, the last chords lighting the whole grid, blackout, silence. Then it loops.
- **One wink.** Sweet underneath, austere on top, and once per opera a deadpan word from a character at exactly the wrong moment (José's MERDE ! a beat after the stab). The tragedy still lands. One, not one per act.

## The grid as an instrument (big moves; use by name, invent more)

pulse (the whole grid, or rings from a singer, on every note) · wash (one colour slams across everything on a downbeat and fades) · sweep (a line of light crosses the grid on a run) · wave (a ripple from one edge to the other) · breathe (every other cell on the bass) · strobe (under three flashes a second, on snares) · storm (chromatic rain runs, thunder, lightning on the whole grid) · curtain (colour falls row by row and wipes everyone but one) · fire (rising from the bottom) · dawn (black to white, one cell at a time) · blackout · the last chords (everything lit, fortissimo, ringing out) · ink (a feeling leaving a character in their colour until it surrounds someone)

## The character and crowd moves (proven)

a crowd (dim, still, murmuring) · crowd blocks either side of rivals, flashing as they cheer · the crowd turns to look · a walk (a cell per beat, close following) · an entrance with grandeur (hush, drum roll, walk in through the crowd, close, fanfare, name) · a throw (a spark arcs and lands as an object) · a palette swap · a hit (named in the silence before; the victim flashes white and their colour; a shake) · rising and falling (one dot off the top; petals drifting down) · a lament (the opera's own theme, slow and low over a held bass, a dark long room) · silence

## What to return

Two parts, nothing else.

**Part 1, the pitch, in under 120 words:** the story in a line; the feeling of the whole; the tune and who sings it; the colours and where they come from; the wink.

**Part 2, the brief as JSON**, exactly this shape. 6 to 10 acts. Act names in the opera's language. Degrees in the notation shown (`1` to `7` in the key's own scale, `#`/`b` to alter, `+`/`-` an octave up or down); beats as fractions of a beat at the tempo. Mark every tune `"fromMemory": true`; a human checks it by ear. Every caption is a `[english, original]` pair; put the same emoji at the front of both.

```json
{
  "id": "carmen",
  "title": "CARMEN",
  "lang": "fr",
  "key": { "root": 2, "mode": "minor" },
  "tempo": 72,
  "arc": "Intro (Seville), build (L'amour rings), breakdown (the flower), drop (Toréador: two crowd blocks and a fanfare), dark (jealousy ink), the hit and the red curtain, outro (lament, last chords, blackout).",
  "tune": { "name": "Habanera", "degrees": ["1+","7#","7","6#","6","5"], "beats": [0.75,0.25,0.5,0.5,0.75,1.25], "fromMemory": true },
  "motifs": [ { "name": "Fate", "degrees": ["5","6","7#","1+"], "beats": [1.5,1.5,1.5,2.5], "fromMemory": true } ],
  "colours": [
    { "name": "red", "css": "#d4152f", "means": "Carmen", "kind": "staging", "source": "her dress, the flower" },
    { "name": "green", "css": "#62c43a", "means": "jealousy", "kind": "story" }
  ],
  "characters": [ { "name": "Carmen", "colour": "red", "cell": [4,4], "voice": "soprano", "enters": "SEVILLE" } ],
  "acts": [
    {
      "name": "SEVILLE",
      "happens": "Carmen crosses the crowded square to its centre.",
      "feeling": "She draws every eye.",
      "set": "Half the grid is dim sand people, standing still and murmuring.",
      "characters": "Carmen alone, red, starting at the crowd's edge.",
      "actions": "She walks a cell per beat; the people beside her brighten and swell as she passes. Wide, mid as she starts, close following her, wide as she stops.",
      "music": "Habanera bass; a murmur of tiny notes; a soprano note per step.",
      "emotion": "Only she moves, so she's all the eye can follow; the crowd turning to look says she's magnetic.",
      "spectacle": "When she stops dead, the whole square glows towards her ring by ring on one held chord, then everything goes still.",
      "captions": [["WHO IS SHE ?", "QUI EST-ELLE ?"], ["OH LÀ LÀ !", "OH LÀ LÀ !"], ["👀 CARMEN !", "👀 CARMEN !"]],
      "wink": "",
      "versions": [
        { "label": "the crowd turns to look", "idea": "..." },
        { "label": "...", "idea": "..." },
        { "label": "...", "idea": "..." }
      ],
      "chosen": "the crowd turns to look"
    }
  ]
}
```

`spectacle` is the act's one full-grid move and the sound it's locked to; `arc` is the whole set in one line, naming the drop. For every act give three genuinely different `versions` (one from the proven moves, one that bends a move, one new idea) and put your recommendation in `chosen`. `wink` is filled in for one act only. Return valid JSON.
