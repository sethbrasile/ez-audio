import type { TimeObject } from '@utils/create-time-object'
import type { Playable } from '@interfaces/playable'
import type { Connectable, Connection } from '@interfaces/connectable'
import type { ControlType, ParamController, RampType, RatioType } from '@controllers/base-param-controller'
import audioContextAwareTimeout from '@utils/timeout'

export interface BaseSoundOptions {
  /**
   * @see BaseSound.name
   */
  name?: string

  /**
   * @method setTimeout
   *
   * A function that behaves like the native `setTimeout` function. This is used to schedule the stop method to be called after the sound has finished playing.
   * By default, an `AudioContext`-aware version of `setTimeout` is used throughout `ez-web-audio`, but you can override this implementation if you need to.
   *
   * @default setTimeout from 'ez-web-audio/utils/timeout'
   * @param fn
   * @param delayMillis
   */
  setTimeout?: (fn: () => void, delayMillis: number) => number
}

export abstract class BaseSound implements Connectable, Playable {
  protected _isPlaying = false
  protected gainNode: GainNode
  protected pannerNode: StereoPannerNode
  protected setTimeout: (fn: () => void, delayMillis: number) => number
  protected startedPlayingAt: number = 0

  /**
   * @property connections
   * An array of connections that will be placed in between the `audioSourceNode` (where the audio comes from) and the gain/panner nodes.
   *
   * This is useful for adding effects to a sound. For example, to add a reverb effect, you can create a `ConvolverNode` and add it to this array.
   *
   * The `audioSourceNode` is mandatory and always first, and the gain/panner nodes are mandatory and always last, but the nodes in between can be in any order.
   *
   * You can use the `addConnection` and `removeConnection` methods to add and remove connections from this array, or you can set/mutate the array directly.
   *
   * The `wireConnections` method is called automatically when the sound is played, and it will connect all the nodes in this array in the correct order.
   *
   * @example
   * const sound = new Oscillator(audioContext, { type: 'sine', frequency: 440 })
   * const convolverNode = audioContext.createConvolver()
   * sound.connections = [convolverNode]
   * sound.play()
   *
   */
  public connections: Connection[] = []

  /**
   * @property startOffset
   *
   * See Web Audio API documentation for this one, as it is just passed into the `start` method of the `audioSourceNode`.
   *
   * This is useful for starting a sound at a specific offset from the beginning of the sound. Manipulation of this value is used
   * extensively in the `Track` class to allow for starting the track at specific positions.
   *
   * @default 0
   * @see https://developer.mozilla.org/en-US/docs/Web/API/AudioScheduledSourceNode/start
   */
  public startOffset: number = 0

  protected abstract controller: ParamController
  protected abstract wireConnections(): void
  protected abstract setup(): void

  /**
   * @property audioSourceNode
   *
   * The audio source node that this sound is using. This is the first node in the chain and is the node that actually provides audio.
   */
  public abstract audioSourceNode: OscillatorNode | AudioBufferSourceNode

  /**
   * @property duration
   *
   * The duration of this sound. This is used to schedule the stop method to be called after the sound has finished playing. Not all
   * `Sound` types have a useful `duration`, such as `Oscillator`
   */
  public abstract duration: TimeObject

  /**
   * @property name
   *
   * A name for this sound. Optional. Useful for identification of a given sound and debugging.
   */
  public name: string

  constructor(protected audioContext: AudioContext, opts?: BaseSoundOptions) {
    const gainNode = audioContext.createGain()
    const pannerNode = audioContext.createStereoPanner()

    this.gainNode = gainNode
    this.pannerNode = pannerNode

    this.name = opts?.name || ''

    if (opts?.setTimeout) {
      this.setTimeout = opts.setTimeout
    }
    else {
      this.setTimeout = audioContextAwareTimeout(audioContext).setTimeout
    }
  }

  public addConnection(connection: Connection): this {
    this.connections.push(connection)
    this.wireConnections()
    return this
  }

  public removeConnection(name: string): this {
    const connection = this.getConnection(name)
    if (connection) {
      const index = this.connections.indexOf(connection)
      if (index > -1) {
        this.connections.splice(index, 1)
        this.wireConnections()
      }
    }
    return this
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

  public changePanTo(value: number): this {
    this.controller.update('pan').to(value).from('ratio')
    return this
  }

  public changeGainTo(value: number): this {
    this.controller.update('gain').to(value).from('ratio')
    return this
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

  public async play(): Promise<void> {
    await this.playAt(this.audioContext.currentTime)
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
    const duration = this.duration.raw

    await audioContext.resume()

    this.setup()
    this.audioSourceNode.start(time, this.startOffset)
    this.startedPlayingAt = time
    // if duration exists, schedule _isPlaying to false after duration has elapsed
    if (duration) {
      this.setTimeout(() => {
        this._isPlaying = false
      }, this.duration.pojo.seconds * 1000)
    }

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
  public async stopIn(seconds: number): Promise<void> {
    await this.stopAt(this.audioContext.currentTime + seconds)
  }

  /**
   * The underlying method that backs all of the `stop` methods. Stops sound and
   * set `isPlaying` to false at specified time.
   *
   * Functionally equivalent to the `stopAt` method.
   *
   * @method stopAt
   *
   * @param {number} time The moment in time (in seconds, relative to the
   * {{#crossLink "AudioContext"}}AudioContext's{{/crossLink}} "beginning of
   * time") when the audio source should be stopped.
   */
  public async stopAt(time: number): Promise<void> {
    await this.audioContext.resume()

    const node = this.audioSourceNode
    const currentTime = this.audioContext.currentTime

    const stop = (): void => {
      if (this._isPlaying) {
        this._isPlaying = false
        node.stop(time)
      }
    }

    if (time === currentTime) {
      stop()
    }
    else {
      this.setTimeout(() => {
        stop()
      }, (time - currentTime) * 1000)
    }
  }

  public async stop(): Promise<void> {
    await this.stopAt(this.audioContext.currentTime)
  }

  public get isPlaying(): boolean {
    return this._isPlaying
  }

  public get percentGain(): number {
    return this.controller.gain * 100
  }

  protected later(fn: () => void): void {
    this.setTimeout(fn, 1)
  }
}
