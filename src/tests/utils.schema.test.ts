import dedent from 'dedent'
import config from '../config'
import * as schema from '../utils/schema'
import * as I from '../types'

it('propertyToType: ', () => {
  expect(schema.propertyToType('string')).toBe('string')
  expect(schema.propertyToType('number')).toBe('number')
  expect(schema.propertyToType('boolean')).toBe('boolean')
  expect(schema.propertyToType('Buffer')).toBe('Buffer')
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

describe('Utilities for schema -> typescript type transformation', () => {
  describe('generateIOPrimitive', () => {
    it('staticInStaticOut', () => {
      const transferMethod: I.TransferMethod = 'staticInStaticOut'

      /* Primitive unit input */
      expect(
        schema.generateIOPrimitive(transferMethod, 'input', 'string')
      ).toEqual({
        key: 'string',
        ioUnitTypings: 'string',
      })

      /* Primitive unit output */
      expect(
        schema.generateIOPrimitive(transferMethod, 'output', 'string')
      ).toEqual({
        key: 'string',
        ioUnitTypings: 'string',
      })

      /* Primitive unit array schema input */
      expect(
        schema.generateIOPrimitive(transferMethod, 'input', ['string'])
      ).toEqual({
        key: 'stringArr',
        ioUnitTypings: 'string[]',
      })

      /* Primitive unit array schema output */
      expect(
        schema.generateIOPrimitive(transferMethod, 'output', ['string'])
      ).toEqual({
        key: 'stringArr',
        ioUnitTypings: 'string[]',
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
        ioUnitTypings: 'CustomUnit',
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
        ioUnitTypings: 'CustomUnit',
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
        ioUnitTypings: 'CustomUnit[]',
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
        ioUnitTypings: 'CustomUnit',
        objectUnit: {
          id: 'CustomUnit',
          typings: expect.any(String),
        },
      })
    })

    it('staticInStreamOut', () => {
      const transferMethod: I.TransferMethod = 'staticInStreamOut'

      /* Primitive unit input */
      expect(
        schema.generateIOPrimitive(transferMethod, 'input', 'string')
      ).toEqual({
        key: 'string',
        ioUnitTypings: 'string',
      })

      /* Primitive unit output */
      expect(
        schema.generateIOPrimitive(transferMethod, 'output', 'string')
      ).toEqual({
        key: 'stringStream',
        ioUnitTypings: 'StreamOf<string>',
      })

      /* Primitive unit array schema input */
      expect(
        schema.generateIOPrimitive(transferMethod, 'input', ['string'])
      ).toEqual({
        key: 'stringArr',
        ioUnitTypings: 'string[]',
      })

      /* Primitive unit array schema output */
      expect(
        schema.generateIOPrimitive(transferMethod, 'output', ['string'])
      ).toEqual({
        key: 'stringArrStream',
        ioUnitTypings: 'StreamOf<string[]>',
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
        ioUnitTypings: 'CustomUnit',
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
        ioUnitTypings: 'StreamOf<CustomUnit>',
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
        ioUnitTypings: 'CustomUnit[]',
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
        ioUnitTypings: 'StreamOf<CustomUnit>',
        objectUnit: {
          id: 'CustomUnit',
          typings: expect.any(String),
        },
      })
    })

    it('streamInStaticOut', () => {
      const transferMethod: I.TransferMethod = 'streamInStaticOut'

      /* Primitive unit input */
      expect(
        schema.generateIOPrimitive(transferMethod, 'input', 'string')
      ).toEqual({
        key: 'stringStream',
        ioUnitTypings: 'StreamOf<string>',
      })

      /* Primitive unit output */
      expect(
        schema.generateIOPrimitive(transferMethod, 'output', 'string')
      ).toEqual({
        key: 'string',
        ioUnitTypings: 'string',
      })

      /* Primitive unit array schema input */
      expect(
        schema.generateIOPrimitive(transferMethod, 'input', ['string'])
      ).toEqual({
        key: 'stringArrStream',
        ioUnitTypings: 'StreamOf<string[]>',
      })

      /* Primitive unit array schema output */
      expect(
        schema.generateIOPrimitive(transferMethod, 'output', ['string'])
      ).toEqual({
        key: 'stringArr',
        ioUnitTypings: 'string[]',
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
        ioUnitTypings: 'StreamOf<CustomUnit>',
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
        ioUnitTypings: 'CustomUnit',
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
        ioUnitTypings: 'StreamOf<CustomUnit[]>',
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
        ioUnitTypings: 'CustomUnit',
        objectUnit: {
          id: 'CustomUnit',
          typings: expect.any(String),
        },
      })
    })

    it('streamInStreamOut', () => {
      const transferMethod: I.TransferMethod = 'streamInStreamOut'

      /* Primitive unit input */
      expect(
        schema.generateIOPrimitive(transferMethod, 'input', 'string')
      ).toEqual({
        key: 'stringStream',
        ioUnitTypings: 'StreamOf<string>',
      })

      /* Primitive unit output */
      expect(
        schema.generateIOPrimitive(transferMethod, 'output', 'string')
      ).toEqual({
        key: 'stringStream',
        ioUnitTypings: 'StreamOf<string>',
      })

      /* Primitive unit array schema input */
      expect(
        schema.generateIOPrimitive(transferMethod, 'input', ['string'])
      ).toEqual({
        key: 'stringArrStream',
        ioUnitTypings: 'StreamOf<string[]>',
      })

      /* Primitive unit array schema output */
      expect(
        schema.generateIOPrimitive(transferMethod, 'output', ['string'])
      ).toEqual({
        key: 'stringArrStream',
        ioUnitTypings: 'StreamOf<string[]>',
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
        ioUnitTypings: 'StreamOf<CustomUnit>',
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
        ioUnitTypings: 'StreamOf<CustomUnit>',
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
        ioUnitTypings: 'StreamOf<CustomUnit[]>',
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
        ioUnitTypings: 'StreamOf<CustomUnit>',
        objectUnit: {
          id: 'CustomUnit',
          typings: expect.any(String),
        },
      })
    })
  }) /* END: generateIOPrimitive */

  it('unitSchemaToType', () => {
    const customUnit: I.ObjectUnitSchema = {
      /* `id: 'custom'` -> CustomUnit */
      id: 'custom',
      /* `payload: string` */
      payload: 'string',
      /* `stringPropertySchemaRequired: string` */
      stringPropertySchemaRequired: {
        type: 'string',
        required: true,
      },
      /* `stringPropertySchemaOptional?: string` */
      stringPropertySchemaOptional: {
        type: 'string',
      },
      /* `numberPropertySchemaRequired: number` */
      numberPropertySchemaRequired: {
        type: 'number',
        required: true,
      },
      /* `numberPropertySchemaOptional?: number` */
      numberPropertySchemaOptional: {
        type: 'number',
      },
      /* `booleanPropertyRequired: boolean` */
      booleanPropertyRequired: {
        type: 'boolean',
        required: true,
      },
      /* `booleanPropertyOptional?: boolean` */
      booleanPropertyOptional: {
        type: 'boolean',
      },
      /* `bufferPropertySchemaRequired: Buffer` */
      bufferPropertySchemaRequired: {
        type: 'Buffer',
        required: true,
      },
      /* `bufferPropertySchemaOptional?: Buffer` */
      bufferPropertySchemaOptional: {
        type: 'Buffer',
      },
      /* `requiredBuffer: Buffer` */
      requiredBuffer: 'Buffer',
      /* `requiredString: string` */
      requiredString: 'string',
      /* `requiredNumber: number` */
      requiredNumber: 'number',
      /* `requiredBoolean: boolean` */
      requiredBoolean: 'boolean',
    }

    const expectedTypings = dedent(`
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
      
      export default CustomUnit`)

    const result = schema.unitSchemaToType(customUnit)

    expect(result).toBe(expectedTypings)
  })

  it('getIOPropertyKey', () => {
    expect(schema.getIOPropertyKey('string')).toBe('string')
    expect(schema.getIOPropertyKey('Buffer')).toBe('buffer')

    expect(
      schema.getIOPropertyKey({
        id: 'unitType',
        payload: 'string',
      })
    ).toBe('unitType')

    expect(
      schema.getIOPropertyKey([
        {
          id: 'unitType',
          payload: 'string',
        },
      ])
    ).toBe('unitType')
  }) /* END: getIOPropertyKey */

  describe('generateAPIFromSchema', () => {
    it('PayloadUnitSchema: string | Buffer', () => {
      const [api] = schema.generateAPITypingsFromSchema([
        {
          id: 'testAdapter',
          description: 'Test adapter',
          options: {
            // TODO: use just `['gpt-4', 'gpt-3']` when `Array<string>`
            //       type is implemented as `RequiredPropertySchema`
            model: {
              type: 'stringUnion',
              of: ['gpt-4', 'gpt-3'],
              required: true,
            },
          },
          secrets: [{ key: 'OPENAI_API_KEY' }],
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
        },
      ])

      const expected = dedent(`
        /**
         * The file is generated by SPADAR CLI v. ${config.version}
         * DO NOT EDIT IT MANUALLY because it could be automatically rewritten
         **/

        export type Secrets = {
          OPENAI_API_KEY: string
        }

        export type Options = {
          model: 'gpt-4' | 'gpt-3'
        }

        export type AdapterAPI = {
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
        
        export default AdapterAPI`)

      expect(api.adapterTypings).toBe(expected)
    }) /* END: PayloadUnitSchema: string | buffer */

    it('PayloadUnitSchema: ObjectUnitSchema', () => {
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

      const adapterId = 'testAdapter'

      const [api] = schema.generateAPITypingsFromSchema([
        {
          id: adapterId,
          description: 'Test adapter',
          options: {
            model: {
              type: 'stringUnion',
              of: ['gpt-4', 'gpt-3'],
              required: true,
            },
          },
          secrets: [{ key: 'OPENAI_API_KEY' }],
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
        },
      ])

      const expectedAdapterTypings = dedent(`
        /**
         * The file is generated by SPADAR CLI v. 0.1.0
         * DO NOT EDIT IT MANUALLY because it could be automatically rewritten
         **/

        import { CustomOneUnit, CustomTwoUnit } from './units'

        export type Secrets = {
          OPENAI_API_KEY: string
        }

        export type Options = {
          model: 'gpt-4' | 'gpt-3'
        }

        export type AdapterAPI = {
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

        export default AdapterAPI
      `)

      expect(api.adapterTypings).toBe(expectedAdapterTypings)

      const [unitOne, unitTwo] = api.units

      expect(unitOne.id).toBe('CustomOneUnit')
      expect(unitOne.adapterId).toBe(adapterId)
      expect(unitOne.typings).toBe(
        dedent(`
        export type CustomOneUnit = {
          id: 'customOne'
          payload: string
        }
        
        export default CustomOneUnit
       `)
      )

      expect(unitTwo.id).toBe('CustomTwoUnit')
      expect(unitTwo.adapterId).toBe(adapterId)
      expect(unitTwo.typings).toBe(
        dedent(`
        export type CustomTwoUnit = {
          id: 'customTwo'
          payload: Buffer
        }
        
        export default CustomTwoUnit
       `)
      )
    })
  }) /* END: generateAPIFromSchema */
}) /* END: Utilities for schema -> typescript type transformation */
