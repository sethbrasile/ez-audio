import createTimeObject from '@utils/create-time-object'
import customTimeout from '@utils/timeout'
import { BaseAdjuster } from './adjuster'
import type { Adjuster, ControlType, ParamValue, ValueAtTime } from './adjuster'
import type { Playable } from './playable'

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
  private bufferSourceNode: AudioBufferSourceNode
  private _isPlaying: boolean = false

  constructor(private audioContext: AudioContext, private adjuster: Adjuster, audioBuffer: AudioBuffer) {
    const bufferSource = audioContext.createBufferSource()
    const gainNode = audioContext.createGain()

    bufferSource.buffer = audioBuffer

    this.gainNode = gainNode
    this.bufferSourceNode = bufferSource
  }

  wireConnections() {
    this.bufferSourceNode.connect(this.gainNode)
    this.gainNode.connect(this.audioContext.destination)
  }

  onPlaySet(type: ControlType) {
    return this.adjuster.onPlaySet(type)
  }

  onPlayRamp(type: ControlType) {
    return this.adjuster.onPlayRamp(type)
  }

  play() {
    const { setTimeout } = customTimeout(this.audioContext)

    // schedule _isPlaying to false after duration
    setTimeout(() => this._isPlaying = false, this.duration.pojo.seconds * 1000)

    this.wireConnections()
    this.adjuster.setValuesAtTimes(this.bufferSourceNode, this.gainNode)

    this.bufferSourceNode.start()
    this._isPlaying = true
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

export class SoundAdjuster extends BaseAdjuster implements Adjuster {
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
