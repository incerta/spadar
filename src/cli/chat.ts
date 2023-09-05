import { command } from 'cleye'

import { generateAIResponseStream, generateImage } from '../AI'
import { conversation } from '../utils/interactive-cli'

import * as I from '../types'

const startConversation = (initialChatHistory?: I.GPTMessage[]) =>
  conversation(
    {
      processChatRequest: (chatHistory) => generateAIResponseStream({ messages: chatHistory }),
      processImageRequest: (req: I.ImageGenerationRequest) => generateImage(req),
    },
    initialChatHistory
  )

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
