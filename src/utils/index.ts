import zeroify from './zeroify'
import { base64ToUint8, mungeSoundFont } from './decode-base64'
import { arraySwap, unique } from './array-methods'
import frequencyMap from './frequency-map'
import exponentialRatio from './exponential-ratio'
import withinRange from './within-range'
import createTimeObject from './create-time-object'
import { get, set } from './prop-access'

import {
  createOctavesWithNotes,
  extractOctaves,
  noteSort,
  octaveShift,
  octaveSort,
  sortNotes,
  stripDuplicateOctaves,
} from './note-methods'

/**
 * @public
 * @module utils
 */

export {
  get,
  set,
  zeroify,
  sortNotes,
  noteSort,
  base64ToUint8,
  mungeSoundFont,
  arraySwap,
  unique,
  octaveShift,
  octaveSort,
  extractOctaves,
  stripDuplicateOctaves,
  createOctavesWithNotes,
  frequencyMap,
  exponentialRatio,
  withinRange,
  createTimeObject,
}
