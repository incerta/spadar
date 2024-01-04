import * as clackPrompt from '@clack/prompts'
import * as cliColor from 'kolorist'

import { getUserPrompt } from '../utils/interactive-cli'

import * as I from '../types'

type Message = {
  role: 'system' | 'assistant' | 'user'
  content: string
}

const getPromptFromYou = () => getUserPrompt(`${cliColor.cyan('You:')}`)

export const displayConversationContext = (messages: Message[]) => {
  console.log('\n\nConversation context:')

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

export const runChat = (
  streamMessageRequest: (
    options: Record<string, unknown>,
    unit: Array<{
      unitId: 'chatMessage'
      role: 'system' | 'user' | 'assistant'
      payload: string
    }>
  ) => Promise<unknown>,
  initialMessages: Message[] = []
) => {
  return conversation(
    {
      processAnswerRequest: async (messages) => {
        const mappedMessages = messages.map((message) => ({
          unitId: 'chatMessage' as const,
          role: message.role,
          payload: message.content,
        }))

        const { stream, stop } = await (streamMessageRequest(
          {},
          mappedMessages
        ) as Promise<I.StreamOf<string>>)

        return {
          cancel: stop || (() => undefined),
          requestAnswerStream: (
            onStreamChunkReceived: (messageChunk: string) => void
          ): Promise<string> => {
            return new Promise(async (resolve) => {
              let completeMessage = ''

              for await (const token of stream) {
                completeMessage += token
                onStreamChunkReceived(token)
              }

              resolve(completeMessage)
            })
          },
        }
      },
    },
    initialMessages
  )
}
