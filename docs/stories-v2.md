# Story cards v2

Pilot restaging per PLAN.md 0 (Eyes row) and visual-guide.md. Only CARMEN is redone here; the other seven follow this template once approved.

---

### CARMEN (French, tragedy)

- Logline: A soldier falls for a woman who circles him only until the circle closes like a blade.
- Mode: forces and one dot
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

---

### PAGLIACCI (Italian, tragedy)

- Logline: A clown paints on a smile that keeps cracking until it splits for good.
- Mode: mask
- Arc: black to a painted amber smile to a strobing crack to one amber bloom and a shatter, then back to the same dim face.
- Forces: Canio isn't a dot — he's the grid itself, arranged as a face: a jaw-line of grey cells, two eye-cells, a curved mouth-row of amber. The mask is that mouth-row, lit and held. Nedda is never a separate dot either — she's the left eye-cell, turning blue only when the private truth surfaces, then back. There is no crowd; the face's outline is fixed and indifferent throughout.
- Music (unchanged): Motif evokes "Vesti la giubba" — a falling minor sixth on "Ridi," a sobbing rhythm that never quite arrives back up — `1 -3 -4 2 1`, `x-x.xx-.`. Harmony: root A minor, a deceptive cadence (V–vi) hits where the laugh should resolve, a plagal iv–i closes Nedda's private moments. Voices/transforms: Canio (tenor) states it first, painting the smile; fragment — only the first two notes when performing for the chorus; change voice — Nedda answers brighter, major-flavoured, Canio answers back minor, re-harmonised; diminish speeds the motif as the mask cracks; the final statement is augmented, slow, funereal, as it splits. Tempo 96, root A minor, eases 15% into every deceptive cadence then snaps back. Room: dry and close at first (a single spotlight), narrows and darkens as the mask strains, opens fully wet at the crack.
- Sections:

**Intro** (~5s)
- Lighting: black, the face barely legible, eye-cells and mouth-row dim grey. `stage{bg:#000, grid:#222, dot:0.5, gap:1, size:9}`.
- Energy: 2.
- Mass: `wipe{color:#c98a3c, from:left, dur:1.2}` painting the mouth-row amber, cell by cell.
- Singled dot: none — only the surface exists yet.
- Type: `cue{text:"RIDI!", size:25}`.
- Bind: the wipe's last cell lands with the motif's solo tenor entrance, dry room.

**Mask** (PAGLIACCIO!)
- Lighting: mouth-row bright amber and held, eye-cells still flat grey. `stage{dot:0.6}`.
- Energy: 4.
- Mass: `pulse{beats:2, amount:1.2}` on the mouth-row alone, `freeze{actors:all, dur:2}` on the rest of the face — the held pose that pulses instead of moving.
- Singled dot: none.
- Type: `cue{text:"PAGLIACCIO!", size:30}`.
- Bind: the fragment — only the first two notes — lands with the pulse's beats, arp-as-chorus laughing tight beneath.

**Crack** (NEDDA — the deceptive cadence)
- Lighting: the left eye-cell flickers blue against the amber mouth, room narrowing. `stage{bg:#0a0a12}`.
- Energy: 6.
- Mass: `flicker{beats:4, amount:0.4}` on the eye-cell, the mouth-row `shrink{to:0.5, dur:1}` — the smile straining, then failing to hold.
- Singled dot: the left eye-cell, blue — the one intimate beat, never leaving the face's surface.
- Type: none — the deceptive cadence lands with no cue, the wrong laugh.
- Bind: the cadence's wrong resolution lands with the mouth-row's shrink.

**Split** (FINITA — the bloom)
- Lighting: the whole face strobes amber against black, faster each beat. `stage{grid:#c98a3c, dur:0.3}`.
- Energy: 8 rising to 9.
- Mass: `bloom{actor:mouth, dur:1.5, hold:0.8}` — the one bloom, amber flooding the screen — then `strobe{a:#c98a3c, b:#000, rate:14, dur:0.6}`, then `shatter{center:mouth, dur:0.6}` — the mask finally breaking.
- Singled dot: none — the face itself breaks, not a dot.
- Type: `titleCard{text:"FINITA.", size:40, color:#c98a3c}`.
- Bind: the bloom lands with the augmented final statement, slow and huge; the shatter lands with diminish's last accelerating beat.

