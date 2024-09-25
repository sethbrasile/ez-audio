import type { TimeObject } from '@utils/create-time-object'
import createTimeObject from '@utils/create-time-object'
import { Sound } from './sound'
import type { SeekType } from './controllers/base-param-controller'
import withinRange from './utils/within-range'

/**
 * A class that represents a "track" of music, similar in concept to a track on
 * a CD or an MP3 player. Provides methods for tracking the play position of the
 * underlying {{#crossLink "AudioBuffer"}}{{/crossLink}}, and pausing/resuming.
 *
 * @class Track
 * @extends Sound
 * @todo move play override to _play so that all super.play methods work
 */
export class Track extends Sound {
  /**
   * @property position Value is an object containing the current play position
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
   */
  public get position(): TimeObject {
    const offset = this.startOffset
    const min = Math.floor(offset / 60)
    const sec = offset - min * 60
    return createTimeObject(offset, min, sec)
  }

  /**
   * @property percentPlayed
   * Value is the current play position of the
   * audioBuffer, formatted as a percentage.
   */
  public get percentPlayed(): number {
    const ratio = this.startOffset / this.duration.raw
    return ratio * 100
  }

  /**
   * @method play
   * Plays the audio source immediately.
   */
  public play(): void {
    super.play()
    this.audioSourceNode.onended = () => this.stop()
    this.later(this.trackPlayPosition.bind(this))
  }

  /**
   * @method pause
   * Pauses the audio source by stopping without
   * setting startOffset back to 0.
   */
  public pause(): void {
    if (this._isPlaying) {
      const node = this.audioSourceNode
      node.onended = function () {}
      node.stop()
      this._isPlaying = false
    }
  }

  /**
   * @method stop
   * Stops the audio source and sets
   * startOffset to 0.
   */
  public stop(): void {
    this.startOffset = 0

    if (this._isPlaying) {
      this.audioSourceNode.onended = function () {}
      super.stop()
    }
  }

  /**
   * @method trackPlayPosition
   * Sets up a `requestAnimationFrame` based loop that updates the
   * startOffset as `audioContext.currentTime` grows.
   * Loop ends when `_isPlaying` is false.
   */
  private trackPlayPosition(): void {
    const { audioContext, startedPlayingAt, startOffset } = this

    const animate = (): void => {
      if (this._isPlaying) {
        this.startOffset = startOffset + audioContext.currentTime - startedPlayingAt
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }

  /**
   * Gets the bufferSource and stops the initAudio,
   * changes it's play position, and restarts the audio.
   *
   * returns a pojo with the `from` method that `value` is curried to, allowing
   * one to specify which type of value is being provided.
   *
   * @example
   *     // for a Sound instance with a duration of 100 seconds, these will all
   *     // move the play position to 90 seconds.
   *     soundInstance.seek(0.9).from('ratio');
   *     soundInstance.seek(0.1).from('inverseRatio')
   *     soundInstance.seek(90).from('percent');
   *     soundInstance.seek(90).from('seconds');
   *
   * @param {number} amount The new play position value.
   */
  public seek(amount: number): { from: (type: SeekType) => void } {
    const duration = this.duration.raw
    const moveToOffset = (offset: number): void => {
      const _isPlaying = this._isPlaying
      const adjustedOffset = withinRange(offset, 0, duration)

      if (_isPlaying) {
        this.stop()
        this.startOffset = adjustedOffset
        this.later(() => this.play())
      }
      else {
        this.startOffset = adjustedOffset
      }
    }

    return {
      from(type: SeekType) {
        switch (type) {
          case 'ratio':
            moveToOffset(amount * duration)
            break
          case 'percent':
            moveToOffset(amount * duration * 0.01)
            break
          case 'inverseRatio':
            moveToOffset(duration - amount * duration)
            break
          case 'seconds':
            moveToOffset(amount)
            break
        }
      },
    }
  }
}

export default Track
