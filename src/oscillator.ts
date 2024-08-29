import { get } from '@utils/prop-access'
import createTimeObject from './utils/create-time-object'
import type { Playable } from './playable'
import { BaseAdjuster } from '@/adjuster'
import type { Adjuster, ControlType, ParamValue, ValueAtTime } from '@/adjuster'

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

export class Oscillator implements Playable {
  private filters: BiquadFilterNode[] = []
  private connections: AudioNode[] = []
  private type: OscillatorType
  private frequency: number

  constructor(private audioContext: AudioContext, private adjuster: Adjuster, private oscillator: OscillatorNode, options: OscillatorOptions) {
    this.type = options.type || 'sine'
    this.frequency = options.frequency || 440

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

  onPlaySet(type: ControlType) {
    return this.adjuster.onPlaySet(type)
  }

  onPlayRamp(type: ControlType) {
    return this.adjuster.onPlayRamp(type)
  }

  public wireConnections() {
    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()
    oscillator.type = this.type || 'sine'
    oscillator.frequency.setValueAtTime(this.frequency || 440, this.audioContext.currentTime)

    this.oscillator = oscillator
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

    this.adjuster.setValuesAtTimes(oscillator, gainNode)
  }

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

export class OscillatorAdjuster extends BaseAdjuster implements Adjuster {
  public setValuesAtTimes(oscillator: OscillatorNode, gainNode: GainNode) {
    const currentTime = oscillator.context.currentTime

    this.applyValues(this.startingValues, currentTime, oscillator, gainNode)
    this.applyValues(this.valuesAtTime, currentTime, oscillator, gainNode)
    this.applyRampValues(this.exponentialValues, currentTime, oscillator, gainNode, 'exponential')
    this.applyRampValues(this.linearValues, currentTime, oscillator, gainNode, 'linear')
  }

  private applyValues(values: ParamValue[], currentTime: number, oscillator: OscillatorNode, gainNode: GainNode) {
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

  private applyRampValues(values: ValueAtTime[], currentTime: number, oscillator: OscillatorNode, gainNode: GainNode, rampType: 'exponential' | 'linear') {
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
