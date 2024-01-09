import * as I from '../types'
import { check, unknownX } from '../utils/unit-test'

/* ParseObjectPropSchemaType */

it('ParseObjectPropSchemaType<T, U>: should infer: `U | undefined` on `Record<string, never>` of `T`', () => {
  check<string | undefined>(
    unknownX as I.ParseObjectPropSchemaType<Record<string, never>, string>
  )

  check<string>(
    // @ts-expect-error `unknownX` should infer `string | undefined`
    unknownX as I.ParseObjectPropSchemaType<Record<string, never>, string>
  )
})

it('ParseObjectPropSchemaType<T, U>: should infer: `U` on `{ required: true }` of `T`', () => {
  check<string>(
    unknownX as I.ParseObjectPropSchemaType<{ required: true }, string>
  )
})

it('ParseObjectPropSchemaType<T, U>: should infer: `U` on `{ default: any }` of `T`', () => {
  check<string>(
    unknownX as I.ParseObjectPropSchemaType<{ default: 'CHECK' }, string>
  )

  check<string>(
    unknownX as I.ParseObjectPropSchemaType<
      { default: 'CHECK'; required: false },
      string
    >
  )
})

/* RequiredPropSchemaType */

it("RequiredPropSchemaType<T>: should infer `string` on `'string'` of `T`", () => {
  check<string>(unknownX as I.RequiredPropSchemaType<'string'>)
})

it("RequiredPropSchemaType<T>: should infer `number` on `'number'` of `T`", () => {
  check<number>(unknownX as I.RequiredPropSchemaType<'number'>)
})

it("RequiredPropSchemaType<T>: should infer `boolean` on `'boolean'` of `T`", () => {
  check<boolean>(unknownX as I.RequiredPropSchemaType<'boolean'>)
})

it("RequiredPropSchemaType<T>: should infer `Buffer` on `'Buffer'` of `T`", () => {
  check<Buffer>(unknownX as I.RequiredPropSchemaType<'Buffer'>)
})

/* optional ObjectPropSchemaType */

it("ObjectPropSchemaType<T>: should infer `string | undefined` on `{ type: 'string' }` of `T`", () => {
  check<string | undefined>(
    unknownX as I.ObjectPropSchemaType<{ type: 'string' }>
  )
})

it("ObjectPropSchemaType<T>: should infer `number | undefined` on `{ type: 'number' }` of `T`", () => {
  check<number | undefined>(
    unknownX as I.ObjectPropSchemaType<{ type: 'number' }>
  )
})

it("ObjectPropSchemaType<T>: should infer `boolean | undefined` on `{ type: 'boolean' }` of `T`", () => {
  check<boolean | undefined>(
    unknownX as I.ObjectPropSchemaType<{ type: 'boolean' }>
  )
})

it("ObjectPropSchemaType<T>: should infer `Buffer | undefined` on `{ type: 'Buffer' }` of `T`", () => {
  check<Buffer | undefined>(
    unknownX as I.ObjectPropSchemaType<{ type: 'Buffer' }>
  )
})

it("ObjectPropSchemaType<T>: should infer `string | undefined` on `{ type: 'stringUnion' }` of `T`", () => {
  check<string | undefined>(
    unknownX as I.ObjectPropSchemaType<{ type: 'stringUnion'; of: ['check'] }>
  )
})

/* required ObjectPropSchemaType */

it("ObjectPropSchemaType<T>: should infer `string` on `{ type: 'string', required: true }` of `T`", () => {
  check<string>(
    unknownX as I.ObjectPropSchemaType<{ type: 'string'; required: true }>
  )
})

it("ObjectPropSchemaType<T>: should infer `number` on `{ type: 'number', required: true }` of `T`", () => {
  check<number>(
    unknownX as I.ObjectPropSchemaType<{ type: 'number'; required: true }>
  )
})

it("ObjectPropSchemaType<T>: should infer `boolean` on `{ type: 'boolean', required: true }` of `T`", () => {
  check<boolean>(
    unknownX as I.ObjectPropSchemaType<{ type: 'boolean'; required: true }>
  )
})

it("ObjectPropSchemaType<T>: should infer `Buffer` on `{ type: 'Buffer', required: true }` of `T`", () => {
  check<Buffer>(
    unknownX as I.ObjectPropSchemaType<{ type: 'Buffer'; required: true }>
  )
})

it("ObjectPropSchemaType<T>: should infer `string` on `{ type: 'stringUnion', required: true }` of `T`", () => {
  check<string>(
    unknownX as I.ObjectPropSchemaType<{
      type: 'stringUnion'
      of: ['check']
      required: true
    }>
  )
})

/* PropSchemaType */

it('PropSchemaType<T>: `T` is RequiredPropSchema case', () => {
  check<string>(unknownX as I.PropSchemaType<'string'>)
  // @ts-expect-error `unknownX` should infer `number | undefined`
  check<string>(unknownX as I.PropSchemaType<'number'>)
})

it('PropSchemaType<T>: `T` is ObjectPropSchema case', () => {
  check<string>(
    unknownX as I.PropSchemaType<{ type: 'string'; required: true }>
  )
  check<number>(
    // @ts-expect-error `unknownX` should infer `string | undefined`
    unknownX as I.PropSchemaType<{ type: 'string'; required: true }>
  )
})

/* ObjectSchemaType */

it('ObjectSchemaType<T>: where `T` describes schema which contains RequiredPropSchema and ObjectPropSchema variants', () => {
  check<{ somethingNotSpecified: boolean }>(
    // @ts-expect-error `unknownX` should infer empty record
    unknownX as I.ObjectSchemaType<Record<string, never>>
  )

  check<{
    requiredPropSchemaString: string
    requierdObjectPropSchemaString: string
    defaultObjectPropSchemaString: string
    defaultRequiredObjectPropSchemaString: string
  }>(
    unknownX as I.ObjectSchemaType<{
      requiredPropSchemaString: 'string'
      requierdObjectPropSchemaString: { type: 'string'; required: true }
      defaultObjectPropSchemaString: { type: 'string'; default: 'check' }
      defaultRequiredObjectPropSchemaString: {
        type: 'string'
        default: 'check'
        required: true
      }
      optionalObjectPropSchemaString: { type: 'string' }
    }>
  )
})
