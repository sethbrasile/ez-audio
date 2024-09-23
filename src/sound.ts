import type { TimeObject } from '@utils/create-time-object'
import createTimeObject from '@utils/create-time-object'
import audioContextAwareTimeout from '@utils/timeout'
import type { Playable } from '@interfaces/playable'
import type { Connectable, Connection } from '@interfaces/connectable'
import type { ControlType, ParamController, RampType, RatioType, SeekType } from '@controllers/base-param-controller'
import withinRange from './utils/within-range'
import { SoundController } from './controllers/sound-controller'

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
  private controller: ParamController
  private _isPlaying: boolean = false
  private setTimeout: (fn: () => void, delayMillis: number) => number
  protected _startedPlayingAt: number = 0
  public audioSourceNode: AudioBufferSourceNode
  public startOffset: number = 0
  public connections: Connection[] = []

  constructor(protected audioContext: AudioContext, private audioBuffer: AudioBuffer, opts?: any) {
    const audioSourceNode = this.audioContext.createBufferSource()
    const gainNode = audioContext.createGain()
    const pannerNode = audioContext.createStereoPanner()
    this.gainNode = gainNode
    this.pannerNode = pannerNode
    this.audioSourceNode = audioSourceNode
    this.audioBuffer = audioBuffer
    audioSourceNode.buffer = audioBuffer

    this.controller = new SoundController(audioSourceNode, gainNode, pannerNode)

    if (opts?.setTimeout) {
      this.setTimeout = opts.setTimeout
    }
    else {
      this.setTimeout = audioContextAwareTimeout(audioContext).setTimeout
    }
  }

  private setup(): void {
    const audioSourceNode = this.audioContext.createBufferSource()
    audioSourceNode.buffer = this.audioBuffer
    this.audioSourceNode = audioSourceNode
    this.wireConnections()
    this.controller.setValuesAtTimes()
  }

  private wireConnections(): void {
    // always start with the audio source
    const nodes: AudioNode[] = [this.audioSourceNode]
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

  public addConnection(connection: Connection): void {
    this.connections.push(connection)
    this.wireConnections()
  }

  public removeConnection(name: string): void {
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
  public getConnection(name: string): Connection | undefined {
    return this.connections.find(c => c.name === name)
  }

  // Allows you to get node from any user created connection in the connections array
  public getNodeFrom<T extends AudioNode | StereoPannerNode>(connectionName: string): T | undefined {
    return this.getConnection(connectionName)?.audioNode as T | undefined
  }

  public update(type: ControlType): {
    to: (value: number) => {
      from: (method: RatioType) => void
    }
  } {
    return this.controller.update(type)
  }

  public changePanTo(value: number): void {
    this.controller.update('pan').to(value).from('ratio')
  }

  public changeGainTo(value: number): {
    from: (method: RatioType) => void
  } {
    return this.controller.update('gain').to(value)
  }

  public onPlaySet(type: ControlType): {
    to: (value: number) => {
      at: (time: number) => void
      endingAt: (time: number, rampType?: RampType) => void
    }
  } {
    return this.controller.onPlaySet(type)
  }

  public onPlayRamp(type: ControlType, rampType?: RampType): {
    from: (startValue: number) => {
      to: (endValue: number) => {
        in: (endTime: number) => void
      }
    }
  } {
    return this.controller.onPlayRamp(type, rampType)
  }

  public play(): void {
    this.playAt(this.audioContext.currentTime)
  }

  public playIn(when: number): void {
    this.playAt(this.audioContext.currentTime + when)
  }

  public playFor(duration: number): void {
    this.playAt(this.audioContext.currentTime)
    this.setTimeout(() => this.stop(), duration * 1000)
  }

  /**
   * Starts playing the audio source after `playIn` seconds have elapsed, then
   * stops the audio source `stopAfter` seconds after it started playing.
   *
   * @public
   * @method playInAndStopAfter
   *
   * @param {number} playIn Number of seconds from "now" that the audio source
   * should play.
   *
   * @param {number} stopAfter Number of seconds from when the audio source
   * started playing that the audio source should be stopped.
   */
  public playInAndStopAfter(playIn: number, stopAfter: number): void {
    this.playIn(playIn)
    this.stopIn(playIn + stopAfter)
  }

  /**
   * The underlying method that backs all of the `play` methods. Plays the audio source at
   * the specified moment in time. A "moment in time" is measured in seconds from the moment
   * that the {{#crossLink "AudioContext"}}{{/crossLink}} was instantiated.
   *
   * @param {number} time The moment in time (in seconds, relative to the
   * {{#crossLink "AudioContext"}}AudioContext's{{/crossLink}} "beginning of
   * time") when the audio source should be played.
   *
   * @method playAt
   */
  public async playAt(time: number): Promise<void> {
    const { audioContext } = this
    const { currentTime } = audioContext

    await audioContext.resume()

    this.setup()
    this.audioSourceNode.start(time, this.startOffset)
    this._startedPlayingAt = time
    // schedule _isPlaying to false after duration
    this.setTimeout(() => this._isPlaying = false, this.duration.pojo.seconds * 1000)

    if (time <= currentTime) {
      this._isPlaying = true
    }
    else {
      this.setTimeout(() => {
        this._isPlaying = true
      }, (time - currentTime) * 1000)
    }
  }

  /**
   * Stops the audio source after specified seconds have elapsed.
   *
   * @public
   * @method stopIn
   *
   * @param {number} seconds Number of seconds from "now" that the audio source
   * should be stopped.
   */
  public stopIn(seconds: number): void {
    this.stopAt(this.audioContext.currentTime + seconds)
  }

  /**
   * The underlying method that backs all of the `stop` methods. Stops sound and
   * set `isPlaying` to false at specified time.
   *
   * Functionally equivalent to the `stopAt` method.
   *
   * @method stopAt
   *
   * @param {number} stopAt The moment in time (in seconds, relative to the
   * {{#crossLink "AudioContext"}}AudioContext's{{/crossLink}} "beginning of
   * time") when the audio source should be stopped.
   */
  public stopAt(stopAt: number): void {
    const node = this.audioSourceNode
    const currentTime = this.audioContext.currentTime

    if (node) {
      node.stop(stopAt)
    }

    if (stopAt === currentTime) {
      this._isPlaying = false
    }
    else {
      this.setTimeout(() => this._isPlaying = false, (stopAt - currentTime) * 1000)
    }
  }

  public stop(): void {
    this.audioSourceNode.stop()
    this._isPlaying = false
  }

  public get isPlaying(): boolean {
    return this._isPlaying
  }

  public get duration(): TimeObject {
    const buffer = this.audioSourceNode.buffer
    if (buffer === null)
      return createTimeObject(0, 0, 0)
    const { duration } = buffer
    const min = Math.floor(duration / 60)
    const sec = duration % 60
    return createTimeObject(duration, min, sec)
  }

  public get percentGain(): number {
    return this.controller.gain * 100
  }

  /**
   * Gets the bufferSource and stops the initAudio,
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
  public seek(amount: number): { from: (type: SeekType) => void } {
    const duration = this.duration.raw

    const moveToOffset = (offset: number): void => {
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
