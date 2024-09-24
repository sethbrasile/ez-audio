import audioContextAwareTimeout from './utils/timeout'

/**
 * This class represents a single "beat" for a rhythmic instrument. An instance of this
 * class can be set to `active` or not to facilitate the way that most drum
 * machines work (when a beat is not `active`, the time that it occupies still
 * exists, but it does not cause audio to play, effectively resulting in a
 * "rest"). It provides properties that track when it is played, and when a "rest"
 * is played in it's place.
 *
 * This class does not have the ability to create audio on it's own and is
 * expected be a "child" of one of the Sound classes. See it's implementation in
 * {{#crossLink "BeatTrack"}}BeatTrack{{/crossLink}} for an example.
 *
 *     // Cannot play audio on it's own.
 *     // Must pass in parentPlay and/or parentPlayIn from a parent class.
 *     new Beat(audioContext, {
 *       parentPlayIn: parent.playIn.bind(parent),
 *       parentPlay: parent.play.bind(parent),
 *     };
 *
 * @class Beat
 * @todo add playAt
 */
export interface BeatOptions {
  duration?: number
  playIn: (time: number) => void
  play: () => void
  setTimeout?: (fn: () => void, delayMillis: number) => number
}

export class Beat {
  constructor(audioContext: AudioContext, opts: BeatOptions) {
    this.parentPlayIn = opts.playIn
    this.parentPlay = opts.play
    this.duration = opts.duration || 100

    if (opts.setTimeout) {
      this.setTimeout = opts.setTimeout
    }
    else {
      const { setTimeout } = audioContextAwareTimeout(audioContext)
      this.setTimeout = setTimeout
    }
  }

  private parentPlayIn: ((time: number) => void)
  private parentPlay: (() => void)
  private setTimeout: (fn: () => void, delayMillis: number) => number

  /**
   * @property active
   *
   * If `active` is `true`, all methods of play will cause this instance to play.
   * If `active` is `false`, the `playIfActive()` and `ifActivePlayIn()`
   * methods will treat this instance as a rest (a timed period of silence).
   */
  public active = false

  /**
   * @property currentTimeIsPlaying
   *
   * Whether a Beat instance is currently playing, considering both active and
   * inactive beats (rests). When switched to `true`, is automatically returned
   * to false after the time specified by the duration property.
   *
   * @default false
   */
  public currentTimeIsPlaying = false

  /**
   * @property isPlaying
   *
   * Whether a Beat instance is currently playing, considering only active beats.
   * When switched to `true`, is automatically returned to false after the time
   * specified by the duration property.
   *
   * @default false
   */
  public isPlaying = false

  /**
   * @property duration
   *
   * If specified, Determines length of time, in milliseconds, before isPlaying
   * and currentTimeIsPlaying are automatically switched back to false after
   * having been switched to true. 100ms is used by default.
   *
   * @default 100
   */
  public duration: number

  /**
   * @method playIn
   *
   * Calls it's parent's `playIn()` method directly to play the beat in
   * `${offset}` seconds.
   *
   * isPlaying and currentTimeIsPlaying are both marked true after the provided
   * offset has elapsed.
   *
   * @param {number} offset Number of seconds from "now" that the audio should
   * play.
   */
  public playIn(offset = 0): void {
    const msOffset = offset * 1000

    this.parentPlayIn(offset)

    this.setTimeout(() => {
      this.isPlaying = true
      this.currentTimeIsPlaying = true
    }, msOffset)
  }

  /**
   * @method ifActivePlayIn
   *
   * If the beat is marked `active`, calls it's parent's `playIn()` method
   * directly to play the beat in `${offset}` seconds.
   *
   * If active, `isPlaying` is marked true after the provided offset has elapsed.
   *
   * `currentTimeIsPlaying` is marked true after the provided offset has elapsed,
   * even if beat is not active.
   *
   * @param {number} offset Number of seconds from "now" that the audio should
   * play.
   */
  public ifActivePlayIn(offset = 0): void {
    const msOffset = offset * 1000

    if (this.active) {
      this.parentPlayIn(offset)
      this.setTimeout(() => this.markPlaying(), msOffset)
    }

    this.setTimeout(() => this.markCurrentTimePlaying(), msOffset)
  }

  /**
   * @method play
   *
   * Calls it's parent's `play()` method directly to play the beat immediately.
   *
   * `isPlaying` and `currentTimeIsPlaying` are both immediately marked true.
   */
  public play(): void {
    this.parentPlay()
    this.markPlaying()
    this.markCurrentTimePlaying()
  }

  /**
   * @method playIfActive
   *
   * If `active`, calls it's parent's `play()` method directly to play the beat
   * immediately.
   *
   * If `active`, `isPlaying` is immediately marked true.
   *
   * `currentTimeIsPlaying` is immediately marked true, even if beat is not `active`.
   */
  public playIfActive(): void {
    if (this.active) {
      this.parentPlay()
      this.markPlaying()
    }

    this.markCurrentTimePlaying()
  }

  /**
   * @method markPlaying
   *
   * Sets `isPlaying` to `true` and sets up a timer that sets `isPlaying` back
   * to false after `duration` has elapsed.
   */
  private markPlaying(): void {
    this.isPlaying = true
    this.setTimeout(() => this.isPlaying = false, this.duration)
  }

  /**
   * @method markCurrentTimePlaying
   *
   * Sets `currentTimeIsPlaying` to `true` and sets up a timer that sets
   * `currentTimeIsPlaying` back to false after `duration` has elapsed.
   */
  private markCurrentTimePlaying(): void {
    this.currentTimeIsPlaying = true
    this.setTimeout(() => this.currentTimeIsPlaying = false, this.duration)
  }
}

export default Beat
