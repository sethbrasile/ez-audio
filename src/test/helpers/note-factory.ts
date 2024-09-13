import type { Accidental, NoteLetter, Octave } from '@/musical-identity'
import { Note } from '@/note'

export default function noteFactory(letter: NoteLetter, accidental: Accidental, octave: Octave) {
  return new Note(
    letter,
    accidental,
    octave,
  )
}
