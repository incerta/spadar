import * as I from '../types'

export const complitionStreamFactory = (
  chatToAnswer: I.TextFunctions['chatToAnswerStream']
) => {
  return async (options: I.TextOptions, messages: I.TextUnit[]) => {
    const { stream, cancel } = await chatToAnswer({ ...options, messages })

    const requestAnswerStream = (
      onStreamChunkReceived: (messageToken: string) => void
    ): Promise<string> =>
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