**Outro** (~6s, LA COMMEDIA)
- Lighting: black returns, the face's outline barely visible. `stage{bg:#000, grid:#222, dot:0.5, gap:1, size:9, dur:2.5}` — a morph back to the intro's exact values.
- Energy: 1.
- Mass: `shimmer{amount:0.3, rate:1.5, hue:8, dur:3}` over the whole reforming face.
- Singled dot: none.
- Type: `cue{text:"LA COMMEDIA.", size:20}`.
- Bind: the single held bass note binds to the shimmer's slow decay.

- Turnaround: the shimmer settles into the same dim grey face the intro opened on — outro's `stage` values equal intro's exactly, the mask ready to be painted on again.
- Running time: about 60 seconds.

---

### RIGOLETTO (Italian, tragedy)

- Logline: A jester's curse comes true when he opens a sack expecting his enemy and finds his daughter.
- Mode: characters
- Arc: gold court to amber vow to a white bloom of horror at the sack, then back to the Duke's same gold figure-eight.
- Forces: three named dots kept on stage throughout — the Duke, gold, large, orbiting, trailing; Rigoletto, grey, medium, shrinking; Gilda, white, small. Each carries a `label` tag. The court around them is the mass — unlit background cells that brighten and dim with the scene, never a figure of its own, moved around the three named dots rather than moving them.
- Music (unchanged): Motif evokes "La donna è mobile" — a rising fourth, a bouncing dance rhythm, harmony oscillating tonic–dominant, never settling — `1 4 3 2 1`, `x.xx.x.x`. Harmony: root G, I–V–I–V–I unresolved until a deceptive cadence opens the sack on the wrong body. Voices/transforms: the Duke (tenor) sings it first, bright and careless; change voice — Rigoletto sings the same shape low on bass, vowing the curse; invert — Gilda answers the mirrored shape; retrograde plays under the sack reveal, the tune running backwards as the plan comes undone. Tempo 108, root G major, a snap ritardando right before the sack opens. Room: bright and dry through the Duke's charm, narrows and darkens the instant Rigoletto believes he's won, blows wide open, cavernous, at the sack.
- Sections:

**Intro** (~5s, LA DONNA)
- Lighting: black court forming, the Duke's gold dot entering bright at the edge. `stage{bg:#000, grid:#221a05, dot:0.4, gap:1, size:9}`.
- Energy: 2.
- Mass: `wipe{color:#c9a227, from:left, dur:1.2}` — gold light entering the court itself as he enters.
- Singled dot: the Duke — `enter{edge:left}` then `orbit{center:mid, turns:1}`, trailing gold, `label{text:"DUKE", actor:duke}`.
- Type: `cue{text:"LA DONNA.", size:26}`.
- Bind: the wipe and entrance land with the motif's solo tenor.

**Court** (MOBILE!)
- Lighting: grid brightens warm amber-grey, bg lifts to `#2a1f08`.
- Energy: 4.
- Mass: `pulse{beats:2, amount:1.15}` across the court cells, the crowd bouncing with the I–V oscillation; Rigoletto `appear{cell:mid, scale:1}`, `label{text:"RIGOLETTO", actor:rigoletto}`, fixed, watching.
- Singled dot: Rigoletto, still and grey against the bouncing court.
- Type: `cue{text:"MOBILE!", size:30}`.
- Bind: the arp-as-chorus bounce lands with the pulse's beats.

**Vow** (MALEDIZIONE)
- Lighting: room narrows and darkens, `stage{bg:#150d02, dur:1.5}`.
- Energy: 5.
- Mass: `dim{actors:all, to:0.4, dur:1.5}` across the court as Rigoletto's fear spreads through it; Gilda `appear{cell:edge, scale:0.6}`, `label{text:"GILDA", actor:gilda}`, small and white; Rigoletto `grow{to:1.3, dur:1}` then `shrink{to:1, dur:1}` — the vow.
- Singled dot: Rigoletto swelling briefly; Gilda, small at the edge.
- Type: `cue{text:"MALEDIZIONE.", size:28}`.
- Bind: change voice — the low bass vow — lands with Rigoletto's grow.

