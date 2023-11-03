import { PassThrough } from 'stream'
import OpenAI from 'openai'
import config from '../../config'

import * as I from '../../types'

type VendorCompletionOptions = OpenAI.Chat.Completions.ChatCompletionCreateParams
type CompatibleCompletionOptions = Pick<VendorCompletionOptions, 'model' | 'temperature' | 'top_p' | 'max_tokens'>

const ADAPTER_ID = 'OpenAI-LLM-spadar-built-in' as I.LLMAdapterId
const SUPPORTED_MODELS = new Set([
  'gpt-4',
  'gpt-4-0314',
  'gpt-4-0613',
  'gpt-4-32k',
  'gpt-4-32k-0314',
  'gpt-4-32k-0613',
  'gpt-3.5-turbo',
  'gpt-3.5-turbo-16k',
  'gpt-3.5-turbo-0301',
  'gpt-3.5-turbo-0613',
  'gpt-3.5-turbo-16k-0613',
]) as Set<I.LLMId>

const optionsMapper = (p: I.LLMOptions): CompatibleCompletionOptions => {
  if (SUPPORTED_MODELS.has(p.model) === false) {
    throw Error(`Adapter "${ADAPTER_ID}" is not supporting the model: "${p.model}"`)
  }

  return {
    model: p.model,
    temperature: p.temperature,
    max_tokens: p.maxTokens,
    top_p: p.topP,
  }
}

const openAI = new OpenAI({ apiKey: config.openAI.apiKey })

const requestAnswer = async (options: I.LLMOptions, messages: I.ChatMessage[]) => {
  const completion = await openAI.chat.completions.create({
    ...optionsMapper(options),
    messages: messages,
  })

  const message = completion['choices'][0]['message']['content']

  if (typeof message !== 'string') throw Error('The OpenAI is reponsed with "null"')

  return message
}

const requestAnswerStream = async (options: I.LLMOptions, messages: I.ChatMessage[]) => {
  const originalStream = await openAI.chat.completions.create({
    ...optionsMapper(options),
    messages: messages,
    stream: true,
  })

  const modifiedStream = new PassThrough()

  ;(async () => {
    for await (const chunk of originalStream) {
      const token = chunk.choices[0]?.delta?.content || ''
      modifiedStream.push(token)
    }
    modifiedStream.push(null)
  })()

  return {
    cancel: () => {
      // TODO: find a way how to cancel `originalStream`
      modifiedStream.push(null)
    },
    stream: modifiedStream,
  }
}

const adapter: I.LLMAdapter = {
  id: ADAPTER_ID,
  type: 'LLM',
  description: 'Built in OpenAI models adapter',
  for: SUPPORTED_MODELS,

  chatToChat: async (chat) => {
    const answer = await requestAnswer(chat, chat.messages)
    const message: I.ChatMessage = { role: 'assistant', content: answer }
    return { ...chat, messages: [...chat.messages, message] }
  },

  chatToAnswer: (chat) => requestAnswer(chat, chat.messages),
  chatToAnswerStream: (chat) => requestAnswerStream(chat, chat.messages),

  questionToChat: () => {
    throw Error('This API is under construction')
  },
  questionToAnswer: () => {
    throw Error('This API is under construction')
  },
  questionToAnswerStream: () => {
    throw Error('This API is under construction')
  },
}

export default adapter
