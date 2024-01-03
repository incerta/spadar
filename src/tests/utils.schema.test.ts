import dedent from 'dedent'
import config from '../config'
import * as schema from '../utils/schema'
import * as I from '../types'

it('propertyToType: RequiredPayloadPropSchema cases', () => {
  expect(schema.propertyToType('string')).toBe('string')
  expect(schema.propertyToType('number')).toBe('number')
  expect(schema.propertyToType('boolean')).toBe('boolean')
  expect(schema.propertyToType('Buffer')).toBe('Buffer')
})

it('propertyToType: ObjectPropSchema cases', () => {
  expect(schema.propertyToType({ type: 'string' })).toBe('string')
  expect(schema.propertyToType({ type: 'number' })).toBe('number')
  expect(schema.propertyToType({ type: 'boolean' })).toBe('boolean')
  expect(schema.propertyToType({ type: 'Buffer' })).toBe('Buffer')
  expect(schema.propertyToType({ type: 'stringUnion', of: ['literal'] })).toBe(
    "'literal'"
  )
  expect(
    schema.propertyToType({ type: 'stringUnion', of: ['literal1', 'literal2'] })
  ).toBe("'literal1' | 'literal2'")
})

it('generateIOPrimitive: staticInStaticOut', () => {
  const transferMethod: I.TransferMethod = 'staticInStaticOut'

  /* Primitive unit input */
  expect(schema.generateIOPrimitive(transferMethod, 'input', 'string')).toEqual(
    {
      key: 'string',
      typings: 'string',
    }
  )

  /* Primitive unit output */
  expect(
    schema.generateIOPrimitive(transferMethod, 'output', 'string')
  ).toEqual({
    key: 'string',
    typings: 'string',
  })

  /* Primitive unit array schema input */
  expect(
    schema.generateIOPrimitive(transferMethod, 'input', ['string'])
  ).toEqual({
    key: 'stringArr',
    typings: 'string[]',
  })

  /* Primitive unit array schema output */
  expect(
    schema.generateIOPrimitive(transferMethod, 'output', ['string'])
  ).toEqual({
    key: 'stringArr',
    typings: 'string[]',
  })

  const customUnit: I.ObjectUnitSchema = {
    unitId: { type: 'stringUnion', of: ['custom'], required: true },
    payload: 'string',
  }

  /* Custom unit schema input */
  expect(
    schema.generateIOPrimitive(transferMethod, 'input', customUnit)
  ).toEqual({
    key: 'custom',
    typings: 'CustomUnit',
    objectUnit: {
      id: 'CustomUnit',
      typings: expect.any(String),
    },
  })

  /* Custom unit schema output */
  expect(
    schema.generateIOPrimitive(transferMethod, 'output', customUnit)
  ).toEqual({
    key: 'custom',
    typings: 'CustomUnit',
    objectUnit: {
      id: 'CustomUnit',
      typings: expect.any(String),
    },
  })

  /* Custom unit array schema input */
  expect(
    schema.generateIOPrimitive(transferMethod, 'input', [customUnit])
  ).toEqual({
    key: 'customArr',
    typings: 'CustomUnit[]',
    objectUnit: {
      id: 'CustomUnit',
      typings: expect.any(String),
    },
  })

  /* Custom unit array schema output */
  expect(
    schema.generateIOPrimitive(transferMethod, 'output', customUnit)
  ).toEqual({
    key: 'custom',
    typings: 'CustomUnit',
    objectUnit: {
      id: 'CustomUnit',
      typings: expect.any(String),
    },
  })
})

it('generateIOPrimitive: staticInStreamOut', () => {
  const transferMethod: I.TransferMethod = 'staticInStreamOut'

  /* Primitive unit input */
  expect(schema.generateIOPrimitive(transferMethod, 'input', 'string')).toEqual(
    {
      key: 'string',
      typings: 'string',
    }
  )

  /* Primitive unit output */
  expect(
    schema.generateIOPrimitive(transferMethod, 'output', 'string')
  ).toEqual({
    key: 'stringStream',
    typings: 'I.StreamOf<string>',
  })

  /* Primitive unit array schema input */
  expect(
    schema.generateIOPrimitive(transferMethod, 'input', ['string'])
  ).toEqual({
    key: 'stringArr',
    typings: 'string[]',
  })

  /* Primitive unit array schema output */
  expect(
    schema.generateIOPrimitive(transferMethod, 'output', ['string'])
  ).toEqual({
    key: 'stringArrStream',
    typings: 'I.StreamOf<string[]>',
  })

  const customUnit: I.ObjectUnitSchema = {
    unitId: { type: 'stringUnion', of: ['custom'], required: true },
    payload: 'string',
  }

  /* Custom unit schema input */
  expect(
    schema.generateIOPrimitive(transferMethod, 'input', customUnit)
  ).toEqual({
    key: 'custom',
    typings: 'CustomUnit',
    objectUnit: {
      id: 'CustomUnit',
      typings: expect.any(String),
    },
  })

  /* Custom unit schema output */
  expect(
    schema.generateIOPrimitive(transferMethod, 'output', customUnit)
  ).toEqual({
    key: 'customStream',
    typings: 'I.StreamOf<CustomUnit>',
    objectUnit: {
      id: 'CustomUnit',
      typings: expect.any(String),
    },
  })

  /* Custom unit array schema input */
  expect(
    schema.generateIOPrimitive(transferMethod, 'input', [customUnit])
  ).toEqual({
    key: 'customArr',
    typings: 'CustomUnit[]',
    objectUnit: {
      id: 'CustomUnit',
      typings: expect.any(String),
    },
  })

  /* Custom unit array schema output */
  expect(
    schema.generateIOPrimitive(transferMethod, 'output', customUnit)
  ).toEqual({
    key: 'customStream',
    typings: 'I.StreamOf<CustomUnit>',
    objectUnit: {
      id: 'CustomUnit',
      typings: expect.any(String),
    },
  })
})

it('generateIOPrimitive: streamInStaticOut', () => {
  const transferMethod: I.TransferMethod = 'streamInStaticOut'

  /* Primitive unit input */
  expect(schema.generateIOPrimitive(transferMethod, 'input', 'string')).toEqual(
    {
      key: 'stringStream',
      typings: 'I.StreamOf<string>',
    }
  )

  /* Primitive unit output */
  expect(
    schema.generateIOPrimitive(transferMethod, 'output', 'string')
  ).toEqual({
    key: 'string',
    typings: 'string',
  })

  /* Primitive unit array schema input */
  expect(
    schema.generateIOPrimitive(transferMethod, 'input', ['string'])
  ).toEqual({
    key: 'stringArrStream',
    typings: 'I.StreamOf<string[]>',
  })

  /* Primitive unit array schema output */
  expect(
    schema.generateIOPrimitive(transferMethod, 'output', ['string'])
  ).toEqual({
    key: 'stringArr',
    typings: 'string[]',
  })

  const customUnit: I.ObjectUnitSchema = {
    unitId: { type: 'stringUnion', of: ['custom'], required: true },
    payload: 'string',
  }

  /* Custom unit schema input */
  expect(
    schema.generateIOPrimitive(transferMethod, 'input', customUnit)
  ).toEqual({
    key: 'customStream',
    typings: 'I.StreamOf<CustomUnit>',
    objectUnit: {
      id: 'CustomUnit',
      typings: expect.any(String),
    },
  })

  /* Custom unit schema output */
  expect(
    schema.generateIOPrimitive(transferMethod, 'output', customUnit)
  ).toEqual({
    key: 'custom',
    typings: 'CustomUnit',
    objectUnit: {
      id: 'CustomUnit',
      typings: expect.any(String),
    },
  })

  /* Custom unit array schema input */
  expect(
    schema.generateIOPrimitive(transferMethod, 'input', [customUnit])
  ).toEqual({
    key: 'customArrStream',
    typings: 'I.StreamOf<CustomUnit[]>',
    objectUnit: {
      id: 'CustomUnit',
      typings: expect.any(String),
    },
  })

  /* Custom unit array schema output */
  expect(
    schema.generateIOPrimitive(transferMethod, 'output', customUnit)
  ).toEqual({
    key: 'custom',
    typings: 'CustomUnit',
    objectUnit: {
      id: 'CustomUnit',
      typings: expect.any(String),
    },
  })
})

