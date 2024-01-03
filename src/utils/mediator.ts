import dedent from 'dedent'

import { AvailableAdapter } from './adapter'
import { SpadarError } from './error'
import * as schema from './schema'

import * as I from '../types'

/**
 * The MEDIATOR is grouping together APIs of the used adapters
 * in the one object for internal usage. Spadar can generate
 * narrow type of MEDIATOR API for external usage but in
 * spadar source code we can't do that.
 *
 * MEDIATOR API functions has no required `keys` argument
 * we using keys specified in the `used-adapters.json` file
 *
 * We also skipping functions that are not actually specified
 * (signed as CONNECTOR signature function)
 *
 * What we are doing is creating one entry point
 * for all ADAPTER connector functions which are grouped
 * by `I.Transformation` method and where `inputAccessor`
 * and `outputAccessor` implies `I.TransferMethod`
 *
 * @example {
 *   textToText: {
 *     'spadar-openai': {
 *       GPT: {
 *         'string': {
 *           'string': (options, unit) => new Promise(() => ... )
 *         }
 *       }
 *     }
 *   }
 * }
 **/
export type Mediator = {
  [k in I.Transformation]?: {
    [adapterName: string]:
      | undefined
      | {
          [connectorId: string]:
            | undefined
            | {
                [inputAccessor: string]:
                  | undefined
                  | {
                      [outputAccessor: string]: undefined | I.MediatorFunction
                    }
              }
        }
  }
}

/**
 * Add default values from schema to props that are not specified
 **/
const getDefaultifiedUnit = (
  schema: I.ObjectUnitSchema,
  runtimeObjectUnit: Record<string, unknown>
): Record<string, unknown> => {
  const result = { ...runtimeObjectUnit }

  for (const key in schema) {
    if (typeof result[key] !== 'undefined') {
      continue
    }

    const propSchema = schema[key]

    if (typeof propSchema === 'string') {
      continue
    }

    if (typeof propSchema.default === 'undefined') {
      continue
    }

    result[key] = propSchema.default
  }

  return result
}

/**
 * Add default values from `modelOptionsSchema` to `modelOptions`
 * props that are not specified. Validate the result by schema
 **/
export const getUpdatedModelOptions = (
  modelOptionsSchema: I.ModelOptionsSchema,
  modelOptions: Record<string, unknown>
): Record<string, unknown> => {
  // TODO: move options update/validation to separate function
  const updatedOptions = { ...modelOptions }

  Object.keys(modelOptionsSchema).forEach((optionKey) => {
    if (typeof updatedOptions[optionKey] !== 'undefined') {
      return
    }

    const optionProp = modelOptionsSchema[optionKey]

    if (typeof optionProp !== 'object') {
      return
    }

    if (typeof optionProp.default === 'undefined') {
      return
    }

    updatedOptions[optionKey] = optionProp.default
  })

  /* Validate given modelOptions */

  const optionsValidationResult = schema.validateBySchema(
    modelOptionsSchema,
    updatedOptions
  )

  if (optionsValidationResult !== true) {
    throw Error(dedent`
        Provided "modelOptions" is not satisfy given "optionsSchema":
        errorType: "${optionsValidationResult.errorType}"
        schemaKey: "${optionsValidationResult.schemaKey}"
        receivedValue: "${updatedOptions[optionsValidationResult.schemaKey]}"
      `)
  }

  return updatedOptions
}

