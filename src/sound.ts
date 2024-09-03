import createTimeObject from '@utils/create-time-object'
import audioContextAwareTimeout from '@utils/timeout'
import type Playable from '@interfaces/playable'
import type { Connectable, Connection } from '@interfaces/connectable'
import withinRange from './utils/within-range'
import type { ControlType, ParamController, ParamValue, RampType, SeekType, ValueAtTime } from '@/param-controller'
import { BaseParamController } from '@/param-controller'

/**
 * The Sound class provides the core functionality for
 * interacting with the Web Audio API's AudioContext, and is the base class for
 * all other {{#crossLinkModule "Audio"}}{{/crossLinkModule}} types. It prepares
 * an audio source, provides various methods for interacting with the audio source,
 * creates {{#crossLink "AudioNode"}}AudioNodes{{/crossLink}} from the
 * nodes array, sets up the necessary nodes/routing between them,
 * and provides some methods to {{#crossLink "Playable/play:method"}}{{/crossLink}}
 * and {{#crossLink "Sound/stop:method"}}{{/crossLink}} the audio source.
 *
 * @public
 * @class Sound
 * @implements Playable
 */
export class Sound implements Playable, Connectable {
  private gainNode: GainNode
  private pannerNode: StereoPannerNode
  private bufferSourceNode: AudioBufferSourceNode
  private controller: ParamController
  public _isPlaying: boolean = false
  protected _startedPlayingAt: number = 0
  public startOffset: number = 0
  public connections: Connection[] = []

  constructor(protected audioContext: AudioContext, private audioBuffer: AudioBuffer) {
    const bufferSourceNode = this.audioContext.createBufferSource()
    const gainNode = audioContext.createGain()
    const pannerNode = audioContext.createStereoPanner()
    this.gainNode = gainNode
    this.pannerNode = pannerNode
    this.bufferSourceNode = bufferSourceNode
    this.audioBuffer = audioBuffer
    bufferSourceNode.buffer = audioBuffer

    this.controller = new SoundAdjuster(bufferSourceNode, gainNode, pannerNode)
  }

  private setup() {
    const bufferSourceNode = this.audioContext.createBufferSource()
    bufferSourceNode.buffer = this.audioBuffer
    this.bufferSourceNode = bufferSourceNode
    this.wireConnections()
    this.controller.setValuesAtTimes()
  }

  public wireConnections() {
    // always start with the audio source
    const nodes: AudioNode[] = [this.bufferSourceNode]
    const { connections, pannerNode } = this

    // add the nodes from nodes property
    for (let i = 0; i < connections.length; i++) {
      nodes.push(connections[i].audioNode)
    }

    // add the gain node and panner node
    nodes.push(this.gainNode)
    nodes.push(pannerNode)

    // connect them all together
    for (let i = 0; i < nodes.length - 1; i++) {
      nodes[i].connect(nodes[i + 1])
    }

    pannerNode.connect(this.audioContext.destination)
  }

  addConnection(connection: Connection) {
    this.connections.push(connection)
    this.wireConnections()
  }

  removeConnection(name: string) {
    const connection = this.getConnection(name)
    if (connection) {
      const index = this.connections.indexOf(connection)
      if (index > -1) {
        this.connections.splice(index, 1)
        this.wireConnections()
      }
    }
  }

  // Allows you to get any user created connection in the connections array
  getConnection(name: string): Connection | undefined {
    return this.connections.find(c => c.name === name)
  }

  // Allows you to get node from any user created connection in the connections array
  getNodeFrom<T extends AudioNode | StereoPannerNode>(connectionName: string): T | undefined {
    return this.getConnection(connectionName)?.audioNode as T | undefined
  }

  get audioSourceNode() {
    return this.bufferSourceNode
  }

  update(type: ControlType) {
    return this.controller.update(type)
  }

  changePanTo(value: number) {
    this.controller.update('pan').to(value).from('ratio')
  }

  changeGainTo(value: number) {
    return this.controller.update('gain').to(value)
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

    this.setup()
    this.bufferSourceNode.start(time, this.startOffset)
    this._startedPlayingAt = time
    // schedule _isPlaying to false after duration
    setTimeout(() => this._isPlaying = false, this.duration.pojo.seconds * 1000)

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

  public get isPlaying() {
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

  public get percentGain() {
    return this.gainNode.gain.value * 100
  }

  /**
   * Gets the bufferSource and stops the audio,
   * changes it's play position, and restarts the audio.
   *
   * returns a pojo with the `from` method that `value` is curried to, allowing
   * one to specify which type of value is being provided.
   *
   * @example
   *     // for a Sound instance with a duration of 100 seconds, these will all
   *     // move the play position to 90 seconds.
   *     soundInstance.seek(0.9).from('ratio');
   *     soundInstance.seek(0.1).from('inverseRatio')
   *     soundInstance.seek(90).from('percent');
   *     soundInstance.seek(90).from('seconds');
   *
   * @param {number} amount The new play position value.
   */
  seek(amount: number) {
    const duration = this.duration.raw

    const moveToOffset = (offset: number) => {
      const _isPlaying = this._isPlaying
      const adjustedOffset = withinRange(offset, 0, duration)

      if (_isPlaying) {
        this.stop()
        this.startOffset = adjustedOffset
        this.play()
      }
      else {
        this.startOffset = adjustedOffset
      }
    }

    return {
      from(type: SeekType) {
        switch (type) {
          case 'ratio':
            moveToOffset(amount * duration)
            break
          case 'percent':
            moveToOffset(amount * duration * 0.01)
            break
          case 'inverseRatio':
            moveToOffset(duration - amount * duration)
            break
          case 'seconds':
            moveToOffset(amount)
            break
        }
      },
    }
  }
}

export class SoundAdjuster extends BaseParamController implements ParamController {
  constructor(private bufferSourceNode: AudioBufferSourceNode, protected gainNode: GainNode, protected pannerNode: StereoPannerNode) {
    super(bufferSourceNode, gainNode, pannerNode)
  }

  public updateAudioSource(source: AudioBufferSourceNode) {
    this.bufferSourceNode = source
  }

  public setValuesAtTimes() {
    const { bufferSourceNode } = this
    const currentTime = bufferSourceNode.context.currentTime

    this.applyValues(this.startingValues, currentTime)
    this.applyValues(this.valuesAtTime, currentTime)
    this.applyRampValues(this.exponentialValues, currentTime, 'exponential')
    this.applyRampValues(this.linearValues, currentTime, 'linear')
  }

  private applyValues(values: ParamValue[], currentTime: number) {
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

  private applyRampValues(values: ValueAtTime[], currentTime: number, rampType: 'exponential' | 'linear') {
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