it('generateIOPrimitive: streamInStreamOut', () => {
  const transferMethod: I.TransferMethod = 'streamInStreamOut'

  /* Primitive unit input */
  expect(schema.generateIOPrimitive(transferMethod, 'input', 'string')).toEqual(
    {
      key: 'stringStream',
      typings: 'I.StreamOf<string>',
    }
  )

  /* Primitive unit output */
  expect(
    schema.generateIOPrimitive(transferMethod, 'output', 'string')
  ).toEqual({
    key: 'stringStream',
    typings: 'I.StreamOf<string>',
  })

  /* Primitive unit array schema input */
  expect(
    schema.generateIOPrimitive(transferMethod, 'input', ['string'])
  ).toEqual({
    key: 'stringArrStream',
    typings: 'I.StreamOf<string[]>',
  })

  /* Primitive unit array schema output */
  expect(
    schema.generateIOPrimitive(transferMethod, 'output', ['string'])
  ).toEqual({
    key: 'stringArrStream',
    typings: 'I.StreamOf<string[]>',
  })

  const customUnit: I.ObjectUnitSchema = {
    unitId: { type: 'stringUnion', of: ['custom'], required: true },
    payload: 'string',
  }

  /* Custom unit schema input */
  expect(
    schema.generateIOPrimitive(transferMethod, 'input', customUnit)
  ).toEqual({
    key: 'customStream',
    typings: 'I.StreamOf<CustomUnit>',
    objectUnit: {
      id: 'CustomUnit',
      typings: expect.any(String),
    },
  })

  /* Custom unit schema output */
  expect(
    schema.generateIOPrimitive(transferMethod, 'output', customUnit)
  ).toEqual({
    key: 'customStream',
    typings: 'I.StreamOf<CustomUnit>',
    objectUnit: {
      id: 'CustomUnit',
      typings: expect.any(String),
    },
  })

  /* Custom unit array schema input */
  expect(
    schema.generateIOPrimitive(transferMethod, 'input', [customUnit])
  ).toEqual({
    key: 'customArrStream',
    typings: 'I.StreamOf<CustomUnit[]>',
    objectUnit: {
      id: 'CustomUnit',
      typings: expect.any(String),
    },
  })

  /* Custom unit array schema output */
  expect(
    schema.generateIOPrimitive(transferMethod, 'output', customUnit)
  ).toEqual({
    key: 'customStream',
    typings: 'I.StreamOf<CustomUnit>',
    objectUnit: {
      id: 'CustomUnit',
      typings: expect.any(String),
    },
  })
})

it('unitSchemaToType: test all possilbe property types', () => {
  const customUnit: I.ObjectUnitSchema = {
    unitId: { type: 'stringUnion', of: ['custom'], required: true },
    payload: 'string',
    stringPropertySchemaRequired: {
      type: 'string',
      required: true,
    },
    stringPropertySchemaOptional: {
      type: 'string',
    },
    numberPropertySchemaRequired: {
      type: 'number',
      required: true,
    },
    numberPropertySchemaOptional: {
      type: 'number',
    },
    booleanPropertyRequired: {
      type: 'boolean',
      required: true,
    },
    booleanPropertyOptional: {
      type: 'boolean',
    },
    bufferPropertySchemaRequired: {
      type: 'Buffer',
      required: true,
    },
    bufferPropertySchemaOptional: {
      type: 'Buffer',
    },
    requiredBuffer: 'Buffer',
    requiredString: 'string',
    requiredNumber: 'number',
    requiredBoolean: 'boolean',
  }

  expect(schema.unitSchemaToType(customUnit)).toBe(
    dedent(`
      export type CustomUnit = {
        unitId: 'custom'
        payload: string
        stringPropertySchemaRequired: string
        stringPropertySchemaOptional?: string
        numberPropertySchemaRequired: number
        numberPropertySchemaOptional?: number
        booleanPropertyRequired: boolean
        booleanPropertyOptional?: boolean
        bufferPropertySchemaRequired: Buffer
        bufferPropertySchemaOptional?: Buffer
        requiredBuffer: Buffer
        requiredString: string
        requiredNumber: number
        requiredBoolean: boolean
      }
  `)
  )
})

it(`getConnectorFiles[typings|signature|connector]: schema with 'Buffer' and 'string' units`, () => {
  const result = schema.getConnectorFiles({
    id: 'testConnector',
    options: {
      model: {
        type: 'stringUnion',
        of: ['gpt-4', 'gpt-3'],
        required: true,
      },
    },
    keys: [{ key: 'OPENAI_API_KEY' }],
    supportedIO: [
      {
        type: 'textToText',
        io: {
          staticInStaticOut: [['string', 'string']],
          staticInStreamOut: [['Buffer', 'string']],
          streamInStaticOut: [['string', 'string']],
          streamInStreamOut: [['Buffer', 'string']],
        },
      },
    ],
  })

  expect(result.typings.filePath).toBe(
    config.adapter.connectorTypingsFilePath('testConnector')
  )

  expect(result.typings.body).toBe(
    dedent(`
      /**
       * The file is generated by SPADAR CLI v. ${config.version}
       * DO NOT EDIT IT MANUALLY because it could be automatically rewritten
       **/

      import * as I from '../types'

      export type Keys = {
        OPENAI_API_KEY: string
      }

      export type Options = {
        model: 'gpt-4' | 'gpt-3'
      }

      export type Connector = {
        textToText: {
          string: {
            /* string -> string;  */
            string: (keys: Keys, options: Options, unit: string) => Promise<string>
          }
          buffer: {
            /* buffer -> stringStream;  */
            stringStream: (keys: Keys, options: Options, unit: Buffer) => Promise<I.StreamOf<string>>
          }
          stringStream: {
            /* stringStream -> string;  */
            string: (keys: Keys, options: Options, unit: I.StreamOf<string>) => Promise<string>
          }
          bufferStream: {
            /* bufferStream -> stringStream;  */
            stringStream: (keys: Keys, options: Options, unit: I.StreamOf<Buffer>) => Promise<I.StreamOf<string>>
          }
        }
      }
      
      export default Connector`)
  )

  const notImplementedError = `throw new Error('Not implemented')`

  expect(result.signature.filePath).toBe(
    config.adapter.connectorSignaturePath('testConnector')
  )

  expect(result.signature.body).toBe(
    dedent(`
      /**
       * The file is generated by SPADAR CLI v. ${config.version}
       * DO NOT EDIT IT MANUALLY because it could be automatically rewritten
       **/
      
      import Connector from './test-connector.typings'

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
        textToText: {
          string: {
            /* string -> string;  */
            string: signFn(() => {
              ${notImplementedError}
            }),
          },
          buffer: {
            /* buffer -> stringStream;  */
            stringStream: signFn(() => {
              ${notImplementedError}
            }),
          },
          stringStream: {
            /* stringStream -> string;  */
            string: signFn(() => {
              ${notImplementedError}
            }),
          },
          bufferStream: {
            /* bufferStream -> stringStream;  */
            stringStream: signFn(() => {
              ${notImplementedError}
            }),
          },
        }
      }
      
      export default signature`)
  )

  expect(result.connector.filePath).toBe(
    config.adapter.connectorFilePath('testConnector')
  )

  expect(result.connector.body).toBe(
    dedent(`
      import signature from './test-connector.signature'
      
      signature.textToText.string.string = async (keys, options, unit) => {}

      signature.textToText.buffer.stringStream = async (keys, options, unit) => {}

      signature.textToText.stringStream.string = async (keys, options, unit) => {}

      signature.textToText.bufferStream.stringStream = async (keys, options, unit) => {}
      
      export default signature`)
  )
})

it('getConnectorFiles.typings: schema with `ObjectUnitSchema` units', () => {
  const customUnitOne: I.ObjectUnitSchema = {
    /* `unitId: 'customOne'` */
    unitId: { type: 'stringUnion', of: ['customOne'], required: true },
    /* `payload: string` */
    payload: 'string',
  }

  const customUnitTwo: I.ObjectUnitSchema = {
    unitId: { type: 'stringUnion', of: ['customTwo'], required: true },
    payload: 'Buffer',
  }

  const connectorId = 'testAdapter'

  const { typings } = schema.getConnectorFiles({
    id: connectorId,
    description: 'Test adapter',
    options: {
      model: {
        type: 'stringUnion',
        of: ['gpt-4', 'gpt-3'],
        required: true,
      },
    },
    keys: [{ key: 'OPENAI_API_KEY' }],
    supportedIO: [
      {
        type: 'textToText',
        io: {
          staticInStaticOut: [
            [customUnitOne, customUnitOne],
            [customUnitOne, customUnitTwo],
            [customUnitTwo, customUnitOne],
            [customUnitTwo, customUnitTwo],
            [[customUnitOne], customUnitOne],
            [customUnitOne, [customUnitOne]],
            [[customUnitOne], [customUnitOne]],
          ],
          staticInStreamOut: [[customUnitOne, customUnitOne]],
          streamInStaticOut: [[customUnitOne, customUnitOne]],
          streamInStreamOut: [[customUnitOne, customUnitOne]],
        },
      },
    ],
  })

  expect(typings.body).toBe(
    dedent(`
      /**
       * The file is generated by SPADAR CLI v. ${config.version}
       * DO NOT EDIT IT MANUALLY because it could be automatically rewritten
       **/

      import * as I from '../types'

      export type Keys = {
        OPENAI_API_KEY: string
      }

      export type Options = {
        model: 'gpt-4' | 'gpt-3'
      }

      export type CustomOneUnit = {
        unitId: 'customOne'
        payload: string
      }

      export type CustomTwoUnit = {
        unitId: 'customTwo'
        payload: Buffer
      }

      export type Connector = {
        textToText: {
          customOne: {
            /* customOne -> customOne;  */
            customOne: (keys: Keys, options: Options, unit: CustomOneUnit) => Promise<CustomOneUnit>
            /* customOne -> customTwo;  */
            customTwo: (keys: Keys, options: Options, unit: CustomOneUnit) => Promise<CustomTwoUnit>
            /* customOne -> customOneArr;  */
            customOneArr: (keys: Keys, options: Options, unit: CustomOneUnit) => Promise<CustomOneUnit[]>
            /* customOne -> customOneStream;  */
            customOneStream: (keys: Keys, options: Options, unit: CustomOneUnit) => Promise<I.StreamOf<CustomOneUnit>>
          }
          customTwo: {
            /* customTwo -> customOne;  */
            customOne: (keys: Keys, options: Options, unit: CustomTwoUnit) => Promise<CustomOneUnit>
            /* customTwo -> customTwo;  */
            customTwo: (keys: Keys, options: Options, unit: CustomTwoUnit) => Promise<CustomTwoUnit>
          }
          customOneArr: {
            /* customOneArr -> customOne;  */
            customOne: (keys: Keys, options: Options, unit: CustomOneUnit[]) => Promise<CustomOneUnit>
            /* customOneArr -> customOneArr;  */
            customOneArr: (keys: Keys, options: Options, unit: CustomOneUnit[]) => Promise<CustomOneUnit[]>
          }
          customOneStream: {
            /* customOneStream -> customOne;  */
            customOne: (keys: Keys, options: Options, unit: I.StreamOf<CustomOneUnit>) => Promise<CustomOneUnit>
            /* customOneStream -> customOneStream;  */
            customOneStream: (keys: Keys, options: Options, unit: I.StreamOf<CustomOneUnit>) => Promise<I.StreamOf<CustomOneUnit>>
          }
        }
      }

      export default Connector
  `)
  )
})

