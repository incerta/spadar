import fs from 'fs'
import { initCli, collectFlags } from '../utils/command-line'

it('collectFlags: RequiredPropSchema should throw if required flag value is not specified', () => {
  let stringThrown = false
  try {
    collectFlags({ x: 'string' }, ['--x'])
  } catch (_) {
    stringThrown = true
  }
  expect(stringThrown).toBe(true)

  let numberThrown = false
  try {
    collectFlags({ x: 'number' }, ['--x'])
  } catch (_) {
    numberThrown = true
  }
  expect(numberThrown).toBe(true)

  let bufferThrown = false
  try {
    collectFlags({ x: 'Buffer' }, ['--x'])
  } catch (_) {
    bufferThrown = true
  }
  expect(bufferThrown).toBe(true)
})

it('collectFlags: "Buffer" schemas should assume filePath as source of the Buffer', () => {
  const value = 'STRING_VALUE'
  const dirPath = process.cwd() + '/tmp'
  const filePath = dirPath + '/buffer-check-file-source.jpg'

  fs.mkdirSync(dirPath, { recursive: true })
  fs.writeFileSync(filePath, value)

  const { x } = collectFlags({ x: 'Buffer' }, ['--x', filePath])

  expect(x instanceof Buffer).toBe(true)
  expect(x.toString()).toBe(value)

  const { y } = collectFlags({ y: 'Buffer' }, ['--y', filePath])

  expect(y instanceof Buffer).toBe(true)
  expect(y.toString()).toBe(value)
})

it('collectFlags: "boolean" PropSchema case should not throw in absense of value', () => {
  let isThrown = false
  try {
    collectFlags({ x: 'boolean' }, ['--x'])
  } catch (_) {
    isThrown = true
  }
  expect(isThrown).toBe(false)
})

it(`collectFlags: OptionalPropSchema entries with required=true and default=undefined
                  should throw in absence of value`, () => {
  let stringThrown = false
  try {
    collectFlags({ x: { type: 'string', required: true } }, ['--x'])
  } catch (_) {
    stringThrown = true
  }
  expect(stringThrown).toBe(true)

  let numberThrown = false
  try {
    collectFlags({ x: { type: 'number', required: true } }, ['--x'])
  } catch (_) {
    numberThrown = true
  }
  expect(numberThrown).toBe(true)

  let bufferThrown = false
  try {
    collectFlags({ x: { type: 'Buffer', required: true } }, ['--x'])
  } catch (_) {
    bufferThrown = true
  }
  expect(bufferThrown).toBe(true)
})

// TODO: We currently cannot distinguish whether a value is the next flag
//       or if it is the actual value. We should rely on the schema
//       to distinguish this for us. However, this would require the refactoring of the 'parseFlags`
//       function: we would need to split all flags into pairs, but we need to take care with
//       the `boolean` type schemas. This is because we assume that if a flag
//       is specified without a value, then the value is implicitly `true`.
it.todo('parseFlags: should throw if flag is specified but value is not')

it('collectFlags: RequiredPropSchema cases', () => {
  expect(collectFlags({ x: 'string' }, ['--x', 'xValue'])).toEqual({
    x: 'xValue',
  })

  expect(collectFlags({ x: 'number' }, ['--x', '1.55'])).toEqual({
    x: 1.55,
  })

  expect(collectFlags({ x: 'number' }, ['--x', '124'])).toEqual({
    x: 124,
  })

  expect(collectFlags({ x: 'boolean' }, ['--x'])).toEqual({ x: true })
  expect(collectFlags({ x: 'boolean' }, ['--x', 'true'])).toEqual({ x: true })
  expect(collectFlags({ x: 'boolean' }, [])).toEqual({ x: false })
})

it('collectFlags: OptionalPropSchema cases', () => {
  expect(collectFlags({ x: { type: 'string' } }, [])).toEqual({})
  expect(collectFlags({ x: { type: 'string' } }, ['--x', 'check'])).toEqual({
    x: 'check',
  })

  expect(collectFlags({ x: { type: 'number' } }, [])).toEqual({})
  expect(collectFlags({ x: { type: 'number' } }, ['--x', '58'])).toEqual({
    x: 58,
  })

  expect(collectFlags({ x: { type: 'Buffer' } }, [])).toEqual({})

  expect(collectFlags({ x: { type: 'boolean' } }, ['--x'])).toEqual({ x: true })
  expect(collectFlags({ x: { type: 'boolean' } }, [])).toEqual({})
})

