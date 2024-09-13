import type { Accidental, IMusicallyAware, NoteLetter, Octave } from '@/musical-identity'
import { MusicallyAware } from '@/musical-identity'

/**
 * A class that represents a musical note, but does not carry any audio data.
 *
 * This class only makes sense when used in the context of a collection, as the
 * only functionality it provides serves to facilitate identification.
 *
 * @class Note
 */
export class Note extends MusicallyAware(class {}) implements IMusicallyAware {
  constructor(opts?: { letter?: NoteLetter, accidental?: Accidental, octave?: Octave }) {
    super()
    this.letter = opts?.letter || 'A'
    this.accidental = opts?.accidental || ''
    this.octave = opts?.octave || '0'
  }
}