it(`getIsPropSchemaMatch: RequiredPropSchema -> any`, () => {
  /* string -> any */

  expect(schema.getIsPropSchemaMatch('string', 'string')).toBe(true)
  expect(schema.getIsPropSchemaMatch('string', 'number')).toBe(false)
  expect(schema.getIsPropSchemaMatch('string', 'boolean')).toBe(false)
  expect(schema.getIsPropSchemaMatch('string', 'Buffer')).toBe(false)

  expect(
    schema.getIsPropSchemaMatch('string', { type: 'string', required: true })
  ).toBe(true)
  expect(
    schema.getIsPropSchemaMatch('string', { type: 'string', default: 'x' })
  ).toBe(true)
  expect(schema.getIsPropSchemaMatch('string', { type: 'string' })).toBe(false)
  expect(schema.getIsPropSchemaMatch('string', { type: 'number' })).toBe(false)
  expect(
    schema.getIsPropSchemaMatch('string', { type: 'number', required: true })
  ).toBe(false)
  expect(schema.getIsPropSchemaMatch('string', { type: 'boolean' })).toBe(false)
  expect(schema.getIsPropSchemaMatch('string', { type: 'Buffer' })).toBe(false)
  expect(
    schema.getIsPropSchemaMatch('string', { type: 'stringUnion', of: ['x'] })
  ).toBe(false)

  /* number -> any */

  expect(schema.getIsPropSchemaMatch('number', 'number')).toBe(true)
  expect(schema.getIsPropSchemaMatch('number', 'string')).toBe(false)
  expect(schema.getIsPropSchemaMatch('number', 'boolean')).toBe(false)
  expect(schema.getIsPropSchemaMatch('number', 'Buffer')).toBe(false)

  expect(
    schema.getIsPropSchemaMatch('number', { type: 'number', required: true })
  ).toBe(true)
  expect(
    schema.getIsPropSchemaMatch('number', { type: 'number', default: 1 })
  ).toBe(true)
  expect(schema.getIsPropSchemaMatch('number', { type: 'number' })).toBe(false)
  expect(schema.getIsPropSchemaMatch('number', { type: 'string' })).toBe(false)
  expect(
    schema.getIsPropSchemaMatch('number', { type: 'string', required: true })
  ).toBe(false)
  expect(schema.getIsPropSchemaMatch('number', { type: 'boolean' })).toBe(false)
  expect(schema.getIsPropSchemaMatch('number', { type: 'Buffer' })).toBe(false)
  expect(
    schema.getIsPropSchemaMatch('number', { type: 'stringUnion', of: ['x'] })
  ).toBe(false)

  /* boolean -> any */

  expect(schema.getIsPropSchemaMatch('boolean', 'boolean')).toBe(true)
  expect(schema.getIsPropSchemaMatch('boolean', 'string')).toBe(false)
  expect(schema.getIsPropSchemaMatch('boolean', 'number')).toBe(false)
  expect(schema.getIsPropSchemaMatch('boolean', 'Buffer')).toBe(false)

  expect(
    schema.getIsPropSchemaMatch('boolean', { type: 'boolean', required: true })
  ).toBe(true)
  expect(
    schema.getIsPropSchemaMatch('boolean', { type: 'boolean', default: true })
  ).toBe(true)
  expect(
    schema.getIsPropSchemaMatch('boolean', { type: 'boolean', default: false })
  ).toBe(true)
  expect(schema.getIsPropSchemaMatch('boolean', { type: 'boolean' })).toBe(
    false
  )
  expect(schema.getIsPropSchemaMatch('boolean', { type: 'string' })).toBe(false)
  expect(
    schema.getIsPropSchemaMatch('boolean', { type: 'string', required: true })
  ).toBe(false)
  expect(schema.getIsPropSchemaMatch('boolean', { type: 'number' })).toBe(false)
  expect(schema.getIsPropSchemaMatch('boolean', { type: 'Buffer' })).toBe(false)
  expect(
    schema.getIsPropSchemaMatch('boolean', { type: 'stringUnion', of: ['x'] })
  ).toBe(false)

  /* Buffer -> any */

  expect(schema.getIsPropSchemaMatch('Buffer', 'Buffer')).toBe(true)
  expect(schema.getIsPropSchemaMatch('Buffer', 'string')).toBe(false)
  expect(schema.getIsPropSchemaMatch('Buffer', 'number')).toBe(false)
  expect(schema.getIsPropSchemaMatch('Buffer', 'boolean')).toBe(false)

  expect(
    schema.getIsPropSchemaMatch('Buffer', { type: 'Buffer', required: true })
  ).toBe(true)
  expect(schema.getIsPropSchemaMatch('Buffer', { type: 'string' })).toBe(false)
  expect(schema.getIsPropSchemaMatch('Buffer', { type: 'number' })).toBe(false)
  expect(
    schema.getIsPropSchemaMatch('Buffer', { type: 'number', required: true })
  ).toBe(false)
  expect(schema.getIsPropSchemaMatch('Buffer', { type: 'boolean' })).toBe(false)
  expect(schema.getIsPropSchemaMatch('Buffer', { type: 'Buffer' })).toBe(false)
  expect(
    schema.getIsPropSchemaMatch('Buffer', { type: 'stringUnion', of: ['x'] })
  ).toBe(false)
})

it(`getIsPropSchemaMatch: StringPropSchema -> any`, () => {
  /* optional string */

  expect(
    schema.getIsPropSchemaMatch({ type: 'string' }, { type: 'string' })
  ).toBe(true)
  expect(schema.getIsPropSchemaMatch({ type: 'string' }, 'string')).toBe(true)
  expect(
    schema.getIsPropSchemaMatch(
      { type: 'string' },
      { type: 'string', required: true }
    )
  ).toBe(true)
  expect(schema.getIsPropSchemaMatch({ type: 'string' }, 'string')).toBe(true)
  expect(schema.getIsPropSchemaMatch({ type: 'string' }, 'number')).toBe(false)
  expect(
    schema.getIsPropSchemaMatch({ type: 'string' }, { type: 'number' })
  ).toBe(false)
  expect(
    schema.getIsPropSchemaMatch({ type: 'string' }, { type: 'boolean' })
  ).toBe(false)
  expect(
    schema.getIsPropSchemaMatch({ type: 'string' }, { type: 'Buffer' })
  ).toBe(false)

  /* required string */

  expect(
    schema.getIsPropSchemaMatch(
      { type: 'string', required: true },
      { type: 'string', required: true }
    )
  ).toBe(true)
  expect(
    schema.getIsPropSchemaMatch({ type: 'string', required: true }, 'string')
  ).toBe(true)
  expect(
    schema.getIsPropSchemaMatch(
      { type: 'string', required: true },
      { type: 'string', default: 'x' }
    )
  ).toBe(true)
  expect(
    schema.getIsPropSchemaMatch(
      { type: 'string', required: true },
      { type: 'string' }
    )
  ).toBe(false)
  expect(
    schema.getIsPropSchemaMatch(
      { type: 'string', required: true },
      { type: 'number' }
    )
  ).toBe(false)
})

