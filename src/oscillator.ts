import { get } from '@utils/prop-access'
import createTimeObject from './utils/create-time-object'
import type { ControllerType, ParameterController } from '@/audio-service'

class SetFrequencyController {
  private value: number | undefined
  private originalStartValue: number | undefined
  constructor(private oscillator: OscillatorNode) {}

  public at(time: number) {
    // turns out we didn't want to set the value at the current time after all
    this.oscillator.frequency.setValueAtTime(this.originalStartValue!, this.oscillator.context.currentTime)
    // instead we're going to set the value in the future
    this.oscillator.frequency.setValueAtTime(this.value!, time)
    return this
  }

  public to(value: number) {
    // stash the original start value so we can reset it later if one of the other methods is called
    this.originalStartValue = this.oscillator.frequency.value
    this.value = value
    // set the value at the current time in case none of the other methods is called
    this.oscillator.frequency.setValueAtTime(value, this.oscillator.context.currentTime)
    return this
  }

  public endingAt(endTime: number, type: 'exponential' | 'linear' = 'exponential') {
    // turns out we didn't want to set the value at the current time after all
    this.oscillator.frequency.setValueAtTime(this.originalStartValue!, this.oscillator.context.currentTime)
    // instead we're going to set the value in the future
    switch (type) {
      case 'exponential':
        this.oscillator.frequency.exponentialRampToValueAtTime(this.value!, endTime)
        break
      case 'linear':
        this.oscillator.frequency.linearRampToValueAtTime(this.value!, endTime)
        break
    }
    return this
  }
}

class SetGainController {
  private value: number | undefined
  private originalStartValue: number | undefined
  constructor(private gainNode: GainNode) {}

  public at(time: number) {
    // turns out we didn't want to set the value at the current time after all
    this.gainNode.gain.setValueAtTime(this.originalStartValue!, this.gainNode.context.currentTime)
    // instead we're going to set the value in the future
    this.gainNode.gain.setValueAtTime(this.value!, time)
    return this
  }

  public to(value: number) {
    // stash the original start value so we can reset it later if one of the other methods is called
    this.originalStartValue = this.gainNode.gain.value
    this.value = value
    // set the value at the current time in case none of the other methods is called
    this.gainNode.gain.setValueAtTime(value, this.gainNode.context.currentTime)
    return this
  }

  public endingAt(endTime: number, type: 'exponential' | 'linear' = 'exponential') {
    // turns out we didn't want to set the value at the current time after all
    this.gainNode.gain.setValueAtTime(this.originalStartValue!, this.gainNode.context.currentTime)
    // instead we're going to set the value in the future
    switch (type) {
      case 'exponential':
        this.gainNode.gain.exponentialRampToValueAtTime(this.value!, endTime)
        break
      case 'linear':
        this.gainNode.gain.linearRampToValueAtTime(this.value!, endTime)
        break
    }
    return this
  }
}

// TODO: consider if we need the "player" concept or if it will always just be a pass through..
// Maybe "player" is just an interface
export class OscillatorControl implements ParameterController {
  // TODO: implement more controls
  constructor(private oscillator: OscillatorNode, private gainNode: GainNode) {}

  public onPlaySet(type: ControllerType) {
    switch (type) {
      case 'frequency':
        return new SetFrequencyController(this.oscillator)
      case 'gain':
        return new SetGainController(this.gainNode)
      default:
        throw new Error(`Invalid parameter: unsupported controller type '${type}'`)
    }
  }

  public onPlayRamp(type: ControllerType) {
    return {
      from: (startValue: number) => ({
        to: (endValue: number) => ({
          in: (endTime: number) => {
            this.onPlaySet(type).to(startValue)
            this.onPlaySet(type).to(endValue).endingAt(endTime)
          },
        }),
      }
      ),
    }
  }
}

export interface OscillatorOptionsFilterValues {
  frequency?: number
  q?: number
}

export interface OscillatorOptions {
  startOffset?: number
  frequency?: number
  detune?: number
  type?: OscillatorType
  highpass?: OscillatorOptionsFilterValues
  bandpass?: OscillatorOptionsFilterValues
  lowpass?: OscillatorOptionsFilterValues
  lowshelf?: OscillatorOptionsFilterValues
  highshelf?: OscillatorOptionsFilterValues
  peaking?: OscillatorOptionsFilterValues
  notch?: OscillatorOptionsFilterValues
  allpass?: OscillatorOptionsFilterValues
}

const FILTERS = [
  'highpass',
  'bandpass',
  'lowpass',
  'lowshelf',
  'highshelf',
  'peaking',
  'notch',
  'allpass',
]

function removeItem<T>(arr: T[], value: T) {
  const index = arr.indexOf(value)
  if (index > -1) {
    arr.splice(index, 1)
  }
  return arr
}

