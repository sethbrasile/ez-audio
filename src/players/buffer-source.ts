import createTimeObject from '@utils/create-time-object'
import customTimeout from '@utils/timeout'
import type { ConnectionType, ParameterController } from '@/audio-service'
import { GainControl } from '@/audio-service'

export default class BufferSourcePlayer {
  private gainNode: GainNode
  private bufferSourceNode: AudioBufferSourceNode
  private audioContext: AudioContext
  private _isPlaying: boolean = false

  constructor(audioContext: AudioContext, audioBuffer: AudioBuffer) {
    const bufferSource = audioContext.createBufferSource()
    const gainNode = audioContext.createGain()

    bufferSource.buffer = audioBuffer

    bufferSource.connect(gainNode)
    gainNode.connect(audioContext.destination)

    this.gainNode = gainNode
    this.bufferSourceNode = bufferSource
    this.audioContext = audioContext
  }

  get isPlaying() {
    return this._isPlaying
  }

  play() {
    const { duration } = this
    const { setTimeout } = customTimeout(this.audioContext)

    // schedule _isPlaying to false after duration
    setTimeout(() => this._isPlaying = false, duration.pojo.seconds * 1000)

    this.bufferSourceNode.start()
    this._isPlaying = true
  }

  stop() {
    this.bufferSourceNode.stop()
    this._isPlaying = false
  }

  public getConnection(type: ConnectionType): ParameterController {
    switch (type) {
      // case 'audioSource':
      //   return new BufferControl(this.bufferSourceNode)
      case 'gain':
        return new GainControl(this.gainNode)
      default:
        throw new Error('Unsupported connection type')
    }
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
