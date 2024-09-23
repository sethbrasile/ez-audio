import { Beat } from './beat'
import type { Connectable } from './interfaces/connectable'
import type { Playable } from './interfaces/playable'
import { Sampler } from './sampler'

const beatBank = new WeakMap()

/**
 * An instance of this class has an array of "sounds" (comprised of one or multiple
 * audio sources, if multiple are provided, they are played in a round-robin fashion)
 * and provides methods to play that sound repeatedly, mixed with "rests," in a
 * rhythmic way. An instance of this class behaves very similarly to a "lane" on a drum machine.
 *
 * @class BeatTrack
 * @extends Sampler
 *
 * @todo need a way to stop a BeatTrack once it's started. Maybe by creating
 * the times in advance and not calling play until it's the next beat in the
 * queue?
 */
export class BeatTrack extends Sampler {
  constructor(private audioContext: AudioContext, sounds: (Playable & Connectable)[], opts?: { numBeats?: number, duration?: number }) {
    super(sounds)
    if (opts?.numBeats) {
      this.numBeats = opts.numBeats
    }
    if (opts?.duration) {
      this.duration = opts.duration
    }
  }

  /**
   * @property numBeats
   *
   * Determines the number of beats in a BeatTrack instance.
   */
  public numBeats = 4

  /**
   * @property duration
   *
   * If specified, Determines length of time, in milliseconds, before isPlaying
   * and currentTimeIsPlaying are automatically switched back to false after
   * having been switched to true for each beat. 100ms is used by default.
   *
   * @default 100
   */
  public duration = 100

  /**
   * @property beats
   *
   * Computed property. An array of Beat instances. The number of Beat instances
   * in the array is always the same as the `numBeats` property. If 'numBeats'
   * or duration changes. This property will be recomputed, but any beats that
   * previously existed are reused so that they will maintain their `active`
   * state.
   */
  public get beats(): Beat[] {
    let beats = []
    let numBeats = this.numBeats
    let existingBeats

    if (beatBank.has(this)) {
      existingBeats = beatBank.get(this)
      numBeats = numBeats - existingBeats.length
    }

    for (let i = 0; i < numBeats; i++) {
      const beat = new Beat(this.audioContext, {
        duration: this.duration,
        playIn: this.playIn.bind(this),
        play: this.play.bind(this),
      })

      beats.push(beat)
    }

    if (existingBeats) {
      beats = existingBeats.concat(beats)
    }

    beatBank.set(this, beats)

    return beats
  }

  /**
   * @method playBeats
   *
   * Calls play on all Beat instances in the beats array.
   *
   * @param {number} bpm The tempo at which the beats should be played.
   * @param noteType {number} The (rhythmic) length of each beat. Fractions
   * are suggested here so that it's easy to reason about. For example, for
   * eighth notes, pass in `1/8`.
   */
  public playBeats(bpm: number, noteType: number): void {
    this.callPlayMethodOnBeats('playIn', bpm, noteType)
  }

  /**
   * @method playActiveBeats
   *
   * Calls play on `active` Beat instances in the beats array. Any beat that
   * is not marked active is effectively a "rest".
   *
   * @param {number} bpm The tempo at which the beats and rests should be played.
   * @param noteType {number} The (rhythmic) length of each beat/rest. Fractions
   * are suggested here so that it's easy to reason about. For example, for
   * eighth notes, pass in `1/8`.
   */
  public playActiveBeats(bpm: number, noteType: number): void {
    this.callPlayMethodOnBeats('ifActivePlayIn', bpm, noteType)
  }

  /**
   * @method callPlayMethodOnBeats
   *
   * The underlying method behind playBeats and playActiveBeats.
   *
   * @param {string} method The method that should be called on each beat.
   * @param {number} bpm The tempo that should be used to calculate the length
   * of a beat/rest.
   * @param noteType {number} The (rhythmic) length of each beat/rest that should
   * be used to calculate the length of a beat/rest in seconds.
   */
  private callPlayMethodOnBeats(method: 'ifActivePlayIn' | 'playIn', bpm: number, noteType: number = 1 / 4): void {
    // http://bradthemad.org/guitar/tempo_explanation.php
    const duration = (240 * noteType) / bpm
    this.beats.forEach((beat, idx) => beat[method](idx * duration))
  }
}
