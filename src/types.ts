export type Message = {
  role: 'system' | 'assistant' | 'user'
  content: string
}

/**
 * Each `ObjectPropSchema` extends `PropSchemaBase<T>`
 **/
type PropSchemaBase<T> = {
  description?: string
  required?: boolean

  /**
   * If the property schema has a `default` value, the result
   * property type must be optional in the MEDIATOR
   * PUBLIC API. If there's no value, the MEDIATOR will
   * use the default from the property schema and
   * validate the result UNIT/OPTIONS afterwards.
   **/
  default?: T
}

export type StringPropSchema = PropSchemaBase<string> & {
  type: 'string'
  minLength?: number /* >= */
  maxLength?: number /* <= */
}

export type NumberPropSchema = PropSchemaBase<number> & {
  type: 'number'
  min?: number /* >= */
  max?: number /* <= */
}

export type BooleanPropSchema = PropSchemaBase<boolean> & {
  type: 'boolean'
}

export type BufferPropSchema = PropSchemaBase<Buffer> & {
  type: 'Buffer'

  /* Buffer.length */
  minLength?: number /* >= */
  maxLength?: number /* <= */

  // TODO: allow to add `default: string` value which is should be
  //       absolute path to the file or HTTP link to desired resource
}

/**
 * Specified strings will be transformed into union/literal type
 *
 * @example
 * { type: 'stringUnion', of: ['one', 'two'] }
 *
 * result type: 'one' | 'two'
 *
 * TODO: if `default` value is specified check if its one of
 *       the `of` members on `spadar adapter --generate` cmd
 *       since we didn't manage to make good type for it
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

export type RequiredPropSchema = 'Buffer' | 'string' | 'number' | 'boolean'
export type PropSchema = ObjectPropSchema | RequiredPropSchema

/**
 * The payload is something that we plan
 * to track by ADAPTER name, CONNECTOR id, and MODEL name.
 * In other words, this property should have the greatest
 * impact on the MODEL resources and, subsequently,
 * on the vendor MODEL usage prices.
 **/
export type PayloadUnitSchema = 'string' | 'Buffer'

/**
 * Object IO unit schema includes: `unitId`, `payload`, and meta information.
 *
 * Within the context of the connector API, the specified type will be utilized
 * as an IO literal: `[Transformation][unitId + suffixes][unitId + suffixes]`.
 * For a `chatMessage` value, potential results could include:
 *
 *   - textToText.chatMessageStream.chatMessage
 *   - textToText.chatMessage.string
 *   - textToText.string.chatMessageArr
 *   - textToText.chatMessageArrStream.buffer
 *
 * We will generate an `export type ChatMessageUnit`, so `unitId` should be
 * the unique identifier of the specified schema.
 *
 * Suffixes will be added according to the following rules:
 *
 *   - `Arr`: if the API expects an Array of Units
 *   - `Stream`: if the API expects `StreamOf<ChatMessageUnit>`
 *   - `ArrStream`: if the API expects `StreamOf<ChatMessageUnit[]>`
 **/
export type ObjectUnitSchema = {
  unitId: StringUnionPropSchema & { required: true; of: [string] }
  payload: PayloadUnitSchema
  [key: string]: PropSchema
}

export type UnitSchema = ObjectUnitSchema | PayloadUnitSchema

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
 * TODO: `ObjectPropSchema` property values should be used to annotate ADAPTER typings
 **/
export type ModelOptionsSchema = {
  model: StringUnionPropSchema & { required: true; of: string[] }
  [key: string]: PropSchema
}

export type Transformation =
  | 'textToText'
  | 'textToImage'
  | 'textToAudio'
  | 'textToVideo'
  | 'textToCode'
  | 'codeToText'
  | 'codeToCode'
  | 'imageToText'
  | 'imageToImage'
  | 'imageToAudio'
  | 'imageToVideo'
  | 'audioToText'
  | 'audioToImage'
  | 'audioToAudio'
  | 'audioToVideo'
  | 'videoToText'
  | 'videoToImage'
  | 'videoToAudio'
  | 'videoToVideo'

export type OrderSchema = [UnitSchema]

// TODO: consider renaming to `OrderOrUnitSchema` or something else
export type IOUnitSchema = UnitSchema | OrderSchema

/**
 * Result `ConnectorAPI` function type
 *
 * @example ['string', 'Buffer']
 *
 * result function type:
 *   (keys: Keys, options: Options, unit: string) => string
 *
 * @example [
 *   {
 *     unitId: { type: 'stringUnion', required: true, of: ['oneShotMessage'] },
 *     payload: 'string'
 *   },
 *   'string'
 * ]
 *
 * result function type:
 *   (keys: Keys, options: Options, unit: { unitId: 'oneShotMessage', payload: string }) => string
 *
 **/
export type IOSchema = [inputUnit: IOUnitSchema, outputUnit: IOUnitSchema]

export type TransferMethod =
  | 'streamInStaticOut'
  | 'streamInStreamOut'
  | 'staticInStaticOut'
  | 'staticInStreamOut'

