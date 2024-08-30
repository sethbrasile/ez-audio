import { frequencyMap, get } from '../utils'

type Letter = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G'
type Accidental = '' | 'b' | '#'
type Octave = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8'
type AcceptableNote = keyof typeof frequencyMap

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
 * @public
 * @class MusicalIdentity
 */
export default class MusicalIdentity {
  /**
   * For note `Ab5`, this would be `A`.
   *
   * @public
   * @property letter
   * @type {string}
   */
  letter: Letter = 'A'

  /**
   * For note `Ab5`, this would be `b`.
   *
   * @public
   * @property accidental
   * @type {string}
   */
  accidental: Accidental = ''

  /**
   * For note `Ab5`, this would be `5`.
   *
   * @public
   * @property octave
   * @type {string}
   */
  octave: Octave = '0'

  /**
   * Computed property. Value is `${letter}` or `${letter}${accidental}` if
   * accidental exists.
   *
   * @public
   * @property name
   * @type {string}
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
   * Computed property. The frequency of the note in hertz. Calculated by
   * comparing western musical standards (a standard piano) and the note
   * identifier (i.e. `Ab1`). If this property is set directly, all other
   * properties are updated to reflect the provided frequency.
   *
   * @public
   * @property frequency
   * @type {number}
   */
  get frequency() {
    const { identifier } = this
    if (identifier) {
      return get(frequencyMap, identifier)
    }
    return ''
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
   * Computed property. Value is `${letter}${octave}` or
   * `${letter}${accidental}${octave}` if accidental exists. If this property
   * is set directly, all other properties are updated to reflect the provided
   * identifier.
   *
   * @public
   * @property identifier
   * @type {string}
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

    this.letter = letter as Letter
    this.accidental = accidental as Accidental
    this.octave = octave as Octave
  }
}
