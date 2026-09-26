# Soundtracking the 15KB Techno Opera

Sep 26, 2026 · Iain Tait

This is the music brief for the whole project. Every agent working on sound, on story cards, or on the engine reads it first. The rules at the end are not suggestions.

## Opera and chiptune are the same problem

Both art forms make enormous feeling out of a tiny number of voices. An opera composer has a handful of singers on stage; a NES composer had two square waves, a triangle and a noise channel. The tricks the greats developed on each side turn out to be the same tricks: make every voice a character, let the harmony carry the story, and imply far more than you actually play.

That's the frame for this guide. Every section pairs an operatic principle with a game-audio hack that gets the same effect for almost no bytes. It doesn't touch the acts or scenes of the site at all; it's about the raw materials, so you can apply them wherever you like.

The budget matters, so the guide assumes three things throughout:

- Sound is procedural. Oscillators, noise, filters and delays only. No samples, no decoded audio.
- Every voice costs code, and every note costs data. A good score here is one where the note data is short and the synth does the heavy lifting.
- Big emotion doesn't need big polyphony. Two or three well-written voices, placed in a good room, beat eight lazy ones.

## Instrumentation: build a cast, not an orchestra

Opera casts by voice type, and each type has a job. Tenor and soprano carry the story, the bass anchors it, the chorus fills the room. Chip composers did exactly the same with their channels. [The NES gave you two pulse channels for melody and countermelody, a triangle for bass and noise for drums](https://pressforsound.com/history-of-video-game-music/), and Rob Hubbard on the C64 [put melody on voice one, bass on voice two, and had voice three switch rapidly between chords, percussion hits and counter-melodies](https://www.commodore-64.eu/legends/rob-hubbard/). Assign roles first, then write.

### A workable cast for a Web Audio opera

| Role | Operatic model | Cheapest synth that does the job |
| --- | --- | --- |
| Lead voice (tenor) | Warm, slightly rough, sits mid-range | Two detuned sawtooth or square oscillators, a few cents apart, through a low-pass filter. The detune does the work of a whole string section. |
| Second voice (soprano) | Bright, pure, rides above | One sine or triangle fundamental plus a quieter oscillator a fifth or an octave up, and a slow LFO on pitch for vibrato. |
| Bass | The floor of the harmony | One triangle or sine an octave or two below the lead. Chips used the triangle for bass because it's soft-edged and never fights the melody. |
| Chorus or pad | The crowd, the weather, the room | Not a separate voice. Get it from arpeggios (below) and from the delay network. |
| Percussion and body sounds | Timpani, heartbeat, footsteps | Filtered noise bursts and pitch-plunging sines. No samples. |

That's four or five oscillators at a time, which is well inside the budget of a laptop and, more to the point, well inside the budget of one small synth function.

### Make timbre move, or it dies

A static oscillator sounds like a test tone within two seconds. Every classic chip trick is a way of making a cheap waveform change over time, and every one of them is a few lines of Web Audio:

- Duty cycle and pulse width. [Galway pioneered pulse-width sweeps](https://m64.io/chiptune-wiki/) and [Hubbard's own player did looped, step-programmed pulse sweeps](https://akaobi.wordpress.com/2013/09/03/introducing-rob-hubbard/). Web Audio has no native pulse wave, but a sawtooth minus a phase-shifted sawtooth gives you one, and a PeriodicWave lets you bake a fixed duty cycle in one line. Sweeping it slowly gives the classic "breathing" chorus.
- Filter as expression. [The SID's multimode filter let a programmer carve the brightness of a sound in real time](https://www.allaboutcircuits.com/news/the-mos-6581-sid-giving-the-commodore-64-its-voice/). One BiquadFilterNode per voice, with the cutoff opening on each note's attack and closing on its release, does more for expressiveness than any second oscillator.
- Envelopes with shape. Sung notes don't start instantly. Give the lead a 30 to 80 ms attack and a long, curved release. Give percussion a near-zero attack and a fast exponential decay. exponentialRampToValueAtTime is your friend; linear ramps sound like a machine.
- Vibrato that arrives late. Real singers start a note straight and let vibrato bloom in. Delay the LFO's depth ramp by 150 to 300 ms after note-on. It costs one extra ramp call and it's the single biggest "this is a voice" cue.
- Ring mod and sync for the nasty stuff. [Ring modulation and oscillator sync let SID voices interact to produce metallic timbres the raw waveforms couldn't](https://www.allaboutcircuits.com/news/the-mos-6581-sid-giving-the-commodore-64-its-voice/). In Web Audio, multiplying two oscillators through a GainNode (one oscillator driving the other's gain) is ring modulation. Bells, growls and menace for free.

### Drums without drums

The chip composers never had a drum sample either. Hubbard's early trick was [filter sweep sampling: a high tone decaying rapidly through a filter sweep](https://jamesm.blog/retro-computing/sid-chip-most-iconic-sound/), which reads as a kick or snare. The general recipe:

- Kick: a sine that starts around 150 Hz and plunges to 40 Hz in 60 ms, with a fast decay.
- Snare: that same pitch plunge, plus a burst of noise through a band-pass around 1 to 2 kHz.
- Hat: a very short noise burst through a high-pass at 6 kHz or so.
- Heartbeat: two kicks in a lub-dub rhythm, the second quieter and slightly higher.

A noise source in Web Audio is a one-time AudioBuffer of random samples, a few hundred bytes of code, reused forever.

## Harmony: chord sequences that carry the story

The operatic composers built emotion out of tension and delay, not out of clever chords. Wagner's Tristan chord is famous because [its significance lies in its unusual relationship to the key around it, not in the notes themselves, which aren't unusual at all](https://en.wikipedia.org/wiki/Tristan_chord). The lesson for a tiny score: a chord's meaning comes from what it follows and what it refuses to become. That's cheap. It costs zero extra bytes to put the same triad in a different place.

### Six moves that do most of the work

1. Establish home, then leave it. Sit on the tonic long enough that the listener relaxes. Everything after is measured against that.
2. Delay the resolution. [Romantic composers created longing by deliberately delaying the resolution of a dissonance to a stable chord](https://en.wikipedia.org/wiki/Chromaticism). A dominant that hangs for two bars longer than expected is the cheapest ache in music.
3. Borrow from the parallel minor. [In a major key, the classic chromatic substitution is a triad taken from the parallel minor](https://en.wikipedia.org/wiki/Chromaticism). Swap IV for iv, or I for i, for one bar. Same key, same scale array, one flag changed, and suddenly it's raining.
4. The deceptive cadence. Set up V, then land on vi instead of I. The listener expected to come home and didn't. Use it once per act at most; it stops working when it's routine.
5. The plagal cadence for grace. IV to I, the "Amen" ending, is warm rather than triumphant. It reads as acceptance rather than victory, which is a different emotion to V to I.
6. Planing. Puccini, Verdi and Wagner all used parallel chords: [Wagner's "Magic Slumber" motif is built from parallel triads, and Puccini was so fond of empty parallel fifths that one critic renamed La Bohème "La Vide Bohème"](https://people.bu.edu/burtond/resources/Research/PucciniCodeProof.pdf). Moving a whole chord shape up or down in parallel is a single transposition offset in code, and it sounds enormous, ancient and strange.

### Why this suits a byte budget

Store chords as intervals from the root, not as absolute pitches. A major triad is [0, 4, 7], a minor is [0, 3, 7], a seventh adds 10 or 11. A whole progression is then a list of root offsets and a list of shape indices, a few dozen bytes. Transposition, planing and borrowing from minor all become arithmetic on those arrays rather than new data. That's also exactly how the SID and NES arpeggio drivers stored their chords.

### Voicing with two or three voices

You'll rarely play four notes at once, so choose the two or three that matter:

- The bass gets the root, nearly always. The ear infers the chord from the bass and one other note.
- The lead gets the note that defines the emotion: the third (major or minor?) or the seventh (unresolved?).
- Leave the fifth out. It's the least informative note in a triad. Chip composers dropped it constantly and nobody noticed.
- Move voices by the smallest step possible between chords. Smooth voice leading with two voices sounds richer than jumpy voice leading with four.

### Dissonance is a colour, not an error

A minor second, a tritone, or a note held over from the previous chord (a suspension) gives you jealousy, dread and grief for free. [Puccini used the Tristan chord in hundreds of contexts, but saved it for centre stage at climactic moments](https://people.bu.edu/burtond/resources/Research/6f2.ReconditeChap2.pdf). Ration the dissonance the same way: one clear jolt is worth more than a wash of it.

## Leitmotif and melody: one tune, many faces

Wagner's real trick wasn't writing a hundred tunes. It was writing a few and bending them. [The motifs are changed, interwoven and combined to create new motifs, and act like a narrator commenting on events over the heads of the characters](https://opera-inside.com/24332). The clearest example is [the Ring motif morphing into the Valhalla motif: Wagner changes the intervals between the notes but keeps the basic shape, so it stays recognisable while sounding altered](https://classicalvoiceamerica.org/?p=213). He called them reminiscence motifs, and that's the useful word: a motif is something the listener is meant to remember.

For a byte budget this is the best news in the whole guide. A motif is a short array of intervals. Every transformation is a function on that array. One tune, stored once, becomes the whole score.

### Write the motif first, and keep it short

[Wagner's motifs lean on a few memorable shapes: dotted rhythms, scale passages, leaps of a fourth or fifth, and emphasis on the first, third and fifth of the scale](https://classicalvoiceamerica.org/2011/05/31/ring-tunes-keep-you-awake/). Game composers converged on the same rules independently, because a tune that has to survive a square wave has to be shaped in stone:

- Four to eight notes. If you can't hum it after one hearing, it's too long.
- One distinctive leap, then step-wise motion. The leap is the hook; the steps make it singable.
- A rhythm that's recognisable on its own. If you can tap it on a table and someone knows the tune, it's a good motif.
- Start on a strong scale degree and end somewhere unresolved. That's what makes it want to come back.

### The transformation kit

Each of these is a one-line map over the motif array, so they're essentially free:

| Transformation | What you do | What it reads as |
| --- | --- | --- |
| Transpose | Add a constant to every note | Same character, new situation |
| Major to minor | Flatten the 3rd (and 6th) | Same character, something's gone wrong |
| Invert | Flip every interval upside down | The mirror image, the rival, the shadow |
| Augment | Double every duration | Slow, grand, funereal |
| Diminish | Halve every duration | Panic, urgency, a memory flashing past |
| Fragment | Play only the first two or three notes | A half-remembered thought, a glance |
| Retrograde | Reverse the array | Undoing, going back |
| Re-harmonise | Keep the notes, change the chord under them | Same event seen with new eyes |
| Change the voice | Same notes on a different oscillator profile | A different character quoting the first |

The last one is where the operatic idea and the chip idea meet exactly. On the NES, Kondo would hand the same phrase to the other pulse channel with a different duty cycle, and on the C64 [Hubbard's pieces shift between different sounds that share the main melody](https://theconversation.com/the-sound-of-sid-35-years-of-chiptunes-influence-on-electronic-music-74935). In an opera, the soprano singing the tenor's line is a plot point.

### Counterpoint on the cheap

Two voices singing different lines sounds like a duet; two voices singing the same line a third apart sounds like a chorus. Both are cheap:

- Parallel thirds or sixths: play the motif, and play it again offset by two scale steps. Sweet, warm, agreement.
- Canon: play the motif, then play it again a beat or two later on the other voice. Chasing, longing, pursuit.
- Contrary motion: one voice plays the motif, the other plays it inverted. Conflict, drama, two wills.
- Pedal point: hold the bass on one note while the harmony moves above it. Tension, weight, inevitability. Costs one long note.

### Pitch is a scale index, not a frequency

Store every note as an index into a scale array, and store the scale as semitone offsets from a root. Then the frequency is root × 2^(semitones/12), computed at play time. This is why the chip drivers could hold whole songs in a few hundred bytes: [pitches and timbres were calculated from short offset tables rather than stored](https://ozzed.net/how-to-make-8-bit-music.shtml). Changing the mode of the entire score from major to Dorian to harmonic minor becomes editing seven numbers.

## Squeezing a lot out of very little

The chip greats are worth studying because their constraints were harder than yours. You have unlimited oscillators and a DSP; they had three or four voices and a register map. What they learned transfers straight across, and most of it comes down to one idea: time-multiplex everything.

### Arpeggio as harmony

The defining chip hack. [Rather than spending three channels on a triad, one voice cycles through the chord notes fast enough that the ear hears a chord, freeing the other voices](https://pressforsound.com/history-of-video-game-music/). On the C64 [the arpeggio rate was tied to the 50 Hz frame, so chords flickered at 50 notes a second](https://encyclopedia.pub/entry/28597), and that flicker became the sound. On the web you can pick any rate. Fast (40 to 60 Hz) reads as a chord with a shimmer; slow (8 to 16 Hz) reads as a harp or a music box; in between it reads as tension. One oscillator, three notes of data, a whole harmonic layer.

### The echo channel

When a chip had a spare voice, composers used it to play the melody again, a fraction of a beat later and quieter. That's a delay effect made out of note data, and it's why NES leads sound so wide. The Follin brothers [used old analogue synth tricks and C64-style techniques on the NES's four channels to get incredibly full arpeggios, percussion and leads](https://flypaper.soundfly.com/discovery/7-unsung-nintendo-soundtracks-that-chiptune-fans-need-to-hear/), and a lot of that fullness is the echo voice. Web Audio has a real DelayNode, which is cheaper still, but the note-data version has one advantage: the echo can be a different timbre, or a different octave, or transposed to a harmony. Use both.

### Voice stealing and role swapping

Hubbard's third voice [switched between chords, percussion hits and counter-melodies bar by bar](https://www.commodore-64.eu/legends/rob-hubbard/). The listener never notices the drums drop out for a bar if a chord stab arrives in their place. Design the score so no voice is precious. If the bass is silent for a beat, it can be a kick. If the soprano rests, that oscillator is a bell.

### Timbre from time, not from data

David Wise's SNES work is the extreme case. He [sampled a Juno at different resonances, chopped it into single-cycle waves, and wrote code to cycle through them, essentially rebuilding the synthesizer inside the console](https://gearspace.com/threads/the-official-nintendo-music-production-techniques-thread.990134/page-2). The principle is that a sound's character lives in how it changes, so store the change, not the sound. The web equivalents:

- A filter envelope that sweeps down over 200 ms turns a sawtooth into a pluck.
- A filter that sweeps up over two seconds turns the same sawtooth into a dawn.
- A pitch envelope that drops an octave in 50 ms turns a sine into a drum.
- A gain LFO at 5 Hz turns a static pad into tremolo strings.
- A pitch LFO at 5 Hz with 10 cents depth turns any oscillator into a singer.

Every one of these is one AudioParam automation. One small function that takes (param, start, end, duration, curve) covers all of them.

### Instrument macros

Tracker composers defined instruments as macros: on every tick, step the pitch, volume and duty through short tables. It's how one square wave could sound like a snare, a bass, a lead and a bell in the same bar. Do the same: an instrument is a small object of {wave, detune, attack, decay, filterStart, filterEnd, vibratoDepth, vibratoDelay}. Ten numbers is an instrument. Ten instruments is under 200 bytes.

### One noise buffer, a hundred sounds

Generate a single second of white noise once and keep it. Every percussion sound, every breath, every rain texture is that buffer at a different playback rate through a different filter with a different envelope. Playback rate changes the colour of the noise more than you'd expect; slow it down and it turns to gravel, speed it up and it turns to steam.

### Detune is the whole string section

Two oscillators a few cents apart beat against each other, and the beat frequency is the difference between them. At 3 cents you get slow, warm movement. At 15 cents you get a chorus. Three oscillators at -7, 0 and +7 cents is a supersaw. Nothing in a small score gives you as much size per byte as a detune constant.

### Let the DSP do the sustain

A long note costs nothing in data if the synth holds it. Opera is built on held notes; chip music is built on retriggers. Steal from both: keep the note data sparse and let long releases and the delay network fill the space. A note every two bars with a four-second tail sounds like a cathedral. A note every sixteenth sounds like a sequencer.

## Space and drama: the room is an instrument

An opera house is part of the orchestra. Wagner built Bayreuth with a covered pit so the sound arrived blended and from nowhere in particular. The SNES designers gave [half the sound RAM over to the DSP so it could generate reverb and echo](https://www.resetera.com/threads/how-music-was-made-on-super-nintendo.62155/), which tells you how much a room was worth to them. On the web, a room is a few nodes.

### A cathedral out of two delays

A ConvolverNode with a real impulse response is the honest way to do reverb, and it's off the table: impulse responses are audio assets. The cheap way, which is also what the SNES echo did, is a feedback delay network:

- Two DelayNodes with slightly different times (say 0.31 s and 0.47 s, avoid simple ratios).
- Each feeds back into the other through a gain of 0.4 to 0.7.
- A low-pass filter in the loop, cutoff somewhere between 800 Hz and 3 kHz, so each repeat is darker than the last. That's what absorption sounds like.
- A touch of the wet signal panned opposite to the dry.

Move the filter cutoff and the feedback and you have different rooms. Low cutoff and high feedback is a crypt; high cutoff and low feedback is a bright hall. The cutoff is also an emotional control: closing it makes the world feel muffled and wrong, opening it feels like relief. That's one AudioParam ramp doing the work of a whole cue.

If you want a smoother tail, generate a short impulse response procedurally: a buffer of exponentially decaying noise, half a second to two seconds long. It's a few lines and it feeds a real ConvolverNode. Costs CPU, not bytes.

### Dynamics are free and you're probably not using them

The biggest difference between a score that feels operatic and one that feels like a loop is dynamic range. Chip music tended to sit at one level because the hardware had four volume bits and composers used them all. Opera goes from a whisper to a roar. Every voice already has a GainNode; automate it. A phrase that starts at 0.2 and swells to 0.9 over four bars is a crescendo, and a crescendo is the most operatic gesture there is.

### Silence is a note

Verdi and Puccini stop the orchestra before the big line. The silence is what makes the line big. A score under a byte budget should have gaps anyway, so put them where they count: before a change, after a shock, under a single held voice. A well-placed rest is worth more than any effect.

### Register is drama

Where a note sits on the keyboard is as expressive as which note it is. Low is weight, dread, ground. High is exposure, fragility, ecstasy. The same motif two octaves up is a different emotional statement, and in code it's a single added constant.

### Panning tells the eye where to look

Stereo position is another free parameter. A StereoPannerNode per voice, driven by whatever the visual system already knows, ties sound to picture with no extra data. Keep the bass and the room in the centre, let the characters move.

### Tempo can breathe

Human performers slow into a cadence and rush a climax. Chip music can't; every event is on a grid. If your scheduler uses a tempo variable rather than fixed timings, a slight ritardando into a resolution (stretch the last beat by 10 to 20 percent) is a few characters of code and it's the difference between a machine and a performance.

## Byte discipline: what the 4k people know

The demoscene has been fitting whole soundtracks into 4,096 bytes alongside the visuals for twenty years, so their numbers are the benchmark. Sointu, the current descendant of 4klang, gets [a fairly capable synthesis engine into 600 bytes compressed, with another few hundred bytes for the patch and pattern data](https://github.com/vsariola/sointu). One 2011 team found a full 4klang track came to [about 2.5 KB compressed: roughly 500 bytes of synth, 1 KB of instruments and just under 1 KB of notes](https://erleuchtet.org/), and considered that too fat for a 4k. Against a 15 KB total, that puts a serious score at somewhere between 1.5 and 3 KB of gzipped JavaScript. It's plenty, if you spend it the way they do.

### Where the bytes actually go

| Part | What eats it | How the 4k crowd shrinks it |
| --- | --- | --- |
| Synth engine | One function per oscillator type, filter, envelope | A tiny virtual machine: [the sound is produced by a VM executing small bytecode](https://github.com/vsariola/sointu). In JS, one generic voice function with a parameter object, not one function per instrument. |
| Instruments | Numbers describing each patch | Short arrays of small integers, and a handful of shared defaults. |
| Note data | The notes themselves | Patterns that repeat, stored once and referenced by index. Pitches as scale indices in one byte. |
| Automation | Filter sweeps, swells, tempo changes | Derived from the score position, not stored per event. |

### Patterns and a sequence, never a piano roll

Every tracker format stores a song as a small set of patterns plus an order list. A 64-bar piece might be six distinct four-bar patterns and a sequence of 16 indices. That's the single biggest saving available and it maps perfectly onto operatic form, which is built out of recurring numbers and returning motifs anyway. Rule: if you type a phrase twice, it should be a pattern.

### Strings compress better than arrays

A note pattern written as a string of characters (one character per step, a letter for pitch, a dot for rest, a dash for hold) is smaller in source and compresses far better under gzip than an array of numbers with commas and brackets. One split and a charCode lookup turns it back into data. Instruments can be strings too.

### Let gzip do the composing

Your 15 KB is a compressed wire limit, so repetition is nearly free. A motif that appears eight times costs roughly one copy plus a few bytes per repeat. Variation, on the other hand, costs full price. That's not an argument against variation; it's an argument for making variation algorithmic (transpose, invert, change instrument) rather than hand-written.

### Derive, don't store

The test for every value in the score: could a function produce this from the bar number? Filter cutoff rising over an act, volume swelling toward a climax, tempo easing into a cadence, the heartbeat slowing: all of these are curves over time, and a curve is a formula, not a table.

### Bytebeat as a last resort and a first inspiration

Bytebeat is the extreme end: a whole track as one expression evaluated per sample, something like (t*(t>>10&42)&255). It's too rough for an opera, but it teaches the right instinct. Ask of every sound: what's the smallest expression that produces this? A kick is a sine with a decaying frequency. A hat is noise with a decaying gain. A choir is three detuned saws and a low-pass. Start from the expression, not from a mental image of the instrument.

### Measure constantly

The 4k scene builds with a size readout in the loop. Do the same: gzip the audio module on every change and keep the number visible. Byte cost becomes a design constraint you feel rather than a surprise at the end.

## A working method

A rough order that keeps the score small and the drama big. Each step is something you can finish in a sitting.

1. Cast the voices. Decide on three or four roles and write one instrument object for each. Done when you can play a C major scale on each voice and they sound like different characters. About an hour.
2. Write the motif. Four to eight notes, one leap, a rhythm you can tap. Test it on every voice. Done when you can hum it after one hearing. An hour, but don't be surprised if it's an evening.
3. Write the harmony as a chord grammar. A root sequence plus shape indices, stored as intervals. Include one borrowed minor chord, one deceptive cadence, one plagal cadence and one planed passage in the vocabulary, even if you don't use them all. An hour.
4. Build the room. Two cross-fed delays with a low-pass in the loop, and a master gain. Make the cutoff and feedback live parameters. Done when a single held note sounds like it's in a building. An hour.
5. Write the transformation kit. Transpose, minor, invert, augment, diminish, fragment, as functions over the motif array. Done when each one is under 40 characters. An hour.
6. Compose with patterns and a sequence. Every repeated phrase is a pattern index. Every variation is a transform, not new data. Done when the score is a list of small integers. This is the actual composing, so give it a few sessions.
7. Automate the curves. Volume, filter, tempo and room as functions of position. Done when nothing dynamic is stored per event. An hour.
8. Measure and cut. Gzip the module, look at the number, remove whatever isn't earning its place. Done when the audio is under your target and nothing you'd miss is gone.

### Rules to write on the wall

- Every voice is a character. If you can't say who it is, cut it.
- The bass and one other note define a chord. Drop the rest.
- A motif is stored once. Everything else is a function of it.
- Timbre is change over time. If a sound is static, it's wrong.
- Silence and dynamics are the cheapest drama you have. Use them before adding a voice.
- If you typed it twice, it's a pattern. If it changes smoothly, it's a formula.
- Check the size on every commit.

### Things that look cheap and aren't

- Lots of instruments. Each one is a new set of numbers and a new branch. Four good ones beat twelve.
- Hand-written variation. It doubles the note data for a small gain. Transform instead.
- Reverb from a real impulse response. It's an audio asset by another name.
- A separate scheduler per act or section. One scheduler, one clock, data-driven.

### Things that look expensive and aren't

- Vibrato that arrives late on every sung note.
- A crescendo over four bars.
- Ring modulation for the menacing sounds.
- A ritardando into the final cadence.
- Panning voices to follow the picture.

All of those are a ramp or a multiply on something you already have.

## Listening list

Each of these demonstrates one idea from the guide better than any description of it.

| Listen to | Who | What it teaches |
| --- | --- | --- |
| Tristan und Isolde, Prelude | Wagner | Delayed resolution as the engine of longing. Nothing resolves for ten minutes and you can't stop listening. |
| Das Rheingold, transition from scene 1 to 2 | Wagner | One motif becoming another: the Ring motif turning into Valhalla by changing intervals but not shape. |
| La Bohème, Act I | Puccini | Planing and parallel fifths. Big, hollow, ancient sounds from the simplest chord shapes. |
| Turandot, opening | Puccini | Parallel chords and pedal points as menace. |
| La traviata, Act III prelude | Verdi | Two or three string voices doing the work of an orchestra. Register and dynamics over density. |
| Monty on the Run | Rob Hubbard, C64 | Voice stealing. Three voices sounding like six because none of them keeps its job for long. |
| Ocean Loader themes and Wizball | Martin Galway, C64 | Pulse-width sweeps and melodic patience. The mellow side of a square wave. |
| Super Mario Bros. and The Legend of Zelda | Koji Kondo, NES | Motifs that survive anything. Fast arpeggios standing in for chords. |
| Silver Surfer and Solstice | Tim Follin, NES | What four channels can do when every trick is used at once: echo voices, dense arpeggios, synthetic drums. |
| Metroid | Hirokazu Tanaka, NES | Space, silence and unease from almost nothing. The opposite of Follin and just as instructive. |
| Donkey Kong Country, Aquatic Ambience | David Wise, SNES | Timbre as change over time. A whole mood from filter movement and a small room. |
| Any winning Revision 4k intro of the last five years | The demoscene | What a full soundtrack sounds like when the entire production is 4 KB. |

A useful exercise once you've heard them: pick one Wagner passage and one Hubbard track and write down, in one sentence each, what the fewest moving parts are that make it work. It's usually two or three things. Those are the things to build.

### Sources

- [Press for Sound, History of Video Game Music](https://pressforsound.com/history-of-video-game-music/)
- [Commodore-64.eu, Rob Hubbard](https://www.commodore-64.eu/legends/rob-hubbard/)
- [All About Circuits, The MOS 6581 SID](https://www.allaboutcircuits.com/news/the-mos-6581-sid-giving-the-commodore-64-its-voice/)
- [Encyclopedia MDPI, MOS Technology SID](https://encyclopedia.pub/entry/28597)
- [SID Media Lab, Introducing Rob Hubbard](https://akaobi.wordpress.com/2013/09/03/introducing-rob-hubbard/)
- [The Conversation, The sound of SID](https://theconversation.com/the-sound-of-sid-35-years-of-chiptunes-influence-on-electronic-music-74935)
- [Ozzed, How to make 8-bit music](https://ozzed.net/how-to-make-8-bit-music.shtml)
- [Wikipedia, Tristan chord](https://en.wikipedia.org/wiki/Tristan_chord) and [Chromaticism](https://en.wikipedia.org/wiki/Chromaticism)
- [Deborah Burton, The Puccini Code](https://people.bu.edu/burtond/resources/Research/PucciniCodeProof.pdf) and [Recondite Harmony, chapter 2](https://people.bu.edu/burtond/resources/Research/6f2.ReconditeChap2.pdf)
- [Opera Inside, Wagner's leitmotifs](https://opera-inside.com/24332)
- [Classical Voice America on Ring leitmotifs](https://classicalvoiceamerica.org/?p=213) and [Ring tunes keep you awake](https://classicalvoiceamerica.org/2011/05/31/ring-tunes-keep-you-awake/)
- [Flypaper, 7 unsung Nintendo soundtracks](https://flypaper.soundfly.com/discovery/7-unsung-nintendo-soundtracks-that-chiptune-fans-need-to-hear/)
- [Gearspace, Nintendo music production techniques](https://gearspace.com/threads/the-official-nintendo-music-production-techniques-thread.990134/page-2)
- [ResetEra, How music was made on Super Nintendo](https://www.resetera.com/threads/how-music-was-made-on-super-nintendo.62155/)
- [Sointu on GitHub](https://github.com/vsariola/sointu) and [a 4k intro post-mortem](https://erleuchtet.org/)
