import dedent from 'dedent'

import config from '../config'
import { camelCaseToPascalCase, toKebabCase } from './string'

import * as I from '../types'

type AdapterModuleFile = {
  filePath: string
  body: string

  /**
   * File that MUST NOT be rewritten if already exists
   **/
  shouldBeEditedManually?: boolean
}

type ConnectorFunction = {
  /**
   * @example 'textToText'
   * @example 'textToAudio'
   * @example 'audioToVideo'
   **/
  transformation: I.Transformation

  /**
   * @example 'string'
   * @example 'number'
   * @example 'chatMessage'
   **/
  inputKey: string
  outputKey: string

  /**
   * @example 'string'
   * @example 'string[]'
   * @example 'I.StreamOf<string[]>'
   * @example 'ChatMessage'
   **/
  inputType: string
  outputType: string

  /**
   * @example '(keys: Keys, options: Options, unit: string) => I.StreamOf<ChatMessage>'
   **/
  fnType: string
}

type IOPrimitive = {
  /**
   * @example 'string'
   * @example 'stringArr'
   * @example 'stringArrStream'
   * @example 'chatMessage'
   **/
  key: string

  /**
   * @example 'string'
   * @example 'Array<string>'
   * @example 'I.StreamOf<Array<string>>'
   * @example 'ChatMessageUnit'
   **/
  typings: string

  /* Representation of the `ObjectUnitSchema` */
  objectUnit?: {
    /**
     * @example 'ChatMessageUnit'
     * @example 'AnnotatedImageUnit'
     * @example 'SongWithLyricsUnit'
     * @example 'VideoWithSubtitlesUnit`
     **/
    id: string

    /**
     * @example
     *
     * ```
     * export ChatMessageUnit = {
     *   id: 'chatMessage'
     *   payload: string
     *   role: 'assistant' | 'system'
     * }
     * ```
     **/
    typings: string
  }
}

/**
 * The structure used for connector signature and typings generation
 **/
type ConnectorTypingsStructure = Record<
  string /* transformation type */,
  Record<
    string /* unit input type */,
    Record<string /* unit output type */, string /* function type */>
  >
>

/**
 * When we validating adapter schemas by our requirements we need
 * the object that describes how to access specific connector
 **/
type RequirementMatch = {
  transferMethod: I.TransferMethod
  ioSchemas: I.IOSchema[]
}

export const STREAM_SUFFIX = 'Stream'
export const ARRAY_SUFFIX = 'Arr'

const GENERATED_FILE_HEAD_COMMENT = dedent(` 
  /**
   * The file is generated by SPADAR CLI v. ${config.version}
   * DO NOT EDIT IT MANUALLY because it could be automatically rewritten
   **/`)

const REQUIRED_PROPERTY_SCHEMA = new Set<I.RequiredPropSchema>([
  'Buffer',
  'string',
  'number',
  'boolean',
])

/* Transform `PropertySchema` to type */
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

