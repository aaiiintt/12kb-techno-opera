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
- **Captions**: small white-on-black tags beside a dot, in the opera's language, in a knowing register (QUI EST-ELLE ?, ELLE EST À MOI, UN COUTEAU !). Names on first entrance. Each act's name is a caption beside its hero. Sparse. The picture must tell the story to someone who doesn't read the language.
- **Sound**: four voices (soprano, tenor, bass, arp), noise drums, one reverb room. The famous tune is quoted, sung by the character it belongs to. Silence is the cheapest drama.
- **Light is the voice**: a dot lights with the note that sings it. Everything visible has a sound and everything sung has a light.

## How to think

- **Like a demake designer.** Keep the one thing everyone remembers (the tune, the flower, the statue), and cut anything that can't be read at 9×9. If a plot point needs a paragraph, it isn't in.
- **Like a pixel artist.** A character is a colour and a position. A change of heart is a palette swap. Readable at a glance or not at all.
- **Like a comic adapter.** One image per beat. The panel is a moment; the gutter does the work between them. Every act has a money panel: describe it.
- **Like a silent-film director.** Emotion is gesture, light and music; a title card only where the picture can't say it. Chaplin's rule: tragedy in close-up, comedy in long shot.
- **Like a lighting designer.** Colour is character, brightness is voice, the cue sheet is the score.
- **Feeling first.** Before any picture, say what the audience should feel. Then the picture that makes them feel it. Every choice serves that feeling.
- **The ending earns the most time.** Leave the audience where an opera audience is at the curtain: a lament or apotheosis, the last chords, blackout, silence. Then it loops.
- **One wink.** Sweet underneath, austere on top, and once per opera a deadpan word from a character at exactly the wrong moment (José's MERDE ! a beat after the stab). The tragedy still lands. One, not one per act.

## The proven moves (use by name; invent one if the story needs it)

a crowd · crowd blocks either side of rivals, flashing as they cheer · the crowd turns to look · a walk (a cell per beat, close following) · an entrance with grandeur (hush, drum roll, walk in through the crowd, close, fanfare, name) · a throw (a spark arcs and lands as an object) · rings from a character (their voice spreading, a ring per note) · ink (a feeling leaving a character in their colour, cell group by cell group, until it surrounds someone) · a palette swap (a character changes colour) · a hit (named in the silence before; the victim flashes white and their colour; a shake) · a curtain (colour falls row by row and wipes everyone but the survivor) · rising and falling (one dot rising off the top; petals drifting down) · a lament (the opera's own theme, slow and low over a held bass, a dark long room) · the last chords (the whole grid lit, fortissimo, ringing out) · silence.

## What to return

Two parts, nothing else.

**Part 1, the pitch, in under 120 words:** the story in a line; the feeling of the whole; the tune and who sings it; the colours and where they come from; the wink.

**Part 2, the brief as JSON**, exactly this shape. 6 to 10 acts. Act names in the opera's language. Degrees in the notation shown (`1` to `7` in the key's own scale, `#`/`b` to alter, `+`/`-` an octave up or down); beats as fractions of a beat at the tempo. Mark every tune `"fromMemory": true`; a human checks it by ear.

```json
{
  "id": "carmen",
  "title": "CARMEN",
  "lang": "fr",
  "key": { "root": 2, "mode": "minor" },
  "tempo": 72,
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
      "captions": ["QUI EST-ELLE ?", "OH LÀ LÀ !", "CARMEN !"],
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

For every act give three genuinely different `versions` (one from the proven moves, one that bends a move, one new idea) and put your recommendation in `chosen`. `wink` is filled in for one act only. Return valid JSON.