it(`getIsPropSchemaMatch: StringPropSchema -> any (minLength & maxLength check)`, () => {
  /* minLength check */

  expect(
    schema.getIsPropSchemaMatch(
      { type: 'string', minLength: 1 },
      { type: 'string', minLength: 1 }
    )
  ).toBe(true)
  expect(
    schema.getIsPropSchemaMatch(
      { type: 'string', minLength: 1 },
      { type: 'string', minLength: 2 }
    )
  ).toBe(true)
  expect(
    schema.getIsPropSchemaMatch({ type: 'string', minLength: 1 }, 'string')
  ).toBe(false)
  expect(
    schema.getIsPropSchemaMatch(
      { type: 'string', minLength: 2 },
      { type: 'string', minLength: 1 }
    )
  ).toBe(false)

  /* maxLength check */

  expect(
    schema.getIsPropSchemaMatch(
      { type: 'string', maxLength: 5 },
      { type: 'string', maxLength: 5 }
    )
  ).toBe(true)
  expect(
    schema.getIsPropSchemaMatch(
      { type: 'string', maxLength: 5 },
      { type: 'string', maxLength: 4 }
    )
  ).toBe(true)
  expect(
    schema.getIsPropSchemaMatch({ type: 'string', maxLength: 1 }, 'string')
  ).toBe(false)
  expect(
    schema.getIsPropSchemaMatch(
      { type: 'string', maxLength: 5 },
      { type: 'string', maxLength: 6 }
    )
  ).toBe(false)
})

it(`getIsPropSchemaMatch: NumberPropSchema -> any`, () => {
  /* optional number */

  expect(
    schema.getIsPropSchemaMatch({ type: 'number' }, { type: 'number' })
  ).toBe(true)
  expect(schema.getIsPropSchemaMatch({ type: 'number' }, 'number')).toBe(true)
  expect(
    schema.getIsPropSchemaMatch(
      { type: 'number' },
      { type: 'number', required: true }
    )
  ).toBe(true)
  expect(schema.getIsPropSchemaMatch({ type: 'number' }, 'string')).toBe(false)
  expect(
    schema.getIsPropSchemaMatch({ type: 'number' }, { type: 'string' })
  ).toBe(false)
  expect(
    schema.getIsPropSchemaMatch({ type: 'number' }, { type: 'boolean' })
  ).toBe(false)
  expect(
    schema.getIsPropSchemaMatch({ type: 'number' }, { type: 'Buffer' })
  ).toBe(false)

  /* required string */

  expect(
    schema.getIsPropSchemaMatch(
      { type: 'number', required: true },
      { type: 'number', required: true }
    )
  ).toBe(true)
  expect(
    schema.getIsPropSchemaMatch({ type: 'number', required: true }, 'number')
  ).toBe(true)
  expect(
    schema.getIsPropSchemaMatch(
      { type: 'number', required: true },
      { type: 'number', default: 0 }
    )
  ).toBe(true)
  expect(
    schema.getIsPropSchemaMatch(
      { type: 'number', required: true },
      { type: 'number', default: 1 }
    )
  ).toBe(true)
  expect(
    schema.getIsPropSchemaMatch(
      { type: 'number', required: true },
      { type: 'number' }
    )
  ).toBe(false)
  expect(
    schema.getIsPropSchemaMatch(
      { type: 'number', required: true },
      { type: 'string' }
    )
  ).toBe(false)
})

it(`getIsPropSchemaMatch: NumberPropSchema -> any (min & max check)`, () => {
  /* min check */

  expect(
    schema.getIsPropSchemaMatch(
      { type: 'number', min: 1 },
      { type: 'number', min: 1 }
    )
  ).toBe(true)
  expect(
    schema.getIsPropSchemaMatch(
      { type: 'number', min: 1 },
      { type: 'number', min: 2 }
    )
  ).toBe(true)
  expect(
    schema.getIsPropSchemaMatch({ type: 'number', min: 1 }, 'number')
  ).toBe(false)
  expect(
    schema.getIsPropSchemaMatch(
      { type: 'number', min: 2 },
      { type: 'number', min: 1 }
    )
  ).toBe(false)

  /* max check */

  expect(
    schema.getIsPropSchemaMatch(
      { type: 'number', max: 5 },
      { type: 'number', max: 5 }
    )
  ).toBe(true)
  expect(
    schema.getIsPropSchemaMatch(
      { type: 'number', max: 5 },
      { type: 'number', max: 4 }
    )
  ).toBe(true)
  expect(
    schema.getIsPropSchemaMatch({ type: 'number', max: 1 }, 'number')
  ).toBe(false)
  expect(
    schema.getIsPropSchemaMatch(
      { type: 'number', max: 5 },
      { type: 'number', max: 6 }
    )
  ).toBe(false)
})

it(`getIsPropSchemaMatch: BooleanPropSchema -> any`, () => {
  /* optional boolean */

  expect(
    schema.getIsPropSchemaMatch({ type: 'boolean' }, { type: 'boolean' })
  ).toBe(true)
  expect(schema.getIsPropSchemaMatch({ type: 'boolean' }, 'boolean')).toBe(true)
  expect(
    schema.getIsPropSchemaMatch(
      { type: 'boolean' },
      { type: 'boolean', required: true }
    )
  ).toBe(true)
  expect(schema.getIsPropSchemaMatch({ type: 'boolean' }, 'boolean')).toBe(true)
  expect(schema.getIsPropSchemaMatch({ type: 'boolean' }, 'string')).toBe(false)
  expect(
    schema.getIsPropSchemaMatch({ type: 'boolean' }, { type: 'string' })
  ).toBe(false)
  expect(
    schema.getIsPropSchemaMatch({ type: 'boolean' }, { type: 'number' })
  ).toBe(false)
  expect(
    schema.getIsPropSchemaMatch({ type: 'boolean' }, { type: 'Buffer' })
  ).toBe(false)

  /* required boolean */

  expect(
    schema.getIsPropSchemaMatch(
      { type: 'boolean', required: true },
      { type: 'boolean', required: true }
    )
  ).toBe(true)
  expect(
    schema.getIsPropSchemaMatch({ type: 'boolean', required: true }, 'boolean')
  ).toBe(true)
  expect(
    schema.getIsPropSchemaMatch(
      { type: 'boolean', required: true },
      { type: 'boolean', default: true }
    )
  ).toBe(true)
  expect(
    schema.getIsPropSchemaMatch(
      { type: 'boolean', required: true },
      { type: 'boolean', default: false }
    )
  ).toBe(true)
  expect(
    schema.getIsPropSchemaMatch(
      { type: 'boolean', required: true },
      { type: 'boolean' }
    )
  ).toBe(false)
  expect(
    schema.getIsPropSchemaMatch(
      { type: 'boolean', required: true },
      { type: 'string' }
    )
  ).toBe(false)
})

it(`getIsPropSchemaMatch: BufferPropSchema -> any`, () => {
  /* optional Buffer */

  expect(
    schema.getIsPropSchemaMatch({ type: 'Buffer' }, { type: 'Buffer' })
  ).toBe(true)
  expect(schema.getIsPropSchemaMatch({ type: 'Buffer' }, 'Buffer')).toBe(true)
  expect(
    schema.getIsPropSchemaMatch(
      { type: 'Buffer' },
      { type: 'Buffer', required: true }
    )
  ).toBe(true)
  expect(schema.getIsPropSchemaMatch({ type: 'Buffer' }, 'Buffer')).toBe(true)
  expect(schema.getIsPropSchemaMatch({ type: 'Buffer' }, 'string')).toBe(false)
  expect(
    schema.getIsPropSchemaMatch({ type: 'Buffer' }, { type: 'number' })
  ).toBe(false)
  expect(
    schema.getIsPropSchemaMatch({ type: 'Buffer' }, { type: 'boolean' })
  ).toBe(false)

  /* required Buffer */

  expect(
    schema.getIsPropSchemaMatch(
      { type: 'Buffer', required: true },
      { type: 'Buffer', required: true }
    )
  ).toBe(true)
  expect(
    schema.getIsPropSchemaMatch({ type: 'Buffer', required: true }, 'Buffer')
  ).toBe(true)
  expect(
    schema.getIsPropSchemaMatch(
      { type: 'Buffer', required: true },
      { type: 'Buffer', default: Buffer.from('x') }
    )
  ).toBe(true)
  expect(
    schema.getIsPropSchemaMatch(
      { type: 'Buffer', required: true },
      { type: 'Buffer' }
    )
  ).toBe(false)
  expect(
    schema.getIsPropSchemaMatch(
      { type: 'Buffer', required: true },
      { type: 'string' }
    )
  ).toBe(false)
})

it(`getIsPropSchemaMatch: BufferPropSchema -> any (minLength & maxLength check)`, () => {
  /* minLength check */

  expect(
    schema.getIsPropSchemaMatch(
      { type: 'Buffer', minLength: 1 },
      { type: 'Buffer', minLength: 1 }
    )
  ).toBe(true)
  expect(
    schema.getIsPropSchemaMatch(
      { type: 'Buffer', minLength: 1 },
      { type: 'Buffer', minLength: 2 }
    )
  ).toBe(true)
  expect(
    schema.getIsPropSchemaMatch({ type: 'Buffer', minLength: 1 }, 'Buffer')
  ).toBe(false)
  expect(
    schema.getIsPropSchemaMatch(
      { type: 'Buffer', minLength: 2 },
      { type: 'Buffer', minLength: 1 }
    )
  ).toBe(false)

  /* maxLength check */

  expect(
    schema.getIsPropSchemaMatch(
      { type: 'Buffer', maxLength: 5 },
      { type: 'Buffer', maxLength: 5 }
    )
  ).toBe(true)
  expect(
    schema.getIsPropSchemaMatch(
      { type: 'Buffer', maxLength: 5 },
      { type: 'Buffer', maxLength: 4 }
    )
  ).toBe(true)
  expect(
    schema.getIsPropSchemaMatch({ type: 'Buffer', maxLength: 1 }, 'Buffer')
  ).toBe(false)
  expect(
    schema.getIsPropSchemaMatch(
      { type: 'Buffer', maxLength: 5 },
      { type: 'Buffer', maxLength: 6 }
    )
  ).toBe(false)
})

