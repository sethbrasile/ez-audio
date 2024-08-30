import type Playable from '@interfaces/playable'
import { Oscillator, OscillatorAdjuster } from '@/oscillator'
import { Sound, SoundAdjuster } from '@/sound'
import type { OscillatorOptions } from '@/oscillator'

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

  // To suit loading animations while initializing the audio context
  public static async init(): Promise<AudioService> {
    const service = AudioService.instance
    await service.audioContext.resume()
    return service
  }

  public load(url: string) {
    return {
      asSound: async () => {
        const response = await fetch(url)
        const arrayBuffer = await response.arrayBuffer()
        const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer)
        return new Sound(this.audioContext, new SoundAdjuster(), audioBuffer)
      },
    }
  }

  public createOscillator(_: string, options?: OscillatorOptions): Playable {
    return new Oscillator(this.audioContext, new OscillatorAdjuster(), this.audioContext.createOscillator(), options || {})
  }

  public createWhiteNoise(): Playable {
    const audioContext = this.audioContext
    const bufferSize = audioContext.sampleRate
    const audioBuffer = audioContext.createBuffer(1, bufferSize, bufferSize)
    const output = audioBuffer.getChannelData(0)

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1
    }

    return new Sound(audioContext, new SoundAdjuster(), audioBuffer)
  }
}
