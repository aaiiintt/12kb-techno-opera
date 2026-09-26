# 15KB Techno Opera

> **An interactive opera in seven acts told with 81 dots of light and procedural chiptune synthesis — engineered to fit entirely within a 15-kilobyte transfer budget.**
>
> *For reference, 15KB is approximately 1/100th of a second of a YouTube video.*

---

## Overview

The **15KB Techno Opera** is an interactive, browser-native audiovisual drama. Constrained to less than 15,360 bytes over the wire (gzipped), it achieves cinematic scale without WebGL, Canvas, pre-rendered video, or sampled audio files.

The entire experience—visual staging, typographic motion, dramatic narrative, through-composed operatic score, formant vocal modeling, and spatial acoustics—is rendered in real time using native web primitives: **DOM**, **CSS Custom Properties**, **GSAP**, and the **Web Audio API**.

---

## Technical Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             15KB TECHNO OPERA                                │
├───────────────────────────────┬─────────────────────────────────────────────┤
│      VISUAL STAGING           │            PROCEDURAL AUDIO ENGINE          │
├───────────────────────────────┼─────────────────────────────────────────────┤
│ • 9×9 Matrix (81 Dots)        │ • Through-Composed Score (7 Leitmotifs)     │
│ • Zero-Breakout Scale (≤1.25) │ • Human Vocal Tract Modeling (Formant Bank) │
│ • Pure Spectral Light (HSL)   │ • Galway PWM & 50Hz SID Tracker Arpeggios   │
│ • Kinetic Camera (Zoom/Pan)   │ • Follin Stereo Echoes & Ring Modulation   │
│ • Incandescent Light Coronas  │ • Cathedric Feedback Delay & Reverb Room    │
│ • Kinetic Typographic Inset   │ • Biological Heartbeat & C1 Organ Pedal     │
└───────────────────────────────┴─────────────────────────────────────────────┘
```

### 1. Visual Staging & Grid Discipline

The stage consists of an 81-cell matrix (9 rows × 9 columns) of standard `<div>` elements mounted within a velvet stage container (`#world`).

*   **Strict Grid Discipline:** Dots never break out of their grid cells. Cell gutters occupy ~17.6% of cell spacing; scaling dots beyond $1.28\times$ causes cell overlap. The engine enforces a strict scale ceiling of **$1.25\times$**, preserving cell integrity under all kinetic animations.
*   **Pure Spectral Optical Translucency:** Color design avoids flat beige, gray, or muddy pigments. All emitters use pure, translucent spectral values (`hsl()`) with Gaussian glowing emission coronas (`box-shadow`) and zero `#ffffff` burnout cores.
*   **Zero-DOM Churn:** The DOM tree is built once at initialization (`buildGrid()`). All stage animation is driven by CSS custom properties (notably `--dot-color`), CSS transforms (`scale`, `translate`), and `opacity`.
*   **Kinetic Camera System:** The stage viewport (`worldEl`) pans and zooms dynamically across the grid to frame soloists, duets, and global shockwaves without distorting the coordinate space.
*   **Incandescent White Light Effect (Option A):** Title, full-width subtitle, and navigation employ high-intensity white incandescent coronas:
    ```css
    text-shadow: 
      0 0 2px rgba(255, 255, 255, 0.9),
      0 0 8px rgba(255, 255, 255, 0.5),
      0 0 22px rgba(255, 255, 255, 0.25);
    ```

---

### 2. Procedural Audio Engine

The opera contains **zero audio assets or sample libraries**. All audio is synthesized in real time via the browser's `AudioContext`.

