import { command } from 'cleye'

import { generateAIResponseStream } from '../AI'
import { conversation } from '../utils/interactive-cli'

import * as I from '../types'

const startConversation = (chatHistory?: I.GPTMessage[]) =>
  conversation((chatHistory) => generateAIResponseStream({ messages: chatHistory }), chatHistory)

export default command(
  {
    name: 'chat',
    help: {
      description: 'Start conversation with ChatGPT',
    },
  },
  (argv) => {
    // IDEA: I guess ability to send initial message should be alongside
    // the other kind of response, it should be compatible for usage
    // as cli tool in the pipe, e.g. takes text input and sends right output
    //
    // For now we consider this API feature as mean for creation
    // imperatively driven chat assistant quickly
    const initialMessage = argv._.length > 0 ? argv._.join(' ').trim() || undefined : undefined

    return initialMessage ? startConversation([{ role: 'user', content: initialMessage }]) : startConversation()
  }
)