it(`getIsPropSchemaMatch: StringUnionPropSchema -> any`, () => {
  /* optional stringUnion */

  expect(
    schema.getIsPropSchemaMatch(
      { type: 'stringUnion', of: ['one', 'two'] },
      { type: 'stringUnion', of: ['two', 'one'] }
    )
  ).toBe(true)
  expect(
    schema.getIsPropSchemaMatch(
      { type: 'stringUnion', of: ['one', 'two'] },
      { type: 'stringUnion', of: ['two', 'one'] }
    )
  ).toBe(true)
  expect(
    schema.getIsPropSchemaMatch(
      { type: 'stringUnion', of: ['one', 'two'] },
      { type: 'stringUnion', of: ['two'] }
    )
  ).toBe(true)

  expect(
    schema.getIsPropSchemaMatch(
      { type: 'stringUnion', of: ['one', 'two'] },
      { type: 'stringUnion', of: ['two', 'one', 'three'] }
    )
  ).toBe(false)
  expect(
    schema.getIsPropSchemaMatch(
      { type: 'stringUnion', of: ['one', 'two'] },
      { type: 'stringUnion', of: ['two', 'three'] }
    )
  ).toBe(false)
  expect(
    schema.getIsPropSchemaMatch(
      { type: 'stringUnion', of: ['one', 'two'] },
      'string'
    )
  ).toBe(false)

  /* required stringUnion */

  expect(
    schema.getIsPropSchemaMatch(
      { type: 'stringUnion', of: ['one', 'two'], required: true },
      { type: 'stringUnion', of: ['two', 'one'], required: true }
    )
  ).toBe(true)

  expect(
    schema.getIsPropSchemaMatch(
      { type: 'stringUnion', of: ['one', 'two'], required: true },
      { type: 'stringUnion', of: ['one', 'two'] }
    )
  ).toBe(false)
  expect(
    schema.getIsPropSchemaMatch(
      { type: 'stringUnion', of: ['one', 'two'], required: true },
      { type: 'stringUnion', of: ['one', 'two'] }
    )
  ).toBe(false)
  expect(
    schema.getIsPropSchemaMatch(
      { type: 'stringUnion', of: ['one', 'two'], required: true },
      'string'
    )
  ).toBe(false)
})

it(`getIsPropSchemaMatch: any -> undefined`, () => {
  expect(schema.getIsPropSchemaMatch({ type: 'string' }, undefined)).toBe(true)
  expect(schema.getIsPropSchemaMatch({ type: 'number' }, undefined)).toBe(true)
  expect(schema.getIsPropSchemaMatch({ type: 'boolean' }, undefined)).toBe(true)
  expect(schema.getIsPropSchemaMatch({ type: 'Buffer' }, undefined)).toBe(true)
  expect(
    schema.getIsPropSchemaMatch({ type: 'stringUnion', of: ['x'] }, undefined)
  ).toBe(true)

  expect(
    schema.getIsPropSchemaMatch({ type: 'string', default: 'x' }, undefined)
  ).toBe(true)
  expect(
    schema.getIsPropSchemaMatch(
      { type: 'string', required: true, default: 'x' },
      undefined
    )
  ).toBe(true)

  expect(
    schema.getIsPropSchemaMatch({ type: 'string', required: true }, undefined)
  ).toBe(false)
  expect(
    schema.getIsPropSchemaMatch({ type: 'number', required: true }, undefined)
  ).toBe(false)
  expect(
    schema.getIsPropSchemaMatch({ type: 'boolean', required: true }, undefined)
  ).toBe(false)
  expect(
    schema.getIsPropSchemaMatch({ type: 'Buffer', required: true }, undefined)
  ).toBe(false)
  expect(
    schema.getIsPropSchemaMatch(
      { type: 'stringUnion', of: ['x'], required: true },
      undefined
    )
  ).toBe(false)

  expect(schema.getIsPropSchemaMatch('string', undefined)).toBe(false)
  expect(schema.getIsPropSchemaMatch('number', undefined)).toBe(false)
  expect(schema.getIsPropSchemaMatch('boolean', undefined)).toBe(false)
  expect(schema.getIsPropSchemaMatch('Buffer', undefined)).toBe(false)
})

it(`getIsIOSchemaMatch: one dimentional primitives ('string', 'Buffer')`, () => {
  /* string string -> any */

  expect(
    schema.getIsIOSchemaMatch(['string', 'string'], ['string', 'string'])
  ).toBe(true)

  expect(
    schema.getIsIOSchemaMatch(['string', 'string'], ['Buffer', 'string'])
  ).toBe(false)

  expect(
    schema.getIsIOSchemaMatch(['string', 'string'], ['string', 'Buffer'])
  ).toBe(false)

  /* Buffer string -> any */

  expect(
    schema.getIsIOSchemaMatch(['Buffer', 'string'], ['Buffer', 'string'])
  ).toBe(true)

  expect(
    schema.getIsIOSchemaMatch(['Buffer', 'string'], ['string', 'string'])
  ).toBe(false)

  expect(
    schema.getIsIOSchemaMatch(['Buffer', 'string'], ['string', 'string'])
  ).toBe(false)

  expect(
    schema.getIsIOSchemaMatch(['string', 'Buffer'], ['string', 'string'])
  ).toBe(false)

  expect(
    schema.getIsIOSchemaMatch(['string', 'string'], ['string', 'string'])
  ).toBe(true)
})

it(`getIsObjectUnitSchemaMatch`, () => {
  expect(
    schema.getIsObjectUnitSchemaMatch(
      {
        unitId: { type: 'stringUnion', of: ['x'], required: true },
        payload: 'string',
      },
      {
        unitId: { type: 'stringUnion', of: ['x'], required: true },
        payload: 'string',
      }
    )
  ).toBe(true)
  expect(
    schema.getIsObjectUnitSchemaMatch(
      {
        unitId: { type: 'stringUnion', of: ['x'], required: true },
        payload: 'string',
      },
      {
        unitId: { type: 'stringUnion', of: ['y'], required: true },
        payload: 'string',
      }
    )
  ).toBe(false)
  expect(
    schema.getIsObjectUnitSchemaMatch(
      {
        unitId: { type: 'stringUnion', of: ['x'], required: true },
        payload: 'string',
      },
      {
        unitId: { type: 'stringUnion', of: ['x'], required: true },
        payload: 'Buffer',
      }
    )
  ).toBe(false)

  expect(
    schema.getIsObjectUnitSchemaMatch(
      {
        unitId: { type: 'stringUnion', of: ['x'], required: true },
        payload: 'string',
      },
      {
        unitId: { type: 'stringUnion', of: ['x'], required: true },
        payload: 'string',
        anythingExtra: 'string',
      }
    )
  ).toBe(true)
  expect(
    schema.getIsObjectUnitSchemaMatch(
      {
        unitId: { type: 'stringUnion', of: ['x'], required: true },
        payload: 'string',
        anythingExtra: 'string',
      },
      {
        unitId: { type: 'stringUnion', of: ['x'], required: true },
        payload: 'string',
      }
    )
  ).toBe(false)

  expect(
    schema.getIsObjectUnitSchemaMatch(
      {
        unitId: { type: 'stringUnion', of: ['x'], required: true },
        payload: 'string',
        stringProp: 'string',
      },
      {
        unitId: { type: 'stringUnion', of: ['x'], required: true },
        payload: 'string',
        stringProp: 'string',
      }
    )
  ).toBe(true)
  expect(
    schema.getIsObjectUnitSchemaMatch(
      {
        unitId: { type: 'stringUnion', of: ['x'], required: true },
        payload: 'string',
        stringProp: 'string',
      },
      {
        unitId: { type: 'stringUnion', of: ['x'], required: true },
        payload: 'string',
        stringProp: 'number',
      }
    )
  ).toBe(false)

  expect(
    schema.getIsObjectUnitSchemaMatch(
      {
        unitId: { type: 'stringUnion', of: ['x'], required: true },
        payload: 'string',
        stringProp: { type: 'string' },
      },
      {
        unitId: { type: 'stringUnion', of: ['x'], required: true },
        payload: 'string',
        stringProp: { type: 'string' },
      }
    )
  ).toBe(true)

  expect(
    schema.getIsObjectUnitSchemaMatch(
      {
        unitId: { type: 'stringUnion', of: ['x'], required: true },
        payload: 'string',
        stringProp: { type: 'string' },
      },
      {
        unitId: { type: 'stringUnion', of: ['x'], required: true },
        payload: 'string',
        stringProp: { type: 'number' },
      }
    )
  ).toBe(false)

  expect(
    schema.getIsObjectUnitSchemaMatch(
      {
        unitId: { type: 'stringUnion', of: ['x'], required: true },
        payload: 'string',
        stringProp: { type: 'string' },
      },
      {
        unitId: { type: 'stringUnion', of: ['x'], required: true },
        payload: 'string',
      }
    )
  ).toBe(true)
  expect(
    schema.getIsObjectUnitSchemaMatch(
      {
        unitId: { type: 'stringUnion', of: ['x'], required: true },
        payload: 'string',
        stringProp: { type: 'string', required: true },
      },
      {
        unitId: { type: 'stringUnion', of: ['x'], required: true },
        payload: 'string',
      }
    )
  ).toBe(false)
})

