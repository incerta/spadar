import { Configuration, OpenAIApi } from 'openai'
import config from '../config'
import * as I from '../types'

export const AI = new OpenAIApi(new Configuration(config.openAI))

export async function chat({ messages, temperature, model }: I.AIRequest) {
  const response = await AI.createChatCompletion({
    temperature: temperature || 0,
    model: model || 'gpt-3.5-turbo',
    messages,
  })

  return response.data.choices[0].message?.content || ''
}
