# Story cards v2

Pilot restaging per PLAN.md 0 (Eyes row) and visual-guide.md. Only CARMEN is redone here; the other seven follow this template once approved.

---

### CARMEN (French, tragedy)

- Logline: A soldier falls for a woman who circles him only until the circle closes like a blade.
- Arc: black plaza to a rising red tide to one blood bloom at the height of passion, then a white strobe cuts it dead. The bloom sits at Circle, the instant the tide crests over José.
- Forces: Carmen is red and never idle — a tide that rolls, a flood that crests, a disc that swallows the screen. José is amber, a fixed patch that dims and is absorbed, singled out as one dot only twice: the instant he's taken, and alone after the knife. The plaza chorus is the grid itself — it fans open, then closes like a fist.
- Music (unchanged): Motif evokes the Habanera's chromatic creep over a static tonic, no leap, all descent — `5 4 3 2 1`, `x-x.x-x.`. Harmony: root D, Phrygian, tonic pedal under the whole motif, closing sequence uses planing. Voices/transforms: Carmen (soprano) sings it first, straight; José answers in canon a beat later; change voice — José takes Carmen's exact motif on tenor when absorbed; retrograde as he can't undo it; augment marks the final unresolved stab. Tempo 72, root D Phrygian, ritardando into the final chord. Room: bright and wide at first, narrowing and darkening as the circle tightens, near-silent for the stab.
- Sections:

**Intro** (~6s)
- Lighting: black plaza, a dim field of grey pixels, José's amber patch glowing faint at centre. `stage{bg:#000, grid:#333, dot:0.3, gap:1.2, size:9}`.
- Energy: 2.
- Mass: `wipe{color:#e63b2e, from:left, dur:1.5}` — Carmen's red edge creeping into the plaza, dot by dot.
- Singled dot: none — Carmen is the wipe, not yet a dot.
- Type: `cue{text:"L'AMOUR.", size:25}`.
- Bind: the wipe's leading edge lands with the motif's solo entrance on soprano, room wide open.

**Build** (TORÉADOR! / JE T'AIME.)
- Lighting: red rolling across the grid in rows, bg warming to maroon `#1a0000`, grid to `#b23`. `stage{dot:0.5}`.
- Energy: 5.
- Mass: `tide{dir:right, color:#e63b2e, period:1.0, repeat:3}` then `closeIn{center:jose, dur:1.2}` as the chorus ring pulls inward around José's patch.
- Singled dot: none — José stays a patch, dimming under the closing ring.
- Type: `cue{text:"TORÉADOR!", size:35}` then `cue{text:"JE T'AIME.", size:35}`.
- Bind: tide's rows land with the arp-as-chorus shimmer on the pedal and José's canon entrance; closeIn lands with the change-voice moment — José takes Carmen's motif on tenor, room starting to close.

**Circle** (LIBRE. — the bloom)
- Lighting: full red flood, bg becomes solid `#e63b2e`, the grid vanishes into colour.
- Energy: 8 rising to 9.
- Mass: `bloom{actor:carmen, dur:2, hold:1}` — the one bloom of the opera, the red disc growing to cover the screen.
- Singled dot: José, one amber dot visible at the disc's dead centre for a beat before the red takes it — the touch, the only other intimate beat.
- Type: `titleCard{text:"LIBRE.", size:40, color:#fff}`.
- Bind: planing under the motif, feedback climbing, crescendo through the section, resolving into the bloom's hold.

**Close** (silence / ADIEU — the knife)
- Lighting: hard cut from full red to a black-white strobe.
- Energy: 9, then crashed to 0.
- Mass: `blackout{dur:0, hold:0.5}` for the silent bar, then `strobe{a:#fff, b:#000, rate:16, dur:0.4}`, then `shatter{center:carmen, dur:0.6}` — the tide breaks and flies off the grid.
- Singled dot: José, alone at centre where the strobe leaves him.
- Type: `cue{text:"ADIEU.", size:30}` on the strobe's last white flash.
- Bind: the full silent bar binds to the blackout; the retrograde, augmented on the last two notes, binds to the strobe; the one dry unresolved chord lands with the shatter.

**Outro** (~6s, CARMEN...)
- Lighting: black plaza reforms, dim field returning.
- Energy: 2, falling.
- Mass: `stage{bg:#000, grid:#333, dot:0.3, gap:1.2, size:9, dur:3}` — a morph back to the intro's exact values — while José `dissolve{dur:1.2}`.
- Singled dot: José, shrinking to nothing.
- Type: `cue{text:"CARMEN...", size:20}`, fading with him.
- Bind: the pedal note holding alone binds to the dissolve.

- Turnaround: the pedal fades as the plaza's morph completes on José's dissolve — outro's `stage` values are intro's `stage` values exactly, so the fade-out plaza is the fade-in plaza and the loop is seamless.
- Running time: about 60 seconds.