export class Oscillator {
  constructor(audioContext: AudioContext, options: OscillatorOptions) {
    this.audioContext = audioContext
    this.type = options.type || 'sine'
    this.frequency = options.frequency || 440
    this.oscillator = audioContext.createOscillator()
    this.gainNode = audioContext.createGain()

    FILTERS.forEach((filter) => {
      const vals = get<OscillatorOptionsFilterValues | undefined>(options, filter)
      if (vals) {
        const filterNode = audioContext.createBiquadFilter()
        filterNode.type = filter as any
        filterNode.frequency.setValueAtTime(vals.frequency || 440, audioContext.currentTime)
        filterNode.Q.setValueAtTime(vals.q || 1, audioContext.currentTime)
        this.filters.push(filterNode)
      }
    })
  }

  onPlaySet(type: string) {
    return {
      to: (value: number) => {
        const startValue = { type, value }
        this.startingValues.push(startValue)
        return {
          at: (time: number) => {
            removeItem(this.startingValues, startValue)
            this.valuesAtTime.push(Object.assign(startValue, { time }))
          },
          endingAt: (time: number, type: 'exponential' | 'linear' = 'exponential') => {
            removeItem(this.startingValues, startValue)
            switch (type) {
              case 'exponential':
                this.exponentialValues.push(Object.assign(startValue, { time }))
                break
              case 'linear':
                this.linearValues.push(Object.assign(startValue, { time }))
                break
              default:
                throw new Error(`Unsupported control type: ${type}`)
            }
          },
        }
      },
    }
  }

  onPlayRamp(type: string) {
    return {
      from: (startValue: number) => {
        return {
          to: (endValue: number) => {
            return {
              in: (endTime: number) => {
                this.onPlaySet(type).to(startValue)
                this.onPlaySet(type).to(endValue).endingAt(endTime)
              },
            }
          },
        }
      },
    }
  }

  public wireConnections() {
    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()
    oscillator.type = this.type || 'sine'
    oscillator.frequency.setValueAtTime(this.frequency || 440, this.audioContext.currentTime)

    this.oscillator = oscillator
    this.gainNode = gainNode
    this.connections = [oscillator]

    const nodes = this.connections.concat(this.filters)
    const lastNode = nodes[nodes.length - 1]

    // Connect all the nodes together
    nodes.forEach((node, i, nodes) => {
      if (i > 0) {
        nodes[i - 1].connect(node)
      }
    })

    lastNode.connect(gainNode)
    gainNode.connect(this.audioContext.destination)
    this.setValuesAtTimes()
  }

  private setValuesAtTimes() {
    const currentTime = this.audioContext.currentTime

    this.startingValues.forEach((item) => {
      switch (item.type) {
        case 'frequency':
          this.oscillator.frequency.setValueAtTime(item.value, currentTime)
          break
        case 'gain':
          this.gainNode.gain.setValueAtTime(item.value, currentTime)
          break
        default:
          throw new Error(`Unsupported control type: ${item.type}`)
      }
    })

    this.valuesAtTime.forEach((item) => {
      switch (item.type) {
        case 'frequency':
          this.oscillator.frequency.setValueAtTime(item.value, currentTime + item.time)
          break
        case 'gain':
          this.gainNode.gain.setValueAtTime(item.value, currentTime + item.time)
          break
        default:
          throw new Error(`Unsupported control type: ${item.type}`)
      }
    })

    this.exponentialValues.forEach((item) => {
      switch (item.type) {
        case 'frequency':
          this.oscillator.frequency.exponentialRampToValueAtTime(item.value, currentTime + item.time)
          break
        case 'gain':
          this.gainNode.gain.exponentialRampToValueAtTime(item.value, currentTime + item.time)
          break
        default:
          throw new Error(`Unsupported control type: ${item.type}`)
      }
    })

    this.linearValues.forEach((item) => {
      switch (item.type) {
        case 'frequency':
          this.oscillator.frequency.linearRampToValueAtTime(item.value, currentTime + item.time)
          break
        case 'gain':
          this.gainNode.gain.linearRampToValueAtTime(item.value, currentTime + item.time)
          break
        default:
          throw new Error(`Unsupported control type: ${item.type}`)
      }
    })
  }

  private filters: BiquadFilterNode[] = []
  private connections: AudioNode[] = []
  private oscillator: OscillatorNode
  private type: OscillatorType
  private frequency: number
  private gainNode: GainNode
  private audioContext: AudioContext
  private startingValues: { type: string, value: number }[] = []
  private valuesAtTime: { type: string, value: number, time: number }[] = []
  private exponentialValues: { type: string, value: number, time: number }[] = []
  private linearValues: { type: string, value: number, time: number }[] = []

  play() {
    this.wireConnections()
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