**Sack** (VENDETTA! / GILDA! — the bloom)
- Lighting: the room blows open, grey-black and cavernous. `stage{bg:#050505, dur:1}`.
- Energy: 8, then crashed to 1.
- Mass: Rigoletto `shrink{to:0.4, dur:1.5}` dragging a `path{cells:[edge,...,mid], trail:true}` sack-shadow toward centre; the court `freeze{actors:all, dur:2}` as the reveal nears; `reveal{to:#fff, dur:0.3}` swaps the sack's dot from gold to white; `bloom{actor:gilda, dur:2, hold:1}` — the one bloom, her white filling the screen.
- Singled dot: Gilda, blooming; Rigoletto, tiny, kneeling where she now is.
- Type: `cue{text:"VENDETTA!", size:30}` then `titleCard{text:"GILDA!", size:42, color:#fff}`.
- Bind: crescendo under the held dominant binds to the drag; the deceptive cadence and retrograde land exactly on the reveal and bloom.

**Outro** (~6s, silence)
- Lighting: the bloom recedes to black, the Duke's gold dot reappearing far edge, resuming his figure-eight. `stage{bg:#000, grid:#221a05, dot:0.4, gap:1, size:9, dur:3}` — morphing to the intro's exact values.
- Energy: 2, falling.
- Mass: `shimmer{amount:0.25, rate:1.8, hue:6, dur:3}` across the reforming court as it dims.
- Singled dot: the Duke, resuming his orbit, `label` restored.
- Type: none.
- Bind: the held bass note decays into the shimmer.

- Turnaround: the Duke's orbit resumes exactly where the intro began, `stage` values matching exactly — the curse resets on the next fool.
- Running time: about 60 seconds.

---

### DIDO AND AENEAS (English, tragedy)

- Logline: A queen sings her grief once, over a bassline that never stops walking downward, and then she's gone.
- Mode: pure feeling
- Arc: violet-grey to a sinking violet tide to one violet bloom of grief that drains to black, then the same half-closed column relighting.
- Forces: no characters, no singled-out dot at any point. Grief is weather. The whole grid is the ground bass: a column lighting top to bottom, unbroken, repeating. Above it, tides and shimmer stand for the vocal lines — swells and glints in the mass, never a discrete figure. The descent never resolves; it only drains.
- Music (unchanged): Motif evokes the ground bass of Dido's Lament — no melodic leap, the motif *is* the harmony, a descending line repeating underneath — `1 -7 -6 -5`, `x-x-x-x-`. Harmony: root G minor, the ground bass repeats under every chord change above, pedal point as structure; moves used: pedal point throughout, delayed resolution. Voices/transforms: the ground bass (bass) states the motif first and never stops; the vocal line enters with a slow stepwise line above it; augment as it weakens, doubling in length against the unmoved bass; diminish briefly — a comfort-fragment speeds up, urgent, then is swallowed back in; change voice at the end — the ground bass migrates from bass onto a hollow arp-as-chorus timbre, the pattern outliving the singer. Tempo 56, root G minor — the one place tempo never flexes; the breath happens through augmentation, not tempo. Room: half-closed from the start, feedback climbs slowly and steadily, no sudden opens — grief here is a slope.
- Sections:

**Intro** (~8s)
- Lighting: half-closed violet-grey, one column glowing top to bottom. `stage{bg:#0d0a14, grid:#3a2e55, dot:0.4, gap:1, size:9}`.
- Energy: 3.
- Mass: `fillColumn{col:mid, stepDur:0.5}` — the ground bass made visible, looping.
- Singled dot: none.
- Type: none — held on the falling column.
- Bind: the descending line states alone on bass, landing with the column's fall.

**Ground** (REMEMBER ME)
- Lighting: violet deepens, `stage{bg:#150f22, dur:1.5}`.
- Energy: 5.
- Mass: `tide{dir:down, color:#6b5aa8, period:1.2, repeat:4}` — the vocal line's slow stepwise entrance as a wave sinking across the field; a brief `shimmer{amount:0.4, rate:3, hue:15, dur:1}` at the edges — the comfort-fragment, urgent, swallowed back into the tide.
- Singled dot: none.
- Type: `titleCard{text:"REMEMBER ME.", size:38}`.
- Bind: the entrance above the bass binds to the tide; the diminished fragment binds to the shimmer flare.

