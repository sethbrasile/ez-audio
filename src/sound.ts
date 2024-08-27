import createTimeObject from '@utils/create-time-object'
import { GainControl } from './audio-service'
// TODO: add filters to sounds

/**
 * The Sound class provides the core functionality for
 * interacting with the Web Audio API's AudioContext, and is the base class for
 * all other {{#crossLinkModule "Audio"}}{{/crossLinkModule}} types. It prepares
 * an audio source, provides various methods for interacting with the audio source,
 * creates {{#crossLink "AudioNode"}}AudioNodes{{/crossLink}} from the
 * connections array, sets up the necessary connections/routing between them,
 * and provides some methods to {{#crossLink "Playable/play:method"}}{{/crossLink}}
 * and {{#crossLink "Sound/stop:method"}}{{/crossLink}} the audio source.
 *
 * @public
 * @class Sound
 * @uses Connectable
 * @uses Playable
 */
export class Sound {
  constructor(audioContext: AudioContext, opts: { audioBuffer: AudioBuffer }) {
    const bufferSource = audioContext.createBufferSource()
    const gainNode = audioContext.createGain()

    bufferSource.buffer = opts.audioBuffer

    bufferSource.connect(gainNode)
    gainNode.connect(audioContext.destination)

    this.gainNode = gainNode
    this.bufferSourceNode = bufferSource
  }

  private gainNode: GainNode
  private bufferSourceNode: AudioBufferSourceNode

  /**
   * The AudioBuffer instance that provides audio data to the bufferSource connection.
   *
   * @public
   * @property audioBuffer
   * @type {AudioBuffer}
   */

  play() {
    this.bufferSourceNode.start()
  }

  stop() {
    this.bufferSourceNode.stop()
  }

  /**
   * Computed property. Value is an object containing the duration of the
   * audioBuffer in three formats. The three formats
   * are `raw`, `string`, and `pojo`.
   *
   * Duration of 6 minutes would be output as:
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
   * @property duration
   */
  public get duration() {
    const buffer = this.bufferSourceNode.buffer
    if (buffer === null)
      return createTimeObject(0, 0, 0)
    const { duration } = buffer
    const min = Math.floor(duration / 60)
    const sec = duration % 60
    return createTimeObject(duration, min, sec)
  }

  getConnection(type: 'audioSource' | 'gain') {
    // if (type === 'audioSource') {
    //   return new BufferControl(this.bufferSourceNode)
    // }
    if (type === 'gain') {
      return new GainControl(this.gainNode)
    }
    else {
      throw new Error('Unsupported connection type')
    }
  }
}

// export class BufferControl {
//   constructor(private buffer: AudioBufferSourceNode) {}
//   public onPlayRamp(param: string) {
//     // const context = this.oscillator.context
//     return {
//       from: (startValue: number) => ({
//         to: (endValue: number) => ({
//           in: (duration: number) => {
//             // const currentTime = context.currentTime

//             // this.oscillator.frequency.exponentialRampToValueAtTime(endValue, currentTime + duration)
//           },
//         }),
//       }),
//     }
//   }
// }
