/* The quoted tunes, checked against notation on 29 Sep 2026.
   Each tune is scale degrees (the synth's notation: 1..7, # and b, + and -
   for octaves, '.' a rest) with durations in beats of the tune's own metre
   (a quarter note is 1, an eighth 0.5; for a 3/8 or 6/8 tune an eighth is 1).
   Play with MG.sing(voice, t.notes, t.durs, at, beat * scale, opts).
   `key` is [root, mode] for the synth; degrees are relative so an opera may
   keep its own key. Sources are in docs/MUSIC.md; anything marked
   UNVERIFIED there is written from memory and not in this file. */

'use strict';

const TUNES = {
  // Bizet, Carmen. Habanera, D minor, 2/4. Melody from the LilyPond source on
  // Wikipedia (Habanera (aria)): r4 d8 cis | c c c (triplet) b bes | a8 a16 a gis8 g |
  // f g f (16th triplet) e16 f16 g8 f8 | e8. Bass ostinato: d8 r16 a16 f8 a8.
  habanera: {
    key: [2, 'minor'],
    notes: ['1+', '7#', '7', '7', '7', '6#', '6', '5', '5', '5', '4#', '4', '3', '4', '3', '2', '3', '4', '3', '2'],
    durs: [0.5, 0.5, 1 / 3, 1 / 3, 1 / 3, 0.5, 0.5, 0.5, 0.25, 0.25, 0.5, 0.5, 1 / 6, 1 / 6, 1 / 6, 0.25, 0.25, 0.5, 0.5, 0.5],
    bass: { notes: ['1-', '5-', '3-', '5-'], at: [0, 0.75, 1, 1.5], durs: [0.5, 0.25, 0.5, 0.5] },   // one 2/4 bar
  },
  // Bizet, Carmen. Séguedille, B minor, 3/4, quarter = 160. 8notes soprano edition, bars 13-17:
  // "Près des remparts de Séville": c# f# g# | a# b c# | d. e d c# b a | g# . | (b c# b) g g
  seguidilla: {
    key: [11, 'minor'],
    notes: ['2', '5', '6#', '7#', '1+', '2+', '3+', '4+', '3+', '2+', '1+', '7', '6#', '.', '1+', '2+', '1+', '6', '6'],
    durs: [1, 1, 1, 1, 1, 1, 0.75, 0.25, 0.5, 0.5, 0.5, 0.5, 2, 1, 1 / 3, 1 / 3, 1 / 3, 1, 1],
  },
  // Bizet, Carmen. Toreador refrain, F major, 2/4. 8notes trumpet edition (written F), bars 3-10:
  // c d. c | a a | a. g a. bb | a | bb g. c | a | f d. g | c
  toreador: {
    key: [5, 'major'],
    notes: ['5', '6', '5', '3', '3', '3', '2', '3', '4', '3', '4', '2', '5', '3', '1', '6-', '2', '5-'],
    durs: [1, 0.75, 0.25, 1, 1, 0.75, 0.25, 0.75, 0.25, 2, 1, 0.75, 0.25, 2, 1, 0.75, 0.25, 2],
  },
  // Rossini, Il barbiere. Largo al factotum, C major, 6/8. 8notes flute edition (written G), bars 8-11:
  // "Largo al factotum della città, largo": a. a b g# | a b g# a b g | a . . e' | e
  // in degrees of the tonic: the long note, then the neighbour figure, then the leap.
  largo: {
    key: [0, 'major'],
    notes: ['1', '1', '2', '7', '1', '2', '7', '1', '2', '7b', '1', '.', '5+', '5'],
    durs: [3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 3],
    // "Figaro qua, Figaro là": bars 18-20: a . e' e' e' | g f# e . | a. a b a
    figaro: { notes: ['1', '.', '5+', '5+', '5+', '7', '6', '5', '.', '1', '1', '2', '1'], durs: [1, 2, 1, 1, 1, 1, 1, 1, 3, 1.5, 0.5, 0.5, 0.5] },
  },
  // Rossini, Il barbiere. Una voce poco fa, E major, 3/4. 8notes mezzo edition, bars 13-19:
  // "Una voce poco fa qui nel cor mi risuonò": e. f# | e e. f# e f#. f# | g# . (g# f# e) | ... "il mio cor ferito è già": e e. f# g# a | a
  unaVoce: {
    key: [4, 'major'],
    notes: ['1', '2', '1', '1', '2', '1', '2', '2', '3', '.', '3', '2', '1', '1', '.', '1', '1', '2', '3', '4', '4'],
    durs: [0.75, 0.25, 1, 0.75, 0.125, 0.125, 0.75, 0.25, 1, 1, 1 / 3, 1 / 3, 1 / 3, 1, 1, 0.5, 0.75, 0.25, 0.5, 0.5, 2],
  },
  // Rossini, Il barbiere. Ecco ridente in cielo, C major, 2/4. Vocal score (theoperadatabase), the Count's entry:
  // "Ecco ridente in cielo spunta la bella aurora": g a. g c c | c b c d c c | g a g g c d | e. e d c
  eccoRidente: {
    key: [0, 'major'],
    notes: ['5', '6', '5', '1+', '1+', '1+', '7', '1+', '2+', '1+', '1+', '5', '6', '5', '5', '1+', '2+', '3+', '3+', '2+', '1+'],
    durs: [0.5, 0.75, 0.25, 0.5, 0.5, 1, 0.25, 0.25, 0.25, 0.25, 1, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 1.5, 0.5, 0.5, 1],
  },
  // Verdi, La traviata. Libiamo (Brindisi), B flat major, 3/8, dotted quarter = 56. 8notes tenor edition, bars 2-12:
  // f | d'. | d' f d' | d' f d' | d' eb' d' c#' d' | f'. | f' eb' d' | c' (c#' b) c' d' | c' (c#' b) c' d' | c' b | f . f
  brindisi: {
    key: [10, 'major'],
    notes: ['5', '3+', '3+', '5', '3+', '3+', '5', '3+', '3+', '4+', '3+', '2#+', '3+', '5+', '5+', '4+', '3+', '2+', '2#+', '1#', '2+', '3+', '2+', '2#+', '1#', '2+', '3+', '2+', '1#', '5'],
    durs: [1, 3, 1, 1, 1, 1, 1, 1, 0.75, 0.25, 0.75, 0.25, 1, 3, 1, 1, 1, 1, 0.25, 0.25, 0.5, 1, 1, 0.25, 0.25, 0.5, 1, 1.5, 1.5, 1],
  },
  // Verdi, La traviata. Addio del passato, A minor in the opera (8notes edition in E minor), 6/8, quarter = 50:
  // "Addio, del passato bei sogni ridenti": g g | g (e f# g e) | g g g (e f# g e) | f# f# f# (d# e f# e) | e. e b
  addio: {
    key: [9, 'minor'],
    notes: ['3', '3', '3', '1', '2', '3', '1', '3', '3', '3', '1', '2', '3', '1', '2', '2', '2', '7#-', '1', '2', '1', '1', '1', '5'],
    durs: [1, 1, 1, 0.5, 0.5, 0.5, 0.5, 1, 1, 1, 0.5, 0.5, 0.5, 0.5, 1, 1, 1, 0.5, 0.5, 0.5, 0.5, 2, 1, 1],
    // "L'amore d'Alfredo pur esso mi manca": b. c' c' | b. (a b) c'
    alfredo: { notes: ['5', '6', '6', '5', '4', '5', '6'], durs: [1.5, 1, 0.5, 1.5, 0.5, 0.5, 0.5] },
  },
};
