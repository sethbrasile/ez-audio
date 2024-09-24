import type { Connectable } from './interfaces/connectable'
import type { Playable } from './interfaces/playable'

export interface SamplerOptions {
  name?: string
}

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
  constructor(sounds: (Playable & Connectable)[], opts?: SamplerOptions) {
    this.sounds = new Set<Playable & Connectable>(sounds)
    this.soundIterator = sounds.values()
    this.name = opts?.name || ''
  }

  /**
   * @property name
   * Optional property which serves to aid in identification
   */
  public name: string

  /**
   * @property gain
   * Determines the gain applied to each sample.
   */
  public gain: number = 1

  /**
   * @property pan
   * Determines the stereo pan position of each sample.
   */
  public pan: number = 0

  /**
   * @property soundIterator
   * Temporary storage for the iterable that comes from the sounds Set.
   * This iterable is meant to be replaced with a new copy every time it reaches
   * it's end, resulting in an infinite stream of Sound instances.
   */
  private soundIterator: Iterator<Playable & Connectable>

  /**
   * @property sounds
   * Acts as a register for loaded audio sources. Audio sources can be anything
   * that uses {{#crossLink "Playable"}}{{/crossLink}}. If not set on
   * instantiation, automatically set to `new Set()` via `_initSounds`.
   */
  private sounds: Set<Playable & Connectable>

  /**
   * @method play
   * Gets the next audio source and plays it immediately.
   */
  public play(): void {
    this.getNextSound().play()
  }

  /**
   * @method playIn
   * Gets the next Sound and plays it after the specified offset has elapsed.
   *
   * @param {number} seconds Number of seconds from "now" that the next Sound
   * should be played.
   */
  public playIn(seconds: number): void {
    this.getNextSound().playIn(seconds)
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
   * @method playAt
   */
  public playAt(time: number): void {
    this.getNextSound().playAt(time)
  }

  /**
   * Gets soundIterator and returns it's next value. If soundIterator has
   * reached it's end, replaces soundIterator with a fresh copy from sounds
   * and returns the first value from that.
   *
   * @method getNextSound
   */
  private getNextSound(): Playable & Connectable {
    let soundIterator = this.soundIterator
    let nextSound

    nextSound = soundIterator.next()

    if (nextSound.done) {
      soundIterator = this.sounds.values()
      nextSound = soundIterator.next()
    }

    this.soundIterator = soundIterator

    return this.setGainAndPan(nextSound.value)
  }

  /**
   * Applies the `gain` and `pan` properties from the Sampler instance to a
   * Sound instance and returns the Sound instance.
   *
   * @method setGainAndPan
   */
  private setGainAndPan(sound: Playable & Connectable): Playable & Connectable {
    sound.changeGainTo(this.gain)
    sound.changePanTo(this.pan)

    return sound
  }
}
