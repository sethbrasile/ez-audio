/**
 * @public
 * @class utils
 */

/**
 * Given an array and an index, splits the array at index and pushes the first
 * chunk to the end of the second chunk.
 *
 * @private
 * @method arraySwap
 * @param {Array} arr An array to split, shift and rejoin.
 * @param {number} index The index where the split should occur.
 * @return {Array} The swapped/shifted array.
 */
export function arraySwap<T>(arr: T[], index: number) {
  const endOfArr = arr.slice(0, index)
  const beginOfArr = arr.slice(index, arr.length)
  beginOfArr.push(...endOfArr)
  return beginOfArr
}

/**
 * Given an array and a value, removes the value from the array.
 *
 * @private
 * @method removeValue
 * @param {Array} arr An array to filter.
 * @param {*} value The value to remove from the array.
 * @return {Array} The filtered array.
 */
export function removeValue(arr: any[], value: any) {
  return arr.filter(item => item !== value)
}

export function unique(arr: any[]) {
  return [...new Set(arr)]
}
