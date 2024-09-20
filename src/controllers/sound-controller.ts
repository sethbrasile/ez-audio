import { BaseParamController } from './base-param-controller'
import type { ParamController, ParamValue, ValueAtTime } from './base-param-controller'

export class SoundController extends BaseParamController implements ParamController {
  constructor(private bufferSourceNode: AudioBufferSourceNode, protected gainNode: GainNode, protected pannerNode: StereoPannerNode) {
    super(bufferSourceNode, gainNode, pannerNode)
  }

  public updateAudioSource(source: AudioBufferSourceNode): void {
    this.bufferSourceNode = source
  }

  public setValuesAtTimes(): void {
    const { bufferSourceNode } = this
    const currentTime = bufferSourceNode.context.currentTime

    this.applyValues(this.startingValues, currentTime)
    this.applyValues(this.valuesAtTime, currentTime)
    this.applyRampValues(this.exponentialValues, currentTime, 'exponential')
    this.applyRampValues(this.linearValues, currentTime, 'linear')
  }

  private applyValues(values: ParamValue[], currentTime: number): void {
    values.forEach((item) => {
      switch (item.type) {
        case 'detune':
          this.bufferSourceNode.detune.setValueAtTime(item.value, currentTime)
          break
        case 'gain':
          this.gainNode.gain.setValueAtTime(item.value, currentTime)
          break
        default:
          throw new Error(`Unsupported control type: ${item.type}`)
      }
    })
  }

  private applyRampValues(values: ValueAtTime[], currentTime: number, rampType: 'exponential' | 'linear'): void {
    values.forEach((item) => {
      const time = currentTime + item.time
      switch (item.type) {
        case 'detune':
          switch (rampType) {
            case 'exponential':
              this.bufferSourceNode.detune.exponentialRampToValueAtTime(item.value, time)
              break
            case 'linear':
              this.bufferSourceNode.detune.linearRampToValueAtTime(item.value, time)
              break
            default:
              throw new Error(`Unsupported ramp type: ${rampType}`)
          }
          break
        case 'gain':
          switch (rampType) {
            case 'exponential':
              this.gainNode.gain.exponentialRampToValueAtTime(item.value, time)
              break
            case 'linear':
              this.gainNode.gain.linearRampToValueAtTime(item.value, time)
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
