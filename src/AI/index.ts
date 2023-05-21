import { Configuration, OpenAIApi } from 'openai'
import config from '../config'
import * as I from '../types'

export const AI = new OpenAIApi(new Configuration(config.openAI))

export async function chat(p: I.AIRequest) {
  const response = await AI.createChatCompletion({
    temperature: p.temperature || 0,
    model: p.model || 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: p.imperative },
      ...p.messages.map((message) => ({ role: 'user' as const, content: message })),
    ],
  })

  return response.data.choices[0].message?.content || ''
}
