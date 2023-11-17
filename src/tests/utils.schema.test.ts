import dedent from 'dedent'
import config from '../config'
import * as schema from '../utils/schema'
import * as I from '../types'

describe('Utilities for schema -> typescript type transformation', () => {
  it('propertyToType', () => {
    expect(schema.propertyToType('string')).toBe('string')
    expect(schema.propertyToType('number')).toBe('number')
    expect(schema.propertyToType('boolean')).toBe('boolean')
    expect(schema.propertyToType('Buffer')).toBe('Buffer')
    expect(schema.propertyToType({ type: 'string' })).toBe('string')
    expect(schema.propertyToType({ type: 'number' })).toBe('number')
    expect(schema.propertyToType({ type: 'boolean' })).toBe('boolean')
    expect(schema.propertyToType({ type: 'Buffer' })).toBe('Buffer')
    expect(schema.propertyToType({ type: 'literal', of: ['literal'] })).toBe(
      "'literal'"
    )
    expect(
      schema.propertyToType({ type: 'literal', of: ['literal1', 'literal2'] })
    ).toBe("'literal1' | 'literal2'")
  })

  describe('generateIOPrimitive', () => {
    it('staticInStaticOut', () => {
      const transferMethod: I.TransferMethod = 'staticInStaticOut'

      /* Primitive unit input */
      expect(
        schema.generateIOPrimitive(transferMethod, 'input', 'string')
      ).toEqual({
        key: 'string',
        ioUnitTypings: 'string',
        unitTypings: 'string',
      })

      /* Primitive unit output */
      expect(
        schema.generateIOPrimitive(transferMethod, 'output', 'string')
      ).toEqual({
        key: 'string',
        ioUnitTypings: 'string',
        unitTypings: 'string',
      })

      /* Primitive unit array schema input */
      expect(
        schema.generateIOPrimitive(transferMethod, 'input', ['string'])
      ).toEqual({
        key: 'stringArr',
        ioUnitTypings: 'string[]',
        unitTypings: 'string',
      })

      /* Primitive unit array schema output */
      expect(
        schema.generateIOPrimitive(transferMethod, 'output', ['string'])
      ).toEqual({
        key: 'stringArr',
        ioUnitTypings: 'string[]',
        unitTypings: 'string',
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
        unitId: 'CustomUnit',
        unitTypings: `{\n  id: 'custom'\n  payload: string\n}`,
      })

      /* Custom unit schema output */
      expect(
        schema.generateIOPrimitive(transferMethod, 'output', customUnit)
      ).toEqual({
        key: 'custom',
        ioUnitTypings: 'CustomUnit',
        unitId: 'CustomUnit',
        unitTypings: `{\n  id: 'custom'\n  payload: string\n}`,
      })

      /* Custom unit array schema input */
      expect(
        schema.generateIOPrimitive(transferMethod, 'input', [customUnit])
      ).toEqual({
        key: 'customArr',
        ioUnitTypings: 'CustomUnit[]',
        unitId: 'CustomUnit',
        unitTypings: `{\n  id: 'custom'\n  payload: string\n}`,
      })

      /* Custom unit array schema output */
      expect(
        schema.generateIOPrimitive(transferMethod, 'output', customUnit)
      ).toEqual({
        key: 'custom',
        ioUnitTypings: 'CustomUnit',
        unitId: 'CustomUnit',
        unitTypings: `{\n  id: 'custom'\n  payload: string\n}`,
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
        unitTypings: 'string',
      })

      /* Primitive unit output */
      expect(
        schema.generateIOPrimitive(transferMethod, 'output', 'string')
      ).toEqual({
        key: 'stringStream',
        ioUnitTypings: 'StreamOf<string>',
        unitTypings: 'string',
      })

      /* Primitive unit array schema input */
      expect(
        schema.generateIOPrimitive(transferMethod, 'input', ['string'])
      ).toEqual({
        key: 'stringArr',
        ioUnitTypings: 'string[]',
        unitTypings: 'string',
      })

      /* Primitive unit array schema output */
      expect(
        schema.generateIOPrimitive(transferMethod, 'output', ['string'])
      ).toEqual({
        key: 'stringArrStream',
        ioUnitTypings: 'StreamOf<string[]>',
        unitTypings: 'string',
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
        unitId: 'CustomUnit',
        unitTypings: `{\n  id: 'custom'\n  payload: string\n}`,
      })

      /* Custom unit schema output */
      expect(
        schema.generateIOPrimitive(transferMethod, 'output', customUnit)
      ).toEqual({
        key: 'customStream',
        ioUnitTypings: 'StreamOf<CustomUnit>',
        unitId: 'CustomUnit',
        unitTypings: `{\n  id: 'custom'\n  payload: string\n}`,
      })

      /* Custom unit array schema input */
      expect(
        schema.generateIOPrimitive(transferMethod, 'input', [customUnit])
      ).toEqual({
        key: 'customArr',
        ioUnitTypings: 'CustomUnit[]',
        unitId: 'CustomUnit',
        unitTypings: `{\n  id: 'custom'\n  payload: string\n}`,
      })

      /* Custom unit array schema output */
      expect(
        schema.generateIOPrimitive(transferMethod, 'output', customUnit)
      ).toEqual({
        key: 'customStream',
        ioUnitTypings: 'StreamOf<CustomUnit>',
        unitId: 'CustomUnit',
        unitTypings: `{\n  id: 'custom'\n  payload: string\n}`,
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
        unitTypings: 'string',
      })

      /* Primitive unit output */
      expect(
        schema.generateIOPrimitive(transferMethod, 'output', 'string')
      ).toEqual({
        key: 'string',
        ioUnitTypings: 'string',
        unitTypings: 'string',
      })

      /* Primitive unit array schema input */
      expect(
        schema.generateIOPrimitive(transferMethod, 'input', ['string'])
      ).toEqual({
        key: 'stringArrStream',
        ioUnitTypings: 'StreamOf<string[]>',
        unitTypings: 'string',
      })

      /* Primitive unit array schema output */
      expect(
        schema.generateIOPrimitive(transferMethod, 'output', ['string'])
      ).toEqual({
        key: 'stringArr',
        ioUnitTypings: 'string[]',
        unitTypings: 'string',
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
        unitId: 'CustomUnit',
        unitTypings: `{\n  id: 'custom'\n  payload: string\n}`,
      })

      /* Custom unit schema output */
      expect(
        schema.generateIOPrimitive(transferMethod, 'output', customUnit)
      ).toEqual({
        key: 'custom',
        ioUnitTypings: 'CustomUnit',
        unitId: 'CustomUnit',
        unitTypings: `{\n  id: 'custom'\n  payload: string\n}`,
      })

      /* Custom unit array schema input */
      expect(
        schema.generateIOPrimitive(transferMethod, 'input', [customUnit])
      ).toEqual({
        key: 'customArrStream',
        ioUnitTypings: 'StreamOf<CustomUnit[]>',
        unitId: 'CustomUnit',
        unitTypings: `{\n  id: 'custom'\n  payload: string\n}`,
      })

      /* Custom unit array schema output */
      expect(
        schema.generateIOPrimitive(transferMethod, 'output', customUnit)
      ).toEqual({
        key: 'custom',
        ioUnitTypings: 'CustomUnit',
        unitId: 'CustomUnit',
        unitTypings: `{\n  id: 'custom'\n  payload: string\n}`,
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
        unitTypings: 'string',
      })

      /* Primitive unit output */
      expect(
        schema.generateIOPrimitive(transferMethod, 'output', 'string')
      ).toEqual({
        key: 'stringStream',
        ioUnitTypings: 'StreamOf<string>',
        unitTypings: 'string',
      })

      /* Primitive unit array schema input */
      expect(
        schema.generateIOPrimitive(transferMethod, 'input', ['string'])
      ).toEqual({
        key: 'stringArrStream',
        ioUnitTypings: 'StreamOf<string[]>',
        unitTypings: 'string',
      })

      /* Primitive unit array schema output */
      expect(
        schema.generateIOPrimitive(transferMethod, 'output', ['string'])
      ).toEqual({
        key: 'stringArrStream',
        ioUnitTypings: 'StreamOf<string[]>',
        unitTypings: 'string',
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
        unitId: 'CustomUnit',
        unitTypings: `{\n  id: 'custom'\n  payload: string\n}`,
      })

      /* Custom unit schema output */
      expect(
        schema.generateIOPrimitive(transferMethod, 'output', customUnit)
      ).toEqual({
        key: 'customStream',
        ioUnitTypings: 'StreamOf<CustomUnit>',
        unitId: 'CustomUnit',
        unitTypings: `{\n  id: 'custom'\n  payload: string\n}`,
      })

      /* Custom unit array schema input */
      expect(
        schema.generateIOPrimitive(transferMethod, 'input', [customUnit])
      ).toEqual({
        key: 'customArrStream',
        ioUnitTypings: 'StreamOf<CustomUnit[]>',
        unitId: 'CustomUnit',
        unitTypings: `{\n  id: 'custom'\n  payload: string\n}`,
      })

      /* Custom unit array schema output */
      expect(
        schema.generateIOPrimitive(transferMethod, 'output', customUnit)
      ).toEqual({
        key: 'customStream',
        ioUnitTypings: 'StreamOf<CustomUnit>',
        unitId: 'CustomUnit',
        unitTypings: `{\n  id: 'custom'\n  payload: string\n}`,
      })
    })
  })

  it('unitSchemaToType', () => {
    const expected = schema.unitSchemaToType({
      id: 'unitType',
      payload: 'string',
      bufferProperty: 'Buffer',
      stringProperty: 'string',
      booleanProperty: 'boolean',
      numberProperty: 'number',
    })

    expect(expected).toBe(
      dedent(`{
      id: 'unitType'
      payload: string
      bufferProperty: Buffer
      stringProperty: string
      booleanProperty: boolean
      numberProperty: number
    }`)
    )
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
  })

  describe('generateAPIFromSchema', () => {
    it.only('PayloadUnitSchema: string | buffer', () => {
      const [api] = schema.generateAPITypingsFromSchema([
        {
          id: 'testAdapter',
          description: 'Test adapter',
          options: {
            // TODO: use just `['gpt-4', 'gpt-3']` when `Array<string>`
            //       type is implemented as `RequiredPropertySchema`
            model: { type: 'literal', of: ['gpt-4', 'gpt-3'], required: true },
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
              string: (secrets: Secrets, options: Options, unit: string) => Promise<string>
              stringStream: (secrets: Secrets, options: Options, unit: string) => Promise<StreamOf<string>>
            }
            stringStream: {
              string: (secrets: Secrets, options: Options, unit: StreamOf<string>) => Promise<string>
              stringStream: (secrets: Secrets, options: Options, unit: StreamOf<string>) => Promise<StreamOf<string>>
            }
          }
        }
        
        export default AdapterAPI`)

      //      expect(api.adapterTypings).toBe(expected)
    })
  })
})
