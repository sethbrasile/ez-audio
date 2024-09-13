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
export function arraySwap<T>(arr: T[], index: number): T[] {
  const endOfArr = arr.slice(0, index)
  const beginOfArr = arr.slice(index, arr.length)
  beginOfArr.push(...endOfArr)
  return beginOfArr
}

// replaces array so don't use on observable array
export function unique<T>(arr: T[]): T[] {
  return [...new Set(arr)]
}
