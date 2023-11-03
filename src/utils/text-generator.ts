import * as I from '../types'

export const complitionStreamFactory = (chatToAnswer: I.LLMFunctions['chatToAnswerStream']) => {
  return async (options: I.LLMOptions, messages: I.ChatMessage[]) => {
    const { stream, cancel } = await chatToAnswer({ ...options, messages })

    const requestAnswerStream = (onStreamChunkReceived: (messageToken: string) => void): Promise<string> =>
      new Promise(async (resolve) => {
        let completeMessage = ''

        for await (const token of stream) {
          completeMessage += token
          onStreamChunkReceived(token)
        }

        resolve(completeMessage)
      })

    return { requestAnswerStream, cancel }
  }
}
