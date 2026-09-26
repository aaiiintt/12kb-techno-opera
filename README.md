# 15KB Techno Opera

A short opera in seven acts, performed by 81 dots and sung by oscillators. The whole page, including the score, the synthesizer, the choreography and the subtitles, is under 15 kilobytes over the wire.

For scale, 15 KB is about one hundredth of a second of a YouTube video.

## Constraints

The project follows these rules:

- One file. Everything ships in `index.html`.
- 15,360 bytes or less, measured as the gzipped size of `index.html`.
- No audio samples. Every sound is synthesized when you press Play.
- No images, Canvas or WebGL. The stage is 81 `<div>` elements styled with CSS.
- No network requests after the page loads.
- No runtime dependencies.

## Size

| File | Uncompressed | Gzipped |
| --- | --- | --- |
| `index.html` | 35,648 bytes | 12,177 bytes |

Measured by `node build.js`, which reports the gzipped size using zlib level 9 and fails the build if the output exceeds 15,360 bytes.

## Dependencies

The page has no runtime dependencies. Animation uses `src/tween.js`, a 1.4 KB gzipped timeline and easing engine written for this project. The easing functions are Robert Penner's equations.

Build tooling (`terser`, `clean-css`) runs at build time only and is not shipped.

## Structure

The performance is a single timeline of about one minute. Each act sets a colour, a camera position and a musical idea.

| Act | Stage | Sound |
| --- | --- | --- |
| I. Birth | One gold dot at the centre, pulsing with a heartbeat. | Low pedal tones, a synthesized heartbeat, then a rising four-note tenor phrase. |
| II. Exploring | Rainbow stripes spread out from the middle row. The dot wanders across the grid, changing colour. | Plucked C major chords, then the tenor motif with echoes and a 50 Hz arpeggio on each step. |
| III. Love | The grid dims to blue. A second, pink dot appears. The two circle each other and touch. | Tenor call, soprano answer, then a duet in parallel thirds over a harp arpeggio. |
| IV. Jealousy | Green sweeps down the grid row by row. The pink dot is taken. The gold dot flees downward. | The room closes to a muffled 550 Hz. Minor seconds and tritones; a held soprano note as the pink dot is taken. |
| V. Revenge | The gold dot turns red and cuts across the grid in twelve strikes, leaving embers. The stage shakes. | A sawtooth battle motif with ring modulation and hi-hats, ending in a driven C2 growl and a breath. |
| VI. Acceptance | The red dot walks back to the centre, cooling to gold. Violet rings ripple outward. | The room opens. Four ascending chords, each with a ring pulse. |
| VII. Death | The grid decays from the edges inward. One ember remains. The pink dot returns for a moment. | The heartbeat slows. A soprano aria climbing to high C, then everything fades over a 32.7 Hz C1 pedal. |

## Subtitles

Short cues appear in the lower third of the frame at fixed points on the timeline. They type in letter by letter, hold, and clear. The cues are in Italian, chosen for words an English speaker already half-knows, with one exception in English. The cue text and timings are the `CUES` array in `src/index.src.html`, one entry per cue: `[time in seconds, text, hold in seconds]`. Cues do not show in ambient mode.

## Audio synthesis

All audio is generated with the Web Audio API. There are no audio files.

**Voices.** The tenor is two detuned sawtooth oscillators and a sine sub-octave through a low-pass filter that opens on each attack. The soprano is five harmonically related oscillators through a three-band formant filter bank (850 Hz, 1550 Hz, 2950 Hz), with a 5.3 Hz LFO driving pitch vibrato, tremolo and formant movement together. Soprano notes scoop up from 1.5 semitones below the target pitch. High C (523 Hz) is used once, in Act VII.

**Chords.** Single oscillators cycle through chord tones at 50 Hz or 14 to 25 Hz to imply harmony, in the manner of C64 and NES tracker music.

**Percussion.** Kicks and heartbeats are pitch-dropping sines with a filtered noise burst. Hi-hats and breaths are filtered noise. The noise source is one buffer of random samples generated at startup.

**Room.** Two cross-fed delay lines (280 ms and 380 ms) with a low-pass filter in the feedback path. The filter cutoff moves with the drama, from 320 Hz to 4.2 kHz.

**Pitch.** Every note is stored as a semitone offset from C3 (130.81 Hz) and converted to a frequency at play time.

## Build

Edit the readable source in `src/`, then build:

```bash
npm install
npm run build
```

`build.js` inlines `src/tween.js` into `src/index.src.html`, minifies the result, writes `index.html` and prints the gzipped size. Do not edit `index.html` directly.

## Run locally

Start a static server from the project root:

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000`. Click Play, or anywhere on the stage, to start the performance. Use `?seek=27` to jump to a point on the timeline.
