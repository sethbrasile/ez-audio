import type Playable from './interfaces/playable'
import type { AcceptableNote, IMusicallyAware } from './musical-identity'

/**
 * Allows multiple SampledNote instances to be loaded up and played via their
 * `identifier`.
 *
 * @public
 * @class Font
 */
export class Font {
  constructor(public notes: (IMusicallyAware & Playable)[]) {}

  /**
   * Gets a note from `notes`, given it's identifier.
   *
   * @method getNote
   * @param {string} identifier The identifier for the note that should be
   * returned,
   * @return {SampledNote} The specified Note instance.
   */
  getNote(identifier: string) {
    return this.notes.find(note => note.identifier === identifier)
  }

  /**
   * Plays a note from `notes`, given it's `identifier`.
   *
   * @method play
   * @param {string} identifier The identifier for the note that should be
   * played.
   */
  play(identifier: AcceptableNote) {
    this.getNote(identifier)!.play()
  }
}
