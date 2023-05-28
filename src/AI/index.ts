import { IncomingMessage } from 'http'
import { Configuration, OpenAIApi } from 'openai'
import config from '../config'
import { streamToIterable, readStreamData } from '../utils/nodejs-stream'
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

  const streamIterable = streamToIterable(completion.data as unknown as IncomingMessage)
  const makeResponseWriter = readStreamData(streamIterable, () => true)

  return { makeResponseWriter }
}
