import { requirementsExpert } from './requirements'
import { generatorExpert } from './generator'
import { jsCommentator } from './js-comentator'
import { commitMessenger } from './commit-messenger'
import { grammarExpert } from './grammar'

import type { Expert } from '../../types'

// TODO: load experts from $SPADAR_RESOURCE_DIR/experts/*.json
//       instead of using a hardcoded versions
const EXPERTS: Expert[] = [
  {
    name: 'Ludwig von Mises',
    commands: ['mises'],
    prompt: [
      {
        role: 'user',
        content:
          "Imagine that you are the economist Ludwig Von Mises. Imagine that you my old friend. I'm going to ask you a question about your work and you will answers must be short and precise. I'll clarify something if I need",
      },
      {
        role: 'assistant',
        content: 'ok',
      },
    ],
  },
  {
    name: 'Requirements expert',
    commands: ['req'],
    prompt: requirementsExpert,
  },
  {
    name: 'Generator expert',
    commands: ['gen'],
    prompt: generatorExpert,
  },
  {
    name: 'Js-commentor expert',
    commands: ['jsc'],
    prompt: jsCommentator,
  },
  {
    name: 'Commit-messenger expert',
    commands: ['commit'],
    prompt: commitMessenger,
  },
  {
    name: 'Grammar expert',
    commands: ['ge'],
    prompt: grammarExpert,
  },
  {
    name: 'Laconic',
    commands: ['lac'],
    prompt: [
      {
        role: 'user',
        content: `
          Image that you my close friend.
          Your main character trait is that you are laconic,
          You don't spend any word for sake.
          Your answer is short and precise.
          You are not trying to impress me by your knowledge.
          You know if I need clarification, I'll ask you clarifying questions.
          You are not afraid to make me upset. You know I value the truth not politness.
        `,
      },
      {
        role: 'assistant',
        content: `ok`,
      },
    ],
  },
  {
    name: 'Polish',
    commands: ['polish', 'pl', 'pol'],
    prompt: [
      {
        role: 'user',
        content: `You are is polish translator. I'll give you a message in english/russian/belarussian/polish mix of them. You respond with polish translation`,
      },
      {
        role: 'assistant',
        content: `ok`,
      },
    ],
  },
]

export const EXPERTS_LIST = EXPERTS.reduce((acc, { name, commands }) => {
  return `${acc}\n\n- ${commands.join(', ')} - - - ${name}`
}, '')

export const EXPERTS_BY_COMMAND = EXPERTS.reduce<
  Record<string /* command */, Expert[] | undefined>
>((acc, expert) => {
  for (const command of expert.commands) {
    acc[command] = [expert, ...(acc[command] || [])]
  }

  return acc
}, {})
