# Gaz '89

*A series of twelve very small games about trying to get to your first M25 rave in Essex, 1989.*

(Iain's brief, 9 Oct 2026, kept verbatim. Do not edit without asking.)

The biggest change I'd make to the original idea is this: **don't make one game, make twelve microgames.**

Rather than trying to contain the whole story in one program, each chapter of the Hero's Journey becomes its own tiny game that loads the next one. Each one would star the same character, use the same sprite, be built in [LittleJS](https://github.com/KilledByAPixel/LittleJS) and aim to come under **128kb**.

The story is what connects them. The gameplay should be almost invisible.

Most people from Essex at that time didn't think they were going on an adventure. They were just trying to get out of the house.

## The Hero

**Gaz Tubbs.** 17, from Laindon, Essex.

He only needs to be a very small sprite. About 12 x 16 pixels. Levis 501s, white Reebok Classics, a Ben Sherman and a quiff that you can tell is there with about three pixels. He runs the same way throughout every single one of these games. There's no need for him to gain any new abilities from level to level. In fact, it's far more fitting to the story that he gains *none* at all. He's still just a slightly awkward seventeen year old trying to walk somewhere.

## The Rule

> **One mechanic per level.**
>
> If you need to explain how to play it, it's too complicated. Anyone should be able to work out what to do within a second of it starting. No scores, no lives counter taking up half the screen, no power ups, no collectables. Get to the exit, or don't get to the exit.

That suits LittleJS extremely well. A single screen collision game, an avoider or a very basic crossing game can be written in only a few hundred lines of code at most. With 1-bit or 4 colour sprites, a tiny tilemap, the level text, and compressed MIDI data for a tune, **well under 128kb should be very realistic.**

## The Twelve Levels

Each level keeps to the structure of The Hero's Journey, however heavily stripped back. I've also given each one an era appropriate tune to be rendered as the smallest possible looping MIDI file.

| # | Hero's Stage | Title | MIDI Tune | Screen Type | Single Mechanic | Story |
| :-- | --- | --- | --- | --- | --- | --- |
| 1 | The Ordinary World | *Laindon Bedroom* | *S'Express - Theme from S'Express* (1988) | Top-down, single room. | **Leave the room.** | It's a Saturday evening in 1989 and Gaz is in his bedroom trying to leave the house without his mum hearing him. Not sneak past her, not hide. Just time your movement across the landing so you don't cross it whilst she's in the way. Very small, very mundane. |
| 2 | The Call To Adventure | *The Phone Box* | *M\|A\|R\|R\|S - Pump Up The Volume* (1987) | Side view, street. | **Get to the phone box.** | Out on Laindon high street after dark. The phone boxes all smell of wee, at least two of the panes of glass are missing and nobody ever rings them. Tonight one does. Gaz just needs to walk down the empty high street and reach it to speak to Deano who has heard there's an M25 rave somewhere. |
| 3 | Refusal of the Call | *The Kitchen* | *Farley Jackmaster Funk - Love Can't Turn Around* (1986) | Side view, single screen. | **Get out of the kitchen.** | Probably the most accurate one for Essex in 1989. He's told his mum he's staying at Deano's. She doesn't believe him yet and has him trapped in the kitchen asking questions. You don't argue with her. You just try to work your way to the back door and leave. No dialogue tree. Just movement. |
| 4 | Meeting The Mentor | *Behind The Glue Pot* | *A Guy Called Gerald - Voodoo Ray* (1988) | Side view, alley/car park. | **Walk over to him.** | Behind Basildon's Glue Pot pub, away from the front, is Terry. He's a couple of years older, has actually been to Shoom and will tell Gaz roughly which direction to head in for the M25. Gaz just has to cross the small, empty yard to meet him. It's deliberately unremarkable. |
| 5 | Crossing The Threshold | *Onto The M25* | *808 State - Pacific State* (1989) | Top-down, road. | **Cross to the other side of the slip road and reach the lay-by.** | Rather than simulating driving the Nova, which would be far too much for this constraint, Gaz has to get to where Deano is parked up waiting for him. Think the simplicity of *Frogger*, but with 1989 M25 traffic. No other mechanics. The motorway feels big enough with only a few cars. |
| 6 | Tests, Allies & Enemies | *Thurrock Services* | *Black Box - Ride On Time* (1988) | Top-down, single screen. | **Get from one end of the concourse to the other.** | Late Saturday night Thurrock Motorway Services. Harsh sodium and fluorescent lights, ridiculously overpriced everything, every car in the car park seems to contain somebody going to a rave. There's one bouncer stood near the doorway blocking the way out the other side. You don't fight him. You just have to time passing him when his back is turned. Very easy to understand, but quietly awkward. |
| 7 | Approach To The Inmost Cave | *The Ongar Lanes* | *Derrick May - Strings of Life* (1987) | Top-down, maze. | **Find your way off of the single track lanes.** | They've left the motorway. Now they're in the pitch black lanes between Chipping Ongar and wherever they're meant to be. No landmarks, high hedges either side so you can't see over them, cars coming the other way with full beam on. It's just a tiny maze to navigate to an exit. No enemies chasing you. Getting lost is the threat. |
| 8 | The Ordeal | *The Police Roadblock* | *Lil Louis - French Kiss* (1987) | Top-down, field. | **Get across the field to the hedge exit.** | The part that actually happened to a lot of these nights. The police had cottoned on and were trying to stop people reaching fields. Gaz has left the car and is trying to cross an open Essex field on foot whilst torch beams sweep across it. Dodge the moving beams, reach the far hedge. No running meter, no crouching states. Just walk and don't be under a beam. |
| 9 | The Reward | *The Field* | *Sueño Latino - Sueño Latino* (1989) | Top-down, single screen. | **Walk into the crowd.** | I think this is important to not make a challenge. After level 8 especially, there shouldn't be anything trying to stop him. Just walk across the muddy field towards the sound system and the people. The music can take up most of the feeling of this level. For a game this small, having an entire level with no failure state would be very effective. |
| 10 | The Road Back | *The A127 Hard Shoulder* | *808 State - Pacific State* (Reprise) | Side view, very long single strip. | **Walk to the phone box.** | The rave is finished. It's properly light, that specific pale Essex Sunday morning light. He's miles from Laindon sitting with Deano on the hard shoulder of the A127 because the Nova has given up. All you do is walk to the right, slowly, along the hard shoulder until you reach the next phone box to ring Terry for a lift. No traffic to dodge. It's intentionally boring. It should feel boring. |
| 11 | Resurrection | *47 Denehouse Lane* | *Derrick May - Strings of Life* (Reprise) | Side view, street. | **Get to the front door.** | Back in Laindon, just as it's getting towards mid-morning. Gaz has to walk up to his own front door. His mum is already up and has opened it. There's no boss bar, no talking minigame. Just reach the door. The tension for anybody that recognises this situation needs to come entirely from the context and the music slowing down, not the gameplay. |
| 12 | Return With The Elixir | *Laindon Comprehensive* | *A Guy Called Gerald - Voodoo Ray* (Reprise) | Side view, playground. | **Walk across the playground to Deano.** | Monday. Back through the gates of Laindon Comprehensive. Nothing has changed at all. Which is exactly the point. Gaz just walks across the concrete playground and meets Deano by the bike sheds. He doesn't tell anybody where he was. They just acknowledge each other. Game ends. |

## Tone

A lot of the original draft was laughing *at* Gaz. I'd much rather have these games be quietly observant of him.

The Weekender by Pez is a good reference for this. It doesn't send its characters up, it has an enormous amount of affection for how awkward, excited, broke, tired and sincere they are, especially when they're too young to properly articulate any of those feelings.

Essex in particular lends itself to this very well. Not the caricatured "Essex boy", but the real one of the late 80s: Laindon, Basildon, Thurrock, the Ongar lanes, the A127, the M25 when it still felt strangely enormous to a seventeen year old, fluorescent lighting, council houses, Vauxhall Novas, phone boxes with no doors on them, high streets that were dead by nine o'clock. None of that needs exaggerating to be funny or affecting.

Also, acid house doesn't need to be explained in any of these games. Not once. Gaz wants to go to *a rave*. Most of the other people in these levels probably want to go to a rave. That's more than enough.

## Why this fits LittleJS and 128kb

LittleJS is very well suited to this exact format. It has simple entity updates, rectangle and tilemap collision, drawing, input and an update loop with very little boilerplate.

For a constraint like this I'd be very strict with the tech:

- **One screen or a very small tilemap per game.** No scrolling worlds. Level 7 being a tiny maze is about as large as I'd go.
- **A single 12x16 or 16x16 sprite for Gaz, reused in every game.** Possibly flipped horizontally. The rest of the graphics can be solid coloured rectangles and 8x8 tiles. You could easily get the whole thing looking like a very late 80s/early 90s British shareware game.
- **No cutscene engine.** Just one or two lines of text at the beginning of each game: *"It's Saturday night. Get to the phone box."* That's all that's needed. The player already knows Gaz from the previous one.
- **Tiny looping MIDI.** Rather than storing rendered audio, storing a minimal MIDI sequence and playing it back is by far the most realistic way to hit under 128kb. Each level only needs its own short loop. They don't need intros, outros or variations.
- **No UI chrome.** No score, lives, timer numbers unless the time limit *is* the mechanic (level 1 could justify the tiniest one, however even that I'd be tempted to remove). Level 8's moving beams create pressure without needing a countdown displayed.
- **Minimal code shared between them.** You could literally copy the engine shell and swap the tilemap, entities, win condition and MIDI for each episode.

A reasonable, honest estimate for one of these: **20–40kb of code, 5–15kb of graphics, 1–4kb of text and 8–20kb of MIDI data = under 70kb**. Plenty of headroom under 128kb.

## A small note on the gameplay verbs

Look at that list again and nearly all of them are the same family of action: **walk to somewhere**.

*Get to the phone box. Get out of the kitchen. Walk over to him. Cross the road. Get to the other end. Find the exit. Get across the field. Walk into the crowd. Walk to the phone box. Get to the front door. Walk across the playground to Deano.*

The only slight variation is **don't be under the torch beams** and **don't walk into the bouncer whilst he's facing you**.

That's incredibly simple to program in LittleJS, instantly understandable, requires no tutorial and yet, when played in order one after another over the course of ten minutes, I think it would carry that story far better than the far more elaborate version would.

The adventure isn't Gaz learning how to be a rave goer.

**It's Gaz repeatedly walking out of a room in order to try and get somewhere else.**

For 1989 Essex, I don't think that's satirising it at all. I think that's fairly accurate.
