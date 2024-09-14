import { get } from '@utils/prop-access'
import type Playable from '@interfaces/playable'
import type { Connectable, Connection } from '@interfaces/connectable'
import type { TimeObject } from '@utils/create-time-object'
import createTimeObject from '@utils/create-time-object'
import audioContextAwareTimeout from '@utils/timeout'
import { BaseParamController } from '@/param-controller'
import type { ControlType, ParamController, ParamValue, RampType, RatioType, ValueAtTime } from '@/param-controller'

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

export class Oscillator implements Playable, Connectable {
  private filters: BiquadFilterNode[] = []
  private type: OscillatorType
  protected freq: number
  private controller: ParamController
  private oscillator: OscillatorNode
  private gainNode: GainNode
  private pannerNode: StereoPannerNode
  public connections: Connection[] = []

  constructor(private audioContext: AudioContext, options?: OscillatorOpts) {
    this.type = options?.type || 'sine'
    this.freq = options?.frequency || 440

    // This is just to keep the null checks down, this oscillator instance will never be used
    // Because it's created again when connections are established in wireConnections
    this.oscillator = audioContext.createOscillator()
    this.gainNode = audioContext.createGain()
    this.pannerNode = audioContext.createStereoPanner()
    this.controller = new OscillatorController(this.oscillator, this.gainNode, this.pannerNode)

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

  onPlaySet(type: ControlType): { to: (value: number) => { at: (time: number) => void, endingAt: (time: number, rampType?: RampType) => void } } {
    return this.controller.onPlaySet(type)
  }

  onPlayRamp(type: ControlType, rampType?: RampType): { from: (startValue: number) => { to: (endValue: number) => { in: (endTime: number) => void } } } {
    return this.controller.onPlayRamp(type, rampType)
  }

  private setup(): void {
    // Create a new oscillator on every play
    const oscillator = this.audioContext.createOscillator()
    oscillator.type = this.type || 'sine'
    oscillator.frequency.setValueAtTime(this.freq || 440, this.audioContext.currentTime)
    this.oscillator = oscillator

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

  wireConnections(): void {
    // always start with the audio source
    const nodes: AudioNode[] = [this.oscillator]
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

  addConnection(connection: Connection): void {
    this.connections.push(connection)
    this.wireConnections()
  }

  removeConnection(name: string): void {
    const connection = this.getConnection(name)
    if (connection) {
      const index = this.connections.indexOf(connection)
      if (index > -1) {
        this.connections.splice(index, 1)
        this.wireConnections()
      }
    }
  }

  getConnection(name: string): Connection | undefined {
    return this.connections.find(c => c.name === name)
  }

  getNodeFrom<T extends AudioNode>(connectionName: string): T | undefined {
    return this.getConnection(connectionName)?.audioNode as T | undefined
  }

  get audioSourceNode(): OscillatorNode {
    return this.oscillator
  }

  // convenience method, equivalent longer form would be
  // osc.controller.update(type).to(value).from('ratio')
  update(type: ControlType): {
    to: (value: number) => {
      from: (method: RatioType) => void
    }
  } {
    return this.controller.update(type)
  }

  // convenience method, equivalent longer form would be
  // osc.update('pan').to(value).from('ratio')
  changePanTo(value: number): void {
    this.controller.update('pan').to(value).from('ratio')
  }

  // convenience method, equivalent longer form would be
  // osc.update('gain').to(value).from('ratio')
  changeGainTo(value: number): void {
    this.controller.update('gain').to(value).from('ratio')
  }

  play(): void {
    this.playAt(this.audioContext.currentTime)
  }

  playFor(duration: number): void {
    const { setTimeout } = audioContextAwareTimeout(this.audioContext)
    this.playAt(this.audioContext.currentTime)
    setTimeout(() => this.stop(), duration * 1000)
  }

  // playAt is the underlying play method behind all play methods
  playAt(time: number): void {
    const { audioContext } = this
    const { currentTime } = audioContext
    const { setTimeout } = audioContextAwareTimeout(audioContext)

    this.setup()
    this.oscillator.start(time)

    if (time <= currentTime) {
      this._isPlaying = true
    }
    else {
      setTimeout(() => {
        this._isPlaying = true
      }, (time - currentTime) * 1000)
    }
  }

  stop(): void {
    this._isPlaying = false
    this.oscillator.stop()
  }

  private _isPlaying = false
  get isPlaying(): boolean {
    return this._isPlaying
  }

  // TODO: implement duration... can I? I think duration is too dynamic? any way to infer from asdr? or if there is a sheduled stop?
  get duration(): TimeObject {
    return createTimeObject(0, 0, 0)
  }

  public get percentGain(): number {
    return this.gainNode.gain.value * 100
  }
}

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