it('collectFlags: OptionalPropSchema with default values', () => {
  expect(collectFlags({ x: { type: 'string', default: 'check' } }, [])).toEqual(
    { x: 'check' }
  )

  expect(collectFlags({ x: { type: 'number', default: 12 } }, [])).toEqual({
    x: 12,
  })

  expect(collectFlags({ x: { type: 'boolean', default: true } }, [])).toEqual({
    x: true,
  })

  const bufferResult = collectFlags(
    { x: { type: 'Buffer', default: Buffer.from('check') } },
    []
  )

  expect(
    collectFlags(
      { x: { type: 'stringUnion', of: ['tic', 'tac'], default: 'tac' } },
      []
    )
  ).toEqual({
    x: 'tac',
  })

  expect(bufferResult.x?.toString()).toBe('check')
})

it('initCli: should throw error when empty string is found in "commandPath"', () => {
  let isThrown = false

  try {
    initCli([
      [[], {}, () => undefined],
      [['check', ''], {}, () => undefined],
    ])([])
  } catch (_) {
    isThrown = true
  }

  expect(isThrown).toBe(true)
})

it('initCli: should throw error if flags is found in "commandPath"', () => {
  let isThrown1 = false

  try {
    initCli([
      [[], {}, () => undefined],
      [['check'], {}, () => undefined],
      [['-withFlag'], {}, () => undefined],
    ])([])
  } catch (_) {
    isThrown1 = true
  }

  expect(isThrown1).toBe(true)

  let isThrown2 = false

  try {
    initCli([
      [[], {}, () => undefined],
      [['check'], {}, () => undefined],
      [['-withFlag'], {}, () => undefined],
    ])([])
  } catch (_) {
    isThrown2 = true
  }

  expect(isThrown2).toBe(true)
})

it('initCli: should throw error when whitespace is found in "commandPath" arr', () => {
  /* case 1 */

  let isThrownCase1 = false

  try {
    initCli([
      [['check'], {}, () => undefined],
      [['check', 'che ck'], {}, () => undefined],
    ])([])
  } catch (_) {
    isThrownCase1 = true
  }

  expect(isThrownCase1).toBe(true)

  /* case 2 */

  let isThrownCase2 = false

  try {
    initCli([
      [['check'], {}, () => undefined],
      [['check', 'che\nck'], {}, () => undefined],
    ])([])
  } catch (_) {
    isThrownCase2 = true
  }

  expect(isThrownCase2).toBe(true)
})

it('initCli: should throw error if found "commandPath" duplicates', () => {
  /* case 0 */

  let isThrownCase0 = false

  try {
    initCli([
      [[], {}, () => undefined],
      [['one'], {}, () => undefined],
    ])([])
  } catch (_) {
    isThrownCase0 = true
  }

  expect(isThrownCase0).toBe(false)

  /* case 1 */

  let isThrownCase1 = false

  try {
    initCli([
      [[], {}, () => undefined],
      [[], {}, () => undefined],
    ])([])
  } catch (_) {
    isThrownCase1 = true
  }

  expect(isThrownCase1).toBe(true)

  /* case 2 */

  let isThrownCase2 = false

  try {
    initCli([
      [[], {}, () => undefined],
      [['check'], {}, () => undefined],
      [[], {}, () => undefined],
    ])([])
  } catch (_) {
    isThrownCase2 = true
  }

  expect(isThrownCase2).toBe(true)

  /* case 3 */

  let isThrownCase3 = false

  try {
    initCli([
      [[], {}, () => undefined],
      [['check'], {}, () => undefined],
      [['check'], {}, () => undefined],
    ])([])
  } catch (_) {
    isThrownCase3 = true
  }

  expect(isThrownCase3).toBe(true)

  /* case 4 */

  let isThrownCase4 = false

  try {
    initCli([
      [[], {}, () => undefined],
      [['check', 'one'], {}, () => undefined],
      [['check', 'two'], {}, () => undefined],
      [['check', 'one'], {}, () => undefined],
    ])([])
  } catch (_) {
    isThrownCase4 = true
  }

  expect(isThrownCase4).toBe(true)
})

