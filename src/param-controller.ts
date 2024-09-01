export type ControlType = 'frequency' | 'gain' | 'detune'
export type RampType = 'linear' | 'exponential'
export interface ParamValue {
  type: ControlType
  value: number
}
export interface ValueAtTime extends ParamValue {
  time: number
}
export interface ParamController {
  setValuesAtTimes: () => void
  updateAudioSource: (source: any) => void
  updateGainNode: (gainNode: GainNode) => void
  update: (type: ControlType) => any
  onPlaySet: (type: ControlType) => {
    to: (value: number) => {
      at: (time: number) => void
      endingAt: (time: number, rampType?: RampType) => void
    }
  }
  onPlayRamp: (type: ControlType, rampType?: RampType) => {
    from: (startValue: number) => {
      to: (endValue: number) => {
        in: (endTime: number) => void
      }
    }
  }
}

interface AudioSource {
  detune: {
    value: number
  }
  frequency?: {
    value: number
  }
  // Add other properties as needed
}

export class BaseParamController {
  constructor(protected audioSource: AudioSource, protected gainNode: GainNode) {}

  protected startingValues: ParamValue[] = []
  protected valuesAtTime: ValueAtTime[] = []
  protected exponentialValues: ValueAtTime[] = []
  protected linearValues: ValueAtTime[] = []

  public updateGainNode(gainNode: GainNode) {
    this.gainNode = gainNode
  }

  protected _update(type: ControlType, value: number) {
    switch (type) {
      case 'gain':
        this.gainNode.gain.value = value
        break
      case 'detune':
        if (!this.audioSource.detune)
          throw new Error('Audio source does not support detune')
        this.audioSource.detune.value = value
        break
      default:
        throw new Error(`Control type '${type}' not supported`)
    }
  }

  public update(type: ControlType) {
    return {
      to: (value: number) => {
        return {
          from: (method: 'ratio' | 'inverseRatio' | 'percent') => {
            switch (method) {
              case 'ratio':
                this._update(type, value)
                break
              case 'inverseRatio':
                this._update(type, 1 - value)
                break
              case 'percent':
                this._update(type, value / 100)
                break
              default:
                throw new Error(`Control method '${method}' not supported`)
            }
          },
        }
      },
    }
  }

  public onPlaySet(type: ControlType) {
    return {
      to: (value: number) => {
        const paramValue: ParamValue = { type, value }
        this.startingValues.push(paramValue)
        return {
          at: (time: number) => {
            this.removeStartingValue(paramValue)
            this.valuesAtTime.push({ ...paramValue, time })
          },
          endingAt: (time: number, rampType: RampType = 'exponential') => {
            this.removeStartingValue(paramValue)
            this.addRampValue({ ...paramValue, time }, rampType)
          },
        }
      },
    }
  }

  public onPlayRamp(type: ControlType, rampType?: RampType) {
    return {
      from: (startValue: number) => {
        return {
          to: (endValue: number) => {
            return {
              in: (endTime: number) => {
                this.onPlaySet(type).to(startValue)
                this.onPlaySet(type).to(endValue).endingAt(endTime, rampType)
              },
            }
          },
        }
      },
    }
  }

  private removeStartingValue(startValue: ParamValue) {
    this.startingValues = this.startingValues.filter(item => item !== startValue)
  }

  private addRampValue(valueAtTime: ValueAtTime, rampType: RampType) {
    switch (rampType) {
      case 'exponential':
        this.exponentialValues.push(valueAtTime)
        break
      case 'linear':
        this.linearValues.push(valueAtTime)
        break
      default:
        throw new Error(`Unsupported ramp type: ${rampType}`)
    }
  }
}
