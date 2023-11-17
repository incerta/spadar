import dedent from 'dedent'
import { camelCaseToPascalCase } from './str'
import config from '../config'
import * as I from '../types'

export type IOPrimitive = {
  /**
   * Unit key with suffix used in result `AdapterAPI` type
   * for example if we have unit `ObjectUnitSchema.of === 'x'`,
   * `transferMethod === 'streamToStatic` and `ioType === 'input'`
   * and the `unitSchema` specified as tuple the result `key` value
   * should be: `xArrStream`
   **/
  key: string

  /**
   * Present if `unitSchema` extends `ObjectUnitSchema` which will be
   * `ObjectUnitSchema.type` but transformed to PascalCase
   **/
  unitId?: string

  /**
   * Depends on `transferMethod` and `unitSchema`
   * it might be simple types: `string`, `Buffer`
   * or: `UnitId`, `StreamOf<UnitId>`, `UnitId[]`, `StreamOf<UnitId[]>
   * where `UnitId` is the same as `unitId` of the current interface
   **/
  ioUnitTypings: string

  // TODO: seems like we require `unitTypings` only when
  // `unitId` is present, we need to refactor the interface to reflect that
  /**
   * Result type of the `unitSchema` or `unitSchema[0]`
   * so might be identical to `ioUnitTypings` if transfer method
   * is static on both ends and it is not `[I.UnitSchema]` case
   **/
  unitTypings: string
}

/**
 * The structure used for typings generation and API generation
 * from the `AdapterSchema` instance
 **/
export type AdapterAPIStructure = Record<
  string /* transformation type */,
  Record<
    string /* unit input type */,
    Record<string /* unit output type */, string /* function type */>
  >
>

export const STREAM_SUFFIX = 'Stream'
export const ARRAY_SUFFIX = 'Arr'

const REQUIRED_PROPERTY_SCHEMA = new Set<I.RequiredPropertySchema>([
  'Buffer',
  'string',
  'number',
  'boolean',
])

/* Transform `PropertySchema` to typings */
export const propertyToType = (property: I.PropertySchema): string => {
  switch (property) {
    case 'Buffer':
    case 'string':
    case 'number':
    case 'boolean':
      return property

    default: {
      if (property.type === 'literal') {
        if (typeof property.of === 'string') {
          return `'${property.of}'`
        }

        const type = property.of.map((x) => `'${x}'`).join(' | ')

        return type
      }

      return property.type
    }
  }
}

/* Transform `UnitSchema` to typings */
export const unitSchemaToType = (unitSchema: I.UnitSchema) => {
  if (typeof unitSchema !== 'object') {
    return propertyToType(unitSchema)
  }

  const keyValuePair = Object.keys(unitSchema).map((key) => {
    const propertySchema = unitSchema[key]
    const valueType = (() => {
      if (typeof propertySchema === 'string') {
        if (
          REQUIRED_PROPERTY_SCHEMA.has(
            propertySchema as I.RequiredPropertySchema
          )
        ) {
          return propertyToType(propertySchema as I.PropertySchema)
        }

        return `'${propertySchema}'`
      }

      return propertyToType(propertySchema)
    })()

    return `${key}: ${valueType}`
  })

  return `{
  ${keyValuePair.join('\n  ')}
}`
}

/**
 * The base key that will be suffixed by another tool
 * and used in the `AdapterAPI` as intermediate key to access
 * function with required typings
 **/
export const getIOPropertyKey = (
  supportedIOSchemaUnit: I.IOUnitSchema
): string => {
  const unitSchema: I.UnitSchema = Array.isArray(supportedIOSchemaUnit)
    ? supportedIOSchemaUnit[0]
    : supportedIOSchemaUnit

  if (typeof unitSchema === 'object') {
    return unitSchema.id
  }

  return unitSchema === 'Buffer' ? 'buffer' : unitSchema
}

