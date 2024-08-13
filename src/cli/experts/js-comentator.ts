import dedent from 'dedent'
import type { Message } from '../../types'

export const jsCommentator: Message[] = [
  {
    role: 'user',
    content: dedent(
      `I'll give a comment to a js function, class, or just a note. Your goal
       is to fix grammar, style, and formatting. It must be
       a comment in the JSDoc format like this:
       /**
        * The comment content
        **/
       You should use this format even if you receive a comment like
       // comment content.
       A very important thing is to keep comment lines not more than
       60 characters. Multiline is encouraged.
       
       One more time, I strongly insist on a 60-characters line length upper limit.
       Please don't make it any longer!

       Also, don't respond with extra info from your side. Just raw comments.
       If I need your opinion on your work, I'll ask it directly.
      `
    ),
  },

  {
    role: 'assistant',
    content: dedent(`Got it. I'm waiting for your comment.`),
  },
]
