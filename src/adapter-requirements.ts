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
    id: 'Multi message conversation with stream output',
    description: dedent(`
      Return stream of strings as chunks of LLM answer.
      On stream end the chat app will transform whole
      streamed message into "assistant" type ChatMessageUnit
    `),
    schema: {
      type: 'textToText',
      io: {
        staticInStreamOut: [[[chatMessageUnit], 'string']],
      },
    },
  },

  {
    id: 'Multi message conversation with static output',
    description: dedent(`
      Expected answer from LLM. The string message will be 
      transformed into "assistant" type ChatMessageUnit
    `),
    schema: {
      type: 'textToText',
      io: {
        staticInStaticOut: [[[chatMessageUnit], 'string']],
      },
    },
  },
]

const requirements: I.Feature[] = [
  {
    id: 'Spadar CLI chat',
    description:
      'The usage of spadar cli chat will be available if one of the requirements will be satisfied',
    requirements: chatRequirements,
  },
]

export default requirements