/**
 * Each `AdapterAPI` function has `secrets`, `options`, `unit` arguments
 * and return type. In the context of `IOPrimitive` we define `input` as
 * `unit` argument type and `output` as function return type.
 *
 * Depends on the schema context `input` and `output` types might differ
 * but the properties we need are the same
 **/
export const generateIOPrimitive = (
  transferMethod: I.TransferMethod,
  ioType: 'input' | 'output',
  ioUnitSchema: I.IOUnitSchema
): IOPrimitive => {
  const arrSuffix = Array.isArray(ioUnitSchema) ? ARRAY_SUFFIX : ''
  const isStream = ((): boolean => {
    switch (transferMethod) {
      case 'streamInStreamOut':
        return true
      case 'staticInStaticOut':
        return false
      case 'streamInStaticOut':
        return ioType === 'input'
      case 'staticInStreamOut':
        return ioType === 'output'
    }
  })()

  const streamSuffix = isStream ? STREAM_SUFFIX : ''
  const streamOfWrapper = (type: string) => {
    return isStream ? `StreamOf<${type}>` : type
  }

  const suffix = arrSuffix + streamSuffix
  const unitSchema = Array.isArray(ioUnitSchema)
    ? ioUnitSchema[0]
    : ioUnitSchema

  const unitKey = (() => {
    if (typeof unitSchema !== 'object') {
      switch (unitSchema) {
        case 'Buffer':
          return 'buffer'
        case 'string':
          return 'string'
      }
    } else {
      return unitSchema.id
    }
  })()

  const key = unitKey + suffix
  const unitId =
    typeof unitSchema === 'object'
      ? camelCaseToPascalCase(unitKey) + 'Unit'
      : undefined

  const unitTypings = unitSchemaToType(unitSchema)
  const ioUnitTypings = streamOfWrapper(
    (unitId ? unitId : unitTypings) + (Array.isArray(ioUnitSchema) ? '[]' : '')
  )

  return {
    key,
    unitTypings,
    unitId,
    ioUnitTypings,
  }
}

/**
 * Collect all possible API functions and units
 * based on the `AdapterSchema` supported IO
 **/
export const getFunctionsAndUnits = (
  supportedIO: I.TransformationIOSchema[]
) => {
  return supportedIO.reduce<{
    /* key: unit id, value: unit type*/
    units: Record<string, string>
    functions: Array<{
      transformation: I.Transformation
      inputKey: string
      outputKey: string
      fnType: string
    }>
  }>(
    (acc, transformationSchema) => {
      const transferMethods = Object.keys(
        transformationSchema.io
      ) as I.TransferMethod[]

      transferMethods.forEach((transferMethod) => {
        const ioSchemas = transformationSchema.io[transferMethod]

        if (!ioSchemas) return

        ioSchemas.forEach(([inputSchema, outputSchema]) => {
          const inputPrimitives = generateIOPrimitive(
            transferMethod,
            'input',
            inputSchema
          )

          const outputPrimitives = generateIOPrimitive(
            transferMethod,
            'output',
            outputSchema
          )

          const fnType = `(secrets: Secrets, options: Options, unit: ${inputPrimitives.ioUnitTypings}) => Promise<${outputPrimitives.ioUnitTypings}>`

          acc.functions.push({
            transformation: transformationSchema.type,
            inputKey: inputPrimitives.key,
            outputKey: outputPrimitives.key,
            fnType,
          })

          const primitives = [inputPrimitives, outputPrimitives]

          primitives.forEach((primitive) => {
            if (!primitive.unitId) return
            acc.units[primitive.unitId] = primitive.unitTypings
          })
        })
      })
      return acc
    },
    { units: {}, functions: [] }
  )
}

/**
 * Get structure from which will be convenient
 * to generate typings and `AdapterAPI` structure
 **/
export const getAPITypeStructure = (
  functions: Array<{
    transformation: string
    inputKey: string
    outputKey: string
    fnType: string
  }>
) => {
  return functions.reduce<AdapterAPIStructure>((acc, fn) => {
    acc[fn.transformation] = acc[fn.transformation] || {}
    acc[fn.transformation][fn.inputKey] =
      acc[fn.transformation][fn.inputKey] || {}

    acc[fn.transformation][fn.inputKey][fn.outputKey] = fn.fnType

    return acc
  }, {})
}

