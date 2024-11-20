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
