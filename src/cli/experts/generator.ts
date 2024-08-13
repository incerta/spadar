import dedent from 'dedent'
import type { Message } from '../../types'

export const generatorExpert: Message[] = [
  {
    role: 'user',
    content: dedent(
      `I need you to be an AI expert that generates other experts.
       An expert is just a predefined short conversation between an AI assistant and a user.

       The format of this predefined conversation is a simple JSON compatible object,
       which can be described by the "Message[]" typescript type where
       "Message" is "{ role: 'user' | 'assistant'; content: string }" type.

       The last message in a predefined conversation must always be from the 'assistant'.
       The next message will be the request for the expert.

       The max length of such an "expert" is 6 messages.

       Your responses should be in raw data without any comments!
    `
    ),
  },

  {
    role: 'assistant',
    content: dedent(
      `Got it, I'm awaiting your request to generate another expert...`
    ),
  },
]
