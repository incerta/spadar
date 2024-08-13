import fs from 'fs/promises'
import clipboardy from 'clipboardy'

import config from '../config'
import * as clackPrompt from '@clack/prompts'
import * as cliColor from 'kolorist'

import { requirementsExpert } from './experts/requirements'
import { generatorExpert } from './experts/generator'
import { jsCommentator } from './experts/js-comentator'
import { commitMessenger } from './experts/commit-messenger'
import { grammarExpert } from './experts/grammar'

import { getUserPrompt } from '../utils/interactive-cli'

import type * as I from '../types'

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

const getPromptFromYou = () => getUserPrompt(`${cliColor.cyan('You:')}`)

export const displayConversationContext = (messages: I.Message[]) => {
  console.log('\n\nConversation context:')

  messages.forEach(({ role, content }) => {
    console.log(`\n  role: ${role}:\n\n${content}`)
  })

  console.log('\n')
}

const conversation = async (
  ai: AI,
  chatHistory: I.Message[] = [],
  expert?: string
): Promise<void> => {
  if (
    chatHistory.length === 0 ||
    chatHistory[chatHistory.length - 1].role === 'assistant'
  ) {
    await new Promise((resolve) => {
      setTimeout(() => {
        process.stdout.write('\x1Bc')
        resolve(undefined)
      }, 0)
    })

    let conversationTitle = 'Starting new conversation'

    if (chatHistory.length) {
      conversationTitle = 'Continue conversation'
    }

    if (expert) {
      conversationTitle = expert
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

  spin.start('THINKING...')

  const { requestAnswerStream } = await ai.processAnswerRequest(chatHistory)

  spin.stop(`${cliColor.green('AI:')}`)

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

  // TODO: experts generation and usage must not be hardcoded eventually

  if (userPrompt === 'requirements expert') {
    const expert = 'Requirements expert'

    return () => conversation(ai, requirementsExpert, expert)
  }

  if (userPrompt === 'generator expert') {
    const expert = 'Generator expert'

    return () => conversation(ai, generatorExpert, expert)
  }

  if (userPrompt === 'js-commentator expert' || userPrompt === 'jsc') {
    const expert = 'Js-commentor expert'

    return () => conversation(ai, jsCommentator, expert)
  }

  if (userPrompt === 'commit') {
    const expert = 'Commit-messenger expert'

    return () => conversation(ai, commitMessenger, expert)
  }

  if (userPrompt === 'grammar expert' || userPrompt === 'ge') {
    const expert = 'Grammar expert'

    return () => conversation(ai, grammarExpert, expert)
  }

  return null
}
