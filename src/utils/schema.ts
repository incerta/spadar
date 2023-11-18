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
   * Depends on `transferMethod` and `unitSchema`
   * it might be simple types: `string`, `Buffer`
   * or: `UnitId`, `StreamOf<UnitId>`, `UnitId[]`, `StreamOf<UnitId[]>
   * where `UnitId` is the same as `unitId` of the current interface
   **/
  ioUnitTypings: string

  /* Defined if `unitSchema` extends `ObjectUnitSchema` */
  objectUnit?: {
    /* `ObjectUnitSchema.id` transformed to PascalCase + 'Unit' suffix */
    id: string

    /* The content of type definitions file for the given `ObjectUnitSchema` */
    typings: string
  }
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

const REQUIRED_PROPERTY_SCHEMA = new Set<I.RequiredPayloadPropSchema>([
  'Buffer',
  'string',
  'number',
  'boolean',
])

/* Transform `PropertySchema` to typings */
export const propertyToType = (property: I.PropSchema): string => {
  switch (property) {
    case 'Buffer':
    case 'string':
    case 'number':
    case 'boolean':
      return property

    default: {
      if (property.type === 'stringUnion') {
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
            propertySchema as I.RequiredPayloadPropSchema
          )
        ) {
          return propertyToType(propertySchema as I.PropSchema)
        }

        return `'${propertySchema}'`
      }

      return propertyToType(propertySchema)
    })()

    const optionalSymbol = ((): string => {
      if (typeof propertySchema !== 'object') return ''
      if (propertySchema.required) return ''

      return '?'
    })()

    return `${key}${optionalSymbol}: ${valueType}`
  })

  const unitId = camelCaseToPascalCase(unitSchema.id + 'Unit')

  const result = dedent(`
    export type ${unitId} = {
      ${keyValuePair.join('\n      ')}
    }

    export default ${unitId}
  `)

  return result
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

  const objectUnit = ((): { id: string; typings: string } | undefined => {
    if (typeof unitSchema !== 'object' || Array.isArray(unitSchema)) {
      return undefined
    }

    const id = camelCaseToPascalCase(unitKey) + 'Unit'
    const typings = unitSchemaToType(unitSchema)

    return { id, typings }
  })()

  const unitTypings = unitSchemaToType(unitSchema)

  const ioUnitTypings = streamOfWrapper(
    (objectUnit ? objectUnit.id : unitTypings) +
      (Array.isArray(ioUnitSchema) ? '[]' : '')
  )

  return { key, ioUnitTypings, objectUnit }
}

/**
 * Collect all possible API functions and units
 * based on the `AdapterSchema` supported IO
 **/
export const getFunctionsAndUnits = (
  supportedIO: I.TransformationIOSchema[]
) => {
  return supportedIO.reduce<{
    unitIds: Set<string>
    units: Array<{ id: string; typings: string }>
    functions: Array<{
      transformation: I.Transformation
      inputKey: string
      outputKey: string
      fnType: string
    }>

    // TODO: return also `debugAdapter` and `actualAdapter`
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
            if (!primitive.objectUnit) return
            if (acc.unitIds.has(primitive.objectUnit.id)) return
            acc.unitIds.add(primitive.objectUnit.id)
            acc.units.push(primitive.objectUnit)
          })
        })
      })

      return acc
    },
    { units: [], functions: [], unitIds: new Set() }
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

    const header = dedent(` 
      /**
       * The file is generated by SPADAR CLI v. ${config.version}
       * DO NOT EDIT IT MANUALLY because it could be automatically rewritten
       **/`)

    const unitIds = units.map((x) => x.id)
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
      .filter((x) => !!x.trim())
      .join('\n\n')
      .trim()

    acc.push({
      adapterId: adapterSchema.id,
      adapterTypings: adapterTypings,
      apiStructure: structure,
      units: units.map((x) => ({ ...x, adapterId: adapterSchema.id })),
    })

    return acc
  }, [])
}
