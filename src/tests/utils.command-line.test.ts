import { runCli } from '../utils/command-line'

it('runCli: should throw error when empty string is found in "argvSchema" arr', () => {
  let isThrown = false

  try {
    runCli([])([
      [[], {}, () => undefined],
      [['check', ''], {}, () => undefined],
    ])
  } catch (_) {
    isThrown = true
  }

  expect(isThrown).toBe(true)
})

it('runCli: should throw error when whitespace is found in "argvSchema" arr', () => {
  /* case 1 */

  let isThrownCase1 = false

  try {
    runCli([])([
      [['check'], {}, () => undefined],
      [['check', 'che ck'], {}, () => undefined],
    ])
  } catch (_) {
    isThrownCase1 = true
  }

  expect(isThrownCase1).toBe(true)

  /* case 2 */

  let isThrownCase2 = false

  try {
    runCli([])([
      [['check'], {}, () => undefined],
      [['check', 'che\nck'], {}, () => undefined],
    ])
  } catch (_) {
    isThrownCase2 = true
  }

  expect(isThrownCase2).toBe(true)
})

it('runCli: should throw error if found "argv" command schema duplicates', () => {
  /* case 0 */

  let isThrownCase0 = false

  try {
    runCli([])([
      [[], {}, () => undefined],
      [['one'], {}, () => undefined],
    ])
  } catch (_) {
    isThrownCase0 = true
  }

  expect(isThrownCase0).toBe(false)

  /* case 1 */

  let isThrownCase1 = false

  try {
    runCli([])([
      [[], {}, () => undefined],
      [[], {}, () => undefined],
    ])
  } catch (_) {
    isThrownCase1 = true
  }

  expect(isThrownCase1).toBe(true)

  /* case 2 */

  let isThrownCase2 = false

  try {
    runCli([])([
      [[], {}, () => undefined],
      [['check'], {}, () => undefined],
      [[], {}, () => undefined],
    ])
  } catch (_) {
    isThrownCase2 = true
  }

  expect(isThrownCase2).toBe(true)

  /* case 3 */

  let isThrownCase3 = false

  try {
    runCli([])([
      [[], {}, () => undefined],
      [['check'], {}, () => undefined],
      [['check'], {}, () => undefined],
    ])
  } catch (_) {
    isThrownCase3 = true
  }

  expect(isThrownCase3).toBe(true)

  /* case 4 */

  let isThrownCase4 = false

  try {
    runCli([])([
      [[], {}, () => undefined],
      [['check', 'one'], {}, () => undefined],
      [['check', 'two'], {}, () => undefined],
      [['check', 'one'], {}, () => undefined],
    ])
  } catch (_) {
    isThrownCase4 = true
  }

  expect(isThrownCase4).toBe(true)
})

it.skip('runCli: should call empty "argv" command if command has empty "argv" schema', () => {
  const mockFn0 = jest.fn()
  const mockFn1 = jest.fn()

  runCli([])([
    [[], {}, mockFn0],
    [['case1'], {}, mockFn1],
  ])

  expect(mockFn0).toHaveBeenCalledTimes(1)
  expect(mockFn1).toHaveBeenCalledTimes(0)
})

it.skip('runCli: should call correct function for the given "argv"', () => {
  const mockFn0 = jest.fn()
  const mockFn1 = jest.fn()
  const mockFn2 = jest.fn()
  const mockFn3 = jest.fn()

  runCli(['case2'])([
    [[], {}, mockFn0],
    [['case1'], {}, mockFn1],
    [['case2'], {}, mockFn2],
    [['case3'], {}, mockFn3],
  ])

  expect(mockFn0).toHaveBeenCalledTimes(0)
  expect(mockFn1).toHaveBeenCalledTimes(0)
  expect(mockFn2).toHaveBeenCalledTimes(1)
  expect(mockFn3).toHaveBeenCalledTimes(0)
})
