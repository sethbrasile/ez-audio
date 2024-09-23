import { get } from '@utils/prop-access'
import type { TimeObject } from '@utils/create-time-object'
import createTimeObject from '@utils/create-time-object'
import type { ControlType, RampType } from '@controllers/base-param-controller'
import { OscillatorController } from './controllers/oscillator-controller'
import { BaseSound } from './base-sound'

export interface OscillatorOptsFilterValues {
  frequency?: number
  q?: number
}

export interface OscillatorOpts {
  startOffset?: number
  frequency?: number
  detune?: number
  gain?: number
  type?: OscillatorType
  highpass?: OscillatorOptsFilterValues
  bandpass?: OscillatorOptsFilterValues
  lowpass?: OscillatorOptsFilterValues
  lowshelf?: OscillatorOptsFilterValues
  highshelf?: OscillatorOptsFilterValues
  peaking?: OscillatorOptsFilterValues
  notch?: OscillatorOptsFilterValues
  allpass?: OscillatorOptsFilterValues
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

export class Oscillator extends BaseSound {
  public audioSourceNode: OscillatorNode
  private filters: BiquadFilterNode[] = []
  private type: OscillatorType
  protected freq: number
  protected controller: OscillatorController

  constructor(protected audioContext: AudioContext, options?: OscillatorOpts) {
    super(audioContext, options)
    this.type = options?.type || 'sine'
    this.freq = options?.frequency || 440

    // This is just to keep the null checks down, this oscillator instance will never be used
    // Because it's created again when connections are established in wireConnections
    this.audioSourceNode = audioContext.createOscillator()
    this.controller = new OscillatorController(this.audioSourceNode, this.gainNode, this.pannerNode)

    if (options && options.gain !== undefined)
      this.changeGainTo(options.gain)

    FILTERS.forEach((filter) => {
      const vals = get<OscillatorOptsFilterValues | undefined>(options, filter)
      if (vals) {
        const filterNode = audioContext.createBiquadFilter()
        filterNode.type = filter as any
        filterNode.frequency.setValueAtTime(vals.frequency || 440, audioContext.currentTime)
        filterNode.Q.setValueAtTime(vals.q || 1, audioContext.currentTime)
        this.filters.push(filterNode)
      }
    })
  }

  public onPlaySet(type: ControlType): { to: (value: number) => { at: (time: number) => void, endingAt: (time: number, rampType?: RampType) => void } } {
    return this.controller.onPlaySet(type)
  }

  public onPlayRamp(type: ControlType, rampType?: RampType): { from: (startValue: number) => { to: (endValue: number) => { in: (endTime: number) => void } } } {
    return this.controller.onPlayRamp(type, rampType)
  }

  protected setup(): void {
    // Create a new oscillator on every play
    const oscillator = this.audioContext.createOscillator()
    oscillator.type = this.type || 'sine'
    oscillator.frequency.setValueAtTime(this.freq || 440, this.audioContext.currentTime)
    this.audioSourceNode = oscillator

    // Create a new gain node on every play
    const gainNode = this.audioContext.createGain()
    this.gainNode = gainNode

    // give the controller the new nodes
    this.controller.updateAudioSource(oscillator)
    this.controller.updateGainNode(gainNode)

    // wire everything up
    this.wireConnections()
    this.controller.setValuesAtTimes()
  }

  protected wireConnections(): void {
    // always start with the audio source
    const nodes: AudioNode[] = [this.audioSourceNode]
    const { connections, filters, pannerNode } = this

    // Add all the filters
    for (let i = 0; i < filters.length; i++) {
      nodes.push(filters[i])
    }

    // add the nodes from connections array
    for (let i = 0; i < connections.length; i++) {
      nodes.push(connections[i].audioNode)
    }

    // add the gain and panner node
    nodes.push(this.gainNode)
    nodes.push(pannerNode)

    // connect them all together
    for (let i = 0; i < nodes.length - 1; i++) {
      nodes[i].connect(nodes[i + 1])
    }

    pannerNode.connect(this.audioContext.destination)
  }

  // TODO: implement duration... can I? I think duration is too dynamic? any way to infer from asdr? or if there is a sheduled stop?
  public get duration(): TimeObject {
    return createTimeObject(0, 0, 0)
  }
}
