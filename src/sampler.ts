import type { Sound } from './sound'

/**
 * An instance of the Sampler class behaves just like a Sound, but allows
 * many {{#crossLink "AudioBuffer"}}AudioBuffers{{/crossLink}} to exist and
 * automatically alternately plays them (round-robin) each time any of the play
 * methods are called.
 *
 * @public
 * @class Sampler
 *
 * @todo humanize gain and time - should be optional and customizable
 * @todo loop
 */
export class Sampler {
  constructor(sounds: Sound[]) {
    this.sounds = new Set<Sound>(sounds)
    this._soundIterator = sounds.values()
  }

  /**
   * @property gain
   * Determines the gain applied to each sample.
   */
  gain: number = 1

  /**
   * @property pan
   * Determines the stereo pan position of each sample.
   */
  pan: number = 0

  /**
   * @property _soundIterator
   * Temporary storage for the iterable that comes from the sounds Set.
   * This iterable is meant to be replaced with a new copy every time it reaches
   * it's end, resulting in an infinite stream of Sound instances.
   */
  private _soundIterator: Iterator<Sound>

  /**
   * @property sounds
   * Acts as a register for loaded audio sources. Audio sources can be anything
   * that uses {{#crossLink "Playable"}}{{/crossLink}}. If not set on
   * instantiation, automatically set to `new Set()` via `_initSounds`.
   */
  sounds: Set<Sound>

  /**
   * Gets the next audio source and plays it immediately.
   *
   * @public
   * @method play
   */
  play(): void {
    this._getNextSound().play()
  }

  /**
   * @method playIn
   * Gets the next Sound and plays it after the specified offset has elapsed.
   *
   * @param {number} _ Number of seconds from "now" that the next Sound
   * should be played.
   */
  playIn(_: number): void {
    // this._getNextSound().playIn(seconds)
  }

  /**
   * Gets the next Sound and plays it at the specified moment in time. A
   * "moment in time" is measured in seconds from the moment that the
   * {{#crossLink "AudioContext"}}{{/crossLink}} was instantiated.
   *
   * @param {number} time The moment in time (in seconds, relative to the
   * {{#crossLink "AudioContext"}}AudioContext's{{/crossLink}} "beginning of
   * time") when the next Sound should be played.
   *
   * @public
   * @method playAt
   */
  playAt(time: number): void {
    this._getNextSound().playAt(time)
  }

  /**
   * Gets _soundIterator and returns it's next value. If _soundIterator has
   * reached it's end, replaces _soundIterator with a fresh copy from sounds
   * and returns the first value from that.
   *
   * @private
   * @method _getNextSound
   * @return {Sound}
   */
  _getNextSound(): Sound {
    let soundIterator = this._soundIterator
    let nextSound

    nextSound = soundIterator.next()

    if (nextSound.done) {
      soundIterator = this.sounds.values()
      nextSound = soundIterator.next()
    }

    this._soundIterator = soundIterator

    return this._setGainAndPan(nextSound.value)
  }

  /**
   * Applies the `gain` and `pan` properties from the Sampler instance to a
   * Sound instance and returns the Sound instance.
   *
   * @private
   * @method _setGainAndPan
   * @return {Sound} The input sound after having it's gain and pan set
   */
  _setGainAndPan(sound: Sound): Sound {
    // sound.changeGainTo(this.gain).from('ratio')
    sound.changePanTo(this.pan)

    return sound
  }
}