**Remember Me** (BUT AH / FORGET MY FATE — the bloom and the drain)
- Lighting: the whole grid dims row by row from the top, violet draining to grey then black. `stage{grid:#1a1a1a, dur:3}`.
- Energy: 7 rising, then falling to 1.
- Mass: `bloom{actor:field, dur:2, hold:1}` — the one bloom, grief cresting, violet filling the screen — then `dim{actors:all, to:0.15, dur:3}`, then `blackout{dur:0, hold:1}` on the final extinguish.
- Singled dot: none.
- Type: `cue{text:"FORGET MY FATE.", size:32}`.
- Bind: augment — the doubled line against the unmoved bass — binds to the bloom and the slow dim; the vocal line's stop binds to the blackout.

**Outro** (~8s, change voice)
- Lighting: from black, the ground bass relights on a thin colourless shimmer, then `stage{bg:#0d0a14, grid:#3a2e55, dot:0.4, gap:1, size:9, dur:3}` morphs back to the intro's exact values.
- Energy: 2.
- Mass: `shimmer{amount:0.5, rate:2, hue:20, dur:4}` rippling bottom to top — the pattern outliving the singer.
- Singled dot: none.
- Type: none.
- Bind: the ground bass's migration onto arp-as-chorus binds to the shimmer; the morph's completion binds to the loop point.

- Turnaround: outro's `stage` values equal intro's exactly — descent becomes the next fall, the tide always about to sink again.
- Running time: about 75 seconds.

---

### THE MAGIC FLUTE (German, comedy)

- Logline: A queen commands vengeance and a dot rockets off the top of the world to deliver it.
- Mode: light show
- Arc: black to an indigo shriek of fireworks to a hard-cut gold dawn bloom, then fading back to the same dim night.
- Forces: no true characters — two lighting systems duel across the same grid. The Queen is night: indigo shatter, strobe, flood, violent and small becoming vast. Sarastro is day: a slow wipe and bloom of gold-white, dawn breaking. Pamina is the one flicker caught between the two systems, borrowing light from whichever side is winning, never her own colour.
- Music (unchanged): Motif evokes "Der Hölle Rache" — an octave-plus leap, a stabbing repeated-note rhythm, a hard jab before the climb — `1 1 1 5+ 6+`, `x.x.x.x-`. Harmony: root D minor, a diminished chord jabs three times before resolving onto a bright major chord at the top, same root, opposite weather when Sarastro answers in the parallel major. Voices/transforms: the Queen (soprano) sings the full unstable shape first; fragment — only the stabs play offstage, a threat implied; transpose — a smaller version a third down, scared; change voice plus a major-minor flip — Sarastro answers on bass in the parallel major, calm where the Queen was violent. Tempo 132 under the Queen, dropping to 84 under Sarastro. Room: tight and bright under the Queen, opens wide and warms under Sarastro — a hard cut, not a ramp.
- Sections:

**Intro** (~6s, DER HÖLLE)
- Lighting: black, one point flickering indigo at the edge. `stage{bg:#000, grid:#151022, dot:0.4, gap:1.4, size:9}`.
- Energy: 3.
- Mass: `flicker{beats:4, amount:0.35}` on the indigo point.
- Singled dot: none — just the flicker.
- Type: `cue{text:"DER HÖLLE.", size:28}`.
- Bind: the fragment — only the stabs — binds to the flicker's beats, tight dry room.

**Fury** (RACHE! — fireworks)
- Lighting: full indigo shriek, `stage{bg:#1a0a2e, dot:0.6, dur:0.4}`.
- Energy: 9.
- Mass: `strobe{a:#8b2fc9, b:#000, rate:16, dur:0.5}`, then `shatter{center:queen, dur:0.6}`, then `flood{color:#c93fd6, center:top, dur:1}`.
- Singled dot: none.
- Type: `titleCard{text:"RACHE!", size:40, color:#c93fd6}`.
- Bind: the full motif's leap binds across the strobe, shatter and flood in sequence, room shrieking.

