import createTimeObject from '@utils/create-time-object'
import audioContextAwareTimeout from '@utils/timeout'
import type Playable from '@interfaces/playable'
import type { ControlType, ParamController, ParamValue, RampType, ValueAtTime } from '@/param-controller'
import { BaseParamController } from '@/param-controller'

// interface Connectable {
//   connect: (node: AudioNode, output?: number, input?: number) => void
// }

/**
 * The Sound class provides the core functionality for
 * interacting with the Web Audio API's AudioContext, and is the base class for
 * all other {{#crossLinkModule "Audio"}}{{/crossLinkModule}} types. It prepares
 * an audio source, provides various methods for interacting with the audio source,
 * creates {{#crossLink "AudioNode"}}AudioNodes{{/crossLink}} from the
 * connections array, sets up the necessary connections/routing between them,
 * and provides some methods to {{#crossLink "Playable/play:method"}}{{/crossLink}}
 * and {{#crossLink "Sound/stop:method"}}{{/crossLink}} the audio source.
 *
 * @public
 * @class Sound
 * @implements Playable
 */
export class Sound implements Playable {
  private gainNode: GainNode
  private audioBuffer: AudioBuffer
  private bufferSourceNode: AudioBufferSourceNode
  private _isPlaying: boolean = false

  public connections: AudioNode[] = []

  constructor(private audioContext: AudioContext, private controller: ParamController, audioBuffer: AudioBuffer) {
    const gainNode = audioContext.createGain()
    const bufferSourceNode = this.audioContext.createBufferSource()
    this.gainNode = gainNode
    this.bufferSourceNode = bufferSourceNode
    this.audioBuffer = audioBuffer
  }

  wireConnections() {
    const bufferSourceNode = this.audioContext.createBufferSource()
    bufferSourceNode.buffer = this.audioBuffer
    this.bufferSourceNode = bufferSourceNode

    // always start with the audio source
    const conns: AudioNode[] = [bufferSourceNode]

    // add the nodes from connections property
    for (let i = 0; i < this.connections.length; i++) {
      conns.push(this.connections[i])
    }

    // add the gain node
    conns.push(this.gainNode)

    // connect them all together
    for (let i = 0; i < conns.length - 1; i++) {
      conns[i].connect(conns[i + 1])
    }

    this.gainNode.connect(this.audioContext.destination)
  }

  onPlaySet(type: ControlType) {
    return this.controller.onPlaySet(type)
  }

  onPlayRamp(type: ControlType, rampType?: RampType) {
    return this.controller.onPlayRamp(type, rampType)
  }

  play() {
    this.playAt(this.audioContext.currentTime)
  }

  playFor(duration: number) {
    const { setTimeout } = audioContextAwareTimeout(this.audioContext)
    this.playAt(this.audioContext.currentTime)
    setTimeout(() => this.stop(), duration * 1000)
  }

  playAt(time: number) {
    const { audioContext } = this
    const { currentTime } = audioContext
    const { setTimeout } = audioContextAwareTimeout(audioContext)

    // schedule _isPlaying to false after duration
    setTimeout(() => this._isPlaying = false, this.duration.pojo.seconds * 1000)
    this.wireConnections()
    this.controller.setValuesAtTimes(this.bufferSourceNode, this.gainNode)
    this.bufferSourceNode.start(time)
    this._isPlaying = true

    if (time <= currentTime) {
      this._isPlaying = true
    }
    else {
      setTimeout(() => {
        this._isPlaying = true
      }, (time - currentTime) * 1000)
    }
  }

  stop() {
    this.bufferSourceNode.stop()
    this._isPlaying = false
  }

  get isPlaying() {
    return this._isPlaying
  }

  public get duration() {
    const buffer = this.bufferSourceNode.buffer
    if (buffer === null)
      return createTimeObject(0, 0, 0)
    const { duration } = buffer
    const min = Math.floor(duration / 60)
    const sec = duration % 60
    return createTimeObject(duration, min, sec)
  }
}

export class SoundAdjuster extends BaseParamController implements ParamController {
  public setValuesAtTimes(sourceNode: AudioBufferSourceNode, gainNode: GainNode) {
    const currentTime = sourceNode.context.currentTime

    this.applyValues(this.startingValues, currentTime, sourceNode, gainNode)
    this.applyValues(this.valuesAtTime, currentTime, sourceNode, gainNode)
    this.applyRampValues(this.exponentialValues, currentTime, sourceNode, gainNode, 'exponential')
    this.applyRampValues(this.linearValues, currentTime, sourceNode, gainNode, 'linear')
  }

  private applyValues(values: ParamValue[], currentTime: number, sourceNode: AudioBufferSourceNode, gainNode: GainNode) {
    values.forEach((item) => {
      switch (item.type) {
        case 'detune':
          sourceNode.detune.setValueAtTime(item.value, currentTime)
          break
        case 'gain':
          gainNode.gain.setValueAtTime(item.value, currentTime)
          break
        default:
          throw new Error(`Unsupported control type: ${item.type}`)
      }
    })
  }

  private applyRampValues(values: ValueAtTime[], currentTime: number, sourceNode: AudioBufferSourceNode, gainNode: GainNode, rampType: 'exponential' | 'linear') {
    values.forEach((item) => {
      const time = currentTime + item.time
      switch (item.type) {
        case 'detune':
          switch (rampType) {
            case 'exponential':
              sourceNode.detune.exponentialRampToValueAtTime(item.value, time)
              break
            case 'linear':
              sourceNode.detune.linearRampToValueAtTime(item.value, time)
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