it(`getIsIOUnitSchemaMatch: singular 'string' | 'Buffer'`, () => {
  expect(schema.getIsIOUnitSchemaMatch('string', 'string')).toBe(true)

  expect(schema.getIsIOUnitSchemaMatch('string', 'Buffer')).toBe(false)
  expect(schema.getIsIOUnitSchemaMatch('string', ['string'])).toBe(false)
  expect(schema.getIsIOUnitSchemaMatch('string', ['Buffer'])).toBe(false)

  expect(
    schema.getIsIOUnitSchemaMatch('string', {
      unitId: { type: 'stringUnion', of: ['x'], required: true },
      payload: 'string',
    })
  ).toBe(false)

  expect(
    schema.getIsIOUnitSchemaMatch('string', [
      {
        unitId: { type: 'stringUnion', of: ['x'], required: true },
        payload: 'string',
      },
    ])
  ).toBe(false)

  expect(schema.getIsIOUnitSchemaMatch('Buffer', 'Buffer')).toBe(true)

  expect(schema.getIsIOUnitSchemaMatch('Buffer', 'string')).toBe(false)
  expect(schema.getIsIOUnitSchemaMatch('Buffer', ['Buffer'])).toBe(false)
  expect(schema.getIsIOUnitSchemaMatch('Buffer', ['string'])).toBe(false)

  expect(
    schema.getIsIOUnitSchemaMatch('Buffer', {
      unitId: { type: 'stringUnion', of: ['x'], required: true },
      payload: 'string',
    })
  ).toBe(false)

  expect(
    schema.getIsIOUnitSchemaMatch('Buffer', [
      {
        unitId: { type: 'stringUnion', of: ['x'], required: true },
        payload: 'string',
      },
    ])
  ).toBe(false)
})

it(`getIsIOUnitSchemaMatch: array 'string' | 'Buffer'`, () => {
  expect(schema.getIsIOUnitSchemaMatch(['string'], ['string'])).toBe(true)
  expect(schema.getIsIOUnitSchemaMatch(['string'], 'string')).toBe(false)
  expect(
    schema.getIsIOUnitSchemaMatch(['string'], {
      unitId: { type: 'stringUnion', of: ['x'], required: true },
      payload: 'string',
    })
  ).toBe(false)
  expect(
    schema.getIsIOUnitSchemaMatch(
      ['string'],
      [
        {
          unitId: { type: 'stringUnion', of: ['x'], required: true },
          payload: 'string',
        },
      ]
    )
  ).toBe(false)

  expect(schema.getIsIOUnitSchemaMatch(['Buffer'], ['Buffer'])).toBe(true)
  expect(schema.getIsIOUnitSchemaMatch(['Buffer'], 'Buffer')).toBe(false)
  expect(
    schema.getIsIOUnitSchemaMatch(['Buffer'], {
      unitId: { type: 'stringUnion', of: ['x'], required: true },
      payload: 'Buffer',
    })
  ).toBe(false)
  expect(
    schema.getIsIOUnitSchemaMatch(
      ['Buffer'],
      [
        {
          unitId: { type: 'stringUnion', of: ['x'], required: true },
          payload: 'Buffer',
        },
      ]
    )
  ).toBe(false)
})

it(`getIsIOUnitSchemaMatch: singular ObjectUnitSchema`, () => {
  const x: I.ObjectUnitSchema = {
    unitId: { type: 'stringUnion', of: ['a'], required: true },
    payload: 'string',
  }

  const y: I.ObjectUnitSchema = {
    unitId: { type: 'stringUnion', of: ['b'], required: true },
    payload: 'string',
  }

  expect(schema.getIsIOUnitSchemaMatch(x, x)).toBe(true)
  expect(schema.getIsIOUnitSchemaMatch(x, y)).toBe(false)

  expect(schema.getIsIOUnitSchemaMatch(y, y)).toBe(true)
  expect(schema.getIsIOUnitSchemaMatch(y, x)).toBe(false)
})

it(`getIsIOUnitSchemaMatch: array ObjectUnitSchema`, () => {
  const x: I.ObjectUnitSchema = {
    unitId: { type: 'stringUnion', of: ['a'], required: true },
    payload: 'string',
  }

  const y: I.ObjectUnitSchema = {
    unitId: { type: 'stringUnion', of: ['b'], required: true },
    payload: 'string',
  }

  expect(schema.getIsIOUnitSchemaMatch(x, x)).toBe(true)
  expect(schema.getIsIOUnitSchemaMatch(x, y)).toBe(false)

  expect(schema.getIsIOUnitSchemaMatch(y, y)).toBe(true)
  expect(schema.getIsIOUnitSchemaMatch(y, x)).toBe(false)
})

it(`getIsIOSchemaMatch: one dimentional primitives ('string', 'Buffer')`, () => {
  /* string string -> any */

  expect(
    schema.getIsIOSchemaMatch(['string', 'string'], ['string', 'string'])
  ).toBe(true)

  expect(
    schema.getIsIOSchemaMatch(['string', 'string'], ['Buffer', 'string'])
  ).toBe(false)

  expect(
    schema.getIsIOSchemaMatch(['string', 'string'], ['string', 'Buffer'])
  ).toBe(false)

  /* Buffer string -> any */

  expect(
    schema.getIsIOSchemaMatch(['Buffer', 'string'], ['Buffer', 'string'])
  ).toBe(true)

  expect(
    schema.getIsIOSchemaMatch(['Buffer', 'string'], ['string', 'string'])
  ).toBe(false)

  expect(
    schema.getIsIOSchemaMatch(['Buffer', 'string'], ['string', 'string'])
  ).toBe(false)

  expect(
    schema.getIsIOSchemaMatch(['string', 'Buffer'], ['string', 'string'])
  ).toBe(false)

  expect(
    schema.getIsIOSchemaMatch(['string', 'string'], ['string', 'string'])
  ).toBe(true)
})

it(`getIsIOSchemaMatch: ObjectUnitSchema`, () => {
  const x: I.ObjectUnitSchema = {
    unitId: { type: 'stringUnion', of: ['a'], required: true },
    payload: 'string',
  }

  const y: I.ObjectUnitSchema = {
    unitId: { type: 'stringUnion', of: ['b'], required: true },
    payload: 'string',
  }

  expect(schema.getIsIOSchemaMatch([x, x], [x, x])).toBe(true)
  expect(schema.getIsIOSchemaMatch(['string', x], [x, x])).toBe(false)
  expect(schema.getIsIOSchemaMatch([x, 'string'], [x, x])).toBe(false)
  expect(schema.getIsIOSchemaMatch([x, x], ['string', x])).toBe(false)
  expect(schema.getIsIOSchemaMatch([x, x], [x, 'string'])).toBe(false)

  expect(schema.getIsIOSchemaMatch([x, y], [x, y])).toBe(true)

  expect(schema.getIsIOSchemaMatch([y, x], [x, y])).toBe(false)
  expect(schema.getIsIOSchemaMatch([y, y], [x, y])).toBe(false)
  expect(schema.getIsIOSchemaMatch([x, x], [x, y])).toBe(false)
  expect(schema.getIsIOSchemaMatch([x, y], [y, x])).toBe(false)
  expect(schema.getIsIOSchemaMatch([x, y], [x, x])).toBe(false)
  expect(schema.getIsIOSchemaMatch([x, y], [y, y])).toBe(false)
})

it(`getIsIOSchemaMatch: ObjectUnitSchema array`, () => {
  const x: I.ObjectUnitSchema = {
    unitId: { type: 'stringUnion', of: ['a'], required: true },
    payload: 'string',
  }

  expect(schema.getIsIOSchemaMatch([[x], x], [[x], x])).toBe(true)
  expect(schema.getIsIOSchemaMatch([[x], x], [x, x])).toBe(false)
  expect(schema.getIsIOSchemaMatch([[x], x], [x, [x]])).toBe(false)

  expect(schema.getIsIOSchemaMatch([x, [x]], [x, [x]])).toBe(true)
  expect(schema.getIsIOSchemaMatch([x, [x]], [x, x])).toBe(false)
  expect(schema.getIsIOSchemaMatch([x, [x]], [[x], x])).toBe(false)

  expect(schema.getIsIOSchemaMatch([[x], [x]], [[x], [x]])).toBe(true)
  expect(schema.getIsIOSchemaMatch([[x], [x]], [x, [x]])).toBe(false)
  expect(schema.getIsIOSchemaMatch([[x], [x]], [[x], x])).toBe(false)
  expect(schema.getIsIOSchemaMatch([[x], [x]], [x, x])).toBe(false)

  const y: I.ObjectUnitSchema = {
    unitId: { type: 'stringUnion', of: ['b'], required: true },
    payload: 'string',
  }

  expect(schema.getIsIOSchemaMatch([[x], [y]], [[x], [y]])).toBe(true)
  expect(schema.getIsIOSchemaMatch([[x], [y]], [x, [y]])).toBe(false)
  expect(schema.getIsIOSchemaMatch([[x], [y]], [[x], y])).toBe(false)
  expect(schema.getIsIOSchemaMatch([[x], y], [[x], [y]])).toBe(false)
  expect(schema.getIsIOSchemaMatch([x, [y]], [[x], [y]])).toBe(false)
  expect(schema.getIsIOSchemaMatch([x, y], [[x], [y]])).toBe(false)
})

