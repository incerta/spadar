// FIXME: remove the schema from SPADAR source
import * as I from '../types'

const optionsSchema: I.ModelOptionsSchema = {
  model: {
    type: 'stringUnion',
    required: true,
    of: [
      'gpt-4',
      'gpt-4-0314',
      'gpt-4-0613',
      'gpt-4-32k',
      'gpt-4-32k-0314',
      'gpt-4-32k-0613',
      'gpt-3.5-turbo',
      'gpt-3.5-turbo-16k',
      'gpt-3.5-turbo-0301',
      'gpt-3.5-turbo-0613',
      'gpt-3.5-turbo-16k-0613',
    ],
  },
  temperature: {
    type: 'number',
    description:
      'The value for the `temperature` parameter should be a floating point number in the range of 0.0 to 1.0. This parameter helps control the randomness of the prediction. A lower temperature value results in less randomness, while a higher temperature will increase the randomness.',
    min: 0,
    max: 1,
  },
  topP: {
    type: 'number',
    description:
      "The value for the `top_p` parameter, often used in 'nucleus sampling', can also be a floating point number between 0.0 and 1.0, both inclusive. It's used to limit the token selection pool to only the most likely tokens. A higher value means more randomness, lower values make the output more deterministic.",
    min: 0,
    max: 1,
  },
  maxTokens: {
    type: 'number',
    description:
      "This integer value specifies the maximum number of tokens in the output. The minimum value is 1. The maximum can depend on the model used: gpt3's models allow generation up to 4096 tokens",
    min: 1,
  },
}

export const chatMessageUnit: I.UnitSchema = {
  id: 'chatMessage',
  role: {
    type: 'stringUnion',
    of: ['system', 'assistant', 'user'],
    required: true,
  },
  payload: 'string',
}

const connectorSchema: I.ConnectorSchema = {
  id: 'spadar-OpenAI-textToText',
  description: 'CLI and CHAT compatible adapter connector for OpenAI LLMs',
  options: optionsSchema,
  keys: [
    {
      key: 'OPENAI_API_KEY',
      description: 'https://www.google.com/search?q=how+to+get+openai',
    },
  ],
  supportedIO: [
    {
      type: 'textToText',
      io: {
        staticInStreamOut: [[[chatMessageUnit], 'string']],
        staticInStaticOut: [['string', 'string']],
      },
    },
  ],
}

export default connectorSchema
