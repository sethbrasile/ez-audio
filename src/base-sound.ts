import type { TimeObject } from '@utils/create-time-object'
import type { Playable } from '@interfaces/playable'
import type { Connectable, Connection } from '@interfaces/connectable'
import type { ControlType, ParamController, RampType, RatioType } from '@controllers/base-param-controller'
import audioContextAwareTimeout from '@utils/timeout'

export abstract class BaseSound implements Connectable, Playable {
  protected _isPlaying = false
  protected gainNode: GainNode
  protected pannerNode: StereoPannerNode
  protected setTimeout: (fn: () => void, delayMillis: number) => number
  protected startedPlayingAt: number = 0

  public connections: Connection[] = []
  public startOffset: number = 0

  protected abstract controller: ParamController
  protected abstract wireConnections(): void
  protected abstract setup(): void

  public abstract audioSourceNode: OscillatorNode | AudioBufferSourceNode
  public abstract duration: TimeObject

  constructor(protected audioContext: AudioContext, opts?: any) {
    const gainNode = audioContext.createGain()
    const pannerNode = audioContext.createStereoPanner()

    this.gainNode = gainNode
    this.pannerNode = pannerNode

    if (opts?.setTimeout) {
      this.setTimeout = opts.setTimeout
    }
    else {
      this.setTimeout = audioContextAwareTimeout(audioContext).setTimeout
    }
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
    this.startedPlayingAt = time
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

  public get percentGain(): number {
    return this.controller.gain * 100
  }
}
