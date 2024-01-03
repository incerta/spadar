import {
  isAsyncIterable,
  getMediator,
  getMediatorFunction,
} from '../utils/mediator'

import * as I from '../types'

it('isAsyncIterable: true/false cases', async () => {
  const iterable = {
    [Symbol.asyncIterator]: async function* () {
      yield 'value1'
      yield 'value2'
    },
  } as unknown

  expect(isAsyncIterable(iterable)).toBe(true)
  expect(isAsyncIterable({})).toBe(false)

  if (isAsyncIterable(iterable)) {
    for await (const x of iterable) {
      expect(typeof x).toBe('string')
    }
  } else {
    // @ts-expect-error checking typeguard
    for await (const x of iterable) {
      expect(typeof x).toBe('string')
    }
  }
})

it('getMediatorFunction: staticInStaticOut.string.string happy path', async () => {
  const EXPECTED_KEYS = {
    one: 'oneValue',
    two: 'twoValue',
  }
  const EXPECTED_OPTIONS = {
    model: 'test-model',
  }

  const EXPECTED_INPUT_UNIT = 'EXPECTED_INPUT_UNIT'
  const EXPECTED_OUTPUT_UNIT = 'EXPECTED_OUTPUT_UNIT'

  let resultKeys, resultOptions, resultInputUnit

  const adapterFunction: I.AdapterFunction = async (
    keys,
    options,
    inputUnit
  ) => {
    resultKeys = keys
    resultOptions = options
    resultInputUnit = inputUnit

    return EXPECTED_OUTPUT_UNIT
  }

  const modifiedFunction = getMediatorFunction(
    {
      transferMethod: 'staticInStaticOut',
      keys: EXPECTED_KEYS,
      optionsSchema: {
        model: {
          type: 'stringUnion',
          required: true,
          of: [EXPECTED_OPTIONS.model],
        },
      },
      inputSchema: 'string',
      outputSchema: 'string',
    },
    adapterFunction
  )

  const resultOutput = await modifiedFunction(
    EXPECTED_OPTIONS,
    EXPECTED_INPUT_UNIT
  )

  expect(resultKeys).toEqual(EXPECTED_KEYS)
  expect(resultOptions).toEqual(EXPECTED_OPTIONS)
  expect(resultInputUnit).toEqual(EXPECTED_INPUT_UNIT)
  expect(resultOutput).toEqual(EXPECTED_OUTPUT_UNIT)
})

it('getMediatorFunction: should throw if runtime options is not satisfy the schema', async () => {
  const MODEL_VALUE = 'MODEL_VALUE'
  const adapterFunction: I.AdapterFunction = async () => {
    return 'outputValue'
  }

  const modifiedFunction = getMediatorFunction(
    {
      transferMethod: 'staticInStaticOut',
      keys: {},
      optionsSchema: {
        model: { type: 'stringUnion', required: true, of: [MODEL_VALUE] },
        extraProp: { type: 'string', required: true },
      },
      inputSchema: 'string',
      outputSchema: 'string',
    },
    adapterFunction
  )

  let isThrown = false

  try {
    await modifiedFunction({ model: MODEL_VALUE }, {})
  } catch (_) {
    isThrown = true
  }

  expect(isThrown).toBe(true)
})

it('getMediatorFunction: should update model options with default schema values before validation', async () => {
  const MODEL_VALUE = 'MODEL_VALUE'
  const EXTRA_PROP_DEFAULT_VALUE = 'EXTRA_PROP_DEFAULT_VALUE'

  let receivedModelOptions

  const adapterFunction: I.AdapterFunction = async (_keys, modelOptions) => {
    receivedModelOptions = modelOptions
    return 'outputValue'
  }

  const modifiedFunction = getMediatorFunction(
    {
      transferMethod: 'staticInStaticOut',
      keys: {},
      optionsSchema: {
        model: { type: 'stringUnion', required: true, of: [MODEL_VALUE] },
        extraProp: {
          type: 'string',
          required: true,
          default: EXTRA_PROP_DEFAULT_VALUE,
        },
      },
      inputSchema: 'string',
      outputSchema: 'string',
    },
    adapterFunction
  )

  await modifiedFunction({ model: MODEL_VALUE }, 'stringValue')

  expect(receivedModelOptions).toEqual({
    model: MODEL_VALUE,
    extraProp: EXTRA_PROP_DEFAULT_VALUE,
  })
})

it('getMediatorFunction: should throw if input unit is not satisfy the schema', async () => {
  const MODEL_VALUE = 'MODEL_VALUE'
  const EXTRA_PROP_DEFAULT_VALUE = 'EXTRA_PROP_DEFAULT_VALUE'

  const adapterFunction: I.AdapterFunction = async () => {
    return 'outputValue'
  }

  const modifiedFunction = getMediatorFunction(
    {
      transferMethod: 'staticInStaticOut',
      keys: {},
      optionsSchema: {
        model: { type: 'stringUnion', required: true, of: [MODEL_VALUE] },
        extraProp: {
          type: 'string',
          required: true,
          default: EXTRA_PROP_DEFAULT_VALUE,
        },
      },
      inputSchema: 'string',
      outputSchema: 'string',
    },
    adapterFunction
  )

  let isThrown = false

  try {
    await modifiedFunction({ model: MODEL_VALUE }, {})
  } catch (_) {
    isThrown = true
  }

  expect(isThrown).toBe(true)
})