// TODO: the errors is too vague when we have an error
//       while validating stream AsyncIterable item
export const getSingularUnitWithDefaultValues = (
  unitSchema: I.UnitSchema,
  ioType: 'input' | 'output',
  runtimeUnit: unknown
) => {
  if (unitSchema === 'Buffer') {
    if (runtimeUnit instanceof Buffer === false) {
      throw Error(dedent`
        The received ${ioType} unit is not satisfy given schema
        we expect received value to be instance of "Buffer"
        receivedValue: ${runtimeUnit}
      `)
    }

    return runtimeUnit
  }

  if (unitSchema === 'string') {
    if (typeof runtimeUnit !== 'string') {
      throw Error(dedent`
        The received ${ioType} unit is not satisfy given schema
        we expect received value to be typeof "string"
        typeof runtimeUnit: ${typeof runtimeUnit}
      `)
    }

    return runtimeUnit
  }

  if (typeof runtimeUnit !== 'object') {
    throw Error(dedent`
      The received ${ioType} unit is not satisfy given schema
      we expect received value to be "object" type
      typeof inputUnitItem: ${typeof runtimeUnit}
    `)
  }

  const updatedUnit = getDefaultifiedUnit(
    unitSchema,
    runtimeUnit as Record<string, unknown>
  )

  const updatedUnitValidationResult = schema.validateUnit(
    unitSchema,
    updatedUnit
  )

  if (updatedUnitValidationResult !== true) {
    if (typeof updatedUnitValidationResult === 'object') {
      throw Error(dedent`
        The received ${ioType} unit is not satisfy given schema
        errorType: ${updatedUnitValidationResult.errorType}
        schemaKey: ${updatedUnitValidationResult.schemaKey}
      `)
    }

    throw Error(dedent`
      The received ${ioType} unit is not satisfy given schema
    `)
  }

  return updatedUnit
}

// FIXME: write unit tests
const getUpdatedUnitOrOrder = (
  ioUnitSchema: I.IOUnitSchema,
  ioType: 'input' | 'output',
  runtimeValue: unknown
): unknown => {
  if (Array.isArray(ioUnitSchema)) {
    const [unitSchema] = ioUnitSchema

    if (Array.isArray(runtimeValue)) {
      return runtimeValue.map((inputUnitItem) => {
        return getSingularUnitWithDefaultValues(
          unitSchema,
          ioType,
          inputUnitItem
        )
      })
    } else {
      throw Error(dedent`
        The received ${ioType} unit is not satisfy given schema
        we expect the array of units but received something else
        receivedValue: ${runtimeValue}
      `)
    }
  }

  return getSingularUnitWithDefaultValues(ioUnitSchema, ioType, runtimeValue)
}

export const isAsyncIterable = (x: unknown): x is AsyncIterable<unknown> => {
  if (typeof x !== 'object') return false
  const obj = x as { [Symbol.asyncIterator]?: unknown }
  return typeof obj?.[Symbol.asyncIterator] === 'function'
}

export const getUpdatedStreamOf = (
  unitIOSchema: I.IOUnitSchema,
  runtimeValue: unknown,
  ioType: 'input' | 'output'
): I.StreamOf<unknown> => {
  const invalidStreamErrorMessage = `
        The ${ioType} unit we have received is not matching the schema.
        Expected StreamOf<unknown> ${ioType} but received something else.
      `

  if (typeof runtimeValue !== 'object' || runtimeValue === null) {
    throw Error(dedent(invalidStreamErrorMessage))
  }

  const { stream, stop, pause, resume } = runtimeValue as I.StreamOf<unknown>

  const updatedStream = {
    [Symbol.asyncIterator]: async function* () {
      if (isAsyncIterable(stream)) {
        for await (const iterableUnit of stream) {
          yield getUpdatedUnitOrOrder(unitIOSchema, ioType, iterableUnit)
        }
      } else {
        throw Error(dedent(invalidStreamErrorMessage))
      }
    },
  }

  return {
    stream: updatedStream,
    stop,
    pause,
    resume,
  }
}

/**
 * Pass default values from schema if they are not specified
 * for options, input/output units and exclude `keys` argument
 * in the result function. Validate each input/output unit
 * including StreamOf<T> AsyncIterable<T> elements
 **/
