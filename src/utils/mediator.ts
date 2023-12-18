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
                      [outputAccessor: string]:
                        | undefined
                        | ((
                            options: Record<string, unknown>,
                            unit: unknown | unknown[]
                          ) => Promise<unknown>)
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

export const getMediator = (adapters: AvailableAdapter[]): Mediator => {
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

            const updatedFunction = (
              options: Record<string, unknown>,
              unit: unknown | unknown[]
            ) => {
              /* Mix in keys from `RESOURCES_DIR/used-adapters.json` */
              const keys = connector.keys.reduce<Record<string, string>>(
                (acc, { key }) => {
                  acc[key] = availableAdapter.specifiedKeys[key]
                  return acc
                },
                {}
              )

              /* Add default options props from schema if they are not specified */
              const updatedOptions = { ...options }

              Object.keys(connector.options).forEach((optionKey) => {
                if (typeof updatedOptions[optionKey] !== 'undefined') {
                  return
                }

                const optionProp = connector.options[optionKey]

                if (typeof optionProp !== 'object') {
                  return
                }

                if (typeof optionProp.default === 'undefined') {
                  return
                }

                updatedOptions[optionKey] = optionProp.default
              })

              // FIXME: put input/output unit validators here
              //        here also we can count and log payload in/out
              //        for the given adapter, also defaultify output unit,
              //        validation of the output value including stream chunks
              //        is important for MEDIATOR because it ensure the contract
              //        between the MEDIATOR API user and ADAPTER

              /* Add default unit props from schema if they are not specified */

              const updatedInputUnit = (() => {
                if (Array.isArray(input)) {
                  const [unitSchema] = input

                  if (typeof unitSchema === 'string') {
                    return unit
                  }

                  if (Array.isArray(unit)) {
                    return unit.map((x) => getDefaultifiedUnit(unitSchema, x))
                  }

                  throw new SpadarError('Unit type error')
                }

                const unitSchema = input

                if (typeof unitSchema === 'string') {
                  return unit
                }

                /**
                 * `as` is justified because we excluded other cases by
                 * the checks above and validation phase
                 **/
                return getDefaultifiedUnit(
                  unitSchema,
                  unit as I.ObjectUnitSchema
                )
              })()

              return adapterFunction(keys, updatedOptions, updatedInputUnit)
            }

            mediator[transformationIOSchema.type] =
              mediator[transformationIOSchema.type] || {}

            const transformationScope =
              mediator[transformationIOSchema.type] || {}

            transformationScope[availableAdapter.name] =
              transformationScope[availableAdapter.name] || {}

            const adapterScope =
              transformationScope[availableAdapter.name] || {}

            adapterScope[connector.id] = adapterScope[connector.id] || {}

            const connectorScope = adapterScope[connector.id] || {}

            connectorScope[inputAccessor] = connectorScope[inputAccessor] || {}

            const inputScope = connectorScope[inputAccessor] || {}

            inputScope[outputAccessor] = updatedFunction
          })
        })
      })
    })
  })

  return mediator
}
