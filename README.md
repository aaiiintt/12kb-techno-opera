# 15KB Techno Opera (Alpha)

The 15KB Techno Opera is an interactive, browser-based audiovisual experience constrained to a 15-kilobyte footprint. It uses native web APIs—specifically the DOM, CSS, and the Web Audio API—to render a synchronized musical and visual performance without external rendering libraries like WebGL or Canvas.

This document details the technical architecture, sequence timeline, and optimization strategies for the Alpha release.

## Architecture

The application relies on three core systems working in synchronization: the rendering engine, the audio synthesizer, and the sequence timeline.

### Rendering Engine (Stage & Camera)

The visual system uses a static 9x9 CSS Grid containing 81 standard `<div>` elements. 

*   **Zero-DOM Animation:** The DOM structure never changes during playback. Motion and state changes are achieved exclusively by animating CSS custom properties (specifically `--dot-color`), CSS `transform` (scale, translate), and `opacity`.
*   **The Camera:** The viewport (`worldEl`) translates and scales across the static grid using GSAP. This keeps the narrative focus centered while the grid shifts underneath, creating the illusion of a vast space.
*   **Compositing:** The UI elements (like the massive slab title) use `mix-blend-mode: difference` to mathematically invert the light values of the dots passing beneath them, maintaining legibility without complex z-indexing or background calculations.

### Audio Synthesis (Voices & Space)

Audio is synthesized procedurally in real-time using the native `AudioContext`.

*   **Acoustic Space:** A custom cross-feedback delay loop creates an immersive, spatial cathedral environment. This relies on a `DelayNode` and a `BiquadFilterNode` to simulate velvet absorption.
*   **Voice Profiles:** Character voices are built using layered oscillators. The "Hero" (Tenor) uses micro-detuned fundamentals with a cello sub-octave. The "Beloved" (Soprano) uses a luminous fundamental, an overtone fifth, and a subtle sub-octave, supplemented by a 4.8Hz LFO for operatic vibrato.
*   **Spatial Audio:** Sound is dynamically panned left and right based on the active dot's horizontal column position on the grid.

### Byte-Saving Techniques

To remain under the 15KB compressed wire limit, the project enforces strict constraints:

*   **No Canvas or WebGL:** Avoids the payload overhead of rendering libraries (e.g., Three.js, PixiJS) and the boilerplate required to initialize WebGL contexts.
*   **Algorithmic Color and Pitch:** Colors and musical pitches are calculated at runtime using math (e.g., `hsl()` functions and semitone offset arrays) rather than hardcoding static hex codes or audio samples.
*   **Procedural Audio:** Contains zero audio assets. All sound, including the biological heartbeats (generated via pitch plunges and filtered noise impulses), is synthesized from scratch.

## Sequence Reference

The opera executes programmatically across seven sequential states (Acts). Each state synchronizes specific GSAP visual tweens with scheduled Web Audio API calls.

### Act I: Birth
*   **Visual State:** The camera initiates a deep macro close-up (`zoom: 2.2`) on the central cell `(4, 4)`. The cell pulses with a `hsl(46, 100%, 56%)` gold fill.
*   **Audio State:** The room filter initializes to 1800 Hz. A C3 tenor note plays, layered over a synthesized biological heartbeat (`thump()` with a filtered noise impulse).

### Act II: Development
*   **Visual State:** The camera zooms out (`zoom: 1.35`). Procedural rainbow stripes radiate outward from the equator row. The central light translates across cells `[[4, 3], [5, 3], [5, 4], [4, 4]]`.
*   **Audio State:** Row-pairs trigger stacked C Major chord tones (C-E-G-C-E). The tenor voice plays a C4-E4 motif synchronized to the light's translation.

### Act III: Love
*   **Visual State:** The grid dims to a twilight `hsl(225, 75%, 16%)`. A secondary light initializes at `(6, 4)` in `hsl(335, 100%, 65%)`. The two lights translate in a 2x2 box at opposite corners. The camera frames both lights (`zoom: 2.3`).
*   **Audio State:** A call-and-response executes between the tenor (C4, D4) and soprano (G4, E4) voices. As the translation loop begins, the voices sing in parallel thirds.

### Act IV: Jealousy
*   **Visual State:** Rows transition sequentially from top to bottom into `hsl(110, 100%, 46%)` (green). The secondary light is consumed at `(5, 4)`. The primary light translates rapidly downward to `(4, 8)`.
*   **Audio State:** The room filter drops to a muffled 650 Hz. Dissonant minor 2nd/tritone intervals play as the green rows descend. A suspended soprano E4 note plays simultaneously with a tritone bass when the secondary light is consumed.

### Act V: Revenge
*   **Visual State:** The primary light transitions to `hsl(0, 100%, 60%)` (crimson). The camera translates violently across the grid (`zoom: 1.85`) as the light executes 12 rapid zigzag translations. Consumed cells fade to ember (`hsl(14, 95%, 22%)`). A CSS `transform: translateY` vibration applies to `worldEl` on the final strike.
*   **Audio State:** The tenor voice drops to a broken B3-E4 motif driven by a harsh sawtooth oscillator. The final translation triggers a heavily driven C2 synth growl.

### Act VI: Acceptance
*   **Visual State:** The primary light translates sequentially up column 4 back to the center `(4, 4)`. The light's color property interpolates from red back to gold. Concentric rings of violet light ripple outward from the center.
*   **Audio State:** The room filter opens to 2400 Hz. The audio system schedules a repeated IV–I (F-C) cadence.

### Act VII: Death
*   **Visual State:** A breadth-first search algorithm calculates a procedural decay map from grid edges. Cells iteratively scale to 0 and lose opacity. The central light remains as a solitary ember. The cell at `(5, 4)` temporarily re-ignites.
*   **Audio State:** The heartbeat synthesis slows to 48 BPM. The soprano voice executes a final G4 -> A4 -> C5 upward scale with high vibrato amplitude. All voices and visuals fade to zero over a subterranean 32.7 Hz C1 pedal tone.
