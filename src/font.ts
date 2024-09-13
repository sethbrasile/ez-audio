import type { AcceptableNote } from './musical-identity'
import type { SampledNote } from './sampled-note'

/**
 * Allows multiple SampledNote instances to be loaded up and played via their
 * `identifier`.
 *
 * @public
 * @class Font
 */
export class Font {
  constructor(public notes: SampledNote[]) {}

  /**
   * Gets a note from `notes`, given it's identifier.
   *
   * @method getNote
   * @param {string} identifier The identifier for the note that should be
   * returned,
   * @return {SampledNote} The specified Note instance.
   */
  getNote(identifier: string): SampledNote | undefined {
    return this.notes.find(note => note.identifier === identifier)
  }

  /**
   * Plays a note from `notes`, given it's `identifier`.
   *
   * @method play
   * @param {string} identifier The identifier for the note that should be
   * played.
   */
  play(identifier: AcceptableNote): void {
    this.getNote(identifier)!.play()
  }
}
