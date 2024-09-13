import { assert, it } from 'vitest'
import { arraySwap } from './array-methods'

it('arraySwap works', () => {
  const result = arraySwap(['a', 'b', 'c', 'd', 'e'], 2)
  assert.deepEqual(['c', 'd', 'e', 'a', 'b'], result)
})
