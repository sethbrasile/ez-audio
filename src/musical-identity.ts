import frequencyMap from '@utils/frequency-map'
import { get } from '@utils/prop-access'

export type NoteLetter = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G'
export type Accidental = '' | 'b' | '#'
export type Octave = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8'
export type AcceptableNote = keyof typeof frequencyMap
type Constructor<T = any> = new (...args: any[]) => T

export interface IMusicallyAware {
  letter: NoteLetter
  accidental: Accidental
  octave: Octave
  name: string
  frequency: number
  identifier: AcceptableNote
}

/**
 * This mixin allows an object to have an awareness of it's "musical identity"
 * or "note value" based on western musical standards (a standard piano).
 * If any of the following are provided, all of the remaining properties will be
 * calculated:
 *
 * 1. frequency
 * 2. identifier (i.e. "Ab1")
 * 3. letter, octave, and (optionally) accidental
 *
 * This mixin only makes sense when the consuming object is part of a collection,
 * as the only functionality it provides serves to facilitate identification.
 *
 * Example usage is the SampledNote class definition:
 * ```
 * export class SampledNote extends MusicallyAware(Sound) {}
 * ```
 *
 * SampledNote becomes a combination of Sound and MusicallyAware giving it the properties of both.
 *
 * @public
 * @class MusicalIdentity
 */
export function MusicallyAware<TBase extends Constructor>(Base: TBase) {
  return class MusicalIdentity extends Base {
    /**
     * @property letter For note `Ab5`, this would be `A`.
     */
    letter: NoteLetter = 'A'

    /**
     * @property accidental For note `Ab5`, this would be `b`.
     */
    accidental: Accidental = ''

    /**
     * @property octave For note `Ab5`, this would be `5`.
     */
    octave: Octave = '0'

    /**
     * @property name Computed property. Value is `${letter}` or `${letter}${accidental}` if accidental exists.
     */
    get name() {
      const { accidental, letter } = this

      if (accidental) {
        return `${letter}${accidental}`
      }
      else {
        return letter
      }
    }

    /**
     * @property frequency Computed property. The frequency of the note in hertz. Calculated by
     * comparing western musical standards (a standard piano) and the note
     * identifier (i.e. `Ab1`). If this property is set directly, all other
     * properties are updated to reflect the provided frequency.
     */
    get frequency(): number {
      const { identifier } = this
      if (identifier) {
        return get(frequencyMap, identifier)
      }
      return 0
    }

    set frequency(value) {
      let key: AcceptableNote
      for (key in frequencyMap) {
        if (value === get(frequencyMap, key)) {
          this.identifier = key
        }
      }
    }

    /**
     * @property identifier Computed property. Value is `${letter}${octave}` or
     * `${letter}${accidental}${octave}` if accidental exists. If this property
     * is set directly, all other properties are updated to reflect the provided
     * identifier.
     */
    get identifier(): AcceptableNote {
      const { accidental, letter, octave } = this
      let output: AcceptableNote = 'A0'

      if (accidental) {
        output = `${letter}${accidental}${octave}` as AcceptableNote
      }
      else {
        output = `${letter}${octave}` as AcceptableNote
      }

      if (get(frequencyMap, output)) {
        return output
      }
      else {
        throw new Error(`Invalid musical identifier: ${output}`)
      }
    }

    set identifier(value: AcceptableNote) {
      const [letter] = value
      const octave = value[2] || value[1]
      let accidental

      if (value[2]) {
        accidental = value[1]
      }
      else {
        accidental = ''
      }
      this.letter = letter as NoteLetter
      this.accidental = accidental as Accidental
      this.octave = octave as Octave
    }
  }
}