**Between** (silence — Pamina)
- Lighting: cuts to a single dim grey-blue field, the fight paused. `stage{bg:#0a0a12, grid:#333, dot:0.3, dur:0.6}`.
- Energy: 4.
- Mass: one cell `flicker{beats:3, amount:0.3}` pale pink, caught, the rest `freeze{actors:all}`.
- Singled dot: Pamina's flicker-cell, transposed small and scared.
- Type: none — one beat of silence.
- Bind: transpose binds to the flicker; the beat of silence binds to the freeze.

**Temple** (WEISHEIT! — dawn, the bloom)
- Lighting: hard cut to warm gold-white, no ramp. `stage{bg:#c9a24a, grid:#fff4d6, dot:1.0, gap:0.6, dur:0}`.
- Energy: 6 rising to 8.
- Mass: `wipe{color:#fff4d6, from:bottom, dur:1.2}` — dawn breaking upward — then `bloom{actor:sarastro, dur:2, hold:1}` — the one bloom, gold-white filling the screen.
- Singled dot: none — the temple is the mass.
- Type: `titleCard{text:"WEISHEIT!", size:40, color:#3a2a05}`.
- Bind: the hard cut binds to the change-voice major flip; the wipe and bloom bind to the crescendo, warm and broad, tempo at its slowest.

**Outro** (HELP!)
- Lighting: gold recedes, one last indigo flicker at the top, then `stage{bg:#000, grid:#151022, dot:0.4, gap:1.4, size:9, dur:2.5}` morphs to the intro's exact values.
- Energy: 2.
- Mass: `shimmer{amount:0.3, rate:2.5, hue:12, dur:3}` across the whole field as the systems settle back to night.
- Singled dot: none.
- Type: `cue{text:"HELP!", size:22}`.
- Bind: the last distant fragment binds to the shimmer's decay.

- Turnaround: the shimmer settles into the same dim indigo field the intro opened on, `stage` values matching exactly — fury waiting under the calm.
- Running time: about 60 seconds.

---

### DON GIOVANNI (Italian, dark comedy)

- Logline: A statue that cannot move keeps coming anyway, one heavy step at a time, until it arrives.
- Mode: wall
- Arc: dim grey wall on a dim red field, to a brightening scarlet dance, to a grey bloom that swallows the red whole, then back to the same cold field.
- Forces: no named dots — dread is a wall. The Commendatore is a grey row advancing one row per bar against a red field: Giovanni's carelessness made literal as ground, not a figure. Elvira's plea is a pale gold shimmer threading through the red, unable to stop the grey. The advance is geometric, exact, silent between hammers.
- Music (unchanged): Motif evokes the Commendatore's chords — no leap, spaced hammer-blow chords, dread from stillness not movement — `1 1 1 1` (same note, wide spacing), `x---x---`. Harmony: root D minor, a static minor triad hammered at wide even intervals, resolving down a step only at the very end; moves used: pedal point, delayed resolution. Voices/transforms: the Commendatore (bass) states the motif first, bare and huge; Giovanni (tenor) answers the same tune fragmented and diminished into a jaunty triplet; Elvira (soprano) sings it augmented, slowed further, pleading, over his dance; invert appears once — Giovanni mocks the statue back in its own shape, upside down, right before it costs him everything. Tempo 60 for the hammer, Giovanni's material riding the same clock at diminished note density, a long held pause before the final chord. Room: cold and huge from the first beat; Giovanni's scenes sit brighter and drier by contrast until the statue's room floods in and overwrites them.
- Sections:

**Intro** (~6s, silence)
- Lighting: cold field, grey row fixed at the far edge, red field dim beneath. `stage{bg:#2a0505, grid:#555, dot:0.5, gap:0.8, size:9}`.
- Energy: 2.
- Mass: `flicker{beats:1, amount:0.5}` — a single flash across the grey row, the hammer's first strike.
- Singled dot: none.
- Type: none.
- Bind: the hammered chord, spaced wide, binds to the flash; cold huge room.

