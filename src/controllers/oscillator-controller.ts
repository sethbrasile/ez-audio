import type { ControlType, ParamController, ParamValue, ValueAtTime } from './base-param-controller'
import { BaseParamController } from './base-param-controller'

export class OscillatorController extends BaseParamController implements ParamController {
  constructor(private oscillator: OscillatorNode, protected gainNode: GainNode, protected pannerNode: StereoPannerNode) {
    super(oscillator, gainNode, pannerNode)
  }

  public updateAudioSource(oscillator: OscillatorNode): void {
    this.oscillator = oscillator
  }

  protected _update(type: ControlType, value: number): void {
    switch (type) {
      case 'frequency':
        this.oscillator.frequency.value = value
        break
      default:
        super._update(type, value)
    }
  }

  public setValuesAtTimes(): void {
    const { oscillator: { context: { currentTime } } } = this
    this.applyValues(this.startingValues, currentTime)
    this.applyValues(this.valuesAtTime, currentTime)
    this.applyRampValues(this.exponentialValues, currentTime, 'exponential')
    this.applyRampValues(this.linearValues, currentTime, 'linear')
  }

  private applyValues(values: ParamValue[], currentTime: number): void {
    const { oscillator, gainNode } = this
    values.forEach((item) => {
      switch (item.type) {
        case 'frequency':
          oscillator.frequency.setValueAtTime(item.value, currentTime)
          break
        case 'gain':
          gainNode.gain.setValueAtTime(item.value, currentTime)
          break
        default:
          throw new Error(`Unsupported control type: ${item.type}`)
      }
    })
  }

  private applyRampValues(values: ValueAtTime[], currentTime: number, rampType: 'exponential' | 'linear'): void {
    const { oscillator, gainNode } = this
    values.forEach((item) => {
      const time = currentTime + item.time
      switch (item.type) {
        case 'frequency':
          switch (rampType) {
            case 'exponential':
              oscillator.frequency.exponentialRampToValueAtTime(item.value, time)
              break
            case 'linear':
              oscillator.frequency.linearRampToValueAtTime(item.value, time)
              break
            default:
              throw new Error(`Unsupported ramp type: ${rampType}`)
          }
          break
        case 'gain':
          switch (rampType) {
            case 'exponential':
              gainNode.gain.exponentialRampToValueAtTime(item.value, time)
              break
            case 'linear':
              gainNode.gain.linearRampToValueAtTime(item.value, time)
              break
            default:
              throw new Error(`Unsupported ramp type: ${rampType}`)
          }
          break
        default:
          throw new Error(`ControlType of ${item.type} not supported`)
      }
    })
  }
}
