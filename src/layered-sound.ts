import type { Playable } from '@interfaces/playable'

/**
 * Allows multiple instances of anything that implements
 * {{#crossLink "Playable"}}{{/crossLink}} to be loaded up and played at the
 * same time.
 *
 * @public
 * @class LayeredSound
 */
export class LayeredSound {
  constructor(sounds: Playable[] = []) {
    this.sounds = sounds
  }

  /**
   * Acts as a register for different types of sounds. Anything that uses
   * {{#crossLink "Playable"}}{{/crossLink}} can be added to this register.
   * If not set on instantiation, set to `A()` via `_initSounds`.
   */
  sounds: Playable[]

  /**
   * Maps through objects in `sounds` and calls `play` on each
   *
   * @method play
   */
  play(): void {
    this.sounds.map(sound => sound.play())
  }

  playFor(seconds: number): void {
    this.sounds.map(sound => sound.playFor(seconds))
  }

  // /**
  //  * Maps through objects in `sounds` and calls `playAt` on each, passing
  //  * through the `time` param to each sound.
  //  *
  //  * @param time The time to pass to each object's `playAt` method.
  //  */
  // playAt(time: number) {
  //   this.sounds.map(sound => sound.playAt(time))
  // }

  // /**
  //  * Maps through objects in `sounds` and calls `playIn` on each, passing
  //  * through the `seconds` param to each sound.
  //  *
  //  * @param seconds The seconds to pass to each object's `playIn` method.
  //  */
  // playIn(seconds: number) {
  //   this.sounds.map(sound => sound.playIn(seconds))
  // }

  // /**
  //  * Maps through objects in `sounds` and calls `playFor` on each, passing
  //  * through the `seconds` param to each sound.
  //  *
  //  * @param seconds The seconds to pass to each object's `playFor` method.
  //  */
  // playFor(seconds: number) {
  //   this.sounds.map(sound => sound.playFor(seconds))
  // }

  // /**
  //  * Maps through objects in `sounds` and calls `playInAndStopAfter` on each,
  //  * passing through the `playIn` and `stopAfter` params to each sound.
  //  *
  //  * @param playIn Seconds to pass to each object's
  //  * `playInAndStopAfter` method.
  //  *
  //  * @param stopAfter Seconds to pass to each object's
  //  * `playInAndStopAfter` method.
  //  */
  // playInAndStopAfter(playIn: number, stopAfter: number) {
  //   this.sounds.map(sound => sound.playInAndStopAfter(playIn, stopAfter))
  // }
}
