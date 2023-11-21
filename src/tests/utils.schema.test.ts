import dedent from 'dedent'
import config from '../config'
import * as schema from '../utils/schema'
import * as I from '../types'
import { toKebabCase } from '../utils/str'

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
    id: 'custom',
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
    typings: 'StreamOf<string>',
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
    typings: 'StreamOf<string[]>',
  })

  const customUnit: I.ObjectUnitSchema = {
    id: 'custom',
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
    typings: 'StreamOf<CustomUnit>',
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
    typings: 'StreamOf<CustomUnit>',
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
      typings: 'StreamOf<string>',
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
    typings: 'StreamOf<string[]>',
  })

  /* Primitive unit array schema output */
  expect(
    schema.generateIOPrimitive(transferMethod, 'output', ['string'])
  ).toEqual({
    key: 'stringArr',
    typings: 'string[]',
  })

  const customUnit: I.ObjectUnitSchema = {
    id: 'custom',
    payload: 'string',
  }

  /* Custom unit schema input */
  expect(
    schema.generateIOPrimitive(transferMethod, 'input', customUnit)
  ).toEqual({
    key: 'customStream',
    typings: 'StreamOf<CustomUnit>',
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
    typings: 'StreamOf<CustomUnit[]>',
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
      typings: 'StreamOf<string>',
    }
  )

  /* Primitive unit output */
  expect(
    schema.generateIOPrimitive(transferMethod, 'output', 'string')
  ).toEqual({
    key: 'stringStream',
    typings: 'StreamOf<string>',
  })

  /* Primitive unit array schema input */
  expect(
    schema.generateIOPrimitive(transferMethod, 'input', ['string'])
  ).toEqual({
    key: 'stringArrStream',
    typings: 'StreamOf<string[]>',
  })

  /* Primitive unit array schema output */
  expect(
    schema.generateIOPrimitive(transferMethod, 'output', ['string'])
  ).toEqual({
    key: 'stringArrStream',
    typings: 'StreamOf<string[]>',
  })

  const customUnit: I.ObjectUnitSchema = {
    id: 'custom',
    payload: 'string',
  }

  /* Custom unit schema input */
  expect(
    schema.generateIOPrimitive(transferMethod, 'input', customUnit)
  ).toEqual({
    key: 'customStream',
    typings: 'StreamOf<CustomUnit>',
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
    typings: 'StreamOf<CustomUnit>',
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
    typings: 'StreamOf<CustomUnit[]>',
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
    typings: 'StreamOf<CustomUnit>',
    objectUnit: {
      id: 'CustomUnit',
      typings: expect.any(String),
    },
  })
})

it('unitSchemaToType: test all possilbe property types', () => {
  const customUnit: I.ObjectUnitSchema = {
    id: 'custom',
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
        id: 'custom'
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
            string: (secrets: Secrets, options: Options, unit: string) => Promise<string>
          }
          buffer: {
            /* buffer -> stringStream;  */
            stringStream: (secrets: Secrets, options: Options, unit: Buffer) => Promise<StreamOf<string>>
          }
          stringStream: {
            /* stringStream -> string;  */
            string: (secrets: Secrets, options: Options, unit: StreamOf<string>) => Promise<string>
          }
          bufferStream: {
            /* bufferStream -> stringStream;  */
            stringStream: (secrets: Secrets, options: Options, unit: StreamOf<Buffer>) => Promise<StreamOf<string>>
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

      export const connector: Connector = {
        textToText: {
          string: {
            /* string -> string;  */
            string: () => ${notImplementedError}
          }
          buffer: {
            /* buffer -> stringStream;  */
            stringStream: () => ${notImplementedError}
          }
          stringStream: {
            /* stringStream -> string;  */
            string: () => ${notImplementedError}
          }
          bufferStream: {
            /* bufferStream -> stringStream;  */
            stringStream: () => ${notImplementedError}
          }
        }
      }
      
      export default connector`)
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
    /* `id: 'customOne'` */
    id: 'customOne',
    /* `payload: string` */
    payload: 'string',
  }

  const customUnitTwo: I.ObjectUnitSchema = {
    id: 'customTwo',
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
       * The file is generated by SPADAR CLI v. 0.1.0
       * DO NOT EDIT IT MANUALLY because it could be automatically rewritten
       **/

      export type Keys = {
        OPENAI_API_KEY: string
      }

      export type Options = {
        model: 'gpt-4' | 'gpt-3'
      }

      export type CustomOneUnit = {
        id: 'customOne'
        payload: string
      }

      export type CustomTwoUnit = {
        id: 'customTwo'
        payload: Buffer
      }

      export type Connector = {
        textToText: {
          customOne: {
            /* customOne -> customOne;  */
            customOne: (secrets: Secrets, options: Options, unit: CustomOneUnit) => Promise<CustomOneUnit>
            /* customOne -> customTwo;  */
            customTwo: (secrets: Secrets, options: Options, unit: CustomOneUnit) => Promise<CustomTwoUnit>
            /* customOne -> customOneArr;  */
            customOneArr: (secrets: Secrets, options: Options, unit: CustomOneUnit) => Promise<CustomOneUnit[]>
            /* customOne -> customOneStream;  */
            customOneStream: (secrets: Secrets, options: Options, unit: CustomOneUnit) => Promise<StreamOf<CustomOneUnit>>
          }
          customTwo: {
            /* customTwo -> customOne;  */
            customOne: (secrets: Secrets, options: Options, unit: CustomTwoUnit) => Promise<CustomOneUnit>
            /* customTwo -> customTwo;  */
            customTwo: (secrets: Secrets, options: Options, unit: CustomTwoUnit) => Promise<CustomTwoUnit>
          }
          customOneArr: {
            /* customOneArr -> customOne;  */
            customOne: (secrets: Secrets, options: Options, unit: CustomOneUnit[]) => Promise<CustomOneUnit>
            /* customOneArr -> customOneArr;  */
            customOneArr: (secrets: Secrets, options: Options, unit: CustomOneUnit[]) => Promise<CustomOneUnit[]>
          }
          customOneStream: {
            /* customOneStream -> customOne;  */
            customOne: (secrets: Secrets, options: Options, unit: StreamOf<CustomOneUnit>) => Promise<CustomOneUnit>
            /* customOneStream -> customOneStream;  */
            customOneStream: (secrets: Secrets, options: Options, unit: StreamOf<CustomOneUnit>) => Promise<StreamOf<CustomOneUnit>>
          }
        }
      }

      export default Connector
  `)
  )
})