#### Dramatic Soprano Modeling (The "Liebestod" Aria)
To synthesize an authentic dramatic soprano voice (*the fat lady singing*) without speech samples:
*   **3-Band Singer's Formant Filter Bank:** A parallel trio of high-Q `BiquadFilterNode` bandpass filters models the acoustic resonances of the human vocal tract:
    *   $F_1$: 850 Hz (pharyngeal / vowel cavity)
    *   $F_2$: 1550 Hz (oral tract resonance)
    *   $F_3$: 2950 Hz (**Singer's Formant**, granting operatic voices the acoustic power to project over a full orchestra)
*   **Coupled Tri-LFO System (5.3 Hz):** Operatic vibrato is not merely pitch modulation. A synchronized 5.3 Hz LFO simultaneously drives:
    1.  Pitch Vibrato ($\pm 35$ cents)
    2.  Amplitude Tremolo (subtle dynamic breathing)
    3.  Formant Aperture Wobble (natural larynx expansion)
*   **Portamento Scooping:** Vocal entrances utilize exponential frequency glides, scooping upward from 1.5 semitones below the target pitch to mimic biological human vocal onset.
*   **Messa di Voce Dynamics:** Notes swell gradually from pianissimo ($ppp$) to fortissimo ($ff$) before tapering into breath.
*   **High C (C5 / 523.25 Hz) Reserve:** High C is strictly reserved across the entire score for the climactic death aria in Act VII.

#### Chiptune & Tracker Synthesis Techniques
*   **Galway Pulse-Width Modulation (PWM):** The Hero tenor lead utilizes dual pulse-wave oscillators with modulating pulse widths to reproduce the rich, organic timbre of Martin Galway's legendary Commodore 64 scores.
*   **50Hz SID Tracker Arpeggios:** Harmonic density is achieved on single oscillator voices by cycling triad and seventh chords at 50 Hz frame rates, simulating multi-voice polyphony within minimal CPU and code overhead.
*   **Follin-Style Cross-Stereo Delays:** Tim Follin inspired cross-channel stereo delay lines provide spacious acoustic depth.
*   **Ring Modulation:** Dissonant carrier/modulator pairs generate metallic, alien sidebands during acts of jealousy and conflict.
*   **Acoustic Cathedral Model:** Velvet room absorption simulated via feedback delay loops and lowpass biquad filtering.
*   **Subterranean 32.7 Hz C1 Organ Pedal:** Grounding the dramatic conclusion with room-shaking acoustic weight.

---

## The Seven Acts (Narrative & Score)

The opera is through-composed, tracking the Hero leitmotif (`MOTIF`) as it mutates across seven distinct emotional and dramatic states:

| Act | Name | Mood / Mode | Tempo | Leitmotif Transformation | Grid Choreography |
|---|---|---|---|---|---|
| **I** | **Birth** | Wonder (C Lydian) | 76 BPM | `heroBirth`: C3 $\to$ G3 $\to$ C4 $\to$ E4 inception motif | Macro zoom on center `(4, 4)` cell; mitotic cardiac ripples outward |
| **II** | **Development** | Joyous Curiosity (C Major) | 118 BPM | `heroDev`: C4 $\to$ E4 $\to$ G4 $\to$ C5 $\to$ A4 $\to$ G4 | 6-step wide exploration across quadrants; Galway bass bounce & 50Hz SID arps |
| **III** | **Love** | Romantic Passion (C Major / A Minor) | 94 BPM | `heroLove` $\leftrightarrow$ `belovedAnswer` counterpoint | Close magnetic courting waltz; peach-magenta optical fusion; 50Hz flutter |
| **IV** | **Jealousy** | Betrayal (Dorian / Tritone) | 134 BPM | `heroBetrayed`: C4 $\to$ Eb4 $\to$ Gb4 $\to$ B3 horror motif | Green gate invasion descending; tritone shriek; Beloved captured at `(5, 4)` |
| **V** | **Revenge** | Wrath & Exhaustion (Locrian / Ring Mod) | 148 BPM | `heroWar`: B3 $\to$ C4 $\to$ B3 $\to$ F#4 battle chant | 10-strike hunt; incinerated embers; sfz crash; living breath pause & lowpass tail |
| **VI** | **Acceptance** | Euphoria (Lydian #4) | 128 BPM | `heroTransfigured`: C4 $\to$ E4 $\to$ F#4 $\to$ G4 resolution | Full-bleed radiant purple flood; concentric ring pulses locked to synth strikes |
| **VII** | **Death** | Tragedy (Phrygian / C Minor) | 52 BPM | `heroDying` lament into Beloved's ghost `aria` on High C5 | Breadth-first Perlin entropy decay; solitary amber ember; subterranean C1 pedal |

### Synesthetic Architecture & Theatrical Pauses
*   **Synesthetic Coupling:** Synth pitch values directly parameterize dot hue and luminescence. In Act VI Acceptance, as the 4-step chord progression ascends, the purple flood lifts from deep ultraviolet (272°) to luminous royal violet (288°), radiating in concentric waves from center `(4, 4)` in exact mathematical lockstep with the synth.
*   **Act IV Prelude:** A **240ms theatrical breath** precedes the crushing Green Gate invasion.
*   **Act V Living Pause:** Following the revenge climax, an intentional living pause unfolds—not an unnatural digital mute, but cavernous acoustic dissipation (`320Hz`), staggered anatomical heartbeats (`lubdub`), and biological exhalation (`breath`).

---

## Wire Budget & Size Footprint

The project enforces an absolute wire transfer constraint of **15,360 bytes (15 KB)** gzipped. The entire opera is packaged as a **self-contained single file** (`index.html`):

| Asset | Description | Uncompressed | Gzipped |
|---|---|---|---|
| `index.html` | Self-contained single-file delivery bundle (HTML + CSS + Audio Engine + Choreography) | 49.2 KB | **13.81 KB** (14,145 B) |
| `about.html` | Standalone manifesto poster with dynamic subhead typography | 5.8 KB | **2.27 KB** (2,273 B) |
| `src/` | Modular source files (`main.js`, `config.js`, `style.css`) for developer reference | 48.6 KB | **14.01 KB** (14,351 B) |

**Total Opera Delivery (`index.html`):**
*   **Uncompressed:** 49.2 KB (49,230 bytes)
*   **Gzipped Wire Transfer:** **13.81 KB (14,145 bytes)**
*   **Brotli Wire Transfer:** **11.82 KB (12,099 bytes)**
*   **Budget Margin:** **1,215 bytes under the strict 15 KB (15,360 byte) ceiling.**

### Visual Integrity & Anti-Eclipse Blend Mode
*   **Additive Screen Blending (`mix-blend-mode: screen`):** All dots render with additive optical blending over `#080706` dark velvet. Dark or dying pixels mathematically cannot occlude or darken neighboring lighter pixels, completely eliminating crescent moon or eclipse cutout artifacts during dynamic scale changes and entropy transitions.
*   **Safe-Gutter Geometry & Terminal Padding:** All title and subhead lines feature right-hand terminal padding (`padding-right: 0.15em`) and responsive fitting with a 12% safety margin (`innerWidth * 0.88`), guaranteeing that slanted glyph terminals (like 'A' in OPERA) and incandescent drop shadows are never clipped across any viewport (from 375px mobile to 4K ultrawide).

---

## About Page: Swiss Poster Manifesto

The About page (`about.html`) is styled as a raw, bold Swiss poster manifesto:
*   **Unified Subhead Scale:** The entire body shares the exact type size of the homepage subhead (`81 DOTS. SEVEN ACTS. 15 KILOBYTES.`), scaling dynamically via `--subhead-size`.
*   **All-Caps & Poetic Line Breaks:** Text is formatted in rhythmic, unpretentious verse.
*   **Scale Reference:** Highlighted directly in the text:
    > *FOR REFERENCE 15KB IS 1/100TH OF A SECOND OF A YOUTUBE VIDEO.*
*   **Unbroken Navigation:** Smooth vertical scrolling with a footlight fade gradient mask over the fixed bottom navigation (`PLAY` / `BACK`).

---

## Local Development

Start any static HTTP server from the project root:

```bash
# Using Python 3
python3 -m http.server 8000

# Using Node.js
npx serve .
```

Open `http://localhost:8000` in any modern Chromium, Safari, or Firefox browser. Click **Play** or tap anywhere on the stage to begin the performance.

---

## Philosophy

> *Large AI systems make it easier to build small software.*
> *We can use them to make tools that serve one purpose, one person, or a small group.*
> *The more of these small tools we make, the less we might rely on large systems in the future.*

