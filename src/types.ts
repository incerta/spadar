export type ModelId = string
export type AdapterId = string

/**
 * Each `ObjectPropSchema` extends `PropSchemaBase<T>`
 **/
type PropSchemaBase<T> = {
  description?: string
  required?: boolean
  default?: T
}

/**
 * @example { type: 'string' }
 *
 * result type: string
 **/
export type StringPropSchema = PropSchemaBase<string> & {
  type: 'string'
  minLength?: number /* >= */
  maxLength?: number /* <= */
}

/**
 * @example { type: 'number' }
 *
 * result type: number
 **/
export type NumberPropSchema = PropSchemaBase<number> & {
  type: 'number'
  min?: number /* >= */
  max?: number /* <= */
}

/**
 * @example { type: 'boolean' }
 *
 * result type: boolean
 **/
export type BooleanPropSchema = PropSchemaBase<boolean> & {
  type: 'boolean'
}

/**
 * @example { type: 'Buffer' }
 *
 * result type: Buffer
 **/
export type BufferPropSchema = PropSchemaBase<Buffer> & {
  type: 'Buffer'
  /* Buffer.length */
  minLength?: number /* >= */
  maxLength?: number /* <= */
}

/**
 * Specified strings will be transformed into union/literal type
 *
 * @example
 * { type: 'literal', of: ['one', 'two'] }
 *
 * result type: 'one' | 'two'
 **/
export type StringUnionPropSchema = PropSchemaBase<string> & {
  type: 'stringUnion'
  of: Array<string>
}

export type ObjectPropSchema =
  | StringPropSchema
  | NumberPropSchema
  | BooleanPropSchema
  | BufferPropSchema
  | StringUnionPropSchema

export type RequiredPayloadPropSchema =
  | 'Buffer'
  | 'string'
  | 'number'
  | 'boolean'

// TODO: rename to `OptionalLiteralPropertySchema`
export type OptionalPayloadPropSchema =
  | '?Buffer'
  | '?string'
  | '?number'
  | '?boolean'

// TODO: Array<string> as required `StringUnionPropertySchema` */
//       [string] as required `string` literal required `StringUnionPropertySchema`
//       with only singular `of` memeber

export type PropSchema = ObjectPropSchema | RequiredPayloadPropSchema

// TODO: We could extend payload type
//       on the public API to use URL's and file
//       path as common payloads that can be reduced
//       to `Buffer` or `string` by spadar API
//       so adapter public API will receive expected type

/**
 * Custom IO Unit schema `id`, `payload` + meta information
 *
 * The `id` property will be used in the ADAPTER API structure
 *
 * In the context of adapter API the given type will be used
 * as IO literal `[Transformation][id + suffixes][id + suffixes]`
 * for `chatMessage` value result could be:
 *
 *   - adapter.textToText.chatMessageStream.chatMessage
 *   - adapter.textToText.chatMessage.string
 *   - adapter.textToText.string.chatMessageArr
 *   - adapter.textToText.chatMessageArrStream.buffer
 *
 * We will generate `export type ChatMessageUnit` so `id` should be
 * the unique identifier of the specified schema
 *
 * The suffix will be added by the following rules:
 *
 *   - `Arr`: if API expects the Array of Units
 *   - `Stream`: if API expects `StreamOf<ChatMessageUnit>`
 *   - `ArrStream`: if API expects `StreamOf<ChatMessageUnit[]>`
 **/
export type ObjectUnitSchema = {
  id: string
  payload: 'Buffer' | 'string'
  [key: string]: PropSchema | string
}

export type PayloadUnitSchema = 'string' | 'Buffer'
export type UnitSchema = ObjectUnitSchema | PayloadUnitSchema

// TODO: consider OrderSchema entity existence as representation of
//       given list of UNITs wrapped by Object with meta information

