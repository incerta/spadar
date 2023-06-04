import { IncomingMessage } from 'http'
import { Configuration, OpenAIApi } from 'openai'
import config from '../config'
import { incomingMessageToIterable } from '../utils/nodejs-stream'
import * as I from '../types'

const openAI = new OpenAIApi(new Configuration(config.openAI))

export async function generateAIResponseStream({ messages, temperature, model }: I.AIRequest) {
  const completion = await openAI.createChatCompletion(
    {
      model: model || 'gpt-3.5-turbo',
      temperature: temperature || 0,
      messages,
      stream: true,
    },
    { responseType: 'stream' }
  )

  const incomingMessage = completion.data as unknown as IncomingMessage

  const streamIterable = incomingMessageToIterable(incomingMessage)
  const makeResponseWriter = readAICompletionStream(streamIterable)

  return { makeResponseWriter }
}

function readAICompletionStream(iterableStream: ReturnType<typeof incomingMessageToIterable>) {
  return (writer: (messageToken: string) => void): Promise<string> =>
    new Promise(async (resolve) => {
      let completeMessage = ''

      for await (const { field, value } of iterableStream) {
        if (field !== 'data') continue

        if (value === '[DONE]') {
          resolve(completeMessage)
          return
        }

        // TODO: since we not interested in anything
        // except actual string message token we could write more efficient parser here
        const parsed = JSON.parse(value)
        const messageToken: unknown = parsed.choices?.[0].delta?.content

        if (typeof messageToken !== 'string') continue

        writer(messageToken)

        completeMessage += messageToken
      }

      resolve(completeMessage)
    })
}