it('validateByPropSchema: RequiredPropSchema', () => {
  expect(schema.validateByPropSchema('string', 'stringValue')).toBe(true)
  expect(schema.validateByPropSchema('string', undefined)).toBe('typeError')
  expect(schema.validateByPropSchema('string', null)).toBe('typeError')
  expect(schema.validateByPropSchema('string', {})).toBe('typeError')
  expect(schema.validateByPropSchema('string', 12)).toBe('typeError')
  expect(schema.validateByPropSchema('string', true)).toBe('typeError')
  expect(schema.validateByPropSchema('string', false)).toBe('typeError')
  expect(schema.validateByPropSchema('string', Buffer.from('check'))).toBe(
    'typeError'
  )

  expect(schema.validateByPropSchema('number', 12)).toBe(true)
  expect(schema.validateByPropSchema('number', 0)).toBe(true)
  expect(schema.validateByPropSchema('number', -100)).toBe(true)
  expect(schema.validateByPropSchema('number', undefined)).toBe('typeError')
  expect(schema.validateByPropSchema('number', null)).toBe('typeError')
  expect(schema.validateByPropSchema('number', {})).toBe('typeError')
  expect(schema.validateByPropSchema('number', NaN)).toBe('typeError')
  expect(schema.validateByPropSchema('number', Infinity)).toBe('typeError')
  expect(schema.validateByPropSchema('number', -Infinity)).toBe('typeError')
  expect(schema.validateByPropSchema('number', 'stringValue')).toBe('typeError')
  expect(schema.validateByPropSchema('number', true)).toBe('typeError')
  expect(schema.validateByPropSchema('number', false)).toBe('typeError')
  expect(schema.validateByPropSchema('number', Buffer.from('check'))).toBe(
    'typeError'
  )

  expect(schema.validateByPropSchema('boolean', true)).toBe(true)
  expect(schema.validateByPropSchema('boolean', false)).toBe(true)
  expect(schema.validateByPropSchema('boolean', undefined)).toBe('typeError')
  expect(schema.validateByPropSchema('boolean', null)).toBe('typeError')
  expect(schema.validateByPropSchema('boolean', {})).toBe('typeError')
  expect(schema.validateByPropSchema('boolean', 'stringValue')).toBe(
    'typeError'
  )
  expect(schema.validateByPropSchema('boolean', 12)).toBe('typeError')
  expect(schema.validateByPropSchema('boolean', Buffer.from('check'))).toBe(
    'typeError'
  )

  expect(schema.validateByPropSchema('Buffer', Buffer.from('check'))).toBe(true)
  expect(schema.validateByPropSchema('Buffer', undefined)).toBe('typeError')
  expect(schema.validateByPropSchema('Buffer', null)).toBe('typeError')
  expect(schema.validateByPropSchema('Buffer', {})).toBe('typeError')
  expect(schema.validateByPropSchema('Buffer', 'stringValue')).toBe('typeError')
  expect(schema.validateByPropSchema('Buffer', 12)).toBe('typeError')
  expect(schema.validateByPropSchema('Buffer', false)).toBe('typeError')
  expect(schema.validateByPropSchema('Buffer', true)).toBe('typeError')
})

it('validateValueByPropSchema: ObjectPropSchema optional', () => {
  /* type: 'string' */

  expect(schema.validateByPropSchema({ type: 'string' }, 'stringValue')).toBe(
    true
  )
  expect(schema.validateByPropSchema({ type: 'string' }, undefined)).toBe(true)
  expect(schema.validateByPropSchema({ type: 'string' }, null)).toBe(
    'typeError'
  )
  expect(schema.validateByPropSchema({ type: 'string' }, 12)).toBe('typeError')
  expect(schema.validateByPropSchema({ type: 'string' }, true)).toBe(
    'typeError'
  )
  expect(schema.validateByPropSchema({ type: 'string' }, false)).toBe(
    'typeError'
  )
  expect(
    schema.validateByPropSchema({ type: 'string' }, Buffer.from('check'))
  ).toBe('typeError')

  expect(
    schema.validateByPropSchema(
      { type: 'string', minLength: 11 },
      'stringValue'
    )
  ).toBe(true)
  expect(
    schema.validateByPropSchema(
      { type: 'string', maxLength: 11 },
      'stringValue'
    )
  ).toBe(true)
  expect(
    schema.validateByPropSchema(
      { type: 'string', minLength: 11, maxLength: 11 },
      'stringValue'
    )
  ).toBe(true)

  expect(
    schema.validateByPropSchema(
      { type: 'string', maxLength: 11 },
      'stringValue'.slice(1)
    )
  ).toBe(true)
  expect(
    schema.validateByPropSchema(
      { type: 'string', minLength: 11 },
      'stringValue'.slice(1)
    )
  ).toBe('rangeError')
  expect(
    schema.validateByPropSchema(
      { type: 'string', minLength: 11, maxLength: 11 },
      'stringValue'.slice(1)
    )
  ).toBe('rangeError')

  expect(
    schema.validateByPropSchema(
      { type: 'string', minLength: 11 },
      'stringValue' + 'x'
    )
  ).toBe(true)
  expect(
    schema.validateByPropSchema(
      { type: 'string', maxLength: 11 },
      'stringValue' + 'x'
    )
  ).toBe('rangeError')
  expect(
    schema.validateByPropSchema(
      { type: 'string', minLength: 11, maxLength: 11 },
      'stringValue' + 'x'
    )
  ).toBe('rangeError')

  /* type: 'number' */

  expect(schema.validateByPropSchema({ type: 'number' }, 12)).toBe(true)
  expect(schema.validateByPropSchema({ type: 'number' }, 0)).toBe(true)
  expect(schema.validateByPropSchema({ type: 'number' }, -100)).toBe(true)
  expect(schema.validateByPropSchema({ type: 'number' }, undefined)).toBe(true)
  expect(schema.validateByPropSchema({ type: 'number' }, null)).toBe(
    'typeError'
  )
  expect(schema.validateByPropSchema({ type: 'number' }, {})).toBe('typeError')
  expect(schema.validateByPropSchema({ type: 'number' }, NaN)).toBe('typeError')
  expect(schema.validateByPropSchema({ type: 'number' }, Infinity)).toBe(
    'typeError'
  )
  expect(schema.validateByPropSchema({ type: 'number' }, -Infinity)).toBe(
    'typeError'
  )
  expect(schema.validateByPropSchema({ type: 'number' }, 'stringValue')).toBe(
    'typeError'
  )
  expect(schema.validateByPropSchema({ type: 'number' }, true)).toBe(
    'typeError'
  )
  expect(schema.validateByPropSchema({ type: 'number' }, false)).toBe(
    'typeError'
  )
  expect(
    schema.validateByPropSchema({ type: 'number' }, Buffer.from('check'))
  ).toBe('typeError')

  /* type: 'boolean' */

  expect(schema.validateByPropSchema({ type: 'boolean' }, true)).toBe(true)
  expect(schema.validateByPropSchema({ type: 'boolean' }, false)).toBe(true)
  expect(schema.validateByPropSchema({ type: 'boolean' }, undefined)).toBe(true)
  expect(schema.validateByPropSchema({ type: 'boolean' }, null)).toBe(
    'typeError'
  )
  expect(schema.validateByPropSchema({ type: 'boolean' }, 'stringValue')).toBe(
    'typeError'
  )
  expect(schema.validateByPropSchema({ type: 'boolean' }, 12)).toBe('typeError')
  expect(
    schema.validateByPropSchema({ type: 'boolean' }, Buffer.from('check'))
  ).toBe('typeError')

  /* type: 'Buffer' */

  expect(
    schema.validateByPropSchema({ type: 'Buffer' }, Buffer.from('check'))
  ).toBe(true)
  expect(schema.validateByPropSchema({ type: 'Buffer' }, undefined)).toBe(true)
  expect(schema.validateByPropSchema({ type: 'Buffer' }, null)).toBe(
    'typeError'
  )
  expect(schema.validateByPropSchema({ type: 'Buffer' }, {})).toBe('typeError')
  expect(schema.validateByPropSchema({ type: 'Buffer' }, 'stringValue')).toBe(
    'typeError'
  )
  expect(schema.validateByPropSchema({ type: 'Buffer' }, 12)).toBe('typeError')
  expect(schema.validateByPropSchema({ type: 'Buffer' }, false)).toBe(
    'typeError'
  )
  expect(schema.validateByPropSchema({ type: 'Buffer' }, true)).toBe(
    'typeError'
  )

  expect(
    schema.validateByPropSchema(
      { type: 'Buffer', minLength: 5, maxLength: 5 },
      Buffer.from('check')
    )
  ).toBe(true)
  expect(
    schema.validateByPropSchema(
      { type: 'Buffer', maxLength: 5 },
      Buffer.from('check')
    )
  ).toBe(true)
  expect(
    schema.validateByPropSchema(
      { type: 'Buffer', minLength: 5 },
      Buffer.from('check')
    )
  ).toBe(true)

  expect(
    schema.validateByPropSchema(
      { type: 'Buffer', minLength: 5, maxLength: 5 },
      Buffer.from('check' + 'x')
    )
  ).toBe('rangeError')
  expect(
    schema.validateByPropSchema(
      { type: 'Buffer', maxLength: 5 },
      Buffer.from('check' + 'x')
    )
  ).toBe('rangeError')

  expect(
    schema.validateByPropSchema(
      { type: 'Buffer', minLength: 5, maxLength: 5 },
      Buffer.from('check'.slice(1))
    )
  ).toBe('rangeError')
  expect(
    schema.validateByPropSchema(
      { type: 'Buffer', minLength: 5 },
      Buffer.from('check'.slice(1))
    )
  ).toBe('rangeError')

  /* type: 'stringUnion' */

  expect(
    schema.validateByPropSchema(
      {
        type: 'stringUnion',
        of: ['one', 'two'],
      },
      'one'
    )
  ).toBe(true)
  expect(
    schema.validateByPropSchema(
      {
        type: 'stringUnion',
        of: ['one', 'two'],
      },
      'two'
    )
  ).toBe(true)

  expect(
    schema.validateByPropSchema(
      {
        type: 'stringUnion',
        of: ['one', 'two'],
      },
      'two' + 'x'
    )
  ).toBe('typeError')

  expect(
    schema.validateByPropSchema({ type: 'stringUnion', of: ['x'] }, undefined)
  ).toBe(true)
  expect(
    schema.validateByPropSchema({ type: 'stringUnion', of: ['x'] }, null)
  ).toBe('typeError')
  expect(
    schema.validateByPropSchema({ type: 'stringUnion', of: ['x'] }, {})
  ).toBe('typeError')
  expect(
    schema.validateByPropSchema({ type: 'stringUnion', of: ['x'] }, 12)
  ).toBe('typeError')
})

