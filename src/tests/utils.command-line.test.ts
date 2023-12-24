import { runCli } from '../utils/command-line'

it.todo('collectFlags: write test cases for the function')

it.todo('runCli: should throw error if flags are found amongst "commandPath"')

it('runCli: should throw error when empty string is found in "commandPath" arr', () => {
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

it('runCli: should throw error when whitespace is found in "commandPath" arr', () => {
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

it('runCli: should throw error if found "commandPath" duplicates', () => {
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

it('runCli: should throw if there is no command match for the given "argv"', () => {
  let isThrown = false

  try {
    runCli(['check'])([[['not-check'], {}, () => undefined]])
  } catch (_) {
    isThrown = true
  }

  expect(isThrown).toBe(true)
})

it('runCli: should call empty "commandPath" callback if "argv" is empty', () => {
  const mockFn0 = jest.fn()
  const mockFn1 = jest.fn()

  runCli([])([
    [[], {}, mockFn0],
    [['case1'], {}, mockFn1],
  ])

  expect(mockFn0).toHaveBeenCalledTimes(1)
  expect(mockFn1).toHaveBeenCalledTimes(0)
})

describe('runCli: should call correct command callback for the given "argv"', () => {
  it('commandPath.length === 1', () => {
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

  it('commandPath.length === 2', () => {
    const mockFn1 = jest.fn()
    const mockFn2 = jest.fn()
    const mockFn3 = jest.fn()

    runCli(['case2', 'subCase2'])([
      [['case1', 'subCase1'], {}, mockFn1],
      [['case2', 'subCase2'], {}, mockFn2],
      [['case3', 'subCase3'], {}, mockFn3],
    ])

    expect(mockFn1).toHaveBeenCalledTimes(0)
    expect(mockFn2).toHaveBeenCalledTimes(1)
    expect(mockFn3).toHaveBeenCalledTimes(0)
  })

  it('commandPath.length === 3', () => {
    const mockFn1 = jest.fn()
    const mockFn2 = jest.fn()
    const mockFn3 = jest.fn()

    runCli(['case', 'subCase', 'uniqueCase'])([
      [['case', 'subCase', 'subSubCase'], {}, mockFn1],
      [['case', 'subCase', 'subSubCase2'], {}, mockFn2],
      [['case', 'subCase', 'uniqueCase'], {}, mockFn3],
    ])

    expect(mockFn1).toHaveBeenCalledTimes(0)
    expect(mockFn2).toHaveBeenCalledTimes(0)
    expect(mockFn3).toHaveBeenCalledTimes(1)
  })
})

it.todo('runCli: should parse flags properly')
