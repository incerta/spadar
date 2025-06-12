import config from '../config'
import type { Expert } from '../types'

const EXPERTS = config.experts

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
