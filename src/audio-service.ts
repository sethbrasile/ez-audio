import { Oscillator } from './oscillator'
import { Sound } from './sound'
import type { OscillatorOptions } from './oscillator'
import type { Player } from '@/players/player'

export default class AudioService {
  static #instance: AudioService
  public audioContext: AudioContext

  /**
   * Constructor is private to prevent direct construction calls with the `new` operator.
   */
  private constructor() {
    this.audioContext = new AudioContext()
  }

  /**
   * Provides access to the audio service singleton instance
   */
  public static get instance(): AudioService {
    if (!AudioService.#instance) {
      AudioService.#instance = new AudioService()
    }
    return AudioService.#instance
  }

  private _oscillators: Map<string, Oscillator> = new Map()

  public static async init(): Promise<AudioService> {
    const service = AudioService.instance
    // await service.audioContext.audioWorklet.addModule('worklet/oscillator.js')
    await service.audioContext.resume()
    return service
  }

  public createOscillator(name: string, options?: OscillatorOptions): Oscillator {
    const osc = new Oscillator(this.audioContext, options || {})
    this._oscillators.set(name, osc)
    return osc
  }

  public getOscillator(name: string) {
    return this._oscillators.get(name)
  }

  public createWhiteNoise(): Player {
    const audioContext = this.audioContext
    const bufferSize = audioContext.sampleRate
    const audioBuffer = audioContext.createBuffer(1, bufferSize, bufferSize)
    const output = audioBuffer.getChannelData(0)

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1
    }

    return new Sound(audioContext, { audioBuffer })
  }
}

export type ControllerType = 'frequency' | 'gain'

export interface ParameterController {
  /**
   * Allows an AudioNode's values to be set at a specific time
   * relative to the moment that it is played, every time it is played.
   *
   * Especially useful for creating/shaping an "envelope" (think "ADSR").
   *
   * @example
   *     // results in an oscillator that starts at 150Hz and quickly drops
   *     // down to 0.01Hz each time it's played
   *     const kick = audio.createOscillator({ name: 'kick' });
   *     const osc = kick.getConnection('audioSource');
   *
   *     osc.onPlaySet('frequency').to(150).at(0);
   *     osc.onPlaySet('frequency').to(0.01).at(0.1);
   *
   * @public
   * @method onPlaySet
   * @todo document 'exponential' and 'linear' options
   */
  onPlaySet: (type: ControllerType) => {
    to: (startValue: number) => {
      at: (time: number) => void
      endingAt: (duration: number) => void
    }
  }

  /**
   * Convenience method that uses
   * {{#crossLink "Connection/onPlaySet:method"}}{{/crossLink}} twice to set an
   * initial value, and a ramped value in succession.
   *
   * Especially useful for creating/shaping an "envelope" (think "ADSR").
   *
   * @example
   *     // results in an oscillator that starts at 150Hz and quickly drops
   *     // down to 0.01Hz each time it's played
   *     const kick = audio.createOscillator({ name: 'kick' });
   *     const osc = kick.getConnection('audioSource');
   *
   *     osc.onPlayRamp('frequency').from(150).to(0.01).in(0.1);
   *
   * @public
   * @method onPlayRamp
   */
  onPlayRamp: (type: ControllerType) => {
    from: (startValue: number) => {
      to: (endValue: number) => {
        in: (duration: number) => void
      }
    }
  }
}

export class GainControl implements ParameterController {
  constructor(private gainNode: GainNode) {}

  public onPlaySet() {
    return {
      to: (value: number) => {
        const currentTime = this.gainNode.context.currentTime
        const originalValue = this.gainNode.gain.value
        // this.gainNode.gain.setValueAtTime(value, currentTime)
        return {
          at: (time: number) => {
            this.gainNode.gain.setValueAtTime(originalValue, currentTime)
            this.gainNode.gain.setValueAtTime(value, currentTime + time)
          },
          endingAt: (duration: number) => {
            this.gainNode.gain.linearRampToValueAtTime(value, currentTime + duration)
          },
        }
      },
    }
  }

  public onPlayRamp() {
    return {
      from: (startValue: number) => ({
        to: (endValue: number) => ({
          in: (endTime: number) => {
            this.onPlaySet().to(startValue)
            this.onPlaySet().to(endValue).endingAt(endTime)
          },
        }),
      }),
    }
  }
}

export type ConnectionType = 'audioSource' | 'gain'