it('validateValueByPropSchema: ObjectPropSchema required "typeError"', () => {
  expect(
    schema.validateByPropSchema({ type: 'string', required: true }, undefined)
  ).toBe('typeError')
  expect(
    schema.validateByPropSchema({ type: 'number', required: true }, undefined)
  ).toBe('typeError')
  expect(
    schema.validateByPropSchema({ type: 'boolean', required: true }, undefined)
  ).toBe('typeError')
  expect(
    schema.validateByPropSchema({ type: 'Buffer', required: true }, undefined)
  ).toBe('typeError')
  expect(
    schema.validateByPropSchema(
      { type: 'stringUnion', of: ['x'], required: true },
      undefined
    )
  ).toBe('typeError')
})

it('validateValueByPropSchema: ObjectPropSchema default "typeError"', () => {
  expect(
    schema.validateByPropSchema({ type: 'string', default: 'x' }, undefined)
  ).toBe('typeError')
  expect(
    schema.validateByPropSchema({ type: 'number', default: 12 }, undefined)
  ).toBe('typeError')
  expect(
    schema.validateByPropSchema({ type: 'boolean', default: true }, undefined)
  ).toBe('typeError')
  expect(
    schema.validateByPropSchema(
      { type: 'Buffer', default: Buffer.from('check') },
      undefined
    )
  ).toBe('typeError')
  expect(
    schema.validateByPropSchema(
      { type: 'stringUnion', of: ['x'], default: 'y' },
      undefined
    )
  ).toBe('typeError')
})

it('validateBySchema: check `rangeError` and `typeError` cases', () => {
  expect(
    schema.validateBySchema(
      {
        a: 'string',
        b: 'number',
      },
      { a: 'check', b: 12 }
    )
  ).toBe(true)

  expect(
    schema.validateBySchema(
      {
        a: 'string',
        b: 'number',
      },
      { a: 'check' }
    )
  ).toEqual({ errorType: 'typeError', schemaKey: 'b' })

  expect(
    schema.validateBySchema(
      {
        a: { type: 'string', required: true, minLength: 5, maxLength: 5 },
        b: { type: 'number', required: true, min: 12, max: 12 },
      },
      { a: 'check', b: 12 }
    )
  ).toBe(true)

  expect(
    schema.validateBySchema(
      {
        a: { type: 'string', required: true, minLength: 5, maxLength: 5 },
        b: { type: 'number', required: true, min: 12, max: 12 },
      },
      { a: 'check' + 'x', b: 12 }
    )
  ).toEqual({ schemaKey: 'a', errorType: 'rangeError' })

  expect(
    schema.validateBySchema(
      {
        a: { type: 'string', required: true, minLength: 5, maxLength: 5 },
        b: { type: 'number', required: true, min: 12, max: 12 },
      },
      { a: 'check', b: 13 }
    )
  ).toEqual({ schemaKey: 'b', errorType: 'rangeError' })
})

it('validateUnit: payload and object unit cases', () => {
  /* PayloadUnitSchema */
  expect(schema.validateUnit('string', 'case')).toBe(true)
  expect(schema.validateUnit('string', 123123)).toBe('typeError')
  expect(schema.validateUnit('Buffer', Buffer.from('check'))).toBe(true)
  expect(schema.validateUnit('Buffer', 'case')).toBe('typeError')

  /* ObjectUnitSchema */
  expect(
    schema.validateUnit(
      {
        unitId: { type: 'stringUnion', required: true, of: ['testUnit'] },
        payload: 'string',
      },
      { unitId: 'testUnit', payload: 'payloadValue' }
    )
  ).toBe(true)
  expect(
    schema.validateUnit(
      {
        unitId: { type: 'stringUnion', required: true, of: ['testUnit'] },
        payload: 'string',
      },
      'case'
    )
  ).toBe('typeError')
  expect(
    schema.validateUnit(
      {
        unitId: { type: 'stringUnion', required: true, of: ['testUnit'] },
        payload: 'string',
      },
      { unitId: 'testUnit' }
    )
  ).toEqual({ errorType: 'typeError', schemaKey: 'payload' })
})

it('validateIOUnit: ORDER of PayloadUnitSchema', () => {
  expect(schema.validateIOUnit(['string'], ['one', 'two'])).toBe(true)
  expect(schema.validateIOUnit(['string'], ['one', 12])).toBe('typeError')
  expect(schema.validateIOUnit(['string'], 'case')).toBe('typeError')
})

it('validateIOUnit: ORDER of ObjectUnitSchema', () => {
  expect(
    schema.validateIOUnit(
      [
        {
          unitId: { type: 'stringUnion', required: true, of: ['testUnit'] },
          payload: 'string',
        },
      ],
      [
        {
          unitId: 'testUnit',
          payload: 'unit1',
        },
        {
          unitId: 'testUnit',
          payload: 'unit2',
        },
      ]
    )
  ).toBe(true)

  expect(
    schema.validateIOUnit(
      [
        {
          unitId: { type: 'stringUnion', required: true, of: ['testUnit'] },
          payload: 'string',
        },
      ],
      [
        {
          unitId: 'testUnit',
          payload: 'unit1',
        },
        {
          unitId: 'testUnit',
        },
      ]
    )
  ).toEqual({ schemaKey: 'payload', errorType: 'typeError' })

  expect(
    schema.validateIOUnit(
      [
        {
          unitId: { type: 'stringUnion', required: true, of: ['testUnit'] },
          payload: 'string',
        },
      ],
      {
        unitId: 'testUnit',
        payload: 'unit1',
      }
    )
  ).toBe('typeError')
})

it('validateIOUnit: singular PayloadUnitSchema', () => {
  expect(schema.validateIOUnit('string', 'test')).toBe(true)
  expect(schema.validateIOUnit('string', 12)).toBe('typeError')
})

it('validateIOUnit: singular ObjectUnitSchema', () => {
  expect(
    schema.validateIOUnit(
      {
        unitId: { type: 'stringUnion', required: true, of: ['testUnit'] },
        payload: 'string',
      },
      {
        unitId: 'testUnit',
        payload: 'unit1',
      }
    )
  ).toBe(true)

  expect(
    schema.validateIOUnit(
      {
        unitId: { type: 'stringUnion', required: true, of: ['testUnit'] },
        payload: 'string',
      },
      'check'
    )
  ).toBe('typeError')

  expect(
    schema.validateIOUnit(
      {
        unitId: { type: 'stringUnion', required: true, of: ['testUnit'] },
        payload: 'string',
      },
      {
        unitIdERROR: { type: 'stringUnion', required: true, of: ['testUnit'] },
        payload: 'string',
      }
    )
  ).toEqual({ errorType: 'typeError', schemaKey: 'unitId' })
})
