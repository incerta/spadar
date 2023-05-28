import { command } from 'cleye'

import { chat } from '../AI'
import { conversation } from '../utils/interactive-cli'

import * as I from '../types'

const startConversation = (chatHistory?: I.GPTMessage[]) =>
  conversation((chatHistory) => chat({ messages: chatHistory }), chatHistory)

export default command(
  {
    name: 'chat',
    help: {
      description: 'Start conversation with ChatGPT',
    },
  },
  (argv) => {
    const initialMessage = argv._.length > 0 ? argv._.join(' ').trim() || undefined : undefined

    return initialMessage ? startConversation([{ role: 'user', content: initialMessage }]) : startConversation()
  }
)
