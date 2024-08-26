import zeroify from '@utils/zeroify'

/**
 * @public
 * @class utils
 */

/**
 * An object containing a duration in three formats.
 * The three formats are `raw`, `string`, and `pojo`.
 *
 * Duration of 6 minutes would be formatted as:
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
 * @typedef {object} TimeObject
 * @property {number} raw The duration in seconds
 * @property {string} string The duration in a string format
 * @property {object} pojo The duration in a POJO format
 */
export interface TimeObject {
  raw: number
  string: string
  pojo: {
    minutes: number
    seconds: number
  }
}

/**
 * Accepts the data from an audiobuffer duration and returns a TimeObject.
 *
 * Example:
 *
 * const { duration } = this.audioBuffer
 * const min = Math.floor(duration / 60)
 * const sec = duration % 60
 * return createTimeObject(duration, min, sec)
 *
 * @public
 * @method createTimeObject
 * @param {number} input A number that should be formatted
 * @param {number} minutes The number of minutes in the duration
 * @param {number} seconds The number of seconds (in addition to minutes) in the duration
 * @return {TimeObject} A POJO containing the input time in 3 forms
 */
export default function createTimeObject(raw: number, minutes: number, seconds: number): TimeObject {
  return {
    raw,
    string: `${zeroify(minutes)}:${zeroify(seconds)}`,
    pojo: { minutes, seconds },
  }
}
