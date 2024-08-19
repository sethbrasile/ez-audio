
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
 * @uses Connectable
 * @uses Playable
 */
export class Sound {
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
   * The AudioBuffer instance that provides audio data to the bufferSource connection.
   *
   * @public
   * @property audioBuffer
   * @type {AudioBuffer}
   */
  audioBuffer: AudioBuffer

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
  _startedPlayingAt: number

  constructor(context: AudioContext, source, options) {
    this.audioContext = context
    this.startOffset = options.startOffset || 0
    this.startOffset = 0
    this._startedPlayingAt = 0
  }

  /**
   * Computed property. Value is an object containing the duration of the
   * audioBuffer in three formats. The three formats
   * are `raw`, `string`, and `pojo`.
   *
   * Duration of 6 minutes would be output as:
   *
   *     {
   *       raw: 360, // seconds
   *       string: '06:00',
   *       pojo: {
   *         minutes: 6,
   *         seconds: 0
   *       }
   *     }
   *
   * @public
   * @property duration
   * @type {object}
   */
  get duration() {
    const { duration } = this.audioBuffer
    const min = Math.floor(duration / 60);
    const sec = duration % 60;
    return createTimeObject(duration, min, sec);
  }
}