it('getMediatorFunction: should throw if INPUT unit STREAM is not satisfy the schema', async () => {
  const MODEL_VALUE = 'MODEL_VALUE'

  const adapterFunction: I.AdapterFunction = async (
    _keys,
    _options,
    streamOfUnit
  ) => {
    const { stream } = streamOfUnit as I.StreamOf<unknown>
    if (isAsyncIterable(stream)) {
      for await (const x of stream) {
        if (x) {
          continue
        }
      }
    }

    return 'outputValue'
  }

  const modifiedFunction = getMediatorFunction(
    {
      transferMethod: 'streamInStaticOut',
      keys: {},
      optionsSchema: {
        model: { type: 'stringUnion', required: true, of: [MODEL_VALUE] },
      },
      inputSchema: 'string',
      outputSchema: 'string',
    },
    adapterFunction
  )

  const stream: AsyncIterable<string | number> = {
    [Symbol.asyncIterator]: async function* () {
      yield 'validChunk1'
      yield 'validChunk2'
      yield 12
    },
  }

  let isThrown = false

  try {
    await modifiedFunction({ model: MODEL_VALUE }, { stream })
  } catch (error) {
    isThrown = true
  }

  expect(isThrown).toBe(true)
})

it('getMediatorFunction: should throw if OUTPUT unit STREAM is not satisfy the schema', async () => {
  const MODEL_VALUE = 'MODEL_VALUE'
  const UNIT_ID = 'UNIT_ID'

  const adapterFunction: I.AdapterFunction = async () => {
    const stream: AsyncIterable<unknown> = {
      [Symbol.asyncIterator]: async function* () {
        yield { unitId: UNIT_ID, payload: 'case1' }
        yield { unitId: UNIT_ID, payload: 'case2' }
        yield { unitId: UNIT_ID, payload: 12 }
      },
    }

    return { stream }
  }

  const modifiedFunction = getMediatorFunction(
    {
      transferMethod: 'staticInStreamOut',
      keys: {},
      optionsSchema: {
        model: { type: 'stringUnion', required: true, of: [MODEL_VALUE] },
      },
      inputSchema: 'string',
      outputSchema: {
        unitId: { type: 'stringUnion', required: true, of: [UNIT_ID] },
        payload: 'string',
      },
    },
    adapterFunction
  )

  let isThrown = false

  try {
    const { stream } = (await modifiedFunction(
      { model: MODEL_VALUE },
      'inputUnitValue'
    )) as I.StreamOf<unknown>

    for await (const x of stream) {
      if (x) {
        continue
      }
    }
  } catch (error) {
    isThrown = true
  }

  expect(isThrown).toBe(true)
})

it.skip('getMediator: staticToStatic should validate input/output UNIT', async () => {
  const ADAPTER_NAME = 'test-adapter'
  const CONNECTOR_ID = 'test-connector'
  const EXPECTED_VALUE = 'RESOLVE_VALUE'
  const SHOULD_RESOLVE_INVALID_TYPE = 'SHOULD_RESOLVE_INVALID_TYPE'

  const mediator = getMediator([
    {
      path: 'SPADAR_TEST_CASE',
      requiredKeys: {},
      specifiedKeys: {},
      ready: true,
      adapter: {
        version: '0.0.1',
        name: ADAPTER_NAME,
        schema: [
          {
            id: CONNECTOR_ID,
            keys: [],
            options: {
              model: { type: 'stringUnion', of: ['x'], required: true },
            },
            supportedIO: [
              {
                type: 'textToText',
                io: {
                  staticInStaticOut: [['string', 'string']],
                },
              },
            ],
          },
        ],

        connectors: {
          [CONNECTOR_ID]: {
            textToText: {
              string: {
                string: (_options, _keys, unit) =>
                  new Promise((resolve) => {
                    if (unit === SHOULD_RESOLVE_INVALID_TYPE) {
                      return resolve(12)
                    }
                    resolve(EXPECTED_VALUE)
                  }),
              },
            },
          },
        },
      },
    },
  ])

  const transformerFn =
    mediator.textToText?.[ADAPTER_NAME]?.[CONNECTOR_ID]?.string?.string

  if (typeof transformerFn === 'undefined') {
    throw Error('The expected `transformerFn` is not found')
  }

  /* No throw case */

  expect(await transformerFn({}, 'stringValue')).toBe(EXPECTED_VALUE)

  /* Throw on invalid input */

  let isThrownOnInput = false

  try {
    await transformerFn({}, 12)
  } catch (_) {
    isThrownOnInput = true
  }

  expect(isThrownOnInput).toBe(true)

  /* Throw on invalid output */

  let isThrownOnOutput = false

  try {
    await transformerFn({}, SHOULD_RESOLVE_INVALID_TYPE)
  } catch (_) {
    isThrownOnOutput = true
  }

  expect(isThrownOnOutput).toBe(true)
})

it.todo('getMediator: staticToStream – validate output UNIT stream chunks')
it.todo('getMediator: streamToStatic – validate input UNIT stream chunks')

it.todo('getMediator: should skip used adapters that are not ready')
it.todo('getMediator: should skip used adapters that has no `adapter` API')
