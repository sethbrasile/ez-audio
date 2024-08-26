import createTimeObject from '@utils/create-time-object'
import { Connector } from '@common/connector'
import { Player } from '@common/player'

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
  constructor(audioContext: AudioContext, opts: any) {
    this.audioBuffer = opts.audioBuffer
    this.name = opts.name || ''
    this.player = new Player(audioContext, new Connector(audioContext, opts), opts)
  }

  /**
   * When using the {{#crossLink "Audio-Service"}}{{/crossLink}}, The name that
   * this Sound instance is registered as on it's parent register.
   *
   * @public
   * @property name
   * @type {string}
   */
  name: string

  /**
   * The AudioBuffer instance that provides audio data to the bufferSource connection.
   *
   * @public
   * @property audioBuffer
   * @type {AudioBuffer}
   */
  audioBuffer: AudioBuffer

  player: Player

  play() {
    this.player.play()
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
    const min = Math.floor(duration / 60)
    const sec = duration % 60
    return createTimeObject(duration, min, sec)
  }
}