**Approach** (VIVA LA LIBERTÀ! — diminish)
- Lighting: red brightens under a light scarlet wash, grey row unchanged. `stage{bg:#4a0808}`.
- Energy: 5.
- Mass: `dash{cells:[nearRows], speed:2}` — a bright scarlet trail skimming the near rows, ignoring the grey row entirely.
- Singled dot: none.
- Type: `cue{text:"VIVA LA LIBERTÀ!", size:30}`.
- Bind: diminish — the fragment dancing fast over the slow hammer — binds to the dash.

**Defiance** (CHI SIETE? / RIDI! — the invert)
- Lighting: red deepens further, a pale gold shimmer threads across it; the grey row advances exactly one row, an instant cut, no morph. `stage{grid:#666, dur:0}`.
- Energy: 6 rising.
- Mass: `shimmer{amount:0.3, rate:2, hue:20, dur:2}` in pale gold across the red — Elvira's plea; `wipe{color:#666, from:top, dur:0.5}` — the single-row advance; a mirrored red `flicker{beats:1, amount:0.5}` where the dance briefly answers the grey's shape upside down.
- Singled dot: none.
- Type: `cue{text:"CHI SIETE?", size:28}` then `cue{text:"RIDI!", size:28}`.
- Bind: augment binds to the shimmer; the hammer's unchanged repeat binds to the row-advance; invert binds to the mirrored flicker.

**Arrival** (PENTITI! — the handshake, bloom to grey)
- Lighting: the grey row reaches the near edge, red field floods entirely to grey. `stage{bg:#333, grid:#888, dur:1}`.
- Energy: 9, then crashed to 0.
- Mass: `bloom{actor:wall, dur:2, hold:1}` — the one bloom, but grey, not colour: the handshake, geometry swallowing the red field whole — then `blackout{dur:0, hold:1}`.
- Singled dot: none — the wall itself is the actor.
- Type: `titleCard{text:"PENTITI!", size:40, color:#888}`.
- Bind: the delayed resolution — one chord down a step — binds exactly to the bloom; the room's flood to full cold reverb binds to the blackout.

**Outro** (~8s, silence)
- Lighting: from black, the same fixed grey row and dim red field reform. `stage{bg:#2a0505, grid:#555, dot:0.5, gap:0.8, size:9, dur:2}` — morphing to the intro's exact values.
- Energy: 1.
- Mass: `shimmer{amount:0.2, rate:1.5, hue:5, dur:3}` faint across the grey row.
- Singled dot: none.
- Type: none.
- Bind: one soft repeat of the hammer, fading, binds to the shimmer.

- Turnaround: the faint shimmer settles into the same fixed grey row and dim red field the intro opened on, `stage` values matching exactly — the wall never having moved, always about to advance again.
- Running time: about 60 seconds.

---

### THE BARBER OF SEVILLE (Italian, comedy)

- Logline: A barber promises he can fix everything and proves it by being everywhere at once.
- Mode: instrument
- Arc: black to a fast orange sequence to a busy three-voice pattern, one perfect brown bloom of an echo, then a hard cut back to the same tiny grid.
- Forces: the grid is an instrument, not a cast — a 13-cell-per-side Tenori-on of small dots. Figaro is the fast orange sequence lighting every cell of his patter in strict time. Bartolo is the slow brown sequence, landing late, always a beat behind. Rosina is the pink sequence, lighting on the off-beat. No dot travels as a character; each is a lit run of notes across the grid.
- Music (unchanged): Motif evokes "Largo al factotum" — a scalar run that tumbles back down, fast even patter, a tonic–dominant vamp that never varies — `1 2 3 5 4 2 1`, `xxxxxxx-`. Harmony: root C, a static I–V–I–V vamp, unchanging throughout — the move used is establishing home and never leaving. Voices/transforms: Figaro (tenor) states the motif first at full patter speed; change voice — Bartolo (bass) manages only the fragment, first three notes, slow and augmented, comically behind; Rosina (soprano) sings it transposed up, brightly; diminish — Figaro's own restatements get faster each time, patter escalating until it's barely legible. Tempo 152, root C, relentless — the "breath" is Bartolo's fragment landing painfully behind the beat. Room: dry and bright throughout; one brief, silly, cavernous echo drops in when Bartolo finally lands a note in time, then is yanked dry again.
- Sections:

