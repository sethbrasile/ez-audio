import {frequencyMap} from '../utils'

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
const MusicalIdentity = (superclass: any) => class extends superclass {
  /**
   * For note `Ab5`, this would be `A`.
   *
   * @public
   * @property letter
   * @type {string}
   */
  letter: string = ''

  /**
   * For note `Ab5`, this would be `b`.
   *
   * @public
   * @property accidental
   * @type {string}
   */
  accidental: string = ''

  /**
   * For note `Ab5`, this would be `5`.
   *
   * @public
   * @property octave
   * @type {string}
   */
  octave: string = ''

  /**
   * Computed property. Value is `${letter}` or `${letter}${accidental}` if
   * accidental exists.
   *
   * @public
   * @property name
   * @type {string}
   */
  get name() {
    const {accidental, letter} = this

    if (accidental) {
      return `${letter}${accidental}`;
    } else {
      return letter;
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
    const {identifier} = this
    if (identifier) {
      return frequencyMap[identifier]
    }
    return ''
  }
  set frequency(value) {
    for (let key in frequencyMap) {
      if (value === frequencyMap[key]) {
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
  get identifier() {
    const {accidental, letter, octave } = this
    let output

    if (accidental) {
      output = `${letter}${accidental}${octave}`
    } else {
      output = `${letter}${octave}`
    }

    return output
  }
  set identifier(value) {
    const [letter] = value
    const octave = value[2] || value[1]
    let accidental

    if (value[2]) {
      accidental = value[1]
    } else {
      accidental = ''
    }

    this.letter = letter
    this.accidental = accidental
    this.octave = octave
  }
}

export default MusicalIdentity