/**
 * IO types that will be transformed into the API
 *
 * @example
 * {
 *   type: 'textToText',
 *   io: {
 *     staticInStaticOut: [['string', 'string']],
 *     streamInStreamOut: [['Buffer', 'string']]
 *   }
 * }
 *
 * Will be transformed into the API [Transformation][inputDescriptor][outputDescriptor]:
 *   - signature.textToText.string.string
 *   - signature.textToText.bufferStream.stringStream
 **/
export type TransformationIOSchema = {
  type: Transformation
  // TODO: rename `io` to `transferMethod`
  //       there is too much IO term in the code
  io: { [k in TransferMethod]?: IOSchema[] }
}

export type ConnectorKeysSchema = Array<{ key: string; description?: string }>

/**
 * Schema for `ConnectorAPI` narrow type/structure generation
 **/
export type ConnectorSchema = {
  /**
   * The `id` is used by `spadar adapter --generate` command
   * for generation of the following files in the ADAPTER module:
   *
   * - `src/connectors/${toKebabCase(connectorId)}.typings.ts/`
   * - `src/connectors/${toKebabCase(connectorId)}.signature.ts/`
   * - `src/connectors/${toKebabCase(connectorId)}.ts`
   **/
  id: string

  /* Explain specifics of the Connector */
  description?: string

  /**
   * @example
   *
   * ```js
   * [{ key: 'SOME_VENDOR_API_KEY', description: 'One might get the key there and there' }]
   * ```
   **/
  keys: ConnectorKeysSchema

  /**
   * Values will be available for all functional calls and used as CLI model parameters
   * Only one property is required in the `options` schema is `model` list of literals
   **/
  options: ModelOptionsSchema

  /**
   * Types of IO following CONNECTOR going to support
   *
   * TODO: rename to `transformations`
   **/
  supportedIO: TransformationIOSchema[]

  // TODO: add `modelNameToPayloadLimit: Record<string, number>` property
  //       as upper bound of payload size for a singular API function call
  //       we support `max/max` on `ObjectSchemaProp` level but it is not
  //       enough when we taking into the account ORDER as function input type
  //       (array of units specified by user). Since connector schema is just
  //       a bunch of models that share same `options` and `keys` schema it
  //       would be ok to have the limits definition on this level.
}

/* Broadcast streams using the following format */
export type StreamOf<T> = {
  stop?: () => void
  pause?: () => void
  resume?: () => void

  // TODO: consider renaming to `asyncIterable`
  /* Stream that can be processed by `for await (const token of stream)` syntax */
  stream: AsyncIterable<T>
}

/**
 * The function on IO end of the used ADAPTER API
 **/
export type AdapterFunction = ((
  keys: Record<string, string>,
  options: Record<string, unknown>,
  unit: unknown | unknown[]
) => Promise<unknown>) & {
  isSpadarSignature?: boolean
}

/**
 * The function on IO end of the MEDIATOR API
 **/
export type MediatorFunction<
  Options = Record<string, unknown>,
  InputUnit = unknown,
  OutputUnit = unknown,
> = (options: Options, inputUnit: InputUnit) => Promise<OutputUnit>

/**
 * Result adapter module index object type
 **/
export type Adapter = {
  name: string
  version: string
  // TODO: rename to `connectorSchemas`
  schema: ConnectorSchema[]
  connectors: {
    [connectorId: string]:
      | undefined
      | Partial<
          Record<
            Transformation,
            {
              [inputAccessor: string]:
                | undefined
                | {
                    [outputAccessor: string]: undefined | AdapterFunction
                  }
            }
          >
        >
  }
}

/* Utility generics */

export type RequiredPropSchemaType<T extends RequiredPropSchema> =
  T extends 'string'
    ? string
    : T extends 'number'
      ? number
      : T extends 'boolean'
        ? boolean
        : T extends 'Buffer'
          ? Buffer
          : never

export type ParseObjectPropSchemaType<
  T extends { required?: boolean; default?: unknown },
  U,
> = T extends { required: true }
  ? U
  : T extends { default: infer V }
    ? V extends undefined
      ? undefined | U
      : U
    : undefined | U

export type ObjectPropSchemaType<T extends ObjectPropSchema> = T extends {
  type: 'string'
}
  ? ParseObjectPropSchemaType<T, string>
  : T extends { type: 'number' }
    ? ParseObjectPropSchemaType<T, number>
    : T extends { type: 'boolean' }
      ? ParseObjectPropSchemaType<T, boolean>
      : T extends { type: 'Buffer' }
        ? ParseObjectPropSchemaType<T, Buffer>
        : T extends { type: 'stringUnion' }
          ? ParseObjectPropSchemaType<T, string>
          : never

export type PropSchemaType<T extends PropSchema> = T extends RequiredPropSchema
  ? RequiredPropSchemaType<T>
  : T extends ObjectPropSchema
    ? ObjectPropSchemaType<T>
    : never

export type ObjectSchemaType<T extends Record<string, PropSchema>> = {
  [k in keyof T]: PropSchemaType<T[k]>
}
