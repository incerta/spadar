import { command } from 'cleye'
import * as clackPrompt from '@clack/prompts'
import * as cliColor from 'kolorist'

import { getUserPrompt } from '../utils/interactive-cli'
import { complitionStreamFactory } from '../utils/text-generator'
import {
  getIsRunningInPipe,
  getCLIPipeMessege,
  getClipboardText,
} from '../utils/command-line'
import { getTextAdapter } from '../utils/adapter'

type Message = {
  role: 'system' | 'assistant' | 'user'
  content: string
}

const DEFAULT_TEXT_MODEL = 'gpt-4'

const getPromptFromYou = () => getUserPrompt(`${cliColor.cyan('You:')}`)

export const displayConverstaionContext = (messages: Message[]) => {
  console.log('\n\nConverstaion context:')

  messages.forEach(({ role, content }) => {
    console.log(`\n  role: ${role}:\n\n${content}`)
  })

  console.log('\n')
}

const conversation = async (
  ai: {
    processAnswerRequest: (chatHistory: Message[]) => Promise<{
      requestAnswerStream: (
        onStreamChunkReceived: (data: string) => void
      ) => Promise<string>
      cancel: () => void
    }>
    // TODO: unused API, revise after CHAT-PLUGIN discussion ends
    processImageRequest?: (req: unknown) => Promise<string>
  },
  chatHistory: Message[] = [],
  isRecursiveCall = false
): Promise<void> => {
  if (chatHistory.length === 0 || isRecursiveCall) {
    const conversationTitle = isRecursiveCall
      ? 'Conversation continued'
      : 'Starting new conversation'

    console.log('')
    clackPrompt.intro(conversationTitle)
    chatHistory.push({ role: 'user', content: await getPromptFromYou() })
  }

  const spin = clackPrompt.spinner()

  spin.start('THINKING...')

  const { requestAnswerStream } = await ai.processAnswerRequest(chatHistory)

  spin.stop(`${cliColor.green('AI:')}`)

  /* TODO: unfortunately method below is not working in the current context
   we want to `cancel` the stream on "s" key press, the `cancel` method
   can be destructured from `await ai.processAnswerRequest(chatHistory)` statement
   
  ```
    readline.emitKeypressEvents(process.stdin)
    process.stdin.setRawMode(true)
    process.stdin.on('keypress', (_, key) => {
      if (key.sequence === 's') {
        cancel()
      }
    })
  ```
  */

  console.log('')
  const responseMessage = await requestAnswerStream(
    process.stdout.write.bind(process.stdout)
  )
  console.log('\n')

  chatHistory.push({ role: 'assistant', content: responseMessage })

  const userPrompt = await getPromptFromYou()

  chatHistory.push({ role: 'user', content: userPrompt })

  return conversation(ai, chatHistory)
}

const runCLIChat = (options: unknown, initialMessages?: Message[]) => {
  const adapter = getTextAdapter(options.model, options.connectorId)
  const runComplitionStream = complitionStreamFactory(
    adapter.chatToAnswerStream
  )

  return conversation(
    {
      processAnswerRequest: (messages) =>
        runComplitionStream(options, messages),
    },
    initialMessages
  )
}

export default command(
  {
    name: 'chat',
    flags: {
      fromClipboard: {
        type: Boolean,
        description:
          'Start conversation with AI where first message is a text from clipboard',
        alias: 'c',
      },

      model: {
        type: String,
        description:
          'Choose the Large Language Model like: "gpt-3.5-turbo", "gpt-4"',
        alias: 'm',
      },

      adapter: {
        type: String,
        description:
          'Choose specific built-in or external adapter for LLM complition processing',
        alias: 'a',
      },

      temperature: {
        type: Number,
        description:
          "OpenAI's API adjusts output diversity, with a value range from 0.0 (more deterministic) to 1.0 (more random).",
        alias: 't',
      },

      maxTokens: {
        type: Number,
        description:
          'Sets the maximum number of tokens allowed in both input and output text',
      },

      topP: {
        type: Number,
        description:
          "OpenAI's API adjusts output diversity, with a value range from 0.0 (more deterministic) to 1.0 (more random).",
      },

      disableContextDisplay: {
        type: Boolean,
        description:
          'Disabled dispaying conversation context from clipboard or pipe',
        alias: 'd',
      },
    },
    help: {
      description: 'Start conversation with ChatGPT',
    },
  },
  async (argv) => {
    const {
      adapter,
      model,
      maxTokens,
      temperature,
      topP,
      disableContextDisplay,
    } = argv.flags

    if (temperature && (temperature < 0 || temperature > 1)) {
      throw Error(
        `Allowed --temperature paramter value range is between 0.0 and 1.0 but given: ${temperature}`
      )
    }

    if (topP && (topP < 0 || topP > 1)) {
      throw Error(
        `Allowed --topP paramter value range is between 0.0 and 1.0 but given: ${topP}`
      )
    }

    const options: unknown = {
      model: model || DEFAULT_TEXT_MODEL,
      connectorId: adapter,
      maxTokens: maxTokens,
      temperature: temperature,
      topP: topP,
    }

    if (argv.flags.fromClipboard) {
      const clipboardText = getClipboardText()

      if (clipboardText) {
        const messages: Message[] = [{ role: 'user', content: clipboardText }]

        if (!disableContextDisplay) displayConverstaionContext(messages)
        runCLIChat(options, messages)
        return
      }
    }

    if (getIsRunningInPipe()) {
      const messageFromPipe = await getCLIPipeMessege()
      const messages: Message[] = [{ role: 'user', content: messageFromPipe }]

      if (!disableContextDisplay) displayConverstaionContext(messages)
      runCLIChat(options, messages)
      return
    }

    runCLIChat(options)
  }
)
