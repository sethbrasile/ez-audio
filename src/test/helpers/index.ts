/**
 * @param valueFn the function to perform in order to derive the value. Promise resolves to the return value of this function after `wait` has elapsed
 * @param wait the amount of time to wait before resolving the promise. Defaults to 2ms.
 *
 * @example
 * const value = await settle(() => someFunctionThatReturnsAValue())
 * // value is now the return value of someFunctionThatReturnsAValue(), but it waited 2ms before checking
 *
 * @example
 * const value = await settle(() => someFunctionThatReturnsAValue(), 1000)
 * // value is now the return value of someFunctionThatReturnsAValue(), but it waited 1s before checking
 */
export function settle(valueFn: () => any, wait: number = 2): Promise<any> {
  return new Promise(resolve => setTimeout(() => resolve(valueFn()), wait))
}

export function mockSetTimeout(fn: () => void, time: number = 1): number {
  setTimeout(fn, time)
  return time
}
