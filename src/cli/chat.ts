import fs from 'fs/promises'
import clipboardy from 'clipboardy'

import config from '../config'
import * as clackPrompt from '@clack/prompts'
import * as cliColor from 'kolorist'

import { EXPERTS_LIST, EXPERTS_BY_COMMAND } from './experts'

import { getUserPrompt } from '../utils/interactive-cli'

import type * as I from '../types'

const SIGNATURE = {
  title: '( .) _ ( .)',
  loading: '...',
  you: cliColor.cyan('→'),
  ai: `${cliColor.green('←')}`,
}

type AI = {
  // TODO: rename to `runComplition`
  processAnswerRequest: (chatHistory: I.Message[]) => Promise<{
    // TODO: rename to `stream`
    requestAnswerStream: (
      onStreamChunkReceived: (data: string) => void
    ) => Promise<string>

    cancel: () => void
  }>

  // TODO: unused API, revise after CHAT-PLUGIN discussion ends
  processImageRequest?: (req: unknown) => Promise<string>
}

const getPromptFromYou = () => getUserPrompt(SIGNATURE.you)

export const displayConversationContext = (messages: I.Message[]) => {
  console.log('\n\nConversation context:')

  messages.forEach(({ role, content }) => {
    console.log(`\n  role: ${role}:\n\n${content}`)
  })

  console.log('\n')
}

const clear = () => process.stdout.write('\x1Bc')

const conversation = async (
  ai: AI,
  chatHistory: I.Message[] = [],
  title?: string,
  skipClear?: boolean
): Promise<void> => {
  if (
    chatHistory.length === 0 ||
    chatHistory[chatHistory.length - 1].role === 'assistant'
  ) {
    await new Promise((resolve) => {
      setTimeout(() => {
        if (skipClear !== true) {
          clear()
        }

        resolve(undefined)
      }, 0)
    })

    let conversationTitle = SIGNATURE.title

    if (chatHistory.length) {
      conversationTitle = 'Continue conversation'
    }

    if (title) {
      conversationTitle = title
    }

    console.log('')
    clackPrompt.intro(conversationTitle)

    const initialPrompt = await getPromptFromYou()

    const interceptor = await interceptors(ai, initialPrompt, chatHistory)

    if (interceptor !== null) {
      interceptor()
      return
    }

    chatHistory.push({ role: 'user', content: initialPrompt })
  }

  const spin = clackPrompt.spinner()

  spin.start(SIGNATURE.loading)

  const { requestAnswerStream } = await ai.processAnswerRequest(chatHistory)

  spin.stop(SIGNATURE.ai)

  console.log('')

  // writing stream to STDOUT
  const responseMessage = await requestAnswerStream(
    process.stdout.write.bind(process.stdout)
  )

  console.log('\n')

  chatHistory.push({ role: 'assistant', content: responseMessage })

  // starting new cycle
  //

  const cleanInterceptor = async (prompt: string): Promise<string> => {
    //  for operation on the last message
    //

    if (prompt === 'copy' || prompt === 'cp' || prompt === 'c') {
      clipboardy.writeSync(responseMessage)
      return getPromptFromYou().then(cleanInterceptor)
    }

    if (prompt === 'save') {
      const timestamp = Date.now()
      const fileName = `${timestamp}.json`
      const dir = config.resources.chatsDir

      await fs.mkdir(dir, { recursive: true })

      const file = dir + '/' + fileName
      const data = JSON.stringify(chatHistory, null, 2)

      await fs.writeFile(file, data)

      console.log(`\nsaved to (path copied to clipboard):\n${file}\n`)
      clipboardy.writeSync(file)

      return getPromptFromYou().then(cleanInterceptor)
    }

    // TODO: summarize and save

    return prompt
  }

  const userPrompt = await getPromptFromYou().then(cleanInterceptor)

  const interceptor = await interceptors(ai, userPrompt, chatHistory)

  if (interceptor !== null) {
    interceptor()
    return
  }

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
  initialMessages: I.Message[] = []
) => {
  // too fat
  //

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

/**
 * Intercept normal flow of the conversation
 *
 * TODO: implement "help" command which will display
 *       currently available chat commands
 **/
export async function interceptors(
  ai: AI,
  userPrompt: string,
  chatHistory: I.Message[]
): Promise<null | (() => unknown)> {
  if (userPrompt === 'start over' || userPrompt === 'clear') {
    return () => conversation(ai, [])
  }

  if (userPrompt === 'load' || userPrompt === 'p') {
    const content = await clipboardy.read()

    if (typeof content === 'string' && content.trim() !== '') {
      return () => {
        conversation(ai, [...chatHistory, { role: 'user', content }])
      }
    }
  }

  if (/^load conversation: /.test(userPrompt)) {
    const filePath = userPrompt.split('load conversation: ')[1]
    const raw = await fs.readFile(filePath, 'utf8')
    const data = JSON.parse(raw)

    return () => displayConversationContext(data)
  }

  if (userPrompt === 'experts' || userPrompt === 'le') {
    console.log(EXPERTS_LIST)
    chatHistory.pop()

    return () => {
      conversation(ai, chatHistory, undefined, true)
    }
  }

  // TODO: expert command might have a collision with the built-in commands
  //       we need to figure out the way hot to resolve this
  //
  const experts = EXPERTS_BY_COMMAND[userPrompt]

  if (experts) {
    if (experts.length > 1) {
      // TODO: implement clack select prompt by the matched expert name
      //
    }

    const [expert] = experts

    return () => conversation(ai, expert.prompt, expert.name)
  }

  return null
}
