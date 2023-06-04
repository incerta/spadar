import { IncomingMessage } from 'http'

export type DistinctMessage = {
  field: 'event' | 'data' | 'id' | 'retry'
  value: string
}

/* As per the event stream format detailed here:
 * https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events#event_stream_format,
 * different messages are demarcated by the newline symbol '\n'. However, due to the streaming nature of the
 * 'IncomingMessage', it does not assure the receipt of complete, discrete data units (i.e., a full line ending with '\n')
 * in each data chunk of the stream. To manage this, we use a generator function. This function buffers incoming data chunks
 * until a complete line is formed.
 */
export async function* incomingMessageToIterable(
  stream: IncomingMessage
): AsyncGenerator<DistinctMessage, void, undefined> {
  let head = ''

  for await (const chunk of stream as unknown as Iterable<Promise<unknown>>) {
    const stringifiedChunk = ((): string => {
      if (chunk instanceof Buffer) return chunk.toString()
      if (typeof chunk === 'string') return chunk

      throw Error('Unsupported stream chunk data type')
    })()

    for (let i = 0; i < stringifiedChunk.length; i++) {
      const char = stringifiedChunk[i]
      const isEndOfTheLine = char === '\n'

      if (isEndOfTheLine === false) {
        head += char
        continue
      }

      if (head === '') {
        continue
      }

      const completeLine = head

      if (/^(data|event|id|retry): /.test(completeLine) === false) {
        throw Error('Incorrect line beginning format, expected to pass /^(event|data|id|retry): / regexp test')
      }

      const colonIndex = completeLine.indexOf(':')
      const field = completeLine.slice(0, colonIndex) as DistinctMessage['field']
      const value = completeLine.slice(colonIndex + 2, completeLine.length)

      yield { field, value }

      head = ''
    }
  }
}
