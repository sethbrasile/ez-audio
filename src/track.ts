import createTimeObject from '@utils/create-time-object'
import { Sound } from './sound'

/**
 * A class that represents a "track" of music, similar in concept to a track on
 * a CD or an MP3 player. Provides methods for tracking the play position of the
 * underlying {{#crossLink "AudioBuffer"}}{{/crossLink}}, and pausing/resuming.
 *
 * @public
 * @class Track
 * @extends Sound
 * @todo move play override to _play so that all super.play methods work
 */
export class Track extends Sound {
  /**
   * Value is an object containing the current play position
   * of the audioBuffer in three formats. The three
   * formats are `raw`, `string`, and `pojo`.
   *
   * Play position of 6 minutes would be output as:
   *
   *     {
   *       raw: 360, // seconds
   *       string: '06:00',
   *       pojo: {
   *         minutes: 6,
   *         seconds: 0
   *       }
   *     }
   *
   * @public
   * @property position
   * @type {object}
   */
  get position() {
    const offset = this.startOffset
    const min = Math.floor(offset / 60)
    const sec = offset - min * 60
    return createTimeObject(offset, min, sec)
  }

  /**
   * Value is the current play position of the
   * audioBuffer, formatted as a percentage.
   *
   * @public
   * @property percentPlayed
   * @type {number}
   */
  get percentPlayed() {
    const ratio = this.startOffset / this.duration.raw
    return ratio * 100
  }

  /**
   * Plays the audio source immediately.
   *
   * @public
   * @method play
   */
  play() {
    super.play()
    this.audioSourceNode.onended = () => this.stop()
    this._trackPlayPosition()
  }

  /**
   * Pauses the audio source by stopping without
   * setting startOffset back to 0.
   *
   * @public
   * @method pause
   */
  pause() {
    if (this._isPlaying) {
      const node = this.audioSourceNode
      node.onended = function () {}
      node.stop()
      this._isPlaying = false
    }
  }

  /**
   * Stops the audio source and sets
   * startOffset to 0.
   *
   * @public
   * @method stop
   */
  stop() {
    this.startOffset = 0

    if (this._isPlaying) {
      this.audioSourceNode.onended = function () {}
      super.stop()
    }
  }

  /**
   * Sets up a `requestAnimationFrame` based loop that updates the
   * startOffset as `audioContext.currentTime` grows.
   * Loop ends when `_isPlaying` is false.
   *
   * @method _trackPlayPosition
   * @private
   */
  private _trackPlayPosition() {
    const ctx = this.audioContext
    const startOffset = this.startOffset
    const startedPlayingAt = this._startedPlayingAt

    const animate = () => {
      if (this._isPlaying) {
        this.startOffset = startOffset + ctx.currentTime - startedPlayingAt
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }
}

export default Track
