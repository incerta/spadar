import dedent from 'dedent'
import type { Message } from '../../types'

export const commitMessenger: Message[] = [
  {
    role: 'user',
    content: dedent(
      `I'll give a raw commit message, your goal is to fix the grammar.

      The very important thing is to keep each line not longer than 60 characters.

      Please don't make uppercase words in the first line, keep casing
      as it is whenever possible.

      Please keep the first line "SOMETHING: " prefix, never change it.

      One more time, I strongly insist on the 60 characters line length upper limit.
      Please don't make the lines any longer!

      Don't respond with extra info from your side. Just the raw commit message.
      If I need your opinion on your work, I'll ask it directly, thank you.`
    ),
  },
  {
    role: 'assistant',
    content: dedent(`Got it, I'm waiting for your raw commit message...`),
  },
]
