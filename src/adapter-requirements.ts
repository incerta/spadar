import dedent from 'dedent'
import * as I from './types'

/**
 * TODO: Specifications for external usage are not yet ready.
 *
 * Each requirement should handle a specific feature of
 * the adapter consumer module and therefore, must be
 * described.
 *
 * The adapter connector schema must support everything
 * that is specified in the requirement schema in order to be
 * considered compatible.
 **/
type Requirement = {
  id: string
  description: string
  schema: I.TransformationIOSchema
  required?: boolean
}

/**
 * TODO: Specification for external usage is not yet ready.
 *
 * A feature is something that should work if one or many
 * adapters satisfy one or more requirement schemas.
 **/
type Feature = {
  id: string
  description: string
  requirements: Requirement[]
}

export const chatMessageUnit: I.UnitSchema = {
  unitId: { type: 'stringUnion', of: ['chatMessage'], required: true },
  role: {
    type: 'stringUnion',
    of: ['system', 'assistant', 'user'],
    required: true,
  },
  payload: 'string',
}

const chatRequirements: Requirement[] = [
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

const requirements: Feature[] = [
  {
    id: 'Spadar CLI chat',
    description:
      'The usage of spadar cli chat will be available if one of the requirements will be satisfied',
    requirements: chatRequirements,
  },
]

export default requirements
