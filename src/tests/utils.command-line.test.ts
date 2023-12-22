import dedent from 'dedent'
import { runCli } from '../utils/command-line'

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

  it('Not perfect match intersect the perfect match depends on the order', () => {
    // FIXME: This case is too counterintuitive.
    //        One might expect that a perfect match
    //        of the `mockFn3` would be more appropriate.
    //        We should either throw an exception for it
    //        and force the user to build a hierarchy of the commands
    //        or just use the perfect match instead of the partial one.

    const mockFn1 = jest.fn()
    const mockFn2 = jest.fn()

    runCli(['case', 'subCase'])([
      [['case', 'subCase', 'subSubCase'], {}, mockFn1],
      [['case', 'subCase'], {}, mockFn2],
    ])

    expect(mockFn1).toHaveBeenCalledTimes(1)
    expect(mockFn2).toHaveBeenCalledTimes(0)

    const mockFn3 = jest.fn()
    const mockFn4 = jest.fn()

    runCli(['case', 'subCase'])([
      [['case', 'subCase', 'subSubCase'], {}, mockFn3],
      [['case', 'subCase'], {}, mockFn4],
    ])

    expect(mockFn3).toHaveBeenCalledTimes(1)
    expect(mockFn4).toHaveBeenCalledTimes(0)
  })
})

it.todo(
  'runCli: should slice "argv" before passing to the command callback "restArgv"'
)
it.todo(
  'runCli: should show --help if specified command is not exists and exist with code 1'
)
it.todo(dedent`
  runCli: in case we have two or more commands that have a partial match,
          the "runCli" function should proceed with the first one
`)
