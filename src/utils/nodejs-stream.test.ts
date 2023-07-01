import { Socket } from 'net'
import { IncomingMessage } from 'http'

import { incomingMessageToIterable } from './nodejs-stream'

describe('Check nodejs stream utility functions', () => {
  describe('incomingMessageToIterable', () => {
    it('should parse chunks of data correctly when line split across chunks', async () => {
      const socket = new Socket()
      const mockIncomingMessage = new IncomingMessage(socket)
      const iterableStream = incomingMessageToIterable(mockIncomingMessage)

      const expectedData = { x: 'sample\n', y: 'second\n_sample' }
      const stringifiedData = JSON.stringify(expectedData)

      const splitIndex = Math.round(stringifiedData.length / 2)
      const dataHead = 'data: ' + stringifiedData.slice(0, splitIndex)
      const dataTail = stringifiedData.slice(splitIndex, stringifiedData.length) + '\n'

      setTimeout(() => {
        mockIncomingMessage.push(dataHead)

        setTimeout(() => {
          mockIncomingMessage.push(dataTail)
        }, 0)
      }, 0)

      const yielded = await iterableStream.next()

      if (!yielded.value) throw Error('Unexpected generator fn return')

      const result = yielded.value

      expect(result.field).toBe('data')

      const serializedResult = JSON.parse(result.value) as typeof expectedData

      expect(serializedResult.x).toBe(expectedData.x)
      expect(serializedResult.y).toBe(expectedData.y)
    })

    it('should skip empty lines', async () => {
      const socket = new Socket()
      const mockIncomingMessage = new IncomingMessage(socket)
      const iterableStream = incomingMessageToIterable(mockIncomingMessage)

      const expectedField1 = 'data'
      const expectedValue1 = 'check expected value'

      const expectedField2 = 'id'
      const expectedValue2 = '228'

      setTimeout(() => {
        mockIncomingMessage.push(`\n\n\n${expectedField1}: ${expectedValue1}\n\n\n`)
        setTimeout(() => {
          mockIncomingMessage.push(`\n\n\n${expectedField2}: ${expectedValue2}\n\n\n`)
        }, 0)
      }, 0)

      const { value: result1 } = await iterableStream.next()
      const { value: result2 } = await iterableStream.next()

      if (!result1 || !result2) throw Error('Unexpected generator fn return')

      expect(result1.field).toBe(expectedField1)
      expect(result1.value).toBe(expectedValue1)
      expect(result2.field).toBe(expectedField2)
      expect(result2.value).toBe(expectedValue2)
    })
  })
})