export const getMediatorFunction =
  (
    ctx: {
      transferMethod: I.TransferMethod
      keys: Record<string, string>
      optionsSchema: I.ModelOptionsSchema
      inputSchema: I.IOUnitSchema
      outputSchema: I.IOUnitSchema
    },
    adapterFunction: I.AdapterFunction
  ): I.MediatorFunction =>
  async (modelOptions: Record<string, unknown>, inputUnit: unknown) => {
    // TODO: we probably should assume that `modelOptions` has `unknown` type
    const updatedOptions = getUpdatedModelOptions(
      ctx.optionsSchema,
      modelOptions
    )

    const updatedInputUnit =
      ctx.transferMethod === 'streamInStaticOut' ||
      ctx.transferMethod === 'streamInStreamOut'
        ? getUpdatedStreamOf(ctx.inputSchema, inputUnit, 'input')
        : getUpdatedUnitOrOrder(ctx.inputSchema, 'input', inputUnit)

    if (
      ctx.transferMethod === 'staticInStreamOut' ||
      ctx.transferMethod === 'streamInStreamOut'
    ) {
      return getUpdatedStreamOf(
        ctx.outputSchema,
        await adapterFunction(ctx.keys, updatedOptions, updatedInputUnit),
        'output'
      )
    }

    return adapterFunction(ctx.keys, updatedOptions, updatedInputUnit)
  }

export const getMediator = (
  adapters: Array<Omit<AvailableAdapter, 'version' | 'name'>>
): Mediator => {
  const mediator: Mediator = {}

  adapters.forEach((availableAdapter) => {
    if (!availableAdapter.ready || !availableAdapter.adapter) {
      return
    }

    availableAdapter.adapter.schema.forEach((connector) => {
      connector.supportedIO.forEach((transformationIOSchema) => {
        Object.keys(transformationIOSchema.io).forEach((x: unknown) => {
          const transferMethod = x as I.TransferMethod
          const ioSchemas = transformationIOSchema.io[transferMethod]

          if (!ioSchemas) {
            return
          }

          ioSchemas.forEach(([input, output]) => {
            const inputAccessor = schema.generateIOPrimitive(
              transferMethod,
              'input',
              input
            ).key

            const outputAccessor = schema.generateIOPrimitive(
              transferMethod,
              'output',
              output
            ).key

            const adapterFunction =
              availableAdapter.adapter?.connectors[connector.id]?.[
                transformationIOSchema.type
              ]?.[inputAccessor]?.[outputAccessor]

            if (!adapterFunction || adapterFunction.isSpadarSignature) {
              return
            }

            /* Mix in keys from `RESOURCES_DIR/used-adapters.json` */
            const keys = connector.keys.reduce<Record<string, string>>(
              (acc, { key }) => {
                acc[key] = availableAdapter.specifiedKeys[key]
                return acc
              },
              {}
            )

            const mediatorFunction = getMediatorFunction(
              {
                transferMethod,
                keys,
                optionsSchema: connector.options,
                inputSchema: input,
                outputSchema: output,
              },
              adapterFunction
            )

            const adapterName = availableAdapter.adapter?.name

            if (typeof adapterName !== 'string') {
              throw new SpadarError(
                'The used adapter without API should be exluded before'
              )
            }

            // TODO: we should probably have utility function for such
            //       things. This implementation looks really ugly

            mediator[transformationIOSchema.type] =
              mediator[transformationIOSchema.type] || {}

            const transformationScope =
              mediator[transformationIOSchema.type] || {}

            transformationScope[adapterName] =
              transformationScope[adapterName] || {}

            const adapterScope = transformationScope[adapterName] || {}

            adapterScope[connector.id] = adapterScope[connector.id] || {}

            const connectorScope = adapterScope[connector.id] || {}

            connectorScope[inputAccessor] = connectorScope[inputAccessor] || {}

            const inputScope = connectorScope[inputAccessor] || {}

            inputScope[outputAccessor] = mediatorFunction
          })
        })
      })
    })
  })

  return mediator
}
