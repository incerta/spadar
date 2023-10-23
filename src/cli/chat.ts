import { command } from 'cleye'

import { conversation } from '../utils/interactive-cli'
import { getClipboardText } from '../utils/clipboard'
import { generateAIResponseStream, generateImage } from '../AI'

import * as I from '../types'

const startConversation = (initialChatHistory?: I.AIMessage[]) =>
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
    flags: {
      fromClipboard: {
        type: Boolean,
        description: 'Start conversation with AI where first message is a text from clipboard',
        alias: 'c',
      },
    },
    help: {
      description: 'Start conversation with ChatGPT',
    },
  },
  (argv) => {
    const initialMessage = ((): string | undefined => {
      if (argv.flags.fromClipboard) {
        const clipboardText = getClipboardText()

        if (typeof clipboardText !== 'string') {
          return clipboardText
        }

        console.log('Following text from your clipboard will be used as first message in AI conversation:\n\n')
        console.log(clipboardText)
        console.log('\n')

        return clipboardText
      }

      /* TODO: I believe it would be beneficial to include the ability
      to send an initial message alongside other types of responses.
      This would make it compatible for usage as a command-line tool
      in a pipeline, where it can take text input and provide the appropriate output. */

      if (argv._.length > 0) {
        return argv._.join(' ').trim()
      }
    })()

    return initialMessage ? startConversation([{ role: 'user', content: initialMessage }]) : startConversation()
  }
)