**Intro** (~4s, FIGARO!)
- Lighting: black, a grid of tiny points. `stage{bg:#000, grid:#221a08, dot:0.25, gap:1.6, size:13}`.
- Energy: 4.
- Mass: `dash{cells:[fullSweep], speed:2}` in orange — the full motif lighting every cell of the run at top speed, a bright trail across all four corners in one breath.
- Singled dot: none — the trail is the instrument playing itself.
- Type: `cue{text:"FIGARO!", size:30}`.
- Bind: the full motif at top speed binds to the dash, dry bright room.

**Patter** (build)
- Lighting: the orange trail repeats, `stage{dot:0.3}`.
- Energy: 6.
- Mass: `dash{cells:[fullSweep], speed:1.4}` again in orange; a slow brown `flicker{beats:3, amount:0.3}` lighting three cells late and out of step.
- Singled dot: none.
- Type: none.
- Bind: change voice — Bartolo's late fragment — binds to the brown flicker, badly late against Figaro's speed.

**Chase** (LINDORO! — diminish)
- Lighting: pink cells lighting brightly on the off-beat among the orange, `stage{grid:#332211, dot:0.35}`.
- Energy: 8.
- Mass: `weave{targets:[figaroTrail, bartoloTrack], stepDur:0.2}` in pink threading between them; the orange `dash` accelerates each repeat.
- Singled dot: none.
- Type: `cue{text:"LINDORO!", size:28}`.
- Bind: transpose binds to the pink weave; diminish — the accelerating patter, crescendo through velocity — binds to the speeding dash.

**Chorus** (ZITTO! / BRAVO! / FACTOTUM! — the freeze and the bloom)
- Lighting: every lit cell across all three sequences freezes for one beat, then one cell blooms warm before the field snaps back dry. `stage{dot:0.4, dur:0.2}`.
- Energy: 9, hard drop to 5, then back to 10.
- Mass: `freeze{actors:all, dur:0.5}` — the sequencer cut dead; `bloom{actor:bartoloNote, dur:1, hold:0.5}` — the one bloom, one perfect brown note swelling briefly with a cavernous echo, against all odds; then `dash{cells:[fullSweep], speed:2.5}` in orange at maximum speed.
- Singled dot: none.
- Type: `cue{text:"ZITTO!", size:26}` then `cue{text:"BRAVO!", size:26}` then `titleCard{text:"FACTOTUM!", size:40}`.
- Bind: the hard silence binds to the freeze; the sudden cavernous echo for one note binds to the bloom; the full motif at max speed into the final vamp chord binds to the closing dash.

**Outro** (~5s, no fade)
- Lighting: cuts dead on the beat, then the intro's exact tiny grid relights instantly. `stage{bg:#000, grid:#221a08, dot:0.25, gap:1.6, size:13, dur:0}`.
- Energy: 4 — Figaro never actually stopped moving.
- Mass: `shimmer{amount:0.25, rate:3, hue:8, dur:1.5}` over the orange trail's resting position.
- Singled dot: none.
- Type: none.
- Bind: the vamp chord's dead cut binds to the instant stage cut; the resumed sound binds to the shimmer.

- Turnaround: the shimmer settles the grid into the exact tiny points of the intro, Figaro's trail already back at its entrance position — the sequencer never actually stopped.
- Running time: about 55 seconds.

---

### TURANDOT (Italian, tragedy turning to dawn)

- Logline: A single voice refuses to sleep until dawn proves it right.
- Mode: dawn
- Arc: black with one pinprick lamp, to a lightening grey-blue climb, to a silent bar and a full white bloom at VINCERÒ, then dimming back to the same black pinprick.
- Forces: Calaf is a single lamp — a small white-gold dot that only ever grows brighter, never travels far. Turandot is the field itself, fixed and cold, unmoving until the very end. Liù is a fragment of shimmer at one corner, fading. The whole arc is the lamp brightening until it becomes the whole field.
- Music (unchanged): Motif evokes "Nessun dorma" — a stepwise climb capped by one late, held high note, and a plagal swell into the cadence, acceptance not victory — `1 2 3 4 5 7+`, `x.x.x.x.x...x---`. Harmony: root Ab, chords climb I–ii–IV, then a plagal swell IV–I at the end; moves: plagal cadence, delayed resolution. Voices/transforms: Calaf (tenor) sings it first, alone, unhurried; Liù sings a fragment — just the climb, no leap — quietly, before fading; augment — as dawn nears, the whole motif doubles in duration; change voice at the climax — Turandot herself sings Calaf's motif back to him on her own soprano, the cold voice taking the warm tune. Tempo 66, root Ab major — breathes hardest of any card, every phrase easing late into its final note, stacked with a ritardando. Room: almost fully closed and dark at first, opens gradually and continuously across the whole piece, no jump cuts — the room itself performs the dawn.
- Sections:

