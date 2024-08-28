import { Oscillator } from './oscillator'
import { Sound } from './sound'
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

  public createOscillator(name: string, options?: OscillatorOptions): Player {
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

export interface ParameterController {
  onPlayRamp: (param: string) => {
    from: (startValue: number) => {
      to: (endValue: number) => {
        in: (duration: number) => void
      }
    }
  }
}

export class GainControl {
  constructor(private gainNode: GainNode) {}

  // TODO: gaincontrol only ramps gain so no longer need param
  public onPlayRamp(_: string) {
    const context = this.gainNode.context
    return {
      from: (startValue: number) => ({
        to: (endValue: number) => ({
          in: (duration: number) => {
            const currentTime = context.currentTime
            this.gainNode.gain.setValueAtTime(startValue, currentTime)
            this.gainNode.gain.exponentialRampToValueAtTime(endValue, currentTime + duration)
          },
        }),
      }),
    }
  }
}

export type ConnectionType = 'audioSource' | 'gain'