/**
 * Options schema for desired set of models
 *
 * @example
 * {
 *   model: {
 *     type: 'union',
 *     of: ['gpt-4', 'gpt-3.5-turbo'],
 *     required: true
 *     description: 'Desired LLM'
 *   },
 *   maxTokens: {
 *     type: 'number',
 *     min: 1,
 *     max: 2000,
 *     default: 2000,
 *   },
 *   temperature: number
 * }
 *
 * Generated type:
 * {
 *   model: 'gpt-4' | 'gpt-3.5-turbo'
 *   temperature: number
 *   maxTokens?: number
 * }
 *
 * Possible optional (objects) properties of the options schema
 * will be used as generated comment annotations for result type properties
 *
 * Values of `min`, `max`, `minLength`, `maxLength` will be used
 * for runtime type check handled by SPADAR MODULE including `StreamOf<T>`
 * streams chunks.
 **/
export type ModelOptionsSchema = {
  model: StringUnionPropSchema & { required: true; of: string[] }
  [key: string]: PropSchema
}

// TODO: Support Array<UnitSchema | [UnitSchema]>
//       as syntax for functional overloads generation
//       for each given in/out pare

export type Transformation =
  | 'textToText'
  | 'textToImage'
  | 'textToAudio'
  | 'textToVideo'
  | 'imageToText'
  | 'imageToImage'
  | 'imageToAudio'
  | 'imageToVideo'
  | 'videoToText'
  | 'videoToImage'
  | 'videoToAudio'
  | 'videoToVideo'

/* Singular UNIT or ORDER of units (Array<Unit>) */
export type IOUnitSchema = UnitSchema | [UnitSchema]

/**
 * Result `AdapterAPI` function type
 *
 * @example ['string', 'string']
 *
 * result function type:
 *   (secrets: Secrets, options: Options, unit: string) => string
 **/
export type IOSchema = [inputUnit: IOUnitSchema, outputUnit: IOUnitSchema]

export type TransferMethod =
  | 'streamInStaticOut'
  | 'streamInStreamOut'
  | 'staticInStaticOut'
  | 'staticInStreamOut'

/**
 * IO types will be transformed into the API type
 *
 * @example
 * {
 *   type: 'textToText',
 *   io: {
 *     staticInStaticOut: [{ in: 'number', out: 'string' }],
 *     streamInStreamOut: [{ in: 'number', out: 'string' }]
 *   }
 * }
 *
 * Will be transformed into the API [Transformation][inUnitType][outUnitType]:
 *   - adapter.textToText.number.string
 *   - adapter.textToText.numberStream.stringStream
 **/
export type TransformationIOSchema = {
  type: Transformation
  io: { [k in TransferMethod]?: IOSchema[] }
}

export type AdapterSecrectsSchema = Array<{ key: string; howToGet?: string }>

/**
 * Schema for `AdapterAPI` narrow type/structure generation
 **/
export type AdapterSchema = {
  /**
   * The `id` is used by `spadar adapter --generateAPI` command
   * for generation of the following files in the ADAPTER MODULE:
   *   - `src/types/adapters/${toKebabCase(adapterId)}/index.ts`
   *   - `src/types/adapters/${toKebabCase(adapterId)}/units/${toKebabCase(unitId)}`
   *   - `src/adapters/${toKebabCase(adapterId)}/debug-adapter.ts`
   *   - `src/adapters/${toKebabCase(adapterId)}/index.ts`
   **/
  id: string

  /* Explain specifics of the Adapter */
  description: string

  /* Secret key like "OPENAI_API_KEY" and how to get hint */
  secrets: AdapterSecrectsSchema

  /**
   * Values will be available for all functional calls and used as CLI model parameters
   * Only one property is required in the `options` schema is `model` list of literals
   **/
  options: ModelOptionsSchema

  /**
   * Types of IO of the choosen ADAPTER that will be
   * eventually transformed into type that extends AdapterAPI
   * but with more narrow typings then AdapterAPI
   **/
  supportedIO: TransformationIOSchema[]
}

/* Broadcast streams using the following format */
export type StreamOf<T> = {
  stop?: () => void
  pause?: () => void
  resume?: () => void

  /* Stream that can be processed by `for await (const token of stream)` syntax */
  stream: AsyncIterable<T>
}

/**
 * The generated API will extend the following format
 **/
export type AdapterAPI = Record<
  Transformation,
  {
    [inputType: string]: {
      [outputType: string]: (options: unknown, unit: unknown) => unknown
    }
  }
>