it('initCli: should throw if there is no command match for the given "argv"', () => {
  let isThrown = false

  try {
    initCli([[['not-check'], {}, () => undefined]])(['check'])
  } catch (_) {
    isThrown = true
  }

  expect(isThrown).toBe(true)
})

it('initCli: should call empty "commandPath" callback if "argv" is empty', () => {
  const mockFn0 = jest.fn()
  const mockFn1 = jest.fn()

  initCli([
    [[], {}, mockFn0],
    [['case1'], {}, mockFn1],
  ])([])

  expect(mockFn0).toHaveBeenCalledTimes(1)
  expect(mockFn1).toHaveBeenCalledTimes(0)
})

it('initCli: should call correct command commandPath.length === 1', () => {
  const mockFn0 = jest.fn()
  const mockFn1 = jest.fn()
  const mockFn2 = jest.fn()
  const mockFn3 = jest.fn()

  initCli([
    [[], {}, mockFn0],
    [['case1'], {}, mockFn1],
    [['case2'], {}, mockFn2],
    [['case3'], {}, mockFn3],
  ])(['case2'])

  expect(mockFn0).toHaveBeenCalledTimes(0)
  expect(mockFn1).toHaveBeenCalledTimes(0)
  expect(mockFn2).toHaveBeenCalledTimes(1)
  expect(mockFn3).toHaveBeenCalledTimes(0)
})

it('initCli: should call correct command commandPath.length === 2', () => {
  const mockFn1 = jest.fn()
  const mockFn2 = jest.fn()
  const mockFn3 = jest.fn()

  initCli([
    [['case1', 'subCase1'], {}, mockFn1],
    [['case2', 'subCase2'], {}, mockFn2],
    [['case3', 'subCase3'], {}, mockFn3],
  ])(['case2', 'subCase2'])

  expect(mockFn1).toHaveBeenCalledTimes(0)
  expect(mockFn2).toHaveBeenCalledTimes(1)
  expect(mockFn3).toHaveBeenCalledTimes(0)
})

it('initCli: should call correct command commandPath.length === 3', () => {
  const mockFn1 = jest.fn()
  const mockFn2 = jest.fn()
  const mockFn3 = jest.fn()

  initCli([
    [['case', 'subCase', 'subSubCase'], {}, mockFn1],
    [['case', 'subCase', 'subSubCase2'], {}, mockFn2],
    [['case', 'subCase', 'uniqueCase'], {}, mockFn3],
  ])(['case', 'subCase', 'uniqueCase'])

  expect(mockFn1).toHaveBeenCalledTimes(0)
  expect(mockFn2).toHaveBeenCalledTimes(0)
  expect(mockFn3).toHaveBeenCalledTimes(1)
})

it('initCli: should parse flags properly', () => {
  let resultFlags: unknown

  initCli([
    [
      ['check'],
      {
        stringCase: 'string',
        numberCase: 'number',
        booleanCaseFalse: 'boolean',
        booleanCaseTrue: 'boolean',
        justFlagBooleanCase: 'boolean',
        noFlagBooleanCase: 'boolean',
        bufferCase: 'Buffer',
        optionalDefaultStringSpecified: { type: 'string', default: 'default' },
        optionalDefaultStringNotSpecified: {
          type: 'string',
          default: 'default',
        },
      },
      (parsedFlags) => {
        resultFlags = parsedFlags
      },
    ],
  ])([
    'check',
    '--stringCase',
    'stringCaseValue',
    '--numberCase',
    '12',
    '--booleanCaseFalse',
    'false',
    '--booleanCaseTrue',
    'true',
    '--justFlagBooleanCase',
    '--optionalDefaultStringSpecified',
    'optionalDefaultStringSpecifiedValue',
  ])

  expect(resultFlags).toEqual({
    stringCase: 'stringCaseValue',
    numberCase: 12,
    booleanCaseFalse: false,
    booleanCaseTrue: true,
    justFlagBooleanCase: true,
    noFlagBooleanCase: false,
    optionalDefaultStringSpecified: 'optionalDefaultStringSpecifiedValue',
    optionalDefaultStringNotSpecified: 'default',
  })
})
