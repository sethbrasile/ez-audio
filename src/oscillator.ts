import { GainControl } from './audio-service'

export class OscillatorControl {
  constructor(private oscillator: OscillatorNode) {}
  public onPlayRamp(param: string) {
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
}
