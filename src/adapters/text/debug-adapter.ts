import { PassThrough } from 'stream'
import { DEFAULT_LLM } from '../../constants'

import * as I from '../../types'

const ADAPTER_ID = 'Debug-adapter' as I.TextAdapterId
const SUPPORTED_MODELS = new Set([DEFAULT_LLM]) as Set<I.TextModelId>

const requestAnswer = async (options: I.TextOptions, messages: I.TextUnit[]) => {
  console.log('Answer requested:\n', JSON.stringify({ options, messages }))
  return 'DEBUG_MOCKED_MESSAGE'
}

const requestAnswerStream = async (options: I.TextOptions, messages: I.TextUnit[]) => {
  console.log('Answer stream requested:\n', JSON.stringify({ options, messages }))

  const modifiedStream = new PassThrough()

  const startStreamTimestamp = Date.now()

  setInterval(() => {
    const currentTimestamp = Date.now()

    if (currentTimestamp - startStreamTimestamp > 5000) {
      /* stop stream */
      modifiedStream.push(null)
      return
    }

    const mockDataChunk = `${currentTimestamp}`

    modifiedStream.push(mockDataChunk)
  }, 300)

  return {
    cancel: () => {
      console.log('STREAM CANCELED')
      modifiedStream.push(null)
    },
    stream: modifiedStream,
  }
}

const adapter: I.TextAdapter = {
  id: ADAPTER_ID,
  type: 'LLM',
  description: 'Adapter that not doing any network requests but mocks the behaviour',
  for: SUPPORTED_MODELS,

  chatToChat: async (chat) => {
    const answer = await requestAnswer(chat, chat.messages)
    const message: I.TextUnit = { role: 'assistant', content: answer }
    return { ...chat, messages: [...chat.messages, message] }
  },

  chatToAnswer: (chat) => requestAnswer(chat, chat.messages),
  chatToAnswerStream: (chat) => requestAnswerStream(chat, chat.messages),
}

export default adapter
