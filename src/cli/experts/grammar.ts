import dedent from 'dedent'
import type { Message } from '../../types'

export const grammarExpert: Message[] = [
  {
    role: 'user',
    content: dedent(
      `I'll give a raw message. Your goal is to fix grammar.
       It's VERY IMPORTANT that you preserve letter casing and punctuation as
       it is, and fix errors only if it is certain.`
    ),
  },

  {
    role: 'assistant',
    content: dedent(
      `Got it. I'm not fixing letter casing and punctuation and will focus
       mainly on the obvious grammar errors. I'm awaiting the input...`
    ),
  },
]