**Intro** (~6s, NESSUN DORMA)
- Lighting: entirely black, Calaf's lamp a pinprick at the bottom edge. `stage{bg:#000, grid:#000, dot:0.2, gap:1.5, size:9}`.
- Energy: 1.
- Mass: `appear{cell:bottom, scale:0.3}` for the lamp; `shimmer{amount:0.15, rate:1, hue:4, dur:3}` faint across the black field.
- Singled dot: Calaf, the lamp, small and alone.
- Type: `cue{text:"NESSUN DORMA.", size:26}`.
- Bind: the motif solo on tenor binds to the lamp's appearance, dark closed room.

**Night** (Liù's fragment)
- Lighting: one corner flickers faintly, otherwise unchanged. `stage{dur:0.5}`.
- Energy: 2.
- Mass: `flicker{beats:3, amount:0.2}` at one corner cell, before dimming further.
- Singled dot: Liù's corner cell, fading.
- Type: none.
- Bind: the fragment — just the climb, quiet — binds to the flicker.

**Climb** (DILEGUA)
- Lighting: black lightening gradually toward deep blue-grey. `stage{bg:#0a0a14, dur:4}` — a continuous morph, no jump cut.
- Energy: 4 rising to 6.
- Mass: `rise{rows:6, stepDur:0.8}` and `grow{to:1.4, dur:4}` together on Calaf's lamp; Turandot's fixed dot `freeze{dur:4}` — the unmoving anchor; `shimmer{amount:0.25, rate:1.5, hue:6, dur:4}` spreading wider.
- Singled dot: Calaf, rising and growing; Turandot, fixed and untouched.
- Type: `cue{text:"DILEGUA.", size:30}`.
- Bind: the climb's repeat binds to the rise; the room opening gradually binds to the bg morph; Turandot's stillness binds to the pedal-like anchor beneath.

**Dawn** (VINCERÒ! — the bloom)
- Lighting: one full silent bar, every dot freezing, then the field floods from black to white. `stage{bg:#fff, grid:#fff4d6, dur:2}`.
- Energy: 8 to 10.
- Mass: `freeze{actors:all, dur:1.5}` for the silent bar; then `bloom{actor:calaf, dur:3, hold:1.5}` — the one bloom, the lamp growing until the whole field is lit; `shimmer{amount:0.4, rate:2, hue:10, dur:3}` everywhere across the white.
- Singled dot: none by the bloom's end — the lamp has become the whole field.
- Type: `titleCard{text:"VINCERÒ!", size:45, color:#3a2a05}`.
- Bind: the hard silence before the leap binds to the freeze; augment — the doubled final phrase, the high note landing late — binds to the bloom's hold; crescendo through the hold binds to the shimmer.

**Outro** (change voice, silence)
- Lighting: the white holds a beat then dims, `stage{bg:#000, grid:#000, dot:0.2, gap:1.5, size:9, dur:3}` — morphing to the intro's exact values.
- Energy: 3, falling to 1.
- Mass: `approach{target:calaf, dur:1}` — Turandot's one small step, her only move in the piece; the field `dim{actors:all, to:0, dur:3}` returning to black.
- Singled dot: Turandot, moving once; Calaf, the lamp fading back to a pinprick.
- Type: none.
- Bind: change voice — Turandot singing Calaf's motif back, the plagal swell resolving beneath — binds to her one step; the room's cutoff resetting binds to the dim.

- Turnaround: the field dims to the exact black pinprick state of the intro, `stage` values matching — dawn becoming the night before the next dawn.
- Running time: about 70 seconds.
