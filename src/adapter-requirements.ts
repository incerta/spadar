import dedent from 'dedent'
import * as I from './types'

export const chatMessageUnit: I.UnitSchema = {
  id: 'chatMessage',
  role: {
    type: 'stringUnion',
    of: ['system', 'assistant', 'user'],
    required: true,
  },
  payload: 'string',
}

const chatRequirements: I.Requirement[] = [
  {
    description: 'Multi message conversation with stream output',
    schema: [
      {
        type: 'textToText',
        io: {
          staticInStreamOut: [
            [
              [chatMessageUnit],
              'string',
              dedent(`
                Return stream of strings as chunks of LLM answer.
                On stream end the chat app will transform whole
                streamed message into "assistant" type ChatMessageUnit
              `),
            ],
          ],
        },
      },
    ],
  },

  {
    description: 'Multi message conversation with static output',
    schema: [
      {
        type: 'textToText',
        io: {
          staticInStaticOut: [
            [
              [chatMessageUnit],
              'string',
              dedent(`
                Expected answer from LLM. The string message will be 
                transformed into "assistant" type ChatMessageUnit
              `),
            ],
          ],
        },
      },
    ],
  },
]

const requirements: I.Feature[] = [
  {
    description: 'Spadar CLI chat',
    requirements: chatRequirements,
  },
]

export default requirements
