# The music, checked

Iain, 29 Sep: "the music seems fine, but please check note for note." Every quoted tune in the first build was written from memory. This is the check. Verified tunes live in `lib/tunes.js` as scale degrees; the game files play them from there.

## Verified against notation

| Tune | Source read | Verdict on the first build |
| --- | --- | --- |
| Habanera (Carmen) | LilyPond source in the Wikipedia article | Melody was a compression: the real line repeats the C three times (triplet), and continues A A G# G, then F G F E F G F E. **Bass was wrong**: the ostinato is D, A, F, A, not D A D D. Both fixed. |
| Séguedille (Carmen) | 8notes soprano edition, bars 13 to 17 | First build used a generic arpeggio. Now the real entry, "Près des remparts de Séville": 2 5 6# 7# 1+ 2+ 3+ 4+ 3+ 2+ 1+ 7 6#. |
| Toreador refrain (Carmen) | 8notes trumpet edition, bars 3 to 10 | First build was wrong (5 5 5 4 3 3 1). Real refrain: 5 6 5, 3 3, 3 2 3 4, 3, 4 2 5, 3, 1 6- 2, 5-. |
| Largo al factotum (Barber) | 8notes flute edition, bars 8 to 11 and 18 to 20 | First build was a guess (1 1 1 1 3 3 3 3 5 5 5 5). Real entry is the held tonic then the neighbour figure 1 2 7 1 2 7 1 2 7b, and the leap to the fifth. "Figaro" on the repeated fifth. |
| Una voce poco fa (Barber) | 8notes mezzo edition, bars 13 to 19 | First build used coloratura runs. Real opening sits on 1 2 1, rises to 3, then 1 2 3 4 for "ferito è già". Rhythm approximated. |
| Ecco ridente in cielo (Barber) | Vocal score PDF, the Count's entry | First build wrong (3 3 2 1 2 3 5). Real: 5 6 5 1+ 1+, 1+ 7 1+ 2+ 1+, 5 6 5 5 1+ 2+, 3+ 3+ 2+ 1+. |
| Libiamo (Traviata) | 8notes tenor edition, bars 2 to 12, cross-checked with a letter-note transcription | First build wrong (5 3 5 3 5 6 5 4 3 2 1). Real: 5, 3+ held, 3+ 5 3+, 3+ 5 3+, the turn 3+ 4+ 3+ 2#+ 3+, 5+ held, 5+ 4+ 3+, then the 2+ 2#+ 1# 2+ 3+ figure twice. |
| Addio del passato (Traviata) | 8notes voice edition, bars 15 to 24 | First build wrong (5 4 3 2 / 3 2 1 7). Real: 3 3, 3 (1 2 3 1), 3 3 3 (1 2 3 1), 2 2 2 (7# 1 2 1), 1 1 5; then "L'amore d'Alfredo" 5 6 6, 5 4 5 6. |

## UNVERIFIED, still from memory

No free score reached in this session. The game files do not claim these as quotes: the acts use the verified tune of their opera or a plain figure instead, until a score is read.

- **Zitti, zitti, piano, piano** (Barber, act VI). The WED act uses the Ecco ridente figure fast, and staccato pulses.
- **Un dì, felice, eterea** (Traviata, act II). The SNIP act uses the Brindisi in the country, slower.
- **Pura siccome un angelo** (Traviata, act III). The RENOUNCE act uses a plain funereal figure on the tenor, no quote.
- **Prendi, quest'è l'immagine** (Traviata, act VI). The GIVE act uses the Addio del passato "L'amore d'Alfredo" phrase.
- **The card scene** (Carmen, act IV, "En vain pour éviter"). Kept as the tritone drone and a descending 5 4 3; no quote claimed.
- **La fleur que tu m'avais jetée** (Carmen, act III). Not verified; the act plays the Habanera in the major, which the treatment asked for ("minor key transposition of the Habanera theme" in reverse).

## How the check was done

Scores were fetched as images (8notes.com free editions, a public-domain vocal score PDF rendered with PyMuPDF, Wikipedia's LilyPond source for the Habanera) and read by eye. Rhythms are transcribed to the nearest eighth or triplet and simplified where a grace note or a turn would cost more bytes than it earns. Keys in `tunes.js` are the editions' keys; the games play the degrees in their own key.