/**
 * Get typings string for `AdapterAPI` based on `APITypeStructure`
 **/
const apiStructureToTypings = (apiTypeStructure: AdapterAPIStructure) => {
  let str = 'export type AdapterAPI = {'

  Object.keys(apiTypeStructure).forEach((transformation) => {
    str += `\n  ${transformation}: {`

    Object.keys(apiTypeStructure[transformation]).forEach((inputKey) => {
      str += `\n    ${inputKey}: {`

      Object.keys(apiTypeStructure[transformation][inputKey]).forEach(
        (outputKey) => {
          const fnType = apiTypeStructure[transformation][inputKey][outputKey]
          // TODO: want to put typescript type here after `;'
          const comment = `/* ${inputKey} -> ${outputKey};  */`

          str += `\n      ${comment}`
          str += `\n      ${outputKey}: ${fnType}`
        }
      )

      str += `\n    }`
    })
  })

  str += '\n  }'
  str += '\n}'
  str += '\n\nexport default AdapterAPI'

  return str
}

// TODO: since we making not only typings but API structure
//       the `generateAPITypingsFromSchema` identifier should be changed

/* Transform `AdapterSchema[]` to `AdapterAPI` typings structure */
export const generateAPITypingsFromSchema = (
  adapterSchemas: I.AdapterSchema[]
) => {
  return adapterSchemas.reduce<
    Array<{
      adapterId: string

      /**
       * The content of the `src/types/adapters/${toKebabCase(adapterId)}/index.ts` file
       * which is necessary:
       *   - Used unit types import
       *   - Exported `Options` type definition
       *   - The adapter API type as default export member of the file
       **/
      adapterTypings: string
      apiStructure: AdapterAPIStructure
      units: Array<{ id: string; adapterId: string; typings: string }>
    }>
  >((acc, adapterSchema) => {
    const { units, functions } = getFunctionsAndUnits(adapterSchema.supportedIO)

    const resultUnits: Array<{
      id: string
      adapterId: string
      typings: string
    }> = Object.keys(units).map((unitId) => {
      const unitTypingsBody = units[unitId]
      const typings = dedent(`
        type ${unitId} = ${unitTypingsBody}\n
        export default ${unitId}
      `)

      return {
        id: unitId,
        adapterId: adapterSchema.id,
        typings: typings,
      }
    })

    const header = dedent(` 
      /**
       * The file is generated by SPADAR CLI v. ${config.version}
       * DO NOT EDIT IT MANUALLY because it could be automatically rewritten
       **/\n\n`)

    const unitIds = resultUnits.map((x) => x.id)
    const unitsImport = unitIds.length
      ? `import { ${unitIds.join(', ')} } from './units'`
      : ''

    const optionsPropList = Object.keys(adapterSchema.options).map((key) => {
      return `${key}: ${propertyToType(adapterSchema.options[key])}`
    })

    const optionsType = dedent(`
      export type Options = {
        ${optionsPropList.join('\n  ')}
      }
    `)

    const secretsPropList = adapterSchema.secrets.map(({ key }) => {
      return `${key}: string`
    })

    const secretsType = dedent(`
      export type Secrets = {
        ${secretsPropList.join('\n  ')}
      }
    `)

    const structure = getAPITypeStructure(functions)
    const adapterAPITypings = apiStructureToTypings(structure)

    const adapterTypings = [
      header,
      unitsImport,
      secretsType,
      optionsType,
      adapterAPITypings,
    ]
      .join('\n\n')
      .trim()

    console.log(adapterTypings)

    acc.push({
      adapterId: adapterSchema.id,
      adapterTypings: adapterTypings,
      apiStructure: structure,
      units: resultUnits,
    })

    return acc
  }, [])
}
