import createTimeObject from './utils/create-time-object'
import { GainControl } from '@/audio-service'

// TODO: consider if we need the "player" concept or if it will always just be a pass through..
// Maybe "player" is just an interface
export class OscillatorControl {
  // TODO: oscillatorControl only ramps frequency so no longer need param
  // TODO: implement more controls
  constructor(private oscillator: OscillatorNode) {}
  public onPlayRamp(_: string) {
    const context = this.oscillator.context
    return {
      from: (startValue: number) => ({
        to: (endValue: number) => ({
          in: (duration: number) => {
            const currentTime = context.currentTime
            this.oscillator.frequency.setValueAtTime(startValue, currentTime)
            this.oscillator.frequency.exponentialRampToValueAtTime(endValue, currentTime + duration)
          },
        }),
      }),
    }
  }
}

export class Oscillator {
  constructor(audioContext: AudioContext, options: OscillatorOptions) {
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.type = options.type || 'sine'
    oscillator.frequency.setValueAtTime(options.frequency || 440, audioContext.currentTime)

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    this.oscillator = oscillator
    this.gainNode = gainNode
  }

  private oscillator: OscillatorNode
  private gainNode: GainNode

  public getConnection(type: 'audioSource' | 'gain') {
    if (type === 'audioSource') {
      return new OscillatorControl(this.oscillator)
    }
    else if (type === 'gain') {
      return new GainControl(this.gainNode)
    }
    else {
      throw new Error('Unsupported connection type')
    }
  }

  play() {
    this.oscillator.start()
  }

  stop() {
    this.oscillator.stop()
  }

  // TODO: implement isPlaying and duration
  isPlaying = false
  get duration() {
    return createTimeObject(0, 0, 0)
  }
}
