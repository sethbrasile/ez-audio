import customTimeout from '@utils/timeout'
import type { Connector } from '@common/connector'

// export interface Playable {
//   start: (when: number) => void
//   playIn: (when: number) => void
//   playFor: (duration: number) => void
//   playInAndStopAfter: (playIn: number, stopAfter: number) => void
//   stop: (when: number) => void
//   stopIn: (seconds: number) => void
//   stopAt: (time: number) => void
//   stopAfter: (duration: number) => void
//   isPlaying: () => boolean
// }

/**
 * A mixin that allows an object to start and stop an audio source, now or in
 * the future, as well as track whether the audio source is currently playing or
 * not.
 *
 * Consuming object must implement `wireConnections` and `getNodeFrom` methods.
 * These methods are included in the {{#crossLink "Connectable"}}{{/crossLink}}
 * mixin.
 *
 * @public
 * @class Playable
 */
export class Player {
  constructor(context: AudioContext, connector: Connector, opts: { startOffset?: number } | OscillatorOptions) {
    this.audioContext = context
    this.connector = connector
    // @ts-expect-error Typescript is legitimately the stupidest shit ever. Thank you Microsoft for ruining javascript too.
    this.startOffset = opts.startOffset || 0
  }

  /**
   * The parent
   * [AudioContext](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext)
   * instance that all audio events are occurring within. It is useful for
   * getting currentTime, as well as creating new
   * [AudioNodes](https://developer.mozilla.org/en-US/docs/Web/API/AudioNode).
   *
   * This is the object that facilitates and ties together all aspects of the
   * Web Audio API.
   *
   * @public
   * @property audioContext
   * @type {AudioContext}
   */
  audioContext: AudioContext

  /**
   * Whether an audio source is playing or not.
   *
   * @public
   * @property isPlaying
   * @type {boolean}
   * @default false
   */
  isPlaying: boolean = false

  // Provides ability to make connections with web audio API connections
  connector: Connector

  /**
   * When a Sound instance is played, this value is passed to the
   * {{#crossLink "AudioBufferSourceNode/start:method"}}AudioBufferSourceNode.start(){{/crossLink}}
   * `offset` param. Determines `where` (in seconds) the play will start, along
   * the duration of the audio source.
   *
   * @public
   * @property startOffset
   * @type {number}
   */
  startOffset: number

  /**
   * When a Sound instance plays, this is set to the `audioContext.currentTime`.
   * It will always reflect the start time of the most recent
   * {{#crossLink "Sound/_play:method"}}{{/crossLink}}.
   *
   * @property _startedPlayingAt
   * @type {number}
   * @private
   */
  _startedPlayingAt: number = 0

  /**
   * Plays the audio source immediately.
   *
   * @public
   * @method play
   */
  play() {
    this._play(this.audioContext.currentTime)
  }

  /**
   * Plays the audio source at the specified moment in time. A "moment in time"
   * is measured in seconds from the moment that the
   * {{#crossLink "AudioContext"}}{{/crossLink}} was instantiated.
   *
   * Functionally equivalent to {{#crossLink "Playable/_play:method"}}{{/crossLink}}.
   *
   * @param {number} time The moment in time (in seconds, relative to the
   * {{#crossLink "AudioContext"}}AudioContext's{{/crossLink}} "beginning of
   * time") when the audio source should be played.
   *
   * @public
   * @method playAt
   */
  playAt(time: number) {
    this._play(time)
  }

  /**
   * Plays the audio source in specified amount of seconds from "now".
   *
   * @public
   * @method playIn
   *
   * @param {number} seconds Number of seconds from "now" that the audio source
   * should be played.
   */
  playIn(seconds: number) {
    this._play(this.audioContext.currentTime + seconds)
  }

  /**
   * Starts playing the audio source immediately, but stops after specified
   * seconds have elapsed.
   *
   * @public
   * @method playFor
   *
   * @param {number} seconds The amount of time after which the audio source is
   * stopped.
   */
  playFor(seconds: number) {
    this.play()
    this.stopIn(seconds)
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
  playInAndStopAfter(playIn: number, stopAfter: number) {
    this.playIn(playIn)
    this.stopIn(playIn + stopAfter)
  }

  /**
   * Stops the audio source immediately.
   *
   * @public
   * @method stop
   */
  stop() {
    this._stop(this.audioContext.currentTime)
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
  stopIn(seconds: number) {
    this._stop(this.audioContext.currentTime + seconds)
  }

  /**
   * Stops the audio source at the specified "moment in time" relative to the
   * "beginning of time" according to the `audioContext`.
   *
   * Functionally equivalent to the `_stop` method.
   *
   * @public
   * @method stopAt
   *
   * @param {number} time The time that the audio source should be stopped.
   */
  stopAt(time: number) {
    this._stop(time)
  }

  /**
   * The underlying method that backs all of the `stop` methods. Stops sound and
   * set `isPlaying` to false at specified time.
   *
   * Functionally equivalent to the `stopAt` method.
   *
   * @private
   * @method _stop
   *
   * @param {number} stopAt The moment in time (in seconds, relative to the
   * {{#crossLink "AudioContext"}}AudioContext's{{/crossLink}} "beginning of
   * time") when the audio source should be stopped.
   */
  _stop(stopAt: number) {
    const node = this.connector.getNodeFrom('audioSource')
    const currentTime = this.audioContext.currentTime

    if (node) {
      // @ts-expect-error TS PLEASE JUST LET ME DUCK TYPE
      node.stop(stopAt)
    }

    if (stopAt === currentTime) {
      this.isPlaying = false
    }
    else {
      const { setTimeout } = customTimeout(this.audioContext)
      setTimeout(() => this.isPlaying = false, (stopAt - currentTime) * 1000)
    }
  }

  /**
   * The underlying method that backs all of the `play` methods. Plays sound and
   * sets `isPlaying` to true at specified time.
   *
   * Functionally equivalent to `playAt`.
   *
   * @param {number} time The moment in time (in seconds, relative to the
   * {{#crossLink "AudioContext"}}AudioContext's{{/crossLink}} "beginning of
   * time") when the audio source should be played.
   *
   * @method _play
   * @private
   */
  _play(playAt: number) {
    const currentTime = this.audioContext.currentTime

    this.connector.wireConnections('_play')

    const node = this.connector.getNodeFrom('audioSource')

    if (node) {
      node.start(playAt, this.startOffset)
    }

    this._startedPlayingAt = playAt

    if (playAt === currentTime) {
      this.isPlaying = true
    }
    else {
      const { setTimeout } = customTimeout(this.audioContext)
      setTimeout(() => this.isPlaying = true, (playAt - currentTime) * 1000)
    }
  }
}