export const unitSchemaToType = (unitSchema: I.UnitSchema): string => {
  if (typeof unitSchema !== 'object') {
    return propertyToType(unitSchema)
  }

  const keyValuePair = Object.keys(unitSchema).map((key) => {
    const propertySchema = unitSchema[key]
    const valueType = (() => {
      if (typeof propertySchema === 'string') {
        if (
          REQUIRED_PROPERTY_SCHEMA.has(propertySchema as I.RequiredPropSchema)
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

  const unitId = camelCaseToPascalCase(unitSchema.unitId.of[0] + 'Unit')

  const result = dedent(`
    export type ${unitId} = {
      ${keyValuePair.join('\n      ')}
    }
  `)

  return result
}

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
    return isStream ? `I.StreamOf<${type}>` : type
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
    }

    return unitSchema.unitId.of[0]
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

  const typings = streamOfWrapper(
    (objectUnit ? objectUnit.id : unitTypings) +
      (Array.isArray(ioUnitSchema) ? '[]' : '')
  )

  return { key, typings, objectUnit }
}

export const getFunctionsAndUnits = (
  supportedIO: I.TransformationIOSchema[]
) => {
  return supportedIO.reduce<{
    unitIds: Set<string>
    unitTypings: string[]
    functions: ConnectorFunction[]
  }>(
    (acc, transformationSchema) => {
      const transferMethods = Object.keys(
        transformationSchema.io
      ) as I.TransferMethod[]

      transferMethods.forEach((transferMethod) => {
        const ioSchemas = transformationSchema.io[transferMethod]

        if (!ioSchemas) return

        ioSchemas.forEach(([inputSchema, outputSchema]) => {
          const inputUnit = generateIOPrimitive(
            transferMethod,
            'input',
            inputSchema
          )

          const outputUnit = generateIOPrimitive(
            transferMethod,
            'output',
            outputSchema
          )

          const fnType = `(keys: Keys, options: Options, unit: ${inputUnit.typings}) => Promise<${outputUnit.typings}>`

          acc.functions.push({
            transformation: transformationSchema.type,
            inputKey: inputUnit.key,
            outputKey: outputUnit.key,
            inputType: inputUnit.typings,
            outputType: inputUnit.typings,
            fnType,
          })

          const primitives = [inputUnit, outputUnit]

          primitives.forEach((primitive) => {
            if (!primitive.objectUnit) return
            if (acc.unitIds.has(primitive.objectUnit.id)) return

            acc.unitIds.add(primitive.objectUnit.id)
            acc.unitTypings.push(primitive.objectUnit.typings)
          })
        })
      })

      return acc
    },
    { functions: [], unitIds: new Set(), unitTypings: [] }
  )
}

export const getConnectorFiles = (
  schema: I.ConnectorSchema
): {
  [k in 'connector' | 'signature' | 'typings']: AdapterModuleFile
} => {
  const { unitTypings, functions } = getFunctionsAndUnits(schema.supportedIO)

  const connectorLines = [
    `import signature from './${toKebabCase(schema.id)}.signature'`,
  ]

  functions.forEach((fn) => {
    const resultFn = `signature.${fn.transformation}.${fn.inputKey}.${fn.outputKey} = async (keys, options, unit) => {}`
    connectorLines.push(resultFn)
  })

  connectorLines.push('export default signature')

  const connector = connectorLines.join('\n\n')

  const structure = functions.reduce<ConnectorTypingsStructure>((acc, fn) => {
    acc[fn.transformation] = acc[fn.transformation] || {}
    acc[fn.transformation][fn.inputKey] =
      acc[fn.transformation][fn.inputKey] || {}

    acc[fn.transformation][fn.inputKey][fn.outputKey] = fn.fnType

    return acc
  }, {})

  let connectorTypingsTail = 'export type Connector = {'

  // TODO: the `signFn` function should be abstracted to adapter `src/utils.ts`
  //       file which is generated by `spadar adapter --init` command
  let connectorSignature =
    GENERATED_FILE_HEAD_COMMENT +
    '\n\n' +
    dedent(`
      import Connector from './${toKebabCase(schema.id)}.typings'

      /**
       * The Connector API signature file exists as an intermediate
       * step between the connector typings and the actual connector
       * that SHOULD BE edited by the user MANUALLY.
       *
       * Whenever the schema is changed and the user regenerates the connector
       * typings/signatures, the existing connector API files
       * MUST BE untouched by the code generation.
       *
       * We view the connector API that is filled in by the user manually as a bunch
       * of mutations of the signature object. From the Typescript
       * standpoint, these mutations are not required, so we need a way
       * to check which parts of the schema are actually implemented
       * and omit them from the resulting Adapter API.
       **/
      const signFn = <
        T extends ((...args: unknown[]) => unknown) & { isSpadarSignature?: boolean }
      >(
        x: T
      ): T & { isSpadarSignature?: boolean } => {
        x.isSpadarSignature = true
        return x
      }
      
      export const signature: Connector = {
  `)

  const scaryMutator = (x: string) => {
    connectorTypingsTail += x
    connectorSignature += x
  }

  Object.keys(structure).forEach((transformation) => {
    scaryMutator(`\n  ${transformation}: {`)

    Object.keys(structure[transformation]).forEach((inputKey) => {
      scaryMutator(`\n    ${inputKey}: {`)

      Object.keys(structure[transformation][inputKey]).forEach((outputKey) => {
        const fnType = structure[transformation][inputKey][outputKey]
        const comment = `/* ${inputKey} -> ${outputKey};  */`

        scaryMutator(`\n      ${comment}`)

        connectorTypingsTail += `\n      ${outputKey}: ${fnType}`

        connectorSignature += `\n      ${outputKey}: signFn(() => {`
        connectorSignature += `\n        throw new Error('Not implemented')`
        connectorSignature += `\n      }),`
      })

      connectorTypingsTail += `\n    }`
      connectorSignature += `\n    },`
    })
  })

  scaryMutator('\n  }')
  scaryMutator('\n}')

  connectorTypingsTail += '\n\nexport default Connector'
  connectorSignature += '\n\nexport default signature'

  const optionsPropList = Object.keys(schema.options).map((key) => {
    return `${key}: ${propertyToType(schema.options[key])}`
  })

  const optionsType = dedent(`
    export type Options = {
      ${optionsPropList.join('\n      ')}
    }
  `)

  const keysPropList = schema.keys.map(({ key }) => {
    return `${key}: string`
  })

  const keysTypings = dedent(`
      export type Keys = {
        ${keysPropList.join('\n  ')}
      }
    `)

  // TODO: the root path of the types should be connected to
  //       `config.adapter.` path
  const rootTypesImport = `import * as I from '../types'`

  const connectorTypings = [
    GENERATED_FILE_HEAD_COMMENT,
    rootTypesImport,
    keysTypings,
    optionsType,
    ...unitTypings,
    connectorTypingsTail,
  ]
    .filter((x) => !!x.trim())
    .join('\n\n')
    .trim()

  return {
    typings: {
      filePath: config.adapter.connectorTypingsFilePath(schema.id),
      body: connectorTypings,
    },
    signature: {
      filePath: config.adapter.connectorSignaturePath(schema.id),
      body: connectorSignature,
    },
    connector: {
      filePath: config.adapter.connectorFilePath(schema.id),
      body: connector,
      shouldBeEditedManually: true,
    },
  }
}

// FIXME: add unit tests for the function
export const schemaToAdapterFiles = (
  adapterModule: {
    name: string
    version: string
  },
  connectorSchemas: I.ConnectorSchema[]
): AdapterModuleFile[] => {
  const adapterFiles: AdapterModuleFile[] = []

  const adapterHeadLines: string[] = [
    GENERATED_FILE_HEAD_COMMENT,
    `import schema from './schema'`,
  ]

  const adapterTailLines: string[] = [
    dedent(`
    export default {
      name: '${adapterModule.name}',
      version: '${adapterModule.version}',
      schema: schema,
      connectors: {
  `),
  ]

  connectorSchemas.forEach((connectorSchema, index) => {
    const connectorFiles = getConnectorFiles(connectorSchema)
    const importedConnectorName = `connector${index}`

    adapterHeadLines.push(
      `import ${importedConnectorName} from './connectors/${toKebabCase(
        connectorSchema.id
      )}'`
    )

    adapterTailLines.push(
      `    "${connectorSchema.id}": ${importedConnectorName},`
    )

    adapterFiles.push(connectorFiles.typings)
    adapterFiles.push(connectorFiles.signature)
    adapterFiles.push(connectorFiles.connector)
  })

  adapterTailLines.push('  }')
  adapterTailLines.push('}')

  const adapterFileLines: string[] = adapterHeadLines.concat(
    adapterTailLines.join('\n')
  )

  adapterFiles.push({
    filePath: config.adapter.adapterEntryPoint,
    body: adapterFileLines.join('\n\n'),
  })

  return adapterFiles
}

export const getIsPropSchemaMatch = (
  requirement: I.PropSchema,
  target: I.PropSchema | undefined
): boolean => {
  if (typeof target === 'undefined') {
    if (typeof requirement !== 'object') {
      return false
    }

    if (requirement.required && typeof requirement.default === 'undefined') {
      return false
    }

    return true
  }

  if (typeof requirement === 'object') {
    if (typeof target === 'object') {
      if (target.type !== requirement.type) {
        return false
      }

      if (requirement.required) {
        if (!target.required && target.default === undefined) {
          return false
        }
      }

      switch (requirement.type) {
        case 'string': {
          if (target.type !== 'string') {
            return false
          }

          if (typeof requirement.minLength === 'number') {
            if (typeof target.minLength !== 'number') {
              return false
            }

            if (requirement.minLength > target.minLength) {
              return false
            }
          }

          if (typeof requirement.maxLength === 'number') {
            if (typeof target.maxLength !== 'number') {
              return false
            }

            if (requirement.maxLength < target.maxLength) {
              return false
            }
          }

          return true
        }

        case 'number': {
          if (target.type !== 'number') {
            return false
          }

          if (typeof requirement.min === 'number') {
            if (typeof target.min !== 'number') {
              return false
            }

            if (requirement.min > target.min) {
              return false
            }
          }

          if (typeof requirement.max === 'number') {
            if (typeof target.max !== 'number') {
              return false
            }

            if (requirement.max < target.max) {
              return false
            }
          }

          return true
        }

        case 'boolean': {
          if (target.type !== 'boolean') {
            return false
          }

          return true
        }

        case 'Buffer': {
          if (target.type !== 'Buffer') {
            return false
          }

          if (typeof requirement.minLength === 'number') {
            if (typeof target.minLength !== 'number') {
              return false
            }

            if (requirement.minLength > target.minLength) {
              return false
            }
          }

          if (typeof requirement.maxLength === 'number') {
            if (typeof target.maxLength !== 'number') {
              return false
            }

            if (requirement.maxLength < target.maxLength) {
              return false
            }
          }

          return true
        }

        case 'stringUnion': {
          if (target.type !== 'stringUnion') {
            return false
          }

          const requirementOf = new Set(requirement.of)

          return target.of.reduce<boolean>((acc, x) => {
            if (requirementOf.has(x) === false) return false
            return acc
          }, true)
        }
      }
    }

    /* When target is RequiredPropSchema string */

    switch (requirement.type) {
      case 'string': {
        if (target !== 'string') {
          return false
        }

        if (typeof requirement.minLength === 'number') {
          return false
        }

        if (typeof requirement.maxLength === 'number') {
          return false
        }

        return true
      }

      case 'number': {
        if (target !== 'number') {
          return false
        }

        if (typeof requirement.min === 'number') {
          return false
        }

        if (typeof requirement.max === 'number') {
          return false
        }

        return true
      }

      case 'Buffer': {
        if (target !== 'Buffer') {
          return false
        }

        if (typeof requirement.minLength === 'number') {
          return false
        }

        if (typeof requirement.maxLength === 'number') {
          return false
        }

        return true
      }

      default: {
        return requirement.type === target
      }
    }
  }

  if (typeof target === 'object') {
    if (!target.required && target.default === undefined) {
      return false
    }

    return target.type === requirement
  }

  return requirement === target
}

export const getIsObjectUnitSchemaMatch = (
  requirement: I.ObjectUnitSchema,
  target: I.ObjectUnitSchema
): boolean => {
  for (const requirementKey in requirement) {
    const requirementValue = requirement[requirementKey]
    const targetValue = target[requirementKey]

    if (requirementKey === 'payload') {
      if (requirementValue !== targetValue) {
        return false
      }
    }

    if (typeof requirementValue === 'string') {
      if (requirementValue !== targetValue) {
        return false
      }
    }

    if (typeof requirementValue === 'object') {
      if (requirementValue.required) {
        if (typeof targetValue === 'undefined') {
          return false
        }
      }

      if (getIsPropSchemaMatch(requirementValue, targetValue) === false) {
        return false
      }
    }
  }

  return true
}

export const getIsIOUnitSchemaMatch = (
  requirement: I.IOUnitSchema,
  target: I.IOUnitSchema
): boolean => {
  if (typeof requirement !== 'object') {
    if (typeof target === 'object') {
      return false
    }

    return requirement === target
  }

  if (Array.isArray(requirement)) {
    if (typeof target !== 'object') {
      return false
    }

    if (Array.isArray(target)) {
      return getIsIOUnitSchemaMatch(requirement[0], target[0])
    }

    return false
  }

  if (typeof target !== 'object') {
    return false
  }

  if (Array.isArray(target)) {
    return false
  }

  return getIsObjectUnitSchemaMatch(requirement, target)
}

export const getIsIOSchemaMatch = (
  requirement: I.IOSchema,
  target: I.IOSchema
): boolean => {
  const [rA, rB] = requirement
  const [tA, tB] = target
  return getIsIOUnitSchemaMatch(rA, tA) && getIsIOUnitSchemaMatch(rB, tB)
}

// FIXME: DEPRECATED and currently unused
export const getIsSchemaMatchRequirement = (
  requirement: I.TransformationIOSchema,
  target: I.TransformationIOSchema
): boolean => {
  if (requirement.type !== target.type) {
    return false
  }

  for (const x in requirement.io) {
    const transferMethod = x as I.TransferMethod
    const requirementTransferMethodIO = requirement.io[
      transferMethod
    ] as I.IOSchema[]
    const targetTransferMethodIO = target.io[transferMethod]

    if (typeof targetTransferMethodIO === 'undefined') {
      return false
    }

    for (const requirementIOSchema of requirementTransferMethodIO) {
      const hasMatch = targetTransferMethodIO.reduce<boolean>(
        (acc, targetIOSchema) => {
          const matchRequirements = getIsIOSchemaMatch(
            requirementIOSchema,
            targetIOSchema
          )

          if (matchRequirements === true) return true
          return acc
        },
        false
      )

      if (hasMatch === false) return false
    }
  }

  return true
}

// FIXME: the name of the function is not correct
//        we are not comparing requirement to schema
//        we just comparing two transformation schemas
//
// TODO: explain in the comment why the position of
//       `requirement` and `target` matters:
//       target could have more IO options then requirement?
//       maybe it is not matter after all when we talking
//       about the matches and not just boolean validation
export const getRequirementToSchemaMatches = (
  requirement: I.TransformationIOSchema,
  target: I.TransformationIOSchema
): undefined | RequirementMatch[] => {
  if (requirement.type !== target.type) {
    return undefined
  }

  const matches: RequirementMatch[] = []

  for (const x in requirement.io) {
    const transferMethod = x as I.TransferMethod

    const requirementTransferMethodIO = requirement.io[
      transferMethod
    ] as I.IOSchema[]

    const targetTransferMethodIO = target.io[transferMethod]

    if (typeof targetTransferMethodIO === 'undefined') {
      continue
    }

    const match: RequirementMatch = {
      transferMethod,
      ioSchemas: [],
    }

    for (const requirementIOSchema of requirementTransferMethodIO) {
      targetTransferMethodIO.forEach((targetIOSchema) => {
        if (getIsIOSchemaMatch(requirementIOSchema, targetIOSchema)) {
          match.ioSchemas.push(targetIOSchema)
        }
      })
    }

    if (match.ioSchemas.length) {
      matches.push(match)
    }
  }

  return matches.length === 0 ? undefined : matches
}

export const validateByPropSchema = (
  propSchema: I.PropSchema,
  value: unknown
): true | 'typeError' | 'rangeError' => {
  if (typeof propSchema === 'string') {
    switch (propSchema) {
      case 'string': {
        return typeof value === 'string' || 'typeError'
      }
      case 'number': {
        if (typeof value === 'number') {
          return isFinite(value) || 'typeError'
        }

        return 'typeError'
      }
      case 'boolean': {
        return typeof value === 'boolean' || 'typeError'
      }
      case 'Buffer': {
        return value instanceof Buffer || 'typeError'
      }
    }
  }

  if (
    !propSchema.required &&
    typeof propSchema.default === 'undefined' &&
    typeof value === 'undefined'
  ) {
    return true
  }

  switch (propSchema.type) {
    case 'string': {
      if (typeof value !== 'string') {
        return 'typeError'
      }

      const isValidByMin =
        typeof propSchema.minLength === 'number'
          ? value.length >= propSchema.minLength
          : true

      const isValidByMax =
        typeof propSchema.maxLength === 'number'
          ? value.length <= propSchema.maxLength
          : true

      if (isValidByMin === false || isValidByMax === false) {
        return 'rangeError'
      }

      return true
    }

    case 'number': {
      if (typeof value !== 'number') {
        return 'typeError'
      }

      if (isFinite(value) === false) {
        return 'typeError'
      }

      const isValidByMin =
        typeof propSchema.min === 'number' ? value >= propSchema.min : true

      const isValidByMax =
        typeof propSchema.max === 'number' ? value <= propSchema.max : true

      if (isValidByMin === false || isValidByMax === false) {
        return 'rangeError'
      }

      return true
    }

    case 'boolean': {
      return typeof value === 'boolean' || 'typeError'
    }

    case 'Buffer': {
      if (value instanceof Buffer) {
        const isValidByMin =
          typeof propSchema.minLength === 'number'
            ? value.length >= propSchema.minLength
            : true

        const isValidByMax =
          typeof propSchema.maxLength === 'number'
            ? value.length <= propSchema.maxLength
            : true

        if (isValidByMin === false || isValidByMax === false) {
          return 'rangeError'
        }
        return true
      }

      return 'typeError'
    }

    case 'stringUnion': {
      if (typeof value !== 'string') {
        return 'typeError'
      }

      const set = new Set(propSchema.of)

      if (set.has(value) === false) {
        return 'typeError'
      }

      return true
    }
  }
}

export const validateBySchema = (
  schema: Record<string, I.PropSchema>,
  runtimeObject: unknown
): true | string => {
  console.log(schema, runtimeObject)
  throw Error('Not implemented')
}
